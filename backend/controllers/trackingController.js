//ShipNGo/backend/controllers/trackingController.js

const db = require("../db"); 
  
  async function getTrackingInfo(package_id) {
    const query = `
      SELECT 
        th.package_id,
        w.address AS location_address,
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
  
  async function updateTracking(package_id, location_id, date, status, route_id) {
    await db.execute(
      "INSERT INTO package_tracking_log (package_id, warehouse_location, post_office_location, date, status, updated_at, route_id) VALUES (?, ?, ?, ?, ?, NOW(), ?)",
      [package_id, warehouse_location, post_office_location, date, status, route_id]
    );
  }
  
  module.exports = {
    getTrackingInfo,
    updateTracking
  };