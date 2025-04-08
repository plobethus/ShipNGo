document.addEventListener('DOMContentLoaded', function () {
    fetchNotificationCount();
  });
  
  function fetchNotificationCount() {
    fetch('/api/notifications/count')
      .then(response => response.json())
      .then(data => {
        document.getElementById('notification-count').textContent = data.count;
      })
      .catch(error => console.error('Error fetching notification count:', error));
  }
  