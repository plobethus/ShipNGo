// /ShipNGo/frontend/scripts/locations.js

document.addEventListener("DOMContentLoaded", () => {
  // Set up filter controls
  document.getElementById("location-type-filter")?.addEventListener("change", loadLocations);
  document.getElementById("city-filter")?.addEventListener("input", debounce(loadLocations, 500));
  document.getElementById("state-filter")?.addEventListener("input", debounce(loadLocations, 500));

  // Show Add New Location modal
  document.getElementById("add-new-location-btn")?.addEventListener("click", () => {
    document.getElementById("add-location-modal").classList.remove("hidden");
  });

  // Modal close and cancel button events for edit modal
  document.getElementById("close-edit-modal")?.addEventListener("click", () => {
    document.getElementById("edit-location-modal").classList.add("hidden");
  });
  document.getElementById("cancel-edit-location")?.addEventListener("click", () => {
    document.getElementById("edit-location-modal").classList.add("hidden");
  });

  // Modal close and cancel button events for add modal
  document.getElementById("close-add-modal")?.addEventListener("click", () => {
    document.getElementById("add-location-modal").classList.add("hidden");
  });
  document.getElementById("cancel-add-location")?.addEventListener("click", () => {
    document.getElementById("add-location-modal").classList.add("hidden");
  });

  // Save actions for modals
  document.getElementById("save-edit-location")?.addEventListener("click", saveEditedLocation);
  document.getElementById("save-add-location")?.addEventListener("click", saveNewLocation);

  // Initially load all locations
  loadLocations();
});

// Helper: Simple debounce function
function debounce(func, delay) {
  let timeout;
  return function () {
    clearTimeout(timeout);
    timeout = setTimeout(func, delay);
  };
}

// Load locations using optional filter parameters, and update the table and stats
async function loadLocations() {
  const params = new URLSearchParams({
    type: document.getElementById("location-type-filter")?.value || "",
    city: document.getElementById("city-filter")?.value || "",
    state: document.getElementById("state-filter")?.value || ""
  });
  const url = `/api/locations?${params.toString()}`;
  
  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    });
    
    if (!response.ok) {
      console.error("Error fetching locations");
      return;
    }
    
    const locations = await response.json();
    updateDashboardStats(locations);
    populateLocationsTable(locations);
  } catch (error) {
    console.error("Error loading locations:", error);
  }
}

// Update the dashboard stats (total, active, and inactive location counts)
function updateDashboardStats(locations) {
  const total = locations.length;
  const active = locations.filter(loc => loc.is_active).length;
  const inactive = total - active;
  
  document.getElementById("total-locations-count").textContent = total;
  document.getElementById("active-locations-count").textContent = active;
  document.getElementById("inactive-locations-count").textContent = inactive;
}

// Populate the table with locations
function populateLocationsTable(locations) {
  const table = document.getElementById("location-table");
  table.innerHTML = "";
  
  if (locations.length === 0) {
    table.innerHTML = "<tr><td colspan='10'>No locations found.</td></tr>";
    return;
  }
  
  locations.forEach(loc => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${loc.location_id}</td>
      <td>${loc.location_name}</td>
      <td>${loc.location_type || "N/A"}</td>
      <td>${loc.state}</td>
      <td>${loc.zip_code}</td>
      <td>${loc.num_employees}</td>
      <td>${loc.is_active ? "Active" : "Inactive"}</td>
      <td>${loc.open_time || "N/A"} - ${loc.close_time || "N/A"}</td>
      <td>
        <button onclick="editLocation(${loc.location_id})">Edit</button>
        <button onclick="deleteLocation(${loc.location_id})">Delete</button>
      </td>
    `;
    table.appendChild(row);
  });
}

// Open the edit modal and pre-fill fields by fetching location details from the backend
function editLocation(locationId) {
  fetch(`/api/locations/${locationId}`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" }
  })
    .then(response => response.json())
    .then(loc => {
      document.getElementById("edit-location-id").textContent = loc.location_id;
      document.getElementById("edit-location-name").value = loc.name;
      document.getElementById("edit-location-type").value = loc.location_type;
      document.getElementById("edit-city").value = loc.city;
      document.getElementById("edit-state").value = loc.state;
      document.getElementById("edit-zip").value = loc.zip_code;
      document.getElementById("edit-employees").value = loc.num_employees;
      document.getElementById("edit-status").value = loc.is_active ? "Active" : "Inactive";
      document.getElementById("edit-open-time").value = loc.open_time || "";
      document.getElementById("edit-close-time").value = loc.close_time || "";
      document.getElementById("edit-address").value = loc.address || "";
      
      document.getElementById("edit-location-modal").classList.remove("hidden");
    })
    .catch(error => console.error("Error fetching location details:", error));
}

// Save updates from the edit modal
async function saveEditedLocation() {
  const locationId = document.getElementById("edit-location-id").textContent;
  const payload = {
    name: document.getElementById("edit-location-name").value,
    location_type: document.getElementById("edit-location-type").value,
    city: document.getElementById("edit-city").value,
    state: document.getElementById("edit-state").value,
    zip_code: document.getElementById("edit-zip").value,
    num_employees: parseInt(document.getElementById("edit-employees").value, 10),
    is_active: document.getElementById("edit-status").value === "Active",
    open_time: document.getElementById("edit-open-time").value,
    close_time: document.getElementById("edit-close-time").value,
    address: document.getElementById("edit-address").value
  };

  try {
    const response = await fetch(`/api/locations/${locationId}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    if (!response.ok) {
      alert("Error updating location: " + data.message);
      return;
    }
    
    document.getElementById("edit-location-modal").classList.add("hidden");
    loadLocations();
  } catch (error) {
    console.error("Error updating location:", error);
  }
}

// Create a new location using data from the add modal
async function saveNewLocation() {
  const payload = {
    name: document.getElementById("add-location-name").value,
    location_type: document.getElementById("add-location-type").value,
    city: document.getElementById("add-city").value,
    state: document.getElementById("add-state").value,
    zip_code: document.getElementById("add-zip").value,
    num_employees: parseInt(document.getElementById("add-employees").value, 10),
    is_active: document.getElementById("add-status").value === "Active",
    open_time: document.getElementById("add-open-time").value,
    close_time: document.getElementById("add-close-time").value,
    address: document.getElementById("add-address").value
  };

  try {
    const response = await fetch(`/api/locations`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    if (!response.ok) {
      alert("Error adding location: " + data.message);
      return;
    }
    
    document.getElementById("add-location-modal").classList.add("hidden");
    // Clear the form fields after successful addition
    document.getElementById("add-location-name").value = "";
    document.getElementById("add-location-type").value = "Post Office";
    document.getElementById("add-city").value = "";
    document.getElementById("add-state").value = "";
    document.getElementById("add-zip").value = "";
    document.getElementById("add-employees").value = "";
    document.getElementById("add-status").value = "Active";
    document.getElementById("add-open-time").value = "";
    document.getElementById("add-close-time").value = "";
    document.getElementById("add-address").value = "";
    loadLocations();
  } catch (error) {
    console.error("Error adding location:", error);
  }
}

// Delete a location after confirmation
async function deleteLocation(locationId) {
  if (!confirm("Are you sure you want to delete this location?")) return;
  try {
    const response = await fetch(`/api/locations/${locationId}`, {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    });
    
    const data = await response.json();
    if (!response.ok) {
      alert("Error deleting location: " + data.message);
      return;
    }
    
    loadLocations();
  } catch (error) {
    console.error("Error deleting location:", error);
  }
}
