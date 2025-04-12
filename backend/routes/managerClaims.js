/*
 * /ShipNGo/backend/routes/routes.js (or wherever your main routes file is)
 */

const express = require("express");
const router = express.Router();
const managerController = require("./managerClaims");

// Claims routes
router.get("/api/claims/", managerController.fetchAllClaims);
router.get("/api/claims/without-packages", managerController.fetchClaimsWithoutPackages);
router.get("/api/transactions/sum", managerController.fetchSum);

// Update the status update route to use the new controller function
router.put("/api/claims/:ticketId/status", async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;
    
    // Validate required parameters
    if (!ticketId || !status) {
      return res.status(400).json({ error: "Missing required parameters" });
    }
    
    // Call the controller function to update the status
    const result = await managerController.updateClaimStatus(ticketId, status);
    
    // Send success response
    res.status(200).json(result);
  } catch (err) {
    console.error("Error updating claim status:", err);
    
    // Send appropriate error response based on the error
    if (err.message === 'Claim not found') {
      res.status(404).json({ error: "Claim not found" });
    } else if (err.message === 'Invalid status value') {
      res.status(400).json({ error: "Invalid status value" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

module.exports = router;