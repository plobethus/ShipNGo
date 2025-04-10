/*
* /ShipNGo/backend/routes/auth.js
*/

const path = require("path");
const { sendJson, serveFile}  = require("../helpers");
const authController = require("../controllers/authController");

async function login(req, res) {
  try {
    const body = await require("../helpers").readJsonBody(req);
    const { email, password } = body;
    const result = await authController.login(email, password);
    res.setHeader("Set-Cookie", `token=${result.token}; HttpOnly; Secure; SameSite=None; Path=/`);
    sendJson(res, 200, { message: "Login successful", role: result.role, name: result.name });
  } catch (err) {
    sendJson(res, 401, { message: err.message });
  }
}

async function register(req, res) {
  try {
    const body = await require("../helpers").readJsonBody(req);
    const { email, password, address, name, phone } = body;
    const result = await authController.register(email, password, address, name, phone);
    res.setHeader("Set-Cookie", `token=${result.token}; HttpOnly; Secure; SameSite=None; Path=/`);
    sendJson(res, 201, { message: "Registration successful" });
  } catch (err) {
    sendJson(res, 400, { message: err.message });
  }
}

async function authMe(req, res) {
  const { verifyToken, sendJson } = require("../helpers");
  const tokenData = verifyToken(req);
  try {
    const result = authController.authMe(tokenData);
    sendJson(res, 200, result);
  } catch (err) {
    sendJson(res, 401, { message: err.message });
  }
}


module.exports = {
  login,
  register,
  authMe,
};