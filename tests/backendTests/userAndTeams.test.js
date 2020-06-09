import { chrome, addListener, sendMessage } from "../mocks/chromeMock.js";
global.chrome = chrome;
import _, {
  currentTeamInfo,
  blacklist,
  updateDBParams,
  userProfile,
  teamNames,


  getUserInformation,
  getTeamInformation,
  randomTeamCode,
  isTeamCodeUnique,
  generateRandomTeamCode,
  getUserEmail,
  getTeamNames,
  getTeamName,
  getUserAnimals,
  getUserAnimal,
  setTeamCode,
  setCurrentTeamInfo,
  validUserEmail,
  createUser,
  getUserProfile,
  createTeamOnFirebase,
  joinTeamOnFirebase,
  getAnimalsLeft,
  getAnimal,
  resetTeamInfo,
  currTeamCode,
  setAnimal,
  animals,
  checkDate,
  getDate,
  updateLocalStorage,
  deleteIfNoMembers,
  deleteTeamEntirely,
  setupListener,
  getUserDailyPoints,
  checkOff,
  getTeamCode,
  toggleCheckIn,
  getCurrentUrl,
  isCheckIn,
  setUserEmail,
  deleteTeamFromUser,
  getTeamOnSnapshot,
  currentTeamSnapshot,
} from "../../public/userAndTeams.js";
import { localStorageMock } from "../mocks/testMock.js";
import { setDB } from "../../public/firebaseInit.js";
import { db, get, set, update, onSnapshot } from "../mocks/databaseMock.js";

//localStorageMock.setItem("test", 2);
//console.log(store);
const cleanup = () => {
  _.getUserInformation = getUserInformation;
  _.getTeamInformation = getTeamInformation;
  _.randomTeamCode = randomTeamCode;
  _.isTeamCodeUnique = isTeamCodeUnique;
  _.generateRandomTeamCode = generateRandomTeamCode;
  _.getUserEmail = getUserEmail;
  _.getTeamNames = getTeamNames;
  _.getTeamName = getTeamName;
  _.getUserAnimals = getUserAnimals;
  _.getUserAnimal = getUserAnimal;
  _.setTeamCode = setTeamCode;
  _.setCurrentTeamInfo = setCurrentTeamInfo;
  _.validUserEmail = validUserEmail;
  _.createUser = createUser;
  _.getUserProfile = getUserProfile;
  _.createTeamOnFirebase = createTeamOnFirebase;
  _.joinTeamOnFirebase = joinTeamOnFirebase;
  _.getAnimalsLeft = getAnimalsLeft;
  _.getAnimal = getAnimal;
  _.resetTeamInfo = resetTeamInfo;
  _.currTeamCode = currTeamCode;
  _.setAnimal = setAnimal;
  _.animals = animals;
  _.checkDate = checkDate;
  _.getDate = getDate;
  _.updateLocalStorage = updateLocalStorage;
  _.deleteIfNoMembers = deleteIfNoMembers;
  _.deleteTeamEntirely = deleteTeamEntirely;
  _.setupListener = setupListener;
  _.getUserDailyPoints = getUserDailyPoints;
  _.checkOff = checkOff;
  _.getTeamCode = getTeamCode;
  _.toggleCheckIn = toggleCheckIn;
  _.getCurrentUrl = getCurrentUrl;
  _.isCheckIn = isCheckIn;
  _.setUserEmail = setUserEmail;
  _.deleteTeamFromUser = deleteTeamFromUser;
  _.getTeamOnSnapshot = getTeamOnSnapshot;
  _.currentTeamSnapshot = currentTeamSnapshot;
};

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
  afterAll(() => {
    _.getTeamName = getTeamName;
  });
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
    _.setTeamCode("11111");
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
describe("deleteIfNoMembers", () => {
  beforeEach(() => {
    _.getTeamInformation = jest.fn();
    _.deleteTeamEntirely = jest.fn();
  });
  afterEach(() => {
    _.getTeamInformation = getTeamInformation;
    _.deleteTeamEntirely = deleteTeamEntirely;
  });
  test("there are no members left", async () => {
    _.getTeamInformation.mockResolvedValueOnce({
      data: () => {
        return {
          members: [],
        };
      },
    });
    await _.deleteIfNoMembers("11111");
    expect(_.getTeamInformation).toHaveBeenCalled();
    expect(_.getTeamInformation).toHaveBeenCalledWith("11111");
    expect(_.deleteTeamEntirely).toHaveBeenCalled();
    expect(_.deleteTeamEntirely).toHaveBeenCalledWith("11111");
  });
  test("there are members left", async () => {
    _.getTeamInformation.mockResolvedValueOnce({
      data: () => {
        return {
          members: ["test1"],
        };
      },
    });
    await _.deleteIfNoMembers("11111");
    expect(_.getTeamInformation).toHaveBeenCalled();
    expect(_.getTeamInformation).toHaveBeenCalledWith("11111");
    expect(_.deleteTeamEntirely).not.toHaveBeenCalled();
  });
});

