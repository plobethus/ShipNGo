//ShipNGo/backend/controllers/deliveryPointsController.js

const db = require("../db");

async function registerDeliveryPoint(name, special_instructions, delivery_type, entrance_address) {
  let entrance_address_id;
  const [addressRows] = await db.execute(
    "SELECT * FROM addresses WHERE LOWER(address)=LOWER(?)",
    [entrance_address]
  );
  if (addressRows.length > 0 && addressRows[0].customer_id == null) {
    entrance_address_id = addressRows[0].address_id;
  } else {
    const [insertResult] = await db.execute(
      "INSERT INTO addresses (address) VALUES (LOWER(?))",
      [entrance_address]
    );
    entrance_address_id = insertResult.insertId;
  }
  const [result] = await db.execute(
    "INSERT INTO deliverypoint (name, special_instructions, delivery_type, entrance_address_id) VALUES (?, ?, ?, ?)",
    [name, special_instructions, delivery_type, entrance_address_id]
  );
  return result.insertId;
}

async function updateDeliveryPointAddress(address, delivery_point_id) {
  const [result] = await db.execute(
    "REPLACE INTO registeredaddresswithpoints (delivery_point_address, delivery_point_id) VALUES (?,?)",
    [address, delivery_point_id]
  );
  return result.insertId;
}

module.exports = {
  registerDeliveryPoint,
  updateDeliveryPointAddress
};