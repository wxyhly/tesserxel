import { Pool } from "../pool.js";
import { Quaternion } from "./quaternion.js";
import { Vec3 } from "./vec3.js";
export declare class Mat3Pool extends Pool<Mat3> {
    constructObject(): Mat3;
}
export declare const mat3Pool: Mat3Pool;
export declare class Mat3 {
    elem: number[];
    static id: Mat3;
    static zero: Mat3;
    static diag(a: number, b: number, c: number): Mat3;
    constructor(a?: number, b?: number, c?: number, d?: number, e?: number, f?: number, g?: number, h?: number, i?: number);
    set(a?: number, b?: number, c?: number, d?: number, e?: number, f?: number, g?: number, h?: number, i?: number): Mat3;
    setid(): Mat3;
    ts(): Mat3;
    t(): Mat3;
    /** col vector */ x_(): Vec3;
    /** col vector */ y_(): Vec3;
    /** col vector */ z_(): Vec3;
    /** row vector */ _x(): Vec3;
    /** row vector */ _y(): Vec3;
    /** row vector */ _z(): Vec3;
    copy(m2: Mat3): Mat3;
    add(m2: Mat3): Mat3;
    adds(m2: Mat3): Mat3;
    neg(): Mat3;
    negs(): Mat3;
    sub(m2: Mat3): Mat3;
    subs(m2: Mat3): Mat3;
    mulf(k: number): Mat3;
    mulfs(k: number): Mat3;
    mulv(v: Vec3): Vec3;
    mul(m: Mat3): Mat3;
    muls(m: Mat3): Mat3;
    inv(): Mat3;
    invs(): Mat3;
    setFromRotaion(q: Quaternion): Mat3;
    pushPool(pool?: Mat3Pool): void;
}
export declare let _mat3: Mat3;
