//ShipNGo/backend/controllers/trackingController.js

const db = require("../db");

async function getTrackingInfo(package_id) {
  const query = `
      SELECT 
        th.package_id,
        w.address AS location_address,
        w.location_type as location_type,
        w.location_name as location_name,
        th.status,
        th.changed_at
      FROM package_tracking_log th
      LEFT JOIN locations w ON th.location = w.location_id
      WHERE th.package_id = ?
      ORDER BY th.changed_at DESC;
    `;
  const [rows] = await db.execute(query, [package_id]);
  return rows;
}

async function updateTracking(package_id, location_id, status, employee_id, date) {
  
  const [latest] = await db.execute(
    "SELECT location, status FROM package_tracking_log WHERE package_id = ? ORDER BY changed_at DESC LIMIT 1",
    [package_id]
  );

  const lastKnown = latest[0] || {};

  const finalLocation = location_id ?? lastKnown.location ?? null;
  const finalStatus = status ?? lastKnown.status ?? null;

  const [result] = await db.execute(
    `INSERT INTO package_tracking_log  (package_id, location, status, changed_at, employee_id)  VALUES (?, ?, ?, COALESCE(?, NOW()), ?)`,
    [package_id, finalLocation, finalStatus, date, employee_id]
  );

  return result.affectedRows;

}

module.exports = {
  getTrackingInfo,
  updateTracking
};