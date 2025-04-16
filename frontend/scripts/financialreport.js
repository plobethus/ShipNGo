document.addEventListener("DOMContentLoaded", async function () {
    // ================================
    // A) LOCAL STATE (NO GLOBAL VARIABLES)
    // ================================
    let packageData = [];
    let filteredPackages = [];
    let supplyData = [];
    let filteredSupplies = [];
  
    let weekOffset = 0;  // 0 => current week; +1 => next, -1 => previous, etc.
    let showPackages = true;
    let showSupplies = true;
  
    // ================================
    // B) FETCH & RENDER: PACKAGES
    // ================================
  
    // 1) Fetch package total
    try {
      const pkgSumRes = await fetch("/api/claims/sumpackage");
      if (!pkgSumRes.ok) throw new Error(`Package sum error: ${pkgSumRes.status}`);
      const pkgSumData = await pkgSumRes.json();
      let packageTotal = 0;
      if (Array.isArray(pkgSumData) && pkgSumData.length > 0 && pkgSumData[0].cost != null) {
        packageTotal = pkgSumData[0].cost;
      } else if (pkgSumData && pkgSumData.cost != null) {
        packageTotal = pkgSumData.cost;
      }
      const pkgTotalEl = document.getElementById("package-total-container");
      if (pkgTotalEl) {
        pkgTotalEl.innerHTML = `
          <h3 style="margin-right:150px;">
            Packages Total Cost: $${Number(packageTotal).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </h3>
        `;
      }
    } catch (err) {
      console.error("Error fetching package total:", err);
    }
  
    // 2) Fetch package transactions
    try {
      const pkgTransRes = await fetch("/api/claims/transpackage");
      if (!pkgTransRes.ok) throw new Error(`Package transactions error: ${pkgTransRes.status}`);
      packageData = await pkgTransRes.json();
      filteredPackages = [...packageData];
      renderPackageTransactions(filteredPackages);
    } catch (err) {
      console.error("Error fetching package transactions:", err);
    }
  
    // 3) Package filters
    const pkgNameInput   = document.getElementById("filter-package-name");
    const pkgWeightInput = document.getElementById("filter-weight");
    const pkgDimInput    = document.getElementById("filter-dim");
    const pkgClassInput  = document.getElementById("filter-class");
    const pkgCostInput   = document.getElementById("filter-cost");
  
    function filterPackagesAndRender() {
      const nameVal   = (pkgNameInput?.value || "").trim().toLowerCase();
      const weightVal = (pkgWeightInput?.value||"").trim().toLowerCase();
      const dimVal    = (pkgDimInput?.value||"").trim().toLowerCase();
      const classVal  = (pkgClassInput?.value||"").trim().toLowerCase();
      const costVal   = (pkgCostInput?.value||"").trim();
  
      filteredPackages = packageData.filter(pkg => {
        const matchName   = nameVal   === "" || (pkg.name && pkg.name.toLowerCase().includes(nameVal));
        const matchWeight = weightVal === "" || (pkg.weight && pkg.weight.toString().toLowerCase().includes(weightVal));
        const matchDim    = dimVal    === "" || (pkg.dimensions && pkg.dimensions.toLowerCase().includes(dimVal));
        const matchClass  = classVal  === "" || (pkg.shipping_class && pkg.shipping_class.toLowerCase().includes(classVal));
  
        let matchCost = true;
        if (costVal) {
          const threshold = parseFloat(costVal);
          if (!isNaN(threshold) && pkg.cost != null) {
            matchCost = Number(pkg.cost) <= threshold;
          } else {
            matchCost = false;
          }
        }
        return matchName && matchWeight && matchDim && matchClass && matchCost;
      });
      renderPackageTransactions(filteredPackages);
      updateChart();
    }
  
    [pkgNameInput, pkgWeightInput, pkgDimInput, pkgClassInput, pkgCostInput].forEach(el => {
      if (el) el.addEventListener("input", filterPackagesAndRender);
    });
  
    function renderPackageTransactions(list) {
      const tableBody = document.getElementById("package-table");
      if (!tableBody) return;
      tableBody.innerHTML = "";
      if (list.length > 0) {
        list.sort((a,b)=>{
          if (a.created_at && b.created_at) return new Date(b.created_at) - new Date(a.created_at);
          return (b.package_id||0) - (a.package_id||0);
        });
        const recent = list.slice(0,10);
        recent.forEach(pkg=>{
          const row=document.createElement("tr");
          let dateCell="";
          if(pkg.created_at){
            dateCell=new Date(pkg.created_at).toLocaleDateString("en-US",{
              year:"numeric", month:"short", day:"numeric"
            });
          }
          row.innerHTML=`
            <td>${pkg.package_id||""}</td>
            <td>${pkg.name||""}</td>
            <td>${pkg.weight||""}</td>
            <td>${pkg.dimensions||""}</td>
            <td>${pkg.shipping_class||""}</td>
            <td>$${pkg.cost||""}</td>
            <td>${dateCell}</td>
          `;
          tableBody.appendChild(row);
        });
      } else {
        tableBody.innerHTML=`<tr><td colspan="7" style="text-align:center;">No package transactions available</td></tr>`;
      }
    }
  
    // ================================
    // C) FETCH & RENDER: SUPPLIES
    // ================================
    try {
      // fetch supplies total
      const supSumRes = await fetch("/api/claims/sum");
      if (!supSumRes.ok) throw new Error(`Supply sum error: ${supSumRes.status}`);
      const supSumData = await supSumRes.json();
      let supplyTotal = 0;
      if (Array.isArray(supSumData) && supSumData.length>0 && supSumData[0].total_sum!=null) {
        supplyTotal = supSumData[0].total_sum;
      } else if (supSumData && supSumData.total_sum!=null) {
        supplyTotal = supSumData.total_sum;
      }
      const supTotalEl = document.getElementById("supply-total-container");
      if (supTotalEl) {
        supTotalEl.innerHTML=`
          <h3 style="margin-right:150px;">
            Supplies Total Cost: $${Number(supplyTotal).toLocaleString(undefined,{
              minimumFractionDigits:2, maximumFractionDigits:2
            })}
          </h3>
        `;
      }
    } catch(err){
      console.error("Error fetching supplies total:", err);
    }
  
    try {
      // fetch all supplies
      const supTransRes=await fetch("/api/claims/trans");
      if(!supTransRes.ok) throw new Error(`Supply transactions error: ${supTransRes.status}`);
      supplyData=await supTransRes.json();
      filteredSupplies=[...supplyData];
      renderSupplyTransactions(filteredSupplies);
    } catch(err){
      console.error("Error fetching supply transactions:",err);
    }
  
    // (C) Supplies filtering
    const supNameInput=document.getElementById("filter-name");
    const supItemInput=document.getElementById("filter-item");
    const supDateInput=document.getElementById("filter-date");
  
    function filterSuppliesAndRender(){
      const nameVal = supNameInput?.value.trim().toLowerCase()||"";
      const itemVal = supItemInput?.value.trim().toLowerCase()||"";
      const dateVal = supDateInput?.value||"";
  
      filteredSupplies = supplyData.filter(s=>{
        const matchName = nameVal==="" || (s.name && s.name.toLowerCase().includes(nameVal));
        const matchCat  = itemVal==="" || (s.category && s.category.toLowerCase().includes(itemVal));
        let matchDate=true;
        if(dateVal){
          if(s.purchase_date){
            const d=new Date(s.purchase_date);
            const isoDate=d.toISOString().split("T")[0];
            matchDate=(isoDate===dateVal);
          } else {
            matchDate=false;
          }
        }
        return matchName&&matchCat&&matchDate;
      });
      renderSupplyTransactions(filteredSupplies);
      updateChart();
    }
  
    [supNameInput, supItemInput, supDateInput].forEach(el => {
      if(el) el.addEventListener("input", filterSuppliesAndRender);
    });
  
    function renderSupplyTransactions(list){
      const tableBody=document.getElementById("supply-table");
      if(!tableBody)return;
      tableBody.innerHTML="";
      if(list.length>0){
        list.sort((a,b)=>new Date(b.purchase_date)-new Date(a.purchase_date));
        const recent=list.slice(0,10);
        recent.forEach(s=>{
          const row=document.createElement("tr");
          let dateCell="";
          if(s.purchase_date){
            dateCell=new Date(s.purchase_date).toLocaleDateString("en-US",{
              year:"numeric", month:"short", day:"numeric"
            });
          }
          row.innerHTML=`
            <td>${s.supply_transaction_id||""}</td>
            <td>${s.name||""}</td>
            <td>${s.category||""}</td>
            <td>${s.quantity||""}</td>
            <td>$${s.total_cost||""}</td>
            <td>${dateCell}</td>
          `;
          tableBody.appendChild(row);
        });
      } else {
        tableBody.innerHTML=`<tr><td colspan="6" style="text-align:center;">No supply transactions available</td></tr>`;
      }
    }
  
    // ================================
    // 4) WEEK NAV + CHART AGGREGATION
    // ================================
    function getMondayOfOffset(offset){
      const now=new Date();
      const day=now.getDay(); // 0=Sun,1=Mon,2=Tue...
      const distance=(day+6)%7;
      now.setHours(0,0,0,0);
      now.setDate(now.getDate()-distance);
      now.setDate(now.getDate()+offset*7);
      return now;
    }
  
    function sameDay(d1,d2){
      return d1.getFullYear()===d2.getFullYear() &&
             d1.getMonth()===d2.getMonth() &&
             d1.getDate()===d2.getDate();
    }
  
    function formatDayDate(d){
      const days=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
      const dayName=days[d.getDay()];
      const opts={month:"short", day:"numeric"};
      const datePart=d.toLocaleDateString("en-US",opts);
      return `${dayName} (${datePart})`;
    }
  
    let myChart=null;
    function buildWeekData(){
      // aggregator for a 7-day range from MondayOfOffset
      const mon=getMondayOfOffset(weekOffset);
      const aggregator=[];
      for(let i=0;i<7;i++){
        const dayObj=new Date(mon);
        dayObj.setDate(dayObj.getDate()+i);
        aggregator.push({
          dateObj: dayObj,
          packages:0,
          supplies:0
        });
      }
  
      // packages
      filteredPackages.forEach(pkg=>{
        if(pkg.created_at && pkg.cost!=null){
          const rowDate=new Date(pkg.created_at);
          for(let i=0;i<7;i++){
            if(sameDay(rowDate, aggregator[i].dateObj)){
              aggregator[i].packages+=Number(pkg.cost);
              break;
            }
          }
        }
      });
      // supplies
      filteredSupplies.forEach(s=>{
        if(s.purchase_date && s.total_cost!=null){
          const rowDate=new Date(s.purchase_date);
          for(let i=0;i<7;i++){
            if(sameDay(rowDate, aggregator[i].dateObj)){
              aggregator[i].supplies+=Number(s.total_cost);
              break;
            }
          }
        }
      });
  
      const labels=[];
      const packagesArr=[];
      const suppliesArr=[];
      const goalArr=[];
  
      aggregator.forEach(dayObj=>{
        labels.push(formatDayDate(dayObj.dateObj));
        packagesArr.push(dayObj.packages);
        suppliesArr.push(dayObj.supplies);
        goalArr.push(500);
      });
      return {labels, packagesArr, suppliesArr, goalArr};
    }
  
    function updateChart(){
      const {labels, packagesArr, suppliesArr, goalArr} = buildWeekData();
      if(!myChart){
        // create the chart
        const cvs=document.getElementById("weeklyRevenueChart");
        if(!cvs){
          console.error("No #weeklyRevenueChart found!");
          return;
        }
        const ctx=cvs.getContext("2d");
  
        myChart=new Chart(ctx,{
          type:"bar",
          data:{
            labels,
            datasets:[
              // 1) a stacked bar for Packages + Supplies => stack:'actual'
              {
                label:"Packages",
                data: packagesArr,
                backgroundColor:"rgba(75,192,192,0.7)",
                stack:"actual"
              },
              {
                label:"Supplies",
                data: suppliesArr,
                backgroundColor:"rgba(255,206,86,0.7)",
                stack:"actual"
              },
              // 2) a separate bar => $500 => stack:'goal'
              {
                label:"$500 Goal",
                data: goalArr,
                backgroundColor:"rgba(255,99,132,0.7)",
                stack:"goal"
              }
            ]
          },
          options:{
            responsive:true,
            maintainAspectRatio:false,
            scales:{
              x:{
                // side-by-side => 2 stacks => "actual" vs "goal"
                stacked:false,
                title:{display:true, text:"Date"}
              },
              y:{
                beginAtZero:true,
                // for the left bar, we want packages+supplies stacked => same stack => y stacking
                // but we also have a second stack => we do not want them overlapping, so:
                stacked:false,
                title:{display:true,text:"Dollar Amount"},
                ticks:{ callback: val => `$${val}` }
              }
            },
            plugins:{
              legend:{ position:"top" }
            }
          }
        });
      } else {
        // update existing
        myChart.data.labels=labels;
        myChart.data.datasets[0].data=packagesArr;
        myChart.data.datasets[1].data=suppliesArr;
        myChart.data.datasets[2].data=goalArr;
        myChart.update();
      }
  
      // handle toggles => dataset 0 => Packages, 1 => Supplies
      myChart.setDatasetVisibility(0, showPackages);
      myChart.setDatasetVisibility(1, showSupplies);
      myChart.update();
    }
  
    // initial aggregator after data loads
    setTimeout(()=>{
      console.log("Chart => left bar is stacked (Packages+Supplies). Right bar is $500, side by side.");
      updateChart();
    },1500);
  
    // ================================
    // 5) PREV/NEXT WEEK
    // ================================
    const prevWeekBtn=document.getElementById("prevWeekBtn");
    const nextWeekBtn=document.getElementById("nextWeekBtn");
    if(prevWeekBtn){
      prevWeekBtn.addEventListener("click",()=>{
        weekOffset--;
        updateChart();
      });
    }
    if(nextWeekBtn){
      nextWeekBtn.addEventListener("click",()=>{
        weekOffset++;
        updateChart();
      });
    }
  
    // ================================
    // 6) TOGGLE PACKAGES & SUPPLIES
    // ================================
    const togglePackagesBtn=document.getElementById("togglePackagesBtn");
    const toggleSuppliesBtn=document.getElementById("toggleSuppliesBtn");
  
    if(togglePackagesBtn){
      togglePackagesBtn.addEventListener("click",()=>{
        showPackages=!showPackages;
        togglePackagesBtn.textContent= showPackages ? "Hide Packages" : "Show Packages";
        updateChart();
      });
    }
    if(toggleSuppliesBtn){
      toggleSuppliesBtn.addEventListener("click",()=>{
        showSupplies=!showSupplies;
        toggleSuppliesBtn.textContent= showSupplies ? "Hide Supplies" : "Show Supplies";
        updateChart();
      });
    }
  });
  