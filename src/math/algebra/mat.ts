/**  mat.ts: Matrix2|3|4
 *   author: Hqak (wxyhly)
 *   some codes are from lib three.js (e.g. Mat4.inv)
 */
namespace tesserxel {
    export namespace math {
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
                a: number = 1, b: number = 0,
                c: number = 0, d: number = 1
            ): Mat2 { this.elem = [a, b, c, d]; return this; }
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
        }
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
                a: number = 1, b: number = 0, c: number = 0,
                d: number = 0, e: number = 1, f: number = 0,
                g: number = 0, h: number = 0, i: number = 1
            ): Mat3 { this.elem = [a, b, c, d, e, f, g, h, i]; return this; }
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
            
            setFromRotaion(q:Quaternion): Mat3 {
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
        }
        export class Mat4 {
            elem: number[];
            static readonly id = new Mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
            static readonly zero = new Mat4(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
            static diag(a: number, b: number, c: number, d: number): Mat4 {
                return new Mat4(
                    a, 0, 0, 0,
                    0, b, 0, 0,
                    0, 0, c, 0,
                    0, 0, 0, d
                );
            }
            static augVec4(a: Vec4, b: Vec4, c: Vec4, d: Vec4): Mat4 {
                return new Mat4(
                    a.x, b.x, c.x, d.x,
                    a.y, b.y, c.y, d.y,
                    a.z, b.z, c.z, d.z,
                    a.w, b.w, c.w, d.w
                )
            }
            static augMat3(a: Mat3, b: Vec3, c: Vec3, d: number): Mat4 {
                c = c ?? new Vec3();
                b = b ?? new Vec3();
                return new Mat4(
                    a.elem[0], a.elem[1], a.elem[2], b.x,
                    a.elem[3], a.elem[4], a.elem[5], b.y,
                    a.elem[6], a.elem[7], a.elem[8], b.z,
                    c.x, c.y, c.z, d
                )
            }

            augVec4set(a: Vec4, b: Vec4, c: Vec4, d: Vec4): Mat4 {
                return this.set(
                    a.x, b.x, c.x, d.x,
                    a.y, b.y, c.y, d.y,
                    a.z, b.z, c.z, d.z,
                    a.w, b.w, c.w, d.w
                )
            }
            augMat3set(a: Mat3, b: Vec3, c: Vec3, d: number): Mat4 {
                return this.set(
                    a.elem[0], a.elem[1], a.elem[2], b?.x ?? 0,
                    a.elem[3], a.elem[4], a.elem[5], b?.y ?? 0,
                    a.elem[6], a.elem[7], a.elem[8], b?.z ?? 0,
                    c?.x ?? 0, c?.y ?? 0, c?.z ?? 0, d
                )
            }
            constructor(
                a: number = 1, b: number = 0, c: number = 0, d: number = 0,
                e: number = 0, f: number = 1, g: number = 0, h: number = 0,
                i: number = 0, j: number = 0, k: number = 1, l: number = 0,
                m: number = 0, n: number = 0, o: number = 0, p: number = 1
            ) { this.elem = [a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p]; }
            writeBuffer(b: Float32Array, offset: number = 0) {
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
            set(
                a: number = 1, b: number = 0, c: number = 0, d: number = 0,
                e: number = 0, f: number = 1, g: number = 0, h: number = 0,
                i: number = 0, j: number = 0, k: number = 1, l: number = 0,
                m: number = 0, n: number = 0, o: number = 0, p: number = 1
            ) {
                this.elem[0] = a, this.elem[1] = b, this.elem[2] = c, this.elem[3] = d;
                this.elem[4] = e, this.elem[5] = f, this.elem[6] = g, this.elem[7] = h;
                this.elem[8] = i, this.elem[9] = j, this.elem[10] = k, this.elem[11] = l;
                this.elem[12] = m, this.elem[13] = n, this.elem[14] = o, this.elem[15] = p; return this;
            }
            ts(): Mat4 {
                let me = this.elem;
                let tmp = me[1]; me[1] = me[4]; me[4] = tmp;
                tmp = me[2]; me[2] = me[8]; me[8] = tmp;
                tmp = me[6]; me[6] = me[9]; me[9] = tmp;
                tmp = me[3]; me[3] = me[12]; me[12] = tmp;
                tmp = me[7]; me[7] = me[13]; me[13] = tmp;
                tmp = me[11]; me[11] = me[14]; me[14] = tmp;
                return this;
            }
            t(): Mat4 {
                return new Mat4(
                    this.elem[0], this.elem[4], this.elem[8], this.elem[12],
                    this.elem[1], this.elem[5], this.elem[9], this.elem[13],
                    this.elem[2], this.elem[6], this.elem[10], this.elem[14],
                    this.elem[3], this.elem[7], this.elem[11], this.elem[15]
                );
            }
            /** col vector */x_(): Vec4 { return new Vec4(this.elem[0], this.elem[4], this.elem[8], this.elem[12]); }
            /** col vector */y_(): Vec4 { return new Vec4(this.elem[1], this.elem[5], this.elem[9], this.elem[13]); }
            /** col vector */z_(): Vec4 { return new Vec4(this.elem[2], this.elem[6], this.elem[10], this.elem[14]); }
            /** col vector */w_(): Vec4 { return new Vec4(this.elem[3], this.elem[7], this.elem[11], this.elem[15]); }

            /** row vector */_x(): Vec4 { return new Vec4(this.elem[0], this.elem[1], this.elem[2], this.elem[3]); }
            /** row vector */_y(): Vec4 { return new Vec4(this.elem[4], this.elem[5], this.elem[6], this.elem[7]); }
            /** row vector */_z(): Vec4 { return new Vec4(this.elem[8], this.elem[9], this.elem[10], this.elem[11]); }
            /** row vector */_w(): Vec4 { return new Vec4(this.elem[12], this.elem[13], this.elem[14], this.elem[15]); }
            copy(m2: Mat4): Mat4 {
                for (var i = 0; i < 16; i++) {
                    this.elem[i] = m2.elem[i];
                }
                return this;
            }
            add(m2: Mat4): Mat4 {
                let m = new Mat4();
                for (var i = 0; i < 16; i++) {
                    m.elem[i] = this.elem[i] + m2.elem[i];
                }
                return m;
            }
            adds(m2: Mat4): Mat4 {
                for (var i = 0; i < 16; i++) {
                    this.elem[i] += m2.elem[i];
                }
                return this;
            }
            neg(): Mat4 {
                let m = new Mat4();
                for (var i = 0; i < 16; i++) {
                    m.elem[i] = -this.elem[i];
                }
                return m;
            }
            negs(): Mat4 {
                for (var i = 0; i < 16; i++) {
                    this.elem[i] = -this.elem[i];
                }
                return this;
            }
            sub(m2: Mat4): Mat4 {
                let m = new Mat4();
                for (var i = 0; i < 16; i++) {
                    m.elem[i] = this.elem[i] - m2.elem[i];
                }
                return m;
            }
            subs(m2: Mat4): Mat4 {
                for (var i = 0; i < 16; i++) {
                    this.elem[i] -= m2.elem[i];
                }
                return this;
            }
            mulf(k: number): Mat4 {
                let m = new Mat4();
                for (var i = 0; i < 16; i++) {
                    m.elem[i] = this.elem[i] * k;
                }
                return m;
            }
            mulfs(k: number): Mat4 {
                for (var i = 0; i < 16; i++) {
                    this.elem[i] *= k;
                }
                return this;
            }
            mulv(v: Vec4): Vec4 {
                let a = this.elem;
                return new Vec4(
                    v.x * a[0] + v.y * a[1] + v.z * a[2] + v.w * a[3],
                    v.x * a[4] + v.y * a[5] + v.z * a[6] + v.w * a[7],
                    v.x * a[8] + v.y * a[9] + v.z * a[10] + v.w * a[11],
                    v.x * a[12] + v.y * a[13] + v.z * a[14] + v.w * a[15]
                );
            }
            mul(m: Mat4): Mat4 {
                let a = this.elem; let b = m.elem;
                return new Mat4(
                    a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12], a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13], a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14], a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15],
                    a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12], a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13], a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14], a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15],
                    a[8] * b[0] + a[9] * b[4] + a[10] * b[8] + a[11] * b[12], a[8] * b[1] + a[9] * b[5] + a[10] * b[9] + a[11] * b[13], a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14], a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15],
                    a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + a[15] * b[12], a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + a[15] * b[13], a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14], a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15],
                );
            }
            /** this = this * m; */
            mulsr(m: Mat4): Mat4 {
                let a = this.elem; let b = m.elem;
                this.set(
                    a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12], a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13], a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14], a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15],
                    a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12], a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13], a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14], a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15],
                    a[8] * b[0] + a[9] * b[4] + a[10] * b[8] + a[11] * b[12], a[8] * b[1] + a[9] * b[5] + a[10] * b[9] + a[11] * b[13], a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14], a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15],
                    a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + a[15] * b[12], a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + a[15] * b[13], a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14], a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15],
                );
                return this;
            }
            /** this = m * this; */
            mulsl(m: Mat4): Mat4 {
                let b = this.elem; let a = m.elem;
                this.set(
                    a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12], a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13], a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14], a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15],
                    a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12], a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13], a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14], a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15],
                    a[8] * b[0] + a[9] * b[4] + a[10] * b[8] + a[11] * b[12], a[8] * b[1] + a[9] * b[5] + a[10] * b[9] + a[11] * b[13], a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14], a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15],
                    a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + a[15] * b[12], a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + a[15] * b[13], a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14], a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15],
                );
                return this;
            }
            /** this = m1 * m2; */
            mulset(m1: Mat4, m2: Mat4): Mat4 {
                let a = m1.elem; let b = m2.elem;
                this.set(
                    a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12], a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13], a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14], a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15],
                    a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12], a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13], a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14], a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15],
                    a[8] * b[0] + a[9] * b[4] + a[10] * b[8] + a[11] * b[12], a[8] * b[1] + a[9] * b[5] + a[10] * b[9] + a[11] * b[13], a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14], a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15],
                    a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + a[15] * b[12], a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + a[15] * b[13], a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14], a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15],
                );
                return this;
            }
            setFrom3DRotation(q:Quaternion): Mat4 {
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
                    1 - (y2 + z2), xy - wz, xz + wy, 0,
                    xy + wz, 1 - x2 - z2, yz - wx, 0,
                    xz - wy, yz + wx, 1 - x2 - y2, 0,
                    0, 0, 0, 1
                );
            }
            setFromQuaternionL(q:Quaternion): Mat4 {
                return this.set(
                    q.x, -q.y, -q.z, -q.w,
                    q.y, q.x, -q.w, q.z,
                    q.z, q.w, q.x, -q.y,
                    q.w, -q.z, q.y, q.x
                );
            }
            setFromQuaternionR(q:Quaternion): Mat4 {
                return this.set(
                    q.x, -q.y, -q.z, -q.w,
                    q.y, q.x, q.w, -q.z,
                    q.z, -q.w, q.x, q.y,
                    q.w, q.z, -q.y, q.x
                );
            }
            setFromRotor(r:Rotor): Mat4 {
                return this.setFromQuaternionL(r.l).mulsr(_mat4.setFromQuaternionR(r.r));
            }
            setFromRotorconj(r:Rotor): Mat4 {
                return this.setFromQuaternionL(r.l.conj()).mulsr(_mat4.setFromQuaternionR(r.r.conj()));
            }
            det(): number {
                let me = this.elem;
                let n11 = me[0], n21 = me[1], n31 = me[2], n41 = me[3],
                    n12 = me[4], n22 = me[5], n32 = me[6], n42 = me[7],
                    n13 = me[8], n23 = me[9], n33 = me[10], n43 = me[11],
                    n14 = me[12], n24 = me[13], n34 = me[14], n44 = me[15],
                    t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44,
                    t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44,
                    t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44,
                    t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;
                return n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;
            }
            inv(): Mat4 {
                let me = this.elem;
                let n11 = me[0], n21 = me[1], n31 = me[2], n41 = me[3],
                    n12 = me[4], n22 = me[5], n32 = me[6], n42 = me[7],
                    n13 = me[8], n23 = me[9], n33 = me[10], n43 = me[11],
                    n14 = me[12], n24 = me[13], n34 = me[14], n44 = me[15],
                    t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44,
                    t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44,
                    t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44,
                    t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;
                let det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;
                if (det === 0) {
                    console.warn("Matrix determinant is 0");
                    return new Mat4(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
                }
                let detInv = 1 / det;
                return new Mat4(
                    t11 * detInv,
                    (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * detInv,
                    (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * detInv,
                    (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * detInv,
                    t12 * detInv,
                    (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * detInv,
                    (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * detInv,
                    (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * detInv,
                    t13 * detInv,
                    (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * detInv,
                    (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * detInv,
                    (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * detInv,
                    t14 * detInv,
                    (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * detInv,
                    (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * detInv,
                    (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * detInv,
                );
            }
            invs(): Mat4 {
                let me = this.elem;
                let n11 = me[0], n21 = me[1], n31 = me[2], n41 = me[3],
                    n12 = me[4], n22 = me[5], n32 = me[6], n42 = me[7],
                    n13 = me[8], n23 = me[9], n33 = me[10], n43 = me[11],
                    n14 = me[12], n24 = me[13], n34 = me[14], n44 = me[15],
                    t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44,
                    t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44,
                    t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44,
                    t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;
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
        }
        export interface PerspectiveCamera {
            fov: number;
            near: number;
            far: number;
            /** aspect = width / height = depth / height */
            aspect?: number;
        }
        /** Caution: This function calculates PerspectiveMatrix for 0-1 depth range */
        export function getPerspectiveMatrix(c: PerspectiveCamera) {
            let ky = Math.tan(math._90 - c.fov / 2 * math._DEG2RAD);
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
                mat4: new math.Mat4(
                    kxz, 0, 0, 0,
                    0, ky, 0, 0,
                    0, 0, a, b,
                    0, 0, -1, 0
                ),
                /** used for 4d because of lack of mat5x5 */
                vec4: new math.Vec4(kxz, ky, a, b)
            }
        }

        export let _mat2 = new Mat2();
        export let _mat3 = new Mat3();
        export let _mat4 = new Mat4();
    }
}