namespace tesserxel {
    export namespace math {
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
            static id(r: number) {
                let m = new Matrix(r);
                let rplus1 = r + 1;
                for (let i = 0, l = m.length; i < l; i += rplus1) {
                    m.elem[i] = 1.0;
                }
                return m;
            }
            set(...args: number[]) {
                this.elem.set(args); return this;
            }
            copy(src: Matrix) {
                this.elem.set(src.elem); return this;
            }
            // setsubmat( // todo
            //     src: Matrix, srcRow: number, srcCol: number, srcRowCount: number, srcColCount: number,
            //     dstRow: number, dstCol: number
            // ) {
            //     this.elem.set(m.elem); return this;
            // }
            clone(m: Matrix) {
                return new Matrix(this.row, this.col).copy(this);
            }

            adds(m: Matrix) {
                for (let i = 0, l = m.length; i < l; i++) {
                    this.elem[i] += m.elem[i];
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
            divfs(k: number) {
                k = 1 / k;
                for (let i = 0, l = this.length; i < l; i++) {
                    this.elem[i] *= k;
                }
                return this;
            }
            at(r: number, c: number) {
                return this.elem[r + this.row * c];
            }
            setAt(value: number, r: number, c: number) {
                this.elem[r + this.row * c] = value; return this;
            }
            static subMatrix(startRow: number, startCol: number, rowCount: number, colCout: number) {
                let m = new Matrix(rowCount, colCout);

            }
        }
    }
}