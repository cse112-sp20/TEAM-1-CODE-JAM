import React from "react";
import ReactDOM from "react-dom";
import { render, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import "@testing-library/jest-dom/extend-expect";
import Timeline from "../src/components/Timeline";

// expect.extend({ toHaveClass });
import { chrome, sendMessage, addListener } from "../__mocks__/chromeMock.js";
global.chrome = chrome;
window.name = "not_nodejs";
/* timeline objects to be tested */
let timelineObjects = [
  {
    url: "youtube",
    currTime: "now",
    points: "30",
    animal: "cucumber",
  },
  {
    url: "pint",
    currTime: "now",
    points: "30",
    animal: undefined,
  },
];

const timelineComponent = <Timeline></Timeline>;

afterEach(cleanup);

describe("Test if timeline renders without fail", () => {
  test("Render without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(<Timeline></Timeline>, div);
  });

  test("Testing if table is redered", () => {
    const { getByTestId } = render(<Timeline></Timeline>);
    const timeline = getByTestId("my-timeline");
    const table = getByTestId("my-table");

    expect(timeline).toContainElement(table);
  });
});

describe("<Timeline /> initialize", () => {
  beforeEach(() => {
    addListener.mockImplementation((callback) => {
      callback({
        for: "team info",
        message: {
          timeWasted: timelineObjects,
        },
      });
    });
    sendMessage.mockImplementation((msg, callback) => {
      let response;

      // Gets all timewasted
      if (msg.message == "get timeline array") {
        response = {
          timeWasted: timelineObjects,
        };
      } else {
        response = {
          timeWasted: [],
        };
      }
      // Return response
      callback(response);
    });
  });

  afterEach(() => {
    sendMessage.mockClear();
    addListener.mockClear();
  });

  test("timeline creates two elements", () => {
    const { getByTestId } = render(timelineComponent);
    const allTimelineElements = getByTestId("arrayTimeline");
    expect(allTimelineElements.childNodes.length).toBe(2);
  });

  test("handles incoming timeline elements", () => {
    const { getByTestId } = render(timelineComponent);
    const allTimelineElements = getByTestId("arrayTimeline");
    expect(allTimelineElements.childNodes.length).toBe(2);
    expect(addListener).toHaveBeenCalledTimes(1);
  });

  test("does not update timeline if recieves wrong message", () => {
    addListener.mockImplementation((callback) => {
      callback({
        for: "something else",
        message: {
          timeWasted: [
            {
              url: "youtube",
              currTime: "now",
              points: "30",
              animal: "cucumber",
            },
          ],
        },
      });
    });
    sendMessage.mockImplementation((msg, callback) => {
      let response;

      // Gets all timewasted
      if (msg.message == "right one") {
        response = {
          timeWasted: timelineObjects,
        };
      } else {
        response = {
          timeWasted: [],
        };
      }
      // Return response
      callback(response);
    });
    const { getByTestId } = render(timelineComponent);
    const allTimelineElements = getByTestId("arrayTimeline");
    expect(allTimelineElements.childNodes.length).toBe(0);
  });
});
