%lex

%%
' '|\t|\r|\n	/* skip whitespace */
[X]		return 'X'
[U]		return 'U'
[G]		return 'G'
[F]		return 'F'
[R]		return 'R'
"true"		return 'TRUE'
"false"		return 'FALSE'
[a-z_][a-z0-9_]*	return 'IDENT'
'('		return '('
')'		return ')'
"->"		return 'IMPLIES'
'~'		return 'NOT'
"NOT"		return 'NOT'
"\\/"		return 'OR'
"OR"		return 'OR'
"/\\"		return 'AND'
"AND"		return 'AND'
<<EOF>>		return 'EOF'
.		return 'INVALID'

/lex

%right 'IMPLIES'
%left 'OR'
%left 'AND'
%left 'U' 'R'
%right 'NOT' 'X' 'G' 'F'

%start formula

%%

formula
	: exp EOF { return $1 }
	;

exp
	: '(' exp ')' { $$ = $2 }
	| TRUE { $$ = new ast.C(true) }
	| FALSE { $$ = new ast.C(false) }
	| IDENT { $$ = new ast.Prop($1) }
	| NOT exp { $$ = new ast.Not($2) }
	| exp OR exp { $$ = new ast.Or($1, $3) }
	| exp AND exp { $$ = new ast.And($1, $3) }
	| exp IMPLIES exp { $$ = new ast.Implies($1, $3) }
	| X exp { $$ = new ast.X($2) }
	| F exp { $$ = new ast.F($2) }
	| G exp { $$ = new ast.G($2) }
	| exp U exp { $$ = new ast.U($1, $3) }
	| exp R exp { $$ = new ast.R($1, $3) }
	;

%%

var ast=require('./ast');


