document.addEventListener("DOMContentLoaded", async () => {
    await fetchActiveRoutes();
})

async function fetchActiveRoutes() {
  try {
    const res = await fetch(`/driver/get_routes`);
    const data = await res.json();

    const element = document.getElementById("routes-body")

    

    data.forEach(route => {
        const row = element.appendChild(document.createElement("tr"))
        row.appendChild(document.createElement("td")).textContent = route.route_id
        row.appendChild(document.createElement("td")).textContent = route.route_name
        row.appendChild(document.createElement("td")).textContent = route.status
        row.appendChild(document.createElement("td")).textContent = route.origin + " → " + route.destination
        row.appendChild(document.createElement("td")).textContent = route.truck


        const anchor = document.createElement("a")

        anchor.href = "/pages/stops.html?route=" + route.route_id
        anchor.innerText = "click"
        
        row.appendChild(document.createElement("td")).appendChild(anchor)

    });

  } catch (err) {
    console.error(err);
  }
}