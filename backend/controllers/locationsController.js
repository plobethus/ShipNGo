const db = require("../db");

async function getAllLocations() {
  const [rows] = await db.execute("SELECT * FROM locations");
  return rows;
}

async function getLocationById(location_id) {
  const [rows] = await db.execute("SELECT * FROM locations WHERE location_id = ?", [location_id]);
  return rows[0];
}

async function createLocation(data) {
  const {
    manager_id,
    name,
    num_employees,
    is_active,
    city,
    state,
    zip_code,
    open_time,
    close_time,
    address,
    location_type
  } = data;

  const sql = `
    INSERT INTO locations 
      (manager_id, name, num_employees, is_active, city, state, zip_code, opening_time, closing_time, address, location_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [manager_id, name, num_employees, is_active, city, state, zip_code, open_time, close_time, address, location_type];
  const [result] = await db.execute(sql, values);
  return result.insertId;
}

async function updateLocation(location_id, data) {
  const {
    name,
    location_type,
    num_employees,
    is_active,
    city,
    state,
    zip_code,
    open_time,
    close_time,
    address
  } = data;

  const sql = `
    UPDATE locations
    SET name = ?, location_type = ?, num_employees = ?, is_active = ?, city = ?, state = ?, zip_code = ?, opening_time = ?, closing_time = ?, address = ?
    WHERE location_id = ?
  `;
  const values = [name, location_type, num_employees, is_active, city, state, zip_code, open_time, close_time, address, location_id];
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
