// faq.js - JavaScript for ShipNGo FAQ functionality

document.addEventListener('DOMContentLoaded', function() {
    // Select all FAQ question headers
    document.querySelectorAll('.faq-item h4').forEach((header) => {
      header.addEventListener('click', () => {
        const item = header.parentElement;
        
        // Close all other open items
        document.querySelectorAll('.faq-item.active').forEach((openItem) => {
          if (openItem !== item) {
            openItem.classList.remove('active');
          }
        });
        
        // Toggle current item
        item.classList.toggle('active');
      });
    });
  });