%{
var node = function(x,y) {
	this.type = x;
	this.val = y;
};
%}

%lex

%%

"#include"' '*'<'[a-zA-Z]*'.h'' '*'>'	;

"/*"                                    ;
"//".*                                    { /* consume //-comment */ }

"auto"					{ return('AUTO'); }
"break"					{ return('BREAK'); }
"case"					{ return('CASE'); }
"char"					{ return('CHAR'); }
"const"					{ return('CONST'); }
"continue"				{ return('CONTINUE'); }
"default"				{ return('DEFAULT'); }
"do"					{ return('DO'); }
"double"				{ return('DOUBLE'); }
"else"					{ return('ELSE'); }
"enum"					{ return('ENUM'); }
"extern"				{ return('EXTERN'); }
"float"					{ return('FLOAT'); }
"for"					{ return('FOR'); }
"goto"					{ return('GOTO'); }
"if"					{ return('IF'); }
"inline"				{ return('INLINE'); }
'int'					{ return('INT'); }
"long"					{ return('LONG'); }
"register"				{ return('REGISTER'); }
"restrict"				{ return('RESTRICT'); }
"return"				{ return('RETURN'); }
"short"					{ return('SHORT'); }
"signed"				{ return('SIGNED'); }
"sizeof"				{ return('SIZEOF'); }
"static"				{ return('STATIC'); }
"struct"				{ return('STRUCT'); }
"switch"				{ return('SWITCH'); }
"typedef"				{ return('TYPEDEF'); }
"union"					{ return('UNION'); }
"unsigned"				{ return('UNSIGNED'); }
"void"					{ return('VOID'); }
"volatile"				{ return('VOLATILE'); }
"while"					{ return('WHILE'); }


[a-zA-Z_][a-zA-Z1-9]* 	{ return "IDENTIFIER";}

\"(\\.|[^\\"])*\"		{ return 'STRING'; }

"..."					{ return 'ELLIPSIS'; }
">>="					{ return 'RIGHT_ASSIGN'; }
"<<="					{ return 'LEFT_ASSIGN'; }
"+="					{ return 'ADD_ASSIGN'; }
"-="					{ return 'SUB_ASSIGN'; }
"*="					{ return 'MUL_ASSIGN'; }
"/="					{ return 'DIV_ASSIGN'; }
"%="					{ return 'MOD_ASSIGN'; }
"&="					{ return 'AND_ASSIGN'; }
"^="					{ return 'XOR_ASSIGN'; }
"|="					{ return 'OR_ASSIGN'; }
">>"					{ return 'RIGHT_OP'; }
"<<"					{ return 'LEFT_OP'; }
"++"					{ return 'INC_OP'; }
"--"					{ return 'DEC_OP'; }
"->"					{ return 'PTR_OP'; }
"&&"					{ return 'AND_OP'; }
"||"					{ return 'OR_OP'; }
"<="					{ return 'LE_OP'; }
">="					{ return 'GE_OP'; }
"=="					{ return 'EQ_OP'; }
"!="					{ return 'NE_OP'; }
";"					{ return ';'; }
("{"|"<%")				{ return '{'; }
("}"|"%>")				{ return '}'; }
","					{ return ','; }
":"					{ return ':'; }
"="					{ return '='; }
"("					{ return '('; }
")"					{ return ')'; }
("["|"<:")				{ return '['; }
("]"|":>")				{ return ']'; }
"."					{ return '.'; }
"&"					{ return '&'; }
"!"					{ return '!'; }
"~"					{ return '~'; }
"-"					{ return '-'; }
"+"					{ return '+'; }
"*"					{ return '*'; }
"/"					{ return '/'; }
"%"					{ return '%'; }
"<"					{ return '<'; }
">"					{ return '>'; }
"^"					{ return '^'; }
"|"					{ return '|'; }
"?"					{ return '?'; }

[-\+]?[0-9]+			{ return 'CONSTANT'; }

\s+				;
.					{ /* discard bad characters */ }

/lex

