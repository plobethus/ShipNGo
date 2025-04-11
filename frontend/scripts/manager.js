document.addEventListener("DOMContentLoaded", async function () {
    try {
      const sumResponse = await fetch("/api/claims/sum");
      const sumData = await sumResponse.json(); 
      
      // Access the container where you want to show the total revenue
      const totalContainer = document.getElementById("total-container");
  
      if (Array.isArray(sumData) && sumData.length > 0) {
        const totalRevenue = sumData[0].total_sum || 0;
        totalContainer.textContent = `Total Revenue: $${totalRevenue}`;
      } else if (sumData && sumData.total_sum !== undefined) {
        totalContainer.textContent = `Total Revenue: $${sumData.total_sum}`;
      } else {
        totalContainer.textContent = "Total Revenue: $0";
      }
    } catch (err) {
      console.error("Error fetching sum of transactions:", err);
    }
  
    try {
      const response = await fetch("/api/claims/");
      const data = await response.json();
  
      const tableBody = document.getElementById("complaint-table");
      tableBody.innerHTML = ""; 
  
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
  