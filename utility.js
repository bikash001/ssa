var node = function(x,y) {
    this.type = x;
    this.val = y;
};

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
    var bb;
    var stmts;
    if (cmpstmt.type == 'cmpstmt') {
        stmts = cmpstmt.val;
        // console.log(stmts);
    } else {
        stmts = [cmpstmt];
    }

    for (var i=0; i<stmts.length; i++) {
        // console.log(stmts[i]);
        if (stmts[i].type == 'decstmt') {
            if (bb == undefined) {
                bb = BasicBlock();
            }
            bb.ins.push(stmts[i]);
        } else if (stmts[i].type == 'expstmt') {
            if (bb == undefined) {
                bb = BasicBlock();
            }
            bb.ins.push(stmts[i]);
            // console.log('hello');
            // console.log(bb);
        } else if (stmts[i].type == 'jmpstmt') {
            if (bb == undefined) {
                bb = BasicBlock();
            }
            bb.ins.push(stmts[i]);
        } else if (stmts[i].type == 'ifstmt') {
            var entryblock = BasicBlock();
            var exitblock = BasicBlock();

            if (bb != undefined) {
                if (Object.keys(retval.entry).length > 0) {
                    bb.pred.push(retval.exit);
                    retval.exit.succ = bb;
                    retval.exit = bb;
                } else {
                    retval.entry = bb;
                    retval.exit = bb;
                }
                bb = undefined;
            }

            entryblock.ins.push(new node('exp',stmts[i].val.exp));
            var type = stmts[i].val.if.type;
            if ( type == 'expstmt' || type == 'decstmt' || type == 'jmpstmt') {
                var tempblock = BasicBlock();
                tempblock.ins.push(stmts[i].val.if);
                entryblock.succ.push(tempblock);
                exitblock.pred.push(tempblock);
            } else{
                var ret = cfg(stmts[i].val.if);
                ret.exit.succ.push(exitblock);
                ret.entry.pred.push(entryblock);
                entryblock.succ.push(ret.entry);
                exitblock.pred.push(ret.exit);
            }
            if (Object.keys(stmts[i].val.else).length > 0) {
                type = stmts[i].val.else.type;
                if (type == 'expstmt' || type == 'decstmt' || type == 'jmpstmt') {
                    var tempblock = BasicBlock();
                    tempblock.ins.push(stmts[i].val.else);
                    entryblock.succ.push(tempblock);
                    exitblock.pred.push(tempblock);
                } else {
                    var ret = cfg(stmts[i].val.else);
                    ret.exit.succ.push(exitblock);
                    ret.entry.pred.push(entryblock);
                    entryblock.succ.push(ret.entry);
                    exitblock.pred.push(ret.exit);
                }
            } else {
                exitblock.pred.push(entryblock);
                entryblock.succ.push(exitblock);
            }
            if (Object.keys(retval.entry).length > 0) {
                retval.exit.succ.push(entryblock);
                entryblock.pred.push(retval.exit);
                retval.exit = exitblock;
            } else {
                retval.entry = entryblock;
                retval.exit = exitblock;
            }
        } else {
            var entryblock = BasicBlock();
            var exitblock = BasicBlock();

            if (bb != undefined) {
                if (Object.keys(retval.entry).length > 0) {
                    bb.pred.push(retval.exit);
                    retval.exit.succ = bb;
                    retval.exit = bb;
                } else {
                    retval.entry = bb;
                    retval.exit = bb;
                }
                bb = undefined;
            }

            entryblock.ins.push(new node('exp',stmts[i].val.exp));
            var type = stmts[i].val.body.type;
            if ( type == 'expstmt' || type == 'decstmt' || type == 'jmpstmt') {
                var tempblock = BasicBlock();
                tempblock.ins.push(stmts[i].val.body);
                entryblock.succ.push(tempblock);
                exitblock.pred.push(tempblock);
            } else {
                var ret = cfg(stmts[i].val.body);
                ret.exit.succ.push(exitblock);
                ret.entry.pred.push(entryblock);
                entryblock.succ.push(ret.entry);
                exitblock.pred.push(ret.exit);
            }
            if (Object.keys(retval.entry).length > 0) {
                retval.exit.succ.push(entryblock);
                entryblock.pred.push(retval.exit);
                retval.exit = exitblock;
            } else {
                retval.entry = entryblock;
                retval.exit = exitblock;
            }
        }
    }
    if (bb != undefined) {
        if (Object.keys(retval.entry).length > 0) {
            bb.pred.push(retval.exit);
            retval.exit.succ.push(bb);
            retval.exit = bb;
        } else {
            retval.entry = bb;
            retval.exit = bb;
        }
    }
    return retval;
}


var ret = exports.parser.parse(source);
    // cfg(ret);
    var temp = ret.ins.val;
    for (var i=0; i<temp.length; i++) {
        if (temp[i].type == 'expstmt') {
            console.log(temp[i]);
        }
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