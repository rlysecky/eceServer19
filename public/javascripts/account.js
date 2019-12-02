
var userEmail = "";
var weekdays = ["Sunday","Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Augu", "Sep", "Oct", "Nov", "Dec"];
$(document).ready(function(){
  $('.collapsible').collapsible();
  $.ajax({
    url: 'http://api.openweathermap.org/data/2.5/forecast?lat=32.2328&lon=-110.9607&units=imperial&APPID=1ac5b46230b1f3ae861be919195faa05',
    type: 'GET',
    dataType: 'json',
    success: function(result){
      var allfc = [];
      var d = new Date(result.list[0].dt_txt);
      var temp = 0;
      var cnt = 0;
      for(i of result.list){
        var fcast = new Object();
        var iDate = new Date(i.dt_txt);
        if(iDate.getDate() == d.getDate()){
          temp += i.main.temp;
          cnt++;
        }
        else{
          fcast.month = d.getMonth();
          fcast.day = d.getDate();
          fcast.year = d.getFullYear();
          fcast.temp = temp / cnt;
          allfc.push(fcast);
          d = iDate;
          temp = i.main.temp;
          cnt = 1;
        }
      }
      for(i in allfc){
        $('#fc_' + i).find('.fcdate').html(months[allfc[i].month] + " " + allfc[i].day + ", " + allfc[i].year);
        $('#fc_' + i).find('.fctemp').html(allfc[i].temp.toFixed(2) + '&#8457;');
      }
    }
  })
  .fail(console.log("FAIL"));
});

function ShowAcct(){
  $('#accountInfo').show();
  $('#main').hide();
}


function sendReqForAccountInfo() {
  $.ajax({
    url: '/users/account',
    type: 'GET',
    headers: { 'x-auth': window.localStorage.getItem("authToken") },
    dataType: 'json'
  })
    .done(accountInfoSuccess)
    .fail(accountInfoError);
}

function accountInfoSuccess(data, textSatus, jqXHR) {
  $("#email").html(data.email);
  $("#fullName").html(data.fullName);
  $("#lastAccess").html(data.lastAccess);
  
  // Add the devices to the list before the list item for the add device button (link)
  for (var device of data.devices) {
    $("#addDeviceForm").before("<li class='collection-item'>ID: " +
      device.deviceId + ", APIKEY: " + device.apikey + 
      " <button id='ping-" + device.deviceId + "' class='waves-effect waves-light btn'>Ping</button> " +
      " <button id='activity-" + device.deviceId + "' class='waves-effect waves-light btn'>Show Activity</button> " +
      " </li>");
    $("#ping-"+device.deviceId).click({deviceId: device.deviceId},pingDevice);
    $("#activity-"+device.deviceId).click({deviceId: device.deviceId},populateDeviceActivity);
  }
}

function accountInfoError(jqXHR, textStatus, errorThrown) {
  // If authentication error, delete the authToken 
  // redirect user to sign-in page (which is index.html)
  if( jqXHR.status === 401 ) {
    window.localStorage.removeItem("authToken");
    window.location.replace("index.html");
  } 
  else {
    $("#error").html("Error: " + status.message);
    $("#error").show();
  } 
}

// Registers the specified device with the server.
function registerDevice() {
  $.ajax({
    url: '/devices/register',
    type: 'POST',
    headers: { 'x-auth': window.localStorage.getItem("authToken") },  
    contentType: 'application/json',
    data: JSON.stringify({ deviceId: $("#deviceId").val() }), 
    dataType: 'json'
   })
     .done(function (data, textStatus, jqXHR) {
       // Add new device to the device list
       $("#addDeviceForm").before("<li class='collection-item'>ID: " +
       $("#deviceId").val() + ", APIKEY: " + data["apikey"] + 
         " <button id='ping-" + $("#deviceId").val() + "' class='waves-effect waves-light btn'>Ping</button> " +
         " <button id='activity-" + $("#deviceId").val() + "' class='waves-effect waves-light btn'>Show Activity</button> " +
         "</li>");
       $("#ping-"+$("#deviceId").val()).click(function(event) {
         pingDevice(event, device.deviceId);
       });
       hideAddDeviceForm();
     })
     .fail(function(jqXHR, textStatus, errorThrown) {
       let response = JSON.parse(jqXHR.responseText);
       $("#error").html("Error: " + response.message);
       $("#error").show();
     }); 
}

function pingDevice(event, deviceId) {
   $.ajax({
        url: '/devices/ping',
        type: 'POST',
        headers: { 'x-auth': window.localStorage.getItem("authToken") },   
        data: { 'deviceId': deviceId }, 
        responseType: 'json',
        success: function (data, textStatus, jqXHR) {
            console.log("Pinged.");
        },
        error: function(jqXHR, textStatus, errorThrown) {
            var response = JSON.parse(jqXHR.responseText);
            $("#error").html("Error: " + response.message);
            $("#error").show();
        }
    }); 
}

function populateDeviceActivity(event){
  console.log(event.data.deviceId);
  $('#activityItemList').html('');
  $.ajax({
    url: '/users/activities',
    type: 'GET',
    headers: { 'x-auth': window.localStorage.getItem("authToken") },  
    contentType: 'application/json',
    data: { deviceId: event.data.deviceId }, 
    dataType: 'json'
  }).done(function(data){
    for(let activity of data.activities){
      $('#activityItemList').append('<li>Longitude: '+activity.lon+
      ', Latitude: '+activity.lat+', UV index: '+activity.uv+', Speed: '+activity.speed);
    }
  })
}

