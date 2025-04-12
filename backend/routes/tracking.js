//ShipNGo/backend/routes/tracking.js

const { sendJson } = require("../helpers");
const { readJsonBody } = require("../helpers");
const trackingController = require("../controllers/trackingController");

async function getTracking(req, res, trackingId) {
  try {
    const rows = await trackingController.getTrackingInfo(trackingId);
    if (!rows.length) {
      sendJson(res, 404, { message: "Tracking info not found" });
      return;
    }
    sendJson(res, 200, { tracking_id: trackingId, history: rows });
  } catch (err) {
    sendJson(res, 500, { message: err.message });
  }
}

async function updateTracking(req, res) {
  try {
    const body = await readJsonBody(req);
    const { package_id, warehouse_location, post_office_location, status, date } = body;
    await trackingController.updateTracking(package_id, warehouse_location, post_office_location, date, status,);
    sendJson(res, 200, { message: "Tracking updated successfully" });
  } catch (err) {
    sendJson(res, 500, { message: err.message });
  }
}

module.exports = {
  getTracking,
  updateTracking
};