/*global chrome firebase getAnimal addAnimal sendToDB animals*/

let db;
let currTabUrl;
let updateInterval = 1000;

let currentTeamInfo;
let currTeamCode;
let userAnimal;
let github_timeout = 15000;
let currentDate = getDate();

let updateToDatabase;
let githubTracker;
let currentSnapShot = () => {};

let blacklist = ["facebook", "twitter", "myspace", "youtube"];
let userProfile = {
  joined_teams: [],
};
let teams;
let userEmail;

let dailyTeamPoints;

// limit of how long you can be on blacklisted site
let threshold = 5000;
/**
 * Resets timeline elements and redistributes a new animal for each teammember
 * @author Brian Aguirre & William Lui
 */
async function resetTeamInfo() {
  if (currTeamCode === undefined) return;

  let animalsLeft = Array.from(animals);
  let members = currentTeamInfo.members;
  let numMem = currentTeamInfo.members.length;
  let distributedAnimal = {};
  for (let i = 0; i < numMem; i++) {
    distributedAnimal[members[i]] = getAnimal(animalsLeft);
  }

  db.collection("teams")
    .doc(currTeamCode)
    .update({
      currDate: getDate(),
      distributedAnimal: distributedAnimal,
      animalsLeft: animalsLeft,
      teamPoints: 100,
      timeWasted: [],
    })
    .catch((err) => {});
}
/**
 *  Gets the host name of a URL
 *
 * @param {string} url URL of a tab
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
    let newUrl = new URL(url);
    return newUrl.hostname;
  } catch (err) {
    console.log(err);
    return "invalid";
  }
}
/**
 * Returns the logged events of time spent on a blacklisted site longer than the
 * threshold time.
 *
 * @author Brian Aguirre
 * @return {Array} array of objects
 */
// function getAllTabs() {
//   return new Promise((resolve, reject) => {
//     console.log(timelineArray);
//     tabs = [];
//     if (timelineArray != undefined) {
//       let oldElements = JSON.parse(timelineArray).reverse();

//       oldElements.map((obj) => {
//         let tab = obj;
//         tab.flip = flip;
//         tabs.push(tab);
//         flip = !flip;
//       });
//       console.log("The tabs is: ", tabs);
//     }
//     resolve(tabs);
//   });
// }

/*
async function reverseTimelineArray() {
  return new Promise(function (resolve) {
    let tabs = [];
    let reverse = timelineArray.reverse();
    reverse.map((obj) => {
      let tab = obj;
      tab.flip = flip;
      tabs.push(tab);
      flip = !flip;
    });
    resolve(tabs);
  });
}
*/

/**
 * setupListener listens for request coming from popup,
 * it then sends the response that the popup need
 * @author Karl Wang
 */
