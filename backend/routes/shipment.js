/*
* /ShipNGo/backend/routes/shipment.js
*/

const { sendJson } = require("../helpers");
const { readJsonBody } = require("../helpers");
const packageController = require("../controllers/packageController");
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

async function createShipment(req, res) {
  try {
    const body = await readJsonBody(req);
    const senderId = req.tokenData.customer_id;

    let baseCost = 5 + body.weight * 0.5;
    let multiplier = 1;
    if (body.shipping_class === "express") multiplier = 1.2;
    else if (body.shipping_class === "overnight") multiplier = 1.5;
    
    let cost = baseCost * multiplier;
    cost = parseFloat(cost.toFixed(2));
    body.cost = cost;
    
    const result = await packageController.createPackage({ ...body, sender_id: senderId });

    // STEP 3: Re-check customer data after trigger runs
    const [updatedRows] = await db.query(
      "SELECT discount_percentage, package_count FROM customers WHERE customer_id = ?",
      [senderId]
    );
    const discount = updatedRows[0]?.discount_percentage || 0;
    const updatedCount = updatedRows[0]?.package_count || 0;

    // STEP 4: Apply discount if active
    if (discount >= 10) {
      cost = parseFloat((cost * 0.9).toFixed(2));
      await db.query("UPDATE customers SET discount_percentage = 0 WHERE customer_id = ?", [senderId]);
    }

    const nextDiscountUnlocked = (updatedCount % 3 === 2);
 
    sendJson(res, 201, { 
      message: "Shipment created",
      package: {
        package_id: result.package_id,
        sender_name: body.sender_name,
        receiver_name: body.receiver_name,
        address_from: body.address_from,
        address_to: body.address_to,
        weight: body.weight,
        shipping_class: body.shipping_class,
        cost,
        status: "Pending",
        location: body.address_to
      },
      discount_applied: discount,
      next_discount_unlocked: nextDiscountUnlocked

    });
    
  } catch (err) {
    console.error("Error creating shipment:", err);
    sendJson(res, 500, { message: "Failed to create shipment", error: err.message });
  }
}

async function getShipments(req, res) {
  try {
    const sql = "SELECT * FROM shipments";
    const [results] = await db.query(sql);
    sendJson(res, 200, results);
  } catch (err) {
    sendJson(res, 500, { error: err.message });
  }
}

async function getShipmentById(req, res, id) {
  try {
    const sql = "SELECT * FROM shipments WHERE shipment_id = ?";
    const [result] = await db.query(sql, [id]);
    if (!result || result.length === 0) {
      sendJson(res, 404, { message: "Shipment not found" });
      return;
    }
    sendJson(res, 200, result[0]);
  } catch (err) {
    sendJson(res, 500, { error: err.message });
  }
}

module.exports = {
  createShipment,
  getShipments,
  getShipmentById,
};