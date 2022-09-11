namespace tesserxel {
    export namespace renderer {
        export interface SliceRendererOption {
            // todo: cancel limitation of dim must be 2^n
            /** Square slice framebuffer of dimension sliceResolution, should be 2^n */
            sliceResolution?: number;
            /** Caution: must be 2^n, this includes cross section thumbnails */
            maxSlicesNumber?: number;
            /** Caution: must be 2^n, large number can waste lots GPU memory;
             *  Used to preallocate gpumemory for intermediate data of cross section
             */
            maxCrossSectionBufferSize?: number;
            sliceGroupSize?: number;
            /** Caution: enable this may cause performance issue */
            enableFloat16Blend: boolean;
            /** whether initiate default confiuration like sliceconfigs and retina configs */
            defaultConfigs?: boolean;
        }
        // internal config state
        interface DisplayConfig {
            layers: number
            retinaEyeOffset: number
            sectionEyeOffset: number
            opacity: number
            sections: Array<SectionConfig>;
            sliceNum: number;
        }
        // config for user
        export interface SliceConfig {
            layers?: number;
            sections?: Array<SectionConfig>;
        }
        export enum SliceFacing {
            POSZ,
            NEGZ,
            POSY,
            NEGY,
            POSX,
            NEGX,
        }
        export enum EyeOffset {
            LeftEye,
            None,
            RightEye,
        }
        export interface TetraSlicePipelineDescriptor {
            vertex: TetraVertexState;
            fragment: GeneralShaderState;
            cullMode?: GPUCullMode;
        }
        export interface RaytracingPipelineDescriptor {
            code: string;
            rayEntryPoint: string;
            fragmentEntryPoint: string;
        }
        export interface TetraVertexState {
            workgroupSize?: number;
            code: string;
            entryPoint: string;
        }
        export interface GeneralShaderState {
            code: string;
            entryPoint: string;
        }
        export interface TetraSlicePipeline {
            computePipeline: GPUComputePipeline;
            computeBindGroup0: GPUBindGroup;
            renderPipeline: GPURenderPipeline;
            outputVaryBuffer: GPUBuffer[];
            vertexOutNum: number;
            descriptor: TetraSlicePipelineDescriptor
        };
        export interface RaytracingPipeline {
            pipeline: GPURenderPipeline;
            bindGroup0: GPUBindGroup;
        };
        export interface SectionConfig {
            slicePos?: number;
            facing: SliceFacing;
            eyeOffset?: EyeOffset;
            viewport: { x: number; y: number; width: number; height: number };
        }
        interface RenderState {
            commandEncoder: GPUCommandEncoder;
            computePassEncoder?: GPUComputePassEncoder;
            slicePassEncoder?: GPURenderPassEncoder;
            sliceIndex: number;
            pipeline?: TetraSlicePipeline;
            needClear: boolean;
        }
        const DefaultWorkGroupSize = 256;
        const DefaultSliceResolution = 512;
        const DefaultMaxSlicesNumber = 256;
        const DefaultMaxCrossSectionBufferSize = 0x800000;
        const DefaultEnableFloat16Blend = true;
        export class SliceRenderer {

            getSafeTetraNumInOnePass() {
                // maximum vertices per slice
                let maxVertices = this.maxCrossSectionBufferSize >> (this.sliceGroupSizeBit + 4);
                // one tetra generate at most 6 vertices
                return Math.floor(maxVertices / 6);
            }

            // configurations

            private maxSlicesNumber: number;
            private maxCrossSectionBufferSize: number;
            private sliceResolution: number;
            /** On each computeshader slice calling numbers, should be 2^n */
            private sliceGroupSize: number;
            private sliceGroupSizeBit: number;
            private screenSize: GPUExtent3DStrict;
            private outputBufferStride: number;
            private blendFormat: GPUTextureFormat;
            private displayConfig: DisplayConfig;

            // GPU resources

            private gpu: GPU;
            private context: GPUCanvasContext;
            private crossRenderVertexShaderModule: GPUShaderModule;
            private screenTexture: GPUTexture;
            private screenView: GPUTextureView;
            private linearTextureSampler: GPUSampler;
            private nearestTextureSampler: GPUSampler;

            private crossRenderPassDescClear: GPURenderPassDescriptor;
            private crossRenderPassDescLoad: GPURenderPassDescriptor;
            private clearRenderPipeline: GPURenderPipeline;
            private retinaRenderPipeline: GPURenderPipeline;
            private screenRenderPipeline: GPURenderPipeline;
            private retinaBindGroup: GPUBindGroup;
            private screenBindGroup: GPUBindGroup;
            private sliceView: GPUTextureView;
            private depthView: GPUTextureView;

            private outputVaryBufferPool: Array<GPUBuffer> = []; // all the vary buffers for pipelines
            private sliceOffsetBuffer: GPUBuffer;
            private emitIndexSliceBuffer: GPUBuffer;
            private refacingBuffer: GPUBuffer; // refacing buffer stores not only refacing but also retina slices
            private eyeBuffer: GPUBuffer;
            private thumbnailViewportBuffer: GPUBuffer;
            private readBuffer: GPUBuffer;
            private sliceGroupOffsetBuffer: GPUBuffer;
            private retinaMVBuffer: GPUBuffer;
            private retinaPBuffer: GPUBuffer;
            private screenAspectBuffer: GPUBuffer;
            private layerOpacityBuffer: GPUBuffer;
            private camProjBuffer: GPUBuffer;
            static readonly outputAttributeUsage = typeof GPUBufferUsage === 'undefined' ? null : GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX;

            // CPU caches for retina and screen

            private slicesJsBuffer: Float32Array;
            private camProjJsBuffer: Float32Array = new Float32Array(4);
            private retinaProjecJsBuffer = new Float32Array(16);
            private retinaMVMatJsBuffer = new Float32Array(16);
            private currentRetinaFacing: SliceFacing;
            private retinaMatrixChanged: boolean = true;
            private retinaFacingChanged: boolean = true;
            private screenClearColor: GPUColor = { r: 0, g: 0, b: 0, a: 0.0 };
            private renderState: RenderState;
            private enableEye3D: boolean;
            private refacingMatsCode: string;

            // section thumbnail

            private totalGroupNum: number;
            private sliceGroupNum: number;

            async init(gpu: GPU, context: GPUCanvasContext, options?: SliceRendererOption) {

                // constants generations

                let sliceResolution = options?.sliceResolution ?? DefaultSliceResolution;
                // by default we maximum sliceGroupSize value according to maximum 2d texture size
                let sliceGroupSize = options?.sliceGroupSize ?? (gpu.device.limits.maxTextureDimension2D / sliceResolution);
                // sliceTexture covered by sliceGroupSize x 2 atlas of sliceResolution x sliceResolution
                let sliceTextureSize = { width: sliceResolution, height: sliceResolution * sliceGroupSize };
                let sliceGroupSizeBit = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512].indexOf(sliceGroupSize);
                let outputBufferSize = (options?.maxCrossSectionBufferSize ?? DefaultMaxCrossSectionBufferSize);
                let outputBufferStride = outputBufferSize >> sliceGroupSizeBit;
                let maxSlicesNumber = options?.maxSlicesNumber ?? DefaultMaxSlicesNumber;
                let enableFloat16Blend = (options?.enableFloat16Blend ?? DefaultEnableFloat16Blend);
                let blendFormat: GPUTextureFormat = enableFloat16Blend === true ? 'rgba16float' : gpu.preferredFormat;

                this.sliceResolution = sliceResolution;
                this.sliceGroupSize = sliceGroupSize;
                this.sliceGroupSizeBit = sliceGroupSizeBit;
                this.maxCrossSectionBufferSize = outputBufferSize;
                this.outputBufferStride = outputBufferStride;
                this.maxSlicesNumber = maxSlicesNumber;
                this.blendFormat = blendFormat;

                // buffers

                this.readBuffer = gpu.createBuffer(GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ, outputBufferSize);

                // external declaration : let mvpBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 4 * 4 * 6);
                let sliceOffsetBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 4);
                let emitIndexSliceBuffer = gpu.createBuffer(GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST, (4 << sliceGroupSizeBit) + (maxSlicesNumber << 4));
                let retinaMVBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 64);
                let retinaPBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 64);
                let refacingBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 4);
                let eyeBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 8);
                let thumbnailViewportBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 16 * 16 * 4);
                // here is the default builtin(position) outputbuffer
                this.outputVaryBufferPool.push(gpu.createBuffer(SliceRenderer.outputAttributeUsage, outputBufferSize, "Output buffer for builtin(position)"));
                let sliceGroupOffsetBuffer = gpu.createBuffer(GPUBufferUsage.COPY_SRC, _genSlicesOffsetJsBuffer());
                let screenAspectBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 4);
                let layerOpacityBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 4);
                let camProjBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 16);

                function _genSlicesOffsetJsBuffer() {
                    let maxSliceGroupNum = Math.ceil(maxSlicesNumber / sliceGroupSize);
                    let sliceGroupOffsets = new Uint32Array(maxSliceGroupNum);
                    for (let i = 0; i < maxSliceGroupNum; i++) {
                        sliceGroupOffsets[i] = i * sliceGroupSize;
                    }
                    return sliceGroupOffsets;
                }
                this.sliceOffsetBuffer = sliceOffsetBuffer;
                this.emitIndexSliceBuffer = emitIndexSliceBuffer;
                this.retinaMVBuffer = retinaMVBuffer;
                this.retinaPBuffer = retinaPBuffer;
                this.refacingBuffer = refacingBuffer;
                this.eyeBuffer = eyeBuffer;
                this.sliceGroupOffsetBuffer = sliceGroupOffsetBuffer;
                this.screenAspectBuffer = screenAspectBuffer;
                this.layerOpacityBuffer = layerOpacityBuffer;
                this.camProjBuffer = camProjBuffer;
                this.thumbnailViewportBuffer = thumbnailViewportBuffer;
                // textures

                let depthTexture = gpu.device.createTexture({
                    size: sliceTextureSize, format: 'depth24plus',
                    usage: GPUTextureUsage.RENDER_ATTACHMENT,
                });
                let depthView = depthTexture.createView();
                this.depthView = depthView;
                let sliceTexture = gpu.device.createTexture({
                    size: sliceTextureSize, format: gpu.preferredFormat,
                    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
                });
                let sliceView = sliceTexture.createView();
                this.sliceView = sliceView;
                this.linearTextureSampler = gpu.device.createSampler({
                    magFilter: 'linear',
                    minFilter: 'linear'
                });
                this.nearestTextureSampler = gpu.device.createSampler({
                    magFilter: 'nearest',
                    minFilter: 'nearest'
                });
                this.refacingMatsCode = `
const refacingMats = array<mat4x4<f32>,6>(
    // +z
    mat4x4<f32>(
        1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        0,0,0,1,
    ),
    // -z
    mat4x4<f32>(
        1,0,0,0,
        0,1,0,0,
        0,0,-1,0,
        0,0,0,1,
    ),
    // +y
    mat4x4<f32>(
        1,0,0,0,
        0,0,1,0,
        0,1,0,0,
        0,0,0,1,
    ),
    // -y
    mat4x4<f32>(
        1,0,0,0,
        0,0,-1,0,
        0,-1,0,0,
        0,0,0,1,
    ),
    // +x
    mat4x4<f32>(
        0,0,1,0,
        0,1,0,0,
        1,0,0,0,
        0,0,0,1,
    ),
    // -x
    mat4x4<f32>(
        0,0,-1,0,
        0,1,0,0,
        -1,0,0,0,
        0,0,0,1,
    ),
);
const determinantRefacingMats = array<f32,6>(1,-1,-1,-1,-1,-1);
`;

                /** 
                 * ---------------------------------
                 * cross render vertex shader
                 * fragment shader and pipeline are provided by user
                 * ---------------------------------
                 *  */


                this.crossRenderPassDescClear = {
                    colorAttachments: [{
                        view: sliceView,
                        clearValue: { r: 0, g: 0, b: 0, a: 0.0 },
                        loadOp: 'clear' as GPULoadOp,
                        storeOp: 'store' as GPUStoreOp
                    }],
                    depthStencilAttachment: {
                        view: depthView,
                        depthClearValue: 1.0,
                        depthLoadOp: 'clear' as GPULoadOp,
                        depthStoreOp: 'store' as GPUStoreOp,
                    }
                };

                this.crossRenderPassDescLoad = {
                    colorAttachments: [{
                        view: sliceView,
                        loadOp: 'load' as GPULoadOp,
                        storeOp: 'store' as GPUStoreOp
                    }],
                    depthStencilAttachment: {
                        view: depthView,
                        depthLoadOp: 'load' as GPULoadOp,
                        depthStoreOp: 'store' as GPUStoreOp,
                    }
                };

                /** 
                 * ---------------------------------
                 * retina render shader and pipeline
                 * 
                 * ---------------------------------
                 *  */

                let retinaRenderCode = this.refacingMatsCode + `
struct vOutputType{
    @builtin(position) position : vec4<f32>,
    @location(0) relativeFragPosition : vec3<f32>,
    @location(1) rayForCalOpacity : vec4<f32>,
    @location(2) normalForCalOpacity : vec4<f32>,
}
struct fInputType{
    @location(0) relativeFragPosition : vec3<f32>,
    @location(1) rayForCalOpacity : vec4<f32>,
    @location(2) normalForCalOpacity : vec4<f32>,
}
struct _SliceInfo{
    slicePos: f32,
    refacing: u32,
    flag: u32,
    _pading: u32,
}
@group(0) @binding(0) var<uniform> mvmat: mat4x4<f32>;
@group(0) @binding(1) var<uniform> pmat: mat4x4<f32>;
@group(0) @binding(2) var<storage,read> slice : array<_SliceInfo,${this.maxSlicesNumber}>;
@group(0) @binding(3) var<uniform> sliceoffset : u32;
@group(0) @binding(4) var<uniform> refacing : u32;
@group(0) @binding(5) var<uniform> screenAspect : f32;
@group(0) @binding(6) var<uniform> layerOpacity : f32;
@group(0) @binding(7) var<uniform> thumbnailViewport : array<vec4<f32>,16>;
@group(0) @binding(8) var<uniform> eyeOffset : vec2<f32>; //(eye4,eye3)

@vertex fn mainVertex(@builtin(vertex_index) vindex : u32, @builtin(instance_index) iindex : u32) -> vOutputType {
    const pos = array<vec2<f32>, 4>(
        vec2<f32>(-1.0, -1.0),
        vec2<f32>(-1.0, 1.0),
        vec2<f32>( 1.0, -1.0),
        vec2<f32>( 1.0, 1.0),
    );
    var sindex = iindex;
    var pos2d = pos[vindex];
    let stereoLR = f32(iindex & 1) - 0.5;
    if (slice[sliceoffset].flag == 0 && eyeOffset.y > 0.0){
        sindex = iindex >> 1;
    }
    let s = slice[sindex + sliceoffset];
    let coord = vec2<f32>(pos2d.x, -pos2d.y) * 0.5 + 0.5;
    let ray = vec4<f32>(pos2d, s.slicePos, 1.0);
    var glPosition: vec4<f32>;
    var camRay: vec4<f32>;
    var normal: vec4<f32>;
    if (slice[sliceoffset].flag == 0){
        let stereoLR_offset = -stereoLR * eyeOffset.y;
        let se = sin(stereoLR_offset);
        let ce = cos(stereoLR_offset);
        let eyeMat = mat4x4<f32>(
            ce,0,se,0,
            0,1,0,0,
            -se,0,ce,0,
            0,0,0,1
        );
        let omat = mvmat * eyeMat * refacingMats[refacing & 7];
        camRay = omat * ray;
        glPosition = pmat * camRay;
        normal = omat[2];
        // todo: viewport of retina slices
        glPosition.x = (glPosition.x) * screenAspect + step(0.0001, eyeOffset.y) * stereoLR * glPosition.w;
    }else{
        let vp = thumbnailViewport[sindex + sliceoffset - (refacing >> 5)];
        glPosition = vec4<f32>(ray.x * vp.z * screenAspect + vp.x, ray.y * vp.w + vp.y,0.5,1.0);
    }
    return vOutputType(
        glPosition,
        vec3<f32>(coord.x, (coord.y + f32(sindex))*${1 / sliceGroupSize} , s.slicePos),
        camRay,
        normal
    );
}

@group(0) @binding(9) var txt: texture_2d<f32>;
@group(0) @binding(10) var splr: sampler;
@fragment fn mainFragment(input : fInputType) -> @location(0) vec4<f32> {
    let color = textureSample(txt, splr, input.relativeFragPosition.xy);
    var alpha: f32 = 1.0;
    let k = layerOpacity;
    if (slice[sliceoffset].flag == 0){
        let dotvalue = dot(normalize(input.rayForCalOpacity.xyz), input.normalForCalOpacity.xyz);
        let factor = layerOpacity/(clamp(-dotvalue,0.0,1.0));
        alpha =  color.a * max(0.0, factor );
    }
    return vec4<f32>(color.rgb, alpha);
}
`;
                let retinaRenderShaderModule = gpu.device.createShaderModule({
                    code: retinaRenderCode
                });
                let clearModule = gpu.device.createShaderModule({
                    code:
                        "@vertex fn v()->@builtin(position) vec4<f32>{ return vec4<f32>();} @fragment fn f()->@location(0) vec4<f32>{ return vec4<f32>();}"
                });
                this.clearRenderPipeline = await gpu.device.createRenderPipelineAsync({
                    layout: 'auto',
                    vertex: {
                        module: clearModule,
                        entryPoint: 'v',
                    },
                    fragment: {
                        module: clearModule,
                        entryPoint: 'f',
                        targets: [{ format: gpu.preferredFormat }]
                    },
                    depthStencil: {
                        format: 'depth24plus',
                    }
                });
                this.retinaRenderPipeline = await gpu.device.createRenderPipelineAsync({
                    layout: 'auto',
                    vertex: {
                        module: retinaRenderShaderModule,
                        entryPoint: 'mainVertex',
                    },
                    fragment: {
                        module: retinaRenderShaderModule,
                        entryPoint: 'mainFragment',
                        targets: [{
                            format: blendFormat,
                            blend: {
                                color: {
                                    srcFactor: "src-alpha" as GPUBlendFactor,
                                    dstFactor: "one-minus-src-alpha" as GPUBlendFactor,
                                    operation: "add" as GPUBlendOperation
                                },
                                alpha: {}
                            }
                        }],
                    },
                    primitive: { topology: 'triangle-strip' }
                });
                this.retinaBindGroup = gpu.createBindGroup(this.retinaRenderPipeline, 0, [
                    { buffer: retinaMVBuffer },
                    { buffer: retinaPBuffer },
                    { buffer: emitIndexSliceBuffer },
                    { buffer: sliceOffsetBuffer },
                    { buffer: refacingBuffer },
                    { buffer: screenAspectBuffer },
                    { buffer: layerOpacityBuffer },
                    { buffer: thumbnailViewportBuffer },
                    { buffer: eyeBuffer },
                    sliceView,
                    this.linearTextureSampler,
                ], "retinaBindGroup");

                /** 
                 * ---------------------------------
                 * screen render shader and pipeline
                 * for float16 blending and convert color to srgb
                 * ---------------------------------
                 *  */

                let screenRenderCode = `
@group(0) @binding(0) var txt: texture_2d<f32>;
@group(0) @binding(1) var splr: sampler;
struct vOutputType{
    @builtin(position) position : vec4<f32>,
    @location(0) fragPosition : vec2<f32>,
}
struct fInputType{
    @location(0) fragPosition : vec2<f32>,
}
@vertex fn mainVertex(@builtin(vertex_index) index : u32) -> vOutputType {
    const pos = array<vec2<f32>, 4>(
        vec2<f32>(-1.0, -1.0),
        vec2<f32>(-1.0, 1.0),
        vec2<f32>(1.0, -1.0),
        vec2<f32>(1.0, 1.0),
    );
    const uv = array<vec2<f32>, 4>(
        vec2<f32>(0.0, 1.0),
        vec2<f32>(0.0, 0.0),
        vec2<f32>(1.0, 1.0),
        vec2<f32>(1.0, 0.0),
    );
    return vOutputType(vec4<f32>(pos[index], 0.0, 1.0), uv[index]);
}
@fragment fn mainFragment(input: fInputType) -> @location(0) vec4<f32> {
    let color = textureSample(txt, splr, input.fragPosition);
    return vec4<f32>(color.rgb, 1.0);
}
`;
                let screenRenderShaderModule = gpu.device.createShaderModule({
                    code: screenRenderCode
                });
                this.screenRenderPipeline = await gpu.device.createRenderPipelineAsync({
                    layout: 'auto',
                    vertex: {
                        module: screenRenderShaderModule,
                        entryPoint: 'mainVertex',
                    },
                    fragment: {
                        module: screenRenderShaderModule,
                        entryPoint: 'mainFragment',
                        targets: [{
                            format: gpu.preferredFormat
                        }],
                    },
                    primitive: { topology: 'triangle-strip' }
                });
                this.gpu = gpu;
                this.context = context;
                this.displayConfig = {
                    layers: null,
                    retinaEyeOffset: 0,
                    sectionEyeOffset: 0,
                    opacity: 0,
                    sections: [],
                    sliceNum: 0
                };
                // default retina settings
                if (options?.defaultConfigs !== false) {
                    let size = 0.2;
                    this.setSliceConfig({
                        layers: 64,
                        sections: [
                            {
                                facing: tesserxel.renderer.SliceFacing.NEGX,
                                eyeOffset: tesserxel.renderer.EyeOffset.LeftEye,
                                viewport: { x: -size, y: size - 1, width: size, height: size }
                            },
                            {
                                facing: tesserxel.renderer.SliceFacing.NEGX,
                                eyeOffset: tesserxel.renderer.EyeOffset.RightEye,
                                viewport: { x: 1 - size, y: size - 1, width: size, height: size }
                            },
                            {
                                facing: tesserxel.renderer.SliceFacing.NEGY,
                                eyeOffset: tesserxel.renderer.EyeOffset.LeftEye,
                                viewport: { x: -size, y: 1 - size, width: size, height: size }
                            },
                            {
                                facing: tesserxel.renderer.SliceFacing.NEGY,
                                eyeOffset: tesserxel.renderer.EyeOffset.RightEye,
                                viewport: { x: 1 - size, y: 1 - size, width: size, height: size }
                            },
                            {
                                facing: tesserxel.renderer.SliceFacing.POSZ,
                                eyeOffset: tesserxel.renderer.EyeOffset.LeftEye,
                                viewport: { x: size - 1, y: size - 1, width: size, height: size }
                            },
                            {
                                facing: tesserxel.renderer.SliceFacing.POSZ,
                                eyeOffset: tesserxel.renderer.EyeOffset.RightEye,
                                viewport: { x: size, y: size - 1, width: size, height: size }
                            },
                        ]
                    });
                    this.setEyeOffset(0.1, 0.1);
                    this.setOpacity(1);
                    this.set4DCameraProjectMatrix({ fov: 90, near: 0.01, far: 10 });
                    this.setRetinaProjectMatrix({
                        fov: 40, near: 0.01, far: 10
                    });
                    this.setRetinaViewMatrix(new math.Mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, -5, 0, 0, 0, 1));
                }
                return this;
            } // end init
            /** for TetraSlicePipeline, vertex shader is internally a compute shader, so it doesn't share bindgroups with fragment shader.
             *  for RaytracingPipeline, vertex shader and fragment shader are in one traditional render pipeline, they share bindgroups.
             */
            createVertexShaderBindGroup(pipeline: TetraSlicePipeline | RaytracingPipeline, index: number, buffers: GPUBuffer[], label?: string) {
                if (index == 0) console.error("Unable to create BindGroup 0, which is occupied by internal usages.")
                return this.gpu.createBindGroup(
                    ((pipeline as TetraSlicePipeline).computePipeline ?
                        (pipeline as TetraSlicePipeline).computePipeline :
                        (pipeline as RaytracingPipeline).pipeline
                    ), index, buffers.map(e => ({ buffer: e })), "VertexShaderBindGroup<" + label + ">"
                );
            }
            /** for TetraSlicePipeline, vertex shader is internally a compute shader, so it doesn't share bindgroups with fragment shader.
             *  for RaytracingPipeline, vertex shader and fragment shader are in one traditional render pipeline, they share bindgroups.
             */
            createFragmentShaderBindGroup(pipeline: TetraSlicePipeline | RaytracingPipeline, index: number, buffers: GPUBuffer[], label?: string) {
                if (index == 0 && (pipeline as RaytracingPipeline).pipeline) console.error("Unable to create BindGroup 0, which is occupied by internal usages.")
                return this.gpu.createBindGroup(
                    ((pipeline as TetraSlicePipeline).computePipeline ?
                        (pipeline as TetraSlicePipeline).renderPipeline :
                        (pipeline as RaytracingPipeline).pipeline
                    ), index, buffers.map(e => ({ buffer: e })), "FragmentShaderBindGroup<" + label + ">"
                );
            }
            async createTetraSlicePipeline(desc: TetraSlicePipelineDescriptor): Promise<TetraSlicePipeline> {
                let vertexState = desc.vertex;
                const reflect = new wgslreflect.WgslReflect(vertexState.code);
                let mainFn = reflect.functions.filter(e => e.attributes && e.attributes.some(a => a.name === "tetra") && e.name == vertexState.entryPoint)[0];
                if (!mainFn) console.error("Tetra vertex shader entry Point function not found");
                let expectInput = {
                    "location(0)": "_attribute0[tetraIndex]",
                    "location(1)": "_attribute1[tetraIndex]",
                    "location(2)": "_attribute2[tetraIndex]",
                    "location(3)": "_attribute3[tetraIndex]",
                    "location(4)": "_attribute4[tetraIndex]",
                    "location(5)": "_attribute5[tetraIndex]",
                    "builtin(instance_index)": "instanceIndex",
                    "builtin(tetra_index)": "tetraIndex",
                }
                let expectOutput = [
                    "location(0)", "location(1)", "location(2)", "location(3)", "location(4)", "location(5)",
                    "builtin(position)"
                ];
                let { input, output, call } = wgslreflect.getFnInputAndOutput(reflect, mainFn, expectInput, expectOutput);

                // compute pipeline
                const bindGroup0declareIndex = 6;
                let bindGroup0declare = '';
                let varInterpolate = "";
                let emitOutput1 = "";
                let emitOutput2 = "";

                // render pipeline
                let vinputVert = '';
                let voutputVert = '';
                let vcallVert = "";
                let vertexBufferAttributes: GPUVertexBufferLayout[] = [];
                let vertexOutNum = 0;
                let buffers = [
                    { buffer: this.emitIndexSliceBuffer },
                    { buffer: this.sliceOffsetBuffer },
                    { buffer: this.refacingBuffer },
                    { buffer: this.eyeBuffer },
                    { buffer: this.camProjBuffer },
                    { buffer: this.thumbnailViewportBuffer }
                ];
                let indicesInOutputBufferPool = new Set<number>();
                indicesInOutputBufferPool.add(0); // default builtin(position) buffer
                let outputVaryBuffer = [this.outputVaryBufferPool[0]];
                for (let attr in output) {
                    let id: number;
                    if (attr === "return") continue;
                    let packedType = output[attr].type; // unpack matrix4x4
                    let rawType = packedType.replace("mat4x4<f32>", "vec4<f32>");
                    if (attr === "builtin(position)") {
                        id = 0;
                    } else if (attr.startsWith("location(")) {
                        let i = attr.charAt(9);
                        id = Number(i) + 1;
                    }
                    if (id >= 0) {
                        vertexOutNum++;
                        bindGroup0declare += `@group(0) @binding(${bindGroup0declareIndex + id}) var<storage, read_write> _output${id} : array<${rawType}>;\n`;


                        varInterpolate += `var output${id}s : array<${rawType},4>;\n`;
                        emitOutput1 += `
            _output${id}[outOffset] =   output${id}s[0];
            _output${id}[outOffset+1] = output${id}s[1];
            _output${id}[outOffset+2] = output${id}s[2];`
                        emitOutput2 += `
                _output${id}[outOffset+3] = output${id}s[2];
                _output${id}[outOffset+4] = output${id}s[1];
                _output${id}[outOffset+5] = output${id}s[3];`
                        let jeg = rawType.match(/array<(.+),(.+)>/);
                        if (jeg) {
                            let typeArrLength = Number(jeg[2]);
                            let attributes = [];
                            for (let i = 0; i < typeArrLength; i++) {
                                attributes.push({
                                    shaderLocation: id, // here we keep same id, we'll deal this later
                                    format: 'float32x4',
                                    offset: i << 4
                                })
                            }
                            vertexBufferAttributes.push({
                                arrayStride: typeArrLength << 4,
                                attributes
                            });
                            buffers.push({ buffer: requireOutputBuffer(this, id, typeArrLength) });
                        } else {
                            buffers.push({ buffer: requireOutputBuffer(this, id, 1) });
                            vertexBufferAttributes.push({
                                arrayStride: 16,
                                attributes: [{
                                    shaderLocation: id,
                                    format: 'float32x4' as GPUVertexFormat,
                                    offset: 0
                                }]
                            });
                        }

                    }
                }
                function requireOutputBuffer(self: SliceRenderer, id: number, size: number): GPUBuffer {
                    if (id === 0) return self.outputVaryBufferPool[0];
                    let expectedSize = self.maxCrossSectionBufferSize * size;
                    for (let i = 0; i < self.outputVaryBufferPool.length; i++) {
                        if (indicesInOutputBufferPool.has(i)) continue; // we can't bind the same buffer again
                        let buffer = self.outputVaryBufferPool[i];
                        if (buffer.size === expectedSize) {
                            // found unused exactly sized buffer
                            indicesInOutputBufferPool.add(i);
                            outputVaryBuffer.push(buffer);
                            return buffer;
                        }
                    }
                    // no buffer found, we need to create
                    let buffer = self.gpu.createBuffer(SliceRenderer.outputAttributeUsage, expectedSize, "Output buffer for " + size + " vec4(s)");
                    indicesInOutputBufferPool.add(self.outputVaryBufferPool.length);
                    self.outputVaryBufferPool.push(buffer);
                    outputVaryBuffer.push(buffer);
                    return buffer;
                }
                let bindGroup1declare = '';
                for (let attr of input) {
                    if (!attr.startsWith("location(")) continue;
                    let i = attr.charAt(9);
                    bindGroup1declare += `@group(1) @binding(${i}) var<storage, read> _attribute${i} : array<mat4x4<f32>>;\n`;
                }
                let parsedCode = vertexState.code.replace(/@tetra/g, " ").replace(/@location\s*\(\s*[0-9]+\s*\)\s*/g, " ").replace(/@builtin\s*\(\s*[^\)\s]+\s*\)\s*/g, " ");
                function makeInterpolate(a: number, b: number) {
                    let str = '';
                    for (let attr in output) {
                        let jeg = output[attr].type?.match(/array<(.+),(.+)>/);

                        let name = attr.startsWith("location(") ? output[attr].expr : attr == "builtin(position)" ? "refPosMat" : "";
                        if (!name) continue;
                        let i = attr.startsWith("location(") ? Number(attr.charAt(9)) + 1 : 0;
                        if (jeg) {
                            let typeArrLength = Number(jeg[2]);
                            for (let idx = 0; idx < typeArrLength; idx++)
                                str += `output${i}s[offset][${idx}] = mix(${name}[${idx}][${a}],${name}[${idx}][${b}],alpha);\n`;
                        } else {
                            str += `output${i}s[offset] = mix(${name}[${a}],${name}[${b}],alpha);\n`;
                        }
                    }
                    return str;
                }
                let cullOperator = desc.cullMode == "back" ? "<" : ">";
                let crossComputeCode = this.refacingMatsCode + `

struct _SliceInfo{
    slicePos: f32,
    refacing: u32,
    flag: u32,
    _pading: u32,
}
struct _EmitIndex_Slice{
    slice: array<_SliceInfo, ${this.maxSlicesNumber}>,
    emitIndex: array<atomic<u32>>,
}
@group(0) @binding(0) var<storage, read_write> _emitIndex_slice: _EmitIndex_Slice;
@group(0) @binding(1) var<uniform> _sliceoffset : u32;
@group(0) @binding(2) var<uniform> _refacingMat : u32;
@group(0) @binding(3) var<uniform> _eye4dOffset : f32;
@group(0) @binding(4) var<uniform> _camProj: vec4<f32>;
@group(0) @binding(5) var<uniform> thumbnailViewport : array<vec4<f32>,16>;
${bindGroup0declare}
${bindGroup1declare}

// user defined functions and bind groups
${parsedCode}

const _emitIndexStride : u32 = ${this.outputBufferStride >> 4};
@compute @workgroup_size(${vertexState.workgroupSize ?? DefaultWorkGroupSize})
fn _mainCompute(@builtin(global_invocation_id) GlobalInvocationID : vec3<u32>){
    let tetrahedralNum : u32 = arrayLength(&_attribute0); // todo: check performance?
    let tetraIndex = GlobalInvocationID.x;
    let instanceIndex = GlobalInvocationID.y;
    if(tetraIndex >= tetrahedralNum ){
        return;
    }
    // calculate camera space coordinate : builtin(position) and other output need to be interpolated : location(x)
    // call user defined code 
    ${call}
    let cameraPosMat = ${output["builtin(position)"].expr};
    let preclipW = cameraPosMat[0].w >= 0 && cameraPosMat[1].w >= 0 && cameraPosMat[2].w >= 0  && cameraPosMat[3].w >= 0;
    if(preclipW){ return; }
    let projBiais:mat4x4<f32> = mat4x4<f32>(
        0,0,_camProj.w,0,
        0,0,_camProj.w,0,
        0,0,_camProj.w,0,
        0,0,_camProj.w,0
    );
    let projMat = mat4x4<f32>(
        _camProj.x,0,0,0,
        0,_camProj.y,0,0,
        0,0,0,0,
        0,0,_camProj.z,-1,
    );
    let eyeMat = mat4x4<f32>(
        _eye4dOffset,0,0,0,
        _eye4dOffset,0,0,0,
        _eye4dOffset,0,0,0,
        _eye4dOffset,0,0,0
    );
    var instanceLength:u32 = ${this.sliceGroupSize};
    var refPosMat : mat4x4<f32>;
    var refCamMat : mat4x4<f32>;
    let sliceFlag = _emitIndex_slice.slice[_sliceoffset].flag;
    // [uniform if] all slices are in retina, no eye4D
    if(sliceFlag == 0){
        ${(desc.cullMode == "back" || desc.cullMode == "front") ? `
        // cull face: if all slices in this group has no eye4D offset, cull here
        if(determinant(cameraPosMat) ${cullOperator} 0){ return; }` : ""}
        
        // we get refacing mat from uniform for retina slices
        let retinaRefacingMat = refacingMats[_refacingMat & 7];
        // calculate standard device coordinate for retina: projection * refacing * view * model * pos
        refCamMat = retinaRefacingMat * cameraPosMat;
        refPosMat = projMat * refCamMat + projBiais;
    }else{
        instanceLength = _emitIndex_slice.slice[_sliceoffset].flag;
    }
    
    // prepare for interpolations
    var emitIndexOffset = 0u;
    for(var i:u32 = 0; i<instanceLength; i++){
        ${varInterpolate}
        let sliceInfo = _emitIndex_slice.slice[_sliceoffset + i];
        if(sliceInfo.slicePos > 1.0){
            emitIndexOffset += _emitIndexStride;
            continue;
        }
        var offset = 0u;
        if(sliceFlag != 0){
            refCamMat = refacingMats[sliceInfo.refacing & 7] * cameraPosMat + 
                eyeMat * (f32(sliceInfo.refacing >> 3) - 1.0);
                ${(desc.cullMode == "back" || desc.cullMode == "front") ? `
            if(determinant(refCamMat) * determinantRefacingMats[sliceInfo.refacing & 7] ${cullOperator} 0){
                emitIndexOffset += _emitIndexStride;
                continue;
            }`: ""}
            refPosMat = projMat * refCamMat + projBiais;
            let vp = thumbnailViewport[_sliceoffset + i - (_refacingMat >> 5)];
            let aspect = vp.w / vp.z;
            refPosMat[0].x *= aspect;
            refPosMat[1].x *= aspect;
            refPosMat[2].x *= aspect;
            refPosMat[3].x *= aspect;
        }
        // calculate cross section pos * plane.normal
        let scalar = transpose(refCamMat) * vec4(0.0,0.0,1.0,sliceInfo.slicePos / _camProj.x); 
        let sign = step(vec4<f32>(0.0,0.0,0.0,0.0),scalar);
        let vertnum = sign.x + sign.y + sign.z + sign.w;
        if(!(vertnum == 0.0 || vertnum == 4.0)){ // if hit one slice
            if(sign.x + sign.y == 1.0){
                let alpha = scalar.x/(scalar.x - scalar.y);
                ${makeInterpolate(0, 1)}
                offset++;
            }
            if(sign.x + sign.z == 1.0){
                let alpha = scalar.x/(scalar.x - scalar.z);
                ${makeInterpolate(0, 2)}
                offset++;
            }
            if(sign.x + sign.w == 1.0){
                let alpha = scalar.x/(scalar.x - scalar.w);
                ${makeInterpolate(0, 3)}
                offset++;
            }
            if(sign.y + sign.z == 1.0){
                let alpha = scalar.y/(scalar.y - scalar.z);
                ${makeInterpolate(1, 2)}
                offset++;
            }
            if(sign.y + sign.w == 1.0){
                let alpha = scalar.y/(scalar.y - scalar.w);
                ${makeInterpolate(1, 3)}
                offset++;
            }
            if(sign.z + sign.w == 1.0){
                let alpha = scalar.z/(scalar.z - scalar.w);
                ${makeInterpolate(2, 3)}
                offset++;
            }
            
            // offset is total verticex number (3 or 4), delta is faces number (3 or 6)
            let delta:u32 = u32((offset - 2) * 3);
            // get output location thread-safely
            let outOffset : u32 = atomicAdd(&(_emitIndex_slice.emitIndex[i]), delta) + emitIndexOffset;
            // write 3 vertices of first triangular face
            ${emitOutput1}
            // write 3 vertices of second triangular face if one has
            if(offset == 4){
                ${emitOutput2}
            }
        } // end one hit
        emitIndexOffset += _emitIndexStride;
    } // end all hits
}
`;
                let computePipeline = await this.gpu.device.createComputePipelineAsync({
                    layout: 'auto',
                    compute: {
                        module: this.gpu.device.createShaderModule({
                            code: crossComputeCode
                        }),
                        entryPoint: '_mainCompute'
                    }
                });
                vertexBufferAttributes.sort((a, b) =>
                    (a.attributes[0].shaderLocation - b.attributes[0].shaderLocation)
                );
                let shaderLocationCounter = 0;
                for (let vba of vertexBufferAttributes) {
                    for (let attr of vba.attributes) {
                        attr.shaderLocation = shaderLocationCounter++;
                    }
                }
                for (let i = 0; i < shaderLocationCounter; i++) {
                    let attr = i ? `location(${i - 1})` : "builtin(position)";
                    vinputVert += `@location(${i}) member${i}: vec4<f32>,\n`;
                    voutputVert += `@${attr} member${i}: vec4<f32>,\n`;
                    vcallVert += `data.member${i},`;
                }
                this.crossRenderVertexShaderModule = this.gpu.device.createShaderModule({
                    code: `
struct vInputType{
    ${vinputVert}
};
struct vOutputType{
    ${voutputVert}
};
@vertex fn main(data : vInputType)-> vOutputType{
    return vOutputType(${vcallVert});
}
`});

                let renderPipeline = await this.gpu.device.createRenderPipelineAsync({
                    layout: 'auto',
                    vertex: {
                        module: this.crossRenderVertexShaderModule,
                        entryPoint: 'main',
                        buffers: vertexBufferAttributes,
                    },
                    fragment: {
                        module: this.gpu.device.createShaderModule({ code: desc.fragment.code }),
                        entryPoint: desc.fragment.entryPoint,
                        targets: [{ format: this.gpu.preferredFormat }]
                    },
                    primitive: {
                        topology: 'triangle-list',
                    },
                    depthStencil: {
                        depthWriteEnabled: true,
                        depthCompare: 'less',
                        format: 'depth24plus',
                    }
                });

                return {
                    computePipeline,
                    computeBindGroup0: this.gpu.createBindGroup(computePipeline, 0, buffers, "TetraComputePipeline"),
                    renderPipeline,
                    vertexOutNum,
                    outputVaryBuffer,
                    descriptor: desc
                };
            }
            setSize(size: GPUExtent3DStrict) {
                if (this.screenTexture) {
                    this.screenTexture.destroy();
                }
                this.screenTexture = this.gpu.device.createTexture({
                    size, format: this.blendFormat,
                    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
                });
                this.screenView = this.screenTexture.createView();
                this.screenBindGroup = this.gpu.createBindGroup(this.screenRenderPipeline, 0, [
                    this.screenView,
                    this.linearTextureSampler,
                ], "screenBindGroup");
                let aspect: number;
                if ((size as GPUExtent3DDict).height) {
                    aspect = (size as GPUExtent3DDict).height / (size as GPUExtent3DDict).width;
                } else {
                    aspect = size[1] / size[0];
                }
                this.gpu.device.queue.writeBuffer(this.screenAspectBuffer, 0, new Float32Array([aspect]));
            }
            getScreenAspect(): number {
                if (!this.screenTexture) { return 1; }
                return this.screenTexture.height / this.screenTexture.width;
            }
            set4DCameraProjectMatrix(camera: math.PerspectiveCamera) {
                math.getPerspectiveMatrix(camera).vec4.writeBuffer(this.camProjJsBuffer);
                this.gpu.device.queue.writeBuffer(this.camProjBuffer, 0, this.camProjJsBuffer);
            }
            setRetinaProjectMatrix(camera: math.PerspectiveCamera) {
                math.getPerspectiveMatrix(camera).mat4.writeBuffer(this.retinaProjecJsBuffer);
                this.gpu.device.queue.writeBuffer(this.retinaPBuffer, 0, this.retinaProjecJsBuffer);
            }
            setRetinaViewMatrix(m: math.Mat4) {
                let e = m.elem;
                let facing = getFacing(e[8], e[9], e[10]);
                if (facing !== this.currentRetinaFacing) {
                    this.retinaFacingChanged = true;
                    this.currentRetinaFacing = facing;
                }
                m.writeBuffer(this.retinaMVMatJsBuffer);
                this.retinaMatrixChanged = true;
                function getFacing(x: number, y: number, z: number) {
                    let xa = Math.abs(x);
                    let ya = Math.abs(y);
                    let za = Math.abs(z);
                    switch (za > ya ? za > xa ? 2 : 0 : ya > xa ? 1 : 0) {
                        case 0:
                            return x > 0 ? SliceFacing.POSX : SliceFacing.NEGX;
                        case 1:
                            return y > 0 ? SliceFacing.POSY : SliceFacing.NEGY;
                        default:
                            return z > 0 ? SliceFacing.POSZ : SliceFacing.NEGZ;
                    }
                }
            }
            getOpacity() { return this.displayConfig.opacity; }
            getSectionEyeOffset() { return this.displayConfig.sectionEyeOffset; }
            getRetinaEyeOffset() { return this.displayConfig.retinaEyeOffset; }
            getLayers() { return this.displayConfig.layers; }
            getStereoMode() { return this.enableEye3D; }
            setOpacity(opacity: number) {
                this.displayConfig.opacity = opacity;
                let value = this.displayConfig.sliceNum ? opacity / this.displayConfig.sliceNum : 1.0;
                this.gpu.device.queue.writeBuffer(this.layerOpacityBuffer, 0, new Float32Array([value]));
            }
            setEyeOffset(sectionEyeOffset?: number, retinaEyeOffset?: number) {
                let s = typeof sectionEyeOffset === "number";
                let r = typeof retinaEyeOffset === "number";

                if (s && r) {
                    this.gpu.device.queue.writeBuffer(this.eyeBuffer, 0, new Float32Array([
                        sectionEyeOffset, retinaEyeOffset
                    ]));
                } else if (s) {
                    this.gpu.device.queue.writeBuffer(this.eyeBuffer, 0, new Float32Array([
                        sectionEyeOffset
                    ]));
                } else if (r) {
                    this.gpu.device.queue.writeBuffer(this.eyeBuffer, 4, new Float32Array([
                        retinaEyeOffset
                    ]));
                }
                if (s) this.displayConfig.sectionEyeOffset = sectionEyeOffset;
                if (r) this.displayConfig.retinaEyeOffset = retinaEyeOffset;
                this.enableEye3D = this.displayConfig.sectionEyeOffset > 0 || this.displayConfig.retinaEyeOffset > 0;
            }
            setSliceConfig(sliceConfig: SliceConfig) {
                if (sliceConfig.sections) {
                    // deepcopy
                    this.displayConfig.sections = sliceConfig.sections.map(e => ({
                        eyeOffset: e.eyeOffset ?? EyeOffset.None,
                        facing: e.facing,
                        slicePos: e.slicePos ?? 0,
                        viewport: {
                            x: e.viewport.x,
                            y: e.viewport.y,
                            width: e.viewport.width,
                            height: e.viewport.height,
                        }
                    }))
                }
                this.displayConfig.sections ??= [];
                if ((!sliceConfig.sections) && ((typeof sliceConfig.layers !== "number") || this.displayConfig.layers == sliceConfig.layers)) return;
                sliceConfig.layers ??= this.displayConfig.layers ?? 0;
                this.displayConfig.layers = sliceConfig.layers;
                let sections = this.displayConfig.sections;
                let sliceStep = 2 / sliceConfig.layers; // slice from -1 to 1
                let sliceGroupNum = Math.ceil(sliceConfig.layers / this.sliceGroupSize);
                let sliceNum = sliceGroupNum << this.sliceGroupSizeBit;
                if (this.displayConfig.sliceNum !== sliceNum) {
                    this.displayConfig.sliceNum = sliceNum;
                    this.setOpacity(this.displayConfig.opacity ?? 1);
                }
                let sectionNum = sections.length ?? 0;
                let sectionGroupNum = Math.ceil(sectionNum / this.sliceGroupSize);
                let totalNum = sliceNum + (sectionGroupNum << this.sliceGroupSizeBit);
                let slices = (this.slicesJsBuffer?.length === totalNum << 2) ? this.slicesJsBuffer : new Float32Array(totalNum << 2);
                this.slicesJsBuffer = slices;
                slices.fill(0);// todo : check neccesity?
                for (let slice = -1, i = 0; i < sliceNum; slice += sliceStep, i++) {
                    slices[(i << 2)] = slice; // if slice > 1, discard in shader
                    slices[(i << 2) + 1] = 0;
                    slices[(i << 2) + 2] = 0;
                }
                this.sliceGroupNum = sliceGroupNum;
                this.totalGroupNum = sliceGroupNum + sectionGroupNum;
                if (sectionNum) {
                    let thumbnailViewportJsBuffer = new Float32Array(4 * 16);
                    let lastGroupPosition = sectionGroupNum - 1 << this.sliceGroupSizeBit;
                    let lastGroupSlices = sections.length - lastGroupPosition;
                    for (let i = sliceNum, j = 0; i < totalNum; i++, j++) {
                        let config = sections[j];
                        slices[(i << 2)] = config?.slicePos ?? 0;
                        slices[(i << 2) + 1] = u32_to_f32(((config?.facing) ?? 0) | ((config?.eyeOffset ?? 1) << 3));
                        slices[(i << 2) + 2] = u32_to_f32(j < lastGroupPosition ? this.sliceGroupSize : lastGroupSlices);
                        if (config) {
                            thumbnailViewportJsBuffer[j << 2] = config.viewport.x;
                            thumbnailViewportJsBuffer[(j << 2) + 1] = config.viewport.y;
                            thumbnailViewportJsBuffer[(j << 2) + 2] = config.viewport.width;
                            thumbnailViewportJsBuffer[(j << 2) + 3] = config.viewport.height;
                        }
                    }
                    this.gpu.device.queue.writeBuffer(this.thumbnailViewportBuffer, 0, thumbnailViewportJsBuffer);
                }
                this.gpu.device.queue.writeBuffer(this.emitIndexSliceBuffer, 0, slices);
                this.retinaFacingChanged = true; // force to reload retina slice num into refacing buffer
                function u32_to_f32(u32: number) {
                    return new Float32Array(new Uint32Array([u32]).buffer)[0]
                }
            }
            render(drawCall: () => void) {
                if (!this.screenTexture) { console.error("tesserxel.SliceRenderer: Must call setSize before rendering"); }
                const gpu = this.gpu;
                if (this.retinaMatrixChanged) {
                    this.retinaMatrixChanged = false;
                    gpu.device.queue.writeBuffer(this.retinaMVBuffer, 0, this.retinaMVMatJsBuffer);
                }
                if (this.retinaFacingChanged) {
                    // refacing buffer stores not only refacing but also retina slices
                    gpu.device.queue.writeBuffer(this.refacingBuffer, 0, new Uint32Array([
                        this.currentRetinaFacing | ((this.sliceGroupNum) << (5 + this.sliceGroupSizeBit))
                    ]));
                    this.retinaFacingChanged = false;
                }
                let commandEncoder = gpu.device.createCommandEncoder();
                let canvasView = this.context.getCurrentTexture().createView();

                for (let sliceIndex = 0; sliceIndex < this.totalGroupNum; sliceIndex++) {

                    this.renderState = {
                        commandEncoder,
                        sliceIndex,
                        needClear: true,
                    };
                    // set new slicegroup offset
                    commandEncoder.copyBufferToBuffer(this.sliceGroupOffsetBuffer, sliceIndex << 2, this.sliceOffsetBuffer, 0, 4);
                    drawCall();
                    if (this.renderState.needClear) {
                        // if drawCall is empty, we also need to clear texture
                        let clearPassEncoder = commandEncoder.beginRenderPass(this.crossRenderPassDescClear);
                        clearPassEncoder.setPipeline(this.clearRenderPipeline);
                        clearPassEncoder.draw(0);
                        clearPassEncoder.end();
                    }
                    let retinaPassEncoder = commandEncoder.beginRenderPass({
                        colorAttachments: [{
                            view: this.screenView,
                            clearValue: this.screenClearColor,
                            loadOp: sliceIndex === 0 ? 'clear' : "load" as GPULoadOp,
                            storeOp: 'store' as GPUStoreOp
                        }]
                    });
                    retinaPassEncoder.setPipeline(this.retinaRenderPipeline);
                    retinaPassEncoder.setBindGroup(0, this.retinaBindGroup);
                    let isSectionCount = this.displayConfig.sections.length && sliceIndex >= this.sliceGroupNum;
                    let lastCount = isSectionCount ? this.displayConfig.sections.length % this.sliceGroupSize : 0;
                    let count = isSectionCount ? (
                        // if is section group
                        sliceIndex == this.totalGroupNum - 1 && lastCount ? lastCount : this.sliceGroupSize
                    ) :
                        // if is not section group
                        this.enableEye3D ? (this.sliceGroupSize << 1) : this.sliceGroupSize;
                    retinaPassEncoder.draw(4, count, 0, 0);
                    retinaPassEncoder.end();
                }
                let screenPassEncoder = commandEncoder.beginRenderPass({
                    colorAttachments: [{
                        view: canvasView,
                        clearValue: this.screenClearColor,
                        loadOp: 'clear' as GPULoadOp,
                        storeOp: 'store' as GPUStoreOp
                    }]
                });
                screenPassEncoder.setPipeline(this.screenRenderPipeline);
                screenPassEncoder.setBindGroup(0, this.screenBindGroup);
                screenPassEncoder.draw(4);
                screenPassEncoder.end();
                gpu.device.queue.submit([commandEncoder.finish()]);
                this.renderState = null;
            } // end render
            /** Set TetraSlicePipeline and prepare GPU resources.
             *  Next calls should be function sliceTetras or setBindGroup.
             */
            beginTetras(pipeline: TetraSlicePipeline) {
                if (!this.renderState) console.error("beginTetras should be called in a closure passed to render function");
                let { commandEncoder, sliceIndex, needClear } = this.renderState;
                // clear triagle slice vertex output pointer to zero (emitIndex part)
                commandEncoder.clearBuffer(this.emitIndexSliceBuffer, this.maxSlicesNumber << 4, 4 << this.sliceGroupSizeBit);
                // clear triagle slice vertex output data to zero
                commandEncoder.clearBuffer(pipeline.outputVaryBuffer[0]);

                let computePassEncoder = commandEncoder.beginComputePass();
                computePassEncoder.setPipeline(pipeline.computePipeline);
                computePassEncoder.setBindGroup(0, pipeline.computeBindGroup0);
                this.renderState.computePassEncoder = computePassEncoder;
                this.renderState.pipeline = pipeline;
            }
            getFrustumRange() {
                if (!this.renderState) console.error("getFrustum should be called in a closure passed to render function");
                let minslice = this.renderState.sliceIndex << this.sliceGroupSizeBit;
                let maxslice = minslice + this.sliceGroupSize - 1;
                let isRetinaGroup = this.slicesJsBuffer[(minslice << 2) + 1];
                let frustum: number[];
                // let refacing;
                let camProj = 1 / this.camProjJsBuffer[1];
                if (isRetinaGroup === 0) {
                    minslice = this.slicesJsBuffer[minslice << 2] * camProj;
                    maxslice = this.slicesJsBuffer[maxslice << 2] * camProj;
                    switch (this.currentRetinaFacing) {
                        case SliceFacing.POSZ:
                            frustum = [-camProj, camProj, -camProj, camProj, minslice, maxslice];
                            break;
                        case SliceFacing.NEGZ:
                            frustum = [-camProj, camProj, -camProj, camProj, -maxslice, -minslice];
                            break;
                        case SliceFacing.POSX:
                            frustum = [minslice, maxslice, -camProj, camProj, -camProj, camProj];
                            break;
                        case SliceFacing.NEGX:
                            frustum = [-maxslice, -minslice, -camProj, camProj, -camProj, camProj];
                            break;
                        case SliceFacing.POSY:
                            frustum = [-camProj, camProj, minslice, maxslice, -camProj, camProj];
                            break;
                        case SliceFacing.NEGY:
                            frustum = [-camProj, camProj, -maxslice, -minslice, -camProj, camProj];
                            break;
                    }
                    // frustum = frustum.join(",");
                    // refacing = SliceFacing[this.currentRetinaFacing];
                } else {
                    // isRetinaGroup = new Uint32Array(new Float32Array([isRetinaGroup]).buffer)[0];
                    // todo
                }
                return frustum;
                // console.log({ isRetinaGroup, frustum,  refacing});
            }
            setBindGroup(index: number, bindGroup: GPUBindGroup) {
                if (!this.renderState) console.error("setBindGroup should be called in a closure passed to render function");
                let { computePassEncoder } = this.renderState;
                computePassEncoder.setBindGroup(index, bindGroup);
            }
            /** Compute slice of given bindgroup attribute data.
             *  beginTetras should be called at first to specify a tetraSlicePipeline
             *  Next calls should be function sliceTetras, setBindGroup or drawTetras.
             */
            sliceTetras(vertexBindGroup: GPUBindGroup, tetraCount: number, instanceCount?: number) {
                if (!this.renderState) console.error("sliceTetras should be called in a closure passed to render function");
                let { computePassEncoder } = this.renderState;
                computePassEncoder.setBindGroup(1, vertexBindGroup);
                computePassEncoder.dispatchWorkgroups(Math.ceil(tetraCount / 256), instanceCount); // todo: change workgroups
            }
            setWorldClearColor(color: GPUColor) {
                this.crossRenderPassDescClear.colorAttachments[0].clearValue = color;
            }
            setScreenClearColor(color: GPUColor) {
                this.screenClearColor = color;
            }
            /** This function draw slices on a internal framebuffer
             *  Every beginTetras call should be end with drawTetras call
             */
            drawTetras(bindGroups?: { group: number, binding: GPUBindGroup }[]) {
                if (!this.renderState) console.error("drawTetras should be called in a closure passed to render function");
                let { commandEncoder, computePassEncoder, pipeline, needClear } = this.renderState;
                computePassEncoder.end();

                let slicePassEncoder = commandEncoder.beginRenderPass(
                    // this.crossRenderPassDescClear
                    needClear ? this.crossRenderPassDescClear : this.crossRenderPassDescLoad
                );
                slicePassEncoder.setPipeline(pipeline.renderPipeline);
                for (let i = 0; i < pipeline.vertexOutNum; i++) {
                    slicePassEncoder.setVertexBuffer(i, pipeline.outputVaryBuffer[i]);
                }
                if (bindGroups) {
                    for (let { group, binding } of bindGroups) {
                        slicePassEncoder.setBindGroup(group, binding);
                    }
                }
                // bitshift: outputBufferSize / 16 for vertices number, / sliceGroupSize for one stride
                let bitshift = 4 + this.sliceGroupSizeBit;
                let verticesStride = this.maxCrossSectionBufferSize >> bitshift;
                let offsetVert = 0; let offsetPosY = 0;
                for (let c = 0; c < this.sliceGroupSize; c++, offsetVert += verticesStride, offsetPosY += this.sliceResolution) {
                    slicePassEncoder.setViewport(0, offsetPosY, this.sliceResolution, this.sliceResolution, 0, 1);
                    slicePassEncoder.draw(verticesStride, 1, offsetVert);
                }
                slicePassEncoder.end();
                this.renderState.needClear = false;
            }
            async createRaytracingPipeline(desc: RaytracingPipelineDescriptor) {
                let code = desc.code.replace(/@ray(\s)/g, "@vertex$1");
                const reflect = new wgslreflect.WgslReflect(code);
                let mainRayFn = reflect.functions.filter(
                    e => e.attributes && e.attributes.some(a => a.name === "vertex") && e.name == desc.rayEntryPoint
                )[0];
                if (!mainRayFn) console.error("Raytracing pipeline: Entry point does not exist.");
                // let mainFragFn = reflect.functions.filter(
                //     e => e.attributes && e.attributes.some(a => a.name === "fragment") && e.name == desc.fragment.entryPoint
                // )[0];
                let { input, output, call } = wgslreflect.getFnInputAndOutput(reflect, mainRayFn,
                    {
                        "builtin(ray_origin)": "camRayOri",
                        "builtin(ray_direction)": "camRayDir",
                        "builtin(voxel_coord)": "voxelCoord",
                        "builtin(aspect_matrix)": "refacingMat3 * mat3x3<f32>(aspect,0.0,0.0, 0.0,1.0,0.0, 0.0,0.0,1.0) * refacingMat3",
                    },
                    ["location(0)", "location(1)", "location(2)", "location(3)", "location(4)", "location(5)"]
                );
                let dealRefacingCall = "";
                if (input.has("builtin(aspect_matrix)")) {
                    dealRefacingCall = "let refacingMat3 = mat3x3<f32>(refacingMat[0].xyz,refacingMat[1].xyz,refacingMat[2].xyz);"
                }
                let retunTypeMembers: string;
                let outputMembers: string;
                if (mainRayFn.return.attributes) {
                    outputMembers = output["return"].expr;
                    retunTypeMembers = `@${wgslreflect.parseAttr(mainRayFn.return.attributes)} ${wgslreflect.parseTypeName(mainRayFn.return)}`;
                } else {
                    let st = reflect.structs.filter(s => s.name === mainRayFn.return.name)[0];
                    if (!st) console.error("No attribute found");
                    outputMembers = st.members.map(m => output[wgslreflect.parseAttr(m.attributes)].expr).join(",\n");
                    retunTypeMembers = st.members.map(m => `@${wgslreflect.parseAttr(m.attributes)} ${m.name}: ${wgslreflect.parseTypeName(m.type)}`).join(",\n");
                }

                // ${wgslreflect.parseAttr(mainRayFn.return.attributes)} userRayOut: ${wgslreflect.parseTypeName(mainRayFn.return)}
                let shaderCode = this.refacingMatsCode + `
struct _SliceInfo{
    slicePos: f32,
    refacing: u32,
    flag: u32,
    _pading: u32,
}
struct _vOut{
    @builtin(position) pos: vec4<f32>,
    ${retunTypeMembers}
    // @location(0) rayDir: vec4<f32>,
    // @location(1) rayPos: vec4<f32>,
    // @location(2) retinaPosition: vec4<f32>,
}
struct AffineMat{
    matrix: mat4x4<f32>,
    vector: vec4<f32>,
}
@group(0) @binding(0) var<storage, read> _slice: array<_SliceInfo, ${this.maxSlicesNumber}>;
@group(0) @binding(1) var<uniform> _sliceoffset : u32;
@group(0) @binding(2) var<uniform> _refacingMat : u32;
@group(0) @binding(3) var<uniform> _eye4dOffset : f32;
@group(0) @binding(4) var<uniform> _camProj: vec4<f32>;
@group(0) @binding(5) var<uniform> thumbnailViewport : array<vec4<f32>,16>;
fn apply(afmat: AffineMat, points: mat4x4<f32>) -> mat4x4<f32>{
    let biais = mat4x4<f32>(afmat.vector, afmat.vector, afmat.vector, afmat.vector);
    return afmat.matrix * points + biais;
}
fn applyinv(afmat: AffineMat, points: mat4x4<f32>) -> mat4x4<f32>{
    let biais = mat4x4<f32>(afmat.vector, afmat.vector, afmat.vector, afmat.vector);
    return transpose(afmat.matrix) * (points - biais);
}
${code.replace(/@vertex/g, " ").replace(/@builtin\s*\(\s*(ray_origin|ray_direction|voxel_coord|aspect_matrix)\s*\)\s*/g, " ")}
@vertex fn mainVertex(@builtin(vertex_index) vindex:u32, @builtin(instance_index) i_index:u32) -> _vOut{
    const pos = array<vec2<f32>, 4>(
        vec2<f32>(-1.0, -1.0),
        vec2<f32>(-1.0, 1.0),
        vec2<f32>( 1.0, -1.0),
        vec2<f32>( 1.0, 1.0),
    );
    let sliceInfo = _slice[_sliceoffset + i_index];
    
    let sliceFlag = _slice[_sliceoffset].flag;
    var refacingEnum : u32;

    let posidx = pos[vindex];
    let coord = vec2<f32>(posidx.x, posidx.y);
    var aspect = 1.0;
    var rayPos = vec4<f32>(0.0);// no eye offset for retina
    if(sliceFlag == 0){
        refacingEnum = _refacingMat;
    }else{
        refacingEnum = sliceInfo.refacing;
        let vp = thumbnailViewport[_sliceoffset + i_index - (_refacingMat >> 5)];
        aspect = vp.z / vp.w;
        rayPos = vec4<f32>(-_eye4dOffset * (f32(sliceInfo.refacing >> 3) - 1.0), 0.0, 0.0, 0.0);
    }
    let rayDir = vec4<f32>(coord.x/_camProj.x * aspect, coord.y/_camProj.y, sliceInfo.slicePos/_camProj.x, -1.0);
    let refacingMat = refacingMats[refacingEnum & 7];
    let voxelCoord = (refacingMat * vec4<f32>(coord, sliceInfo.slicePos,0.0)).xyz;
    let camRayDir = refacingMat * rayDir;
    let camRayOri = refacingMat * rayPos;
    ${dealRefacingCall}
    ${call}
    return _vOut(
        vec4<f32>(posidx.x,
            -((
                (-posidx.y + 1.0) * 0.5 + f32(i_index)
            )*${1 / this.sliceGroupSize} - 0.5)*2.0, 0.999999, 1.0),
        ${outputMembers}
        // transpose(camMat.matrix) * (refacingMat * rayPos + camMat.vector),
        // vec4<f32>(-pos[vindex], -sliceInfo.slicePos, 1.0)
    );
}
fn calDepth(distance: f32)->f32{
    return -_camProj.z + _camProj.w / distance;
}
`;
                let module = this.gpu.device.createShaderModule({ code: shaderCode });
                let pipeline = await this.gpu.device.createRenderPipelineAsync({
                    layout: 'auto',
                    vertex: {
                        module,
                        entryPoint: 'mainVertex',
                    },
                    fragment: {
                        module,
                        entryPoint: "mainFragment",
                        targets: [{ format: this.gpu.preferredFormat }]
                    },
                    primitive: {
                        topology: 'triangle-strip',
                    },
                    depthStencil: {
                        depthWriteEnabled: true,
                        depthCompare: 'less',
                        format: 'depth24plus',
                    }
                });

                let buffers = [
                    { buffer: this.emitIndexSliceBuffer },
                    { buffer: this.sliceOffsetBuffer },
                    { buffer: this.refacingBuffer },
                    { buffer: this.eyeBuffer },
                    { buffer: this.camProjBuffer },
                    { buffer: this.thumbnailViewportBuffer },
                ];
                return {
                    pipeline, bindGroup0: this.gpu.createBindGroup(pipeline, 0, buffers)
                };
            }
            drawRaytracing(pipeline: RaytracingPipeline, bindGroups?: GPUBindGroup[]) {
                if (!this.renderState) console.error("drawRaytracing should be called in a closure passed to render function");
                let { commandEncoder, needClear, sliceIndex } = this.renderState;
                let slicePassEncoder = commandEncoder.beginRenderPass(
                    needClear ? this.crossRenderPassDescClear : this.crossRenderPassDescLoad
                );
                slicePassEncoder.setPipeline(pipeline.pipeline);
                slicePassEncoder.setBindGroup(0, pipeline.bindGroup0);
                slicePassEncoder.setBindGroup(1, bindGroups[0]);
                slicePassEncoder.draw(4, this.sliceGroupSize);
                slicePassEncoder.end();
                this.renderState.needClear = false;
            }
        }; // end class
    }
}