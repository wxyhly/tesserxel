import { _180 } from "../const.js";
import { Pool } from "../pool.js";
import { Srand } from "../random.js";
import { Bivec, _bivec } from "./bivec.js";
import { Mat4, _mat4 } from "./mat4.js";
import { Quaternion } from "./quaternion.js";
import { Vec3, _vec3_1, _vec3_2, _vec3_3, _vec3_4, _vec3_5 } from "./vec3.js";
import { Vec4, _vec4 } from "./vec4.js";

export class RotorPool extends Pool<Rotor> {
    constructObject() { return new Rotor; }
}
export const rotorPool = new RotorPool;
export class Rotor {
    l: Quaternion;
    r: Quaternion;
    constructor(l: Quaternion = new Quaternion(), r: Quaternion = new Quaternion()) {
        this.l = l;
        this.r = r;
    }
    set() {
        this.l.set();
        this.r.set();
    }
    clone(): Rotor {
        return new Rotor(this.l.clone(), this.r.clone());
    }
    copy(r: Rotor): Rotor {
        this.l.copy(r.l);
        this.r.copy(r.r);
        return this;
    }
    conj(): Rotor {
        return new Rotor(this.l.conj(), this.r.conj());
    }
    conjs(): Rotor {
        this.l.conjs(), this.r.conjs(); return this;
    }
    norms(): Rotor {
        this.l.norms();
        this.r.norms();
        return this;
    }
    /** Apply this to R: this * R;
     * 
     * [this.l * R.l, R.r * this.r]; */
    mul(R: Rotor): Rotor {
        return new Rotor(this.l.mul(R.l), R.r.mul(this.r));
    }
    /** Apply this to R: this = this * R;
     * 
     * [this.l, this.r] = [this.l * R.l, R.r * this.r]; */
    mulsr(R: Rotor): Rotor {
        this.l.mulsr(R.l);
        this.r.mulsl(R.r);
        return this;
    }
    /** Apply R to this: this = R * this;
     * 
     * [this.l, this.r] = [R.l * this.l, this.r * R.r]; */
    mulsl(R: Rotor): Rotor {
        this.l.mulsl(R.l);
        this.r.mulsr(R.r);
        return this;
    }
    /** Apply this to R: this = this * conj(R);
     * 
     * [this.l, this.r] = [this.l * conj(R.l), conj(R.r) * this.r]; */
    mulsrconj(R: Rotor): Rotor {
        this.l.mulsrconj(R.l);
        this.r.mulslconj(R.r);
        return this;
    }
    /** Apply R to this: this = conj(R) * this;
     * 
     * [this.l, this.r] = [conj(R.l) * this.l, this.r * conj(R.r)]; */
    mulslconj(R: Rotor): Rotor {
        this.l.mulslconj(R.l);
        this.r.mulsrconj(R.r);
        return this;
    }
    sqrt(): Rotor {
        return new Rotor(this.l.sqrt(), this.r.sqrt());
    }
    isFinite(): boolean {
        return (
            isFinite(this.l.x) && isFinite(this.l.y) && isFinite(this.l.z) && isFinite(this.l.w) &&
            isFinite(this.r.x) && isFinite(this.r.y) && isFinite(this.r.z) && isFinite(this.r.w)
        );
    }
    expset(bivec: Bivec): Rotor {
        let A = _vec3_1.set(bivec.xy + bivec.zw, bivec.xz - bivec.yw, bivec.xw + bivec.yz);
        let B = _vec3_2.set(bivec.xy - bivec.zw, bivec.xz + bivec.yw, bivec.xw - bivec.yz);
        let a = A.norm(); let b = B.norm();
        let aa = a * 0.5; let bb = b * 0.5;
        let sa = (a > 0.005 ? Math.sin(aa) / a : 0.5 - a * a / 12);
        let sb = (b > 0.005 ? Math.sin(bb) / b : 0.5 - b * b / 12);
        this.l.set(Math.cos(aa), sa * A.x, sa * A.y, sa * A.z);
        this.r.set(Math.cos(bb), sb * B.x, sb * B.y, sb * B.z);
        return this;
    }
    log(): Bivec {
        let a: Vec3, b: Vec3;
        if (Math.abs(this.l.x) > 0.9999) {
            a = this.l.yzw();
        } else {
            let ls = Math.acos(this.l.x);
            a = this.l.yzw().mulfs(ls / Math.sin(ls));
        }
        if (Math.abs(this.r.x) > 0.9999) {
            b = this.r.yzw();
        } else {
            let rs = Math.acos(this.r.x);
            b = this.r.yzw().mulfs(rs / Math.sin(rs));
        }
        return new Bivec(
            a.x + b.x, a.y + b.y, a.z + b.z, a.z - b.z, b.y - a.y, a.x - b.x
        );
    }
    static slerp(a: Rotor, b: Rotor, t: number): Rotor {
        let l = a.l.x * b.l.x + a.l.y * b.l.y + a.l.z * b.l.z + a.l.w * b.l.w;
        let r = a.r.x * b.r.x + a.r.y * b.r.y + a.r.z * b.r.z + a.r.w * b.r.w;
        if ((l < 0 && r < 0) || (l < 0 && -l > r) || (r < 0 && -r > l)) {
            const r = new Rotor(
                Quaternion.slerp(a.l, b.l.negs(), t, true),
                Quaternion.slerp(a.r, b.r.negs(), t, true)
            );
            b.l.negs(); b.r.negs();
            return r;
        }
        return new Rotor(
            Quaternion.slerp(a.l, b.l, t, true),
            Quaternion.slerp(a.r, b.r, t, true)
        );
    }
    toMat4(): Mat4 {
        return this.l.toLMat4().mulsr(_mat4.setFromQuaternionR(this.r));
    }

