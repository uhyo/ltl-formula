///<reference path="./node.d.ts" />
// CLI script for debugging & testing.


import {
    Exp,
} from './ast';
import {
    toABA,
} from './alt';
import {
    toNBA,
} from './nba';
import {
    toDot,
} from './dot';
const ltlParser = require('./ltl').parser;
const readline = require('readline');
const util = require('util');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question('Input your LTL formula> ', fml=>{
    // Fmlをパースする
    try {
        const exp: Exp = ltlParser.parse(fml);
        console.log(exp.toLTL());
        const exp2: Exp = exp.normalize();
        console.log('normalized LTL');
        console.log(exp2.toLTL());
        console.log(exp.hash, exp2.hash);
        console.log(exp2.fv());
        const aba = toABA(exp2);
        console.log(util.inspect(aba, {
            depth: 4,
        }));
        const nba = toNBA(aba);
        console.log(util.inspect(nba, {
            depth: 4,
        }));
        const dot = toDot(nba);
        console.log(dot);


    } catch(e){
        console.error(e.message);
        console.error(e.stack);
    }

    rl.close();
});
