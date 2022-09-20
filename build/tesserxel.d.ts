/// <reference types="dist" />
declare namespace tesserxel {
    namespace math {
        const _180: number;
        const _30: number;
        const _60: number;
        const _45: number;
        const _90: number;
        const _360: number;
        const _DEG2RAD: number;
        const _RAD2DEG: number;
        const _COS30: number;
        const _TAN30: number;
        const _GOLDRATIO: number;
        class Srand {
            _seed: number;
            constructor(seed: number);
            set(seed: number): void;
            /** return a random float in [0,1] */
            nextf(): number;
            /** return a random int of [0,n-1] if n is given, else range is same as int */
            nexti(n?: number): number;
        }
        function generateUUID(): string;
        abstract class Pool<T> {
            objects: T[];
            abstract constructObject(): T;
            pop(): T;
            push(...args: T[]): void;
            resize(size: number): this;
        }
        class Vec2Pool extends Pool<Vec2> {
            constructObject(): Vec2;
        }
        class Vec3Pool extends Pool<Vec3> {
            constructObject(): Vec3;
        }
        class Vec4Pool extends Pool<Vec4> {
            constructObject(): Vec4;
        }
        class BivecPool extends Pool<Bivec> {
            constructObject(): Bivec;
        }
        class Mat2Pool extends Pool<Mat2> {
            constructObject(): Mat2;
        }
        class Mat3Pool extends Pool<Mat3> {
            constructObject(): Mat3;
        }
        class Mat4Pool extends Pool<Mat4> {
            constructObject(): Mat4;
        }
        class QuaternionPool extends Pool<Quaternion> {
            constructObject(): Quaternion;
        }
        class RotorPool extends Pool<Rotor> {
            constructObject(): Rotor;
        }
        const vec2Pool: Vec2Pool;
        const vec3Pool: Vec3Pool;
        const vec4Pool: Vec4Pool;
        const bivecPool: BivecPool;
        const mat2Pool: Mat2Pool;
        const mat3Pool: Mat3Pool;
        const mat4Pool: Mat4Pool;
        const qPool: QuaternionPool;
        const rotorPool: RotorPool;
    }
}
declare namespace tesserxel {
    namespace math {
        /** [A(4x4), b(1x4)]
         *
         *  [0(4x1), 1(1x1)]
         *
         *  a blocked 5x5 matrix for transform in 4d
         */
        class AffineMat4 {
            mat: Mat4;
            vec: Vec4;
            constructor(mat?: Mat4, vec?: Vec4);
            writeBuffer(b: Float32Array, offset?: number): void;
            inv(): AffineMat4;
            invs(): AffineMat4;
            mul(m: AffineMat4): AffineMat4;
            /** this = this * m */
            mulsr(m: AffineMat4): AffineMat4;
            /** this = m * this */
            mulsl(m: AffineMat4): AffineMat4;
            setFromObj4(o: Obj4): this;
            setFromObj4inv(o: Obj4): this;
        }
        /** an coordinate transform of rotation translation and scale */
        class Obj4 {
            position: Vec4;
            rotation: Rotor;
            scale: Vec4;
            constructor(position?: Vec4, rotation?: Rotor, scale?: Vec4);
            copyObj4(o: math.Obj4): this;
            local2world(point: Vec4): Vec4;
            world2local(point: Vec4): Vec4;
            getMat4(): Mat4;
            getMat4inv(): Mat4;
            getAffineMat4(): AffineMat4;
            getAffineMat4inv(): AffineMat4;
            translates(v: Vec4): Obj4;
            rotates(r: Rotor): Obj4;
            rotatesb(b: Bivec): Obj4;
            rotatesAt(r: Rotor, center?: Vec4): Obj4;
            lookAt(direction: Vec4, target: Vec4): this;
        }
    }
}
declare namespace tesserxel {
    namespace math {
        class Complex {
            re: number;
            im: number;
            static i: Complex;
            constructor(re?: number, im?: number);
            flat(): number[];
            set(v: Complex): Complex;
            setv(v: Vec2): Complex;
            clone(): Complex;
            add(v2: Complex): Complex;
            addf(v2: number): Complex;
            adds(v2: Complex): Complex;
            addfs(v2: number): Complex;
            neg(): Complex;
            negs(): Complex;
            sub(v2: Complex): Complex;
            subf(v2: number): Complex;
            subs(v2: Complex): Complex;
            subfs(v2: number): Complex;
            mulf(v2: number): Complex;
            mulfs(v2: number): Complex;
            mul(k: Complex): Complex;
            muls(k: Complex): Complex;
            divf(v2: number): Complex;
            divfs(v2: number): Complex;
            div(k: Complex): Complex;
            divs(k: Complex): Complex;
            dot(v2: Complex): number;
            norm(): number;
            norms(): Complex;
            normsqr(): number;
            conj(): Complex;
            conjs(): Complex;
            exp(): Complex;
            exps(): Complex;
            arg(): number;
            log(): Complex;
            logs(): Complex;
            pow(p: Complex): Complex;
            powf(n: number): Complex;
            pows(p: Complex): Complex;
            powfs(n: number): Complex;
        }
        class CMat2 {
        }
    }
}
declare namespace tesserxel {
    namespace math {
        class Matrix {
            elem: Float32Array;
            row: number;
            col: number;
            length: number;
            constructor(r: number, c?: number);
            static id(r: number): Matrix;
            set(...args: number[]): this;
            copy(src: Matrix): this;
            clone(m: Matrix): Matrix;
            adds(m: Matrix): this;
            subs(m: Matrix): this;
            mulfs(k: number): this;
            divfs(k: number): this;
            at(r: number, c: number): number;
            setAt(value: number, r: number, c: number): this;
            static subMatrix(startRow: number, startCol: number, rowCount: number, colCout: number): void;
        }
    }
}
/**  ga.ts: Geometry Algebra
 *   Bivec|Quaternion|Rotor|Multivector
 *   author: Hqak (wxyhly)
 */
