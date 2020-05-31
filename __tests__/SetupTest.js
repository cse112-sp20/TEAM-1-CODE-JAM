import '@testing-library/jest-dom'
import React from 'react';
import {render, fireEvent, screen} from '@testing-library/react';
import App from '../src/App';

test('Check that app is set up correctly.', () => {
  render(<App />)

  // query* functions will return the element or null if it cannot be found
  // get* functions will return the element or throw an error if it cannot be found
  // expect(screen.queryByText("Timeline")).toBeNull()

  // the queries can accept a regex to make your selectors more resilient to content tweaks and changes.
  // fireEvent.click(screen.getByLabelText(/show/i))

  // .toBeInTheDocument() is an assertion that comes from jest-dom
  // otherwise you could use .toBeDefined()
  // expect(screen.getByText(testMessage)).toBeInTheDocument()
})
