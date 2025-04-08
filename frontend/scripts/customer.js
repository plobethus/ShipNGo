document.addEventListener("DOMContentLoaded", async function () {
  try {
    const response = await fetch("/packages/customer", {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    });
    const data = await response.json();
    const packageContainer = document.getElementById("customer-packages");
    packageContainer.innerHTML = `
      <h2 class="packages-title">Your Packages</h2>
      <div class="packages-grid">
        ${data && data.length > 0 ? 
          data.map(pkg => `
            <div class="package-card">
              <div class="package-header">
                <span class="package-id">Package #${pkg.package_id}</span>
                <span class="package-status ${pkg.status.toLowerCase().replace(' ', '-')}">
                  ${pkg.status}
                </span>
              </div>
              <div class="package-details">
                <div class="package-route">
                  <div class="route-from">
                    <i class="icon-send"></i>
                    <span>From: ${pkg.address_from}</span>
                  </div>
                  <div class="route-to">
                    <i class="icon-location"></i>
                    <span>To: ${pkg.address_to}</span>
                  </div>
                </div>
                <div class="package-weight">
                  <i class="icon-weight"></i>
                  <span>Weight: ${pkg.weight} kg</span>
                </div>
              </div>
            </div>
          `).join('') : 
          `<div class="no-packages">
            <p>No packages found.</p>
            <p>Start shipping today!</p>
          </div>`
        }
      </div>
    `;
  } catch (error) {
    console.error("Error fetching customer packages:", error);
    document.getElementById("customer-packages").innerHTML = `
      <div class="error-message">
        <p>Unable to load packages</p>
        <p>Please try again later</p>
      </div>
    `;
  }
});