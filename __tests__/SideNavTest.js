import React from "react";
import "babel-polyfill";
import App from "../src/App";
import renderer from "react-test-renderer";
const chrome = require("sinon-chrome");
window.chrome = chrome;
describe("need to take out snapshot", () => {
  test("delete later", () => {});
});
/*eslint-disable*/
// Function to find DOM components recursively
function findDOMComponent(component, searchName) {
  const child = Array.isArray(component) ? component[0] : component;

  console.log(child);

  if (!component.children || !component.children.length) {
    return null;
  }
  if (child.props.className && child.props.id) {
    return (
      child.props.className === searchName || child.props.id === searchName
    );
  } else if (child.props.className) {
    return child.props.className === searchName;
  } else {
    return child.props.id === searchName;
  }

  const findComponent = child.children.find((child) => {
    return !!findDOMComponent(child, searchName);
  });

  return findComponent;
}
