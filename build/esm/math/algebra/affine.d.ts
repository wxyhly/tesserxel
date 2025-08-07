import { Bivec } from "./bivec.js";
import { Mat4 } from "./mat4.js";
import { Rotor } from "./rotor.js";
import { Vec4 } from "./vec4.js";
/** [A(4x4), b(1x4)]
 *
 *  [0(4x1), 1(1x1)]
 *
 *  a blocked 5x5 matrix for transform in 4d
 */
export declare class AffineMat4 {
    mat: Mat4;
    vec: Vec4;
    constructor(mat?: Mat4, vec?: Vec4);
    writeBuffer(b: Float32Array, offset?: number): void;
    inv(): AffineMat4;
    invs(): AffineMat4;
    mul(m: AffineMat4): AffineMat4;
    /** this = this * m */
    mulsr(m: AffineMat4): AffineMat4;
    /** this = m * this */
    mulsl(m: AffineMat4): AffineMat4;
    setFromObj4(o: Obj4): this;
    setFromObj4inv(o: Obj4): this;
}
/** an coordinate transform of rotation translation and scale */
export declare class Obj4 {
    position: Vec4;
    rotation: Rotor;
    scale: Vec4 | undefined;
    constructor(position?: Vec4, rotation?: Rotor, scale?: Vec4);
    copyObj4(o: Obj4): this;
    local2world(point: Vec4): Vec4;
    world2local(point: Vec4): Vec4;
    getMat4(): Mat4;
    getMat4inv(): Mat4;
    getAffineMat4(): AffineMat4;
    getAffineMat4inv(): AffineMat4;
    translates(v: Vec4): this;
    rotates(r: Rotor): this;
    rotatesconj(r: Rotor): this;
    rotatesb(b: Bivec): this;
    rotatesAt(r: Rotor, center?: Vec4): this;
    lookAt(front: Vec4, target: Vec4): this;
}
