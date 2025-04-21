document.addEventListener("DOMContentLoaded", () => {
  // Populate manager dropdowns for filter + modals
  loadManagerOptions();

  // Filter controls
  document.getElementById("location-type-filter")
    ?.addEventListener("change", loadLocations);
  document.getElementById("state-filter")
    ?.addEventListener("input", debounce(loadLocations, 500));
  document.getElementById("manager-filter")
    ?.addEventListener("change", loadLocations);

  // Show Add modal
  document.getElementById("add-new-location-btn")
    ?.addEventListener("click", () => {
      document.getElementById("add-location-modal").classList.remove("hidden");
    });

  // Close edit modal
  document.getElementById("close-edit-modal")
    ?.addEventListener("click", () =>
      document.getElementById("edit-location-modal").classList.add("hidden")
    );
  document.getElementById("cancel-edit-location")
    ?.addEventListener("click", () =>
      document.getElementById("edit-location-modal").classList.add("hidden")
    );

  // Close add modal
  document.getElementById("close-add-modal")
    ?.addEventListener("click", () =>
      document.getElementById("add-location-modal").classList.add("hidden")
    );
  document.getElementById("cancel-add-location")
    ?.addEventListener("click", () =>
      document.getElementById("add-location-modal").classList.add("hidden")
    );

  // Save actions
  document.getElementById("save-edit-location")
    ?.addEventListener("click", saveEditedLocation);
  document.getElementById("save-add-location")
    ?.addEventListener("click", saveNewLocation);

  // Initial fetch
  loadLocations();
});

function debounce(fn, delay) {
  let t;
  return () => {
    clearTimeout(t);
    t = setTimeout(fn, delay);
  };
}

async function loadManagerOptions() {
  try {
    const res = await fetch("/api/employees?role=manager", {
      credentials: "include"
    });
    if (!res.ok) throw new Error(res.status);
    const { success, data: managers, message } = await res.json();
    if (!success) throw new Error(message);

    // Manager filter
    const mgrFilter = document.getElementById("manager-filter");
    mgrFilter.innerHTML = "<option value=''>All Managers</option>";
    managers.forEach(m => {
      const o = document.createElement("option");
      o.value = m.employee_id;
      o.textContent = m.name;
      mgrFilter.appendChild(o);
    });

    // Add/Edit modals
    ["add-manager-dropdown","edit-manager-dropdown"].forEach(id => {
      const dd = document.getElementById(id);
      dd.innerHTML = "<option value=''>-- Select Manager --</option>";
      managers.forEach(m => {
        const o = document.createElement("option");
        o.value = m.employee_id;
        o.textContent = m.name;
        dd.appendChild(o);
      });
    });
  } catch (err) {
    console.error("Could not load managers:", err);
  }
}

async function loadLocations() {
  const params = new URLSearchParams({
    type:    document.getElementById("location-type-filter").value,
    state:   document.getElementById("state-filter").value,
    manager: document.getElementById("manager-filter").value
  });
  const url = `/api/locations?${params.toString()}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    });
    if (!res.ok) throw new Error(res.status);
    const locations = await res.json();

    updateDashboardStats(locations);
    populateLocationsTable(locations);
  } catch (err) {
    console.error("Error loading locations:", err);
  }
}

function updateDashboardStats(locations) {
  const total    = locations.length - 1;
  const active   = locations.filter(l => l.is_active).length - 1;
  const inactive = total - active;

  document.getElementById("total-locations-count").textContent   = total;
  document.getElementById("active-locations-count").textContent  = active;
  document.getElementById("inactive-locations-count").textContent= inactive;
}

function populateLocationsTable(locations) {
  const table = document.getElementById("location-table");
  table.innerHTML = "";
  if (!locations.length) {
    table.innerHTML = "<tr><td colspan='10'>No locations found.</td></tr>";
    return;
  }
  locations.forEach(loc => {
    if (loc.location_id == 10) return;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${loc.location_id}</td>
      <td>${loc.location_name}</td>
      <td>${loc.location_type || "N/A"}</td>
      <td>${loc.state}</td>
      <td>${loc.zip_code}</td>
      <td>${loc.num_employees}</td>
      <td>${loc.manager_name || "—"}</td>
      <td>${loc.is_active ? "Active" : "Inactive"}</td>
      <td>${loc.opening_time || "N/A"} - ${loc.closing_time || "N/A"}</td>
      <td>
        <button onclick="editLocation(${loc.location_id})">Edit</button>
        <button onclick="deleteLocation(${loc.location_id})">Delete</button>
      </td>`;
    table.appendChild(row);
  });
}

