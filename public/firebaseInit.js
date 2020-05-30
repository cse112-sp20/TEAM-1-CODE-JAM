/*global firebase*/
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
}
initializeFirebase();
try {
  module.exports = {
    initializeFirebase,
  };
} catch {}
