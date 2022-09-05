"use strict";
var tesserxel;
(function (tesserxel) {
    let math;
    (function (math) {
        math._180 = Math.PI;
        math._30 = Math.PI / 6;
        math._60 = Math.PI / 3;
        math._45 = Math.PI / 4;
        math._90 = Math.PI / 2;
        math._360 = Math.PI * 2;
        math._DEG2RAD = Math.PI / 180;
        math._RAD2DEG = 180 / Math.PI;
        class Srand {
            _seed;
            constructor(seed) {
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
        math.Srand = Srand;
    })(math = tesserxel.math || (tesserxel.math = {}));
})(tesserxel || (tesserxel = {}));
var tesserxel;
(function (tesserxel) {
    let math;
    (function (math) {
        /** [A(4x4), b(1x4)]
         *
         *  [0(4x1), 1(1x1)]
         *
         *  a blocked 5x5 matrix for transform in 4d
         */
        class AffineMat4 {
            mat;
            vec;
            constructor(mat = new math.Mat4(), vec = new math.Vec4()) {
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
        }
        math.AffineMat4 = AffineMat4;
        /** an coordinate transform of rotation translation and scale */
        class Obj4 {
            position;
            rotation;
            scale;
            constructor(position = new math.Vec4(), rotation = new math.Rotor(), scale) {
                this.position = position;
                this.rotation = rotation;
                this.scale = scale;
            }
            local2parent(point) {
                if (this.scale)
                    return new math.Vec4(this.scale.x * point.x, this.scale.y * point.y, this.scale.z * point.z, this.scale.w * point.w).rotates(this.rotation).adds(this.position);
                return point.rotate(this.rotation).adds(this.position);
            }
            parent2local(point) {
                let a = point.sub(this.position).rotatesconj(this.rotation);
                if (this.scale)
                    return new math.Vec4(a.x / this.scale.x, a.y / this.scale.y, a.z / this.scale.z, a.w / this.scale.w);
                return a;
            }
            getMat4() {
                if (this.scale)
                    return this.rotation.toMat4().mul(math.Mat4.diag(this.scale.x, this.scale.y, this.scale.z, this.scale.w));
                return this.rotation.toMat4();
            }
            getMat4inv() {
                if (this.scale)
                    return math.Mat4.diag(1 / this.scale.x, 1 / this.scale.y, 1 / this.scale.z, 1 / this.scale.w).mul(this.rotation.conj().toMat4());
                return this.rotation.conj().toMat4();
            }
            getAffineMat4() {
                if (this.scale)
                    return new AffineMat4(this.rotation.toMat4().mulsr(math.Mat4.diag(this.scale.x, this.scale.y, this.scale.z, this.scale.w)), this.position.clone());
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
                return new AffineMat4(math.Mat4.diag(x, y, z, w).mulsr(this.rotation.conj().toMat4()), new math.Vec4(b.x * x, b.y * y, b.z * z, b.w * w));
            }
            translates(v) {
                this.position.adds(v);
                return this;
            }
            rotates(r) {
                this.rotation.mulsl(r);
                return this;
            }
            rotatesAt(r, center = new math.Vec4()) {
                this.rotation.mulsl(r);
                this.position.subs(center).rotates(r).adds(center);
                return this;
            }
        }
        math.Obj4 = Obj4;
    })(math = tesserxel.math || (tesserxel.math = {}));
})(tesserxel || (tesserxel = {}));
var tesserxel;
(function (tesserxel) {
    let math;
    (function (math) {
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
        math.Complex = Complex;
        class CMat2 {
        }
        math.CMat2 = CMat2;
    })(math = tesserxel.math || (tesserxel.math = {}));
})(tesserxel || (tesserxel = {}));
var tesserxel;
(function (tesserxel) {
    let math;
    (function (math) {
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
                for (let i = 0; i < m.length; i += rplus1) {
                    m.elem[i] = 1.0;
                }
                return m;
            }
            static subMatrix(startRow, startCol, rowCount, colCout) {
                let m = new Matrix(rowCount, colCout);
            }
        }
        math.Matrix = Matrix;
    })(math = tesserxel.math || (tesserxel.math = {}));
})(tesserxel || (tesserxel = {}));
/**  ga.ts: Geometry Algebra
 *   Bivec|Quaternion|Rotor|Multivector
 *   author: Hqak (wxyhly)
 */
var tesserxel;
(function (tesserxel) {
    let math;
    (function (math) {
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
                ;
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
                return new math.Vec4(-this.yz * V.w - this.zw * V.y + this.yw * V.z, this.xz * V.w + this.zw * V.x - this.xw * V.z, -this.xy * V.w - this.yw * V.x + this.xw * V.y, this.xy * V.z + this.yz * V.x - this.xz * V.y);
            }
            wedgevvset(v1, v2) {
                return this.set(v1.x * v2.y - v1.y * v2.x, v1.x * v2.z - v1.z * v2.x, v1.x * v2.w - v1.w * v2.x, v1.y * v2.z - v1.z * v2.y, v1.y * v2.w - v1.w * v2.y, v1.z * v2.w - v1.w * v2.z);
            }
            /** Vector part of Geometry Product
             * exy * ey = ex, exy * ex = -ey, exy * ez = 0
             *  */
            dotv(V) {
                return new math.Vec4(this.xy * V.y + this.xz * V.z + this.xw * V.w, -this.xy * V.x + this.yz * V.z + this.yw * V.w, -this.xz * V.x - this.yz * V.y + this.zw * V.w, -this.xw * V.x - this.yw * V.y - this.zw * V.z);
            }
            cross(V) {
                return new Bivec(V.xz * this.yz - this.xz * V.yz + V.xw * this.yw - this.xw * V.yw, -V.xy * this.yz + this.xy * V.yz + V.xw * this.zw - this.xw * V.zw, -V.xy * this.yw + this.xy * V.yw - V.xz * this.zw + this.xz * V.zw, V.xy * this.xz - this.xy * V.xz + V.yw * this.zw - this.yw * V.zw, V.xy * this.xw - this.xy * V.xw - V.yz * this.zw + this.yz * V.zw, V.xz * this.xw - this.xz * V.xw + V.yz * this.yw - this.yz * V.yw);
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
                let A = new math.Vec3(this.xy + this.zw, this.xz - this.yw, this.xw + this.yz);
                let B = new math.Vec3(this.xy - this.zw, this.xz + this.yw, this.xw - this.yz);
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
                let sub = Math.acos(cc + ss);
                let add = Math.acos(cc - ss);
                return [(add + sub) * 0.5, (add - sub) * 0.5];
            }
            rotate(r) {
                // a novel method to calculate bivec rotation using isoclinic decomposition
                let A = math._Q_1.set(0, this.xy + this.zw, this.xz - this.yw, this.xw + this.yz);
                let B = math._Q_2.set(0, this.xy - this.zw, this.xz + this.yw, this.xw - this.yz);
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
                let A = math._Q_1.set(0, this.xy + this.zw, this.xz - this.yw, this.xw + this.yz);
                let B = math._Q_2.set(0, this.xy - this.zw, this.xz + this.yw, this.xw - this.yz);
                A.mulsl(r.l).mulsrconj(r.l);
                B.mulslconj(r.r).mulsr(r.r);
                this.xy = (A.y + B.y) * 0.5;
                this.xz = (A.z + B.z) * 0.5;
                this.xw = (A.w + B.w) * 0.5, A.w - B.w, B.z - A.z, A.y - B.y;
                return this;
            }
            /** return a random oriented simple normalized bivector */
            static rand() {
                // sampled in isoclinic space uniformly for left and right part respectively
                let a = math._vec3_1.randset().mulfs(0.5);
                let b = math._vec3_2.randset().mulfs(0.5);
                return new Bivec(a.x + b.x, a.y + b.y, a.z + b.z, a.z - b.z, b.y - a.y, a.x - b.x);
            }
            /** return a random oriented simple normalized bivector by seed */
            static srand(seed) {
                let a = math._vec3_1.srandset(seed).mulfs(0.5);
                let b = math._vec3_2.srandset(seed).mulfs(0.5);
                return new Bivec(a.x + b.x, a.y + b.y, a.z + b.z, a.z - b.z, b.y - a.y, a.x - b.x);
            }
        }
        math.Bivec = Bivec;
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
            yzw() { return new math.Vec3(this.y, this.z, this.w); }
            ywz() { return new math.Vec3(this.y, this.w, this.z); }
            zyw() { return new math.Vec3(this.z, this.y, this.w); }
            zwy() { return new math.Vec3(this.z, this.w, this.y); }
            wzy() { return new math.Vec3(this.w, this.z, this.y); }
            wyz() { return new math.Vec3(this.w, this.y, this.z); }
            wxyz() { return new math.Vec4(this.w, this.x, this.y, this.z); }
            wxzy() { return new math.Vec4(this.w, this.x, this.z, this.y); }
            wyxz() { return new math.Vec4(this.w, this.y, this.x, this.z); }
            wzxy() { return new math.Vec4(this.w, this.z, this.x, this.y); }
            yxzw() { return new math.Vec4(this.y, this.x, this.z, this.w); }
            xzwy() { return new math.Vec4(this.x, this.z, this.w, this.y); }
            xyzw() { return new math.Vec4(this.x, this.y, this.z, this.w); }
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
                return new math.Mat4(1 - (y2 + z2), xy - wz, xz + wy, 0, xy + wz, 1 - x2 - z2, yz - wx, 0, xz - wy, yz + wx, 1 - x2 - y2, 0, 0, 0, 0, 1);
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
                return new math.Mat3(1 - (y2 + z2), xy - wz, xz + wy, xy + wz, 1 - x2 - z2, yz - wx, xz - wy, yz + wx, 1 - x2 - y2);
            }
            toLMat4() {
                return new math.Mat4(this.x, -this.y, -this.z, -this.w, this.y, this.x, -this.w, this.z, this.z, this.w, this.x, -this.y, this.w, -this.z, this.y, this.x);
            }
            toRMat4() {
                return new math.Mat4(this.x, -this.y, -this.z, -this.w, this.y, this.x, this.w, -this.z, this.z, -this.w, this.x, this.y, this.w, this.z, -this.y, this.x);
            }
            expset(v) {
                let g = v.norm() * 0.5;
                let s = Math.abs(g) > 0.005 ? Math.sin(g) / g * 0.5 : 0.5 - g * g / 12;
                return this.set(Math.cos(g), s * v.x, s * v.y, s * v.z);
            }
            static rand() {
                let a = Math.random() * math._360;
                let b = Math.random() * math._360;
                let c = Math.random();
                let sc = Math.sqrt(c);
                let cc = Math.sqrt(1 - c);
                return new Quaternion(sc * Math.cos(a), sc * Math.sin(a), cc * Math.cos(b), cc * Math.sin(b));
            }
            static srand(seed) {
                let a = seed.nextf() * math._360;
                let b = seed.nextf() * math._360;
                let c = seed.nextf();
                let sc = Math.sqrt(c);
                let cc = Math.sqrt(1 - c);
                return new Quaternion(sc * Math.cos(a), sc * Math.sin(a), cc * Math.cos(b), cc * Math.sin(b));
            }
            randset() {
                let a = Math.random() * math._360;
                let b = Math.random() * math._360;
                let c = Math.random();
                let sc = Math.sqrt(c);
                let cc = Math.sqrt(1 - c);
                return this.set(sc * Math.cos(a), sc * Math.sin(a), cc * Math.cos(b), cc * Math.sin(b));
            }
            srandset(seed) {
                let a = seed.nextf() * math._360;
                let b = seed.nextf() * math._360;
                let c = seed.nextf();
                let sc = Math.sqrt(c);
                let cc = Math.sqrt(1 - c);
                return this.set(sc * Math.cos(a), sc * Math.sin(a), cc * Math.cos(b), cc * Math.sin(b));
            }
        }
        math.Quaternion = Quaternion;
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
            expset(bivec) {
                let A = math._vec3_1.set(bivec.xy + bivec.zw, bivec.xz - bivec.yw, bivec.xw + bivec.yz);
                let B = math._vec3_2.set(bivec.xy - bivec.zw, bivec.xz + bivec.yw, bivec.xw - bivec.yz);
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
                return this.l.toLMat4().mulsr(math._mat4.setFromQuaternionR(this.r));
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
                let right = from.wedge(to);
                let s = right.norm();
                let c = from.dot(to);
                if (s > 0.000001) { // not aligned
                    right.mulfs(Math.atan2(s, c) / s);
                }
                else if (c < 0) { // almost n reversely aligned
                    let v = from.wedge(math.Vec4.x);
                    if (v.norm1() < 0.01) {
                        v = from.wedge(math.Vec4.y);
                    }
                    return v.norms().mulfs(math._180).exp();
                }
                return right.exp();
            }
            // todo: lookAtb(from: Bivec, to: Bivec): Rotor
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
        }
        math.Rotor = Rotor;
    })(math = tesserxel.math || (tesserxel.math = {}));
})(tesserxel || (tesserxel = {}));
/**  mat.ts: Matrix2|3|4
 *   author: Hqak (wxyhly)
 *   some codes are from lib three.js (e.g. Mat4.inv)
 */