function setupListener() {
  /**
   * reqeust is the message from popup
   * sendResponse sends a response to the sender(popup)
   * @author Karl Wang
   *  */
  let timeoutVars = {};
  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    //   the message is for the background page
    if (request.for === "background") {
      // popup needs the user email
      if (request.message === "get email") {
        sendResponse({ email: userEmail });
      } else if (request.message === "create team") {
        // create the team on database
        createTeamOnFirebase(request.teamName, userEmail).then((response) => {
          sendResponse(response);
        });
      } else if (request.message === "join team") {
        // join the team and update the database
        joinTeamOnFirebase(request.teamCode, userProfile, userEmail).then(
          (response) => {
            sendResponse(response);
          }
        );
      } else if (request.message === "get teams") {
        sendResponse(teams);
      } else if (request.message === "get team info") {
        sendResponse(currentTeamInfo);
      }
      // VIVIAN
      else if (request.message === "get team points") {
        getUserDailyPoints().then((res) => {
          sendResponse(res);
        });
      } else if (request.message === "set timeout to delete team") {
        timeoutVars[request.teamCode] = setTimeout(async () => {
          let teamInfo = await getTeamInformation(request.teamCode);
          teamInfo = teamInfo.data();
          let userAnimal = teamInfo.distributedAnimal[userEmail];
          let animalsLeft = teamInfo.animalsLeft;
          let distributedAnimal = teamInfo.distributedAnimal;
          await deleteTeamFromUser(
            userEmail,
            request.teamCode,
            userAnimal,
            animalsLeft,
            distributedAnimal
          );
          await deleteIfNoMembers(request.teamCode);
        }, 4000);
      } else if (request.message === "clear timeout") {
        clearTimeout(timeoutVars[request.teamCode]);
      } else if (request.message === "get timeline array") {
        sendResponse(currentTeamInfo);
      } else if (request.message === "switch team") {
        (async () => {
          checkOff();
          currentSnapShot();
          currTeamCode = await getTeamCode();
          userAnimal = await getUserAnimal(userEmail, currTeamCode);
          getTeamOnSnapshot().then(() => {
            sendResponse("success");
          });
        })();
      } else if (request.message === "toggle check in") {
        toggleCheckIn();
      } else if (request.message === "get home info") {
        (async () => {
          let currUrl = await getCurrentUrl();
          let currTeamCode = await getTeamCode();
          let data = {};
          try {
            let profilePic = currentTeamInfo.distributedAnimal[userEmail];
            data = {
              isCheckIn: isCheckIn(),
              blacklist: blacklist,
              teamInfo: currentTeamInfo,
              currUrl: currUrl,
              currTeamCode: currTeamCode,
              profilePic: profilePic,
            };
          } catch {}
          sendResponse(data);
        })();
      }
    }
    // return true here is important, it makes sure that
    // it waits for the database to finish before ending
    // the port for messaging
    return true;
  });
}
//VIVIAN
async function getUserDailyPoints() {
  return new Promise(async (resolve) => {
    let curDate = getDate();
    let dbTeamPoints = await db
      .collection("teamPerformance")
      .doc(curDate)
      .get();
    dbTeamPoints = dbTeamPoints.data();
    let userTeamsPoints = dbTeamPoints[userEmail];
    let allTeamsPoints = dbTeamPoints.totalTeamPoint;
    let res = {};
    for (let team of Object.keys(userTeamsPoints)) {
      res[team] = {
        userPoints: userTeamsPoints[team],
        teamPoints: allTeamsPoints[team],
      };
    }
    resolve(res);
  });
}
// function recentDates(curDate){
//   let i;
//   let dateArray = new Array(4);
//   dateArray[dateArray.length-1] = curDate;
//   int newCurrentDate = curDate;
//   for(i = dateArray.length-2; i >= 0 ; i--){
//     newCurrentDate = getNewDate(newCurrentDate);
//     const usersRef = db.collection('teamPerformance').doc(currentDate);

//     usersRef.get()
//       .then((docSnapshot) => {
//         if (docSnapshot.exists) {
//           usersRef.onSnapshot((doc) => {
//             dateArray[i] = newCurrentDate;
//           });
//         } else {
//           break;
//         }
//     });
//   }

// }
// function getNewDate(someDate){


// }
function toggleCheckIn() {
  if (isCheckIn()) {
    checkOff(updateToDatabase);
  } else {
    checkIn(updateToDatabase, updateInterval);
  }
}

/**
 * Return the team information on database
 * @author Karl Wang
 * @param {string} teamCode The team code to be checked on database
 */
function getTeamInformation(teamCode) {
  return db.collection("teams").doc(teamCode).get();
}
/**
 * Get all the team names of current user from database
 * @author Karl Wang
 * @param teams The global variable to be assigned to
 * @param userProfile Contains all the team user has joined
 */
function getTeamNames(userProfile) {
  return new Promise(async (resolve) => {
    let promises = [];
    for (let key in userProfile.joined_teams) {
      promises.push(getTeamName(key, userProfile));
    }
    resolve(await Promise.all(promises));
  });
}
/**
 * Get the team name with such team code
 * @author Karl Wang
 * @param {string} teamCode The team code to be checked on database
 * @param {object} userProfile The user data from database
 */
function getTeamName(teamCode, userProfile) {
  return new Promise(function (resolve, reject) {
    db.collection("teams")
      .doc(teamCode)
      .get()
      .then(function (doc) {
        let data = doc.data();
        resolve({
          teamCode: teamCode,
          teamName: data.teamName,
          joinedTime: userProfile.joined_teams[teamCode],
        });
      });
  });
}

/**
 * This first do all the checking to see if the team code is valid,
 * if yes, then join the team
 * @author : Karl Wang
 * @param {string} teamCode The length 5 id to join the team
 * @returns {string} "success" if successfully joined,
 * "already joined the group" if user has joined the group already,
 * "team code not found" if the team code does not exist
 */
