"use strict"

const mocha = require('mocha');
const expect = require('chai').expect;
const cg = require('../src/crystalgazer');

// TODO: think about a bettern name for churn
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

    it("should get the number of files added and modified in each commit", function(){
        const cgConfig = {
            workingDirectory : "test/testRepo",
            name: "coupling"
        };

        const expected = [
            {
                hash: 'c1d6a2c0acf324aa7f6c117593db6c7ab2628394',
                date: 'Fri May 3 10:49:47 2016',
                added: 1,
                modified: 0
            },
            {
                hash: 'c1d6a2c0acf324aa7f6c117593db6c7ab2628393',
                date: 'Fri May 4 10:49:47 2016',
                added: 2,
                modified: 0
            },
            {
                hash: 'c1d6a2c0acf324aa7f6c117593db6c7ab2628392',
                date: 'Fri May 5 10:49:47 2016',
                added: 1,
                modified: 0
            },
            {
                hash: 'c1d6a2c0acf324aa7f6c117593db6c7ab2628391',
                date: 'Fri May 5 12:49:47 2016',
                added: 0,
                modified: 2
            },
            {
                hash: 'c1d6a2c0acf324aa7f6c117593db6c7ab2628390',
                date: 'Fri May 6 10:49:47 2016',
                added: 0,
                modified: 1
            },
            {
                hash: 'c1d6a2c0acf324aa7f6c117593db6c7ab2628389',
                date: 'Sat May 7 10:49:46 2016',
                added: 1,
                modified: 0
            },
            {
                hash: 'd33b630f676bdc1a25f8e101be999b50258a49f8',
                date: 'Wed May 18 12:30:51 2016',
                added: 0,
                modified: 2
            },
            {
                hash: '4d9c30e276d68424be67e8fc863b87730047683e',
                date: 'Thu May 19 13:06:54 2016',
                added: 0,
                modified: 2
            }       
        ];

        const result = cg.fileChurn(cgConfig);

        expect(result).to.have.ordered.deep.members(expected);
    });
});
