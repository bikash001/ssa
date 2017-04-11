var parser = require("./c").parser;
var fs = require('fs');

function exec (input) {
    return parser.parse(input);
}

var cfg = require('./utility').cfg;
var printFunction = require('./utility').printFunction;
var node = require('./utility').node;
var print_basic_block = require('./utility').print_basic_block;
var symbolTable = {};
var args = process.argv;
var filename = args[2];

fs.readFile('./'+filename, 'utf8', function(err, data) {  
    if (err) throw err;
    var obj = exec(data);
    var g = cfg(obj.ins, {}, {}, {}, {});
    var node = g.entry;
    printFunction(obj);
});