function joinTeamOnFirebase(teamCode, userProfile, userEmail) {
  return new Promise(async function (resolve, reject) {
    //   user already join the group
    if (teamCode in userProfile.joined_teams) {
      resolve("already joined the group");
      return;
    }
    let unique = await isTeamCodeUnique(teamCode);
    const currentTime = Date.now();
    // unqieu means team code doesn't exist
    if (unique) {
      resolve("team code not found");
      return;
    }
    let initPoint = 100;
    // let points = await getTeamPoint();
    // points = parseInt(points) + 100;

    let animalsLeft = await getAnimalsLeft(teamCode);
    let newAnimal = getAnimal(animalsLeft);

    // do both of these two things parallelly
    await Promise.all([
      // add the user to the team
      db
        .collection("teams")
        .doc(teamCode)
        .update({
          members: firebase.firestore.FieldValue.arrayUnion(userEmail),
          animalsLeft: animalsLeft,
          // teamPoints: points,
        }),

      // add the team code to the user
      db
        .collection("users")
        .doc(userEmail)
        .set(
          {
            joined_teams: { [teamCode]: currentTime },
            user_points: {
              [teamCode]: initPoint,
            },
          },
          { merge: true }
        ),
      db //me
        .collection("teams")
        .doc(teamCode)
        .set(
          {
            distributedAnimal: { [userEmail]: newAnimal },
          },
          { merge: true }
        ),
      // db //me
      //   .collection("teams")
      //   .doc(teamCode)
      //   .update({
      //   }),
    ]);
    resolve("success");
    return;
  });
}
function deleteIfNoMembers(teamCode) {
  return new Promise(async (resolve) => {
    let data = await getTeamInformation(teamCode);
    data = data.data();
    if (data.members.length === 0) {
      await deleteTeamEntirely(teamCode);
      resolve();
    }
    resolve();
  });
}
/**
 * Create the team on the database
 * @author Karl Wang
 * @param {string} teamName The name of the team to be created
 * @param {string} userEmail current user email
 */
async function createTeamOnFirebase(teamName, userEmail) {
  return new Promise(async (resolve, reject) => {
    // first generate a random length 5 id
    let teamCode = await generateRandomTeamCode(5);
    currTeamCode = teamCode;
    // create a time stamp (used for sorting)
    let currentTime = Date.now();
    let initPoint = 100;
    // let host_animal = {`{userEmail: getAnimal()};

    let copiedAnimal = Array.from(animals);
    let newAnimal = getAnimal(copiedAnimal);

    let currMin = new Date().getMinutes();
    // Do these parallelly
    await Promise.all([
      // add the team to the user
      db
        .collection("users")
        .doc(userEmail)
        .set(
          {
            joined_teams: {
              [teamCode]: currentTime,
            },
            user_points: {
              [teamCode]: initPoint,
            },
          },
          { merge: true }
        ),
      // add the team to teams collection
      db
        .collection("teams")
        .doc(teamCode)
        .set(
          {
            teamName: teamName,
            createdTime: currentTime,
            creator: userEmail,
            members: [userEmail],
            timeWasted: [],
            teamPoints: initPoint,
            distributedAnimal: { [userEmail]: newAnimal },
            animalsLeft: copiedAnimal,
            currDate: getDate(),
          },
          { merge: true }
        ),
    ]);
    createTeamPerformance(teamCode, initPoint);
    resolve(teamCode);
  });
}

function createTeamPerformance(key, points) {
  let code = key;
  db.collection("teamPerformance")
    .doc(currentDate)
    .set(
      {
        totalTeamPoint: { [code]: points },
      },
      { merge: true }
    );
}

function deleteEverythingAboutAUser(userEmail) {
  return new Promise(async (resolve, reject) => {
    let queryCreatedTeam = db
      .collection("teams")
      .where("creator", "==", userEmail);
    let queryJoinedTeam = db
      .collection("teams")
      .where("members", "array-contains", userEmail);
    await Promise.all([
      queryCreatedTeam.get().then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
          deleteTeamEntirely(doc.id);
        });
      }),
      queryJoinedTeam.get().then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
          deleteTeamFromUser(userEmail, doc.id);
        });
      }),
      db.collection("users").doc(userEmail).delete(),
    ]);
    resolve();
  });
}

