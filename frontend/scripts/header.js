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
  const routes = document.getElementById("routes");
  const fileClaimItem = document.getElementById("file-claim-item");
  const supportNav = document.getElementById("support-nav");
  const reportsNav = document.getElementById("reports-nav");

  const authOnlyElements = document.querySelectorAll('.auth-only-element');
  const customerOnlyElements = document.querySelectorAll('.customer-only-element');
  const managerOnlyElements = document.querySelectorAll('.manager-only-element');
  const nonManagerElements = document.querySelectorAll('.non-manager-element');

  if (role) {
    // LOGGED IN

    if (protectedNav) protectedNav.style.display = "flex";

    if (loginBtn) loginBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-block";

    if (profileNavButton) {
      if (role === "customer") {
        profileNavButton.style.display = "block";
        profileNavButton.style.visibility = "visible";
        profileNavButton.classList.remove('auth-only-element');
      } else {
        profileNavButton.style.display = "none";
        profileNavButton.style.visibility = "hidden";
        profileNavButton.classList.add('auth-only-element');
      }
    }

    authOnlyElements.forEach(el => {
      if (el.id !== "profile-nav-button") {
        el.style.display = "block";
        el.style.visibility = "visible";
      }
    });

    // Handle role-specific elements
    if (role === "customer") {
      // For customers
      customerOnlyElements.forEach(el => {
        el.style.display = "block";
      });
      
      // Show the file claim item
      if (fileClaimItem) {
        fileClaimItem.style.display = "block";
        console.log("File Claim item made visible for customer");
      }
      
      // Hide manager-only elements
      managerOnlyElements.forEach(el => {
        el.style.display = "none";
      });
      
      // Show non-manager elements (like the Support dropdown)
      nonManagerElements.forEach(el => {
        el.style.display = "block";
      });
      
      if (supportNav) supportNav.style.display = "flex";
      if (reportsNav) reportsNav.style.display = "none";
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
      
      // Specifically toggle the main nav dropdowns
      if (supportNav) supportNav.style.display = "none";
      if (reportsNav) reportsNav.style.display = "flex";
      console.log("Reports navigation made visible for manager");
    } else {
      // For other roles (like employee)
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
    }

    if (dashboardLink) {
      dashboardLink.style.display = "block";

      if (role === "customer") {
        dashboardLink.href = "/pages/customer.html";
        dashboardLink.textContent = "Customer Dashboard";

        if (routes) routes.style.display = "none";
      } else if (role === "employee") {
        dashboardLink.href = "/pages/employee.html";
        dashboardLink.textContent = "Employee Dashboard";

        if (shipping) shipping.style.display = "none";
        if (store) store.style.display = "none";
      } else if (role === "manager") {
        dashboardLink.href = "/pages/manager.html";
        dashboardLink.textContent = "Manager Dashboard";

        if (shipping) shipping.style.display = "none";
        if (store) store.style.display = "none";

        const managerStatusLi = document.getElementById("manager-status");
        if (managerStatusLi) {
          managerStatusLi.style.display = "block";
        }
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
  console.log("Support Nav found:", supportNav !== null);
  console.log("Reports Nav found:", reportsNav !== null);
}