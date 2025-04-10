const { sendJson } = require("../helpers");
const { readJsonBody } = require("../helpers");
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

async function purchaseSupplies(req, res) {
  try {
    const body = await readJsonBody(req);
    if (!Array.isArray(body)) {
      sendJson(res, 400, { error: "Request body must be an array." });
      return;
    }

    // Start transaction
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      for (const item of body) {
        const { name, quantity } = item;

        // Validate input
        if (!name || typeof quantity !== "number" || quantity <= 0) {
          throw new Error(`Invalid item: ${JSON.stringify(item)}`);
        }

        // Check available stock
        const [rows] = await conn.execute(
          "SELECT quantity FROM supplies WHERE name = ?",
          [name]
        );

        if (!rows.length) {
          throw new Error(`Item not found: ${name}`);
        }

        if (rows[0].quantity < quantity) {
          throw new Error(`Insufficient stock for item: ${name}`);
        }

        // Decrement stock
        await conn.execute(
          "UPDATE supplies SET quantity = quantity - ? WHERE name = ?",
          [quantity, name]
        );
      }

      await conn.commit();
      sendJson(res, 200, { message: "Purchase successful!" });

    } catch (err) {
      await conn.rollback();
      sendJson(res, 400, { error: err.message });
    } finally {
      conn.release();
    }
  } catch (err) {
    sendJson(res, 500, { error: err.message });
  }
}

module.exports = {
  purchaseSupplies
};
