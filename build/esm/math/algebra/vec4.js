import { Vec3 } from './vec3.js';
import { _Q } from './quaternion.js';
import { Pool } from '../pool.js';
import { _360 } from '../const.js';
import { Bivec } from './bivec.js';

class Vec4Pool extends Pool {
    constructObject() { return new Vec4; }
}
const vec4Pool = new Vec4Pool;
class Vec4 {
    x;
    y;
    z;
    w;
    static x = new Vec4(1, 0, 0, 0);
    static y = new Vec4(0, 1, 0, 0);
    static z = new Vec4(0, 0, 1, 0);
    static w = new Vec4(0, 0, 0, 1);
    static origin = new Vec4(0, 0, 0, 0);
    static xNeg = new Vec4(-1, 0, 0, 0);
    static yNeg = new Vec4(0, -1, 0, 0);
    static zNeg = new Vec4(0, 0, -1, 0);
    static wNeg = new Vec4(0, 0, 0, -1);
    constructor(x = 0, y = 0, z = 0, w = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
    flat() {
        return [this.x, this.y, this.z, this.w];
    }
    writeBuffer(b, offset = 0) {
        b[offset] = this.x;
        b[offset + 1] = this.y;
        b[offset + 2] = this.z;
        b[offset + 3] = this.w;
    }
    copy(v) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        this.w = v.w;
        return this;
    }
    set(x = 0, y = 0, z = 0, w = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
        return this;
    }
    ywx() { return new Vec3(this.y, this.w, this.x); }
    yxw() { return new Vec3(this.y, this.x, this.w); }
    yzw() { return new Vec3(this.y, this.z, this.w); }
    ywz() { return new Vec3(this.y, this.w, this.z); }
    yzx() { return new Vec3(this.y, this.z, this.x); }
    yxz() { return new Vec3(this.y, this.x, this.z); }
    zwx() { return new Vec3(this.z, this.w, this.x); }
    zxw() { return new Vec3(this.z, this.x, this.w); }
    zyw() { return new Vec3(this.z, this.y, this.w); }
    zwy() { return new Vec3(this.z, this.w, this.y); }
    zyx() { return new Vec3(this.z, this.y, this.x); }
    zxy() { return new Vec3(this.z, this.x, this.y); }
    xzy() { return new Vec3(this.x, this.z, this.y); }
    xyz() { return new Vec3(this.x, this.y, this.z); }
    xwy() { return new Vec3(this.x, this.w, this.y); }
    xyw() { return new Vec3(this.x, this.y, this.w); }
    xzw() { return new Vec3(this.x, this.z, this.w); }
    xwz() { return new Vec3(this.x, this.w, this.z); }
    wxy() { return new Vec3(this.w, this.x, this.y); }
    wyx() { return new Vec3(this.w, this.y, this.x); }
    wzy() { return new Vec3(this.w, this.z, this.y); }
    wyz() { return new Vec3(this.w, this.y, this.z); }
    wxz() { return new Vec3(this.w, this.x, this.z); }
    wzx() { return new Vec3(this.w, this.z, this.x); }
    wxyz() { return new Vec4(this.w, this.x, this.y, this.z); }
    wxzy() { return new Vec4(this.w, this.x, this.z, this.y); }
    wyxz() { return new Vec4(this.w, this.y, this.x, this.z); }
    wzxy() { return new Vec4(this.w, this.z, this.x, this.y); }
    yxzw() { return new Vec4(this.y, this.x, this.z, this.w); }
    xzwy() { return new Vec4(this.x, this.z, this.w, this.y); }
    isFinite() {
        return isFinite(this.x) && isFinite(this.y) && isFinite(this.z) && isFinite(this.w);
    }
    clone() {
        return new Vec4(this.x, this.y, this.z, this.w);
    }
    add(v2) {
        return new Vec4(this.x + v2.x, this.y + v2.y, this.z + v2.z, this.w + v2.w);
    }
    addset(v1, v2) {
        this.x = v1.x + v2.x;
        this.y = v1.y + v2.y;
        this.z = v1.z + v2.z;
        this.w = v1.w + v2.w;
        return this;
    }
    addf(v2) {
        return new Vec4(this.x + v2, this.y + v2, this.z + v2, this.w + v2);
    }
    adds(v2) {
        this.x += v2.x;
        this.y += v2.y;
        this.z += v2.z;
        this.w += v2.w;
        return this;
    }
    addfs(v2) {
        this.x += v2;
        this.y += v2;
        this.z += v2;
        this.w += v2;
        return this;
    }
    neg() {
        return new Vec4(-this.x, -this.y, -this.z, -this.w);
    }
    negs() {
        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;
        this.w = -this.w;
        return this;
    }
    sub(v2) {
        return new Vec4(this.x - v2.x, this.y - v2.y, this.z - v2.z, this.w - v2.w);
    }
    subset(v1, v2) {
        this.x = v1.x - v2.x;
        this.y = v1.y - v2.y;
        this.z = v1.z - v2.z;
        this.w = v1.w - v2.w;
        return this;
    }
    subf(v2) {
        return new Vec4(this.x - v2, this.y - v2, this.z - v2, this.w - v2);
    }
    subs(v2) {
        this.x -= v2.x;
        this.y -= v2.y;
        this.z -= v2.z;
        this.w -= v2.w;
        return this;
    }
    subfs(v2) {
        this.x -= v2;
        this.y -= v2;
        this.z -= v2;
        this.w -= v2;
        return this;
    }
    mulf(v2) {
        return new Vec4(this.x * v2, this.y * v2, this.z * v2, this.w * v2);
    }
    mulfs(v2) {
        this.x *= v2;
        this.y *= v2;
        this.z *= v2;
        this.w *= v2;
        return this;
    }
    mulmatvset(mat4, v) {
        let a = mat4.elem;
        return this.set(v.x * a[0] + v.y * a[1] + v.z * a[2] + v.w * a[3], v.x * a[4] + v.y * a[5] + v.z * a[6] + v.w * a[7], v.x * a[8] + v.y * a[9] + v.z * a[10] + v.w * a[11], v.x * a[12] + v.y * a[13] + v.z * a[14] + v.w * a[15]);
    }
    /** this += v * k */
    addmulfs(v, k) {
        this.x += v.x * k;
        this.y += v.y * k;
        this.z += v.z * k;
        this.w += v.w * k;
        return this;
    }
    mul(v2) {
        return new Vec4(this.x * v2.x, this.y * v2.y, this.z * v2.z, this.w * v2.w);
    }
    muls(v2) {
        this.x *= v2.x;
        this.y *= v2.y;
        this.z *= v2.z;
        this.w *= v2.w;
        return this;
    }
    divf(v2) {
        v2 = 1 / v2;
        return new Vec4(this.x * v2, this.y * v2, this.z * v2, this.w * v2);
    }
    divfs(v2) {
        v2 = 1 / v2;
        this.x *= v2;
        this.y *= v2;
        this.z *= v2;
        this.w *= v2;
        return this;
    }
    div(v2) {
        return new Vec4(this.x / v2.x, this.y / v2.y, this.z / v2.z, this.w / v2.w);
    }
    divs(v2) {
        this.x /= v2.x;
        this.y /= v2.y;
        this.z /= v2.z;
        this.w /= v2.w;
        return this;
    }
    dot(v2) {
        return this.x * v2.x + this.y * v2.y + this.z * v2.z + this.w * v2.w;
    }
    norm() {
        return Math.hypot(this.x, this.y, this.z, this.w);
    }
    norms() {
        let v2 = Math.hypot(this.x, this.y, this.z, this.w);
        v2 = v2 == 0 ? 0 : (1 / v2);
        this.x *= v2;
        this.y *= v2;
        this.z *= v2;
        this.w *= v2;
        return this;
    }
    normsqr() {
        return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
    }
    norm1() {
        return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w);
    }
    norminf() {
        return Math.max(Math.abs(this.x), Math.abs(this.y), Math.abs(this.z), Math.abs(this.w));
    }
    normi(i) {
        return Math.pow(Math.pow(Math.abs(this.x), i) +
            Math.pow(Math.abs(this.y), i) +
            Math.pow(Math.abs(this.z), i) +
            Math.pow(Math.abs(this.w), i), 1 / i);
    }
    wedge(V) {
        return new Bivec(this.x * V.y - this.y * V.x, this.x * V.z - this.z * V.x, this.x * V.w - this.w * V.x, this.y * V.z - this.z * V.y, this.y * V.w - this.w * V.y, this.z * V.w - this.w * V.z);
    }
    wedgevbset(v, bivec) {
        return this.set(-bivec.yz * v.w - bivec.zw * v.y + bivec.yw * v.z, bivec.xz * v.w + bivec.zw * v.x - bivec.xw * v.z, -bivec.xy * v.w - bivec.yw * v.x + bivec.xw * v.y, bivec.xy * v.z + bivec.yz * v.x - bivec.xz * v.y);
    }
    wedgeb(bivec) {
        return bivec.wedgev(this);
    }
    /** Vector part of Geometry Product
     * ey * exy = -ex, ex * exy = ey, ex * eyz = 0
     *  */
    dotb(B) {
        return new Vec4(-B.xy * this.y - B.xz * this.z - B.xw * this.w, B.xy * this.x - B.yz * this.z - B.yw * this.w, B.xz * this.x + B.yz * this.y - B.zw * this.w, B.xw * this.x + B.yw * this.y + B.zw * this.z);
    }
    /** this = this * b;
     *  Vector part of Geometry Product
     *  ey * exy = -ex, ex * exy = ey, ex * eyz = 0
     *  */
    dotbsr(B) {
        return this.set(-B.xy * this.y - B.xz * this.z - B.xw * this.w, B.xy * this.x - B.yz * this.z - B.yw * this.w, B.xz * this.x + B.yz * this.y - B.zw * this.w, B.xw * this.x + B.yw * this.y + B.zw * this.z);
    }
    dotbset(v, B) {
        return this.set(-B.xy * v.y - B.xz * v.z - B.xw * v.w, B.xy * v.x - B.yz * v.z - B.yw * v.w, B.xz * v.x + B.yz * v.y - B.zw * v.w, B.xw * v.x + B.yw * v.y + B.zw * v.z);
    }
    /** this = mat * this */
    mulmatls(mat4) {
        let a = mat4.elem;
        return this.set(this.x * a[0] + this.y * a[1] + this.z * a[2] + this.w * a[3], this.x * a[4] + this.y * a[5] + this.z * a[6] + this.w * a[7], this.x * a[8] + this.y * a[9] + this.z * a[10] + this.w * a[11], this.x * a[12] + this.y * a[13] + this.z * a[14] + this.w * a[15]);
    }
    applyObj4(o) {
        if (o.scale) {
            this.x *= o.scale.x;
            this.y *= o.scale.y;
            this.z *= o.scale.z;
            this.w *= o.scale.w;
        }
        this.rotates(o.rotation).adds(o.position);
        return this;
    }
    applyObj4inv(o) {
        this.subs(o.position).rotatesconj(o.rotation);
        if (o.scale) {
            this.x /= o.scale.x;
            this.y /= o.scale.y;
            this.z /= o.scale.z;
            this.w /= o.scale.w;
        }
        return this;
    }
    rotate(r) {
        return _Q.copy(this).mulsl(r.l).mulsr(r.r).xyzw();
    }
    rotates(r) {
        this.copy(_Q.copy(this).mulsl(r.l).mulsr(r.r));
        return this;
    }
    rotateconj(r) {
        return _Q.copy(this).mulslconj(r.l).mulsrconj(r.r).xyzw();
    }
    rotatesconj(r) {
        this.copy(_Q.copy(this).mulslconj(r.l).mulsrconj(r.r));
        return this;
    }
    reflect(normal) {
        return this.sub(normal.mulf(this.dot(normal) * 2));
    }
    reflects(normal) {
        let k = this.dot(normal) * 2;
        this.x -= normal.x * k;
        this.y -= normal.y * k;
        this.z -= normal.z * k;
        this.w -= normal.w * k;
        return this;
    }
    distanceTo(p) {
        return Math.hypot(p.x - this.x, p.y - this.y, p.z - this.z, p.w - this.w);
    }
    distanceSqrTo(p) {
        let x = p.x - this.x, y = p.y - this.y, z = p.z - this.z, w = p.w - this.w;
        return x * x + y * y + z * z + w * w;
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
    /** project vector on a plane determined by bivector.
     * bivector b must be normalized and simple
     */
    projb(b) {
        return this.dotb(b).dotbsr(b).negs();
    }
    projbs(b) {
        return this.dotbsr(b).dotbsr(b).negs();
    }
    static rand() {
        let a = Math.random() * _360;
        let b = Math.random() * _360;
        let c = Math.random();
        let sc = Math.sqrt(c);
        let cc = Math.sqrt(1 - c);
        return new Vec4(sc * Math.cos(a), sc * Math.sin(a), cc * Math.cos(b), cc * Math.sin(b));
    }
    static srand(seed) {
        let a = seed.nextf() * _360;
        let b = seed.nextf() * _360;
        let c = seed.nextf();
        let sc = Math.sqrt(c);
        let cc = Math.sqrt(1 - c);
        return new Vec4(sc * Math.cos(a), sc * Math.sin(a), cc * Math.cos(b), cc * Math.sin(b));
    }
    equal(v) {
        return this.x === v.x && this.y === v.y && this.z === v.z && this.w === v.w;
    }
    pushPool(pool = vec4Pool) {
        pool.push(this);
    }
}
let _vec4 = new Vec4();
let _vec4_1 = new Vec4();

export { Vec4, Vec4Pool, _vec4, _vec4_1, vec4Pool };
//# sourceMappingURL=vec4.js.map
