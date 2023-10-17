import { Mat3 } from "./mat3";
import { Mat4 } from "./mat4";
import { Vec3 } from "./vec3";
import { Vec4 } from "./vec4";

export interface ColumnVector extends Matrix {
    row: 1;
}
export interface RowVector extends Matrix {
    col: 1;
}
export class Matrix {
    elem: Float32Array;
    row: number;
    col: number;
    length: number;
    constructor(r: number, c?: number) {
        c = c ?? r;
        this.row = r; this.col = c;
        this.length = r * c;
        this.elem = new Float32Array(this.length);
    }
    static diag(...arr: number[]) {
        const n = arr.length;
        const nplus1 = n + 1;
        const m = new Matrix(n);
        for (let i = 0; i < n; i += nplus1) {
            m.elem[i] = arr[i];
        }
        return m;
    }
    diag() {
        const arr: number[] = [];
        let cplus1 = this.col + 1;
        const r_c = Math.min(this.row, this.col);
        for (let i = 0, l = 0; l < r_c && i < this.length; i += cplus1) {
            arr.push(this.elem[i]);
        }
        return arr;
    }
    static fromArray(arr: number[][]) {
        let m = new Matrix(arr.length, arr[0] ? arr[0].length : 0);
        m.elem.set(arr.flat());
        return m;
    }
    static fromMat3(mat3: Mat3) {
        let m = new Matrix(3);
        m.elem.set(mat3.elem);
        return m;
    }
    static fromMat4(mat4: Mat4) {
        let m = new Matrix(4);
        m.elem.set(mat4.elem);
        return m;
    }
    static fromVec4(vec4: Vec4) {
        let m = new Matrix(1, 4);
        m.elem.set([vec4.x, vec4.y, vec4.z, vec4.w]);
        return m;
    }
    static fromVec3(vec3: Vec3) {
        let m = new Matrix(1, 3);
        m.elem.set([vec3.x, vec3.y, vec3.z]);
        return m;
    }
    static fill(value: number, r: number, c?: number) {
        let m = new Matrix(r, c);
        m.elem.fill(value);
        return m;
    }
    static id(r: number, c?: number) {
        c = c ?? r;
        let m = new Matrix(r, c);
        let cplus1 = c + 1;
        const r_c = Math.min(r, c);
        for (let i = 0, l = 0; l < r_c && i < m.length; i += cplus1) {
            m.elem[i] = 1.0;
        }
        return m;
    }
    setElements(...args: number[]) {
        this.elem.set(args); return this;
    }
    copy(src: Matrix) {
        if (src.row !== this.row || src.col !== this.col) throw "Matrix dimension disagree";
        this.elem.set(src.elem); return this;
    }
    clone() {
        return new Matrix(this.row, this.col).copy(this);
    }
    toMat3() {
        if (this.row !== 3 || this.col !== 3) throw "Matrix dimension must be 3x3";
        return new Mat3(...this.elem);
    }
    toMat4() {
        if (this.row !== 4 || this.col !== 4) throw "Matrix dimension must be 4x4";
        return new Mat4(...this.elem);
    }
    toVec4() {
        if (this.row === 4 && this.col === 1) return new Vec4(...this.elem);
        if (this.row === 1 && this.col === 4) return new Vec4(...this.elem);
        throw "Matrix dimension must be 1x4 or 4x1";
    }
    toVec3() {
        if (this.row === 3 && this.col === 1) return new Vec3(...this.elem);
        if (this.row === 1 && this.col === 3) return new Vec3(...this.elem);
        throw "Matrix dimension must be 1x3 or 3x1";
    }
    to2DArray() {
        let arr: number[][] = [];
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
                    let temp = this.elem[a]; this.elem[a] = this.elem[b]; this.elem[b] = temp;
                }
            }
        } else {
            throw "not implemented yet for non square matrice";
        }
        let temp = this.col; this.col = this.row; this.row = temp;
        return this;
    }
    adds(m: Matrix) {
        for (let i = 0, l = m.length; i < l; i++) {
            this.elem[i] += m.elem[i];
        }
        return this;
    }
    addmulfs(m: Matrix, k: number) {
        for (let i = 0, l = m.length; i < l; i++) {
            this.elem[i] += m.elem[i] * k;
        }
        return this;
    }
    subs(m: Matrix) {
        for (let i = 0, l = m.length; i < l; i++) {
            this.elem[i] -= m.elem[i];
        }
        return this;
    }
    mulfs(k: number) {
        for (let i = 0, l = this.length; i < l; i++) {
            this.elem[i] *= k;
        }
        return this;
    }
    mulset(m1: Matrix, m2: Matrix) {
        if (m1 === this) return this.mulsr(m2);
        if (m2 === this) return this.mulsl(m1);
        const r1 = m1.row, r2 = m2.row;
        const c1 = m1.col, c2 = m2.col;
        if (c1 !== r2) throw "Inconsist matrices dimension";
        if (this.row !== r1 || this.col !== c2) throw "Inconsist destination matrix dimension";
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
    mul(m: Matrix) {
        const r1 = this.row, r2 = m.row;
        const c1 = this.col, c2 = m.col;
        if (c1 !== r2) throw "Inconsist matrices dimension";
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
    mulsr(m: Matrix) {
        const r1 = this.row, r2 = m.row;
        const c1 = this.col, c2 = m.col;
        if (c1 !== r2) throw "Inconsist matrices dimension";
        if (this.col !== c2) throw "Inconsist destination matrix dimension";
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
    mulsl(m: Matrix) {
        const r1 = m.row, r2 = this.row;
        const c1 = m.col, c2 = this.col;
        if (c1 !== r2) throw "Inconsist matrices dimension";
        if (this.row !== r1) throw "Inconsist destination matrix dimension";
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
    divfs(k: number) {
        k = 1 / k;
        for (let i = 0, l = this.length; i < l; i++) {
            this.elem[i] *= k;
        }
        return this;
    }
    get(r: number, c: number) {
        return this.elem[c + this.col * r];
    }
    set(r: number, c: number, value: number) {
        this.elem[c + this.col * r] = value; return this;
    }
    setFromSubMatrix(srcMat: Matrix, rows?: number, cols?: number, srcRowOffset: number = 0, srcColOffset: number = 0, dstRowOffset: number = 0, dstColOffset: number = 0) {

        const { row, col } = srcMat;
        rows ??= row; cols ??= col;

        for (
            let i = srcRowOffset, srcOffset = srcRowOffset * col, dstOffset = dstRowOffset * this.col;
            i < srcRowOffset + rows; i++, srcOffset += col, dstOffset += this.col
        ) {
            for (let j = srcColOffset, k = dstColOffset; j < srcColOffset + cols; j++, k++) {
                this.elem[k + dstOffset] = srcMat.elem[j + srcOffset];
            }
        }
        return this;
    }
    colVector(k: number) {
        return this.subMatrix(0, k, undefined, 1) as ColumnVector;
    }
    rowVector(k: number) {
        return this.subMatrix(k, 0, 1) as RowVector;
    }
    subMatrix(rowOffset: number, colOffset: number, row?: number, col?: number) {
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
        if (this.row !== this.col) throw "Square matrix expected";
        if (this.row === 1) return this.elem[0];
        if (this.row === 2) return this.elem[0] * this.elem[3] - this.elem[1] * this.elem[2];
        let det = 0;
        const elem = this.elem;
        const n = this.row - 1;
        const subMat = new Matrix(n);
        for (let i = 0; i < this.col; i++) {
            if (i) subMat.setFromSubMatrix(this, n, i, 1, 0);
            if (i !== n) subMat.setFromSubMatrix(this, n, n - i, 1, i + 1, 0, i);
            det += (i & 1) === 0 ? elem[i] * subMat.det() : -elem[i] * subMat.det();
        }
        return det;
    }
    decomposeQR() {
        const m = this.row;
        const n = this.col;

        const qv: Matrix[] = [];

        // temp array
        const z = this.clone();
        let z1: Matrix;

        for (let k = 0; k < n && k < m - 1; k++) {

            let e = new Matrix(m, 1) as ColumnVector, x: ColumnVector;
            let a: number;
            z1 = Matrix.id(m, n);
            z1.setFromSubMatrix(z, m - k, n - k, k, k, k, k);
            x = z1.colVector(k);

            a = x.norm();
            if (this.get(k, k) > 0) a = -a;

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
                        if (i === j) qv[k].elem[kk] += 1;
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
    SVdecompose(iterations: number = 10) {
        // m = O L O'
        function OLOdecompose(m: Matrix) {
            const tempMat = m.clone();
            let { Q, R } = tempMat.decomposeQR();
            const qv = Q.clone();
            for (let i = 0; i < iterations; i++) {
                tempMat.mulset(R, Q);
                const { Q: Q2, R: R2 } = tempMat.decomposeQR();
                qv.mulsr(Q2);
                Q = Q2; R = R2;
            }
            return { O: qv, L: tempMat.clone() }
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
        }
    }
}