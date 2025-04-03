document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const routeId = params.get("route");
    document.getElementById("routes-title").innerText = `Stops for ${routeId}`;
    if (routeId) {
      await fetchStops(routeId);
    } else {
      console.error("No route id provided in query parameters.");
    }})

async function fetchStops(route_id) {
  try {
    const res = await fetch(`/driver/get_stops/${route_id}`);
    const data = await res.json();

    const element = document.getElementById("routes-body")

    

    data.forEach(stop => {
        const row = element.appendChild(document.createElement("tr"))
        row.appendChild(document.createElement("td")).textContent = stop.stop_id
        row.appendChild(document.createElement("td")).textContent = stop.address
        row.appendChild(document.createElement("td")).textContent = stop.special_instructions




        const button = document.createElement("button")

        button.

        a
        
        row.appendChild(document.createElement("td")).appendChild(button)

    });

  } catch (err) {
    console.error(err);
  }
}