%token IDENTIFIER CONSTANT STRING SIZEOF
%token PTR_OP INC_OP DEC_OP LEFT_OP RIGHT_OP LE_OP GE_OP EQ_OP NE_OP
%token AND_OP OR_OP MUL_ASSIGN DIV_ASSIGN MOD_ASSIGN ADD_ASSIGN
%token SUB_ASSIGN LEFT_ASSIGN RIGHT_ASSIGN AND_ASSIGN
%token XOR_ASSIGN OR_ASSIGN TYPE_NAME

%token TYPEDEF EXTERN STATIC AUTO REGISTER
%token CHAR SHORT INT LONG SIGNED UNSIGNED FLOAT DOUBLE CONST VOLATILE VOID
%token STRUCT UNION ENUM ELLIPSIS

%token CASE DEFAULT IF ELSE SWITCH WHILE DO FOR GOTO CONTINUE BREAK RETURN

%nonassoc IF_WITHOUT_ELSE
%nonassoc ELSE

%start translation_unit
%%

primary_expression
	: IDENTIFIER {$$ = [new node('id',yytext)];}
	| CONSTANT 	{$$ = [new node('const',parseInt(yytext))];}
	| STRING 	{$$ = [new node('str',yytext)];}
	| '(' expression ')' 	{
		var list = [new node('br','(')].concat($2);
		list.push(new node('br',')'));
		$$ = list;}
	;

postfix_expression
	: primary_expression 	{$$ = $1;}
	| postfix_expression '[' expression ']'
	| postfix_expression '(' ')' 	{$1.push(new node('br','('));
									$1.push(new node('br','('));
									$$ = $1;}
	| postfix_expression '(' argument_expression_list ')' 	{$1.push(new node('br','('));
															$$ = $1.concat($3);
															$$.push(new node('br',')'));}
	| postfix_expression '.' IDENTIFIER
	| postfix_expression PTR_OP IDENTIFIER
	| postfix_expression INC_OP
	| postfix_expression DEC_OP
	;

argument_expression_list
	: assignment_expression 	{$$ = $1;}
	| argument_expression_list ',' assignment_expression 	{$1.push(new node("",','));
															$$ = $1.concat($3);}
	;

unary_expression
	: postfix_expression 	{$$ = $1;}
	| INC_OP unary_expression {$$ = $2;
								$$.unshift(new node('op', $1));}
	| DEC_OP unary_expression {$$ = $2;
								$$.unshift(new node('op', $1));}
	| unary_operator cast_expression {$$ = $2;
										$$.unshift(new node('op', $1));}
	| SIZEOF unary_expression
	| SIZEOF '(' type_name ')'
	;

unary_operator
	: '&'
	| '*'
	| '+'
	| '-'
	| '~'
	| '!'
	;

cast_expression
	: unary_expression	{$$ = $1;}
	| '(' type_name ')' cast_expression
	;

multiplicative_expression
	: cast_expression 	{$$ = $1;}
	| multiplicative_expression '*' cast_expression 	{$1.push(new node('op', '*'));
														$$ = $1.concat($3);}
	| multiplicative_expression '/' cast_expression 	{$1.push(new node('op', '/'));
														$$ = $1.concat($3);}
	| multiplicative_expression '%' cast_expression 	{$1.push(new node('op', '%'));
														$$ = $1.concat($3);}
	;

additive_expression
	: multiplicative_expression {$$ = $1;}
	| additive_expression '+' multiplicative_expression 	{$1.push(new node('op', '+'));
															$$ = $1.concat($3);}
	| additive_expression '-' multiplicative_expression 	{$1.push(new node('op', '-'));
															$$ = $1.concat($3);}
	;

shift_expression
	: additive_expression {$$ = $1;}
	| shift_expression LEFT_OP additive_expression 		{$1.push(new node('op', $2));
														$$ = $1.concat($3);}
	| shift_expression RIGHT_OP additive_expression 	{$1.push(new node('op', $2));
														$$ = $1.concat($3);}
	;

relational_expression
	: shift_expression 	{$$ = $1;}
	| relational_expression '<' shift_expression 	{$1.push(new node('op', '<'));
														$$ = $1.concat($3);}
	| relational_expression '>' shift_expression 	{$1.push(new node('op', '>'));
														$$ = $1.concat($3);}
	| relational_expression LE_OP shift_expression 	{$1.push(new node('op', $2));
														$$ = $1.concat($3);}
	| relational_expression GE_OP shift_expression 	{$1.push(new node('op', $2));
														$$ = $1.concat($3);}
	;

