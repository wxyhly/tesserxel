import { AffineMat4, Obj4 } from "../../math/algebra/affine.js";
import { Vec4 } from "../../math/algebra/vec4.js";
/** FaceMesh store traditional 2-face mesh as triangle or quad list
 *  This mesh is for constructing complex tetrameshes
 *  It is not aimed for rendering purpose
 */
export interface FaceMeshData {
    quad?: {
        position: Float32Array;
        normal?: Float32Array;
        uvw?: Float32Array;
        count?: number;
    };
    triangle?: {
        position: Float32Array;
        normal?: Float32Array;
        uvw?: Float32Array;
        count?: number;
    };
}
export declare class FaceMesh implements FaceMeshData {
    quad?: {
        position: Float32Array;
        normal?: Float32Array;
        uvw?: Float32Array;
        count?: number;
    };
    triangle?: {
        position: Float32Array;
        normal?: Float32Array;
        uvw?: Float32Array;
        count?: number;
    };
    constructor(d: FaceMeshData);
    applyAffineMat4(am: AffineMat4): this;
    applyObj4(obj4: Obj4): this;
    toIndexMesh(): FaceIndexMesh;
    clone(): FaceMesh;
    concat(m2: FaceMesh): FaceMesh;
    setConstantNormal(n: Vec4): this;
}
export interface FaceIndexMeshData {
    position: Float32Array;
    normal?: Float32Array;
    uvw?: Float32Array;
    quad?: {
        position: Uint32Array;
        normal?: Uint32Array;
        uvw?: Uint32Array;
        count?: number;
    };
    triangle?: {
        position: Uint32Array;
        normal?: Uint32Array;
        uvw?: Uint32Array;
        count?: number;
    };
}
export declare class FaceIndexMesh implements FaceIndexMeshData {
    position: Float32Array;
    normal?: Float32Array;
    uvw?: Float32Array;
    quad?: {
        position: Uint32Array;
        normal?: Uint32Array;
        uvw?: Uint32Array;
        count?: number;
    };
    triangle?: {
        position: Uint32Array;
        normal?: Uint32Array;
        uvw?: Uint32Array;
        count?: number;
    };
    constructor(d: FaceIndexMeshData);
    applyAffineMat4(am: AffineMat4): this;
    applyObj4(obj4: Obj4): this;
    toNonIndexMesh(): FaceMesh;
    clone(): FaceIndexMesh;
    setConstantNormal(n: Vec4): this;
    concat(m2: FaceIndexMesh): FaceIndexMesh;
}
