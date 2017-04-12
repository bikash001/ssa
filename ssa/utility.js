$(document).ready(function(){
    
function getCopy(arg) {
	var obj = {};
	for (var x in arg) {
		obj[x] = arg[x];
	}
	return obj;
}

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
        }
    }
    
}

function cfg(cmpstmt, globalKeys, definedKeys, keyList, parentJoinNode) {
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
                print();
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
            var tempKeyList = getCopy(definedKeys);
            
            for (var x in locallyDefined) {
            	tempKeyList[x] = locallyDefined[x];
            }

            var ret = cfg(temp.if,globalKeys,tempKeyList, keyList,parentJoinNode);
            
            ifkeyList = ret.keys;
            ret.exit.succ.push(exitblock);
            ret.entry.pred.push(entryblock);
            entryblock.succ.push(ret.entry);
            exitblock.pred.push(ret.exit);
            print();

            if (Object.keys(temp.else).length > 0) {
                type = temp.else.type;
                var ret = cfg(temp.else,globalKeys,tempKeyList, keyList,parentJoinNode);
                elkeyList = ret.keys;
                // var tempblock = BasicBlock();
                // tempblock.ins.push(temp.if);
                ret.exit.succ.push(exitblock);
                ret.entry.pred.push(entryblock);
                entryblock.succ.push(ret.entry);
                exitblock.pred.push(ret.exit);
                print();
            } else {
                exitblock.pred.push(entryblock);
                entryblock.succ.push(exitblock);
            }

            var tempNode;
			for (var x in ifkeyList) {
				globalKeys[x] += 1;
				if (elkeyList[x] != undefined) {
					// console.log(1,x+globalKeys[x]+' = Phi('+x+ifkeyList[x]+","+x+elkeyList[x]+")");
					exitblock.ins.push({type:'exp',val: [new node('',x+globalKeys[x]+' = Φ('+x+ifkeyList[x]+","+x+elkeyList[x]+")")]});
				} else {
					// console.log(2,x+globalKeys[x]+' = Phi('+x+ifkeyList[x]+","+x+keyList[x]+")");
					if (tempKeyList[x] != undefined) {
						tempNode = new node('id',x+tempKeyList[x]);
					} else {
						tempNode = new node('id',x+keyList[x]);
						if (parentJoinNode[x] != undefined) {
							parentJoinNode[x].push(tempNode);
						} else {
							parentJoinNode[x] = [tempNode];
						}
					}
					exitblock.ins.push({type:'exp',val: [new node('',x+globalKeys[x]+' = Φ( '+x+ifkeyList[x]+","), tempNode, new node('',")")]});
				}
				locallyDefined[x] = globalKeys[x];
			}
			for (var x in elkeyList) {
				if (ifkeyList[x] == undefined) {
					globalKeys[x] += 1;
					if (tempKeyList[x] != undefined) {
						tempNode = new node('id',x+tempKeyList[x]);
					} else {
						tempNode = new node('id',x+keyList[x]);
						if (parentJoinNode[x] != undefined) {
							parentJoinNode[x].push(tempNode);
						} else {
							parentJoinNode[x] = [tempNode];
						}
					}
					// tempNode = new node('id',x+keyList[x]);
					
					// console.log(3,x+globalKeys[x]+' = Phi('+x+keyList[x]+","+x+elkeyList[x]+")");
					exitblock.ins.push({type:'exp',val: [new node('',x+globalKeys[x]+' = Φ('),tempNode,new node('',","+x+elkeyList[x]+" )")]});
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
            print();
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
                print();
            }

            temp = stmts[i].val;
            
            var whileKeys = getCopy(keyList);
            // console.log('copy', whileKeys);

            for (var x in definedKeys) {
            	whileKeys[x] = definedKeys[x];
            }

            // changeId(temp.exp, globalKeys, locallyDefined, whileKeys, {}, parentJoinNode);
            var exp = new node('while-cond',temp.exp);
            // entryblock.ins.push(exp);
            var type = temp.body.type;
            var joinNode = {};

            for (var x in locallyDefined) {
            	whileKeys[x] = locallyDefined[x];
            }

            var ret = cfg(temp.body,globalKeys,{},whileKeys,joinNode);
            var tempLocal = ret.keys;
            print();
            for (var x in tempLocal) {
            	globalKeys[x] += 1;
            	temp = new node('id',x+whileKeys[x]);
            	entryblock.ins.push({type:'exp',val: [new node('',x+globalKeys[x]+' = Φ( '+x+tempLocal[x]+","), temp, new node('',")")]});	
            	locallyDefined[x] = globalKeys[x];
            	if (parentJoinNode[x] != undefined) {
            		parentJoinNode[x].push(temp);
            	} else {
            		parentJoinNode[x] = [temp];
            	}
            }
            entryblock.ins.push(exp);
            stmts[i].join = entryblock;
            if (Object.keys(tempLocal).length > 0) {
                print();
            }

            for (var x in tempLocal) {
            	if (joinNode[x] != undefined) {
            		for (var y=0; y<joinNode[x].length; y++) {
            			joinNode[x][y].val = x+globalKeys[x];
            		}
            	}
            }
            
            temp = stmts[i].val.exp;
            for (var x=0; x<temp.length; x++) {
            	if (temp[x].type == 'id') {
            		if (tempLocal[temp[x].val] != undefined) {
            			temp[x].val += globalKeys[temp[x].val];
            		} else {
            			if (parentJoinNode[temp[x].val] != undefined) {
            				parentJoinNode[temp[x].val].push(temp[x]);
            			} else {
            				parentJoinNode[temp[x].val] = [temp[x]];
            			}
            			temp[x].val += whileKeys[temp[x].val];
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
            print();
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

function printFunction(func) {
    var str = "";
    for (var x=0; x<func.proto.length; x++) {
        str += func.proto[x].val + " ";
    }
    str += "\n";
    str += printInstruction(func.ins);
    return str+"\n";
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
            if (stmts[i].join != undefined) {
                for (var x=0; x<stmts[i].join.ins.length; x++) {
                   finalStr += print_single_inst(stmts[i].join.ins[x].val,space); 
                }
            }
        } else {
            var str = space;
            var temp;
            if (stmts[i].join != undefined) {
                labelCounter++;
                finalStr += "loop_begin_"+labelCounter+':\n';
                temp = stmts[i].join.ins;
                for (var x=0; x<temp.length-1; x++) {
                   finalStr += print_single_inst(stmts[i].join.ins[x].val,space); 
                }
                str += "if ( ";
                for (var x=0; x<temp[temp.length-1].val.length; x++) {
                    str += temp[temp.length-1].val[x].val + " ";
                }
                str += ")";
                finalStr += str+'\n';
                finalStr += printInstruction(stmts[i].val.body,space,labelCounter);
            } else {
                temp = stmts[i].val.exp;
                str += 'while ( ';
                for (var x=0; x<temp.length; x++) {
                    str += temp[x].val+' ';
                }
                str += ")";
                finalStr += str+'\n';
                finalStr += printInstruction(stmts[i].val.body,space);
            }
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


var BasicBlock = function() {
    return {
        pred: [],
        succ: [],
        ins: []
    };
}


function exec (input) {
    return c.parse(input);
}

var rootNode;
var dataList = []

function print() {
    labelCounter = 0;
    dataList.push(printFunction(rootNode));
}

$('#start_btn').click(function(){  
    rootNode = exec($('#code').val());
    var g = cfg(rootNode.ins, {}, {}, {}, {});
    var node = g.entry;
    print();
});



});