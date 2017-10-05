"use strict"

const fs = require('fs');
const path = require('path');
const complexity = require('../src/complexityAnaliser');
const gitLog = require('../src/gitLog');
const git = require('../src/git');
const dateFns = require('date-fns');
const combinatorics = require('js-combinatorics');
const mri = require('../src/mri');

let currentConfiguration = "";

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
    return gitLog.files();
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
                    author: commit.author,
                    added: file.added,
                    removed: file.removed
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
        const fileName = path.basename(item);
        let extension = path.extname(fileName).substr(1);
        if(extension === '' && fileName.indexOf('.') !== -1){
            extension = fileName;
        }
        
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

let groupCommitsByFileName = function(commits){
    return commits.reduce(function(acc, item) {  
        for(var file of item.files){
            const index = acc.findIndex(function(element){
                return element.file === file.path;
            });
            if ( index === -1 ){
                acc.push({file: file.path, authors: new Set().add(item.author)});
            }
            else{
                acc[index].authors.add(item.author);
            }
        }
        
        
        return acc;
    }, []);
};

let getComplexityFor = function(commits, filePath, workingDirectory){
    const promises = commits.map(async function(commit){
        const file = await git.getFileOnCommit(filePath, workingDirectory, commit.hash); 

        if (file && file.length > 0){
            const tabs = complexity.maxNumberOfTabs(file);
            const lines = complexity.numberOfLines(file);
            return {
                hash: commit.hash,
                date: commit.date,
                maxNumberOfTabs: tabs,
                numberOfLines: lines
            };
        }
        else{
            return {};
        }
    });

    return Promise.all(promises);
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

let sortByNumberOfAuthors = function(files){
    return sortBy(files, (a, b) => b.authors.size - a.authors.size);
};

let sortBy = function(list, sortFunction){
    return list.sort(function(a, b){
        return sortFunction(a, b);
    });
};

let fileOrDirectoryExists = function(item){
    try {
        fs.statSync(item);
        return true;
    } catch(e) {
        return false;
    }
};

let checkIsRepositoryRootFolder = function(directory){
    const gitFolder = path.join(directory, './.git');
    if ( !fileOrDirectoryExists(gitFolder)){
        throw "Can't initialize Crystal Gazer in a folder that is not the root of a repository.'";
    }
};

let createFileIfItDoesntExist = function(filePath){
    if(!fileOrDirectoryExists(filePath)){
        fs.closeSync(fs.openSync(filePath, 'w'));
    }
};

let createLogIfItDoesntExist = function(configuration, after, before){
    const cgFolder = path.join(configuration.workingDirectory, './.cg');
    if(!fileOrDirectoryExists(cgFolder)){
        fs.mkdirSync(cgFolder);
    }

    const filePath = path.join(cgFolder, configuration.name + '.log');
    if(!fileOrDirectoryExists(filePath)){
        gitLog.createLog(filePath, configuration.workingDirectory, after, before);
    }

    const invalidExtensionsFilePath = path.join(cgFolder, configuration.name + '.ignore');
    createFileIfItDoesntExist(invalidExtensionsFilePath);

    const authorsFilePath = path.join(cgFolder, configuration.name + '.authors');
    createFileIfItDoesntExist(authorsFilePath);

    return { logFile: filePath, ignoreFile: invalidExtensionsFilePath, authorsFile: authorsFilePath};
};

let resetConfiguration = function(configuration){
    gitLog.allCommits = [];
    currentConfiguration = configuration;
};

let getCombinations = function(files){
    const baseCombinations = combinatorics.combination(files, 2);
    let combinations = [];
    var combination;
    while(combination = baseCombinations.next()){
        combinations.push(combination);
        combinations.push([combination[1], combination[0]]);
    }

    return combinations;
};

let getCouplings = function(configuration, threshold){
    const allFiles = gitLog.files().filter(fileExists(configuration, file => file.path));
    const timesCommited = 
        groupFilesByName(allFiles).filter(function(element){
            return element.revisions >= threshold;
        });

    let couplings = [];

    for(var commit of gitLog.commits()){
        const filesToStudy = commit.files.filter(function(file){
            const index = timesCommited.findIndex(function(element){
                return element.file == file.path;
            });

            return index !== -1;
        });

        if ( filesToStudy.length > 1 ){
            const combinations = getCombinations(filesToStudy);
            for(var combination of combinations){
                const index = couplings.findIndex(function(element){
                    return element.file1 === combination[0].path 
                        && element.file2 === combination[1].path;
                });

                if(index === -1){
                    couplings.push({file1: combination[0].path, file2:combination[1].path, times: 1})
                }
                else{
                    couplings[index].times++;
                }

            }
        }
    }

    return couplings.map(function(item){
        const timesFileWasCommited = timesCommited.find(function(element){
            return element.file === item.file1;
        }).revisions;

        return {file1: item.file1, file2: item.file2, coupling: item.times * 100.0 / timesFileWasCommited};
    }).sort(function(item1, item2){
        return item2.coupling - item1.coupling;
    });
};

let getChurnNumber = function(number){
    return Number(number);
};

let getChurn = function(configuration){
    const allFiles = getAllCommitsByFileFrom(gitLog.commits());
    
    const churns = allFiles.filter(function(element){
            return element[0].added !== '-';
        }).map(function(element){
            const churn = element.reduce(function(acc, item){
                return acc + getChurnNumber(item.added) - getChurnNumber(item.removed);
            }, 0);

        return {
            file: element[0].file,
            churn: churn
        }
        });


    return sortBy(churns, (a, b) => b.churn - a.churn);
};

let getFileChurn = function(configuration){
    const orderedCommits = sortBy(gitLog.commits(), (a, b) => {
        const date1 = dateFns.parse(a.date);
        const date2 = dateFns.parse(b.date);
        return dateFns.compareAsc(date1, date2);
    });

    let alreadyAddedFiles = [];
    let commitFileChurn = [];

    for(var commit of orderedCommits){
        let filesAdded = 0;
        let filesModified = 0;

        for(var file of commit.files){
            const index = alreadyAddedFiles.findIndex(function(element){
                return element === file.path;
            });

            if (index === -1){
                alreadyAddedFiles.push(file.path);
                filesAdded++;
            }
            else{
                filesModified++;
            }
        }

        commitFileChurn.push(
            {
                hash: commit.hash,
                date: commit.date,
                added: filesAdded,
                modified: filesModified
            });
    }
    return commitFileChurn;
};

let checkFileExists = function(workingDirectory, file) {
    const filePath = path.join(workingDirectory, file);

    if(!fileOrDirectoryExists(filePath)){
        throw 'The file ' + filePath + " doesn't exist."
    }
};

let saveFile = function(fileContents, file, commit, workingDirectory){
    const baseName = path.basename(file);
    const fileName = baseName + "." + commit;
    const tempFolder = path.join(workingDirectory, '.cg', 'temp');
    if(!fileOrDirectoryExists(tempFolder)){
        fs.mkdirSync(tempFolder);
    };

    const filePath = path.join(tempFolder, fileName);
    fs.writeFileSync(filePath, fileContents);
    
    return filePath;
};

let getPairsFrom = function(items){
    const pairs = [];

    for(var i = 0; i < items.length -1; i++){
        pairs.push({
            filePath1: items[i],
            filePath2: items[i+1]
        });
    }

    return pairs;
};

let getMriSummaryFor = function(configuration, file, functionName){
    const commitList = getAllCommitsFor(gitLog.commits(), file);
    
    const promises = commitList.map(async function(item){
        const fileContents = await git.getFileOnCommit(file, configuration.workingDirectory, item.hash);
        const filePath = saveFile(fileContents, file, item.hash, configuration.workingDirectory);
        return filePath;
    });

    return Promise.all(promises).then(function(fileRevisions){
        const pairs = getPairsFrom(fileRevisions);

        const mriSummary = pairs.map(function(item){
            const functionCommits = mri.getCSharpFunctionModifications(item.filePath1, item.filePath2, functionName);
            return functionCommits;
        });
        
        const aggregatedChurn = mriSummary.reduce(function(accum, element){
            return accum + element.churn;
        }, 0);

        return {
            method: functionName,
            revisions: mriSummary.filter(function(item){return item.hasChanged === "True"}).length,
            churn: aggregatedChurn
        };
    });    
};

let getMriSummary = function(configuration, file){
    const mriSummary = [];
    const filePath = path.join(configuration.workingDirectory, file);

    if(!fileOrDirectoryExists(filePath)){
        throw 'The file ' + filePath + " doesn't exist."
    }
    
    const functionNames = mri.getCSharpFunctionNamesFrom(filePath);
    const promises = functionNames.map(async function(functionName){
        const functionSummary = await getMriSummaryFor(configuration, file, functionName);
        return functionSummary;
    });
    
    return Promise.all(promises).then(function(result){
        const orderedMriSummary = sortByNumberOfRevisions(result);
        return orderedMriSummary;
    });    
}

function fileExists(configuration, pathProperty) {
    return function(file) {
        const filePath = path.join(configuration.workingDirectory, pathProperty(file));
        return fileOrDirectoryExists(filePath);
    };
}

let getAuthorWithMoreApportations = function(commits){
    let authors = [];
    for(var commit of commits){
        let authorIndex = authors.findIndex(function(element){
            return element.author === commit.author;
        });
        if(authorIndex !== -1){
            authors[authorIndex].commits += 1;
        }
        else{
            authors.push({author: commit.author, commits: 1});
        }
    }

    const orderedAuthors = authors.sort(function(a1, a2){
        return a2.commits - a1.commits;
    });

    return orderedAuthors[0];
}

let getMainContributorsByFile = function(configuration, filterByExisting, threshold){
    const commitsByFile = getAllCommitsByFileFrom(gitLog.commits());
    const filesWithMainContributors = commitsByFile.reduce(function(accum, commits){
        let authorApportations = getAuthorWithMoreApportations(commits);
        if(authorApportations.commits / commits.length >= threshold){
            accum.push({ file: commits[0].file, author: authorApportations.author });
        }
        return accum;
    }, []);

    return filesWithMainContributors;
}

let getMainContributors = function(configuration, filterByExisting){
    const threshold = 0.6;
    return getContributors(configuration, filterByExisting, threshold)
            .sort(function(a, b){
                return b.files - a.files;
            });
}

let getOnlyContributors = function(configuration, filterByExisting){
    const threshold = 1.0;
    return getContributors(configuration, filterByExisting, threshold)
            .sort(function(a, b){
                return b.files - a.files;
            });;
}

let getContributors = function(configuration, filterByExisting, threshold){
    const mainContributorsByFile = getMainContributorsByFile(configuration, filterByExisting, threshold);
    const mainContributors = mainContributorsByFile.reduce(function(accum, contribution){
        if(filterByExisting && !fileExists(configuration, file => file.file)(contribution)){
            return accum;
        }

        const authorIndex = accum.findIndex(function(element){
            return element.author === contribution.author;
        });

        if (authorIndex === -1){
            accum.push({ author: contribution.author, files: 1});
        }
        else{
            accum[authorIndex].files += 1;
        }
        return accum;
    }, []);

    return mainContributors;
}

let getFilesWhoseContributorIs = function(author, configuration, filterByExisting, threshold){
    const contributionsByFile = getMainContributorsByFile(configuration, filterByExisting, threshold);
    const filesForAuthor = contributionsByFile.reduce(function(accum, element){
        if(filterByExisting && !fileExists(configuration, file => file.file)(element)){
            return accum;
        }

        if ( element.author === author){
            accum.push(element.file);
        }

        return accum;
    }, []);

    return filesForAuthor;
}

let getFilesWhoseMainContributorIs = function(author, configuration, filterByExisting){
    const threshold = 0.6;

    return getFilesWhoseContributorIs(author, configuration, filterByExisting, threshold);
}

let getFilesWhoseOnlyContributorIs = function(author, configuration, filterByExisting){
    const threshold = 1.0;

    return getFilesWhoseContributorIs(author, configuration, filterByExisting, threshold);
}

module.exports = {    
    init(configuration, after, before, doRenamings = true){
        checkIsRepositoryRootFolder(configuration.workingDirectory);
        const paths = createLogIfItDoesntExist(configuration, after, before);
        resetConfiguration(configuration);
        
        const logFileContents = fs.readFileSync(paths.logFile).toString();
        const ignoreFileContents = fs.readFileSync(paths.ignoreFile).toString();
        const authorsFileContents = fs.readFileSync(paths.authorsFile).toString();
        gitLog.initFrom(logFileContents, ignoreFileContents, authorsFileContents, doRenamings);
    },
    numberOfCommits(configuration){
        this.init(configuration);
        return gitLog.commits().length;
    },
    numberOfFilesChanged(configuration){
        this.init(configuration);

        return gitLog.commits().reduce(function(numberOfFiles, commit){
            return numberOfFiles + commit.files.length;
        }, 0);
    },
    filesByType(configuration){
        this.init(configuration);

        const allFiles = gitLog.files();
        const uniqueFiles = getUniqueFilesFrom(allFiles);
        const unsortedResult = groupFilesByExtension(uniqueFiles);
        const result = sortByNumberOfFiles(unsortedResult);    

        return result;
    },
    authors(configuration){
        this.init(configuration);

        return gitLog.authors()
    },
    revisionsByFile(configuration){
        this.init(configuration);

        const allFiles = gitLog.files().filter(fileExists(configuration, file => file.path));
        
        const timesCommited = groupFilesByName(allFiles);
        const result = sortByNumberOfRevisions(timesCommited);

        return result;
    },
    linesByFile(configuration){
        this.init(configuration);

        const allFiles = gitLog.files();
        const uniqueFiles = getUniqueFilesFrom(allFiles);
        const filesWithLines = getLinesFor(uniqueFiles);
        const result = sortByNumberOfLines(filesWithLines);

        return result;
    },
    authorsByFile(configuration){
        this.init(configuration);

        const allCommits = gitLog.commits();
        const files = groupCommitsByFileName(allCommits)
            .filter(fileExists(configuration, file => file.file));
        const sortedFiles = sortByNumberOfAuthors(files);
        const result = sortedFiles.map(function(element){
            return {
                file: element.file,
                authors: element.authors.size
            };
        });
        return result;
    },
    complexityOverTime(configuration, filePath){
        this.init(configuration, undefined, undefined, false);

        const allCommitsForFile = getAllCommitsFor(gitLog.commits(), filePath);
        return getComplexityFor(allCommitsForFile, filePath, configuration.workingDirectory).then(function(results){
            return results.sort(function(c1, c2){
                const date1 = dateFns.parse(c1.date);
                const date2 = dateFns.parse(c2.date);
                return dateFns.compareAsc(date1, date2);
            });
        });
    },
    coupling(configuration, threshold){
        this.init(configuration);
        threshold = threshold || 1;

        return getCouplings(configuration, threshold);
    },
    churn(configuration){
        this.init(configuration);

        return getChurn(configuration);
    },
    fileChurn(configuration){
        this.init(configuration);

        return getFileChurn(configuration);
    },
    mri(configuration, file){
        this.init(configuration, undefined, undefined, false);

        return getMriSummary(configuration,file).then(function(results){
            return results;
        });
    },
    mainContributors(configuration, filterByExisting){
        this.init(configuration);

        return getMainContributors(configuration, filterByExisting);
    },
    filesWhoseMainContributorIs(author, configuration, filterByExisting){
        this.init(configuration);

        return getFilesWhoseMainContributorIs(author, configuration, filterByExisting);
    },
    onlyContributor(configuration, filterByExisting){
        this.init(configuration);

        return getOnlyContributors(configuration, filterByExisting);
    },
    filesWhoseOnlyContributorIs(author, configuration, filterByExisting){
        this.init(configuration);

        return getFilesWhoseOnlyContributorIs(author, configuration, filterByExisting);
    }
};
