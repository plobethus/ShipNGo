document.addEventListener("DOMContentLoaded", async function () {
    try {
      const sumResponse = await fetch("/api/claims/sum");
      if (!sumResponse.ok) {
        throw new Error(`Failed to fetch total revenue. Status: ${sumResponse.status}`);
      }
      const sumData = await sumResponse.json();
    
      let totalRevenue = 0;
      if (Array.isArray(sumData)) {
        if (sumData.length > 0 && sumData[0].total_sum != null) {
          totalRevenue = sumData[0].total_sum;
        }
      } else if (sumData && sumData.total_sum != null) {
        totalRevenue = sumData.total_sum;
      }
    
      const salesColor = totalRevenue >= 2000 ? "lightgreen" : "lightcoral";
      const totalContainer = document.getElementById("total-container");
      if (totalContainer) {
        totalContainer.innerHTML = `
          <h3 style="color: ${salesColor}; margin-right:150px;">
            Total Revenue: $${Number(totalRevenue).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </h3>
          <h3>Sales Quota: $2000.00</h3>
        `;
      }
    } catch (error) {
      console.error("Error fetching total revenue:", error);
    }
    
    
    let allTransactions = [];
    
    try {
      const transResponse = await fetch("/api/claims/trans");
      if (!transResponse.ok) {
        throw new Error(`Failed to fetch transactions. Status: ${transResponse.status}`);
      }
      allTransactions = await transResponse.json();
      
      
      renderTransactions(allTransactions);
      
      
      createBarChart(allTransactions);
      
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
    
    //filtering
    const filterNameInput = document.getElementById("filter-name");
    const filterItemInput = document.getElementById("filter-item");
    const filterDateInput = document.getElementById("filter-date");
    
    function filterAndRenderTransactions() {
      const filterName = filterNameInput ? filterNameInput.value.trim().toLowerCase() : "";
      const filterItem = filterItemInput ? filterItemInput.value.trim().toLowerCase() : "";
      const filterDate = filterDateInput ? filterDateInput.value.trim() : ""; // Format: YYYY-MM-DD
      
      const filtered = allTransactions.filter(transaction => {
        const matchName = filterName === "" || (transaction.name && transaction.name.toLowerCase().includes(filterName));
        const matchItem = filterItem === "" || (transaction.category && transaction.category.toLowerCase().includes(filterItem));
        let matchDate = true;
        if (filterDate !== "") {
          if (transaction.purchase_date) {
            const d = new Date(transaction.purchase_date);
            const isoDate = d.toISOString().split("T")[0];
            matchDate = isoDate === filterDate; 
          } else {
            matchDate = false;
          }
        }
        return matchName && matchItem && matchDate;
      });
      renderTransactions(filtered);
    }
    
    if (filterNameInput) {
      filterNameInput.addEventListener("input", filterAndRenderTransactions);
    }
    if (filterItemInput) {
      filterItemInput.addEventListener("input", filterAndRenderTransactions);
    }
    if (filterDateInput) {
      filterDateInput.addEventListener("input", filterAndRenderTransactions);
    }
    
    function renderTransactions(transactions) {
      const financeTableBody = document.getElementById("finance-table");
      if (financeTableBody) {
        financeTableBody.innerHTML = "";
        if (transactions.length > 0) {
          transactions.forEach(transaction => {
            const formattedDate = transaction.purchase_date 
              ? new Date(transaction.purchase_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })
              : "";
            const row = document.createElement("tr");
            row.innerHTML = `
              <td>${transaction.supply_transaction_id || ""}</td>
              <td>${transaction.name || ""}</td>
              <td>${transaction.category || ""}</td>
              <td>${transaction.quantity || ""}</td>
              <td>$${transaction.total_cost || ""}</td>
              <td>${formattedDate}</td>
            `;
            financeTableBody.appendChild(row);
          });
        } else {
          financeTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No transactions available</td></tr>`;
        }
      }
    }
    
    function createBarChart(transactions) {
      const aggregates = {};
      transactions.forEach((transaction) => {
        const supplyItem = transaction.category; 
        const qty = Number(transaction.quantity) || 0;
        if (supplyItem) {
          aggregates[supplyItem] = (aggregates[supplyItem] || 0) + qty;
        }
      });
    
      const labels = Object.keys(aggregates);
      const dataValues = Object.values(aggregates);
    
      const canvasEl = document.getElementById("myBarChart");
      if (!canvasEl) {
        console.error('Canvas element with id "myBarChart" not found.');
        return;
      }
      const ctx = canvasEl.getContext("2d");
    
      // Create the bar chart.
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [{
            label: "Total Amount Ordered",
            data: dataValues,
            backgroundColor: "rgba(54, 162, 235, 0.6)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 0,
            barThickness: 100 
          }],
        },
        options: {
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
                color: "white"
              },
              grid: {
                color: "rgba(255,255,255,0.2)"
              }
            },
            x: {
              ticks: {
                color: "white"
              },
              grid: {
                color: "rgba(255,255,255,0.2)"
              }
            },
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    }
  });
  