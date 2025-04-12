/*
 * /ShipNGo/backend/routes/manager.js
 */

const { sendJson } = require("../helpers");
const { 
  getAllClaims, 
  getClaimsWithoutPackages,
  getSumTransactions 
} = require("../controllers/managerController");
 
async function fetchAllClaims(req, res) {
  try {
    const claims = await getAllClaims();
    sendJson(res, 200, claims);
  } catch (err) {
    sendJson(res, 500, { error: err.message });
  }
}

async function fetchClaimsWithoutPackages(req, res) {
  try {
    const claimsWithoutPackages = await getClaimsWithoutPackages();
    sendJson(res, 200, claimsWithoutPackages);
  } catch (err) {
    sendJson(res, 500, { error: err.message });
  }
}

async function fetchSum(req, res){
    try{
        const sum = await getSumTransactions();
        sendJson(res, 200, sum);
    } catch(err){
        sendJson(res, 500, { error: err.message});
    }
}

module.exports = {
  fetchAllClaims,
  fetchClaimsWithoutPackages,
  fetchSum
};