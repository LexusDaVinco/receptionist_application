let staffMembers = [];
let deliveryDrivers = [];

class Employee {
  constructor(name, surname) {
    this.name = name;
    this.surname = surname;
  }
}

class StaffMember extends Employee {
  constructor(name, surname, picture, email, status, outTime, duration, expectedReturn) {
    super(name, surname);
    this.picture = picture;
    this.email = email;
    this.status = status;
    this.outTime = outTime;
    this.duration = duration;
    this.expectedReturn = expectedReturn;
  }
}

class DeliveryDriver extends Employee {
  constructor(vehicle, name, surname, telephone, deliveryAddress, returnTime) {
    super(name, surname);
    this.vehicle = vehicle;
    this.telephone = telephone;
    this.deliveryAddress = deliveryAddress;
    this.returnTime = returnTime;
  }
}

function staffUserGet() {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: 'https://randomuser.me/api/',
      dataType: 'json',
      success: function(data) { 
        const firstname = data.results[0].name.first;
        const lastname = data.results[0].name.last;
        const picture = data.results[0].picture.medium;
        const email = data.results[0].email;
        const status = "";
        const outTime = "";
        const duration = "";
        const expectedReturn = "";
        const newStaffMember = new StaffMember(firstname, lastname, picture, email, status, outTime, duration, expectedReturn);
        resolve(newStaffMember);
      },
      error: function() {
        reject("Error fetching data");
      }
    });
  });
}

function createStaffMembers(num) {
  const promises = [];
  for (let i = 0; i < num; i++) {
    promises.push(staffUserGet());
  }
  return Promise.all(promises);
}

createStaffMembers(5)
  .then((staffMembersArray) => {
    staffMembers = staffMembers.concat(staffMembersArray);
    createTableWithData();
  })
  .catch((error) => {
    console.log(error);
  });

function createTableWithData() {
    let staffTable = document.getElementById("staffTable");
    let tableHead = `<thead class="bg-primary text-white">
                    <tr>
                    <th id="name">Name</th>
                    <th id="surname">Surname</th>
                    <th id="picture">Picture</th>
                    <th id="email">Email</th>
                    <th id="status">Status</th>
                    <th id="out-time">Out time</th>
                    <th id="duration">Duration</th>
                    <th id="expected-return">Expected return</th>
                </tr>
                </thead>`
    staffTable.innerHTML += tableHead;
                    
    for (let i = 0; i < staffMembers.length; i++) { 
        let row = `<tr class="notSelected" onclick="selectStaffMember(this, ${i})">
                    <td>${staffMembers[i].name}</td>
                    <td>${staffMembers[i].surname}</td>
                    <td><img src="${staffMembers[i].picture}"></td>
                    <td>${staffMembers[i].email}</td>
                    <td id="status${i}">${staffMembers[i].status}</td>
                    <td id="outTime${i}">${staffMembers[i].outTime}</td>
                    <td id="duration${i}">${staffMembers[i].duration}</td>
                    <td id="expectedReturn${i}">${staffMembers[i].expectedReturn}</td>
                </tr>`
        staffTable.innerHTML += row;
    }
}

// Function for updating status on table
let staffIsSelected = undefined;
let selectedStaffNum;
let highlightedRow;

function selectStaffMember(row, staffNum) {
  let theSelectedRow = row;
  if (theSelectedRow.style.backgroundColor === "") {
    let tableBody = document.querySelector('#staffTable');
    let rows = tableBody.querySelectorAll('tr');
    rows.forEach(row => {
      row.style.backgroundColor = "";
    });
    theSelectedRow.style.backgroundColor = "lightblue";
    selectedStaffNum = staffNum;
    staffIsSelected = theSelectedRow;
  } else if (theSelectedRow.style.backgroundColor === "lightblue") {
    theSelectedRow.style.backgroundColor = "";
    selectedStaffNum = undefined;
    staffIsSelected = undefined;
  }
}

let currentStaffIsLate;

