var BasicBlock = function() {
    return {
        pred: [],
        succ: [],
        ins: []
    };
}

//create CFG
function cfg(cmpstmt) {
    var retval = {entry: {}, exit: {}};
    var bb = BasicBlock();
    var stmts = cmpstmt.val;
    for (var i=0; i<stmts.len; i++) {
        if (stmts[i].type == 'decstmt') {
            bb.ins.push(stmts[i]);
        } else if (stmts[i].type == 'expstmt') {
            bb.ins.push(stmts[i]);
        } else if (stmts[i].type == 'jmpstmt') {
            bb.ins.push(stmts[i]);
        } else if (stmts[i].type == 'ifstmt') {
            var entryblock = BasicBlock();
            var exitblock = BasicBlock();
            nblock.ins.push (new node('exp',stmts[i].exp));
            if (stmts[i].if.type == 'expstmt') {
                var tempblock = BasicBlock();
                tempblock.ins.push(stmts[i].if);
                entryblock.succ.push(tempblock);
                exitblock.pred.push(tempblock);
            } else {
                var ret = cfg(stmts[i].if);
                entryblock.succ.push(ret.entry);
                ret.exit.succ.push(exitblock);
                exitblock.pred.push(ret.exit);
            }
            if (stmts[i].else.type == 'expstmt') {
                var tempblock = BasicBlock();
                tempblock.ins.push(stmts[i].else);
                entryblock.succ.push(tempblock);
                exitblock.pred.push(tempblock);
            } else {
                var ret = cfg(stmts[i].else);
                entryblock.succ.push(ret.entry);
                ret.exit.succ.push(exitblock);
                exitblock.pred.push(ret.exit);
            }
            // if (exitblock.pred.)
        } else {

        }
    }
}

var ret = exports.parser.parse(source);
    // cfg(ret);
    var temp = ret.ins.val;
    for (var i=0; i<temp.length; i++) {
        // console.log(temp[i]);
        if (temp[i].type == 'ifstmt') {
            console.log('ifstmt');
            console.log(temp[i].val.exp);
            console.log(temp[i].val.if);
            console.log(temp[i].val.else);
        } else if (temp[i].type == 'whilestmt') {
            console.log('whilestmt');
            console.log(temp[i].val.exp);
            console.log(temp[i].val.body);
        }
    }
    return ret;