describe("setupListener", () => {
  let request = {
    for: "background",
    message: "",
  };
  let res;
  afterAll(() => {
    cleanup();
  });
  beforeEach(() => {
    // set the userEmail on global field
    _.setUserEmail(userEmail);
    let sendResponse = (response) => {
      res = response;
    };
    addListener.mockImplementation((callback) => {
      let sender;
      callback(request, sender, sendResponse);
    });
  });
  test("get email", () => {
    request.message = "get email";
    _.setupListener();
    expect(res).toEqual({ email: userEmail });
  });
  test("create team", async () => {
    request.message = "create team";
    request.teamName = "test team name";
    _.createTeamOnFirebase = jest.fn().mockResolvedValue("11111");
    _.setupListener();
    expect(_.createTeamOnFirebase).toHaveBeenCalled();
    expect(_.createTeamOnFirebase).toHaveBeenCalledWith(
      request.teamName,
      userEmail
    );
    // wait for fraction of a time
    await new Promise((r) => setTimeout(r, 10));
    expect(res).toBe("11111");
  });
  test("join team", async () => {
    request.message = "join team";
    request.teamCode = "22222";
    _.joinTeamOnFirebase = jest.fn().mockResolvedValue("success");
    _.setupListener();
    expect(_.joinTeamOnFirebase).toHaveBeenCalled();
    expect(_.joinTeamOnFirebase).toHaveBeenCalledWith(
      request.teamCode,
      userProfile,
      userEmail
    );
    // wait for fraction of a time
    await new Promise((r) => setTimeout(r, 10));
    expect(res).toBe("success");
  });
  test("get teams", () => {
    request.message = "get teams";
    _.setupListener();
    expect(res).toBe(teamNames);
  });
  test("get team info", () => {
    request.message = "get team info";
    _.setupListener();
    expect(res).toBe(currentTeamInfo);
  });
  test("get team points", async () => {
    request.message = "get team points";
    _.getUserDailyPoints = jest.fn().mockResolvedValue("success");
    _.setupListener();
    await new Promise((r) => setTimeout(r, 10));
    expect(_.getUserDailyPoints).toHaveBeenCalled();
    expect(res).toEqual([teamNames, "success"]);
  });
  test("set timeout to delete team", async () => {
    request.message = "set timeout to delete team";
    request.teamCode = "12345";
    _.getTeamInformation = jest.fn().mockResolvedValue({
      data: () => {
        return {
          currDate: "now",
          animalsLeft: ["cat"],
          createdTime: "now",
          creator: userEmail,
          distributedAnimal: { [userEmail]: "dog" },
          members: [],
          teamName: "",
          teamPoints: 100,
          timeWasted: [],
        };
      },
    });
    _.deleteTeamFromUser = jest.fn().mockResolvedValue();
    _.deleteIfNoMembers = jest.fn().mockResolvedValue();
    _.setupListener();
    await new Promise((r) => setTimeout(r, 4050));
    expect(_.deleteTeamFromUser).toHaveBeenCalled();
    expect(_.deleteTeamFromUser).toHaveBeenCalledWith(
      userEmail,
      request.teamCode,
      "dog",
      ["cat"],
      { [userEmail]: "dog" }
    );
    expect(_.deleteIfNoMembers).toHaveBeenCalled();
    expect(_.deleteIfNoMembers).toHaveBeenCalledWith(request.teamCode);
    _.deleteTeamFromUser.mockClear();
    _.deleteIfNoMembers.mockClear();
  });
  test("clear timeout", () => {
    request.message = "clear timeout";
    _.setupListener();
    expect(_.deleteTeamFromUser).not.toHaveBeenCalled();
    expect(_.deleteIfNoMembers).not.toHaveBeenCalled();
  });
  test("get timeline array", () => {
    request.message = "get timeline array";
    _.setupListener();
    expect(res).toEqual(currentTeamInfo);
  });
  test("switch team", async () => {
    request.message = "switch team";
    _.currentTeamSnapshot = jest.fn();
    _.checkOff = jest.fn();
    _.getTeamCode = jest.fn().mockResolvedValue("11111");
    _.getUserAnimal = jest.fn().mockResolvedValue("dog");
    _.getTeamOnSnapshot = jest.fn().mockResolvedValue();
    setupListener();
    await new Promise((r) => setTimeout(r, 10));
    expect(res).toBe("success");
    expect(_.currentTeamSnapshot).toHaveBeenCalled();
    expect(_.checkOff).toHaveBeenCalled();
    expect(_.checkOff).toHaveBeenCalledWith(updateDBParams);
    expect(currTeamCode).toBe("11111");
    expect(_.getTeamOnSnapshot).toHaveBeenCalled();
  });
  test("toggle check in", async () => {
    request.message = "toggle check in";
    _.toggleCheckIn = jest.fn();
    setupListener();
    expect(_.toggleCheckIn).toHaveBeenCalled();
    expect(_.toggleCheckIn).toHaveBeenCalledWith(updateDBParams);
  });
  test("get home info", async () => {
    request.message = "get home info";
    _.isCheckIn = jest.fn().mockReturnValueOnce(true);
    _.getCurrentUrl = jest.fn().mockResolvedValueOnce("facebook");
    let teamInfo = {
      currDate: "now",
      animalsLeft: [],
      createdTime: "now",
      creator: userEmail,
      distributedAnimal: { [userEmail]: "profilePic" },
      members: [],
      teamName: "",
      teamPoints: 100,
      timeWasted: [],
    };
    _.setCurrentTeamInfo(teamInfo);
    _.setTeamCode("99999");
    setupListener();

    await new Promise((r) => setTimeout(r, 10));
    expect(res).toEqual({
      isCheckIn: true,
      blacklist: blacklist,
      teamInfo: teamInfo,
      currUrl: "facebook",
      currTeamCode: "99999",
      profilePic: "profilePic",
    });
    expect(_.getCurrentUrl).toHaveBeenCalled();
    expect(_.isCheckIn).toHaveBeenCalled();
  });
});
describe("getUserDailyPoints", () => {
  test("get valid daily points", async () => {
    let currentDate = getDate();
    get.mockResolvedValueOnce({
      data: () => {
        return {
          [userEmail]: {
            11111: 100,
            22222: 99,
          },
          totalTeamPoint: {
            11111: 100,
            22222: 100,
            33333: 50,
          },
        };
      },
    });
    const res = await _.getUserDailyPoints();
    expect(db.collection).toHaveBeenCalled();
    expect(db.collection).toHaveBeenLastCalledWith("teamPerformance");
    expect(db.collection("teamPerformance").doc).toHaveBeenLastCalledWith(
      currentDate
    );
    expect(res).toEqual({
      11111: {
        userPoints: 100,
        teamPoints: 100,
      },
      22222: {
        userPoints: 99,
        teamPoints: 100,
      },
    });
  });
});
describe("getTeamOnSnapshot", () => {
  afterAll(() => {
    cleanup();
  });
  test("get valid team", async () => {
    _.getTeamCode = jest.fn().mockResolvedValue("12345");
    let teamData = {
      currDate: "test",
      animalsLeft: [],
      createdTime: "testing",
      creator: userEmail,
      distributedAnimal: { [userEmail]: "profilePic" },
      members: [userEmail, "test member"],
      teamName: "test team name",
      teamPoints: 100,
      timeWasted: [],
    };
    onSnapshot.mockImplementationOnce((callback) => {
      let doc = {
        exists: true,
        data: () => {
          return teamData;
        },
      };
      callback(doc);
    });
    _.checkDate = jest.fn();
    await _.getTeamOnSnapshot();
    expect(db.collection).toHaveBeenCalled();
    expect(db.collection).toHaveBeenCalledWith("teams");
    expect(db.collection("teams").doc).toHaveBeenCalledWith("12345");
    expect(db.collection("teams").doc("12345").onSnapshot).toHaveBeenCalled();
    expect(currentTeamInfo).toEqual(teamData);
    expect(sendMessage).toHaveBeenCalled();
    expect(sendMessage).toHaveBeenCalledWith({
      for: "team info",
      message: teamData,
    });
    expect(_.checkDate).toHaveBeenCalled();
  });
});
