// Define a tabs array
let openTabs = [];

// Push a new tab
const pushTabs = (data) => {
  openTabs.push(data);
};

export let sendMessage = jest.fn();
export let addListener = jest.fn();
let identity = {
  getProfileUserInfo: jest.fn((callback) => {
    callback({ email: "test@gmail.com" });
  }),
  getRedirectURL: jest.fn(),
};

let onMessage = {
  addListener,
  // addListener: jest.fn(),
};
// Define a tab
let tabs = {
  create: pushTabs,
  pages: openTabs,
};

// setup addListener
export let addListener = jest.fn();

let onMessage = {
  addListener,
};

let runtime = {
  sendMessage,
  onMessage,
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
