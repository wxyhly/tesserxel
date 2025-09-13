import { Pool } from '../pool.js';
import { Quaternion, _Q_1, _Q_2 } from './quaternion.js';
import { Rotor } from './rotor.js';
import { Vec3, _vec3_1, _vec3_2 } from './vec3.js';
import { Vec4 } from './vec4.js';

class BivecPool extends Pool {
    constructObject() { return new Bivec; }
}
const bivecPool = new BivecPool;
class Bivec {
    xy;
    xz;
    xw;
    yz;
    yw;
    zw;
    static xy = Object.freeze(new Bivec(1, 0, 0, 0, 0, 0));
    static xz = Object.freeze(new Bivec(0, 1, 0, 0, 0, 0));
    static xw = Object.freeze(new Bivec(0, 0, 1, 0, 0, 0));
    static yz = Object.freeze(new Bivec(0, 0, 0, 1, 0, 0));
    static yw = Object.freeze(new Bivec(0, 0, 0, 0, 1, 0));
    static zw = Object.freeze(new Bivec(0, 0, 0, 0, 0, 1));
    static yx = Object.freeze(new Bivec(-1, 0, 0, 0, 0, 0));
    static zx = Object.freeze(new Bivec(0, -1, 0, 0, 0, 0));
    static wx = Object.freeze(new Bivec(0, 0, -1, 0, 0, 0));
    static zy = Object.freeze(new Bivec(0, 0, 0, -1, 0, 0));
    static wy = Object.freeze(new Bivec(0, 0, 0, 0, -1, 0));
    static wz = Object.freeze(new Bivec(0, 0, 0, 0, 0, -1));
    isFinite() {
        return isFinite(this.xy) && isFinite(this.xz) && isFinite(this.xw) && isFinite(this.yz) && isFinite(this.yw) && isFinite(this.zw);
    }
    constructor(xy = 0, xz = 0, xw = 0, yz = 0, yw = 0, zw = 0) {
        this.xy = xy;
        this.xz = xz;
        this.xw = xw;
        this.yz = yz;
        this.yw = yw;
        this.zw = zw;
    }
    copy(v) {
        this.xy = v.xy;
        this.xz = v.xz;
        this.xw = v.xw;
        this.yz = v.yz;
        this.yw = v.yw;
        this.zw = v.zw;
        return this;
    }
    set(xy = 0, xz = 0, xw = 0, yz = 0, yw = 0, zw = 0) {
        this.xy = xy;
        this.xz = xz;
        this.xw = xw;
        this.yz = yz;
        this.yw = yw;
        this.zw = zw;
        return this;
    }
    clone() {
        return new Bivec(this.xy, this.xz, this.xw, this.yz, this.yw, this.zw);
    }
    flat() {
        return [this.xy, this.xz, this.xw, this.yz, this.yw, this.zw];
    }
    add(bv) {
        return new Bivec(this.xy + bv.xy, this.xz + bv.xz, this.xw + bv.xw, this.yz + bv.yz, this.yw + bv.yw, this.zw + bv.zw);
    }
    adds(bv) {
        this.xy += bv.xy;
        this.xz += bv.xz;
        this.xw += bv.xw;
        this.yz += bv.yz;
        this.yw += bv.yw;
        this.zw += bv.zw;
        return this;
    }
    addset(bv1, bv2) {
        return this.set(bv1.xy + bv2.xy, bv1.xz + bv2.xz, bv1.xw + bv2.xw, bv1.yz + bv2.yz, bv1.yw + bv2.yw, bv1.zw + bv2.zw);
    }
    addmulfs(bv, k) {
        this.xy += bv.xy * k;
        this.xz += bv.xz * k;
        this.xw += bv.xw * k;
        this.yz += bv.yz * k;
        this.yw += bv.yw * k;
        this.zw += bv.zw * k;
        return this;
    }
    neg() {
        return new Bivec(-this.xy, -this.xz, -this.xw, -this.yz, -this.yw, -this.zw);
    }
    negs() {
        this.xy = -this.xy;
        this.xz = -this.xz;
        this.xw = -this.xw;
        this.yz = -this.yz;
        this.yw = -this.yw;
        this.zw = -this.zw;
        return this;
    }
    sub(bv) {
        return new Bivec(this.xy - bv.xy, this.xz - bv.xz, this.xw - bv.xw, this.yz - bv.yz, this.yw - bv.yw, this.zw - bv.zw);
    }
    subs(bv) {
        this.xy -= bv.xy;
        this.xz -= bv.xz;
        this.xw -= bv.xw;
        this.yz -= bv.yz;
        this.yw -= bv.yw;
        this.zw -= bv.zw;
        return this;
    }
    subset(bv1, bv2) {
        return this.set(bv1.xy - bv2.xy, bv1.xz - bv2.xz, bv1.xw - bv2.xw, bv1.yz - bv2.yz, bv1.yw - bv2.yw, bv1.zw - bv2.zw);
    }
    mulf(k) {
        return new Bivec(k * this.xy, k * this.xz, k * this.xw, k * this.yz, k * this.yw, k * this.zw);
    }
    mulfs(k) {
        this.xy *= k;
        this.xz *= k;
        this.xw *= k;
        this.yz *= k;
        this.yw *= k;
        this.zw *= k;
        return this;
    }
    divf(k) {
        k = 1 / k;
        return new Bivec(k * this.xy, k * this.xz, k * this.xw, k * this.yz, k * this.yw, k * this.zw);
    }
    divfs(k) {
        k = 1 / k;
        this.xy *= k;
        this.xz *= k;
        this.xw *= k;
        this.yz *= k;
        this.yw *= k;
        this.zw *= k;
        return this;
    }
    dot(biv) {
        return this.xy * biv.xy + this.yz * biv.yz + this.zw * biv.zw + this.xw * biv.xw + this.xz * biv.xz + this.yw * biv.yw;
    }
    norm() {
        return Math.sqrt(this.xy * this.xy + this.xz * this.xz + this.yz * this.yz + this.yw * this.yw + this.zw * this.zw + this.xw * this.xw);
    }
    norms() {
        let k = Math.sqrt(this.xy * this.xy + this.xz * this.xz + this.yz * this.yz + this.yw * this.yw + this.zw * this.zw + this.xw * this.xw);
        k = k == 0 ? 0 : (1 / k);
        this.xy *= k;
        this.xz *= k;
        this.xw *= k;
        this.yz *= k;
        this.yw *= k;
        this.zw *= k;
        return this;
    }
    normsqr() {
        return this.xy * this.xy + this.xz * this.xz + this.yz * this.yz + this.yw * this.yw + this.zw * this.zw + this.xw * this.xw;
    }
    norm1() {
        return Math.abs(this.xy) + Math.abs(this.xz) + Math.abs(this.xw) + Math.abs(this.yz) + Math.abs(this.yw) + Math.abs(this.zw);
    }
    wedge(biv) {
        return this.xy * biv.zw - this.xz * biv.yw + this.xw * biv.yz + this.yz * biv.xw - this.yw * biv.xz + this.zw * biv.xy;
    }
    dual() {
        return new Bivec(this.zw, -this.yw, this.yz, this.xw, -this.xz, this.xy);
    }
    duals() {
        var temp;
        temp = this.xy;
        this.xy = this.zw;
        this.zw = temp;
        temp = this.xz;
        this.xz = -this.yw;
        this.yw = -temp;
        temp = this.xw;
        this.xw = this.yz;
        this.yz = temp;
        return this;
    }
    wedgev(V) {
        return new Vec4(-this.yz * V.w - this.zw * V.y + this.yw * V.z, this.xz * V.w + this.zw * V.x - this.xw * V.z, -this.xy * V.w - this.yw * V.x + this.xw * V.y, this.xy * V.z + this.yz * V.x - this.xz * V.y);
    }
    wedgevvset(v1, v2) {
        return this.set(v1.x * v2.y - v1.y * v2.x, v1.x * v2.z - v1.z * v2.x, v1.x * v2.w - v1.w * v2.x, v1.y * v2.z - v1.z * v2.y, v1.y * v2.w - v1.w * v2.y, v1.z * v2.w - v1.w * v2.z);
    }
    /** Vector part of Geometry Product
     * exy * ey = ex, exy * ex = -ey, exy * ez = 0
     *  */
    dotv(V) {
        return new Vec4(this.xy * V.y + this.xz * V.z + this.xw * V.w, -this.xy * V.x + this.yz * V.z + this.yw * V.w, -this.xz * V.x - this.yz * V.y + this.zw * V.w, -this.xw * V.x - this.yw * V.y - this.zw * V.z);
    }
    cross(V) {
        return new Bivec(V.xz * this.yz - this.xz * V.yz + V.xw * this.yw - this.xw * V.yw, -V.xy * this.yz + this.xy * V.yz + V.xw * this.zw - this.xw * V.zw, -V.xy * this.yw + this.xy * V.yw - V.xz * this.zw + this.xz * V.zw, V.xy * this.xz - this.xy * V.xz + V.yw * this.zw - this.yw * V.zw, V.xy * this.xw - this.xy * V.xw - V.yz * this.zw + this.yz * V.zw, V.xz * this.xw - this.xz * V.xw + V.yz * this.yw - this.yz * V.yw);
    }
    crossset(b1, b2) {
        return this.set(b2.xz * b1.yz - b1.xz * b2.yz + b2.xw * b1.yw - b1.xw * b2.yw, -b2.xy * b1.yz + b1.xy * b2.yz + b2.xw * b1.zw - b1.xw * b2.zw, -b2.xy * b1.yw + b1.xy * b2.yw - b2.xz * b1.zw + b1.xz * b2.zw, b2.xy * b1.xz - b1.xy * b2.xz + b2.yw * b1.zw - b1.yw * b2.zw, b2.xy * b1.xw - b1.xy * b2.xw - b2.yz * b1.zw + b1.yz * b2.zw, b2.xz * b1.xw - b1.xz * b2.xw + b2.yz * b1.yw - b1.yz * b2.yw);
    }
    crossrs(V) {
        return this.set(V.xz * this.yz - this.xz * V.yz + V.xw * this.yw - this.xw * V.yw, -V.xy * this.yz + this.xy * V.yz + V.xw * this.zw - this.xw * V.zw, -V.xy * this.yw + this.xy * V.yw - V.xz * this.zw + this.xz * V.zw, V.xy * this.xz - this.xy * V.xz + V.yw * this.zw - this.yw * V.zw, V.xy * this.xw - this.xy * V.xw - V.yz * this.zw + this.yz * V.zw, V.xz * this.xw - this.xz * V.xw + V.yz * this.yw - this.yz * V.yw);
    }
    exp() {
        // Hodge Dual decompose this to:
        // A : self-dual part (*A = A)
        // B : antiself-dual part (*B = -B)
        // two parts are commutive, corresponded to QL and QR
        // 1. If this is simple rotation of angle theta:
        //   exy*(theta) represents rotate from x to y by angle theta
        //   this can be divided into theta/2 of QL and QR rotation
        //   A and B has norm of theta, so div 2
        //   Quaternion formula: Q(cos, sin * vec3), vec3 is a unit vector
        // 2. if this is right-handed isoclinic rotation of angle theta,
        //   we use (exy + ezw)*(theta) to represent it
        //   it's easy to verify that norm(A) = 2*theta, norm(B) = 0
        //   then the same as simple rotation
        let A = new Vec3(this.xy + this.zw, this.xz - this.yw, this.xw + this.yz);
        let B = new Vec3(this.xy - this.zw, this.xz + this.yw, this.xw - this.yz);
        let a = A.norm();
        let b = B.norm();
        let aa = a * 0.5;
        let bb = b * 0.5;
        let sa = (a > 0.005 ? Math.sin(aa) / a : 0.5 - a * a / 12);
        let sb = (b > 0.005 ? Math.sin(bb) / b : 0.5 - b * b / 12);
        return new Rotor(new Quaternion(Math.cos(aa), sa * A.x, sa * A.y, sa * A.z), new Quaternion(Math.cos(bb), sb * B.x, sb * B.y, sb * B.z));
    }
    /** return two angles [max, min] between a and b
     * "a" and "b" must be normalized simple bivectors*/
    static angle(a, b) {
        let cc = a.dot(b);
        let ss = a.wedge(b);
        let ccpss = cc + ss;
        let ccmss = cc - ss;
        if (Math.abs(ccpss) > 1)
            ccpss = Math.sign(ccpss);
        if (Math.abs(ccmss) > 1)
            ccmss = Math.sign(ccmss);
        let sub = Math.acos(ccpss);
        let add = Math.acos(ccmss);
        return [(add + sub) * 0.5, (add - sub) * 0.5];
    }
    rotate(r) {
        // a novel method to calculate bivec rotation using isoclinic decomposition
        let A = _Q_1.set(0, this.xy + this.zw, this.xz - this.yw, this.xw + this.yz);
        let B = _Q_2.set(0, this.xy - this.zw, this.xz + this.yw, this.xw - this.yz);
        // self-dual bivec is invariant under rotation generated by antiself-dual bivec
        // so we only compute A * r.l and B * r.r
        // rotating with 3 bases in A, B respectly behave like rotation in two 3D spaces respectly
        // so we use 3D quaternion rotation formula
        A.mulsl(r.l).mulsrconj(r.l);
        B.mulslconj(r.r).mulsr(r.r);
        // recover from isoclinic representation
        return new Bivec(A.y + B.y, A.z + B.z, A.w + B.w, A.w - B.w, B.z - A.z, A.y - B.y).mulfs(0.5);
    }
    rotates(r) {
        let A = _Q_1.set(0, this.xy + this.zw, this.xz - this.yw, this.xw + this.yz);
        let B = _Q_2.set(0, this.xy - this.zw, this.xz + this.yw, this.xw - this.yz);
        A.mulsl(r.l).mulsrconj(r.l);
        B.mulslconj(r.r).mulsr(r.r);
        this.xy = (A.y + B.y) * 0.5;
        this.xz = (A.z + B.z) * 0.5;
        this.xw = (A.w + B.w) * 0.5;
        this.yz = (A.w - B.w) * 0.5;
        this.yw = (B.z - A.z) * 0.5;
        this.zw = (A.y - B.y) * 0.5;
        return this;
    }
    rotatesconj(r) {
        let A = _Q_1.set(0, this.xy + this.zw, this.xz - this.yw, this.xw + this.yz);
        let B = _Q_2.set(0, this.xy - this.zw, this.xz + this.yw, this.xw - this.yz);
        A.mulslconj(r.l).mulsr(r.l);
        B.mulsl(r.r).mulsrconj(r.r);
        this.xy = (A.y + B.y) * 0.5;
        this.xz = (A.z + B.z) * 0.5;
        this.xw = (A.w + B.w) * 0.5;
        this.yz = (A.w - B.w) * 0.5;
        this.yw = (B.z - A.z) * 0.5;
        this.zw = (A.y - B.y) * 0.5;
        return this;
    }
    rotateset(bivec, r) {
        let A = _Q_1.set(0, bivec.xy + bivec.zw, bivec.xz - bivec.yw, bivec.xw + bivec.yz);
        let B = _Q_2.set(0, bivec.xy - bivec.zw, bivec.xz + bivec.yw, bivec.xw - bivec.yz);
        A.mulsl(r.l).mulsrconj(r.l);
        B.mulslconj(r.r).mulsr(r.r);
        this.xy = (A.y + B.y) * 0.5;
        this.xz = (A.z + B.z) * 0.5;
        this.xw = (A.w + B.w) * 0.5;
        this.yz = (A.w - B.w) * 0.5;
        this.yw = (B.z - A.z) * 0.5;
        this.zw = (A.y - B.y) * 0.5;
        return this;
    }
    rotateconjset(bivec, r) {
        let A = _Q_1.set(0, bivec.xy + bivec.zw, bivec.xz - bivec.yw, bivec.xw + bivec.yz);
        let B = _Q_2.set(0, bivec.xy - bivec.zw, bivec.xz + bivec.yw, bivec.xw - bivec.yz);
        A.mulslconj(r.l).mulsr(r.l);
        B.mulsl(r.r).mulsrconj(r.r);
        this.xy = (A.y + B.y) * 0.5;
        this.xz = (A.z + B.z) * 0.5;
        this.xw = (A.w + B.w) * 0.5;
        this.yz = (A.w - B.w) * 0.5;
        this.yw = (B.z - A.z) * 0.5;
        this.zw = (A.y - B.y) * 0.5;
        return this;
    }
    /** return a random oriented simple normalized bivector */
    static rand() {
        // sampled in isoclinic space uniformly for left and right part respectively
        let a = _vec3_1.randset().mulfs(0.5);
        let b = _vec3_2.randset().mulfs(0.5);
        return new Bivec(a.x + b.x, a.y + b.y, a.z + b.z, a.z - b.z, b.y - a.y, a.x - b.x);
    }
    randset() {
        // sampled in isoclinic space uniformly for left and right part respectively
        let a = _vec3_1.randset().mulfs(0.5);
        let b = _vec3_2.randset().mulfs(0.5);
        return this.set(a.x + b.x, a.y + b.y, a.z + b.z, a.z - b.z, b.y - a.y, a.x - b.x);
    }
    /** return a random oriented simple normalized bivector by seed */
    static srand(seed) {
        let a = _vec3_1.srandset(seed).mulfs(0.5);
        let b = _vec3_2.srandset(seed).mulfs(0.5);
        return new Bivec(a.x + b.x, a.y + b.y, a.z + b.z, a.z - b.z, b.y - a.y, a.x - b.x);
    }
    srandset(seed) {
        let a = _vec3_1.srandset(seed).mulfs(0.5);
        let b = _vec3_2.srandset(seed).mulfs(0.5);
        return this.set(a.x + b.x, a.y + b.y, a.z + b.z, a.z - b.z, b.y - a.y, a.x - b.x);
    }
    pushPool(pool = bivecPool) {
        pool.push(this);
    }
}
let _bivec = new Bivec();

export { Bivec, BivecPool, _bivec, bivecPool };
//# sourceMappingURL=bivec.js.map
