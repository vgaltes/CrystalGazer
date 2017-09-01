"use strict"

const mocha = require('mocha');
const expect = require('chai').expect;
const cg = require('../src/crystalgazer');

describe("Coupling tests", function(){
    it("should get the coupling", function(){
        const cgConfig = {
            workingDirectory : "test/testRepo",
            name: "coupling"
        };

        const expected = [
            {
                file1: 'src/file2.js',
                file2: 'src/file1.js',
                coupling: 66.66666666666667
            },
            {
                file1: 'src/file3.js',
                file2: 'src/file1.js',
                coupling: 50
            },
            {
                file1: 'src/file3.js',
                file2: 'src/file2.js',
                coupling: 50
            },
            {
                file1: 'src/file1.js',
                file2: 'src/file2.js',
                coupling: 40.0
            },
            {
                file1: 'src/file2.js',
                file2: 'src/file3.js',
                coupling: 33.333333333333336
            },
            {
                file1: 'src/file1.js',
                file2: 'src/file3.js',
                coupling: 20.0
            }            
        ];

        const result = cg.coupling(cgConfig);

        expect(result).to.have.ordered.deep.members(expected);
    });

    it("should limit the files included in the coupling analysis", function(){
        const cgConfig = {
            workingDirectory : "test/testRepo",
            name: "coupling"
        };

        const expected = [
            {
                file1: 'src/file2.js',
                file2: 'src/file1.js',
                coupling: 66.66666666666667
            },
            {
                file1: 'src/file1.js',
                file2: 'src/file2.js',
                coupling: 40.0
            }          
        ];

        const result = cg.coupling(cgConfig, 3);

        expect(result).to.have.ordered.deep.members(expected);
    });
});