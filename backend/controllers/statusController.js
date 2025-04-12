const pool = require("../db"); 

async function status(req, res) {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayStartISO = todayStart.toISOString().slice(0, 19).replace("T", " ");

    const sqlTopOrigins = `
      SELECT p.address_from AS name, COUNT(*) AS count
      FROM packages p
      WHERE p.status != 'Pending'
      GROUP BY p.address_from
      ORDER BY count DESC
      LIMIT 5
    `;
    const sqlTopDestinations = `
      SELECT p.address_to AS name, COUNT(*) AS count
      FROM packages p
      WHERE p.status != 'Pending'
      GROUP BY p.address_to
      ORDER BY count DESC
      LIMIT 5
    `;
    const sqlShippedToday = `
      SELECT COUNT(*) AS shippedToday
      FROM trackinghistory
      WHERE status = 'Scheduled'
        AND updated_at >= ?
    `;
    const sqlDeliveredToday = `
      SELECT COUNT(*) AS deliveredToday
      FROM trackinghistory
      WHERE status = 'Completed'
        AND updated_at >= ?
    `;
    const sqlActive = `
      SELECT COUNT(*) AS activeCount
      FROM packages
      WHERE status = 'In Transit'
    `;
    const sqlDelayed = `
      SELECT COUNT(*) AS delayedCount
      FROM packages
      WHERE status = 'Delayed / Delivery Attempted'
    `;

    const [
      [topOriginsRows],
      [topDestRows],
      [shippedRows],
      [deliveredRows],
      [activeRows],
      [delayedRows],
    ] = await Promise.all([
      pool.query(sqlTopOrigins),
      pool.query(sqlTopDestinations),
      pool.query(sqlShippedToday, [todayStartISO]),
      pool.query(sqlDeliveredToday, [todayStartISO]),
      pool.query(sqlActive),
      pool.query(sqlDelayed),
    ]);

    const reportData = {
      topOrigins: topOriginsRows,
      topDestinations: topDestRows,
      shippedToday: shippedRows[0]?.shippedToday || 0,
      deliveredToday: deliveredRows[0]?.deliveredToday || 0,
      activeCount: activeRows[0]?.activeCount || 0,
      delayedCount: delayedRows[0]?.delayedCount || 0,
    };

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, data: reportData }));
  } catch (error) {
    console.error("Error in status controller:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: false, message: error.message }));
  }
}

module.exports = { status };
