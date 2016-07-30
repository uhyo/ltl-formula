///<reference path="./node.d.ts" />
// Definition of LTL AST.

const crypto = require('crypto');

// expression
export abstract class Exp{
    public hash: string;

    // write back LTL
    public abstract toLTL(): string;
    // clone
    public abstract clone(): Exp;
    // convert to minimum set
    public abstract normalize(): Exp;
    // all free variables.
    public abstract fv(): Array<string>;
}
// boolean constant.
export class C extends Exp{
    constructor(public value: boolean){
        super();
        this.hash = util.hash(this);
    }
    public toLTL(): string{
        return String(this.value);
    }
    public clone(){
        return new C(this.value);
    }
    public normalize(){
        return this.clone();
    }
    public fv(){
        return [];
    }
}
// prop.
export class Prop extends Exp{
    constructor(public name: string){
        super();
        this.hash = util.hash(this);
    }
    public toLTL(): string{
        return String(this.name);
    }
    public clone(){
        return new Prop(this.name);
    }
    public normalize(){
        return this.clone();
    }
    public fv(){
        return [this.name];
    }
}
// Basic 演算子.
export class Not extends Exp{
    constructor(public op: Exp){
        super();
        this.hash = util.hash(this);
    }
    public toLTL(): string{
        return '~ '+util.atom(this.op.toLTL());
    }
    public clone(){
        return new Not(this.op.clone());
    }
    public normalize(): Exp{
        const exp = this.op.normalize();
        // 2重のnotをはずす
        if (exp instanceof Not){
            return exp.op;
        }else{
            return new Not(exp);
        }
    }
    public fv(){
        return this.op.fv();
    }
}
export class Or extends Exp{
    constructor(public op1: Exp, public op2: Exp){
        super();
        this.hash = util.hash(this);
    }
    public toLTL(): string{
        return util.atom(this.op1.toLTL()) + ' \\/ ' + util.atom(this.op2.toLTL());
    }
    public clone(){
        return new Or(this.op1.clone(), this.op2.clone());
    }
    public normalize(): Exp{
        const op1 = this.op1.normalize();
        const op2 = this.op2.normalize();
        // constになったらor/andを消せる
        if (op1 instanceof C){
            return op1.value ? op1 : op2;
        }else if (op2 instanceof C){
            return op2.value ? op2 : op1;
        }else{
            return new Or(op1, op2);
        }
    }
    public fv(){
        return this.op1.fv().concat(this.op2.fv());
    }
}
export class And extends Exp{
    constructor(public op1: Exp, public op2: Exp){
        super();
        this.hash = util.hash(this);
    }
    public toLTL(): string{
        return util.atom(this.op1.toLTL()) + ' /\\ ' + util.atom(this.op2.toLTL());
    }
    public clone(){
        return new And(this.op1.clone(), this.op2.clone());
    }
    public normalize(): Exp{
        const op1 = this.op1.normalize();
        const op2 = this.op2.normalize();
        if (op1 instanceof C){
            return op1.value ? op2 : op1;
        }else if (op2 instanceof C){
            return op2.value ? op1 : op2;
        }else{
            return new And(op1, op2);
        }
    }
    public fv(){
        return this.op1.fv().concat(this.op2.fv());
    }
}
export class Implies extends Exp{
    constructor(public op1: Exp, public op2: Exp){
        super();
        this.hash = util.hash(this);
    }
    public toLTL(): string{
        return util.atom(this.op1.toLTL()) + ' -> ' + util.atom(this.op2.toLTL());
    }
    public clone(){
        return new Implies(this.op1.clone(), this.op2.clone());
    }
    public normalize(): Exp{
        // p -> q (<=>) not(p) or q
        const op1 = new Not(this.op1);
        const e = new Or(op1, this.op2);
        return e.normalize();
    }
    public fv(){
        return this.op1.fv().concat(this.op2.fv());
    }
}
export class X extends Exp{
    constructor(public op: Exp){
        super();
        this.hash = util.hash(this);
    }
    public toLTL(): string{
        return 'X '+util.atom(this.op.toLTL());
    }
    public clone(){
        return new X(this.op.clone());
    }
    public normalize(): Exp{
        return new X(this.op.normalize());
    }
    public fv(){
        return this.op.fv();
    }
}
export class F extends Exp{
    constructor(public op: Exp){
        super();
        this.hash = util.hash(this);
    }
    public toLTL(): string{
        return 'F '+util.atom(this.op.toLTL());
    }
    public clone(){
        return new F(this.op.clone());
    }
    public normalize(): Exp{
        // F p = true U p
        const e = new U(new C(true), this.op);
        return e.normalize();
    }
    public fv(){
        return this.op.fv();
    }
}
export class G extends Exp{
    constructor(public op: Exp){
        super();
        this.hash = util.hash(this);
    }
    public toLTL(): string{
        return 'G '+util.atom(this.op.toLTL());
    }
    public clone(){
        return new F(this.op.clone());
    }
    public normalize(): Exp{
        // G p = not (true U (not p))
        const e = new Not(new U(new C(true), new Not(this.op)));
        return e.normalize();
    }
    public fv(){
        return this.op.fv();
    }
}
export class U extends Exp{
    constructor(public op1: Exp, public op2: Exp){
        super();
        this.hash = util.hash(this);
    }
    public toLTL(): string{
        return util.atom(this.op1.toLTL()) + ' U ' + util.atom(this.op2.toLTL());
    }
    public clone(){
        return new U(this.op1.clone(), this.op2.clone());
    }
    public normalize(): Exp{
        return new U(this.op1.normalize(), this.op2.normalize());
    }
    public fv(){
        return this.op1.fv().concat(this.op2.fv());
    }
}
export class R extends Exp{
    constructor(public op1: Exp, public op2: Exp){
        super();
        this.hash = util.hash(this);
    }
    public toLTL(): string{
        return util.atom(this.op1.toLTL()) + ' R ' + util.atom(this.op2.toLTL());
    }
    public clone(){
        return new R(this.op1.clone(), this.op2.clone());
    }
    public normalize(): Exp{
        // p R q = not ((not p) U (not q))
        const e = new Not(new U(new Not(this.op1), new Not(this.op2)));
        return e.normalize();
    }
    public fv(){
        return this.op1.fv().concat(this.op2.fv());
    }
}


export namespace util {
    // stringがspaceを含んだら()で囲む（LTL生成用）
    export function atom(str: string): string{
        if (/\s/.test(str) && !(/^\(.*\)$/.test(str))){
            return `(${str})`;
        }else{
            return str;
        }
    }
    // take hash of LTL expression
    export function hash(exp: Exp): string{
        const hash = crypto.createHash('md5');
        hash.update(exp.toLTL());
        return hash.digest('hex');
    }
}
