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
      SELECT p.package_id, p.status, p.location, p.weight, p.dimensions, p.address_from, p.address_to, c1.name AS sender_name, p.receiver_name AS receiver_name
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
    const query = `
    SELECT package_id, sender_id, weight, status, address_from, address_to, receiver_name
    FROM packages
    WHERE sender_id = ? 
      OR address_to = (SELECT address FROM customers WHERE customer_id = ?)`
    ;
    console.log("customerId in route:", customerId);
  const [packages] = await db.execute(query, [customerId, customerId]);
  return packages;
  }

  async function createPackage({
    sender_id,
    receiver_name,
    address_from,
    address_to,
    weight,
    dimensions,
    shipping_class,
  
  }) {
    const shippingCost = parseFloat((5 + weight * 0.5).toFixed(2)); // Simple cost formula
  
    const sql = `
      INSERT INTO packages
      (sender_id, receiver_name, weight, dimensions, shipping_class, cost, status, address_from, address_to, location)
      VALUES (?, ?, ?, ?, ?, ?, 'Pending', ?, ?, ?)
    `;
  
    const values = [
      sender_id, // Temporary hardcoded sender_id, replace with token-based ID later
      receiver_name,
      weight,
      dimensions,
      shipping_class.charAt(0).toUpperCase() + shipping_class.slice(1),
      shippingCost,
      address_from,
      address_to,
      "Origin"
    ];
  
    const [result] = await db.execute(sql, values);
    return { package_id: result.insertId, cost: shippingCost };
  }
  
  
  module.exports = {
    getAllPackages,
    updatePackage,
    getCustomerPackages,
    createPackage
  };