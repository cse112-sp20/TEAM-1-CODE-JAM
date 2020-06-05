import React from "react";
import "babel-polyfill";
import NavBar from "../src/components/NavBar";
import { render, fireEvent, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

// Set local chrome mock as global var
import { chrome } from "../__mocks__/chromeMock.js";
global.chrome = chrome;

// Create the test component
const testComponent = <NavBar />;

// Testing the rendering of main nav bar
test("Testing Nav Bar Renders Correctly", () => {
  // Render the test component
  render(testComponent);

  // Query the team title
  const teamTitle = screen.getByText("Team Activity Tracker");
  expect(teamTitle).toBeInTheDocument();

  // Check that the settings button is there
  const settingsBtn = screen.getByText("settings");
  expect(settingsBtn).toBeInTheDocument();
});

// Test clicking the settings button
test("Testing Settings Button Click", () => {
  // Render the test component
  render(testComponent);

  // Check that the settings button is there
  const settingsBtn = screen.getByText("settings");
  fireEvent.click(settingsBtn);

  // Check that the new tab is open
  const expected = [{ url: "/popup.html" }];
  expect(chrome.tabs.pages).toEqual(expect.arrayContaining(expected));
});
