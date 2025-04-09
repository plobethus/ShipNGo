console.log("📦 shipment.js loaded");

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
  const shippingOption = document.getElementById("shipping-option").value.trim();
  const specialInstructions = document.getElementById("special").value.trim();

  if (
    !senderFirstName || !senderLastName || !senderStreet || !senderCity || !senderState || !senderZip ||
    !receiverFirstName || !receiverLastName || !receiverStreet || !receiverCity || !receiverState || !receiverZip ||
    !weight || !shippingOption
  ) {
    alert("Please fill in all fields before submitting.");
    return;
  }

  const shipmentData = {
    sender_name: `${senderFirstName} ${senderLastName}`,
    receiver_name: `${receiverFirstName} ${receiverLastName}`,
    address_from: `${senderStreet}, ${senderCity}, ${senderState} ${senderZip}`,
    address_to: `${receiverStreet}, ${receiverCity}, ${receiverState} ${receiverZip}`,
    weight,
    dimensions: "10x10x10", // Optional, placeholder for now
    shipping_class: shippingOption,
    instructions: specialInstructions
  };

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
      alert("Shipment created successfully!");
      console.log("Server Response:", data);
    } else {
      alert(data.message || "Failed to create shipment.");
    }
  } catch (err) {
    console.error("Error:", err);
    alert("Network error. Try again later.");
  }
});
