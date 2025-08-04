import { FaceIndexMesh, FaceIndexMeshData } from "./face/facemesh";
import { TetraIndexMesh } from "./tetra/tetramesh";
interface IndexMesh extends FaceIndexMeshData {
    positionIndex?: Uint32Array;
    normalIndex?: Uint32Array;
    uvwIndex?: Uint32Array;
    count?: number;
}
export declare class ObjFile {
    data: string;
    constructor(data: string | TetraIndexMesh | FaceIndexMesh);
    private stringify;
    parse(): IndexMesh;
}
export {};
