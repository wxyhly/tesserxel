import { Pool } from "../pool";
import { Quaternion } from "./quaternion";
import { Vec3 } from "./vec3";

export class Mat3Pool extends Pool<Mat3>{
    constructObject() { return new Mat3; }
}
export const mat3Pool = new Mat3Pool;
export class Mat3 {
    elem: number[];
    static id = new Mat3(1, 0, 0, 0, 1, 0, 0, 0, 1);
    static zero = new Mat3(0, 0, 0, 0, 0, 0, 0, 0, 0);
    static diag(a: number, b: number, c: number): Mat3 {
        return new Mat3(
            a, 0, 0,
            0, b, 0,
            0, 0, c
        );
    }
    constructor(
        a: number = 1, b: number = 0, c: number = 0,
        d: number = 0, e: number = 1, f: number = 0,
        g: number = 0, h: number = 0, i: number = 1
    ) { this.elem = [a, b, c, d, e, f, g, h, i]; }
    set(
        a: number = 0, b: number = 0, c: number = 0,
        d: number = 0, e: number = 0, f: number = 0,
        g: number = 0, h: number = 0, i: number = 0
    ): Mat3 { this.elem = [a, b, c, d, e, f, g, h, i]; return this; }
    setid(): Mat3 { this.elem = [1, 0, 0, 0, 1, 0, 0, 0, 1]; return this; }

    ts(): Mat3 {
        let me = this.elem;
        let tmp = me[1]; me[1] = me[3]; me[3] = tmp;
        tmp = me[2]; me[2] = me[6]; me[6] = tmp;
        tmp = me[5]; me[5] = me[7]; me[7] = tmp;
        return this;
    }
    t(): Mat3 {
        return new Mat3(
            this.elem[0], this.elem[3], this.elem[6],
            this.elem[1], this.elem[4], this.elem[7],
            this.elem[2], this.elem[5], this.elem[8]
        );
    }

    /** col vector */x_(): Vec3 { return new Vec3(this.elem[0], this.elem[3], this.elem[6]); }
    /** col vector */y_(): Vec3 { return new Vec3(this.elem[1], this.elem[4], this.elem[7]); }
    /** col vector */z_(): Vec3 { return new Vec3(this.elem[2], this.elem[5], this.elem[8]); }

