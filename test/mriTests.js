"use strict"

const mocha = require('mocha');
const expect = require('chai').expect;
const fs = require('fs');
const mri = require('../src/mri');
const gitLog = require('../src/gitLog');
const rewire = require('rewire');
const cg = require('../src/crystalgazer');

describe("Mri tests", function(){

    it("should detect functions", function(){
        this.timeout(5000);

        const expected = ["DiscoverTestsToExecute", "GetTestsThatCall", "GetTestsThatCall", "GetCallsInMethod", "GetTestMethodsInAssembly"];

        const code = fs.readFileSync('test/testRepo/aFile.cs').toString();
        const result = mri.getCSharpFunctionNamesFrom(code);

        expect(result).to.have.ordered.deep.members(expected);
    });

    it("should parse log -l output", function(){
        const gitLogRewired = rewire('../src/gitLog.js');
        const useMvcLog = fs.readFileSync('test/functionLogs/useMvc.log').toString();
        const getFunctionCommitsInfoFrom = gitLogRewired.__get__('getFunctionCommitsInfoFrom');
        let commits = [];
        getFunctionCommitsInfoFrom(useMvcLog, commits);

        const expected = [
            { "hash": "55b72c04bf5a4665c7e549219ba408b06f084eea", "date": "Tue Oct 20 04:38:01 2015", "churn": 0 },
            { "hash": "3a876e387f1d7816264a0444c91efe41bde99eaa", "date": "Thu Oct 1 05:04:56 2015", "churn": 5 },
            { "hash": "f2fed5e9408562f1c888f772157ec9d88047ab9e", "date": "Tue Apr 28 21:34:22 2015", "churn": 1 }, 
            { "hash": "3ca018375ac51fc2b0fad9b9e387aebb3324be11", "date": "Tue Apr 28 00:32:03 2015", "churn": 0 }, 
            { "hash": "53f3a91f01c740f3cbf5209a9eeeefd614a6cbc2", "date": "Mon Apr 20 18:28:11 2015", "churn": 5 }, 
            { "hash": "071c6973182f2bcbee580764efd6e6717cd72ebf", "date": "Fri Jan 23 20:50:21 2015", "churn": -4 }, 
            { "hash": "85ad1aeb96b95ec48ddb8abd0c4a3061206bc8ef", "date": "Wed Sep 10 22:12:08 2014", "churn": 0 }, 
            { "hash": "ecbc179d76cd16037306afc39438eedf4895a0a5", "date": "Thu Jun 5 04:06:42 2014", "churn": 0 }, 
            { "hash": "55f4dc4f534e41d33ba08fe97d30f7e2f2887db0", "date": "Thu May 8 23:45:10 2014", "churn": 1 }, 
            { "hash": "454129587241d62764c489874a8eb2fd4aeab761", "date": "Wed Apr 30 23:42:59 2014", "churn": 0 }, 
            { "hash": "488ec2f52e8254da88453b8859bf1775c6812318", "date": "Wed Apr 30 02:00:49 2014", "churn": 11 }];

        expect(commits).to.have.ordered.deep.members(expected);
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

        // Check the dates of the commit
    });

    it("should write the dates in the log", function(){
        const cgConfig = {
            workingDirectory : "test/testRepo",
            name: "withNoDates"
        };

        cg.init(cgConfig);

        //delete log file
    });
});
