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
  setTeamCode,
  getDate,
  getTeamCode,
} from "./userAndTeams.js";

const ONE_MIN = 60000;
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
  let currTeamCode = await getTeamCode();
  await setTeamCode(currTeamCode);
  await Promise.all([getUserProfile(userEmail), getTeamOnSnapshot()]);
  checkOff(updateDBParams);
  checkDate();
  // check every one min
  setInterval(() => checkDate(), ONE_MIN);
  //deleteEverythingAboutAUser(userEmail);
  setupListener();
}
main();
