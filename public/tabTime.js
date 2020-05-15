var currTabUrl;
<<<<<<< HEAD
var lastTabUrl;
var updateInterval = 1000;

var flip = false;

function updateLocalStorage(tabUrl, timeSpend) {
  if (localStorage.getItem(tabUrl) == undefined) {
    //var tabInfo = new tabInfo(tabUrl, timeSpend);
    localStorage.setItem(tabUrl, timeSpend);
  } else {
=======
var updateInterval = 1000;



/*
chrome.tabs.onActivated.addListener(function(activeInfo){
  //console.log("The active right now is: ", activeInfo);
  chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
  }, function(tabs) {
    // and use that tab to fill in out title and url
    var tab = tabs[0];
    currTabUrl = getHostname(tab.url);
    //testFirebase();
  });
});
*/
function updateLocalStorage(tabUrl, timeSpend){
  if (localStorage.getItem(tabUrl) == null){
    //var tabInfo = new tabInfo(tabUrl, timeSpend);
    localStorage.setItem(tabUrl, timeSpend);
  }
  else{
>>>>>>> 6753c285c80c1d12a7ad38c07336babe15e5e41e
    let time = localStorage.getItem(tabUrl);
    var newTime = parseInt(time) + parseInt(timeSpend);
    localStorage.setItem(tabUrl, newTime);
  }
}

<<<<<<< HEAD
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
      // console.log(request);
      console.log(response);
      // console.log("inside promise");
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
=======

class tabInfo {
  constructor(url, timeSpend) {
    this.tabUrl = url;
    this.timeSpend = timeSpend;
  }
}

/**
function tabInfo(url, timeSpend){
  this.tabUrl = url;
  this.timeSpend = timeSpend;
}
*/



function testFirebase(){
    // add the user to the team
    var data = 'test';
    db
      .collection(data)
      .doc("Url")
      .set(
        "time"
      );
}











function minToMillisecond(min){
  return min * 60 * 1000;
}

function millisecondToMin(millisecond){
  return millisecond / (60 * 1000);
}

var myVar = setInterval(myTimer, updateInterval);

function myTimer() {
  chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
  }, function(tabs) {
    // and use that tab to fill in out title and url
    var tab = tabs[0];
    //console.log(tab.url);
    currTabUrl = getHostname(tab.url);
    //testFirebase();
  });
  if(black_listed.includes(currTabUrl)){
    updateLocalStorage(currTabUrl, updateInterval);
>>>>>>> 6753c285c80c1d12a7ad38c07336babe15e5e41e
  }
  //var d = new Date();
  //console.log("The time is: ", d);
  //console.log("Current tabs is: ", currTabUrl);
}

<<<<<<< HEAD
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
=======
chrome.tabs.onRemoved.addListener(function(){
  currTabUrl = "Closed";
});
>>>>>>> 6753c285c80c1d12a7ad38c07336babe15e5e41e
