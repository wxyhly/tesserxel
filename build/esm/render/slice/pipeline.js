import { getFnInputAndOutput, parseAttr, parseTypeName } from '../wgsl.js';
import { WgslReflect as _t, ResourceType as i } from '../../node_modules/wgsl_reflect/wgsl_reflect.module.js';

const tetraSliceBindGroup0declareIndex = 3;
const refacingMatsCode = `
const tsx_refacingMats = array<mat4x4<f32>,6>(
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
const StructDefSliceInfo = `
struct tsxSliceInfo{
    slicePos: f32, refacing: u32, flag: u32, viewport: u32,
}`;
const StructDefUniformBuffer = `
struct tsxUniformBuffer{
    retinaMV: mat4x4<f32>, retinaP: mat4x4<f32>, camProj: vec4<f32>,
    eyeCross: vec3<f32>, sliceOffset: u32, refacing: u32, screenAspect: f32, layerOpacity: f32,
}`;
const expectTetraSlicePipelineInput = {
    "location(0)": "_attribute0[tetraIndex]",
    "location(1)": "_attribute1[tetraIndex]",
    "location(2)": "_attribute2[tetraIndex]",
    "location(3)": "_attribute3[tetraIndex]",
    "location(4)": "_attribute4[tetraIndex]",
    "location(5)": "_attribute5[tetraIndex]",
    "builtin(instance_index)": "instanceIndex",
    "builtin(tetra_index)": "tetraIndex",
};
const expectTetraSlicePipelineOutput = [
    "location(0)", "location(1)", "location(2)", "location(3)", "location(4)", "location(5)",
    "builtin(position)"
];
class TetraSlicePipeline {
    computePipeline;
    computeBindGroup0;
    renderPipeline;
    outputVaryBuffer;
    vertexOutNum;
    reflect;
    gpu;
    device;
    crossComputeShaderModule;
    fragmentShaderModule;
    descriptor;
    getCompilationInfo() {
        return { tetra: this.crossComputeShaderModule?.getCompilationInfo(), fragment: this.fragmentShaderModule?.getCompilationInfo() };
    }
    async init(gpu, config, descriptor, tetrasliceBufferMgr) {
        this.gpu = gpu;
        this.device = gpu.device;
        this.descriptor = descriptor;
        let vertexState = descriptor.vertex;
        this.reflect = new _t(vertexState.code);
        let mainFn = this.reflect._functions.get(vertexState.entryPoint);
        if (!mainFn || mainFn.node.attributes?.[0].name !== "tetra")
            console.error("Tetra vertex shader entry Point function not found");
        let { input, output, call } = getFnInputAndOutput(this.reflect, mainFn, expectTetraSlicePipelineInput, expectTetraSlicePipelineOutput);
        let layout = this.getBindGroupLayout(output);
        // compute pipeline
        let computeGroup0Buffers = tetrasliceBufferMgr.buffers.slice(0);
        let bindGroup0declare = '';
        let varInterpolate = "";
        let emitOutput1 = "";
        let emitOutput2 = "";
        // render pipeline
        let vinputVert = '';
        let voutputVert = '';
        let vcallVert = "";
        let vertexBufferAttributes = [];
        this.vertexOutNum = 0;
        this.outputVaryBuffer = tetrasliceBufferMgr.prepareNewPipeline();
        for (let attr in output) {
            let id;
            if (attr === "return")
                continue;
            let packedType = output[attr].type; // unpack matrix4x4
            let rawType = packedType.replace("mat4x4<f32>", "vec4<f32>");
            if (attr === "builtin(position)") {
                id = 0;
            }
            else if (attr.startsWith("location(")) {
                let i = attr.charAt(9);
                id = Number(i) + 1;
            }
            if (id >= 0) {
                this.vertexOutNum++;
                bindGroup0declare += `@group(0) @binding(${tetraSliceBindGroup0declareIndex + id}) var<storage, read_write> _output${id} : array<${rawType}>;\n`;
                varInterpolate += `var output${id}s : array<${rawType},4>;\n`;
                emitOutput1 += `
            _output${id}[outOffset] =   output${id}s[0];
            _output${id}[outOffset+1] = output${id}s[1];
            _output${id}[outOffset+2] = output${id}s[2];`;
                emitOutput2 += `
                _output${id}[outOffset+3] = output${id}s[2];
                _output${id}[outOffset+4] = output${id}s[1];
                _output${id}[outOffset+5] = output${id}s[3];`;
                let jeg = rawType.match(/array<(.+),(.+)>/);
                if (jeg) {
                    let typeArrLength = Number(jeg[2]);
                    let attributes = [];
                    for (let i = 0; i < typeArrLength; i++) {
                        attributes.push({
                            shaderLocation: id,
                            format: 'float32x4',
                            offset: i << 4
                        });
                    }
                    vertexBufferAttributes.push({
                        arrayStride: typeArrLength << 4,
                        attributes
                    });
                    computeGroup0Buffers.push({ buffer: tetrasliceBufferMgr.requireOutputBuffer(id, typeArrLength, this.outputVaryBuffer) });
                }
                else {
                    computeGroup0Buffers.push({ buffer: tetrasliceBufferMgr.requireOutputBuffer(id, 1, this.outputVaryBuffer) });
                    vertexBufferAttributes.push({
                        arrayStride: 16,
                        attributes: [{
                                shaderLocation: id,
                                format: 'float32x4',
                                offset: 0
                            }]
                    });
                }
            }
        }
        let bindGroup1declare = '';
        for (let attr of input) {
            if (!attr.startsWith("location("))
                continue;
            let i = attr.charAt(9);
            bindGroup1declare += `@group(1) @binding(${i}) var<storage, read> _attribute${i} : array<mat4x4<f32>>;\n`;
        }
        let parsedCode = vertexState.code.replace(/@tetra/g, " ").replace(/@location\s*\(\s*[0-9]+\s*\)\s*/g, " ").replace(/@builtin\s*\(\s*[^\)\s]+\s*\)\s*/g, " ");
        function makeInterpolate(a, b) {
            let str = '';
            for (let attr in output) {
                let result = output[attr].type?.match(/array<(.+),(.+)>/);
                let name = attr.startsWith("location(") ? output[attr].expr : attr == "builtin(position)" ? "refPosMat" : "";
                if (!name)
                    continue;
                let i = attr.startsWith("location(") ? Number(attr.charAt(9)) + 1 : 0;
                if (result) {
                    let typeArrLength = Number(result[2]);
                    for (let idx = 0; idx < typeArrLength; idx++)
                        str += `output${i}s[offset][${idx}] = mix(${name}[${idx}][${a}],${name}[${idx}][${b}],alpha);\n`;
                }
                else {
                    str += `output${i}s[offset] = mix(${name}[${a}],${name}[${b}],alpha);\n`;
                }
            }
            return str;
        }
        let cullOperator = descriptor.cullMode == "back" ? "<" : ">";
        let commonCameraSliceCode = `
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

    // offset is total vertices number (3 or 4), delta is faces number (3 or 6)
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
`;
        let crossComputeCode = refacingMatsCode + StructDefSliceInfo + StructDefUniformBuffer + `
