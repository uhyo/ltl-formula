Applied Logic. The final assignment. Question 3.


How to build this project
=========================

You need to build this project to make it work. For just seeing the result of my implementation, the already-built program is available at:  http://uhyohyo.net/LTL_fniufwufwcywf73yfygf79cg73gf873gf7y372fg7c9w/

To build this project, you need to have node.js ( http://nodejs.org/ ) installed on your system. With node.js, run the following commands in order at this directory. Note that you need Internet connection during the command 1.

1. $ npm install
2. $ npm run build

Then the 'dist-web' directory is created and the result of building is available in it.


The files for you to check
==========================

The major result of implementation is in the 'lib' directory.

Core functionalities:

ltl.jison:  Definition of the LTL Formula Parser.
ast.ts: Definition of AST of LTL formulae.
alt.ts: Converts LTL formula to ABA.
nba.ts: Converts ABA to NBA.


Supporters:

node.d.ts: Some declarations for type checking.
bfml.ts: Definition of BFml class (that is, the range of transition function of ABA).
dot.ts: Converts NBA to DOT language.
web.ts: UI on the web page.
cli.ts: CLI for debugging.

