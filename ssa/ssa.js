var parser = c;

function exec (input) {
    return parser.parse(input);
}

var counter = {};
var currentValue = {};
var join_nodes = new Set();

function runCode(){  
    var data = document.getElementById('code').value;
    var obj = exec(data);
    var g = cfg(obj.ins);
    var node = g.entry;
    process_decl(node);
    process_BB(node);
    printFunction(obj);
}

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
        else if (isExpressionStmt(stmts[i])) {
            updateOps(stmts[i], 2);
        }
    }
    for (var i=0; i < node.succ.length; i++) {
        if (isIfNode(node.succ[i])) {
            process_if_BB(node.succ[i]);
        }
        else if (isWhileNode(node.succ[i])) {
            process_while_BB(node.succ[i]);
        }
        else {
            process_BB(node.succ[i]);
        }
    }
}

function process_while_BB(node, parent) {
    if(node.visited) return;
    node.visited = true;
    node.children = [];
    if (parent != undefined) {
        parent.children.push(node);
    }
    var expr = node.ins[0];
    // console.log(expr);
    var backupSymbol={};
    for (var key in currentValue) {
        backupSymbol[key] = currentValue[key];
    }
    // console.log(backupSymbol['i']);
    node.phiNodes = {};
    var phi_nodes = node.phiNodes;
    var while_body = node.succ[0];
    var while_out = node.succ[1];
    var body_stmts = while_body.ins;

    // TODO
    // console.log(body_stmts.length);
    // console.log(body_stmts[0]);
    for (var i = 0; i < body_stmts.length; i++) {
        var stmt = body_stmts[i];
        // console.log(stmt);
        if (isAssignmentStmt(stmt)) {
            updateOps(stmt, 2);
            var assgn = stmt.val[0].val;
            var backupVal = backupSymbol[assgn];
            updateAssgn(stmt);
            if (!phi_nodes.hasOwnProperty(assgn)) {
                var phinode = new newPhiNode(assgn, backupVal);
                phi_nodes[assgn] = phinode;
            }
            var phinode = phi_nodes[assgn];
            phinode.rhs1 = currentValue[assgn];
            phinode.rhs2 = backupVal;
        }
    }

    // Handle nested IF
    if (while_body.succ.length > 0 && isIfNode(while_body.succ[0])) {
        process_if_BB(while_body.succ[0], node);
        var join_stmts = while_body.succ[0].ins[0].join.ins;
        for (var i = 0; i < join_stmts.length; i++) {
            var stmt = join_stmts[i];
            // updateOps(stmt, 2);
            var assgn = stmt.id;
            var backupVal = backupSymbol[assgn];
            // updateAssgn(stmt);
            if (!phi_nodes.hasOwnProperty(assgn)) {
                var phinode = new newPhiNode(assgn, backupVal);
                phi_nodes[assgn] = phinode;
            }
            var phinode = phi_nodes[assgn];
            phinode.rhs1 = currentValue[assgn];
            phinode.rhs2 = backupSymbol[assgn];
        }
    }

    // Handle nested WHILE
    if (while_body.succ.length > 0 && isWhileNode(while_body.succ[0])) {
        process_while_BB(while_body.succ[0], node);
        var join_stmts = while_body.succ[0].ins;
        for (var i = 0; i < join_stmts.length - 1; i++) {
            var stmt = join_stmts[i];
            // updateOps(stmt, 2);
            var assgn = stmt.id;
            var backupVal = backupSymbol[assgn];
            // updateAssgn(stmt);
            if (!phi_nodes.hasOwnProperty(assgn)) {
                var phinode = new newPhiNode(assgn, backupVal);
                phi_nodes[assgn] = phinode;
            }
            var phinode = phi_nodes[assgn];
            phinode.rhs1 = currentValue[assgn];
            // console.log(phinode.rhs2);
            // console.log(backupSymbol[assgn]);
            phinode.rhs2 = backupSymbol[assgn];
        }
    }

    

    // Loop the loop!
    for (var id in phi_nodes) {
        if (phi_nodes.hasOwnProperty(id)) {
            // console.log(id + ' => ' + backupSymbol[id]);
            phi_nodes[id].backup = backupSymbol[id];
            currentValue[id] = phi_nodes[id].lhs;
            // console.log(id + " => " + phi_nodes[id].lhs);
            // console.log(phi_nodes[id]);
            phi_ins = new phi_stmt(id, phi_nodes[id]);
            // console.log(phi_ins);
            var newVal = phi_nodes[id].lhs;
            currentValue[id] = newVal;
            var newId = id + newVal;
            var oldId = id + backupSymbol[id];
            recursiveReplaceOps(while_body, oldId, newId);
            node.ins.unshift(phi_ins);
            // console.log(newId + ' ' + oldVal);
            // for (var i = 0; i < body_stmts.length; i++) {
            //     var stmt = body_stmts[i];
            //     replaceOps(stmt, oldId, newId, 2);
            // }
            // replaceOps(expr, oldId, newId, 0);
        }
    }
    updateOps(expr, 0);

    if (isIfNode(while_out)) {
        process_if_BB(while_out);
    }
    else if (isWhileNode(while_out)) {
        process_while_BB(while_out);
    }
    else if (!while_out.is_join) {
        process_BB(while_out);
    }
    // console.log(node.ins[0]);
}

