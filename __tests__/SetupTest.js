import React from 'react';
import "babel-polyfill";
import App from '../src/App';
import renderer from 'react-test-renderer';

test('App is set up correctly', () => {
  const component = renderer.create(
    <App />,
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
