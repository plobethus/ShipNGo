//ShipNGo /backend/routes/packageRoutes.js

const { sendJson } = require("../helpers");
const packageController = require("../controllers/packageController");
const { readJsonBody } = require("../helpers");

async function getPackagesEmployee(req, res, query) {
  try {
    const packages = await packageController.getAllPackages(query);
    if (!packages.length) {
      sendJson(res, 404, { message: "No packages found." });
      return;
    }
    sendJson(res, 200, { packages });
  } catch (err) {
    sendJson(res, 500, { message: err.message });
  }
}

async function updatePackage(req, res, id) {
  try {
    const body = await readJsonBody(req);
    if (req.tokenData && req.tokenData.employee_id) {
      await db.execute("SET @employee_id = ?", [req.tokenData.employee_id]);
    } else { //if a non employee or bad login
      await db.execute("SET @employee_id = NULL");
    }
    
    const affected = await packageController.updatePackage(id, body);
    if (affected === 0) {
      sendJson(res, 404, { message: "Package not found or no changes made." });
      return;
    }
    sendJson(res, 200, { message: "Package updated successfully." });
  } catch (err) {
    sendJson(res, 500, { message: err.message });
  }
}

async function getPackagesCustomer(req, res) {
 
  const customerId = req.tokenData && req.tokenData.customer_id;
  if (!customerId) {
    sendJson(res, 400, { message: "Customer ID missing." });
    return;
  }
  try {
    const packages = await packageController.getCustomerPackages(customerId);
    sendJson(res, 200, packages);
  } catch (err) {
    sendJson(res, 500, { message: err.message });
  }
}

async function createPackage(req, res) {
  try {
    const body = await readJsonBody(req);

    const senderId = req.tokenData.customer_id;

    const result = await packageController.createPackage({ 
      ...body, 
      sender_id: senderId 
    });
    
    sendJson(res, 201, {
      message: "Shipment created",
      package: result.package,
      discount_applied: result.discount_applied
    });
    
  } catch (err) {
    console.error("Error creating shipment:", err);
    sendJson(res, 500, { message: "Failed to create shipment", error: err.message });
  }
}

async function deletePackage(req, res, id) {
  try {
    const affected = await packageController.deletePackage(id);
    if (affected === 0) {
      sendJson(res, 404, { message: "Package not found." });
      return;
    }
    sendJson(res, 200, { message: "Package deleted successfully." });
  } catch (err) {
    sendJson(res, 500, { message: err.message });
  }
}


module.exports = {
  getPackagesEmployee,
  updatePackage,
  getPackagesCustomer,
  createPackage,
  deletePackage
}