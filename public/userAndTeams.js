/* global firebase chrome sendToDB*/
import { animals, addAnimal, getAnimal } from "./animalGenerator.js";
import { getCurrentUrl } from "./tabs.js";
// import { sendToDB } from "./githubTracker.js";
import { db } from "./firebaseInit.js";
export let currentTeamSnapshot = () => {};
export let teamNames = [];
export let currentTeamInfo = {
  currDate: undefined,
  animalsLeft: [],
  createdTime: undefined,
  creator: undefined,
  distributedAnimal: [],
  members: [],
  teamName: "",
  teamPoints: 100,
  timeWasted: [],
};
export let userProfile = {
  joined_teams: {},
  user_points: {},
};
export let userEmail = "";
export let currTeamCode = undefined;
export let userAnimal = "";
export let blacklist = ["facebook", "twitter", "myspace", "youtube"];
// everything regarding to updating to local storage and firebase
export let updateDBParams = {
  updateInterval: 1000,
  updateToDatabase: "",
  threshold: 5000,
  githubTracker: "",
  githubTimeout: 15000,
};

/**
 * setupListener listens for request coming from popup,
 * it then sends the response that the popup need
 * @author Karl Wang
 */
export function setupListener() {
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
        sendResponse(teamNames);
      } else if (request.message === "get team info") {
        sendResponse(currentTeamInfo);
      }
      // VIVIAN
      else if (request.message === "get team points") {
        getUserDailyPoints().then((res) => {
          sendResponse(res);
        });
      }
      // else if (request.message === "get timeline") {
      //   reverseTimelineArray().then((tabs) => {
      //     sendResponse(tabs);
      //   });
      // }
      else if (request.message === "set timeout to delete team") {
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
          checkOff(updateDBParams);
          currentTeamSnapshot();
          let teamCode = await getTeamCode();
          setTeamCode(teamCode);
          userAnimal = await getUserAnimal(userEmail, currTeamCode);
          getTeamOnSnapshot().then(() => {
            sendResponse("success");
          });
        })();
      } else if (request.message === "toggle check in") {
        toggleCheckIn(updateDBParams);
      } else if (request.message === "get home info") {
        (async () => {
          let currUrl = await getCurrentUrl();
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
          } catch (err) {
            console.error(err);
          }
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
export async function getUserDailyPoints() {
  let curDate = getDate();
  let dbTeamPoints = await db.collection("teamPerformance").doc(curDate).get();
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
  return res;
}
/**
 * Return the team information on database
 * @author Karl Wang
 * @param {string} teamCode The team code to be checked on database
 */
export function getTeamInformation(teamCode) {
  return db.collection("teams").doc(teamCode).get();
}
/**
 * Get all the team names of current user from database
 * @author Karl Wang
 * @param teams The global variable to be assigned to
 * @param userProfile Contains all the team user has joined
 */
export async function getTeamNames(userProfile) {
  let promises = [];
  for (let key in userProfile.joined_teams) {
    promises.push(_.getTeamName(key, userProfile));
  }
  let res = await Promise.all(promises);
  res = res.filter(Boolean);
  return res;
}
/**
 * Get the team name with such team code
 * @author Karl Wang
 * @param {string} teamCode The team code to be checked on database
 * @param {object} userProfile The user data from database
 */
export function getTeamName(teamCode, userProfile) {
  return new Promise((resolve) => {
    db.collection("teams")
      .doc(teamCode)
      .get()
      .then(function (doc) {
        if (!doc.exists) {
          resolve(undefined);
          return;
        }
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
 * @author: Youliang Liu
 * check if it is the current date, otherwise clear the localStorage and cloud storage
 */

export function checkDate() {
  let dateStr = getDate();
  // curr
  if (localStorage.getItem("date") == undefined) {
    localStorage.setItem("date", dateStr);
  } else if (localStorage.getItem("date") != dateStr) {
    localStorage.clear();
    localStorage.setItem("date", dateStr);
  }
  if (
    currentTeamInfo.currDate !== undefined &&
    currentTeamInfo.currDate !== dateStr
  ) {
    console.log("reset");
    resetTeamInfo();
    // currentDate = getDate();
    createTeamPerformance(currTeamCode, 100, userEmail);
  }
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
export async function joinTeamOnFirebase(teamCode, userProfile, userEmail) {
  //   user already join the group
  if (teamCode in userProfile.joined_teams) {
    return "already joined the group";
  }
  let unique = await isTeamCodeUnique(teamCode);
  const currentTime = Date.now();
  // unique means team code doesn't exist
  if (unique) {
    return "team code not found";
  }
  let initPoint = 100;
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
  ]);
  return "success";
}
/**
 * Delete the team if team has 0 members
 * @author Karl Wang
 * @param {string} teamCode the Team code to check
 */
export async function deleteIfNoMembers(teamCode) {
  let data = await getTeamInformation(teamCode);
  data = data.data();
  if (data.members.length === 0) {
    await deleteTeamEntirely(teamCode);
    return;
  } else {
    return;
  }
}
/**
 * Create the team on the database
 * @author Karl Wang
 * @param {string} teamName The name of the team to be created
 * @param {string} userEmail current user email
 */
export async function createTeamOnFirebase(teamName, userEmail) {
  // first generate a random length 5 id
  let teamCode = await _.generateRandomTeamCode(5);
  // create a time stamp (used for sorting)
  let currentTime = Date.now();
  let initPoint = 100;

  let copiedAnimal = Array.from(animals);
  let newAnimal = getAnimal(copiedAnimal);
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
    createTeamPerformance(teamCode, initPoint, userEmail),
  ]);
  return teamCode;
}
export async function createTeamPerformance(key, points, userEmail) {
  let code = key;
  let currentDate = getDate();
  return db
    .collection("teamPerformance")
    .doc(currentDate)
    .set(
      {
        [userEmail]: { [code]: points },
        totalTeamPoint: { [code]: points },
      },
      { merge: true }
    );
}
/**
 * Delete all the teams that user joined, created and in the end,
 * delete the user doc from DB
 * @param {string} userEmail the user email of the user
 */
export async function deleteEverythingAboutAUser(userEmail) {
  let queryCreatedTeam = db
    .collection("teams")
    .where("creator", "==", userEmail);
  let queryJoinedTeam = db
    .collection("teams")
    .where("members", "array-contains", userEmail);
  // do these things parallely
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
  return;
}
/**
 *
 * @param {string} userEmail the email of the user
 * @param {string} teamCode the team code to be deleted from
 * @param {string} userAnimal the user animal of that team
 * @param {string} animalsLeft the animals left from user
 * @param {object} distributedAnimal the object containing all animals
 */
export async function deleteTeamFromUser(
  userEmail,
  teamCode,
  userAnimal,
  animalsLeft,
  distributedAnimal
) {
  delete distributedAnimal[userEmail];
  addAnimal(animalsLeft, userAnimal);

  return await Promise.all([
    db
      .collection("users")
      .doc(userEmail)
      .update({
        ["joined_teams." + teamCode]: firebase.firestore.FieldValue.delete(),
      })
      .catch((err) => {
        console.error(err);
      }),
    db
      .collection("teams")
      .doc(teamCode)
      .update({
        members: firebase.firestore.FieldValue.arrayRemove(userEmail),
        distributedAnimal: distributedAnimal,
        animalsLeft: animalsLeft,
      })
      .catch((err) => {
        console.error(err);
      }),
  ]);
}
/**
 *
 * @param {string} teamCode the team code of the team to be deleted
 */
export function deleteTeamEntirely(teamCode) {
  db.collection("teams").doc(teamCode).delete();
}

/**
 * This generates a random team code, it makes sure the team code is unique
 * @author Karl Wang
 * @param {int} length Specifies the length of the team code, should be 5
 * @returns {string} The randomly generated unique team code
 */
export async function generateRandomTeamCode(length) {
  let unique = false;
  let teamCode;
  while (unique === false) {
    teamCode = randomTeamCode(length);
    // check if such team code exists on the database
    unique = await isTeamCodeUnique(teamCode);
  }
  return teamCode;
}
/**
 * Get the user information on firebase
 * @param {string} userEmail the email of the user
 */
export function getUserInformation(userEmail) {
  return db.collection("users").doc(userEmail).get();
}
/**
 * Generate a random team code
 * @author Karl Wang
 * @param {int} length Specifies the length of the team code
 * @returns {string} The randomly generated teamcode
 */
export function randomTeamCode(length) {
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
export function isTeamCodeUnique(id) {
  let idRef = db.collection("teams").doc(id);
  return new Promise((resolve) => {
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
export function validUserEmail(userEmail, createUser) {
  return new Promise((resolve) => {
    db.collection("users")
      .doc(userEmail)
      .get()
      .then(async function (doc) {
        if (!doc.exists) {
          await createUser(userEmail);
          resolve(false);
        } else {
          resolve(true);
        }
      });
  });
}

/**
 * Get the user email from chrome api
 * @author Karl Wang
 * @returns {string} the email of the user
 */
export function getUserEmail() {
  return new Promise((resolve) => {
    chrome.identity.getProfileUserInfo(function (info) {
      let email = info.email;
      resolve(email);
    });
  });
}
/**
 * Create a user entry on the database
 * @author Karl Wang
 * @param {string} userEmail The id of the new document on database
 */
export function createUser(userEmail) {
  return new Promise((resolve) => {
    let userRef = db.collection("users").doc(userEmail);
    userRef
      .set({
        joined_teams: {},
        user_points: {},
      })
      .then(() => {
        resolve();
      });
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
export function getUserProfile(userEmail) {
  return new Promise((resolve) => {
    db.collection("users")
      .doc(userEmail)
      .onSnapshot(async function (doc) {
        userProfile = doc.data();
        teamNames = await getTeamNames(userProfile);
        resolve();
      });
  });
}

/**
 * return the user icon base on his email and the
 * team he is in
 * @author Brian Aguirre, William Lui
 * @param {string} userEmail, the email of the current user
 * @param {string} teamCode, the team code of the current team
 * @return return the icon of the user
 */
export async function getUserAnimal(userEmail, teamCode) {
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
 * return the list of remaining icons avaliable
 * from the database for the current team
 * @author Brian Aguirre, William Lui
 * @param {string} teamCode, the team code of the current team
 * @return return the list of icons remaining
 */
export async function getAnimalsLeft(teamCode) {
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
/**
 *
 * @param {string} tabUrl the url to be updated on localstorage
 * @param {string} timeSpend timeSpend on the current website
 */
export async function updateLocalStorage(tabUrl, timeSpend, threshold) {
  let teamCode = await getTeamCode();
  // access to the local storage to get the team code object
  let currData = localStorage.getItem(teamCode);
  // if local storage doesn't have the team code
  if (currData == undefined) {
    // the time spent on current url is 0 seconds
    let data = { [tabUrl]: Number(0) };
    data = JSON.stringify(data);
    // put it in local storage
    localStorage.setItem(teamCode, data);
  }
  // local storage contains the team code
  else {
    currData = JSON.parse(currData);
    let newTime;
    // user visited a new url not in team localstorage
    if (!(tabUrl in currData)) {
      // initialize the current website to 0 seconds
      currData[tabUrl] = Number(0);
    }
    // team localstorage has the time for current url
    else {
      // grab the time spent on the current url
      let time = currData[tabUrl];
      // add the new time
      newTime = parseInt(time) + parseInt(timeSpend);
      // update the time
      currData[tabUrl] = newTime;
    }
    currData = JSON.stringify(currData);
    // update the local storage
    localStorage.setItem(teamCode, currData);
    if (JSON.parse(currData)[tabUrl] % threshold == 0) {
      let seconds = JSON.parse(currData)[tabUrl] / 1000;
      let score = threshold / (60 * 1000);
      // let today = new Date();
      // let currTime =
      //   today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      let currTime = new Date().toLocaleTimeString();
      let currentDate = getDate();
      let teamPoints = currentTeamInfo.teamPoints;
      // we will be using teamCode and userEmail to retrieve userPoints and update these
      teamPoints = teamPoints - score;
      let userPoints = userProfile.user_points[teamCode];
      userPoints = userPoints - score;

      let userAnimal = await getUserAnimal(userEmail, teamCode);
      db.collection("teams")
        .doc(teamCode)
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
              [teamCode]: userPoints,
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
 * Get the latest information of the current team on database
 */
export async function getTeamOnSnapshot() {
  const currentTeam = await getTeamCode();
  if (currentTeam === undefined) {
    return;
  }
  return new Promise(function (resolve) {
    currentTeamSnapshot = db
      .collection("teams")
      .doc(currentTeam)
      .onSnapshot(function (doc) {
        if (!doc.exists) {
          console.log("here");
          resolve();
        }
        currentTeamInfo = doc.data();
        let userAnimal = currentTeamInfo.distributedAnimal[userEmail];
        currentTeamInfo["userAnimal"] = userAnimal;
        let msg = {
          for: "team info",
          message: currentTeamInfo,
        };
        chrome.runtime.sendMessage(msg);
        // check if its day is old
        checkDate();
        resolve();
        // return;
      });
  });
}

/**
 * Get the team code of the current team
 * @author Youliang Liu
 * @returns {string} the promise that contains the team code of the current team
 */
export function getTeamCode() {
  return new Promise(function (resolve) {
    chrome.storage.local.get("prevTeam", function (data) {
      if (data.prevTeam in userProfile.joined_teams) resolve(data.prevTeam);
      else resolve(undefined);
    });
  });
}

/**
 * Start periodically update to local storage and
 * @param {object} params the parameters containing update time and update interval
 */
export function checkIn(params) {
  localStorage.setItem("check in", true);
  params.updateToDatabase = setInterval(() => {
    myTimer(params);
  }, params.updateInterval);
  params.githubTracker = setInterval(function () {
    sendToDB(currTeamCode, userAnimal);
  }, params.githubTimeout);
}
export function checkOff(params) {
  localStorage.setItem("check in", false);
  clearInterval(params.updateToDatabase);
  clearInterval(params.githubTracker);
}
/**
 * Handle check in, if currently check in, check off. If current check out, check in
 * @author Karl Wang
 */
export function toggleCheckIn(params) {
  if (isCheckIn()) {
    checkOff(params);
  } else {
    checkIn(params);
  }
}

/**
 * The timer to update to local storage and database
 */
export async function myTimer(params) {
  let currTabUrl = await getCurrentUrl();
  if (currTabUrl !== undefined || currTabUrl !== "invalid") {
    if (blacklist.includes(currTabUrl)) {
      updateLocalStorage(currTabUrl, params.updateInterval, params.threshold);
    }
  }
  // resets teams data and creates
}
/**
 * Check if the current user is check in
 * @author Karl Wang
 * @returns {boolean} true if user is check in, false otherwise
 */
export function isCheckIn() {
  let data = localStorage.getItem("check in");
  if (data == undefined) {
    localStorage.setItem("check in", false);
    return false;
  }
  return data === "true";
}

/**
 * Resets timeline elements and redistributes a
 * new animal for each teammember
 * @author Brian Aguirre & William Lui
 */
function resetTeamInfo() {
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
    .catch((err) => {
      console.error(err);
    });
}
/**
 * @author: Youliang Liu & Xiang Liu
 * @return: the current date
 */
export function getDate() {
  let d = new Date();
  let date = d.getDate();
  let month = d.getMonth() + 1; // Since getMonth() returns month from 0-11 not 1-12
  let year = d.getFullYear();
  let dateStr = month + "_" + date + "_" + year;
  return dateStr;
}

export function setUserEmail(email) {
  userEmail = email;
}
export function setTeamCode(teamcode) {
  currTeamCode = teamcode;
}

const _ = {
  getUserInformation,
  getTeamInformation,
  randomTeamCode,
  isTeamCodeUnique,
  generateRandomTeamCode,
  getUserEmail,
  getTeamNames,
  getTeamName,
  setTeamCode,
  validUserEmail,
  createUser,
  getUserProfile,
  createTeamOnFirebase,
};

export default _;
