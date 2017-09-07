"use strict"

const child_process = require('child_process');
const path = require('path');

const commitRegex = /\[(.*)\],(.*)/;
const newLine = "\n";
const fileDelimiter = newLine;
const tab = "\t";
const carrierReturn = "\r";
const invalidFileLines = ["\n", "", "\r"];

let allCommits = [];

let commitDelimiter = function (element){
    return element.startsWith("\n") || element.startsWith("\r\n");
};

let getExtension = function(fileName){
    let extension = path.extname(fileName).substr(1);
    if(extension === '' && fileName.indexOf('.') !== -1){
        extension = fileName;
    }

    return extension;
};

let replaceAuthor = function(authorName, authorsMappings){
    const index = authorsMappings.findIndex(function(element){
        return element.original === authorName;
    });

    return index === -1 ? authorName : authorsMappings[index].replacement;
};

let getCommitFrom = function(lines, invalidExtensions, authorsMappings){
    let commitInfo = lines[1].split(',');
    let comment = commitInfo.splice(2).join();

    let rawFiles = lines[2].split(fileDelimiter);
    let files = rawFiles.filter(function(element){
        return invalidFileLines.indexOf(element) === -1;
    }).filter(function(element){
        const extension = getExtension(element);
        return invalidExtensions.indexOf(extension) === -1;
    });

    let validFiles = files.map(function(element){
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
        author: replaceAuthor(commitInfo[0], authorsMappings),
        date: commitInfo[1],
        comment: comment,
        files: validFiles
    }
};

let getCommitsInfoFrom = function (lines, commits, invalidExtensions, authorsMappings){
    let indexEndFirstGroup = lines.findIndex(commitDelimiter);
    let remainingLines = lines;

    while (indexEndFirstGroup !== -1){
        let remaining = lines.splice(indexEndFirstGroup + 1);
        if ( lines.length > 0){
            commits.push(getCommitFrom(lines, invalidExtensions, authorsMappings));
            lines = remaining;
            indexEndFirstGroup = lines.findIndex(commitDelimiter);
        }
    }
};

let getFunctionCommitFrom = function(rawCommit){
    const diffLines = rawCommit[2].split(newLine);
    const churn = diffLines.reduce(function(accum, line){
        if ( line.startsWith('+ ')) {
            accum += 1;
        }
        if ( line.startsWith('- ')) {
            accum -= 1;
        }
        return accum;
    }, 0);
    let commitInfo = rawCommit[1].split(',');

    return {
        hash: rawCommit[0],
        date: commitInfo[1],
        churn: churn
    }
}

let getFunctionCommitsInfoFrom = function (logFileContents, commits){
    let lines = logFileContents.split(commitRegex).splice(1);
    let indexEndFirstGroup = lines.findIndex(commitDelimiter);
    let remainingLines = lines;

    while (indexEndFirstGroup !== -1){
        let remaining = lines.splice(indexEndFirstGroup + 1);
        if ( lines.length > 0){
            commits.push(getFunctionCommitFrom(lines));
            lines = remaining;
            indexEndFirstGroup = lines.findIndex(commitDelimiter);
        }
    }
};

let getInvalidExtensionsFrom = function(invalidExtensionsContents){
    let invalidExtensions = [];
    if ( invalidExtensionsContents ){
        invalidExtensions = invalidExtensionsContents.split(newLine);
    }

    return invalidExtensions;
};

let getAuthorsMappingFrom = function(authorsContents){
    let authorsMapping = [];
    if ( authorsContents ){
        let authors = authorsContents.split(newLine);
        for(var author of authors){
            const authorMapping = author.split("->");
            authorsMapping.push({original: authorMapping[0], replacement: authorMapping[1]});
        }        
    }

    return authorsMapping;
};

let getDatesParameters = function(after, before){
    let dates = '';
    if (after){
        dates += ' --after ' + after;
    }

    if (before){
        dates += ' --before ' + before;
    }

    return dates;
};


module.exports = {
    initFrom : function(logFileContents, invalidExtensionsContents, authorsFileContents){
        allCommits = [];
        const allRawCommits = logFileContents.split(commitRegex).splice(1);
        let invalidExtensions = getInvalidExtensionsFrom(invalidExtensionsContents);
        let authorsMappings = getAuthorsMappingFrom(authorsFileContents);

        getCommitsInfoFrom(allRawCommits, allCommits, invalidExtensions, authorsMappings);
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
    createLog: function(file, workingDirectory, after, before){
        const dates = getDatesParameters(after, before);

        const command = "git log --pretty=format:'[%H],%aN,%ad,%s' --date=local --numstat" + dates +"  > " + file;

        child_process.execSync(command,{
            cwd: workingDirectory
          });
    },
    createFunctionLog: function(workingDirectory, file, method, after, before){
        const dates = getDatesParameters(after, before);
        const command = "git log --pretty=format:'[%H],%aN,%ad,%s' --date=local --numstat" + dates +" -L:" + method + ":" + file;

        const logResult = child_process.execSync(command,{
            cwd: workingDirectory
          }).toString();

        var a = 0;
        // parse function log
    }
}