struct _EmitIndex_Slice{
    slice: array<tsxSliceInfo, ${config.maxSlicesNumber}>,
    emitIndex: array<atomic<u32>>,
}

@group(0) @binding(0) var<storage, read_write> _emitIndex_slice: _EmitIndex_Slice;
@group(0) @binding(1) var<uniform> tsx_uniforms : tsxUniformBuffer;
@group(0) @binding(2) var<uniform> thumbnailViewport : array<vec4<f32>,16>;
${bindGroup0declare}
${bindGroup1declare}

// user defined functions and bind groups
${parsedCode}

const tsx_emitIndexStride : u32 = ${config.maxCrossSectionBufferSize >> (config.sliceGroupSizeBit + 4)};
@compute @workgroup_size(${vertexState.workgroupSize ?? config.defaultWorkGroupSize})
fn _mainCompute(@builtin(global_invocation_id) GlobalInvocationID : vec3<u32>){
    let tetraIndex = GlobalInvocationID.x;
    let instanceIndex = GlobalInvocationID.y;
    ${input.has("location(0)") ? `
    if(tetraIndex >= arrayLength(&_attribute0)){ // todo: check performance?
        return;
    }` : ``} 
    // calculate camera space coordinate : builtin(position) and other output need to be interpolated : location(x)
    // call user defined code 
    ${call}
    let cameraPosMat = ${output["builtin(position)"].expr};
    
    var instanceLength:u32 = ${config.sliceGroupSize};
    var refPosMat : mat4x4<f32>;
    var refCamMat : mat4x4<f32>;
    let sliceFlag = _emitIndex_slice.slice[tsx_uniforms.sliceOffset].flag;

    if(tsx_uniforms.camProj.x < 0){ // Orthographic
        let projBiais:mat4x4<f32> = mat4x4<f32>(
            0,0,tsx_uniforms.camProj.w,1,
            0,0,tsx_uniforms.camProj.w,1,
            0,0,tsx_uniforms.camProj.w,1,
            0,0,tsx_uniforms.camProj.w,1,
        );
        let projMat = mat4x4<f32>(
            -tsx_uniforms.camProj.x,0,0,0,
            0,tsx_uniforms.camProj.y,0,0,
            0,0,0,0,
            0,0,tsx_uniforms.camProj.z,0,
        );

        ${(descriptor.cullMode == "back" || descriptor.cullMode == "front") ? `
        // cull face: if all slices in this group has no eye4D offset, cull here
        var cameraPosDetMat = transpose(cameraPosMat); 
        cameraPosDetMat[3] = vec4<f32>(-1.0);
        if(determinant(cameraPosDetMat) ${cullOperator} 0){ return; }` : ""}

        // [uniform if] all slices are in retina, no eye4D
        if(sliceFlag == 0){
            // we get refacing mat from uniform for retina slices
            let retinaRefacingMat = tsx_refacingMats[tsx_uniforms.refacing & 7];
            // calculate standard device coordinate for retina: projection * refacing * view * model * pos
            refCamMat = retinaRefacingMat * cameraPosMat;
            refPosMat = projMat * refCamMat + projBiais;
        }else{
            instanceLength = _emitIndex_slice.slice[tsx_uniforms.sliceOffset].flag;
        }
        
        // prepare for interpolations
        var emitIndexOffset = 0u;
        for(var i:u32 = 0; i<instanceLength; i++){
            ${varInterpolate}
            let sliceInfo = _emitIndex_slice.slice[tsx_uniforms.sliceOffset + i];
            if(sliceInfo.slicePos > 1.0){
                emitIndexOffset += tsx_emitIndexStride;
                continue;
            }
            var offset = 0u;
            if(sliceFlag != 0){
                refCamMat = tsx_refacingMats[sliceInfo.refacing & 7] * cameraPosMat;
                refPosMat = projMat * refCamMat + projBiais;
                let vp = thumbnailViewport[tsx_uniforms.sliceOffset + i - (tsx_uniforms.refacing >> 5)];
                let aspect = vp.w / vp.z;
                refPosMat[0].x *= aspect;
                refPosMat[1].x *= aspect;
                refPosMat[2].x *= aspect;
                refPosMat[3].x *= aspect;
            }
            // calculate cross section pos * plane.normal
            let scalar = transpose(refCamMat)[2] + vec4<f32>(sliceInfo.slicePos / tsx_uniforms.camProj.x); 
            ${commonCameraSliceCode}
            emitIndexOffset += tsx_emitIndexStride;
        } // end all hits
    }else{
        let preclipW = cameraPosMat[0].w >= 0 && cameraPosMat[1].w >= 0 && cameraPosMat[2].w >= 0  && cameraPosMat[3].w >= 0;
        if(preclipW){ return; }
        let projBiais:mat4x4<f32> = mat4x4<f32>(
            0,0,tsx_uniforms.camProj.w,0,
            0,0,tsx_uniforms.camProj.w,0,
            0,0,tsx_uniforms.camProj.w,0,
            0,0,tsx_uniforms.camProj.w,0
        );
        let projMat = mat4x4<f32>(
            tsx_uniforms.camProj.x,0,0,0,
            0,tsx_uniforms.camProj.y,0,0,
            0,0,0,0,
            0,0,tsx_uniforms.camProj.z,-1,
        );
        let eyeMat = mat4x4<f32>(
            tsx_uniforms.eyeCross.x,0,0,0,
            tsx_uniforms.eyeCross.x,0,0,0,
            tsx_uniforms.eyeCross.x,0,0,0,
            tsx_uniforms.eyeCross.x,0,0,0
        );
        // [uniform if] all slices are in retina, no eye4D
        if(sliceFlag == 0){
            ${(descriptor.cullMode == "back" || descriptor.cullMode == "front") ? `
            // cull face: if all slices in this group has no eye4D offset, cull here
            if(determinant(cameraPosMat) ${cullOperator} 0){ return; }` : ""}
            
            // we get refacing mat from uniform for retina slices
            let retinaRefacingMat = tsx_refacingMats[tsx_uniforms.refacing & 7];
            // calculate standard device coordinate for retina: projection * refacing * view * model * pos
            refCamMat = retinaRefacingMat * cameraPosMat;
            refPosMat = projMat * refCamMat + projBiais;
        }else{
            instanceLength = _emitIndex_slice.slice[tsx_uniforms.sliceOffset].flag;
        }
        
        // prepare for interpolations
        var emitIndexOffset = 0u;
        for(var i:u32 = 0; i<instanceLength; i++){
            ${varInterpolate}
            let sliceInfo = _emitIndex_slice.slice[tsx_uniforms.sliceOffset + i];
            if(sliceInfo.slicePos > 1.0){
                emitIndexOffset += tsx_emitIndexStride;
                continue;
            }
            var offset = 0u;
            if(sliceFlag != 0){
                refCamMat = tsx_refacingMats[sliceInfo.refacing & 7] * cameraPosMat + 
                    eyeMat * (f32(sliceInfo.refacing >> 3) - 1.0);
                    ${(descriptor.cullMode == "back" || descriptor.cullMode == "front") ? `
                if(determinant(refCamMat) * determinantRefacingMats[sliceInfo.refacing & 7] ${cullOperator} 0){
                    emitIndexOffset += tsx_emitIndexStride;
                    continue;
                }` : ""}
                refPosMat = projMat * refCamMat + projBiais;
                let vp = thumbnailViewport[tsx_uniforms.sliceOffset + i - (tsx_uniforms.refacing >> 5)];
                let aspect = vp.w / vp.z;
                refPosMat[0].x *= aspect;
                refPosMat[1].x *= aspect;
                refPosMat[2].x *= aspect;
                refPosMat[3].x *= aspect;
            }
            // calculate cross section pos * plane.normal
            let scalar = transpose(refCamMat) * vec4(0.0,0.0,1.0,sliceInfo.slicePos / tsx_uniforms.camProj.x); 
            ${commonCameraSliceCode}
            emitIndexOffset += tsx_emitIndexStride;
        } // end all hits
    } // end camera type
}
`;
        this.crossComputeShaderModule = this.gpu.device.createShaderModule({
            code: crossComputeCode
        });
        let computePipelinePromise = this.gpu.device.createComputePipelineAsync({
            layout: layout.computeLayout,
            compute: {
                module: this.crossComputeShaderModule,
                entryPoint: '_mainCompute'
            }
        });
        vertexBufferAttributes.sort((a, b) => (a.attributes[0].shaderLocation - b.attributes[0].shaderLocation));
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
        const vertexShaderModule = this.gpu.device.createShaderModule({
            code: `