function staffOut() {
  
  let input;
  input = getOutTimeInput();
  if (input) {
    let statusElement = document.getElementById(`status${selectedStaffNum}`);
    staffMembers[selectedStaffNum].status = "Out";
    statusElement.innerHTML = staffMembers[selectedStaffNum].status;
    staffMembers[selectedStaffNum].outTime = new Date();
    outTimeElement = document.getElementById(`outTime${selectedStaffNum}`);
    outTimeElement.innerHTML = `${staffMembers[selectedStaffNum].outTime.getHours()}:${staffMembers[selectedStaffNum].outTime.getMinutes().toString().padStart(2, 0)}`;
    let durationElement = document.getElementById(`duration${selectedStaffNum}`);
    durationElement.innerHTML = input;
    let expectedReturnElement = document.getElementById(`expectedReturn${selectedStaffNum}`);
    expectedReturnElement.innerHTML = calculateReturn(staffMembers[selectedStaffNum]);
    staffIsLate(staffMembers[selectedStaffNum]);
  } 
}

function staffIn() {
  let statusElement = document.getElementById(`status${selectedStaffNum}`);
  staffMembers[selectedStaffNum].status = "In";
  statusElement.innerHTML = staffMembers[selectedStaffNum].status;

  staffMembers[selectedStaffNum].outTime = "";
  outTimeElement = document.getElementById(`outTime${selectedStaffNum}`);
  outTimeElement.innerHTML = `${staffMembers[selectedStaffNum].outTime}`;
  let durationElement = document.getElementById(`duration${selectedStaffNum}`);
  durationElement.innerHTML = "";
  staffMembers[selectedStaffNum].expectedReturn = "";
  let expectedReturnElement = document.getElementById(`expectedReturn${selectedStaffNum}`);
  expectedReturnElement.innerHTML = `${staffMembers[selectedStaffNum].expectedReturn}`;
}

let absence;

function getOutTimeInput() {
  let text;
  absence = prompt("Enter duration of absence in minutes:", "Minutes");
  if (absence == null || absence == "") {
    text = "User cancelled the prompt.";
    alert(text);
    return null;
  } else if(parseInt(absence) == 1) {
    return `${absence} minute`;
  } else if(parseInt(absence) < 60) {
    return `${absence} minutes`;
  } else if(parseInt(absence) > 60 && parseInt(absence) < 120) {
    let totalMinutes = absence;
    let hours = Math.floor(totalMinutes / 60);
    let minutes = totalMinutes % 60;
    return `${hours} hour and ${minutes} minutes`;
  } 
}

function calculateReturn(staffMember) {
  let absenceInt = parseInt(absence);
  let timeLeftOffice = new Date(staffMember.outTime);
  let expectedReturn = new Date(timeLeftOffice.setMinutes(timeLeftOffice.getMinutes() + absenceInt));
  staffMember.expectedReturn = expectedReturn;
  return `${expectedReturn.getHours()}:${expectedReturn.getMinutes().toString().padStart(2, 0)}`;
}

function staffIsLate(staffMember) {
  let showToast = () => {
  let toastMarkup = `<div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
                    <div class="toast-header">
                      <img src="${staffMember.picture}" class="rounded me-2" alt="...">
                      <strong class="me-auto">${staffMember.name} ${staffMember.surname}</strong>
                      <small>1 minute ago</small>
                      <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                    </div>
                    <div class="toast-body">
                      This staff member is running late!
                    </div>
                    </div>`

    let toastContainer = document.getElementById("toast-container");
    toastContainer.innerHTML += toastMarkup;
  }
  setTimeout(showToast, staffMember.expectedReturn - staffMember.outTime);
}

function submitForm() {
let vehicleInput = document.getElementById("vehicleInput");
let vehicleValue = vehicleInput.value;

let nameInput = document.getElementById("nameInput");
let nameValue = nameInput.value;

let surnameInput = document.getElementById("surnameInput");
let surnameValue = surnameInput.value;

let telNumInput = document.getElementById("telNumInput");
let telNumValue = telNumInput.value;

let addressInput = document.getElementById("addressInput");
let addressValue = addressInput.value;

let timeInput = document.getElementById("timeInput");
let timeValue = timeInput.value;

  // Do something with the input values, for example:

  let correctFormatting = validateInput(vehicleValue, nameValue, surnameValue, telNumValue, addressValue, timeValue);
  if (correctFormatting === false) {
    alert("Please check your input!");
  } else if (correctFormatting === true){
    // Clear the input fields
    vehicleInput.value = "";
    nameInput.value = "";
    surnameInput.value = "";
    telNumInput.value = "";
    addressInput.value = "";
    timeInput.value = "";
    // Call to create a DeliveryDriver instance
    createDeliveryDriver(vehicleValue, nameValue, surnameValue, telNumValue, addressValue, timeValue);
    // Call to insert Delivery driver into delivery schedule HTML table
    addDelivery();
  }
}

