"use strict"

const mocha = require('mocha');
const expect = require('chai').expect;
const fs = require('fs');
const mri = require('../src/mri');

describe("Detect CSharp functions", function(){
    it("should detect functions", function(){
        const expected = ["DiscoverTestsToExecute", "GetTestsThatCall", "GetTestsThatCall", "GetCallsInMethod", "GetTestMethodsInAssembly"];

        const code = fs.readFileSync('test/testRepo/aFile.cs').toString();
        const result = mri.getCSharpFunctionNamesFrom(code);

        expect(result).to.have.ordered.deep.members(expected);
    });
});
