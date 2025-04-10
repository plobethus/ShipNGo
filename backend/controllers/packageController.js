/*
* /ShipNGo/backend/controllers/packageController.js
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
  
  async function getAllPackages(filter) {
    let query = `
      SELECT p.package_id, p.status, p.location, p.weight, p.dimensions, p.address_from, p.address_to,
             c1.name AS sender_name
      FROM packages p
      LEFT JOIN customers c1 ON p.sender_id = c1.customer_id
      WHERE 1=1
    `;
    const values = [];
    if (filter.status) {
      query += " AND p.status = ?";
      values.push(filter.status);
    }
    if (filter.customerName) {
      query += " AND (c1.name LIKE ? OR c2.name LIKE ?)";
      values.push(`%${filter.customerName}%`, `%${filter.customerName}%`);
    }
    if (filter.startDate && filter.endDate) {
      query += " AND p.created_at BETWEEN ? AND ?";
      values.push(filter.startDate, filter.endDate);
    }
    if (filter.minWeight) {
      query += " AND p.weight >= ?";
      values.push(filter.minWeight);
    }
    if (filter.maxWeight) {
      query += " AND p.weight <= ?";
      values.push(filter.maxWeight);
    }
    if (filter.address) {
      query += " AND (p.address_from LIKE ? OR p.address_to LIKE ?)";
      values.push(`%${filter.address}%`, `%${filter.address}%`);
    }
    const [packages] = await db.execute(query, values);
    return packages;
  }
  
  async function updatePackage(id, data) {
    let query = "UPDATE packages SET ";
    const updates = [];
    const values = [];
    if (data.status) {
      updates.push("status = ?");
      values.push(data.status);
    }
    if (data.location) {
      updates.push("location = ?");
      values.push(data.location);
    }
    query += updates.join(", ") + " WHERE package_id = ?";
    values.push(id);
    const [result] = await db.execute(query, values);
    return result.affectedRows;
  }
  
  async function getCustomerPackages(customerId) {
    const [packages] = await db.execute(
      "SELECT package_id, sender_id, weight, status, address_from, address_to FROM packages WHERE sender_id = ?",
      [customerId, customerId]
    );
    return packages;
  }
  
  module.exports = {
    getAllPackages,
    updatePackage,
    getCustomerPackages
  };