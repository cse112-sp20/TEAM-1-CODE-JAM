import React from "react";
import ReactDOM from "react-dom";
import { render, cleanup } from "@testing-library/react";
import "jest-dom/extend-expect";

import Timeline from "../src/components/Timeline";

import chrome from "sinon-chrome";
global.chrome = chrome;

afterEach(cleanup);

describe("Test if timeline renders without fail", () => {
  test("Render without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(<Timeline></Timeline>, div);
  });
});
