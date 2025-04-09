/*
* /ShipNGo/backend/controllers/authController.js
*/

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
  const bcrypt = require("bcryptjs");
  const jwt = require("jsonwebtoken");
  
  async function login(email, password) {
    // Check both customers and employees
    const [customerRows] = await db.execute(
      "SELECT customer_id AS id, name, password, 'customer' AS role FROM customers WHERE email = ?",
      [email]
    );
    const [employeeRows] = await db.execute(
      "SELECT employee_id AS id, name, password, 'employee' AS role FROM employees WHERE email = ?",
      [email]
    );
    const rows = customerRows.length ? customerRows : employeeRows;
    if (rows.length === 0) {
      throw new Error("Invalid email or password");
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new Error("Invalid email or password");
    }
    const token = jwt.sign(
      user.role === "customer"
        ? { customer_id: user.id, role: "customer", name: user.name }
        : { employee_id: user.id, role: "employee", name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    return { token, role: user.role, name: user.name };
  }
  
  async function register(email, password, address, name, phone) {
    if (password.length < 8 || password.length > 15) {
      throw new Error("Password must be between 8 and 15 characters");
    }
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      "INSERT INTO customers (name, address, phone, email, password) VALUES (?, ?, ?, ?, ?)",
      [name, address, phone, email, hashed]
    );
    const token = jwt.sign(
      { customer_id: result.insertId, role: "customer", name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    return { token, role: "customer", name };
  }
  
  function authMe(tokenData) {
    // tokenData is the verified JWT payload
    if (!tokenData) {
      throw new Error("Invalid or missing token");
    }
    return { role: tokenData.role, name: tokenData.name };
  }
  
  module.exports = {
    login,
    register,
    authMe
  };