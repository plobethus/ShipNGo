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

//Items being {category:str, quantity:int}, category can be enum('Envelope','Box','Tape','Stamps','Labels')
async function performCheckout(user, items){
  const userId = user.customer_id;
    for (const item of items){
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

    for (const item of items){

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


module.exports = {
  performCheckout
}