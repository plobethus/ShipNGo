const { sendJson } = require("../helpers");
const { readJsonBody } = require("../helpers");
const locationsController = require("../controllers/locationsController");

async function getAllLocations(req, res) {
  try {
    const offices = await locationsController.getAllLocation();
    sendJson(res, 200, offices);
  } catch (err) {
    sendJson(res, 500, { message: err.message });
  }
}

async function getLocationById(req, res, id) {
  try {
    const office = await locationsController.getLocationById(id);
    if (!office) {
      sendJson(res, 404, { message: "Location not found." });
      return;
    }
    sendJson(res, 200, office);
  } catch (err) {
    sendJson(res, 500, { message: err.message });
  }
}

// async function createOffice(req, res) {
//   try {
//     const body = await readJsonBody(req);
//     const newId = await postOfficeController.createPostOffice(body);
//     sendJson(res, 201, { message: "Post office created.", post_id: newId });
//   } catch (err) {
//     sendJson(res, 500, { message: err.message });
//   }
// }

// async function deleteOffice(req, res, id) {
//   try {
//     const deleted = await postOfficeController.deletePostOffice(id);
//     if (deleted === 0) {
//       sendJson(res, 404, { message: "Post office not found." });
//       return;
//     }
//     sendJson(res, 200, { message: "Post office deleted successfully." });
//   } catch (err) {
//     sendJson(res, 500, { message: err.message });
//   }
// }

module.exports = {
  getAllLocations,
  getLocationById
};
