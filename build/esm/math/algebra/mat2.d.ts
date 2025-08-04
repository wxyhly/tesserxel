import { Pool } from "../pool";
import { Vec2 } from "./vec2";
export declare class Mat2Pool extends Pool<Mat2> {
    constructObject(): Mat2;
}
export declare const mat2Pool: Mat2Pool;
export declare class Mat2 {
    elem: number[];
    static id: Mat2;
    static zero: Mat2;
    static diag(a: number, b: number): Mat2;
    constructor(a?: number, b?: number, c?: number, d?: number);
    set(a?: number, b?: number, c?: number, d?: number): Mat2;
    setid(): this;
    ts(): Mat2;
    t(): Mat2;
    copy(m2: Mat2): Mat2;
    add(m2: Mat2): Mat2;
    adds(m2: Mat2): Mat2;
    neg(): Mat2;
    negs(): Mat2;
    sub(m2: Mat2): Mat2;
    subs(m2: Mat2): Mat2;
    mulf(k: number): Mat2;
    mulfs(k: number): Mat2;
    mulv(v: Vec2): Vec2;
    mul(m: Mat2): Mat2;
    muls(m: Mat2): Mat2;
    inv(): Mat2;
    invs(): Mat2;
    pushPool(pool?: Mat2Pool): void;
}
export declare let _mat2: Mat2;
