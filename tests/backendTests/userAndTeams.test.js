import { chrome } from "../mocks/chromeMock.js";
global.chrome = chrome;
import _, { getDate } from "../../public/userAndTeams.js";
import { localStorageMock } from "../mocks/testMock.js";
import { setDB } from "../../public/firebaseInit.js";
import { db, get, set, update } from "../mocks/databaseMock.js";

//localStorageMock.setItem("test", 2);
//console.log(store);

let userEmail = "test@gmail.com";
// let dummyEmail = "test2@gmail.com";
// mock database
setDB(db);
describe("getUserInformation", () => {
  test("get user info", async () => {
    get.mockReturnValueOnce(
      Promise.resolve({
        id: userEmail,
      })
    );
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
    get.mockReturnValueOnce(
      Promise.resolve({
        id: "12345",
        data: jest.fn(() => {
          return true;
        }),
      })
    );
    let doc = await _.getTeamInformation("12345");
    expect(db.collection).toHaveBeenCalled();
    expect(db.collection).toHaveBeenCalledWith("teams");
    expect(db.collection("teams").doc).toHaveBeenCalled();
    expect(db.collection("teams").doc).toHaveBeenCalledWith("12345");
    expect(db.collection("teams").doc("12345").get).toHaveBeenCalled();
    expect(doc.id).toBe("12345");
    expect(doc.data()).toBe(true);
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
    get.mockReturnValueOnce(
      Promise.resolve({
        exists: true,
      })
    );
    const result = await _.isTeamCodeUnique("12345");
    expect(result).toBe(false);
    expect(db.collection).toHaveBeenCalled();
    expect(db.collection).toHaveBeenCalledWith("teams");
    expect(db.collection("teams").doc).toHaveBeenCalled();
    expect(db.collection("teams").doc).toHaveBeenCalledWith("12345");
    expect(db.collection("teams").doc("12345").get).toHaveBeenCalled();
  });
  test("unique teamcode", async () => {
    get.mockReturnValueOnce(
      Promise.resolve({
        exists: false,
      })
    );
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
    get.mockReturnValueOnce(
      Promise.resolve({
        exists: false,
      })
    );
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
    expect(chrome.identity.getProfileUserInfo).toHaveBeenCalled();
  });
});
describe("getTeamNames", () => {
  const getTeamName = _.getTeamName;
  test("get valid team names", async () => {
    // let originalFunc = _.getTeamName.bind({});
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
    expect(_.getTeamName).toHaveBeenCalledWith("11111", userProfile);
    expect(_.getTeamName).toHaveBeenCalledWith("22222", userProfile);
    expect(_.getTeamName).toHaveBeenCalledWith("33333", userProfile);
    expect(result).toEqual([
      { teamCode: "11111", teamName: "team1", joinedTime: "1" },
      { teamCode: "22222", teamName: "team2", joinedTime: "2" },
      { teamCode: "33333", teamName: "team3", joinedTime: "3" },
    ]);
  });
  test("get empty team names", async () => {
    // let originalFunc = _.getTeamName.bind({});
    let userProfile = {};
    _.getTeamName = jest.fn(() => Promise.resolve());
    const result = await _.getTeamNames(userProfile);
    expect(result).toEqual([]);
    // _.getTeamName = originalFunc;
  });
  test("get invalid team names", async () => {
    // let originalFunc = _.getTeamName.bind({});
    let userProfile = {
      joined_teams: {
        11111: "1",
        22222: "2",
        33333: "3",
      },
    };
    _.getTeamName = jest.fn();
    _.getTeamName.mockResolvedValueOnce({
      teamCode: "11111",
      teamName: "jest mock",
      joinedTime: "1",
    });
    _.getTeamName.mockResolvedValueOnce(undefined);
    _.getTeamName.mockResolvedValueOnce(undefined);
    const result = await _.getTeamNames(userProfile);
    expect(result).toEqual([
      { teamCode: "11111", teamName: "jest mock", joinedTime: "1" },
    ]);
  });
  afterAll(() => {
    _.getTeamName = getTeamName;
  });
});
describe("getTeamName", () => {
  test("get valid team name", async () => {
    get.mockResolvedValueOnce({
      exists: true,
      data: () => {
        return {
          teamName: "jest mock",
        };
      },
    });
    let userProfile = {
      joined_teams: {
        12345: "now",
      },
    };
    const res = await _.getTeamName("12345", userProfile);
    expect(res).toEqual({
      teamCode: "12345",
      teamName: "jest mock",
      joinedTime: "now",
    });
  });
  test("get invalid team name", async () => {
    get.mockResolvedValueOnce({
      exists: false,
      data: () => {
        return {
          teamName: "jest mock",
        };
      },
    });
    let userProfile = {
      joined_teams: {
        12345: "now",
      },
    };
    const res = await _.getTeamName("12345", userProfile);
    expect(res).toEqual(undefined);
  });
});
describe("validUserEmail", () => {
  test("test existing user", async () => {
    get.mockReturnValueOnce(
      Promise.resolve({
        exists: true,
      })
    );
    const res = await _.validUserEmail(userEmail);
    expect(res).toBe(true);
    expect(db.collection).toHaveBeenCalled();
    expect(db.collection).toHaveBeenCalledWith("users");
    expect(db.collection("users").doc).toHaveBeenCalledWith(userEmail);
  });
  test("test non existing user", async () => {
    get.mockReturnValueOnce(
      Promise.resolve({
        exists: false,
      })
    );
    const mockCallback = jest.fn();
    const res = await _.validUserEmail(userEmail, mockCallback);
    expect(res).toBe(false);
    expect(mockCallback).toHaveBeenCalled();
    expect(mockCallback).toHaveBeenCalledWith(userEmail);
  });
});
describe("createUser", () => {
  test("create a new user", async () => {
    let obj = {};
    set.mockImplementationOnce((dictionary) => {
      return new Promise((resolve) => {
        obj = dictionary;
        resolve();
      });
    });
    await _.createUser(userEmail);
    expect(obj).toEqual({
      joined_teams: {},
      user_points: {},
    });
    expect(db.collection).toHaveBeenCalledWith("users");
    expect(db.collection("users").doc).toHaveBeenCalledWith(userEmail);
  });
});
describe("createTeamOnFirebase", () => {
  test("create a new team", async () => {
    let userRes = {
      joined_teams: {
        11111: "now",
      },
      user_points: {
        11111: 100,
      },
    };
    _.generateRandomTeamCode = jest.fn(() => "22222");
    set.mockImplementationOnce((dictionary) => {
      return new Promise((resolve) => {
        userRes = {
          joined_teams: { ...userRes.joined_teams, ...dictionary.joined_teams },
          user_points: {
            ...userRes.user_points,
            ...dictionary.user_points,
          },
        };
        resolve();
      });
    });
    let teamRes = {};
    set.mockImplementationOnce((dictionary) => {
      return new Promise((resolve) => {
        teamRes = dictionary;
        resolve();
      });
    });
    let teamPerforamnceRes = {};
    set.mockImplementationOnce((dictionary) => {
      return new Promise((resolve) => {
        teamPerforamnceRes = dictionary;
        resolve();
      });
    });
    const res = await _.createTeamOnFirebase("jest mock", userEmail);
    expect(res).toBe("22222");
    expect("11111" in userRes.joined_teams).toBe(true);
    expect("22222" in userRes.joined_teams).toBe(true);
    expect("11111" in userRes.user_points).toBe(true);
    expect("22222" in userRes.user_points).toBe(true);
    expect(userRes.user_points["11111"]).toBe(100);
    expect(userRes.user_points["22222"]).toBe(100);
    expect(teamRes.teamName).toBe("jest mock");
    expect(teamRes.creator).toBe(userEmail);
    expect(teamRes.members).toEqual([userEmail]);
    expect(teamRes.timeWasted).toEqual([]);
    expect(teamRes.teamPoints).toEqual(100);
    expect(userEmail in teamRes.distributedAnimal).toBe(true);
    expect("animalsLeft" in teamRes).toBe(true);
    expect("currDate" in teamRes).toBe(true);
    expect(teamPerforamnceRes).toEqual({
      [userEmail]: {
        22222: 100,
      },
      totalTeamPoint: {
        22222: 100,
      },
    });
    _.generateRandomTeamCode.mockRestore();
  });
});
describe("get animals left", () => {
  test("gets all animals remaining", async () => {
    get.mockResolvedValueOnce({
      data: () => {
        return {
          animalsLeft: ["Predator", "android"],
        };
      },
    });

    const res = await _.getAnimalsLeft("12345");
    expect(res).toEqual(["Predator", "android"]);
  });
});

