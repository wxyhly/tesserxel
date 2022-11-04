import { _180, _360 } from "../const";
import { Pool } from "../pool";
import { Srand } from "../random";
import { Mat3 } from "./mat3";
import { Mat4 } from "./mat4";
import { Vec3, _vec3, _vec3_1 } from "./vec3";
import { Vec4 } from "./vec4";

export class QuaternionPool extends Pool<Quaternion>{
    constructObject() { return new Quaternion; }
}
export const quaternionPool = new QuaternionPool;
export class Quaternion {
    x: number;
    y: number;
    z: number;
    w: number;
    constructor(x: number = 1, y: number = 0, z: number = 0, w: number = 0) {
        this.x = x; this.y = y; this.z = z; this.w = w;
    }
    set(x: number = 1, y: number = 0, z: number = 0, w: number = 0): Quaternion {
        this.x = x; this.y = y; this.z = z; this.w = w; return this;
    }
    flat(): number[] {
        return [this.x, this.y, this.z, this.w];
    }
    copy(v: Vec4 | Quaternion): Quaternion {
        this.x = v.x; this.y = v.y;
        this.z = v.z; this.w = v.w;
        return this;
    }
    yzw(): Vec3 { return new Vec3(this.y, this.z, this.w); }
    ywz(): Vec3 { return new Vec3(this.y, this.w, this.z); }
    zyw(): Vec3 { return new Vec3(this.z, this.y, this.w); }
    zwy(): Vec3 { return new Vec3(this.z, this.w, this.y); }
    wzy(): Vec3 { return new Vec3(this.w, this.z, this.y); }
    wyz(): Vec3 { return new Vec3(this.w, this.y, this.z); }
    wxyz(): Vec4 { return new Vec4(this.w, this.x, this.y, this.z); }
    wxzy(): Vec4 { return new Vec4(this.w, this.x, this.z, this.y); }
    wyxz(): Vec4 { return new Vec4(this.w, this.y, this.x, this.z); }
    wzxy(): Vec4 { return new Vec4(this.w, this.z, this.x, this.y); }
    yxzw(): Vec4 { return new Vec4(this.y, this.x, this.z, this.w); }
    xzwy(): Vec4 { return new Vec4(this.x, this.z, this.w, this.y); }
    xyzw(): Vec4 { return new Vec4(this.x, this.y, this.z, this.w); }

    clone(): Quaternion {
        return new Quaternion(this.x, this.y, this.z, this.w);
    }

    neg(): Quaternion {
        return new Quaternion(-this.x, -this.y, -this.z, -this.w);
    }
    negs(): Quaternion {
        this.x = - this.x; this.y = -this.y; this.z = -this.z; this.w = -this.w;
        return this;
    }
    mul(q: Quaternion | Vec4): Quaternion {
        return new Quaternion(
            this.x * q.x - this.y * q.y - this.z * q.z - this.w * q.w,
            this.x * q.y + this.y * q.x + this.z * q.w - this.w * q.z,
            this.x * q.z - this.y * q.w + this.z * q.x + this.w * q.y,
            this.x * q.w + this.y * q.z - this.z * q.y + this.w * q.x
        );
    }
    /** this = this * q; */
    mulsr(q: Quaternion | Vec4): Quaternion {
        var x = this.x * q.x - this.y * q.y - this.z * q.z - this.w * q.w;
        var y = this.x * q.y + this.y * q.x + this.z * q.w - this.w * q.z;
        var z = this.x * q.z - this.y * q.w + this.z * q.x + this.w * q.y;
        this.w = this.x * q.w + this.y * q.z - this.z * q.y + this.w * q.x;
        this.x = x; this.y = y; this.z = z; return this;
    }
    /** this = q * this; */
    mulsl(q: Quaternion | Vec4): Quaternion {
        var x = q.x * this.x - q.y * this.y - q.z * this.z - q.w * this.w;
        var y = q.x * this.y + q.y * this.x + q.z * this.w - q.w * this.z;
        var z = q.x * this.z - q.y * this.w + q.z * this.x + q.w * this.y;
        this.w = q.x * this.w + q.y * this.z - q.z * this.y + q.w * this.x;
        this.x = x; this.y = y; this.z = z; return this;
    }
    /** this = this * conj(q); */
    mulsrconj(q: Quaternion | Vec4): Quaternion {
        var x = this.x * q.x + this.y * q.y + this.z * q.z + this.w * q.w;
        var y = -this.x * q.y + this.y * q.x - this.z * q.w + this.w * q.z;
        var z = -this.x * q.z + this.y * q.w + this.z * q.x - this.w * q.y;
        this.w = -this.x * q.w - this.y * q.z + this.z * q.y + this.w * q.x;
        this.x = x; this.y = y; this.z = z; return this;
    }
    /** this = conj(q) * this; */
    mulslconj(q: Quaternion | Vec4): Quaternion {
        var x = q.x * this.x + q.y * this.y + q.z * this.z + q.w * this.w;
        var y = q.x * this.y - q.y * this.x - q.z * this.w + q.w * this.z;
        var z = q.x * this.z + q.y * this.w - q.z * this.x - q.w * this.y;
        this.w = q.x * this.w - q.y * this.z + q.z * this.y - q.w * this.x;
        this.x = x; this.y = y; this.z = z; return this;
    }
    conj(): Quaternion {
        return new Quaternion(this.x, -this.y, -this.z, -this.w);
    }
    conjs(): Quaternion {
        this.y = -this.y; this.z = -this.z; this.w = -this.w; return this;
    }
    norm(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    }
    norms(): Quaternion {
        let n = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
        n = n == 0 ? 0 : (1 / n);
        this.x *= n; this.y *= n; this.z *= n; this.w *= n; return this;
    }
    /** axis must be a unit vector, if not, use Vec3.exp() instead */
    static fromAxis(axis: Vec3, angle: number): Quaternion {
        angle *= 0.5;
        let s = Math.sin(angle);
        return new Quaternion(Math.cos(angle), axis.x * s, axis.y * s, axis.z * s);
    }
    sqrt(): Quaternion {
        // we choose pos value because it's closer to 1
        let a = Math.sqrt(0.5 * (this.x + 1));
        let div2a = 1 / (2 * a);
        return new Quaternion(a, this.y * div2a, this.z * div2a, this.w * div2a);
    }
    sqrts(): Quaternion {
        // we choose pos value because it's closer to 1
        let a = Math.sqrt(0.5 * (this.x + 1));
        let div2a = 1 / (2 * a);
        return this.set(a, this.y * div2a, this.z * div2a, this.w * div2a);
    }
    /** get generator of this, Quaternion must be normalized */
    log(): Vec3 {
        let s = Math.acos(this.x);
        return this.yzw().mulfs(2 * s / Math.sin(s));
    }
    static slerp(a: Quaternion, b: Quaternion, t: number): Quaternion {
        let cosf = a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;
        let A: number, B: number;
        if (Math.abs(cosf) > 0.99999) {
            A = 1 - t; B = t;
        } else {
            let f = Math.acos(cosf);
            let _1s = 1 / Math.sin(f);
            A = Math.sin((1 - t) * f) * _1s;
            B = Math.sin(t * f) * _1s;
        }
        return new Quaternion(
            a.x * A + b.x * B, a.y * A + b.y * B, a.z * A + b.z * B, a.w * A + b.w * B
        );
    }
    toRotateMat(): Mat4 {
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
        return new Mat4(
            1 - (y2 + z2), xy - wz, xz + wy, 0,
            xy + wz, 1 - x2 - z2, yz - wx, 0,
            xz - wy, yz + wx, 1 - x2 - y2, 0,
            0, 0, 0, 1
        );
    }

