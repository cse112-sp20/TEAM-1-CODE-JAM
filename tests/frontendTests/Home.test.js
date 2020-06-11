// Import testing library
import "@testing-library/jest-dom";
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";
import Home from "../../src/components/Home.js";

// Set chrome mock
import { chrome, sendMessage, addListener } from "../mocks/chromeMock.js";
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
const homeComponent = <Home />;

// Test data (change at will)
const homeInfo = {
  currUrl: "UCSD",
  isCheckIn: false,
  blacklist: ["facebook", "twitter", "myspace", "youtube"],
  profilePic: "heart",
  currTeamCode: "12321",

  teamInfo: {
    currDate: "now",
    animalsLeft: ["cat", "dog"],
    createdTime: "now",
    creator: "Alice",
    members: ["Alice", "Bob", "Calin"],
    teamName: "test home page",
    teamPoints: 100,
    timeWasted: [
      {
        animal: "bones",
        points: -1,
        time: 15,
        url: "myspace",
        user: "Alice",
      },
      {
        animal: "cat",
        points: -2,
        time: 20,
        url: "facebook",
        user: "Bob",
      },
      {
        animal: "dog",
        points: -1,
        time: 25,
        url: "youtube",
        user: "Calin",
      },
      {
        animal: "chicken",
        points: -4,
        time: 15,
        url: "myspace",
        user: "Bob",
      },
      {
        animal: "pig",
        points: -1,
        time: 15,
        url: "myspace",
        user: "Alice",
      },
      {
        animal: "horse",
        points: -1,
        time: 15,
        url: "myspace",
        user: "test6@gmail.com",
      },
    ],
  },
};

// Testing charts
describe("<Home />", () => {
  // Mock an implementation for send message
  beforeEach(() => {
    sendMessage.mockImplementation((msg, callback) => {
      let response;

      // Get home info
      if (msg.message === "get home info") {
        response = JSON.parse(JSON.stringify(homeInfo));
      }
      // Not recognized
      else {
        response = undefined;
        return;
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
  test("Home.js should render the element on the home page", () => {
    // Render Home
    const { getByTestId, getByText } = render(homeComponent);

    // Expect send message to be called once
    expect(sendMessage).toHaveBeenCalledTimes(1);

    // // Expect get teams to be called
    // expect(sendMessage).toHaveBeenCalledWith(
    //   {
    //     for: "background",
    //     message: "get teams",
    //   },
    //   expect.anything()
    // );

    // Expect get home info to be called
    expect(sendMessage).toHaveBeenCalledWith(
      {
        for: "background",
        message: "get home info",
      },
      expect.anything()
    );
    let teamTitle = getByTestId("team-title");
    expect(teamTitle.textContent).toBe(homeInfo.teamInfo.teamName);
    let teamCode = getByTestId("home-teamCode");
    expect(teamCode.textContent).toBe("12321");
    let teamMembersLength = getByTestId("home-numberOfMembers");
    expect(teamMembersLength.textContent).toEqual("3");
    let teamPoints = getByTestId("home-teamPoints");
    expect(teamPoints.textContent).toEqual("100");
    let timelineArr = homeInfo.teamInfo.timeWasted.reverse();
    if (timelineArr.length > 5) timelineArr = timelineArr.slice(0, 5);
    for (let i = 0; i < 5; i++) {
      let website = getByTestId(`home-timeline-item ${i}`);
      expect(website.textContent).toBe(timelineArr[i].url);
      let points = getByTestId(`home-timeline-points ${i}`);
      expect(parseInt(points.textContent, 10)).toBe(timelineArr[i].points);
    }

    let checkBox = getByTestId("checkin-checkbox");
    expect(checkBox.checked).toBe(false);
    fireEvent.click(checkBox);
    expect(checkBox.checked).toBe(true);
    expect(sendMessage).toHaveBeenCalledTimes(2);

    fireEvent.click(getByText(/UCSD/i));
  });
  test("should listen for new change", () => {
    let teamInfo = {
      currDate: "now",
      animalsLeft: ["cat", "dog"],
      createdTime: "now",
      creator: "Alice",
      members: ["Alice", "Bob", "Calin"],
      teamName: "test home page",
      teamPoints: 100,
      timeWasted: [
        {
          animal: "bones",
          points: 10,
          time: 15,
          url: "github",
          user: "Alice",
        },
        {
          animal: "cat",
          points: -2,
          time: 20,
          url: "stackoverflow",
          user: "Bob",
        },
        {
          animal: "dog",
          points: 5,
          time: 25,
          url: "github",
          user: "Calin",
        },
        {
          animal: "chicken",
          points: 5,
          time: 15,
          url: "ucsd",
          user: "Bob",
        },
        {
          animal: "pig",
          points: -1,
          time: 15,
          url: "myspace",
          user: "Alice",
        },
        {
          animal: "horse",
          points: -1,
          time: 15,
          url: "myspace",
          user: "test6@gmail.com",
        },
      ],
    };
    addListener.mockImplementationOnce((callback) => {
      let msg = {
        for: "team info",
        message: JSON.parse(JSON.stringify(teamInfo)),
      };
      callback(msg);
    });
    const { getByTestId } = render(homeComponent);
    let timelineArr = teamInfo.timeWasted.reverse();
    if (timelineArr.length > 5) timelineArr = timelineArr.slice(0, 5);
    for (let i = 0; i < 5; i++) {
      let website = getByTestId(`home-timeline-item ${i}`);
      expect(website.textContent).toBe(timelineArr[i].url);
      let points = getByTestId(`home-timeline-points ${i}`);
      expect(parseInt(points.textContent, 10)).toBe(timelineArr[i].points);
    }
  });
});
