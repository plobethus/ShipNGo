/* financialreport.js – Tables + Stacked/Goal Chart */
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
  const formatCurrency = value => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  let packages = [], supplies = [];
  let viewPkg = [], viewSup = [];
  let customRange = null, weekOffset = 0;
  let showPkg = true, showSup = true, chart = null;
  let autoRefresh = true;

  async function fetchJSON(url){
    try {
      const res = await fetch(url);
      if(!res.ok) throw new Error(`${url} → ${res.status}`);
      return res.json();
    } catch (error) {
      console.error("Error fetching data:", error);
      showNotification("Failed to load data. Please try again later.", "error");
      return [];
    }
  }
  
  try {
    [ packages, supplies ] = await Promise.all([
      fetchJSON("/api/claims/transpackage"),
      fetchJSON("/api/claims/trans")
    ]);
  } catch (error) {
    console.error("Error loading initial data:", error);
    packages = [];
    supplies = [];
  }

  function applyFilters() {
    const start = customRange ? customRange.start : monday(weekOffset);
    const end   = customRange ? customRange.end   : new Date(start.getTime()+6*864e5);

    // Package filters
    const pName   = $("filter-package-name").value.trim().toLowerCase();
    const pWt     = $("filter-weight").value.trim();
    const pDim    = $("filter-dim").value.trim().toLowerCase();
    const pCls    = $("filter-class").value.trim().toLowerCase();
    const pCost   = $("filter-cost").value.trim();
    const pStartDate = parseDate($("filter-package-start-date").value.trim());
    const pEndDate = parseDate($("filter-package-end-date").value.trim());

    viewPkg = packages.filter(p => {
      const d = new Date(p.created_at);
      
      if (pStartDate && d < pStartDate) return false;
      if (pEndDate) {
        const endOfDay = new Date(pEndDate);
        endOfDay.setHours(23, 59, 59, 999);
        if (d > endOfDay) return false;
      }
      
      if (!pStartDate && !pEndDate && (d < start || d > end)) return false;
      
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
    const sStartDate = parseDate($("filter-supply-start-date").value.trim());
    const sEndDate = parseDate($("filter-supply-end-date").value.trim());

    viewSup = supplies.filter(s => {
      const d = new Date(s.purchase_date);
      
      if (sStartDate && d < sStartDate) return false;
      if (sEndDate) {
        const endOfDay = new Date(sEndDate);
        endOfDay.setHours(23, 59, 59, 999);
        if (d > endOfDay) return false;
      }
      
      if (!sStartDate && !sEndDate && (d < start || d > end)) return false;
      
      if(sName && !(s.name||"").toLowerCase().includes(sName)) return false;
      if(sItem && !(s.category||"").toLowerCase().includes(sItem)) return false;
      return true;
    });
    
    // Update totals
    const pkgTotal = viewPkg.reduce((sum, p) => sum + Number(p.cost || 0), 0);
    $("package-total-container").innerHTML = `Total Package Revenue: ${formatCurrency(pkgTotal)}`;
    
    const supTotal = viewSup.reduce((sum, s) => sum + Number(s.total_cost || 0), 0);
    $("supply-total-container").innerHTML = `Total Supply Revenue: ${formatCurrency(supTotal)}`;
  }

  function renderTables() {
    const pkgBody = $("package-table");
    pkgBody.innerHTML = "";
    
    if (viewPkg.length === 0) {
      pkgBody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:20px;">No package data matches your filters</td></tr>`;
    } else {
      viewPkg
        .sort((a,b)=> new Date(b.created_at) - new Date(a.created_at))
        .slice(0,10)
        .forEach(p => {
          pkgBody.insertAdjacentHTML("beforeend", `
            <tr>
              <td>${p.package_id || 'N/A'}</td>
              <td>${p.name || 'N/A'}</td>
              <td>${p.weight || 'N/A'}</td>
              <td>${p.dimensions || 'N/A'}</td>
              <td>${p.shipping_class || 'N/A'}</td>
              <td>${formatCurrency(p.cost)}</td>
              <td>${new Date(p.created_at).toLocaleDateString()}</td>
            </tr>`);
        });
    }

    const supBody = $("supply-table");
    supBody.innerHTML = "";
    
    if (viewSup.length === 0) {
      supBody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:20px;">No supply data matches your filters</td></tr>`;
    } else {
      viewSup
        .sort((a,b)=> new Date(b.purchase_date) - new Date(a.purchase_date))
        .slice(0,10)
        .forEach(s => {
          supBody.insertAdjacentHTML("beforeend", `
            <tr>
              <td>${s.supply_transaction_id || 'N/A'}</td>
              <td>${s.name || 'N/A'}</td>
              <td>${s.category || 'N/A'}</td>
              <td>${s.quantity || 'N/A'}</td>
              <td>${formatCurrency(s.total_cost)}</td>
              <td>${new Date(s.purchase_date).toLocaleDateString()}</td>
            </tr>`);
        });
    }
  }

  function renderChart() {
    const start = customRange ? customRange.start : monday(weekOffset);
    const end   = customRange ? customRange.end   : new Date(start.getTime()+6*864e5);
    const days  = span(start,end).map(d=>({d,pk:0,sp:0}));

    viewPkg.forEach(p => {
      const rd = new Date(p.created_at);
      days.forEach(x=> sameDay(rd,x.d) && (x.pk += Number(p.cost || 0)));
    });
    viewSup.forEach(s => {
      const rd = new Date(s.purchase_date);
      days.forEach(x=> sameDay(rd,x.d) && (x.sp += Number(s.total_cost || 0)));
    });

    const labels = days.map(x=>label(x.d));
    const pkArr  = days.map(x=>x.pk);
    const spArr  = days.map(x=>x.sp);
    const goal   = days.map(_=>500);

    if(!chart){
      const ctx = $("weeklyRevenueChart").getContext("2d");
      chart = new Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [
            { 
              label: "Packages",  
              data: pkArr,  
              backgroundColor: "rgba(54, 162, 235, 0.7)", 
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1,
              stack: "actual" 
            },
            { 
              label: "Supplies",  
              data: spArr,  
              backgroundColor: "rgba(255, 205, 86, 0.7)", 
              borderColor: "rgba(255, 205, 86, 1)",
              borderWidth: 1,
              stack: "actual" 
            },
            { 
              label: "$500 Goal", 
              data: goal,   
              backgroundColor: "rgba(255, 99, 132, 0.6)", 
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 1,
              stack: "goal" 
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { 
            legend: { 
              position: "top",
              labels: {
                font: {
                  size: 14
                },
                padding: 20
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed.y !== null) {
                    label += formatCurrency(context.parsed.y);
                  }
                  return label;
                }
              }
            } 
          },
          scales: {
            x: { 
              stacked: false, 
              grid: {
                display: false
              },
              title: {
                display: true,
                text: "Date",
                font: {
                  size: 14,
                  weight: 'bold'
                },
                padding: {top: 10, bottom: 0}
              }
            },
            y: { 
              beginAtZero: true, 
              stacked: false, 
              grid: {
                color: "rgba(0, 0, 0, 0.05)"
              },
              ticks: {
                callback: function(value) {
                  return formatCurrency(value);
                }
              },
              title: {
                display: true,
                text: "Revenue",
                font: {
                  size: 14,
                  weight: 'bold'
                },
                padding: {top: 0, bottom: 10}
              }
            }
          },
          animation: {
            duration: 1000,
            easing: 'easeOutQuart'
          }
        }
      });
    } else {
      chart.data.labels           = labels;
      chart.data.datasets[0].data = pkArr;
      chart.data.datasets[1].data = spArr;
      chart.data.datasets[2].data = goal;
      chart.setDatasetVisibility(0, showPkg);
      chart.setDatasetVisibility(1, showSup);
      chart.update({
        duration: 500,
        easing: 'easeOutCubic'
      });
    }
    
    const chartTitle = customRange 
      ? `Revenue from ${start.toLocaleDateString()} to ${end.toLocaleDateString()}` 
      : `Weekly Revenue (${start.toLocaleDateString()} - ${end.toLocaleDateString()})`;
    
    $("togglePackagesBtn").textContent = showPkg ? "Hide Packages" : "Show Packages";
    $("toggleSuppliesBtn").textContent = showSup ? "Hide Supplies" : "Show Supplies";
  }

  const refresh = ()=>{
    applyFilters();
    renderTables();
    renderChart();
  };

  // —— Show notification —— 
  function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }

  function clearSectionFilters(section) {
    if (section === 'package') {
      autoRefresh = false;
      
      $("filter-package-name").value = '';
      $("filter-weight").value = '';
      $("filter-dim").value = '';
      $("filter-class").value = '';
      $("filter-cost").value = '';
      
      const startInput = $("filter-package-start-date");
      const endInput = $("filter-package-end-date");
      startInput.value = '';
      endInput.value = '';
      startInput.removeAttribute('max');
      endInput.removeAttribute('min');
      
      autoRefresh = true;
      refresh();
      showNotification('Package filters cleared');
      
      const container = startInput.closest('.filter');
      container.style.transition = 'background-color 0.3s ease';
      container.style.backgroundColor = 'rgba(76, 175, 80, 0.05)';
      setTimeout(() => {
        container.style.backgroundColor = '';
      }, 500);
    } 
    else if (section === 'supply') {
      autoRefresh = false;
      
      $("filter-name").value = '';
      $("filter-item").value = '';
      
      const startInput = $("filter-supply-start-date");
      const endInput = $("filter-supply-end-date");
      startInput.value = '';
      endInput.value = '';
      startInput.removeAttribute('max');
      endInput.removeAttribute('min');
      
      autoRefresh = true;
      refresh();
      showNotification('Supply filters cleared');
      
      const container = startInput.closest('.filter');
      container.style.transition = 'background-color 0.3s ease';
      container.style.backgroundColor = 'rgba(76, 175, 80, 0.05)';
      setTimeout(() => {
        container.style.backgroundColor = '';
      }, 500);
    }
  }

  $("applyRangeBtn").addEventListener("click",()=>{
    const s = parseDate($("rangeStart").value);
    const e = parseDate($("rangeEnd").value);
    if(!s||!e||s>e){ 
      showNotification('Invalid date range. Please ensure the start date is before the end date.', 'error');
      return; 
    }
    customRange = {start:s,end:e};
    $("prevWeekBtn").disabled = $("nextWeekBtn").disabled = true;
    refresh();
    showNotification('Date range applied successfully');
  });
  
  $("prevWeekBtn").addEventListener("click",()=>{
    if(!customRange){ 
      weekOffset--; 
      refresh(); 
    }
  });
  
  $("nextWeekBtn").addEventListener("click",()=>{
    if(!customRange){ 
      weekOffset++; 
      refresh(); 
    }
  });
  
  $("togglePackagesBtn").addEventListener("click", () => {
    showPkg = !showPkg;
    $("togglePackagesBtn").textContent = showPkg ? "Hide Packages" : "Show Packages";
    $("togglePackagesBtn").style.backgroundColor = showPkg ? "rgba(54, 162, 235, 0.8)" : "#e74c3c";
    
    if (chart) {
      chart.setDatasetVisibility(0, showPkg);
      chart.update();
    }
  });
  
  $("toggleSuppliesBtn").addEventListener("click", () => {
    showSup = !showSup;
    $("toggleSuppliesBtn").textContent = showSup ? "Hide Supplies" : "Show Supplies";
    $("toggleSuppliesBtn").style.backgroundColor = showSup ? "rgba(255, 205, 86, 0.8)" : "#e74c3c";
    
    if (chart) {
      chart.setDatasetVisibility(1, showSup);
      chart.update();
    }
  });
  
  const debounce = (func, delay) => {
    let debounceTimer;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(context, args), delay);
    }
  };
  
  document.querySelectorAll('input[id^="filter-"]').forEach(input => {
    input.addEventListener("input", debounce(() => {
      if (autoRefresh) refresh();
    }, 300));
  });

  document.querySelectorAll('input[type="date"][id^="filter-"]').forEach(input => {
    input.addEventListener("change", function() {
      if (this.id.includes("start-date")) {
        const endDateId = this.id.replace("start-date", "end-date");
        const endDateInput = $(endDateId);
        
        if (endDateInput.value && new Date(endDateInput.value) < new Date(this.value)) {
          endDateInput.value = this.value;
          showNotification('End date adjusted to match start date', 'info');
        }
        
        endDateInput.min = this.value;
        
        const dateGroup = this.closest('.date-group');
        if (dateGroup) {
          dateGroup.style.borderColor = '#0a4275';
          dateGroup.style.boxShadow = '0 0 0 3px rgba(10, 66, 117, 0.1)';
          setTimeout(() => {
            dateGroup.style.borderColor = '';
            dateGroup.style.boxShadow = '';
          }, 1000);
        }
      }
      
      if (this.id.includes("end-date")) {
        const startDateId = this.id.replace("end-date", "start-date");
        const startDateInput = $(startDateId);
        
        if (startDateInput.value && new Date(startDateInput.value) > new Date(this.value)) {
          startDateInput.value = this.value;
          showNotification('Start date adjusted to match end date', 'info');
        }
      
        startDateInput.max = this.value;
        
        const dateGroup = this.closest('.date-group');
        if (dateGroup) {
          dateGroup.style.borderColor = '#0a4275';
          dateGroup.style.boxShadow = '0 0 0 3px rgba(10, 66, 117, 0.1)';
          setTimeout(() => {
            dateGroup.style.borderColor = '';
            dateGroup.style.boxShadow = '';
          }, 1000);
        }
      }
      
      if (autoRefresh) {
        debounce(refresh, 300)();
      }
    });
  });

  document.querySelectorAll('.apply-filter-btn').forEach(btn => {
    btn.addEventListener("click", function() {
      const section = this.getAttribute('data-section');
      refresh();
      showNotification(`${section.charAt(0).toUpperCase() + section.slice(1)} filters applied`);
      
      this.classList.add('button-active');
      setTimeout(() => {
        this.classList.remove('button-active');
      }, 300);
    });
  });

  document.querySelectorAll('.clear-filter-btn').forEach(btn => {
    btn.addEventListener("click", function() {
      const section = this.getAttribute('data-section');
      clearSectionFilters(section);
      
      this.classList.add('button-active');
      setTimeout(() => {
        this.classList.remove('button-active');
      }, 300);
    });
  });
  refresh();
  
  if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
        z-index: 1001;
        animation: slideIn 0.3s ease-out forwards;
        display: flex;
        align-items: center;
        max-width: 350px;
      }
      
      .notification.success {
        background-color: #2ecc71;
      }
      
      .notification.error {
        background-color: #e74c3c;
      }
      
      .notification.info {
        background-color: #3498db;
      }
      
      .notification.fade-out {
        animation: fadeOut 0.3s ease-out forwards;
      }
      
      @keyframes slideIn {
        0% {
          transform: translateX(100%);
          opacity: 0;
        }
        100% {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes fadeOut {
        0% {
          opacity: 1;
        }
        100% {
          opacity: 0;
        }
      }
      
      .button-active {
        transform: scale(0.95);
        opacity: 0.8;
      }
    `;
    document.head.appendChild(style);
  }
  
  $("togglePackagesBtn").style.backgroundColor = "rgba(54, 162, 235, 0.8)";
  $("toggleSuppliesBtn").style.backgroundColor = "rgba(255, 205, 86, 0.8)";
  
  showNotification('Financial report loaded successfully');
});