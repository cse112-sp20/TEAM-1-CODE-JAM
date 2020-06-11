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
const createJoinTeamComponent = (
  <CreateJoinTeam redirect={redirectMock}></CreateJoinTeam>
);

afterEach(cleanup);

describe("Test for creating a team", () => {
  test("Render without crashing", async () => {
    sendMessage.mockImplementation((msg, callback) => {
      // Return response
      callback("12321");
    });

    const { getByTestId } = renderWithRouter(createJoinTeamComponent);
    fireEvent.click(getByTestId("CreateJoinTeam-createbutton"));
    expect(redirectMock).not.toHaveBeenCalled();
    /* Seting team code */
    fireEvent.change(getByTestId("CreateJoinTeam-createinput"), {
      target: { value: "team code" },
    });
    expect(getByTestId("CreateJoinTeam-createinput").value).toBe("team code");

    /* simulating create team button */
    fireEvent.click(getByTestId("CreateJoinTeam-createbutton"));

    expect(redirectMock).toHaveBeenCalled();
    expect(redirectMock).toHaveBeenCalledWith("12321");
  });
});

describe("Test for joining a team", () => {
  test("join valid team", async () => {
    sendMessage.mockImplementation((msg, callback) => {
      // Return response
      callback("success");
    });

    const { getByTestId, getByText } = renderWithRouter(
      createJoinTeamComponent
    );

    fireEvent.click(getByText(/Join Team/i));
    let joinInput = getByTestId("CreateJoinTeam-joininput");
    /* Seting team code */
    fireEvent.change(joinInput, {
      target: { value: "abcde" },
    });
    expect(joinInput.value).toBe("abcde");
    /* simulating create team button */
    fireEvent.click(getByTestId("CreateJoinTeam-joinbutton"));
    expect(redirectMock).toHaveBeenCalledWith("ABCDE");
  });
  test("join non exist team", async () => {
    redirectMock.mockClear();
    sendMessage.mockImplementation((msg, callback) => {
      // Return response
      callback("team code not found");
    });

    const { getByTestId, getByText } = renderWithRouter(
      createJoinTeamComponent
    );

    fireEvent.click(getByText(/Join Team/i));
    let joinInput = getByTestId("CreateJoinTeam-joininput");
    /* Seting team code */
    fireEvent.change(joinInput, {
      target: { value: "12345" },
    });
    expect(joinInput.value).toBe("12345");
    /* simulating create team button */
    fireEvent.click(getByTestId("CreateJoinTeam-joinbutton"));
    expect(redirectMock).not.toHaveBeenCalled();
  });
  test("join invalid teamcode", async () => {
    redirectMock.mockClear();
    sendMessage.mockImplementation((msg, callback) => {
      // Return response
      callback("team code not found");
    });

    const { getByTestId, getByText } = renderWithRouter(
      createJoinTeamComponent
    );

    fireEvent.click(getByText(/Join Team/i));
    let joinInput = getByTestId("CreateJoinTeam-joininput");
    /* Seting team code */
    fireEvent.change(joinInput, {
      target: { value: "1234" },
    });
    expect(joinInput.value).toBe("1234");
    /* simulating create team button */
    fireEvent.click(getByTestId("CreateJoinTeam-joinbutton"));
    expect(redirectMock).not.toHaveBeenCalled();
    fireEvent.change(joinInput, {
      target: { value: "19.x]" },
    });
    expect(joinInput.value).toBe("19.x]");
    expect(redirectMock).not.toHaveBeenCalled();
  });
  test("already join the team", async () => {
    redirectMock.mockClear();
    sendMessage.mockImplementation((msg, callback) => {
      // Return response
      callback("already joined the group");
    });

    const { getByTestId, getByText } = renderWithRouter(
      createJoinTeamComponent
    );

    fireEvent.click(getByText(/Join Team/i));
    let joinInput = getByTestId("CreateJoinTeam-joininput");
    /* Seting team code */
    fireEvent.change(joinInput, {
      target: { value: "12345" },
    });
    expect(joinInput.value).toBe("12345");
    /* simulating create team button */
    fireEvent.click(getByTestId("CreateJoinTeam-joinbutton"));
    expect(redirectMock).not.toHaveBeenCalled();
  });
});
