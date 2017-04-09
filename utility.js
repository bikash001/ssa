function changeId(temp, globalKeys, keys, definedKey) {
    // if (test) {
    //     console.log('hello');
    //     console.log(globalKeys);
    // }
    if (temp.length > 2) {
        if (temp[1].val == '=') {
            for (var x=2; x<temp.length; x++) {
                if (temp[x].type == 'id') {
                    // console.log(stmts[i].val[x].val, 'test');
                    if (definedKey.hasOwnProperty(temp[x].val)) {
                        temp[x].val += definedKey[temp[x].val];
                    } else {
                        temp[x].val += keys[temp[x].val]
                    }
                }
            }
            globalKeys[temp[0].val] += 1;
            definedKey[temp[0].val] = globalKeys[temp[0].val];
            temp[0].val += globalKeys[temp[0].val];
        } else {
            for (var x=0; x<temp.length; x++) {
                if (temp[x].type == 'id') {
                    if (definedKey.hasOwnProperty(temp[x].val)) {
                        temp[x].val += definedKey[temp[x].val];
                    } else {
                        temp[x].val += keys[temp[x].val]
                    }
                }
            }
        }
    }
    
}

function propagateVars(stmt, keys) {
    var stmts;
    var temp;
    var tempkeys = {};
    if (stmt.type == 'cmpstmt') {
        stmts = cmpstmt.val;
        // console.log(stmts);
    } else {
        stmts = [stmt];
    }

    for (var i=0; i<stmts.length; i++) {
        // console.log(stmts[i]);
        if (stmts[i].type == 'decstmt') {
            temp = stmts[i].val;
            for (var x=0; x<temp.length; x++) {
                if (temp[x].type == 'id') {
                    keys[x] = '';
                }
            }
        } else if (stmts[i].type == 'expstmt') {
            temp = stmts[i].val;
            if (temp.length > 2) {
                if (temp[1].val == '=') {
                   keys[x] = ""; 
                }
            }
        } else if (stmts[i].type == 'ifstmt') {

            temp = stmts[i].val;
            type = temp.type
            if ( type == 'expstmt' || type == 'decstmt') {  
                propagateVars(temp,tempKeys);
            } else if (type == 'cmpstmt') {
                
            } else if (type == 'ifstmt' || type == 'whilestmt'){
                
            }
            if (Object.keys(stmts[i].val.else).length > 0) {
                type = stmts[i].val.else.type;
                if (type == 'expstmt' || type == 'decstmt' || type == 'jmpstmt') {
                    var tempblock = BasicBlock();
                    tempblock.ins.push(stmts[i].val.else);
                    entryblock.succ.push(tempblock);
                    exitblock.pred.push(tempblock);
                    
                    var tempKeys = getCopy(keyList);
                    for (var key in definedKey) {
                        tempKeys[key] = definedKey[key];
                    }
                    changeId(temp.if.val, globalKeys, tempKeys, elkeyList);
                } else {
                    var tempKeys = getCopy(keyList);
                    for (var key in definedKey) {
                        tempKeys[key] = definedKey[key];
                    }
                    var ret = cfg(stmts[i].val.else, globalKeys, tempKeys, elkeyList);
                    ret.exit.succ.push(exitblock);
                    ret.entry.pred.push(entryblock);
                    entryblock.succ.push(ret.entry);
                    exitblock.pred.push(ret.exit);
                }
            } else {
                exitblock.pred.push(entryblock);
                entryblock.succ.push(exitblock);
            }

            for (var x in ifkeyList) {
                globalKeys[x] += 1;
                if (elkeyList[x] != undefined) {
                    // console.log(1,x+globalKeys[x]+' = Phi('+x+ifkeyList[x]+","+x+elkeyList[x]+")");
                    exitblock.ins.push({type:'exp',val: [new node('',x+globalKeys[x]+' = Phi('+x+ifkeyList[x]+","+x+elkeyList[x]+")")]});
                } else {
                    // console.log(2,x+globalKeys[x]+' = Phi('+x+ifkeyList[x]+","+x+keyList[x]+")");
                    exitblock.ins.push({type:'exp',val: [new node('',x+globalKeys[x]+' = Phi('+x+ifkeyList[x]+","+x+keyList[x]+")")]});
                }
            }
            for (var x in elkeyList) {
                if (ifkeyList[x] == undefined) {
                    globalKeys[x] += 1;
                    // console.log(3,x+globalKeys[x]+' = Phi('+x+keyList[x]+","+x+elkeyList[x]+")");
                    exitblock.ins.push({type:'exp',val: [new node('',x+globalKeys[x]+' = Phi('+x+elkeyList[x]+","+x+keyList[x]+")")]});
                }
            }
            console.log(test);
            if (Object.keys(retval.entry).length > 0) {
                retval.exit.succ.push(entryblock);
                entryblock.pred.push(retval.exit);
                retval.exit = exitblock;
            } else {
                retval.entry = entryblock;
                retval.exit = exitblock;
            }
            ifkeyList = {};
            elkeyList = {};
            exp.join = exitblock;
            stmts[i].join = exitblock;
        } else {
            var entryblock = BasicBlock();
            var whilekeyList = {};
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

            temp = stmts[i].val;
            changeId(temp.exp, globalKeys, keyList, definedKey);
            var exp = new node('while-cond',temp.exp);
            entryblock.ins.push(exp);
            var type = temp.body.type;

            if ( type == 'expstmt' || type == 'decstmt' || type == 'jmpstmt') {
                var tempblock = BasicBlock();
                tempblock.ins.push(temp.body);
                entryblock.succ.push(tempblock);
                entryblock.pred.push(tempblock);
                var tempKeys = getCopy(keyList);
                for (var key in definedKey) {
                    tempKeys[key] = definedKey[key];
                }
                changeId(temp.body.val, globalKeys, tempKeys, whilekeyList);
            } else {
                var list = {};
                propagateVars(stmts[i].val.body,list);
                var ret = cfg(stmts[i].val.body);
                ret.exit.succ.push(entryblock);
                ret.entry.pred.push(entryblock);
                entryblock.succ.push(ret.entry);
                entryblock.pred.push(ret.exit);
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
}

function getCopy(vals) {
    var obj = {};
    for (var x in vals) {
        obj[x] = vals[x];
    }
    return obj;
}

exports.cfg = function cfg(cmpstmt, globalKeys, keyList, definedKey) {
    // parentJoinNode = parentJoinNode || {};
    keyList = keyList || {};
    globalKeys = globalKeys || {};
    definedKey = definedKey || {};

    var retval = {entry: {}, exit: {}};
    var bb;
    var stmts;
    var temp;
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
            temp = stmts[i].val;
            for (var x=0; x<temp.length; x++) {
                if (temp[x].type == 'id') {
                    definedKey[temp[x].val] = 0;
                    globalKeys[temp[x].val] = 0;
                    temp[x].val += '0';
                }
            }
        } else if (stmts[i].type == 'expstmt') {
            if (bb == undefined) {
                bb = BasicBlock();
            }
            bb.ins.push(stmts[i]);
            temp = stmts[i].val;
            changeId(temp, globalKeys, keyList, definedKey);

        } else if (stmts[i].type == 'jmpstmt') {
            if (bb == undefined) {
                bb = BasicBlock();
            }
            bb.ins.push(stmts[i]);
            changeId(stmts[i].val, globalKeys, keyList, definedKey);
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

            temp = stmts[i].val;
            // console.log(temp.exp);
            changeId(temp.exp, globalKeys, keyList, definedKey);
            var exp = new node('if-cond',temp.exp);
            entryblock.ins.push(exp);
            var type = temp.if.type;
            var oldKey;
            var ifkeyList = {};
            var elkeyList = {};
            if ( type == 'expstmt' || type == 'decstmt' || type == 'jmpstmt') {
                var tempblock = BasicBlock();
                tempblock.ins.push(temp.if);
                entryblock.succ.push(tempblock);
                exitblock.pred.push(tempblock);
                var tempKeys = getCopy(keyList);
                for (var key in definedKey) {
                    tempKeys[key] = definedKey[key];
                }
                changeId(temp.if.val, globalKeys, tempKeys, ifkeyList);
            } else{
                var tempKeys = getCopy(keyList);
                for (var key in definedKey) {
                    tempKeys[key] = definedKey[key];
                }
                var ret = cfg(stmts[i].val.if, globalKeys, tempKeys, ifkeyList);
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
                    
                    var tempKeys = getCopy(keyList);
                    for (var key in definedKey) {
                        tempKeys[key] = definedKey[key];
                    }
                    changeId(temp.if.val, globalKeys, tempKeys, elkeyList);
                } else {
                    var tempKeys = getCopy(keyList);
                    for (var key in definedKey) {
                        tempKeys[key] = definedKey[key];
                    }
                    var ret = cfg(stmts[i].val.else, globalKeys, tempKeys, elkeyList);
                    ret.exit.succ.push(exitblock);
                    ret.entry.pred.push(entryblock);
                    entryblock.succ.push(ret.entry);
                    exitblock.pred.push(ret.exit);
                }
            } else {
                exitblock.pred.push(entryblock);
                entryblock.succ.push(exitblock);
            }

            for (var x in ifkeyList) {
                globalKeys[x] += 1;
                if (elkeyList[x] != undefined) {
                    // console.log(1,x+globalKeys[x]+' = Phi('+x+ifkeyList[x]+","+x+elkeyList[x]+")");
                    exitblock.ins.push({type:'exp',val: [new node('',x+globalKeys[x]+' = Phi('+x+ifkeyList[x]+","+x+elkeyList[x]+")")]});
                } else {
                    // console.log(2,x+globalKeys[x]+' = Phi('+x+ifkeyList[x]+","+x+keyList[x]+")");
                    exitblock.ins.push({type:'exp',val: [new node('',x+globalKeys[x]+' = Phi('+x+ifkeyList[x]+","+x+keyList[x]+")")]});
                }
            }
            for (var x in elkeyList) {
                if (ifkeyList[x] == undefined) {
                    globalKeys[x] += 1;
                    // console.log(3,x+globalKeys[x]+' = Phi('+x+keyList[x]+","+x+elkeyList[x]+")");
                    exitblock.ins.push({type:'exp',val: [new node('',x+globalKeys[x]+' = Phi('+x+elkeyList[x]+","+x+keyList[x]+")")]});
                }
            }
            console.log(test);
            if (Object.keys(retval.entry).length > 0) {
                retval.exit.succ.push(entryblock);
                entryblock.pred.push(retval.exit);
                retval.exit = exitblock;
            } else {
                retval.entry = entryblock;
                retval.exit = exitblock;
            }
            ifkeyList = {};
            elkeyList = {};
            exp.join = exitblock;
            stmts[i].join = exitblock;
        } else {
            var entryblock = BasicBlock();
            var whilekeyList = {};
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

            temp = stmts[i].val;
            changeId(temp.exp, globalKeys, keyList, definedKey);
            var exp = new node('while-cond',temp.exp);
            entryblock.ins.push(exp);
            var type = temp.body.type;

            if ( type == 'expstmt' || type == 'decstmt' || type == 'jmpstmt') {
                var tempblock = BasicBlock();
                tempblock.ins.push(temp.body);
                entryblock.succ.push(tempblock);
                entryblock.pred.push(tempblock);
                var tempKeys = getCopy(keyList);
                for (var key in definedKey) {
                    tempKeys[key] = definedKey[key];
                }
                changeId(temp.body.val, globalKeys, tempKeys, whilekeyList);
            } else {
                var list = {};
                propagateVars(stmts[i].val.body,list);
                var ret = cfg(stmts[i].val.body);
                ret.exit.succ.push(entryblock);
                ret.entry.pred.push(entryblock);
                entryblock.succ.push(ret.entry);
                entryblock.pred.push(ret.exit);
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

exports.printFunction = function printFunction(func) {
    var str = "";
    for (var x=0; x<func.proto.length; x++) {
        str += func.proto[x].val + " ";
    }
    console.log(str);
    printInstruction(func.ins);
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
    console.log(str);
}

function printInstruction(arg, sp) {
    var stmts;
    var space = sp || "";
    if (arg.type == 'cmpstmt') {
        stmts = arg.val;
        console.log(space+'{');
        space += "\t";
    } else {
        stmts = [arg];
    }

    for (var i=0; i<stmts.length; i++) {
        // console.log(stmts[i]);
        if (stmts[i].type == 'decstmt') {
            // console.log('hey');
            // console.log(stmts[i].val);
            print_single_inst(stmts[i].val,space);
        } else if (stmts[i].type == 'expstmt') {
            print_single_inst(stmts[i].val,space);
        } else if (stmts[i].type == 'jmpstmt') {
            print_single_inst(stmts[i].val,space);
        } else if (stmts[i].type == 'ifstmt') {
            var str = space+"if ( ";
            for (var x=0; x<stmts[i].val.exp.length; x++) {
                str += stmts[i].val.exp[x].val + " ";
            }
            str += ")";
            console.log(str);
            printInstruction(stmts[i].val.if,space);
            if (Object.keys(stmts[i].val.else).length > 0) {
                console.log(space+'else');
                printInstruction(stmts[i].val.else,space);
            }
            // console.log('hey', stmts[i].join.ins.length);
            for (var x=0; x<stmts[i].join.ins.length; x++) {
               print_single_inst(stmts[i].join.ins[x].val,space); 
            }
            
        } else {
            var str = space+"while ( ";
            for (var x=0; x<stmts[i].val.exp.length; x++) {
                str += stmts[i].val.exp[x].val + " ";
            }
            str += ")";
            console.log(str);
            printInstruction(stmts[i].val.body,space);
        }
    }

    if (arg.type == 'cmpstmt') {
        space = sp || "";
        console.log(space+'}');
    }
}


// var ret = exports.parser.parse(source);
//     // cfg(ret);
//     var temp = ret.ins.val;
//     for (var i=0; i<temp.length; i++) {
//         if (temp[i].type == 'expstmt') {
//             console.log(temp[i]);
//         }
//         // console.log(temp[i]);
//         if (temp[i].type == 'ifstmt') {
//             console.log('ifstmt');
//             console.log(temp[i].val.exp);
//             console.log(temp[i].val.if);
//             console.log(temp[i].val.else);
//         } else if (temp[i].type == 'whilestmt') {
//             console.log('whilestmt');
//             console.log(temp[i].val.exp);
//             console.log(temp[i].val.body);
//         }
//     }
//     return ret;
exports.print_basic_block = function print_basic_block(entry) {
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

exports.node = node;

var BasicBlock = function() {
    return {
        pred: [],
        succ: [],
        ins: []
    };
}