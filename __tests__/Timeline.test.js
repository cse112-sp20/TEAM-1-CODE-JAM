import React from "react";
import renderer from "react-test-renderer";

import Timeline from "../src/components/Timeline";

const chrome = require("sinon-chrome");
window.chrome = chrome;

test("Timeline is set up correctly", () => {
  const component = renderer.create(<Timeline />);
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});

test("", () => {});
