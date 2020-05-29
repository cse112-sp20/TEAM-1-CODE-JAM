/* global chrome */
export function getCurrentUrl() {
  return new Promise((resolve) => {
    chrome.tabs.query(
      {
        active: true,
        lastFocusedWindow: true,
      },
      function (tabs) {
        let tab = tabs[0];
        if (tab !== undefined) {
          let currHost = getHostname(tab.url);
          resolve(getNameOfURL(currHost));
        } else {
          resolve(undefined);
        }
      }
    );
  });
}

/**
 *  Gets the host name of a URL
 *
 * @param {string} url URL of a tab
 * @returns {URL} Host name of the tab
 *
 */
export function getHostname(url) {
  // Handle Chrome URLs
  if (/^chrome:\/\//.test(url)) {
    return "invalid";
  }
  // Handle Files opened in chrome browser
  if (/file:\/\//.test(url)) {
    return "invalid";
  }
  try {
    let newUrl = new URL(url);
    return newUrl.hostname;
  } catch (err) {
    console.log(err);
    return "invalid";
  }
}

/**
 * Grab the host name without prefix and suffix protocol
 * @author Karl Wang
 * @param {string} currHost the url of the host file
 * @returns {string} the host name without www and com
 */
export function getNameOfURL(currHost) {
  if (currHost == "invalid") return currHost;
  let splitArr = currHost.split(".");
  if (splitArr.length <= 2) return splitArr[0];
  else return splitArr[1];
}