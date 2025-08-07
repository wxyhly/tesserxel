import { Vec3 } from "./vec3.js";
import { Quaternion } from "./quaternion.js";
import { Pool } from "../pool.js";
import { Srand } from "../random.js";
import { Bivec } from "./bivec.js";
import { Rotor } from "./rotor.js";
import { Mat4 } from "./mat4.js";
import { Obj4 } from "./affine.js";
export declare class Vec4Pool extends Pool<Vec4> {
    constructObject(): Vec4;
}
export declare const vec4Pool: Vec4Pool;
export declare class Vec4 {
    x: number;
    y: number;
    z: number;
    w: number;
    static readonly x: Vec4;
    static readonly y: Vec4;
    static readonly z: Vec4;
    static readonly w: Vec4;
    static readonly origin: Vec4;
    static readonly xNeg: Vec4;
    static readonly yNeg: Vec4;
    static readonly zNeg: Vec4;
    static readonly wNeg: Vec4;
    constructor(x?: number, y?: number, z?: number, w?: number);
    flat(): number[];
    writeBuffer(b: Float32Array, offset?: number): void;
    copy(v: Vec4 | Quaternion): Vec4;
    set(x?: number, y?: number, z?: number, w?: number): Vec4;
    ywx(): Vec3;
    yxw(): Vec3;
    yzw(): Vec3;
    ywz(): Vec3;
    yzx(): Vec3;
    yxz(): Vec3;
    zwx(): Vec3;
    zxw(): Vec3;
    zyw(): Vec3;
    zwy(): Vec3;
    zyx(): Vec3;
    zxy(): Vec3;
    xzy(): Vec3;
    xyz(): Vec3;
    xwy(): Vec3;
    xyw(): Vec3;
    xzw(): Vec3;
    xwz(): Vec3;
    wxy(): Vec3;
    wyx(): Vec3;
    wzy(): Vec3;
    wyz(): Vec3;
    wxz(): Vec3;
    wzx(): Vec3;
    wxyz(): Vec4;
    wxzy(): Vec4;
    wyxz(): Vec4;
    wzxy(): Vec4;
    yxzw(): Vec4;
    xzwy(): Vec4;
    isFinite(): boolean;
    clone(): Vec4;
    add(v2: Vec4): Vec4;
    addset(v1: Vec4, v2: Vec4): Vec4;
    addf(v2: number): Vec4;
    adds(v2: Vec4): Vec4;
    addfs(v2: number): Vec4;
    neg(): Vec4;
    negs(): Vec4;
    sub(v2: Vec4): Vec4;
    subset(v1: Vec4, v2: Vec4): Vec4;
    subf(v2: number): Vec4;
    subs(v2: Vec4): Vec4;
    subfs(v2: number): Vec4;
    mulf(v2: number): Vec4;
    mulfs(v2: number): Vec4;
    mulmatvset(mat4: Mat4, v: Vec4): Vec4;
    /** this += v * k */
    addmulfs(v: Vec4, k: number): this;
    mul(v2: Vec4): Vec4;
    muls(v2: Vec4): Vec4;
    divf(v2: number): Vec4;
    divfs(v2: number): Vec4;
    div(v2: Vec4): Vec4;
    divs(v2: Vec4): Vec4;
    dot(v2: Vec4): number;
    norm(): number;
    norms(): Vec4;
    normsqr(): number;
    norm1(): number;
    norminf(): number;
    normi(i: number): number;
    wedge(V: Vec4): Bivec;
    wedgevbset(v: Vec4, bivec: Bivec): Vec4;
    wedgeb(bivec: Bivec): Vec4;
    /** Vector part of Geometry Product
     * ey * exy = -ex, ex * exy = ey, ex * eyz = 0
     *  */
    dotb(B: Bivec): Vec4;
    /** this = this * b;
     *  Vector part of Geometry Product
     *  ey * exy = -ex, ex * exy = ey, ex * eyz = 0
     *  */
    dotbsr(B: Bivec): Vec4;
    dotbset(v: Vec4, B: Bivec): Vec4;
    /** this = mat * this */
    mulmatls(mat4: Mat4): Vec4;
    applyObj4(o: Obj4): this;
    applyObj4inv(o: Obj4): this;
    rotate(r: Rotor): Vec4;
    rotates(r: Rotor): Vec4;
    rotateconj(r: Rotor): Vec4;
    rotatesconj(r: Rotor): Vec4;
    reflect(normal: Vec4): Vec4;
    reflects(normal: Vec4): Vec4;
    distanceTo(p: Vec4): number;
    distanceSqrTo(p: Vec4): number;
    randset(): Vec4;
    srandset(seed: Srand): Vec4;
    /** project vector on a plane determined by bivector.
     * bivector b must be normalized and simple
     */
    projb(b: Bivec): Vec4;
    projbs(b: Bivec): Vec4;
    static rand(): Vec4;
    static srand(seed: Srand): Vec4;
    equal(v: Vec4): boolean;
    pushPool(pool?: Vec4Pool): void;
}
export declare let _vec4: Vec4;
export declare let _vec4_1: Vec4;
