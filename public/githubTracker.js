/* global firebase */
import { db } from "./firebaseInit.js";
import { getUserGithubToken } from "./github-oauth.js";
import { userEmail } from "./userAndTeams.js";
/**
 *  Fetches data from github using the Github REST API. Header
 * includes the token which was saved after user sign-in with Github.
 *  It gets all the user repositories.
 * @author Gen Barcenas
 * @param {string} url
 */
async function getRepos(url, token) {
  // Url of the user
  let headers = {
    Authorization: `Token ${token}`,
  };
  // fetch takes 2 parameter
  let response = await fetch(url, {
    method: "GET",
    headers: headers,
  });
  return await response.json();
}

/**
 * Fetches data from github using the Github REST API. Header
 * includes the token which was saved after user sign-in with Github.
 * Function gets all the commits in the master branch from a secified
 * repository
 * @author Gen Barcenas
 * @param {string} url
 * @param {string} repo
 */
async function getCommits(url, repo, token) {
  let headers = {
    Accept: "application/vnd.github.cloak-preview",
    Authorization: `Token ${token}`,
  };

  let commit_url = `${url}${repo}/commits`;

  // fetch takes 2 parameter
  let response = await fetch(commit_url, {
    method: "GET",
    headers: headers,
  });
  return await response.json();
}

/**
 * Fetches data from github using the Github REST API.
 * Iterates through the user's repositories and gets all
 * the commits from those repositories. For each collection
 * of commits, the function only wants commits from the current day.
 * @author Gen Barcenas
 */
async function getMostRecentCommit() {
  let arr = [];

  getUserGithubToken(false);
  let github_token = localStorage.getItem("token");

  if (github_token) {
    console.log("Token successfully fetched");
    console.log(github_token);
    localStorage.removeItem("token");

    let repo_url = `https://api.github.com/user/repos`;
    let commit_url = `https://api.github.com/repos/`;
    let curr_date = new Date();
    let curr_day = curr_date.getDate();
    let curr_year = curr_date.getFullYear();
    let curr_month = curr_date.getMonth() + 1;

    // Adds a zero to the front of the day and month
    // if it less than 2 digits
    let str_curr_day = `${curr_day}`;
    let str_curr_month = `${curr_month}`;
    if (curr_day < 10) {
      str_curr_day = `0${curr_day}`;
    }
    if (curr_month < 10) {
      str_curr_month = `0${curr_month}`;
    }

    let repos = await getRepos(repo_url, github_token);
    await Promise.all(
      repos.map(async (e) => {
        let commits = await getCommits(commit_url, e.full_name, github_token);
        if (commits.length > 0) {
          commits.forEach((e) => {
            let utc_date = e.commit.author.date;
            let client_date = new Date(utc_date);
            let client_date_day = client_date.getDate();
            let client_date_month = client_date.getMonth() + 1;
            let client_date_year = client_date.getFullYear();

            // Adds a zero to the front of the day and month
            // if it less than 2 digits
            let str_date_day = `${client_date_day}`;
            let str_date_month = `${client_date_month}`;
            if (client_date_day < 10) {
              str_date_day = `0${client_date_day}`;
            }
            if (client_date_month < 10) {
              str_date_month = `0${client_date_month}`;
            }

            let date = `${client_date_year}-${str_date_month}-${str_date_day}`;

            // Adds a zero to the front of the hours, minutes, and seconds
            // if it less than 2 digits
            if (date == `${curr_year}-${str_curr_month}-${str_curr_day}`) {
              console.log(date);
              let str_date_hour = `${client_date.getHours()}`;
              let str_date_min = `${client_date.getMinutes()}`;
              let str_date_sec = `${client_date.getSeconds()}`;

              if (client_date.getHours() < 10) {
                str_date_hour = `0${client_date.getHours()}`;
              }
              if (client_date.getMinutes() < 10) {
                str_date_min = `0${client_date.getMinutes()}`;
              }
              if (client_date.getSeconds() < 10) {
                str_date_sec = `0${client_date.getSeconds()}`;
              }

              let time = `${str_date_hour}:${str_date_min}:${str_date_sec}`;
              arr.push(time);
            }
          });
        }
      })
    );
  } else {
    console.log("Not authenticated by GitHub...");
  }
  return arr;
}

/**
 * Sends the most recent commit to the database.
 * @author Gen Barcenas
 * @param {string} teamCode
 * @param {string} animal
 */
