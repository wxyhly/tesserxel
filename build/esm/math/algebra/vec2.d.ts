import { Complex } from "./cplx.js";
import { Srand } from "../random.js";
import { Pool } from "../pool.js";
export declare class Vec2Pool extends Pool<Vec2> {
    constructObject(): Vec2;
}
export declare const vec2Pool: Vec2Pool;
export declare class Vec2 {
    x: number;
    y: number;
    static readonly x: Readonly<Vec2>;
    static readonly y: Readonly<Vec2>;
    constructor(x?: number, y?: number);
    flat(): number[];
    writeBuffer(b: Float32Array, offset?: number): void;
    set(x?: number, y?: number): Vec2;
    copy(v: Vec2): Vec2;
    copyc(v: Complex): Vec2;
    clone(): Vec2;
    add(v2: Vec2): Vec2;
    addset(v1: Vec2, v2: Vec2): Vec2;
    addf(v2: number): Vec2;
    adds(v2: Vec2): Vec2;
    addfs(v2: number): Vec2;
    /** this += v * k */
    addmulfs(v: Vec2, k: number): this;
    neg(): Vec2;
    negs(): Vec2;
    sub(v2: Vec2): Vec2;
    subset(v1: Vec2, v2: Vec2): Vec2;
    subf(v2: number): Vec2;
    subs(v2: Vec2): Vec2;
    subfs(v2: number): Vec2;
    mulf(v2: number): Vec2;
    mulfs(v2: number): Vec2;
    mul(v2: Vec2): Vec2;
    muls(v2: Vec2): Vec2;
    divf(v2: number): Vec2;
    divfs(v2: number): Vec2;
    div(v2: Vec2): Vec2;
    divs(v2: Vec2): Vec2;
    dot(v2: Vec2): number;
    norm(): number;
    norms(): Vec2;
    normsqr(): number;
    norm1(): number;
    norminf(): number;
    normi(i: number): number;
    wedge(v2: Vec2): number;
    rotate(angle: number): Vec2;
    rotates(angle: number): Vec2;
    static rand(): Vec2;
    static srand(seed: Srand): Vec2;
    distanceTo(p: Vec2): number;
    distanceSqrTo(p: Vec2): number;
    equal(v: Vec2): boolean;
    pushPool(pool?: Vec2Pool): void;
}
export declare let _vec2: Vec2;
