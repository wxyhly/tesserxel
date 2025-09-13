import { Pool } from "../pool.js";
import { Srand } from "../random.js";
import { Rotor } from "./rotor.js";
import { Vec4 } from "./vec4.js";
export declare class BivecPool extends Pool<Bivec> {
    constructObject(): Bivec;
}
export declare const bivecPool: BivecPool;
export declare class Bivec {
    xy: number;
    xz: number;
    xw: number;
    yz: number;
    yw: number;
    zw: number;
    static readonly xy: Readonly<Bivec>;
    static readonly xz: Readonly<Bivec>;
    static readonly xw: Readonly<Bivec>;
    static readonly yz: Readonly<Bivec>;
    static readonly yw: Readonly<Bivec>;
    static readonly zw: Readonly<Bivec>;
    static readonly yx: Readonly<Bivec>;
    static readonly zx: Readonly<Bivec>;
    static readonly wx: Readonly<Bivec>;
    static readonly zy: Readonly<Bivec>;
    static readonly wy: Readonly<Bivec>;
    static readonly wz: Readonly<Bivec>;
    isFinite(): boolean;
    constructor(xy?: number, xz?: number, xw?: number, yz?: number, yw?: number, zw?: number);
    copy(v: Bivec): Bivec;
    set(xy?: number, xz?: number, xw?: number, yz?: number, yw?: number, zw?: number): Bivec;
    clone(): Bivec;
    flat(): number[];
    add(bv: Bivec): Bivec;
    adds(bv: Bivec): Bivec;
    addset(bv1: Bivec, bv2: Bivec): Bivec;
    addmulfs(bv: Bivec, k: number): Bivec;
    neg(): Bivec;
    negs(): Bivec;
    sub(bv: Bivec): Bivec;
    subs(bv: Bivec): Bivec;
    subset(bv1: Bivec, bv2: Bivec): Bivec;
    mulf(k: number): Bivec;
    mulfs(k: number): Bivec;
    divf(k: number): Bivec;
    divfs(k: number): Bivec;
    dot(biv: Bivec): number;
    norm(): number;
    norms(): Bivec;
    normsqr(): number;
    norm1(): number;
    wedge(biv: Bivec): number;
    dual(): Bivec;
    duals(): Bivec;
    wedgev(V: Vec4): Vec4;
    wedgevvset(v1: Vec4, v2: Vec4): Bivec;
    /** Vector part of Geometry Product
     * exy * ey = ex, exy * ex = -ey, exy * ez = 0
     *  */
    dotv(V: Vec4): Vec4;
    cross(V: Bivec): Bivec;
    crossset(b1: Bivec, b2: Bivec): Bivec;
    crossrs(V: Bivec): Bivec;
    exp(): Rotor;
    /** return two angles [max, min] between a and b
     * "a" and "b" must be normalized simple bivectors*/
    static angle(a: Bivec, b: Bivec): number[];
    rotate(r: Rotor): Bivec;
    rotates(r: Rotor): Bivec;
    rotatesconj(r: Rotor): Bivec;
    rotateset(bivec: Bivec, r: Rotor): Bivec;
    rotateconjset(bivec: Bivec, r: Rotor): Bivec;
    /** return a random oriented simple normalized bivector */
    static rand(): Bivec;
    randset(): Bivec;
    /** return a random oriented simple normalized bivector by seed */
    static srand(seed: Srand): Bivec;
    srandset(seed: Srand): Bivec;
    pushPool(pool?: BivecPool): void;
}
export declare let _bivec: Bivec;
