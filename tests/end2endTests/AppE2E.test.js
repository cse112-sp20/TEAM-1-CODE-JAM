import path from "path";
import puppeteer from "puppeteer";
import manifest from "../build/manifest.json";
const TEST_TIMEOUT = 80000; // extend test timeout sinces its E2E

let browser;
let teamCode;
let page;
let page2;
const BUILD_PATH = path.resolve(__dirname, "../build");

let extensionId = null;

const getExtensionId = async () => {
  const dummyPage = await browser.newPage();
  await dummyPage.waitFor(3000); // arbitrary wait time.

  const targets = await browser.targets();
  const extensionTarget = targets.find(
    ({ _targetInfo }) =>
      _targetInfo.title === manifest.name &&
      _targetInfo.type === "background_page"
  );
  const extensionUrl = extensionTarget._targetInfo.url || "";
  const [, , extensionID] = extensionUrl.split("/");
  dummyPage.close();
  return extensionID;
};

beforeAll(async () => {
  jest.setTimeout(80000);
  browser = await puppeteer.launch({
    timeout: 0,
    executablePath: process.env.PUPPETEER_EXEC_PATH,
    headless: false,
    args: [
      `--disable-extensions-except=${BUILD_PATH}`,
      `--load-extension=${BUILD_PATH}`,
      "--no-sandbox",
    ],
    defaultViewport: {
      width: 1280,
      height: 800,
    },
    slowMo: 100,
  });

  extensionId = await getExtensionId();
});

afterAll(async () => {
  if (browser) {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.once("request", (request) => {
      var data = {
        method: "DELETE",
      };
      request.continue(data);

      // Immediately disable setRequestInterception, or all other requests will hang
      page.setRequestInterception(false);
    });
    await page.goto(
      `https://us-central1-chrome-extension-cse-112.cloudfunctions.net/teams/${teamCode}`
    );
    await page.close();
    await browser.close();
    jest.clearAllTimers();
  }
});

beforeEach(async () => {
  page = await browser.newPage();
});

afterEach(async () => {
  if (page) {
    await page.close();
  }
});

