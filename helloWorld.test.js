const {helloWorld} = require('./helloWorld');

test('Test HelloWorld', () => {
    expect(helloWorld()).toBe("Hello World!");
});
