//ShipNGo/backend/routes/status.js

const { sendJson } = require("../helpers");
const statusController = require("../controllers/statusController");

module.exports = {
  /**
   * Handles GET /status
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   * @param {Object} query 
   */
  status: async (req, res, query) => {
    try {
      await statusController.status(req, res, query);
    } catch (err) {
      console.error("Status route error:", err);
      sendJson(res, 500, { success: false, message: err.message });
    }
  }
};