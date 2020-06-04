import React from "react";
import "babel-polyfill";
import Charts from "../src/components/Charts";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

// Set local chrome mock as global var
import { chrome } from "../__mocks__/chromeMock.js";
global.chrome = chrome;

// Create the test component
const testComponent = <Charts />;

// Testing the rendering of the charts component
test("Testing Charts Render Correctly", () => {
  // Render the test component
  render(testComponent);

  // Query the team title
  const teamTitle = screen.getByText("Team Activity Tracker");
  expect(teamTitle).toBeInTheDocument();

  // Check that the settings button is there
  const settingsBtn = screen.getByText("settings");
  expect(settingsBtn).toBeInTheDocument();
});