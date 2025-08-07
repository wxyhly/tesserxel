import { AffineMat4, Obj4 } from "../../math/algebra/affine.js";
/** Tetramesh store 4D mesh as tetrahedral list
 *  Each tetrahedral uses four vertices in the position list
 */
export interface TetraMeshData {
    position: Float32Array;
    normal?: Float32Array;
    uvw?: Float32Array;
    count?: number;
}
/** TetraIndexMesh is not supported for tetraslice rendering
 *  It is only used in data storage and mesh construction
 */
export interface TetraIndexMeshData {
    position: Float32Array;
    normal?: Float32Array;
    uvw?: Float32Array;
    positionIndex: Uint32Array;
    normalIndex?: Uint32Array;
    uvwIndex?: Uint32Array;
    count?: number;
}
export declare class TetraMesh implements TetraMeshData {
    position: Float32Array;
    normal?: Float32Array;
    uvw?: Float32Array;
    count?: number;
    constructor(d: TetraMeshData);
    applyAffineMat4(am: AffineMat4): this;
    applyObj4(obj4: Obj4): this;
    clone(): TetraMesh;
    toIndexMesh(): TetraIndexMesh;
    concat(mesh2: TetraMesh): TetraMesh;
    deleteTetras(tetras: number[]): TetraMesh;
    generateNormal(splitThreshold?: number): this;
    inverseNormal(): TetraMesh;
    setUVWAsPosition(): this;
}
export declare class TetraIndexMesh implements TetraIndexMeshData {
    position: Float32Array;
    normal?: Float32Array;
    uvw?: Float32Array;
    positionIndex: Uint32Array;
    normalIndex?: Uint32Array;
    uvwIndex?: Uint32Array;
    count?: number;
    constructor(d: TetraIndexMeshData);
    applyAffineMat4(am: AffineMat4): this;
    applyObj4(obj4: Obj4): this;
    toNonIndexMesh(): TetraMesh;
}
export declare function concat(meshes: TetraMeshData[]): TetraMesh;
