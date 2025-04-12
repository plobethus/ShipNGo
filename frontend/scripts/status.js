// /ShipNGo/frontend/scripts/status.js
document.addEventListener("DOMContentLoaded", () => {
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

      renderShippedDeliveredChart(data.shippedToday, data.deliveredToday);
      renderActiveDelayedChart(data.activeCount, data.delayedCount);

      populateTable("tableOrigins", data.topOrigins);
      populateTable("tableDestinations", data.topDestinations);
  
    } catch (err) {
      console.error("Error loading status:", err);
      alert("Error: " + err.message);
    }
  }
  
  function renderShippedDeliveredChart(shipped, delivered) {
    const ctx = document.getElementById("chartShippedDelivered").getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Shipped Today", "Delivered Today"],
        datasets: [{
          label: "Today's Movement",
          data: [shipped, delivered],
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
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
          label: "Active vs Delayed",
          data: [active, delayed]
        }]
      },
      options: {
        responsive: true
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
  