global.firebase = {
  firestore: {
    FieldValue: {
      arrayUnion: jest.fn(),
      arrayRemove: jest.fn(),
      delete: jest.fn(),
    },
  },
};
export let set = jest.fn();
export let get = jest.fn();
export let update = jest.fn();
export let onSnapshot = jest.fn();

// input should be document
export let doc = jest.fn(() => {
  return {
    get: get,
    set: set,
    update: update,
    onSnapshot: onSnapshot,
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
