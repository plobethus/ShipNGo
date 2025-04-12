document.getElementById("alert-btn").addEventListener("click", async () => {
    const dropdown = document.getElementById("alert-dropdown");
  
    if (dropdown.style.display === "none" || dropdown.style.display === "") {
      try {
        const res = await fetch("/api/alerts"); // ✅ correct endpoint
        const data = await res.json();
  
        dropdown.innerHTML = data.length
          ? data.map(item => `<p>📣 ${item.message}</p>`).join("")
          : "<p>No new alerts.</p>";
  
        dropdown.style.display = "block";
      } catch (err) {
        dropdown.innerHTML = "<p>⚠️ Error loading alerts.</p>";
        dropdown.style.display = "block";
        console.error("Alert fetch error:", err);
      }
    } else {
      dropdown.style.display = "none";
    }
  });
  