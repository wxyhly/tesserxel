import { Vec2 } from "./vec2.js";
import { Vec4 } from "./vec4.js";
import { Quaternion, _Q } from "./quaternion.js";
import { Pool } from "../pool.js";
import { Srand } from "../random.js";
import { _360 } from "../const.js";
export class Vec3Pool extends Pool<Vec3>{
    constructObject() { return new Vec3; }
}
export const vec3Pool = new Vec3Pool;
export class Vec3 {
    x: number;
    y: number;
    z: number;
    static readonly x = new Vec3(1, 0, 0);
    static readonly y = new Vec3(0, 1, 0);
    static readonly z = new Vec3(0, 0, 1);
    constructor(x: number = 0, y: number = 0, z: number = 0) {
        this.x = x; this.y = y; this.z = z;
    }
    flat(): number[] {
        return [this.x, this.y, this.z];
    }
    writeBuffer(b: Float32Array, offset: number = 0) {
        b[offset] = this.x;
        b[offset + 1] = this.y;
        b[offset + 2] = this.z;
    }
    copy(v: Vec3): Vec3 {
        this.x = v.x; this.y = v.y; this.z = v.z;
        return this;
    }
    set(x: number = 0, y: number = 0, z: number = 0): Vec3 {
        this.x = x; this.y = y; this.z = z; return this;
    }
    xy(): Vec2 {
        return new Vec2(this.x, this.y);
    }
    yx(): Vec2 {
        return new Vec2(this.y, this.x);
    }
    xz(): Vec2 {
        return new Vec2(this.x, this.z);
    }
    yz(): Vec2 {
        return new Vec2(this.y, this.z);
    }
    zy(): Vec2 {
        return new Vec2(this.z, this.y);
    }
    yzx(): Vec3 {
        return new Vec3(this.y, this.z, this.x);
    }
    yxz(): Vec3 {
        return new Vec3(this.y, this.x, this.z);
    }
    zyx(): Vec3 {
        return new Vec3(this.z, this.y, this.x);
    }
    zxy(): Vec3 {
        return new Vec3(this.z, this.x, this.y);
    }
    xzy(): Vec3 {
        return new Vec3(this.x, this.z, this.y);
    }
    xyz0(): Vec4 {
        return new Vec4(this.x, this.y, this.z);
    }
    x0yz(): Vec4 {
        return new Vec4(this.x, 0, this.y, this.z);
    }
    clone(): Vec3 {
        return new Vec3(this.x, this.y, this.z);
    }
    add(v2: Vec3): Vec3 {
        return new Vec3(this.x + v2.x, this.y + v2.y, this.z + v2.z);
    }

    addset(v1: Vec3, v2: Vec3): Vec3 {
        this.x = v1.x + v2.x; this.y = v1.y + v2.y; this.z = v1.z + v2.z; return this;
    }
    addf(v2: number): Vec3 {
        return new Vec3(this.x + v2, this.y + v2, this.z + v2);
    }
    adds(v2: Vec3): Vec3 {
        this.x += v2.x; this.y += v2.y; this.z += v2.z; return this;
    }
    addfs(v2: number): Vec3 {
        this.x += v2; this.y += v2; this.z += v2; return this;
    }
    /** this += v * k */
    addmulfs(v: Vec3, k: number) {
        this.x += v.x * k; this.y += v.y * k; this.z += v.z * k; return this;
    }
    neg(): Vec3 {
        return new Vec3(-this.x, -this.y, -this.z);
    }
    negs(): Vec3 {
        this.x = - this.x; this.y = -this.y; this.z = -this.z;
        return this;
    }
    sub(v2: Vec3): Vec3 {
        return new Vec3(this.x - v2.x, this.y - v2.y, this.z - v2.z);
    }

