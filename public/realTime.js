/*global chrome*/
var currTabUrl;
var lastTabUrl;
var updateInterval = 1000;
var flip = false;
var animal = 4;

console.log(animals[0]);
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
    let msg = {
      for: "popup",
      message: "timeline",
      url: currTabUrl,
      time: currTime,
      animal: animal,
    };
    animal = (animal + 1) % 20;
    flip = !flip;

    if (localStorage["oldElements"] == undefined) {
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

function myTimer() {
  console.log("update");
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

chrome.tabs.onRemoved.addListener(function () {
  currTabUrl = "Closed";
});
