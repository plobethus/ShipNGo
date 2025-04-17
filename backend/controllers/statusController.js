// ShipNGo/backend/controllers/statusController.js

const db         = require("../db");
const { sendJson } = require("../helpers");

async function status(req, res, query) {
  try {
    let { dateFrom, dateTo } = query;
    let locationIds = query.locationIds;

    if (!locationIds && query.locationId) {
      locationIds = Array.isArray(query.locationId)
        ? query.locationId.join(',')
        : query.locationId;
    }

    if (!dateFrom) dateFrom = "1970-01-01";
    if (!dateTo)   dateTo   = new Date().toISOString().slice(0,10);

    const startDT = `${dateFrom} 00:00:00`;
    const endDT   = `${dateTo} 23:59:59`;

    let plFilter      = "";  
    let noAliasFilter = "";  
    const locParams   = [];

    if (locationIds) {
      const ids = locationIds.split(',').map(x=>Number(x)).filter(Boolean);
      if (ids.length) {
        const ph = ids.map(_=>'?').join(',');
        plFilter      = `AND pl.location    IN (${ph})`;
        noAliasFilter = `AND location       IN (${ph})`;
        locParams.push(...ids);
      }
    }

    const [[{ shippedCount }]] = await db.execute(
      `SELECT COUNT(*) AS shippedCount
         FROM package_tracking_log pl
        WHERE pl.status = 'Scheduled'
          AND pl.changed_at BETWEEN ? AND ?
          ${plFilter}`,
      [ startDT, endDT, ...locParams ]
    );
    const [[{ deliveredCount }]] = await db.execute(
      `SELECT COUNT(*) AS deliveredCount
         FROM package_tracking_log pl
        WHERE pl.status = 'Delivered'
          AND pl.changed_at BETWEEN ? AND ?
          ${plFilter}`,
      [ startDT, endDT, ...locParams ]
    );

    const [ topOrigins ] = await db.execute(
      `SELECT p.address_from AS name, COUNT(*) AS count
         FROM packages p
        WHERE p.created_at BETWEEN ? AND ?
        GROUP BY p.address_from
        ORDER BY count DESC
        LIMIT 5`,
      [ startDT, endDT ]
    );
    const [ topDestinations ] = await db.execute(
      `SELECT p.address_to AS name, COUNT(*) AS count
         FROM packages p
        WHERE p.created_at BETWEEN ? AND ?
        GROUP BY p.address_to
        ORDER BY count DESC
        LIMIT 5`,
      [ startDT, endDT ]
    );

    const [ locations ] = await db.execute(
      `SELECT l.location_id, l.location_name, l.location_type,
              l.opening_time, l.closing_time, l.num_employees,
              e.name AS manager_name
         FROM locations l
         LEFT JOIN employees e
           ON l.manager_id = e.employee_id
        WHERE l.location_name <> 'Awaiting Drop Off'`
    );

    const currSQL = `
      SELECT pl.package_id,
             pl.status       AS current_status,
             l.location_name AS current_location
        FROM package_tracking_log pl
        JOIN (
          SELECT package_id, MAX(changed_at) AS mx
            FROM package_tracking_log
           WHERE changed_at BETWEEN ? AND ?
             ${noAliasFilter}
           GROUP BY package_id
        ) sub
          ON pl.package_id = sub.package_id
         AND pl.changed_at = sub.mx
        LEFT JOIN locations l
          ON pl.location = l.location_id
    `;
    const [ currentStatus ] = await db.execute(
      currSQL,
      [ startDT, endDT, ...locParams ]
    );

    let supplies = [];
    if (locationIds) {
      const ids = locationIds.split(',').map(x=>Number(x)).filter(Boolean);
      if (ids.length) {
        const ph = ids.map(_=>'?').join(',');
        const [ rawSupplies ] = await db.execute(
          `SELECT s.category,
                  s.price,
                  SUM(s.stock_quantity) AS stock_quantity,
                  COALESCE(SUM(st.quantity),0) AS total_sold
             FROM supplies s
             JOIN locations l
               ON s.location_id = l.location_id
             LEFT JOIN supplytransactions st
               ON s.supply_id = st.supply_id
              AND st.purchase_date BETWEEN ? AND ?
            WHERE l.location_type = 'POST_OFFICE'
              AND s.location_id IN (${ph})
            GROUP BY s.category, s.price`,
          [ startDT, endDT, ...ids ]
        );
        supplies = rawSupplies;
      }
    }

    const [ packagesRaw ] = await db.execute(
      `SELECT DISTINCT p.*
         FROM packages p
         JOIN package_tracking_log pl
           ON p.package_id = pl.package_id
        WHERE pl.changed_at BETWEEN ? AND ?
          ${plFilter}`,
      [ startDT, endDT, ...locParams ]
    );

    const [ trackingRaw ] = await db.execute(
      `SELECT *
         FROM package_tracking_log
        WHERE changed_at BETWEEN ? AND ?
          ${noAliasFilter}`,
      [ startDT, endDT, ...locParams ]
    );

    const [ locationsRaw ] = await db.execute(
      `SELECT l.location_id, l.location_name, l.location_type,
              l.opening_time, l.closing_time, l.num_employees,
              e.name AS manager_name
         FROM locations l
         LEFT JOIN employees e ON l.manager_id = e.employee_id
        ${locationIds
          ? `WHERE l.location_id IN (${locationIds.split(',').map(_=>'?').join(',')})`
          : ''}`,
      locationIds
        ? locationIds.split(',').map(x=>Number(x)).filter(Boolean)
        : []
    );

    const [ suppliesRaw ] = await db.execute(
      `SELECT s.*
         FROM supplies s
         JOIN locations l ON s.location_id = l.location_id
        WHERE l.location_type = 'POST_OFFICE'
          ${locationIds
            ? `AND s.location_id IN (${locationIds.split(',').map(_=>'?').join(',')})`
            : ''}`,
      locationIds
        ? locationIds.split(',').map(x=>Number(x)).filter(Boolean)
        : []
    );

    const [ supplyTransactionsRaw ] = await db.execute(
      `SELECT st.*
         FROM supplytransactions st
         JOIN supplies s ON st.supply_id = s.supply_id
         JOIN locations l ON s.location_id = l.location_id
        WHERE st.purchase_date BETWEEN ? AND ?
          AND l.location_type = 'POST_OFFICE'
          ${locationIds
            ? `AND s.location_id IN (${locationIds.split(',').map(_=>'?').join(',')})`
            : ''}`,
      [ startDT, endDT ].concat(
        locationIds
          ? locationIds.split(',').map(x=>Number(x)).filter(Boolean)
          : []
      )
    );

    return sendJson(res, 200, {
      success: true,
      data: {
        shippedCount,
        deliveredCount,
        topOrigins,
        topDestinations,
        locations,
        currentStatus,
        activeCount:  currentStatus.filter(r=>r.current_status==='In Transit').length,
        delayedCount: currentStatus.filter(r=>r.current_status==='Delayed').length,
        supplies,
        packagesRaw,
        trackingRaw,
        locationsRaw,
        suppliesRaw,
        supplyTransactionsRaw
      }
    });
  }
  catch (err) {
    console.error("StatusController error:", err);
    return sendJson(res, 500, { success: false, message: err.message });
  }
}

module.exports = { status };
