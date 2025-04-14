
  document.getElementById("cost-form").addEventListener("submit", function(e) {
    e.preventDefault();

    const distance = parseFloat(document.getElementById("distance").value);
    const weight = parseFloat(document.getElementById("weight").value);
    const dims = document.getElementById("dimensions").value.split("x").map(Number);
    const type = document.getElementById("type").value;

    if (dims.length !== 3 || dims.some(isNaN)) {
      document.getElementById("result").textContent = "Invalid dimensions format.";
      return;
    }

    const volume = dims[0] * dims[1] * dims[2]; // cubic cm
    let baseRate = 0.05; // default for standard

    if (type === "express") baseRate = 0.08;
    else if (type === "overnight") baseRate = 0.12;

    // Cost formula: distance * baseRate + weight factor + volume factor
    const cost = (distance * baseRate) + (weight * 2) + (volume / 1000);
    document.getElementById("result").textContent = `Estimated Cost: $${cost.toFixed(2)}`;
  });

