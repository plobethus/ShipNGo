//ShipNGo/backend/controllers/profileController.js


const bcrypt = require('bcryptjs');
const db = require("../db");

/**
 * Get employee profile information
 * @param {number} employeeId - The employee ID
 * @returns {Promise<Object>} - Employee profile data
 */
async function getEmployeeProfile(employeeId) {
  console.log("Getting profile for employee ID:", employeeId);

  try {

    const [rows] = await db.execute(
      "SELECT employee_id, name, email, phone, address FROM employees WHERE employee_id = ?",
      [employeeId]
    );

    console.log("Query results:", rows.length > 0 ? "Employee found" : "No employee found");

    if (rows.length === 0) {
      throw new Error("Employee not found");
    }

    const employeeData = rows[0];

    if (employeeData.phone) {
      employeeData.phone = employeeData.phone.toString();
    }

    return employeeData;
  } catch (error) {
    console.error("Database error in getEmployeeProfile:", error.message);
    throw error;
  }
}

/**
 * Update Employee profile information
 * @param {number} employeeId - The employee ID
 * @param {Object} profileData - The updated profile data
 * @returns {Promise<Object>} - Result of the update operation
 */
async function updateEmployeeProfile(employeeId, profileData) {
  const allowedFields = ['name', 'phone', 'address', 'email'];
  const updates = [];
  const values = [];

  for (const field of allowedFields) {
    if (profileData[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(profileData[field]);
    }
  }

  if (updates.length === 0) {
    return { affectedRows: 0 };
  }

  values.push(employeeId);

  const query = `UPDATE employees SET ${updates.join(', ')} WHERE employee_id = ?`;
  const [result] = await db.execute(query, values);

  return result;
}

/**
 * Change employee password
 * @param {number} employeeId - The employee ID
 * @param {string} currentPassword - The current password
 * @param {string} newPassword - The new password
 * @returns {Promise<boolean>} - Success/failure of password change
 */
async function changeEmployeePassword(employeeId, currentPassword, newPassword) {
  const [rows] = await db.execute(
    "SELECT password FROM employees WHERE employee_id = ?",
    [employeeId]
  );

  if (rows.length === 0) {
    throw new Error("Employee not found");
  }

  const validPassword = await bcrypt.compare(currentPassword, rows[0].password);
  if (!validPassword) {
    return false;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  const [result] = await db.execute(
    "UPDATE employees SET password = ? WHERE employee_id = ?",
    [hashedPassword, employeeId]
  );

  return result.affectedRows > 0;
}


async function createEmployee(username, password, name, address, phone, email, ssn, employement_location, employee_role, manager_id) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO employees (
        username, password, name, address, phone, email,
        ssn, employment_location, employee_role, manager_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      username,
      hashedPassword,
      name,
      address,
      phone,
      email,
      ssn,
      employment_location,
      employee_role,
      manager_id
    ];

    const [result] = await db.execute(sql, values);
    return result.insertId; 
  } catch (error) {
    console.error("Error creating employee:", error);
    throw error;
  }
}

module.exports = {
  getEmployeeProfile,
  updateEmployeeProfile,
  changeEmployeePassword,
  createEmployee
};