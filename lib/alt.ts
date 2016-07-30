// LTL formula -> Alternating Buchi Automaton

import {
    Exp,
    C,
    Prop,
    Not,
    Or,
    And,
    X,
    U,
} from './ast';
import {
    BFml,
    BExp,
    BConst,
    BIn,
    BOr,
    BAnd,
} from './bfml';

// transition for ABA. (map)
interface ABATransition{
    [state: string]: {
        [char: string]: BFml;
    };
}

// Def. of ABA.
export interface ABA {
    alphabet: Array<string>;
    states: Array<string>;
    transition: ABATransition;
    initial: string;
    accepting: Array<string>;
}

// LTL formula -> ABA
export function toABA(exp: Exp): ABA{
    // alphabetは全ての命題の集合のpowerset
    const props = util.uniq(exp.fv());
    const propspw = util.powerset(props);
    propspw.forEach(ps => ps.sort());
    // 上を文字列にまとめる
    const alphabet = propspw.map(ps => ps.join(','));


    // Transitionを作る
    const hashTable = {};
    const bfTable = {};
    const states: Array<string> = [];
    const accepting: Array<string> = [];
    const transition: ABATransition = {};

    // 未処理のexpressionたち
    const queue = [exp];
    hashTable[exp.hash] = exp;

    while (queue.length > 0){
        const e = queue.shift();
        states.push(e.hash);
        // これがaccepting stateか判定する
        if(e instanceof Not && e.op instanceof U){
            accepting.push(e.hash);
        }

        // \rho(e)を求める
        const er: BFml = rho(e);

        // bfTableに保存
        bfTable[e.hash] = er;

        // erに残るLTL formulaを見つける
        const fs: Array<Exp> = findFreeFormulae(er);
        // 未処理のものがあったらqueueに加える
        for (let f of fs){
            if (!(f.hash in hashTable)){
                //これはまだ発見されていない
                queue.push(f);
                hashTable[f.hash] = f;
            }
        }
    }
    // rhoの計算が終わったので遷移規則を書き下す
    for (let ststr of states){
        const exp = hashTable[ststr];
        // rho(exp)
        const bf = bfTable[ststr];
        const map: {[char: string]: BFml} = {};
        // 各alphabetに対して計算
        for (let ps of propspw){
            const psstr = ps.join(',');
            map[psstr] = resolveBIn(bf, ps);
        }
        transition[exp.hash] = map;
    }
    // initial state
    const initial = exp.hash;
    return {
        alphabet,
        states,
        transition,
        accepting,
        initial,
    };

    // \rho(e)を計算
    function rho(exp: Exp): BFml{
        if(exp instanceof C){
            return new BConst(exp.value);
        }else if(exp instanceof Prop){
            return new BIn(exp.name, false);
        }else if(exp instanceof Not){
            return execNot(rho(exp.op));
        }else if(exp instanceof Or){
            return (new BOr(rho(exp.op1), rho(exp.op2))).normalize();
        }else if(exp instanceof And){
            return (new BAnd(rho(exp.op1), rho(exp.op2))).normalize();
        }else if(exp instanceof X){
            return new BExp(exp.op);
        }else if(exp instanceof U){
            const e = new BOr(rho(exp.op2), new BAnd(rho(exp.op1), new BExp(exp)));
            return e.normalize();
        }else{
            throw new Error('Cannot exec rho for: ' + exp.toLTL());
        }

        function execNot(exp: BFml): BFml{
            if(exp instanceof BConst){
                return new BConst(!exp.value);
            }else if(exp instanceof BExp){
                // notを中に入れる
                const e = new Not(exp.exp);
                return new BExp(e.normalize());
            }else if(exp instanceof BIn){
                return new BIn(exp.prop, !exp.neg);
            }else if(exp instanceof BOr){
                return (new BAnd(execNot(exp.op1), execNot(exp.op2))).normalize();
            }else if(exp instanceof BAnd){
                return (new BOr(execNot(exp.op1), execNot(exp.op2))).normalize();
            }else{
                throw new Error('execNot: cannot exec for ' + exp);
            }
        }
    }
    // rhoの結果からfreeなformulaを探す
    function findFreeFormulae(exp: BFml): Array<Exp>{
        const result = [];
        if (exp instanceof BExp){
            result.push(exp.exp);
        }else if (exp instanceof BOr || exp instanceof BAnd){
            result.push(...findFreeFormulae(exp.op1), ...findFreeFormulae(exp.op2));
        }

        return result;
    }
    // BFml中のBInを解決する
    function resolveBIn(exp: BFml, ps: Array<string>): BFml{
        if (exp instanceof BConst || exp instanceof BExp){
            return exp;
        }else if (exp instanceof BIn){
            const b = ps.indexOf(exp.prop) >= 0;
            return new BConst(exp.neg ? !b : b);
        }else if (exp instanceof BOr){
            const e = new BOr(resolveBIn(exp.op1, ps), resolveBIn(exp.op2, ps));
            return e.normalize();
        }else if (exp instanceof BAnd){
            const e = new BAnd(resolveBIn(exp.op1, ps), resolveBIn(exp.op2, ps));
            return e.normalize();
        }

    }
}



export namespace util{
    // Array uniq.
    export function uniq(arr: Array<string>): Array<string>{
        const result = [];
        const table = {};
        for(let a of arr){
            if (table[a] !== true){
                result.push(a);
                table[a] = true;
            }
        }
        return result;
    }
    // Array powerset.
    export function powerset(arr: Array<string>): Array<Array<string>>{
        // recursiveに作る
        if (arr.length === 0){
            return [[]];
        }
        const [x, ...xs] = arr;
        const r = powerset(xs);
        // xを加えたほう
        const r2 = r.map(a=> [x, ...a]);
        return r.concat(r2);
    }
}
