"use strict"

const charsPerTab = 4;

let getNumberOfTabsOf = function(line){
    var chars = 0;

    for(var character of line){
        if ( character === ' '){
            chars++;
        }
        else{
            break;
        }
    }

    return chars / charsPerTab;
}

module.exports = {
    numberOfLines: function(file){
        return file.toString().split('\n').length;
    },
    maxNumberOfTabs: function(file){
        const lines = file.toString().split('\n');

        return lines.reduce(function(accum, elem){
            const tabs = getNumberOfTabsOf(elem);
            return tabs > accum ? tabs : accum;
        }, -1);
    }
};