    subset(v1: Vec3, v2: Vec3): Vec3 {
        this.x = v1.x - v2.x; this.y = v1.y - v2.y; this.z = v1.z - v2.z; return this;
    }
    subf(v2: number): Vec3 {
        return new Vec3(this.x - v2, this.y - v2, this.z - v2);
    }
    subs(v2: Vec3): Vec3 {
        this.x -= v2.x; this.y -= v2.y; this.z -= v2.z; return this;
    }
    subfs(v2: number): Vec3 {
        this.x -= v2; this.y -= v2; this.z -= v2; return this;
    }
    mulf(v2: number): Vec3 {
        return new Vec3(this.x * v2, this.y * v2, this.z * v2);
    }
    mulfs(v2: number): Vec3 {
        this.x *= v2; this.y *= v2; this.z *= v2; return this;
    }
    mul(v2: Vec3): Vec3 {
        return new Vec3(this.x * v2.x, this.y * v2.y, this.z * v2.z);
    }
    muls(v2: Vec3): Vec3 {
        this.x *= v2.x; this.y *= v2.y; this.z *= v2.z; return this;
    }
    divf(v2: number): Vec3 {
        v2 = 1 / v2;
        return new Vec3(this.x * v2, this.y * v2, this.z * v2);
    }
    divfs(v2: number): Vec3 {
        v2 = 1 / v2;
        this.x *= v2; this.y *= v2; this.z *= v2; return this;
    }
    div(v2: Vec3): Vec3 {
        return new Vec3(this.x / v2.x, this.y / v2.y, this.z / v2.z);
    }
    divs(v2: Vec3): Vec3 {
        this.x /= v2.x; this.y /= v2.y; this.z /= v2.z; return this;
    }
    dot(v2: Vec3): number {
        return this.x * v2.x + this.y * v2.y + this.z * v2.z;
    }
    norm(): number {
        return Math.hypot(this.x, this.y, this.z);
    }
    norms(): Vec3 {
        let v2 = Math.hypot(this.x, this.y, this.z);
        v2 = v2 == 0 ? 0 : (1 / v2);
        this.x *= v2; this.y *= v2; this.z *= v2; return this;
    }
    normsqr(): number {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }
    norm1(): number {
        return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
    }
    norminf(): number {
        return Math.max(Math.abs(this.x), Math.abs(this.y), Math.abs(this.z));
    }
    normi(i: number): number {
        return Math.pow(
            Math.pow(Math.abs(this.x), i) +
            Math.pow(Math.abs(this.y), i) +
            Math.pow(Math.abs(this.z), i), 1 / i
        );
    }
    wedge(v3: Vec3): Vec3 {
        return new Vec3(
            this.y * v3.z - this.z * v3.y,
            this.z * v3.x - this.x * v3.z,
            this.x * v3.y - this.y * v3.x,
        );
    }
    /** this.set(v1 ^ v2) */
    wedgeset(v1: Vec3, v2: Vec3): Vec3 {
        this.x = v1.y * v2.z - v1.z * v2.y;
        this.y = v1.z * v2.x - v1.x * v2.z;
        this.z = v1.x * v2.y - v1.y * v2.x;
        return this;
    }
    /** this = this ^ v */
    wedgesr(v: Vec3): Vec3 {
        return this.set(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x,
        );
    }
    exp(): Quaternion {
        let g = this.norm() * 0.5;
        let s = Math.abs(g) > 0.005 ? Math.sin(g) / g * 0.5 : 0.5 - g * g / 12;
        return new Quaternion(Math.cos(g), s * this.x, s * this.y, s * this.z);
    }
    rotate(q: Quaternion): Vec3 {
        return _Q.set(0, this.x, this.y, this.z).mulsl(q).mulsr(q.conj()).yzw();
    }
    rotates(q: Quaternion): Vec3 {
        let q2 = _Q.set(0, this.x, this.y, this.z).mulsl(q).mulsr(q.conj());
        this.x = q2.y; this.y = q2.z; this.z = q2.w; return this;
    }
    randset(): Vec3 {
        let a = Math.random() * _360;
        let c = Math.random() * 2.0 - 1.0;
        let b = Math.sqrt(1.0 - c * c);
        return this.set(b * Math.cos(a), b * Math.sin(a), c);
    }
    srandset(seed: Srand): Vec3 {
        let a = seed.nextf() * _360;
        let c = seed.nextf() * 2.0 - 1.0;
        let b = Math.sqrt(1.0 - c * c);
        return this.set(b * Math.cos(a), b * Math.sin(a), c);
    }
    static rand(): Vec3 {
        let a = Math.random() * _360;
        let c = Math.random() * 2.0 - 1.0;
        let b = Math.sqrt(1.0 - c * c);
        return new Vec3(b * Math.cos(a), b * Math.sin(a), c);
    }
    static srand(seed: Srand): Vec3 {
        let a = seed.nextf() * _360;
        let c = seed.nextf() * 2.0 - 1.0;
        let b = Math.sqrt(1.0 - c * c);
        return new Vec3(b * Math.cos(a), b * Math.sin(a), c);
    }

    distanceTo(p: Vec3) {
        return Math.hypot(p.x - this.x, p.y - this.y, p.z - this.z);
    }
    distanceSqrTo(p: Vec3) {
        let x = p.x - this.x, y = p.y - this.y, z = p.z - this.z;
        return x * x + y * y + z * z;
    }
    reflect(normal: Vec3): Vec3 {
        return this.sub(normal.mulf(this.dot(normal) * 2));
    }
    reflects(normal: Vec3): Vec3 {
        return this.subs(normal.mulf(this.dot(normal) * 2));
    }
    equal(v: Vec3) {
        return this.x === v.x && this.y === v.y && this.z === v.z;
    }

    pushPool(pool: Vec3Pool = vec3Pool) {
        pool.push(this);
    }
}

export let _vec3 = new Vec3();
export let _vec3_1 = new Vec3();
export let _vec3_2 = new Vec3();
export let _vec3_3 = new Vec3();
export let _vec3_4 = new Vec3();
export let _vec3_5 = new Vec3();