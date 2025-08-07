import { Bivec } from "./bivec.js";
import { Mat4 } from "./mat4.js";
import { Rotor, _r } from "./rotor.js";
import { Vec4, _vec4, _vec4_1 } from "./vec4.js";

/** [A(4x4), b(1x4)]
 * 
 *  [0(4x1), 1(1x1)]
 * 
 *  a blocked 5x5 matrix for transform in 4d
 */
export class AffineMat4 {
    mat: Mat4;
    vec: Vec4;
    constructor(mat: Mat4 = new Mat4(), vec: Vec4 = new Vec4()) {
        this.mat = mat; this.vec = vec;
    }
    writeBuffer(b: Float32Array, offset: number = 0) {
        this.mat.writeBuffer(b, offset);
        this.vec.writeBuffer(b, offset + 16);
    }
    inv(): AffineMat4 {
        let m = this.mat.inv();
        return new AffineMat4(m, m.mulv(this.vec).negs());
    }
    invs(): AffineMat4 {
        this.mat.invs();
        this.vec.copy(this.mat.mulv(this.vec).negs());
        return this;
    }
    mul(m: AffineMat4): AffineMat4 {
        return new AffineMat4(this.mat.mul(m.mat), this.mat.mulv(m.vec).adds(this.vec));
    }
    /** this = this * m */
    mulsr(m: AffineMat4): AffineMat4 {
        this.vec.adds(this.mat.mulv(m.vec));
        this.mat.mulsr(m.mat);
        return this;
    }
    /** this = m * this */
    mulsl(m: AffineMat4): AffineMat4 {
        this.vec.mulmatls(m.mat).adds(m.vec);
        this.mat.mulsl(m.mat);
        return this;
    }
    setFromObj4(o: Obj4) {
        this.mat.setFromRotor(o.rotation);
        if (o.scale) {
            this.mat.mulsr(Mat4.diag(o.scale.x, o.scale.y, o.scale.z, o.scale.w));
        }
        this.vec.copy(o.position);
        return this;
    }
    setFromObj4inv(o: Obj4) {
        this.vec.copy(o.position).negs().rotatesconj(o.rotation);
        this.mat.setFromRotorconj(o.rotation);
        if (o.scale) {
            let x = 1 / o.scale.x;
            let y = 1 / o.scale.y;
            let z = 1 / o.scale.z;
            let w = 1 / o.scale.w;
            this.mat.mulsl(Mat4.diag(x, y, z, w));
            this.vec.x *= x; this.vec.y *= y; this.vec.z *= z; this.vec.w *= w;
        }
        return this;
    }
}
/** an coordinate transform of rotation translation and scale */
export class Obj4 {
    position: Vec4;
    rotation: Rotor;
    scale: Vec4 | undefined;
    constructor(
        position?: Vec4, rotation?: Rotor,
        scale?: Vec4
    ) {
        this.position = position ?? new Vec4();
        this.rotation = rotation ?? new Rotor();
        this.scale = scale;
    }
    copyObj4(o: Obj4) {
        if (o.position) this.position.copy(o.position);
        if (o.rotation) this.rotation.copy(o.rotation);
        if (o.scale) { if (!this.scale) this.scale = new Vec4; this.scale.copy(o.scale); }
        return this;
    }
    local2world(point: Vec4): Vec4 {
        if (this.scale)
            return new Vec4(
                this.scale.x * point.x, this.scale.y * point.y,
                this.scale.z * point.z, this.scale.w * point.w
            ).rotates(this.rotation).adds(this.position);

        return point.rotate(this.rotation).adds(this.position);
    }
    world2local(point: Vec4): Vec4 {
        let a = point.sub(this.position).rotatesconj(this.rotation);
        if (this.scale) return new Vec4(
            a.x / this.scale.x, a.y / this.scale.y,
            a.z / this.scale.z, a.w / this.scale.w
        );
        return a;
    }
    getMat4(): Mat4 {
        if (this.scale)
            return this.rotation.toMat4().mul(
                Mat4.diag(this.scale.x, this.scale.y, this.scale.z, this.scale.w)
            );
        return this.rotation.toMat4();
    }
    getMat4inv(): Mat4 {
        if (this.scale)
            return Mat4.diag(1 / this.scale.x, 1 / this.scale.y, 1 / this.scale.z, 1 / this.scale.w).mul(
                this.rotation.conj().toMat4()
            );
        return this.rotation.conj().toMat4();
    }
    getAffineMat4(): AffineMat4 {
        if (this.scale)
            return new AffineMat4(this.rotation.toMat4().mulsr(
                Mat4.diag(this.scale.x, this.scale.y, this.scale.z, this.scale.w)
            ), this.position.clone());
        return new AffineMat4(this.rotation.toMat4(), this.position.clone());
    }
    getAffineMat4inv(): AffineMat4 {
        let b = this.position.neg().rotatesconj(this.rotation);
        if (!this.scale) return new AffineMat4(
            this.rotation.conj().toMat4(), b
        );
        let x = 1 / this.scale.x;
        let y = 1 / this.scale.y;
        let z = 1 / this.scale.z;
        let w = 1 / this.scale.w;
        return new AffineMat4(Mat4.diag(x, y, z, w).mulsr(
            this.rotation.conj().toMat4()
        ), new Vec4(b.x * x, b.y * y, b.z * z, b.w * w));
    }
    translates(v: Vec4): this {
        this.position.adds(v);
        return this;
    }
    rotates(r: Rotor): this {
        this.rotation.mulsl(r);
        return this;
    }
    rotatesconj(r: Rotor): this {
        this.rotation.mulslconj(r);
        return this;
    }
    rotatesb(b: Bivec): this {
        this.rotation.mulsl(_r.expset(b));
        return this;
    }
    rotatesAt(r: Rotor, center: Vec4 = new Vec4()): this {
        this.rotation.mulsl(r);
        this.position.subs(center).rotates(r).adds(center);
        return this;
    }
    lookAt(front: Vec4, target: Vec4) {
        let dir = _vec4.subset(target, this.position);
        this.rotates(_r.setFromLookAt(_vec4_1.copy(front).rotates(this.rotation), dir.norms()));
        return this;
    }
}
