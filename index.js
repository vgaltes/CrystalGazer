"use strict"

const program = require('commander');
const cg = require('./src/crystalgazer');
const pkg = require('./package.json');

let getConfigFrom = function(configName, options){
    let workingDirectory = '.';
    
    if ( options.workingDirectory ){
        workingDirectory = options.workingDirectory;
    }

    const cgConfig = {
        workingDirectory: workingDirectory,
        name: configName
    };

    return cgConfig;
};

let init = function(configName, options){
    const cgConfig = getConfigFrom(configName, options);
    cg.init(cgConfig);
};

let numberOfCommits = function(configName, options){
    const cgConfig = getConfigFrom(configName, options);
    console.log(cgConfig);
    const numberOfCommits = cg.numberOfCommits(cgConfig);

    console.log('Number of commits: ' + numberOfCommits);
};

let numberOfFilesChanged = function(configName, options){
    const cgConfig = getConfigFrom(configName, options);    
    const numberOfFilesChanged = cg.numberOfFilesChanged(cgConfig);

    console.log('numberOfFilesChanged: ' + numberOfFilesChanged);
};

let filesByType = function(configName, options){
    const cgConfig = getConfigFrom(configName, options);    
    const filesByType = cg.filesByType(cgConfig);

    console.log('filesByType: ' + JSON.stringify(filesByType));
};

let authors = function(configName, options){
    const cgConfig = getConfigFrom(configName, options);    
    const authors = cg.authors(cgConfig);

    console.log('authors: ' + authors);
};

let revisionsByFile = function(configName, options){
    const cgConfig = getConfigFrom(configName, options);    
    const revisionsByFile = cg.revisionsByFile(cgConfig);

    console.log('revisionsByFile: ' + JSON.stringify(revisionsByFile));
};

let linesByFile = function(configName, options){
    const cgConfig = getConfigFrom(configName, options);    
    const linesByFile = cg.linesByFile(cgConfig);

    console.log('linesByFile: ' + JSON.stringify(linesByFile));
};

let authorsByFile = function(configName, options){
    const cgConfig = getConfigFrom(configName, options);    
    const authorsByFile = cg.authorsByFile(cgConfig);

    console.log('authorsByFile: ' + JSON.stringify(authorsByFile));
};

let complexityOverTime = function(configName, fileName, options){
    const cgConfig = getConfigFrom(configName, options);    
    cg.complexityOverTime(cgConfig, fileName).then(function(complexity){
        console.log('complexity trend: ' + JSON.stringify(complexity));
    });    
};

program
    .version(pkg.version)
    .command('init <configName>')
    .option('-w, --workingDirectory <working_directory>', 'working directory')
    .action(init);

program
    .command('numberOfCommits <configName>')
    .option('-w, --workingDirectory <working_directory>', 'working directory')
    .action(numberOfCommits);

program
    .command('numberOfFilesChanged <configName>')
    .option('-w, --workingDirectory <working_directory>', 'working directory')
    .action(numberOfFilesChanged);    

program
    .command('filesByType <configName>')
    .option('-w, --workingDirectory <working_directory>', 'working directory')
    .action(filesByType); 
    
program
    .command('authors <configName>')
    .option('-w, --workingDirectory <working_directory>', 'working directory')
    .action(authors);  

program
    .command('revisionsByFile <configName>')
    .option('-w, --workingDirectory <working_directory>', 'working directory')
    .action(revisionsByFile); 

program
    .command('linesByFile <configName>')
    .option('-w, --workingDirectory <working_directory>', 'working directory')
    .action(linesByFile); 
    
program
    .command('authorsByFile <configName>')
    .option('-w, --workingDirectory <working_directory>', 'working directory')
    .action(authorsByFile); 

program
    .command('complexityOverTime <configName> <fileName>')
    .option('-w, --workingDirectory <working_directory>', 'working directory')
    .action(complexityOverTime); 

program.parse(process.argv);

// if program was called with no arguments, show help.
if (program.args.length === 0) program.help();