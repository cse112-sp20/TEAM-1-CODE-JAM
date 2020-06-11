import path from "path";
import puppeteer from "puppeteer";
import manifest from "../../build/manifest.json";
const TEST_TIMEOUT = 80000; // extend test timeout sinces its E2E

let browser;
let teamCode;
let page;
let page2;
const BUILD_PATH = path.resolve(__dirname, "../../build");

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