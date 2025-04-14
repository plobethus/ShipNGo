// ShipNGo/frontend/scripts/employee-store.js

// Initialize inventory data
let inventoryData = [];
let pendingChanges = false;

// Map category names to their display emojis (matching the HTML)
const categoryEmojis = {
  'Envelope': '📨',
  'Box': '📦',
  'Tape': '🧻',
  'Stamps': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Labels': '🏷'
};

document.addEventListener("DOMContentLoaded", function() {
  // Initialize the page - skip authentication
  console.log('Initializing inventory page...');
  
  // Load inventory data directly
  fetchInventoryData();
  
  // Add event listeners to stock update buttons
  const updateButtons = document.querySelectorAll(".stock-update");
  updateButtons.forEach(button => {
    button.addEventListener("click", function() {
      const item = this.dataset.item;
      const action = this.dataset.action;
      const quantityInput = document.getElementById(`${item.toLowerCase()}-quantity`);
      const quantity = parseInt(quantityInput.value, 10);
      
      if (isNaN(quantity) || quantity <= 0) {
        alert("Please enter a valid quantity");
        return;
      }
      
      updateInventoryStock(getItemIdByCategory(item), quantity, action);
    });
  });
  
  // Add event listeners to action buttons
  document.getElementById("refresh-inventory").addEventListener("click", function() {
    fetchInventoryData();
  });
  
  document.getElementById("save-changes").addEventListener("click", function() {
    if (pendingChanges) {
      // In this implementation, changes are saved immediately via API
      // This button now just refreshes the data
      fetchInventoryData();
      pendingChanges = false;
      alert("All changes are already saved to the server!");
    } else {
      alert("No changes to save");
    }
  });
  
  document.getElementById("generate-report").addEventListener("click", function() {
    generateInventoryReport();
  });
  
  // Add beforeunload event to warn about unsaved changes
  window.addEventListener("beforeunload", function(e) {
    if (pendingChanges) {
      // Most modern browsers will show a generic message instead of this custom one
      const message = "You have unsaved changes. Are you sure you want to leave?";
      e.returnValue = message;
      return message;
    }
  });
});

// Fetch inventory data from the API
function fetchInventoryData() {
  console.log('Fetching inventory data...');
  
  fetch('/api/inventory')
    .then(response => {
      console.log('Fetch response status:', response.status);
      return response.json();
    })
    .then(data => {
      console.log('Inventory data received:', data);
      if (data.success) {
        inventoryData = data.data;
        updateInventoryDisplay();
        checkLowStock();
        updateCharts();
      } else {
        console.error('Failed to fetch inventory data:', data.message);
        alert('Failed to fetch inventory data: ' + data.message);
      }
    })
    .catch(error => {
      console.error('Error fetching inventory data:', error);
      alert('Failed to load inventory data. Please try again later.');
    });
}

// Update inventory stock via API
function updateInventoryStock(itemId, quantity, action) {
  const requestBody = {
    stock_quantity: quantity,
    adjustment_type: action
  };
  
  fetch(`/api/inventory/${itemId}/stock`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Update the local inventory data with the updated item
        const itemIndex = inventoryData.findIndex(item => item.supply_id === parseInt(itemId));
        if (itemIndex !== -1) {
          inventoryData[itemIndex] = data.data;
        }
        
        updateInventoryDisplay();
        checkLowStock();
        updateCharts();
        
        pendingChanges = false;
        alert(data.message);
      } else {
        alert('Failed to update stock: ' + data.message);
      }
    })
    .catch(error => {
      console.error('Error updating stock:', error);
      alert('Failed to update stock. Please try again later.');
    });
}

// Helper function to get item ID by category
function getItemIdByCategory(categoryName) {
  const item = inventoryData.find(item => item.category === categoryName);
  return item ? item.supply_id : null;
}

