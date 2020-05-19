var lastTab;
let db;
let userEmail;
let userProfile;
let teams;
let counter = 0;
// let tabs_dict = {};
let tabs = [];
let test = "Hey hey hey";
let black_listed = [
  "www.youtube.com",
  "www.facebook.com",
  "twitter.com",
  "myspace.com",
];
//have a current url and only stop timer if u remove or go thru updated
let current_url;

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
    return newUrl.hostname.toString();
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
    tabs = [];
    if (localStorage["oldElements"] != undefined) {
      let oldElements = JSON.parse(
        localStorage.getItem("oldElements")
      ).reverse();

      oldElements.map((obj) => {
        let tab = obj;
        tab.flip = flip;
        tabs.push(tab);
        flip = !flip;
      });
      // tabs = oldElements;
    }
    resolve(tabs);
  });
}

/**
 * setupListener listens for request coming from popup,
 * it then sends the response that the popup need
 * @author : Karl Wang
 */
function setupListener() {
  /**
   * reqeust is the message from popup
   * sendResponse sends a response to the sender(popup)
   * @author : Karl Wang
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
        createTeamOnFirebase(request.teamName).then((response) => {
          sendResponse(response);
        });
      } else if (request.message === "join team") {
        // join the team and update the database
        joinTeamOnFirebase(request.teamCode).then((response) => {
          sendResponse(response);
        });
      } else if (request.message === "get teams") {
        sendResponse(teams);
      } else if (request.message === "get team info") {
        getTeamInformation(request.teamCode).then(function (doc) {
          sendResponse(doc.data());
        });
      } else if (request.message === "get timeline") {
        getAllTabs().then((tabs) => {
          console.log(tabs);
          // console.log(flip);
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
function getTeamInformation(teamCode) {
  return db.collection("teams").doc(teamCode).get();
}
function getTeamNames() {
  let promises = [];
  for (let key in userProfile.joined_teams) {
    promises.push(getTeamName(key));
  }
  Promise.all(promises).then((result) => {
    teams = result;
  });
}
function getTeamName(teamCode) {
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
function joinTeamOnFirebase(teamCode) {
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
        .set(
          {
            members: {
              [userEmail]: userEmail,
            },
          },
          { merge: true }
        ),
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
 * @author : Karl Wang
 * @param {string} teamName The name of the team to be created
 */
async function createTeamOnFirebase(teamName) {
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
            members: {
              [userEmail]: userEmail,
            },
          },
          { merge: true }
        ),
    ]);
    resolve(teamCode);
  });
}
/**
 * This generates a random team code, it makes sure the team code is unique
 * @author : Karl Wang
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
 * @author : Karl Wang
 * @param {int} length Specifies the length of the team code
 * @returns {string} The randomly generated teamcode
 */
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
 * @author : Karl Wang
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
 * @author : Karl Wang
 */
function initializeFirebase() {
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
 * @author : Karl Wang
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
 * @author : Karl Wang
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
 * @author : Karl Wang
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
 * @author : Karl Wang
 * @param {string} userEmail The id of the user
 */
function getUserProfile(userEmail) {
  return new Promise(function (resolve, reject) {
    db.collection("users")
      .doc(userEmail)
      .onSnapshot(function (doc) {
        userProfile = doc.data();
        getTeamNames();
        resolve();
      });
  });
}
// .then(function (userProfile) {});

// main
/**
 * The main of background script
 * @author : Karl Wang
 */
async function main() {
  initializeFirebase();
  userEmail = await getUserEmail();
  await validUserEmail(userEmail, createUser);
  await getUserProfile(userEmail);

  setupListener();
}
main();
