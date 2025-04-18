// /ShipNGo/frontend/scripts/header.js
document.addEventListener("DOMContentLoaded", () => {
  fetch("/includes/header.html")
    .then((res) => res.text())
    .then((html) => {
      document.getElementById("header-include").innerHTML = html;
      initializeHeader();
    })
    .catch((err) => console.error("Failed to load header:", err));
});

function initializeHeader() {
  const role = sessionStorage.getItem("role");

  const dashboardLink = document.getElementById("dashboard-link");
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const protectedNav = document.getElementById("protected-nav");
  const profileNavButton = document.getElementById("profile-nav-button");
  const shipping = document.getElementById("shipping");
  const store = document.getElementById("store");
  const manageEmployees = document.getElementById("manage-employees");
  const routes = document.getElementById("routes");
  const fileClaimItem = document.getElementById("file-claim-item");
  const supportNav = document.getElementById("support-nav");
  const reportsNav = document.getElementById("reports-nav");
  const managerStatusLi = document.getElementById("manager-status");
  const employeeViewBtn = document.getElementById("employee-view-btn");

  const storeLink = document.querySelector("#store + ul.dropdown a[href='/pages/store.html']");

  const authOnlyElements = document.querySelectorAll('.auth-only-element');
  const customerOnlyElements = document.querySelectorAll('.customer-only-element');
  const managerOnlyElements = document.querySelectorAll('.manager-only-element');
  const nonManagerElements = document.querySelectorAll('.non-manager-element');

  if (profileNavButton) {
    const profileLink = profileNavButton.querySelector('a');
    
    if (profileLink) {
      if (role === "customer") {
        profileLink.href = "/pages/profile.html";
        profileLink.innerHTML = '<span class="profile-icon">👤</span><span>Customer Profile</span>';
      } else if (role === "employee" || role === "manager") {
        profileLink.href = "/pages/employee-profile.html";
        profileLink.innerHTML = '<span class="profile-icon">👤</span><span>Employee Profile</span>';
      }
    }
  }

  if (role) {
    // LOGGED IN

    if (protectedNav) protectedNav.style.display = "flex";

    if (loginBtn) loginBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-block";

    if (profileNavButton) {
      profileNavButton.style.display = "block";
      profileNavButton.style.visibility = "visible";
      profileNavButton.classList.remove('auth-only-element');
    }

    authOnlyElements.forEach(el => {
      if (el.id !== "profile-nav-button") {
        el.style.display = "block";
        el.style.visibility = "visible";
      }
    });

    if (role === "customer") {
      customerOnlyElements.forEach(el => {
        el.style.display = "block";
      });
      
      if (fileClaimItem) {
        fileClaimItem.style.display = "block";
        console.log("File Claim item made visible for customer");
      }
      
      // Hide manager-only elements
      managerOnlyElements.forEach(el => {
        el.style.display = "none";
      });
      
      // Show non-manager elements
      nonManagerElements.forEach(el => {
        el.style.display = "block";
      });
      
      if (supportNav) supportNav.style.display = "flex";
      if (reportsNav) reportsNav.style.display = "none";
      
      // Show shipping and store, hide manage employees for customers
      if (shipping && shipping.parentNode) shipping.parentNode.style.display = "block";
      if (store && store.parentNode) store.parentNode.style.display = "block";
      if (manageEmployees && manageEmployees.parentNode) manageEmployees.parentNode.style.display = "none";
      if (routes && routes.parentNode) routes.parentNode.style.display = "none";
      if (managerStatusLi) managerStatusLi.style.display = "none";
      
      // Make sure store link goes to customer store page
      if (storeLink) {
        storeLink.href = "/pages/store.html";
        console.log("Customer store link set to: /pages/store.html");
      }
      
    } else if (role === "manager") {
      // For managers
      customerOnlyElements.forEach(el => {
        el.style.display = "none";
      });
      
      // Show manager-only elements (like the Reports dropdown)
      managerOnlyElements.forEach(el => {
        el.style.display = "block";
      });
      
      // Hide non-manager elements
      nonManagerElements.forEach(el => {
        el.style.display = "none";
      });
      
      // Show manager-specific navigation and hide others
      if (supportNav) supportNav.style.display = "none";
      if (reportsNav) reportsNav.style.display = "flex";
      
      // Hide shipping and store, show manage employees, routes and status
      if (shipping && shipping.parentNode) shipping.parentNode.style.display = "none";
      if (store && store.parentNode) store.parentNode.style.display = "none";
      if (manageEmployees && manageEmployees.parentNode) manageEmployees.parentNode.style.display = "block";
      if (routes && routes.parentNode) routes.parentNode.style.display = "block";
      if (managerStatusLi) managerStatusLi.style.display = "block";
      
      // Initialize the employee view button for managers
      if (employeeViewBtn) {
        employeeViewBtn.style.display = "inline-block";
        
        // Add click event to store user's current role and set temp role
        employeeViewBtn.addEventListener("click", (e) => {
          e.preventDefault();
          
          // Store original role for returning later
          sessionStorage.setItem("originalRole", role);
          
          // Temporarily set role to employee
          sessionStorage.setItem("role", "employee");
          
          // Redirect to employee dashboard
          window.location.href = "/pages/employee.html";
        });
      }
      
      console.log("Manager navigation set up: hiding shipping/store, showing manage employees/routes/status");
      
    } else if (role === "employee") {
      // For employees
      customerOnlyElements.forEach(el => {
        el.style.display = "none";
      });
      
      managerOnlyElements.forEach(el => {
        el.style.display = "none";
      });
      
      nonManagerElements.forEach(el => {
        el.style.display = "block";
      });
      
      if (supportNav) supportNav.style.display = "flex";
      if (reportsNav) reportsNav.style.display = "none";
      
      // Hide shipping and manage employees, show routes, keep store for employees
      if (shipping && shipping.parentNode) shipping.parentNode.style.display = "none";
      if (manageEmployees && manageEmployees.parentNode) manageEmployees.parentNode.style.display = "none";
      if (routes && routes.parentNode) routes.parentNode.style.display = "block";
      if (store && store.parentNode) store.parentNode.style.display = "block";
      if (managerStatusLi) managerStatusLi.style.display = "none";
      
      // Update store link to employee-store.html for employees
      if (storeLink) {
        storeLink.href = "/pages/employee-store.html";
        console.log("Employee store link set to: /pages/employee-store.html");
      }
      
      // Check if this is a manager viewing as employee
      const originalRole = sessionStorage.getItem("originalRole");
      if (originalRole === "manager") {
        // Add a "Return to Manager" button
        if (dashboardLink && dashboardLink.parentNode) {
          const returnBtn = document.createElement("a");
          returnBtn.id = "return-to-manager-btn";
          returnBtn.href = "#";
          returnBtn.className = "employee-view-btn";
          returnBtn.textContent = "Return to Manager";
          returnBtn.style.backgroundColor = "#cc0000";
          
          returnBtn.addEventListener("click", (e) => {
            e.preventDefault();

            sessionStorage.setItem("role", originalRole);

            sessionStorage.removeItem("originalRole");

            window.location.href = "/pages/manager.html";
          });
          
          dashboardLink.parentNode.insertBefore(returnBtn, dashboardLink.nextSibling);
        }
      }
      
      console.log("Employee navigation set up: hiding shipping/manage employees, showing routes");
    }

    if (dashboardLink) {
      dashboardLink.style.display = "block";

      if (role === "customer") {
        dashboardLink.href = "/pages/customer.html";
        dashboardLink.textContent = "Customer Dashboard";
      } else if (role === "employee") {
        dashboardLink.href = "/pages/employee.html";
        dashboardLink.textContent = "Employee Dashboard";
      } else if (role === "manager") {
        dashboardLink.href = "/pages/manager.html";
        dashboardLink.textContent = "Manager Dashboard";
      }
    }
  } else {
    // NOT LOGGED IN

    if (protectedNav) protectedNav.style.display = "none";
    if (dashboardLink) dashboardLink.style.display = "none";

    if (loginBtn) loginBtn.style.display = "inline-block";
    if (logoutBtn) logoutBtn.style.display = "none";

    if (profileNavButton) {
      profileNavButton.style.display = "none";
      profileNavButton.style.visibility = "hidden";
      profileNavButton.classList.add('auth-only-element');
    }
    
    // Hide the employee view button when not logged in
    if (employeeViewBtn) {
      employeeViewBtn.style.display = "none";
    }

    authOnlyElements.forEach(el => {
      el.style.display = "none";
      el.style.visibility = "hidden";
    });

    // Hide role-specific elements when not logged in
    customerOnlyElements.forEach(el => {
      el.style.display = "none";
    });
    
    managerOnlyElements.forEach(el => {
      el.style.display = "none";
    });
    
    // Show non-manager elements (Support dropdown should be visible when not logged in)
    nonManagerElements.forEach(el => {
      el.style.display = "block";
    });
    
    // Specifically control nav elements
    if (supportNav) supportNav.style.display = "flex";
    if (reportsNav) reportsNav.style.display = "none";
    
    // Hide the file claim item
    if (fileClaimItem) {
      fileClaimItem.style.display = "none";
    }
    
    // Hide manage employees, routes and status when not logged in
    if (manageEmployees && manageEmployees.parentNode) manageEmployees.parentNode.style.display = "none";
    if (routes && routes.parentNode) routes.parentNode.style.display = "none";
    if (managerStatusLi) managerStatusLi.style.display = "none";
    
    // Reset store link to default
    if (storeLink) {
      storeLink.href = "/pages/store.html";
    }
  }

  // Logout functionality
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.clear();
      if (profileNavButton) {
        profileNavButton.style.display = "none";
        profileNavButton.style.visibility = "hidden";
      }
      window.location.href = "/pages/login.html";
    });
  }
  
  console.log("Header initialized. Role:", role);
}