struct tsxvInputType{
    ${vinputVert}
};
struct tsxvOutputType{
    ${voutputVert}
};
@vertex fn main(data : tsxvInputType)-> tsxvOutputType{
    return tsxvOutputType(${vcallVert});
}
`
        });
        this.fragmentShaderModule = this.gpu.device.createShaderModule({ code: descriptor.fragment.code });
        let renderPipelinePromise = this.gpu.device.createRenderPipelineAsync({
            layout: layout.renderLayout,
            vertex: {
                module: vertexShaderModule,
                entryPoint: 'main',
                buffers: vertexBufferAttributes,
            },
            fragment: {
                module: this.fragmentShaderModule,
                entryPoint: descriptor.fragment.entryPoint,
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
        const [computePipeline, renderPipeline] = await Promise.all([computePipelinePromise, renderPipelinePromise]);
        this.computePipeline = computePipeline;
        this.renderPipeline = renderPipeline;
        this.computeBindGroup0 = this.gpu.createBindGroup(computePipeline, 0, computeGroup0Buffers, "TetraComputePipeline");
        return this;
    }
    getBindGroupLayout(output) {
        let computeBindGroupLayouts = [];
        let renderBindGroupLayouts = [];
        const layout = this.descriptor.layout;
        if (!layout || layout === 'auto')
            return {
                computeLayout: 'auto',
                renderLayout: 'auto'
            };
        let computeLayout = layout?.computeLayout;
        let renderLayout = layout?.renderLayout;
        if ((computeLayout !== 'auto' && computeLayout)?.length) {
            const bindGroupLayoutsDesc = computeLayout;
            let bindgroupLayouts = this.reflect.getBindGroups();
            for (let groupIdx = 0, l = bindgroupLayouts.length; groupIdx < l; groupIdx++) {
                let groupLayoutDesc = [];
                if (groupIdx === 0) {
                    // here Object.keys(output).length - 1 because it has "return" key
                    for (let i = 0, l = Object.keys(output).length - 1 + tetraSliceBindGroup0declareIndex; i < l; i++) {
                        const type = i && i < tetraSliceBindGroup0declareIndex ? 'uniform' : 'storage';
                        groupLayoutDesc.push({ binding: i, visibility: GPUShaderStage.COMPUTE, buffer: { type } });
                    }
                }
                else {
                    const bindings = bindgroupLayouts[groupIdx];
                    for (let i$1 = 0, l = bindings.length; i$1 < l; i$1++) {
                        const entry = bindGroupLayoutsDesc[groupIdx]?.entries?.filter(e => e.binding === i$1)[0];
                        const descriptor = bindings[i$1];
                        if (entry) {
                            groupLayoutDesc.push(entry);
                        }
                        else if (!descriptor) {
                            groupLayoutDesc.push({ binding: i$1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } });
                        }
                        else if (descriptor.resourceType === i.Storage) {
                            groupLayoutDesc.push({ binding: i$1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } });
                        }
                        else if (descriptor.resourceType === i.Uniform) {
                            groupLayoutDesc.push({ binding: i$1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } });
                        }
                    }
                }
                const bindGroupLayout = this.device.createBindGroupLayout({ entries: groupLayoutDesc });
                computeBindGroupLayouts.push(bindGroupLayout);
            }
            computeLayout = this.device.createPipelineLayout({ bindGroupLayouts: computeBindGroupLayouts, label: "computeBindGroupLayoutDesc" });
        }
        if ((renderLayout !== 'auto' && renderLayout)?.length) {
            const bindGroupLayoutsDesc = renderLayout;
            const renderReflect = new _t(this.descriptor.fragment.code);
            let bindgroupLayouts = renderReflect.getBindGroups();
            for (let groupIdx = 0, l = bindgroupLayouts.length; groupIdx < l; groupIdx++) {
                let groupLayoutDesc = [];
                const bindings = bindgroupLayouts[groupIdx];
                for (let i$1 = 0, l = bindings.length; i$1 < l; i$1++) {
                    const entry = bindGroupLayoutsDesc[groupIdx]?.entries?.filter(e => e.binding === i$1)[0];
                    if (entry) {
                        groupLayoutDesc.push(entry);
                    }
                    else if (!bindings[i$1] || bindings[i$1].resourceType === i.Storage) {
                        groupLayoutDesc.push({ binding: i$1, visibility: GPUShaderStage.FRAGMENT, buffer: {} });
                    }
                    else if (bindings[i$1].resourceType === i.Storage) {
                        groupLayoutDesc.push({ binding: i$1, visibility: GPUShaderStage.FRAGMENT, buffer: {} });
                    }
                    else if (bindings[i$1].resourceType === i.Sampler) {
                        groupLayoutDesc.push({ binding: i$1, visibility: GPUShaderStage.FRAGMENT, sampler: {} });
                    }
                    else if (bindings[i$1].resourceType === i.Texture) {
                        groupLayoutDesc.push({ binding: i$1, visibility: GPUShaderStage.FRAGMENT, texture: {} });
                    }
                }
                const bindGroupLayout = this.device.createBindGroupLayout({ entries: groupLayoutDesc });
                renderBindGroupLayouts.push(bindGroupLayout);
            }
            renderLayout = this.device.createPipelineLayout({ bindGroupLayouts: renderBindGroupLayouts, label: "renderBindGroupLayoutDesc" });
        }
        return {
            computeLayout, renderLayout
        };
    }
}
class RaytracingPipeline {
    pipeline;
    bindGroup0;
    shaderModule;
    getCompilationInfo() {
        return this.shaderModule?.getCompilationInfo();
    }
    async init(gpu, config, descriptor, sliceBuffers) {
        let code = descriptor.code.replace(/@ray(\s)/g, "@vertex$1");
        const reflect = new _t(code);
        let mainRayFn = reflect._functions.get(descriptor.rayEntryPoint);
        if (!mainRayFn)
            console.error("Raytracing pipeline: Entry point does not exist.");
        // let mainFragFn = reflect.functions.filter(
        //     e => e.attributes && e.attributes.some(a => a.name === "fragment") && e.name == descriptor.fragment.entryPoint
        // )[0];
        let { input, output, call } = getFnInputAndOutput(reflect, mainRayFn, {
            "builtin(ray_origin)": "camRayOri",
            "builtin(ray_direction)": "camRayDir",
            "builtin(voxel_coord)": "voxelCoord",
            "builtin(aspect_matrix)": "refacingMat3 * mat3x3<f32>(aspect,0.0,0.0, 0.0,1.0,0.0, 0.0,0.0,1.0) * refacingMat3",
        }, ["location(0)", "location(1)", "location(2)", "location(3)", "location(4)", "location(5)"]);
        let dealRefacingCall = "";
        if (input.has("builtin(aspect_matrix)")) {
            dealRefacingCall = "let refacingMat3 = mat3x3<f32>(refacingMat[0].xyz,refacingMat[1].xyz,refacingMat[2].xyz);";
        }
        let retunTypeMembers;
        let outputMembers;
        if (mainRayFn.node.returnType.attributes) {
            outputMembers = output["return"].expr;
            retunTypeMembers = `@${parseAttr(mainRayFn.node.returnType.attributes)} ${parseTypeName(mainRayFn.node.returnType)}`;
        }
        else {
            let st = reflect.structs.filter(s => s.name === mainRayFn.node.returnType.name)[0];
            if (!st)
                console.error("No attribute found");
            outputMembers = st.members.map(m => output[parseAttr(m.attributes)].expr).join(",\n");
            retunTypeMembers = st.members.map(m => `@${parseAttr(m.attributes)} ${m.name}: ${parseTypeName(m.type)}`).join(",\n");
        }
        // ${wgslreflect.parseAttr(mainRayFn.return.attributes)} userRayOut: ${wgslreflect.parseTypeName(mainRayFn.return)}
        let shaderCode = refacingMatsCode + StructDefSliceInfo + StructDefUniformBuffer + `
