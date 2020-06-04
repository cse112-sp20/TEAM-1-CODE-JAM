export let set = jest.fn();
export let get = jest.fn();
// input should be document
export let doc = jest.fn(() => {
  return {
    get: get,
    set: set,
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
