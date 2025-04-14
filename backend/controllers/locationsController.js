// backend/controllers/postOfficeController.js
const db = require("../db");

async function getAllLocation() {
  const [rows] = await db.execute("SELECT * FROM locations");
  return rows;
}

async function getLocationById(post_id) {
  const [rows] = await db.execute("SELECT * FROM locations WHERE location_id = ?", [post_id]);
  return rows[0];
}

async function createPostOffice(data) {
  const {
    manager_id,
    name,
    num_employees,
    is_active,
    city,
    state,
    zip_code,
    opening_time,
    closing_time,
    address
  } = data;

  const sql = `
      INSERT INTO postoffices (
        manager_id, name, num_employees, is_active, city,
        state, zip_code, opening_time, closing_time, address
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  const values = [
    manager_id, name, num_employees, is_active, city,
    state, zip_code, opening_time, closing_time, address
  ];

  const [result] = await db.execute(sql, values);
  return result.insertId;
}

async function deletePostOffice(post_id) {
  const [result] = await db.execute("DELETE FROM locations WHERE location_id = ?", [post_id]);
  return result.affectedRows;
}

module.exports = {
  getAllLocation,
  getLocationById,
  createPostOffice,
  deletePostOffice
};