declare namespace tesserxel {
    namespace math {
        class Bivec {
            xy: number;
            xz: number;
            xw: number;
            yz: number;
            yw: number;
            zw: number;
            static readonly xy: Bivec;
            static readonly xz: Bivec;
            static readonly xw: Bivec;
            static readonly yz: Bivec;
            static readonly yw: Bivec;
            static readonly zw: Bivec;
            static readonly yx: Bivec;
            static readonly zx: Bivec;
            static readonly wx: Bivec;
            static readonly zy: Bivec;
            static readonly wy: Bivec;
            static readonly wz: Bivec;
            constructor(xy?: number, xz?: number, xw?: number, yz?: number, yw?: number, zw?: number);
            copy(v: Bivec): Bivec;
            set(xy?: number, xz?: number, xw?: number, yz?: number, yw?: number, zw?: number): Bivec;
            clone(): Bivec;
            flat(): number[];
            add(bv: Bivec): Bivec;
            adds(bv: Bivec): Bivec;
            addset(bv1: Bivec, bv2: Bivec): Bivec;
            addmulfs(bv: Bivec, k: number): Bivec;
            neg(): Bivec;
            negs(): Bivec;
            sub(bv: Bivec): Bivec;
            subs(bv: Bivec): Bivec;
            subset(bv1: Bivec, bv2: Bivec): Bivec;
            mulf(k: number): Bivec;
            mulfs(k: number): Bivec;
            divf(k: number): Bivec;
            divfs(k: number): Bivec;
            dot(biv: Bivec): number;
            norm(): number;
            norms(): Bivec;
            normsqr(): number;
            norm1(): number;
            wedge(biv: Bivec): number;
            dual(): Bivec;
            duals(): Bivec;
            wedgev(V: Vec4): Vec4;
            wedgevvset(v1: Vec4, v2: Vec4): Bivec;
            /** Vector part of Geometry Product
             * exy * ey = ex, exy * ex = -ey, exy * ez = 0
             *  */
            dotv(V: Vec4): Vec4;
            cross(V: Bivec): Bivec;
            crossrs(V: Bivec): Bivec;
            exp(): Rotor;
            /** return two angles [max, min] between a and b
             * "a" and "b" must be normalized simple bivectors*/
            static angle(a: Bivec, b: Bivec): number[];
            rotate(r: Rotor): Bivec;
            rotates(r: Rotor): Bivec;
            rotatesconj(r: Rotor): Bivec;
            rotateset(bivec: Bivec, r: Rotor): Bivec;
            /** return a random oriented simple normalized bivector */
            static rand(): Bivec;
            randset(): Bivec;
            /** return a random oriented simple normalized bivector by seed */
            static srand(seed: Srand): Bivec;
            srandset(seed: Srand): Bivec;
            pushPool(pool?: BivecPool): void;
        }
        class Quaternion {
            x: number;
            y: number;
            z: number;
            w: number;
            constructor(x?: number, y?: number, z?: number, w?: number);
            set(x?: number, y?: number, z?: number, w?: number): Quaternion;
            flat(): number[];
            copy(v: Vec4 | Quaternion): Quaternion;
            yzw(): Vec3;
            ywz(): Vec3;
            zyw(): Vec3;
            zwy(): Vec3;
            wzy(): Vec3;
            wyz(): Vec3;
            wxyz(): Vec4;
            wxzy(): Vec4;
            wyxz(): Vec4;
            wzxy(): Vec4;
            yxzw(): Vec4;
            xzwy(): Vec4;
            xyzw(): Vec4;
            clone(): Quaternion;
            neg(): Quaternion;
            negs(): Quaternion;
            mul(q: Quaternion | Vec4): Quaternion;
            /** this = this * q; */
            mulsr(q: Quaternion | Vec4): Quaternion;
            /** this = q * this; */
            mulsl(q: Quaternion | Vec4): Quaternion;
            /** this = this * conj(q); */
            mulsrconj(q: Quaternion | Vec4): Quaternion;
            /** this = conj(q) * this; */
            mulslconj(q: Quaternion | Vec4): Quaternion;
            conj(): Quaternion;
            conjs(): Quaternion;
            norm(): number;
            norms(): Quaternion;
            /** axis must be a unit vector, if not, use Vec3.exp() instead */
            static fromAxis(axis: Vec3, angle: number): Quaternion;
            sqrt(): Quaternion;
            sqrts(): Quaternion;
            /** get generator of this, Quaternion must be normalized */
            log(): Vec3;
            static slerp(a: Quaternion, b: Quaternion, t: number): Quaternion;
            toRotateMat(): Mat4;
            toMat3(): Mat3;
            toLMat4(): Mat4;
            toRMat4(): Mat4;
            expset(v: Vec3): Quaternion;
            static rand(): Quaternion;
            static srand(seed: Srand): Quaternion;
            randset(): Quaternion;
            srandset(seed: Srand): Quaternion;
            pushPool(pool?: QuaternionPool): void;
        }
        class Rotor {
            l: Quaternion;
            r: Quaternion;
            constructor(l?: Quaternion, r?: Quaternion);
            clone(): Rotor;
            copy(r: Rotor): Rotor;
            conj(): Rotor;
            conjs(): Rotor;
            norms(): Rotor;
            /** Apply this to R: this * R;
             *
             * [this.l * R.l, R.r * this.r]; */
            mul(R: Rotor): Rotor;
            /** Apply this to R: this = this * R;
             *
             * [this.l, this.r] = [this.l * R.l, R.r * this.r]; */
            mulsr(R: Rotor): Rotor;
            /** Apply R to this: this = R * this;
             *
             * [this.l, this.r] = [R.l * this.l, this.r * R.r]; */
            mulsl(R: Rotor): Rotor;
            /** Apply this to R: this = this * conj(R);
             *
             * [this.l, this.r] = [this.l * conj(R.l), conj(R.r) * this.r]; */
            mulsrconj(R: Rotor): Rotor;
            /** Apply R to this: this = conj(R) * this;
             *
             * [this.l, this.r] = [conj(R.l) * this.l, this.r * conj(R.r)]; */
            mulslconj(R: Rotor): Rotor;
            sqrt(): Rotor;
            isFinite(): boolean;
            expset(bivec: Bivec): Rotor;
            log(): Bivec;
            static slerp(a: Rotor, b: Rotor, t: number): Rotor;
            toMat4(): Mat4;
            /** plane must be a unit simple vector, if not, use Bivec.exp() instead
             * angle1 is rotation angle on the plane
             * angle2 is rotatoin angle on the perpendicular plane (right handed, eg: exy + ezw)
            */
            static fromPlane(plane: Bivec, angle1: number, angle2?: number): Rotor;
            /** "from" and "to" must be normalized vectors*/
            static lookAt(from: Vec4, to: Vec4): Rotor;
            /** "from" and "to" must be normalized vectors*/
            setFromLookAt(from: Vec4, to: Vec4): Rotor;
            static lookAtvb(from: Vec4, to: Bivec): Rotor;
            static rand(): Rotor;
            static srand(seed: Srand): Rotor;
            randset(): Rotor;
            srandset(seed: Srand): Rotor;
            pushPool(pool?: RotorPool): void;
            /** set rotor from a rotation matrix,
             * i.e. m must be orthogonal with determinant 1.
             * algorithm: iteratively aligne each axis. */
            setFromMat4(m: Mat4): Rotor;
            fromMat4(m: Mat4): Rotor;
        }
        let _biv: Bivec;
        let _r: Rotor;
    }
}
/**  mat.ts: Matrix2|3|4
 *   author: Hqak (wxyhly)
 *   some codes are from lib three.js (e.g. Mat4.inv)
 */
declare namespace tesserxel {
    namespace math {
        class Mat2 {
            elem: number[];
            static id: Mat2;
            static zero: Mat2;
            static diag(a: number, b: number): Mat2;
            constructor(a?: number, b?: number, c?: number, d?: number);
            set(a?: number, b?: number, c?: number, d?: number): Mat2;
            setid(): this;
            ts(): Mat2;
            t(): Mat2;
            copy(m2: Mat2): Mat2;
            add(m2: Mat2): Mat2;
            adds(m2: Mat2): Mat2;
            neg(): Mat2;
            negs(): Mat2;
            sub(m2: Mat2): Mat2;
            subs(m2: Mat2): Mat2;
            mulf(k: number): Mat2;
            mulfs(k: number): Mat2;
            mulv(v: Vec2): Vec2;
            mul(m: Mat2): Mat2;
            muls(m: Mat2): Mat2;
            inv(): Mat2;
            invs(): Mat2;
            pushPool(pool?: Mat2Pool): void;
        }
        class Mat3 {
            elem: number[];
            static id: Mat3;
            static zero: Mat3;
            static diag(a: number, b: number, c: number): Mat3;
            constructor(a?: number, b?: number, c?: number, d?: number, e?: number, f?: number, g?: number, h?: number, i?: number);
            set(a?: number, b?: number, c?: number, d?: number, e?: number, f?: number, g?: number, h?: number, i?: number): Mat3;
            setid(): Mat3;
            ts(): Mat3;
            t(): Mat3;
            copy(m2: Mat3): Mat3;
            add(m2: Mat3): Mat3;
            adds(m2: Mat3): Mat3;
            neg(): Mat3;
            negs(): Mat3;
            sub(m2: Mat3): Mat3;
            subs(m2: Mat3): Mat3;
            mulf(k: number): Mat3;
            mulfs(k: number): Mat3;
            mulv(v: Vec3): Vec3;
            mul(m: Mat3): Mat3;
            muls(m: Mat3): Mat3;
            inv(): Mat3;
            invs(): Mat3;
            setFromRotaion(q: Quaternion): Mat3;
            pushPool(pool?: Mat3Pool): void;
        }
        class Mat4 {
            elem: number[];
            static readonly id: Mat4;
            static readonly zero: Mat4;
            static diag(a: number, b: number, c: number, d: number): Mat4;
            static augVec4(a: Vec4, b: Vec4, c: Vec4, d: Vec4): Mat4;
            static augMat3(a: Mat3, b: Vec3, c: Vec3, d: number): Mat4;
            augVec4set(a: Vec4, b: Vec4, c: Vec4, d: Vec4): Mat4;
            augMat3set(a: Mat3, b: Vec3, c: Vec3, d: number): Mat4;
            constructor(a?: number, b?: number, c?: number, d?: number, e?: number, f?: number, g?: number, h?: number, i?: number, j?: number, k?: number, l?: number, m?: number, n?: number, o?: number, p?: number);
            clone(): Mat4;
            writeBuffer(b: Float32Array, offset?: number): void;
            setid(): this;
            set(a?: number, b?: number, c?: number, d?: number, e?: number, f?: number, g?: number, h?: number, i?: number, j?: number, k?: number, l?: number, m?: number, n?: number, o?: number, p?: number): this;
            ts(): Mat4;
            t(): Mat4;
            /** col vector */ x_(): Vec4;
            /** col vector */ y_(): Vec4;
            /** col vector */ z_(): Vec4;
            /** col vector */ w_(): Vec4;
            /** row vector */ _x(): Vec4;
            /** row vector */ _y(): Vec4;
            /** row vector */ _z(): Vec4;
            /** row vector */ _w(): Vec4;
            copy(m2: Mat4): Mat4;
            add(m2: Mat4): Mat4;
            adds(m2: Mat4): Mat4;
            neg(): Mat4;
            negs(): Mat4;
            sub(m2: Mat4): Mat4;
            subs(m2: Mat4): Mat4;
            mulf(k: number): Mat4;
            mulfs(k: number): Mat4;
            mulv(v: Vec4): Vec4;
            mul(m: Mat4): Mat4;
            /** this = this * m; */
            mulsr(m: Mat4): Mat4;
            /** this = m * this; */
            mulsl(m: Mat4): Mat4;
            /** this = m1 * m2; */
            mulset(m1: Mat4, m2: Mat4): Mat4;
            setFrom3DRotation(q: Quaternion): Mat4;
            setFromQuaternionL(q: Quaternion): Mat4;
            setFromQuaternionR(q: Quaternion): Mat4;
            setFromRotor(r: Rotor): Mat4;
            setFromRotorconj(r: Rotor): Mat4;
            det(): number;
            inv(): Mat4;
            invs(): Mat4;
            pushPool(pool?: Mat4Pool): void;
        }
        interface PerspectiveCamera {
            fov: number;
            near: number;
            far: number;
            /** aspect = width / height = depth / height */
            aspect?: number;
        }
        /** Caution: This function calculates PerspectiveMatrix for 0-1 depth range */
        function getPerspectiveMatrix(c: PerspectiveCamera): {
            /** used for 3d */
            mat4: Mat4;
            /** used for 4d because of lack of mat5x5 */
            vec4: Vec4;
        };
        let _mat2: Mat2;
        let _mat3: Mat3;
        let _mat4: Mat4;
    }
}
/**  vec.ts: Vector2|3|4
 *   author: Hqak (wxyhly)
 */
