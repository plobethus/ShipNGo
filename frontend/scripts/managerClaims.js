document.addEventListener("DOMContentLoaded", async function () {
  // Store all claims data for filtering
  let allClaimsData = [];
  
  try {
    // Show loading state in table
    document.getElementById("claims-table").innerHTML = `<tr><td colspan="8" style="text-align:center;">Loading claims data...</td></tr>`;
    
    // Fetch claims data
    const response = await fetch("/api/claims/");
    const claimsData = await response.json();
    
    // Store claims data
    allClaimsData = Array.isArray(claimsData) ? claimsData : [];
    
    // Sort claims by processed_date (newest first)
    allClaimsData.sort((a, b) => {
      return new Date(b.processed_date || 0) - new Date(a.processed_date || 0);
    });
    
    // Update dashboard statistics initially
    updateDashboardStats(allClaimsData);
    
    // Display claims in table
    if (allClaimsData.length > 0) {
      // Initialize with "all" view
      updateTableHeaders("all");
      displayClaims(allClaimsData);
    } else {
      document.getElementById("claims-table").innerHTML = `<tr><td colspan="8" style="text-align:center;">No claims available</td></tr>`;
    }
    
    // Set up filter options
    populateIssueTypeFilters(allClaimsData);
    
    // Set up filter button event listeners
    setupFilters();
    
  } catch (err) {
    console.error("Error loading claims:", err);
    document.getElementById("claims-table").innerHTML = `<tr><td colspan="8" style="text-align:center;color:red;">Error loading claims data</td></tr>`;
    updateDashboardStats([]);
  }
  
  // ===== Dashboard Statistics Functions =====
  
  // Update dashboard statistics
  function updateDashboardStats(claimsData) {
    if (!Array.isArray(claimsData) || claimsData.length === 0) {
      document.getElementById("total-claims-count").textContent = "0";
      document.getElementById("pending-claims-count").textContent = "0";
      document.getElementById("resolution-rate").textContent = "0%";
      document.getElementById("approved-cost").textContent = "$0.00";
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
    
    // Calculate total cost of approved packages
    const approvedClaims = claimsData.filter(claim => 
      claim.refund_status === "Approved" && claim.package_id
    );
    
    let totalApprovedCost = 0;
    for (const claim of approvedClaims) {
      if (claim.cost !== undefined && claim.cost !== null) {
        // Convert to number if it's a string
        const cost = typeof claim.cost === 'string' ? parseFloat(claim.cost) : claim.cost;
        // Add to total if it's a valid number
        if (!isNaN(cost)) {
          totalApprovedCost += cost;
        }
      }
    }
    
    // Format cost to 2 decimal places with dollar sign
    const formattedCost = `$${totalApprovedCost.toFixed(2)}`;
    
    // Update UI with values
    document.getElementById("total-claims-count").textContent = totalClaims;
    document.getElementById("pending-claims-count").textContent = pendingClaims;
    document.getElementById("resolution-rate").textContent = `${resolutionRate}%`;
    document.getElementById("approved-cost").textContent = formattedCost;
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
    
    // Populate issue type filter
    const issueFilter = document.getElementById("issue-type-filter");
    if (issueFilter) {
      // Clear existing options except "All Issues"
      while (issueFilter.options.length > 1) {
        issueFilter.remove(1);
      }
      
      // Add new options
      issueTypes.forEach(issueType => {
        const option = document.createElement("option");
        option.value = issueType;
        option.textContent = formatClaimType(issueType);
        issueFilter.appendChild(option);
      });
    }
  }
  
  // Set up filter button event listeners
  function setupFilters() {
    const applyFiltersBtn = document.getElementById("apply-filters");
    const resetFiltersBtn = document.getElementById("reset-filters");
    
    if (applyFiltersBtn) {
      applyFiltersBtn.addEventListener("click", function() {
        const packageStatusFilter = document.getElementById("package-status-filter").value;
        
        // First filter based on package status
        let initialFilteredData = allClaimsData;
        
        if (packageStatusFilter === "with-package") {
          initialFilteredData = allClaimsData.filter(claim => claim.package_id);
        } else if (packageStatusFilter === "without-package") {
          initialFilteredData = allClaimsData.filter(claim => !claim.package_id);
        }
        
        // Then apply other filters
        const filteredClaims = filterClaims(initialFilteredData, {
          dateFilter: document.getElementById("date-filter").value,
          customerFilter: document.getElementById("customer-filter").value.trim(),
          packageFilter: document.getElementById("package-filter").value.trim(),
          statusFilter: document.getElementById("status-filter").value,
          issueTypeFilter: document.getElementById("issue-type-filter").value
        });
        
        // Update table headers based on package status filter
        updateTableHeaders(packageStatusFilter);
        
        // Update table data
        displayClaims(filteredClaims);
        
        // Update dashboard statistics
        updateDashboardStats(filteredClaims);
      });
    }
    
    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener("click", function() {
        document.getElementById("date-filter").value = "";
        document.getElementById("package-status-filter").value = "all";
        document.getElementById("customer-filter").value = "";
        document.getElementById("package-filter").value = "";
        document.getElementById("status-filter").value = "";
        document.getElementById("issue-type-filter").value = "";
        
        // Reset table headers to show all columns
        updateTableHeaders("all");
        
        // Reset table data
        displayClaims(allClaimsData);
        
        // Reset dashboard stats
        updateDashboardStats(allClaimsData);
      });
    }
    
    // Remove the immediate feedback event listener from package status filter
    // This is the key change to prevent immediate UI updates when changing filters
  }
  
  // Update table headers based on package status selection
  function updateTableHeaders(packageStatus) {
    const headerRow = document.getElementById("claims-table-header");
    if (!headerRow) return;
    
    // Clear existing headers
    headerRow.innerHTML = "";
    
    // Common headers for all views
    const commonHeaders = ["Ticket ID", "Issue Type", "Processed Date"];
    
    // Headers specific to different views
    let specificHeaders = [];
    
    if (packageStatus === "with-package") {
      specificHeaders = ["Package ID", "Weight", "Dimensions", "Cost($USD)", "Customer ID","Refund Status"];
    } else if (packageStatus === "without-package") {
      specificHeaders = ["Customer Name", "Customer ID", "Refund Status"];
    } else {
      // All claims view
      specificHeaders = ["Reason", "Customer Name", "Customer ID", "Package Details", "Refund Status"];
    }
    
    // Add all headers to the row
    [...commonHeaders, ...specificHeaders].forEach(header => {
      const th = document.createElement("th");
      th.textContent = header;
      headerRow.appendChild(th);
    });
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
  
  // Display claims in table based on current package status filter
  function displayClaims(claims) {
    const tableBody = document.getElementById("claims-table");
    if (!tableBody) return;
    
    tableBody.innerHTML = "";
    
    if (claims.length === 0) {
      const packageStatusFilter = document.getElementById("package-status-filter").value;
      let colspan = 8;
      
      // Adjust colspan based on filter
      if (packageStatusFilter === "with-package") {
        colspan = 8;
      } else if (packageStatusFilter === "without-package") {
        colspan = 6;
      }
      
      tableBody.innerHTML = `<tr><td colspan="${colspan}" style="text-align:center;">No claims match the selected filters</td></tr>`;
      return;
    }
    
    const packageStatusFilter = document.getElementById("package-status-filter").value;
    
    claims.forEach(claim => {
      const row = document.createElement("tr");
      row.classList.add("clickable-row");
      
      // Add click event to show claim details
      row.addEventListener("click", () => {
        showClaimDetails(claim);
      });
      
      // Format date for display
      let formattedDate = formatDate(claim.processed_date);
      
      // Different row formats based on filter
      if (packageStatusFilter === "with-package" && claim.package_id) {
        row.innerHTML = `
          <td>${claim.ticket_id || "N/A"}</td>
          <td>${formatClaimType(claim.issue_type) || "N/A"}</td>
          <td>${formattedDate}</td>
          <td>${claim.package_id || "N/A"}</td>
          <td>${claim.weight !== undefined && claim.weight !== null ? claim.weight : "N/A"}</td>
          <td>${claim.dimensions !== undefined && claim.dimensions !== null ? claim.dimensions : "N/A"}</td>
          <td>${claim.cost !== undefined && claim.cost !== null ? claim.cost : "N/A"}</td>
          <td>${claim.customer_id || "N/A"}</td>
          <td>${claim.refund_status || "Pending"}</td>
        `;
      } else if (packageStatusFilter === "without-package" && !claim.package_id) {
        row.innerHTML = `
          <td>${claim.ticket_id || ""}</td>
          <td>${formatClaimType(claim.issue_type) || ""}</td>
          <td>${formattedDate}</td>
          <td>${claim.first_name || ""} ${claim.last_name || ""}</td>
          <td>${claim.customer_id || ""}</td>
          <td>${claim.refund_status || "Pending"}</td>
        `;
      } else {
        // Create package details section
        let packageInfo = "No package";
        if (claim.package_id) {
          packageInfo = `ID: ${claim.package_id}`;
          
          if (claim.weight !== undefined && claim.weight !== null) packageInfo += `<br>Weight: ${claim.weight}`;
          if (claim.dimensions !== undefined && claim.dimensions !== null) packageInfo += `<br>Dim: ${claim.dimensions}`;
          if (claim.cost !== undefined && claim.cost !== null) packageInfo += `<br>Cost($USD): ${claim.cost}`;
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
      }
      
      tableBody.appendChild(row);
    });
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
        <p><strong>Cost($USD):</strong> ${claim.cost || "N/A"}</p>
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
        // API call to update claim status
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
          
          // Get current package status filter
          const packageStatusFilter = document.getElementById("package-status-filter").value;
          
          // Apply filters to refresh display
          let filteredData = allClaimsData;
          if (packageStatusFilter === "with-package") {
            filteredData = allClaimsData.filter(claim => claim.package_id);
          } else if (packageStatusFilter === "without-package") {
            filteredData = allClaimsData.filter(claim => !claim.package_id);
          }
          
          // Refresh the claims display
          displayClaims(filteredData);
          
          // Update dashboard statistics
          updateDashboardStats(filteredData);
          
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