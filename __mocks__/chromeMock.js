// Define a tabs array
var openTabs = [];

// Push a new tab
const pushTabs = (data) => {
  openTabs.push(data);
};

// Define identity
export let sendMessage = jest.fn();

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

let runtime = {
  sendMessage,
};

export let set = jest.fn();
export let get = jest.fn();
let local = {
  set: set,
  get: get,
};

let storage = {
  local: local,
};

export const chrome = {
  identity,
  runtime,
  storage,
  tabs,
};