describe("get user animal", () => {
  test("get a valid user animal", async () => {
    get.mockResolvedValueOnce({
      data: () => {
        return {
          distributedAnimal: {
            "user@ucsd.edu": "Predator",
            "user2@ucsd.edu": "android",
          },
        };
      },
    });

    const res = await _.getUserAnimal("user@ucsd.edu", "12345");
    expect(res).toEqual("Predator");
  });

  test("get another member's valid user animal", async () => {
    get.mockResolvedValueOnce({
      data: () => {
        return {
          distributedAnimal: {
            "user@ucsd.edu": "Predator",
            "user2@ucsd.edu": "android",
          },
        };
      },
    });
    const res = await _.getUserAnimal("user2@ucsd.edu", "12345");
    expect(res).toEqual("android");
  });

  test("return undefined if user not on team", async () => {
    get.mockResolvedValueOnce({
      data: () => {
        return {
          distributedAnimal: {
            "user@ucsd.edu": "Predator",
            "user2@ucsd.edu": "android",
          },
        };
      },
    });
    const res = await _.getUserAnimal("nonMember@ucsd.edu", "12345");
    expect(res).toEqual(undefined);
  });
});

describe("getUserAnimals", () => {
  test("gets the user's animal", async () => {
    let userEmail = "user@ucsd.edu";
    let userEmail2 = "user2@ucsd.edu";
    let teams = {
      11111: {
        distributedAnimal: {
          "user@ucsd.edu": "Predator",
          "user2@ucsd.edu": "banana",
        },
      },
      22222: {
        distributedAnimal: {
          "user@ucsd.edu": "android",
          "user2@ucsd.edu": "apple",
        },
      },
    };

    _.getUserAnimal = jest.fn();
    let userTeamCodes = Object.keys(teams);
    for (let key in userTeamCodes) {
      let teamCode = userTeamCodes[key];
      let userAnimal = teams[teamCode].distributedAnimal[userEmail];
      _.getUserAnimal.mockReturnValueOnce(Promise.resolve(userAnimal));
    }

    for (let key in userTeamCodes) {
      let teamCode = userTeamCodes[key];
      let userAnimal2 = teams[teamCode].distributedAnimal[userEmail2];
      _.getUserAnimal.mockReturnValueOnce(Promise.resolve(userAnimal2));
    }

    const result = await _.getUserAnimals(userEmail, teams);
    const result2 = await _.getUserAnimals(userEmail2, teams);

    expect(_.getUserAnimal).toHaveBeenCalledTimes(4);
    expect(_.getUserAnimal).toHaveBeenCalledWith("user@ucsd.edu", "11111");
    expect(_.getUserAnimal).toHaveBeenCalledWith("user@ucsd.edu", "22222");
    expect(_.getUserAnimal).toHaveBeenCalledWith("user2@ucsd.edu", "11111");
    expect(_.getUserAnimal).toHaveBeenCalledWith("user2@ucsd.edu", "22222");
    expect(result).toEqual(["Predator", "android"]);
    expect(result2).toEqual(["banana", "apple"]);
  });
});
describe("Reset Team info on a new day", () => {
  test("check when teamcode is undefined", async () => {
    _.currTeamCode = undefined;
    let teams = {
      11111: {
        members: ["user@ucsd.edu", "user2@ucsd.edu"],
        distributedAnimal: {
          "user@ucsd.edu": "apple",
          "user2@ucsd.edu": "banana",
        },
        curDate: "yesterday",
        teamPoints: 112,
        timeWasted: ["facebook", "twitter", "youtube"],
        animalsLeft: ["pear"],
      },
    };

    await _.resetTeamInfo();
    update.mockRestore();
    expect(teams).toEqual(teams);
  });
  test("check when resetTeamInfo runs correctly", async () => {
    _.setCurrentTeamCode("11111");
    let allAnimals = _.animals;
    _.setAnimal(["apple", "banana", "pear"]);

    let teams = {
      11111: {
        members: ["user@ucsd.edu", "user2@ucsd.edu"],
        distributedAnimal: {
          "user@ucsd.edu": "apple",
          "user2@ucsd.edu": "banana",
        },
        currDate: "yesterday",
        teamPoints: 112,
        timeWasted: ["facebook", "twitter", "youtube"],
        animalsLeft: ["pear"],
      },
    };
    _.setCurrentTeamInfo(teams["11111"]);

    update.mockImplementationOnce((dictionary) => {
      return new Promise((resolve) => {
        teams["11111"].timeWasted = dictionary.timeWasted;
        teams["11111"].teamPoints = dictionary.teamPoints;
        teams["11111"].animalsLeft = dictionary.animalsLeft;
        teams["11111"].currDate = dictionary.currDate;
        teams["11111"].distributedAnimal = dictionary.distributedAnimal;

        resolve();
      });
    });
    await _.resetTeamInfo();
    update.mockRestore();

    expect(teams["11111"].timeWasted).toEqual([]);
    expect(Object.keys(teams["11111"].distributedAnimal).length).toEqual(2);
    expect(teams["11111"].teamPoints).toEqual(100);
    expect(teams["11111"].currDate).toEqual(getDate());
    let allAnimal = [
      ...teams["11111"].animalsLeft,
      ...Object.values(teams["11111"].distributedAnimal),
    ];

    allAnimal.sort();
    expect(allAnimal).toEqual(["apple", "banana", "pear"].sort());
    _.setAnimal(allAnimals);
    _.setCurrentTeamInfo({
      currDate: undefined,
      animalsLeft: [],
      createdTime: undefined,
      creator: undefined,
      distributedAnimal: [],
      members: [],
      teamName: "",
      teamPoints: 100,
      timeWasted: [],
    });
  });

  update.mockRestore();
});

