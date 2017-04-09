var parser = require("./c").parser;
var fs = require('fs');

function exec (input) {
    return parser.parse(input);
}

var cfg = require('./utility').cfg;
var printFunction = require('./utility').printFunction;
var node = require('./utility').node;
var print_basic_block = require('./utility').print_basic_block;
var counter = {};
var currentValue = {};

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
    // console.log(node);
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
                    counter[id] = 0;
                    currentValue[id] = 0;
                    idObj.val = id + 0;
                }
            }
        }
    }
}

function process_BB(node) {
    if (node.visited) return;
    node.visited = true;
    var stmts = node.ins;
    var len = stmts.length;
    for (var i = 0; i < len; i++) {
        if (isAssignmentStmt(stmts[i])) {
            updateOps(stmts[i], 2);
            updateAssgn(stmts[i]);
        }
    }
    for (var i=0; i < node.succ.length; i++) {
        if (isIfNode(node.succ[i])) {
            process_if_BB(node.succ[i]);
        }
        else {
            process_BB(node.succ[i]);
        }
    }
}

function process_if_BB(node) {
    if (node.visited) return;
    node.visited = true;
    var backupSymbol={};
    for (var key in currentValue) {
        backupSymbol[key] = currentValue[key];
    }

    var joinBB = node.ins[0].join;
    joinBB.phiNodes = {};
    var phi_nodes = joinBB.phiNodes;
    var condition = node.ins[0];
    updateOps(condition, 0);
    var then_node = node.succ[0];
    var else_node = node.succ[1];
    

    // Process THEN block
    var then_stmts = then_node.ins;
    for (var i = 0; i < then_stmts.length; i++) {
        var stmt = then_stmts[i];
        if (isAssignmentStmt(stmt)) {
            updateOps(stmt, 2);
            var assgn = stmt.val[0].val;
            var backupVal = currentValue[assgn];
            updateAssgn(stmt);
            if (!phi_nodes.hasOwnProperty(assgn)) {
                var phinode = new newPhiNode(assgn, backupVal);
                phi_nodes[assgn] = phinode;
            }
            var phinode = phi_nodes[assgn];
            phinode.rhs1 = currentValue[assgn];
        }
    }

    // Handle nested IF
    if (then_node.succ.length > 0 && isIfNode(then_node.succ[0])) {
        process_if_BB(then_node.succ[0]);
        var join_stmts = then_node.succ[0].ins[0].join.ins;
        for (var i = 0; i < join_stmts.length; i++) {
            var stmt = join_stmts[i];
            // updateOps(stmt, 2);
            var assgn = stmt.id;
            var backupVal = currentValue[assgn];
            // updateAssgn(stmt);
            if (!phi_nodes.hasOwnProperty(assgn)) {
                var phinode = new newPhiNode(assgn, backupVal);
                phi_nodes[assgn] = phinode;
            }
            var phinode = phi_nodes[assgn];
            phinode.rhs1 = currentValue[assgn];
        }
    }

    // Restore backup values
    // console.log(phi_nodes);
    for (var id in phi_nodes) {
        // console.log(id);
        // console.log(phi_nodes[id]);
        if (phi_nodes.hasOwnProperty(id)) {
            currentValue[id] = phi_nodes[id].backup;
        }
    }

    // Process ELSE block
    var else_stmts = else_node.ins;
    for (var i = 0; i < else_stmts.length; i++) {
        var stmt = else_stmts[i];
        if (isAssignmentStmt(stmt)) {
            updateOps(stmt, 2);
            var assgn = stmt.val[0].val;
            var backupVal = currentValue[assgn];
            updateAssgn(stmt);
            if (!phi_nodes.hasOwnProperty(assgn)) {
                var phinode = new newPhiNode(assgn, backupVal);
                phi_nodes[assgn] = phinode;
            }
            var phinode = phi_nodes[assgn];
            phinode.rhs2 = currentValue[assgn];
        }
    }

    // Handle nested IF
    if (else_node.succ.length > 0 && isIfNode(else_node.succ[0])) {
        // console.log(else_node.succ);
        process_if_BB(else_node.succ[0]);
        var join_stmts = else_node.succ[0].ins[0].join.ins;
        for (var i = 0; i < join_stmts.length; i++) {
            var stmt = join_stmts[i];
            // updateOps(stmt, 2);
            var assgn = stmt.id;
            var backupVal = currentValue[assgn];
            // updateAssgn(stmt);
            if (!phi_nodes.hasOwnProperty(assgn)) {
                var phinode = new newPhiNode(assgn, backupVal);
                phi_nodes[assgn] = phinode;
            }
            var phinode = phi_nodes[assgn];
            phinode.rhs2 = currentValue[assgn];
        }
    }

    // console.log(phi_nodes);
    // Add PHI statements and restore currentVal
    for (var id in phi_nodes) {
        if (phi_nodes.hasOwnProperty(id)) {
            // console.log(id + ' => ' + backupSymbol[id]);
            phi_nodes[id].backup = backupSymbol[id];
            currentValue[id] = phi_nodes[id].lhs;
            // console.log(phi_nodes[id]);
            phi_ins = new phi_stmt(id, phi_nodes[id]);
            // console.log(phi_ins);
            joinBB.ins.push(phi_ins);
        }
    }

    for (var i=0; i < joinBB.succ.length; i++) {
        if (isIfNode(joinBB.succ[i])) {
            process_if_BB(joinBB.succ[i]);
        }
        else {
            process_BB(joinBB.succ[i]);
        }
    }

}

function isAssignmentStmt(stmt) {
    return (stmt.type == 'expstmt') && (stmt.val.length > 2) && (stmt.val[1].val == '=');
}

function isDeclStmt(stmt) {
    return (stmt.type == 'decstmt');
}

function isIfNode(node) {
    return (node.ins.length > 0 && node.ins[0].type == 'if-cond');
}

function newPhiNode(assgn, backup) {
    counter[assgn]++;
    this.lhs = counter[assgn];
    this.backup = backup;
}

function isExpressionStmt(stmt) {
    return (stmt.type == 'exp');
}

function updateOps(stmt, start) {
    for (var j = start; j < stmt.val.length; j++) {
        var idObj = stmt.val[j];
        if (idObj.type == 'id') {
            var id = idObj.val;
            idObj.val = id + currentValue[id];
        }
    }
}

function updateAssgn(stmt) {
    var assgn = stmt.val[0].val;
    counter[assgn]++;
    currentValue[assgn] = counter[assgn];
    stmt.val[0].val = assgn + currentValue[assgn];
}

function phi_stmt(id, phinode) {
    this.type = 'phi';
    var lhsvar = id + phinode.lhs;
    if (!phinode.hasOwnProperty('rhs1')) {
        phinode.rhs1 = phinode.backup;
    }
    if (!phinode.hasOwnProperty('rhs2')) {
        phinode.rhs2 = phinode.backup;
    }
    var rhsvar1 = id + phinode.rhs1;
    var rhsvar2 = id + phinode.rhs2;
    this.backup = phinode.backup;
    this.id = id;
    this.val = [
        {val: lhsvar},
        {val: '='},
        {val: 'ϕ'},
        {val: '('},
        {val: rhsvar1},
        {val: ','},
        {val: rhsvar2},
        {val: ')'},
        {val: ';'}
    ];
}