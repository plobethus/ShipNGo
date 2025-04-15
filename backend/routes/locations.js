const { sendJson, readJsonBody } = require("../helpers");
const locationsController = require("../controllers/locationsController");

async function getAllLocations(req, res) {
  try {
    const locations = await locationsController.getAllLocations();
    sendJson(res, 200, locations);
  } catch (err) {
    sendJson(res, 500, { message: err.message });
  }
}

async function getLocationById(req, res, id) {
  try {
    const location = await locationsController.getLocationById(id);
    if (!location) {
      sendJson(res, 404, { message: "Location not found." });
      return;
    }
    sendJson(res, 200, location);
  } catch (err) {
    sendJson(res, 500, { message: err.message });
  }
}

async function createLocation(req, res) {
  try {
    const data = await readJsonBody(req);
    const insertId = await locationsController.createLocation(data);
    sendJson(res, 201, { message: "Location created successfully", locationId: insertId });
  } catch (err) {
    sendJson(res, 500, { message: err.message });
  }
}

async function updateLocation(req, res, id) {
  try {
    const data = await readJsonBody(req);
    const affectedRows = await locationsController.updateLocation(id, data);
    if (affectedRows === 0) {
      sendJson(res, 404, { message: "Location not found." });
      return;
    }
    sendJson(res, 200, { message: "Location updated successfully" });
  } catch (err) {
    sendJson(res, 500, { message: err.message });
  }
}

async function deleteLocation(req, res, id) {
  try {
    const affectedRows = await locationsController.deleteLocation(id);
    if (affectedRows === 0) {
      sendJson(res, 404, { message: "Location not found." });
      return;
    }
    sendJson(res, 200, { message: "Location deleted successfully" });
  } catch (err) {
    sendJson(res, 500, { message: err.message });
  }
}

module.exports = {
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
};
