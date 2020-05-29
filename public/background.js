// main
import { initializeFirebase } from "./firebaseInit.js";
import {
  getUserEmail,
  setUserEmail,
  validUserEmail,
  createUser,
  getUserProfile,
  getTeamOnSnapshot,
  checkOff,
  updateDBParams,
  checkDate,
  setupListener,
} from "./userAndTeams.js";

/**
 * The main of background script
 * @author Karl Wang
 */
async function main() {
  initializeFirebase();
  let userEmail = await getUserEmail();
  // for puppetter usage only!
  if (userEmail === "") userEmail = "agent@gmail.com";
  setUserEmail(userEmail);
  await validUserEmail(userEmail, createUser);
  await Promise.all([getUserProfile(userEmail), getTeamOnSnapshot()]);
  checkOff(updateDBParams);
  //Todo: Change later
  checkDate();
  //deleteEverythingAboutAUser(userEmail);
  setupListener();
}
main();
