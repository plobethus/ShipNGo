//backend/routes/deliverpoints.js


const { sendJson } = require("../helpers");
const deliveryPointsController = require("../controllers/deliveryPointsController");
const { readJsonBody } = require("../helpers");

async function updateDeliveryPointAddress(req, res) {
  try {
    const body = await readJsonBody(req);
    const { address, delivery_point_id } = body;
    const id = await deliveryPointsController.updateDeliveryPointAddress(address, delivery_point_id);
    sendJson(res, 200, { message: "Address Delivery Point Registration Successful", id });
  } catch (err) {
    sendJson(res, 500, { message: err.message });
  }
}

async function registerDeliveryPoint(req, res) {
  try {
    const body = await readJsonBody(req);
    const { name, special_instructions, delivery_type, entrance_address } = body;
    const id = await deliveryPointsController.registerDeliveryPoint(name, special_instructions, delivery_type, entrance_address);
    sendJson(res, 200, { message: "Delivery Point Registration Successful", id });
  } catch (err) {
    sendJson(res, 500, { message: err.message });
  }
}

module.exports = {
  updateDeliveryPointAddress,
  registerDeliveryPoint
};