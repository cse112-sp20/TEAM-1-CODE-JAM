import chrome from "sinon-chrome";
global.chrome = chrome;
const puppeteer = require("puppeteer");

const extensionPath = "./build";

const extensionUrl = "chrome-extension://imdkakgonmilneihbfjnlfbjgbidmldj";

require("../public/firebaseInit");
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

let userEmail = "agent@gmail.com";
describe("Test team functionality", () => {
  test("app loads", async (done) => {
    let browser = await puppeteer.launch({
      headless: false,
      devtools: true,
      slowMo: 50,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    });
    let page = await browser.newPage();

    page.emulate({
      viewport: {
        width: 800,
        height: 600,
      },
      userAgent: "test chrome",
    });

    await page.waitFor(2000);

    let doesUserExist = await validUserEmail(userEmail, function () {
      // programatically fail the test
      expect(true).toBe(false);
    });
    // user should have been created automatically by the background script
    expect(doesUserExist).toBe(true);

    await page.goto(extensionUrl + "/index.html");
    await page.waitForSelector(".app");
    await page.click('[data-testid="SideNav-teams"]');
    // should be in teams page
    expect(page.url()).toBe(extensionUrl + "/teams");
    await page.click('[data-testid="Teams-createjoin"]');
    await page.type(
      '[data-testid="CreateJoinTeam-createinput"]',
      "puppeteer testing"
    );
    await page.click('[data-testid="CreateJoinTeam-createbutton"]');
    await page.waitForSelector('[data-testid="Home-teammember"]');
    await page.waitFor(1000);
    let teamMember = await page.$eval(
      '[data-testid="Home-teammember"]',
      (el) => el.textContent
    );
    expect(teamMember).toBe(userEmail);
    let teamName = await page.$eval(
      '[data-testid="Home-teamname"]',
      (el) => el.textContent
    );
    teamName = teamName.slice(0, teamName.lastIndexOf("Team Code"));
    expect(teamName).toBe("puppeteer testing");
    let teamCode = await page.$eval(
      '[data-testid="Home-teamcode"]',
      (el) => el.textContent
    );

    teamCode = teamCode.slice(teamCode.length - 5);
    expect(teamCode.length).toBe(5);
    const regex = /^[A-Z0-9]+$/i;
    expect(regex.test(teamCode)).toBe(true);
    let unique = await isTeamCodeUnique(teamCode);
    expect(unique).toBe(false);

    // browser.close();
    done();
  }, 100000);
});

afterAll(async () => {
  await deleteEverythingAboutAUser(userEmail);
  global.firebase.app().delete();
});
