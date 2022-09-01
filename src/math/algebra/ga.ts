/**  ga.ts: Geometry Algebra
 *   Bivec|Quaternion|Rotor|Multivector
 *   author: Hqak (wxyhly)
 */
namespace tesserxel {
    export namespace math {
        export class Bivec {
            xy: number; xz: number; xw: number;
            yz: number; yw: number; zw: number;
            static readonly xy = new Bivec(1, 0, 0, 0, 0, 0);
            static readonly xz = new Bivec(0, 1, 0, 0, 0, 0);
            static readonly xw = new Bivec(0, 0, 1, 0, 0, 0);
            static readonly yz = new Bivec(0, 0, 0, 1, 0, 0);
            static readonly yw = new Bivec(0, 0, 0, 0, 1, 0);
            static readonly zw = new Bivec(0, 0, 0, 0, 0, 1);
            static readonly yx = new Bivec(-1, 0, 0, 0, 0, 0);
            static readonly zx = new Bivec(0, -1, 0, 0, 0, 0);
            static readonly wx = new Bivec(0, 0, -1, 0, 0, 0);
            static readonly zy = new Bivec(0, 0, 0, -1, 0, 0);
            static readonly wy = new Bivec(0, 0, 0, 0, -1, 0);
            static readonly wz = new Bivec(0, 0, 0, 0, 0, -1);
            constructor(
                xy: number = 0, xz: number = 0, xw: number = 0,
                yz: number = 0, yw: number = 0, zw: number = 0
            ) {
                this.xy = xy; this.xz = xz; this.xw = xw;
                this.yz = yz; this.yw = yw; this.zw = zw;
            }
            copy(v: Bivec): Bivec {
                this.xy = v.xy; this.xz = v.xz; this.xw = v.xw;
                this.yz = v.yz; this.yw = v.yw; this.zw = v.zw; return this;
            }
            set(xy: number = 0, xz: number = 0, xw: number = 0,
                yz: number = 0, yw: number = 0, zw: number = 0): Bivec {
                this.xy = xy; this.xz = xz; this.xw = xw;
                this.yz = yz; this.yw = yw; this.zw = zw; return this;
            }
            clone(): Bivec {
                return new Bivec(this.xy, this.xz, this.xw, this.yz, this.yw, this.zw);
            }
            flat(): number[] {
                return [this.xy, this.xz, this.xw, this.yz, this.yw, this.zw];
            }
            add(bv: Bivec): Bivec {
                return new Bivec(
                    this.xy + bv.xy, this.xz + bv.xz,
                    this.xw + bv.xw, this.yz + bv.yz,
                    this.yw + bv.yw, this.zw + bv.zw
                );
            }
            adds(bv: Bivec): Bivec {
                this.xy += bv.xy; this.xz += bv.xz;
                this.xw += bv.xw; this.yz += bv.yz;
                this.yw += bv.yw; this.zw += bv.zw;
                return this;
            }
            addset(bv1: Bivec, bv2: Bivec): Bivec {
                return this.set(
                    bv1.xy + bv2.xy, bv1.xz + bv2.xz,
                    bv1.xw + bv2.xw, bv1.yz + bv2.yz,
                    bv1.yw + bv2.yw, bv1.zw + bv2.zw
                );
            }
            neg(): Bivec {
                return new Bivec(-this.xy, -this.xz, -this.xw, -this.yz, -this.yw, -this.zw);
            }
            negs(): Bivec {
                this.xy = -this.xy; this.xz = -this.xz; this.xw = -this.xw;
                this.yz = -this.yz; this.yw = -this.yw; this.zw = -this.zw;
                return this;
            }
            sub(bv: Bivec): Bivec {
                return new Bivec(
                    this.xy - bv.xy, this.xz - bv.xz,
                    this.xw - bv.xw, this.yz - bv.yz,
                    this.yw - bv.yw, this.zw - bv.zw
                );
            }
            subs(bv: Bivec): Bivec {
                this.xy -= bv.xy; this.xz -= bv.xz;
                this.xw -= bv.xw; this.yz -= bv.yz;
                this.yw -= bv.yw; this.zw -= bv.zw;
                return this;
            }
            subset(bv1: Bivec, bv2: Bivec): Bivec {
                return this.set(
                    bv1.xy - bv2.xy, bv1.xz - bv2.xz,
                    bv1.xw - bv2.xw, bv1.yz - bv2.yz,
                    bv1.yw - bv2.yw, bv1.zw - bv2.zw
                );
            }
            mulf(k: number): Bivec {
                return new Bivec(k * this.xy, k * this.xz, k * this.xw, k * this.yz, k * this.yw, k * this.zw);
            }
            mulfs(k: number): Bivec {
                this.xy *= k; this.xz *= k; this.xw *= k;
                this.yz *= k; this.yw *= k; this.zw *= k;
                return this;
            }
            divf(k: number): Bivec {
                k = 1 / k;
                return new Bivec(k * this.xy, k * this.xz, k * this.xw, k * this.yz, k * this.yw, k * this.zw);
            }
            divfs(k: number): Bivec {
                k = 1 / k;
                this.xy *= k; this.xz *= k; this.xw *= k;
                this.yz *= k; this.yw *= k; this.zw *= k;
                return this;
            }
            dot(biv: Bivec): number {
                return this.xy * biv.xy + this.yz * biv.yz + this.zw * biv.zw + this.xw * biv.xw + this.xz * biv.xz + this.yw * biv.yw;
            }
            norm(): number {
                return Math.sqrt(this.xy * this.xy + this.xz * this.xz + this.yz * this.yz + this.yw * this.yw + this.zw * this.zw + this.xw * this.xw);
            }
            norms(): Bivec {
                let k = Math.sqrt(this.xy * this.xy + this.xz * this.xz + this.yz * this.yz + this.yw * this.yw + this.zw * this.zw + this.xw * this.xw);
                k = k == 0 ? 0 : (1 / k);
                this.xy *= k; this.xz *= k; this.xw *= k;
                this.yz *= k; this.yw *= k; this.zw *= k; return this;
            }
            normsqr(): number {
                return this.xy * this.xy + this.xz * this.xz + this.yz * this.yz + this.yw * this.yw + this.zw * this.zw + this.xw * this.xw;;
            }
            norm1(): number {
                return Math.abs(this.xy) + Math.abs(this.xz) + Math.abs(this.xw) + Math.abs(this.yz) + Math.abs(this.yw) + Math.abs(this.zw);
            }
            wedge(biv: Bivec): number {
                return this.xy * biv.zw - this.xz * biv.yw + this.xw * biv.yz + this.yz * biv.xw - this.yw * biv.xz + this.zw * biv.xz;
            }
            dual(): Bivec {
                return new Bivec(this.zw, -this.yw, this.yz, this.xw, -this.xz, this.xy);
            }
            duals(): Bivec {
                var temp: number;
                temp = this.xy; this.xy = this.zw; this.zw = temp;
                temp = this.xz; this.xz = -this.yw; this.yw = -temp;
                temp = this.xw; this.xw = this.yz; this.yz = temp;
                return this;
            }
            wedgev(V: Vec4): Vec4 {
                return new Vec4(
                    -this.yz * V.w - this.zw * V.y + this.yw * V.z,
                    this.xz * V.w + this.zw * V.x - this.xw * V.z,
                    -this.xy * V.w - this.yw * V.x + this.xw * V.y,
                    this.xy * V.z + this.yz * V.x - this.xz * V.y
                );
            }
            wedgevcpy(V: Vec4, destV: Vec4): Vec4 {
                return destV.set(
                    -this.yz * V.w - this.zw * V.y + this.yw * V.z,
                    this.xz * V.w + this.zw * V.x - this.xw * V.z,
                    -this.xy * V.w - this.yw * V.x + this.xw * V.y,
                    this.xy * V.z + this.yz * V.x - this.xz * V.y
                );
            }