var tesserxel;
(function (tesserxel) {
    let math;
    (function (math) {
        class Mat2 {
            elem;
            static id = new Mat2(1, 0, 0, 1);
            static zero = new Mat2(0, 0, 0, 0);
            static diag(a, b) {
                return new Mat2(a, 0, 0, b);
            }
            constructor(a = 1, b = 0, c = 0, d = 1) { this.elem = [a, b, c, d]; }
            set(a = 1, b = 0, c = 0, d = 1) { this.elem = [a, b, c, d]; return this; }
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
                return new math.Vec2(v.x * a[0] + v.y * a[1], v.x * a[2] + v.y * a[3]);
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
        }
        math.Mat2 = Mat2;
        class Mat3 {
            elem;
            static id = new Mat3(1, 0, 0, 0, 1, 0, 0, 0, 1);
            static zero = new Mat3(0, 0, 0, 0, 0, 0, 0, 0, 0);
            static diag(a, b, c) {
                return new Mat3(a, 0, 0, 0, b, 0, 0, 0, c);
            }
            constructor(a = 1, b = 0, c = 0, d = 0, e = 1, f = 0, g = 0, h = 0, i = 1) { this.elem = [a, b, c, d, e, f, g, h, i]; }
            set(a = 1, b = 0, c = 0, d = 0, e = 1, f = 0, g = 0, h = 0, i = 1) { this.elem = [a, b, c, d, e, f, g, h, i]; return this; }
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
                return new math.Vec3(v.x * a[0] + v.y * a[1] + v.z * a[2], v.x * a[3] + v.y * a[4] + v.z * a[5], v.x * a[6] + v.y * a[7] + v.z * a[8]);
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
        }
        math.Mat3 = Mat3;
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
                c = c ?? new math.Vec3();
                b = b ?? new math.Vec3();
                return new Mat4(a.elem[0], a.elem[1], a.elem[2], b.x, a.elem[3], a.elem[4], a.elem[5], b.y, a.elem[6], a.elem[7], a.elem[8], b.z, c.x, c.y, c.z, d);
            }
            augVec4set(a, b, c, d) {
                return this.set(a.x, b.x, c.x, d.x, a.y, b.y, c.y, d.y, a.z, b.z, c.z, d.z, a.w, b.w, c.w, d.w);
            }
            augMat3set(a, b, c, d) {
                return this.set(a.elem[0], a.elem[1], a.elem[2], b?.x ?? 0, a.elem[3], a.elem[4], a.elem[5], b?.y ?? 0, a.elem[6], a.elem[7], a.elem[8], b?.z ?? 0, c?.x ?? 0, c?.y ?? 0, c?.z ?? 0, d);
            }
            constructor(a = 1, b = 0, c = 0, d = 0, e = 0, f = 1, g = 0, h = 0, i = 0, j = 0, k = 1, l = 0, m = 0, n = 0, o = 0, p = 1) { this.elem = [a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p]; }
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
            set(a = 1, b = 0, c = 0, d = 0, e = 0, f = 1, g = 0, h = 0, i = 0, j = 0, k = 1, l = 0, m = 0, n = 0, o = 0, p = 1) {
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
            /** col vector */ x_() { return new math.Vec4(this.elem[0], this.elem[4], this.elem[8], this.elem[12]); }
            /** col vector */ y_() { return new math.Vec4(this.elem[1], this.elem[5], this.elem[9], this.elem[13]); }
            /** col vector */ z_() { return new math.Vec4(this.elem[2], this.elem[6], this.elem[10], this.elem[14]); }
            /** col vector */ w_() { return new math.Vec4(this.elem[3], this.elem[7], this.elem[11], this.elem[15]); }
            /** row vector */ _x() { return new math.Vec4(this.elem[0], this.elem[1], this.elem[2], this.elem[3]); }
            /** row vector */ _y() { return new math.Vec4(this.elem[4], this.elem[5], this.elem[6], this.elem[7]); }
            /** row vector */ _z() { return new math.Vec4(this.elem[8], this.elem[9], this.elem[10], this.elem[11]); }
            /** row vector */ _w() { return new math.Vec4(this.elem[12], this.elem[13], this.elem[14], this.elem[15]); }
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
                return new math.Vec4(v.x * a[0] + v.y * a[1] + v.z * a[2] + v.w * a[3], v.x * a[4] + v.y * a[5] + v.z * a[6] + v.w * a[7], v.x * a[8] + v.y * a[9] + v.z * a[10] + v.w * a[11], v.x * a[12] + v.y * a[13] + v.z * a[14] + v.w * a[15]);
            }
            mul(m) {
                let a = this.elem;
                let b = m.elem;
                return new Mat4(a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12], a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13], a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14], a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15], a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12], a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13], a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14], a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15], a[8] * b[0] + a[9] * b[4] + a[10] * b[8] + a[11] * b[12], a[8] * b[1] + a[9] * b[5] + a[10] * b[9] + a[11] * b[13], a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14], a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15], a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + a[15] * b[12], a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + a[15] * b[13], a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14], a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15]);
            }
            /** this = this * m2; */
            mulsr(m) {
                let a = this.elem;
                let b = m.elem;
                this.set(a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12], a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13], a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14], a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15], a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12], a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13], a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14], a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15], a[8] * b[0] + a[9] * b[4] + a[10] * b[8] + a[11] * b[12], a[8] * b[1] + a[9] * b[5] + a[10] * b[9] + a[11] * b[13], a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14], a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15], a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + a[15] * b[12], a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + a[15] * b[13], a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14], a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15]);
                return this;
            }
            /** this = m2 * this; */
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
                return this.setFromQuaternionL(r.l).mulsr(math._mat4.setFromQuaternionR(r.r));
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
        }
        math.Mat4 = Mat4;
        /** Caution: This function calculates PerspectiveMatrix for 0-1 depth range */
        function getPerspectiveMatrix(c) {
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
                mat4: new math.Mat4(kxz, 0, 0, 0, 0, ky, 0, 0, 0, 0, a, b, 0, 0, -1, 0),
                /** used for 4d because of lack of mat5x5 */
                vec4: new math.Vec4(kxz, ky, a, b)
            };
        }
        math.getPerspectiveMatrix = getPerspectiveMatrix;
        math._mat2 = new Mat2();
        math._mat3 = new Mat3();
        math._mat4 = new Mat4();
    })(math = tesserxel.math || (tesserxel.math = {}));
})(tesserxel || (tesserxel = {}));
/**  vec.ts: Vector2|3|4
 *   author: Hqak (wxyhly)
 */
