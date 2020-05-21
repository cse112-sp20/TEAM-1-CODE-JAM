const puppeteer = require("puppeteer");

const extensionPath = "./build";

const extensionUrl = "chrome-extension://imdkakgonmilneihbfjnlfbjgbidmldj";
describe("<App/>", () => {
  test("app loads", async () => {
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

    await page.waitFor(1000);

    await page.goto(extensionUrl + "/index.html");
    await page.waitForSelector(".app");
    await page.click('[data-testid="SideNav-teams"]');
    expect(page.url()).toBe(extensionUrl + "/teams");
    await page.click('[data-testid="Teams-createjoin"]');
    await page.type(
      '[data-testid="CreateJoinTeam-createinput"]',
      "puppeteer testing"
    );

    // browser.close();
  }, 10000000);
});