equality_expression
	: relational_expression 	{$$ = $1;}
	| equality_expression EQ_OP relational_expression 	{$1.push(new node('op', $2));
														$$ = $1.concat($3);}
	| equality_expression NE_OP relational_expression 	{$1.push(new node('op', $2));
														$$ = $1.concat($3);}
	;

and_expression
	: equality_expression 	{$$ = $1;}
	| and_expression '&' equality_expression 	{$1.push(new node('op', '&'));
											$$ = $1.concat($3);}
	;

exclusive_or_expression
	: and_expression 	{$$ = $1;}
	| exclusive_or_expression '^' and_expression 	{$1.push(new node('op', '^'));
														$$ = $1.concat($3);}
	;

inclusive_or_expression
	: exclusive_or_expression 	{$$ = $1;}
	| inclusive_or_expression '|' exclusive_or_expression 	{$1.push(new node('op', '|'));
															$$ = $1.concat($3);}
	;

logical_and_expression
	: inclusive_or_expression 	{$$ = $1;}
	| logical_and_expression AND_OP inclusive_or_expression 	{$1.push(new node('op', $2));
																$$ = $1.concat($3);}
	;

logical_or_expression
	: logical_and_expression 	{$$ = $1;}
	| logical_or_expression OR_OP logical_and_expression 	{$1.push(new node('op', $2));
															$$ = $1.concat($3);}
	;

conditional_expression
	: logical_or_expression 	{$$ = $1;}
	| logical_or_expression '?' expression ':' conditional_expression 	{$1.push(new node('op', '?'));
																		$$ = $1.concat($3);
																		$$.push(new node('op', ':'));
																		$$ = $$.concat($5);}
	;

assignment_expression
	: conditional_expression 	{$$ = $1;}
	| unary_expression assignment_operator assignment_expression 	{
																	if ($2.type == 'op') {
																		$1.push($2);
																		
																	} else {
																		$1.push(new node('op', '='));
																		$1.push($1[0]);
																		$1.push(new node('op',$2.subtype));
																	}
																	$$ = $1.concat($3);}
	;

assignment_operator
	: '='	{$$ = new node('op', $1);}
	| MUL_ASSIGN 	{$$ = new node('mop', $1); $$.subtype = '*';}
	| DIV_ASSIGN	{$$ = new node('mop', $1); $$.subtype = '/';}
	| MOD_ASSIGN	{$$ = new node('mop', $1); $$.subtype = '%';}
	| ADD_ASSIGN	{$$ = new node('mop', $1); $$.subtype = '+';}
	| SUB_ASSIGN	{$$ = new node('mop', $1); $$.subtype = '-';}
	| LEFT_ASSIGN	{$$ = new node('mop', $1); $$.subtype = '<<';}
	| RIGHT_ASSIGN	{$$ = new node('mop', $1); $$.subtype = '>>';}
	| AND_ASSIGN	{$$ = new node('mop', $1); $$.subtype = '&';}
	| XOR_ASSIGN	{$$ = new node('mop', $1); $$.subtype = '^';}
	| OR_ASSIGN		{$$ = new node('mop', $1); $$.subtype = '|';}
	;

expression
	: assignment_expression 	{$$ = $1;}
	| expression ',' assignment_expression {$1.push(new node('',','));
											$$ = $1.concat($3);}
	;

constant_expression
	: conditional_expression 	{$$ = $1;}
	;

declaration
	: declaration_specifiers ';' 	{$1.push(new node('',';'));
									$$ = $1;}
	| declaration_specifiers init_declarator_list ';'  {$$ = $1.concat($2);
														$$.push(new node('',';'));}
	;

declaration_specifiers
	: type_specifier {$$ = [$1];}
	| type_specifier declaration_specifiers {
		$$ = $2.unshift($1);
	}
	| type_qualifier 	{$$ = [$1];}
	| type_qualifier declaration_specifiers {
		$$ = $2.unshift($1);
	}
	;

init_declarator_list
	: init_declarator 	{$$ = $1;}
	| init_declarator_list ',' init_declarator  {$1.push(new node('',','));
												$$ = $1.concat($3);}
	;

