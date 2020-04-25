function helloWorld() {
    console.log("Hello World!");
    return "Hello World!";
}

const assert = require('assert');

it('sums numbers', () => {
    assert.equal(helloWorld(), "Hello World!");
});
