//ShipNGo/backend/routes/alerts.js
const db = require("../db"); 

async function getAlerts(req, res) {
  try {
    const [rows] = await db.query("SELECT * FROM alerts ORDER BY created_at DESC LIMIT 10");
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(rows));
  } catch (err) {
    console.error("Failed to fetch alerts:", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Error fetching alerts" }));
  }
}

module.exports = {
  getAlerts
};
