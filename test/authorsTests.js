const mocha = require('mocha');
const expect = require('chai').expect;
const cg = require('../src/crystalgazer');

describe("Authors", function(){
    it("Should get the authors ordered by files they are the main contributor", function(){
        // Get the files where an author has >= 60% of the commits
        const cgConfig = {
            workingDirectory : "test/testRepo",
            name: "authors"
        };

        const expected = [
            { author: "Author1", files: 2 }, // file1.js, file5.js
            { author: "Author4", files: 1}  // file4.js
        ];

        const result = cg.mainContributors(cgConfig, false);

        expect(result).to.have.ordered.deep.members(expected);
    });

    it("Should get the authors ordered by files that currently exist they are the main contributor", function(){
        // Get the files where an author has >= 60% of the commits
        const cgConfig = {
            workingDirectory : "test/testRepo",
            name: "authors"
        };

        const expected = [
            { author: "Author1", files: 2 } // file1.js
        ];

        const result = cg.mainContributors(cgConfig, true);

        expect(result).to.have.ordered.deep.members(expected);
    });

    it("Should get the files where the provided author is the main contributor", function(){
        // Get the files where an author has >= 60% of the commits
        const cgConfig = {
            workingDirectory : "test/testRepo",
            name: "authors"
        };

        const expected = [ "src/file1.js", "src/file5.js"];

        const result = cg.filesWhoseMainContributorIs("Author1", cgConfig, false);

        expect(result).to.have.ordered.deep.members(expected);
    });

    it("Should get the currently existing files where the provided author is the main contributor", function(){
        // Get the files where an author has >= 60% of the commits
        const cgConfig = {
            workingDirectory : "test/testRepo",
            name: "authors"
        };

        const expected = [ "src/file1.js", "src/file5.js"];

        const result = cg.filesWhoseMainContributorIs("Author1", cgConfig, true);

        expect(result).to.have.ordered.deep.members(expected);
    });

    it("Should get the authors with most files where they are the only author", function(){
        const cgConfig = {
            workingDirectory : "test/testRepo",
            name: "authors"
        };

        const expected = [ 
            { author: "Author4", files: 1}, // src/file5.js
            { author: "Author1", files: 1}, // src/file4.js
        ];

        const result = cg.onlyContributor(cgConfig, false);

        expect(result).to.have.ordered.deep.members(expected);
    });

    it("Should get the authors with most files that currently exist where they are the only author", function(){
        const cgConfig = {
            workingDirectory : "test/testRepo",
            name: "authors"
        };

        const expected = [ 
            { author: "Author1", files: 1}  // src/file5.js
        ];

        const result = cg.onlyContributor(cgConfig, true);

        expect(result).to.have.ordered.deep.members(expected);
    });

    it("Should get files where the provided author is the only author", function(){
        const cgConfig = {
            workingDirectory : "test/testRepo",
            name: "authors"
        };

        const expected = [ "src/file5.js" ];

        const result = cg.filesWhoseOnlyContributorIs("Author1", cgConfig, false);

        expect(result).to.have.ordered.deep.members(expected);
    });

    it("Should get the currently existing files where the provided author is the only author", function(){
        const cgConfig = {
            workingDirectory : "test/testRepo",
            name: "authors"
        };

        const expectedForAuthor4 = [ ];
        const resultForAuthor4 = cg.filesWhoseOnlyContributorIs("Author4", cgConfig, true);
        expect(resultForAuthor4).to.have.ordered.deep.members(expectedForAuthor4);

        const expectedForAuthor1 = [ "src/file5.js" ];
        const resultForAuthor1 = cg.filesWhoseOnlyContributorIs("Author1", cgConfig, true);
        expect(resultForAuthor1).to.have.ordered.deep.members(expectedForAuthor1);
    });

    xit("Should get the files that currently exist with a main contributor that is no longer in the project", function(){
        // Need to implement the team feature
    });
});