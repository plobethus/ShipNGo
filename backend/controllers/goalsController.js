// ShipNGo/backend/controllers/goalsController.js

const { readJsonBody, sendJson } = require("../helpers");
const pool = require("../db");

async function getAllGoals(req, res) {
  try {
    const [rows] = await pool.query("SELECT * FROM business_goals");
    return sendJson(res, 200, { success: true, data: rows });
  } catch (err) {
    console.error("Error in getAllGoals:", err);
    return sendJson(res, 500, { success: false, message: err.message });
  }
}

async function createGoal(req, res) {
  try {
    const body = await readJsonBody(req);
    const { goalName, description, targetValue } = body;

    // Ensure all necessary fields are provided.
    if (!goalName || !description || typeof targetValue === "undefined") {
      return sendJson(res, 400, {
        success: false,
        message: "Missing required fields: goalName, description, targetValue",
      });
    }

    const sql = `
      INSERT INTO business_goals (goal_name, description, target_value)
      VALUES (?, ?, ?)
    `;
    const [result] = await pool.query(sql, [goalName, description, targetValue]);

    return sendJson(res, 200, {
      success: true,
      message: "Business goal created successfully",
      goalId: result.insertId,
    });
  } catch (err) {
    console.error("Error in createGoal:", err);
    return sendJson(res, 500, { success: false, message: err.message });
  }
}

module.exports = { getAllGoals, createGoal };