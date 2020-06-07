module.exports = {
  testEnvironment: "<rootDir>/config/puppeteer-jest/puppeteer_environment.js",
  globalSetup: "<rootDir>/setup.js",
  globalTeardown: "<rootDir>/config/puppeteer-jest/teardown.js",
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/__mocks__/chromeMock.js",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/build/",
    "<rootDir>/public/",
  ],
  collectCoverage: true,
  collectCoverageFrom: ["**/*.{js, jsx}"],
  coveragePathIgnorePatterns: [
    "<rootDir>/build/",
    "<rootDir>/node_modules/",
    "<rootDir>/coverage/",
    "<rootDir>/src/images/",
    "<rootDir>/src/SVG/",
    "<rootDir>/src/setupTests.js",
    "<rootDir>/public/firebaseInit.js",
    "<rootDir>/src/serviceWorker.js",
    "<rootDir>/babel.config.js",
    "<rootDir>/out/",
    "<rootDir>/public/LandingPage/",
    "<rootDir>/__end2endTest__/",
  ],
  coverageReporters: ["json", "text", "text-summary", "html"],
  coverageThreshold: {
    global: {
      lines: 20,
      statements: 20,
    },
  },
  verbose: false,
  preset: "jest-puppeteer",
};
