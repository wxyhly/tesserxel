import { Pool } from '../pool.js';
import { Vec2 } from './vec2.js';

class Mat2Pool extends Pool {
    constructObject() { return new Mat2; }
}
const mat2Pool = new Mat2Pool;
class Mat2 {
    elem;
    static id = new Mat2(1, 0, 0, 1);
    static zero = new Mat2(0, 0, 0, 0);
    static diag(a, b) {
        return new Mat2(a, 0, 0, b);
    }
    constructor(a = 1, b = 0, c = 0, d = 1) { this.elem = [a, b, c, d]; }
    set(a = 0, b = 0, c = 0, d = 0) { this.elem[0] = a; this.elem[1] = b; this.elem[2] = c; this.elem[3] = d; return this; }
    setid() { this.elem[0] = 1; this.elem[1] = 0; this.elem[2] = 0; this.elem[3] = 1; return this; }
    ts() {
        let tmp = this.elem[1];
        this.elem[1] = this.elem[2];
        this.elem[2] = tmp;
        return this;
    }
    t() {
        return new Mat2(this.elem[0], this.elem[2], this.elem[1], this.elem[3]);
    }
    copy(m2) {
        for (var i = 0; i < 4; i++) {
            this.elem[i] = m2.elem[i];
        }
        return this;
    }
    add(m2) {
        let m = new Mat2();
        for (var i = 0; i < 4; i++) {
            m.elem[i] = this.elem[i] + m2.elem[i];
        }
        return m;
    }
    adds(m2) {
        for (var i = 0; i < 4; i++) {
            this.elem[i] += m2.elem[i];
        }
        return this;
    }
    neg() {
        let m = new Mat2();
        for (var i = 0; i < 4; i++) {
            m.elem[i] = -this.elem[i];
        }
        return m;
    }
    negs() {
        for (var i = 0; i < 4; i++) {
            this.elem[i] = -this.elem[i];
        }
        return this;
    }
    sub(m2) {
        let m = new Mat2();
        for (var i = 0; i < 4; i++) {
            m.elem[i] = this.elem[i] - m2.elem[i];
        }
        return m;
    }
    subs(m2) {
        for (var i = 0; i < 4; i++) {
            this.elem[i] -= m2.elem[i];
        }
        return this;
    }
    mulf(k) {
        let m = new Mat2();
        for (var i = 0; i < 4; i++) {
            m.elem[i] = this.elem[i] * k;
        }
        return m;
    }
    mulfs(k) {
        for (var i = 0; i < 4; i++) {
            this.elem[i] *= k;
        }
        return this;
    }
    mulv(v) {
        let a = this.elem;
        return new Vec2(v.x * a[0] + v.y * a[1], v.x * a[2] + v.y * a[3]);
    }
    mul(m) {
        let a = this.elem;
        let b = m.elem;
        return new Mat2(a[0] * b[0] + a[1] * b[2], a[0] * b[1] + a[1] * b[3], a[2] * b[0] + a[3] * b[2], a[2] * b[1] + a[3] * b[3]);
    }
    muls(m) {
        let a = this.elem;
        let b = m.elem;
        this.set(a[0] * b[0] + a[1] * b[2], a[0] * b[1] + a[1] * b[3], a[2] * b[0] + a[3] * b[2], a[2] * b[1] + a[3] * b[3]);
        return this;
    }
    inv() {
        let me = this.elem;
        let a = me[0], b = me[1], c = me[2], d = me[3], det = a * d - b * c;
        if (det === 0) {
            console.warn("Matrix determinant is 0");
            return new Mat2(0, 0, 0, 0);
        }
        let detInv = 1 / det;
        return new Mat2(d * detInv, -b * detInv, -c * detInv, a * detInv);
    }
    invs() {
        let me = this.elem;
        let a = me[0], b = me[1], c = me[2], d = me[3], det = a * d - b * c;
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
    pushPool(pool = mat2Pool) {
        pool.push(this);
    }
}
let _mat2 = new Mat2();

export { Mat2, Mat2Pool, _mat2, mat2Pool };
//# sourceMappingURL=mat2.js.map
