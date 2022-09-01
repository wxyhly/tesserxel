namespace tesserxel {
    export namespace renderer {
        interface StorageTexure3DViewFormat{
            format: string;
        }
        interface StorageTexure3DView{
            buffer: GPUBuffer;
            width: number;
            height: number;
            depth: number;
            format: string;
        }
        interface VoxelPipelineDescriptor{
            inputs: StorageTexure3DViewFormat[];
            outputs: StorageTexure3DViewFormat[];
            code: string;
            entryPoint: string;
        }
        class VoxelRenderer{
            private gpu: GPU;
            constructor(gpu: GPU){
                this.gpu = gpu;
            }
            async createPipeline(p:VoxelPipelineDescriptor){
                let reflect = new wgslreflect.WgslReflect(p.code);
                let mainFn = reflect.functions.filter(
                    e => e.attributes && e.attributes.some(a => a.name === "voxel") && e.name == p.entryPoint
                )[0];
                if(!mainFn) console.error("Voxel pipeline: Entry point does not exist.");
                let {input, call, output} = wgslreflect.getFnInputAndOutput(reflect,mainFn,
                    {
                        "builtin(ray_direction)":"rd",
                        "builtin(ray_origin)":"ro",
                        "builtin(resolution)":"_size",
                        "builtin(voxel_position)":"voxelPosition",
                    },
                    ["location(0)", "location(1)", "location(2)", "location(3)", "location(4)", "location(5)"]
                )
                let raygenCode = "";
                if(input.has("builtin(ray_direction)") || input.has("builtin(ray_origin)")){
                    raygenCode = `
let dir = `;
                }
                let outputDeclCode = "";
                let outputAsgnCode = "";
                const group0outbindoffset = 3;
                for(let i =0;i<p.outputs.length;i++){
                    let varName = output["location("+i+")"];
                    if(varName){
                        outputDeclCode += `@group(0) @binding(${group0outbindoffset + i}) var<storage,read_write> _output${i} : array<${p.outputs[i]}>;`;
                        outputAsgnCode += `_output${i}[] = ${varName}`;
                    }
                }
                let voxelComputeCode = `

@group(0) @binding(0) var<uniform> _eye4dOffset : f32;
@group(0) @binding(1) var<uniform> _size: vec3<u32>;
@group(0) @binding(2) var<uniform> _camProj: vec4<f32>;
// fn voxelFetch(buffer: array<T>, coord: vec3<f32>)->T{

// }
@compute @workgroup_size(8,8,8) fn _mainCompute(@builtin(global_invocation_id) GlobalInvocationID : vec3<u32>){
    let voxelPosition = vec3<f32>(
        f32(GlobalInvocationID.x) / f32(_size.x),
        f32(GlobalInvocationID.y) / f32(_size.y),
        f32(GlobalInvocationID.z) / f32(_size.z),
    )*2.0 - vec3<f32>(1.0);
    ${call}
    _output[GlobalInvocationID.x + _size.x * (GlobalInvocationID.y + _size.y * GlobalInvocationID.z)] = result;
}`;
                await this.gpu.device.createComputePipelineAsync({
                    layout: 'auto',
                    compute: {
                        module: this.gpu.device.createShaderModule({
                            code: voxelComputeCode
                        }),
                        entryPoint: '_mainCompute'
                    }
                });
            }
        }
    }
}