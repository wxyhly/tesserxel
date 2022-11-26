
import { Complex } from "./cplx";
import { Srand } from "../random";
import {_360} from "../const";
import { Pool } from "../pool";
export class Vec2Pool extends Pool<Vec2>{
    constructObject() { return new Vec2; }
}
export const vec2Pool = new Vec2Pool;
export class Vec2 {
    x: number;
    y: number;
    static readonly x = new Vec2(1, 0);
    static readonly y = new Vec2(0, 1);
    constructor(x: number = 0, y: number = 0) {
        this.x = x; this.y = y;
    }
    flat(): number[] {
        return [this.x, this.y];
    }
    writeBuffer(b: Float32Array, offset: number = 0) {
        b[offset] = this.x;
        b[offset + 1] = this.y;
    }
    set(x: number = 0, y: number = 0): Vec2 {
        this.x = x; this.y = y; return this;
    }
    copy(v: Vec2): Vec2 {
        this.x = v.x; this.y = v.y; return this;
    }
    copyc(v: Complex): Vec2 {
        this.x = v.re; this.y = v.im; return this;
    }
    clone(): Vec2 {
        return new Vec2(this.x, this.y);
    }
    add(v2: Vec2): Vec2 {
        return new Vec2(this.x + v2.x, this.y + v2.y);
    }
    addset(v1: Vec2, v2: Vec2): Vec2 {
        this.x = v1.x + v2.x; this.y = v1.y + v2.y; return this;
    }
    addf(v2: number): Vec2 {
        return new Vec2(this.x + v2, this.y + v2);
    }
    adds(v2: Vec2): Vec2 {
        this.x += v2.x; this.y += v2.y; return this;
    }
    addfs(v2: number): Vec2 {
        this.x += v2; this.y += v2; return this;
    }
    /** this += v * k */
    addmulfs(v: Vec2, k: number) {
        this.x += v.x * k; this.y += v.y * k; return this;
    }
    neg(): Vec2 {
        return new Vec2(-this.x, -this.y);
    }
    negs(): Vec2 {
        this.x = - this.x; this.y = -this.y;
        return this;
    }
    sub(v2: Vec2): Vec2 {
        return new Vec2(this.x - v2.x, this.y - v2.y);
    }
    subset(v1: Vec2, v2: Vec2): Vec2 {
        this.x = v1.x - v2.x; this.y = v1.y - v2.y; return this;
    }
    subf(v2: number): Vec2 {
        return new Vec2(this.x - v2, this.y - v2);
    }
    subs(v2: Vec2): Vec2 {
        this.x -= v2.x; this.y -= v2.y; return this;
    }
    subfs(v2: number): Vec2 {
        this.x -= v2; this.y -= v2; return this;
    }
    mulf(v2: number): Vec2 {
        return new Vec2(this.x * v2, this.y * v2);
    }
    mulfs(v2: number): Vec2 {
        this.x *= v2; this.y *= v2; return this;
    }
    mul(v2: Vec2): Vec2 {
        return new Vec2(this.x * v2.x, this.y * v2.y);
    }
    muls(v2: Vec2): Vec2 {
        this.x *= v2.x; this.y *= v2.y; return this;
    }
    divf(v2: number): Vec2 {
        v2 = 1 / v2;
        return new Vec2(this.x * v2, this.y * v2);
    }
    divfs(v2: number): Vec2 {
        v2 = 1 / v2;
        this.x *= v2; this.y *= v2; return this;
    }
    div(v2: Vec2): Vec2 {
        return new Vec2(this.x / v2.x, this.y / v2.y);
    }
    divs(v2: Vec2): Vec2 {
        this.x /= v2.x; this.y /= v2.y; return this;
    }
    dot(v2: Vec2): number {
        return this.x * v2.x + this.y * v2.y;
    }
    norm(): number {
        return Math.hypot(this.x, this.y);
    }
    norms(): Vec2 {
        let v2 = Math.hypot(this.x, this.y);
        v2 = v2 == 0 ? 0 : (1 / v2);
        this.x *= v2; this.y *= v2; return this;
    }
    normsqr(): number {
        return this.x * this.x + this.y * this.y;
    }
    norm1(): number {
        return Math.abs(this.x) + Math.abs(this.y);
    }
    norminf(): number {
        return Math.max(Math.abs(this.x), Math.abs(this.y));
    }
    normi(i: number): number {
        return Math.pow(Math.pow(this.x, i) + Math.pow(this.y, i), 1 / i);
    }
    wedge(v2: Vec2): number {
        return this.x * v2.y - this.y * v2.x;
    }
    rotate(angle: number): Vec2 {
        let s = Math.sin(angle); let c = Math.cos(angle);
        return new Vec2(
            this.x * c - this.y * s,
            this.x * s + this.y * c,
        )
    }
    rotates(angle: number): Vec2 {
        let s = Math.sin(angle); let c = Math.cos(angle);
        let x = this.x * c - this.y * s;
        this.y = this.x * s + this.y * c;
        this.x = x;
        return this;
    }
    static rand(): Vec2 {
        let a = Math.random() * _360;
        return new Vec2(Math.cos(a), Math.sin(a));
    }
    static srand(seed: Srand): Vec2 {
        let a = seed.nextf() * _360;
        return new Vec2(Math.cos(a), Math.sin(a));
    }
    distanceTo(p: Vec2) {
        return Math.hypot(p.x - this.x, p.y - this.y);
    }
    distanceSqrTo(p: Vec2) {
        let x = p.x - this.x, y = p.y - this.y;
        return x * x + y * y;
    }
    equal(v: Vec2) {
        return this.x === v.x && this.y === v.y;
    }
    pushPool(pool: Vec2Pool = vec2Pool) {
        pool.push(this);
    }
}

export let _vec2 = new Vec2();