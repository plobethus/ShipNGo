// /backend/controllers/employeesController.js
const db = require("../db");
const bcrypt = require("bcryptjs");
const { createEmployee: createEmpInProfile } = require("./profileController");

async function getAllEmployees(filters) {
    let sql = `
    SELECT
      e.employee_id, e.name, e.address, e.phone, e.email,
      e.ssn, e.username, e.employee_role, e.manager_id,
      e.employment_location AS location_id,
      l.location_name
    FROM employees e
    LEFT JOIN locations l
      ON e.employment_location = l.location_id
  `;
  const params = [];
  const conds = [];
  if (filters.role) {
    conds.push("employee_role LIKE ?");
    params.push(`%${filters.role}%`);
  }
  if (filters.location) {
    conds.push("employment_location = ?");
    params.push(filters.location);
  }
  if (conds.length) sql += " WHERE " + conds.join(" AND ");
  const [rows] = await db.execute(sql, params);
  return rows;
}

async function getEmployeeById(id) {
    const sql = `
    SELECT
      e.employee_id, e.name, e.address, e.phone, e.email,
      e.ssn, e.username, e.employee_role, e.manager_id,
      e.employment_location AS location_id,
      l.location_name
    FROM employees e
    LEFT JOIN locations l
      ON e.employment_location = l.location_id
    WHERE e.employee_id = ?
  `;
  const [rows] = await db.execute(sql, [id]);
  return rows[0];
}

async function createEmployee(data) {
  // delegate hashing/insert to your existing profileController.createEmployee
  return await createEmpInProfile(
    data.username,
    data.password,
    data.name,
    data.address,
    data.phone,
    data.email,
    data.ssn,
    data.employment_location,
    data.employee_role,
    data.manager_id
  );
}

async function updateEmployee(id, data) {
  const fields = [];
  const params = [];
  if (data.name)               { fields.push("name = ?");               params.push(data.name); }
  if (data.address)            { fields.push("address = ?");            params.push(data.address); }
  if (data.phone)              { fields.push("phone = ?");              params.push(data.phone); }
  if (data.email)              { fields.push("email = ?");              params.push(data.email); }
  if (data.ssn)                { fields.push("ssn = ?");                params.push(data.ssn); }
  if (data.username)           { fields.push("username = ?");           params.push(data.username); }
  if (data.password) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(data.password, salt);
    fields.push("password = ?");
    params.push(hash);
  }
  if (data.employee_role)      { fields.push("employee_role = ?");      params.push(data.employee_role); }
  if (data.manager_id !== undefined) {
    fields.push("manager_id = ?");
    params.push(data.manager_id);
  }
  if (data.employment_location) { fields.push("employment_location = ?"); params.push(data.employment_location); }

  if (!fields.length) return { affectedRows: 0 };

  params.push(id);
  const sql = `UPDATE employees SET ${fields.join(", ")} WHERE employee_id = ?`;
  const [result] = await db.execute(sql, params);
  return result;
}

async function deleteEmployee(id) {
  const [result] = await db.execute(
    "DELETE FROM employees WHERE employee_id = ?",
    [id]
  );
  return result;
}

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
