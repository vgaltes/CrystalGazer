const antlr4 = require('antlr4/index');
const CSharpLexer = require('./CSharpLexer');
const CSharpParser = require('./CSharpParser');
var CSharpListener = require('./CSharpParserListener').CSharpParserListener;

CSharpFunctionListener = function(res) {
    this.Res = res;    
    CSharpListener.call(this); // inherit default listener
    return this;
};
 
// inherit default listener
CSharpFunctionListener.prototype = Object.create(CSharpListener.prototype);
CSharpFunctionListener.prototype.constructor = CSharpFunctionListener;


CSharpFunctionListener.prototype.enterMethod_member_name = function(ctx){
    this.Res.push(ctx.getText());
}

exports.CSharpFunctionListener = CSharpFunctionListener;