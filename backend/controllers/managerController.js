//ShipNGo/backend/controllers/claims.js
 

const db = require("../db"); 
  
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