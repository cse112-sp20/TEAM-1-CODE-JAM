/* global chrome */

import { sendToDB } from "./githubTracker.js";

/**
 * For the original code please visit:
 * www.github.com/GoogleChrome/chrome-app-samples/tree/master/samples/github-auth
 *
 * Modified by: Gen Barcenas
 *
 * GitHub Authentication for Chrome extension using GitHub OAuth.
 * Provided with several functions thats fetches User's Github token.
 *
 * Information that the coder has to provide in order to be able to use GitHub OAuth
 * are clientId and clientSecret. In addition, coder has to make an addition after line
 * 46, in order to specify the scope of the GitHub OAuth. For example, the scope for this
 * project is access to user repo, therefore, &scope=repo is added on line 47. The coder
 * can begin using GitHub authentication by assigning a button with an id name stated at
 * the bottom of the file.
 *
 */

let signin_button;
let revoke_button;

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

/**
 * Makes the GitHub api call to the server to gain access
 * to the user's token.
 * @param {string} method
 * @param {string} url
 * @param {boolean} interactive
 * @param {function pointer} callback
 */
function xhrWithAuth(method, url, interactive, callback) {
  getToken();
  function getToken() {
    tokenFetcher.getToken(interactive, function (error, token) {
      if (error) {
        callback(error);
        return;
      }
      // access_token = token;
      localStorage.setItem("token", token);
      callback(error);
    });
  }
}

/**
 * Fetches User's GitHub Token.
 * If interactive then show pop up for user permission
 * to access their GitHub data.
 * If not interactive then directly fetches token.
 * @param {boolean} interactive
 */
export function getUserGithubToken(interactive) {
  console.log("Fetching User GitHub Token...");
  xhrWithAuth(
    "GET",
    "https://api.github.com/user",
    interactive,
    onUserGithubTokenFetched
  );
}

/**
 * Used as a callback function and notifies user if the
 * fetching of the token was successful or a failure
 * @author Gen Barcenas
 * @param {object} error
 */
function onUserGithubTokenFetched(error) {
  if (error) {
    console.log("Fetch GitHub Token failed", error, status);
  } else {
    console.log("Success!");
  }
}

/**
 * Functions updating the User Interface:
 * Shows button that was passed in as parameter
 * @param {HTMLElement object} button
 */
function showButton(button) {
  button.style.display = "inline";
  button.disabled = false;
}

/**
 * Functions updating the User Interface:
 * Hides button that was passed in as parameter
 * @param {HTMLElement object} button
 */
function hideButton(button) {
  button.style.display = "none";
}

/**
 * Functions updating the User Interface:
 * Disables button that was passed in as parameter
 * @param {HTMLElement object} button
 */
function disableButton(button) {
  button.disabled = true;
}

/**
 * Handlers for the buttons's onclick events. Fetches GitHub token from
 * user's account. If access has not been permitted by user then  a pop
 * will appear and ask the user for permission to access their data in
 * their GitHub.
 */
function interactiveSignIn() {
  tokenFetcher.getToken(true, function (error, access_token) {
    if (error) {
      showButton(signin_button);
    } else {
      console.log("User is already authenticated by GitHub...");
      disableButton(signin_button);
    }
  });
}

/**
 * Redirects the user to the https://github.com/settings/applications
 * which will allow the user to manually revoke their token for their
 * GitHub. As a result, it will deny access to the user's repositories.
 */
function revokeToken() {
  // We are opening the web page that allows user to revoke their token.
  // window.open("https://github.com/settings/applications");
  window.location.href = "https://github.com/settings/applications";

  // And then clear the user interface, showing the Sign in button only.
  // If the user revokes the app authorization, they will be prompted to log
  // in again. If the user dismissed the page they were presented with,
  // Sign in button will simply sign them in.
  disableButton(revoke_button);
  showButton(signin_button);
}

signin_button = document.querySelector("#signin");
revoke_button = document.querySelector("#revoke");

/**
 * JS files is called in other places so buttons might equal null.
 * Checks if the buttons exists.
 */
if (signin_button || revoke_button) {
  signin_button.onclick = interactiveSignIn;
  // revoke_button.onclick = revokeToken;
  revoke_button.onclick = revokeToken;
}
