let currTabUrl;
let lastTabUrl;
let updateInterval = 1000;
let flip = false;
let teamCode;
let timelineArray;
let time;


// limit of how long you can be on blacklisted site
let threshold = 5000;

function minToMillisecond(min) {
  return min * 60 * 1000;
}

function millisecondToMin(millisecond) {
  return millisecond / (60 * 1000);
}


//Get team code everytime 
async function updateLocalStorage(tabUrl, timeSpend) {
  teamCode = await getTeamCode();
  if (localStorage.getItem(tabUrl) == undefined) {
    localStorage.setItem(tabUrl, 0);
    console.log(localStorage.getItem(tabUrl));
  } else {
    let time = localStorage.getItem(tabUrl);
    var newTime = parseInt(time) + parseInt(timeSpend);
    localStorage.setItem(tabUrl, newTime);
    if (newTime % threshold == 0) {
      //updateTimeline(tabUrl);
      let seconds = localStorage.getItem(tabUrl) / 1000;
      time = `${tabUrl}: ${seconds} seconds`;
      db.collection("teams")
      .doc(teamCode)
      .update({
        timeWasted: firebase.firestore.FieldValue.arrayUnion({user: userEmail, url: tabUrl, time: time}),
      });
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

    let seconds = localStorage.getItem(currTabUrl) / 1000;
    //threshold / 1000;
    let time = `${currTabUrl}: ${seconds} seconds`;
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
      let firstItem = [{ url: currTabUrl, time: time }];
      localStorage.setItem("oldElements", JSON.stringify(firstItem));
    } else {
      let oldElements = JSON.parse(localStorage.getItem("oldElements"));
      oldElements.push({ url: currTabUrl, time: time });
      localStorage.setItem("oldElements", JSON.stringify(oldElements));
    }
    chrome.runtime.sendMessage(msg, function (response) {
      console.log(response);
      resolve(response);
    });
  });
}



async function updateTimelineFB(){
  teamCode = await getTeamCode();
  db.collection("teams")
  .doc(teamCode)
  .onSnapshot(async function(doc){
    timelineArray = await getTimelineArrayFB();
    console.log(timelineArray);
    let msg = {
      for: "popup",
      message: "timeline",
      url: currTabUrl,
      time: time,
      flip: flip,
    };
    flip = !flip;
    chrome.runtime.sendMessage(msg, (response) => {
      console.log("Send message success!");
    });
  });
}

async function getTimelineArrayFB(){
  return new Promise(function (resolve) {
    db.collection("teams")
    .doc(teamCode)
    .get()
    .then(function (doc){
      let data = doc.data();
      resolve(data.timeWasted);
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



function getTeamCode() {
  return new Promise(function (resolve) {
    chrome.storage.local.get("prevTeam", function (data) {
      resolve(data.prevTeam);
    });
  });
}

