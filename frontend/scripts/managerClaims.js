document.addEventListener("DOMContentLoaded", async function () {
    // Get revenue sum only if the total-container element exists
    const totalContainer = document.getElementById("total-container");
    if (totalContainer) {
      try {
        const sumResponse = await fetch("/api/claims/sum");
        const sumData = await sumResponse.json(); 
        
        if (Array.isArray(sumData) && sumData.length > 0) {
          const totalRevenue = sumData[0].total_sum || 0;
          totalContainer.textContent = `Total Revenue: $${totalRevenue}`;
        } else if (sumData && sumData.total_sum !== undefined) {
          totalContainer.textContent = `Total Revenue: $${sumData.total_sum}`;
        } else {
          totalContainer.textContent = "Total Revenue: $0";
        }
      } catch (err) {
        console.error("Error fetching sum of transactions:", err);
        totalContainer.textContent = "Error loading revenue data";
      }
    }
  
    try {
      // Fetch and display claims data
      const response = await fetch("/api/claims/");
      const claimsData = await response.json();
      
      // Debug: Log the first claim to see what properties are available
      if (Array.isArray(claimsData) && claimsData.length > 0) {
        console.log("First claim data:", claimsData[0]);
        
        // Check if weight and dimensions fields exist in the response
        const firstClaim = claimsData[0];
        console.log("weight exists:", "weight" in firstClaim);
        console.log("dimensions exists:", "dimensions" in firstClaim);
        
        if (firstClaim.package_id) {
          console.log("This claim has a package_id:", firstClaim.package_id);
          console.log("Weight value:", firstClaim.weight);
          console.log("Dimensions value:", firstClaim.dimensions);
        }
      }
  
      const tableBody = document.getElementById("complaint-table");
      if (!tableBody) {
        console.error("Could not find complaint-table element");
        return;
      }
      
      tableBody.innerHTML = ""; 
  
      if (Array.isArray(claimsData) && claimsData.length > 0) {
        // Display all claims in the main table
        displayAllClaims(claimsData);
        
        // Display claims with packages in the package claims table
        const claimsWithPackages = claimsData.filter(claim => claim.package_id);
        console.log("Found", claimsWithPackages.length, "claims with packages");
        
        if (claimsWithPackages.length > 0) {
          console.log("Sample package claim:", claimsWithPackages[0]);
        }
        
        displayPackageClaims(claimsWithPackages);
      } else {
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="8" style="text-align:center;">No claims available</td>`;
        tableBody.appendChild(row);
        
        // Show "no data" message in package claims table
        const packageClaimsTable = document.getElementById("package-claims-table");
        if (packageClaimsTable) {
          packageClaimsTable.innerHTML = `<tr><td colspan="7" style="text-align:center;">No claims with packages found</td></tr>`;
        }
      }
      
      // Also load claims without packages for the separate tab
      loadClaimsWithoutPackages();
      
    } catch (err) {
      console.error("Error loading claims:", err);
      const tableBody = document.getElementById("complaint-table");
      if (tableBody) {
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="8" style="text-align:center;color:red;">Error loading claims data</td>`;
        tableBody.appendChild(row);
      }
    }
    
    // Function to display all claims in the main table
    function displayAllClaims(claims) {
      const tableBody = document.getElementById("complaint-table");
      if (!tableBody) return;
      
      tableBody.innerHTML = "";
      
      claims.forEach(claim => {
        const row = document.createElement("tr");
        
        // Format date if it exists
        let formattedDate = "";
        if (claim.processed_date) {
          const date = new Date(claim.processed_date);
          formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        }
        
        // Create package details section
        let packageInfo = "No package";
        if (claim.package_id) {
          packageInfo = `ID: ${claim.package_id}`;
          
          // Check for weight and dimensions fields and log their values for debugging
          console.log(`Claim ${claim.ticket_id} with package ${claim.package_id}:`);
          console.log("  weight:", claim.weight);
          console.log("  dimensions:", claim.dimensions);
          
          if (claim.weight !== undefined && claim.weight !== null) packageInfo += `<br>Weight: ${claim.weight}`;
          if (claim.dimensions !== undefined && claim.dimensions !== null) packageInfo += `<br>Dim: ${claim.dimensions}`;
        }
        
        row.innerHTML = `
          <td>${claim.ticket_id || ""}</td>
          <td>${claim.issue_type || ""}</td>
          <td>${formattedDate || ""}</td>
          <td>${claim.reason || ""}</td>
          <td>${claim.first_name || ""} ${claim.last_name || ""}</td>
          <td>${claim.customer_id || ""}</td>
          <td>${packageInfo}</td>
          <td>${claim.refund_status || ""}</td>
        `;
        tableBody.appendChild(row);
      });
    }
    
    // Function to display claims with packages in the package claims table
    function displayPackageClaims(claimsWithPackages) {
      const packageClaimsTable = document.getElementById("package-claims-table");
      if (!packageClaimsTable) return;
      
      packageClaimsTable.innerHTML = "";
      
      if (claimsWithPackages.length === 0) {
        packageClaimsTable.innerHTML = `<tr><td colspan="7" style="text-align:center;">No claims with packages found</td></tr>`;
        return;
      }
      
      claimsWithPackages.forEach(claim => {
        const row = document.createElement("tr");
        
        // Display all properties of the claim for this package for debugging
        console.log(`Generating row for claim ${claim.ticket_id}, package ${claim.package_id}`);
        for (const key in claim) {
          console.log(`  ${key}: ${claim[key]}`);
        }
        
        // Use the actual values from the package-related fields
        // Use more robust null/undefined checking
        row.innerHTML = `
          <td>${claim.ticket_id || "N/A"}</td>
          <td>${claim.issue_type || "N/A"}</td>
          <td>${claim.package_id || "N/A"}</td>
          <td>${claim.weight !== undefined && claim.weight !== null ? claim.weight : "N/A"}</td>
          <td>${claim.dimensions !== undefined && claim.dimensions !== null ? claim.dimensions : "N/A"}</td>
          <td>${claim.customer_id || "N/A"}</td>
          <td>${claim.refund_status || "Pending"}</td>
        `;
        packageClaimsTable.appendChild(row);
      });
    }
    
    // Function to load claims without packages for the separate tab
    async function loadClaimsWithoutPackages() {
      const noPackageClaimsTable = document.getElementById("no-package-claims-table");
      if (!noPackageClaimsTable) return; // Skip if the element doesn't exist
      
      try {
        const response = await fetch("/api/claims/without-packages");
        const claimsData = await response.json();
        
        noPackageClaimsTable.innerHTML = "";
        
        if (Array.isArray(claimsData) && claimsData.length > 0) {
          claimsData.forEach(claim => {
            const row = document.createElement("tr");
            
            // Format date if it exists
            let formattedDate = "";
            if (claim.processed_date) {
              const date = new Date(claim.processed_date);
              formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            }
            
            row.innerHTML = `
              <td>${claim.ticket_id || ""}</td>
              <td>${claim.issue_type || ""}</td>
              <td>${formattedDate || ""}</td>
              <td>${claim.first_name || ""} ${claim.last_name || ""}</td>
            `;
            noPackageClaimsTable.appendChild(row);
          });
        } else {
          const row = document.createElement("tr");
          row.innerHTML = `<td colspan="4" style="text-align:center;">No claims without packages found</td>`;
          noPackageClaimsTable.appendChild(row);
        }
      } catch (err) {
        console.error("Error loading claims without packages:", err);
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="4" style="text-align:center;color:red;">Error loading claims data</td>`;
        noPackageClaimsTable.appendChild(row);
      }
    }
  });