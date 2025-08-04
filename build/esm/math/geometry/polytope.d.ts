import { CosetTable } from "../algebra/group";
import { Vec4 } from "../math";
export declare class Polytope {
    private gens;
    private rels;
    private schlafli;
    private fullgroupRepresentatives;
    private fullgroupTable;
    private basis1;
    private basis2;
    constructor(schlafli: number[]);
    private generateVertices;
    private getInitVertex;
    generateFaceLinkTable(srcNum: number, srcTable: number[], ...destTable: number[][]): number[][];
    getRegularPolytope(): (number[][] | Vec4[])[];
    getTrucatedRegularPolytope(t: number): (number[][] | Vec4[])[];
    getBitrucatedRegularPolytope(t?: number): (number[][] | Vec4[])[];
    getStructures(subgroups: string[][]): {
        cosetTable: CosetTable;
        subGroupTable: number[];
    }[];
    getFirstStructure(): {
        cosetTable: CosetTable;
        subGroupTable: number[];
    }[];
    getTrucatedStructure(): {
        cosetTable: CosetTable;
        subGroupTable: number[];
    }[];
    getBitrucatedStructure(): {
        cosetTable: CosetTable;
        subGroupTable: number[];
    }[];
    getPolytope(): (number[][] | Vec4[])[];
}
