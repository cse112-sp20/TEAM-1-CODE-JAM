import React from "react";
import "babel-polyfill";
import SideNav from "../src/components/SideNav";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";

// Get chrome env variable
import chrome from "sinon-chrome";
global.chrome = chrome;

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

// Create the test component
const testComponent = <SideNav />;

// Testing the rendering of side nav bar
test("Testing Side Nav Bar Renders Correctly", () => {
  // Render the test component
  renderWithRouter(testComponent);

  // Query all text in side nav bar
  const queryHomeText = "home";
  const queryTimeline = "access_time";
  const queryChart = "insert_chart";
  const queryGroup = "group_add";

  // Try to get the elements by text
  const homeNav = screen.getByText(queryHomeText);
  expect(homeNav).toBeInTheDocument();

  const timelineNav = screen.getByText(queryTimeline);
  expect(timelineNav).toBeInTheDocument();

  const chartNav = screen.getByText(queryChart);
  expect(chartNav).toBeInTheDocument();

  const groupNav = screen.getByText(queryGroup);
  expect(groupNav).toBeInTheDocument();
});

// Testing click_through of side nav bar
test("Testing click-through of Side Nav Bar", () => {
  // Render the test component
  const { history } = renderWithRouter(testComponent);

  // Query all text in side nav bar
  const queryHomeText = "home";
  const queryTimeline = "access_time";
  const queryChart = "insert_chart";
  const queryGroup = "group_add";

  // Get paths
  let currPath = "";
  const homePath = "/";
  const timePath = "/timeline";
  const chartPath = "/charts";
  const teamsPath = "/teams";

  // Try to get the elements by text, and click them
  const homeNav = screen.getByText(queryHomeText);
  fireEvent.click(homeNav);

  // Get the current path and expect to be a route
  currPath = history.location.pathname;
  expect(currPath).toBe(homePath);

  // Try to get the elements by text, and click them
  const timeNav = screen.getByText(queryTimeline);
  fireEvent.click(timeNav);

  // Get the current path and expect to be a route
  currPath = history.location.pathname;
  expect(currPath).toBe(timePath);

  // Try to get the elements by text, and click them
  const chartNav = screen.getByText(queryChart);
  fireEvent.click(chartNav);

  // Get the current path and expect to be a route
  currPath = history.location.pathname;
  expect(currPath).toBe(chartPath);

  // Try to get the elements by text, and click them
  const teamNav = screen.getByText(queryGroup);
  fireEvent.click(teamNav);

  // Get the current path and expect to be a route
  currPath = history.location.pathname;
  expect(currPath).toBe(teamsPath);
});