function editLocation(locationId) {
  fetch(`/api/locations/${locationId}`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" }
  })
    .then(r => r.json())
    .then(loc => {
      document.getElementById("edit-location-id").textContent        = loc.location_id;
      document.getElementById("edit-location-name").value           = loc.location_name;
      document.getElementById("edit-location-type").value           = loc.location_type;
      document.getElementById("edit-state").value                   = loc.state;
      document.getElementById("edit-zip").value                     = loc.zip_code;
      document.getElementById("edit-employees").value               = loc.num_employees;
      document.getElementById("edit-manager-dropdown").value        = loc.manager_id || "";
      document.getElementById("edit-status").value                  = loc.is_active ? "Active" : "Inactive";
      document.getElementById("edit-open-time").value               = loc.opening_time || "";
      document.getElementById("edit-close-time").value              = loc.closing_time || "";
      document.getElementById("edit-address").value                 = loc.address || "";

      document.getElementById("edit-location-modal").classList.remove("hidden");
    })
    .catch(err => console.error("Error fetching location details:", err));
}

async function saveEditedLocation() {
  const id = document.getElementById("edit-location-id").textContent;
  const payload = {
    name:           document.getElementById("edit-location-name").value,
    location_type:  document.getElementById("edit-location-type").value,
    state:          document.getElementById("edit-state").value,
    zip_code:       document.getElementById("edit-zip").value,
    num_employees:  parseInt(document.getElementById("edit-employees").value, 10),
    manager_id:     document.getElementById("edit-manager-dropdown").value || null,
    is_active:      document.getElementById("edit-status").value === "Active",
    opening_time:   document.getElementById("edit-open-time").value,
    closing_time:   document.getElementById("edit-close-time").value,
    address:        document.getElementById("edit-address").value,
  };

  try {
    const res = await fetch(`/api/locations/${id}`, {
      method:      "PUT",
      credentials: "include",
      headers:     { "Content-Type": "application/json" },
      body:        JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      alert("Error updating location: " + data.message);
      return;
    }
    document.getElementById("edit-location-modal").classList.add("hidden");
    loadLocations();
  } catch (err) {
    console.error("Error updating location:", err);
  }
}

async function saveNewLocation() {
  const payload = {
    name:           document.getElementById("add-location-name").value,
    location_type:  document.getElementById("add-location-type").value,
    state:          document.getElementById("add-state").value,
    zip_code:       document.getElementById("add-zip").value,
    num_employees:  parseInt(document.getElementById("add-employees").value, 10),
    manager_id:     document.getElementById("add-manager-dropdown").value || null,
    is_active:      document.getElementById("add-status").value === "Active",
    opening_time:   document.getElementById("add-open-time").value,
    closing_time:   document.getElementById("add-close-time").value,
    address:        document.getElementById("add-address").value,
  };

  try {
    const res = await fetch(`/api/locations`, {
      method:      "POST",
      credentials: "include",
      headers:     { "Content-Type": "application/json" },
      body:        JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      alert("Error adding location: " + data.message);
      return;
    }
    document.getElementById("add-location-modal").classList.add("hidden");
    loadLocations();
  } catch (err) {
    console.error("Error adding location:", err);
  }
}

async function deleteLocation(id) {
  if (!confirm("Are you sure you want to delete this location?")) return;
  try {
    const res = await fetch(`/api/locations/${id}`, {
      method:      "DELETE",
      credentials: "include",
      headers:     { "Content-Type": "application/json" }
    });
    const data = await res.json();
    if (!res.ok) {
      alert("Error deleting location: " + data.message);
      return;
    }
    loadLocations();
  } catch (err) {
    console.error("Error deleting location:", err);
  }
}
