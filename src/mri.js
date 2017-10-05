"use strict"

const child_process = require('child_process');
const nodeModulesFolder = `${__dirname}/..`;

let getCSharpFunctionNamesFrom = function(filePath){
    const command = `dotnet \"${nodeModulesFolder}/libs/MriCSharp/MriCSharp.App.dll\" n ` + filePath;

    let result = child_process.execSync(command);
    let functionNames = result.toString().split('\n');
    
    return functionNames.splice(0, functionNames.length - 1);
};

let getCSharpFunctionModifications = function(filePath1, filePath2, methodName){
    const command = `dotnet \"${nodeModulesFolder}/libs/MriCSharp/MriCSharp.App.dll\" d ` + filePath1 + " " + filePath2 + " " + methodName;
    
    let result = child_process.execSync(command);
    let diffResult = result.toString().split('\n');
    
    return {
        hasChanged: diffResult[0],
        churn: Number(diffResult[1])
    };
};

module.exports = {
    getCSharpFunctionNamesFrom : getCSharpFunctionNamesFrom,
    getCSharpFunctionModifications : getCSharpFunctionModifications
};