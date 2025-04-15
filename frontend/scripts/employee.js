// /ShipNGo/frontend/scripts/employee.js

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Add event listeners for filters
    document.getElementById("status-filter")?.addEventListener("change", loadPackages);
    document.getElementById("search-customer")?.addEventListener("input", debounce(loadPackages, 500));
    document.getElementById("start-date")?.addEventListener("change", loadPackages);
    document.getElementById("end-date")?.addEventListener("change", loadPackages);
    document.getElementById("location-filter")?.addEventListener("change", loadPackages);
    document.getElementById("min-weight")?.addEventListener("input", debounce(loadPackages, 500));
    document.getElementById("max-weight")?.addEventListener("input", debounce(loadPackages, 500));
    document.getElementById("address-filter")?.addEventListener("input", debounce(loadPackages, 500));

    // Initialize Edit Attribute change event
    document.getElementById("edit-attribute")?.addEventListener("change", handleEditAttributeChange);

    // Initialize modal event listeners
    document.getElementById("close-modal")?.addEventListener("click", () => {
      document.getElementById("edit-modal").classList.add("hidden");
    });

    document.getElementById("cancel-edit")?.addEventListener("click", () => {
      document.getElementById("edit-modal").classList.add("hidden");
    });

    document.getElementById("save-edit")?.addEventListener("click", savePackageChanges);

    await loadPackages();
    await populateLocationDropdown();
  } catch (error) {
    console.error("Error during employee authentication:", error);
    window.location.href = "/pages/login.html";
  }
});

function debounce(func, delay) {
  let timeout;
  return function () {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(), delay);
  };
}

// Populate location dropdown
async function populateLocationDropdown() {
  try {
    const response = await fetch("/locations", {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    });
    const data = await response.json();

    const filterDropdown = document.getElementById("location-filter");
    const editDropdown = document.getElementById("edit-location-dropdown");
    
    filterDropdown.innerHTML = '<option value="">-- Select Location --</option>';
    editDropdown.innerHTML = '<option value="">-- Select Location --</option>';
    
    // Add new options based on fetched locations
    data.forEach(loc => {
      const option = document.createElement("option");
      option.value = loc.location_id;
      option.textContent = `${loc.location_name} - ${loc.location_type} at ${loc.address}`;
      
      // Add to filter dropdown
      filterDropdown.appendChild(option);
      
      // Add to edit dropdown
      const editOption = option.cloneNode(true);
      editDropdown.appendChild(editOption);
    });
  } catch (err) {
    console.error("Failed to load locations:", err);
  }
}

// Load packages and update dashboard
async function loadPackages() {
  const params = new URLSearchParams({
    status: document.getElementById("status-filter")?.value || "",
    customerName: document.getElementById("search-customer")?.value || "",
    startDate: document.getElementById("start-date")?.value || "",
    endDate: document.getElementById("end-date")?.value || "",
    minWeight: document.getElementById("min-weight")?.value || "",
    maxWeight: document.getElementById("max-weight")?.value || "",
    address: document.getElementById("address-filter")?.value || "",
    locationId: document.getElementById("location-filter")?.value || ""
  });
  
  const url = `/packages/dashboard/employee?${params.toString()}`;
  
  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    });
    
    if (!response.ok && response.status != 404) {
      const errorData = await response.json();
      console.error("Error fetching packages:", errorData.message);
      return;
    }
    
    const data = await response.json();
    const packageTable = document.getElementById("package-table");
    
    if (!packageTable) {
      console.error("No element with id 'package-table' found.");
      return;
    }
    
    packageTable.innerHTML = "";
    
    // Update dashboard stats
    updateDashboardStats(data.packages || []);
    
    if (!data.packages || data.packages.length === 0) {
      packageTable.innerHTML = "<tr><td colspan='12'>No packages found.</td></tr>";
      return;
    }

    data.packages.forEach(pkg => {
      // Determine status class for badge styling
      const statusClass = getStatusClass(pkg.latest_status || "Pending");
      
      const row = `
        <tr>
          <td>${pkg.package_id}</td>
          <td>${pkg.created_at || "N/A"}</td>
          <td><span class="status-badge ${statusClass}">${pkg.latest_status || "Pending"}</span></td>
          <td>${pkg.weight || "N/A"}</td>
          <td>${pkg.dimensions || "N/A"}</td>
          <td>${pkg.address_from || "N/A"}</td>
          <td>${pkg.address_to || "N/A"}</td>
          <td>${pkg.sender_name || "Unknown"} → ${pkg.receiver_name || "Unknown"}</td>
          <td>${pkg.location_name || (pkg.location_id === 0 ? "Post Office" : "N/A")}</td>
          <td>${pkg.manager_of_location || "N/A"}</td>
          <td>${pkg.hours_open || "N/A"}</td>
          <td>
            <button onclick="editPackage(${pkg.package_id})">Edit</button>
            <button onclick="deletePackageUI(${pkg.package_id})">Delete</button>
          </td>
        </tr>
      `;
      packageTable.innerHTML += row;
    });
  } catch (error) {
    console.error("Error loading packages:", error);
  }
}

