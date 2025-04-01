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

    if (response.ok) {
      alert("Claim submitted successfully!");
      document.getElementById("support-form").reset();
      loadSupportTickets();
    } else {
      alert(data.message || "Failed to submit claim. Please try again.");
    }
  } catch (error) {
    console.error("Error submitting claim:", error);
    alert("Network error. Please try again later.");
  }
});

async function loadSupportTickets() {
  const ticketList = document.getElementById("ticket-list");
  ticketList.innerHTML = "<li>Loading tickets...</li>";

  try {
    const response = await fetch("/claims");
    const data = await response.json();

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
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>Claim #${claim.claim_id}</strong><br/>
        <em>Customer:</em> ${claim.name || "Unknown"} (Email: ${claim.email || "N/A"})<br/>
        <em>Phone:</em> ${claim.phone}<br/>
        <em>Claim Type:</em> ${formatClaimType(claim.claimType)}<br/>
        <em>Reason:</em> ${claim.reason}<br/>
        <em>Status:</em> ${claim.status}<br/>
        <em>Processed Date:</em> ${claim.processed_date}
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
  
  const typeMap = {
    "delay": "Delay",
    "loss": "Loss",
    "damage": "Damage",
    "theft": "Theft",
    "incorrect_delivery": "Incorrect Delivery",
    "incomplete": "Incomplete"
  };
  
  return typeMap[claimType] || claimType;
}

document.addEventListener("DOMContentLoaded", loadSupportTickets);