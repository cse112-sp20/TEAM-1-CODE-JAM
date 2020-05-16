var currTabUrl;
var lastTabUrl;
var updateInterval = 1000;
var flip = false;

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
    localStorage.setItem(tabUrl, timeSpend);
  } else {
    let time = localStorage.getItem(tabUrl);
    var newTime = parseInt(time) + parseInt(timeSpend);
    if (newTime >= threshold) {
      updateTimeline(tabUrl);
      localStorage.setItem(tabUrl, 0); // reset timer
    } else {
      localStorage.setItem(tabUrl, newTime);
    }
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
    let seconds = threshold / 1000;
    let time = `${currTabUrl}: ${seconds} minutes`;
    let msg = {
      for: "popup",
      message: "timeline",
      url: currTabUrl,
      time: time,
      flip: flip,
    };
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

function myTimer() {
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
