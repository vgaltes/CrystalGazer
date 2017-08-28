"use strict"

const mocha = require('mocha');
const expect = require('chai').expect;
const cg = require('../src/crystalgazer');
const gitLog = require('../src/gitLog');
const sinon = require('sinon');

describe("Check git", function(){
    const gitLogCreateLog = sinon.spy(gitLog, 'createLog');

    it("should throw an error if not running in the repository root folder", function(){
        const cgConfig = {
            workingDirectory: 'test/testRepoNoGit',
            name: 'test'
        };

        expect(() => cg.init(cgConfig)).to.throw('Running Crystal Gazer in a folder that is not the root of a repository.');
    });

    it("should'n run git log if the log file already exists", function(){
        const cgConfig = {
            workingDirectory: 'test/testRepo',
            name: 'numCommits1'
        };

        cg.init(cgConfig);

        expect(gitLogCreateLog.calledOnce).to.equal(false);
    });

    it("should run git log if the log file doesn't exist", function(){
        const cgConfig = {
            workingDirectory: 'test/testRepo',
            name: 'newConfig'
        };

        try{
            cg.init(cgConfig);
        }
        catch(e){
            // we don't care about other errors.
        }

        expect(gitLogCreateLog.calledOnce).to.equal(true);
    });

    afterEach(function(){
        gitLogCreateLog.reset();
    });
});