"use strict"

const mocha = require('mocha');
const chai = require('chai');
const cg = require('../src/crystalgazer.js');
const expect = chai.expect;

describe("Hotspot analysis", function(){
    it("should get the number of revisions by file", function(){
        const cgConfig = {
            workingDirectory : "test/testRepo",
            name: "numCommits1"
        };

        const expected = [
            {
                file: "samples/Nancy.Demo.Authentication.Forms/MainModule.cs",
                revisions: 2
            },
            {
                file: "samples/Nancy.Demo.Authentication/MainModule.cs",
                revisions: 1
            },
            {
                file: "samples/Nancy.Demo.Authentication.Basic/SecureModule.cs",
                revisions: 1
            },
            {
                file: "samples/Nancy.Demo.Hosting.Aspnet/MainModule.js",
                revisions: 1
            },
            {
                file: "samples/Nancy.Demo.Authentication.Forms/PartlySecureModule.cs",
                revisions: 1
            },
            {
                file: "samples/Nancy.Demo.Authentication.Forms/SecureModule.cs",
                revisions: 1
            },
            {
                file: "samples/Nancy.Demo.Authentication.Stateless/AuthModule.cs",
                revisions: 1
            }
        ];

        let result = cg.revisionsByFile(cgConfig);

        expect(result).to.include.ordered.deep.members(expected);
    });

    it("should get the number of lines of each file", function(){
        const cgConfig = {
            workingDirectory : "test/testRepo",
            name: "numCommits1"
        };

        let expected = [
            {
                file: "samples/Nancy.Demo.Hosting.Aspnet/MainModule.js",
                lines: 40
            },
            {
                file: "samples/Nancy.Demo.Authentication.Stateless/AuthModule.cs",
                lines: 35
            },
            {
                file: "samples/Nancy.Demo.Authentication/MainModule.cs",
                lines: 25
            }];

        let result = cg.linesByFile(cgConfig);

        expect(result).to.have.ordered.deep.members(expected);
    });

    it("should get the number of authors by file", function(){
        const cgConfig = {
            workingDirectory : "test/testRepo",
            name: "numCommits1"
        };

        const expected = [
            {
                file: "samples/Nancy.Demo.Authentication.Forms/MainModule.cs",
                authors: 2
            },
            {
                file: "samples/Nancy.Demo.Authentication/MainModule.cs",
                authors: 1
            },
            {
                file: "samples/Nancy.Demo.Authentication.Basic/SecureModule.cs",
                authors: 1
            },
            {
                file: "samples/Nancy.Demo.Hosting.Aspnet/MainModule.js",
                authors: 1
            },
            {
                file: "samples/Nancy.Demo.Authentication.Forms/PartlySecureModule.cs",
                authors: 1
            },
            {
                file: "samples/Nancy.Demo.Authentication.Forms/SecureModule.cs",
                authors: 1
            },
            {
                file: "samples/Nancy.Demo.Authentication.Stateless/AuthModule.cs",
                authors: 1
            }
        ];

        let result = cg.authorsByFile(cgConfig);

        expect(result).to.include.ordered.deep.members(expected);
    });
});

describe("Hotspot analysis acceptance tests", function(){
    this.timeout(5000);
    it("should get the number of revisions by file", function(){
        const cgConfig = {
            workingDirectory : "test/testRepo",
            name: "nancy"
        };

        const expected = [
            {file: "src/Nancy/Nancy.csproj", revisions: 363},
            {file: "src/Nancy.Tests/Nancy.Tests.csproj", revisions: 207},
            {file: "src/Nancy.sln", revisions: 141},
            {file: "src/Nancy/NancyEngine.cs", revisions: 113}
        ];

        let result = cg.revisionsByFile(cgConfig);

        expect(result).to.include.ordered.deep.members(expected);
    });

    it("should get the number of lines of each file", function(){
        const cgConfig = {
            workingDirectory : "test/testRepo",
            name: "nancy"
        };

        let expected = [
            {
                file: "samples/Nancy.Demo.Authentication.Stateless/AuthModule.cs",
                lines: 35
            },
            {
                file: "samples/Nancy.Demo.Authentication/MainModule.cs",
                lines: 25
            }
        ];

        let result = cg.linesByFile(cgConfig);

        expect(result).to.have.ordered.deep.members(expected);
    });
});