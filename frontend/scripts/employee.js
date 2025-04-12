// /ShipNGo/frontend/scripts/employee.js

/* old code commented for testing
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // (Optionally, verify employee authentication here via /auth/me)
    document.getElementById("status-filter")?.addEventListener("change", loadPackages);
    document.getElementById("search-customer")?.addEventListener("input", debounce(loadPackages, 500));
    document.getElementById("start-date")?.addEventListener("change", loadPackages);
    document.getElementById("end-date")?.addEventListener("change", loadPackages);
    document.getElementById("min-weight")?.addEventListener("input", debounce(loadPackages, 500));
    document.getElementById("max-weight")?.addEventListener("input", debounce(loadPackages, 500));
    document.getElementById("address-filter")?.addEventListener("input", debounce(loadPackages, 500));

    await loadPackages();
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

async function loadPackages() {
  const params = new URLSearchParams({
    status: document.getElementById("status-filter")?.value || "",
    customerName: document.getElementById("search-customer")?.value || "",
    startDate: document.getElementById("start-date")?.value || "",
    endDate: document.getElementById("end-date")?.value || "",
    minWeight: document.getElementById("min-weight")?.value || "",
    maxWeight: document.getElementById("max-weight")?.value || "",
    address: document.getElementById("address-filter")?.value || ""
  });
  const url = `/packages/dashboard/employee?${params.toString()}`;
  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    });
    if (!response.ok) {
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
      packageTable.innerHTML = "<tr><td colspan='8'>No packages found.</td></tr>";
      return;
    }
    data.packages.forEach(pkg => {
      const row = `
        <tr>
          <td>${pkg.package_id}</td>
          <td>${pkg.status}</td>
          <td>${pkg.weight || "N/A"}</td>
          <td>${pkg.dimensions || "N/A"}</td>
          <td>${pkg.address_from || "N/A"}</td>
          <td>${pkg.address_to || "N/A"}</td>
          <td>${pkg.sender_name || "Unknown"} → ${pkg.receiver_name || "Unknown"}</td>
          <td>
            <button onclick="quickUpdate(${pkg.package_id}, 'In Transit')">In Transit</button>
            <button onclick="quickUpdate(${pkg.package_id}, 'Delivered')">Delivered</button>
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
*/

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Optionally, verify employee authentication here if needed
    document.getElementById("status-filter")?.addEventListener("change", loadPackages);
    document.getElementById("search-customer")?.addEventListener("input", debounce(loadPackages, 500));
    document.getElementById("start-date")?.addEventListener("change", loadPackages);
    document.getElementById("end-date")?.addEventListener("change", loadPackages);
    document.getElementById("min-weight")?.addEventListener("input", debounce(loadPackages, 500));
    document.getElementById("max-weight")?.addEventListener("input", debounce(loadPackages, 500));
    document.getElementById("address-filter")?.addEventListener("input", debounce(loadPackages, 500));

    await loadPackages();
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

async function loadPackages() {
  const params = new URLSearchParams({
    status: document.getElementById("status-filter")?.value || "",
    customerName: document.getElementById("search-customer")?.value || "",
    startDate: document.getElementById("start-date")?.value || "",
    endDate: document.getElementById("end-date")?.value || "",
    minWeight: document.getElementById("min-weight")?.value || "",
    maxWeight: document.getElementById("max-weight")?.value || "",
    address: document.getElementById("address-filter")?.value || ""
  });
  const url = `/packages/dashboard/employee?${params.toString()}`;
  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    });
    if (!response.ok) {
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
      packageTable.innerHTML = "<tr><td colspan='8'>No packages found.</td></tr>";
      return;
    }
    data.packages.forEach(pkg => {
      const row = `
        <tr>
          <td>${pkg.package_id}</td>
          <td>${pkg.status}</td>
          <td>${pkg.weight || "N/A"}</td>
          <td>${pkg.dimensions || "N/A"}</td>
          <td>${pkg.address_from || "N/A"}</td>
          <td>${pkg.address_to || "N/A"}</td>
          <td>${pkg.sender_name || "Unknown"} → ${pkg.receiver_name || "Unknown"}</td>
          <td>
            <button onclick="quickUpdate(${pkg.package_id}, 'In Transit')">In Transit</button>
            <button onclick="quickUpdate(${pkg.package_id}, 'Delivered')">Delivered</button>
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

async function editPackage(packageId) {
  // Prompt for updated values; feel free to extend the prompts for more fields.
  const newStatus = prompt("Enter new status (e.g., Pending, In Transit, Delivered):");
  if (newStatus === null) return;  // Canceled by user
  
  const newLocation = prompt("Enter new location:");
  if (newLocation === null) return;
  
  const payload = {
    status: newStatus,
    location: newLocation
    // Include additional fields (like weight, address_from, address_to) if needed.
  };

  try {
    const response = await fetch(`/packages/${packageId}`, {
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
    await loadPackages();
  } catch (error) {
    console.error("Error updating package:", error);
    alert("Error updating package. Please try again.");
  }
}

async function deletePackageUI(packageId) {
  if (!confirm("Are you sure you want to delete this package?")) {
    return;  // User canceled deletion
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
