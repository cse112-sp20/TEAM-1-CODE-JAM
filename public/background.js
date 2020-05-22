/*global chrome firebase flip*/
let db;

let black_listed = [
  "www.youtube.com",
  "www.facebook.com",
  "twitter.com",
  "myspace.com",
];
let userProfile = {
  joined_teams: [],
};
let teams;
let userEmail;
let tabs;

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
    var newUrl = new URL(url);
    return newUrl.hostname;
  } catch (err) {
    console.log(err);
  }
}
/**
 * Returns the logged events of time spent on a blacklisted site longer than the
 * threshold time.
 *
 * @author Brian Aguirre
 * @return {Array} array of objects
 */
function getAllTabs() {
  return new Promise((resolve, reject) => {
    console.log(timelineArray);
    tabs = [];
    if (timelineArray != undefined) {
      let oldElements = JSON.parse(
        timelineArray
      ).reverse();

      oldElements.map((obj) => {
        let tab = obj;
        tab.flip = flip;
        tabs.push(tab);
        flip = !flip;
      });
      console.log("The tabs is: ", tabs);
    }
    resolve(tabs);
  });
}



async function reverseTimelineArray() {
  return new Promise(function (resolve){
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
      }
      //  else if (request.message === "get team code") {
      //   // generate a random team code of length 5 then send it back
      //   generateRandomTeamCode(5).then((teamCode) => {
      //     sendResponse({ teamCode: teamCode });
      //   });
      // }
      else if (request.message === "create team") {
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
        getTeamInformation(request.teamCode).then(function (doc) {
          sendResponse(doc.data());
        });
      } else if (request.message === "get timeline") {
        reverseTimelineArray().then((tabs) => {
          sendResponse(tabs);
        });
      }
    }
    // return true here is important, it makes sure that
    // it waits for the database to finish before ending
    // the port for messaging
    return true;
  });
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

    // do both of these two things parallelly
    await Promise.all([
      // add the user to the team
      db
        .collection("teams")
        .doc(teamCode)
        .update({
          members: firebase.firestore.FieldValue.arrayUnion(userEmail),
        }),
      // add the team code to the user
      db
        .collection("users")
        .doc(userEmail)
        .set(
          {
            joined_teams: { [teamCode]: currentTime },
          },
          { merge: true }
        ),
    ]);

    resolve("success");
    return;
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
    // create a time stamp (used for sorting)
    let currentTime = Date.now();
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
            timeWasted : [],
          },
          { merge: true }
        ),
    ]);
    resolve(teamCode);
  });
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

function deleteTeamFromUser(userEmail, teamCode) {
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
  db = firebase.firestore();
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
 */
function validUserEmail(userEmail, createUser) {
  return new Promise(function (resolve, reject) {
    db.collection("users")
      .doc(userEmail)
      .get()
      .then(async function (doc) {
        if (!doc.exists) {
          await createUser(userEmail);
        }
        resolve();
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
// .then(function (userProfile) {});

// main
/**
 * The main of background script
 * @author Karl Wang
 */
async function main() {
  initializeFirebase();
  userEmail = await getUserEmail();
  await validUserEmail(userEmail, createUser);
  await getUserProfile(userEmail);
  updateTimelineFB();
  //console.log("Userporfile is: ", userProfile);
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
