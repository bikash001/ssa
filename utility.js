function changeId(temp, globalKeys, definedKeys, keys, keyList, parentJoinNode) {
    if (temp.length > 2) {
        if (temp[1].val == '=') {
            for (var x=2; x<temp.length; x++) {
                if (temp[x].type == 'id') {
                    // console.log(stmts[i].val[x].val, 'test');
                    if (definedKeys[temp[x].val] != undefined) {
                    	temp[x].val += definedKeys[temp[x].val];
                    } else if (keys[temp[x].val] != undefined) {
                    	temp[x].val += keys[temp[x].val];
                    } else {
                    	if (parentJoinNode[temp[x].val] != undefined) {
                    		parentJoinNode[temp[x].val].push(temp[x]);
                    	} else {
                    		parentJoinNode[temp[x].val] = [temp[x]];
                    	}
                    	temp[x].val += keyList[temp[x].val];
                    }
                }
            }
            globalKeys[temp[0].val] += 1;
            definedKeys[temp[0].val] = globalKeys[temp[0].val];
            temp[0].val += globalKeys[temp[0].val];
        } else {
            for (var x=0; x<temp.length; x++) {
            	if (temp[x].type == 'id') {
	                if (definedKeys[temp[x].val] != undefined) {
	                	temp[x].val += definedKeys[temp[x].val];
	                } else {
	                	if (parentJoinNode[temp[x].val] != undefined) {
	                		parentJoinNode[temp[x].val].push(temp[x]);
	                	} else {
	                		parentJoinNode[temp[x].val] = [temp[x]];
	                	}
	                	temp[x].val += keyList[temp[x].val];
	                }
	            }
            }
        }
    }
    
}

