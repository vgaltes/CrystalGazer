"use strict"

const mocha = require('mocha');
const expect = require('chai').expect;
const cg = require('../src/crystalgazer');

describe("Calculate churn", function(){
    it("should get the churn of each file ordered by churn", function(){
        const cgConfig = {
            workingDirectory : "test/testRepo",
            name: "coupling"
        };

        const expected = [
            {
                file: 'src/file1.js',
                churn: 88
            },
            {
                file: 'src/file2.js',
                churn: 37
            },
            {
                file: 'src/file3.js',
                churn: -3
            },
            {
                file: 'src/file4.js',
                churn: -10
            }
        ];

        const result = cg.churn(cgConfig);

        expect(result).to.have.ordered.deep.members(expected);
    });
});