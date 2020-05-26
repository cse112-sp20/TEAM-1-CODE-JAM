var flip = false;
var animal = 0;

/*
 *  Asynchronous function that fetches data from github using
 *  the Github REST API. Header includes the token which was
 *  saved after user sign-in with Github. It gets all the user
 *  repositories.
 * 
 * Parameters: url - the user's repositories
 
 */
async function getRepos(url){
    let token = localStorage.getItem("token");

    // Url of the user
    const headers = {
        "Authorization" : `Token ${token}`
    }
    // fetch takes 2 parameter
    const response = await fetch(url, {
        "method" : "GET",
        "headers" : headers
    })
    return await response.json()
    
}

/*
 * Asynchronous function that fetches data from github using
 * the Github REST API. Header includes the token which was
 * saved after user sign-in with Github. Function gets all
 * the commits in the master branch from a secified repository
 * 
 * Parameter: url - the url for the repositories from the Github API
 *            repo - specified repository to extract all of it's commits
 
 */
async function getCommits(url, repo){
    let token = localStorage.getItem("token");
   
    const headers = {
        "Accept" : "application/vnd.github.cloak-preview",
        "Authorization" : `Token ${token}`
    }

    const commit_url = `${url}${repo}/commits`;

    // fetch takes 2 parameter
    const response = await fetch(commit_url, {
        "method" : "GET",
        "headers" : headers
    })
    return result = await response.json()
}

/*
 *  Asynchronous function that fetches data from github using
 *  the Github REST API. Iterates through the user's repositories
 *  and gets all the commits from those repositories. For each 
 *  collection of commits, the function only wants commits from 
 *  the current day.
 * 
 *  Param: N/A
 */
async function getMostRecentCommit() {

    const arr = [];
    const repo_url = `https://api.github.com/user/repos`;
    const commit_url = `https://api.github.com/repos/`;
    const curr_date = new Date();
    const curr_day = curr_date.getDate();
    const curr_year = curr_date.getFullYear();
    const curr_month = curr_date.getMonth() + 1;

    // Adds a zero to the front of the day and month
    // if it less than 2 digits
    let str_curr_day = `${curr_day}`;
    let str_curr_month = `${curr_month}`;
    if(curr_day < 10){
        str_curr_day = `0${curr_day}`;
    }
    if(curr_month < 10){
        str_curr_month = `0${curr_month}`;
    }

    const repos = await getRepos(repo_url);
    await Promise.all(repos.map(async e => {
        const commits = await getCommits(commit_url, e.full_name);
        if(commits.length > 0){
            commits.forEach(e => {

                let utc_date = e.commit.author.date;
                let client_date = new Date(utc_date);
                let client_date_day = client_date.getDate();
                let client_date_month = client_date.getMonth() + 1;
                let client_date_year = client_date.getFullYear();

                // Adds a zero to the front of the day and month
                // if it less than 2 digits
                let str_date_day = `${client_date_day}`;
                let str_date_month = `${client_date_month}`;
                if(client_date_day < 10){
                    str_date_day = `0${client_date_day}`;
                }
                if(client_date_month < 10){
                    str_date_month = `0${client_date_month}`;
                }

                let date = `${client_date_year}-${str_date_month}-${str_date_day}`;

                // Adds a zero to the front of the hours, minutes, and seconds
                // if it less than 2 digits
                if(date == `${curr_year}-${str_curr_month}-${str_curr_day}`){
                    console.log(date);
                    let str_date_hour = `${client_date.getHours()}`;
                    let str_date_min = `${client_date.getMinutes()}`;
                    let str_date_sec = `${client_date.getSeconds()}`;

                    if(client_date.getHours() < 10){
                        str_date_hour = `0${client_date.getHours()}`;
                    }
                    if(client_date.getMinutes() < 10){
                        str_date_min = `0${client_date.getMinutes()}`;
                    }
                    if(client_date.getSeconds() < 10){
                        str_date_sec = `0${client_date.getSeconds()}`;
                    }

                    const time = `${str_date_hour}:${str_date_min}:${str_date_sec}`
                    arr.push(time);
                }
            })
        } 
    }));
    

    return arr;
}

/*
 * Sends the most recent commit to the database.
 *
 * Parameter: N/A
 */
function sendToDB(){

    // Sets the token for the github if authorization has been given
    getUserInfo(false);
    let token = localStorage.getItem("token");
    if(token != null){
        getMostRecentCommit()
        .then(arr => {
            
            let max = "00:00:00";
            // console.log(arr);
            arr.forEach(e => { if(e > max){ max = e; } });

            // console.log(max);

            if(max != "00:00:00"){
                let msg = {
                    for: "popup",
                    message: "timeline",
                    url: "GitHub",
                    time: max,
                    timestamp: max,
                    flip: flip,
                    animal: animal,
                };
                animal = (animal + 1) % 11;
                flip = !flip;

                if(localStorage.getItem("oldElements") == null){
                    console.log("Local Storage is empty...")

                    let item = [{ "url" : "github.com" , "time" : max }];
                    localStorage.setItem("oldElements", JSON.stringify(item));
                    chrome.runtime.sendMessage(msg, function (response) {
                        console.log(response);
                        resolve(response);
                    });
                    
                } else {

                    let item = { "url" : "github.com" , "time" : max };
                    console.log("Local Storage is not empty...")
                    let oldElements = JSON.parse(localStorage.getItem("oldElements"));

                    // Checks if an item exists in the local storage
                    let itemExists = false;
                    oldElements.forEach(e =>{if(e.time == max){itemExists = true;}});
                    console.log(itemExists);

                    if(itemExists) {
                        console.log("Item is in Local Storage...")
                    } else {
                        console.log("Item is not in Local Storage...")
                        oldElements.push(item);
                        localStorage.setItem("oldElements", JSON.stringify(oldElements))
                        chrome.runtime.sendMessage(msg, function (response) {
                            console.log(response);
                            resolve(response);
                        });
                    }
                }
            }
        })
        .catch(err => console.log(err));
    } else {
        console.log("No authorization given by github")
    }
}

let tracker = setInterval(sendToDB, 15000)


