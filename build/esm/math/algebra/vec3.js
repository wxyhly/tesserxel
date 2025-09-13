import { Vec2 } from './vec2.js';
import { Vec4 } from './vec4.js';
import { Quaternion, _Q } from './quaternion.js';
import { Pool } from '../pool.js';
import { _360 } from '../const.js';

class Vec3Pool extends Pool {
    constructObject() { return new Vec3; }
}
const vec3Pool = new Vec3Pool;
class Vec3 {
    x;
    y;
    z;
    static x = Object.freeze(new Vec3(1, 0, 0));
    static y = Object.freeze(new Vec3(0, 1, 0));
    static z = Object.freeze(new Vec3(0, 0, 1));
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    flat() {
        return [this.x, this.y, this.z];
    }
    writeBuffer(b, offset = 0) {
        b[offset] = this.x;
        b[offset + 1] = this.y;
        b[offset + 2] = this.z;
    }
    copy(v) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
    }
    set(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }
    xy() {
        return new Vec2(this.x, this.y);
    }
    yx() {
        return new Vec2(this.y, this.x);
    }
    xz() {
        return new Vec2(this.x, this.z);
    }
    yz() {
        return new Vec2(this.y, this.z);
    }
    zy() {
        return new Vec2(this.z, this.y);
    }
    yzx() {
        return new Vec3(this.y, this.z, this.x);
    }
    yxz() {
        return new Vec3(this.y, this.x, this.z);
    }
    zyx() {
        return new Vec3(this.z, this.y, this.x);
    }
    zxy() {
        return new Vec3(this.z, this.x, this.y);
    }
    xzy() {
        return new Vec3(this.x, this.z, this.y);
    }
    xyz0() {
        return new Vec4(this.x, this.y, this.z);
    }
    x0yz() {
        return new Vec4(this.x, 0, this.y, this.z);
    }
    clone() {
        return new Vec3(this.x, this.y, this.z);
    }
    add(v2) {
        return new Vec3(this.x + v2.x, this.y + v2.y, this.z + v2.z);
    }
    addset(v1, v2) {
        this.x = v1.x + v2.x;
        this.y = v1.y + v2.y;
        this.z = v1.z + v2.z;
        return this;
    }
    addf(v2) {
        return new Vec3(this.x + v2, this.y + v2, this.z + v2);
    }
    adds(v2) {
        this.x += v2.x;
        this.y += v2.y;
        this.z += v2.z;
        return this;
    }
    addfs(v2) {
        this.x += v2;
        this.y += v2;
        this.z += v2;
        return this;
    }
    /** this += v * k */
    addmulfs(v, k) {
        this.x += v.x * k;
        this.y += v.y * k;
        this.z += v.z * k;
        return this;
    }
    neg() {
        return new Vec3(-this.x, -this.y, -this.z);
    }
    negs() {
        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;
        return this;
    }
    sub(v2) {
        return new Vec3(this.x - v2.x, this.y - v2.y, this.z - v2.z);
    }
    subset(v1, v2) {
        this.x = v1.x - v2.x;
        this.y = v1.y - v2.y;
        this.z = v1.z - v2.z;
        return this;
    }
    subf(v2) {
        return new Vec3(this.x - v2, this.y - v2, this.z - v2);
    }
    subs(v2) {
        this.x -= v2.x;
        this.y -= v2.y;
        this.z -= v2.z;
        return this;
    }
    subfs(v2) {
        this.x -= v2;
        this.y -= v2;
        this.z -= v2;
        return this;
    }
    mulf(v2) {
        return new Vec3(this.x * v2, this.y * v2, this.z * v2);
    }
    mulfs(v2) {
        this.x *= v2;
        this.y *= v2;
        this.z *= v2;
        return this;
    }
    mul(v2) {
        return new Vec3(this.x * v2.x, this.y * v2.y, this.z * v2.z);
    }
    muls(v2) {
        this.x *= v2.x;
        this.y *= v2.y;
        this.z *= v2.z;
        return this;
    }
    divf(v2) {
        v2 = 1 / v2;
        return new Vec3(this.x * v2, this.y * v2, this.z * v2);
    }
    divfs(v2) {
        v2 = 1 / v2;
        this.x *= v2;
        this.y *= v2;
        this.z *= v2;
        return this;
    }
    div(v2) {
        return new Vec3(this.x / v2.x, this.y / v2.y, this.z / v2.z);
    }
    divs(v2) {
        this.x /= v2.x;
        this.y /= v2.y;
        this.z /= v2.z;
        return this;
    }
    dot(v2) {
        return this.x * v2.x + this.y * v2.y + this.z * v2.z;
    }
    norm() {
        return Math.hypot(this.x, this.y, this.z);
    }
    norms() {
        let v2 = Math.hypot(this.x, this.y, this.z);
        v2 = v2 == 0 ? 0 : (1 / v2);
        this.x *= v2;
        this.y *= v2;
        this.z *= v2;
        return this;
    }
    normsqr() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }
    norm1() {
        return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
    }
    norminf() {
        return Math.max(Math.abs(this.x), Math.abs(this.y), Math.abs(this.z));
    }
    normi(i) {
        return Math.pow(Math.pow(Math.abs(this.x), i) +
            Math.pow(Math.abs(this.y), i) +
            Math.pow(Math.abs(this.z), i), 1 / i);
    }
    wedge(v3) {
        return new Vec3(this.y * v3.z - this.z * v3.y, this.z * v3.x - this.x * v3.z, this.x * v3.y - this.y * v3.x);
    }
    /** this.set(v1 ^ v2) */
    wedgeset(v1, v2) {
        this.x = v1.y * v2.z - v1.z * v2.y;
        this.y = v1.z * v2.x - v1.x * v2.z;
        this.z = v1.x * v2.y - v1.y * v2.x;
        return this;
    }
    /** this = this ^ v */
    wedgesr(v) {
        return this.set(this.y * v.z - this.z * v.y, this.z * v.x - this.x * v.z, this.x * v.y - this.y * v.x);
    }
    exp() {
        let g = this.norm() * 0.5;
        let s = Math.abs(g) > 0.005 ? Math.sin(g) / g * 0.5 : 0.5 - g * g / 12;
        return new Quaternion(Math.cos(g), s * this.x, s * this.y, s * this.z);
    }
    rotate(q) {
        return _Q.set(0, this.x, this.y, this.z).mulsl(q).mulsr(q.conj()).yzw();
    }
    rotates(q) {
        let q2 = _Q.set(0, this.x, this.y, this.z).mulsl(q).mulsr(q.conj());
        this.x = q2.y;
        this.y = q2.z;
        this.z = q2.w;
        return this;
    }
    randset() {
        let a = Math.random() * _360;
        let c = Math.random() * 2.0 - 1.0;
        let b = Math.sqrt(1.0 - c * c);
        return this.set(b * Math.cos(a), b * Math.sin(a), c);
    }
    srandset(seed) {
        let a = seed.nextf() * _360;
        let c = seed.nextf() * 2.0 - 1.0;
        let b = Math.sqrt(1.0 - c * c);
        return this.set(b * Math.cos(a), b * Math.sin(a), c);
    }
    static rand() {
        let a = Math.random() * _360;
        let c = Math.random() * 2.0 - 1.0;
        let b = Math.sqrt(1.0 - c * c);
        return new Vec3(b * Math.cos(a), b * Math.sin(a), c);
    }
    static srand(seed) {
        let a = seed.nextf() * _360;
        let c = seed.nextf() * 2.0 - 1.0;
        let b = Math.sqrt(1.0 - c * c);
        return new Vec3(b * Math.cos(a), b * Math.sin(a), c);
    }
    distanceTo(p) {
        return Math.hypot(p.x - this.x, p.y - this.y, p.z - this.z);
    }
    distanceSqrTo(p) {
        let x = p.x - this.x, y = p.y - this.y, z = p.z - this.z;
        return x * x + y * y + z * z;
    }
    reflect(normal) {
        return this.sub(normal.mulf(this.dot(normal) * 2));
    }
    reflects(normal) {
        return this.subs(normal.mulf(this.dot(normal) * 2));
    }
    equal(v) {
        return this.x === v.x && this.y === v.y && this.z === v.z;
    }
    pushPool(pool = vec3Pool) {
        pool.push(this);
    }
}
let _vec3 = new Vec3();
let _vec3_1 = new Vec3();
let _vec3_2 = new Vec3();
let _vec3_3 = new Vec3();
let _vec3_4 = new Vec3();
let _vec3_5 = new Vec3();

export { Vec3, Vec3Pool, _vec3, _vec3_1, _vec3_2, _vec3_3, _vec3_4, _vec3_5, vec3Pool };
//# sourceMappingURL=vec3.js.map
