var currTabUrl;
var lastTabUrl;
var updateInterval = 1000;

var flip = false;

function updateLocalStorage(tabUrl, timeSpend) {
  if (localStorage.getItem(tabUrl) == undefined) {
    //var tabInfo = new tabInfo(tabUrl, timeSpend);
    localStorage.setItem(tabUrl, timeSpend);
  } else {
    let time = localStorage.getItem(tabUrl);
    var newTime = parseInt(time) + parseInt(timeSpend);
    localStorage.setItem(tabUrl, newTime);
  }
}

function newTab(currTabUrl) {
  return new Promise((resolve, reject) => {
    if (currTabUrl === lastTabUrl) return;
    let currTime = new Date().toLocaleTimeString();
    let msg = {
      for: "timeline",
      message: "newTab",
      data: currTabUrl,
      time: currTime,
      flip_flag: flip,
    };
    flip = !flip;
    lastTabUrl = currTabUrl;

    chrome.runtime.sendMessage(msg, function (response) {
      console.log(response);
      resolve(response);
    });
  });
}

function newTab2(currTabUrl) {
  if (currTabUrl === lastTabUrl) return;
  let currTime = new Date().toLocaleTimeString();
  let msg = {
    for: "timeline",
    message: "newTab",
    data: currTabUrl,
    time: currTime,
    flip_flag: flip,
  };
  flip = !flip;
  lastTabUrl = currTabUrl;

  let task = new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(msg, function (response) {
      console.log(response);
      resolve(response);
    });
  });

  task
    .then((data) => {
      console.log("data was received");
      console.log(data);
    })
    .catch((data) => {
      console.log("background error");
    });

  // chrome.runtime.sendMessage(msg, function (response) {
  //   console.log(response);
  // });
}

function minToMillisecond(min) {
  return min * 60 * 1000;
}

function millisecondToMin(millisecond) {
  return millisecond / (60 * 1000);
}

// var p = new Promise((resolve,reject)=>{
//   setInterval(myTimer,updateInterval);
//   resolve(currTabUrl)
// });

var myVar = setInterval(myTimer, updateInterval);

function myTimer() {
  chrome.tabs.query(
    {
      active: true,
      lastFocusedWindow: true,
    },
    function (tabs) {
      // and use that tab to fill in out title and url
      var tab = tabs[0];
      //console.log(tab.url);
      if (tab != undefined) {
        currTabUrl = getHostname(tab.url);
      }
      //testFirebase();
    }
  );
  if (currTabUrl != undefined) {
    if (black_listed.includes(currTabUrl)) {
      newTab(currTabUrl).then(updateLocalStorage(currTabUrl, updateInterval));
      // updateLocalStorage(currTabUrl, updateInterval);
    }
  }
  //var d = new Date();
  //console.log("The time is: ", d);
  //console.log("Current tabs is: ", currTabUrl);
}

chrome.tabs.onRemoved.addListener(function () {
  currTabUrl = "Closed";
});

// async function main() {
//   userEmail = await getUserEmail();
//   await validUserEmail(userEmail, createUser);
//   await getUserProfile(userEmail);

//   setupListener();
// }
// main()
