---
layout: default
title: API read
permalink: /api/read

---

<h1>Flask app access using JavaScript</h1>

<p>This code extracts data "live" from a local Web Server with JavaScript fetch.  Additionally, it formats the data into a table.</p>

<!-- Head contains information to Support the Document -->


<!-- HTML table fragment for page -->
<table id="demo" class="table">
  <thead>
      <tr>
          <th>First Name</th>
          <th>Last Name</th>
          <th>DOB</th>
          <th>Residence</th>
          <th>Email</th>
          <th>Owns Cars</th>
      </tr>
  </thead>
  <tbody id="result">
    <!-- javascript generated data -->
  </tbody>
</table>

<script>
{ // Jupyter Notebook container to avoid variable name conflicts

  // prepare HTML result container for new output
  const resultContainer = document.getElementById("result");
  
  // prepare URL
  url = "http://localhost:5001/api/data";

  // set options for cross origin header request
  const options = {
    method: 'GET', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'default', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'include', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // fetch the API
  fetch(url, options)
    // response is a RESTful "promise" on any successful fetch
    .then(response => {
      // check for response errors and display
      if (response.status !== 200) {
          console.error(response.status);
          return;
      }
      // valid response will contain json data
      response.json().then(data => {
          console.log(data);
          for (const row of data) {
            // tr and td build out for each row
            const tr = document.createElement("tr");
            const firstname = document.createElement("td");
            const lastname = document.createElement("td");
            const dob = document.createElement("td");
            const residence = document.createElement("td");
            const email = document.createElement("td");
            const cars = document.createElement("td");
            
            // data is specific to the API
            firstname.innerHTML = row.FirstName; 
            lastname.innerHTML = row.LastName;
            dob.innerHTML = row.DOB;
            residence.innerHTML = row.Residence;
            email.innerHTML = row.Email;
            // format the cars array as a comma-separated list
            cars.innerHTML = row.Owns_Cars ? row.Owns_Cars.join(", ") : "None";
            
            // this builds each td into tr
            tr.appendChild(firstname);
            tr.appendChild(lastname);
            tr.appendChild(dob);
            tr.appendChild(residence);
            tr.appendChild(email);
            tr.appendChild(cars);
            
            // add HTML to container
            resultContainer.appendChild(tr);
          }
      })
  })
} 
</script>