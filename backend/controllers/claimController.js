/* 
 * /ShipNoGo/backend/controllers/claimController.js
 * Handles filing of claims and retrieval of claim data.
 */

const db = require("../config/db");

// POST /claims
// 1. Verify that the provided email exists in the customers table.
// 2. If not found, respond with 404.
// 3. Otherwise, insert a new claim with status 'Queued' and current processed date.
exports.fileClaim = async (req, res) => {
  const { name, email, phone, reason } = req.body;
  if (!name || !email || !phone || !reason) {
    return res.status(400).json({ message: "All fields are required." });
  }
  try {
    const [customerRows] = await db.execute(
      "SELECT customer_id FROM customers WHERE email = ?",
      [email]
    );
    if (customerRows.length === 0) {
      return res.status(404).json({ message: "No email found" });
    }
    const customerId = customerRows[0].customer_id;
    await db.execute(
      `INSERT INTO claims (customer_id, phone, reason, status, processed_date)
       VALUES (?, ?, ?, 'Queued', NOW())`,
      [customerId, phone, reason]
    );
    res.status(201).json({ message: "Claim submitted successfully." });
  } catch (error) {
    console.error("Error filing claim:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /claims
// Retrieves all claims with a LEFT JOIN on customers to include customer name and email.
exports.getAllClaims = async (req, res) => {
  try {
    const [claims] = await db.execute(`
      SELECT c.claim_id, c.customer_id, c.phone, c.reason, c.status, c.processed_date,
             cust.name, cust.email
      FROM claims c
      LEFT JOIN customers cust ON c.customer_id = cust.customer_id
      ORDER BY c.claim_id DESC
    `);
    res.status(200).json({ claims });
  } catch (error) {
    console.error("Error fetching claims:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};