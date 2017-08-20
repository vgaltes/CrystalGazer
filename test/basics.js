"use strict"

const chai = require('chai');
const mocha = require('mocha');
const cg = require('../src/crystalgazer.js');
const expect = chai.expect;

describe("Basic operations", function(){
    it("should get the number of commits", function(){
        var cgConfig = {
            workingDirectory: "test",
            name: 'numCommits1'
        };

        cg.init(cgConfig);
        var result = cg.numberOfCommits();

        expect(result).to.equal(4);
    });

    it("should get the number of files changed", function(){
        var cgConfig = {
            workingDirectory: "test",
            name: 'numCommits1'
        };

        cg.init(cgConfig);
        var result = cg.numberOfFilesChanged();
        
        expect(result).to.equal(21);
    });
});

describe("Basic operations acceptance tests", function(){
    it("should get the number of commits", function(){
        var cgConfig = {
            workingDirectory: "test",
            name: 'nancy'
        };

        cg.init(cgConfig);
        var result = cg.numberOfCommits();

        expect(result).to.equal(5007);
    });

    it("should get the number of files changed", function(){
        var cgConfig = {
            workingDirectory: "test",
            name: 'nancy'
        };

        cg.init(cgConfig);
        var result = cg.numberOfFilesChanged();
        
        expect(result).to.equal(18223);
    });
});