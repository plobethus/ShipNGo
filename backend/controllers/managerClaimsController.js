//ShipNGo/backend/controllers/managerController.js
 
const db = require("../db"); 
  
async function getAllClaims() {
    try {
      const query = `
        SELECT 
          c.ticket_id, 
          c.issue_type, 
          c.processed_date, 
          c.reason, 
          c.customer_id, 
          c.refund_status,
          c.package_id,
          u.first_name,
          u.last_name,
          p.weight,
          p.dimensions
        FROM 
          claims c
        LEFT JOIN 
          users u ON c.customer_id = u.id
        LEFT JOIN 
          packages p ON c.package_id = p.id
        ORDER BY 
          c.processed_date DESC
      `;
      
      const [rows] = await db.query(query);
      return rows;
    } catch (error) {
      console.error("Database error in getAllClaims:", error);
      throw error;
    }
  }

async function getClaimsWithoutPackages() {
  try {
    const query = `
      SELECT 
        c.ticket_id, 
        c.issue_type, 
        c.processed_date, 
        u.first_name,
        u.last_name
      FROM 
        claims c
      LEFT JOIN 
        users u ON c.customer_id = u.id
      WHERE 
        c.package_id IS NULL
      ORDER BY 
        c.processed_date DESC
    `;
    
    const [rows] = await db.query(query);
    return rows;
  } catch (error) {
    console.error("Database error in getClaimsWithoutPackages:", error);
    throw error;
  }
}

async function getSumTransactions() {
  try {
    const [rows] = await db.query("SELECT SUM(total_cost) AS total_sum FROM supplytransactions");
    return rows;
  } catch (error) {
    console.error("Database error in getSumTransactions:", error);
    throw error;
  }
}

async function updateClaimStatus(ticketId, status) {
  try {
    const allowedStatuses = ['Pending', 'Processing', 'Approved', 'Rejected'];
    if (!allowedStatuses.includes(status)) {
      throw new Error('Invalid status value');
    }

    const query = `
      UPDATE claims 
      SET refund_status = ? 
      WHERE ticket_id = ?
    `;
    
    const [result] = await db.query(query, [status, ticketId]);
    
    if (result.affectedRows === 0) {
      throw new Error('Claim not found');
    }
    
    return { success: true, message: 'Status updated successfully' };
  } catch (error) {
    console.error("Database error in updateClaimStatus:", error);
    throw error;
  }
}
  
module.exports = {
  getAllClaims,
  getClaimsWithoutPackages,
  getSumTransactions,
  updateClaimStatus
};