// /ShipNGo/frontend/scripts/trackingpage.js
document.addEventListener("DOMContentLoaded", async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const packageId = urlParams.get('trackingNumber');

  if (!packageId) {
    document.getElementById("tracking-info").innerHTML = "<p style='color:red;'>No package ID provided in URL.</p>";
    return;
  }

  try {
    const fetchUrl = `/tracking/${encodeURIComponent(packageId)}`;
    const response = await fetch(fetchUrl);
    const history = (await response.json()).history;

    
    if (!response.ok || !Array.isArray(history) || history.length === 0) {
      document.getElementById("tracking-info").innerHTML = "<p style='color:red;'>Tracking info not found.</p>";
      return;
    }

    const latest = history[0];

    document.getElementById("tracking-id").textContent = latest.package_id;
    document.getElementById("tracking-status").textContent = latest.status;
    document.getElementById("post-office").textContent = latest.post_office_address || "N/A";
    document.getElementById("warehouse").textContent = latest.warehouse_location || "N/A";

    // Optional full history list
    const historyList = document.getElementById("history-list");
    history.forEach(entry => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${entry.status}</strong> at 
        <em>${entry.post_office_address || "Unknown PO"}</em> /
        <em>${entry.warehouse_location || "Unknown WH"}</em> 
        on ${new Date(entry.updated_at).toLocaleString()}
      `;
      historyList.appendChild(li);
    });

  } catch (error) {
    console.error("Error fetching tracking info:", error);
    document.getElementById("tracking-info").innerHTML = "<p style='color:red;'>An error occurred while fetching tracking details.</p>";
  }
});
