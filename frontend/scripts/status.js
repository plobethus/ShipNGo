// /ShipNGo/frontend/scripts/status.js

let shippedDeliveredChart = null;
let activeDelayedChart    = null;
let suppliesPieChart      = null;


const prettyNames = {
  package_id:       'Package ID',
  address_from:     'Origin Address',
  address_to:       'Destination Address',
  status:           'Status',
  location:         'Location ID',
  location_id:      'Location ID',
  location_name:    'Location Name',
  location_type:    'Location Type',
  opening_time:     'Opening Time',
  closing_time:     'Closing Time',
  num_employees:    'Employees',
  manager_name:     'Manager',
  supply_id:        'Supply ID',
  category:         'Category',
  price:            'Price',
  stock_quantity:   'Stock Qty',
  total_sold:       'Total Sold',
  changed_at:       'Changed At',
  purchase_date:    'Purchase Date',
  quantity:         'Quantity',
  created_at:       'Created At',
  updated_at:       'Updated At',

};

document.addEventListener("DOMContentLoaded", () => {
  function updateTime() {
    const now = new Date();
    const opts = {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: true
    };
    const formatted = now.toLocaleDateString('en-US', opts)
      .replace(/(\d+)\/(\d+)\/(\d+),\s(.*)/, '$3/$1/$2, $4')
      .toUpperCase();
    document.getElementById("time-display").textContent = formatted;
    document.getElementById("lastUpdated").textContent  = now.toLocaleString();
  }
  updateTime();
  setInterval(updateTime, 1000);

  const today = new Date().toISOString().substr(0,10);
  document.getElementById("dateFrom").value = today;
  document.getElementById("dateTo").value   = today;

  document.getElementById("applyFilters")
    .addEventListener("click", fetchStatusData);

  document.querySelectorAll(".raw-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = document.getElementById(btn.dataset.target);
      const showing = target.style.display === "block";
      target.style.display = showing ? "none" : "block";
      btn.textContent = btn.textContent.replace(showing ? '▲' : '▼', showing ? '▼' : '▲');
    });
  });

  fetchStatusData();
});

// New function to create location checkboxes
function createLocationCheckboxes(locations) {
  const locDiv = document.getElementById("locationContainer");
  locDiv.innerHTML = '';
  
  locations.forEach(loc => {
    if (loc.location_id === 0) return;
    
    const lbl = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = loc.location_id;
    
    const span = document.createElement("span");
    span.textContent = `${loc.location_name} ${loc.location_type === 'POST_OFFICE' ? '(P)' : '(W)'}`;
    
    lbl.appendChild(checkbox);
    lbl.appendChild(span);
    locDiv.appendChild(lbl);
  });
}