    toMat3(): Mat3 {
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
        return new Mat3(
            1 - (y2 + z2), xy - wz, xz + wy,
            xy + wz, 1 - x2 - z2, yz - wx,
            xz - wy, yz + wx, 1 - x2 - y2
        );
    }
    toLMat4(): Mat4 {
        return new Mat4(
            this.x, -this.y, -this.z, -this.w,
            this.y, this.x, -this.w, this.z,
            this.z, this.w, this.x, -this.y,
            this.w, -this.z, this.y, this.x
        );
    }
    toRMat4(): Mat4 {
        return new Mat4(
            this.x, -this.y, -this.z, -this.w,
            this.y, this.x, this.w, -this.z,
            this.z, -this.w, this.x, this.y,
            this.w, this.z, -this.y, this.x
        );
    }
    expset(v: Vec3) {
        let g = v.norm() * 0.5;
        let s = Math.abs(g) > 0.005 ? Math.sin(g) / g * 0.5 : 0.5 - g * g / 12;
        return this.set(Math.cos(g), s * v.x, s * v.y, s * v.z);
    }
    static rand(): Quaternion {
        let a = Math.random() * _360;
        let b = Math.random() * _360;
        let c = Math.random();
        let sc = Math.sqrt(c);
        let cc = Math.sqrt(1 - c);
        return new Quaternion(sc * Math.cos(a), sc * Math.sin(a), cc * Math.cos(b), cc * Math.sin(b));
    }
    static srand(seed: Srand): Quaternion {
        let a = seed.nextf() * _360;
        let b = seed.nextf() * _360;
        let c = seed.nextf();
        let sc = Math.sqrt(c);
        let cc = Math.sqrt(1 - c);
        return new Quaternion(sc * Math.cos(a), sc * Math.sin(a), cc * Math.cos(b), cc * Math.sin(b));
    }
    randset(): Quaternion {
        let a = Math.random() * _360;
        let b = Math.random() * _360;
        let c = Math.random();
        let sc = Math.sqrt(c);
        let cc = Math.sqrt(1 - c);
        return this.set(sc * Math.cos(a), sc * Math.sin(a), cc * Math.cos(b), cc * Math.sin(b));
    }
    srandset(seed: Srand): Quaternion {
        let a = seed.nextf() * _360;
        let b = seed.nextf() * _360;
        let c = seed.nextf();
        let sc = Math.sqrt(c);
        let cc = Math.sqrt(1 - c);
        return this.set(sc * Math.cos(a), sc * Math.sin(a), cc * Math.cos(b), cc * Math.sin(b));
    }
    /** "from" and "to" must be normalized vectors*/
    static lookAt(from: Vec3, to: Vec3): Quaternion {

        let right = _vec3.wedgeset(from, to);
        let s = right.norm();
        let c = from.dot(to);
        if (s > 0.000001) { // not aligned
            right.mulfs(Math.atan2(s, c) / s);
        } else if (c < 0) { // almost n reversely aligned
            let v = _vec3_1.wedgeset(from, Vec3.x);
            if (v.norm1() < 0.01) {
                v = _vec3_1.wedgeset(from, Vec3.y);
            }
            return v.norms().mulfs(_180).exp();
        }
        return right.exp();
    }
    pushPool(pool: QuaternionPool = quaternionPool) {
        pool.push(this);
    }
}

export let _Q = new Quaternion();
export let _Q_1 = new Quaternion();
export let _Q_2 = new Quaternion();