var tesserxel;
(function (tesserxel) {
    let math;
    (function (math) {
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
                let a = Math.random() * math._360;
                return new Vec2(Math.cos(a), Math.sin(a));
            }
            static srand(seed) {
                let a = seed.nextf() * math._360;
                return new Vec2(Math.cos(a), Math.sin(a));
            }
        }
        math.Vec2 = Vec2;
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
                return new math.Quaternion(Math.cos(g), s * this.x, s * this.y, s * this.z);
            }
            rotate(q) {
                return math._Q.set(0, this.x, this.y, this.z).mulsl(q).mulsr(q.conj()).yzw();
            }
            rotates(q) {
                let q2 = math._Q.set(0, this.x, this.y, this.z).mulsl(q).mulsr(q.conj());
                this.x = q2.y;
                this.y = q2.z;
                this.z = q2.w;
                return this;
            }
            randset() {
                let a = Math.random() * math._360;
                let c = Math.random() * 2.0 - 1.0;
                let b = Math.sqrt(1.0 - c * c);
                return this.set(b * Math.cos(a), b * Math.sin(a), c);
            }
            srandset(seed) {
                let a = seed.nextf() * math._360;
                let c = seed.nextf() * 2.0 - 1.0;
                let b = Math.sqrt(1.0 - c * c);
                return this.set(b * Math.cos(a), b * Math.sin(a), c);
            }
            static rand() {
                let a = Math.random() * math._360;
                let c = Math.random() * 2.0 - 1.0;
                let b = Math.sqrt(1.0 - c * c);
                return new Vec3(b * Math.cos(a), b * Math.sin(a), c);
            }
            static srand(seed) {
                let a = seed.nextf() * math._360;
                let c = seed.nextf() * 2.0 - 1.0;
                let b = Math.sqrt(1.0 - c * c);
                return new Vec3(b * Math.cos(a), b * Math.sin(a), c);
            }
            reflect(normal) {
                return this.sub(normal.mulf(this.dot(normal) * 2));
            }
            reflects(normal) {
                return this.subs(normal.mulf(this.dot(normal) * 2));
            }
        }
        math.Vec3 = Vec3;
        class Vec4 {
            x;
            y;
            z;
            w;
            static x = new Vec4(1, 0, 0, 0);
            static y = new Vec4(0, 1, 0, 0);
            static z = new Vec4(0, 0, 1, 0);
            static w = new Vec4(0, 0, 0, 1);
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
                return new math.Bivec(this.x * V.y - this.y * V.x, this.x * V.z - this.z * V.x, this.x * V.w - this.w * V.x, this.y * V.z - this.z * V.y, this.y * V.w - this.w * V.y, this.z * V.w - this.w * V.z);
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
            dotbset(B, v) {
                return v.set(-B.xy * this.y - B.xz * this.z - B.xw * this.w, B.xy * this.x - B.yz * this.z - B.yw * this.w, B.xz * this.x + B.yz * this.y - B.zw * this.w, B.xw * this.x + B.yw * this.y + B.zw * this.z);
            }
            /** this = mat * this */
            mulmatls(mat4) {
                let a = mat4.elem;
                return this.set(this.x * a[0] + this.y * a[1] + this.z * a[2] + this.w * a[3], this.x * a[4] + this.y * a[5] + this.z * a[6] + this.w * a[7], this.x * a[8] + this.y * a[9] + this.z * a[10] + this.w * a[11], this.x * a[12] + this.y * a[13] + this.z * a[14] + this.w * a[15]);
            }
            rotate(r) {
                return math._Q.copy(this).mulsl(r.l).mulsr(r.r).xyzw();
            }
            rotates(r) {
                this.copy(math._Q.copy(this).mulsl(r.l).mulsr(r.r));
                return this;
            }
            rotateconj(r) {
                return math._Q.copy(this).mulslconj(r.l).mulsrconj(r.r).xyzw();
            }
            rotatesconj(r) {
                this.copy(math._Q.copy(this).mulslconj(r.l).mulsrconj(r.r));
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
            randset() {
                let a = Math.random() * math._360;
                let b = Math.random() * math._360;
                let c = Math.random();
                let sc = Math.sqrt(c);
                let cc = Math.sqrt(1 - c);
                return this.set(sc * Math.cos(a), sc * Math.sin(a), cc * Math.cos(b), cc * Math.sin(b));
            }
            srandset(seed) {
                let a = seed.nextf() * math._360;
                let b = seed.nextf() * math._360;
                let c = seed.nextf();
                let sc = Math.sqrt(c);
                let cc = Math.sqrt(1 - c);
                return this.set(sc * Math.cos(a), sc * Math.sin(a), cc * Math.cos(b), cc * Math.sin(b));
            }
            static rand() {
                let a = Math.random() * math._360;
                let b = Math.random() * math._360;
                let c = Math.random();
                let sc = Math.sqrt(c);
                let cc = Math.sqrt(1 - c);
                return new Vec4(sc * Math.cos(a), sc * Math.sin(a), cc * Math.cos(b), cc * Math.sin(b));
            }
            static srand(seed) {
                let a = seed.nextf() * math._360;
                let b = seed.nextf() * math._360;
                let c = seed.nextf();
                let sc = Math.sqrt(c);
                let cc = Math.sqrt(1 - c);
                return new Vec4(sc * Math.cos(a), sc * Math.sin(a), cc * Math.cos(b), cc * Math.sin(b));
            }
        }
        math.Vec4 = Vec4;
        // temporary variables
        math._vec2 = new Vec2();
        math._vec3 = new Vec3();
        math._vec3_1 = new Vec3();
        math._vec3_2 = new Vec3();
        math._vec4 = new Vec4();
        math._Q = new math.Quaternion();
        math._Q_1 = new math.Quaternion();
        math._Q_2 = new math.Quaternion();
    })(math = tesserxel.math || (tesserxel.math = {}));
})(tesserxel || (tesserxel = {}));
var tesserxel;
(function (tesserxel) {
    let math;
    (function (math) {
        class Ray {
            origin;
            direction;
        }
        class Plane {
            /** normal need to be normalized */
            normal;
            offset;
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
        }
    })(math = tesserxel.math || (tesserxel.math = {}));
})(tesserxel || (tesserxel = {}));
var tesserxel;
(function (tesserxel) {
    let math;
    (function (math) {
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
                let prevDir = math.Vec4.w;
                let prevRotor = new math.Rotor();
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
                        let curPoint = new math.Vec4(p0.x + t * (d0.x + t * (B.x + t * A.x)), p0.y + t * (d0.y + t * (B.y + t * A.y)), p0.z + t * (d0.z + t * (B.z + t * A.z)), p0.w + t * (d0.w + t * (B.w + t * A.w)));
                        if (prevPoint) {
                            let curDir = curPoint.sub(prevPoint);
                            let dirLen = curDir.norm();
                            curDir.divfs(dirLen);
                            prevRotor.mulsl(math.Rotor.lookAt(prevDir, curDir));
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
                return new math.Vec4(x, y, z, w);
            }
        }
        math.Spline = Spline;
    })(math = tesserxel.math || (tesserxel.math = {}));
})(tesserxel || (tesserxel = {}));
var tesserxel;
(function (tesserxel) {
    let mesh;
    (function (mesh) {
        let face;
        (function (face) {
            function sphere(u, v) {
            }
            face.sphere = sphere;
            function parametricSurface(fn, uSegment, vSegment) {
                if (uSegment < 1)
                    uSegment = 1;
                if (vSegment < 1)
                    vSegment = 1;
                let uv_seg = uSegment * uSegment;
                let arraySize = uv_seg << 4;
                uSegment++;
                vSegment++;
                let positions = new Float32Array((uv_seg) << 2);
                let normals = new Float32Array((uv_seg) << 2);
                let uvws = new Float32Array((uv_seg) << 2);
                let position = new Float32Array(arraySize);
                let normal = new Float32Array(arraySize);
                let uvw = new Float32Array(arraySize);
                let inputUV = new tesserxel.math.Vec2;
                let outputVertex = new tesserxel.math.Vec4;
                let outputNormal = new tesserxel.math.Vec4;
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
                    inputUV.x = u_index / (uSegment - 1);
                    let offset = vSegment * u_index;
                    for (let v_index = 0; v_index < vSegment; v_index++) {
                        inputUV.y = v_index / (vSegment - 1);
                        fn(inputUV, outputVertex, outputNormal);
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
                        uvws[ptr++] = inputUV.x;
                        uvws[ptr++] = inputUV.y;
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
            }
            face.parametricSurface = parametricSurface;
        })(face = mesh.face || (mesh.face = {}));
    })(mesh = tesserxel.mesh || (tesserxel.mesh = {}));
})(tesserxel || (tesserxel = {}));
var tesserxel;
(function (tesserxel) {
    let mesh;
    (function (mesh_1) {
        let tetra;
        (function (tetra) {
            tetra.cube = {
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
                tetraCount: 5
            };
            function applyAffineMat4(mesh, am) {
                let vp = new tesserxel.math.Vec4();
                for (let i = 0; i < mesh.position.length; i += 4) {
                    vp.set(mesh.position[i], mesh.position[i + 1], mesh.position[i + 2], mesh.position[i + 3]).mulmatls(am.mat).adds(am.vec).writeBuffer(mesh.position, i);
                    if (mesh.normal) {
                        vp.set(mesh.normal[i], mesh.normal[i + 1], mesh.normal[i + 2], mesh.normal[i + 3]).mulmatls(am.mat).writeBuffer(mesh.position, i);
                    }
                }
                return mesh;
            }
            tetra.applyAffineMat4 = applyAffineMat4;
            function applyObj4(mesh, obj) {
                let vp = new tesserxel.math.Vec4();
                let scaleinv;
                if (obj.scale && mesh.normal) {
                    scaleinv = new tesserxel.math.Vec4(1 / obj.scale.x, 1 / obj.scale.y, 1 / obj.scale.z, 1 / obj.scale.w);
                }
                for (let i = 0; i < mesh.position.length; i += 4) {
                    if (obj.scale) {
                        vp.set(mesh.position[i] * obj.scale.x, mesh.position[i + 1] * obj.scale.y, mesh.position[i + 2] * obj.scale.z, mesh.position[i + 3] * obj.scale.w).rotates(obj.rotation).adds(obj.position).writeBuffer(mesh.position, i);
                        if (mesh.normal) {
                            vp.set(mesh.normal[i] * scaleinv.x, mesh.normal[i + 1] * scaleinv.y, mesh.normal[i + 2] * scaleinv.z, mesh.normal[i + 3] * scaleinv.w).rotates(obj.rotation).writeBuffer(mesh.position, i);
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
            tetra.applyObj4 = applyObj4;
            function concat(mesh1, mesh2) {
                let position = new Float32Array(mesh1.position.length + mesh2.position.length);
                position.set(mesh1.position);
                position.set(mesh2.position, mesh1.position.length);
                let ret = { position, tetraCount: position.length << 4 };
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
            tetra.concat = concat;
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
                let ret = { position, tetraCount: length << 4 };
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
            tetra.concatarr = concatarr;
            function clone(mesh) {
                let ret = {
                    position: mesh.position.slice(0),
                    tetraCount: mesh.tetraCount
                };
                if (mesh.uvw)
                    ret.uvw = mesh.uvw.slice(0);
                if (mesh.normal)
                    ret.normal = mesh.normal.slice(0);
                return ret;
            }
            tetra.clone = clone;
            function tesseract() {
                let yface = applyObj4(clone(tetra.cube), new tesserxel.math.Obj4(tesserxel.math.Vec4.y));
                let meshes = [
                    new tesserxel.math.Bivec(tesserxel.math._90).exp(),
                    new tesserxel.math.Bivec(-tesserxel.math._90).exp(),
                    new tesserxel.math.Bivec(0, 0, 0, tesserxel.math._90).exp(),
                    new tesserxel.math.Bivec(0, 0, 0, -tesserxel.math._90).exp(),
                    new tesserxel.math.Bivec(0, 0, 0, 0, tesserxel.math._90).exp(),
                    new tesserxel.math.Bivec(0, 0, 0, 0, -tesserxel.math._90).exp(),
                    new tesserxel.math.Bivec(tesserxel.math._180).exp(),
                ].map(r => applyObj4(clone(yface), new tesserxel.math.Obj4(new tesserxel.math.Vec4(), r)));
                meshes.push(yface);
                let m = concatarr(meshes);
                for (let i = 0; i < 8; i++) {
                    for (let j = 0; j < 20; j++) {
                        m.uvw[i * 80 + j * 4 + 3] = i;
                    }
                }
                return m;
            }
            tetra.tesseract = tesseract;
            tetra.hexadecachoron = {
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
                tetraCount: 16
            };
            function glome(radius, xySegment, zwSegment, lattitudeSegment) {
                if (xySegment < 3)
                    xySegment = 3;
                if (zwSegment < 3)
                    zwSegment = 3;
                if (lattitudeSegment < 1)
                    lattitudeSegment = 1;
                return parametricSurface((uvw, pos, norm) => {
                    let u = uvw.x * tesserxel.math._360;
                    let v = uvw.y * tesserxel.math._360;
                    let w = uvw.z * tesserxel.math._90;
                    let cos = Math.cos(w) * radius;
                    let sin = Math.sin(w) * radius;
                    pos.set(-Math.cos(u) * cos, Math.sin(u) * cos, Math.cos(v) * sin, Math.sin(v) * sin);
                    norm.copy(pos);
                }, xySegment, zwSegment, lattitudeSegment);
            }
            tetra.glome = glome;
            function tiger(xyRadius, xySegment, zwRadius, zwSegment, secondaryRadius, secondarySegment) {
                if (xySegment < 3)
                    xySegment = 3;
                if (zwSegment < 3)
                    zwSegment = 3;
                if (secondarySegment < 3)
                    secondarySegment = 3;
                return parametricSurface((uvw, pos, norm) => {
                    let u = uvw.x * tesserxel.math._360;
                    let v = uvw.y * tesserxel.math._360;
                    let w = uvw.z * tesserxel.math._360;
                    let su = Math.sin(w);
                    let cu = Math.cos(w);
                    pos.set((su * secondaryRadius + xyRadius) * Math.sin(u), (su * secondaryRadius + xyRadius) * Math.cos(u), (cu * secondaryRadius + zwRadius) * Math.sin(v), (cu * secondaryRadius + zwRadius) * Math.cos(v));
                    norm.set(su * Math.sin(u), su * Math.cos(u), cu * Math.sin(v), cu * Math.cos(v));
                }, xySegment, zwSegment, secondarySegment);
            }
            tetra.tiger = tiger;
            function parametricSurface(fn, uSegment, vSegment, wSegment) {
                if (uSegment < 1)
                    uSegment = 1;
                if (vSegment < 1)
                    vSegment = 1;
                if (wSegment < 1)
                    wSegment = 1;
                let tetraCount = uSegment * vSegment * wSegment * 5;
                let arraySize = tetraCount << 4;
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
                let inputUVW = new tesserxel.math.Vec3;
                let idxbuffer = new Uint32Array(8);
                let outputVertex = new tesserxel.math.Vec4;
                let outputNormal = new tesserxel.math.Vec4;
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
                return { position, normal, uvw, tetraCount };
            }
            tetra.parametricSurface = parametricSurface;
            function convexhull(points) {
                // todo: fix a random dead loop bug
                if (points.length < 5)
                    return;
                points.sort((a, b) => Math.random() - 0.5);
                let _vec41 = new tesserxel.math.Vec4();
                let _vec42 = new tesserxel.math.Vec4();
                let _vec43 = new tesserxel.math.Vec4();
                let _vec44 = new tesserxel.math.Vec4();
                // let _vec45 = new math.Vec4();
                let _mat4 = new tesserxel.math.Mat4();
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
                let tetraCount = 5; // indices.length === tetraCount * 4 always is true
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
                    for (let cell = 0; cell < tetraCount; cell++) {
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
                    tetraCount = indices.length >> 2;
                }
                let position = new Float32Array(tetraCount << 4);
                let count = 0;
                for (let p = 0; p < tetraCount; p++) {
                    points[indices[(p << 2)]].writeBuffer(position, count);
                    count += 4;
                    points[indices[(p << 2) + 1]].writeBuffer(position, count);
                    count += 4;
                    points[indices[(p << 2) + 2]].writeBuffer(position, count);
                    count += 4;
                    points[indices[(p << 2) + 3]].writeBuffer(position, count);
                    count += 4;
                }
                return {
                    position,
                    tetraCount
                };
            }
            tetra.convexhull = convexhull;
            function duocone(xyRadius, xySegment, zwRadius, zwSegment) {
                let ps = [];
                for (let i = 0; i < xySegment; i++) {
                    let ii = i * tesserxel.math._360 / xySegment;
                    ps.push(new tesserxel.math.Vec4(xyRadius * Math.cos(ii), xyRadius * Math.sin(ii)));
                }
                for (let i = 0; i < zwSegment; i++) {
                    let ii = i * tesserxel.math._360 / zwSegment;
                    ps.push(new tesserxel.math.Vec4(0, 0, zwRadius * Math.cos(ii), zwRadius * Math.sin(ii)));
                }
                return tesserxel.mesh.tetra.convexhull(ps);
            }
            tetra.duocone = duocone;
            function duocylinder(xyRadius, xySegment, zwRadius, zwSegment) {
                let ps = [];
                for (let i = 0; i < xySegment; i++) {
                    let ii = i * tesserxel.math._360 / xySegment;
                    for (let j = 0; j < zwSegment; j++) {
                        let jj = j * tesserxel.math._360 / zwSegment;
                        ps.push(new tesserxel.math.Vec4(xyRadius * Math.cos(ii), xyRadius * Math.sin(ii), zwRadius * Math.cos(jj), zwRadius * Math.sin(jj)));
                    }
                }
                return tesserxel.mesh.tetra.convexhull(ps);
            }
            tetra.duocylinder = duocylinder;
            function loft(sp, section, step) {
                let { points, rotors, curveLength } = sp.generate(step);
                let quadcount = section.quad.position.length >> 4;
                let tetraCount = quadcount * (points.length - 1) * 5;
                let arraySize = tetraCount << 4;
                let pslen = quadcount * points.length << 4;
                let positions = new Float32Array(pslen);
                let uvws = new Float32Array(pslen);
                let normals = new Float32Array(pslen);
                let position = new Float32Array(arraySize);
                let uvw = new Float32Array(arraySize);
                let normal = new Float32Array(arraySize);
                let _vec4 = new tesserxel.math.Vec4(); // cache
                let offset = 0;
                let idxPtr = 0;
                let pos = section.quad.position;
                let norm = section.quad.normal;
                let uv = section.quad.uv;
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
                return { position, uvw, normal, tetraCount };
            }
            tetra.loft = loft;
        })(tetra = mesh_1.tetra || (mesh_1.tetra = {}));
    })(mesh = tesserxel.mesh || (tesserxel.mesh = {}));
})(tesserxel || (tesserxel = {}));
var tesserxel;
(function (tesserxel) {
    let physics;
    (function (physics) {
        class Engine {
            forceAccumulator;
            constructor(forceAccumulator) {
                this.forceAccumulator = forceAccumulator ?? new physics.force_accumulator.Euler2();
            }
            runCollisionDetector() {
                // this.collisions = [];
                // for (let i = 0; i < this.objects.length; i++) {
                //     for (let j = i + 1; j < this.objects.length; j++) {
                //         let r = this.objects[i].geometry.intersectGeometry(this.objects[j].geometry);
                //         if (r) this.collisions.push(r);
                //     }
                // }
            }
            runCollisionSolver() {
                // todo
            }
            update(world, dt) {
                this.forceAccumulator.run(this, world, dt);
                this.runCollisionDetector();
                this.runCollisionSolver();
                world.frameCount++;
            }
            getObjectsAccelerations(world) {
                // clear
                for (let o of world.objects) {
                    o.force.set();
                    if (o.invMass)
                        o.acceleration.copy(world.gravity);
                    o.torque.set();
                }
                // apply force
                for (let f of world.forces) {
                    f.apply(world.time);
                }
                for (let o of world.objects) {
                    if (o.force.norm1() > 0) {
                        o.acceleration.addmulfs(o.force, o.invMass);
                    }
                    if (o.torque.norm1() > 0) {
                        // todo
                        // o.angularAcceleration.addmulfs(o.torque, o.invMass);
                    }
                }
            }
        }
        physics.Engine = Engine;
        class World {
            gravity = new tesserxel.math.Vec4(0, -9.8);
            objects = [];
            forces = [];
            collisions = [];
            time = 0;
            frameCount = 0;
            addObject(o) {
                this.objects.push(o);
            }
            addForce(f) {
                this.forces.push(f);
            }
        }
        physics.World = World;
        class Object {
            geometry;
            invMass;
            // inertia is a 6x6 Matrix for angularVelocity -> angularMomentum
            invInertia;
            velocity = new tesserxel.math.Vec4();
            angularVelocity = new tesserxel.math.Bivec();
            /** sleeping objects are still.
             *  it only do collision test will active objects
             *  */
            sleep = false;
            // accumulators:
            force = new tesserxel.math.Vec4();
            torque = new tesserxel.math.Bivec();
            acceleration = new tesserxel.math.Vec4();
            angularAcceleration = new tesserxel.math.Bivec();
            getlinearVelocity(position) {
                if (!this.geometry.position)
                    return new tesserxel.math.Vec4();
                let relPosition = position.sub(this.geometry.position);
                return relPosition.dotbset(this.angularVelocity, relPosition).add(this.velocity);
            }
            constructor(geometry, mass) {
                this.geometry = geometry;
                this.invMass = mass > 0 ? 1 / mass : null;
            }
        }
        physics.Object = Object;
    })(physics = tesserxel.physics || (tesserxel.physics = {}));
})(tesserxel || (tesserxel = {}));
var tesserxel;
(function (tesserxel) {
    let physics;
    (function (physics) {
        let force_accumulator;
        (function (force_accumulator) {
            class Euler2 {
                _bivec = new tesserxel.math.Bivec;
                _rotor = new tesserxel.math.Rotor;
                run(engine, world, dt) {
                    engine.getObjectsAccelerations(world);
                    world.time += dt;
                    let dtsqrhalf = dt * dt / 2;
                    for (let o of world.objects) {
                        if (o.sleep || !o.geometry.position)
                            continue;
                        // x1 = x0 + v0 t + a0 t^2/2
                        // v1 = v0 + a0 t/2
                        o.geometry.position.addmulfs(o.velocity, dt).addmulfs(o.acceleration, dtsqrhalf);
                        o.velocity.addmulfs(o.acceleration, dt);
                        if (!o.geometry.rotation)
                            continue;
                        o.geometry.rotation.mulsl(this._rotor.expset(this._bivec.copy(o.angularVelocity).mulfs(dt).addmulfs(o.angularAcceleration, dtsqrhalf)));
                        o.angularVelocity.addmulfs(o.angularAcceleration, dt);
                    }
                }
            }
            force_accumulator.Euler2 = Euler2;
            class Predict3 {
                _bivec1 = new tesserxel.math.Bivec;
                _bivec2 = new tesserxel.math.Bivec;
                _rotor = new tesserxel.math.Rotor;
                _vec = new tesserxel.math.Vec4;
                run(engine, world, dt) {
                    let prevStates = world.objects.map(obj => ({
                        acceleration: obj.acceleration.clone(),
                        angularAcceleration: obj.angularAcceleration.clone(),
                    }));
                    engine.getObjectsAccelerations(world);
                    world.time += dt;
                    let dthalf = dt * 0.5;
                    let dtsqrdiv6 = dt * dthalf / 3;
                    for (let idx = 0, len = world.objects.length; idx < len; idx++) {
                        let o = world.objects[idx];
                        let prevO = prevStates[idx];
                        if (o.sleep || !o.geometry.position)
                            continue;
                        // if we know a1, then:
                        // x1 = x0 + v0 t + (2/3 a0 + 1/3 a1) t^2/2
                        // v1 = v0 + (a0 + a1) t/2
                        // predict a1 = 2a0 - a{-1}, got:
                        // x1 = x0 + v0 t + (4/3 a0 - 1/3 a{-1}) t^2/2
                        // v1 = v0 + (3/2 a0 - 1/2 a{-1}) t
                        o.geometry.position.addmulfs(o.velocity, dt).addmulfs(this._vec.copy(prevO.acceleration).addmulfs(o.acceleration, -4), -dtsqrdiv6);
                        o.velocity.addmulfs(prevO.acceleration.addmulfs(o.acceleration, -3), -dthalf);
                        if (!o.geometry.rotation)
                            continue;
                        o.geometry.rotation.mulsl(this._rotor.expset(this._bivec1.copy(o.angularVelocity).mulfs(dt).addmulfs(this._bivec2.copy(prevO.angularAcceleration).addmulfs(o.angularAcceleration, -4), -dtsqrdiv6)));
                        o.angularVelocity.addmulfs(prevO.angularAcceleration.addmulfs(o.angularAcceleration, -3), -dthalf);
                    }
                }
            }
            force_accumulator.Predict3 = Predict3;
            class RK4 {
                _bivec1 = new tesserxel.math.Bivec;
                _rotor = new tesserxel.math.Rotor;
                run(engine, world, dt) {
                    let dthalf = dt * 0.5;
                    let dtdiv6 = dt / 6;
                    function storeState(states) {
                        engine.getObjectsAccelerations(world);
                        states.push(world.objects.map(obj => ({
                            position: obj.geometry.position?.clone(),
                            rotation: obj.geometry.rotation?.clone(),
                            velocity: obj.velocity.clone(),
                            angularVelocity: obj.angularVelocity.clone(),
                            acceleration: obj.acceleration.clone(),
                            angularAcceleration: obj.angularAcceleration.clone(),
                        })));
                    }
                    function loadState(states, index) {
                        let state = states[index];
                        for (let idx = 0, len = world.objects.length; idx < len; idx++) {
                            let o = world.objects[idx];
                            let s = state[idx];
                            o.geometry.position?.copy(s?.position);
                            o.geometry.rotation?.copy(s?.rotation);
                            o.velocity.copy(s.velocity);
                            o.angularVelocity.copy(s.angularVelocity);
                            o.acceleration.copy(s.acceleration);
                            o.angularAcceleration.copy(s.angularAcceleration);
                        }
                    }
                    let states = [];
                    storeState(states); // 0: k1 = f(yn, tn)
                    for (let o of world.objects) {
                        if (o.sleep || !o.geometry.position)
                            continue;
                        o.geometry.position.addmulfs(o.velocity, dthalf);
                        o.velocity.addmulfs(o.acceleration, dthalf);
                        if (!o.geometry.rotation)
                            continue;
                        o.geometry.rotation.mulsl(this._rotor.expset(this._bivec1.copy(o.angularVelocity).mulfs(dthalf)));
                        o.angularVelocity.addmulfs(o.angularAcceleration, dthalf);
                    }
                    world.time += dthalf;
                    storeState(states); // 1: k2 = f(yn + h/2 k1, tn + h/2)
                    loadState(states, 0);
                    let state = states[1];
                    for (let idx = 0, len = world.objects.length; idx < len; idx++) {
                        let o = world.objects[idx];
                        if (o.sleep || !o.geometry.position)
                            continue;
                        let s = state[idx];
                        o.geometry.position.addmulfs(s.velocity, dthalf);
                        o.velocity.addmulfs(s.acceleration, dthalf);
                        if (!o.geometry.rotation)
                            continue;
                        o.geometry.rotation.mulsl(this._rotor.expset(this._bivec1.copy(s.angularVelocity).mulfs(dthalf)));
                        o.angularVelocity.addmulfs(s.angularAcceleration, dthalf);
                    }
                    storeState(states); // 2: k3 = f(yn + h/2 k2, tn + h/2)
                    loadState(states, 0);
                    state = states[2];
                    for (let idx = 0, len = world.objects.length; idx < len; idx++) {
                        let o = world.objects[idx];
                        if (o.sleep || !o.geometry.position)
                            continue;
                        let s = state[idx];
                        o.geometry.position.addmulfs(s.velocity, dt);
                        o.velocity.addmulfs(s.acceleration, dt);
                        if (!o.geometry.rotation)
                            continue;
                        o.geometry.rotation.mulsl(this._rotor.expset(this._bivec1.copy(s.angularVelocity).mulfs(dt)));
                        o.angularVelocity.addmulfs(s.angularAcceleration, dt);
                    }
                    world.time += dthalf;
                    storeState(states); // 3: k4 = f(yn + h k3, tn + h)
                    loadState(states, 0);
                    for (let idx = 0, len = world.objects.length; idx < len; idx++) {
                        let o = world.objects[idx];
                        if (o.sleep || !o.geometry.position)
                            continue;
                        let k1 = states[0][idx];
                        let k2 = states[1][idx];
                        let k3 = states[2][idx];
                        let k4 = states[3][idx];
                        o.geometry.position.addmulfs(k1.velocity.adds(k4.velocity).addmulfs(k2.velocity.adds(k3.velocity), 2), dtdiv6);
                        o.velocity.addmulfs(k1.acceleration.adds(k4.acceleration).addmulfs(k2.acceleration.adds(k3.acceleration), 2), dtdiv6);
                        if (!o.geometry.rotation)
                            continue;
                        o.geometry.rotation.mulsl(this._rotor.expset(k1.angularVelocity.adds(k4.angularVelocity).addmulfs(k2.angularVelocity.adds(k3.angularVelocity), 2).mulfs(dtdiv6)));
                        o.angularVelocity.addmulfs(k1.angularAcceleration.adds(k4.angularAcceleration).addmulfs(k2.angularAcceleration.adds(k3.angularAcceleration), 2), dtdiv6);
                    }
                }
            }
            force_accumulator.RK4 = RK4;
        })(force_accumulator = physics.force_accumulator || (physics.force_accumulator = {}));
        let force;
        (function (force) {
            /** apply a spring force between object a and b
             *  pointA and pointB are in local coordinates,
             *  refering connect point of spring's two ends.
             *  b can be null for attaching spring to a fixed point in the world.
             *  f = k dx - damp * dv */
            class Spring {
                a;
                pointA;
                b;
                pointB;
                k;
                damp;
                length;
                _vec4f = new tesserxel.math.Vec4();
                _vec4a = new tesserxel.math.Vec4();
                _vec4b = new tesserxel.math.Vec4();
                _bivec = new tesserxel.math.Bivec();
                constructor(a, b, pointA, pointB, k, damp = 0, length = 0) {
                    this.a = a;
                    this.b = b;
                    this.k = k;
                    this.damp = damp;
                    this.pointA = pointA;
                    this.pointB = pointB;
                    this.length = length;
                }
                apply(time) {
                    const pa = this.a.geometry.position;
                    const pb = this.b?.geometry?.position;
                    this._vec4a.copy(this.pointA).rotates(this.a.geometry.rotation).adds(pa);
                    this._vec4b.copy(this.pointB);
                    if (this.b)
                        this._vec4b.rotates(this.b.geometry.rotation).adds(pb);
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
            force.Spring = Spring;
        })(force = physics.force || (physics.force = {}));
    })(physics = tesserxel.physics || (tesserxel.physics = {}));
})(tesserxel || (tesserxel = {}));
var tesserxel;
(function (tesserxel) {
    let physics;
    (function (physics) {
        class Glome {
            radius = 1;
            position = new tesserxel.math.Vec4;
            rotation = new tesserxel.math.Rotor;
            type;
            constructor(radius) {
                this.radius = radius;
            }
            intersectGeometry(g) {
                switch (g.type) {
                    case "glome": return physics.intersetGlomeGlome(this, g);
                    case "plane": return physics.intersetGlomePlane(this, g);
                }
                return null;
            }
        }
        physics.Glome = Glome;
        /** equation: dot(normal,positon) == offset
         *  => when offset > 0, plane is shifted to normal direction
         *  from origin by distance = offset
         */
        class Plane {
            normal;
            offset;
            type;
            intersectGeometry(g) {
                switch (g.type) {
                    case "glome": return physics.inverseIntersectOrder(physics.intersetGlomePlane(g, this));
                }
                return null;
            }
        }
        physics.Plane = Plane;
    })(physics = tesserxel.physics || (tesserxel.physics = {}));
})(tesserxel || (tesserxel = {}));
var tesserxel;
(function (tesserxel) {
    let physics;
    (function (physics) {
        let _vec4 = new tesserxel.math.Vec4; // cache
        function intersetGlomeGlome(a, b) {
            _vec4.subset(b.position, a.position);
            let d = _vec4.norm();
            let depth = a.radius + b.radius - d;
            if (depth < 0)
                return null;
            // todo: check whether clone can be removed
            let normal = _vec4.divfs(d).clone();
            let point = _vec4.mulfs((a.radius - b.radius + d) * 0.5).clone();
            return { point, normal, depth, a, b };
        }
        physics.intersetGlomeGlome = intersetGlomeGlome;
        function inverseIntersectOrder(r) {
            if (!r)
                return null;
            let temp = r.a;
            r.a = r.b;
            r.b = temp;
            r.normal.negs();
            return r;
        }
        physics.inverseIntersectOrder = inverseIntersectOrder;
        function intersetGlomePlane(a, b) {
            let depth = a.radius - (a.position.dot(b.normal) - b.offset);
            if (depth < 0)
                return null;
            let point = a.position.addmulfs(b.normal, depth * 0.5 - a.radius).clone();
            return { point, normal: b.normal.neg(), depth, a, b };
        }
        physics.intersetGlomePlane = intersetGlomePlane;
    })(physics = tesserxel.physics || (tesserxel.physics = {}));
})(tesserxel || (tesserxel = {}));
var tesserxel;
(function (tesserxel) {
    let controller;
    (function (controller) {
        let KeyState;
        (function (KeyState) {
            KeyState[KeyState["NONE"] = 0] = "NONE";
            KeyState[KeyState["UP"] = 1] = "UP";
            KeyState[KeyState["HOLD"] = 2] = "HOLD";
            KeyState[KeyState["DOWN"] = 3] = "DOWN";
        })(KeyState = controller.KeyState || (controller.KeyState = {}));
        class ControllerRegistry {
            dom;
            ctrls;
            requsetPointerLock;
            states = {
                currentKeys: new Map(),
                currentBtn: -1,
                updateCount: 0,
                moveX: 0,
                moveY: 0,
                wheelX: 0,
                wheelY: 0,
            };
            constructor(dom, ctrls, config) {
                this.dom = dom;
                dom.tabIndex = 1;
                this.ctrls = ctrls;
                this.requsetPointerLock = config.requsetPointerLock;
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
                    return document.pointerLockElement === this.dom;
                };
                this.states.exitPointerLock = () => {
                    if (document.pointerLockElement === this.dom)
                        document.exitPointerLock();
                };
                dom.addEventListener("mousedown", (ev) => {
                    if (this.requsetPointerLock && document.pointerLockElement !== dom) {
                        dom.requestPointerLock();
                    }
                    else {
                        dom.focus();
                    }
                    this.states.currentBtn = ev.button;
                    this.states.moveX = 0;
                    this.states.moveY = 0;
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
                this.states.requsetPointerLock = this.requsetPointerLock;
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
                this.states.moveX = 0;
                this.states.moveY = 0;
                this.states.wheelX = 0;
                this.states.wheelY = 0;
                this.states.updateCount++;
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
        controller.ControllerRegistry = ControllerRegistry;
        class TrackBallController {
            enabled = true;
            object = new tesserxel.math.Obj4(tesserxel.math.Vec4.w.neg());
            mouseSpeed = 0.01;
            wheelSpeed = 0.0001;
            damp = 0.1;
            /** how many update cycles (2^n) to normalise rotor to avoid accuracy problem */
            normalisePeriodBit;
            keyConfig = {
                disable: "AltLeft",
                enable: "",
            };
            _bivec = new tesserxel.math.Bivec();
            normalisePeriodMask = 15;
            constructor() { }
            update(state) {
                let disabled = state.queryDisabled(this.keyConfig);
                let dampFactor = Math.exp(-this.damp * Math.min(200.0, state.mspf));
                if (!disabled) {
                    let dx = state.moveX * this.mouseSpeed;
                    let dy = -state.moveY * this.mouseSpeed;
                    let wy = state.wheelY * this.wheelSpeed;
                    switch (state.currentBtn) {
                        case 0:
                            this._bivec.set(0, dx, 0, dy);
                            break;
                        case 1:
                            this._bivec.set(dx, 0, 0, 0, 0, dy);
                            break;
                        case 2:
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
        controller.TrackBallController = TrackBallController;
        class FreeFlyController {
            enabled = true;
            object = new tesserxel.math.Obj4();
            mouseSpeed = 0.01;
            wheelSpeed = 0.0005;
            keyMoveSpeed = 0.001;
            keyRotateSpeed = 0.001;
            damp = 0.01;
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
            _bivec = new tesserxel.math.Bivec();
            _bivecKey = new tesserxel.math.Bivec();
            _moveVec = new tesserxel.math.Vec4();
            _vec = new tesserxel.math.Vec4();
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
                    if ((state.requsetPointerLock && state.isPointerLocked()) || (state.currentBtn = 0 && !state.requsetPointerLock)) {
                        let dx = state.moveX * this.mouseSpeed;
                        let dy = -state.moveY * this.mouseSpeed;
                        this._bivec.xw += dx;
                        this._bivec.yw += dy;
                    }
                    if ((state.requsetPointerLock && state.isPointerLocked()) || (!state.requsetPointerLock)) {
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
        controller.FreeFlyController = FreeFlyController;
        class KeepUpController {
            enabled = true;
            keepUp = false;
            object = new tesserxel.math.Obj4();
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
            _bivec = new tesserxel.math.Bivec();
            _bivec2 = new tesserxel.math.Bivec();
            _bivecKey = new tesserxel.math.Bivec();
            _moveVec = new tesserxel.math.Vec4();
            _vec = new tesserxel.math.Vec4();
            normalisePeriodMask = 15;
            horizontalRotor = new tesserxel.math.Rotor();
            verticalRotor = new tesserxel.math.Rotor();
            constructor() { }
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
                    if ((state.requsetPointerLock && state.isPointerLocked()) || (state.currentBtn === 0 && !state.requsetPointerLock)) {
                        let dx = state.moveX * this.mouseSpeed;
                        let dy = state.moveY * this.mouseSpeed;
                        this._bivec.xw += dx;
                        this._bivec.zw += dy;
                    }
                    if ((state.requsetPointerLock && state.isPointerLocked()) || (!state.requsetPointerLock)) {
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
        controller.KeepUpController = KeepUpController;
        let sliceconfig;
        (function (sliceconfig) {
            sliceconfig.size = 0.2;
            function singlezslice1eye(aspect) {
                return {
                    layers: 0,
                    opacity: 1.0,
                    sections: [{
                            slicePos: 0,
                            facing: tesserxel.renderer.SliceFacing.POSZ,
                            viewport: { x: 0, y: 0, width: 1 / aspect, height: 1.0 }
                        }]
                };
            }
            sliceconfig.singlezslice1eye = singlezslice1eye;
            function singlezslice2eye(aspect) {
                return {
                    layers: 0,
                    opacity: 1.0,
                    sectionEyeOffset: 0.1,
                    sections: [{
                            slicePos: 0,
                            facing: tesserxel.renderer.SliceFacing.POSZ,
                            eyeOffset: tesserxel.renderer.EyeOffset.LeftEye,
                            viewport: { x: -0.5, y: 0, width: 0.5 / aspect, height: 0.8 }
                        }, {
                            slicePos: 0,
                            facing: tesserxel.renderer.SliceFacing.POSZ,
                            eyeOffset: tesserxel.renderer.EyeOffset.RightEye,
                            viewport: { x: 0.5, y: 0, width: 0.5 / aspect, height: 0.8 }
                        }]
                };
            }
            sliceconfig.singlezslice2eye = singlezslice2eye;
            function singleyslice1eye(aspect) {
                return {
                    layers: 0,
                    opacity: 1.0,
                    sections: [{
                            slicePos: 0,
                            facing: tesserxel.renderer.SliceFacing.NEGY,
                            viewport: { x: 0, y: 0, width: 1 / aspect, height: 1.0 }
                        }]
                };
            }
            sliceconfig.singleyslice1eye = singleyslice1eye;
            function singleyslice2eye(aspect) {
                return {
                    layers: 0,
                    opacity: 1.0,
                    sectionEyeOffset: 0.1,
                    sections: [{
                            slicePos: 0,
                            facing: tesserxel.renderer.SliceFacing.NEGY,
                            eyeOffset: tesserxel.renderer.EyeOffset.LeftEye,
                            viewport: { x: -0.5, y: 0, width: 0.5 / aspect, height: 0.8 }
                        }, {
                            slicePos: 0,
                            facing: tesserxel.renderer.SliceFacing.NEGY,
                            eyeOffset: tesserxel.renderer.EyeOffset.RightEye,
                            viewport: { x: 0.5, y: 0, width: 0.5 / aspect, height: 0.8 }
                        }]
                };
            }
            sliceconfig.singleyslice2eye = singleyslice2eye;
            function zslices1eye(step, maxpos, aspect) {
                let arr = [[0, 0]];
                let j = 1;
                for (let i = step; i <= maxpos; i += step, j++) {
                    arr.push([i, j]);
                    arr.push([-i, -j]);
                }
                let half = 2 / arr.length;
                let size = 1 / (aspect * arr.length);
                return {
                    layers: 64,
                    opacity: 1.0,
                    sections: arr.map(pos => ({
                        slicePos: pos[0],
                        facing: tesserxel.renderer.SliceFacing.POSZ,
                        viewport: { x: pos[1] * half, y: size - 1, width: size, height: size }
                    }))
                };
            }
            sliceconfig.zslices1eye = zslices1eye;
            function zslices2eye(step, maxpos, aspect) {
                let arr = [[0, 0]];
                let j = 1;
                for (let i = step; i <= maxpos; i += step, j++) {
                    arr.push([i, j]);
                    arr.push([-i, -j]);
                }
                arr.sort((a, b) => a[0] - b[0]);
                let half = 1 / arr.length;
                let size = 0.5 / (aspect * arr.length);
                return {
                    layers: 64,
                    sectionEyeOffset: 0.1,
                    retinaEyeOffset: 0.1,
                    opacity: 1.0,
                    sections: arr.map(pos => ({
                        slicePos: pos[0],
                        facing: tesserxel.renderer.SliceFacing.POSZ,
                        eyeOffset: tesserxel.renderer.EyeOffset.LeftEye,
                        viewport: { x: (pos[1] * half) - 0.5, y: size - 1, width: size, height: size }
                    })).concat(arr.map(pos => ({
                        slicePos: pos[0],
                        facing: tesserxel.renderer.SliceFacing.POSZ,
                        eyeOffset: tesserxel.renderer.EyeOffset.RightEye,
                        viewport: { x: (pos[1] * half) + 0.5, y: size - 1, width: size, height: size }
                    })))
                };
            }
            sliceconfig.zslices2eye = zslices2eye;
            function yslices1eye(step, maxpos, aspect) {
                let arr = [[0, 0]];
                let j = 1;
                for (let i = step; i <= maxpos; i += step, j++) {
                    arr.push([i, j]);
                    arr.push([-i, -j]);
                }
                let half = 2 / arr.length;
                let size = 1 / (aspect * arr.length);
                return {
                    layers: 64,
                    opacity: 1.0,
                    sections: arr.map(pos => ({
                        slicePos: pos[0],
                        facing: tesserxel.renderer.SliceFacing.NEGY,
                        viewport: { x: pos[1] * half, y: size - 1, width: size, height: size }
                    }))
                };
            }
            sliceconfig.yslices1eye = yslices1eye;
            function yslices2eye(step, maxpos, aspect) {
                let arr = [[0, 0]];
                let j = 1;
                for (let i = step; i <= maxpos; i += step, j++) {
                    arr.push([i, j]);
                    arr.push([-i, -j]);
                }
                arr.sort((a, b) => a[0] - b[0]);
                let half = 1 / arr.length;
                let size = 0.5 / (aspect * arr.length);
                return {
                    layers: 64,
                    sectionEyeOffset: 0.1,
                    retinaEyeOffset: 0.1,
                    opacity: 1.0,
                    sections: arr.map(pos => ({
                        slicePos: pos[0],
                        facing: tesserxel.renderer.SliceFacing.NEGY,
                        eyeOffset: tesserxel.renderer.EyeOffset.LeftEye,
                        viewport: { x: (pos[1] * half) - 0.5, y: size - 1, width: size, height: size }
                    })).concat(arr.map(pos => ({
                        slicePos: pos[0],
                        facing: tesserxel.renderer.SliceFacing.NEGY,
                        eyeOffset: tesserxel.renderer.EyeOffset.RightEye,
                        viewport: { x: (pos[1] * half) + 0.5, y: size - 1, width: size, height: size }
                    })))
                };
            }
            sliceconfig.yslices2eye = yslices2eye;
            function default2eye(size, aspect) {
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
                return {
                    layers: 64,
                    sectionEyeOffset: 0.1,
                    retinaEyeOffset: 0.1,
                    opacity: 1.0,
                    sections: [
                        {
                            facing: tesserxel.renderer.SliceFacing.NEGX,
                            eyeOffset: tesserxel.renderer.EyeOffset.LeftEye,
                            viewport: { x: -size_aspect, y: size - 1, width: wsize, height: size }
                        },
                        {
                            facing: tesserxel.renderer.SliceFacing.NEGX,
                            eyeOffset: tesserxel.renderer.EyeOffset.RightEye,
                            viewport: { x: 1 - size_aspect, y: size - 1, width: wsize, height: size }
                        },
                        {
                            facing: tesserxel.renderer.SliceFacing.NEGY,
                            eyeOffset: tesserxel.renderer.EyeOffset.LeftEye,
                            viewport: { x: -size_aspect, y: 1 - size, width: wsize, height: size }
                        },
                        {
                            facing: tesserxel.renderer.SliceFacing.NEGY,
                            eyeOffset: tesserxel.renderer.EyeOffset.RightEye,
                            viewport: { x: 1 - size_aspect, y: 1 - size, width: wsize, height: size }
                        },
                        {
                            facing: tesserxel.renderer.SliceFacing.POSZ,
                            eyeOffset: tesserxel.renderer.EyeOffset.LeftEye,
                            viewport: { x: size_aspect - 1, y: size - 1, width: wsize, height: size }
                        },
                        {
                            facing: tesserxel.renderer.SliceFacing.POSZ,
                            eyeOffset: tesserxel.renderer.EyeOffset.RightEye,
                            viewport: { x: size_aspect, y: size - 1, width: wsize, height: size }
                        },
                    ]
                };
            }
            sliceconfig.default2eye = default2eye;
            ;
            function default1eye(size, aspect) {
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
                return {
                    layers: 64,
                    opacity: 1.0,
                    sections: [
                        {
                            facing: tesserxel.renderer.SliceFacing.NEGX,
                            viewport: { x: 1 - size_aspect, y: size - 1, width: wsize, height: size }
                        },
                        {
                            facing: tesserxel.renderer.SliceFacing.NEGY,
                            viewport: { x: 1 - size_aspect, y: 1 - size, width: wsize, height: size }
                        },
                        {
                            facing: tesserxel.renderer.SliceFacing.POSZ,
                            viewport: { x: size_aspect - 1, y: size - 1, width: wsize, height: size }
                        }
                    ]
                };
            }
            sliceconfig.default1eye = default1eye;
        })(sliceconfig = controller.sliceconfig || (controller.sliceconfig = {}));
        class RetinaController {
            enabled = true;
            keepUp = false;
            renderer;
            mouseSpeed = 0.01;
            wheelSpeed = 0.0001;
            keyMoveSpeed = 0.01;
            keyRotateSpeed = 0.01;
            opacityKeySpeed = 0.01;
            damp = 0.1;
            mouseButton = 0;
            sectionPresets;
            sliceConfig;
            currentSectionConfig = "retina+sections";
            rembemerLastLayers;
            needResize = true;
            keyConfig = {
                enable: "AltLeft",
                disable: "",
                toggle3D: ".KeyZ",
                addOpacity: "KeyQ",
                subOpacity: "KeyA",
                addLayer: "KeyW",
                subLayer: "KeyS",
                rotateLeft: "ArrowLeft",
                rotateRight: "ArrowRight",
                rotateUp: "ArrowUp",
                rotateDown: "ArrowDown",
                refaceFront: ".KeyR",
                sectionConfigs: {
                    "retina+sections": ".Digit1",
                    "retina": ".Digit2",
                    "sections": ".Digit3",
                    "retina+zslices": ".Digit4",
                    "retina+yslices": ".Digit5",
                    "zsection": ".Digit6",
                    "ysection": ".Digit7"
                },
            };
            constructor(r) {
                this.renderer = r;
                this.sliceConfig = r.getSliceConfig() ?? sliceconfig.default2eye(0.2, 1.0);
                this.sectionPresets = (aspect) => ({
                    "retina+sections": {
                        eye1: sliceconfig.default1eye(0.2, aspect).sections,
                        eye2: sliceconfig.default2eye(0.2, aspect).sections,
                        retina: true
                    },
                    "retina": {
                        eye1: [],
                        eye2: [],
                        retina: true
                    },
                    "sections": {
                        eye1: sliceconfig.default1eye(0.5, aspect).sections,
                        eye2: sliceconfig.default2eye(0.5, aspect).sections,
                        retina: false
                    },
                    "retina+zslices": {
                        eye1: sliceconfig.zslices1eye(0.15, 0.6, aspect).sections,
                        eye2: sliceconfig.zslices2eye(0.3, 0.6, aspect).sections,
                        retina: true
                    },
                    "retina+yslices": {
                        eye1: sliceconfig.yslices1eye(0.15, 0.6, aspect).sections,
                        eye2: sliceconfig.yslices2eye(0.3, 0.6, aspect).sections,
                        retina: true
                    },
                    "zsection": {
                        eye1: sliceconfig.singlezslice1eye(aspect).sections,
                        eye2: sliceconfig.singlezslice2eye(aspect).sections,
                        retina: false
                    },
                    "ysection": {
                        eye1: sliceconfig.singleyslice1eye(aspect).sections,
                        eye2: sliceconfig.singleyslice2eye(aspect).sections,
                        retina: false
                    },
                });
            }
            _vec2damp = new tesserxel.math.Vec2();
            _vec2euler = new tesserxel.math.Vec2();
            _vec3 = new tesserxel.math.Vec3();
            _q1 = new tesserxel.math.Quaternion();
            _q2 = new tesserxel.math.Quaternion();
            _mat4 = new tesserxel.math.Mat4();
            sliceNeedUpdate;
            retinaZDistance = 5;
            update(state) {
                let disabled = state.queryDisabled(this.keyConfig);
                let on = state.isKeyHold;
                let key = this.keyConfig;
                let delta;
                let sliceConfig = this.sliceConfig;
                if (!disabled && state.isKeyHold(this.keyConfig.toggle3D)) {
                    sliceConfig.retinaEyeOffset = sliceConfig.retinaEyeOffset ? 0 : 0.1;
                    sliceConfig.sectionEyeOffset = sliceConfig.sectionEyeOffset ? 0 : 0.1;
                    sliceConfig.sections = this.sectionPresets(this.renderer.getScreenAspect())[this.currentSectionConfig][(sliceConfig.sectionEyeOffset ? "eye2" : "eye1")];
                    this.sliceNeedUpdate = true;
                }
                else if (this.needResize) {
                    this.sliceNeedUpdate = true;
                    sliceConfig.sections = this.sectionPresets(this.renderer.getScreenAspect())[this.currentSectionConfig][(sliceConfig.sectionEyeOffset ? "eye2" : "eye1")];
                }
                if (!disabled) {
                    this.needResize = false;
                    if (state.isKeyHold(this.keyConfig.addOpacity)) {
                        this.sliceConfig.opacity *= 1 + this.opacityKeySpeed;
                        this.sliceNeedUpdate = true;
                    }
                    if (state.isKeyHold(this.keyConfig.subOpacity)) {
                        this.sliceConfig.opacity /= 1 + this.opacityKeySpeed;
                        this.sliceNeedUpdate = true;
                    }
                    if (state.isKeyHold(this.keyConfig.addLayer)) {
                        if (this.sliceConfig.layers > 32 || ((state.updateCount & 3) && (this.sliceConfig.layers > 16 || (state.updateCount & 7)))) {
                            this.sliceConfig.layers++;
                        }
                        if (this.sliceConfig.layers > 512)
                            this.sliceConfig.layers = 512;
                        this.sliceNeedUpdate = true;
                    }
                    if (state.isKeyHold(this.keyConfig.subLayer)) {
                        // when < 32, we slow down layer speed
                        if (this.sliceConfig.layers > 32 || ((state.updateCount & 3) && (this.sliceConfig.layers > 16 || (state.updateCount & 7)))) {
                            if (this.sliceConfig.layers > 0)
                                this.sliceConfig.layers--;
                            this.sliceNeedUpdate = true;
                        }
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
                        if (state.moveX)
                            this._vec2damp.x = state.moveX * this.mouseSpeed;
                        if (state.moveY)
                            this._vec2damp.y = state.moveY * this.mouseSpeed;
                    }
                }
                if (this._vec2damp.norm1() < 1e-3) {
                    this._vec2damp.set(0, 0);
                }
                else {
                    this._vec2euler.adds(this._vec2damp);
                    let mat = this._mat4.setFrom3DRotation(this._q1.expset(this._vec3.set(0, this._vec2euler.x, 0)).mulsr(this._q2.expset(this._vec3.set(this._vec2euler.y, 0, 0))).conjs());
                    mat.elem[11] = -this.retinaZDistance;
                    this.renderer.setRetinaViewMatrix(mat);
                    let dampFactor = Math.exp(-this.damp * Math.min(200.0, state.mspf));
                    this._vec2damp.mulfs(dampFactor);
                }
                if (this.sliceNeedUpdate)
                    this.renderer.setSlice(this.sliceConfig);
                this.sliceNeedUpdate = false;
            }
            setSlice(sliceConfig) {
                this.sliceConfig = sliceConfig;
                this.renderer.setSlice(this.sliceConfig);
                this.sliceNeedUpdate = false;
            }
            toggleSectionConfig(index) {
                if (this.currentSectionConfig === index)
                    return;
                this.sliceNeedUpdate = true;
                let preset = this.sectionPresets(this.renderer.getScreenAspect())[index];
                if (!preset)
                    console.error(`Section Configuration "${index}" does not exsit.`);
                if (preset.retina === false && this.sliceConfig.layers > 0) {
                    this.rembemerLastLayers = this.sliceConfig.layers;
                    this.sliceConfig.layers = 0;
                }
                else if (preset.retina === true && this.rembemerLastLayers) {
                    this.sliceConfig.layers = this.rembemerLastLayers;
                    this.rembemerLastLayers = null;
                }
                this.sliceConfig.sections = preset[(this.sliceConfig.sectionEyeOffset ? "eye2" : "eye1")];
                this.currentSectionConfig = index;
            }
            setSize(size) {
                this.renderer.setSize(size);
                this.needResize = true;
            }
        }
        controller.RetinaController = RetinaController;
    })(controller = tesserxel.controller || (tesserxel.controller = {}));
})(tesserxel || (tesserxel = {}));
var tesserxel;
(function (tesserxel) {
    let renderer;
    (function (renderer) {
        async function createGPU() {
            return await new renderer.GPU().init();
        }
        renderer.createGPU = createGPU;
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
        renderer.GPU = GPU;
    })(renderer = tesserxel.renderer || (tesserxel.renderer = {}));
})(tesserxel || (tesserxel = {}));
var tesserxel;
(function (tesserxel) {
    let renderer;
    (function (renderer) {
        let SliceFacing;
        (function (SliceFacing) {
            SliceFacing[SliceFacing["POSZ"] = 0] = "POSZ";
            SliceFacing[SliceFacing["NEGZ"] = 1] = "NEGZ";
            SliceFacing[SliceFacing["POSY"] = 2] = "POSY";
            SliceFacing[SliceFacing["NEGY"] = 3] = "NEGY";
            SliceFacing[SliceFacing["POSX"] = 4] = "POSX";
            SliceFacing[SliceFacing["NEGX"] = 5] = "NEGX";
        })(SliceFacing = renderer.SliceFacing || (renderer.SliceFacing = {}));
        let EyeOffset;
        (function (EyeOffset) {
            EyeOffset[EyeOffset["LeftEye"] = 0] = "LeftEye";
            EyeOffset[EyeOffset["None"] = 1] = "None";
            EyeOffset[EyeOffset["RightEye"] = 2] = "RightEye";
        })(EyeOffset = renderer.EyeOffset || (renderer.EyeOffset = {}));
        ;
        ;
        const DefaultMaxVertexOutputNumber = 4;
        const DefaultWorkGroupSize = 256;
        const DefaultSliceResolution = 512;
        const DefaultMaxSlicesNumber = 256;
        const DefaultMaxCrossSectionBufferSize = 0x800000;
        const DefaultEnableFloat16Blend = true;
        class SliceRenderer {
            // readonly ATTRIBUTE = 1;
            // configurations
            maxSlicesNumber;
            maxVertexOutputNumber;
            maxCrossSectionBufferSize;
            sliceResolution;
            /** On each computeshader slice calling numbers, should be 2^n */
            sliceGroupSize;
            sliceGroupSizeBit;
            screenSize;
            outputBufferStride;
            blendFormat;
            sliceConfig;
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
            retinaRenderPipeline;
            screenRenderPipeline;
            retinaBindGroup;
            screenBindGroup;
            outputVaryBuffer;
            outputClearBuffer;
            sliceOffsetBuffer;
            emitIndexSliceBuffer;
            refacingBuffer; // refacing buffer stores not only refacing but also retina slices
            eyeBuffer;
            thumbnailViewportBuffer;
            readBuffer;
            slicesBuffer;
            sliceGroupOffsetBuffer;
            retinaMVBuffer;
            retinaPBuffer;
            screenAspectBuffer;
            layerOpacityBuffer;
            camProjBuffer;
            // CPU caches for retina and screen
            retinaViewMatrix = new tesserxel.math.Mat4();
            retinaMVMatJsBuffer = new Float32Array(16);
            currentRetinaFacing;
            retinaMatrixChanged = true;
            retinaFacingChanged = true;
            screenClearColor = { r: 0, g: 0, b: 0, a: 0.0 };
            renderState;
            enableEye3D = false;
            refacingMatsCode;
            // section thumbnail
            totalGroupNum;
            sliceGroupNum;
            async init(gpu, context, options) {
                // constants generations
                let sliceResolution = options?.sliceResolution ?? DefaultSliceResolution;
                // by default we maximum sliceGroupSize value according to maximum 2d texture size
                let sliceGroupSize = options?.sliceGroupSize ?? (gpu.device.limits.maxTextureDimension2D / sliceResolution);
                // sliceTexture covered by sliceGroupSize x 2 atlas of sliceResolution x sliceResolution
                let sliceTextureSize = { width: sliceResolution, height: sliceResolution * sliceGroupSize };
                let sliceGroupSizeBit = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512].indexOf(sliceGroupSize);
                let outputBufferSize = (options?.maxCrossSectionBufferSize ?? DefaultMaxCrossSectionBufferSize);
                let outputBufferStride = outputBufferSize >> sliceGroupSizeBit;
                let maxSlicesNumber = options?.maxSlicesNumber ?? DefaultMaxSlicesNumber;
                let maxVertexOutputNumber = options?.maxVertexOutputNumber ?? DefaultMaxVertexOutputNumber;
                let enableFloat16Blend = (options?.enableFloat16Blend ?? DefaultEnableFloat16Blend);
                let blendFormat = enableFloat16Blend === true ? 'rgba16float' : gpu.preferredFormat;
                this.sliceResolution = sliceResolution;
                this.sliceGroupSize = sliceGroupSize;
                this.sliceGroupSizeBit = sliceGroupSizeBit;
                this.maxCrossSectionBufferSize = outputBufferSize;
                this.outputBufferStride = outputBufferStride;
                this.maxSlicesNumber = maxSlicesNumber;
                this.blendFormat = blendFormat;
                this.maxVertexOutputNumber = maxVertexOutputNumber;
                // buffers
                this.readBuffer = gpu.createBuffer(GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ, outputBufferSize);
                // external declaration : let mvpBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 4 * 4 * 6);
                let sliceOffsetBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 4);
                let emitIndexSliceBuffer = gpu.createBuffer(GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST, (4 << sliceGroupSizeBit) + (maxSlicesNumber << 4));
                let retinaMVBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 64);
                let retinaPBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 64);
                let refacingBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 4);
                let eyeBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 8);
                let thumbnailViewportBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 16 * 16 * 4);
                let outputAttributeUsage = GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX;
                let outputVaryBuffer = [];
                for (let i = 0; i < maxVertexOutputNumber; i++) {
                    outputVaryBuffer.push(gpu.createBuffer(outputAttributeUsage, outputBufferSize, "OutputBuffer[" + i + "]"));
                }
                let outputClearBuffer = gpu.createBuffer(GPUBufferUsage.COPY_SRC, outputBufferSize);
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
                this.outputVaryBuffer = outputVaryBuffer;
                this.outputClearBuffer = outputClearBuffer;
                this.sliceOffsetBuffer = sliceOffsetBuffer;
                this.emitIndexSliceBuffer = emitIndexSliceBuffer;
                this.retinaMVBuffer = retinaMVBuffer;
                this.retinaPBuffer = retinaPBuffer;
                this.refacingBuffer = refacingBuffer;
                this.eyeBuffer = eyeBuffer;
                // this.slicesBuffer = slicesBuffer;
                this.sliceGroupOffsetBuffer = sliceGroupOffsetBuffer;
                this.screenAspectBuffer = screenAspectBuffer;
                this.layerOpacityBuffer = layerOpacityBuffer;
                this.camProjBuffer = camProjBuffer;
                this.thumbnailViewportBuffer = thumbnailViewportBuffer;
                // textures
                let depthTexture = gpu.device.createTexture({
                    size: sliceTextureSize, format: 'depth24plus',
                    usage: GPUTextureUsage.RENDER_ATTACHMENT,
                });
                let depthView = depthTexture.createView();
                let sliceTexture = gpu.device.createTexture({
                    size: sliceTextureSize, format: gpu.preferredFormat,
                    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
                });
                let sliceView = sliceTexture.createView();
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
    @location(1) rayForCalOpacity : vec4<f32>,
    @location(2) normalForCalOpacity : vec4<f32>,
}
struct fInputType{
    @location(0) relativeFragPosition : vec3<f32>,
    @location(1) rayForCalOpacity : vec4<f32>,
    @location(2) normalForCalOpacity : vec4<f32>,
}
struct _SliceInfo{
    slicePos: f32,
    refacing: u32,
    flag: u32,
    _pading: u32,
}
@group(0) @binding(0) var<uniform> mvmat: mat4x4<f32>;
@group(0) @binding(1) var<uniform> pmat: mat4x4<f32>;
@group(0) @binding(2) var<storage,read> slice : array<_SliceInfo,${this.maxSlicesNumber}>;
@group(0) @binding(3) var<uniform> sliceoffset : u32;
@group(0) @binding(4) var<uniform> refacing : u32;
@group(0) @binding(5) var<uniform> screenAspect : f32;
@group(0) @binding(6) var<uniform> layerOpacity : f32;
@group(0) @binding(7) var<uniform> thumbnailViewport : array<vec4<f32>,16>;
@group(0) @binding(8) var<uniform> eyeOffset : vec2<f32>; //(eye4,eye3)

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
    let coord = vec2<f32>(pos2d.x, -pos2d.y) * 0.5 + 0.5;
    let ray = vec4<f32>(pos2d, s.slicePos, 1.0);
    var glPosition: vec4<f32>;
    var camRay: vec4<f32>;
    var normal: vec4<f32>;
    if (slice[sliceoffset].flag == 0){
        let stereoLR_offset = -stereoLR * eyeOffset.y;
        let se = sin(stereoLR_offset);
        let ce = cos(stereoLR_offset);
        let eyeMat = mat4x4<f32>(
            ce,0,se,0,
            0,1,0,0,
            -se,0,ce,0,
            0,0,0,1
        );
        let omat = mvmat * eyeMat * refacingMats[refacing & 7];
        camRay = omat * ray;
        glPosition = pmat * camRay;
        normal = omat[2];
        // todo: viewport of retina slices
        glPosition.x = (glPosition.x) * screenAspect + step(0.0001, eyeOffset.y) * stereoLR * glPosition.w;
    }else{
        let vp = thumbnailViewport[sindex + sliceoffset - (refacing >> 5)];
        glPosition = vec4<f32>(ray.x * vp.z * screenAspect + vp.x, ray.y * vp.w + vp.y,0.5,1.0);
    }
    return vOutputType(
        glPosition,
        vec3<f32>(coord.x, (coord.y + f32(sindex))*${1 / sliceGroupSize} , s.slicePos),
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
    if (slice[sliceoffset].flag == 0){
        let dotvalue = dot(normalize(input.rayForCalOpacity.xyz), input.normalForCalOpacity.xyz);
        let factor = layerOpacity/(clamp(-dotvalue,0.0,1.0));
        alpha =  color.a * max(0.0, factor );
    }
    return vec4<f32>(color.rgb, alpha);
}
`;
                let retinaRenderShaderModule = gpu.device.createShaderModule({
                    code: retinaRenderCode
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
                    { buffer: eyeBuffer },
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
fn acesFilm(x: vec3<f32>)-> vec3<f32> {
    const a: f32 = 2.51;
    const b: f32 = 0.03;
    const c: f32 = 2.43;
    const d: f32 = 0.59;
    const e: f32 = 0.14;
    return clamp((x * (a * x + b)) / (x * (c * x + d ) + e), vec3<f32>(0.0), vec3<f32>(1.0));
}
@fragment fn mainFragment(input: fInputType) -> @location(0) vec4<f32> {
    let color = textureSample(txt, splr, input.fragPosition);
    // return vec4<f32>(clamp(acesFilm(color.rgb*1.0), vec3<f32>(0.0), vec3<f32>(1.0)), 1.0);
    return vec4<f32>(color.rgb, 1.0);
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
                // default retina settings
                if (options.defaultConfigs !== false) {
                    let size = 0.2;
                    this.setSlice({
                        layers: 64,
                        sectionEyeOffset: 0.1,
                        retinaEyeOffset: 0.1,
                        opacity: 1.0,
                        sections: [
                            {
                                facing: tesserxel.renderer.SliceFacing.NEGX,
                                eyeOffset: tesserxel.renderer.EyeOffset.LeftEye,
                                viewport: { x: -size, y: size - 1, width: size, height: size }
                            },
                            {
                                facing: tesserxel.renderer.SliceFacing.NEGX,
                                eyeOffset: tesserxel.renderer.EyeOffset.RightEye,
                                viewport: { x: 1 - size, y: size - 1, width: size, height: size }
                            },
                            {
                                facing: tesserxel.renderer.SliceFacing.NEGY,
                                eyeOffset: tesserxel.renderer.EyeOffset.LeftEye,
                                viewport: { x: -size, y: 1 - size, width: size, height: size }
                            },
                            {
                                facing: tesserxel.renderer.SliceFacing.NEGY,
                                eyeOffset: tesserxel.renderer.EyeOffset.RightEye,
                                viewport: { x: 1 - size, y: 1 - size, width: size, height: size }
                            },
                            {
                                facing: tesserxel.renderer.SliceFacing.POSZ,
                                eyeOffset: tesserxel.renderer.EyeOffset.LeftEye,
                                viewport: { x: size - 1, y: size - 1, width: size, height: size }
                            },
                            {
                                facing: tesserxel.renderer.SliceFacing.POSZ,
                                eyeOffset: tesserxel.renderer.EyeOffset.RightEye,
                                viewport: { x: size, y: size - 1, width: size, height: size }
                            },
                        ]
                    });
                    this.set4DCameraProjectMatrix({ fov: 90, near: 0.01, far: 10 });
                    this.setRetinaProjectMatrix({
                        fov: 40, near: 0.01, far: 10
                    });
                    this.setRetinaViewMatrix(new tesserxel.math.Mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, -5, 0, 0, 0, 1));
                }
                return this;
            } // end init
            createBindGroup(pipeline, index, buffers) {
                if (index == 0)
                    console.error("Unable to create BindGroup 0, which is occupied by internal usages.");
                return this.gpu.createBindGroup((pipeline.computePipeline ?
                    pipeline.computePipeline :
                    pipeline.pipeline), index, buffers.map(e => ({ buffer: e })), "SlicePipelineBindGroup");
            }
            async createTetraSlicePipeline(desc) {
                let vertexState = desc.vertex;
                const reflect = new renderer.wgslreflect.WgslReflect(vertexState.code);
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
                let { input, output, call } = renderer.wgslreflect.getFnInputAndOutput(reflect, mainFn, expectInput, expectOutput);
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
                    { buffer: this.eyeBuffer },
                    { buffer: this.camProjBuffer },
                    { buffer: this.thumbnailViewportBuffer }
                ];
                for (let attr in output) {
                    let id;
                    if (attr === "builtin(position)") {
                        id = 0;
                    }
                    else if (attr.startsWith("location(")) {
                        let i = attr.charAt(9);
                        id = Number(i) + 1;
                    }
                    if (id >= 0) {
                        vertexOutNum++;
                        bindGroup0declare += `@group(0) @binding(${bindGroup0declareIndex + id}) var<storage, read_write> _output${id} : array<vec4<f32>>;\n`;
                        if (!this.outputVaryBuffer[id]) {
                            console.error("Reached maximum tetra vertex shader output");
                        }
                        varInterpolate += `var output${id}s : array<vec4<f32>,4>;\n`;
                        emitOutput1 += `
            _output${id}[outOffset] =   output${id}s[0];
            _output${id}[outOffset+1] = output${id}s[1];
            _output${id}[outOffset+2] = output${id}s[2];`;
                        emitOutput2 += `
                _output${id}[outOffset+3] = output${id}s[2];
                _output${id}[outOffset+4] = output${id}s[1];
                _output${id}[outOffset+5] = output${id}s[3];`;
                        buffers.push({ buffer: this.outputVaryBuffer[id] });
                        vinputVert += `@location(${id}) member${id}: vec4<f32>,\n`;
                        voutputVert += `@${attr} member${id}: vec4<f32>,\n`;
                        vcallVert += `data.member${id},`;
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
                        let name = attr.startsWith("location(") ? output[attr] : attr == "builtin(position)" ? "refPosMat" : "";
                        if (!name)
                            continue;
                        let i = attr.startsWith("location(") ? Number(attr.charAt(9)) + 1 : 0;
                        str += `output${i}s[offset] = mix(${name}[${a}],${name}[${b}],alpha);\n`;
                    }
                    return str;
                }
                let cullOperator = desc.cullMode == "back" ? "<" : ">";
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
    let tetrahedralNum : u32 = arrayLength(&_attribute0); // todo: check performance?
    let tetraIndex = GlobalInvocationID.x;
    let instanceIndex = GlobalInvocationID.y;
    if(tetraIndex >= tetrahedralNum ){
        return;
    }
    // calculate camera space coordinate : builtin(position) and other output need to be interpolated : location(x)
    // call user defined code 
    ${call}
    let cameraPosMat = ${output["builtin(position)"]};
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
    var instanceLength:u32 = ${this.sliceGroupSize};
    var refPosMat : mat4x4<f32>;
    var refCamMat : mat4x4<f32>;
    let sliceFlag = _emitIndex_slice.slice[_sliceoffset].flag;
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
        emitIndexOffset += _emitIndexStride;
    } // end all hits
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
                    vertexOutNum
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
            getScreenAspect() {
                if (!this.screenTexture) {
                    return 1;
                }
                return this.screenTexture.height / this.screenTexture.width;
            }
            set4DCameraProjectMatrix(camera) {
                this.gpu.device.queue.writeBuffer(this.camProjBuffer, 0, new Float32Array(tesserxel.math.getPerspectiveMatrix(camera).vec4.flat()));
            }
            setRetinaProjectMatrix(camera) {
                let buffer = new Float32Array(16);
                tesserxel.math.getPerspectiveMatrix(camera).mat4.writeBuffer(buffer);
                this.gpu.device.queue.writeBuffer(this.retinaPBuffer, 0, buffer);
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
            getSliceConfig() {
                if (!this.sliceConfig)
                    return null;
                let sections = this.sliceConfig.sections ?? [];
                let config = {
                    layers: this.sliceConfig.layers,
                    retinaEyeOffset: this.sliceConfig.retinaEyeOffset ?? 0,
                    sectionEyeOffset: this.sliceConfig.sectionEyeOffset ?? 0,
                    opacity: this.sliceConfig.opacity ?? 1,
                    sections: sections.map(e => ({
                        eyeOffset: e.eyeOffset ?? EyeOffset.None,
                        facing: e.facing,
                        slicePos: e.slicePos ?? 0,
                        viewport: {
                            x: e.viewport.x,
                            y: e.viewport.y,
                            width: e.viewport.width,
                            height: e.viewport.height,
                        }
                    }))
                };
                return config;
            }
            setSlice(sliceConfig) {
                sliceConfig.sections ??= [];
                sliceConfig.retinaEyeOffset ??= 0;
                sliceConfig.sectionEyeOffset ??= 0;
                this.enableEye3D = sliceConfig.retinaEyeOffset !== 0;
                this.gpu.device.queue.writeBuffer(this.eyeBuffer, 0, new Float32Array([
                    sliceConfig.sectionEyeOffset, sliceConfig.retinaEyeOffset
                ]));
                let sliceStep = 2 / sliceConfig.layers;
                let sliceGroupNum = Math.ceil(sliceConfig.layers / this.sliceGroupSize);
                let sliceNum = sliceGroupNum << this.sliceGroupSizeBit;
                let sectionNum = sliceConfig.sections?.length ?? 0;
                let sectionGroupNum = Math.ceil(sectionNum / this.sliceGroupSize);
                let totalNum = sliceNum + (sectionGroupNum << this.sliceGroupSizeBit);
                let slices = new Float32Array(totalNum << 2);
                for (let slice = -1, i = 0; i < sliceNum; slice += sliceStep, i++) {
                    slices[(i << 2)] = slice; // if slice > 1, discard in shader
                    slices[(i << 2) + 1] = 0;
                    slices[(i << 2) + 2] = 0;
                }
                this.sliceConfig = sliceConfig;
                this.sliceGroupNum = sliceGroupNum;
                this.totalGroupNum = sliceGroupNum + sectionGroupNum;
                if (sectionNum) {
                    let thumbnailViewportJsBuffer = new Float32Array(4 * 16);
                    let lastGroupPosition = sectionGroupNum - 1 << this.sliceGroupSizeBit;
                    let lastGroupSlices = this.sliceConfig.sections.length - lastGroupPosition;
                    for (let i = sliceNum, j = 0; i < totalNum; i++, j++) {
                        let config = this.sliceConfig.sections[j];
                        slices[(i << 2)] = config?.slicePos ?? 0;
                        slices[(i << 2) + 1] = u32_to_f32(((config?.facing) ?? 0) | ((config?.eyeOffset ?? 1) << 3));
                        slices[(i << 2) + 2] = u32_to_f32(j < lastGroupPosition ? this.sliceGroupSize : lastGroupSlices);
                        if (config) {
                            thumbnailViewportJsBuffer[j << 2] = config.viewport.x;
                            thumbnailViewportJsBuffer[(j << 2) + 1] = config.viewport.y;
                            thumbnailViewportJsBuffer[(j << 2) + 2] = config.viewport.width;
                            thumbnailViewportJsBuffer[(j << 2) + 3] = config.viewport.height;
                        }
                    }
                    this.gpu.device.queue.writeBuffer(this.thumbnailViewportBuffer, 0, thumbnailViewportJsBuffer);
                }
                let opacity = sliceNum ? (sliceConfig.opacity ?? 1.0) / sliceNum : 1.0;
                this.gpu.device.queue.writeBuffer(this.layerOpacityBuffer, 0, new Float32Array([opacity]));
                this.gpu.device.queue.writeBuffer(this.emitIndexSliceBuffer, 0, slices);
                this.retinaFacingChanged = true; // force to reload retina slice num into refacing buffer
                function u32_to_f32(u32) {
                    return new Float32Array(new Uint32Array([u32]).buffer)[0];
                }
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
                    // commandEncoder.copyBufferToBuffer(this.outputPositionBuffer, 0, this.readBuffer, 0, this.maxCrossSectionBufferSize);
                    this.renderState = {
                        commandEncoder,
                        sliceIndex,
                        needClear: true
                    };
                    drawCall();
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
                    let isSectionCount = this.sliceConfig.sections.length && sliceIndex >= this.sliceGroupNum;
                    let lastCount = isSectionCount ? this.sliceConfig.sections.length % this.sliceGroupSize : 0;
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
                // this.readBuffer.mapAsync(GPUMapMode.READ).then(()=>{
                //     const copyArrayBuffer = new Float32Array(this.readBuffer.getMappedRange()).slice(0);
                //     this.readBuffer.unmap();
                //     console.log(copyArrayBuffer);
                // });
            } // end render
            beginTetras(pipeline) {
                let { commandEncoder, sliceIndex, needClear } = this.renderState;
                commandEncoder.copyBufferToBuffer(this.outputClearBuffer, 0, this.emitIndexSliceBuffer, this.maxSlicesNumber << 4, 4 << this.sliceGroupSizeBit);
                commandEncoder.copyBufferToBuffer(this.outputClearBuffer, 0, this.outputVaryBuffer[0], 0, this.maxCrossSectionBufferSize);
                if (needClear)
                    commandEncoder.copyBufferToBuffer(this.sliceGroupOffsetBuffer, sliceIndex << 2, this.sliceOffsetBuffer, 0, 4);
                let computePassEncoder = commandEncoder.beginComputePass();
                computePassEncoder.setPipeline(pipeline.computePipeline);
                computePassEncoder.setBindGroup(0, pipeline.computeBindGroup0);
                this.renderState.computePassEncoder = computePassEncoder;
                this.renderState.pipeline = pipeline;
            }
            setBindGroup(index, bindGroup) {
                let { computePassEncoder } = this.renderState;
                computePassEncoder.setBindGroup(index, bindGroup);
            }
            sliceTetras(vertexBindGroup, tetraCount, instanceCount) {
                let { computePassEncoder } = this.renderState;
                computePassEncoder.setBindGroup(1, vertexBindGroup);
                computePassEncoder.dispatchWorkgroups(Math.ceil(tetraCount / 256), instanceCount); // todo: change workgroups
            }
            setWorldClearColor(color) {
                this.crossRenderPassDescClear.colorAttachments[0].clearValue = color;
            }
            setScreenClearColor(color) {
                this.screenClearColor = color;
            }
            drawTetras() {
                let { commandEncoder, computePassEncoder, pipeline, needClear } = this.renderState;
                computePassEncoder.end();
                let slicePassEncoder = commandEncoder.beginRenderPass(
                // this.crossRenderPassDescClear
                needClear ? this.crossRenderPassDescClear : this.crossRenderPassDescLoad);
                slicePassEncoder.setPipeline(pipeline.renderPipeline);
                for (let i = 0; i < pipeline.vertexOutNum; i++) {
                    slicePassEncoder.setVertexBuffer(i, this.outputVaryBuffer[i]);
                }
                // bitshift: outputBufferSize / 16 for vertices number, / sliceGroupSize for one stride
                let bitshift = 4 + this.sliceGroupSizeBit;
                let verticesStride = this.maxCrossSectionBufferSize >> bitshift;
                let offsetVert = 0;
                let offsetPosY = 0;
                for (let c = 0; c < this.sliceGroupSize; c++, offsetVert += verticesStride, offsetPosY += this.sliceResolution) {
                    slicePassEncoder.setViewport(0, offsetPosY, this.sliceResolution, this.sliceResolution, 0, 1);
                    slicePassEncoder.draw(verticesStride, 1, offsetVert);
                }
                slicePassEncoder.end();
                this.renderState.needClear = false;
            }
            async createRaytracingPipeline(desc) {
                let code = desc.code.replace(/@ray(\s)/g, "@vertex$1");
                const reflect = new renderer.wgslreflect.WgslReflect(code);
                let mainRayFn = reflect.functions.filter(e => e.attributes && e.attributes.some(a => a.name === "vertex") && e.name == desc.rayEntryPoint)[0];
                if (!mainRayFn)
                    console.error("Raytracing pipeline: Entry point does not exist.");
                // let mainFragFn = reflect.functions.filter(
                //     e => e.attributes && e.attributes.some(a => a.name === "fragment") && e.name == desc.fragment.entryPoint
                // )[0];
                let { input, output, call } = renderer.wgslreflect.getFnInputAndOutput(reflect, mainRayFn, {
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
                    outputMembers = output["return"];
                    retunTypeMembers = `@${renderer.wgslreflect.parseAttr(mainRayFn.return.attributes)} ${renderer.wgslreflect.parseTypeName(mainRayFn.return)}`;
                }
                else {
                    let st = reflect.structs.filter(s => s.name === mainRayFn.return.name)[0];
                    if (!st)
                        console.error("No attribute found");
                    outputMembers = st.members.map(m => output[renderer.wgslreflect.parseAttr(m.attributes)]).join(",\n");
                    retunTypeMembers = st.members.map(m => `@${renderer.wgslreflect.parseAttr(m.attributes)} ${m.name}: ${renderer.wgslreflect.parseTypeName(m.type)}`).join(",\n");
                }
                // ${wgslreflect.parseAttr(mainRayFn.return.attributes)} userRayOut: ${wgslreflect.parseTypeName(mainRayFn.return)}
                let shaderCode = this.refacingMatsCode + `
struct _SliceInfo{
    slicePos: f32,
    refacing: u32,
    flag: u32,
    _pading: u32,
}
struct _vOut{
    @builtin(position) pos: vec4<f32>,
    ${retunTypeMembers}
    // @location(0) rayDir: vec4<f32>,
    // @location(1) rayPos: vec4<f32>,
    // @location(2) retinaPosition: vec4<f32>,
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
    if(sliceFlag == 0){
        refacingEnum = _refacingMat;
    }else{
        refacingEnum = sliceInfo.refacing;
        let vp = thumbnailViewport[_sliceoffset + i_index - (_refacingMat >> 5)];
        aspect = vp.z / vp.w;
        rayPos = vec4<f32>(-_eye4dOffset * (f32(sliceInfo.refacing >> 3) - 1.0), 0.0, 0.0, 0.0);
    }
    let rayDir = vec4<f32>(coord.x/_camProj.x * aspect, coord.y/_camProj.y, sliceInfo.slicePos/_camProj.x, -1.0);
    let refacingMat = refacingMats[refacingEnum & 7];
    let voxelCoord = (refacingMat * vec4<f32>(coord, sliceInfo.slicePos,0.0)).xyz;
    let camRayDir = refacingMat * rayDir;
    let camRayOri = refacingMat * rayPos;
    ${dealRefacingCall}
    ${call}
    return _vOut(
        vec4<f32>(posidx.x,
            -((
                (-posidx.y + 1.0) * 0.5 + f32(i_index)
            )*${1 / this.sliceGroupSize} - 0.5)*2.0, 0.999999, 1.0),
        ${outputMembers}
        // transpose(camMat.matrix) * (refacingMat * rayPos + camMat.vector),
        // vec4<f32>(-pos[vindex], -sliceInfo.slicePos, 1.0)
    );
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
                        entryPoint: "mainFragment",
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
                    { buffer: this.eyeBuffer },
                    { buffer: this.camProjBuffer },
                    { buffer: this.thumbnailViewportBuffer },
                ];
                return {
                    pipeline, bindGroup0: this.gpu.createBindGroup(pipeline, 0, buffers)
                };
            }
            drawRaytracing(pipeline, bindGroups) {
                let { commandEncoder, needClear, sliceIndex } = this.renderState;
                if (needClear)
                    commandEncoder.copyBufferToBuffer(this.sliceGroupOffsetBuffer, sliceIndex << 2, this.sliceOffsetBuffer, 0, 4);
                let slicePassEncoder = commandEncoder.beginRenderPass(needClear ? this.crossRenderPassDescClear : this.crossRenderPassDescLoad);
                slicePassEncoder.setPipeline(pipeline.pipeline);
                slicePassEncoder.setBindGroup(0, pipeline.bindGroup0);
                slicePassEncoder.setBindGroup(1, bindGroups[0]);
                slicePassEncoder.draw(4, this.sliceGroupSize);
                slicePassEncoder.end();
                this.renderState.needClear = false;
            }
        }
        renderer.SliceRenderer = SliceRenderer;
        ; // end class
    })(renderer = tesserxel.renderer || (tesserxel.renderer = {}));
})(tesserxel || (tesserxel = {}));
var tesserxel;
(function (tesserxel) {
    let renderer;
    (function (renderer) {
        class VoxelRenderer {
            gpu;
            constructor(gpu) {
                this.gpu = gpu;
            }
            async createPipeline(p) {
                let reflect = new renderer.wgslreflect.WgslReflect(p.code);
                let mainFn = reflect.functions.filter(e => e.attributes && e.attributes.some(a => a.name === "voxel") && e.name == p.entryPoint)[0];
                if (!mainFn)
                    console.error("Voxel pipeline: Entry point does not exist.");
                let { input, call, output } = renderer.wgslreflect.getFnInputAndOutput(reflect, mainFn, {
                    "builtin(ray_direction)": "rd",
                    "builtin(ray_origin)": "ro",
                    "builtin(resolution)": "_size",
                    "builtin(voxel_position)": "voxelPosition",
                }, ["location(0)", "location(1)", "location(2)", "location(3)", "location(4)", "location(5)"]);
                let raygenCode = "";
                if (input.has("builtin(ray_direction)") || input.has("builtin(ray_origin)")) {
                    raygenCode = `
let dir = `;
                }
                let outputDeclCode = "";
                let outputAsgnCode = "";
                const group0outbindoffset = 3;
                for (let i = 0; i < p.outputs.length; i++) {
                    let varName = output["location(" + i + ")"];
                    if (varName) {
                        outputDeclCode += `@group(0) @binding(${group0outbindoffset + i}) var<storage,read_write> _output${i} : array<${p.outputs[i]}>;`;
                        outputAsgnCode += `_output${i}[] = ${varName}`;
                    }
                }
                let voxelComputeCode = `

@group(0) @binding(0) var<uniform> _eye4dOffset : f32;
@group(0) @binding(1) var<uniform> _size: vec3<u32>;
@group(0) @binding(2) var<uniform> _camProj: vec4<f32>;
// fn voxelFetch(buffer: array<T>, coord: vec3<f32>)->T{

// }
@compute @workgroup_size(8,8,8) fn _mainCompute(@builtin(global_invocation_id) GlobalInvocationID : vec3<u32>){
    let voxelPosition = vec3<f32>(
        f32(GlobalInvocationID.x) / f32(_size.x),
        f32(GlobalInvocationID.y) / f32(_size.y),
        f32(GlobalInvocationID.z) / f32(_size.z),
    )*2.0 - vec3<f32>(1.0);
    ${call}
    _output[GlobalInvocationID.x + _size.x * (GlobalInvocationID.y + _size.y * GlobalInvocationID.z)] = result;
}`;
                await this.gpu.device.createComputePipelineAsync({
                    layout: 'auto',
                    compute: {
                        module: this.gpu.device.createShaderModule({
                            code: voxelComputeCode
                        }),
                        entryPoint: '_mainCompute'
                    }
                });
            }
        }
    })(renderer = tesserxel.renderer || (tesserxel.renderer = {}));
})(tesserxel || (tesserxel = {}));
// @ts-nocheck
var tesserxel;
(function (tesserxel) {
    let renderer;
    (function (renderer) {
        let wgslreflect;
        (function (wgslreflect) {
            ;
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
                return type.name + (type.format ? `<${parseTypeName(type.format)}>` : "");
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
                        output[varName] = prefix;
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
        })(wgslreflect = renderer.wgslreflect || (renderer.wgslreflect = {}));
    })(renderer = tesserxel.renderer || (tesserxel.renderer = {}));
})(tesserxel || (tesserxel = {}));
/** threejs like 4D lib */
var tesserxel;
(function (tesserxel) {
    let four;
    (function (four) {
        class Renderer {
            core;
            gpu;
            canvas;
            pipelines;
            constructor(canvas) {
                this.canvas = canvas;
                this.core = new tesserxel.renderer.SliceRenderer();
            }
            async init() {
                this.gpu = await tesserxel.renderer.createGPU();
                await this.core.init(this.gpu, this.gpu.getContext(this.canvas));
            }
            updateMesh(m) {
                m.needsUpdate = false;
                if (m.geometry.needsUpdate) {
                    let g = m.geometry;
                    g.needsUpdate = false;
                    if (!g.gpuBuffer) {
                        for (let [label, value] of globalThis.Object.entries(g.jsBuffer)) {
                            if (value instanceof Float32Array) {
                                g.gpuBuffer[label] = this.gpu.createBuffer(GPUBufferUsage.STORAGE, value, label);
                            }
                        }
                    }
                    else {
                        for (let [label, buffer] of globalThis.Object.entries(g.gpuBuffer)) {
                            this.gpu.device.queue.writeBuffer(buffer, 0, g.jsBuffer[label]);
                        }
                    }
                }
            }
            updateScene(scene) {
                for (let c of scene.child) {
                    if (!c.needsUpdate)
                        return;
                    if (c instanceof Mesh) {
                        this.updateMesh(c);
                    }
                }
            }
            render(scene) {
                this.updateScene(scene);
            }
        }
        class Object extends tesserxel.math.Obj4 {
            child;
            worldCoord;
            needsUpdate = true;
            add(obj) {
                this.child.push(obj);
            }
        }
        class Scene {
            child;
            add(obj) {
                this.child.push(obj);
            }
        }
        class Geometry {
            jsBuffer;
            gpuBuffer;
            needsUpdate = true;
            constructor(data) {
                this.jsBuffer = data;
            }
        }
        class Mesh extends Object {
            geometry;
            material;
        }
        class Material {
            cullFace;
            needsUpdate = true;
            identifier;
            constructor(identifier) {
                this.identifier = identifier;
            }
            gpuUniformBuffer;
            code;
        }
        class BasicMaterial extends Material {
            color;
            constructor(color) {
                super("BasicMaterial");
                this.color = color;
            }
        }
        class PhoneMaterial extends Material {
            color;
            specular;
            constructor(color, specular) {
                super("PhoneMaterial");
                this.color = color;
                this.specular = specular;
            }
        }
    })(four = tesserxel.four || (tesserxel.four = {}));
})(tesserxel || (tesserxel = {}));
var tesserxel;
(function (tesserxel) {
    let four;
    (function (four) {
        let basicVertShader = `
        struct _fourInputType{
            @location(0) pos: mat4x4<f32>,
            @location(1) uvw: mat4x4<f32>,
            @location(2) normal: mat4x4<f32>,
        }
        struct _fourOutputType{
            @builtin(position) pos: mat4x4<f32>,
            @location(0) uvw: mat4x4<f32>,
            @location(1) normal: mat4x4<f32>,
        }
        struct AffineMat{
            matrix: mat4x4<f32>,
            vector: vec4<f32>,
        }
        @group(1) @binding(3) var<uniform> camMat: AffineMat;
        fn apply(afmat: AffineMat, points: mat4x4<f32>) -> mat4x4<f32>{
            let biais = mat4x4<f32>(afmat.vector, afmat.vector, afmat.vector, afmat.vector);
            return afmat.matrix* points + biais;
        }
        @tetra fn main(input : InputType, @builtin(instance_index) index: u32) -> OutputType{
            return OutputType(apply(camMat,input.pos), input.uvw, input.normal);
        }
        `;
    })(four = tesserxel.four || (tesserxel.four = {}));
})(tesserxel || (tesserxel = {}));
//# sourceMappingURL=tesserxel.js.map