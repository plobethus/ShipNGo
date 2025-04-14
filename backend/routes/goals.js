// ShipNGo/backend/routes/goals.js

const { getAllGoals, createGoal } = require("../controllers/goalsController");

async function getGoals(req, res) {
  await getAllGoals(req, res);
}

async function postGoals(req, res) {
  await createGoal(req, res);
}

module.exports = {
  getGoals,
  postGoals,
};