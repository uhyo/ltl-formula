// Boolean Formulae over Exp.
import {
    Exp,
    util,
} from './ast';
export abstract class BFml{
    public abstract normalize(): BFml;
    public abstract toString(): string;
}

export class BExp extends BFml{
    constructor(public exp: Exp){
        super();
    }
    public normalize(): BFml{
        // 中身はnormalizeしないの？
        return new BExp(this.exp);
    }
    public toString(){
        return this.exp.toLTL();
    }
}
export class BConst extends BFml{
    constructor(public value: boolean){
        super();
    }
    public normalize(): BFml{
        return this;
    }
    public toString(){
        return String(this.value);
    }
}

export class BIn extends BFml{
    constructor(public prop: string, public neg: boolean){
        super();
    }
    public normalize(): BFml{
        return this;
    }
    public toString(){
        return '_ ' + (this.neg ? '\u2209 ' : '\u2208 ') + this.prop;
    }
}
export class BOr extends BFml{
    constructor(public op1: BFml, public op2: BFml){
        super();
    }
    public normalize(): BFml{
        const op1 = this.op1.normalize();
        const op2 = this.op2.normalize();
        if (op1 instanceof BConst){
            return op1.value ? op1 : op2;
        }else if (op2 instanceof BConst){
            return op2.value ? op2 : op1;
        }else{
            return new BOr(op1, op2);
        }
    }
    public toString(){
        return util.atom(this.op1.toString()) + ' /\\ ' + util.atom(this.op2.toString());
    }
}
export class BAnd extends BFml{
    constructor(public op1: BFml, public op2: BFml){
        super();
    }
    public normalize(): BFml{
        const op1 = this.op1.normalize();
        const op2 = this.op2.normalize();
        if (op1 instanceof BConst){
            return op1.value ? op2 : op1;
        }else if (op2 instanceof BConst){
            return op2.value ? op1 : op2;
        }else{
            return new BAnd(op1, op2);
        }
    }
    public toString(){
        return util.atom(this.op1.toString()) + ' \\/ ' + util.atom(this.op2.toString());
    }
}
