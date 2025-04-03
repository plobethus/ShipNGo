// /ShipNGo/frontend/scripts/customer_registration.js
document.addEventListener("DOMContentLoaded", function () {
  const registrationForm = document.getElementById("login-form");

  registrationForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const Fname = document.getElementById("Fname").value.trim();
    const Lname = document.getElementById("Lname").value.trim();

    const address_line = document.getElementById("address").value.trim();
    const city = document.getElementById("city").value.trim();
    const state = document.getElementById("state").value.trim();
    const zipcode = document.getElementById("zipcode").value.trim();

    const address = address_line + " " + city + " " + state + " " + zipcode;

    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    

    if (!Fname || !Lname || !address_line || !city || !state || !zipcode || !phone || !email || !password) {
      document.getElementById("message").textContent = "All fields are required.";
      return;
    }

    const name = Fname + " " + Lname;

    try {
      const response = await fetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, address, phone, email, password })
      });
      const data = await response.json();
      if (response.ok) {
        document.getElementById("message").textContent = "Registration successful! Redirecting...";
        // Optionally, store token if needed
        setTimeout(() => {
          window.location.href = "/pages/login.html";
        }, 2000);
      } else {
        document.getElementById("message").textContent = data.message || "Registration failed.";
      }
    } catch (error) {
      console.error("Error during registration:", error);
      document.getElementById("message").textContent = "Server error. Please try again later.";
    }
  });
});