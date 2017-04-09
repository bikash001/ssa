//parts of instruction
var ipart = {
	type: '',	//type can be 'id', 'op', ''
	val : 		//value of the part
}

var cmpstmt = {
	type: 'cmpstmt',
	val: ['array of statement object']
}

var expstmt = {
	type: 'expstmt',
	val: ['object of instruction parts']
}

var ifstmt = {
	type: 'ifstmt',
	val: {
		'exp': ,
		'if': ,
		'else':
	}
}

var whilestmt = {
	type: 'whilestmt',
	val: {
		'exp': ,
		'body':
	}
}

var jumpstmt = {
	type: 'jmpstmt',
	val: ['instruction parts']
}

var decstmt = {
	type: 'decstmt',
	val: ['instruction parts']
}