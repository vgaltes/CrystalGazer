"use strict"

const child_process = require('child_process');

let getCSharpFunctionNamesFrom = function(filePath){
    const command = 'dotnet \"./libs/MriCSharp/MriCSharp.App.dll\" ' + filePath;
    
    let result = child_process.execSync(command);
    let functionNames = result.toString().split('\n');
    
    return functionNames.splice(0, functionNames.length - 1);
};

module.exports = {
    getCSharpFunctionNamesFrom : getCSharpFunctionNamesFrom
};