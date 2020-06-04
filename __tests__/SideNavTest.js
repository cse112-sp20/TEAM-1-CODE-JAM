import React from "react";
import "babel-polyfill";
import SideNav from "../src/components/SideNav";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { Route, Switch, BrowserRouter as Router } from "react-router-dom";

// Set local chrome mock as global var
import chrome from "sinon-chrome";
global.chrome = chrome;

// Create the test component
const testComponent = (
  <Router>
    <SideNav />
  </Router>
);

// Testing the rendering of side nav bar
test("Testing Side Navigation Renders Correctly", () => {
  // Render the test component
  render(testComponent);

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
test("Testing Side Navigation With Clicking", () => {
  // Render the test component
  render(testComponent);

  // Query all text in side nav bar
  const queryHomeText = "home";
  const queryTimeline = "access_time";
  const queryChart = "insert_chart";
  const queryGroup = "group_add";

  // Try to get the elements by text, and click them
  const homeNav = screen.getByText(queryHomeText);
  fireEvent.click(homeNav);

  

  const timelineNav = screen.getByText(queryTimeline);
  expect(timelineNav).toBeInTheDocument();

  const chartNav = screen.getByText(queryChart);
  expect(chartNav).toBeInTheDocument();

  const groupNav = screen.getByText(queryGroup);
  expect(groupNav).toBeInTheDocument();
});
