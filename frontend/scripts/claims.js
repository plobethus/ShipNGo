// /ShipNGo/frontend/scripts/claims.js
document.getElementById("support-form").addEventListener("submit", async function (event) {
  event.preventDefault();

  const firstName = document.getElementById("first-name").value.trim();
  const lastName = document.getElementById("last-name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const package_id = document.getElementById("package-id").value.trim();
  const claimType = document.getElementById("claim-type").value;
  const issue = document.getElementById("issue").value.trim(); // stored as 'reason' in the DB

  if (!firstName || !lastName || !email || !phone || !claimType || !issue) {
    alert("Please fill in all required fields.");
    return;
  }

  const name = `${firstName} ${lastName}`;
  
  // Enhanced logging
  console.log("======== FORM SUBMISSION DATA ========");
  console.log("firstName:", firstName);
  console.log("lastName:", lastName);
  console.log("email:", email);
  console.log("phone:", phone);
  console.log("package_id:", package_id);
  console.log("claimType:", claimType);
  console.log("issue:", issue);
  console.log("======================================");

  try {
    const response = await fetch("/claims", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        firstName,
        lastName,
        name,
        email, 
        phone,
        package_id, // Added package ID
        claimType,
        reason: issue 
      })
    });
    
    const data = await response.json();
    console.log("Response data:", data);

    if (response.ok) {
      alert("Claim submitted successfully!");
      document.getElementById("support-form").reset();
      loadSupportTickets(); // Re-enable this to show updated list
    } else {
      alert(data.message || "Failed to submit claim. Please try again.");
    }
  } catch (error) {
    console.error("Error submitting claim:", error);
    alert("Network error. Please try again later.");
  }
});

// Re-enable loading tickets on page load
document.addEventListener("DOMContentLoaded", () => {
  loadSupportTickets();
  setupFilterListeners();
  
  // Set default date range (last 30 days)
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  document.getElementById("date-to").valueAsDate = today;
  document.getElementById("date-from").valueAsDate = thirtyDaysAgo;
});

// Setup filter event listeners
function setupFilterListeners() {
  const applyFiltersBtn = document.getElementById("apply-filters");
  const resetFiltersBtn = document.getElementById("reset-filters");
  
  applyFiltersBtn.addEventListener("click", () => {
    filterTickets();
  });
  
  resetFiltersBtn.addEventListener("click", () => {
    // Reset date inputs to last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    document.getElementById("date-to").valueAsDate = today;
    document.getElementById("date-from").valueAsDate = thirtyDaysAgo;
    
    // Reset claim type filter
    document.getElementById("filter-type").value = "all";
    
    // Apply the reset filters
    filterTickets();
  });
}

// Store all tickets for filtering
let allTickets = [];

async function loadSupportTickets() {
  const ticketList = document.getElementById("ticket-list");
  
  // Display loading state
  ticketList.innerHTML = "<tr><td colspan='4'>Loading tickets...</td></tr>";

  try {
    const response = await fetch("/claims");
    const data = await response.json();
    console.log("Ticket data received:", data);

    if (!response.ok) {
      ticketList.innerHTML = `<tr><td colspan="4">${data.message || "Error loading tickets."}</td></tr>`;
      return;
    }

    // Clear the table
    ticketList.innerHTML = "";
    
    if (!data.claims || data.claims.length === 0) {
      ticketList.innerHTML = "<tr class='empty-row'><td colspan='4'>No support tickets yet.</td></tr>";
      // Update statistics with zeros
      updateStatistics([]);
      return;
    }

    // Sort claims by processed_date (newest first)
    data.claims.sort((a, b) => {
      return new Date(b.processed_date || 0) - new Date(a.processed_date || 0);
    });
    
    // Store all tickets for filtering
    allTickets = data.claims;
    
    // Update statistics
    updateStatistics(allTickets);
    
    // Apply initial filters
    filterTickets();
  } catch (error) {
    console.error("Error loading tickets:", error);
    ticketList.innerHTML = "<tr><td colspan='4'>Error loading tickets.</td></tr>";
    // Update statistics with zeros in case of error
    updateStatistics([]);
  }
}

// Update statistics based on tickets
function updateStatistics(tickets) {
  // Initialize counters
  let total = tickets.length;
  let delayed = 0;
  let lost = 0;
  let damaged = 0;
  let other = 0;
  
  // Count each type
  tickets.forEach(ticket => {
    switch(ticket.issue_type) {
      case 'Delayed':
        delayed++;
        break;
      case 'Lost':
        lost++;
        break;
      case 'Damaged':
        damaged++;
        break;
      case 'Other':
        other++;
        break;
    }
  });
  
  // Update DOM elements
  document.getElementById('total-tickets').textContent = total;
  document.getElementById('delayed-tickets').textContent = delayed;
  document.getElementById('lost-tickets').textContent = lost;
  document.getElementById('damaged-tickets').textContent = damaged;
  document.getElementById('other-tickets').textContent = other;
  
  // Update statistics appearance based on counts
  updateStatAppearance('total-tickets', total);
  updateStatAppearance('delayed-tickets', delayed);
  updateStatAppearance('lost-tickets', lost);
  updateStatAppearance('damaged-tickets', damaged);
  updateStatAppearance('other-tickets', other);
}

