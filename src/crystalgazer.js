"use strict"

const fs = require('fs');
const path = require('path');

let currentConfiguration = "";
let allCommits = [];
const invalidFileLines = ["\n", "", "\r"];
const fileDelimiter = "\n";
const commitRegex = /\[(.*)\],(.*)/;

//TODO: git log interaction can be moved to another module
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
        let rawFile = element.replace("\r", "");
        let fileInfo = rawFile.split("\t");
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
      if (seen.has(value.path)) continue outer;
      seen.add(value.path);
      result.push(value.path);
    }

    return result;
};

let getAllFilesFrom = function(commits){
    let allFiles = commits.reduce(function(files, commit){
        return files.concat(commit.files);
    }, []);

    return allFiles;
};

// https://stackoverflow.com/questions/12453057/node-js-count-the-number-of-lines-in-a-file
let getLinesOfFile = function(file){
    let filePath = path.join(currentConfiguration.workingDirectory, file)
    if (fs.existsSync(filePath)===false){
        return -1;
    }

    var data = fs.readFileSync(filePath);
    return data.toString().split('\n').length;
};

let getLinesFor = function(files){
    return files.map(function(file){
        return {
            file: file.path,
            lines: getLinesOfFile(file.path)
        };
    }).filter(function(file){
        return file.lines !== -1;
    });
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

let groupFilesByName = function(files){
    return files.reduce(function(acc, item) {  
        var index = acc.findIndex(function(element){
            return element.file === item.path;
        });
        if ( index === -1 ){
            acc.push({file: item.path, revisions: 1});
        }
        else{
            acc[index].revisions ++;
        }
        
        return acc;
    }, []);
};

let sortByNumberOfFiles = function(extensions){
    return sortBy(extensions, (a, b) => b.files - a.files);
};

let sortByNumberOfRevisions = function(files){
    return sortBy(files, (a,b) => b.revisions - a.revisions);
};

let sortByNumberOfLines = function(files){
    return sortBy(files, (a,b) => b.lines - a.lines);
};

let sortBy = function(list, sortFunction){
    return list.sort(function(a, b){
        return sortFunction(a, b);
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
    },
    revisionsByFile(){
        let allFiles = getAllFilesFrom(allCommits);
        let timesCommited = groupFilesByName(allFiles);
        let result = sortByNumberOfRevisions(timesCommited);

        return result;
    },
    linesByFile(){
        let allFiles = getAllFilesFrom(allCommits);
        let filesWithLines = getLinesFor(allFiles);
        let result = sortByNumberOfLines(filesWithLines);

        return result;
    }
};