export function sendToDB(teamCode, animal) {
  if (teamCode === undefined || animal === undefined) {
    return;
  }
  console.log("update");
  getMostRecentCommit()
    .then((arr) => {
      let max = "00:00:00";
      arr.forEach((e) => {
        if (e > max) {
          max = e;
        }
      });

      if (max != "00:00:00") {
        if (localStorage.getItem("oldElements") == null) {
          let item = [{ url: "github.com", time: max }];
          localStorage.setItem("oldElements", JSON.stringify(item));

          let seconds = new Date().toLocaleTimeString();
          console.log("in update local storage");
          let userAnimal = animal;
          db.collection("teams")
            .doc(teamCode)
            .update({
              timeWasted: firebase.firestore.FieldValue.arrayUnion({
                point: "+1",
                user: userEmail,
                url: "Git Push",
                time: seconds,
                animal: userAnimal,
              }),
            });
        } else {
          let item = { url: "github.com", time: max };
          let oldElements = JSON.parse(localStorage.getItem("oldElements"));

          // Checks if an item exists in the local storage
          let itemExists = false;
          oldElements.forEach((e) => {
            if (e.time == max) {
              itemExists = true;
            }
          });
          console.log(itemExists);

          if (itemExists) {
          } else {
            console.log("Item is not in Local Storage...");
            oldElements.push(item);
            localStorage.setItem("oldElements", JSON.stringify(oldElements));
            console.log("here");
            let seconds = new Date().toLocaleTimeString();
            console.log("in update local storage");
            let userAnimal = animal;
            db.collection("teams")
              .doc(teamCode)
              .update({
                timeWasted: firebase.firestore.FieldValue.arrayUnion({
                  user: userEmail,
                  url: "Git Push",
                  time: seconds,
                  animal: userAnimal,
                }),
              });
          }
        }
      }
    })
    .catch((err) => console.log(err));
}

/*
export function sendToDB(teamCode, animal) {
  // if (teamCode === undefined || animal === undefined) {
  //   return;
  // }
  console.log("update");
  getMostRecentCommit()
    .then((arr) => {
      let max = "00:00:00";
      arr.forEach((e) => {
        if (e > max) {
          max = e;
        }
      });

      console.log("test");
      if (max != "00:00:00") {
        if (localStorage.getItem("oldElements") == null) {
          let item = [{ url: "github.com", time: max }];
          localStorage.setItem("oldElements", JSON.stringify(item));

          // chrome.runtime.sendMessage(msg, function (response) {
          //     resolve(response);
          // });
          // let seconds = JSON.parse(currData)[tabUrl] / 1000;
          let seconds = new Date().toLocaleTimeString();
          //let seconds =
          // parseInt(JSON.parse(localStorage.getItem(teamCode)).time) / 1000;
          //time = `${tabUrl}: ${seconds} seconds`;
          console.log("in update local storage");
          // let userAnimal = await getUserAnimal(userEmail, teamCode);
          let userAnimal = animal;
          db.collection("teams")
            .doc(teamCode)
            .update({
              timeWasted: firebase.firestore.FieldValue.arrayUnion({
                point: "+1",
                user: userEmail,
                url: "www.GitHub.com",
                time: seconds,
                animal: userAnimal,
              }),
            });
        } else {
          let item = { url: "github.com", time: max };
          let oldElements = JSON.parse(localStorage.getItem("oldElements"));

          // Checks if an item exists in the local storage
          let itemExists = false;
          oldElements.forEach((e) => {
            if (e.time == max) {
              itemExists = true;
            }
          });
          console.log(itemExists);

          if (itemExists) {
          } else {
            console.log("Item is not in Local Storage...");
            oldElements.push(item);
            localStorage.setItem("oldElements", JSON.stringify(oldElements));
            console.log("here");
            // let seconds = JSON.parse(currData)[tabUrl] / 1000;
            let seconds = new Date().toLocaleTimeString();
            //let seconds =
            // parseInt(JSON.parse(localStorage.getItem(teamCode)).time) / 1000;
            //time = `${tabUrl}: ${seconds} seconds`;
            console.log("in update local storage");
            // let userAnimal = await getUserAnimal(userEmail, teamCode);
            let userAnimal = animal;
            db.collection("teams")
              .doc(teamCode)
              .update({
                timeWasted: firebase.firestore.FieldValue.arrayUnion({
                  user: userEmail,
                  url: "Git Push",
                  time: seconds,
                  animal: userAnimal,
                }),
              });
          }
        }
      }
    })
    .catch((err) => console.log(err));
}
*/
