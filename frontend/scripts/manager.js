//ShipNGo/frontend/scripts/manager.js

document.addEventListener("DOMContentLoaded", async function () {
    try {
      const response = await fetch("/api/claims");
      const data = await response.json();
  
      const tableBody = document.getElementById("package-table");
      tableBody.innerHTML = ""; // Clear any existing rows
  
      if (data && data.length > 0) {
        data.forEach(claim => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${claim.ticket_id || ""}</td>
            <td>${claim.issue_type || ""}</td>
            <td>${claim.processed_date || ""}</td>
            <td>${claim.phone_number || ""}</td>
            <td>${claim.email || ""}</td>
            <td>${claim.reason || ""}</td>
            <td>${claim.first_name || ""}</td>
            <td>${claim.last_name || ""}</td>
            <td>${claim.customer_id || ""}</td>
            <td>${claim.refund_status || ""}</td>
          `;
          tableBody.appendChild(row);
        });
      } else {
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="10" style="text-align:center;">No claims available</td>`;
        tableBody.appendChild(row);
      }
    } catch (err) {
      console.error("Error loading claims:", err);
    }
  });
  