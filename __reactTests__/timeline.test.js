import React from "react";
import ReactDOM from "react-dom";
import { render, cleanup } from "@testing-library/react";
import { create } from "react-test-renderer";
import "@testing-library/jest-dom";
import "@testing-library/jest-dom/extend-expect";
import Timeline from "../src/components/Timeline";

// expect.extend({ toHaveClass });
import { chrome, sendMessage } from "../__mocks__/chromeMock.js";
global.chrome = chrome;
window.name = "not_nodejs";

const timelineComponent = <Timeline></Timeline>;
let timeWasted2 = [];

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
  // Mock an implementation for send message
  beforeEach(() => {
    sendMessage.mockImplementation((msg, callback) => {
      let response;

      // Gets all timewasted
      if (msg.message == "get timeline array") {
        response = {
          timeWasted: timeWasted2,
        };
      } else {
        response = undefined;
      }
      // Return response
      callback(response);
    });
  });

  // Clear send message after test
  afterEach(() => {
    sendMessage.mockClear();
  });

  test("timeline with undefined animal", () => {
    // Render charts
    render(timelineComponent);

    timeWasted2 = [
      {
        url: "youtube",
        currTime: "now",
        points: "30",
        animal: undefined,
      },
    ];
    // Expect send message to be called twice
    expect(sendMessage).toHaveBeenCalledTimes(3);

    // Expect get teams to be called
    expect(sendMessage).toHaveBeenCalledWith(
      {
        for: "background",
        message: "get timeline array",
      },
      expect.anything()
    );
  });
  // test render
  test("timeline initialization", () => {
    // Render charts
    const { getByTestId } = render(timelineComponent);

    timeWasted2 = [
      {
        url: "youtube",
        currTime: "now",
        points: "30",
        animal: "android",
      },
    ];
    // Expect send message to be called twice
    expect(sendMessage).toHaveBeenCalledTimes(1);

    // Expect get teams to be called
    expect(sendMessage).toHaveBeenCalledWith(
      {
        for: "background",
        message: "get timeline array",
      },
      expect.anything()
    );
    // Expect the number of timeline elements to be 1
    const allTimelineElements = getByTestId("arrayTimeline");
    expect(allTimelineElements.childNodes.length).toBe(1);

    //expect();
  });
});

//b

describe("handle incoming messages", () => {
  // Mock an implementation for send message
  beforeEach(() => {
    sendMessage.mockImplementation((msg, callback) => {
      let response;

      // Gets all timewasted
      if (msg.message == "get timeline array") {
        response = {
          timeWasted: timeWasted2,
        };
      } else {
        response = undefined;
      }
      // Return response
      callback(response);
    });
  });

  // Clear send message after test
  afterEach(() => {
    sendMessage.mockClear();
  });

  test("handling message", () => {
    // Render charts
    render(timelineComponent);

    timeWasted2 = [
      {
        url: "youtube",
        currTime: "now",
        points: "30",
        animal: "android",
      },
    ];
    // Expect send message to be called twice
    expect(sendMessage).toHaveBeenCalledTimes(1);

    let request = { for: "team info", message: { timewasted: timeWasted2 } };
    // const temp = shallow(<Timeline></Timeline>);
    // console.log(temp.state("black_listed"));

    // const timelineObj = create(<Timeline></Timeline>);
    // let handle = timelineObj.handleMessage(request);

    // let handle = Timeline.handleMessage(request);
    // Expect get teams to be called

    // expect(handle).toBe(true);
  });
});
