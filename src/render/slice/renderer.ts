import { AffineMat4, Obj4 } from "../../math/algebra/affine";
import { Mat4 } from "../../math/algebra/mat4";
import { Vec4 } from "../../math/algebra/vec4";
import { _RAD2DEG } from "../../math/const";
import { OrthographicCamera, PerspectiveCamera, getOrthographicProjectionMatrix, getPerspectiveProjectionMatrix } from "../../math/geometry/camera";
import { AABB, Plane } from "../../math/geometry/primitive";
import { GPU } from "../gpu";
import { DefaultDisplayConfig, DisplayConfig, DisplayConfigName, EyeStereo, IWireframeRenderState, RaytracingPipelineDescriptor, RetinaRenderPassDescriptor, RetinaSliceFacing, SectionConfig, SliceRendererConfig, TetraSlicePipelineDescriptor } from "./interfaces";
import { RaytracingPipeline, StructDefSliceInfo, StructDefUniformBuffer, TetraSlicePipeline, refacingMatsCode } from "./pipeline";
import { RenderState as IRenderState, RetinaRenderPass as IRetinaRenderPass } from "./interfaces";
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
const DefaultWorkGroupSize = 256;
const DefaultSliceGroupSize = 16;
const DefaultMaxSlicesNumber = 256;
const DefaultMaxCrossSectionBufferSize = 0x800000;
const DefaultEnableFloat16Blend = true;
const uniformsBufferLength = 64 + 64 + 16 + 4 + 4 + 4 + 4 + 12 + 4; // last 4 is padding
const retinaMVBufferOffset = 0;
const retinaProjectBufferOffset = 64;
const camProjBufferOffset = retinaProjectBufferOffset + 64;
const eyeCrossBufferOffset = camProjBufferOffset + 16;
const sliceOffsetBufferOffset = eyeCrossBufferOffset + 12;
const refacingBufferOffset = sliceOffsetBufferOffset + 4;
const screenAspectBufferOffset = refacingBufferOffset + 4;
const layerOpacityBufferOffset = screenAspectBufferOffset + 4;
const power2arr = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512];
let linearTextureSampler: GPUSampler;

export class SliceRenderer {

    gpu: GPU;
    private tetraBuffers: TetraSliceBufferMgr;
    private sliceBuffers: RetinaSliceBufferMgr;
    private crossRenderPass: CrossRenderPass;
    private retinaRenderPass: RetinaRenderPass;
    private screenRenderPass: ScreenRenderPass;
    private rendererConfig: InternalSliceRendererConfig;
    private displayConfig: InternalDisplayConfig;
    private wireframeRenderPass: WireFrameRenderPass;

