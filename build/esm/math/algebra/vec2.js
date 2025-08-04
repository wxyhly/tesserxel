import { _360 } from '../const.js';
import { Pool } from '../pool.js';

class Vec2Pool extends Pool {
    constructObject() { return new Vec2; }
}
const vec2Pool = new Vec2Pool;
class Vec2 {
    x;
    y;
    static x = new Vec2(1, 0);
    static y = new Vec2(0, 1);
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    flat() {
        return [this.x, this.y];
    }
    writeBuffer(b, offset = 0) {
        b[offset] = this.x;
        b[offset + 1] = this.y;
    }
    set(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        return this;
    }
    copy(v) {
        this.x = v.x;
        this.y = v.y;
        return this;
    }
    copyc(v) {
        this.x = v.re;
        this.y = v.im;
        return this;
    }
    clone() {
        return new Vec2(this.x, this.y);
    }
    add(v2) {
        return new Vec2(this.x + v2.x, this.y + v2.y);
    }
    addset(v1, v2) {
        this.x = v1.x + v2.x;
        this.y = v1.y + v2.y;
        return this;
    }
    addf(v2) {
        return new Vec2(this.x + v2, this.y + v2);
    }
    adds(v2) {
        this.x += v2.x;
        this.y += v2.y;
        return this;
    }
    addfs(v2) {
        this.x += v2;
        this.y += v2;
        return this;
    }
    /** this += v * k */
    addmulfs(v, k) {
        this.x += v.x * k;
        this.y += v.y * k;
        return this;
    }
    neg() {
        return new Vec2(-this.x, -this.y);
    }
    negs() {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    }
    sub(v2) {
        return new Vec2(this.x - v2.x, this.y - v2.y);
    }
    subset(v1, v2) {
        this.x = v1.x - v2.x;
        this.y = v1.y - v2.y;
        return this;
    }
    subf(v2) {
        return new Vec2(this.x - v2, this.y - v2);
    }
    subs(v2) {
        this.x -= v2.x;
        this.y -= v2.y;
        return this;
    }
    subfs(v2) {
        this.x -= v2;
        this.y -= v2;
        return this;
    }
    mulf(v2) {
        return new Vec2(this.x * v2, this.y * v2);
    }
    mulfs(v2) {
        this.x *= v2;
        this.y *= v2;
        return this;
    }
    mul(v2) {
        return new Vec2(this.x * v2.x, this.y * v2.y);
    }
    muls(v2) {
        this.x *= v2.x;
        this.y *= v2.y;
        return this;
    }
    divf(v2) {
        v2 = 1 / v2;
        return new Vec2(this.x * v2, this.y * v2);
    }
    divfs(v2) {
        v2 = 1 / v2;
        this.x *= v2;
        this.y *= v2;
        return this;
    }
    div(v2) {
        return new Vec2(this.x / v2.x, this.y / v2.y);
    }
    divs(v2) {
        this.x /= v2.x;
        this.y /= v2.y;
        return this;
    }
    dot(v2) {
        return this.x * v2.x + this.y * v2.y;
    }
    norm() {
        return Math.hypot(this.x, this.y);
    }
    norms() {
        let v2 = Math.hypot(this.x, this.y);
        v2 = v2 == 0 ? 0 : (1 / v2);
        this.x *= v2;
        this.y *= v2;
        return this;
    }
    normsqr() {
        return this.x * this.x + this.y * this.y;
    }
    norm1() {
        return Math.abs(this.x) + Math.abs(this.y);
    }
    norminf() {
        return Math.max(Math.abs(this.x), Math.abs(this.y));
    }
    normi(i) {
        return Math.pow(Math.pow(this.x, i) + Math.pow(this.y, i), 1 / i);
    }
    wedge(v2) {
        return this.x * v2.y - this.y * v2.x;
    }
    rotate(angle) {
        let s = Math.sin(angle);
        let c = Math.cos(angle);
        return new Vec2(this.x * c - this.y * s, this.x * s + this.y * c);
    }
    rotates(angle) {
        let s = Math.sin(angle);
        let c = Math.cos(angle);
        let x = this.x * c - this.y * s;
        this.y = this.x * s + this.y * c;
        this.x = x;
        return this;
    }
    static rand() {
        let a = Math.random() * _360;
        return new Vec2(Math.cos(a), Math.sin(a));
    }
    static srand(seed) {
        let a = seed.nextf() * _360;
        return new Vec2(Math.cos(a), Math.sin(a));
    }
    distanceTo(p) {
        return Math.hypot(p.x - this.x, p.y - this.y);
    }
    distanceSqrTo(p) {
        let x = p.x - this.x, y = p.y - this.y;
        return x * x + y * y;
    }
    equal(v) {
        return this.x === v.x && this.y === v.y;
    }
    pushPool(pool = vec2Pool) {
        pool.push(this);
    }
}
let _vec2 = new Vec2();

export { Vec2, Vec2Pool, _vec2, vec2Pool };
//# sourceMappingURL=vec2.js.map
