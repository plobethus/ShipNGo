const { sendJson } = require("../helpers");
const { getSumTransactions } = require("../controllers/financialController")
const { getAllTransactions } = require("../controllers/financialController")

async function fetchSumTransactions(req,res){
    try{
        const sum = await getSumTransactions();
        sendJson(res,200,sum);
    }catch(err){
        sendJson(res,500,{error:err.message});
    }
}

async function fetchAllTransactions(req,res){
    try{
        const trans = await getAllTransactions();
        sendJson(res,200,trans);
    }catch(err){
        sendJson(res,500,{error: err.message});
    }  
}

module.exports = {
    fetchSumTransactions,
    fetchAllTransactions
  };
    