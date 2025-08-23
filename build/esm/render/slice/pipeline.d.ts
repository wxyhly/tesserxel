import { GPU } from "../gpu.js";
import { InternalSliceRendererConfig, RetinaSliceBufferMgr, TetraSliceBufferMgr } from "./renderer.js";
import { RaytracingPipelineDescriptor, TetraSlicePipelineDescriptor } from "./interfaces.js";
export declare const refacingMatsCode = "\nconst tsx_refacingMats = array<mat4x4f,6>(\n// +z\nmat4x4f(\n1,0,0,0,\n0,1,0,0,\n0,0,1,0,\n0,0,0,1,\n),\n// -z\nmat4x4f(\n1,0,0,0,\n0,1,0,0,\n0,0,-1,0,\n0,0,0,1,\n),\n// +y\nmat4x4f(\n1,0,0,0,\n0,0,1,0,\n0,1,0,0,\n0,0,0,1,\n),\n// -y\nmat4x4f(\n1,0,0,0,\n0,0,-1,0,\n0,-1,0,0,\n0,0,0,1,\n),\n// +x\nmat4x4f(\n0,0,1,0,\n0,1,0,0,\n1,0,0,0,\n0,0,0,1,\n),\n// -x\nmat4x4f(\n0,0,-1,0,\n0,1,0,0,\n-1,0,0,0,\n0,0,0,1,\n),\n);\nconst determinantRefacingMats = array<f32,6>(1,-1,-1,-1,-1,-1);\n";
export declare const StructDefSliceInfo = "\nstruct tsxSliceInfo{\n    slicePos: f32, refacing: u32, flag: u32, viewport: u32,\n}";
export declare const StructDefUniformBuffer = "\nstruct tsxUniformBuffer{\n    retinaMV: mat4x4f, retinaP: mat4x4f, camProj: vec4f,\n    eyeCross: vec3<f32>, sliceOffset: u32, refacing: u32, screenAspect: f32, layerOpacity: f32,\n}";
export declare class TetraSlicePipeline {
    computePipeline: GPUComputePipeline;
    computeBindGroup0: GPUBindGroup;
    renderPipeline: GPURenderPipeline;
    outputVaryBuffer: GPUBuffer[];
    vertexOutNum: number;
    private reflect;
    private gpu;
    private device;
    private crossComputeShaderModule;
    private fragmentShaderModule;
    descriptor: TetraSlicePipelineDescriptor;
    getCompilationInfo(): {
        tetra: Promise<GPUCompilationInfo>;
        fragment: Promise<GPUCompilationInfo>;
    };
    init(gpu: GPU, config: InternalSliceRendererConfig, descriptor: TetraSlicePipelineDescriptor, tetrasliceBufferMgr: TetraSliceBufferMgr): Promise<this>;
    private getBindGroupLayout;
}
export declare class RaytracingPipeline {
    pipeline: GPURenderPipeline;
    bindGroup0: GPUBindGroup;
    shaderModule: GPUShaderModule;
    getCompilationInfo(): Promise<GPUCompilationInfo>;
    init(gpu: GPU, config: InternalSliceRendererConfig, descriptor: RaytracingPipelineDescriptor, sliceBuffers: RetinaSliceBufferMgr): Promise<this>;
}