init_declarator
	: declarator {$$ = $1;}
	| declarator '=' initializer 	{$1.push(new node('op', '='));
									$$ = $1.concat($3);}
	;

type_specifier
	: VOID {$$ = new node('spec','void');}
	| char 	{$$ = new node('spec','char');}
	| SHORT {$$ = new node('spec','short');}
	| INT 	{$$ = new node('spec','int');}
	| LONG 	
	| FLOAT
	| DOUBLE
	| SIGNED
	| UNSIGNED
	| TYPE_NAME
	;


specifier_qualifier_list
	: type_specifier specifier_qualifier_list {
		$$ = $2.unshift($1);
	}
	| type_specifier 	{
		$$ = [$1];
	}
	| type_qualifier specifier_qualifier_list {
		$$ = $2.unshift($1);
	}
	| type_qualifier 	{$$ = [$1];}
	;

enumerator_list
	: enumerator 	{$$ = $1;}
	| enumerator_list ',' enumerator 	{$1.push(new node('',','));
										$$ = $1.concat($3);}
	;

enumerator
	: IDENTIFIER 	{$$ = [$1];}
	| IDENTIFIER '=' constant_expression 	{$$ = [$1, new node('op','=')].concat($3);}
	;

type_qualifier
	: CONST 	{$$ = new node('op', 'const');}
	| VOLATILE 	{$$ = new node('op', 'volatile');}
	;

declarator
	: direct_declarator {$$ = $1;}
	;

direct_declarator
	: IDENTIFIER 	{$$ = [new node('id',yytext)];}
	| '(' declarator ')' 	{$$ = $2.unshift(new node('br','('));
							$$.push(new node('br',')')); console.log(373);}
	| direct_declarator '[' constant_expression ']' {console.log(374);}
	| direct_declarator '[' ']' 	{console.log(375);}
	| direct_declarator '(' parameter_type_list ')' 	{$1.push(new node('br','('));
														$$ = $1.concat($3);
														$$.push(new node('br',')'));}
	| direct_declarator '(' ')' 	{$1.push(new node('br','('));
									$1.push(new node('br',')'));
									$$ = $1;}
	;

type_qualifier_list
	: type_qualifier {$$ = $1;}
	| type_qualifier_list type_qualifier {$$ = $1.concat($2);}
	;


parameter_type_list
	: parameter_list 	{$$ = $1;}
	| parameter_list ',' ELLIPSIS {$1.push(new node('',','));
									$1.push(new node('', '...'));
									$$ = $1;}
	;

parameter_list
	: parameter_declaration {$$ = $1;}
	| parameter_list ',' parameter_declaration {$1.push(new node('',','));
												$$ = $1.concat($3);}
	;

parameter_declaration
	: declaration_specifiers declarator  {$$ = $1.concat($2);}
	| declaration_specifiers abstract_declarator {$$ = $1.concat($2);}
	| declaration_specifiers 	{$$ = $1;}
	;

identifier_list
	: IDENTIFIER 	{$$ = [new node('id',yytext)];}
	| identifier_list ',' IDENTIFIER {$1.push(new node('',','));
										$1.push(new node('id',$3));
										$$ = $1;}
	;

type_name
	: specifier_qualifier_list 	{$$ = $1;}
	| specifier_qualifier_list abstract_declarator 	{$$ = $1.concat($2);}
	;

abstract_declarator
	:  direct_abstract_declarator 	{$$ = $1;}
	;

direct_abstract_declarator
	: '(' abstract_declarator ')'
	| '[' ']'
	| '[' constant_expression ']'
	| direct_abstract_declarator '[' ']'
	| direct_abstract_declarator '[' constant_expression ']'
	| '(' ')'
	| '(' parameter_type_list ')'
	| direct_abstract_declarator '(' ')'
	| direct_abstract_declarator '(' parameter_type_list ')'
	;

initializer
	: assignment_expression 	{$$ = $1;}
	| '{' initializer_list '}' 	{$$ = [new node('br', '{')].concat($2);
								$$.push(new node('br', '}'));}
	| '{' initializer_list ',' '}'
	;

initializer_list
	: initializer 	{$$ = $1;}
	| initializer_list ',' initializer 	{$1.push(new node('',','));
										$$ = $1.concat($3);}
	;

