// /backend/controllers/postOfficeController.js
const db = require("mysql2").createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: true },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  }).promise();
  
  async function getAllPostOffices() {
    const [rows] = await db.execute("SELECT * FROM postoffices");
    return rows;
  }
  
  async function getPostOfficeById(post_id) {
    const [rows] = await db.execute("SELECT * FROM postoffices WHERE post_id = ?", [post_id]);
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
    const [result] = await db.execute("DELETE FROM postoffices WHERE post_id = ?", [post_id]);
    return result.affectedRows;
  }
  
  module.exports = {
    getAllPostOffices,
    getPostOfficeById,
    createPostOffice,
    deletePostOffice
  };
  