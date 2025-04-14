//ShipNGo/backend/routes/status.js

const statusController = require("../controllers/statusController");

module.exports = {
  status: async (req, res) => {
    await statusController.status(req, res);
  }
};
