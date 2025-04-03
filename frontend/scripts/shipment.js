// /ShipNGo/frontend/scripts/shipment.js
document.getElementById("submitShipment").addEventListener("click", function (event) {
  event.preventDefault();

  const senderFname = document.getElementById("sender-Fname").value.trim();
  const senderLname = document.getElementById("sender-Lname").value.trim();
  const senderStreet = document.getElementById("sender-street").value.trim();
  const senderCity = document.getElementById("sender-city").value.trim();
  const senderState = document.getElementById("sender-state").value.trim();
  const senderZip = document.getElementById("sender-zipcode").value.trim();

  const recieverFname = document.getElementById("reciever-Fname").value.trim();
  const recieverLname = document.getElementById("receiver-Lname").value.trim();
  const recieverStreet = document.getElementById("reciever-street").value.trim();
  const recieverCity = document.getElementById("reciever-city").value.trim();
  const recieverState = document.getElementById("reciever-state").value.trim();
  const recieverZip = document.getElementById("reciever-state").value.trim();

  const packWeight = document.getElementById("package-weight").value.trim();
  const shippingOption = document.getElementById("shipping-option").value.trim();

  if (!senderFname || !senderLname || !senderStreet || !senderCity || !senderState || !senderZip || !recieverFname || !recieverLname || !recieverStreet || !recieverCity || !recieverState || !recieverZip || !packWeight || !shippingOption){
    alert("Please fill in all fields before submitting.");
    return;
  }
 
  const shipmentData = {
    sender_id: senderId,
    recipient_id: recipientId,
    weight,
    dimensions,
    shipping_cost: shippingCost,
    delivery_date: deliveryDate
  };

  fetch("/shipment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(shipmentData)
  })
    .then(response => response.json())
    .then(data => {
      alert("Shipment created successfully!");
      console.log("Server Response:", data);
    })
    .catch(error => {
      console.error("Error:", error);
      alert("Failed to create shipment. Please try again.");
    });
});