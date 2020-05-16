var currTabUrl;
var updateInterval = 1000;

//Test


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
    let time = localStorage.getItem(tabUrl);
    var newTime = parseInt(time) + parseInt(timeSpend);
    localStorage.setItem(tabUrl, newTime);
  }
}


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
  }
  //var d = new Date();
  //console.log("The time is: ", d);
  //console.log("Current tabs is: ", currTabUrl);
}

chrome.tabs.onRemoved.addListener(function(){
  currTabUrl = "Closed";
});
