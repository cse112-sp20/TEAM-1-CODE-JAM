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
export let doc = jest.fn((document) => {
  return {
    get: get,
  };
});
export let collection = jest.fn((collect) => {
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
