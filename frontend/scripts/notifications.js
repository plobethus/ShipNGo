// /ShipNGo-frontend/scripts/notifications.js
if (data.discount_applied) {
  const notificationCount = document.getElementById("notification-count");
  notificationCount.textContent = "1";
  notificationCount.style.display = "inline-block";

  const message = "🎉 You’ve unlocked a 10% discount on your next shipment!";
  alert(message); // Optional popup

  // You could also append it to a notification list element if you have one
  const notificationList = document.getElementById("notification-list");
  if (notificationList) {
    const li = document.createElement("li");
    li.textContent = message;
    notificationList.appendChild(li);
  }
}