async function fetchStatusData() {

  document.getElementById("loader").style.display = "flex";
  document.getElementById("errorMessage").style.display = "none";

  const from = document.getElementById("dateFrom").value;
  const to   = document.getElementById("dateTo").value;
  const selLocs = Array.from(
    document.querySelectorAll("#locationContainer input[type=checkbox]")
  )
    .filter(ch => ch.checked)
    .map(ch => ch.value);

  const params = new URLSearchParams({ dateFrom: from, dateTo: to });
  if (selLocs.length) params.set('locationIds', selLocs.join(','));

  try {
    const res  = await fetch("/status?" + params.toString());
    if (!res.ok) throw new Error(res.statusText);
    const json = await res.json();
    if (!json.success) throw new Error(json.message);

    const d = json.data;
    document.getElementById("loader").style.display = "none";

    document.getElementById("shippedCount").textContent   = d.shippedCount;
    document.getElementById("deliveredCount").textContent = d.deliveredCount;
    document.getElementById("activeCount").textContent    = d.activeCount;
    document.getElementById("delayedCount").textContent   = d.delayedCount;

    // Updated location checkbox creation
    if (!document.querySelectorAll("#locationContainer input").length) {
      createLocationCheckboxes(d.locations);
    }

    const detailsDiv  = document.getElementById("locationDetails");
    const detailsBody = document.getElementById("locationDetailsBody");
    if (selLocs.length) {
      detailsDiv.style.display = 'block';
      detailsBody.innerHTML = '';
      d.locations
        .filter(l => selLocs.includes(String(l.location_id)))
        .forEach(l => {
          const row = document.createElement('div');
          row.style.marginBottom = '8px';
          row.innerHTML = `
            <strong>${l.location_name}</strong> (${l.location_type}) —
            Manager: ${l.manager_name || 'N/A'}, 
            Hours: ${l.opening_time}–${l.closing_time}, 
            Staff: ${l.num_employees}
          `;
          detailsBody.append(row);
        });
    } else {
      detailsDiv.style.display = 'none';
    }

    destroyChart(shippedDeliveredChart);
    shippedDeliveredChart = renderBarChart(
      'chartShippedDelivered',
      ['Shipped','Delivered'],
      [d.shippedCount, d.deliveredCount]
    );

    destroyChart(activeDelayedChart);
    activeDelayedChart = renderPieChart(
      'chartActiveDelayed',
      ['In Transit','Delayed'],
      [d.activeCount, d.delayedCount]
    );

    if (d.supplies && d.supplies.length) {
      document.getElementById("suppliesChartCard").style.display = 'block';
      const sold  = d.supplies.reduce((s,r)=> s + +r.total_sold, 0);
      const stock = d.supplies.reduce((s,r)=> s + +r.stock_quantity, 0);
      destroyChart(suppliesPieChart);
      suppliesPieChart = new Chart(
        document.getElementById('chartSuppliesPie').getContext('2d'),
        {
          type: 'pie',
          data: {
            labels: ['Sold','Remaining'],
            datasets: [{ data: [sold, Math.max(0, stock - sold)] }]
          },
          options: { responsive:true, maintainAspectRatio:false }
        }
      );
    } else {
      document.getElementById("suppliesChartCard").style.display = 'none';
      destroyChart(suppliesPieChart);
    }


    populateSimpleTable("tableOrigins",      d.topOrigins);
    populateSimpleTable("tableDestinations", d.topDestinations);

    populateCurrentStatus("tableCurrentStatus", d.currentStatus);

    const supSec = document.getElementById("suppliesSection");
    if (d.supplies && d.supplies.length) {
      const map = {};
      d.supplies.forEach(r => {
        const key = `${r.category}||${r.price}`;
        if (!map[key]) {
          map[key] = {
            category:    r.category,
            price:       r.price,
            stock_total: 0,
            sold_total:  0
          };
        }
        map[key].stock_total += Number(r.stock_quantity);
        map[key].sold_total  += Number(r.total_sold);
      });
      const grouped = Object.values(map);

      supSec.style.display = 'block';
      const tb = supSec.querySelector("tbody");
      tb.innerHTML = '';
      grouped.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${r.category}</td>
          <td>${r.price}</td>
          <td>${r.stock_total}</td>
          <td>${r.sold_total}</td>
        `;
        tb.append(tr);
      });
    } else {
      supSec.style.display = 'none';
    }

    populateRawTable("rawPackages",           d.packagesRaw);
    populateRawTable("rawTracking",           d.trackingRaw);
    populateRawTable("rawLocations",          d.locationsRaw);
    populateRawTable("rawSuppliesRaw",        d.suppliesRaw);
    populateRawTable("rawSupplyTransactions", d.supplyTransactionsRaw);

  } catch (err) {
    console.error(err);
    document.getElementById("loader").style.display = "none";
    const em = document.getElementById("errorMessage");
    em.style.display = "block";
    em.textContent = "Error: " + err.message;
  }
}


function destroyChart(chart) {
  if (chart) chart.destroy();
}

function renderBarChart(id, labels, data) {
  const ctx = document.getElementById(id).getContext('2d');
  return new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets:[{ label:'Count', data }] },
    options: { responsive:true, maintainAspectRatio:false }
  });
}

function renderPieChart(id, labels, data) {
  const ctx = document.getElementById(id).getContext('2d');
  return new Chart(ctx, {
    type: 'pie',
    data: { labels, datasets:[{ data }] },
    options: { responsive:true, maintainAspectRatio:false }
  });
}

function populateSimpleTable(id, rows) {
  const tb = document.querySelector(`#${id} tbody`);
  tb.innerHTML = rows.length
    ? rows.map(r=>`<tr><td>${r.name}</td><td>${r.count}</td></tr>`).join('')
    : `<tr><td colspan="2">No data</td></tr>`;
}

function populateCurrentStatus(id, rows) {
  const tb = document.querySelector(`#${id} tbody`);
  tb.innerHTML = rows.length
    ? rows.map(r=>`<tr><td>${r.package_id}</td><td>${r.current_status}</td><td>${r.current_location}</td></tr>`).join('')
    : `<tr><td colspan="3">No data</td></tr>`;
}

function populateRawTable(tableId, rows) {
  const container = document.getElementById(tableId);
  const thead     = container.querySelector("thead");
  const tbody     = container.querySelector("tbody");
  thead.innerHTML = "";
  tbody.innerHTML = "";

  if (!rows.length) {
    thead.innerHTML = `<tr><th>No Data</th></tr>`;
    tbody.innerHTML = `<tr><td>No data to display</td></tr>`;
    return;
  }

  const cols = Object.keys(rows[0]);
  thead.innerHTML = `<tr>${cols.map(c=>`<th>${prettyNames[c]||c}</th>`).join('')}</tr>`;
  tbody.innerHTML = rows.map(row =>
    `<tr>${cols.map(c=>`<td>${row[c]}</td>`).join('')}</tr>`
  ).join('');
}