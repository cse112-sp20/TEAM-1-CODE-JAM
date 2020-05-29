/* eslint-disable import/first */
import { chrome } from "./chromeMock.js";
global.chrome = chrome;
import _ from "../public/userAndTeams.js";
import { setDB } from "../public/firebaseInit.js";
import { db, setExists } from "./databaseMock.js";
jest.setTimeout(10000);

let userEmail = "test@gmail.com";
let dummyEmail = "test2@gmail.com";
// mock database
setDB(db);
describe("getUserInformation", () => {
  test("get user info", async () => {
    let doc = await _.getUserInformation(userEmail);
    expect(doc.id).toBe(userEmail);
    expect(db.collection).toHaveBeenCalled();
    expect(db.collection).toHaveBeenCalledWith("users");
    expect(db.collection("users").doc).toHaveBeenCalled();
    expect(db.collection("users").doc).toHaveBeenCalledWith(userEmail);
    expect(db.collection("users").doc(userEmail).get).toHaveBeenCalled();
  });
});

describe("getTeamInformation", () => {
  test("get team info", async () => {
    let doc = await _.getTeamInformation("12345");
    expect(db.collection).toHaveBeenCalled();
    expect(db.collection).toHaveBeenCalledWith("teams");
    expect(db.collection("teams").doc).toHaveBeenCalled();
    expect(db.collection("teams").doc).toHaveBeenCalledWith("12345");
    expect(db.collection("teams").doc("12345").get).toHaveBeenCalled();
  });
});

describe("randomTeamCode", () => {
  const regex = /^[A-Z0-9]+$/i;
  test("length 5", () => {
    const randomCode = _.randomTeamCode(5);
    expect(randomCode.length).toBe(5);
    expect(regex.test(randomCode)).toBe(true);
  });
  test("length 10", () => {
    const randomCode = _.randomTeamCode(10);
    expect(randomCode.length).toBe(10);
    expect(regex.test(randomCode)).toBe(true);
  });
});

describe("isTeamCodeUnique", () => {
  test("not unique teamcode", async () => {
    setExists(true);
    const result = await _.isTeamCodeUnique("12345");
    expect(result).toBe(false);
    expect(db.collection).toHaveBeenCalled();
    expect(db.collection).toHaveBeenCalledWith("teams");
    expect(db.collection("teams").doc).toHaveBeenCalled();
    expect(db.collection("teams").doc).toHaveBeenCalledWith("12345");
    expect(db.collection("teams").doc("12345").get).toHaveBeenCalled();
  });
  test("unique teamcode", async () => {
    setExists(false);
    const result = await _.isTeamCodeUnique("123456");
    expect(result).toBe(true);
    expect(db.collection).toHaveBeenCalled();
    expect(db.collection).toHaveBeenCalledWith("teams");
    expect(db.collection("teams").doc).toHaveBeenCalled();
    expect(db.collection("teams").doc).toHaveBeenCalledWith("123456");
    expect(db.collection("teams").doc("123456").get).toHaveBeenCalled();
  });
});
describe("generateRandomTeamCode", () => {
  test("generate random team code", async () => {
    setExists(false);
    const result = await _.generateRandomTeamCode(5);
    const regex = /^[A-Z0-9]+$/i;
    expect(result.length).toBe(5);
    expect(regex.test(result)).toBe(true);
  });
});

describe("getUserEmail", () => {
  test("get user email", async () => {
    const result = await _.getUserEmail();
    expect(result).toBe(userEmail);
  });
});

describe("getTeamNames", () => {
  test("get team names", async () => {
    let userProfile = {
      joined_teams: {
        11111: "1",
        22222: "2",
        33333: "3",
      },
    };
    _.getTeamName = jest.fn();
    for (let key in userProfile.joined_teams) {
      let count = key[0];
      _.getTeamName.mockReturnValueOnce(
        Promise.resolve({
          teamCode: key,
          teamName: "team" + count,
          joinedTime: userProfile.joined_teams[key],
        })
      );
    }
    const result = await _.getTeamNames(userProfile);
    expect(_.getTeamName).toHaveBeenCalledTimes(3);
    expect(result).toEqual([
      { teamCode: "11111", teamName: "team1", joinedTime: "1" },
      { teamCode: "22222", teamName: "team2", joinedTime: "2" },
      { teamCode: "33333", teamName: "team3", joinedTime: "3" },
    ]);
  });
});

