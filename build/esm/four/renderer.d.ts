import { SliceRenderer, TetraSlicePipeline } from "../render/slice/slice.js";
import { GPU } from "../render/gpu.js";
import { DirectionalLight, PointLight, SpotLight } from "./light.js";
import { Camera, Mesh, Object, Scene } from "./scene.js";
import { Material } from "./material.js";
import { Vec3 } from "../math/algebra/vec3.js";
export interface RendererConfig {
    posdirLightsNumber?: number;
    spotLightsNumber?: number;
}
/** threejs like 4D lib */
export declare class Renderer {
    core: SliceRenderer;
    gpu: GPU;
    canvas: HTMLCanvasElement;
    pipelines: {
        [label: string]: TetraSlicePipeline | "compiling";
    };
    jsBuffer: Float32Array<ArrayBuffer>;
    uCamMatBuffer: GPUBuffer;
    uWorldLightBuffer: GPUBuffer;
    lightShaderInfomation: {
        posdirLightsNumber: number;
        spotLightsNumber: number;
        lightCode: string;
        uWorldLightBufferSize: number;
    };
    autoSetSizeHandler: () => void;
    private cameraInScene;
    private safeTetraNumInOnePass;
    private tetraNumOccupancyRatio;
    private maxTetraNumInOnePass;
    private context;
    constructor(canvas: HTMLCanvasElement, config?: RendererConfig);
    setBackgroundColor(color: GPUColor): void;
    init(): Promise<this>;
    fetchPipelineName(identifier: string): string;
    fetchPipeline(identifier: string): TetraSlicePipeline | "compiling";
    pullPipeline(identifier: string, pipeline: TetraSlicePipeline | "compiling"): void;
    updateObject(o: Object): void;
    addToDrawList(m: Mesh): void;
    compileMaterials(mats: Iterable<Material> | Scene): Promise<void>;
    updateMesh(m: Mesh): void;
    updateScene(scene: Scene): void;
    updateSkyBox(scene: Scene): void;
    ambientLightDensity: Vec3;
    directionalLights: DirectionalLight[];
    spotLights: SpotLight[];
    pointLights: PointLight[];
    drawList: DrawList;
    activeCamera: Camera;
    setCamera(camera: Camera): void;
    render(scene: Scene, camera: Camera): void;
    setSize(size: GPUExtent3DStrict): void;
    private clearState;
}
interface DrawList {
    [group: string]: {
        pipeline: TetraSlicePipeline;
        meshes: Mesh[];
        bindGroup: {
            group: number;
            binding: GPUBindGroup;
        };
        tetraCount: number;
        next?: string;
    };
}
export {};