function deleteTeamFromUser(
  userEmail,
  teamCode,
  userAnimal,
  animalsLeft,
  distributedAnimal
) {
  delete distributedAnimal[userEmail];
  addAnimal(animalsLeft, userAnimal);

  return Promise.all([
    db
      .collection("users")
      .doc(userEmail)
      .update({
        ["joined_teams." + teamCode]: firebase.firestore.FieldValue.delete(),
      })
      .catch((err) => {}),
    db
      .collection("teams")
      .doc(teamCode)
      .update({
        members: firebase.firestore.FieldValue.arrayRemove(userEmail),
        distributedAnimal: distributedAnimal,
        animalsLeft: animalsLeft,
      })
      .catch((err) => {}),
  ]);
}
function deleteTeamEntirely(teamCode) {
  db.collection("teams").doc(teamCode).delete();
}

/**
 * This generates a random team code, it makes sure the team code is unique
 * @author Karl Wang
 * @param {int} length Specifies the length of the team code, should be 5
 * @returns {string} The randomly generated unique team code
 */
function generateRandomTeamCode(length) {
  return new Promise(async function (resolve, reject) {
    let unique = false;
    let teamCode;
    while (unique === false) {
      teamCode = randomTeamCode(length);
      // check if such team code exists on the database
      unique = await isTeamCodeUnique(teamCode);
    }
    resolve(teamCode);
  });
}
/**
 * Generate a random team code
 * @author Karl Wang
 * @param {int} length Specifies the length of the team code
 * @returns {string} The randomly generated teamcode
 */
