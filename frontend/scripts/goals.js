// ShipNGo/frontend/scripts/goals.js

document.addEventListener("DOMContentLoaded", () => {
    fetchAllGoals();
  
    const form = document.getElementById("goalForm");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      createGoal();
    });
  });
  
  /**
   * Fetches all existing business goals from the server.
   */
  async function fetchAllGoals() {
    try {
      const res = await fetch("/goals"); // this route returns the list of goals
      if (!res.ok) throw new Error("Failed to fetch goals: " + res.statusText);
  
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
  
      renderGoals(json.data);
    } catch (error) {
      console.error("Error fetching goals:", error.message);
      alert("Error: " + error.message);
    }
  }
  
  /**
   * Renders the business goals in the table.
   */
  function renderGoals(goals) {
    const tbody = document.querySelector("#goalsTable tbody");
    if (!tbody) return;
  
    tbody.innerHTML = ""; // Clear existing rows
  
    if (!goals || goals.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="3">No business goals set.</td>`;
      tbody.appendChild(tr);
      return;
    }
  
    goals.forEach((goal) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${goal.goal_name}</td>
        <td>${goal.description}</td>
        <td>${goal.target_value}</td>
      `;
      tbody.appendChild(tr);
    });
  }
  
  /**
   * Sends a request to create a new business goal.
   */
  async function createGoal() {
    try {
      const goalName = document.getElementById("goalName").value.trim();
      const description = document.getElementById("description").value.trim();
      const targetValue = parseFloat(document.getElementById("targetValue").value);
  
      const res = await fetch("/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalName, description, targetValue }),
      });
  
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to create goal");
      }
  
      // Clear the form fields
      document.getElementById("goalForm").reset();
      // Refresh the goals table
      fetchAllGoals();
      alert("Goal created successfully!");
    } catch (error) {
      console.error("Error creating goal:", error.message);
      alert("Error: " + error.message);
    }
  }