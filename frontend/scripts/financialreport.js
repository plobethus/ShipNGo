console.log("financialreport.js script is loaded and running...");

document.addEventListener("DOMContentLoaded", async function () {
  // 1 Packages

  let packageData = [];

  try {
    const sumRes = await fetch("/api/claims/sumpackage");
    if (!sumRes.ok) {
      throw new Error(`Package sum error: ${sumRes.status}`);
    }
    const sumData = await sumRes.json();
    let packageTotal = 0;
    if (Array.isArray(sumData)) {
      if (sumData.length > 0 && sumData[0].cost != null) {
        packageTotal = sumData[0].cost;
      }
    } else if (sumData && sumData.cost != null) {
      packageTotal = sumData.cost;
    }
    const pkgTotalEl = document.getElementById("package-total-container");
    if (pkgTotalEl) {
      pkgTotalEl.innerHTML = `
        <h3 style="margin-right:150px;">
          Package Total Cost: $${Number(packageTotal).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </h3>
      `;
    }
  } catch (err) {
    console.error("Error fetching package total:", err);
  }

  try {
    const transRes = await fetch("/api/claims/transpackage");
    if (!transRes.ok) {
      throw new Error(`Package transactions error: ${transRes.status}`);
    }
    packageData = await transRes.json();
    console.log("Fetched packageData:", packageData);
    renderPackageTransactions(packageData);
  } catch (err) {
    console.error("Error fetching package transactions:", err);
  }

  const pkgNameInput = document.getElementById("filter-package-name");
  const pkgWeightInput = document.getElementById("filter-weight");
  const pkgDimInput = document.getElementById("filter-dim");
  const pkgClassInput = document.getElementById("filter-class");
  const pkgCostInput = document.getElementById("filter-cost");

  function filterAndRenderPackages() {
    const nameVal = (pkgNameInput?.value || "").trim().toLowerCase();
    const weightVal = (pkgWeightInput?.value || "").trim().toLowerCase();
    const dimVal = (pkgDimInput?.value || "").trim().toLowerCase();
    const classVal = (pkgClassInput?.value || "").trim().toLowerCase();
    const costVal = (pkgCostInput?.value || "").trim();

    const filtered = packageData.filter(pkg => {
      const matchName = nameVal === "" || (pkg.name && pkg.name.toLowerCase().includes(nameVal));
      const matchWeight = weightVal === "" || (pkg.weight && pkg.weight.toString().toLowerCase().includes(weightVal));
      const matchDim = dimVal === "" || (pkg.dimensions && pkg.dimensions.toLowerCase().includes(dimVal));
      const matchClass = classVal === "" || (pkg.shipping_class && pkg.shipping_class.toLowerCase().includes(classVal));

      let matchCost = true;
      if (costVal) {
        const costNum = parseFloat(costVal);
        if (!isNaN(costNum) && pkg.cost != null) {
          matchCost = Number(pkg.cost) <= costNum;
        } else {
          matchCost = false;
        }
      }
      return matchName && matchWeight && matchDim && matchClass && matchCost;
    });
    renderPackageTransactions(filtered);
  }

  pkgNameInput?.addEventListener("input", filterAndRenderPackages);
  pkgWeightInput?.addEventListener("input", filterAndRenderPackages);
  pkgDimInput?.addEventListener("input", filterAndRenderPackages);
  pkgClassInput?.addEventListener("input", filterAndRenderPackages);
  pkgCostInput?.addEventListener("input", filterAndRenderPackages);

  function renderPackageTransactions(list) {
    const tableBody = document.getElementById("package-table");
    if (!tableBody) return;

    tableBody.innerHTML = "";
    if (list.length > 0) {
      list.sort((a, b) => {
        if (a.created_at && b.created_at) {
          return new Date(b.created_at) - new Date(a.created_at);
        }
        return (b.package_id || 0) - (a.package_id || 0);
      });
      const recent = list.slice(0, 10);
      recent.forEach(pkg => {
        let dateCell = "";
        if (pkg.created_at) {
          dateCell = new Date(pkg.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
          });
        }
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${pkg.package_id || ""}</td>
          <td>${pkg.name || ""}</td>
          <td>${pkg.weight || ""}</td>
          <td>${pkg.dimensions || ""}</td>
          <td>${pkg.shipping_class || ""}</td>
          <td>$${pkg.cost || ""}</td>
          <td>${dateCell}</td>
        `;
        tableBody.appendChild(row);
      });
    } else {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No package transactions available</td></tr>`;
    }
  }

  // 2 Supply transactions
  let supplyData = [];

  try {
    const supplySumRes = await fetch("/api/claims/sum");
    if (!supplySumRes.ok) {
      throw new Error(`Supply sum error: ${supplySumRes.status}`);
    }
    const sumData = await supplySumRes.json();
    let supplyTotal = 0;
    if (Array.isArray(sumData)) {
      if (sumData.length > 0 && sumData[0].total_sum != null) {
        supplyTotal = sumData[0].total_sum;
      }
    } else if (sumData && sumData.total_sum != null) {
      supplyTotal = sumData.total_sum;
    }
    const supTotalEl = document.getElementById("supply-total-container");
    if (supTotalEl) {
      supTotalEl.innerHTML = `
        <h3 style="margin-right:150px;">
          Supply Total Cost: $${Number(supplyTotal).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </h3>
      `;
    }
  } catch (err) {
    console.error("Error fetching supply total:", err);
  }

  try {
    const supplyTransRes = await fetch("/api/claims/trans");
    if (!supplyTransRes.ok) {
      throw new Error(`Supply transactions error: ${supplyTransRes.status}`);
    }
    supplyData = await supplyTransRes.json();
    console.log("Fetched supplyData:", supplyData);
    renderSupplyTransactions(supplyData);
  } catch (err) {
    console.error("Error fetching supply transactions:", err);
  }

  const supNameInput = document.getElementById("filter-name");
  const supItemInput = document.getElementById("filter-item");
  const supDateInput = document.getElementById("filter-date");

  function filterSuppliesAndRender() {
    const nameVal = supNameInput?.value.trim().toLowerCase() || "";
    const itemVal = supItemInput?.value.trim().toLowerCase() || "";
    const dateVal = supDateInput?.value || "";

    const filtered = supplyData.filter(s => {
      const matchName = nameVal === "" || (s.name && s.name.toLowerCase().includes(nameVal));
      const matchCat = itemVal === "" || (s.category && s.category.toLowerCase().includes(itemVal));
      let matchDate = true;
      if (dateVal) {
        if (s.purchase_date) {
          const d = new Date(s.purchase_date);
          const isoDate = d.toISOString().split("T")[0];
          matchDate = isoDate === dateVal;
        } else {
          matchDate = false;
        }
      }
      return matchName && matchCat && matchDate;
    });
    renderSupplyTransactions(filtered);
  }

  supNameInput?.addEventListener("input", filterSuppliesAndRender);
  supItemInput?.addEventListener("input", filterSuppliesAndRender);
  supDateInput?.addEventListener("input", filterSuppliesAndRender);

  function renderSupplyTransactions(list) {
    const tableBody = document.getElementById("supply-table");
    if (!tableBody) return;

    tableBody.innerHTML = "";
    if (list.length > 0) {
      list.sort((a, b) => new Date(b.purchase_date) - new Date(a.purchase_date));
      const recent = list.slice(0, 10);
      recent.forEach(s => {
        const formatted = s.purchase_date
          ? new Date(s.purchase_date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric"
            })
          : "";
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${s.supply_transaction_id || ""}</td>
          <td>${s.name || ""}</td>
          <td>${s.category || ""}</td>
          <td>${s.quantity || ""}</td>
          <td>$${s.total_cost || ""}</td>
          <td>${formatted}</td>
        `;
        tableBody.appendChild(row);
      });
    } else {
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No supply transactions available</td></tr>`;
    }
  }

  // 3 Insurance transactions
  let insuranceData = [];

  try {
    const insSumRes = await fetch("/api/claims/suminsure");
    if (!insSumRes.ok) {
      throw new Error(`Insurance sum error: ${insSumRes.status}`);
    }
    const sumData = await insSumRes.json();
    let feeSum = 0;
    if (Array.isArray(sumData)) {
      if (sumData.length > 0 && sumData[0].insurance_fee != null) {
        feeSum = sumData[0].insurance_fee;
      }
    } else if (sumData && sumData.insurance_fee != null) {
      feeSum = sumData.insurance_fee;
    }
    const insTotalEl = document.getElementById("insurance-total-container");
    if (insTotalEl) {
      insTotalEl.innerHTML = `
        <h3 style="margin-right:150px;">
          Total Insurance Fee: $${Number(feeSum).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </h3>
      `;
    }
  } catch (err) {
    console.error("Error fetching insurance total:", err);
  }

  try {
    const insTransRes = await fetch("/api/claims/transinsure");
    if (!insTransRes.ok) {
      throw new Error(`Insurance transactions error: ${insTransRes.status}`);
    }
    insuranceData = await insTransRes.json();
    console.log("Fetched insuranceData:", insuranceData);
    renderInsuranceTransactions(insuranceData);
  } catch (err) {
    console.error("Error fetching insurance transactions:", err);
  }

  const insNameInput = document.getElementById("insurance-filter-name");
  const insFeeInput = document.getElementById("filter-fee");
  const insDateInput = document.getElementById("insurance-filter-date");

  function filterInsuranceAndRender() {
    const nameVal = insNameInput?.value.trim().toLowerCase() || "";
    const feeVal = insFeeInput?.value.trim().toLowerCase() || "";
    const dateVal = insDateInput?.value || "";

    const filtered = insuranceData.filter(i => {
      const matchName = nameVal === "" || (i.name && i.name.toLowerCase().includes(nameVal));
      const matchFee = feeVal === "" || (i.insured_fee != null && i.insured_fee.toString().toLowerCase().includes(feeVal));
      let matchDate = true;
      if (dateVal) {
        if (i.claim_date) {
          const d = new Date(i.claim_date);
          const isoDate = d.toISOString().split("T")[0];
          matchDate = isoDate === dateVal;
        } else {
          matchDate = false;
        }
      }
      return matchName && matchFee && matchDate;
    });
    renderInsuranceTransactions(filtered);
  }

  insNameInput?.addEventListener("input", filterInsuranceAndRender);
  insFeeInput?.addEventListener("input", filterInsuranceAndRender);
  insDateInput?.addEventListener("input", filterInsuranceAndRender);

  function renderInsuranceTransactions(list) {
    const tableBody = document.getElementById("insurance-table");
    if (!tableBody) return;

    tableBody.innerHTML = "";
    if (list.length > 0) {
      list.sort((a, b) => {
        if (a.claim_date && b.claim_date) {
          return new Date(b.claim_date) - new Date(a.claim_date);
        }
        return (b.insurance_id || 0) - (a.insurance_id || 0);
      });
      const recent = list.slice(0, 10);
      recent.forEach(ins => {
        const formatted = ins.claim_date
          ? new Date(ins.claim_date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric"
            })
          : "";
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${ins.insurance_id || ""}</td>
          <td>${ins.package_id || ""}</td>
          <td>${ins.name || ""}</td>
          <td>$${ins.insured_value || ""}</td>
          <td>$${ins.insured_fee || ""}</td>
          <td>${formatted}</td>
        `;
        tableBody.appendChild(row);
      });
    } else {
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No insurance transactions available</td></tr>`;
    }
  }

  // 4) bar chart over days of the week
  function getMondayOfCurrentWeek() {
    const now = new Date();
    // getDay(): 0=Sunday,1=Monday,2=Tue,...
    const day = now.getDay();
    // distance to Monday (1)
    const distance = (day + 6) % 7; 
    now.setHours(0, 0, 0, 0);
    now.setDate(now.getDate() - distance);
    return now;
  }

  function sameDay(d1, d2) {
    return d1.getFullYear()===d2.getFullYear() &&
           d1.getMonth()===d2.getMonth() &&
           d1.getDate()===d2.getDate();
  }

  function formatDayAndDate(d) {
    const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const dayName = days[d.getDay()];
    const opts = { month:"short", day:"numeric" };
    const datePart = d.toLocaleDateString("en-US", opts);
    return `${dayName} (${datePart})`;
  }

  function renderWeekSideBySide() {
    console.log("Rendering Monday->Sunday: 2 bars per day => stacked actual + single goal...");
    const mon = getMondayOfCurrentWeek();
    const week = [];
    for (let i=0; i<7; i++){
      const tmp = new Date(mon);
      tmp.setDate(tmp.getDate()+i);
      week.push({
        dateObj: tmp,
        packages: 0,
        supplies: 0,
        insurance: 0
      });
    }

    // 2) aggregator
    // packages
    packageData.forEach(pkg => {
      if (pkg.created_at && pkg.cost != null){
        const rowDate = new Date(pkg.created_at);
        for(let i=0; i<7; i++){
          if(sameDay(rowDate, week[i].dateObj)){
            week[i].packages += Number(pkg.cost);
            break;
          }
        }
      }
    });

    // supplies
    supplyData.forEach(s => {
      if(s.purchase_date && s.total_cost!=null){
        const rowDate = new Date(s.purchase_date);
        for(let i=0;i<7;i++){
          if(sameDay(rowDate, week[i].dateObj)){
            week[i].supplies += Number(s.total_cost);
            break;
          }
        }
      }
    });

    insuranceData.forEach(i => {
      if(i.claim_date && i.insured_fee!=null){
        const rowDate = new Date(i.claim_date);
        for(let d=0; d<7; d++){
          if(sameDay(rowDate, week[d].dateObj)){
            week[d].insurance += Number(i.insured_fee);
            break;
          }
        }
      }
    });

    const labels = [];
    const packagesArr = [];
    const suppliesArr = [];
    const insuranceArr = [];
    const goalArr = [];

    for(let i=0; i<7; i++){
      labels.push( formatDayAndDate(week[i].dateObj) );
      packagesArr.push( week[i].packages );
      suppliesArr.push( week[i].supplies );
      insuranceArr.push( week[i].insurance );
      goalArr.push( 500 );
    }

    const cvs = document.getElementById("weeklyRevenueChart");
    if(!cvs){
      console.error("No canvas with id=weeklyRevenueChart found!");
      return;
    }
    const ctx = cvs.getContext("2d");

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Packages",
            data: packagesArr,
            backgroundColor: "rgba(75, 192, 192, 0.7)", // teal
            stack: "actual" 
          },
          {
            label: "Supplies",
            data: suppliesArr,
            backgroundColor: "rgba(255, 206, 86, 0.7)", // yellow
            stack: "actual"
          },
          {
            label: "Insurance",
            data: insuranceArr,
            backgroundColor: "rgba(153, 102, 255, 0.7)", // purple
            stack: "actual"
          },
          {
            label: "$500 Goal",
            data: goalArr,
            backgroundColor: "rgba(255, 99, 132, 0.7)", // pink
            stack: "goal"
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            // side-by-side 2 columns: 1 "actual" stacked bar + 1 "goal" bar
            stacked: false,
            title: { display: true, text: "Date" }
          },
          y: {
            beginAtZero: true,
            stacked: false, 
            title: { display: true, text: "Dollar Amount" },
            ticks: {
              callback: value => `$${value}`
            }
          }
        },
        plugins: {
          legend: { position: "top" }
        }
      }
    });
  }

  setTimeout(() => {
    console.log("Rendering 7 days => stacked actual bar + separate goal bar...");
    renderWeekSideBySide();
  }, 1500);
});
