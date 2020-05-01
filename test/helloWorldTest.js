const {helloWorld} = require('../helloWorld');
const assert = require('assert');

describe('Test HelloWorld', () => {
    it('Should return HelloWorld', () => {
        assert.equal(helloWorld(), "Hello World!");
    });
});