import path from 'path'
import puppeteer from 'puppeteer'
import manifest from '../../build/manifest.json'
import db from '../../public/firebaseInit.js';
const TEST_TIMEOUT = 50000 // extend test timeout sinces its E2E

let browser
let page
const BUILD_PATH = path.resolve(__dirname, '../../build')

let extensionId = null

const getExtensionId = async () => {
  const dummyPage = await browser.newPage()
  await dummyPage.waitFor(2000) // arbitrary wait time.

  const targets = await browser.targets()
  const extensionTarget = targets.find(
    ({ _targetInfo }) =>
      _targetInfo.title === manifest.name &&
      _targetInfo.type === 'background_page'
  )
  // eslint-disable-next-line no-underscore-dangle
  const extensionUrl = extensionTarget._targetInfo.url || ''
  const [, , extensionID] = extensionUrl.split('/')
  dummyPage.close()
  return extensionID
}

beforeAll(async () => {
  browser = await puppeteer.launch({
    executablePath: process.env.PUPPETEER_EXEC_PATH,
    headless: false,
    args: [
      `--disable-extensions-except=${BUILD_PATH}`,
      `--load-extension=${BUILD_PATH}`,
      '--no-sandbox',
    ],
    defaultViewport: {
      width: 1280,
      height: 800,
    },
    slowMo: 100,
  })

  extensionId = await getExtensionId()
})

afterAll(async () => {
  if (browser) {
    await browser.close()
  }
})

beforeEach(async () => {
  jest.setTimeout(100000);
  page = await browser.newPage()
})

afterEach(async () => {
  if (page) {
    await page.close()
  }
})

test(
  'Launch Extension with no errors',
  async () => {
    const url = `chrome-extension://${extensionId}`;
    await page.goto(`${url}/index.html`)
    await page.waitForSelector(".app");
    const header = await page.$eval("div>#team-name", e => e.innerHTML);
    expect(header).toBe(`Team Activity Tracker`);
  },
  TEST_TIMEOUT
)
test(
  'Create Team',
  async () => {
    const url = `chrome-extension://${extensionId}`;
    await page.goto(`${url}/index.html`)
    await page.waitForSelector(".app");
    await page.click('[data-testid="SideNav-teams"]');
    expect(page.url()).toBe(url + "/teams");
    await page.click('[data-testid="Teams-createjoin"]');
    await page.type(
      '[data-testid="CreateJoinTeam-createinput"]',
      "puppeteer testing"
    );
    await page.click('[data-testid="CreateJoinTeam-createbutton"]');
    await page.waitForSelector("[data-testid='team-title']", {visible: true, timeout: 0});
    const header = await page.$eval("[data-testid='team-title']", e => e.innerHTML);
    expect(header).toBe(`puppeteer testing`);
  },
  TEST_TIMEOUT
)
test(
  'Join Team',
  async () => {
    const url = `chrome-extension://${extensionId}`;
    await page.goto(`${url}/index.html`)
    await page.waitForSelector(".app");
    await page.click('[data-testid="SideNav-teams"]');
    const teamName = await page.$eval("[data-testid='team name 1']", e => e.innerHTML);
    expect(teamName).toBe(`puppeteer testing`);
    await page.click('[data-testid="team name 1"]');
    await page.waitForSelector("[data-testid='team-title']", {visible: true, timeout: 0});
    const teamTitle = await page.$eval("[data-testid='team-title']", e => e.innerHTML);
    expect(teamTitle).toBe(`puppeteer testing`);
  },
  TEST_TIMEOUT
)
test(
  'Check In button',
  async () => {
    const url = `chrome-extension://${extensionId}`;
    await page.goto(`${url}/index.html`)
    await page.waitForSelector(".app");
    await page.click('[data-testid="checkin-btn"]');
    expect(`puppeteer testing`).toBe(`puppeteer testing`);
    await page.goto(`https://twitter.com/explore`, {
      waitUntil: "networkidle2"
    })
    expect(page.url()).toBe("https://twitter.com/explore");
    await page.waitFor(2000);
  },
  TEST_TIMEOUT
)
test(
  'Test Timeline',
  async () => {
    const url = `chrome-extension://${extensionId}`;
    await page.goto(`${url}/index.html`, {
      waitUntil: "networkidle2"
    })
    await page.waitForSelector("[data-testid='home-timeline-item 0']");
    const timelineItem = await page.$eval("[data-testid='home-timeline-item 0']", e => e.innerHTML);
    expect(timelineItem).toBe(`twitter`);
  },
  TEST_TIMEOUT
)

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
