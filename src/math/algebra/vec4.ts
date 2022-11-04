import { Vec2 } from "./vec2";
import { Vec3 } from "./vec3";
import { Quaternion, _Q } from "./quaternion";
import { Pool } from "../pool";
import { Srand } from "../random";
import { _360 } from "../const";
import { Bivec } from "./bivec";
import { Rotor } from "./rotor";
import { Mat4 } from "./mat4";
export class Vec4Pool extends Pool<Vec4>{
    constructObject() { return new Vec4; }
}
export const vec4Pool = new Vec4Pool;
export class Vec4 {
    x: number;
    y: number;
    z: number;
    w: number;
    static readonly x = new Vec4(1, 0, 0, 0);
    static readonly y = new Vec4(0, 1, 0, 0);
    static readonly z = new Vec4(0, 0, 1, 0);
    static readonly w = new Vec4(0, 0, 0, 1);
    static readonly origin = new Vec4(0, 0, 0, 0);
    static readonly xNeg = new Vec4(-1, 0, 0, 0);
    static readonly yNeg = new Vec4(0, -1, 0, 0);
    static readonly zNeg = new Vec4(0, 0, -1, 0);
    static readonly wNeg = new Vec4(0, 0, 0, -1);
    constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 0) {
        this.x = x; this.y = y; this.z = z; this.w = w;
    }
    flat(): number[] {
        return [this.x, this.y, this.z, this.w];
    }
    writeBuffer(b: Float32Array, offset: number = 0) {
        b[offset] = this.x;
        b[offset + 1] = this.y;
        b[offset + 2] = this.z;
        b[offset + 3] = this.w;
    }
    copy(v: Vec4 | Quaternion): Vec4 {
        this.x = v.x; this.y = v.y;
        this.z = v.z; this.w = v.w;
        return this;
    }
    set(x: number = 0, y: number = 0, z: number = 0, w: number = 0): Vec4 {
        this.x = x; this.y = y; this.z = z; this.w = w; return this;
    }
    ywx(): Vec3 { return new Vec3(this.y, this.w, this.x); }
    yxw(): Vec3 { return new Vec3(this.y, this.x, this.w); }
    yzw(): Vec3 { return new Vec3(this.y, this.z, this.w); }
    ywz(): Vec3 { return new Vec3(this.y, this.w, this.z); }
    yzx(): Vec3 { return new Vec3(this.y, this.z, this.x); }
    yxz(): Vec3 { return new Vec3(this.y, this.x, this.z); }
    zwx(): Vec3 { return new Vec3(this.z, this.w, this.x); }
    zxw(): Vec3 { return new Vec3(this.z, this.x, this.w); }
    zyw(): Vec3 { return new Vec3(this.z, this.y, this.w); }
    zwy(): Vec3 { return new Vec3(this.z, this.w, this.y); }
    zyx(): Vec3 { return new Vec3(this.z, this.y, this.x); }
    zxy(): Vec3 { return new Vec3(this.z, this.x, this.y); }
    xzy(): Vec3 { return new Vec3(this.x, this.z, this.y); }
    xyz(): Vec3 { return new Vec3(this.x, this.y, this.z); }
    xwy(): Vec3 { return new Vec3(this.x, this.w, this.y); }
    xyw(): Vec3 { return new Vec3(this.x, this.y, this.w); }
    xzw(): Vec3 { return new Vec3(this.x, this.z, this.w); }
    xwz(): Vec3 { return new Vec3(this.x, this.w, this.z); }
    wxy(): Vec3 { return new Vec3(this.w, this.x, this.y); }
    wyx(): Vec3 { return new Vec3(this.w, this.y, this.x); }
    wzy(): Vec3 { return new Vec3(this.w, this.z, this.y); }
    wyz(): Vec3 { return new Vec3(this.w, this.y, this.z); }
    wxz(): Vec3 { return new Vec3(this.w, this.x, this.z); }
    wzx(): Vec3 { return new Vec3(this.w, this.z, this.x); }
    wxyz(): Vec4 { return new Vec4(this.w, this.x, this.y, this.z); }
    wxzy(): Vec4 { return new Vec4(this.w, this.x, this.z, this.y); }
    wyxz(): Vec4 { return new Vec4(this.w, this.y, this.x, this.z); }
    wzxy(): Vec4 { return new Vec4(this.w, this.z, this.x, this.y); }
    yxzw(): Vec4 { return new Vec4(this.y, this.x, this.z, this.w); }
    xzwy(): Vec4 { return new Vec4(this.x, this.z, this.w, this.y); }


    clone(): Vec4 {
        return new Vec4(this.x, this.y, this.z, this.w);
    }
    add(v2: Vec4): Vec4 {
        return new Vec4(this.x + v2.x, this.y + v2.y, this.z + v2.z, this.w + v2.w);
    }
    addset(v1: Vec4, v2: Vec4): Vec4 {
        this.x = v1.x + v2.x; this.y = v1.y + v2.y; this.z = v1.z + v2.z; this.w = v1.w + v2.w; return this;
    }
    addf(v2: number): Vec4 {
        return new Vec4(this.x + v2, this.y + v2, this.z + v2, this.w + v2);
    }
    adds(v2: Vec4): Vec4 {
        this.x += v2.x; this.y += v2.y; this.z += v2.z; this.w += v2.w; return this;
    }
    addfs(v2: number): Vec4 {
        this.x += v2; this.y += v2; this.z += v2; this.w += v2; return this;
    }
    neg(): Vec4 {
        return new Vec4(-this.x, -this.y, -this.z, -this.w);
    }
    negs(): Vec4 {
        this.x = - this.x; this.y = -this.y; this.z = -this.z; this.w = -this.w;
        return this;
    }
    sub(v2: Vec4): Vec4 {
        return new Vec4(this.x - v2.x, this.y - v2.y, this.z - v2.z, this.w - v2.w);
    }
    subset(v1: Vec4, v2: Vec4): Vec4 {
        this.x = v1.x - v2.x; this.y = v1.y - v2.y; this.z = v1.z - v2.z; this.w = v1.w - v2.w; return this;
    }
    subf(v2: number): Vec4 {
        return new Vec4(this.x - v2, this.y - v2, this.z - v2, this.w - v2);
    }
    subs(v2: Vec4): Vec4 {
        this.x -= v2.x; this.y -= v2.y; this.z -= v2.z; this.w -= v2.w; return this;
    }
    subfs(v2: number): Vec4 {
        this.x -= v2; this.y -= v2; this.z -= v2; this.w -= v2; return this;
    }
    mulf(v2: number): Vec4 {
        return new Vec4(this.x * v2, this.y * v2, this.z * v2, this.w * v2);
    }
    mulfs(v2: number): Vec4 {
        this.x *= v2; this.y *= v2; this.z *= v2; this.w *= v2; return this;
    }
    mulmatvset(mat4: Mat4, v: Vec4): Vec4 {
        let a = mat4.elem;
        return this.set(
            v.x * a[0] + v.y * a[1] + v.z * a[2] + v.w * a[3],
            v.x * a[4] + v.y * a[5] + v.z * a[6] + v.w * a[7],
            v.x * a[8] + v.y * a[9] + v.z * a[10] + v.w * a[11],
            v.x * a[12] + v.y * a[13] + v.z * a[14] + v.w * a[15]
        );
    }
    /** this += v * k */
    addmulfs(v: Vec4, k: number) {
        this.x += v.x * k; this.y += v.y * k; this.z += v.z * k; this.w += v.w * k; return this;
    }
    mul(v2: Vec4): Vec4 {
        return new Vec4(this.x * v2.x, this.y * v2.y, this.z * v2.z, this.w * v2.w);
    }
    muls(v2: Vec4): Vec4 {
        this.x *= v2.x; this.y *= v2.y; this.z *= v2.z; this.w *= v2.w; return this;
    }
    divf(v2: number): Vec4 {
        v2 = 1 / v2;
        return new Vec4(this.x * v2, this.y * v2, this.z * v2, this.w * v2);
    }
    divfs(v2: number): Vec4 {
        v2 = 1 / v2;
        this.x *= v2; this.y *= v2; this.z *= v2; this.w *= v2; return this;
    }
    div(v2: Vec4): Vec4 {
        return new Vec4(this.x / v2.x, this.y / v2.y, this.z / v2.z, this.w / v2.w);
    }
    divs(v2: Vec4): Vec4 {
        this.x /= v2.x; this.y /= v2.y; this.z /= v2.z; this.w /= v2.w; return this;
    }
    dot(v2: Vec4): number {
        return this.x * v2.x + this.y * v2.y + this.z * v2.z + this.w * v2.w;
    }
    norm(): number {
        return Math.hypot(this.x, this.y, this.z, this.w);
    }
    norms(): Vec4 {
        let v2 = Math.hypot(this.x, this.y, this.z, this.w);
        v2 = v2 == 0 ? 0 : (1 / v2);
        this.x *= v2; this.y *= v2; this.z *= v2; this.w *= v2; return this;
    }
    normsqr(): number {
        return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
    }
    norm1(): number {
        return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w);
    }
    norminf(): number {
        return Math.max(Math.abs(this.x), Math.abs(this.y), Math.abs(this.z), Math.abs(this.z));
    }
    normi(i: number): number {
        return Math.pow(
            Math.pow(Math.abs(this.x), i) +
            Math.pow(Math.abs(this.y), i) +
            Math.pow(Math.abs(this.z), i) +
            Math.pow(Math.abs(this.w), i), 1 / i
        );
    }
    wedge(V: Vec4): Bivec {
        return new Bivec(
            this.x * V.y - this.y * V.x,
            this.x * V.z - this.z * V.x,
            this.x * V.w - this.w * V.x,
            this.y * V.z - this.z * V.y,
            this.y * V.w - this.w * V.y,
            this.z * V.w - this.w * V.z
        );
    }
    wedgevbset(v: Vec4, bivec: Bivec): Vec4 {
        return this.set(
            -bivec.yz * v.w - bivec.zw * v.y + bivec.yw * v.z,
            bivec.xz * v.w + bivec.zw * v.x - bivec.xw * v.z,
            -bivec.xy * v.w - bivec.yw * v.x + bivec.xw * v.y,
            bivec.xy * v.z + bivec.yz * v.x - bivec.xz * v.y
        );
    }
    wedgeb(bivec: Bivec): Vec4 {
        return bivec.wedgev(this);
    }
    /** Vector part of Geometry Product
     * ey * exy = -ex, ex * exy = ey, ex * eyz = 0
     *  */
    dotb(B: Bivec): Vec4 {
        return new Vec4(
            -B.xy * this.y - B.xz * this.z - B.xw * this.w,
            B.xy * this.x - B.yz * this.z - B.yw * this.w,
            B.xz * this.x + B.yz * this.y - B.zw * this.w,
            B.xw * this.x + B.yw * this.y + B.zw * this.z
        );
    }
    /** this = this * b;
     *  Vector part of Geometry Product 
     *  ey * exy = -ex, ex * exy = ey, ex * eyz = 0
     *  */
    dotbsr(B: Bivec): Vec4 {
        return this.set(
            -B.xy * this.y - B.xz * this.z - B.xw * this.w,
            B.xy * this.x - B.yz * this.z - B.yw * this.w,
            B.xz * this.x + B.yz * this.y - B.zw * this.w,
            B.xw * this.x + B.yw * this.y + B.zw * this.z
        );
    }
    dotbset(v: Vec4, B: Bivec): Vec4 {
        return this.set(
            -B.xy * v.y - B.xz * v.z - B.xw * v.w,
            B.xy * v.x - B.yz * v.z - B.yw * v.w,
            B.xz * v.x + B.yz * v.y - B.zw * v.w,
            B.xw * v.x + B.yw * v.y + B.zw * v.z
        );
    }
    /** this = mat * this */
    mulmatls(mat4: Mat4): Vec4 {
        let a = mat4.elem;
        return this.set(
            this.x * a[0] + this.y * a[1] + this.z * a[2] + this.w * a[3],
            this.x * a[4] + this.y * a[5] + this.z * a[6] + this.w * a[7],
            this.x * a[8] + this.y * a[9] + this.z * a[10] + this.w * a[11],
            this.x * a[12] + this.y * a[13] + this.z * a[14] + this.w * a[15]
        );
    }
    rotate(r: Rotor): Vec4 {
        return _Q.copy(this).mulsl(r.l).mulsr(r.r).xyzw();
    }
    rotates(r: Rotor): Vec4 {
        this.copy(_Q.copy(this).mulsl(r.l).mulsr(r.r));
        return this;
    }
    rotateconj(r: Rotor): Vec4 {
        return _Q.copy(this).mulslconj(r.l).mulsrconj(r.r).xyzw();
    }
    rotatesconj(r: Rotor): Vec4 {
        this.copy(_Q.copy(this).mulslconj(r.l).mulsrconj(r.r));
        return this;
    }
    reflect(normal: Vec4): Vec4 {
        return this.sub(normal.mulf(this.dot(normal) * 2));
    }
    reflects(normal: Vec4): Vec4 {
        let k = this.dot(normal) * 2;
        this.x -= normal.x * k;
        this.y -= normal.y * k;
        this.z -= normal.z * k;
        this.w -= normal.w * k;
        return this;
    }
    distanceTo(p: Vec4) {
        return Math.hypot(p.x - this.x, p.y - this.y, p.z - this.z, p.w - this.w);
    }
    distanceSqrTo(p: Vec4) {
        let x = p.x - this.x, y = p.y - this.y, z = p.z - this.z, w = p.w - this.w;
        return x * x + y * y + z * z + w * w;
    }
    randset(): Vec4 {
        let a = Math.random() * _360;
        let b = Math.random() * _360;
        let c = Math.random();
        let sc = Math.sqrt(c);
        let cc = Math.sqrt(1 - c);
        return this.set(sc * Math.cos(a), sc * Math.sin(a), cc * Math.cos(b), cc * Math.sin(b));
    }
    srandset(seed: Srand): Vec4 {
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
    projb(b: Bivec) {
        return this.dotb(b).dotbsr(b).negs();
    }
    projbs(b: Bivec) {
        return this.dotbsr(b).dotbsr(b).negs();
    }
    static rand(): Vec4 {
        let a = Math.random() * _360;
        let b = Math.random() * _360;
        let c = Math.random();
        let sc = Math.sqrt(c);
        let cc = Math.sqrt(1 - c);
        return new Vec4(sc * Math.cos(a), sc * Math.sin(a), cc * Math.cos(b), cc * Math.sin(b));
    }
    static srand(seed: Srand): Vec4 {
        let a = seed.nextf() * _360;
        let b = seed.nextf() * _360;
        let c = seed.nextf();
        let sc = Math.sqrt(c);
        let cc = Math.sqrt(1 - c);
        return new Vec4(sc * Math.cos(a), sc * Math.sin(a), cc * Math.cos(b), cc * Math.sin(b));
    }
    pushPool(pool: Vec4Pool = vec4Pool) {
        pool.push(this);
    }
}

export let _vec4 = new Vec4();
export let _vec4_1 = new Vec4();