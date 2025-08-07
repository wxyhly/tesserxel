/// <reference types="@webgpu/types" />
import { AffineMat4, Obj4 } from "../../math/algebra/affine.js";
import { Vec4 } from "../../math/algebra/vec4.js";
import { AABB } from "../../math/geometry/primitive.js";
import { Mat4, OrthographicCamera, PerspectiveCamera } from "../../math/math.js";
import { RaytracingPipeline, TetraSlicePipeline } from "./pipeline.js";
/** Base Configs for SliceRenderer, This can't be changed after renderer creation */
export interface SliceRendererConfig {
    /** Must be power of 2, this includes retina slices and cross sections */
    maxSlicesNumber?: number;
    /** Must be power of 2, large number can waste lots GPU memory;
     *  Used to preallocate gpu memory for intermediate data of cross section
     */
    maxCrossSectionBufferSize?: number;
    /** Size for one parallel unit to calculate retina slices and cross sections
     */
    sliceGroupSize?: number;
    /** Enable this to improve retina render quality, but this may cause performance issue */
    enableFloat16Blend?: boolean;
    /** Use this default value when workgroup size is not specified within a tetraslice pipeline */
    defaultWorkGroupSize?: number;
}
/** An enum for stereo's eye option */
export declare enum EyeStereo {
    LeftEye = 0,
    None = 1,
    RightEye = 2
}
export declare enum RetinaSliceFacing {
    POSZ = 0,
    NEGZ = 1,
    POSY = 2,
    NEGY = 3,
    POSX = 4,
    NEGX = 5
}
/** Config for displaying one cross section */
export interface SectionConfig {
    /** Cross section's offset from origin, default is 0 */
    slicePos?: number;
    /** Cross section's direction */
    facing: RetinaSliceFacing;
    /** Wether this cross section enables stereo eye offset, default is None */
    eyeStereo?: EyeStereo;
    /** A viewport to draw cross section on 2D screen */
    viewport: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    /** cross section's horizontal resolution in pixel */
    resolution?: number;
}
export interface DisplayConfig {
    /** canvas size for render destination */
    canvasSize?: GPUExtent3DStrict;
    /** An array representing all cross sections for rendering */
    sections?: Array<SectionConfig>;
    /** Number of Slice Layers for rendering retina voxel */
    retinaLayers?: number;
    /** Resolution in pixel for each slice layers of retina */
    retinaResolution?: number;
    /** Opacity for retina voxel */
    opacity?: number;
    /** Retina 3D depth stereo. if one stereo eye offset is not zero, stereo mode will turn on */
    retinaStereoEyeOffset?: number;
    /** Cross section 4D depth stereo. if one stereo eye offset is not zero, stereo mode will turn on */
    sectionStereoEyeOffset?: number;
    /** size of center crosshair in the retina, non-zero value to enable it */
    crosshair?: number;
    /** background color for rendering transparent retina */
    screenBackgroundColor?: GPUColor;
    /** clear color for retina's voxel */
    retinaClearColor?: GPUColor;
    /** camera4d is in 4d scene */
    camera4D?: PerspectiveCamera | OrthographicCamera;
    /** camera3D is for rendering 3d retina */
    camera3D?: PerspectiveCamera | OrthographicCamera;
    /** this matrix determine camera's position and rotation for rendering 3d retina */
    retinaViewMatrix?: Mat4;
}
export declare const DefaultDisplayConfig: DisplayConfig;
export declare type DisplayConfigName = keyof DisplayConfig;
export interface RenderState {
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
export interface RetinaRenderPass {
    /**
   * Nominal type branding.
   * https://github.com/microsoft/TypeScript/pull/33038
   * @internal
   */
    readonly __brand: "RetinaRenderPass";
    init(): Promise<this>;
}
export interface RaytracingPipelineDescriptor {
    code: string;
    rayEntryPoint: string;
    fragmentEntryPoint: string;
    viewport?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}
export interface GeneralShaderState {
    code: string;
    entryPoint: string;
}
export interface TetraVertexState extends GeneralShaderState {
    workgroupSize?: number;
}
declare type SinglePipelineLayout = GPUPipelineLayout | GPUAutoLayoutMode | GPUBindGroupLayoutDescriptor[];
export declare type SlicePipelineLayout = GPUAutoLayoutMode | {
    computeLayout: SinglePipelineLayout;
    renderLayout: SinglePipelineLayout;
};
export interface TetraSlicePipelineDescriptor {
    vertex: TetraVertexState;
    fragment: GeneralShaderState;
    cullMode?: GPUCullMode;
    layout?: SlicePipelineLayout;
}
export interface RetinaRenderPassDescriptor {
    /** here only bindgroup(1) is avaliable */
    alphaShader?: GeneralShaderState;
    alphaShaderBindingResources?: GPUBindingResource[];
}
export interface IWireframeRenderState {
    render(buffer: GPUBuffer, vertices: number): void;
}
export {};
