// /ShipNGo/frontend/scripts/trackingpage.js
document.addEventListener("DOMContentLoaded", async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const packageId = urlParams.get('trackingNumber');

  if (!packageId) {
    document.querySelector('.tracking-body').innerHTML = "<p style='color:red; padding: 20px; text-align: center;'>No package ID provided in URL. Please check your tracking number and try again.</p>";
    document.getElementById("tracking-id").textContent = "Not Found";
    return;
  }

  try {
    const fetchUrl = `/tracking/${encodeURIComponent(packageId)}`;
    const response = await fetch(fetchUrl);
    const history = (await response.json()).history;

    if (!response.ok || !Array.isArray(history) || history.length === 0) {
      document.querySelector('.tracking-body').innerHTML = "<p style='color:red; padding: 20px; text-align: center;'>Tracking information not found. Please check your tracking number and try again.</p>";
      document.getElementById("tracking-id").textContent = packageId;
      return;
    }

    const latest = history[0];

    if (latest.location_type == "WAREHOUSE"){
      latest.location_type = "Warehouse";
    } else {
      latest.location_type = "Post Office";
    }


    document.getElementById("tracking-id").textContent = latest.package_id;
    document.getElementById("tracking-status").textContent = latest.status;


    if (latest.location_id == 10){
      document.getElementById("warehouse").textContent = "Awaiting drop off";

    } else{
      document.getElementById("warehouse").textContent = ((latest.location_name || "Unknown Location Name") + " (" + (latest.location_type || "") + " at " + (latest.location_address || "Unknown Address") + ")");
    }
    const historyList = document.getElementById("history-list");
    historyList.innerHTML = '';
    
    history.forEach((entry, index) => {
      const timelineItem = document.createElement("div");
      timelineItem.className = `timeline-item ${index === 0 ? 'current' : ''}`;

      if (entry.location_type == "WAREHOUSE"){
        entry.location_type = "Warehouse";
      } else {
        entry.location_type = "Post Office";
      }
      

      if (entry.location_id == 10){
        timelineItem.innerHTML = `
        <div class="timeline-content">
          <div class="timeline-date">${new Date(entry.changed_at).toLocaleString()}</div>
          <div class="timeline-status">${entry.status}</div>
          <div class="timeline-location">Awaiting drop off.</div>
        </div>
      `;  
      } else{
        timelineItem.innerHTML = `
        <div class="timeline-content">
          <div class="timeline-date">${new Date(entry.changed_at).toLocaleString()}</div>
          <div class="timeline-status">${entry.status}</div>
          <div class="timeline-location">${((entry.location_name || "Unknown Location Name") + " (" + (entry.location_type || "") + " at " + (entry.location_address || "Unknown Address") + ")")}</div>
        </div>
      `;      }
      
      
      historyList.appendChild(timelineItem);
    });

  } catch (error) {
    console.error("Error fetching tracking info:", error);
    document.querySelector('.tracking-body').innerHTML = "<p style='color:red; padding: 20px; text-align: center;'>An error occurred while fetching tracking details. Please try again later.</p>";
    document.getElementById("tracking-id").textContent = packageId || "Error";
  }
});