function getUserInformation(userEmail) {
  return db.collection("users").doc(userEmail).get();
}
function randomTeamCode(length) {
  let result = "";
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
/**
 * Check if there exists such team code on the database
 * @author Karl Wang
 * @param {string} id The team code to be checked
 * @returns {boolean} True if the team code is unique, else False
 */
function isTeamCodeUnique(id) {
  let idRef = db.collection("teams").doc(id);
  return new Promise(function (resolve, reject) {
    idRef.get().then(function (doc) {
      if (doc.exists) {
        resolve(false);
      }
      // id is a unique id
      else {
        resolve(true);
      }
    });
  });
}

/**
 * Get the user email from chrome api
 * @author Karl Wang
 */
function getUserEmail() {
  return new Promise(function (resolve, reject) {
    chrome.identity.getProfileUserInfo(function (info) {
      let email = info.email;
      resolve(email);
    });
  });
}
/**
 * Check if the user email is valid, if invalid(new user), create the
 * user on database
 * @author Karl Wang
 * @param {string} userEmail The email of the current chrome user
 * @param {function} createUser The function that creates a new user on database
 * @return {boolean} true if user originally exist, false if user did not exist
 */
function validUserEmail(userEmail, createUser) {
  return new Promise(function (resolve, reject) {
    db.collection("users")
      .doc(userEmail)
      .get()
      .then(async function (doc) {
        if (!doc.exists) {
          await createUser(userEmail);
          resolve(false);
          return;
        }
        resolve(true);
      });
  });
}
/**
 * Create a user entry on the database
 * @author Karl Wang
 * @param {string} userEmail The id of the new document on database
 */
function createUser(userEmail) {
  return new Promise(async function (resolve, reject) {
    let userRef = db.collection("users").doc(userEmail);
    userRef
      .set({
        joined_teams: {},
      })
      .then(resolve());
  });
}
/**
 * This listens for any changes of the user then update it to
 * local variable userProfile
 * @author Karl Wang
 * @param {string} userEmail The id of the user
//  * @param {object} userProfile The user profile to assign to
//  * @param {teams} teams The team names of all the joined teams
 */
function getUserProfile(userEmail) {
  return new Promise(function (resolve, reject) {
    db.collection("users")
      .doc(userEmail)
      .onSnapshot(async function (doc) {
        userProfile = doc.data();
        teams = await getTeamNames(userProfile);
        resolve();
      });
  });
}
function isCheckIn() {
  let data = localStorage.getItem("check in");
  if (data == undefined) {
    localStorage.setItem("check in", false);
    return false;
  }
  return data === "true";
}
function checkIn() {
  localStorage.setItem("check in", true);
  updateToDatabase = setInterval(myTimer, updateInterval);
  githubTracker = setInterval(function () {
    sendToDB(currTeamCode, userAnimal);
  }, github_timeout);
}
function checkOff() {
  localStorage.setItem("check in", false);
  clearInterval(updateToDatabase);
  clearInterval(githubTracker);
}
/**
 * Init Firebase configuration
 * @author Karl Wang
 */
function initializeFirebase() {
  try {
    global.firebase = require("firebase");
  } catch {}

  const firebaseConfig = {
    apiKey: "AIzaSyCJYc-PMIXdQxE2--bQI6Z1FGMKwMulEyc",
    authDomain: "chrome-extension-cse-112.firebaseapp.com",
    databaseURL: "https://chrome-extension-cse-112.firebaseio.com",
    projectId: "chrome-extension-cse-112",
    storageBucket: "chrome-extension-cse-112.appspot.com",
    messagingSenderId: "275891630155",
    appId: "1:275891630155:web:f238da778112200c815dce",
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  return firebase;
}

/*
 *
 * realTime.js
 *
 */

function minToMillisecond(min) {
  return min * 60 * 1000;
}

function millisecondToMin(millisecond) {
  return millisecond / (60 * 1000);
}
/**
 * @return user's personal animal
 */
async function getUserAnimal(userEmail, teamCode) {
  return new Promise(function (resolve) {
    db.collection("teams")
      .doc(teamCode)
      .get()
      .then(function (doc) {
        let data = doc.data();
        let userAnimal = data.distributedAnimal[userEmail];
        resolve(userAnimal);
      });
  });
}

/**
 * @return animal remaining in the database
 */
async function getAnimalsLeft(teamCode) {
  return new Promise(function (resolve) {
    db.collection("teams")
      .doc(teamCode)
      .get()
      .then(function (doc) {
        let data = doc.data();
        let animalsLeft = data.animalsLeft;
        resolve(animalsLeft);
      });
  });
}
async function getDistributedAnimal(teamCode) {
  return new Promise(function (resolve) {
    db.collection("teams")
      .doc(teamCode)
      .get()
      .then(function (doc) {
        let data = doc.data();
        let distributedAnimal = data.distributedAnimal;
        resolve(distributedAnimal);
      });
  });
}

//Get team code everytime
async function updateLocalStorage(tabUrl, timeSpend) {
  currTeamCode = await getTeamCode();
  let currData = localStorage.getItem(currTeamCode);
  if (currData == undefined) {
    let data = { [tabUrl]: 0 };
    data = JSON.stringify(data);
    localStorage.setItem(currTeamCode, data);
  } else {
    currData = JSON.parse(currData);
    let newTime;
    // user visited a new url not in localstorage
    if (!(tabUrl in currData)) {
      currData[tabUrl] = Number(0);
    } else {
      let time = currData[tabUrl];
      newTime = parseInt(time) + parseInt(timeSpend);
      currData[tabUrl] = newTime;
    }
    currData = JSON.stringify(currData);
    localStorage.setItem(currTeamCode, currData);
    if (JSON.parse(currData)[tabUrl] % threshold == 0) {
      let seconds = JSON.parse(currData)[tabUrl] / 1000;
      let score = threshold / (60 * 1000);
      let today = new Date();
      let currTime = new Date().toLocaleTimeString();
      let teamCode = await getTeamCode();
      // let teamPoints = await getTeamPoint();
      let teamPoints = currentTeamInfo.teamPoints;
      // we will be using teamCode and userEmail to retrieve userPoints and update these
      teamPoints = teamPoints - score;
      // let userPoints = await getUserPoint();
      let userPoints = userProfile.user_points[teamCode];
      userPoints = userPoints - score;

      let userAnimal = await getUserAnimal(userEmail, teamCode);
      db.collection("teams")
        .doc(currTeamCode)
        .update({
          timeWasted: firebase.firestore.FieldValue.arrayUnion({
            user: userEmail,
            url: tabUrl,
            time: seconds,
            points: -score,
            currTime: currTime,
            animal: userAnimal,
          }),
          teamPoints: teamPoints,
        });

      await db
        .collection("users")
        .doc(userEmail)
        .set(
          {
            user_points: {
              [currTeamCode]: userPoints,
            },
          },
          { merge: true }
        );

      db.collection("teamPerformance")
        .doc(currentDate)
        .set(
          {
            [userEmail]: userProfile.user_points,
            totalTeamPoint: { [currTeamCode]: teamPoints },
          },
          { merge: true }
        );
    }
  }
}

/**
 * @author: Youliang Liu & Xiang Liu
 * @return: the current date
 */
function getDate() {
  let d = new Date();
  let date = d.getDate();
  let month = d.getMonth() + 1; // Since getMonth() returns month from 0-11 not 1-12
  let year = d.getFullYear();
  let dateStr = month + "" + date + "" + year;
  return dateStr;
}

/**
 * @author: Youliang Liu
 * check if it is the current date, otherwise clear the localStorage and cloud storage
 */

function checkDate() {
  let d = new Date();
  let date = d.getDate();
  let month = d.getMonth() + 1; // Since getMonth() returns month from 0-11 not 1-12
  let year = d.getFullYear();
  let dateStr = month + "/" + date + "/" + year;
  if (localStorage.getItem("date") == undefined) {
    localStorage.setItem("date", dateStr);
  } else if (localStorage.getItem("date") != dateStr) {
    localStorage.clear();
    localStorage.setItem("date", dateStr);
  }
}
/**
 * @author: Xiang Liu & Youliang Liu
 * get the current team points from the database
 */
async function getTeamPoint() {
  return new Promise(async function (resolve) {
    currTeamCode = await getTeamCode();
    db.collection("teams")
      .doc(currTeamCode)
      .get()
      .then(function (doc) {
        let data = doc.data();
        resolve(data.teamPoints);
      });
  });
}

function getCurrentUrl() {
  return new Promise((resolve) => {
    chrome.tabs.query(
      {
        active: true,
        lastFocusedWindow: true,
      },
      function (tabs) {
        let tab = tabs[0];
        if (tab !== undefined) {
          let currHost = getHostname(tab.url);
          resolve(getNameOfURL(currHost));
        } else {
          resolve(undefined);
        }
      }
    );
  });
}

async function myTimer() {
  currTabUrl = await getCurrentUrl();
  if (currTabUrl !== undefined || currTabUrl !== "invalid") {
    if (blacklist.includes(currTabUrl)) {
      updateLocalStorage(currTabUrl, updateInterval);
    }
  }
  // resets teams data and creates
  if (
    currentTeamInfo.currDate !== undefined &&
    currentTeamInfo.currDate !== getDate()
  ) {
    await resetTeamInfo();
    currentDate = getDate();
    createTeamPerformance(teamCode, 100);
  }
}

function getNameOfURL(currHost) {
  if (currHost == "invalid") return currHost;
  let splitArr = currHost.split(".");
  if (splitArr.length <= 2) return splitArr[0];
  else return splitArr[1];
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

function getTeamOnSnapshot() {
  return new Promise(async function (resolve, reject) {
    const currentTeam = await getTeamCode();
    if (currentTeam != undefined) {
      currentSnapShot = db
        .collection("teams")
        .doc(currentTeam)
        .onSnapshot(function (doc) {
          currentTeamInfo = doc.data();
          let userAnimal = currentTeamInfo.distributedAnimal[userEmail];
          currentTeamInfo["userAnimal"] = userAnimal;
          let msg = {
            for: "team info",
            message: currentTeamInfo,
          };
          chrome.runtime.sendMessage(msg);
          delete currentTeamInfo["userAnimal"];
          resolve();
          // return;
        });
    } else {
      resolve();
    }
  });
}
// main
/**
 * The main of background script
 * @author Karl Wang
 */
async function main() {
  db = firebase.firestore();
  userEmail = await getUserEmail();
  // for puppetter usage only!
  if (userEmail === "") userEmail = "agent@gmail.com";
  await validUserEmail(userEmail, createUser);
  await Promise.all([getUserProfile(userEmail), getTeamOnSnapshot()]);
  //Todo: Change later
  checkOff();
  checkDate();
  //deleteEverythingAboutAUser(userEmail);
  setupListener();
}
main();

try {
  module.exports = {
    randomTeamCode,
    getHostname,
    isTeamCodeUnique,
    joinTeamOnFirebase,
    getTeamName,
    validUserEmail,
    createTeamOnFirebase,
    deleteTeamFromUser,
    getTeamInformation,
    getUserInformation,
    deleteTeamEntirely,
    setupListener,
    createUser,
    deleteEverythingAboutAUser,
  };
} catch {}
