// Alternating Buchi Automaton -> Non-deterministic Buchi Automaton

import {
    BFml,
    BExp,
    BConst,
    BIn,
    BOr,
    BAnd,
} from './bfml';
import {
    ABA,
    util,
} from './alt';

interface NBATransition{
    [state: string]: {
        [char: string]: Array<string>;
    };
}

export interface NBA{
    alphabet: Array<string>;
    states: Array<string>;
    transition: NBATransition;
    initial: string;
    accepting: Array<string>;
}

export function toNBA(aba: ABA): NBA{
    const alphabet = aba.alphabet;
    // ALTのstate集合Sに対して，NBAのstateは(2^S)×(2^S)
    const states: Array<string> = [];
    const transition: NBATransition = {};
    const accepting: Array<string> = [];

    // 初期状態から始めるぞ
    const initial = aba.accepting.indexOf(aba.initial) >= 0 ? `;${aba.initial}` : `${aba.initial};`;

    const queue = [initial];
    while (queue.length > 0){
        const ststr = queue.shift();
        if (ststr in transition){
            continue;
        }
        // 文字列表現を配列に直す
        const [q0str, q1str] = ststr.split(';', 2);
        const q0 = q0str.split(',').filter(v=>!!v);
        const q1 = q1str.split(',').filter(v=>!!v);

        states.push(ststr);

        const map: {[char: string]: Array<string>;} = {};
        if (q0.length === 0){
            // Reset mode
            accepting.push(ststr);

            for (let a of alphabet){
                const sss = [];
                for (let q of q1){
                    const abamap = aba.transition[q];
                    const bfml = abamap[a];
                    const ss = makeNextState(bfml, false);
                    sss.push(ss);
                }
                const ss = makeAnd(sss);
                // sssたちのandを取る感じで
                // できたのでmapに書き込む
                map[a] = ss.map(([q0, q1])=> util.uniq(q0).sort().join(',') + ';' + util.uniq(q1).sort().join(','));
                queue.push(...map[a]);
            }
        }else{
            // Reset modeでない
            for (let a of alphabet){
                const sss = [];
                for (let q of q0){
                    const abamap = aba.transition[q];
                    const bfml = abamap[a];
                    const ss = makeNextState(bfml, false);
                    sss.push(ss);
                }
                for (let q of q1){
                    const abamap = aba.transition[q];
                    const bfml = abamap[a];
                    const ss = makeNextState(bfml, true);
                    sss.push(ss);
                }
                const ss = makeAnd(sss);
                map[a] = ss.map(([q0, q1])=> util.uniq(q0).sort().join(',') + ';' + util.uniq(q1).sort().join(','));
                queue.push(...map[a]);
            }
        }
        transition[ststr] = map;
    }

    return {
        alphabet,
        states,
        transition,
        initial,
        accepting,
    };

    // fever: resetモードでなくてQ1由来のstateのときの処理
    function makeNextState(bfml: BFml, fever: boolean): Array<[Array<string>, Array<string>]>{
        // BFmlから次のstateを作る（MH84の方法で）
        if (bfml instanceof BExp){
            const e = bfml.exp;
            // q0かq1のどちらかに入れる
            if (fever || aba.accepting.indexOf(e.hash) >= 0){
                return [ [[], [e.hash]] ];
            }else{
                return [ [[e.hash], []] ];
            }
        }else if(bfml instanceof BConst){
            if (bfml.value){
                // trueは0個のandと同じなんだよ
                return [ [[], []]  ];
            }else{
                // falseは行き先がない
                return [];
            }
        }else if(bfml instanceof BOr){
            const ss1 = makeNextState(bfml.op1, fever);
            const ss2 = makeNextState(bfml.op2, fever);
            // or: nondeterministicに分岐
            return ss1.concat(ss2);
        }else if(bfml instanceof BAnd){
            const ss1 = makeNextState(bfml.op1, fever);
            const ss2 = makeNextState(bfml.op2, fever);
            // universalな分岐のときは合併する
            return makeAnd([ss1, ss2]);
        }else{
            throw new Error('ぎゃあああああ');
        }
    }
    // recursiveに直積をとる
    function makeAnd(sss: Array<Array<[Array<string>, Array<string>]>>): Array<[Array<string>, Array<string>]>{
        if (sss.length === 0){
            return [[[], []]];
        }else{
            const [ss, ...sss2] = sss;
            const ss2 = makeAnd(sss2);
            const result = [];
            for (let [q0, q1] of ss){
                for (let [q2, q3] of ss2){
                    result.push([[...q0, ...q2], [...q1, ...q3]]);
                }
            }
            return result;
        }
    }
}
