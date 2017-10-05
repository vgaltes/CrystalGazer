#! /usr/bin/env node
"use strict"

const program = require('commander');
const cg = require('./src/crystalgazer');
const pkg = require('./package.json');
const dateFns = require('date-fns');
const blessed = require('blessed');
const contrib = require('blessed-contrib');
let screen;

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

let drawTwoColumnTable = function(label, headers, data){
    createScreen();
    const grid = new contrib.grid({rows: 1, cols: 1, screen: screen});
    const table = grid.set(0, 0, 1, 1,contrib.table,
        { keys: true
        , fg: 'white'
        , selectedFg: 'white'
        , selectedBg: 'blue'
        , interactive: true
        , label: label
        , width: '50%'
        , height: '50%'
        , border: {type: "line", fg: "cyan"}
        , columnSpacing: 5 //in chars
        , columnWidth: [60, 20] /*in chars*/ });

    //allow control the table with the keyboard
    table.focus();
   
    table.setData(
      { headers: headers
      , data: data});     

    screen.render();
};

let drawText = function(label, text){
    createScreen();

    const grid = new contrib.grid({rows: 1, cols: 1, screen: screen});
    const box = grid.set(0, 0, 1, 1,blessed.box,
        {   
            label: label,
            width: '80%',
            height: '90%',
            border: 'line',
            content: text,
            scrollable: true,
            keys: true,
            vi: true,
            alwaysScroll: true,
            scrollbar: {
              ch: ' ',
              inverse: true
            }
        });
    
    box.focus();

    screen.render();
};

let createScreen = function(){
    screen = blessed.screen();
    screen.key(['escape', 'q', 'C-c'], function(ch, key) {
        return process.exit(0);
    });
};

let init = function(configName, options){
    const cgConfig = getConfigFrom(configName, options);

    cg.init(cgConfig, options.after, options.before);
};

let numberOfCommits = function(configName, options){
    const cgConfig = getConfigFrom(configName, options);
    const numberOfCommits = cg.numberOfCommits(cgConfig);

    drawText('Number of commits (Press ESC to exit)', numberOfCommits.toString());
};

let numberOfFilesChanged = function(configName, options){
    const cgConfig = getConfigFrom(configName, options);    
    const numberOfFilesChanged = cg.numberOfFilesChanged(cgConfig);

    drawText('Number of files changed (Press ESC to exit)', numberOfFilesChanged.toString());
};

let filesByType = function(configName, options){
    const cgConfig = getConfigFrom(configName, options);    
    const filesByType = cg.filesByType(cgConfig);

    const text = filesByType.reduce(function(acc, element)
    {
        return acc + element.extension + " ==> " + element.files + "\n";
    }, "");

    drawText('Files by type (Press ESC to exit)', text);
};

let authors = function(configName, options){
    const cgConfig = getConfigFrom(configName, options);    
    const authors = cg.authors(cgConfig);

    const text = authors.reduce(function(acc, element)
    {
        return acc + element + "\n";
    }, "");

    drawText('Authors (Press ESC to exit)', text);
};

let revisionsByFile = function(configName, options){
    const cgConfig = getConfigFrom(configName, options);    
    const revisionsByFile = cg.revisionsByFile(cgConfig);
    const headers = ['File name', '# Revisions'];
    const data = revisionsByFile.map(function(item){
        return [item.file, item.revisions];
    });

    drawTwoColumnTable('Revisions by file (Press ESC to exit)', headers, data);    
};

let linesByFile = function(configName, options){
    const cgConfig = getConfigFrom(configName, options);    
    const linesByFile = cg.linesByFile(cgConfig);

    const headers = ['File name', '# Lines'];
    const data = linesByFile.map(function(item){
        return [item.file, item.lines];
    });

    drawTwoColumnTable('Lines by file (Press ESC to exit)', headers, data);
};

let authorsByFile = function(configName, options){
    const cgConfig = getConfigFrom(configName, options);    
    const authorsByFile = cg.authorsByFile(cgConfig);

    const headers = ['File name', '# Authors'];
    const data = authorsByFile.map(function(item){
        return [item.file, item.authors];
    });

    drawTwoColumnTable('Authors by file (Press ESC to exit)', headers, data);
};

let addLineChartTo = function(grid, xpos, ypos, label, series){
    let line = grid.set(xpos, ypos, 1, 1,contrib.line,
        { style:
          { line: "yellow"
          , text: "green"
          , baseline: "black"}
        , xLabelPadding: 3
        , xPadding: 5
        , showLegend: false
        , wholeNumbersOnly: true //true=do not show fraction in y axis
        , label: label});

        screen.append(line);
        line.setData([series]);
}


let complexityOverTime = function(configName, fileName, options){
    const cgConfig = getConfigFrom(configName, options);    
    cg.complexityOverTime(cgConfig, fileName).then(function(complexity){
        createScreen();
        const grid = new contrib.grid({rows: 2, cols: 1, screen: screen});
        
        var linesSeries = {
            title: 'Lines',
            x: complexity.map(function(c){return c.date;}),
            y: complexity.map(function(c){return c.numberOfLines;}),
            style: {
                line: 'blue'
               }
         };
        addLineChartTo(grid, 0, 0, 'Complexity (number of lines) over time (Press ESC to exit)',linesSeries);

        var tabsSeries = {
            title: 'Tabs',
            x: complexity.map(function(c){return c.date;}),
            y: complexity.map(function(c){return c.maxNumberOfTabs;}),
            style: {
                line: 'red'
            }
        };
        addLineChartTo(grid, 1, 0, 'Complexity (max # of tabs) over time (Press ESC to exit)',tabsSeries);
        screen.render();
    });    
};

