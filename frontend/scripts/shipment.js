document.querySelector(".shipment-form").addEventListener("submit", async function (event) {
  event.preventDefault();
  console.log("🚀 Submit button clicked!");

  const senderFirstName = document.getElementById("sender-Fname").value.trim();
  const senderLastName = document.getElementById("sender-Lname").value.trim();
  const senderStreet = document.getElementById("sender-street").value.trim();
  const senderCity = document.getElementById("sender-city").value.trim();
  const senderState = document.getElementById("sender-state").value.trim();
  const senderZip = document.getElementById("sender-zipcode").value.trim();

  const receiverFirstName = document.getElementById("receiver-Fname").value.trim();
  const receiverLastName = document.getElementById("receiver-Lname").value.trim();
  const receiverStreet = document.getElementById("receiver-street").value.trim();
  const receiverCity = document.getElementById("receiver-city").value.trim();
  const receiverState = document.getElementById("receiver-state").value.trim();
  const receiverZip = document.getElementById("receiver-zipcode").value.trim();

  const weight = parseFloat(document.getElementById("package-weight").value.trim());
  
  // Get package dimensions
  const length = parseFloat(document.getElementById("package-length").value.trim());
  const width = parseFloat(document.getElementById("package-width").value.trim());
  const height = parseFloat(document.getElementById("package-height").value.trim());
  const dimensions = `${length}x${width}x${height}`;
  
  const shippingOption = document.getElementById("shipping-option").value.trim();
  
  //set eta 
  let eta = "5-7 Days";
  if (shippingOption === "express") eta = "2-3 Days";
  else if (shippingOption === "overnight") eta = "1 Day";

  const specialInstructions = document.getElementById("special").value.trim();
  
  if (
    !senderFirstName || !senderLastName || !senderStreet || !senderCity || !senderState || !senderZip ||
    !receiverFirstName || !receiverLastName || !receiverStreet || !receiverCity || !receiverState || !receiverZip ||
    !weight || !shippingOption || !length || !width || !height
  ) {
    alert("Please fill in all fields before submitting.");
    return;
  }

  let baseCost = 5 + weight * 0.5;
  let multiplier = 1;

  if (shippingOption === "express") {
    multiplier = 1.2;
  } else if (shippingOption === "overnight") {
    multiplier = 1.5;
  }
  const cost = (baseCost * multiplier).toFixed(2);


  const shipmentData = {
    sender_name: `${senderFirstName} ${senderLastName}`,
    receiver_name: `${receiverFirstName} ${receiverLastName}`,
    address_from: `${senderStreet}, ${senderCity}, ${senderState} ${senderZip}`,
    address_to: `${receiverStreet}, ${receiverCity}, ${receiverState} ${receiverZip}`,
    weight,
    dimensions: dimensions, // Use the dimensions from the form
    shipping_class: shippingOption,
    instructions: specialInstructions,
    cost
  };

  // 💸 Show price modal first
  document.getElementById("price-summary").innerHTML = `
    <p><strong>Sender:</strong> ${shipmentData.sender_name}</p>
    <p><strong>Receiver:</strong> ${shipmentData.receiver_name}</p>
    <p><strong>Shipping:</strong> ${shippingOption.toUpperCase()}</p>
    <p><strong>Weight:</strong> ${weight} lbs</p>
    <p><strong>Dimensions:</strong> ${dimensions} cm</p>
    <p><strong>Total Cost:</strong> <strong style="color:#2ecc71;">$${cost}</strong></p>
  `;

  const confirmBtn = document.getElementById("confirmShipmentBtn");
  confirmBtn.textContent = `Proceed to Checkout ($${cost})`;

  // Show price modal
  document.getElementById("priceModal").style.display = "block";

  // 🟢 Add event listener to the "Proceed" button
  confirmBtn.onclick = async () => {
    document.getElementById("priceModal").style.display = "none";
  
  try {
    const response = await fetch("/shipment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(shipmentData)
    });

    const data = await response.json();
    if (response.ok) {
      const result = data.package;
      const discount = data.discount_applied;
      let discountMsg = " ";

      if (discount){
        const notificationCount = document.getElementById("notification-count");
        notificationCount.textContent = "1";
        notificationCount.style.display = "inline-block";
        discountMsg = `<p style="color:green;"><strong>🎉 You've unlocked a 10% discount on your next shipment!</strong></p>`;
      }
  
      // Store original shipment data in case we need to supplement the response
      const modalContent = `
        <div class="shipment-card">
          <h3>📦 Shipment Details</h3>
          <ul>
            <li><strong>Package ID:</strong> ${result.package_id}</li>
            <li><strong>Sender:</strong> ${result.sender_name || shipmentData.sender_name}</li>
            <li><strong>Receiver:</strong> ${result.receiver_name || shipmentData.receiver_name}</li>
            <li><strong>From:</strong> ${result.address_from || shipmentData.address_from}</li>
            <li><strong>To:</strong> ${result.address_to || shipmentData.address_to}</li>
            <li><strong>Weight:</strong> ${result.weight || shipmentData.weight} lbs</li>
            <li><strong>Dimensions:</strong> ${dimensions} cm</li>
            <li><strong>Shipping Class:</strong> ${result.shipping_class || shipmentData.shipping_class}</li>
            <li><strong>Estimated Delivery:</strong> ${eta}</li>
            <li><strong>Cost:</strong> ${result.cost || shipmentData.cost}</li>
            <li><strong>Status:</strong> ${result.status || "Pending"}</li>
            <li><strong>Location:</strong> ${result.location || shipmentData.address_to}</li>
          </ul>
          ${discountMsg}
        </div>
      `;
    
      //document.getElementById("shipment-result").innerHTML = output;
      document.getElementById("modal-shipment-details").innerHTML = modalContent;
      document.getElementById("shipmentModal").style.display = "block";
      document.querySelector(".shipment-form").reset();
     } else {
      alert(data.message || "Failed to create shipment.");
     }

   } catch (err) {
     console.error("🚨 Error submitting shipment:", err);
     alert("An error occurred while submitting the shipment.");
   }
 };
});

  document.getElementById("closePriceModal").addEventListener("click", () => {
  document.getElementById("priceModal").style.display = "none"; 
});

window.addEventListener("click", (e) => {
  if (e.target === document.getElementById("priceModal")) {
    document.getElementById("priceModal").style.display = "none";
  }
});


document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("shipmentModal").style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === document.getElementById("shipmentModal")) {
    document.getElementById("shipmentModal").style.display = "none";
  }
});