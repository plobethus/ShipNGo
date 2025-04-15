// /ShipNGo/frontend/scripts/status.js
document.addEventListener("DOMContentLoaded", () => {
  // Update the current time yur super cool
  function updateTime() {
    const now = new Date();
    const options = { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit', 
      hour12: true 
    };
    const formattedDate = now.toLocaleDateString('en-US', options)
      .replace(/(\d+)\/(\d+)\/(\d+),\s(.*)/, '$3/$1/$2, $4')
      .toUpperCase();
    
    document.getElementById("time-display").textContent = formattedDate;
    document.getElementById("lastUpdated").textContent = now.toLocaleString();
  }
  updateTime();
  setInterval(updateTime, 1000); // Update every second
  
  // Show loader
  document.getElementById("loader").style.display = "flex";
  
  fetchStatusData();
});

async function fetchStatusData() {
  try {
    const res = await fetch("/status");
    if (!res.ok) {
      throw new Error("Failed to fetch status: " + res.statusText);
    }
    
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.message || "Unknown error");
    }
    
    const data = json.data;
    
    // Hide loader
    document.getElementById("loader").style.display = "none";
    
    // Update card numbers
    document.getElementById("shippedCount").textContent = data.shippedToday;
    document.getElementById("deliveredCount").textContent = data.deliveredToday;
    document.getElementById("activeCount").textContent = data.activeCount;
    document.getElementById("delayedCount").textContent = data.delayedCount;
    
    // Render charts
    renderShippedDeliveredChart(data.shippedToday, data.deliveredToday);
    renderActiveDelayedChart(data.activeCount, data.delayedCount);
    
    // Populate tables
    populateTable("tableOrigins", data.topOrigins);
    populateTable("tableDestinations", data.topDestinations);
    
  } catch (err) {
    console.error("Error loading status:", err);
    document.getElementById("loader").style.display = "none";
    document.getElementById("errorMessage").style.display = "block";
    document.getElementById("errorMessage").textContent = "Error: " + err.message;
  }
}

function renderShippedDeliveredChart(shipped, delivered) {
  const ctx = document.getElementById("chartShippedDelivered").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Shipped Today", "Delivered Today"],
      datasets: [{
        label: "Package Count",
        data: [shipped, delivered],
        backgroundColor: [
          "rgba(26, 115, 232, 0.8)",
          "rgba(67, 160, 71, 0.8)"
        ],
        borderColor: [
          "rgba(26, 115, 232, 1)",
          "rgba(67, 160, 71, 1)"
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            display: true,
            color: "rgba(0, 0, 0, 0.05)"
          },
          ticks: {
            precision: 0
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });
}

function renderActiveDelayedChart(active, delayed) {
  const ctx = document.getElementById("chartActiveDelayed").getContext("2d");
  new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["In Transit", "Delayed / Delivery Attempted"],
      datasets: [{
        label: "Package Status",
        data: [active, delayed],
        backgroundColor: [
          "rgba(79, 195, 247, 0.8)",
          "rgba(255, 152, 0, 0.8)"
        ],
        borderColor: [
          "rgba(79, 195, 247, 1)",
          "rgba(255, 152, 0, 1)"
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: false
        }
      },
      layout: {
        padding: {
          left: 25,
          right: 25,
          top: 10,
          bottom: 10
        }
      }
    }
  });
}

function populateTable(tableId, rows) {
  const tbody = document.querySelector(`#${tableId} tbody`);
  if (!tbody) return;
  
  tbody.innerHTML = "";
  
  if (!rows || rows.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="2">No data available</td>`;
    tbody.appendChild(tr);
    return;
  }
  
  rows.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.name || "N/A"}</td>
      <td>${row.count}</td>
    `;
    tbody.appendChild(tr);
  });
}