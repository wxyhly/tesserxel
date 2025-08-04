/// <reference types="@webgpu/types" />
import { Vec4 } from "../math/algebra/vec4";
import { Obj4 } from "../math/algebra/affine";
import { PerspectiveCamera } from "./scene";
import { AABB, Plane } from "../math/geometry/primitive";
import { IWireframeRenderState } from "../render/slice/interfaces";
import { CWMesh } from "../mesh/mesh";
export interface WireFrameObject extends Obj4 {
    lines: [Vec4, Vec4][];
    visible?: boolean;
    _jsBuffer?: [Vec4, Vec4][];
    obb?: AABB;
}
export declare class WireFrameTesseractoid extends Obj4 implements WireFrameObject, WireFrameOccluder {
    lines: [Vec4, Vec4][];
    cells: Plane[];
    subCells: [number, number][];
    obb: AABB;
    visible: boolean;
    transparent: boolean;
    constructor(size: Vec4);
}
export declare class WireFrameConvexPolytope extends Obj4 implements WireFrameObject, WireFrameOccluder {
    lines: [Vec4, Vec4][];
    cells: Plane[];
    subCells: [number, number][];
    obb: AABB;
    visible: boolean;
    transparent: boolean;
    constructor(cwmesh: CWMesh);
}
export declare class WireFrameScene {
    occluders: WireFrameOccluder[];
    objects: WireFrameObject[];
    camera: PerspectiveCamera;
    jsBuffer: Float32Array;
    gpuBuffer: GPUBuffer;
    maxGpuBufferSize: number;
    clipEpsilon: number;
    add(...o: (WireFrameObject | WireFrameOccluder)[]): void;
    private occludeFrustum;
    private calcViewBoundary;
    private occludeOccluders;
    private clipLine;
    render(rs: IWireframeRenderState, objs?: WireFrameObject[]): void;
}
export interface WireFrameOccluder extends Obj4 {
    obb?: AABB;
    cells: Plane[];
    /** if transparent is true, this occluder will be disabled */
    transparent?: boolean;
    subCells: [number, number][];
    _inside?: boolean;
    _worldBorders?: Plane[];
}
