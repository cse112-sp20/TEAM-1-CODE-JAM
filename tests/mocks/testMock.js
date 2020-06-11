export let store = {};
export let getItem = jest.fn((key) => {
  return store[key] || undefined;
});
export let setItem = jest.fn((key, value) => {
  store[key] = value.toString();
});
export let clear = jest.fn(() => {
  store = {};
});
export let localStorageMock = {
  getItem: getItem,
  setItem: setItem,
  clear: clear,
};

Object.defineProperty(window, "localStorage", { value: localStorageMock });
