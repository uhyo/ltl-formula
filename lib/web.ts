///<reference path="./node.d.ts" />
// Web UI script.

import {
    Exp,
    C,
    Prop,
    Not,
    Or,
    And,
    Implies,
    X,
    F,
    G,
    U,
    R,
} from './ast';
import {
    BFml,
    BExp,
    BConst,
    BIn,
    BOr,
    BAnd,
} from './bfml';
import {
    toABA,
    ABA,
} from './alt';
import {
    toNBA,
    NBA,
} from './nba';
import {
    toDot,
} from './dot';
const ltlParser = require('./ltl').parser;
const viz = require('viz.js');

document.addEventListener('DOMContentLoaded', ev=>{
    // イベントを設定
    document.querySelector('#convert-button').addEventListener('click', e=>{
        const fml = (document.querySelector('#ltl-formula') as HTMLInputElement).value;

        convert(fml);
    }, false);
    // あれ
    const cs = document.querySelectorAll('input.ltl-sample-button');
    const l = cs.length;
    console.log(l);
    for(let i=0; i<l; i++){
        const b = cs[i] as HTMLInputElement;
        b.addEventListener('click', e=>{
            (document.querySelector('#ltl-formula') as HTMLInputElement).value = b.getAttribute('data-sample');
        }, false);
    }
});

// LTL formulaが入力されました
function convert(fml: string): void{
    const exp = tryLTLParse(fml);
    if (exp == null){
        return;
    }
    const result = document.querySelector('#result') as HTMLElement;
    empty(result);
    result.insertAdjacentHTML('beforeend', `<p>Rendering... (It may take time)</p>`);
    setTimeout(()=>{
        empty(result);
        result.insertAdjacentHTML('beforeend', `<h2>Results</h2>`);
        // LTL formulaをshow
        showLTLFormula(result, 'Input LTL formula:', exp);
        // normalizeする
        const exp2 = exp.normalize();
        showLTLFormula(result, 'Normalized LTL formula:', exp2);

        // ABAを得る
        const aba = toABA(exp2);
        showABA(result, 'Alternating Büchi Automaton:', aba);

        // NBAにしてdot
        const nba = toNBA(aba);
        const dot = toDot(nba);
        showDot(result, 'Nondeterministic Büchi Automaton:', dot);
    }, 0);
}

