// NBA to DOT format.
import {
    NBA,
} from './nba';

export function toDot(nba: NBA): string{
    const {
        alphabet,
        states,
        transition,
        initial,
        accepting,
    } = nba;

    const invMap = [];

    const nodes = states.map((q, i)=>{
        invMap[q] = i;
        if (accepting.indexOf(q) >= 0){
            return `q${i} [shape = doublecircle];`;
        }else{
            return `q${i};`;
        }
    }).join('\n');
    const edgesarr = [];
    for (let q in transition){
        const map = transition[q];
        // 同じtransitionはまとめる
        const table = {};
        for (let a in map){
            for (let q2 of map[a]){
                if (!(q2 in table)){
                    table[q2] = [];
                }
                table[q2].push(`{${a}}`);
            }
        }
        for(let q2 in table){
            const qs = table[q2].join(',');
            const e = `q${invMap[q]} -> q${invMap[q2]} [label="${qs}"];`;
            edgesarr.push(e);
        }
    }
    const edges = edgesarr.join('\n');

    return `digraph {
    graph [
        rankdir = LR;
    ];
    node [
        shape = circle;
    ];

    "" [shape = none];
    "" -> q0;

    ${nodes}

    ${edges}
}`;
}
