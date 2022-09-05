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
                for (let i = 0; i < m.length; i += rplus1) {
                    m.elem[i] = 1.0;
                }
                return m;
            }
            static subMatrix(startRow:number, startCol:number, rowCount: number, colCout:number){
                let m = new Matrix(rowCount,colCout);
                
            }
        }
    }
}