import { Pool } from "../pool";
import { Vec2 } from "./vec2";

export class Mat2Pool extends Pool<Mat2>{
    constructObject() { return new Mat2; }
}
export const mat2Pool = new Mat2Pool;
export class Mat2 {
    elem: number[];
    static id = new Mat2(1, 0, 0, 1);
    static zero = new Mat2(0, 0, 0, 0);
    static diag(a: number, b: number): Mat2 {
        return new Mat2(
            a, 0,
            0, b
        );
    }
    constructor(
        a: number = 1, b: number = 0,
        c: number = 0, d: number = 1
    ) { this.elem = [a, b, c, d]; }
    set(
        a: number = 0, b: number = 0,
        c: number = 0, d: number = 0
    ): Mat2 { this.elem[0] = a; this.elem[1] = b; this.elem[2] = c; this.elem[3] = d; return this; }
    setid() { this.elem[0] = 1; this.elem[1] = 0; this.elem[2] = 0; this.elem[3] = 1; return this; }
    ts(): Mat2 {
        let tmp = this.elem[1]; this.elem[1] = this.elem[2]; this.elem[2] = tmp;
        return this;
    }
    t(): Mat2 {
        return new Mat2(
            this.elem[0], this.elem[2],
            this.elem[1], this.elem[3]
        );
    }
    copy(m2: Mat2): Mat2 {
        for (var i = 0; i < 4; i++) {
            this.elem[i] = m2.elem[i];
        }
        return this;
    }
    add(m2: Mat2): Mat2 {
        let m = new Mat2();
        for (var i = 0; i < 4; i++) {
            m.elem[i] = this.elem[i] + m2.elem[i];
        }
        return m;
    }
    adds(m2: Mat2): Mat2 {
        for (var i = 0; i < 4; i++) {
            this.elem[i] += m2.elem[i];
        }
        return this;
    }
    neg(): Mat2 {
        let m = new Mat2();
        for (var i = 0; i < 4; i++) {
            m.elem[i] = -this.elem[i];
        }
        return m;
    }
    negs(): Mat2 {
        for (var i = 0; i < 4; i++) {
            this.elem[i] = -this.elem[i];
        }
        return this;
    }
    sub(m2: Mat2): Mat2 {
        let m = new Mat2();
        for (var i = 0; i < 4; i++) {
            m.elem[i] = this.elem[i] - m2.elem[i];
        }
        return m;
    }
    subs(m2: Mat2): Mat2 {
        for (var i = 0; i < 4; i++) {
            this.elem[i] -= m2.elem[i];
        }
        return this;
    }
    mulf(k: number): Mat2 {
        let m = new Mat2();
        for (var i = 0; i < 4; i++) {
            m.elem[i] = this.elem[i] * k;
        }
        return m;
    }
    mulfs(k: number): Mat2 {
        for (var i = 0; i < 4; i++) {
            this.elem[i] *= k;
        }
        return this;
    }
    mulv(v: Vec2): Vec2 {
        let a = this.elem;
        return new Vec2(
            v.x * a[0] + v.y * a[1],
            v.x * a[2] + v.y * a[3]
        );
    }
    mul(m: Mat2): Mat2 {
        let a = this.elem; let b = m.elem;
        return new Mat2(
            a[0] * b[0] + a[1] * b[2], a[0] * b[1] + a[1] * b[3],
            a[2] * b[0] + a[3] * b[2], a[2] * b[1] + a[3] * b[3]
        );
    }
    muls(m: Mat2): Mat2 {
        let a = this.elem; let b = m.elem;
        this.set(
            a[0] * b[0] + a[1] * b[2], a[0] * b[1] + a[1] * b[3],
            a[2] * b[0] + a[3] * b[2], a[2] * b[1] + a[3] * b[3]
        );
        return this;
    }
    inv(): Mat2 {
        let me = this.elem;
        let a = me[0], b = me[1], c = me[2], d = me[3],
            det = a * d - b * c;
        if (det === 0) {
            console.warn("Matrix determinant is 0");
            return new Mat2(0, 0, 0, 0);
        }
        let detInv = 1 / det;
        return new Mat2(
            d * detInv,
            -b * detInv,
            -c * detInv,
            a * detInv
        );
    }
    invs(): Mat2 {
        let me = this.elem;
        let a = me[0], b = me[1], c = me[2], d = me[3],
            det = a * d - b * c;
        if (det === 0) {
            var msg = "Matrix determinant is 0";
            console.warn(msg);
            me.fill(0);
            return this;
        }
        let detInv = 1 / det;
        me[0] = d * detInv;
        me[1] = -b * detInv;
        me[2] = -c * detInv;
        me[3] = a * detInv;
        return this;
    }
    pushPool(pool: Mat2Pool = mat2Pool) {
        pool.push(this);
    }
}
export let _mat2 = new Mat2();
