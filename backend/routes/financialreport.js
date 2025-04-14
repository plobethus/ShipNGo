//ShipNGo/backend/routes/financialreport.js

const { sendJson } = require("../helpers");
const { getSumPackageTransactions } = require("../controllers/financialController")
const { getAllPackageTransactions } = require("../controllers/financialController")
const { getSumTransactions } = require("../controllers/financialController")
const { getAllTransactions } = require("../controllers/financialController")
const { getSumInsurance } = require("../controllers/financialController")
const { getAllInsuranceTransactions } = require("../controllers/financialController")

async function fetchSumPackageTransactions(req,res){
    try{
        const sum = await getSumPackageTransactions();
        sendJson(res,200,sum);
    }catch(err){
        sendJson(res,500,{error:err.message});
    }
}

async function fetchAllPackageTransactions(req,res){
    try{
        const trans = await getAllPackageTransactions();
        sendJson(res,200,trans);
    }catch(err){
        sendJson(res,500,{error: err.message});
    }  
}

async function fetchSumTransactions(req, res) {
    try {
        const sum = await getSumTransactions();
        sendJson(res, 200, sum);
    } catch (err) {
        sendJson(res, 500, { error: err.message });
    }
}

async function fetchAllTransactions(req, res) {
    try {
        const trans = await getAllTransactions();
        sendJson(res, 200, trans);
    } catch (err) {
        sendJson(res, 500, { error: err.message });
    }
}

async function fetchSumInsurance(req,res){
    try{
        const sum = await getSumInsurance();
        sendJson(res,200,sum);
    }catch(err){
        sendJson(res,500,{error:err.message});
    }
}

async function fetchAllInsuranceTransactions(req,res){
    try{
        const trans = await getAllInsuranceTransactions();
        sendJson(res,200,trans);
    }catch(err){
        sendJson(res,500,{error: err.message});
    }  
}

module.exports = {
    fetchSumPackageTransactions,
    fetchAllPackageTransactions,
    fetchSumTransactions,
    fetchAllTransactions,
    fetchSumInsurance,
    fetchAllInsuranceTransactions
  };