// Update the inventory display
function updateInventoryDisplay() {
  // Create a map of categories to items
  const categoryMap = {};
  inventoryData.forEach(item => {
    categoryMap[item.category] = item;
  });
  
  // Update stock counts for each item
  Object.keys(categoryEmojis).forEach(category => {
    const stockElement = document.getElementById(`${category.toLowerCase()}-stock`);
    if (stockElement && categoryMap[category]) {
      stockElement.textContent = categoryMap[category].stock_quantity;
    } else if (stockElement) {
      stockElement.textContent = "0"; // Default if no data found
    }
  });
  
  // Update total inventory count
  const totalItems = inventoryData.reduce((total, item) => total + item.stock_quantity, 0);
  document.getElementById("total-inventory").textContent = totalItems;
}

// Check for low stock items and update the low stock list
function checkLowStock() {
  const lowStockList = document.getElementById("low-stock-list");
  lowStockList.innerHTML = "";
  
  // Using a fixed threshold of 10 units for low stock
  const lowStockItems = inventoryData.filter(item => item.stock_quantity <= 10);
  
  if (lowStockItems.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No items are low on stock";
    li.style.backgroundColor = "rgba(0, 204, 102, 0.2)";
    lowStockList.appendChild(li);
  } else {
    lowStockItems.forEach(item => {
      const li = document.createElement("li");
      // Use a default max capacity of 100 if not specified
      const maxCapacity = 100;
      const percentLeft = Math.round((item.stock_quantity / maxCapacity) * 100);
      li.textContent = `${item.category}: ${item.stock_quantity} units (${percentLeft}% of capacity)`;
      li.style.backgroundColor = "rgba(255, 77, 77, 0.2)";
      lowStockList.appendChild(li);
    });
  }
}

// Update the inventory charts
function updateCharts() {
  // Create a map of categories to items
  const categoryMap = {};
  inventoryData.forEach(item => {
    categoryMap[item.category] = item;
  });
  
  // Use a default max capacity of 100 if not specified
  const maxCapacity = 100;
  
  Object.keys(categoryEmojis).forEach(category => {
    const barId = `${category.toLowerCase()}-bar`;
    const percentId = `${category.toLowerCase()}-percent`;
    
    const barElement = document.getElementById(barId);
    if (barElement) {
      const item = categoryMap[category];
      const percent = item ? Math.round((item.stock_quantity / maxCapacity) * 100) : 0;
      
      barElement.style.width = `${percent}%`;
      
      // Add or remove low-stock class based on threshold (using 10 as default)
      if (item && item.stock_quantity <= 10) {
        barElement.classList.add("low-stock");
      } else {
        barElement.classList.remove("low-stock");
      }
      
      const percentElement = document.getElementById(percentId);
      if (percentElement) {
        percentElement.textContent = `${percent}%`;
      }
    }
  });
}

// Generate inventory report
function generateInventoryReport() {
  const currentDate = new Date().toLocaleDateString();
  const currentTime = new Date().toLocaleTimeString();
  
  let report = `ShipNGo Inventory Report - Generated on ${currentDate} at ${currentTime}\n\n`;
  report += "Current Stock Levels:\n";
  report += "-------------------\n";
  
  // Use a default max capacity of 100 if not specified
  const maxCapacity = 100;
  
  inventoryData.forEach(item => {
    const percentFilled = Math.round((item.stock_quantity / maxCapacity) * 100);
    const status = item.stock_quantity <= 10 ? "LOW STOCK" : "OK";
    report += `${item.category}: ${item.stock_quantity}/${maxCapacity} units (${percentFilled}%) - Status: ${status}\n`;
  });
  
  report += "\nTotal Items in Inventory: " + inventoryData.reduce((total, item) => total + item.stock_quantity, 0);
  
  // Create a downloadable report
  const blob = new Blob([report], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `inventory-report-${currentDate.replace(/\//g, '-')}.txt`;
  a.click();
  
  URL.revokeObjectURL(url);
}