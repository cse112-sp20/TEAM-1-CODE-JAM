var currTabUrl;
var lastTabUrl;
var updateInterval = 1000;

var flip = false;
let black_listed = [
  "www.youtube.com",
  "www.facebook.com",
  "twitter.com",
  "myspace.com",
];
/**
 *  Gets the host name of a URL
 *
 * @param {string} url: URL of a tab
 * @returns {URL} Host name of the tab
 *
 */
function getHostname(url) {
  // Handle Chrome URLs
  if (/^chrome:\/\//.test(url)) {
    return "invalid";
  }
  // Handle Files opened in chrome browser
  if (/file:\/\//.test(url)) {
    return "invalid";
  }
  try {
    var newUrl = new URL(url);
    return newUrl.hostname;
  } catch (err) {
    console.log(err);
  }
}

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
      url: currTabUrl,
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

function minToMillisecond(min) {
  return min * 60 * 1000;
}

function millisecondToMin(millisecond) {
  return millisecond / (60 * 1000);
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
      newTab(currTabUrl).then(updateLocalStorage(currTabUrl, updateInterval));
    }
  }
}

chrome.tabs.onRemoved.addListener(function () {
  currTabUrl = "Closed";
});
