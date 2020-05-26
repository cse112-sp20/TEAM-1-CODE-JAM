/*global chrome*/
var currTabUrl;
var lastTabUrl;
var updateInterval = 1000;
var flip = false;
var animal = 0;

// limit of how long you can be on blacklisted site
var threshold = 5000;

function minToMillisecond(min) {
  return min * 60 * 1000;
}

function millisecondToMin(millisecond) {
  return millisecond / (60 * 1000);
}

function updateLocalStorage(tabUrl, timeSpend) {
  if (localStorage.getItem(tabUrl) == undefined) {
    localStorage.setItem(tabUrl, 0);
    console.log(localStorage.getItem(tabUrl));
  } else {
    let time = localStorage.getItem(tabUrl);
    var newTime = parseInt(time) + parseInt(timeSpend);
    localStorage.setItem(tabUrl, newTime);

    if (newTime % threshold == 0) updateTimeline(tabUrl);
  }
}

/**
 * Inserts a new element to the timeline if a user has been on a blacklisted
 * site longer than the set time limit (threshold)
 * @author Brian Aguirre
 * @param {URL} currTabUrl url of blacklisted site
 */
function updateTimeline(currTabUrl) {
  return new Promise((resolve, reject) => {
    let currTime = new Date().toLocaleTimeString(); // needs to be local storage time

    let seconds = localStorage.getItem(currTabUrl) / 1000;
    // let seconds = newTime / 1000;
    //threshold / 1000;
    let time = `Total Time: ${seconds} minutes`;
    let msg = {
      for: "popup",
      message: "timeline",
      url: currTabUrl,
      time: time,
      timestamp: currTime,
      flip: flip,
      animal: animal,
    };
    animal = (animal + 1) % 11;
    flip = !flip;

    if (localStorage["oldElements"] == undefined) {
      // localStorage["oldElements"] = [];
      let firstItem = [{ url: currTabUrl, time: currTime }];
      localStorage.setItem("oldElements", JSON.stringify(firstItem));
    } else {
      let oldElements = JSON.parse(localStorage.getItem("oldElements"));
      oldElements.push({ url: currTabUrl, time: currTime });
      localStorage.setItem("oldElements", JSON.stringify(oldElements));
    }
    chrome.runtime.sendMessage(msg, function (response) {
      console.log(response);
      resolve(response);
    });
  });
}

var myVar = setInterval(myTimer, updateInterval);
// var myVar = setInterval(x, updateInterval);

function myTimer() {
  // console.log("updating")
  chrome.tabs.query(
    {
      active: true,
      lastFocusedWindow: true,
    },
    function (tabs) {
      var tab = tabs[0];
      if (tab != undefined) {
        currTabUrl = getHostname(tab.url);
      }
    }
  );
  if (currTabUrl != undefined) {
    if (black_listed.includes(currTabUrl)) {
      updateLocalStorage(currTabUrl, updateInterval);
    }
  }
}

// /home/gdb/112/timeline_github_v2/TEAM-1-CODE-JAM/public.pem
// /home/gdb/112/timeline_github_v2/TEAM-1-CODE-JAM/public.crx

// chrome.tabs.onRemoved.addListener(function () {
//   currTabUrl = "Closed";
// });