            /** Vector part of Geometry Product
             * exy * ey = ex, exy * ex = -ey, exy * ez = 0
             *  */
            dotv(V: Vec4): Vec4 {
                return new Vec4(
                    this.xy * V.y + this.xz * V.z + this.xw * V.w,
                    -this.xy * V.x + this.yz * V.z + this.yw * V.w,
                    -this.xz * V.x - this.yz * V.y + this.zw * V.w,
                    -this.xw * V.x - this.yw * V.y - this.zw * V.z
                );
            }
            cross(V: Bivec): Bivec {
                return new Bivec(
                    V.xz * this.yz - this.xz * V.yz + V.xw * this.yw - this.xw * V.yw,
                    -V.xy * this.yz + this.xy * V.yz + V.xw * this.zw - this.xw * V.zw,
                    -V.xy * this.yw + this.xy * V.yw - V.xz * this.zw + this.xz * V.zw,
                    V.xy * this.xz - this.xy * V.xz + V.yw * this.zw - this.yw * V.zw,
                    V.xy * this.xw - this.xy * V.xw - V.yz * this.zw + this.yz * V.zw,
                    V.xz * this.xw - this.xz * V.xw + V.yz * this.yw - this.yz * V.yw
                );
            }
            exp(): Rotor {
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
                let a = A.norm(); let b = B.norm();
                let aa = a * 0.5; let bb = b * 0.5;
                let sa = (a > 0.005 ? Math.sin(aa) / a : 0.5 - a * a / 12);
                let sb = (b > 0.005 ? Math.sin(bb) / b : 0.5 - b * b / 12);
                return new Rotor(
                    new Quaternion(Math.cos(aa), sa * A.x, sa * A.y, sa * A.z),
                    new Quaternion(Math.cos(bb), sb * B.x, sb * B.y, sb * B.z)
                );
            }
            
