let cart = {};
let stockData = {};

const itemMap = {
  'Envelope': { elementId: 'tot-env', costId: 'env-cost', stockId: 'env-stock' },
  'Box': { elementId: 'tot-box', costId: 'box-cost', stockId: 'box-stock' },
  'Tape': { elementId: 'tot-tape', costId: 'tape-cost', stockId: 'tape-stock' },
  'Stamps': { elementId: 'tot-stamp', costId: 'stamp-cost', stockId: 'stamp-stock' },
  'Labels': { elementId: 'tot-label', costId: 'label-cost', stockId: 'label-stock' }
};

document.addEventListener("DOMContentLoaded", function () {
  // Fetch the available stock from the backend when the page loads.
  fetchStockData();

  const buttons = document.querySelectorAll(".cart");
  buttons.forEach(button => {
    button.addEventListener("click", function () {
      const parentDiv = this.closest(".store_item");
      // Use the product's data-name attribute for the item identifier.
      const itemName = parentDiv.dataset.name;
      const itemPrice = parseFloat(parentDiv.dataset.price);
      const quantityChange = parseInt(this.dataset.amount, 10);
      const quantitySelect = parentDiv.querySelector("select");
      const quantityMultiplier = parseInt(quantitySelect.value, 10);
      const quantityToChange = quantityChange * quantityMultiplier;
      
      updateCart(itemName, itemPrice, quantityToChange);
    });
  });

  const checkoutButton = document.getElementById("checkout-button");
  if (checkoutButton) {
    checkoutButton.addEventListener("click", checkout);
  }
});


async function fetchStockData() {
  try {
    const response = await fetch("/api/stocks");
    if (!response.ok) {
      throw new Error("Failed to fetch stock data");
    }
    const data = await response.json();

    data.forEach(item => {
      stockData[item.id] = item.available;
    });
    // Update UI with the newly fetched stock values.
    updateStoreStockDisplay();
    updateCheckout();
  } catch (error) {
    console.error("Error fetching stock data:", error);
  }
}


function updateStoreStockDisplay() {
  const productCards = document.querySelectorAll(".store_item");
  productCards.forEach(card => {
    let name = card.dataset.name;
    const stockSpan = card.querySelector(".product-stock");
    if (stockSpan && stockData[name] !== undefined) {
      // Calculate available stock as fetched stock minus what’s in the cart.
      const inCart = cart[name] ? cart[name].quantity : 0;
      stockSpan.textContent = stockData[name] - inCart;
    }
  });
}



function updateCheckout() {
  let totalItems = 0;
  let totalCost = 0;

  for (const key in itemMap) {
    document.getElementById(itemMap[key].elementId).textContent = '0';
    document.getElementById(itemMap[key].costId).textContent = '0.00';
    if (stockData[key] !== undefined) {
      document.getElementById(itemMap[key].stockId).textContent = stockData[key];
    }
  }
  
  for (const item in cart) {
    if (cart[item].quantity > 0 && itemMap[item]) {
      const details = itemMap[item];
      const itemQuantity = cart[item].quantity;
      const itemCost = (itemQuantity * cart[item].price).toFixed(2);
      document.getElementById(details.elementId).textContent = itemQuantity;
      document.getElementById(details.costId).textContent = itemCost;
      if (stockData[item] !== undefined) {
        // Show available stock (stock from API minus cart quantity).
        document.getElementById(details.stockId).textContent = stockData[item] - itemQuantity;
      }
      totalItems += itemQuantity;
      totalCost += itemQuantity * cart[item].price;
    }
  }
  document.getElementById("total-items").textContent = totalItems;
  document.getElementById("total-cost").textContent = totalCost.toFixed(2);
}


function updateCart(item, price, quantity) {
  // For adding items, make sure we don't exceed what’s available.
  if (quantity > 0) {
    const currentInCart = cart[item] ? cart[item].quantity : 0;
    const available = stockData[item];
    if (quantity > (available - currentInCart)) {
      alert(`Not enough stock for ${item}. Only ${available - currentInCart} available.`);
      return;
    }
  }
  // Update the cart object.
  if (!cart[item]) {
    cart[item] = { quantity: 0, price: price };
  }
  cart[item].quantity += quantity;
  if (cart[item].quantity < 0) {
    cart[item].quantity = 0;
  }
  updateCheckout();
  updateStoreStockDisplay();
}


function checkout() {
  let items = [];
  // Prepare the list of items from the cart.
  for (const item in cart) {
    if (cart[item].quantity > 0) {
      items.push({ category: item, quantity: cart[item].quantity });
    }
  }
  if (items.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  try {
    fetch('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ items })
    }).then(res => {
      if (res.status === 200) {
        // Update the local stock data based on the purchased quantities.
        for (const item in cart) {
          if (cart[item].quantity > 0 && stockData[item] !== undefined) {
            stockData[item] = stockData[item] - cart[item].quantity;
          }
        }
        alert("Purchase successful!");
        cart = {};
        updateCheckout();
        updateStoreStockDisplay();
      }
    }).catch(err => {
      alert(`Purchase failed: ${err}`);
    });
  } catch (err) {
    alert(`An error occurred during checkout.`);
  }
}
