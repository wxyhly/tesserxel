namespace tesserxel {
    export namespace math {
        export class Matrix {
            data: number[];
            r: number;
            c: number;
            constructor(r: number, c?: number) {
                c = c ?? r;
                this.r = r; this.c = c;
            }
            
        }
    }
}