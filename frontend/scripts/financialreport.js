/* financialreport.js  – Tables + Stacked/Goal Chart (always includes $500 goal) */
document.addEventListener("DOMContentLoaded", async () => {
    // —— Helpers ——
    const $ = id => document.getElementById(id);
    const parseDate = v => v ? new Date(`${v}T00:00:00`) : null;
    const sameDay   = (a,b)=> a?.toDateString()===b?.toDateString();
    const monday    = off => {
      const d=new Date(); d.setHours(0,0,0,0);
      d.setDate(d.getDate()-((d.getDay()+6)%7)+off*7);
      return d;
    };
    const span = (s,e)=>{
      const a=[],c=new Date(s);
      while(c<=e){ a.push(new Date(c)); c.setDate(c.getDate()+1); }
      return a;
    };
    const label = d=>d.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});
  
    // —— State ——
    let packages = [], supplies = [];
    let viewPkg = [], viewSup = [];
    let customRange = null, weekOffset = 0;
    let showPkg = true, showSup = true, chart = null;
  
    // —— Fetch (add Auth header if needed) ——
    async function fetchJSON(url){
      const res = await fetch(url);
      if(!res.ok) throw new Error(`${url} → ${res.status}`);
      return res.json();
    }
    [ packages, supplies ] = await Promise.all([
      fetchJSON("/api/claims/transpackage"),
      fetchJSON("/api/claims/trans")
    ]);
  
    // —— Apply Filters ——
    function applyFilters() {
      const start = customRange ? customRange.start : monday(weekOffset);
      const end   = customRange ? customRange.end   : new Date(start.getTime()+6*864e5);
  
      // Package filters
      const pName   = $("filter-package-name").value.trim().toLowerCase();
      const pWt     = $("filter-weight").value.trim();
      const pDim    = $("filter-dim").value.trim().toLowerCase();
      const pCls    = $("filter-class").value.trim().toLowerCase();
      const pCost   = $("filter-cost").value.trim();
  
      viewPkg = packages.filter(p => {
        const d = new Date(p.created_at);
        if(d < start || d > end) return false;
        if(pName && !(p.name||"").toLowerCase().includes(pName)) return false;
        if(pWt   && !(p.weight||"").toString().includes(pWt)) return false;
        if(pDim  && !(p.dimensions||"").toLowerCase().includes(pDim)) return false;
        if(pCls  && !(p.shipping_class||"").toLowerCase().includes(pCls)) return false;
        if(pCost){
          const th = parseFloat(pCost);
          if(isNaN(th) || Number(p.cost) > th) return false;
        }
        return true;
      });
  
      // Supply filters
      const sName = $("filter-name").value.trim().toLowerCase();
      const sItem = $("filter-item").value.trim().toLowerCase();
      const sDate = $("filter-date").value.trim();
  
      viewSup = supplies.filter(s => {
        const d = new Date(s.purchase_date);
        if(d < start || d > end) return false;
        if(sName && !(s.name||"").toLowerCase().includes(sName)) return false;
        if(sItem && !(s.category||"").toLowerCase().includes(sItem)) return false;
        if(sDate && !s.purchase_date.startsWith(sDate)) return false;
        return true;
      });
    }
  
    // —— Render Tables —— 
    function renderTables() {
      const pkgBody = $("package-table");
      pkgBody.innerHTML = "";
      viewPkg
        .sort((a,b)=> new Date(b.created_at) - new Date(a.created_at))
        .slice(0,10)
        .forEach(p => {
          pkgBody.insertAdjacentHTML("beforeend", `
            <tr>
              <td>${p.package_id}</td><td>${p.name}</td><td>${p.weight}</td>
              <td>${p.dimensions}</td><td>${p.shipping_class}</td>
              <td>$${p.cost}</td>
              <td>${new Date(p.created_at).toLocaleDateString()}</td>
            </tr>`);
        });
  
      const supBody = $("supply-table");
      supBody.innerHTML = "";
      viewSup
        .sort((a,b)=> new Date(b.purchase_date) - new Date(a.purchase_date))
        .slice(0,10)
        .forEach(s => {
          supBody.insertAdjacentHTML("beforeend", `
            <tr>
              <td>${s.supply_transaction_id}</td><td>${s.name}</td>
              <td>${s.category}</td><td>${s.quantity}</td>
              <td>$${s.total_cost}</td>
              <td>${new Date(s.purchase_date).toLocaleDateString()}</td>
            </tr>`);
        });
    }
  
    // —— Render Chart —— 
    function renderChart() {
      const start = customRange ? customRange.start : monday(weekOffset);
      const end   = customRange ? customRange.end   : new Date(start.getTime()+6*864e5);
      const days  = span(start,end).map(d=>({d,pk:0,sp:0}));
  
      viewPkg.forEach(p => {
        const rd = new Date(p.created_at);
        days.forEach(x=> sameDay(rd,x.d) && (x.pk += Number(p.cost)));
      });
      viewSup.forEach(s => {
        const rd = new Date(s.purchase_date);
        days.forEach(x=> sameDay(rd,x.d) && (x.sp += Number(s.total_cost)));
      });
  
      const labels = days.map(x=>label(x.d));
      const pkArr  = days.map(x=>x.pk);
      const spArr  = days.map(x=>x.sp);
      const goal   = days.map(_=>500);
  
      if(!chart){
        chart = new Chart($("weeklyRevenueChart").getContext("2d"), {
          type: "bar",
          data: {
            labels,
            datasets: [
              { label:"Packages",  data:pkArr,  backgroundColor:"rgba(54,162,235,0.7)", stack:"actual" },
              { label:"Supplies",  data:spArr,  backgroundColor:"rgba(255,205,86,0.7)", stack:"actual" },
              { label:"$500 Goal", data:goal,   backgroundColor:"rgba(255,99,132,0.7)", stack:"goal" }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { stacked:false, title:{display:true,text:"Date"} },
              y: { beginAtZero:true, stacked:false, title:{display:true,text:"USD"} }
            },
            plugins: { legend:{ position:"top" } }
          }
        });
      } else {
        chart.data.labels           = labels;
        chart.data.datasets[0].data = pkArr;
        chart.data.datasets[1].data = spArr;
        chart.data.datasets[2].data = goal;
        chart.setDatasetVisibility(0, showPkg);
        chart.setDatasetVisibility(1, showSup);
        chart.update();
      }
    }
  
    // —— Full refresh —— 
    const refresh = ()=>{
      applyFilters();
      renderTables();
      renderChart();
    };
  
    // —— Event hooks —— 
    $("applyRangeBtn").addEventListener("click",()=>{
      const s = parseDate($("rangeStart").value);
      const e = parseDate($("rangeEnd").value);
      if(!s||!e||s>e){ alert("Invalid range"); return; }
      customRange = {start:s,end:e};
      $("prevWeekBtn").disabled = $("nextWeekBtn").disabled = true;
      refresh();
    });
    $("prevWeekBtn").addEventListener("click",()=>{
      if(!customRange){ weekOffset--; refresh(); }
    });
    $("nextWeekBtn").addEventListener("click",()=>{
      if(!customRange){ weekOffset++; refresh(); }
    });
    $("togglePackagesBtn").addEventListener("click",()=>{
      showPkg = !showPkg;
      $("togglePackagesBtn").textContent = showPkg ? "Hide Packages" : "Show Packages";
      chart && chart.update();
    });
    $("toggleSuppliesBtn").addEventListener("click",()=>{
      showSup = !showSup;
      $("toggleSuppliesBtn").textContent = showSup ? "Hide Supplies" : "Show Supplies";
      chart && chart.update();
    });
    document.querySelectorAll('input[id^="filter-"]').forEach(i=>
      i.addEventListener("input", refresh)
    );
  
    // —— Init —— 
    refresh();
  });
  