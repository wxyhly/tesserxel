import { Pool } from "../pool.js";
import { Srand } from "../random.js";
import { Bivec } from "./bivec.js";
import { Mat4 } from "./mat4.js";
import { Quaternion } from "./quaternion.js";
import { Vec4 } from "./vec4.js";
export declare class RotorPool extends Pool<Rotor> {
    constructObject(): Rotor;
}
export declare const rotorPool: RotorPool;
export declare class Rotor {
    l: Quaternion;
    r: Quaternion;
    constructor(l?: Quaternion, r?: Quaternion);
    clone(): Rotor;
    copy(r: Rotor): Rotor;
    conj(): Rotor;
    conjs(): Rotor;
    norms(): Rotor;
    /** Apply this to R: this * R;
     *
     * [this.l * R.l, R.r * this.r]; */
    mul(R: Rotor): Rotor;
    /** Apply this to R: this = this * R;
     *
     * [this.l, this.r] = [this.l * R.l, R.r * this.r]; */
    mulsr(R: Rotor): Rotor;
    /** Apply R to this: this = R * this;
     *
     * [this.l, this.r] = [R.l * this.l, this.r * R.r]; */
    mulsl(R: Rotor): Rotor;
    /** Apply this to R: this = this * conj(R);
     *
     * [this.l, this.r] = [this.l * conj(R.l), conj(R.r) * this.r]; */
    mulsrconj(R: Rotor): Rotor;
    /** Apply R to this: this = conj(R) * this;
     *
     * [this.l, this.r] = [conj(R.l) * this.l, this.r * conj(R.r)]; */
    mulslconj(R: Rotor): Rotor;
    sqrt(): Rotor;
    isFinite(): boolean;
    expset(bivec: Bivec): Rotor;
    log(): Bivec;
    static slerp(a: Rotor, b: Rotor, t: number): Rotor;
    toMat4(): Mat4;
    /** set rotor from a rotation matrix,
     * i.e. m must be orthogonal with determinant 1.
     * algorithm: iteratively aligne each axis. */
    setFromMat4(m: Mat4): Rotor;
    /** Rotor: rotate from plane1 to plane2
     *  Bivectors must be simple and normalised */
    static lookAtbb(from: Bivec, to: Bivec): Rotor;
    /** plane must be a unit simple vector, if not, use Bivec.exp() instead
     * angle1 is rotation angle on the plane
     * angle2 is rotatoin angle on the perpendicular plane (right handed, eg: exy + ezw)
    */
    static fromPlane(plane: Bivec, angle1: number, angle2?: number): Rotor;
    /** "from" and "to" must be normalized vectors*/
    static lookAt(from: Vec4, to: Vec4): Rotor;
    static lookAtvb(from: Vec4, to: Bivec): Rotor;
    /** "from" and "to" must be normalized vectors */
    setFromLookAt(from: Vec4, to: Vec4): Rotor;
    static rand(): Rotor;
    static srand(seed: Srand): Rotor;
    randset(): Rotor;
    srandset(seed: Srand): Rotor;
    pushPool(pool?: RotorPool): void;
}
export declare let _r: Rotor;
