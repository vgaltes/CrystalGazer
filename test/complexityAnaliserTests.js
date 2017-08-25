"use strict"

const mocha = require('mocha');
const expect = require('chai').expect;
const complexity = require('../src/complexityAnaliser.js');
const fs = require('fs');

describe("Number of lines", function(){
    it("should get the number of lines", function(){
        const file = fs.readFileSync('./test/testRepo/aFile.cs');
        const numberOfLines = complexity.numberOfLines(file);

        expect(numberOfLines).to.equal(78);
    });

    it("should get the maximum number of tabs", function(){
        const file = fs.readFileSync('./test/testRepo/aFile.cs');
        const maxNumberOfTabs = complexity.maxNumberOfTabs(file);

        expect(maxNumberOfTabs).to.equal(7);
    });
});
