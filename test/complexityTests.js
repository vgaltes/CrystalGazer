"use strict"

const mocha = require('mocha');
const expect = require('chai').expect;
const cg = require('../src/crystalgazer.js');

xdescribe("Complexity tests", function(){
    it("should get the complexity of a file", function(){
        const cgConfig = {
            workingDirectory : "test/testRepo",
            name: "numCommits1"
        };
        const fileName = "samples/Nancy.Demo.Authentication.Forms/MainModule.cs";
        const expected = [];
    
        cg.init(cgConfig);
        const result = cg.complexityOverTime(fileName);
    
        expect(result).to.include.ordered.deep.members(expected);
    });    
});