    /** row vector */_x(): Vec3 { return new Vec3(this.elem[0], this.elem[1], this.elem[2]); }
    /** row vector */_y(): Vec3 { return new Vec3(this.elem[3], this.elem[4], this.elem[5]); }
    /** row vector */_z(): Vec3 { return new Vec3(this.elem[6], this.elem[7], this.elem[8]); }
    copy(m2: Mat3): Mat3 {
        for (var i = 0; i < 4; i++) {
            this.elem[i] = m2.elem[i];
        }
        return this;
    }
    add(m2: Mat3): Mat3 {
        let m = new Mat3();
        for (var i = 0; i < 9; i++) {
            m.elem[i] = this.elem[i] + m2.elem[i];
        }
        return m;
    }
    adds(m2: Mat3): Mat3 {
        for (var i = 0; i < 9; i++) {
            this.elem[i] += m2.elem[i];
        }
        return this;
    }
    neg(): Mat3 {
        let m = new Mat3();
        for (var i = 0; i < 9; i++) {
            m.elem[i] = -this.elem[i];
        }
        return m;
    }
    negs(): Mat3 {
        for (var i = 0; i < 9; i++) {
            this.elem[i] = -this.elem[i];
        }
        return this;
    }
    sub(m2: Mat3): Mat3 {
        let m = new Mat3();
        for (var i = 0; i < 9; i++) {
            m.elem[i] = this.elem[i] - m2.elem[i];
        }
        return m;
    }
    subs(m2: Mat3): Mat3 {
        for (var i = 0; i < 9; i++) {
            this.elem[i] -= m2.elem[i];
        }
        return this;
    }
    mulf(k: number): Mat3 {
        let m = new Mat3();
        for (var i = 0; i < 9; i++) {
            m.elem[i] = this.elem[i] * k;
        }
        return m;
    }
    mulfs(k: number): Mat3 {
        for (var i = 0; i < 9; i++) {
            this.elem[i] *= k;
        }
        return this;
    }
    mulv(v: Vec3): Vec3 {
        let a = this.elem;
        return new Vec3(
            v.x * a[0] + v.y * a[1] + v.z * a[2],
            v.x * a[3] + v.y * a[4] + v.z * a[5],
            v.x * a[6] + v.y * a[7] + v.z * a[8]
        );
    }
    mul(m: Mat3): Mat3 {
        let a = this.elem; let b = m.elem;
        return new Mat3(
            a[0] * b[0] + a[1] * b[3] + a[2] * b[6], a[0] * b[1] + a[1] * b[4] + a[2] * b[7], a[0] * b[2] + a[1] * b[5] + a[2] * b[8],
            a[3] * b[0] + a[4] * b[3] + a[5] * b[6], a[3] * b[1] + a[4] * b[4] + a[5] * b[7], a[3] * b[2] + a[4] * b[5] + a[5] * b[8],
            a[6] * b[0] + a[7] * b[3] + a[8] * b[6], a[6] * b[1] + a[7] * b[4] + a[8] * b[7], a[6] * b[2] + a[7] * b[5] + a[8] * b[8],
        );
    }
    muls(m: Mat3): Mat3 {
        let a = this.elem; let b = m.elem;
        this.set(
            a[0] * b[0] + a[1] * b[3] + a[2] * b[6], a[0] * b[1] + a[1] * b[4] + a[2] * b[7], a[0] * b[2] + a[1] * b[5] + a[2] * b[8],
            a[3] * b[0] + a[4] * b[3] + a[5] * b[6], a[3] * b[1] + a[4] * b[4] + a[5] * b[7], a[3] * b[2] + a[4] * b[5] + a[5] * b[8],
            a[6] * b[0] + a[7] * b[3] + a[8] * b[6], a[6] * b[1] + a[7] * b[4] + a[8] * b[7], a[6] * b[2] + a[7] * b[5] + a[8] * b[8],
        );
        return this;
    }
    inv(): Mat3 {
        let me = this.elem;
        let n11 = me[0], n21 = me[1], n31 = me[2],
            n12 = me[3], n22 = me[4], n32 = me[5],
            n13 = me[6], n23 = me[7], n33 = me[8],
            t11 = n33 * n22 - n32 * n23,
            t12 = n32 * n13 - n33 * n12,
            t13 = n23 * n12 - n22 * n13,
            det = n11 * t11 + n21 * t12 + n31 * t13;
        if (det === 0) {
            console.warn("Matrix determinant is 0");
            return new Mat3(0, 0, 0, 0, 0, 0, 0, 0, 0);
        }
        let detInv = 1 / det;
        return new Mat3(
            t11 * detInv,
            (n31 * n23 - n33 * n21) * detInv,
            (n32 * n21 - n31 * n22) * detInv,
            t12 * detInv,
            (n33 * n11 - n31 * n13) * detInv,
            (n31 * n12 - n32 * n11) * detInv,
            t13 * detInv,
            (n21 * n13 - n23 * n11) * detInv,
            (n22 * n11 - n21 * n12) * detInv
        );
    }
    invs(): Mat3 {
        let me = this.elem;
        let n11 = me[0], n21 = me[1], n31 = me[2],
            n12 = me[3], n22 = me[4], n32 = me[5],
            n13 = me[6], n23 = me[7], n33 = me[8],
            t11 = n33 * n22 - n32 * n23,
            t12 = n32 * n13 - n33 * n12,
            t13 = n23 * n12 - n22 * n13,
            det = n11 * t11 + n21 * t12 + n31 * t13;
        if (det === 0) {
            var msg = "Matrix determinant is 0";
            console.warn(msg);
            me.fill(0);
            return this;
        }
        let detInv = 1 / det;
        me[0] = t11 * detInv;
        me[1] = (n31 * n23 - n33 * n21) * detInv;
        me[2] = (n32 * n21 - n31 * n22) * detInv;
        me[3] = t12 * detInv;
        me[4] = (n33 * n11 - n31 * n13) * detInv;
        me[5] = (n31 * n12 - n32 * n11) * detInv;
        me[6] = t13 * detInv;
        me[7] = (n21 * n13 - n23 * n11) * detInv;
        me[8] = (n22 * n11 - n21 * n12) * detInv;
        return this;
    }

    setFromRotaion(q: Quaternion): Mat3 {
        let xt2 = q.y + q.y, yt2 = q.z + q.z, zt2 = q.w + q.w;
        let x2 = q.y * xt2;
        let y2 = q.z * yt2;
        let z2 = q.w * zt2;

        let xy = q.y * yt2;
        let yz = q.w * yt2;
        let xz = q.w * xt2;

        let wx = q.x * xt2;
        let wy = q.x * yt2;
        let wz = q.x * zt2;
        return this.set(
            1 - (y2 + z2), xy - wz, xz + wy,
            xy + wz, 1 - x2 - z2, yz - wx,
            xz - wy, yz + wx, 1 - x2 - y2
        );
    }
    pushPool(pool: Mat3Pool = mat3Pool) {
        pool.push(this);
    }
}
export let _mat3 = new Mat3();