// describe("joinTeamOnFirebase", () => {
//   let userProfile;
//   beforeEach(() => {
//     userProfile = {
//       joined_teams: {
//         12345: "yesterday",
//       },
//     };
//   });
//   test("already existed team code", async () => {
//     const result = await joinTeamOnFirebase("12345", userProfile, userEmail);
//     expect(result).toBe("already joined the group");
//   });
//   test("team code does not exist", async () => {
//     const result = await joinTeamOnFirebase("123456", userProfile, userEmail);
//     expect(result).toBe("team code not found");
//   });
//   test("join team success", async () => {
//     let teamCode = await createTeamOnFirebase("jest testing", dummyEmail);
//     const result = await joinTeamOnFirebase(teamCode, userProfile, userEmail);
//     expect(result).toBe("success");
//     let data = await Promise.all([
//       getTeamInformation(teamCode),
//       getUserInformation(userEmail),
//     ]);
//     let teamInformation = data[0].data();
//     let userInformation = data[1].data();
//     expect(teamCode in userInformation.joined_teams).toBe(true);
//     expect(teamInformation.members.includes(userEmail)).toBe(true);
//   });
// });
// describe("getTeamName", () => {
//   test("get valid team name", async () => {
//     let userProfile = {
//       joined_teams: {
//         12345: "yesterday",
//       },
//     };
//     const result = await getTeamName("12345", userProfile);
//     expect(result).toEqual({
//       teamCode: "12345",
//       teamName: "testing",
//       joinedTime: "yesterday",
//     });
//   });
// });

// describe("validUserEmail", () => {
//   const createUserMock = jest.fn(() => Promise.resolve());
//   afterEach(() => {
//     jest.clearAllMocks();
//   });
//   test("user does not exist", async () => {
//     let fakeEmail = "doesn't exist";
//     await validUserEmail(fakeEmail, createUserMock);
//     expect(createUserMock).toHaveBeenCalled();
//     expect(createUserMock).toHaveBeenCalledWith(fakeEmail);
//   });
//   test("user does exist", async () => {
//     await validUserEmail(userEmail, createUserMock);
//     expect(createUserMock).not.toHaveBeenCalled();
//     expect(createUserMock).not.toHaveBeenCalledWith(userEmail);
//   });
// });

// describe("createTeamOnFirebase", () => {
//   test("create a new team on firebase", async () => {
//     let teamCode = await createTeamOnFirebase("jest testing", userEmail);
//     let result = await Promise.all([
//       getTeamInformation(teamCode),
//       getUserInformation(userEmail),
//     ]);
//     let teamInformation = result[0].data();
//     let userInformation = result[1].data();
//     expect(teamInformation.teamName).toBe("jest testing");
//     expect(teamInformation.members.includes(userEmail)).toBe(true);
//     expect(teamInformation.creator).toBe(userEmail);
//     expect(teamCode in userInformation.joined_teams).toBe(true);
//   });
// });

// describe("deleteTeamFromUser", () => {
//   test("create a team then delete from user", async () => {
//     let userProfile = {
//       joined_teams: {
//         12345: "yesterday",
//       },
//     };
//     let teamCode = await createTeamOnFirebase("jest testing", dummyEmail);
//     await joinTeamOnFirebase(teamCode, userProfile, userEmail);
//     await deleteTeamFromUser(userEmail, teamCode);
//     let result = await Promise.all([
//       getTeamInformation(teamCode),
//       getUserInformation(userEmail),
//     ]);
//     let teamInformation = result[0].data();
//     let userInformation = result[1].data();
//     expect(teamInformation.members.includes(userEmail)).toBe(false);
//     expect(teamCode in userInformation.joined_teams).toBe(false);
//   });
// });

// afterAll(async () => {
//   await deleteEverythingAboutAUser(dummyEmail);
//   await deleteEverythingAboutAUser(userEmail);
//   global.firebase.app().delete();
// });
