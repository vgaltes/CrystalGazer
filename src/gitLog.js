"use strict"

const child_process = require('child_process');

const commitRegex = /\[(.*)\],(.*)/;
const fileDelimiter = "\n";
const tab = "\t";
const carrierReturn = "\r";
const invalidFileLines = ["\n", "", "\r"];

let allCommits = [];

let commitDelimiter = function (element){
    return element.startsWith("\n") || element.startsWith("\r\n");
};

let getCommitFrom = function(lines){
    let commitInfo = lines[1].split(',');
    let comment = commitInfo.splice(2).join();

    let rawFiles = lines[2].split(fileDelimiter);
    let validFiles = rawFiles.filter(function(element){
        return invalidFileLines.indexOf(element) === -1;
    });
    let files = validFiles.map(function(element){
        let rawFile = element.replace(carrierReturn, "");
        let fileInfo = rawFile.split(tab);
        return {
            added: fileInfo[0],
            removed: fileInfo[1],
            path: fileInfo[2]
        }
    });

    return {
        hash: lines[0],
        author: commitInfo[0],
        date: commitInfo[1],
        comment: comment,
        files: files
    }
};

let getCommitsInfoFrom = function getCommitsInfoFrom (lines, commits){
    let indexEndFirstGroup = lines.findIndex(commitDelimiter);
    
    if ( indexEndFirstGroup !== -1 ){
        let remainingLines = lines.splice(indexEndFirstGroup + 1);
        commits.push(getCommitFrom(lines));
        getCommitsInfoFrom(remainingLines, commits);
    }
}

module.exports = {
    initFrom : function(logFileContents){
        allCommits = [];
        const allRawCommits = logFileContents.split(commitRegex).splice(1);
        getCommitsInfoFrom(allRawCommits, allCommits);
    },
    commits : function(){
        return allCommits.slice();
    },
    authors: function(){
        const authorsSet = new Set(allCommits.reduce(function(authors, commit){
            authors.push(commit.author);
            return authors;
        }, []));

        return [...authorsSet];
    },
    files: function(){
        let allFiles = allCommits.reduce(function(files, commit){
            return files.concat(commit.files);
        }, []);
    
        return allFiles;
    },
    createLog: function(file, workingDirectory){
        const command = "git log --pretty=format:'[%H],%aN,%ad,%s' --date=local --numstat > " + file;

        child_process.execSync(command,{
            cwd: workingDirectory
          });
    }
}