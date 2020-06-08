const timeout = 5000;

describe(
  "/ (Home Page)",
  () => {
    let page;
    beforeAll(async () => {
      const extensionName = "Team Activity Tracker";
      const extensionPopupHtml = "index.html";
      const targets = await global.__BROWSER__.targets();
      const extensionTarget = targets.find(({ _targetInfo }) => {
        return (
          _targetInfo.title === extensionName &&
          _targetInfo.type === "background_page"
        );
      });
      const extensionUrl = extensionTarget._targetInfo.url || "";
      const [, , extensionID] = extensionUrl.split("/");
      page = await global.__BROWSER__.newPage();
      page.emulate({
        viewport: {
          width: 500,
          height: 900,
        },
        userAgent: "",
      });
      await page.goto(
        `chrome-extension://${extensionID}/${extensionPopupHtml}`
      );
    }, timeout);

    afterAll(async () => {
      await page.close();
    });

    it("Clicks the checkin button", async () => {
      page.waitForSelector("#checkin");
      page.click("#checkin");
      await page.waitFor(1000);
    });
    it("Clicks the add teams button", async () => {
      page.click("#sidenav-background-teams");
      await page.waitFor(1000);
      page.waitForSelector("#teams-create-join-btn");
      page.click("#teams-create-join-btn");
      await page.waitFor(1000);
    });
    it("Clicks the add teams button", async () => {
      page.click("#teams-create-join-btn");
      await page.waitFor(1000);
      page.waitForSelector("#teamName");
      page.click("#teamName");
      await page.waitFor(1000);
      await page.keyboard.type("Hello World!");
      await page.waitFor(1000);
      page.click("#createButton");
      await page.waitFor(1000);
    });
  },
  timeout
);