exports.cfg = function cfg(cmpstmt, globalKeys, definedKeys, keyList, parentJoinNode) {
    var retval = {entry: {}, exit: {}, keys: {}};
    var locallyDefined = retval.keys;
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
                    locallyDefined[temp[x].val] = 0;
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
            changeId(temp, globalKeys, locallyDefined, definedKeys, keyList, parentJoinNode);
        } else if (stmts[i].type == 'jmpstmt') {
            if (bb == undefined) {
                bb = BasicBlock();
            }
            bb.ins.push(stmts[i]);
            changeId(stmts[i].val, globalKeys, locallyDefined, definedKeys, keyList, parentJoinNode);
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
            changeId(temp.exp, globalKeys, locallyDefined, definedKeys, keyList, parentJoinNode);
            var exp = new node('if-cond',temp.exp);
            entryblock.ins.push(exp);
            var type = temp.if.type;
            var oldKey;
            var ifkeyList = {};
            var elkeyList = {};
            var tempKeyList = Object.create(definedKeys);
            for (var x in keyList) {
            	if (tempKeyList[x] == undefined) {
            		tempKeyList[x] = keyList[x];
            	}
            }
            // if ( type == 'expstmt' || type == 'decstmt' || type == 'jmpstmt') {
                
                var ret = cfg(temp.if,globalKeys,locallyDefined, keyList,parentJoinNode);
                ifkeyList = ret.keys;
                // var tempblock = BasicBlock();
                // tempblock.ins.push(temp.if);
                ret.exit.succ.push(exitblock);
                ret.entry.pred.push(entryblock);
                entryblock.succ.push(ret.entry);
                exitblock.pred.push(ret.exit);
                // changeId(temp.if.val, globalKeys, ifkeyList);
                // for (var key in ifkeyList) {
                //     keyList[key] = "";
                // }
//here we come

            // } else{
            //     oldKey = Object.create(globalKeys);
            //     var ret = cfg(stmts[i].val.if, globalKeys, );
            //     ret.exit.succ.push(exitblock);
            //     ret.entry.pred.push(entryblock);
            //     entryblock.succ.push(ret.entry);
            //     exitblock.pred.push(ret.exit);
            // }
            if (Object.keys(temp.else).length > 0) {
                type = temp.else.type;
                var ret = cfg(temp.else,globalKeys,locallyDefined, keyList,parentJoinNode);
                elkeyList = ret.keys;
                // var tempblock = BasicBlock();
                // tempblock.ins.push(temp.if);
                ret.exit.succ.push(exitblock);
                ret.entry.pred.push(entryblock);
                entryblock.succ.push(ret.entry);
                exitblock.pred.push(ret.exit);
                // if (type == 'expstmt' || type == 'decstmt' || type == 'jmpstmt') {
                //     var tempblock = BasicBlock();
                //     tempblock.ins.push(stmts[i].val.else);
                //     entryblock.succ.push(tempblock);
                //     exitblock.pred.push(tempblock);
                // } else {
                //     var ret = cfg(stmts[i].val.else);
                //     ret.exit.succ.push(exitblock);
                //     ret.entry.pred.push(entryblock);
                //     entryblock.succ.push(ret.entry);
                //     exitblock.pred.push(ret.exit);
                // }
            } else {
                exitblock.pred.push(entryblock);
                entryblock.succ.push(exitblock);
            }

            var tempNode;
			for (var x in ifkeyList) {
				globalKeys[x] += 1;
				if (elkeyList[x] != undefined) {
					// console.log(1,x+globalKeys[x]+' = Phi('+x+ifkeyList[x]+","+x+elkeyList[x]+")");
					exitblock.ins.push({type:'exp',val: [new node('',x+globalKeys[x]+' = Phi('+x+ifkeyList[x]+","+x+elkeyList[x]+")")]});
				} else {
					// console.log(2,x+globalKeys[x]+' = Phi('+x+ifkeyList[x]+","+x+keyList[x]+")");
					tempNode = new node('id',x+keyList[x]);
					if (parentJoinNode[x] != undefined) {
						parentJoinNode[x].push(tempNode);
					} else {
						parentJoinNode[x] = [tempNode];
					}
					exitblock.ins.push({type:'exp',val: [new node('',x+globalKeys[x]+' = Phi('+x+ifkeyList[x]+","), tempNode, new node('',")")]});
				}
				locallyDefined[x] = globalKeys[x];
			}
			for (var x in elkeyList) {
				if (ifkeyList[x] == undefined) {
					globalKeys[x] += 1;
					tempNode = new node('id',x+keyList[x]);
					if (parentJoinNode[x] != undefined) {
						parentJoinNode[x].push(tempNode);
					} else {
						parentJoinNode[x] = [tempNode];
					}
					// console.log(3,x+globalKeys[x]+' = Phi('+x+keyList[x]+","+x+elkeyList[x]+")");
					exitblock.ins.push({type:'exp',val: [new node('',x+globalKeys[x]+' = Phi('),tempNode,new node('',","+elkeyList[x]+")")]});
					locallyDefined[x] = globalKeys[x];
				}
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

            temp = stmts[i].val;
            
            var whileKeys = Object.create(keyList);
            for (var x in definedKeys) {
            	whileKeys[x] = definedKeys[x];
            }

            // console.log(locallyDefined);
            // console.log(whileKeys);
            // console.log(temp.exp);
            changeId(temp.exp, globalKeys, locallyDefined, whileKeys, {}, parentJoinNode);
            // console.log(temp.exp);
            var exp = new node('while-cond',temp.exp);
            // entryblock.ins.push(exp);
            var type = temp.body.type;
            var joinNode = {};

            for (var x in locallyDefined) {
            	whileKeys[x] = locallyDefined[x];
            }

            // console.log(whileKeys);
            // console.log(temp.body.val[0]);
            var ret = cfg(temp.body,globalKeys,{},whileKeys,joinNode);
            var tempLocal = ret.keys;
            // console.log(tempLocal);
            // if ( type == 'expstmt' || type == 'decstmt' || type == 'jmpstmt') {
            //     var tempblock = BasicBlock();
            //     tempblock.ins.push(stmts[i].val.body);
            //     entryblock.succ.push(tempblock);
            //     entryblock.pred.push(tempblock);
            // } else {
            //     var ret = cfg(stmts[i].val.body);
            //     ret.exit.succ.push(entryblock);
            //     ret.entry.pred.push(entryblock);
            //     entryblock.succ.push(ret.entry);
            //     entryblock.pred.push(ret.exit);
            // }
            for (var x in tempLocal) {
            	globalKeys[x] += 1;
            	temp = new node('id',x+whileKeys[x]);
            	entryblock.ins.push({type:'exp',val: [new node('',x+globalKeys[x]+' = Phi('+x+tempLocal[x]+","), temp, new node('',")")]});	
            	locallyDefined[x] = globalKeys[x];
            	if (parentJoinNode[x] != undefined) {
            		parentJoinNode[x].push(temp);
            	} else {
            		parentJoinNode[x] = [temp];
            	}
            }
            entryblock.ins.push(exp);
            for (var x in tempLocal) {
            	if (joinNode[x] != undefined) {
            		for (var y=0; y<joinNode[x].length; y++) {
            			joinNode[x][y].val = x+globalKeys[x];
            		}
            	}
            }

            // console.log('heyldsj');
            // console.log(exp);
            for (var x=0; x<exp.val.length; x++) {
            	if (exp.val[x].type == 'id') {
            		if (tempLocal[exp.val[x].val] != undefined) {
            			tempLocal[exp.val[x].val] = globalKeys[exp.val[x].val];
            		} else {
            			if (parentJoinNode[exp.val[x].val] != undefined) {
            				parentJoinNode[exp.val[x].val].push(exp.val[x]);
            			} else {
            				parentJoinNode[exp.val[x].val] = [exp.val[x]];
            			}
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
            stmts[i].join = entryblock;
            // console.log('----------');
            // console.log(definedKeys);
            // console.log('-----------');
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
    var ret = printInstruction(func.ins);
    console.log(ret);
}

function print_single_inst(arg,space) {
    var str = space;
    for (var x=0; x<arg.length; x++) {
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
        finalStr += space+"{\n";
        space += "\t";
    } else {
        stmts = [arg];
    }
    for (var i=0; i<stmts.length; i++) {
        if (stmts[i].type == 'decstmt') {
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
            finalStr += str+'\n';
            finalStr += printInstruction(stmts[i].val.if,space);
            if (Object.keys(stmts[i].val.else).length > 0) {
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
            var temp = stmts[i].join.ins;
            for (var x=0; x<temp.length-1; x++) {
               finalStr += print_single_inst(stmts[i].join.ins[x].val,space); 
            }
            str += "if (";
            for (var x=0; x<temp[temp.length-1].val.length; x++) {
                str += temp[temp.length-1].val[x].val + " ";
            }
            str += ")";
            // console.log(str);
            // console.log(finalStr);
            finalStr += str+'\n';
            finalStr += printInstruction(stmts[i].val.body,space,labelCounter);
        }
    }

    if (arg.type == 'cmpstmt') {
        space = sp || "";
        if (jump!=undefined) {
            finalStr += '\t'+space+'goto loop_begin_' + jump + ';\n';
        }
        finalStr += space+'}\n';
    }
    // console.log(finalStr);
    return finalStr;
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