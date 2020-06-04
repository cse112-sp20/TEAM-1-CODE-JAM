// Define a tabs array
var openTabs = [];

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

    

  }
};

// Export chrome
export const chrome = {
  identity: identity,
  tabs: tabs,
  runtime: 
};
