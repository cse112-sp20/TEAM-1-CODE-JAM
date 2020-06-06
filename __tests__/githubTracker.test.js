import {
  getRepos,
  getCommits,
  getMostRecentCommit,
} from "../public/githubTracker.js";

describe("getRepos", () => {
  test("get user repos", async () => {
    let response = {
      headers: { Authorization: "Token 123456789" },
      method: "GET",
    };

    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => [{ displayName: "test", repoName: "test/testapi" }],
      })
    );

    const json = await getRepos(
      "https://api.testfunction.com/user/repos",
      "123456789"
    );

    expect(global.fetch).toHaveBeenLastCalledWith(
      "https://api.testfunction.com/user/repos",
      response
    );
    expect(Array.isArray(json)).toEqual(true);
    expect(json.length).toEqual(1);
    expect(json).toEqual([{ displayName: "test", repoName: "test/testapi" }]);
  });
});

describe("getCommits", () => {
  test("get user repo commit", async () => {
    let response = {
      headers: {
        Accept: "application/vnd.github.cloak-preview",
        Authorization: "Token 123456789",
      },
      method: "GET",
    };

    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => [
          {
            displayName: "test",
            repoName: "test/testapi",
            commitMessage: "test commit",
            commitDate: "00:00:00",
          },
        ],
      })
    );

    const json = await getCommits(
      "https://api.testfunction.com/user/repos/",
      "test/testapi",
      "123456789"
    );

    expect(global.fetch).toHaveBeenLastCalledWith(
      "https://api.testfunction.com/user/repos/test/testapi/commits",
      response
    );
    expect(Array.isArray(json)).toEqual(true);
    expect(json.length).toEqual(1);
    expect(json).toEqual([
      {
        displayName: "test",
        repoName: "test/testapi",
        commitMessage: "test commit",
        commitDate: "00:00:00",
      },
    ]);
  });
});

describe("getMostRecentCommit", () => {
  test("get most recent commit", async () => {
    let response = {
      headers: {
        Accept: "application/vnd.github.cloak-preview",
        Authorization: "Token 123456789",
      },
      method: "GET",
    };

    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => [],
    ));

    const json = await getMostRecentCommit;

})
