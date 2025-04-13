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

  const authOnlyElements = document.querySelectorAll('.auth-only-element');

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
}
