var parser = require("./c").parser;
var fs = require('fs');

function exec (input) {
    return parser.parse(input);
}

var cfg = require('./utility').cfg;
var printFunction = require('./utility').printFunction;
var print_basic_block = require('./utility').print_basic_block;
var symbolTable = {};

var args = process.argv;
var filename = args[2];

fs.readFile('./'+filename, 'utf8', function(err, data) {  
    if (err) throw err;
    var obj = exec(data);
    // console.log(obj);
    var g = cfg(obj.ins);
    var node = g.entry;
    process_decl(node);
    process_BB(node);
    printFunction(obj);
    // while (true) {
    //     var ins = node.ins;
    // }
    // console.log(symbolTable);
    // print_basic_block(node);
});

function process_decl(node) {
    if (node.visited) return;
    var stmts = node.ins;
    var len = stmts.length;
    for (var i = 0; i < len; i++) {
        if (isDeclStmt(stmts[i])) {
            for (var j=0; j < stmts[i].val.length; j++) {
                var idObj = stmts[i].val[j];
                if (idObj.type == 'id') {
                    var id = idObj.val;
                    symbolTable[id] = 1;
                }
            }
        }
    }
}

function process_BB(node) {
    if (node.visited) return;
    var stmts = node.ins;
    var len = stmts.length;
    for (var i = 0; i < len; i++) {
        if (isAssignmentStmt(stmts[i])) {
            for (var j = 2; j < stmts[i].val.length; j++) {
                var idObj = stmts[i].val[j];
                if (idObj.type == 'id') {
                    var id = idObj.val;
                    idObj.val = id + symbolTable[id];
                }
            }
            var assgn = stmts[i].val[0].val;
            symbolTable[assgn]++;
        }
    }
}

function isAssignmentStmt(stmt) {
    return (stmt.type == 'expstmt') && (stmt.val.length > 2) && (stmt.val[1].val == '=');
}

function isDeclStmt(stmt) {
    return (stmt.type == 'decstmt');
}