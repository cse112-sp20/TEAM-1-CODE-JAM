import {
  onUserGithubTokenFetched,
  showButton,
  disableButton,
} from "../public/github-oauth.js";

describe("onUserGithubTokenFetched", () => {
  test("callback function", async () => {
    console.log = jest.fn();
    onUserGithubTokenFetched("error");

    expect(console.log).toHaveBeenCalledWith(
      "Fetch GitHub Token failed",
      "error"
    );
  });
});

describe("showButton", () => {
  test("show button", async () => {
    let button = showButton(null);
    expect(button).toEqual(undefined);
  });
});

describe("disableButton", () => {
  test("disable button", async () => {
    let button = disableButton(null);
    expect(button).toEqual(undefined);
  });
});
