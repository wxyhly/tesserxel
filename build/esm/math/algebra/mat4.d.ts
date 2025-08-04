import { Pool } from "../pool";
import { Mat3 } from "./mat3";
import { Quaternion } from "./quaternion";
import { Rotor } from "./rotor";
import { Vec3 } from "./vec3";
import { Vec4 } from "./vec4";
export declare class Mat4Pool extends Pool<Mat4> {
    constructObject(): Mat4;
}
export declare const mat4Pool: Mat4Pool;
export declare class Mat4 {
    elem: number[];
    static readonly id: Mat4;
    static readonly zero: Mat4;
    static diag(a: number, b: number, c: number, d: number): Mat4;
    static augVec4(a: Vec4, b: Vec4, c: Vec4, d: Vec4): Mat4;
    static augMat3(a: Mat3, b: Vec3, c: Vec3, d: number): Mat4;
    augVec4set(a: Vec4, b: Vec4, c: Vec4, d: Vec4): Mat4;
    augMat3set(a: Mat3, b: Vec3, c: Vec3, d: number): Mat4;
    constructor(a?: number, b?: number, c?: number, d?: number, e?: number, f?: number, g?: number, h?: number, i?: number, j?: number, k?: number, l?: number, m?: number, n?: number, o?: number, p?: number);
    clone(): Mat4;
    writeBuffer(b: Float32Array, offset?: number): void;
    setid(): this;
    set(a?: number, b?: number, c?: number, d?: number, e?: number, f?: number, g?: number, h?: number, i?: number, j?: number, k?: number, l?: number, m?: number, n?: number, o?: number, p?: number): this;
    ts(): Mat4;
    t(): Mat4;
    /** col vector */ x_(): Vec4;
    /** col vector */ y_(): Vec4;
    /** col vector */ z_(): Vec4;
    /** col vector */ w_(): Vec4;
    /** row vector */ _x(): Vec4;
    /** row vector */ _y(): Vec4;
    /** row vector */ _z(): Vec4;
    /** row vector */ _w(): Vec4;
    copy(m2: Mat4): Mat4;
    add(m2: Mat4): Mat4;
    adds(m2: Mat4): Mat4;
    neg(): Mat4;
    negs(): Mat4;
    sub(m2: Mat4): Mat4;
    subs(m2: Mat4): Mat4;
    mulf(k: number): Mat4;
    mulfs(k: number): Mat4;
    mulv(v: Vec4): Vec4;
    mul(m: Mat4): Mat4;
    /** this = this * m; */
    mulsr(m: Mat4): Mat4;
    /** this = m * this; */
    mulsl(m: Mat4): Mat4;
    /** this = m1 * m2; */
    mulset(m1: Mat4, m2: Mat4): Mat4;
    setFrom3DRotation(q: Quaternion): Mat4;
    setFromQuaternionL(q: Quaternion): Mat4;
    setFromQuaternionR(q: Quaternion): Mat4;
    setFromRotor(r: Rotor): Mat4;
    setFromRotorconj(r: Rotor): Mat4;
    det(): number;
    inv(): Mat4;
    invs(): Mat4;
    pushPool(pool?: Mat4Pool): void;
}
export declare let _mat4: Mat4;