function tryLTLParse(fml: string): Exp{
    try {
        const exp = ltlParser.parse(fml);
        return exp;
    } catch(e){
        // 文法エラーだ！
        const err = document.querySelector('#error') as HTMLElement;
        const pre = document.createElement('pre');
        pre.textContent = e.message;
        empty(err);
        err.appendChild(pre);
        return null;
    }
}
// XXX HTMLエスケープとかが雑（多分問題ないけど）
function showLTLFormula(region: HTMLElement, title: string, exp: Exp): void{
    const [ltlh,] = LTLtoHTML(exp);
    const html = `<div class="region">
        <p>${title}</p>
        <p class='ltl-formula'>${ltlh}</p>
</div>`;
    region.insertAdjacentHTML('beforeend', html);

}
function LTLtoHTML(exp: Exp): [string, boolean]{
    if (exp instanceof C){
        return [`<i class='ltl-constant'>${String(exp.value)}</i>`, true];
    }else if(exp instanceof Prop){
        return [`<var class='ltl-prop'>${exp.name}</var>`, true];
    }else if(exp instanceof Not){
        const op = atom(LTLtoHTML(exp.op));
        return [`<i class='ltl-op'>¬</i>${op}`, true];
    }else if(exp instanceof Or){
        const op1 = atom(LTLtoHTML(exp.op1));
        const op2 = atom(LTLtoHTML(exp.op2));
        return [`${op1}<i class='ltl-op'>∨</i>${op2}`, false];
    }else if(exp instanceof And){
        const op1 = atom(LTLtoHTML(exp.op1));
        const op2 = atom(LTLtoHTML(exp.op2));
        return [`${op1}<i class='ltl-op'>∧</i>${op2}`, false];
    }else if(exp instanceof Implies){
        const op1 = atom(LTLtoHTML(exp.op1));
        const op2 = atom(LTLtoHTML(exp.op2));
        return [`${op1}<i class='ltl-op'>⊃</i>${op2}`, false];
    }else if(exp instanceof X){
        const op = atom(LTLtoHTML(exp.op));
        return [`<i class='ltl-op-char'>X</i>${op}`, true];
    }else if(exp instanceof F){
        const op = atom(LTLtoHTML(exp.op));
        return [`<i class='ltl-op-char'>F</i>${op}`, true];
    }else if(exp instanceof G){
        const op = atom(LTLtoHTML(exp.op));
        return [`<i class='ltl-op-char'>G</i>${op}`, true];
    }else if(exp instanceof U){
        const op1 = atom(LTLtoHTML(exp.op1));
        const op2 = atom(LTLtoHTML(exp.op2));
        return [`${op1}<i class='ltl-op-char'>U</i>${op2}`, false];
    }else if(exp instanceof R){
        const op1 = atom(LTLtoHTML(exp.op1));
        const op2 = atom(LTLtoHTML(exp.op2));
        return [`${op1}<i class='ltl-op-char'>R</i>${op2}`, false];
    }else{
        return ['', true];
    }

    function atom([str, a]: [string, boolean]): string{
        if (!a){
            return `(${str})`;
        }else{
            return str;
        }
    }
}
// ABAをテーブルで表示
function showABA(result: HTMLElement, title: string, aba: ABA): void{
    const {
        alphabet,
        states,
        transition,
        initial,
        accepting,
    } = aba;

    const tdhs = alphabet.map(a=>{
        return `<th>{${a}}</th>`;
    }).join('');

    const trs = states.map((q,i)=>{
        const map = transition[q];
        const tds = alphabet.map(a=>{
            const bfml = map[a];
            const [html,] = BFmlToHTML(bfml);
            const tags = [];
            if (q === initial){
                tags.push('init');
            }
            if (accepting.indexOf(q) >= 0){
                tags.push('F');
            }
            const tagstr = tags.length > 0 ? `(${tags.join(',')})` : '';
            return `<td>${html}</td>`;
        }).join('');
        const tags = [];
        if (q === initial){
            tags.push('init');
        }
        if (accepting.indexOf(q) >= 0){
            tags.push('F');
        }
        const tagstr = tags.length > 0 ? `(${tags.join(',')})` : '';
        return `<tr>
    <td>q<sub>${i}</sub>${tagstr}</td>
    ${tds}
</tr>`;
    }).join('');
    const html = `<div class="region">
        <p>${title}</p>
        <table class='aba-table'>
            <thead>
                <tr>
                    <td></td>
                    ${tdhs}
                </tr>
            </thead>
            <tbody>
                ${trs}
            </tbody>
        </table>
</div>`;
console.log(html);
    result.insertAdjacentHTML('beforeend', html);

    function BFmlToHTML(bfml: BFml): [string, boolean]{
        if (bfml instanceof BExp){
            const i = states.indexOf(bfml.exp.hash);
            return [`q<sub>${i}</sub>`, true];
        }else if(bfml instanceof BConst){
            return [`<i class='bfml-constant'>${String(bfml.value)}</i>`, true];
        }else if(bfml instanceof BOr){
            const op1 = atom(BFmlToHTML(bfml.op1));
            const op2 = atom(BFmlToHTML(bfml.op2));
            return [`${op1}<i class='bfml-op'>∨</i>${op2}`, false];
        }else if(bfml instanceof BAnd){
            const op1 = atom(BFmlToHTML(bfml.op1));
            const op2 = atom(BFmlToHTML(bfml.op2));
            return [`${op1}<i class='bfml-op'>∧</i>${op2}`, false];
        }
        // XXX This is copy!
        function atom([str, a]: [string, boolean]): string{
            if (!a){
                return `(${str})`;
            }else{
                return str;
            }
        }
    }
}
//dotを表示
function showDot(result: HTMLElement, title: string, dot: string): void{
    const svg = viz(dot, {
        engine: 'dot',
        format: 'svg',
    });
    const dataurl = 'data:image/svg+xml;base64,' + btoa(svg);
    const html1 = `<div class="region">
        <p>${title}</p>
        <div>
            <img src="${dataurl}" class="graph">
        </div>
        <p><a href="${dataurl}" target="_blank">Too small? Click here to open in proper size</a></p>
    </div>`;
    result.insertAdjacentHTML('beforeend', html1);

    const html = `<div class="region">
    <p>${title} (in the DOT format)</p>
    <pre class="dot"><code>${dot}</code></pre>
</div>`;
    result.insertAdjacentHTML('beforeend', html);
}

function empty(elm: HTMLElement): void{
    while(elm.hasChildNodes()){
        elm.removeChild(elm.firstChild);
    }
}

function sample(text: string): void{
    (document.querySelector('#ltl-formula') as HTMLInputElement).value = text;
}