function validateInput(vehicleValue, nameValue, surnameValue, telNumValue, addressValue, timeValue) {
  // Check if the string is empty or null

  if (!vehicleValue || vehicleValue.length === 0) {
    return false;
  } else if (!nameValue || nameValue.length === 0) {
    return false;
  } else if (!surnameValue || surnameValue.length === 0) {
    return false;
  } else if (!telNumValue || telNumValue.length === 0) {
    return false;
  } else if (!addressValue || addressValue.length === 0) {
    return false;
  } else if (!timeValue || timeValue.length === 0) {
    return false;
  }
  
  // Regular expression that checks for Mm and Cc
  let vehicleRegex = /^[mcMC]$/;

  // Regular expressions for strings and numbers
  let stringRegex = /^[a-zA-Z]+$/;
  let numberRegex = /^[0-9]+$/;
  let stringOrNumberRegex = /^[a-zA-Z0-9\s]+$/;
 
  // Regular expression to match the hh:mm format
  const timeFormatRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

  if (!vehicleRegex.test(vehicleValue)) {
    console.log("vehicleValue failed regex test");
    return false;
  } else if (!stringRegex.test(nameValue)) {
    console.log("nameValue failed regex test");
    return false;
  } else if (!stringRegex.test(surnameValue)) {
    console.log("surnameValue failed regex test");
    return false;
  } else if (!numberRegex.test(telNumValue)) {
    console.log("telNumValue failed regex test");
    return false;
  } else if (!stringOrNumberRegex.test(addressValue)) {
    console.log("addressValue failed regex test");
    return false;
  } else if (!timeFormatRegex.test(timeValue)) {
    console.log("timeValue failed regex test");
    return false;
  }
  // return true after all tests are passed
  return true;
}

function createDeliveryDriver(vehicleValue, nameValue, surnameValue, telNumValue, addressValue, timeValue) {
  const newDriver = new DeliveryDriver(vehicleValue, nameValue, surnameValue, telNumValue, addressValue, timeValue);
  // Array that stores current drivers
  deliveryDrivers.push(newDriver);
  console.log("newdriver created");
  console.log("deliverydrivers length = " + deliveryDrivers.length);
}

