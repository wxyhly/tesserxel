import { AffineMat4, Obj4 } from "../../math/algebra/affine";
import { Vec4 } from "../../math/algebra/vec4";
import { AABB } from "../../math/geometry/primitive";
import { Mat4, OrthographicCamera, PerspectiveCamera } from "../../math/math";
import { RaytracingPipeline, TetraSlicePipeline } from "./pipeline";

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
export enum EyeStereo {
    LeftEye,
    None,
    RightEye,
}
export enum RetinaSliceFacing {
    POSZ,
    NEGZ,
    POSY,
    NEGY,
    POSX,
    NEGX,
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
    viewport: { x: number; y: number; width: number; height: number };
    /** cross section's horizontal resolution in pixel */
    resolution?: number;
}
// const DefaultRetinaResolution = 512;
// const DefaultOpacity = 1;
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
export const DefaultDisplayConfig: DisplayConfig = {
    retinaLayers: 64,
    sectionStereoEyeOffset: 0.1,
    retinaStereoEyeOffset: 0.2,
    retinaResolution: 512,
    opacity: 1,
    canvasSize: {
        width: window ? window.innerWidth * window.devicePixelRatio : 1024,
        height: window ? window.innerHeight * window.devicePixelRatio : 512
    },
    camera3D: { fov: 40, near: 0.2, far: 20 },
    camera4D: { fov: 90, near: 0.01, far: 10 },
    retinaViewMatrix: new Mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, -5, 0, 0, 0, 1),
    sections: [
        {
            facing: RetinaSliceFacing.NEGX,
            eyeStereo: EyeStereo.LeftEye,
            viewport: { x: -0.2, y: -0.8, width: 0.2, height: 0.2 }
        },
        {
            facing: RetinaSliceFacing.NEGX,
            eyeStereo: EyeStereo.RightEye,
            viewport: { x: 0.8, y: -0.8, width: 0.2, height: 0.2 }
        },
        {
            facing: RetinaSliceFacing.NEGY,
            eyeStereo: EyeStereo.LeftEye,
            viewport: { x: -0.2, y: 0.8, width: 0.2, height: 0.2 }
        },
        {
            facing: RetinaSliceFacing.NEGY,
            eyeStereo: EyeStereo.RightEye,
            viewport: { x: 0.8, y: 0.8, width: 0.2, height: 0.2 }
        },
        {
            facing: RetinaSliceFacing.POSZ,
            eyeStereo: EyeStereo.LeftEye,
            viewport: { x: -0.8, y: -0.8, width: 0.2, height: 0.2 }
        },
        {
            facing: RetinaSliceFacing.POSZ,
            eyeStereo: EyeStereo.RightEye,
            viewport: { x: 0.2, y: 0.2 - 1, width: 0.2, height: 0.2 }
        },
    ]
}
export type DisplayConfigName = keyof DisplayConfig;
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
    drawTetras(bindGroups?: { group: number, binding: GPUBindGroup }[]): void;
    drawRaytracing(pipeline: RaytracingPipeline, bindGroups?: GPUBindGroup[]): void;

    testWithFrustumData(obb: AABB, camMat: AffineMat4 | Obj4, modelMat?: AffineMat4 | Obj4): boolean;
    getFrustumRange(camMat: AffineMat4 | Obj4): Vec4[];
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
}
export interface GeneralShaderState {
    code: string;
    entryPoint: string;
}
export interface TetraVertexState extends GeneralShaderState {
    workgroupSize?: number;
}
type SinglePipelineLayout = GPUPipelineLayout | GPUAutoLayoutMode | GPUBindGroupLayoutDescriptor[];
export type SlicePipelineLayout = GPUAutoLayoutMode | {
    computeLayout: SinglePipelineLayout;
    renderLayout: SinglePipelineLayout;
}
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