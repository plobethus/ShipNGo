/*
 * /ShipNGo/backend/controllers/claims.js
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
  
  async function getAllClaims() {
    const [rows] = await db.query("SELECT * FROM claims");
    return rows;
  }

  async function getSumTransactions(){
    const [rows] = await db.query("SELECT SUM(total_cost) AS total_sum FROM supplytransactions");
    return rows;
  }
  
  module.exports = {
    getAllClaims,
    getSumTransactions
  };