import { CosetTable } from "../algebra/group";
import { Bivec, Rotor, Vec4 } from "../math";

export class Polytope {
    private gens: string;
    private rels: string[];
    private schlafli: number[];
    private fullgroupRepresentatives: number[][];
    private fullgroupTable: CosetTable;

    // reflection directions: these dirs are sqrt(1/2) length for calc convenience
    // [b2[0], 0 ..]
    // [b1[1],b2[1],0..]
    // [0,b1[2],b2[2],0..]
    // [0,0,b1[2],b2[2],0..]
    // ...
    private basis1 = [0,];
    private basis2 = [1,];

    constructor(schlafli: number[]) {
        let len = schlafli.length + 1;
        this.schlafli = schlafli;

        // get group descriptors

        let gens = "";
        let rels: string[] = [];
        for (let i = 0; i < len; i++) {
            gens += i;
        }
        for (let i = 0; i < len; i++) {
            const si = i.toString();
            for (let j = i; j < len; j++) {
                const sj = j.toString();
                const mij = i === j ? 1 : j === i + 1 ? schlafli[i] : 2;
                rels.push((si + sj).repeat(mij));
            }
        }
        this.gens = gens;
        this.rels = rels;

        // get reflection descriptors

        for (let i = 1; i < len; i++) {
            const cos = Math.cos(Math.PI / this.schlafli[i - 1]);
            this.basis1.push(Math.abs(cos / this.basis2[i - 1]));
            this.basis2.push(Math.sqrt(1 - this.basis1[i] * this.basis1[i]));
        }
        // these dirs are sqrt(1/2) length for calc convenience
        for (let i = 1; i < len; i++) {
            this.basis1[i] *= Math.SQRT2;
            this.basis2[i] *= Math.SQRT2;
        }
    }
    private generateVertices(v0: Vec4, cosetTable: CosetTable) {
        const vertices = new Array<Vec4>(cosetTable.length);
        vertices[0] = v0.clone();
        for (const [c, coset] of cosetTable.cosets.entries()) {
            const v = vertices[c];
            for (const [x, cx] of coset.entries()) {
                if (vertices[cx]) continue;
                if (x === 0) {
                    const nv = v.clone(); nv.x = -nv.x;
                    vertices[cx] = nv; continue;
                }

                const vs = v.flat();
                // these dirs are sqrt(1/2) length, no need to mul 2
                const proj = (vs[x - 1] * this.basis1[x] + vs[x] * this.basis2[x]);
                vs[x - 1] -= proj * this.basis1[x];
                vs[x] -= proj * this.basis2[x];
                vertices[cx] = new Vec4(...vs);
            }
        }
        return vertices;
    }
    private getInitVertex(vertexPosition: number[]) {
        if (this.gens.length !== vertexPosition.length + 1) throw ("Polytope.getInitVertex: vertexPosition length must be" + (this.gens.length - 1));
        const pqr = vertexPosition.slice(0);
        const remain = pqr.length ? 1 - pqr.reduce((a, b) => a + b) : 1;
        if (remain < 0) throw "vertexPosition's sum must be less than or equal to 1";
        pqr.push(remain);
        const basisVec = [Vec4.x];
        for (let i = 1; i < this.basis1.length; i++) {
            const v = [0, 0, 0, 0];
            v[i - 1] = this.basis1[i];
            v[i] = this.basis2[i];
            basisVec.push(new Vec4(...v));
        }
        const points: Vec4[] = [];
        for (let j = 0; j < this.gens.length; j++) {
            let a: Vec4 | Bivec;
            for (let i = 0; i < this.gens.length; i++) {
                if (i === j) continue;
                if (!a) { a = basisVec[i]; continue; }
                if (a instanceof Vec4) { a = a.wedge(basisVec[i]); continue; }
                if (a instanceof Bivec) { a = a.wedgev(basisVec[i]); continue; }
            }
            if (vertexPosition.length === 1) {
                const na = (a as Vec4).yxzw(); na.x = -na.x;
                points.push(na);
            } else if (vertexPosition.length === 2) {
                points.push((a as Bivec).wedgev(Vec4.w));
            } else if (vertexPosition.length === 3) {
                points.push(a as Vec4);
            }
        }
        const v0 = new Vec4;
        for (const [i, k] of pqr.entries()) {
            v0.addmulfs(points[i].norms(), k);
        }
        return v0;
    }
    generateFaceLinkTable(srcNum: number, srcTable: number[], destTable: number[]) {
        const src: Set<number>[] = new Array(srcNum);
        for (let i = 0; i < srcTable.length; i++) {
            src[srcTable[i]] ??= new Set<number>();
            src[srcTable[i]].add(destTable[i]);
        }
        return src.map(e => Array.from(e));
    }
    getRegularPolytope() {
        if(this.gens.length === 1) return [];
        // kface[0] : Vtable, kface[1] : Etable...
        const kfaceTable = this.getFirstStructure();
        let pqr = new Array(this.gens.length - 1);
        pqr.fill(0); if (pqr.length) pqr[0] = 1;
        const V = this.gens.length > 4 ? kfaceTable[0].cosetTable.cosets.map(() => new Array<number>()) : this.generateVertices(this.getInitVertex(pqr), kfaceTable[0].cosetTable);
        let polytope: (Array<number>[] | Vec4[])[] = [V];
        for (let i = 1; i < this.gens.length; i++) {
            polytope.push(this.generateFaceLinkTable(kfaceTable[i].cosetTable.length, kfaceTable[i].subGroupTable, kfaceTable[i - 1].subGroupTable));
        }
        return polytope;
    }
    getStructures(subgroups:string[][]){
        this.fullgroupTable ??= new CosetTable(this.gens, this.rels, []).enumerate();
        this.fullgroupRepresentatives ??= this.fullgroupTable.getRepresentatives();
        const table: { cosetTable: CosetTable, subGroupTable: number[] }[] = [];
        return subgroups.map(subgroup=>{
            const cosetTable = new CosetTable(this.gens, this.rels, subgroup).enumerate();
            const subGroupTable = this.fullgroupRepresentatives.map(w => cosetTable.findCoset(w));
            return { cosetTable, subGroupTable };
        })
    }

    
    getFirstStructure() {
        this.fullgroupTable ??= new CosetTable(this.gens, this.rels, []).enumerate();
        this.fullgroupRepresentatives ??= this.fullgroupTable.getRepresentatives();
        const table: { cosetTable: CosetTable, subGroupTable: number[] }[] = [];
        for (let i = 0; i < this.gens.length; i++) {
            // example: V: "b,c,d"  E: "a,c,d" F: "a,b,d" C: "a,b,c"
            const subgroup = Array.from(this.gens); subgroup.splice(i, 1);
            const cosetTable = new CosetTable(this.gens, this.rels, subgroup).enumerate();
            const subGroupTable = this.fullgroupRepresentatives.map(w => cosetTable.findCoset(w));
            table.push({ cosetTable, subGroupTable });
        }
        return table;
    }

    
    getPolytope() {
        if(this.gens.length === 1) return [];
        // kface[0] : Vtable, kface[1] : Etable...
        const kfaceTable = this.getFirstStructure();
        let pqr = new Array(this.gens.length - 1);
        pqr.fill(1/pqr.length);
        const V = this.gens.length > 4 ? kfaceTable[0].cosetTable.cosets.map(() => new Array<number>()) : this.generateVertices(this.getInitVertex(pqr), kfaceTable[0].cosetTable);
        let polytope: (Array<number>[] | Vec4[])[] = [V];
        for (let i = 1; i < this.gens.length; i++) {
            polytope.push(this.generateFaceLinkTable(kfaceTable[i].cosetTable.length, kfaceTable[i].subGroupTable, kfaceTable[i - 1].subGroupTable));
        }
        return polytope;
    }
}