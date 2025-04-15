let inventoryData = {};
let originalInventoryData = {};

// Set all target stocks to 1000
const targetStock = {
  'Envelope': 1000,
  'Box': 1000,
  'Tape': 1000,
  'Stamps': 1000,
  'Labels': 1000
};

document.addEventListener("DOMContentLoaded", function () {
  fetchInventoryData();

  document.querySelectorAll(".stock-update").forEach(button => {
    button.addEventListener("click", stockUpdateHandler);
  });

  document.getElementById("refresh-inventory").addEventListener("click", fetchInventoryData);
  document.getElementById("save-changes").addEventListener("click", saveChanges);
  document.getElementById("generate-report").addEventListener("click", generateReport);
});

async function fetchInventoryData() {
  try {
    const res = await fetch("/api/stocks");
    if (!res.ok) throw new Error("Failed to fetch stock data");
    const data = await res.json();

    data.forEach(item => {
      inventoryData[item.id] = item.available;
      originalInventoryData[item.id] = item.available;
    });

    updateInventoryDisplay();
    updateInventoryChart();
    updateInventorySummary();
    updateLowStockAlerts();
  } catch (err) {
    console.error("Error fetching stock data:", err);
  }
}

function updateInventoryDisplay() {
  document.querySelectorAll(".inventory-item").forEach(card => {
    const name = card.dataset.name;
    const stockSpan = card.querySelector(".stock-count");
    if (stockSpan && inventoryData[name] !== undefined) {
      stockSpan.textContent = inventoryData[name];
    }
  });
}

function updateInventoryChart() {
  for (let item in targetStock) {
    const percent = Math.min((inventoryData[item] / targetStock[item]) * 100, 100);
    const bar = document.getElementById(`${item.toLowerCase()}-bar`);
    const percentText = document.getElementById(`${item.toLowerCase()}-percent`);
    if (bar && percentText) {
      bar.style.width = `${percent}%`;
      percentText.textContent = `${Math.floor(percent)}%`;
    }
  }
}

function updateInventorySummary() {
  let total = Object.values(inventoryData).reduce((acc, val) => acc + val, 0);
  document.getElementById("total-inventory").textContent = total;
}

function updateLowStockAlerts() {
  const list = document.getElementById("low-stock-list");
  list.innerHTML = "";
  const threshold = 100; // Low stock threshold
  for (let item in inventoryData) {
    if (inventoryData[item] < threshold) {
      const li = document.createElement("li");
      li.textContent = `${item} is low: ${inventoryData[item]} remaining`;
      list.appendChild(li);
    }
  }
}

function stockUpdateHandler(e) {
  const button = e.target;
  const item = button.dataset.item;
  const action = button.dataset.action;
  const input = document.getElementById(`${item.toLowerCase()}-quantity`);
  let qty = parseInt(input.value, 10);
  if (isNaN(qty) || qty < 1) qty = 1;

  if (action === "add") {
    inventoryData[item] = (inventoryData[item] || 0) + qty;
  } else if (action === "remove") {
    inventoryData[item] = Math.max((inventoryData[item] || 0) - qty, 0);
  }

  input.value = "";

  updateInventoryDisplay();
  updateInventoryChart();
  updateInventorySummary();
  updateLowStockAlerts();
}

async function saveChanges() {
  const updates = [];

  for (let item in inventoryData) {
    const original = originalInventoryData[item] || 0;
    const current = inventoryData[item];
    const diff = current - original;
    if (diff !== 0) {
      updates.push({ category: item, change: diff });
    }
  }

  if (updates.length === 0) {
    alert("No changes to save.");
    return;
  }

  try {
    const res = await fetch("/api/restock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates })
    });

    if (res.ok) {
      alert("Inventory changes saved successfully!");
      fetchInventoryData(); // Refresh everything after saving
    } else {
      alert("Failed to save inventory changes.");
    }
  } catch (err) {
    console.error("Save error:", err);
    alert("Error saving changes.");
  }
}

function generateReport() {
  let report = "Inventory Report:\n\n";
  for (let item in inventoryData) {
    report += `${item}: ${inventoryData[item]} units\n`;
  }

  let lowStock = Object.entries(inventoryData)
    .filter(([_, val]) => val < 100)
    .map(([item, val]) => `${item} (${val})`)
    .join("\n") || "None";

  report += `\nLow Stock Items:\n${lowStock}`;

  alert(report);
}
