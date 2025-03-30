// /ShipNGo/frontend/scripts/header.js
document.addEventListener("DOMContentLoaded", () => {
  fetch("/includes/header.html")
    .then((res) => res.text())
    .then((html) => {
      document.getElementById("header-include").innerHTML = html;

      // Retrieve user info from sessionStorage
      const role = sessionStorage.getItem("role");
      const dashboardLink = document.getElementById("dashboard-link");
      const loginBtn = document.getElementById("login-btn");
      const logoutBtn = document.getElementById("logout-btn");
      const protectedNav = document.getElementById("protected-nav");
      const shipping = document.getElementById("shipping");
      const store = document.getElementById("store");

      const faq = document.getElementById("faq");
      const claim = document.getElementById("claim");
      const billing = document.getElementById("billing");
      const claimView = document.getElementById("claim-view");
      const employeeStore = document.getElementById("employee-store");

      const routes = document.getElementById("routes");

      if (role) {
        // Show protected nav items
        protectedNav.style.display = "flex";
        // Hide login, show logout
        loginBtn.style.display = "none";
        logoutBtn.style.display = "inline-block";

        // Set dashboard link based on role
        if (role === "customer") {
          dashboardLink.href = "/pages/customer.html";
          dashboardLink.textContent = "Customer Dashboard";
          claimView.style.display="none";
          routes.style.display="none";
          employeeStore.style.display = "none";
        } else if (role === "employee") {
          dashboardLink.href = "/pages/employee.html";
          dashboardLink.textContent = "Employee Dashboard";
          shipping.style.display = "none";
          store.style.display="none";
          employeeStore.style.display = "block";
          faq.style.display="none";
          claim.style.display="none";
          billing.style.display="none";
      } 
    }else {
        // Not logged in: hide protected nav, show login, hide logout
        protectedNav.style.display = "none";
        loginBtn.style.display = "inline-block";
        logoutBtn.style.display = "none";
        dashboardLink.style.display = "none";
      }
      logoutBtn.addEventListener("click", () => {
        sessionStorage.clear();
        // Optionally, you might also call an endpoint to clear the token cookie
        window.location.href = "/pages/login.html";
      });
    })
    .catch((err) => console.error("Failed to load header:", err));
});