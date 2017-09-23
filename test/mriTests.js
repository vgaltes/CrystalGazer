"use strict"

const mocha = require('mocha');
const expect = require('chai').expect;
const fs = require('fs');
const mri = require('../src/mri');
const gitLog = require('../src/gitLog');
const rewire = require('rewire');
const cg = require('../src/crystalgazer');

xdescribe("Mri tests", function(){

    it("should detect functions", function(){
        this.timeout(5000);

        const expected = ["DiscoverTestsToExecute", "GetTestsThatCall", "GetTestsThatCall", "GetCallsInMethod", "GetTestMethodsInAssembly"];

        const result = mri.getCSharpFunctionNamesFrom('test/testRepo/aFile.cs');

        expect(result).to.have.ordered.deep.members(expected);
    });

    it("should detect functions in a file with regions", function(){
        this.timeout(5000);

        const result = mri.getCSharpFunctionNamesFrom('test/testRepo/ControllerActionInvokerTest.cs');

        expect(result.length).to.be.equal(70);
    });

    it("should throw an exception if the file doesn't exist", function(){
        const cgConfig = {
            workingDirectory : "test/testRepo",
            name: "numCommits1"
        };

        expect(() => cg.mri(cgConfig, "an/unexisting/file.cs")).to.throw("The file test/testRepo/an/unexisting/file.cs doesn't exist.");
    });

    it("should read after and before from the log", function(){
        const cgConfig = {
            workingDirectory : "test/testRepo",
            name: "withDates"
        };

        cg.init(cgConfig);

        // Check the dates of the commits
    });
});

describe("Mri acceptance tests", async function(){
    it("should work", function(){
        const cgConfig = {
            workingDirectory : "../Mvc",
            name: "functionName"
        };

        return cg.mri(cgConfig, "src/Microsoft.AspNetCore.Mvc.Core/Internal/ControllerActionInvoker.cs").then(function(result){
            let a = 0;
        }).catch(function(error){
            let a = 0;
        });
        let a = 0;
    });
});