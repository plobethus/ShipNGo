// /ShipNGo/frontend/scripts/claims.js
document.getElementById("support-form").addEventListener("submit", async function (event) {
  event.preventDefault();

  const firstName = document.getElementById("first-name").value.trim();
  const lastName = document.getElementById("last-name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const claimType = document.getElementById("claim-type").value;
  const issue = document.getElementById("issue").value.trim(); // stored as 'reason' in the DB

  if (!firstName || !lastName || !email || !phone || !claimType || !issue) {
    alert("Please fill in all fields.");
    return;
  }

  const name = `${firstName} ${lastName}`;
  
  // Enhanced logging
  console.log("======== FORM SUBMISSION DATA ========");
  console.log("firstName:", firstName);
  console.log("lastName:", lastName);
  console.log("email:", email);
  console.log("phone:", phone);
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
document.addEventListener("DOMContentLoaded", loadSupportTickets);

async function loadSupportTickets() {
  const ticketList = document.getElementById("ticket-list");
  ticketList.innerHTML = "<li>Loading tickets...</li>";

  try {
    const response = await fetch("/claims");
    const data = await response.json();
    console.log("Ticket data received:", data);

    if (!response.ok) {
      ticketList.innerHTML = `<li>${data.message || "Error loading tickets."}</li>`;
      return;
    }

    ticketList.innerHTML = "";
    if (!data.claims || data.claims.length === 0) {
      ticketList.innerHTML = "<li class='empty'>No support tickets yet.</li>";
      return;
    }

    data.claims.forEach(claim => {
      // Create a fullname from first_name and last_name
      const fullName = (claim.first_name && claim.last_name) 
        ? `${claim.first_name} ${claim.last_name}` 
        : "Unknown";
      
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>Ticket #${claim.ticket_id || 'N/A'}</strong><br/>
        <em>Customer:</em> ${fullName} (Email: ${claim.email || "N/A"})<br/>
        <em>Phone:</em> ${claim.phone_number || "N/A"}<br/>
        <em>Claim Type:</em> ${formatClaimType(claim.issue_type)}<br/>
        <em>Reason:</em> ${claim.reason || "N/A"}<br/>
        <em>Status:</em> ${claim.refund_status || "N/A"}<br/>
        <em>Processed Date:</em> ${formatDate(claim.processed_date)}
      `;
      ticketList.appendChild(li);
    });
  } catch (error) {
    console.error("Error loading tickets:", error);
    ticketList.innerHTML = "<li>Error loading tickets.</li>";
  }
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