"use strict"

const fs = require('fs');
const path = require('path');

let currentConfiguration = "";
let allCommits = [];
const invalidFileLines = ["\n", "", "\r"];
const fileDelimiter = "\n";
const commitRegex = /\[(.*)\],(.*)/;

let commitDelimiter = function (element){
    return element.startsWith("\n") || element.startsWith("\r\n");
};

let getCommitFrom = function(lines){
    if(lines[1].indexOf("Thu Apr 21 10:44:14 2016") !== -1){
        let a = 0;
    }
    let commitInfo = lines[1].split(',');
    let comment = commitInfo.splice(2).join();

    let rawFiles = lines[2].split(fileDelimiter);
    let validFiles = rawFiles.filter(function(element){
        return invalidFileLines.indexOf(element) === -1;
    });
    let files = validFiles.map(function(element){
        return element.replace("\r", "");
    });

    return {
        hash: lines[0],
        author: commitInfo[0],
        date: commitInfo[1],
        comment: comment,
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

//https://medium.com/@jakubsynowiec/unique-array-values-in-javascript-7c932682766c
let getUniqueFilesFrom = function(source){
    let length = source.length, result = [], seen = new Set();
    outer:  
    for (let index = 0; index < length; index++) {
      let value = source[index];
      if (seen.has(value)) continue outer;
      seen.add(value);
      result.push(value);
    }

    return result;
};

let getAllFilesFrom = function(commits){
    let allFiles = commits.reduce(function(files, commit){
        return files.concat(commit.files);
    }, []);

    return allFiles;
};

let groupFilesByExtension = function(uniqueFiles){
    return uniqueFiles.reduce(function(acc, item) {  
        var extension = path.extname(item).substr(1);
        var index = acc.findIndex(function(element){
            return element.extension === extension;
        });
        if ( index === -1 ){
            acc.push({extension: extension, files: 1});
        }
        else{
            acc[index].files ++;
        }
        
        return acc;
    }, []);
};

let sortByNumberOfFiles = function(extensions){
    return extensions.sort(function(a, b){
        return b.files - a.files;
    });
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
    },
    filesByType(){
        let allFiles = getAllFilesFrom(allCommits);
        let uniqueFiles = getUniqueFilesFrom(allFiles);
        let unsortedResult = groupFilesByExtension(uniqueFiles);
        let result = sortByNumberOfFiles(unsortedResult);    

        return result;
    },
    authors(){
        let authorsSet = new Set(allCommits.reduce(function(authors, commit){
            authors.push(commit.author);
            return authors;
        }, []));

        return [...authorsSet];
    }
};