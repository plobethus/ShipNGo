//ShipNGo/backend/routes/routes.js

const express = require("express");
const router = express.Router();
const managerController = require("../controllers/managerController");

router.get("/api/claims/", managerController.getAllClaims);
router.get("/api/transactions/sum", managerController.getSumTransactions);

router.put("/api/claims/:ticketId/status", async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;
    
    if (!ticketId || !status) {
      return res.status(400).json({ error: "Missing required parameters" });
    }
    
    const result = await managerController.updateClaimStatus(ticketId, status);
    
    res.status(200).json(result);
  } catch (err) {
    console.error("Error updating claim status:", err);
    
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