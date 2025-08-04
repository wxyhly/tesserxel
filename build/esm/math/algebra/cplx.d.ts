import { Vec2 } from "./vec2";
export declare class Complex {
    re: number;
    im: number;
    static i: Complex;
    constructor(re?: number, im?: number);
    flat(): number[];
    set(v: Complex): Complex;
    setv(v: Vec2): Complex;
    clone(): Complex;
    add(v2: Complex): Complex;
    addf(v2: number): Complex;
    adds(v2: Complex): Complex;
    addfs(v2: number): Complex;
    neg(): Complex;
    negs(): Complex;
    sub(v2: Complex): Complex;
    subf(v2: number): Complex;
    subs(v2: Complex): Complex;
    subfs(v2: number): Complex;
    mulf(v2: number): Complex;
    mulfs(v2: number): Complex;
    mul(k: Complex): Complex;
    muls(k: Complex): Complex;
    divf(v2: number): Complex;
    divfs(v2: number): Complex;
    div(k: Complex): Complex;
    divs(k: Complex): Complex;
    dot(v2: Complex): number;
    norm(): number;
    norms(): Complex;
    normsqr(): number;
    conj(): Complex;
    conjs(): Complex;
    exp(): Complex;
    exps(): Complex;
    arg(): number;
    log(): Complex;
    logs(): Complex;
    pow(p: Complex): Complex;
    powf(n: number): Complex;
    pows(p: Complex): Complex;
    powfs(n: number): Complex;
}
export declare class CMat2 {
}