function addDelivery() {
  let staffTable = document.getElementById("deliveryBoard");
  let vehicleIcon = deliveryDrivers[deliveryDrivers.length -1].vehicle == 'c' || deliveryDrivers[deliveryDrivers.length -1].vehicle == 'C' ? '<td><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" style="height: 40px; width: 40px;"><!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M171.3 96H224v96H111.3l30.4-75.9C146.5 104 158.2 96 171.3 96zM272 192V96h81.2c9.7 0 18.9 4.4 25 12l67.2 84H272zm256.2 1L428.2 68c-18.2-22.8-45.8-36-75-36H171.3c-39.3 0-74.6 23.9-89.1 60.3L40.6 196.4C16.8 205.8 0 228.9 0 256V368c0 17.7 14.3 32 32 32H65.3c7.6 45.4 47.1 80 94.7 80s87.1-34.6 94.7-80H385.3c7.6 45.4 47.1 80 94.7 80s87.1-34.6 94.7-80H608c17.7 0 32-14.3 32-32V320c0-65.2-48.8-119-111.8-127zM434.7 368a48 48 0 1 1 90.5 32 48 48 0 1 1 -90.5-32zM160 336a48 48 0 1 1 0 96 48 48 0 1 1 0-96z"/></svg></td>' : '<td><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" style="height: 40px; width:40px;"><!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M280 32c-13.3 0-24 10.7-24 24s10.7 24 24 24h57.7l16.4 30.3L256 192l-45.3-45.3c-12-12-28.3-18.7-45.3-18.7H64c-17.7 0-32 14.3-32 32v32h96c88.4 0 160 71.6 160 160c0 11-1.1 21.7-3.2 32h70.4c-2.1-10.3-3.2-21-3.2-32c0-52.2 25-98.6 63.7-127.8l15.4 28.6C402.4 276.3 384 312 384 352c0 70.7 57.3 128 128 128s128-57.3 128-128s-57.3-128-128-128c-13.5 0-26.5 2.1-38.7 6L418.2 128H480c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32H459.6c-7.5 0-14.7 2.6-20.5 7.4L391.7 78.9l-14-26c-7-12.9-20.5-21-35.2-21H280zM462.7 311.2l28.2 52.2c6.3 11.7 20.9 16 32.5 9.7s16-20.9 9.7-32.5l-28.2-52.2c2.3-.3 4.7-.4 7.1-.4c35.3 0 64 28.7 64 64s-28.7 64-64 64s-64-28.7-64-64c0-15.5 5.5-29.7 14.7-40.8zM187.3 376c-9.5 23.5-32.5 40-59.3 40c-35.3 0-64-28.7-64-64s28.7-64 64-64c26.9 0 49.9 16.5 59.3 40h66.4C242.5 268.8 190.5 224 128 224C57.3 224 0 281.3 0 352s57.3 128 128 128c62.5 0 114.5-44.8 125.8-104H187.3zM128 384a32 32 0 1 0 0-64 32 32 0 1 0 0 64z"/></svg></td>';
  let row = `<tr id="row${deliveryDrivers.length -1}" onclick="selectsDelivery(this.id)">  
              ${vehicleIcon}
              <td>${deliveryDrivers[deliveryDrivers.length -1].name}</td>
              <td>${deliveryDrivers[deliveryDrivers.length -1].surname}</td>
              <td>${deliveryDrivers[deliveryDrivers.length -1].telephone}</td>
              <td>${deliveryDrivers[deliveryDrivers.length -1].deliveryAddress}</td>
              <td>${deliveryDrivers[deliveryDrivers.length -1].returnTime}</td>
            </tr>`;
           
            staffTable.innerHTML += row;
}

function isDeliveryLate(deliveryDriver) {
  let showToast = () => {
    let toastMarkup = `<div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
                      <div class="toast-header">
                        <strong class="me-auto">Delivery is late</strong>
                        <small>1 minute ago</small>
                        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                      </div>
                      <div class="toast-body">
                        <p>${deliveryDriver.name}</p>
                        <p>Tel: ${deliveryDriver.telephone}</p>
                        <p>Expected return: ${deliveryDriver.returnTime}</p>
                        <p>Delivery address: ${deliveryDriver.deliveryAddress}</p>
                      </div>
                    </div>`

    let toastContainer = document.getElementById("toast-container");
    toastContainer.innerHTML += toastMarkup;
  }

  let timeStr = deliveryDriver.returnTime;
  const [hours, minutes] = timeStr.split(":");
  const returnTime = new Date();
  returnTime.setHours(hours);
  returnTime.setMinutes(minutes);
  const delay = returnTime - Date.now();
  setTimeout(showToast, delay);
}

let thisDeliveryIsSelected = "";

function deleteDelivery() { 
  let userInput = prompt("Type 'DEL' to delete");
  
  if (userInput === "DEL") {

    let row = document.getElementById(thisDeliveryIsSelected);

    row.remove();
  
  } else {
    console.log("Invalid input. Please enter 'DEL'");
  }
}

function selectsDelivery(deliveryRow) {
  let theSelectedRow = document.getElementById(deliveryRow);
  if (theSelectedRow.style.backgroundColor === "") {
    let tableBody = document.querySelector('#deliveryBoard');
    let rows = tableBody.querySelectorAll('tr');
    rows.forEach(row => {
      row.style.backgroundColor = "";
      
      });
    theSelectedRow.style.backgroundColor = "lightblue";
  } else if (theSelectedRow.style.backgroundColor === "lightblue") {
    theSelectedRow.style.backgroundColor = "";
  }
  
  thisDeliveryIsSelected = deliveryRow;
  console.log("selectsThisRow = " + deliveryRow);
}

function updateTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, 0);
  const minutes = now.getMinutes().toString().padStart(2, 0);
  const seconds = now.getSeconds().toString().padStart(2, 0);

  const digitalClock = document.getElementById("digitalClock");
  digitalClock.textContent = `${hours}:${minutes}:${seconds}`;  
}

setInterval(updateTime, 1000);



