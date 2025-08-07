import { Pool } from "../pool.js";
import { Srand } from "../random.js";
import { Mat3 } from "./mat3.js";
import { Mat4 } from "./mat4.js";
import { Vec3 } from "./vec3.js";
import { Vec4 } from "./vec4.js";
export declare class QuaternionPool extends Pool<Quaternion> {
    constructObject(): Quaternion;
}
export declare const quaternionPool: QuaternionPool;
export declare class Quaternion {
    x: number;
    y: number;
    z: number;
    w: number;
    constructor(x?: number, y?: number, z?: number, w?: number);
    set(x?: number, y?: number, z?: number, w?: number): this;
    flat(): number[];
    copy(v: Vec4 | Quaternion): this;
    yzw(): Vec3;
    ywz(): Vec3;
    zyw(): Vec3;
    zwy(): Vec3;
    wzy(): Vec3;
    wyz(): Vec3;
    wxyz(): Vec4;
    wxzy(): Vec4;
    wyxz(): Vec4;
    wzxy(): Vec4;
    yxzw(): Vec4;
    xzwy(): Vec4;
    xyzw(): Vec4;
    clone(): Quaternion;
    neg(): Quaternion;
    negs(): Quaternion;
    mul(q: Quaternion | Vec4): Quaternion;
    /** this = this * q; */
    mulsr(q: Quaternion | Vec4): Quaternion;
    /** this = q * this; */
    mulsl(q: Quaternion | Vec4): Quaternion;
    /** this = this * conj(q); */
    mulsrconj(q: Quaternion | Vec4): Quaternion;
    /** this = conj(q) * this; */
    mulslconj(q: Quaternion | Vec4): Quaternion;
    conj(): Quaternion;
    conjs(): Quaternion;
    norm(): number;
    norms(): Quaternion;
    /** axis must be a unit vector, if not, use Vec3.exp() instead */
    static fromAxis(axis: Vec3, angle: number): Quaternion;
    sqrt(): Quaternion;
    sqrts(): Quaternion;
    /** get generator of this, Quaternion must be normalized */
    log(): Vec3;
    static slerp(a: Quaternion, b: Quaternion, t: number): Quaternion;
    toRotateMat(): Mat4;
    toMat3(): Mat3;
    toLMat4(): Mat4;
    toRMat4(): Mat4;
    expset(v: Vec3): this;
    static rand(): Quaternion;
    static srand(seed: Srand): Quaternion;
    randset(): Quaternion;
    srandset(seed: Srand): Quaternion;
    /** "from" and "to" must be normalized vectors*/
    static lookAt(from: Vec3, to: Vec3): Quaternion;
    setFromLookAt(from: Vec3, to: Vec3): this;
    pushPool(pool?: QuaternionPool): void;
    /** set rotor from a rotation matrix,
         * i.e. m must be orthogonal with determinant 1.
         * algorithm: iteratively aligne each axis. */
    setFromMat3(m: Mat3): Quaternion;
}
export declare let _Q: Quaternion;
export declare let _Q_1: Quaternion;
export declare let _Q_2: Quaternion;