function showEditAccount() {
  $("#fullNameEdit").val("");
  $("#editAccountButton").hide();
  $("#editAccountInfo").slideDown();
}

function hideEditAccount() {
  $("#editAccountButton").show();
  $("#editAccountInfo").slideUp();
}

// Show add device form and hide the add device button (really a link)
function showAddDeviceForm() {
  $("#deviceId").val("");        // Clear the input for the device ID
  $("#addDeviceControl").hide();   // Hide the add device link
  $("#addDeviceForm").slideDown();  // Show the add device form
}

// Hides the add device form and shows the add device button (link)
function hideAddDeviceForm() {
  $("#addDeviceControl").show();  // Hide the add device link
  $("#addDeviceForm").slideUp();  // Show the add device form
  $("#error").hide();
}

function sendUpdateRequest() {
  $.ajax({
    url: '/users/account',
    type: 'GET',
    headers: { 'x-auth': window.localStorage.getItem("authToken") },
    dataType: 'json'
  })
    .done(accountInfoOnlySuccess)
    .fail(accountInfoError);
}

// If the old password is correct, continue the update process
function validateSuccess(data, textSatus, jqXHR) {
  $.ajax({
    type: "PUT",
    url: '/users/update',
    data: {
      email: userEmail,
      password: $('#passwordEdit').val(),
      fullName: $("#fullNameEdit").val()
    },
    dataType: "json"
  }).done(function(returnedData) {
    $('#editErrors').html("Success! " + returnedData.message);
    $('#editErrors').show();
  }).fail(function(jqXHR) {
    $('#editErrors').html("Error: Could not update account information.");
    $('#editErrors').show();
  });
}

function validateError(jqXHR, textStatus, errorThrown) {
  if (jqXHR.statusCode == 404) {
    $("#editErrors").html("Error: Server could not be reached.");
    $('#editErrors').show();
  }
  else {
    $('#editErrors').html("Error: Password is incorrect.");
    $('#editErrors').show();
  }
}

function accountInfoOnlySuccess(data, textSatus, jqXHR) {
  let email = data.email;
  userEmail = data.email;
  let newPassword = $('#passwordEdit').val();
  let newPasswordConfirm = $('#passwordEditConfirm').val();
  let oldPassword = $("#currentPasswordEdit").val();
  let validLogin = true;
  
  $("#editErrors").hide();
  $("#editErrors").html("");

  // check old password is entered
  if (!oldPassword) {
    $("#editErrors").html("Error: You need to provide your old password.");
    $("#editErrors").show();
    return;
  }

  // check the new passwords are the same
  if (newPassword != newPasswordConfirm) {
    $("#editErrors").html("Error: New Passwords do not match.");
    $("#editErrors").show();
    return;
  }

  // check new password is strong
  let passwordLowercaseRegex = /[a-z]+/;
  let passwordUppercaseRegex = /[A-Z]+/;
  let passwordDigitRegex = /\d+/;
  let passwordSpecCharRegex = /[!@#\$%\^&]+/;

  let lowerCaseCheck = passwordLowercaseRegex.exec(newPassword);
  let upperCaseCheck = passwordUppercaseRegex.exec(newPassword);
  let digitCheck = passwordDigitRegex.exec(newPassword);
  let specialCharacterCheck = passwordSpecCharRegex.exec(newPassword);

  if (newPassword.length < 10 && newPassword.length != 0) {
    $('#editErrors').append("<div class='red-text text-darken-2'>Password needs to be at least 10 characters long.</div>");
    $('#editErrors').show();
    validLogin = false;
  }

  if (lowerCaseCheck === null && newPassword.length != 0) {
    $('#editErrors').append("<div class='red-text text-darken-2'>Password must contain at least one lower case character.</div>");
    $('#editErrors').show();
    validLogin = false;
  }

  if (upperCaseCheck === null && newPassword.length != 0) {
    $('#editErrors').append("<div class='red-text text-darken-2'>Password must contain at least one upper case character.</div>");
    $('#editErrors').show();
    validLogin = false;
  }

  if (digitCheck === null && newPassword.length != 0) {
    $('#editErrors').append("<div class='red-text text-darken-2'>Password must contain at least one digit.</div>");
    $('#editErrors').show();
    validLogin = false;
  }

  if (specialCharacterCheck === null && newPassword.length != 0) {
    $('#editErrors').append("<div class='red-text text-darken-2'>Password must contain at least one special character. Ex: (!@#\$%\^&)</div>");
    $('#editErrors').show();
    validLogin = false;
  }

  // Don't process an AJAX call
  if (!validLogin) {
    return;
  }

  // check if the old password is correct
  $.ajax({
    url: '/users/signin',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ email : email, password : oldPassword }), 
    dataType: 'json'
  })
    .done(validateSuccess)
    .fail(validateError);
}

// Handle authentication on page load
$(function() {
  // If there's no authToekn stored, redirect user to 
  // the sign-in page (which is index.html)
  if (!window.localStorage.getItem("authToken")) {
    window.location.replace("index.html");
  }
  else {
    sendReqForAccountInfo();
    hideEditAccount();
    $('#main').show();
  }
  
  // Register event listeners
  $('#saveEdit').click(sendUpdateRequest);
  $("#editAccount").click(showEditAccount);
  $("#cancelEdit").click(hideEditAccount);
  $("#addDevice").click(showAddDeviceForm);
  $("#registerDevice").click(registerDevice);  
  $("#cancel").click(hideAddDeviceForm);  
});
