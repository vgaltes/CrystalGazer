"use strict"

const child_process = require('child_process');
const path = require('path');
const fs = require('fs');
const dateFns = require('date-fns');

const commitRegex = /\[(.*)\],(.*)/;
const newLine = "\n";
const fileDelimiter = newLine;
const tab = "\t";
const carrierReturn = "\r";
const invalidFileLines = ["\n", "", "\r"];
const datesSeparator = '==========';

let allCommits = [];
let after, before;

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

// TODO: remove?
let getFunctionCommitFrom = function(rawCommit){
    const diffLines = rawCommit[2].split(newLine).filter(function(line){
        return !line.startsWith('---') && !line.startsWith('+++');
    });

    const churn = diffLines.reduce(function(accum, line){
        if ( line.startsWith('+')) {
            accum += 1;
        }
        if ( line.startsWith('-')) {
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

// TODO: remove?
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

let getDatesInfoFrom = function(allRawCommits){
    for(var line of allRawCommits){
        const lineSplitted = line.split(':');
        if (lineSplitted[0] === 'after') after = lineSplitted[1];
        else if (lineSplitted[0] === 'before') before = lineSplitted[1];
    }
};

let prePendDates = function(file, after, before){
    let dateString = '';
    if (after){
        dateString += 'after:'+after+'\n';
    }
    if(before){
        dateString += 'before:'+before+'\n';
    }
    if (after || before){
        dateString += datesSeparator+'\n';
        var buffer = new Buffer(dateString);
        const logFile = fs.openSync(file, 'a+');
        fs.writeSync(logFile, buffer, 0, buffer.length, 0);
    }
};

//TODO: copied from crystalgazer.js => refactor?
let sortBy = function(list, sortFunction){
    return list.sort(function(a, b){
        return sortFunction(a, b);
    });
};

let getNewPath = function(filePath){
    return getPath(filePath, 1);
}

let getOldPath = function(filePath){
    return getPath(filePath, 0);
}

let getPath = function(filePath, position){
    const regexRename = /{(.*)}/;
    const parts = filePath.split(regexRename);
    if(parts.length > 1){
        parts[1] = parts[1].split(" => ")[position];
        return parts.join("").replace("//", "/");
    }
    else{
        return parts[0].split(" => ")[position]
    }
}

let applyRenaming = function(commits, renaming){
    for(let commit of commits){
        let renamed = false;
        commit.files = commit.files.map(function(file){
            if(renaming.old === file.path){
                file.path = renaming.new;
                renamed = true;
            }
            return file;
        });
        if(renamed){
            let a = 0;
        }
    }
}

let applyRenamings = function(commits, renamings){
    for(let renaming of renamings){
        applyRenaming(commits, renaming);
    }
}

let processRenamings = function(commits){
    var commitsToReturn = [];

    const orderedCommits = sortBy(commits, (a, b) => {
        const date1 = dateFns.parse(a.date);
        const date2 = dateFns.parse(b.date);
        return dateFns.compareAsc(date1, date2);
    });

    let renamings = [];

    for(var commit of orderedCommits){
        for(var file of commit.files){
            if ( file.path.indexOf("=>") >= 0 ){
                var newPath = getNewPath(file.path);
                var oldPath = getOldPath(file.path);
                renamings.push({old: oldPath, new:newPath});
                file.path = newPath;
            }
        }
    }

    applyRenamings(orderedCommits, renamings);
    

    return orderedCommits;
}

module.exports = {
    initFrom : function(logFileContents, invalidExtensionsContents, authorsFileContents, doRenamings){
        allCommits = [];
        const allRawCommits = logFileContents.split(commitRegex).splice(1);
        let invalidExtensions = getInvalidExtensionsFrom(invalidExtensionsContents);
        let authorsMappings = getAuthorsMappingFrom(authorsFileContents);

        getCommitsInfoFrom(allRawCommits, allCommits, invalidExtensions, authorsMappings);
        
        // TODO: keep the old name of the file for the mri and code evolution
        if (doRenamings){
            allCommits = processRenamings(allCommits);
        }

        const datesSplit = logFileContents.split(datesSeparator);
        if (datesSplit.length > 1){
            const datesPart = datesSplit[0].split(newLine);
            getDatesInfoFrom(datesPart);
        }        
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

        prePendDates(file, after, before);
    }
}