test(
  "Launch Extension with no errors",
  async () => {
    const url = `chrome-extension://${extensionId}`;
    await page.goto(`${url}/index.html`);
    await page.waitForSelector(".app");
    const header = await page.$eval("div>#team-name", (e) => e.innerHTML);
    expect(header).toBe(`Team Activity Tracker`);
  },
  TEST_TIMEOUT
);
test(
  "Create Team",
  async () => {
    const url = `chrome-extension://${extensionId}`;
    await page.goto(`${url}/index.html`);
    await page.waitForSelector(".app");
    await page.click('[data-testid="SideNav-teams"]');
    expect(page.url()).toBe(url + "/teams");
    await page.click('[data-testid="Teams-createjoin"]');
    await page.type(
      '[data-testid="CreateJoinTeam-createinput"]',
      "puppeteer testing"
    );
    await page.click('[data-testid="CreateJoinTeam-createbutton"]');
    await page.waitForSelector("[data-testid='team-title']", {
      visible: true,
    });
    const header = await page.$eval(
      "[data-testid='team-title']",
      (e) => e.innerHTML
    );
    expect(header).toBe(`puppeteer testing`);
  },
  TEST_TIMEOUT
);
test(
  "Join Team",
  async () => {
    const url = `chrome-extension://${extensionId}`;
    await page.goto(`${url}/index.html`);
    await page.waitForSelector(".app");
    await page.click('[data-testid="SideNav-teams"]');
    const teamName = await page.$eval(
      "[data-testid='team name 1']",
      (e) => e.innerHTML
    );
    expect(teamName).toBe(`puppeteer testing`);
    await page.click('[data-testid="team name 1"]');
    await page.waitForSelector("[data-testid='team-title']", {
      visible: true,
    });
    const teamTitle = await page.$eval(
      "[data-testid='team-title']",
      (e) => e.innerHTML
    );
    expect(teamTitle).toBe(`puppeteer testing`);
  },
  TEST_TIMEOUT
);
test(
  "Check In button",
  async () => {
    const url = `chrome-extension://${extensionId}`;
    await page.goto(`${url}/index.html`);
    await page.waitForSelector(".app");
    await page.click('[data-testid="checkin-btn"]');
    expect(`puppeteer testing`).toBe(`puppeteer testing`);
    page2 = await browser.newPage();
    await page2.bringToFront();
    await page2.goto(`https://twitter.com/explore`, {
      waitUntil: "networkidle2",
    });
    expect(page2.url()).toBe("https://twitter.com/explore");
    await page2.waitFor(4000);
    await page2.close();
    await page.bringToFront();
  },
  TEST_TIMEOUT
);
test(
  "Test Timeline in home page",
  async () => {
    const url = `chrome-extension://${extensionId}`;
    await page.goto(`${url}/index.html`, {
      waitUntil: "networkidle2",
    });
    await page.waitForSelector("[data-testid='home-timeline-item 0']");
    const timelineItem = await page.$eval(
      "[data-testid='home-timeline-item 0']",
      (e) => e.innerHTML
    );
    expect(timelineItem).toBe(`twitter`);
  },
  TEST_TIMEOUT
);
test(
  "Verify points have decreased",
  async () => {
    const url = `chrome-extension://${extensionId}`;
    await page.goto(`${url}/index.html`, {
      waitUntil: "networkidle2",
    });
    await page.waitForSelector("[data-testid='home-teamPoints']", {});
    const teamPoints = await page.$eval(
      "[data-testid='home-teamPoints']",
      (e) => e.innerHTML
    );
    expect(parseInt(teamPoints, 10)).toBeLessThan(100);
  },
  TEST_TIMEOUT
);
test(
  "Verify team members has increased",
  async () => {
    const url = `chrome-extension://${extensionId}`;
    await page.goto(`${url}/index.html`, {
      waitUntil: "networkidle2",
    });
    await page.waitForSelector("[data-testid='home-numberOfMembers']");
    const teamMembers = await page.$eval(
      "[data-testid='home-numberOfMembers']",
      (e) => e.innerHTML
    );
    expect(parseInt(teamMembers, 10)).toEqual(1);
  },
  TEST_TIMEOUT
);
test(
  "Verify team code",
  async () => {
    const url = `chrome-extension://${extensionId}`;
    await page.goto(`${url}/index.html`, {
      waitUntil: "networkidle2",
    });
    teamCode = await page.$eval(
      '[data-testid="home-teamCode"]',
      (el) => el.textContent
    );
    expect(teamCode.length).toBe(5);
  },
  TEST_TIMEOUT
);
test(
  "Verify timeline tab",
  async () => {
    const url = `chrome-extension://${extensionId}`;
    await page.goto(`${url}/index.html`);
    await page.waitForSelector(".app");
    await page.click('[data-testid="SideNav-timeline"]');
    const timelineItem = await page.$eval(
      "[data-testid='timeline-item 1']",
      (e) => e.innerHTML
    );
    expect(timelineItem).toBe(`twitter`);
  },
  TEST_TIMEOUT
);
test(
  "Verify performance tab",
  async () => {
    const url = `chrome-extension://${extensionId}`;
    await page.goto(`${url}/index.html`);
    await page.waitForSelector(".app");
    await page.click('[data-testid="SideNav-performance"]');
    expect(`twitter`).toBe(`twitter`);
  },
  TEST_TIMEOUT
);
//     await page.goto(extensionUrl + "/index.html");
//     await page.waitForSelector(".app");
//     await page.click('[data-testid="SideNav-teams"]');
//     // should be in teams page
//     expect(page.url()).toBe(extensionUrl + "/teams");
//     await page.click('[data-testid="Teams-createjoin"]');
//     await page.type(
//       '[data-testid="CreateJoinTeam-createinput"]',
//       "puppeteer testing"
//     );