// Update the visual appearance of a statistic based on its value
function updateStatAppearance(elementId, value) {
  const element = document.getElementById(elementId);
  
  // Add emphasis for non-zero values
  if (value > 0) {
    element.style.color = 'white';
  } else {
    element.style.color = 'rgba(255, 255, 255, 0.5)';
  }
}

// Filter tickets based on selected criteria
function filterTickets() {
  const ticketList = document.getElementById("ticket-list");
  const dateFrom = document.getElementById("date-from").valueAsDate;
  const dateTo = document.getElementById("date-to").valueAsDate;
  const claimType = document.getElementById("filter-type").value;
  
  // Create date objects for comparison that include full days
  let fromDate = null;
  let toDate = null;
  
  if (dateFrom) {
    // Set time to beginning of day (00:00:00)
    fromDate = new Date(dateFrom);
    fromDate.setHours(0, 0, 0, 0);
  }
  
  if (dateTo) {
    // Set time to end of day (23:59:59.999) to include the entire day
    toDate = new Date(dateTo);
    toDate.setHours(23, 59, 59, 999);
  }
  
  // Clear the table
  ticketList.innerHTML = "";
  
  // Filter the tickets
  const filteredTickets = allTickets.filter(ticket => {
    // Make sure we have a valid date to compare
    if (!ticket.processed_date) return false;
    
    // Create a date object from the ticket's processed_date
    const ticketDate = new Date(ticket.processed_date);
    
    // Ensure the ticketDate is valid before comparing
    if (isNaN(ticketDate.getTime())) return false;
    
    // Filter by date range if dates are provided
    const passesDateFilter = (!fromDate || ticketDate >= fromDate) && 
                            (!toDate || ticketDate <= toDate);
    
    // Filter by claim type if not "all"
    const passesTypeFilter = claimType === "all" || ticket.issue_type === claimType;
    
    return passesDateFilter && passesTypeFilter;
  });
  
  // Update statistics based on filtered tickets
  updateStatistics(filteredTickets);
  
  // Display filtered tickets or empty state
  if (filteredTickets.length === 0) {
    ticketList.innerHTML = "<tr class='empty-row'><td colspan='4'>No tickets match your filter criteria.</td></tr>";
  } else {
    displayTickets(filteredTickets);
  }
}

// Display tickets in the table
function displayTickets(tickets) {
  const ticketList = document.getElementById("ticket-list");
  
  tickets.forEach(claim => {
    // Create a new table row
    const tr = document.createElement("tr");
    
    // Format date cell
    const dateCell = document.createElement("td");
    dateCell.textContent = formatDate(claim.processed_date);
    
    // Format type cell
    const typeCell = document.createElement("td");
    typeCell.textContent = formatClaimType(claim.issue_type);
    
    // Format package ID cell
    const packageIdCell = document.createElement("td");
    packageIdCell.textContent = claim.package_id || "N/A";
    
    // Format status cell
    const statusCell = document.createElement("td");
    statusCell.textContent = claim.refund_status || "N/A";
    
    // Add click event to show ticket details
    tr.addEventListener("click", () => {
      showTicketDetails(claim);
    });
    
    // Add class to indicate clickable row
    tr.classList.add("clickable-row");
    
    // Append cells to row
    tr.appendChild(dateCell);
    tr.appendChild(typeCell);
    tr.appendChild(packageIdCell);
    tr.appendChild(statusCell);
    
    // Append row to table
    ticketList.appendChild(tr);
  });
}

// Function to show ticket details in a modal dialog
function showTicketDetails(claim) {
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
  
  // Set modal content
  modalContainer.innerHTML = `
    <div class="modal-header">
      <h3>Ticket #${claim.ticket_id || 'N/A'}</h3>
      <button class="close-btn">&times;</button>
    </div>
    <div class="modal-body">
      <p><strong>Customer:</strong> ${fullName}</p>
      <p><strong>Email:</strong> ${claim.email || "N/A"}</p>
      <p><strong>Phone:</strong> ${claim.phone_number || "N/A"}</p>
      <p><strong>Package ID:</strong> ${claim.package_id || "N/A"}</p>
      <p><strong>Claim Type:</strong> ${formatClaimType(claim.issue_type)}</p>
      <p><strong>Status:</strong> ${claim.refund_status || "N/A"}</p>
      <p><strong>Processed Date:</strong> ${formatDate(claim.processed_date)}</p>
      <div class="claim-reason">
        <strong>Reason:</strong>
        <p>${claim.reason || "N/A"}</p>
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
}

// Format claim type for display
function formatClaimType(claimType) {
  if (!claimType) return "N/A";
  
  // Updated to match the database ENUM values
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