const db = require("../db");

async function getSumPackageTransactions(){
    const [rows] = await db.query("SELECT SUM(cost) AS cost FROM packages");
    return rows;
}
  
async function getAllPackageTransactions(){
    const [rows] = await db.query("SELECT P.package_id, C.name, P.weight, P.dimensions, P.shipping_class, P.cost, P.created_at FROM customers AS C, packages AS P WHERE P.sender_id = C.customer_id");
    return rows;
}

async function getSumTransactions(){
    const [rows] = await db.query("SELECT SUM(total_cost) AS total_sum FROM supplytransactions");
    return rows;
}

async function getAllTransactions() {
  const [rows] = await db.query(
    `SELECT 
      ST.supply_transaction_id,
      C.name AS customer_name,
      S.category,
      ST.quantity,
      ST.total_cost,
      ST.purchase_date,
      L.location_id,
      L.location_name,
      L.address
    FROM 
      customers AS C
    JOIN 
      supplytransactions AS ST ON C.customer_id = ST.user_id
    JOIN 
      supplies AS S ON S.supply_id = ST.supply_id
    LEFT JOIN 
      locations AS L ON S.location_id = L.location_id`);

    return rows;
}

async function getSumInsurance(){
    const [rows] = await db.query("SELECT SUM(insurance_fee) AS insurance_fee FROM insurancepolicies ");
    return rows;
}

async function getAllInsuranceTransactions(){
    const [rows] = await db.query("SELECT I.insurance_id, I.package_id, C.name, I.insured_value, I.insured_fee, I.claim_date FROM insurancepolicies AS I, packages AS P, customers AS C WHERE I.package_id = P.package_id AND P.sender_id = C.customer_id");
    return rows;
}
  
  module.exports = {
    getSumPackageTransactions,
    getAllPackageTransactions,
    getSumTransactions,
    getAllTransactions,
    getSumInsurance,
    getAllInsuranceTransactions
  };