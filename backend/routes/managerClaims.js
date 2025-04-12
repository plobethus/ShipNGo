/*
 * /ShipNGo/backend/routes/managerClaims.js
 */

const { sendJson, readJsonBody } = require("../helpers");
const managerClaimsController = require("../controllers/managerClaimsController");

// Fetch all claims
async function fetchAllClaims(req, res) {
  try {
    const claims = await managerClaimsController.getAllClaims();
    sendJson(res, 200, { success: true, data: claims });
  } catch (error) {
    console.error("Error fetching claims:", error);
    sendJson(res, 500, { success: false, message: "Internal server error" });
  }
}

// Update claim status
async function updateClaimStatus(req, res, ticketId) {
  try {
    // Read the request body
    const body = await readJsonBody(req);
    const { status } = body;
    
    // Validate required parameters
    if (!ticketId || !status) {
      return sendJson(res, 400, { success: false, message: "Missing required parameters" });
    }
    
    // Call the controller function to update the status
    const result = await managerClaimsController.updateClaimStatus(ticketId, status);
    
    // Send success response
    sendJson(res, 200, { success: true, ...result });
  } catch (err) {
    console.error("Error updating claim status:", err);
    
    // Send appropriate error response based on the error
    if (err.message === 'Claim not found') {
      sendJson(res, 404, { success: false, message: "Claim not found" });
    } else if (err.message === 'Invalid status value') {
      sendJson(res, 400, { success: false, message: "Invalid status value" });
    } else {
      sendJson(res, 500, { success: false, message: "Internal server error" });
    }
  }
}

module.exports = {
  fetchAllClaims,
  updateClaimStatus
};