let coupling = function(configName, options){
    const cgConfig = getConfigFrom(configName, options);

    const numberOfItemsToDisplay = options.numberOfItems || 40;
    const threshold = options.threshold || 1;
    
    const coupling = cg.coupling(cgConfig, threshold).splice(0, numberOfItemsToDisplay);

    const text = coupling.reduce(function(acc, element)
    {
        return acc + element.file1 + ' ==> ' + element.file2 + ': ' + element.coupling + "\n";
    }, "");

    drawText('Coupling (Press ESC to exit)', text);
};

let churn = function(configName, options){
    const cgConfig = getConfigFrom(configName, options);
    const numberOfItemsToDisplay = options.numberOfItems || 40;

    const churn = cg.churn(cgConfig);

    const text = churn.reduce(function(acc, element)
    {
        return acc + element.file + ': ' + element.churn + "\n";
    }, "");

    drawText('Churn (Press ESC to exit)', text);
}

let fileChurn = function(configName, options){
    const cgConfig = getConfigFrom(configName, options);

    const fileChurn = cg.fileChurn(cgConfig);

    createScreen();
    const grid = new contrib.grid({rows: 2, cols: 1, screen: screen});
    
    var linesSeries = {
        title: 'Added',
        x: fileChurn.map(function(c){return c.date;}),
        y: fileChurn.map(function(c){return c.added;}),
        style: {
            line: 'blue'
           }
     };
    addLineChartTo(grid, 0, 0, 'Files added over time (Press ESC to exit)',linesSeries);

    var tabsSeries = {
        title: 'Modified',
        x: fileChurn.map(function(c){return c.date;}),
        y: fileChurn.map(function(c){return c.modified;}),
        style: {
            line: 'red'
        }
    };
    addLineChartTo(grid, 1, 0, 'Files modified over time (Press ESC to exit)',tabsSeries);
    screen.render();
};

let mri = function(configName, fileName, options){
    const cgConfig = getConfigFrom(configName, options);

    cg.mri(cgConfig, fileName).then(function(mriSummary){
        const text = mriSummary.reduce(function(acc, element)
        {
            return acc + '[' + element.method + '] Revisions: ' + element.revisions + ' | Churn: ' + element.churn + "\n";
        }, "");

        drawText('MRI (Press ESC to exit)', text);
    });
};

let mainContributors = function(configName, options){
    const cgConfig = getConfigFrom(configName, options);
    const existing = options.existing != undefined;

    if(options.author){
        const files = cg.filesWhoseMainContributorIs(options.author, cgConfig, existing);

        const text = files.reduce(function(acc, element)
        {
            return acc + element + "\n";
        }, "");

        drawText(`Files where ${options.author} is the main contributor (Press ESC to exit)`, text);
    }
    else{
        const contributors = cg.mainContributors(cgConfig, existing);
        
        const headers = ['Author', '# Files'];
        const data = contributors.map(function(item){
            return [item.author, item.files];
        });
    
        drawTwoColumnTable('Main Contributors (Press ESC to exit)', headers, data);
    }
}

let onlyContributors = function(configName, options){
    const cgConfig = getConfigFrom(configName, options);
    const existing = options.existing != undefined;

    if(options.author){
        const files = cg.filesWhoseOnlyContributorIs(options.author, cgConfig, existing);

        const text = files.reduce(function(acc, element)
        {
            return acc + element + "\n";
        }, "");

        drawText(`Files where ${options.author} is the only contributor (Press ESC to exit)`, text);
    }
    else{
        const contributors = cg.onlyContributor(cgConfig, existing);
        
        const headers = ['Author', '# Files'];
        const data = contributors.map(function(item){
            return [item.author, item.files];
        });
    
        drawTwoColumnTable('Only Contributors (Press ESC to exit)', headers, data);
    }
}

program
    .version(pkg.version)
    .command('init <configName>')
    .option('-w, --workingDirectory <working_directory>', 'working directory')
    .option('-a --after <after>', 'after date')
    .option('-b --before <before>', 'before date')
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

program
    .command('coupling <configName>')
    .option('-w, --workingDirectory <working_directory>', 'working directory')
    .option('-n, --numberOfItems <numItems>', 'number of items to display')
    .option('-t, --threshold <threshold>', 'minimum number of commits')
    .action(coupling); 

program
    .command('churn <configName>')
    .option('-w, --workingDirectory <working_directory>', 'working directory')
    .action(churn); 

program
    .command('fileChurn <configName>')
    .option('-w, --workingDirectory <working_directory>', 'working directory')
    .action(fileChurn); 

program
    .command('mri <configName> <fileName>')
    .option('-w, --workingDirectory <working_directory>', 'working directory')
    .action(mri); 

program
    .command('mainContributors <configName>')
    .option('-w, --workingDirectory <working_directory>', 'working directory')
    .option('-e, --existing', 'only existing files')
    .option('-a, --author <author>', 'author')
    .action(mainContributors); 

program
    .command('onlyContributors <configName>')
    .option('-w, --workingDirectory <working_directory>', 'working directory')
    .option('-e, --existing', 'only existing files')
    .option('-a, --author <author>', 'author')
    .action(onlyContributors); 

program.action(function(){program.outputHelp();});

program.parse(process.argv);

// if program was called with no arguments, show help.
if (program.args.length === 0) program.help();