    /** set rotor from a rotation matrix,
     * i.e. m must be orthogonal with determinant 1.
     * algorithm: iteratively aligne each axis. */
    setFromMat4(m: Mat4) {
        return this.setFromLookAt(Vec4.x, m.x_()).mulsl(
            _r.setFromLookAt(_vec4.copy(Vec4.y).rotates(this), m.y_())
        ).mulsl(
            _r.setFromLookAt(_vec4.copy(Vec4.z).rotates(this), m.z_())
        );
    }
    /** Rotor: rotate from plane1 to plane2
     *  Bivectors must be simple and normalised */
    static lookAtbb(from: Bivec, to: Bivec): Rotor {
        let A1 = _vec3_2.set(from.xy + from.zw, from.xz - from.yw, from.xw + from.yz);
        let B1 = _vec3_3.set(from.xy - from.zw, from.xz + from.yw, from.xw - from.yz);
        let A2 = _vec3_4.set(to.xy + to.zw, to.xz - to.yw, to.xw + to.yz);
        let B2 = _vec3_5.set(to.xy - to.zw, to.xz + to.yw, to.xw - to.yz);
        return new Rotor(Quaternion.lookAt(A1, A2), Quaternion.lookAt(B2, B1));
    }
    /** plane must be a unit simple vector, if not, use Bivec.exp() instead 
     * angle1 is rotation angle on the plane
     * angle2 is rotatoin angle on the perpendicular plane (right handed, eg: exy + ezw)
    */
    static fromPlane(plane: Bivec, angle1: number, angle2: number = 0): Rotor {
        let a = (angle1 + angle2) * 0.5, sa = Math.sin(a);
        let b = (angle1 - angle2) * 0.5, sb = Math.sin(b);
        return new Rotor(// norm of half of A is 1
            new Quaternion(Math.cos(a), sa * (plane.xy + plane.zw), sa * (plane.xz - plane.yw), sa * (plane.xw + plane.yz)),
            new Quaternion(Math.cos(b), sb * (plane.xy - plane.zw), sb * (plane.xz + plane.yw), sb * (plane.xw - plane.yz))
        );
    }

    /** "from" and "to" must be normalized vectors*/
    static lookAt(from: Vec4, to: Vec4): Rotor {

        let right = _bivec.wedgevvset(from, to);
        let s = right.norm();
        let c = from.dot(to);
        if (s > 0.000001) { // not aligned
            right.mulfs(Math.atan2(s, c) / s);
        } else if (c < 0) { // almost n reversely aligned
            let v = _bivec.wedgevvset(from, Vec4.x);
            if (v.norm1() < 0.01) {
                v = _bivec.wedgevvset(from, Vec4.y);
            }
            return v.norms().mulfs(_180).exp();
        }
        return right.exp();
    }

    // todo: lookAtvb(from: Vec4, to: Bivec): Rotor dir to plane or reverse
    static lookAtvb(from: Vec4, to: Bivec): Rotor {
        let toVect = _vec4.copy(from).projbs(to).norms();
        return Rotor.lookAt(from, toVect);
    }

    /** "from" and "to" must be normalized vectors */
    setFromLookAt(from: Vec4, to: Vec4): Rotor {
        let right = _bivec.wedgevvset(from, to);
        let s = right.norm();
        let c = from.dot(to);
        if (s > 0.000001) { // not aligned
            right.mulfs(Math.atan2(s, c) / s);
        } else if (c < 0) { // almost n reversely aligned
            let v = _bivec.wedgevvset(from, Vec4.x);
            if (v.norm1() < 0.01) {
                v = _bivec.wedgevvset(from, Vec4.y);
            }
            return this.expset(v.norms().mulfs(_180));
        }
        return this.expset(right);
    }
    distanceSqrTo(r:Rotor){
        return this.l.distanceSqrTo(r.l) + this.r.distanceSqrTo(r.r);
    }
    static rand(): Rotor {
        return new Rotor(Quaternion.rand(), Quaternion.rand());
    }
    static srand(seed: Srand): Rotor {
        return new Rotor(Quaternion.srand(seed), Quaternion.srand(seed));
    }
    randset(): Rotor {
        this.l.randset();
        this.r.randset();
        return this;
    }

    srandset(seed: Srand): Rotor {
        this.l.srandset(seed);
        this.r.srandset(seed);
        return this;
    }
    pushPool(pool: RotorPool = rotorPool) {
        pool.push(this);
    }

    // todo: fixbug

    // fromMat4(m: Mat4) {
    //     return Rotor.lookAt(Vec4.x, m.x_()).mulsl(
    //         _r.setFromLookAt(_vec4.copy(Vec4.y).rotates(this), m.y_())
    //     ).mulsl(
    //         _r.setFromLookAt(_vec4.copy(Vec4.z).rotates(this), m.z_())
    //     );
    // }
}

export let _r = new Rotor();