describe("testing checkDate()", () => {
  test("checkDate for empty localStorage", () => {
    _.checkDate();
    let date = _.getDate();
    expect(localStorageMock.setItem).toHaveBeenCalled();
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(1);
    expect(localStorageMock.setItem).toHaveBeenCalledWith("date", date);
  });
  test("checkDate for different date", () => {
    localStorageMock.setItem("date", "test");
    expect(localStorageMock.getItem("date")).toBe("test");
    _.checkDate();
    //_.updateLocalStorage();
    let date = _.getDate();
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(3);
    expect(localStorageMock.setItem).toHaveBeenLastCalledWith("date", date);
    expect(localStorageMock.getItem("date")).toBe(date);
  });
  test("checkDate for clearing localStorage", () => {
    localStorageMock.setItem("date", "test");
    expect(localStorageMock.getItem("date")).toBe("test");
    localStorageMock.setItem("toBeCleared", "value");
    expect(localStorageMock.getItem("toBeCleared")).toBe("value");
    _.checkDate();
    expect(localStorageMock.getItem("toBeCleared")).toBe(null);
  });
});

describe("joinTeamOnFirebase", () => {
  test("already existed team code", async () => {
    let userProfile = {
      joined_teams: {
        12345: "now",
      },
    };
    const result = await _.joinTeamOnFirebase("12345", userProfile, userEmail);
    expect(result).toBe("already joined the group");
  });
  test("team code does not exist", async () => {
    let userProfile = {
      joined_teams: {
        12345: "now",
      },
    };
    _.isTeamCodeUnique = jest.fn().mockResolvedValueOnce(true);
    const result = await _.joinTeamOnFirebase("123456", userProfile, userEmail);
    expect(result).toBe("team code not found");
    _.isTeamCodeUnique.mockRestore();
  });
  test("join team success", async () => {
    global.firebase = {
      firestore: {
        FieldValue: {
          arrayUnion: jest.fn(),
        },
      },
    };
    let teams = {
      11111: {
        members: ["test2@gmail.com"],
      },
      animalsLeft: [],
    };
    update.mockImplementationOnce((dictionary) => {
      return new Promise((resolve) => {
        teams["11111"].members = [
          ...teams["11111"].members,
          ...dictionary.members,
        ];
        teams["11111"].animalsLeft = dictionary.animalsLeft;
        resolve();
      });
    });
    let userInfo = {
      joined_teams: {},
      user_points: {},
    };
    set.mockImplementationOnce((dictionary) => {
      userInfo = dictionary;
    });
    set.mockImplementationOnce((dictionary) => {
      teams["11111"].distributedAnimal = dictionary.distributedAnimal;
    });
    _.getAnimalsLeft = jest.fn().mockResolvedValue(["1", "2", "3"]);
    _.getAnimal = jest.fn().mockReturnValueOnce("new animal");
    let userProfile = {
      joined_teams: {
        12345: "now",
      },
    };
    const res = await _.joinTeamOnFirebase("11111", userProfile, userEmail);
    expect(res).toBe("success");
    expect("11111" in userInfo.joined_teams).toBe(true);
    expect(userInfo.user_points).toEqual({
      11111: 100,
    });
    expect(teams["11111"].distributedAnimal).toEqual({
      [userEmail]: "new animal",
    });
    expect(teams["11111"].animalsLeft).toEqual(["1", "2", "3"]);
  });
});
