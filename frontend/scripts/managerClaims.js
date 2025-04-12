document.addEventListener("DOMContentLoaded", async function () {
  // Store all claims data for filtering
  let allClaimsData = [];
  
  try {
    // Show loading state in tables
    document.getElementById("complaint-table").innerHTML = `<tr><td colspan="8" style="text-align:center;">Loading claims data...</td></tr>`;
    document.getElementById("package-claims-table").innerHTML = `<tr><td colspan="8" style="text-align:center;">Loading package claims data...</td></tr>`;
    
    // Fetch claims data
    const response = await fetch("/api/claims/");
    const claimsData = await response.json();
    
    // Store claims data
    allClaimsData = Array.isArray(claimsData) ? claimsData : [];
    
    // Sort claims by processed_date (newest first)
    allClaimsData.sort((a, b) => {
      return new Date(b.processed_date || 0) - new Date(a.processed_date || 0);
    });
    
    // Identify package claims
    const packageClaims = allClaimsData.filter(claim => claim.package_id);
    
    // Update dashboard statistics
    updateDashboardStats(allClaimsData);
    
    // Display claims in tables
    if (allClaimsData.length > 0) {
      displayAllClaims(allClaimsData);
      displayPackageClaims(packageClaims);
    } else {
      document.getElementById("complaint-table").innerHTML = `<tr><td colspan="8" style="text-align:center;">No claims available</td></tr>`;
      document.getElementById("package-claims-table").innerHTML = `<tr><td colspan="8" style="text-align:center;">No package claims found</td></tr>`;
    }
    
    // Load claims without packages
    loadClaimsWithoutPackages();
    
    // Set up filter options
    populateIssueTypeFilters(allClaimsData);
    
    // Set up filter button event listeners
    setupAllFilters();
    
  } catch (err) {
    console.error("Error loading claims:", err);
    document.getElementById("complaint-table").innerHTML = `<tr><td colspan="8" style="text-align:center;color:red;">Error loading claims data</td></tr>`;
    document.getElementById("package-claims-table").innerHTML = `<tr><td colspan="8" style="text-align:center;color:red;">Error loading package claims data</td></tr>`;
    updateDashboardStats([]);
  }
  
  // ===== Dashboard Statistics Functions =====
  
  // Update dashboard statistics
  function updateDashboardStats(claimsData) {
    if (!Array.isArray(claimsData) || claimsData.length === 0) {
      document.getElementById("total-claims-count").textContent = "0";
      document.getElementById("pending-claims-count").textContent = "0";
      document.getElementById("resolution-rate").textContent = "0%";
      return;
    }
    
    // Calculate statistics
    const totalClaims = claimsData.length;
    
    // Count by status
    const pendingClaims = claimsData.filter(claim => 
      !claim.refund_status || claim.refund_status === "Pending" || claim.refund_status === "Processing" || claim.refund_status === "pending"
    ).length;
    
    const resolvedClaims = claimsData.filter(claim => 
      claim.refund_status && (claim.refund_status === "Approved" || claim.refund_status === "Rejected")
    ).length;
    
    // Calculate resolution rate
    const resolutionRate = totalClaims > 0 ? Math.round((resolvedClaims / totalClaims) * 100) : 0;
    
    // Update UI
    document.getElementById("total-claims-count").textContent = totalClaims;
    document.getElementById("pending-claims-count").textContent = pendingClaims;
    document.getElementById("resolution-rate").textContent = `${resolutionRate}%`;
  }
  
  // ===== Filter Setup Functions =====
  
  // Populate issue type filter dropdowns
  function populateIssueTypeFilters(claimsData) {
    // Extract unique issue types
    const issueTypes = new Set();
    claimsData.forEach(claim => {
      if (claim.issue_type && claim.issue_type.trim() !== '') {
        issueTypes.add(claim.issue_type);
      }
    });
    
    // Populate all claims issue type filter
    const allIssueFilter = document.getElementById("issue-type-filter");
    if (allIssueFilter) {
      // Clear existing options except "All Issues"
      while (allIssueFilter.options.length > 1) {
        allIssueFilter.remove(1);
      }
      
      // Add new options
      issueTypes.forEach(issueType => {
        const option = document.createElement("option");
        option.value = issueType;
        option.textContent = formatClaimType(issueType);
        allIssueFilter.appendChild(option);
      });
    }
    
    // Populate package claims issue type filter
    const pkgIssueFilter = document.getElementById("pkg-issue-type-filter");
    if (pkgIssueFilter) {
      // Clear existing options except "All Issues"
      while (pkgIssueFilter.options.length > 1) {
        pkgIssueFilter.remove(1);
      }
      
      // Add new options
      issueTypes.forEach(issueType => {
        const option = document.createElement("option");
        option.value = issueType;
        option.textContent = formatClaimType(issueType);
        pkgIssueFilter.appendChild(option);
      });
    }
  }
  
  // Set up filter button event listeners
  function setupAllFilters() {
    // All claims filters
    const applyFiltersBtn = document.getElementById("apply-filters");
    const resetFiltersBtn = document.getElementById("reset-filters");
    
    if (applyFiltersBtn) {
      applyFiltersBtn.addEventListener("click", function() {
        const filteredClaims = filterClaims(allClaimsData, {
          dateFilter: document.getElementById("date-filter").value,
          customerFilter: document.getElementById("customer-filter").value.trim(),
          packageFilter: document.getElementById("package-filter").value.trim(),
          statusFilter: document.getElementById("status-filter").value,
          issueTypeFilter: document.getElementById("issue-type-filter").value
        });
        
        displayAllClaims(filteredClaims);
        updateDashboardStats(filteredClaims);
      });
    }
    
    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener("click", function() {
        document.getElementById("date-filter").value = "";
        document.getElementById("customer-filter").value = "";
        document.getElementById("package-filter").value = "";
        document.getElementById("status-filter").value = "";
        document.getElementById("issue-type-filter").value = "";
        
        displayAllClaims(allClaimsData);
        updateDashboardStats(allClaimsData);
      });
    }
    
    // Package claims filters
    const pkgApplyFiltersBtn = document.getElementById("pkg-apply-filters");
    const pkgResetFiltersBtn = document.getElementById("pkg-reset-filters");
    
    if (pkgApplyFiltersBtn) {
      pkgApplyFiltersBtn.addEventListener("click", function() {
        const packageClaims = allClaimsData.filter(claim => claim.package_id);
        
        const filteredClaims = filterClaims(packageClaims, {
          dateFilter: document.getElementById("pkg-date-filter").value,
          customerFilter: document.getElementById("pkg-customer-filter").value.trim(),
          packageFilter: document.getElementById("pkg-package-filter").value.trim(),
          statusFilter: document.getElementById("pkg-status-filter").value,
          issueTypeFilter: document.getElementById("pkg-issue-type-filter").value
        });
        
        displayPackageClaims(filteredClaims);
      });
    }
    
    if (pkgResetFiltersBtn) {
      pkgResetFiltersBtn.addEventListener("click", function() {
        document.getElementById("pkg-date-filter").value = "";
        document.getElementById("pkg-customer-filter").value = "";
        document.getElementById("pkg-package-filter").value = "";
        document.getElementById("pkg-status-filter").value = "";
        document.getElementById("pkg-issue-type-filter").value = "";
        
        const packageClaims = allClaimsData.filter(claim => claim.package_id);
        displayPackageClaims(packageClaims);
      });
    }
  }
  
  // Filter claims based on criteria
  function filterClaims(claims, filters) {
    let filteredClaims = [...claims];
    
    // Apply date filter
    if (filters.dateFilter) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const last7Days = new Date(today);
      last7Days.setDate(last7Days.getDate() - 7);
      
      const last30Days = new Date(today);
      last30Days.setDate(last30Days.getDate() - 30);
      
      filteredClaims = filteredClaims.filter(claim => {
        if (!claim.processed_date) return false;
        
        const claimDate = new Date(claim.processed_date);
        claimDate.setHours(0, 0, 0, 0);
        
        switch (filters.dateFilter) {
          case "today":
            return claimDate.getTime() === today.getTime();
          case "yesterday":
            return claimDate.getTime() === yesterday.getTime();
          case "last7":
            return claimDate >= last7Days;
          case "last30":
            return claimDate >= last30Days;
          default:
            return true;
        }
      });
    }
    
    // Apply customer ID filter
    if (filters.customerFilter) {
      filteredClaims = filteredClaims.filter(claim => 
        claim.customer_id && claim.customer_id.toString().includes(filters.customerFilter)
      );
    }
    
    // Apply package ID filter
    if (filters.packageFilter) {
      filteredClaims = filteredClaims.filter(claim => 
        claim.package_id && claim.package_id.toString().includes(filters.packageFilter)
      );
    }
    
    // Apply status filter
    if (filters.statusFilter) {
      filteredClaims = filteredClaims.filter(claim => 
        claim.refund_status === filters.statusFilter
      );
    }
    
    // Apply issue type filter
    if (filters.issueTypeFilter) {
      filteredClaims = filteredClaims.filter(claim => 
        claim.issue_type === filters.issueTypeFilter
      );
    }
    
    return filteredClaims;
  }
  
  // ===== Display Functions =====
  
  // Display all claims in the main table
  function displayAllClaims(claims) {
    const tableBody = document.getElementById("complaint-table");
    if (!tableBody) return;
    
    tableBody.innerHTML = "";
    
    if (claims.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center;">No claims match the selected filters</td></tr>`;
      return;
    }
    
    claims.forEach(claim => {
      const row = document.createElement("tr");
      row.classList.add("clickable-row");
      
      // Add click event to show claim details
      row.addEventListener("click", () => {
        showClaimDetails(claim);
      });
      
      // Format date for display
      let formattedDate = formatDate(claim.processed_date);
      
      // Create package details section
      let packageInfo = "No package";
      if (claim.package_id) {
        packageInfo = `ID: ${claim.package_id}`;
        
        if (claim.weight !== undefined && claim.weight !== null) packageInfo += `<br>Weight: ${claim.weight}`;
        if (claim.dimensions !== undefined && claim.dimensions !== null) packageInfo += `<br>Dim: ${claim.dimensions}`;
      }
      
      row.innerHTML = `
        <td>${claim.ticket_id || ""}</td>
        <td>${formatClaimType(claim.issue_type) || ""}</td>
        <td>${formattedDate}</td>
        <td>${claim.reason || ""}</td>
        <td>${claim.first_name || ""} ${claim.last_name || ""}</td>
        <td>${claim.customer_id || ""}</td>
        <td>${packageInfo}</td>
        <td>${claim.refund_status || "Pending"}</td>
      `;
      tableBody.appendChild(row);
    });
  }
  
  // Display claims with packages in the package claims table
  function displayPackageClaims(claims) {
    const tableBody = document.getElementById("package-claims-table");
    if (!tableBody) return;
    
    tableBody.innerHTML = "";
    
    if (claims.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center;">No package claims match the selected filters</td></tr>`;
      return;
    }
    
    claims.forEach(claim => {
      const row = document.createElement("tr");
      row.classList.add("clickable-row");
      
      // Add click event to show claim details
      row.addEventListener("click", () => {
        showClaimDetails(claim);
      });
      
      row.innerHTML = `
        <td>${claim.ticket_id || "N/A"}</td>
        <td>${formatClaimType(claim.issue_type) || "N/A"}</td>
        <td>${formatDate(claim.processed_date)}</td>
        <td>${claim.package_id || "N/A"}</td>
        <td>${claim.weight !== undefined && claim.weight !== null ? claim.weight : "N/A"}</td>
        <td>${claim.dimensions !== undefined && claim.dimensions !== null ? claim.dimensions : "N/A"}</td>
        <td>${claim.customer_id || "N/A"}</td>
        <td>${claim.refund_status || "Pending"}</td>
      `;
      tableBody.appendChild(row);
    });
  }
  
  // Load claims without packages
  // Load claims without packages
