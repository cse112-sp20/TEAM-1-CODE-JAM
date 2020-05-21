import chrome from "sinon-chrome";
global.chrome = chrome;

const {
  randomTeamCode,
  getHostname,
  isTeamCodeUnique,
  joinTeamOnFirebase,
  getTeamName,
  validUserEmail,
  createTeamOnFirebase,
  deleteTeamFromUser,
  getTeamInformation,
  getUserInformation,
  deleteTeamEntirely,
  deleteEverythingAboutAUser,
  setupListener,
  createUser,
} = require("../public/background");

jest.setTimeout(30000);

let userEmail = "test@gmail.com";
let dummyEmail = "test2@gmail.com";

beforeAll(async () => {
  await Promise.all([createUser(userEmail), createUser(dummyEmail)]);
});

describe("createUser", () => {
  test("create a new user", async () => {
    let doc = await getUserInformation(userEmail);
    expect(doc.id).toBe(userEmail);
  });
});

describe("randomTeamCode", () => {
  const regex = /^[A-Z0-9]+$/i;
  test("length 5", () => {
    const randomCode = randomTeamCode(5);
    expect(randomCode.length).toBe(5);
    expect(regex.test(randomCode)).toBe(true);
  });
  test("length 10", () => {
    const randomCode = randomTeamCode(10);
    expect(randomCode.length).toBe(10);
    expect(regex.test(randomCode)).toBe(true);
  });
});

describe("getHostName", () => {
  test("facebook", () => {
    let name = getHostname("https://www.facebook.com");
    expect(name).toBe("www.facebook.com");
    name = getHostname("https://www.facebook.com/randomstring");
    expect(name).toBe("www.facebook.com");
  });
  test("twitter", () => {
    let name = getHostname("https://twitter.com");
    expect(name).toBe("twitter.com");
    name = getHostname("https://twitter.com/randomstring");
    expect(name).toBe("twitter.com");
  });
  test("mespace", () => {
    let name = getHostname("https://myspace.com");
    expect(name).toBe("myspace.com");
    name = getHostname("https://myspace.com/randomstring");
    expect(name).toBe("myspace.com");
  });
});

describe("isTeamCodeUnique", () => {
  test("not unique teamcode", async () => {
    const result = await isTeamCodeUnique("12345");
    expect(result).toBe(false);
  });
  test("unique teamcode", async () => {
    const result = await isTeamCodeUnique("123456");
    expect(result).toBe(true);
  });
});

describe("joinTeamOnFirebase", () => {
  let userProfile;
  beforeEach(() => {
    userProfile = {
      joined_teams: {
        12345: "yesterday",
      },
    };
  });
  test("already existed team code", async () => {
    const result = await joinTeamOnFirebase("12345", userProfile, userEmail);
    expect(result).toBe("already joined the group");
  });
  test("team code does not exist", async () => {
    const result = await joinTeamOnFirebase("123456", userProfile, userEmail);
    expect(result).toBe("team code not found");
  });
  test("join team success", async () => {
    let teamCode = await createTeamOnFirebase("jest testing", dummyEmail);
    const result = await joinTeamOnFirebase(teamCode, userProfile, userEmail);
    expect(result).toBe("success");
    let data = await Promise.all([
      getTeamInformation(teamCode),
      getUserInformation(userEmail),
    ]);
    let teamInformation = data[0].data();
    let userInformation = data[1].data();
    expect(teamCode in userInformation.joined_teams).toBe(true);
    expect(teamInformation.members.includes(userEmail)).toBe(true);
  });
});
describe("getTeamName", () => {
  test("get valid team name", async () => {
    let userProfile = {
      joined_teams: {
        12345: "yesterday",
      },
    };
    const result = await getTeamName("12345", userProfile);
    expect(result).toEqual({
      teamCode: "12345",
      teamName: "testing",
      joinedTime: "yesterday",
    });
  });
});

describe("validUserEmail", () => {
  const createUserMock = jest.fn(() => Promise.resolve());
  afterEach(() => {
    jest.clearAllMocks();
  });
  test("user does not exist", async () => {
    let fakeEmail = "doesn't exist";
    await validUserEmail(fakeEmail, createUserMock);
    expect(createUserMock).toHaveBeenCalled();
    expect(createUserMock).toHaveBeenCalledWith(fakeEmail);
  });
  test("user does exist", async () => {
    await validUserEmail(userEmail, createUserMock);
    expect(createUserMock).not.toHaveBeenCalled();
    expect(createUserMock).not.toHaveBeenCalledWith(userEmail);
  });
});

describe("createTeamOnFirebase", () => {
  test("create a new team on firebase", async () => {
    let teamCode = await createTeamOnFirebase("jest testing", userEmail);
    let result = await Promise.all([
      getTeamInformation(teamCode),
      getUserInformation(userEmail),
    ]);
    let teamInformation = result[0].data();
    let userInformation = result[1].data();
    expect(teamInformation.teamName).toBe("jest testing");
    expect(teamInformation.members.includes(userEmail)).toBe(true);
    expect(teamInformation.creator).toBe(userEmail);
    expect(teamCode in userInformation.joined_teams).toBe(true);
  });
});

describe("deleteTeamFromUser", () => {
  test("create a team then delete from user", async () => {
    let userProfile = {
      joined_teams: {
        12345: "yesterday",
      },
    };
    let teamCode = await createTeamOnFirebase("jest testing", dummyEmail);
    await joinTeamOnFirebase(teamCode, userProfile, userEmail);
    await deleteTeamFromUser(userEmail, teamCode);
    let result = await Promise.all([
      getTeamInformation(teamCode),
      getUserInformation(userEmail),
    ]);
    let teamInformation = result[0].data();
    let userInformation = result[1].data();
    expect(teamInformation.members.includes(userEmail)).toBe(false);
    expect(teamCode in userInformation.joined_teams).toBe(false);
  });
});

afterAll(async () => {
  await deleteEverythingAboutAUser(dummyEmail);
  await deleteEverythingAboutAUser(userEmail);
  global.firebase.app().delete();
});
