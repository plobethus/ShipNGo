document.addEventListener("DOMContentLoaded", async () => {
    await fetchPostOffices();
  });
  
  async function fetchPostOffices() {
    try {
      const res = await fetch(`/postoffice/get_all`);
      console.log(res);
      const data = await res.json();
  
      const element = document.getElementById("routes-body");
  
      data.forEach(office => {
        const row = element.appendChild(document.createElement("tr"));
        row.appendChild(document.createElement("td")).textContent = office.post_id;
        row.appendChild(document.createElement("td")).textContent = office.name;
        row.appendChild(document.createElement("td")).textContent = office.city;
        row.appendChild(document.createElement("td")).textContent = office.state;
        row.appendChild(document.createElement("td")).textContent = office.zip_code;
        row.appendChild(document.createElement("td")).textContent = office.num_employees;
        row.appendChild(document.createElement("td")).textContent = office.is_active ? "Active" : "Inactive";
  
        const timeRange = `${office.opening_time} - ${office.closing_time}`;
        row.appendChild(document.createElement("td")).textContent = timeRange;
      });
    } catch (err) {
      console.error(err);
    }
  }
  