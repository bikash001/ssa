/* lexical grammar */
%{
var sTree;
%}

%lex

%%

\s+             /* skip whitespace */
"int"           return 'INT'
"char"          return 'CHAR'
"#include"      return 'INCLUDE';
"if"            return 'IF';
"else"          return 'ELSE';
"while"         return 'WHILE';
"return"		return 'RETURN';
"<"[a-zA-Z0-9_]+"."("h"|"H")">" return 'HEADER';
('-')?(0|[1-9][0-9]*)     return 'CONSTANT';
\"(\\.|[^"])*\"	return 'STRING_LITERAL';
"+"             return '+';
"-"             return '-';
"*"             return '*';
"/"             return '/';
"="             return '=';
"=="            return 'EQ_OP';
"<="            return 'LE_OP';
">="            return 'GE_OP';
"!="            return 'NE_OP';
"||"            return 'OR_OP';
"&&"            return 'AND_OP';
"&"             return '&';
"|"             return '|';
"!"             return '!';
"~"             return '~';
"^"             return '^';
"%"             return '%';
"<"             return '<';
">"             return '>';
"("             return '(';
")"             return ')';
"{"             return '{';
"}"             return '}';
";"             return ';';
","             return ',';
[a-zA-Z_][a-zA-Z0-9_]* return 'IDENTIFIER';
<<EOF>>         return 'EOF';


/lex


%start pgm

%nonassoc IF_WITHOUT_ELSE
%nonassoc ELSE

%%      /* language grammar */

primary_expression
    : IDENTIFIER 	{console.log(yytext);}
    | CONSTANT
    | '(' expression ')'
    ; 

unary_operator
    : '&'
    | '*'
    | '+'
    | '-'
    | '~'
    | '!'
    ;

multiplicative_epression
    : primary_expression
    | multiplicative_expression '*' primary_expression
	| multiplicative_expression '/' primary_expression
	| multiplicative_expression '%' primary_expression
	;

additive_expression
	: multiplicative_expression
	| additive_expression '+' multiplicative_expression
	| additive_expression '-' multiplicative_expression
	;

relational_expression
	: additive_expression
	| relational_expression '<' additive_expression
	| relational_expression '>' additive_expression
	| relational_expression LE_OP additive_expression
	| relational_expression GE_OP additive_expression
	;

equality_expression
	: relational_expression
	| equality_expression EQ_OP relational_expression
	| equality_expression NE_OP relational_expression
	;

and_expression
	: equality_expression
	| and_expression '&' equality_expression
	;

exclusive_or_expression
	: and_expression
	| exclusive_or_expression '^' and_expression
	;

inclusive_or_expression
	: exclusive_or_expression
	| inclusive_or_expression '|' exclusive_or_expression
	;

logical_and_expression
	: inclusive_or_expression
	| logical_and_expression AND_OP inclusive_or_expression
	;

logical_or_expression
	: logical_and_expression
	| logical_or_expression OR_OP logical_and_expression
	;

conditional_expression
	: logical_or_expression
	| logical_or_expression '?' expression ':' conditional_expression
	;

expression
    : conditional_expression
    ;

compound_statement
	: '{' '}'
	| '{' statement_list '}'
	;

statement_list
	: statement
	| statement_list statement
	;

statement
    : compound_statement
    | selection_statement
    | iteration_statement
    | assignment_statement
    | declaration_statement
    ;

assignment_statement
    : ';'
    | IDENTIFIER '=' expression ';'
    ;

selection_statement
    : IF '(' expression ')' statement %prec IF_WITHOUT_ELSE
    | IF '(' expression ')' statement ELSE statement
    ;


iteration_statement
	: WHILE '(' expression ')' statement
	;

return_statement
	: RETURN expression ';'
	;

pgm : incl_stmts body EOF	{sTree = $2;}
    ;

incl_stmts  :   /* empty */
            |   incl incl_stmts
            ;

incl : INCLUDE HEADER
    ;

body : main_fn
    ;

declaration_statement : INT identifier_list ';'
        ;

identifier_list : IDENTIFIER
                | IDENTIFIER ',' identifier_list
                ;

main_fn : INT IDENTIFIER '(' ')' compound_statement
        ;