function process_if_BB(node, parent) {
    if (node.visited) return;
    node.visited = true;
    node.children = [];
    if (parent != undefined) {
        parent.children.push(node);
    }
    var backupSymbol={};
    for (var key in currentValue) {
        backupSymbol[key] = currentValue[key];
    }

    var joinBB = node.ins[0].join;
    joinBB.is_join = true;
    join_nodes.add(join_nodes);
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
        process_if_BB(then_node.succ[0], node);
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

    // Handle nested while
    if (then_node.succ.length > 0 && isWhileNode(then_node.succ[0])) {
        process_while_BB(then_node.succ[0], node);
        var join_stmts = then_node.succ[0].ins;
        for (var i = 0; i < join_stmts.length-1; i++) {
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
        process_if_BB(else_node.succ[0], node);
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

    // Handle nested while
    if (else_node.succ.length > 0 && isWhileNode(else_node.succ[0])) {
        process_while_BB(else_node.succ[0], node);
        var join_stmts = else_node.succ[0].ins;
        for (var i = 0; i < join_stmts.length-1; i++) {
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

    // console.log(phi_nodes);
    // Add PHI statements and restore currentVal
    for (var id in phi_nodes) {
        if (phi_nodes.hasOwnProperty(id)) {
            // console.log(id + ' => ' + backupSymbol[id]);
            phi_nodes[id].backup = backupSymbol[id];
            currentValue[id] = phi_nodes[id].lhs;
            // console.log(id + " => " + phi_nodes[id].lhs);
            // console.log(phi_nodes[id]);
            phi_ins = new phi_stmt(id, phi_nodes[id]);
            // console.log(phi_ins);
            joinBB.ins.push(phi_ins);
        }
    }

    for (var i=0; i < joinBB.succ.length; i++) {
        // if (joinBB.succ[i].is_join) {
        //     console.log('yeah');
        // }
        if (isIfNode(joinBB.succ[i])) {
            process_if_BB(joinBB.succ[i]);
        }
        else if (isWhileNode(joinBB.succ[i])) {
            process_while_BB(joinBB.succ[i]);
        }
        else if (!joinBB.succ[i].is_join){
            process_BB(joinBB.succ[i]);
        }
    }

}

function isAssignmentStmt(stmt) {
    return (stmt.type == 'expstmt') && (stmt.val.length > 2) && (stmt.val[1].val == '=');
}

function isPhiStmt(stmt) {
    return (stmt.type == 'phi');
}

function isDeclStmt(stmt) {
    return (stmt.type == 'decstmt');
}

function isIfNode(node) {
    return (node.ins.length > 0 && node.ins[0].type == 'if-cond');
}

function isWhileNode(node) {
    return (node.ins.length > 0 && node.ins[0].type == 'while-cond');
}

function newPhiNode(assgn, backup) {
    counter[assgn]++;
    this.lhs = counter[assgn];
    this.backup = backup;
}

function isExpressionStmt(stmt) {
    return (stmt.type == 'exp' || stmt.type == 'while-cond' || stmt.type == 'if-cond' || stmt.type == 'expstmt');
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

function replaceOps(stmt, oldId, newId, start) {
    for (var j = start; j < stmt.val.length; j++) {
        var idObj = stmt.val[j];
        if (idObj.type == 'id') {
            var id = idObj.val;
            if (id == oldId) {
                idObj.val = newId;
            }
        }
    }
}

function recursiveReplaceOps(node, oldId, newId) {
    if (node.recursiveReplace == newId) {
        return;
    }
    node.recursiveReplace = newId;
    var stmts = node.ins;
    var len = stmts.length;
    for (var i = 0; i < len; i++) {
        if (isAssignmentStmt(stmts[i]) || isPhiStmt(stmts[i])) {
            replaceOps(stmts[i], oldId, newId, 2);
        }
        else if (isExpressionStmt(stmts[i])) {
            replaceOps(stmts[i], oldId, newId, 0);
        }
    }
    for (var i=0; i < node.succ.length; i++) {
        recursiveReplaceOps(node.succ[i], oldId, newId);
    }
    if (isIfNode(node)) {
        recursiveReplaceOps(node.ins[0].join, oldId, newId);
    }

}

function updateAssgn(stmt) {
    // console.log(stmt);
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
        {type:'id', val: lhsvar},
        {val: '='},
        {val: 'ϕ'},
        {val: '('},
        {type:'id', val: rhsvar1},
        {val: ','},
        {type:'id', val: rhsvar2},
        {val: ')'},
        {val: ';'}
    ];
}