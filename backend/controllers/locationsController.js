const db = require("../db");

async function getAllLocations() {
  const [rows] = await db.execute(`
    SELECT
      l.location_id,
      l.location_name,
      l.location_type,
      l.state,
      l.zip_code,
      l.num_employees,
      l.is_active,
      l.opening_time,
      l.closing_time,
      l.address,
      l.manager_id,
      m.name        AS manager_name
    FROM locations AS l
    LEFT JOIN employees AS m
      ON l.manager_id = m.employee_id
  `);
  return rows;
}

async function getLocationById(location_id) {
  const [rows] = await db.execute(`
    SELECT
      l.location_id,
      l.location_name,
      l.location_type,
      l.state,
      l.zip_code,
      l.num_employees,
      l.is_active,
      l.opening_time,
      l.closing_time,
      l.address,
      l.manager_id,
      m.name        AS manager_name
    FROM locations AS l
    LEFT JOIN employees AS m
      ON l.manager_id = m.employee_id
    WHERE l.location_id = ?
  `, [location_id]);

  return rows[0] || null;
}


async function createLocation(data) {
  const {
    manager_id,
    name,
    num_employees,
    is_active,
    state,
    zip_code,
    opening_time,
    closing_time,
    address,
    location_type
  } = data;

  const sql = `
    INSERT INTO locations 
      (manager_id, location_name, num_employees, is_active, state, zip_code, opening_time, closing_time, address, location_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [manager_id || null, name, num_employees, is_active, state, zip_code, opening_time, closing_time, address, location_type];
  const [result] = await db.execute(sql, values);
  return result.insertId;
}

async function updateLocation(location_id, data) {
  const {
    name,
    location_type,
    num_employees,
    is_active,
    state,
    zip_code,
    opening_time,
    closing_time,
    address,
    manager_id
  } = data;

  const sql = `
    UPDATE locations
    SET location_name = ?, location_type = ?, num_employees = ?, is_active = ?, state = ?, zip_code = ?, opening_time = ?, closing_time = ?, address = ?, manager_id	= ?
    WHERE location_id = ?
  `;
  const values = [name, location_type, num_employees, is_active, state, zip_code, opening_time, closing_time, address, manager_id || null, location_id];
  const [result] = await db.execute(sql, values);
  return result.affectedRows;
}

async function deleteLocation(location_id) {
  const [result] = await db.execute("DELETE FROM locations WHERE location_id = ?", [location_id]);
  return result.affectedRows;
}

module.exports = {
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
};
