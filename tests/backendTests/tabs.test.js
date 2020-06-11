import { getCurrentUrl, getHostname, getNameOfUrl } from "../../public/tabs.js";
import { chrome, query } from "../mocks/chromeMock.js";
global.chrome = chrome;

let tabs = [
  {
    url: "https://www.facebook.com",
  },
];
query.mockImplementation((options, callback) => {
  callback(tabs);
});
describe("getCurrentUrl", () => {
  test("get valid current url", async () => {
    const res = await getCurrentUrl();
    expect(res).toBe("facebook");
  });
  test("invalid current url", async () => {
    tabs[0].url = "chrome://extensions/";
    const res = await getCurrentUrl();
    expect(res).toBe("invalid");
  });
  test("test file path", async () => {
    tabs[0].url = "file:///Users/";
    const res = await getCurrentUrl();
    expect(res).toBe("invalid");
  });
  test("test invalid host", async () => {
    tabs[0].url = "facebook.com";
    const res = await getCurrentUrl();
    expect(res).toBe("invalid");
  });
  test("test url without prefix", async () => {
    tabs[0].url = "https://myspace.com";
    const res = await getCurrentUrl();
    expect(res).toBe("myspace");
  });
});
