import React from "react";
import ReactDOM from "react-dom";
import { render, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import "@testing-library/jest-dom/extend-expect";
import Timeline from "../../src/components/Timeline";

import chrome from "sinon-chrome";
global.chrome = chrome;
// expect.extend({ toHaveClass });

afterEach(cleanup);

describe("Test if timeline renders without fail", () => {
  test("Render without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(<Timeline></Timeline>, div);
  });

  test("Testing if table is redered", () => {
    const { getByTestId } = render(<Timeline></Timeline>);
    const timeline = getByTestId("my-timeline");
    const table = getByTestId("my-table");

    expect(timeline).toContainElement(table);
  });
});
