const { sendJson } = require("../helpers");
const { readJsonBody } = require("../helpers");
const postOfficeController = require("../controllers/postOfficesController");

async function getAllOffices(req, res) {
  try {
    const offices = await postOfficeController.getAllPostOffices();
    sendJson(res, 200, offices);
  } catch (err) {
    sendJson(res, 500, { message: err.message });
  }
}

async function getOfficeById(req, res, id) {
  try {
    const office = await postOfficeController.getPostOfficeById(id);
    if (!office) {
      sendJson(res, 404, { message: "Post office not found." });
      return;
    }
    sendJson(res, 200, office);
  } catch (err) {
    sendJson(res, 500, { message: err.message });
  }
}

async function createOffice(req, res) {
  try {
    const body = await readJsonBody(req);
    const newId = await postOfficeController.createPostOffice(body);
    sendJson(res, 201, { message: "Post office created.", post_id: newId });
  } catch (err) {
    sendJson(res, 500, { message: err.message });
  }
}

async function deleteOffice(req, res, id) {
  try {
    const deleted = await postOfficeController.deletePostOffice(id);
    if (deleted === 0) {
      sendJson(res, 404, { message: "Post office not found." });
      return;
    }
    sendJson(res, 200, { message: "Post office deleted successfully." });
  } catch (err) {
    sendJson(res, 500, { message: err.message });
  }
}

module.exports = {
  getAllOffices,
  getOfficeById,
  createOffice,
  deleteOffice
};
