"use strict"

const mocha = require('mocha');
const chai = require('chai');
const cg = require('../src/crystalgazer.js');
const expect = chai.expect;

describe("Hotspot analysis", function(){
    it("should get the number of revisions by file", function(){
        const cgConfig = {
            workingDirectory : "test",
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

        cg.init(cgConfig);
        let result = cg.revisionsByFile();

        expect(result).to.include.ordered.deep.members(expected);
    });

});

describe("Hotspot analysis acceptance tests", function(){
    it("should get the number of revisions by file", function(){
        const cgConfig = {
            workingDirectory : "test",
            name: "nancy"
        };

        const expected = [
            {file: "src/Nancy/Nancy.csproj", revisions: 363},
            {file: "src/Nancy.Tests/Nancy.Tests.csproj", revisions: 207},
            {file: "src/Nancy.sln", revisions: 141},
            {file: "src/Nancy/NancyEngine.cs", revisions: 113}
        ];

        cg.init(cgConfig);
        let result = cg.revisionsByFile();

        expect(result).to.include.ordered.deep.members(expected);
    });

});