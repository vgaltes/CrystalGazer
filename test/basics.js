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

    it("should get the files by type", function(){
        var expected = [
            {extension: "cs", files: 14},
            {extension: "js", files: 6}            
        ];

        var cgConfig = {
            workingDirectory: "test",
            name: 'numCommits1'
        };

        cg.init(cgConfig);
        var result = cg.filesByType();

        expect(result).to.have.ordered.deep.members(expected);
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

    it("should get the files by type", function(){
        var expected = [
            {"extension": "cs", "files": 9917},
            {"extension": "csproj", "files": 1477},
            {"extension": "config", "files": 666},
            {"extension": "dll", "files": 401},
            {"extension": "cshtml", "files": 274},
            {"extension": "xml", "files": 268},
            {"extension": "spark", "files": 192},
            {"extension": "nuspec", "files": 150}
        ];

        var cgConfig = {
            workingDirectory: "test",
            name: 'nancy'
        };

        cg.init(cgConfig);
        var result = cg.filesByType();

        expect(result).to.include.ordered.deep.members(expected);
    });
});