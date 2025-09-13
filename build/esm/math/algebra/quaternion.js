import { _360, _180 } from '../const.js';
import { Pool } from '../pool.js';
import { Mat3 } from './mat3.js';
import { Mat4 } from './mat4.js';
import { Vec3, _vec3, _vec3_1, _vec3_2 } from './vec3.js';
import { Vec4 } from './vec4.js';

class QuaternionPool extends Pool {
    constructObject() { return new Quaternion; }
}
const quaternionPool = new QuaternionPool;
class Quaternion {
    x;
    y;
    z;
    w;
    constructor(x = 1, y = 0, z = 0, w = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
    set(x = 1, y = 0, z = 0, w = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
        return this;
    }
    flat() {
        return [this.x, this.y, this.z, this.w];
    }
    copy(v) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        this.w = v.w;
        return this;
    }
    yzw() { return new Vec3(this.y, this.z, this.w); }
    ywz() { return new Vec3(this.y, this.w, this.z); }
    zyw() { return new Vec3(this.z, this.y, this.w); }
    zwy() { return new Vec3(this.z, this.w, this.y); }
    wzy() { return new Vec3(this.w, this.z, this.y); }
    wyz() { return new Vec3(this.w, this.y, this.z); }
    wxyz() { return new Vec4(this.w, this.x, this.y, this.z); }
    wxzy() { return new Vec4(this.w, this.x, this.z, this.y); }
    wyxz() { return new Vec4(this.w, this.y, this.x, this.z); }
    wzxy() { return new Vec4(this.w, this.z, this.x, this.y); }
    yxzw() { return new Vec4(this.y, this.x, this.z, this.w); }
    xzwy() { return new Vec4(this.x, this.z, this.w, this.y); }
    xyzw() { return new Vec4(this.x, this.y, this.z, this.w); }
    clone() {
        return new Quaternion(this.x, this.y, this.z, this.w);
    }
    neg() {
        return new Quaternion(-this.x, -this.y, -this.z, -this.w);
    }
    negs() {
        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;
        this.w = -this.w;
        return this;
    }
    mul(q) {
        return new Quaternion(this.x * q.x - this.y * q.y - this.z * q.z - this.w * q.w, this.x * q.y + this.y * q.x + this.z * q.w - this.w * q.z, this.x * q.z - this.y * q.w + this.z * q.x + this.w * q.y, this.x * q.w + this.y * q.z - this.z * q.y + this.w * q.x);
    }
    /** this = this * q; */
    mulsr(q) {
        var x = this.x * q.x - this.y * q.y - this.z * q.z - this.w * q.w;
        var y = this.x * q.y + this.y * q.x + this.z * q.w - this.w * q.z;
        var z = this.x * q.z - this.y * q.w + this.z * q.x + this.w * q.y;
        this.w = this.x * q.w + this.y * q.z - this.z * q.y + this.w * q.x;
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }
    /** this = q * this; */
    mulsl(q) {
        var x = q.x * this.x - q.y * this.y - q.z * this.z - q.w * this.w;
        var y = q.x * this.y + q.y * this.x + q.z * this.w - q.w * this.z;
        var z = q.x * this.z - q.y * this.w + q.z * this.x + q.w * this.y;
        this.w = q.x * this.w + q.y * this.z - q.z * this.y + q.w * this.x;
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }
    /** this = this * conj(q); */
    mulsrconj(q) {
        var x = this.x * q.x + this.y * q.y + this.z * q.z + this.w * q.w;
        var y = -this.x * q.y + this.y * q.x - this.z * q.w + this.w * q.z;
        var z = -this.x * q.z + this.y * q.w + this.z * q.x - this.w * q.y;
        this.w = -this.x * q.w - this.y * q.z + this.z * q.y + this.w * q.x;
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }
    /** this = conj(q) * this; */
    mulslconj(q) {
        var x = q.x * this.x + q.y * this.y + q.z * this.z + q.w * this.w;
        var y = q.x * this.y - q.y * this.x - q.z * this.w + q.w * this.z;
        var z = q.x * this.z + q.y * this.w - q.z * this.x - q.w * this.y;
        this.w = q.x * this.w - q.y * this.z + q.z * this.y - q.w * this.x;
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }
    conj() {
        return new Quaternion(this.x, -this.y, -this.z, -this.w);
    }
    conjs() {
        this.y = -this.y;
        this.z = -this.z;
        this.w = -this.w;
        return this;
    }
    norm() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    }
    norms() {
        let n = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
        n = n == 0 ? 0 : (1 / n);
        this.x *= n;
        this.y *= n;
        this.z *= n;
        this.w *= n;
        return this;
    }
    /** axis must be a unit vector, if not, use Vec3.exp() instead */
    static fromAxis(axis, angle) {
        angle *= 0.5;
        let s = Math.sin(angle);
        return new Quaternion(Math.cos(angle), axis.x * s, axis.y * s, axis.z * s);
    }
    sqrt() {
        // we choose pos value because it's closer to 1
        let a = Math.sqrt(0.5 * (this.x + 1));
        let div2a = 1 / (2 * a);
        return new Quaternion(a, this.y * div2a, this.z * div2a, this.w * div2a);
    }
    sqrts() {
        // we choose pos value because it's closer to 1
        let a = Math.sqrt(0.5 * (this.x + 1));
        let div2a = 1 / (2 * a);
        return this.set(a, this.y * div2a, this.z * div2a, this.w * div2a);
    }
    /** get generator of this, Quaternion must be normalized */
    log() {
        let s = Math.acos(this.x);
        return this.yzw().mulfs(2 * s / Math.sin(s));
    }
    static slerp(a, b, t, fourDMode) {
        let cosf = a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;
        let A, B;
        if (cosf > 0.99999) {
            // linear approxiamtion
            A = 1 - t;
            B = t;
        }
        else {
            if (cosf < -0.99999 && fourDMode) {
                // 4D rotation but with opposite dir
                let ortho;
                if (Math.abs(a.x) < 0.1) {
                    ortho = new Quaternion(1, 0, 0, 0);
                }
                else {
                    ortho = new Quaternion(0, 1, 0, 0);
                }
                let dot = a.x * ortho.x + a.y * ortho.y + a.z * ortho.z + a.w * ortho.w;
                ortho.set(ortho.x - dot * a.x, ortho.y - dot * a.y, ortho.z - dot * a.z, ortho.w - dot * a.w).norms();
                b = ortho;
                A = Math.cos(Math.PI * t);
                B = Math.sin(Math.PI * t);
            }
            else if (cosf < 0 && !fourDMode) {
                // 3D rotation, inverse Quaternion then slerp
                let f = Math.acos(-cosf);
                let _1s = 1 / Math.sin(f);
                A = Math.sin((1 - t) * f) * _1s;
                B = -Math.sin(t * f) * _1s;
            }
            else {
                // just slerp
                let f = Math.acos(cosf);
                let _1s = 1 / Math.sin(f);
                A = Math.sin((1 - t) * f) * _1s;
                B = Math.sin(t * f) * _1s;
            }
        }
        return new Quaternion(a.x * A + b.x * B, a.y * A + b.y * B, a.z * A + b.z * B, a.w * A + b.w * B);
    }
    toRotateMat() {
        let xt2 = this.y + this.y, yt2 = this.z + this.z, zt2 = this.w + this.w;
        let x2 = this.y * xt2;
        let y2 = this.z * yt2;
        let z2 = this.w * zt2;
        let xy = this.y * yt2;
        let yz = this.w * yt2;
        let xz = this.w * xt2;
        let wx = this.x * xt2;
        let wy = this.x * yt2;
        let wz = this.x * zt2;
        return new Mat4(1 - (y2 + z2), xy - wz, xz + wy, 0, xy + wz, 1 - x2 - z2, yz - wx, 0, xz - wy, yz + wx, 1 - x2 - y2, 0, 0, 0, 0, 1);
    }
    toMat3() {
        let xt2 = this.y + this.y, yt2 = this.z + this.z, zt2 = this.w + this.w;
        let x2 = this.y * xt2;
        let y2 = this.z * yt2;
        let z2 = this.w * zt2;
        let xy = this.y * yt2;
        let yz = this.w * yt2;
        let xz = this.w * xt2;
        let wx = this.x * xt2;
        let wy = this.x * yt2;
        let wz = this.x * zt2;
        return new Mat3(1 - (y2 + z2), xy - wz, xz + wy, xy + wz, 1 - x2 - z2, yz - wx, xz - wy, yz + wx, 1 - x2 - y2);
    }
    toLMat4() {
        return new Mat4(this.x, -this.y, -this.z, -this.w, this.y, this.x, -this.w, this.z, this.z, this.w, this.x, -this.y, this.w, -this.z, this.y, this.x);
    }
    toRMat4() {
        return new Mat4(this.x, -this.y, -this.z, -this.w, this.y, this.x, this.w, -this.z, this.z, -this.w, this.x, this.y, this.w, this.z, -this.y, this.x);
    }
    expset(v) {
        let g = v.norm() * 0.5;
        let s = Math.abs(g) > 0.005 ? Math.sin(g) / g * 0.5 : 0.5 - g * g / 12;
        return this.set(Math.cos(g), s * v.x, s * v.y, s * v.z);
    }
    distanceTo(p) {
        return Math.hypot(p.x - this.x, p.y - this.y, p.z - this.z, p.w - this.w);
    }
    distanceSqrTo(p) {
        let x = p.x - this.x, y = p.y - this.y, z = p.z - this.z, w = p.w - this.w;
        return x * x + y * y + z * z + w * w;
    }
    static rand() {
        let a = Math.random() * _360;
        let b = Math.random() * _360;
        let c = Math.random();
        let sc = Math.sqrt(c);
        let cc = Math.sqrt(1 - c);
        return new Quaternion(sc * Math.cos(a), sc * Math.sin(a), cc * Math.cos(b), cc * Math.sin(b));
    }
    static srand(seed) {
        let a = seed.nextf() * _360;
        let b = seed.nextf() * _360;
        let c = seed.nextf();
        let sc = Math.sqrt(c);
        let cc = Math.sqrt(1 - c);
        return new Quaternion(sc * Math.cos(a), sc * Math.sin(a), cc * Math.cos(b), cc * Math.sin(b));
    }
    randset() {
        let a = Math.random() * _360;
        let b = Math.random() * _360;
        let c = Math.random();
        let sc = Math.sqrt(c);
        let cc = Math.sqrt(1 - c);
        return this.set(sc * Math.cos(a), sc * Math.sin(a), cc * Math.cos(b), cc * Math.sin(b));
    }
    srandset(seed) {
        let a = seed.nextf() * _360;
        let b = seed.nextf() * _360;
        let c = seed.nextf();
        let sc = Math.sqrt(c);
        let cc = Math.sqrt(1 - c);
        return this.set(sc * Math.cos(a), sc * Math.sin(a), cc * Math.cos(b), cc * Math.sin(b));
    }
    /** "from" and "to" must be normalized vectors*/
    static lookAt(from, to) {
        let right = _vec3.wedgeset(from, to);
        let s = right.norm();
        let c = from.dot(to);
        if (s > 0.000001) { // not aligned
            right.mulfs(Math.atan2(s, c) / s);
        }
        else if (c < 0) { // almost n reversely aligned
            let v = _vec3_1.wedgeset(from, Vec3.x);
            if (v.norm1() < 0.01) {
                v = _vec3_1.wedgeset(from, Vec3.y);
            }
            return v.norms().mulfs(_180).exp();
        }
        return right.exp();
    }
    setFromLookAt(from, to) {
        let right = _vec3.wedgeset(from, to);
        let s = right.norm();
        let c = from.dot(to);
        if (s > 0.000001) { // not aligned
            right.mulfs(Math.atan2(s, c) / s);
        }
        else if (c < 0) { // almost n reversely aligned
            let v = _vec3_1.wedgeset(from, Vec3.x);
            if (v.norm1() < 0.01) {
                v = _vec3_1.wedgeset(from, Vec3.y);
            }
            return this.expset(v.norms().mulfs(_180));
        }
        return this.expset(right);
    }
    pushPool(pool = quaternionPool) {
        pool.push(this);
    }
    /** set rotor from a rotation matrix,
         * i.e. m must be orthogonal with determinant 1.
         * algorithm: iteratively aligne each axis. */
    setFromMat3(m) {
        return this.setFromLookAt(Vec3.x, m.x_()).mulsl(_Q.setFromLookAt(_vec3_2.copy(Vec3.y).rotates(this), m.y_()));
    }
}
let _Q = new Quaternion();
let _Q_1 = new Quaternion();
let _Q_2 = new Quaternion();

export { Quaternion, QuaternionPool, _Q, _Q_1, _Q_2, quaternionPool };
//# sourceMappingURL=quaternion.js.map