    constructor(gpu: GPU, config?: SliceRendererConfig) {
        if (!gpu.device) throw "GPU is not initialized yet.";
        config ??= {};
        config.maxSlicesNumber ??= DefaultMaxSlicesNumber;
        config.enableFloat16Blend ??= DefaultEnableFloat16Blend;
        config.maxCrossSectionBufferSize ??= DefaultMaxCrossSectionBufferSize;
        config.sliceGroupSize ??= DefaultSliceGroupSize;
        config.defaultWorkGroupSize ??= DefaultWorkGroupSize;

        this.rendererConfig = config as InternalSliceRendererConfig;
        this.rendererConfig.sliceGroupSizeBit = power2arr.indexOf(config.sliceGroupSize);
        const maxTextureSize = gpu.device.limits.maxTextureDimension2D;
        this.rendererConfig.maxTextureSize = maxTextureSize;
        this.rendererConfig.sliceTextureWidth = maxTextureSize >> 1;
        this.rendererConfig.sliceTextureHeight = maxTextureSize;
        // viewport is compressed in gpu buffer by four u8s, therefore shift amount is maxSize >> 8
        this.rendererConfig.viewportCompressShift = power2arr.indexOf(this.rendererConfig.maxTextureSize >> 8);
        this.gpu = gpu;
        this.wireframeRenderPass = new WireFrameRenderPass(gpu, this.rendererConfig);
        this.sliceBuffers = new RetinaSliceBufferMgr(gpu, this.rendererConfig);
        this.tetraBuffers = new TetraSliceBufferMgr(gpu, this.rendererConfig, this.sliceBuffers);
        this.crossRenderPass = new CrossRenderPass(gpu);
        this.retinaRenderPass = new RetinaRenderPass(gpu, this.rendererConfig, this.sliceBuffers, this.crossRenderPass);
        this.screenRenderPass = new ScreenRenderPass(gpu, this.rendererConfig, this.sliceBuffers);
        linearTextureSampler = gpu.device.createSampler({
            magFilter: 'linear',
            minFilter: 'linear'
        });
        this.displayConfig = {
            sections: [], retinaResolution: 0, retinaLayers: 0,
            retinaStereoEyeOffset: 0, sectionStereoEyeOffset: 0, crosshair: 0,
            opacity: 1, paddedSliceNum: 0, sliceGroupNum: 0, totalGroupNum: 0, enableStereo: false
        };
        this.setDisplayConfig(DefaultDisplayConfig);
    }
    async init() {
        await Promise.all([this.crossRenderPass.init(), this.retinaRenderPass.init(), this.screenRenderPass.init(), this.wireframeRenderPass.init()]);
        return this;
    }
    createRetinaRenderPass(descriptor: RetinaRenderPassDescriptor): IRetinaRenderPass {
        return new RetinaRenderPass(this.gpu, this.rendererConfig, this.sliceBuffers, this.crossRenderPass, descriptor) as IRetinaRenderPass;
    }
    setRetinaRenderPass(retinaRenderPass: IRetinaRenderPass) {
        this.retinaRenderPass = retinaRenderPass as RetinaRenderPass;
    }
    getCurrentRetinaRenderPass() {
        return this.retinaRenderPass as IRetinaRenderPass;
    }
    setDisplayConfig(config: DisplayConfig) {

        /// Small buffers settings

        if (config.canvasSize) {
            this.displayConfig.canvasSize = config.canvasSize;
            this.screenRenderPass.setSize(config.canvasSize);
        }
        if (config.screenBackgroundColor) this.displayConfig.screenBackgroundColor = config.screenBackgroundColor;
        if (config.retinaClearColor) {
            this.displayConfig.retinaClearColor = config.retinaClearColor
            this.crossRenderPass.descClear.colorAttachments[0].clearValue = config.retinaClearColor;
        }
        config.retinaLayers ??= this.displayConfig.retinaLayers ?? 0;
        config.opacity ??= this.displayConfig.opacity ?? 1;
        config.crosshair ??= this.displayConfig.crosshair ?? 0;
        config.retinaStereoEyeOffset ??= this.displayConfig.retinaStereoEyeOffset;
        config.sectionStereoEyeOffset ??= this.displayConfig.sectionStereoEyeOffset;

        if (config.opacity !== this.displayConfig.opacity || config.retinaLayers !== this.displayConfig.retinaLayers) {
            // When sliceNum == 0, opacity is 0 -> detect opacity to not render crosshair
            let value = config.retinaLayers ? config.opacity / config.retinaLayers : 0.0;
            this.gpu.device.queue.writeBuffer(this.sliceBuffers.uniformsBuffer, layerOpacityBufferOffset, new Float32Array([value]));
            this.displayConfig.opacity = config.opacity;
        }
        if (
            config.retinaStereoEyeOffset !== this.displayConfig.retinaStereoEyeOffset ||
            config.sectionStereoEyeOffset !== this.displayConfig.sectionStereoEyeOffset ||
            config.crosshair !== this.displayConfig.crosshair
        ) {
            this.displayConfig.retinaStereoEyeOffset = config.retinaStereoEyeOffset;
            this.displayConfig.sectionStereoEyeOffset = config.sectionStereoEyeOffset;
            this.displayConfig.crosshair = config.crosshair;
            this.gpu.device.queue.writeBuffer(this.sliceBuffers.uniformsBuffer, eyeCrossBufferOffset, new Float32Array([
                config.sectionStereoEyeOffset, config.retinaStereoEyeOffset, config.crosshair
            ]));
            this.displayConfig.enableStereo = this.displayConfig.sectionStereoEyeOffset !== 0 || this.displayConfig.retinaStereoEyeOffset !== 0;
        }

        if (config.camera4D) this.sliceBuffers.setCameraProjectMatrix(config.camera4D);
        if (config.camera3D) this.sliceBuffers.setRetinaProjectMatrix(config.camera3D);
        if (config.retinaViewMatrix) this.sliceBuffers.setRetinaViewMatrix(config.retinaViewMatrix);

        /// Small buffers settings end

        if ((!config.sections) && (this.displayConfig.retinaLayers == config.retinaLayers
        ) && (!config.retinaResolution)) return;

        /// Retina and section configurations

        this.sliceBuffers.setSlicesAndSections(this.displayConfig, config);

    }
    getSafeTetraNumInOnePass() {
        // maximum vertices per slice
        let maxVertices = this.rendererConfig.maxCrossSectionBufferSize >> (this.rendererConfig.sliceGroupSizeBit + 4);
        // one tetra generate at most 6 vertices
        return Math.floor(maxVertices / 6);
    }
    getStereoMode() { return this.getDisplayConfig('retinaStereoEyeOffset') !== 0 || this.getDisplayConfig('sectionStereoEyeOffset') !== 0; }
    getMinResolutionMultiple() { return 1 << this.rendererConfig.viewportCompressShift; }
    getDisplayConfig(configNames: 'canvasSize'): GPUExtent3DStrict;
    getDisplayConfig(configNames: 'sections'): SectionConfig[];
    getDisplayConfig(configNames: 'retinaViewMatrix'): Mat4;
    getDisplayConfig(configNames: 'camera3D' | 'camera4D'): PerspectiveCamera | OrthographicCamera;
    getDisplayConfig(configNames: "screenBackgroundColor" | "retinaClearColor"): GPUColor;
    getDisplayConfig(configNames: 'retinaLayers' | 'retinaResolution' | 'opacity' | 'sectionStereoEyeOffset' | 'retinaStereoEyeOffset' | 'crosshair'): number;
    getDisplayConfig(...configNames: DisplayConfigName[]) {
        const cfg = this.displayConfig;
        if (!configNames || !configNames.length) {
            return {
                canvasSize: cfg.canvasSize,
                sections: this.sliceBuffers.deepCopySectionConfigs(cfg.sections),
                retinaLayers: cfg.retinaLayers,
                retinaResolution: cfg.retinaResolution,
                opacity: cfg.opacity,
                retinaStereoEyeOffset: cfg.retinaStereoEyeOffset,
                sectionStereoEyeOffset: cfg.sectionStereoEyeOffset,
                crosshair: cfg.crosshair,
                screenBackgroundColor: cfg.screenBackgroundColor,
                retinaClearColor: cfg.retinaClearColor,
                camera4D: cfg.camera4D,
                camera3D: cfg.camera3D,
                retinaViewMatrix: cfg.retinaViewMatrix,
            } as DisplayConfig;
        }
        if (configNames.length === 1) {
            const name = configNames[0];
            switch (name) {
                case 'sections': return this.sliceBuffers.deepCopySectionConfigs(cfg.sections);
                default: return cfg[name];
            }
        }
        return configNames.map(name => name === 'sections' ? this.sliceBuffers.deepCopySectionConfigs(cfg.sections) : cfg[name]);
    }
    render(context: GPUCanvasContext, drawCall: (rs: IRenderState) => void, wireFrameDrawCall?: (rs: IWireframeRenderState) => void) {
        this.sliceBuffers.updateBuffers(this.displayConfig.sliceGroupNum);

        const gpu = this.gpu;
        if (!this.crossRenderPass.clearRenderPipeline) throw "SliceRenderer is not initailzed, forget to call 'await SliceRenderer.init()' ?";
        if (!this.retinaRenderPass.pipeline) throw "SliceRenderer's current retinaRenderPass is not initailzed, forget to call 'await RetinaRenderPass.init()' ?";
        let canvasView = context.getCurrentTexture().createView();
        const renderState = new RenderState(this.gpu, this.rendererConfig, this.sliceBuffers, this.tetraBuffers, this.crossRenderPass);
        const commandEncoder = renderState.commandEncoder;
        // todo: disable depth first, then add it
        if (wireFrameDrawCall) {
            this.wireframeRenderPass.renderPassDesc = {
                colorAttachments: [{
                    clearValue: this.displayConfig.screenBackgroundColor,
                    view: this.screenRenderPass.view,
                    loadOp: "clear" as GPULoadOp,
                    storeOp: 'store' as GPUStoreOp
                }],
                depthStencilAttachment: {
                    view: this.screenRenderPass.depthView,
                    depthClearValue: 1.0,
                    depthLoadOp: 'clear' as GPULoadOp,
                    depthStoreOp: 'store' as GPUStoreOp,
                }
            };
            this.wireframeRenderPass.renderState = renderState;
            wireFrameDrawCall(this.wireframeRenderPass);
            this.wireframeRenderPass.renderState = undefined;
        }

        for (let sliceIndex = 0; sliceIndex < this.displayConfig.totalGroupNum; sliceIndex++) {
            renderState.needClear = true;
            renderState.sliceIndex = sliceIndex;
            renderState.frustumRange = undefined;
            // set new slicegroup offset
            commandEncoder.copyBufferToBuffer(this.sliceBuffers.sliceGroupOffsetBuffer, sliceIndex << 2, this.sliceBuffers.uniformsBuffer, sliceOffsetBufferOffset, 4);
            drawCall(renderState);
            if (renderState.needClear) {
                // if drawCall is empty, we also need to clear texture
                let clearPassEncoder = commandEncoder.beginRenderPass(this.crossRenderPass.descClear);
                clearPassEncoder.setPipeline(this.crossRenderPass.clearRenderPipeline);
                clearPassEncoder.draw(0);
                clearPassEncoder.end();
            }
            const loadOp = (!wireFrameDrawCall) && sliceIndex === 0 ? 'clear' : "load" as GPULoadOp;
            let retinaPassEncoder = commandEncoder.beginRenderPass({
                colorAttachments: [{
                    view: this.screenRenderPass.view,
                    clearValue: this.displayConfig.screenBackgroundColor,
                    loadOp,
                    storeOp: 'store' as GPUStoreOp
                }],

                depthStencilAttachment: {
                    view: this.screenRenderPass.depthView,
                    depthClearValue: 1.0,
                    depthLoadOp: loadOp,
                    depthStoreOp: 'store' as GPUStoreOp,
                }
            });
            retinaPassEncoder.setPipeline(this.retinaRenderPass.pipeline);
            retinaPassEncoder.setBindGroup(0, this.retinaRenderPass.bindgroup);
            if (this.retinaRenderPass.alphaBindgroup) {
                retinaPassEncoder.setBindGroup(1, this.retinaRenderPass.alphaBindgroup);
            }
            let isSectionCount = this.displayConfig.sections.length && sliceIndex >= this.displayConfig.sliceGroupNum;
            let lastCount = isSectionCount ? this.displayConfig.sections.length % this.rendererConfig.sliceGroupSize : 0;
            let count = isSectionCount ? (
                // if is section group
                sliceIndex == this.displayConfig.totalGroupNum - 1 && lastCount ? lastCount : this.rendererConfig.sliceGroupSize
            ) :
                // if is not section group
                this.displayConfig.enableStereo ? (this.rendererConfig.sliceGroupSize << 1) : this.rendererConfig.sliceGroupSize;
            retinaPassEncoder.draw(4, count, 0, 0);
            retinaPassEncoder.end();
        }

        let screenPassEncoder = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: canvasView,
                clearValue: this.displayConfig.screenBackgroundColor,
                loadOp: 'clear' as GPULoadOp,
                storeOp: 'store' as GPUStoreOp
            }]
        });
        screenPassEncoder.setPipeline(this.screenRenderPass.pipeline);
        screenPassEncoder.setBindGroup(0, this.screenRenderPass.bindgroup);
        screenPassEncoder.draw(4);
        screenPassEncoder.end();
        gpu.device.queue.submit([commandEncoder.finish()]);
    }

    async createTetraSlicePipeline(descriptor: TetraSlicePipelineDescriptor): Promise<TetraSlicePipeline> {
        // lazy init buffer here, optimization for only raytracing rendering
        if (!this.tetraBuffers.outputVaryBufferPool.length) this.tetraBuffers.init();
        return await new TetraSlicePipeline().init(this.gpu, this.rendererConfig, descriptor, this.tetraBuffers);
    }
    async createRaytracingPipeline(descriptor: RaytracingPipelineDescriptor): Promise<RaytracingPipeline> {
        return await new RaytracingPipeline().init(this.gpu, this.rendererConfig, descriptor, this.sliceBuffers);
    }

    /** for TetraSlicePipeline, vertex shader is internally a compute shader, so it doesn't share bindgroups with fragment shader.
     *  for RaytracingPipeline, vertex shader and fragment shader are in one traditional render pipeline, they share bindgroups.
     */
    createVertexShaderBindGroup(pipeline: TetraSlicePipeline | RaytracingPipeline, index: number, buffers: GPUBuffer[], label?: string) {
        if (index === 0) throw "Unable to create BindGroup 0, which is occupied by internal usages.";
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
        if (index === 0 && (pipeline as RaytracingPipeline).pipeline) throw "Unable to create BindGroup 0, which is occupied by internal usages.";
        return this.gpu.createBindGroup(
            ((pipeline as TetraSlicePipeline).computePipeline ?
                (pipeline as TetraSlicePipeline).renderPipeline :
                (pipeline as RaytracingPipeline).pipeline
            ), index, buffers.map(e => ({ buffer: e })), "FragmentShaderBindGroup<" + label + ">"
        );
    }
}



