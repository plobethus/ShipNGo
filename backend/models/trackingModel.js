/*
* /ShipNGo/backend/models/trackingModel.js
*/
const db = require("mysql2").createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: true },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise();

async function getTrackingByPackageId(package_id) {
  const [rows] = await db.execute(
    "SELECT * FROM trackinghistory WHERE package_id = ? ORDER BY updated_at DESC",
    [package_id]
  );
  return rows;
}

async function addTrackingUpdate(package_id, warehouse_location, post_office_location, date, status, route_id) {
  await db.execute(
    "INSERT INTO trackinghistory (package_id, warehouse_location, post_office_location, date, status, updated_at, route_id) VALUES (?, ?, ?, ?, ?, NOW(), ?)",
    [package_id, warehouse_location, post_office_location, date, status, route_id]
  );
}

module.exports = {
  getTrackingByPackageId,
  addTrackingUpdate
};