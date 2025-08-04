import { Vec4 } from "../../math/algebra/vec4";
import { Bivec } from "../../math/math";
export declare type FaceId = number;
export declare type Simplex = number[];
export declare type Face = Array<FaceId>;
export declare type FaceOrientaion = Array<boolean>;
export declare type DimList<T> = Array<T>;
export declare type CWMeshStructData = DimList<Face[] | Vec4[]>;
export declare type OrientaionData = DimList<FaceOrientaion[]>;
export declare type CWMeshSelectionData = DimList<Set<FaceId>>;
export declare type RankedCWMap = DimList<Map<FaceId, FaceId>>;
export declare class CWMeshSelection {
    cwmesh: CWMesh;
    selData: CWMeshSelectionData;
    constructor(cwmesh: CWMesh, data?: CWMeshSelectionData);
    clone(): CWMeshSelection;
    closure(): CWMeshSelection;
    addFace(dim: number, faceId: FaceId): this;
}
export declare class CWMesh {
    data: CWMeshStructData;
    orientation: OrientaionData;
    clone(): CWMesh;
    sort2DFace(): void;
    flipOrientation(dim: number, faceIds?: FaceId[]): void;
    /** tested with bug here (for examples/#cwmesh::duopy5 ), some faces orientations are not consisted */
    calculateOrientation(dim: number, faceIds?: FaceId[]): void;
    calculateOrientationInFace(dim: number, faceId: FaceId): void;
    deleteSelection(sel: CWMeshSelection): RankedCWMap;
    dim(): number;
    findBorder(dim: number, faceIds?: Set<FaceId>): Map<number, number>;
    getAllSelection(): CWMeshSelection;
    triangulate(dim: number, faceIds: number[], orientations?: boolean[]): Simplex[][];
    getDualData(dim: number, faceIds?: number[]): DimList<Map<number, Set<number>>>;
    duplicate(sel?: CWMeshSelection, notCheckselectionClosure?: boolean): DimList<Map<number, number>>;
    bridge(mapInfo: DimList<Map<FaceId, FaceId>>): DimList<Map<number, number>>;
    topologicalExtrude(sel?: CWMeshSelection): {
        cloneInfo: DimList<Map<number, number>>;
        bridgeInfo: DimList<Map<number, number>>;
    };
    topologicalCone(sel?: CWMeshSelection, notCheckselectionClosure?: boolean): {
        coneVertex: number;
        map: DimList<Map<number, number>>;
    };
    topologicalProduct(shape2: CWMesh, thisSel?: CWMeshSelection, shape2Sel?: CWMeshSelection): DimList<Map<number, DimList<Map<number, number>>>>;
    apply(verticesCalls: (vertex: Vec4) => Vec4): this;
    makePrism(direction: Vec4, alignCenter: boolean, sel?: CWMeshSelection): {
        cloneInfo: DimList<Map<number, number>>;
        bridgeInfo: DimList<Map<number, number>>;
    };
    makeRotatoid(bivec: Bivec, segment: number, angle?: number): DimList<Map<number, DimList<Map<number, number>>>>;
    makePyramid(point: Vec4, sel?: CWMeshSelection): {
        coneVertex: number;
        map: DimList<Map<number, number>>;
    };
    makeDirectProduct(shape2: CWMesh, thisSel?: CWMeshSelection, shape2Sel?: CWMeshSelection): DimList<Map<number, DimList<Map<number, number>>>>;
    makeDual(): CWMesh;
}
