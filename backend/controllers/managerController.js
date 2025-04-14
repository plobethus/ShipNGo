//ShipNGo/backend/controllers/claims.js

const db = require("../db"); 
  
async function getAllClaims() {
  const [rows] = await db.query("SELECT * FROM claims LEFT JOIN packages ON claims.package_id = packages.package_id");
  return rows;
}


async function updateClaimStatusController(ticket_id, status) {
  const validStatuses = ['Pending', 'Processing', 'Approved', 'Rejected'];
  if (!validStatuses.includes(status)) {
    throw new Error("Invalid status value");
  }

  const query = "UPDATE claims SET refund_status = ? WHERE ticket_id = ?";
  const [result] = await db.query(query, [status, ticket_id]);

  return result;
}

  module.exports = {
    getAllClaims,
    updateClaimStatusController
  };

