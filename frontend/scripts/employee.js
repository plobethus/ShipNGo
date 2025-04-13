// /ShipNGo/frontend/scripts/employee.js

document.addEventListener("DOMContentLoaded", async () => {
  try {
    document.getElementById("status-filter")?.addEventListener("change", loadPackages);
    document.getElementById("search-customer")?.addEventListener("input", debounce(loadPackages, 500));
    document.getElementById("start-date")?.addEventListener("change", loadPackages);
    document.getElementById("end-date")?.addEventListener("change", loadPackages);
    document.getElementById("location-filter")?.addEventListener("change", loadPackages);
    document.getElementById("min-weight")?.addEventListener("input", debounce(loadPackages, 500));
    document.getElementById("max-weight")?.addEventListener("input", debounce(loadPackages, 500));
    document.getElementById("address-filter")?.addEventListener("input", debounce(loadPackages, 500));

    await loadPackages();
    await populateLocationDropdown()
  } catch (error) {
    console.error("Error during employee authentication:", error);
    window.location.href = "/pages/login.html";
  }
});


async function populateLocationDropdown() {
  try {
    const response = await fetch("/locations", {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    });
    const data = await response.json();


    const dropdown = document.getElementById("location-filter");
    const dropdown2 = document.getElementById("edit-location-dropdown");
    dropdown.innerHTML = '<option value="">-- Select Location --</option>';
    dropdown2.innerHTML = '<option value="">-- Select Location --</option>';
    data.forEach(loc => {
      const option = document.createElement("option");
      option.value = loc.location_id;
      option.textContent = `${loc.location_name} - ${loc.location_type} at ${loc.address}`;
      
      dropdown.appendChild(option);
      dropdown2.appendChild(option.cloneNode(true));
    });
  } catch (err) {
    console.error("Failed to load locations:", err);
  }
}



function debounce(func, delay) {
  let timeout;
  return function () {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(), delay);
  };
}

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
    if (!data.packages || data.packages.length === 0) {
      packageTable.innerHTML = "<tr><td colspan='12'>No packages found.</td></tr>"; //changed: 12 columns now
      return;
    }

    data.packages.forEach(pkg => {
      const row = `
        <tr>
          <td>${pkg.package_id}</td>
          <td>${pkg.created_at || "N/A"}</td>                        <!--changed-->
          <td>${pkg.latest_status || "Pending"}</td>                 <!--changed-->
          <td>${pkg.weight || "N/A"}</td>
          <td>${pkg.dimensions || "N/A"}</td>
          <td>${pkg.address_from || "N/A"}</td>
          <td>${pkg.address_to || "N/A"}</td>
          <td>${pkg.sender_name || "Unknown"} → ${pkg.receiver_name || "Unknown"}</td>
          <td>${pkg.location_name || (pkg.location_id === 0 ? "Post Office" : "N/A")}</td>  <!--changed-->
          <td>${pkg.manager_of_location || "N/A"}</td>                  <!--changed-->
          <td>${pkg.hours_open || "N/A"}</td>                           <!--changed-->
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
      alert(`Error updating package: ${data.message}`);
      return;
    }
    alert("Package updated successfully!");
    await loadPackages();
  } catch (error) {
    console.error("Error updating package:", error);
    alert("Error updating package. Please try again.");
  }
}

let currentEditPackageId = null;

function editPackage(packageId) {
  currentEditPackageId = packageId;
  document.getElementById("edit-package-id").textContent = packageId;
  document.getElementById("edit-value").value = "";
  document.getElementById("edit-modal").classList.remove("hidden");
}

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
      alert(`Error deleting package: ${data.message}`);
      return;
    }
    alert("Package deleted successfully.");
    await loadPackages();
  } catch (error) {
    console.error("Error deleting package:", error);
    alert("Error deleting package. Please try again.");
  }
}


document.getElementById("close-modal").addEventListener("click", () => {
  document.getElementById("edit-modal").classList.add("hidden");
});

document.getElementById("cancel-edit").addEventListener("click", () => {
  document.getElementById("edit-modal").classList.add("hidden");
});

document.getElementById("edit-attribute").addEventListener("change", () => {
  const attr = document.getElementById("edit-attribute").value;
  const valInput = document.getElementById("edit-value-container");
  const locDropdown = document.getElementById("edit-location-container");

  if (attr === "location_id") {
    valInput.classList.add("hidden");
    locDropdown.classList.remove("hidden");
  } else {
    valInput.classList.remove("hidden");
    locDropdown.classList.add("hidden");
  }
});



document.getElementById("save-edit").addEventListener("click", async () => {
  const attribute = document.getElementById("edit-attribute").value;
  const payload = {};

  if (attribute === "location_id") {
    const selectedLoc = document.getElementById("edit-location-dropdown").value;
    if (!selectedLoc) return alert("Please select a location.");
    payload[attribute] = parseInt(selectedLoc);
    payload["status"] = "In Transit";

  } else {
    const value = document.getElementById("edit-value").value;
    if (value === "") return alert("Please enter a value.");
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
      alert(`Error updating package: ${data.message}`);
      return;
    }

    alert("Package updated successfully!");
    document.getElementById("edit-modal").classList.add("hidden");
    await loadPackages();
  } catch (error) {
    console.error("Error updating package:", error);
    alert("Error updating package. Please try again.");
  }
});


