(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.tesserxel = {}));
})(this, (function (exports) { 'use strict';

    const _180 = Math.PI;
    const _30 = Math.PI / 6;
    const _60 = Math.PI / 3;
    const _45 = Math.PI / 4;
    const _90 = Math.PI / 2;
    const _120 = Math.PI * 2 / 3;
    const _360 = Math.PI * 2;
    const _DEG2RAD = Math.PI / 180;
    const _RAD2DEG = 180 / Math.PI;
    const _SQRT_3 = Math.sqrt(3);
    const _COS30 = Math.sqrt(3) / 2;
    const _TAN30 = Math.sqrt(3) / 3;
    const _GOLDRATIO = (Math.sqrt(5) - 1) / 2;

    // from cannon.js: src/utils/pool.js
    class Pool {
        objects = [];
        pop() {
            if (this.objects.length === 0) {
                return this.constructObject();
            }
            else {
                return this.objects.pop();
            }
        }
        push(...args) {
            this.objects.push(...args);
        }
        resize(size) {
            let objects = this.objects;
            while (objects.length > size) {
                objects.pop();
            }
            while (objects.length < size) {
                objects.push(this.constructObject());
            }
            return this;
        }
    }

    class Vec2Pool extends Pool {
        constructObject() { return new Vec2; }
    }
    const vec2Pool = new Vec2Pool;
    class Vec2 {
        x;
        y;
        static x = Object.freeze(new Vec2(1, 0));
        static y = Object.freeze(new Vec2(0, 1));
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

    class Mat3Pool extends Pool {
        constructObject() { return new Mat3; }
    }
    const mat3Pool = new Mat3Pool;
    class Mat3 {
        elem;
        static id = new Mat3(1, 0, 0, 0, 1, 0, 0, 0, 1);
        static zero = new Mat3(0, 0, 0, 0, 0, 0, 0, 0, 0);
        static diag(a, b, c) {
            return new Mat3(a, 0, 0, 0, b, 0, 0, 0, c);
        }
        constructor(a = 1, b = 0, c = 0, d = 0, e = 1, f = 0, g = 0, h = 0, i = 1) { this.elem = [a, b, c, d, e, f, g, h, i]; }
        set(a = 0, b = 0, c = 0, d = 0, e = 0, f = 0, g = 0, h = 0, i = 0) { this.elem = [a, b, c, d, e, f, g, h, i]; return this; }
        setid() { this.elem = [1, 0, 0, 0, 1, 0, 0, 0, 1]; return this; }
        ts() {
            let me = this.elem;
            let tmp = me[1];
            me[1] = me[3];
            me[3] = tmp;
            tmp = me[2];
            me[2] = me[6];
            me[6] = tmp;
            tmp = me[5];
            me[5] = me[7];
            me[7] = tmp;
            return this;
        }
        t() {
            return new Mat3(this.elem[0], this.elem[3], this.elem[6], this.elem[1], this.elem[4], this.elem[7], this.elem[2], this.elem[5], this.elem[8]);
        }
        /** col vector */ x_() { return new Vec3(this.elem[0], this.elem[3], this.elem[6]); }
        /** col vector */ y_() { return new Vec3(this.elem[1], this.elem[4], this.elem[7]); }
        /** col vector */ z_() { return new Vec3(this.elem[2], this.elem[5], this.elem[8]); }
        /** row vector */ _x() { return new Vec3(this.elem[0], this.elem[1], this.elem[2]); }
        /** row vector */ _y() { return new Vec3(this.elem[3], this.elem[4], this.elem[5]); }
        /** row vector */ _z() { return new Vec3(this.elem[6], this.elem[7], this.elem[8]); }
        copy(m2) {
            for (var i = 0; i < 4; i++) {
                this.elem[i] = m2.elem[i];
            }
            return this;
        }
        add(m2) {
            let m = new Mat3();
            for (var i = 0; i < 9; i++) {
                m.elem[i] = this.elem[i] + m2.elem[i];
            }
            return m;
        }
        adds(m2) {
            for (var i = 0; i < 9; i++) {
                this.elem[i] += m2.elem[i];
            }
            return this;
        }
        neg() {
            let m = new Mat3();
            for (var i = 0; i < 9; i++) {
                m.elem[i] = -this.elem[i];
            }
            return m;
        }
        negs() {
            for (var i = 0; i < 9; i++) {
                this.elem[i] = -this.elem[i];
            }
            return this;
        }
        sub(m2) {
            let m = new Mat3();
            for (var i = 0; i < 9; i++) {
                m.elem[i] = this.elem[i] - m2.elem[i];
            }
            return m;
        }
        subs(m2) {
            for (var i = 0; i < 9; i++) {
                this.elem[i] -= m2.elem[i];
            }
            return this;
        }
        mulf(k) {
            let m = new Mat3();
            for (var i = 0; i < 9; i++) {
                m.elem[i] = this.elem[i] * k;
            }
            return m;
        }
        mulfs(k) {
            for (var i = 0; i < 9; i++) {
                this.elem[i] *= k;
            }
            return this;
        }
        mulv(v) {
            let a = this.elem;
            return new Vec3(v.x * a[0] + v.y * a[1] + v.z * a[2], v.x * a[3] + v.y * a[4] + v.z * a[5], v.x * a[6] + v.y * a[7] + v.z * a[8]);
        }
        mul(m) {
            let a = this.elem;
            let b = m.elem;
            return new Mat3(a[0] * b[0] + a[1] * b[3] + a[2] * b[6], a[0] * b[1] + a[1] * b[4] + a[2] * b[7], a[0] * b[2] + a[1] * b[5] + a[2] * b[8], a[3] * b[0] + a[4] * b[3] + a[5] * b[6], a[3] * b[1] + a[4] * b[4] + a[5] * b[7], a[3] * b[2] + a[4] * b[5] + a[5] * b[8], a[6] * b[0] + a[7] * b[3] + a[8] * b[6], a[6] * b[1] + a[7] * b[4] + a[8] * b[7], a[6] * b[2] + a[7] * b[5] + a[8] * b[8]);
        }
        muls(m) {
            let a = this.elem;
            let b = m.elem;
            this.set(a[0] * b[0] + a[1] * b[3] + a[2] * b[6], a[0] * b[1] + a[1] * b[4] + a[2] * b[7], a[0] * b[2] + a[1] * b[5] + a[2] * b[8], a[3] * b[0] + a[4] * b[3] + a[5] * b[6], a[3] * b[1] + a[4] * b[4] + a[5] * b[7], a[3] * b[2] + a[4] * b[5] + a[5] * b[8], a[6] * b[0] + a[7] * b[3] + a[8] * b[6], a[6] * b[1] + a[7] * b[4] + a[8] * b[7], a[6] * b[2] + a[7] * b[5] + a[8] * b[8]);
            return this;
        }
        inv() {
            let me = this.elem;
            let n11 = me[0], n21 = me[1], n31 = me[2], n12 = me[3], n22 = me[4], n32 = me[5], n13 = me[6], n23 = me[7], n33 = me[8], t11 = n33 * n22 - n32 * n23, t12 = n32 * n13 - n33 * n12, t13 = n23 * n12 - n22 * n13, det = n11 * t11 + n21 * t12 + n31 * t13;
            if (det === 0) {
                console.warn("Matrix determinant is 0");
                return new Mat3(0, 0, 0, 0, 0, 0, 0, 0, 0);
            }
            let detInv = 1 / det;
            return new Mat3(t11 * detInv, (n31 * n23 - n33 * n21) * detInv, (n32 * n21 - n31 * n22) * detInv, t12 * detInv, (n33 * n11 - n31 * n13) * detInv, (n31 * n12 - n32 * n11) * detInv, t13 * detInv, (n21 * n13 - n23 * n11) * detInv, (n22 * n11 - n21 * n12) * detInv);
        }
        invs() {
            let me = this.elem;
            let n11 = me[0], n21 = me[1], n31 = me[2], n12 = me[3], n22 = me[4], n32 = me[5], n13 = me[6], n23 = me[7], n33 = me[8], t11 = n33 * n22 - n32 * n23, t12 = n32 * n13 - n33 * n12, t13 = n23 * n12 - n22 * n13, det = n11 * t11 + n21 * t12 + n31 * t13;
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
        setFromRotaion(q) {
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
            return this.set(1 - (y2 + z2), xy - wz, xz + wy, xy + wz, 1 - x2 - z2, yz - wx, xz - wy, yz + wx, 1 - x2 - y2);
        }
        pushPool(pool = mat3Pool) {
            pool.push(this);
        }
    }

    class Mat4Pool extends Pool {
        constructObject() { return new Mat4; }
    }
    const mat4Pool = new Mat4Pool;
    class Mat4 {
        elem;
        static id = Object.freeze(new Mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1));
        static zero = Object.freeze(new Mat4(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0));
        static diag(a, b, c, d) {
            return new Mat4(a, 0, 0, 0, 0, b, 0, 0, 0, 0, c, 0, 0, 0, 0, d);
        }
        static augVec4(a, b, c, d) {
            return new Mat4(a.x, b.x, c.x, d.x, a.y, b.y, c.y, d.y, a.z, b.z, c.z, d.z, a.w, b.w, c.w, d.w);
        }
        static augMat3(a, b, c, d) {
            c = c ?? new Vec3();
            b = b ?? new Vec3();
            return new Mat4(a.elem[0], a.elem[1], a.elem[2], b.x, a.elem[3], a.elem[4], a.elem[5], b.y, a.elem[6], a.elem[7], a.elem[8], b.z, c.x, c.y, c.z, d);
        }
        augVec4set(a, b, c, d) {
            return this.set(a.x, b.x, c.x, d.x, a.y, b.y, c.y, d.y, a.z, b.z, c.z, d.z, a.w, b.w, c.w, d.w);
        }
        augMat3set(a, b, c, d) {
            return this.set(a.elem[0], a.elem[1], a.elem[2], b?.x ?? 0, a.elem[3], a.elem[4], a.elem[5], b?.y ?? 0, a.elem[6], a.elem[7], a.elem[8], b?.z ?? 0, c?.x ?? 0, c?.y ?? 0, c?.z ?? 0, d);
        }
        constructor(a = 1, b = 0, c = 0, d = 0, e = 0, f = 1, g = 0, h = 0, i = 0, j = 0, k = 1, l = 0, m = 0, n = 0, o = 0, p = 1) { this.elem = [a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p]; }
        clone() {
            let e = this.elem;
            return new Mat4(...e);
        }
        writeBuffer(b, offset = 0) {
            b[offset++] = this.elem[0];
            b[offset++] = this.elem[4];
            b[offset++] = this.elem[8];
            b[offset++] = this.elem[12];
            b[offset++] = this.elem[1];
            b[offset++] = this.elem[5];
            b[offset++] = this.elem[9];
            b[offset++] = this.elem[13];
            b[offset++] = this.elem[2];
            b[offset++] = this.elem[6];
            b[offset++] = this.elem[10];
            b[offset++] = this.elem[14];
            b[offset++] = this.elem[3];
            b[offset++] = this.elem[7];
            b[offset++] = this.elem[11];
            b[offset++] = this.elem[15];
        }
        setid() {
            this.elem[0] = 1, this.elem[1] = 0, this.elem[2] = 0, this.elem[3] = 0;
            this.elem[4] = 0, this.elem[5] = 1, this.elem[6] = 0, this.elem[7] = 0;
            this.elem[8] = 0, this.elem[9] = 0, this.elem[10] = 1, this.elem[11] = 0;
            this.elem[12] = 0, this.elem[13] = 0, this.elem[14] = 0, this.elem[15] = 1;
            return this;
        }
        set(a = 0, b = 0, c = 0, d = 0, e = 0, f = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0) {
            this.elem[0] = a, this.elem[1] = b, this.elem[2] = c, this.elem[3] = d;
            this.elem[4] = e, this.elem[5] = f, this.elem[6] = g, this.elem[7] = h;
            this.elem[8] = i, this.elem[9] = j, this.elem[10] = k, this.elem[11] = l;
            this.elem[12] = m, this.elem[13] = n, this.elem[14] = o, this.elem[15] = p;
            return this;
        }
        ts() {
            let me = this.elem;
            let tmp = me[1];
            me[1] = me[4];
            me[4] = tmp;
            tmp = me[2];
            me[2] = me[8];
            me[8] = tmp;
            tmp = me[6];
            me[6] = me[9];
            me[9] = tmp;
            tmp = me[3];
            me[3] = me[12];
            me[12] = tmp;
            tmp = me[7];
            me[7] = me[13];
            me[13] = tmp;
            tmp = me[11];
            me[11] = me[14];
            me[14] = tmp;
            return this;
        }
        t() {
            return new Mat4(this.elem[0], this.elem[4], this.elem[8], this.elem[12], this.elem[1], this.elem[5], this.elem[9], this.elem[13], this.elem[2], this.elem[6], this.elem[10], this.elem[14], this.elem[3], this.elem[7], this.elem[11], this.elem[15]);
        }
        /** col vector */ x_() { return new Vec4(this.elem[0], this.elem[4], this.elem[8], this.elem[12]); }
        /** col vector */ y_() { return new Vec4(this.elem[1], this.elem[5], this.elem[9], this.elem[13]); }
        /** col vector */ z_() { return new Vec4(this.elem[2], this.elem[6], this.elem[10], this.elem[14]); }
        /** col vector */ w_() { return new Vec4(this.elem[3], this.elem[7], this.elem[11], this.elem[15]); }
        /** row vector */ _x() { return new Vec4(this.elem[0], this.elem[1], this.elem[2], this.elem[3]); }
        /** row vector */ _y() { return new Vec4(this.elem[4], this.elem[5], this.elem[6], this.elem[7]); }
        /** row vector */ _z() { return new Vec4(this.elem[8], this.elem[9], this.elem[10], this.elem[11]); }
        /** row vector */ _w() { return new Vec4(this.elem[12], this.elem[13], this.elem[14], this.elem[15]); }
        copy(m2) {
            for (var i = 0; i < 16; i++) {
                this.elem[i] = m2.elem[i];
            }
            return this;
        }
        add(m2) {
            let m = new Mat4();
            for (var i = 0; i < 16; i++) {
                m.elem[i] = this.elem[i] + m2.elem[i];
            }
            return m;
        }
        adds(m2) {
            for (var i = 0; i < 16; i++) {
                this.elem[i] += m2.elem[i];
            }
            return this;
        }
        neg() {
            let m = new Mat4();
            for (var i = 0; i < 16; i++) {
                m.elem[i] = -this.elem[i];
            }
            return m;
        }
        negs() {
            for (var i = 0; i < 16; i++) {
                this.elem[i] = -this.elem[i];
            }
            return this;
        }
        sub(m2) {
            let m = new Mat4();
            for (var i = 0; i < 16; i++) {
                m.elem[i] = this.elem[i] - m2.elem[i];
            }
            return m;
        }
        subs(m2) {
            for (var i = 0; i < 16; i++) {
                this.elem[i] -= m2.elem[i];
            }
            return this;
        }
        mulf(k) {
            let m = new Mat4();
            for (var i = 0; i < 16; i++) {
                m.elem[i] = this.elem[i] * k;
            }
            return m;
        }
        mulfs(k) {
            for (var i = 0; i < 16; i++) {
                this.elem[i] *= k;
            }
            return this;
        }
        mulv(v) {
            let a = this.elem;
            return new Vec4(v.x * a[0] + v.y * a[1] + v.z * a[2] + v.w * a[3], v.x * a[4] + v.y * a[5] + v.z * a[6] + v.w * a[7], v.x * a[8] + v.y * a[9] + v.z * a[10] + v.w * a[11], v.x * a[12] + v.y * a[13] + v.z * a[14] + v.w * a[15]);
        }
        mul(m) {
            let a = this.elem;
            let b = m.elem;
            return new Mat4(a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12], a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13], a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14], a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15], a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12], a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13], a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14], a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15], a[8] * b[0] + a[9] * b[4] + a[10] * b[8] + a[11] * b[12], a[8] * b[1] + a[9] * b[5] + a[10] * b[9] + a[11] * b[13], a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14], a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15], a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + a[15] * b[12], a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + a[15] * b[13], a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14], a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15]);
        }
        /** this = this * m; */
        mulsr(m) {
            let a = this.elem;
            let b = m.elem;
            this.set(a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12], a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13], a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14], a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15], a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12], a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13], a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14], a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15], a[8] * b[0] + a[9] * b[4] + a[10] * b[8] + a[11] * b[12], a[8] * b[1] + a[9] * b[5] + a[10] * b[9] + a[11] * b[13], a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14], a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15], a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + a[15] * b[12], a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + a[15] * b[13], a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14], a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15]);
            return this;
        }
        /** this = m * this; */
        mulsl(m) {
            let b = this.elem;
            let a = m.elem;
            this.set(a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12], a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13], a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14], a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15], a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12], a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13], a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14], a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15], a[8] * b[0] + a[9] * b[4] + a[10] * b[8] + a[11] * b[12], a[8] * b[1] + a[9] * b[5] + a[10] * b[9] + a[11] * b[13], a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14], a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15], a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + a[15] * b[12], a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + a[15] * b[13], a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14], a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15]);
            return this;
        }
        /** this = m1 * m2; */
        mulset(m1, m2) {
            let a = m1.elem;
            let b = m2.elem;
            this.set(a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12], a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13], a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14], a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15], a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12], a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13], a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14], a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15], a[8] * b[0] + a[9] * b[4] + a[10] * b[8] + a[11] * b[12], a[8] * b[1] + a[9] * b[5] + a[10] * b[9] + a[11] * b[13], a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14], a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15], a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + a[15] * b[12], a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + a[15] * b[13], a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14], a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15]);
            return this;
        }
        setFrom3DRotation(q) {
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
            return this.set(1 - (y2 + z2), xy - wz, xz + wy, 0, xy + wz, 1 - x2 - z2, yz - wx, 0, xz - wy, yz + wx, 1 - x2 - y2, 0, 0, 0, 0, 1);
        }
        setFromQuaternionL(q) {
            return this.set(q.x, -q.y, -q.z, -q.w, q.y, q.x, -q.w, q.z, q.z, q.w, q.x, -q.y, q.w, -q.z, q.y, q.x);
        }
        setFromQuaternionR(q) {
            return this.set(q.x, -q.y, -q.z, -q.w, q.y, q.x, q.w, -q.z, q.z, -q.w, q.x, q.y, q.w, q.z, -q.y, q.x);
        }
        setFromRotor(r) {
            return this.setFromQuaternionL(r.l).mulsr(_mat4.setFromQuaternionR(r.r));
        }
        setFromRotorconj(r) {
            return this.setFromQuaternionL(r.l.conj()).mulsr(_mat4.setFromQuaternionR(r.r.conj()));
        }
        det() {
            let me = this.elem;
            let n11 = me[0], n21 = me[1], n31 = me[2], n41 = me[3], n12 = me[4], n22 = me[5], n32 = me[6], n42 = me[7], n13 = me[8], n23 = me[9], n33 = me[10], n43 = me[11], n14 = me[12], n24 = me[13], n34 = me[14], n44 = me[15], t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44, t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44, t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44, t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;
            return n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;
        }
        inv() {
            let me = this.elem;
            let n11 = me[0], n21 = me[1], n31 = me[2], n41 = me[3], n12 = me[4], n22 = me[5], n32 = me[6], n42 = me[7], n13 = me[8], n23 = me[9], n33 = me[10], n43 = me[11], n14 = me[12], n24 = me[13], n34 = me[14], n44 = me[15], t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44, t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44, t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44, t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;
            let det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;
            if (det === 0) {
                console.warn("Matrix determinant is 0");
                return new Mat4(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
            }
            let detInv = 1 / det;
            return new Mat4(t11 * detInv, (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * detInv, (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * detInv, (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * detInv, t12 * detInv, (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * detInv, (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * detInv, (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * detInv, t13 * detInv, (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * detInv, (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * detInv, (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * detInv, t14 * detInv, (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * detInv, (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * detInv, (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * detInv);
        }
        invs() {
            let me = this.elem;
            let n11 = me[0], n21 = me[1], n31 = me[2], n41 = me[3], n12 = me[4], n22 = me[5], n32 = me[6], n42 = me[7], n13 = me[8], n23 = me[9], n33 = me[10], n43 = me[11], n14 = me[12], n24 = me[13], n34 = me[14], n44 = me[15], t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44, t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44, t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44, t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;
            let det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;
            if (det === 0) {
                var msg = "Matrix determinant is 0";
                console.warn(msg);
                me.fill(0);
                return this;
            }
            let detInv = 1 / det;
            me[0] = t11 * detInv;
            me[1] = (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * detInv;
            me[2] = (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * detInv;
            me[3] = (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * detInv;
            me[4] = t12 * detInv;
            me[5] = (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * detInv;
            me[6] = (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * detInv;
            me[7] = (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * detInv;
            me[8] = t13 * detInv;
            me[9] = (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * detInv;
            me[10] = (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * detInv;
            me[11] = (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * detInv;
            me[12] = t14 * detInv;
            me[13] = (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * detInv;
            me[14] = (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * detInv;
            me[15] = (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * detInv;
            return this;
        }
        pushPool(pool = mat4Pool) {
            pool.push(this);
        }
    }
    let _mat4 = new Mat4();

    class QuaternionPool extends Pool {
        constructObject() { return new Quaternion; }
    }
    const quaternionPool = new QuaternionPool;
    class Quaternion {
        x;
        y;
        z;
        w;
        constructor(x = 1, y = 0, z = 0, w = 0) {
            this.x = x;
            this.y = y;
            this.z = z;
            this.w = w;
        }
        set(x = 1, y = 0, z = 0, w = 0) {
            this.x = x;
            this.y = y;
            this.z = z;
            this.w = w;
            return this;
        }
        flat() {
            return [this.x, this.y, this.z, this.w];
        }
        copy(v) {
            this.x = v.x;
            this.y = v.y;
            this.z = v.z;
            this.w = v.w;
            return this;
        }
        yzw() { return new Vec3(this.y, this.z, this.w); }
        ywz() { return new Vec3(this.y, this.w, this.z); }
        zyw() { return new Vec3(this.z, this.y, this.w); }
        zwy() { return new Vec3(this.z, this.w, this.y); }
        wzy() { return new Vec3(this.w, this.z, this.y); }
        wyz() { return new Vec3(this.w, this.y, this.z); }
        wxyz() { return new Vec4(this.w, this.x, this.y, this.z); }
        wxzy() { return new Vec4(this.w, this.x, this.z, this.y); }
        wyxz() { return new Vec4(this.w, this.y, this.x, this.z); }
        wzxy() { return new Vec4(this.w, this.z, this.x, this.y); }
        yxzw() { return new Vec4(this.y, this.x, this.z, this.w); }
        xzwy() { return new Vec4(this.x, this.z, this.w, this.y); }
        xyzw() { return new Vec4(this.x, this.y, this.z, this.w); }
        clone() {
            return new Quaternion(this.x, this.y, this.z, this.w);
        }
        neg() {
            return new Quaternion(-this.x, -this.y, -this.z, -this.w);
        }
        negs() {
            this.x = -this.x;
            this.y = -this.y;
            this.z = -this.z;
            this.w = -this.w;
            return this;
        }
        mul(q) {
            return new Quaternion(this.x * q.x - this.y * q.y - this.z * q.z - this.w * q.w, this.x * q.y + this.y * q.x + this.z * q.w - this.w * q.z, this.x * q.z - this.y * q.w + this.z * q.x + this.w * q.y, this.x * q.w + this.y * q.z - this.z * q.y + this.w * q.x);
        }
        /** this = this * q; */
        mulsr(q) {
            var x = this.x * q.x - this.y * q.y - this.z * q.z - this.w * q.w;
            var y = this.x * q.y + this.y * q.x + this.z * q.w - this.w * q.z;
            var z = this.x * q.z - this.y * q.w + this.z * q.x + this.w * q.y;
            this.w = this.x * q.w + this.y * q.z - this.z * q.y + this.w * q.x;
            this.x = x;
            this.y = y;
            this.z = z;
            return this;
        }
        /** this = q * this; */
        mulsl(q) {
            var x = q.x * this.x - q.y * this.y - q.z * this.z - q.w * this.w;
            var y = q.x * this.y + q.y * this.x + q.z * this.w - q.w * this.z;
            var z = q.x * this.z - q.y * this.w + q.z * this.x + q.w * this.y;
            this.w = q.x * this.w + q.y * this.z - q.z * this.y + q.w * this.x;
            this.x = x;
            this.y = y;
            this.z = z;
            return this;
        }
        /** this = this * conj(q); */
        mulsrconj(q) {
            var x = this.x * q.x + this.y * q.y + this.z * q.z + this.w * q.w;
            var y = -this.x * q.y + this.y * q.x - this.z * q.w + this.w * q.z;
            var z = -this.x * q.z + this.y * q.w + this.z * q.x - this.w * q.y;
            this.w = -this.x * q.w - this.y * q.z + this.z * q.y + this.w * q.x;
            this.x = x;
            this.y = y;
            this.z = z;
            return this;
        }
        /** this = conj(q) * this; */
        mulslconj(q) {
            var x = q.x * this.x + q.y * this.y + q.z * this.z + q.w * this.w;
            var y = q.x * this.y - q.y * this.x - q.z * this.w + q.w * this.z;
            var z = q.x * this.z + q.y * this.w - q.z * this.x - q.w * this.y;
            this.w = q.x * this.w - q.y * this.z + q.z * this.y - q.w * this.x;
            this.x = x;
            this.y = y;
            this.z = z;
            return this;
        }
        conj() {
            return new Quaternion(this.x, -this.y, -this.z, -this.w);
        }
        conjs() {
            this.y = -this.y;
            this.z = -this.z;
            this.w = -this.w;
            return this;
        }
        norm() {
            return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
        }
        norms() {
            let n = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
            n = n == 0 ? 0 : (1 / n);
            this.x *= n;
            this.y *= n;
            this.z *= n;
            this.w *= n;
            return this;
        }
        /** axis must be a unit vector, if not, use Vec3.exp() instead */
        static fromAxis(axis, angle) {
            angle *= 0.5;
            let s = Math.sin(angle);
            return new Quaternion(Math.cos(angle), axis.x * s, axis.y * s, axis.z * s);
        }
        sqrt() {
            // we choose pos value because it's closer to 1
            let a = Math.sqrt(0.5 * (this.x + 1));
            let div2a = 1 / (2 * a);
            return new Quaternion(a, this.y * div2a, this.z * div2a, this.w * div2a);
        }
        sqrts() {
            // we choose pos value because it's closer to 1
            let a = Math.sqrt(0.5 * (this.x + 1));
            let div2a = 1 / (2 * a);
            return this.set(a, this.y * div2a, this.z * div2a, this.w * div2a);
        }
        /** get generator of this, Quaternion must be normalized */
        log() {
            let s = Math.acos(this.x);
            return this.yzw().mulfs(2 * s / Math.sin(s));
        }
        static slerp(a, b, t, fourDMode) {
            let cosf = a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;
            let A, B;
            if (cosf > 0.99999) {
                // linear approxiamtion
                A = 1 - t;
                B = t;
            }
            else {
                if (cosf < -0.99999 && fourDMode) {
                    // 4D rotation but with opposite dir
                    let ortho;
                    if (Math.abs(a.x) < 0.1) {
                        ortho = new Quaternion(1, 0, 0, 0);
                    }
                    else {
                        ortho = new Quaternion(0, 1, 0, 0);
                    }
                    let dot = a.x * ortho.x + a.y * ortho.y + a.z * ortho.z + a.w * ortho.w;
                    ortho.set(ortho.x - dot * a.x, ortho.y - dot * a.y, ortho.z - dot * a.z, ortho.w - dot * a.w).norms();
                    b = ortho;
                    A = Math.cos(Math.PI * t);
                    B = Math.sin(Math.PI * t);
                }
                else if (cosf < 0 && !fourDMode) {
                    // 3D rotation, inverse Quaternion then slerp
                    let f = Math.acos(-cosf);
                    let _1s = 1 / Math.sin(f);
                    A = Math.sin((1 - t) * f) * _1s;
                    B = -Math.sin(t * f) * _1s;
                }
                else {
                    // just slerp
                    let f = Math.acos(cosf);
                    let _1s = 1 / Math.sin(f);
                    A = Math.sin((1 - t) * f) * _1s;
                    B = Math.sin(t * f) * _1s;
                }
            }
            return new Quaternion(a.x * A + b.x * B, a.y * A + b.y * B, a.z * A + b.z * B, a.w * A + b.w * B);
        }
        toRotateMat() {
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
            return new Mat4(1 - (y2 + z2), xy - wz, xz + wy, 0, xy + wz, 1 - x2 - z2, yz - wx, 0, xz - wy, yz + wx, 1 - x2 - y2, 0, 0, 0, 0, 1);
        }
        toMat3() {
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
            return new Mat3(1 - (y2 + z2), xy - wz, xz + wy, xy + wz, 1 - x2 - z2, yz - wx, xz - wy, yz + wx, 1 - x2 - y2);
        }
        toLMat4() {
            return new Mat4(this.x, -this.y, -this.z, -this.w, this.y, this.x, -this.w, this.z, this.z, this.w, this.x, -this.y, this.w, -this.z, this.y, this.x);
        }
        toRMat4() {
            return new Mat4(this.x, -this.y, -this.z, -this.w, this.y, this.x, this.w, -this.z, this.z, -this.w, this.x, this.y, this.w, this.z, -this.y, this.x);
        }
        expset(v) {
            let g = v.norm() * 0.5;
            let s = Math.abs(g) > 0.005 ? Math.sin(g) / g * 0.5 : 0.5 - g * g / 12;
            return this.set(Math.cos(g), s * v.x, s * v.y, s * v.z);
        }
        distanceTo(p) {
            return Math.hypot(p.x - this.x, p.y - this.y, p.z - this.z, p.w - this.w);
        }
        distanceSqrTo(p) {
            let x = p.x - this.x, y = p.y - this.y, z = p.z - this.z, w = p.w - this.w;
            return x * x + y * y + z * z + w * w;
        }
        static rand() {
            let a = Math.random() * _360;
            let b = Math.random() * _360;
            let c = Math.random();
            let sc = Math.sqrt(c);
            let cc = Math.sqrt(1 - c);
            return new Quaternion(sc * Math.cos(a), sc * Math.sin(a), cc * Math.cos(b), cc * Math.sin(b));
        }
        static srand(seed) {
            let a = seed.nextf() * _360;
            let b = seed.nextf() * _360;
            let c = seed.nextf();
            let sc = Math.sqrt(c);
            let cc = Math.sqrt(1 - c);
            return new Quaternion(sc * Math.cos(a), sc * Math.sin(a), cc * Math.cos(b), cc * Math.sin(b));
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
        /** "from" and "to" must be normalized vectors*/
        static lookAt(from, to) {
            let right = _vec3.wedgeset(from, to);
            let s = right.norm();
            let c = from.dot(to);
            if (s > 0.000001) { // not aligned
                right.mulfs(Math.atan2(s, c) / s);
            }
            else if (c < 0) { // almost n reversely aligned
                let v = _vec3_1.wedgeset(from, Vec3.x);
                if (v.norm1() < 0.01) {
                    v = _vec3_1.wedgeset(from, Vec3.y);
                }
                return v.norms().mulfs(_180).exp();
            }
            return right.exp();
        }
        setFromLookAt(from, to) {
            let right = _vec3.wedgeset(from, to);
            let s = right.norm();
            let c = from.dot(to);
            if (s > 0.000001) { // not aligned
                right.mulfs(Math.atan2(s, c) / s);
            }
            else if (c < 0) { // almost n reversely aligned
                let v = _vec3_1.wedgeset(from, Vec3.x);
                if (v.norm1() < 0.01) {
                    v = _vec3_1.wedgeset(from, Vec3.y);
                }
                return this.expset(v.norms().mulfs(_180));
            }
            return this.expset(right);
        }
        pushPool(pool = quaternionPool) {
            pool.push(this);
        }
        /** set rotor from a rotation matrix,
             * i.e. m must be orthogonal with determinant 1.
             * algorithm: iteratively aligne each axis. */
        setFromMat3(m) {
            return this.setFromLookAt(Vec3.x, m.x_()).mulsl(_Q.setFromLookAt(_vec3_2.copy(Vec3.y).rotates(this), m.y_()));
        }
    }
    let _Q = new Quaternion();
    let _Q_1 = new Quaternion();
    let _Q_2 = new Quaternion();

    class RotorPool extends Pool {
        constructObject() { return new Rotor; }
    }
    const rotorPool = new RotorPool;
    class Rotor {
        l;
        r;
        constructor(l = new Quaternion(), r = new Quaternion()) {
            this.l = l;
            this.r = r;
        }
        set() {
            this.l.set();
            this.r.set();
        }
        clone() {
            return new Rotor(this.l.clone(), this.r.clone());
        }
        copy(r) {
            this.l.copy(r.l);
            this.r.copy(r.r);
            return this;
        }
        conj() {
            return new Rotor(this.l.conj(), this.r.conj());
        }
        conjs() {
            this.l.conjs(), this.r.conjs();
            return this;
        }
        norms() {
            this.l.norms();
            this.r.norms();
            return this;
        }
        /** Apply this to R: this * R;
         *
         * [this.l * R.l, R.r * this.r]; */
        mul(R) {
            return new Rotor(this.l.mul(R.l), R.r.mul(this.r));
        }
        /** Apply this to R: this = this * R;
         *
         * [this.l, this.r] = [this.l * R.l, R.r * this.r]; */
        mulsr(R) {
            this.l.mulsr(R.l);
            this.r.mulsl(R.r);
            return this;
        }
        /** Apply R to this: this = R * this;
         *
         * [this.l, this.r] = [R.l * this.l, this.r * R.r]; */
        mulsl(R) {
            this.l.mulsl(R.l);
            this.r.mulsr(R.r);
            return this;
        }
        /** Apply this to R: this = this * conj(R);
         *
         * [this.l, this.r] = [this.l * conj(R.l), conj(R.r) * this.r]; */
        mulsrconj(R) {
            this.l.mulsrconj(R.l);
            this.r.mulslconj(R.r);
            return this;
        }
        /** Apply R to this: this = conj(R) * this;
         *
         * [this.l, this.r] = [conj(R.l) * this.l, this.r * conj(R.r)]; */
        mulslconj(R) {
            this.l.mulslconj(R.l);
            this.r.mulsrconj(R.r);
            return this;
        }
        sqrt() {
            return new Rotor(this.l.sqrt(), this.r.sqrt());
        }
        isFinite() {
            return (isFinite(this.l.x) && isFinite(this.l.y) && isFinite(this.l.z) && isFinite(this.l.w) &&
                isFinite(this.r.x) && isFinite(this.r.y) && isFinite(this.r.z) && isFinite(this.r.w));
        }
        expset(bivec) {
            let A = _vec3_1.set(bivec.xy + bivec.zw, bivec.xz - bivec.yw, bivec.xw + bivec.yz);
            let B = _vec3_2.set(bivec.xy - bivec.zw, bivec.xz + bivec.yw, bivec.xw - bivec.yz);
            let a = A.norm();
            let b = B.norm();
            let aa = a * 0.5;
            let bb = b * 0.5;
            let sa = (a > 0.005 ? Math.sin(aa) / a : 0.5 - a * a / 12);
            let sb = (b > 0.005 ? Math.sin(bb) / b : 0.5 - b * b / 12);
            this.l.set(Math.cos(aa), sa * A.x, sa * A.y, sa * A.z);
            this.r.set(Math.cos(bb), sb * B.x, sb * B.y, sb * B.z);
            return this;
        }
        log() {
            let a, b;
            if (Math.abs(this.l.x) > 0.9999) {
                a = this.l.yzw();
            }
            else {
                let ls = Math.acos(this.l.x);
                a = this.l.yzw().mulfs(ls / Math.sin(ls));
            }
            if (Math.abs(this.r.x) > 0.9999) {
                b = this.r.yzw();
            }
            else {
                let rs = Math.acos(this.r.x);
                b = this.r.yzw().mulfs(rs / Math.sin(rs));
            }
            return new Bivec(a.x + b.x, a.y + b.y, a.z + b.z, a.z - b.z, b.y - a.y, a.x - b.x);
        }
        static slerp(a, b, t) {
            let l = a.l.x * b.l.x + a.l.y * b.l.y + a.l.z * b.l.z + a.l.w * b.l.w;
            let r = a.r.x * b.r.x + a.r.y * b.r.y + a.r.z * b.r.z + a.r.w * b.r.w;
            if ((l < 0 && r < 0) || (l < 0 && -l > r) || (r < 0 && -r > l)) {
                const r = new Rotor(Quaternion.slerp(a.l, b.l.negs(), t, true), Quaternion.slerp(a.r, b.r.negs(), t, true));
                b.l.negs();
                b.r.negs();
                return r;
            }
            return new Rotor(Quaternion.slerp(a.l, b.l, t, true), Quaternion.slerp(a.r, b.r, t, true));
        }
        toMat4() {
            return this.l.toLMat4().mulsr(_mat4.setFromQuaternionR(this.r));
        }
        /** set rotor from a rotation matrix,
         * i.e. m must be orthogonal with determinant 1.
         * algorithm: iteratively aligne each axis. */
        setFromMat4(m) {
            return this.setFromLookAt(Vec4.x, m.x_()).mulsl(_r$1.setFromLookAt(_vec4$3.copy(Vec4.y).rotates(this), m.y_())).mulsl(_r$1.setFromLookAt(_vec4$3.copy(Vec4.z).rotates(this), m.z_()));
        }
        /** Rotor: rotate from plane1 to plane2
         *  Bivectors must be simple and normalised */
        static lookAtbb(from, to) {
            let A1 = _vec3_2.set(from.xy + from.zw, from.xz - from.yw, from.xw + from.yz);
            let B1 = _vec3_3.set(from.xy - from.zw, from.xz + from.yw, from.xw - from.yz);
            let A2 = _vec3_4.set(to.xy + to.zw, to.xz - to.yw, to.xw + to.yz);
            let B2 = _vec3_5.set(to.xy - to.zw, to.xz + to.yw, to.xw - to.yz);
            return new Rotor(Quaternion.lookAt(A1, A2), Quaternion.lookAt(B2, B1));
        }
        /** plane must be a unit simple vector, if not, use Bivec.exp() instead
         * angle1 is rotation angle on the plane
         * angle2 is rotatoin angle on the perpendicular plane (right handed, eg: exy + ezw)
        */
        static fromPlane(plane, angle1, angle2 = 0) {
            let a = (angle1 + angle2) * 0.5, sa = Math.sin(a);
            let b = (angle1 - angle2) * 0.5, sb = Math.sin(b);
            return new Rotor(// norm of half of A is 1
            new Quaternion(Math.cos(a), sa * (plane.xy + plane.zw), sa * (plane.xz - plane.yw), sa * (plane.xw + plane.yz)), new Quaternion(Math.cos(b), sb * (plane.xy - plane.zw), sb * (plane.xz + plane.yw), sb * (plane.xw - plane.yz)));
        }
        /** "from" and "to" must be normalized vectors*/
        static lookAt(from, to) {
            let right = _bivec.wedgevvset(from, to);
            let s = right.norm();
            let c = from.dot(to);
            if (s > 0.000001) { // not aligned
                right.mulfs(Math.atan2(s, c) / s);
            }
            else if (c < 0) { // almost n reversely aligned
                let v = _bivec.wedgevvset(from, Vec4.x);
                if (v.norm1() < 0.01) {
                    v = _bivec.wedgevvset(from, Vec4.y);
                }
                return v.norms().mulfs(_180).exp();
            }
            return right.exp();
        }
        // todo: lookAtvb(from: Vec4, to: Bivec): Rotor dir to plane or reverse
        static lookAtvb(from, to) {
            let toVect = _vec4$3.copy(from).projbs(to).norms();
            return Rotor.lookAt(from, toVect);
        }
        /** "from" and "to" must be normalized vectors */
        setFromLookAt(from, to) {
            let right = _bivec.wedgevvset(from, to);
            let s = right.norm();
            let c = from.dot(to);
            if (s > 0.000001) { // not aligned
                right.mulfs(Math.atan2(s, c) / s);
            }
            else if (c < 0) { // almost n reversely aligned
                let v = _bivec.wedgevvset(from, Vec4.x);
                if (v.norm1() < 0.01) {
                    v = _bivec.wedgevvset(from, Vec4.y);
                }
                return this.expset(v.norms().mulfs(_180));
            }
            return this.expset(right);
        }
        distanceSqrTo(r) {
            return this.l.distanceSqrTo(r.l) + this.r.distanceSqrTo(r.r);
        }
        static rand() {
            return new Rotor(Quaternion.rand(), Quaternion.rand());
        }
        static srand(seed) {
            return new Rotor(Quaternion.srand(seed), Quaternion.srand(seed));
        }
        randset() {
            this.l.randset();
            this.r.randset();
            return this;
        }
        srandset(seed) {
            this.l.srandset(seed);
            this.r.srandset(seed);
            return this;
        }
        pushPool(pool = rotorPool) {
            pool.push(this);
        }
    }
    let _r$1 = new Rotor();

    class BivecPool extends Pool {
        constructObject() { return new Bivec; }
    }
    const bivecPool = new BivecPool;
    class Bivec {
        xy;
        xz;
        xw;
        yz;
        yw;
        zw;
        static xy = Object.freeze(new Bivec(1, 0, 0, 0, 0, 0));
        static xz = Object.freeze(new Bivec(0, 1, 0, 0, 0, 0));
        static xw = Object.freeze(new Bivec(0, 0, 1, 0, 0, 0));
        static yz = Object.freeze(new Bivec(0, 0, 0, 1, 0, 0));
        static yw = Object.freeze(new Bivec(0, 0, 0, 0, 1, 0));
        static zw = Object.freeze(new Bivec(0, 0, 0, 0, 0, 1));
        static yx = Object.freeze(new Bivec(-1, 0, 0, 0, 0, 0));
        static zx = Object.freeze(new Bivec(0, -1, 0, 0, 0, 0));
        static wx = Object.freeze(new Bivec(0, 0, -1, 0, 0, 0));
        static zy = Object.freeze(new Bivec(0, 0, 0, -1, 0, 0));
        static wy = Object.freeze(new Bivec(0, 0, 0, 0, -1, 0));
        static wz = Object.freeze(new Bivec(0, 0, 0, 0, 0, -1));
        isFinite() {
            return isFinite(this.xy) && isFinite(this.xz) && isFinite(this.xw) && isFinite(this.yz) && isFinite(this.yw) && isFinite(this.zw);
        }
        constructor(xy = 0, xz = 0, xw = 0, yz = 0, yw = 0, zw = 0) {
            this.xy = xy;
            this.xz = xz;
            this.xw = xw;
            this.yz = yz;
            this.yw = yw;
            this.zw = zw;
        }
        copy(v) {
            this.xy = v.xy;
            this.xz = v.xz;
            this.xw = v.xw;
            this.yz = v.yz;
            this.yw = v.yw;
            this.zw = v.zw;
            return this;
        }
        set(xy = 0, xz = 0, xw = 0, yz = 0, yw = 0, zw = 0) {
            this.xy = xy;
            this.xz = xz;
            this.xw = xw;
            this.yz = yz;
            this.yw = yw;
            this.zw = zw;
            return this;
        }
        clone() {
            return new Bivec(this.xy, this.xz, this.xw, this.yz, this.yw, this.zw);
        }
        flat() {
            return [this.xy, this.xz, this.xw, this.yz, this.yw, this.zw];
        }
        add(bv) {
            return new Bivec(this.xy + bv.xy, this.xz + bv.xz, this.xw + bv.xw, this.yz + bv.yz, this.yw + bv.yw, this.zw + bv.zw);
        }
        adds(bv) {
            this.xy += bv.xy;
            this.xz += bv.xz;
            this.xw += bv.xw;
            this.yz += bv.yz;
            this.yw += bv.yw;
            this.zw += bv.zw;
            return this;
        }
        addset(bv1, bv2) {
            return this.set(bv1.xy + bv2.xy, bv1.xz + bv2.xz, bv1.xw + bv2.xw, bv1.yz + bv2.yz, bv1.yw + bv2.yw, bv1.zw + bv2.zw);
        }
        addmulfs(bv, k) {
            this.xy += bv.xy * k;
            this.xz += bv.xz * k;
            this.xw += bv.xw * k;
            this.yz += bv.yz * k;
            this.yw += bv.yw * k;
            this.zw += bv.zw * k;
            return this;
        }
        neg() {
            return new Bivec(-this.xy, -this.xz, -this.xw, -this.yz, -this.yw, -this.zw);
        }
        negs() {
            this.xy = -this.xy;
            this.xz = -this.xz;
            this.xw = -this.xw;
            this.yz = -this.yz;
            this.yw = -this.yw;
            this.zw = -this.zw;
            return this;
        }
        sub(bv) {
            return new Bivec(this.xy - bv.xy, this.xz - bv.xz, this.xw - bv.xw, this.yz - bv.yz, this.yw - bv.yw, this.zw - bv.zw);
        }
        subs(bv) {
            this.xy -= bv.xy;
            this.xz -= bv.xz;
            this.xw -= bv.xw;
            this.yz -= bv.yz;
            this.yw -= bv.yw;
            this.zw -= bv.zw;
            return this;
        }
        subset(bv1, bv2) {
            return this.set(bv1.xy - bv2.xy, bv1.xz - bv2.xz, bv1.xw - bv2.xw, bv1.yz - bv2.yz, bv1.yw - bv2.yw, bv1.zw - bv2.zw);
        }
        mulf(k) {
            return new Bivec(k * this.xy, k * this.xz, k * this.xw, k * this.yz, k * this.yw, k * this.zw);
        }
        mulfs(k) {
            this.xy *= k;
            this.xz *= k;
            this.xw *= k;
            this.yz *= k;
            this.yw *= k;
            this.zw *= k;
            return this;
        }
        divf(k) {
            k = 1 / k;
            return new Bivec(k * this.xy, k * this.xz, k * this.xw, k * this.yz, k * this.yw, k * this.zw);
        }
        divfs(k) {
            k = 1 / k;
            this.xy *= k;
            this.xz *= k;
            this.xw *= k;
            this.yz *= k;
            this.yw *= k;
            this.zw *= k;
            return this;
        }
        dot(biv) {
            return this.xy * biv.xy + this.yz * biv.yz + this.zw * biv.zw + this.xw * biv.xw + this.xz * biv.xz + this.yw * biv.yw;
        }
        norm() {
            return Math.sqrt(this.xy * this.xy + this.xz * this.xz + this.yz * this.yz + this.yw * this.yw + this.zw * this.zw + this.xw * this.xw);
        }
        norms() {
            let k = Math.sqrt(this.xy * this.xy + this.xz * this.xz + this.yz * this.yz + this.yw * this.yw + this.zw * this.zw + this.xw * this.xw);
            k = k == 0 ? 0 : (1 / k);
            this.xy *= k;
            this.xz *= k;
            this.xw *= k;
            this.yz *= k;
            this.yw *= k;
            this.zw *= k;
            return this;
        }
        normsqr() {
            return this.xy * this.xy + this.xz * this.xz + this.yz * this.yz + this.yw * this.yw + this.zw * this.zw + this.xw * this.xw;
        }
        norm1() {
            return Math.abs(this.xy) + Math.abs(this.xz) + Math.abs(this.xw) + Math.abs(this.yz) + Math.abs(this.yw) + Math.abs(this.zw);
        }
        wedge(biv) {
            return this.xy * biv.zw - this.xz * biv.yw + this.xw * biv.yz + this.yz * biv.xw - this.yw * biv.xz + this.zw * biv.xy;
        }
        dual() {
            return new Bivec(this.zw, -this.yw, this.yz, this.xw, -this.xz, this.xy);
        }
        duals() {
            var temp;
            temp = this.xy;
            this.xy = this.zw;
            this.zw = temp;
            temp = this.xz;
            this.xz = -this.yw;
            this.yw = -temp;
            temp = this.xw;
            this.xw = this.yz;
            this.yz = temp;
            return this;
        }
        wedgev(V) {
            return new Vec4(-this.yz * V.w - this.zw * V.y + this.yw * V.z, this.xz * V.w + this.zw * V.x - this.xw * V.z, -this.xy * V.w - this.yw * V.x + this.xw * V.y, this.xy * V.z + this.yz * V.x - this.xz * V.y);
        }
        wedgevvset(v1, v2) {
            return this.set(v1.x * v2.y - v1.y * v2.x, v1.x * v2.z - v1.z * v2.x, v1.x * v2.w - v1.w * v2.x, v1.y * v2.z - v1.z * v2.y, v1.y * v2.w - v1.w * v2.y, v1.z * v2.w - v1.w * v2.z);
        }
        /** Vector part of Geometry Product
         * exy * ey = ex, exy * ex = -ey, exy * ez = 0
         *  */
        dotv(V) {
            return new Vec4(this.xy * V.y + this.xz * V.z + this.xw * V.w, -this.xy * V.x + this.yz * V.z + this.yw * V.w, -this.xz * V.x - this.yz * V.y + this.zw * V.w, -this.xw * V.x - this.yw * V.y - this.zw * V.z);
        }
        cross(V) {
            return new Bivec(V.xz * this.yz - this.xz * V.yz + V.xw * this.yw - this.xw * V.yw, -V.xy * this.yz + this.xy * V.yz + V.xw * this.zw - this.xw * V.zw, -V.xy * this.yw + this.xy * V.yw - V.xz * this.zw + this.xz * V.zw, V.xy * this.xz - this.xy * V.xz + V.yw * this.zw - this.yw * V.zw, V.xy * this.xw - this.xy * V.xw - V.yz * this.zw + this.yz * V.zw, V.xz * this.xw - this.xz * V.xw + V.yz * this.yw - this.yz * V.yw);
        }
        crossset(b1, b2) {
            return this.set(b2.xz * b1.yz - b1.xz * b2.yz + b2.xw * b1.yw - b1.xw * b2.yw, -b2.xy * b1.yz + b1.xy * b2.yz + b2.xw * b1.zw - b1.xw * b2.zw, -b2.xy * b1.yw + b1.xy * b2.yw - b2.xz * b1.zw + b1.xz * b2.zw, b2.xy * b1.xz - b1.xy * b2.xz + b2.yw * b1.zw - b1.yw * b2.zw, b2.xy * b1.xw - b1.xy * b2.xw - b2.yz * b1.zw + b1.yz * b2.zw, b2.xz * b1.xw - b1.xz * b2.xw + b2.yz * b1.yw - b1.yz * b2.yw);
        }
        crossrs(V) {
            return this.set(V.xz * this.yz - this.xz * V.yz + V.xw * this.yw - this.xw * V.yw, -V.xy * this.yz + this.xy * V.yz + V.xw * this.zw - this.xw * V.zw, -V.xy * this.yw + this.xy * V.yw - V.xz * this.zw + this.xz * V.zw, V.xy * this.xz - this.xy * V.xz + V.yw * this.zw - this.yw * V.zw, V.xy * this.xw - this.xy * V.xw - V.yz * this.zw + this.yz * V.zw, V.xz * this.xw - this.xz * V.xw + V.yz * this.yw - this.yz * V.yw);
        }
        exp() {
            // Hodge Dual decompose this to:
            // A : self-dual part (*A = A)
            // B : antiself-dual part (*B = -B)
            // two parts are commutive, corresponded to QL and QR
            // 1. If this is simple rotation of angle theta:
            //   exy*(theta) represents rotate from x to y by angle theta
            //   this can be divided into theta/2 of QL and QR rotation
            //   A and B has norm of theta, so div 2
            //   Quaternion formula: Q(cos, sin * vec3), vec3 is a unit vector
            // 2. if this is right-handed isoclinic rotation of angle theta,
            //   we use (exy + ezw)*(theta) to represent it
            //   it's easy to verify that norm(A) = 2*theta, norm(B) = 0
            //   then the same as simple rotation
            let A = new Vec3(this.xy + this.zw, this.xz - this.yw, this.xw + this.yz);
            let B = new Vec3(this.xy - this.zw, this.xz + this.yw, this.xw - this.yz);
            let a = A.norm();
            let b = B.norm();
            let aa = a * 0.5;
            let bb = b * 0.5;
            let sa = (a > 0.005 ? Math.sin(aa) / a : 0.5 - a * a / 12);
            let sb = (b > 0.005 ? Math.sin(bb) / b : 0.5 - b * b / 12);
            return new Rotor(new Quaternion(Math.cos(aa), sa * A.x, sa * A.y, sa * A.z), new Quaternion(Math.cos(bb), sb * B.x, sb * B.y, sb * B.z));
        }
        /** return two angles [max, min] between a and b
         * "a" and "b" must be normalized simple bivectors*/
        static angle(a, b) {
            let cc = a.dot(b);
            let ss = a.wedge(b);
            let ccpss = cc + ss;
            let ccmss = cc - ss;
            if (Math.abs(ccpss) > 1)
                ccpss = Math.sign(ccpss);
            if (Math.abs(ccmss) > 1)
                ccmss = Math.sign(ccmss);
            let sub = Math.acos(ccpss);
            let add = Math.acos(ccmss);
            return [(add + sub) * 0.5, (add - sub) * 0.5];
        }
        rotate(r) {
            // a novel method to calculate bivec rotation using isoclinic decomposition
            let A = _Q_1.set(0, this.xy + this.zw, this.xz - this.yw, this.xw + this.yz);
            let B = _Q_2.set(0, this.xy - this.zw, this.xz + this.yw, this.xw - this.yz);
            // self-dual bivec is invariant under rotation generated by antiself-dual bivec
            // so we only compute A * r.l and B * r.r
            // rotating with 3 bases in A, B respectly behave like rotation in two 3D spaces respectly
            // so we use 3D quaternion rotation formula
            A.mulsl(r.l).mulsrconj(r.l);
            B.mulslconj(r.r).mulsr(r.r);
            // recover from isoclinic representation
            return new Bivec(A.y + B.y, A.z + B.z, A.w + B.w, A.w - B.w, B.z - A.z, A.y - B.y).mulfs(0.5);
        }
        rotates(r) {
            let A = _Q_1.set(0, this.xy + this.zw, this.xz - this.yw, this.xw + this.yz);
            let B = _Q_2.set(0, this.xy - this.zw, this.xz + this.yw, this.xw - this.yz);
            A.mulsl(r.l).mulsrconj(r.l);
            B.mulslconj(r.r).mulsr(r.r);
            this.xy = (A.y + B.y) * 0.5;
            this.xz = (A.z + B.z) * 0.5;
            this.xw = (A.w + B.w) * 0.5;
            this.yz = (A.w - B.w) * 0.5;
            this.yw = (B.z - A.z) * 0.5;
            this.zw = (A.y - B.y) * 0.5;
            return this;
        }
        rotatesconj(r) {
            let A = _Q_1.set(0, this.xy + this.zw, this.xz - this.yw, this.xw + this.yz);
            let B = _Q_2.set(0, this.xy - this.zw, this.xz + this.yw, this.xw - this.yz);
            A.mulslconj(r.l).mulsr(r.l);
            B.mulsl(r.r).mulsrconj(r.r);
            this.xy = (A.y + B.y) * 0.5;
            this.xz = (A.z + B.z) * 0.5;
            this.xw = (A.w + B.w) * 0.5;
            this.yz = (A.w - B.w) * 0.5;
            this.yw = (B.z - A.z) * 0.5;
            this.zw = (A.y - B.y) * 0.5;
            return this;
        }
        rotateset(bivec, r) {
            let A = _Q_1.set(0, bivec.xy + bivec.zw, bivec.xz - bivec.yw, bivec.xw + bivec.yz);
            let B = _Q_2.set(0, bivec.xy - bivec.zw, bivec.xz + bivec.yw, bivec.xw - bivec.yz);
            A.mulsl(r.l).mulsrconj(r.l);
            B.mulslconj(r.r).mulsr(r.r);
            this.xy = (A.y + B.y) * 0.5;
            this.xz = (A.z + B.z) * 0.5;
            this.xw = (A.w + B.w) * 0.5;
            this.yz = (A.w - B.w) * 0.5;
            this.yw = (B.z - A.z) * 0.5;
            this.zw = (A.y - B.y) * 0.5;
            return this;
        }
        rotateconjset(bivec, r) {
            let A = _Q_1.set(0, bivec.xy + bivec.zw, bivec.xz - bivec.yw, bivec.xw + bivec.yz);
            let B = _Q_2.set(0, bivec.xy - bivec.zw, bivec.xz + bivec.yw, bivec.xw - bivec.yz);
            A.mulslconj(r.l).mulsr(r.l);
            B.mulsl(r.r).mulsrconj(r.r);
            this.xy = (A.y + B.y) * 0.5;
            this.xz = (A.z + B.z) * 0.5;
            this.xw = (A.w + B.w) * 0.5;
            this.yz = (A.w - B.w) * 0.5;
            this.yw = (B.z - A.z) * 0.5;
            this.zw = (A.y - B.y) * 0.5;
            return this;
        }
        /** return a random oriented simple normalized bivector */
        static rand() {
            // sampled in isoclinic space uniformly for left and right part respectively
            let a = _vec3_1.randset().mulfs(0.5);
            let b = _vec3_2.randset().mulfs(0.5);
            return new Bivec(a.x + b.x, a.y + b.y, a.z + b.z, a.z - b.z, b.y - a.y, a.x - b.x);
        }
        randset() {
            // sampled in isoclinic space uniformly for left and right part respectively
            let a = _vec3_1.randset().mulfs(0.5);
            let b = _vec3_2.randset().mulfs(0.5);
            return this.set(a.x + b.x, a.y + b.y, a.z + b.z, a.z - b.z, b.y - a.y, a.x - b.x);
        }
        /** return a random oriented simple normalized bivector by seed */
        static srand(seed) {
            let a = _vec3_1.srandset(seed).mulfs(0.5);
            let b = _vec3_2.srandset(seed).mulfs(0.5);
            return new Bivec(a.x + b.x, a.y + b.y, a.z + b.z, a.z - b.z, b.y - a.y, a.x - b.x);
        }
        srandset(seed) {
            let a = _vec3_1.srandset(seed).mulfs(0.5);
            let b = _vec3_2.srandset(seed).mulfs(0.5);
            return this.set(a.x + b.x, a.y + b.y, a.z + b.z, a.z - b.z, b.y - a.y, a.x - b.x);
        }
        pushPool(pool = bivecPool) {
            pool.push(this);
        }
    }
    let _bivec = new Bivec();

    class Vec4Pool extends Pool {
        constructObject() { return new Vec4; }
    }
    const vec4Pool = new Vec4Pool;
    class Vec4 {
        x;
        y;
        z;
        w;
        static x = Object.freeze(new Vec4(1, 0, 0, 0));
        static y = Object.freeze(new Vec4(0, 1, 0, 0));
        static z = Object.freeze(new Vec4(0, 0, 1, 0));
        static w = Object.freeze(new Vec4(0, 0, 0, 1));
        static origin = Object.freeze(new Vec4(0, 0, 0, 0));
        static xNeg = Object.freeze(new Vec4(-1, 0, 0, 0));
        static yNeg = Object.freeze(new Vec4(0, -1, 0, 0));
        static zNeg = Object.freeze(new Vec4(0, 0, -1, 0));
        static wNeg = Object.freeze(new Vec4(0, 0, 0, -1));
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
    let _vec4$3 = new Vec4();
    let _vec4_1 = new Vec4();

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

    class Srand {
        _seed;
        constructor(seed) {
            if (Math.floor(seed) !== seed) {
                seed = Math.floor(0x6D2B79F5 * seed);
            }
            this._seed = seed;
        }
        set(seed) {
            this._seed = seed;
        }
        /** return a random float in [0,1] */
        nextf() {
            let t = this._seed += 0x6D2B79F5;
            t = Math.imul(t ^ t >>> 15, t | 1);
            t ^= t + Math.imul(t ^ t >>> 7, t | 61);
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        }
        /** return a random int of [0,n-1] if n is given, else range is same as int */
        nexti(n) {
            let t = this._seed += 0x6D2B79F5;
            t = Math.imul(t ^ t >>> 15, t | 1);
            t ^= t + Math.imul(t ^ t >>> 7, t | 61);
            return (n === undefined) ? ((t ^ t >>> 14) >>> 0) : ((t ^ t >>> 14) >>> 0) % n;
        }
    }
    // https://github.com/mrdoob/three.js/blob/dev/src/math/MathUtils.js
    const _lut = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '0a', '0b', '0c', '0d', '0e', '0f', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '1a', '1b', '1c', '1d', '1e', '1f', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '2a', '2b', '2c', '2d', '2e', '2f', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '3a', '3b', '3c', '3d', '3e', '3f', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '4a', '4b', '4c', '4d', '4e', '4f', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '5a', '5b', '5c', '5d', '5e', '5f', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '6a', '6b', '6c', '6d', '6e', '6f', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '7a', '7b', '7c', '7d', '7e', '7f', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '8a', '8b', '8c', '8d', '8e', '8f', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99', '9a', '9b', '9c', '9d', '9e', '9f', 'a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a9', 'aa', 'ab', 'ac', 'ad', 'ae', 'af', 'b0', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9', 'ba', 'bb', 'bc', 'bd', 'be', 'bf', 'c0', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'ca', 'cb', 'cc', 'cd', 'ce', 'cf', 'd0', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'da', 'db', 'dc', 'dd', 'de', 'df', 'e0', 'e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8', 'e9', 'ea', 'eb', 'ec', 'ed', 'ee', 'ef', 'f0', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'fa', 'fb', 'fc', 'fd', 'fe', 'ff'];
    // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136
    function generateUUID() {
        const d0 = Math.random() * 0xffffffff | 0;
        const d1 = Math.random() * 0xffffffff | 0;
        const d2 = Math.random() * 0xffffffff | 0;
        const d3 = Math.random() * 0xffffffff | 0;
        const uuid = _lut[d0 & 0xff] + _lut[d0 >> 8 & 0xff] + _lut[d0 >> 16 & 0xff] + _lut[d0 >> 24 & 0xff] + '-' +
            _lut[d1 & 0xff] + _lut[d1 >> 8 & 0xff] + '-' + _lut[d1 >> 16 & 0x0f | 0x40] + _lut[d1 >> 24 & 0xff] + '-' +
            _lut[d2 & 0x3f | 0x80] + _lut[d2 >> 8 & 0xff] + '-' + _lut[d2 >> 16 & 0xff] + _lut[d2 >> 24 & 0xff] +
            _lut[d3 & 0xff] + _lut[d3 >> 8 & 0xff] + _lut[d3 >> 16 & 0xff] + _lut[d3 >> 24 & 0xff];
        // .toLowerCase() here flattens concatenated strings to save heap memory space.
        return uuid.toLowerCase();
    }

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

    class Complex {
        re;
        im;
        static i = new Complex(0, 1);
        constructor(re = 0, im = 0) {
            this.re = re;
            this.im = im;
        }
        flat() {
            return [this.re, this.im];
        }
        set(v) {
            this.re = v.re;
            this.im = v.im;
            return this;
        }
        setv(v) {
            this.re = v.x;
            this.im = v.y;
            return this;
        }
        clone() {
            return new Complex(this.re, this.im);
        }
        add(v2) {
            return new Complex(this.re + v2.re, this.im + v2.im);
        }
        addf(v2) {
            return new Complex(this.re + v2, this.im);
        }
        adds(v2) {
            this.re += v2.re;
            this.im += v2.im;
            return this;
        }
        addfs(v2) {
            this.re += v2;
            return this;
        }
        neg() {
            return new Complex(-this.re, -this.im);
        }
        negs() {
            this.re = -this.re;
            this.im = -this.im;
            return this;
        }
        sub(v2) {
            return new Complex(this.re - v2.re, this.im - v2.im);
        }
        subf(v2) {
            return new Complex(this.re - v2, this.im);
        }
        subs(v2) {
            this.re -= v2.re;
            this.im -= v2.im;
            return this;
        }
        subfs(v2) {
            this.re -= v2;
            return this;
        }
        mulf(v2) {
            return new Complex(this.re * v2, this.im * v2);
        }
        mulfs(v2) {
            this.re *= v2;
            this.im *= v2;
            return this;
        }
        mul(k) {
            return new Complex(this.re * k.re - k.im * this.im, this.re * k.im + k.re * this.im);
        }
        muls(k) {
            let re = this.re * k.re - k.im * this.im;
            this.im = this.re * k.im + k.re * this.im;
            this.re = re;
            return this;
        }
        divf(v2) {
            v2 = 1 / v2;
            return new Complex(this.re * v2, this.im * v2);
        }
        divfs(v2) {
            v2 = 1 / v2;
            this.re *= v2;
            this.im *= v2;
            return this;
        }
        div(k) {
            let n = 1 / (k.re * k.re + k.im * k.im);
            return new Complex((this.re * k.re + k.im * this.im) * n, (k.re * this.im - this.re * k.im) * n);
        }
        divs(k) {
            let n = 1 / (k.re * k.re + k.im * k.im);
            let im = (k.re * this.im - this.re * k.im) * n;
            this.re = (this.re * k.re + k.im * this.im) * n;
            this.im = im;
            return this;
        }
        dot(v2) {
            return this.re * v2.re + this.im * v2.im;
        }
        norm() {
            return Math.sqrt(this.re * this.re + this.im * this.im);
        }
        norms() {
            let v2 = Math.sqrt(this.re * this.re + this.im * this.im);
            v2 = v2 == 0 ? 0 : (1 / v2);
            this.re *= v2;
            this.im *= v2;
            return this;
        }
        normsqr() {
            return this.re * this.re + this.im * this.im;
        }
        conj() {
            return new Complex(this.re, -this.im);
        }
        conjs() {
            this.im = -this.im;
            return this;
        }
        exp() {
            let r = Math.exp(this.re);
            return new Complex(Math.cos(this.im) * r, Math.sin(this.im) * r);
        }
        exps() {
            let r = Math.exp(this.re);
            this.re = Math.cos(this.im) * r;
            this.im = Math.sin(this.im) * r;
            return this;
        }
        arg() {
            return Math.atan2(this.im, this.re);
        }
        log() {
            return new Complex(Math.log(this.re * this.re + this.im * this.im) / 2, Math.atan2(this.im, this.re));
        }
        logs() {
            let a = Math.atan2(this.im, this.re);
            this.re = Math.log(this.re * this.re + this.im * this.im) / 2;
            this.im = a;
            return this;
        }
        pow(p) {
            return this.log().muls(p).exps();
        }
        powf(n) {
            return this.log().mulfs(n).exps();
        }
        pows(p) {
            return this.logs().muls(p).exps();
        }
        powfs(n) {
            return this.logs().mulfs(n).exps();
        }
    }

    /** [A(4x4), b(1x4)]
     *
     *  [0(4x1), 1(1x1)]
     *
     *  a blocked 5x5 matrix for transform in 4d
     */
    class AffineMat4 {
        mat;
        vec;
        constructor(mat = new Mat4(), vec = new Vec4()) {
            this.mat = mat;
            this.vec = vec;
        }
        writeBuffer(b, offset = 0) {
            this.mat.writeBuffer(b, offset);
            this.vec.writeBuffer(b, offset + 16);
        }
        inv() {
            let m = this.mat.inv();
            return new AffineMat4(m, m.mulv(this.vec).negs());
        }
        invs() {
            this.mat.invs();
            this.vec.copy(this.mat.mulv(this.vec).negs());
            return this;
        }
        mul(m) {
            return new AffineMat4(this.mat.mul(m.mat), this.mat.mulv(m.vec).adds(this.vec));
        }
        /** this = this * m */
        mulsr(m) {
            this.vec.adds(this.mat.mulv(m.vec));
            this.mat.mulsr(m.mat);
            return this;
        }
        /** this = m * this */
        mulsl(m) {
            this.vec.mulmatls(m.mat).adds(m.vec);
            this.mat.mulsl(m.mat);
            return this;
        }
        setFromObj4(o) {
            this.mat.setFromRotor(o.rotation);
            if (o.scale) {
                this.mat.mulsr(Mat4.diag(o.scale.x, o.scale.y, o.scale.z, o.scale.w));
            }
            this.vec.copy(o.position);
            return this;
        }
        setFromObj4inv(o) {
            this.vec.copy(o.position).negs().rotatesconj(o.rotation);
            this.mat.setFromRotorconj(o.rotation);
            if (o.scale) {
                let x = 1 / o.scale.x;
                let y = 1 / o.scale.y;
                let z = 1 / o.scale.z;
                let w = 1 / o.scale.w;
                this.mat.mulsl(Mat4.diag(x, y, z, w));
                this.vec.x *= x;
                this.vec.y *= y;
                this.vec.z *= z;
                this.vec.w *= w;
            }
            return this;
        }
    }
    /** an coordinate transform of rotation translation and scale */
    class Obj4 {
        position;
        rotation;
        scale;
        constructor(position, rotation, scale) {
            this.position = position ?? new Vec4();
            this.rotation = rotation ?? new Rotor();
            this.scale = scale;
        }
        copyObj4(o) {
            if (o.position)
                this.position.copy(o.position);
            if (o.rotation)
                this.rotation.copy(o.rotation);
            if (o.scale) {
                if (!this.scale)
                    this.scale = new Vec4;
                this.scale.copy(o.scale);
            }
            return this;
        }
        local2world(point) {
            if (this.scale)
                return new Vec4(this.scale.x * point.x, this.scale.y * point.y, this.scale.z * point.z, this.scale.w * point.w).rotates(this.rotation).adds(this.position);
            return point.rotate(this.rotation).adds(this.position);
        }
        world2local(point) {
            let a = point.sub(this.position).rotatesconj(this.rotation);
            if (this.scale)
                return new Vec4(a.x / this.scale.x, a.y / this.scale.y, a.z / this.scale.z, a.w / this.scale.w);
            return a;
        }
        getMat4() {
            if (this.scale)
                return this.rotation.toMat4().mul(Mat4.diag(this.scale.x, this.scale.y, this.scale.z, this.scale.w));
            return this.rotation.toMat4();
        }
        getMat4inv() {
            if (this.scale)
                return Mat4.diag(1 / this.scale.x, 1 / this.scale.y, 1 / this.scale.z, 1 / this.scale.w).mul(this.rotation.conj().toMat4());
            return this.rotation.conj().toMat4();
        }
        getAffineMat4() {
            if (this.scale)
                return new AffineMat4(this.rotation.toMat4().mulsr(Mat4.diag(this.scale.x, this.scale.y, this.scale.z, this.scale.w)), this.position.clone());
            return new AffineMat4(this.rotation.toMat4(), this.position.clone());
        }
        getAffineMat4inv() {
            let b = this.position.neg().rotatesconj(this.rotation);
            if (!this.scale)
                return new AffineMat4(this.rotation.conj().toMat4(), b);
            let x = 1 / this.scale.x;
            let y = 1 / this.scale.y;
            let z = 1 / this.scale.z;
            let w = 1 / this.scale.w;
            return new AffineMat4(Mat4.diag(x, y, z, w).mulsr(this.rotation.conj().toMat4()), new Vec4(b.x * x, b.y * y, b.z * z, b.w * w));
        }
        translates(v) {
            this.position.adds(v);
            return this;
        }
        rotates(r) {
            this.rotation.mulsl(r);
            return this;
        }
        rotatesconj(r) {
            this.rotation.mulslconj(r);
            return this;
        }
        rotatesb(b) {
            this.rotation.mulsl(_r$1.expset(b));
            return this;
        }
        rotatesAt(r, center = new Vec4()) {
            this.rotation.mulsl(r);
            this.position.subs(center).rotates(r).adds(center);
            return this;
        }
        lookAt(front, target) {
            let dir = _vec4$3.subset(target, this.position);
            this.rotates(_r$1.setFromLookAt(_vec4_1.copy(front).rotates(this.rotation), dir.norms()));
            return this;
        }
    }

    class CosetTable {
        length = 1;
        p = [0];
        cosets;
        // store int map for letters (e.g. "a" "b" "a'" "b'")
        generatorMap = [];
        generatorInvMap = new Map;
        letters = 0; // equal to generatorMap.length
        // map between integers, ("a" <-> "'a")
        genInvMap = [];
        // int representation of relations and subsets
        relations;
        subsets;
        // convert word to int representation
        parseWord(w) {
            const word = [];
            for (let i = 0; i < w.length; i++) {
                if (w[i + 1] == "'") {
                    word.push(this.generatorInvMap.get(w[i] + "'"));
                    i++;
                }
                else {
                    word.push(this.generatorInvMap.get(w[i]));
                }
            }
            return word;
        }
        constructor(generator, relation, subset) {
            for (const c of generator) {
                this.generatorInvMap.set(c, this.letters++);
                this.generatorMap.push(c);
                if (relation.includes(c + c)) {
                    this.genInvMap[this.letters - 1] = this.letters - 1;
                }
                else {
                    this.genInvMap[this.letters] = this.letters - 1;
                    this.genInvMap[this.letters - 1] = this.letters;
                    this.generatorInvMap.set(c + "'", this.letters++);
                    this.generatorMap.push(c + "'");
                }
            }
            this.relations = relation.map(w => this.parseWord(w));
            this.subsets = subset.map(w => this.parseWord(w));
            this.cosets = [new Array(this.letters)];
        }
        define(coset, gen) {
            this.cosets[coset][gen] = this.length;
            const newLine = new Array(this.letters);
            newLine[this.genInvMap[gen]] = coset;
            this.cosets.push(newLine);
            this.p.push(this.length);
            this.length++;
        }
        coincidence(a, b) {
            const q = [];
            this.merge(a, b, q);
            for (let i = 0; i < q.length; i++) {
                const y = q[i];
                for (let x = 0; x < this.letters; x++) {
                    const d = this.cosets[y][x];
                    if (d !== undefined) {
                        let mu = this.findRep(y);
                        let v = this.findRep(d);
                        let mux = this.cosets[mu][x];
                        if (mux !== undefined) {
                            this.merge(v, mux, q);
                        }
                        else {
                            this.cosets[mu][x] = v;
                        }
                        let vxinv = this.cosets[v][this.genInvMap[x]];
                        if (vxinv !== undefined) {
                            this.merge(mu, vxinv, q);
                        }
                        else {
                            this.cosets[v][this.genInvMap[x]] = mu;
                        }
                    }
                }
            }
        }
        merge(a, b, q) {
            const i1 = this.findRep(a);
            const i2 = this.findRep(b);
            if (i1 !== i2) {
                const u = Math.min(i1, i2);
                const v = Math.max(i1, i2);
                this.p[v] = u;
                q.push(v);
            }
        }
        findRep(k) {
            let l = k;
            let r = this.p[l];
            while (r !== l) {
                l = r;
                r = this.p[l];
            }
            let mu = k;
            r = this.p[mu];
            while (r !== l) {
                this.p[mu] = l;
                mu = r;
                r = this.p[mu];
            }
            return l;
        }
        scanAndFill(coset, relation) {
            const r = relation.length - 1;
            let f = coset;
            let i = 0;
            let b = coset;
            let j = r;
            while (true) {
                let fxi;
                while (i <= r && (fxi = this.cosets[f][relation[i]]) !== undefined) {
                    f = fxi;
                    i++;
                }
                if (i > r) {
                    if (f !== coset)
                        this.coincidence(f, coset);
                    return;
                }
                let bxjinv;
                while (j >= i && (bxjinv = this.cosets[b][this.genInvMap[relation[j]]]) !== undefined) {
                    b = bxjinv;
                    j--;
                }
                if (j < i) {
                    this.coincidence(f, b);
                    return;
                }
                else if (i === j) {
                    this.cosets[b][this.genInvMap[relation[i]]] = f;
                    this.cosets[f][relation[i]] = b;
                    return;
                }
                else {
                    this.define(f, relation[i]);
                }
            }
        }
        enumerate() {
            for (const w of this.subsets) {
                this.scanAndFill(0, w);
            }
            for (let a = 0; a < this.cosets.length; a++) {
                if (this.p[a] !== a)
                    continue;
                for (const w of this.relations) {
                    this.scanAndFill(a, w);
                    if (this.p[a] !== a)
                        break;
                }
                if (this.p[a] !== a)
                    continue;
                for (let x = 0; x < this.letters; x++) {
                    if (this.cosets[a][x] === undefined)
                        this.define(a, x);
                }
            }
            this.compress();
            this.standardize();
            return this;
        }
        compress() {
            let j = 0;
            let p2 = [];
            for (let i = 0; i < this.p.length; i++) {
                if (this.p[i] === i) {
                    p2[i] = j++;
                }
            }
            this.cosets = this.cosets.filter((v, i) => this.p[i] === i);
            for (let i = 0; i < this.cosets.length; i++) {
                for (let x = 0; x < this.letters; x++) {
                    this.cosets[i][x] = p2[this.p[this.cosets[i][x]]];
                }
            }
            this.length = this.cosets.length;
        }
        standardize() {
            let y = 1;
            for (let a = 0; a < this.cosets.length; a++) {
                for (let x = 0; x < this.letters; x++) {
                    let b = this.cosets[a][x];
                    if (b >= y) {
                        if (b > y)
                            this.swapCoset(y, b);
                        y++;
                        if (y === this.length - 1)
                            return;
                    }
                }
            }
        }
        swapCoset(b, y) {
            let z = this.cosets[y];
            this.cosets[y] = this.cosets[b];
            this.cosets[b] = z;
            for (let x = 0; x < this.letters; x++) {
                const ix = this.genInvMap[x];
                const u = this.cosets[y][x];
                const v = this.cosets[b][x];
                if (u === b) {
                    this.cosets[y][x] = y;
                }
                else if (u === y) {
                    this.cosets[y][x] = b;
                }
                else {
                    this.cosets[u][ix] = y;
                }
                if (v === b) {
                    this.cosets[b][x] = y;
                }
                else if (v === y) {
                    this.cosets[b][x] = b;
                }
                else {
                    this.cosets[v][ix] = b;
                }
            }
        }
        getRepresentatives() {
            const represents = new Array(this.cosets.length);
            represents[0] = [];
            for (let a = 0; a < this.cosets.length; a++) {
                console.assert(represents[a] !== undefined);
                for (let x = 0; x < this.letters; x++) {
                    const next = this.cosets[a][x];
                    if (!represents[next]) {
                        represents[next] = represents[a].slice(0);
                        represents[next].push(x);
                    }
                }
            }
            return represents;
        }
        findCoset(w) {
            let coset = 0;
            w = w.slice(0);
            let x;
            while ((x = w.shift()) !== undefined) {
                coset = this.cosets[coset][x];
            }
            return coset;
        }
    }

    /** If fov == 0, then return Orthographic projection matrix
     *  Caution: This function calculates PerspectiveMatrix for 0-1 depth range */
    function getPerspectiveProjectionMatrix(c) {
        let ky = Math.tan(_90 - c.fov / 2 * _DEG2RAD);
        let kxz = ky / (c.aspect ?? 1);
        let a = -c.far / (c.far - c.near);
        let b = c.near * a;
        // [kxz   0    0    0    0]
        // [0    ky   0    0    0]
        // [0    0    kxz   0    0]
        // [0    0    0    a    b]
        // [0    0    0   -1    0]
        return {
            /** used for 3d */
            mat4: new Mat4(kxz, 0, 0, 0, 0, ky, 0, 0, 0, 0, a, b, 0, 0, -1, 0),
            /** used for 4d because of lack of mat5x5 */
            vec4: new Vec4(kxz, ky, a, b)
        };
    }
    function getOrthographicProjectionMatrix(c) {
        let ky = 1 / c.size, kxz = ky / (c.aspect ?? 1);
        let a = -1 / (c.far - c.near);
        let b = c.near * a;
        // [kxz   0    0    0    0]
        // [0    ky   0    0    0]
        // [0    0    kxz   0    0]
        // [0    0    0    a    b]
        // [0    0    0    0    1]
        return {
            /** used for 3d */
            mat4: new Mat4(kxz, 0, 0, 0, 0, ky, 0, 0, 0, 0, a, b, 0, 0, 0, 1),
            /** used for 4d because of lack of mat5x5
             */
            vec4: new Vec4(kxz, ky, a, b)
        };
    }

    class Ray {
        origin;
        direction;
    }
    class Plane {
        /** normal need to be normalized */
        normal;
        /** halfspace n.v < offset */
        offset;
        constructor(normal, offset) {
            this.normal = normal;
            this.offset = offset;
        }
        clone() {
            return new Plane(this.normal.clone(), this.offset);
        }
        applyObj4(o) {
            if (o.scale)
                throw "scaling plane is not implemented yet";
            this.normal.rotates(o.rotation);
            this.offset += this.normal.dot(o.position);
            return this;
        }
        distanceToPoint(p) {
            return this.normal.dot(p) - this.offset;
        }
        /** regard r as an infinity line */
        distanceToLine(r) {
        }
        intersectRay(r) {
        }
    }
    class AABB {
        min;
        max;
        testAABB(aabb) {
            return ((this.min.x <= aabb.max.x && this.max.x >= aabb.min.x) &&
                (this.min.y <= aabb.max.y && this.max.y >= aabb.min.y) &&
                (this.min.z <= aabb.max.z && this.max.z >= aabb.min.z) &&
                (this.min.w <= aabb.max.w && this.max.w >= aabb.min.w));
        }
        /** when intersected return 0, when aabb is along the normal direction return 1, otherwise -1 */
        testPlane(plane) {
            let min, max;
            if (plane.normal.x > 0) {
                min = plane.normal.x * this.min.x;
                max = plane.normal.x * this.max.x;
            }
            else {
                min = plane.normal.x * this.max.x;
                max = plane.normal.x * this.min.x;
            }
            if (plane.normal.y > 0) {
                min += plane.normal.y * this.min.y;
                max += plane.normal.y * this.max.y;
            }
            else {
                min += plane.normal.y * this.max.y;
                max += plane.normal.y * this.min.y;
            }
            if (plane.normal.z > 0) {
                min += plane.normal.z * this.min.z;
                max += plane.normal.z * this.max.z;
            }
            else {
                min += plane.normal.z * this.max.z;
                max += plane.normal.z * this.min.z;
            }
            if (plane.normal.w > 0) {
                min += plane.normal.w * this.min.w;
                max += plane.normal.w * this.max.w;
            }
            else {
                min += plane.normal.w * this.max.w;
                max += plane.normal.w * this.min.w;
            }
            if (min <= plane.offset && max >= plane.offset) {
                return 0;
            }
            if (min <= plane.offset && max <= plane.offset) {
                return -1;
            }
            if (min >= plane.offset && max >= plane.offset) {
                return 1;
            }
        }
        getPoints() {
            return [
                new Vec4(this.min.x, this.min.y, this.min.z, this.min.w),
                new Vec4(this.max.x, this.min.y, this.min.z, this.min.w),
                new Vec4(this.min.x, this.max.y, this.min.z, this.min.w),
                new Vec4(this.max.x, this.max.y, this.min.z, this.min.w),
                new Vec4(this.min.x, this.min.y, this.max.z, this.min.w),
                new Vec4(this.max.x, this.min.y, this.max.z, this.min.w),
                new Vec4(this.min.x, this.max.y, this.max.z, this.min.w),
                new Vec4(this.max.x, this.max.y, this.max.z, this.min.w),
                new Vec4(this.min.x, this.min.y, this.min.z, this.max.w),
                new Vec4(this.max.x, this.min.y, this.min.z, this.max.w),
                new Vec4(this.min.x, this.max.y, this.min.z, this.max.w),
                new Vec4(this.max.x, this.max.y, this.min.z, this.max.w),
                new Vec4(this.min.x, this.min.y, this.max.z, this.max.w),
                new Vec4(this.max.x, this.min.y, this.max.z, this.max.w),
                new Vec4(this.min.x, this.max.y, this.max.z, this.max.w),
                new Vec4(this.max.x, this.max.y, this.max.z, this.max.w),
            ];
        }
        constructor(min, max) {
            this.min = min ?? new Vec4(Infinity, Infinity, Infinity, Infinity);
            this.max = max ?? new Vec4(-Infinity, -Infinity, -Infinity, -Infinity);
        }
        static fromPoints(points) {
            let aabb = new AABB();
            for (let p of points) {
                aabb.min.x = Math.min(aabb.min.x, p.x);
                aabb.min.y = Math.min(aabb.min.y, p.y);
                aabb.min.z = Math.min(aabb.min.z, p.z);
                aabb.min.w = Math.min(aabb.min.w, p.w);
                aabb.max.x = Math.max(aabb.max.x, p.x);
                aabb.max.y = Math.max(aabb.max.y, p.y);
                aabb.max.z = Math.max(aabb.max.z, p.z);
                aabb.max.w = Math.max(aabb.max.w, p.w);
            }
            return aabb;
        }
    }

    class Spline {
        points;
        derives;
        constructor(points, derives) {
            if (points.length !== derives.length)
                console.error("Spline: points and derives lengths don't agree");
            this.points = points;
            this.derives = derives;
        }
        generate(seg) {
            let points = [];
            let prevPoint;
            let prevDir = Vec4.w;
            let prevRotor = new Rotor();
            let rotors = [];
            let curveLength = [];
            let curveLenSum = 0;
            for (let i = 0; i < this.points.length - 1; i++) {
                let p0 = this.points[i];
                let p1 = this.points[i + 1];
                let d0 = this.derives[i];
                let d1 = this.derives[i + 1];
                let p01 = p0.sub(p1);
                let A = p01.mulf(2).adds(d0).adds(d1);
                let B = d0.mulf(-2).subs(d1).subs(p01.mulfs(3));
                let seginv = 1 / seg;
                for (let j = 0; j <= seg; j++) {
                    if (j === seg && i !== this.points.length - 2)
                        break;
                    let t = j * seginv;
                    let curPoint = new Vec4(p0.x + t * (d0.x + t * (B.x + t * A.x)), p0.y + t * (d0.y + t * (B.y + t * A.y)), p0.z + t * (d0.z + t * (B.z + t * A.z)), p0.w + t * (d0.w + t * (B.w + t * A.w)));
                    if (prevPoint) {
                        let curDir = curPoint.sub(prevPoint);
                        let dirLen = curDir.norm();
                        curDir.divfs(dirLen);
                        prevRotor.mulsl(Rotor.lookAt(prevDir, curDir));
                        // console.log(curDir.dot(Vec4.w.rotate(prevRotor)));
                        prevDir = curDir;
                        rotors.push(prevRotor.clone());
                        curveLength.push(curveLenSum);
                        curveLenSum += dirLen;
                    }
                    prevPoint = curPoint;
                    points.push(curPoint);
                }
            }
            let lastDerive = this.derives[this.derives.length - 1];
            if (points[0].x == prevPoint.x && points[0].y == prevPoint.y &&
                points[0].z == prevPoint.z && points[0].w == prevPoint.w &&
                this.derives[0].x == lastDerive.x && this.derives[0].y == lastDerive.y &&
                this.derives[0].z == lastDerive.z && this.derives[0].w == lastDerive.w) {
                rotors.push(rotors[0]);
            }
            else {
                rotors.push(prevRotor);
            }
            curveLength.push(curveLenSum);
            return { points, rotors, curveLength };
        }
        getValue(t) {
            let i = Math.floor(t);
            t -= i;
            // i %= this.points.length - 1;
            // if (i < 0) i += this.points.length - 1
            let p0 = this.points[i];
            let p1 = this.points[i + 1];
            let d0 = this.derives[i];
            let d1 = this.derives[i + 1];
            let p01 = p0.sub(p1);
            let A = p01.mulf(2).adds(d0).adds(d1);
            let B = d0.mulf(-2).subs(d1).subs(p01.mulfs(3));
            let x = p0.x + t * (d0.x + t * (B.x + t * A.x));
            let y = p0.y + t * (d0.y + t * (B.y + t * A.y));
            let z = p0.z + t * (d0.z + t * (B.z + t * A.z));
            let w = p0.w + t * (d0.w + t * (B.w + t * A.w));
            return new Vec4(x, y, z, w);
        }
        getPositionAtLength(s, data) {
            let i = 0;
            for (; i < data.curveLength.length; i++) {
                if (data.curveLength[i] > s) {
                    break;
                }
            }
            let a = data.curveLength[i - 1];
            let b = data.curveLength[i];
            let ratio = (s - a) / (b - a);
            return data.points[i - 1].mulf(1 - ratio).addmulfs(data.points[i], ratio);
        }
        getObj4AtLength(s, data) {
            let i = 0;
            for (; i < data.curveLength.length; i++) {
                if (data.curveLength[i] > s) {
                    break;
                }
            }
            let a = data.curveLength[i - 1];
            let b = data.curveLength[i];
            let ratio = (s - a) / (b - a);
            return new Obj4(data.points[i - 1].mulf(1 - ratio).addmulfs(data.points[i], ratio), Rotor.slerp(data.rotors[i - 1], data.rotors[i], ratio));
        }
    }

    class Perlin3 {
        _p = new Uint8Array(512);
        constructor(srand) {
            const p = this._p;
            for (let i = 0; i < 256; i++) {
                p[i] = i;
            }
            let i = 255;
            while (i--) {
                let j = srand.nexti(i);
                let x = p[i];
                p[i] = p[j];
                p[j] = x;
            }
            for (i = 0; i < 256; i++) {
                p[i + 256] = p[i];
            }
        }
        value(x, y, z) {
            const p = this._p;
            let X = Math.floor(x) & 255;
            let Y = Math.floor(y) & 255;
            let Z = Math.floor(z) & 255;
            x -= Math.floor(x);
            y -= Math.floor(y);
            z -= Math.floor(z);
            function _fade(t) {
                return t * t * t * (t * (t * 6 - 15) + 10);
            }
            let u = _fade(x);
            let v = _fade(y);
            let w = _fade(z);
            function _lerp(t, a, b) {
                return a + t * (b - a);
            }
            function _grad(hash, x, y, z) {
                let h = hash & 15;
                let u = h < 8 ? x : y;
                let v = h < 4 ? y : (h == 12 || h == 14) ? x : z;
                return ((h & 1) == 0 ? u : -u) + ((h & 2) == 0 ? v : -v);
            }
            let A = p[X] + Y, AA = p[A] + Z, AB = p[A + 1] + Z;
            let B = p[X + 1] + Y, BA = p[B] + Z, BB = p[B + 1] + Z;
            return _lerp(w, _lerp(v, _lerp(u, _grad(p[AA], x, y, z), _grad(p[BA], x - 1, y, z)), _lerp(u, _grad(p[AB], x, y - 1, z), _grad(p[BB], x - 1, y - 1, z))), _lerp(v, _lerp(u, _grad(p[AA + 1], x, y, z - 1), _grad(p[BA + 1], x - 1, y, z - 1)), _lerp(u, _grad(p[AB + 1], x, y - 1, z - 1), _grad(p[BB + 1], x - 1, y - 1, z - 1))));
        }
    }

    class Polytope {
        gens;
        rels;
        schlafli;
        fullgroupRepresentatives;
        fullgroupTable;
        // reflection directions: these dirs are sqrt(1/2) length for calc convenience
        // [b2[0], 0 ..]
        // [b1[1],b2[1],0..]
        // [0,b1[2],b2[2],0..]
        // [0,0,b1[2],b2[2],0..]
        // ...
        basis1 = [0,];
        basis2 = [1,];
        constructor(schlafli) {
            let len = schlafli.length + 1;
            this.schlafli = schlafli;
            // get group descriptors
            let gens = "";
            let rels = [];
            for (let i = 0; i < len; i++) {
                gens += i;
            }
            for (let i = 0; i < len; i++) {
                const si = i.toString();
                for (let j = i; j < len; j++) {
                    const sj = j.toString();
                    const mij = i === j ? 1 : j === i + 1 ? schlafli[i] : 2;
                    rels.push((si + sj).repeat(mij));
                }
            }
            this.gens = gens;
            this.rels = rels;
            // get reflection descriptors
            for (let i = 1; i < len; i++) {
                const cos = Math.cos(Math.PI / this.schlafli[i - 1]);
                this.basis1.push(Math.abs(cos / this.basis2[i - 1]));
                this.basis2.push(Math.sqrt(1 - this.basis1[i] * this.basis1[i]));
            }
            // these dirs are sqrt(1/2) length for calc convenience
            for (let i = 1; i < len; i++) {
                this.basis1[i] *= Math.SQRT2;
                this.basis2[i] *= Math.SQRT2;
            }
        }
        generateVertices(v0, cosetTable) {
            const vertices = new Array(cosetTable.length);
            vertices[0] = v0.clone();
            for (const [c, coset] of cosetTable.cosets.entries()) {
                const v = vertices[c];
                for (const [x, cx] of coset.entries()) {
                    if (vertices[cx])
                        continue;
                    if (x === 0) {
                        const nv = v.clone();
                        nv.x = -nv.x;
                        vertices[cx] = nv;
                        continue;
                    }
                    const vs = v.flat();
                    // these dirs are sqrt(1/2) length, no need to mul 2
                    const proj = (vs[x - 1] * this.basis1[x] + vs[x] * this.basis2[x]);
                    vs[x - 1] -= proj * this.basis1[x];
                    vs[x] -= proj * this.basis2[x];
                    vertices[cx] = new Vec4(...vs);
                }
            }
            return vertices;
        }
        getInitVertex(vertexPosition) {
            if (this.gens.length !== vertexPosition.length + 1)
                throw ("Polytope.getInitVertex: vertexPosition length must be" + (this.gens.length - 1));
            const pqr = vertexPosition.slice(0);
            const remain = pqr.length ? 1 - pqr.reduce((a, b) => a + b) : 1;
            if (remain < 0)
                throw "vertexPosition's sum must be less than or equal to 1";
            pqr.push(remain);
            const basisVec = [Vec4.x];
            for (let i = 1; i < this.basis1.length; i++) {
                const v = [0, 0, 0, 0];
                v[i - 1] = this.basis1[i];
                v[i] = this.basis2[i];
                basisVec.push(new Vec4(...v));
            }
            const points = [];
            for (let j = 0; j < this.gens.length; j++) {
                let a;
                for (let i = 0; i < this.gens.length; i++) {
                    if (i === j)
                        continue;
                    if (!a) {
                        a = basisVec[i];
                        continue;
                    }
                    if (a instanceof Vec4) {
                        a = a.wedge(basisVec[i]);
                        continue;
                    }
                    if (a instanceof Bivec) {
                        a = a.wedgev(basisVec[i]);
                        continue;
                    }
                }
                if (vertexPosition.length === 1) {
                    const na = a.yxzw();
                    na.x = -na.x;
                    points.push(na);
                }
                else if (vertexPosition.length === 2) {
                    points.push(a.wedgev(Vec4.w));
                }
                else if (vertexPosition.length === 3) {
                    points.push(a);
                }
            }
            const v0 = new Vec4;
            for (const [i, k] of pqr.entries()) {
                v0.addmulfs(points[i].norms(), k);
            }
            return v0;
        }
        generateFaceLinkTable(srcNum, srcTable, ...destTable) {
            const src = new Array(srcNum);
            for (let i = 0; i < srcTable.length; i++) {
                src[srcTable[i]] ??= new Set();
                for (const val of destTable.map(dt => dt[i])) {
                    src[srcTable[i]].add(val);
                }
            }
            return src.map(e => Array.from(e));
        }
        getRegularPolytope() {
            if (this.gens.length === 1)
                return [];
            // kface[0] : Vtable, kface[1] : Etable...
            const kfaceTable = this.getFirstStructure();
            let pqr = new Array(this.gens.length - 1);
            pqr.fill(0);
            if (pqr.length)
                pqr[0] = 1;
            const V = this.gens.length > 4 ? kfaceTable[0].cosetTable.cosets.map(() => new Array()) : this.generateVertices(this.getInitVertex(pqr), kfaceTable[0].cosetTable);
            let polytope = [V];
            for (let i = 1; i < this.gens.length; i++) {
                polytope.push(this.generateFaceLinkTable(kfaceTable[i].cosetTable.length, kfaceTable[i].subGroupTable, kfaceTable[i - 1].subGroupTable));
            }
            return polytope;
        }
        getTrucatedRegularPolytope(t) {
            if (t <= 0 || t >= 1)
                throw "Trucation parameter must be in range (0,1)!";
            if (this.gens.length === 1)
                return [];
            // kface[0] : Vtable, kface[1] : Etable...
            const kfaceTable = this.getTrucatedStructure();
            let pqr = new Array(this.gens.length - 1);
            pqr.fill(0);
            if (pqr.length > 1) {
                pqr[0] = 1 - t;
                pqr[1] = t;
            }
            let vi = this.gens.length;
            // if > 4, return abstract vertex without coord
            const V = this.gens.length > 4 ? kfaceTable[0].cosetTable.cosets.map(() => new Array()) : this.generateVertices(this.getInitVertex(pqr), kfaceTable[vi].cosetTable);
            let polytope = [V];
            let tOffset;
            for (let i = 1; i < this.gens.length; i++) {
                // [vi->ei vi->e]
                // [ei->fi (ei+e)->f]
                // [fi->ci (fi+f)->c]
                const t = this.generateFaceLinkTable(kfaceTable[i === vi - 1 ? 0 : (i + vi)].cosetTable.length, kfaceTable[i === vi - 1 ? 0 : (i + vi)].subGroupTable, kfaceTable[i + vi - 1].subGroupTable);
                let offset = t.length;
                if (i > 1)
                    t.push(...this.generateFaceLinkTable(kfaceTable[i].cosetTable.length, kfaceTable[i].subGroupTable, kfaceTable[i + vi - 1].subGroupTable, kfaceTable[i - 1].subGroupTable.map(e => e + tOffset)));
                else
                    t.push(...this.generateFaceLinkTable(kfaceTable[i].cosetTable.length, kfaceTable[i].subGroupTable, kfaceTable[i + vi - 1].subGroupTable));
                polytope.push(t);
                tOffset = offset;
            }
            return polytope;
        }
        getBitrucatedRegularPolytope(t = 0.5) {
            if (t <= 0 || t >= 1)
                throw "BiTrucation parameter must be in range (0,1)!";
            if (this.gens.length !== 4)
                throw "BiTrucation is only implemented in 4D!";
            // kface[0] : Vtable, kface[1] : Etable...
            const kfaceTable = this.getBitrucatedStructure();
            let pqr = new Array(this.gens.length - 1);
            pqr.fill(0);
            if (pqr.length > 1) {
                pqr[0] = 0;
                pqr[1] = t;
                pqr[2] = 1 - t;
            }
            let vi = this.gens.length;
            // if > 4, return abstract vertex without coord
            const V = this.gens.length > 4 ? kfaceTable[0].cosetTable.cosets.map(() => new Array()) : this.generateVertices(this.getInitVertex(pqr), kfaceTable[vi].cosetTable);
            const link = (src, ...dst) => {
                return this.generateFaceLinkTable(kfaceTable[src].cosetTable.length, kfaceTable[src].subGroupTable, ...dst.map(n => kfaceTable[n].subGroupTable));
            };
            // [vi->ei vi->e]
            const ei = link(5, 4);
            const e = link(7, 4);
            const edge = [...ei, ...e];
            kfaceTable[7].subGroupTable = kfaceTable[7].subGroupTable.map(e => e + ei.length);
            // [ei->f (ei+e)->fi e->fe]
            const f = link(2, 5);
            const fi = link(6, 5, 7);
            const fe = link(1, 7);
            const face = [...f, ...fi, ...fe];
            kfaceTable[6].subGroupTable = kfaceTable[6].subGroupTable.map(e => e + f.length);
            kfaceTable[1].subGroupTable = kfaceTable[1].subGroupTable.map(e => e + f.length + fi.length);
            // [(fi+fe)->ci (fi+f)->c ]
            const ci = link(0, 1, 6);
            const c = link(3, 2, 6);
            const cell = [...ci, ...c];
            return [V, edge, face, cell];
        }
        getStructures(subgroups) {
            this.fullgroupTable ??= new CosetTable(this.gens, this.rels, []).enumerate();
            this.fullgroupRepresentatives ??= this.fullgroupTable.getRepresentatives();
            return subgroups.map(subgroup => {
                const cosetTable = new CosetTable(this.gens, this.rels, subgroup).enumerate();
                const subGroupTable = this.fullgroupRepresentatives.map(w => cosetTable.findCoset(w));
                return { cosetTable, subGroupTable };
            });
        }
        getFirstStructure() {
            this.fullgroupTable ??= new CosetTable(this.gens, this.rels, []).enumerate();
            this.fullgroupRepresentatives ??= this.fullgroupTable.getRepresentatives();
            const table = [];
            for (let i = 0; i < this.gens.length; i++) {
                // example: V: "b,c,d"  E: "a,c,d" F: "a,b,d" C: "a,b,c"
                const subgroup = Array.from(this.gens);
                subgroup.splice(i, 1);
                const cosetTable = new CosetTable(this.gens, this.rels, subgroup).enumerate();
                const subGroupTable = this.fullgroupRepresentatives.map(w => cosetTable.findCoset(w));
                table.push({ cosetTable, subGroupTable });
            }
            return table;
        }
        getTrucatedStructure() {
            this.fullgroupTable ??= new CosetTable(this.gens, this.rels, []).enumerate();
            this.fullgroupRepresentatives ??= this.fullgroupTable.getRepresentatives();
            const table = [];
            for (let i = 0; i < this.gens.length; i++) {
                // Ct: "b,c,d" E: "a,c,d" F: "a,b,d" C: "a,b,c"
                const subgroup = Array.from(this.gens);
                subgroup.splice(i, 1);
                const cosetTable = new CosetTable(this.gens, this.rels, subgroup).enumerate();
                const subGroupTable = this.fullgroupRepresentatives.map(w => cosetTable.findCoset(w));
                console.log(subgroup, cosetTable.length);
                table.push({ cosetTable, subGroupTable });
            }
            for (let i = 0; i < this.gens.length - 1; i++) {
                // Vt:"c,d" Et:"b,d" Ft:"b,c" 
                let subgroup = Array.from(this.gens);
                subgroup = subgroup.slice(1);
                subgroup.splice(i, 1);
                const cosetTable = new CosetTable(this.gens, this.rels, subgroup).enumerate();
                const subGroupTable = this.fullgroupRepresentatives.map(w => cosetTable.findCoset(w));
                console.log(subgroup, cosetTable.length);
                table.push({ cosetTable, subGroupTable });
            }
            return table;
        }
        getBitrucatedStructure() {
            if (this.gens.length !== 4)
                throw "not implemented yet";
            this.fullgroupTable ??= new CosetTable(this.gens, this.rels, []).enumerate();
            this.fullgroupRepresentatives ??= this.fullgroupTable.getRepresentatives();
            const table = [];
            // Ct: "b,c,d" Fe: "a,c,d" F: "a,b,d" C: "a,b,c"
            for (let i = 0; i < this.gens.length; i++) {
                const subgroup = Array.from(this.gens);
                subgroup.splice(i, 1);
                const cosetTable = new CosetTable(this.gens, this.rels, subgroup).enumerate();
                const subGroupTable = this.fullgroupRepresentatives.map(w => cosetTable.findCoset(w));
                console.log(subgroup, cosetTable.length);
                table.push({ cosetTable, subGroupTable });
            }
            // Vt:"a,d" Et:"b,d" Ft:"b,c" E: "a,c" 
            for (let i = 0; i < this.gens.length; i++) {
                let subgroup = Array.from(this.gens);
                if (i === 0) {
                    subgroup = [subgroup[0], subgroup[3]];
                }
                else if (i === this.gens.length - 1) {
                    subgroup = [subgroup[0], subgroup[2]];
                }
                else {
                    subgroup = subgroup.slice(1);
                    subgroup.splice(i, 1);
                }
                const cosetTable = new CosetTable(this.gens, this.rels, subgroup).enumerate();
                const subGroupTable = this.fullgroupRepresentatives.map(w => cosetTable.findCoset(w));
                console.log(subgroup, cosetTable.length);
                table.push({ cosetTable, subGroupTable });
            }
            return table;
        }
        getPolytope() {
            if (this.gens.length === 1)
                return [];
            // kface[0] : Vtable, kface[1] : Etable...
            const kfaceTable = this.getFirstStructure();
            let pqr = new Array(this.gens.length - 1);
            pqr.fill(1 / pqr.length);
            const V = this.gens.length > 4 ? kfaceTable[0].cosetTable.cosets.map(() => new Array()) : this.generateVertices(this.getInitVertex(pqr), kfaceTable[0].cosetTable);
            let polytope = [V];
            for (let i = 1; i < this.gens.length; i++) {
                polytope.push(this.generateFaceLinkTable(kfaceTable[i].cosetTable.length, kfaceTable[i].subGroupTable, kfaceTable[i - 1].subGroupTable));
            }
            return polytope;
        }
    }

    var math = /*#__PURE__*/Object.freeze({
        __proto__: null,
        AABB: AABB,
        AffineMat4: AffineMat4,
        Bivec: Bivec,
        BivecPool: BivecPool,
        Complex: Complex,
        CosetTable: CosetTable,
        Mat2: Mat2,
        Mat2Pool: Mat2Pool,
        Mat3: Mat3,
        Mat3Pool: Mat3Pool,
        Mat4: Mat4,
        Mat4Pool: Mat4Pool,
        Obj4: Obj4,
        Perlin3: Perlin3,
        Plane: Plane,
        Polytope: Polytope,
        Quaternion: Quaternion,
        Ray: Ray,
        Rotor: Rotor,
        Spline: Spline,
        Srand: Srand,
        Vec2: Vec2,
        Vec2Pool: Vec2Pool,
        Vec3: Vec3,
        Vec3Pool: Vec3Pool,
        Vec4: Vec4,
        Vec4Pool: Vec4Pool,
        _120: _120,
        _180: _180,
        _30: _30,
        _360: _360,
        _45: _45,
        _60: _60,
        _90: _90,
        _COS30: _COS30,
        _DEG2RAD: _DEG2RAD,
        _GOLDRATIO: _GOLDRATIO,
        _RAD2DEG: _RAD2DEG,
        _SQRT_3: _SQRT_3,
        _TAN30: _TAN30,
        bivecPool: bivecPool,
        generateUUID: generateUUID,
        getOrthographicProjectionMatrix: getOrthographicProjectionMatrix,
        getPerspectiveProjectionMatrix: getPerspectiveProjectionMatrix,
        mat2Pool: mat2Pool,
        mat3Pool: mat3Pool,
        mat4Pool: mat4Pool,
        vec2Pool: vec2Pool,
        vec3Pool: vec3Pool,
        vec4Pool: vec4Pool
    });

    /** An enum for stereo's eye option */
    var EyeStereo;
    (function (EyeStereo) {
        EyeStereo[EyeStereo["LeftEye"] = 0] = "LeftEye";
        EyeStereo[EyeStereo["None"] = 1] = "None";
        EyeStereo[EyeStereo["RightEye"] = 2] = "RightEye";
    })(EyeStereo || (EyeStereo = {}));
    var RetinaSliceFacing;
    (function (RetinaSliceFacing) {
        RetinaSliceFacing[RetinaSliceFacing["POSZ"] = 0] = "POSZ";
        RetinaSliceFacing[RetinaSliceFacing["NEGZ"] = 1] = "NEGZ";
        RetinaSliceFacing[RetinaSliceFacing["POSY"] = 2] = "POSY";
        RetinaSliceFacing[RetinaSliceFacing["NEGY"] = 3] = "NEGY";
        RetinaSliceFacing[RetinaSliceFacing["POSX"] = 4] = "POSX";
        RetinaSliceFacing[RetinaSliceFacing["NEGX"] = 5] = "NEGX";
    })(RetinaSliceFacing || (RetinaSliceFacing = {}));
    const DefaultDisplayConfig = {
        retinaLayers: 64,
        sectionStereoEyeOffset: 0.1,
        retinaStereoEyeOffset: 0.2,
        retinaResolution: 512,
        opacity: 1,
        canvasSize: {
            width: typeof window !== "undefined" ? window.innerWidth * window.devicePixelRatio : 1024,
            height: typeof window !== "undefined" ? window.innerHeight * window.devicePixelRatio : 512
        },
        camera3D: { fov: 40, near: 0.2, far: 20 },
        camera4D: { fov: 90, near: 0.01, far: 10 },
        retinaViewMatrix: new Mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, -5, 0, 0, 0, 1),
        sections: [
            {
                facing: RetinaSliceFacing.NEGX,
                eyeStereo: EyeStereo.LeftEye,
                viewport: { x: -0.2, y: -0.8, width: 0.2, height: 0.2 }
            },
            {
                facing: RetinaSliceFacing.NEGX,
                eyeStereo: EyeStereo.RightEye,
                viewport: { x: 0.8, y: -0.8, width: 0.2, height: 0.2 }
            },
            {
                facing: RetinaSliceFacing.NEGY,
                eyeStereo: EyeStereo.LeftEye,
                viewport: { x: -0.2, y: 0.8, width: 0.2, height: 0.2 }
            },
            {
                facing: RetinaSliceFacing.NEGY,
                eyeStereo: EyeStereo.RightEye,
                viewport: { x: 0.8, y: 0.8, width: 0.2, height: 0.2 }
            },
            {
                facing: RetinaSliceFacing.POSZ,
                eyeStereo: EyeStereo.LeftEye,
                viewport: { x: -0.8, y: -0.8, width: 0.2, height: 0.2 }
            },
            {
                facing: RetinaSliceFacing.POSZ,
                eyeStereo: EyeStereo.RightEye,
                viewport: { x: 0.2, y: 0.2 - 1, width: 0.2, height: 0.2 }
            },
        ]
    };

    class e{constructor(e,t){this.name=e,this.attributes=t,this.size=0;}get isArray(){return  false}get isStruct(){return  false}get isTemplate(){return  false}get isPointer(){return  false}getTypeName(){return this.name}}class t{constructor(e,t,n){this.name=e,this.type=t,this.attributes=n,this.offset=0,this.size=0;}get isArray(){return this.type.isArray}get isStruct(){return this.type.isStruct}get isTemplate(){return this.type.isTemplate}get align(){return this.type.isStruct?this.type.align:0}get members(){return this.type.isStruct?this.type.members:null}get format(){return this.type.isArray||this.type.isTemplate?this.type.format:null}get count(){return this.type.isArray?this.type.count:0}get stride(){return this.type.isArray?this.type.stride:this.size}}class n extends e{constructor(e,t){super(e,t),this.members=[],this.align=0,this.startLine=-1,this.endLine=-1,this.inUse=false;}get isStruct(){return  true}}class s extends e{constructor(e,t){super(e,t),this.count=0,this.stride=0;}get isArray(){return  true}getTypeName(){return `array<${this.format.getTypeName()}, ${this.count}>`}}class r extends e{constructor(e,t,n){super(e,n),this.format=t;}get isPointer(){return  true}getTypeName(){return `&${this.format.getTypeName()}`}}class a extends e{constructor(e,t,n,s){super(e,n),this.format=t,this.access=s;}get isTemplate(){return  true}getTypeName(){let e=this.name;if(null!==this.format){if('vec2'===e||'vec3'===e||'vec4'===e||'mat2x2'===e||'mat2x3'===e||'mat2x4'===e||'mat3x2'===e||'mat3x3'===e||'mat3x4'===e||'mat4x2'===e||'mat4x3'===e||'mat4x4'===e){if('f32'===this.format.name)return e+='f',e;if('i32'===this.format.name)return e+='i',e;if('u32'===this.format.name)return e+='u',e;if('bool'===this.format.name)return e+='b',e;if('f16'===this.format.name)return e+='h',e}e+=`<${this.format.name}>`;}else if('vec2'===e||'vec3'===e||'vec4'===e)return e;return e}}var i;(e=>{e[e.Uniform=0]='Uniform',e[e.Storage=1]='Storage',e[e.Texture=2]='Texture',e[e.Sampler=3]='Sampler',e[e.StorageTexture=4]='StorageTexture';})(i||(i={}));class o{constructor(e,t,n,s,r,a,i){this.name=e,this.type=t,this.group=n,this.binding=s,this.attributes=r,this.resourceType=a,this.access=i;}get isArray(){return this.type.isArray}get isStruct(){return this.type.isStruct}get isTemplate(){return this.type.isTemplate}get size(){return this.type.size}get align(){return this.type.isStruct?this.type.align:0}get members(){return this.type.isStruct?this.type.members:null}get format(){return this.type.isArray||this.type.isTemplate?this.type.format:null}get count(){return this.type.isArray?this.type.count:0}get stride(){return this.type.isArray?this.type.stride:this.size}}class c{constructor(e,t){this.name=e,this.type=t;}}class l{constructor(e,t,n,s){this.name=e,this.type=t,this.locationType=n,this.location=s,this.interpolation=null;}}class u{constructor(e,t,n,s){this.name=e,this.type=t,this.locationType=n,this.location=s;}}class h{constructor(e,t,n,s){this.name=e,this.type=t,this.attributes=n,this.id=s;}}class f{constructor(e,t,n){this.name=e,this.type=t,this.attributes=n;}}class p{constructor(e,t=null,n){this.stage=null,this.inputs=[],this.outputs=[],this.arguments=[],this.returnType=null,this.resources=[],this.overrides=[],this.startLine=-1,this.endLine=-1,this.inUse=false,this.calls=new Set,this.name=e,this.stage=t,this.attributes=n;}}class d{constructor(){this.vertex=[],this.fragment=[],this.compute=[];}}function m(e){var t=(32768&e)>>15,n=(31744&e)>>10,s=1023&e;return 0==n?(t?-1:1)*Math.pow(2,-14)*(s/Math.pow(2,10)):31==n?s?NaN:1/0*(t?-1:1):(t?-1:1)*Math.pow(2,n-15)*(1+s/Math.pow(2,10))}const g=new Float32Array(1),_=new Int32Array(g.buffer),x=new Uint16Array(1);function y(e){g[0]=e;const t=_[0],n=t>>31&1;let s=t>>23&255,r=8388607&t;if(255===s)return x[0]=n<<15|31744|(0!==r?512:0),x[0];if(0===s){if(0===r)return x[0]=n<<15,x[0];r|=8388608;let e=113;for(;!(8388608&r);)r<<=1,e--;return s=127-e,r&=8388607,s>0?(r=(r>>126-s)+(r>>127-s&1),x[0]=n<<15|s<<10|r>>13,x[0]):(x[0]=n<<15,x[0])}return s=s-127+15,s>=31?(x[0]=n<<15|31744,x[0]):s<=0?s<-10?(x[0]=n<<15,x[0]):(r=(8388608|r)>>1-s,x[0]=n<<15|r>>13,x[0]):(r>>=13,x[0]=n<<15|s<<10|r,x[0])}const b=new Uint32Array(1),v=new Float32Array(b.buffer,0,1);function w(e){const t=112+(e>>6&31)<<23|(63&e)<<17;return b[0]=t,v[0]}function k(e,t,n,s,r,a,i,o,c){const l=s*(i>>=r)*(a>>=r)+n*i+t*o;switch(c){case 'r8unorm':return [I(e,l,'8unorm',1)[0]];case 'r8snorm':return [I(e,l,'8snorm',1)[0]];case 'r8uint':return [I(e,l,'8uint',1)[0]];case 'r8sint':return [I(e,l,'8sint',1)[0]];case 'rg8unorm':{const t=I(e,l,'8unorm',2);return [t[0],t[1]]}case 'rg8snorm':{const t=I(e,l,'8snorm',2);return [t[0],t[1]]}case 'rg8uint':{const t=I(e,l,'8uint',2);return [t[0],t[1]]}case 'rg8sint':{const t=I(e,l,'8sint',2);return [t[0],t[1]]}case 'rgba8unorm-srgb':case 'rgba8unorm':{const t=I(e,l,'8unorm',4);return [t[0],t[1],t[2],t[3]]}case 'rgba8snorm':{const t=I(e,l,'8snorm',4);return [t[0],t[1],t[2],t[3]]}case 'rgba8uint':{const t=I(e,l,'8uint',4);return [t[0],t[1],t[2],t[3]]}case 'rgba8sint':{const t=I(e,l,'8sint',4);return [t[0],t[1],t[2],t[3]]}case 'bgra8unorm-srgb':case 'bgra8unorm':{const t=I(e,l,'8unorm',4);return [t[2],t[1],t[0],t[3]]}case 'r16uint':return [I(e,l,'16uint',1)[0]];case 'r16sint':return [I(e,l,'16sint',1)[0]];case 'r16float':return [I(e,l,'16float',1)[0]];case 'rg16uint':{const t=I(e,l,'16uint',2);return [t[0],t[1]]}case 'rg16sint':{const t=I(e,l,'16sint',2);return [t[0],t[1]]}case 'rg16float':{const t=I(e,l,'16float',2);return [t[0],t[1]]}case 'rgba16uint':{const t=I(e,l,'16uint',4);return [t[0],t[1],t[2],t[3]]}case 'rgba16sint':{const t=I(e,l,'16sint',4);return [t[0],t[1],t[2],t[3]]}case 'rgba16float':{const t=I(e,l,'16float',4);return [t[0],t[1],t[2],t[3]]}case 'r32uint':return [I(e,l,'32uint',1)[0]];case 'r32sint':return [I(e,l,'32sint',1)[0]];case 'depth16unorm':case 'depth24plus':case 'depth24plus-stencil8':case 'depth32float':case 'depth32float-stencil8':case 'r32float':return [I(e,l,'32float',1)[0]];case 'rg32uint':{const t=I(e,l,'32uint',2);return [t[0],t[1]]}case 'rg32sint':{const t=I(e,l,'32sint',2);return [t[0],t[1]]}case 'rg32float':{const t=I(e,l,'32float',2);return [t[0],t[1]]}case 'rgba32uint':{const t=I(e,l,'32uint',4);return [t[0],t[1],t[2],t[3]]}case 'rgba32sint':{const t=I(e,l,'32sint',4);return [t[0],t[1],t[2],t[3]]}case 'rgba32float':{const t=I(e,l,'32float',4);return [t[0],t[1],t[2],t[3]]}case 'rg11b10ufloat':{const t=new Uint32Array(e.buffer,l,1)[0],n=(4192256&t)>>11,s=(4290772992&t)>>22;return [w(2047&t),w(n),function(e){const t=112+(e>>5&31)<<23|(31&e)<<18;return b[0]=t,v[0]}(s),1]}}return null}function I(e,t,n,s){const r=[0,0,0,0];for(let a=0;a<s;++a)switch(n){case '8unorm':r[a]=e[t]/255,t++;break;case '8snorm':r[a]=e[t]/255*2-1,t++;break;case '8uint':r[a]=e[t],t++;break;case '8sint':r[a]=e[t]-127,t++;break;case '16uint':r[a]=e[t]|e[t+1]<<8,t+=2;break;case '16sint':r[a]=(e[t]|e[t+1]<<8)-32768,t+=2;break;case '16float':r[a]=m(e[t]|e[t+1]<<8),t+=2;break;case '32uint':case '32sint':r[a]=e[t]|e[t+1]<<8|e[t+2]<<16|e[t+3]<<24,t+=4;break;case '32float':r[a]=new Float32Array(e.buffer,t,1)[0],t+=4;}return r}function T(e,t,n,s,r){for(let a=0;a<s;++a)switch(n){case '8unorm':e[t]=255*r[a],t++;break;case '8snorm':e[t]=.5*(r[a]+1)*255,t++;break;case '8uint':e[t]=r[a],t++;break;case '8sint':e[t]=r[a]+127,t++;break;case '16uint':new Uint16Array(e.buffer,t,1)[0]=r[a],t+=2;break;case '16sint':new Int16Array(e.buffer,t,1)[0]=r[a],t+=2;break;case '16float':{const n=y(r[a]);new Uint16Array(e.buffer,t,1)[0]=n,t+=2;break}case '32uint':new Uint32Array(e.buffer,t,1)[0]=r[a],t+=4;break;case '32sint':new Int32Array(e.buffer,t,1)[0]=r[a],t+=4;break;case '32float':new Float32Array(e.buffer,t,1)[0]=r[a],t+=4;}return r}const S={r8unorm:{bytesPerBlock:1,blockWidth:1,blockHeight:1,isCompressed:false,channels:1},r8snorm:{bytesPerBlock:1,blockWidth:1,blockHeight:1,isCompressed:false,channels:1},r8uint:{bytesPerBlock:1,blockWidth:1,blockHeight:1,isCompressed:false,channels:1},r8sint:{bytesPerBlock:1,blockWidth:1,blockHeight:1,isCompressed:false,channels:1},rg8unorm:{bytesPerBlock:2,blockWidth:1,blockHeight:1,isCompressed:false,channels:2},rg8snorm:{bytesPerBlock:2,blockWidth:1,blockHeight:1,isCompressed:false,channels:2},rg8uint:{bytesPerBlock:2,blockWidth:1,blockHeight:1,isCompressed:false,channels:2},rg8sint:{bytesPerBlock:2,blockWidth:1,blockHeight:1,isCompressed:false,channels:2},rgba8unorm:{bytesPerBlock:4,blockWidth:1,blockHeight:1,isCompressed:false,channels:4},'rgba8unorm-srgb':{bytesPerBlock:4,blockWidth:1,blockHeight:1,isCompressed:false,channels:4},rgba8snorm:{bytesPerBlock:4,blockWidth:1,blockHeight:1,isCompressed:false,channels:4},rgba8uint:{bytesPerBlock:4,blockWidth:1,blockHeight:1,isCompressed:false,channels:4},rgba8sint:{bytesPerBlock:4,blockWidth:1,blockHeight:1,isCompressed:false,channels:4},bgra8unorm:{bytesPerBlock:4,blockWidth:1,blockHeight:1,isCompressed:false,channels:4},'bgra8unorm-srgb':{bytesPerBlock:4,blockWidth:1,blockHeight:1,isCompressed:false,channels:4},r16uint:{bytesPerBlock:2,blockWidth:1,blockHeight:1,isCompressed:false,channels:1},r16sint:{bytesPerBlock:2,blockWidth:1,blockHeight:1,isCompressed:false,channels:1},r16float:{bytesPerBlock:2,blockWidth:1,blockHeight:1,isCompressed:false,channels:1},rg16uint:{bytesPerBlock:4,blockWidth:1,blockHeight:1,isCompressed:false,channels:2},rg16sint:{bytesPerBlock:4,blockWidth:1,blockHeight:1,isCompressed:false,channels:2},rg16float:{bytesPerBlock:4,blockWidth:1,blockHeight:1,isCompressed:false,channels:2},rgba16uint:{bytesPerBlock:8,blockWidth:1,blockHeight:1,isCompressed:false,channels:4},rgba16sint:{bytesPerBlock:8,blockWidth:1,blockHeight:1,isCompressed:false,channels:4},rgba16float:{bytesPerBlock:8,blockWidth:1,blockHeight:1,isCompressed:false,channels:4},r32uint:{bytesPerBlock:4,blockWidth:1,blockHeight:1,isCompressed:false,channels:1},r32sint:{bytesPerBlock:4,blockWidth:1,blockHeight:1,isCompressed:false,channels:1},r32float:{bytesPerBlock:4,blockWidth:1,blockHeight:1,isCompressed:false,channels:1},rg32uint:{bytesPerBlock:8,blockWidth:1,blockHeight:1,isCompressed:false,channels:2},rg32sint:{bytesPerBlock:8,blockWidth:1,blockHeight:1,isCompressed:false,channels:2},rg32float:{bytesPerBlock:8,blockWidth:1,blockHeight:1,isCompressed:false,channels:2},rgba32uint:{bytesPerBlock:16,blockWidth:1,blockHeight:1,isCompressed:false,channels:4},rgba32sint:{bytesPerBlock:16,blockWidth:1,blockHeight:1,isCompressed:false,channels:4},rgba32float:{bytesPerBlock:16,blockWidth:1,blockHeight:1,isCompressed:false,channels:4},rgb10a2uint:{bytesPerBlock:4,blockWidth:1,blockHeight:1,isCompressed:false,channels:4},rgb10a2unorm:{bytesPerBlock:4,blockWidth:1,blockHeight:1,isCompressed:false,channels:4},rg11b10ufloat:{bytesPerBlock:4,blockWidth:1,blockHeight:1,isCompressed:false,channels:4},stencil8:{bytesPerBlock:1,blockWidth:1,blockHeight:1,isCompressed:false,isDepthStencil:true,hasDepth:false,hasStencil:true,channels:1},depth16unorm:{bytesPerBlock:2,blockWidth:1,blockHeight:1,isCompressed:false,isDepthStencil:true,hasDepth:true,hasStencil:false,channels:1},depth24plus:{bytesPerBlock:4,blockWidth:1,blockHeight:1,isCompressed:false,isDepthStencil:true,hasDepth:true,hasStencil:false,depthOnlyFormat:'depth32float',channels:1},'depth24plus-stencil8':{bytesPerBlock:8,blockWidth:1,blockHeight:1,isCompressed:false,isDepthStencil:true,hasDepth:true,hasStencil:true,depthOnlyFormat:'depth32float',channels:1},depth32float:{bytesPerBlock:4,blockWidth:1,blockHeight:1,isCompressed:false,isDepthStencil:true,hasDepth:true,hasStencil:false,channels:1},'depth32float-stencil8':{bytesPerBlock:8,blockWidth:1,blockHeight:1,isCompressed:false,isDepthStencil:true,hasDepth:true,hasStencil:true,stencilOnlyFormat:'depth32float',channels:1},rgb9e5ufloat:{bytesPerBlock:4,blockWidth:1,blockHeight:1,isCompressed:false,channels:4},'bc1-rgba-unorm':{bytesPerBlock:8,blockWidth:4,blockHeight:4,isCompressed:true,channels:4},'bc1-rgba-unorm-srgb':{bytesPerBlock:8,blockWidth:4,blockHeight:4,isCompressed:true,channels:4},'bc2-rgba-unorm':{bytesPerBlock:16,blockWidth:4,blockHeight:4,isCompressed:true,channels:4},'bc2-rgba-unorm-srgb':{bytesPerBlock:16,blockWidth:4,blockHeight:4,isCompressed:true,channels:4},'bc3-rgba-unorm':{bytesPerBlock:16,blockWidth:4,blockHeight:4,isCompressed:true,channels:4},'bc3-rgba-unorm-srgb':{bytesPerBlock:16,blockWidth:4,blockHeight:4,isCompressed:true,channels:4},'bc4-r-unorm':{bytesPerBlock:8,blockWidth:4,blockHeight:4,isCompressed:true,channels:1},'bc4-r-snorm':{bytesPerBlock:8,blockWidth:4,blockHeight:4,isCompressed:true,channels:1},'bc5-rg-unorm':{bytesPerBlock:16,blockWidth:4,blockHeight:4,isCompressed:true,channels:2},'bc5-rg-snorm':{bytesPerBlock:16,blockWidth:4,blockHeight:4,isCompressed:true,channels:2},'bc6h-rgb-ufloat':{bytesPerBlock:16,blockWidth:4,blockHeight:4,isCompressed:true,channels:4},'bc6h-rgb-float':{bytesPerBlock:16,blockWidth:4,blockHeight:4,isCompressed:true,channels:4},'bc7-rgba-unorm':{bytesPerBlock:16,blockWidth:4,blockHeight:4,isCompressed:true,channels:4},'bc7-rgba-unorm-srgb':{bytesPerBlock:16,blockWidth:4,blockHeight:4,isCompressed:true,channels:4},'etc2-rgb8unorm':{bytesPerBlock:8,blockWidth:4,blockHeight:4,isCompressed:true,channels:4},'etc2-rgb8unorm-srgb':{bytesPerBlock:8,blockWidth:4,blockHeight:4,isCompressed:true,channels:4},'etc2-rgb8a1unorm':{bytesPerBlock:8,blockWidth:4,blockHeight:4,isCompressed:true,channels:4},'etc2-rgb8a1unorm-srgb':{bytesPerBlock:8,blockWidth:4,blockHeight:4,isCompressed:true,channels:4},'etc2-rgba8unorm':{bytesPerBlock:16,blockWidth:4,blockHeight:4,isCompressed:true,channels:4},'etc2-rgba8unorm-srgb':{bytesPerBlock:16,blockWidth:4,blockHeight:4,isCompressed:true,channels:4},'eac-r11unorm':{bytesPerBlock:8,blockWidth:1,blockHeight:1,isCompressed:true,channels:1},'eac-r11snorm':{bytesPerBlock:8,blockWidth:1,blockHeight:1,isCompressed:true,channels:1},'eac-rg11unorm':{bytesPerBlock:16,blockWidth:1,blockHeight:1,isCompressed:true,channels:2},'eac-rg11snorm':{bytesPerBlock:16,blockWidth:1,blockHeight:1,isCompressed:true,channels:2},'astc-4x4-unorm':{bytesPerBlock:16,blockWidth:4,blockHeight:4,isCompressed:true,channels:4},'astc-4x4-unorm-srgb':{bytesPerBlock:16,blockWidth:4,blockHeight:4,isCompressed:true,channels:4},'astc-5x4-unorm':{bytesPerBlock:16,blockWidth:5,blockHeight:4,isCompressed:true,channels:4},'astc-5x4-unorm-srgb':{bytesPerBlock:16,blockWidth:5,blockHeight:4,isCompressed:true,channels:4},'astc-5x5-unorm':{bytesPerBlock:16,blockWidth:5,blockHeight:5,isCompressed:true,channels:4},'astc-5x5-unorm-srgb':{bytesPerBlock:16,blockWidth:5,blockHeight:5,isCompressed:true,channels:4},'astc-6x5-unorm':{bytesPerBlock:16,blockWidth:6,blockHeight:5,isCompressed:true,channels:4},'astc-6x5-unorm-srgb':{bytesPerBlock:16,blockWidth:6,blockHeight:5,isCompressed:true,channels:4},'astc-6x6-unorm':{bytesPerBlock:16,blockWidth:6,blockHeight:6,isCompressed:true,channels:4},'astc-6x6-unorm-srgb':{bytesPerBlock:16,blockWidth:6,blockHeight:6,isCompressed:true,channels:4},'astc-8x5-unorm':{bytesPerBlock:16,blockWidth:8,blockHeight:5,isCompressed:true,channels:4},'astc-8x5-unorm-srgb':{bytesPerBlock:16,blockWidth:8,blockHeight:5,isCompressed:true,channels:4},'astc-8x6-unorm':{bytesPerBlock:16,blockWidth:8,blockHeight:6,isCompressed:true,channels:4},'astc-8x6-unorm-srgb':{bytesPerBlock:16,blockWidth:8,blockHeight:6,isCompressed:true,channels:4},'astc-8x8-unorm':{bytesPerBlock:16,blockWidth:8,blockHeight:8,isCompressed:true,channels:4},'astc-8x8-unorm-srgb':{bytesPerBlock:16,blockWidth:8,blockHeight:8,isCompressed:true,channels:4},'astc-10x5-unorm':{bytesPerBlock:16,blockWidth:10,blockHeight:5,isCompressed:true,channels:4},'astc-10x5-unorm-srgb':{bytesPerBlock:16,blockWidth:10,blockHeight:5,isCompressed:true,channels:4},'astc-10x6-unorm':{bytesPerBlock:16,blockWidth:10,blockHeight:6,isCompressed:true,channels:4},'astc-10x6-unorm-srgb':{bytesPerBlock:16,blockWidth:10,blockHeight:6,isCompressed:true,channels:4},'astc-10x8-unorm':{bytesPerBlock:16,blockWidth:10,blockHeight:8,isCompressed:true,channels:4},'astc-10x8-unorm-srgb':{bytesPerBlock:16,blockWidth:10,blockHeight:8,isCompressed:true,channels:4},'astc-10x10-unorm':{bytesPerBlock:16,blockWidth:10,blockHeight:10,isCompressed:true,channels:4},'astc-10x10-unorm-srgb':{bytesPerBlock:16,blockWidth:10,blockHeight:10,isCompressed:true,channels:4},'astc-12x10-unorm':{bytesPerBlock:16,blockWidth:12,blockHeight:10,isCompressed:true,channels:4},'astc-12x10-unorm-srgb':{bytesPerBlock:16,blockWidth:12,blockHeight:10,isCompressed:true,channels:4},'astc-12x12-unorm':{bytesPerBlock:16,blockWidth:12,blockHeight:12,isCompressed:true,channels:4},'astc-12x12-unorm-srgb':{bytesPerBlock:16,blockWidth:12,blockHeight:12,isCompressed:true,channels:4}};class A{constructor(){this.id=A._id++,this.line=0;}get isAstNode(){return  true}get astNodeType(){return ''}search(e){e(this);}searchBlock(e,t){if(e){t(E.instance);for(const n of e)n instanceof Array?this.searchBlock(n,t):n.search(t);t($.instance);}}constEvaluate(e,t){throw new Error('Cannot evaluate node')}constEvaluateString(e){return this.constEvaluate(e).toString()}}A._id=0;class E extends A{}E.instance=new E;class $ extends A{}$.instance=new $;const L=new Set(['all','all','any','select','arrayLength','abs','acos','acosh','asin','asinh','atan','atanh','atan2','ceil','clamp','cos','cosh','countLeadingZeros','countOneBits','countTrailingZeros','cross','degrees','determinant','distance','dot','dot4U8Packed','dot4I8Packed','exp','exp2','extractBits','faceForward','firstLeadingBit','firstTrailingBit','floor','fma','fract','frexp','insertBits','inverseSqrt','ldexp','length','log','log2','max','min','mix','modf','normalize','pow','quantizeToF16','radians','reflect','refract','reverseBits','round','saturate','sign','sin','sinh','smoothStep','sqrt','step','tan','tanh','transpose','trunc','dpdx','dpdxCoarse','dpdxFine','dpdy','dpdyCoarse','dpdyFine','fwidth','fwidthCoarse','fwidthFine','textureDimensions','textureGather','textureGatherCompare','textureLoad','textureNumLayers','textureNumLevels','textureNumSamples','textureSample','textureSampleBias','textureSampleCompare','textureSampleCompareLevel','textureSampleGrad','textureSampleLevel','textureSampleBaseClampToEdge','textureStore','atomicLoad','atomicStore','atomicAdd','atomicSub','atomicMax','atomicMin','atomicAnd','atomicOr','atomicXor','atomicExchange','atomicCompareExchangeWeak','pack4x8snorm','pack4x8unorm','pack4xI8','pack4xU8','pack4x8Clamp','pack4xU8Clamp','pack2x16snorm','pack2x16unorm','pack2x16float','unpack4x8snorm','unpack4x8unorm','unpack4xI8','unpack4xU8','unpack2x16snorm','unpack2x16unorm','unpack2x16float','storageBarrier','textureBarrier','workgroupBarrier','workgroupUniformLoad','subgroupAdd','subgroupExclusiveAdd','subgroupInclusiveAdd','subgroupAll','subgroupAnd','subgroupAny','subgroupBallot','subgroupBroadcast','subgroupBroadcastFirst','subgroupElect','subgroupMax','subgroupMin','subgroupMul','subgroupExclusiveMul','subgroupInclusiveMul','subgroupOr','subgroupShuffle','subgroupShuffleDown','subgroupShuffleUp','subgroupShuffleXor','subgroupXor','quadBroadcast','quadSwapDiagonal','quadSwapX','quadSwapY']);class C extends A{constructor(){super();}}class D extends C{constructor(e,t,n,s,r,a){super(),this.calls=new Set,this.name=e,this.args=t,this.returnType=n,this.body=s,this.startLine=r,this.endLine=a;}get astNodeType(){return 'function'}search(e){if(this.attributes)for(const t of this.attributes)e(t);e(this);for(const t of this.args)e(t);this.searchBlock(this.body,e);}}class N extends C{constructor(e){super(),this.expression=e;}get astNodeType(){return 'staticAssert'}search(e){this.expression.search(e);}}class V extends C{constructor(e,t){super(),this.condition=e,this.body=t;}get astNodeType(){return 'while'}search(e){this.condition.search(e),this.searchBlock(this.body,e);}}class O extends C{constructor(e,t){super(),this.body=e,this.loopId=t;}get astNodeType(){return 'continuing'}search(e){this.searchBlock(this.body,e);}}class B extends C{constructor(e,t,n,s){super(),this.init=e,this.condition=t,this.increment=n,this.body=s;}get astNodeType(){return 'for'}search(e){var t,n,s;null===(t=this.init)||void 0===t||t.search(e),null===(n=this.condition)||void 0===n||n.search(e),null===(s=this.increment)||void 0===s||s.search(e),this.searchBlock(this.body,e);}}class F extends C{constructor(e,t,n,s,r){super(),this.attributes=null,this.name=e,this.type=t,this.storage=n,this.access=s,this.value=r;}get astNodeType(){return 'var'}search(e){var t;e(this),null===(t=this.value)||void 0===t||t.search(e);}}class M extends C{constructor(e,t,n){super(),this.attributes=null,this.name=e,this.type=t,this.value=n;}get astNodeType(){return 'override'}search(e){var t;null===(t=this.value)||void 0===t||t.search(e);}}class U extends C{constructor(e,t,n,s,r){super(),this.attributes=null,this.name=e,this.type=t,this.storage=n,this.access=s,this.value=r;}get astNodeType(){return 'let'}search(e){var t;e(this),null===(t=this.value)||void 0===t||t.search(e);}}class P extends C{constructor(e,t,n,s,r){super(),this.attributes=null,this.name=e,this.type=t,this.storage=n,this.access=s,this.value=r;}get astNodeType(){return 'const'}constEvaluate(e,t){return this.value.constEvaluate(e,t)}search(e){var t;e(this),null===(t=this.value)||void 0===t||t.search(e);}}var W,q,H,z;(e=>{e.increment='++',e.decrement='--';})(W||(W={})),(e=>{e.parse=function(t){const n=t;if('parse'==n)throw new Error('Invalid value for IncrementOperator');return e[n]};})(W||(W={}));class R extends C{constructor(e,t){super(),this.operator=e,this.variable=t;}get astNodeType(){return 'increment'}search(e){this.variable.search(e);}}(e=>{e.assign='=',e.addAssign='+=',e.subtractAssin='-=',e.multiplyAssign='*=',e.divideAssign='/=',e.moduloAssign='%=',e.andAssign='&=',e.orAssign='|=',e.xorAssign='^=',e.shiftLeftAssign='<<=',e.shiftRightAssign='>>=';})(q||(q={})),(e=>{e.parse=function(e){const t=e;if('parse'==t)throw new Error('Invalid value for AssignOperator');return t};})(q||(q={}));class G extends C{constructor(e,t,n){super(),this.operator=e,this.variable=t,this.value=n;}get astNodeType(){return 'assign'}search(e){this.variable.search(e),this.value.search(e);}}class X extends C{constructor(e,t){super(),this.name=e,this.args=t;}get astNodeType(){return 'call'}isBuiltin(){return L.has(this.name)}search(e){for(const t of this.args)t.search(e);e(this);}}class j extends C{constructor(e,t){super(),this.body=e,this.continuing=t;}get astNodeType(){return 'loop'}search(e){var t;this.searchBlock(this.body,e),null===(t=this.continuing)||void 0===t||t.search(e);}}class Z extends C{constructor(e,t){super(),this.condition=e,this.cases=t;}get astNodeType(){return 'switch'}search(e){e(this);for(const t of this.cases)t.search(e);}}class Q extends C{constructor(e,t,n,s){super(),this.condition=e,this.body=t,this.elseif=n,this.else=s;}get astNodeType(){return 'if'}search(e){this.condition.search(e),this.searchBlock(this.body,e),this.searchBlock(this.elseif,e),this.searchBlock(this.else,e);}}class Y extends C{constructor(e){super(),this.value=e;}get astNodeType(){return 'return'}search(e){var t;null===(t=this.value)||void 0===t||t.search(e);}}class K extends C{constructor(e){super(),this.name=e;}get astNodeType(){return 'enable'}}class J extends C{constructor(e){super(),this.extensions=e;}get astNodeType(){return 'requires'}}class ee extends C{constructor(e,t){super(),this.severity=e,this.rule=t;}get astNodeType(){return 'diagnostic'}}class te extends C{constructor(e,t){super(),this.name=e,this.type=t;}get astNodeType(){return 'alias'}}class ne extends C{constructor(){super();}get astNodeType(){return 'discard'}}class se extends C{constructor(){super(),this.condition=null,this.loopId=-1;}get astNodeType(){return 'break'}}class re extends C{constructor(){super(),this.loopId=-1;}get astNodeType(){return 'continue'}}class ae extends C{constructor(e){super(),this.attributes=null,this.name=e;}get astNodeType(){return 'type'}get isStruct(){return  false}get isArray(){return  false}static maxFormatType(e){let t=e[0];if('f32'===t.name)return t;for(let n=1;n<e.length;++n){const s=ae._priority.get(t.name);ae._priority.get(e[n].name)<s&&(t=e[n]);}return 'x32'===t.name?ae.i32:t}getTypeName(){return this.name}}ae.x32=new ae('x32'),ae.f32=new ae('f32'),ae.i32=new ae('i32'),ae.u32=new ae('u32'),ae.f16=new ae('f16'),ae.bool=new ae('bool'),ae.void=new ae('void'),ae._priority=new Map([['f32',0],['f16',1],['u32',2],['i32',3],['x32',3]]);class ie extends ae{constructor(e){super(e);}}class oe extends ae{constructor(e,t,n,s){super(e),this.members=t,this.startLine=n,this.endLine=s;}get astNodeType(){return 'struct'}get isStruct(){return  true}getMemberIndex(e){for(let t=0;t<this.members.length;t++)if(this.members[t].name==e)return t;return  -1}search(e){for(const t of this.members)e(t);}}class ce extends ae{constructor(e,t,n){super(e),this.format=t,this.access=n;}get astNodeType(){return 'template'}getTypeName(){let e=this.name;if(null!==this.format){if('vec2'===e||'vec3'===e||'vec4'===e||'mat2x2'===e||'mat2x3'===e||'mat2x4'===e||'mat3x2'===e||'mat3x3'===e||'mat3x4'===e||'mat4x2'===e||'mat4x3'===e||'mat4x4'===e){if('f32'===this.format.name)return e+='f',e;if('i32'===this.format.name)return e+='i',e;if('u32'===this.format.name)return e+='u',e;if('bool'===this.format.name)return e+='b',e;if('f16'===this.format.name)return e+='h',e}e+=`<${this.format.name}>`;}else if('vec2'===e||'vec3'===e||'vec4'===e)return e;return e}}ce.vec2f=new ce('vec2',ae.f32,null),ce.vec3f=new ce('vec3',ae.f32,null),ce.vec4f=new ce('vec4',ae.f32,null),ce.vec2i=new ce('vec2',ae.i32,null),ce.vec3i=new ce('vec3',ae.i32,null),ce.vec4i=new ce('vec4',ae.i32,null),ce.vec2u=new ce('vec2',ae.u32,null),ce.vec3u=new ce('vec3',ae.u32,null),ce.vec4u=new ce('vec4',ae.u32,null),ce.vec2h=new ce('vec2',ae.f16,null),ce.vec3h=new ce('vec3',ae.f16,null),ce.vec4h=new ce('vec4',ae.f16,null),ce.vec2b=new ce('vec2',ae.bool,null),ce.vec3b=new ce('vec3',ae.bool,null),ce.vec4b=new ce('vec4',ae.bool,null),ce.mat2x2f=new ce('mat2x2',ae.f32,null),ce.mat2x3f=new ce('mat2x3',ae.f32,null),ce.mat2x4f=new ce('mat2x4',ae.f32,null),ce.mat3x2f=new ce('mat3x2',ae.f32,null),ce.mat3x3f=new ce('mat3x3',ae.f32,null),ce.mat3x4f=new ce('mat3x4',ae.f32,null),ce.mat4x2f=new ce('mat4x2',ae.f32,null),ce.mat4x3f=new ce('mat4x3',ae.f32,null),ce.mat4x4f=new ce('mat4x4',ae.f32,null),ce.mat2x2h=new ce('mat2x2',ae.f16,null),ce.mat2x3h=new ce('mat2x3',ae.f16,null),ce.mat2x4h=new ce('mat2x4',ae.f16,null),ce.mat3x2h=new ce('mat3x2',ae.f16,null),ce.mat3x3h=new ce('mat3x3',ae.f16,null),ce.mat3x4h=new ce('mat3x4',ae.f16,null),ce.mat4x2h=new ce('mat4x2',ae.f16,null),ce.mat4x3h=new ce('mat4x3',ae.f16,null),ce.mat4x4h=new ce('mat4x4',ae.f16,null),ce.mat2x2i=new ce('mat2x2',ae.i32,null),ce.mat2x3i=new ce('mat2x3',ae.i32,null),ce.mat2x4i=new ce('mat2x4',ae.i32,null),ce.mat3x2i=new ce('mat3x2',ae.i32,null),ce.mat3x3i=new ce('mat3x3',ae.i32,null),ce.mat3x4i=new ce('mat3x4',ae.i32,null),ce.mat4x2i=new ce('mat4x2',ae.i32,null),ce.mat4x3i=new ce('mat4x3',ae.i32,null),ce.mat4x4i=new ce('mat4x4',ae.i32,null),ce.mat2x2u=new ce('mat2x2',ae.u32,null),ce.mat2x3u=new ce('mat2x3',ae.u32,null),ce.mat2x4u=new ce('mat2x4',ae.u32,null),ce.mat3x2u=new ce('mat3x2',ae.u32,null),ce.mat3x3u=new ce('mat3x3',ae.u32,null),ce.mat3x4u=new ce('mat3x4',ae.u32,null),ce.mat4x2u=new ce('mat4x2',ae.u32,null),ce.mat4x3u=new ce('mat4x3',ae.u32,null),ce.mat4x4u=new ce('mat4x4',ae.u32,null);class le extends ae{constructor(e,t,n,s){super(e),this.storage=t,this.type=n,this.access=s;}get astNodeType(){return 'pointer'}}class ue extends ae{constructor(e,t,n,s){super(e),this.attributes=t,this.format=n,this.count=s;}get astNodeType(){return 'array'}get isArray(){return  true}}class he extends ae{constructor(e,t,n){super(e),this.format=t,this.access=n;}get astNodeType(){return 'sampler'}}class fe extends A{constructor(){super(),this.postfix=null;}}class pe extends fe{constructor(e){super(),this.value=e;}get astNodeType(){return 'stringExpr'}toString(){return this.value}constEvaluateString(){return this.value}}class de extends fe{constructor(e,t){super(),this.type=e,this.args=t;}get astNodeType(){return 'createExpr'}search(e){if(e(this),this.args)for(const t of this.args)t.search(e);}constEvaluate(e,t){return t&&(t[0]=this.type),e.evalExpression(this,e.context)}}class me extends fe{constructor(e,t){super(),this.cachedReturnValue=null,this.name=e,this.args=t;}get astNodeType(){return 'callExpr'}setCachedReturnValue(e){this.cachedReturnValue=e;}get isBuiltin(){return L.has(this.name)}constEvaluate(e,t){return e.evalExpression(this,e.context)}search(e){for(const t of this.args)t.search(e);e(this);}}class ge extends fe{constructor(e){super(),this.name=e;}get astNodeType(){return 'varExpr'}search(e){e(this),this.postfix&&this.postfix.search(e);}constEvaluate(e,t){return e.evalExpression(this,e.context)}}class _e extends fe{constructor(e,t){super(),this.name=e,this.initializer=t;}get astNodeType(){return 'constExpr'}constEvaluate(e,t){if(this.initializer){const t=e.evalExpression(this.initializer,e.context);return null!==t&&this.postfix?t.getSubData(e,this.postfix,e.context):t}return null}search(e){this.initializer.search(e);}}class xe extends fe{constructor(e,t){super(),this.value=e,this.type=t;}get astNodeType(){return 'literalExpr'}constEvaluate(e,t){return void 0!==t&&(t[0]=this.type),this.value}get isScalar(){return this.value instanceof Be}get isVector(){return this.value instanceof Me||this.value instanceof Ue}get scalarValue(){return this.value instanceof Be?this.value.value:(console.error('Value is not scalar.'),0)}get vectorValue(){return this.value instanceof Me||this.value instanceof Ue?this.value.data:(console.error('Value is not a vector or matrix.'),new Float32Array(0))}}class ye extends fe{constructor(e,t){super(),this.type=e,this.value=t;}get astNodeType(){return 'bitcastExpr'}search(e){this.value.search(e);}}class ve extends fe{constructor(e){super(),this.index=e;}search(e){this.index.search(e);}}class we extends fe{constructor(){super();}}class ke extends we{constructor(e,t){super(),this.operator=e,this.right=t;}get astNodeType(){return 'unaryOp'}constEvaluate(e,t){return e.evalExpression(this,e.context)}search(e){this.right.search(e);}}class Ie extends we{constructor(e,t,n){super(),this.operator=e,this.left=t,this.right=n;}get astNodeType(){return 'binaryOp'}_getPromotedType(e,t){return e.name===t.name?e:'f32'===e.name||'f32'===t.name?ae.f32:'u32'===e.name||'u32'===t.name?ae.u32:ae.i32}constEvaluate(e,t){return e.evalExpression(this,e.context)}search(e){this.left.search(e),this.right.search(e);}}class Te extends A{constructor(e){super(),this.body=e;}search(e){e(this),this.searchBlock(this.body,e);}}class Se extends fe{constructor(){super();}get astNodeType(){return 'default'}}class Ae extends Te{constructor(e,t){super(t),this.selectors=e;}get astNodeType(){return 'case'}search(e){this.searchBlock(this.body,e);}}class Ee extends Te{constructor(e){super(e);}get astNodeType(){return 'default'}search(e){this.searchBlock(this.body,e);}}class $e extends A{constructor(e,t,n){super(),this.name=e,this.type=t,this.attributes=n;}get astNodeType(){return 'argument'}}class Le extends A{constructor(e,t){super(),this.condition=e,this.body=t;}get astNodeType(){return 'elseif'}search(e){this.condition.search(e),this.searchBlock(this.body,e);}}class Ce extends A{constructor(e,t,n){super(),this.name=e,this.type=t,this.attributes=n;}get astNodeType(){return 'member'}}class De extends A{constructor(e,t){super(),this.name=e,this.value=t;}get astNodeType(){return 'attribute'}}class Ne{constructor(e,t){this.parent=null,this.typeInfo=e,this.parent=t,this.id=Ne._id++;}clone(){throw `Clone: Not implemented for ${this.constructor.name}`}setDataValue(e,t,n,s){console.error(`SetDataValue: Not implemented for ${this.constructor.name}`);}getSubData(e,t,n){return console.error(`GetDataValue: Not implemented for ${this.constructor.name}`),null}toString(){return `<${this.typeInfo.getTypeName()}>`}}Ne._id=0;class Ve extends Ne{constructor(){super(new e('void',null),null);}toString(){return 'void'}}Ve.void=new Ve;class Oe extends Ne{constructor(e){super(new r('pointer',e.typeInfo,null),null),this.reference=e;}clone(){return this}setDataValue(e,t,n,s){this.reference.setDataValue(e,t,n,s);}getSubData(e,t,n){return t?this.reference.getSubData(e,t,n):this}toString(){return `&${this.reference.toString()}`}}class Be extends Ne{constructor(e,t,n=null){super(t,n),e instanceof Int32Array||e instanceof Uint32Array||e instanceof Float32Array?this.data=e:'x32'===this.typeInfo.name?e-Math.floor(e)!==0?this.data=new Float32Array([e]):this.data=e>=0?new Uint32Array([e]):new Int32Array([e]):'i32'===this.typeInfo.name||'bool'===this.typeInfo.name?this.data=new Int32Array([e]):'u32'===this.typeInfo.name?this.data=new Uint32Array([e]):'f32'===this.typeInfo.name||'f16'===this.typeInfo.name?this.data=new Float32Array([e]):console.error('ScalarData2: Invalid type',t);}clone(){if(this.data instanceof Float32Array)return new Be(new Float32Array(this.data),this.typeInfo,null);if(this.data instanceof Int32Array)return new Be(new Int32Array(this.data),this.typeInfo,null);if(this.data instanceof Uint32Array)return new Be(new Uint32Array(this.data),this.typeInfo,null);throw 'ScalarData: Invalid data type'}get value(){return this.data[0]}set value(e){this.data[0]=e;}setDataValue(e,t,n,s){if(n)return void console.error('SetDataValue: Scalar data does not support postfix',n);if(!(t instanceof Be))return void console.error('SetDataValue: Invalid value',t);let r=t.data[0];'i32'===this.typeInfo.name||'u32'===this.typeInfo.name?r=Math.floor(r):'bool'===this.typeInfo.name&&(r=r?1:0),this.data[0]=r;}getSubData(e,t,n){return t?(console.error('getSubData: Scalar data does not support postfix',t),null):this}toString(){return `${this.value}`}}function Fe(e,t,n){const s=t.length;return 2===s?'f32'===n?new Me(new Float32Array(t),e.getTypeInfo('vec2f')):'i32'===n||'bool'===n?new Me(new Int32Array(t),e.getTypeInfo('vec2i')):'u32'===n?new Me(new Uint32Array(t),e.getTypeInfo('vec2u')):'f16'===n?new Me(new Float32Array(t),e.getTypeInfo('vec2h')):(console.error(`getSubData: Unknown format ${n}`),null):3===s?'f32'===n?new Me(new Float32Array(t),e.getTypeInfo('vec3f')):'i32'===n||'bool'===n?new Me(new Int32Array(t),e.getTypeInfo('vec3i')):'u32'===n?new Me(new Uint32Array(t),e.getTypeInfo('vec3u')):'f16'===n?new Me(new Float32Array(t),e.getTypeInfo('vec3h')):(console.error(`getSubData: Unknown format ${n}`),null):4===s?'f32'===n?new Me(new Float32Array(t),e.getTypeInfo('vec4f')):'i32'===n||'bool'===n?new Me(new Int32Array(t),e.getTypeInfo('vec4i')):'u32'===n?new Me(new Uint32Array(t),e.getTypeInfo('vec4u')):'f16'===n?new Me(new Float32Array(t),e.getTypeInfo('vec4h')):(console.error(`getSubData: Unknown format ${n}`),null):(console.error(`getSubData: Invalid vector size ${t.length}`),null)}class Me extends Ne{constructor(e,t,n=null){if(super(t,n),e instanceof Float32Array||e instanceof Uint32Array||e instanceof Int32Array)this.data=e;else {const t=this.typeInfo.name;'vec2f'===t||'vec3f'===t||'vec4f'===t?this.data=new Float32Array(e):'vec2i'===t||'vec3i'===t||'vec4i'===t?this.data=new Int32Array(e):'vec2u'===t||'vec3u'===t||'vec4u'===t?this.data=new Uint32Array(e):'vec2h'===t||'vec3h'===t||'vec4h'===t?this.data=new Float32Array(e):'vec2b'===t||'vec3b'===t||'vec4b'===t?this.data=new Int32Array(e):'vec2'===t||'vec3'===t||'vec4'===t?this.data=new Float32Array(e):console.error(`VectorData: Invalid type ${t}`);}}clone(){if(this.data instanceof Float32Array)return new Me(new Float32Array(this.data),this.typeInfo,null);if(this.data instanceof Int32Array)return new Me(new Int32Array(this.data),this.typeInfo,null);if(this.data instanceof Uint32Array)return new Me(new Uint32Array(this.data),this.typeInfo,null);throw 'VectorData: Invalid data type'}setDataValue(e,t,n,s){n instanceof pe?console.error('TODO: Set vector postfix'):t instanceof Me?this.data=t.data:console.error('SetDataValue: Invalid value',t);}getSubData(e,t,n){if(null===t)return this;let s=e.getTypeInfo('f32');if(this.typeInfo instanceof a)s=this.typeInfo.format||s;else {const t=this.typeInfo.name;'vec2f'===t||'vec3f'===t||'vec4f'===t?s=e.getTypeInfo('f32'):'vec2i'===t||'vec3i'===t||'vec4i'===t?s=e.getTypeInfo('i32'):'vec2b'===t||'vec3b'===t||'vec4b'===t?s=e.getTypeInfo('bool'):'vec2u'===t||'vec3u'===t||'vec4u'===t?s=e.getTypeInfo('u32'):'vec2h'===t||'vec3h'===t||'vec4h'===t?s=e.getTypeInfo('f16'):console.error(`GetSubData: Unknown type ${t}`);}let r=this;for(;null!==t&&null!==r;){if(t instanceof ve){const a=t.index;let i=-1;if(a instanceof xe){if(!(a.value instanceof Be))return console.error(`GetSubData: Invalid array index ${a.value}`),null;i=a.value.value;}else {const t=e.evalExpression(a,n);if(!(t instanceof Be))return console.error('GetSubData: Unknown index type',a),null;i=t.value;}if(i<0||i>=r.data.length)return console.error('GetSubData: Index out of range',i),null;if(r.data instanceof Float32Array){const e=new Float32Array(r.data.buffer,r.data.byteOffset+4*i,1);return new Be(e,s)}if(r.data instanceof Int32Array){const e=new Int32Array(r.data.buffer,r.data.byteOffset+4*i,1);return new Be(e,s)}if(r.data instanceof Uint32Array){const e=new Uint32Array(r.data.buffer,r.data.byteOffset+4*i,1);return new Be(e,s)}throw 'GetSubData: Invalid data type'}if(!(t instanceof pe))return console.error('GetSubData: Unknown postfix',t),null;{const n=t.value.toLowerCase();if(1===n.length){let e=0;if('x'===n||'r'===n)e=0;else if('y'===n||'g'===n)e=1;else if('z'===n||'b'===n)e=2;else {if('w'!==n&&'a'!==n)return console.error(`GetSubData: Unknown member ${n}`),null;e=3;}if(this.data instanceof Float32Array){let t=new Float32Array(this.data.buffer,this.data.byteOffset+4*e,1);return new Be(t,s,this)}if(this.data instanceof Int32Array){let t=new Int32Array(this.data.buffer,this.data.byteOffset+4*e,1);return new Be(t,s,this)}if(this.data instanceof Uint32Array){let t=new Uint32Array(this.data.buffer,this.data.byteOffset+4*e,1);return new Be(t,s,this)}}const a=[];for(const e of n)'x'===e||'r'===e?a.push(this.data[0]):'y'===e||'g'===e?a.push(this.data[1]):'z'===e||'b'===e?a.push(this.data[2]):'w'===e||'a'===e?a.push(this.data[3]):console.error(`GetDataValue: Unknown member ${e}`);r=Fe(e,a,s.name);}t=t.postfix;}return r}toString(){let e=`${this.data[0]}`;for(let t=1;t<this.data.length;++t)e+=`, ${this.data[t]}`;return e}}class Ue extends Ne{constructor(e,t,n=null){super(t,n),e instanceof Float32Array?this.data=e:this.data=new Float32Array(e);}clone(){return new Ue(new Float32Array(this.data),this.typeInfo,null)}setDataValue(e,t,n,s){n instanceof pe?console.error('TODO: Set matrix postfix'):t instanceof Ue?this.data=t.data:console.error('SetDataValue: Invalid value',t);}getSubData(e,t,n){if(null===t)return this;const s=this.typeInfo.name;if(e.getTypeInfo('f32'),this.typeInfo instanceof a)this.typeInfo.format;else if(s.endsWith('f'))e.getTypeInfo('f32');else if(s.endsWith('i'))e.getTypeInfo('i32');else if(s.endsWith('u'))e.getTypeInfo('u32');else {if(!s.endsWith('h'))return console.error(`GetDataValue: Unknown type ${s}`),null;e.getTypeInfo('f16');}if(t instanceof ve){const r=t.index;let a=-1;if(r instanceof xe){if(!(r.value instanceof Be))return console.error(`GetDataValue: Invalid array index ${r.value}`),null;a=r.value.value;}else {const t=e.evalExpression(r,n);if(!(t instanceof Be))return console.error('GetDataValue: Unknown index type',r),null;a=t.value;}if(a<0||a>=this.data.length)return console.error('GetDataValue: Index out of range',a),null;const i=s.endsWith('h')?'h':'f';let o;if('mat2x2'===s||'mat2x2f'===s||'mat2x2h'===s||'mat3x2'===s||'mat3x2f'===s||'mat3x2h'===s||'mat4x2'===s||'mat4x2f'===s||'mat4x2h'===s)o=new Me(new Float32Array(this.data.buffer,this.data.byteOffset+2*a*4,2),e.getTypeInfo(`vec2${i}`));else if('mat2x3'===s||'mat2x3f'===s||'mat2x3h'===s||'mat3x3'===s||'mat3x3f'===s||'mat3x3h'===s||'mat4x3'===s||'mat4x3f'===s||'mat4x3h'===s)o=new Me(new Float32Array(this.data.buffer,this.data.byteOffset+3*a*4,3),e.getTypeInfo(`vec3${i}`));else {if('mat2x4'!==s&&'mat2x4f'!==s&&'mat2x4h'!==s&&'mat3x4'!==s&&'mat3x4f'!==s&&'mat3x4h'!==s&&'mat4x4'!==s&&'mat4x4f'!==s&&'mat4x4h'!==s)return console.error(`GetDataValue: Unknown type ${s}`),null;o=new Me(new Float32Array(this.data.buffer,this.data.byteOffset+4*a*4,4),e.getTypeInfo(`vec4${i}`));}return t.postfix?o.getSubData(e,t.postfix,n):o}return console.error('GetDataValue: Invalid postfix',t),null}toString(){let e=`${this.data[0]}`;for(let t=1;t<this.data.length;++t)e+=`, ${this.data[t]}`;return e}}class Pe extends Ne{constructor(e,t,n=0,s=null){super(t,s),this.buffer=e instanceof ArrayBuffer?e:e.buffer,this.offset=n;}clone(){const e=new Uint8Array(new Uint8Array(this.buffer,this.offset,this.typeInfo.size));return new Pe(e.buffer,this.typeInfo,0,null)}setDataValue(t,r,a,i){if(null===r)return void console.log('setDataValue: NULL data.');let o=this.offset,c=this.typeInfo;for(;a;){if(a instanceof ve)if(c instanceof s){const e=a.index;if(e instanceof xe){if(!(e.value instanceof Be))return void console.error(`SetDataValue: Invalid index type ${e.value}`);o+=e.value.value*c.stride;}else {const n=t.evalExpression(e,i);if(!(n instanceof Be))return void console.error('SetDataValue: Unknown index type',e);o+=n.value*c.stride;}c=c.format;}else console.error(`SetDataValue: Type ${c.getTypeName()} is not an array`);else {if(!(a instanceof pe))return void console.error('SetDataValue: Unknown postfix type',a);{const t=a.value;if(c instanceof n){let e=false;for(const n of c.members)if(n.name===t){o+=n.offset,c=n.type,e=true;break}if(!e)return void console.error(`SetDataValue: Member ${t} not found`)}else if(c instanceof e){const e=c.getTypeName();let n=0;if('x'===t||'r'===t)n=0;else if('y'===t||'g'===t)n=1;else if('z'===t||'b'===t)n=2;else {if('w'!==t&&'a'!==t)return void console.error(`SetDataValue: Unknown member ${t}`);n=3;}if(!(r instanceof Be))return void console.error('SetDataValue: Invalid value',r);const s=r.value;return 'vec2f'===e?void(new Float32Array(this.buffer,o,2)[n]=s):'vec3f'===e?void(new Float32Array(this.buffer,o,3)[n]=s):'vec4f'===e?void(new Float32Array(this.buffer,o,4)[n]=s):'vec2i'===e?void(new Int32Array(this.buffer,o,2)[n]=s):'vec3i'===e?void(new Int32Array(this.buffer,o,3)[n]=s):'vec4i'===e?void(new Int32Array(this.buffer,o,4)[n]=s):'vec2u'===e?void(new Uint32Array(this.buffer,o,2)[n]=s):'vec3u'===e?void(new Uint32Array(this.buffer,o,3)[n]=s):'vec4u'===e?void(new Uint32Array(this.buffer,o,4)[n]=s):void console.error(`SetDataValue: Type ${e} is not a struct`)}}}a=a.postfix;}this.setData(t,r,c,o,i);}setData(e,t,n,s,r){const a=n.getTypeName();if('f32'!==a&&'f16'!==a)if('i32'!==a&&'atomic<i32>'!==a&&'x32'!==a)if('u32'!==a&&'atomic<u32>'!==a)if('bool'!==a){if('vec2f'===a||'vec2h'===a){const e=new Float32Array(this.buffer,s,2);return void(t instanceof Me?(e[0]=t.data[0],e[1]=t.data[1]):(e[0]=t[0],e[1]=t[1]))}if('vec3f'===a||'vec3h'===a){const e=new Float32Array(this.buffer,s,3);return void(t instanceof Me?(e[0]=t.data[0],e[1]=t.data[1],e[2]=t.data[2]):(e[0]=t[0],e[1]=t[1],e[2]=t[2]))}if('vec4f'===a||'vec4h'===a){const e=new Float32Array(this.buffer,s,4);return void(t instanceof Me?(e[0]=t.data[0],e[1]=t.data[1],e[2]=t.data[2],e[3]=t.data[3]):(e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3]))}if('vec2i'===a){const e=new Int32Array(this.buffer,s,2);return void(t instanceof Me?(e[0]=t.data[0],e[1]=t.data[1]):(e[0]=t[0],e[1]=t[1]))}if('vec3i'===a){const e=new Int32Array(this.buffer,s,3);return void(t instanceof Me?(e[0]=t.data[0],e[1]=t.data[1],e[2]=t.data[2]):(e[0]=t[0],e[1]=t[1],e[2]=t[2]))}if('vec4i'===a){const e=new Int32Array(this.buffer,s,4);return void(t instanceof Me?(e[0]=t.data[0],e[1]=t.data[1],e[2]=t.data[2],e[3]=t.data[3]):(e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3]))}if('vec2u'===a){const e=new Uint32Array(this.buffer,s,2);return void(t instanceof Me?(e[0]=t.data[0],e[1]=t.data[1]):(e[0]=t[0],e[1]=t[1]))}if('vec3u'===a){const e=new Uint32Array(this.buffer,s,3);return void(t instanceof Me?(e[0]=t.data[0],e[1]=t.data[1],e[2]=t.data[2]):(e[0]=t[0],e[1]=t[1],e[2]=t[2]))}if('vec4u'===a){const e=new Uint32Array(this.buffer,s,4);return void(t instanceof Me?(e[0]=t.data[0],e[1]=t.data[1],e[2]=t.data[2],e[3]=t.data[3]):(e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3]))}if('vec2b'===a){const e=new Uint32Array(this.buffer,s,2);return void(t instanceof Me?(e[0]=t.data[0],e[1]=t.data[1]):(e[0]=t[0],e[1]=t[1]))}if('vec3b'===a){const e=new Uint32Array(this.buffer,s,3);return void(t instanceof Me?(e[0]=t.data[0],e[1]=t.data[1],e[2]=t.data[2]):(e[0]=t[0],e[1]=t[1],e[2]=t[2]))}if('vec4b'===a){const e=new Uint32Array(this.buffer,s,4);return void(t instanceof Me?(e[0]=t.data[0],e[1]=t.data[1],e[2]=t.data[2],e[3]=t.data[3]):(e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3]))}if('mat2x2f'===a||'mat2x2h'===a){const e=new Float32Array(this.buffer,s,4);return void(t instanceof Ue?(e[0]=t.data[0],e[1]=t.data[1],e[2]=t.data[2],e[3]=t.data[3]):(e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3]))}if('mat2x3f'===a||'mat2x3h'===a){const e=new Float32Array(this.buffer,s,6);return void(t instanceof Ue?(e[0]=t.data[0],e[1]=t.data[1],e[2]=t.data[2],e[3]=t.data[3],e[4]=t.data[4],e[5]=t.data[5]):(e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e[4]=t[4],e[5]=t[5]))}if('mat2x4f'===a||'mat2x4h'===a){const e=new Float32Array(this.buffer,s,8);return void(t instanceof Ue?(e[0]=t.data[0],e[1]=t.data[1],e[2]=t.data[2],e[3]=t.data[3],e[4]=t.data[4],e[5]=t.data[5],e[6]=t.data[6],e[7]=t.data[7]):(e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e[4]=t[4],e[5]=t[5],e[6]=t[6],e[7]=t[7]))}if('mat3x2f'===a||'mat3x2h'===a){const e=new Float32Array(this.buffer,s,6);return void(t instanceof Ue?(e[0]=t.data[0],e[1]=t.data[1],e[2]=t.data[2],e[3]=t.data[3],e[4]=t.data[4],e[5]=t.data[5]):(e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e[4]=t[4],e[5]=t[5]))}if('mat3x3f'===a||'mat3x3h'===a){const e=new Float32Array(this.buffer,s,9);return void(t instanceof Ue?(e[0]=t.data[0],e[1]=t.data[1],e[2]=t.data[2],e[3]=t.data[3],e[4]=t.data[4],e[5]=t.data[5],e[6]=t.data[6],e[7]=t.data[7],e[8]=t.data[8]):(e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e[4]=t[4],e[5]=t[5],e[6]=t[6],e[7]=t[7],e[8]=t[8]))}if('mat3x4f'===a||'mat3x4h'===a){const e=new Float32Array(this.buffer,s,12);return void(t instanceof Ue?(e[0]=t.data[0],e[1]=t.data[1],e[2]=t.data[2],e[3]=t.data[3],e[4]=t.data[4],e[5]=t.data[5],e[6]=t.data[6],e[7]=t.data[7],e[8]=t.data[8],e[9]=t.data[9],e[10]=t.data[10],e[11]=t.data[11]):(e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e[4]=t[4],e[5]=t[5],e[6]=t[6],e[7]=t[7],e[8]=t[8],e[9]=t[9],e[10]=t[10],e[11]=t[11]))}if('mat4x2f'===a||'mat4x2h'===a){const e=new Float32Array(this.buffer,s,8);return void(t instanceof Ue?(e[0]=t.data[0],e[1]=t.data[1],e[2]=t.data[2],e[3]=t.data[3],e[4]=t.data[4],e[5]=t.data[5],e[6]=t.data[6],e[7]=t.data[7]):(e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e[4]=t[4],e[5]=t[5],e[6]=t[6],e[7]=t[7]))}if('mat4x3f'===a||'mat4x3h'===a){const e=new Float32Array(this.buffer,s,12);return void(t instanceof Ue?(e[0]=t.data[0],e[1]=t.data[1],e[2]=t.data[2],e[3]=t.data[3],e[4]=t.data[4],e[5]=t.data[5],e[6]=t.data[6],e[7]=t.data[7],e[8]=t.data[8],e[9]=t.data[9],e[10]=t.data[10],e[11]=t.data[11]):(e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e[4]=t[4],e[5]=t[5],e[6]=t[6],e[7]=t[7],e[8]=t[8],e[9]=t[9],e[10]=t[10],e[11]=t[11]))}if('mat4x4f'===a||'mat4x4h'===a){const e=new Float32Array(this.buffer,s,16);return void(t instanceof Ue?(e[0]=t.data[0],e[1]=t.data[1],e[2]=t.data[2],e[3]=t.data[3],e[4]=t.data[4],e[5]=t.data[5],e[6]=t.data[6],e[7]=t.data[7],e[8]=t.data[8],e[9]=t.data[9],e[10]=t.data[10],e[11]=t.data[11],e[12]=t.data[12],e[13]=t.data[13],e[14]=t.data[14],e[15]=t.data[15]):(e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e[4]=t[4],e[5]=t[5],e[6]=t[6],e[7]=t[7],e[8]=t[8],e[9]=t[9],e[10]=t[10],e[11]=t[11],e[12]=t[12],e[13]=t[13],e[14]=t[14],e[15]=t[15]))}if(t instanceof Pe){if(n===t.typeInfo){return void new Uint8Array(this.buffer,s,t.buffer.byteLength).set(new Uint8Array(t.buffer))}console.error('SetDataValue: Type mismatch',a,t.typeInfo.getTypeName());}else console.error(`SetData: Unknown type ${a}`);}else t instanceof Be&&(new Int32Array(this.buffer,s,1)[0]=t.value);else t instanceof Be&&(new Uint32Array(this.buffer,s,1)[0]=t.value);else t instanceof Be&&(new Int32Array(this.buffer,s,1)[0]=t.value);else t instanceof Be&&(new Float32Array(this.buffer,s,1)[0]=t.value);}getSubData(t,r,i){var o,c,l;if(null===r)return this;let u=this.offset,h=this.typeInfo;for(;r;){if(r instanceof ve){const e=r.index,n=e instanceof fe?t.evalExpression(e,i):e;let a=0;if(n instanceof Be?a=n.value:'number'==typeof n?a=n:console.error('GetDataValue: Invalid index type',e),h instanceof s)u+=a*h.stride,h=h.format;else {const e=h.getTypeName();'mat4x4'===e||'mat4x4f'===e||'mat4x4h'===e?(u+=16*a,h=t.getTypeInfo('vec4f')):console.error(`getDataValue: Type ${h.getTypeName()} is not an array`);}}else {if(!(r instanceof pe))return console.error('GetDataValue: Unknown postfix type',r),null;{const s=r.value;if(h instanceof n){let e=false;for(const t of h.members)if(t.name===s){u+=t.offset,h=t.type,e=true;break}if(!e)return console.error(`GetDataValue: Member ${s} not found`),null}else if(h instanceof e){const e=h.getTypeName();if('vec2f'===e||'vec3f'===e||'vec4f'===e||'vec2i'===e||'vec3i'===e||'vec4i'===e||'vec2u'===e||'vec3u'===e||'vec4u'===e||'vec2b'===e||'vec3b'===e||'vec4b'===e||'vec2h'===e||'vec3h'===e||'vec4h'===e||'vec2'===e||'vec3'===e||'vec4'===e){if(s.length>0&&s.length<5){let n='f';const r=[];for(let a=0;a<s.length;++a){const i=s[a].toLowerCase();let o=0;if('x'===i||'r'===i)o=0;else if('y'===i||'g'===i)o=1;else if('z'===i||'b'===i)o=2;else {if('w'!==i&&'a'!==i)return console.error(`Unknown member ${s}`),null;o=3;}if(1===s.length){if(e.endsWith('f'))return this.buffer.byteLength<u+4*o+4?(console.log('Insufficient buffer data'),null):new Be(new Float32Array(this.buffer,u+4*o,1),t.getTypeInfo('f32'),this);if(e.endsWith('h'))return new Be(new Float32Array(this.buffer,u+4*o,1),t.getTypeInfo('f16'),this);if(e.endsWith('i'))return new Be(new Int32Array(this.buffer,u+4*o,1),t.getTypeInfo('i32'),this);if(e.endsWith('b'))return new Be(new Int32Array(this.buffer,u+4*o,1),t.getTypeInfo('bool'),this);if(e.endsWith('u'))return new Be(new Uint32Array(this.buffer,u+4*o,1),t.getTypeInfo('i32'),this)}if('vec2f'===e)r.push(new Float32Array(this.buffer,u,2)[o]);else if('vec3f'===e){if(u+12>=this.buffer.byteLength)return console.log('Insufficient buffer data'),null;const e=new Float32Array(this.buffer,u,3);r.push(e[o]);}else if('vec4f'===e)r.push(new Float32Array(this.buffer,u,4)[o]);else if('vec2i'===e)n='i',r.push(new Int32Array(this.buffer,u,2)[o]);else if('vec3i'===e)n='i',r.push(new Int32Array(this.buffer,u,3)[o]);else if('vec4i'===e)n='i',r.push(new Int32Array(this.buffer,u,4)[o]);else if('vec2u'===e){n='u';const e=new Uint32Array(this.buffer,u,2);r.push(e[o]);}else 'vec3u'===e?(n='u',r.push(new Uint32Array(this.buffer,u,3)[o])):'vec4u'===e&&(n='u',r.push(new Uint32Array(this.buffer,u,4)[o]));}return 2===r.length?h=t.getTypeInfo(`vec2${n}`):3===r.length?h=t.getTypeInfo(`vec3${n}`):4===r.length?h=t.getTypeInfo(`vec4${n}`):console.error(`GetDataValue: Invalid vector length ${r.length}`),new Me(r,h,null)}return console.error(`GetDataValue: Unknown member ${s}`),null}return console.error(`GetDataValue: Type ${e} is not a struct`),null}}}r=r.postfix;}const f=h.getTypeName();return 'f32'===f?new Be(new Float32Array(this.buffer,u,1),h,this):'i32'===f?new Be(new Int32Array(this.buffer,u,1),h,this):'u32'===f?new Be(new Uint32Array(this.buffer,u,1),h,this):'vec2f'===f?new Me(new Float32Array(this.buffer,u,2),h,this):'vec3f'===f?new Me(new Float32Array(this.buffer,u,3),h,this):'vec4f'===f?new Me(new Float32Array(this.buffer,u,4),h,this):'vec2i'===f?new Me(new Int32Array(this.buffer,u,2),h,this):'vec3i'===f?new Me(new Int32Array(this.buffer,u,3),h,this):'vec4i'===f?new Me(new Int32Array(this.buffer,u,4),h,this):'vec2u'===f?new Me(new Uint32Array(this.buffer,u,2),h,this):'vec3u'===f?new Me(new Uint32Array(this.buffer,u,3),h,this):'vec4u'===f?new Me(new Uint32Array(this.buffer,u,4),h,this):h instanceof a&&'atomic'===h.name?'u32'===(null===(o=h.format)||void 0===o?void 0:o.name)?new Be(new Uint32Array(this.buffer,u,1)[0],h.format,this):'i32'===(null===(c=h.format)||void 0===c?void 0:c.name)?new Be(new Int32Array(this.buffer,u,1)[0],h.format,this):(console.error(`GetDataValue: Invalid atomic format ${null===(l=h.format)||void 0===l?void 0:l.name}`),null):new Pe(this.buffer,h,u,this)}toString(){let e='';if(this.typeInfo instanceof s)if('f32'===this.typeInfo.format.name){const t=new Float32Array(this.buffer,this.offset);e=`[${t[0]}`;for(let n=1;n<t.length;++n)e+=`, ${t[n]}`;}else if('i32'===this.typeInfo.format.name){const t=new Int32Array(this.buffer,this.offset);e=`[${t[0]}`;for(let n=1;n<t.length;++n)e+=`, ${t[n]}`;}else if('u32'===this.typeInfo.format.name){const t=new Uint32Array(this.buffer,this.offset);e=`[${t[0]}`;for(let n=1;n<t.length;++n)e+=`, ${t[n]}`;}else if('vec2f'===this.typeInfo.format.name){const t=new Float32Array(this.buffer,this.offset);e=`[${t[0]}, ${t[1]}]`;for(let n=1;n<t.length/2;++n)e+=`, [${t[2*n]}, ${t[2*n+1]}]`;}else if('vec3f'===this.typeInfo.format.name){const t=new Float32Array(this.buffer,this.offset);e=`[${t[0]}, ${t[1]}, ${t[2]}]`;for(let n=4;n<t.length;n+=4)e+=`, [${t[n]}, ${t[n+1]}, ${t[n+2]}]`;}else if('vec4f'===this.typeInfo.format.name){const t=new Float32Array(this.buffer,this.offset);e=`[${t[0]}, ${t[1]}, ${t[2]}, ${t[3]}]`;for(let n=4;n<t.length;n+=4)e+=`, [${t[n]}, ${t[n+1]}, ${t[n+2]}, ${t[n+3]}]`;}else e='[...]';else this.typeInfo instanceof n?e+='{...}':e='[...]';return e}}class We extends Ne{constructor(e,t,n,s){super(t,null),this.data=e,this.descriptor=n,this.view=s;}clone(){return new We(this.data,this.typeInfo,this.descriptor,this.view)}get width(){var e,t;const n=this.descriptor.size;return n instanceof Array&&n.length>0?null!==(e=n[0])&&void 0!==e?e:0:n instanceof Object&&null!==(t=n.width)&&void 0!==t?t:0}get height(){var e,t;const n=this.descriptor.size;return n instanceof Array&&n.length>1?null!==(e=n[1])&&void 0!==e?e:0:n instanceof Object&&null!==(t=n.height)&&void 0!==t?t:0}get depthOrArrayLayers(){var e,t;const n=this.descriptor.size;return n instanceof Array&&n.length>2?null!==(e=n[2])&&void 0!==e?e:0:n instanceof Object&&null!==(t=n.depthOrArrayLayers)&&void 0!==t?t:0}get format(){var e;return this.descriptor&&null!==(e=this.descriptor.format)&&void 0!==e?e:'rgba8unorm'}get sampleCount(){var e;return this.descriptor&&null!==(e=this.descriptor.sampleCount)&&void 0!==e?e:1}get mipLevelCount(){var e;return this.descriptor&&null!==(e=this.descriptor.mipLevelCount)&&void 0!==e?e:1}get dimension(){var e;return this.descriptor&&null!==(e=this.descriptor.dimension)&&void 0!==e?e:'2d'}getMipLevelSize(e){if(e>=this.mipLevelCount)return [0,0,0];const t=[this.width,this.height,this.depthOrArrayLayers];for(let n=0;n<t.length;++n)t[n]=Math.max(1,t[n]>>e);return t}get texelByteSize(){const e=this.format,t=S[e];return t?t.isDepthStencil?4:t.bytesPerBlock:0}get bytesPerRow(){return this.width*this.texelByteSize}get isDepthStencil(){const e=this.format,t=S[e];return !!t&&t.isDepthStencil}getGpuSize(){const e=this.format,t=S[e],n=this.width;if(!e||n<=0||!t)return  -1;const s=this.height,r=this.depthOrArrayLayers,a=this.dimension;return n/t.blockWidth*('1d'===a?1:s/t.blockHeight)*t.bytesPerBlock*r}getPixel(e,t,n=0,s=0){const r=this.texelByteSize,a=this.bytesPerRow,i=this.height,o=this.data[s];return k(new Uint8Array(o),e,t,n,s,i,a,r,this.format)}setPixel(e,t,n,s,r){const a=this.texelByteSize,i=this.bytesPerRow,o=this.height,c=this.data[s];!function(e,t,n,s,r,a,i,o,c,l){const u=s*(i>>=r)*(a>>=r)+n*i+t*o;switch(c){case 'r8unorm':return void T(e,u,'8unorm',1,l);case 'r8snorm':return void T(e,u,'8snorm',1,l);case 'r8uint':return void T(e,u,'8uint',1,l);case 'r8sint':return void T(e,u,'8sint',1,l);case 'rg8unorm':return void T(e,u,'8unorm',2,l);case 'rg8snorm':return void T(e,u,'8snorm',2,l);case 'rg8uint':return void T(e,u,'8uint',2,l);case 'rg8sint':return void T(e,u,'8sint',2,l);case 'rgba8unorm-srgb':case 'rgba8unorm':case 'bgra8unorm-srgb':case 'bgra8unorm':return void T(e,u,'8unorm',4,l);case 'rgba8snorm':return void T(e,u,'8snorm',4,l);case 'rgba8uint':return void T(e,u,'8uint',4,l);case 'rgba8sint':return void T(e,u,'8sint',4,l);case 'r16uint':return void T(e,u,'16uint',1,l);case 'r16sint':return void T(e,u,'16sint',1,l);case 'r16float':return void T(e,u,'16float',1,l);case 'rg16uint':return void T(e,u,'16uint',2,l);case 'rg16sint':return void T(e,u,'16sint',2,l);case 'rg16float':return void T(e,u,'16float',2,l);case 'rgba16uint':return void T(e,u,'16uint',4,l);case 'rgba16sint':return void T(e,u,'16sint',4,l);case 'rgba16float':return void T(e,u,'16float',4,l);case 'r32uint':return void T(e,u,'32uint',1,l);case 'r32sint':return void T(e,u,'32sint',1,l);case 'depth16unorm':case 'depth24plus':case 'depth24plus-stencil8':case 'depth32float':case 'depth32float-stencil8':case 'r32float':return void T(e,u,'32float',1,l);case 'rg32uint':return void T(e,u,'32uint',2,l);case 'rg32sint':return void T(e,u,'32sint',2,l);case 'rg32float':return void T(e,u,'32float',2,l);case 'rgba32uint':return void T(e,u,'32uint',4,l);case 'rgba32sint':return void T(e,u,'32sint',4,l);case 'rgba32float':return void T(e,u,'32float',4,l);case 'rg11b10ufloat':console.error('TODO: rg11b10ufloat not supported for writing');}}(new Uint8Array(c),e,t,n,s,o,i,a,this.format,r);}}(e=>{e[e.token=0]='token',e[e.keyword=1]='keyword',e[e.reserved=2]='reserved';})(z||(z={}));class qe{constructor(e,t,n){this.name=e,this.type=t,this.rule=n;}toString(){return this.name}}class He{}H=He,He.none=new qe('',z.reserved,''),He.eof=new qe('EOF',z.token,''),He.reserved={asm:new qe('asm',z.reserved,'asm'),bf16:new qe('bf16',z.reserved,'bf16'),do:new qe('do',z.reserved,'do'),enum:new qe('enum',z.reserved,'enum'),f16:new qe('f16',z.reserved,'f16'),f64:new qe('f64',z.reserved,'f64'),handle:new qe('handle',z.reserved,'handle'),i8:new qe('i8',z.reserved,'i8'),i16:new qe('i16',z.reserved,'i16'),i64:new qe('i64',z.reserved,'i64'),mat:new qe('mat',z.reserved,'mat'),premerge:new qe('premerge',z.reserved,'premerge'),regardless:new qe('regardless',z.reserved,'regardless'),typedef:new qe('typedef',z.reserved,'typedef'),u8:new qe('u8',z.reserved,'u8'),u16:new qe('u16',z.reserved,'u16'),u64:new qe('u64',z.reserved,'u64'),unless:new qe('unless',z.reserved,'unless'),using:new qe('using',z.reserved,'using'),vec:new qe('vec',z.reserved,'vec'),void:new qe('void',z.reserved,'void')},He.keywords={array:new qe('array',z.keyword,'array'),atomic:new qe('atomic',z.keyword,'atomic'),bool:new qe('bool',z.keyword,'bool'),f32:new qe('f32',z.keyword,'f32'),i32:new qe('i32',z.keyword,'i32'),mat2x2:new qe('mat2x2',z.keyword,'mat2x2'),mat2x3:new qe('mat2x3',z.keyword,'mat2x3'),mat2x4:new qe('mat2x4',z.keyword,'mat2x4'),mat3x2:new qe('mat3x2',z.keyword,'mat3x2'),mat3x3:new qe('mat3x3',z.keyword,'mat3x3'),mat3x4:new qe('mat3x4',z.keyword,'mat3x4'),mat4x2:new qe('mat4x2',z.keyword,'mat4x2'),mat4x3:new qe('mat4x3',z.keyword,'mat4x3'),mat4x4:new qe('mat4x4',z.keyword,'mat4x4'),ptr:new qe('ptr',z.keyword,'ptr'),sampler:new qe('sampler',z.keyword,'sampler'),sampler_comparison:new qe('sampler_comparison',z.keyword,'sampler_comparison'),struct:new qe('struct',z.keyword,'struct'),texture_1d:new qe('texture_1d',z.keyword,'texture_1d'),texture_2d:new qe('texture_2d',z.keyword,'texture_2d'),texture_2d_array:new qe('texture_2d_array',z.keyword,'texture_2d_array'),texture_3d:new qe('texture_3d',z.keyword,'texture_3d'),texture_cube:new qe('texture_cube',z.keyword,'texture_cube'),texture_cube_array:new qe('texture_cube_array',z.keyword,'texture_cube_array'),texture_multisampled_2d:new qe('texture_multisampled_2d',z.keyword,'texture_multisampled_2d'),texture_storage_1d:new qe('texture_storage_1d',z.keyword,'texture_storage_1d'),texture_storage_2d:new qe('texture_storage_2d',z.keyword,'texture_storage_2d'),texture_storage_2d_array:new qe('texture_storage_2d_array',z.keyword,'texture_storage_2d_array'),texture_storage_3d:new qe('texture_storage_3d',z.keyword,'texture_storage_3d'),texture_depth_2d:new qe('texture_depth_2d',z.keyword,'texture_depth_2d'),texture_depth_2d_array:new qe('texture_depth_2d_array',z.keyword,'texture_depth_2d_array'),texture_depth_cube:new qe('texture_depth_cube',z.keyword,'texture_depth_cube'),texture_depth_cube_array:new qe('texture_depth_cube_array',z.keyword,'texture_depth_cube_array'),texture_depth_multisampled_2d:new qe('texture_depth_multisampled_2d',z.keyword,'texture_depth_multisampled_2d'),texture_external:new qe('texture_external',z.keyword,'texture_external'),u32:new qe('u32',z.keyword,'u32'),vec2:new qe('vec2',z.keyword,'vec2'),vec3:new qe('vec3',z.keyword,'vec3'),vec4:new qe('vec4',z.keyword,'vec4'),bitcast:new qe('bitcast',z.keyword,'bitcast'),block:new qe('block',z.keyword,'block'),break:new qe('break',z.keyword,'break'),case:new qe('case',z.keyword,'case'),continue:new qe('continue',z.keyword,'continue'),continuing:new qe('continuing',z.keyword,'continuing'),default:new qe('default',z.keyword,'default'),diagnostic:new qe('diagnostic',z.keyword,'diagnostic'),discard:new qe('discard',z.keyword,'discard'),else:new qe('else',z.keyword,'else'),enable:new qe('enable',z.keyword,'enable'),fallthrough:new qe('fallthrough',z.keyword,'fallthrough'),false:new qe('false',z.keyword,'false'),fn:new qe('fn',z.keyword,'fn'),for:new qe('for',z.keyword,'for'),function:new qe('function',z.keyword,'function'),if:new qe('if',z.keyword,'if'),let:new qe('let',z.keyword,'let'),const:new qe('const',z.keyword,'const'),loop:new qe('loop',z.keyword,'loop'),while:new qe('while',z.keyword,'while'),private:new qe('private',z.keyword,'private'),read:new qe('read',z.keyword,'read'),read_write:new qe('read_write',z.keyword,'read_write'),return:new qe('return',z.keyword,'return'),requires:new qe('requires',z.keyword,'requires'),storage:new qe('storage',z.keyword,'storage'),switch:new qe('switch',z.keyword,'switch'),true:new qe('true',z.keyword,'true'),alias:new qe('alias',z.keyword,'alias'),type:new qe('type',z.keyword,'type'),uniform:new qe('uniform',z.keyword,'uniform'),var:new qe('var',z.keyword,'var'),override:new qe('override',z.keyword,'override'),workgroup:new qe('workgroup',z.keyword,'workgroup'),write:new qe('write',z.keyword,'write'),r8unorm:new qe('r8unorm',z.keyword,'r8unorm'),r8snorm:new qe('r8snorm',z.keyword,'r8snorm'),r8uint:new qe('r8uint',z.keyword,'r8uint'),r8sint:new qe('r8sint',z.keyword,'r8sint'),r16uint:new qe('r16uint',z.keyword,'r16uint'),r16sint:new qe('r16sint',z.keyword,'r16sint'),r16float:new qe('r16float',z.keyword,'r16float'),rg8unorm:new qe('rg8unorm',z.keyword,'rg8unorm'),rg8snorm:new qe('rg8snorm',z.keyword,'rg8snorm'),rg8uint:new qe('rg8uint',z.keyword,'rg8uint'),rg8sint:new qe('rg8sint',z.keyword,'rg8sint'),r32uint:new qe('r32uint',z.keyword,'r32uint'),r32sint:new qe('r32sint',z.keyword,'r32sint'),r32float:new qe('r32float',z.keyword,'r32float'),rg16uint:new qe('rg16uint',z.keyword,'rg16uint'),rg16sint:new qe('rg16sint',z.keyword,'rg16sint'),rg16float:new qe('rg16float',z.keyword,'rg16float'),rgba8unorm:new qe('rgba8unorm',z.keyword,'rgba8unorm'),rgba8unorm_srgb:new qe('rgba8unorm_srgb',z.keyword,'rgba8unorm_srgb'),rgba8snorm:new qe('rgba8snorm',z.keyword,'rgba8snorm'),rgba8uint:new qe('rgba8uint',z.keyword,'rgba8uint'),rgba8sint:new qe('rgba8sint',z.keyword,'rgba8sint'),bgra8unorm:new qe('bgra8unorm',z.keyword,'bgra8unorm'),bgra8unorm_srgb:new qe('bgra8unorm_srgb',z.keyword,'bgra8unorm_srgb'),rgb10a2unorm:new qe('rgb10a2unorm',z.keyword,'rgb10a2unorm'),rg11b10float:new qe('rg11b10float',z.keyword,'rg11b10float'),rg32uint:new qe('rg32uint',z.keyword,'rg32uint'),rg32sint:new qe('rg32sint',z.keyword,'rg32sint'),rg32float:new qe('rg32float',z.keyword,'rg32float'),rgba16uint:new qe('rgba16uint',z.keyword,'rgba16uint'),rgba16sint:new qe('rgba16sint',z.keyword,'rgba16sint'),rgba16float:new qe('rgba16float',z.keyword,'rgba16float'),rgba32uint:new qe('rgba32uint',z.keyword,'rgba32uint'),rgba32sint:new qe('rgba32sint',z.keyword,'rgba32sint'),rgba32float:new qe('rgba32float',z.keyword,'rgba32float'),static_assert:new qe('static_assert',z.keyword,'static_assert')},He.tokens={decimal_float_literal:new qe('decimal_float_literal',z.token,/((-?[0-9]*\.[0-9]+|-?[0-9]+\.[0-9]*)((e|E)(\+|-)?[0-9]+)?[fh]?)|(-?[0-9]+(e|E)(\+|-)?[0-9]+[fh]?)|(-?[0-9]+[fh])/),hex_float_literal:new qe('hex_float_literal',z.token,/-?0x((([0-9a-fA-F]*\.[0-9a-fA-F]+|[0-9a-fA-F]+\.[0-9a-fA-F]*)((p|P)(\+|-)?[0-9]+[fh]?)?)|([0-9a-fA-F]+(p|P)(\+|-)?[0-9]+[fh]?))/),int_literal:new qe('int_literal',z.token,/-?0x[0-9a-fA-F]+|0i?|-?[1-9][0-9]*i?/),uint_literal:new qe('uint_literal',z.token,/0x[0-9a-fA-F]+u|0u|[1-9][0-9]*u/),name:new qe('name',z.token,/([_\p{XID_Start}][\p{XID_Continue}]+)|([\p{XID_Start}])/u),ident:new qe('ident',z.token,/[_a-zA-Z][0-9a-zA-Z_]*/),and:new qe('and',z.token,'&'),and_and:new qe('and_and',z.token,'&&'),arrow:new qe('arrow ',z.token,'->'),attr:new qe('attr',z.token,'@'),forward_slash:new qe('forward_slash',z.token,'/'),bang:new qe('bang',z.token,'!'),bracket_left:new qe('bracket_left',z.token,'['),bracket_right:new qe('bracket_right',z.token,']'),brace_left:new qe('brace_left',z.token,'{'),brace_right:new qe('brace_right',z.token,'}'),colon:new qe('colon',z.token,':'),comma:new qe('comma',z.token,','),equal:new qe('equal',z.token,'='),equal_equal:new qe('equal_equal',z.token,'=='),not_equal:new qe('not_equal',z.token,'!='),greater_than:new qe('greater_than',z.token,'>'),greater_than_equal:new qe('greater_than_equal',z.token,'>='),shift_right:new qe('shift_right',z.token,'>>'),less_than:new qe('less_than',z.token,'<'),less_than_equal:new qe('less_than_equal',z.token,'<='),shift_left:new qe('shift_left',z.token,'<<'),modulo:new qe('modulo',z.token,'%'),minus:new qe('minus',z.token,'-'),minus_minus:new qe('minus_minus',z.token,'--'),period:new qe('period',z.token,'.'),plus:new qe('plus',z.token,'+'),plus_plus:new qe('plus_plus',z.token,'++'),or:new qe('or',z.token,'|'),or_or:new qe('or_or',z.token,'||'),paren_left:new qe('paren_left',z.token,'('),paren_right:new qe('paren_right',z.token,')'),semicolon:new qe('semicolon',z.token,';'),star:new qe('star',z.token,'*'),tilde:new qe('tilde',z.token,'~'),underscore:new qe('underscore',z.token,'_'),xor:new qe('xor',z.token,'^'),plus_equal:new qe('plus_equal',z.token,'+='),minus_equal:new qe('minus_equal',z.token,'-='),times_equal:new qe('times_equal',z.token,'*='),division_equal:new qe('division_equal',z.token,'/='),modulo_equal:new qe('modulo_equal',z.token,'%='),and_equal:new qe('and_equal',z.token,'&='),or_equal:new qe('or_equal',z.token,'|='),xor_equal:new qe('xor_equal',z.token,'^='),shift_right_equal:new qe('shift_right_equal',z.token,'>>='),shift_left_equal:new qe('shift_left_equal',z.token,'<<=')},He.simpleTokens={'@':H.tokens.attr,'{':H.tokens.brace_left,'}':H.tokens.brace_right,':':H.tokens.colon,',':H.tokens.comma,'(':H.tokens.paren_left,')':H.tokens.paren_right,';':H.tokens.semicolon},He.literalTokens={'&':H.tokens.and,'&&':H.tokens.and_and,'->':H.tokens.arrow,'/':H.tokens.forward_slash,'!':H.tokens.bang,'[':H.tokens.bracket_left,']':H.tokens.bracket_right,'=':H.tokens.equal,'==':H.tokens.equal_equal,'!=':H.tokens.not_equal,'>':H.tokens.greater_than,'>=':H.tokens.greater_than_equal,'>>':H.tokens.shift_right,'<':H.tokens.less_than,'<=':H.tokens.less_than_equal,'<<':H.tokens.shift_left,'%':H.tokens.modulo,'-':H.tokens.minus,'--':H.tokens.minus_minus,'.':H.tokens.period,'+':H.tokens.plus,'++':H.tokens.plus_plus,'|':H.tokens.or,'||':H.tokens.or_or,'*':H.tokens.star,'~':H.tokens.tilde,_:H.tokens.underscore,'^':H.tokens.xor,'+=':H.tokens.plus_equal,'-=':H.tokens.minus_equal,'*=':H.tokens.times_equal,'/=':H.tokens.division_equal,'%=':H.tokens.modulo_equal,'&=':H.tokens.and_equal,'|=':H.tokens.or_equal,'^=':H.tokens.xor_equal,'>>=':H.tokens.shift_right_equal,'<<=':H.tokens.shift_left_equal},He.regexTokens={decimal_float_literal:H.tokens.decimal_float_literal,hex_float_literal:H.tokens.hex_float_literal,int_literal:H.tokens.int_literal,uint_literal:H.tokens.uint_literal,ident:H.tokens.ident},He.storage_class=[H.keywords.function,H.keywords.private,H.keywords.workgroup,H.keywords.uniform,H.keywords.storage],He.access_mode=[H.keywords.read,H.keywords.write,H.keywords.read_write],He.sampler_type=[H.keywords.sampler,H.keywords.sampler_comparison],He.sampled_texture_type=[H.keywords.texture_1d,H.keywords.texture_2d,H.keywords.texture_2d_array,H.keywords.texture_3d,H.keywords.texture_cube,H.keywords.texture_cube_array],He.multisampled_texture_type=[H.keywords.texture_multisampled_2d],He.storage_texture_type=[H.keywords.texture_storage_1d,H.keywords.texture_storage_2d,H.keywords.texture_storage_2d_array,H.keywords.texture_storage_3d],He.depth_texture_type=[H.keywords.texture_depth_2d,H.keywords.texture_depth_2d_array,H.keywords.texture_depth_cube,H.keywords.texture_depth_cube_array,H.keywords.texture_depth_multisampled_2d],He.texture_external_type=[H.keywords.texture_external],He.any_texture_type=[...H.sampled_texture_type,...H.multisampled_texture_type,...H.storage_texture_type,...H.depth_texture_type,...H.texture_external_type],He.texel_format=[H.keywords.r8unorm,H.keywords.r8snorm,H.keywords.r8uint,H.keywords.r8sint,H.keywords.r16uint,H.keywords.r16sint,H.keywords.r16float,H.keywords.rg8unorm,H.keywords.rg8snorm,H.keywords.rg8uint,H.keywords.rg8sint,H.keywords.r32uint,H.keywords.r32sint,H.keywords.r32float,H.keywords.rg16uint,H.keywords.rg16sint,H.keywords.rg16float,H.keywords.rgba8unorm,H.keywords.rgba8unorm_srgb,H.keywords.rgba8snorm,H.keywords.rgba8uint,H.keywords.rgba8sint,H.keywords.bgra8unorm,H.keywords.bgra8unorm_srgb,H.keywords.rgb10a2unorm,H.keywords.rg11b10float,H.keywords.rg32uint,H.keywords.rg32sint,H.keywords.rg32float,H.keywords.rgba16uint,H.keywords.rgba16sint,H.keywords.rgba16float,H.keywords.rgba32uint,H.keywords.rgba32sint,H.keywords.rgba32float],He.const_literal=[H.tokens.int_literal,H.tokens.uint_literal,H.tokens.decimal_float_literal,H.tokens.hex_float_literal,H.keywords.true,H.keywords.false],He.literal_or_ident=[H.tokens.ident,H.tokens.int_literal,H.tokens.uint_literal,H.tokens.decimal_float_literal,H.tokens.hex_float_literal,H.tokens.name],He.element_count_expression=[H.tokens.int_literal,H.tokens.uint_literal,H.tokens.ident],He.template_types=[H.keywords.vec2,H.keywords.vec3,H.keywords.vec4,H.keywords.mat2x2,H.keywords.mat2x3,H.keywords.mat2x4,H.keywords.mat3x2,H.keywords.mat3x3,H.keywords.mat3x4,H.keywords.mat4x2,H.keywords.mat4x3,H.keywords.mat4x4,H.keywords.atomic,H.keywords.bitcast,...H.any_texture_type],He.attribute_name=[H.tokens.ident,H.keywords.block,H.keywords.diagnostic],He.assignment_operators=[H.tokens.equal,H.tokens.plus_equal,H.tokens.minus_equal,H.tokens.times_equal,H.tokens.division_equal,H.tokens.modulo_equal,H.tokens.and_equal,H.tokens.or_equal,H.tokens.xor_equal,H.tokens.shift_right_equal,H.tokens.shift_left_equal],He.increment_operators=[H.tokens.plus_plus,H.tokens.minus_minus];class ze{constructor(e,t,n,s,r){this.type=e,this.lexeme=t,this.line=n,this.start=s,this.end=r;}toString(){return this.lexeme}isTemplateType(){return  -1!=He.template_types.indexOf(this.type)}isArrayType(){return this.type==He.keywords.array}isArrayOrTemplateType(){return this.isArrayType()||this.isTemplateType()}}class Re{constructor(e){this._tokens=[],this._start=0,this._current=0,this._line=1,this._source=null!=e?e:'';}scanTokens(){for(;!this._isAtEnd();)if(this._start=this._current,!this.scanToken())throw `Invalid syntax at line ${this._line}`;return this._tokens.push(new ze(He.eof,'',this._line,this._current,this._current)),this._tokens}scanToken(){let e=this._advance();if('\n'==e)return this._line++,true;if(this._isWhitespace(e))return  true;if('/'==e){if('/'==this._peekAhead()){for(;'\n'!=e;){if(this._isAtEnd())return  true;e=this._advance();}return this._line++,true}if('*'==this._peekAhead()){this._advance();let t=1;for(;t>0;){if(this._isAtEnd())return  true;if(e=this._advance(),'\n'==e)this._line++;else if('*'==e){if('/'==this._peekAhead()&&(this._advance(),t--,0==t))return  true}else '/'==e&&'*'==this._peekAhead()&&(this._advance(),t++);}return  true}}const t=He.simpleTokens[e];if(t)return this._addToken(t),true;let n=He.none;const s=this._isAlpha(e),r='_'===e;if(this._isAlphaNumeric(e)){let t=this._peekAhead();for(;this._isAlphaNumeric(t);)e+=this._advance(),t=this._peekAhead();}if(s){const t=He.keywords[e];if(t)return this._addToken(t),true}if(s||r)return this._addToken(He.tokens.ident),true;for(;;){let t=this._findType(e);const s=this._peekAhead();if('-'==e&&this._tokens.length>0){if('='==s)return this._current++,e+=s,this._addToken(He.tokens.minus_equal),true;if('-'==s)return this._current++,e+=s,this._addToken(He.tokens.minus_minus),true;const n=this._tokens.length-1;if((-1!=He.literal_or_ident.indexOf(this._tokens[n].type)||this._tokens[n].type==He.tokens.paren_right)&&'>'!=s)return this._addToken(t),true}if('>'==e&&('>'==s||'='==s)){let e=false,n=this._tokens.length-1;for(let t=0;t<5&&n>=0&&-1===He.assignment_operators.indexOf(this._tokens[n].type);++t,--n)if(this._tokens[n].type===He.tokens.less_than){n>0&&this._tokens[n-1].isArrayOrTemplateType()&&(e=true);break}if(e)return this._addToken(t),true}if(t===He.none){let s=e,r=0;const a=2;for(let e=0;e<a;++e)if(s+=this._peekAhead(e),t=this._findType(s),t!==He.none){r=e;break}if(t===He.none)return n!==He.none&&(this._current--,this._addToken(n),true);e=s,this._current+=r+1;}if(n=t,this._isAtEnd())break;e+=this._advance();}return n!==He.none&&(this._addToken(n),true)}_findType(e){for(const t in He.regexTokens){const n=He.regexTokens[t];if(this._match(e,n.rule))return n}const t=He.literalTokens[e];return t||He.none}_match(e,t){const n=t.exec(e);return n&&0==n.index&&n[0]==e}_isAtEnd(){return this._current>=this._source.length}_isAlpha(e){return !this._isNumeric(e)&&!this._isWhitespace(e)&&'_'!==e&&'.'!==e&&'('!==e&&')'!==e&&'['!==e&&']'!==e&&'{'!==e&&'}'!==e&&','!==e&&';'!==e&&':'!==e&&'='!==e&&'!'!==e&&'<'!==e&&'>'!==e&&'+'!==e&&'-'!==e&&'*'!==e&&'/'!==e&&'%'!==e&&'&'!==e&&'|'!==e&&'^'!==e&&'~'!==e&&'@'!==e&&'#'!==e&&'?'!==e&&'\''!==e&&'`'!==e&&'"'!==e&&'\\'!==e&&'\n'!==e&&'\r'!==e&&'\t'!==e&&'\0'!==e}_isNumeric(e){return e>='0'&&e<='9'}_isAlphaNumeric(e){return this._isAlpha(e)||this._isNumeric(e)||'_'===e}_isWhitespace(e){return ' '==e||'\t'==e||'\r'==e}_advance(e=0){let t=this._source[this._current];return e=e||0,e++,this._current+=e,t}_peekAhead(e=0){return e=e||0,this._current+e>=this._source.length?'\0':this._source[this._current+e]}_addToken(e){const t=this._source.substring(this._start,this._current);this._tokens.push(new ze(e,t,this._line,this._start,this._current));}}function Ge(e){return Array.isArray(e)||(null==e?void 0:e.buffer)instanceof ArrayBuffer}const Xe=new Float32Array(1),je=new Uint32Array(Xe.buffer),Ze=new Uint32Array(Xe.buffer),Qe=new Int32Array(1),Ye=new Float32Array(Qe.buffer),Ke=new Uint32Array(Qe.buffer),Je=new Uint32Array(1),et=new Float32Array(Je.buffer),tt=new Int32Array(Je.buffer);function nt(e,t,n){if(t===n)return e;if('f32'===t){if('i32'===n||'x32'===n)return Xe[0]=e,je[0];if('u32'===n)return Xe[0]=e,Ze[0]}else if('i32'===t||'x32'===t){if('f32'===n)return Qe[0]=e,Ye[0];if('u32'===n)return Qe[0]=e,Ke[0]}else if('u32'===t){if('f32'===n)return Je[0]=e,et[0];if('i32'===n||'x32'===n)return Je[0]=e,tt[0]}return console.error(`Unsupported cast from ${t} to ${n}`),e}class st{constructor(e){this.resources=null,this.inUse=false,this.info=null,this.node=e;}}class rt{constructor(e,t){this.align=e,this.size=t;}}class at{constructor(){this.uniforms=[],this.storage=[],this.textures=[],this.samplers=[],this.aliases=[],this.overrides=[],this.structs=[],this.entry=new d,this.functions=[],this._types=new Map,this._functions=new Map;}_isStorageTexture(e){return 'texture_storage_1d'==e.name||'texture_storage_2d'==e.name||'texture_storage_2d_array'==e.name||'texture_storage_3d'==e.name}updateAST(e){for(const t of e)t instanceof D&&this._functions.set(t.name,new st(t));for(const t of e)if(t instanceof oe){const e=this.getTypeInfo(t,null);e instanceof n&&this.structs.push(e);}for(const t of e)if(t instanceof te)this.aliases.push(this._getAliasInfo(t));else {if(t instanceof M){const e=t,n=this._getAttributeNum(e.attributes,'id',0),s=null!=e.type?this.getTypeInfo(e.type,e.attributes):null;this.overrides.push(new h(e.name,s,e.attributes,n));continue}if(this._isUniformVar(t)){const e=t,n=this._getAttributeNum(e.attributes,'group',0),s=this._getAttributeNum(e.attributes,'binding',0),r=this.getTypeInfo(e.type,e.attributes),a=new o(e.name,r,n,s,e.attributes,i.Uniform,e.access);a.access||(a.access='read'),this.uniforms.push(a);continue}if(this._isStorageVar(t)){const e=t,n=this._getAttributeNum(e.attributes,'group',0),s=this._getAttributeNum(e.attributes,'binding',0),r=this.getTypeInfo(e.type,e.attributes),a=this._isStorageTexture(r),c=new o(e.name,r,n,s,e.attributes,a?i.StorageTexture:i.Storage,e.access);c.access||(c.access='read'),this.storage.push(c);continue}if(this._isTextureVar(t)){const e=t,n=this._getAttributeNum(e.attributes,'group',0),s=this._getAttributeNum(e.attributes,'binding',0),r=this.getTypeInfo(e.type,e.attributes),a=this._isStorageTexture(r),c=new o(e.name,r,n,s,e.attributes,a?i.StorageTexture:i.Texture,e.access);c.access||(c.access='read'),a?this.storage.push(c):this.textures.push(c);continue}if(this._isSamplerVar(t)){const e=t,n=this._getAttributeNum(e.attributes,'group',0),s=this._getAttributeNum(e.attributes,'binding',0),r=this.getTypeInfo(e.type,e.attributes),a=new o(e.name,r,n,s,e.attributes,i.Sampler,e.access);this.samplers.push(a);continue}}for(const t of e)if(t instanceof D){const e=this._getAttribute(t,'vertex'),n=this._getAttribute(t,'fragment'),s=this._getAttribute(t,'compute'),r=e||n||s,a=new p(t.name,null==r?void 0:r.name,t.attributes);a.attributes=t.attributes,a.startLine=t.startLine,a.endLine=t.endLine,this.functions.push(a),this._functions.get(t.name).info=a,r&&(this._functions.get(t.name).inUse=true,a.inUse=true,a.resources=this._findResources(t,!!r),a.inputs=this._getInputs(t.args),a.outputs=this._getOutputs(t.returnType),this.entry[r.name].push(a)),a.arguments=t.args.map(e=>new f(e.name,this.getTypeInfo(e.type,e.attributes),e.attributes)),a.returnType=t.returnType?this.getTypeInfo(t.returnType,t.attributes):null;continue}for(const e of this._functions.values())e.info&&(e.info.inUse=e.inUse,this._addCalls(e.node,e.info.calls));for(const e of this._functions.values())e.node.search(t=>{var n,s,r;if(t instanceof De){if(t.value)if(Ge(t.value))for(const s of t.value)for(const t of this.overrides)s===t.name&&(null===(n=e.info)||void 0===n||n.overrides.push(t));else for(const n of this.overrides)t.value===n.name&&(null===(s=e.info)||void 0===s||s.overrides.push(n));}else if(t instanceof ge)for(const n of this.overrides)t.name===n.name&&(null===(r=e.info)||void 0===r||r.overrides.push(n));});for(const e of this.uniforms)this._markStructsInUse(e.type);for(const e of this.storage)this._markStructsInUse(e.type);}getFunctionInfo(e){for(const t of this.functions)if(t.name==e)return t;return null}getStructInfo(e){for(const t of this.structs)if(t.name==e)return t;return null}getOverrideInfo(e){for(const t of this.overrides)if(t.name==e)return t;return null}_markStructsInUse(e){if(e)if(e.isStruct){if(e.inUse=true,e.members)for(const t of e.members)this._markStructsInUse(t.type);}else if(e.isArray)this._markStructsInUse(e.format);else if(e.isTemplate)e.format&&this._markStructsInUse(e.format);else {const t=this._getAlias(e.name);t&&this._markStructsInUse(t);}}_addCalls(e,t){var n;for(const s of e.calls){const e=null===(n=this._functions.get(s.name))||void 0===n?void 0:n.info;e&&t.add(e);}}findResource(e,t,n){if(n){for(const s of this.entry.compute)if(s.name===n)for(const n of s.resources)if(n.group==e&&n.binding==t)return n;for(const s of this.entry.vertex)if(s.name===n)for(const n of s.resources)if(n.group==e&&n.binding==t)return n;for(const s of this.entry.fragment)if(s.name===n)for(const n of s.resources)if(n.group==e&&n.binding==t)return n}for(const n of this.uniforms)if(n.group==e&&n.binding==t)return n;for(const n of this.storage)if(n.group==e&&n.binding==t)return n;for(const n of this.textures)if(n.group==e&&n.binding==t)return n;for(const n of this.samplers)if(n.group==e&&n.binding==t)return n;return null}_findResource(e){for(const t of this.uniforms)if(t.name==e)return t;for(const t of this.storage)if(t.name==e)return t;for(const t of this.textures)if(t.name==e)return t;for(const t of this.samplers)if(t.name==e)return t;return null}_markStructsFromAST(e){const t=this.getTypeInfo(e,null);this._markStructsInUse(t);}_findResources(e,t){const n=[],s=this,r=[];return e.search(a=>{if(a instanceof E)r.push({});else if(a instanceof $)r.pop();else if(a instanceof F){const e=a;t&&null!==e.type&&this._markStructsFromAST(e.type),r.length>0&&(r[r.length-1][e.name]=e);}else if(a instanceof de){const e=a;t&&null!==e.type&&this._markStructsFromAST(e.type);}else if(a instanceof U){const e=a;t&&null!==e.type&&this._markStructsFromAST(e.type),r.length>0&&(r[r.length-1][e.name]=e);}else if(a instanceof ge){const e=a;if(r.length>0){if(r[r.length-1][e.name])return}const t=s._findResource(e.name);t&&n.push(t);}else if(a instanceof me){const r=a,i=s._functions.get(r.name);i&&(t&&(i.inUse=true),e.calls.add(i.node),null===i.resources&&(i.resources=s._findResources(i.node,t)),n.push(...i.resources));}else if(a instanceof X){const r=a,i=s._functions.get(r.name);i&&(t&&(i.inUse=true),e.calls.add(i.node),null===i.resources&&(i.resources=s._findResources(i.node,t)),n.push(...i.resources));}}),[...new Map(n.map(e=>[e.name,e])).values()]}getBindGroups(){const e=[];function t(t,n){t>=e.length&&(e.length=t+1),void 0===e[t]&&(e[t]=[]),n>=e[t].length&&(e[t].length=n+1);}for(const n of this.uniforms){t(n.group,n.binding);e[n.group][n.binding]=n;}for(const n of this.storage){t(n.group,n.binding);e[n.group][n.binding]=n;}for(const n of this.textures){t(n.group,n.binding);e[n.group][n.binding]=n;}for(const n of this.samplers){t(n.group,n.binding);e[n.group][n.binding]=n;}return e}_getOutputs(e,t=void 0){if(void 0===t&&(t=[]),e instanceof oe)this._getStructOutputs(e,t);else {const n=this._getOutputInfo(e);null!==n&&t.push(n);}return t}_getStructOutputs(e,t){for(const n of e.members)if(n.type instanceof oe)this._getStructOutputs(n.type,t);else {const e=this._getAttribute(n,'location')||this._getAttribute(n,'builtin');if(null!==e){const s=this.getTypeInfo(n.type,n.type.attributes),r=this._parseInt(e.value),a=new u(n.name,s,e.name,r);t.push(a);}}}_getOutputInfo(e){const t=this._getAttribute(e,'location')||this._getAttribute(e,'builtin');if(null!==t){const n=this.getTypeInfo(e,e.attributes),s=this._parseInt(t.value);return new u('',n,t.name,s)}return null}_getInputs(e,t=void 0){ void 0===t&&(t=[]);for(const n of e)if(n.type instanceof oe)this._getStructInputs(n.type,t);else {const e=this._getInputInfo(n);null!==e&&t.push(e);}return t}_getStructInputs(e,t){for(const n of e.members)if(n.type instanceof oe)this._getStructInputs(n.type,t);else {const e=this._getInputInfo(n);null!==e&&t.push(e);}}_getInputInfo(e){const t=this._getAttribute(e,'location')||this._getAttribute(e,'builtin');if(null!==t){const n=this._getAttribute(e,'interpolation'),s=this.getTypeInfo(e.type,e.attributes),r=this._parseInt(t.value),a=new l(e.name,s,t.name,r);return null!==n&&(a.interpolation=this._parseString(n.value)),a}return null}_parseString(e){return e instanceof Array&&(e=e[0]),e}_parseInt(e){e instanceof Array&&(e=e[0]);const t=parseInt(e);return isNaN(t)?e:t}_getAlias(e){for(const t of this.aliases)if(t.name==e)return t.type;return null}_getAliasInfo(e){return new c(e.name,this.getTypeInfo(e.type,null))}getTypeInfoByName(e){for(const t of this.structs)if(t.name==e)return t;for(const t of this.aliases)if(t.name==e)return t.type;return null}getTypeInfo(i,o=null){if(this._types.has(i))return this._types.get(i);if(i instanceof le){const e=i.type?this.getTypeInfo(i.type,i.attributes):null,t=new r(i.name,e,o);return this._types.set(i,t),this._updateTypeInfo(t),t}if(i instanceof ue){const e=i,t=e.format?this.getTypeInfo(e.format,e.attributes):null,n=new s(e.name,o);return n.format=t,n.count=e.count,this._types.set(i,n),this._updateTypeInfo(n),n}if(i instanceof oe){const e=i,s=new n(e.name,o);s.startLine=e.startLine,s.endLine=e.endLine;for(const n of e.members){const e=this.getTypeInfo(n.type,n.attributes);s.members.push(new t(n.name,e,n.attributes));}return this._types.set(i,s),this._updateTypeInfo(s),s}if(i instanceof he){const t=i,n=t.format instanceof ae,s=t.format?n?this.getTypeInfo(t.format,null):new e(t.format,null):null,r=new a(t.name,s,o,t.access);return this._types.set(i,r),this._updateTypeInfo(r),r}if(i instanceof ce){const e=i,t=e.format?this.getTypeInfo(e.format,null):null,n=new a(e.name,t,o,e.access);return this._types.set(i,n),this._updateTypeInfo(n),n}const c=new e(i.name,o);return this._types.set(i,c),this._updateTypeInfo(c),c}_updateTypeInfo(e){var t,a,i;const o=this._getTypeSize(e);if(e.size=null!==(t=null==o?void 0:o.size)&&void 0!==t?t:0,e instanceof s&&e.format){const t=this._getTypeSize(e.format);e.stride=Math.max(null!==(a=null==t?void 0:t.size)&&void 0!==a?a:0,null!==(i=null==t?void 0:t.align)&&void 0!==i?i:0),this._updateTypeInfo(e.format);}e instanceof r&&this._updateTypeInfo(e.format),e instanceof n&&this._updateStructInfo(e);}_updateStructInfo(e){var t;let n=0,s=0,r=0,a=0;for(let i=0,o=e.members.length;i<o;++i){const o=e.members[i],c=this._getTypeSize(o);if(!c)continue;null!==(t=this._getAlias(o.type.name))&&void 0!==t||o.type;const l=c.align,u=c.size;n=this._roundUp(l,n+s),s=u,r=n,a=Math.max(a,l),o.offset=n,o.size=u,this._updateTypeInfo(o.type);}e.size=this._roundUp(a,r+s),e.align=a;}_getTypeSize(r){var a,i;if(null==r)return null;const o=this._getAttributeNum(r.attributes,'size',0),c=this._getAttributeNum(r.attributes,'align',0);if(r instanceof t&&(r=r.type),r instanceof e){const e=this._getAlias(r.name);null!==e&&(r=e);}{const e=at._typeInfo[r.name];if(void 0!==e){const t='f16'===(null===(a=r.format)||void 0===a?void 0:a.name)?2:1;return new rt(Math.max(c,e.align/t),Math.max(o,e.size/t))}}{const e=at._typeInfo[r.name.substring(0,r.name.length-1)];if(e){const t='h'===r.name[r.name.length-1]?2:1;return new rt(Math.max(c,e.align/t),Math.max(o,e.size/t))}}if(r instanceof s){let e=r,t=8,n=8;const s=this._getTypeSize(e.format);null!==s&&(n=s.size,t=s.align);return n=e.count*this._getAttributeNum(null!==(i=null==r?void 0:r.attributes)&&void 0!==i?i:null,'stride',this._roundUp(t,n)),o&&(n=o),new rt(Math.max(c,t),Math.max(o,n))}if(r instanceof n){let e=0,t=0,n=0,s=0,a=0;for(const t of r.members){const r=this._getTypeSize(t.type);null!==r&&(e=Math.max(r.align,e),n=this._roundUp(r.align,n+s),s=r.size,a=n);}return t=this._roundUp(e,a+s),new rt(Math.max(c,e),Math.max(o,t))}return null}_isUniformVar(e){return e instanceof F&&'uniform'==e.storage}_isStorageVar(e){return e instanceof F&&'storage'==e.storage}_isTextureVar(e){return e instanceof F&&null!==e.type&&-1!=at._textureTypes.indexOf(e.type.name)}_isSamplerVar(e){return e instanceof F&&null!==e.type&&-1!=at._samplerTypes.indexOf(e.type.name)}_getAttribute(e,t){const n=e;if(!n||!n.attributes)return null;const s=n.attributes;for(let e of s)if(e.name==t)return e;return null}_getAttributeNum(e,t,n){if(null===e)return n;for(let s of e)if(s.name==t){let e=null!==s&&null!==s.value?s.value:n;return e instanceof Array&&(e=e[0]),'number'==typeof e?e:'string'==typeof e?parseInt(e):n}return n}_roundUp(e,t){return Math.ceil(t/e)*e}}at._typeInfo={f16:{align:2,size:2},i32:{align:4,size:4},u32:{align:4,size:4},f32:{align:4,size:4},atomic:{align:4,size:4},vec2:{align:8,size:8},vec3:{align:16,size:12},vec4:{align:16,size:16},mat2x2:{align:8,size:16},mat3x2:{align:8,size:24},mat4x2:{align:8,size:32},mat2x3:{align:16,size:32},mat3x3:{align:16,size:48},mat4x3:{align:16,size:64},mat2x4:{align:16,size:32},mat3x4:{align:16,size:48},mat4x4:{align:16,size:64}},at._textureTypes=He.any_texture_type.map(e=>e.name),at._samplerTypes=He.sampler_type.map(e=>e.name);let it=0;class ot{constructor(e,t,n){this.id=it++,this.name=e,this.value=t,this.node=n;}clone(){return new ot(this.name,this.value,this.node)}}class ct{constructor(e){this.id=it++,this.name=e.name,this.node=e;}clone(){return new ct(this.node)}}class lt{constructor(e){this.parent=null,this.variables=new Map,this.functions=new Map,this.currentFunctionName='',this.id=it++,e&&(this.parent=e,this.currentFunctionName=e.currentFunctionName);}getVariable(e){var t;return this.variables.has(e)?null!==(t=this.variables.get(e))&&void 0!==t?t:null:this.parent?this.parent.getVariable(e):null}getFunction(e){var t;return this.functions.has(e)?null!==(t=this.functions.get(e))&&void 0!==t?t:null:this.parent?this.parent.getFunction(e):null}createVariable(e,t,n){this.variables.set(e,new ot(e,t,null!=n?n:null));}setVariable(e,t,n){const s=this.getVariable(e);null!==s?s.value=t:this.createVariable(e,t,n);}getVariableValue(e){var t;const n=this.getVariable(e);return null!==(t=null==n?void 0:n.value)&&void 0!==t?t:null}clone(){return new lt(this)}}class ut{evalExpression(e,t){return null}getTypeInfo(e){return null}getVariableName(e,t){return ''}}class ht{constructor(e){this.exec=e;}getTypeInfo(e){return this.exec.getTypeInfo(e)}All(e,t){const n=this.exec.evalExpression(e.args[0],t);let s=true;if(n instanceof Me)return n.data.forEach(e=>{e||(s=false);}),new Be(s?1:0,this.getTypeInfo('bool'));throw new Error(`All() expects a vector argument. Line ${e.line}`)}Any(e,t){const n=this.exec.evalExpression(e.args[0],t);if(n instanceof Me){const e=n.data.some(e=>e);return new Be(e?1:0,this.getTypeInfo('bool'))}throw new Error(`Any() expects a vector argument. Line ${e.line}`)}Select(e,t){const n=this.exec.evalExpression(e.args[2],t);if(!(n instanceof Be))throw new Error(`Select() expects a bool condition. Line ${e.line}`);return n.value?this.exec.evalExpression(e.args[1],t):this.exec.evalExpression(e.args[0],t)}ArrayLength(e,t){let n=e.args[0];n instanceof ke&&(n=n.right);const s=this.exec.evalExpression(n,t);if(s instanceof Pe&&0===s.typeInfo.size){const e=s.typeInfo,t=s.buffer.byteLength/e.stride;return new Be(t,this.getTypeInfo('u32'))}return new Be(s.typeInfo.size,this.getTypeInfo('u32'))}Abs(e,t){const n=this.exec.evalExpression(e.args[0],t);if(n instanceof Me)return new Me(n.data.map(e=>Math.abs(e)),n.typeInfo);const s=n;return new Be(Math.abs(s.value),s.typeInfo)}Acos(e,t){const n=this.exec.evalExpression(e.args[0],t);if(n instanceof Me)return new Me(n.data.map(e=>Math.acos(e)),n.typeInfo);const s=n;return new Be(Math.acos(s.value),n.typeInfo)}Acosh(e,t){const n=this.exec.evalExpression(e.args[0],t);if(n instanceof Me)return new Me(n.data.map(e=>Math.acosh(e)),n.typeInfo);const s=n;return new Be(Math.acosh(s.value),n.typeInfo)}Asin(e,t){const n=this.exec.evalExpression(e.args[0],t);if(n instanceof Me)return new Me(n.data.map(e=>Math.asin(e)),n.typeInfo);const s=n;return new Be(Math.asin(s.value),n.typeInfo)}Asinh(e,t){const n=this.exec.evalExpression(e.args[0],t);if(n instanceof Me)return new Me(n.data.map(e=>Math.asinh(e)),n.typeInfo);const s=n;return new Be(Math.asinh(s.value),n.typeInfo)}Atan(e,t){const n=this.exec.evalExpression(e.args[0],t);if(n instanceof Me)return new Me(n.data.map(e=>Math.atan(e)),n.typeInfo);const s=n;return new Be(Math.atan(s.value),n.typeInfo)}Atanh(e,t){const n=this.exec.evalExpression(e.args[0],t);if(n instanceof Me)return new Me(n.data.map(e=>Math.atanh(e)),n.typeInfo);const s=n;return new Be(Math.atanh(s.value),n.typeInfo)}Atan2(e,t){const n=this.exec.evalExpression(e.args[0],t),s=this.exec.evalExpression(e.args[1],t);if(n instanceof Me&&s instanceof Me)return new Me(n.data.map((e,t)=>Math.atan2(e,s.data[t])),n.typeInfo);const r=n,a=s;return new Be(Math.atan2(r.value,a.value),n.typeInfo)}Ceil(e,t){const n=this.exec.evalExpression(e.args[0],t);if(n instanceof Me)return new Me(n.data.map(e=>Math.ceil(e)),n.typeInfo);const s=n;return new Be(Math.ceil(s.value),n.typeInfo)}_clamp(e,t,n){return Math.min(Math.max(e,t),n)}Clamp(e,t){const n=this.exec.evalExpression(e.args[0],t),s=this.exec.evalExpression(e.args[1],t),r=this.exec.evalExpression(e.args[2],t);if(n instanceof Me&&s instanceof Me&&r instanceof Me)return new Me(n.data.map((e,t)=>this._clamp(e,s.data[t],r.data[t])),n.typeInfo);const a=n,i=s,o=r;return new Be(this._clamp(a.value,i.value,o.value),n.typeInfo)}Cos(e,t){const n=this.exec.evalExpression(e.args[0],t);if(n instanceof Me)return new Me(n.data.map(e=>Math.cos(e)),n.typeInfo);const s=n;return new Be(Math.cos(s.value),n.typeInfo)}Cosh(e,t){const n=this.exec.evalExpression(e.args[0],t);if(n instanceof Me)return new Me(n.data.map(e=>Math.cosh(e)),n.typeInfo);const s=n;return new Be(Math.cos(s.value),n.typeInfo)}CountLeadingZeros(e,t){const n=this.exec.evalExpression(e.args[0],t);if(n instanceof Me)return new Me(n.data.map(e=>Math.clz32(e)),n.typeInfo);const s=n;return new Be(Math.clz32(s.value),n.typeInfo)}_countOneBits(e){let t=0;for(;0!==e;)1&e&&t++,e>>=1;return t}CountOneBits(e,t){const n=this.exec.evalExpression(e.args[0],t);if(n instanceof Me)return new Me(n.data.map(e=>this._countOneBits(e)),n.typeInfo);const s=n;return new Be(this._countOneBits(s.value),n.typeInfo)}_countTrailingZeros(e){if(0===e)return 32;let t=0;for(;!(1&e);)e>>=1,t++;return t}CountTrailingZeros(e,t){const n=this.exec.evalExpression(e.args[0],t);if(n instanceof Me)return new Me(n.data.map(e=>this._countTrailingZeros(e)),n.typeInfo);const s=n;return new Be(this._countTrailingZeros(s.value),n.typeInfo)}Cross(e,t){const n=this.exec.evalExpression(e.args[0],t),s=this.exec.evalExpression(e.args[1],t);if(n instanceof Me&&s instanceof Me){if(3!==n.data.length||3!==s.data.length)return console.error(`Cross() expects 3D vectors. Line ${e.line}`),null;const t=n.data,r=s.data;return new Me([t[1]*r[2]-r[1]*t[2],t[2]*r[0]-r[2]*t[0],t[0]*r[1]-r[0]*t[1]],n.typeInfo)}return console.error(`Cross() expects vector arguments. Line ${e.line}`),null}Degrees(e,t){const n=this.exec.evalExpression(e.args[0],t),s=180/Math.PI;if(n instanceof Me)return new Me(n.data.map(e=>e*s),n.typeInfo);return new Be(n.value*s,this.getTypeInfo('f32'))}Determinant(e,t){const n=this.exec.evalExpression(e.args[0],t);if(n instanceof Ue){const e=n.data,t=n.typeInfo.getTypeName(),s=t.endsWith('h')?this.getTypeInfo('f16'):this.getTypeInfo('f32');if('mat2x2'===t||'mat2x2f'===t||'mat2x2h'===t)return new Be(e[0]*e[3]-e[1]*e[2],s);if('mat2x3'===t||'mat2x3f'===t||'mat2x3h'===t)return new Be(e[0]*(e[4]*e[8]-e[5]*e[7])-e[1]*(e[3]*e[8]-e[5]*e[6])+e[2]*(e[3]*e[7]-e[4]*e[6]),s);if('mat2x4'===t||'mat2x4f'===t||'mat2x4h'===t)console.error(`TODO: Determinant for ${t}`);else if('mat3x2'===t||'mat3x2f'===t||'mat3x2h'===t)console.error(`TODO: Determinant for ${t}`);else {if('mat3x3'===t||'mat3x3f'===t||'mat3x3h'===t)return new Be(e[0]*(e[4]*e[8]-e[5]*e[7])-e[1]*(e[3]*e[8]-e[5]*e[6])+e[2]*(e[3]*e[7]-e[4]*e[6]),s);'mat3x4'===t||'mat3x4f'===t||'mat3x4h'===t||'mat4x2'===t||'mat4x2f'===t||'mat4x2h'===t||'mat4x3'===t||'mat4x3f'===t||'mat4x3h'===t?console.error(`TODO: Determinant for ${t}`):'mat4x4'!==t&&'mat4x4f'!==t&&'mat4x4h'!==t||console.error(`TODO: Determinant for ${t}`);}}return console.error(`Determinant expects a matrix argument. Line ${e.line}`),null}Distance(e,t){const n=this.exec.evalExpression(e.args[0],t),s=this.exec.evalExpression(e.args[1],t);if(n instanceof Me&&s instanceof Me){let e=0;for(let t=0;t<n.data.length;++t)e+=(n.data[t]-s.data[t])*(n.data[t]-s.data[t]);return new Be(Math.sqrt(e),this.getTypeInfo('f32'))}const r=n,a=s;return new Be(Math.abs(r.value-a.value),n.typeInfo)}_dot(e,t){let n=0;for(let s=0;s<e.length;++s)n+=t[s]*e[s];return n}Dot(e,t){const n=this.exec.evalExpression(e.args[0],t),s=this.exec.evalExpression(e.args[1],t);return n instanceof Me&&s instanceof Me?new Be(this._dot(n.data,s.data),this.getTypeInfo('f32')):(console.error(`Dot() expects vector arguments. Line ${e.line}`),null)}Dot4U8Packed(e,t){return console.error(`TODO: dot4U8Packed. Line ${e.line}`),null}Dot4I8Packed(e,t){return console.error(`TODO: dot4I8Packed. Line ${e.line}`),null}Exp(e,t){const n=this.exec.evalExpression(e.args[0],t);if(n instanceof Me)return new Me(n.data.map(e=>Math.exp(e)),n.typeInfo);const s=n;return new Be(Math.exp(s.value),n.typeInfo)}Exp2(e,t){const n=this.exec.evalExpression(e.args[0],t);if(n instanceof Me)return new Me(n.data.map(e=>Math.pow(2,e)),n.typeInfo);const s=n;return new Be(Math.pow(2,s.value),n.typeInfo)}ExtractBits(e,t){const n=this.exec.evalExpression(e.args[0],t),s=this.exec.evalExpression(e.args[1],t),r=this.exec.evalExpression(e.args[2],t);if('u32'!==s.typeInfo.name&&'x32'!==s.typeInfo.name)return console.error(`ExtractBits() expects an i32 offset argument. Line ${e.line}`),null;if('u32'!==r.typeInfo.name&&'x32'!==r.typeInfo.name)return console.error(`ExtractBits() expects an i32 count argument. Line ${e.line}`),null;const a=s.value,i=r.value;if(n instanceof Me)return new Me(n.data.map(e=>e>>a&(1<<i)-1),n.typeInfo);if('i32'!==n.typeInfo.name&&'x32'!==n.typeInfo.name)return console.error(`ExtractBits() expects an i32 argument. Line ${e.line}`),null;const o=n.value;return new Be(o>>a&(1<<i)-1,this.getTypeInfo('i32'))}FaceForward(e,t){const n=this.exec.evalExpression(e.args[0],t),s=this.exec.evalExpression(e.args[1],t),r=this.exec.evalExpression(e.args[2],t);if(n instanceof Me&&s instanceof Me&&r instanceof Me){const e=this._dot(s.data,r.data);return new Me(e<0?Array.from(n.data):n.data.map(e=>-e),n.typeInfo)}return console.error(`FaceForward() expects vector arguments. Line ${e.line}`),null}_firstLeadingBit(e){return 0===e?-1:31-Math.clz32(e)}FirstLeadingBit(e,t){const n=this.exec.evalExpression(e.args[0],t);if(n instanceof Me)return new Me(n.data.map(e=>this._firstLeadingBit(e)),n.typeInfo);const s=n;return new Be(this._firstLeadingBit(s.value),n.typeInfo)}_firstTrailingBit(e){return 0===e?-1:Math.log2(e&-e)}FirstTrailingBit(e,t){const n=this.exec.evalExpression(e.args[0],t);if(n instanceof Me)return new Me(n.data.map(e=>this._firstTrailingBit(e)),n.typeInfo);const s=n;return new Be(this._firstTrailingBit(s.value),n.typeInfo)}Floor(e,t){const n=this.exec.evalExpression(e.args[0],t);if(n instanceof Me)return new Me(n.data.map(e=>Math.floor(e)),n.typeInfo);const s=n;return new Be(Math.floor(s.value),n.typeInfo)}Fma(e,t){const n=this.exec.evalExpression(e.args[0],t),s=this.exec.evalExpression(e.args[1],t),r=this.exec.evalExpression(e.args[2],t);if(n instanceof Me&&s instanceof Me&&r instanceof Me)return n.data.length!==s.data.length||n.data.length!==r.data.length?(console.error(`Fma() expects vectors of the same length. Line ${e.line}`),null):new Me(n.data.map((e,t)=>e*s.data[t]+r.data[t]),n.typeInfo);const a=n,i=s,o=r;return new Be(a.value*i.value+o.value,a.typeInfo)}Fract(e,t){const n=this.exec.evalExpression(e.args[0],t);if(n instanceof Me)return new Me(n.data.map(e=>e-Math.floor(e)),n.typeInfo);const s=n;return new Be(s.value-Math.floor(s.value),n.typeInfo)}Frexp(e,t){return console.error(`TODO: frexp. Line ${e.line}`),null}InsertBits(e,t){const n=this.exec.evalExpression(e.args[0],t),s=this.exec.evalExpression(e.args[1],t),r=this.exec.evalExpression(e.args[2],t),a=this.exec.evalExpression(e.args[3],t);if('u32'!==r.typeInfo.name&&'x32'!==r.typeInfo.name)return console.error(`InsertBits() expects an i32 offset argument. Line ${e.line}`),null;const i=r.value,o=(1<<a.value)-1<<i,c=~o;if(n instanceof Me&&s instanceof Me)return new Me(n.data.map((e,t)=>e&c|s.data[t]<<i&o),n.typeInfo);const l=n.value,u=s.value;return new Be(l&c|u<<i&o,n.typeInfo)}InverseSqrt(e,t){const n=this.exec.evalExpression(e.args[0],t);if(n instanceof Me)return new Me(n.data.map(e=>1/Math.sqrt(e)),n.typeInfo);const s=n;return new Be(1/Math.sqrt(s.value),n.typeInfo)}Ldexp(e,t){return console.error(`TODO: ldexp. Line ${e.line}`),null}Length(e,t){const n=this.exec.evalExpression(e.args[0],t);if(n instanceof Me){let e=0;return n.data.forEach(t=>{e+=t*t;}),new Be(Math.sqrt(e),this.getTypeInfo('f32'))}const s=n;return new Be(Math.abs(s.value),n.typeInfo)}Log(e,t){const n=this.exec.evalExpression(e.args[0],t);if(n instanceof Me)return new Me(n.data.map(e=>Math.log(e)),n.typeInfo);const s=n;return new Be(Math.log(s.value),n.typeInfo)}Log2(e,t){const n=this.exec.evalExpression(e.args[0],t);if(n instanceof Me)return new Me(n.data.map(e=>Math.log2(e)),n.typeInfo);const s=n;return new Be(Math.log2(s.value),n.typeInfo)}Max(e,t){const n=this.exec.evalExpression(e.args[0],t),s=this.exec.evalExpression(e.args[1],t);if(n instanceof Me&&s instanceof Me)return new Me(n.data.map((e,t)=>Math.max(e,s.data[t])),n.typeInfo);const r=n,a=s;return new Be(Math.max(r.value,a.value),n.typeInfo)}Min(e,t){const n=this.exec.evalExpression(e.args[0],t),s=this.exec.evalExpression(e.args[1],t);if(n instanceof Me&&s instanceof Me)return new Me(n.data.map((e,t)=>Math.min(e,s.data[t])),n.typeInfo);const r=n,a=s;return new Be(Math.min(r.value,a.value),n.typeInfo)}Mix(e,t){const n=this.exec.evalExpression(e.args[0],t),s=this.exec.evalExpression(e.args[1],t),r=this.exec.evalExpression(e.args[2],t);if(n instanceof Me&&s instanceof Me&&r instanceof Me)return new Me(n.data.map((e,t)=>n.data[t]*(1-r.data[t])+s.data[t]*r.data[t]),n.typeInfo);const a=s,i=r;return new Be(n.value*(1-i.value)+a.value*i.value,n.typeInfo)}Modf(e,t){const n=this.exec.evalExpression(e.args[0],t),s=this.exec.evalExpression(e.args[1],t);if(n instanceof Me&&s instanceof Me)return new Me(n.data.map((e,t)=>e%s.data[t]),n.typeInfo);const r=s;return new Be(n.value%r.value,n.typeInfo)}Normalize(e,t){const n=this.exec.evalExpression(e.args[0],t);if(n instanceof Me){const s=this.Length(e,t).value;return new Me(n.data.map(e=>e/s),n.typeInfo)}return console.error(`Normalize() expects a vector argument. Line ${e.line}`),null}Pow(e,t){const n=this.exec.evalExpression(e.args[0],t),s=this.exec.evalExpression(e.args[1],t);if(n instanceof Me&&s instanceof Me)return new Me(n.data.map((e,t)=>Math.pow(e,s.data[t])),n.typeInfo);const r=n,a=s;return new Be(Math.pow(r.value,a.value),n.typeInfo)}QuantizeToF16(e,t){const n=this.exec.evalExpression(e.args[0],t);if(n instanceof Me)return new Me(n.data.map(e=>e),n.typeInfo);return new Be(n.value,n.typeInfo)}Radians(e,t){const n=this.exec.evalExpression(e.args[0],t);if(n instanceof Me)return new Me(n.data.map(e=>e*Math.PI/180),n.typeInfo);return new Be(n.value*Math.PI/180,this.getTypeInfo('f32'))}Reflect(e,t){let n=this.exec.evalExpression(e.args[0],t),s=this.exec.evalExpression(e.args[1],t);if(n instanceof Me&&s instanceof Me){const e=this._dot(n.data,s.data);return new Me(n.data.map((t,n)=>t-2*e*s.data[n]),n.typeInfo)}return console.error(`Reflect() expects vector arguments. Line ${e.line}`),null}Refract(e,t){let n=this.exec.evalExpression(e.args[0],t),s=this.exec.evalExpression(e.args[1],t),r=this.exec.evalExpression(e.args[2],t);if(n instanceof Me&&s instanceof Me&&r instanceof Be){const e=this._dot(s.data,n.data);return new Me(n.data.map((t,n)=>{const a=1-r.value*r.value*(1-e*e);if(a<0)return 0;const i=Math.sqrt(a);return r.value*t-(r.value*e+i)*s.data[n]}),n.typeInfo)}return console.error(`Refract() expects vector arguments and a scalar argument. Line ${e.line}`),null}ReverseBits(e,t){return console.error(`TODO: reverseBits. Line ${e.line}`),null}Round(e,t){const n=this.exec.evalExpression(e.args[0],t);if(n instanceof Me)return new Me(n.data.map(e=>Math.round(e)),n.typeInfo);const s=n;return new Be(Math.round(s.value),n.typeInfo)}Saturate(e,t){const n=this.exec.evalExpression(e.args[0],t);if(n instanceof Me)return new Me(n.data.map(e=>Math.min(Math.max(e,0),1)),n.typeInfo);const s=n;return new Be(Math.min(Math.max(s.value,0),1),n.typeInfo)}Sign(e,t){const n=this.exec.evalExpression(e.args[0],t);if(n instanceof Me)return new Me(n.data.map(e=>Math.sign(e)),n.typeInfo);const s=n;return new Be(Math.sign(s.value),n.typeInfo)}Sin(e,t){const n=this.exec.evalExpression(e.args[0],t);if(n instanceof Me)return new Me(n.data.map(e=>Math.sin(e)),n.typeInfo);const s=n;return new Be(Math.sin(s.value),n.typeInfo)}Sinh(e,t){const n=this.exec.evalExpression(e.args[0],t);if(n instanceof Me)return new Me(n.data.map(e=>Math.sinh(e)),n.typeInfo);const s=n;return new Be(Math.sinh(s.value),n.typeInfo)}_smoothstep(e,t,n){const s=Math.min(Math.max((n-e)/(t-e),0),1);return s*s*(3-2*s)}SmoothStep(e,t){const n=this.exec.evalExpression(e.args[0],t),s=this.exec.evalExpression(e.args[1],t),r=this.exec.evalExpression(e.args[2],t);if(r instanceof Me&&n instanceof Me&&s instanceof Me)return new Me(r.data.map((e,t)=>this._smoothstep(n.data[t],s.data[t],e)),r.typeInfo);const a=n,i=s,o=r;return new Be(this._smoothstep(a.value,i.value,o.value),r.typeInfo)}Sqrt(e,t){const n=this.exec.evalExpression(e.args[0],t);if(n instanceof Me)return new Me(n.data.map(e=>Math.sqrt(e)),n.typeInfo);const s=n;return new Be(Math.sqrt(s.value),n.typeInfo)}Step(e,t){const n=this.exec.evalExpression(e.args[0],t),s=this.exec.evalExpression(e.args[1],t);if(s instanceof Me&&n instanceof Me)return new Me(s.data.map((e,t)=>e<n.data[t]?0:1),s.typeInfo);const r=n;return new Be(s.value<r.value?0:1,r.typeInfo)}Tan(e,t){const n=this.exec.evalExpression(e.args[0],t);if(n instanceof Me)return new Me(n.data.map(e=>Math.tan(e)),n.typeInfo);const s=n;return new Be(Math.tan(s.value),n.typeInfo)}Tanh(e,t){const n=this.exec.evalExpression(e.args[0],t);if(n instanceof Me)return new Me(n.data.map(e=>Math.tanh(e)),n.typeInfo);const s=n;return new Be(Math.tanh(s.value),n.typeInfo)}_getTransposeType(e){const t=e.getTypeName();return 'mat2x2f'===t||'mat2x2h'===t?e:'mat2x3f'===t?this.getTypeInfo('mat3x2f'):'mat2x3h'===t?this.getTypeInfo('mat3x2h'):'mat2x4f'===t?this.getTypeInfo('mat4x2f'):'mat2x4h'===t?this.getTypeInfo('mat4x2h'):'mat3x2f'===t?this.getTypeInfo('mat2x3f'):'mat3x2h'===t?this.getTypeInfo('mat2x3h'):'mat3x3f'===t||'mat3x3h'===t?e:'mat3x4f'===t?this.getTypeInfo('mat4x3f'):'mat3x4h'===t?this.getTypeInfo('mat4x3h'):'mat4x2f'===t?this.getTypeInfo('mat2x4f'):'mat4x2h'===t?this.getTypeInfo('mat2x4h'):'mat4x3f'===t?this.getTypeInfo('mat3x4f'):'mat4x3h'===t?this.getTypeInfo('mat3x4h'):('mat4x4f'===t||'mat4x4h'===t||console.error(`Invalid matrix type ${t}`),e)}Transpose(e,t){const n=this.exec.evalExpression(e.args[0],t);if(!(n instanceof Ue))return console.error(`Transpose() expects a matrix argument. Line ${e.line}`),null;const s=this._getTransposeType(n.typeInfo);if('mat2x2'===n.typeInfo.name||'mat2x2f'===n.typeInfo.name||'mat2x2h'===n.typeInfo.name){const e=n.data;return new Ue([e[0],e[2],e[1],e[3]],s)}if('mat2x3'===n.typeInfo.name||'mat2x3f'===n.typeInfo.name||'mat2x3h'===n.typeInfo.name){const e=n.data;return new Ue([e[0],e[3],e[6],e[1],e[4],e[7]],s)}if('mat2x4'===n.typeInfo.name||'mat2x4f'===n.typeInfo.name||'mat2x4h'===n.typeInfo.name){const e=n.data;return new Ue([e[0],e[4],e[8],e[12],e[1],e[5],e[9],e[13]],s)}if('mat3x2'===n.typeInfo.name||'mat3x2f'===n.typeInfo.name||'mat3x2h'===n.typeInfo.name){const e=n.data;return new Ue([e[0],e[3],e[1],e[4],e[2],e[5]],s)}if('mat3x3'===n.typeInfo.name||'mat3x3f'===n.typeInfo.name||'mat3x3h'===n.typeInfo.name){const e=n.data;return new Ue([e[0],e[3],e[6],e[1],e[4],e[7],e[2],e[5],e[8]],s)}if('mat3x4'===n.typeInfo.name||'mat3x4f'===n.typeInfo.name||'mat3x4h'===n.typeInfo.name){const e=n.data;return new Ue([e[0],e[4],e[8],e[12],e[1],e[5],e[9],e[13],e[2],e[6],e[10],e[14]],s)}if('mat4x2'===n.typeInfo.name||'mat4x2f'===n.typeInfo.name||'mat4x2h'===n.typeInfo.name){const e=n.data;return new Ue([e[0],e[4],e[1],e[5],e[2],e[6]],s)}if('mat4x3'===n.typeInfo.name||'mat4x3f'===n.typeInfo.name||'mat4x3h'===n.typeInfo.name){const e=n.data;return new Ue([e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]],s)}if('mat4x4'===n.typeInfo.name||'mat4x4f'===n.typeInfo.name||'mat4x4h'===n.typeInfo.name){const e=n.data;return new Ue([e[0],e[4],e[8],e[12],e[1],e[5],e[9],e[13],e[2],e[6],e[10],e[14],e[3],e[7],e[11],e[15]],s)}return console.error(`Invalid matrix type ${n.typeInfo.name}`),null}Trunc(e,t){const n=this.exec.evalExpression(e.args[0],t);if(n instanceof Me)return new Me(n.data.map(e=>Math.trunc(e)),n.typeInfo);const s=n;return new Be(Math.trunc(s.value),n.typeInfo)}Dpdx(e,t){return console.error(`TODO: dpdx. Line ${e.line}`),null}DpdxCoarse(e,t){return console.error(`TODO: dpdxCoarse. Line ${e.line}`),null}DpdxFine(e,t){return console.error('TODO: dpdxFine'),null}Dpdy(e,t){return console.error('TODO: dpdy'),null}DpdyCoarse(e,t){return console.error('TODO: dpdyCoarse'),null}DpdyFine(e,t){return console.error('TODO: dpdyFine'),null}Fwidth(e,t){return console.error('TODO: fwidth'),null}FwidthCoarse(e,t){return console.error('TODO: fwidthCoarse'),null}FwidthFine(e,t){return console.error('TODO: fwidthFine'),null}TextureDimensions(e,t){const n=e.args[0],s=e.args.length>1?this.exec.evalExpression(e.args[1],t).value:0;if(n instanceof ge){const r=n.name,a=t.getVariableValue(r);if(a instanceof We){if(s<0||s>=a.mipLevelCount)return console.error(`Invalid mip level for textureDimensions. Line ${e.line}`),null;const t=a.getMipLevelSize(s),n=a.dimension;return '1d'===n?new Be(t[0],this.getTypeInfo('u32')):'3d'===n?new Me(t,this.getTypeInfo('vec3u')):'2d'===n?new Me(t.slice(0,2),this.getTypeInfo('vec2u')):(console.error(`Invalid texture dimension ${n} not found. Line ${e.line}`),null)}return console.error(`Texture ${r} not found. Line ${e.line}`),null}return console.error(`Invalid texture argument for textureDimensions. Line ${e.line}`),null}TextureGather(e,t){return console.error('TODO: textureGather'),null}TextureGatherCompare(e,t){return console.error('TODO: textureGatherCompare'),null}TextureLoad(e,t){const n=e.args[0],s=this.exec.evalExpression(e.args[1],t),r=e.args.length>2?this.exec.evalExpression(e.args[2],t).value:0;if(!(s instanceof Me)||2!==s.data.length)return console.error(`Invalid UV argument for textureLoad. Line ${e.line}`),null;if(n instanceof ge){const a=n.name,i=t.getVariableValue(a);if(i instanceof We){const t=Math.floor(s.data[0]),n=Math.floor(s.data[1]);if(t<0||t>=i.width||n<0||n>=i.height)return console.error(`Texture ${a} out of bounds. Line ${e.line}`),null;const o=i.getPixel(t,n,0,r);return null===o?(console.error(`Invalid texture format for textureLoad. Line ${e.line}`),null):new Me(o,this.getTypeInfo('vec4f'))}return console.error(`Texture ${a} not found. Line ${e.line}`),null}return console.error(`Invalid texture argument for textureLoad. Line ${e.line}`),null}TextureNumLayers(e,t){const n=e.args[0];if(n instanceof ge){const s=n.name,r=t.getVariableValue(s);return r instanceof We?new Be(r.depthOrArrayLayers,this.getTypeInfo('u32')):(console.error(`Texture ${s} not found. Line ${e.line}`),null)}return console.error(`Invalid texture argument for textureNumLayers. Line ${e.line}`),null}TextureNumLevels(e,t){const n=e.args[0];if(n instanceof ge){const s=n.name,r=t.getVariableValue(s);return r instanceof We?new Be(r.mipLevelCount,this.getTypeInfo('u32')):(console.error(`Texture ${s} not found. Line ${e.line}`),null)}return console.error(`Invalid texture argument for textureNumLevels. Line ${e.line}`),null}TextureNumSamples(e,t){const n=e.args[0];if(n instanceof ge){const s=n.name,r=t.getVariableValue(s);return r instanceof We?new Be(r.sampleCount,this.getTypeInfo('u32')):(console.error(`Texture ${s} not found. Line ${e.line}`),null)}return console.error(`Invalid texture argument for textureNumSamples. Line ${e.line}`),null}TextureSample(e,t){return console.error('TODO: textureSample'),null}TextureSampleBias(e,t){return console.error('TODO: textureSampleBias'),null}TextureSampleCompare(e,t){return console.error('TODO: textureSampleCompare'),null}TextureSampleCompareLevel(e,t){return console.error('TODO: textureSampleCompareLevel'),null}TextureSampleGrad(e,t){return console.error('TODO: textureSampleGrad'),null}TextureSampleLevel(e,t){return console.error('TODO: textureSampleLevel'),null}TextureSampleBaseClampToEdge(e,t){return console.error('TODO: textureSampleBaseClampToEdge'),null}TextureStore(e,t){const n=e.args[0],s=this.exec.evalExpression(e.args[1],t),r=4===e.args.length?this.exec.evalExpression(e.args[2],t).value:0,a=4===e.args.length?this.exec.evalExpression(e.args[3],t).data:this.exec.evalExpression(e.args[2],t).data;if(4!==a.length)return console.error(`Invalid value argument for textureStore. Line ${e.line}`),null;if(!(s instanceof Me)||2!==s.data.length)return console.error(`Invalid UV argument for textureStore. Line ${e.line}`),null;if(n instanceof ge){const i=n.name,o=t.getVariableValue(i);if(o instanceof We){const t=o.getMipLevelSize(0),n=Math.floor(s.data[0]),c=Math.floor(s.data[1]);return n<0||n>=t[0]||c<0||c>=t[1]?(console.error(`Texture ${i} out of bounds. Line ${e.line}`),null):(o.setPixel(n,c,0,r,Array.from(a)),null)}return console.error(`Texture ${i} not found. Line ${e.line}`),null}return console.error(`Invalid texture argument for textureStore. Line ${e.line}`),null}AtomicLoad(e,t){let n=e.args[0];n instanceof ke&&(n=n.right);const s=this.exec.getVariableName(n,t);return t.getVariable(s).value.getSubData(this.exec,n.postfix,t)}AtomicStore(e,t){let n=e.args[0];n instanceof ke&&(n=n.right);const s=this.exec.getVariableName(n,t),r=t.getVariable(s);let a=e.args[1];const i=this.exec.evalExpression(a,t),o=r.value.getSubData(this.exec,n.postfix,t);return o instanceof Be&&i instanceof Be&&(o.value=i.value),r.value instanceof Pe&&r.value.setDataValue(this.exec,o,n.postfix,t),null}AtomicAdd(e,t){let n=e.args[0];n instanceof ke&&(n=n.right);const s=this.exec.getVariableName(n,t),r=t.getVariable(s);let a=e.args[1];const i=this.exec.evalExpression(a,t),o=r.value.getSubData(this.exec,n.postfix,t),c=new Be(o.value,o.typeInfo);return o instanceof Be&&i instanceof Be&&(o.value+=i.value),r.value instanceof Pe&&r.value.setDataValue(this.exec,o,n.postfix,t),c}AtomicSub(e,t){let n=e.args[0];n instanceof ke&&(n=n.right);const s=this.exec.getVariableName(n,t),r=t.getVariable(s);let a=e.args[1];const i=this.exec.evalExpression(a,t),o=r.value.getSubData(this.exec,n.postfix,t),c=new Be(o.value,o.typeInfo);return o instanceof Be&&i instanceof Be&&(o.value-=i.value),r.value instanceof Pe&&r.value.setDataValue(this.exec,o,n.postfix,t),c}AtomicMax(e,t){let n=e.args[0];n instanceof ke&&(n=n.right);const s=this.exec.getVariableName(n,t),r=t.getVariable(s);let a=e.args[1];const i=this.exec.evalExpression(a,t),o=r.value.getSubData(this.exec,n.postfix,t),c=new Be(o.value,o.typeInfo);return o instanceof Be&&i instanceof Be&&(o.value=Math.max(o.value,i.value)),r.value instanceof Pe&&r.value.setDataValue(this.exec,o,n.postfix,t),c}AtomicMin(e,t){let n=e.args[0];n instanceof ke&&(n=n.right);const s=this.exec.getVariableName(n,t),r=t.getVariable(s);let a=e.args[1];const i=this.exec.evalExpression(a,t),o=r.value.getSubData(this.exec,n.postfix,t),c=new Be(o.value,o.typeInfo);return o instanceof Be&&i instanceof Be&&(o.value=Math.min(o.value,i.value)),r.value instanceof Pe&&r.value.setDataValue(this.exec,o,n.postfix,t),c}AtomicAnd(e,t){let n=e.args[0];n instanceof ke&&(n=n.right);const s=this.exec.getVariableName(n,t),r=t.getVariable(s);let a=e.args[1];const i=this.exec.evalExpression(a,t),o=r.value.getSubData(this.exec,n.postfix,t),c=new Be(o.value,o.typeInfo);return o instanceof Be&&i instanceof Be&&(o.value=o.value&i.value),r.value instanceof Pe&&r.value.setDataValue(this.exec,o,n.postfix,t),c}AtomicOr(e,t){let n=e.args[0];n instanceof ke&&(n=n.right);const s=this.exec.getVariableName(n,t),r=t.getVariable(s);let a=e.args[1];const i=this.exec.evalExpression(a,t),o=r.value.getSubData(this.exec,n.postfix,t),c=new Be(o.value,o.typeInfo);return o instanceof Be&&i instanceof Be&&(o.value=o.value|i.value),r.value instanceof Pe&&r.value.setDataValue(this.exec,o,n.postfix,t),c}AtomicXor(e,t){let n=e.args[0];n instanceof ke&&(n=n.right);const s=this.exec.getVariableName(n,t),r=t.getVariable(s);let a=e.args[1];const i=this.exec.evalExpression(a,t),o=r.value.getSubData(this.exec,n.postfix,t),c=new Be(o.value,o.typeInfo);return o instanceof Be&&i instanceof Be&&(o.value=o.value^i.value),r.value instanceof Pe&&r.value.setDataValue(this.exec,o,n.postfix,t),c}AtomicExchange(e,t){let n=e.args[0];n instanceof ke&&(n=n.right);const s=this.exec.getVariableName(n,t),r=t.getVariable(s);let a=e.args[1];const i=this.exec.evalExpression(a,t),o=r.value.getSubData(this.exec,n.postfix,t),c=new Be(o.value,o.typeInfo);return o instanceof Be&&i instanceof Be&&(o.value=i.value),r.value instanceof Pe&&r.value.setDataValue(this.exec,o,n.postfix,t),c}AtomicCompareExchangeWeak(e,t){return console.error('TODO: atomicCompareExchangeWeak'),null}Pack4x8snorm(e,t){return console.error('TODO: pack4x8snorm'),null}Pack4x8unorm(e,t){return console.error('TODO: pack4x8unorm'),null}Pack4xI8(e,t){return console.error('TODO: pack4xI8'),null}Pack4xU8(e,t){return console.error('TODO: pack4xU8'),null}Pack4x8Clamp(e,t){return console.error('TODO: pack4x8Clamp'),null}Pack4xU8Clamp(e,t){return console.error('TODO: pack4xU8Clamp'),null}Pack2x16snorm(e,t){return console.error('TODO: pack2x16snorm'),null}Pack2x16unorm(e,t){return console.error('TODO: pack2x16unorm'),null}Pack2x16float(e,t){return console.error('TODO: pack2x16float'),null}Unpack4x8snorm(e,t){return console.error('TODO: unpack4x8snorm'),null}Unpack4x8unorm(e,t){return console.error('TODO: unpack4x8unorm'),null}Unpack4xI8(e,t){return console.error('TODO: unpack4xI8'),null}Unpack4xU8(e,t){return console.error('TODO: unpack4xU8'),null}Unpack2x16snorm(e,t){return console.error('TODO: unpack2x16snorm'),null}Unpack2x16unorm(e,t){return console.error('TODO: unpack2x16unorm'),null}Unpack2x16float(e,t){return console.error('TODO: unpack2x16float'),null}StorageBarrier(e,t){return null}TextureBarrier(e,t){return null}WorkgroupBarrier(e,t){return null}WorkgroupUniformLoad(e,t){return null}SubgroupAdd(e,t){return console.error('TODO: subgroupAdd'),null}SubgroupExclusiveAdd(e,t){return console.error('TODO: subgroupExclusiveAdd'),null}SubgroupInclusiveAdd(e,t){return console.error('TODO: subgroupInclusiveAdd'),null}SubgroupAll(e,t){return console.error('TODO: subgroupAll'),null}SubgroupAnd(e,t){return console.error('TODO: subgroupAnd'),null}SubgroupAny(e,t){return console.error('TODO: subgroupAny'),null}SubgroupBallot(e,t){return console.error('TODO: subgroupBallot'),null}SubgroupBroadcast(e,t){return console.error('TODO: subgroupBroadcast'),null}SubgroupBroadcastFirst(e,t){return console.error('TODO: subgroupBroadcastFirst'),null}SubgroupElect(e,t){return console.error('TODO: subgroupElect'),null}SubgroupMax(e,t){return console.error('TODO: subgroupMax'),null}SubgroupMin(e,t){return console.error('TODO: subgroupMin'),null}SubgroupMul(e,t){return console.error('TODO: subgroupMul'),null}SubgroupExclusiveMul(e,t){return console.error('TODO: subgroupExclusiveMul'),null}SubgroupInclusiveMul(e,t){return console.error('TODO: subgroupInclusiveMul'),null}SubgroupOr(e,t){return console.error('TODO: subgroupOr'),null}SubgroupShuffle(e,t){return console.error('TODO: subgroupShuffle'),null}SubgroupShuffleDown(e,t){return console.error('TODO: subgroupShuffleDown'),null}SubgroupShuffleUp(e,t){return console.error('TODO: subgroupShuffleUp'),null}SubgroupShuffleXor(e,t){return console.error('TODO: subgroupShuffleXor'),null}SubgroupXor(e,t){return console.error('TODO: subgroupXor'),null}QuadBroadcast(e,t){return console.error('TODO: quadBroadcast'),null}QuadSwapDiagonal(e,t){return console.error('TODO: quadSwapDiagonal'),null}QuadSwapX(e,t){return console.error('TODO: quadSwapX'),null}QuadSwapY(e,t){return console.error('TODO: quadSwapY'),null}}const ft={vec2:2,vec2f:2,vec2i:2,vec2u:2,vec2b:2,vec2h:2,vec3:3,vec3f:3,vec3i:3,vec3u:3,vec3b:3,vec3h:3,vec4:4,vec4f:4,vec4i:4,vec4u:4,vec4b:4,vec4h:4},pt={mat2x2:[2,2,4],mat2x2f:[2,2,4],mat2x2h:[2,2,4],mat2x3:[2,3,6],mat2x3f:[2,3,6],mat2x3h:[2,3,6],mat2x4:[2,4,8],mat2x4f:[2,4,8],mat2x4h:[2,4,8],mat3x2:[3,2,6],mat3x2f:[3,2,6],mat3x2h:[3,2,6],mat3x3:[3,3,9],mat3x3f:[3,3,9],mat3x3h:[3,3,9],mat3x4:[3,4,12],mat3x4f:[3,4,12],mat3x4h:[3,4,12],mat4x2:[4,2,8],mat4x2f:[4,2,8],mat4x2h:[4,2,8],mat4x3:[4,3,12],mat4x3f:[4,3,12],mat4x3h:[4,3,12],mat4x4:[4,4,16],mat4x4f:[4,4,16],mat4x4h:[4,4,16]};class dt extends ut{constructor(e,t){var n;super(),this.ast=null!=e?e:[],this.reflection=new at,this.reflection.updateAST(this.ast),this.context=null!==(n=null==t?void 0:t.clone())&&void 0!==n?n:new lt,this.builtins=new ht(this),this.typeInfo={bool:this.getTypeInfo(ae.bool),i32:this.getTypeInfo(ae.i32),u32:this.getTypeInfo(ae.u32),f32:this.getTypeInfo(ae.f32),f16:this.getTypeInfo(ae.f16),vec2f:this.getTypeInfo(ce.vec2f),vec2u:this.getTypeInfo(ce.vec2u),vec2i:this.getTypeInfo(ce.vec2i),vec2h:this.getTypeInfo(ce.vec2h),vec3f:this.getTypeInfo(ce.vec3f),vec3u:this.getTypeInfo(ce.vec3u),vec3i:this.getTypeInfo(ce.vec3i),vec3h:this.getTypeInfo(ce.vec3h),vec4f:this.getTypeInfo(ce.vec4f),vec4u:this.getTypeInfo(ce.vec4u),vec4i:this.getTypeInfo(ce.vec4i),vec4h:this.getTypeInfo(ce.vec4h),mat2x2f:this.getTypeInfo(ce.mat2x2f),mat2x3f:this.getTypeInfo(ce.mat2x3f),mat2x4f:this.getTypeInfo(ce.mat2x4f),mat3x2f:this.getTypeInfo(ce.mat3x2f),mat3x3f:this.getTypeInfo(ce.mat3x3f),mat3x4f:this.getTypeInfo(ce.mat3x4f),mat4x2f:this.getTypeInfo(ce.mat4x2f),mat4x3f:this.getTypeInfo(ce.mat4x3f),mat4x4f:this.getTypeInfo(ce.mat4x4f)};}getVariableValue(e){var t,n;const r=null!==(n=null===(t=this.context.getVariable(e))||void 0===t?void 0:t.value)&&void 0!==n?n:null;if(null===r)return null;if(r instanceof Be)return r.value;if(r instanceof Me)return Array.from(r.data);if(r instanceof Ue)return Array.from(r.data);if(r instanceof Pe&&r.typeInfo instanceof s){if('u32'===r.typeInfo.format.name)return Array.from(new Uint32Array(r.buffer,r.offset,r.typeInfo.count));if('i32'===r.typeInfo.format.name)return Array.from(new Int32Array(r.buffer,r.offset,r.typeInfo.count));if('f32'===r.typeInfo.format.name)return Array.from(new Float32Array(r.buffer,r.offset,r.typeInfo.count))}return console.error(`Unsupported return variable type ${r.typeInfo.name}`),null}execute(e){(e=null!=e?e:{}).constants&&this._setOverrides(e.constants,this.context),this._execStatements(this.ast,this.context);}dispatchWorkgroups(e,t,n,s){const r=this.context.clone();(s=null!=s?s:{}).constants&&this._setOverrides(s.constants,r),this._execStatements(this.ast,r);const a=r.getFunction(e);if(!a)return void console.error(`Function ${e} not found`);if('number'==typeof t)t=[t,1,1];else {if(0===t.length)return void console.error('Invalid dispatch count');1===t.length?t=[t[0],1,1]:2===t.length?t=[t[0],t[1],1]:t.length>3&&(t=[t[0],t[1],t[2]]);}const i=t[0],o=t[1],c=t[2],l=this.getTypeInfo('vec3u');r.setVariable('@num_workgroups',new Me(t,l));const u=this.reflection.getFunctionInfo(e);null===u&&console.error(`Function ${e} not found in reflection data`);for(const e in n)for(const t in n[e]){const s=n[e][t];r.variables.forEach(n=>{var r;const a=n.node;if(null==a?void 0:a.attributes){let i=null,o=null;for(const e of a.attributes)'binding'===e.name?i=e.value:'group'===e.name&&(o=e.value);if(t==i&&e==o){let i=false;for(const s of u.resources)if(s.name===n.name&&s.group===parseInt(e)&&s.binding===parseInt(t)){i=true;break}if(i)if(void 0!==s.texture&&void 0!==s.descriptor){const e=new We(s.texture,this.getTypeInfo(a.type),s.descriptor,null!==(r=s.texture.view)&&void 0!==r?r:null);n.value=e;}else void 0!==s.uniform?n.value=new Pe(s.uniform,this.getTypeInfo(a.type)):n.value=new Pe(s,this.getTypeInfo(a.type));}}});}for(let e=0;e<c;++e)for(let t=0;t<o;++t)for(let n=0;n<i;++n)r.setVariable('@workgroup_id',new Me([n,t,e],this.getTypeInfo('vec3u'))),this._dispatchWorkgroup(a,[n,t,e],r);}execStatement(e,t){if(e instanceof Y)return this.evalExpression(e.value,t);if(e instanceof se){if(e.condition){const n=this.evalExpression(e.condition,t);if(!(n instanceof Be))throw new Error('Invalid break-if condition');if(!n.value)return null}return dt._breakObj}if(e instanceof re)return dt._continueObj;if(e instanceof U)this._let(e,t);else if(e instanceof F)this._var(e,t);else if(e instanceof P)this._const(e,t);else if(e instanceof D)this._function(e,t);else {if(e instanceof Q)return this._if(e,t);if(e instanceof Z)return this._switch(e,t);if(e instanceof B)return this._for(e,t);if(e instanceof V)return this._while(e,t);if(e instanceof j)return this._loop(e,t);if(e instanceof O){const n=t.clone();return n.currentFunctionName=t.currentFunctionName,this._execStatements(e.body,n)}if(e instanceof G)this._assign(e,t);else if(e instanceof R)this._increment(e,t);else {if(e instanceof oe)return null;if(e instanceof M){const n=e.name;null===t.getVariable(n)&&t.setVariable(n,new Be(0,this.getTypeInfo('u32')));}else if(e instanceof X)this._call(e,t);else {if(e instanceof ee)return null;if(e instanceof te)return null;console.error('Invalid statement type.',e,`Line ${e.line}`);}}}return null}evalExpression(e,t){return e instanceof Ie?this._evalBinaryOp(e,t):e instanceof xe?this._evalLiteral(e,t):e instanceof ge?this._evalVariable(e,t):e instanceof me?this._evalCall(e,t):e instanceof de?this._evalCreate(e,t):e instanceof _e?this._evalConst(e,t):e instanceof ye?this._evalBitcast(e,t):e instanceof ke?this._evalUnaryOp(e,t):(console.error('Invalid expression type',e,`Line ${e.line}`),null)}getTypeInfo(e){var t;if(e instanceof ae){const t=this.reflection.getTypeInfo(e);if(null!==t)return t}let n=null!==(t=this.typeInfo[e])&&void 0!==t?t:null;return null!==n||(n=this.reflection.getTypeInfoByName(e)),n}_setOverrides(e,t){for(const n in e){const s=e[n],r=this.reflection.getOverrideInfo(n);null!==r?(null===r.type&&(r.type=this.getTypeInfo('u32')),'u32'===r.type.name||'i32'===r.type.name||'f32'===r.type.name||'f16'===r.type.name?t.setVariable(n,new Be(s,r.type)):'bool'===r.type.name?t.setVariable(n,new Be(s?1:0,r.type)):'vec2'===r.type.name||'vec3'===r.type.name||'vec4'===r.type.name||'vec2f'===r.type.name||'vec3f'===r.type.name||'vec4f'===r.type.name||'vec2i'===r.type.name||'vec3i'===r.type.name||'vec4i'===r.type.name||'vec2u'===r.type.name||'vec3u'===r.type.name||'vec4u'===r.type.name||'vec2h'===r.type.name||'vec3h'===r.type.name||'vec4h'===r.type.name?t.setVariable(n,new Me(s,r.type)):console.error(`Invalid constant type for ${n}`)):console.error(`Override ${n} does not exist in the shader.`);}}_dispatchWorkgroup(e,t,n){const s=[1,1,1];for(const t of e.node.attributes)if('workgroup_size'===t.name){if(t.value.length>0){const e=n.getVariableValue(t.value[0]);s[0]=e instanceof Be?e.value:parseInt(t.value[0]);}if(t.value.length>1){const e=n.getVariableValue(t.value[1]);s[1]=e instanceof Be?e.value:parseInt(t.value[1]);}if(t.value.length>2){const e=n.getVariableValue(t.value[2]);s[2]=e instanceof Be?e.value:parseInt(t.value[2]);}}const r=this.getTypeInfo('vec3u'),a=this.getTypeInfo('u32');n.setVariable('@workgroup_size',new Me(s,r));const i=s[0],o=s[1],c=s[2];for(let l=0,u=0;l<c;++l)for(let c=0;c<o;++c)for(let o=0;o<i;++o,++u){const i=[o,c,l],h=[o+t[0]*s[0],c+t[1]*s[1],l+t[2]*s[2]];n.setVariable('@local_invocation_id',new Me(i,r)),n.setVariable('@global_invocation_id',new Me(h,r)),n.setVariable('@local_invocation_index',new Be(u,a)),this._dispatchExec(e,n);}}_dispatchExec(e,t){for(const n of e.node.args)for(const e of n.attributes)if('builtin'===e.name){const s=`@${e.value}`,r=t.getVariable(s);void 0!==r&&t.variables.set(n.name,r);}this._execStatements(e.node.body,t);}getVariableName(e,t){for(;e instanceof ke;)e=e.right;return e instanceof ge?e.name:(console.error('Unknown variable type',e,'Line',e.line),null)}_execStatements(e,t){for(const n of e){if(n instanceof Array){const e=t.clone(),s=this._execStatements(n,e);if(s)return s;continue}const e=this.execStatement(n,t);if(e)return e}return null}_call(e,t){const n=t.clone();n.currentFunctionName=e.name;const s=t.getFunction(e.name);if(s){for(let t=0;t<s.node.args.length;++t){const r=s.node.args[t],a=this.evalExpression(e.args[t],n);n.setVariable(r.name,a,r);}this._execStatements(s.node.body,n);}else if(e.isBuiltin)this._callBuiltinFunction(e,n);else {this.getTypeInfo(e.name)&&this._evalCreate(e,t);}}_increment(e,t){const n=this.getVariableName(e.variable,t),s=t.getVariable(n);s?'++'===e.operator?s.value instanceof Be?s.value.value++:console.error(`Variable ${n} is not a scalar. Line ${e.line}`):'--'===e.operator?s.value instanceof Be?s.value.value--:console.error(`Variable ${n} is not a scalar. Line ${e.line}`):console.error(`Unknown increment operator ${e.operator}. Line ${e.line}`):console.error(`Variable ${n} not found. Line ${e.line}`);}_getVariableData(e,t){if(e instanceof ge){const n=this.getVariableName(e,t),s=t.getVariable(n);return null===s?(console.error(`Variable ${n} not found. Line ${e.line}`),null):s.value.getSubData(this,e.postfix,t)}if(e instanceof ke){if('*'===e.operator){const n=this._getVariableData(e.right,t);return n instanceof Oe?n.reference.getSubData(this,e.postfix,t):(console.error(`Variable ${e.right} is not a pointer. Line ${e.line}`),null)}if('&'===e.operator){const n=this._getVariableData(e.right,t);return new Oe(n)}}return null}_assign(e,t){let n=null,s='<var>',r=null;if(e.variable instanceof ke){const n=this._getVariableData(e.variable,t),s=this.evalExpression(e.value,t),r=e.operator;if('='===r){if(n instanceof Be||n instanceof Me||n instanceof Ue){if(s instanceof Be||s instanceof Me||s instanceof Ue&&n.data.length===s.data.length)return void n.data.set(s.data);console.error(`Invalid assignment. Line ${e.line}`);}else if(n instanceof Pe&&s instanceof Pe&&n.buffer.byteLength-n.offset>=s.buffer.byteLength-s.offset)return void(n.buffer.byteLength%4==0?new Uint32Array(n.buffer,n.offset,n.typeInfo.size/4).set(new Uint32Array(s.buffer,s.offset,s.typeInfo.size/4)):new Uint8Array(n.buffer,n.offset,n.typeInfo.size).set(new Uint8Array(s.buffer,s.offset,s.typeInfo.size)));return console.error(`Invalid assignment. Line ${e.line}`),null}if('+='===r)return n instanceof Be||n instanceof Me||n instanceof Ue?s instanceof Be||s instanceof Me||s instanceof Ue?void n.data.set(s.data.map((e,t)=>n.data[t]+e)):void console.error(`Invalid assignment . Line ${e.line}`):void console.error(`Invalid assignment. Line ${e.line}`);if('-='===r)return (n instanceof Be||n instanceof Me||n instanceof Ue)&&(s instanceof Be||s instanceof Me||s instanceof Ue)?void n.data.set(s.data.map((e,t)=>n.data[t]-e)):void console.error(`Invalid assignment. Line ${e.line}`)}if(e.variable instanceof ke){if('*'===e.variable.operator){s=this.getVariableName(e.variable.right,t);const r=t.getVariable(s);if(!(r&&r.value instanceof Oe))return void console.error(`Variable ${s} is not a pointer. Line ${e.line}`);n=r.value.reference;let a=e.variable.postfix;if(!a){let t=e.variable.right;for(;t instanceof ke;){if(t.postfix){a=t.postfix;break}t=t.right;}}a&&(n=n.getSubData(this,a,t));}}else {r=e.variable.postfix,s=this.getVariableName(e.variable,t);const a=t.getVariable(s);if(null===a)return void console.error(`Variable ${s} not found. Line ${e.line}`);n=a.value;}if(n instanceof Oe&&(n=n.reference),null===n)return void console.error(`Variable ${s} not found. Line ${e.line}`);const a=this.evalExpression(e.value,t),i=e.operator;if('='!==i){const s=n.getSubData(this,r,t);if(s instanceof Me&&a instanceof Be){const t=s.data,n=a.value;if('+='===i)for(let e=0;e<t.length;++e)t[e]+=n;else if('-='===i)for(let e=0;e<t.length;++e)t[e]-=n;else if('*='===i)for(let e=0;e<t.length;++e)t[e]*=n;else if('/='===i)for(let e=0;e<t.length;++e)t[e]/=n;else if('%='===i)for(let e=0;e<t.length;++e)t[e]%=n;else if('&='===i)for(let e=0;e<t.length;++e)t[e]&=n;else if('|='===i)for(let e=0;e<t.length;++e)t[e]|=n;else if('^='===i)for(let e=0;e<t.length;++e)t[e]^=n;else if('<<='===i)for(let e=0;e<t.length;++e)t[e]<<=n;else if('>>='===i)for(let e=0;e<t.length;++e)t[e]>>=n;else console.error(`Invalid operator ${i}. Line ${e.line}`);}else if(s instanceof Me&&a instanceof Me){const t=s.data,n=a.data;if(t.length!==n.length)return void console.error(`Vector length mismatch. Line ${e.line}`);if('+='===i)for(let e=0;e<t.length;++e)t[e]+=n[e];else if('-='===i)for(let e=0;e<t.length;++e)t[e]-=n[e];else if('*='===i)for(let e=0;e<t.length;++e)t[e]*=n[e];else if('/='===i)for(let e=0;e<t.length;++e)t[e]/=n[e];else if('%='===i)for(let e=0;e<t.length;++e)t[e]%=n[e];else if('&='===i)for(let e=0;e<t.length;++e)t[e]&=n[e];else if('|='===i)for(let e=0;e<t.length;++e)t[e]|=n[e];else if('^='===i)for(let e=0;e<t.length;++e)t[e]^=n[e];else if('<<='===i)for(let e=0;e<t.length;++e)t[e]<<=n[e];else if('>>='===i)for(let e=0;e<t.length;++e)t[e]>>=n[e];else console.error(`Invalid operator ${i}. Line ${e.line}`);}else {if(!(s instanceof Be&&a instanceof Be))return void console.error(`Invalid type for ${e.operator} operator. Line ${e.line}`);'+='===i?s.value+=a.value:'-='===i?s.value-=a.value:'*='===i?s.value*=a.value:'/='===i?s.value/=a.value:'%='===i?s.value%=a.value:'&='===i?s.value&=a.value:'|='===i?s.value|=a.value:'^='===i?s.value^=a.value:'<<='===i?s.value<<=a.value:'>>='===i?s.value>>=a.value:console.error(`Invalid operator ${i}. Line ${e.line}`);}return void(n instanceof Pe&&n.setDataValue(this,s,r,t))}if(n instanceof Pe)n.setDataValue(this,a,r,t);else if(r){if(!(n instanceof Me||n instanceof Ue))return void console.error(`Variable ${s} is not a vector or matrix. Line ${e.line}`);if(r instanceof ve){const i=this.evalExpression(r.index,t).value;if(n instanceof Me){if(!(a instanceof Be))return void console.error(`Invalid assignment to ${s}. Line ${e.line}`);n.data[i]=a.value;}else {if(!(n instanceof Ue))return void console.error(`Invalid assignment to ${s}. Line ${e.line}`);{const i=this.evalExpression(r.index,t).value;if(i<0)return void console.error(`Invalid assignment to ${s}. Line ${e.line}`);if(!(a instanceof Me))return void console.error(`Invalid assignment to ${s}. Line ${e.line}`);{const t=n.typeInfo.getTypeName();if('mat2x2'===t||'mat2x2f'===t||'mat2x2h'===t){if(!(i<2&&2===a.data.length))return void console.error(`Invalid assignment to ${s}. Line ${e.line}`);n.data[2*i]=a.data[0],n.data[2*i+1]=a.data[1];}else if('mat2x3'===t||'mat2x3f'===t||'mat2x3h'===t){if(!(i<2&&3===a.data.length))return void console.error(`Invalid assignment to ${s}. Line ${e.line}`);n.data[3*i]=a.data[0],n.data[3*i+1]=a.data[1],n.data[3*i+2]=a.data[2];}else if('mat2x4'===t||'mat2x4f'===t||'mat2x4h'===t){if(!(i<2&&4===a.data.length))return void console.error(`Invalid assignment to ${s}. Line ${e.line}`);n.data[4*i]=a.data[0],n.data[4*i+1]=a.data[1],n.data[4*i+2]=a.data[2],n.data[4*i+3]=a.data[3];}else if('mat3x2'===t||'mat3x2f'===t||'mat3x2h'===t){if(!(i<3&&2===a.data.length))return void console.error(`Invalid assignment to ${s}. Line ${e.line}`);n.data[2*i]=a.data[0],n.data[2*i+1]=a.data[1];}else if('mat3x3'===t||'mat3x3f'===t||'mat3x3h'===t){if(!(i<3&&3===a.data.length))return void console.error(`Invalid assignment to ${s}. Line ${e.line}`);n.data[3*i]=a.data[0],n.data[3*i+1]=a.data[1],n.data[3*i+2]=a.data[2];}else if('mat3x4'===t||'mat3x4f'===t||'mat3x4h'===t){if(!(i<3&&4===a.data.length))return void console.error(`Invalid assignment to ${s}. Line ${e.line}`);n.data[4*i]=a.data[0],n.data[4*i+1]=a.data[1],n.data[4*i+2]=a.data[2],n.data[4*i+3]=a.data[3];}else if('mat4x2'===t||'mat4x2f'===t||'mat4x2h'===t){if(!(i<4&&2===a.data.length))return void console.error(`Invalid assignment to ${s}. Line ${e.line}`);n.data[2*i]=a.data[0],n.data[2*i+1]=a.data[1];}else if('mat4x3'===t||'mat4x3f'===t||'mat4x3h'===t){if(!(i<4&&3===a.data.length))return void console.error(`Invalid assignment to ${s}. Line ${e.line}`);n.data[3*i]=a.data[0],n.data[3*i+1]=a.data[1],n.data[3*i+2]=a.data[2];}else {if('mat4x4'!==t&&'mat4x4f'!==t&&'mat4x4h'!==t)return void console.error(`Invalid assignment to ${s}. Line ${e.line}`);if(!(i<4&&4===a.data.length))return void console.error(`Invalid assignment to ${s}. Line ${e.line}`);n.data[4*i]=a.data[0],n.data[4*i+1]=a.data[1],n.data[4*i+2]=a.data[2],n.data[4*i+3]=a.data[3];}}}}}else if(r instanceof pe){const t=r.value;if(!(n instanceof Me))return void console.error(`Invalid assignment to ${t}. Variable ${s} is not a vector. Line ${e.line}`);if(a instanceof Be){if(t.length>1)return void console.error(`Invalid assignment to ${t} for variable ${s}. Line ${e.line}`);if('x'===t)n.data[0]=a.value;else if('y'===t){if(n.data.length<2)return void console.error(`Invalid assignment to ${t} for variable ${s}. Line ${e.line}`);n.data[1]=a.value;}else if('z'===t){if(n.data.length<3)return void console.error(`Invalid assignment to ${t} for variable ${s}. Line ${e.line}`);n.data[2]=a.value;}else if('w'===t){if(n.data.length<4)return void console.error(`Invalid assignment to ${t} for variable ${s}. Line ${e.line}`);n.data[3]=a.value;}}else {if(!(a instanceof Me))return void console.error(`Invalid assignment to ${s}. Line ${e.line}`);if(t.length!==a.data.length)return void console.error(`Invalid assignment to ${t} for variable ${s}. Line ${e.line}`);for(let r=0;r<t.length;++r){const i=t[r];if('x'===i||'r'===i)n.data[0]=a.data[r];else if('y'===i||'g'===i){if(a.data.length<2)return void console.error(`Invalid assignment to ${i} for variable ${s}. Line ${e.line}`);n.data[1]=a.data[r];}else if('z'===i||'b'===i){if(a.data.length<3)return void console.error(`Invalid assignment to ${i} for variable ${s}. Line ${e.line}`);n.data[2]=a.data[r];}else {if('w'!==i&&'a'!==i)return void console.error(`Invalid assignment to ${i} for variable ${s}. Line ${e.line}`);if(a.data.length<4)return void console.error(`Invalid assignment to ${i} for variable ${s}. Line ${e.line}`);n.data[3]=a.data[r];}}}}}else n instanceof Be&&a instanceof Be?n.value=a.value:n instanceof Me&&a instanceof Me||n instanceof Ue&&a instanceof Ue?n.data.set(a.data):console.error(`Invalid assignment to ${s}. Line ${e.line}`);}_function(e,t){const n=new ct(e);t.functions.set(e.name,n);}_const(e,t){let n=null;null!==e.value&&(n=this.evalExpression(e.value,t)),t.createVariable(e.name,n,e);}_let(e,t){let n=null;if(null!==e.value){if(n=this.evalExpression(e.value,t),null===n)return void console.error(`Invalid value for variable ${e.name}. Line ${e.line}`);e.value instanceof ke||(n=n.clone());}else {const s=e.type.name;if('f32'===s||'i32'===s||'u32'===s||'bool'===s||'f16'===s||'vec2'===s||'vec3'===s||'vec4'===s||'vec2f'===s||'vec3f'===s||'vec4f'===s||'vec2i'===s||'vec3i'===s||'vec4i'===s||'vec2u'===s||'vec3u'===s||'vec4u'===s||'vec2h'===s||'vec3h'===s||'vec4h'===s||'vec2b'===s||'vec3b'===s||'vec4b'===s||'mat2x2'===s||'mat2x3'===s||'mat2x4'===s||'mat3x2'===s||'mat3x3'===s||'mat3x4'===s||'mat4x2'===s||'mat4x3'===s||'mat4x4'===s||'mat2x2f'===s||'mat2x3f'===s||'mat2x4f'===s||'mat3x2f'===s||'mat3x3f'===s||'mat3x4f'===s||'mat4x2f'===s||'mat4x3f'===s||'mat4x4f'===s||'mat2x2h'===s||'mat2x3h'===s||'mat2x4h'===s||'mat3x2h'===s||'mat3x3h'===s||'mat3x4h'===s||'mat4x2h'===s||'mat4x3h'===s||'mat4x4h'===s||'array'===s){const s=new de(e.type,[]);n=this._evalCreate(s,t);}}t.createVariable(e.name,n,e);}_var(e,t){let n=null;if(null!==e.value){if(n=this.evalExpression(e.value,t),null===n)return void console.error(`Invalid value for variable ${e.name}. Line ${e.line}`);e.value instanceof ke||(n=n.clone());}else {if(null===e.type)return void console.error(`Variable ${e.name} has no type. Line ${e.line}`);const s=e.type.name;if('f32'===s||'i32'===s||'u32'===s||'bool'===s||'f16'===s||'vec2'===s||'vec3'===s||'vec4'===s||'vec2f'===s||'vec3f'===s||'vec4f'===s||'vec2i'===s||'vec3i'===s||'vec4i'===s||'vec2u'===s||'vec3u'===s||'vec4u'===s||'vec2h'===s||'vec3h'===s||'vec4h'===s||'vec2b'===s||'vec3b'===s||'vec4b'===s||'mat2x2'===s||'mat2x3'===s||'mat2x4'===s||'mat3x2'===s||'mat3x3'===s||'mat3x4'===s||'mat4x2'===s||'mat4x3'===s||'mat4x4'===s||'mat2x2f'===s||'mat2x3f'===s||'mat2x4f'===s||'mat3x2f'===s||'mat3x3f'===s||'mat3x4f'===s||'mat4x2f'===s||'mat4x3f'===s||'mat4x4f'===s||'mat2x2h'===s||'mat2x3h'===s||'mat2x4h'===s||'mat3x2h'===s||'mat3x3h'===s||'mat3x4h'===s||'mat4x2h'===s||'mat4x3h'===s||'mat4x4h'===s||e.type instanceof ue||e.type instanceof oe||e.type instanceof ce){const s=new de(e.type,[]);n=this._evalCreate(s,t);}}t.createVariable(e.name,n,e);}_switch(e,t){t=t.clone();const n=this.evalExpression(e.condition,t);if(!(n instanceof Be))return console.error(`Invalid if condition. Line ${e.line}`),null;let s=null;for(const r of e.cases)if(r instanceof Ae)for(const a of r.selectors){if(a instanceof Se){s=r;continue}const i=this.evalExpression(a,t);if(!(i instanceof Be))return console.error(`Invalid case selector. Line ${e.line}`),null;if(i.value===n.value)return this._execStatements(r.body,t)}else r instanceof Ee&&(s=r);return s?this._execStatements(s.body,t):null}_if(e,t){t=t.clone();const n=this.evalExpression(e.condition,t);if(!(n instanceof Be))return console.error(`Invalid if condition. Line ${e.line}`),null;if(n.value)return this._execStatements(e.body,t);for(const n of e.elseif){const s=this.evalExpression(n.condition,t);if(!(s instanceof Be))return console.error(`Invalid if condition. Line ${e.line}`),null;if(s.value)return this._execStatements(n.body,t)}return e.else?this._execStatements(e.else,t):null}_getScalarValue(e){return e instanceof Be?e.value:(console.error('Expected scalar value.',e),0)}_for(e,t){for(t=t.clone(),this.execStatement(e.init,t);this._getScalarValue(this.evalExpression(e.condition,t));){const n=this._execStatements(e.body,t);if(n===dt._breakObj)break;if(null!==n&&n!==dt._continueObj)return n;this.execStatement(e.increment,t);}return null}_loop(e,t){for(t=t.clone();;){const n=this._execStatements(e.body,t);if(n===dt._breakObj)break;if(n===dt._continueObj){if(e.continuing){if(this._execStatements(e.continuing.body,t)===dt._breakObj)break}}else if(null!==n)return n}return null}_while(e,t){for(t=t.clone();this._getScalarValue(this.evalExpression(e.condition,t));){const n=this._execStatements(e.body,t);if(n===dt._breakObj)break;if(n!==dt._continueObj&&null!==n)return n}return null}_evalBitcast(e,t){const n=this.evalExpression(e.value,t),s=e.type;if(n instanceof Be){const e=nt(n.value,n.typeInfo.name,s.name);return new Be(e,this.getTypeInfo(s))}if(n instanceof Me){const t=n.typeInfo.getTypeName();let r='';if(t.endsWith('f'))r='f32';else if(t.endsWith('i'))r='i32';else if(t.endsWith('u'))r='u32';else if(t.endsWith('b'))r='bool';else {if(!t.endsWith('h'))return console.error(`Unknown vector type ${t}. Line ${e.line}`),null;r='f16';}const a=s.getTypeName();let i='';if(a.endsWith('f'))i='f32';else if(a.endsWith('i'))i='i32';else if(a.endsWith('u'))i='u32';else if(a.endsWith('b'))i='bool';else {if(!a.endsWith('h'))return console.error(`Unknown vector type ${i}. Line ${e.line}`),null;i='f16';}const o=function(e,t,n){if(t===n)return e;const s=new Array(e.length);for(let r=0;r<e.length;r++)s[r]=nt(e[r],t,n);return s}(Array.from(n.data),r,i);return new Me(o,this.getTypeInfo(s))}return console.error(`TODO: bitcast for ${n.typeInfo.name}. Line ${e.line}`),null}_evalConst(e,t){return t.getVariableValue(e.name).clone().getSubData(this,e.postfix,t)}_evalCreate(e,t){var r;if(e instanceof de){if(null===e.type)return Ve.void;switch(e.type.getTypeName()){case 'bool':case 'i32':case 'u32':case 'f32':case 'f16':return this._callConstructorValue(e,t);case 'vec2':case 'vec3':case 'vec4':case 'vec2f':case 'vec3f':case 'vec4f':case 'vec2h':case 'vec3h':case 'vec4h':case 'vec2i':case 'vec3i':case 'vec4i':case 'vec2u':case 'vec3u':case 'vec4u':case 'vec2b':case 'vec3b':case 'vec4b':return this._callConstructorVec(e,t);case 'mat2x2':case 'mat2x2f':case 'mat2x2h':case 'mat2x3':case 'mat2x3f':case 'mat2x3h':case 'mat2x4':case 'mat2x4f':case 'mat2x4h':case 'mat3x2':case 'mat3x2f':case 'mat3x2h':case 'mat3x3':case 'mat3x3f':case 'mat3x3h':case 'mat3x4':case 'mat3x4f':case 'mat3x4h':case 'mat4x2':case 'mat4x2f':case 'mat4x2h':case 'mat4x3':case 'mat4x3f':case 'mat4x3h':case 'mat4x4':case 'mat4x4f':case 'mat4x4h':return this._callConstructorMatrix(e,t)}}const a=e instanceof de?e.type.name:e.name,i=e instanceof de?this.getTypeInfo(e.type):this.getTypeInfo(e.name);if(null===i)return console.error(`Unknown type ${a}. Line ${e.line}`),null;if(0===i.size)return null;const o=new Pe(new ArrayBuffer(i.size),i,0);if(i instanceof n){if(e.args)for(let n=0;n<e.args.length;++n){const s=i.members[n],r=e.args[n],a=this.evalExpression(r,t);o.setData(this,a,s.type,s.offset,t);}}else if(i instanceof s){let n=0;if(e.args)for(let s=0;s<e.args.length;++s){const a=e.args[s],c=this.evalExpression(a,t);null===i.format&&('x32'===(null===(r=c.typeInfo)||void 0===r?void 0:r.name)?i.format=this.getTypeInfo('i32'):i.format=c.typeInfo),o.setData(this,c,i.format,n,t),n+=i.stride;}}else console.error(`Unknown type "${a}". Line ${e.line}`);return e instanceof de?o.getSubData(this,e.postfix,t):o}_evalLiteral(e,t){const n=this.getTypeInfo(e.type),s=n.name;if('x32'===s||'u32'===s||'f32'===s||'f16'===s||'i32'===s||'bool'===s){return new Be(e.scalarValue,n)}return 'vec2'===s||'vec3'===s||'vec4'===s||'vec2f'===s||'vec3f'===s||'vec4f'===s||'vec2h'===s||'vec3h'===s||'vec4h'===s||'vec2i'===s||'vec3i'===s||'vec4i'===s||'vec2u'===s||'vec3u'===s||'vec4u'===s?this._callConstructorVec(e,t):'mat2x2'===s||'mat2x3'===s||'mat2x4'===s||'mat3x2'===s||'mat3x3'===s||'mat3x4'===s||'mat4x2'===s||'mat4x3'===s||'mat4x4'===s||'mat2x2f'===s||'mat2x3f'===s||'mat2x4f'===s||'mat3x2f'===s||'mat3x3f'===s||'mat3x4f'===s||'mat4x2f'===s||'mat4x3f'===s||'mat4x4f'===s||'mat2x2h'===s||'mat2x3h'===s||'mat2x4h'===s||'mat3x2h'===s||'mat3x3h'===s||'mat3x4h'===s||'mat4x2h'===s||'mat4x3h'===s||'mat4x4h'===s?this._callConstructorMatrix(e,t):e.value}_evalVariable(e,t){const n=t.getVariableValue(e.name);return null===n?n:n.getSubData(this,e.postfix,t)}_maxFormatTypeInfo(e){let t=e[0];if('f32'===t.name)return t;for(let n=1;n<e.length;++n){const s=dt._priority.get(t.name);dt._priority.get(e[n].name)<s&&(t=e[n]);}return 'x32'===t.name?this.getTypeInfo('i32'):t}_evalUnaryOp(e,t){const n=this.evalExpression(e.right,t);if('&'===e.operator)return new Oe(n);if('*'===e.operator)return n instanceof Oe?n.reference.getSubData(this,e.postfix,t):(console.error(`Invalid dereference. Line ${e.line}`),null);const s=n instanceof Be?n.value:n instanceof Me?Array.from(n.data):null;switch(e.operator){case '+':{if(Ge(s)){const e=s.map((e,t)=>+e);return new Me(e,n.typeInfo)}const e=s,t=this._maxFormatTypeInfo([n.typeInfo,n.typeInfo]);return new Be(+e,t)}case '-':{if(Ge(s)){const e=s.map((e,t)=>-e);return new Me(e,n.typeInfo)}const e=s,t=this._maxFormatTypeInfo([n.typeInfo,n.typeInfo]);return new Be(-e,t)}case '!':{if(Ge(s)){const e=s.map((e,t)=>e?0:1);return new Me(e,n.typeInfo)}const e=s,t=this._maxFormatTypeInfo([n.typeInfo,n.typeInfo]);return new Be(e?0:1,t)}case '~':{if(Ge(s)){const e=s.map((e,t)=>~e);return new Me(e,n.typeInfo)}const e=s,t=this._maxFormatTypeInfo([n.typeInfo,n.typeInfo]);return new Be(~e,t)}}return console.error(`Invalid unary operator ${e.operator}. Line ${e.line}`),null}_evalBinaryOp(e,t){const n=this.evalExpression(e.left,t),s=this.evalExpression(e.right,t),r=n instanceof Be?n.value:n instanceof Me||n instanceof Ue?Array.from(n.data):null,a=s instanceof Be?s.value:s instanceof Me||s instanceof Ue?Array.from(s.data):null;switch(e.operator){case '+':{if(Ge(r)&&Ge(a)){const t=r,s=a;if(t.length!==s.length)return console.error(`Vector length mismatch. Line ${e.line}.`),null;const i=t.map((e,t)=>e+s[t]);return new Me(i,n.typeInfo)}if(Ge(r)){const e=a,t=r.map((t,n)=>t+e);return new Me(t,n.typeInfo)}if(Ge(a)){const e=r,t=a.map((t,n)=>e+t);return new Me(t,s.typeInfo)}const t=r,i=a,o=this._maxFormatTypeInfo([n.typeInfo,s.typeInfo]);return new Be(t+i,o)}case '-':{if(Ge(r)&&Ge(a)){const t=r,s=a;if(t.length!==s.length)return console.error(`Vector length mismatch. Line ${e.line}.`),null;const i=t.map((e,t)=>e-s[t]);return new Me(i,n.typeInfo)}if(Ge(r)){const e=a,t=r.map((t,n)=>t-e);return new Me(t,n.typeInfo)}if(Ge(a)){const e=r,t=a.map((t,n)=>e-t);return new Me(t,s.typeInfo)}const t=r,i=a,o=this._maxFormatTypeInfo([n.typeInfo,s.typeInfo]);return new Be(t-i,o)}case '*':{if(Ge(r)&&Ge(a)){const t=r,i=a;if(n instanceof Ue&&s instanceof Ue){const r=function(e,t,n,s){if(void 0===pt[t.name]||void 0===pt[s.name])return null;const r=pt[t.name][0],a=pt[t.name][1],i=pt[s.name][0];if(r!==pt[s.name][1])return null;const o=new Array(i*a);for(let t=0;t<a;t++)for(let s=0;s<i;s++){let c=0;for(let i=0;i<r;i++)c+=e[i*a+t]*n[s*r+i];o[t*i+s]=c;}return o}(t,n.typeInfo,i,s.typeInfo);if(null===r)return console.error(`Matrix multiplication failed. Line ${e.line}.`),null;const a=pt[s.typeInfo.name][0],o=pt[n.typeInfo.name][1],c=this.getTypeInfo(`mat${a}x${o}f`);return new Ue(r,c)}if(n instanceof Ue&&s instanceof Me){const r=function(e,t,n,s){if(void 0===pt[t.name]||void 0===ft[s.name])return null;const r=pt[t.name][0],a=pt[t.name][1];if(r!==n.length)return null;const i=new Array(a);for(let t=0;t<a;t++){let s=0;for(let i=0;i<r;i++)s+=e[i*a+t]*n[i];i[t]=s;}return i}(t,n.typeInfo,i,s.typeInfo);return null===r?(console.error(`Matrix vector multiplication failed. Line ${e.line}.`),null):new Me(r,s.typeInfo)}if(n instanceof Me&&s instanceof Ue){const r=function(e,t,n,s){if(void 0===ft[t.name]||void 0===pt[s.name])return null;const r=pt[s.name][0],a=pt[s.name][1];if(a!==e.length)return null;const i=[];for(let t=0;t<r;t++){let s=0;for(let i=0;i<a;i++)s+=e[i]*n[i*r+t];i[t]=s;}return i}(t,n.typeInfo,i,s.typeInfo);return null===r?(console.error(`Matrix vector multiplication failed. Line ${e.line}.`),null):new Me(r,n.typeInfo)}{if(t.length!==i.length)return console.error(`Vector length mismatch. Line ${e.line}.`),null;const s=t.map((e,t)=>e*i[t]);return new Me(s,n.typeInfo)}}if(Ge(r)){const e=a,t=r.map((t,n)=>t*e);return n instanceof Ue?new Ue(t,n.typeInfo):new Me(t,n.typeInfo)}if(Ge(a)){const e=r,t=a.map((t,n)=>e*t);return s instanceof Ue?new Ue(t,s.typeInfo):new Me(t,s.typeInfo)}const t=r,i=a,o=this._maxFormatTypeInfo([n.typeInfo,s.typeInfo]);return new Be(t*i,o)}case '%':{if(Ge(r)&&Ge(a)){const t=r,s=a;if(t.length!==s.length)return console.error(`Vector length mismatch. Line ${e.line}.`),null;const i=t.map((e,t)=>e%s[t]);return new Me(i,n.typeInfo)}if(Ge(r)){const e=a,t=r.map((t,n)=>t%e);return new Me(t,n.typeInfo)}if(Ge(a)){const e=r,t=a.map((t,n)=>e%t);return new Me(t,s.typeInfo)}const t=r,i=a,o=this._maxFormatTypeInfo([n.typeInfo,s.typeInfo]);return new Be(t%i,o)}case '/':{if(Ge(r)&&Ge(a)){const t=r,s=a;if(t.length!==s.length)return console.error(`Vector length mismatch. Line ${e.line}.`),null;const i=t.map((e,t)=>e/s[t]);return new Me(i,n.typeInfo)}if(Ge(r)){const e=a,t=r.map((t,n)=>t/e);return new Me(t,n.typeInfo)}if(Ge(a)){const e=r,t=a.map((t,n)=>e/t);return new Me(t,s.typeInfo)}const t=r,i=a,o=this._maxFormatTypeInfo([n.typeInfo,s.typeInfo]);return new Be(t/i,o)}case '&':{if(Ge(r)&&Ge(a)){const t=r,s=a;if(t.length!==s.length)return console.error(`Vector length mismatch. Line ${e.line}.`),null;const i=t.map((e,t)=>e&s[t]);return new Me(i,n.typeInfo)}if(Ge(r)){const e=a,t=r.map((t,n)=>t&e);return new Me(t,n.typeInfo)}if(Ge(a)){const e=r,t=a.map((t,n)=>e&t);return new Me(t,s.typeInfo)}const t=r,i=a,o=this._maxFormatTypeInfo([n.typeInfo,s.typeInfo]);return new Be(t&i,o)}case '|':{if(Ge(r)&&Ge(a)){const t=r,s=a;if(t.length!==s.length)return console.error(`Vector length mismatch. Line ${e.line}.`),null;const i=t.map((e,t)=>e|s[t]);return new Me(i,n.typeInfo)}if(Ge(r)){const e=a,t=r.map((t,n)=>t|e);return new Me(t,n.typeInfo)}if(Ge(a)){const e=r,t=a.map((t,n)=>e|t);return new Me(t,s.typeInfo)}const t=r,i=a,o=this._maxFormatTypeInfo([n.typeInfo,s.typeInfo]);return new Be(t|i,o)}case '^':{if(Ge(r)&&Ge(a)){const t=r,s=a;if(t.length!==s.length)return console.error(`Vector length mismatch. Line ${e.line}.`),null;const i=t.map((e,t)=>e^s[t]);return new Me(i,n.typeInfo)}if(Ge(r)){const e=a,t=r.map((t,n)=>t^e);return new Me(t,n.typeInfo)}if(Ge(a)){const e=r,t=a.map((t,n)=>e^t);return new Me(t,s.typeInfo)}const t=r,i=a,o=this._maxFormatTypeInfo([n.typeInfo,s.typeInfo]);return new Be(t^i,o)}case '<<':{if(Ge(r)&&Ge(a)){const t=r,s=a;if(t.length!==s.length)return console.error(`Vector length mismatch. Line ${e.line}.`),null;const i=t.map((e,t)=>e<<s[t]);return new Me(i,n.typeInfo)}if(Ge(r)){const e=a,t=r.map((t,n)=>t<<e);return new Me(t,n.typeInfo)}if(Ge(a)){const e=r,t=a.map((t,n)=>e<<t);return new Me(t,s.typeInfo)}const t=r,i=a,o=this._maxFormatTypeInfo([n.typeInfo,s.typeInfo]);return new Be(t<<i,o)}case '>>':{if(Ge(r)&&Ge(a)){const t=r,s=a;if(t.length!==s.length)return console.error(`Vector length mismatch. Line ${e.line}.`),null;const i=t.map((e,t)=>e>>s[t]);return new Me(i,n.typeInfo)}if(Ge(r)){const e=a,t=r.map((t,n)=>t>>e);return new Me(t,n.typeInfo)}if(Ge(a)){const e=r,t=a.map((t,n)=>e>>t);return new Me(t,s.typeInfo)}const t=r,i=a,o=this._maxFormatTypeInfo([n.typeInfo,s.typeInfo]);return new Be(t>>i,o)}case '>':if(Ge(r)&&Ge(a)){const t=r,s=a;if(t.length!==s.length)return console.error(`Vector length mismatch. Line ${e.line}.`),null;const i=t.map((e,t)=>e>s[t]?1:0);return new Me(i,n.typeInfo)}if(Ge(r)){const e=a,t=r.map((t,n)=>t>e?1:0);return new Me(t,n.typeInfo)}if(Ge(a)){const e=r,t=a.map((t,n)=>e>t?1:0);return new Me(t,s.typeInfo)}return new Be(r>a?1:0,this.getTypeInfo('bool'));case '<':if(Ge(r)&&Ge(a)){const t=r,s=a;if(t.length!==s.length)return console.error(`Vector length mismatch. Line ${e.line}.`),null;const i=t.map((e,t)=>e<s[t]?1:0);return new Me(i,n.typeInfo)}if(Ge(r)){const e=a,t=r.map((t,n)=>t<e?1:0);return new Me(t,n.typeInfo)}if(Ge(a)){const e=r,t=a.map((t,n)=>e<t?1:0);return new Me(t,s.typeInfo)}return new Be(r<a?1:0,this.getTypeInfo('bool'));case '==':if(Ge(r)&&Ge(a)){const t=r,s=a;if(t.length!==s.length)return console.error(`Vector length mismatch. Line ${e.line}.`),null;const i=t.map((e,t)=>e===s[t]?1:0);return new Me(i,n.typeInfo)}if(Ge(r)){const e=a,t=r.map((t,n)=>t==e?1:0);return new Me(t,n.typeInfo)}if(Ge(a)){const e=r,t=a.map((t,n)=>e==t?1:0);return new Me(t,s.typeInfo)}return new Be(r===a?1:0,this.getTypeInfo('bool'));case '!=':if(Ge(r)&&Ge(a)){const t=r,s=a;if(t.length!==s.length)return console.error(`Vector length mismatch. Line ${e.line}.`),null;const i=t.map((e,t)=>e!==s[t]?1:0);return new Me(i,n.typeInfo)}if(Ge(r)){const e=a,t=r.map((t,n)=>t!==e?1:0);return new Me(t,n.typeInfo)}if(Ge(a)){const e=r,t=a.map((t,n)=>e!==t?1:0);return new Me(t,s.typeInfo)}return new Be(r!==a?1:0,this.getTypeInfo('bool'));case '>=':if(Ge(r)&&Ge(a)){const t=r,s=a;if(t.length!==s.length)return console.error(`Vector length mismatch. Line ${e.line}.`),null;const i=t.map((e,t)=>e>=s[t]?1:0);return new Me(i,n.typeInfo)}if(Ge(r)){const e=a,t=r.map((t,n)=>t>=e?1:0);return new Me(t,n.typeInfo)}if(Ge(a)){const e=r,t=a.map((t,n)=>e>=t?1:0);return new Me(t,s.typeInfo)}return new Be(r>=a?1:0,this.getTypeInfo('bool'));case '<=':if(Ge(r)&&Ge(a)){const t=r,s=a;if(t.length!==s.length)return console.error(`Vector length mismatch. Line ${e.line}.`),null;const i=t.map((e,t)=>e<=s[t]?1:0);return new Me(i,n.typeInfo)}if(Ge(r)){const e=a,t=r.map((t,n)=>t<=e?1:0);return new Me(t,n.typeInfo)}if(Ge(a)){const e=r,t=a.map((t,n)=>e<=t?1:0);return new Me(t,s.typeInfo)}return new Be(r<=a?1:0,this.getTypeInfo('bool'));case '&&':if(Ge(r)&&Ge(a)){const t=r,s=a;if(t.length!==s.length)return console.error(`Vector length mismatch. Line ${e.line}.`),null;const i=t.map((e,t)=>e&&s[t]?1:0);return new Me(i,n.typeInfo)}if(Ge(r)){const e=a,t=r.map((t,n)=>t&&e?1:0);return new Me(t,n.typeInfo)}if(Ge(a)){const e=r,t=a.map((t,n)=>e&&t?1:0);return new Me(t,s.typeInfo)}return new Be(r&&a?1:0,this.getTypeInfo('bool'));case '||':if(Ge(r)&&Ge(a)){const t=r,s=a;if(t.length!==s.length)return console.error(`Vector length mismatch. Line ${e.line}.`),null;const i=t.map((e,t)=>e||s[t]?1:0);return new Me(i,n.typeInfo)}if(Ge(r)){const e=a,t=r.map((t,n)=>t||e?1:0);return new Me(t,n.typeInfo)}if(Ge(a)){const e=r,t=a.map((t,n)=>e||t?1:0);return new Me(t,s.typeInfo)}return new Be(r||a?1:0,this.getTypeInfo('bool'))}return console.error(`Unknown operator ${e.operator}. Line ${e.line}`),null}_evalCall(e,t){if(null!==e.cachedReturnValue)return e.cachedReturnValue;const n=t.clone();n.currentFunctionName=e.name;const s=t.getFunction(e.name);if(!s){if(e.isBuiltin)return this._callBuiltinFunction(e,n);return this.getTypeInfo(e.name)?this._evalCreate(e,t):(console.error(`Unknown function "${e.name}". Line ${e.line}`),null)}for(let t=0;t<s.node.args.length;++t){const r=s.node.args[t],a=this.evalExpression(e.args[t],n);n.createVariable(r.name,a,r);}return this._execStatements(s.node.body,n)}_callBuiltinFunction(e,t){switch(e.name){case 'all':return this.builtins.All(e,t);case 'any':return this.builtins.Any(e,t);case 'select':return this.builtins.Select(e,t);case 'arrayLength':return this.builtins.ArrayLength(e,t);case 'abs':return this.builtins.Abs(e,t);case 'acos':return this.builtins.Acos(e,t);case 'acosh':return this.builtins.Acosh(e,t);case 'asin':return this.builtins.Asin(e,t);case 'asinh':return this.builtins.Asinh(e,t);case 'atan':return this.builtins.Atan(e,t);case 'atanh':return this.builtins.Atanh(e,t);case 'atan2':return this.builtins.Atan2(e,t);case 'ceil':return this.builtins.Ceil(e,t);case 'clamp':return this.builtins.Clamp(e,t);case 'cos':return this.builtins.Cos(e,t);case 'cosh':return this.builtins.Cosh(e,t);case 'countLeadingZeros':return this.builtins.CountLeadingZeros(e,t);case 'countOneBits':return this.builtins.CountOneBits(e,t);case 'countTrailingZeros':return this.builtins.CountTrailingZeros(e,t);case 'cross':return this.builtins.Cross(e,t);case 'degrees':return this.builtins.Degrees(e,t);case 'determinant':return this.builtins.Determinant(e,t);case 'distance':return this.builtins.Distance(e,t);case 'dot':return this.builtins.Dot(e,t);case 'dot4U8Packed':return this.builtins.Dot4U8Packed(e,t);case 'dot4I8Packed':return this.builtins.Dot4I8Packed(e,t);case 'exp':return this.builtins.Exp(e,t);case 'exp2':return this.builtins.Exp2(e,t);case 'extractBits':return this.builtins.ExtractBits(e,t);case 'faceForward':return this.builtins.FaceForward(e,t);case 'firstLeadingBit':return this.builtins.FirstLeadingBit(e,t);case 'firstTrailingBit':return this.builtins.FirstTrailingBit(e,t);case 'floor':return this.builtins.Floor(e,t);case 'fma':return this.builtins.Fma(e,t);case 'fract':return this.builtins.Fract(e,t);case 'frexp':return this.builtins.Frexp(e,t);case 'insertBits':return this.builtins.InsertBits(e,t);case 'inverseSqrt':return this.builtins.InverseSqrt(e,t);case 'ldexp':return this.builtins.Ldexp(e,t);case 'length':return this.builtins.Length(e,t);case 'log':return this.builtins.Log(e,t);case 'log2':return this.builtins.Log2(e,t);case 'max':return this.builtins.Max(e,t);case 'min':return this.builtins.Min(e,t);case 'mix':return this.builtins.Mix(e,t);case 'modf':return this.builtins.Modf(e,t);case 'normalize':return this.builtins.Normalize(e,t);case 'pow':return this.builtins.Pow(e,t);case 'quantizeToF16':return this.builtins.QuantizeToF16(e,t);case 'radians':return this.builtins.Radians(e,t);case 'reflect':return this.builtins.Reflect(e,t);case 'refract':return this.builtins.Refract(e,t);case 'reverseBits':return this.builtins.ReverseBits(e,t);case 'round':return this.builtins.Round(e,t);case 'saturate':return this.builtins.Saturate(e,t);case 'sign':return this.builtins.Sign(e,t);case 'sin':return this.builtins.Sin(e,t);case 'sinh':return this.builtins.Sinh(e,t);case 'smoothstep':return this.builtins.SmoothStep(e,t);case 'sqrt':return this.builtins.Sqrt(e,t);case 'step':return this.builtins.Step(e,t);case 'tan':return this.builtins.Tan(e,t);case 'tanh':return this.builtins.Tanh(e,t);case 'transpose':return this.builtins.Transpose(e,t);case 'trunc':return this.builtins.Trunc(e,t);case 'dpdx':return this.builtins.Dpdx(e,t);case 'dpdxCoarse':return this.builtins.DpdxCoarse(e,t);case 'dpdxFine':return this.builtins.DpdxFine(e,t);case 'dpdy':return this.builtins.Dpdy(e,t);case 'dpdyCoarse':return this.builtins.DpdyCoarse(e,t);case 'dpdyFine':return this.builtins.DpdyFine(e,t);case 'fwidth':return this.builtins.Fwidth(e,t);case 'fwidthCoarse':return this.builtins.FwidthCoarse(e,t);case 'fwidthFine':return this.builtins.FwidthFine(e,t);case 'textureDimensions':return this.builtins.TextureDimensions(e,t);case 'textureGather':return this.builtins.TextureGather(e,t);case 'textureGatherCompare':return this.builtins.TextureGatherCompare(e,t);case 'textureLoad':return this.builtins.TextureLoad(e,t);case 'textureNumLayers':return this.builtins.TextureNumLayers(e,t);case 'textureNumLevels':return this.builtins.TextureNumLevels(e,t);case 'textureNumSamples':return this.builtins.TextureNumSamples(e,t);case 'textureSample':return this.builtins.TextureSample(e,t);case 'textureSampleBias':return this.builtins.TextureSampleBias(e,t);case 'textureSampleCompare':return this.builtins.TextureSampleCompare(e,t);case 'textureSampleCompareLevel':return this.builtins.TextureSampleCompareLevel(e,t);case 'textureSampleGrad':return this.builtins.TextureSampleGrad(e,t);case 'textureSampleLevel':return this.builtins.TextureSampleLevel(e,t);case 'textureSampleBaseClampToEdge':return this.builtins.TextureSampleBaseClampToEdge(e,t);case 'textureStore':return this.builtins.TextureStore(e,t);case 'atomicLoad':return this.builtins.AtomicLoad(e,t);case 'atomicStore':return this.builtins.AtomicStore(e,t);case 'atomicAdd':return this.builtins.AtomicAdd(e,t);case 'atomicSub':return this.builtins.AtomicSub(e,t);case 'atomicMax':return this.builtins.AtomicMax(e,t);case 'atomicMin':return this.builtins.AtomicMin(e,t);case 'atomicAnd':return this.builtins.AtomicAnd(e,t);case 'atomicOr':return this.builtins.AtomicOr(e,t);case 'atomicXor':return this.builtins.AtomicXor(e,t);case 'atomicExchange':return this.builtins.AtomicExchange(e,t);case 'atomicCompareExchangeWeak':return this.builtins.AtomicCompareExchangeWeak(e,t);case 'pack4x8snorm':return this.builtins.Pack4x8snorm(e,t);case 'pack4x8unorm':return this.builtins.Pack4x8unorm(e,t);case 'pack4xI8':return this.builtins.Pack4xI8(e,t);case 'pack4xU8':return this.builtins.Pack4xU8(e,t);case 'pack4x8Clamp':return this.builtins.Pack4x8Clamp(e,t);case 'pack4xU8Clamp':return this.builtins.Pack4xU8Clamp(e,t);case 'pack2x16snorm':return this.builtins.Pack2x16snorm(e,t);case 'pack2x16unorm':return this.builtins.Pack2x16unorm(e,t);case 'pack2x16float':return this.builtins.Pack2x16float(e,t);case 'unpack4x8snorm':return this.builtins.Unpack4x8snorm(e,t);case 'unpack4x8unorm':return this.builtins.Unpack4x8unorm(e,t);case 'unpack4xI8':return this.builtins.Unpack4xI8(e,t);case 'unpack4xU8':return this.builtins.Unpack4xU8(e,t);case 'unpack2x16snorm':return this.builtins.Unpack2x16snorm(e,t);case 'unpack2x16unorm':return this.builtins.Unpack2x16unorm(e,t);case 'unpack2x16float':return this.builtins.Unpack2x16float(e,t);case 'storageBarrier':return this.builtins.StorageBarrier(e,t);case 'textureBarrier':return this.builtins.TextureBarrier(e,t);case 'workgroupBarrier':return this.builtins.WorkgroupBarrier(e,t);case 'workgroupUniformLoad':return this.builtins.WorkgroupUniformLoad(e,t);case 'subgroupAdd':return this.builtins.SubgroupAdd(e,t);case 'subgroupExclusiveAdd':return this.builtins.SubgroupExclusiveAdd(e,t);case 'subgroupInclusiveAdd':return this.builtins.SubgroupInclusiveAdd(e,t);case 'subgroupAll':return this.builtins.SubgroupAll(e,t);case 'subgroupAnd':return this.builtins.SubgroupAnd(e,t);case 'subgroupAny':return this.builtins.SubgroupAny(e,t);case 'subgroupBallot':return this.builtins.SubgroupBallot(e,t);case 'subgroupBroadcast':return this.builtins.SubgroupBroadcast(e,t);case 'subgroupBroadcastFirst':return this.builtins.SubgroupBroadcastFirst(e,t);case 'subgroupElect':return this.builtins.SubgroupElect(e,t);case 'subgroupMax':return this.builtins.SubgroupMax(e,t);case 'subgroupMin':return this.builtins.SubgroupMin(e,t);case 'subgroupMul':return this.builtins.SubgroupMul(e,t);case 'subgroupExclusiveMul':return this.builtins.SubgroupExclusiveMul(e,t);case 'subgroupInclusiveMul':return this.builtins.SubgroupInclusiveMul(e,t);case 'subgroupOr':return this.builtins.SubgroupOr(e,t);case 'subgroupShuffle':return this.builtins.SubgroupShuffle(e,t);case 'subgroupShuffleDown':return this.builtins.SubgroupShuffleDown(e,t);case 'subgroupShuffleUp':return this.builtins.SubgroupShuffleUp(e,t);case 'subgroupShuffleXor':return this.builtins.SubgroupShuffleXor(e,t);case 'subgroupXor':return this.builtins.SubgroupXor(e,t);case 'quadBroadcast':return this.builtins.QuadBroadcast(e,t);case 'quadSwapDiagonal':return this.builtins.QuadSwapDiagonal(e,t);case 'quadSwapX':return this.builtins.QuadSwapX(e,t);case 'quadSwapY':return this.builtins.QuadSwapY(e,t)}const n=t.getFunction(e.name);if(n){const s=t.clone();for(let t=0;t<n.node.args.length;++t){const r=n.node.args[t],a=this.evalExpression(e.args[t],s);s.setVariable(r.name,a,r);}return this._execStatements(n.node.body,s)}return null}_callConstructorValue(e,t){if(!e.args||0===e.args.length)return new Be(0,this.getTypeInfo(e.type));const n=this.evalExpression(e.args[0],t);return n.typeInfo=this.getTypeInfo(e.type),n.getSubData(this,e.postfix,t).clone()}_callConstructorVec(e,t){const n=this.getTypeInfo(e.type),s=e.type.getTypeName(),r=ft[s];if(void 0===r)return console.error(`Invalid vec constructor ${s}. Line ${e.line}`),null;const a=[];if(e instanceof xe)if(e.isVector){const t=e.vectorValue;for(const e of t)a.push(e);}else a.push(e.scalarValue);else if(e.args)for(const n of e.args){const e=this.evalExpression(n,t);if(e instanceof Me){const t=e.data;for(let e=0;e<t.length;++e){let n=t[e];a.push(n);}}else if(e instanceof Be){let t=e.value;a.push(t);}}if(e.type instanceof ce&&null===e.type.format&&(e.type.format=ce.f32),0===a.length){const s=new Array(r).fill(0);return new Me(s,n).getSubData(this,e.postfix,t)}if(1===a.length)for(;a.length<r;)a.push(a[0]);if(a.length<r)return console.error(`Invalid vec constructor. Line ${e.line}`),null;return new Me(a.length>r?a.slice(0,r):a,n).getSubData(this,e.postfix,t)}_callConstructorMatrix(e,t){const n=this.getTypeInfo(e.type),s=e.type.getTypeName(),r=pt[s];if(void 0===r)return console.error(`Invalid matrix constructor ${s}. Line ${e.line}`),null;const i=[];if(e instanceof xe)if(e.isVector){const t=e.vectorValue;for(const e of t)i.push(e);}else i.push(e.scalarValue);else if(e.args)for(const n of e.args){const e=this.evalExpression(n,t);e instanceof Me?i.push(...e.data):e instanceof Be?i.push(e.value):e instanceof Ue&&i.push(...e.data);}if(n instanceof a&&null===n.format&&(n.format=this.getTypeInfo('f32')),0===i.length){const s=new Array(r[2]).fill(0);return new Ue(s,n).getSubData(this,e.postfix,t)}return i.length!==r[2]?(console.error(`Invalid matrix constructor. Line ${e.line}`),null):new Ue(i,n).getSubData(this,e.postfix,t)}}dt._breakObj=new Ne(new e('BREAK',null),null),dt._continueObj=new Ne(new e('CONTINUE',null),null),dt._priority=new Map([['f32',0],['f16',1],['u32',2],['i32',3],['x32',3]]);class mt{constructor(){this.constants=new Map,this.aliases=new Map,this.structs=new Map;}}class gt{constructor(){this._tokens=[],this._current=0,this._currentLine=1,this._deferArrayCountEval=[],this._currentLoop=[],this._context=new mt,this._exec=new dt,this._forwardTypeCount=0;}parse(e){this._initialize(e),this._deferArrayCountEval.length=0;const t=[];for(;!this._isAtEnd();){const e=this._global_decl_or_directive();if(!e)break;t.push(e);}if(this._deferArrayCountEval.length>0){for(const e of this._deferArrayCountEval){const t=e.arrayType,n=e.countNode;if(n instanceof ge){const e=n.name,s=this._context.constants.get(e);if(s)try{const e=s.constEvaluate(this._exec);t.count=e;}catch(e){}}}this._deferArrayCountEval.length=0;}if(this._forwardTypeCount>0)for(const e of t)e.search(e=>{e instanceof Ce||e instanceof le?e.type=this._forwardType(e.type):e instanceof ue?e.format=this._forwardType(e.format):e instanceof F||e instanceof U||e instanceof P?e.type=this._forwardType(e.type):e instanceof D?e.returnType=this._forwardType(e.returnType):e instanceof $e&&(e.type=this._forwardType(e.type));});return t}_forwardType(e){if(e instanceof ie){const t=this._getType(e.name);if(t)return t}else e instanceof le?e.type=this._forwardType(e.type):e instanceof ue&&(e.format=this._forwardType(e.format));return e}_initialize(e){if(e)if('string'==typeof e){const t=new Re(e);this._tokens=t.scanTokens();}else this._tokens=e;else this._tokens=[];this._current=0;}_updateNode(e,t){return e.line=null!=t?t:this._currentLine,e}_error(e,t){return {token:e,message:t,toString:()=>`${t}`}}_isAtEnd(){return this._current>=this._tokens.length||this._peek().type==He.eof}_match(e){if(e instanceof qe)return !!this._check(e)&&(this._advance(),true);for(let t=0,n=e.length;t<n;++t){const n=e[t];if(this._check(n))return this._advance(),true}return  false}_consume(e,t){if(this._check(e))return this._advance();throw this._error(this._peek(),`${t}. Line:${this._currentLine}`)}_check(e){if(this._isAtEnd())return  false;const t=this._peek();if(e instanceof Array){const n=t.type;let s=false;for(const t of e){if(n===t)return  true;t===He.tokens.name&&(s=true);}if(s){const e=He.tokens.name.rule.exec(t.lexeme);if(e&&0==e.index&&e[0]==t.lexeme)return  true}return  false}if(t.type===e)return  true;if(e===He.tokens.name){const e=He.tokens.name.rule.exec(t.lexeme);return e&&0==e.index&&e[0]==t.lexeme}return  false}_advance(){var e,t;return this._currentLine=null!==(t=null===(e=this._peek())||void 0===e?void 0:e.line)&&void 0!==t?t:-1,this._isAtEnd()||this._current++,this._previous()}_peek(){return this._tokens[this._current]}_previous(){return this._tokens[this._current-1]}_global_decl_or_directive(){for(;this._match(He.tokens.semicolon)&&!this._isAtEnd(););if(this._match(He.keywords.alias)){const e=this._type_alias();return this._consume(He.tokens.semicolon,'Expected \';\''),this._exec.reflection.updateAST([e]),e}if(this._match(He.keywords.diagnostic)){const e=this._diagnostic();return this._consume(He.tokens.semicolon,'Expected \';\''),this._exec.reflection.updateAST([e]),e}if(this._match(He.keywords.requires)){const e=this._requires_directive();return this._consume(He.tokens.semicolon,'Expected \';\''),this._exec.reflection.updateAST([e]),e}if(this._match(He.keywords.enable)){const e=this._enable_directive();return this._consume(He.tokens.semicolon,'Expected \';\''),this._exec.reflection.updateAST([e]),e}const e=this._attribute();if(this._check(He.keywords.var)){const t=this._global_variable_decl();return null!=t&&(t.attributes=e),this._consume(He.tokens.semicolon,'Expected \';\'.'),this._exec.reflection.updateAST([t]),t}if(this._check(He.keywords.override)){const t=this._override_variable_decl();return null!=t&&(t.attributes=e),this._consume(He.tokens.semicolon,'Expected \';\'.'),this._exec.reflection.updateAST([t]),t}if(this._check(He.keywords.let)){const t=this._global_let_decl();return null!=t&&(t.attributes=e),this._consume(He.tokens.semicolon,'Expected \';\'.'),this._exec.reflection.updateAST([t]),t}if(this._check(He.keywords.const)){const t=this._global_const_decl();return null!=t&&(t.attributes=e),this._consume(He.tokens.semicolon,'Expected \';\'.'),this._exec.reflection.updateAST([t]),t}if(this._check(He.keywords.struct)){const t=this._struct_decl();return null!=t&&(t.attributes=e),this._exec.reflection.updateAST([t]),t}if(this._check(He.keywords.fn)){const t=this._function_decl();return null!=t&&(t.attributes=e),this._exec.reflection.updateAST([t]),t}return null}_function_decl(){if(!this._match(He.keywords.fn))return null;const e=this._currentLine,t=this._consume(He.tokens.ident,'Expected function name.').toString();this._consume(He.tokens.paren_left,'Expected \'(\' for function arguments.');const n=[];if(!this._check(He.tokens.paren_right))do{if(this._check(He.tokens.paren_right))break;const e=this._attribute(),t=this._consume(He.tokens.name,'Expected argument name.').toString();this._consume(He.tokens.colon,'Expected \':\' for argument type.');const s=this._attribute(),r=this._type_decl();null!=r&&(r.attributes=s,n.push(this._updateNode(new $e(t,r,e))));}while(this._match(He.tokens.comma));this._consume(He.tokens.paren_right,'Expected \')\' after function arguments.');let s=null;if(this._match(He.tokens.arrow)){const e=this._attribute();s=this._type_decl(),null!=s&&(s.attributes=e);}const r=this._compound_statement(),a=this._currentLine;return this._updateNode(new D(t,n,s,r,e,a),e)}_compound_statement(){const e=[];for(this._consume(He.tokens.brace_left,'Expected \'{\' for block.');!this._check(He.tokens.brace_right);){const t=this._statement();null!==t&&e.push(t);}return this._consume(He.tokens.brace_right,'Expected \'}\' for block.'),e}_statement(){for(;this._match(He.tokens.semicolon)&&!this._isAtEnd(););if(this._check(He.tokens.attr)&&this._attribute(),this._check(He.keywords.if))return this._if_statement();if(this._check(He.keywords.switch))return this._switch_statement();if(this._check(He.keywords.loop))return this._loop_statement();if(this._check(He.keywords.for))return this._for_statement();if(this._check(He.keywords.while))return this._while_statement();if(this._check(He.keywords.continuing))return this._continuing_statement();if(this._check(He.keywords.static_assert))return this._static_assert_statement();if(this._check(He.tokens.brace_left))return this._compound_statement();let e=null;if(this._check(He.keywords.return))e=this._return_statement();else if(this._check([He.keywords.var,He.keywords.let,He.keywords.const]))e=this._variable_statement();else if(this._match(He.keywords.discard))e=this._updateNode(new ne);else if(this._match(He.keywords.break)){const t=this._updateNode(new se);if(this._currentLoop.length>0){const e=this._currentLoop[this._currentLoop.length-1];t.loopId=e.id;}e=t,this._check(He.keywords.if)&&(this._advance(),t.condition=this._optional_paren_expression());}else if(this._match(He.keywords.continue)){const t=this._updateNode(new re);if(!(this._currentLoop.length>0))throw this._error(this._peek(),`Continue statement must be inside a loop. Line: ${t.line}`);{const e=this._currentLoop[this._currentLoop.length-1];t.loopId=e.id;}e=t;}else e=this._increment_decrement_statement()||this._func_call_statement()||this._assignment_statement();return null!=e&&this._consume(He.tokens.semicolon,'Expected \';\' after statement.'),e}_static_assert_statement(){if(!this._match(He.keywords.static_assert))return null;const e=this._currentLine,t=this._optional_paren_expression();return this._updateNode(new N(t),e)}_while_statement(){if(!this._match(He.keywords.while))return null;const e=this._updateNode(new V(null,null));return this._currentLoop.push(e),e.condition=this._optional_paren_expression(),this._check(He.tokens.attr)&&this._attribute(),e.body=this._compound_statement(),this._currentLoop.pop(),e}_continuing_statement(){const e=this._currentLoop.length>0?this._currentLoop[this._currentLoop.length-1].id:-1;if(!this._match(He.keywords.continuing))return null;const t=this._currentLine,n=this._compound_statement();return this._updateNode(new O(n,e),t)}_for_statement(){if(!this._match(He.keywords.for))return null;this._consume(He.tokens.paren_left,'Expected \'(\'.');const e=this._updateNode(new B(null,null,null,null));return this._currentLoop.push(e),e.init=this._check(He.tokens.semicolon)?null:this._for_init(),this._consume(He.tokens.semicolon,'Expected \';\'.'),e.condition=this._check(He.tokens.semicolon)?null:this._short_circuit_or_expression(),this._consume(He.tokens.semicolon,'Expected \';\'.'),e.increment=this._check(He.tokens.paren_right)?null:this._for_increment(),this._consume(He.tokens.paren_right,'Expected \')\'.'),this._check(He.tokens.attr)&&this._attribute(),e.body=this._compound_statement(),this._currentLoop.pop(),e}_for_init(){return this._variable_statement()||this._func_call_statement()||this._assignment_statement()}_for_increment(){return this._func_call_statement()||this._increment_decrement_statement()||this._assignment_statement()}_variable_statement(){if(this._check(He.keywords.var)){const e=this._variable_decl();if(null===e)throw this._error(this._peek(),'Variable declaration expected.');let t=null;return this._match(He.tokens.equal)&&(t=this._short_circuit_or_expression()),this._updateNode(new F(e.name,e.type,e.storage,e.access,t),e.line)}if(this._match(He.keywords.let)){const e=this._currentLine,t=this._consume(He.tokens.name,'Expected name for let.').toString();let n=null;if(this._match(He.tokens.colon)){const e=this._attribute();n=this._type_decl(),null!=n&&(n.attributes=e);}this._consume(He.tokens.equal,'Expected \'=\' for let.');const s=this._short_circuit_or_expression();return this._updateNode(new U(t,n,null,null,s),e)}if(this._match(He.keywords.const)){const e=this._currentLine,t=this._consume(He.tokens.name,'Expected name for const.').toString();let n=null;if(this._match(He.tokens.colon)){const e=this._attribute();n=this._type_decl(),null!=n&&(n.attributes=e);}this._consume(He.tokens.equal,'Expected \'=\' for const.');const s=this._short_circuit_or_expression();return null===n&&s instanceof xe&&(n=s.type),this._updateNode(new P(t,n,null,null,s),e)}return null}_increment_decrement_statement(){const e=this._current,t=this._unary_expression();if(null==t)return null;if(!this._check(He.increment_operators))return this._current=e,null;const n=this._consume(He.increment_operators,'Expected increment operator');return this._updateNode(new R(n.type===He.tokens.plus_plus?W.increment:W.decrement,t))}_assignment_statement(){let e=null;const t=this._currentLine;if(this._check(He.tokens.brace_right))return null;let n=this._match(He.tokens.underscore);if(n||(e=this._unary_expression()),!n&&null==e)return null;const s=this._consume(He.assignment_operators,'Expected assignment operator.'),r=this._short_circuit_or_expression();return this._updateNode(new G(q.parse(s.lexeme),e,r),t)}_func_call_statement(){if(!this._check(He.tokens.ident))return null;const e=this._currentLine,t=this._current,n=this._consume(He.tokens.ident,'Expected function name.'),s=this._argument_expression_list();return null===s?(this._current=t,null):this._updateNode(new X(n.lexeme,s),e)}_loop_statement(){if(!this._match(He.keywords.loop))return null;this._check(He.tokens.attr)&&this._attribute(),this._consume(He.tokens.brace_left,'Expected \'{\' for loop.');const e=this._updateNode(new j([],null));this._currentLoop.push(e);let t=this._statement();for(;null!==t;){if(Array.isArray(t))for(let n of t)e.body.push(n);else e.body.push(t);if(t instanceof O){e.continuing=t;break}t=this._statement();}return this._currentLoop.pop(),this._consume(He.tokens.brace_right,'Expected \'}\' for loop.'),e}_switch_statement(){if(!this._match(He.keywords.switch))return null;const e=this._updateNode(new Z(null,[]));if(this._currentLoop.push(e),e.condition=this._optional_paren_expression(),this._check(He.tokens.attr)&&this._attribute(),this._consume(He.tokens.brace_left,'Expected \'{\' for switch.'),e.cases=this._switch_body(),null==e.cases||0==e.cases.length)throw this._error(this._previous(),'Expected \'case\' or \'default\'.');return this._consume(He.tokens.brace_right,'Expected \'}\' for switch.'),this._currentLoop.pop(),e}_switch_body(){const e=[];let t=false;for(;this._check([He.keywords.default,He.keywords.case]);){if(this._match(He.keywords.case)){const n=this._case_selectors();for(const e of n)if(e instanceof Se){if(t)throw this._error(this._previous(),'Multiple default cases in switch statement.');t=true;break}this._match(He.tokens.colon),this._check(He.tokens.attr)&&this._attribute(),this._consume(He.tokens.brace_left,'Exected \'{\' for switch case.');const s=this._case_body();this._consume(He.tokens.brace_right,'Exected \'}\' for switch case.'),e.push(this._updateNode(new Ae(n,s)));}if(this._match(He.keywords.default)){if(t)throw this._error(this._previous(),'Multiple default cases in switch statement.');this._match(He.tokens.colon),this._check(He.tokens.attr)&&this._attribute(),this._consume(He.tokens.brace_left,'Exected \'{\' for switch default.');const n=this._case_body();this._consume(He.tokens.brace_right,'Exected \'}\' for switch default.'),e.push(this._updateNode(new Ee(n)));}}return e}_case_selectors(){const e=[];for(this._match(He.keywords.default)?e.push(this._updateNode(new Se)):e.push(this._shift_expression());this._match(He.tokens.comma);)this._match(He.keywords.default)?e.push(this._updateNode(new Se)):e.push(this._shift_expression());return e}_case_body(){if(this._match(He.keywords.fallthrough))return this._consume(He.tokens.semicolon,'Expected \';\''),[];let e=this._statement();if(null==e)return [];e instanceof Array||(e=[e]);const t=this._case_body();return 0==t.length?e:[...e,t[0]]}_if_statement(){if(!this._match(He.keywords.if))return null;const e=this._currentLine,t=this._optional_paren_expression();this._check(He.tokens.attr)&&this._attribute();const n=this._compound_statement();let s=[];this._match_elseif()&&(this._check(He.tokens.attr)&&this._attribute(),s=this._elseif_statement(s));let r=null;return this._match(He.keywords.else)&&(this._check(He.tokens.attr)&&this._attribute(),r=this._compound_statement()),this._updateNode(new Q(t,n,s,r),e)}_match_elseif(){return this._tokens[this._current].type===He.keywords.else&&this._tokens[this._current+1].type===He.keywords.if&&(this._advance(),this._advance(),true)}_elseif_statement(e=[]){const t=this._optional_paren_expression(),n=this._compound_statement();return e.push(this._updateNode(new Le(t,n))),this._match_elseif()&&(this._check(He.tokens.attr)&&this._attribute(),this._elseif_statement(e)),e}_return_statement(){if(!this._match(He.keywords.return))return null;const e=this._short_circuit_or_expression();return this._updateNode(new Y(e))}_short_circuit_or_expression(){let e=this._short_circuit_and_expr();for(;this._match(He.tokens.or_or);)e=this._updateNode(new Ie(this._previous().toString(),e,this._short_circuit_and_expr()));return e}_short_circuit_and_expr(){let e=this._inclusive_or_expression();for(;this._match(He.tokens.and_and);)e=this._updateNode(new Ie(this._previous().toString(),e,this._inclusive_or_expression()));return e}_inclusive_or_expression(){let e=this._exclusive_or_expression();for(;this._match(He.tokens.or);)e=this._updateNode(new Ie(this._previous().toString(),e,this._exclusive_or_expression()));return e}_exclusive_or_expression(){let e=this._and_expression();for(;this._match(He.tokens.xor);)e=this._updateNode(new Ie(this._previous().toString(),e,this._and_expression()));return e}_and_expression(){let e=this._equality_expression();for(;this._match(He.tokens.and);)e=this._updateNode(new Ie(this._previous().toString(),e,this._equality_expression()));return e}_equality_expression(){const e=this._relational_expression();return this._match([He.tokens.equal_equal,He.tokens.not_equal])?this._updateNode(new Ie(this._previous().toString(),e,this._relational_expression())):e}_relational_expression(){let e=this._shift_expression();for(;this._match([He.tokens.less_than,He.tokens.greater_than,He.tokens.less_than_equal,He.tokens.greater_than_equal]);)e=this._updateNode(new Ie(this._previous().toString(),e,this._shift_expression()));return e}_shift_expression(){let e=this._additive_expression();for(;this._match([He.tokens.shift_left,He.tokens.shift_right]);)e=this._updateNode(new Ie(this._previous().toString(),e,this._additive_expression()));return e}_additive_expression(){let e=this._multiplicative_expression();for(;this._match([He.tokens.plus,He.tokens.minus]);)e=this._updateNode(new Ie(this._previous().toString(),e,this._multiplicative_expression()));return e}_multiplicative_expression(){let e=this._unary_expression();for(;this._match([He.tokens.star,He.tokens.forward_slash,He.tokens.modulo]);)e=this._updateNode(new Ie(this._previous().toString(),e,this._unary_expression()));return e}_unary_expression(){return this._match([He.tokens.minus,He.tokens.bang,He.tokens.tilde,He.tokens.star,He.tokens.and])?this._updateNode(new ke(this._previous().toString(),this._unary_expression())):this._singular_expression()}_singular_expression(){const e=this._primary_expression(),t=this._postfix_expression();return t&&(e.postfix=t),e}_postfix_expression(){if(this._match(He.tokens.bracket_left)){const e=this._short_circuit_or_expression();this._consume(He.tokens.bracket_right,'Expected \']\'.');const t=this._updateNode(new ve(e)),n=this._postfix_expression();return n&&(t.postfix=n),t}if(this._match(He.tokens.period)){const e=this._consume(He.tokens.name,'Expected member name.'),t=this._postfix_expression(),n=this._updateNode(new pe(e.lexeme));return t&&(n.postfix=t),n}return null}_getStruct(e){if(this._context.aliases.has(e)){return this._context.aliases.get(e).type}if(this._context.structs.has(e)){return this._context.structs.get(e)}return null}_getType(e){const t=this._getStruct(e);if(null!==t)return t;switch(e){case 'void':return ae.void;case 'bool':return ae.bool;case 'i32':return ae.i32;case 'u32':return ae.u32;case 'f32':return ae.f32;case 'f16':return ae.f16;case 'vec2f':return ce.vec2f;case 'vec3f':return ce.vec3f;case 'vec4f':return ce.vec4f;case 'vec2i':return ce.vec2i;case 'vec3i':return ce.vec3i;case 'vec4i':return ce.vec4i;case 'vec2u':return ce.vec2u;case 'vec3u':return ce.vec3u;case 'vec4u':return ce.vec4u;case 'vec2h':return ce.vec2h;case 'vec3h':return ce.vec3h;case 'vec4h':return ce.vec4h;case 'mat2x2f':return ce.mat2x2f;case 'mat2x3f':return ce.mat2x3f;case 'mat2x4f':return ce.mat2x4f;case 'mat3x2f':return ce.mat3x2f;case 'mat3x3f':return ce.mat3x3f;case 'mat3x4f':return ce.mat3x4f;case 'mat4x2f':return ce.mat4x2f;case 'mat4x3f':return ce.mat4x3f;case 'mat4x4f':return ce.mat4x4f;case 'mat2x2h':return ce.mat2x2h;case 'mat2x3h':return ce.mat2x3h;case 'mat2x4h':return ce.mat2x4h;case 'mat3x2h':return ce.mat3x2h;case 'mat3x3h':return ce.mat3x3h;case 'mat3x4h':return ce.mat3x4h;case 'mat4x2h':return ce.mat4x2h;case 'mat4x3h':return ce.mat4x3h;case 'mat4x4h':return ce.mat4x4h;case 'mat2x2i':return ce.mat2x2i;case 'mat2x3i':return ce.mat2x3i;case 'mat2x4i':return ce.mat2x4i;case 'mat3x2i':return ce.mat3x2i;case 'mat3x3i':return ce.mat3x3i;case 'mat3x4i':return ce.mat3x4i;case 'mat4x2i':return ce.mat4x2i;case 'mat4x3i':return ce.mat4x3i;case 'mat4x4i':return ce.mat4x4i;case 'mat2x2u':return ce.mat2x2u;case 'mat2x3u':return ce.mat2x3u;case 'mat2x4u':return ce.mat2x4u;case 'mat3x2u':return ce.mat3x2u;case 'mat3x3u':return ce.mat3x3u;case 'mat3x4u':return ce.mat3x4u;case 'mat4x2u':return ce.mat4x2u;case 'mat4x3u':return ce.mat4x3u;case 'mat4x4u':return ce.mat4x4u}return null}_validateTypeRange(e,t){if('i32'===t.name){if(e<-2147483648||e>2147483647)throw this._error(this._previous(),`Value out of range for i32: ${e}. Line: ${this._currentLine}.`)}else if('u32'===t.name&&(e<0||e>4294967295))throw this._error(this._previous(),`Value out of range for u32: ${e}. Line: ${this._currentLine}.`)}_primary_expression(){if(this._match(He.tokens.ident)){const e=this._previous().toString();if(this._check(He.tokens.paren_left)){const t=this._argument_expression_list(),n=this._getType(e);return null!==n?this._updateNode(new de(n,t)):this._updateNode(new me(e,t))}if(this._context.constants.has(e)){const t=this._context.constants.get(e);return this._updateNode(new _e(e,t.value))}return this._updateNode(new ge(e))}if(this._match(He.tokens.int_literal)){const e=this._previous().toString();let t=e.endsWith('i')||e.endsWith('i')?ae.i32:e.endsWith('u')||e.endsWith('U')?ae.u32:ae.x32;const n=parseInt(e);return this._validateTypeRange(n,t),this._updateNode(new xe(new Be(n,this._exec.getTypeInfo(t)),t))}if(this._match(He.tokens.uint_literal)){const e=parseInt(this._previous().toString());return this._validateTypeRange(e,ae.u32),this._updateNode(new xe(new Be(e,this._exec.getTypeInfo(ae.u32)),ae.u32))}if(this._match([He.tokens.decimal_float_literal,He.tokens.hex_float_literal])){let e=this._previous().toString(),t=e.endsWith('h');t&&(e=e.substring(0,e.length-1));const n=parseFloat(e);this._validateTypeRange(n,t?ae.f16:ae.f32);const s=t?ae.f16:ae.f32;return this._updateNode(new xe(new Be(n,this._exec.getTypeInfo(s)),s))}if(this._match([He.keywords.true,He.keywords.false])){let e=this._previous().toString()===He.keywords.true.rule;return this._updateNode(new xe(new Be(e?1:0,this._exec.getTypeInfo(ae.bool)),ae.bool))}if(this._check(He.tokens.paren_left))return this._paren_expression();if(this._match(He.keywords.bitcast)){this._consume(He.tokens.less_than,'Expected \'<\'.');const e=this._type_decl();this._consume(He.tokens.greater_than,'Expected \'>\'.');const t=this._paren_expression();return this._updateNode(new ye(e,t))}const e=this._type_decl(),t=this._argument_expression_list();return this._updateNode(new de(e,t))}_argument_expression_list(){if(!this._match(He.tokens.paren_left))return null;const e=[];do{if(this._check(He.tokens.paren_right))break;const t=this._short_circuit_or_expression();e.push(t);}while(this._match(He.tokens.comma));return this._consume(He.tokens.paren_right,'Expected \')\' for agument list'),e}_optional_paren_expression(){this._match(He.tokens.paren_left);const e=this._short_circuit_or_expression();return this._match(He.tokens.paren_right),e}_paren_expression(){this._consume(He.tokens.paren_left,'Expected \'(\'.');const e=this._short_circuit_or_expression();return this._consume(He.tokens.paren_right,'Expected \')\'.'),e}_struct_decl(){if(!this._match(He.keywords.struct))return null;const e=this._currentLine,t=this._consume(He.tokens.ident,'Expected name for struct.').toString();this._consume(He.tokens.brace_left,'Expected \'{\' for struct body.');const n=[];for(;!this._check(He.tokens.brace_right);){const e=this._attribute(),t=this._consume(He.tokens.name,'Expected variable name.').toString();this._consume(He.tokens.colon,'Expected \':\' for struct member type.');const s=this._attribute(),r=this._type_decl();null!=r&&(r.attributes=s),this._check(He.tokens.brace_right)?this._match(He.tokens.comma):this._consume(He.tokens.comma,'Expected \',\' for struct member.'),n.push(this._updateNode(new Ce(t,r,e)));}this._consume(He.tokens.brace_right,'Expected \'}\' after struct body.');const s=this._currentLine,r=this._updateNode(new oe(t,n,e,s),e);return this._context.structs.set(t,r),r}_global_variable_decl(){const e=this._variable_decl();if(!e)return null;if(this._match(He.tokens.equal)){const t=this._const_expression();e.value=t;}if(null!==e.type&&e.value instanceof xe){if('x32'!==e.value.type.name){if(e.type.getTypeName()!==e.value.type.getTypeName())throw this._error(this._peek(),`Invalid cast from ${e.value.type.name} to ${e.type.name}. Line:${this._currentLine}`)}e.value.isScalar&&this._validateTypeRange(e.value.scalarValue,e.type),e.value.type=e.type;}else null===e.type&&e.value instanceof xe&&(e.type='x32'===e.value.type.name?ae.i32:e.value.type,e.value.isScalar&&this._validateTypeRange(e.value.scalarValue,e.type));return e}_override_variable_decl(){const e=this._override_decl();return e&&this._match(He.tokens.equal)&&(e.value=this._const_expression()),e}_global_const_decl(){var e;if(!this._match(He.keywords.const))return null;const t=this._consume(He.tokens.name,'Expected variable name'),n=this._currentLine;let s=null;if(this._match(He.tokens.colon)){const e=this._attribute();s=this._type_decl(),null!=s&&(s.attributes=e);}let r=null;this._consume(He.tokens.equal,'const declarations require an assignment');const i=this._short_circuit_or_expression();try{let e=[ae.f32],n=i.constEvaluate(this._exec,e);n instanceof Be&&this._validateTypeRange(n.value,e[0]),e[0]instanceof ce&&null===e[0].format&&n.typeInfo instanceof a&&null!==n.typeInfo.format&&('f16'===n.typeInfo.format.name?e[0].format=ae.f16:'f32'===n.typeInfo.format.name?e[0].format=ae.f32:'i32'===n.typeInfo.format.name?e[0].format=ae.i32:'u32'===n.typeInfo.format.name?e[0].format=ae.u32:'bool'===n.typeInfo.format.name?e[0].format=ae.bool:console.error(`TODO: impelement template format type ${n.typeInfo.format.name}`)),r=this._updateNode(new xe(n,e[0])),this._exec.context.setVariable(t.toString(),n);}catch(e){r=i;}if(null!==s&&r instanceof xe){if('x32'!==r.type.name){if(s.getTypeName()!==r.type.getTypeName())throw this._error(this._peek(),`Invalid cast from ${r.type.name} to ${s.name}. Line:${this._currentLine}`)}r.type=s,r.isScalar&&this._validateTypeRange(r.scalarValue,r.type);}else null===s&&r instanceof xe&&(s=null!==(e=null==r?void 0:r.type)&&void 0!==e?e:ae.f32,s===ae.x32&&(s=ae.i32));const o=this._updateNode(new P(t.toString(),s,'','',r),n);return this._context.constants.set(o.name,o),o}_global_let_decl(){if(!this._match(He.keywords.let))return null;const e=this._currentLine,t=this._consume(He.tokens.name,'Expected variable name');let n=null;if(this._match(He.tokens.colon)){const e=this._attribute();n=this._type_decl(),null!=n&&(n.attributes=e);}let s=null;if(this._match(He.tokens.equal)&&(s=this._const_expression()),null!==n&&s instanceof xe){if('x32'!==s.type.name){if(n.getTypeName()!==s.type.getTypeName())throw this._error(this._peek(),`Invalid cast from ${s.type.name} to ${n.name}. Line:${this._currentLine}`)}s.type=n;}else null===n&&s instanceof xe&&(n='x32'===s.type.name?ae.i32:s.type);return s instanceof xe&&s.isScalar&&this._validateTypeRange(s.scalarValue,n),this._updateNode(new U(t.toString(),n,'','',s),e)}_const_expression(){return this._short_circuit_or_expression()}_variable_decl(){if(!this._match(He.keywords.var))return null;const e=this._currentLine;let t='',n='';this._match(He.tokens.less_than)&&(t=this._consume(He.storage_class,'Expected storage_class.').toString(),this._match(He.tokens.comma)&&(n=this._consume(He.access_mode,'Expected access_mode.').toString()),this._consume(He.tokens.greater_than,'Expected \'>\'.'));const s=this._consume(He.tokens.name,'Expected variable name');let r=null;if(this._match(He.tokens.colon)){const e=this._attribute();r=this._type_decl(),null!=r&&(r.attributes=e);}return this._updateNode(new F(s.toString(),r,t,n,null),e)}_override_decl(){if(!this._match(He.keywords.override))return null;const e=this._consume(He.tokens.name,'Expected variable name');let t=null;if(this._match(He.tokens.colon)){const e=this._attribute();t=this._type_decl(),null!=t&&(t.attributes=e);}return this._updateNode(new M(e.toString(),t,null))}_diagnostic(){this._consume(He.tokens.paren_left,'Expected \'(\'');const e=this._consume(He.tokens.ident,'Expected severity control name.');this._consume(He.tokens.comma,'Expected \',\'');let t=this._consume(He.tokens.ident,'Expected diagnostic rule name.').toString();if(this._match(He.tokens.period)){t+=`.${this._consume(He.tokens.ident,'Expected diagnostic message.').toString()}`;}return this._consume(He.tokens.paren_right,'Expected \')\''),this._updateNode(new ee(e.toString(),t))}_enable_directive(){const e=this._consume(He.tokens.ident,'identity expected.');return this._updateNode(new K(e.toString()))}_requires_directive(){const e=[this._consume(He.tokens.ident,'identity expected.').toString()];for(;this._match(He.tokens.comma);){const t=this._consume(He.tokens.ident,'identity expected.');e.push(t.toString());}return this._updateNode(new J(e))}_type_alias(){const e=this._consume(He.tokens.ident,'identity expected.');this._consume(He.tokens.equal,'Expected \'=\' for type alias.');let t=this._type_decl();if(null===t)throw this._error(this._peek(),'Expected Type for Alias.');this._context.aliases.has(t.name)&&(t=this._context.aliases.get(t.name).type);const n=this._updateNode(new te(e.toString(),t));return this._context.aliases.set(n.name,n),n}_type_decl(){if(this._check([He.tokens.ident,...He.texel_format,He.keywords.bool,He.keywords.f32,He.keywords.i32,He.keywords.u32])){const e=this._advance().toString();if(this._context.structs.has(e))return this._context.structs.get(e);if(this._context.aliases.has(e))return this._context.aliases.get(e).type;if(!this._getType(e)){const t=this._updateNode(new ie(e));return this._forwardTypeCount++,t}return this._updateNode(new ae(e))}let e=this._texture_sampler_types();if(e)return e;if(this._check(He.template_types)){let e=this._advance().toString(),t=null,n=null;this._match(He.tokens.less_than)&&(t=this._type_decl(),n=null,this._match(He.tokens.comma)&&(n=this._consume(He.access_mode,'Expected access_mode for pointer').toString()),this._consume(He.tokens.greater_than,'Expected \'>\' for type.'));return this._updateNode(new ce(e,t,n))}if(this._match(He.keywords.ptr)){let e=this._previous().toString();this._consume(He.tokens.less_than,'Expected \'<\' for pointer.');const t=this._consume(He.storage_class,'Expected storage_class for pointer');this._consume(He.tokens.comma,'Expected \',\' for pointer.');const n=this._type_decl();let s=null;this._match(He.tokens.comma)&&(s=this._consume(He.access_mode,'Expected access_mode for pointer').toString()),this._consume(He.tokens.greater_than,'Expected \'>\' for pointer.');return this._updateNode(new le(e,t.toString(),n,s))}const t=this._attribute();if(this._match(He.keywords.array)){let e=null,n=-1;const s=this._previous();let r=null;if(this._match(He.tokens.less_than)){e=this._type_decl(),this._context.aliases.has(e.name)&&(e=this._context.aliases.get(e.name).type);let t='';if(this._match(He.tokens.comma)){r=this._shift_expression();try{t=r.constEvaluate(this._exec).toString(),r=null;}catch(e){t='1';}}this._consume(He.tokens.greater_than,'Expected \'>\' for array.'),n=t?parseInt(t):0;}const a=this._updateNode(new ue(s.toString(),t,e,n));return r&&this._deferArrayCountEval.push({arrayType:a,countNode:r}),a}return null}_texture_sampler_types(){if(this._match(He.sampler_type))return this._updateNode(new he(this._previous().toString(),null,null));if(this._match(He.depth_texture_type))return this._updateNode(new he(this._previous().toString(),null,null));if(this._match(He.sampled_texture_type)||this._match(He.multisampled_texture_type)){const e=this._previous();this._consume(He.tokens.less_than,'Expected \'<\' for sampler type.');const t=this._type_decl();return this._consume(He.tokens.greater_than,'Expected \'>\' for sampler type.'),this._updateNode(new he(e.toString(),t,null))}if(this._match(He.storage_texture_type)){const e=this._previous();this._consume(He.tokens.less_than,'Expected \'<\' for sampler type.');const t=this._consume(He.texel_format,'Invalid texel format.').toString();this._consume(He.tokens.comma,'Expected \',\' after texel format.');const n=this._consume(He.access_mode,'Expected access mode for storage texture type.').toString();return this._consume(He.tokens.greater_than,'Expected \'>\' for sampler type.'),this._updateNode(new he(e.toString(),t,n))}return null}_attribute(){let e=[];for(;this._match(He.tokens.attr);){const t=this._consume(He.attribute_name,'Expected attribute name'),n=this._updateNode(new De(t.toString(),null));if(this._match(He.tokens.paren_left)){if(n.value=this._consume(He.literal_or_ident,'Expected attribute value').toString(),this._check(He.tokens.comma)){this._advance();do{const e=this._consume(He.literal_or_ident,'Expected attribute value').toString();n.value instanceof Array||(n.value=[n.value]),n.value.push(e);}while(this._match(He.tokens.comma))}this._consume(He.tokens.paren_right,'Expected \')\'');}e.push(n);}return 0==e.length?null:e}}class _t extends at{constructor(e){super(),e&&this.update(e);}update(e){const t=(new gt).parse(e);this.updateAST(t);}}

    function parseTypeName(type) {
        return type.name + (type.format ? `<${parseTypeName(type.format)}${type.count ? "," + type.count : ""}>` : "");
    }
    function parseAttr(attrs) {
        // todo: match just one attribute
        return attrs ? Array.from(new Set(attrs.map(a => a.name + (a.value ? `(${a.value})` : "")))).join(" ") : "";
    }
    function getFnInputAndOutput(reflect, fn, expectInput, expectOutput) {
        let input = new Set();
        let output = {
            "return": "_ouput_of_" + fn.node.name
        };
        let call = `
                let _ouput_of_${fn.node.name} = ${fn.node.name}(${fn.node.args.map(a => getInput(a)).join(", ")});
                `;
        getOutput(fn.node.returnType, "_ouput_of_" + fn.node.name);
        return { input, call, output: output };
        function getInput(arg) {
            let attr = parseAttr(arg.attributes ? arg.attributes.concat(arg.type.attributes ?? []) : arg.type.attributes);
            let varName = expectInput[attr];
            if (varName) {
                input.add(attr);
                return varName;
            }
            else {
                let struct = reflect.structs.filter(s => s.name === arg.type.name)[0];
                if (!struct) {
                    console.error("invalid entry point function args");
                }
                let str = arg.type.name + "(";
                for (let m of struct.members) {
                    str += getInput(m) + ",";
                }
                str += ")";
                return str;
            }
        }
        function getOutput(type, prefix) {
            let varName = parseAttr(type.attributes);
            if (expectOutput.includes(varName)) {
                output[varName] = {
                    expr: prefix,
                    type: parseTypeName(type)
                };
                return;
            }
            else {
                let struct = reflect.structs.filter(s => s.name === type.name)[0];
                if (!struct) {
                    return;
                }
                for (let m of struct.members) {
                    if (m.attributes) {
                        m.type.attributes = m.type.attributes ? m.type.attributes : m.attributes;
                    }
                    getOutput(m.type, prefix + "." + m.name);
                }
            }
        }
    }

    const tetraSliceBindGroup0declareIndex = 3;
    const refacingMatsCode = `
const tsx_refacingMats = array<mat4x4f,6>(
// +z
mat4x4f(
1,0,0,0,
0,1,0,0,
0,0,1,0,
0,0,0,1,
),
// -z
mat4x4f(
1,0,0,0,
0,1,0,0,
0,0,-1,0,
0,0,0,1,
),
// +y
mat4x4f(
1,0,0,0,
0,0,1,0,
0,1,0,0,
0,0,0,1,
),
// -y
mat4x4f(
1,0,0,0,
0,0,-1,0,
0,-1,0,0,
0,0,0,1,
),
// +x
mat4x4f(
0,0,1,0,
0,1,0,0,
1,0,0,0,
0,0,0,1,
),
// -x
mat4x4f(
0,0,-1,0,
0,1,0,0,
-1,0,0,0,
0,0,0,1,
),
);
const determinantRefacingMats = array<f32,6>(1,-1,-1,-1,-1,-1);
`;
    const StructDefSliceInfo = `
struct tsxSliceInfo{
    slicePos: f32, refacing: u32, flag: u32, viewport: u32,
}`;
    const StructDefUniformBuffer = `
struct tsxUniformBuffer{
    retinaMV: mat4x4f, retinaP: mat4x4f, camProj: vec4f,
    eyeCross: vec3<f32>, sliceOffset: u32, refacing: u32, screenAspect: f32, layerOpacity: f32,
}`;
    const expectTetraSlicePipelineInput = {
        "location(0)": "_attribute0[tetraIndex]",
        "location(1)": "_attribute1[tetraIndex]",
        "location(2)": "_attribute2[tetraIndex]",
        "location(3)": "_attribute3[tetraIndex]",
        "location(4)": "_attribute4[tetraIndex]",
        "location(5)": "_attribute5[tetraIndex]",
        "builtin(instance_index)": "instanceIndex",
        "builtin(tetra_index)": "tetraIndex",
    };
    const expectTetraSlicePipelineOutput = [
        "location(0)", "location(1)", "location(2)", "location(3)", "location(4)", "location(5)",
        "builtin(position)"
    ];
    class TetraSlicePipeline {
        computePipeline;
        computeBindGroup0;
        renderPipeline;
        outputVaryBuffer;
        vertexOutNum;
        reflect;
        gpu;
        device;
        crossComputeShaderModule;
        fragmentShaderModule;
        descriptor;
        getCompilationInfo() {
            return { tetra: this.crossComputeShaderModule?.getCompilationInfo(), fragment: this.fragmentShaderModule?.getCompilationInfo() };
        }
        async init(gpu, config, descriptor, tetrasliceBufferMgr) {
            this.gpu = gpu;
            this.device = gpu.device;
            this.descriptor = descriptor;
            let vertexState = descriptor.vertex;
            this.reflect = new _t(vertexState.code);
            let mainFn = this.reflect._functions.get(vertexState.entryPoint);
            if (!mainFn || mainFn.node.attributes?.[0].name !== "tetra")
                console.error("Tetra vertex shader entry Point function not found");
            let { input, output, call } = getFnInputAndOutput(this.reflect, mainFn, expectTetraSlicePipelineInput, expectTetraSlicePipelineOutput);
            let layout = this.getBindGroupLayout(output);
            // compute pipeline
            let computeGroup0Buffers = tetrasliceBufferMgr.buffers.slice(0);
            let bindGroup0declare = '';
            let varInterpolate = "";
            let emitOutput1 = "";
            let emitOutput2 = "";
            // render pipeline
            let vinputVert = '';
            let voutputVert = '';
            let vcallVert = "";
            let vertexBufferAttributes = [];
            this.vertexOutNum = 0;
            this.outputVaryBuffer = tetrasliceBufferMgr.prepareNewPipeline();
            for (let attr in output) {
                let id;
                if (attr === "return")
                    continue;
                let packedType = output[attr].type; // unpack matrix4x4
                let rawType = packedType.replace("mat4x4f", "vec4f");
                if (attr === "builtin(position)") {
                    id = 0;
                }
                else if (attr.startsWith("location(")) {
                    let i = attr.charAt(9);
                    id = Number(i) + 1;
                }
                if (id >= 0) {
                    this.vertexOutNum++;
                    bindGroup0declare += `@group(0) @binding(${tetraSliceBindGroup0declareIndex + id}) var<storage, read_write> _output${id} : array<${rawType}>;\n`;
                    varInterpolate += `var output${id}s : array<${rawType},4>;\n`;
                    emitOutput1 += `
            _output${id}[outOffset] =   output${id}s[0];
            _output${id}[outOffset+1] = output${id}s[1];
            _output${id}[outOffset+2] = output${id}s[2];`;
                    emitOutput2 += `
                _output${id}[outOffset+3] = output${id}s[2];
                _output${id}[outOffset+4] = output${id}s[1];
                _output${id}[outOffset+5] = output${id}s[3];`;
                    let jeg = rawType.match(/array<(.+),(.+)>/);
                    if (jeg) {
                        let typeArrLength = Number(jeg[2]);
                        let attributes = [];
                        for (let i = 0; i < typeArrLength; i++) {
                            attributes.push({
                                shaderLocation: id, // here we keep same id, we'll deal this later
                                format: 'float32x4',
                                offset: i << 4
                            });
                        }
                        vertexBufferAttributes.push({
                            arrayStride: typeArrLength << 4,
                            attributes
                        });
                        computeGroup0Buffers.push({ buffer: tetrasliceBufferMgr.requireOutputBuffer(id, typeArrLength, this.outputVaryBuffer) });
                    }
                    else {
                        computeGroup0Buffers.push({ buffer: tetrasliceBufferMgr.requireOutputBuffer(id, 1, this.outputVaryBuffer) });
                        vertexBufferAttributes.push({
                            arrayStride: 16,
                            attributes: [{
                                    shaderLocation: id,
                                    format: 'float32x4',
                                    offset: 0
                                }]
                        });
                    }
                }
            }
            let bindGroup1declare = '';
            for (let attr of input) {
                if (!attr.startsWith("location("))
                    continue;
                let i = attr.charAt(9);
                bindGroup1declare += `@group(1) @binding(${i}) var<storage, read> _attribute${i} : array<mat4x4f>;\n`;
            }
            let parsedCode = vertexState.code.replace(/@tetra/g, " ").replace(/@location\s*\(\s*[0-9]+\s*\)\s*/g, " ").replace(/@builtin\s*\(\s*[^\)\s]+\s*\)\s*/g, " ");
            function makeInterpolate(a, b) {
                let str = '';
                for (let attr in output) {
                    let result = output[attr].type?.match(/array<(.+),(.+)>/);
                    let name = attr.startsWith("location(") ? output[attr].expr : attr == "builtin(position)" ? "refPosMat" : "";
                    if (!name)
                        continue;
                    let i = attr.startsWith("location(") ? Number(attr.charAt(9)) + 1 : 0;
                    if (result) {
                        let typeArrLength = Number(result[2]);
                        for (let idx = 0; idx < typeArrLength; idx++)
                            str += `output${i}s[offset][${idx}] = mix(${name}[${idx}][${a}],${name}[${idx}][${b}],alpha);\n`;
                    }
                    else {
                        str += `output${i}s[offset] = mix(${name}[${a}],${name}[${b}],alpha);\n`;
                    }
                }
                return str;
            }
            let cullOperator = descriptor.cullMode == "back" ? "<" : ">";
            let commonCameraSliceCode = `
let sign = step(vec4f(0.0,0.0,0.0,0.0),scalar);
let vertnum = sign.x + sign.y + sign.z + sign.w;
if(!(vertnum == 0.0 || vertnum == 4.0)){ // if hit one slice
    if(sign.x + sign.y == 1.0){
        let alpha = scalar.x/(scalar.x - scalar.y);
        ${makeInterpolate(0, 1)}
        offset++;
    }
    if(sign.x + sign.z == 1.0){
        let alpha = scalar.x/(scalar.x - scalar.z);
        ${makeInterpolate(0, 2)}
        offset++;
    }
    if(sign.x + sign.w == 1.0){
        let alpha = scalar.x/(scalar.x - scalar.w);
        ${makeInterpolate(0, 3)}
        offset++;
    }
    if(sign.y + sign.z == 1.0){
        let alpha = scalar.y/(scalar.y - scalar.z);
        ${makeInterpolate(1, 2)}
        offset++;
    }
    if(sign.y + sign.w == 1.0){
        let alpha = scalar.y/(scalar.y - scalar.w);
        ${makeInterpolate(1, 3)}
        offset++;
    }
    if(sign.z + sign.w == 1.0){
        let alpha = scalar.z/(scalar.z - scalar.w);
        ${makeInterpolate(2, 3)}
        offset++;
    }

    // offset is total vertices number (3 or 4), delta is faces number (3 or 6)
    let delta:u32 = u32((offset - 2) * 3);
    // get output location thread-safely
    let outOffset : u32 = atomicAdd(&(_emitIndex_slice.emitIndex[i]), delta) + emitIndexOffset;
    // write 3 vertices of first triangular face
    ${emitOutput1}
    // write 3 vertices of second triangular face if one has
    if(offset == 4){
        ${emitOutput2}
    }
} // end one hit
`;
            let crossComputeCode = refacingMatsCode + StructDefSliceInfo + StructDefUniformBuffer + `
struct _EmitIndex_Slice{
    slice: array<tsxSliceInfo, ${config.maxSlicesNumber}>,
    emitIndex: array<atomic<u32>>,
}

@group(0) @binding(0) var<storage, read_write> _emitIndex_slice: _EmitIndex_Slice;
@group(0) @binding(1) var<uniform> tsx_uniforms : tsxUniformBuffer;
@group(0) @binding(2) var<uniform> thumbnailViewport : array<vec4f,16>;
${bindGroup0declare}
${bindGroup1declare}

// user defined functions and bind groups
${parsedCode}

const tsx_emitIndexStride : u32 = ${config.maxCrossSectionBufferSize >> (config.sliceGroupSizeBit + 4)};
@compute @workgroup_size(${vertexState.workgroupSize ?? config.defaultWorkGroupSize})
fn _mainCompute(@builtin(global_invocation_id) GlobalInvocationID : vec3<u32>){
    let tetraIndex = GlobalInvocationID.x;
    let instanceIndex = GlobalInvocationID.y;
    ${input.has("location(0)") ? `
    if(tetraIndex >= arrayLength(&_attribute0)){ // todo: check performance?
        return;
    }` : ``} 
    // calculate camera space coordinate : builtin(position) and other output need to be interpolated : location(x)
    // call user defined code 
    ${call}
    let cameraPosMat = ${output["builtin(position)"].expr};
    
    var instanceLength:u32 = ${config.sliceGroupSize};
    var refPosMat : mat4x4f;
    var refCamMat : mat4x4f;
    let sliceFlag = _emitIndex_slice.slice[tsx_uniforms.sliceOffset].flag;

    if(tsx_uniforms.camProj.x < 0){ // Orthographic
        let projBiais:mat4x4f = mat4x4f(
            0,0,tsx_uniforms.camProj.w,1,
            0,0,tsx_uniforms.camProj.w,1,
            0,0,tsx_uniforms.camProj.w,1,
            0,0,tsx_uniforms.camProj.w,1,
        );
        let projMat = mat4x4f(
            -tsx_uniforms.camProj.x,0,0,0,
            0,tsx_uniforms.camProj.y,0,0,
            0,0,0,0,
            0,0,tsx_uniforms.camProj.z,0,
        );

        ${(descriptor.cullMode == "back" || descriptor.cullMode == "front") ? `
        // cull face: if all slices in this group has no eye4D offset, cull here
        var cameraPosDetMat = transpose(cameraPosMat); 
        cameraPosDetMat[3] = vec4f(-1.0);
        if(determinant(cameraPosDetMat) ${cullOperator} 0){ return; }` : ""}

        // [uniform if] all slices are in retina, no eye4D
        if(sliceFlag == 0){
            // we get refacing mat from uniform for retina slices
            let retinaRefacingMat = tsx_refacingMats[tsx_uniforms.refacing & 7];
            // calculate standard device coordinate for retina: projection * refacing * view * model * pos
            refCamMat = retinaRefacingMat * cameraPosMat;
            refPosMat = projMat * refCamMat + projBiais;
        }else{
            instanceLength = _emitIndex_slice.slice[tsx_uniforms.sliceOffset].flag;
        }
        
        // prepare for interpolations
        var emitIndexOffset = 0u;
        for(var i:u32 = 0; i<instanceLength; i++){
            ${varInterpolate}
            let sliceInfo = _emitIndex_slice.slice[tsx_uniforms.sliceOffset + i];
            if(sliceInfo.slicePos > 1.0){
                emitIndexOffset += tsx_emitIndexStride;
                continue;
            }
            var offset = 0u;
            if(sliceFlag != 0){
                refCamMat = tsx_refacingMats[sliceInfo.refacing & 7] * cameraPosMat;
                refPosMat = projMat * refCamMat + projBiais;
                let vp = thumbnailViewport[tsx_uniforms.sliceOffset + i - (tsx_uniforms.refacing >> 5)];
                let aspect = vp.w / vp.z;
                refPosMat[0].x *= aspect;
                refPosMat[1].x *= aspect;
                refPosMat[2].x *= aspect;
                refPosMat[3].x *= aspect;
            }
            // calculate cross section pos * plane.normal
            let scalar = transpose(refCamMat)[2] + vec4f(sliceInfo.slicePos / tsx_uniforms.camProj.x); 
            ${commonCameraSliceCode}
            emitIndexOffset += tsx_emitIndexStride;
        } // end all hits
    }else{
        let preclipW = cameraPosMat[0].w >= 0 && cameraPosMat[1].w >= 0 && cameraPosMat[2].w >= 0  && cameraPosMat[3].w >= 0;
        if(preclipW){ return; }
        let projBiais:mat4x4f = mat4x4f(
            0,0,tsx_uniforms.camProj.w,0,
            0,0,tsx_uniforms.camProj.w,0,
            0,0,tsx_uniforms.camProj.w,0,
            0,0,tsx_uniforms.camProj.w,0
        );
        let projMat = mat4x4f(
            tsx_uniforms.camProj.x,0,0,0,
            0,tsx_uniforms.camProj.y,0,0,
            0,0,0,0,
            0,0,tsx_uniforms.camProj.z,-1,
        );
        let eyeMat = mat4x4f(
            tsx_uniforms.eyeCross.x,0,0,0,
            tsx_uniforms.eyeCross.x,0,0,0,
            tsx_uniforms.eyeCross.x,0,0,0,
            tsx_uniforms.eyeCross.x,0,0,0
        );
        // [uniform if] all slices are in retina, no eye4D
        if(sliceFlag == 0){
            ${(descriptor.cullMode == "back" || descriptor.cullMode == "front") ? `
            // cull face: if all slices in this group has no eye4D offset, cull here
            if(determinant(cameraPosMat) ${cullOperator} 0){ return; }` : ""}
            
            // we get refacing mat from uniform for retina slices
            let retinaRefacingMat = tsx_refacingMats[tsx_uniforms.refacing & 7];
            // calculate standard device coordinate for retina: projection * refacing * view * model * pos
            refCamMat = retinaRefacingMat * cameraPosMat;
            refPosMat = projMat * refCamMat + projBiais;
        }else{
            instanceLength = _emitIndex_slice.slice[tsx_uniforms.sliceOffset].flag;
        }
        
        // prepare for interpolations
        var emitIndexOffset = 0u;
        for(var i:u32 = 0; i<instanceLength; i++){
            ${varInterpolate}
            let sliceInfo = _emitIndex_slice.slice[tsx_uniforms.sliceOffset + i];
            if(sliceInfo.slicePos > 1.0){
                emitIndexOffset += tsx_emitIndexStride;
                continue;
            }
            var offset = 0u;
            if(sliceFlag != 0){
                refCamMat = tsx_refacingMats[sliceInfo.refacing & 7] * cameraPosMat + 
                    eyeMat * (f32(sliceInfo.refacing >> 3) - 1.0);
                    ${(descriptor.cullMode == "back" || descriptor.cullMode == "front") ? `
                if(determinant(refCamMat) * determinantRefacingMats[sliceInfo.refacing & 7] ${cullOperator} 0){
                    emitIndexOffset += tsx_emitIndexStride;
                    continue;
                }` : ""}
                refPosMat = projMat * refCamMat + projBiais;
                let vp = thumbnailViewport[tsx_uniforms.sliceOffset + i - (tsx_uniforms.refacing >> 5)];
                let aspect = vp.w / vp.z;
                refPosMat[0].x *= aspect;
                refPosMat[1].x *= aspect;
                refPosMat[2].x *= aspect;
                refPosMat[3].x *= aspect;
            }
            // calculate cross section pos * plane.normal
            let scalar = transpose(refCamMat) * vec4(0.0,0.0,1.0,sliceInfo.slicePos / tsx_uniforms.camProj.x); 
            ${commonCameraSliceCode}
            emitIndexOffset += tsx_emitIndexStride;
        } // end all hits
    } // end camera type
}
`;
            this.crossComputeShaderModule = this.gpu.device.createShaderModule({
                code: crossComputeCode
            });
            let computePipelinePromise = this.gpu.device.createComputePipelineAsync({
                layout: layout.computeLayout,
                compute: {
                    module: this.crossComputeShaderModule,
                    entryPoint: '_mainCompute'
                }
            });
            vertexBufferAttributes.sort((a, b) => (a.attributes[0].shaderLocation - b.attributes[0].shaderLocation));
            let shaderLocationCounter = 0;
            for (let vba of vertexBufferAttributes) {
                for (let attr of vba.attributes) {
                    attr.shaderLocation = shaderLocationCounter++;
                }
            }
            for (let i = 0; i < shaderLocationCounter; i++) {
                let attr = i ? `location(${i - 1})` : "builtin(position)";
                vinputVert += `@location(${i}) member${i}: vec4f,\n`;
                voutputVert += `@${attr} member${i}: vec4f,\n`;
                vcallVert += `data.member${i},`;
            }
            const vertexShaderModule = this.gpu.device.createShaderModule({
                code: `
struct tsxvInputType{
    ${vinputVert}
};
struct tsxvOutputType{
    ${voutputVert}
};
@vertex fn main(data : tsxvInputType)-> tsxvOutputType{
    return tsxvOutputType(${vcallVert});
}
`
            });
            this.fragmentShaderModule = this.gpu.device.createShaderModule({ code: descriptor.fragment.code });
            let renderPipelinePromise = this.gpu.device.createRenderPipelineAsync({
                layout: layout.renderLayout,
                vertex: {
                    module: vertexShaderModule,
                    entryPoint: 'main',
                    buffers: vertexBufferAttributes,
                },
                fragment: {
                    module: this.fragmentShaderModule,
                    entryPoint: descriptor.fragment.entryPoint,
                    targets: [{ format: this.gpu.preferredFormat }]
                },
                primitive: {
                    topology: 'triangle-list',
                },
                depthStencil: {
                    depthWriteEnabled: true,
                    depthCompare: 'less',
                    format: 'depth24plus',
                }
            });
            const [computePipeline, renderPipeline] = await Promise.all([computePipelinePromise, renderPipelinePromise]);
            this.computePipeline = computePipeline;
            this.renderPipeline = renderPipeline;
            this.computeBindGroup0 = this.gpu.createBindGroup(computePipeline, 0, computeGroup0Buffers, "TetraComputePipeline");
            return this;
        }
        getBindGroupLayout(output) {
            let computeBindGroupLayouts = [];
            let renderBindGroupLayouts = [];
            const layout = this.descriptor.layout;
            if (!layout || layout === 'auto')
                return {
                    computeLayout: 'auto',
                    renderLayout: 'auto'
                };
            let computeLayout = layout?.computeLayout;
            let renderLayout = layout?.renderLayout;
            if ((computeLayout !== 'auto' && computeLayout)?.length) {
                const bindGroupLayoutsDesc = computeLayout;
                let bindgroupLayouts = this.reflect.getBindGroups();
                for (let groupIdx = 0, l = bindgroupLayouts.length; groupIdx < l; groupIdx++) {
                    let groupLayoutDesc = [];
                    if (groupIdx === 0) {
                        // here Object.keys(output).length - 1 because it has "return" key
                        for (let i = 0, l = Object.keys(output).length - 1 + tetraSliceBindGroup0declareIndex; i < l; i++) {
                            const type = i && i < tetraSliceBindGroup0declareIndex ? 'uniform' : 'storage';
                            groupLayoutDesc.push({ binding: i, visibility: GPUShaderStage.COMPUTE, buffer: { type } });
                        }
                    }
                    else {
                        const bindings = bindgroupLayouts[groupIdx];
                        for (let i$1 = 0, l = bindings.length; i$1 < l; i$1++) {
                            const entry = bindGroupLayoutsDesc[groupIdx]?.entries?.filter(e => e.binding === i$1)[0];
                            const descriptor = bindings[i$1];
                            if (entry) {
                                groupLayoutDesc.push(entry);
                            }
                            else if (!descriptor) {
                                groupLayoutDesc.push({ binding: i$1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } });
                            }
                            else if (descriptor.resourceType === i.Storage) {
                                groupLayoutDesc.push({ binding: i$1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } });
                            }
                            else if (descriptor.resourceType === i.Uniform) {
                                groupLayoutDesc.push({ binding: i$1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } });
                            }
                        }
                    }
                    const bindGroupLayout = this.device.createBindGroupLayout({ entries: groupLayoutDesc });
                    computeBindGroupLayouts.push(bindGroupLayout);
                }
                computeLayout = this.device.createPipelineLayout({ bindGroupLayouts: computeBindGroupLayouts, label: "computeBindGroupLayoutDesc" });
            }
            if ((renderLayout !== 'auto' && renderLayout)?.length) {
                const bindGroupLayoutsDesc = renderLayout;
                const renderReflect = new _t(this.descriptor.fragment.code);
                let bindgroupLayouts = renderReflect.getBindGroups();
                for (let groupIdx = 0, l = bindgroupLayouts.length; groupIdx < l; groupIdx++) {
                    let groupLayoutDesc = [];
                    const bindings = bindgroupLayouts[groupIdx];
                    for (let i$1 = 0, l = bindings.length; i$1 < l; i$1++) {
                        const entry = bindGroupLayoutsDesc[groupIdx]?.entries?.filter(e => e.binding === i$1)[0];
                        if (entry) {
                            groupLayoutDesc.push(entry);
                        }
                        else if (!bindings[i$1] || bindings[i$1].resourceType === i.Storage) {
                            groupLayoutDesc.push({ binding: i$1, visibility: GPUShaderStage.FRAGMENT, buffer: {} });
                        }
                        else if (bindings[i$1].resourceType === i.Storage) {
                            groupLayoutDesc.push({ binding: i$1, visibility: GPUShaderStage.FRAGMENT, buffer: {} });
                        }
                        else if (bindings[i$1].resourceType === i.Sampler) {
                            groupLayoutDesc.push({ binding: i$1, visibility: GPUShaderStage.FRAGMENT, sampler: {} });
                        }
                        else if (bindings[i$1].resourceType === i.Texture) {
                            groupLayoutDesc.push({ binding: i$1, visibility: GPUShaderStage.FRAGMENT, texture: {} });
                        }
                    }
                    const bindGroupLayout = this.device.createBindGroupLayout({ entries: groupLayoutDesc });
                    renderBindGroupLayouts.push(bindGroupLayout);
                }
                renderLayout = this.device.createPipelineLayout({ bindGroupLayouts: renderBindGroupLayouts, label: "renderBindGroupLayoutDesc" });
            }
            return {
                computeLayout, renderLayout
            };
        }
    }
    class RaytracingPipeline {
        pipeline;
        bindGroup0;
        shaderModule;
        getCompilationInfo() {
            return this.shaderModule?.getCompilationInfo();
        }
        async init(gpu, config, descriptor, sliceBuffers) {
            let code = descriptor.code.replace(/@ray(\s)/g, "@vertex$1");
            const reflect = new _t(code);
            let mainRayFn = reflect._functions.get(descriptor.rayEntryPoint);
            if (!mainRayFn)
                console.error("Raytracing pipeline: Entry point does not exist.");
            // let mainFragFn = reflect.functions.filter(
            //     e => e.attributes && e.attributes.some(a => a.name === "fragment") && e.name == descriptor.fragment.entryPoint
            // )[0];
            let { input, output, call } = getFnInputAndOutput(reflect, mainRayFn, {
                "builtin(ray_origin)": "camRayOri",
                "builtin(ray_direction)": "camRayDir",
                "builtin(voxel_coord)": "voxelCoord",
                "builtin(aspect_matrix)": "refacingMat3 * mat3x3<f32>(aspect,0.0,0.0, 0.0,1.0,0.0, 0.0,0.0,1.0) * refacingMat3",
            }, ["location(0)", "location(1)", "location(2)", "location(3)", "location(4)", "location(5)"]);
            let dealRefacingCall = "";
            if (input.has("builtin(aspect_matrix)")) {
                dealRefacingCall = "let refacingMat3 = mat3x3<f32>(refacingMat[0].xyz,refacingMat[1].xyz,refacingMat[2].xyz);";
            }
            let retunTypeMembers;
            let outputMembers;
            if (mainRayFn.node.returnType.attributes) {
                outputMembers = output["return"].expr;
                retunTypeMembers = `@${parseAttr(mainRayFn.node.returnType.attributes)} ${parseTypeName(mainRayFn.node.returnType)}`;
            }
            else {
                let st = reflect.structs.filter(s => s.name === mainRayFn.node.returnType.name)[0];
                if (!st)
                    console.error("No attribute found");
                outputMembers = st.members.map(m => output[parseAttr(m.attributes)].expr).join(",\n");
                retunTypeMembers = st.members.map(m => `@${parseAttr(m.attributes)} ${m.name}: ${parseTypeName(m.type)}`).join(",\n");
            }
            // ${wgslreflect.parseAttr(mainRayFn.return.attributes)} userRayOut: ${wgslreflect.parseTypeName(mainRayFn.return)}
            let shaderCode = refacingMatsCode + StructDefSliceInfo + StructDefUniformBuffer + `
struct tsxvOut{
    @builtin(position) pos: vec4f,
    ${retunTypeMembers}
}
struct tsxAffineMat{
    matrix: mat4x4f,
    vector: vec4f,
}
@group(0) @binding(0) var<storage, read> tsx_slice: array<tsxSliceInfo, ${config.maxSlicesNumber}>;

@group(0) @binding(1) var<uniform> tsx_uniforms : tsxUniformBuffer;
@group(0) @binding(2) var<uniform> thumbnailViewport : array<vec4f,16>;
fn apply(afmat: tsxAffineMat, points: mat4x4f) -> mat4x4f{
    let biais = mat4x4f(afmat.vector, afmat.vector, afmat.vector, afmat.vector);
    return afmat.matrix * points + biais;
}
fn applyinv(afmat: tsxAffineMat, points: mat4x4f) -> mat4x4f{
    let biais = mat4x4f(afmat.vector, afmat.vector, afmat.vector, afmat.vector);
    return transpose(afmat.matrix) * (points - biais);
}
${code.replace(/@vertex/g, " ").replace(/@builtin\s*\(\s*(ray_origin|ray_direction|voxel_coord|aspect_matrix)\s*\)\s*/g, " ")}
@vertex fn mainVertex(@builtin(vertex_index) vindex:u32, @builtin(instance_index) i_index:u32) -> tsxvOut{
    const pos = array<vec2<f32>, 4>(
        vec2<f32>(-1.0, -1.0),
        vec2<f32>(-1.0, 1.0),
        vec2<f32>( 1.0, -1.0),
        vec2<f32>( 1.0, 1.0),
    );
    let sliceInfo = tsx_slice[tsx_uniforms.sliceOffset + i_index];
    let sliceFlag = tsx_slice[tsx_uniforms.sliceOffset].flag;
    var refacingEnum : u32;

    let posidx = pos[vindex];
    let coord = vec2<f32>(posidx.x, posidx.y);
    var aspect = 1.0;
    var rayPos = vec4f(0.0);// no eye offset for retina
    var rayDir = vec4f(0.0,0.0,0.0,-1.0);// point forward for Orthographic camera
    if(tsx_uniforms.camProj.x < 0){
        rayPos = vec4f(coord.x/tsx_uniforms.camProj.x * aspect, coord.y/tsx_uniforms.camProj.y, sliceInfo.slicePos/tsx_uniforms.camProj.x, -tsx_uniforms.camProj.w/tsx_uniforms.camProj.z);
    }else{
        if(sliceFlag == 0){
            refacingEnum = tsx_uniforms.refacing;
        }else{
            refacingEnum = sliceInfo.refacing;
            let vp = thumbnailViewport[tsx_uniforms.sliceOffset + i_index - (tsx_uniforms.refacing >> 5)];
            aspect = vp.z / vp.w;
            rayPos = vec4f(-tsx_uniforms.eyeCross.x * (f32(sliceInfo.refacing >> 3) - 1.0), 0.0, 0.0, 0.0);
        }
        rayDir = vec4f(coord.x/tsx_uniforms.camProj.x * aspect, coord.y/tsx_uniforms.camProj.y, sliceInfo.slicePos/tsx_uniforms.camProj.x, -1.0);
    }
    let refacingMat = tsx_refacingMats[refacingEnum & 7];
    let camRayDir = refacingMat * rayDir;
    let camRayOri = refacingMat * rayPos;
    let voxelCoord = (refacingMat * vec4f(coord, sliceInfo.slicePos,0.0)).xyz;
    ${dealRefacingCall}
    ${call}
    let x = f32(((sliceInfo.viewport >> 24) & 0xFF) << ${config.viewportCompressShift}) * ${1 / config.sliceTextureWidth};
    let y = f32(((sliceInfo.viewport >> 16) & 0xFF) << ${config.viewportCompressShift}) * ${1 / config.sliceTextureHeight};
    let w = f32(((sliceInfo.viewport >> 8 ) & 0xFF) << ${config.viewportCompressShift}) * ${1 / config.sliceTextureWidth};
    let h = f32((sliceInfo.viewport & 0xFF) << ${config.viewportCompressShift}) * ${1 / config.sliceTextureHeight};
    let texelCoord = array<vec2<f32>, 4>(
        vec2<f32>(x, y+h),
        vec2<f32>(x, y),
        vec2<f32>(x+w, y+h),
        vec2<f32>(x+w, y),
    )[vindex] * 2.0 - vec2<f32>(1.0);
    
    if(sliceInfo.slicePos > 1.0){
        return tsxvOut(
            vec4f(0.0,0.0,0.0, -1.0),
            ${outputMembers}
        );
    }else{
        return tsxvOut(
            vec4f(texelCoord.x,-texelCoord.y, 0.999999, 1.0),
            ${outputMembers}
        );
    }
}
fn calDepth(distance: f32)->f32{
    return -tsx_uniforms.camProj.z + tsx_uniforms.camProj.w / distance;
}
`;
            let module = gpu.device.createShaderModule({ code: shaderCode });
            this.shaderModule = module;
            this.pipeline = await gpu.device.createRenderPipelineAsync({
                layout: 'auto',
                vertex: {
                    module,
                    entryPoint: 'mainVertex',
                },
                fragment: {
                    module,
                    entryPoint: descriptor.fragmentEntryPoint,
                    targets: [{ format: gpu.preferredFormat }]
                },
                primitive: {
                    topology: 'triangle-strip',
                },
                depthStencil: {
                    depthWriteEnabled: true,
                    depthCompare: 'less',
                    format: 'depth24plus',
                }
            });
            let buffers = [
                { buffer: sliceBuffers.emitIndexSliceBuffer },
                { buffer: sliceBuffers.uniformsBuffer },
                { buffer: sliceBuffers.thumbnailViewportBuffer },
            ];
            this.bindGroup0 = gpu.createBindGroup(this.pipeline, 0, buffers);
            return this;
        }
    }

    const DefaultWorkGroupSize = 256;
    const DefaultSliceGroupSize = 16;
    const DefaultMaxSlicesNumber = 256;
    const DefaultMaxCrossSectionBufferSize = 0x800000;
    const DefaultEnableFloat16Blend = true;
    const uniformsBufferLength = 64 + 64 + 16 + 4 + 4 + 4 + 4 + 12 + 4; // last 4 is padding
    const retinaMVBufferOffset = 0;
    const retinaProjectBufferOffset = 64;
    const camProjBufferOffset = retinaProjectBufferOffset + 64;
    const eyeCrossBufferOffset = camProjBufferOffset + 16;
    const sliceOffsetBufferOffset = eyeCrossBufferOffset + 12;
    const refacingBufferOffset = sliceOffsetBufferOffset + 4;
    const screenAspectBufferOffset = refacingBufferOffset + 4;
    const layerOpacityBufferOffset = screenAspectBufferOffset + 4;
    const power2arr = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512];
    let linearTextureSampler;
    class SliceRenderer {
        gpu;
        tetraBuffers;
        sliceBuffers;
        crossRenderPass;
        retinaRenderPass;
        screenRenderPass;
        rendererConfig;
        displayConfig;
        wireframeRenderPass;
        constructor(gpu, config) {
            if (!gpu.device)
                throw "GPU is not initialized yet.";
            config ??= {};
            config.maxSlicesNumber ??= DefaultMaxSlicesNumber;
            config.enableFloat16Blend ??= DefaultEnableFloat16Blend;
            config.maxCrossSectionBufferSize ??= DefaultMaxCrossSectionBufferSize;
            config.sliceGroupSize ??= DefaultSliceGroupSize;
            config.defaultWorkGroupSize ??= DefaultWorkGroupSize;
            this.rendererConfig = config;
            this.rendererConfig.sliceGroupSizeBit = power2arr.indexOf(config.sliceGroupSize);
            const maxTextureSize = gpu.device.limits.maxTextureDimension2D;
            this.rendererConfig.maxTextureSize = maxTextureSize;
            this.rendererConfig.sliceTextureWidth = maxTextureSize >> 1;
            this.rendererConfig.sliceTextureHeight = maxTextureSize;
            // viewport is compressed in gpu buffer by four u8s, therefore shift amount is maxSize >> 8
            this.rendererConfig.viewportCompressShift = power2arr.indexOf(this.rendererConfig.maxTextureSize >> 8);
            this.gpu = gpu;
            this.wireframeRenderPass = new WireFrameRenderPass(gpu, this.rendererConfig);
            this.sliceBuffers = new RetinaSliceBufferMgr(gpu, this.rendererConfig);
            this.tetraBuffers = new TetraSliceBufferMgr(gpu, this.rendererConfig, this.sliceBuffers);
            this.crossRenderPass = new CrossRenderPass(gpu);
            this.retinaRenderPass = new RetinaRenderPass(gpu, this.rendererConfig, this.sliceBuffers, this.crossRenderPass);
            this.screenRenderPass = new ScreenRenderPass(gpu, this.rendererConfig, this.sliceBuffers);
            linearTextureSampler = gpu.device.createSampler({
                magFilter: 'linear',
                minFilter: 'linear'
            });
            this.displayConfig = {
                sections: [], retinaResolution: 0, retinaLayers: 0,
                retinaStereoEyeOffset: 0, sectionStereoEyeOffset: 0, crosshair: 0,
                opacity: 1, paddedSliceNum: 0, sliceGroupNum: 0, totalGroupNum: 0, enableStereo: false
            };
            this.setDisplayConfig(DefaultDisplayConfig);
        }
        async init() {
            await Promise.all([this.crossRenderPass.init(), this.retinaRenderPass.init(), this.screenRenderPass.init(), this.wireframeRenderPass.init()]);
            return this;
        }
        createRetinaRenderPass(descriptor) {
            return new RetinaRenderPass(this.gpu, this.rendererConfig, this.sliceBuffers, this.crossRenderPass, descriptor);
        }
        setRetinaRenderPass(retinaRenderPass) {
            this.retinaRenderPass = retinaRenderPass;
        }
        getCurrentRetinaRenderPass() {
            return this.retinaRenderPass;
        }
        setDisplayConfig(config) {
            /// Small buffers settings
            if (config.canvasSize) {
                this.displayConfig.canvasSize = config.canvasSize;
                this.screenRenderPass.setSize(config.canvasSize);
            }
            if (config.screenBackgroundColor) {
                this.displayConfig.screenBackgroundColor = (config.screenBackgroundColor?.length === 3) ? [...config.screenBackgroundColor, 1] : config.screenBackgroundColor;
            }
            if (config.retinaClearColor) {
                this.displayConfig.retinaClearColor = config.retinaClearColor;
                this.crossRenderPass.descClear.colorAttachments[0].clearValue = config.retinaClearColor;
            }
            config.retinaLayers ??= this.displayConfig.retinaLayers ?? 0;
            config.opacity ??= this.displayConfig.opacity ?? 1;
            config.crosshair ??= this.displayConfig.crosshair ?? 0;
            config.retinaStereoEyeOffset ??= this.displayConfig.retinaStereoEyeOffset;
            config.sectionStereoEyeOffset ??= this.displayConfig.sectionStereoEyeOffset;
            if (config.opacity !== this.displayConfig.opacity || config.retinaLayers !== this.displayConfig.retinaLayers) {
                // When sliceNum == 0, opacity is 0 -> detect opacity to not render crosshair
                let value = config.retinaLayers ? config.opacity / config.retinaLayers : 0.0;
                this.gpu.device.queue.writeBuffer(this.sliceBuffers.uniformsBuffer, layerOpacityBufferOffset, new Float32Array([value]));
                this.displayConfig.opacity = config.opacity;
            }
            if (config.retinaStereoEyeOffset !== this.displayConfig.retinaStereoEyeOffset ||
                config.sectionStereoEyeOffset !== this.displayConfig.sectionStereoEyeOffset ||
                config.crosshair !== this.displayConfig.crosshair) {
                this.displayConfig.retinaStereoEyeOffset = config.retinaStereoEyeOffset;
                this.displayConfig.sectionStereoEyeOffset = config.sectionStereoEyeOffset;
                this.displayConfig.crosshair = config.crosshair;
                this.gpu.device.queue.writeBuffer(this.sliceBuffers.uniformsBuffer, eyeCrossBufferOffset, new Float32Array([
                    config.sectionStereoEyeOffset, config.retinaStereoEyeOffset, config.crosshair
                ]));
                this.displayConfig.enableStereo = this.displayConfig.sectionStereoEyeOffset !== 0 || this.displayConfig.retinaStereoEyeOffset !== 0;
            }
            if (config.camera4D)
                this.sliceBuffers.setCameraProjectMatrix(config.camera4D);
            if (config.camera3D)
                this.sliceBuffers.setRetinaProjectMatrix(config.camera3D);
            if (config.retinaViewMatrix)
                this.sliceBuffers.setRetinaViewMatrix(config.retinaViewMatrix);
            /// Small buffers settings end
            if ((!config.sections) && (this.displayConfig.retinaLayers == config.retinaLayers) && (!config.retinaResolution))
                return;
            /// Retina and section configurations
            this.sliceBuffers.setSlicesAndSections(this.displayConfig, config);
        }
        getSafeTetraNumInOnePass() {
            // maximum vertices per slice
            let maxVertices = this.rendererConfig.maxCrossSectionBufferSize >> (this.rendererConfig.sliceGroupSizeBit + 4);
            // one tetra generate at most 6 vertices
            return Math.floor(maxVertices / 6);
        }
        getStereoMode() { return this.getDisplayConfig('retinaStereoEyeOffset') !== 0 || this.getDisplayConfig('sectionStereoEyeOffset') !== 0; }
        getMinResolutionMultiple() { return 1 << this.rendererConfig.viewportCompressShift; }
        getDisplayConfig(...configNames) {
            const cfg = this.displayConfig;
            if (!configNames || !configNames.length) {
                return {
                    canvasSize: cfg.canvasSize,
                    sections: this.sliceBuffers.deepCopySectionConfigs(cfg.sections),
                    retinaLayers: cfg.retinaLayers,
                    retinaResolution: cfg.retinaResolution,
                    opacity: cfg.opacity,
                    retinaStereoEyeOffset: cfg.retinaStereoEyeOffset,
                    sectionStereoEyeOffset: cfg.sectionStereoEyeOffset,
                    crosshair: cfg.crosshair,
                    screenBackgroundColor: cfg.screenBackgroundColor,
                    retinaClearColor: cfg.retinaClearColor,
                    camera4D: cfg.camera4D,
                    camera3D: cfg.camera3D,
                    retinaViewMatrix: cfg.retinaViewMatrix,
                };
            }
            if (configNames.length === 1) {
                const name = configNames[0];
                switch (name) {
                    case 'sections': return this.sliceBuffers.deepCopySectionConfigs(cfg.sections);
                    default: return cfg[name];
                }
            }
            return configNames.map(name => name === 'sections' ? this.sliceBuffers.deepCopySectionConfigs(cfg.sections) : cfg[name]);
        }
        render(context, drawCall, wireFrameDrawCall) {
            this.sliceBuffers.updateBuffers(this.displayConfig.sliceGroupNum);
            const gpu = this.gpu;
            if (!this.crossRenderPass.clearRenderPipeline)
                throw "SliceRenderer is not initailzed, forget to call 'await SliceRenderer.init()' ?";
            if (!this.retinaRenderPass.pipeline)
                throw "SliceRenderer's current retinaRenderPass is not initailzed, forget to call 'await RetinaRenderPass.init()' ?";
            let canvasView = context.getCurrentTexture().createView();
            const renderState = new RenderState(this.gpu, this.rendererConfig, this.sliceBuffers, this.tetraBuffers, this.crossRenderPass);
            const commandEncoder = renderState.commandEncoder;
            // todo: disable depth first, then add it
            if (wireFrameDrawCall) {
                this.wireframeRenderPass.renderPassDesc = {
                    colorAttachments: [{
                            clearValue: this.displayConfig.screenBackgroundColor,
                            view: this.screenRenderPass.view,
                            loadOp: "clear",
                            storeOp: 'store'
                        }],
                    depthStencilAttachment: {
                        view: this.screenRenderPass.depthView,
                        depthClearValue: 1.0,
                        depthLoadOp: 'clear',
                        depthStoreOp: 'store',
                    }
                };
                this.wireframeRenderPass.renderState = renderState;
                wireFrameDrawCall(this.wireframeRenderPass);
                this.wireframeRenderPass.renderState = undefined;
            }
            for (let sliceIndex = 0; sliceIndex < this.displayConfig.totalGroupNum; sliceIndex++) {
                renderState.needClear = true;
                renderState.sliceIndex = sliceIndex;
                renderState.frustumRange = undefined;
                // set new slicegroup offset
                commandEncoder.copyBufferToBuffer(this.sliceBuffers.sliceGroupOffsetBuffer, sliceIndex << 2, this.sliceBuffers.uniformsBuffer, sliceOffsetBufferOffset, 4);
                drawCall(renderState);
                if (renderState.needClear) {
                    // if drawCall is empty, we also need to clear texture
                    let clearPassEncoder = commandEncoder.beginRenderPass(this.crossRenderPass.descClear);
                    clearPassEncoder.setPipeline(this.crossRenderPass.clearRenderPipeline);
                    clearPassEncoder.draw(0);
                    clearPassEncoder.end();
                }
                const loadOp = (!wireFrameDrawCall) && sliceIndex === 0 ? 'clear' : "load";
                let retinaPassEncoder = commandEncoder.beginRenderPass({
                    colorAttachments: [{
                            view: this.screenRenderPass.view,
                            clearValue: this.displayConfig.screenBackgroundColor,
                            loadOp,
                            storeOp: 'store'
                        }],
                    depthStencilAttachment: {
                        view: this.screenRenderPass.depthView,
                        depthClearValue: 1.0,
                        depthLoadOp: loadOp,
                        depthStoreOp: 'store',
                    }
                });
                retinaPassEncoder.setPipeline(this.retinaRenderPass.pipeline);
                retinaPassEncoder.setBindGroup(0, this.retinaRenderPass.bindgroup);
                if (this.retinaRenderPass.alphaBindgroup) {
                    retinaPassEncoder.setBindGroup(1, this.retinaRenderPass.alphaBindgroup);
                }
                let isSectionCount = this.displayConfig.sections.length && sliceIndex >= this.displayConfig.sliceGroupNum;
                let lastCount = isSectionCount ? this.displayConfig.sections.length % this.rendererConfig.sliceGroupSize : 0;
                let count = isSectionCount ? (
                // if is section group
                sliceIndex == this.displayConfig.totalGroupNum - 1 && lastCount ? lastCount : this.rendererConfig.sliceGroupSize) :
                    // if is not section group
                    this.displayConfig.enableStereo ? (this.rendererConfig.sliceGroupSize << 1) : this.rendererConfig.sliceGroupSize;
                retinaPassEncoder.draw(4, count, 0, 0);
                retinaPassEncoder.end();
            }
            let screenPassEncoder = commandEncoder.beginRenderPass({
                colorAttachments: [{
                        view: canvasView,
                        clearValue: this.displayConfig.screenBackgroundColor,
                        loadOp: 'clear',
                        storeOp: 'store'
                    }]
            });
            screenPassEncoder.setPipeline(this.screenRenderPass.pipeline);
            screenPassEncoder.setBindGroup(0, this.screenRenderPass.bindgroup);
            screenPassEncoder.draw(4);
            screenPassEncoder.end();
            gpu.device.queue.submit([commandEncoder.finish()]);
        }
        async createTetraSlicePipeline(descriptor) {
            // lazy init buffer here, optimization for only raytracing rendering
            if (!this.tetraBuffers.outputVaryBufferPool.length)
                this.tetraBuffers.init();
            return await new TetraSlicePipeline().init(this.gpu, this.rendererConfig, descriptor, this.tetraBuffers);
        }
        async createRaytracingPipeline(descriptor) {
            return await new RaytracingPipeline().init(this.gpu, this.rendererConfig, descriptor, this.sliceBuffers);
        }
        /** for TetraSlicePipeline, vertex shader is internally a compute shader, so it doesn't share bindgroups with fragment shader.
         *  for RaytracingPipeline, vertex shader and fragment shader are in one traditional render pipeline, they share bindgroups.
         */
        createVertexShaderBindGroup(pipeline, index, buffers, label) {
            if (index === 0)
                throw "Unable to create BindGroup 0, which is occupied by internal usages.";
            return this.gpu.createBindGroup((pipeline.computePipeline ?
                pipeline.computePipeline :
                pipeline.pipeline), index, buffers.map(e => ({ buffer: e })), "VertexShaderBindGroup<" + label + ">");
        }
        /** for TetraSlicePipeline, vertex shader is internally a compute shader, so it doesn't share bindgroups with fragment shader.
         *  for RaytracingPipeline, vertex shader and fragment shader are in one traditional render pipeline, they share bindgroups.
         */
        createFragmentShaderBindGroup(pipeline, index, buffers, label) {
            if (index === 0 && pipeline.pipeline)
                throw "Unable to create BindGroup 0, which is occupied by internal usages.";
            return this.gpu.createBindGroup((pipeline.computePipeline ?
                pipeline.renderPipeline :
                pipeline.pipeline), index, buffers.map(e => ({ buffer: e })), "FragmentShaderBindGroup<" + label + ">");
        }
    }
    class RetinaSliceBufferMgr {
        queue;
        rendererConfig;
        currentRetinaFacing;
        retinaMVMatChanged = true;
        retinaFacingOrSlicesChanged = true;
        uniformsBuffer;
        thumbnailViewportBuffer;
        retinaProjectJsBuffer = new Float32Array(16);
        retinaMVMatJsBuffer = new Float32Array(16);
        camProjJsBuffer = new Float32Array(4);
        slicesJsBuffer = new Float32Array(4);
        sliceGroupOffsetBuffer;
        emitIndexSliceBuffer;
        constructor(gpu, config) {
            this.emitIndexSliceBuffer = gpu.createBuffer(GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST, (4 << config.sliceGroupSizeBit) + (config.maxSlicesNumber << 4));
            this.uniformsBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, uniformsBufferLength);
            this.thumbnailViewportBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 1024);
            this.queue = gpu.device.queue;
            const maxSliceGroupNum = Math.ceil(config.maxSlicesNumber / config.sliceGroupSize);
            const sliceGroupOffsets = new Uint32Array(maxSliceGroupNum);
            for (let i = 0; i < maxSliceGroupNum; i++) {
                sliceGroupOffsets[i] = i * config.sliceGroupSize;
            }
            this.sliceGroupOffsetBuffer = gpu.createBuffer(GPUBufferUsage.COPY_SRC, sliceGroupOffsets);
            this.rendererConfig = config;
        }
        updateBuffers(sliceGroupNum) {
            if (this.retinaMVMatChanged) {
                this.queue.writeBuffer(this.uniformsBuffer, retinaMVBufferOffset, this.retinaMVMatJsBuffer);
                this.retinaMVMatChanged = false;
            }
            if (this.retinaFacingOrSlicesChanged) {
                // refacing buffer stores not only refacing but also retina slices
                this.queue.writeBuffer(this.uniformsBuffer, refacingBufferOffset, new Uint32Array([
                    this.currentRetinaFacing | ((sliceGroupNum) << (5 + this.rendererConfig.sliceGroupSizeBit))
                ]));
                this.retinaFacingOrSlicesChanged = false;
            }
        }
        deepCopySectionConfigs(sectionConfigs, defaultRetinaResolution) {
            return sectionConfigs.map(e => ({
                eyeStereo: e.eyeStereo ?? EyeStereo.None,
                facing: e.facing,
                slicePos: e.slicePos ?? 0,
                viewport: {
                    x: e.viewport.x,
                    y: e.viewport.y,
                    width: e.viewport.width,
                    height: e.viewport.height,
                },
                resolution: e.resolution ?? defaultRetinaResolution
            }));
        }
        setSlicesAndSections(internalDisplayConfig, displayConfig) {
            let vpShift = this.rendererConfig.viewportCompressShift;
            let prevRetinaResolution = internalDisplayConfig.retinaResolution;
            if (displayConfig.retinaResolution)
                internalDisplayConfig.retinaResolution = (displayConfig.retinaResolution >> vpShift) << vpShift;
            if (displayConfig.sections) {
                // deepcopy
                internalDisplayConfig.sections = this.deepCopySectionConfigs(displayConfig.sections, internalDisplayConfig.retinaResolution);
            }
            internalDisplayConfig.sections ??= [];
            internalDisplayConfig.retinaLayers = displayConfig.retinaLayers;
            let sections = internalDisplayConfig.sections;
            let sliceStep = 2 / displayConfig.retinaLayers; // slice from -1 to 1
            let sliceGroupNum = Math.ceil(displayConfig.retinaLayers / this.rendererConfig.sliceGroupSize);
            let paddedSliceNum = sliceGroupNum << this.rendererConfig.sliceGroupSizeBit;
            internalDisplayConfig.paddedSliceNum = paddedSliceNum;
            let sectionNum = sections.length ?? 0;
            let sectionGroupNum = Math.ceil(sectionNum / this.rendererConfig.sliceGroupSize);
            let totalNum = paddedSliceNum + (sectionGroupNum << this.rendererConfig.sliceGroupSizeBit);
            let slices = (this.slicesJsBuffer?.length === totalNum << 2) ? this.slicesJsBuffer : new Float32Array(totalNum << 2);
            this.slicesJsBuffer = slices;
            slices.fill(0); // todo : check neccesity?
            let retinaWidth = internalDisplayConfig.retinaResolution;
            let retinaX = 0, retinaY = 0;
            for (let slice = -1, i = 0, sliceGroupOffset = 0; i < paddedSliceNum; slice += sliceStep, i++, sliceGroupOffset++) {
                if (sliceGroupOffset === this.rendererConfig.sliceGroupSize) {
                    // start a new slice group
                    sliceGroupOffset = 0;
                    retinaX = 0;
                    retinaY = 0;
                }
                slices[(i << 2)] = slice; // slice pos. if slice > 1, discard in shader
                slices[(i << 2) + 1] = 0; // leave 0 for retina slice (used only in cross section)
                slices[(i << 2) + 2] = 0; // leave 0 for retina slice (used only in cross section)
                let wshift = retinaWidth >> vpShift;
                // a compressed viewport infomation
                slices[(i << 2) + 3] = u32_to_f32(((retinaX >> vpShift) << 24) + ((retinaY >> vpShift) << 16) + (wshift << 8) + wshift);
                if (retinaX + retinaWidth > this.rendererConfig.sliceTextureWidth ||
                    retinaY + retinaWidth > this.rendererConfig.sliceTextureHeight) {
                    this.setSlicesAndSections(internalDisplayConfig, { retinaResolution: prevRetinaResolution });
                    console.warn("Maximum retinaResolution reached");
                    return;
                }
                retinaY += retinaWidth;
                if (retinaY + retinaWidth > this.rendererConfig.sliceTextureHeight) {
                    retinaX += retinaWidth;
                    retinaY = 0;
                }
            }
            internalDisplayConfig.sliceGroupNum = sliceGroupNum;
            internalDisplayConfig.totalGroupNum = sliceGroupNum + sectionGroupNum;
            if (sectionNum) {
                let thumbnailViewportJsBuffer = new Float32Array(4 * 16);
                let lastGroupPosition = sectionGroupNum - 1 << this.rendererConfig.sliceGroupSizeBit;
                let lastGroupSlices = sections.length - lastGroupPosition;
                // get max resolution widths per slice group
                let deltaX = [];
                let maxDx = 0;
                for (let j = 0, sliceGroupOffset = 0, l = sections.length; j < l; j++, sliceGroupOffset++) {
                    let config = sections[j];
                    if (sliceGroupOffset === this.rendererConfig.sliceGroupSize) {
                        sliceGroupOffset = 0;
                        deltaX.push((maxDx >> vpShift) << vpShift);
                        maxDx = 0;
                    }
                    maxDx = Math.max(maxDx, Math.ceil(config.resolution / config.viewport.height * config.viewport.width));
                }
                deltaX.push((maxDx >> 4) << 4);
                retinaX = 0;
                retinaY = 0;
                let sliceGroup = 0;
                for (let i = paddedSliceNum, j = 0, sliceGroupOffset = 0; i < totalNum; i++, j++, sliceGroupOffset++) {
                    let config = sections[j];
                    slices[(i << 2)] = config?.slicePos ?? 0;
                    slices[(i << 2) + 1] = u32_to_f32(((config?.facing) ?? 0) | ((config?.eyeStereo ?? 1) << 3));
                    slices[(i << 2) + 2] = u32_to_f32(j < lastGroupPosition ? this.rendererConfig.sliceGroupSize : lastGroupSlices);
                    if (config) {
                        if (sliceGroupOffset === this.rendererConfig.sliceGroupSize) {
                            retinaX = 0;
                            retinaY = 0;
                            sliceGroupOffset = 0;
                            sliceGroup++;
                        }
                        else if (retinaY + config.resolution > this.rendererConfig.sliceTextureHeight) {
                            retinaX += deltaX[sliceGroup];
                            retinaY = 0;
                        }
                        let wshift = Math.ceil(config.resolution / config.viewport.height * config.viewport.width) >> vpShift;
                        let hshift = config.resolution >> vpShift;
                        slices[(i << 2) + 3] = u32_to_f32((((retinaX >> vpShift)) << 24) + ((retinaY >> vpShift) << 16) + (wshift << 8) + hshift);
                        thumbnailViewportJsBuffer[j << 2] = config.viewport.x;
                        thumbnailViewportJsBuffer[(j << 2) + 1] = config.viewport.y;
                        thumbnailViewportJsBuffer[(j << 2) + 2] = config.viewport.width;
                        thumbnailViewportJsBuffer[(j << 2) + 3] = config.viewport.height;
                        retinaY += (config.resolution >> vpShift) << vpShift;
                    }
                }
                this.queue.writeBuffer(this.thumbnailViewportBuffer, 0, thumbnailViewportJsBuffer);
            }
            this.queue.writeBuffer(this.emitIndexSliceBuffer, 0, slices);
            this.retinaFacingOrSlicesChanged = true;
        }
        setRetinaProjectMatrix(camera) {
            if (camera.fov) {
                getPerspectiveProjectionMatrix(camera).mat4.writeBuffer(this.retinaProjectJsBuffer);
            }
            else {
                getOrthographicProjectionMatrix(camera).mat4.writeBuffer(this.retinaProjectJsBuffer);
            }
            this.queue.writeBuffer(this.uniformsBuffer, retinaProjectBufferOffset, this.retinaProjectJsBuffer);
        }
        setRetinaViewMatrix(m) {
            let e = m.elem;
            let facing = this.getFacing(e[8], e[9], e[10]);
            if (facing !== this.currentRetinaFacing) {
                this.retinaFacingOrSlicesChanged = true;
                this.currentRetinaFacing = facing;
            }
            m.writeBuffer(this.retinaMVMatJsBuffer);
            this.retinaMVMatChanged = true;
        }
        getRetinaCamera() {
            let c = this.retinaProjectJsBuffer;
            let near = c[3] / c[2];
            if (c[0] > 0) {
                return {
                    fov: Math.atan(1 / c[1]) * _RAD2DEG * 2,
                    aspect: c[1] / c[0],
                    near,
                    far: c[2] * near / (1 + c[2])
                };
            }
            else {
                return {
                    size: 1 / c[1],
                    aspect: -c[1] / c[0],
                    near,
                    far: near - 1.0 / c[2]
                };
            }
        }
        setCameraProjectMatrix(camera) {
            if (camera.fov) {
                getPerspectiveProjectionMatrix(camera).vec4.writeBuffer(this.camProjJsBuffer);
            }
            else {
                getOrthographicProjectionMatrix(camera).vec4.writeBuffer(this.camProjJsBuffer);
                this.camProjJsBuffer[0] = -this.camProjJsBuffer[0]; // use negative to mark Orthographic in shader
            }
            this.queue.writeBuffer(this.uniformsBuffer, camProjBufferOffset, this.camProjJsBuffer);
        }
        getFacing(x, y, z) {
            let xa = Math.abs(x);
            let ya = Math.abs(y);
            let za = Math.abs(z);
            switch (za > ya ? za > xa ? 2 : 0 : ya > xa ? 1 : 0) {
                case 0:
                    return x > 0 ? RetinaSliceFacing.POSX : RetinaSliceFacing.NEGX;
                case 1:
                    return y > 0 ? RetinaSliceFacing.POSY : RetinaSliceFacing.NEGY;
                default:
                    return z > 0 ? RetinaSliceFacing.POSZ : RetinaSliceFacing.NEGZ;
            }
        }
    }
    class CrossRenderPass {
        descClear;
        descLoad;
        clearRenderPipelinePromise;
        clearRenderPipeline;
        sliceTextureSize;
        sliceView;
        constructor(gpu) {
            // sliceTexture covered by sliceGroupSize x 2 atlas of sliceResolution x sliceResolution
            let maxTextureSize = gpu.device.limits.maxTextureDimension2D;
            let sliceTextureSize = { width: maxTextureSize >> 1, height: maxTextureSize };
            this.sliceTextureSize = sliceTextureSize;
            let sliceTexture = gpu.device.createTexture({
                size: sliceTextureSize, format: gpu.preferredFormat,
                usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
            });
            this.sliceView = sliceTexture.createView();
            let depthTexture = gpu.device.createTexture({
                size: sliceTextureSize, format: 'depth24plus',
                usage: GPUTextureUsage.RENDER_ATTACHMENT,
            });
            let depthView = depthTexture.createView();
            this.descClear = {
                colorAttachments: [{
                        view: this.sliceView,
                        clearValue: { r: 0, g: 0, b: 0, a: 0.0 },
                        loadOp: 'clear',
                        storeOp: 'store'
                    }],
                depthStencilAttachment: {
                    view: depthView,
                    depthClearValue: 1.0,
                    depthLoadOp: 'clear',
                    depthStoreOp: 'store',
                }
            };
            this.descLoad = {
                colorAttachments: [{
                        view: this.sliceView,
                        loadOp: 'load',
                        storeOp: 'store'
                    }],
                depthStencilAttachment: {
                    view: depthView,
                    depthLoadOp: 'load',
                    depthStoreOp: 'store',
                }
            };
            let clearModule = gpu.device.createShaderModule({
                code: "@vertex fn v()->@builtin(position) vec4f{ return vec4f();} @fragment fn f()->@location(0) vec4f{ return vec4f();}"
            });
            this.clearRenderPipelinePromise = gpu.device.createRenderPipelineAsync({
                layout: 'auto',
                vertex: {
                    module: clearModule,
                    entryPoint: 'v',
                },
                fragment: {
                    module: clearModule,
                    entryPoint: 'f',
                    targets: [{ format: gpu.preferredFormat }]
                },
                depthStencil: {
                    format: 'depth24plus',
                    depthCompare: 'less',
                    depthWriteEnabled: true
                }
            });
        }
        async init() {
            this.clearRenderPipeline = await this.clearRenderPipelinePromise;
        }
    }
    const outputAttributeUsage = typeof GPUBufferUsage === 'undefined' ? null : GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX;
    class TetraSliceBufferMgr {
        maxCrossSectionBufferSize;
        gpu;
        outputVaryBufferPool = []; // all the vary buffers for pipelines
        indicesInOutputBufferPool;
        buffers;
        // outputVaryBuffer: GPUBuffer[];
        constructor(gpu, config, sliceBuffers) {
            this.buffers = [
                { buffer: sliceBuffers.emitIndexSliceBuffer },
                { buffer: sliceBuffers.uniformsBuffer },
                { buffer: sliceBuffers.thumbnailViewportBuffer },
            ];
            this.gpu = gpu;
            this.maxCrossSectionBufferSize = config.maxCrossSectionBufferSize;
        }
        init() {
            // lazy init buffer in creeating first tetraslice pipeline, optimization for only raytracing rendering
            this.outputVaryBufferPool.push(this.gpu.createBuffer(outputAttributeUsage, this.maxCrossSectionBufferSize, "Output buffer for builtin(position)"));
        }
        prepareNewPipeline() {
            this.indicesInOutputBufferPool = new Set;
            this.indicesInOutputBufferPool.add(0); // default builtin(position) buffer
            return [this.outputVaryBufferPool[0]];
        }
        destroy() {
            for (const buffer of this.outputVaryBufferPool) {
                buffer.destroy();
            }
        }
        ////// caution: data race here
        requireOutputBuffer(id, size, outBuffers) {
            if (id === 0)
                return this.outputVaryBufferPool[0];
            let expectedSize = this.maxCrossSectionBufferSize * size;
            for (let i = 0; i < this.outputVaryBufferPool.length; i++) {
                if (this.indicesInOutputBufferPool.has(i))
                    continue; // we can't bind the same buffer again
                let buffer = this.outputVaryBufferPool[i];
                if (buffer.size === expectedSize) {
                    // found unused exactly sized buffer
                    this.indicesInOutputBufferPool.add(i);
                    outBuffers.push(buffer);
                    return buffer;
                }
            }
            // no buffer found, we need to create
            let buffer = this.gpu.createBuffer(outputAttributeUsage, expectedSize, "Output buffer for " + size + " vec4(s)");
            this.indicesInOutputBufferPool.add(this.outputVaryBufferPool.length);
            this.outputVaryBufferPool.push(buffer);
            outBuffers.push(buffer);
            return buffer;
        }
    }
    class RetinaRenderPass {
        pipeline;
        pipelinePromise;
        bindgroup;
        alphaBindgroup;
        crossRenderPass;
        __brand;
        gpu;
        config;
        sliceBuffers;
        descriptor;
        constructor(gpu, config, sliceBuffers, crossRenderPass, descriptor) {
            this.gpu = gpu;
            this.config = config;
            this.descriptor = descriptor ?? {};
            this.sliceBuffers = sliceBuffers;
            this.crossRenderPass = crossRenderPass;
            let retinaRenderCode = refacingMatsCode + StructDefSliceInfo + StructDefUniformBuffer + `
struct tsxvOutputType{
    @builtin(position) position : vec4f,
    @location(0) relativeFragPosition : vec3<f32>,
    @location(1) crossHair : f32,
    @location(2) rayForCalOpacity : vec4f,
    @location(3) retinaCoord : vec3<f32>,
    @location(4) normalForCalOpacity : vec4f,
}
struct tsxfInputType{
    @location(0) relativeFragPosition : vec3<f32>,
    @location(1) crossHair : f32,
    @location(2) rayForCalOpacity : vec4f,
    @location(3) retinaCoord : vec3<f32>,
    @location(4) normalForCalOpacity : vec4f,
}
@group(0) @binding(0) var<storage,read> slice : array<tsxSliceInfo,${this.config.maxSlicesNumber}>;
@group(0) @binding(1) var<uniform> tsx_uniforms : tsxUniformBuffer;
@group(0) @binding(2) var<uniform> thumbnailViewport : array<vec4f,16>;

@vertex fn mainVertex(@builtin(vertex_index) vindex : u32, @builtin(instance_index) iindex : u32) -> tsxvOutputType {
    const pos = array<vec2<f32>, 4>(
        vec2<f32>(-1.0, -1.0),
        vec2<f32>(-1.0, 1.0),
        vec2<f32>( 1.0, -1.0),
        vec2<f32>( 1.0, 1.0),
    );
    var sindex = iindex;
    var pos2d = pos[vindex];
    let stereoLR = f32(iindex & 1) - 0.5;
    if (slice[tsx_uniforms.sliceOffset].flag == 0 && tsx_uniforms.eyeCross.y != 0.0){
        sindex = iindex >> 1;
    }
    let s = slice[sindex + tsx_uniforms.sliceOffset];
    // let coord = vec2<f32>(pos2d.x, -pos2d.y) * 0.5 + 0.5;
    let ray = vec4f(pos2d, s.slicePos, 1.0);
    var retinaCoord: vec4f;
    var glPosition: vec4f;
    var camRay: vec4f;
    var normal: vec4f;
    let x = f32(((s.viewport >> 24) & 0xFF) << ${this.config.viewportCompressShift}) * ${1 / this.config.sliceTextureWidth};
    let y = f32(((s.viewport >> 16) & 0xFF) << ${this.config.viewportCompressShift}) * ${1 / this.config.sliceTextureHeight};
    let w = f32(((s.viewport >> 8 ) & 0xFF) << ${this.config.viewportCompressShift}) * ${1 / this.config.sliceTextureWidth};
    let h = f32((s.viewport & 0xFF) << ${this.config.viewportCompressShift}) * ${1 / this.config.sliceTextureHeight};
    var crossHair : f32;
    if (slice[tsx_uniforms.sliceOffset].flag == 0){
        crossHair = 0.0;
        let stereoLR_offset = -stereoLR * tsx_uniforms.eyeCross.y;
        let se = sin(stereoLR_offset);
        let ce = cos(stereoLR_offset);
        var pureRotationMvMat = tsx_uniforms.retinaMV;
        pureRotationMvMat[3].z = 0.0;
        let eyeMat = mat4x4f(
            ce,0,se,0,
            0,1,0,0,
            -se,0,ce,0,
            0,0,tsx_uniforms.retinaMV[3].z,1
        );
        let omat = eyeMat * pureRotationMvMat * tsx_refacingMats[tsx_uniforms.refacing & 7];
        camRay = omat * ray;
        retinaCoord = tsx_refacingMats[tsx_uniforms.refacing & 7] * ray;
        glPosition = tsx_uniforms.retinaP * camRay;
        if(tsx_uniforms.retinaP[3].w > 0){ // Orthographic
            camRay = vec4f(0.0,0.0,-1.0,1.0);
        }
        normal = omat[2];
        // todo: viewport of retina slices
        glPosition.x = (glPosition.x) * tsx_uniforms.screenAspect + step(0.0001, abs(tsx_uniforms.eyeCross.y)) * stereoLR * glPosition.w;
    }else{
        let vp = thumbnailViewport[sindex + tsx_uniforms.sliceOffset - (tsx_uniforms.refacing >> 5)];
        crossHair = tsx_uniforms.eyeCross.z / vp.w * step(abs(s.slicePos),0.1);
        glPosition = vec4f(ray.x * vp.z * tsx_uniforms.screenAspect + vp.x, ray.y * vp.w + vp.y,0.5,1.0);
        camRay = vec4f(pos[vindex].x * vp.z / vp.w,pos[vindex].y,0.0,1.0); // for rendering crosshair
    }
    
    let texelCoord = array<vec2<f32>, 4>(
        vec2<f32>(x, y+h),
        vec2<f32>(x, y),
        vec2<f32>( x+w, y+h),
        vec2<f32>( x+w, y),
    );
    return tsxvOutputType(
        glPosition,
        vec3<f32>(texelCoord[vindex], s.slicePos),
        crossHair,
        camRay,
        retinaCoord.xyz,
        normal
    );
}

@group(0) @binding(3) var tsx_txt: texture_2d<f32>;
@group(0) @binding(4) var tsx_splr: sampler;
${descriptor?.alphaShader?.code ?? `
fn mainAlpha(color: vec4f, retinaCoord: vec3<f32>) -> f32{
    return color.a;
}
`}
@fragment fn mainFragment(input : tsxfInputType) -> @location(0) vec4f {
    let color = textureSample(tsx_txt, tsx_splr, input.relativeFragPosition.xy);
    var alpha: f32 = 1.0;
    var factor = 0.0;
    if (slice[tsx_uniforms.sliceOffset].flag == 0){
        let dotvalue = dot(normalize(input.rayForCalOpacity.xyz), input.normalForCalOpacity.xyz);
        let factor = tsx_uniforms.layerOpacity / (clamp(-dotvalue,0.0,1.0));
        alpha = clamp(${descriptor?.alphaShader?.entryPoint ?? "mainAlpha"}(color, input.retinaCoord) * factor,0.0,1.0);
    }else if (input.crossHair > 0.0) {
    let cross = abs(input.rayForCalOpacity.xy);
    factor = step(cross.x, input.crossHair * 0.05) + step(cross.y, input.crossHair * 0.05);
    factor *= step(cross.x, input.crossHair) * step(cross.y, input.crossHair);
}
return vec4f(mix(color.rgb, vec3<f32>(1.0) - color.rgb, clamp(factor, 0.0, 1.0)), alpha);
}
`;
            const retinaRenderShaderModule = gpu.device.createShaderModule({
                code: retinaRenderCode
            });
            this.pipelinePromise = gpu.device.createRenderPipelineAsync({
                layout: 'auto',
                vertex: {
                    module: retinaRenderShaderModule,
                    entryPoint: 'mainVertex',
                },
                fragment: {
                    module: retinaRenderShaderModule,
                    entryPoint: 'mainFragment',
                    targets: [{
                            format: this.config.enableFloat16Blend ? 'rgba16float' : this.gpu.preferredFormat,
                            blend: {
                                color: {
                                    srcFactor: "src-alpha",
                                    dstFactor: "one-minus-src-alpha",
                                    operation: "add"
                                },
                                alpha: {}
                            }
                        }],
                },
                depthStencil: {
                    depthWriteEnabled: true,
                    depthCompare: 'less',
                    format: 'depth24plus',
                },
                primitive: { topology: 'triangle-strip' }
            });
        }
        async init() {
            this.pipeline = await this.pipelinePromise;
            this.bindgroup = this.gpu.createBindGroup(this.pipeline, 0, [
                { buffer: this.sliceBuffers.emitIndexSliceBuffer },
                { buffer: this.sliceBuffers.uniformsBuffer },
                { buffer: this.sliceBuffers.thumbnailViewportBuffer },
                this.crossRenderPass.sliceView,
                linearTextureSampler,
            ], "retinaBindGroup");
            if (this.descriptor.alphaShaderBindingResources) {
                this.alphaBindgroup = this.gpu.createBindGroup(this.pipeline, 1, this.descriptor.alphaShaderBindingResources, "retinaAlphaBindGroup");
            }
            return this;
        }
    }
    /**
     * ---------------------------------
     * screen render pass
     * for float16 blending and convert color to srgb
     * ---------------------------------
     *  */
    const screenRenderCode = StructDefUniformBuffer + `
@group(0) @binding(0) var tsx_txt: texture_2d<f32>;
@group(0) @binding(1) var tsx_splr: sampler;
@group(0) @binding(2) var<uniform>tsx_uniforms : tsxUniformBuffer;
struct tsxvOutputType{
    @builtin(position) position: vec4f,
    @location(0) fragPosition: vec2<f32>,
}
struct tsxfInputType{
    @location(0) fragPosition: vec2<f32>,
}
@vertex fn mainVertex(@builtin(vertex_index) index : u32) -> tsxvOutputType {
    const pos = array<vec2<f32>, 4>(
        vec2<f32>(-1.0, -1.0),
        vec2<f32>(-1.0, 1.0),
        vec2<f32>(1.0, -1.0),
        vec2<f32>(1.0, 1.0),
    );
    const uv = array<vec2<f32>, 4>(
        vec2<f32>(0.0, 1.0),
        vec2<f32>(0.0, 0.0),
        vec2<f32>(1.0, 1.0),
        vec2<f32>(1.0, 0.0),
    );
    return tsxvOutputType(vec4f(pos[index], 0.0, 1.0), uv[index]);
}
@fragment fn mainFragment(input: tsxfInputType) -> @location(0) vec4 < f32 > {
let color = textureSample(tsx_txt, tsx_splr, input.fragPosition);
var factor = 0.0;
if(tsx_uniforms.eyeCross.z > 0.0 && tsx_uniforms.layerOpacity > 0.0){
    let aspectedCross = tsx_uniforms.eyeCross.z * tsx_uniforms.screenAspect;
    if (tsx_uniforms.eyeCross.x != 0.0) {
        let cross1 = abs(input.fragPosition - vec2<f32>(0.25, 0.5)) * 2.0;
        let cross2 = abs(input.fragPosition - vec2<f32>(0.75, 0.5)) * 2.0;
        factor = step(cross1.x, 0.05 * aspectedCross) + step(cross2.x, 0.05 * aspectedCross) + step(cross1.y, tsx_uniforms.eyeCross.z * 0.05);
        factor *= step(cross1.y, tsx_uniforms.eyeCross.z) * (step(cross1.x, aspectedCross) + step(cross2.x, aspectedCross));
    } else {
        let cross = abs(input.fragPosition - vec2<f32>(0.5, 0.5)) * 2.0;
        factor = step(cross.x, 0.05 * aspectedCross) + step(cross.y, tsx_uniforms.eyeCross.z * 0.05);
        factor *= step(cross.y, tsx_uniforms.eyeCross.z) * step(cross.x, aspectedCross);
    }
}
return vec4f(mix(color.rgb, vec3<f32>(1.0) - color.rgb, clamp(factor, 0.0, 1.0)), 1.0);
}
`;
    class ScreenRenderPass {
        view;
        depthView;
        pipeline;
        pipelinePromise;
        bindgroup;
        texture;
        depthTexture;
        gpu;
        config;
        sliceBuffers;
        constructor(gpu, config, sliceBuffers) {
            this.gpu = gpu;
            this.config = config;
            this.sliceBuffers = sliceBuffers;
            let screenRenderShaderModule = gpu.device.createShaderModule({
                code: screenRenderCode
            });
            this.pipelinePromise = gpu.device.createRenderPipelineAsync({
                layout: 'auto',
                vertex: {
                    module: screenRenderShaderModule,
                    entryPoint: 'mainVertex',
                },
                fragment: {
                    module: screenRenderShaderModule,
                    entryPoint: 'mainFragment',
                    targets: [{
                            format: gpu.preferredFormat
                        }],
                },
                primitive: { topology: 'triangle-strip' }
            });
        }
        setSize(size) {
            if (this.texture)
                this.texture.destroy();
            if (this.depthTexture)
                this.depthTexture.destroy();
            // if (!this.pipeline) throw "TetraSliceRenderer: ScreenRenderPipeline is not initialized.";
            this.texture = this.gpu.device.createTexture({
                size, format: this.config.enableFloat16Blend ? 'rgba16float' : this.gpu.preferredFormat,
                usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
            });
            this.depthTexture = this.gpu.device.createTexture({
                size, format: 'depth24plus',
                usage: GPUTextureUsage.RENDER_ATTACHMENT,
            });
            this.view = this.texture.createView();
            this.depthView = this.depthTexture.createView();
            if (this.pipeline) {
                this.bindgroup = this.gpu.createBindGroup(this.pipeline, 0, [
                    this.view,
                    linearTextureSampler,
                    { buffer: this.sliceBuffers.uniformsBuffer },
                ], "screenBindGroup");
            }
            let aspect;
            if (size.height) {
                aspect = size.height / size.width;
            }
            else {
                aspect = size[1] / size[0];
            }
            this.gpu.device.queue.writeBuffer(this.sliceBuffers.uniformsBuffer, screenAspectBufferOffset, new Float32Array([aspect]));
        }
        async init() {
            this.pipeline = await this.pipelinePromise;
            this.bindgroup = this.gpu.createBindGroup(this.pipeline, 0, [
                this.view,
                linearTextureSampler,
                { buffer: this.sliceBuffers.uniformsBuffer },
            ], "screenBindGroup");
        }
    }
    const _vec4$2 = new Vec4;
    const _vec42 = new Vec4;
    class WireFrameRenderPass {
        pipeline;
        pipelinePromise;
        dataBuffer;
        bindGroup;
        gpu;
        config;
        renderState;
        renderPassDesc;
        constructor(gpu, config) {
            this.gpu = gpu;
            this.config = config;
            const shaderModule = gpu.device.createShaderModule({
                code: StructDefUniformBuffer + `
@group(0) @binding(0) var<uniform> tsx_uniforms : tsxUniformBuffer;
@vertex fn tsxVMain(@location(0) inPos: vec4f, @builtin(instance_index) idx: u32) -> @builtin(position) vec4f{
    let stereoLR = f32(idx & 1) - 0.5;
    let stereoLR_offset = -stereoLR * tsx_uniforms.eyeCross.y;
    let se = sin(stereoLR_offset);
    let ce = cos(stereoLR_offset);
    var pureRotationMvMat = tsx_uniforms.retinaMV;
    pureRotationMvMat[3].z = 0.0;
    let eyeMat = mat4x4f(
        ce,0,se,0,
        0,1,0,0,
        -se,0,ce,0,
        0,0,tsx_uniforms.retinaMV[3].z,1
    );
    var glPosition = tsx_uniforms.retinaP * eyeMat * pureRotationMvMat * vec4(inPos.xyz, 1.0);
    glPosition.x = (glPosition.x) * tsx_uniforms.screenAspect + step(0.0001, abs(tsx_uniforms.eyeCross.y)) * stereoLR * glPosition.w;
    return glPosition;
}
@fragment fn tsxFMain()->@location(0) vec4f{
    return vec4f(1.0,0.0,0.0,1.0);
}`,
            });
            this.pipelinePromise = gpu.device.createRenderPipelineAsync({
                layout: 'auto',
                vertex: {
                    module: shaderModule,
                    entryPoint: "tsxVMain",
                    buffers: [
                        {
                            attributes: [
                                {
                                    shaderLocation: 0,
                                    offset: 0,
                                    format: "float32x4",
                                }
                            ],
                            arrayStride: 4 * 4,
                        }
                    ]
                },
                primitive: {
                    topology: "line-list"
                },
                fragment: {
                    targets: [
                        { format: this.config.enableFloat16Blend ? 'rgba16float' : this.gpu.preferredFormat },
                    ],
                    module: shaderModule,
                    entryPoint: "tsxFMain"
                },
                depthStencil: {
                    depthWriteEnabled: true,
                    depthCompare: 'less',
                    format: 'depth24plus',
                }
            });
        }
        async init() {
            this.pipeline = await this.pipelinePromise;
        }
        render(buffer, vertices) {
            if (!this.pipeline)
                return;
            this.bindGroup ??= this.gpu.createBindGroup(this.pipeline, 0, [{
                    buffer: this.renderState.sliceBuffers.uniformsBuffer
                }]);
            const renderPassEncoder = this.renderState.commandEncoder.beginRenderPass(this.renderPassDesc);
            renderPassEncoder.setPipeline(this.pipeline);
            renderPassEncoder.setVertexBuffer(0, buffer);
            renderPassEncoder.setBindGroup(0, this.bindGroup);
            // todo: deal with no retina voxel / non stero mode
            renderPassEncoder.draw(vertices, 2);
            renderPassEncoder.end();
        }
    }
    class RenderState {
        commandEncoder;
        computePassEncoder;
        pipeline;
        tetraSliceBufferMgr;
        config;
        // slicePassEncoder: GPURenderPassEncoder;
        sliceIndex;
        needClear;
        tetraBuffers;
        sliceBuffers;
        crossRenderPass;
        frustumRange;
        constructor(gpu, config, sliceBuffers, tetraBuffers, crossRenderPass) {
            this.commandEncoder = gpu.device.createCommandEncoder();
            this.tetraBuffers = tetraBuffers;
            this.sliceBuffers = sliceBuffers;
            this.crossRenderPass = crossRenderPass;
            this.config = config;
        }
        /** Set TetraSlicePipeline and prepare GPU resources.
         *  Next calls should be function sliceTetras or setBindGroup.
         */
        beginTetras(pipeline) {
            // let { commandEncoder, sliceIndex, needClear } = this.renderState;
            // clear triagle slice vertex output pointer to zero (emitIndex part)
            this.commandEncoder.clearBuffer(this.sliceBuffers.emitIndexSliceBuffer, this.config.maxSlicesNumber << 4, 4 << this.config.sliceGroupSizeBit);
            // clear triagle slice vertex output data to zero
            this.commandEncoder.clearBuffer(pipeline.outputVaryBuffer[0]);
            this.computePassEncoder = this.commandEncoder.beginComputePass();
            this.computePassEncoder.setPipeline(pipeline.computePipeline);
            this.computePassEncoder.setBindGroup(0, pipeline.computeBindGroup0);
            this.pipeline = pipeline;
        }
        // todo 写清楚 setBindGroup、drawTetras(bindGroups的区别
        setBindGroup(index, bindGroup) {
            this.computePassEncoder.setBindGroup(index, bindGroup);
        }
        /** Compute slice of given bindgroup attribute data.
         *  beginTetras should be called at first to specify a tetraSlicePipeline
         *  Next calls should be function sliceTetras, setBindGroup or drawTetras.
         */
        sliceTetras(vertexBindGroup, tetraCount, instanceCount) {
            if (vertexBindGroup)
                this.computePassEncoder.setBindGroup(1, vertexBindGroup);
            this.computePassEncoder.dispatchWorkgroups(Math.ceil(tetraCount / 256), instanceCount); // todo: change workgroups
        }
        /** This function draw slices on a internal framebuffer
         *  Every beginTetras call should be end with drawTetras call
         */
        drawTetras(bindGroups) {
            this.computePassEncoder.end();
            let slicePassEncoder = this.commandEncoder.beginRenderPass(this.needClear ? this.crossRenderPass.descClear : this.crossRenderPass.descLoad);
            slicePassEncoder.setPipeline(this.pipeline.renderPipeline);
            for (let i = 0; i < this.pipeline.vertexOutNum; i++) {
                slicePassEncoder.setVertexBuffer(i, this.pipeline.outputVaryBuffer[i]);
            }
            if (bindGroups) {
                for (let { group, binding } of bindGroups) {
                    slicePassEncoder.setBindGroup(group, binding);
                }
            }
            // bitshift: outputBufferSize / 16 for vertices number, / sliceGroupSize for one stride
            let bitshift = 4 + this.config.sliceGroupSizeBit;
            let verticesStride = this.config.maxCrossSectionBufferSize >> bitshift;
            let offsetVert = 0;
            let sliceJsOffset = (this.sliceIndex << (2 + this.config.sliceGroupSizeBit)) + 3;
            let vpShift = this.config.viewportCompressShift;
            for (let c = 0; c < this.config.sliceGroupSize; c++, offsetVert += verticesStride) {
                let vp = f32_to_u32(this.sliceBuffers.slicesJsBuffer[sliceJsOffset + (c << 2)]);
                slicePassEncoder.setViewport(((vp >> 24) & 0xFF) << vpShift, ((vp >> 16) & 0xFF) << vpShift, ((vp >> 8) & 0xFF) << vpShift, (vp & 0xFF) << vpShift, 0, 1);
                slicePassEncoder.draw(verticesStride, 1, offsetVert);
            }
            slicePassEncoder.end();
            this.needClear = false;
        }
        drawRaytracing(pipeline, bindGroups) {
            let slicePassEncoder = this.commandEncoder.beginRenderPass(this.needClear ? this.crossRenderPass.descClear : this.crossRenderPass.descLoad);
            slicePassEncoder.setPipeline(pipeline.pipeline);
            slicePassEncoder.setBindGroup(0, pipeline.bindGroup0);
            if (bindGroups && bindGroups[0])
                slicePassEncoder.setBindGroup(1, bindGroups[0]);
            slicePassEncoder.draw(4, this.config.sliceGroupSize);
            slicePassEncoder.end();
            this.needClear = false;
        }
        testWithFrustumData(obb, camMat, modelMat) {
            this.frustumRange ??= this.getFrustumRange(camMat);
            if (!this.frustumRange)
                return true;
            let relP = _vec4$2.copy(camMat.vec ?? camMat.position);
            if (modelMat)
                relP.subs((modelMat.vec ?? modelMat.position));
            if (!modelMat) {
                for (let f of this.frustumRange) {
                    if (obb.testPlane(new Plane(f, f.dot(relP))) === 1)
                        return false;
                }
            }
            else if (modelMat.mat) {
                for (let f of this.frustumRange) { // todo: .t() to optimise
                    if (obb.testPlane(new Plane(_vec42.mulmatvset(modelMat.mat.t(), f), f.dot(relP))) === 1)
                        return false;
                }
            }
            else {
                for (let f of this.frustumRange) {
                    if (obb.testPlane(new Plane(_vec42.copy(f).rotatesconj(modelMat.rotation), f.dot(relP))) === 1)
                        return false;
                }
            }
            return true;
        }
        getFrustumRange(camMat, allRange) {
            let minslice = this.sliceIndex << this.config.sliceGroupSizeBit;
            let maxslice = minslice + this.config.sliceGroupSize - 1;
            let isRetinaGroup = this.sliceBuffers.slicesJsBuffer[(minslice << 2) + 1];
            let frustum;
            let camProj = 1 / this.sliceBuffers.camProjJsBuffer[1];
            if (allRange) {
                frustum = [-camProj, camProj, -camProj, camProj, -camProj, camProj];
            }
            else if (isRetinaGroup === 0) {
                minslice = this.sliceBuffers.slicesJsBuffer[minslice << 2] * camProj;
                maxslice = this.sliceBuffers.slicesJsBuffer[maxslice << 2] * camProj;
                switch (this.sliceBuffers.currentRetinaFacing) {
                    case RetinaSliceFacing.POSZ:
                        frustum = [-camProj, camProj, -camProj, camProj, minslice, maxslice];
                        break;
                    case RetinaSliceFacing.NEGZ:
                        frustum = [-camProj, camProj, -camProj, camProj, -maxslice, -minslice];
                        break;
                    case RetinaSliceFacing.POSX:
                        frustum = [minslice, maxslice, -camProj, camProj, -camProj, camProj];
                        break;
                    case RetinaSliceFacing.NEGX:
                        frustum = [-maxslice, -minslice, -camProj, camProj, -camProj, camProj];
                        break;
                    case RetinaSliceFacing.POSY:
                        frustum = [-camProj, camProj, minslice, maxslice, -camProj, camProj];
                        break;
                    case RetinaSliceFacing.NEGY:
                        frustum = [-camProj, camProj, -maxslice, -minslice, -camProj, camProj];
                        break;
                }
                // refacing = SliceFacing[this.currentRetinaFacing];
            }
            else ;
            if (camMat.mat) {
                const m = camMat.mat;
                return frustum ? [
                    new Vec4(-1, 0, 0, -frustum[0]).mulmatls(m),
                    new Vec4(1, 0, 0, frustum[1]).mulmatls(m),
                    new Vec4(0, -1, 0, -frustum[2]).mulmatls(m),
                    new Vec4(0, 1, 0, frustum[3]).mulmatls(m),
                    new Vec4(0, 0, -1, -frustum[4]).mulmatls(m),
                    new Vec4(0, 0, 1, frustum[5]).mulmatls(m),
                ] : undefined;
            }
            else {
                const r = camMat.rotation;
                return frustum ? [
                    new Vec4(-1, 0, 0, -frustum[0]).rotates(r),
                    new Vec4(1, 0, 0, frustum[1]).rotates(r),
                    new Vec4(0, -1, 0, -frustum[2]).rotates(r),
                    new Vec4(0, 1, 0, frustum[3]).rotates(r),
                    new Vec4(0, 0, -1, -frustum[4]).rotates(r),
                    new Vec4(0, 0, 1, frustum[5]).rotates(r),
                ] : undefined;
            }
            // console.log({ isRetinaGroup, frustum,  refacing});
        }
    }
    const arrayBuffer = new ArrayBuffer(4);
    function f32_to_u32(f32) {
        const b = new Float32Array(arrayBuffer);
        b[0] = f32;
        return new Uint32Array(b.buffer)[0];
    }
    function u32_to_f32(u32) {
        const b = new Uint32Array(arrayBuffer);
        b[0] = u32;
        return new Float32Array(b.buffer)[0];
    }

    class GPU {
        adapter;
        device;
        preferredFormat;
        async init() {
            if (!('gpu' in navigator)) {
                console.warn("User agent doesn't support WebGPU.");
                return null;
            }
            const gpuAdapter = await navigator.gpu.requestAdapter({
                powerPreference: 'high-performance'
            });
            if (!gpuAdapter) {
                console.warn('No WebGPU adapters found.');
                return null;
            }
            this.adapter = gpuAdapter;
            this.preferredFormat = navigator.gpu.getPreferredCanvasFormat();
            this.device = await gpuAdapter.requestDevice();
            this.device.lost.then((info) => {
                console.error(`WebGPU device was lost: ${info.message}`);
                this.device = null;
                if (info.reason != 'destroyed') {
                    this.init();
                }
            });
            return this;
        }
        createBuffer(usage, buffer_or_size, label) {
            let gpuBuffer = this.device.createBuffer({
                size: buffer_or_size?.byteLength ?? buffer_or_size,
                usage, label,
                mappedAtCreation: typeof buffer_or_size != "number"
            });
            if (typeof buffer_or_size != "number") {
                let jsBuffer = new buffer_or_size.constructor(gpuBuffer.getMappedRange());
                jsBuffer.set(buffer_or_size);
                gpuBuffer.unmap();
            }
            return gpuBuffer;
        }
        createBindGroup(pipeline, index, entries, label) {
            let descriptor = {
                layout: pipeline.getBindGroupLayout(index),
                entries: entries.map((e, i) => ({ binding: i, resource: e }))
            };
            if (label)
                descriptor.label = label;
            return this.device.createBindGroup(descriptor);
        }
        getContext(dom, config) {
            let ctxt = dom.getContext('webgpu');
            ctxt.configure({
                device: this.device,
                format: config?.format ?? this.preferredFormat,
                ...config
            });
            return ctxt;
        }
    }

    function toIndexbuffer(srcArr, dstArr, dstIdxArr, stride) {
        for (let i = 0, l = srcArr.length; i < l; i += stride) {
            let idx = indexOf(srcArr, i, dstArr, 4);
            if (idx === -1) {
                idx = dstArr.length;
                for (let q = 0; q < stride; q++) {
                    dstArr.push(srcArr[i + q]);
                }
            }
            idx >>= 2;
            dstIdxArr.push(idx);
        }
    }
    function indexOf(srcArr, srcIdx, dstArr, stride) {
        for (let i = 0, j = 0, l = dstArr.length; i < l; i += stride, j++) {
            let same = true;
            for (let q = 0; q < stride; q++) {
                same &&= srcArr[srcIdx + q] === dstArr[i + q];
            }
            if (same) {
                return i;
            }
        }
        return -1;
    }
    function toNonIndex(srcArr, idxArr, dstArr, stride) {
        let ptr = 0;
        for (let i = 0, l = idxArr.length; i < l; i++) {
            let idx = idxArr[i] * stride;
            for (let q = 0; q < stride; q++) {
                dstArr[ptr++] = srcArr[idx + q];
            }
        }
    }

    class TetraMesh {
        position;
        normal;
        uvw;
        count;
        constructor(d) {
            this.position = d.position;
            this.normal = d.normal;
            this.uvw = d.uvw;
            this.count = d.count;
        }
        applyAffineMat4(am) {
            applyAffineMat4$1(this, am);
            return this;
        }
        applyObj4(obj4) {
            applyObj4$1(this, obj4);
            return this;
        }
        clone() {
            let ret = new TetraMesh({
                position: this.position.slice(0),
                count: this.count
            });
            if (this.uvw)
                ret.uvw = this.uvw.slice(0);
            if (this.normal)
                ret.normal = this.normal.slice(0);
            return ret;
        }
        toIndexMesh() {
            let position = [];
            let normal = [];
            let uvw = [];
            let posIdx = [];
            let normalIdx = [];
            let uvwIdx = [];
            toIndexbuffer(this.position, position, posIdx, 4);
            if (this.normal)
                toIndexbuffer(this.normal, normal, normalIdx, 4);
            if (this.uvw)
                toIndexbuffer(this.uvw, uvw, uvwIdx, 4);
            let out = new TetraIndexMesh({
                position: new Float32Array(position),
                positionIndex: new Uint32Array(posIdx)
            });
            if (this.normal)
                out.normalIndex = new Uint32Array(normalIdx);
            if (this.uvw)
                out.uvwIndex = new Uint32Array(uvwIdx);
            if (normal.length)
                out.normal = new Float32Array(normal);
            if (uvw.length)
                out.uvw = new Float32Array(uvw);
            return out;
        }
        /// this function will copy data and not modify original data
        concat(mesh2) {
            let position = new Float32Array(this.position.length + mesh2.position.length);
            position.set(this.position);
            position.set(mesh2.position, this.position.length);
            let ret = new TetraMesh({ position, count: position.length >> 4 });
            if (this.normal && mesh2.normal) {
                let normal = new Float32Array(this.normal.length + mesh2.normal.length);
                normal.set(this.normal);
                normal.set(mesh2.normal, this.normal.length);
                ret.normal = normal;
            }
            if (this.uvw && mesh2.uvw) {
                let uvw = new Float32Array(this.uvw.length + mesh2.uvw.length);
                uvw.set(this.uvw);
                uvw.set(mesh2.uvw, this.uvw.length);
                ret.uvw = uvw;
            }
            return ret;
        }
        /// this function will copy data and not modify original data
        deleteTetras(tetras) {
            let count = this.count ?? (this.position?.length >> 4);
            let newCount = (count - tetras.length) << 4;
            let p = new Float32Array(newCount);
            let n;
            let u;
            if (this.normal)
                n = new Float32Array(newCount);
            if (this.uvw)
                u = new Float32Array(newCount);
            let offset = 0;
            for (let i = 0; i < this.count; i++) {
                if (!tetras.includes(i)) {
                    p.set(this.position.subarray(i << 4, (i + 1) << 4), offset);
                    if (n)
                        n.set(this.normal.subarray(i << 4, (i + 1) << 4), offset);
                    if (u)
                        u.set(this.uvw.subarray(i << 4, (i + 1) << 4), offset);
                    offset += 16;
                }
            }
            return new TetraMesh({
                position: p, normal: n, uvw: u, count: newCount >> 4
            });
        }
        generateNormal(splitThreshold) {
            if (!this.normal) {
                this.normal = new Float32Array(this.count << 4);
                const v1 = new Vec4, v2 = new Vec4, v3 = new Vec4;
                for (let i = 0, offset = 0; i < this.position.length;) {
                    const a0 = new Vec4(this.position[i++], this.position[i++], this.position[i++], this.position[i++]);
                    const a1 = new Vec4(this.position[i++], this.position[i++], this.position[i++], this.position[i++]);
                    const a2 = new Vec4(this.position[i++], this.position[i++], this.position[i++], this.position[i++]);
                    const a3 = new Vec4(this.position[i++], this.position[i++], this.position[i++], this.position[i++]);
                    const normal = v1.subset(a0, a1).wedge(v2.subset(a0, a2)).wedgev(v3.subset(a0, a3)).norms();
                    normal.writeBuffer(this.normal, offset);
                    offset += 4;
                    normal.writeBuffer(this.normal, offset);
                    offset += 4;
                    normal.writeBuffer(this.normal, offset);
                    offset += 4;
                    normal.writeBuffer(this.normal, offset);
                    offset += 4;
                }
            }
            if (!splitThreshold)
                return this; // shade flat, complete
            // then for shade smooth
            const threshold = Math.cos(splitThreshold);
            let position = [];
            let posIdx = [];
            let point2clusterTable = [];
            toIndexbuffer(this.position, position, posIdx, 4);
            for (let i = 0; i < posIdx.length; i++) {
                const a0 = posIdx[i];
                point2clusterTable[a0] ??= [];
                point2clusterTable[a0].push(i);
            }
            const newNormal = new Float32Array(this.count << 4);
            const tempNormal = new Vec4;
            for (let i = 0, i4 = 0; i < posIdx.length; i++, i4 += 4) {
                const a0 = posIdx[i];
                let thisNormal = new Vec4(this.normal[i4], this.normal[i4 + 1], this.normal[i4 + 2], this.normal[i4 + 3]);
                let sum = thisNormal.clone();
                for (const idx of point2clusterTable[a0]) {
                    if (i === idx)
                        continue;
                    const idx4 = idx << 2;
                    tempNormal.set(this.normal[idx4], this.normal[idx4 + 1], this.normal[idx4 + 2], this.normal[idx4 + 3]);
                    if (thisNormal.dot(tempNormal) > threshold) {
                        sum.adds(tempNormal);
                    }
                }
                sum.norms();
                sum.writeBuffer(newNormal, i << 2);
            }
            this.normal = newNormal;
            return this;
        }
        inverseNormal() {
            let count = this.count ?? this.position.length >> 4;
            let temp;
            for (let i = 0; i < count; i++) {
                let offset = i << 4;
                temp = this.position[offset + 0];
                this.position[offset + 0] = this.position[offset + 4];
                this.position[offset + 4] = temp;
                temp = this.position[offset + 1];
                this.position[offset + 1] = this.position[offset + 5];
                this.position[offset + 5] = temp;
                temp = this.position[offset + 2];
                this.position[offset + 2] = this.position[offset + 6];
                this.position[offset + 6] = temp;
                temp = this.position[offset + 3];
                this.position[offset + 3] = this.position[offset + 7];
                this.position[offset + 7] = temp;
                if (this.uvw) {
                    temp = this.uvw[offset + 0];
                    this.uvw[offset + 0] = this.uvw[offset + 4];
                    this.uvw[offset + 4] = temp;
                    temp = this.uvw[offset + 1];
                    this.uvw[offset + 1] = this.uvw[offset + 5];
                    this.uvw[offset + 5] = temp;
                    temp = this.uvw[offset + 2];
                    this.uvw[offset + 2] = this.uvw[offset + 6];
                    this.uvw[offset + 6] = temp;
                    temp = this.uvw[offset + 3];
                    this.uvw[offset + 3] = this.uvw[offset + 7];
                    this.uvw[offset + 7] = temp;
                }
                if (this.normal) {
                    temp = this.normal[offset + 0];
                    this.normal[offset + 0] = this.normal[offset + 4];
                    this.normal[offset + 4] = temp;
                    temp = this.normal[offset + 1];
                    this.normal[offset + 1] = this.normal[offset + 5];
                    this.normal[offset + 5] = temp;
                    temp = this.normal[offset + 2];
                    this.normal[offset + 2] = this.normal[offset + 6];
                    this.normal[offset + 6] = temp;
                    temp = this.normal[offset + 3];
                    this.normal[offset + 3] = this.normal[offset + 7];
                    this.normal[offset + 7] = temp;
                }
            }
            this.position;
            if (this.normal) {
                for (let i = 0, l = this.normal.length; i < l; i++) {
                    this.normal[i] = -this.normal[i];
                }
            }
            return this;
        }
        setUVWAsPosition() {
            if (!this.uvw)
                this.uvw = this.position.slice(0);
            else {
                this.uvw.set(this.position);
            }
            return this;
        }
        getVertices() {
            const res = [];
            for (let i = 0; i < this.position.length; i += 4) {
                res.push(new Vec4(this.position[i], this.position[i + 1], this.position[i + 2], this.position[i + 3]));
            }
            return res;
        }
    }
    class TetraIndexMesh {
        position;
        normal;
        uvw;
        positionIndex;
        normalIndex;
        uvwIndex;
        count;
        constructor(d) {
            this.position = d.position;
            this.normal = d.normal;
            this.uvw = d.uvw;
            this.positionIndex = d.positionIndex;
            this.normalIndex = d.normalIndex;
            this.uvwIndex = d.uvwIndex;
            this.count = d.count;
        }
        applyAffineMat4(am) {
            applyAffineMat4$1(this, am);
            return this;
        }
        applyObj4(obj4) {
            applyObj4$1(this, obj4);
            return this;
        }
        getVertices() {
            const res = [];
            for (let i = 0; i < this.position.length; i += 4) {
                res.push(new Vec4(this.position[i], this.position[i + 1], this.position[i + 2], this.position[i + 3]));
            }
            return res;
        }
        toNonIndexMesh() {
            let count = this.position.length << 2;
            let out = new TetraMesh({
                position: new Float32Array(count),
                count: count >> 4
            });
            toNonIndex(this.position, this.positionIndex, out.position, 4);
            if (this.normal) {
                out.normal = new Float32Array(count);
                toNonIndex(this.normal, this.normalIndex, out.normal, 4);
            }
            if (this.uvw) {
                out.uvw = new Float32Array(count);
                toNonIndex(this.uvw, this.uvwIndex, out.uvw, 4);
            }
            return out;
        }
    }
    function applyAffineMat4$1(mesh, am) {
        let vp = new Vec4();
        for (let i = 0; i < mesh.position.length; i += 4) {
            vp.set(mesh.position[i], mesh.position[i + 1], mesh.position[i + 2], mesh.position[i + 3]).mulmatls(am.mat).adds(am.vec).writeBuffer(mesh.position, i);
            if (mesh.normal) {
                vp.set(mesh.normal[i], mesh.normal[i + 1], mesh.normal[i + 2], mesh.normal[i + 3]).mulmatls(am.mat).writeBuffer(mesh.position, i);
            }
        }
        return mesh;
    }
    function applyObj4$1(mesh, obj) {
        let vp = new Vec4();
        let scaleinv;
        if (obj.scale && mesh.normal) {
            scaleinv = new Vec4(1 / obj.scale.x, 1 / obj.scale.y, 1 / obj.scale.z, 1 / obj.scale.w);
        }
        for (let i = 0; i < mesh.position.length; i += 4) {
            if (obj.scale) {
                vp.set(mesh.position[i] * obj.scale.x, mesh.position[i + 1] * obj.scale.y, mesh.position[i + 2] * obj.scale.z, mesh.position[i + 3] * obj.scale.w).rotates(obj.rotation).adds(obj.position).writeBuffer(mesh.position, i);
                if (mesh.normal) {
                    vp.set(mesh.normal[i] * scaleinv.x, mesh.normal[i + 1] * scaleinv.y, mesh.normal[i + 2] * scaleinv.z, mesh.normal[i + 3] * scaleinv.w).rotates(obj.rotation).norms().writeBuffer(mesh.normal, i);
                }
            }
            else {
                vp.set(mesh.position[i], mesh.position[i + 1], mesh.position[i + 2], mesh.position[i + 3]).rotates(obj.rotation).adds(obj.position).writeBuffer(mesh.position, i);
                if (mesh.normal) {
                    vp.set(mesh.normal[i], mesh.normal[i + 1], mesh.normal[i + 2], mesh.normal[i + 3]).rotates(obj.rotation).writeBuffer(mesh.normal, i);
                }
            }
        }
        return mesh;
    }
    function concat(meshes) {
        let length = 0;
        let hasNormal = true;
        let hasUvw = true;
        for (let i = 0; i < meshes.length; i++) {
            length += meshes[i].position.length;
            hasUvw = hasUvw && (meshes[i].uvw ? true : false);
            hasNormal = hasNormal && (meshes[i].normal ? true : false);
        }
        let position = new Float32Array(length);
        let ret = new TetraMesh({ position, count: length >> 4 });
        let normal, uvw;
        if (hasNormal) {
            normal = new Float32Array(length);
            ret.normal = normal;
        }
        if (hasUvw) {
            uvw = new Float32Array(length);
            ret.uvw = uvw;
        }
        length = 0;
        for (let i = 0; i < meshes.length; i++) {
            position.set(meshes[i].position, length);
            if (hasNormal) {
                normal.set(meshes[i].normal, length);
            }
            if (hasUvw) {
                uvw.set(meshes[i].uvw, length);
            }
            length += meshes[i].position.length;
        }
        return ret;
    }

    class FaceMesh {
        quad;
        triangle;
        constructor(d) {
            this.quad = d.quad;
            this.triangle = d.triangle;
        }
        applyAffineMat4(am) {
            applyAffineMat4(this, am);
            return this;
        }
        applyObj4(obj4) {
            applyObj4(this, obj4);
            return this;
        }
        toIndexMesh() {
            let position = [];
            let normal = [];
            let uvw = [];
            let posIdx4 = [];
            let normalIdx4 = [];
            let uvwIdx4 = [];
            let posIdx3 = [];
            let normalIdx3 = [];
            let uvwIdx3 = [];
            if (this.quad) {
                toIndexbuffer(this.quad.position, position, posIdx4, 4);
                if (this.quad.normal)
                    toIndexbuffer(this.quad.normal, normal, normalIdx4, 4);
                if (this.quad.uvw)
                    toIndexbuffer(this.quad.uvw, uvw, uvwIdx4, 4);
            }
            if (this.triangle) {
                toIndexbuffer(this.triangle.position, position, posIdx3, 4);
                if (this.triangle.normal)
                    toIndexbuffer(this.triangle.normal, normal, normalIdx3, 4);
                if (this.triangle.uvw)
                    toIndexbuffer(this.triangle.uvw, uvw, uvwIdx3, 4);
            }
            let out = new FaceIndexMesh({
                position: new Float32Array(position)
            });
            if (this.quad) {
                out.quad = {
                    position: new Uint32Array(posIdx4)
                };
                if (this.quad.normal)
                    out.quad.normal = new Uint32Array(normalIdx4);
                if (this.quad.uvw)
                    out.quad.uvw = new Uint32Array(uvwIdx4);
            }
            if (this.triangle) {
                out.triangle = {
                    position: new Uint32Array(posIdx4)
                };
                if (this.triangle.normal)
                    out.triangle.normal = new Uint32Array(normalIdx4);
                if (this.triangle.uvw)
                    out.triangle.uvw = new Uint32Array(uvwIdx4);
            }
            if (normal.length)
                out.normal = new Float32Array(normal);
            if (uvw.length)
                out.uvw = new Float32Array(uvw);
            return out;
        }
        clone() {
            let ret = new FaceMesh({});
            if (this.quad) {
                ret.quad = {
                    position: this.quad.position.slice(0)
                };
                if (this.quad.count)
                    ret.quad.count = this.quad.count;
                if (this.quad.normal)
                    ret.quad.normal = this.quad.normal.slice(0);
                if (this.quad.uvw)
                    ret.quad.uvw = this.quad.uvw.slice(0);
            }
            if (this.triangle) {
                ret.triangle = {
                    position: this.triangle.position.slice(0)
                };
                if (this.triangle.count)
                    ret.triangle.count = this.triangle.count;
                if (this.triangle.normal)
                    ret.triangle.normal = this.triangle.normal.slice(0);
                if (this.triangle.uvw)
                    ret.triangle.uvw = this.triangle.uvw.slice(0);
            }
            return ret;
        }
        concat(m2) {
            let quad_position = new Float32Array((this.quad?.position?.length ?? 0) + (m2.quad?.position?.length ?? 0));
            if (this.quad?.position)
                quad_position.set(this.quad.position);
            if (m2.quad?.position)
                quad_position.set(m2.quad.position, this.quad.position?.length ?? 0);
            let tri_position = new Float32Array((this.triangle?.position?.length ?? 0) + (m2.triangle?.position?.length ?? 0));
            if (this.triangle?.position)
                tri_position.set(this.triangle.position);
            if (m2.triangle?.position)
                tri_position.set(m2.triangle.position, this.triangle.position?.length ?? 0);
            let ret = new FaceMesh({});
            if (quad_position.length)
                ret.quad = { position: quad_position };
            if (tri_position.length)
                ret.triangle = { position: tri_position };
            if (this.quad?.normal && m2.quad?.normal) {
                let normal = new Float32Array((this.quad?.normal?.length ?? 0) + (m2.quad?.normal?.length ?? 0));
                if (this.quad?.normal)
                    normal.set(this.quad.normal);
                if (m2.quad?.normal)
                    normal.set(m2.quad.normal, this.quad?.normal?.length ?? 0);
                ret.quad.normal = normal;
            }
            if (this.triangle?.normal && m2.triangle?.normal) {
                let normal = new Float32Array((this.triangle?.normal?.length ?? 0) + (m2.triangle?.normal?.length ?? 0));
                if (this.triangle?.normal)
                    normal.set(this.triangle.normal);
                if (m2.triangle?.normal)
                    normal.set(m2.triangle.normal, this.triangle?.normal?.length ?? 0);
                ret.triangle.normal = normal;
            }
            if (this.quad?.uvw && m2.quad?.uvw) {
                let uvw = new Float32Array((this.quad?.uvw?.length ?? 0) + (m2.quad?.uvw?.length ?? 0));
                if (this.quad?.uvw)
                    uvw.set(this.quad.uvw);
                if (m2.quad?.uvw)
                    uvw.set(m2.quad.uvw, this.quad?.uvw?.length ?? 0);
                ret.quad.uvw = uvw;
            }
            if (this.triangle?.uvw && m2.triangle?.uvw) {
                let uvw = new Float32Array((this.triangle?.uvw?.length ?? 0) + (m2.triangle?.uvw?.length ?? 0));
                if (this.triangle?.uvw)
                    uvw.set(this.triangle.uvw);
                if (m2.triangle?.uvw)
                    uvw.set(m2.triangle.uvw, this.triangle?.uvw?.length ?? 0);
                ret.triangle.uvw = uvw;
            }
            return ret;
        }
        setConstantNormal(n) {
            if (this.quad) {
                let len = this.quad.count << 4;
                this.quad.normal ??= new Float32Array(len);
                for (let i = 0; i < len; i += 4)
                    n.writeBuffer(this.quad.normal, i);
            }
            if (this.triangle) {
                let len = this.triangle.count * 12;
                this.triangle.normal ??= new Float32Array(len);
                for (let i = 0; i < len; i += 4)
                    n.writeBuffer(this.triangle.normal, i);
            }
            return this;
        }
    }
    class FaceIndexMesh {
        position;
        normal;
        uvw;
        quad;
        triangle;
        constructor(d) {
            this.quad = d.quad;
            this.triangle = d.triangle;
            this.position = d.position;
            this.normal = d.normal;
            this.uvw = d.uvw;
        }
        applyAffineMat4(am) {
            applyAffineMat4(this, am);
            return this;
        }
        applyObj4(obj4) {
            applyObj4(this, obj4);
            return this;
        }
        toNonIndexMesh() {
            let out = new FaceMesh({});
            if (this.quad) {
                let count = this.quad.position.length << 2;
                out.quad = {
                    position: new Float32Array(count),
                    count: count >> 4
                };
                toNonIndex(this.position, this.quad.position, out.quad.position, 4);
                if (this.normal) {
                    out.quad.normal = new Float32Array(count);
                    toNonIndex(this.normal, this.quad.normal, out.quad.normal, 4);
                }
                if (this.uvw) {
                    out.quad.uvw = new Float32Array(count);
                    toNonIndex(this.uvw, this.quad.uvw, out.quad.uvw, 4);
                }
            }
            if (this.triangle) {
                let count = this.triangle.position.length << 2;
                out.triangle = {
                    position: new Float32Array(count),
                    count: count / 12
                };
                toNonIndex(this.position, this.triangle.position, out.triangle.position, 4);
                if (this.normal) {
                    out.triangle.normal = new Float32Array(count);
                    toNonIndex(this.normal, this.triangle.normal, out.triangle.normal, 4);
                }
                if (this.uvw) {
                    out.triangle.uvw = new Float32Array(count);
                    toNonIndex(this.uvw, this.triangle.uvw, out.triangle.uvw, 4);
                }
            }
            return out;
        }
        clone() {
            let ret = new FaceIndexMesh({ position: this.position.slice(0) });
            if (this.uvw)
                ret.uvw = this.uvw.slice(0);
            if (this.normal)
                ret.normal = this.normal.slice(0);
            if (this.quad) {
                ret.quad = {
                    position: this.quad.position.slice(0)
                };
                if (this.quad.count)
                    ret.quad.count = this.quad.count;
                if (this.quad.normal)
                    ret.quad.normal = this.quad.normal.slice(0);
                if (this.quad.uvw)
                    ret.quad.uvw = this.quad.uvw.slice(0);
            }
            if (this.triangle) {
                ret.triangle = {
                    position: this.triangle.position.slice(0)
                };
                if (this.triangle.count)
                    ret.triangle.count = this.triangle.count;
                if (this.triangle.normal)
                    ret.triangle.normal = this.triangle.normal.slice(0);
                if (this.triangle.uvw)
                    ret.triangle.uvw = this.triangle.uvw.slice(0);
            }
            return ret;
        }
        setConstantNormal(n) {
            this.normal = new Float32Array([n.x, n.y, n.z, n.w]);
            if (this.quad) {
                this.quad.normal ??= new Uint32Array(this.quad.count << 2);
                this.quad.normal.fill(0);
            }
            if (this.triangle) {
                this.triangle.normal ??= new Uint32Array(this.triangle.count * 3);
                this.triangle.normal.fill(0);
            }
            return this;
        }
        concat(m2) {
            let position = new Float32Array(this.position.length + m2.position.length);
            position.set(this.position);
            position.set(m2.position, this.position.length);
            let ret = new FaceIndexMesh({ position });
            if (this.normal && m2.normal) {
                let normal = new Float32Array(this.normal.length + m2.normal.length);
                normal.set(this.normal);
                normal.set(m2.normal, this.normal.length);
                ret.normal = normal;
            }
            if (this.uvw && m2.uvw) {
                let uvw = new Float32Array(this.uvw.length + m2.uvw.length);
                uvw.set(this.uvw);
                uvw.set(m2.uvw, this.uvw.length);
                ret.uvw = uvw;
            }
            // index array concat
            if (this.quad || m2.quad) {
                let quadCount1 = (this.quad?.count << 2) || (this.quad?.position?.length ?? 0);
                let quadCount2 = (this.quad?.count << 2) || (this.quad?.position?.length ?? 0);
                let quadCount = quadCount1 + quadCount2;
                let qp = new Uint32Array(quadCount);
                let hasN = !((this.quad && !this.quad.normal) || (m2.quad && !m2.quad.normal));
                let hasU = !((this.quad && !this.quad.uvw) || (m2.quad && !m2.quad.uvw));
                let qn = hasN ? new Uint32Array(quadCount) : null;
                let qu = hasU ? new Uint32Array(quadCount) : null;
                ret.quad = { position: qp, count: quadCount >> 2 };
                if (this.quad?.position) {
                    qp.set(this.quad.position.subarray(0, quadCount1));
                    if (hasN) {
                        qn.set(this.quad.normal.subarray(0, quadCount1));
                        ret.quad.normal = qn;
                    }
                    if (hasU) {
                        qu.set(this.quad.uvw.subarray(0, quadCount1));
                        ret.quad.uvw = qu;
                    }
                }
                if (m2.quad?.position) {
                    qp.set(m2.quad.position.subarray(0, quadCount2), quadCount1);
                    if (hasN)
                        qn.set(m2.quad.normal.subarray(0, quadCount2), quadCount1);
                    if (hasU)
                        qu.set(m2.quad.uvw.subarray(0, quadCount2), quadCount1);
                    if (quadCount1) {
                        for (let i = quadCount1; i < quadCount; i++) {
                            qp[i] += this.position.length >> 2;
                            if (hasN)
                                qn[i] += this.normal.length >> 2;
                            if (hasU)
                                qu[i] += this.uvw.length >> 2;
                        }
                    }
                }
            }
            if (this.triangle || m2.triangle) {
                let triangleCount1 = (this.triangle?.count * 3) || (this.triangle?.position?.length ?? 0);
                let triangleCount2 = (this.triangle?.count * 3) || (this.triangle?.position?.length ?? 0);
                let triangleCount = triangleCount1 + triangleCount2;
                let qp = new Uint32Array(triangleCount);
                let hasN = !((this.triangle && !this.triangle.normal) || (m2.triangle && !m2.triangle.normal));
                let hasU = !((this.triangle && !this.triangle.uvw) || (m2.triangle && !m2.triangle.uvw));
                let qn = hasN ? new Uint32Array(triangleCount) : null;
                let qu = hasU ? new Uint32Array(triangleCount) : null;
                ret.triangle = { position: qp, count: Math.round(triangleCount / 3) };
                if (this.triangle?.position) {
                    qp.set(this.triangle.position.subarray(0, triangleCount1));
                    if (hasN) {
                        qn.set(this.triangle.normal.subarray(0, triangleCount1));
                        ret.triangle.normal = qn;
                    }
                    if (hasU) {
                        qu.set(this.triangle.uvw.subarray(0, triangleCount1));
                        ret.triangle.uvw = qu;
                    }
                }
                if (m2.triangle?.position) {
                    qp.set(m2.triangle.position.subarray(0, triangleCount2), triangleCount1);
                    if (hasN)
                        qn.set(m2.triangle.normal.subarray(0, triangleCount2), triangleCount1);
                    if (hasU)
                        qu.set(m2.triangle.uvw.subarray(0, triangleCount2), triangleCount1);
                    if (triangleCount1) {
                        for (let i = triangleCount1; i < triangleCount; i++) {
                            qp[i] += this.position.length >> 2;
                            if (hasN)
                                qn[i] += this.normal.length >> 2;
                            if (hasU)
                                qu[i] += this.uvw.length >> 2;
                        }
                    }
                }
            }
            return ret;
        }
    }
    function applyAffineMat4(m, am) {
        let vp = new Vec4();
        if (m.position) {
            const mesh = m;
            for (let i = 0; i < mesh.position.length; i += 4) {
                vp.set(mesh.position[i], mesh.position[i + 1], mesh.position[i + 2], mesh.position[i + 3]).mulmatls(am.mat).adds(am.vec).writeBuffer(mesh.position, i);
                if (mesh.normal) {
                    vp.set(mesh.normal[i], mesh.normal[i + 1], mesh.normal[i + 2], mesh.normal[i + 3]).mulmatls(am.mat).writeBuffer(mesh.position, i);
                }
            }
            return mesh;
        }
        else {
            const mesh = m;
            let position = mesh.triangle?.position;
            for (let i = 0; i < position?.length; i += 4) {
                vp.set(position[i], position[i + 1], position[i + 2], position[i + 3]).mulmatls(am.mat).adds(am.vec).writeBuffer(position, i);
                let normal = mesh.triangle?.normal;
                if (normal) {
                    vp.set(normal[i], normal[i + 1], normal[i + 2], normal[i + 3]).mulmatls(am.mat).writeBuffer(normal, i);
                }
            }
            position = mesh.quad?.position;
            for (let i = 0; i < position?.length; i += 4) {
                vp.set(position[i], position[i + 1], position[i + 2], position[i + 3]).mulmatls(am.mat).adds(am.vec).writeBuffer(position, i);
                let normal = mesh.quad?.normal;
                if (normal) {
                    vp.set(normal[i], normal[i + 1], normal[i + 2], normal[i + 3]).mulmatls(am.mat).writeBuffer(normal, i);
                }
            }
            return mesh;
        }
    }
    function applyObj4(mesh, obj) {
        let vp = new Vec4();
        let scaleinv;
        if (obj.scale && (mesh.normal || mesh.quad?.normal || mesh.triangle?.normal)) {
            scaleinv = new Vec4(1 / obj.scale.x, 1 / obj.scale.y, 1 / obj.scale.z, 1 / obj.scale.w);
        }
        if (mesh.position) {
            const m = mesh;
            for (let i = 0; i < m.position.length; i += 4) {
                if (obj.scale) {
                    vp.set(m.position[i] * obj.scale.x, m.position[i + 1] * obj.scale.y, m.position[i + 2] * obj.scale.z, m.position[i + 3] * obj.scale.w).rotates(obj.rotation).adds(obj.position).writeBuffer(m.position, i);
                    if (m.normal) {
                        vp.set(m.normal[i] * scaleinv.x, m.normal[i + 1] * scaleinv.y, m.normal[i + 2] * scaleinv.z, m.normal[i + 3] * scaleinv.w).rotates(obj.rotation).norms().writeBuffer(m.normal, i);
                    }
                }
                else {
                    vp.set(m.position[i], m.position[i + 1], m.position[i + 2], m.position[i + 3]).rotates(obj.rotation).adds(obj.position).writeBuffer(m.position, i);
                    if (m.normal) {
                        vp.set(m.normal[i], m.normal[i + 1], m.normal[i + 2], m.normal[i + 3]).rotates(obj.rotation).writeBuffer(m.normal, i);
                    }
                }
            }
        }
        else {
            for (let i = 0; i < mesh.quad?.position.length; i += 4) {
                if (obj.scale) {
                    vp.set(mesh.quad.position[i] * obj.scale.x, mesh.quad.position[i + 1] * obj.scale.y, mesh.quad.position[i + 2] * obj.scale.z, mesh.quad.position[i + 3] * obj.scale.w).rotates(obj.rotation).adds(obj.position).writeBuffer(mesh.quad.position, i);
                    if (mesh.quad.normal) {
                        vp.set(mesh.quad.normal[i] * scaleinv.x, mesh.quad.normal[i + 1] * scaleinv.y, mesh.quad.normal[i + 2] * scaleinv.z, mesh.quad.normal[i + 3] * scaleinv.w).rotates(obj.rotation).norms().writeBuffer(mesh.quad.normal, i);
                    }
                }
                else {
                    vp.set(mesh.quad.position[i], mesh.quad.position[i + 1], mesh.quad.position[i + 2], mesh.quad.position[i + 3]).rotates(obj.rotation).adds(obj.position).writeBuffer(mesh.quad.position, i);
                    if (mesh.quad.normal) {
                        vp.set(mesh.quad.normal[i], mesh.quad.normal[i + 1], mesh.quad.normal[i + 2], mesh.quad.normal[i + 3]).rotates(obj.rotation).writeBuffer(mesh.quad.normal, i);
                    }
                }
            }
            for (let i = 0; i < mesh.triangle?.position.length; i += 4) {
                if (obj.scale) {
                    vp.set(mesh.triangle.position[i] * obj.scale.x, mesh.triangle.position[i + 1] * obj.scale.y, mesh.triangle.position[i + 2] * obj.scale.z, mesh.triangle.position[i + 3] * obj.scale.w).rotates(obj.rotation).adds(obj.position).writeBuffer(mesh.triangle.position, i);
                    if (mesh.triangle.normal) {
                        vp.set(mesh.triangle.normal[i] * scaleinv.x, mesh.triangle.normal[i + 1] * scaleinv.y, mesh.triangle.normal[i + 2] * scaleinv.z, mesh.triangle.normal[i + 3] * scaleinv.w).rotates(obj.rotation).norms().writeBuffer(mesh.triangle.normal, i);
                    }
                }
                else {
                    vp.set(mesh.triangle.position[i], mesh.triangle.position[i + 1], mesh.triangle.position[i + 2], mesh.triangle.position[i + 3]).rotates(obj.rotation).adds(obj.position).writeBuffer(mesh.triangle.position, i);
                    if (mesh.triangle.normal) {
                        vp.set(mesh.triangle.normal[i], mesh.triangle.normal[i + 1], mesh.triangle.normal[i + 2], mesh.triangle.normal[i + 3]).rotates(obj.rotation).writeBuffer(mesh.triangle.normal, i);
                    }
                }
            }
        }
        return mesh;
    }
    // todo
    // export function concat(meshes: (FaceMesh | FaceIndexMesh)[]): FaceMesh | FaceIndexMesh {
    //     let hasPosition = false;
    //     for (let i = 0; i < meshes.length; i++) {
    //         let cur = typeof (meshes[i] as FaceIndexMesh).position !== "undefined";
    //         if (i) {
    //             if (hasPosition !== cur) {
    //                 console.error("Meshes must all be indexed or non-indexed.");
    //                 return {};
    //             }
    //         }
    //         hasPosition = cur;
    //     }
    //     if (!meshes.length) return {};
    //     if ((meshes[0] as FaceIndexMesh).position) {
    //         let length = 0;
    //         let hasNormal = true;
    //         let hasUvw = true;
    //         const ms = meshes as FaceIndexMesh[];
    //         for (let i = 0; i < ms.length; i++) {
    //             length += ms[i].position.length;
    //             hasUvw = hasUvw && (ms[i].uvw ? true : false);
    //             hasNormal = hasNormal && (ms[i].normal ? true : false);
    //         }
    //         let position = new Float32Array(length);
    //         let ret: FaceIndexMesh = { position };
    //         let normal: Float32Array, uvw: Float32Array;
    //         if (hasNormal) {
    //             normal = new Float32Array(length);
    //             ret.normal = normal;
    //         }
    //         if (hasUvw) {
    //             uvw = new Float32Array(length);
    //             ret.uvw = uvw;
    //         }
    //         length = 0;
    //         for (let i = 0; i < meshes.length; i++) {
    //             position.set(meshes[i].position, length);
    //             if (hasNormal) {
    //                 normal.set(meshes[i].normal, length);
    //             }
    //             if (hasUvw) {
    //                 uvw.set(meshes[i].uvw, length);
    //             }
    //             length += meshes[i].position.length;
    //         }
    //         return ret;
    //     }
    // }

    let square = new FaceMesh({
        quad: {
            normal: new Float32Array([0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0]),
            position: new Float32Array([-1, 0, -1, 0, -1, 0, 1, 0, 1, 0, 1, 0, 1, 0, -1, 0]),
            uvw: new Float32Array([0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0]),
        }
    });
    function cube$1() {
        let rotor = new Rotor();
        let biv = new Bivec();
        let yface = square.clone().applyObj4(new Obj4(Vec4.y, rotor.expset(biv.set(0, _90))));
        let meshes = [
            biv.set(_90).exp(),
            biv.set(-_90).exp(),
            biv.set(0, 0, 0, _90).exp().mulsl(rotor.expset(biv.set(_90, 0, 0, 0, 0))),
            biv.set(0, 0, 0, -_90).exp().mulsl(rotor.expset(biv.set(_90, 0, 0, 0, 0))),
            biv.set(_180).exp(),
        ].map(r => yface.clone().applyObj4(new Obj4(new Vec4(), r)));
        for (const m of meshes)
            yface = yface.concat(m);
        let m = yface;
        // for (let i = 0; i < 6; i++) {
        //     for (let j = 0; j < 8; j++) {
        //         m.uvw[i * 80 + j * 4 + 2] = i;
        //     }
        // }
        return m;
    }
    function sphere$1(radius, u, v, uAngle = _360, vAngle = _180) {
        if (u < 3)
            u = 3;
        if (v < 3)
            v = 3;
        return parametricSurface$1((uvw, pos, norm) => {
            let u = uvw.x * uAngle;
            let v = uvw.y * vAngle;
            let sv = Math.sin(v);
            let cv = Math.cos(v);
            norm.set(sv * Math.cos(u), sv * Math.sin(u), cv, 0);
            sv *= radius;
            pos.set(sv * Math.cos(u), sv * Math.sin(u), cv * radius, 0);
        }, u, v);
    }
    function polygon(points) {
        //todo: concave polygon
        const len = points.length;
        if (len < 3)
            console.error(`Polygon must have at least 3 points, ${len} points found`);
        const ret = new FaceIndexMesh({
            position: new Float32Array(len << 2),
            uvw: new Float32Array(len << 2),
            triangle: {
                position: new Uint32Array(len * 3 - 6),
                uvw: new Uint32Array(len * 3 - 6),
                count: len - 2
            }
        });
        let offset = 0;
        for (let i = 0; i < len; i++) {
            points[i].writeBuffer(ret.position, i << 2);
            points[i].writeBuffer(ret.uvw, i << 2);
            if (i > 1) {
                ret.triangle.position[offset++] = 0;
                ret.triangle.position[offset++] = i;
                ret.triangle.position[offset++] = i - 1;
                offset -= 3;
                ret.triangle.uvw[offset++] = 0;
                ret.triangle.uvw[offset++] = i;
                ret.triangle.uvw[offset++] = i - 1;
            }
        }
        // ret.position
        return ret;
    }
    function circle(radius, segment) {
        return polygon(new Array(segment).fill(0).map((_, i) => new Vec4(Math.cos(i / segment * _360) * radius, Math.sin(i / segment * _360) * radius)));
    }
    function parametricSurface$1(fn, uSegment, vSegment) {
        if (uSegment < 1)
            uSegment = 1;
        if (vSegment < 1)
            vSegment = 1;
        let arraySize = vSegment * vSegment << 4;
        uSegment++;
        vSegment++;
        let uvw_seg = uSegment * uSegment;
        let positions = new Float32Array((uvw_seg) << 2);
        let normals = new Float32Array((uvw_seg) << 2);
        let uvws = new Float32Array((uvw_seg) << 2);
        let position = new Float32Array(arraySize);
        let normal = new Float32Array(arraySize);
        let uvw = new Float32Array(arraySize);
        let inputuvw = new Vec2;
        let outputVertex = new Vec4;
        let outputNormal = new Vec4;
        let ptr = 0;
        let idxPtr = 0;
        function pushIdx(i) {
            position[idxPtr++] = positions[i];
            position[idxPtr++] = positions[i + 1];
            position[idxPtr++] = positions[i + 2];
            position[idxPtr++] = positions[i + 3];
            idxPtr -= 4;
            normal[idxPtr++] = normals[i];
            normal[idxPtr++] = normals[i + 1];
            normal[idxPtr++] = normals[i + 2];
            normal[idxPtr++] = normals[i + 3];
            idxPtr -= 4;
            uvw[idxPtr++] = uvws[i];
            uvw[idxPtr++] = uvws[i + 1];
            uvw[idxPtr++] = uvws[i + 2];
            uvw[idxPtr++] = uvws[i + 3];
        }
        for (let u_index = 0; u_index < uSegment; u_index++) {
            inputuvw.x = u_index / (uSegment - 1);
            let offset = vSegment * u_index;
            for (let v_index = 0; v_index < vSegment; v_index++, offset++) {
                inputuvw.y = v_index / (vSegment - 1);
                fn(inputuvw, outputVertex, outputNormal);
                positions[ptr++] = outputVertex.x;
                positions[ptr++] = outputVertex.y;
                positions[ptr++] = outputVertex.z;
                positions[ptr++] = outputVertex.w;
                ptr -= 4;
                normals[ptr++] = outputNormal.x;
                normals[ptr++] = outputNormal.y;
                normals[ptr++] = outputNormal.z;
                normals[ptr++] = outputNormal.w;
                ptr -= 4;
                uvws[ptr++] = inputuvw.x;
                uvws[ptr++] = inputuvw.y;
                uvws[ptr++] = 0;
                uvws[ptr++] = 0;
                if (u_index && v_index) {
                    // todo: if same -> no push or push to triangle
                    pushIdx(offset << 2);
                    pushIdx(offset - 1 << 2);
                    pushIdx(offset - vSegment << 2);
                    pushIdx(offset - vSegment - 1 << 2);
                }
            }
        }
        return new FaceMesh({
            quad: { position, normal, uvw }
        });
    }
    /** m must be a manifold or manifold with border */
    function findBorder(m) {
        if (!m.position)
            console.error("findBorder can onnly apply to FaceIndexMesh.");
        let borders = [];
        for (let i = 0, l = m.quad?.position?.length; i < l; i += 4) {
            let p = m.quad.position;
            pushBorder(p[i], p[i + 1]);
            pushBorder(p[i + 1], p[i + 2]);
            pushBorder(p[i + 2], p[i + 3]);
            pushBorder(p[i + 3], p[i]);
        }
        for (let i = 0, l = m.triangle?.position?.length; i < l; i += 3) {
            let p = m.triangle.position;
            pushBorder(p[i], p[i + 1]);
            pushBorder(p[i + 1], p[i + 2]);
            pushBorder(p[i + 2], p[i]);
        }
        function pushBorder(a, b) {
            let count = 0;
            let found = false;
            for (let [j, k] of borders) {
                if (j === b && k === a) {
                    found = true;
                    break;
                }
                if (j === a && k === b) {
                    found = true;
                    console.warn("findBorder: Non manifold mesh found.");
                    break;
                }
                count++;
            }
            if (found) {
                borders.splice(count, 1);
            }
            else {
                borders.push([a, b]);
            }
        }
        return borders;
    }

    var face = /*#__PURE__*/Object.freeze({
        __proto__: null,
        FaceIndexMesh: FaceIndexMesh,
        FaceMesh: FaceMesh,
        circle: circle,
        cube: cube$1,
        findBorder: findBorder,
        parametricSurface: parametricSurface$1,
        polygon: polygon,
        sphere: sphere$1,
        square: square
    });

    let cube = new TetraMesh({
        position: new Float32Array([
            1, 0, -1, -1,
            1, 0, 1, 1,
            -1, 0, -1, 1,
            -1, 0, 1, -1,
            -1, 0, -1, -1,
            1, 0, -1, -1,
            -1, 0, -1, 1,
            -1, 0, 1, -1,
            1, 0, 1, 1,
            -1, 0, 1, 1,
            -1, 0, -1, 1,
            -1, 0, 1, -1,
            1, 0, 1, 1,
            1, 0, -1, -1,
            1, 0, 1, -1,
            -1, 0, 1, -1,
            1, 0, 1, 1,
            1, 0, -1, -1,
            -1, 0, -1, 1,
            1, 0, -1, 1,
        ]),
        normal: new Float32Array([
            0, 1, 0, 0,
            0, 1, 0, 0,
            0, 1, 0, 0,
            0, 1, 0, 0,
            0, 1, 0, 0,
            0, 1, 0, 0,
            0, 1, 0, 0,
            0, 1, 0, 0,
            0, 1, 0, 0,
            0, 1, 0, 0,
            0, 1, 0, 0,
            0, 1, 0, 0,
            0, 1, 0, 0,
            0, 1, 0, 0,
            0, 1, 0, 0,
            0, 1, 0, 0,
            0, 1, 0, 0,
            0, 1, 0, 0,
            0, 1, 0, 0,
            0, 1, 0, 0,
        ]),
        uvw: new Float32Array([
            1, -1, -1, 0,
            1, 1, 1, 0,
            -1, -1, 1, 0,
            -1, 1, -1, 0,
            -1, -1, -1, 0,
            1, -1, -1, 0,
            -1, -1, 1, 0,
            -1, 1, -1, 0,
            1, 1, 1, 0,
            -1, 1, 1, 0,
            -1, -1, 1, 0,
            -1, 1, -1, 0,
            1, 1, 1, 0,
            1, -1, -1, 0,
            1, 1, -1, 0,
            -1, 1, -1, 0,
            1, 1, 1, 0,
            1, -1, -1, 0,
            -1, -1, 1, 0,
            1, -1, 1, 0,
        ]),
        count: 5
    });
    function tesseract() {
        let rotor = new Rotor();
        let biv = new Bivec();
        let yface = cube.clone().applyObj4(new Obj4(Vec4.y, rotor.expset(biv.set(0, _90))));
        let meshes = [
            biv.set(_90).exp(),
            biv.set(-_90).exp().mulsl(rotor.expset(biv.set(0, 0, 0, 0, _180))),
            biv.set(0, 0, 0, _90).exp().mulsl(rotor.expset(biv.set(_90, 0, 0, 0, 0))),
            biv.set(0, 0, 0, -_90).exp().mulsl(rotor.expset(biv.set(_90, 0, 0, 0, 0))),
            biv.set(0, 0, 0, 0, _90).exp().mulsl(rotor.expset(biv.set(_90, 0, 0, 0, 0))),
            biv.set(0, 0, 0, 0, -_90).exp().mulsl(rotor.expset(biv.set(_90, 0, 0, 0, 0))),
            biv.set(_180).exp(),
        ].map(r => yface.clone().applyObj4(new Obj4(new Vec4(), r)));
        meshes.push(yface);
        let m = concat(meshes);
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 20; j++) {
                m.uvw[i * 80 + j * 4 + 3] = i;
            }
        }
        return m;
    }
    let hexadecachoron = new TetraMesh({
        position: new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
            0, 1, 0, 0,
            1, 0, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, -1,
            0, 1, 0, 0,
            1, 0, 0, 0,
            0, 0, -1, 0,
            0, 0, 0, 1,
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, -1, 0,
            0, 0, 0, -1,
            0, -1, 0, 0,
            1, 0, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
            1, 0, 0, 0,
            0, -1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, -1,
            1, 0, 0, 0,
            0, -1, 0, 0,
            0, 0, -1, 0,
            0, 0, 0, 1,
            0, -1, 0, 0,
            1, 0, 0, 0,
            0, 0, -1, 0,
            0, 0, 0, -1,
            0, 1, 0, 0,
            -1, 0, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
            -1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, -1,
            -1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, -1, 0,
            0, 0, 0, 1,
            0, 1, 0, 0,
            -1, 0, 0, 0,
            0, 0, -1, 0,
            0, 0, 0, -1,
            -1, 0, 0, 0,
            0, -1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
            0, -1, 0, 0,
            -1, 0, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, -1,
            0, -1, 0, 0,
            -1, 0, 0, 0,
            0, 0, -1, 0,
            0, 0, 0, 1,
            -1, 0, 0, 0,
            0, -1, 0, 0,
            0, 0, -1, 0,
            0, 0, 0, -1,
        ]),
        normal: new Float32Array([
            0.5, 0.5, 0.5, 0.5,
            0.5, 0.5, 0.5, 0.5,
            0.5, 0.5, 0.5, 0.5,
            0.5, 0.5, 0.5, 0.5,
            0.5, 0.5, 0.5, -0.5,
            0.5, 0.5, 0.5, -0.5,
            0.5, 0.5, 0.5, -0.5,
            0.5, 0.5, 0.5, -0.5,
            0.5, 0.5, -0.5, 0.5,
            0.5, 0.5, -0.5, 0.5,
            0.5, 0.5, -0.5, 0.5,
            0.5, 0.5, -0.5, 0.5,
            0.5, 0.5, -0.5, -0.5,
            0.5, 0.5, -0.5, -0.5,
            0.5, 0.5, -0.5, -0.5,
            0.5, 0.5, -0.5, -0.5,
            0.5, -0.5, 0.5, 0.5,
            0.5, -0.5, 0.5, 0.5,
            0.5, -0.5, 0.5, 0.5,
            0.5, -0.5, 0.5, 0.5,
            0.5, -0.5, 0.5, -0.5,
            0.5, -0.5, 0.5, -0.5,
            0.5, -0.5, 0.5, -0.5,
            0.5, -0.5, 0.5, -0.5,
            0.5, -0.5, -0.5, 0.5,
            0.5, -0.5, -0.5, 0.5,
            0.5, -0.5, -0.5, 0.5,
            0.5, -0.5, -0.5, 0.5,
            0.5, -0.5, -0.5, -0.5,
            0.5, -0.5, -0.5, -0.5,
            0.5, -0.5, -0.5, -0.5,
            0.5, -0.5, -0.5, -0.5,
            -0.5, 0.5, 0.5, 0.5,
            -0.5, 0.5, 0.5, 0.5,
            -0.5, 0.5, 0.5, 0.5,
            -0.5, 0.5, 0.5, 0.5,
            -0.5, 0.5, 0.5, -0.5,
            -0.5, 0.5, 0.5, -0.5,
            -0.5, 0.5, 0.5, -0.5,
            -0.5, 0.5, 0.5, -0.5,
            -0.5, 0.5, -0.5, 0.5,
            -0.5, 0.5, -0.5, 0.5,
            -0.5, 0.5, -0.5, 0.5,
            -0.5, 0.5, -0.5, 0.5,
            -0.5, 0.5, -0.5, -0.5,
            -0.5, 0.5, -0.5, -0.5,
            -0.5, 0.5, -0.5, -0.5,
            -0.5, 0.5, -0.5, -0.5,
            -0.5, -0.5, 0.5, 0.5,
            -0.5, -0.5, 0.5, 0.5,
            -0.5, -0.5, 0.5, 0.5,
            -0.5, -0.5, 0.5, 0.5,
            -0.5, -0.5, 0.5, -0.5,
            -0.5, -0.5, 0.5, -0.5,
            -0.5, -0.5, 0.5, -0.5,
            -0.5, -0.5, 0.5, -0.5,
            -0.5, -0.5, -0.5, 0.5,
            -0.5, -0.5, -0.5, 0.5,
            -0.5, -0.5, -0.5, 0.5,
            -0.5, -0.5, -0.5, 0.5,
            -0.5, -0.5, -0.5, -0.5,
            -0.5, -0.5, -0.5, -0.5,
            -0.5, -0.5, -0.5, -0.5,
            -0.5, -0.5, -0.5, -0.5,
        ]),
        uvw: new Float32Array([
            0, 0, 0, 0,
            1, 1, 0, 0,
            1, 0, 1, 0,
            0, 1, 1, 0,
            0, 0, 0, 1,
            1, 1, 0, 1,
            1, 0, 1, 1,
            0, 1, 1, 1,
            0, 0, 0, 2,
            1, 1, 0, 2,
            1, 0, 1, 2,
            0, 1, 1, 2,
            0, 0, 0, 3,
            1, 1, 0, 3,
            1, 0, 1, 3,
            0, 1, 1, 3,
            0, 0, 0, 4,
            1, 1, 0, 4,
            1, 0, 1, 4,
            0, 1, 1, 4,
            0, 0, 0, 5,
            1, 1, 0, 5,
            1, 0, 1, 5,
            0, 1, 1, 5,
            0, 0, 0, 6,
            1, 1, 0, 6,
            1, 0, 1, 6,
            0, 1, 1, 6,
            0, 0, 0, 7,
            1, 1, 0, 7,
            1, 0, 1, 7,
            0, 1, 1, 7,
            0, 0, 0, 8,
            1, 1, 0, 8,
            1, 0, 1, 8,
            0, 1, 1, 8,
            0, 0, 0, 9,
            1, 1, 0, 9,
            1, 0, 1, 9,
            0, 1, 1, 9,
            0, 0, 0, 10,
            1, 1, 0, 10,
            1, 0, 1, 10,
            0, 1, 1, 10,
            0, 0, 0, 11,
            1, 1, 0, 11,
            1, 0, 1, 11,
            0, 1, 1, 11,
            0, 0, 0, 12,
            1, 1, 0, 12,
            1, 0, 1, 12,
            0, 1, 1, 12,
            0, 0, 0, 13,
            1, 1, 0, 13,
            1, 0, 1, 13,
            0, 1, 1, 13,
            0, 0, 0, 14,
            1, 1, 0, 14,
            1, 0, 1, 14,
            0, 1, 1, 14,
            0, 0, 0, 15,
            1, 1, 0, 15,
            1, 0, 1, 15,
            0, 1, 1, 15,
        ]),
        count: 16
    });
    function glome(radius, xySegment, zwSegment, latitudeSegment) {
        if (xySegment < 3)
            xySegment = 3;
        if (zwSegment < 3)
            zwSegment = 3;
        if (latitudeSegment < 1)
            latitudeSegment = 1;
        return parametricSurface((uvw, pos, norm) => {
            let u = uvw.x * _360;
            let v = uvw.y * _360;
            let w = uvw.z * _90;
            let cos = Math.cos(w) * radius;
            let sin = Math.sin(w) * radius;
            pos.set(-Math.cos(u) * cos, Math.sin(u) * cos, Math.cos(v) * sin, Math.sin(v) * sin);
            norm.copy(pos);
        }, xySegment, zwSegment, latitudeSegment);
    }
    function spheritorus(sphereRadius, longitudeSegment, latitudeSegment, circleRadius, circleSegment) {
        if (longitudeSegment < 3)
            longitudeSegment = 3;
        if (latitudeSegment < 3)
            latitudeSegment = 3;
        if (circleSegment < 3)
            circleSegment = 3;
        return parametricSurface((uvw, pos, norm) => {
            let u = uvw.x * _360;
            let v = uvw.y * _180;
            let w = uvw.z * _360;
            let sv = Math.sin(v);
            let radius = circleRadius + sv * Math.cos(u) * sphereRadius;
            let sw = Math.sin(w) * radius;
            let cw = Math.cos(w) * radius;
            pos.set(-cw, sv * Math.sin(u) * sphereRadius, Math.cos(v) * sphereRadius, sw);
            norm.set(-sv * Math.cos(u) * Math.cos(w), sv * Math.sin(u), Math.cos(v), sv * Math.cos(u) * Math.sin(w));
        }, longitudeSegment, latitudeSegment, circleSegment);
    }
    function torisphere(circleRadius, circleSegment, sphereRadius, longitudeSegment, latitudeSegment) {
        if (longitudeSegment < 3)
            longitudeSegment = 3;
        if (latitudeSegment < 3)
            latitudeSegment = 3;
        if (circleSegment < 3)
            circleSegment = 3;
        return parametricSurface((uvw, pos, norm) => {
            let u = -uvw.x * _360;
            let v = uvw.y * _180;
            let w = uvw.z * _360;
            let sv = Math.sin(v);
            let cw = Math.cos(w);
            let radius = circleRadius * cw + sphereRadius;
            pos.set(sv * Math.cos(u) * radius, circleRadius * Math.sin(w), sv * Math.sin(u) * radius, Math.cos(v) * radius);
            norm.set(sv * Math.cos(u) * cw, Math.sin(w), sv * Math.sin(u) * cw, Math.cos(v) * cw);
        }, longitudeSegment, latitudeSegment, circleSegment);
    }
    function spherinderSide(radius1, radius2, longitudeSegment, latitudeSegment, height, heightSegment = 1) {
        if (longitudeSegment < 3)
            longitudeSegment = 3;
        if (latitudeSegment < 3)
            latitudeSegment = 3;
        if (heightSegment < 1)
            heightSegment = 1;
        const avgRadius = (radius1 + radius2) * 0.5;
        const len = 1 / Math.hypot(radius2 - radius1, height);
        // const slope = (radius2 - radius1) / height;
        const sinS = (radius2 - radius1) * len;
        const cosS = height * len;
        return parametricSurface((uvw, pos, norm) => {
            let u = uvw.x * _180;
            let v = uvw.y * _360;
            let w = uvw.z - 0.5;
            let radius = avgRadius + (radius2 - radius1) * w;
            let su = Math.sin(u);
            let cu = Math.cos(u);
            pos.set(Math.sin(v) * su * radius, Math.cos(v) * su * radius, -cu * radius, w * height);
            su *= cosS;
            // norm.set(Math.sin(v) * cu, Math.cos(v) * cu, su, 0);
            norm.set(Math.sin(v) * su, Math.cos(v) * su, -cosS * cu, -sinS);
        }, longitudeSegment, latitudeSegment, heightSegment);
    }
    function sphere(radius, u, v) {
        return rotatoid(Bivec.yz, polygon(new Array(u).fill(0).map((_, i) => new Vec4(Math.cos(i / (u - 1) * _180) * radius, Math.sin(i / (u - 1) * _180) * radius))).toNonIndexMesh().setConstantNormal(Vec4.w), v);
    }
    function tiger(xyRadius, xySegment, zwRadius, zwSegment, secondaryRadius, secondarySegment) {
        if (xySegment < 3)
            xySegment = 3;
        if (zwSegment < 3)
            zwSegment = 3;
        if (secondarySegment < 3)
            secondarySegment = 3;
        return parametricSurface((uvw, pos, norm) => {
            let u = uvw.x * _360;
            let v = uvw.y * _360;
            let w = uvw.z * _360;
            let su = Math.sin(w);
            let cu = Math.cos(w);
            pos.set((su * secondaryRadius + xyRadius) * Math.sin(u), (su * secondaryRadius + xyRadius) * Math.cos(u), (cu * secondaryRadius + zwRadius) * Math.sin(v), (cu * secondaryRadius + zwRadius) * Math.cos(v));
            norm.set(su * Math.sin(u), su * Math.cos(u), cu * Math.sin(v), cu * Math.cos(v));
        }, xySegment, zwSegment, secondarySegment);
    }
    function ditorus(majorRadius, majorSegment, middleRadius, middleSegment, minorRadius, minorSegment) {
        if (majorSegment < 3)
            majorSegment = 3;
        if (middleSegment < 3)
            middleSegment = 3;
        if (minorSegment < 3)
            minorSegment = 3;
        return parametricSurface((uvw, pos, norm) => {
            let u = uvw.x * _360;
            let v = uvw.y * _360;
            let w = uvw.z * _360;
            let cw = Math.cos(w);
            const R2 = middleRadius + minorRadius * cw;
            const R1 = majorRadius + R2 * Math.cos(v);
            pos.set(R1 * Math.cos(u), R1 * Math.sin(u), R2 * Math.sin(v), minorRadius * Math.sin(w));
            norm.set(cw * Math.cos(v) * Math.cos(u), cw * Math.cos(v) * Math.sin(u), cw * Math.sin(v), Math.sin(w));
        }, majorSegment, middleSegment, minorSegment);
    }
    function parametricSurface(fn, uSegment, vSegment, wSegment) {
        if (uSegment < 1)
            uSegment = 1;
        if (vSegment < 1)
            vSegment = 1;
        if (wSegment < 1)
            wSegment = 1;
        let count = uSegment * vSegment * wSegment * 5;
        let arraySize = count << 4;
        uSegment++;
        vSegment++;
        wSegment++;
        let vw_seg = vSegment * wSegment;
        let uvw_seg = uSegment * vw_seg;
        let positions = new Float32Array((uvw_seg) << 2);
        let normals = new Float32Array((uvw_seg) << 2);
        let uvws = new Float32Array((uvw_seg) << 2);
        let position = new Float32Array(arraySize);
        let normal = new Float32Array(arraySize);
        let uvw = new Float32Array(arraySize);
        let inputUVW = new Vec3;
        let idxbuffer = new Uint32Array(8);
        let outputVertex = new Vec4;
        let outputNormal = new Vec4;
        let ptr = 0;
        let idxPtr = 0;
        function pushIdx(i) {
            position[idxPtr++] = positions[i];
            position[idxPtr++] = positions[i + 1];
            position[idxPtr++] = positions[i + 2];
            position[idxPtr++] = positions[i + 3];
            idxPtr -= 4;
            normal[idxPtr++] = normals[i];
            normal[idxPtr++] = normals[i + 1];
            normal[idxPtr++] = normals[i + 2];
            normal[idxPtr++] = normals[i + 3];
            idxPtr -= 4;
            uvw[idxPtr++] = uvws[i];
            uvw[idxPtr++] = uvws[i + 1];
            uvw[idxPtr++] = uvws[i + 2];
            uvw[idxPtr++] = uvws[i + 3];
        }
        function pushTetra(a, b, c, d) {
            a = idxbuffer[a];
            b = idxbuffer[b];
            c = idxbuffer[c];
            d = idxbuffer[d];
            function same(offset1, offset2) {
                return positions[offset1] === positions[offset2] &&
                    positions[offset1 + 1] === positions[offset2 + 1] &&
                    positions[offset1 + 2] === positions[offset2 + 2] &&
                    positions[offset1 + 3] === positions[offset2 + 3];
            }
            if (!(same(a, b) || same(a, c) || same(a, d) || same(b, c) || same(b, d))) {
                pushIdx(a);
                pushIdx(b);
                pushIdx(c);
                pushIdx(d);
            }
        }
        for (let u_index = 0; u_index < uSegment; u_index++) {
            inputUVW.x = u_index / (uSegment - 1);
            let u_offset = vSegment * u_index;
            for (let v_index = 0; v_index < vSegment; v_index++) {
                inputUVW.y = v_index / (vSegment - 1);
                let v_offset = wSegment * (v_index + u_offset);
                for (let w_index = 0; w_index < wSegment; w_index++) {
                    inputUVW.z = w_index / (wSegment - 1);
                    fn(inputUVW, outputVertex, outputNormal);
                    positions[ptr++] = outputVertex.x;
                    positions[ptr++] = outputVertex.y;
                    positions[ptr++] = outputVertex.z;
                    positions[ptr++] = outputVertex.w;
                    ptr -= 4;
                    normals[ptr++] = outputNormal.x;
                    normals[ptr++] = outputNormal.y;
                    normals[ptr++] = outputNormal.z;
                    normals[ptr++] = outputNormal.w;
                    ptr -= 4;
                    uvws[ptr++] = inputUVW.x;
                    uvws[ptr++] = inputUVW.y;
                    uvws[ptr++] = inputUVW.z;
                    uvws[ptr++] = 0;
                    if (u_index && v_index && w_index) {
                        let offset = w_index + v_offset;
                        idxbuffer[0] = offset << 2;
                        idxbuffer[1] = offset - 1 << 2;
                        idxbuffer[2] = offset - wSegment << 2;
                        idxbuffer[3] = offset - wSegment - 1 << 2;
                        idxbuffer[4] = offset - vw_seg << 2;
                        idxbuffer[5] = offset - vw_seg - 1 << 2;
                        idxbuffer[6] = offset - vw_seg - wSegment << 2;
                        idxbuffer[7] = offset - vw_seg - wSegment - 1 << 2;
                        pushTetra(0, 1, 2, 4);
                        pushTetra(1, 5, 7, 4);
                        pushTetra(1, 2, 7, 3);
                        pushTetra(4, 6, 7, 2);
                        pushTetra(1, 2, 4, 7);
                    }
                }
            }
        }
        return new TetraMesh({ position, normal, uvw, count });
    }
    function convexhull(points) {
        // todo: fix a random dead loop bug
        if (points.length < 5)
            return;
        points.sort((a, b) => Math.random() - 0.5);
        let _vec41 = new Vec4();
        let _vec42 = new Vec4();
        let _vec43 = new Vec4();
        let _vec44 = new Vec4();
        // let _vec45 = new Vec4();
        let _mat4 = new Mat4();
        let determinant = 0;
        let nobreak = true;
        let a = 0, b = 1, c = 2, d = 3, e = 4;
        let epsilon = 1e-10;
        for (a = 0; a < points.length && nobreak; a++) {
            for (b = a + 1; b < points.length && nobreak; b++) {
                for (c = b + 1; c < points.length && nobreak; c++) {
                    for (d = c + 1; d < points.length && nobreak; d++) {
                        for (e = d + 1; e < points.length; e++) {
                            determinant = det(a, b, c, d, e);
                            if (Math.abs(determinant) > epsilon) {
                                nobreak = false;
                                break;
                            }
                        }
                    }
                }
            }
        }
        if (determinant === 0)
            return;
        let temp;
        b--;
        c--;
        d--;
        a--;
        temp = points[0];
        points[0] = points[a];
        points[a] = temp;
        if (b === 0)
            b = a;
        if (c === 0)
            c = a;
        if (d === 0)
            d = a;
        if (e === 0)
            e = a;
        temp = points[1];
        points[1] = points[b];
        points[b] = temp;
        if (c === 1)
            c = b;
        if (d === 1)
            d = b;
        if (e === 1)
            e = b;
        temp = points[2];
        points[2] = points[c];
        points[c] = temp;
        if (d === 2)
            d = c;
        if (e === 2)
            e = c;
        temp = points[3];
        points[3] = points[d];
        points[d] = temp;
        if (e === 3)
            e = d;
        temp = points[4];
        points[4] = points[e];
        points[e] = temp;
        let count = 5; // indices.length === count * 4 always is true
        console.log(determinant);
        console.log(det(0, 1, 2, 3, 4));
        let indices = det(0, 1, 2, 3, 4) > 0 ?
            [1, 2, 3, 4, 2, 0, 3, 4, 0, 1, 3, 4, 1, 0, 2, 4, 0, 1, 2, 3]
            :
                [2, 1, 3, 4, 0, 2, 3, 4, 1, 0, 3, 4, 0, 1, 2, 4, 1, 0, 2, 3];
        function det(a, b, c, d, e) {
            let p = points[e];
            return _mat4.augVec4set(_vec41.subset(p, points[a]), _vec42.subset(p, points[b]), _vec43.subset(p, points[c]), _vec44.subset(p, points[d])).det();
        }
        for (let cursor = 5; cursor < points.length; cursor++) {
            let newIndices = [];
            // borderformat [v1,v2,v3,flag], v1>v2>v3, 
            // flag: 1 orientation +, 0 orientation -, 2 duplicate remove
            let border = [];
            function checkBorder(a, b, c) {
                let item = a > b ? b > c ? [a, b, c, 1] : a > c ? [a, c, b, 0] : [c, a, b, 1] :
                    a > c ? [b, a, c, 0] : b > c ? [b, c, a, 1] : [c, b, a, 0];
                let found = false;
                for (let i of border) {
                    if (i[0] === item[0] && i[1] === item[1] && i[2] === item[2]) {
                        i[3] = 2;
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    border.push(item);
                }
            }
            for (let cell = 0; cell < count; cell++) {
                let a = indices[cell << 2];
                let b = indices[(cell << 2) + 1];
                let c = indices[(cell << 2) + 2];
                let d = indices[(cell << 2) + 3];
                let determinant = det(a, b, c, d, cursor);
                if (determinant < epsilon) {
                    checkBorder(b, c, d);
                    checkBorder(c, a, d);
                    checkBorder(a, b, d);
                    checkBorder(b, a, c);
                }
                else {
                    newIndices.push(a, b, c, d);
                }
            }
            for (let b of border) {
                if (b[3] === 2)
                    continue;
                else if (b[3] === 0)
                    newIndices.push(b[0], b[1], b[2], cursor);
                else if (b[3] === 1)
                    newIndices.push(b[0], b[2], b[1], cursor);
            }
            indices = newIndices;
            count = indices.length >> 2;
        }
        let position = new Float32Array(count << 4);
        let countPtr = 0;
        for (let p = 0; p < count; p++) {
            points[indices[(p << 2)]].writeBuffer(position, countPtr);
            countPtr += 4;
            points[indices[(p << 2) + 1]].writeBuffer(position, countPtr);
            countPtr += 4;
            points[indices[(p << 2) + 2]].writeBuffer(position, countPtr);
            countPtr += 4;
            points[indices[(p << 2) + 3]].writeBuffer(position, countPtr);
            countPtr += 4;
        }
        return new TetraMesh({
            position,
            count
        });
    }
    function duocylinder(xyRadius, xySegment, zwRadius, zwSegment) {
        let dp = directProduct(circle(xyRadius, xySegment), circle(zwRadius, zwSegment));
        for (let i = 0; i < dp.uvw.length; i += 4) {
            dp.uvw[i + 2] = dp.uvw[i + 3] < 0.5 ? Math.atan2(dp.position[i + 3], dp.position[i + 2]) : Math.atan2(dp.position[i + 1], dp.position[i]);
        }
        return dp;
    }
    function loft(sp, section, step) {
        let { points, rotors, curveLength } = sp.generate(step);
        let quadcount = section.quad ? section.quad.position.length >> 4 : 0;
        let count4 = quadcount * (points.length - 1) * 5;
        let tricount = section.triangle ? section.triangle.position.length / 12 : 0;
        let count3 = tricount * (points.length - 1) * 3;
        let arraySize = count4 + count3 << 4;
        let pslen4 = quadcount * points.length << 4;
        let pslen3 = tricount * points.length * 12;
        let pslen = Math.max(pslen4, pslen3);
        let positions = new Float32Array(pslen);
        let uvws = new Float32Array(pslen);
        let normals = new Float32Array(pslen);
        let position = new Float32Array(arraySize);
        let uvw = new Float32Array(arraySize);
        let normal = new Float32Array(arraySize);
        let _vec4 = new Vec4(); // cache
        let offset = 0;
        let idxPtr = 0;
        if (section.quad) {
            let pos = section.quad.position;
            let norm = section.quad.normal;
            let uv = section.quad.uvw;
            for (let ptr = 0; ptr < (quadcount << 4); ptr += 16) {
                for (let j = 0; j < rotors.length; j++) {
                    let r = rotors[j];
                    let p = points[j];
                    for (let i = 0; i < 4; i++, ptr += 4) {
                        _vec4.set(pos[ptr], pos[ptr + 1], pos[ptr + 2], pos[ptr + 3]);
                        _vec4.rotates(r).adds(p);
                        _vec4.writeBuffer(positions, offset);
                        _vec4.set(norm[ptr], norm[ptr + 1], norm[ptr + 2], norm[ptr + 3]);
                        _vec4.rotates(r);
                        _vec4.writeBuffer(normals, offset);
                        _vec4.set(uv[ptr], uv[ptr + 1], uv[ptr + 2], curveLength[j]);
                        _vec4.writeBuffer(uvws, offset);
                        offset += 4;
                    }
                    ptr -= 16;
                    if (j) {
                        let doffset = offset - 32;
                        pushTetra(doffset, 0, 1, 3, 4);
                        pushTetra(doffset, 1, 5, 6, 4);
                        pushTetra(doffset, 1, 3, 6, 2);
                        pushTetra(doffset, 4, 7, 6, 3);
                        pushTetra(doffset, 1, 3, 4, 6);
                    }
                }
            }
        }
        if (section.triangle) {
            offset = 0;
            let pos = section.triangle.position;
            let norm = section.triangle.normal;
            let uv = section.triangle.uvw;
            for (let ptr = 0, l = tricount * 12; ptr < l; ptr += 12) {
                for (let j = 0; j < rotors.length; j++) {
                    let r = rotors[j];
                    let p = points[j];
                    for (let i = 0; i < 3; i++, ptr += 4) {
                        _vec4.set(pos[ptr], pos[ptr + 1], pos[ptr + 2], pos[ptr + 3]);
                        _vec4.rotates(r).adds(p);
                        _vec4.writeBuffer(positions, offset);
                        _vec4.set(norm[ptr], norm[ptr + 1], norm[ptr + 2], norm[ptr + 3]);
                        _vec4.rotates(r);
                        _vec4.writeBuffer(normals, offset);
                        _vec4.set(uv[ptr], uv[ptr + 1], uv[ptr + 2], curveLength[j]);
                        _vec4.writeBuffer(uvws, offset);
                        offset += 4;
                    }
                    ptr -= 12;
                    if (j) {
                        let doffset = offset - 24;
                        pushTetra(doffset, 0, 1, 2, 3);
                        pushTetra(doffset, 1, 2, 3, 5);
                        pushTetra(doffset, 3, 4, 1, 5);
                    }
                }
            }
        }
        function pushTetra(offset, a, b, c, d) {
            a = offset + (a << 2);
            b = offset + (b << 2);
            c = offset + (c << 2);
            d = offset + (d << 2);
            pushIdx(a);
            pushIdx(b);
            pushIdx(c);
            pushIdx(d);
        }
        function pushIdx(i) {
            position[idxPtr++] = positions[i];
            position[idxPtr++] = positions[i + 1];
            position[idxPtr++] = positions[i + 2];
            position[idxPtr++] = positions[i + 3];
            idxPtr -= 4;
            normal[idxPtr++] = normals[i];
            normal[idxPtr++] = normals[i + 1];
            normal[idxPtr++] = normals[i + 2];
            normal[idxPtr++] = normals[i + 3];
            idxPtr -= 4;
            uvw[idxPtr++] = uvws[i];
            uvw[idxPtr++] = uvws[i + 1];
            uvw[idxPtr++] = uvws[i + 2];
            uvw[idxPtr++] = uvws[i + 3];
        }
        return new TetraMesh({ position, uvw, normal, count: count3 + count4 });
    }
    // bv is rotate plane (not axis plane), it must be simple and normalized
    function rotatoid(bv, section, step, angle = _360) {
        let coeffAngle = angle / (step - 1);
        let rotors = new Array(step).fill(0).map((_, i) => bv.mulf(coeffAngle * i).exp());
        let quadcount = section.quad ? section.quad.position.length >> 4 : 0;
        let count4 = quadcount * (rotors.length) * 5;
        let tricount = section.triangle ? section.triangle.position.length / 12 : 0;
        let count3 = tricount * (rotors.length) * 3;
        let arraySize = count4 + count3 << 4;
        let pslen4 = quadcount * rotors.length << 4;
        let pslen3 = tricount * rotors.length * 12;
        let pslen = Math.max(pslen4, pslen3);
        let positions = new Float32Array(pslen);
        let uvws = new Float32Array(pslen);
        let normals = new Float32Array(pslen);
        let position = new Float32Array(arraySize);
        let uvw = new Float32Array(arraySize);
        let normal = new Float32Array(arraySize);
        let _vec4 = new Vec4(); // cache
        let offset = 0;
        let idxPtr = 0;
        if (section.quad) {
            let pos = section.quad.position;
            let norm = section.quad.normal;
            let uv = section.quad.uvw;
            for (let ptr = 0; ptr < (quadcount << 4); ptr += 16) {
                for (let j = 0; j < rotors.length; j++) {
                    let r = rotors[j];
                    for (let i = 0; i < 4; i++, ptr += 4) {
                        _vec4.set(pos[ptr], pos[ptr + 1], pos[ptr + 2], pos[ptr + 3]);
                        _vec4.rotates(r);
                        _vec4.writeBuffer(positions, offset);
                        if (norm) {
                            _vec4.set(norm[ptr], norm[ptr + 1], norm[ptr + 2], norm[ptr + 3]);
                        }
                        else {
                            _vec4.set();
                        }
                        _vec4.rotates(r);
                        _vec4.writeBuffer(normals, offset);
                        _vec4.set(uv[ptr], uv[ptr + 1], uv[ptr + 2], coeffAngle * j);
                        _vec4.writeBuffer(uvws, offset);
                        offset += 4;
                    }
                    ptr -= 16;
                    let doffset = offset - 32;
                    if (j) {
                        pushTetra(doffset, 0, 1, 3, 4);
                        pushTetra(doffset, 1, 5, 6, 4);
                        pushTetra(doffset, 1, 3, 6, 2);
                        pushTetra(doffset, 4, 7, 6, 3);
                        pushTetra(doffset, 1, 3, 4, 6);
                    }
                }
            }
        }
        if (section.triangle) {
            offset = 0;
            let pos = section.triangle.position;
            let norm = section.triangle.normal;
            let uv = section.triangle.uvw;
            for (let ptr = 0, l = tricount * 12; ptr < l; ptr += 12) {
                for (let j = 0; j < rotors.length; j++) {
                    let r = rotors[j];
                    for (let i = 0; i < 3; i++, ptr += 4) {
                        _vec4.set(pos[ptr], pos[ptr + 1], pos[ptr + 2], pos[ptr + 3]);
                        _vec4.rotates(r);
                        _vec4.writeBuffer(positions, offset);
                        if (norm) {
                            _vec4.set(norm[ptr], norm[ptr + 1], norm[ptr + 2], norm[ptr + 3]);
                        }
                        else {
                            _vec4.set();
                        }
                        _vec4.rotates(r);
                        _vec4.writeBuffer(normals, offset);
                        _vec4.set(uv[ptr], uv[ptr + 1], uv[ptr + 2], coeffAngle * j);
                        _vec4.writeBuffer(uvws, offset);
                        offset += 4;
                    }
                    ptr -= 12;
                    let doffset = offset - 24;
                    if (j) {
                        pushTetra(doffset, 0, 1, 2, 3);
                        pushTetra(doffset, 1, 2, 3, 5);
                        pushTetra(doffset, 3, 4, 1, 5);
                    }
                }
            }
        }
        function pushTetra(offset, a, b, c, d) {
            a = offset + (a << 2);
            b = offset + (b << 2);
            c = offset + (c << 2);
            d = offset + (d << 2);
            pushIdx(a);
            pushIdx(b);
            pushIdx(c);
            pushIdx(d);
        }
        function pushIdx(i) {
            position[idxPtr++] = positions[i];
            position[idxPtr++] = positions[i + 1];
            position[idxPtr++] = positions[i + 2];
            position[idxPtr++] = positions[i + 3];
            idxPtr -= 4;
            normal[idxPtr++] = normals[i];
            normal[idxPtr++] = normals[i + 1];
            normal[idxPtr++] = normals[i + 2];
            normal[idxPtr++] = normals[i + 3];
            idxPtr -= 4;
            uvw[idxPtr++] = uvws[i];
            uvw[idxPtr++] = uvws[i + 1];
            uvw[idxPtr++] = uvws[i + 2];
            uvw[idxPtr++] = uvws[i + 3];
        }
        return new TetraMesh({ position, uvw, normal, count: count3 + count4 });
    }
    function directProduct(shape1, shape2) {
        /** border(A x B) = border(A) x B + A x border(B) */
        let edge1 = findBorder(shape1);
        let edge2 = findBorder(shape2);
        // A x border(B)
        let quadcount1 = shape1.quad ? shape1.quad.position.length >> 2 : 0;
        let count14 = quadcount1 * edge2.length * 5;
        let tricount1 = shape1.triangle ? shape1.triangle.position.length / 3 : 0;
        let count13 = tricount1 * edge2.length * 3;
        let pslen1 = Math.max(quadcount1 * edge2.length << 5, tricount1 * edge2.length * 24);
        // border(A) x B 
        let quadcount2 = shape2.quad ? shape2.quad.position.length >> 2 : 0;
        let count24 = quadcount2 * edge1.length * 5;
        let tricount2 = shape2.triangle ? shape2.triangle.position.length / 3 : 0;
        let count23 = tricount2 * edge1.length * 3;
        let pslen2 = Math.max(quadcount2 * edge1.length << 5, tricount2 * edge1.length * 24);
        let arraySize = count14 + count13 + count23 + count24 << 4;
        let pslen = Math.max(pslen1, pslen2);
        let positions = new Float32Array(pslen);
        let uvws = new Float32Array(pslen);
        let normals = new Float32Array(pslen);
        let position = new Float32Array(arraySize);
        let uvw = new Float32Array(arraySize);
        let normal = new Float32Array(arraySize);
        let _vec4 = new Vec4(); // cache
        let _vec4p = new Vec4(); // cache
        let _vec4q = new Vec4(); // cache
        let _vec4n = new Vec4(); // cache
        let offset = 0;
        let idxPtr = 0;
        if (shape1.quad) {
            let posIdx = shape1.quad.position;
            let uvIdx = shape1.quad.uvw;
            let pos = shape1.position;
            let uv = shape1.uvw;
            for (let ptr = 0, l = posIdx.length; ptr < l; ptr += 4) {
                for (let j of edge2) {
                    let ie = j[0] << 2;
                    // pq is border segment
                    let p = _vec4p.set(shape2.position[ie + 2], shape2.position[ie + 3], shape2.position[ie], shape2.position[ie + 1]);
                    ie = j[1] << 2;
                    let q = _vec4q.set(shape2.position[ie + 2], shape2.position[ie + 3], shape2.position[ie], shape2.position[ie + 1]);
                    let normal = _vec4n.subset(q, p).norms();
                    [normal.z, normal.w] = [-normal.w, normal.z];
                    for (let i = 0; i < 4; i++, ptr++) {
                        let ipos = posIdx[ptr] << 2;
                        let iuv = uvIdx[ptr] << 2;
                        _vec4.set(pos[ipos], pos[ipos + 1], pos[ipos + 2], pos[ipos + 3]);
                        _vec4.adds(p);
                        _vec4.writeBuffer(positions, offset);
                        _vec4.set(0, 0, normal.z, normal.w);
                        _vec4.writeBuffer(normals, offset);
                        _vec4.set(uv[iuv], uv[iuv + 1], uv[iuv + 2], 0);
                        _vec4.writeBuffer(uvws, offset);
                        offset += 4;
                    }
                    ptr -= 4;
                    for (let i = 0; i < 4; i++, ptr++) {
                        let ipos = posIdx[ptr] << 2;
                        let iuv = uvIdx[ptr] << 2;
                        _vec4.set(pos[ipos], pos[ipos + 1], pos[ipos + 2], pos[ipos + 3]);
                        _vec4.adds(q);
                        _vec4.writeBuffer(positions, offset);
                        _vec4.set(0, 0, normal.z, normal.w);
                        _vec4.writeBuffer(normals, offset);
                        _vec4.set(uv[iuv], uv[iuv + 1], uv[iuv + 2], 0);
                        _vec4.writeBuffer(uvws, offset);
                        offset += 4;
                    }
                    ptr -= 4;
                    let doffset = offset - 32;
                    pushTetra(doffset, 0, 1, 3, 4);
                    pushTetra(doffset, 1, 5, 6, 4);
                    pushTetra(doffset, 1, 3, 6, 2);
                    pushTetra(doffset, 4, 7, 6, 3);
                    pushTetra(doffset, 1, 3, 4, 6);
                }
            }
        }
        offset = 0;
        if (shape1.triangle) {
            let posIdx = shape1.triangle.position;
            let uvIdx = shape1.triangle.uvw;
            let pos = shape1.position;
            let uv = shape1.uvw;
            for (let ptr = 0, l = posIdx.length; ptr < l; ptr += 3) {
                for (let j of edge2) {
                    let ie = j[0] << 2;
                    // pq is border segment
                    let p = _vec4p.set(shape2.position[ie + 2], shape2.position[ie + 3], shape2.position[ie], shape2.position[ie + 1]);
                    ie = j[1] << 2;
                    let q = _vec4q.set(shape2.position[ie + 2], shape2.position[ie + 3], shape2.position[ie], shape2.position[ie + 1]);
                    let normal = _vec4n.subset(q, p).norms();
                    [normal.z, normal.w] = [-normal.w, normal.z];
                    for (let i = 0; i < 3; i++, ptr++) {
                        let ipos = posIdx[ptr] << 2;
                        let iuv = uvIdx[ptr] << 2;
                        _vec4.set(pos[ipos], pos[ipos + 1], pos[ipos + 2], pos[ipos + 3]);
                        _vec4.adds(p);
                        _vec4.writeBuffer(positions, offset);
                        _vec4.set(0, 0, normal.z, normal.w);
                        _vec4.writeBuffer(normals, offset);
                        _vec4.set(uv[iuv], uv[iuv + 1], uv[iuv + 2], 0);
                        _vec4.writeBuffer(uvws, offset);
                        offset += 4;
                    }
                    ptr -= 3;
                    for (let i = 0; i < 3; i++, ptr++) {
                        let ipos = posIdx[ptr] << 2;
                        let iuv = uvIdx[ptr] << 2;
                        _vec4.set(pos[ipos], pos[ipos + 1], pos[ipos + 2], pos[ipos + 3]);
                        _vec4.adds(q);
                        _vec4.writeBuffer(positions, offset);
                        _vec4.set(0, 0, normal.z, normal.w);
                        _vec4.writeBuffer(normals, offset);
                        _vec4.set(uv[iuv], uv[iuv + 1], uv[iuv + 2], 0);
                        _vec4.writeBuffer(uvws, offset);
                        offset += 4;
                    }
                    ptr -= 3;
                    let doffset = offset - 24;
                    pushTetra(doffset, 0, 1, 2, 3);
                    pushTetra(doffset, 1, 2, 3, 5);
                    pushTetra(doffset, 3, 4, 1, 5);
                }
            }
        }
        offset = 0;
        if (shape2.quad) {
            let posIdx = shape2.quad.position;
            let uvIdx = shape2.quad.uvw;
            let pos = shape2.position;
            let uv = shape2.uvw;
            for (let ptr = 0, l = posIdx.length; ptr < l; ptr += 4) {
                for (let j of edge1) {
                    let ie = j[0] << 2;
                    // pq is border segment
                    let p = _vec4p.set(shape1.position[ie], shape1.position[ie + 1], shape1.position[ie + 2], shape1.position[ie + 3]);
                    ie = j[1] << 2;
                    let q = _vec4q.set(shape1.position[ie], shape1.position[ie + 1], shape1.position[ie + 2], shape1.position[ie + 3]);
                    let normal = _vec4n.subset(q, p).norms();
                    [normal.x, normal.y] = [-normal.y, normal.x];
                    for (let i = 0; i < 4; i++, ptr++) {
                        let ipos = posIdx[ptr] << 2;
                        let iuv = uvIdx[ptr] << 2;
                        _vec4.set(pos[ipos + 2], pos[ipos + 3], pos[ipos], pos[ipos + 1]);
                        _vec4.adds(p);
                        _vec4.writeBuffer(positions, offset);
                        _vec4.set(normal.x, normal.y);
                        _vec4.writeBuffer(normals, offset);
                        _vec4.set(uv[iuv], uv[iuv + 1], uv[iuv + 2], 1);
                        _vec4.writeBuffer(uvws, offset);
                        offset += 4;
                    }
                    ptr -= 4;
                    for (let i = 0; i < 4; i++, ptr++) {
                        let ipos = posIdx[ptr] << 2;
                        let iuv = uvIdx[ptr] << 2;
                        _vec4.set(pos[ipos + 2], pos[ipos + 3], pos[ipos], pos[ipos + 1]);
                        _vec4.adds(q);
                        _vec4.writeBuffer(positions, offset);
                        _vec4.set(normal.x, normal.y);
                        _vec4.writeBuffer(normals, offset);
                        _vec4.set(uv[iuv], uv[iuv + 1], uv[iuv + 2], 1);
                        _vec4.writeBuffer(uvws, offset);
                        offset += 4;
                    }
                    ptr -= 4;
                    let doffset = offset - 32;
                    pushTetra(doffset, 0, 1, 3, 4);
                    pushTetra(doffset, 1, 5, 6, 4);
                    pushTetra(doffset, 1, 3, 6, 2);
                    pushTetra(doffset, 4, 7, 6, 3);
                    pushTetra(doffset, 1, 3, 4, 6);
                }
            }
        }
        offset = 0;
        if (shape2.triangle) {
            let posIdx = shape2.triangle.position;
            let uvIdx = shape2.triangle.uvw;
            let pos = shape2.position;
            let uv = shape2.uvw;
            for (let ptr = 0, l = posIdx.length; ptr < l; ptr += 3) {
                for (let j of edge1) {
                    let ie = j[0] << 2;
                    // pq is border segment
                    let p = _vec4p.set(shape1.position[ie], shape1.position[ie + 1], shape1.position[ie + 2], shape1.position[ie + 3]);
                    ie = j[1] << 2;
                    let q = _vec4q.set(shape1.position[ie], shape1.position[ie + 1], shape1.position[ie + 2], shape1.position[ie + 3]);
                    let normal = _vec4n.subset(q, p).norms();
                    [normal.x, normal.y] = [-normal.y, normal.x];
                    for (let i = 0; i < 3; i++, ptr++) {
                        let ipos = posIdx[ptr] << 2;
                        let iuv = uvIdx[ptr] << 2;
                        _vec4.set(pos[ipos + 2], pos[ipos + 3], pos[ipos], pos[ipos + 1]);
                        _vec4.adds(p);
                        _vec4.writeBuffer(positions, offset);
                        _vec4.set(normal.x, normal.y);
                        _vec4.writeBuffer(normals, offset);
                        _vec4.set(uv[iuv], uv[iuv + 1], uv[iuv + 2], 1);
                        _vec4.writeBuffer(uvws, offset);
                        offset += 4;
                    }
                    ptr -= 3;
                    for (let i = 0; i < 3; i++, ptr++) {
                        let ipos = posIdx[ptr] << 2;
                        let iuv = uvIdx[ptr] << 2;
                        _vec4.set(pos[ipos + 2], pos[ipos + 3], pos[ipos], pos[ipos + 1]);
                        _vec4.adds(q);
                        _vec4.writeBuffer(positions, offset);
                        _vec4.set(normal.x, normal.y);
                        _vec4.writeBuffer(normals, offset);
                        _vec4.set(uv[iuv], uv[iuv + 1], uv[iuv + 2], 1);
                        _vec4.writeBuffer(uvws, offset);
                        offset += 4;
                    }
                    ptr -= 3;
                    let doffset = offset - 24;
                    pushTetra(doffset, 0, 1, 2, 3);
                    pushTetra(doffset, 1, 2, 3, 5);
                    pushTetra(doffset, 3, 4, 1, 5);
                }
            }
        }
        function pushTetra(offset, a, b, c, d) {
            a = offset + (a << 2);
            b = offset + (b << 2);
            c = offset + (c << 2);
            d = offset + (d << 2);
            pushIdx(a);
            pushIdx(b);
            pushIdx(c);
            pushIdx(d);
        }
        function pushIdx(i) {
            position[idxPtr++] = positions[i];
            position[idxPtr++] = positions[i + 1];
            position[idxPtr++] = positions[i + 2];
            position[idxPtr++] = positions[i + 3];
            idxPtr -= 4;
            normal[idxPtr++] = normals[i];
            normal[idxPtr++] = normals[i + 1];
            normal[idxPtr++] = normals[i + 2];
            normal[idxPtr++] = normals[i + 3];
            idxPtr -= 4;
            uvw[idxPtr++] = uvws[i];
            uvw[idxPtr++] = uvws[i + 1];
            uvw[idxPtr++] = uvws[i + 2];
            uvw[idxPtr++] = uvws[i + 3];
        }
        return new TetraMesh({ position, normal, uvw, count: position.length >> 4 });
    }
    function cwmesh(cwmesh, notClosed) {
        let simplexes;
        const borders = cwmesh.findBorder(4);
        if (!borders)
            notClosed = true;
        if (!notClosed) {
            // closed 4d object's surface
            const cells = [];
            const cellsO = [];
            for (const [cellId, border] of borders.entries()) {
                if (border !== 1 && border !== -1)
                    continue;
                cells.push(cellId);
                cellsO.push(border === 1);
            }
            simplexes = cwmesh.triangulate(3, cells, cellsO).flat();
        }
        else {
            simplexes = cwmesh.triangulate(3, cwmesh.data[3].map((_, idx) => idx)).flat();
        }
        const arrLen = simplexes.length << 4;
        const tetramesh = new TetraMesh({
            position: new Float32Array(arrLen),
            normal: new Float32Array(arrLen),
            count: simplexes.length
        });
        let offset = 0;
        const vertices = cwmesh.data[0];
        const v1 = new Vec4, v2 = new Vec4, v3 = new Vec4;
        for (const s of simplexes) {
            const a0 = vertices[s[0]];
            const a1 = vertices[s[1]];
            const a2 = vertices[s[2]];
            const a3 = vertices[s[3]];
            const normal = v1.subset(a0, a1).wedge(v2.subset(a0, a2)).wedgev(v3.subset(a0, a3)).norms();
            a0.writeBuffer(tetramesh.position, offset);
            normal.writeBuffer(tetramesh.normal, offset);
            offset += 4;
            a1.writeBuffer(tetramesh.position, offset);
            normal.writeBuffer(tetramesh.normal, offset);
            offset += 4;
            a2.writeBuffer(tetramesh.position, offset);
            normal.writeBuffer(tetramesh.normal, offset);
            offset += 4;
            a3.writeBuffer(tetramesh.position, offset);
            normal.writeBuffer(tetramesh.normal, offset);
            offset += 4;
        }
        return tetramesh;
    }

    var tetra = /*#__PURE__*/Object.freeze({
        __proto__: null,
        TetraIndexMesh: TetraIndexMesh,
        TetraMesh: TetraMesh,
        concat: concat,
        convexhull: convexhull,
        cube: cube,
        cwmesh: cwmesh,
        directProduct: directProduct,
        ditorus: ditorus,
        duocylinder: duocylinder,
        glome: glome,
        hexadecachoron: hexadecachoron,
        loft: loft,
        parametricSurface: parametricSurface,
        rotatoid: rotatoid,
        sphere: sphere,
        spherinderSide: spherinderSide,
        spheritorus: spheritorus,
        tesseract: tesseract,
        tiger: tiger,
        torisphere: torisphere
    });

    class Scene {
        child = [];
        backGroundColor;
        skyBox;
        wireframe;
        add(...obj) {
            this.child.push(...obj);
        }
        removeChild(obj) {
            let index = this.child.indexOf(obj);
            if (index !== -1) {
                this.child.splice(index, 1);
            }
            else {
                console.warn("Cannot remove a non-existed child");
            }
        }
        setBackgroundColor(color) {
            this.backGroundColor = color;
        }
    }
    let Object$1 = class Object extends Obj4 {
        child = [];
        worldCoord;
        needsUpdateCoord = true;
        alwaysUpdateCoord = false;
        visible = true;
        constructor() {
            super();
            this.worldCoord = new AffineMat4();
        }
        updateCoord() {
            this.needsUpdateCoord = true;
            return this;
        }
        add(...obj) {
            this.child.push(...obj);
        }
        removeChild(obj) {
            let index = this.child.indexOf(obj);
            if (index !== -1) {
                this.child.splice(index, 1);
            }
            else {
                console.warn("Cannot remove a non-existed child");
            }
        }
    };
    class PerspectiveCamera extends Object$1 {
        fov = 90;
        near = 0.1;
        far = 100;
        alwaysUpdateCoord = true;
        needsUpdate = true;
    }
    class OrthographicCamera extends Object$1 {
        size = 2;
        near = -10;
        far = 10;
        alwaysUpdateCoord = true;
        needsUpdate = true;
    }
    class Mesh extends Object$1 {
        geometry;
        material;
        uObjMatBuffer;
        bindGroup;
        constructor(geometry, material) {
            super();
            this.geometry = geometry;
            this.material = material;
        }
    }
    class Geometry {
        jsBuffer;
        gpuBuffer;
        needsUpdate = true;
        dynamic = false;
        obb = new AABB;
        constructor(data) {
            this.jsBuffer = data instanceof TetraMesh ? data : new TetraMesh(data);
        }
        updateOBB() {
            let obb = this.obb;
            let pos = this.jsBuffer.position;
            obb.min.set(Infinity, Infinity, Infinity, Infinity);
            obb.max.set(-Infinity, -Infinity, -Infinity, -Infinity);
            for (let i = 0, l = this.jsBuffer.count << 4; i < l; i += 4) {
                obb.min.x = Math.min(obb.min.x, pos[i]);
                obb.min.y = Math.min(obb.min.y, pos[i + 1]);
                obb.min.z = Math.min(obb.min.z, pos[i + 2]);
                obb.min.w = Math.min(obb.min.w, pos[i + 3]);
                obb.max.x = Math.max(obb.max.x, pos[i]);
                obb.max.y = Math.max(obb.max.y, pos[i + 1]);
                obb.max.z = Math.max(obb.max.z, pos[i + 2]);
                obb.max.w = Math.max(obb.max.w, pos[i + 3]);
            }
        }
    }
    class SkyBox {
        pipeline;
        uBuffer;
        jsBuffer;
        compiling = false;
        compiled = false;
        needsUpdate = true;
        bindGroups;
        bufferSize;
        uuid;
        static commonCode = `
    struct rayOut{
        @location(0) outO: vec4f,
        @location(1) outR: vec4f,
        @location(2) coord: vec3<f32>
    }
    @ray fn mainRay(
        @builtin(ray_origin) ro: vec4f,
        @builtin(ray_direction) rd: vec4f,
        @builtin(voxel_coord) coord: vec3<f32>,
        @builtin(aspect_matrix) aspect: mat3x3<f32>
    ) -> rayOut {
        return rayOut(
            transpose(camMat.matrix)*(ro-camMat.vector),
            transpose(camMat.matrix)*rd,
            aspect * coord
        );
    }
    struct fOut{
        @location(0) color: vec4f,
        @builtin(frag_depth) depth: f32
    }
    
    // converted to 4D from shadertoy 3D: https://www.shadertoy.com/view/WtBXWw
    fn ACESFilm(x: vec3<f32>)->vec3<f32>
    {
        let tA = 2.51;
        let tB = vec3<f32>(0.03);
        let tC = 2.43;
        let tD = vec3<f32>(0.59);
        let tE = vec3<f32>(0.14);
        return clamp((x*(tA*x+tB))/(x*(tC*x+tD)+tE),vec3<f32>(0.0),vec3<f32>(1.0));
    }
    `;
        async compile(r) {
            if (this.compiling || this.compiled)
                return;
            this.compiling = true;
            this.pipeline = await r.core.createRaytracingPipeline(this.getShaderCode());
            this.compiling = false;
            this.compiled = true;
        }
        constructor() {
        }
        getBindgroups(r) {
            this.uBuffer = r.gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, this.bufferSize << 2, "uSimpleSky");
            this.bindGroups = [
                r.core.createVertexShaderBindGroup(this.pipeline, 1, [
                    r.uCamMatBuffer,
                    this.uBuffer
                ], "SimpleSkyBindgroup")
            ];
        }
        update(r) {
            this.needsUpdate = false;
            r.gpu.device.queue.writeBuffer(this.uBuffer, 0, this.jsBuffer.buffer);
        }
    }
    class SimpleSkyBox extends SkyBox {
        bufferSize = 8;
        constructor() {
            super();
            this.jsBuffer = new Float32Array(this.bufferSize);
            this.setSunPosition(new Vec4(0.2, 0.9, 0.1, 0.3).norms());
            this.setOpacity(0.2);
        }
        setSunPosition(pos) {
            this.needsUpdate = true;
            pos.writeBuffer(this.jsBuffer);
        }
        setOpacity(o) {
            this.needsUpdate = true;
            this.jsBuffer[4] = o;
        }
        getOpacity() {
            return this.jsBuffer[4];
        }
        getSunPosition() {
            return new Vec4(this.jsBuffer[0], this.jsBuffer[1], this.jsBuffer[2], this.jsBuffer[3]);
        }
        getShaderCode() {
            return {
                code: `
        struct UIn{
            sunDir: vec4f,
            opacity: f32
        }
        @group(1) @binding(0) var<uniform> camMat: tsxAffineMat;
        @group(1) @binding(1) var<uniform> uIn: UIn;
        ${SkyBox.commonCode}
        const betaR = vec3<f32>(1.95e-2, 1.1e-1, 2.94e-1); 
        const betaM = vec3<f32>(4e-2, 4e-2, 4e-2);
        const Rayleigh = 1.0;
        const Mie = 1.0;
        const RayleighAtt = 1.0;
        const MieAtt = 1.2;
        const g = -0.9;
        fn sky (rd: vec4f)->vec3<f32>{
            let D = normalize(rd);
            let t = max(0.001, D.y)*0.92+0.08;

            // optical depth -> zenithAngle
            let sR = RayleighAtt / t ;
            let sM = MieAtt / t ;
            let cosine = clamp(dot(D,normalize(uIn.sunDir)),0.0,1.0);
            let cosine2 =dot(D,normalize(uIn.sunDir))+1.0;
            let extinction = exp(-(betaR * sR + betaM * sM));

            // scattering phase
            let g2 = g * g;
            let fcos2 = cosine * cosine;
            let miePhase = Mie * pow(1.0 + g2 + 2.0 * g * cosine, -1.5) * (1.0 - g2) / (2.0 + g2);
            
            let rayleighPhase = Rayleigh;

            let inScatter = (1.0 + fcos2) * vec3<f32>(rayleighPhase + betaM / betaR * miePhase);

            var color = inScatter*(1.0-extinction) * 1.4;
            // sun
            color += 0.47*vec3<f32>(1.8,1.4,0.3)*pow( cosine, 350.0 ) * extinction;
            // sun haze
            color += 0.4*vec3<f32>(0.8,0.9,0.1)*pow( cosine2 *0.5, 2.0 )* extinction;
            color *= vec3<f32>(1.4,1.7,1.2);
            return ACESFilm(color);
        }
        @fragment fn mainFragment(@location(0) ro: vec4f, @location(1) rd: vec4f, @location(2) coord: vec3<f32>)->fOut{            
            return fOut(vec4f(sky(rd),uIn.opacity),0.999999);
        }`,
                rayEntryPoint: "mainRay",
                fragmentEntryPoint: "mainFragment"
            };
        }
    }

    class Light extends Object$1 {
        density;
        constructor(density) {
            super();
            this.density = color2Vec3(density);
        }
    }
    function color2Vec3(density) {
        if (density instanceof Vec3)
            return density;
        if (density.r) {
            return new Vec3(density.r, density.g, density.b);
        }
        if (typeof density === "number") {
            return new Vec3(density, density, density);
        }
        if (density.length === 3) {
            return new Vec3(density[0], density[1], density[2]);
        }
    }
    class AmbientLight extends Light {
        needsUpdateCoord = false;
        constructor(density) {
            super(density);
        }
    }
    class DirectionalLight extends Light {
        worldDirection = new Vec4;
        direction;
        constructor(density, direction) {
            super(density ?? 1.0);
            this.direction = direction ?? Vec4.y.clone();
        }
    }
    class SpotLight extends Light {
        worldDirection = new Vec4;
        direction;
        angle;
        penumbra;
        decayPower = 3;
        constructor(density, angle, penumbra, direction) {
            super(density ?? 1.0);
            this.direction = direction ?? Vec4.y.clone();
            this.angle = angle;
            this.penumbra = penumbra;
        }
    }
    class PointLight extends Light {
        decayPower = 3;
        constructor(density) {
            super(density);
        }
    }
    const ambientLightSize = 4 * 4;
    const structPosDirLightSize = 8 * 4;
    const structSpotLightLightSize = 16 * 4;
    let spotLightOffset;
    let uWorldLightBufferSize;
    function _initLightShader(config) {
        const posdirLightsNumber = config?.posdirLightsNumber ?? 8;
        const spotLightsNumber = config?.spotLightsNumber ?? 4;
        spotLightOffset = ambientLightSize + posdirLightsNumber * structPosDirLightSize;
        uWorldLightBufferSize = spotLightOffset + spotLightsNumber * structSpotLightLightSize;
        const lightCode = `
struct PosDirLight{
    density: vec4f,
    pos_dir: vec4f,
}
struct SpotLight{
    density: vec4f,
    pos: vec4f,
    dir: vec4f,
    params: vec4f
}
const blackColor = vec3<f32>(0.02);
struct WorldLight{
    ambientLightDensity: vec4f,
    posdirLights: array<PosDirLight,${posdirLightsNumber}>,
    spotLights: array<SpotLight,${spotLightsNumber}>,
}
fn acesFilm(x: vec3<f32>)-> vec3<f32> {
    const a: f32 = 2.51;
    const b: f32 = 0.03;
    const c: f32 = 2.43;
    const d: f32 = 0.59;
    const e: f32 = 0.14;
    return clamp((x * (a * x + b)) / (x * (c * x + d ) + e), vec3<f32>(0.0), vec3<f32>(1.0));
}
@group(1) @binding(0) var<uniform> uWorldLight: WorldLight;
`;
        return { posdirLightsNumber, spotLightsNumber, lightCode, uWorldLightBufferSize };
    }
    function _updateWorldLight(r) {
        let offset = 0;
        r.jsBuffer.fill(0);
        r.ambientLightDensity.writeBuffer(r.jsBuffer);
        offset += 4;
        for (let dir of r.directionalLights) {
            dir.density.writeBuffer(r.jsBuffer, offset);
            offset += 4;
            r.jsBuffer[offset - 1] = -1; // marker for directional light ( < -0.5 in shader )
            dir.worldDirection.writeBuffer(r.jsBuffer, offset);
            offset += 4;
        }
        for (let pt of r.pointLights) {
            pt.density.writeBuffer(r.jsBuffer, offset);
            offset += 4;
            r.jsBuffer[offset - 1] = Math.abs(pt.decayPower) + 1; // decay power and also marker for point light ( > 0.5 in shader )
            pt.worldCoord.vec.writeBuffer(r.jsBuffer, offset);
            offset += 4;
        }
        offset = spotLightOffset >> 2;
        for (let spt of r.spotLights) {
            spt.density.writeBuffer(r.jsBuffer, offset);
            offset += 4;
            r.jsBuffer[offset - 1] = 1.0; // marker for spotLight
            spt.worldCoord.vec.writeBuffer(r.jsBuffer, offset);
            offset += 4;
            spt.worldDirection.writeBuffer(r.jsBuffer, offset);
            offset += 4;
            let cosineinv = 1 / (1 - Math.cos(spt.angle * _DEG2RAD * 0.5));
            r.jsBuffer[offset] = cosineinv;
            r.jsBuffer[offset + 1] = 1 - cosineinv;
            r.jsBuffer[offset + 2] = spt.penumbra;
            r.jsBuffer[offset + 3] = Math.abs(spt.decayPower) + 1;
            offset += 4;
        }
        r.gpu.device.queue.writeBuffer(r.uWorldLightBuffer, 0, r.jsBuffer, 0, uWorldLightBufferSize >> 2);
    }

    /** threejs like 4D lib */
    class Renderer {
        core;
        gpu;
        canvas;
        pipelines = {};
        jsBuffer = new Float32Array(1024);
        uCamMatBuffer; // contain inv and uninv affineMat
        uWorldLightBuffer;
        lightShaderInfomation = _initLightShader();
        autoSetSizeHandler;
        cameraInScene;
        safeTetraNumInOnePass;
        tetraNumOccupancyRatio = 0.08;
        maxTetraNumInOnePass;
        context;
        constructor(canvas, config) {
            this.canvas = canvas;
            this.lightShaderInfomation = _initLightShader(config);
        }
        setBackgroundColor(color) {
            this.core.setDisplayConfig({ screenBackgroundColor: color });
        }
        async init() {
            this.gpu = await new GPU().init();
            if (!this.gpu) {
                throw "No availiable GPU device found. Please check whether WebGPU is enabled on your browser.";
            }
            this.context = this.gpu.getContext(this.canvas);
            this.core = new SliceRenderer(this.gpu);
            this.uCamMatBuffer = this.gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, (4 * 5 * 2) * 4, "uCamMat");
            this.uWorldLightBuffer = this.gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, this.lightShaderInfomation.uWorldLightBufferSize, "uWorldLight");
            this.core.setDisplayConfig({ canvasSize: { width: this.canvas.width * devicePixelRatio, height: this.canvas.height * devicePixelRatio } });
            this.safeTetraNumInOnePass = this.core.getSafeTetraNumInOnePass();
            await this.core.init();
            return this;
        }
        // todo: add computePipeLinePool
        fetchPipelineName(identifier) {
            return identifier;
        }
        fetchPipeline(identifier) {
            return this.pipelines[this.fetchPipelineName(identifier)];
        }
        pullPipeline(identifier, pipeline) {
            if (this.pipelines[identifier] && this.pipelines[identifier] !== "compiling")
                throw "FOUR Renderer: Repetitive material pipeline creation occured.";
            this.pipelines[identifier] = pipeline;
        }
        updateObject(o) {
            for (let c of o.child) {
                if (c.alwaysUpdateCoord) {
                    c.needsUpdateCoord = true;
                }
                if (c.needsUpdateCoord || o.needsUpdateCoord) {
                    c.worldCoord.setFromObj4(c).mulsl(o.worldCoord);
                    c.needsUpdateCoord = true;
                }
                if (c.visible) {
                    this.updateObject(c);
                    c.needsUpdateCoord = false;
                }
            }
            if (o instanceof Mesh) {
                this.updateMesh(o);
            }
            else if (o instanceof AmbientLight && o.visible) {
                this.ambientLightDensity.adds(o.density);
            }
            else if (o instanceof PointLight && o.visible) {
                this.pointLights.push(o);
            }
            else if (o instanceof SpotLight && o.visible) {
                if (o.needsUpdateCoord) {
                    o.worldDirection.mulmatvset(o.worldCoord.mat, o.direction);
                }
                this.spotLights.push(o);
            }
            else if (o instanceof DirectionalLight && o.visible) {
                if (o.needsUpdateCoord) {
                    o.worldDirection.mulmatvset(o.worldCoord.mat, o.direction);
                }
                this.directionalLights.push(o);
            }
            else if (o.needsUpdateCoord && o === this.activeCamera) {
                this.cameraInScene = true;
                o.worldCoord.inv().writeBuffer(this.jsBuffer);
                o.worldCoord.writeBuffer(this.jsBuffer, 20);
                this.gpu.device.queue.writeBuffer(this.uCamMatBuffer, 0, this.jsBuffer, 0, 40);
            }
        }
        // this may fail to add to drawlist if pipeline creation is not finished yet
        addToDrawList(m) {
            let pipeline = this.fetchPipeline(m.material.identifier);
            // attention: this is an async function, rendering will be in the future tick
            if (!pipeline) {
                m.material.bindGroup = null;
                m.bindGroup = null;
                m.material.compile(this);
                return;
            }
            if (pipeline === "compiling")
                return;
            // if this material can use other's pipeline, it hasn't compiled but also need some initiations
            if (!m.material.compiled) {
                m.material.init(this);
            }
            let groupName = m.material.uuid;
            let group = m.material.declUniformLocation ? 1 : 0;
            if (!this.drawList[groupName]) {
                let bindGroup = this.core.createFragmentShaderBindGroup(pipeline, group, [this.uWorldLightBuffer], "WorldLightGroup");
                this.drawList[groupName] = {
                    pipeline: pipeline, meshes: [],
                    bindGroup: { group, binding: bindGroup }, tetraCount: 0
                };
            }
            let list = this.drawList[groupName];
            // while (list.next) {
            //     list = this.drawList[list.next]; //go to the end of chain table
            // }
            // list.tetraCount += m.geometry.jsBuffer.tetraCount;
            list.meshes.push(m);
            // if (list.tetraCount > this.maxTetraNumInOnePass) {
            //     // append a new node to chain, wait for accept new objects next time
            //     groupName = list.next = math.generateUUID();
            //     this.drawList[groupName] = {
            //         pipeline: pipeline, meshes: [],
            //         bindGroup: list.bindGroup, tetraCount: 0
            //     };
            // }
            if (!m.bindGroup) {
                let buffers = [
                    ...m.material.fetchBuffer(m.geometry),
                    m.uObjMatBuffer,
                    this.uCamMatBuffer
                ];
                m.bindGroup = this.core.createVertexShaderBindGroup(pipeline, 1, buffers, m.material.identifier);
            }
            if (!m.material.bindGroup) {
                m.material.createBindGroup(this, pipeline);
            }
            m.material.update(this);
        }
        async compileMaterials(mats) {
            let promises = [];
            if (mats instanceof Scene) {
                addMaterialInObject(this, promises, mats.child);
            }
            else {
                for (let m of mats) {
                    promises.push(m.compile(this));
                }
            }
            await Promise.all(promises);
            function addMaterialInObject(self, promises, child) {
                for (let m of child) {
                    if (m instanceof Mesh) {
                        let pipeline = self.fetchPipeline(m.material.identifier);
                        if (!pipeline) {
                            m.material.bindGroup = null;
                            m.bindGroup = null;
                            promises.push(m.material.compile(self));
                        }
                        if (!m.material.compiled) {
                            m.material.init(self);
                        }
                    }
                    addMaterialInObject(self, promises, m.child);
                }
            }
        }
        updateMesh(m) {
            if (m.needsUpdateCoord) {
                m.worldCoord.writeBuffer(this.jsBuffer, 0);
                m.worldCoord.mat.inv().ts().writeBuffer(this.jsBuffer, 20);
                if (!m.uObjMatBuffer) {
                    m.uObjMatBuffer = this.gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, (20 + 16) * 4, "uObjMatBuffer");
                }
                this.gpu.device.queue.writeBuffer(m.uObjMatBuffer, 0, this.jsBuffer, 0, 20 + 16);
            }
            if (m.geometry.needsUpdate) {
                let g = m.geometry;
                g.needsUpdate = false;
                g.updateOBB();
                if (!g.gpuBuffer) {
                    g.gpuBuffer = {};
                    let dyn = g.dynamic ? GPUBufferUsage.COPY_DST : 0;
                    for (let [label, value] of globalThis.Object.entries(g.jsBuffer)) {
                        if (value instanceof Float32Array) {
                            g.gpuBuffer[label] = this.gpu.createBuffer(GPUBufferUsage.STORAGE | dyn, value, "AttributeBuffer." + label);
                        }
                    }
                }
                else if (g.dynamic) {
                    for (let [label, buffer] of globalThis.Object.entries(g.gpuBuffer)) {
                        this.gpu.device.queue.writeBuffer(buffer, 0, g.jsBuffer[label]);
                    }
                }
            }
            if (m.visible)
                this.addToDrawList(m);
        }
        updateScene(scene) {
            this.core.setDisplayConfig({ retinaClearColor: scene.backGroundColor });
            this.cameraInScene = false;
            this.maxTetraNumInOnePass = this.safeTetraNumInOnePass / this.tetraNumOccupancyRatio;
            for (let c of scene.child) {
                if (c.alwaysUpdateCoord) {
                    c.needsUpdateCoord = true;
                }
                if (c.visible) {
                    if (c.needsUpdateCoord) {
                        c.worldCoord.setFromObj4(c);
                    }
                    this.updateObject(c);
                    c.needsUpdateCoord = false;
                }
            }
            if (this.cameraInScene === false)
                console.error("Target camera is not in the scene. Forget to add it?");
            _updateWorldLight(this);
            this.updateSkyBox(scene);
        }
        updateSkyBox(scene) {
            const skyBox = scene.skyBox;
            if (!skyBox)
                return;
            if (!skyBox.compiled) {
                if (!skyBox.compiling) {
                    skyBox.compile(this);
                }
                return;
            }
            if (!skyBox.bindGroups) {
                skyBox.getBindgroups(this);
            }
            skyBox.update(this);
        }
        ambientLightDensity = new Vec3;
        directionalLights;
        spotLights;
        pointLights;
        drawList;
        activeCamera;
        setCamera(camera) {
            if (camera.needsUpdate) {
                this.core.setDisplayConfig({ camera4D: camera });
                camera.needsUpdate = false;
            }
            this.activeCamera = camera;
        }
        render(scene, camera) {
            this.clearState();
            this.setCamera(camera);
            scene.wireframe?.camera?.copyObj4(camera);
            this.updateScene(scene);
            this.core.render(this.context, (renderState) => {
                for (let { pipeline, meshes, bindGroup } of globalThis.Object.values(this.drawList)) {
                    if (!meshes.length)
                        continue; // skip empty (may caused by safe tetranum check)
                    let tetraState = false;
                    let tetraCount = 0;
                    let binding = [
                        ...meshes[0].material.bindGroup.map((bg, binding) => ({ group: binding, binding: bg })),
                        bindGroup
                    ];
                    for (let mesh of meshes) {
                        if (!renderState.testWithFrustumData(mesh.geometry.obb, this.activeCamera.worldCoord, mesh.worldCoord))
                            continue;
                        if (tetraState === false) {
                            renderState.beginTetras(pipeline);
                            tetraCount = 0;
                            tetraState = true;
                        }
                        renderState.sliceTetras(mesh.bindGroup, mesh.geometry.jsBuffer.count);
                        tetraCount += mesh.geometry.jsBuffer.count;
                        if (tetraCount > this.maxTetraNumInOnePass) {
                            renderState.drawTetras(binding);
                            tetraState = false;
                            tetraCount = 0;
                        }
                    }
                    if (tetraState === true) {
                        renderState.drawTetras(binding);
                    }
                }
                if (scene.skyBox?.bindGroups) {
                    renderState.drawRaytracing(scene.skyBox.pipeline, scene.skyBox.bindGroups);
                }
            }, scene.wireframe ? rs => scene.wireframe.render(rs) : undefined);
        }
        setSize(size) {
            if (size.height) {
                this.canvas.width = size.width;
                this.canvas.height = size.height;
            }
            else {
                this.canvas.width = size[0];
                this.canvas.height = size[1];
            }
            this.core.setDisplayConfig({ canvasSize: size });
        }
        clearState() {
            this.ambientLightDensity.set();
            this.directionalLights = [];
            this.spotLights = [];
            this.pointLights = [];
            this.drawList = {};
        }
    }

    //  tetra vertex shaders
    let commonHeader = `
struct tsxAffineMat{
    matrix: mat4x4f,
    vector: vec4f,
}
struct UObjMats{
    pos: tsxAffineMat,
    normal: mat4x4f,
}
struct fourInputType{
    @location(0) pos: mat4x4f,{fourInputType}
}
struct fourOutputType{
    @builtin(position) position: mat4x4f,
    {fourOutputType}
}
@group(1) @binding({0}) var<uniform> uObjMat: UObjMats;
@group(1) @binding({1}) var<uniform> uCamMat: tsxAffineMat;
fn apply(afmat: tsxAffineMat, points: mat4x4f) -> mat4x4f{
    let biais = mat4x4f(afmat.vector, afmat.vector, afmat.vector, afmat.vector);
    return afmat.matrix * points + biais;
}
fn normalizeVec4s(vec4s: mat4x4f) -> mat4x4f{
    return mat4x4f(
        normalize(vec4s[0]), normalize(vec4s[1]), normalize(vec4s[2]), normalize(vec4s[3]),
    );
}
@tetra fn main(input : fourInputType, @builtin(instance_index) index: u32) -> fourOutputType{
    let worldPos = apply(uObjMat.pos,input.pos);
    return fourOutputType({fourOutputReturn});
}
`;
    const outputReturn = {
        position: `apply(uCamMat,worldPos)`,
        uvw: `input.uvw`,
        normal: `normalizeVec4s(uObjMat.normal * input.normal)`,
        pos: `worldPos`
    };
    function _generateVertShader(inputs, outputs) {
        const bindingOffset = inputs.length + 1;
        let header = commonHeader;
        let fourInputType = "";
        let fourOutputType = "";
        let fourOutputReturn = outputReturn.position;
        for (let i = 0, l = inputs.length; i < l; i++) {
            fourInputType += `
        @location(${i + 1}) ${inputs[i]}: mat4x4f,`;
        }
        if (outputs.length === 1) {
            fourOutputType = `
        @location(0) ${outputs[0]}: mat4x4f,`;
            fourOutputReturn += "," + outputReturn[outputs[0]];
        }
        else if (outputs.length === 2) {
            fourOutputType = `
        @location(0) ${outputs[0]}: mat4x4f,
        @location(1) ${outputs[1]}: mat4x4f`;
            fourOutputReturn += "," + outputReturn[outputs[0]] + "," + outputReturn[outputs[1]];
        }
        else if (outputs.length === 3) {
            fourOutputType = `
        @location(0) ${outputs[0]}_${outputs[1]}: array<mat4x4f,2>,
        @location(1) ${outputs[2]}: mat4x4f`;
            fourOutputReturn += ", array<mat4x4f,2>(" + outputReturn[outputs[0]] + "," +
                outputReturn[outputs[1]] + ")," + outputReturn[outputs[2]];
        }
        for (let i = 0; i < 32; i++) {
            header = header.replace(`@binding({${i}})`, `@binding(${i + bindingOffset})`);
        }
        return header.replace("{fourOutputReturn}", fourOutputReturn).replace("{fourOutputType}", fourOutputType).replace("{fourInputType}", fourInputType);
    }

    /** An iterative structure for Material */
    class MaterialNode {
        identifier;
        input = {};
        output;
        static constFractionDigits = 4;
        getCode(r, root, outputToken) { return ""; }
        getInputCode(r, root, token) {
            let out = {};
            let code = "";
            for (let [name, node] of globalThis.Object.entries(this.input)) {
                let inputToken = token + "_" + name;
                out[name] = inputToken;
                code += node.getCode(r, root, inputToken) + "\n";
            }
            return { token: out, code };
        }
        update(r) {
            for (let node of globalThis.Object.values(this.input)) {
                node.update(r);
            }
        }
        constructor(identifier) { this.identifier = identifier; }
    }
    /** Material is the top node of MaterialNode */
    let Material$1 = class Material extends MaterialNode {
        cullMode = "front";
        compiling = false;
        compiled = false;
        needsUpdate = true;
        output = "shader";
        pipeline;
        uuid;
        bindGroup;
        bindGroupBuffers = [];
        fetchBuffers = [];
        declUniforms = {};
        declUniformLocation = 0;
        declVarys = [];
        declHeaders;
        createBindGroup(r, p) {
            this.bindGroup = this.bindGroupBuffers.length ? [r.core.createFragmentShaderBindGroup(p, 0, this.bindGroupBuffers)] : [];
        }
        init(r) {
            this.getShaderCode(r); // scan code to get binding infomations
            this.compiling = false;
            this.compiled = true;
        }
        async compile(r) {
            this.compiling = true;
            r.pullPipeline(this.identifier, "compiling");
            let { vs, fs } = this.getShaderCode(r);
            this.pipeline = await r.core.createTetraSlicePipeline({
                vertex: { code: vs, entryPoint: "main" },
                fragment: { code: fs, entryPoint: "fourMain" },
                cullMode: this.cullMode
            });
            r.pullPipeline(this.identifier, this.pipeline);
            this.compiling = false;
            this.compiled = true;
        }
        // when a subnode uses vary input, call this function to check attribute buffer and construct input structure
        addVary(a) {
            if (!this.declVarys.includes(a)) {
                this.declVarys.push(a);
            }
            if (a == "pos")
                return;
            if (!this.fetchBuffers.includes(a)) {
                this.fetchBuffers.push(a);
            }
        }
        // when a subnode uses header, call this function to check whether headers are already included
        addHeader(key, value) {
            if (!this.declHeaders[key]) {
                this.declHeaders[key] = value;
            }
            else if (this.declHeaders[key] !== value) {
                console.warn(`Found multiple definition of header "${key}".`);
            }
        }
        // when a subnode uses uniform, call this function to add uniform globally
        addUniform(type, u, buffer) {
            if (!this.declUniforms[u]) {
                this.declUniforms[u] = { location: this.declUniformLocation++, type, buffer };
                this.bindGroupBuffers.push(buffer);
            }
        }
        fetchBuffer(g) {
            //sort buffer fetchBuffers
            return [g.gpuBuffer["position"], ...this.fetchBuffers.map(b => g.gpuBuffer[b])];
        }
        getShaderCode(r) {
            // what we need in jsData except for position buffer
            this.fetchBuffers = [];
            // renderPipeline's uniform variables except for world light (in another group)
            this.declUniforms = {};
            // output of computeShader, also input for fragment shader
            this.declVarys = [];
            this.bindGroupBuffers = [];
            // renderPipeline's uniform bindgroup's location number
            this.declUniformLocation = 0;
            this.declHeaders = {};
            // iteratively generate code
            let code = this.getCode(r, this, "");
            // deal no need for vary input
            let fsIn = this.declVarys.length ? 'vary: fourInputType' : "";
            let lightCode = r.lightShaderInfomation.lightCode;
            let headers = globalThis.Object.values(this.declHeaders).join("\n");
            // if no uniform at group0, then bind lights on 0, or 1
            if (this.declUniformLocation === 0) {
                lightCode = lightCode.replace("@group(1)", "@group(0)");
            }
            let header = headers + lightCode + `
    struct tsxAffineMat{
        matrix: mat4x4f,
        vector: vec4f,
    }
    @fragment fn fourMain(${fsIn}) -> @location(0) vec4f {
        let ambientLightDensity = uWorldLight.ambientLightDensity.xyz;`; // avoid basic material doesn't call this uniform at all
            // if frag shader has input, we need to construct a struct fourInputType
            if (fsIn) {
                let struct = `    struct fourInputType{\n`;
                for (let i = 0, l = this.declVarys.length; i < l; i++) {
                    struct += `        @location(${i}) ${this.declVarys[i]}: vec4f,\n`;
                }
                struct += "    }\n";
                header = struct + header;
            }
            for (let [u, { location, type }] of globalThis.Object.entries(this.declUniforms)) {
                header = `   @group(0) @binding(${location}) var<uniform> ${u}:${type};\n` + header;
            }
            // we use the result from getCode to generate needed vertex variables
            return { vs: _generateVertShader(this.fetchBuffers, this.declVarys), fs: header + code + `\n   }` };
        }
        constructor(identifiers) {
            super(identifiers);
            this.uuid = generateUUID();
        }
        gpuUniformBuffer;
    };
    /** ConstValue will be hardcoded in shader */
    class ConstValue extends MaterialNode {
        getCode(r, root, outputToken) {
            return `
                const ${outputToken} = ${this.identifier};`;
        }
        constructor(identifier) {
            super(identifier);
        }
    }
    class ColorConstValue extends ConstValue {
        constructor(color) {
            let r = color?.r ?? color[0] ?? 0;
            let g = color?.g ?? color[1] ?? 0;
            let b = color?.b ?? color[2] ?? 0;
            let a = color?.a ?? color[3] ?? 1;
            super(`vec4f(${r.toFixed(MaterialNode.constFractionDigits)},${g.toFixed(MaterialNode.constFractionDigits)},${b.toFixed(MaterialNode.constFractionDigits)},${a.toFixed(MaterialNode.constFractionDigits)})`);
        }
    }
    class Vec4ConstValue extends ConstValue {
        constructor(vec) {
            super(`vec4f(${vec.flat().map(n => n.toFixed(MaterialNode.constFractionDigits)).join(",")})`);
        }
    }
    class FloatConstValue extends ConstValue {
        constructor(f) {
            super(f.toFixed(MaterialNode.constFractionDigits));
        }
    }
    class TransformConstValue extends ConstValue {
        constructor(v) {
            let afmat = v.getAffineMat4();
            let matEntries = afmat.mat.ts().elem.map(n => n.toFixed(MaterialNode.constFractionDigits)).join(",");
            let vecEntries = afmat.vec.flat().map(n => n.toFixed(MaterialNode.constFractionDigits)).join(",");
            super(`tsxAffineMat(mat4x4f(${matEntries}),vec4f(${vecEntries}))`);
        }
    }
    /** the same UniformValue instance will share one uniform buffer */
    class UniformValue extends MaterialNode {
        gpuBuffer;
        gpuBufferSize;
        jsBufferSize;
        type;
        needsUpdate = true;
        constructor() {
            super("u" + generateUUID().replace(/\-/g, "").slice(16));
        }
        getCode(r, root, outputToken) {
            if (!this.gpuBuffer) {
                this.createBuffer(r);
            }
            root.addUniform(this.type, this.identifier, this.gpuBuffer);
            return `
                let ${outputToken} = ${this.identifier};`;
        }
        createBuffer(r) {
            this.gpuBuffer = r.gpu.createBuffer(GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM, this.gpuBufferSize, "uConstValueBuffer");
            this.jsBufferSize = this.gpuBufferSize >> 2;
        }
        _update(r) { }
        update(r) {
            if (!this.needsUpdate)
                return;
            this._update(r);
            r.gpu.device.queue.writeBuffer(this.gpuBuffer, 0, r.jsBuffer, 0, this.jsBufferSize);
            this.needsUpdate = false;
        }
    }
    class ColorUniformValue extends UniformValue {
        type = "vec4f";
        gpuBufferSize = 4 * 4;
        value;
        _update(r) {
            r.jsBuffer[0] = this.value?.r ?? this.value[0] ?? 0;
            r.jsBuffer[1] = this.value?.g ?? this.value[1] ?? 0;
            r.jsBuffer[2] = this.value?.b ?? this.value[2] ?? 0;
            r.jsBuffer[3] = this.value?.a ?? this.value[3] ?? 1;
        }
        write(value) {
            this.value = value;
            this.needsUpdate = true;
        }
    }
    class Vec4UniformValue extends UniformValue {
        type = "vec4f";
        gpuBufferSize = 4 * 4;
        value;
        _update(r) {
            this.value.writeBuffer(r.jsBuffer);
        }
        write(value) {
            this.value = value;
            this.needsUpdate = true;
        }
    }
    class FloatUniformValue extends UniformValue {
        type = "f32";
        gpuBufferSize = 4;
        value;
        _update(r) {
            r.jsBuffer[0] = this.value;
        }
        write(value) {
            this.value = value;
            this.needsUpdate = true;
        }
    }
    class TransformUniformValue extends UniformValue {
        type = "tsxAffineMat";
        gpuBufferSize = 20 * 4;
        value;
        affineMatValue = new AffineMat4();
        _update(r) {
            this.affineMatValue.setFromObj4(this.value).writeBuffer(r.jsBuffer);
        }
        write(value) {
            this.value = value;
            this.needsUpdate = true;
        }
    }
    /** A shortcut path for writing a constant color */
    function makeColorOutput(color) {
        if (!(color instanceof MaterialNode))
            color = new ColorConstValue(color);
        return color;
    }
    /** A shortcut path for writing a constant color */
    function makeFloatOutput(f) {
        if (!(f instanceof MaterialNode))
            f = new FloatConstValue(f);
        return f;
    }
    /** Basic material just return color node's output color  */
    class BasicMaterial extends Material$1 {
        constructor(color) {
            color = makeColorOutput(color);
            super("Basic(" + color.identifier + ")");
            this.input = { color };
        }
        getCode(r, root, outputToken) {
            let color = this.input.color.getCode(r, root, "color");
            return color + `
                return color;`;
        }
    }
    class LambertMaterial extends Material$1 {
        getCode(r, root, outputToken) {
            root.addVary("normal");
            root.addVary("pos");
            let color = this.input.color.getCode(r, root, "color");
            return color + `
                var radiance = ambientLightDensity;
                for(var i=0;i<${r.lightShaderInfomation.posdirLightsNumber};i++){
                    var N = vec4f(0.0);
                    if(uWorldLight.posdirLights[i].density.w<-0.5){
                        N = uWorldLight.posdirLights[i].pos_dir;
                    }else if(uWorldLight.posdirLights[i].density.w>0.5){
                        N = uWorldLight.posdirLights[i].pos_dir - vary.pos;
                        N *= pow(length(N),-uWorldLight.posdirLights[i].density.w); // decay by distance
                    }
                    radiance += uWorldLight.posdirLights[i].density.rgb * max(0.0,dot(vary.normal,N));
                }
                for(var i=0;i<${r.lightShaderInfomation.spotLightsNumber};i++){
                    if(uWorldLight.spotLights[i].density.w>0.5){
                        var N = uWorldLight.spotLights[i].pos - vary.pos;
                        let len = length(N);
                        let penumbra = max(0.0,dot(N / len,uWorldLight.spotLights[i].dir)*uWorldLight.spotLights[i].params.x + uWorldLight.spotLights[i].params.y);
                        N *= pow(len,-uWorldLight.spotLights[i].params.w) * pow(penumbra, uWorldLight.spotLights[i].params.z);
                        radiance += uWorldLight.spotLights[i].density.rgb * max(0.0,dot(vary.normal,N));
                    }
                }
                return vec4f(acesFilm((color.rgb + blackColor) * radiance), color.a);`;
        }
        constructor(color) {
            color = makeColorOutput(color);
            super("Lambert(" + color.identifier + ")");
            this.input = { color };
        }
    }
    /** Blinn Phong */
    class PhongMaterial extends Material$1 {
        getCode(r, root, outputToken) {
            root.addVary("normal");
            root.addVary("pos");
            root.addUniform("array<tsxAffineMat,2>", "uCamMat", r.uCamMatBuffer);
            let { code } = this.getInputCode(r, root, outputToken);
            return code + `
                var radiance = ambientLightDensity;
                var specularRadiance = vec3<f32>(0.0);
                let viewRay = -normalize(vary.pos - uCamMat[1].vector);
                for(var i=0;i<${r.lightShaderInfomation.posdirLightsNumber};i++){
                    var N = vec4f(0.0);
                    var D = 0.0;
                    if(uWorldLight.posdirLights[i].density.w<-0.5){
                        D = 1.0;
                        N = uWorldLight.posdirLights[i].pos_dir;
                    }else if(uWorldLight.posdirLights[i].density.w>0.5){
                        N = uWorldLight.posdirLights[i].pos_dir - vary.pos;
                        let len = length(N);
                        D = pow(len,1.0 - uWorldLight.posdirLights[i].density.w); // decay by distance
                        N /= len;
                    }else{
                        continue;
                    }
                    let halfvec = normalize(N + viewRay);
                    radiance += uWorldLight.posdirLights[i].density.rgb *  D * max(0.0,dot(vary.normal,N));
                    specularRadiance += uWorldLight.posdirLights[i].density.rgb *  D * max(0.0,pow(dot(vary.normal,halfvec),_shininess) ) ;
                }
                for(var i=0;i<${r.lightShaderInfomation.spotLightsNumber};i++){
                    if(uWorldLight.spotLights[i].density.w>0.5){
                        
                        var N = uWorldLight.spotLights[i].pos - vary.pos;
                        let len = length(N);
                        N /= len;
                        let penumbra = max(0.0,dot(N,uWorldLight.spotLights[i].dir)*uWorldLight.spotLights[i].params.x + uWorldLight.spotLights[i].params.y);
                        let D = pow(len,1.0-uWorldLight.spotLights[i].params.w) * pow(penumbra, uWorldLight.spotLights[i].params.z);
                        let halfvec = normalize(N + viewRay);
                        
                        radiance += uWorldLight.spotLights[i].density.rgb *  D * max(0.0,dot(vary.normal,N));
                        specularRadiance += uWorldLight.spotLights[i].density.rgb *  D * max(0.0,pow(dot(vary.normal,halfvec),_shininess) ) ;
                    }
                }
                return vec4f(acesFilm((_color.rgb+blackColor) * radiance + _specular.rgb * specularRadiance), _color.a);`;
        }
        constructor(color, shininess, specular) {
            color = makeColorOutput(color);
            specular = makeColorOutput(specular ?? [1, 1, 1]);
            shininess = makeFloatOutput(shininess ?? 20.0);
            super("Phong(" + color.identifier + "," + specular.identifier + "," + shininess.identifier + ")");
            this.input = { color, shininess, specular };
        }
    }
    class CheckerTexture extends MaterialNode {
        getCode(r, root, outputToken) {
            // Tell root material that CheckerTexture needs deal dependency of vary input uvw
            let { token, code } = this.getInputCode(r, root, outputToken);
            return code + `
                let ${outputToken}_checker = fract(${token.uvw}+vec4f(0.001)) - vec4f(0.5);
                let ${outputToken} = mix(${token.color1},${token.color2},step( ${outputToken}_checker.x * ${outputToken}_checker.y * ${outputToken}_checker.z * ${outputToken}_checker.w, 0.0));
                `;
        }
        constructor(color1, color2, uvw) {
            color1 = makeColorOutput(color1);
            color2 = makeColorOutput(color2);
            uvw ??= new UVWVec4Input();
            super(`Checker(${color1.identifier},${color2.identifier},${uvw.identifier})`);
            this.input = { color1, color2, uvw };
        }
    }
    class WgslTexture extends MaterialNode {
        wgslCode;
        entryPoint;
        getCode(r, root, outputToken) {
            root.addHeader(this.entryPoint, this.wgslCode);
            let { token, code } = this.getInputCode(r, root, outputToken);
            return code + `
                let ${outputToken} = ${this.entryPoint}(${token.uvw});
                `;
        }
        constructor(wgslCode, entryPoint, uvw) {
            uvw ??= new UVWVec4Input();
            super(`Wgsl(${wgslCode},${uvw.identifier})`);
            this.wgslCode = wgslCode.replace(new RegExp("\b" + entryPoint + "\b", "g"), "##");
            this.input = { uvw };
            this.entryPoint = entryPoint;
        }
    }
    class GridTexture extends MaterialNode {
        getCode(r, root, outputToken) {
            // Tell root material that CheckerTexture needs deal dependency of vary input uvw
            let { token, code } = this.getInputCode(r, root, outputToken);
            return code + `
                let ${outputToken}_grid = step(${token.gridWidth}, fract(${token.uvw}));
                let ${outputToken} = mix(${token.color1},${token.color2},${outputToken}_grid.x*${outputToken}_grid.y*${outputToken}_grid.z);
                `;
        }
        constructor(color1, color2, gridWidth, uvw) {
            color1 = makeColorOutput(color1);
            color2 = makeColorOutput(color2);
            gridWidth = !(gridWidth instanceof MaterialNode) ? new Vec4ConstValue((gridWidth instanceof Vec4) ? gridWidth : new Vec4(gridWidth, gridWidth, gridWidth, gridWidth)) : gridWidth;
            uvw ??= new UVWVec4Input();
            super(`Grid(${color1.identifier},${color2.identifier}),${gridWidth.identifier},${uvw.identifier}`);
            this.input = { color1, color2, gridWidth, uvw };
        }
    }
    class UVWVec4Input extends MaterialNode {
        getCode(r, root, outputToken) {
            root.addVary("uvw");
            return `
                let ${outputToken} = vary.uvw;`;
        }
        constructor() {
            super("vary.uvw");
        }
    }
    class WorldCoordVec4Input extends MaterialNode {
        getCode(r, root, outputToken) {
            root.addVary("pos");
            return `
                let ${outputToken} = vary.pos;`;
        }
        constructor() {
            super("vary.pos");
        }
    }
    class Vec4TransformNode extends MaterialNode {
        getCode(r, root, outputToken) {
            let input = this.getInputCode(r, root, outputToken);
            let affine = input.token.transform;
            return input.code + `
                let ${outputToken} = ${affine}.matrix * ${input.token.vec4} + ${affine}.vector;`;
        }
        constructor(vec4, transform) {
            transform = (!(transform instanceof MaterialNode)) ? new TransformConstValue(transform) : transform;
            super("vec4tr(" + vec4.identifier + "," + transform.identifier + ")");
            this.input = { vec4, transform };
        }
    }
    /** simplex 3D noise */
    const NoiseWGSLHeader = `
        fn mod289v3(x:vec3<f32>)->vec3<f32> {
            return x - floor(x * (1.0 / 289.0)) * 289.0; 
        }
        fn mod289v4(x:vec4f)->vec4f {
            return x - floor(x * (1.0 / 289.0)) * 289.0; 
        }
        fn mod289f(x:f32)->f32 {
            return x - floor(x * (1.0 / 289.0)) * 289.0; 
        }
        fn permutev4(x:vec4f)->vec4f {
            return mod289v4(((x * 34.0) + 1.0) * x);
        }
        fn permutef(x:f32)-> f32 {
            return mod289f(((x * 34.0) + 1.0) * x);
        }
        fn taylorInvSqrtv4(r:vec4f)->vec4f {
            return vec4(1.79284291400159) - 0.85373472095314 * r;
        }
        fn taylorInvSqrtf(r:f32)->f32{
            return 1.79284291400159 - 0.85373472095314 * r;
        }
        
        fn snoise(v1:vec3<f32>)->f32{
            let v = v1 + vec3(0.00001,0.00002,0.00003);
            const C = vec2(1.0/6.0, 1.0/3.0);
            const D = vec4(0.0, 0.5, 1.0, 2.0);

            // First corner
            var i  = floor(v + dot(v, vec3(C.y)) );
            let x0 =   v - i + dot(i, vec3(C.x)) ;

            // Other corners
            let g = step(x0.yzx, x0.xyz);
            let l = 1.0 - g;
            let i1 = min( g.xyz, l.zxy );
            let i2 = max( g.xyz, l.zxy );

            let x1 = x0 - i1 + vec3(C.x);
            let x2 = x0 - i2 + vec3(C.y); // 2.0*C.x = 1/3 = C.y
            let x3 = x0 - vec3(D.y);      // -1.0+3.0*C.x = -0.5 = -D.y

            // Permutations
            i = mod289v3(i);
            let p = permutev4( permutev4( permutev4(
                        vec4(i.z) + vec4(0.0, i1.z, i2.z, 1.0 ))
                    + vec4(i.y) + vec4(0.0, i1.y, i2.y, 1.0 ))
                    + vec4(i.x) + vec4(0.0, i1.x, i2.x, 1.0 ));

            // Gradients: 7x7 points over a square, mapped onto an octahedron.
            // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
            const n_ = 0.142857142857; // 1.0/7.0
            let  ns = n_ * D.wyz - D.xzx;

            let j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

            let x_ = floor(j * ns.z);
            let y_ = floor(j - 7.0 * x_ );    // mod(j,N)

            let x = x_ *ns.x + vec4(ns.y);
            let y = y_ *ns.x + vec4(ns.y);
            let h = 1.0 - abs(x) - abs(y);

            let b0 = vec4( x.xy, y.xy );
            let b1 = vec4( x.zw, y.zw );

            //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
            //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
            let s0 = floor(b0)*2.0 + 1.0;
            let s1 = floor(b1)*2.0 + 1.0;
            let sh = -step(h, vec4(0.0));

            let a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
            let a1 = b1.xzyw + s1.xzyw*sh.zzww ;

            var p0 = vec3(a0.xy,h.x);
            var p1 = vec3(a0.zw,h.y);
            var p2 = vec3(a1.xy,h.z);
            var p3 = vec3(a1.zw,h.w);

            //Normalise gradients
            let norm = taylorInvSqrtv4(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
            p0 *= norm.x;
            p1 *= norm.y;
            p2 *= norm.z;
            p3 *= norm.w;

            // Mix final noise value
            var m = max(vec4(0.6) - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), vec4(0.0));
            m = m * m;
            return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
        }
        `;
    class ColorMixer extends MaterialNode {
        getCode(r, root, outputToken) {
            // Tell root material that CheckerTexture needs deal dependency of vary input uvw
            let { token, code } = this.getInputCode(r, root, outputToken);
            return code + `
                let ${outputToken} = mix(${token.color1},${token.color2},${token.mix});
                `;
        }
        constructor(color1, color2, mix) {
            color1 = makeColorOutput(color1);
            color2 = makeColorOutput(color2);
            mix = makeFloatOutput(mix);
            super(`Mixer(${color1.identifier},${color2.identifier},${mix.identifier})`);
            this.input = { color1, color2, mix };
        }
    }
    class NoiseTexture extends MaterialNode {
        getCode(r, root, outputToken) {
            root.addHeader("NoiseWGSLHeader", NoiseWGSLHeader);
            let { token, code } = this.getInputCode(r, root, outputToken);
            return code + `
                let ${outputToken} = snoise(${token.uvw});
                `;
        }
        constructor(uvw) {
            uvw ??= new UVWVec4Input();
            super(`Noise(${uvw.identifier})`);
            this.input = { uvw };
        }
    }

    class ObjFile {
        data;
        constructor(data) {
            this.data = this.stringify(data);
        }
        stringify(data) {
            if (typeof data === "string")
                return data;
            let out = "# Tesserxel ObjFile Parser\n# github.com/wxyhly/tesserxel\n";
            out += writeVertexLike("v", data.position);
            if (data.normal)
                out += writeVertexLike("vn", data.normal);
            if (data.uvw)
                out += writeVertexLike("vt", data.uvw);
            if (data.positionIndex) {
                let m = data;
                out += writeFaceLike("t", m.positionIndex, m.uvwIndex, m.normalIndex, 4);
                return out;
            }
            let m = data;
            if (m.triangle) {
                out += writeFaceLike("f", m.triangle.position, m.triangle.uvw, m.triangle.normal, 3);
            }
            if (m.quad) {
                out += writeFaceLike("f", m.quad.position, m.quad.uvw, m.quad.normal, 4);
            }
            return out;
            function writeVertexLike(identifier, data) {
                let out = "\n";
                const reg = new RegExp(" " + (0).toPrecision(7) + "$", "g");
                for (let i = 0, l = data.length; i < l; i += 4) {
                    let line = identifier;
                    for (let q = 0; q < 4; q++) {
                        line += " " + data[i + q].toPrecision(7);
                    }
                    line = line.trim().replace(reg, "");
                    if (identifier === "vt")
                        line = line.replace(reg, "");
                    out += line + "\n";
                }
                return out;
            }
            function writeFaceLike(identifier, v, vt, vn, stride) {
                let out = "\n";
                for (let i = 0, l = v.length; i < l; i += stride) {
                    let line = identifier;
                    for (let q = 0; q < stride; q++) {
                        line += " " + (v[i + q] + 1);
                        if (vt)
                            line += "/" + (vt[i + q] + 1);
                        if (vn)
                            line += "/" + (vn[i + q] + 1);
                        line = line.replace(/\/+$/, "");
                    }
                    out += line + "\n";
                }
                return out;
            }
        }
        parse() {
            let lines = this.data.split("\n");
            let v = [];
            let vt = [];
            let vn = [];
            let quad = {
                v: [],
                vt: [],
                vn: [],
            };
            let tetra = {
                v: [],
                vt: [],
                vn: [],
            };
            let triangle = {
                v: [],
                vt: [],
                vn: [],
            };
            for (let i = 0, l = lines.length; i < l; i++) {
                let line = lines[i].trim();
                if (isCommentOrEmpty(line))
                    continue;
                let splitArr = line.toLowerCase().split(/\s/g);
                switch (splitArr[0]) {
                    case "o":
                        // parseObj(splitArr);
                        break;
                    case "v":
                        parseVertexLike(v, splitArr);
                        break;
                    case "vt":
                        parseVertexLike(vt, splitArr);
                        break;
                    case "vn":
                        parseVertexLike(vn, splitArr);
                        break;
                    case "f":
                        if (splitArr.length === 5) {
                            parseFaceLike(quad, splitArr);
                        }
                        else if (splitArr.length === 4) {
                            parseFaceLike(triangle, splitArr);
                        }
                        else {
                            error(i, "Unsupported polygonal face: Only triangles and quads are allowed.");
                        }
                        break;
                    case "t":
                        if (splitArr.length === 5) {
                            parseFaceLike(tetra, splitArr);
                        }
                        else {
                            error(i, `Vertices of tetrahedron must be 4, found ${splitArr.length - 1} vertices.`);
                        }
                }
            }
            let out = tetra.v.length ? {
                position: new Float32Array(v),
                positionIndex: new Uint32Array(tetra.v)
            } : {
                position: new Float32Array(v)
            };
            if (vt.length)
                out.uvw = new Float32Array(vt);
            if (vn.length)
                out.normal = new Float32Array(vn);
            if (triangle.v.length) {
                out.triangle = {
                    position: new Uint32Array(triangle.v)
                };
                if (triangle.vt.length)
                    out.triangle.uvw = new Uint32Array(triangle.vt);
                if (triangle.vn.length)
                    out.triangle.normal = new Uint32Array(triangle.vn);
            }
            if (quad.v.length) {
                out.quad = {
                    position: new Uint32Array(quad.v)
                };
                if (quad.vt.length)
                    out.quad.uvw = new Uint32Array(quad.vt);
                if (quad.vn.length)
                    out.quad.normal = new Uint32Array(quad.vn);
            }
            if (tetra.v.length) {
                if (tetra.vt.length)
                    out.uvwIndex = new Uint32Array(tetra.vt);
                if (tetra.vn.length)
                    out.normalIndex = new Uint32Array(tetra.vn);
            }
            return out;
            function parseVertexLike(dst, splitArr) {
                while (splitArr.length < 5) {
                    splitArr.push("0");
                }
                for (let i = 1, l = splitArr.length; i < l; i++) {
                    dst.push(Number(splitArr[i]));
                }
            }
            function parseFaceLike(dst, splitArr) {
                for (let i = 1, l = splitArr.length; i < l; i++) {
                    let attrs = splitArr[i].split("/");
                    dst.v.push(Number(attrs[0]) - 1);
                    if (attrs[1])
                        dst.vt.push(Number(attrs[1]) - 1);
                    if (attrs[2])
                        dst.vn.push(Number(attrs[2]) - 1);
                }
            }
            function isCommentOrEmpty(line) {
                return line === "" || line[0] === "#";
            }
            function error(line, msg) {
                console.error("ObjFileParser: " + msg + "\n at line " + line + `"${lines[line]}"`);
            }
        }
    }

    function polytope(schlafli) {
        const m = new CWMesh();
        if (!schlafli) {
            m.data = [[new Vec4]];
            return m;
        }
        if (schlafli.length === 0) {
            m.data = [[Vec4.xNeg.clone(), Vec4.x.clone()], [[0, 1]]];
            return m;
        }
        const dim = schlafli.length + 1;
        m.data = new Polytope(schlafli).getRegularPolytope();
        m.data.push([m.data[dim - 1].map((_, i) => i)]);
        m.calculateOrientationInFace(dim, 0);
        m.flipOrientation(dim - 1, Array.from(m.orientation[dim][0].entries()).filter(([idx, o]) => o === false).map(([idx, o]) => m.data[dim][0][idx]));
        return m;
    }
    function truncatedPolytope(schlafli, t) {
        const m = new CWMesh();
        if (!schlafli) {
            m.data = [[new Vec4]];
            return m;
        }
        if (schlafli.length === 0) {
            m.data = [[Vec4.xNeg.clone(), Vec4.x.clone()], [[0, 1]]];
            return m;
        }
        const dim = schlafli.length + 1;
        m.data = new Polytope(schlafli).getTrucatedRegularPolytope(t);
        m.data.push([m.data[dim - 1].map((_, i) => i)]);
        m.calculateOrientationInFace(dim, 0);
        m.flipOrientation(dim - 1, Array.from(m.orientation[dim][0].entries()).filter(([idx, o]) => o === false).map(([idx, o]) => m.data[dim][0][idx]));
        return m;
    }
    function bitruncatedPolytope(schlafli, t = 0.5) {
        const m = new CWMesh();
        if (!schlafli) {
            m.data = [[new Vec4]];
            return m;
        }
        const dim = schlafli.length + 1;
        m.data = new Polytope(schlafli).getBitrucatedRegularPolytope(t);
        m.data.push([m.data[dim - 1].map((_, i) => i)]);
        m.calculateOrientationInFace(dim, 0);
        m.flipOrientation(dim - 1, Array.from(m.orientation[dim][0].entries()).filter(([idx, o]) => o === false).map(([idx, o]) => m.data[dim][0][idx]));
        return m;
    }
    function path(points, closed) {
        const mesh = new CWMesh;
        let n;
        if (typeof points === "number") {
            // abstract cwmesh
            mesh.data[0] = new Array(points).fill([]);
            n = points;
        }
        else {
            mesh.data[0] = points.slice(0);
            n = points.length;
        }
        mesh.data[1] = [];
        for (let i = 0; i < n - 1; i++) {
            mesh.data[1].push([i, i + 1]);
        }
        if (closed)
            mesh.data[1].push([n - 1, 0]);
        // throw "not test yet";
        return mesh;
    }
    function range$1(i) {
        const arr = [];
        for (let j = 0; j < i; j++) {
            arr.push(j);
        }
        return arr;
    }
    function solidTorus(majorRadius, minorRadius, u, v) {
        const circle = polytope([u]).apply(v => v.set(v.x * minorRadius + majorRadius, 0, v.y * minorRadius));
        circle.makeRotatoid(Bivec.xy, v);
        return circle;
    }
    function ball2(u, v) {
        const arr = [];
        const dangle = _180 / (v + 2);
        for (let i = dangle, j = 0; j < v; i += dangle, j++) {
            arr.push(new Vec4(0, Math.sin(i), Math.cos(i)));
        }
        // longitude without 2 polar points
        const longitude = path(arr);
        const info = longitude.makeRotatoid(Bivec.xy, u);
        const northLines = new Set();
        const southLines = new Set();
        for (const [equatorLineId, subinfo] of info[1]) {
            northLines.add(subinfo[0].get(0));
            southLines.add(subinfo[0].get(v - 1));
        }
        longitude.makePyramid(new Vec4(0, 0, 1), new CWMeshSelection(longitude, [undefined, northLines]));
        longitude.makePyramid(new Vec4(0, 0, -1), new CWMeshSelection(longitude, [undefined, southLines]));
        longitude.data[3] = [range$1(longitude.data[2].length)];
        longitude.calculateOrientationInFace(3, 0);
        return longitude;
    }
    function ball3(u, v, w) {
        // todo
    }

    var geoms = /*#__PURE__*/Object.freeze({
        __proto__: null,
        ball2: ball2,
        ball3: ball3,
        bitruncatedPolytope: bitruncatedPolytope,
        path: path,
        polytope: polytope,
        solidTorus: solidTorus,
        truncatedPolytope: truncatedPolytope
    });

    function range(i) {
        const arr = [];
        for (let j = 0; j < i; j++) {
            arr.push(j);
        }
        return arr;
    }
    class CWMeshSelection {
        cwmesh;
        selData;
        constructor(cwmesh, data) {
            this.cwmesh = cwmesh;
            this.selData = data ?? [];
        }
        clone() {
            return new CWMeshSelection(this.cwmesh, this.selData.map(set => new Set(set)));
        }
        /// this function modify selection into closure
        closure() {
            const sel = this.selData;
            for (let dim = sel.length - 1; dim > 0; dim--) {
                if (!sel[dim])
                    continue;
                const faces = this.cwmesh.data[dim];
                for (const faceId of sel[dim]) {
                    for (const d_faceId of faces[faceId]) {
                        sel[dim - 1] ??= new Set();
                        sel[dim - 1].add(d_faceId);
                    }
                }
            }
            return this;
        }
        addFace(dim, faceId) {
            const seldata = this.selData;
            seldata[dim] ??= new Set;
            seldata[dim].add(faceId);
            return this;
        }
    }
    class CWMesh {
        data = [];
        orientation = [];
        clone() {
            const newcwmesh = new CWMesh();
            newcwmesh.data = this.data.map(dataDim => dataDim ? dataDim.map((face) => face instanceof Vec4 ? face.clone() : face.slice(0)) : undefined);
            newcwmesh.orientation = this.orientation.map(oDim => oDim ? oDim.map((faceO) => faceO.slice(0)) : undefined);
            return newcwmesh;
        }
        /* structure normalizations */
        /// faces must be orientated
        sort2DFace() {
            const d_faces = this.data[1];
            const facesO = this.orientation[2];
            const faces = this.data[2];
            for (const [faceId, face] of faces.entries()) {
                const faceO = facesO[faceId];
                const dd2nextdfaceMap = new Map();
                for (const [d_faceIdx, d_faceId] of face.entries()) {
                    const d_face = d_faces[d_faceId];
                    const o = faceO[d_faceIdx];
                    dd2nextdfaceMap.set(d_face[o ? 0 : 1], d_faceIdx);
                }
                let curIdx = 0;
                let newOrder = [curIdx];
                const faceLength = face.length;
                while (true) {
                    const d_faceId = face[curIdx];
                    const next_dd_faceIdx = faceO[curIdx] ? 1 : 0;
                    const dd_faceId = d_faces[d_faceId][next_dd_faceIdx];
                    curIdx = dd2nextdfaceMap.get(dd_faceId);
                    if (curIdx === 0)
                        break;
                    newOrder.push(curIdx);
                    if (newOrder.length > faceLength) {
                        console.error("Non manifold structure found.");
                        break;
                    }
                }
                faces[faceId] = newOrder.map(i => face[i]);
                facesO[faceId] = newOrder.map(i => faceO[i]);
            }
        }
        flipOrientation(dim, faceIds) {
            faceIds ??= range(this.data[dim].length);
            if (dim === 0)
                throw "Vertex orientation flip is not implemented";
            if (dim === 1) {
                const edgeTable = this.data[1];
                for (const faceId of faceIds) {
                    const edge = edgeTable[faceId];
                    const a = edge[0];
                    edge[0] = edge[1];
                    edge[1] = a;
                }
            }
            else {
                const oTable = this.orientation[dim];
                if (!oTable)
                    throw "Orientation is undefiend";
                for (const faceId of faceIds) {
                    const o = oTable[faceId];
                    if (o === undefined)
                        throw "Orientation is undefiend";
                    for (let i = 0; i < o.length; i++)
                        o[i] = !o[i];
                }
            }
            const cellTable = this.data[dim + 1];
            const cellOTable = this.orientation[dim + 1];
            if (!cellOTable)
                return;
            for (const [cellId, cell] of cellTable.entries()) {
                for (const [faceIdx, faceId] of cell.entries()) {
                    if (faceIds.includes(faceId)) {
                        cellOTable[cellId][faceIdx] = !cellOTable[cellId][faceIdx];
                    }
                }
            }
        }
        /** tested with bug here (for examples/#cwmesh::duopy5 ), some faces orientations are not consisted */
        // now, makeDual doesn't use this function anymore
        calculateOrientation(dim, faceIds) {
            if (dim === 0)
                return;
            if (dim === 1)
                return; // edge: [-1, 1]
            faceIds ??= range(this.data[dim].length);
            const d2ftable = new Map;
            const faces = faceIds.map(faceId => this.data[dim][faceId]);
            for (const [faceIdx, faceId] of faceIds.entries()) {
                const face = faces[faceIdx];
                // if face not oriented yet, deal with it first
                if (dim !== 2) {
                    this.orientation[dim] ??= [];
                    if (!this.orientation[dim][faceId])
                        this.calculateOrientationInFace(dim, faceId);
                }
                // get all d_face and its table
                for (const [d_faceIdx, d_faceId] of face.entries()) {
                    if (!d2ftable.has(d_faceId))
                        d2ftable.set(d_faceId, new Array());
                    d2ftable.get(d_faceId).push([d_faceIdx, faceIdx]);
                }
            }
            let current_faceIdxs = [];
            let current_faceIdx = 0;
            const fOTable = this.orientation[dim];
            const faceO = [];
            while (current_faceIdx !== undefined) {
                const currentFaceId = faceIds[current_faceIdx];
                for (const [d_faceIdx, d_faceId] of faces[current_faceIdx].entries()) {
                    const ajacent_faceIdxs = d2ftable.get(d_faceId);
                    if (ajacent_faceIdxs.length > 2)
                        throw "Non manifold structure found";
                    if (ajacent_faceIdxs.length === 1)
                        continue;
                    let [next_d_faceIdx, next_faceIdx] = ajacent_faceIdxs[0][1] === current_faceIdx ? ajacent_faceIdxs[1] : ajacent_faceIdxs[0];
                    if (faceO[next_faceIdx] !== undefined)
                        continue;
                    const d_faceOInCurrentFace = dim === 2 ? 1 === d_faceIdx : fOTable[currentFaceId][d_faceIdx];
                    const d_faceOInNextFace = dim === 2 ? 1 === next_d_faceIdx : fOTable[faceIds[next_faceIdx]][next_d_faceIdx];
                    faceO[next_faceIdx] = (faceO[current_faceIdx] === d_faceOInCurrentFace) !== d_faceOInNextFace;
                    current_faceIdxs.push(next_faceIdx);
                }
                current_faceIdx = current_faceIdxs.pop();
            }
            this.flipOrientation(dim, faceO.map((o, idx) => [o, faceIds[idx]]).filter(([o, id]) => !o).map(([o, id]) => id));
        }
        calculateOrientationInFace(dim, faceId) {
            this.orientation ??= [];
            this.orientation[dim] ??= [];
            if (this.orientation[dim][faceId])
                return;
            if (dim === 0)
                return;
            if (dim === 1)
                return; // edge: [-1, 1]
            const face = this.data[dim][faceId];
            // if d_face not oriented yet, deal with it first
            if (dim !== 2) {
                for (const d_faceId of face) {
                    this.orientation[dim - 1] ??= [];
                    if (!this.orientation[dim - 1][d_faceId])
                        this.calculateOrientationInFace(dim - 1, d_faceId);
                }
            }
            // get all dd_face and its table
            const dd2dtable = new Map;
            const d_faces = face.map(d_faceId => this.data[dim - 1][d_faceId]);
            let d_faceIdx = 0;
            for (const d_face of d_faces) {
                for (const [dd_faceIdx, dd_faceId] of d_face.entries()) {
                    if (!dd2dtable.has(dd_faceId))
                        dd2dtable.set(dd_faceId, new Array());
                    dd2dtable.get(dd_faceId).push([dd_faceIdx, d_faceIdx]);
                }
                d_faceIdx++;
            }
            const faceO = new Array(face.length);
            faceO[0] = true;
            let current_d_faceIdxs = [];
            let current_d_faceIdx = 0;
            const dfOTable = this.orientation[dim - 1];
            while (current_d_faceIdx !== undefined) {
                const currentFaceId = face[current_d_faceIdx];
                for (const [dd_faceIdx, dd_faceId] of d_faces[current_d_faceIdx].entries()) {
                    const ajacent_d_faceIdxs = dd2dtable.get(dd_faceId);
                    if (ajacent_d_faceIdxs.length > 2)
                        throw "Non manifold structure found";
                    if (ajacent_d_faceIdxs.length === 1)
                        continue;
                    let [next_dd_faceIdx, next_d_faceIdx] = ajacent_d_faceIdxs[0][1] === current_d_faceIdx ? ajacent_d_faceIdxs[1] : ajacent_d_faceIdxs[0];
                    if (faceO[next_d_faceIdx] !== undefined)
                        continue;
                    const dd_faceOInCurrentFace = dim === 2 ? 1 === dd_faceIdx : dfOTable[currentFaceId][dd_faceIdx];
                    const dd_faceOInNextFace = dim === 2 ? 1 === next_dd_faceIdx : dfOTable[face[next_d_faceIdx]][next_dd_faceIdx];
                    faceO[next_d_faceIdx] = (faceO[current_d_faceIdx] === dd_faceOInCurrentFace) !== dd_faceOInNextFace;
                    current_d_faceIdxs.push(next_d_faceIdx);
                }
                current_d_faceIdx = current_d_faceIdxs.pop();
            }
            this.orientation[dim][faceId] = faceO;
        }
        /// this will reorder faceIds after deleting
        deleteSelection(sel) {
            const remapping = [];
            for (const [dim, selDim] of sel.selData.entries()) {
                if (!selDim)
                    continue;
                remapping[dim] = new Map;
                let newId = 0;
                let del;
                this.data[dim] = this.data[dim].filter((face, faceId) => (del = !selDim.has(faceId),
                    remapping[dim].set(faceId, del ? -1 : newId++),
                    del));
                this.orientation[dim] = this.orientation[dim].filter((face, faceId) => !selDim.has(faceId));
            }
            for (const [dim, dataDim] of this.data.entries()) {
                const remapDim = remapping[dim - 1];
                if (!remapDim || !remapDim.size)
                    continue;
                for (const face of dataDim) {
                    for (const [faceIdx, faceId] of face.entries()) {
                        face[faceIdx] = remapDim.get(faceId);
                        if (face[faceIdx] === -1)
                            throw "A deleted subface is used by other faces";
                    }
                }
            }
            return remapping;
        }
        /* get informations from part of cwmesh */
        dim() {
            for (let i = this.data.length - 1; i >= 0; i--) {
                if (this.data[i].length) {
                    return i;
                }
            }
        }
        findBorder(dim, faceIds) {
            if (dim === 0)
                return;
            if (!this.data[dim] || !this.data[dim].length)
                return;
            faceIds ??= new Set(range(this.data[dim].length));
            const bordersO = new Map();
            const faces = this.data[dim];
            const facesO = this.orientation[dim] ?? [];
            for (const faceId of faceIds) {
                const face = faces[faceId];
                const faceO = dim === 1 ? [false, true] : facesO[faceId] ?? [];
                for (const [d_faceIdx, d_faceId] of face.entries()) {
                    const orientation = faceO[d_faceIdx];
                    if (!bordersO.get(d_faceId)) {
                        bordersO.set(d_faceId, (orientation === undefined) ? NaN : (orientation ? 1 : -1));
                    }
                    else {
                        const prev = bordersO.get(d_faceId);
                        if (isNaN(prev))
                            bordersO.delete(d_faceId);
                        bordersO.set(d_faceId, prev + (orientation ? 1 : -1));
                    }
                }
            }
            for (const [k, v] of bordersO) {
                if (v === 0) {
                    bordersO.delete(k);
                }
            }
            return bordersO;
        }
        getAllSelection() {
            return new CWMeshSelection(this, this.data.map(dimData => dimData ? new Set(range(dimData.length)) : undefined));
        }
        /// faces must be flat, convex and orientated
        triangulate(dim, faceIds, orientations) {
            faceIds ??= range(this.data[dim].length);
            const faces = this.data[dim];
            const facesO = this.orientation[dim];
            if (dim === 0) {
                throw "can't triangulate points";
            }
            if (dim === 1) {
                return faceIds.map((id, idx) => [
                    !orientations || orientations[idx] === false ? [
                        this.data[1][id][1], this.data[1][id][0]
                    ] : [
                        this.data[1][id][0], this.data[1][id][1]
                    ]
                ]);
            }
            const result = [];
            for (const [faceIdx, faceId] of faceIds.entries()) {
                const face = faces[faceId];
                const faceO = facesO[faceId];
                // get the first vertex
                let subfaceDim = dim - 1;
                let subface0Id = face[0];
                while (subfaceDim) {
                    subface0Id = this.data[subfaceDim--][subface0Id][0];
                }
                const d_faceWaitForTriagulate = [];
                const d_faceWaitForTriagulateO = [];
                for (const [d_faceIdx, d_faceId] of face.entries()) {
                    // get subfaces who contain the first vertex
                    const tempsel = new CWMeshSelection(this).addFace(dim - 1, d_faceId).closure();
                    if (tempsel.selData[0].has(subface0Id))
                        continue;
                    d_faceWaitForTriagulate.push(d_faceId);
                    d_faceWaitForTriagulateO.push(faceO[d_faceIdx]);
                }
                const faceResult = this.triangulate(dim - 1, d_faceWaitForTriagulate, d_faceWaitForTriagulateO).flat();
                faceResult.forEach(s => {
                    s.push(subface0Id);
                    if (orientations && orientations[faceIdx] === false) {
                        const temp = s[0];
                        s[0] = s[1];
                        s[1] = temp;
                    }
                });
                result.push(faceResult);
            }
            return result;
        }
        /// dual data doesn't generate orientation information
        getDualData(dim, faceIds) {
            faceIds ??= range(this.data[dim].length);
            const data = [];
            for (let d = dim; d; d--) {
                const faces = this.data[d];
                data[d - 1] ??= new Map;
                for (const [faceId, face] of faces.entries()) {
                    for (const d_faceId of face) {
                        if (!data[d - 1].get(d_faceId))
                            data[d - 1].set(d_faceId, new Set);
                        data[d - 1].get(d_faceId).add(faceId);
                    }
                }
            }
            return data;
        }
        /* modify topology of cwmesh */
        duplicate(sel, notCheckselectionClosure) {
            if (!sel)
                notCheckselectionClosure = true;
            sel ??= this.getAllSelection();
            const closure = (notCheckselectionClosure ? sel : sel.closure()).selData;
            const info = [];
            const vertexIsVec4 = this.data[0][0] instanceof Vec4;
            for (const [dim, faceIdList] of closure.entries()) {
                info[dim] = new Map;
                const faces = this.data[dim];
                const facesO = this.orientation[dim];
                for (const faceId of faceIdList) {
                    const f0 = faces.length;
                    info[dim].set(faceId, f0);
                    if (dim === 0)
                        faces.push((vertexIsVec4 ? faces[faceId].clone() : []));
                    else {
                        faces.push(faces[faceId].map(d_faceId => info[dim - 1].get(d_faceId)));
                        if (facesO && facesO[faceId]) {
                            facesO[f0] = facesO[faceId].slice(0);
                        }
                    }
                }
            }
            return info;
        }
        // before making bridge, oritation must be consist, this can be checked and corrected (todo)						
        bridge(mapInfo) {
            const info = [];
            for (const [dim, faceIdList] of mapInfo.entries()) {
                const faces = this.data[dim];
                const facesO = this.orientation[dim];
                this.data[dim + 1] ??= [];
                const cells = this.data[dim + 1];
                const invO = (dim & 1) === 0;
                if (!this.orientation[dim + 1])
                    this.orientation[dim + 1] = [];
                const cellsO = this.orientation[dim + 1];
                for (const [faceId, clonedFaceId] of faceIdList) {
                    const face = faces[faceId];
                    const faceO = facesO ? facesO[faceId] : undefined;
                    const newId = cells.length;
                    info[dim] ??= new Map;
                    info[dim].set(faceId, newId);
                    if (dim === 0)
                        cells.push([faceId, clonedFaceId]);
                    else {
                        const newCell = face.map(d_faceId => info[dim - 1].get(d_faceId));
                        newCell.push(faceId, clonedFaceId);
                        cells.push(newCell);
                        // D(Extrude(A)) = (-1)^(dim+1)(A - Aclone) + Extrude(DA)
                        const newCellO = dim === 1 ? [false, true] : faceO.slice(0);
                        newCellO.push(!invO, invO);
                        cellsO[newId] = newCellO;
                    }
                }
            }
            return info;
        }
        topologicalExtrude(sel) {
            sel ??= this.getAllSelection();
            const cloneInfo = this.duplicate(sel);
            const bridgeInfo = this.bridge(cloneInfo);
            return { cloneInfo, bridgeInfo };
        }
        topologicalCone(sel, notCheckselectionClosure) {
            if (!sel)
                notCheckselectionClosure = true;
            sel ??= this.getAllSelection();
            sel = notCheckselectionClosure ? sel : sel.closure();
            const info = [];
            const v0 = this.data[0].length;
            this.data[0].push(this.data[0][0] instanceof Vec4 ? new Vec4() : []);
            for (const [dim, faceIdList] of sel.selData.entries()) {
                const faces = this.data[dim];
                const facesO = this.orientation[dim];
                this.data[dim + 1] ??= [];
                const cells = this.data[dim + 1];
                this.orientation[dim + 1] ??= [];
                const invO = (dim & 1) === 0;
                const cellsO = this.orientation[dim + 1];
                for (const faceId of faceIdList) {
                    const face = faces[faceId];
                    const faceO = facesO ? facesO[faceId] : undefined;
                    const newId = cells.length;
                    info[dim] ??= new Map;
                    info[dim].set(faceId, newId);
                    if (dim === 0)
                        cells.push([faceId, v0]);
                    else {
                        const newCell = face.map(d_faceId => info[dim - 1].get(d_faceId));
                        newCell.push(faceId);
                        cells.push(newCell);
                        // D(Cone(A)) = (-1)^(dim+1)A + Cone(DA)
                        if (faceO) {
                            const newCellO = faceO.slice(0);
                            newCellO.push(!invO);
                            cellsO[newId] = newCellO;
                        }
                        else if (dim === 1) {
                            cellsO[newId] = [false, true, !invO];
                        }
                    }
                }
            }
            return {
                coneVertex: v0,
                map: info
            };
        }
        // this U= this[thisSel] x shape2[shape2Sel]
        topologicalProduct(shape2, thisSel, shape2Sel) {
            if (thisSel)
                thisSel.closure();
            if (shape2Sel)
                shape2Sel.closure();
            thisSel ??= this.getAllSelection();
            shape2Sel ??= shape2.getAllSelection();
            // productInfo[dim2].get(face2Id)[dim1].get(face1Id) ==> face1_x_face2_Id
            const productInfo = [new Map];
            // this[i] x shape2[0]
            let firstCopy = true;
            for (const sp2vId of shape2Sel.selData[0]) {
                if (firstCopy) {
                    const identityInfo = thisSel.selData.map(set => new Map(set.entries()));
                    productInfo[0].set(sp2vId, identityInfo);
                    firstCopy = false;
                }
                else {
                    const cloneInfo = this.duplicate(thisSel, true);
                    productInfo[0].set(sp2vId, cloneInfo);
                }
            }
            // loop shape2
            for (const [dim2, thisSel2dim] of shape2Sel.selData.entries()) {
                // skip shape2[0], already calculated
                if (!dim2 || !thisSel2dim)
                    continue;
                const faces2 = shape2.data[dim2];
                const faces2O = shape2.orientation[dim2];
                productInfo[dim2] ??= new Map;
                const productInfoDim2 = productInfo[dim2];
                for (const face2Id of thisSel2dim) {
                    const face2 = faces2[face2Id];
                    const face2O = faces2O ? faces2O[face2Id] : undefined;
                    if (!productInfoDim2.has(face2Id))
                        productInfoDim2.set(face2Id, []);
                    const face2ProductInfo = productInfoDim2.get(face2Id);
                    // loop shape1
                    for (const [dim1, thisSel1dim] of thisSel.selData.entries()) {
                        if (!thisSel1dim)
                            continue;
                        const dim12 = dim1 + dim2;
                        const faces1 = this.data[dim1];
                        const faces1O = this.orientation[dim1];
                        face2ProductInfo[dim1] ??= new Map;
                        this.data[dim12] ??= [];
                        const cells = this.data[dim12];
                        if (dim12 > 1)
                            this.orientation[dim12] ??= [];
                        const cellsO = this.orientation[dim12];
                        for (const face1Id of thisSel1dim) {
                            const face1 = faces1[face1Id];
                            const face1O = faces1O ? faces1O[face1Id] : undefined;
                            // regist newCell
                            const newCell = [];
                            const newCellO = [];
                            const newCellId = cells.length;
                            face2ProductInfo[dim1].set(face1Id, newCellId);
                            // D(shape1) x shape2 
                            if (dim1) { // exclude 0-face with no border
                                for (const [d_face1Idx, d_face1Id] of face1.entries()) {
                                    newCell.push(face2ProductInfo[dim1 - 1].get(d_face1Id));
                                    if (dim1 > 1)
                                        newCellO.push(face1O[d_face1Idx]);
                                }
                                if (dim1 === 1)
                                    newCellO.push(false, true);
                            }
                            // D(shape2) x shape1
                            const invO = (dim1 & 1) === 1;
                            for (const [d_face2Idx, d_face2Id] of face2.entries()) {
                                newCell.push(productInfo[dim2 - 1].get(d_face2Id)[dim1].get(face1Id));
                                if (dim2 > 1)
                                    newCellO.push(invO !== face2O[d_face2Idx]);
                            }
                            if (dim2 === 1)
                                newCellO.push(invO, !invO);
                            if (dim12 === 1) {
                                if (newCellO[0] === true) {
                                    const temp = newCell[0];
                                    newCell[0] = newCell[1];
                                    newCell[1] = temp;
                                }
                            }
                            else {
                                cellsO.push(newCellO);
                            }
                            cells.push(newCell);
                        }
                    }
                }
            }
            return productInfo;
        }
        /* modify concrete shape of cwmesh up to 4d */
        apply(verticesCalls) {
            this.data[0].forEach(verticesCalls);
            return this;
        }
        makePrism(direction, alignCenter, sel) {
            const { cloneInfo, bridgeInfo } = this.topologicalExtrude(sel);
            const vs = this.data[0];
            if (alignCenter) {
                for (const [srcvId, destvId] of cloneInfo[0]) {
                    vs[srcvId].addmulfs(direction, -0.5);
                    vs[destvId].addmulfs(direction, 0.5);
                }
            }
            else {
                for (const [srcvId, destvId] of cloneInfo[0]) {
                    vs[destvId].adds(direction);
                }
            }
            return { cloneInfo, bridgeInfo };
        }
        makeRotatoid(bivec, segment, angle) {
            // throw "not test yet";
            let pathcw;
            const dangle = (angle ?? _360) / segment;
            const ps = [];
            for (let i = 0, j = 0; i < segment; i++, j += dangle) {
                ps.push(new Vec4(Math.cos(j), Math.sin(j)));
            }
            if (angle === undefined) {
                pathcw = path(ps, true);
            }
            else {
                ps.push(new Vec4(Math.cos(angle), Math.sin(angle)));
                pathcw = path(ps, false);
            }
            const R0 = Rotor.lookAtbb(Bivec.xy, bivec);
            pathcw.apply(v => v.rotates(R0));
            const v1s = this.data[0];
            const info = this.topologicalProduct(pathcw);
            const r0 = bivec.mulf(dangle).exp();
            const r = r0.clone();
            const rarr = [new Rotor, r.clone()];
            for (let i = 2; i < pathcw.data[0].length; i++) {
                rarr.push(r.mulsl(r0).clone());
            }
            for (const [v2Id, dim1List] of info[0]) {
                for (const [v1Id, v1_x_v2Id] of dim1List[0]) {
                    if (v1Id === v1_x_v2Id)
                        break;
                    if (v1Id !== v1_x_v2Id)
                        v1s[v1_x_v2Id].copy(v1s[v1Id]).rotates(rarr[v2Id]);
                    r.mulsl(r0);
                }
            }
            return info;
        }
        makePyramid(point, sel) {
            const info = this.topologicalCone(sel);
            const vs = this.data[0];
            vs[info.coneVertex].copy(point);
            return info;
        }
        makeDirectProduct(shape2, thisSel, shape2Sel) {
            const v1s = this.data[0];
            const v2s = shape2.data[0];
            const info = this.topologicalProduct(shape2, thisSel, shape2Sel);
            for (const [v2Id, dim1List] of info[0]) {
                for (const [v1Id, v1_x_v2Id] of dim1List[0]) {
                    if (v1Id === v1_x_v2Id)
                        break;
                    if (v1Id !== v1_x_v2Id)
                        v1s[v1_x_v2Id].addset(v1s[v1Id], v2s[v2Id]);
                }
            }
            for (const [v2Id, dim1List] of info[0]) {
                for (const [v1Id, v1_x_v2Id] of dim1List[0]) {
                    if (v1Id !== v1_x_v2Id)
                        break;
                    if (v1Id === v1_x_v2Id)
                        v1s[v1_x_v2Id].addset(v1s[v1Id], v2s[v2Id]);
                }
            }
            return info;
        }
        /// mesh must be closed manifold
        makeDual() {
            const d = (this.findBorder(this.dim()).size) ? this.dim() - 1 : this.dim();
            const info = this.getDualData(d);
            const mesh = new CWMesh;
            for (let nd = d, dim = 0; nd > 0; nd--, dim++) {
                mesh.data[nd] = [];
                const nfaces = mesh.data[nd];
                for (let [faceId, coDfaceId] of info[dim]) {
                    nfaces[faceId] = Array.from(coDfaceId);
                }
            }
            mesh.data[0] = this.data[d].map((_, faceId) => {
                const arr = Array.from(new CWMeshSelection(this).addFace(d, faceId).closure().selData[0]).map(vId => this.data[0][vId]);
                return arr.reduce((a, b) => a.adds(b), new Vec4).divfs(arr.length);
            });
            mesh.data[4] = [range(mesh.data[3].length)];
            mesh.calculateOrientationInFace(4, 0);
            return mesh;
        }
    }

    var mesh = /*#__PURE__*/Object.freeze({
        __proto__: null,
        CWMesh: CWMesh,
        CWMeshSelection: CWMeshSelection,
        FaceIndexMesh: FaceIndexMesh,
        FaceMesh: FaceMesh,
        ObjFile: ObjFile,
        TetraIndexMesh: TetraIndexMesh,
        TetraMesh: TetraMesh,
        cw: geoms,
        face: face,
        tetra: tetra
    });

    class TesseractGeometry extends Geometry {
        constructor(size) {
            super(tesseract());
            if (size)
                this.jsBuffer.applyObj4(new Obj4(null, null, size instanceof Vec4 ? size : new Vec4(size, size, size, size)));
        }
    }
    class CubeGeometry extends Geometry {
        constructor(size) {
            super(cube.clone());
            if (size)
                this.jsBuffer.applyObj4(new Obj4(null, null, size instanceof Vec3 ? new Vec4(size.x, 1, size.y, size.z) : new Vec4(size, 1, size, size)));
        }
    }
    class GlomeGeometry extends Geometry {
        constructor(size = 1, detail = 2) {
            if (typeof detail === "number")
                super(glome(size, detail * 8, detail * 8, detail * 6));
            else
                super(glome(size, detail.xy, detail.zw, detail.latitude));
        }
    }
    class SpheritorusGeometry extends Geometry {
        constructor(sphereRadius = 0.4, circleRadius = 1, detail = 2) {
            if (typeof detail === "number")
                super(spheritorus(sphereRadius, detail * 8, detail * 6, circleRadius, detail * 8));
            else
                super(spheritorus(sphereRadius, detail.longitude, detail.latitude, circleRadius, detail.circle));
        }
    }
    class TorisphereGeometry extends Geometry {
        constructor(circleRadius = 0.2, sphereRadius = 0.8, detail = 2) {
            if (typeof detail === "number")
                super(torisphere(circleRadius, detail * 6, sphereRadius, detail * 8, detail * 6));
            else
                super(torisphere(circleRadius, detail.circle, sphereRadius, detail.longitude, detail.latitude));
        }
    }
    class SpherinderSideGeometry extends Geometry {
        constructor(sphereRadius1 = 0.4, sphereRadius2 = sphereRadius1, height = 1, detail = 2) {
            if (typeof detail === "number")
                super(spherinderSide(sphereRadius1, sphereRadius2, detail * 8, detail * 6, height, detail * 2));
            else
                super(spherinderSide(sphereRadius1, sphereRadius2, detail.longitude, detail.latitude, height, detail.height));
        }
    }
    class TigerGeometry extends Geometry {
        constructor(circleRadius = 0.2, radius1 = 0.8, radius2 = 0.8, detail = 2) {
            if (typeof detail === "number")
                super(tiger(radius1, detail * 8, radius2, detail * 8, circleRadius, detail * 6));
            else
                super(tiger(radius1, detail.xy, radius2, detail.zw, circleRadius, detail.circle));
        }
    }
    class DitorusGeometry extends Geometry {
        constructor(circleRadius = 0.2, radius1 = 0.8, radius2 = 0.4, detail = 2) {
            if (typeof detail === "number")
                super(ditorus(radius1, detail * 8, radius2, detail * 8, circleRadius, detail * 6));
            else
                super(ditorus(radius1, detail.major, radius2, detail.middle, circleRadius, detail.minor));
        }
    }
    class DuocylinderGeometry extends Geometry {
        constructor(radius1 = 0.8, radius2 = 0.8, detail = 2) {
            if (typeof detail === "number")
                super(duocylinder(radius1, detail * 8, radius2, detail * 8));
            else
                super(duocylinder(radius1, detail.xy, radius2, detail.zw));
        }
    }
    class ConvexHullGeometry extends Geometry {
        constructor(points) {
            super(convexhull(points).generateNormal().setUVWAsPosition());
        }
    }
    class CWMeshGeometry extends Geometry {
        constructor(cwmesh$1) {
            super(cwmesh(cwmesh$1).setUVWAsPosition());
        }
    }

    const WireFrameTesseractoid_SubCells = [
        [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7],
        [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7],
        [2, 4], [2, 5], [2, 6], [2, 7],
        [3, 4], [3, 5], [3, 6], [3, 7],
        [4, 6], [4, 7],
        [5, 6], [5, 7]
    ];
    class WireFrameTesseractoid extends Obj4 {
        lines; // GPUBuffer; // linelist
        cells;
        subCells = WireFrameTesseractoid_SubCells;
        obb;
        visible = true;
        transparent = false;
        constructor(size) {
            super();
            if (typeof size === "number") {
                size = new Vec4(size, size, size, size);
            }
            let x = size.x, y = size.y, z = size.z, w = size.w;
            this.obb = new AABB(size.neg(), size);
            this.lines = [
                [new Vec4(x, y, z, w), new Vec4(x, y, z, -w)],
                [new Vec4(x, y, -z, w), new Vec4(x, y, -z, -w)],
                [new Vec4(x, -y, z, w), new Vec4(x, -y, z, -w)],
                [new Vec4(x, -y, -z, w), new Vec4(x, -y, -z, -w)],
                [new Vec4(-x, y, z, w), new Vec4(-x, y, z, -w)],
                [new Vec4(-x, y, -z, w), new Vec4(-x, y, -z, -w)],
                [new Vec4(-x, -y, z, w), new Vec4(-x, -y, z, -w)],
                [new Vec4(-x, -y, -z, w), new Vec4(-x, -y, -z, -w)],
                [new Vec4(x, y, z, w), new Vec4(-x, y, z, w)],
                [new Vec4(x, y, z, -w), new Vec4(-x, y, z, -w)],
                [new Vec4(x, y, -z, w), new Vec4(-x, y, -z, w)],
                [new Vec4(x, y, -z, -w), new Vec4(-x, y, -z, -w)],
                [new Vec4(x, -y, z, w), new Vec4(-x, -y, z, w)],
                [new Vec4(x, -y, z, -w), new Vec4(-x, -y, z, -w)],
                [new Vec4(x, -y, -z, w), new Vec4(-x, -y, -z, w)],
                [new Vec4(x, -y, -z, -w), new Vec4(-x, -y, -z, -w)],
                [new Vec4(x, y, z, w), new Vec4(x, -y, z, w)],
                [new Vec4(-x, y, z, w), new Vec4(-x, -y, z, w)],
                [new Vec4(x, y, z, -w), new Vec4(x, -y, z, -w)],
                [new Vec4(-x, y, z, -w), new Vec4(-x, -y, z, -w)],
                [new Vec4(x, y, -z, w), new Vec4(x, -y, -z, w)],
                [new Vec4(-x, y, -z, w), new Vec4(-x, -y, -z, w)],
                [new Vec4(x, y, -z, -w), new Vec4(x, -y, -z, -w)],
                [new Vec4(-x, y, -z, -w), new Vec4(-x, -y, -z, -w)],
                [new Vec4(x, y, z, w), new Vec4(x, y, -z, w)],
                [new Vec4(-x, y, z, w), new Vec4(-x, y, -z, w)],
                [new Vec4(x, y, z, -w), new Vec4(x, y, -z, -w)],
                [new Vec4(-x, y, z, -w), new Vec4(-x, y, -z, -w)],
                [new Vec4(x, -y, z, w), new Vec4(x, -y, -z, w)],
                [new Vec4(-x, -y, z, w), new Vec4(-x, -y, -z, w)],
                [new Vec4(x, -y, z, -w), new Vec4(x, -y, -z, -w)],
                [new Vec4(-x, -y, z, -w), new Vec4(-x, -y, -z, -w)],
            ];
            this.cells = [
                new Plane(Vec4.x, x), new Plane(Vec4.xNeg, x),
                new Plane(Vec4.y, y), new Plane(Vec4.yNeg, y),
                new Plane(Vec4.z, z), new Plane(Vec4.zNeg, z),
                new Plane(Vec4.w, w), new Plane(Vec4.wNeg, w),
            ];
        }
    }
    class WireFrameConvexPolytope extends Obj4 {
        lines; // GPUBuffer; // linelist
        cells;
        subCells;
        obb;
        visible = true;
        transparent = false;
        constructor(cwmesh) {
            super();
            const vertices = cwmesh.data[0];
            this.lines = cwmesh.data[1].map(face => [vertices[face[0]], vertices[face[1]]]);
            const subCells = cwmesh.data[2].map(_ => []);
            for (const [idx, cell] of cwmesh.data[3].entries()) {
                for (const faceIdx of cell) {
                    subCells[faceIdx].push(idx);
                }
            }
            let simplexes;
            const borders = cwmesh.findBorder(4);
            if (borders) {
                // closed 4d object's surface
                const cells = [];
                const cellsO = [];
                for (const [cellId, border] of borders.entries()) {
                    if (border !== 1 && border !== -1)
                        continue;
                    cells.push(cellId);
                    cellsO.push(border === 1);
                }
                simplexes = cwmesh.triangulate(3, cells, cellsO);
            }
            else {
                simplexes = cwmesh.triangulate(3, cwmesh.data[3].map((_, idx) => idx));
            }
            const v1 = new Vec4, v2 = new Vec4, v3 = new Vec4;
            this.cells = simplexes.map(ss => {
                const s = ss[0];
                const a0 = vertices[s[0]];
                const a1 = vertices[s[1]];
                const a2 = vertices[s[2]];
                const a3 = vertices[s[3]];
                const normal = v1.subset(a0, a1).wedge(v2.subset(a0, a2)).wedgev(v3.subset(a0, a3)).norms();
                return new Plane(normal, a1.dot(normal));
            });
            this.subCells = subCells;
            this.obb = AABB.fromPoints(vertices);
        }
    }
    const _vec4$1 = new Vec4;
    class WireFrameScene {
        occluders = [];
        objects = [];
        camera = new PerspectiveCamera;
        jsBuffer;
        gpuBuffer;
        maxGpuBufferSize = 0x10000;
        clipEpsilon = 1e-5;
        add(...o) {
            for (const obj of o) {
                if (obj.lines) {
                    this.objects.push(obj);
                }
                if (obj.cells) {
                    this.occluders.push(obj);
                }
            }
        }
        occludeFrustum(renderState) {
            const frustumRange = renderState.getFrustumRange(this.camera, true);
            for (const obj of this.objects) {
                if (obj.visible === false)
                    continue;
                let relP = _vec4$1.copy(this.camera.position).subs(obj.position);
                let visible = true;
                let clipFaces = [];
                for (let f of frustumRange) {
                    const p = new Plane(f.clone().rotatesconj(obj.rotation), f.dot(relP));
                    const pos = obj.obb.testPlane(p);
                    if (pos === 1) {
                        visible = false;
                        break;
                    }
                    if (pos === 0) {
                        clipFaces.push(p);
                    }
                }
                obj._jsBuffer = visible ? obj.lines.map(([pa, pb]) => [pa.clone(), pb.clone()]) : [];
                if (!visible)
                    continue;
                clipFaces.map(p => {
                    for (const [pa, pb] of obj._jsBuffer) {
                        const la = pa.dot(p.normal) - p.offset;
                        const lb = pb.dot(p.normal) - p.offset;
                        if (la > 0 !== lb > 0) {
                            const l = lb / (lb - la);
                            const p = _vec4$1.copy(pa).subs(pb).mulfs(l).adds(pb);
                            if (la > 0) {
                                pa.copy(p);
                            }
                            else {
                                pb.copy(p);
                            }
                        }
                        else if (la > 0 && lb > 0) {
                            pa.set(NaN);
                            pb.set(NaN);
                        }
                    }
                });
            }
        }
        calcViewBoundary(c1, c2, origin) {
            if (origin) {
                const k1 = c1.normal.dot(origin) - c1.offset;
                const k2 = c2.normal.dot(origin) - c2.offset;
                const l = k1 / (k1 - k2);
                const n = c1.normal.mulf(1 - l).addmulfs(c2.normal, l);
                return new Plane(n, (1 - l) * c1.offset + l * c2.offset);
            }
            else {
                const l = c1.offset / (c1.offset - c2.offset);
                const n = _vec4$1.copy(c1.normal).mulfs(1 - l).addmulfs(c2.normal, l);
                return n;
            }
        }
        occludeOccluders() {
            for (const ocd of this.occluders) {
                if (ocd.transparent)
                    continue;
                // todo: obb frustum test, if not visible, skip all
                const relP = _vec4$1.subset(this.camera.position, ocd.position).rotatesconj(ocd.rotation);
                const faceDir = ocd.cells.map(p => p.normal.dot(relP) - p.offset > -this.clipEpsilon);
                const inside = !faceDir.includes(true);
                let worldBorders;
                if (inside) {
                    worldBorders = ocd.cells.map(p => p.clone().applyObj4(ocd));
                }
                else {
                    const border = ocd.subCells.filter(([a, b]) => faceDir[a] !== faceDir[b]).map(([a, b]) => faceDir[a] ? this.calcViewBoundary(ocd.cells[a], ocd.cells[b], relP) : this.calcViewBoundary(ocd.cells[b], ocd.cells[a], relP));
                    worldBorders = border.map(p => p.applyObj4(ocd));
                    for (let i = 0; i < faceDir.length; i++) {
                        if (faceDir[i]) {
                            worldBorders.push(ocd.cells[i].clone().applyObj4(ocd));
                        }
                    }
                }
                ocd._inside = inside;
                ocd._worldBorders = worldBorders;
            }
            for (const obj of this.objects) {
                if (obj.visible === false)
                    continue;
                for (let i = 0; i < obj._jsBuffer.length; i++) {
                    let [pa, pb] = obj._jsBuffer[i];
                    if (!isNaN(pa.x)) {
                        obj._jsBuffer[i][0].copy(pa.applyObj4(obj));
                        obj._jsBuffer[i][1].copy(pb.applyObj4(obj));
                    }
                }
            }
            for (const ocd of this.occluders) {
                if (ocd.transparent)
                    continue;
                for (const obj of this.objects) {
                    if (obj.visible === false)
                        continue;
                    const nBuffer = [];
                    for (const [pa, pb] of obj._jsBuffer) {
                        // write new fn here, attention jsbuffer size
                        if (isNaN(pa.x))
                            continue;
                        this.clipLine(ocd._inside, pa, pb, ocd._worldBorders, nBuffer);
                    }
                    obj._jsBuffer.push(...nBuffer);
                }
            }
        }
        // refeerence: Blockv6 Clip.java
        clipLine(isInside, pa, pb, borders, nBuffer) {
            if (isInside) {
                // pa=cliparea=ra----rb=cliparea==pb
                let ra = 0, rb = 1;
                for (const p of borders) {
                    const la = pa.dot(p.normal) - p.offset - this.clipEpsilon;
                    const lb = pb.dot(p.normal) - p.offset - this.clipEpsilon;
                    if (lb > 0) {
                        if (la > 0) {
                            pa.set(NaN);
                            pb.set(NaN);
                            return;
                        }
                        const l = lb / (lb - la);
                        if (l > ra)
                            ra = l;
                    }
                    else if (la > 0) {
                        const l = lb / (lb - la);
                        if (l < rb)
                            rb = l;
                    }
                    if (ra >= rb) {
                        pa.set(NaN);
                        pb.set(NaN);
                        return;
                    }
                }
            }
            else {
                // pa====ra--cliparea--rb====pb
                let ra = 0, rb = 1;
                for (const p of borders) {
                    const la = pa.dot(p.normal) - p.offset + this.clipEpsilon;
                    const lb = pb.dot(p.normal) - p.offset + this.clipEpsilon;
                    if (la > 0) {
                        if (lb > 0)
                            return;
                        const l = la / (la - lb);
                        if (l > ra)
                            ra = l;
                    }
                    else if (lb > 0) {
                        const l = la / (la - lb);
                        if (l < rb)
                            rb = l;
                    }
                    if (ra >= rb)
                        return;
                }
                if (ra === 0) {
                    if (rb === 1) {
                        pa.set(NaN);
                        pb.set(NaN);
                    }
                    else {
                        pa.copy(_vec4$1.copy(pb).subs(pa).mulfs(rb).adds(pa));
                    }
                }
                else if (rb === 1) {
                    pb.copy(_vec4$1.copy(pb).subs(pa).mulfs(ra).adds(pa));
                }
                else {
                    nBuffer.push([pb.clone(), pb.sub(pa).mulfs(rb).adds(pa)]);
                    pb.subs(pa).mulfs(ra).adds(pa);
                }
            }
        }
        render(rs, objs) {
            const renderState = rs.renderState;
            const gpu = rs.gpu;
            this.jsBuffer ??= new Float32Array(this.maxGpuBufferSize);
            this.gpuBuffer ??= gpu.createBuffer(GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST, this.maxGpuBufferSize);
            let offset = 0;
            const fovCoeff = -renderState.sliceBuffers.camProjJsBuffer[1];
            const _r = new Obj4;
            // copy data to temp jsbuffer and do retina frustum clip, all data are under object's coord
            this.occludeFrustum(renderState);
            // when do occlusion, all data are converted in world coord
            this.occludeOccluders();
            // when draw, only need to convert to camera's coord
            for (const obj of objs ?? this.objects) {
                if (obj.visible === false)
                    continue;
                // _r.rotation.copy(obj.rotation).mulslconj(this.camera.rotation);
                // _r.position.copy(obj.position).subs(this.camera.position).rotatesconj(this.camera.rotation);
                _r.rotation.copy(this.camera.rotation).conjs();
                _r.position.copy(this.camera.position).negs().rotatesconj(this.camera.rotation);
                //ax+b-B=Ay
                for (const [pa, pb] of obj._jsBuffer) {
                    if (isNaN(pa.x))
                        continue;
                    _vec4$1.copy(pa).applyObj4(_r);
                    _vec4$1.mulfs(fovCoeff / _vec4$1.w);
                    _vec4$1.writeBuffer(this.jsBuffer, offset);
                    _vec4$1.copy(pb).applyObj4(_r);
                    _vec4$1.mulfs(fovCoeff / _vec4$1.w);
                    _vec4$1.writeBuffer(this.jsBuffer, offset + 4);
                    offset += 8;
                }
            }
            gpu.device.queue.writeBuffer(this.gpuBuffer, 0, this.jsBuffer.buffer, 0, offset);
            rs.render(this.gpuBuffer, offset >> 2);
        }
    }

    var KeyState;
    (function (KeyState) {
        KeyState[KeyState["NONE"] = 0] = "NONE";
        KeyState[KeyState["UP"] = 1] = "UP";
        KeyState[KeyState["HOLD"] = 2] = "HOLD";
        KeyState[KeyState["DOWN"] = 3] = "DOWN";
    })(KeyState || (KeyState = {}));
    class ControllerRegistry {
        dom;
        ctrls;
        enablePointerLock;
        states = {
            currentKeys: new Map(),
            isPointerLockedMouseDown: false,
            isPointerLockEscaped: false,
            currentBtn: -1,
            mouseDown: -1,
            mouseUp: -1,
            updateCount: 0,
            moveX: 0,
            moveY: 0,
            mouseX: 0,
            mouseY: 0,
            wheelX: 0,
            wheelY: 0,
            mspf: -1,
            isKeyHold: (_) => false,
            requestPointerLock: () => false,
            isPointerLocked: () => false,
            exitPointerLock: () => { }
        };
        /** if this is true, prevent default will not work  */
        disableDefaultEvent = false;
        prevIsPointerLocked = false;
        evMouseDown;
        evMouseUp;
        evMouseMove;
        evWheel;
        evKeyUp;
        evKeyDown;
        evContextMenu;
        constructor(dom, ctrls, config) {
            this.dom = dom;
            dom.tabIndex = 1;
            this.ctrls = ctrls;
            this.enablePointerLock = config?.enablePointerLock ?? false;
            this.states.isKeyHold = (code) => {
                if (code.includes("|")) {
                    for (let key of code.split("|")) {
                        if (this.states.isKeyHold(key))
                            return true;
                    }
                    return false;
                }
                for (let key of code.split("+")) {
                    if (key[0] === '.') {
                        let state = this.states.currentKeys.get(key.slice(1));
                        if (state !== KeyState.DOWN)
                            return false;
                    }
                    else {
                        let state = this.states.currentKeys.get(key);
                        if (!state || state === KeyState.UP)
                            return false;
                    }
                }
                return true;
            };
            this.states.isPointerLocked = () => {
                return ((!this.states.isPointerLockedMouseDown) && document.pointerLockElement === this.dom);
            };
            this.states.exitPointerLock = () => {
                if (document.pointerLockElement === this.dom) {
                    document.exitPointerLock();
                    // if we exit positively, then don't trigger isPointerLockEscaped in the next update
                    this.prevIsPointerLocked = false;
                }
            };
            this.states.requestPointerLock = () => {
                if (document.pointerLockElement !== dom) {
                    dom.requestPointerLock();
                }
            };
            // regist events
            this.evMouseDown = (ev) => {
                if (this.enablePointerLock && document.pointerLockElement !== dom) {
                    dom.requestPointerLock();
                    this.states.isPointerLockedMouseDown = true;
                }
                else {
                    dom.focus();
                }
                this.states.currentBtn = ev.button;
                this.states.moveX = 0;
                this.states.moveY = 0;
                this.states.mouseDown = ev.button;
                if (ev.altKey === false) {
                    this.states.currentKeys.set("AltLeft", KeyState.NONE);
                    this.states.currentKeys.set("AltRight", KeyState.NONE);
                }
                // left click should not be prevented, otherwise keydown event can't obtain focus
                if (ev.button === 1 && config?.preventDefault === true) {
                    ev.preventDefault();
                    ev.stopPropagation();
                }
            };
            this.evMouseMove = (ev) => {
                this.states.moveX += ev.movementX;
                this.states.moveY += ev.movementY;
                this.states.mouseX = ev.offsetX;
                this.states.mouseY = ev.offsetY;
            };
            this.evMouseUp = (ev) => {
                this.states.currentBtn = -1;
                this.states.mouseUp = ev.button;
            };
            this.evKeyDown = (ev) => {
                let prevState = this.states.currentKeys.get(ev.code);
                this.states.currentKeys.set(ev.code, prevState === KeyState.HOLD ? KeyState.HOLD : KeyState.DOWN);
                if (ev.altKey === false) {
                    this.states.currentKeys.set("AltLeft", KeyState.NONE);
                    this.states.currentKeys.set("AltRight", KeyState.NONE);
                }
                if ((ev.altKey === true || ev.ctrlKey === true) && this.disableDefaultEvent) {
                    ev.preventDefault();
                    ev.stopPropagation();
                }
            };
            this.evKeyUp = (ev) => {
                this.states.currentKeys.set(ev.code, KeyState.UP);
                if ((ev.altKey === true || ev.ctrlKey === true) && this.disableDefaultEvent) {
                    ev.preventDefault();
                    ev.stopPropagation();
                }
            };
            this.evWheel = (ev) => {
                this.states.wheelX = ev.deltaX;
                this.states.wheelY = ev.deltaY;
            };
            // mouse events are restricted in dom (canvas)
            dom.addEventListener("mousedown", this.evMouseDown);
            dom.addEventListener("mousemove", this.evMouseMove);
            dom.addEventListener("mouseup", this.evMouseUp);
            // but wheel and key event do not require focus on dom(canvas)
            document.body.addEventListener("keydown", this.evKeyDown);
            document.body.addEventListener("keyup", this.evKeyUp);
            document.body.addEventListener("wheel", this.evWheel);
            if (config?.preventDefault === true) {
                this.evContextMenu = (ev) => {
                    if (!this.disableDefaultEvent) {
                        ev.preventDefault();
                        ev.stopPropagation();
                    }
                };
                dom.addEventListener("contextmenu", this.evContextMenu);
            }
        }
        add(ctrl) {
            this.ctrls.push(ctrl);
        }
        remove(ctrl) {
            this.ctrls = this.ctrls.filter(c => c !== ctrl);
        }
        unregist() {
            this.dom.removeEventListener("mousedown", this.evMouseDown);
            this.dom.removeEventListener("mousemove", this.evMouseMove);
            this.dom.removeEventListener("mouseup", this.evMouseUp);
            this.dom.removeEventListener("keydown", this.evKeyDown);
            this.dom.removeEventListener("keyup", this.evKeyUp);
            this.dom.removeEventListener("wheel", this.evWheel);
            if (this.evContextMenu)
                this.dom.removeEventListener("contextmenu", this.evContextMenu);
        }
        update() {
            this.states.enablePointerLock = this.enablePointerLock;
            this.states.isPointerLockEscaped = this.prevIsPointerLocked && !this.states.isPointerLocked();
            if (!this.states.lastUpdateTime) {
                this.states.mspf = 16.667;
                let now = new Date().getTime();
                this.states.lastUpdateTime = now;
            }
            else {
                let now = new Date().getTime();
                this.states.mspf = now - this.states.lastUpdateTime;
                this.states.lastUpdateTime = now;
            }
            for (let c of this.ctrls) {
                c.update(this.states);
            }
            this.states.mouseDown = -1;
            this.states.mouseUp = -1;
            this.states.moveX = 0;
            this.states.moveY = 0;
            this.states.wheelX = 0;
            this.states.wheelY = 0;
            this.states.updateCount++;
            this.states.isPointerLockedMouseDown = false;
            this.prevIsPointerLocked = this.states.isPointerLocked();
            for (let [key, prevState] of this.states.currentKeys) {
                let newState = prevState;
                if (prevState === KeyState.DOWN) {
                    newState = KeyState.HOLD;
                }
                else if (prevState === KeyState.UP) {
                    newState = KeyState.NONE;
                }
                this.states.currentKeys.set(key, newState);
            }
        }
    }
    class TrackBallController {
        center = new Vec4();
        enabled = true;
        object = new Obj4(Vec4.w.neg());
        mouseSpeed = 0.01;
        wheelSpeed = 0.0001;
        damp = 0.1;
        mouseButton3D = 0;
        mouseButtonRoll = 1;
        mouseButton4D = 2;
        /** how many update cycles (2^n) to normalise rotor to avoid accuracy problem */
        normalisePeriodBit;
        keyConfig = {
            disable: "AltLeft",
            enable: "",
        };
        cameraMode = false;
        _bivec = new Bivec();
        normalisePeriodMask = 15;
        constructor(object, cameraMode) {
            if (object)
                this.object = object;
            this.cameraMode = cameraMode ?? false;
        }
        update(state) {
            let disabled = state.isKeyHold(this.keyConfig.disable) || !this.enabled;
            let dampFactor = Math.exp(-this.damp * Math.min(200.0, state.mspf));
            this.object.position.subs(this.center);
            if (!disabled) {
                let dx = state.moveX * this.mouseSpeed;
                let dy = -state.moveY * this.mouseSpeed;
                let wy = state.wheelY * this.wheelSpeed;
                switch (state.currentBtn) {
                    case this.mouseButton3D:
                        this._bivec.set(0, dx, 0, dy);
                        break;
                    case this.mouseButtonRoll:
                        this._bivec.set(dx, 0, 0, 0, 0, dy);
                        break;
                    case this.mouseButton4D:
                        this._bivec.set(0, 0, dx, 0, dy);
                        break;
                    default:
                        this._bivec.mulfs(dampFactor);
                }
                this.object.position.mulfs(1 + wy);
            }
            else {
                this._bivec.mulfs(dampFactor);
            }
            const rotor = this._bivec.exp();
            if (this.cameraMode) {
                rotor.mulsrconj(this.object.rotation).mulsl(this.object.rotation);
                this.object.rotates(rotor);
                this.object.position.rotates(rotor);
            }
            else {
                this.object.rotates(rotor);
            }
            if ((state.updateCount & this.normalisePeriodMask) === 0) {
                this.object.rotation.norms();
            }
            this.object.position.adds(this.center);
        }
        lookAtCenter() {
            this.object.lookAt(Vec4.wNeg, this.center);
        }
    }
    class FreeFlyController {
        enabled = true;
        swapMouseYWithScrollY = false;
        object = new Obj4();
        mouseSpeed = 0.01;
        wheelSpeed = 0.0005;
        keyMoveSpeed = 0.001;
        keyRotateSpeed = 0.001;
        damp = 0.01;
        constructor(object) {
            if (object)
                this.object = object;
        }
        keyConfig = {
            front: "KeyW",
            back: "KeyS",
            left: "KeyA",
            right: "KeyD",
            ana: "KeyQ",
            kata: "KeyE",
            up: "Space",
            down: "ShiftLeft",
            turnLeft: "KeyJ",
            turnRight: "KeyL",
            turnAna: "KeyU",
            turnKata: "KeyO",
            turnUp: "KeyI",
            turnDown: "KeyK",
            spinCW: "KeyF|KeyZ",
            spinCCW: "KeyH|KeyX",
            rollCW: "KeyR",
            rollCCW: "KeyY",
            pitchCW: "KeyG",
            pitchCCW: "KeyT",
            disable: "AltLeft",
            enable: "",
        };
        /** how many update cycles (2^n) to normalise rotor to avoid accuracy problem */
        normalisePeriodBit;
        _bivec = new Bivec();
        _bivecKey = new Bivec();
        _moveVec = new Vec4();
        _vec = new Vec4();
        normalisePeriodMask = 15;
        update(state) {
            let on = state.isKeyHold;
            let key = this.keyConfig;
            let delta;
            let dampFactor = Math.exp(-this.damp * Math.min(200.0, state.mspf));
            let disabled = state.isKeyHold(this.keyConfig.disable) || !this.enabled;
            if (!disabled) {
                let keyRotateSpeed = this.keyRotateSpeed * state.mspf;
                delta = (on(key.pitchCW) ? -1 : 0) + (on(key.pitchCCW) ? 1 : 0);
                if (delta)
                    this._bivecKey.yz = delta * keyRotateSpeed;
                delta = (on(key.spinCW) ? -1 : 0) + (on(key.spinCCW) ? 1 : 0);
                if (delta)
                    this._bivecKey.xz = delta * keyRotateSpeed;
                delta = (on(key.rollCW) ? -1 : 0) + (on(key.rollCCW) ? 1 : 0);
                if (delta)
                    this._bivecKey.xy = delta * keyRotateSpeed;
                delta = (on(key.turnLeft) ? -1 : 0) + (on(key.turnRight) ? 1 : 0);
                if (delta)
                    this._bivecKey.xw = delta * keyRotateSpeed;
                delta = (on(key.turnUp) ? 1 : 0) + (on(key.turnDown) ? -1 : 0);
                if (delta)
                    this._bivecKey.yw = delta * keyRotateSpeed;
                delta = (on(key.turnAna) ? -1 : 0) + (on(key.turnKata) ? 1 : 0);
                if (delta)
                    this._bivecKey.zw = delta * keyRotateSpeed;
            }
            this._bivec.copy(this._bivecKey);
            this._bivecKey.mulfs(dampFactor);
            if (!disabled) {
                if ((state.enablePointerLock && state.isPointerLocked()) || (state.currentBtn = 0)) {
                    let dx = state.moveX * this.mouseSpeed;
                    let dy = -state.moveY * this.mouseSpeed;
                    this._bivec.xw += dx;
                    if (this.swapMouseYWithScrollY) {
                        this._bivec.yw += dy;
                    }
                    else {
                        this._bivec.zw -= dy;
                    }
                }
                if ((state.enablePointerLock && state.isPointerLocked()) || (!state.enablePointerLock)) {
                    let wx = state.wheelX * this.wheelSpeed;
                    let wy = state.wheelY * this.wheelSpeed;
                    this._bivec.xy += wx;
                    if (this.swapMouseYWithScrollY) {
                        this._bivec.zw += wy;
                    }
                    else {
                        this._bivec.yw -= wy;
                    }
                }
                let keyMoveSpeed = this.keyMoveSpeed * state.mspf;
                delta = (on(key.left) ? -1 : 0) + (on(key.right) ? 1 : 0);
                if (delta)
                    this._moveVec.x = delta * keyMoveSpeed;
                delta = (on(key.up) ? 1 : 0) + (on(key.down) ? -1 : 0);
                if (delta)
                    this._moveVec.y = delta * keyMoveSpeed;
                delta = (on(key.ana) ? -1 : 0) + (on(key.kata) ? 1 : 0);
                if (delta)
                    this._moveVec.z = delta * keyMoveSpeed;
                delta = (on(key.front) ? -1 : 0) + (on(key.back) ? 1 : 0);
                if (delta)
                    this._moveVec.w = delta * keyMoveSpeed;
            }
            // R A = R A R-1 R 
            this.object.rotation.mulsr(this._bivec.exp());
            this.object.translates(this._vec.copy(this._moveVec).rotates(this.object.rotation));
            this._moveVec.mulfs(dampFactor);
            if ((state.updateCount & this.normalisePeriodMask) === 0) {
                this.object.rotation.norms();
            }
        }
    }
    class KeepUpController {
        enabled = true;
        object = new Obj4();
        mouseSpeed = 0.01;
        wheelSpeed = 0.0001;
        keyMoveSpeed = 0.001;
        keyRotateSpeed = 0.001;
        damp = 0.05;
        keyConfig = {
            front: "KeyW",
            back: "KeyS",
            left: "KeyA",
            right: "KeyD",
            ana: "KeyQ",
            kata: "KeyE",
            up: "Space",
            down: "ShiftLeft",
            turnLeft: "KeyJ",
            turnRight: "KeyL",
            turnAna: "KeyU",
            turnKata: "KeyO",
            turnUp: "KeyI",
            turnDown: "KeyK",
            spinCW: "KeyZ",
            spinCCW: "KeyX",
            disable: "AltLeft",
            enable: ""
        };
        /** how many update cycles (2^n) to normalise rotor to avoid accuracy problem */
        normalisePeriodBit;
        _bivec = new Bivec();
        _bivec2 = new Bivec();
        _bivecKey = new Bivec();
        _moveVec = new Vec4();
        _vec = new Vec4();
        normalisePeriodMask = 15;
        horizontalRotor = new Rotor();
        verticalRotor = new Rotor();
        constructor(object) {
            if (object)
                this.object = object;
            this.updateObj();
        }
        updateObj() {
            // rotate obj's yw plane to world's y axis
            this.object.rotates(Rotor.lookAtvb(Vec4.y, Bivec.yw.rotate(this.object.rotation)).conjs());
            // now check angle between obj's y axis and world's y axis
            let objY = Vec4.y.rotate(this.object.rotation);
            let r = Rotor.lookAt(objY, Vec4.y);
            this.horizontalRotor.copy(r.mul(this.object.rotation));
            this.verticalRotor.copy(this.horizontalRotor.mul(r.conjs()).mulsrconj(this.horizontalRotor));
        }
        update(state) {
            let on = state.isKeyHold;
            let key = this.keyConfig;
            let delta;
            let dampFactor = Math.exp(-this.damp * Math.min(200.0, state.mspf));
            let disabled = state.isKeyHold(this.keyConfig.disable);
            if (!this.enabled)
                return;
            if (!disabled) {
                let keyRotateSpeed = this.keyRotateSpeed * state.mspf;
                delta = (on(key.spinCW) ? -1 : 0) + (on(key.spinCCW) ? 1 : 0);
                if (delta)
                    this._bivecKey.xz = delta * keyRotateSpeed;
                delta = (on(key.turnLeft) ? -1 : 0) + (on(key.turnRight) ? 1 : 0);
                if (delta)
                    this._bivecKey.xw = delta * keyRotateSpeed;
                delta = (on(key.turnUp) ? 1 : 0) + (on(key.turnDown) ? -1 : 0);
                if (delta)
                    this._bivecKey.yw = delta * keyRotateSpeed;
                delta = (on(key.turnAna) ? -1 : 0) + (on(key.turnKata) ? 1 : 0);
                if (delta)
                    this._bivecKey.zw = delta * keyRotateSpeed;
            }
            this._bivec.xw = this._bivecKey.xw;
            this._bivec.zw = this._bivecKey.zw;
            if (!disabled) {
                if ((state.enablePointerLock && state.isPointerLocked()) || (state.currentBtn === 0 && !state.enablePointerLock)) {
                    let dx = state.moveX * this.mouseSpeed;
                    let dy = state.moveY * this.mouseSpeed;
                    this._bivec.xw += dx;
                    this._bivec.zw += dy;
                }
                if ((state.enablePointerLock && state.isPointerLocked()) || (!state.enablePointerLock)) {
                    let wy = -state.wheelY * this.wheelSpeed;
                    this._bivecKey.yw += wy;
                }
            }
            this._bivec.xz = this._bivecKey.xz;
            this._bivec2.yw = this._bivecKey.yw;
            // R A = R A R-1 R 
            this.horizontalRotor.mulsr(this._bivec.exp());
            this.verticalRotor.mulsr(this._bivec2.exp());
            if (!disabled) {
                let keyMoveSpeed = this.keyMoveSpeed * state.mspf;
                delta = (on(key.left) ? -1 : 0) + (on(key.right) ? 1 : 0);
                if (delta)
                    this._moveVec.x = delta * keyMoveSpeed;
                delta = (on(key.up) ? 1 : 0) + (on(key.down) ? -1 : 0);
                if (delta)
                    this._moveVec.y = delta * keyMoveSpeed;
                delta = (on(key.ana) ? -1 : 0) + (on(key.kata) ? 1 : 0);
                if (delta)
                    this._moveVec.z = delta * keyMoveSpeed;
                delta = (on(key.front) ? -1 : 0) + (on(key.back) ? 1 : 0);
                if (delta)
                    this._moveVec.w = delta * keyMoveSpeed;
            }
            this.object.translates(this._vec.copy(this._moveVec).rotates(this.horizontalRotor));
            this.object.rotation.copy(this.horizontalRotor.mul(this.verticalRotor));
            this._moveVec.mulfs(dampFactor);
            this._bivecKey.mulfs(dampFactor);
            if ((state.updateCount & this.normalisePeriodMask) === 0) {
                this.horizontalRotor.norms();
                this.verticalRotor.norms();
            }
        }
    }
    class VoxelViewerController {
        enabled = true;
        object = new Obj4(Vec4.w.neg());
        mouseSpeed = 0.01;
        wheelSpeed = 0.0001;
        damp = 0.1;
        mousePan = 2;
        mousePanZ = 1;
        mouseRotate = 0;
        /** how many update cycles (2^n) to normalise rotor to avoid accuracy problem */
        normalisePeriodBit;
        keyConfig = {
            disable: "AltLeft",
            enable: "",
        };
        _bivec = new Bivec();
        _vec = new Vec4();
        _wy = 0;
        normalisePeriodMask = 15;
        constructor(object) {
            if (object)
                this.object = object;
        }
        update(state) {
            let disabled = state.isKeyHold(this.keyConfig.disable) || !this.enabled;
            let dampFactor = Math.exp(-this.damp * Math.min(200.0, state.mspf));
            if (!disabled) {
                let dx = state.moveX * this.mouseSpeed;
                let dy = -state.moveY * this.mouseSpeed;
                let wy = state.wheelY * this.wheelSpeed;
                switch (state.currentBtn) {
                    case this.mousePan:
                        this._vec.set(dx * this.object.scale.x, dy * this.object.scale.y).rotates(this.object.rotation);
                        this._bivec.set();
                        break;
                    case this.mousePanZ:
                        this._vec.set(dx * this.object.scale.x, 0, -dy * this.object.scale.z).rotates(this.object.rotation);
                        this._bivec.set();
                        break;
                    case this.mouseRotate:
                        this._bivec.set(0, dx, 0, dy);
                        this._vec.set();
                        break;
                    default:
                        this._bivec.mulfs(dampFactor);
                        this._vec.mulfs(dampFactor);
                }
                this.object.position.subs(this._vec);
                this._wy = wy ? wy : this._wy * dampFactor;
                if (this.object.scale)
                    this.object.scale.mulfs(1 + this._wy);
            }
            else {
                this._bivec.mulfs(dampFactor);
                this._vec.mulfs(dampFactor);
                this._wy *= dampFactor;
            }
            this.object.rotation.mulsr(this._bivec.exp());
            if ((state.updateCount & this.normalisePeriodMask) === 0) {
                this.object.rotation.norms();
            }
        }
    }
    var sliceconfig;
    (function (sliceconfig) {
        function singlezslice1eye(screenSize) {
            let aspect = screenSize.height / screenSize.width;
            let resolution = screenSize.height;
            return [{
                    slicePos: 0,
                    facing: RetinaSliceFacing.POSZ,
                    viewport: { x: 0, y: 0, width: 1 / aspect, height: 1.0 },
                    resolution
                }];
        }
        sliceconfig.singlezslice1eye = singlezslice1eye;
        function singlezslice2eye(screenSize) {
            let aspect = screenSize.height / screenSize.width;
            let resolution = screenSize.height * 0.8;
            return [{
                    slicePos: 0,
                    facing: RetinaSliceFacing.POSZ,
                    eyeStereo: EyeStereo.LeftEye,
                    viewport: { x: -0.5, y: 0, width: 0.5 / aspect, height: 0.8 },
                    resolution
                }, {
                    slicePos: 0,
                    facing: RetinaSliceFacing.POSZ,
                    eyeStereo: EyeStereo.RightEye,
                    viewport: { x: 0.5, y: 0, width: 0.5 / aspect, height: 0.8 },
                    resolution
                }];
        }
        sliceconfig.singlezslice2eye = singlezslice2eye;
        function singleyslice1eye(screenSize) {
            let aspect = screenSize.height / screenSize.width;
            let resolution = screenSize.height;
            return [{
                    slicePos: 0,
                    facing: RetinaSliceFacing.NEGY,
                    viewport: { x: 0, y: 0, width: 1 / aspect, height: 1.0 },
                    resolution
                }];
        }
        sliceconfig.singleyslice1eye = singleyslice1eye;
        function singleyslice2eye(screenSize) {
            let aspect = screenSize.height / screenSize.width;
            let resolution = screenSize.height * 0.8;
            return [{
                    slicePos: 0,
                    facing: RetinaSliceFacing.NEGY,
                    eyeStereo: EyeStereo.LeftEye,
                    viewport: { x: -0.5, y: 0, width: 0.5 / aspect, height: 0.8 },
                    resolution
                }, {
                    slicePos: 0,
                    facing: RetinaSliceFacing.NEGY,
                    eyeStereo: EyeStereo.RightEye,
                    viewport: { x: 0.5, y: 0, width: 0.5 / aspect, height: 0.8 },
                    resolution
                }];
        }
        sliceconfig.singleyslice2eye = singleyslice2eye;
        function zslices1eye(step, maxpos, screenSize) {
            let aspect = screenSize.height / screenSize.width;
            let arr = [[0, 0]];
            let j = 1;
            for (let i = step; i <= maxpos; i += step, j++) {
                arr.push([i, j]);
                arr.push([-i, -j]);
            }
            let half = 2 / arr.length;
            let size = 1 / (aspect * arr.length);
            let resolution = screenSize.height * size;
            return arr.map(pos => ({
                slicePos: pos[0],
                facing: RetinaSliceFacing.POSZ,
                viewport: { x: pos[1] * half, y: size - 1, width: size, height: size },
                resolution
            }));
        }
        sliceconfig.zslices1eye = zslices1eye;
        function zslices2eye(step, maxpos, screenSize) {
            let aspect = screenSize.height / screenSize.width;
            let arr = [[0, 0]];
            let j = 1;
            for (let i = step; i <= maxpos; i += step, j++) {
                arr.push([i, j]);
                arr.push([-i, -j]);
            }
            arr.sort((a, b) => a[0] - b[0]);
            let half = 1 / arr.length;
            let size = 0.5 / (aspect * arr.length);
            let resolution = screenSize.height * size;
            return arr.map(pos => ({
                slicePos: pos[0],
                facing: RetinaSliceFacing.POSZ,
                eyeStereo: EyeStereo.LeftEye,
                viewport: { x: (pos[1] * half) - 0.5, y: size - 1, width: size, height: size },
                resolution
            })).concat(arr.map(pos => ({
                slicePos: pos[0],
                facing: RetinaSliceFacing.POSZ,
                eyeStereo: EyeStereo.RightEye,
                viewport: { x: (pos[1] * half) + 0.5, y: size - 1, width: size, height: size },
                resolution
            })));
        }
        sliceconfig.zslices2eye = zslices2eye;
        function yslices1eye(step, maxpos, screenSize) {
            let aspect = screenSize.height / screenSize.width;
            let arr = [[0, 0]];
            let j = 1;
            for (let i = step; i <= maxpos; i += step, j++) {
                arr.push([i, j]);
                arr.push([-i, -j]);
            }
            let half = 2 / arr.length;
            let size = 1 / (aspect * arr.length);
            let resolution = screenSize.height * size;
            return arr.map(pos => ({
                slicePos: pos[0],
                facing: RetinaSliceFacing.NEGY,
                viewport: { x: pos[1] * half, y: size - 1, width: size, height: size },
                resolution
            }));
        }
        sliceconfig.yslices1eye = yslices1eye;
        function yslices2eye(step, maxpos, screenSize) {
            let aspect = screenSize.height / screenSize.width;
            let arr = [[0, 0]];
            let j = 1;
            for (let i = step; i <= maxpos; i += step, j++) {
                arr.push([i, j]);
                arr.push([-i, -j]);
            }
            arr.sort((a, b) => a[0] - b[0]);
            let half = 1 / arr.length;
            let size = 0.5 / (aspect * arr.length);
            let resolution = screenSize.height * size;
            return arr.map(pos => ({
                slicePos: pos[0],
                facing: RetinaSliceFacing.NEGY,
                eyeStereo: EyeStereo.LeftEye,
                viewport: { x: (pos[1] * half) - 0.5, y: size - 1, width: size, height: size },
                resolution
            })).concat(arr.map(pos => ({
                slicePos: pos[0],
                facing: RetinaSliceFacing.NEGY,
                eyeStereo: EyeStereo.RightEye,
                viewport: { x: (pos[1] * half) + 0.5, y: size - 1, width: size, height: size },
                resolution
            })));
        }
        sliceconfig.yslices2eye = yslices2eye;
        function default2eye(size, screenSize) {
            let aspect = screenSize.height / screenSize.width;
            let resolution = screenSize.height * size;
            let wsize;
            let size_aspect;
            if (size >= 0.5) {
                wsize = 0.25 / aspect;
                size_aspect = 0.25;
                size = 0.5;
            }
            else {
                size_aspect = size * aspect;
                wsize = size;
            }
            return [
                {
                    facing: RetinaSliceFacing.NEGX,
                    eyeStereo: EyeStereo.LeftEye,
                    viewport: { x: -size_aspect, y: size - 1, width: wsize, height: size },
                    resolution
                },
                {
                    facing: RetinaSliceFacing.NEGX,
                    eyeStereo: EyeStereo.RightEye,
                    viewport: { x: 1 - size_aspect, y: size - 1, width: wsize, height: size },
                    resolution
                },
                {
                    facing: RetinaSliceFacing.NEGY,
                    eyeStereo: EyeStereo.LeftEye,
                    viewport: { x: -size_aspect, y: 1 - size, width: wsize, height: size },
                    resolution
                },
                {
                    facing: RetinaSliceFacing.NEGY,
                    eyeStereo: EyeStereo.RightEye,
                    viewport: { x: 1 - size_aspect, y: 1 - size, width: wsize, height: size },
                    resolution
                },
                {
                    facing: RetinaSliceFacing.POSZ,
                    eyeStereo: EyeStereo.LeftEye,
                    viewport: { x: size_aspect - 1, y: size - 1, width: wsize, height: size },
                    resolution
                },
                {
                    facing: RetinaSliceFacing.POSZ,
                    eyeStereo: EyeStereo.RightEye,
                    viewport: { x: size_aspect, y: size - 1, width: wsize, height: size },
                    resolution
                },
            ];
        }
        sliceconfig.default2eye = default2eye;
        function default1eye(size, screenSize) {
            let aspect = screenSize.height / screenSize.width;
            let resolution = screenSize.height * size;
            let wsize;
            let size_aspect;
            if (size >= 0.5) {
                wsize = 0.5 / aspect;
                size_aspect = 0.5;
                size = 0.5;
            }
            else {
                size_aspect = size * aspect;
                wsize = size;
            }
            return [
                {
                    facing: RetinaSliceFacing.NEGX,
                    viewport: { x: 1 - size_aspect, y: size - 1, width: wsize, height: size },
                    resolution
                },
                {
                    facing: RetinaSliceFacing.NEGY,
                    viewport: { x: 1 - size_aspect, y: 1 - size, width: wsize, height: size },
                    resolution
                },
                {
                    facing: RetinaSliceFacing.POSZ,
                    viewport: { x: size_aspect - 1, y: size - 1, width: wsize, height: size },
                    resolution
                }
            ];
        }
        sliceconfig.default1eye = default1eye;
    })(sliceconfig || (sliceconfig = {}));
    const retinaRenderPassDescriptors = [
        {},
        {
            alphaShader: {
                code: `@group(1) @binding(0) var<uniform> alphaParams : vec4f;
            fn main(color:vec4f, coord: vec3<f32>)->f32{
                return color.a * (1.0 - smoothstep(alphaParams.x,alphaParams.y,dot(coord,coord))) * alphaParams.z;
            }`, entryPoint: 'main'
            }
        }, {
            alphaShader: {
                code: `@group(1) @binding(0) var<uniform> alphaParams : vec4f;
            fn main(color:vec4f, coord  : vec3<f32>)->f32{
                return color.a * max(step(abs(coord.x),alphaParams.x)*step(abs(coord.y),alphaParams.x)*step(abs(coord.z),alphaParams.x)* alphaParams.y,alphaParams.z);
            }`, entryPoint: 'main'
            }
        }, {
            alphaShader: {
                code: `@group(1) @binding(0) var<uniform> alphaParams : vec4f;
            fn main(color:vec4f, coord: vec3<f32>)->f32{ 
                return color.a * max(step(dot(coord,alphaParams.xyz),0.0),alphaParams.w); 
            }`, entryPoint: 'main'
            }
        },
    ];
    class RetinaController {
        enabled = true;
        renderer;
        mouseSpeed = 0.01;
        wheelSpeed = 0.0005;
        keyMoveSpeed = 0.1;
        keyRotateSpeed = 0.002;
        opacityKeySpeed = 0.01;
        fovKeySpeed = 1;
        damp = 0.02;
        mouseButton = 0;
        retinaAlphaMouseButton = 2;
        retinaEyeOffset = 0.1;
        sectionEyeOffset = 0.2;
        maxSectionEyeOffset = 1;
        minSectionEyeOffset = 0.01;
        size;
        sectionPresets;
        currentSectionConfig = "retina+sections";
        rembemerLastLayers;
        needResize = true;
        currentRetinaRenderPassIndex = -1;
        keyConfig = {
            enable: "AltLeft",
            disable: "",
            addOpacity: "KeyQ",
            subOpacity: "KeyA",
            addLayer: "KeyW",
            subLayer: "KeyS",
            addRetinaResolution: ".KeyE",
            subRetinaResolution: ".KeyD",
            addFov: "KeyT",
            subFov: "KeyG",
            toggle3D: ".KeyZ",
            addEyes3dGap: "KeyB",
            subEyes3dGap: "KeyV",
            addEyes4dGap: "KeyM",
            subEyes4dGap: "KeyN",
            negEyesGap: ".KeyX",
            toggleCrosshair: ".KeyC",
            rotateLeft: "ArrowLeft",
            rotateRight: "ArrowRight",
            rotateUp: "ArrowUp",
            rotateDown: "ArrowDown",
            refaceFront: ".KeyR",
            refaceRight: ".KeyL",
            refaceLeft: ".KeyJ",
            refaceTop: ".KeyI",
            refaceBottom: ".KeyK",
            toggleRetinaAlpha: ".KeyF",
            sectionConfigs: {
                "retina+sections": ".Digit1",
                "retina+bigsections": ".Digit2",
                "retina": ".Digit3",
                "sections": ".Digit4",
                "zsection": ".Digit5",
                "ysection": ".Digit6",
                "retina+zslices": ".Digit7",
                "retina+yslices": ".Digit8",
            },
        };
        alphaBuffer;
        guiMouseOperation = "";
        constructor(r) {
            this.renderer = r;
            const gui = new RetinaCtrlGui(this);
            this.gui = gui;
            document.body.appendChild(gui.dom);
            this.defaultRetinaRenderPass = r.getCurrentRetinaRenderPass();
            this.alphaBuffer = r.gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 16, "RetinaController's Retina Alpha Uniform Buffer");
            this.retinaRenderPasses = retinaRenderPassDescriptors.map((desc, index) => {
                if (desc?.alphaShader?.code && desc.alphaShader.code.indexOf("@group(1)") !== -1)
                    desc.alphaShaderBindingResources = [{ buffer: this.alphaBuffer }];
                // this jsBuffer uses first 4 elements to write to GPU, other elems are used for js state storage
                const jsBuffer = new Float32Array(8);
                switch (index) {
                    case 1:
                        jsBuffer[4] = 1;
                        jsBuffer[5] = 1;
                        const r2 = jsBuffer[4] * jsBuffer[4];
                        jsBuffer[0] = r2 / jsBuffer[5];
                        jsBuffer[1] = r2 * jsBuffer[5];
                        jsBuffer[2] = 4 / (1 + r2);
                        break;
                    case 2:
                        jsBuffer[0] = 0.5;
                        jsBuffer[5] = 0;
                        jsBuffer[1] = 2 - jsBuffer[0];
                        jsBuffer[2] = jsBuffer[5];
                        break;
                    case 3:
                        jsBuffer[2] = 1;
                        jsBuffer[3] = 0.01;
                }
                return { promise: r.createRetinaRenderPass(desc).init(), jsBuffer };
            });
            this.sectionPresets = (screenSize) => ({
                "retina+sections": {
                    eye1: sliceconfig.default1eye(0.3, screenSize),
                    eye2: sliceconfig.default2eye(0.2, screenSize),
                    retina: true
                },
                "retina+bigsections": {
                    eye1: sliceconfig.default1eye(0.44, screenSize),
                    eye2: sliceconfig.default2eye(0.33, screenSize),
                    retina: true
                },
                "retina": {
                    eye1: [],
                    eye2: [],
                    retina: true
                },
                "sections": {
                    eye1: sliceconfig.default1eye(0.5, screenSize),
                    eye2: sliceconfig.default2eye(0.5, screenSize),
                    retina: false
                },
                "retina+zslices": {
                    eye1: sliceconfig.zslices1eye(0.15, 0.6, screenSize),
                    eye2: sliceconfig.zslices2eye(0.3, 0.6, screenSize),
                    retina: true
                },
                "retina+yslices": {
                    eye1: sliceconfig.yslices1eye(0.15, 0.6, screenSize),
                    eye2: sliceconfig.yslices2eye(0.3, 0.6, screenSize),
                    retina: true
                },
                "zsection": {
                    eye1: sliceconfig.singlezslice1eye(screenSize),
                    eye2: sliceconfig.singlezslice2eye(screenSize),
                    retina: false
                },
                "ysection": {
                    eye1: sliceconfig.singleyslice1eye(screenSize),
                    eye2: sliceconfig.singleyslice2eye(screenSize),
                    retina: false
                },
            });
        }
        _vec2damp = new Vec2();
        _vec2euler = new Vec2();
        _vec3 = new Vec3();
        _q1 = new Quaternion();
        _q2 = new Quaternion();
        _mat4 = new Mat4();
        refacingFront = false;
        refacingTarget = new Vec2;
        needsUpdateRetinaCamera = false;
        retinaFov = 40;
        retinaSize = 1.8;
        retinaZDistance = 5;
        crossHairSize = 0.03;
        /** Store displayconfig temporal changes between frames */
        tempDisplayConfig = {};
        displayConfigChanged = false;
        maxRetinaResolution = 1024;
        retinaRenderPasses;
        defaultRetinaRenderPass;
        gui;
        toggleRetinaAlpha(idx) {
            const { promise, jsBuffer } = this.retinaRenderPasses[idx];
            if (promise) {
                promise.then(pass => {
                    this.renderer.gpu.device.queue.writeBuffer(this.alphaBuffer, 0, jsBuffer.buffer, 0, 4);
                    this.renderer.setRetinaRenderPass(pass);
                    this.gui?.refresh({ "toggleRetinaAlpha": idx });
                    this.currentRetinaRenderPassIndex = idx;
                });
            }
            else {
                this.renderer.setRetinaRenderPass(this.defaultRetinaRenderPass);
                this.gui?.refresh({ "toggleRetinaAlpha": idx });
                this.currentRetinaRenderPassIndex = -1;
            }
        }
        getSubLayersNumber(updateCount) {
            // when < 32, we slow down layer speed
            let layers = this.renderer.getDisplayConfig('retinaLayers');
            if (layers > 32 || ((updateCount & 3) && (layers > 16 || (updateCount & 7)))) {
                if (layers > 0)
                    layers--;
            }
            return layers;
        }
        getAddLayersNumber(updateCount) {
            let layers = this.renderer.getDisplayConfig('retinaLayers');
            if (updateCount === undefined)
                return Math.min(512, layers + 1);
            if (layers > 32 || ((updateCount & 3) && (layers > 16 || (updateCount & 7)))) {
                layers++;
            }
            return Math.min(512, layers);
        }
        update(state) {
            let enabled = (!this.keyConfig.enable || state.isKeyHold(this.keyConfig.enable)) && this.enabled;
            const on = (k) => state.isKeyHold(k) && enabled;
            let key = this.keyConfig;
            let delta;
            // retreive all temporal changes before this frame
            let displayConfig = this.tempDisplayConfig;
            if (this.displayConfigChanged)
                this.tempDisplayConfig = {};
            this.displayConfigChanged = false;
            let stereo = this.renderer.getStereoMode();
            if (on(this.keyConfig.toggle3D)) {
                this.writeConfigToggleStereoMode(displayConfig, !stereo);
                this.gui?.refresh({ "toggleStereo": !stereo });
            }
            else if (this.needResize) {
                displayConfig.sections = this.sectionPresets(this.renderer.getDisplayConfig("canvasSize"))[this.currentSectionConfig][(stereo ? "eye2" : "eye1")];
            }
            this.needResize = false;
            if (stereo) {
                if (on(this.keyConfig.addEyes3dGap)) {
                    this.retinaEyeOffset *= 1.05;
                    if (this.retinaEyeOffset > 0.4)
                        this.retinaEyeOffset = 0.4;
                    if (this.retinaEyeOffset < -0.4)
                        this.retinaEyeOffset = -0.4;
                    displayConfig.retinaStereoEyeOffset = this.retinaEyeOffset;
                    displayConfig.sectionStereoEyeOffset = this.sectionEyeOffset;
                }
                if (on(this.keyConfig.subEyes3dGap)) {
                    this.retinaEyeOffset /= 1.05;
                    if (this.retinaEyeOffset > 0 && this.retinaEyeOffset < 0.03)
                        this.retinaEyeOffset = 0.03;
                    if (this.retinaEyeOffset < 0 && this.retinaEyeOffset > -0.03)
                        this.retinaEyeOffset = -0.03;
                    displayConfig.retinaStereoEyeOffset = this.retinaEyeOffset;
                    displayConfig.sectionStereoEyeOffset = this.sectionEyeOffset;
                }
                if (on(this.keyConfig.addEyes4dGap)) {
                    this.sectionEyeOffset *= 1.05;
                    if (this.sectionEyeOffset > this.maxSectionEyeOffset)
                        this.sectionEyeOffset = this.maxSectionEyeOffset;
                    if (this.sectionEyeOffset < -this.maxSectionEyeOffset)
                        this.sectionEyeOffset = -this.maxSectionEyeOffset;
                    displayConfig.retinaStereoEyeOffset = this.retinaEyeOffset;
                    displayConfig.sectionStereoEyeOffset = this.sectionEyeOffset;
                }
                if (on(this.keyConfig.subEyes4dGap)) {
                    this.sectionEyeOffset /= 1.05;
                    if (this.sectionEyeOffset > 0 && this.sectionEyeOffset < this.minSectionEyeOffset)
                        this.sectionEyeOffset = this.minSectionEyeOffset;
                    if (this.sectionEyeOffset < 0 && this.sectionEyeOffset > -this.minSectionEyeOffset)
                        this.sectionEyeOffset = -this.minSectionEyeOffset;
                    displayConfig.retinaStereoEyeOffset = this.retinaEyeOffset;
                    displayConfig.sectionStereoEyeOffset = this.sectionEyeOffset;
                }
                if (this.guiMouseOperation === "negEyesGap" || on(this.keyConfig.negEyesGap)) {
                    this.sectionEyeOffset = -this.sectionEyeOffset;
                    this.retinaEyeOffset = -this.retinaEyeOffset;
                    displayConfig.retinaStereoEyeOffset = this.retinaEyeOffset;
                    displayConfig.sectionStereoEyeOffset = this.sectionEyeOffset;
                    this.gui?.refresh({ "negEyesGap": this.retinaEyeOffset > 0 || this.sectionEyeOffset > 0 });
                }
            }
            if (on(this.keyConfig.toggleCrosshair)) {
                this.writeConfigToggleCrosshair(displayConfig);
            }
            if (this.guiMouseOperation === "opacitypBtn" || on(this.keyConfig.addOpacity)) {
                displayConfig.opacity = this.renderer.getDisplayConfig("opacity") * (1 + this.opacityKeySpeed);
            }
            if (this.guiMouseOperation === "opacitymBtn" || on(this.keyConfig.subOpacity)) {
                displayConfig.opacity = this.renderer.getDisplayConfig("opacity") / (1 + this.opacityKeySpeed);
            }
            if (this.guiMouseOperation === "layerpBtn" || on(this.keyConfig.addLayer)) {
                displayConfig.retinaLayers = this.getAddLayersNumber(state.updateCount);
            }
            if (this.guiMouseOperation === "layermBtn" || on(this.keyConfig.subLayer)) {
                displayConfig.retinaLayers = this.getSubLayersNumber(state.updateCount);
            }
            if (this.guiMouseOperation === "respBtn" || on(this.keyConfig.addRetinaResolution)) {
                this.guiMouseOperation = "";
                let res = this.renderer.getDisplayConfig('retinaResolution');
                res += this.renderer.getMinResolutionMultiple();
                if (res <= this.maxRetinaResolution)
                    displayConfig.retinaResolution = res;
            }
            if (this.guiMouseOperation === "resmBtn" || on(this.keyConfig.subRetinaResolution)) {
                this.guiMouseOperation = "";
                let res = this.renderer.getDisplayConfig('retinaResolution');
                res -= this.renderer.getMinResolutionMultiple();
                if (res > 0)
                    displayConfig.retinaResolution = res;
            }
            if (this.guiMouseOperation === "fovpBtn" || on(this.keyConfig.addFov)) {
                this.retinaFov += this.fovKeySpeed;
                if (this.retinaFov > 120)
                    this.retinaFov = 120;
                this.needsUpdateRetinaCamera = true;
            }
            if (this.guiMouseOperation === "fovmBtn" || on(this.keyConfig.subFov)) {
                this.retinaFov -= this.fovKeySpeed;
                if (this.retinaFov < 0.1)
                    this.retinaFov = 0;
                this.needsUpdateRetinaCamera = true;
            }
            if (on(this.keyConfig.toggleRetinaAlpha)) {
                this.currentRetinaRenderPassIndex++;
                if (this.currentRetinaRenderPassIndex >= retinaRenderPassDescriptors.length)
                    this.currentRetinaRenderPassIndex = 0;
                this.toggleRetinaAlpha(this.currentRetinaRenderPassIndex);
            }
            if (enabled && state.currentBtn === this.retinaAlphaMouseButton && this.currentRetinaRenderPassIndex > 0) {
                const { jsBuffer } = this.retinaRenderPasses[this.currentRetinaRenderPassIndex];
                switch (this.currentRetinaRenderPassIndex) {
                    case 1:
                        jsBuffer[4] += state.moveY * 0.01;
                        jsBuffer[5] += state.moveX * 0.01;
                        jsBuffer[4] = Math.max(0.01, Math.min(jsBuffer[4], _SQRT_3));
                        jsBuffer[5] = Math.max(1, Math.min(jsBuffer[5], 5));
                        const r2 = jsBuffer[4] * jsBuffer[4];
                        jsBuffer[0] = r2 / jsBuffer[5];
                        jsBuffer[1] = r2 * jsBuffer[5];
                        jsBuffer[2] = 4 / (1 + r2);
                        break;
                    case 2:
                        jsBuffer[0] += state.moveY * 0.01;
                        jsBuffer[5] += state.moveX * 0.01;
                        jsBuffer[0] = Math.max(0.01, Math.min(jsBuffer[0], 1));
                        jsBuffer[5] = Math.max(0, Math.min(jsBuffer[5], 0.1));
                        jsBuffer[1] = 2 - jsBuffer[0];
                        jsBuffer[2] = jsBuffer[5];
                        break;
                    case 3:
                        let n = new Vec3(jsBuffer[0], jsBuffer[1], jsBuffer[2]).norms();
                        // n.rotates(new Vec3(state.moveY, state.moveX).mulfs(0.01).exp());
                        let y = Math.acos(n.y) + state.moveX * 0.01;
                        let x = Math.atan2(n.z, n.x) + state.moveY * 0.01;
                        const sy = Math.sin(y);
                        n.set(Math.cos(x) * sy, Math.cos(y), Math.sin(x) * sy);
                        n.writeBuffer(jsBuffer);
                }
                this.renderer.gpu.device.queue.writeBuffer(this.alphaBuffer, 0, jsBuffer.buffer, 0, 4);
            }
            for (let [label, keyCode] of Object.entries(this.keyConfig.sectionConfigs)) {
                if (on(keyCode)) {
                    this.toggleSectionConfig(label);
                }
            }
            delta = (on(key.rotateDown) ? -1 : 0) + (on(key.rotateUp) ? 1 : 0);
            let keyRotateSpeed = this.keyRotateSpeed * state.mspf;
            if (delta)
                this._vec2damp.y = delta * keyRotateSpeed;
            delta = (on(key.rotateLeft) ? 1 : 0) + (on(key.rotateRight) ? -1 : 0);
            if (delta)
                this._vec2damp.x = delta * keyRotateSpeed;
            if (enabled) {
                if (state.currentBtn === this.mouseButton) {
                    this.refacingFront = false;
                    if (state.moveX)
                        this._vec2damp.x = state.moveX * this.mouseSpeed;
                    if (state.moveY)
                        this._vec2damp.y = state.moveY * this.mouseSpeed;
                }
                if (state.wheelY) {
                    this.needsUpdateRetinaCamera = true;
                    this.retinaSize += state.wheelY * this.wheelSpeed;
                }
            }
            if (on(key.refaceFront)) {
                this.refacingFront = true;
                this.refacingTarget.set();
            }
            else if (on(key.refaceRight)) {
                this.refacingFront = true;
                this.refacingTarget.set(_90, 0);
            }
            else if (on(key.refaceTop)) {
                this.refacingFront = true;
                this.refacingTarget.set(0, -_90);
            }
            else if (on(key.refaceLeft)) {
                this.refacingFront = true;
                this.refacingTarget.set(-_90, 0);
            }
            else if (on(key.refaceBottom)) {
                this.refacingFront = true;
                this.refacingTarget.set(0, _90);
            }
            if (this._vec2damp.norm1() < 1e-3 || this.refacingFront) {
                this._vec2damp.set(0, 0);
            }
            if (this._vec2damp.norm1() > 1e-3 || this.refacingFront || this.needsUpdateRetinaCamera) {
                if (this.needsUpdateRetinaCamera) {
                    if (this.retinaFov > 0) {
                        this.retinaZDistance = this.retinaSize / Math.tan(this.retinaFov / 2 * _DEG2RAD);
                        displayConfig.camera3D = {
                            fov: this.retinaFov,
                            near: Math.max(0.01, this.retinaZDistance - 4),
                            far: this.retinaZDistance + 4
                        };
                    }
                    else {
                        this.retinaZDistance = 4;
                        displayConfig.camera3D = {
                            size: this.retinaSize,
                            near: 2,
                            far: 8
                        };
                    }
                }
                this.needsUpdateRetinaCamera = false;
                this._vec2euler.x %= _360;
                this._vec2euler.y %= _360;
                let dampFactor = Math.exp(-this.damp * Math.min(200.0, state.mspf));
                if (this.refacingFront) {
                    this._vec2euler.subs(this.refacingTarget).mulfs(dampFactor);
                    if (this._vec2euler.norm1() < 0.01)
                        this.refacingFront = false;
                    this._vec2euler.adds(this.refacingTarget);
                }
                this._vec2euler.adds(this._vec2damp);
                let mat = this._mat4.setFrom3DRotation(this._q1.expset(this._vec3.set(0, this._vec2euler.x, 0)).mulsr(this._q2.expset(this._vec3.set(this._vec2euler.y, 0, 0))).conjs());
                mat.elem[11] = -this.retinaZDistance;
                displayConfig.retinaViewMatrix = mat;
                this._vec2damp.mulfs(dampFactor);
            }
            this.renderer.setDisplayConfig(displayConfig);
        }
        writeConfigToggleStereoMode(dstConfig, stereo) {
            stereo ??= !this.renderer.getStereoMode();
            if (!stereo) {
                dstConfig.retinaStereoEyeOffset = 0;
                dstConfig.sectionStereoEyeOffset = 0;
            }
            else {
                dstConfig.retinaStereoEyeOffset = this.retinaEyeOffset;
                dstConfig.sectionStereoEyeOffset = this.sectionEyeOffset;
            }
            dstConfig.sections = this.sectionPresets(this.renderer.getDisplayConfig("canvasSize"))[this.currentSectionConfig][(stereo ? "eye2" : "eye1")];
        }
        toggleStereo(stereo) {
            this.gui?.refresh({ "toggleStereo": stereo || !this.renderer.getStereoMode() });
            this.writeConfigToggleStereoMode(this.tempDisplayConfig, stereo);
            this.displayConfigChanged = true;
        }
        writeConfigToggleCrosshair(dstConfig, size) {
            if (!size) {
                let crossHair = this.renderer.getDisplayConfig('crosshair');
                dstConfig.crosshair = crossHair === 0 ? this.crossHairSize : 0;
            }
            else {
                dstConfig.crosshair = size;
                this.crossHairSize = size;
            }
        }
        toggleCrosshair() {
            this.writeConfigToggleCrosshair(this.tempDisplayConfig);
            this.displayConfigChanged = true;
        }
        setSectionEyeOffset(offset) {
            let stereo = this.renderer.getStereoMode();
            this.sectionEyeOffset = offset;
            if (stereo) {
                this.tempDisplayConfig.sectionStereoEyeOffset = offset;
                this.displayConfigChanged = true;
            }
        }
        setRetinaEyeOffset(offset) {
            let stereo = this.renderer.getStereoMode();
            this.retinaEyeOffset = offset;
            if (stereo) {
                this.tempDisplayConfig.retinaStereoEyeOffset = offset;
                this.displayConfigChanged = true;
            }
        }
        setLayers(layers) {
            this.tempDisplayConfig.retinaLayers = layers;
            this.displayConfigChanged = true;
        }
        setOpacity(opacity) {
            this.tempDisplayConfig.opacity = opacity;
            this.displayConfigChanged = true;
        }
        setCrosshairSize(size) {
            this.tempDisplayConfig.crosshair = size;
            this.crossHairSize = size;
            this.displayConfigChanged = true;
        }
        setRetinaResolution(retinaResolution) {
            this.tempDisplayConfig.retinaResolution = retinaResolution;
            this.displayConfigChanged = true;
        }
        setRetinaSize(size) {
            this.retinaSize = size;
            this.needsUpdateRetinaCamera = true;
        }
        setRetinaFov(fov) {
            this.retinaFov = fov;
            this.needsUpdateRetinaCamera = true;
        }
        toggleSectionConfig(index) {
            if (this.currentSectionConfig === index)
                return;
            let preset = this.sectionPresets(this.renderer.getDisplayConfig("canvasSize"))[index];
            if (!preset)
                console.error(`Section Configuration "${index}" does not exsit.`);
            let layers = this.renderer.getDisplayConfig("retinaLayers");
            if (preset.retina === false && layers > 0) {
                this.rembemerLastLayers = layers;
                layers = 0;
            }
            else if (preset.retina === true && this.rembemerLastLayers) {
                layers = this.rembemerLastLayers;
                this.rembemerLastLayers = null;
            }
            let stereo = this.renderer.getStereoMode();
            let sections = preset[(stereo ? "eye2" : "eye1")];
            this.displayConfigChanged = true;
            this.tempDisplayConfig.retinaLayers = layers;
            this.tempDisplayConfig.sections = sections;
            this.currentSectionConfig = index;
            this.gui?.refresh({ "toggleSectionConfig": index });
        }
        setSize(size) {
            this.tempDisplayConfig.canvasSize = size;
            this.displayConfigChanged = true;
            this.needResize = true;
        }
        setDisplayConfig(config) {
            if (config.canvasSize)
                this.setSize(config.canvasSize);
            if (config.opacity)
                this.setOpacity(config.opacity);
            if (config.retinaLayers)
                this.setLayers(config.retinaLayers);
            if (config.retinaResolution)
                this.setRetinaResolution(config.retinaResolution);
            if (config.crosshair)
                this.setCrosshairSize(config.crosshair);
            if (config.retinaStereoEyeOffset)
                this.setRetinaEyeOffset(config.retinaStereoEyeOffset);
            if (config.sectionStereoEyeOffset)
                this.setSectionEyeOffset(config.sectionStereoEyeOffset);
            if (config.screenBackgroundColor) {
                this.tempDisplayConfig.screenBackgroundColor = config.screenBackgroundColor;
                this.displayConfigChanged = true;
            }
        }
    }
    class RetinaCtrlGui {
        controller;
        dom;
        iconSize = 32;
        lang;
        refresh;
        createToggleDiv(CtrlBtn, display = "") {
            const div = document.createElement("div");
            div.style.display = "none";
            CtrlBtn.addEventListener("click", () => {
                div.style.display = div.style.display === "none" ? display : "none";
            });
            return div;
        }
        createDropBox(CtrlBtn, offset, width = 1) {
            const div = this.createToggleDiv(CtrlBtn);
            div.style.position = "absolute";
            div.className = "retina-ctrl-gui";
            div.style.width = this.iconSize * width + "px";
            div.style.top = this.iconSize + "px";
            div.style.left = this.iconSize * offset + "px";
            return div;
        }
        toggle() {
            this.dom.style.display = this.dom.style.display === "none" ? "" : "none";
        }
        constructor(retinaCtrl) {
            this.controller = retinaCtrl;
            this.dom = document.createElement("div");
            this.dom.style.position = "fixed";
            this.dom.style.top = "50vh";
            this.dom.style.right = "0";
            document.body.appendChild(this.dom);
            // write gui and set size event
            const SVG_HEADER = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='`;
            const SVG_LINE = `style="fill:none;stroke:#FFF;stroke-width:0.25;"`;
            const SVG_PLUS = `<text x="1.5" y="3.5" stroke="#F00" style="font-size:3px">+</text>`;
            const SVG_MINUS = `<text x="2" y="3.5" stroke="#F00" style="font-size:3px">-</text>`;
            const SVG_RETINA = `<path d="M 1.3,3.3 2.5,4 4.1,3.6 V 2 L 2.9,1.3 1.3,1.7 Z"/>`;
            const SVG_CHECKER = `${SVG_HEADER}0 0 5 5'><g style="fill:#FFF"><rect width="1" height="1" x="0.5" y="0.5"/><rect width="1" height="1" x="2.5" y="0.5"/><rect width="1" height="1" x="1.5" y="1.5"/><rect width="1" height="1" x="3.5" y="1.5"/><rect width="1" height="1" x="0.5" y="2.5"/><rect width="1" height="1" x="2.5" y="2.5"/><rect width="1" height="1" x="1.5" y="3.5"/><rect width="1" height="1" x="3.5" y="3.5"/>`;
            const SVG_CAM = `${SVG_HEADER}0 0 5 5'><g ${SVG_LINE}><circle cx="0.77" cy="1.57" r="0.4"/><rect width="2.36" height="1.6" x="0.39" y="2.15"/><circle cx="1.9" cy="1.35" r="0.66"/><path d="M 2.74,2.48 4.89,1"/><path d="m 2.77,3.27 2.16,1.4"/><path d="m 4.46,1.9 c 0.23,0.65 0.28,1.3 0.03,1.9"/><path d="M 4.24,2.4 4.36,1.7 4.9,2.18"/><path d="M 4.23,3.2 4.41,3.9 5,3.4"/>`;
            const mainBtn = this.addBtn(`${SVG_HEADER}0.6 0.5 4.5 4.5'><g ${SVG_LINE}><path d="M 1.9,4.53 1.4,4.24 1.51,3.73 C 1.43,3.65 1.36,3.56 1.3,3.46 L 0.77,3.43 0.62,2.87 1.07,2.58 C 1.07,2.47 1.08,2.36 1.11,2.25 L 0.76,1.84 1.05,1.34 1.56,1.45 C 1.64,1.37 1.73,1.3 1.83,1.24 L 1.86,0.71 2.42,0.56 2.71,1 c 0.11,0 0.23,0.02 0.34,0.04 L 3.45,0.7 3.95,0.99 3.84,1.5 c 0.08,0.08 0.15,0.17 0.21,0.27 l 0.53,0.03 0.15,0.56 -0.44,0.3 c 0,0.11 -0.02,0.23 -0.04,0.34 L 4.59,3.37 4.3,3.88 3.79,3.77 C 3.7,3.85 3.61,3.91 3.52,3.97 L 3.48,4.5 2.92,4.65 2.63,4.21 C 2.53,4.2 2.41,4.19 2.3,4.16 Z"/><circle cx="2.67" cy="2.62" r="1"/></g></svg>`);
            const crossppl1Btn = this.addBtn(`${SVG_HEADER}0.6 0.5 4.5 4.5'><g ${SVG_LINE}><path d="M 1.22,1.68 V 3.764 L 2.83,4.644 4.472,3.715 V 1.715 L 2.81,0.8 Z M 1.55,1.86 2.86,2.61 V 4.31 M 2.86,2.61 4.16,1.86"/></g></svg>`);
            const crossppl2Btn = this.addBtn(`${SVG_HEADER}0.6 0.5 4.5 4.5'><g ${SVG_LINE}><circle cx="2.69" cy="2.6" r="2"/><path d="m 0.69,2.6 c 0.002,1.28 4,1.28 4,0.014"/><path style="stroke-dasharray:0.2, 0.2;" d="M 0.68,2.6 C 0.71,1.45 4.68,1.5 4.7,2.63"/></g></svg>`);
            const crossppl3Btn = this.addBtn(`${SVG_HEADER}0.6 0.5 4.5 4.5'><g style="fill:none;stroke:#FFF;stroke-width:0.4;"><path transform="scale(0.6) translate(1.8,1.8)" d="M 1.22,1.68 V 3.764 L 2.83,4.644 4.472,3.715 V 1.715 L 2.81,0.8 Z M 1.55,1.86 2.86,2.61 V 4.31 M 2.86,2.61 4.16,1.86"/></g></svg>`);
            const crossppl4Btn = this.addBtn(`${SVG_HEADER}0.6 0.5 4.5 4.5'><g ${SVG_LINE}><path d="M 1.19,3.49 2.85,4.45 4.42,3.55 V 1.57 L 2.77,0.63 1.19,1.52 Z M 2,1.12 3.45,1.05 4.4,2.62 3.65,3.94 1.98,3.92 1.23,2.74 1.95,1.1"/></g></svg>`);
            const crosshairBtn = this.addBtn(`${SVG_HEADER}0.6 0.5 4.5 4.5'><g ${SVG_LINE}><path d="m 2.62,1 v 3.37 M 1.56,4 3.56,1.47 M 0.9,2.7 H 4.23"/></g></svg>`);
            const stereoBtn = this.addBtn(`${SVG_HEADER}0.5 0.3 4.5 4.5'><g ${SVG_LINE}><path d="M 0.563,2.636 C 2.33,1 3.24,1.22 4.74,2.76 2.99,3.96 1.676,3.73 0.564,2.637 Z"/><circle cx="2.6" cy="2.5" r="0.9"/><circle cx="2.6" cy="2.5" r="0.54"/></g></svg>`);
            const settingBtn = this.addBtn(`${SVG_HEADER}0.5 0.3 4.5 4.5'><g id="g1" ${SVG_LINE}><path d="M 1.3,3.4 V 4.8 M 1.77,3.4 V 4.8 M 1.3,0.4 V 2.8 M 1.77,0.4 V 2.8"/><rect width="1.7" height="0.4" x="0.63" y="3.04"/></g><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#g1" transform="rotate(180,2.65,2.59)"/></svg>`);
            const slicecfg1Btn = this.addBtn(`${SVG_HEADER}0 0 5 5'><g ${SVG_LINE}>${SVG_RETINA}<rect width="1.2" height="1.2" x="0.6" y="3.6"/><rect width="1.2" height="1.2" x="3.5" y="3.6"/><rect width="1.2" height="1.2" x="3.5" y="0.5"/></g></svg>`);
            const slicecfg2Btn = this.addBtn(`${SVG_HEADER}0 0 5 5'><g ${SVG_LINE}>${SVG_RETINA}<rect width="1.7" height="1.7" x="0.6" y="2.8"/><rect width="1.7" height="1.7" x="2.9" y="2.8"/><rect width="1.7" height="1.7" x="2.9" y="0.5"/></g></svg>`);
            const slicecfg3Btn = this.addBtn(`${SVG_HEADER}0 0 5 5'><g ${SVG_LINE}>${SVG_RETINA}</g></svg>`);
            const slicecfg4Btn = this.addBtn(`${SVG_HEADER}0 0 5 5'><g ${SVG_LINE}><rect width="2" height="2" x="0.6" y="2.5"/><rect width="2" height="2" x="2.6" y="2.5"/><rect width="2" height="2" x="2.6" y="0.5"/></g></svg>`);
            const slicecfg5Btn = this.addBtn(`${SVG_HEADER}0 0 5 5'><g ${SVG_LINE}><rect width="4" height="4" x="0.6" y="0.6"/><text x="1.5" y="3.5" stroke="#0F0" style="font-size:3px">Y</text></g></svg>`);
            const slicecfg6Btn = this.addBtn(`${SVG_HEADER}0 0 5 5'><g ${SVG_LINE}><rect width="4" height="4" x="0.6" y="0.6"/><text x="1.5" y="3.5" stroke="#00F" style="font-size:3px">Z</text></g></svg>`);
            const slicecfg7Btn = this.addBtn(`${SVG_HEADER}0 0 5 5'><g ${SVG_LINE}>${SVG_RETINA}<rect width="1" height="1" x="0.6" y="3"/><rect width="1" height="1" x="1.6" y="3"/><rect width="1" height="1" x="2.6" y="3"/><rect width="1" height="1" x="3.6" y="3"/><text x="1.5" y="3.5" stroke="#0F0" style="font-size:3px">Y</text></g></svg>`);
            const slicecfg8Btn = this.addBtn(`${SVG_HEADER}0 0 5 5'><g ${SVG_LINE}>${SVG_RETINA}<rect width="1" height="1" x="0.6" y="3"/><rect width="1" height="1" x="1.6" y="3"/><rect width="1" height="1" x="2.6" y="3"/><rect width="1" height="1" x="3.6" y="3"/><text x="1.5" y="3.5" stroke="#00F" style="font-size:3px">Z</text></g></svg>`);
            const layerpBtn = this.addBtn(`${SVG_HEADER}0 0 5 5'><g ${SVG_LINE}><rect id="r" width="1.8" height="2.3" x="2.7" y="2.94" transform="matrix(0.95,-0.3,0,1,0,0)"/><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#r" id="u" transform="translate(-0.6,-0.4)"/><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#u" transform="translate(-0.6,-0.4)"/>${SVG_PLUS}</g></svg>`);
            const layermBtn = this.addBtn(`${SVG_HEADER}0 0 5 5'><g ${SVG_LINE}><rect id="r" width="1.8" height="2.3" x="2.7" y="2.94" transform="matrix(0.95,-0.3,0,1,0,0)"/><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#r" id="u" transform="translate(-0.6,-0.4)"/><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#u" transform="translate(-0.6,-0.4)"/>${SVG_MINUS}</g></svg>`);
            const opacitypBtn = this.addBtn(`${SVG_CHECKER}<text x="1.5" y="3.5" style="font-size:3px;stroke:#F00;stroke-width:0.25">+</text></g></svg>`);
            const opacitymBtn = this.addBtn(`${SVG_CHECKER}<text x="2" y="3.5" style="font-size:3px;stroke:#F00;stroke-width:0.25">-</text></g></svg>`);
            const fovpBtn = this.addBtn(`${SVG_CAM}${SVG_PLUS}</g></svg>`);
            const fovmBtn = this.addBtn(`${SVG_CAM}${SVG_MINUS}</g></svg>`);
            const respBtn = this.addBtn(`${SVG_HEADER}0 0 5 5'><g ${SVG_LINE}><rect width="4.6" height="2.93" x="0.33" y="0.9"/><path d="M 2.44,3.844 1.62,4.78 H 3.77 L 3.03,3.84"/><circle cx="1.86" cy="2.4" r="1.05"/><rect width="1.63" height="0.48" x="3.38" y="1.7" transform="rotate(12.5)"/><path d="M 1.075,1.825H 1.6 V 2.1 H 1.9 V 2.5 H 2.3 V 3.07 H 2.5"/>${SVG_PLUS}</g></svg>`);
            const resmBtn = this.addBtn(`${SVG_HEADER}0 0 5 5'><g ${SVG_LINE}><rect width="4.6" height="2.93" x="0.33" y="0.9"/><path d="M 2.44,3.844 1.62,4.78 H 3.77 L 3.03,3.84"/><circle cx="1.86" cy="2.4" r="1.05"/><rect width="1.63" height="0.48" x="3.38" y="1.7" transform="rotate(12.5)"/><path d="M 1.075,1.825H 1.6 V 2.1 H 1.9 V 2.5 H 2.3 V 3.07 H 2.5"/>${SVG_MINUS}</g></svg>`);
            const eyeModeCrossBtn = this.addBtn(`${SVG_HEADER}0.5 0.3 4.5 4.5'><g ${SVG_LINE}><circle cx="2" cy="4" r="0.3"/><circle cx="3.2" cy="4" r="0.3"/><path d="M 2,3.4 3,1 M 3.2,3.4 2.2,1"/></g></svg>`);
            const eyeModeParaBtn = this.addBtn(`${SVG_HEADER}0.5 0.3 4.5 4.5'><g ${SVG_LINE}><circle cx="2" cy="4" r="0.3"/><circle cx="3.2" cy="4" r="0.3"/><path d="M 2,3.4 1.8,1 M 3.2,3.4 3.4,1"/></g></svg>`);
            eyeModeCrossBtn.style.position = "absolute";
            eyeModeParaBtn.style.position = "absolute";
            eyeModeCrossBtn.style.left = "-32px";
            eyeModeParaBtn.style.left = "-32px";
            const mainBar = this.createToggleDiv(mainBtn, "inline-block");
            let drag = NaN;
            let startPos;
            let enableKeycode;
            mainBtn.addEventListener('mousedown', (e) => {
                drag = e.clientY;
                startPos = Number(this.dom.style.top.replace("vh", "")) / 100 * window.innerHeight;
            });
            mainBtn.addEventListener('mouseenter', () => {
                if (enableKeycode != retinaCtrl.keyConfig.enable) {
                    this.refresh({ "enableKeyCode": retinaCtrl.keyConfig.enable });
                }
            });
            mainBtn.addEventListener('mousemove', (e) => {
                if (!drag)
                    return;
                const currPos = startPos + e.clientY - drag;
                this.dom.style.top = currPos / window.innerHeight * 100 + "vh";
            });
            mainBtn.addEventListener('mouseup', () => { drag = NaN; });
            mainBtn.addEventListener('mouseout', () => { drag = NaN; });
            this.dom.appendChild(mainBar);
            mainBar.appendChild(eyeModeCrossBtn);
            mainBar.appendChild(eyeModeParaBtn);
            eyeModeCrossBtn.addEventListener('mousedown', () => retinaCtrl.guiMouseOperation = "negEyesGap");
            eyeModeParaBtn.addEventListener('mousedown', () => retinaCtrl.guiMouseOperation = "negEyesGap");
            stereoBtn.addEventListener('click', () => retinaCtrl.toggleStereo());
            mainBar.appendChild(stereoBtn);
            const slicecfgPlaceholder = document.createElement("span");
            slicecfgPlaceholder.className = "slicecfg";
            mainBar.appendChild(slicecfgPlaceholder);
            let slicecfgPlaceholderBtn = slicecfg1Btn.cloneNode(true);
            slicecfgPlaceholder.appendChild(slicecfgPlaceholderBtn);
            const slicecfgBar = this.createDropBox(slicecfgPlaceholderBtn, 0, 2);
            slicecfgPlaceholder.appendChild(slicecfgBar);
            slicecfgBar.appendChild(slicecfg1Btn);
            slicecfgBar.appendChild(slicecfg2Btn);
            slicecfgBar.appendChild(slicecfg3Btn);
            slicecfgBar.appendChild(slicecfg4Btn);
            slicecfgBar.appendChild(slicecfg5Btn);
            slicecfgBar.appendChild(slicecfg6Btn);
            slicecfgBar.appendChild(slicecfg7Btn);
            slicecfgBar.appendChild(slicecfg8Btn);
            const slicecfgBtnFn = function () {
                slicecfgPlaceholderBtn.style.backgroundImage = this.style.backgroundImage;
                retinaCtrl.toggleSectionConfig(this.name);
            };
            slicecfg1Btn.addEventListener('click', slicecfgBtnFn);
            slicecfg1Btn.name = "retina+sections";
            slicecfg2Btn.addEventListener('click', slicecfgBtnFn);
            slicecfg2Btn.name = "retina+bigsections";
            slicecfg3Btn.addEventListener('click', slicecfgBtnFn);
            slicecfg3Btn.name = "retina";
            slicecfg4Btn.addEventListener('click', slicecfgBtnFn);
            slicecfg4Btn.name = "sections";
            slicecfg5Btn.addEventListener('click', slicecfgBtnFn);
            slicecfg5Btn.name = "zsection";
            slicecfg6Btn.addEventListener('click', slicecfgBtnFn);
            slicecfg6Btn.name = "ysection";
            slicecfg7Btn.addEventListener('click', slicecfgBtnFn);
            slicecfg7Btn.name = "retina+zslices";
            slicecfg8Btn.addEventListener('click', slicecfgBtnFn);
            slicecfg8Btn.name = "retina+yslices";
            const settingBarPlaceHolder = document.createElement("span");
            settingBarPlaceHolder.appendChild(settingBtn);
            const settingBar = this.createDropBox(settingBtn, 2, 2);
            settingBarPlaceHolder.className = "settingbar";
            settingBarPlaceHolder.appendChild(settingBar);
            mainBar.appendChild(settingBarPlaceHolder);
            settingBar.appendChild(layerpBtn);
            layerpBtn.addEventListener('mousedown', () => retinaCtrl.guiMouseOperation = "layerpBtn");
            settingBar.appendChild(layermBtn);
            layermBtn.addEventListener('mousedown', () => retinaCtrl.guiMouseOperation = "layermBtn");
            settingBar.appendChild(opacitypBtn);
            opacitypBtn.addEventListener('mousedown', () => retinaCtrl.guiMouseOperation = "opacitypBtn");
            settingBar.appendChild(opacitymBtn);
            opacitymBtn.addEventListener('mousedown', () => retinaCtrl.guiMouseOperation = "opacitymBtn");
            settingBar.appendChild(fovpBtn);
            fovpBtn.addEventListener('mousedown', () => retinaCtrl.guiMouseOperation = "fovpBtn");
            settingBar.appendChild(fovmBtn);
            fovmBtn.addEventListener('mousedown', () => retinaCtrl.guiMouseOperation = "fovmBtn");
            settingBar.appendChild(respBtn);
            respBtn.addEventListener('mousedown', () => retinaCtrl.guiMouseOperation = "respBtn");
            settingBar.appendChild(resmBtn);
            resmBtn.addEventListener('mousedown', () => retinaCtrl.guiMouseOperation = "resmBtn");
            mainBar.appendChild(crosshairBtn);
            crosshairBtn.addEventListener("click", () => retinaCtrl.toggleCrosshair());
            const crosspplPlaceholder = document.createElement("span");
            mainBar.appendChild(crosspplPlaceholder);
            let crosspplPlaceholderBtn = crossppl1Btn.cloneNode(true);
            crosspplPlaceholder.appendChild(crosspplPlaceholderBtn);
            crosspplPlaceholder.className = "crossppl";
            const crosspplBar = this.createDropBox(crosspplPlaceholderBtn, 4);
            crosspplPlaceholder.appendChild(crosspplBar);
            const crosspplBtnFn = function () {
                crosspplPlaceholderBtn.style.backgroundImage = this.style.backgroundImage;
                retinaCtrl.toggleRetinaAlpha(Number(this.name));
            };
            crosspplBar.appendChild(crossppl1Btn);
            crossppl1Btn.addEventListener('click', crosspplBtnFn);
            crossppl1Btn.name = "0";
            crosspplBar.appendChild(crossppl2Btn);
            crossppl2Btn.addEventListener('click', crosspplBtnFn);
            crossppl2Btn.name = "1";
            crosspplBar.appendChild(crossppl3Btn);
            crossppl3Btn.addEventListener('click', crosspplBtnFn);
            crossppl3Btn.name = "2";
            crosspplBar.appendChild(crossppl4Btn);
            crossppl4Btn.addEventListener('click', crosspplBtnFn);
            crossppl4Btn.name = "3";
            this.refresh = (param) => {
                let crosspplBtn;
                switch (param["toggleRetinaAlpha"]) {
                    case 0:
                        crosspplBtn = crossppl1Btn;
                        break;
                    case 1:
                        crosspplBtn = crossppl2Btn;
                        break;
                    case 2:
                        crosspplBtn = crossppl3Btn;
                        break;
                    case 3:
                        crosspplBtn = crossppl4Btn;
                        break;
                }
                switch (param["toggleStereo"]) {
                    case true:
                        param["negEyesGap"] = retinaCtrl.retinaEyeOffset > 0 || retinaCtrl.sectionEyeOffset > 0;
                        break;
                    case false:
                        eyeModeCrossBtn.style.display = "none";
                        eyeModeParaBtn.style.display = "none";
                        break;
                }
                switch (param["negEyesGap"]) {
                    case false:
                        eyeModeCrossBtn.style.display = "none";
                        eyeModeParaBtn.style.display = "";
                        break;
                    case true:
                        eyeModeCrossBtn.style.display = "";
                        eyeModeParaBtn.style.display = "none";
                        break;
                }
                if (crosspplBtn)
                    crosspplPlaceholderBtn.style.backgroundImage = crosspplBtn.style.backgroundImage;
                switch (param["toggleSectionConfig"]) {
                    case "retina+sections":
                        slicecfg1Btn.click();
                        break;
                    case "retina+bigsections":
                        slicecfg2Btn.click();
                        break;
                    case "retina":
                        slicecfg3Btn.click();
                        break;
                    case "sections":
                        slicecfg4Btn.click();
                        break;
                    case "zsection":
                        slicecfg5Btn.click();
                        break;
                    case "ysection":
                        slicecfg6Btn.click();
                        break;
                    case "retina+zslices":
                        slicecfg7Btn.click();
                        break;
                    case "retina+yslices":
                        slicecfg8Btn.click();
                        break;
                }
                if (param["enableKeyCode"] !== undefined) {
                    enableKeycode = param["enableKeyCode"];
                    const BtnHint = {
                        "zh": {
                            "mouseBtn0": "鼠标左键",
                            "mouseBtn1": "鼠标中键",
                            "mouseBtn2": "鼠标右键",
                            "left": "左",
                            "right": "右",
                            "digit": "大键盘数字",
                            "mainBtn": "显示/隐藏体素渲染设置",
                            "crosspplPlaceholderBtn": "显示/隐藏选择截面形状",
                            "crossppl1Btn": "截面形状：默认立方体",
                            "crossppl2Btn": "截面形状：球",
                            "crossppl3Btn": "截面形状：小立方体",
                            "crossppl4Btn": "截面形状：平面",
                            "crossppl2BtnDesc": "拖动以改变球半径(垂直)\n和羽化量(水平)",
                            "crossppl3BtnDesc": "拖动以改变立方体大小(垂直)\n和剩余部分透明度(水平)",
                            "crossppl4BtnDesc": "拖动以改变截平面方向",
                            "stereoBtn": "切换裸眼3D模式",
                            "eyeModeCrossBtn": "交叉眼",
                            "eyeModeParaBtn": "平行眼",
                            "slicecfgPlaceholderBtn": "显示/隐藏选择视图配置",
                            "slicecfg1Btn": "视图配置：体素+三个截面",
                            "slicecfg2Btn": "视图配置：体素+三个大截面",
                            "slicecfg3Btn": "视图配置：体素",
                            "slicecfg4Btn": "视图配置：三个截面",
                            "slicecfg5Btn": "视图配置：Y轴截面",
                            "slicecfg6Btn": "视图配置：Z轴截面",
                            "slicecfg7Btn": "视图配置：体素+平行Y轴截面",
                            "slicecfg8Btn": "视图配置：体素+平行Z轴截面",
                            "layerpBtn": "增加体素渲染层数",
                            "layermBtn": "减少体素渲染层数",
                            "opacitypBtn": "增加体素不透明度",
                            "opacitymBtn": "减少体素不透明度",
                            "fovpBtn": "增大体素显示视场角",
                            "fovmBtn": "降低体素显示视场角",
                            "respBtn": "增大每层体素分辨率",
                            "resmBtn": "降低每层体素分辨率",
                            "settingBtn": "显示/隐藏体素渲染参数调节",
                            "crosshairBtn": "显示/隐藏十字准心",
                        },
                        "en": {
                            "mouseBtn0": "Left Mouse Button",
                            "mouseBtn1": "Middle Mouse Button",
                            "mouseBtn2": "Right Mouse Button",
                            "eyeModeCrossBtn": "Cross View",
                            "eyeModeParaBtn": "Parallel View",
                            "left": "Left",
                            "right": "Right",
                            "digit": "Digit ",
                            "mainBtn": "Show / Hide Voxel Render Settings",
                            "crosspplPlaceholderBtn": "Show / Hide Choose CrossSection Shape",
                            "crossppl1Btn": "CrossSection Shape: Default Cube",
                            "crossppl2Btn": "CrossSection Shape: Ball",
                            "crossppl3Btn": "CrossSection Shape: Small Cube",
                            "crossppl4Btn": "CrossSection Shape: Plane",
                            "crossppl2BtnDesc": " Drag to Change Ball Radius(Vertically)\nand Feathering Amount(Horizontally)",
                            "crossppl3BtnDesc": " Drag to Change Cube Size(Vertically)\nand Remained Opacity(Horizontally)",
                            "crossppl4BtnDesc": " Drag to Change Section Plane's Orientation",
                            "stereoBtn": "Toggle Naked Eye Stereo Mode",
                            "slicecfgPlaceholderBtn": "Show / Hide Choose View Configuration",
                            "slicecfg1Btn": "View Configuration: Voxel + Sections",
                            "slicecfg2Btn": "View Configuration: Voxel + Big Sections",
                            "slicecfg3Btn": "View Configuration: Voxel Only",
                            "slicecfg4Btn": "View Configuration: 3 Sections",
                            "slicecfg5Btn": "View Configuration: Y axis Section",
                            "slicecfg6Btn": "View Configuration: Z axis Section",
                            "slicecfg7Btn": "View Configuration: Voxel + Y axis Parallel Sections",
                            "slicecfg8Btn": "View Configuration: Voxel + Z axis Parallel Sections",
                            "layerpBtn": "Increase Voxel Layers",
                            "layermBtn": "Decrease Voxel Layers",
                            "opacitypBtn": "Increase Voxel Opacity",
                            "opacitymBtn": "Decrease Voxel Opacity",
                            "fovpBtn": "Increase Field Of Voxel View",
                            "fovmBtn": "Decrease Voxel Field Of Voxel View",
                            "respBtn": "Increase Resolution Per Voxel Layer",
                            "resmBtn": "Decrease Resolution Per Voxel Layer",
                            "settingBtn": "Show / Hide Voxel Render Params",
                            "crosshairBtn": "Toggle Crosshair",
                        },
                    };
                    let params = new URLSearchParams(window.location.search.slice(1));
                    let tr = BtnHint[this.lang ?? params.get("lang") ?? (navigator.languages.join(",").includes("zh") ? "zh" : "en")];
                    const keyName = (cfg, config) => `\n(${retinaCtrl.keyConfig.enable ? retinaCtrl.keyConfig.enable.replace("Key", "").replace("Left", tr["left"]).replace("Right", tr["right"]).replace("Digit", tr["digit"]) + " + " : ""}${(config ?? retinaCtrl.keyConfig)[cfg].replace(/(Key)|(Left)|(Right)|(\.)/g, "").replace("Digit", tr["digit"])})`;
                    mainBtn.title = tr["mainBtn"];
                    crosspplPlaceholderBtn.title = tr["crosspplPlaceholderBtn"];
                    const getCrosspplBtnTitle = (btnName, noDragDesc) => tr[btnName] + keyName("toggleRetinaAlpha") + (!noDragDesc ? "\n----" + keyName("", { "": "" }).replace(/[\(\})]/g, "") + tr["mouseBtn" + retinaCtrl.retinaAlphaMouseButton] + tr[btnName + "Desc"] : "");
                    crossppl1Btn.title = getCrosspplBtnTitle("crossppl1Btn", true);
                    crossppl2Btn.title = getCrosspplBtnTitle("crossppl2Btn");
                    crossppl3Btn.title = getCrosspplBtnTitle("crossppl3Btn");
                    crossppl4Btn.title = getCrosspplBtnTitle("crossppl4Btn");
                    stereoBtn.title = tr["stereoBtn"] + keyName("toggle3D");
                    eyeModeCrossBtn.title = tr["eyeModeCrossBtn"] + keyName("negEyesGap");
                    eyeModeParaBtn.title = tr["eyeModeParaBtn"] + keyName("negEyesGap");
                    slicecfgPlaceholderBtn.title = tr["slicecfgPlaceholderBtn"];
                    slicecfg1Btn.title = tr["slicecfg1Btn"] + keyName("retina+sections", retinaCtrl.keyConfig.sectionConfigs);
                    slicecfg2Btn.title = tr["slicecfg2Btn"] + keyName("retina+bigsections", retinaCtrl.keyConfig.sectionConfigs);
                    slicecfg3Btn.title = tr["slicecfg3Btn"] + keyName("retina", retinaCtrl.keyConfig.sectionConfigs);
                    slicecfg4Btn.title = tr["slicecfg4Btn"] + keyName("sections", retinaCtrl.keyConfig.sectionConfigs);
                    slicecfg5Btn.title = tr["slicecfg5Btn"] + keyName("zsection", retinaCtrl.keyConfig.sectionConfigs);
                    slicecfg6Btn.title = tr["slicecfg6Btn"] + keyName("ysection", retinaCtrl.keyConfig.sectionConfigs);
                    slicecfg7Btn.title = tr["slicecfg7Btn"] + keyName("retina+zslices", retinaCtrl.keyConfig.sectionConfigs);
                    slicecfg8Btn.title = tr["slicecfg8Btn"] + keyName("retina+yslices", retinaCtrl.keyConfig.sectionConfigs);
                    layerpBtn.title = tr["layerpBtn"] + keyName("addLayer");
                    layermBtn.title = tr["layermBtn"] + keyName("subLayer");
                    opacitypBtn.title = tr["opacitypBtn"] + keyName("addOpacity");
                    opacitymBtn.title = tr["opacitymBtn"] + keyName("subOpacity");
                    fovpBtn.title = tr["fovpBtn"] + keyName("addFov");
                    fovmBtn.title = tr["fovmBtn"] + keyName("subFov");
                    respBtn.title = tr["respBtn"] + keyName("addRetinaResolution");
                    resmBtn.title = tr["resmBtn"] + keyName("subRetinaResolution");
                    settingBtn.title = tr["settingBtn"];
                    crosshairBtn.title = tr["crosshairBtn"] + keyName("toggleCrosshair");
                }
            };
            const css = document.createElement("style");
            css.appendChild(document.createTextNode(`
        button.retina-ctrl-gui{
            background: #999;
        }
        .slicecfg button.retina-ctrl-gui{
            background: #B77;
        }
        .settingbar button.retina-ctrl-gui{
            background: #7B7;
        }
        .crossppl button.retina-ctrl-gui{
            background: #BB7;
        }
        button.retina-ctrl-gui[title]:hover::after{
            white-space: pre-line; width: max-content;
            content:attr(title);position:absolute;bottom:100%;right:0%; font-size:1em;z-index:100;background:#000;color:#FFF; padding:0;margin:0;
        }
        div.retina-ctrl-gui button.retina-ctrl-gui[title]:hover::after{
            bottom:calc(100% + ${this.iconSize}px);
        }
        `));
            this.dom.appendChild(mainBtn);
            this.dom.appendChild(css);
            this.refresh({ "negEyesGap": retinaCtrl.retinaEyeOffset > 0 || retinaCtrl.sectionEyeOffset > 0 });
        }
        addBtn(svgIcon) {
            const btn = document.createElement("button");
            btn.className = "retina-ctrl-gui";
            btn.innerHTML = "&nbsp;";
            btn.style.width = this.iconSize + "px";
            btn.style.height = this.iconSize + "px";
            btn.style.borderRadius = this.iconSize * 0.25 + "px";
            btn.style.backgroundImage = `url('data:image/svg+xml,${escape(svgIcon)}')`;
            const cancelFn = () => this.controller.guiMouseOperation = "";
            btn.addEventListener('mouseup', cancelFn);
            btn.addEventListener('mouseout', cancelFn);
            return btn;
        }
    }

    var ctrl = /*#__PURE__*/Object.freeze({
        __proto__: null,
        ControllerRegistry: ControllerRegistry,
        FreeFlyController: FreeFlyController,
        KeepUpController: KeepUpController,
        get KeyState () { return KeyState; },
        RetinaController: RetinaController,
        RetinaCtrlGui: RetinaCtrlGui,
        TrackBallController: TrackBallController,
        VoxelViewerController: VoxelViewerController,
        get sliceconfig () { return sliceconfig; }
    });

    class App {
        canvas;
        renderer;
        scene;
        camera;
        controllerRegistry;
        retinaController;
        onresize;
        _onFrame;
        _running = false;
        _autoResize = false;
        _resizeHandler;
        enableAutoResize() {
            if (this._autoResize)
                return;
            this._autoResize = true;
            this.canvas.style.width = "100%";
            this.canvas.style.height = "100%";
            this._resizeHandler = () => {
                const width = window.innerWidth * window.devicePixelRatio;
                const height = window.innerHeight * window.devicePixelRatio;
                if (this.onresize)
                    this.onresize({ width, height });
                this.renderer.setSize({ width, height });
            };
            this._resizeHandler();
            window.addEventListener("resize", this._resizeHandler);
        }
        disableAutoResize() {
            if (!this._autoResize || !this._resizeHandler)
                return;
            window.removeEventListener("resize", this._resizeHandler);
            this._autoResize = false;
            this._resizeHandler = undefined;
        }
        constructor(canvas, renderer, scene, camera, controllerRegistry) {
            this.canvas = canvas;
            this.renderer = renderer;
            this.scene = scene;
            this.camera = camera;
            this.controllerRegistry = controllerRegistry;
        }
        static async create(opts) {
            const renderer = await new Renderer(opts.canvas, opts.renderConfig).init();
            const scene = opts.scene ?? new Scene();
            const camera = opts.camera ?? new PerspectiveCamera();
            scene.add(camera);
            const controls = opts.controls ?? [new RetinaController(renderer.core)];
            const controllerRegistry = new ControllerRegistry(opts.canvas, controls, opts.controllerConfig);
            const app = new App(opts.canvas, renderer, scene, camera, controllerRegistry);
            if (opts.autoSetSize !== false) {
                app.enableAutoResize();
            }
            if (!opts.controls)
                app.retinaController = controls[0];
            return app;
        }
        run(onFrame) {
            this._onFrame = onFrame;
            this._running = true;
            const frame = () => {
                if (!this._running)
                    return;
                this.controllerRegistry.update();
                this._onFrame?.();
                this.renderer.render(this.scene, this.camera);
                requestAnimationFrame(frame);
            };
            frame();
        }
        stop() {
            this._running = false;
        }
    }

    var four = /*#__PURE__*/Object.freeze({
        __proto__: null,
        AmbientLight: AmbientLight,
        App: App,
        BasicMaterial: BasicMaterial,
        CWMeshGeometry: CWMeshGeometry,
        CheckerTexture: CheckerTexture,
        ColorMixer: ColorMixer,
        ColorUniformValue: ColorUniformValue,
        ConvexHullGeometry: ConvexHullGeometry,
        CubeGeometry: CubeGeometry,
        DirectionalLight: DirectionalLight,
        DitorusGeometry: DitorusGeometry,
        DuocylinderGeometry: DuocylinderGeometry,
        FloatUniformValue: FloatUniformValue,
        Geometry: Geometry,
        GlomeGeometry: GlomeGeometry,
        GridTexture: GridTexture,
        LambertMaterial: LambertMaterial,
        Light: Light,
        Material: Material$1,
        MaterialNode: MaterialNode,
        Mesh: Mesh,
        NoiseTexture: NoiseTexture,
        NoiseWGSLHeader: NoiseWGSLHeader,
        Object: Object$1,
        OrthographicCamera: OrthographicCamera,
        PerspectiveCamera: PerspectiveCamera,
        PhongMaterial: PhongMaterial,
        PointLight: PointLight,
        Renderer: Renderer,
        Scene: Scene,
        SimpleSkyBox: SimpleSkyBox,
        SkyBox: SkyBox,
        SpherinderSideGeometry: SpherinderSideGeometry,
        SpheritorusGeometry: SpheritorusGeometry,
        SpotLight: SpotLight,
        TesseractGeometry: TesseractGeometry,
        TigerGeometry: TigerGeometry,
        TorisphereGeometry: TorisphereGeometry,
        TransformUniformValue: TransformUniformValue,
        UVWVec4Input: UVWVec4Input,
        Vec4TransformNode: Vec4TransformNode,
        Vec4UniformValue: Vec4UniformValue,
        WgslTexture: WgslTexture,
        WireFrameConvexPolytope: WireFrameConvexPolytope,
        WireFrameScene: WireFrameScene,
        WireFrameTesseractoid: WireFrameTesseractoid,
        WorldCoordVec4Input: WorldCoordVec4Input
    });

    class Matrix {
        elem;
        row;
        col;
        length;
        constructor(r, c) {
            c = c ?? r;
            this.row = r;
            this.col = c;
            this.length = r * c;
            this.elem = new Float32Array(this.length);
        }
        static diag(...arr) {
            const n = arr.length;
            const nplus1 = n + 1;
            const m = new Matrix(n);
            for (let i = 0; i < n; i += nplus1) {
                m.elem[i] = arr[i];
            }
            return m;
        }
        diag() {
            const arr = [];
            let cplus1 = this.col + 1;
            const r_c = Math.min(this.row, this.col);
            for (let i = 0, l = 0; l < r_c && i < this.length; i += cplus1) {
                arr.push(this.elem[i]);
            }
            return arr;
        }
        static fromArray(arr) {
            let m = new Matrix(arr.length, arr[0] ? arr[0].length : 0);
            m.elem.set(arr.flat());
            return m;
        }
        static fromMat3(mat3) {
            let m = new Matrix(3);
            m.elem.set(mat3.elem);
            return m;
        }
        static fromMat4(mat4) {
            let m = new Matrix(4);
            m.elem.set(mat4.elem);
            return m;
        }
        static fromVec4(vec4) {
            let m = new Matrix(1, 4);
            m.elem.set([vec4.x, vec4.y, vec4.z, vec4.w]);
            return m;
        }
        static fromVec3(vec3) {
            let m = new Matrix(1, 3);
            m.elem.set([vec3.x, vec3.y, vec3.z]);
            return m;
        }
        static fill(value, r, c) {
            let m = new Matrix(r, c);
            m.elem.fill(value);
            return m;
        }
        static id(r, c) {
            c = c ?? r;
            let m = new Matrix(r, c);
            let cplus1 = c + 1;
            const r_c = Math.min(r, c);
            for (let i = 0, l = 0; l < r_c && i < m.length; i += cplus1) {
                m.elem[i] = 1.0;
            }
            return m;
        }
        setElements(...args) {
            this.elem.set(args);
            return this;
        }
        copy(src) {
            if (src.row !== this.row || src.col !== this.col)
                throw "Matrix dimension disagree";
            this.elem.set(src.elem);
            return this;
        }
        clone() {
            return new Matrix(this.row, this.col).copy(this);
        }
        toMat3() {
            if (this.row !== 3 || this.col !== 3)
                throw "Matrix dimension must be 3x3";
            return new Mat3(...this.elem);
        }
        toMat4() {
            if (this.row !== 4 || this.col !== 4)
                throw "Matrix dimension must be 4x4";
            return new Mat4(...this.elem);
        }
        toVec4() {
            if (this.row === 4 && this.col === 1)
                return new Vec4(...this.elem);
            if (this.row === 1 && this.col === 4)
                return new Vec4(...this.elem);
            throw "Matrix dimension must be 1x4 or 4x1";
        }
        toVec3() {
            if (this.row === 3 && this.col === 1)
                return new Vec3(...this.elem);
            if (this.row === 1 && this.col === 3)
                return new Vec3(...this.elem);
            throw "Matrix dimension must be 1x3 or 3x1";
        }
        to2DArray() {
            let arr = [];
            for (let i = 0, k = 0; i < this.row; i++) {
                arr.push([]);
                for (let j = 0; j < this.col; j++, k++) {
                    arr[i].push(this.elem[k]);
                }
            }
            return arr;
        }
        ts() {
            if (this.col === this.row) {
                for (let i = 0, offI = 0; i < this.row; i++, offI += this.col) {
                    for (let j = i + 1, offJ = offI + this.col; j < this.col; j++, offJ += this.row) {
                        const a = j + offI;
                        const b = i + offJ;
                        let temp = this.elem[a];
                        this.elem[a] = this.elem[b];
                        this.elem[b] = temp;
                    }
                }
            }
            else {
                throw "not implemented yet for non square matrice";
            }
            let temp = this.col;
            this.col = this.row;
            this.row = temp;
            return this;
        }
        adds(m) {
            for (let i = 0, l = m.length; i < l; i++) {
                this.elem[i] += m.elem[i];
            }
            return this;
        }
        addmulfs(m, k) {
            for (let i = 0, l = m.length; i < l; i++) {
                this.elem[i] += m.elem[i] * k;
            }
            return this;
        }
        subs(m) {
            for (let i = 0, l = m.length; i < l; i++) {
                this.elem[i] -= m.elem[i];
            }
            return this;
        }
        mulfs(k) {
            for (let i = 0, l = this.length; i < l; i++) {
                this.elem[i] *= k;
            }
            return this;
        }
        mulset(m1, m2) {
            if (m1 === this)
                return this.mulsr(m2);
            if (m2 === this)
                return this.mulsl(m1);
            const r1 = m1.row, r2 = m2.row;
            const c1 = m1.col, c2 = m2.col;
            if (c1 !== r2)
                throw "Inconsist matrices dimension";
            if (this.row !== r1 || this.col !== c2)
                throw "Inconsist destination matrix dimension";
            for (let r = 0, k = 0, offsetR1 = 0; r < r1; r++, offsetR1 += c1) {
                for (let c = 0; c < c2; c++) {
                    let sum = 0;
                    for (let j = 0, offsetR2 = 0; j < r2; j++, offsetR2 += c2) {
                        sum += m1.elem[offsetR1 + j] * m2.elem[offsetR2 + c];
                    }
                    this.elem[k++] = sum;
                }
            }
            return this;
        }
        mul(m) {
            const r1 = this.row, r2 = m.row;
            const c1 = this.col, c2 = m.col;
            if (c1 !== r2)
                throw "Inconsist matrices dimension";
            const R = new Matrix(r1, c2);
            for (let r = 0, k = 0, offsetR1 = 0; r < r1; r++, offsetR1 += c1) {
                for (let c = 0; c < c2; c++) {
                    let sum = 0;
                    for (let j = 0, offsetR2 = 0; j < r2; j++, offsetR2 += c2) {
                        sum += this.elem[offsetR1 + j] * m.elem[offsetR2 + c];
                    }
                    R.elem[k++] = sum;
                }
            }
            return R;
        }
        /// this = this * m
        mulsr(m) {
            const r1 = this.row, r2 = m.row;
            const c1 = this.col, c2 = m.col;
            if (c1 !== r2)
                throw "Inconsist matrices dimension";
            if (this.col !== c2)
                throw "Inconsist destination matrix dimension";
            const arr = new Float32Array(this.length);
            for (let r = 0, k = 0, offsetR1 = 0; r < r1; r++, offsetR1 += c1) {
                for (let c = 0; c < c2; c++) {
                    let sum = 0;
                    for (let j = 0, offsetR2 = 0; j < r2; j++, offsetR2 += c2) {
                        sum += this.elem[offsetR1 + j] * m.elem[offsetR2 + c];
                    }
                    arr[k++] = sum;
                }
            }
            this.elem = arr;
            return this;
        }
        /// this = m * this
        mulsl(m) {
            const r1 = m.row, r2 = this.row;
            const c1 = m.col, c2 = this.col;
            if (c1 !== r2)
                throw "Inconsist matrices dimension";
            if (this.row !== r1)
                throw "Inconsist destination matrix dimension";
            const arr = new Float32Array(this.length);
            for (let r = 0, k = 0, offsetR1 = 0; r < r1; r++, offsetR1 += c1) {
                for (let c = 0; c < c2; c++) {
                    let sum = 0;
                    for (let j = 0, offsetR2 = 0; j < r2; j++, offsetR2 += c2) {
                        sum += m.elem[offsetR1 + j] * this.elem[offsetR2 + c];
                    }
                    arr[k++] = sum;
                }
            }
            this.elem = arr;
            return this;
        }
        norm() {
            let sum = 0;
            for (let i = 0, l = this.length; i < l; i++) {
                sum += this.elem[i] * this.elem[i];
            }
            return Math.sqrt(sum);
        }
        norm1() {
            let sum = 0;
            for (let i = 0, l = this.length; i < l; i++) {
                sum += Math.abs(this.elem[i]);
            }
            return sum;
        }
        norms() {
            return this.divfs(this.norm());
        }
        normSqr() {
            let sum = 0;
            for (let i = 0, l = this.length; i < l; i++) {
                sum += this.elem[i] * this.elem[i];
            }
            return sum;
        }
        divfs(k) {
            k = 1 / k;
            for (let i = 0, l = this.length; i < l; i++) {
                this.elem[i] *= k;
            }
            return this;
        }
        get(r, c) {
            return this.elem[c + this.col * r];
        }
        set(r, c, value) {
            this.elem[c + this.col * r] = value;
            return this;
        }
        setFromSubMatrix(srcMat, rows, cols, srcRowOffset = 0, srcColOffset = 0, dstRowOffset = 0, dstColOffset = 0) {
            const { row, col } = srcMat;
            rows ??= row;
            cols ??= col;
            for (let i = srcRowOffset, srcOffset = srcRowOffset * col, dstOffset = dstRowOffset * this.col; i < srcRowOffset + rows; i++, srcOffset += col, dstOffset += this.col) {
                for (let j = srcColOffset, k = dstColOffset; j < srcColOffset + cols; j++, k++) {
                    this.elem[k + dstOffset] = srcMat.elem[j + srcOffset];
                }
            }
            return this;
        }
        colVector(k) {
            return this.subMatrix(0, k, undefined, 1);
        }
        rowVector(k) {
            return this.subMatrix(k, 0, 1);
        }
        subMatrix(rowOffset, colOffset, row, col) {
            row ??= this.row;
            col ??= this.col;
            const A = new Matrix(row, col);
            for (let i = rowOffset, offset = rowOffset * this.col, k = 0; i < rowOffset + row; i++, offset += this.col) {
                for (let j = colOffset; j < colOffset + col; j++, k++) {
                    A.elem[k] = this.elem[j + offset];
                }
            }
            return A;
        }
        det() {
            if (this.row !== this.col)
                throw "Square matrix expected";
            if (this.row === 1)
                return this.elem[0];
            if (this.row === 2)
                return this.elem[0] * this.elem[3] - this.elem[1] * this.elem[2];
            let det = 0;
            const elem = this.elem;
            const n = this.row - 1;
            const subMat = new Matrix(n);
            for (let i = 0; i < this.col; i++) {
                if (i)
                    subMat.setFromSubMatrix(this, n, i, 1, 0);
                if (i !== n)
                    subMat.setFromSubMatrix(this, n, n - i, 1, i + 1, 0, i);
                det += (i & 1) === 0 ? elem[i] * subMat.det() : -elem[i] * subMat.det();
            }
            return det;
        }
        decomposeQR() {
            const m = this.row;
            const n = this.col;
            const qv = [];
            // temp array
            const z = this.clone();
            let z1;
            for (let k = 0; k < n && k < m - 1; k++) {
                let e = new Matrix(m, 1), x;
                let a;
                z1 = Matrix.id(m, n);
                z1.setFromSubMatrix(z, m - k, n - k, k, k, k, k);
                x = z1.colVector(k);
                a = x.norm();
                if (this.get(k, k) > 0)
                    a = -a;
                for (let i = 0; i < m; i++) {
                    e.elem[i] = (i == k) ? 1 : 0;
                }
                x.addmulfs(e, a);
                e.copy(x);
                const norm = e.norm();
                if (norm > 0) {
                    e.divfs(norm);
                    // qv[k] = I - 2 *e*e^T
                    qv[k] = new Matrix(m);
                    for (let i = 0, kk = 0; i < m; i++) {
                        for (let j = 0; j < m; j++, kk++) {
                            qv[k].elem[kk] = -2 * e.elem[i] * e.elem[j];
                            if (i === j)
                                qv[k].elem[kk] += 1;
                        }
                    }
                    z.mulset(qv[k], z1);
                }
            }
            let Q = qv[0] ?? Matrix.id(m);
            for (let i = 1; i < qv.length; i++) {
                Q.mulsl(qv[i]);
            }
            const R = Q.mul(this);
            Q.ts();
            return { Q, R };
        }
        SVdecompose(iterations = 10) {
            // m = O L O'
            function OLOdecompose(m) {
                const tempMat = m.clone();
                let { Q, R } = tempMat.decomposeQR();
                const qv = Q.clone();
                for (let i = 0; i < iterations; i++) {
                    tempMat.mulset(R, Q);
                    const { Q: Q2, R: R2 } = tempMat.decomposeQR();
                    qv.mulsr(Q2);
                    Q = Q2;
                    R = R2;
                }
                return { O: qv, L: tempMat.clone() };
            }
            const pts = this.clone().ts();
            const ppt = OLOdecompose(this.mul(pts));
            const U = ppt.O;
            for (let i = 0; i < ppt.L.length; i += ppt.L.row + 1) {
                ppt.L.elem[i] = 1 / Math.sqrt(ppt.L.elem[i]);
            }
            const V = ppt.L.mul(U.clone().ts()).mul(this);
            return {
                U, V, L: U.clone().ts().mul(this).mulsr(V.clone().ts())
            };
        }
    }

    /** all properities hold by class Rigid should not be modified
     *  exceptions are position/rotation and (angular)velocity.
     *  pass RigidDescriptor into constructor instead.
     *  */
    class Rigid extends Obj4 {
        material;
        // Caution: Two Rigids cannot share the same RigidGeometry instance
        geometry;
        type;
        mass;
        invMass;
        // inertia is a 6x6 Matrix for angularVelocity -> angularMomentum
        // this is diagonalbMatrix under principal axes coordinates
        inertia = new Bivec();
        invInertia = new Bivec();
        inertiaIsotroy; // whether using scalar inertia
        // only apply to active type object
        sleep = false;
        // for tracing debug
        label;
        velocity = new Vec4();
        angularVelocity = new Bivec();
        force = new Vec4();
        torque = new Bivec();
        acceleration = new Vec4();
        angularAcceleration = new Bivec();
        constructor(param) {
            super();
            if (param.length) {
                this.geometry = new rigid.Union(param);
            }
            else {
                let option = param;
                this.geometry = option.geometry;
                this.mass = isFinite(option.mass) ? option.mass : 0;
                this.type = option.type ?? "active";
                this.invMass = this.mass > 0 && (this.type === "active") ? 1 / this.mass : 0;
                this.material = option.material;
                this.label = option.label;
            }
            this.geometry.initialize(this);
        }
        getlinearVelocity(out, point) {
            if (this.type === "still")
                return out.set();
            let relPosition = out.subset(point, this.position);
            return out.dotbset(relPosition, this.angularVelocity).adds(this.velocity);
        }
        getMomentum(out) {
            if (this.type === "still")
                return out.set();
            return out.copy(this.velocity).mulfs(this.mass);
        }
        /** type: "J" for total, type: "S" for Spin, type: "L" for Orbital, */
        getAngularMomentum(out, point = new Vec4, type = "J") {
            const v = vec4Pool.pop();
            const p = vec4Pool.pop().copy(this.position);
            if (point)
                p.subs(point);
            if (type === "J" || type === "L") {
                out.wedgevvset(p, this.getMomentum(v));
            }
            else {
                out.set();
            }
            if (type === "L")
                return out;
            p.pushPool();
            const localW = bivecPool.pop();
            const localIW = bivecPool.pop();
            localW.rotateconjset(this.angularVelocity, this.rotation);
            mulBivec(localIW, this.inertia, localW);
            v.pushPool();
            return out.adds(localIW.rotates(this.rotation));
        }
        getLinearKineticEnergy() {
            return this.velocity.normsqr() * this.mass / 2;
        }
        getAngularKineticEnergy() {
            const localW = bivecPool.pop();
            const localIW = bivecPool.pop();
            localW.rotateset(this.angularVelocity, this.rotation);
            const k = localW.dot(mulBivec(localIW, this.inertia, localW)) / 2;
            localIW.pushPool();
            localIW.pushPool();
            return k;
        }
        getKineticEnergy() {
            return this.getLinearKineticEnergy() + this.getAngularKineticEnergy();
        }
    }
    class RigidGeometry {
        rigid;
        obb;
        aabb;
        boundingGlome;
        initialize(rigid) {
            this.rigid = rigid;
            this.initializeMassInertia(rigid);
            if (!rigid.mass && rigid.type === "active")
                rigid.type = "still";
            if (rigid.inertia) {
                rigid.invInertia.xy = 1 / rigid.inertia.xy;
                if (!rigid.inertiaIsotroy) {
                    rigid.invInertia.xz = 1 / rigid.inertia.xz;
                    rigid.invInertia.yz = 1 / rigid.inertia.yz;
                    rigid.invInertia.xw = 1 / rigid.inertia.xw;
                    rigid.invInertia.yw = 1 / rigid.inertia.yw;
                    rigid.invInertia.zw = 1 / rigid.inertia.zw;
                }
                else {
                    rigid.invInertia.xz = rigid.invInertia.xy;
                    rigid.invInertia.yz = rigid.invInertia.xy;
                    rigid.invInertia.xw = rigid.invInertia.xy;
                    rigid.invInertia.yw = rigid.invInertia.xy;
                    rigid.invInertia.zw = rigid.invInertia.xy;
                    rigid.inertia.xz = rigid.inertia.xy;
                    rigid.inertia.yz = rigid.inertia.xy;
                    rigid.inertia.xw = rigid.inertia.xy;
                    rigid.inertia.yw = rigid.inertia.xy;
                    rigid.inertia.zw = rigid.inertia.xy;
                }
            }
        }
        ;
    }
    var rigid;
    (function (rigid_1) {
        class Union extends RigidGeometry {
            components;
            constructor(components) { super(); this.components = components; }
            // todo: union gen
            initializeMassInertia(rigid) {
                // set union rigid's position at mass center of rigids
                rigid.position.set();
                rigid.mass = 0;
                for (let r of this.components) {
                    if (r.mass === undefined)
                        console.error("Union Rigid Geometry cannot contain a still rigid.");
                    rigid.position.addmulfs(r.position, r.mass);
                    rigid.mass += r.mass;
                }
                rigid.invMass = 1 / rigid.mass;
                rigid.position.mulfs(rigid.invMass);
                // update rigids position to relative frame
                for (let r of this.components) {
                    r.localCoord = new Obj4().copyObj4(r);
                    r.localCoord.position.subs(rigid.position);
                    r.parent = rigid;
                }
                // todo
                // let inertia = new Matrix(6,6);
                rigid.inertia.xy = 1;
                rigid.inertiaIsotroy = true;
                rigid.type = "active";
            }
            ;
            updateCoord() {
                for (let r of this.components) {
                    r.position.copy(r.localCoord.position).rotates(this.rigid.rotation).adds(this.rigid.position);
                    r.rotation.copy(r.localCoord.rotation).mulsl(this.rigid.rotation);
                }
            }
        }
        rigid_1.Union = Union;
        class Glome extends RigidGeometry {
            radius = 1;
            radiusSqr = 1;
            inertiaCoefficient;
            constructor(radius, inertiaCoefficient = 0.25) {
                super();
                this.radius = radius;
                this.boundingGlome = radius;
                this.radiusSqr = radius * radius;
                this.inertiaCoefficient = inertiaCoefficient;
            }
            initializeMassInertia(rigid) {
                rigid.inertiaIsotroy = true;
                rigid.inertia.xy = rigid.mass * this.radiusSqr * this.inertiaCoefficient;
            }
        }
        rigid_1.Glome = Glome;
        class Convex extends RigidGeometry {
            points;
            _cachePoints;
            constructor(points) {
                super();
                this.points = points;
                this.obb = AABB.fromPoints(points);
                this.boundingGlome = 0;
                for (let i of points) {
                    this.boundingGlome = Math.max(this.boundingGlome, i.normsqr());
                }
                this.boundingGlome = Math.sqrt(this.boundingGlome);
            }
            getPointsInertia(points, mass) {
                const inertiaMat = new Matrix(6);
                const tempMat = new Matrix(6);
                for (const p of points) {
                    const r11 = p.x * p.x;
                    const r12 = p.x * p.y;
                    const r13 = p.x * p.z;
                    const r14 = p.x * p.w;
                    const r22 = p.y * p.y;
                    const r23 = p.y * p.z;
                    const r24 = p.y * p.w;
                    const r33 = p.z * p.z;
                    const r34 = p.z * p.w;
                    const r44 = p.w * p.w;
                    tempMat.setElements(r11 + r22, r23, r24, -r13, -r14, 0, r23, r11 + r33, r34, r12, 0, -r14, r24, r34, r44 + r11, 0, r12, r13, -r13, r12, 0, r22 + r33, r34, -r24, -r14, 0, r12, r34, r44 + r22, r23, 0, -r14, r13, -r24, r23, r33 + r44).ts();
                    inertiaMat.adds(tempMat);
                }
                return inertiaMat.mulfs(mass / points.length);
            }
            initializeMassInertia(rigid) {
                // todo inertia calc
                new Matrix(6);
                // const Rt = Rotor.rand();
                const clinicMat = Matrix.fromArray([
                    [1, 0, 0, 0, 0, 1],
                    [0, 1, 0, 0, -1, 0],
                    [0, 0, 1, 1, 0, 0],
                    [1, 0, 0, 0, 0, -1],
                    [0, 1, 0, 0, 1, 0],
                    [0, 0, 1, -1, 0, 0],
                ]).mulfs(Math.SQRT1_2);
                const clinicMats = clinicMat.clone().ts();
                // calculate inertia matrix before rotation
                // const inertiaMat0 = this.getPointsInertia((rigid.geometry as Convex).points, rigid.mass);
                // (rigid.geometry as Convex).points.forEach(v => v.rotates(Rt));
                // calculate inertia matrix after rotation
                const inertiaMat = this.getPointsInertia(rigid.geometry.points, rigid.mass);
                // console.log(inertiaMat0,RtMat.mul(inertiaMat).mul(RtMat.ts())); // ok
                // convert to isoclinic basis
                // const iClinicMat0 = clinicMat.mul(inertiaMat0).mul(clinicMats);
                const iClinicMat = clinicMat.mul(inertiaMat).mul(clinicMats);
                // console.log(iClinicMat0, iClinicMat);
                // extract part P:
                // [aId  P; P'  aId]
                const p = iClinicMat.subMatrix(0, 3, 3, 3);
                if (p.norm1() < 1e-5) {
                    rigid.inertiaIsotroy = true;
                    rigid.inertia.set(...inertiaMat.diag()).mulfs(rigid.mass * 0.2); // factor for solid
                    return;
                }
                const { U, V } = p.SVdecompose(24);
                if (V.det() < 0) {
                    V.elem[6] = -V.elem[6];
                    V.elem[7] = -V.elem[7];
                    V.elem[8] = -V.elem[8];
                }
                // const newR = new Matrix(6);
                // const L = Matrix.fromArray([[0, 0, 1], [0, 1, 0], [1, 0, 0]]);
                // newR.setFromSubMatrix(U.clone().ts(), 3, 3);
                // newR.setFromSubMatrix((V.clone()), 3, 3, 0, 0, 3, 3);
                // console.log(newR.mul(iClinicMat).mul(newR.clone().ts()));
                const rL = new Quaternion().setFromMat3(U.toMat3());
                const rR = new Quaternion().setFromMat3(V.toMat3());
                const rotor = new Rotor(rL, rR);
                // console.log(newR, toBivecClinicMatrix(rotor));
                rigid.geometry.points.forEach(v => v.rotatesconj(rotor));
                // calculate inertia matrix
                const inertiaMat2 = this.getPointsInertia(rigid.geometry.points, rigid.mass);
                // console.log(inertiaMat2);
                rigid.rotates(rotor);
                rigid.inertia.set(...inertiaMat2.diag()).mulfs(rigid.mass * 0.2); // factor for solid
            }
        }
        rigid_1.Convex = Convex;
        class Tesseractoid extends Convex {
            size;
            constructor(size) {
                let s = typeof size === "number" ? new Vec4(size, size, size, size) : size;
                super([
                    new Vec4(s.x, s.y, s.z, s.w),
                    new Vec4(-s.x, s.y, s.z, s.w),
                    new Vec4(s.x, -s.y, s.z, s.w),
                    new Vec4(-s.x, -s.y, s.z, s.w),
                    new Vec4(s.x, s.y, -s.z, s.w),
                    new Vec4(-s.x, s.y, -s.z, s.w),
                    new Vec4(s.x, -s.y, -s.z, s.w),
                    new Vec4(-s.x, -s.y, -s.z, s.w),
                    new Vec4(s.x, s.y, s.z, -s.w),
                    new Vec4(-s.x, s.y, s.z, -s.w),
                    new Vec4(s.x, -s.y, s.z, -s.w),
                    new Vec4(-s.x, -s.y, s.z, -s.w),
                    new Vec4(s.x, s.y, -s.z, -s.w),
                    new Vec4(-s.x, s.y, -s.z, -s.w),
                    new Vec4(s.x, -s.y, -s.z, -s.w),
                    new Vec4(-s.x, -s.y, -s.z, -s.w),
                ]);
                this.size = s;
            }
            initializeMassInertia(rigid) {
                let mins = Math.min(this.size.x, this.size.y, this.size.z, this.size.w);
                let maxs = Math.max(this.size.x, this.size.y, this.size.z, this.size.w);
                let isoratio = mins / maxs;
                rigid.inertiaIsotroy = isoratio > 0.95;
                if (rigid.inertiaIsotroy) {
                    rigid.inertia.xy = rigid.mass * (mins + maxs) * (mins + maxs) * 0.2;
                }
                else {
                    let x = this.size.x * this.size.x;
                    let y = this.size.y * this.size.y;
                    let z = this.size.z * this.size.z;
                    let w = this.size.w * this.size.w;
                    rigid.inertia.set(x + y, x + z, x + w, y + z, y + w, z + w).mulfs(rigid.mass * 0.2);
                }
            }
        }
        rigid_1.Tesseractoid = Tesseractoid;
        class Duocylinder extends Convex {
            radius1;
            radius2;
            segment1;
            segment2;
            constructor(radius1, radius2, segment1, segment2) {
                const ps = [];
                const d1 = Math.PI * 2 / segment1;
                const d2 = Math.PI * 2 / segment2;
                for (let i = 0, ii = 0; i < segment1; i++, ii += d1) {
                    for (let j = 0, jj = 0; j < segment2; j++, jj += d2) {
                        ps.push(new Vec4(Math.sin(ii) * radius1, Math.sin(jj) * radius2, Math.cos(jj) * radius2, Math.cos(ii) * radius1));
                    }
                }
                super(ps);
                this.radius1 = radius1;
                this.radius2 = radius2;
                this.segment1 = segment1;
                this.segment2 = segment2;
            }
            initializeMassInertia(rigid) {
                let isoratio = this.radius1 / this.radius2;
                rigid.inertiaIsotroy = isoratio > 0.95 && isoratio < 1.05;
                if (rigid.inertiaIsotroy) {
                    rigid.inertia.xy = rigid.mass * (this.radius1 + this.radius2) * (this.radius1 + this.radius2) * 0.2;
                }
                else {
                    let x = this.radius1 * this.radius1;
                    let y = this.radius2 * this.radius2;
                    let z = y;
                    let w = x;
                    rigid.inertia.set(x + y, x + z, x + w, y + z, y + w, z + w).mulfs(rigid.mass * 0.2);
                }
            }
        }
        rigid_1.Duocylinder = Duocylinder;
        /** equation: dot(normal,positon) == offset
         *  => when offset > 0, plane is shifted to normal direction
         *  from origin by distance = offset
         */
        class Plane extends RigidGeometry {
            normal;
            offset;
            constructor(normal, offset) {
                super();
                this.normal = normal ?? Vec4.y.clone();
                this.offset = offset ?? 0;
            }
            initializeMassInertia(rigid) {
                if (rigid.mass)
                    console.warn("Infinitive Plane cannot have a finitive mass.");
                rigid.mass = undefined;
                rigid.invMass = 0;
                rigid.inertia = undefined;
                rigid.invInertia = undefined;
            }
        }
        rigid_1.Plane = Plane;
        class GlomicCavity extends RigidGeometry {
            radius;
            constructor(radius) {
                super();
                this.radius = radius;
            }
            initializeMassInertia(rigid) {
                if (rigid.mass)
                    console.warn("GlomicCavity cannot have a finitive mass.");
                rigid.mass = undefined;
                rigid.invMass = 0;
                rigid.inertia = undefined;
                rigid.invInertia = undefined;
            }
        }
        rigid_1.GlomicCavity = GlomicCavity;
        /** default orientation: XW */
        class Spheritorus extends RigidGeometry {
            majorRadius;
            minorRadius;
            /** majorRadius: cirle's radius, minorRadius: sphere's radius */
            constructor(majorRadius, minorRadius) {
                super();
                this.majorRadius = majorRadius;
                this.minorRadius = minorRadius;
                this.obb = new AABB(new Vec4(-majorRadius - minorRadius, -minorRadius, -minorRadius, -majorRadius - minorRadius), new Vec4(majorRadius + minorRadius, minorRadius, minorRadius, majorRadius + minorRadius));
                this.boundingGlome = majorRadius + minorRadius;
            }
            initializeMassInertia(rigid) {
                rigid.inertiaIsotroy = false;
                let maj = this.majorRadius * this.majorRadius;
                let min = this.minorRadius * this.minorRadius;
                let half = maj + 5 * min;
                let parallel = 2 * maj + 6 * min;
                let perp = 4 * min;
                rigid.inertia.set(half, half, parallel, perp, half, half).mulfs(rigid.mass * 0.1);
            }
        }
        rigid_1.Spheritorus = Spheritorus;
        /** default orientation: XZW */
        class Torisphere extends RigidGeometry {
            majorRadius;
            minorRadius;
            /** majorRadius: sphere's radius, minorRadius: cirle's radius */
            constructor(majorRadius, minorRadius) {
                super();
                this.majorRadius = majorRadius;
                this.minorRadius = minorRadius;
                this.obb = new AABB(new Vec4(-majorRadius - minorRadius, -minorRadius, -majorRadius - minorRadius, -majorRadius - minorRadius), new Vec4(majorRadius + minorRadius, minorRadius, majorRadius + minorRadius, majorRadius + minorRadius));
                this.boundingGlome = majorRadius + minorRadius;
            }
            initializeMassInertia(rigid) {
                rigid.inertiaIsotroy = false;
                let maj = this.majorRadius * this.majorRadius;
                let min = this.minorRadius * this.minorRadius;
                let half = 2 * maj + 5 * min;
                let parallel = 3 * maj + 6 * min;
                rigid.inertia.set(half, parallel, parallel, half, half, parallel).mulfs(rigid.mass * 0.1);
            }
        }
        rigid_1.Torisphere = Torisphere;
        /** default orientation: 1:XY, 2:ZW */
        class Tiger extends RigidGeometry {
            majorRadius1;
            majorRadius2;
            minorRadius;
            /** majorRadius: sphere's radius, minorRadius: cirle's radius */
            constructor(majorRadius1, majorRadius2, minorRadius) {
                super();
                this.majorRadius1 = majorRadius1;
                this.majorRadius2 = majorRadius2;
                this.minorRadius = minorRadius;
                this.obb = new AABB(new Vec4(-majorRadius1 - minorRadius, -majorRadius1 - minorRadius, -majorRadius2 - minorRadius, -majorRadius2 - minorRadius), new Vec4(majorRadius1 + minorRadius, majorRadius1 + minorRadius, majorRadius2 + minorRadius, majorRadius2 + minorRadius));
                this.boundingGlome = Math.max(majorRadius1, majorRadius2) + minorRadius;
            }
            initializeMassInertia(rigid) {
                rigid.inertiaIsotroy = false;
                let maj1 = this.majorRadius1 * this.majorRadius1;
                let maj2 = this.majorRadius2 * this.majorRadius2;
                let min = this.minorRadius * this.minorRadius;
                let half = maj1 + maj2 + min * 6;
                rigid.inertia.set(2 * maj1 + min * 5, half, half, half, half, 2 * maj2 + min * 5).mulfs(rigid.mass * 0.5);
            }
        }
        rigid_1.Tiger = Tiger;
        /** default orientation: (xy-z)-w */
        class Ditorus extends RigidGeometry {
            majorRadius;
            middleRadius;
            minorRadius;
            /** majorRadius, minorRadius: torus's radius, minorRadius: cirle's radius */
            constructor(majorRadius, middleRadius, minorRadius) {
                super();
                this.majorRadius = majorRadius;
                this.minorRadius = minorRadius;
                this.middleRadius = middleRadius;
                let minorRadius12 = minorRadius + middleRadius;
                this.obb = new AABB(new Vec4(-majorRadius - minorRadius12, -majorRadius - minorRadius12, -minorRadius12, -minorRadius), new Vec4(majorRadius + minorRadius12, majorRadius + minorRadius12, minorRadius12, minorRadius));
                this.boundingGlome = majorRadius + minorRadius12;
            }
            initializeMassInertia(rigid) {
                rigid.inertiaIsotroy = false;
                let maj1 = this.majorRadius * this.majorRadius;
                this.majorRadius * this.middleRadius;
                let min = this.middleRadius * this.middleRadius;
                let min2 = this.minorRadius * this.middleRadius;
                rigid.inertia.set(2 * maj1 + min * 5, maj1 + min * 6 + min2, maj1 + min2, maj1 + min * 6 + min2, maj1 + min2, 2 * min + min2).mulfs(rigid.mass * 0.2);
            }
        }
        rigid_1.Ditorus = Ditorus;
        // todo
        class ThickHexahedronGrid extends RigidGeometry {
            grid1;
            grid2;
            convex;
            constructor(grid1, grid2) {
                super();
                this.grid1 = grid1;
                this.grid2 = grid2;
                this.convex = [];
                for (let w = 0, lw = grid1.length - 1; w < lw; w++) {
                    let grd1w = grid1[w];
                    let grd2w = grid2[w];
                    let grd1w1 = grid1[w + 1];
                    let grd2w1 = grid2[w + 1];
                    for (let z = 0, lz = grid1[0].length - 1; z < lz; z++) {
                        let grd1wz = grd1w[z];
                        let grd2wz = grd2w[z];
                        let grd1wz1 = grd1w[z + 1];
                        let grd2wz1 = grd2w[z + 1];
                        let grd1w1z = grd1w1[z];
                        let grd2w1z = grd2w1[z];
                        let grd1w1z1 = grd1w1[z + 1];
                        let grd2w1z1 = grd2w1[z + 1];
                        for (let x = 0, lx = grid1[0][0].length - 1; x < lx; x++) {
                            let c = [
                                grd1wz[x],
                                grd1wz[x + 1],
                                grd1wz1[x],
                                grd1wz1[x + 1],
                                grd1w1z[x],
                                grd1w1z[x + 1],
                                grd1w1z1[x],
                                grd1w1z1[x + 1],
                                grd2wz[x],
                                grd2wz[x + 1],
                                grd2wz1[x],
                                grd2wz1[x + 1],
                                grd2w1z[x],
                                grd2w1z[x + 1],
                                grd2w1z1[x],
                                grd2w1z1[x + 1],
                            ];
                            let sum = new Vec4();
                            c.reduceRight((a, b) => { return sum.addset(a, b); }).divfs(16);
                            this.convex.push(new Convex(c.map(c => c.sub(sum))));
                        }
                    }
                }
            }
            initializeMassInertia(rigid) {
                if (rigid.mass)
                    console.warn("HeightField doesnt support a finitive mass.");
                rigid.mass = undefined;
                rigid.invMass = 0;
                rigid.inertia = undefined;
                rigid.invInertia = undefined;
            }
        }
        rigid_1.ThickHexahedronGrid = ThickHexahedronGrid;
        /** todo */
        class LoftedConvex extends Union {
            constructor(sp, section, step) {
                const { points, rotors } = sp.generate(step);
                const components = [];
                for (let j = 1; j < rotors.length; j++) {
                    let r = rotors[j];
                    let p = points[j];
                    let r0 = rotors[j - 1];
                    let p0 = points[j - 1];
                    let ps = section.map(v => v.rotate(r).adds(p));
                    let ps0 = section.map(v => v.rotate(r0).adds(p0));
                    ps.push(...ps0);
                    components.push(new Rigid({ geometry: new Convex(ps), mass: 0, material: new Material(1, 0.6) }));
                }
                super(components);
            }
            initializeMassInertia(rigid) {
                if (rigid.mass)
                    console.warn("LoftedConvex doesnt support a finitive mass.");
                rigid.mass = undefined;
                rigid.invMass = 0;
                rigid.inertia = undefined;
                rigid.invInertia = undefined;
            }
        }
        rigid_1.LoftedConvex = LoftedConvex;
    })(rigid || (rigid = {}));

    class BroadPhase {
        checkList = [];
        ignorePair = [];
        clearCheckList() {
            this.checkList = [];
        }
        verifyCheckList() {
            this.checkList = this.checkList.filter(([a, b]) => -1 === this.ignorePair.findIndex(([x, y]) => (a === x && b === y) || (a === y && b === x)));
        }
    }
    class BoundingGlomeBroadPhase extends BroadPhase {
        checkBoundingGlome(ri, rj) {
            let gi = ri.geometry instanceof rigid.Glome;
            let gj = rj.geometry instanceof rigid.Glome;
            let pi = ri.geometry instanceof rigid.Plane;
            let pj = rj.geometry instanceof rigid.Plane;
            let directDetect = (gi || pi) && (gj || pj);
            let radi = ri.geometry.boundingGlome;
            let radj = rj.geometry.boundingGlome;
            if (!directDetect && radi && radj) {
                let r = radi + radj;
                if (ri.position.distanceSqrTo(rj.position) > r * r) {
                    return false;
                }
            }
            else if (pi && radj) {
                let d = radj - (rj.position.dot(ri.geometry.normal) - ri.geometry.offset);
                if (d < 0)
                    return false;
            }
            else if (pj && radi) {
                let d = radi - (ri.position.dot(rj.geometry.normal) - rj.geometry.offset);
                if (d < 0)
                    return false;
            }
            return true;
        }
        run(world) {
            this.clearCheckList();
            for (let i = 0; i < world.rigids.length; i++) {
                for (let j = i + 1; j < world.rigids.length; j++) {
                    let ri = world.rigids[i], rj = world.rigids[j];
                    if (!ri.mass && !rj.mass)
                        continue;
                    if (!this.checkBoundingGlome(ri, rj))
                        continue;
                    let iU = ri.geometry instanceof rigid.Union;
                    let jU = rj.geometry instanceof rigid.Union;
                    if (!iU && !jU) {
                        this.checkList.push([ri, rj]);
                    }
                    else if (iU && !jU) {
                        for (let r of ri.geometry.components) {
                            if (!this.checkBoundingGlome(r, rj))
                                continue;
                            this.checkList.push([r, rj]);
                        }
                    }
                    else if (!iU && jU) {
                        for (let r of rj.geometry.components) {
                            if (!this.checkBoundingGlome(r, ri))
                                continue;
                            this.checkList.push([r, ri]);
                        }
                    }
                    else {
                        for (let r1 of ri.geometry.components) {
                            for (let r2 of rj.geometry.components) {
                                if (!this.checkBoundingGlome(r1, r2))
                                    continue;
                                this.checkList.push([r1, r2]);
                            }
                        }
                    }
                }
            }
        }
    }
    class BoundingGlomeTreeBroadPhase extends BroadPhase {
        tree;
        exclude;
        include;
        buildTree(world) {
            this.tree = undefined;
            this.exclude = [];
            this.include = [];
            let rigidIndex = -1;
            for (let i = 0; i < world.rigids.length; i++) {
                let ri = world.rigids[i];
                if (ri.geometry instanceof rigid.Plane || ri.geometry instanceof rigid.GlomicCavity) {
                    this.exclude.push(ri);
                }
                else {
                    this.include.push(ri);
                    rigidIndex++;
                    let riRadius = ri.geometry.boundingGlome;
                    let newRigidNode = {
                        radius: riRadius, position: ri.position.clone(),
                        surcell: riRadius * riRadius,
                        child1: ri, rigidIndex
                    };
                    if (!this.tree) {
                        // create initial tree: node->rigid[0]
                        this.tree = newRigidNode;
                    }
                    else {
                        let node = this.tree;
                        let nodeNeedUpdate = true;
                        let done = false;
                        while (!done) {
                            if (node.child1 instanceof Rigid) {
                                // insert a new leaf node for rigid
                                let radius = node.child1.geometry.boundingGlome;
                                let surcell = nodeNeedUpdate ? node.surcell : radius * radius;
                                let wrapNode = {
                                    radius, position: node.child1.position.clone(), surcell,
                                    child1: node.child1, parent: node, rigidIndex: node.rigidIndex
                                };
                                node.child1 = wrapNode;
                                node.child2 = newRigidNode;
                                newRigidNode.parent = node;
                                node.rigidIndex = undefined;
                                done = true;
                            }
                            if (nodeNeedUpdate) {
                                // update node's bounding glome
                                let distance = node.position.distanceTo(newRigidNode.position);
                                let newRadius = (distance + riRadius + node.radius) * 0.5;
                                if (newRadius <= Math.min(riRadius, node.radius)) {
                                    if (newRadius <= riRadius) {
                                        node.position.copy(ri.position);
                                        node.radius = riRadius;
                                        node.surcell = newRigidNode.surcell;
                                    }
                                }
                                else {
                                    node.position.subs(ri.position).mulfs((newRadius - riRadius) / distance).adds(ri.position);
                                    node.radius = newRadius;
                                    node.surcell = node.radius * node.radius;
                                }
                            }
                            if (!done && node.child2) {
                                let distance1 = ri.position.distanceTo(node.child1.position);
                                let d1 = distance1 + riRadius + node.child1.radius;
                                let surcell1 = d1 * d1 * 0.25;
                                let distance2 = ri.position.distanceTo(node.child2.position);
                                let d2 = distance2 + riRadius + node.child2.radius;
                                let surcell2 = d2 * d2 * 0.25;
                                let surcell = Math.min(surcell1, surcell2);
                                let radius, distance;
                                if (surcell1 - node.child1.surcell < surcell2 - node.child2.surcell) {
                                    node = node.child1;
                                    radius = d1 * 0.5;
                                    distance = distance1;
                                }
                                else {
                                    node = node.child2;
                                    radius = d2 * 0.5;
                                    distance = distance2;
                                }
                                node.position.subs(ri.position).mulfs((radius - riRadius) / distance).adds(ri.position);
                                node.radius = radius;
                                node.surcell = surcell;
                                nodeNeedUpdate = false;
                            }
                        }
                    }
                }
            }
        }
        run(world) {
            this.clearCheckList();
            this.buildTree(world);
            for (let includeIdx = 0; includeIdx < this.include.length; includeIdx++) {
                const stack = [this.tree];
                const i = this.include[includeIdx];
                while (stack.length) {
                    const node = stack.pop();
                    if (node.child1 instanceof Rigid) {
                        if (node.rigidIndex <= includeIdx) {
                            continue;
                        }
                    }
                    let r = i.geometry.boundingGlome + node.radius;
                    if (i.position.distanceSqrTo(node.position) < r * r) {
                        if (node.child2) {
                            stack.push(node.child1, node.child2);
                        }
                        else {
                            this.checkList.push([i, node.child1]);
                        }
                    }
                }
                for (let e of this.exclude) {
                    this.checkList.push([i, e]);
                }
            }
        }
    }
    class IgnoreAllBroadPhase extends BroadPhase {
        run(world) {
            this.clearCheckList();
        }
    }

    class ForceAccumulator {
        _biv1 = new Bivec;
        _biv2 = new Bivec;
        _bivec0 = new Bivec;
        getState(world) {
            // clear
            for (let o of world.rigids) {
                if (!o.invMass)
                    continue;
                o.force.set();
                o.torque.set();
            }
            // apply force
            for (let f of world.forces) {
                f.apply(world.time);
            }
            for (let o of world.rigids) {
                if (!o.invMass)
                    continue;
                o.acceleration.copy(world.gravity);
                if (o.force.norm1() > 0) {
                    o.acceleration.addmulfs(o.force, o.invMass);
                }
                if (o.inertiaIsotroy) {
                    if (o.torque.norm1() > 0)
                        o.angularAcceleration.set().addmulfs(o.torque, o.invInertia.xy);
                }
                else {
                    // Euler equation of motion
                    let localT = (o.torque.norm1() > 0) ? this._biv2.rotateconjset(o.torque, o.rotation) : this._bivec0;
                    let localW = this._biv1.rotateconjset(o.angularVelocity, o.rotation);
                    let localL = mulBivec(o.angularAcceleration, localW, o.inertia);
                    mulBivec(o.angularAcceleration, localL.crossrs(localW).negs().adds(localT), o.invInertia);
                    o.angularAcceleration.rotates(o.rotation);
                }
            }
        }
    }
    var force_accumulator;
    (function (force_accumulator) {
        class Euler2 extends ForceAccumulator {
            _bivec = new Bivec;
            _rotor = new Rotor;
            run(world, dt) {
                for (let o of world.rigids) {
                    if (!o.invMass)
                        continue;
                    o.rotation.norms();
                }
                this.getState(world);
                world.time += dt;
                let dtsqrhalf = dt * dt / 2;
                for (let o of world.rigids) {
                    if (o.sleep || !o.position)
                        continue;
                    // x1 = x0 + v0 t + a0 t^2/2
                    // v1 = v0 + a0 t/2
                    o.position.addmulfs(o.velocity, dt).addmulfs(o.acceleration, dtsqrhalf);
                    o.velocity.addmulfs(o.acceleration, dt);
                    if (!o.rotation)
                        continue;
                    o.rotation.mulsl(this._rotor.expset(this._bivec.copy(o.angularVelocity).mulfs(dt).addmulfs(o.angularAcceleration, dtsqrhalf)));
                    o.angularVelocity.addmulfs(o.angularAcceleration, dt);
                }
            }
        }
        force_accumulator.Euler2 = Euler2;
        class Predict3 extends ForceAccumulator {
            _bivec1 = new Bivec;
            _bivec2 = new Bivec;
            _rotor = new Rotor;
            _vec = new Vec4;
            run(world, dt) {
                for (let o of world.rigids) {
                    if (!o.invMass)
                        continue;
                    o.rotation.norms();
                }
                let prevStates = world.rigids.map(obj => ({
                    acceleration: obj.acceleration.clone(),
                    angularAcceleration: obj.angularAcceleration.clone(),
                }));
                this.getState(world);
                world.time += dt;
                let dthalf = dt * 0.5;
                let dtsqrdiv6 = dt * dthalf / 3;
                for (let idx = 0, len = world.rigids.length; idx < len; idx++) {
                    let o = world.rigids[idx];
                    let prevO = prevStates[idx];
                    if (o.sleep || !o.position)
                        continue;
                    // if we know a1, then:
                    // x1 = x0 + v0 t + (2/3 a0 + 1/3 a1) t^2/2
                    // v1 = v0 + (a0 + a1) t/2
                    // predict a1 = 2a0 - a{-1}, got:
                    // x1 = x0 + v0 t + (4/3 a0 - 1/3 a{-1}) t^2/2
                    // v1 = v0 + (3/2 a0 - 1/2 a{-1}) t
                    o.position.addmulfs(o.velocity, dt).addmulfs(this._vec.copy(prevO.acceleration).addmulfs(o.acceleration, -4), -dtsqrdiv6);
                    o.velocity.addmulfs(prevO.acceleration.addmulfs(o.acceleration, -3), -dthalf);
                    if (!o.rotation)
                        continue;
                    o.rotation.mulsl(this._rotor.expset(this._bivec1.copy(o.angularVelocity).mulfs(dt).addmulfs(this._bivec2.copy(prevO.angularAcceleration).addmulfs(o.angularAcceleration, -4), -dtsqrdiv6)));
                    o.angularVelocity.addmulfs(prevO.angularAcceleration.addmulfs(o.angularAcceleration, -3), -dthalf);
                }
            }
        }
        force_accumulator.Predict3 = Predict3;
        class RK4 extends ForceAccumulator {
            _bivec1 = new Bivec;
            _rotor = new Rotor;
            run(world, dt) {
                for (let o of world.rigids) {
                    if (!o.invMass)
                        continue;
                    o.rotation.norms();
                }
                let dthalf = dt * 0.5;
                let dtdiv6 = dt / 6;
                let self = this;
                function storeState(states) {
                    self.getState(world);
                    states.push(world.rigids.map(obj => ({
                        position: obj.position?.clone(),
                        rotation: obj.rotation?.clone(),
                        velocity: obj.velocity.clone(),
                        angularVelocity: obj.angularVelocity.clone(),
                        acceleration: obj.acceleration.clone(),
                        angularAcceleration: obj.angularAcceleration.clone(),
                    })));
                }
                function loadState(states, index) {
                    let state = states[index];
                    for (let idx = 0, len = world.rigids.length; idx < len; idx++) {
                        let o = world.rigids[idx];
                        let s = state[idx];
                        o.position?.copy(s?.position);
                        o.rotation?.copy(s?.rotation);
                        o.velocity.copy(s.velocity);
                        o.angularVelocity.copy(s.angularVelocity);
                        o.acceleration.copy(s.acceleration);
                        o.angularAcceleration.copy(s.angularAcceleration);
                    }
                }
                let states = [];
                storeState(states); // 0: k1 = f(yn, tn)
                for (let o of world.rigids) {
                    if (o.sleep || !o.position)
                        continue;
                    o.position.addmulfs(o.velocity, dthalf);
                    o.velocity.addmulfs(o.acceleration, dthalf);
                    if (!o.rotation)
                        continue;
                    o.rotation.mulsl(this._rotor.expset(this._bivec1.copy(o.angularVelocity).mulfs(dthalf)));
                    o.angularVelocity.addmulfs(o.angularAcceleration, dthalf);
                }
                world.time += dthalf;
                storeState(states); // 1: k2 = f(yn + h/2 k1, tn + h/2)
                loadState(states, 0);
                let state = states[1];
                for (let idx = 0, len = world.rigids.length; idx < len; idx++) {
                    let o = world.rigids[idx];
                    if (o.sleep || !o.position)
                        continue;
                    let s = state[idx];
                    o.position.addmulfs(s.velocity, dthalf);
                    o.velocity.addmulfs(s.acceleration, dthalf);
                    if (!o.rotation)
                        continue;
                    o.rotation.mulsl(this._rotor.expset(this._bivec1.copy(s.angularVelocity).mulfs(dthalf)));
                    o.angularVelocity.addmulfs(s.angularAcceleration, dthalf);
                }
                storeState(states); // 2: k3 = f(yn + h/2 k2, tn + h/2)
                loadState(states, 0);
                state = states[2];
                for (let idx = 0, len = world.rigids.length; idx < len; idx++) {
                    let o = world.rigids[idx];
                    if (o.sleep || !o.position)
                        continue;
                    let s = state[idx];
                    o.position.addmulfs(s.velocity, dt);
                    o.velocity.addmulfs(s.acceleration, dt);
                    if (!o.rotation)
                        continue;
                    o.rotation.mulsl(this._rotor.expset(this._bivec1.copy(s.angularVelocity).mulfs(dt)));
                    o.angularVelocity.addmulfs(s.angularAcceleration, dt);
                }
                world.time += dthalf;
                storeState(states); // 3: k4 = f(yn + h k3, tn + h)
                loadState(states, 0);
                for (let idx = 0, len = world.rigids.length; idx < len; idx++) {
                    let o = world.rigids[idx];
                    if (o.sleep || !o.position)
                        continue;
                    let k1 = states[0][idx];
                    let k2 = states[1][idx];
                    let k3 = states[2][idx];
                    let k4 = states[3][idx];
                    o.position.addmulfs(k1.velocity.adds(k4.velocity).addmulfs(k2.velocity.adds(k3.velocity), 2), dtdiv6);
                    o.velocity.addmulfs(k1.acceleration.adds(k4.acceleration).addmulfs(k2.acceleration.adds(k3.acceleration), 2), dtdiv6);
                    if (!o.rotation)
                        continue;
                    o.rotation.mulsl(this._rotor.expset(k1.angularVelocity.adds(k4.angularVelocity).addmulfs(k2.angularVelocity.adds(k3.angularVelocity), 2).mulfs(dtdiv6)));
                    o.angularVelocity.addmulfs(k1.angularAcceleration.adds(k4.angularAcceleration).addmulfs(k2.angularAcceleration.adds(k3.angularAcceleration), 2), dtdiv6);
                }
            }
        }
        force_accumulator.RK4 = RK4;
    })(force_accumulator || (force_accumulator = {}));
    class Force {
    }
    /** apply a spring force between object a and b
     *  pointA and pointB are in local coordinates,
     *  refering connect point of spring's two ends.
     *  b can be null for attaching spring to a fixed point in the world.
     *  f = k dx - damp * dv */
    class Spring extends Force {
        a;
        pointA;
        b;
        pointB;
        k;
        damp;
        length;
        _vec4f = new Vec4();
        _vec4a = new Vec4();
        _vec4b = new Vec4();
        _bivec = new Bivec();
        constructor(a, b, pointA, pointB, k, length = 0, damp = 0) {
            super();
            this.a = a;
            this.b = b;
            this.k = k;
            this.damp = damp;
            this.pointA = pointA;
            this.pointB = pointB;
            this.length = length;
        }
        apply(time) {
            const pa = this.a.position;
            const pb = this.b?.position;
            this._vec4a.copy(this.pointA).rotates(this.a.rotation).adds(pa);
            this._vec4b.copy(this.pointB);
            if (this.b)
                this._vec4b.rotates(this.b.rotation).adds(pb);
            let k = this.k;
            this._vec4f.subset(this._vec4b, this._vec4a);
            if (this.length > 0) {
                let len = this._vec4f.norm();
                k *= (len - this.length) / len;
            }
            if (this.damp) {
                const len2 = this._vec4f.normsqr();
                if (len2 > 1e-9) {
                    const va = vec4Pool.pop();
                    this.a.getlinearVelocity(va, this._vec4a);
                    const vb = vec4Pool.pop().set();
                    if (this.b) {
                        this.b.getlinearVelocity(vb, this._vec4b);
                    }
                    k -= va.subs(vb).dot(this._vec4f) / len2 * this.damp;
                    let oma = va.subs(vb).dot(this._vec4f);
                    if (Math.abs(oma) > 0.4)
                        console.log(oma);
                    va.pushPool();
                    vb.pushPool();
                }
            }
            this._vec4a.subs(pa);
            if (this.b)
                this._vec4b.subs(pb);
            //_vec4 is force from a to b
            this._vec4f.mulfs(k);
            // add force
            this.a.force.adds(this._vec4f);
            if (this.b)
                this.b.force.subs(this._vec4f);
            // add torque
            this.a.torque.subs(this._bivec.wedgevvset(this._vec4f, this._vec4a));
            if (this.b)
                this.b.torque.adds(this._bivec.wedgevvset(this._vec4f, this._vec4b));
        }
    }
    /** apply a spring torque between object a and b
     *  planeA and planeB are in local coordinates, must be simple and normalised,
     *  b can be null for attaching spring to a fixed plane in the world.
     *  torque = k (planeA x planeB) - damp * dw */
    class TorqueSpring extends Force {
        a;
        planeA;
        b;
        planeB;
        k;
        damp;
        length;
        _bivf = new Bivec();
        _biva = new Bivec();
        _bivb = new Bivec();
        _bivec = new Bivec();
        constructor(a, b, planeA, planeB, k, damp = 0) {
            super();
            this.a = a;
            this.b = b;
            this.k = k;
            this.damp = damp;
            this.planeA = planeA;
            this.planeB = planeB;
        }
        apply(time) {
            const srcB = this._biva.copy(this.planeA).rotates(this.a.rotation);
            const dstB = this._bivb.copy(this.planeB);
            if (this.b)
                dstB.rotates(this.b.rotation);
            let k = this.k;
            this._bivf.crossset(srcB, dstB);
            if (this.damp && this._bivf.norm1() > 1e-3) {
                let dw = (this.b ? this._bivec.subset(this.a.angularVelocity, this.b.angularVelocity) : this.a.angularVelocity).dot(this._bivf);
                // if (Math.abs(dw) > 0.2) console.log(dw);
                // if (dw > 0.3) dw = 0.3;
                // if (dw < - 0.3) dw = - 0.3;
                // if (Math.abs(dw) > 0.2) console.log(dw);
                // if(this._bivf.norm()>10) console.log(this._bivf.norm());
                k -= dw / this._bivf.normsqr() * this.damp;
            }
            this._bivf.mulfs(k);
            this.a.torque.adds(this._bivf);
            if (this.b)
                this.b.torque.subs(this._bivf);
        }
    }
    class Damping extends Force {
        objects = [];
        linearFactor;
        // assume angular damp matrix(6x6) has the same eigen vector with inertia matrix
        // this is diagonalized angular damp matrix
        angularFactor;
        // todo isotopy simplification
        _bivec = new Bivec();
        apply(time) {
            for (let o of this.objects) {
                o.force.addmulfs(o.velocity, -this.linearFactor);
                o.torque.subs(mulBivec(this._bivec, this._bivec.copy(o.angularVelocity).rotatesconj(o.rotation), this.angularFactor).rotates(o.rotation));
            }
        }
        constructor(linearFactor, angularFactor) {
            super();
            this.linearFactor = linearFactor;
            this.angularFactor = angularFactor instanceof Bivec ? angularFactor : new Bivec(angularFactor, angularFactor, angularFactor, angularFactor, angularFactor, angularFactor);
        }
        add(...objects) {
            for (let o of objects) {
                this.objects.push(o);
            }
        }
    }
    class MaxWell extends Force {
        electricCharge = [];
        electricDipole = [];
        magneticDipole = [];
        currentElement = [];
        currentCircuit = [];
        permittivity = 8.854187817e-12;
        permeability = Math.PI * 4e-7;
        constantElectricField = new Vec4;
        /** magnetic field direction is defined by positive charge's velocity wedge it's lorentz force */
        constantMagneticField = new Bivec;
        _vecE = new Vec4;
        _vecdE = new Mat4().set();
        _vecB = new Bivec;
        _vecdB = new Matrix(4, 6);
        _vecP = new Vec4;
        addElectricCharge(s) {
            this.electricCharge.push(s);
        }
        addElectricDipole(s) {
            this.electricDipole.push(s);
        }
        addMagneticDipole(s) {
            this.magneticDipole.push(s);
        }
        getEAt(p, dE, ignore) {
            let electricField = this._vecE.copy(this.constantElectricField);
            this._vecdE.set();
            for (let s of this.electricCharge) {
                if (ignore === s.position || ignore === s?.rigid)
                    continue;
                this.addEOfElectricCharge(electricField, dE ? this._vecdE : undefined, p, s);
            }
            for (let s of this.electricDipole) {
                if (ignore === s.position || ignore === s?.rigid)
                    continue;
                this.addEOfElectricDipole(electricField, dE ? this._vecdE : undefined, p, s);
            }
            return this._vecE;
        }
        getBAt(p, dB, ignore) {
            let magneticField = this._vecB.copy(this.constantMagneticField);
            this._vecdB.elem.fill(0);
            for (let s of this.magneticDipole) {
                if (ignore === s.position || ignore === s?.rigid)
                    continue;
                this.addBOfMagneticDipole(magneticField, dB ? this._vecdB : undefined, p, s);
            }
            return magneticField;
        }
        apply(time) {
            for (let q of this.electricCharge) {
                q.worldPos ??= new Vec4;
                if (q.rigid)
                    q.worldPos.copy(q.position).rotates(q.rigid.rotation).adds(q.rigid.position);
                else
                    q.worldPos.copy(q.position);
            }
            for (let q of this.electricDipole) {
                q.worldPos ??= new Vec4;
                q.worldMoment ??= new Vec4;
                if (q.rigid) {
                    q.worldPos.copy(q.position).rotates(q.rigid.rotation).adds(q.rigid.position);
                    q.worldMoment.copy(q.moment).rotates(q.rigid.rotation);
                }
                else {
                    q.worldMoment.copy(q.moment);
                }
            }
            for (let q of this.magneticDipole) {
                q.worldPos ??= new Vec4;
                q.worldMoment ??= new Bivec;
                if (q.rigid) {
                    q.worldPos.copy(q.position).rotates(q.rigid.rotation).adds(q.rigid.position);
                    q.worldMoment.copy(q.moment).rotates(q.rigid.rotation);
                }
                else {
                    q.worldMoment.copy(q.moment);
                }
            }
            // outter loop: test point, inner loop: source point
            let force = this._vecP;
            for (let q of this.electricCharge) {
                if (!q.rigid || !q.rigid.mass)
                    continue;
                this.getEAt(q.worldPos, false, q.rigid ?? q.position);
                this.getBAt(q.worldPos, false, undefined);
                let zeroB = (this._vecB.norm1() === 0);
                let zeroTorque = q.position.norm1() === 0;
                if (zeroB && zeroTorque) {
                    q.rigid.force.addmulfs(this._vecE, q.charge);
                    continue;
                }
                if (!zeroB) {
                    if (zeroTorque) {
                        force.copy(q.rigid.velocity);
                    }
                    else {
                        q.rigid.getlinearVelocity(force, q.worldPos);
                    }
                    // F = q(E+B.v)
                    force.dotbsr(this._vecB).adds(this._vecE).mulfs(q.charge);
                }
                else {
                    force.copy(this._vecE).mulfs(q.charge);
                }
                q.rigid.force.adds(force);
                q.rigid.torque.adds(this._vecB.wedgevvset(this._vecE.subset(q.worldPos, q.rigid.position), force));
            }
            let v4 = force;
            let biv = bivecPool.pop();
            for (let q of this.electricDipole) {
                if (!q.rigid || !q.rigid.mass)
                    continue;
                this.getEAt(q.worldPos, true, q.rigid ?? q.position);
                let zeroTorque = q.position.norm1() === 0;
                v4.mulmatvset(this._vecdE, q.worldMoment);
                biv.wedgevvset(this._vecE, q.worldMoment);
                q.rigid.torque.adds(biv);
                q.rigid.force.adds(v4);
                if (zeroTorque)
                    continue;
                q.rigid.torque.adds(this._vecB.wedgevvset(this._vecE.subset(q.worldPos, q.rigid.position), v4));
            }
            for (let q of this.magneticDipole) {
                if (!q.rigid || !q.rigid.mass)
                    continue;
                this.getBAt(q.worldPos, true, q.rigid ?? q.position);
                let zeroTorque = q.position.norm1() === 0;
                let db = this._vecdB.elem;
                v4.dotbset(Vec4.x, q.worldMoment);
                v4.dotbset(v4, biv.set(db[0], db[4], db[8], db[12], db[16], db[20]));
                q.rigid.force.adds(v4);
                v4.dotbset(Vec4.y, q.worldMoment);
                v4.dotbset(v4, biv.set(db[1], db[5], db[9], db[13], db[17], db[21]));
                q.rigid.force.adds(v4);
                v4.dotbset(Vec4.z, q.worldMoment);
                v4.dotbset(v4, biv.set(db[2], db[6], db[10], db[14], db[18], db[22]));
                q.rigid.force.adds(v4);
                v4.dotbset(Vec4.w, q.worldMoment);
                v4.dotbset(v4, biv.set(db[3], db[7], db[11], db[15], db[19], db[23]));
                q.rigid.force.adds(v4);
                biv.crossset(q.worldMoment, this._vecB);
                q.rigid.torque.adds(biv);
                if (zeroTorque)
                    continue;
                q.rigid.torque.adds(this._vecB.wedgevvset(this._vecE.subset(q.worldPos, q.rigid.position), v4));
            }
            biv.pushPool();
        }
        addEOfElectricCharge(vecE, dE, p, s) {
            let r = vec4Pool.pop().subset(p, s.worldPos);
            let r2 = 1 / r.normsqr();
            let qr4 = s.charge * r2 * r2;
            vecE.addmulfs(r, qr4);
            if (!dE) {
                r.pushPool();
                return;
            }
            let qr6_neg4 = -4 * qr4 * r2;
            let qrr = r.mulfs(qr6_neg4);
            let xy = qrr.x * r.y, xz = qrr.x * r.z, xt = qrr.x * r.w, yz = qrr.y * r.z, yt = qrr.y * r.w, zt = qrr.z * r.w;
            let mat = mat4Pool.pop();
            dE.adds(mat.set(qr4 + qrr.x * r.x, xy, xz, xt, xy, qr4 + qrr.y * r.y, yz, yt, xz, yz, qr4 + qrr.z * r.z, zt, xt, yt, zt, qr4 + qrr.w * r.w));
            mat.pushPool();
            r.pushPool();
        }
        addBOfMagneticDipole(vecB, dB, pos, s) {
            let k = vec4Pool.pop().subset(pos, s.worldPos);
            let q = s.worldMoment.dual();
            let x = k.x, y = k.y, z = k.z, w = k.w;
            let xx = x * x, yy = y * y, zz = z * z, ww = w * w;
            let kxy = q.xy, kxz = q.xz, kxw = q.xw, kyz = q.yz, kyw = q.yw, kzw = q.zw;
            -q.xy; let kzx = -q.xz, kwx = -q.xw, kzy = -q.yz, kwy = -q.yw, kwz = -q.zw;
            let r2 = xx + yy + zz + ww;
            let kxy2 = kzw * (-xx - yy + zz + ww);
            let kxz2 = kyw * (-xx + yy - zz + ww);
            let kxw2 = kyz * (-xx + yy + zz - ww);
            let kyz2 = kxw * (xx - yy - zz + ww);
            let kyw2 = kxz * (xx - yy + zz - ww);
            let kzw2 = kxy * (xx + yy - zz - ww);
            let rr = 1 / r2;
            let rr2 = rr * rr;
            let rr34 = 4 * rr2 * rr;
            let rr4 = rr34 * rr;
            let xy = x * y, xz = x * z, xw = x * w, yz = y * z, yw = y * w, zw = z * w;
            vecB.xy += rr34 * ((-kxz * xw - kyz * yw + kxw * xz + kyw * yz) + 0.5 * kxy2);
            vecB.xz += -rr34 * ((-kxy * xw - kzy * zw + kxw * xy + kzw * yz) + 0.5 * kxz2);
            vecB.xw += -rr34 * ((-kxz * xy - kwz * yw + kxy * xz + kwy * zw) - 0.5 * kxw2);
            vecB.yz += rr34 * ((kxy * yw - kzx * zw + kyw * xy + kzw * xz) + 0.5 * kyz2);
            vecB.yw += -rr34 * ((kxy * yz - kwx * zw + kyz * xy - kzw * xw) + 0.5 * kyw2);
            vecB.zw += rr34 * ((kxz * yz - kwx * yw - kyz * xz - kyw * xw) + 0.5 * kzw2);
            if (!dB)
                return;
            let r2m6xx = r2 - 6 * xx;
            let r2m6yy = r2 - 6 * yy;
            let r2m6zz = r2 - 6 * zz;
            let r2m6ww = r2 - 6 * ww;
            x *= rr4;
            y *= rr4;
            z *= rr4;
            w *= rr4;
            xy *= 6;
            xz *= 6;
            xw *= 6;
            yz *= 6;
            yw *= 6;
            zw *= 6;
            let kxy_x = kxy * x, kxz_x = kxz * x, kxw_x = kxw * x, kyz_x = kyz * x, kyw_x = kyw * x, kzw_x = kzw * x;
            let kxy_y = kxy * y, kxz_y = kxz * y, kxw_y = kxw * y, kyz_y = kyz * y, kyw_y = kyw * y, kzw_y = kzw * y;
            let kxy_z = kxy * z, kxz_z = kxz * z, kxw_z = kxw * z, kyz_z = kyz * z, kyw_z = kyw * z, kzw_z = kzw * z;
            let kxy_w = kxy * w, kxz_w = kxz * w, kxw_w = kxw * w, kyz_w = kyz * w, kyw_w = kyw * w, kzw_w = kzw * w;
            dB.adds(new Matrix(4, 6).setElements((xy * (kyz_w - kyw_z) + 2 * kzw_x * (xx + yy - 2 * (zz + ww)) + (kxw_z - kxz_w) * (r2m6xx)), (xy * (kxz_w - kxw_z) + 2 * kzw_y * (xx + yy - 2 * (zz + ww)) + (kyw_z - kyz_w) * (r2m6yy)), (zw * (kxz_x + kyz_y) - 2 * kzw_z * (zz + ww - 2 * (xx + yy)) + (kxw_x + kyw_y) * (r2m6zz)), -(zw * (kxw_x + kyw_y) + 2 * kzw_w * (zz + ww - 2 * (xx + yy)) + (kxz_x + kyz_y) * (r2m6ww)), -(xz * (-kyz_w - kzw_y) + 2 * kyw_x * (xx + zz - 2 * (yy + ww)) + (kxw_y - kxy_w) * (r2m6xx)), -(yw * (kxy_x - kyz_z) - 2 * kyw_y * (yy + ww - 2 * (xx + zz)) + (kxw_x + kzw_z) * (r2m6yy)), -(xz * (kxy_w - kxw_y) + 2 * kyw_z * (xx + zz - 2 * (yy + ww)) + (kzw_y + kyz_w) * (r2m6zz)), (yw * (kxw_x + kzw_z) + 2 * kyw_w * (yy + ww - 2 * (xx + zz)) + (kxy_x - kyz_z) * (r2m6ww)), -(xw * (-kzw_y + kyw_z) - 2 * kyz_x * (xx + ww - 2 * (zz + yy)) + (kxy_z - kxz_y) * (r2m6xx)), (yz * (kxy_x - kyw_w) - 2 * kyz_y * (zz + yy - 2 * (xx + ww)) + (kxz_x - kzw_w) * (r2m6yy)), -(yz * (kxz_x - kzw_w) + 2 * kyz_z * (zz + yy - 2 * (xx + ww)) + (kxy_x - kyw_w) * (r2m6zz)), -(xw * (kxz_y - kxy_z) - 2 * kyz_w * (xx + ww - 2 * (zz + yy)) + (-kyw_z + kzw_y) * (r2m6ww)), (xw * (-kxy_y - kxz_z) - 2 * kxw_x * (xx + ww - 2 * (yy + zz)) + (kyw_y + kzw_z) * (r2m6xx)), (yz * (-kxz_w - kzw_x) + 2 * kxw_y * (yy + zz - 2 * (xx + ww)) + (kyw_x + kxy_w) * (r2m6yy)), (yz * (-kxy_w - kyw_x) + 2 * kxw_z * (yy + zz - 2 * (xx + ww)) + (kzw_x + kxz_w) * (r2m6zz)), -(xw * (kyw_y + kzw_z) + 2 * kxw_w * (xx + ww - 2 * (yy + zz)) + (-kxy_y - kxz_z) * (r2m6ww)), -(xz * (-kxy_y - kxw_w) - 2 * kxz_x * (xx + zz - 2 * (yy + ww)) + (kyz_y - kzw_w) * (r2m6xx)), -(yw * (-kxw_z + kzw_x) + 2 * kxz_y * (yy + ww - 2 * (xx + zz)) + (kyz_x + kxy_z) * (r2m6yy)), (xz * (kyz_y - kzw_w) + 2 * kxz_z * (xx + zz - 2 * (yy + ww)) + (-kxy_y - kxw_w) * (r2m6zz)), -(yw * (-kxy_z - kyz_x) + 2 * kxz_w * (yy + ww - 2 * (xx + zz)) + (-kzw_x + kxw_z) * (r2m6ww)), (xy * (-kxz_z - kxw_w) - 2 * kxy_x * (xx + yy - 2 * (zz + ww)) + (-kyz_z - kyw_w) * (r2m6xx)), -(xy * (-kyz_z - kyw_w) + 2 * kxy_y * (xx + yy - 2 * (zz + ww)) + (-kxz_z - kxw_w) * (r2m6yy)), (zw * (-kxw_y + kyw_x) + 2 * kxy_z * (zz + ww - 2 * (xx + yy)) + (-kyz_x + kxz_y) * (r2m6zz)), (zw * (-kxz_y + kyz_x) + 2 * kxy_w * (zz + ww - 2 * (xx + yy)) + (-kyw_x + kxw_y) * (r2m6ww))));
        }
        addEOfElectricDipole(vecE, dE, pos, s) {
            let r = vec4Pool.pop().subset(pos, s.worldPos);
            let p = s.worldMoment;
            // u =  r.s / (r.r)^2
            let pxx = p.x * r.x, pyy = p.y * r.y, pzz = p.z * r.z, pww = p.w * r.w;
            let p2 = pxx + pyy + pzz + pww;
            let rxx = r.x * r.x, ryy = r.y * r.y, rzz = r.z * r.z, rww = r.w * r.w;
            let r2 = rxx + ryy + rzz + rww;
            let r2inv = 1 / r2;
            let r4 = r2inv * r2inv;
            let p2_r2_4 = 4 * p2 * r2inv;
            vecE.x += r4 * (p.x - p2_r2_4 * r.x);
            vecE.y += r4 * (p.y - p2_r2_4 * r.y);
            vecE.z += r4 * (p.z - p2_r2_4 * r.z);
            vecE.w += r4 * (p.w - p2_r2_4 * r.w);
            if (!dE)
                return; // if no need for calc dE
            let r8_neg4 = -4 * r4 * r4;
            let p2_6 = p2 * 6;
            let xy = r8_neg4 * ((p.x * r.y + p.y * r.x) * r2 - p2_6 * r.x * r.y), xz = r8_neg4 * ((p.x * r.z + p.z * r.x) * r2 - p2_6 * r.x * r.z), xw = r8_neg4 * ((p.x * r.w + p.w * r.x) * r2 - p2_6 * r.x * r.w), yz = r8_neg4 * ((p.y * r.z + p.z * r.y) * r2 - p2_6 * r.y * r.z), yw = r8_neg4 * ((p.y * r.w + p.w * r.y) * r2 - p2_6 * r.y * r.w), zw = r8_neg4 * ((p.z * r.w + p.w * r.z) * r2 - p2_6 * r.z * r.w);
            let mat = mat4Pool.pop();
            dE.adds(mat.set((p2 * (r2 - 6 * rxx) + 2 * pxx * r2) * r8_neg4, xy, xz, xw, xy, (p2 * (r2 - 6 * ryy) + 2 * pyy * r2) * r8_neg4, yz, yw, xz, yz, (p2 * (r2 - 6 * rzz) + 2 * pzz * r2) * r8_neg4, zw, xw, yw, zw, (p2 * (r2 - 6 * rww) + 2 * pww * r2) * r8_neg4).negs());
            mat.pushPool();
            r.pushPool();
        }
    }
    class Gravity extends Force {
        _vecG = new Vec4;
        rigids = [];
        lawIndex = -3;
        gravitonMass = 0;
        constructor(lawIndex = -3, gravitonMass = 0) {
            super();
            this.lawIndex = lawIndex;
            this.gravitonMass = gravitonMass;
        }
        gain = 10;
        add(s) {
            this.rigids.push(s);
        }
        getGAt(p, ignore) {
            this._vecG.set();
            for (let s of this.rigids) {
                if (ignore === s.position || ignore === s)
                    continue;
                this.addGOfMass(this._vecG, p, s);
            }
            return this._vecG;
        }
        apply(time) {
            // outter loop: test point, inner loop: source point
            for (let q of this.rigids) {
                if (!q || !q.mass)
                    continue;
                q.force.addmulfs(this.getGAt(q.position, q), q.mass);
            }
        }
        data = [-247.562, -213.642, -185.622, -162.273, -142.662, -126.071, -111.941, -99.8327, -89.3977, -80.357, -72.4858, -65.6012, -59.5538, -54.2202, -49.4985, -45.3036, -41.5642, -38.2204, -35.2212, -32.5236, -30.0908, -27.891, -25.8973, -24.0861, -22.4371, -20.9326, -19.5572, -18.2974, -17.1415, -16.0788, -15.1004, -14.198, -13.3644, -12.5933, -11.879, -11.2163, -10.6007, -10.0282, -9.495, -8.99788, -8.53384, -8.10021, -7.69457, -7.3147, -6.95861, -6.62449, -6.31069, -6.01571, -5.73816, -5.4768, -5.23047, -4.99813, -4.7788, -4.5716, -4.37572, -4.1904, -4.01494, -3.84872, -3.69114, -3.54165, -3.39975, -3.26497, -3.13688, -3.01508, -2.89918, -2.78885, -2.68376, -2.5836, -2.4881, -2.39699, -2.31003, -2.22699, -2.14766, -2.07183, -1.99932, -1.92995, -1.86357, -1.8, -1.73911, -1.68077, -1.62484, -1.5712, -1.51974, -1.47036, -1.42295, -1.37742, -1.33367, -1.29163, -1.25121, -1.21234, -1.17494, -1.13896, -1.10432, -1.07097, -1.03884, -1.00789, -0.97806, -0.949304, -0.921575, -0.894829, -0.869024, -0.844121, -0.820083, -0.796872, -0.774456, -0.752801, -0.731877, -0.711655, -0.692106, -0.673203, -0.654921, -0.637236, -0.620125, -0.603565, -0.587535, -0.572016, -0.556987, -0.542431, -0.528329, -0.514665, -0.501423, -0.488587, -0.476143, -0.464076, -0.452373, -0.44102, -0.430007, -0.419319, -0.408947, -0.398879, -0.389104, -0.379613, -0.370395, -0.361442, -0.352745, -0.344294, -0.336082, -0.328101, -0.320343, -0.312801, -0.305467, -0.298335, -0.291399, -0.284652, -0.278088, -0.271702, -0.265487, -0.259438, -0.25355, -0.247819, -0.242238, -0.236804, -0.231513, -0.226359, -0.221338, -0.216447, -0.211682, -0.207038, -0.202513, -0.198103, -0.193803, -0.189612, -0.185526, -0.181542, -0.177656, -0.173867, -0.170171, -0.166566, -0.163048, -0.159617, -0.156268, -0.153, -0.149811, -0.146699, -0.14366, -0.140694, -0.137798, -0.134971, -0.13221, -0.129513, -0.12688, -0.124308, -0.121795, -0.119341, -0.116942, -0.114599, -0.11231, -0.110072, -0.107886, -0.105749, -0.10366, -0.101617, -0.0996211, -0.0976693, -0.0957608, -0.0938947, -0.0920698, -0.0902851, -0.0885396, -0.0868323, -0.0851623, -0.0835285, -0.0819302, -0.0803665, -0.0788364, -0.0773392, -0.075874, -0.0744402, -0.0730369, -0.0716633, -0.0703189, -0.0690028, -0.0677143, -0.066453, -0.065218, -0.0640088, -0.0628247, -0.0616652, -0.0605297, -0.0594176, -0.0583284, -0.0572615, -0.0562164, -0.0551927, -0.0541898, -0.0532073, -0.0522447, -0.0513015, -0.0503772, -0.0494716, -0.0485841, -0.0477143, -0.0468619, -0.0460264, -0.0452075, -0.0444047, -0.0436179, -0.0428465, -0.0420902, -0.0413488, -0.0406218, -0.0399091, -0.0392102, -0.0385248, -0.0378527, -0.0371936, -0.0365472, -0.0359132, -0.0352914, -0.0346815, -0.0340832, -0.0334963, -0.0329206, -0.0323557, -0.0318016, -0.0312579, -0.0307245, -0.0302011, -0.0296875, -0.0291835, -0.0286889, -0.0282036, -0.0277273, -0.0272598, -0.026801, -0.0263506, -0.0259086, -0.0254746, -0.0250487, -0.0246306, -0.0242201, -0.0238171, -0.0234214, -0.023033, -0.0226516, -0.0222771, -0.0219094, -0.0215483, -0.0211937, -0.0208455, -0.0205035, -0.0201676, -0.0198378, -0.0195138, -0.0191956, -0.0188831, -0.0185761, -0.0182745, -0.0179783, -0.0176873, -0.0174014, -0.0171206, -0.0168446, -0.0165736, -0.0163072, -0.0160455, -0.0157884, -0.0155357, -0.0152874, -0.0150434, -0.0148037, -0.0145681, -0.0143365, -0.014109, -0.0138853, -0.0136655, -0.0134495, -0.0132371, -0.0130284, -0.0128232, -0.0126216, -0.0124233, -0.0122285, -0.0120369, -0.0118485, -0.0116634, -0.0114814, -0.0113024, -0.0111264, -0.0109534, -0.0107833, -0.0106161, -0.0104516, -0.0102899, -0.0101309, -997447e-8, -982069e-8, -966946e-8, -952073e-8, -937446e-8, -923061e-8, -908912e-8, -894997e-8, -881311e-8, -867849e-8, -854608e-8, -841584e-8, -828773e-8, -81617e-7, -803774e-8, -791579e-8, -779582e-8, -767781e-8, -75617e-7, -744748e-8, -73351e-7, -722454e-8, -711576e-8, -700874e-8, -690343e-8, -679982e-8, -669787e-8, -659755e-8, -649884e-8, -64017e-7, -630612e-8, -621206e-8, -61195e-7, -602841e-8, -593876e-8, -585054e-8, -576372e-8, -567827e-8, -559417e-8, -551139e-8, -542992e-8, -534974e-8, -527081e-8, -519313e-8, -511666e-8, -50414e-7, -496731e-8, -489437e-8, -482258e-8, -475191e-8, -468234e-8, -461385e-8, -454642e-8, -448004e-8, -441469e-8, -435036e-8, -428701e-8, -422465e-8, -416325e-8, -41028e-7, -404328e-8, -398467e-8, -392697e-8, -387015e-8, -38142e-7, -375911e-8, -370486e-8, -365144e-8, -359884e-8, -354704e-8, -349602e-8, -344579e-8, -339632e-8, -33476e-7, -329962e-8, -325236e-8, -320583e-8, -315999e-8, -311485e-8, -307039e-8, -30266e-7, -298347e-8, -294099e-8, -289915e-8, -285794e-8, -281734e-8, -277736e-8, -273797e-8, -269917e-8, -266095e-8, -262331e-8, -258622e-8, -254969e-8, -25137e-7, -247824e-8, -244332e-8, -240891e-8, -237501e-8, -234161e-8, -230871e-8, -22763e-7, -224436e-8, -22129e-7, -21819e-7, -215135e-8, -212126e-8, -209161e-8, -20624e-7, -203361e-8, -200525e-8, -19773e-7, -194976e-8, -192263e-8, -189589e-8, -186954e-8, -184357e-8, -181799e-8, -179278e-8, -176793e-8, -174345e-8, -171932e-8, -169554e-8, -167211e-8, -164902e-8, -162626e-8, -160383e-8, -158172e-8, -155994e-8, -153846e-8, -15173e-7, -149645e-8, -147589e-8, -145563e-8, -143566e-8, -141598e-8, -139658e-8, -137746e-8, -135861e-8, -134003e-8, -132172e-8, -130367e-8, -128587e-8, -126834e-8, -125105e-8, -123401e-8, -121721e-8, -120065e-8, -118432e-8, -116823e-8, -115236e-8, -113672e-8, -112131e-8, -110611e-8, -109112e-8, -107635e-8, -106179e-8];
        addGOfMass(vecG, p, s) {
            let r = vec4Pool.pop().subset(p, s.position);
            let r2 = 1 / r.normsqr();
            let qr4 = this.lawIndex === -3 || this.lawIndex === -2 ? -s.mass * r2 * r2 : 0;
            if (this.lawIndex === -2)
                qr4 *= r.norm();
            if (this.lawIndex === -3 && this.gravitonMass !== 0) {
                const scaleFactor = 1.5;
                const x = r.norm() * scaleFactor;
                let res = 0;
                if (x >= 0.2 && x <= 5) {
                    const idx = (x - 0.2) * 100;
                    const index = Math.floor(idx);
                    res = this.data[this.data.length - 1];
                    if (index >= 0 && index < this.data.length - 1) {
                        res = this.data[index] * (idx - index) + this.data[index + 1] * (index + 1 - idx);
                    }
                }
                else if (x > 5) {
                    const rx = 1 / x;
                    res = Math.exp(-x) * Math.sqrt(rx) * rx * (-1.25331 - rx * (2.34996 + rx * 1.02811));
                }
                else {
                    const rx = 1 / x;
                    res = rx * (0.5 - 2 * rx * rx) + x * (-0.865932 + Math.log(x)) * 0.125;
                }
                qr4 += res / r.norm() * this.gravitonMass;
            }
            vecG.addmulfs(r, qr4 * this.gain);
            r.pushPool();
            return;
        }
    }

    // Convex Collision Detection algorithms (GJK Distance + EPA)
    const maxEpaStep = 16;
    const maxGjkStep = 32;
    function support(c, dir) {
        let support = -Infinity;
        let point;
        for (let p of c) {
            let value = p.dot(dir);
            if (value > support) {
                support = value;
                point = p;
            }
        }
        return point;
    }
    function supportNeg(c, dir) {
        let support = -Infinity;
        let point;
        for (let p of c) {
            let value = -p.dot(dir);
            if (value > support) {
                support = value;
                point = p;
            }
        }
        return point;
    }
    function supportDiff(c1, c2, dir) {
        if (!dir) {
            console.error("Convex Collision Detector: Undefined support direction");
        }
        let support = -Infinity;
        let point1;
        let point2;
        for (let p of c1) {
            let value = p.dot(dir);
            if (value > support) {
                support = value;
                point1 = p;
            }
        }
        support = -Infinity;
        for (let p of c2) {
            let value = -p.dot(dir);
            if (value > support) {
                support = value;
                point2 = p;
            }
        }
        return [point1, point2];
    }
    function supportDiffTest(c1, c2, dir) {
        let support1 = -Infinity;
        let point1;
        let point2;
        for (let p of c1) {
            let value = p.dot(dir);
            if (value > support1) {
                support1 = value;
                point1 = p;
            }
        }
        let support2 = -Infinity;
        for (let p of c2) {
            let value = -p.dot(dir);
            if (value > support2) {
                support2 = value;
                point2 = p;
            }
        }
        if (support1 + support2 < 0)
            return [];
        return [point1, point2];
    }
    // /** get closest point on line segment ab */
    // function closestToOrigin2(a: Vec4, b: Vec4) {
    //     let adb = a.dot(b);
    //     let la = b.normsqr() - adb; if (la < 0) return b;
    //     let lb = a.normsqr() - adb; if (lb < 0) return a;
    //     return vec4Pool.pop().set().addmulfs(a, la).addmulfs(b, lb).divfs(la + lb);
    // }
    // /** get line ab's normal pointing to origin, 20 muls */
    // function normalToOrigin2(out: Vec4, a: Vec4, b: Vec4) {
    //     let adb = a.dot(b);
    //     let la = b.normsqr() - adb;
    //     let lb = a.normsqr() - adb;
    //     return out.set().addmulfs(a, -la).addmulfs(b, -lb);
    // }
    // /** get plane abc's normal point to origin, 36 muls */
    // function normalToOrigin3(out: Vec4, a: Vec4, b: Vec4, c: Vec4) {
    //     let vec = vec4Pool.pop();
    //     let biv = bivecPool.pop().wedgevvset(
    //         out.subset(b, a), vec.subset(c, a)
    //     );
    //     vec.pushPool();
    //     out.wedgevbset(a, biv).wedgevbset(out, biv);
    //     biv.pushPool();
    //     return out;
    // }
    function getClosestPointOrNormal2(a, b) {
        let adb = a.dot(b);
        let la = b.normsqr() - adb;
        if (la < 0)
            return b;
        let lb = a.normsqr() - adb;
        if (lb < 0)
            return a;
        return vec4Pool.pop().set().addmulfs(a, -la).addmulfs(b, -lb);
    }
    function getClosestPointOrNormal3(a, b, c) {
        let ca = vec4Pool.pop().subset(a, c);
        let cb = vec4Pool.pop().subset(b, c);
        if (c.dot(ca) > 0 && c.dot(cb) > 0) {
            vec4Pool.push(ca, cb);
            return [c];
        }
        let biv = bivecPool.pop().wedgevvset(ca, cb);
        if (ca.dotbset(ca, biv).dot(c) > 0) {
            vec4Pool.push(ca, cb);
            return [a, c];
        }
        // cb's sign is not consisted with ca's because of biv = ca x cb
        if (cb.dotbset(cb, biv).dot(c) < 0) {
            vec4Pool.push(ca, cb);
            return [b, c];
        }
        let out = ca;
        out.wedgevbset(a, biv).wedgevbset(out, biv);
        biv.pushPool();
        vec4Pool.push(cb);
        return out;
    }
    function getClosestPointOrNormal4(a, b, c, d) {
        let da = vec4Pool.pop().subset(a, d);
        let db = vec4Pool.pop().subset(b, d);
        let dc = vec4Pool.pop().subset(c, d);
        // vertex
        if (d.dot(da) > 0 && d.dot(db) > 0 && d.dot(dc) > 0) {
            vec4Pool.push(da, db, dc);
            return [d];
        }
        // edge
        let dab = bivecPool.pop().wedgevvset(da, db);
        let dbc = bivecPool.pop().wedgevvset(db, dc);
        let dca = bivecPool.pop().wedgevvset(dc, da);
        let temp = vec4Pool.pop();
        if (temp.dotbset(da, dab).dot(d) > 0 && temp.dotbset(da, dca).dot(d) < 0) {
            vec4Pool.push(da, db, dc, temp);
            bivecPool.push(dab, dbc, dca);
            return [a, d];
        }
        if (temp.dotbset(db, dbc).dot(d) > 0 && temp.dotbset(db, dab).dot(d) < 0) {
            vec4Pool.push(da, db, dc, temp);
            bivecPool.push(dab, dbc, dca);
            return [b, d];
        }
        if (temp.dotbset(dc, dca).dot(d) > 0 && temp.dotbset(dc, dbc).dot(d) < 0) {
            vec4Pool.push(da, db, dc, temp);
            bivecPool.push(dab, dbc, dca);
            return [c, d];
        }
        // face
        // dabc is normal vector
        let dabc = vec4Pool.pop().wedgevbset(da, dbc);
        if (temp.wedgevbset(dabc, dab).dot(d) < 0) {
            vec4Pool.push(da, db, dc, dabc, temp);
            bivecPool.push(dab, dbc, dca);
            return [a, b, d];
        }
        if (temp.wedgevbset(dabc, dbc).dot(d) < 0) {
            vec4Pool.push(da, db, dc, dabc, temp);
            bivecPool.push(dab, dbc, dca);
            return [b, c, d];
        }
        if (temp.wedgevbset(dabc, dca).dot(d) < 0) {
            vec4Pool.push(da, db, dc, dabc, temp);
            bivecPool.push(dab, dbc, dca);
            return [a, c, d];
        }
        // new direction is already normal dabc
        // but need to point to origin:
        // dabc.mulfs(-a.dot(dabc));
        // we do it outside of this fn
        // because we need this important orientation information
        // to construct corrected ordered 5-simplex
        vec4Pool.push(da, db, dc, temp);
        bivecPool.push(dab, dbc, dca);
        return dabc;
    }
    function getClosestPoint5(a, b, c, d, e, reverseOrder) {
        // about reverseOrder:
        // if reverseOrder == false
        // da^db^dc (dabc) is pointing to outside
        // else dabc is pointing to e (inside)
        let ea = vec4Pool.pop().subset(a, e);
        let eb = vec4Pool.pop().subset(b, e);
        let ec = vec4Pool.pop().subset(c, e);
        let ed = vec4Pool.pop().subset(d, e);
        // vertex
        if (e.dot(ea) > 0 && e.dot(eb) > 0 && e.dot(ec) > 0 && e.dot(ed) > 0) {
            vec4Pool.push(ea, eb, ec, ed);
            return [e];
        }
        // edge
        let eab = bivecPool.pop().wedgevvset(ea, eb);
        let ebc = bivecPool.pop().wedgevvset(eb, ec);
        let eac = bivecPool.pop().wedgevvset(ea, ec);
        let ead = bivecPool.pop().wedgevvset(ea, ed);
        let ebd = bivecPool.pop().wedgevvset(eb, ed);
        let ecd = bivecPool.pop().wedgevvset(ec, ed);
        let temp = vec4Pool.pop();
        if (temp.dotbset(ea, eab).dot(e) > 0 && temp.dotbset(ea, eac).dot(e) > 0 && temp.dotbset(ea, ead).dot(e) > 0) {
            vec4Pool.push(ea, eb, ec, ed, temp);
            bivecPool.push(eab, ebc, eac, ead, ebd, ecd);
            return [a, e];
        }
        if (temp.dotbset(eb, eab).dot(e) < 0 && temp.dotbset(eb, ebc).dot(e) > 0 && temp.dotbset(eb, ebd).dot(e) > 0) {
            vec4Pool.push(ea, eb, ec, ed, temp);
            bivecPool.push(eab, ebc, eac, ead, ebd, ecd);
            return [b, e];
        }
        if (temp.dotbset(ec, eac).dot(e) < 0 && temp.dotbset(ec, ebc).dot(e) < 0 && temp.dotbset(ec, ecd).dot(e) > 0) {
            vec4Pool.push(ea, eb, ec, ed, temp);
            bivecPool.push(eab, ebc, eac, ead, ebd, ecd);
            return [c, e];
        }
        if (temp.dotbset(ed, ead).dot(e) < 0 && temp.dotbset(ed, ebd).dot(e) < 0 && temp.dotbset(ed, ecd).dot(e) < 0) {
            vec4Pool.push(ea, eb, ec, ed, temp);
            bivecPool.push(eab, ebc, eac, ead, ebd, ecd);
            return [d, e];
        }
        // face
        // normal vectors for 4 cells, be careful with directions
        //  dabc
        let eabc = vec4Pool.pop().wedgevbset(ea, ebc); // -
        let eabd = vec4Pool.pop().wedgevbset(ea, ebd); // +
        let eacd = vec4Pool.pop().wedgevbset(ea, ecd); // -
        let ebcd = vec4Pool.pop().wedgevbset(eb, ecd); // +
        if (temp.wedgevbset(eabc, eab).dot(e) < 0 && temp.wedgevbset(eabd, eab).dot(e) < 0) {
            vec4Pool.push(ea, eb, ec, ed, eabc, eabd, eacd, ebcd, temp);
            bivecPool.push(eab, ebc, eac, ead, ebd, ecd);
            return [a, b, e];
        }
        if (temp.wedgevbset(eabc, eac).dot(e) > 0 && temp.wedgevbset(eacd, eac).dot(e) < 0) {
            vec4Pool.push(ea, eb, ec, ed, eabc, eabd, eacd, ebcd, temp);
            bivecPool.push(eab, ebc, eac, ead, ebd, ecd);
            return [a, c, e];
        }
        if (temp.wedgevbset(eabd, ead).dot(e) > 0 && temp.wedgevbset(eacd, ead).dot(e) > 0) {
            vec4Pool.push(ea, eb, ec, ed, eabc, eabd, eacd, ebcd, temp);
            bivecPool.push(eab, ebc, eac, ead, ebd, ecd);
            return [a, d, e];
        }
        if (temp.wedgevbset(eabc, ebc).dot(e) < 0 && temp.wedgevbset(ebcd, ebc).dot(e) < 0) {
            vec4Pool.push(ea, eb, ec, ed, eabc, eabd, eacd, ebcd, temp);
            bivecPool.push(eab, ebc, eac, ead, ebd, ecd);
            return [b, c, e];
        }
        if (temp.wedgevbset(eabd, ebd).dot(e) < 0 && temp.wedgevbset(ebcd, ebd).dot(e) > 0) {
            vec4Pool.push(ea, eb, ec, ed, eabc, eabd, eacd, ebcd, temp);
            bivecPool.push(eab, ebc, eac, ead, ebd, ecd);
            return [b, d, e];
        }
        if (temp.wedgevbset(eacd, ecd).dot(e) < 0 && temp.wedgevbset(ebcd, ecd).dot(e) < 0) {
            vec4Pool.push(ea, eb, ec, ed, eabc, eabd, eacd, ebcd, temp);
            bivecPool.push(eab, ebc, eac, ead, ebd, ecd);
            return [c, d, e];
        }
        vec4Pool.push(ea, eb, ec, ed, temp);
        bivecPool.push(eab, ebc, eac, ead, ebd, ecd);
        // cell
        // turn all face normals outside
        if (reverseOrder) {
            eabd.negs();
            ebcd.negs();
        }
        else {
            eabc.negs();
            eacd.negs();
        }
        if (eabc.dot(e) < 0) {
            vec4Pool.push(eabc, eabd, eacd, ebcd);
            return [a, b, c, e];
        }
        if (eabd.dot(e) < 0) {
            vec4Pool.push(eabc, eabd, eacd, ebcd);
            return [a, b, d, e];
        }
        if (eacd.dot(e) < 0) {
            vec4Pool.push(eabc, eabd, eacd, ebcd);
            return [a, c, d, e];
        }
        if (ebcd.dot(e) < 0) {
            vec4Pool.push(eabc, eabd, eacd, ebcd);
            return [b, c, d, e];
        }
        // otherwise origin is inside, return data for epa algorithm
        return { reverseOrder, normals: [ebcd, eacd, eabd, eabc] };
    }
    function gjkOutDistance(convex, initSimplex) {
        if (!initSimplex) {
            initSimplex = [convex[0]];
        }
        // datas for states
        let steps = 0;
        let s = initSimplex;
        let reverseOrder5; // only used when s.length == 5 (store 5-simplex orientation)
        // temp vars:
        let p;
        let pn;
        // let steps = [];
        while (steps++ < maxGjkStep) {
            // steps.push(s.length);
            switch (s.length) {
                case 1:
                    // steps.push(s[0].norm());//dbg
                    p = supportNeg(convex, s[0]);
                    if (p === s[0]) {
                        return {
                            simplex: s,
                            normal: vec4Pool.pop().copy(s[0]).negs(),
                            distance: s[0].norm()
                        };
                    }
                    s.push(p); //keep s[0] older
                    break;
                case 2:
                    pn = getClosestPointOrNormal2(s[0], s[1]);
                    // ignore far point and go on with single point
                    if (pn === s[1]) {
                        s[0] = s[1];
                        s.pop();
                        continue;
                    }
                    // degenerated case: exact contact simplex
                    if (pn.norm1() === 0) {
                        return {};
                    }
                    // steps.push(-pn.clone().norms().dot(s[0]));//dbg
                    p = support(convex, pn);
                    // simplex can't move on, terminate
                    if (p === s[0] || p === s[1]) {
                        return { simplex: s, normal: pn.norms(), distance: -s[0].dot(pn) };
                    }
                    pn.pushPool();
                    s.push(p);
                    break;
                case 3:
                    pn = getClosestPointOrNormal3(s[0], s[1], s[2]);
                    if (pn.length) {
                        // ignore far points and go on with fewer points
                        s = pn;
                        continue;
                    }
                    // degenerated case: exact contact simplex
                    if (pn.norm1() === 0) {
                        return {};
                    }
                    // steps.push(-(pn as Vec4).clone().norms().dot(s[0]));//dbg
                    p = support(convex, pn);
                    // simplex can't move on, terminate
                    if (p === s[0] || p === s[1] || p === s[2]) {
                        return { simplex: s, normal: pn.norms(), distance: -s[0].dot(pn) };
                    }
                    pn.pushPool();
                    s.push(p);
                    break;
                case 4:
                    pn = getClosestPointOrNormal4(s[0], s[1], s[2], s[3]);
                    if (pn.length) {
                        // ignore far points and go on with fewer points
                        s = pn;
                        continue;
                    }
                    let normal = pn;
                    let dotFactor = -normal.dot(s[0]);
                    reverseOrder5 = dotFactor > 0; // if true, normal obtained by da^db^dc towards origin
                    normal.mulfs(dotFactor); // use mul to detect nomal or dotFactor is zero
                    // degenerated case: exact contact simplex
                    if (normal.norm1() === 0) {
                        return {};
                    }
                    // steps.push(-(pn as Vec4).clone().norms().dot(s[0]));//dbg
                    p = support(convex, normal);
                    // simplex can't move on, terminate
                    if (p === s[0] || p === s[1] || p === s[2] || p === s[3]) {
                        return { simplex: s, normal: normal.norms(), distance: -normal.dot(s[0]) };
                    }
                    normal.pushPool();
                    s.push(p);
                    break;
                case 5:
                    // we won't go to 5th dimension, so no normal to find anymore
                    pn = getClosestPoint5(s[0], s[1], s[2], s[3], s[4], reverseOrder5);
                    if (pn.length) {
                        // ignore far points and go on with fewer points
                        s = pn;
                        continue;
                    }
                    else {
                        // interior of simplex, stop
                        let info = pn;
                        let out = { simplex: s, reverseOrder: info.reverseOrder, normals: info.normals };
                        return out;
                    }
                default: console.assert(false, "simplex points error");
            }
        }
        console.warn("Physics engin's GJK algorithm has been interupped by too many steps.");
        return {};
    }
    /** test convex1 - convex2 to origin */
    function gjkDiffTest(convex1, convex2, initSimplex1, initSimplex2) {
        if (!initSimplex1) {
            initSimplex1 = [convex1[0]];
        }
        if (!initSimplex2) {
            initSimplex2 = [convex2[0]];
        }
        // datas for states
        let s1 = initSimplex1;
        let s2 = initSimplex2;
        let reverseOrder5;
        // temp vars:
        let p1;
        let p2;
        let normal;
        let _vec4 = vec4Pool.pop();
        // while (true) {
        // switch (s1.length) {
        // case 1:
        [p1, p2] = supportDiffTest(convex1, convex2, _vec4.subset(s2[0], s1[0]));
        if (!p1 || (p1 === s1[0] && p2 === s2[0])) {
            return {};
        }
        s1.push(p1);
        s2.push(p2);
        //     break;
        // case 2:
        normal = getDiffNormal2(s1[0], s1[1], s2[0], s2[1]);
        if (normal.norm1() === 0) {
            return {};
        }
        [p1, p2] = supportDiffTest(convex1, convex2, normal);
        // simplex can't move on, terminate
        if (!p1 || (p1 === s1[0] && p2 === s2[0]) || (p1 === s1[1] && p2 === s2[1])) {
            return {};
        }
        normal.pushPool();
        s1.push(p1);
        s2.push(p2);
        //     break;
        // case 3:
        normal = getDiffNormal3(s1[0], s1[1], s1[2], s2[0], s2[1], s2[2]);
        if (normal.norm1() === 0) {
            return {};
        }
        [p1, p2] = supportDiffTest(convex1, convex2, normal);
        // simplex can't move on, terminate
        if (!p1 || (p1 === s1[0] && p2 === s2[0]) || (p1 === s1[1] && p2 === s2[1]) || (p1 === s1[2] && p2 === s2[2])) {
            return {};
        }
        normal.pushPool();
        s1.push(p1);
        s2.push(p2);
        //     break;
        // case 4:
        normal = getDiffNormal4(s1[0], s1[1], s1[2], s1[3], s2[0], s2[1], s2[2], s2[3]);
        let originDir = vec4Pool.pop().subset(s1[0], s2[0]);
        let dotFactor = -normal.dot(originDir);
        originDir.pushPool();
        normal.mulfs(dotFactor); // use mul to detect nomal or dotFactor is zero
        if (normal.norm1() === 0) {
            return {};
        }
        reverseOrder5 = dotFactor > 0;
        [p1, p2] = supportDiffTest(convex1, convex2, normal);
        // simplex can't move on, terminate
        if (!p1 || (p1 === s1[0] && p2 === s2[0]) || (p1 === s1[1] && p2 === s2[1]) || (p1 === s1[2] && p2 === s2[2]) || (p1 === s1[3] && p2 === s2[3])) {
            return {};
        }
        normal.pushPool();
        s1.push(p1);
        s2.push(p2);
        while (true) {
            let res = getDiffNormal5(s1[0], s1[1], s1[2], s1[3], s1[4], s2[0], s2[1], s2[2], s2[3], s2[4], reverseOrder5);
            if (!res.normal) {
                // interior, pass data to epadiff
                return { simplex1: s1, simplex2: s2, normals: res.normals, reverseOrder: res.reverseOrder };
            }
            reverseOrder5 = res.reverseOrder;
            [p1, p2] = supportDiffTest(convex1, convex2, res.normal);
            // simplex can't move on, terminate
            if (!p1 || (p1 === s1[0] && p2 === s2[0]) || (p1 === s1[1] && p2 === s2[1]) || (p1 === s1[2] && p2 === s2[2]) || (p1 === s1[3] && p2 === s2[3]) || (p1 === s1[4] && p2 === s2[4])) {
                return {};
            }
            s1 = res.simplex1;
            s1.push(p1);
            s2 = res.simplex2;
            s2.push(p2);
        }
    }
    function getDiffNormal2(a1, b1, a2, b2) {
        let a = vec4Pool.pop().subset(a1, a2);
        let b = vec4Pool.pop().subset(b1, b2);
        let adb = a.dot(b);
        let la = b.normsqr() - adb;
        let lb = a.normsqr() - adb;
        let out = vec4Pool.pop().set().addmulfs(a, -la).addmulfs(b, -lb);
        vec4Pool.push(a, b);
        return out;
    }
    function getDiffNormal3(a1, b1, c1, a2, b2, c2) {
        let a = vec4Pool.pop().subset(a1, a2);
        let b = vec4Pool.pop().subset(b1, b2);
        let c = vec4Pool.pop().subset(c1, c2);
        let ca = vec4Pool.pop().subset(a, c);
        let cb = vec4Pool.pop().subset(b, c);
        let biv = bivecPool.pop().wedgevvset(ca, cb);
        let out = ca;
        out.wedgevbset(a, biv).wedgevbset(out, biv);
        vec4Pool.push(a, b, c, cb);
        biv.pushPool();
        return out;
    }
    function getDiffNormal4(a1, b1, c1, d1, a2, b2, c2, d2) {
        let a = vec4Pool.pop().subset(a1, a2);
        let b = vec4Pool.pop().subset(b1, b2);
        let c = vec4Pool.pop().subset(c1, c2);
        let d = vec4Pool.pop().subset(d1, d2);
        let da = vec4Pool.pop().subset(a, d);
        let db = vec4Pool.pop().subset(b, d);
        let dc = vec4Pool.pop().subset(c, d);
        let dbc = bivecPool.pop().wedgevvset(db, dc);
        let dabc = vec4Pool.pop().wedgevbset(da, dbc);
        dbc.pushPool();
        vec4Pool.push(a, b, c, d, da, db, dc);
        return dabc;
    }
    function getDiffNormal5(a1, b1, c1, d1, e1, a2, b2, c2, d2, e2, reverseOrder) {
        let a = vec4Pool.pop().subset(a1, a2);
        let b = vec4Pool.pop().subset(b1, b2);
        let c = vec4Pool.pop().subset(c1, c2);
        let d = vec4Pool.pop().subset(d1, d2);
        let e = vec4Pool.pop().subset(e1, e2);
        let ea = vec4Pool.pop().subset(a, e);
        let eb = vec4Pool.pop().subset(b, e);
        let ec = vec4Pool.pop().subset(c, e);
        let ed = vec4Pool.pop().subset(d, e);
        let ebc = bivecPool.pop().wedgevvset(eb, ec);
        let ebd = bivecPool.pop().wedgevvset(eb, ed);
        let ecd = bivecPool.pop().wedgevvset(ec, ed);
        let eabc = vec4Pool.pop().wedgevbset(ea, ebc); // -
        let eabd = vec4Pool.pop().wedgevbset(ea, ebd); // +
        let eacd = vec4Pool.pop().wedgevbset(ea, ecd); // -
        let ebcd = vec4Pool.pop().wedgevbset(eb, ecd); // +
        if (reverseOrder) {
            eabd.negs();
            ebcd.negs();
        }
        else {
            eabc.negs();
            eacd.negs();
        }
        if (eabc.dot(e) < 0) {
            vec4Pool.push(eabc, eabd, eacd, ebcd);
            return { simplex1: [a1, b1, c1, e1], simplex2: [a2, b2, c2, e2], normal: eabc, reverseOrder: reverseOrder };
        }
        if (eabd.dot(e) < 0) {
            vec4Pool.push(eabc, eabd, eacd, ebcd);
            return { simplex1: [a1, b1, d1, e1], simplex2: [a2, b2, d2, e2], normal: eabd, reverseOrder: !reverseOrder };
        }
        if (eacd.dot(e) < 0) {
            vec4Pool.push(eabc, eabd, eacd, ebcd);
            return { simplex1: [a1, c1, d1, e1], simplex2: [a2, c2, d2, e2], normal: eacd, reverseOrder: reverseOrder };
        }
        if (ebcd.dot(e) < 0) {
            vec4Pool.push(eabc, eabd, eacd, ebcd);
            return { simplex1: [b1, c1, d1, e1], simplex2: [b2, c2, d2, e2], normal: ebcd, reverseOrder: !reverseOrder };
        }
        bivecPool.push(ebc, ebd, ecd);
        vec4Pool.push(a, b, c, d, e, ea, eb, ec, ed);
        // otherwise origin is inside, return data for epa algorithm
        return { reverseOrder, normals: [ebcd, eacd, eabd, eabc] };
    }
    /** expanding polytope algorithm for minkovsky difference */
    function epaDiff(convex1, convex2, initCondition) {
        let s1 = initCondition.simplex1;
        let s2 = initCondition.simplex2;
        let normals = initCondition.normals;
        if (initCondition.reverseOrder) {
            let temp = s1[0];
            s1[0] = s1[1];
            s1[1] = temp;
            temp = s2[0];
            s2[0] = s2[1];
            s2[1] = temp;
            let temp2 = normals[0];
            normals[0] = normals[1];
            normals[1] = temp2;
        }
        if (normals.length === 4) {
            let da = vec4Pool.pop().subset(s1[0], s1[3]).subs(s2[0]).adds(s2[3]);
            let db = vec4Pool.pop().subset(s1[1], s1[3]).subs(s2[1]).adds(s2[3]);
            let dc = vec4Pool.pop().subset(s1[2], s1[3]).subs(s2[2]).adds(s2[3]);
            let dbc = bivecPool.pop().wedgevvset(db, dc);
            normals.push(vec4Pool.pop().wedgevbset(da, dbc));
            dbc.pushPool();
            vec4Pool.push(da, db, dc);
        }
        // tetrahedral cell list
        let cs1 = [
            [s1[1], s1[2], s1[4], s1[3]],
            [s1[2], s1[0], s1[4], s1[3]],
            [s1[0], s1[1], s1[4], s1[3]],
            [s1[0], s1[2], s1[4], s1[1]],
            [s1[0], s1[1], s1[3], s1[2]],
        ];
        let cs2 = [
            [s2[1], s2[2], s2[4], s2[3]],
            [s2[2], s2[0], s2[4], s2[3]],
            [s2[0], s2[1], s2[4], s2[3]],
            [s2[0], s2[2], s2[4], s2[1]],
            [s2[0], s2[1], s2[3], s2[2]],
        ];
        // normal list
        let ns = normals;
        // distance list
        let ds = [];
        let mind = Infinity;
        let minid;
        let pa = vec4Pool.pop();
        let pb = vec4Pool.pop();
        let pc = vec4Pool.pop();
        let p12 = vec4Pool.pop();
        let pab = bivecPool.pop();
        for (let i = 0; i < 5; i++) {
            ns[i].norms();
            let val = ns[i].dot(pa.subset(cs1[i][0], cs2[i][0]));
            ds.push(val);
            console.assert(val > 0, "wrong init orientation");
            if (val < mind) {
                minid = i;
                mind = val;
            }
        }
        let steps = 0;
        while (steps++ < maxEpaStep) {
            let cell1 = cs1[minid];
            let cell2 = cs2[minid];
            let [p1, p2] = supportDiff(convex1, convex2, ns[minid]);
            p12.subset(p1, p2);
            if (ns[minid].dot(p12) <= mind ||
                (p1 === cell1[0] && p2 === cell2[0]) ||
                (p1 === cell1[1] && p2 === cell2[1]) ||
                (p1 === cell1[2] && p2 === cell2[2]) ||
                (p1 === cell1[3] && p2 === cell2[3])) {
                // can't move on, found
                for (let n of ns) {
                    if (n !== ns[minid])
                        n.pushPool();
                }
                vec4Pool.push(pa, pb, pc);
                bivecPool.push(pab);
                // console.log(`Step: ${steps}`);
                return { simplex1: cell1, simplex2: cell2, distance: -mind, normal: ns[minid] };
            }
            mind = Infinity;
            // construct new convexhull after adding point p
            let newcs1 = [];
            let newcs2 = [];
            let newns = [];
            let newds = [];
            // borderformat [a1,a2,a3, b1,b2,b3], order is for orientation
            // a, b are convex A's points a - convex B's points b
            // mark a1 null if duplicate need to remove, 
            let border = [];
            function checkBorder(a1, b1, c1, a2, b2, c2) {
                for (let i of border) {
                    if ((i[0] === a1 && i[3] === a2 && i[1] === c1 && i[4] === c2 && i[5] === b2 && i[2] === b1) ||
                        (i[0] === b1 && i[3] === b2 && i[1] === a1 && i[4] === a2 && i[5] === c2 && i[2] === c1) ||
                        (i[0] === c1 && i[3] === c2 && i[1] === b1 && i[4] === b2 && i[5] === a2 && i[2] === a1)) {
                        i[0] = undefined;
                        return;
                    }
                }
                border.push([a1, b1, c1, a2, b2, c2]);
            }
            for (let idx = 0, csl = cs1.length; idx < csl; idx++) {
                let cell1 = cs1[idx];
                let cell2 = cs2[idx];
                let a1 = cell1[0];
                let a2 = cell2[0];
                let b1 = cell1[1];
                let b2 = cell2[1];
                let c1 = cell1[2];
                let c2 = cell2[2];
                let d1 = cell1[3];
                let d2 = cell2[3];
                let determinant = ns[idx].dot(pa.subset(p12, a1).adds(a2));
                if (determinant > 0) {
                    checkBorder(d1, b1, c1, d2, b2, c2); // +
                    checkBorder(d1, c1, a1, d2, c2, a2); // -
                    checkBorder(d1, a1, b1, d2, a2, b2); // +
                    checkBorder(c1, b1, a1, c2, b2, a2); // -
                }
                else {
                    newcs1.push(cell1);
                    newcs2.push(cell2);
                    newns.push(ns[idx]);
                    newds.push(ds[idx]);
                    if (ds[idx] < mind) {
                        mind = ds[idx];
                        minid = newns.length - 1;
                    }
                }
            }
            for (let b of border) {
                if (!b[0])
                    continue;
                pa.subset(p12, b[0]).adds(b[3]);
                pb.subset(p12, b[1]).adds(b[4]);
                pc.subset(p12, b[2]).adds(b[5]);
                pab.wedgevvset(pa, pb);
                newcs1.push([p1, b[0], b[1], b[2]]);
                newcs2.push([p2, b[3], b[4], b[5]]);
                let n = vec4Pool.pop().wedgevbset(pc, pab).negs().norms();
                let d = n.dot(p12);
                if (d < 0)
                    return;
                // console.assert(d >= 0, "new normal needs negs");
                if (d < mind) {
                    mind = d;
                    minid = newds.length;
                }
                newns.push(n);
                newds.push(d);
            }
            ns = newns;
            cs1 = newcs1;
            cs2 = newcs2;
            ds = newds;
        }
        // console.warn("Physics engin's GJK-EPA algorithm has been interupped by too many steps."); return {};
    }

    // cache
    let _vec4 = new Vec4;
    let _r = new Rotor;
    class NarrowPhase {
        collisionList = [];
        /** max iteration for sdf methods in detectCollision */
        maxIteration = 5;
        clearCollisionList() {
            this.collisionList = [];
        }
        run(list) {
            this.clearCollisionList();
            for (let [a, b] of list) {
                this.detectCollision(a, b);
            }
        }
        detectCollision(rigidA, rigidB) {
            let a = rigidA.geometry, b = rigidB.geometry;
            if (a instanceof rigid.GlomicCavity) {
                if (b instanceof rigid.Glome)
                    return this.detectGlomeGlomiccavity(b, a);
            }
            if (a instanceof rigid.Glome) {
                if (b instanceof rigid.Glome)
                    return this.detectGlomeGlome(a, b);
                if (b instanceof rigid.Plane)
                    return this.detectGlomePlane(a, b);
                if (b instanceof rigid.Convex)
                    return this.detectConvexGlome(b, a);
                if (b instanceof rigid.Spheritorus)
                    return this.detectSpheritorusGlome(b, a);
                if (b instanceof rigid.Torisphere)
                    return this.detectTorisphereGlome(b, a);
                if (b instanceof rigid.Tiger)
                    return this.detectTigerGlome(b, a);
                if (b instanceof rigid.Ditorus)
                    return this.detectDitorusGlome(b, a);
                if (b instanceof rigid.GlomicCavity)
                    return this.detectGlomeGlomiccavity(a, b);
            }
            if (a instanceof rigid.Plane) {
                if (b instanceof rigid.Glome)
                    return this.detectGlomePlane(b, a);
                if (b instanceof rigid.Convex)
                    return this.detectConvexPlane(b, a);
                if (b instanceof rigid.Spheritorus)
                    return this.detectSpheritorusPlane(b, a);
                if (b instanceof rigid.Torisphere)
                    return this.detectTorispherePlane(b, a);
                if (b instanceof rigid.Tiger)
                    return this.detectTigerPlane(b, a);
                if (b instanceof rigid.Ditorus)
                    return this.detectDitorusPlane(b, a);
            }
            if (a instanceof rigid.Convex) {
                if (b instanceof rigid.Plane)
                    return this.detectConvexPlane(a, b);
                if (b instanceof rigid.Glome)
                    return this.detectConvexGlome(a, b);
                if (b instanceof rigid.Convex) {
                    // (arg1,arg2) convert arg2 to arg1's coord
                    if (b.points.length > a.points.length)
                        return this.detectConvexConvex(b, a);
                    return this.detectConvexConvex(a, b);
                }
            }
            if (a instanceof rigid.Spheritorus) {
                if (b instanceof rigid.Spheritorus)
                    return this.detectSpheritorusSpheritorus(a, b);
                if (b instanceof rigid.Torisphere)
                    return this.detectTorisphereSpheritorus(b, a);
                if (b instanceof rigid.Plane)
                    return this.detectSpheritorusPlane(a, b);
                if (b instanceof rigid.Glome)
                    return this.detectSpheritorusGlome(a, b);
                if (b instanceof rigid.Tiger)
                    return this.detectTigerSpheritorus(b, a);
                if (b instanceof rigid.Ditorus)
                    return this.detectDitorusSpheritorus(b, a);
            }
            if (a instanceof rigid.Torisphere) {
                if (b instanceof rigid.Torisphere)
                    return this.detectTorisphereTorisphere(a, b);
                if (b instanceof rigid.Spheritorus)
                    return this.detectTorisphereSpheritorus(a, b);
                if (b instanceof rigid.Plane)
                    return this.detectTorispherePlane(a, b);
                if (b instanceof rigid.Glome)
                    return this.detectTorisphereGlome(a, b);
                if (b instanceof rigid.Tiger)
                    return this.detectTigerTorisphere(b, a);
                if (b instanceof rigid.Ditorus)
                    return this.detectDitorusTorisphere(b, a);
            }
            if (a instanceof rigid.Tiger) {
                if (b instanceof rigid.Tiger)
                    return this.detectTigerTiger(a, b);
                if (b instanceof rigid.Spheritorus)
                    return this.detectTigerSpheritorus(a, b);
                if (b instanceof rigid.Torisphere)
                    return this.detectTigerTorisphere(a, b);
                if (b instanceof rigid.Ditorus)
                    return this.detectDitorusTiger(b, a);
                if (b instanceof rigid.Plane)
                    return this.detectTigerPlane(a, b);
                if (b instanceof rigid.Glome)
                    return this.detectTigerGlome(a, b);
            }
            if (a instanceof rigid.Ditorus) {
                if (b instanceof rigid.Plane)
                    return this.detectDitorusPlane(a, b);
                if (b instanceof rigid.Glome)
                    return this.detectDitorusGlome(a, b);
                if (b instanceof rigid.Spheritorus)
                    return this.detectDitorusSpheritorus(a, b);
                if (b instanceof rigid.Torisphere)
                    return this.detectDitorusTorisphere(a, b);
                if (b instanceof rigid.Tiger)
                    return this.detectDitorusTiger(a, b);
                if (b instanceof rigid.Ditorus)
                    return this.detectDitorusDitorus(a, b);
            }
        }
        detectGlomeGlome(a, b) {
            _vec4.subset(b.rigid.position, a.rigid.position);
            let d = _vec4.norm();
            let depth = a.radius + b.radius - d;
            if (depth < 0)
                return null;
            // todo: check whether clone can be removed
            let normal = _vec4.divfs(d).clone();
            let point;
            if (a.radius === b.radius) {
                point = a.rigid.position.clone().adds(b.rigid.position).mulfs(0.5);
            }
            else {
                const totalinv = 1 / (a.radius + b.radius);
                point = a.rigid.position.mulf(totalinv * b.radius).addmulfs(b.rigid.position, totalinv * a.radius);
            }
            this.collisionList.push({ point, normal, depth, a: a.rigid, b: b.rigid });
        }
        detectGlomeGlomiccavity(a, b) {
            _vec4.subset(b.rigid.position, a.rigid.position);
            let d = _vec4.norm();
            let depth = a.radius - b.radius + d;
            if (depth < 0)
                return null;
            // todo: check whether clone can be removed
            let normal = _vec4.divf(-d);
            let point = b.rigid.position.clone().addmulfs(normal, b.radius + depth / 2);
            this.collisionList.push({ point, normal, depth, a: a.rigid, b: b.rigid });
        }
        detectGlomePlane(a, b) {
            let depth = a.radius - (a.rigid.position.dot(b.normal) - b.offset);
            if (depth < 0)
                return null;
            let point = a.rigid.position.clone().addmulfs(b.normal, depth * 0.5 - a.radius);
            this.collisionList.push({ point, normal: b.normal.neg(), depth, a: a.rigid, b: b.rigid });
        }
        detectConvexPlane(a, b) {
            // convert plane to convex's coord
            let normal = _vec4.copy(b.normal).rotatesconj(a.rigid.rotation);
            let offset = a.rigid.position.dot(b.normal) - b.offset;
            for (let v of a.points) {
                let depth = -(v.dot(normal) + offset);
                if (depth < 0)
                    continue;
                let point = v.clone().rotates(a.rigid.rotation).adds(a.rigid.position).addmulfs(b.normal, depth / 2);
                this.collisionList.push({ point, normal: b.normal.neg(), depth, a: a.rigid, b: b.rigid });
            }
        }
        detectConvexGlome(a, b) {
            _vec4.subset(b.rigid.position, a.rigid.position).rotatesconj(a.rigid.rotation);
            if (a._cachePoints) {
                for (let p = 0, l = a.points.length; p < l; p++) {
                    a._cachePoints[p].subset(a.points[p], _vec4);
                }
            }
            else {
                a._cachePoints = a.points.map(p => vec4Pool.pop().subset(p, _vec4));
            }
            let result = gjkOutDistance(a._cachePoints);
            if (result.normal && result.distance) {
                let depth = b.radius - result.distance;
                if (depth < 0)
                    return;
                result.normal.rotates(a.rigid.rotation);
                let point = vec4Pool.pop().copy(b.rigid.position).addmulfs(result.normal, -(b.radius + result.distance) * 0.5);
                this.collisionList.push({ point, normal: result.normal, depth, a: a.rigid, b: b.rigid });
            }
            // todo: EPA
        }
        detectConvexConvex(a, b) {
            // calculate in a's frame
            _vec4.subset(b.rigid.position, a.rigid.position).rotatesconj(a.rigid.rotation);
            _r.copy(b.rigid.rotation).mulslconj(a.rigid.rotation);
            if (!isFinite(_vec4.norm1() + _r.l.norm() + _r.r.norm())) {
                console.assert(isFinite(_vec4.norm1() + _r.l.norm() + _r.r.norm()), "oxoor");
            }
            if (b._cachePoints) {
                for (let p = 0, l = b.points.length; p < l; p++) {
                    b._cachePoints[p].copy(b.points[p]).rotates(_r).adds(_vec4);
                }
            }
            else {
                b._cachePoints = b.points.map(p => vec4Pool.pop().copy(p).rotates(_r).adds(_vec4));
            }
            // gjk intersection test
            let inter = gjkDiffTest(a.points, b._cachePoints);
            if (!inter.normals)
                return;
            // epa collision generation
            let result = epaDiff(a.points, b._cachePoints, inter);
            if (result?.normal) {
                let depth = -result.distance;
                let [a1, b1, c1, d1] = result.simplex1;
                let [a2, b2, c2, d2] = result.simplex2;
                let point = vec4Pool.pop();
                if (a1 === b1 && a1 === c1 && a1 === d1) {
                    // vertex - ?
                    point.copy(a1).addmulfs(result.normal, result.distance * 0.5);
                }
                else if (a2 === b2 && a2 === c2 && a2 === d2) {
                    // ? - vertex
                    point.copy(a2).addmulfs(result.normal, -result.distance * 0.5);
                }
                else {
                    let A = [], B = [];
                    for (let i of result.simplex1)
                        if (A.indexOf(i) === -1)
                            A.push(i);
                    for (let i of result.simplex2)
                        if (B.indexOf(i) === -1)
                            B.push(i);
                    if ((A.length === 2 && B.length === 3) || (B.length === 2 && A.length === 3)) {
                        // edge - face || face - edge
                        let deltaD = result.distance * 0.5;
                        if (B.length === 2) {
                            let temp = A;
                            A = B;
                            B = temp;
                            deltaD = -deltaD;
                        }
                        let p1a = _vec4.subset(B[0], A[0]);
                        let p1p2 = vec4Pool.pop().subset(A[1], A[0]);
                        let ab = vec4Pool.pop().subset(B[1], B[0]);
                        let ac = vec4Pool.pop().subset(B[2], B[0]);
                        let _a1 = p1p2.dot(p1a), _b1 = p1p2.dot(ab), _c1 = p1p2.dot(ac), _d1 = p1p2.dot(p1p2);
                        let _a2 = ab.dot(p1a), _b2 = ab.dot(ab), _c2 = ab.dot(ac), _d2 = _b1;
                        let _a3 = ac.dot(p1a), _b3 = _c2, _c3 = ac.dot(ac), _d3 = _c1;
                        let det = (_b3 * _c2 - _b2 * _c3) * _d1 + (-_b3 * _c1 + _b1 * _c3) * _d2 + (_b2 * _c1 - _b1 * _c2) * _d3;
                        if (det === 0)
                            return;
                        let detInv = 1 / det;
                        let s = ((_a3 * _b2 - _a2 * _b3) * _c1 + (-_a3 * _b1 + _a1 * _b3) * _c2 + (_a2 * _b1 - _a1 * _b2) * _c3) * detInv;
                        point.copy(A[0]).addmulfs(p1p2, s).addmulfs(result.normal, deltaD);
                    }
                }
                // if (!isFinite(point.norm1() + result.normal.norm1() + depth)) { console.warn("wrong convex collision numeric result"); return; }
                this.collisionList.push({
                    point: point.rotates(a.rigid.rotation).adds(a.rigid.position),
                    normal: result.normal.rotates(a.rigid.rotation),
                    depth, a: a.rigid, b: b.rigid
                });
            }
        }
        detectSpheritorusPlane(a, b) {
            // convert plane to st's coord
            let normal = _vec4.copy(b.normal).rotatesconj(a.rigid.rotation);
            let offset = a.rigid.position.dot(b.normal) - b.offset;
            let len = Math.hypot(normal.x, normal.w);
            let depth = a.minorRadius - offset + len * a.majorRadius;
            if (depth < 0)
                return;
            // find support of circle along normal
            if (normal.x === 0 && normal.w === 0) {
                // deal perpendicular case: reduce contact to bottom center point
                let point = a.rigid.position.clone().addmulfs(b.normal, (a.minorRadius + offset) * 0.5);
                this.collisionList.push({ point, normal: b.normal.neg(), depth, a: a.rigid, b: b.rigid });
            }
            else {
                // point on circle
                let point = new Vec4(normal.x, 0, 0, normal.w).mulfs(-a.majorRadius / len);
                // then to world coord and add normal
                point.rotates(a.rigid.rotation).adds(a.rigid.position).addmulfs(b.normal, depth * 0.5 - a.minorRadius);
                this.collisionList.push({ point, normal: b.normal.neg(), depth, a: a.rigid, b: b.rigid });
            }
        }
        detectSpheritorusGlome(a, b) {
            // convert glome to st's coord
            let p = _vec4.subset(b.rigid.position, a.rigid.position).rotatesconj(a.rigid.rotation);
            let xw = p.x * p.x + p.w * p.w;
            let yz = p.y * p.y + p.z * p.z;
            let sqrtxw = Math.sqrt(xw);
            let distance = Math.sqrt(a.majorRadius * a.majorRadius + xw + yz - 2 * sqrtxw * a.majorRadius);
            let depth = a.minorRadius + b.radius - distance;
            if (depth < 0)
                return;
            // find support of circle along normal
            if (xw === 0) {
                // deal perpendicular case: reduce contact to center point
                let k = 1.0 - (b.radius - depth * 0.5) / distance;
                let point = new Vec4(0, k * p.y, k * p.z).rotates(a.rigid.rotation);
                let normal = point.clone().norms();
                point.adds(a.rigid.position);
                this.collisionList.push({ point, normal, depth: depth / Math.sqrt(yz) * distance, a: a.rigid, b: b.rigid });
            }
            else {
                let k = a.majorRadius / sqrtxw;
                let point = new Vec4(p.x * k, 0, 0, p.w * k).rotates(a.rigid.rotation);
                let normal = point.adds(a.rigid.position).sub(b.rigid.position).norms().negs();
                point.addmulfs(normal, a.minorRadius - depth * 0.5);
                this.collisionList.push({ point, normal, depth, a: a.rigid, b: b.rigid });
            }
        }
        detectSpheritorusSpheritorus(a, b) {
            // position and rotation are b in a's frame 
            let position = _vec4.subset(b.rigid.position, a.rigid.position).rotatesconj(a.rigid.rotation);
            let rotation = _r.copy(b.rigid.rotation).mulslconj(a.rigid.rotation);
            let tempa = b.majorRadius * 0.5;
            let tempb = b.majorRadius * _COS30;
            // choose 3 initial points (120 degree) on b for iteration
            let initialPB = [
                vec4Pool.pop().set(tempa, 0, 0, tempb),
                vec4Pool.pop().set(tempa, 0, 0, -tempb),
                vec4Pool.pop().set(-b.majorRadius)
            ];
            let newP = vec4Pool.pop();
            let prevPInA = vec4Pool.pop();
            let epsilon = Math.min(a.minorRadius, b.minorRadius) * 0.01;
            for (let p of initialPB) {
                // newP and p are in b
                newP.copy(p);
                let needContinue = false;
                for (let iterationCount = 0; iterationCount < this.maxIteration; iterationCount++) {
                    // from b to a
                    newP.rotates(rotation).adds(position);
                    let k = a.majorRadius / Math.hypot(newP.x, newP.w);
                    if (!isFinite(k)) {
                        needContinue = true;
                        break;
                    }
                    // project to a
                    newP.set(newP.x * k, 0, 0, newP.w * k);
                    prevPInA.copy(newP);
                    // from a to b
                    newP.subs(position).rotatesconj(rotation);
                    k = b.majorRadius / Math.hypot(newP.x, newP.w);
                    if (!isFinite(k)) {
                        needContinue = true;
                        break;
                    }
                    // project to b
                    newP.set(newP.x * k, 0, 0, newP.w * k);
                    // test if iteration still moves
                    let dx = Math.abs(newP.x - p.x);
                    let dw = Math.abs(newP.w - p.w);
                    p.copy(newP);
                    if (dx + dw < epsilon) {
                        break;
                    }
                }
                if (needContinue)
                    continue;
                // else there might be collision
                // transform newP to a, then compare newP and prevPInA
                newP.rotates(rotation).adds(position);
                let normal = newP.sub(prevPInA);
                let depth = a.minorRadius + b.minorRadius - normal.norm();
                if (depth < 0)
                    continue;
                // console.log(converge);
                normal.rotates(a.rigid.rotation).norms();
                let point = newP.rotate(a.rigid.rotation).adds(a.rigid.position);
                point.addmulfs(normal, -b.minorRadius + depth * 0.5);
                this.collisionList.push({
                    normal, point, depth, a: a.rigid, b: b.rigid
                });
            }
            vec4Pool.push(...initialPB);
        }
        detectTorispherePlane(a, b) {
            // convert plane to ts's coord
            let normal = _vec4.copy(b.normal).rotatesconj(a.rigid.rotation);
            let offset = a.rigid.position.dot(b.normal) - b.offset;
            let len = Math.hypot(normal.x, normal.z, normal.w);
            let depth = a.minorRadius - offset + len * a.majorRadius;
            if (depth < 0)
                return;
            // find support of circle along normal
            if (normal.x === 0 && normal.w === 0 && normal.z === 0) {
                // deal perpendicular case: reduce contact to bottom center point
                let point = a.rigid.position.clone().addmulfs(b.normal, (a.minorRadius + offset) * 0.5);
                this.collisionList.push({ point, normal: b.normal.neg(), depth, a: a.rigid, b: b.rigid });
            }
            else {
                // point on sphere
                let point = new Vec4(normal.x, 0, normal.z, normal.w).mulfs(-a.majorRadius / len);
                // then to world coord and add normal
                point.rotates(a.rigid.rotation).adds(a.rigid.position).addmulfs(b.normal, depth * 0.5 - a.minorRadius);
                this.collisionList.push({ point, normal: b.normal.neg(), depth, a: a.rigid, b: b.rigid });
            }
        }
        detectTorisphereGlome(a, b) {
            // convert glome to st's coord
            let p = _vec4.subset(b.rigid.position, a.rigid.position).rotatesconj(a.rigid.rotation);
            let xzw = p.x * p.x + p.z * p.z + p.w * p.w;
            let y = p.y * p.y;
            let sqrtxzw = Math.sqrt(xzw);
            let distance = Math.sqrt(a.majorRadius * a.majorRadius + xzw + y - 2 * sqrtxzw * a.majorRadius);
            let depth = a.minorRadius + b.radius - distance;
            if (depth < 0)
                return;
            // find support of circle along normal
            if (xzw === 0) {
                // deal perpendicular case: reduce contact to center point
                let k = 1.0 - (b.radius - depth * 0.5) / distance;
                let point = new Vec4(0, k * p.y).rotates(a.rigid.rotation);
                let normal = point.clone().norms();
                point.adds(a.rigid.position);
                this.collisionList.push({ point, normal, depth: depth / Math.abs(p.y) * distance, a: a.rigid, b: b.rigid });
            }
            else {
                let k = a.majorRadius / sqrtxzw;
                let point = new Vec4(p.x * k, 0, p.z * k, p.w * k).rotates(a.rigid.rotation);
                let normal = point.adds(a.rigid.position).sub(b.rigid.position).norms().negs();
                point.addmulfs(normal, a.minorRadius - depth * 0.5);
                this.collisionList.push({ point, normal, depth, a: a.rigid, b: b.rigid });
            }
        }
        detectTorisphereTorisphere(a, b) {
            // position and rotation are b in a's frame 
            let position = _vec4.subset(b.rigid.position, a.rigid.position).rotatesconj(a.rigid.rotation);
            let rotation = _r.copy(b.rigid.rotation).mulslconj(a.rigid.rotation);
            let temp = b.majorRadius * _TAN30;
            // choose 4 initial points (regular tetrahedron) on b for iteration
            let initialPB = [
                vec4Pool.pop().set(temp, 0, temp, temp),
                vec4Pool.pop().set(-temp, 0, -temp, temp),
                vec4Pool.pop().set(-temp, 0, temp, -temp),
                vec4Pool.pop().set(temp, 0, -temp, -temp),
            ];
            let newP = vec4Pool.pop();
            let prevPInA = vec4Pool.pop();
            let epsilon = Math.min(a.minorRadius, b.minorRadius) * 0.01;
            for (let p of initialPB) {
                // newP and p are in b
                newP.copy(p);
                for (let iterationCount = 0; iterationCount < this.maxIteration; iterationCount++) {
                    // from b to a
                    newP.rotates(rotation).adds(position);
                    let k = a.majorRadius / Math.hypot(newP.x, newP.z, newP.w);
                    if (!isFinite(k))
                        break;
                    // project to a
                    newP.set(newP.x * k, 0, newP.z * k, newP.w * k);
                    prevPInA.copy(newP);
                    // from a to b
                    newP.subs(position).rotatesconj(rotation);
                    k = b.majorRadius / Math.hypot(newP.x, newP.z, newP.w);
                    if (!isFinite(k))
                        break;
                    // project to b
                    newP.set(newP.x * k, 0, newP.z * k, newP.w * k);
                    // test if iteration still moves
                    let dx = Math.abs(newP.x - p.x);
                    let dz = Math.abs(newP.z - p.z);
                    let dw = Math.abs(newP.w - p.w);
                    p.copy(newP);
                    if (dx + dz + dw < epsilon)
                        break;
                }
                // console.log(converge);
                // else there might be collision
                // transform newP to a, then compare newP and prevPInA
                newP.rotates(rotation).adds(position);
                let normal = newP.sub(prevPInA);
                let depth = a.minorRadius + b.minorRadius - normal.norm();
                if (depth < 0)
                    continue;
                normal.rotates(a.rigid.rotation).norms();
                let point = newP.rotate(a.rigid.rotation).adds(a.rigid.position);
                point.addmulfs(normal, -b.minorRadius + depth * 0.5);
                this.collisionList.push({
                    normal, point, depth, a: a.rigid, b: b.rigid
                });
            }
        }
        detectTorisphereSpheritorus(a, b) {
            // position and rotation are b in a's frame 
            let position = _vec4.subset(b.rigid.position, a.rigid.position).rotatesconj(a.rigid.rotation);
            let rotation = _r.copy(b.rigid.rotation).mulslconj(a.rigid.rotation);
            let tempa = b.majorRadius * 0.5;
            let tempb = b.majorRadius * _COS30;
            // choose 3 initial points (120 degree) on b for iteration
            let initialPB = [
                vec4Pool.pop().set(tempa, 0, 0, tempb),
                vec4Pool.pop().set(tempa, 0, 0, -tempb),
                vec4Pool.pop().set(-b.majorRadius)
            ];
            let newP = vec4Pool.pop();
            let prevPInA = vec4Pool.pop();
            let epsilon = Math.min(a.minorRadius, b.minorRadius) * 0.01;
            for (let p of initialPB) {
                // newP and p are in b
                newP.copy(p);
                for (let iterationCount = 0; iterationCount < this.maxIteration; iterationCount++) {
                    // from b to a
                    newP.rotates(rotation).adds(position);
                    let k = a.majorRadius / Math.hypot(newP.x, newP.z, newP.w);
                    if (!isFinite(k))
                        break;
                    // project to a
                    newP.set(newP.x * k, 0, newP.z * k, newP.w * k);
                    prevPInA.copy(newP);
                    // from a to b
                    newP.subs(position).rotatesconj(rotation);
                    k = b.majorRadius / Math.hypot(newP.x, newP.w);
                    if (!isFinite(k))
                        break;
                    // project to b
                    newP.set(newP.x * k, 0, 0, newP.w * k);
                    // test if iteration still moves
                    let dx = Math.abs(newP.x - p.x);
                    let dw = Math.abs(newP.w - p.w);
                    p.copy(newP);
                    if (dx + dw < epsilon)
                        break;
                }
                // else there might be collision
                // transform newP to a, then compare newP and prevPInA
                newP.rotates(rotation).adds(position);
                let normal = newP.sub(prevPInA);
                let depth = a.minorRadius + b.minorRadius - normal.norm();
                if (depth < 0)
                    continue;
                normal.rotates(a.rigid.rotation).norms();
                let point = newP.rotate(a.rigid.rotation).adds(a.rigid.position);
                point.addmulfs(normal, -b.minorRadius + depth * 0.5);
                this.collisionList.push({
                    normal, point, depth, a: a.rigid, b: b.rigid
                });
            }
        }
        detectTigerPlane(a, b) {
            // convert plane to ts's coord
            let normal = _vec4.copy(b.normal).rotatesconj(a.rigid.rotation);
            let offset = a.rigid.position.dot(b.normal) - b.offset;
            let len1 = Math.hypot(normal.x, normal.y);
            let len2 = Math.hypot(normal.z, normal.w);
            let depth = a.minorRadius - offset + len1 * a.majorRadius1 + len2 * a.majorRadius2;
            if (depth < 0)
                return;
            // point on flat torus
            let s1 = len1 ? -a.majorRadius1 / len1 : 0;
            let s2 = len2 ? -a.majorRadius2 / len2 : 0;
            let point = new Vec4(normal.x * s1, normal.y * s1, normal.z * s2, normal.w * s2);
            // then to world coord and add normal
            point.rotates(a.rigid.rotation).adds(a.rigid.position).addmulfs(b.normal, depth * 0.5 - a.minorRadius);
            this.collisionList.push({ point, normal: b.normal.neg(), depth, a: a.rigid, b: b.rigid });
        }
        detectTigerGlome(a, b) {
            // convert glome to st's coord
            let p = _vec4.subset(b.rigid.position, a.rigid.position).rotatesconj(a.rigid.rotation);
            let xy = p.x * p.x + p.y * p.y;
            let zw = p.z * p.z + p.w * p.w;
            let sqrtxy = Math.sqrt(xy);
            let sqrtzw = Math.sqrt(zw);
            let distance = Math.sqrt(a.majorRadius1 * a.majorRadius1 + a.majorRadius2 * a.majorRadius2
                + xy + zw - 2 * (sqrtxy * a.majorRadius1 + sqrtzw * a.majorRadius2));
            let depth = a.minorRadius + b.radius - distance;
            if (depth < 0)
                return;
            // find support of circle along normal
            let k1 = sqrtxy ? a.majorRadius1 / sqrtxy : 0;
            let k2 = sqrtzw ? a.majorRadius2 / sqrtzw : 0;
            let point = new Vec4(p.x * k1, p.y * k1, p.z * k2, p.w * k2).rotates(a.rigid.rotation);
            let normal = point.adds(a.rigid.position).sub(b.rigid.position).norms().negs();
            point.addmulfs(normal, a.minorRadius - depth * 0.5);
            this.collisionList.push({ point, normal, depth, a: a.rigid, b: b.rigid });
        }
        detectTigerTiger(a, b) {
            // position and rotation are b in a's frame 
            let position = _vec4.subset(b.rigid.position, a.rigid.position).rotatesconj(a.rigid.rotation);
            let rotation = _r.copy(b.rigid.rotation).mulslconj(a.rigid.rotation);
            let temp1 = b.majorRadius1;
            let temp2 = b.majorRadius2;
            // choose 8 initial points (w1=0.5,w2=1/4+1/4i) on b for iteration
            let initialPB = [
                vec4Pool.pop().set(temp1, 0, temp2, 0),
                vec4Pool.pop().set(temp1, 0, -temp2, 0),
                vec4Pool.pop().set(-temp1, 0, temp2, 0),
                vec4Pool.pop().set(-temp1, 0, -temp2, 0),
                vec4Pool.pop().set(0, temp1, 0, temp2),
                vec4Pool.pop().set(0, temp1, 0, -temp2),
                vec4Pool.pop().set(0, -temp1, 0, temp2),
                vec4Pool.pop().set(0, -temp1, 0, -temp2),
            ];
            let newP = vec4Pool.pop();
            let prevPInA = vec4Pool.pop();
            let epsilon = Math.min(a.minorRadius, b.minorRadius) * 0.01;
            for (let p of initialPB) {
                // newP and p are in b
                newP.copy(p);
                for (let iterationCount = 0; iterationCount < this.maxIteration; iterationCount++) {
                    // from b to a
                    newP.rotates(rotation).adds(position);
                    let k1 = a.majorRadius1 / Math.hypot(newP.x, newP.y);
                    if (!isFinite(k1))
                        break;
                    let k2 = a.majorRadius2 / Math.hypot(newP.z, newP.w);
                    if (!isFinite(k2))
                        break;
                    // project to a
                    newP.set(newP.x * k1, newP.y * k1, newP.z * k2, newP.w * k2);
                    prevPInA.copy(newP);
                    // from a to b
                    newP.subs(position).rotatesconj(rotation);
                    k1 = b.majorRadius1 / Math.hypot(newP.x, newP.y);
                    if (!isFinite(k1))
                        break;
                    k2 = b.majorRadius2 / Math.hypot(newP.z, newP.w);
                    if (!isFinite(k2))
                        break;
                    // project to b
                    newP.set(newP.x * k1, newP.y * k1, newP.z * k2, newP.w * k2);
                    // test if iteration still moves
                    let dx = Math.abs(newP.x - p.x);
                    let dy = Math.abs(newP.y - p.y);
                    let dz = Math.abs(newP.z - p.z);
                    let dw = Math.abs(newP.w - p.w);
                    p.copy(newP);
                    if (dx + dy + dz + dw < epsilon)
                        break;
                }
                // console.log(converge);
                // else there might be collision
                // transform newP to a, then compare newP and prevPInA
                newP.rotates(rotation).adds(position);
                let normal = newP.sub(prevPInA);
                let depth = a.minorRadius + b.minorRadius - normal.norm();
                if (depth < 0)
                    continue;
                normal.rotates(a.rigid.rotation).norms();
                let point = newP.rotate(a.rigid.rotation).adds(a.rigid.position);
                point.addmulfs(normal, -b.minorRadius + depth * 0.5);
                this.collisionList.push({
                    normal, point, depth, a: a.rigid, b: b.rigid
                });
            }
        }
        detectTigerTorisphere(a, b) {
            // position and rotation are b in a's frame 
            let position = _vec4.subset(b.rigid.position, a.rigid.position).rotatesconj(a.rigid.rotation);
            let rotation = _r.copy(b.rigid.rotation).mulslconj(a.rigid.rotation);
            let temp = b.majorRadius * _TAN30;
            // choose 4 initial points (regular tetrahedron) on b for iteration
            let initialPB = [
                vec4Pool.pop().set(temp, 0, temp, temp),
                vec4Pool.pop().set(-temp, 0, -temp, temp),
                vec4Pool.pop().set(-temp, 0, temp, -temp),
                vec4Pool.pop().set(temp, 0, -temp, -temp),
            ];
            let newP = vec4Pool.pop();
            let prevPInA = vec4Pool.pop();
            let epsilon = Math.min(a.minorRadius, b.minorRadius) * 0.01;
            for (let p of initialPB) {
                // newP and p are in b
                newP.copy(p);
                for (let iterationCount = 0; iterationCount < this.maxIteration; iterationCount++) {
                    // from b to a
                    newP.rotates(rotation).adds(position);
                    let k1 = a.majorRadius1 / Math.hypot(newP.x, newP.y);
                    if (!isFinite(k1))
                        break;
                    let k2 = a.majorRadius2 / Math.hypot(newP.z, newP.w);
                    if (!isFinite(k2))
                        break;
                    // project to a
                    newP.set(newP.x * k1, newP.y * k1, newP.z * k2, newP.w * k2);
                    prevPInA.copy(newP);
                    // from a to b
                    newP.subs(position).rotatesconj(rotation);
                    let k = b.majorRadius / Math.hypot(newP.x, newP.z, newP.w);
                    if (!isFinite(k))
                        break;
                    // project to b
                    newP.set(newP.x * k, 0, newP.z * k, newP.w * k);
                    // test if iteration still moves
                    let dx = Math.abs(newP.x - p.x);
                    let dz = Math.abs(newP.z - p.z);
                    let dw = Math.abs(newP.w - p.w);
                    p.copy(newP);
                    if (dx + dz + dw < epsilon)
                        break;
                }
                // console.log(converge);
                // else there might be collision
                // transform newP to a, then compare newP and prevPInA
                newP.rotates(rotation).adds(position);
                let normal = newP.sub(prevPInA);
                let depth = a.minorRadius + b.minorRadius - normal.norm();
                if (depth < 0)
                    continue;
                normal.rotates(a.rigid.rotation).norms();
                let point = newP.rotate(a.rigid.rotation).adds(a.rigid.position);
                point.addmulfs(normal, -b.minorRadius + depth * 0.5);
                this.collisionList.push({
                    normal, point, depth, a: a.rigid, b: b.rigid
                });
            }
        }
        detectTigerSpheritorus(a, b) {
            // position and rotation are b in a's frame 
            let position = _vec4.subset(b.rigid.position, a.rigid.position).rotatesconj(a.rigid.rotation);
            let rotation = _r.copy(b.rigid.rotation).mulslconj(a.rigid.rotation);
            let tempa = b.majorRadius * 0.5;
            let tempb = b.majorRadius * _COS30;
            // choose 3 initial points (120 degree) on b for iteration
            let initialPB = [
                vec4Pool.pop().set(tempa, 0, 0, tempb),
                vec4Pool.pop().set(tempa, 0, 0, -tempb),
                vec4Pool.pop().set(-b.majorRadius)
            ];
            let newP = vec4Pool.pop();
            let prevPInA = vec4Pool.pop();
            let epsilon = Math.min(a.minorRadius, b.minorRadius) * 0.01;
            for (let p of initialPB) {
                // newP and p are in b
                newP.copy(p);
                for (let iterationCount = 0; iterationCount < this.maxIteration; iterationCount++) {
                    // from b to a
                    newP.rotates(rotation).adds(position);
                    let k1 = a.majorRadius1 / Math.hypot(newP.x, newP.y);
                    if (!isFinite(k1))
                        break;
                    let k2 = a.majorRadius2 / Math.hypot(newP.z, newP.w);
                    if (!isFinite(k2))
                        break;
                    // project to a
                    newP.set(newP.x * k1, newP.y * k1, newP.z * k2, newP.w * k2);
                    prevPInA.copy(newP);
                    // from a to b
                    newP.subs(position).rotatesconj(rotation);
                    let k = b.majorRadius / Math.hypot(newP.x, newP.w);
                    if (!isFinite(k))
                        break;
                    // project to b
                    newP.set(newP.x * k, 0, 0, newP.w * k);
                    // test if iteration still moves
                    let dx = Math.abs(newP.x - p.x);
                    let dw = Math.abs(newP.w - p.w);
                    p.copy(newP);
                    if (dx + dw < epsilon)
                        break;
                }
                // console.log(converge);
                // else there might be collision
                // transform newP to a, then compare newP and prevPInA
                newP.rotates(rotation).adds(position);
                let normal = newP.sub(prevPInA);
                let depth = a.minorRadius + b.minorRadius - normal.norm();
                if (depth < 0)
                    continue;
                normal.rotates(a.rigid.rotation).norms();
                let point = newP.rotate(a.rigid.rotation).adds(a.rigid.position);
                point.addmulfs(normal, -b.minorRadius + depth * 0.5);
                this.collisionList.push({
                    normal, point, depth, a: a.rigid, b: b.rigid
                });
            }
        }
        detectDitorusPlane(a, b) {
            // convert plane to ts's coord
            let normal = _vec4.copy(b.normal).rotatesconj(a.rigid.rotation);
            let offset = a.rigid.position.dot(b.normal) - b.offset;
            let len1 = Math.hypot(normal.x, normal.y);
            let len2 = Math.hypot(normal.z, len1);
            let depth = a.minorRadius - offset + len1 * a.majorRadius + len2 * a.middleRadius;
            if (depth < 0)
                return;
            // point on torus
            let s2 = len2 ? -a.middleRadius / len2 : 0;
            let s1 = (len1 ? -a.majorRadius / len1 : 0) + s2;
            let point = new Vec4(normal.x * s1, normal.y * s1, normal.z * s2, 0);
            // then to world coord and add normal
            point.rotates(a.rigid.rotation).adds(a.rigid.position).addmulfs(b.normal, depth * 0.5 - a.minorRadius);
            this.collisionList.push({ point, normal: b.normal.neg(), depth, a: a.rigid, b: b.rigid });
        }
        detectDitorusGlome(a, b) {
            // convert glome to dt's coord
            let p = _vec4.subset(b.rigid.position, a.rigid.position).rotatesconj(a.rigid.rotation);
            let sqrtxy = Math.hypot(p.x, p.y);
            let d1 = sqrtxy - a.majorRadius; // distance to circle in xy plane
            let d13 = Math.hypot(d1, p.z); // distance to circle in xyz cell
            let d2 = d13 - a.middleRadius; // distance to torus in xyz cell
            let distance = Math.sqrt(d2 * d2 + p.w * p.w); // distance to torus in R4
            let depth = a.minorRadius + b.radius - distance;
            let kz = a.middleRadius / d13;
            let kxy = a.majorRadius / sqrtxy;
            kxy += (1 - kxy) * kz;
            if (depth < 0)
                return;
            let point = new Vec4(p.x * kxy, p.y * kxy, p.z * kz, 0).rotates(a.rigid.rotation);
            let normal = point.adds(a.rigid.position).sub(b.rigid.position).norms().negs();
            point.addmulfs(normal, a.minorRadius - depth * 0.5);
            this.collisionList.push({ point, normal, depth, a: a.rigid, b: b.rigid });
        }
        detectDitorusSpheritorus(a, b) {
            // position and rotation are b in a's frame 
            let position = _vec4.subset(b.rigid.position, a.rigid.position).rotatesconj(a.rigid.rotation);
            let rotation = _r.copy(b.rigid.rotation).mulslconj(a.rigid.rotation);
            let tempa = b.majorRadius * 0.5;
            let tempb = b.majorRadius * _COS30;
            // choose 3 initial points (120 degree) on b for iteration
            let initialPB = [
                vec4Pool.pop().set(tempa, 0, 0, tempb),
                vec4Pool.pop().set(tempa, 0, 0, -tempb),
                vec4Pool.pop().set(-b.majorRadius)
            ];
            let newP = vec4Pool.pop();
            let prevPInA = vec4Pool.pop();
            let epsilon = Math.min(a.minorRadius, b.minorRadius) * 0.01;
            for (let p of initialPB) {
                // newP and p are in b
                newP.copy(p);
                for (let iterationCount = 0; iterationCount < this.maxIteration; iterationCount++) {
                    // from b to a
                    newP.rotates(rotation).adds(position);
                    let sqrtxy = Math.hypot(newP.x, newP.y);
                    let d1 = sqrtxy - a.majorRadius; // distance to circle in xy plane
                    let d13 = Math.hypot(d1, newP.z); // distance to circle in xyz cell
                    let kz = a.middleRadius / d13;
                    if (!isFinite(kz))
                        break;
                    let kxy = a.majorRadius / sqrtxy;
                    if (!isFinite(kxy))
                        break;
                    kxy += (1 - kxy) * kz;
                    // project to a
                    newP.set(newP.x * kxy, newP.y * kxy, newP.z * kz, 0);
                    prevPInA.copy(newP);
                    // from a to b
                    newP.subs(position).rotatesconj(rotation);
                    let k = b.majorRadius / Math.hypot(newP.x, newP.w);
                    if (!isFinite(k))
                        break;
                    // project to b
                    newP.set(newP.x * k, 0, 0, newP.w * k);
                    // test if iteration still moves
                    let dx = Math.abs(newP.x - p.x);
                    let dw = Math.abs(newP.w - p.w);
                    p.copy(newP);
                    if (dx + dw < epsilon)
                        break;
                }
                // console.log(converge);
                // else there might be collision
                // transform newP to a, then compare newP and prevPInA
                newP.rotates(rotation).adds(position);
                let normal = newP.sub(prevPInA);
                let depth = a.minorRadius + b.minorRadius - normal.norm();
                if (depth < 0)
                    continue;
                normal.rotates(a.rigid.rotation).norms();
                let point = newP.rotate(a.rigid.rotation).adds(a.rigid.position);
                point.addmulfs(normal, -b.minorRadius + depth * 0.5);
                this.collisionList.push({
                    normal, point, depth, a: a.rigid, b: b.rigid
                });
            }
        }
        detectDitorusTorisphere(a, b) {
            // position and rotation are b in a's frame 
            let position = _vec4.subset(b.rigid.position, a.rigid.position).rotatesconj(a.rigid.rotation);
            let rotation = _r.copy(b.rigid.rotation).mulslconj(a.rigid.rotation);
            let temp = b.majorRadius * _TAN30;
            // choose 4 initial points (regular tetrahedron) on b for iteration
            let initialPB = [
                vec4Pool.pop().set(temp, 0, temp, temp),
                vec4Pool.pop().set(-temp, 0, -temp, temp),
                vec4Pool.pop().set(-temp, 0, temp, -temp),
                vec4Pool.pop().set(temp, 0, -temp, -temp),
            ];
            let newP = vec4Pool.pop();
            let prevPInA = vec4Pool.pop();
            let epsilon = Math.min(a.minorRadius, b.minorRadius) * 0.01;
            for (let p of initialPB) {
                // newP and p are in b
                newP.copy(p);
                for (let iterationCount = 0; iterationCount < this.maxIteration; iterationCount++) {
                    // from b to a
                    newP.rotates(rotation).adds(position);
                    let sqrtxy = Math.hypot(newP.x, newP.y);
                    let d1 = sqrtxy - a.majorRadius; // distance to circle in xy plane
                    let d13 = Math.hypot(d1, newP.z); // distance to circle in xyz cell
                    let kz = a.middleRadius / d13;
                    if (!isFinite(kz))
                        break;
                    let kxy = a.majorRadius / sqrtxy;
                    if (!isFinite(kxy))
                        break;
                    kxy += (1 - kxy) * kz;
                    // project to a
                    newP.set(newP.x * kxy, newP.y * kxy, newP.z * kz, 0);
                    prevPInA.copy(newP);
                    // from a to b
                    newP.subs(position).rotatesconj(rotation);
                    let k = b.majorRadius / Math.hypot(newP.x, newP.z, newP.w);
                    if (!isFinite(k))
                        break;
                    // project to b
                    newP.set(newP.x * k, 0, newP.z * k, newP.w * k);
                    // test if iteration still moves
                    let dx = Math.abs(newP.x - p.x);
                    let dz = Math.abs(newP.z - p.z);
                    let dw = Math.abs(newP.w - p.w);
                    p.copy(newP);
                    if (dx + dz + dw < epsilon)
                        break;
                }
                // console.log(converge);
                // else there might be collision
                // transform newP to a, then compare newP and prevPInA
                newP.rotates(rotation).adds(position);
                let normal = newP.sub(prevPInA);
                let depth = a.minorRadius + b.minorRadius - normal.norm();
                if (depth < 0)
                    continue;
                normal.rotates(a.rigid.rotation).norms();
                let point = newP.rotate(a.rigid.rotation).adds(a.rigid.position);
                point.addmulfs(normal, -b.minorRadius + depth * 0.5);
                this.collisionList.push({
                    normal, point, depth, a: a.rigid, b: b.rigid
                });
            }
        }
        detectDitorusTiger(a, b) {
            // position and rotation are b in a's frame 
            let position = _vec4.subset(b.rigid.position, a.rigid.position).rotatesconj(a.rigid.rotation);
            let rotation = _r.copy(b.rigid.rotation).mulslconj(a.rigid.rotation);
            let temp1 = b.majorRadius1;
            let temp2 = b.majorRadius2;
            // choose 8 initial points (w1=0.5,w2=1/4+1/4i) on b for iteration
            let initialPB = [
                vec4Pool.pop().set(temp1, 0, temp2, 0),
                vec4Pool.pop().set(temp1, 0, -temp2, 0),
                vec4Pool.pop().set(-temp1, 0, temp2, 0),
                vec4Pool.pop().set(-temp1, 0, -temp2, 0),
                vec4Pool.pop().set(0, temp1, 0, temp2),
                vec4Pool.pop().set(0, temp1, 0, -temp2),
                vec4Pool.pop().set(0, -temp1, 0, temp2),
                vec4Pool.pop().set(0, -temp1, 0, -temp2),
            ];
            let newP = vec4Pool.pop();
            let prevPInA = vec4Pool.pop();
            let epsilon = Math.min(a.minorRadius, b.minorRadius) * 0.01;
            for (let p of initialPB) {
                // newP and p are in b
                newP.copy(p);
                for (let iterationCount = 0; iterationCount < this.maxIteration; iterationCount++) {
                    // from b to a
                    newP.rotates(rotation).adds(position);
                    let sqrtxy = Math.hypot(newP.x, newP.y);
                    let d1 = sqrtxy - a.majorRadius; // distance to circle in xy plane
                    let d13 = Math.hypot(d1, newP.z); // distance to circle in xyz cell
                    let kz = a.middleRadius / d13;
                    if (!isFinite(kz))
                        break;
                    let kxy = a.majorRadius / sqrtxy;
                    if (!isFinite(kxy))
                        break;
                    kxy += (1 - kxy) * kz;
                    // project to a
                    newP.set(newP.x * kxy, newP.y * kxy, newP.z * kz, 0);
                    prevPInA.copy(newP);
                    // from a to b
                    newP.subs(position).rotatesconj(rotation);
                    let k1 = b.majorRadius1 / Math.hypot(newP.x, newP.y);
                    if (!isFinite(k1))
                        break;
                    let k2 = b.majorRadius2 / Math.hypot(newP.z, newP.w);
                    if (!isFinite(k2))
                        break;
                    // project to b
                    newP.set(newP.x * k1, newP.y * k1, newP.z * k2, newP.w * k2);
                    // test if iteration still moves
                    let dx = Math.abs(newP.x - p.x);
                    let dy = Math.abs(newP.y - p.y);
                    let dz = Math.abs(newP.z - p.z);
                    let dw = Math.abs(newP.w - p.w);
                    p.copy(newP);
                    if (dx + dy + dz + dw < epsilon)
                        break;
                }
                // console.log(converge);
                // else there might be collision
                // transform newP to a, then compare newP and prevPInA
                newP.rotates(rotation).adds(position);
                let normal = newP.sub(prevPInA);
                let depth = a.minorRadius + b.minorRadius - normal.norm();
                if (depth < 0)
                    continue;
                normal.rotates(a.rigid.rotation).norms();
                let point = newP.rotate(a.rigid.rotation).adds(a.rigid.position);
                point.addmulfs(normal, -b.minorRadius + depth * 0.5);
                this.collisionList.push({
                    normal, point, depth, a: a.rigid, b: b.rigid
                });
            }
        }
        detectDitorusDitorus(a, b) {
            // position and rotation are b in a's frame 
            let position = _vec4.subset(b.rigid.position, a.rigid.position).rotatesconj(a.rigid.rotation);
            let rotation = _r.copy(b.rigid.rotation).mulslconj(a.rigid.rotation);
            let temp1 = b.majorRadius;
            let temp2 = b.middleRadius;
            // choose 8 initial points (w1=0.5,w2=1/4+1/4i) on b for iteration
            let initialPB = [
                vec4Pool.pop().set(temp1 + temp2),
                vec4Pool.pop().set(temp1 - temp2),
                vec4Pool.pop().set(-temp1 + temp2),
                vec4Pool.pop().set(-temp1 - temp2),
                vec4Pool.pop().set(0, temp1, temp2),
                vec4Pool.pop().set(0, temp1, -temp2),
                vec4Pool.pop().set(0, -temp1, temp2),
                vec4Pool.pop().set(0, -temp1, -temp2),
            ];
            let newP = vec4Pool.pop();
            let prevPInA = vec4Pool.pop();
            let epsilon = Math.min(a.minorRadius, b.minorRadius) * 0.01;
            for (let p of initialPB) {
                // newP and p are in b
                newP.copy(p);
                for (let iterationCount = 0; iterationCount < this.maxIteration; iterationCount++) {
                    // from b to a
                    newP.rotates(rotation).adds(position);
                    let sqrtxy = Math.hypot(newP.x, newP.y);
                    let d1 = sqrtxy - a.majorRadius; // distance to circle in xy plane
                    let d13 = Math.hypot(d1, newP.z); // distance to circle in xyz cell
                    let kz = a.middleRadius / d13;
                    if (!isFinite(kz))
                        break;
                    let kxy = a.majorRadius / sqrtxy;
                    if (!isFinite(kxy))
                        break;
                    kxy += (1 - kxy) * kz;
                    // project to a
                    newP.set(newP.x * kxy, newP.y * kxy, newP.z * kz, 0);
                    prevPInA.copy(newP);
                    // from a to b
                    newP.subs(position).rotatesconj(rotation);
                    sqrtxy = Math.hypot(newP.x, newP.y);
                    d1 = sqrtxy - a.majorRadius; // distance to circle in xy plane
                    d13 = Math.hypot(d1, newP.z); // distance to circle in xyz cell
                    kz = a.middleRadius / d13;
                    if (!isFinite(kz))
                        break;
                    kxy = a.majorRadius / sqrtxy;
                    if (!isFinite(kxy))
                        break;
                    kxy += (1 - kxy) * kz;
                    // project to b
                    newP.set(newP.x * kxy, newP.y * kxy, newP.z * kz, 0);
                    // test if iteration still moves
                    let dx = Math.abs(newP.x - p.x);
                    let dy = Math.abs(newP.y - p.y);
                    let dz = Math.abs(newP.z - p.z);
                    p.copy(newP);
                    if (dx + dy + dz < epsilon)
                        break;
                }
                // console.log(converge);
                // else there might be collision
                // transform newP to a, then compare newP and prevPInA
                newP.rotates(rotation).adds(position);
                let normal = newP.sub(prevPInA);
                let depth = a.minorRadius + b.minorRadius - normal.norm();
                if (depth < 0)
                    continue;
                normal.rotates(a.rigid.rotation).norms();
                let point = newP.rotate(a.rigid.rotation).adds(a.rigid.position);
                point.addmulfs(normal, -b.minorRadius + depth * 0.5);
                this.collisionList.push({
                    normal, point, depth, a: a.rigid, b: b.rigid
                });
            }
        }
    }

    class Solver {
    }
    class IterativeImpulseSolver extends Solver {
        maxPositionIterations = 32;
        maxVelocityIterations = 32;
        maxResolveRotationAngle = 45 * _DEG2RAD;
        separateSpeedEpsilon = 0.01;
        PositionRelaxationFactor = 0.5;
        collisionList;
        _vec41 = new Vec4;
        _vec42 = new Vec4;
        pointConstrainMaterial = new Material(Infinity, 0);
        run(collisionList, constrainList) {
            if (!collisionList.length && !constrainList.length)
                return;
            this.prepare(collisionList, constrainList);
            this.resolveVelocity();
            this.resolvePosition();
        }
        prepare(collisionList, constrainList) {
            this.collisionList = collisionList.map(e => {
                let { point, a, b, normal } = e;
                let collision = e;
                collision.materialA = a.material;
                collision.materialB = b?.material;
                // after got material, we solve union regardless of it's collision parts
                if (a.parent)
                    collision.a = a.parent;
                if (b.parent)
                    collision.b = b.parent;
                collision.relativeVelocity = collision.b.getlinearVelocity(vec4Pool.pop(), point).subs(collision.a.getlinearVelocity(this._vec41, point));
                collision.separateSpeed = collision.relativeVelocity.dot(normal);
                return collision;
            });
            for (let c of constrainList) {
                if (c instanceof PointConstrain) {
                    let { a, b, pointA, pointB } = c;
                    this._vec41.copy(pointA).rotates(a.rotation);
                    let relativeVelocity = vec4Pool.pop().dotbset(this._vec41, a.angularVelocity).adds(a.velocity);
                    let normal;
                    let point;
                    if (b) {
                        this._vec42.copy(pointB).rotates(b.rotation);
                        relativeVelocity.subs(this._vec42.dotbset(this._vec42, b.angularVelocity).adds(b.velocity));
                        normal = this._vec41.adds(a.position).sub(this._vec42.adds(b.position));
                        point = this._vec41.add(this._vec42).mulfs(0.5);
                    }
                    else {
                        normal = this._vec41.adds(a.position).sub(pointB);
                        point = this._vec41.adds(pointB).mulfs(0.5);
                    }
                    let depth = normal.norm();
                    if (depth === 0)
                        continue;
                    normal.divfs(depth);
                    relativeVelocity.negs();
                    this.collisionList.push({
                        a, b, normal, depth,
                        materialA: this.pointConstrainMaterial,
                        materialB: this.pointConstrainMaterial,
                        relativeVelocity,
                        separateSpeed: -relativeVelocity.norm(),
                        point,
                        pointConstrain: c
                    });
                }
            }
        }
        resolveVelocity() {
            // iteratively solve lowest separateSpeed
            for (let i = 0; i < this.maxVelocityIterations; i++) {
                let collision = this.collisionList.sort((a, b) => ((a.pointConstrain ? (-Math.abs(a.separateSpeed)) : a.separateSpeed)
                    - (b.pointConstrain ? (-Math.abs(b.separateSpeed)) : b.separateSpeed)))[0];
                if (!collision)
                    return;
                let { point, a, b, separateSpeed, normal, relativeVelocity, materialA, materialB } = collision;
                if (!collision.pointConstrain) {
                    if (separateSpeed >= 0)
                        return;
                }
                else if (Math.abs(separateSpeed) < this.separateSpeedEpsilon) {
                    return;
                }
                let { restitution, friction } = Material.getContactMaterial(materialA, materialB);
                if (separateSpeed > -this.separateSpeedEpsilon)
                    restitution = 0;
                let normalVelocity = vec4Pool.pop().copy(normal).mulfs(separateSpeed);
                let tangentVelocity = vec4Pool.pop().subset(relativeVelocity, normalVelocity);
                let tangentSpeed = tangentVelocity.norm();
                // newVn = Vn * -restitution;
                // newVt = Vt * tangentFactor;
                // when slide: deltaVt === friction * deltaVn => solve tangentFactor
                // convert f = mu * N to delta(tangentSpeed) = mu * delta(normalVelocity)
                // then calculate friction reduce how many tangentSpeed, result is presented by a tangentFactor
                // tangentFactor must > 0, otherwise it's still friction
                let tangentFactor = tangentSpeed > 0 ? Math.max(1 + friction * (1 + restitution) * separateSpeed / tangentSpeed, 0) : 0;
                let targetDeltaVelocityByImpulse = tangentVelocity.mulfs(tangentFactor - 1).addmulfs(normalVelocity, -restitution - 1);
                let pointInA, pointInB;
                let matA = mat4Pool.pop(), matB = mat4Pool.pop();
                if (a.mass > 0) {
                    pointInA = vec4Pool.pop().subset(point, a.position).rotatesconj(a.rotation);
                    calcImpulseResponseMat(matA, a, pointInA, pointInA);
                }
                else {
                    matA.set();
                }
                if (b?.mass > 0) {
                    pointInB = vec4Pool.pop().subset(point, b.position).rotatesconj(b.rotation);
                    calcImpulseResponseMat(matB, b, pointInB, pointInB);
                }
                else {
                    matB.set();
                }
                // dv = dvb(Ib) - dva(Ia) == dvb(I) + dva(I) since I = -Ia = Ib
                let impulse = targetDeltaVelocityByImpulse.mulmatls(matA.adds(matB).invs());
                if (impulse.norm() > 1.0) ;
                // if (impulse.norm1() === 0) continue;
                // console.assert(isFinite(impulse.norm1()));
                // console.assert(isFinite(normal.norm1()));
                mat4Pool.push(matA, matB);
                // resolve velocity by applying final impulse
                if (b?.mass > 0) {
                    collision.dvB = vec4Pool.pop();
                    collision.dwB = bivecPool.pop();
                    applyImpulseAndGetDeltaVW(collision.dvB, collision.dwB, b, pointInB, impulse);
                }
                if (a.mass > 0) {
                    collision.dvA = vec4Pool.pop();
                    collision.dwA = bivecPool.pop();
                    applyImpulseAndGetDeltaVW(collision.dvA, collision.dwA, a, pointInA, impulse.negs());
                }
                this.updateSeparateSpeeds(collision);
            }
        }
        updateSeparateSpeeds(collision) {
            for (let c of this.collisionList) {
                if (collision.a.mass > 0) {
                    if (c.a === collision.a) {
                        this.updateSeparateSpeed(c, true, c.a, collision.dvA, collision.dwA);
                    }
                    else if (c.b === collision.a) {
                        this.updateSeparateSpeed(c, false, c.b, collision.dvA, collision.dwA);
                    }
                }
                if (collision.b?.mass > 0) {
                    if (c.a === collision.b) {
                        this.updateSeparateSpeed(c, true, c.a, collision.dvB, collision.dwB);
                    }
                    else if (c.b === collision.b) {
                        this.updateSeparateSpeed(c, false, c.b, collision.dvB, collision.dwB);
                    }
                }
            }
        }
        updateSeparateSpeed(collision, rigidIsA, rigid, dv, dw) {
            let delta = vec4Pool.pop().subset(collision.point, rigid.position).dotbsr(dw).adds(dv);
            if (rigidIsA)
                delta.negs();
            console.assert(isFinite(delta.norm1()), "Numeric error in Collision solver updateDepth");
            collision.relativeVelocity.adds(delta);
            if (collision.pointConstrain) {
                collision.separateSpeed = -collision.relativeVelocity.norm();
            }
            else {
                let dss = delta.dot(collision.normal);
                delta.pushPool();
                collision.separateSpeed += dss;
            }
        }
        resolvePosition() {
            // iteratively solve the deepest
            for (let i = 0; i < this.maxPositionIterations; i++) {
                let collision = this.collisionList.sort((a, b) => b.depth - a.depth)[0];
                if (!collision)
                    return;
                let { point, a, b, depth, normal } = collision;
                if (depth <= 0)
                    return;
                if (depth > 10) {
                    console.error("Depth direction error in resolvePosition");
                }
                let invInertiaA = 0, invInertiaB = 0;
                if (a.mass > 0) {
                    let pA = vec4Pool.pop().subset(point, a.position);
                    let torqueA = bivecPool.pop().wedgevvset(normal, pA);
                    if (a.inertiaIsotroy) {
                        collision.dwA = torqueA.mulfs(a.invInertia.xy);
                    }
                    else {
                        torqueA.rotatesconj(a.rotation);
                        collision.dwA = mulBivec(torqueA, a.invInertia, torqueA).rotates(a.rotation);
                    }
                    invInertiaA = -pA.dotbset(pA, collision.dwA).dot(normal);
                    pA.pushPool();
                }
                if (b?.mass > 0) {
                    let pB = vec4Pool.pop().subset(point, b.position);
                    let torqueB = bivecPool.pop().wedgevvset(pB, normal);
                    if (b.inertiaIsotroy) {
                        collision.dwB = torqueB.mulfs(b.invInertia.xy);
                    }
                    else {
                        torqueB.rotatesconj(b.rotation);
                        collision.dwB = mulBivec(torqueB, b.invInertia, torqueB).rotates(b.rotation);
                    }
                    invInertiaB = pB.dotbset(pB, collision.dwB).dot(normal);
                    pB.pushPool();
                }
                // console.assert(invInertiaA >= 0);
                // console.assert(invInertiaB >= 0);
                let depthDivTotalInvs = depth * this.PositionRelaxationFactor / (a.invMass + (b?.invMass ?? 0) + invInertiaA + invInertiaB);
                if (!isFinite(depthDivTotalInvs)) {
                    console.error("A numeric error occured in Rigid collision solver: depthDivTotalInvs in resolvePosition");
                }
                if (a.mass > 0) {
                    // here can't mul invInertiaA since dwA is by unit impulse, and linear part is already invInertiaA
                    collision.dwA.mulfs(depthDivTotalInvs);
                    // clamp rotation
                    let angle = collision.dwA.norm();
                    if (angle > this.maxResolveRotationAngle) {
                        collision.dwA.mulfs(this.maxResolveRotationAngle / angle);
                    }
                    collision.dvA = vec4Pool.pop().copy(normal).mulfs(-depthDivTotalInvs * a.invMass);
                    if (!isFinite(angle + collision.dvA.norm1() + collision.dwA.norm1() + a.position.norm1())) {
                        console.error("A numeric error occured in Rigid collision solver: dvA,dwA in resolvePosition");
                    }
                    a.position.adds(collision.dvA);
                    let r = rotorPool.pop().expset(collision.dwA);
                    a.rotation.mulsl(r);
                    r.pushPool();
                    if (!isFinite(a.rotation.l.norm() + a.rotation.r.norm() + a.position.norm1())) {
                        console.error("A numeric error occured in Rigid collision solver: dvA,dwA in resolvePosition");
                    }
                }
                if (b?.mass > 0) {
                    collision.dwB.mulfs(depthDivTotalInvs);
                    // clamp rotation
                    let angle = collision.dwB.norm();
                    if (angle > this.maxResolveRotationAngle) {
                        collision.dwB.mulfs(this.maxResolveRotationAngle / angle);
                    }
                    collision.dvB = vec4Pool.pop().copy(normal).mulfs(depthDivTotalInvs * b.invMass);
                    if (!isFinite(angle + collision.dvB.norm1() + collision.dwB.norm1() + b.position.norm1())) {
                        console.error("A numeric error occured in Rigid collision solver: dvB,dwB in resolvePosition");
                    }
                    b.position.adds(collision.dvB);
                    let r = rotorPool.pop().expset(collision.dwB);
                    b.rotation.mulsl(r);
                    r.pushPool();
                    if (!isFinite(b.rotation.l.norm() + b.rotation.r.norm() + b.position.norm1())) {
                        console.error("A numeric error occured in Rigid collision solver: dvB,dwB in resolvePosition");
                    }
                }
                // collision.depth = 0;
                this.updateDepths(collision);
            }
        }
        updateDepths(collision) {
            for (let c of this.collisionList) {
                if (collision.a.mass > 0) {
                    if (c.a === collision.a) {
                        this.updateDepth(c, true, c.a, collision.dvA, collision.dwA);
                    }
                    else if (c.b === collision.a) {
                        this.updateDepth(c, false, c.b, collision.dvA, collision.dwA);
                    }
                }
                if (collision.b?.mass > 0) {
                    if (c.a === collision.b) {
                        this.updateDepth(c, true, c.a, collision.dvB, collision.dwB);
                    }
                    else if (c.b === collision.b) {
                        this.updateDepth(c, false, c.b, collision.dvB, collision.dwB);
                    }
                }
            }
        }
        updateDepth(collision, rigidIsA, rigid, dv, dw) {
            if (collision.pointConstrain) {
                let a = collision.normal.copy(collision.pointConstrain.pointA).rotates(collision.a.rotation).adds(collision.a.position);
                if (collision.b) {
                    let b = vec4Pool.pop().copy(collision.pointConstrain.pointB).rotates(collision.b.rotation).adds(collision.b.position);
                    a.subs(b);
                    b.pushPool();
                }
                else {
                    a.subs(collision.pointConstrain.pointB);
                }
                collision.depth = a.norm();
                collision.normal.norms();
            }
            else {
                let a = vec4Pool.pop().subset(collision.point, rigid.position);
                let dd = a.dotbsr(dw).adds(dv).dot(collision.normal);
                console.assert(isFinite(a.norm1()), "Numeric error in Collision solver updateDepth");
                collision.depth += rigidIsA ? dd : -dd;
                a.pushPool();
            }
        }
    }
    let _vec4x = new Vec4;
    let _vec4y = new Vec4;
    let _vec4z = new Vec4;
    let _vec4w = new Vec4;
    let _biv = new Bivec;
    let _mat4r = new Mat4;
    function calcDeltaVWByImpulse(outV, outW, rigid, localPoint, impulse) {
        outV.copy(impulse).mulfs(rigid.invMass);
        _vec4x.copy(impulse).rotatesconj(rigid.rotation);
        mulBivec(outW, outW.wedgevvset(localPoint, _vec4x), rigid.invInertia).rotates(rigid.rotation);
    }
    function applyImpulseAndGetDeltaVW(outV, outW, rigid, localPoint, impulse) {
        calcDeltaVWByImpulse(outV, outW, rigid, localPoint, impulse);
        {
            console.assert(isFinite(outV.norm1() + outW.norm1()), "A numeric error occured in Rigid collision solver: outV, outW in applyImpulseAndGetDeltaVW");
        }
        rigid.velocity.adds(outV);
        rigid.angularVelocity.adds(outW);
        if (!isFinite(rigid.velocity.norm1() + rigid.angularVelocity.norm1())) {
            console.error("A numeric error occured in Rigid collision solver: rigid velocity in applyImpulseAndGetDeltaVW");
        }
    }
    /** calculate transfer matrix between impulse applying at src position and response delta velocity at dst position
     *  src and dst are in rigid's local frame
     */
    function calcImpulseResponseMat(out, rigid, src, dst) {
        let ii = rigid.invInertia;
        // calculate relativePos cross base vectors and get angular part
        _vec4x.dotbset(dst, _biv.set(-src.y * ii.xy, -src.z * ii.xz, -src.w * ii.xw));
        _vec4y.dotbset(dst, _biv.set(src.x * ii.xy, 0, 0, -src.z * ii.yz, -src.w * ii.yw));
        _vec4z.dotbset(dst, _biv.set(0, src.x * ii.xz, 0, src.y * ii.yz, 0, -src.w * ii.zw));
        _vec4w.dotbset(dst, _biv.set(0, 0, src.x * ii.xw, 0, src.y * ii.yw, src.z * ii.zw));
        out.augVec4set(_vec4x, _vec4y, _vec4z, _vec4w);
        // add linear part (add a diagonal matrix inline)
        out.elem[0] += rigid.invMass;
        out.elem[5] += rigid.invMass;
        out.elem[10] += rigid.invMass;
        out.elem[15] += rigid.invMass;
        _mat4r.setFromRotor(rigid.rotation);
        // convert matrix to world frame by Mworld <= R Mlocal R'
        return out.mulsl(_mat4r).mulsr(_mat4r.ts());
    }

    class Engine {
        forceAccumulator;
        broadPhase;
        narrowPhase;
        solver;
        substep;
        constructor(option) {
            this.forceAccumulator = new (option?.forceAccumulator ?? force_accumulator.Predict3)();
            this.broadPhase = new (option?.broadPhase ?? BoundingGlomeBroadPhase)();
            this.narrowPhase = new NarrowPhase();
            this.solver = new (option?.solver ?? IterativeImpulseSolver)();
            this.substep = option?.substep ?? 1;
        }
        update(world, dt) {
            dt /= this.substep;
            for (let i = 0; i < this.substep; i++) {
                this.step(world, dt);
            }
        }
        step(world, dt) {
            this.forceAccumulator.run(world, dt);
            world.updateUnionGeometriesCoord();
            this.broadPhase.run(world);
            this.narrowPhase.run(this.broadPhase.checkList);
            this.solver.run(this.narrowPhase.collisionList, world.constrains);
            world.updateUnionGeometriesCoord();
        }
    }
    class World {
        gravity = new Vec4(0, -9.8);
        rigids = [];
        constrains = [];
        unionRigids = [];
        forces = [];
        time = 0;
        add(...args) {
            for (let o of args) {
                if (o instanceof Rigid) {
                    this.rigids.push(o);
                    if (o.geometry instanceof rigid.Union) {
                        this.unionRigids.push(o.geometry);
                    }
                    continue;
                }
                if (o instanceof Force) {
                    this.forces.push(o);
                    continue;
                }
                if (o instanceof Constrain) {
                    this.constrains.push(o);
                    continue;
                }
            }
        }
        remove(o) {
            if (o instanceof Rigid) {
                let index = this.rigids.indexOf(o);
                if (index !== -1) {
                    this.rigids.splice(index, 1);
                    if (o.geometry instanceof rigid.Union) {
                        let index = this.unionRigids.indexOf(o.geometry);
                        if (index !== -1) {
                            this.unionRigids.splice(index, 1);
                        }
                        else {
                            console.warn("Union Rigid geometry is removed before rigid");
                        }
                    }
                }
                else {
                    console.warn("Cannot remove a non-existed child");
                }
            }
            if (o instanceof Force) {
                let index = this.forces.indexOf(o);
                if (index !== -1) {
                    this.forces.splice(index, 1);
                }
            }
        }
        updateUnionGeometriesCoord() {
            for (let r of this.unionRigids) {
                r.updateCoord();
            }
        }
    }
    class Material {
        friction;
        restitution;
        constructor(friction, restitution) {
            this.restitution = restitution;
            this.friction = friction;
        }
        static getContactMaterial(a, b) {
            return { restitution: a.restitution * b.restitution, friction: a.friction * b.friction };
        }
    }
    /** a helper function for applying inertia to bivec */
    function mulBivec(self, a, b) {
        return self.set(a.xy * b.xy, a.xz * b.xz, a.xw * b.xw, a.yz * b.yz, a.yw * b.yw, a.zw * b.zw);
    }
    class Constrain {
        a;
        b;
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }
    }
    class PointConstrain extends Constrain {
        pointA;
        pointB;
        constructor(a, b, pointA, pointB) {
            super(a, b);
            this.pointA = pointA;
            this.pointB = pointB;
        }
    }

    var physics = /*#__PURE__*/Object.freeze({
        __proto__: null,
        BoundingGlomeBroadPhase: BoundingGlomeBroadPhase,
        BoundingGlomeTreeBroadPhase: BoundingGlomeTreeBroadPhase,
        BroadPhase: BroadPhase,
        Constrain: Constrain,
        Damping: Damping,
        Engine: Engine,
        Force: Force,
        ForceAccumulator: ForceAccumulator,
        Gravity: Gravity,
        IgnoreAllBroadPhase: IgnoreAllBroadPhase,
        IterativeImpulseSolver: IterativeImpulseSolver,
        Material: Material,
        MaxWell: MaxWell,
        PointConstrain: PointConstrain,
        Rigid: Rigid,
        RigidGeometry: RigidGeometry,
        Solver: Solver,
        Spring: Spring,
        TorqueSpring: TorqueSpring,
        World: World,
        get force_accumulator () { return force_accumulator; },
        get rigid () { return rigid; }
    });

    function toSize3DDict(size) {
        let width, height, depth;
        if (size.width) {
            width = size.width;
            height = size.height;
            depth = size.depthOrArrayLayers;
        }
        else {
            width = size[0];
            height = size[1];
            depth = size[2];
        }
        return { width, height, depth };
    }
    function createVoxelBuffer(gpu, size, formatSize, header, headerSize) {
        let device = gpu.device;
        let { width, height, depth } = toSize3DDict(size);
        let length = width * height * depth;
        headerSize ??= header?.byteLength ?? 0;
        let buffer = device.createBuffer({
            size: (4 + length * formatSize) * 4 + headerSize,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
            label: `VoxelBuffer<${width},${height},${depth},${formatSize}>`
        });
        let gpuBuffer = buffer.getMappedRange(0, headerSize + 16);
        let jsBuffer = new Uint32Array(gpuBuffer);
        jsBuffer.set([width, height, depth, formatSize]);
        if (header) {
            let headerBuffer = new Uint32Array(header);
            jsBuffer.set(headerBuffer, 4);
        }
        buffer.unmap();
        return { buffer, width, height, depth, length, formatSize, header };
    }

    var render = /*#__PURE__*/Object.freeze({
        __proto__: null,
        DefaultDisplayConfig: DefaultDisplayConfig,
        get EyeStereo () { return EyeStereo; },
        GPU: GPU,
        RaytracingPipeline: RaytracingPipeline,
        get RetinaSliceFacing () { return RetinaSliceFacing; },
        SliceRenderer: SliceRenderer,
        TetraSlicePipeline: TetraSlicePipeline,
        WgslReflect: _t,
        createVoxelBuffer: createVoxelBuffer
    });

    var util = /*#__PURE__*/Object.freeze({
        __proto__: null,
        ctrl: ctrl
    });

    exports.four = four;
    exports.math = math;
    exports.mesh = mesh;
    exports.physics = physics;
    exports.render = render;
    exports.util = util;

}));
//# sourceMappingURL=tesserxel.js.map
