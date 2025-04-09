/*
 * /ShipNGo/backend/routes/claims.js
 */

const { sendJson } = require("../helpers");
const { getAllClaims } = require("../controllers/managerController");

async function fetchAllClaims(req, res) {
  try {
    const claims = await getAllClaims();
    sendJson(res, 200, claims);
  } catch (err) {
    sendJson(res, 500, { error: err.message });
  }
}

module.exports = {
  fetchAllClaims
};