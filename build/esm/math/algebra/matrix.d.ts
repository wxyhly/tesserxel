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
export declare class Matrix {
    elem: Float32Array;
    row: number;
    col: number;
    length: number;
    constructor(r: number, c?: number);
    static diag(...arr: number[]): Matrix;
    diag(): number[];
    static fromArray(arr: number[][]): Matrix;
    static fromMat3(mat3: Mat3): Matrix;
    static fromMat4(mat4: Mat4): Matrix;
    static fromVec4(vec4: Vec4): Matrix;
    static fromVec3(vec3: Vec3): Matrix;
    static fill(value: number, r: number, c?: number): Matrix;
    static id(r: number, c?: number): Matrix;
    setElements(...args: number[]): this;
    copy(src: Matrix): this;
    clone(): Matrix;
    toMat3(): Mat3;
    toMat4(): Mat4;
    toVec4(): Vec4;
    toVec3(): Vec3;
    to2DArray(): number[][];
    ts(): this;
    adds(m: Matrix): this;
    addmulfs(m: Matrix, k: number): this;
    subs(m: Matrix): this;
    mulfs(k: number): this;
    mulset(m1: Matrix, m2: Matrix): this;
    mul(m: Matrix): Matrix;
    mulsr(m: Matrix): this;
    mulsl(m: Matrix): this;
    norm(): number;
    norm1(): number;
    norms(): this;
    normSqr(): number;
    divfs(k: number): this;
    get(r: number, c: number): number;
    set(r: number, c: number, value: number): this;
    setFromSubMatrix(srcMat: Matrix, rows?: number, cols?: number, srcRowOffset?: number, srcColOffset?: number, dstRowOffset?: number, dstColOffset?: number): this;
    colVector(k: number): any;
    rowVector(k: number): RowVector;
    subMatrix(rowOffset: number, colOffset: number, row?: number, col?: number): Matrix;
    det(): number;
    decomposeQR(): {
        Q: Matrix;
        R: Matrix;
    };
    SVdecompose(iterations?: number): {
        U: Matrix;
        V: Matrix;
        L: Matrix;
    };
}
