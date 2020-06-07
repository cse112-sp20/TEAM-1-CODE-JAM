// Import testing library
import "@testing-library/jest-dom";
import React from "react";
import { render } from "@testing-library/react";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";
import Charts from "../../src/components/Charts.js";

// Set chrome mock
import { chrome, sendMessage } from "../mocks/chromeMock.js";
global.chrome = chrome;

// Change window.name to valid
// window.name = "not_nodejs";
window.name = "nodejs";

// Function to render with router
const renderWithRouter = (
  component,
  {
    route = "/",
    history = createMemoryHistory({ initialEntries: [route] }),
  } = {}
) => {
  return {
    ...render(<Router history={history}>{component}</Router>),
    history,
  };
};

// define testComponent
const testComponent = <Charts />;

// Test data (change at will)
const testTeams = [
  {
    teamCode: 11111,
    teamName: "test 1",
    joinedTime: "yesterday",
  },
];
const testTeamPoints = {
  "11111": {
    userPoints: 300,
    teamPoints: 1200,
  },
};

// Testing charts
describe("<Charts />", () => {
  // Mock an implementation for send message
  beforeEach(() => {
    sendMessage.mockImplementation((msg, callback) => {
      let response;

      // Get team points
      if (msg.message == "get team points") {
        response = testTeamPoints;
      }
      // Get teams
      else if (msg.message === "get teams") {
        response = testTeams;
      }
      // Switch teams
      else if (msg.message == "switch team") {
        response = "success";
      }
      // Not recognized
      else {
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

  // test render
  test("Charts.js react unit tests: test send message, and chart data", () => {
    // Render charts
    const { getByTestId } = renderWithRouter(testComponent);

    // Expect send message to be called twice
    expect(sendMessage).toHaveBeenCalledTimes(2);

    // Expect get teams to be called
    expect(sendMessage).toHaveBeenCalledWith(
      {
        for: "background",
        message: "get teams",
      },
      expect.anything()
    );

    // Expect get team points to be called
    expect(sendMessage).toHaveBeenCalledWith(
      {
        for: "background",
        message: "get team points",
      },
      expect.anything()
    );

    // Get the chart data from the screen
    const chartTestId = "chart-container";
    const testArray = getByTestId(chartTestId);

    // Check that chart data is an attribute
    expect(testArray.hasAttribute("chartdata")).toBe(true);

    // Check that chart data is not null if test data exists
    if (testTeams.length) {
      expect(testArray.getAttribute("chartdata")).toBeDefined();
    }

    // Check if at least one chart is rendered
    expect(testArray.childElementCount).toBe(testTeams.length);
  });
});
