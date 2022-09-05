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
        class Srand {
            _seed: number;
            constructor(seed: number);
            set(seed: number): void;
            /** return a random float in [0,1] */
            nextf(): number;
            /** return a random int of [0,n-1] if n is given, else range is same as int */
            nexti(n?: number): number;
        }
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
        }
        /** an coordinate transform of rotation translation and scale */
        class Obj4 {
            position: Vec4;
            rotation: Rotor;
            scale: Vec4;
            constructor(position?: Vec4, rotation?: Rotor, scale?: Vec4);
            local2parent(point: Vec4): Vec4;
            parent2local(point: Vec4): Vec4;
            getMat4(): Mat4;
            getMat4inv(): Mat4;
            getAffineMat4(): AffineMat4;
            getAffineMat4inv(): AffineMat4;
            translates(v: Vec4): Obj4;
            rotates(r: Rotor): Obj4;
            rotatesAt(r: Rotor, center?: Vec4): Obj4;
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
            exp(): Rotor;
            /** return two angles [max, min] between a and b
             * "a" and "b" must be normalized simple bivectors*/
            static angle(a: Bivec, b: Bivec): number[];
            rotate(r: Rotor): Bivec;
            rotates(r: Rotor): Bivec;
            /** return a random oriented simple normalized bivector */
            static rand(): Bivec;
            /** return a random oriented simple normalized bivector by seed */
            static srand(seed: Srand): Bivec;
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
            mul(q: Quaternion): Quaternion;
            /** this = this * q; */
            mulsr(q: Quaternion): Quaternion;
            /** this = q * this; */
            mulsl(q: Quaternion): Quaternion;
            /** this = this * conj(q); */
            mulsrconj(q: Quaternion): Quaternion;
            /** this = conj(q) * this; */
            mulslconj(q: Quaternion): Quaternion;
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
            static rand(): Rotor;
            static srand(seed: Srand): Rotor;
            randset(): Rotor;
            srandset(seed: Srand): Rotor;
        }
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
        }
        class Mat3 {
            elem: number[];
            static id: Mat3;
            static zero: Mat3;
            static diag(a: number, b: number, c: number): Mat3;
            constructor(a?: number, b?: number, c?: number, d?: number, e?: number, f?: number, g?: number, h?: number, i?: number);
            set(a?: number, b?: number, c?: number, d?: number, e?: number, f?: number, g?: number, h?: number, i?: number): Mat3;
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
            writeBuffer(b: Float32Array, offset?: number): void;
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
            /** this = this * m2; */
            mulsr(m: Mat4): Mat4;
            /** this = m2 * this; */
            mulsl(m: Mat4): Mat4;
            /** this = m1 * m2; */
            mulset(m1: Mat4, m2: Mat4): Mat4;
            setFrom3DRotation(q: Quaternion): Mat4;
            setFromQuaternionL(q: Quaternion): Mat4;
            setFromQuaternionR(q: Quaternion): Mat4;
            setFromRotor(r: Rotor): Mat4;
            det(): number;
            inv(): Mat4;
            invs(): Mat4;
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
        }
        class Vec4 {
            x: number;
            y: number;
            z: number;
            w: number;
            static x: Vec4;
            static y: Vec4;
            static z: Vec4;
            static w: Vec4;
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
            dotbset(B: Bivec, v: Vec4): Vec4;
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
            static rand(): Vec4;
            static srand(seed: Srand): Vec4;
        }
        let _vec2: Vec2;
        let _vec3: Vec3;
        let _vec3_1: Vec3;
        let _vec3_2: Vec3;
        let _vec4: Vec4;
        let _Q: Quaternion;
        let _Q_1: Quaternion;
        let _Q_2: Quaternion;
        type Vector = Vec2 | Vec3 | Vec4;
    }
}
declare namespace tesserxel {
    namespace math {
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
            let hexadecachoron: TetraMesh;
            function glome(radius: number, xySegment: number, zwSegment: number, lattitudeSegment: number): TetraMesh;
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
        class Engine {
            forceAccumulator: ForceAccumulator;
            constructor(forceAccumulator?: ForceAccumulator);
            runCollisionDetector(): void;
            runCollisionSolver(): void;
            update(world: World, dt: number): void;
            getObjectsAccelerations(world: World): void;
        }
        class World {
            gravity: math.Vec4;
            objects: Object[];
            forces: Force[];
            collisions: IntersectedResult[];
            time: number;
            frameCount: number;
            addObject(o: Object): void;
            addForce(f: Force): void;
        }
        class Object {
            geometry: Geometry;
            invMass: number;
            invInertia: math.Matrix;
            velocity: math.Vec4;
            angularVelocity: math.Bivec;
            /** sleeping objects are still.
             *  it only do collision test will active objects
             *  */
            sleep: boolean;
            force: math.Vec4;
            torque: math.Bivec;
            acceleration: math.Vec4;
            angularAcceleration: math.Bivec;
            getlinearVelocity(position: math.Vec4): math.Vec4;
            constructor(geometry: Geometry, mass?: number);
        }
    }
}
declare namespace tesserxel {
    namespace physics {
        interface ForceAccumulator {
            run(engine: Engine, world: World, dt: number): void;
        }
        namespace force_accumulator {
            class Euler2 {
                private _bivec;
                private _rotor;
                run(engine: Engine, world: World, dt: number): void;
            }
            class Predict3 {
                private _bivec1;
                private _bivec2;
                private _rotor;
                private _vec;
                run(engine: Engine, world: World, dt: number): void;
            }
            class RK4 {
                private _bivec1;
                private _rotor;
                run(engine: Engine, world: World, dt: number): void;
            }
        }
        interface Force {
            apply(time: number): void;
        }
        namespace force {
            /** apply a spring force between object a and b
             *  pointA and pointB are in local coordinates,
             *  refering connect point of spring's two ends.
             *  b can be null for attaching spring to a fixed point in the world.
             *  f = k dx - damp * dv */
            class Spring implements Force {
                a: Object;
                pointA: math.Vec4;
                b: Object | null;
                pointB: math.Vec4;
                k: number;
                damp: number;
                length: number;
                private _vec4f;
                private _vec4a;
                private _vec4b;
                private _bivec;
                constructor(a: Object, b: Object | null, pointA: math.Vec4, pointB: math.Vec4, k: number, damp?: number, length?: number);
                apply(time: null): void;
            }
        }
    }
}
declare namespace tesserxel {
    namespace physics {
        interface Geometry {
            type: string;
            position?: math.Vec4;
            rotation?: math.Rotor;
            intersectGeometry(g: Geometry): IntersectResult;
        }
        class Glome implements Geometry {
            radius: number;
            position: math.Vec4;
            rotation: math.Rotor;
            type: "glome";
            constructor(radius: number);
            intersectGeometry(g: Geometry): any;
        }
        /** equation: dot(normal,positon) == offset
         *  => when offset > 0, plane is shifted to normal direction
         *  from origin by distance = offset
         */
        class Plane implements Geometry {
            normal: math.Vec4;
            offset: number;
            type: "plane";
            intersectGeometry(g: Geometry): IntersectedResult;
        }
    }
}
declare namespace tesserxel {
    namespace physics {
        type IntersectResult = IntersectedResult | null;
        interface IntersectedResult {
            point: math.Vec4;
            depth: number;
            /** normal is defined from a to b */
            normal: math.Vec4;
            a: Geometry;
            b: Geometry;
        }
        function intersetGlomeGlome(a: Glome, b: Glome): IntersectResult;
        function inverseIntersectOrder(r: IntersectResult): IntersectResult;
        function intersetGlomePlane(a: Glome, b: Plane): IntersectResult;
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
        interface ControllerState {
            currentKeys: Map<String, KeyState>;
            currentBtn: number;
            updateCount: number;
            moveX: number;
            moveY: number;
            wheelX: number;
            wheelY: number;
            lastUpdateTime?: number;
            mspf?: number;
            requsetPointerLock?: boolean;
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
            constructor();
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
            keepUp: boolean;
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
            constructor();
            update(state: ControllerState): void;
        }
        interface SectionPreset {
            retina: boolean;
            eye1: renderer.SectionConfig[];
            eye2: renderer.SectionConfig[];
        }
        export namespace sliceconfig {
            let size: number;
            function singlezslice1eye(aspect: number): renderer.SliceConfig;
            function singlezslice2eye(aspect: number): renderer.SliceConfig;
            function singleyslice1eye(aspect: number): renderer.SliceConfig;
            function singleyslice2eye(aspect: number): renderer.SliceConfig;
            function zslices1eye(step: number, maxpos: number, aspect: number): renderer.SliceConfig;
            function zslices2eye(step: number, maxpos: number, aspect: number): renderer.SliceConfig;
            function yslices1eye(step: number, maxpos: number, aspect: number): renderer.SliceConfig;
            function yslices2eye(step: number, maxpos: number, aspect: number): renderer.SliceConfig;
            function default2eye(size: number, aspect: number): renderer.SliceConfig;
            function default1eye(size: number, aspect: number): renderer.SliceConfig;
        }
        export class RetinaController implements IController {
            enabled: boolean;
            keepUp: boolean;
            renderer: renderer.SliceRenderer;
            mouseSpeed: number;
            wheelSpeed: number;
            keyMoveSpeed: number;
            keyRotateSpeed: number;
            opacityKeySpeed: number;
            damp: number;
            mouseButton: number;
            sectionPresets: (aspect: number) => {
                [label: string]: SectionPreset;
            };
            private sliceConfig;
            private currentSectionConfig;
            private rembemerLastLayers;
            private needResize;
            keyConfig: {
                enable: string;
                disable: string;
                toggle3D: string;
                addOpacity: string;
                subOpacity: string;
                addLayer: string;
                subLayer: string;
                rotateLeft: string;
                rotateRight: string;
                rotateUp: string;
                rotateDown: string;
                refaceFront: string;
                sectionConfigs: {
                    "retina+sections": string;
                    retina: string;
                    sections: string;
                    "retina+zslices": string;
                    "retina+yslices": string;
                    zsection: string;
                    ysection: string;
                };
            };
            constructor(r: renderer.SliceRenderer);
            private _vec2damp;
            private _vec2euler;
            private _vec3;
            private _q1;
            private _q2;
            private _mat4;
            private sliceNeedUpdate;
            retinaZDistance: number;
            update(state: ControllerState): void;
            setSlice(sliceConfig: renderer.SliceConfig): void;
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
            /** Square slice framebuffer of dimension sliceResolution, should be 2^n */
            sliceResolution?: number;
            /** Caution: must be 2^n, this includes cross section thumbnails */
            maxSlicesNumber?: number;
            /** Caution: must be 2^n, large number can waste lots GPU memory;
             *  Used to preallocate gpumemory for intermediate data of cross section
             */
            maxCrossSectionBufferSize?: number;
            sliceGroupSize?: number;
            /** Caution: enable this may cause performance issue */
            enableFloat16Blend: boolean;
            /** Caution: large number can waste lots GPU memory */
            maxVertexOutputNumber?: number;
            /** whether initiate default confiuration like sliceconfigs and retina configs */
            defaultConfigs?: boolean;
        }
        interface SliceConfig {
            layers: number;
            retinaEyeOffset?: number;
            sectionEyeOffset?: number;
            opacity?: number;
            sections?: Array<SectionConfig>;
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
        interface TetraVertexState {
            workgroupSize?: number;
            code: string;
            entryPoint: string;
        }
        interface GeneralShaderState {
            code: string;
            entryPoint: string;
        }
        interface TetraSlicePipeline {
            computePipeline: GPUComputePipeline;
            computeBindGroup0: GPUBindGroup;
            renderPipeline: GPURenderPipeline;
            vertexOutNum: number;
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
        }
        class SliceRenderer {
            private maxSlicesNumber;
            private maxVertexOutputNumber;
            private maxCrossSectionBufferSize;
            private sliceResolution;
            /** On each computeshader slice calling numbers, should be 2^n */
            private sliceGroupSize;
            private sliceGroupSizeBit;
            private screenSize;
            private outputBufferStride;
            private blendFormat;
            private sliceConfig;
            private gpu;
            private context;
            private crossRenderVertexShaderModule;
            private screenTexture;
            private screenView;
            private linearTextureSampler;
            private nearestTextureSampler;
            private crossRenderPassDescClear;
            private crossRenderPassDescLoad;
            private retinaRenderPipeline;
            private screenRenderPipeline;
            private retinaBindGroup;
            private screenBindGroup;
            private outputVaryBuffer;
            private outputClearBuffer;
            private sliceOffsetBuffer;
            private emitIndexSliceBuffer;
            private refacingBuffer;
            private eyeBuffer;
            private thumbnailViewportBuffer;
            private readBuffer;
            private slicesBuffer;
            private sliceGroupOffsetBuffer;
            private retinaMVBuffer;
            private retinaPBuffer;
            private screenAspectBuffer;
            private layerOpacityBuffer;
            private camProjBuffer;
            private retinaViewMatrix;
            private retinaMVMatJsBuffer;
            private currentRetinaFacing;
            private retinaMatrixChanged;
            private retinaFacingChanged;
            private screenClearColor;
            private renderState;
            private enableEye3D;
            private refacingMatsCode;
            private totalGroupNum;
            private sliceGroupNum;
            init(gpu: GPU, context: GPUCanvasContext, options?: SliceRendererOption): Promise<this>;
            createBindGroup(pipeline: TetraSlicePipeline | RaytracingPipeline, index: number, buffers: GPUBuffer[]): GPUBindGroup;
            createTetraSlicePipeline(desc: TetraSlicePipelineDescriptor): Promise<TetraSlicePipeline>;
            setSize(size: GPUExtent3DStrict): void;
            getScreenAspect(): number;
            set4DCameraProjectMatrix(camera: math.PerspectiveCamera): void;
            setRetinaProjectMatrix(camera: math.PerspectiveCamera): void;
            setRetinaViewMatrix(m: math.Mat4): void;
            getSliceConfig(): SliceConfig;
            setSlice(sliceConfig: SliceConfig): void;
            render(drawCall: () => void): void;
            beginTetras(pipeline: TetraSlicePipeline): void;
            setBindGroup(index: number, bindGroup: GPUBindGroup): void;
            sliceTetras(vertexBindGroup: GPUBindGroup, tetraCount: number, instanceCount?: number): void;
            setWorldClearColor(color: GPUColor): void;
            setScreenClearColor(color: GPUColor): void;
            drawTetras(): void;
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
            type ReflectAttribute = {
                name: string;
                value?: string;
            };
            type ReflectType = {
                name: string;
                attributes: Array<ReflectAttribute>;
                format?: ReflectType;
            };
            type ReflectArg = {
                name: string;
                type: ReflectType;
                attributes: Array<ReflectAttribute>;
                _type: "arg";
            };
            type ReflectMember = {
                name: string;
                type: ReflectType;
                attributes: Array<ReflectAttribute>;
                _type: "member";
            };
            type ReflectFunction = {
                args: Array<ReflectArg>;
                attributes: Array<ReflectAttribute>;
                name: string;
                return: ReflectType;
                _type: "function";
            };
            class WgslReflect {
                functions: Array<ReflectFunction>;
                structs: Array<ReflectStruct>;
                constructor(code: string);
            }
            type ReflectStruct = {
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
            function parseTypeName(type: ReflectType): any;
            function parseAttr(attrs: Array<ReflectAttribute>): string;
            function getFnInputAndOutput(reflect: WgslReflect, fn: ReflectFunction, expectInput: {
                [name: string]: string;
            }, expectOutput: string[]): {
                input: Set<string>;
                call: string;
                output: {
                    [name: string]: string;
                };
            };
            /**
             * @author Brendan Duncan / https://github.com/brendan-duncan
             */
            class WgslReflect {
                constructor(code: any);
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
                getStruct(name: any): any;
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
        }
    }
}
/** threejs like 4D lib */
declare namespace tesserxel {
    namespace four {
    }
}
declare namespace tesserxel {
    namespace four {
    }
}