declare namespace tesserxel {
    namespace math {
        class Vec2 {
            x: number;
            y: number;
            static readonly x: Vec2;
            static readonly y: Vec2;
            constructor(x?: number, y?: number);
            flat(): number[];
            writeBuffer(b: Float32Array, offset?: number): void;
            set(x?: number, y?: number): Vec2;
            copy(v: Vec2): Vec2;
            copyc(v: Complex): Vec2;
            clone(): Vec2;
            add(v2: Vec2): Vec2;
            addset(v1: Vec2, v2: Vec2): Vec2;
            addf(v2: number): Vec2;
            adds(v2: Vec2): Vec2;
            addfs(v2: number): Vec2;
            /** this += v * k */
            addmulfs(v: Vec2, k: number): this;
            neg(): Vec2;
            negs(): Vec2;
            sub(v2: Vec2): Vec2;
            subset(v1: Vec2, v2: Vec2): Vec2;
            subf(v2: number): Vec2;
            subs(v2: Vec2): Vec2;
            subfs(v2: number): Vec2;
            mulf(v2: number): Vec2;
            mulfs(v2: number): Vec2;
            mul(v2: Vec2): Vec2;
            muls(v2: Vec2): Vec2;
            divf(v2: number): Vec2;
            divfs(v2: number): Vec2;
            div(v2: Vec2): Vec2;
            divs(v2: Vec2): Vec2;
            dot(v2: Vec2): number;
            norm(): number;
            norms(): Vec2;
            normsqr(): number;
            norm1(): number;
            norminf(): number;
            normi(i: number): number;
            wedge(v2: Vec2): number;
            rotate(angle: number): Vec2;
            rotates(angle: number): Vec2;
            static rand(): Vec2;
            static srand(seed: Srand): Vec2;
            pushPool(pool?: Vec2Pool): void;
        }
        class Vec3 {
            x: number;
            y: number;
            z: number;
            static readonly x: Vec3;
            static readonly y: Vec3;
            static readonly z: Vec3;
            constructor(x?: number, y?: number, z?: number);
            flat(): number[];
            writeBuffer(b: Float32Array, offset?: number): void;
            copy(v: Vec3): Vec3;
            set(x?: number, y?: number, z?: number): Vec3;
            xy(): Vec2;
            yx(): Vec2;
            xz(): Vec2;
            yz(): Vec2;
            zy(): Vec2;
            yzx(): Vec3;
            yxz(): Vec3;
            zyx(): Vec3;
            zxy(): Vec3;
            xzy(): Vec3;
            xyz0(): Vec4;
            clone(): Vec3;
            add(v2: Vec3): Vec3;
            addset(v1: Vec3, v2: Vec3): Vec3;
            addf(v2: number): Vec3;
            adds(v2: Vec3): Vec3;
            addfs(v2: number): Vec3;
            /** this += v * k */
            addmulfs(v: Vec3, k: number): this;
            neg(): Vec3;
            negs(): Vec3;
            sub(v2: Vec3): Vec3;
            subset(v1: Vec3, v2: Vec3): Vec3;
            subf(v2: number): Vec3;
            subs(v2: Vec3): Vec3;
            subfs(v2: number): Vec3;
            mulf(v2: number): Vec3;
            mulfs(v2: number): Vec3;
            mul(v2: Vec3): Vec3;
            muls(v2: Vec3): Vec3;
            divf(v2: number): Vec3;
            divfs(v2: number): Vec3;
            div(v2: Vec3): Vec3;
            divs(v2: Vec3): Vec3;
            dot(v2: Vec3): number;
            norm(): number;
            norms(): Vec3;
            normsqr(): number;
            norm1(): number;
            norminf(): number;
            normi(i: number): number;
            wedge(v3: Vec3): Vec3;
            /** this.set(v1 ^ v2) */
            wedgeset(v1: Vec3, v2: Vec3): Vec3;
            /** this = this ^ v */
            wedgesr(v: Vec3): Vec3;
            exp(): Quaternion;
            rotate(q: Quaternion): Vec3;
            rotates(q: Quaternion): Vec3;
            randset(): Vec3;
            srandset(seed: Srand): Vec3;
            static rand(): Vec3;
            static srand(seed: Srand): Vec3;
            reflect(normal: Vec3): Vec3;
            reflects(normal: Vec3): Vec3;
            pushPool(pool?: Vec3Pool): void;
        }
        class Vec4 {
            x: number;
            y: number;
            z: number;
            w: number;
            static readonly x: Vec4;
            static readonly y: Vec4;
            static readonly z: Vec4;
            static readonly w: Vec4;
            static readonly origin: Vec4;
            static readonly xNeg: Vec4;
            static readonly yNeg: Vec4;
            static readonly zNeg: Vec4;
            static readonly wNeg: Vec4;
            constructor(x?: number, y?: number, z?: number, w?: number);
            flat(): number[];
            writeBuffer(b: Float32Array, offset?: number): void;
            copy(v: Vec4 | Quaternion): Vec4;
            set(x?: number, y?: number, z?: number, w?: number): Vec4;
            ywx(): Vec3;
            yxw(): Vec3;
            yzw(): Vec3;
            ywz(): Vec3;
            yzx(): Vec3;
            yxz(): Vec3;
            zwx(): Vec3;
            zxw(): Vec3;
            zyw(): Vec3;
            zwy(): Vec3;
            zyx(): Vec3;
            zxy(): Vec3;
            xzy(): Vec3;
            xyz(): Vec3;
            xwy(): Vec3;
            xyw(): Vec3;
            xzw(): Vec3;
            xwz(): Vec3;
            wxy(): Vec3;
            wyx(): Vec3;
            wzy(): Vec3;
            wyz(): Vec3;
            wxz(): Vec3;
            wzx(): Vec3;
            wxyz(): Vec4;
            wxzy(): Vec4;
            wyxz(): Vec4;
            wzxy(): Vec4;
            yxzw(): Vec4;
            xzwy(): Vec4;
            clone(): Vec4;
            add(v2: Vec4): Vec4;
            addset(v1: Vec4, v2: Vec4): Vec4;
            addf(v2: number): Vec4;
            adds(v2: Vec4): Vec4;
            addfs(v2: number): Vec4;
            neg(): Vec4;
            negs(): Vec4;
            sub(v2: Vec4): Vec4;
            subset(v1: Vec4, v2: Vec4): Vec4;
            subf(v2: number): Vec4;
            subs(v2: Vec4): Vec4;
            subfs(v2: number): Vec4;
            mulf(v2: number): Vec4;
            mulfs(v2: number): Vec4;
            mulmatvset(mat4: Mat4, v: Vec4): Vec4;
            /** this += v * k */
            addmulfs(v: Vec4, k: number): this;
            mul(v2: Vec4): Vec4;
            muls(v2: Vec4): Vec4;
            divf(v2: number): Vec4;
            divfs(v2: number): Vec4;
            div(v2: Vec4): Vec4;
            divs(v2: Vec4): Vec4;
            dot(v2: Vec4): number;
            norm(): number;
            norms(): Vec4;
            normsqr(): number;
            norm1(): number;
            norminf(): number;
            normi(i: number): number;
            wedge(V: Vec4): Bivec;
            wedgevbset(v: Vec4, bivec: Bivec): Vec4;
            wedgeb(bivec: Bivec): Vec4;
            /** Vector part of Geometry Product
             * ey * exy = -ex, ex * exy = ey, ex * eyz = 0
             *  */
            dotb(B: Bivec): Vec4;
            /** this = this * b;
             *  Vector part of Geometry Product
             *  ey * exy = -ex, ex * exy = ey, ex * eyz = 0
             *  */
            dotbsr(B: Bivec): Vec4;
            dotbset(v: Vec4, B: Bivec): Vec4;
            /** this = mat * this */
            mulmatls(mat4: Mat4): Vec4;
            rotate(r: Rotor): Vec4;
            rotates(r: Rotor): Vec4;
            rotateconj(r: Rotor): Vec4;
            rotatesconj(r: Rotor): Vec4;
            reflect(normal: Vec4): Vec4;
            reflects(normal: Vec4): Vec4;
            randset(): Vec4;
            srandset(seed: Srand): Vec4;
            /** project vector on a plane determined by bivector.
             * bivector b must be normalized and simple
             */
            projb(b: Bivec): Vec4;
            projbs(b: Bivec): Vec4;
            static rand(): Vec4;
            static srand(seed: Srand): Vec4;
            pushPool(pool?: Vec4Pool): void;
        }
        let _vec2: Vec2;
        let _vec3: Vec3;
        let _vec3_1: Vec3;
        let _vec3_2: Vec3;
        let _vec4: Vec4;
        let _vec4_1: Vec4;
        let _Q: Quaternion;
        let _Q_1: Quaternion;
        let _Q_2: Quaternion;
        type Vector = Vec2 | Vec3 | Vec4;
    }
}
declare namespace tesserxel {
    namespace math {
        class Ray {
            origin: Vec4;
            direction: Vec4;
        }
        export class Plane {
            /** normal need to be normalized */
            normal: Vec4;
            offset: number;
            constructor(normal: Vec4, offset: number);
            distanceToPoint(p: Vec4): void;
            /** regard r as an infinity line */
            distanceToLine(r: Ray): void;
        }
        export class AABB {
            min: Vec4;
            max: Vec4;
            testAABB(aabb: AABB): boolean;
            /** when intersected return 0, when aabb is along the normal direction return 1, otherwise -1 */
            testPlane(plane: Plane): 1 | -1 | 0;
            constructor();
            static fromPoints(points: Vec4[]): AABB;
        }
        export {};
    }
}
declare namespace tesserxel {
    namespace math {
        class Spline {
            points: Vec4[];
            derives: Vec4[];
            constructor(points: Vec4[], derives: Vec4[]);
            generate(seg: number): {
                points: Vec4[];
                rotors: Rotor[];
                curveLength: number[];
            };
            getValue(t: number): Vec4;
        }
    }
}
declare namespace tesserxel {
    namespace mesh {
        /** FaceMesh store traditional 2-face mesh as triangle or quad list
         *  This mesh is for constructing complex tetrameshes
         *  It is not aimed for rendering purpose
         */
        interface FaceMesh {
            quad?: {
                position: Float32Array;
                normal?: Float32Array;
                uv?: Float32Array;
            };
            triangle?: {
                position: Float32Array;
                normal?: Float32Array;
                uv?: Float32Array;
            };
        }
        interface FaceIndexMesh {
            position: Float32Array;
            normal?: Float32Array;
            uv?: Float32Array;
            quad?: {
                position: Uint32Array;
                normal?: Uint32Array;
                uv?: Uint32Array;
                count: number;
            };
            triangle?: {
                position: Uint32Array;
                normal?: Uint32Array;
                uv?: Uint32Array;
                count: number;
            };
        }
        namespace face {
            function sphere(u: any, v: any): void;
            function parametricSurface(fn: (inputUV: math.Vec2, outputPosition: math.Vec4, outputNormal: math.Vec4) => void, uSegment: number, vSegment: number): void;
        }
    }
}
declare namespace tesserxel {
    namespace mesh {
        /** Tetramesh store 4D mesh as tetrahedral list
         *  Each tetrahedral uses four vertices in the position list
         */
        interface TetraMesh {
            position: Float32Array;
            normal?: Float32Array;
            uvw?: Float32Array;
            tetraCount: number;
        }
        /** TetraIndexMesh is not supported for tetraslice rendering
         *  It is only used in data storage and mesh construction
         */
        interface TetraIndexMesh {
            position: Float32Array;
            normal?: Float32Array;
            uvw?: Float32Array;
            positionIndex: Uint32Array;
            normalIndex?: Uint32Array;
            uvwIndex?: Uint32Array;
            tetraCount: number;
        }
        namespace tetra {
            let cube: TetraMesh;
            function applyAffineMat4(mesh: TetraMesh, am: math.AffineMat4): TetraMesh;
            function applyObj4(mesh: TetraMesh, obj: math.Obj4): TetraMesh;
            function concat(mesh1: TetraMesh, mesh2: TetraMesh): TetraMesh;
            function concatarr(meshes: TetraMesh[]): TetraMesh;
            function clone(mesh: TetraMesh): TetraMesh;
            function tesseract(): TetraMesh;
            function inverseNormal(mesh: TetraMesh): TetraMesh;
            let hexadecachoron: TetraMesh;
            function glome(radius: number, xySegment: number, zwSegment: number, latitudeSegment: number): TetraMesh;
            function spheritorus(sphereRadius: number, longitudeSegment: number, latitudeSegment: number, circleRadius: number, circleSegment: number): TetraMesh;
            function torisphere(circleRadius: number, circleSegment: number, sphereRadius: number, longitudeSegment: number, latitudeSegment: number): TetraMesh;
            function tiger(xyRadius: number, xySegment: number, zwRadius: number, zwSegment: number, secondaryRadius: number, secondarySegment: number): TetraMesh;
            function parametricSurface(fn: (inputUVW: math.Vec3, outputPosition: math.Vec4, outputNormal: math.Vec4) => void, uSegment: number, vSegment: number, wSegment: number): TetraMesh;
            function convexhull(points: math.Vec4[]): {
                position: Float32Array;
                tetraCount: number;
            };
            function duocone(xyRadius: number, xySegment: number, zwRadius: number, zwSegment: number): {
                position: Float32Array;
                tetraCount: number;
            };
            function duocylinder(xyRadius: number, xySegment: number, zwRadius: number, zwSegment: number): {
                position: Float32Array;
                tetraCount: number;
            };
            function loft(sp: tesserxel.math.Spline, section: tesserxel.mesh.FaceMesh, step: number): tesserxel.mesh.TetraMesh;
        }
    }
}
declare namespace tesserxel {
    namespace physics {
        interface BroadPhaseConstructor {
            new (): BroadPhase;
        }
        type BroadPhaseList = [Rigid, Rigid][];
        abstract class BroadPhase {
            checkList: BroadPhaseList;
            protected clearCheckList(): void;
            abstract run(world: World): void;
        }
        class NaiveBroadPhase extends BroadPhase {
            run(world: World): void;
        }
        class IgnoreAllBroadPhase extends BroadPhase {
            run(world: World): void;
        }
    }
}
declare namespace tesserxel {
    namespace physics {
        interface EngineOption {
            forceAccumulator?: ForceAccumulatorConstructor;
            broadPhase?: BroadPhaseConstructor;
            solver?: SolverConstructor;
            substep?: number;
        }
        export class Engine {
            forceAccumulator: ForceAccumulator;
            broadPhase: BroadPhase;
            narrowPhase: NarrowPhase;
            solver: Solver;
            substep: number;
            constructor(option?: EngineOption);
            update(world: World, dt: number): void;
            step(world: World, dt: number): void;
        }
        export class World {
            gravity: math.Vec4;
            rigids: Rigid[];
            constrains: Constrain[];
            unionRigids: rigid.Union[];
            forces: Force[];
            time: number;
            add(...args: (Rigid | Force | Constrain)[]): void;
            remove(o: Rigid | Force): void;
            updateUnionGeometriesCoord(): void;
        }
        export class Material {
            friction: number;
            restitution: number;
            constructor(friction: number, restitution: number);
            static getContactMaterial(a: Material, b: Material): {
                restitution: number;
                friction: number;
            };
        }
        /** a helper function for applying inertia to bivec */
        export function mulBivec(self: math.Bivec, a: math.Bivec, b: math.Bivec): math.Bivec;
        export class Constrain {
            a: Rigid;
            b: Rigid | null;
            constructor(a: Rigid, b?: Rigid | null);
        }
        export class PointConstrain extends Constrain {
            pointA: math.Vec4;
            pointB: math.Vec4;
            constructor(a: Rigid, b: Rigid | null, pointA: math.Vec4, pointB: math.Vec4);
        }
        export {};
    }
}
declare namespace tesserxel {
    namespace physics {
        interface ForceAccumulatorConstructor {
            new (): ForceAccumulator;
        }
        abstract class ForceAccumulator {
            abstract run(world: World, dt: number): void;
            private _biv1;
            private _biv2;
            private readonly _bivec0;
            getState(world: World): void;
        }
        namespace force_accumulator {
            class Euler2 extends ForceAccumulator {
                private _bivec;
                private _rotor;
                run(world: World, dt: number): void;
            }
            class Predict3 extends ForceAccumulator {
                private _bivec1;
                private _bivec2;
                private _rotor;
                private _vec;
                run(world: World, dt: number): void;
            }
            class RK4 extends ForceAccumulator {
                private _bivec1;
                private _rotor;
                run(world: World, dt: number): void;
            }
        }
        abstract class Force {
            abstract apply(time: number): void;
        }
        namespace force {
            /** apply a spring force between object a and b
             *  pointA and pointB are in local coordinates,
             *  refering connect point of spring's two ends.
             *  b can be null for attaching spring to a fixed point in the world.
             *  f = k dx - damp * dv */
            class Spring extends Force {
                a: Rigid;
                pointA: math.Vec4;
                b: Rigid | null;
                pointB: math.Vec4;
                k: number;
                damp: number;
                length: number;
                private _vec4f;
                private _vec4a;
                private _vec4b;
                private _bivec;
                constructor(a: Rigid, b: Rigid | null, pointA: math.Vec4, pointB: math.Vec4, k: number, length?: number, damp?: number);
                apply(time: number): void;
            }
        }
    }
}
declare namespace tesserxel {
    namespace physics {
        type Convex = math.Vec4[];
        export function gjkOutDistance(convex: Convex, initSimplex?: math.Vec4[]): {
            simplex?: math.Vec4[];
            reverseOrder?: boolean;
            normals?: math.Vec4[];
            normal?: math.Vec4;
            distance?: number;
        };
        /** test convex1 - convex2 to origin */
        export function gjkDiffTest(convex1: Convex, convex2: Convex, initSimplex1?: math.Vec4[], initSimplex2?: math.Vec4[]): {
            simplex1?: math.Vec4[];
            simplex2?: math.Vec4[];
            normals?: math.Vec4[];
            reverseOrder?: boolean;
        };
        /** expanding polytope algorithm */
        export function epa(convex: Convex, initCondition: {
            simplex: math.Vec4[];
            reverseOrder: boolean;
            normals: math.Vec4[];
        }): {
            simplex: math.Vec4[];
            distance: number;
            normal: math.Vec4;
        } | {
            simplex?: undefined;
            distance?: undefined;
            normal?: undefined;
        };
        /** expanding polytope algorithm for minkovsky difference */
        export function epaDiff(convex1: Convex, convex2: Convex, initCondition: {
            simplex1: math.Vec4[];
            simplex2: math.Vec4[];
            reverseOrder: boolean;
            normals: math.Vec4[];
        }): {
            simplex1: math.Vec4[];
            simplex2: math.Vec4[];
            distance: number;
            normal: math.Vec4;
        };
        export {};
    }
}
declare namespace tesserxel {
    namespace physics {
        interface Collision {
            point: math.Vec4;
            depth: number;
            /** normal is defined from a to b */
            normal: math.Vec4;
            a: Rigid;
            b: Rigid;
        }
        class NarrowPhase {
            collisionList: Collision[];
            /** max iteration for sdf methods in detectCollision */
            maxIteration: number;
            clearCollisionList(): void;
            run(list: BroadPhaseList): void;
            detectCollision(rigidA: Rigid, rigidB: Rigid): any;
            private detectGlomeGlome;
            private detectGlomePlane;
            private detectConvexPlane;
            private detectConvexGlome;
            private detectConvexConvex;
            private detectSpheritorusPlane;
            private detectSpheritorusGlome;
            private detectSpheritorusSpheritorus;
            private detectTorispherePlane;
            private detectTorisphereGlome;
            private detectTorisphereTorisphere;
            private detectTorisphereSpheritorus;
        }
    }
}
declare namespace tesserxel {
    namespace physics {
        export type RigidType = "still" | "passive" | "active";
        interface SimpleRigidDescriptor {
            /** mass set to 0 to specify non-active rigid */
            mass: number | null;
            /** RigidGeometry instance cannot be shared between Rigid instances */
            geometry: RigidGeometry;
            material: Material;
            type?: RigidType;
            /** for tracing debug */
            label?: string;
        }
        /** Subrigids should not be added into scene repetively.
         * Subrigids's positions cannot be modified after union created
         */
        type UnionRigidDescriptor = Rigid[];
        /** all properities hold by class Rigid should not be modified
         *  exceptions are position/rotation and (angular)velocity.
         *  pass RigidDescriptor into constructor instead.
         *  */
        export class Rigid extends math.Obj4 {
            scale: null;
            material: Material;
            geometry: RigidGeometry;
            type: RigidType;
            mass: number;
            invMass: number;
            inertia: math.Bivec;
            invInertia: math.Bivec;
            inertiaIsotroy: boolean;
            sleep: boolean;
            label?: string;
            velocity: math.Vec4;
            angularVelocity: math.Bivec;
            force: math.Vec4;
            torque: math.Bivec;
            acceleration: math.Vec4;
            angularAcceleration: math.Bivec;
            constructor(param: SimpleRigidDescriptor | UnionRigidDescriptor);
            getlinearVelocity(out: math.Vec4, point: math.Vec4): math.Vec4;
        }
        /** internal type for union rigid geometry */
        export interface SubRigid extends Rigid {
            localCoord?: math.Obj4;
            parent?: Rigid;
        }
        export abstract class RigidGeometry {
            rigid: Rigid;
            initialize(rigid: Rigid): void;
            abstract initializeMassInertia(rigid: Rigid): void;
        }
        export namespace rigid {
            class Union extends RigidGeometry {
                components: SubRigid[];
                constructor(components: Rigid[]);
                initializeMassInertia(rigid: Rigid): void;
                updateCoord(): void;
            }
            class Glome extends RigidGeometry {
                radius: number;
                radiusSqr: number;
                constructor(radius: number);
                initializeMassInertia(rigid: Rigid): void;
            }
            class Convex extends RigidGeometry {
                points: math.Vec4[];
                _cachePoints: math.Vec4[];
                constructor(points: math.Vec4[]);
                initializeMassInertia(rigid: Rigid): void;
            }
            class Tesseractoid extends Convex {
                size: math.Vec4;
                constructor(size: math.Vec4 | number);
                initializeMassInertia(rigid: Rigid): void;
            }
            /** equation: dot(normal,positon) == offset
             *  => when offset > 0, plane is shifted to normal direction
             *  from origin by distance = offset
             */
            class Plane extends RigidGeometry {
                normal: math.Vec4;
                offset: number;
                constructor(normal?: math.Vec4, offset?: number);
                initializeMassInertia(rigid: Rigid): void;
            }
            /** default orientation: XW */
            class Spheritorus extends RigidGeometry {
                majorRadius: number;
                minorRadius: number;
                /** majorRadius: cirle's radius, minorRadius: sphere's radius */
                constructor(majorRadius: number, minorRadius: number);
                initializeMassInertia(rigid: Rigid): void;
            }
            /** default orientation: XZW */
            class Torisphere extends RigidGeometry {
                majorRadius: number;
                minorRadius: number;
                /** majorRadius: sphere's radius, minorRadius: cirle's radius */
                constructor(majorRadius: number, minorRadius: number);
                initializeMassInertia(rigid: Rigid): void;
            }
            /** default orientation: 1:XY, 2:ZW */
            class Tiger extends RigidGeometry {
                majorRadius1: number;
                majorRadius2: number;
                minorRadius: number;
                /** majorRadius: sphere's radius, minorRadius: cirle's radius */
                constructor(majorRadius1: number, majorRadius2: number, minorRadius: number);
                initializeMassInertia(rigid: Rigid): void;
            }
        }
        export {};
    }
}
declare namespace tesserxel {
    namespace physics {
        interface SolverConstructor {
            new (): Solver;
        }
        abstract class Solver {
            abstract run(collisionList: Collision[], constrainList: Constrain[]): void;
        }
        interface PreparedCollision extends Collision {
            separateSpeed: number;
            relativeVelocity: math.Vec4;
            materialA: Material;
            materialB: Material;
            dvA?: math.Vec4;
            dvB?: math.Vec4;
            dwA?: math.Bivec;
            dwB?: math.Bivec;
            pointConstrain?: PointConstrain;
        }
        class IterativeImpulseSolver extends Solver {
            maxPositionIterations: number;
            maxVelocityIterations: number;
            maxResolveRotationAngle: number;
            separateSpeedEpsilon: number;
            PositionRelaxationFactor: number;
            collisionList: PreparedCollision[];
            private _vec41;
            private _vec42;
            private pointConstrainMaterial;
            run(collisionList: Collision[], constrainList: Constrain[]): void;
            prepare(collisionList: Collision[], constrainList: Constrain[]): void;
            resolveVelocity(): void;
            updateSeparateSpeeds(collision: PreparedCollision): void;
            updateSeparateSpeed(collision: PreparedCollision, rigidIsA: boolean, rigid: Rigid, dv: math.Vec4, dw: math.Bivec): void;
            resolvePosition(): void;
            updateDepths(collision: PreparedCollision): void;
            updateDepth(collision: PreparedCollision, rigidIsA: boolean, rigid: Rigid, dv: math.Vec4, dw: math.Bivec): void;
        }
    }
}
declare namespace tesserxel {
    namespace controller {
        export interface IController {
            update(state: ControllerState): void;
            enabled: boolean;
        }
        interface ControllerConfig {
            preventDefault?: boolean;
            requsetPointerLock?: boolean;
        }
        interface KeyConfig {
            enable?: string;
            disable?: string;
        }
        export interface ControllerState {
            currentKeys: Map<String, KeyState>;
            currentBtn: number;
            mouseDown: number;
            mouseUp: number;
            updateCount: number;
            moveX: number;
            moveY: number;
            wheelX: number;
            wheelY: number;
            lastUpdateTime?: number;
            mspf?: number;
            requsetPointerLock?: boolean;
            isPointerLockedMouseDown?: boolean;
            isKeyHold?: (code: string) => boolean;
            queryDisabled?: (config: KeyConfig) => boolean;
            isPointerLocked?: () => boolean;
            exitPointerLock?: () => void;
        }
        export enum KeyState {
            NONE = 0,
            UP = 1,
            HOLD = 2,
            DOWN = 3
        }
        export class ControllerRegistry {
            dom: HTMLElement;
            ctrls: Iterable<IController>;
            requsetPointerLock: boolean;
            readonly states: ControllerState;
            constructor(dom: HTMLElement, ctrls: Iterable<IController>, config?: ControllerConfig);
            update(): void;
        }
        export class TrackBallController implements IController {
            enabled: boolean;
            object: math.Obj4;
            mouseSpeed: number;
            wheelSpeed: number;
            damp: number;
            /** how many update cycles (2^n) to normalise rotor to avoid accuracy problem */
            normalisePeriodBit: 4;
            keyConfig: {
                disable: string;
                enable: string;
            };
            private _bivec;
            private normalisePeriodMask;
            constructor(object?: math.Obj4);
            update(state: ControllerState): void;
            lookAtCenter(): void;
        }
        export class FreeFlyController implements IController {
            enabled: boolean;
            object: math.Obj4;
            mouseSpeed: number;
            wheelSpeed: number;
            keyMoveSpeed: number;
            keyRotateSpeed: number;
            damp: number;
            constructor(object?: math.Obj4);
            keyConfig: {
                front: string;
                back: string;
                left: string;
                right: string;
                ana: string;
                kata: string;
                up: string;
                down: string;
                turnLeft: string;
                turnRight: string;
                turnAna: string;
                turnKata: string;
                turnUp: string;
                turnDown: string;
                spinCW: string;
                spinCCW: string;
                disable: string;
                enable: string;
            };
            /** how many update cycles (2^n) to normalise rotor to avoid accuracy problem */
            normalisePeriodBit: 4;
            private _bivec;
            private _bivecKey;
            private _moveVec;
            private _vec;
            private normalisePeriodMask;
            update(state: ControllerState): void;
        }
        export class KeepUpController implements IController {
            enabled: boolean;
            object: math.Obj4;
            mouseSpeed: number;
            wheelSpeed: number;
            keyMoveSpeed: number;
            keyRotateSpeed: number;
            damp: number;
            keyConfig: {
                front: string;
                back: string;
                left: string;
                right: string;
                ana: string;
                kata: string;
                up: string;
                down: string;
                turnLeft: string;
                turnRight: string;
                turnAna: string;
                turnKata: string;
                turnUp: string;
                turnDown: string;
                spinCW: string;
                spinCCW: string;
                disable: string;
                enable: string;
            };
            /** how many update cycles (2^n) to normalise rotor to avoid accuracy problem */
            normalisePeriodBit: 4;
            private _bivec;
            private _bivec2;
            private _bivecKey;
            private _moveVec;
            private _vec;
            private normalisePeriodMask;
            private horizontalRotor;
            private verticalRotor;
            constructor(object?: math.Obj4);
            updateObj(): void;
            update(state: ControllerState): void;
        }
        interface SectionPreset {
            retina: boolean;
            eye1: renderer.SectionConfig[];
            eye2: renderer.SectionConfig[];
        }
        export namespace sliceconfig {
            function singlezslice1eye(screenSize: {
                width: number;
                height: number;
            }): renderer.SectionConfig[];
            function singlezslice2eye(screenSize: {
                width: number;
                height: number;
            }): renderer.SectionConfig[];
            function singleyslice1eye(screenSize: {
                width: number;
                height: number;
            }): renderer.SectionConfig[];
            function singleyslice2eye(screenSize: {
                width: number;
                height: number;
            }): renderer.SectionConfig[];
            function zslices1eye(step: number, maxpos: number, screenSize: {
                width: number;
                height: number;
            }): renderer.SectionConfig[];
            function zslices2eye(step: number, maxpos: number, screenSize: {
                width: number;
                height: number;
            }): renderer.SectionConfig[];
            function yslices1eye(step: number, maxpos: number, screenSize: {
                width: number;
                height: number;
            }): renderer.SectionConfig[];
            function yslices2eye(step: number, maxpos: number, screenSize: {
                width: number;
                height: number;
            }): renderer.SectionConfig[];
            function default2eye(size: number, screenSize: {
                width: number;
                height: number;
            }): renderer.SectionConfig[];
            function default1eye(size: number, screenSize: {
                width: number;
                height: number;
            }): renderer.SectionConfig[];
        }
        export class RetinaController implements IController {
            enabled: boolean;
            renderer: renderer.SliceRenderer;
            mouseSpeed: number;
            wheelSpeed: number;
            keyMoveSpeed: number;
            keyRotateSpeed: number;
            opacityKeySpeed: number;
            damp: number;
            mouseButton: number;
            retinaEyeOffset: number;
            sectionEyeOffset: number;
            size: GPUExtent3DStrict;
            sectionPresets: (screenSize: {
                width: number;
                height: number;
            }) => {
                [label: string]: SectionPreset;
            };
            private currentSectionConfig;
            private rembemerLastLayers;
            private needResize;
            keyConfig: {
                enable: string;
                disable: string;
                addOpacity: string;
                subOpacity: string;
                addLayer: string;
                subLayer: string;
                addRetinaResolution: string;
                subRetinaResolution: string;
                toggle3D: string;
                toggleCrosshair: string;
                rotateLeft: string;
                rotateRight: string;
                rotateUp: string;
                rotateDown: string;
                refaceFront: string;
                sectionConfigs: {
                    "retina+sections": string;
                    "retina+bigsections": string;
                    retina: string;
                    sections: string;
                    zsection: string;
                    ysection: string;
                    "retina+zslices": string;
                    "retina+yslices": string;
                };
            };
            constructor(r: renderer.SliceRenderer);
            private _vec2damp;
            private _vec2euler;
            private _vec3;
            private _q1;
            private _q2;
            private _mat4;
            private refacingFront;
            private needsUpdateRetinaZDistance;
            retinaZDistance: number;
            crossHairSize: number;
            maxRetinaResolution: number;
            update(state: ControllerState): void;
            setStereo(stereo: boolean): void;
            setSectionEyeOffset(offset: number): void;
            setRetinaEyeOffset(offset: number): void;
            setLayers(layers: number): void;
            setOpacity(opacity: number): void;
            setRetinaResolution(retinaResolution: number): void;
            toggleSectionConfig(index: string): void;
            setSize(size: GPUExtent3DStrict): void;
        }
        export {};
    }
}
declare namespace tesserxel {
    namespace renderer {
        export function createGPU(): Promise<GPU>;
        export class GPU {
            adapter: GPUAdapter;
            device: GPUDevice;
            preferredFormat: GPUTextureFormat;
            init(): Promise<GPU | null>;
            createBuffer(usage: number, buffer_or_size: (ArrayLike<number> & ArrayBuffer) | number, label?: string): GPUBuffer;
            createBindGroup(pipeline: GPUPipelineBase, index: number, entries: Array<GPUBindingResource>, label?: string): GPUBindGroup;
            getContext(dom: HTMLCanvasElement, config?: GPUContextConfig): GPUCanvasContext;
        }
        interface GPUContextConfig {
            format?: GPUTextureFormat;
            alphaMode?: GPUCanvasAlphaMode;
            usage?: GPUTextureUsageFlags;
            viewFormats?: Iterable<GPUTextureFormat>;
            colorSpace?: PredefinedColorSpace;
        }
        export {};
    }
}
declare namespace tesserxel {
    namespace renderer {
        interface SliceRendererOption {
            /** Caution: must be 2^n, this includes cross section thumbnails */
            maxSlicesNumber?: number;
            /** Caution: must be 2^n, large number can waste lots GPU memory;
             *  Used to preallocate gpumemory for intermediate data of cross section
             */
            maxCrossSectionBufferSize?: number;
            sliceGroupSize?: number;
            /** Caution: enable this may cause performance issue */
            enableFloat16Blend: boolean;
            /** whether initiate default confiuration like sliceconfigs and retina configs */
            defaultConfigs?: boolean;
        }
        enum SliceFacing {
            POSZ = 0,
            NEGZ = 1,
            POSY = 2,
            NEGY = 3,
            POSX = 4,
            NEGX = 5
        }
        enum EyeOffset {
            LeftEye = 0,
            None = 1,
            RightEye = 2
        }
        interface TetraSlicePipelineDescriptor {
            vertex: TetraVertexState;
            fragment: GeneralShaderState;
            cullMode?: GPUCullMode;
        }
        interface RaytracingPipelineDescriptor {
            code: string;
            rayEntryPoint: string;
            fragmentEntryPoint: string;
        }
        interface GeneralShaderState {
            code: string;
            entryPoint: string;
        }
        interface TetraVertexState extends GeneralShaderState {
            workgroupSize?: number;
        }
        interface TetraSlicePipeline {
            computePipeline: GPUComputePipeline;
            computeBindGroup0: GPUBindGroup;
            renderPipeline: GPURenderPipeline;
            outputVaryBuffer: GPUBuffer[];
            vertexOutNum: number;
            descriptor: TetraSlicePipelineDescriptor;
        }
        interface RaytracingPipeline {
            pipeline: GPURenderPipeline;
            bindGroup0: GPUBindGroup;
        }
        interface SectionConfig {
            slicePos?: number;
            facing: SliceFacing;
            eyeOffset?: EyeOffset;
            viewport: {
                x: number;
                y: number;
                width: number;
                height: number;
            };
            resolution?: number;
        }
        interface SliceConfig {
            layers?: number;
            sections?: Array<SectionConfig>;
            retinaResolution?: number;
        }
        class SliceRenderer {
            getSafeTetraNumInOnePass(): number;
            private maxSlicesNumber;
            private maxCrossSectionBufferSize;
            /** On each computeshader slice calling numbers, should be 2^n */
            private sliceGroupSize;
            private sliceGroupSizeBit;
            private screenSize;
            private outputBufferStride;
            private viewportCompressShift;
            private blendFormat;
            private displayConfig;
            private sliceTextureSize;
            private gpu;
            private context;
            private crossRenderVertexShaderModule;
            private screenTexture;
            private screenView;
            private linearTextureSampler;
            private nearestTextureSampler;
            private crossRenderPassDescClear;
            private crossRenderPassDescLoad;
            private clearRenderPipeline;
            private retinaRenderPipeline;
            private screenRenderPipeline;
            private retinaBindGroup;
            private screenBindGroup;
            private sliceView;
            private depthView;
            private outputVaryBufferPool;
            private sliceOffsetBuffer;
            private emitIndexSliceBuffer;
            private refacingBuffer;
            private eyeCrossBuffer;
            private thumbnailViewportBuffer;
            private sliceGroupOffsetBuffer;
            private retinaMVBuffer;
            private retinaPBuffer;
            private screenAspectBuffer;
            private layerOpacityBuffer;
            private camProjBuffer;
            static readonly outputAttributeUsage: number;
            private slicesJsBuffer;
            private camProjJsBuffer;
            private retinaProjecJsBuffer;
            private retinaMVMatJsBuffer;
            private currentRetinaFacing;
            private retinaMatrixChanged;
            private retinaFacingChanged;
            private screenClearColor;
            private renderState;
            private enableEye3D;
            private refacingMatsCode;
            private crossHairSize;
            private totalGroupNum;
            private sliceGroupNum;
            init(gpu: GPU, context: GPUCanvasContext, options?: SliceRendererOption): Promise<this>;
            /** for TetraSlicePipeline, vertex shader is internally a compute shader, so it doesn't share bindgroups with fragment shader.
             *  for RaytracingPipeline, vertex shader and fragment shader are in one traditional render pipeline, they share bindgroups.
             */
            createVertexShaderBindGroup(pipeline: TetraSlicePipeline | RaytracingPipeline, index: number, buffers: GPUBuffer[], label?: string): GPUBindGroup;
            /** for TetraSlicePipeline, vertex shader is internally a compute shader, so it doesn't share bindgroups with fragment shader.
             *  for RaytracingPipeline, vertex shader and fragment shader are in one traditional render pipeline, they share bindgroups.
             */
            createFragmentShaderBindGroup(pipeline: TetraSlicePipeline | RaytracingPipeline, index: number, buffers: GPUBuffer[], label?: string): GPUBindGroup;
            createTetraSlicePipeline(desc: TetraSlicePipelineDescriptor): Promise<TetraSlicePipeline>;
            setSize(size: GPUExtent3DStrict): void;
            set4DCameraProjectMatrix(camera: math.PerspectiveCamera): void;
            setRetinaProjectMatrix(camera: math.PerspectiveCamera): void;
            setRetinaViewMatrix(m: math.Mat4): void;
            getOpacity(): number;
            getSectionEyeOffset(): number;
            getRetinaEyeOffset(): number;
            getLayers(): number;
            getRetinaResolution(): number;
            getMinResolutionMultiple(): number;
            getStereoMode(): boolean;
            getSize(): {
                width: number;
                height: number;
            };
            setOpacity(opacity: number): void;
            setEyeOffset(sectionEyeOffset?: number, retinaEyeOffset?: number): void;
            setCrosshair(size: number): void;
            getCrosshair(): number;
            setSliceConfig(sliceConfig: SliceConfig): void;
            render(drawCall: () => void): void;
            /** Set TetraSlicePipeline and prepare GPU resources.
             *  Next calls should be function sliceTetras or setBindGroup.
             */
            beginTetras(pipeline: TetraSlicePipeline): void;
            getFrustumRange(): number[];
            setBindGroup(index: number, bindGroup: GPUBindGroup): void;
            /** Compute slice of given bindgroup attribute data.
             *  beginTetras should be called at first to specify a tetraSlicePipeline
             *  Next calls should be function sliceTetras, setBindGroup or drawTetras.
             */
            sliceTetras(vertexBindGroup: GPUBindGroup, tetraCount: number, instanceCount?: number): void;
            setWorldClearColor(color: GPUColor): void;
            setScreenClearColor(color: GPUColor): void;
            /** This function draw slices on a internal framebuffer
             *  Every beginTetras call should be end with drawTetras call
             */
            drawTetras(bindGroups?: {
                group: number;
                binding: GPUBindGroup;
            }[]): void;
            createRaytracingPipeline(desc: RaytracingPipelineDescriptor): Promise<{
                pipeline: GPURenderPipeline;
                bindGroup0: GPUBindGroup;
            }>;
            drawRaytracing(pipeline: RaytracingPipeline, bindGroups?: GPUBindGroup[]): void;
        }
    }
}
declare namespace tesserxel {
    namespace renderer {
    }
}
declare namespace tesserxel {
    namespace renderer {
        namespace wgslreflect {
            export type ReflectAttribute = {
                name: string;
                value?: string;
            };
            export type ReflectType = {
                name: string;
                attributes: Array<ReflectAttribute>;
                format?: ReflectType;
                count?: string;
            };
            export type ReflectArg = {
                name: string;
                type: ReflectType;
                attributes: Array<ReflectAttribute>;
                _type: "arg";
            };
            export type ReflectMember = {
                name: string;
                type: ReflectType;
                attributes: Array<ReflectAttribute>;
                _type: "member";
            };
            export type ReflectFunction = {
                args: Array<ReflectArg>;
                attributes: Array<ReflectAttribute>;
                name: string;
                return: ReflectType;
                _type: "function";
            };
            export type ReflectStruct = {
                name: string;
                members: Array<ReflectMember>;
                attributes: Array<ReflectAttribute>;
                _type: "struct";
            };
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
            export function parseTypeName(type: ReflectType): any;
            export function parseAttr(attrs: Array<ReflectAttribute>): string;
            export function getFnInputAndOutput(reflect: WgslReflect, fn: ReflectFunction, expectInput: {
                [name: string]: string;
            }, expectOutput: string[]): {
                input: Set<string>;
                call: string;
                output: {
                    [name: string]: {
                        expr: string;
                        type: string;
                    };
                };
            };
            /**
             * @author Brendan Duncan / https://github.com/brendan-duncan
             */
            class AST {
                constructor(type: any, options: any);
            }
            /**
             * @author Brendan Duncan / https://github.com/brendan-duncan
             */
            export class WgslReflect {
                functions: Array<ReflectFunction>;
                structs: Array<ReflectStruct>;
                constructor(code: string);
                initialize(code: any): void;
                isTextureVar(node: any): boolean;
                isSamplerVar(node: any): boolean;
                isUniformVar(node: any): boolean;
                isStorageVar(node: any): boolean;
                _getInputs(args: any, inputs: any): any;
                _getInputInfo(node: any): {
                    name: any;
                    type: any;
                    input: any;
                    locationType: any;
                    location: any;
                };
                _parseInt(s: any): any;
                getAlias(name: any): any;
                getStruct(name: any): AST;
                getAttribute(node: any, name: any): any;
                getBindGroups(): any[];
                getStorageBufferInfo(node: any): {
                    name: any;
                    type: any;
                    group: any;
                    binding: any;
                };
                getUniformBufferInfo(node: any): {
                    name: any;
                    type: string;
                    align: number;
                    size: number;
                    members: any[];
                    group: any;
                    binding: any;
                };
                getTypeInfo(type: any): {
                    align: number;
                    size: number;
                };
                _roundUp(k: any, n: any): number;
            }
            export {};
        }
    }
}
declare namespace tesserxel {
    namespace four {
        class Scene {
            child: Object[];
            backGroundColor: GPUColor;
            add(...obj: Object[]): void;
            removeChild(obj: Object): void;
            setBackgroudColor(color: GPUColor): void;
        }
        class Object extends math.Obj4 {
            child: Object[];
            worldCoord: math.AffineMat4;
            needsUpdateCoord: boolean;
            alwaysUpdateCoord: boolean;
            constructor();
            updateCoord(): this;
            add(...obj: Object[]): void;
            removeChild(obj: Object): void;
        }
        class Camera extends Object implements math.PerspectiveCamera {
            fov: number;
            near: number;
            far: number;
            alwaysUpdateCoord: boolean;
            needsUpdate: boolean;
        }
        class Mesh extends Object {
            geometry: Geometry;
            material: Material;
            uObjMatBuffer: GPUBuffer;
            bindGroup: GPUBindGroup;
            visible: boolean;
            constructor(geometry: Geometry, material: Material);
        }
        class Geometry {
            jsBuffer: mesh.TetraMesh;
            gpuBuffer: {
                [name: string]: GPUBuffer;
            };
            needsUpdate: boolean;
            dynamic: boolean;
            obb: math.AABB;
            constructor(data: mesh.TetraMesh);
            updateOBB(): void;
        }
        class TesseractGeometry extends Geometry {
            constructor(size?: number | math.Vec4);
        }
        class CubeGeometry extends Geometry {
            constructor(size?: number | math.Vec3);
        }
        class GlomeGeometry extends Geometry {
            constructor(size?: number);
        }
        class SpheritorusGeometry extends Geometry {
            constructor(sphereRadius?: number, circleRadius?: number);
        }
        class TorisphereGeometry extends Geometry {
            constructor(circleRadius?: number, sphereRadius?: number);
        }
        class ConvexHullGeometry extends Geometry {
            constructor(points: math.Vec4[]);
        }
    }
}
declare namespace tesserxel {
    namespace four {
        type LightDensity = {
            r: number;
            g: number;
            b: number;
        } | math.Vec3 | number[] | number;
        export class Light extends Object {
            density: math.Vec3;
            constructor(density: LightDensity);
        }
        export class AmbientLight extends Light {
            needsUpdateCoord: boolean;
            constructor(density: LightDensity);
        }
        export class DirectionalLight extends Light {
            worldDirection: math.Vec4;
            direction: math.Vec4;
            constructor(density: LightDensity, direction?: math.Vec4);
        }
        export class SpotLight extends Light {
            worldDirection: math.Vec4;
            direction: math.Vec4;
            angle: number;
            penumbra: number;
            decayPower: number;
            constructor(density: LightDensity, angle: number, penumbra: number, direction?: math.Vec4);
        }
        export class PointLight extends Light {
            decayPower: number;
            constructor(density: LightDensity);
        }
        export function _initLightShader(): {
            posdirLightsNumber: number;
            spotLightsNumber: number;
            lightCode: string;
            uWorldLightBufferSize: number;
        };
        export function _updateWorldLight(r: Renderer): void;
        export {};
    }
}
declare namespace tesserxel {
    namespace four {
        type ColorOutputNode = MaterialNode & {
            output: "color";
        };
        type Vec4OutputNode = MaterialNode & {
            output: "vec4";
        };
        type FloatOutputNode = MaterialNode & {
            output: "f32";
        };
        type TransformOutputNode = MaterialNode & {
            output: "affineMat4";
        };
        /** An iterative structure for Material */
        class MaterialNode {
            identifier: string;
            input: {
                [name: string]: MaterialNode;
            };
            output: string;
            static constFractionDigits: number;
            getCode(r: Renderer, root: Material, outputToken: string): string;
            getInputCode(r: Renderer, root: Material, token: string): {
                token: {
                    [name: string]: string;
                };
                code: string;
            };
            update(r: Renderer): void;
            constructor(identifier: string);
        }
        /** Material is the top node of MaterialNode */
        export class Material extends MaterialNode {
            cullMode: GPUCullMode;
            compiling: boolean;
            compiled: boolean;
            needsUpdate: boolean;
            output: string;
            pipeline: renderer.TetraSlicePipeline;
            uuid: string;
            bindGroup: GPUBindGroup[];
            bindGroupBuffers: GPUBuffer[];
            fetchBuffers: string[];
            declUniforms: {
                [name: string]: {
                    location: number;
                    type: string;
                    buffer: GPUBuffer;
                };
            };
            declUniformLocation: number;
            declVarys: string[];
            createBindGroup(r: Renderer, p: renderer.TetraSlicePipeline): void;
            init(r: Renderer): void;
            compile(r: Renderer): Promise<void>;
            addVary(a: string): void;
            addUniform(type: string, u: string, buffer: GPUBuffer): void;
            fetchBuffer(g: Geometry): GPUBuffer[];
            getShaderCode(r: Renderer): {
                vs: string;
                fs: string;
            };
            constructor(identifiers: string);
            gpuUniformBuffer: {
                [name: string]: GPUBuffer;
            };
        }
        /** the same UniformValue instance will share one uniform buffer */
        class UniformValue extends MaterialNode {
            gpuBuffer: GPUBuffer;
            gpuBufferSize: number;
            jsBufferSize: number;
            type: string;
            needsUpdate: boolean;
            constructor();
            getCode(r: Renderer, root: Material, outputToken: string): string;
            createBuffer(r: Renderer): void;
            _update(r: Renderer): void;
            update(r: Renderer): void;
        }
        export class ColorUniformValue extends UniformValue {
            output: "color";
            type: string;
            gpuBufferSize: number;
            value: GPUColor;
            _update(r: Renderer): void;
            write(value: GPUColor): void;
        }
        export class Vec4UniformValue extends UniformValue {
            output: "vec4";
            type: string;
            gpuBufferSize: number;
            value: math.Vec4;
            _update(r: Renderer): void;
            write(value: math.Vec4): void;
        }
        export class FloatUniformValue extends UniformValue {
            output: "f32";
            type: string;
            gpuBufferSize: number;
            value: number;
            _update(r: Renderer): void;
            write(value: number): void;
        }
        export class TransformUniformValue extends UniformValue {
            output: "affineMat4";
            type: string;
            gpuBufferSize: number;
            value: math.Obj4;
            private affineMatValue;
            _update(r: Renderer): void;
            write(value: math.Obj4): void;
        }
        export type Color = GPUColor | ColorOutputNode;
        export type Float = number | FloatOutputNode;
        /** Basic material just return color node's output color  */
        export class BasicMaterial extends Material {
            input: {
                color: ColorOutputNode;
            };
            constructor(color: Color);
            getCode(r: Renderer, root: Material, outputToken: string): string;
        }
        export class LambertMaterial extends Material {
            input: {
                color: ColorOutputNode;
            };
            getCode(r: Renderer, root: Material, outputToken: string): string;
            constructor(color: Color);
        }
        /** Blinn Phong */
        export class PhongMaterial extends Material {
            input: {
                color: ColorOutputNode;
                specular: ColorOutputNode;
                shininess: FloatOutputNode;
            };
            getCode(r: Renderer, root: Material, outputToken: string): string;
            constructor(color: Color, shininess?: Float, specular?: Color);
        }
        export class CheckerTexture extends MaterialNode {
            output: "color";
            input: {
                color1: ColorOutputNode;
                color2: ColorOutputNode;
                uvw: Vec4OutputNode;
            };
            getCode(r: Renderer, root: Material, outputToken: string): string;
            constructor(color1: Color, color2: Color, uvw?: Vec4OutputNode);
        }
        export class GridTexture extends MaterialNode {
            output: "color";
            input: {
                color1: ColorOutputNode;
                color2: ColorOutputNode;
                gridWidth: Vec4OutputNode;
                uvw: Vec4OutputNode;
            };
            getCode(r: Renderer, root: Material, outputToken: string): string;
            constructor(color1: Color, color2: Color, gridWidth: number | math.Vec4 | Vec4OutputNode, uvw?: Vec4OutputNode);
        }
        export class UVWVec4Input extends MaterialNode {
            output: "vec4";
            getCode(r: Renderer, root: Material, outputToken: string): string;
            constructor();
        }
        export class Vec4TransformNode extends MaterialNode {
            output: "vec4";
            input: {
                vec4: Vec4OutputNode;
                transform: TransformOutputNode;
            };
            getCode(r: Renderer, root: Material, outputToken: string): string;
            constructor(vec4: Vec4OutputNode, transform: math.Obj4 | TransformOutputNode);
        }
        export {};
    }
}
/** threejs like 4D lib */
declare namespace tesserxel {
    namespace four {
        export class Renderer {
            core: renderer.SliceRenderer;
            gpu: renderer.GPU;
            canvas: HTMLCanvasElement;
            pipelines: {
                [label: string]: renderer.TetraSlicePipeline | "compiling";
            };
            jsBuffer: Float32Array;
            uCamMatBuffer: GPUBuffer;
            uWorldLightBuffer: GPUBuffer;
            lightShaderInfomation: {
                posdirLightsNumber: number;
                spotLightsNumber: number;
                lightCode: string;
                uWorldLightBufferSize: number;
            };
            private cameraInScene;
            private safeTetraNumInOnePass;
            private tetraNumOccupancyRatio;
            private maxTetraNumInOnePass;
            constructor(canvas: HTMLCanvasElement);
            setBackgroudColor(color: GPUColor): void;
            init(): Promise<this>;
            fetchPipelineName(identifier: string): string;
            fetchPipeline(identifier: string): renderer.TetraSlicePipeline | "compiling";
            pullPipeline(identifier: string, pipeline: renderer.TetraSlicePipeline | "compiling"): void;
            updateObject(o: Object): void;
            addToDrawList(m: Mesh): void;
            updateMesh(m: Mesh): void;
            updateScene(scene: Scene): void;
            ambientLightDensity: math.Vec3;
            directionalLights: DirectionalLight[];
            spotLights: SpotLight[];
            pointLights: PointLight[];
            drawList: DrawList;
            activeCamera: Camera;
            setCamera(camera: Camera): void;
            computeFrustumRange(range: number[]): math.Vec4[];
            private _testWithFrustumData;
            render(scene: Scene, camera: Camera): void;
            setSize(size: GPUExtent3DStrict): void;
            private clearState;
        }
        interface DrawList {
            [group: string]: {
                pipeline: renderer.TetraSlicePipeline;
                meshes: Mesh[];
                bindGroup: {
                    group: number;
                    binding: GPUBindGroup;
                };
                tetraCount: number;
                next?: string;
            };
        }
        export {};
    }
}
declare namespace tesserxel {
    namespace four {
        function _generateVertShader(inputs: string[], outputs: string[]): string;
    }
}
