const _180 = Math.PI;
const _30 = Math.PI / 6;
const _60 = Math.PI / 3;
const _45 = Math.PI / 4;
const _90 = Math.PI / 2;
const _360 = Math.PI * 2;
const _DEG2RAD = Math.PI / 180;
const _RAD2DEG = 180 / Math.PI;
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
    pushPool(pool = vec2Pool) {
        pool.push(this);
    }
}
new Vec2();

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
new Mat3();

class Mat4Pool extends Pool {
    constructObject() { return new Mat4; }
}
const mat4Pool = new Mat4Pool;
class Mat4 {
    elem;
    static id = new Mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    static zero = new Mat4(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
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
    static slerp(a, b, t) {
        let cosf = a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;
        let A, B;
        if (Math.abs(cosf) > 0.99999) {
            A = 1 - t;
            B = t;
        }
        else {
            let f = Math.acos(cosf);
            let _1s = 1 / Math.sin(f);
            A = Math.sin((1 - t) * f) * _1s;
            B = Math.sin(t * f) * _1s;
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
    pushPool(pool = quaternionPool) {
        pool.push(this);
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
        return new Rotor(Quaternion.slerp(a.l, b.l, t), Quaternion.slerp(a.r, b.r, t));
    }
    toMat4() {
        return this.l.toLMat4().mulsr(_mat4.setFromQuaternionR(this.r));
    }
    /** set rotor from a rotation matrix,
     * i.e. m must be orthogonal with determinant 1.
     * algorithm: iteratively aligne each axis. */
    setFromMat4(m) {
        return this.setFromLookAt(Vec4.x, m.x_()).mulsl(_r$1.setFromLookAt(_vec4$1.copy(Vec4.y).rotates(this), m.y_())).mulsl(_r$1.setFromLookAt(_vec4$1.copy(Vec4.z).rotates(this), m.z_()));
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
        let toVect = _vec4$1.copy(from).projbs(to).norms();
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
    fromMat4(m) {
        return Rotor.lookAt(Vec4.x, m.x_()).mulsl(_r$1.setFromLookAt(_vec4$1.copy(Vec4.y).rotates(this), m.y_())).mulsl(_r$1.setFromLookAt(_vec4$1.copy(Vec4.z).rotates(this), m.z_()));
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
    static xy = new Bivec(1, 0, 0, 0, 0, 0);
    static xz = new Bivec(0, 1, 0, 0, 0, 0);
    static xw = new Bivec(0, 0, 1, 0, 0, 0);
    static yz = new Bivec(0, 0, 0, 1, 0, 0);
    static yw = new Bivec(0, 0, 0, 0, 1, 0);
    static zw = new Bivec(0, 0, 0, 0, 0, 1);
    static yx = new Bivec(-1, 0, 0, 0, 0, 0);
    static zx = new Bivec(0, -1, 0, 0, 0, 0);
    static wx = new Bivec(0, 0, -1, 0, 0, 0);
    static zy = new Bivec(0, 0, 0, -1, 0, 0);
    static wy = new Bivec(0, 0, 0, 0, -1, 0);
    static wz = new Bivec(0, 0, 0, 0, 0, -1);
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
        return this.xy * biv.zw - this.xz * biv.yw + this.xw * biv.yz + this.yz * biv.xw - this.yw * biv.xz + this.zw * biv.xz;
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
    static x = new Vec4(1, 0, 0, 0);
    static y = new Vec4(0, 1, 0, 0);
    static z = new Vec4(0, 0, 1, 0);
    static w = new Vec4(0, 0, 0, 1);
    static origin = new Vec4(0, 0, 0, 0);
    static xNeg = new Vec4(-1, 0, 0, 0);
    static yNeg = new Vec4(0, -1, 0, 0);
    static zNeg = new Vec4(0, 0, -1, 0);
    static wNeg = new Vec4(0, 0, 0, -1);
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
        return Math.max(Math.abs(this.x), Math.abs(this.y), Math.abs(this.z), Math.abs(this.z));
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
    pushPool(pool = vec4Pool) {
        pool.push(this);
    }
}
let _vec4$1 = new Vec4();
let _vec4_1 = new Vec4();

class Vec3Pool extends Pool {
    constructObject() { return new Vec3; }
}
const vec3Pool = new Vec3Pool;
class Vec3 {
    x;
    y;
    z;
    static x = new Vec3(1, 0, 0);
    static y = new Vec3(0, 1, 0);
    static z = new Vec3(0, 0, 1);
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
new Mat2();

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
    constructor(position = new Vec4(), rotation = new Rotor(), scale) {
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
    lookAt(direction, target) {
        let dir = _vec4$1.subset(target, this.position);
        this.rotates(_r$1.setFromLookAt(_vec4_1.copy(direction).rotates(this.rotation), dir.norms()));
        return this;
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
    offset;
    constructor(normal, offset) {
        this.normal = normal;
        this.offset = offset;
    }
    distanceToPoint(p) {
    }
    /** regard r as an infinity line */
    distanceToLine(r) {
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
        let A = p01.mulfs(2).adds(d0).adds(d1);
        let B = d0.mulf(-2).subs(d1).subs(p01.mulfs(1.5));
        let x = p0.x + t * (d0.x + t * (B.x + t * A.x));
        let y = p0.y + t * (d0.y + t * (B.y + t * A.y));
        let z = p0.z + t * (d0.z + t * (B.z + t * A.z));
        let w = p0.w + t * (d0.w + t * (B.w + t * A.w));
        return new Vec4(x, y, z, w);
    }
}

var math = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Vec2: Vec2,
    vec2Pool: vec2Pool,
    Vec2Pool: Vec2Pool,
    Vec3: Vec3,
    vec3Pool: vec3Pool,
    Vec3Pool: Vec3Pool,
    Vec4: Vec4,
    vec4Pool: vec4Pool,
    Vec4Pool: Vec4Pool,
    Srand: Srand,
    generateUUID: generateUUID,
    Quaternion: Quaternion,
    Bivec: Bivec,
    bivecPool: bivecPool,
    BivecPool: BivecPool,
    Mat2: Mat2,
    mat2Pool: mat2Pool,
    Mat2Pool: Mat2Pool,
    Mat3: Mat3,
    mat3Pool: mat3Pool,
    Mat3Pool: Mat3Pool,
    Mat4: Mat4,
    mat4Pool: mat4Pool,
    Mat4Pool: Mat4Pool,
    Rotor: Rotor,
    Complex: Complex,
    AffineMat4: AffineMat4,
    Obj4: Obj4,
    getPerspectiveProjectionMatrix: getPerspectiveProjectionMatrix,
    getOrthographicProjectionMatrix: getOrthographicProjectionMatrix,
    AABB: AABB,
    Plane: Plane,
    Ray: Ray,
    Spline: Spline,
    _180: _180,
    _30: _30,
    _60: _60,
    _45: _45,
    _90: _90,
    _360: _360,
    _DEG2RAD: _DEG2RAD,
    _RAD2DEG: _RAD2DEG,
    _COS30: _COS30,
    _TAN30: _TAN30,
    _GOLDRATIO: _GOLDRATIO
});

// @ts-nocheck
var wgslreflect;
(function (wgslreflect) {
    /** expectedInput:
     *  {
     *      "location(0)": "_attribute0",
     *      ...
     *  }
     *  input: set{ "location(0)", ...}
     *  expectedOutput:
     *  Array{"builtin(position)", "location(0)", ...}
     *  output: {
     *      "builtin(position)": "_output_of_fn.pos",
     *      ...
     *  }
     * */
    function parseTypeName(type) {
        return type.name + (type.format ? `<${parseTypeName(type.format)}${type.count ? "," + type.count : ""}>` : "");
    }
    wgslreflect.parseTypeName = parseTypeName;
    function parseAttr(attrs) {
        // todo: match just one attribute
        return attrs ? attrs.map(a => a.name + (a.value ? `(${a.value})` : "")).join(" ") : "";
    }
    wgslreflect.parseAttr = parseAttr;
    function getFnInputAndOutput(reflect, fn, expectInput, expectOutput) {
        let input = new Set();
        let output = {
            "return": "_ouput_of_" + fn.name
        };
        let call = `
                let _ouput_of_${fn.name} = ${fn.name}(${fn.args.map(a => getInput(a)).join(", ")});
                `;
        getOutput(fn.return, "_ouput_of_" + fn.name);
        return { input, call, output };
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
                        m.type.attributes = m.type.attributes ? m.type.attributes.concat(m.attributes) : m.attributes;
                    }
                    getOutput(m.type, prefix + "." + m.name);
                }
            }
        }
    }
    wgslreflect.getFnInputAndOutput = getFnInputAndOutput;
    /**
     * @author Brendan Duncan / https://github.com/brendan-duncan
     */
    class Token {
        constructor(type, lexeme, line) {
            this._type = type;
            this._lexeme = lexeme;
            this._line = line;
        }
        toString() {
            return this._lexeme;
        }
    }
    Token.EOF = { name: "EOF", type: "token", rule: -1 };
    let Keyword = {};
    class WgslScanner {
        constructor(source) {
            this._source = source || "";
            this._tokens = [];
            this._start = 0;
            this._current = 0;
            this._line = 1;
        }
        scanTokens() {
            while (!this._isAtEnd()) {
                this._start = this._current;
                if (!this.scanToken())
                    throw `Invalid syntax at line ${this._line}`;
            }
            this._tokens.push(new Token(Token.EOF, "", this._line));
            return this._tokens;
        }
        scanToken() {
            // Find the longest consecutive set of characters that match a rule.
            let lexeme = this._advance();
            // Skip line-feed, adding to the line counter.
            if (lexeme == "\n") {
                this._line++;
                return true;
            }
            // Skip whitespace
            if (this._isWhitespace(lexeme)) {
                return true;
            }
            if (lexeme == "/") {
                // If it's a // comment, skip everything until the next line-feed.
                if (this._peekAhead() == "/") {
                    while (lexeme != "\n") {
                        if (this._isAtEnd())
                            return true;
                        lexeme = this._advance();
                    }
                    // skip the linefeed
                    this._line++;
                    return true;
                }
                else if (this._peekAhead() == "*") {
                    // If it's a /* block comment, skip everything until the matching */,
                    // allowing for nested block comments.
                    this._advance();
                    let commentLevel = 1;
                    while (commentLevel > 0) {
                        if (this._isAtEnd())
                            return true;
                        lexeme = this._advance();
                        if (lexeme == "\n") {
                            this._line++;
                        }
                        else if (lexeme == "*") {
                            if (this._peekAhead() == "/") {
                                this._advance();
                                commentLevel--;
                                if (commentLevel == 0) {
                                    return true;
                                }
                            }
                        }
                        else if (lexeme == "/") {
                            if (this._peekAhead() == "*") {
                                this._advance();
                                commentLevel++;
                            }
                        }
                    }
                    return true;
                }
            }
            let matchToken = null;
            for (;;) {
                let matchedToken = this._findToken(lexeme);
                // The exception to "longest lexeme" rule is '>>'. In the case of 1>>2, it's a shift_right.
                // In the case of array<vec4<f32>>, it's two greater_than's (one to close the vec4,
                // and one to close the array).
                // I don't know of a great way to resolve this, so '>>' is special-cased and if
                // there was a less_than up to some number of tokens previously, and the token prior to
                // that is a keyword that requires a '<', then it will be split into two greater_than's;
                // otherwise it's a shift_right.
                if (lexeme == ">" && this._peekAhead() == ">") {
                    let foundLessThan = false;
                    let ti = this._tokens.length - 1;
                    for (let count = 0; count < 4 && ti >= 0; ++count, --ti) {
                        if (this._tokens[ti]._type == Token.less_than) {
                            if (ti > 0 && Token.template_types.indexOf(this._tokens[ti - 1]._type) != -1) {
                                foundLessThan = true;
                            }
                            break;
                        }
                    }
                    // If there was a less_than in the recent token history, then this is probably a
                    // greater_than.
                    if (foundLessThan) {
                        this._addToken(matchedToken);
                        return true;
                    }
                }
                // The current lexeme may not match any rule, but some token types may be invalid for
                // part of the string but valid after a few more characters.
                // For example, 0x.5 is a hex_float_literal. But as it's being scanned,
                // "0" is a int_literal, then "0x" is invalid. If we stopped there, it would return
                // the int_literal "0", but that's incorrect. So if we look forward a few characters,
                // we'd get "0x.", which is still invalid, followed by "0x.5" which is the correct
                // hex_float_literal. So that means if we hit an non-matching string, we should look
                // ahead up to two characters to see if the string starts matching a valid rule again.
                if (!matchedToken) {
                    let lookAheadLexeme = lexeme;
                    let lookAhead = 0;
                    const maxLookAhead = 2;
                    for (let li = 0; li < maxLookAhead; ++li) {
                        lookAheadLexeme += this._peekAhead(li);
                        matchedToken = this._findToken(lookAheadLexeme);
                        if (matchedToken) {
                            lookAhead = li;
                            break;
                        }
                    }
                    if (!matchedToken) {
                        if (!matchToken)
                            return false;
                        this._current--;
                        this._addToken(matchToken);
                        return true;
                    }
                    lexeme = lookAheadLexeme;
                    this._current += lookAhead + 1;
                }
                matchToken = matchedToken;
                if (this._isAtEnd())
                    break;
                lexeme += this._advance();
            }
            // We got to the end of the input stream. Then the token we've ready so far is it.
            if (matchToken === null)
                return false;
            this._addToken(matchToken);
            return true;
        }
        _findToken(lexeme) {
            for (const name in Keyword) {
                const token = Keyword[name];
                if (this._match(lexeme, token.rule)) {
                    return token;
                }
            }
            for (const name in Token.Tokens) {
                const token = Token.Tokens[name];
                if (this._match(lexeme, token.rule)) {
                    return token;
                }
            }
            return null;
        }
        _match(lexeme, rule) {
            if (typeof (rule) == "string") {
                if (rule == lexeme) {
                    return true;
                }
            }
            else {
                // regex
                const match = rule.exec(lexeme);
                if (match && match.index == 0 && match[0] == lexeme)
                    return true;
            }
            return false;
        }
        _isAtEnd() {
            return this._current >= this._source.length;
        }
        _isWhitespace(c) {
            return c == " " || c == "\t" || c == "\r";
        }
        _advance(amount) {
            let c = this._source[this._current];
            amount = amount || 0;
            amount++;
            this._current += amount;
            return c;
        }
        _peekAhead(offset) {
            offset = offset || 0;
            if (this._current + offset >= this._source.length)
                return "\0";
            return this._source[this._current + offset];
        }
        _addToken(type) {
            const text = this._source.substring(this._start, this._current);
            this._tokens.push(new Token(type, text, this._line));
        }
    }
    Token.WgslTokens = {
        decimal_float_literal: /((-?[0-9]*\.[0-9]+|-?[0-9]+\.[0-9]*)((e|E)(\+|-)?[0-9]+)?f?)|(-?[0-9]+(e|E)(\+|-)?[0-9]+f?)/,
        hex_float_literal: /-?0x((([0-9a-fA-F]*\.[0-9a-fA-F]+|[0-9a-fA-F]+\.[0-9a-fA-F]*)((p|P)(\+|-)?[0-9]+f?)?)|([0-9a-fA-F]+(p|P)(\+|-)?[0-9]+f?))/,
        int_literal: /-?0x[0-9a-fA-F]+|0|-?[1-9][0-9]*/,
        uint_literal: /0x[0-9a-fA-F]+u|0u|[1-9][0-9]*u/,
        ident: /[a-zA-Z][0-9a-zA-Z_]*/,
        and: '&',
        and_and: '&&',
        arrow: '->',
        attr: '@',
        attr_left: '[[',
        attr_right: ']]',
        forward_slash: '/',
        bang: '!',
        bracket_left: '[',
        bracket_right: ']',
        brace_left: '{',
        brace_right: '}',
        colon: ':',
        comma: ',',
        equal: '=',
        equal_equal: '==',
        not_equal: '!=',
        greater_than: '>',
        greater_than_equal: '>=',
        shift_right: '>>',
        less_than: '<',
        less_than_equal: '<=',
        shift_left: '<<',
        modulo: '%',
        minus: '-',
        minus_minus: '--',
        period: '.',
        plus: '+',
        plus_plus: '++',
        or: '|',
        or_or: '||',
        paren_left: '(',
        paren_right: ')',
        semicolon: ';',
        star: '*',
        tilde: '~',
        underscore: '_',
        xor: '^',
        plus_equal: '+=',
        minus_equal: '-=',
        times_equal: '*=',
        division_equal: '/=',
        modulo_equal: '%=',
        and_equal: '&=',
        or_equal: '|=',
        xor_equal: '^=',
        shift_right_equal: '>>=',
        shift_left_equal: '<<=',
    };
    Token.WgslKeywords = [
        "array",
        "atomic",
        "bool",
        "f32",
        "i32",
        "mat2x2",
        "mat2x3",
        "mat2x4",
        "mat3x2",
        "mat3x3",
        "mat3x4",
        "mat4x2",
        "mat4x3",
        "mat4x4",
        "ptr",
        "sampler",
        "sampler_comparison",
        "struct",
        "texture_1d",
        "texture_2d",
        "texture_2d_array",
        "texture_3d",
        "texture_cube",
        "texture_cube_array",
        "texture_multisampled_2d",
        "texture_storage_1d",
        "texture_storage_2d",
        "texture_storage_2d_array",
        "texture_storage_3d",
        "texture_depth_2d",
        "texture_depth_2d_array",
        "texture_depth_cube",
        "texture_depth_cube_array",
        "texture_depth_multisampled_2d",
        "u32",
        "vec2",
        "vec3",
        "vec4",
        "bitcast",
        "block",
        "break",
        "case",
        "continue",
        "continuing",
        "default",
        "discard",
        "else",
        "elseif",
        "enable",
        "fallthrough",
        "false",
        "fn",
        "for",
        "function",
        "if",
        "let",
        "const",
        "loop",
        "while",
        "private",
        "read",
        "read_write",
        "return",
        "storage",
        "switch",
        "true",
        "type",
        "uniform",
        "var",
        "workgroup",
        "write",
        "r8unorm",
        "r8snorm",
        "r8uint",
        "r8sint",
        "r16uint",
        "r16sint",
        "r16float",
        "rg8unorm",
        "rg8snorm",
        "rg8uint",
        "rg8sint",
        "r32uint",
        "r32sint",
        "r32float",
        "rg16uint",
        "rg16sint",
        "rg16float",
        "rgba8unorm",
        "rgba8unorm_srgb",
        "rgba8snorm",
        "rgba8uint",
        "rgba8sint",
        "bgra8unorm",
        "bgra8unorm_srgb",
        "rgb10a2unorm",
        "rg11b10float",
        "rg32uint",
        "rg32sint",
        "rg32float",
        "rgba16uint",
        "rgba16sint",
        "rgba16float",
        "rgba32uint",
        "rgba32sint",
        "rgba32float",
        "static_assert"
    ];
    Token.WgslReserved = [
        "asm",
        "bf16",
        "do",
        "enum",
        "f16",
        "f64",
        "handle",
        "i8",
        "i16",
        "i64",
        "mat",
        "premerge",
        "regardless",
        "typedef",
        "u8",
        "u16",
        "u64",
        "unless",
        "using",
        "vec",
        "void"
    ];
    function _InitTokens() {
        Token.Tokens = {};
        for (let token in Token.WgslTokens) {
            Token.Tokens[token] = {
                name: token,
                type: "token",
                rule: Token.WgslTokens[token],
                toString: function () { return token; }
            };
            Token[token] = Token.Tokens[token];
        }
        for (let i = 0, l = Token.WgslKeywords.length; i < l; ++i) {
            Keyword[Token.WgslKeywords[i]] = {
                name: Token.WgslKeywords[i],
                type: "keyword",
                rule: Token.WgslKeywords[i],
                toString: function () { return Token.WgslKeywords[i]; }
            };
        }
        for (let i = 0, l = Token.WgslReserved.length; i < l; ++i) {
            Keyword[Token.WgslReserved[i]] = {
                name: Token.WgslReserved[i],
                type: "reserved",
                rule: Token.WgslReserved[i],
                toString: function () { return Token.WgslReserved[i]; }
            };
        }
        // WGSL grammar has a few keywords that have different token names than the strings they
        // represent. Aliasing them here.
        Keyword.int32 = Keyword.i32;
        Keyword.uint32 = Keyword.u32;
        Keyword.float32 = Keyword.f32;
        Keyword.pointer = Keyword.ptr;
        // The grammar has a few rules where the rule can match to any one of a given set of keywords
        // or tokens. Defining those here.
        Token.storage_class = [
            Keyword.function,
            Keyword.private,
            Keyword.workgroup,
            Keyword.uniform,
            Keyword.storage
        ];
        Token.access_mode = [
            Keyword.read,
            Keyword.write,
            Keyword.read_write
        ];
        Token.sampler_type = [
            Keyword.sampler,
            Keyword.sampler_comparison
        ];
        Token.sampled_texture_type = [
            Keyword.texture_1d,
            Keyword.texture_2d,
            Keyword.texture_2d_array,
            Keyword.texture_3d,
            Keyword.texture_cube,
            Keyword.texture_cube_array
        ];
        Token.multisampled_texture_type = [
            Keyword.texture_multisampled_2d
        ];
        Token.storage_texture_type = [
            Keyword.texture_storage_1d,
            Keyword.texture_storage_2d,
            Keyword.texture_storage_2d_array,
            Keyword.texture_storage_3d
        ];
        Token.depth_texture_type = [
            Keyword.texture_depth_2d,
            Keyword.texture_depth_2d_array,
            Keyword.texture_depth_cube,
            Keyword.texture_depth_cube_array,
            Keyword.texture_depth_multisampled_2d
        ];
        Token.any_texture_type = [
            ...Token.sampled_texture_type,
            ...Token.multisampled_texture_type,
            ...Token.storage_texture_type,
            ...Token.depth_texture_type
        ];
        Token.texel_format = [
            Keyword.r8unorm,
            Keyword.r8snorm,
            Keyword.r8uint,
            Keyword.r8sint,
            Keyword.r16uint,
            Keyword.r16sint,
            Keyword.r16float,
            Keyword.rg8unorm,
            Keyword.rg8snorm,
            Keyword.rg8uint,
            Keyword.rg8sint,
            Keyword.r32uint,
            Keyword.r32sint,
            Keyword.r32float,
            Keyword.rg16uint,
            Keyword.rg16sint,
            Keyword.rg16float,
            Keyword.rgba8unorm,
            Keyword.rgba8unorm_srgb,
            Keyword.rgba8snorm,
            Keyword.rgba8uint,
            Keyword.rgba8sint,
            Keyword.bgra8unorm,
            Keyword.bgra8unorm_srgb,
            Keyword.rgb10a2unorm,
            Keyword.rg11b10float,
            Keyword.rg32uint,
            Keyword.rg32sint,
            Keyword.rg32float,
            Keyword.rgba16uint,
            Keyword.rgba16sint,
            Keyword.rgba16float,
            Keyword.rgba32uint,
            Keyword.rgba32sint,
            Keyword.rgba32float
        ];
        Token.const_literal = [
            Token.int_literal,
            Token.uint_literal,
            Token.decimal_float_literal,
            Token.hex_float_literal,
            Keyword.true,
            Keyword.false
        ];
        Token.literal_or_ident = [
            Token.ident,
            Token.int_literal,
            Token.uint_literal,
            Token.decimal_float_literal,
            Token.hex_float_literal,
        ];
        Token.element_count_expression = [
            Token.int_literal,
            Token.uint_literal,
            Token.ident
        ];
        Token.template_types = [
            Keyword.vec2,
            Keyword.vec3,
            Keyword.vec4,
            Keyword.mat2x2,
            Keyword.mat2x3,
            Keyword.mat2x4,
            Keyword.mat3x2,
            Keyword.mat3x3,
            Keyword.mat3x4,
            Keyword.mat4x2,
            Keyword.mat4x3,
            Keyword.mat4x4,
            Keyword.atomic,
            Keyword.bitcast,
            ...Token.any_texture_type,
        ];
        // The grammar calls out 'block', but attribute grammar is defined to use a 'ident'.
        // The attribute grammar should be ident | block.
        Token.attribute_name = [
            Token.ident,
            Keyword.block,
        ];
        Token.assignment_operators = [
            Token.equal,
            Token.plus_equal,
            Token.minus_equal,
            Token.times_equal,
            Token.division_equal,
            Token.modulo_equal,
            Token.and_equal,
            Token.or_equal,
            Token.xor_equal,
            Token.shift_right_equal,
            Token.shift_left_equal
        ];
        Token.increment_operators = [
            Token.plus_plus,
            Token.minus_minus
        ];
    }
    _InitTokens();
    /**
     * @author Brendan Duncan / https://github.com/brendan-duncan
     */
    class AST {
        constructor(type, options) {
            this._type = type;
            if (options) {
                for (let option in options) {
                    this[option] = options[option];
                }
            }
        }
    }
    class WgslParser {
        constructor() {
            this._tokens = [];
            this._current = 0;
        }
        parse(tokensOrCode) {
            this._initialize(tokensOrCode);
            let statements = [];
            while (!this._isAtEnd()) {
                const statement = this._global_decl_or_directive();
                if (!statement)
                    break;
                statements.push(statement);
            }
            return statements;
        }
        _initialize(tokensOrCode) {
            if (tokensOrCode) {
                if (typeof (tokensOrCode) == "string") {
                    const scanner = new WgslScanner(tokensOrCode);
                    this._tokens = scanner.scanTokens();
                }
                else {
                    this._tokens = tokensOrCode;
                }
            }
            else {
                this._tokens = [];
            }
            this._current = 0;
        }
        _error(token, message) {
            console.error(token, message);
            return { token, message, toString: function () { return `${message}`; } };
        }
        _isAtEnd() { return this._current >= this._tokens.length || this._peek()._type == Token.EOF; }
        _match(types) {
            if (types.length === undefined) {
                if (this._check(types)) {
                    this._advance();
                    return true;
                }
                return false;
            }
            for (let i = 0, l = types.length; i < l; ++i) {
                const type = types[i];
                if (this._check(type)) {
                    this._advance();
                    return true;
                }
            }
            return false;
        }
        _consume(types, message) {
            if (this._check(types))
                return this._advance();
            throw this._error(this._peek(), message);
        }
        _check(types) {
            if (this._isAtEnd())
                return false;
            if (types.length !== undefined) {
                let t = this._peek()._type;
                return types.indexOf(t) != -1;
            }
            return this._peek()._type == types;
        }
        _advance() {
            if (!this._isAtEnd())
                this._current++;
            return this._previous();
        }
        _peek() {
            return this._tokens[this._current];
        }
        _previous() {
            return this._tokens[this._current - 1];
        }
        _global_decl_or_directive() {
            // semicolon
            // global_variable_decl semicolon
            // global_constant_decl semicolon
            // type_alias semicolon
            // struct_decl
            // function_decl
            // enable_directive
            // Ignore any stand-alone semicolons
            while (this._match(Token.semicolon) && !this._isAtEnd())
                ;
            if (this._match(Keyword.type)) {
                const type = this._type_alias();
                this._consume(Token.semicolon, "Expected ';'");
                return type;
            }
            if (this._match(Keyword.enable)) {
                const enable = this._enable_directive();
                this._consume(Token.semicolon, "Expected ';'");
                return enable;
            }
            // The following statements have an optional attribute*
            const attrs = this._attribute();
            if (this._check(Keyword.var)) {
                const _var = this._global_variable_decl();
                _var.attributes = attrs;
                this._consume(Token.semicolon, "Expected ';'.");
                return _var;
            }
            if (this._check(Keyword.let) || this._check(Keyword.const)) {
                const _let = this._global_constant_decl();
                _let.attributes = attrs;
                this._consume(Token.semicolon, "Expected ';'.");
                return _let;
            }
            if (this._check(Keyword.struct)) {
                const _struct = this._struct_decl();
                _struct.attributes = attrs;
                return _struct;
            }
            if (this._check(Keyword.fn)) {
                const _fn = this._function_decl();
                _fn.attributes = attrs;
                return _fn;
            }
            return null;
        }
        _function_decl() {
            // attribute* function_header compound_statement
            // function_header: fn ident paren_left param_list? paren_right (arrow attribute* type_decl)?
            if (!this._match(Keyword.fn))
                return null;
            const name = this._consume(Token.ident, "Expected function name.").toString();
            this._consume(Token.paren_left, "Expected '(' for function arguments.");
            const args = [];
            if (!this._check(Token.paren_right)) {
                do {
                    if (this._check(Token.paren_right))
                        break;
                    const argAttrs = this._attribute();
                    const name = this._consume(Token.ident, "Expected argument name.").toString();
                    this._consume(Token.colon, "Expected ':' for argument type.");
                    const typeAttrs = this._attribute();
                    const type = this._type_decl();
                    type.attributes = typeAttrs;
                    args.push(new AST("arg", { name, attributes: argAttrs, type }));
                } while (this._match(Token.comma));
            }
            this._consume(Token.paren_right, "Expected ')' after function arguments.");
            let _return = null;
            if (this._match(Token.arrow)) {
                const attrs = this._attribute();
                _return = this._type_decl();
                _return.attributes = attrs;
            }
            const body = this._compound_statement();
            return new AST("function", { name, args, return: _return, body });
        }
        _compound_statement() {
            // brace_left statement* brace_right
            const statements = [];
            this._consume(Token.brace_left, "Expected '{' for block.");
            while (!this._check(Token.brace_right)) {
                const statement = this._statement();
                if (statement)
                    statements.push(statement);
            }
            this._consume(Token.brace_right, "Expected '}' for block.");
            return statements;
        }
        _statement() {
            // semicolon
            // return_statement semicolon
            // if_statement
            // switch_statement
            // loop_statement
            // for_statement
            // func_call_statement semicolon
            // variable_statement semicolon
            // break_statement semicolon
            // continue_statement semicolon
            // discard semicolon
            // assignment_statement semicolon
            // compound_statement
            // increment_statement semicolon
            // decrement_statement semicolon
            // static_assert_statement semicolon
            // Ignore any stand-alone semicolons
            while (this._match(Token.semicolon) && !this._isAtEnd())
                ;
            if (this._check(Keyword.if))
                return this._if_statement();
            if (this._check(Keyword.switch))
                return this._switch_statement();
            if (this._check(Keyword.loop))
                return this._loop_statement();
            if (this._check(Keyword.for))
                return this._for_statement();
            if (this._check(Keyword.while))
                return this._while_statement();
            if (this._check(Keyword.static_assert))
                return this._static_assert_statement();
            if (this._check(Token.brace_left))
                return this._compound_statement();
            let result = null;
            if (this._check(Keyword.return))
                result = this._return_statement();
            else if (this._check([Keyword.var, Keyword.let, Keyword.const]))
                result = this._variable_statement();
            else if (this._match(Keyword.discard))
                result = new AST("discard");
            else if (this._match(Keyword.break))
                result = new AST("break");
            else if (this._match(Keyword.continue))
                result = new AST("continue");
            else
                result = this._increment_decrement_statement() || this._func_call_statement() || this._assignment_statement();
            if (result != null)
                this._consume(Token.semicolon, "Expected ';' after statement.");
            return result;
        }
        _static_assert_statement() {
            if (!this._match(Keyword.static_assert))
                return null;
            let expression = this._optional_paren_expression();
            return new AST("static_assert", { expression });
        }
        _while_statement() {
            if (!this._match(Keyword.while))
                return null;
            let condition = this._optional_paren_expression();
            const block = this._compound_statement();
            return new AST("while", { condition, block });
        }
        _for_statement() {
            // for paren_left for_header paren_right compound_statement
            if (!this._match(Keyword.for))
                return null;
            this._consume(Token.paren_left, "Expected '('.");
            // for_header: (variable_statement assignment_statement func_call_statement)? semicolon short_circuit_or_expression? semicolon (assignment_statement func_call_statement)?
            const init = !this._check(Token.semicolon) ? this._for_init() : null;
            this._consume(Token.semicolon, "Expected ';'.");
            const condition = !this._check(Token.semicolon) ? this._short_circuit_or_expression() : null;
            this._consume(Token.semicolon, "Expected ';'.");
            const increment = !this._check(Token.paren_right) ? this._for_increment() : null;
            this._consume(Token.paren_right, "Expected ')'.");
            const body = this._compound_statement();
            return new AST("for", { init, condition, increment, body });
        }
        _for_init() {
            // (variable_statement assignment_statement func_call_statement)?
            return this._variable_statement() || this._func_call_statement() || this._assignment_statement();
        }
        _for_increment() {
            // (assignment_statement func_call_statement)?
            return this._increment_decrement_statement() || this._func_call_statement() || this._assignment_statement();
        }
        _variable_statement() {
            // variable_decl
            // variable_decl equal short_circuit_or_expression
            // let (ident variable_ident_decl) equal short_circuit_or_expression
            // const (ident variable_ident_decl) equal short_circuit_or_expression
            if (this._check(Keyword.var)) {
                const _var = this._variable_decl();
                let value = null;
                if (this._match(Token.equal))
                    value = this._short_circuit_or_expression();
                return new AST("var", { var: _var, value });
            }
            if (this._match(Keyword.let)) {
                const name = this._consume(Token.ident, "Expected name for let.").toString();
                let type = null;
                if (this._match(Token.colon)) {
                    const typeAttrs = this._attribute();
                    type = this._type_decl();
                    type.attributes = typeAttrs;
                }
                this._consume(Token.equal, "Expected '=' for let.");
                const value = this._short_circuit_or_expression();
                return new AST("let", { name, type, value });
            }
            if (this._match(Keyword.const)) {
                const name = this._consume(Token.ident, "Expected name for const.").toString();
                let type = null;
                if (this._match(Token.colon)) {
                    const typeAttrs = this._attribute();
                    type = this._type_decl();
                    type.attributes = typeAttrs;
                }
                this._consume(Token.equal, "Expected '=' for const.");
                const value = this._short_circuit_or_expression();
                return new AST("const", { name, type, value });
            }
            return null;
        }
        _increment_decrement_statement() {
            const savedPos = this._current;
            const _var = this._unary_expression();
            if (_var == null)
                return null;
            if (!this._check(Token.increment_operators)) {
                this._current = savedPos;
                return null;
            }
            const type = this._consume(Token.increment_operators, "Expected increment operator");
            return new AST("increment", { type, var: _var });
        }
        _assignment_statement() {
            // (unary_expression underscore) equal short_circuit_or_expression
            let _var = null;
            if (this._check(Token.brace_right))
                return null;
            let isUnderscore = this._match(Token.underscore);
            if (!isUnderscore)
                _var = this._unary_expression();
            if (!isUnderscore && _var == null)
                return null;
            const type = this._consume(Token.assignment_operators, "Expected assignment operator.");
            const value = this._short_circuit_or_expression();
            return new AST("assign", { type, var: _var, value });
        }
        _func_call_statement() {
            // ident argument_expression_list
            if (!this._check(Token.ident))
                return null;
            const savedPos = this._current;
            const name = this._consume(Token.ident, "Expected function name.");
            const args = this._argument_expression_list();
            if (args === null) {
                this._current = savedPos;
                return null;
            }
            return new AST("call", { name, args });
        }
        _loop_statement() {
            // loop brace_left statement* continuing_statement? brace_right
            if (!this._match(Keyword.loop))
                return null;
            this._consume(Token.brace_left, "Expected '{' for loop.");
            // statement*
            const statements = [];
            let statement = this._statement();
            while (statement !== null) {
                statements.push(statement);
                statement = this._statement();
            }
            // continuing_statement: continuing compound_statement
            let continuing = null;
            if (this._match(Keyword.continuing))
                continuing = this._compound_statement();
            this._consume(Token.brace_right, "Expected '}' for loop.");
            return new AST("loop", { statements, continuing });
        }
        _switch_statement() {
            // switch optional_paren_expression brace_left switch_body+ brace_right
            if (!this._match(Keyword.switch))
                return null;
            const condition = this._optional_paren_expression();
            this._consume(Token.brace_left);
            const body = this._switch_body();
            if (body == null || body.length == 0)
                throw this._error(this._previous(), "Expected 'case' or 'default'.");
            this._consume(Token.brace_right);
            return new AST("switch", { condition, body });
        }
        _switch_body() {
            // case case_selectors colon brace_left case_body? brace_right
            // default colon brace_left case_body? brace_right
            const cases = [];
            if (this._match(Keyword.case)) {
                this._consume(Keyword.case);
                const selector = this._case_selectors();
                this._consume(Token.colon, "Exected ':' for switch case.");
                this._consume(Token.brace_left, "Exected '{' for switch case.");
                const body = this._case_body();
                this._consume(Token.brace_right, "Exected '}' for switch case.");
                cases.push(new AST("case", { selector, body }));
            }
            if (this._match(Keyword.default)) {
                this._consume(Token.colon, "Exected ':' for switch default.");
                this._consume(Token.brace_left, "Exected '{' for switch default.");
                const body = this._case_body();
                this._consume(Token.brace_right, "Exected '}' for switch default.");
                cases.push(new AST("default", { body }));
            }
            if (this._check([Keyword.default, Keyword.case])) {
                const _cases = this._switch_body();
                cases.push(_cases[0]);
            }
            return cases;
        }
        _case_selectors() {
            // const_literal (comma const_literal)* comma?
            const selectors = [this._consume(Token.const_literal, "Expected constant literal").toString()];
            while (this._match(Token.comma)) {
                selectors.push(this._consume(Token.const_literal, "Expected constant literal").toString());
            }
            return selectors;
        }
        _case_body() {
            // statement case_body?
            // fallthrough semicolon
            if (this._match(Keyword.fallthrough)) {
                this._consume(Token.semicolon);
                return [];
            }
            const statement = this._statement();
            if (statement == null)
                return [];
            const nextStatement = this._case_body();
            if (nextStatement.length == 0)
                return [statement];
            return [statement, nextStatement[0]];
        }
        _if_statement() {
            // if optional_paren_expression compound_statement elseif_statement? else_statement?
            if (!this._match(Keyword.if))
                return null;
            const condition = this._optional_paren_expression();
            const block = this._compound_statement();
            let elseif = null;
            if (this._match(Keyword.elseif))
                elseif = this._elseif_statement();
            let _else = null;
            if (this._match(Keyword.else))
                _else = this._compound_statement();
            return new AST("if", { condition, block, elseif, else: _else });
        }
        _elseif_statement() {
            // else_if optional_paren_expression compound_statement elseif_statement?
            const elseif = [];
            const condition = this._optional_paren_expression();
            const block = this._compound_statement();
            elseif.push(new AST("elseif", { condition, block }));
            if (this._match(Keyword.elseif))
                elseif.push(this._elseif_statement()[0]);
            return elseif;
        }
        _return_statement() {
            // return short_circuit_or_expression?
            if (!this._match(Keyword.return))
                return null;
            const value = this._short_circuit_or_expression();
            return new AST("return", { value: value });
        }
        _short_circuit_or_expression() {
            // short_circuit_and_expression
            // short_circuit_or_expression or_or short_circuit_and_expression
            let expr = this._short_circuit_and_expr();
            while (this._match(Token.or_or)) {
                expr = new AST("compareOp", {
                    operator: this._previous().toString(),
                    left: expr,
                    right: this._short_circuit_and_expr()
                });
            }
            return expr;
        }
        _short_circuit_and_expr() {
            // inclusive_or_expression
            // short_circuit_and_expression and_and inclusive_or_expression
            let expr = this._inclusive_or_expression();
            while (this._match(Token.and_and)) {
                expr = new AST("compareOp", {
                    operator: this._previous().toString(),
                    left: expr,
                    right: this._inclusive_or_expression()
                });
            }
            return expr;
        }
        _inclusive_or_expression() {
            // exclusive_or_expression
            // inclusive_or_expression or exclusive_or_expression
            let expr = this._exclusive_or_expression();
            while (this._match(Token.or)) {
                expr = new AST("binaryOp", {
                    operator: this._previous().toString(),
                    left: expr,
                    right: this._exclusive_or_expression()
                });
            }
            return expr;
        }
        _exclusive_or_expression() {
            // and_expression
            // exclusive_or_expression xor and_expression
            let expr = this._and_expression();
            while (this._match(Token.xor)) {
                expr = new AST("binaryOp", {
                    operator: this._previous().toString(),
                    left: expr,
                    right: this._and_expression()
                });
            }
            return expr;
        }
        _and_expression() {
            // equality_expression
            // and_expression and equality_expression
            let expr = this._equality_expression();
            while (this._match(Token.and)) {
                expr = new AST("binaryOp", {
                    operator: this._previous().toString(),
                    left: expr,
                    right: this._equality_expression()
                });
            }
            return expr;
        }
        _equality_expression() {
            // relational_expression
            // relational_expression equal_equal relational_expression
            // relational_expression not_equal relational_expression
            const expr = this._relational_expression();
            if (this._match([Token.equal_equal, Token.not_equal])) {
                return new AST("compareOp", {
                    operator: this._previous().toString(),
                    left: expr,
                    right: this._relational_expression()
                });
            }
            return expr;
        }
        _relational_expression() {
            // shift_expression
            // relational_expression less_than shift_expression
            // relational_expression greater_than shift_expression
            // relational_expression less_than_equal shift_expression
            // relational_expression greater_than_equal shift_expression
            let expr = this._shift_expression();
            while (this._match([Token.less_than, Token.greater_than, Token.less_than_equal,
                Token.greater_than_equal])) {
                expr = new AST("compareOp", {
                    operator: this._previous().toString(),
                    left: expr,
                    right: this._shift_expression()
                });
            }
            return expr;
        }
        _shift_expression() {
            // additive_expression
            // shift_expression shift_left additive_expression
            // shift_expression shift_right additive_expression
            let expr = this._additive_expression();
            while (this._match([Token.shift_left, Token.shift_right])) {
                expr = new AST("binaryOp", {
                    operator: this._previous().toString(),
                    left: expr,
                    right: this._additive_expression()
                });
            }
            return expr;
        }
        _additive_expression() {
            // multiplicative_expression
            // additive_expression plus multiplicative_expression
            // additive_expression minus multiplicative_expression
            let expr = this._multiplicative_expression();
            while (this._match([Token.plus, Token.minus])) {
                expr = new AST("binaryOp", {
                    operator: this._previous().toString(),
                    left: expr,
                    right: this._multiplicative_expression()
                });
            }
            return expr;
        }
        _multiplicative_expression() {
            // unary_expression
            // multiplicative_expression star unary_expression
            // multiplicative_expression forward_slash unary_expression
            // multiplicative_expression modulo unary_expression
            let expr = this._unary_expression();
            while (this._match([Token.star, Token.forward_slash, Token.modulo])) {
                expr = new AST("binaryOp", {
                    operator: this._previous().toString(),
                    left: expr,
                    right: this._unary_expression()
                });
            }
            return expr;
        }
        _unary_expression() {
            // singular_expression
            // minus unary_expression
            // bang unary_expression
            // tilde unary_expression
            // star unary_expression
            // and unary_expression
            if (this._match([Token.minus, Token.bang, Token.tilde, Token.star, Token.and])) {
                return new AST("unaryOp", {
                    operator: this._previous().toString(), right: this._unary_expression()
                });
            }
            return this._singular_expression();
        }
        _singular_expression() {
            // primary_expression postfix_expression ?
            const expr = this._primary_expression();
            const p = this._postfix_expression();
            if (p)
                expr.postfix = p;
            return expr;
        }
        _postfix_expression() {
            // bracket_left short_circuit_or_expression bracket_right postfix_expression?
            if (this._match(Token.bracket_left)) {
                const expr = this._short_circuit_or_expression();
                this._consume(Token.bracket_right, "Expected ']'.");
                const p = this._postfix_expression();
                if (p)
                    expr.postfix = p;
                return expr;
            }
            // period ident postfix_expression?
            if (this._match(Token.period)) {
                const name = this._consume(Token.ident, "Expected member name.");
                const p = this._postfix_expression();
                if (p)
                    name.postfix = p;
                return name;
            }
            return null;
        }
        _primary_expression() {
            // ident argument_expression_list?
            if (this._match(Token.ident)) {
                const name = this._previous().toString();
                if (this._check(Token.paren_left)) {
                    const args = this._argument_expression_list();
                    return new AST("call_expr", { name, args });
                }
                return new AST("variable_expr", { name });
            }
            // const_literal
            if (this._match(Token.const_literal)) {
                return new AST("literal_expr", { value: this._previous().toString() });
            }
            // paren_expression
            if (this._check(Token.paren_left)) {
                return this._paren_expression();
            }
            // bitcast less_than type_decl greater_than paren_expression
            if (this._match(Keyword.bitcast)) {
                this._consume(Token.less_than, "Expected '<'.");
                const type = this._type_decl();
                this._consume(Token.greater_than, "Expected '>'.");
                const value = this._paren_expression();
                return new AST("bitcast_expr", { type, value });
            }
            // type_decl argument_expression_list
            const type = this._type_decl();
            const args = this._argument_expression_list();
            return new AST("typecast_expr", { type, args });
        }
        _argument_expression_list() {
            // paren_left ((short_circuit_or_expression comma)* short_circuit_or_expression comma?)? paren_right
            if (!this._match(Token.paren_left))
                return null;
            const args = [];
            do {
                if (this._check(Token.paren_right))
                    break;
                const arg = this._short_circuit_or_expression();
                args.push(arg);
            } while (this._match(Token.comma));
            this._consume(Token.paren_right, "Expected ')' for agument list");
            return args;
        }
        _optional_paren_expression() {
            // [paren_left] short_circuit_or_expression [paren_right]
            this._match(Token.paren_left);
            const expr = this._short_circuit_or_expression();
            this._match(Token.paren_right);
            return new AST("grouping_expr", { contents: expr });
        }
        _paren_expression() {
            // paren_left short_circuit_or_expression paren_right
            this._consume(Token.paren_left, "Expected '('.");
            const expr = this._short_circuit_or_expression();
            this._consume(Token.paren_right, "Expected ')'.");
            return new AST("grouping_expr", { contents: expr });
        }
        _struct_decl() {
            // attribute* struct ident struct_body_decl
            if (!this._match(Keyword.struct))
                return null;
            const name = this._consume(Token.ident, "Expected name for struct.").toString();
            // struct_body_decl: brace_left (struct_member comma)* struct_member comma? brace_right
            this._consume(Token.brace_left, "Expected '{' for struct body.");
            const members = [];
            while (!this._check(Token.brace_right)) {
                // struct_member: attribute* variable_ident_decl
                const memberAttrs = this._attribute();
                const memberName = this._consume(Token.ident, "Expected variable name.").toString();
                this._consume(Token.colon, "Expected ':' for struct member type.");
                const typeAttrs = this._attribute();
                const memberType = this._type_decl();
                memberType.attributes = typeAttrs;
                if (!this._check(Token.brace_right))
                    this._consume(Token.comma, "Expected ',' for struct member.");
                else
                    this._match(Token.comma); // trailing comma optional.
                members.push(new AST("member", {
                    name: memberName,
                    attributes: memberAttrs,
                    type: memberType
                }));
            }
            this._consume(Token.brace_right, "Expected '}' after struct body.");
            return new AST("struct", { name, members });
        }
        _global_variable_decl() {
            // attribute* variable_decl (equal const_expression)?
            const _var = this._variable_decl();
            if (this._match(Token.equal))
                _var.value = this._const_expression();
            return _var;
        }
        _global_constant_decl() {
            // attribute* let (ident variable_ident_decl) global_const_initializer?
            if (!this._match(Keyword.let) && !this._match(Keyword.const))
                return null;
            const name = this._consume(Token.ident, "Expected variable name");
            let type = null;
            if (this._match(Token.colon)) {
                const attrs = this._attribute();
                type = this._type_decl();
                type.attributes = attrs;
            }
            let value = null;
            if (this._match(Token.equal)) {
                value = this._const_expression();
            }
            return new AST("let", { name: name.toString(), type, value });
        }
        _const_expression() {
            // type_decl paren_left ((const_expression comma)* const_expression comma?)? paren_right
            // const_literal
            if (this._match(Token.const_literal))
                return this._previous().toString();
            const type = this._type_decl();
            this._consume(Token.paren_left, "Expected '('.");
            let args = [];
            while (!this._check(Token.paren_right)) {
                args.push(this._const_expression());
                if (!this._check(Token.comma))
                    break;
                this._advance();
            }
            this._consume(Token.paren_right, "Expected ')'.");
            return new AST("create", { type, args });
        }
        _variable_decl() {
            // var variable_qualifier? (ident variable_ident_decl)
            if (!this._match(Keyword.var))
                return null;
            // variable_qualifier: less_than storage_class (comma access_mode)? greater_than
            let storage = null;
            let access = null;
            if (this._match(Token.less_than)) {
                storage = this._consume(Token.storage_class, "Expected storage_class.").toString();
                if (this._match(Token.comma))
                    access = this._consume(Token.access_mode, "Expected access_mode.").toString();
                this._consume(Token.greater_than, "Expected '>'.");
            }
            const name = this._consume(Token.ident, "Expected variable name");
            let type = null;
            if (this._match(Token.colon)) {
                const attrs = this._attribute();
                type = this._type_decl();
                type.attributes = attrs;
            }
            return new AST("var", { name: name.toString(), type, storage, access });
        }
        _enable_directive() {
            // enable ident semicolon
            const name = this._consume(Token.ident, "identity expected.");
            return new AST("enable", { name: name.toString() });
        }
        _type_alias() {
            // type ident equal type_decl
            const name = this._consume(Token.ident, "identity expected.");
            this._consume(Token.equal, "Expected '=' for type alias.");
            const alias = this._type_decl();
            return new AST("alias", { name: name.toString(), alias });
        }
        _type_decl() {
            // ident
            // bool
            // float32
            // int32
            // uint32
            // vec2 less_than type_decl greater_than
            // vec3 less_than type_decl greater_than
            // vec4 less_than type_decl greater_than
            // mat2x2 less_than type_decl greater_than
            // mat2x3 less_than type_decl greater_than
            // mat2x4 less_than type_decl greater_than
            // mat3x2 less_than type_decl greater_than
            // mat3x3 less_than type_decl greater_than
            // mat3x4 less_than type_decl greater_than
            // mat4x2 less_than type_decl greater_than
            // mat4x3 less_than type_decl greater_than
            // mat4x4 less_than type_decl greater_than
            // atomic less_than type_decl greater_than
            // pointer less_than storage_class comma type_decl (comma access_mode)? greater_than
            // array_type_decl
            // texture_sampler_types
            if (this._check([Token.ident, ...Token.texel_format, Keyword.bool, Keyword.float32, Keyword.int32, Keyword.uint32])) {
                const type = this._advance();
                return new AST("type", { name: type.toString() });
            }
            if (this._check(Token.template_types)) {
                let type = this._advance().toString();
                this._consume(Token.less_than, "Expected '<' for type.");
                const format = this._type_decl();
                let access = null;
                if (this._match(Token.comma))
                    access = this._consume(Token.access_mode, "Expected access_mode for pointer").toString();
                this._consume(Token.greater_than, "Expected '>' for type.");
                return new AST(type, { name: type, format, access });
            }
            // pointer less_than storage_class comma type_decl (comma access_mode)? greater_than
            if (this._match(Keyword.pointer)) {
                let pointer = this._previous().toString();
                this._consume(Token.less_than, "Expected '<' for pointer.");
                const storage = this._consume(Token.storage_class, "Expected storage_class for pointer");
                this._consume(Token.comma, "Expected ',' for pointer.");
                const decl = this._type_decl();
                let access = null;
                if (this._match(Token.comma))
                    access = this._consume(Token.access_mode, "Expected access_mode for pointer").toString();
                this._consume(Token.greater_than, "Expected '>' for pointer.");
                return new AST("pointer", { name: pointer, storage: storage.toString(), decl, access });
            }
            // texture_sampler_types
            let type = this._texture_sampler_types();
            if (type)
                return type;
            // The following type_decl's have an optional attribyte_list*
            const attrs = this._attribute();
            // attribute* array less_than type_decl (comma element_count_expression)? greater_than
            if (this._match(Keyword.array)) {
                const array = this._previous();
                this._consume(Token.less_than, "Expected '<' for array type.");
                const format = this._type_decl();
                let count = null;
                if (this._match(Token.comma))
                    count = this._consume(Token.element_count_expression, "Expected element_count for array.").toString();
                this._consume(Token.greater_than, "Expected '>' for array.");
                return new AST("array", { name: array.toString(), attributes: attrs, format, count });
            }
            return null;
        }
        _texture_sampler_types() {
            // sampler_type
            if (this._match(Token.sampler_type))
                return new AST("sampler", { name: this._previous().toString() });
            // depth_texture_type
            if (this._match(Token.depth_texture_type))
                return new AST("sampler", { name: this._previous().toString() });
            // sampled_texture_type less_than type_decl greater_than
            // multisampled_texture_type less_than type_decl greater_than
            if (this._match(Token.sampled_texture_type) ||
                this._match(Token.multisampled_texture_type)) {
                const sampler = this._previous();
                this._consume(Token.less_than, "Expected '<' for sampler type.");
                const format = this._type_decl();
                this._consume(Token.greater_than, "Expected '>' for sampler type.");
                return new AST("sampler", { name: sampler.toString(), format });
            }
            // storage_texture_type less_than texel_format comma access_mode greater_than
            if (this._match(Token.storage_texture_type)) {
                const sampler = this._previous();
                this._consume(Token.less_than, "Expected '<' for sampler type.");
                const format = this._consume(Token.texel_format, "Invalid texel format.").toString();
                this._consume(Token.comma, "Expected ',' after texel format.");
                const access = this._consume(Token.access_mode, "Expected access mode for storage texture type.").toString();
                this._consume(Token.greater_than, "Expected '>' for sampler type.");
                return new AST("sampler", { name: sampler.toString(), format, access });
            }
            return null;
        }
        _attribute() {
            // attr ident paren_left (literal_or_ident comma)* literal_or_ident paren_right
            // attr ident
            let attributes = [];
            while (this._match(Token.attr)) {
                const name = this._consume(Token.attribute_name, "Expected attribute name");
                const attr = new AST("attribute", { name: name.toString() });
                if (this._match(Token.paren_left)) {
                    // literal_or_ident
                    attr.value = this._consume(Token.literal_or_ident, "Expected attribute value").toString();
                    if (this._check(Token.comma)) {
                        this._advance();
                        attr.value = [attr.value];
                        do {
                            const v = this._consume(Token.literal_or_ident, "Expected attribute value").toString();
                            attr.value.push(v);
                        } while (this._match(Token.comma));
                    }
                    this._consume(Token.paren_right, "Expected ')'");
                }
                attributes.push(attr);
            }
            // Deprecated:
            // attr_left (attribute comma)* attribute attr_right
            while (this._match(Token.attr_left)) {
                if (!this._check(Token.attr_right)) {
                    do {
                        const name = this._consume(Token.attribute_name, "Expected attribute name");
                        const attr = new AST("attribute", { name: name.toString() });
                        if (this._match(Token.paren_left)) {
                            // literal_or_ident
                            attr.value = this._consume(Token.literal_or_ident, "Expected attribute value").toString();
                            if (this._check(Token.comma)) {
                                this._advance();
                                attr.value = [attr.value];
                                do {
                                    const v = this._consume(Token.literal_or_ident, "Expected attribute value").toString();
                                    attr.value.push(v);
                                } while (this._match(Token.comma));
                            }
                            this._consume(Token.paren_right, "Expected ')'");
                        }
                        attributes.push(attr);
                    } while (this._match(Token.comma));
                }
                // Consume ]]
                this._consume(Token.attr_right, "Expected ']]' after attribute declarations");
            }
            if (attributes.length == 0)
                return null;
            return attributes;
        }
    }
    /**
     * @author Brendan Duncan / https://github.com/brendan-duncan
     */
    class WgslReflect {
        functions;
        structs;
        constructor(code) {
            if (code)
                this.initialize(code);
        }
        initialize(code) {
            const parser = new WgslParser();
            this.ast = parser.parse(code);
            // All top-level structs in the shader.
            this.structs = [];
            // All top-level uniform vars in the shader.
            this.uniforms = [];
            // All top-level storage vars in the shader.
            this.storage = [];
            // All top-level texture vars in the shader;
            this.textures = [];
            // All top-level sampler vars in the shader.
            this.samplers = [];
            // All top-level functions in the shader.
            this.functions = [];
            // All top-level type aliases in the shader.
            this.aliases = [];
            // All entry functions in the shader: vertex, fragment, and/or compute.
            this.entry = {
                vertex: [],
                fragment: [],
                compute: []
            };
            for (const node of this.ast) {
                if (node._type == "struct")
                    this.structs.push(node);
                if (node._type == "alias")
                    this.aliases.push(node);
                if (this.isUniformVar(node)) {
                    const group = this.getAttribute(node, "group");
                    node.group = group && group.value ? parseInt(group.value) : 0;
                    const binding = this.getAttribute(node, "binding");
                    node.binding = binding && binding.value ? parseInt(binding.value) : 0;
                    this.uniforms.push(node);
                }
                if (this.isStorageVar(node)) {
                    const group = this.getAttribute(node, "group");
                    node.group = group && group.value ? parseInt(group.value) : 0;
                    const binding = this.getAttribute(node, "binding");
                    node.binding = binding && binding.value ? parseInt(binding.value) : 0;
                    this.storage.push(node);
                }
                if (this.isTextureVar(node)) {
                    const group = this.getAttribute(node, "group");
                    node.group = group && group.value ? parseInt(group.value) : 0;
                    const binding = this.getAttribute(node, "binding");
                    node.binding = binding && binding.value ? parseInt(binding.value) : 0;
                    this.textures.push(node);
                }
                if (this.isSamplerVar(node)) {
                    const group = this.getAttribute(node, "group");
                    node.group = group && group.value ? parseInt(group.value) : 0;
                    const binding = this.getAttribute(node, "binding");
                    node.binding = binding && binding.value ? parseInt(binding.value) : 0;
                    this.samplers.push(node);
                }
                if (node._type == "function") {
                    this.functions.push(node);
                    const vertexStage = this.getAttribute(node, "vertex");
                    const fragmentStage = this.getAttribute(node, "fragment");
                    const computeStage = this.getAttribute(node, "compute");
                    const stage = vertexStage || fragmentStage || computeStage;
                    if (stage) {
                        node.inputs = this._getInputs(node);
                        if (this.entry[stage.name])
                            this.entry[stage.name].push(node);
                        else
                            this.entry[stage.name] = [node];
                    }
                }
            }
        }
        isTextureVar(node) {
            return node._type == "var" && WgslReflect.TextureTypes.indexOf(node.type.name) != -1;
        }
        isSamplerVar(node) {
            return node._type == "var" && WgslReflect.SamplerTypes.indexOf(node.type.name) != -1;
        }
        isUniformVar(node) {
            return node && node._type == "var" && node.storage == "uniform";
        }
        isStorageVar(node) {
            return node && node._type == "var" && node.storage == "storage";
        }
        _getInputs(args, inputs) {
            if (args._type == "function")
                args = args.args;
            if (!inputs)
                inputs = [];
            for (const arg of args) {
                const input = this._getInputInfo(arg);
                if (input)
                    inputs.push(input);
                const struct = this.getStruct(arg.type);
                if (struct)
                    this._getInputs(struct.members, inputs);
            }
            return inputs;
        }
        _getInputInfo(node) {
            const location = this.getAttribute(node, "location") || this.getAttribute(node, "builtin");
            if (location) {
                let input = {
                    name: node.name,
                    type: node.type,
                    input: node,
                    locationType: location.name,
                    location: this._parseInt(location.value)
                };
                const interpolation = this.getAttribute(node, "interpolation");
                if (interpolation)
                    input.interpolation = interpolation.value;
                return input;
            }
            return null;
        }
        _parseInt(s) {
            const n = parseInt(s);
            return isNaN(n) ? s : n;
        }
        getAlias(name) {
            if (!name)
                return null;
            if (name.constructor === AST) {
                if (name._type != "type")
                    return null;
                name = name.name;
            }
            for (const u of this.aliases) {
                if (u.name == name)
                    return u.alias;
            }
            return null;
        }
        getStruct(name) {
            if (!name)
                return null;
            if (name.constructor === AST) {
                if (name._type == "struct")
                    return name;
                if (name._type != "type")
                    return null;
                name = name.name;
            }
            for (const u of this.structs) {
                if (u.name == name)
                    return u;
            }
            return null;
        }
        getAttribute(node, name) {
            if (!node || !node.attributes)
                return null;
            for (let a of node.attributes) {
                if (a.name == name)
                    return a;
            }
            return null;
        }
        getBindGroups() {
            const groups = [];
            function _makeRoom(group, binding) {
                if (group >= groups.length)
                    groups.length = group + 1;
                if (groups[group] === undefined)
                    groups[group] = [];
                if (binding >= groups[group].length)
                    groups[group].length = binding + 1;
            }
            for (const u of this.uniforms) {
                _makeRoom(u.group, u.binding);
                const group = groups[u.group];
                group[u.binding] = { type: 'buffer', resource: this.getUniformBufferInfo(u) };
            }
            for (const u of this.storage) {
                _makeRoom(u.group, u.binding);
                const group = groups[u.group];
                group[u.binding] = { type: 'storage', resource: this.getStorageBufferInfo(u) };
            }
            for (const t of this.textures) {
                _makeRoom(t.group, t.binding);
                const group = groups[t.group];
                group[t.binding] = { type: 'texture', resource: t };
            }
            for (const t of this.samplers) {
                _makeRoom(t.group, t.binding);
                const group = groups[t.group];
                group[t.binding] = { type: 'sampler', resource: t };
            }
            return groups;
        }
        getStorageBufferInfo(node) {
            if (!this.isStorageVar(node))
                return null;
            let group = this.getAttribute(node, "group");
            let binding = this.getAttribute(node, "binding");
            group = group && group.value ? parseInt(group.value) : 0;
            binding = binding && binding.value ? parseInt(binding.value) : 0;
            return { name: node.name, type: node.type, group, binding };
        }
        getUniformBufferInfo(node) {
            if (!this.isUniformVar(node))
                return null;
            let group = this.getAttribute(node, "group");
            let binding = this.getAttribute(node, "binding");
            group = group && group.value ? parseInt(group.value) : 0;
            binding = binding && binding.value ? parseInt(binding.value) : 0;
            const struct = this.getStruct(node.type);
            let offset = 0;
            let lastSize = 0;
            let lastOffset = 0;
            let structAlign = 0;
            let buffer = { name: node.name, type: 'uniform', align: 0, size: 0, members: [], group, binding };
            for (let mi = 0, ml = struct.members.length; mi < ml; ++mi) {
                let member = struct.members[mi];
                let name = member.name;
                let info = this.getTypeInfo(member);
                if (!info)
                    continue;
                let type = member.type;
                let align = info.align;
                let size = info.size;
                offset = this._roundUp(align, offset + lastSize);
                lastSize = size;
                lastOffset = offset;
                structAlign = Math.max(structAlign, align);
                let u = { name, offset, size, type, member };
                buffer.members.push(u);
            }
            buffer.size = this._roundUp(structAlign, lastOffset + lastSize);
            buffer.align = structAlign;
            return buffer;
        }
        getTypeInfo(type) {
            let explicitSize = 0;
            const sizeAttr = this.getAttribute(type, "size");
            if (sizeAttr)
                explicitSize = parseInt(sizeAttr.value);
            let explicitAlign = 0;
            const alignAttr = this.getAttribute(type, "align");
            if (alignAttr)
                explicitAlign = parseInt(alignAttr.value);
            if (type._type == "member")
                type = type.type;
            if (type._type == "type") {
                const alias = this.getAlias(type.name);
                if (alias) {
                    type = alias;
                }
                else {
                    const struct = this.getStruct(type.name);
                    if (struct)
                        type = struct;
                }
            }
            const info = WgslReflect.TypeInfo[type.name];
            if (info) {
                return {
                    align: Math.max(explicitAlign, info.align),
                    size: Math.max(explicitSize, info.size)
                };
            }
            if (type.name == "array") {
                let align = 8;
                let size = 8;
                // Type                 AlignOf(T)          Sizeof(T)
                // array<E, N>          AlignOf(E)          N * roundUp(AlignOf(E), SizeOf(E))
                // array<E>             AlignOf(E)          N * roundUp(AlignOf(E), SizeOf(E))  (N determined at runtime)
                //
                // @stride(Q)
                // array<E, N>          AlignOf(E)          N * Q
                //
                // @stride(Q)
                // array<E>             AlignOf(E)          Nruntime * Q
                //const E = type.format.name;
                const E = this.getTypeInfo(type.format);
                if (E) {
                    size = E.size;
                    align = E.align;
                }
                const N = parseInt(type.count || 1);
                const stride = this.getAttribute(type, "stride");
                if (stride) {
                    size = N * parseInt(stride.value);
                }
                else {
                    size = N * this._roundUp(align, size);
                }
                if (explicitSize)
                    size = explicitSize;
                return {
                    align: Math.max(explicitAlign, align),
                    size: Math.max(explicitSize, size)
                };
            }
            if (type._type == "struct") {
                let align = 0;
                let size = 0;
                // struct S     AlignOf:    max(AlignOfMember(S, M1), ... , AlignOfMember(S, MN))
                //              SizeOf:     roundUp(AlignOf(S), OffsetOfMember(S, L) + SizeOfMember(S, L))
                //                          Where L is the last member of the structure
                let offset = 0;
                let lastSize = 0;
                let lastOffset = 0;
                for (const m of type.members) {
                    const mi = this.getTypeInfo(m);
                    align = Math.max(mi.align, align);
                    offset = this._roundUp(mi.align, offset + lastSize);
                    lastSize = mi.size;
                    lastOffset = offset;
                }
                size = this._roundUp(align, lastOffset + lastSize);
                return {
                    align: Math.max(explicitAlign, align),
                    size: Math.max(explicitSize, size)
                };
            }
            return null;
        }
        _roundUp(k, n) {
            return Math.ceil(n / k) * k;
        }
    }
    wgslreflect.WgslReflect = WgslReflect;
    // Type                 AlignOf(T)          Sizeof(T)
    // i32, u32, or f32     4                   4
    // atomic<T>            4                   4
    // vec2<T>              8                   8
    // vec3<T>              16                  12
    // vec4<T>              16                  16
    // mat2x2<f32>          8                   16
    // mat3x2<f32>          8                   24
    // mat4x2<f32>          8                   32
    // mat2x3<f32>          16                  32
    // mat3x3<f32>          16                  48
    // mat4x3<f32>          16                  64
    // mat2x4<f32>          16                  32
    // mat3x4<f32>          16                  48
    // mat4x4<f32>          16                  64
    WgslReflect.TypeInfo = {
        "i32": { align: 4, size: 4 },
        "u32": { align: 4, size: 4 },
        "f32": { align: 4, size: 4 },
        "atomic": { align: 4, size: 4 },
        "vec2": { align: 8, size: 8 },
        "vec3": { align: 16, size: 12 },
        "vec4": { align: 16, size: 16 },
        "mat2x2": { align: 8, size: 16 },
        "mat3x2": { align: 8, size: 24 },
        "mat4x2": { align: 8, size: 32 },
        "mat2x3": { align: 16, size: 32 },
        "mat3x3": { align: 16, size: 48 },
        "mat4x3": { align: 16, size: 64 },
        "mat2x4": { align: 16, size: 32 },
        "mat3x4": { align: 16, size: 48 },
        "mat4x4": { align: 16, size: 64 },
    };
    WgslReflect.TextureTypes = Token.any_texture_type.map((t) => { return t.name; });
    WgslReflect.SamplerTypes = Token.sampler_type.map((t) => { return t.name; });
    // export { AST, Keyword, Token, WgslParser, WgslReflect, WgslScanner };
})(wgslreflect || (wgslreflect = {}));

var SliceFacing;
(function (SliceFacing) {
    SliceFacing[SliceFacing["POSZ"] = 0] = "POSZ";
    SliceFacing[SliceFacing["NEGZ"] = 1] = "NEGZ";
    SliceFacing[SliceFacing["POSY"] = 2] = "POSY";
    SliceFacing[SliceFacing["NEGY"] = 3] = "NEGY";
    SliceFacing[SliceFacing["POSX"] = 4] = "POSX";
    SliceFacing[SliceFacing["NEGX"] = 5] = "NEGX";
})(SliceFacing || (SliceFacing = {}));
var EyeOffset;
(function (EyeOffset) {
    EyeOffset[EyeOffset["LeftEye"] = 0] = "LeftEye";
    EyeOffset[EyeOffset["None"] = 1] = "None";
    EyeOffset[EyeOffset["RightEye"] = 2] = "RightEye";
})(EyeOffset || (EyeOffset = {}));
const DefaultWorkGroupSize = 256;
const DefaultRetinaResolution = 512;
const DefaultSliceGroupSize = 16;
const DefaultMaxSlicesNumber = 256;
const DefaultMaxCrossSectionBufferSize = 0x800000;
const DefaultEnableFloat16Blend = true;
const DefaultRetinaFov = 40;
const DefaultRetinaSize = 1.8;
class SliceRenderer {
    getSafeTetraNumInOnePass() {
        // maximum vertices per slice
        let maxVertices = this.maxCrossSectionBufferSize >> (this.sliceGroupSizeBit + 4);
        // one tetra generate at most 6 vertices
        return Math.floor(maxVertices / 6);
    }
    // configurations
    maxSlicesNumber;
    maxCrossSectionBufferSize;
    /** On each computeshader slice calling numbers, should be 2^n */
    sliceGroupSize;
    sliceGroupSizeBit;
    screenSize;
    outputBufferStride;
    viewportCompressShift;
    blendFormat;
    displayConfig;
    sliceTextureSize;
    // GPU resources
    gpu;
    context;
    crossRenderVertexShaderModule;
    screenTexture;
    screenView;
    linearTextureSampler;
    nearestTextureSampler;
    crossRenderPassDescClear;
    crossRenderPassDescLoad;
    clearRenderPipeline;
    retinaRenderPipeline;
    screenRenderPipeline;
    retinaBindGroup;
    screenBindGroup;
    sliceView;
    depthView;
    outputVaryBufferPool = []; // all the vary buffers for pipelines
    sliceOffsetBuffer;
    emitIndexSliceBuffer;
    refacingBuffer; // refacing buffer stores not only refacing but also retina slices
    eyeCrossBuffer;
    thumbnailViewportBuffer;
    sliceGroupOffsetBuffer;
    retinaMVBuffer;
    retinaPBuffer;
    screenAspectBuffer;
    layerOpacityBuffer;
    camProjBuffer;
    static outputAttributeUsage = typeof GPUBufferUsage === 'undefined' ? null : GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX;
    // CPU caches for retina and screen
    slicesJsBuffer;
    camProjJsBuffer = new Float32Array(4);
    retinaProjecJsBuffer = new Float32Array(16);
    retinaMVMatJsBuffer = new Float32Array(16);
    currentRetinaFacing;
    retinaMatrixChanged = true;
    retinaFacingChanged = true;
    screenClearColor = { r: 0, g: 0, b: 0, a: 0.0 };
    renderState;
    enableEye3D;
    refacingMatsCode;
    crossHairSize = 0;
    // section thumbnail
    totalGroupNum;
    sliceGroupNum;
    async init(gpu, context, options) {
        // constants generations
        // by default we maximum sliceGroupSize value according to maximum 2d texture size
        let sliceGroupSize = options?.sliceGroupSize ?? DefaultSliceGroupSize;
        // sliceTexture covered by sliceGroupSize x 2 atlas of sliceResolution x sliceResolution
        let maxTextureSize = gpu.device.limits.maxTextureDimension2D;
        let sliceTextureSize = { width: maxTextureSize >> 1, height: maxTextureSize };
        let power2arr = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512];
        let sliceGroupSizeBit = power2arr.indexOf(sliceGroupSize);
        let outputBufferSize = (options?.maxCrossSectionBufferSize ?? DefaultMaxCrossSectionBufferSize);
        let outputBufferStride = outputBufferSize >> sliceGroupSizeBit;
        let maxSlicesNumber = options?.maxSlicesNumber ?? DefaultMaxSlicesNumber;
        let enableFloat16Blend = (options?.enableFloat16Blend ?? DefaultEnableFloat16Blend);
        let blendFormat = enableFloat16Blend === true ? 'rgba16float' : gpu.preferredFormat;
        this.sliceGroupSize = sliceGroupSize;
        this.sliceGroupSizeBit = sliceGroupSizeBit;
        this.maxCrossSectionBufferSize = outputBufferSize;
        this.outputBufferStride = outputBufferStride;
        this.maxSlicesNumber = maxSlicesNumber;
        this.blendFormat = blendFormat;
        this.sliceTextureSize = sliceTextureSize;
        // buffers
        // this.readBuffer = gpu.createBuffer(GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ, outputBufferSize);
        let sliceOffsetBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 4);
        let emitIndexSliceBuffer = gpu.createBuffer(GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST, (4 << sliceGroupSizeBit) + (maxSlicesNumber << 4));
        let retinaMVBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 64);
        let retinaPBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 64);
        let refacingBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 4);
        let eyeCrossBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 12);
        let thumbnailViewportBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 16 * 16 * 4);
        // here is the default builtin(position) outputbuffer
        this.outputVaryBufferPool.push(gpu.createBuffer(SliceRenderer.outputAttributeUsage, outputBufferSize, "Output buffer for builtin(position)"));
        let sliceGroupOffsetBuffer = gpu.createBuffer(GPUBufferUsage.COPY_SRC, _genSlicesOffsetJsBuffer());
        let screenAspectBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 4);
        let layerOpacityBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 4);
        let camProjBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 16);
        function _genSlicesOffsetJsBuffer() {
            let maxSliceGroupNum = Math.ceil(maxSlicesNumber / sliceGroupSize);
            let sliceGroupOffsets = new Uint32Array(maxSliceGroupNum);
            for (let i = 0; i < maxSliceGroupNum; i++) {
                sliceGroupOffsets[i] = i * sliceGroupSize;
            }
            return sliceGroupOffsets;
        }
        this.sliceOffsetBuffer = sliceOffsetBuffer;
        this.emitIndexSliceBuffer = emitIndexSliceBuffer;
        this.retinaMVBuffer = retinaMVBuffer;
        this.retinaPBuffer = retinaPBuffer;
        this.refacingBuffer = refacingBuffer;
        this.eyeCrossBuffer = eyeCrossBuffer;
        this.sliceGroupOffsetBuffer = sliceGroupOffsetBuffer;
        this.screenAspectBuffer = screenAspectBuffer;
        this.layerOpacityBuffer = layerOpacityBuffer;
        this.camProjBuffer = camProjBuffer;
        this.thumbnailViewportBuffer = thumbnailViewportBuffer;
        this.viewportCompressShift = power2arr.indexOf(maxTextureSize >> 8);
        // textures
        let depthTexture = gpu.device.createTexture({
            size: sliceTextureSize, format: 'depth24plus',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });
        let depthView = depthTexture.createView();
        this.depthView = depthView;
        let sliceTexture = gpu.device.createTexture({
            size: sliceTextureSize, format: gpu.preferredFormat,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
        });
        let sliceView = sliceTexture.createView();
        this.sliceView = sliceView;
        this.linearTextureSampler = gpu.device.createSampler({
            magFilter: 'linear',
            minFilter: 'linear'
        });
        this.nearestTextureSampler = gpu.device.createSampler({
            magFilter: 'nearest',
            minFilter: 'nearest'
        });
        this.refacingMatsCode = `
const refacingMats = array<mat4x4<f32>,6>(
    // +z
    mat4x4<f32>(
        1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        0,0,0,1,
    ),
    // -z
    mat4x4<f32>(
        1,0,0,0,
        0,1,0,0,
        0,0,-1,0,
        0,0,0,1,
    ),
    // +y
    mat4x4<f32>(
        1,0,0,0,
        0,0,1,0,
        0,1,0,0,
        0,0,0,1,
    ),
    // -y
    mat4x4<f32>(
        1,0,0,0,
        0,0,-1,0,
        0,-1,0,0,
        0,0,0,1,
    ),
    // +x
    mat4x4<f32>(
        0,0,1,0,
        0,1,0,0,
        1,0,0,0,
        0,0,0,1,
    ),
    // -x
    mat4x4<f32>(
        0,0,-1,0,
        0,1,0,0,
        -1,0,0,0,
        0,0,0,1,
    ),
);
const determinantRefacingMats = array<f32,6>(1,-1,-1,-1,-1,-1);
`;
        /**
         * ---------------------------------
         * cross render vertex shader
         * fragment shader and pipeline are provided by user
         * ---------------------------------
         *  */
        this.crossRenderPassDescClear = {
            colorAttachments: [{
                    view: sliceView,
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
        this.crossRenderPassDescLoad = {
            colorAttachments: [{
                    view: sliceView,
                    loadOp: 'load',
                    storeOp: 'store'
                }],
            depthStencilAttachment: {
                view: depthView,
                depthLoadOp: 'load',
                depthStoreOp: 'store',
            }
        };
        /**
         * ---------------------------------
         * retina render shader and pipeline
         *
         * ---------------------------------
         *  */
        let retinaRenderCode = this.refacingMatsCode + `
struct vOutputType{
    @builtin(position) position : vec4<f32>,
    @location(0) relativeFragPosition : vec3<f32>,
    @location(1) crossHair : f32,
    @location(2) rayForCalOpacity : vec4<f32>,
    @location(3) normalForCalOpacity : vec4<f32>,
}
struct fInputType{
    @location(0) relativeFragPosition : vec3<f32>,
    @location(1) crossHair : f32,
    @location(2) rayForCalOpacity : vec4<f32>,
    @location(3) normalForCalOpacity : vec4<f32>,
}
struct _SliceInfo{
    slicePos: f32,
    refacing: u32,
    flag: u32,
    viewport: u32,
}
@group(0) @binding(0) var<uniform> mvmat: mat4x4<f32>;
@group(0) @binding(1) var<uniform> pmat: mat4x4<f32>;
@group(0) @binding(2) var<storage,read> slice : array<_SliceInfo,${this.maxSlicesNumber}>;
@group(0) @binding(3) var<uniform> sliceoffset : u32;
@group(0) @binding(4) var<uniform> refacing : u32;
@group(0) @binding(5) var<uniform> screenAspect : f32;
@group(0) @binding(6) var<uniform> layerOpacity : f32;
@group(0) @binding(7) var<uniform> thumbnailViewport : array<vec4<f32>,16>;
@group(0) @binding(8) var<uniform> eyeOffset : vec3<f32>; //(eye4,eye3,crosshair)

@vertex fn mainVertex(@builtin(vertex_index) vindex : u32, @builtin(instance_index) iindex : u32) -> vOutputType {
    const pos = array<vec2<f32>, 4>(
        vec2<f32>(-1.0, -1.0),
        vec2<f32>(-1.0, 1.0),
        vec2<f32>( 1.0, -1.0),
        vec2<f32>( 1.0, 1.0),
    );
    var sindex = iindex;
    var pos2d = pos[vindex];
    let stereoLR = f32(iindex & 1) - 0.5;
    if (slice[sliceoffset].flag == 0 && eyeOffset.y > 0.0){
        sindex = iindex >> 1;
    }
    let s = slice[sindex + sliceoffset];
    // let coord = vec2<f32>(pos2d.x, -pos2d.y) * 0.5 + 0.5;
    let ray = vec4<f32>(pos2d, s.slicePos, 1.0);
    var glPosition: vec4<f32>;
    var camRay: vec4<f32>;
    var normal: vec4<f32>;
    let x = f32(((s.viewport >> 24) & 0xFF) << ${this.viewportCompressShift}) * ${1 / this.sliceTextureSize.width};
    let y = f32(((s.viewport >> 16) & 0xFF) << ${this.viewportCompressShift}) * ${1 / this.sliceTextureSize.height};
    let w = f32(((s.viewport >> 8 ) & 0xFF) << ${this.viewportCompressShift}) * ${1 / this.sliceTextureSize.width};
    let h = f32((s.viewport & 0xFF) << ${this.viewportCompressShift}) * ${1 / this.sliceTextureSize.height};
    var crossHair : f32;
    if (slice[sliceoffset].flag == 0){
        crossHair = 0.0;
        let stereoLR_offset = -stereoLR * eyeOffset.y;
        let se = sin(stereoLR_offset);
        let ce = cos(stereoLR_offset);
        var pureRotationMvMat = mvmat;
        pureRotationMvMat[3].z = 0.0;
        let eyeMat = mat4x4<f32>(
            ce,0,se,0,
            0,1,0,0,
            -se,0,ce,0,
            0,0,mvmat[3].z,1
        );
        let omat = eyeMat * pureRotationMvMat * refacingMats[refacing & 7];
        camRay = omat * ray;
        glPosition = pmat * camRay;
        if(pmat[3].w > 0){ // Orthographic
            camRay = vec4<f32>(0.0,0.0,-1.0,1.0);
        }
        normal = omat[2];
        // todo: viewport of retina slices
        glPosition.x = (glPosition.x) * screenAspect + step(0.0001, eyeOffset.y) * stereoLR * glPosition.w;
    }else{
        let vp = thumbnailViewport[sindex + sliceoffset - (refacing >> 5)];
        crossHair = eyeOffset.z / vp.w * step(abs(s.slicePos),0.1);
        glPosition = vec4<f32>(ray.x * vp.z * screenAspect + vp.x, ray.y * vp.w + vp.y,0.5,1.0);
        camRay = vec4<f32>(pos[vindex].x * vp.z / vp.w,pos[vindex].y,0.0,1.0); // for rendering crosshair
    }
    
    let texelCoord = array<vec2<f32>, 4>(
        vec2<f32>(x, y+h),
        vec2<f32>(x, y),
        vec2<f32>( x+w, y+h),
        vec2<f32>( x+w, y),
    );
    return vOutputType(
        glPosition,
        vec3<f32>(texelCoord[vindex] , s.slicePos),
        crossHair,
        camRay,
        normal
    );
}

@group(0) @binding(9) var txt: texture_2d<f32>;
@group(0) @binding(10) var splr: sampler;
@fragment fn mainFragment(input : fInputType) -> @location(0) vec4<f32> {
    let color = textureSample(txt, splr, input.relativeFragPosition.xy);
    var alpha: f32 = 1.0;
    let k = layerOpacity;
    var factor = 0.0;
    if (slice[sliceoffset].flag == 0){
        let dotvalue = dot(normalize(input.rayForCalOpacity.xyz), input.normalForCalOpacity.xyz);
        let factor = layerOpacity / (clamp(-dotvalue,0.0,1.0));
        alpha = color.a * max(0.0, factor);
    }else if(input.crossHair > 0.0){
        let cross = abs(input.rayForCalOpacity.xy);
        factor = step(cross.x,input.crossHair*0.05) + step(cross.y,input.crossHair*0.05);
        factor *= step(cross.x,input.crossHair) * step(cross.y,input.crossHair);
    }
    return vec4<f32>(mix(color.rgb,vec3<f32>(1.0) - color.rgb,clamp(factor,0.0,1.0)), alpha);
}
`;
        let retinaRenderShaderModule = gpu.device.createShaderModule({
            code: retinaRenderCode
        });
        let clearModule = gpu.device.createShaderModule({
            code: "@vertex fn v()->@builtin(position) vec4<f32>{ return vec4<f32>();} @fragment fn f()->@location(0) vec4<f32>{ return vec4<f32>();}"
        });
        this.clearRenderPipeline = await gpu.device.createRenderPipelineAsync({
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
            }
        });
        this.retinaRenderPipeline = await gpu.device.createRenderPipelineAsync({
            layout: 'auto',
            vertex: {
                module: retinaRenderShaderModule,
                entryPoint: 'mainVertex',
            },
            fragment: {
                module: retinaRenderShaderModule,
                entryPoint: 'mainFragment',
                targets: [{
                        format: blendFormat,
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
            primitive: { topology: 'triangle-strip' }
        });
        this.retinaBindGroup = gpu.createBindGroup(this.retinaRenderPipeline, 0, [
            { buffer: retinaMVBuffer },
            { buffer: retinaPBuffer },
            { buffer: emitIndexSliceBuffer },
            { buffer: sliceOffsetBuffer },
            { buffer: refacingBuffer },
            { buffer: screenAspectBuffer },
            { buffer: layerOpacityBuffer },
            { buffer: thumbnailViewportBuffer },
            { buffer: eyeCrossBuffer },
            sliceView,
            this.linearTextureSampler,
        ], "retinaBindGroup");
        /**
         * ---------------------------------
         * screen render shader and pipeline
         * for float16 blending and convert color to srgb
         * ---------------------------------
         *  */
        let screenRenderCode = `
@group(0) @binding(0) var txt: texture_2d<f32>;
@group(0) @binding(1) var splr: sampler;
@group(0) @binding(2) var<uniform> eyeCross: vec3<f32>;
@group(0) @binding(3) var<uniform> screenAspect : f32;
@group(0) @binding(4) var<uniform> layerOpacity : f32;
struct vOutputType{
    @builtin(position) position : vec4<f32>,
    @location(0) fragPosition : vec2<f32>,
}
struct fInputType{
    @location(0) fragPosition : vec2<f32>,
}
@vertex fn mainVertex(@builtin(vertex_index) index : u32) -> vOutputType {
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
    return vOutputType(vec4<f32>(pos[index], 0.0, 1.0), uv[index]);
}
@fragment fn mainFragment(input: fInputType) -> @location(0) vec4<f32> {
    let color = textureSample(txt, splr, input.fragPosition);
    var factor = 0.0;
    if(eyeCross.z > 0.0 && layerOpacity > 0.0){
        let aspectedCross = eyeCross.z*screenAspect;
        if(eyeCross.x > 0.0 ){
            let cross1 = abs(input.fragPosition - vec2<f32>(0.25 ,0.5))*2.0;
            let cross2 = abs(input.fragPosition - vec2<f32>(0.75 ,0.5))*2.0;
            factor = step(cross1.x,0.05*aspectedCross) + step(cross2.x,0.05*aspectedCross) + step(cross1.y,eyeCross.z*0.05);
            factor *= step(cross1.y,eyeCross.z) * (step(cross1.x,aspectedCross) + step(cross2.x,aspectedCross));
        }else{
            let cross = abs(input.fragPosition - vec2<f32>(0.5 ,0.5))*2.0;
            factor = step(cross.x,0.05*aspectedCross) + step(cross.y,eyeCross.z*0.05);
            factor *= step(cross.y,eyeCross.z) * step(cross.x,aspectedCross);
        }
    }
    return vec4<f32>(mix(color.rgb,vec3<f32>(1.0) - color.rgb,clamp(factor,0.0,1.0)), 1.0);
}
`;
        let screenRenderShaderModule = gpu.device.createShaderModule({
            code: screenRenderCode
        });
        this.screenRenderPipeline = await gpu.device.createRenderPipelineAsync({
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
        this.gpu = gpu;
        this.context = context;
        this.displayConfig = {
            layers: null,
            retinaEyeOffset: 0,
            sectionEyeOffset: 0,
            opacity: 0,
            sections: [],
            sliceNum: 0,
            retinaResolution: DefaultRetinaResolution
        };
        // default retina settings
        if (options?.defaultConfigs !== false) {
            let size = 0.2;
            this.setSliceConfig({
                layers: 64,
                sections: [
                    {
                        facing: SliceFacing.NEGX,
                        eyeOffset: EyeOffset.LeftEye,
                        viewport: { x: -size, y: size - 1, width: size, height: size }
                    },
                    {
                        facing: SliceFacing.NEGX,
                        eyeOffset: EyeOffset.RightEye,
                        viewport: { x: 1 - size, y: size - 1, width: size, height: size }
                    },
                    {
                        facing: SliceFacing.NEGY,
                        eyeOffset: EyeOffset.LeftEye,
                        viewport: { x: -size, y: 1 - size, width: size, height: size }
                    },
                    {
                        facing: SliceFacing.NEGY,
                        eyeOffset: EyeOffset.RightEye,
                        viewport: { x: 1 - size, y: 1 - size, width: size, height: size }
                    },
                    {
                        facing: SliceFacing.POSZ,
                        eyeOffset: EyeOffset.LeftEye,
                        viewport: { x: size - 1, y: size - 1, width: size, height: size }
                    },
                    {
                        facing: SliceFacing.POSZ,
                        eyeOffset: EyeOffset.RightEye,
                        viewport: { x: size, y: size - 1, width: size, height: size }
                    },
                ]
            });
            this.setEyeOffset(0.1, 0.2);
            this.setOpacity(1);
            this.setCameraProjectMatrix({ fov: 90, near: 0.01, far: 10 });
            this.setRetinaProjectMatrix({
                fov: DefaultRetinaFov, near: 0.2, far: 20
            });
            let distance = DefaultRetinaSize / Math.tan(DefaultRetinaFov / 2 * _DEG2RAD);
            this.setRetinaViewMatrix(new Mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, -distance, 0, 0, 0, 1));
        }
        return this;
    } // end init
    /** for TetraSlicePipeline, vertex shader is internally a compute shader, so it doesn't share bindgroups with fragment shader.
     *  for RaytracingPipeline, vertex shader and fragment shader are in one traditional render pipeline, they share bindgroups.
     */
    createVertexShaderBindGroup(pipeline, index, buffers, label) {
        if (index == 0)
            console.error("Unable to create BindGroup 0, which is occupied by internal usages.");
        return this.gpu.createBindGroup((pipeline.computePipeline ?
            pipeline.computePipeline :
            pipeline.pipeline), index, buffers.map(e => ({ buffer: e })), "VertexShaderBindGroup<" + label + ">");
    }
    /** for TetraSlicePipeline, vertex shader is internally a compute shader, so it doesn't share bindgroups with fragment shader.
     *  for RaytracingPipeline, vertex shader and fragment shader are in one traditional render pipeline, they share bindgroups.
     */
    createFragmentShaderBindGroup(pipeline, index, buffers, label) {
        if (index == 0 && pipeline.pipeline)
            console.error("Unable to create BindGroup 0, which is occupied by internal usages.");
        return this.gpu.createBindGroup((pipeline.computePipeline ?
            pipeline.renderPipeline :
            pipeline.pipeline), index, buffers.map(e => ({ buffer: e })), "FragmentShaderBindGroup<" + label + ">");
    }
    async createTetraSlicePipeline(desc) {
        let vertexState = desc.vertex;
        const reflect = new wgslreflect.WgslReflect(vertexState.code);
        let mainFn = reflect.functions.filter(e => e.attributes && e.attributes.some(a => a.name === "tetra") && e.name == vertexState.entryPoint)[0];
        if (!mainFn)
            console.error("Tetra vertex shader entry Point function not found");
        let expectInput = {
            "location(0)": "_attribute0[tetraIndex]",
            "location(1)": "_attribute1[tetraIndex]",
            "location(2)": "_attribute2[tetraIndex]",
            "location(3)": "_attribute3[tetraIndex]",
            "location(4)": "_attribute4[tetraIndex]",
            "location(5)": "_attribute5[tetraIndex]",
            "builtin(instance_index)": "instanceIndex",
            "builtin(tetra_index)": "tetraIndex",
        };
        let expectOutput = [
            "location(0)", "location(1)", "location(2)", "location(3)", "location(4)", "location(5)",
            "builtin(position)"
        ];
        let { input, output, call } = wgslreflect.getFnInputAndOutput(reflect, mainFn, expectInput, expectOutput);
        // compute pipeline
        const bindGroup0declareIndex = 6;
        let bindGroup0declare = '';
        let varInterpolate = "";
        let emitOutput1 = "";
        let emitOutput2 = "";
        // render pipeline
        let vinputVert = '';
        let voutputVert = '';
        let vcallVert = "";
        let vertexBufferAttributes = [];
        let vertexOutNum = 0;
        let buffers = [
            { buffer: this.emitIndexSliceBuffer },
            { buffer: this.sliceOffsetBuffer },
            { buffer: this.refacingBuffer },
            { buffer: this.eyeCrossBuffer },
            { buffer: this.camProjBuffer },
            { buffer: this.thumbnailViewportBuffer }
        ];
        let indicesInOutputBufferPool = new Set();
        indicesInOutputBufferPool.add(0); // default builtin(position) buffer
        let outputVaryBuffer = [this.outputVaryBufferPool[0]];
        for (let attr in output) {
            let id;
            if (attr === "return")
                continue;
            let packedType = output[attr].type; // unpack matrix4x4
            let rawType = packedType.replace("mat4x4<f32>", "vec4<f32>");
            if (attr === "builtin(position)") {
                id = 0;
            }
            else if (attr.startsWith("location(")) {
                let i = attr.charAt(9);
                id = Number(i) + 1;
            }
            if (id >= 0) {
                vertexOutNum++;
                bindGroup0declare += `@group(0) @binding(${bindGroup0declareIndex + id}) var<storage, read_write> _output${id} : array<${rawType}>;\n`;
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
                            shaderLocation: id,
                            format: 'float32x4',
                            offset: i << 4
                        });
                    }
                    vertexBufferAttributes.push({
                        arrayStride: typeArrLength << 4,
                        attributes
                    });
                    buffers.push({ buffer: requireOutputBuffer(this, id, typeArrLength) });
                }
                else {
                    buffers.push({ buffer: requireOutputBuffer(this, id, 1) });
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
        function requireOutputBuffer(self, id, size) {
            if (id === 0)
                return self.outputVaryBufferPool[0];
            let expectedSize = self.maxCrossSectionBufferSize * size;
            for (let i = 0; i < self.outputVaryBufferPool.length; i++) {
                if (indicesInOutputBufferPool.has(i))
                    continue; // we can't bind the same buffer again
                let buffer = self.outputVaryBufferPool[i];
                if (buffer.size === expectedSize) {
                    // found unused exactly sized buffer
                    indicesInOutputBufferPool.add(i);
                    outputVaryBuffer.push(buffer);
                    return buffer;
                }
            }
            // no buffer found, we need to create
            let buffer = self.gpu.createBuffer(SliceRenderer.outputAttributeUsage, expectedSize, "Output buffer for " + size + " vec4(s)");
            indicesInOutputBufferPool.add(self.outputVaryBufferPool.length);
            self.outputVaryBufferPool.push(buffer);
            outputVaryBuffer.push(buffer);
            return buffer;
        }
        let bindGroup1declare = '';
        for (let attr of input) {
            if (!attr.startsWith("location("))
                continue;
            let i = attr.charAt(9);
            bindGroup1declare += `@group(1) @binding(${i}) var<storage, read> _attribute${i} : array<mat4x4<f32>>;\n`;
        }
        let parsedCode = vertexState.code.replace(/@tetra/g, " ").replace(/@location\s*\(\s*[0-9]+\s*\)\s*/g, " ").replace(/@builtin\s*\(\s*[^\)\s]+\s*\)\s*/g, " ");
        function makeInterpolate(a, b) {
            let str = '';
            for (let attr in output) {
                let jeg = output[attr].type?.match(/array<(.+),(.+)>/);
                let name = attr.startsWith("location(") ? output[attr].expr : attr == "builtin(position)" ? "refPosMat" : "";
                if (!name)
                    continue;
                let i = attr.startsWith("location(") ? Number(attr.charAt(9)) + 1 : 0;
                if (jeg) {
                    let typeArrLength = Number(jeg[2]);
                    for (let idx = 0; idx < typeArrLength; idx++)
                        str += `output${i}s[offset][${idx}] = mix(${name}[${idx}][${a}],${name}[${idx}][${b}],alpha);\n`;
                }
                else {
                    str += `output${i}s[offset] = mix(${name}[${a}],${name}[${b}],alpha);\n`;
                }
            }
            return str;
        }
        let cullOperator = desc.cullMode == "back" ? "<" : ">";
        let commonCameraSliceCode = `
let sign = step(vec4<f32>(0.0,0.0,0.0,0.0),scalar);
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

    // offset is total verticex number (3 or 4), delta is faces number (3 or 6)
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
        let crossComputeCode = this.refacingMatsCode + `

struct _SliceInfo{
    slicePos: f32,
    refacing: u32,
    flag: u32,
    _pading: u32,
}
struct _EmitIndex_Slice{
    slice: array<_SliceInfo, ${this.maxSlicesNumber}>,
    emitIndex: array<atomic<u32>>,
}
@group(0) @binding(0) var<storage, read_write> _emitIndex_slice: _EmitIndex_Slice;
@group(0) @binding(1) var<uniform> _sliceoffset : u32;
@group(0) @binding(2) var<uniform> _refacingMat : u32;
@group(0) @binding(3) var<uniform> _eye4dOffset : f32;
@group(0) @binding(4) var<uniform> _camProj: vec4<f32>;
@group(0) @binding(5) var<uniform> thumbnailViewport : array<vec4<f32>,16>;
${bindGroup0declare}
${bindGroup1declare}

// user defined functions and bind groups
${parsedCode}

const _emitIndexStride : u32 = ${this.outputBufferStride >> 4};
@compute @workgroup_size(${vertexState.workgroupSize ?? DefaultWorkGroupSize})
fn _mainCompute(@builtin(global_invocation_id) GlobalInvocationID : vec3<u32>){
    let tetrahedralNum : u32 = ${input.has("location(0)") ? `arrayLength(&_attribute0)` : vertexState.workgroupSize ?? DefaultWorkGroupSize}; // todo: check performance?
    let tetraIndex = GlobalInvocationID.x;
    let instanceIndex = GlobalInvocationID.y;
    if(tetraIndex >= tetrahedralNum ){
        return;
    }
    // calculate camera space coordinate : builtin(position) and other output need to be interpolated : location(x)
    // call user defined code 
    ${call}
    let cameraPosMat = ${output["builtin(position)"].expr};
    
    var instanceLength:u32 = ${this.sliceGroupSize};
    var refPosMat : mat4x4<f32>;
    var refCamMat : mat4x4<f32>;
    let sliceFlag = _emitIndex_slice.slice[_sliceoffset].flag;

    if(_camProj.x < 0){ // Orthographic
        let projBiais:mat4x4<f32> = mat4x4<f32>(
            0,0,_camProj.w,1,
            0,0,_camProj.w,1,
            0,0,_camProj.w,1,
            0,0,_camProj.w,1,
        );
        let projMat = mat4x4<f32>(
            -_camProj.x,0,0,0,
            0,_camProj.y,0,0,
            0,0,0,0,
            0,0,_camProj.z,0,
        );

        ${(desc.cullMode == "back" || desc.cullMode == "front") ? `
        // cull face: if all slices in this group has no eye4D offset, cull here
        var cameraPosDetMat = transpose(cameraPosMat); 
        cameraPosDetMat[3] = vec4<f32>(-1.0);
        if(determinant(cameraPosDetMat) ${cullOperator} 0){ return; }` : ""}

        // [uniform if] all slices are in retina, no eye4D
        if(sliceFlag == 0){
            // we get refacing mat from uniform for retina slices
            let retinaRefacingMat = refacingMats[_refacingMat & 7];
            // calculate standard device coordinate for retina: projection * refacing * view * model * pos
            refCamMat = retinaRefacingMat * cameraPosMat;
            refPosMat = projMat * refCamMat + projBiais;
        }else{
            instanceLength = _emitIndex_slice.slice[_sliceoffset].flag;
        }
        
        // prepare for interpolations
        var emitIndexOffset = 0u;
        for(var i:u32 = 0; i<instanceLength; i++){
            ${varInterpolate}
            let sliceInfo = _emitIndex_slice.slice[_sliceoffset + i];
            if(sliceInfo.slicePos > 1.0){
                emitIndexOffset += _emitIndexStride;
                continue;
            }
            var offset = 0u;
            if(sliceFlag != 0){
                refCamMat = refacingMats[sliceInfo.refacing & 7] * cameraPosMat;
                refPosMat = projMat * refCamMat + projBiais;
                let vp = thumbnailViewport[_sliceoffset + i - (_refacingMat >> 5)];
                let aspect = vp.w / vp.z;
                refPosMat[0].x *= aspect;
                refPosMat[1].x *= aspect;
                refPosMat[2].x *= aspect;
                refPosMat[3].x *= aspect;
            }
            // calculate cross section pos * plane.normal
            let scalar = transpose(refCamMat)[2] + vec4<f32>(sliceInfo.slicePos / _camProj.x); 
            ${commonCameraSliceCode}
            emitIndexOffset += _emitIndexStride;
        } // end all hits
    }else{
        let preclipW = cameraPosMat[0].w >= 0 && cameraPosMat[1].w >= 0 && cameraPosMat[2].w >= 0  && cameraPosMat[3].w >= 0;
        if(preclipW){ return; }
        let projBiais:mat4x4<f32> = mat4x4<f32>(
            0,0,_camProj.w,0,
            0,0,_camProj.w,0,
            0,0,_camProj.w,0,
            0,0,_camProj.w,0
        );
        let projMat = mat4x4<f32>(
            _camProj.x,0,0,0,
            0,_camProj.y,0,0,
            0,0,0,0,
            0,0,_camProj.z,-1,
        );
        let eyeMat = mat4x4<f32>(
            _eye4dOffset,0,0,0,
            _eye4dOffset,0,0,0,
            _eye4dOffset,0,0,0,
            _eye4dOffset,0,0,0
        );
        // [uniform if] all slices are in retina, no eye4D
        if(sliceFlag == 0){
            ${(desc.cullMode == "back" || desc.cullMode == "front") ? `
            // cull face: if all slices in this group has no eye4D offset, cull here
            if(determinant(cameraPosMat) ${cullOperator} 0){ return; }` : ""}
            
            // we get refacing mat from uniform for retina slices
            let retinaRefacingMat = refacingMats[_refacingMat & 7];
            // calculate standard device coordinate for retina: projection * refacing * view * model * pos
            refCamMat = retinaRefacingMat * cameraPosMat;
            refPosMat = projMat * refCamMat + projBiais;
        }else{
            instanceLength = _emitIndex_slice.slice[_sliceoffset].flag;
        }
        
        // prepare for interpolations
        var emitIndexOffset = 0u;
        for(var i:u32 = 0; i<instanceLength; i++){
            ${varInterpolate}
            let sliceInfo = _emitIndex_slice.slice[_sliceoffset + i];
            if(sliceInfo.slicePos > 1.0){
                emitIndexOffset += _emitIndexStride;
                continue;
            }
            var offset = 0u;
            if(sliceFlag != 0){
                refCamMat = refacingMats[sliceInfo.refacing & 7] * cameraPosMat + 
                    eyeMat * (f32(sliceInfo.refacing >> 3) - 1.0);
                    ${(desc.cullMode == "back" || desc.cullMode == "front") ? `
                if(determinant(refCamMat) * determinantRefacingMats[sliceInfo.refacing & 7] ${cullOperator} 0){
                    emitIndexOffset += _emitIndexStride;
                    continue;
                }` : ""}
                refPosMat = projMat * refCamMat + projBiais;
                let vp = thumbnailViewport[_sliceoffset + i - (_refacingMat >> 5)];
                let aspect = vp.w / vp.z;
                refPosMat[0].x *= aspect;
                refPosMat[1].x *= aspect;
                refPosMat[2].x *= aspect;
                refPosMat[3].x *= aspect;
            }
            // calculate cross section pos * plane.normal
            let scalar = transpose(refCamMat) * vec4(0.0,0.0,1.0,sliceInfo.slicePos / _camProj.x); 
            ${commonCameraSliceCode}
            emitIndexOffset += _emitIndexStride;
        } // end all hits
    } // end camera type
}
`;
        let computePipeline = await this.gpu.device.createComputePipelineAsync({
            layout: 'auto',
            compute: {
                module: this.gpu.device.createShaderModule({
                    code: crossComputeCode
                }),
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
            vinputVert += `@location(${i}) member${i}: vec4<f32>,\n`;
            voutputVert += `@${attr} member${i}: vec4<f32>,\n`;
            vcallVert += `data.member${i},`;
        }
        this.crossRenderVertexShaderModule = this.gpu.device.createShaderModule({
            code: `
struct vInputType{
    ${vinputVert}
};
struct vOutputType{
    ${voutputVert}
};
@vertex fn main(data : vInputType)-> vOutputType{
    return vOutputType(${vcallVert});
}
`
        });
        let renderPipeline = await this.gpu.device.createRenderPipelineAsync({
            layout: 'auto',
            vertex: {
                module: this.crossRenderVertexShaderModule,
                entryPoint: 'main',
                buffers: vertexBufferAttributes,
            },
            fragment: {
                module: this.gpu.device.createShaderModule({ code: desc.fragment.code }),
                entryPoint: desc.fragment.entryPoint,
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
        return {
            computePipeline,
            computeBindGroup0: this.gpu.createBindGroup(computePipeline, 0, buffers, "TetraComputePipeline"),
            renderPipeline,
            vertexOutNum,
            outputVaryBuffer,
            descriptor: desc
        };
    }
    setSize(size) {
        if (this.screenTexture) {
            this.screenTexture.destroy();
        }
        this.screenTexture = this.gpu.device.createTexture({
            size, format: this.blendFormat,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
        });
        this.screenView = this.screenTexture.createView();
        this.screenBindGroup = this.gpu.createBindGroup(this.screenRenderPipeline, 0, [
            this.screenView,
            this.linearTextureSampler,
            { buffer: this.eyeCrossBuffer },
            { buffer: this.screenAspectBuffer },
            { buffer: this.layerOpacityBuffer },
        ], "screenBindGroup");
        let aspect;
        if (size.height) {
            aspect = size.height / size.width;
        }
        else {
            aspect = size[1] / size[0];
        }
        this.gpu.device.queue.writeBuffer(this.screenAspectBuffer, 0, new Float32Array([aspect]));
    }
    setCameraProjectMatrix(camera) {
        if (camera.fov) {
            getPerspectiveProjectionMatrix(camera).vec4.writeBuffer(this.camProjJsBuffer);
        }
        else {
            getOrthographicProjectionMatrix(camera).vec4.writeBuffer(this.camProjJsBuffer);
            this.camProjJsBuffer[0] = -this.camProjJsBuffer[0]; // use negative to mark Orthographic in shader
        }
        this.gpu.device.queue.writeBuffer(this.camProjBuffer, 0, this.camProjJsBuffer);
    }
    setRetinaProjectMatrix(camera) {
        if (camera.fov) {
            getPerspectiveProjectionMatrix(camera).mat4.writeBuffer(this.retinaProjecJsBuffer);
        }
        else {
            getOrthographicProjectionMatrix(camera).mat4.writeBuffer(this.retinaProjecJsBuffer);
        }
        this.gpu.device.queue.writeBuffer(this.retinaPBuffer, 0, this.retinaProjecJsBuffer);
    }
    setRetinaViewMatrix(m) {
        let e = m.elem;
        let facing = getFacing(e[8], e[9], e[10]);
        if (facing !== this.currentRetinaFacing) {
            this.retinaFacingChanged = true;
            this.currentRetinaFacing = facing;
        }
        m.writeBuffer(this.retinaMVMatJsBuffer);
        this.retinaMatrixChanged = true;
        function getFacing(x, y, z) {
            let xa = Math.abs(x);
            let ya = Math.abs(y);
            let za = Math.abs(z);
            switch (za > ya ? za > xa ? 2 : 0 : ya > xa ? 1 : 0) {
                case 0:
                    return x > 0 ? SliceFacing.POSX : SliceFacing.NEGX;
                case 1:
                    return y > 0 ? SliceFacing.POSY : SliceFacing.NEGY;
                default:
                    return z > 0 ? SliceFacing.POSZ : SliceFacing.NEGZ;
            }
        }
    }
    getOpacity() { return this.displayConfig.opacity; }
    getSectionEyeOffset() { return this.displayConfig.sectionEyeOffset; }
    getRetinaEyeOffset() { return this.displayConfig.retinaEyeOffset; }
    getLayers() { return this.displayConfig.layers; }
    getRetinaResolution() { return this.displayConfig.retinaResolution; }
    getMinResolutionMultiple() { return 1 << this.viewportCompressShift; }
    getStereoMode() { return this.enableEye3D; }
    getCamera() {
        let c = this.camProjJsBuffer;
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
    getRetinaCamera() {
        let c = this.retinaProjecJsBuffer;
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
    getSize() {
        if (!this.screenTexture) {
            return { width: 1, height: 1 };
        }
        return { width: this.screenTexture.width, height: this.screenTexture.height };
    }
    setOpacity(opacity) {
        this.displayConfig.opacity = opacity;
        // This is useful: when sliceNum == 0, opacity is 0 -> detect opacity to not render crosshair
        let value = this.displayConfig.sliceNum ? opacity / this.displayConfig.sliceNum : 0.0;
        this.gpu.device.queue.writeBuffer(this.layerOpacityBuffer, 0, new Float32Array([value]));
    }
    setEyeOffset(sectionEyeOffset, retinaEyeOffset) {
        let s = typeof sectionEyeOffset === "number";
        let r = typeof retinaEyeOffset === "number";
        if (s && r) {
            this.gpu.device.queue.writeBuffer(this.eyeCrossBuffer, 0, new Float32Array([
                sectionEyeOffset, retinaEyeOffset
            ]));
        }
        else if (s) {
            this.gpu.device.queue.writeBuffer(this.eyeCrossBuffer, 0, new Float32Array([
                sectionEyeOffset
            ]));
        }
        else if (r) {
            this.gpu.device.queue.writeBuffer(this.eyeCrossBuffer, 4, new Float32Array([
                retinaEyeOffset
            ]));
        }
        if (s)
            this.displayConfig.sectionEyeOffset = sectionEyeOffset;
        if (r)
            this.displayConfig.retinaEyeOffset = retinaEyeOffset;
        this.enableEye3D = this.displayConfig.sectionEyeOffset > 0 || this.displayConfig.retinaEyeOffset > 0;
    }
    setCrosshair(size) {
        this.crossHairSize = size;
        this.gpu.device.queue.writeBuffer(this.eyeCrossBuffer, 8, new Float32Array([
            size
        ]));
    }
    getCrosshair() {
        return this.crossHairSize;
    }
    setSliceConfig(sliceConfig) {
        let vpShift = this.viewportCompressShift;
        let prevRetinaResolution = this.displayConfig.retinaResolution;
        if (sliceConfig.retinaResolution)
            this.displayConfig.retinaResolution = (sliceConfig.retinaResolution >> vpShift) << vpShift;
        if (sliceConfig.sections) {
            // deepcopy
            this.displayConfig.sections = sliceConfig.sections.map(e => ({
                eyeOffset: e.eyeOffset ?? EyeOffset.None,
                facing: e.facing,
                slicePos: e.slicePos ?? 0,
                viewport: {
                    x: e.viewport.x,
                    y: e.viewport.y,
                    width: e.viewport.width,
                    height: e.viewport.height,
                },
                resolution: e.resolution ?? this.displayConfig.retinaResolution
            }));
        }
        if ((!sliceConfig.sections) && ((typeof sliceConfig.layers !== "number") ||
            this.displayConfig.layers == sliceConfig.layers) && (!sliceConfig.retinaResolution))
            return;
        this.displayConfig.sections ??= [];
        sliceConfig.layers ??= this.displayConfig.layers ?? 0;
        this.displayConfig.layers = sliceConfig.layers;
        let sections = this.displayConfig.sections;
        let sliceStep = 2 / sliceConfig.layers; // slice from -1 to 1
        let sliceGroupNum = Math.ceil(sliceConfig.layers / this.sliceGroupSize);
        let sliceNum = sliceGroupNum << this.sliceGroupSizeBit;
        if (this.displayConfig.sliceNum !== sliceNum) {
            this.displayConfig.sliceNum = sliceNum;
            this.setOpacity(this.displayConfig.opacity ?? 1);
        }
        let sectionNum = sections.length ?? 0;
        let sectionGroupNum = Math.ceil(sectionNum / this.sliceGroupSize);
        let totalNum = sliceNum + (sectionGroupNum << this.sliceGroupSizeBit);
        let slices = (this.slicesJsBuffer?.length === totalNum << 2) ? this.slicesJsBuffer : new Float32Array(totalNum << 2);
        this.slicesJsBuffer = slices;
        slices.fill(0); // todo : check neccesity?
        let retinaWidth = this.displayConfig.retinaResolution;
        let retinaX = 0;
        let retinaY = 0;
        for (let slice = -1, i = 0, sliceGroupOffset = 0; i < sliceNum; slice += sliceStep, i++, sliceGroupOffset++) {
            if (sliceGroupOffset === this.sliceGroupSize) {
                sliceGroupOffset = 0;
                retinaX = 0;
                retinaY = 0;
            }
            slices[(i << 2)] = slice; // if slice > 1, discard in shader
            slices[(i << 2) + 1] = 0;
            slices[(i << 2) + 2] = 0;
            let wshift = retinaWidth >> vpShift;
            slices[(i << 2) + 3] = u32_to_f32(((retinaX >> vpShift) << 24) + ((retinaY >> vpShift) << 16) + (wshift << 8) + wshift);
            if (retinaX + retinaWidth > this.sliceTextureSize.width ||
                retinaY + retinaWidth > this.sliceTextureSize.height) {
                this.setSliceConfig({ retinaResolution: prevRetinaResolution });
                console.warn("Maximum retinaResolution reached");
                return;
            }
            retinaY += retinaWidth;
            if (retinaY + retinaWidth > this.sliceTextureSize.height) {
                retinaX += retinaWidth;
                retinaY = 0;
            }
        }
        this.sliceGroupNum = sliceGroupNum;
        this.totalGroupNum = sliceGroupNum + sectionGroupNum;
        if (sectionNum) {
            let thumbnailViewportJsBuffer = new Float32Array(4 * 16);
            let lastGroupPosition = sectionGroupNum - 1 << this.sliceGroupSizeBit;
            let lastGroupSlices = sections.length - lastGroupPosition;
            // get max resolution widths per slice group
            let deltaX = [];
            let maxDx = 0;
            for (let j = 0, sliceGroupOffset = 0, l = sections.length; j < l; j++, sliceGroupOffset++) {
                let config = sections[j];
                if (sliceGroupOffset === this.sliceGroupSize) {
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
            for (let i = sliceNum, j = 0, sliceGroupOffset = 0; i < totalNum; i++, j++, sliceGroupOffset++) {
                let config = sections[j];
                slices[(i << 2)] = config?.slicePos ?? 0;
                slices[(i << 2) + 1] = u32_to_f32(((config?.facing) ?? 0) | ((config?.eyeOffset ?? 1) << 3));
                slices[(i << 2) + 2] = u32_to_f32(j < lastGroupPosition ? this.sliceGroupSize : lastGroupSlices);
                if (config) {
                    if (sliceGroupOffset === this.sliceGroupSize) {
                        retinaX = 0;
                        retinaY = 0;
                        sliceGroupOffset = 0;
                        sliceGroup++;
                    }
                    else if (retinaY + config.resolution > this.sliceTextureSize.height) {
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
            this.gpu.device.queue.writeBuffer(this.thumbnailViewportBuffer, 0, thumbnailViewportJsBuffer);
        }
        this.gpu.device.queue.writeBuffer(this.emitIndexSliceBuffer, 0, slices);
        this.retinaFacingChanged = true; // force to reload retina slice num into refacing buffer
    }
    render(drawCall) {
        if (!this.screenTexture) {
            console.error("tesserxel.SliceRenderer: Must call setSize before rendering");
        }
        const gpu = this.gpu;
        if (this.retinaMatrixChanged) {
            this.retinaMatrixChanged = false;
            gpu.device.queue.writeBuffer(this.retinaMVBuffer, 0, this.retinaMVMatJsBuffer);
        }
        if (this.retinaFacingChanged) {
            // refacing buffer stores not only refacing but also retina slices
            gpu.device.queue.writeBuffer(this.refacingBuffer, 0, new Uint32Array([
                this.currentRetinaFacing | ((this.sliceGroupNum) << (5 + this.sliceGroupSizeBit))
            ]));
            this.retinaFacingChanged = false;
        }
        let commandEncoder = gpu.device.createCommandEncoder();
        let canvasView = this.context.getCurrentTexture().createView();
        for (let sliceIndex = 0; sliceIndex < this.totalGroupNum; sliceIndex++) {
            this.renderState = {
                commandEncoder,
                sliceIndex,
                needClear: true,
            };
            // set new slicegroup offset
            commandEncoder.copyBufferToBuffer(this.sliceGroupOffsetBuffer, sliceIndex << 2, this.sliceOffsetBuffer, 0, 4);
            drawCall();
            if (this.renderState.needClear) {
                // if drawCall is empty, we also need to clear texture
                let clearPassEncoder = commandEncoder.beginRenderPass(this.crossRenderPassDescClear);
                clearPassEncoder.setPipeline(this.clearRenderPipeline);
                clearPassEncoder.draw(0);
                clearPassEncoder.end();
            }
            let retinaPassEncoder = commandEncoder.beginRenderPass({
                colorAttachments: [{
                        view: this.screenView,
                        clearValue: this.screenClearColor,
                        loadOp: sliceIndex === 0 ? 'clear' : "load",
                        storeOp: 'store'
                    }]
            });
            retinaPassEncoder.setPipeline(this.retinaRenderPipeline);
            retinaPassEncoder.setBindGroup(0, this.retinaBindGroup);
            let isSectionCount = this.displayConfig.sections.length && sliceIndex >= this.sliceGroupNum;
            let lastCount = isSectionCount ? this.displayConfig.sections.length % this.sliceGroupSize : 0;
            let count = isSectionCount ? (
            // if is section group
            sliceIndex == this.totalGroupNum - 1 && lastCount ? lastCount : this.sliceGroupSize) :
                // if is not section group
                this.enableEye3D ? (this.sliceGroupSize << 1) : this.sliceGroupSize;
            retinaPassEncoder.draw(4, count, 0, 0);
            retinaPassEncoder.end();
        }
        let screenPassEncoder = commandEncoder.beginRenderPass({
            colorAttachments: [{
                    view: canvasView,
                    clearValue: this.screenClearColor,
                    loadOp: 'clear',
                    storeOp: 'store'
                }]
        });
        screenPassEncoder.setPipeline(this.screenRenderPipeline);
        screenPassEncoder.setBindGroup(0, this.screenBindGroup);
        screenPassEncoder.draw(4);
        screenPassEncoder.end();
        gpu.device.queue.submit([commandEncoder.finish()]);
        this.renderState = null;
    } // end render
    /** Set TetraSlicePipeline and prepare GPU resources.
     *  Next calls should be function sliceTetras or setBindGroup.
     */
    beginTetras(pipeline) {
        if (!this.renderState)
            console.error("beginTetras should be called in a closure passed to render function");
        let { commandEncoder, sliceIndex, needClear } = this.renderState;
        // clear triagle slice vertex output pointer to zero (emitIndex part)
        commandEncoder.clearBuffer(this.emitIndexSliceBuffer, this.maxSlicesNumber << 4, 4 << this.sliceGroupSizeBit);
        // clear triagle slice vertex output data to zero
        commandEncoder.clearBuffer(pipeline.outputVaryBuffer[0]);
        let computePassEncoder = commandEncoder.beginComputePass();
        computePassEncoder.setPipeline(pipeline.computePipeline);
        computePassEncoder.setBindGroup(0, pipeline.computeBindGroup0);
        this.renderState.computePassEncoder = computePassEncoder;
        this.renderState.pipeline = pipeline;
    }
    getFrustumRange() {
        if (!this.renderState)
            console.error("getFrustum should be called in a closure passed to render function");
        let minslice = this.renderState.sliceIndex << this.sliceGroupSizeBit;
        let maxslice = minslice + this.sliceGroupSize - 1;
        let isRetinaGroup = this.slicesJsBuffer[(minslice << 2) + 1];
        let frustum;
        // let refacing;
        let camProj = 1 / this.camProjJsBuffer[1];
        if (isRetinaGroup === 0) {
            minslice = this.slicesJsBuffer[minslice << 2] * camProj;
            maxslice = this.slicesJsBuffer[maxslice << 2] * camProj;
            switch (this.currentRetinaFacing) {
                case SliceFacing.POSZ:
                    frustum = [-camProj, camProj, -camProj, camProj, minslice, maxslice];
                    break;
                case SliceFacing.NEGZ:
                    frustum = [-camProj, camProj, -camProj, camProj, -maxslice, -minslice];
                    break;
                case SliceFacing.POSX:
                    frustum = [minslice, maxslice, -camProj, camProj, -camProj, camProj];
                    break;
                case SliceFacing.NEGX:
                    frustum = [-maxslice, -minslice, -camProj, camProj, -camProj, camProj];
                    break;
                case SliceFacing.POSY:
                    frustum = [-camProj, camProj, minslice, maxslice, -camProj, camProj];
                    break;
                case SliceFacing.NEGY:
                    frustum = [-camProj, camProj, -maxslice, -minslice, -camProj, camProj];
                    break;
            }
            // frustum = frustum.join(",");
            // refacing = SliceFacing[this.currentRetinaFacing];
        }
        return frustum;
        // console.log({ isRetinaGroup, frustum,  refacing});
    }
    setBindGroup(index, bindGroup) {
        if (!this.renderState)
            console.error("setBindGroup should be called in a closure passed to render function");
        let { computePassEncoder } = this.renderState;
        computePassEncoder.setBindGroup(index, bindGroup);
    }
    /** Compute slice of given bindgroup attribute data.
     *  beginTetras should be called at first to specify a tetraSlicePipeline
     *  Next calls should be function sliceTetras, setBindGroup or drawTetras.
     */
    sliceTetras(vertexBindGroup, tetraCount, instanceCount) {
        if (!this.renderState)
            console.error("sliceTetras should be called in a closure passed to render function");
        let { computePassEncoder } = this.renderState;
        if (vertexBindGroup)
            computePassEncoder.setBindGroup(1, vertexBindGroup);
        computePassEncoder.dispatchWorkgroups(Math.ceil(tetraCount / 256), instanceCount); // todo: change workgroups
    }
    setWorldClearColor(color) {
        this.crossRenderPassDescClear.colorAttachments[0].clearValue = color;
    }
    setScreenClearColor(color) {
        this.screenClearColor = color;
    }
    /** This function draw slices on a internal framebuffer
     *  Every beginTetras call should be end with drawTetras call
     */
    drawTetras(bindGroups) {
        if (!this.renderState)
            console.error("drawTetras should be called in a closure passed to render function");
        let { commandEncoder, computePassEncoder, pipeline, needClear, sliceIndex } = this.renderState;
        computePassEncoder.end();
        let slicePassEncoder = commandEncoder.beginRenderPass(
        // this.crossRenderPassDescClear
        needClear ? this.crossRenderPassDescClear : this.crossRenderPassDescLoad);
        slicePassEncoder.setPipeline(pipeline.renderPipeline);
        for (let i = 0; i < pipeline.vertexOutNum; i++) {
            slicePassEncoder.setVertexBuffer(i, pipeline.outputVaryBuffer[i]);
        }
        if (bindGroups) {
            for (let { group, binding } of bindGroups) {
                slicePassEncoder.setBindGroup(group, binding);
            }
        }
        // bitshift: outputBufferSize / 16 for vertices number, / sliceGroupSize for one stride
        let bitshift = 4 + this.sliceGroupSizeBit;
        let verticesStride = this.maxCrossSectionBufferSize >> bitshift;
        let offsetVert = 0;
        let sliceJsOffset = (sliceIndex << (2 + this.sliceGroupSizeBit)) + 3;
        let vpShift = this.viewportCompressShift;
        for (let c = 0; c < this.sliceGroupSize; c++, offsetVert += verticesStride) {
            let vp = f32_to_u32(this.slicesJsBuffer[sliceJsOffset + (c << 2)]);
            slicePassEncoder.setViewport(((vp >> 24) & 0xFF) << vpShift, ((vp >> 16) & 0xFF) << vpShift, ((vp >> 8) & 0xFF) << vpShift, (vp & 0xFF) << vpShift, 0, 1);
            slicePassEncoder.draw(verticesStride, 1, offsetVert);
        }
        slicePassEncoder.end();
        this.renderState.needClear = false;
    }
    async createRaytracingPipeline(desc) {
        let code = desc.code.replace(/@ray(\s)/g, "@vertex$1");
        const reflect = new wgslreflect.WgslReflect(code);
        let mainRayFn = reflect.functions.filter(e => e.attributes && e.attributes.some(a => a.name === "vertex") && e.name == desc.rayEntryPoint)[0];
        if (!mainRayFn)
            console.error("Raytracing pipeline: Entry point does not exist.");
        // let mainFragFn = reflect.functions.filter(
        //     e => e.attributes && e.attributes.some(a => a.name === "fragment") && e.name == desc.fragment.entryPoint
        // )[0];
        let { input, output, call } = wgslreflect.getFnInputAndOutput(reflect, mainRayFn, {
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
        if (mainRayFn.return.attributes) {
            outputMembers = output["return"].expr;
            retunTypeMembers = `@${wgslreflect.parseAttr(mainRayFn.return.attributes)} ${wgslreflect.parseTypeName(mainRayFn.return)}`;
        }
        else {
            let st = reflect.structs.filter(s => s.name === mainRayFn.return.name)[0];
            if (!st)
                console.error("No attribute found");
            outputMembers = st.members.map(m => output[wgslreflect.parseAttr(m.attributes)].expr).join(",\n");
            retunTypeMembers = st.members.map(m => `@${wgslreflect.parseAttr(m.attributes)} ${m.name}: ${wgslreflect.parseTypeName(m.type)}`).join(",\n");
        }
        // ${wgslreflect.parseAttr(mainRayFn.return.attributes)} userRayOut: ${wgslreflect.parseTypeName(mainRayFn.return)}
        let shaderCode = this.refacingMatsCode + `
struct _SliceInfo{
    slicePos: f32,
    refacing: u32,
    flag: u32,
    viewport: u32,
}
struct _vOut{
    @builtin(position) pos: vec4<f32>,
    ${retunTypeMembers}
}
struct AffineMat{
    matrix: mat4x4<f32>,
    vector: vec4<f32>,
}
@group(0) @binding(0) var<storage, read> _slice: array<_SliceInfo, ${this.maxSlicesNumber}>;
@group(0) @binding(1) var<uniform> _sliceoffset : u32;
@group(0) @binding(2) var<uniform> _refacingMat : u32;
@group(0) @binding(3) var<uniform> _eye4dOffset : f32;
@group(0) @binding(4) var<uniform> _camProj: vec4<f32>;
@group(0) @binding(5) var<uniform> thumbnailViewport : array<vec4<f32>,16>;
fn apply(afmat: AffineMat, points: mat4x4<f32>) -> mat4x4<f32>{
    let biais = mat4x4<f32>(afmat.vector, afmat.vector, afmat.vector, afmat.vector);
    return afmat.matrix * points + biais;
}
fn applyinv(afmat: AffineMat, points: mat4x4<f32>) -> mat4x4<f32>{
    let biais = mat4x4<f32>(afmat.vector, afmat.vector, afmat.vector, afmat.vector);
    return transpose(afmat.matrix) * (points - biais);
}
${code.replace(/@vertex/g, " ").replace(/@builtin\s*\(\s*(ray_origin|ray_direction|voxel_coord|aspect_matrix)\s*\)\s*/g, " ")}
@vertex fn mainVertex(@builtin(vertex_index) vindex:u32, @builtin(instance_index) i_index:u32) -> _vOut{
    const pos = array<vec2<f32>, 4>(
        vec2<f32>(-1.0, -1.0),
        vec2<f32>(-1.0, 1.0),
        vec2<f32>( 1.0, -1.0),
        vec2<f32>( 1.0, 1.0),
    );
    let sliceInfo = _slice[_sliceoffset + i_index];
    let sliceFlag = _slice[_sliceoffset].flag;
    var refacingEnum : u32;

    let posidx = pos[vindex];
    let coord = vec2<f32>(posidx.x, posidx.y);
    var aspect = 1.0;
    var rayPos = vec4<f32>(0.0);// no eye offset for retina
    var rayDir = vec4<f32>(0.0,0.0,0.0,-1.0);// point forward for Orthographic camera
    if(_camProj.x < 0){
        rayPos = vec4<f32>(coord.x/_camProj.x * aspect, coord.y/_camProj.y, sliceInfo.slicePos/_camProj.x, -_camProj.w/_camProj.z);
    }else{
        if(sliceFlag == 0){
            refacingEnum = _refacingMat;
        }else{
            refacingEnum = sliceInfo.refacing;
            let vp = thumbnailViewport[_sliceoffset + i_index - (_refacingMat >> 5)];
            aspect = vp.z / vp.w;
            rayPos = vec4<f32>(-_eye4dOffset * (f32(sliceInfo.refacing >> 3) - 1.0), 0.0, 0.0, 0.0);
        }
        rayDir = vec4<f32>(coord.x/_camProj.x * aspect, coord.y/_camProj.y, sliceInfo.slicePos/_camProj.x, -1.0);
    }
    let refacingMat = refacingMats[refacingEnum & 7];
    let camRayDir = refacingMat * rayDir;
    let camRayOri = refacingMat * rayPos;
    let voxelCoord = (refacingMat * vec4<f32>(coord, sliceInfo.slicePos,0.0)).xyz;
    ${dealRefacingCall}
    ${call}
    let x = f32(((sliceInfo.viewport >> 24) & 0xFF) << ${this.viewportCompressShift}) * ${1 / this.sliceTextureSize.width};
    let y = f32(((sliceInfo.viewport >> 16) & 0xFF) << ${this.viewportCompressShift}) * ${1 / this.sliceTextureSize.height};
    let w = f32(((sliceInfo.viewport >> 8 ) & 0xFF) << ${this.viewportCompressShift}) * ${1 / this.sliceTextureSize.width};
    let h = f32((sliceInfo.viewport & 0xFF) << ${this.viewportCompressShift}) * ${1 / this.sliceTextureSize.height};
    let texelCoord = array<vec2<f32>, 4>(
        vec2<f32>(x, y+h),
        vec2<f32>(x, y),
        vec2<f32>(x+w, y+h),
        vec2<f32>(x+w, y),
    )[vindex] * 2.0 - vec2<f32>(1.0);
    
    if(sliceInfo.slicePos > 1.0){
        return _vOut(
            vec4<f32>(0.0,0.0,0.0, -1.0),
            ${outputMembers}
        );
    }else{
        return _vOut(
            vec4<f32>(texelCoord.x,-texelCoord.y, 0.999999, 1.0),
            ${outputMembers}
        );
    }
}
fn calDepth(distance: f32)->f32{
    return -_camProj.z + _camProj.w / distance;
}
`;
        let module = this.gpu.device.createShaderModule({ code: shaderCode });
        let pipeline = await this.gpu.device.createRenderPipelineAsync({
            layout: 'auto',
            vertex: {
                module,
                entryPoint: 'mainVertex',
            },
            fragment: {
                module,
                entryPoint: desc.fragmentEntryPoint,
                targets: [{ format: this.gpu.preferredFormat }]
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
            { buffer: this.emitIndexSliceBuffer },
            { buffer: this.sliceOffsetBuffer },
            { buffer: this.refacingBuffer },
            { buffer: this.eyeCrossBuffer },
            { buffer: this.camProjBuffer },
            { buffer: this.thumbnailViewportBuffer },
        ];
        return {
            pipeline, bindGroup0: this.gpu.createBindGroup(pipeline, 0, buffers)
        };
    }
    drawRaytracing(pipeline, bindGroups) {
        if (!this.renderState)
            console.error("drawRaytracing should be called in a closure passed to render function");
        let { commandEncoder, needClear } = this.renderState;
        let slicePassEncoder = commandEncoder.beginRenderPass(needClear ? this.crossRenderPassDescClear : this.crossRenderPassDescLoad);
        slicePassEncoder.setPipeline(pipeline.pipeline);
        slicePassEncoder.setBindGroup(0, pipeline.bindGroup0);
        if (bindGroups && bindGroups[0])
            slicePassEncoder.setBindGroup(1, bindGroups[0]);
        slicePassEncoder.draw(4, this.sliceGroupSize);
        slicePassEncoder.end();
        this.renderState.needClear = false;
    }
}
function f32_to_u32(f32) {
    return new Uint32Array(new Float32Array([f32]).buffer)[0];
}
function u32_to_f32(u32) {
    return new Float32Array(new Uint32Array([u32]).buffer)[0];
}

/// <reference types="@webgpu/types" />
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
            usage,
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

function toIndexMesh$1(m) {
    let position = [];
    let normal = [];
    let uvw = [];
    let posIdx4 = [];
    let normalIdx4 = [];
    let uvwIdx4 = [];
    let posIdx3 = [];
    let normalIdx3 = [];
    let uvwIdx3 = [];
    if (m.quad) {
        toIndexbuffer(m.quad.position, position, posIdx4, 4);
        if (m.quad.normal)
            toIndexbuffer(m.quad.normal, normal, normalIdx4, 4);
        if (m.quad.uvw)
            toIndexbuffer(m.quad.uvw, uvw, uvwIdx4, 4);
    }
    if (m.triangle) {
        toIndexbuffer(m.triangle.position, position, posIdx3, 4);
        if (m.triangle.normal)
            toIndexbuffer(m.triangle.normal, normal, normalIdx3, 4);
        if (m.triangle.uvw)
            toIndexbuffer(m.triangle.uvw, uvw, uvwIdx3, 4);
    }
    let out = {
        position: new Float32Array(position)
    };
    if (m.quad) {
        out.quad = {
            position: new Uint32Array(posIdx4)
        };
        if (m.quad.normal)
            out.quad.normal = new Uint32Array(normalIdx4);
        if (m.quad.uvw)
            out.quad.uvw = new Uint32Array(uvwIdx4);
    }
    if (m.triangle) {
        out.triangle = {
            position: new Uint32Array(posIdx4)
        };
        if (m.triangle.normal)
            out.triangle.normal = new Uint32Array(normalIdx4);
        if (m.triangle.uvw)
            out.triangle.uvw = new Uint32Array(uvwIdx4);
    }
    if (normal.length)
        out.normal = new Float32Array(normal);
    if (uvw.length)
        out.uvw = new Float32Array(uvw);
    return out;
}
function toNonIndexMesh$1(m) {
    let out = {};
    if (m.quad) {
        let count = m.quad.position.length << 2;
        out.quad = {
            position: new Float32Array(count),
            count: count >> 4
        };
        toNonIndex(m.position, m.quad.position, out.quad.position, 4);
        if (m.normal) {
            out.quad.normal = new Float32Array(count);
            toNonIndex(m.normal, m.quad.normal, out.quad.normal, 4);
        }
        if (m.uvw) {
            out.quad.uvw = new Float32Array(count);
            toNonIndex(m.uvw, m.quad.uvw, out.quad.uvw, 4);
        }
    }
    if (m.triangle) {
        let count = m.triangle.position.length << 2;
        out.triangle = {
            position: new Float32Array(count),
            count: count / 12
        };
        toNonIndex(m.position, m.triangle.position, out.triangle.position, 4);
        if (m.normal) {
            out.triangle.normal = new Float32Array(count);
            toNonIndex(m.normal, m.triangle.normal, out.triangle.normal, 4);
        }
        if (m.uvw) {
            out.triangle.uvw = new Float32Array(count);
            toNonIndex(m.uvw, m.triangle.uvw, out.triangle.uvw, 4);
        }
    }
    return out;
}

function sphere(u, v) {
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
    return {
        quad: { position, normal, uvw }
    };
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
    toIndexMesh: toIndexMesh$1,
    toNonIndexMesh: toNonIndexMesh$1,
    sphere: sphere,
    parametricSurface: parametricSurface$1,
    findBorder: findBorder
});

function toIndexMesh(m) {
    let position = [];
    let normal = [];
    let uvw = [];
    let posIdx = [];
    let normalIdx = [];
    let uvwIdx = [];
    toIndexbuffer(m.position, position, posIdx, 4);
    if (m.normal)
        toIndexbuffer(m.normal, normal, normalIdx, 4);
    if (m.uvw)
        toIndexbuffer(m.uvw, uvw, uvwIdx, 4);
    let out = {
        position: new Float32Array(position),
        positionIndex: new Uint32Array(posIdx)
    };
    if (m.normal)
        out.normalIndex = new Uint32Array(normalIdx);
    if (m.uvw)
        out.uvwIndex = new Uint32Array(uvwIdx);
    if (normal.length)
        out.normal = new Float32Array(normal);
    if (uvw.length)
        out.uvw = new Float32Array(uvw);
    return out;
}
function toNonIndexMesh(m) {
    let count = m.position.length << 2;
    let out = {
        position: new Float32Array(count),
        count: count >> 4
    };
    toNonIndex(m.position, m.positionIndex, out.position, 4);
    if (m.normal) {
        out.normal = new Float32Array(count);
        toNonIndex(m.normal, m.normalIndex, out.normal, 4);
    }
    if (m.uvw) {
        out.uvw = new Float32Array(count);
        toNonIndex(m.uvw, m.uvwIndex, out.uvw, 4);
    }
    return out;
}
function applyAffineMat4(mesh, am) {
    let vp = new Vec4();
    for (let i = 0; i < mesh.position.length; i += 4) {
        vp.set(mesh.position[i], mesh.position[i + 1], mesh.position[i + 2], mesh.position[i + 3]).mulmatls(am.mat).adds(am.vec).writeBuffer(mesh.position, i);
        if (mesh.normal) {
            vp.set(mesh.normal[i], mesh.normal[i + 1], mesh.normal[i + 2], mesh.normal[i + 3]).mulmatls(am.mat).writeBuffer(mesh.position, i);
        }
    }
    return mesh;
}
function applyObj4(mesh, obj) {
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
function concat(mesh1, mesh2) {
    let position = new Float32Array(mesh1.position.length + mesh2.position.length);
    position.set(mesh1.position);
    position.set(mesh2.position, mesh1.position.length);
    let ret = { position, count: position.length << 4 };
    if (mesh1.normal && mesh2.normal) {
        let normal = new Float32Array(mesh1.normal.length + mesh2.normal.length);
        normal.set(mesh1.normal);
        normal.set(mesh2.normal, mesh1.normal.length);
        ret.normal = normal;
    }
    if (mesh1.uvw && mesh2.uvw) {
        let uvw = new Float32Array(mesh1.uvw.length + mesh2.uvw.length);
        uvw.set(mesh1.uvw);
        uvw.set(mesh2.uvw, mesh1.uvw.length);
        ret.uvw = uvw;
    }
    return ret;
}
function concatarr(meshes) {
    let length = 0;
    let hasNormal = true;
    let hasUvw = true;
    for (let i = 0; i < meshes.length; i++) {
        length += meshes[i].position.length;
        hasUvw = hasUvw && (meshes[i].uvw ? true : false);
        hasNormal = hasNormal && (meshes[i].normal ? true : false);
    }
    let position = new Float32Array(length);
    let ret = { position, count: length << 4 };
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
function clone(mesh) {
    let ret = {
        position: mesh.position.slice(0),
        count: mesh.count
    };
    if (mesh.uvw)
        ret.uvw = mesh.uvw.slice(0);
    if (mesh.normal)
        ret.normal = mesh.normal.slice(0);
    return ret;
}

let cube = {
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
};
function tesseract() {
    let rotor = new Rotor();
    let biv = new Bivec();
    let yface = applyObj4(clone(cube), new Obj4(Vec4.y, rotor.expset(biv.set(0, _90))));
    let meshes = [
        biv.set(_90).exp(),
        biv.set(-_90).exp().mulsl(rotor.expset(biv.set(0, 0, 0, 0, _180))),
        biv.set(0, 0, 0, _90).exp().mulsl(rotor.expset(biv.set(_90, 0, 0, 0, 0))),
        biv.set(0, 0, 0, -_90).exp().mulsl(rotor.expset(biv.set(_90, 0, 0, 0, 0))),
        biv.set(0, 0, 0, 0, _90).exp().mulsl(rotor.expset(biv.set(_90, 0, 0, 0, 0))),
        biv.set(0, 0, 0, 0, -_90).exp().mulsl(rotor.expset(biv.set(_90, 0, 0, 0, 0))),
        biv.set(_180).exp(),
    ].map(r => applyObj4(clone(yface), new Obj4(new Vec4(), r)));
    meshes.push(yface);
    let m = concatarr(meshes);
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 20; j++) {
            m.uvw[i * 80 + j * 4 + 3] = i;
        }
    }
    return m;
}
function inverseNormal(mesh) {
    if (mesh.normal) {
        for (let i = 0, l = mesh.normal.length; i < l; i++) {
            mesh.normal[i] = -mesh.normal[i];
        }
    }
    return mesh;
}
let hexadecachoron = {
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
};
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
function spherinderSide(radius, longitudeSegment, latitudeSegment, height, heightSegment = 1) {
    if (longitudeSegment < 3)
        longitudeSegment = 3;
    if (latitudeSegment < 3)
        latitudeSegment = 3;
    if (heightSegment < 1)
        heightSegment = 1;
    return parametricSurface((uvw, pos, norm) => {
        let u = uvw.x * _360;
        let v = uvw.y * _180;
        let w = uvw.z - 0.5;
        let su = Math.sin(u);
        let cu = Math.cos(u);
        pos.set(Math.sin(v) * cu * radius, Math.cos(v) * cu * radius, su * radius, w * height);
        norm.set(Math.sin(v) * cu, Math.cos(v) * cu, su);
    }, longitudeSegment, latitudeSegment, heightSegment);
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
    return { position, normal, uvw, count };
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
    return {
        position,
        count
    };
}
function duocone(xyRadius, xySegment, zwRadius, zwSegment) {
    let ps = [];
    for (let i = 0; i < xySegment; i++) {
        let ii = i * _360 / xySegment;
        ps.push(new Vec4(xyRadius * Math.cos(ii), xyRadius * Math.sin(ii)));
    }
    for (let i = 0; i < zwSegment; i++) {
        let ii = i * _360 / zwSegment;
        ps.push(new Vec4(0, 0, zwRadius * Math.cos(ii), zwRadius * Math.sin(ii)));
    }
    return convexhull(ps);
}
function duocylinder(xyRadius, xySegment, zwRadius, zwSegment) {
    let ps = [];
    for (let i = 0; i < xySegment; i++) {
        let ii = i * _360 / xySegment;
        for (let j = 0; j < zwSegment; j++) {
            let jj = j * _360 / zwSegment;
            ps.push(new Vec4(xyRadius * Math.cos(ii), xyRadius * Math.sin(ii), zwRadius * Math.cos(jj), zwRadius * Math.sin(jj)));
        }
    }
    return convexhull(ps);
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
                    pushTetra(doffset, 3, 4, 5, 1);
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
    return { position, uvw, normal, count: count3 + count4 };
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
                pushTetra(doffset, 3, 4, 5, 1);
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
                pushTetra(doffset, 3, 4, 5, 1);
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
    return { position, normal, uvw, count: position.length >> 4 };
}

var tetra = /*#__PURE__*/Object.freeze({
    __proto__: null,
    toIndexMesh: toIndexMesh,
    toNonIndexMesh: toNonIndexMesh,
    applyAffineMat4: applyAffineMat4,
    applyObj4: applyObj4,
    concat: concat,
    concatarr: concatarr,
    clone: clone,
    cube: cube,
    tesseract: tesseract,
    inverseNormal: inverseNormal,
    hexadecachoron: hexadecachoron,
    glome: glome,
    spheritorus: spheritorus,
    torisphere: torisphere,
    spherinderSide: spherinderSide,
    tiger: tiger,
    parametricSurface: parametricSurface,
    convexhull: convexhull,
    duocone: duocone,
    duocylinder: duocylinder,
    loft: loft,
    directProduct: directProduct
});

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

var mesh = /*#__PURE__*/Object.freeze({
    __proto__: null,
    face: face,
    tetra: tetra,
    ObjFile: ObjFile
});

class Scene {
    child = [];
    backGroundColor;
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
    setBackgroudColor(color) {
        this.backGroundColor = color;
    }
}
let Object$1 = class Object extends Obj4 {
    child = [];
    worldCoord;
    needsUpdateCoord = true;
    alwaysUpdateCoord = false;
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
class Camera extends Object$1 {
    fov = 90;
    near = 0.1;
    far = 100;
    alwaysUpdateCoord = true;
    needsUpdate = true;
}
class Mesh extends Object$1 {
    geometry;
    material;
    uObjMatBuffer;
    bindGroup;
    visible = true;
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
        this.jsBuffer = data;
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
class TesseractGeometry extends Geometry {
    constructor(size) {
        super(tesseract());
        if (size)
            applyObj4(this.jsBuffer, new Obj4(null, null, size instanceof Vec4 ? size : new Vec4(size, size, size, size)));
    }
}
class CubeGeometry extends Geometry {
    constructor(size) {
        super(clone(cube));
        if (size)
            applyObj4(this.jsBuffer, new Obj4(null, null, size instanceof Vec3 ? new Vec4(size.x, 1, size.y, size.z) : new Vec4(size, 1, size, size)));
    }
}
class GlomeGeometry extends Geometry {
    constructor(size) {
        super(glome(size ?? 1, 16, 16, 12));
    }
}
class SpheritorusGeometry extends Geometry {
    constructor(sphereRadius = 0.4, circleRadius = 1) {
        super(spheritorus(sphereRadius, 16, 12, circleRadius, 16));
    }
}
class TorisphereGeometry extends Geometry {
    constructor(circleRadius = 0.2, sphereRadius = 0.8) {
        super(torisphere(circleRadius, 12, sphereRadius, 16, 12));
    }
}
class SpherinderSideGeometry extends Geometry {
    constructor(sphereRadius = 0.4, height = 1) {
        super(spherinderSide(sphereRadius, 16, 12, height));
    }
}
class TigerGeometry extends Geometry {
    constructor(circleRadius = 0.2, radius1 = 0.8, radius2 = 0.8) {
        super(tiger(radius1, 16, radius2, 16, circleRadius, 12));
    }
}
class ConvexHullGeometry extends Geometry {
    constructor(points) {
        super(convexhull(points));
        console.assert(false, "todo: need to generate normal");
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
const posdirLightsNumber = 8;
const spotLightsNumber = 4;
const spotLightOffset = ambientLightSize + posdirLightsNumber * structPosDirLightSize;
const uWorldLightBufferSize = spotLightOffset + spotLightsNumber * structSpotLightLightSize;
const lightCode = `
struct PosDirLight{
    density: vec4<f32>,
    pos_dir: vec4<f32>,
}
struct SpotLight{
    density: vec4<f32>,
    pos: vec4<f32>,
    dir: vec4<f32>,
    params: vec4<f32>
}
const blackColor = vec3<f32>(0.02);
struct WorldLight{
    ambientLightDensity: vec4<f32>,
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
function _initLightShader() {
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
        r.jsBuffer[offset - 1] = -1.0; // marker for directional light ( < -0.5 in shader )
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
    cameraInScene;
    safeTetraNumInOnePass;
    tetraNumOccupancyRatio = 0.08;
    maxTetraNumInOnePass;
    constructor(canvas) {
        this.canvas = canvas;
        this.core = new SliceRenderer();
    }
    setBackgroudColor(color) {
        this.core.setScreenClearColor(color);
    }
    async init() {
        this.gpu = await new GPU().init();
        if (!this.gpu) {
            console.error("No availiable GPU device found. Please check whether WebGPU is enabled on your browser.");
            return null;
        }
        await this.core.init(this.gpu, this.gpu.getContext(this.canvas));
        this.uCamMatBuffer = this.gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, (4 * 5 * 2) * 4, "uCamMat");
        this.uWorldLightBuffer = this.gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, this.lightShaderInfomation.uWorldLightBufferSize, "uWorldLight");
        this.core.setSize({ width: this.canvas.width * devicePixelRatio, height: this.canvas.height * devicePixelRatio });
        this.safeTetraNumInOnePass = this.core.getSafeTetraNumInOnePass();
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
            console.error("FOUR Renderer: Repetitive material pipeline creation occured.");
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
            this.updateObject(c);
            c.needsUpdateCoord = false;
        }
        if (o instanceof Mesh) {
            this.updateMesh(o);
        }
        else if (o instanceof AmbientLight) {
            this.ambientLightDensity.adds(o.density);
        }
        else if (o instanceof PointLight) {
            this.pointLights.push(o);
        }
        else if (o instanceof SpotLight) {
            if (o.needsUpdateCoord) {
                o.worldDirection.mulmatvset(o.worldCoord.mat, o.direction);
            }
            this.spotLights.push(o);
        }
        else if (o instanceof DirectionalLight) {
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
        this.core.setWorldClearColor(scene.backGroundColor);
        this.cameraInScene = false;
        this.maxTetraNumInOnePass = this.safeTetraNumInOnePass / this.tetraNumOccupancyRatio;
        for (let c of scene.child) {
            if (c.alwaysUpdateCoord) {
                c.needsUpdateCoord = true;
            }
            if (c.needsUpdateCoord) {
                c.worldCoord.setFromObj4(c);
            }
            this.updateObject(c);
            c.needsUpdateCoord = false;
        }
        if (this.cameraInScene === false)
            console.error("Target camera is not in the scene. Forget to add it?");
        _updateWorldLight(this);
    }
    ambientLightDensity = new Vec3;
    directionalLights;
    spotLights;
    pointLights;
    drawList;
    activeCamera;
    setCamera(camera) {
        if (camera.needsUpdate) {
            this.core.setCameraProjectMatrix(camera);
            camera.needsUpdate = false;
        }
        this.activeCamera = camera;
    }
    computeFrustumRange(range) {
        return range ? [
            new Vec4(-1, 0, 0, -range[0]).mulmatls(this.activeCamera.worldCoord.mat),
            new Vec4(1, 0, 0, range[1]).mulmatls(this.activeCamera.worldCoord.mat),
            new Vec4(0, -1, 0, -range[2]).mulmatls(this.activeCamera.worldCoord.mat),
            new Vec4(0, 1, 0, range[3]).mulmatls(this.activeCamera.worldCoord.mat),
            new Vec4(0, 0, -1, -range[4]).mulmatls(this.activeCamera.worldCoord.mat),
            new Vec4(0, 0, 1, range[5]).mulmatls(this.activeCamera.worldCoord.mat),
        ] : null;
    }
    _testWithFrustumData(m, data) {
        if (!data)
            return true;
        let relP = this.activeCamera.worldCoord.vec.sub(m.worldCoord.vec);
        let obb = m.geometry.obb;
        let matModel = m.worldCoord.mat.t();
        for (let f of data) {
            if (obb.testPlane(new Plane(matModel.mulv(f), f.dot(relP))) === 1)
                return false;
        }
        return true;
    }
    render(scene, camera) {
        this.clearState();
        this.setCamera(camera);
        this.updateScene(scene);
        this.core.render(() => {
            let frustumData = this.computeFrustumRange(this.core.getFrustumRange());
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
                    if (!this._testWithFrustumData(mesh, frustumData))
                        continue;
                    if (tetraState === false) {
                        this.core.beginTetras(pipeline);
                        tetraCount = 0;
                        tetraState = true;
                    }
                    this.core.sliceTetras(mesh.bindGroup, mesh.geometry.jsBuffer.count);
                    tetraCount += mesh.geometry.jsBuffer.count;
                    if (tetraCount > this.maxTetraNumInOnePass) {
                        this.core.drawTetras(binding);
                        tetraState = false;
                        tetraCount = 0;
                    }
                }
                if (tetraState === true) {
                    this.core.drawTetras(binding);
                }
            }
        });
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
        this.core.setSize(size);
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
struct AffineMat{
    matrix: mat4x4<f32>,
    vector: vec4<f32>,
}
struct UObjMats{
    pos: AffineMat,
    normal: mat4x4<f32>,
}
struct fourInputType{
    @location(0) pos: mat4x4<f32>,{fourInputType}
}
struct fourOutputType{
    @builtin(position) position: mat4x4<f32>,
    {fourOutputType}
}
@group(1) @binding({0}) var<uniform> uObjMat: UObjMats;
@group(1) @binding({1}) var<uniform> uCamMat: AffineMat;
fn apply(afmat: AffineMat, points: mat4x4<f32>) -> mat4x4<f32>{
    let biais = mat4x4<f32>(afmat.vector, afmat.vector, afmat.vector, afmat.vector);
    return afmat.matrix * points + biais;
}
fn normalizeVec4s(vec4s: mat4x4<f32>) -> mat4x4<f32>{
    return mat4x4<f32>(
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
        @location(${i + 1}) ${inputs[i]}: mat4x4<f32>,`;
    }
    if (outputs.length === 1) {
        fourOutputType = `
        @location(0) ${outputs[0]}: mat4x4<f32>,`;
        fourOutputReturn += "," + outputReturn[outputs[0]];
    }
    else if (outputs.length === 2) {
        fourOutputType = `
        @location(0) ${outputs[0]}: mat4x4<f32>,
        @location(1) ${outputs[1]}: mat4x4<f32>`;
        fourOutputReturn += "," + outputReturn[outputs[0]] + "," + outputReturn[outputs[1]];
    }
    else if (outputs.length === 3) {
        fourOutputType = `
        @location(0) ${outputs[0]}_${outputs[1]}: array<mat4x4<f32>,2>,
        @location(1) ${outputs[2]}: mat4x4<f32>`;
        fourOutputReturn += ", array<mat4x4<f32>,2>(" + outputReturn[outputs[0]] + "," +
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
            fragment: { code: fs, entryPoint: "main" },
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
    struct AffineMat{
        matrix: mat4x4<f32>,
        vector: vec4<f32>,
    }
    @fragment fn main(${fsIn}) -> @location(0) vec4<f32> {
        let ambientLightDensity = uWorldLight.ambientLightDensity.xyz;`; // avoid basic material doesn't call this uniform at all
        // if frag shader has input, we need to construct a struct fourInputType
        if (fsIn) {
            let struct = `    struct fourInputType{\n`;
            for (let i = 0, l = this.declVarys.length; i < l; i++) {
                struct += `        @location(${i}) ${this.declVarys[i]}: vec4<f32>,\n`;
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
        super(`vec4<f32>(${r.toFixed(MaterialNode.constFractionDigits)},${g.toFixed(MaterialNode.constFractionDigits)},${b.toFixed(MaterialNode.constFractionDigits)},${a.toFixed(MaterialNode.constFractionDigits)})`);
    }
}
class Vec4ConstValue extends ConstValue {
    constructor(vec) {
        super(`vec4<f32>(${vec.flat().map(n => n.toFixed(MaterialNode.constFractionDigits)).join(",")})`);
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
        super(`AffineMat(mat4x4<f32>(${matEntries}),vec4<f32>(${vecEntries}))`);
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
    type = "vec4<f32>";
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
    type = "vec4<f32>";
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
    type = "AffineMat";
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
                    var N = vec4<f32>(0.0);
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
                return vec4<f32>(acesFilm((color.rgb + blackColor) * radiance), color.a);`;
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
        root.addUniform("array<AffineMat,2>", "uCamMat", r.uCamMatBuffer);
        let { code } = this.getInputCode(r, root, outputToken);
        return code + `
                var radiance = ambientLightDensity;
                var specularRadiance = vec3<f32>(0.0);
                let viewRay = -normalize(vary.pos - uCamMat[1].vector);
                for(var i=0;i<${r.lightShaderInfomation.posdirLightsNumber};i++){
                    var N = vec4<f32>(0.0);
                    var D = 0.0;
                    if(uWorldLight.posdirLights[i].density.w<-0.5){
                        D = 1.0;
                        N = uWorldLight.posdirLights[i].pos_dir;
                    }else
                     if(uWorldLight.posdirLights[i].density.w>0.5){
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
                return vec4<f32>(acesFilm((_color.rgb+blackColor) * radiance + _specular.rgb * specularRadiance), _color.a);`;
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
                let ${outputToken}_checker = fract(${token.uvw}+vec4<f32>(0.001)) - vec4<f32>(0.5);
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
        fn mod289v4(x:vec4<f32>)->vec4<f32> {
            return x - floor(x * (1.0 / 289.0)) * 289.0; 
        }
        fn mod289f(x:f32)->f32 {
            return x - floor(x * (1.0 / 289.0)) * 289.0; 
        }
        fn permutev4(x:vec4<f32>)->vec4<f32> {
            return mod289v4(((x * 34.0) + 1.0) * x);
        }
        fn permutef(x:f32)-> f32 {
            return mod289f(((x * 34.0) + 1.0) * x);
        }
        fn taylorInvSqrtv4(r:vec4<f32>)->vec4<f32> {
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
class NoiseTexture extends MaterialNode {
    getCode(r, root, outputToken) {
        // Tell root material that CheckerTexture needs deal dependency of vary input uvw
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

var four = /*#__PURE__*/Object.freeze({
    __proto__: null,
    PointLight: PointLight,
    DirectionalLight: DirectionalLight,
    SpotLight: SpotLight,
    Light: Light,
    AmbientLight: AmbientLight,
    Renderer: Renderer,
    Scene: Scene,
    Object: Object$1,
    Camera: Camera,
    Mesh: Mesh,
    Geometry: Geometry,
    TesseractGeometry: TesseractGeometry,
    CubeGeometry: CubeGeometry,
    GlomeGeometry: GlomeGeometry,
    SpheritorusGeometry: SpheritorusGeometry,
    TorisphereGeometry: TorisphereGeometry,
    SpherinderSideGeometry: SpherinderSideGeometry,
    TigerGeometry: TigerGeometry,
    ConvexHullGeometry: ConvexHullGeometry,
    Material: Material$1,
    ColorUniformValue: ColorUniformValue,
    Vec4UniformValue: Vec4UniformValue,
    FloatUniformValue: FloatUniformValue,
    TransformUniformValue: TransformUniformValue,
    BasicMaterial: BasicMaterial,
    LambertMaterial: LambertMaterial,
    PhongMaterial: PhongMaterial,
    CheckerTexture: CheckerTexture,
    GridTexture: GridTexture,
    UVWVec4Input: UVWVec4Input,
    Vec4TransformNode: Vec4TransformNode,
    NoiseWGSLHeader: NoiseWGSLHeader,
    NoiseTexture: NoiseTexture
});

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
        constructor(radius) {
            super();
            this.radius = radius;
            this.boundingGlome = radius;
            this.radiusSqr = radius * radius;
        }
        initializeMassInertia(rigid) {
            rigid.inertiaIsotroy = true;
            rigid.inertia.xy = rigid.mass * this.radiusSqr * 0.25;
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
        initializeMassInertia(rigid) {
            // todo inertia calc
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
})(rigid || (rigid = {}));

class BroadPhase {
    checkList = [];
    clearCheckList() {
        this.checkList = [];
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
class IgnoreAllBroadPhase extends BroadPhase {
    run(world) {
        this.clearCheckList();
    }
}

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
    static id(r) {
        let m = new Matrix(r);
        let rplus1 = r + 1;
        for (let i = 0, l = m.length; i < l; i += rplus1) {
            m.elem[i] = 1.0;
        }
        return m;
    }
    set(...args) {
        this.elem.set(args);
        return this;
    }
    copy(src) {
        this.elem.set(src.elem);
        return this;
    }
    // setsubmat( // todo
    //     src: Matrix, srcRow: number, srcCol: number, srcRowCount: number, srcColCount: number,
    //     dstRow: number, dstCol: number
    // ) {
    //     this.elem.set(m.elem); return this;
    // }
    clone(m) {
        return new Matrix(this.row, this.col).copy(this);
    }
    adds(m) {
        for (let i = 0, l = m.length; i < l; i++) {
            this.elem[i] += m.elem[i];
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
    divfs(k) {
        k = 1 / k;
        for (let i = 0, l = this.length; i < l; i++) {
            this.elem[i] *= k;
        }
        return this;
    }
    at(r, c) {
        return this.elem[r + this.row * c];
    }
    setAt(value, r, c) {
        this.elem[r + this.row * c] = value;
        return this;
    }
    static subMatrix(startRow, startCol, rowCount, colCout) {
        new Matrix(rowCount, colCout);
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
                let localT = (o.torque.norm1() > 0) ? this._biv2.rotateset(o.torque, o.rotation) : this._bivec0;
                let localW = this._biv1.rotateset(o.angularVelocity, o.rotation);
                let localL = mulBivec(o.angularAcceleration, localW, o.inertia);
                mulBivec(o.angularAcceleration, localL.crossrs(localW).adds(localT), o.invInertia);
                o.angularAcceleration.rotatesconj(o.rotation);
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
// export namespace force {
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
        //_vec4 is force from a to b
        this._vec4f.mulfs(k);
        // add force
        this.a.force.adds(this._vec4f);
        if (this.b)
            this.b.force.subs(this._vec4f);
        // add torque
        this.a.torque.adds(this._bivec.wedgevvset(this._vec4f, this._vec4a.subs(pa)));
        if (this.b)
            this.b.torque.subs(this._bivec.wedgevvset(this._vec4f, this._vec4b.subs(pb)));
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
        dB.adds(new Matrix(4, 6).set((xy * (kyz_w - kyw_z) + 2 * kzw_x * (xx + yy - 2 * (zz + ww)) + (kxw_z - kxz_w) * (r2m6xx)), (xy * (kxz_w - kxw_z) + 2 * kzw_y * (xx + yy - 2 * (zz + ww)) + (kyw_z - kyz_w) * (r2m6yy)), (zw * (kxz_x + kyz_y) - 2 * kzw_z * (zz + ww - 2 * (xx + yy)) + (kxw_x + kyw_y) * (r2m6zz)), -(zw * (kxw_x + kyw_y) + 2 * kzw_w * (zz + ww - 2 * (xx + yy)) + (kxz_x + kyz_y) * (r2m6ww)), -(xz * (-kyz_w - kzw_y) + 2 * kyw_x * (xx + zz - 2 * (yy + ww)) + (kxw_y - kxy_w) * (r2m6xx)), -(yw * (kxy_x - kyz_z) - 2 * kyw_y * (yy + ww - 2 * (xx + zz)) + (kxw_x + kzw_z) * (r2m6yy)), -(xz * (kxy_w - kxw_y) + 2 * kyw_z * (xx + zz - 2 * (yy + ww)) + (kzw_y + kyz_w) * (r2m6zz)), (yw * (kxw_x + kzw_z) + 2 * kyw_w * (yy + ww - 2 * (xx + zz)) + (kxy_x - kyz_z) * (r2m6ww)), -(xw * (-kzw_y + kyw_z) - 2 * kyz_x * (xx + ww - 2 * (zz + yy)) + (kxy_z - kxz_y) * (r2m6xx)), (yz * (kxy_x - kyw_w) - 2 * kyz_y * (zz + yy - 2 * (xx + ww)) + (kxz_x - kzw_w) * (r2m6yy)), -(yz * (kxz_x - kzw_w) + 2 * kyz_z * (zz + yy - 2 * (xx + ww)) + (kxy_x - kyw_w) * (r2m6zz)), -(xw * (kxz_y - kxy_z) - 2 * kyz_w * (xx + ww - 2 * (zz + yy)) + (-kyw_z + kzw_y) * (r2m6ww)), (xw * (-kxy_y - kxz_z) - 2 * kxw_x * (xx + ww - 2 * (yy + zz)) + (kyw_y + kzw_z) * (r2m6xx)), (yz * (-kxz_w - kzw_x) + 2 * kxw_y * (yy + zz - 2 * (xx + ww)) + (kyw_x + kxy_w) * (r2m6yy)), (yz * (-kxy_w - kyw_x) + 2 * kxw_z * (yy + zz - 2 * (xx + ww)) + (kzw_x + kxz_w) * (r2m6zz)), -(xw * (kyw_y + kzw_z) + 2 * kxw_w * (xx + ww - 2 * (yy + zz)) + (-kxy_y - kxz_z) * (r2m6ww)), -(xz * (-kxy_y - kxw_w) - 2 * kxz_x * (xx + zz - 2 * (yy + ww)) + (kyz_y - kzw_w) * (r2m6xx)), -(yw * (-kxw_z + kzw_x) + 2 * kxz_y * (yy + ww - 2 * (xx + zz)) + (kyz_x + kxy_z) * (r2m6yy)), (xz * (kyz_y - kzw_w) + 2 * kxz_z * (xx + zz - 2 * (yy + ww)) + (-kxy_y - kxw_w) * (r2m6zz)), -(yw * (-kxy_z - kyz_x) + 2 * kxz_w * (yy + ww - 2 * (xx + zz)) + (-kzw_x + kxw_z) * (r2m6ww)), (xy * (-kxz_z - kxw_w) - 2 * kxy_x * (xx + yy - 2 * (zz + ww)) + (-kyz_z - kyw_w) * (r2m6xx)), -(xy * (-kyz_z - kyw_w) + 2 * kxy_y * (xx + yy - 2 * (zz + ww)) + (-kxz_z - kxw_w) * (r2m6yy)), (zw * (-kxw_y + kyw_x) + 2 * kxy_z * (zz + ww - 2 * (xx + yy)) + (-kyz_x + kxz_y) * (r2m6zz)), (zw * (-kxz_y + kyz_x) + 2 * kxy_w * (zz + ww - 2 * (xx + yy)) + (-kyw_x + kxw_y) * (r2m6ww))));
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
        }
        if (a instanceof rigid.Tiger) {
            if (b instanceof rigid.Tiger)
                return this.detectTigerTiger(a, b);
            if (b instanceof rigid.Spheritorus)
                return this.detectTigerSpheritorus(a, b);
            if (b instanceof rigid.Torisphere)
                return this.detectTigerTorisphere(a, b);
            if (b instanceof rigid.Plane)
                return this.detectTigerPlane(a, b);
            if (b instanceof rigid.Glome)
                return this.detectTigerGlome(a, b);
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
        let point = a.rigid.position.clone().adds(b.rigid.position).mulfs(0.5);
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
            if (impulse.norm() > 1.0) {
                console.log("hq");
            }
            // if (impulse.norm1() === 0) continue;
            console.assert(isFinite(impulse.norm1()));
            console.assert(isFinite(normal.norm1()));
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
    PointConstrain: PointConstrain,
    Constrain: Constrain,
    Material: Material,
    World: World,
    Engine: Engine,
    BoundingGlomeBroadPhase: BoundingGlomeBroadPhase,
    BroadPhase: BroadPhase,
    IgnoreAllBroadPhase: IgnoreAllBroadPhase,
    get rigid () { return rigid; },
    RigidGeometry: RigidGeometry,
    Rigid: Rigid,
    ForceAccumulator: ForceAccumulator,
    get force_accumulator () { return force_accumulator; },
    Force: Force,
    Spring: Spring,
    Damping: Damping,
    MaxWell: MaxWell
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
        label: `VoxelBuffer<${width},${height},${depth},${formatSize}`
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
    GPU: GPU,
    get SliceFacing () { return SliceFacing; },
    get EyeOffset () { return EyeOffset; },
    SliceRenderer: SliceRenderer,
    createVoxelBuffer: createVoxelBuffer
});

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
    requestPointerLock;
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
        wheelX: 0,
        wheelY: 0,
        mspf: -1,
        isKeyHold: (_) => false,
        queryDisabled: (_) => false,
        isPointerLocked: () => false,
        exitPointerLock: () => { }
    };
    prevIsPointerLocked = false;
    constructor(dom, ctrls, config) {
        this.dom = dom;
        dom.tabIndex = 1;
        this.ctrls = ctrls;
        this.requestPointerLock = config?.requestPointerLock ?? false;
        this.states.isKeyHold = (code) => {
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
        this.states.queryDisabled = (config) => {
            return this.states.isKeyHold(config.disable) || (config.enable && !this.states.isKeyHold(config.enable));
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
        dom.addEventListener("mousedown", (ev) => {
            if (this.requestPointerLock && document.pointerLockElement !== dom) {
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
        });
        dom.addEventListener("mousemove", (ev) => {
            this.states.moveX += ev.movementX;
            this.states.moveY += ev.movementY;
        });
        dom.addEventListener("mouseup", (ev) => {
            this.states.currentBtn = -1;
            this.states.mouseUp = ev.button;
        });
        dom.addEventListener("keydown", (ev) => {
            let prevState = this.states.currentKeys.get(ev.code);
            this.states.currentKeys.set(ev.code, prevState === KeyState.HOLD ? KeyState.HOLD : KeyState.DOWN);
            if (ev.altKey === false) {
                this.states.currentKeys.set("AltLeft", KeyState.NONE);
                this.states.currentKeys.set("AltRight", KeyState.NONE);
            }
            ev.preventDefault();
            ev.stopPropagation();
        });
        dom.addEventListener("keyup", (ev) => {
            this.states.currentKeys.set(ev.code, KeyState.UP);
            ev.preventDefault();
            ev.stopPropagation();
        });
        dom.addEventListener("wheel", (ev) => {
            this.states.wheelX = ev.deltaX;
            this.states.wheelY = ev.deltaY;
        });
        if (config?.preventDefault === true) {
            dom.addEventListener("contextmenu", (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
            });
        }
    }
    update() {
        this.states.requestPointerLock = this.requestPointerLock;
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
            if (c.enabled)
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
            // console.log(key, this.states.currentKeys.get(key));
        }
    }
}
class TrackBallController {
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
    _bivec = new Bivec();
    normalisePeriodMask = 15;
    constructor(object) {
        if (object)
            this.object = object;
    }
    update(state) {
        let disabled = state.queryDisabled(this.keyConfig);
        let dampFactor = Math.exp(-this.damp * Math.min(200.0, state.mspf));
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
        this.object.rotates(this._bivec.exp());
        if ((state.updateCount & this.normalisePeriodMask) === 0) {
            this.object.rotation.norms();
        }
    }
    lookAtCenter() {
        // todo
    }
}
class FreeFlyController {
    enabled = true;
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
        spinCW: "KeyZ",
        spinCCW: "KeyX",
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
        let disabled = state.queryDisabled(this.keyConfig);
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
        this._bivec.copy(this._bivecKey);
        this._bivecKey.mulfs(dampFactor);
        if (!disabled) {
            if ((state.requestPointerLock && state.isPointerLocked()) || (state.currentBtn = 0 )) {
                let dx = state.moveX * this.mouseSpeed;
                let dy = -state.moveY * this.mouseSpeed;
                this._bivec.xw += dx;
                this._bivec.yw += dy;
            }
            if ((state.requestPointerLock && state.isPointerLocked()) || (!state.requestPointerLock)) {
                let wx = state.wheelX * this.wheelSpeed;
                let wy = state.wheelY * this.wheelSpeed;
                this._bivec.xy += wx;
                this._bivec.zw += wy;
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
    damp = 0.1;
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
        let disabled = state.queryDisabled(this.keyConfig);
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
            if ((state.requestPointerLock && state.isPointerLocked()) || (state.currentBtn === 0 && !state.requestPointerLock)) {
                let dx = state.moveX * this.mouseSpeed;
                let dy = state.moveY * this.mouseSpeed;
                this._bivec.xw += dx;
                this._bivec.zw += dy;
            }
            if ((state.requestPointerLock && state.isPointerLocked()) || (!state.requestPointerLock)) {
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
        let disabled = state.queryDisabled(this.keyConfig);
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
                facing: SliceFacing.POSZ,
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
                facing: SliceFacing.POSZ,
                eyeOffset: EyeOffset.LeftEye,
                viewport: { x: -0.5, y: 0, width: 0.5 / aspect, height: 0.8 },
                resolution
            }, {
                slicePos: 0,
                facing: SliceFacing.POSZ,
                eyeOffset: EyeOffset.RightEye,
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
                facing: SliceFacing.NEGY,
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
                facing: SliceFacing.NEGY,
                eyeOffset: EyeOffset.LeftEye,
                viewport: { x: -0.5, y: 0, width: 0.5 / aspect, height: 0.8 },
                resolution
            }, {
                slicePos: 0,
                facing: SliceFacing.NEGY,
                eyeOffset: EyeOffset.RightEye,
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
            facing: SliceFacing.POSZ,
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
            facing: SliceFacing.POSZ,
            eyeOffset: EyeOffset.LeftEye,
            viewport: { x: (pos[1] * half) - 0.5, y: size - 1, width: size, height: size },
            resolution
        })).concat(arr.map(pos => ({
            slicePos: pos[0],
            facing: SliceFacing.POSZ,
            eyeOffset: EyeOffset.RightEye,
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
            facing: SliceFacing.NEGY,
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
            facing: SliceFacing.NEGY,
            eyeOffset: EyeOffset.LeftEye,
            viewport: { x: (pos[1] * half) - 0.5, y: size - 1, width: size, height: size },
            resolution
        })).concat(arr.map(pos => ({
            slicePos: pos[0],
            facing: SliceFacing.NEGY,
            eyeOffset: EyeOffset.RightEye,
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
                facing: SliceFacing.NEGX,
                eyeOffset: EyeOffset.LeftEye,
                viewport: { x: -size_aspect, y: size - 1, width: wsize, height: size },
                resolution
            },
            {
                facing: SliceFacing.NEGX,
                eyeOffset: EyeOffset.RightEye,
                viewport: { x: 1 - size_aspect, y: size - 1, width: wsize, height: size },
                resolution
            },
            {
                facing: SliceFacing.NEGY,
                eyeOffset: EyeOffset.LeftEye,
                viewport: { x: -size_aspect, y: 1 - size, width: wsize, height: size },
                resolution
            },
            {
                facing: SliceFacing.NEGY,
                eyeOffset: EyeOffset.RightEye,
                viewport: { x: 1 - size_aspect, y: 1 - size, width: wsize, height: size },
                resolution
            },
            {
                facing: SliceFacing.POSZ,
                eyeOffset: EyeOffset.LeftEye,
                viewport: { x: size_aspect - 1, y: size - 1, width: wsize, height: size },
                resolution
            },
            {
                facing: SliceFacing.POSZ,
                eyeOffset: EyeOffset.RightEye,
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
                facing: SliceFacing.NEGX,
                viewport: { x: 1 - size_aspect, y: size - 1, width: wsize, height: size },
                resolution
            },
            {
                facing: SliceFacing.NEGY,
                viewport: { x: 1 - size_aspect, y: 1 - size, width: wsize, height: size },
                resolution
            },
            {
                facing: SliceFacing.POSZ,
                viewport: { x: size_aspect - 1, y: size - 1, width: wsize, height: size },
                resolution
            }
        ];
    }
    sliceconfig.default1eye = default1eye;
})(sliceconfig || (sliceconfig = {}));
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
    retinaEyeOffset = 0.1;
    sectionEyeOffset = 0.2;
    size;
    sectionPresets;
    currentSectionConfig = "retina+sections";
    rembemerLastLayers;
    needResize = true;
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
        toggleCrosshair: ".KeyC",
        rotateLeft: "ArrowLeft",
        rotateRight: "ArrowRight",
        rotateUp: "ArrowUp",
        rotateDown: "ArrowDown",
        refaceFront: ".KeyR",
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
    constructor(r) {
        this.renderer = r;
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
    needsUpdateRetinaCamera = false;
    retinaFov = 40;
    retinaSize = 1.8;
    retinaZDistance = 5;
    crossHairSize = 0.03;
    maxRetinaResolution = 1024;
    update(state) {
        let disabled = state.queryDisabled(this.keyConfig);
        let on = state.isKeyHold;
        let key = this.keyConfig;
        let delta;
        let sliceConfig = {};
        if (!disabled && state.isKeyHold(this.keyConfig.toggle3D)) {
            let stereo = this.renderer.getStereoMode();
            if (stereo) {
                this.renderer.setEyeOffset(0, 0);
            }
            else {
                this.renderer.setEyeOffset(this.sectionEyeOffset, this.retinaEyeOffset);
            }
            sliceConfig.sections = this.sectionPresets(this.renderer.getSize())[this.currentSectionConfig][(!stereo ? "eye2" : "eye1")];
        }
        else if (this.needResize) {
            sliceConfig.sections = this.sectionPresets(this.renderer.getSize())[this.currentSectionConfig][(this.renderer.getStereoMode() ? "eye2" : "eye1")];
        }
        if (!disabled) {
            this.needResize = false;
            if (state.isKeyHold(this.keyConfig.toggleCrosshair)) {
                let crossHair = this.renderer.getCrosshair();
                this.renderer.setCrosshair(crossHair === 0 ? this.crossHairSize : 0);
            }
            if (state.isKeyHold(this.keyConfig.addOpacity)) {
                this.renderer.setOpacity(this.renderer.getOpacity() * (1 + this.opacityKeySpeed));
            }
            if (state.isKeyHold(this.keyConfig.subOpacity)) {
                this.renderer.setOpacity(this.renderer.getOpacity() / (1 + this.opacityKeySpeed));
            }
            if (state.isKeyHold(this.keyConfig.addLayer)) {
                let layers = this.renderer.getLayers();
                if (layers > 32 || ((state.updateCount & 3) && (layers > 16 || (state.updateCount & 7)))) {
                    layers++;
                }
                if (layers > 512)
                    layers = 512;
                sliceConfig.layers = layers;
            }
            if (state.isKeyHold(this.keyConfig.subLayer)) {
                // when < 32, we slow down layer speed
                let layers = this.renderer.getLayers();
                if (layers > 32 || ((state.updateCount & 3) && (layers > 16 || (state.updateCount & 7)))) {
                    if (layers > 0)
                        layers--;
                    sliceConfig.layers = layers;
                }
            }
            if (state.isKeyHold(this.keyConfig.addRetinaResolution)) {
                let res = this.renderer.getRetinaResolution();
                res += this.renderer.getMinResolutionMultiple();
                if (res <= this.maxRetinaResolution)
                    sliceConfig.retinaResolution = res;
            }
            if (state.isKeyHold(this.keyConfig.subRetinaResolution)) {
                let res = this.renderer.getRetinaResolution();
                res -= this.renderer.getMinResolutionMultiple();
                if (res > 0)
                    sliceConfig.retinaResolution = res;
            }
            if (state.isKeyHold(this.keyConfig.addFov)) {
                this.retinaFov += this.fovKeySpeed;
                if (this.retinaFov > 120)
                    this.retinaFov = 120;
                this.needsUpdateRetinaCamera = true;
            }
            if (state.isKeyHold(this.keyConfig.subFov)) {
                this.retinaFov -= this.fovKeySpeed;
                if (this.retinaFov < 0.1)
                    this.retinaFov = 0;
                this.needsUpdateRetinaCamera = true;
            }
            for (let [label, keyCode] of Object.entries(this.keyConfig.sectionConfigs)) {
                if (state.isKeyHold(keyCode)) {
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
            if (on(key.refaceFront)) {
                this.refacingFront = true;
            }
        }
        if (this._vec2damp.norm1() < 1e-3 || this.refacingFront) {
            this._vec2damp.set(0, 0);
        }
        if (this._vec2damp.norm1() > 1e-3 || this.refacingFront || this.needsUpdateRetinaCamera) {
            if (this.needsUpdateRetinaCamera) {
                if (this.retinaFov > 0) {
                    this.retinaZDistance = this.retinaSize / Math.tan(this.retinaFov / 2 * _DEG2RAD);
                    this.renderer.setRetinaProjectMatrix({
                        fov: this.retinaFov,
                        near: Math.max(0.01, this.retinaZDistance - 4),
                        far: this.retinaZDistance + 4
                    });
                }
                else {
                    this.retinaZDistance = 4;
                    this.renderer.setRetinaProjectMatrix({
                        size: this.retinaSize,
                        near: 2,
                        far: 8
                    });
                }
            }
            this.needsUpdateRetinaCamera = false;
            this._vec2euler.x %= _360;
            this._vec2euler.y %= _360;
            let dampFactor = Math.exp(-this.damp * Math.min(200.0, state.mspf));
            if (this.refacingFront) {
                this._vec2euler.mulfs(dampFactor);
                if (this._vec2euler.norm1() < 0.01)
                    this.refacingFront = false;
            }
            this._vec2euler.adds(this._vec2damp);
            let mat = this._mat4.setFrom3DRotation(this._q1.expset(this._vec3.set(0, this._vec2euler.x, 0)).mulsr(this._q2.expset(this._vec3.set(this._vec2euler.y, 0, 0))).conjs());
            mat.elem[11] = -this.retinaZDistance;
            this.renderer.setRetinaViewMatrix(mat);
            this._vec2damp.mulfs(dampFactor);
        }
        this.renderer.setSliceConfig(sliceConfig);
    }
    setStereo(stereo) {
        if (!stereo) {
            this.renderer.setEyeOffset(0, 0);
        }
        else {
            this.renderer.setEyeOffset(this.sectionEyeOffset, this.retinaEyeOffset);
        }
        let sections = this.sectionPresets(this.renderer.getSize())[this.currentSectionConfig][(!stereo ? "eye2" : "eye1")];
        this.renderer.setSliceConfig({ sections });
    }
    setSectionEyeOffset(offset) {
        this.sectionEyeOffset = offset;
        if (this.renderer.getStereoMode())
            this.renderer.setEyeOffset(offset);
    }
    setRetinaEyeOffset(offset) {
        this.retinaEyeOffset = offset;
        if (this.renderer.getStereoMode())
            this.renderer.setEyeOffset(null, offset);
    }
    setLayers(layers) {
        this.renderer.setSliceConfig({ layers });
    }
    setOpacity(opacity) {
        this.renderer.setOpacity(opacity);
    }
    setCrosshairSize(size) {
        this.renderer.setCrosshair(size);
        this.crossHairSize = size;
    }
    setRetinaResolution(retinaResolution) {
        this.renderer.setSliceConfig({ retinaResolution });
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
        let preset = this.sectionPresets(this.renderer.getSize())[index];
        if (!preset)
            console.error(`Section Configuration "${index}" does not exsit.`);
        let layers = this.renderer.getLayers();
        if (preset.retina === false && layers > 0) {
            this.rembemerLastLayers = layers;
            layers = 0;
        }
        else if (preset.retina === true && this.rembemerLastLayers) {
            layers = this.rembemerLastLayers;
            this.rembemerLastLayers = null;
        }
        let sections = preset[(this.renderer.getStereoMode() ? "eye2" : "eye1")];
        this.renderer.setSliceConfig({ layers, sections });
        this.currentSectionConfig = index;
    }
    setSize(size) {
        this.renderer.setSize(size);
        this.needResize = true;
    }
}

var ctrl = /*#__PURE__*/Object.freeze({
    __proto__: null,
    get KeyState () { return KeyState; },
    ControllerRegistry: ControllerRegistry,
    TrackBallController: TrackBallController,
    FreeFlyController: FreeFlyController,
    KeepUpController: KeepUpController,
    VoxelViewerController: VoxelViewerController,
    get sliceconfig () { return sliceconfig; },
    RetinaController: RetinaController
});

var util = /*#__PURE__*/Object.freeze({
    __proto__: null,
    ctrl: ctrl
});

export { four, math, mesh, physics, render, util };
//# sourceMappingURL=tesserxel.js.map
