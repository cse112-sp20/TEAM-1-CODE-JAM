import React from "react";
import { render, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import "@testing-library/jest-dom/extend-expect";
import CreateJoinTeam from "../../src/components/CreateJoinTeam";
import { chrome, sendMessage } from "../mocks/chromeMock.js";
import { createMemoryHistory } from "history";
import { Router } from "react-router-dom";
global.chrome = chrome;
window.name = "not_nodejs";

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
const redirectMock = jest.fn();
// Create the test component
const createJoinTeamComponent = <CreateJoinTeam redirect={redirectMock}></CreateJoinTeam>;

afterEach(cleanup);

describe("Test for creating a team", () => {
  test("Render without crashing", async () => {
  
  sendMessage.mockImplementation((msg, callback) => {
    let response;
    // Return response
    callback("success");
  });

  const { getByTestId} =renderWithRouter(createJoinTeamComponent);
  /* Seting team code */
  fireEvent.change(getByTestId("CreateJoinTeam-createinput"), {
      target: { value:'team code' }
    });
  expect(getByTestId("CreateJoinTeam-createinput").value).toBe('team code')

  /* simulating create team button */
  fireEvent.click(getByTestId("CreateJoinTeam-createbutton"));


});

});
