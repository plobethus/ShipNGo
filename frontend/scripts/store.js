let cart = {};

document.addEventListener("DOMContentLoaded", function () {
  const buttons = document.querySelectorAll(".cart");
  buttons.forEach(button => {
    button.addEventListener("click", function () {
      const parentDiv = this.closest(".store_item");
      const itemName = parentDiv.querySelector("div:first-child").textContent.split(" ")[0];
      const itemPrice = parseFloat(parentDiv.dataset.price);
      const quantityChange = parseInt(this.dataset.amount, 10);
      const quantitySelect = parentDiv.querySelector("select");
      const quantityMultiplier = parseInt(quantitySelect.value, 10);
      
      updateCart(itemName, itemPrice, quantityChange * quantityMultiplier);
    });
  });
});

function updateCart(item, price, quantity) {
  if (!cart[item]) {
    cart[item] = { quantity: 0, price };
  }
  cart[item].quantity += quantity;
  if (cart[item].quantity < 0) {
    cart[item].quantity = 0;
  }
  updateCheckout();
}

function updateCheckout() {
  let totalItems = 0;
  let totalCost = 0;

  // Update specific item quantities and costs
  const itemMap = {
    'Envelope': { elementId: 'tot-env', costId: 'env-cost' },
    'Boxes': { elementId: 'tot-box', costId: 'box-cost' },
    'Tape': { elementId: 'tot-tape', costId: 'tape-cost' },
    'Stamps': { elementId: 'tot-stamp', costId: 'stamp-cost' },
    'Label': { elementId: 'tot-label', costId: 'label-cost' }
  };

  // Reset all item-specific quantities and costs
  for (const key in itemMap) {
    document.getElementById(itemMap[key].elementId).textContent = '0';
    document.getElementById(itemMap[key].costId).textContent = '0.00';
  }

  // Update cart with specific item quantities and costs
  for (const item in cart) {
    if (cart[item].quantity > 0) {
      const itemDetails = itemMap[item];
      if (itemDetails) {
        const itemQuantity = cart[item].quantity;
        const itemCost = (itemQuantity * cart[item].price).toFixed(2);
        
        document.getElementById(itemDetails.elementId).textContent = itemQuantity;
        document.getElementById(itemDetails.costId).textContent = itemCost;
      }
      
      totalItems += cart[item].quantity;
      totalCost += cart[item].quantity * cart[item].price;
    }
  }

  document.getElementById("total-items").textContent = totalItems;
  document.getElementById("total-cost").textContent = totalCost.toFixed(2);
}