async function loadClaimsWithoutPackages() {
  const tableBody = document.getElementById("no-package-claims-table");
  if (!tableBody) return;
  
  try {
    // Show loading state
    tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Loading claims without packages...</td></tr>`;
    
    // Fetch data from API
    const response = await fetch("/api/claims/without-packages");
    
    // Check if response is ok
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const claims = await response.json();
    
    tableBody.innerHTML = "";
    
    if (Array.isArray(claims) && claims.length > 0) {
      claims.forEach(claim => {
        const row = document.createElement("tr");
        row.classList.add("clickable-row");
        
        // Add click event to show claim details
        row.addEventListener("click", () => {
          showClaimDetails(claim);
        });
        
        row.innerHTML = `
          <td>${claim.ticket_id || ""}</td>
          <td>${formatClaimType(claim.issue_type) || ""}</td>
          <td>${formatDate(claim.processed_date)}</td>
          <td>${claim.first_name || ""} ${claim.last_name || ""}</td>
        `;
        tableBody.appendChild(row);
      });
    } else {
      tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No claims without packages found</td></tr>`;
    }
  } catch (err) {
    console.error("Error loading claims without packages:", err);
    tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:red;">Error loading claims data: ${err.message}</td></tr>`;
  }
}
  
  // Show claim details in a modal
  function showClaimDetails(claim) {
    // Create modal backdrop
    const modalBackdrop = document.createElement("div");
    modalBackdrop.classList.add("modal-backdrop");
    
    // Create modal container
    const modalContainer = document.createElement("div");
    modalContainer.classList.add("modal-container");
    
    // Create a fullname from first_name and last_name
    const fullName = (claim.first_name && claim.last_name) 
      ? `${claim.first_name} ${claim.last_name}` 
      : "Unknown";
    
    // Create package details section
    let packageDetails = "";
    if (claim.package_id) {
      packageDetails = `
        <p><strong>Package ID:</strong> ${claim.package_id}</p>
        <p><strong>Weight:</strong> ${claim.weight || "N/A"}</p>
        <p><strong>Dimensions:</strong> ${claim.dimensions || "N/A"}</p>
      `;
    } else {
      packageDetails = `<p><strong>Package ID:</strong> No package associated</p>`;
    }
    
    // Build refund status controls
    const statusOptions = ["Pending", "Processing", "Approved", "Rejected"];
    let statusSelect = `
      <div class="status-update">
        <label for="refund-status"><strong>Update Status:</strong></label>
        <select id="refund-status" class="status-select">
    `;
    
    statusOptions.forEach(option => {
      const selected = option === claim.refund_status ? "selected" : "";
      statusSelect += `<option value="${option}" ${selected}>${option}</option>`;
    });
    
    statusSelect += `
        </select>
        <button id="update-status" class="update-btn">Update Status</button>
      </div>
    `;
    
    // Set modal content
    modalContainer.innerHTML = `
      <div class="modal-header">
        <h3>Claim #${claim.ticket_id || 'N/A'}</h3>
        <button class="close-btn">&times;</button>
      </div>
      <div class="modal-body">
        <div class="modal-section">
          <h4>Customer Information</h4>
          <p><strong>Name:</strong> ${fullName}</p>
          <p><strong>Customer ID:</strong> ${claim.customer_id || "N/A"}</p>
          <p><strong>Email:</strong> ${claim.email || "N/A"}</p>
          <p><strong>Phone:</strong> ${claim.phone_number || "N/A"}</p>
        </div>
        
        <div class="modal-section">
          <h4>Claim Information</h4>
          <p><strong>Issue Type:</strong> ${formatClaimType(claim.issue_type)}</p>
          <p><strong>Status:</strong> <span id="current-status">${claim.refund_status || "Pending"}</span></p>
          <p><strong>Processed Date:</strong> ${formatDate(claim.processed_date)}</p>
          ${statusSelect}
        </div>
        
        <div class="modal-section">
          <h4>Package Information</h4>
          ${packageDetails}
        </div>
        
        <div class="modal-section">
          <h4>Reason for Claim</h4>
          <div class="claim-reason">
            <p>${claim.reason || "N/A"}</p>
          </div>
        </div>
      </div>
    `;
    
    // Append modal to body
    modalBackdrop.appendChild(modalContainer);
    document.body.appendChild(modalBackdrop);
    
    // Add event listener to close button
    const closeBtn = modalContainer.querySelector(".close-btn");
    closeBtn.addEventListener("click", () => {
      document.body.removeChild(modalBackdrop);
    });
    
    // Add event listener to close when clicking outside
    modalBackdrop.addEventListener("click", (event) => {
      if (event.target === modalBackdrop) {
        document.body.removeChild(modalBackdrop);
      }
    });
    
    // Add event listener to update status button
    const updateStatusBtn = modalContainer.querySelector("#update-status");
    updateStatusBtn.addEventListener("click", async () => {
      const newStatus = modalContainer.querySelector("#refund-status").value;
      
      try {
        // Example API call to update claim status
        const response = await fetch(`/api/claims/${claim.ticket_id}/status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus })
        });
        
        if (response.ok) {
          // Update the current status in the modal
          modalContainer.querySelector("#current-status").textContent = newStatus;
          
          // Update the status in the allClaimsData array
          const claimIndex = allClaimsData.findIndex(c => c.ticket_id === claim.ticket_id);
          if (claimIndex !== -1) {
            allClaimsData[claimIndex].refund_status = newStatus;
          }
          
          // Refresh the claims displays
          const packageClaims = allClaimsData.filter(claim => claim.package_id);
          displayAllClaims(allClaimsData);
          displayPackageClaims(packageClaims);
          
          // Update dashboard statistics
          updateDashboardStats(allClaimsData);
          
          // Show success notification
          showNotification("Status updated successfully", "success");
        } else {
          // Show error notification
          showNotification("Failed to update status", "error");
        }
      } catch (error) {
        console.error("Error updating claim status:", error);
        showNotification("Error updating status", "error");
      }
    });
  }
  
  // ===== Utility Functions =====
  
  // Format claim type for display
  function formatClaimType(claimType) {
    if (!claimType) return "N/A";
    
    // Map database values to user-friendly display names
    const typeMap = {
      "Lost": "Lost Package",
      "Delayed": "Delivery Delay",
      "Damaged": "Package Damage",
      "Other": "Other Issue"
    };
    
    return typeMap[claimType] || claimType;
  }
  
  // Format date for display
  function formatDate(dateString) {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      
      return date.toLocaleString('en-US', {
        timeZone: 'America/Chicago',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit' 
      });
    } catch (e) {
      console.error("Date formatting error:", e);
      return dateString;
    }
  }
  
  // Show notification
  function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement("div");
    notification.classList.add("notification", type);
    notification.textContent = message;
    
    // Append to body
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.add("fade-out");
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
});