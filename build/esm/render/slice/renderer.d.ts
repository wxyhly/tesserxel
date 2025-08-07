/// <reference types="@webgpu/types" />
import { AffineMat4, Obj4 } from "../../math/algebra/affine.js";
import { Mat4 } from "../../math/algebra/mat4.js";
import { Vec4 } from "../../math/algebra/vec4.js";
import { OrthographicCamera, PerspectiveCamera } from "../../math/geometry/camera.js";
import { AABB } from "../../math/geometry/primitive.js";
import { GPU } from "../gpu.js";
import { DisplayConfig, IWireframeRenderState, RaytracingPipelineDescriptor, RetinaRenderPassDescriptor, RetinaSliceFacing, SectionConfig, SliceRendererConfig, TetraSlicePipelineDescriptor } from "./interfaces.js";
import { RaytracingPipeline, TetraSlicePipeline } from "./pipeline.js";
import { RenderState as IRenderState, RetinaRenderPass as IRetinaRenderPass } from "./interfaces.js";
/** Internal use for SliceRenderer's Display Configs */
export interface InternalDisplayConfig extends DisplayConfig {
    opacity: number;
    paddedSliceNum: number;
    sliceGroupNum: number;
    totalGroupNum: number;
    enableStereo: boolean;
}
/** Internal use for SliceRenderer's Base Configs */
export interface InternalSliceRendererConfig extends SliceRendererConfig {
    /** log2 of sliceGroupSize in SliceRendererConfig */
    sliceGroupSizeBit: number;
    /** A gpu device limit to set textures as large as possible */
    maxTextureSize: number;
    /** viewport data is compressed in gpu buffer, this gives the amount */
    viewportCompressShift: number;
    /** SliceTexture is a big 2d texuture containing all slices within a slice group*/
    sliceTextureWidth: number;
    sliceTextureHeight: number;
}
export declare class SliceRenderer {
    gpu: GPU;
    private tetraBuffers;
    private sliceBuffers;
    private crossRenderPass;
    private retinaRenderPass;
    private screenRenderPass;
    private rendererConfig;
    private displayConfig;
    private wireframeRenderPass;
    constructor(gpu: GPU, config?: SliceRendererConfig);
    init(): Promise<this>;
    createRetinaRenderPass(descriptor: RetinaRenderPassDescriptor): IRetinaRenderPass;
    setRetinaRenderPass(retinaRenderPass: IRetinaRenderPass): void;
    getCurrentRetinaRenderPass(): IRetinaRenderPass;
    setDisplayConfig(config: DisplayConfig): void;
    getSafeTetraNumInOnePass(): number;
    getStereoMode(): boolean;
    getMinResolutionMultiple(): number;
    getDisplayConfig(configNames: 'canvasSize'): GPUExtent3DStrict;
    getDisplayConfig(configNames: 'sections'): SectionConfig[];
    getDisplayConfig(configNames: 'retinaViewMatrix'): Mat4;
    getDisplayConfig(configNames: 'camera3D' | 'camera4D'): PerspectiveCamera | OrthographicCamera;
    getDisplayConfig(configNames: "screenBackgroundColor" | "retinaClearColor"): GPUColor;
    getDisplayConfig(configNames: 'retinaLayers' | 'retinaResolution' | 'opacity' | 'sectionStereoEyeOffset' | 'retinaStereoEyeOffset' | 'crosshair'): number;
    render(context: GPUCanvasContext, drawCall: (rs: IRenderState) => void, wireFrameDrawCall?: (rs: IWireframeRenderState) => void): void;
    createTetraSlicePipeline(descriptor: TetraSlicePipelineDescriptor): Promise<TetraSlicePipeline>;
    createRaytracingPipeline(descriptor: RaytracingPipelineDescriptor): Promise<RaytracingPipeline>;
    /** for TetraSlicePipeline, vertex shader is internally a compute shader, so it doesn't share bindgroups with fragment shader.
     *  for RaytracingPipeline, vertex shader and fragment shader are in one traditional render pipeline, they share bindgroups.
     */
    createVertexShaderBindGroup(pipeline: TetraSlicePipeline | RaytracingPipeline, index: number, buffers: GPUBuffer[], label?: string): GPUBindGroup;
    /** for TetraSlicePipeline, vertex shader is internally a compute shader, so it doesn't share bindgroups with fragment shader.
     *  for RaytracingPipeline, vertex shader and fragment shader are in one traditional render pipeline, they share bindgroups.
     */
    createFragmentShaderBindGroup(pipeline: TetraSlicePipeline | RaytracingPipeline, index: number, buffers: GPUBuffer[], label?: string): GPUBindGroup;
}
export declare class RetinaSliceBufferMgr {
    private queue;
    private rendererConfig;
    currentRetinaFacing: RetinaSliceFacing;
    retinaMVMatChanged: boolean;
    retinaFacingOrSlicesChanged: boolean;
    uniformsBuffer: GPUBuffer;
    thumbnailViewportBuffer: GPUBuffer;
    retinaProjectJsBuffer: Float32Array;
    retinaMVMatJsBuffer: Float32Array;
    camProjJsBuffer: Float32Array;
    slicesJsBuffer: Float32Array;
    sliceGroupOffsetBuffer: GPUBuffer;
    emitIndexSliceBuffer: GPUBuffer;
    constructor(gpu: GPU, config: InternalSliceRendererConfig);
    updateBuffers(sliceGroupNum: number): void;
    deepCopySectionConfigs(sectionConfigs: SectionConfig[], defaultRetinaResolution?: number): SectionConfig[];
    setSlicesAndSections(internalDisplayConfig: InternalDisplayConfig, displayConfig: DisplayConfig): void;
    setRetinaProjectMatrix(camera: PerspectiveCamera | OrthographicCamera): void;
    setRetinaViewMatrix(m: Mat4): void;
    getRetinaCamera(): PerspectiveCamera | OrthographicCamera;
    setCameraProjectMatrix(camera: PerspectiveCamera | OrthographicCamera): void;
    getFacing(x: number, y: number, z: number): RetinaSliceFacing;
}
declare class CrossRenderPass {
    descClear: GPURenderPassDescriptor;
    descLoad: GPURenderPassDescriptor;
    clearRenderPipelinePromise: Promise<GPURenderPipeline>;
    clearRenderPipeline: GPURenderPipeline;
    sliceTextureSize: {
        width: number;
        height: number;
    };
    sliceView: GPUTextureView;
    constructor(gpu: GPU);
    init(): Promise<void>;
}
export declare class TetraSliceBufferMgr {
    maxCrossSectionBufferSize: number;
    gpu: GPU;
    outputVaryBufferPool: Array<GPUBuffer>;
    private indicesInOutputBufferPool;
    buffers: {
        buffer: GPUBuffer;
    }[];
    constructor(gpu: GPU, config: InternalSliceRendererConfig, sliceBuffers: RetinaSliceBufferMgr);
    init(): void;
    prepareNewPipeline(): GPUBuffer[];
    destroy(): void;
    requireOutputBuffer(id: number, size: number, outBuffers: GPUBuffer[]): GPUBuffer;
}
export declare class WireFrameRenderPass {
    private pipeline;
    private pipelinePromise;
    dataBuffer: GPUBuffer;
    private bindGroup;
    gpu: GPU;
    private config;
    renderState: RenderState;
    renderPassDesc: GPURenderPassDescriptor;
    constructor(gpu: GPU, config: InternalSliceRendererConfig);
    init(): Promise<void>;
    render(buffer: GPUBuffer, vertices: number): void;
}
declare class RenderState {
    commandEncoder: GPUCommandEncoder;
    computePassEncoder: GPUComputePassEncoder;
    pipeline: TetraSlicePipeline;
    tetraSliceBufferMgr: TetraSliceBufferMgr;
    config: InternalSliceRendererConfig;
    sliceIndex: number;
    needClear: boolean;
    tetraBuffers: TetraSliceBufferMgr;
    sliceBuffers: RetinaSliceBufferMgr;
    crossRenderPass: CrossRenderPass;
    frustumRange: Vec4[];
    constructor(gpu: GPU, config: InternalSliceRendererConfig, sliceBuffers: RetinaSliceBufferMgr, tetraBuffers: TetraSliceBufferMgr, crossRenderPass: CrossRenderPass);
    /** Set TetraSlicePipeline and prepare GPU resources.
     *  Next calls should be function sliceTetras or setBindGroup.
     */
    beginTetras(pipeline: TetraSlicePipeline): void;
    setBindGroup(index: number, bindGroup: GPUBindGroup): void;
    /** Compute slice of given bindgroup attribute data.
     *  beginTetras should be called at first to specify a tetraSlicePipeline
     *  Next calls should be function sliceTetras, setBindGroup or drawTetras.
     */
    sliceTetras(vertexBindGroup: GPUBindGroup, tetraCount: number, instanceCount?: number): void;
    /** This function draw slices on a internal framebuffer
     *  Every beginTetras call should be end with drawTetras call
     */
    drawTetras(bindGroups?: {
        group: number;
        binding: GPUBindGroup;
    }[]): void;
    drawRaytracing(pipeline: RaytracingPipeline, bindGroups?: GPUBindGroup[]): void;
    testWithFrustumData(obb: AABB, camMat: AffineMat4 | Obj4, modelMat?: AffineMat4 | Obj4): boolean;
    getFrustumRange(camMat: AffineMat4 | Obj4, allRange?: boolean): Vec4[];
}
export {};