            expcpy(r:Rotor): Rotor {
                let A = _vec3_1.set(this.xy + this.zw, this.xz - this.yw, this.xw + this.yz);
                let B = _vec3_2.set(this.xy - this.zw, this.xz + this.yw, this.xw - this.yz);
                let a = A.norm(); let b = B.norm();
                let aa = a * 0.5; let bb = b * 0.5;
                let sa = (a > 0.005 ? Math.sin(aa) / a : 0.5 - a * a / 12);
                let sb = (b > 0.005 ? Math.sin(bb) / b : 0.5 - b * b / 12);
                r.l.set(Math.cos(aa), sa * A.x, sa * A.y, sa * A.z);
                r.r.set(Math.cos(bb), sb * B.x, sb * B.y, sb * B.z);
                return r;
            }
            /** return two angles [max, min] between a and b
             * "a" and "b" must be normalized simple bivectors*/
            static angle(a: Bivec, b: Bivec): number[] {
                let cc = a.dot(b); let ss = a.wedge(b);
                let sub = Math.acos(cc + ss);
                let add = Math.acos(cc - ss);
                return [(add + sub) * 0.5, (add - sub) * 0.5];
            }
            rotate(r: Rotor): Bivec {
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
                return new Bivec(
                    A.y + B.y, A.z + B.z, A.w + B.w, A.w - B.w, B.z - A.z, A.y - B.y
                ).mulfs(0.5);
            }
            rotates(r: Rotor): Bivec {
                let A = _Q_1.set(0, this.xy + this.zw, this.xz - this.yw, this.xw + this.yz);
                let B = _Q_2.set(0, this.xy - this.zw, this.xz + this.yw, this.xw - this.yz);
                A.mulsl(r.l).mulsrconj(r.l);
                B.mulslconj(r.r).mulsr(r.r);
                this.xy = (A.y + B.y) * 0.5; this.xz = (A.z + B.z) * 0.5; this.xw = (A.w + B.w) * 0.5, A.w - B.w, B.z - A.z, A.y - B.y
                return this;
            }
            /** return a random oriented simple normalized bivector */
            static rand(): Bivec {
                // sampled in isoclinic space uniformly for left and right part respectively
                let a = _vec3_1.randset().mulfs(0.5);
                let b = _vec3_2.randset().mulfs(0.5);
                return new Bivec(a.x + b.x, a.y + b.y, a.z + b.z, a.z - b.z, b.y - a.y, a.x - b.x);
            }
            /** return a random oriented simple normalized bivector by seed */
            static srand(seed: Srand): Bivec {
                let a = _vec3_1.srandset(seed).mulfs(0.5);
                let b = _vec3_2.srandset(seed).mulfs(0.5);
                return new Bivec(a.x + b.x, a.y + b.y, a.z + b.z, a.z - b.z, b.y - a.y, a.x - b.x);
            }
        }

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
            mul(q: Quaternion): Quaternion {
                return new Quaternion(
                    this.x * q.x - this.y * q.y - this.z * q.z - this.w * q.w,
                    this.x * q.y + this.y * q.x + this.z * q.w - this.w * q.z,
                    this.x * q.z - this.y * q.w + this.z * q.x + this.w * q.y,
                    this.x * q.w + this.y * q.z - this.z * q.y + this.w * q.x
                );
            }
            /** this = this * q; */
            mulsr(q: Quaternion): Quaternion {
                var x = this.x * q.x - this.y * q.y - this.z * q.z - this.w * q.w;
                var y = this.x * q.y + this.y * q.x + this.z * q.w - this.w * q.z;
                var z = this.x * q.z - this.y * q.w + this.z * q.x + this.w * q.y;
                this.w = this.x * q.w + this.y * q.z - this.z * q.y + this.w * q.x;
                this.x = x; this.y = y; this.z = z; return this;
            }
            /** this = q * this; */
            mulsl(q: Quaternion): Quaternion {
                var x = q.x * this.x - q.y * this.y - q.z * this.z - q.w * this.w;
                var y = q.x * this.y + q.y * this.x + q.z * this.w - q.w * this.z;
                var z = q.x * this.z - q.y * this.w + q.z * this.x + q.w * this.y;
                this.w = q.x * this.w + q.y * this.z - q.z * this.y + q.w * this.x;
                this.x = x; this.y = y; this.z = z; return this;
            }
            /** this = this * conj(q); */
            mulsrconj(q: Quaternion): Quaternion {
                var x = this.x * q.x + this.y * q.y + this.z * q.z + this.w * q.w;
                var y = -this.x * q.y + this.y * q.x - this.z * q.w + this.w * q.z;
                var z = -this.x * q.z + this.y * q.w + this.z * q.x - this.w * q.y;
                this.w = -this.x * q.w - this.y * q.z + this.z * q.y + this.w * q.x;
                this.x = x; this.y = y; this.z = z; return this;
            }
            /** this = conj(q) * this; */
            mulslconj(q: Quaternion): Quaternion {
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
            toMat3cpy(m:Mat3): Mat3 {
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
                return m.set(
                    1 - (y2 + z2), xy - wz, xz + wy,
                    xy + wz, 1 - x2 - z2, yz - wx,
                    xz - wy, yz + wx, 1 - x2 - y2
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
            toLMat4cpy(m:Mat4): Mat4 {
                return m.set(
                    this.x, -this.y, -this.z, -this.w,
                    this.y, this.x, -this.w, this.z,
                    this.z, this.w, this.x, -this.y,
                    this.w, -this.z, this.y, this.x
                );
            }
            toRMat4cpy(m:Mat4): Mat4 {
                return m.set(
                    this.x, -this.y, -this.z, -this.w,
                    this.y, this.x, this.w, -this.z,
                    this.z, -this.w, this.x, this.y,
                    this.w, this.z, -this.y, this.x
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
            toRotateMatcpy(m:Mat4): Mat4 {
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
                return m.set(
                    1 - (y2 + z2), xy - wz, xz + wy, 0,
                    xy + wz, 1 - x2 - z2, yz - wx, 0,
                    xz - wy, yz + wx, 1 - x2 - y2, 0,
                    0, 0, 0, 1
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
        }
        export class Rotor {
            l: Quaternion;
            r: Quaternion;
            constructor(l: Quaternion = new Quaternion(), r: Quaternion = new Quaternion()) {
                this.l = l;
                this.r = r;
            }
            copy(r: Rotor): Rotor {
                this.l.copy(r.l);
                this.r.copy(r.r);
                return this;
            }
            conj(): Rotor {
                return new Rotor(this.l.conj(), this.r.conj());
            }
            conjs(): Rotor {
                this.l.conjs(), this.r.conjs(); return this;
            }
            norms(): Rotor {
                this.l.norms();
                this.r.norms();
                return this;
            }
            mul(R: Rotor): Rotor {
                return new Rotor(this.l.mul(R.l), R.r.mul(this.r));
            }
            /** Apply this to R: this = this * R;
             * 
             * [this.l, this.r] = [this.l * R.l, R.r * this.r]; */
            mulsr(R: Rotor): Rotor {
                this.l.mulsr(R.l);
                this.r.mulsl(R.r);
                return this;
            }
            /** Apply R to this: this = R * this;
             * 
             * [this.l, this.r] = [R.l * this.l, this.r * R.r]; */
            mulsl(R: Rotor): Rotor {
                this.l.mulsl(R.l);
                this.r.mulsr(R.r);
                return this;
            }
            /** Apply this to R: this = this * conj(R);
             * 
             * [this.l, this.r] = [this.l * conj(R.l), conj(R.r) * this.r]; */
            mulsrconj(R: Rotor): Rotor {
                this.l.mulsrconj(R.l);
                this.r.mulslconj(R.r);
                return this;
            }
            /** Apply R to this: this = conj(R) * this;
             * 
             * [this.l, this.r] = [conj(R.l) * this.l, this.r * conj(R.r)]; */
            mulslconj(R: Rotor): Rotor {
                this.l.mulslconj(R.l);
                this.r.mulsrconj(R.r);
                return this;
            }
            sqrt(): Rotor {
                return new Rotor(this.l.sqrt(), this.r.sqrt());
            }
            log(): Bivec {
                let a: Vec3, b: Vec3;
                if (Math.abs(this.l.x) > 0.9999) {
                    a = this.l.yzw();
                } else {
                    let ls = Math.acos(this.l.x);
                    a = this.l.yzw().mulfs(ls / Math.sin(ls));
                }
                if (Math.abs(this.r.x) > 0.9999) {
                    b = this.r.yzw();
                } else {
                    let rs = Math.acos(this.r.x);
                    b = this.r.yzw().mulfs(rs / Math.sin(rs));
                }
                return new Bivec(
                    a.x + b.x, a.y + b.y, a.z + b.z, a.z - b.z, b.y - a.y, a.x - b.x
                );
            }
            static slerp(a: Rotor, b: Rotor, t: number): Rotor {
                return new Rotor(
                    Quaternion.slerp(a.l, b.l, t),
                    Quaternion.slerp(a.r, b.r, t)
                );
            }
            toMat4(): Mat4 {
                return this.l.toLMat4().muls(this.r.toRMat4cpy(_mat4));
            }
            toMat4cpy(m:Mat4): Mat4 {
                return this.l.toLMat4cpy(m).muls(this.r.toRMat4cpy(_mat4));
            }
            /** plane must be a unit simple vector, if not, use Bivec.exp() instead 
             * angle1 is rotation angle on the plane
             * angle2 is rotatoin angle on the perpendicular plane (right handed, eg: exy + ezw)
            */
            static fromPlane(plane: Bivec, angle1: number, angle2: number = 0): Rotor {
                let a = (angle1 + angle2) * 0.5, sa = Math.sin(a);
                let b = (angle1 - angle2) * 0.5, sb = Math.sin(b);
                return new Rotor(// norm of half of A is 1
                    new Quaternion(Math.cos(a), sa * (plane.xy + plane.zw), sa * (plane.xz - plane.yw), sa * (plane.xw + plane.yz)),
                    new Quaternion(Math.cos(b), sb * (plane.xy - plane.zw), sb * (plane.xz + plane.yw), sb * (plane.xw - plane.yz))
                );
            }
            /** "from" and "to" must be normalized vectors*/
            static lookAt(from: Vec4, to: Vec4): Rotor {
                let right = from.wedge(to);
                let s = right.norm();
                let c = from.dot(to);
                if (s > 0.000001) { // not aligned
                    right.mulfs(-Math.atan2(s, c) / s);
                } else if (c < 0) { // almost n reversely aligned
                    let v = from.wedge(Vec4.x);
                    if (v.norm1() < 0.01) {
                        v = from.wedge(Vec4.y);
                    }
                    return v.norms().mulfs(_180).exp();
                }
                return right.exp();
            }
            // todo: lookAtb(from: Bivec, to: Bivec): Rotor
            static rand(): Rotor {
                return new Rotor(Quaternion.rand(), Quaternion.rand());
            }
            static srand(seed: Srand): Rotor {
                return new Rotor(Quaternion.srand(seed), Quaternion.srand(seed));
            }
            randset(): Rotor {
                this.l.randset();
                this.r.randset();
                return this;
            }
            srandset(seed: Srand): Rotor {
                this.l.srandset(seed);
                this.r.srandset(seed);
                return this;
            }
        }
        export class Multivec {
            /** float scalar part */
            f: number;
            /** vector part */
            v: Vec4;
            /** bivector part */
            b: Bivec;
            /** trivector (pseudo vector) part Vec4(-yzw, zwx, -wxy, xyz) */
            t: Vec4;
            /** pseudo scalar part exyzw */
            i: number;
            constructor(
                f: number = 0, v: Vec4 = new Vec4(), b: Bivec = new Bivec(),
                t: Vec4 = new Vec4(), i: number = 0
            ) {
                this.f = f; this.v = v; this.b = b;
                this.t = t; this.i = i;
            }
            conj(): Multivec {
                return new Multivec(this.f, this.v.clone(), this.b.neg(), this.t.neg(), this.i);
            }
            conjs(): Multivec {
                this.b.negs(); this.t.negs();
                return this;
            }
            add(m: Multivec): Multivec {
                return new Multivec(
                    this.f + m.f, this.v.add(m.v), this.b.add(m.b), this.t.add(m.t), this.i + m.i
                );
            }
            adds(m: Multivec): Multivec {
                this.v.adds(m.v); this.b.adds(m.b); this.t.adds(m.t);
                this.f += m.f; this.i += m.i; return this;
            }
            sub(m: Multivec): Multivec {
                return new Multivec(
                    this.f - m.f, this.v.sub(m.v), this.b.sub(m.b), this.t.sub(m.t), this.i - m.i
                );
            }
            subs(m: Multivec): Multivec {
                this.v.subs(m.v); this.b.subs(m.b); this.t.subs(m.t);
                this.f -= m.f; this.i -= m.i; return this;
            }
            mulf(k: number): Multivec {
                return new Multivec(this.f * k, this.v.mulf(k), this.b.mulf(k), this.t.mulf(k), this.i * k);
            }
            mulfs(k: number): Multivec {
                this.v.mulfs(k); this.b.mulfs(k); this.t.mulfs(k);
                this.f *= k; this.i *= k; return this;
            }
            mul(m: Multivec): Multivec {
                return new Multivec(
                    //00 11 22 33 44
                    this.f * m.f + this.v.dot(m.v) - this.b.dot(m.b) - this.t.dot(m.t) + this.i * m.i,
                    //10 01 12 21 23 32 34 43 
                    this.v.mulf(m.f).adds(m.v.mulf(this.f)).adds(this.v.dotb(m.b)).adds(this.b.dotv(m.v))
                        .adds(this.b.wedgev(m.t)).adds(m.b.wedgev(this.t)).subs(this.t.mulf(m.i)).subs(m.t.mulf(this.i)),
                    //02 20 22 11 13 31 24 42 33
                    this.b.mulf(m.f).adds(m.b.mulf(this.f)).adds(this.v.wedge(m.v)).adds(this.b.cross(m.b))
                        .adds(this.v.wedge(m.t).duals()).adds(m.v.wedge(this.t).duals())
                        .subs(this.b.dual().mulfs(m.i)).subs(m.b.dual().mulfs(this.i)).adds(this.t.wedge(m.t)),
                    //03 30 12 21 14 41 23 32
                    this.t.mulf(m.f).adds(m.t.mulf(this.f)).adds(this.b.wedgev(m.v)).adds(m.b.wedgev(this.v))
                        .adds(this.v.mulf(m.i)).adds(m.v.mulf(this.i)).adds(this.b.wedgev(m.t)).adds(m.b.wedgev(this.t)),
                    //04 40 22 13 31
                    this.f * m.i + this.i * m.f + this.b.wedge(m.b) + this.v.dot(m.t) + this.t.dot(m.v)
                )
            }
        }
    }
}