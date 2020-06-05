import { chrome, sendMessage, set } from "../__mocks__/chromeMock.js";
global.chrome = chrome;
import "@testing-library/jest-dom";
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { Route, Router } from "react-router-dom";
import { createMemoryHistory } from "history";
import Teams from "../src/components/Teams.js";
describe("<Teams />", () => {
  beforeEach(() => {
    sendMessage.mockImplementationOnce((msg, callback) => {
      let response = [
        {
          teamCode: 11111,
          teamName: "test 1",
          joinedTime: "yesterday",
        },
        {
          teamCode: 22222,
          teamName: "test 2",
          joinedTime: "yesterday",
        },
        {
          teamCode: 33333,
          teamName: "test 3",
          joinedTime: "now",
        },
      ];
      callback(response);
    });
  });
  afterEach(() => {
    sendMessage.mockClear();
  });
  test("should render all teams", () => {
    const history = createMemoryHistory();
    const { getByTestId } = render(
      <Router history={history}>
        <Route path="/" component={Teams}></Route>
      </Router>
    );
    const firstTeamName = getByTestId("team name 1");
    expect(firstTeamName.textContent).toBe("test 1");
    const secondTeamName = getByTestId("team name 2");
    expect(secondTeamName.textContent).toBe("test 2");
    const thirdTeamName = getByTestId("team name 3");
    expect(thirdTeamName.textContent).toBe("test 3");
    expect(sendMessage).toHaveBeenCalled();
    expect(sendMessage).toHaveBeenCalledWith(
      {
        for: "background",
        message: "get teams",
      },
      expect.anything()
    );
  });
  test("should click on a team", async () => {
    const history = createMemoryHistory();
    const { getByText } = render(
      <Router history={history}>
        <Route path="/" component={Teams}></Route>
      </Router>
    );
    sendMessage.mockImplementationOnce((msg, callback) => {
      let response = "success";
      callback(response);
    });
    let chromeStorage = {};
    set.mockImplementationOnce((object, callback) => {
      chromeStorage = object;
      callback();
    });
    fireEvent.click(getByText(/test 1/i));
    expect(chromeStorage).toEqual({ prevTeam: 11111 });
    expect(sendMessage).toHaveBeenCalledTimes(2);
    expect(sendMessage).toHaveBeenCalledWith(
      {
        for: "background",
        message: "switch team",
      },
      expect.anything()
    );
    expect(history.location.pathname).toBe("/");
    expect(history.length).toBe(2);
  });
});
