---
layout: default
title: API create
permalink: /api/create

---

<h3>Add a New User to InfoDB</h3>
<form id="addUserForm">
  <label for="firstName">First Name:</label>
  <input type="text" id="firstName" name="firstName" required><br>
  
  <label for="lastName">Last Name:</label>
  <input type="text" id="lastName" name="lastName" required><br>
  
  <label for="dob">Date of Birth:</label>
  <input type="text" id="dob" name="dob" placeholder="e.g., October 21" required><br>
  
  <label for="residence">Residence:</label>
  <input type="text" id="residence" name="residence" required><br>
  
  <label for="email">Email:</label>
  <input type="email" id="email" name="email" required><br>
  
  <label for="ownsCars">Owns Cars (comma-separated):</label>
  <input type="text" id="ownsCars" name="ownsCars" placeholder="e.g., 2015-Fusion, 2011-Ranger"><br>
  
  <button type="submit">Add User</button>
</form>
<div id="addUserResult"></div>

<script>
document.getElementById('addUserForm').addEventListener('submit', async function(event) {
  event.preventDefault();
  
  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;
  const dob = document.getElementById('dob').value;
  const residence = document.getElementById('residence').value;
  const email = document.getElementById('email').value;
  const ownsCarsInput = document.getElementById('ownsCars').value;
  
  // Convert comma-separated string to array, trim whitespace, filter empty strings
  const ownsCarsArray = ownsCarsInput
    .split(',')
    .map(car => car.trim())
    .filter(car => car.length > 0);
  
  const data = {
    FirstName: firstName,
    LastName: lastName,
    DOB: dob,
    Residence: residence,
    Email: email,
    Owns_Cars: ownsCarsArray
  };
  
  try {
    const response = await fetch('http://localhost:5001/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (response.ok) {
      document.getElementById('addUserResult').innerHTML = '<span style="color:green">User added successfully!</span>';
      document.getElementById('addUserForm').reset();
    } else {
      document.getElementById('addUserResult').innerHTML = '<span style="color:red">' + (result.error || 'Error adding user') + '</span>';
    }
  } catch (err) {
    document.getElementById('addUserResult').innerHTML = '<span style="color:red">Network error: ' + err.message + '</span>';
  }
});
</script>