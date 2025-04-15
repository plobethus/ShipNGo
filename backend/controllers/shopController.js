//ShipNGo/backend/controllers/shopController
const db = require("../db");

async function performCheckout(user, items) {
  const userId = user.customer_id;
  for (const item of items) {
    const [supplyRows] = await db.execute(
      "SELECT supply_id, price, stock_quantity FROM supplies WHERE category = ?",
      [item.category]
    );

    if (supplyRows.length === 0) {
      throw new Error(`Item category "${item.category}" not found`);
    }

    const { supply_id, price, stock_quantity } = supplyRows[0];

    item.supply_id = supply_id; item.price = price; item.stock_quantity = stock_quantity;

    if (stock_quantity < item.quantity) {
      throw new Error(`Not enough stock for ${item.category}`);
    }

  }

  for (const item of items) {

    const totalCost = (item.quantity * item.price).toFixed(2);

    await db.execute(
      `INSERT INTO supplytransactions (user_id, supply_id, quantity, total_cost, purchase_date)
             VALUES (?, ?, ?, ?, NOW())`,
      [userId, item.supply_id, item.quantity, totalCost]
    );

    await db.execute(
      `UPDATE supplies SET stock_quantity = stock_quantity - ? WHERE supply_id = ?`,
      [item.quantity, item.supply_id]
    )
  }
}


async function getItems() {
  const [supplyRows] = await db.execute(
    "SELECT * FROM supplies",
  );
  return supplyRows
}


async function updateItems(items) {
  for (const item of items) {
    const [rows] = await db.execute(
      `UPDATE supplies SET stock_quantity = GREATEST(stock_quantity + ?, 0) WHERE category = ?`,
      [item.change, item.category]
    );

    if (rows.affectedRows == 0){
      throw new Error(`No supply found ${item.category}`);
    }
  }
}

module.exports = {
  performCheckout,
  getItems,
  updateItems
}