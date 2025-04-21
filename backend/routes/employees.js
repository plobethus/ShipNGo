// /backend/routes/employees.js
const { sendJson, readJsonBody } = require("../helpers");
const empCtrl = require("../controllers/employeesController");

async function getAllEmployees(req, res) {
  try {
    const emps = await empCtrl.getAllEmployees(req.query);
    sendJson(res, 200, { success: true, data: emps });
  } catch (err) {
    sendJson(res, 500, { success: false, message: err.message });
  }
}

async function getEmployeeById(req, res, id) {
  try {
    const emp = await empCtrl.getEmployeeById(id);
    if (!emp) return sendJson(res, 404, { success: false, message: "Not found" });
    sendJson(res, 200, { success: true, data: emp });
  } catch (err) {
    sendJson(res, 500, { success: false, message: err.message });
  }
}

async function createEmployee(req, res) {
  try {
    const body = await readJsonBody(req);
    const newId = await empCtrl.createEmployee(body);
    sendJson(res, 201, { success: true, data: { employee_id: newId } });
  } catch (err) {
    sendJson(res, 500, { success: false, message: err.message });
  }
}

async function updateEmployee(req, res, id) {
  try {
    const body = await readJsonBody(req);
    const result = await empCtrl.updateEmployee(id, body);
    if (result.affectedRows === 0) {
      return sendJson(res, 404, { success: false, message: "No update performed" });
    }
    sendJson(res, 200, { success: true, message: "Employee updated" });
  } catch (err) {
    sendJson(res, 500, { success: false, message: err.message });
  }
}

async function deleteEmployee(req, res, id) {
  try {
    const result = await empCtrl.deleteEmployee(id);
    if (result.affectedRows === 0) {
      return sendJson(res, 404, { success: false, message: "Employee not found" });
    }
    sendJson(res, 200, { success: true, message: "Employee deleted" });
  } catch (err) {
    sendJson(res, 500, { success: false, message: err.message });
  }
}

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
