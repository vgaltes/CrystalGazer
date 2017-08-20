"use strict"

const fs = require('fs');
const path = require('path');

let currentConfiguration = "";
let allCommits = [];
const invalidFileLines = ["\n", "", "\r"];
const fileDelimiter = "\n";
const commitRegex = /\[(.*)\],(.*),(.*),(.*)/;

let commitDelimiter = function (element){
    return element.startsWith("\n") || element.startsWith("\r\n");
};

let getCommitFrom = function(lines){
    let rawFiles = lines[4].split(fileDelimiter);
    let files = rawFiles.filter(function(element){
        return invalidFileLines.indexOf(element) === -1;
    });

    return {
        hash: lines[0],
        author: lines[1],
        date: lines[2],
        comment: lines[3],
        files: files
    }
};

let getCommitsInfoFrom = function(lines, commits){
    let indexEndFirstGroup = lines.findIndex(commitDelimiter);
    
    if ( indexEndFirstGroup !== -1 ){
        let remainingLines = lines.splice(indexEndFirstGroup + 1);
        commits.push(getCommitFrom(lines));
        getCommitsInfoFrom(remainingLines, commits);
    }
};

module.exports = {    
    init(configuration){
        allCommits = [];
        currentConfiguration = configuration;
        let filePath = path.join(currentConfiguration.workingDirectory, './.cg', currentConfiguration.name + '.log');
        let fileContents = fs.readFileSync(filePath).toString();

        let allRawCommits = fileContents.split(commitRegex).splice(1);

        getCommitsInfoFrom(allRawCommits, allCommits);
    },
    numberOfCommits(){
        return allCommits.length;
    },
    numberOfFilesChanged(){
        return allCommits.reduce(function(numberOfFiles, commit){
            return numberOfFiles + commit.files.length;
        }, 0);
    }
};