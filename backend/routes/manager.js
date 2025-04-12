//ShipNGo/backend/routes/manager.js


const { sendJson, readJsonBody } = require("../helpers");
const { getAllClaims, updateClaimStatusController } = require("../controllers/managerController");
 
async function fetchAllClaims(req, res) {
  try {
    const claims = await getAllClaims();
    sendJson(res, 200, claims);
  } catch (err) {
    sendJson(res, 500, { error: err.message });
  }
}

async function fetchSum(req, res) {
  try {
    const sum = await getSumTransactions();
    sendJson(res, 200, sum);
  } catch (err) {
    sendJson(res, 500, { error: err.message });
  }
}


async function updateClaimStatus(req, res, ticketId){
  try{
    const {status} = await readJsonBody(req);
    await updateClaimStatusController(ticketId, status);
    sendJson(res,200);
  } catch(err){
    sendJson(res,500,{ error: err.message});
  }
}

async function updateClaimStatus(req, res, ticketId){
  try{
    const {status} = await readJsonBody(req);
    await updateClaimStatusController(ticketId, status);
    sendJson(res,200);
  } catch(err){
    sendJson(res,500,{ error: err.message});
  }
}



module.exports = {
  fetchAllClaims,
  fetchSum,
  updateClaimStatus
};