struct tsxvOut{
    @builtin(position) pos: vec4<f32>,
    ${retunTypeMembers}
}
struct tsxAffineMat{
    matrix: mat4x4<f32>,
    vector: vec4<f32>,
}
@group(0) @binding(0) var<storage, read> tsx_slice: array<tsxSliceInfo, ${config.maxSlicesNumber}>;

@group(0) @binding(1) var<uniform> tsx_uniforms : tsxUniformBuffer;
@group(0) @binding(2) var<uniform> thumbnailViewport : array<vec4<f32>,16>;
fn apply(afmat: tsxAffineMat, points: mat4x4<f32>) -> mat4x4<f32>{
    let biais = mat4x4<f32>(afmat.vector, afmat.vector, afmat.vector, afmat.vector);
    return afmat.matrix * points + biais;
}
fn applyinv(afmat: tsxAffineMat, points: mat4x4<f32>) -> mat4x4<f32>{
    let biais = mat4x4<f32>(afmat.vector, afmat.vector, afmat.vector, afmat.vector);
    return transpose(afmat.matrix) * (points - biais);
}
${code.replace(/@vertex/g, " ").replace(/@builtin\s*\(\s*(ray_origin|ray_direction|voxel_coord|aspect_matrix)\s*\)\s*/g, " ")}
@vertex fn mainVertex(@builtin(vertex_index) vindex:u32, @builtin(instance_index) i_index:u32) -> tsxvOut{
    const pos = array<vec2<f32>, 4>(
        vec2<f32>(-1.0, -1.0),
        vec2<f32>(-1.0, 1.0),
        vec2<f32>( 1.0, -1.0),
        vec2<f32>( 1.0, 1.0),
    );
    let sliceInfo = tsx_slice[tsx_uniforms.sliceOffset + i_index];
    let sliceFlag = tsx_slice[tsx_uniforms.sliceOffset].flag;
    var refacingEnum : u32;

    let posidx = pos[vindex];
    let coord = vec2<f32>(posidx.x, posidx.y);
    var aspect = 1.0;
    var rayPos = vec4<f32>(0.0);// no eye offset for retina
    var rayDir = vec4<f32>(0.0,0.0,0.0,-1.0);// point forward for Orthographic camera
    if(tsx_uniforms.camProj.x < 0){
        rayPos = vec4<f32>(coord.x/tsx_uniforms.camProj.x * aspect, coord.y/tsx_uniforms.camProj.y, sliceInfo.slicePos/tsx_uniforms.camProj.x, -tsx_uniforms.camProj.w/tsx_uniforms.camProj.z);
    }else{
        if(sliceFlag == 0){
            refacingEnum = tsx_uniforms.refacing;
        }else{
            refacingEnum = sliceInfo.refacing;
            let vp = thumbnailViewport[tsx_uniforms.sliceOffset + i_index - (tsx_uniforms.refacing >> 5)];
            aspect = vp.z / vp.w;
            rayPos = vec4<f32>(-tsx_uniforms.eyeCross.x * (f32(sliceInfo.refacing >> 3) - 1.0), 0.0, 0.0, 0.0);
        }
        rayDir = vec4<f32>(coord.x/tsx_uniforms.camProj.x * aspect, coord.y/tsx_uniforms.camProj.y, sliceInfo.slicePos/tsx_uniforms.camProj.x, -1.0);
    }
    let refacingMat = tsx_refacingMats[refacingEnum & 7];
    let camRayDir = refacingMat * rayDir;
    let camRayOri = refacingMat * rayPos;
    let voxelCoord = (refacingMat * vec4<f32>(coord, sliceInfo.slicePos,0.0)).xyz;
    ${dealRefacingCall}
    ${call}
    let x = f32(((sliceInfo.viewport >> 24) & 0xFF) << ${config.viewportCompressShift}) * ${1 / config.sliceTextureWidth};
    let y = f32(((sliceInfo.viewport >> 16) & 0xFF) << ${config.viewportCompressShift}) * ${1 / config.sliceTextureHeight};
    let w = f32(((sliceInfo.viewport >> 8 ) & 0xFF) << ${config.viewportCompressShift}) * ${1 / config.sliceTextureWidth};
    let h = f32((sliceInfo.viewport & 0xFF) << ${config.viewportCompressShift}) * ${1 / config.sliceTextureHeight};
    let texelCoord = array<vec2<f32>, 4>(
        vec2<f32>(x, y+h),
        vec2<f32>(x, y),
        vec2<f32>(x+w, y+h),
        vec2<f32>(x+w, y),
    )[vindex] * 2.0 - vec2<f32>(1.0);
    
    if(sliceInfo.slicePos > 1.0){
        return tsxvOut(
            vec4<f32>(0.0,0.0,0.0, -1.0),
            ${outputMembers}
        );
    }else{
        return tsxvOut(
            vec4<f32>(texelCoord.x,-texelCoord.y, 0.999999, 1.0),
            ${outputMembers}
        );
    }
}
fn calDepth(distance: f32)->f32{
    return -tsx_uniforms.camProj.z + tsx_uniforms.camProj.w / distance;
}
`;
        let module = gpu.device.createShaderModule({ code: shaderCode });
        this.shaderModule = module;
        this.pipeline = await gpu.device.createRenderPipelineAsync({
            layout: 'auto',
            vertex: {
                module,
                entryPoint: 'mainVertex',
            },
            fragment: {
                module,
                entryPoint: descriptor.fragmentEntryPoint,
                targets: [{ format: gpu.preferredFormat }]
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
            { buffer: sliceBuffers.emitIndexSliceBuffer },
            { buffer: sliceBuffers.uniformsBuffer },
            { buffer: sliceBuffers.thumbnailViewportBuffer },
        ];
        this.bindGroup0 = gpu.createBindGroup(this.pipeline, 0, buffers);
        return this;
    }
}

export { RaytracingPipeline, StructDefSliceInfo, StructDefUniformBuffer, TetraSlicePipeline, refacingMatsCode };
//# sourceMappingURL=pipeline.js.map
