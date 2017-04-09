function cfg(cmpstmt, keys) {
   // var globalKeys = keys || {};

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
            // for (var x=0; x<stmts[i].val.length; x++) {
            //     if (stmts[i].val[x].type == 'id') {
            //         globalKeys[stmts[i].val[x].val] = 0;
            //         stmts[i].val[x].val += '0';
            //     }
            // }
        } else if (stmts[i].type == 'expstmt') {
            if (bb == undefined) {
                bb = BasicBlock();
            }
            bb.ins.push(stmts[i]);
            // if (stmts[i].val.length > 2) {
            //     if (stmts[i].val)
            // }
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
                    retval.exit.succ.push(bb);
                    retval.exit = bb;
                } else {
                    retval.entry = bb;
                    retval.exit = bb;
                }
                bb = undefined;
            }

            var exp = new node('if-cond',stmts[i].val.exp);
            entryblock.ins.push(exp);
            var type = stmts[i].val.if.type;
            if ( type == 'expstmt' || type == 'decstmt' || type == 'jmpstmt') {
                var tempblock = BasicBlock();
                tempblock.ins.push(stmts[i].val.if);
                entryblock.succ.push(tempblock);
                exitblock.pred.push(tempblock);
            } else {
                if (stmts[i].val.if.type == 'ifstmt' || stmts[i].val.if.type == 'whilestmt'){
                    var ret = cfg(stmts[i].val.if);
                    var temp = BasicBlock();
                    ret.exit.succ.push(exitblock);
                    ret.entry.pred.push(temp);
                    entryblock.succ.push(temp);
                    temp.succ.push(ret.entry);
                    temp.pred.push(entryblock);
                    exitblock.pred.push(ret.exit);
                } else {
                    if (stmts[i].val.if.val[0].type == 'ifstmt' ||
                    stmts[i].val.if.val[0].type == 'whilestmt') {
                        var ret = cfg(stmts[i].val.if);
                        var temp = BasicBlock();
                        ret.exit.succ.push(exitblock);
                        ret.entry.pred.push(temp);
                        entryblock.succ.push(temp);
                        temp.succ.push(ret.entry);
                        temp.pred.push(entryblock);
                        exitblock.pred.push(ret.exit);
                    }
                    else {
                        var ret = cfg(stmts[i].val.if);
                        ret.exit.succ.push(exitblock);
                        ret.entry.pred.push(entryblock);
                        entryblock.succ.push(ret.entry);
                        exitblock.pred.push(ret.exit);
                    }
                }
                // var ret = cfg(stmts[i].val.if);
                // ret.exit.succ.push(exitblock);
                // ret.entry.pred.push(entryblock);
                // entryblock.succ.push(ret.entry);
                // exitblock.pred.push(ret.exit);
            }
            if (Object.keys(stmts[i].val.else).length > 0) {
                type = stmts[i].val.else.type;
                if (type == 'expstmt' || type == 'decstmt' || type == 'jmpstmt') {
                    var tempblock = BasicBlock();
                    tempblock.ins.push(stmts[i].val.else);
                    entryblock.succ.push(tempblock);
                    exitblock.pred.push(tempblock);
                } else {
                    if (stmts[i].val.else.type == 'ifstmt' || stmts[i].val.else.type == 'whilestmt'){
                    var ret = cfg(stmts[i].val.if);
                    var temp = BasicBlock();
                    ret.exit.succ.push(exitblock);
                    ret.entry.pred.push(temp);
                    entryblock.succ.push(temp);
                    temp.succ.push(ret.entry);
                    temp.pred.push(entryblock);
                    exitblock.pred.push(ret.exit);
                } else {
                    if (stmts[i].val.else.val[0].type == 'ifstmt' ||
                    stmts[i].val.else.val[0].type == 'whilestmt') {
                        var ret = cfg(stmts[i].val.else);
                        var temp = BasicBlock();
                        ret.exit.succ.push(exitblock);
                        ret.entry.pred.push(temp);
                        entryblock.succ.push(temp);
                        temp.succ.push(ret.entry);
                        temp.pred.push(entryblock);
                        exitblock.pred.push(ret.exit);
                    }
                    else {
                        var ret = cfg(stmts[i].val.else);
                        ret.exit.succ.push(exitblock);
                        ret.entry.pred.push(entryblock);
                        entryblock.succ.push(ret.entry);
                        exitblock.pred.push(ret.exit);
                    }
                }
                    // var ret = cfg(stmts[i].val.else);
                    // ret.exit.succ.push(exitblock);
                    // ret.entry.pred.push(entryblock);
                    // entryblock.succ.push(ret.entry);
                    // exitblock.pred.push(ret.exit);
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
            exp.join = exitblock;
            stmts[i].join = exitblock;
        } else {
            var entryblock = BasicBlock();
            // var exitblock = BasicBlock();

            if (bb != undefined) {
                if (Object.keys(retval.entry).length > 0) {
                    bb.pred.push(retval.exit);
                    retval.exit.succ.push(bb);
                    retval.exit = bb;
                } else {
                    retval.entry = bb;
                    retval.exit = bb;
                }
                bb = undefined;
            }

            var exp = new node('while-cond',stmts[i].val.exp);
            entryblock.ins.push(exp);
            var type = stmts[i].val.body.type;
            if ( type == 'expstmt' || type == 'decstmt' || type == 'jmpstmt') {
                var tempblock = BasicBlock();
                tempblock.ins.push(stmts[i].val.body);
                entryblock.succ.push(tempblock);
                entryblock.pred.push(tempblock);
            } else {
                if (stmts[i].val.body.type == 'ifstmt' || stmts[i].val.body.type == 'whilestmt'){
                    var ret = cfg(stmts[i].val.body);
                    var temp = BasicBlock();
                    ret.exit.succ.push(entryblock);
                    ret.entry.pred.push(temp);
                    entryblock.succ.push(temp);
                    temp.succ.push(ret.entry);
                    temp.pred.push(entryblock);
                    entryblock.pred.push(ret.exit);
                } else {
                    if (stmts[i].val.body.val[0].type == 'ifstmt' ||
                    stmts[i].val.body.val[0].type == 'whilestmt') {
                        var ret = cfg(stmts[i].val.body);
                        var temp = BasicBlock();
                        ret.exit.succ.push(entryblock);
                        ret.entry.pred.push(temp);
                        entryblock.succ.push(temp);
                        temp.succ.push(ret.entry);
                        temp.pred.push(entryblock);
                        entryblock.pred.push(ret.exit);
                    }
                    else {
                        var ret = cfg(stmts[i].val.body);
                        ret.exit.succ.push(entryblock);
                        ret.entry.pred.push(entryblock);
                        entryblock.succ.push(ret.entry);
                        entryblock.pred.push(ret.exit);
                    }
                }
                
            }
            if (Object.keys(retval.entry).length > 0) {
                retval.exit.succ.push(entryblock);
                entryblock.pred.push(retval.exit);
                retval.exit = entryblock;
            } else {
                retval.entry = entryblock;
                retval.exit = entryblock;
            }
            exp.join = entryblock;
            stmts[i].join = entryblock;
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
    if (Object.keys(retval.entry).length <= 0){
        retval.entry = BasicBlock();
        retval.exit = retval.entry;
    }
    return retval;
}

function printFunction(func) {
    var str = "";
    for (var x=0; x<func.proto.length; x++) {
        str += func.proto[x].val + " ";
    }
    str += printInstruction(func.ins);
    // console.log(str);
    // console.log(printInstruction(func.ins));
    document.getElementById('mycode').innerHTML = str;
}

function print_single_inst(arg,space) {
    var str = space;
    for (var x=0; x<arg.length; x++) {
        // if (arg[x].val == undefined) {
        //     console.log('undefined');
        //     console.log(arg[x]);
        //     console.log(arg);
        // }
        str += arg[x].val + " ";
    }
    // console.log(str);
    return str+'\n';
}

var labelCounter = 0;

function printInstruction(arg, sp, jump) {
    var stmts;
    var finalStr = "";
    var space = sp || "";
    if (arg.type == 'cmpstmt') {
        stmts = arg.val;
        // console.log(space+'{');
        finalStr += space+"{\n";
        space += "\t";
    } else {
        stmts = [arg];
    }
    for (var i=0; i<stmts.length; i++) {
        // console.log(stmts[i]);
        if (stmts[i].type == 'decstmt') {
            // console.log('hey');
            // console.log(stmts[i].val);
            finalStr += print_single_inst(stmts[i].val,space);
        } else if (stmts[i].type == 'expstmt') {
            finalStr += print_single_inst(stmts[i].val,space);
        } else if (stmts[i].type == 'jmpstmt') {
            finalStr += print_single_inst(stmts[i].val,space);
        } else if (stmts[i].type == 'ifstmt') {
            var str = space+"if ( ";
            for (var x=0; x<stmts[i].val.exp.length; x++) {
                str += stmts[i].val.exp[x].val + " ";
            }
            str += ")";
            // console.log(str);
            finalStr += str+'\n';
            finalStr += printInstruction(stmts[i].val.if,space);
            if (Object.keys(stmts[i].val.else).length > 0) {
                // console.log(space+'else');
                finalStr += space+'else\n';
                finalStr += printInstruction(stmts[i].val.else,space);
            }
            for (var x=0; x<stmts[i].join.ins.length; x++) {
               finalStr += print_single_inst(stmts[i].join.ins[x].val,space); 
            }
        } else {
            var str = space;
            labelCounter++;
            finalStr += "loop_begin_"+labelCounter+':\n';
            // console.log('loop_begin_' + labelCounter + ':');
            for (var x=0; x<stmts[i].join.ins.length-1; x++) {
               finalStr += print_single_inst(stmts[i].join.ins[x].val,space); 
            }
            str += "if (";
            for (var x=0; x<stmts[i].val.exp.length; x++) {
                str += stmts[i].val.exp[x].val + " ";
            }
            str += ")";
            // console.log(str);
            finalStr += str+'\n';
            finalStr += printInstruction(stmts[i].val.body,space,labelCounter);
            
        }
    }

    if (arg.type == 'cmpstmt') {
        space = sp || "";
        if (jump!=undefined) {
            finalStr += '\t'+space+'goto loop_begin_' + jump + ';\n';
            // console.log('\t'+space+'goto loop_begin_' + jump + ';');
        }
        // console.log(space+'}');
        finalStr += space+'}\n';
    }
    return finalStr;
}


function print_basic_block(entry) {
    while(!entry.seen) {
        console.log('basic block starts');
        console.log(entry.ins);
        entry.seen = true;
        console.log('basic block exits')
        for (var x = 0; x < entry.pred.length; x++) {
            print_basic_block(entry.pred[x]);
        }
        for (var x = 0; x < entry.succ.length; x++) {
            print_basic_block(entry.succ[x]);
        }
    }
}

var node = function(x,y) {
    this.type = x;
    this.val = y;
}

// exports.node = node;

var BasicBlock = function() {
    return {
        pred: [],
        succ: [],
        ins: []
    };
}