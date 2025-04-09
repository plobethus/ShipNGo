const db = require("mysql2").createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: true },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  }).promise();
  
  /**
   * Decrement stock quantities for purchased items.
   * @param {Array} items - Array of { name: string, quantity: number }
   * @returns {Object} - success: true or false, and optional message
   */
  async function purchaseItems(items) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
  
      for (const { name, quantity } of items) {
        if (quantity <= 0) continue;
  
        // Check stock availability first
        const [rows] = await conn.execute(
          "SELECT stock_quantity FROM supplies WHERE name = ?",
          [name]
        );
  
        if (rows.length === 0) {
          throw new Error(`Item "${name}" not found.`);
        }
  
        const stock = parseInt(rows[0].stock_quantity);
        if (stock < quantity) {
          throw new Error(`Not enough stock for "${name}". Requested: ${quantity}, Available: ${stock}`);
        }
  
        await conn.execute(
          "UPDATE supplies SET stock_quantity = stock_quantity - ? WHERE name = ?",
          [quantity, name]
        );
      }
  
      await conn.commit();
      return { success: true, message: "Purchase complete." };
    } catch (err) {
      await conn.rollback();
      return { success: false, message: err.message };
    } finally {
      conn.release();
    }
  }
  
  module.exports = {
    purchaseItems
  };
  