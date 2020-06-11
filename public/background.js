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
  getTeamCode,
  generateRandomTeamCode,
  userProfile,
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
  let currTeamCode = await getTeamCode(userProfile);
  await setTeamCode(currTeamCode);
  await Promise.all([getUserProfile(userEmail), getTeamOnSnapshot()]);
  checkOff(updateDBParams);
  checkDate();
  // check every one min
  setInterval(() => checkDate(), ONE_MIN);
  setupListener();
  let res = await generateRandomTeamCode(5);
  console.log(res);
}

main();
