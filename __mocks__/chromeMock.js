// Define a tabs array
var openTabs = [];

// Define teams array
var teams = [];

// Push a new tab
const pushTabs = (data) => {
  openTabs.push(data);
};

// Define identity
let identity = {
  getProfileUserInfo: jest.fn((callback) => {
    callback({ email: "test@gmail.com" });
  }),
  getRedirectURL: jest.fn(),
};

// Define a tab
let tabs = {
  create: pushTabs,
  pages: openTabs,
};

// Define the runtime
let runtime = {
  sendMessage: (msgObj, callback) => {
    const { for: sendTo, message } = msgObj;

    // If get teams, then get a fake team
    if (sendTo === "background" && message === "get teams") {
      teams.push({
        visable: true,
        teamCode: "TEST_TEAM_CODE",
        teamName: "TEST_TEAM",
      });

      // Return teams to runtime
      callback(teams);
    }
    // Otherwise return undefined
    else {
      callback(undefined);
    }
  },
};

// Export chrome
export const chrome = {
  identity: identity,
  tabs: tabs,
  runtime: runtime,
};