statement
	: compound_statement 	{$$ = $1;}
	| expression_statement 	{$$ = $1;}
	| selection_statement	{$$ = $1;}
	| iteration_statement 	{$$ = $1;}
	| jump_statement 	{$$ = $1;}
	;

compound_statement
	: '{' '}' 	{$$ = new node('cmpstmt', []);}//[new node('br', '{'), new node('br', '}')]];}
	| '{' statement_list '}' {//$$ = [new node('br', '{')].concat($2);
								// $$.push(new node('br', '}'));
								$$ = new node('cmpstmt', $2);}	
	| '{' declaration_list '}' 	{//$$ = [new node('br', '{')].concat($2);
								//$$.push(new node('br', '}'));
								$$ = new node('cmpstmt', $2);}
	| '{' declaration_list statement_list '}' 	{//$$ = [new node('br', '{')].concat($2);
												//$$ = $$.concat($3);
												//$$.push(new node('br', '}'));
												$$ = new node('cmpstmt', $2.concat($3));}
	;

declaration_list
	: declaration 	{$$ = [new node('decstmt',$1)];}
	| declaration_list declaration 	{$$ = $1;
									$$.push(new node('decexp',$2));}
	;

statement_list
	: statement 	{$$ = [$1];}
	| statement_list statement 	{$$ = $1;
								$$.push($2);}
	;

expression_statement
	: ';' 	{$$ = new node('expstmt', [new node('',';')]);}
	| expression ';' 	{$1.push(new node('',';'));
						$$ = new node('expstmt', $1);}
	;

selection_statement
	: IF '(' expression ')' statement %prec IF_WITHOUT_ELSE 	{
		// var list = [new node('', 'if'), new node('', '(')].concat($3);
		// 	list.push(new node('', ')'));
		// 	$$ = list.concat($5);
			$$ = new node('ifstmt',{'exp': $3, 'if': $5, 'else': {}});
	}
	| IF '(' expression ')' statement ELSE statement {
		// var list = [new node('', 'if'), new node('', '(')].concat($3);
		// 	list.push(new node('', ')'));
		// 	$$ = list.concat($5);
		// 	$$.push(new node('', 'else'));
		// 	$$ = $$.concat($7);
		$$ = new node('ifstmt', {'exp': $3, 'if': $5, 'else': $7});
	}
	;

iteration_statement
	: WHILE '(' expression ')' statement {
		// var list = [new node('', 'while'), new node('', '(')].concat($3);
		// 	list.push(new node('', ')'));
		// 	$$ = list.concat($5);
		$$ = new node('whilestmt', {'exp': $3, 'body': $5});
	}
	;


jump_statement
	: CONTINUE ';' {$$ = new node('jmpstmt',	[new node('', 'continue'),new node('', ';')]);}
	| BREAK ';' 	{$$ = new node('jmpstmt',[new node('', 'break'),new node('', ';')]);}
	| RETURN ';' 	{$$ = new node('jmpstmt',[new node('', 'return'),new node('', ';')]);}
	| RETURN expression ';' 	{var list = [new node('', 'return')].concat($2);
								list.push(new node('', ';'));
								$$ = new node('jmpstmt',list);}
	;

translation_unit
	: external_declaration {//sTree = $1;}
		syntaxTree = $1;
		return $1;
		}
	;

external_declaration
	: function_definition {$$ = $1;}
	;

function_definition
	: declaration_specifiers declarator compound_statement {$$ = {'type': 'function', 'proto': $1.concat($2), 'ins': $3};
		// var list = $3.val;
		// for(var x=0; x<list.length; x++) {
		// 	if (list[x].type == 'ifstmt') {
		// 		console.log('--------------------');
		// 		console.log(list[x].val.exp);
		// 		console.log(list[x].val.if[0]);
		// 		console.log(list[x].val.else[0]);
		// 		console.log('xxxxxxxxxxxxxxxxxxxxxxxx');
		// 	}
		// 	console.log(x,list[x]);
		// }	
	}
	| declarator compound_statement {$$ = {'type': 'function', 'proto': $1, 'ins': $3};}
;

%%
function comment(arg){
	console.log(arg);
}