/// <reference types="@webgpu/types" />
import { AffineMat4, Obj4 } from "../math/algebra/affine.js";
import { Vec4 } from "../math/algebra/vec4.js";
import { OrthographicCamera as IOrthographicCamera, PerspectiveCamera as IPerspectiveCamera } from "../math/geometry/camera.js";
import { AABB } from "../math/geometry/primitive.js";
import { TetraMesh, TetraMeshData } from "../mesh/tetra.js";
import { RaytracingPipeline, RaytracingPipelineDescriptor } from "../render/slice/slice.js";
import { Material } from "./material.js";
import { Renderer } from "./renderer.js";
import { WireFrameScene } from "./wireframe.js";
export declare class Scene {
    child: Object[];
    backGroundColor: GPUColor;
    skyBox?: SkyBox;
    wireframe?: WireFrameScene;
    add(...obj: Object[]): void;
    removeChild(obj: Object): void;
    setBackgroudColor(color: GPUColor): void;
}
export declare class Object extends Obj4 {
    child: Object[];
    worldCoord: AffineMat4;
    needsUpdateCoord: boolean;
    alwaysUpdateCoord: boolean;
    visible: boolean;
    constructor();
    updateCoord(): this;
    add(...obj: Object[]): void;
    removeChild(obj: Object): void;
}
export declare class PerspectiveCamera extends Object implements IPerspectiveCamera {
    fov: number;
    near: number;
    far: number;
    alwaysUpdateCoord: boolean;
    needsUpdate: boolean;
}
export declare class OrthographicCamera extends Object implements IOrthographicCamera {
    size: number;
    near: number;
    far: number;
    alwaysUpdateCoord: boolean;
    needsUpdate: boolean;
}
export declare type Camera = PerspectiveCamera | OrthographicCamera;
export declare class Mesh extends Object {
    geometry: Geometry;
    material: Material;
    uObjMatBuffer: GPUBuffer;
    bindGroup: GPUBindGroup;
    constructor(geometry: Geometry, material: Material);
}
export declare class Geometry {
    jsBuffer: TetraMesh;
    gpuBuffer: {
        [name: string]: GPUBuffer;
    };
    needsUpdate: boolean;
    dynamic: boolean;
    obb: AABB;
    constructor(data: TetraMeshData);
    updateOBB(): void;
}
export declare abstract class SkyBox {
    pipeline: RaytracingPipeline;
    uBuffer: GPUBuffer;
    jsBuffer: Float32Array;
    compiling: boolean;
    compiled: boolean;
    needsUpdate: boolean;
    bindGroups: GPUBindGroup[];
    readonly bufferSize: number;
    uuid: string;
    static readonly commonCode: string;
    compile(r: Renderer): Promise<void>;
    abstract getShaderCode(): RaytracingPipelineDescriptor;
    constructor();
    getBindgroups(r: Renderer): void;
    update(r: Renderer): void;
}
export declare class SimpleSkyBox extends SkyBox {
    readonly bufferSize = 8;
    constructor();
    setSunPosition(pos: Vec4): void;
    setOpacity(o: number): void;
    getOpacity(): number;
    getSunPosition(): Vec4;
    getShaderCode(): RaytracingPipelineDescriptor;
}
