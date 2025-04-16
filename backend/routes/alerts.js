//ShipNGo/backend/routes/alerts.js
const db = require("../db"); 

async function getAlerts(req, res) {
  try {
    const [rows] = await db.query("SELECT * FROM alerts WHERE status = 'unread' ORDER BY created_at DESC LIMIT 10");

    // Mark them as read after sending
    await db.query("UPDATE alerts SET status = 'read' WHERE status = 'unread'");

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(rows));
  } catch (err) {
    console.error("Failed to fetch alerts:", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Error fetching alerts" }));
  }
}

async function clearAlerts(req, res) {
  try {
    await db.query("DELETE FROM alerts"); // or use an UPDATE if you prefer marking as read
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Alerts cleared" }));
  } catch (err) {
    console.error("Failed to clear alerts:", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Error clearing alerts" }));
  }
}

module.exports = {
  getAlerts,
  clearAlerts
};