// Helper function to get status class name
function getStatusClass(status) {
  switch(status) {
    case "Pending": return "status-pending";
    case "Scheduled": return "status-scheduled";
    case "In Transit": return "status-in-transit";
    case "Delivered": return "status-delivered";
    default: return "";
  }
}

// Update dashboard stats
function updateDashboardStats(packages) {
  if (!Array.isArray(packages)) {
    packages = [];
  }
  
  // Calculate stats
  const totalPackages = packages.length;
  
  // Count packages by status
  const pendingPackages = packages.filter(pkg => 
    !pkg.latest_status || pkg.latest_status === "Pending"
  ).length;
  
  const scheduledPackages = packages.filter(pkg => 
    pkg.latest_status === "Scheduled"
  ).length;
  
  const inTransitPackages = packages.filter(pkg => 
    pkg.latest_status === "In Transit"
  ).length;
  
  const deliveredPackages = packages.filter(pkg => 
    pkg.latest_status === "Delivered"
  ).length;
  
  // Update UI with values
  document.getElementById("total-packages-count").textContent = totalPackages;
  document.getElementById("pending-packages-count").textContent = pendingPackages;
  document.getElementById("scheduled-packages-count").textContent = scheduledPackages;
  document.getElementById("in-transit-packages-count").textContent = inTransitPackages;
  document.getElementById("delivered-packages-count").textContent = deliveredPackages;
}

// Edit package function
let currentEditPackageId = null;

function editPackage(packageId) {
  currentEditPackageId = packageId;
  document.getElementById("edit-package-id").textContent = packageId;
  document.getElementById("edit-value").value = "";
  document.getElementById("edit-modal").classList.remove("hidden");
  
  handleEditAttributeChange();
}

function handleEditAttributeChange() {
  const attr = document.getElementById("edit-attribute").value;
  const valInput = document.getElementById("edit-value-container");
  const locDropdown = document.getElementById("edit-location-container");
  const statusDropdown = document.getElementById("edit-status-container");

  valInput.classList.add("hidden");
  locDropdown.classList.add("hidden");
  statusDropdown.classList.add("hidden");

  if (attr === "location_id") {
    locDropdown.classList.remove("hidden");
  } else if (attr === "status") {
    statusDropdown.classList.remove("hidden");
  } else {
    valInput.classList.remove("hidden");
  }
}

// Save package changes
async function savePackageChanges() {
  const attribute = document.getElementById("edit-attribute").value;
  const payload = {};

  if (attribute === "location_id") {
    const selectedLoc = document.getElementById("edit-location-dropdown").value;
    if (!selectedLoc) {
      showNotification("Please select a location", "error");
      return;
    }
    payload[attribute] = parseInt(selectedLoc);
    payload["status"] = "In Transit";
  } else if (attribute === "status") {
    const selectedStatus = document.getElementById("edit-status-dropdown").value;
    payload[attribute] = selectedStatus;
  } else {
    const value = document.getElementById("edit-value").value;
    if (value === "") {
      showNotification("Please enter a value", "error");
      return;
    }
    payload[attribute] = value;
  }

  try {
    const response = await fetch(`/packages/${currentEditPackageId}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    if (!response.ok) {
      showNotification(`Error updating package: ${data.message}`, "error");
      return;
    }

    showNotification("Package updated successfully!", "success");
    document.getElementById("edit-modal").classList.add("hidden");
    await loadPackages();
  } catch (error) {
    console.error("Error updating package:", error);
    showNotification("Error updating package. Please try again.", "error");
  }
}

// Delete package function
async function deletePackageUI(packageId) {
  if (!confirm("Are you sure you want to delete this package?")) {
    return;  
  }
  try {
    const response = await fetch(`/packages/${packageId}`, {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    });
    const data = await response.json();
    if (!response.ok) {
      showNotification(`Error deleting package: ${data.message}`, "error");
      return;
    }
    showNotification("Package deleted successfully.", "success");
    await loadPackages();
  } catch (error) {
    console.error("Error deleting package:", error);
    showNotification("Error deleting package. Please try again.", "error");
  }
}

// Show notification function
function showNotification(message, type) {
  // Create notification element
  const notification = document.createElement("div");
  notification.classList.add("notification", type);
  notification.textContent = message;
  
  // Append to body
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add("fade-out");
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Function to update package status
async function quickUpdate(packageId, newStatus) {
  try {
    const response = await fetch(`/packages/${packageId}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });
    const data = await response.json();
    if (!response.ok) {
      showNotification(`Error updating package: ${data.message}`, "error");
      return;
    }
    showNotification("Package updated successfully!", "success");
    await loadPackages();
  } catch (error) {
    console.error("Error updating package:", error);
    showNotification("Error updating package. Please try again.", "error");
  }
}