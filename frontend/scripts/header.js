// /ShipNGo/frontend/scripts/header.js
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("./includes/header.html");
    const html = await res.text();
    document.getElementById("header-include").innerHTML = html;
    //const res = await fetch("./includes/header.html");

    // 🔔 Fetch and Update Notification Count
    async function fetchNotificationCount() {
      try {
        const res = await fetch("http://localhost:5000/notifications/unread");
        const data = await res.json();
        const countElement = document.getElementById("notification-count");

        if (countElement) {
          if (data.count > 0) {
            countElement.textContent = data.count;
            countElement.style.display = "block";
          } else {
            countElement.style.display = "none";
          }
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    }

    // Run when navbar is loaded
    fetchNotificationCount();
    setInterval(fetchNotificationCount, 10000); // Auto-refresh every 10 seconds

    // 🎯 User Authentication Logic
    const role = sessionStorage.getItem("role");
    const dashboardLink = document.getElementById("dashboard-link");
    const loginBtn = document.getElementById("login-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const protectedNav = document.getElementById("protected-nav");

    if (role) {
      protectedNav.style.display = "flex";
      loginBtn.style.display = "none";
      logoutBtn.style.display = "inline-block";

      if (role === "customer") {
        dashboardLink.href = "/pages/customer.html";
        dashboardLink.textContent = "Customer Dashboard";
      } else if (role === "employee") {
        dashboardLink.href = "/pages/employee.html";
        dashboardLink.textContent = "Employee Dashboard";
      }
    } else {
      protectedNav.style.display = "none";
      loginBtn.style.display = "inline-block";
      logoutBtn.style.display = "none";
    }

    logoutBtn.addEventListener("click", () => {
      sessionStorage.clear();
      window.location.href = "/pages/login.html";
    });

  } catch (err) {
    console.error("Failed to load header:", err);
  }
});

/*/ /ShipNGo/frontend/scripts/header.js
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
        } else if (role === "employee") {
          dashboardLink.href = "/pages/employee.html";
          dashboardLink.textContent = "Employee Dashboard";
          shipping.style.display = "none";
          store.style.display="none";
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

// /ShipNGo/frontend/scripts/header.js
document.addEventListener("DOMContentLoaded", () => {
  fetch("/includes/header.html")
    .then((res) => res.text())
    .then((html) => {
      document.getElementById("header-include").innerHTML = html;

      // 🔔 Fetch and Update Notification Count
      async function fetchNotificationCount() {
        try {
          const res = await fetch("http://localhost:5000/notifications/unread");
          const data = await res.json();
          const countElement = document.getElementById("notification-count");

          if (data.count > 0) {
            countElement.textContent = data.count;
            countElement.style.display = "block";
          } else {
            countElement.style.display = "none";
          }
        } catch (error) {
          console.error("Error fetching notifications:", error);
        }
      }

      // Run when navbar is loaded
      fetchNotificationCount();
      setInterval(fetchNotificationCount, 10000); // Auto-refresh every 10 seconds

      // 🎯 User Authentication Logic
      const role = sessionStorage.getItem("role");
      const dashboardLink = document.getElementById("dashboard-link");
      const loginBtn = document.getElementById("login-btn");
      const logoutBtn = document.getElementById("logout-btn");
      const protectedNav = document.getElementById("protected-nav");

      if (role) {
        protectedNav.style.display = "flex";
        loginBtn.style.display = "none";
        logoutBtn.style.display = "inline-block";

        if (role === "customer") {
          dashboardLink.href = "/pages/customer.html";
          dashboardLink.textContent = "Customer Dashboard";
        } else if (role === "employee") {
          dashboardLink.href = "/pages/employee.html";
          dashboardLink.textContent = "Employee Dashboard";
        }
      } else {
        protectedNav.style.display = "none";
        loginBtn.style.display = "inline-block";
        logoutBtn.style.display = "none";
      }

      logoutBtn.addEventListener("click", () => {
        sessionStorage.clear();
        window.location.href = "/pages/login.html";
      });
    })
    .catch((err) => console.error("Failed to load header:", err));
}); */