// // TODO need a good indicator that deeplinking is working
// test(
//   'newtab page should be able to deeplink into a exercise',
//   async () => {
//     await page.goto(
//       `chrome-extension://${extensionId}/index.html?play=true`
//     )
//     await waitDOMLoaded()
//     await wait(1000)
//     const el = await page.$('[data-testid="breath-player--count"]')
//     expect(el).not.toBe(null)

//     const initialCount = await (await el.getProperty(
//       'textContent'
//     )).jsonValue()
//     expect(initialCount.trim()).toBe('5')
//   },
//   TEST_TIMEOUT
// )

// import chrome from "sinon-chrome";
// global.chrome = chrome;
// // const puppeteer = require("puppeteer");

// describe("delete later and uncomment the following", () => {
//   test("delete later", () => {});
// });
// const extensionPath = "./build";

// const extensionUrl = "chrome-extension://imdkakgonmilneihbfjnlfbjgbidmldj";

// require("../public/firebaseInit");
// const {
//   randomTeamCode,
//   getHostname,
//   isTeamCodeUnique,
//   joinTeamOnFirebase,
//   getTeamName,
//   validUserEmail,
//   createTeamOnFirebase,
//   deleteTeamFromUser,
//   getTeamInformation,
//   getUserInformation,
//   deleteTeamEntirely,
//   deleteEverythingAboutAUser,
//   setupListener,
//   createUser,
// } = require("../public/background");

// let userEmail = "agent@gmail.com";
// describe("Test team functionality", () => {
//   test("app loads", async (done) => {
//     let browser = await puppeteer.launch({
//       headless: false,
//       devtools: true,
//       slowMo: 50,
//       args: [
//         `--disable-extensions-except=${extensionPath}`,
//         `--load-extension=${extensionPath}`,
//       ],
//     });
//     let page = await browser.newPage();

//     page.emulate({
//       viewport: {
//         width: 800,
//         height: 600,
//       },
//       userAgent: "test chrome",
//     });

//     await page.waitFor(2000);

//     let doesUserExist = await validUserEmail(userEmail, function () {
//       // programatically fail the test
//       expect(true).toBe(false);
//     });
//     // user should have been created automatically by the background script
//     expect(doesUserExist).toBe(true);

//     await page.goto(extensionUrl + "/index.html");
//     await page.waitForSelector(".app");
//     await page.click('[data-testid="SideNav-teams"]');
//     // should be in teams page
//     expect(page.url()).toBe(extensionUrl + "/teams");
//     await page.click('[data-testid="Teams-createjoin"]');
//     await page.type(
//       '[data-testid="CreateJoinTeam-createinput"]',
//       "puppeteer testing"
//     );
//     await page.click('[data-testid="CreateJoinTeam-createbutton"]');
//     await page.waitForSelector('[data-testid="Home-teammember"]');
//     await page.waitFor(2000);
//     let teamMember = await page.$eval(
//       '[data-testid="Home-teammember"]',
//       (el) => el.textContent
//     );
//     expect(teamMember).toBe(userEmail);
//     let teamName = await page.$eval(
//       '[data-testid="Home-teamname"]',
//       (el) => el.textContent
//     );
//     teamName = teamName.slice(0, teamName.lastIndexOf("Team Code"));
//     expect(teamName).toBe("puppeteer testing");
//     let teamCode = await page.$eval(
//       '[data-testid="Home-teamcode"]',
//       (el) => el.textContent
//     );

//     teamCode = teamCode.slice(teamCode.length - 5);
//     expect(teamCode.length).toBe(5);
//     const regex = /^[A-Z0-9]+$/i;
//     expect(regex.test(teamCode)).toBe(true);
//     let unique = await isTeamCodeUnique(teamCode);
//     expect(unique).toBe(false);

//     browser.close();
//     done();
//   }, 100000);
// });

// afterAll(async () => {
//   await deleteEverythingAboutAUser(userEmail);
//   global.firebase.app().delete();
// });
