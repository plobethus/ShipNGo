//ShipNGo/backend/controllers/trackingController.js

const db = require("../db"); 
  
  async function getTrackingInfo(package_id) {
    const query = `
      SELECT 
        th.package_id,
        w.address AS warehouse_location,
        p.address AS post_office_address,
        th.status,
        th.updated_at
      FROM trackinghistory th
      LEFT JOIN warehouses w ON th.warehouse_location = w.ware_id
      LEFT JOIN postoffices p ON th.post_office_location = p.post_id
      WHERE th.package_id = ?
      ORDER BY th.updated_at DESC;
    `;
    const [rows] = await db.execute(query, [package_id]);
    return rows;
  }
  
  async function updateTracking(package_id, warehouse_location, post_office_location, date, status, route_id) {
    await db.execute(
      "INSERT INTO trackinghistory (package_id, warehouse_location, post_office_location, date, status, updated_at, route_id) VALUES (?, ?, ?, ?, ?, NOW(), ?)",
      [package_id, warehouse_location, post_office_location, date, status, route_id]
    );
  }
  
  module.exports = {
    getTrackingInfo,
    updateTracking
  };