export class RetinaSliceBufferMgr {

    private queue: GPUQueue;
    private rendererConfig: InternalSliceRendererConfig;
    currentRetinaFacing: RetinaSliceFacing;
    retinaMVMatChanged: boolean = true;
    retinaFacingOrSlicesChanged: boolean = true;

    uniformsBuffer: GPUBuffer;
    thumbnailViewportBuffer: GPUBuffer;

    retinaProjectJsBuffer = new Float32Array(16);
    retinaMVMatJsBuffer = new Float32Array(16);
    camProjJsBuffer = new Float32Array(4);
    slicesJsBuffer = new Float32Array(4);
    sliceGroupOffsetBuffer: GPUBuffer;
    emitIndexSliceBuffer: GPUBuffer;

    constructor(gpu: GPU, config: InternalSliceRendererConfig) {

        this.emitIndexSliceBuffer = gpu.createBuffer(GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST, (4 << config.sliceGroupSizeBit) + (config.maxSlicesNumber << 4));

        this.uniformsBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, uniformsBufferLength);
        this.thumbnailViewportBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 1024);

        this.queue = gpu.device.queue;

        const maxSliceGroupNum = Math.ceil(config.maxSlicesNumber / config.sliceGroupSize);
        const sliceGroupOffsets = new Uint32Array(maxSliceGroupNum);
        for (let i = 0; i < maxSliceGroupNum; i++) {
            sliceGroupOffsets[i] = i * config.sliceGroupSize;
        }
        this.sliceGroupOffsetBuffer = gpu.createBuffer(GPUBufferUsage.COPY_SRC, sliceGroupOffsets);
        this.rendererConfig = config;
    }
    updateBuffers(sliceGroupNum: number) {
        if (this.retinaMVMatChanged) {
            this.queue.writeBuffer(this.uniformsBuffer, retinaMVBufferOffset, this.retinaMVMatJsBuffer);
            this.retinaMVMatChanged = false;
        }
        if (this.retinaFacingOrSlicesChanged) {
            // refacing buffer stores not only refacing but also retina slices
            this.queue.writeBuffer(this.uniformsBuffer, refacingBufferOffset, new Uint32Array([
                this.currentRetinaFacing | ((sliceGroupNum) << (5 + this.rendererConfig.sliceGroupSizeBit))
            ]));
            this.retinaFacingOrSlicesChanged = false;
        }
    }
    deepCopySectionConfigs(sectionConfigs: SectionConfig[], defaultRetinaResolution?: number) {
        return sectionConfigs.map(e => ({
            eyeStereo: e.eyeStereo ?? EyeStereo.None,
            facing: e.facing,
            slicePos: e.slicePos ?? 0,
            viewport: {
                x: e.viewport.x,
                y: e.viewport.y,
                width: e.viewport.width,
                height: e.viewport.height,
            },
            resolution: e.resolution ?? defaultRetinaResolution
        })) as SectionConfig[];
    }
    setSlicesAndSections(internalDisplayConfig: InternalDisplayConfig, displayConfig: DisplayConfig) {

        let vpShift = this.rendererConfig.viewportCompressShift;
        let prevRetinaResolution = internalDisplayConfig.retinaResolution;
        if (displayConfig.retinaResolution) internalDisplayConfig.retinaResolution = (displayConfig.retinaResolution >> vpShift) << vpShift;

        if (displayConfig.sections) {
            // deepcopy
            internalDisplayConfig.sections = this.deepCopySectionConfigs(displayConfig.sections, internalDisplayConfig.retinaResolution);
        }

        internalDisplayConfig.sections ??= [];
        internalDisplayConfig.retinaLayers = displayConfig.retinaLayers;
        let sections = internalDisplayConfig.sections;
        let sliceStep = 2 / displayConfig.retinaLayers; // slice from -1 to 1
        let sliceGroupNum = Math.ceil(displayConfig.retinaLayers / this.rendererConfig.sliceGroupSize);
        let paddedSliceNum = sliceGroupNum << this.rendererConfig.sliceGroupSizeBit;
        internalDisplayConfig.paddedSliceNum = paddedSliceNum;
        let sectionNum = sections.length ?? 0;
        let sectionGroupNum = Math.ceil(sectionNum / this.rendererConfig.sliceGroupSize);
        let totalNum = paddedSliceNum + (sectionGroupNum << this.rendererConfig.sliceGroupSizeBit);
        let slices = (this.slicesJsBuffer?.length === totalNum << 2) ? this.slicesJsBuffer : new Float32Array(totalNum << 2);
        this.slicesJsBuffer = slices;
        slices.fill(0);// todo : check neccesity?

        let retinaWidth = internalDisplayConfig.retinaResolution;
        let retinaX = 0, retinaY = 0;
        for (let slice = -1, i = 0, sliceGroupOffset = 0; i < paddedSliceNum; slice += sliceStep, i++, sliceGroupOffset++) {
            if (sliceGroupOffset === this.rendererConfig.sliceGroupSize) {
                // start a new slice group
                sliceGroupOffset = 0;
                retinaX = 0;
                retinaY = 0;
            }
            slices[(i << 2)] = slice; // slice pos. if slice > 1, discard in shader
            slices[(i << 2) + 1] = 0; // leave 0 for retina slice (used only in cross section)
            slices[(i << 2) + 2] = 0; // leave 0 for retina slice (used only in cross section)
            let wshift = retinaWidth >> vpShift;
            // a compressed viewport infomation
            slices[(i << 2) + 3] = u32_to_f32(((retinaX >> vpShift) << 24) + ((retinaY >> vpShift) << 16) + (wshift << 8) + wshift);
            if (retinaX + retinaWidth > this.rendererConfig.sliceTextureWidth ||
                retinaY + retinaWidth > this.rendererConfig.sliceTextureHeight) {
                this.setSlicesAndSections(internalDisplayConfig, { retinaResolution: prevRetinaResolution });
                console.warn("Maximum retinaResolution reached");
                return;
            }
            retinaY += retinaWidth;
            if (retinaY + retinaWidth > this.rendererConfig.sliceTextureHeight) {
                retinaX += retinaWidth;
                retinaY = 0;
            }
        }

        internalDisplayConfig.sliceGroupNum = sliceGroupNum;
        internalDisplayConfig.totalGroupNum = sliceGroupNum + sectionGroupNum;
        if (sectionNum) {
            let thumbnailViewportJsBuffer = new Float32Array(4 * 16);
            let lastGroupPosition = sectionGroupNum - 1 << this.rendererConfig.sliceGroupSizeBit;
            let lastGroupSlices = sections.length - lastGroupPosition;
            // get max resolution widths per slice group

            let deltaX = [];
            let maxDx = 0;
            for (let j = 0, sliceGroupOffset = 0, l = sections.length; j < l; j++, sliceGroupOffset++) {
                let config = sections[j];
                if (sliceGroupOffset === this.rendererConfig.sliceGroupSize) {
                    sliceGroupOffset = 0;
                    deltaX.push((maxDx >> vpShift) << vpShift);
                    maxDx = 0;
                }
                maxDx = Math.max(maxDx, Math.ceil(config.resolution / config.viewport.height * config.viewport.width));
            }
            deltaX.push((maxDx >> 4) << 4);
            retinaX = 0;
            retinaY = 0;
            let sliceGroup = 0;
            for (let i = paddedSliceNum, j = 0, sliceGroupOffset = 0; i < totalNum; i++, j++, sliceGroupOffset++) {
                let config = sections[j];
                slices[(i << 2)] = config?.slicePos ?? 0;
                slices[(i << 2) + 1] = u32_to_f32(((config?.facing) ?? 0) | ((config?.eyeStereo ?? 1) << 3));
                slices[(i << 2) + 2] = u32_to_f32(j < lastGroupPosition ? this.rendererConfig.sliceGroupSize : lastGroupSlices);
                if (config) {
                    if (sliceGroupOffset === this.rendererConfig.sliceGroupSize) {
                        retinaX = 0;
                        retinaY = 0;
                        sliceGroupOffset = 0;
                        sliceGroup++;
                    } else if (retinaY + config.resolution > this.rendererConfig.sliceTextureHeight) {
                        retinaX += deltaX[sliceGroup];
                        retinaY = 0;
                    }

                    let wshift = Math.ceil(config.resolution / config.viewport.height * config.viewport.width) >> vpShift;
                    let hshift = config.resolution >> vpShift;
                    slices[(i << 2) + 3] = u32_to_f32(
                        (((retinaX >> vpShift)) << 24) + ((retinaY >> vpShift) << 16) + (wshift << 8) + hshift
                    );
                    thumbnailViewportJsBuffer[j << 2] = config.viewport.x;
                    thumbnailViewportJsBuffer[(j << 2) + 1] = config.viewport.y;
                    thumbnailViewportJsBuffer[(j << 2) + 2] = config.viewport.width;
                    thumbnailViewportJsBuffer[(j << 2) + 3] = config.viewport.height;

                    retinaY += (config.resolution >> vpShift) << vpShift;
                }
            }
            this.queue.writeBuffer(this.thumbnailViewportBuffer, 0, thumbnailViewportJsBuffer);
        }
        this.queue.writeBuffer(this.emitIndexSliceBuffer, 0, slices);
        this.retinaFacingOrSlicesChanged = true;
    }
    setRetinaProjectMatrix(camera: PerspectiveCamera | OrthographicCamera) {
        if ((camera as PerspectiveCamera).fov) {
            getPerspectiveProjectionMatrix(camera as PerspectiveCamera).mat4.writeBuffer(this.retinaProjectJsBuffer);
        } else {
            getOrthographicProjectionMatrix(camera as OrthographicCamera).mat4.writeBuffer(this.retinaProjectJsBuffer);
        }
        this.queue.writeBuffer(this.uniformsBuffer, retinaProjectBufferOffset, this.retinaProjectJsBuffer);
    }
    setRetinaViewMatrix(m: Mat4) {
        let e = m.elem;
        let facing = this.getFacing(e[8], e[9], e[10]);
        if (facing !== this.currentRetinaFacing) {
            this.retinaFacingOrSlicesChanged = true;
            this.currentRetinaFacing = facing;
        }
        m.writeBuffer(this.retinaMVMatJsBuffer);
        this.retinaMVMatChanged = true;
    }
    getRetinaCamera(): PerspectiveCamera | OrthographicCamera {
        let c = this.retinaProjectJsBuffer;
        let near = c[3] / c[2];
        if (c[0] > 0) {
            return {
                fov: Math.atan(1 / c[1]) * _RAD2DEG * 2,
                aspect: c[1] / c[0],
                near,
                far: c[2] * near / (1 + c[2])
            };
        } else {
            return {
                size: 1 / c[1],
                aspect: - c[1] / c[0],
                near,
                far: near - 1.0 / c[2]
            };
        }
    }
    setCameraProjectMatrix(camera: PerspectiveCamera | OrthographicCamera) {
        if ((camera as PerspectiveCamera).fov) {
            getPerspectiveProjectionMatrix(camera as PerspectiveCamera).vec4.writeBuffer(this.camProjJsBuffer);
        } else {
            getOrthographicProjectionMatrix(camera as OrthographicCamera).vec4.writeBuffer(this.camProjJsBuffer);
            this.camProjJsBuffer[0] = -this.camProjJsBuffer[0]; // use negative to mark Orthographic in shader
        }
        this.queue.writeBuffer(this.uniformsBuffer, camProjBufferOffset, this.camProjJsBuffer);
    }
    getFacing(x: number, y: number, z: number) {
        let xa = Math.abs(x);
        let ya = Math.abs(y);
        let za = Math.abs(z);
        switch (za > ya ? za > xa ? 2 : 0 : ya > xa ? 1 : 0) {
            case 0:
                return x > 0 ? RetinaSliceFacing.POSX : RetinaSliceFacing.NEGX;
            case 1:
                return y > 0 ? RetinaSliceFacing.POSY : RetinaSliceFacing.NEGY;
            default:
                return z > 0 ? RetinaSliceFacing.POSZ : RetinaSliceFacing.NEGZ;
        }
    }
}
class CrossRenderPass {
    descClear: GPURenderPassDescriptor;
    descLoad: GPURenderPassDescriptor;
    clearRenderPipelinePromise: Promise<GPURenderPipeline>;
    clearRenderPipeline: GPURenderPipeline;
    sliceTextureSize: { width: number, height: number };
    sliceView: GPUTextureView;
    constructor(gpu: GPU) {
        // sliceTexture covered by sliceGroupSize x 2 atlas of sliceResolution x sliceResolution
        let maxTextureSize = gpu.device.limits.maxTextureDimension2D;
        let sliceTextureSize = { width: maxTextureSize >> 1, height: maxTextureSize };
        this.sliceTextureSize = sliceTextureSize;
        let sliceTexture = gpu.device.createTexture({
            size: sliceTextureSize, format: gpu.preferredFormat,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
        });
        this.sliceView = sliceTexture.createView();

        let depthTexture = gpu.device.createTexture({
            size: sliceTextureSize, format: 'depth24plus',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });
        let depthView = depthTexture.createView();
        this.descClear = {
            colorAttachments: [{
                view: this.sliceView,
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

        this.descLoad = {
            colorAttachments: [{
                view: this.sliceView,
                loadOp: 'load' as GPULoadOp,
                storeOp: 'store' as GPUStoreOp
            }],
            depthStencilAttachment: {
                view: depthView,
                depthLoadOp: 'load' as GPULoadOp,
                depthStoreOp: 'store' as GPUStoreOp,
            }
        };
        let clearModule = gpu.device.createShaderModule({
            code:
                "@vertex fn v()->@builtin(position) vec4<f32>{ return vec4<f32>();} @fragment fn f()->@location(0) vec4<f32>{ return vec4<f32>();}"
        });
        this.clearRenderPipelinePromise = gpu.device.createRenderPipelineAsync({
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
                depthCompare: 'less',
                depthWriteEnabled: true
            }
        });
    }
    async init() {
        this.clearRenderPipeline = await this.clearRenderPipelinePromise;
    }
}
const outputAttributeUsage = typeof GPUBufferUsage === 'undefined' ? null : GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX;

export class TetraSliceBufferMgr {
    maxCrossSectionBufferSize: number;
    gpu: GPU;
    outputVaryBufferPool: Array<GPUBuffer> = []; // all the vary buffers for pipelines
    private indicesInOutputBufferPool: Set<number>;
    buffers: { buffer: GPUBuffer }[];
    // outputVaryBuffer: GPUBuffer[];
    constructor(gpu: GPU, config: InternalSliceRendererConfig, sliceBuffers: RetinaSliceBufferMgr) {
        this.buffers = [
            { buffer: sliceBuffers.emitIndexSliceBuffer },
            { buffer: sliceBuffers.uniformsBuffer },
            { buffer: sliceBuffers.thumbnailViewportBuffer },
        ];
        this.gpu = gpu;
        this.maxCrossSectionBufferSize = config.maxCrossSectionBufferSize;
    }
    init() {
        // lazy init buffer in creeating first tetraslice pipeline, optimization for only raytracing rendering
        this.outputVaryBufferPool.push(this.gpu.createBuffer(outputAttributeUsage, this.maxCrossSectionBufferSize, "Output buffer for builtin(position)"));
    }
    prepareNewPipeline() {
        this.indicesInOutputBufferPool = new Set;
        this.indicesInOutputBufferPool.add(0); // default builtin(position) buffer
        return [this.outputVaryBufferPool[0]];
    }
    destroy() {
        for (const buffer of this.outputVaryBufferPool) {
            buffer.destroy();
        }
    }
    ////// caution: data race here
    requireOutputBuffer(id: number, size: number, outBuffers: GPUBuffer[]): GPUBuffer {
        if (id === 0) return this.outputVaryBufferPool[0];
        let expectedSize = this.maxCrossSectionBufferSize * size;
        for (let i = 0; i < this.outputVaryBufferPool.length; i++) {
            if (this.indicesInOutputBufferPool.has(i)) continue; // we can't bind the same buffer again
            let buffer = this.outputVaryBufferPool[i];
            if (buffer.size === expectedSize) {
                // found unused exactly sized buffer
                this.indicesInOutputBufferPool.add(i);
                outBuffers.push(buffer);
                return buffer;
            }
        }
        // no buffer found, we need to create
        let buffer = this.gpu.createBuffer(outputAttributeUsage, expectedSize, "Output buffer for " + size + " vec4(s)");
        this.indicesInOutputBufferPool.add(this.outputVaryBufferPool.length);
        this.outputVaryBufferPool.push(buffer);
        outBuffers.push(buffer);
        return buffer;
    }
}
class RetinaRenderPass implements IRetinaRenderPass {
    pipeline: GPURenderPipeline;
    pipelinePromise: Promise<GPURenderPipeline>;
    bindgroup: GPUBindGroup;
    alphaBindgroup: GPUBindGroup;
    crossRenderPass: CrossRenderPass;
    readonly __brand: "RetinaRenderPass";
    private gpu: GPU;
    private config: InternalSliceRendererConfig;
    private sliceBuffers: RetinaSliceBufferMgr;
    descriptor: RetinaRenderPassDescriptor

    constructor(gpu: GPU, config: InternalSliceRendererConfig, sliceBuffers: RetinaSliceBufferMgr, crossRenderPass: CrossRenderPass, descriptor?: RetinaRenderPassDescriptor) {
        this.gpu = gpu;
        this.config = config;
        this.descriptor = descriptor ?? {};
        this.sliceBuffers = sliceBuffers;
        this.crossRenderPass = crossRenderPass;
        let retinaRenderCode = refacingMatsCode + StructDefSliceInfo + StructDefUniformBuffer + `
struct tsxvOutputType{
    @builtin(position) position : vec4<f32>,
    @location(0) relativeFragPosition : vec3<f32>,
    @location(1) crossHair : f32,
    @location(2) rayForCalOpacity : vec4<f32>,
    @location(3) retinaCoord : vec3<f32>,
    @location(4) normalForCalOpacity : vec4<f32>,
}
struct tsxfInputType{
    @location(0) relativeFragPosition : vec3<f32>,
    @location(1) crossHair : f32,
    @location(2) rayForCalOpacity : vec4<f32>,
    @location(3) retinaCoord : vec3<f32>,
    @location(4) normalForCalOpacity : vec4<f32>,
}
@group(0) @binding(0) var<storage,read> slice : array<tsxSliceInfo,${this.config.maxSlicesNumber}>;
@group(0) @binding(1) var<uniform> tsx_uniforms : tsxUniformBuffer;
@group(0) @binding(2) var<uniform> thumbnailViewport : array<vec4<f32>,16>;

@vertex fn mainVertex(@builtin(vertex_index) vindex : u32, @builtin(instance_index) iindex : u32) -> tsxvOutputType {
    const pos = array<vec2<f32>, 4>(
        vec2<f32>(-1.0, -1.0),
        vec2<f32>(-1.0, 1.0),
        vec2<f32>( 1.0, -1.0),
        vec2<f32>( 1.0, 1.0),
    );
    var sindex = iindex;
    var pos2d = pos[vindex];
    let stereoLR = f32(iindex & 1) - 0.5;
    if (slice[tsx_uniforms.sliceOffset].flag == 0 && tsx_uniforms.eyeCross.y != 0.0){
        sindex = iindex >> 1;
    }
    let s = slice[sindex + tsx_uniforms.sliceOffset];
    // let coord = vec2<f32>(pos2d.x, -pos2d.y) * 0.5 + 0.5;
    let ray = vec4<f32>(pos2d, s.slicePos, 1.0);
    var retinaCoord: vec4<f32>;
    var glPosition: vec4<f32>;
    var camRay: vec4<f32>;
    var normal: vec4<f32>;
    let x = f32(((s.viewport >> 24) & 0xFF) << ${this.config.viewportCompressShift}) * ${1 / this.config.sliceTextureWidth};
    let y = f32(((s.viewport >> 16) & 0xFF) << ${this.config.viewportCompressShift}) * ${1 / this.config.sliceTextureHeight};
    let w = f32(((s.viewport >> 8 ) & 0xFF) << ${this.config.viewportCompressShift}) * ${1 / this.config.sliceTextureWidth};
    let h = f32((s.viewport & 0xFF) << ${this.config.viewportCompressShift}) * ${1 / this.config.sliceTextureHeight};
    var crossHair : f32;
    if (slice[tsx_uniforms.sliceOffset].flag == 0){
        crossHair = 0.0;
        let stereoLR_offset = -stereoLR * tsx_uniforms.eyeCross.y;
        let se = sin(stereoLR_offset);
        let ce = cos(stereoLR_offset);
        var pureRotationMvMat = tsx_uniforms.retinaMV;
        pureRotationMvMat[3].z = 0.0;
        let eyeMat = mat4x4<f32>(
            ce,0,se,0,
            0,1,0,0,
            -se,0,ce,0,
            0,0,tsx_uniforms.retinaMV[3].z,1
        );
        let omat = eyeMat * pureRotationMvMat * tsx_refacingMats[tsx_uniforms.refacing & 7];
        camRay = omat * ray;
        retinaCoord = tsx_refacingMats[tsx_uniforms.refacing & 7] * ray;
        glPosition = tsx_uniforms.retinaP * camRay;
        if(tsx_uniforms.retinaP[3].w > 0){ // Orthographic
            camRay = vec4<f32>(0.0,0.0,-1.0,1.0);
        }
        normal = omat[2];
        // todo: viewport of retina slices
        glPosition.x = (glPosition.x) * tsx_uniforms.screenAspect + step(0.0001, abs(tsx_uniforms.eyeCross.y)) * stereoLR * glPosition.w;
    }else{
        let vp = thumbnailViewport[sindex + tsx_uniforms.sliceOffset - (tsx_uniforms.refacing >> 5)];
        crossHair = tsx_uniforms.eyeCross.z / vp.w * step(abs(s.slicePos),0.1);
        glPosition = vec4<f32>(ray.x * vp.z * tsx_uniforms.screenAspect + vp.x, ray.y * vp.w + vp.y,0.5,1.0);
        camRay = vec4<f32>(pos[vindex].x * vp.z / vp.w,pos[vindex].y,0.0,1.0); // for rendering crosshair
    }
    
    let texelCoord = array<vec2<f32>, 4>(
        vec2<f32>(x, y+h),
        vec2<f32>(x, y),
        vec2<f32>( x+w, y+h),
        vec2<f32>( x+w, y),
    );
    return tsxvOutputType(
        glPosition,
        vec3<f32>(texelCoord[vindex], s.slicePos),
        crossHair,
        camRay,
        retinaCoord.xyz,
        normal
    );
}

@group(0) @binding(3) var tsx_txt: texture_2d<f32>;
@group(0) @binding(4) var tsx_splr: sampler;
${descriptor?.alphaShader?.code ?? `
fn mainAlpha(color: vec4<f32>, retinaCoord: vec3<f32>) -> f32{
    return color.a;
}
`}
@fragment fn mainFragment(input : tsxfInputType) -> @location(0) vec4<f32> {
    let color = textureSample(tsx_txt, tsx_splr, input.relativeFragPosition.xy);
    var alpha: f32 = 1.0;
    var factor = 0.0;
    if (slice[tsx_uniforms.sliceOffset].flag == 0){
        let dotvalue = dot(normalize(input.rayForCalOpacity.xyz), input.normalForCalOpacity.xyz);
        let factor = tsx_uniforms.layerOpacity / (clamp(-dotvalue,0.0,1.0));
        alpha = clamp(${descriptor?.alphaShader?.entryPoint ?? "mainAlpha"}(color, input.retinaCoord) * factor,0.0,1.0);
    }else if (input.crossHair > 0.0) {
    let cross = abs(input.rayForCalOpacity.xy);
    factor = step(cross.x, input.crossHair * 0.05) + step(cross.y, input.crossHair * 0.05);
    factor *= step(cross.x, input.crossHair) * step(cross.y, input.crossHair);
}
return vec4<f32>(mix(color.rgb, vec3<f32>(1.0) - color.rgb, clamp(factor, 0.0, 1.0)), alpha);
}
`;
        const retinaRenderShaderModule = gpu.device.createShaderModule({
            code: retinaRenderCode
        });
        this.pipelinePromise = gpu.device.createRenderPipelineAsync({
            layout: 'auto',
            vertex: {
                module: retinaRenderShaderModule,
                entryPoint: 'mainVertex',
            },
            fragment: {
                module: retinaRenderShaderModule,
                entryPoint: 'mainFragment',
                targets: [{
                    format: this.config.enableFloat16Blend ? 'rgba16float' : this.gpu.preferredFormat,
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
            depthStencil: {
                depthWriteEnabled: true,
                depthCompare: 'less',
                format: 'depth24plus',
            },
            primitive: { topology: 'triangle-strip' }
        });
    }
    async init() {
        this.pipeline = await this.pipelinePromise;
        this.bindgroup = this.gpu.createBindGroup(this.pipeline, 0, [
            { buffer: this.sliceBuffers.emitIndexSliceBuffer },
            { buffer: this.sliceBuffers.uniformsBuffer },
            { buffer: this.sliceBuffers.thumbnailViewportBuffer },
            this.crossRenderPass.sliceView,
            linearTextureSampler,
        ], "retinaBindGroup");
        if (this.descriptor.alphaShaderBindingResources) {
            this.alphaBindgroup = this.gpu.createBindGroup(
                this.pipeline, 1, this.descriptor.alphaShaderBindingResources, "retinaAlphaBindGroup"
            );
        }
        return this;
    }
}
/** 
 * ---------------------------------
 * screen render pass
 * for float16 blending and convert color to srgb
 * ---------------------------------
 *  */
const screenRenderCode = StructDefUniformBuffer + `
@group(0) @binding(0) var tsx_txt: texture_2d<f32>;
@group(0) @binding(1) var tsx_splr: sampler;
@group(0) @binding(2) var<uniform>tsx_uniforms : tsxUniformBuffer;
struct tsxvOutputType{
    @builtin(position) position: vec4<f32>,
    @location(0) fragPosition: vec2<f32>,
}
struct tsxfInputType{
    @location(0) fragPosition: vec2<f32>,
}
@vertex fn mainVertex(@builtin(vertex_index) index : u32) -> tsxvOutputType {
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
    return tsxvOutputType(vec4<f32>(pos[index], 0.0, 1.0), uv[index]);
}
@fragment fn mainFragment(input: tsxfInputType) -> @location(0) vec4 < f32 > {
let color = textureSample(tsx_txt, tsx_splr, input.fragPosition);
var factor = 0.0;
if(tsx_uniforms.eyeCross.z > 0.0 && tsx_uniforms.layerOpacity > 0.0){
    let aspectedCross = tsx_uniforms.eyeCross.z * tsx_uniforms.screenAspect;
    if (tsx_uniforms.eyeCross.x != 0.0) {
        let cross1 = abs(input.fragPosition - vec2<f32>(0.25, 0.5)) * 2.0;
        let cross2 = abs(input.fragPosition - vec2<f32>(0.75, 0.5)) * 2.0;
        factor = step(cross1.x, 0.05 * aspectedCross) + step(cross2.x, 0.05 * aspectedCross) + step(cross1.y, tsx_uniforms.eyeCross.z * 0.05);
        factor *= step(cross1.y, tsx_uniforms.eyeCross.z) * (step(cross1.x, aspectedCross) + step(cross2.x, aspectedCross));
    } else {
        let cross = abs(input.fragPosition - vec2<f32>(0.5, 0.5)) * 2.0;
        factor = step(cross.x, 0.05 * aspectedCross) + step(cross.y, tsx_uniforms.eyeCross.z * 0.05);
        factor *= step(cross.y, tsx_uniforms.eyeCross.z) * step(cross.x, aspectedCross);
    }
}
return vec4<f32>(mix(color.rgb, vec3<f32>(1.0) - color.rgb, clamp(factor, 0.0, 1.0)), 1.0);
}
`;
class ScreenRenderPass {
    view: GPUTextureView;
    depthView: GPUTextureView;
    pipeline: GPURenderPipeline;
    pipelinePromise: Promise<GPURenderPipeline>;
    bindgroup: GPUBindGroup;
    texture: GPUTexture;
    depthTexture: GPUTexture;
    private gpu: GPU;
    private config: InternalSliceRendererConfig;
    private sliceBuffers: RetinaSliceBufferMgr;
    constructor(gpu: GPU, config: InternalSliceRendererConfig, sliceBuffers: RetinaSliceBufferMgr) {
        this.gpu = gpu;
        this.config = config;
        this.sliceBuffers = sliceBuffers;
        let screenRenderShaderModule = gpu.device.createShaderModule({
            code: screenRenderCode
        });
        this.pipelinePromise = gpu.device.createRenderPipelineAsync({
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
    }
    setSize(size: GPUExtent3DStrict) {
        if (this.texture) this.texture.destroy();
        if (this.depthTexture) this.depthTexture.destroy();

        // if (!this.pipeline) throw "TetraSliceRenderer: ScreenRenderPipeline is not initialized.";
        this.texture = this.gpu.device.createTexture({
            size, format: this.config.enableFloat16Blend ? 'rgba16float' : this.gpu.preferredFormat,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
        });
        this.depthTexture = this.gpu.device.createTexture({
            size, format: 'depth24plus',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });
        this.view = this.texture.createView();
        this.depthView = this.depthTexture.createView();

        if (this.pipeline) {
            this.bindgroup = this.gpu.createBindGroup(this.pipeline, 0, [
                this.view,
                linearTextureSampler,
                { buffer: this.sliceBuffers.uniformsBuffer },
            ], "screenBindGroup");
        }
        let aspect: number;
        if ((size as GPUExtent3DDict).height) {
            aspect = (size as GPUExtent3DDict).height / (size as GPUExtent3DDict).width;
        } else {
            aspect = size[1] / size[0];
        }
        this.gpu.device.queue.writeBuffer(this.sliceBuffers.uniformsBuffer, screenAspectBufferOffset, new Float32Array([aspect]));
    }
    async init() {
        this.pipeline = await this.pipelinePromise;
        this.bindgroup = this.gpu.createBindGroup(this.pipeline, 0, [
            this.view,
            linearTextureSampler,
            { buffer: this.sliceBuffers.uniformsBuffer },
        ], "screenBindGroup");
    }
}
const _vec4 = new Vec4;
const _vec42 = new Vec4;

export class WireFrameRenderPass {
    private pipeline: GPURenderPipeline;
    private pipelinePromise: Promise<GPURenderPipeline>;
    dataBuffer: GPUBuffer;
    private bindGroup: GPUBindGroup;
    gpu: GPU;
    private config: InternalSliceRendererConfig;
    renderState: RenderState;
    renderPassDesc: GPURenderPassDescriptor;
    constructor(gpu: GPU, config: InternalSliceRendererConfig) {
        this.gpu = gpu;
        this.config = config;
        const shaderModule = gpu.device.createShaderModule({
            code: StructDefUniformBuffer + `
@group(0) @binding(0) var<uniform> tsx_uniforms : tsxUniformBuffer;
@vertex fn tsxVMain(@location(0) inPos: vec4<f32>, @builtin(instance_index) idx: u32) -> @builtin(position) vec4<f32>{
    let stereoLR = f32(idx & 1) - 0.5;
    let stereoLR_offset = -stereoLR * tsx_uniforms.eyeCross.y;
    let se = sin(stereoLR_offset);
    let ce = cos(stereoLR_offset);
    var pureRotationMvMat = tsx_uniforms.retinaMV;
    pureRotationMvMat[3].z = 0.0;
    let eyeMat = mat4x4<f32>(
        ce,0,se,0,
        0,1,0,0,
        -se,0,ce,0,
        0,0,tsx_uniforms.retinaMV[3].z,1
    );
    var glPosition = tsx_uniforms.retinaP * eyeMat * pureRotationMvMat * vec4(inPos.xyz, 1.0);
    glPosition.x = (glPosition.x) * tsx_uniforms.screenAspect + step(0.0001, abs(tsx_uniforms.eyeCross.y)) * stereoLR * glPosition.w;
    return glPosition;
}
@fragment fn tsxFMain()->@location(0) vec4<f32>{
    return vec4<f32>(1.0,0.0,0.0,1.0);
}`,
        });
        this.pipelinePromise = gpu.device.createRenderPipelineAsync({
            layout: 'auto',
            vertex: {
                module: shaderModule,
                entryPoint: "tsxVMain",
                buffers: [
                    {
                        attributes: [
                            {
                                shaderLocation: 0,
                                offset: 0,
                                format: "float32x4",
                            }
                        ],
                        arrayStride: 4 * 4,
                    }
                ]
            },
            primitive: {
                topology: "line-list"
            },
            fragment: {
                targets: [
                    { format: this.config.enableFloat16Blend ? 'rgba16float' : this.gpu.preferredFormat },
                ],
                module: shaderModule,
                entryPoint: "tsxFMain"
            },
            depthStencil: {
                depthWriteEnabled: true,
                depthCompare: 'less',
                format: 'depth24plus',
            }
        });

    }
    async init() {
        this.pipeline = await this.pipelinePromise;
    }
    render(buffer: GPUBuffer, vertices: number) {
        if (!this.pipeline) return;
        this.bindGroup ??= this.gpu.createBindGroup(this.pipeline, 0, [{
            buffer: this.renderState.sliceBuffers.uniformsBuffer
        }]);
        const renderPassEncoder = this.renderState.commandEncoder.beginRenderPass(this.renderPassDesc);
        renderPassEncoder.setPipeline(this.pipeline);
        renderPassEncoder.setVertexBuffer(0, buffer);
        renderPassEncoder.setBindGroup(0, this.bindGroup);
        // todo: deal with no retina voxel / non stero mode
        renderPassEncoder.draw(vertices, 2);
        renderPassEncoder.end();
    }
}

class RenderState {
    commandEncoder: GPUCommandEncoder;
    computePassEncoder: GPUComputePassEncoder;
    pipeline: TetraSlicePipeline;
    tetraSliceBufferMgr: TetraSliceBufferMgr;
    config: InternalSliceRendererConfig;
    // slicePassEncoder: GPURenderPassEncoder;
    sliceIndex: number;
    needClear: boolean;
    tetraBuffers: TetraSliceBufferMgr;
    sliceBuffers: RetinaSliceBufferMgr;
    crossRenderPass: CrossRenderPass;
    frustumRange: Vec4[];
    constructor(gpu: GPU, config: InternalSliceRendererConfig, sliceBuffers: RetinaSliceBufferMgr, tetraBuffers: TetraSliceBufferMgr, crossRenderPass: CrossRenderPass) {
        this.commandEncoder = gpu.device.createCommandEncoder();
        this.tetraBuffers = tetraBuffers;
        this.sliceBuffers = sliceBuffers;
        this.crossRenderPass = crossRenderPass;
        this.config = config;
    }
    /** Set TetraSlicePipeline and prepare GPU resources.
     *  Next calls should be function sliceTetras or setBindGroup.
     */
    beginTetras(pipeline: TetraSlicePipeline) {
        // let { commandEncoder, sliceIndex, needClear } = this.renderState;
        // clear triagle slice vertex output pointer to zero (emitIndex part)
        this.commandEncoder.clearBuffer(this.sliceBuffers.emitIndexSliceBuffer, this.config.maxSlicesNumber << 4, 4 << this.config.sliceGroupSizeBit);
        // clear triagle slice vertex output data to zero
        this.commandEncoder.clearBuffer(pipeline.outputVaryBuffer[0]);
        this.computePassEncoder = this.commandEncoder.beginComputePass();
        this.computePassEncoder.setPipeline(pipeline.computePipeline);
        this.computePassEncoder.setBindGroup(0, pipeline.computeBindGroup0);
        this.pipeline = pipeline;
    }
    // todo 写清楚 setBindGroup、drawTetras(bindGroups的区别
    setBindGroup(index: number, bindGroup: GPUBindGroup) {
        this.computePassEncoder.setBindGroup(index, bindGroup);
    }
    /** Compute slice of given bindgroup attribute data.
     *  beginTetras should be called at first to specify a tetraSlicePipeline
     *  Next calls should be function sliceTetras, setBindGroup or drawTetras.
     */
    sliceTetras(vertexBindGroup: GPUBindGroup, tetraCount: number, instanceCount?: number) {
        if (vertexBindGroup) this.computePassEncoder.setBindGroup(1, vertexBindGroup);
        this.computePassEncoder.dispatchWorkgroups(Math.ceil(tetraCount / 256), instanceCount); // todo: change workgroups
    }
    /** This function draw slices on a internal framebuffer
     *  Every beginTetras call should be end with drawTetras call
     */
    drawTetras(bindGroups?: { group: number, binding: GPUBindGroup }[]) {
        this.computePassEncoder.end();

        let slicePassEncoder = this.commandEncoder.beginRenderPass(
            this.needClear ? this.crossRenderPass.descClear : this.crossRenderPass.descLoad
        );
        slicePassEncoder.setPipeline(this.pipeline.renderPipeline);
        for (let i = 0; i < this.pipeline.vertexOutNum; i++) {
            slicePassEncoder.setVertexBuffer(i, this.pipeline.outputVaryBuffer[i]);
        }
        if (bindGroups) {
            for (let { group, binding } of bindGroups) {
                slicePassEncoder.setBindGroup(group, binding);
            }
        }
        // bitshift: outputBufferSize / 16 for vertices number, / sliceGroupSize for one stride
        let bitshift = 4 + this.config.sliceGroupSizeBit;
        let verticesStride = this.config.maxCrossSectionBufferSize >> bitshift;
        let offsetVert = 0;
        let sliceJsOffset = (this.sliceIndex << (2 + this.config.sliceGroupSizeBit)) + 3;
        let vpShift = this.config.viewportCompressShift;
        for (let c = 0; c < this.config.sliceGroupSize; c++, offsetVert += verticesStride) {
            let vp = f32_to_u32(this.sliceBuffers.slicesJsBuffer[sliceJsOffset + (c << 2)]);
            slicePassEncoder.setViewport(
                ((vp >> 24) & 0xFF) << vpShift,
                ((vp >> 16) & 0xFF) << vpShift,
                ((vp >> 8) & 0xFF) << vpShift,
                (vp & 0xFF) << vpShift,
                0, 1
            );
            slicePassEncoder.draw(verticesStride, 1, offsetVert);
        }
        slicePassEncoder.end();
        this.needClear = false;
    }
    drawRaytracing(pipeline: RaytracingPipeline, bindGroups?: GPUBindGroup[]) {
        let slicePassEncoder = this.commandEncoder.beginRenderPass(
            this.needClear ? this.crossRenderPass.descClear : this.crossRenderPass.descLoad
        );
        slicePassEncoder.setPipeline(pipeline.pipeline);
        slicePassEncoder.setBindGroup(0, pipeline.bindGroup0);
        if (bindGroups && bindGroups[0]) slicePassEncoder.setBindGroup(1, bindGroups[0]);
        slicePassEncoder.draw(4, this.config.sliceGroupSize);
        slicePassEncoder.end();
        this.needClear = false;
    }

    testWithFrustumData(obb: AABB, camMat: AffineMat4 | Obj4, modelMat?: AffineMat4 | Obj4): boolean {
        this.frustumRange ??= this.getFrustumRange(camMat);
        if (!this.frustumRange) return true;
        let relP = _vec4.copy((camMat as AffineMat4).vec ?? (camMat as Obj4).position);
        if (modelMat) relP.subs(((modelMat as AffineMat4).vec ?? (modelMat as Obj4).position));
        if (!modelMat) {
            for (let f of this.frustumRange) {
                if (obb.testPlane(new Plane(f, f.dot(relP))) === 1) return false;
            }
        } else if ((modelMat as AffineMat4).mat) {
            for (let f of this.frustumRange) { // todo: .t() to optimise
                if (obb.testPlane(new Plane(_vec42.mulmatvset((modelMat as AffineMat4).mat.t(), f), f.dot(relP))) === 1) return false;
            }
        } else {
            for (let f of this.frustumRange) {
                if (obb.testPlane(new Plane(_vec42.copy(f).rotatesconj((modelMat as Obj4).rotation), f.dot(relP))) === 1) return false;
            }
        }
        return true;
    }
    getFrustumRange(camMat: AffineMat4 | Obj4, allRange?: boolean) {
        let minslice = this.sliceIndex << this.config.sliceGroupSizeBit;
        let maxslice = minslice + this.config.sliceGroupSize - 1;
        let isRetinaGroup = this.sliceBuffers.slicesJsBuffer[(minslice << 2) + 1];
        let frustum: number[];
        let camProj = 1 / this.sliceBuffers.camProjJsBuffer[1];
        if (allRange) {
            frustum = [-camProj, camProj, -camProj, camProj, -camProj, camProj];
        } else if (isRetinaGroup === 0) {
            minslice = this.sliceBuffers.slicesJsBuffer[minslice << 2] * camProj;
            maxslice = this.sliceBuffers.slicesJsBuffer[maxslice << 2] * camProj;
            switch (this.sliceBuffers.currentRetinaFacing) {
                case RetinaSliceFacing.POSZ:
                    frustum = [-camProj, camProj, -camProj, camProj, minslice, maxslice];
                    break;
                case RetinaSliceFacing.NEGZ:
                    frustum = [-camProj, camProj, -camProj, camProj, -maxslice, -minslice];
                    break;
                case RetinaSliceFacing.POSX:
                    frustum = [minslice, maxslice, -camProj, camProj, -camProj, camProj];
                    break;
                case RetinaSliceFacing.NEGX:
                    frustum = [-maxslice, -minslice, -camProj, camProj, -camProj, camProj];
                    break;
                case RetinaSliceFacing.POSY:
                    frustum = [-camProj, camProj, minslice, maxslice, -camProj, camProj];
                    break;
                case RetinaSliceFacing.NEGY:
                    frustum = [-camProj, camProj, -maxslice, -minslice, -camProj, camProj];
                    break;
            }
            // refacing = SliceFacing[this.currentRetinaFacing];
        } else {
            // isRetinaGroup = new Uint32Array(new Float32Array([isRetinaGroup]).buffer)[0];
            // todo
        }
        if ((camMat as AffineMat4).mat) {
            const m = (camMat as AffineMat4).mat;
            return frustum ? [
                new Vec4(-1, 0, 0, -frustum[0]).mulmatls(m),
                new Vec4(1, 0, 0, frustum[1]).mulmatls(m),
                new Vec4(0, -1, 0, -frustum[2]).mulmatls(m),
                new Vec4(0, 1, 0, frustum[3]).mulmatls(m),
                new Vec4(0, 0, -1, -frustum[4]).mulmatls(m),
                new Vec4(0, 0, 1, frustum[5]).mulmatls(m),
            ] : undefined;
        } else {
            const r = (camMat as Obj4).rotation;
            return frustum ? [
                new Vec4(-1, 0, 0, -frustum[0]).rotates(r),
                new Vec4(1, 0, 0, frustum[1]).rotates(r),
                new Vec4(0, -1, 0, -frustum[2]).rotates(r),
                new Vec4(0, 1, 0, frustum[3]).rotates(r),
                new Vec4(0, 0, -1, -frustum[4]).rotates(r),
                new Vec4(0, 0, 1, frustum[5]).rotates(r),
            ] : undefined;
        }
        // console.log({ isRetinaGroup, frustum,  refacing});
    }
}
const arrayBuffer = new ArrayBuffer(4);
function f32_to_u32(f32: number) {
    const b = new Float32Array(arrayBuffer);
    b[0] = f32;
    return new Uint32Array(b.buffer)[0];
}
function u32_to_f32(u32: number) {
    const b = new Uint32Array(arrayBuffer);
    b[0] = u32;
    return new Float32Array(b.buffer)[0];
}