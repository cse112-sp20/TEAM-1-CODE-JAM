let exists = true;
export let get = jest.fn(() => {
  return Promise.resolve({
    exists: exists,
    id: "test@gmail.com",
    data: jest.fn(() => {
      return "correct";
    }),
  });
});
// input should be document
export let doc = jest.fn(() => {
  return {
    get: get,
  };
});
// input should be collection string
export let collection = jest.fn(() => {
  return {
    doc: doc,
  };
});
export let db = {
  collection: collection,
};

export function setExists(bool) {
  exists = bool;
}
