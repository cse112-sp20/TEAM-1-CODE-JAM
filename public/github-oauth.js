/* global chrome */

let signin_button;
let revoke_button;
let user_info_div;

let tokenFetcher = (function () {
  // Replace clientId and clientSecret with values obtained by you for your
  // application https://github.com/settings/applications.
  let clientId = "825ffe9603a27981677a";
  // Note that in a real-production app, you may not want to store
  // clientSecret in your App code.
  let clientSecret = "0c4548e8c7cb92a85f868a14431d4f1fd29106ea";
  let redirectUri = chrome.identity.getRedirectURL("provider_cb");
  let redirectRe = new RegExp(redirectUri + "[#?](.*)");

  let access_token = null;
  localStorage.removeItem("token");

  return {
    getToken: function (interactive, callback) {
      // In case we already have an access_token cached, simply return it.
      if (access_token) {
        callback(null, access_token);
        return;
      }

      let options = {
        interactive: interactive,
        url:
          "https://github.com/login/oauth/authorize" +
          "?client_id=" +
          clientId +
          "&scope=repo" +
          "&redirect_uri=" +
          encodeURIComponent(redirectUri),
      };

      chrome.identity.launchWebAuthFlow(options, function (redirectUri) {
        if (chrome.runtime.lastError) {
          callback(new Error(chrome.runtime.lastError));
          return;
        }

        // Upon success the response is appended to redirectUri, e.g.
        // https://{app_id}.chromiumapp.org/provider_cb#access_token={value}
        //     &refresh_token={value}
        // or:
        // https://{app_id}.chromiumapp.org/provider_cb#code={value}
        let matches = redirectUri.match(redirectRe);
        if (matches && matches.length > 1)
          handleProviderResponse(parseRedirectFragment(matches[1]));
        else callback(new Error("Invalid redirect URI"));
      });

      function parseRedirectFragment(fragment) {
        let pairs = fragment.split(/&/);
        let values = {};

        pairs.forEach(function (pair) {
          let nameval = pair.split(/=/);
          values[nameval[0]] = nameval[1];
        });

        return values;
      }

      function handleProviderResponse(values) {
        if (values.hasOwnProperty("access_token"))
          setAccessToken(values.access_token);
        // If response does not have an access_token, it might have the code,
        // which can be used in exchange for token.
        else if (values.hasOwnProperty("code"))
          exchangeCodeForToken(values.code);
        else callback(new Error("Neither access_token nor code avialable."));
      }

      function exchangeCodeForToken(code) {
        let xhr = new XMLHttpRequest();
        xhr.open(
          "GET",
          "https://github.com/login/oauth/access_token?" +
            "client_id=" +
            clientId +
            "&client_secret=" +
            clientSecret +
            "&redirect_uri=" +
            redirectUri +
            "&code=" +
            code
        );
        xhr.setRequestHeader(
          "Content-Type",
          "application/x-www-form-urlencoded"
        );
        xhr.setRequestHeader("Accept", "application/json");
        xhr.onload = function () {
          // When exchanging code for token, the response comes as json, which
          // can be easily parsed to an object.
          if (this.status === 200) {
            let response = JSON.parse(this.responseText);

            if (response.hasOwnProperty("access_token")) {
              setAccessToken(response.access_token);
              // let item = { "token" : response.access_token };
              localStorage.setItem("token", response.access_token);

              // signin_button.disabled = true;
            } else {
              callback(new Error("Cannot obtain access_token from code."));
            }
          } else {
            console.log("code exchange status:", this.status);
            callback(new Error("Code exchange failed"));
          }
        };
        xhr.send();
      }

      function setAccessToken(token) {
        access_token = token;
        callback(null, access_token);
      }
    },
    removeCachedToken: function (token_to_remove) {
      if (access_token == token_to_remove) access_token = null;
    },
  };
})();

function xhrWithAuth(method, url, interactive, callback) {
  let retry = true;
  let access_token;

  getToken();

  function getToken() {
    tokenFetcher.getToken(interactive, function (error, token) {
      if (error) {
        callback(error);
        return;
      }

      access_token = token;
    });
  }
}

export function getUserInfo(interactive) {
  xhrWithAuth(
    "GET",
    "https://api.github.com/user",
    interactive,
    onUserInfoFetched
  );
}

// Functions updating the User Interface:
function showButton(button) {
  if (button != null) {
    button.style.display = "inline";
    button.disabled = false;
  }
}

function hideButton(button) {
  if (button != null) {
    button.style.display = "none";
  }
}

function disableButton(button) {
  if (button != null) {
    button.disabled = true;
  }
}

function onUserInfoFetched(error, status, response) {
  if (!error && status == 200) {
    console.log("Got the following user info: " + response);
    let user_info = JSON.parse(response);
    populateUserInfo(user_info);
    showButton(revoke_button);
    fetchUserRepos(user_info["repos_url"]);
  } else {
    console.log("infoFetch failed", error, status);
    showButton(signin_button);
  }
}

function populateUserInfo(user_info) {
  let elem = user_info_div;
  let nameElem = document.createElement("div");
  nameElem.innerHTML =
    "<b>Hello " +
    user_info.name +
    "</b><br>" +
    "Your github page is: " +
    user_info.html_url;
  elem.appendChild(nameElem);
}

function fetchUserRepos(repoUrl) {
  xhrWithAuth("GET", repoUrl, false, onUserReposFetched);
}

function onUserReposFetched(error, status, response) {
  let elem = document.querySelector("#user_repos");
  elem.value = "";
  if (!error && status == 200) {
    console.log("Got the following user repos:", response);
    let user_repos = JSON.parse(response);
    user_repos.forEach(function (repo) {
      if (repo.private) {
        elem.value += "[private repo]";
      } else {
        elem.value += repo.name;
      }
      elem.value += "\n";
    });
  } else {
    console.log("infoFetch failed", error, status);
  }
}

// Handlers for the buttons's onclick events.
function interactiveSignIn() {
  tokenFetcher.getToken(true, function (error, access_token) {
    if (error) {
      document.querySelector("#signin").innerHTML = "SIGN IN";
      showButton(signin_button);
    } else {
      document.querySelector("#signin").innerHTML = "&#10004";
      disableButton(signin_button);
      //   getUserInfo(true);
    }
  });
}

function revokeToken() {
  // We are opening the web page that allows user to revoke their token.
  window.open("https://github.com/settings/applications");
  // And then clear the user interface, showing the Sign in button only.
  // If the user revokes the app authorization, they will be prompted to log
  // in again. If the user dismissed the page they were presented with,
  // Sign in button will simply sign them in.
  // user_info_div.textContent = '';
  hideButton(revoke_button);
  document.querySelector("#signin").innerHTML = "SIGN IN";
  showButton(signin_button);
  if (signin_button != null) {
    signin_button.onclick = interactiveSignIn;
  }
}

signin_button = document.querySelector("#signin");
if (signin_button != null) {
  signin_button.onclick = interactiveSignIn;
}
revoke_button = document.querySelector("#revoke");
if (revoke_button != null) {
  revoke_button.onclick = revokeToken;
}

// user_info_div = document.querySelector('#user_info');

if (signin_button != null) {
  showButton(signin_button);
}

getUserInfo(false);
