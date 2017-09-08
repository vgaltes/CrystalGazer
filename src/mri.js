"use strict"

const antlr4 = require('antlr4/index');
const CSharpParser = require('./antlr/CSharpParser.js');
const CSharpLexer = require('./antlr/CSharpLexer.js');
const CSharpFunctionListener = require('./antlr/CSharpFunctionListener').CSharpFunctionListener;

let getCSharpFunctionNamesFrom = function(code){
    const chars = new antlr4.InputStream(code);
    const lexer = new CSharpLexer.CSharpLexer(chars);
    const tokens  = new antlr4.CommonTokenStream(lexer);
    const parser = new CSharpParser.CSharpParser(tokens);
    
    const tree = parser.compilation_unit();   
    let res = [];
    const csharpFunctionListener = new CSharpFunctionListener(res);
    antlr4.tree.ParseTreeWalker.DEFAULT.walk(csharpFunctionListener, tree);

    return res;
}

module.exports = {
    getCSharpFunctionNamesFrom : getCSharpFunctionNamesFrom
};