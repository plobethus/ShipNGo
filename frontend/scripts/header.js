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

// Separate function to initialize header elements
function initializeHeader() {
  // Retrieve user info from sessionStorage
  const role = sessionStorage.getItem("role");
  
  // Get all header elements
  const dashboardLink = document.getElementById("dashboard-link");
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const protectedNav = document.getElementById("protected-nav");
  const profileNavButton = document.getElementById("profile-nav-button");
  const shipping = document.getElementById("shipping");
  const store = document.getElementById("store");
  const faq = document.getElementById("faq");
  const claim = document.getElementById("claim");
  const billing = document.getElementById("billing");
  const claimView = document.getElementById("claim-view");
  const routes = document.getElementById("routes");

  // Also find by class as a backup
  const authOnlyElements = document.querySelectorAll('.auth-only-element');
  
  if (role) {
    // USER IS LOGGED IN
    
    // Show protected nav items
    if (protectedNav) protectedNav.style.display = "flex";
    
    // Hide login, show logout
    if (loginBtn) loginBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-block";
    
    // Show profile button using multiple approaches
    if (profileNavButton) {
      // Remove all hiding techniques
      profileNavButton.style.display = "block";
      profileNavButton.style.visibility = "visible";
      profileNavButton.classList.remove('auth-only-element');
    }
    
    // Show all auth-only elements as a backup approach
    authOnlyElements.forEach(el => {
      el.style.display = "block";
      el.style.visibility = "visible";
    });

    // Set dashboard link based on role
    if (dashboardLink) {
      dashboardLink.style.display = "block";
      
      if (role === "customer") {
        dashboardLink.href = "/pages/customer.html";
        dashboardLink.textContent = "Customer Dashboard";
        if (claimView) claimView.style.display = "none";
        if (routes) routes.style.display = "none";
      } else if (role === "employee") {
        dashboardLink.href = "/pages/employee.html";
        dashboardLink.textContent = "Employee Dashboard";
        if (shipping) shipping.style.display = "none";
        if (store) store.style.display = "none";
        if (faq) faq.style.display = "none";
        if (claim) claim.style.display = "none";
        if (billing) billing.style.display = "none";  
      } else if (role === "manager") {
        dashboardLink.href = "/pages/manager.html";
        dashboardLink.textContent = "Manager Dashboard";
        if (shipping) shipping.style.display = "none";
        if (store) store.style.display = "none";
        if (faq) faq.style.display = "none";
        if (claim) claim.style.display = "none";
        if (billing) billing.style.display = "none";  
      }
    }
  } else {
    // USER IS NOT LOGGED IN
    
    // Hide protected elements
    if (protectedNav) protectedNav.style.display = "none";
    if (dashboardLink) dashboardLink.style.display = "none";
    
    // Show login, hide logout
    if (loginBtn) loginBtn.style.display = "inline-block";
    if (logoutBtn) logoutBtn.style.display = "none";
    
    // Aggressively hide profile button using multiple approaches
    if (profileNavButton) {
      profileNavButton.style.display = "none";
      profileNavButton.style.visibility = "hidden";
      profileNavButton.classList.add('auth-only-element');
    }
    
    // Hide all auth-only elements as a backup approach
    authOnlyElements.forEach(el => {
      el.style.display = "none";
      el.style.visibility = "hidden";
    });
  }
  
  // Add logout button event listener
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      // Clear all authentication data
      sessionStorage.clear();
      
      // Hide auth elements immediately (don't wait for page reload)
      if (profileNavButton) {
        profileNavButton.style.display = "none";
        profileNavButton.style.visibility = "hidden";
      }
      
      // Redirect to login page
      window.location.href = "/pages/login.html";
    });
  }
}