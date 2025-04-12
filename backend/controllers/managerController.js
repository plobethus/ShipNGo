//ShipNGo/backend/controllers/claims.js

const db = require("../db"); 
  
  async function getAllClaims() {
    const [rows] = await db.query("SELECT * FROM claims");
    return rows;
  }

  module.exports = {
    getAllClaims,
  };