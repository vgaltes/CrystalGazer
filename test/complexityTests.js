"use strict"

const mocha = require('mocha');
const expect = require('chai').expect;
const cg = require('../src/crystalgazer.js');
const git = require('../src/git.js');
const sinon = require('sinon');
const fs = require('fs');

describe("Complexity tests", function(){
    const getFileOnCommit = sinon.stub(git, 'getFileOnCommit');

    it("should call git as many times as commits", function(){
        const cgConfig = {
            workingDirectory : "test/testRepo",
            name: "numCommits1"
        };
        
        const fileName = "samples/Nancy.Demo.Authentication.Forms/MainModule.cs";
        cg.complexityOverTime(fileName);

        expect(getFileOnCommit.callCount).to.equal(2);
    });

    it("should get the complexity of the files", function(){
        const cgConfig = {
            workingDirectory : "test/testRepo",
            name: "numCommits1"
        };

        const aFile = fs.readFileSync('./test/testRepo/aFile.cs').toString();
        const anotherFile = fs.readFileSync('./test/testRepo/anotherFile.cs').toString();;

        const fileName = "samples/Nancy.Demo.Authentication.Forms/MainModule.cs";

        getFileOnCommit.withArgs(fileName, '.', 'c1d6a2c0acf324aa7f6c117593db6c7ab2628389').returns(aFile);
        getFileOnCommit.withArgs(fileName, '.', 'c1d6a2c0acf324aa7f6c117593db6c7ab2628390').returns(anotherFile);

        const expected = [{
            hash: 'c1d6a2c0acf324aa7f6c117593db6c7ab2628389',
            date: 'Sat May 7 10:49:46 2016',
            maxNumberOfTabs: 7,
            numberOfLines: 78
        },
        {
            hash: 'c1d6a2c0acf324aa7f6c117593db6c7ab2628390',
            date: 'Fri May 6 10:49:47 2016',
            maxNumberOfTabs: 3,
            numberOfLines: 48   
        }];
        
        cg.init(cgConfig);
        const result = cg.complexityOverTime(fileName);

        expect(result).to.have.ordered.deep.members(expected);
    });

    afterEach(function() {
        getFileOnCommit.reset();
    });
});