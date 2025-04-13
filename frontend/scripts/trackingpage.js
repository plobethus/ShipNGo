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

    console.log(latest);

    document.getElementById("tracking-id").textContent = latest.package_id;
    document.getElementById("tracking-status").textContent = latest.status;
    document.getElementById("warehouse").textContent = ((latest.location_type || "") + " " + (latest.location_name || "Unknown Location Name") + " (" + (latest.location_address || "Unknown Address") + ")" ) ;

    const historyList = document.getElementById("history-list");
    history.forEach(entry => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${entry.status}</strong> at 
        <em>${((entry.location_type || "") + " " +(entry.location_name || "Unknown Location Name") + " (" + (entry.location_address || "Unknown Address") + ")")}</em> /
        on ${new Date(entry.changed_at).toLocaleString()}
      `;
      historyList.appendChild(li);
    });

  } catch (error) {
    console.error("Error fetching tracking info:", error);
    document.getElementById("tracking-info").innerHTML = "<p style='color:red;'>An error occurred while fetching tracking details.</p>";
  }
});
