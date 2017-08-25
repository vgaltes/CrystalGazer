"use strict"

const fs = require('fs');
const path = require('path');
const complexity = require('../src/complexityAnaliser.js');
const gitInfo = require('../src/gitInfo.js');

let currentConfiguration = "";


//TODO: git log interaction can be moved to another module

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
    return gitInfo.files();
};

let getAllFilesWithCommitInformation = function(commits){
    return commits.filter(function(commit){
            return commit.files.length > 0;
        }).map(function(commit){
            let files = commit.files.map(function(file){
                return {
                    file: file.path,
                    hash: commit.hash,
                    date: commit.date,
                    author: commit.author
                };
            });
            return files;
    }).reduce(function(accum, element){
        return accum.concat(element);
    }, []);
};

let groupCommitsByFile = function(files){
    return files.reduce(function(acc, file){
        const index = acc.findIndex(function(element){
            if ( element.length === 0){
                return false;
            }
            if( element[0].file === file.file ){
                return true;
            } else {
                return false;
            }
        });

        if (index === -1){
            acc.push([file]);
        }
        else{
            acc[index].push(file);
        }

        return acc;
    }, []);
};

let getAllCommitsByFileFrom = function(commits){
    let allFilesByCommit = getAllFilesWithCommitInformation(commits);
    return groupCommitsByFile(allFilesByCommit);    
};

let getAllCommitsFor = function(commits, filePath){
    let commitsForFile = commits.filter(function(element){
        let fileIndex = element.files.findIndex(function(file){
            return file.path === filePath;
        });

        return fileIndex !== -1;
    }).map(function(element){
        return {
            hash: element.hash,
            date: element.date
        };
    });

    return commitsForFile;
};

// https://stackoverflow.com/questions/12453057/node-js-count-the-number-of-lines-in-a-file
let getLinesOfFile = function(file){
    const filePath = path.join(currentConfiguration.workingDirectory, file)
    if (fs.existsSync(filePath)===false){
        return -1;
    }

    const data = fs.readFileSync(filePath);
    return complexity.numberOfLines(data);
};

let getLinesFor = function(files){
    return files.map(function(file){
        return {
            file: file,
            lines: getLinesOfFile(file)
        };
    }).filter(function(file){
        return file.lines !== -1;
    });
};

let groupFilesByExtension = function(uniqueFiles){
    return uniqueFiles.reduce(function(acc, item) {  
        const extension = path.extname(item).substr(1);
        const index = acc.findIndex(function(element){
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
        const index = acc.findIndex(function(element){
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

let getComplexityFor = function(commits, filePath){
    // return commits.map(function(commit){
    //     const file = git.getFileRevision(commit.hash, filePath);
    //     const tabs = complexity.maxNumberOfTabs(file);
    //     const lines = complexity.numberOfLines(file);
    //     return {
    //         hash: commit.hash,
    //         date: commit.date,
    //         maxNumberOfTabs: maxNumberOfTabs,
    //         numberOfLines: numberOfLines
    //     };
    // });
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

let sortByNumberOfCommits = function(files){
    return sortBy(files, (a, b) => b.length - a.length);
};

let sortBy = function(list, sortFunction){
    return list.sort(function(a, b){
        return sortFunction(a, b);
    });
};

module.exports = {    
    init(configuration){
        gitInfo.allCommits = [];
        currentConfiguration = configuration;
        const filePath = path.join(currentConfiguration.workingDirectory, './.cg', currentConfiguration.name + '.log');
        const fileContents = fs.readFileSync(filePath).toString();

        gitInfo.initFrom(fileContents);
    },
    numberOfCommits(){
        return gitInfo.commits().length;
    },
    numberOfFilesChanged(){
        return gitInfo.commits().reduce(function(numberOfFiles, commit){
            return numberOfFiles + commit.files.length;
        }, 0);
    },
    filesByType(){
        const allFiles = gitInfo.files();
        const uniqueFiles = getUniqueFilesFrom(allFiles);
        const unsortedResult = groupFilesByExtension(uniqueFiles);
        const result = sortByNumberOfFiles(unsortedResult);    

        return result;
    },
    authors(){
        return gitInfo.authors()
    },
    revisionsByFile(){
        const allFiles = gitInfo.files();
        const timesCommited = groupFilesByName(allFiles);
        const result = sortByNumberOfRevisions(timesCommited);

        return result;
    },
    linesByFile(){
        const allFiles = gitInfo.files();
        const uniqueFiles = getUniqueFilesFrom(allFiles);
        const filesWithLines = getLinesFor(uniqueFiles);
        const result = sortByNumberOfLines(filesWithLines);

        return result;
    },
    authorsByFile(){
        const allFiles = getAllCommitsByFileFrom(gitInfo.commits());
        const sortedFiles = sortByNumberOfCommits(allFiles);
        const result = sortedFiles.map(function(element){
            return {
                file: element[0].file,
                authors: element.length
            };
        });
        return result;
    },
    complexityOverTime(filePath){
        const allCommitsForFile = getAllCommitsFor(gitInfo.commits(), filePath);
        const complexity = getComplexityFor(allCommitsForFile, filePath);

        return complexity;
    }
};