//ShipNGo/backend/routes/routes.js

const { sendJson, readJsonBody } = require("../helpers");
const managerClaimsController = require("../controllers/managerClaimsController");

async function fetchAllClaims(req, res) {
  try {
    const claims = await managerClaimsController.getAllClaims();
    sendJson(res, 200, { success: true, data: claims });
  } catch (error) {
    console.error("Error fetching claims:", error);
    sendJson(res, 500, { success: false, message: "Internal server error" });
  }
}

async function updateClaimStatus(req, res, ticketId) {
  try {
    const body = await readJsonBody(req);
    const { status } = body;
    
    if (!ticketId || !status) {
      return sendJson(res, 400, { success: false, message: "Missing required parameters" });
    }

    const result = await managerClaimsController.updateClaimStatus(ticketId, status);

    sendJson(res, 200, { success: true, ...result });
  } catch (err) {
    console.error("Error updating claim status:", err);
    
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