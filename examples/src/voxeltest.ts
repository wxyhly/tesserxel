import * as tesserxel from "../../build/esm/tesserxel.js"

export async function load() {
    const gpu = await new tesserxel.render.GPU().init();
    const device = gpu.device;

    // voxel render pass (compute pass)

    let voxelShaderCode = `
    struct Vec4Attachment{
        size: vec3<u32>,
        data: array<vec4f>
    }
    @group(0) @binding(1) var <uniform> size: f32;
    @group(0) @binding(0) var <storage, read_write> _attachment0: Vec4Attachment;
    @compute @workgroup_size(8,8,4) fn main(@builtin(global_invocation_id) voxel_coord : vec3<u32>){
        let _size = _attachment0.size;
        if(voxel_coord.x >= _size.x || voxel_coord.y >= _size.y ||  voxel_coord.z >= _size.z){
            return ;
        }
        let storageOffset = voxel_coord.x + _size.x * (voxel_coord.y + _size.y * voxel_coord.z);
        let position = vec3<f32>(voxel_coord)/vec3<f32>(_size)*2.0 - vec3<f32>(1.0);
        var color:vec4f;
        if(dot(position,position) > size){
            color=vec4f(position*0.5+0.5,1.0);
        }else{
            color=vec4f(0.0);
        }
        _attachment0.data[storageOffset] = color;
    }
    `;
    let voxelShaderModule = device.createShaderModule({ code: voxelShaderCode });
    const computePipeline = await device.createComputePipelineAsync({
        compute: {
            module: voxelShaderModule,
            entryPoint: "main"
        },
        layout: "auto"
    });
    function createVoxelBuffer(size: GPUExtent3D) {
        let width = 0;
        let height = 0;
        let depth = 0;
        if ((size as GPUExtent3DDict).width) {
            width = (size as GPUExtent3DDict).width;
            height = (size as GPUExtent3DDict).height;
            depth = (size as GPUExtent3DDict).depthOrArrayLayers;
        } else {
            width = size[0];
            height = size[1];
            depth = size[2];
        }
        let length = width * height * depth;
        let buffer = device.createBuffer({
            size: (4 + length * 4) * 4,
            usage: GPUBufferUsage.STORAGE,
            mappedAtCreation: true,
            label: `VoxelBuffer<${width},${height},${depth},vec4f>`
        });
        let jsBuffer = new Uint32Array(buffer.getMappedRange(0, 12));
        jsBuffer.set([width, height, depth]);
        buffer.unmap();
        return { buffer, width, height, depth, size: length, format: "vec4f" };
    }
    let voxelBuffer = createVoxelBuffer([128, 128, 128]);
    let uSizeJsBuffer = new Float32Array(1);
    let uSizeBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, uSizeJsBuffer);
    const computeBindgroup = gpu.createBindGroup(computePipeline, 0, [
        { buffer: voxelBuffer.buffer },
        { buffer: uSizeBuffer }
    ]);

    function dispatch() {
        let commandEncoder = device.createCommandEncoder();
        let passEncoder = commandEncoder.beginComputePass();
        passEncoder.setPipeline(computePipeline);
        passEncoder.setBindGroup(0, computeBindgroup);
        passEncoder.dispatchWorkgroups(
            Math.ceil(voxelBuffer.width / 8),
            Math.ceil(voxelBuffer.height / 8),
            Math.ceil(voxelBuffer.depth / 4)
        );
        passEncoder.end();
        device.queue.submit([commandEncoder.finish()]);
    }

    // 3d retina render pass (use slice renderer)

    const canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
    const context = gpu.getContext(canvas);
    const renderer = new tesserxel.render.SliceRenderer(gpu);
    const RaytracingShaderCode = `
            
            struct Vec4Attachment{
                size: vec3<u32>,
                data: array<vec4f>
            }
            @group(1) @binding(0) var <storage, read> attachment0: Vec4Attachment;

            fn voxelfetch(position: vec3<f32>)->vec4f{
                let coord = vec3<u32>(position * vec3<f32>(attachment0.size));
                return attachment0.data[
                    coord.x+attachment0.size.x*(coord.y+attachment0.size.y*coord.z)
                ];
            }

            struct RayOutput{
                @location(0) position: vec3<f32>
            }
            @ray fn mainRay(@builtin(voxel_coord) position: vec3<f32>) -> RayOutput{
                return RayOutput(position);
            }
            @fragment fn mainFrag(@location(0) position: vec3<f32>) -> @location(0) vec4f{
                // return ;
                return voxelfetch(position*0.5+vec3<f32>(0.5));
            }
            `;
    const pipeline = await renderer.createRaytracingPipeline({
        code: RaytracingShaderCode,
        rayEntryPoint: "mainRay",
        fragmentEntryPoint: "mainFrag"
    });
    const renderBindgroup = gpu.createBindGroup(pipeline.pipeline, 1, [
        { buffer: voxelBuffer.buffer }
    ]);
    let retinaCtrl = new tesserxel.util.ctrl.RetinaController(renderer);
    retinaCtrl.keyConfig.enable = "";
    let ctrlReg = new tesserxel.util.ctrl.ControllerRegistry(canvas, [retinaCtrl]);
    await renderer.init();
    function setSize() {
        const width = window.innerWidth * window.devicePixelRatio;
        const height = window.innerHeight * window.devicePixelRatio;
        canvas.width = width;
        canvas.height = height;
        renderer.setDisplayConfig({ canvasSize: { width, height } });
    }
    setSize();
    window.addEventListener("resize", setSize);
    let t = 0;
    function loop() {
        t += 1 / 60;
        ctrlReg.update();
        uSizeJsBuffer[0] = (Math.sin(t) * 0.5 + 0.5);
        device.queue.writeBuffer(uSizeBuffer, 0, uSizeJsBuffer);
        dispatch();
        renderer.render(context, (rs) => {
            rs.drawRaytracing(pipeline, [renderBindgroup]);
        });
        window.requestAnimationFrame(loop);
    }
    loop();
}

export namespace voxel_shadertoy {
    export async function load() {
        const gpu = await new tesserxel.render.GPU().init();
        const canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
        const context = gpu.getContext(canvas);
        const renderer = new tesserxel.render.SliceRenderer(gpu);
        const RaytracingShaderCode = `
            struct RayOutput{
                @location(0) position: vec3<f32>
            }
            @ray fn mainRay(@builtin(voxel_coord) position: vec3<f32>) -> RayOutput{
                return RayOutput(position);
            }
            @fragment fn mainFrag(@location(0) position: vec3<f32>) -> @location(0) vec4f{
                return vec4f(position * 0.5 + vec3<f32>(0.5), 1.0);
            }
            `;
        const pipeline = await renderer.createRaytracingPipeline({
            code: RaytracingShaderCode,
            rayEntryPoint: "mainRay",
            fragmentEntryPoint: "mainFrag"
        });
        let retinaCtrl = new tesserxel.util.ctrl.RetinaController(renderer);
        retinaCtrl.keyConfig.enable = "";
        let ctrlReg = new tesserxel.util.ctrl.ControllerRegistry(canvas, [retinaCtrl]);
        await renderer.init();
        function setSize() {
            const width = window.innerWidth * window.devicePixelRatio;
            const height = window.innerHeight * window.devicePixelRatio;
            canvas.width = width;
            canvas.height = height;
            renderer.setDisplayConfig({ canvasSize: { width, height } });
        }
        setSize();
        window.addEventListener("resize", setSize);
        function loop() {
            ctrlReg.update();
            renderer.render(context, (rs) => {
                rs.drawRaytracing(pipeline);
            });
            window.requestAnimationFrame(loop);
        }
        loop();
    }
}
export namespace rasterizer {
    export async function load() {
        const gpu = await new tesserxel.render.GPU().init();
        const device = gpu.device;

        // voxel render pass (compute pass)

        let meshJsBuffer = tesserxel.mesh.tetra.tiger(1, 16, 1, 16, 0.2, 12).applyObj4(new tesserxel.math.Obj4(
            new tesserxel.math.Vec4(0, 0, 0, 2)
        ));

        const resolution = 256;
        const tetraCount = meshJsBuffer.count;

        const tileSize = 16;
        const workgroupSizeX = 8;
        const workgroupSizeY = 4;
        const workgroupSizeZ = 8;
        let commonHeaderCode = `
            struct InternalTetra{
                invPosition: mat4x4f,
                aabbMin: vec4f,
                aabbMax: vec4f,
            }
            fn frustumTest(tetra: mat4x4f, viewport: vec4f){
                // todo
            }
            `;
        let declareInverseMat4x4F32 = `
            fn inverseMat4x4F32(matrix : mat4x4f)->mat4x4f{
                let invdet = 1.0 / determinant(matrix);
                let adjoint = transpose(mat4x4f(
                    determinant(mat3x3<f32>(
                        matrix[1].yzw,
                        matrix[2].yzw,
                        matrix[3].yzw,
                    )),
                    -determinant(mat3x3<f32>(
                        matrix[1].xzw,
                        matrix[2].xzw,
                        matrix[3].xzw,
                    )),
                    determinant(mat3x3<f32>(
                        matrix[1].xyw,
                        matrix[2].xyw,
                        matrix[3].xyw,
                    )),
                    -determinant(mat3x3<f32>(
                        matrix[1].xyz,
                        matrix[2].xyz,
                        matrix[3].xyz,
                    )),

                    -determinant(mat3x3<f32>(
                        matrix[0].yzw,
                        matrix[2].yzw,
                        matrix[3].yzw,
                    )),
                    determinant(mat3x3<f32>(
                        matrix[0].xzw,
                        matrix[2].xzw,
                        matrix[3].xzw,
                    )),
                    -determinant(mat3x3<f32>(
                        matrix[0].xyw,
                        matrix[2].xyw,
                        matrix[3].xyw,
                    )),
                    determinant(mat3x3<f32>(
                        matrix[0].xyz,
                        matrix[2].xyz,
                        matrix[3].xyz,
                    )),

                    determinant(mat3x3<f32>(
                        matrix[0].yzw,
                        matrix[1].yzw,
                        matrix[3].yzw,
                    )),
                    -determinant(mat3x3<f32>(
                        matrix[0].xzw,
                        matrix[1].xzw,
                        matrix[3].xzw,
                    )),
                    determinant(mat3x3<f32>(
                        matrix[0].xyw,
                        matrix[1].xyw,
                        matrix[3].xyw,
                    )),
                    -determinant(mat3x3<f32>(
                        matrix[0].xyz,
                        matrix[1].xyz,
                        matrix[3].xyz,
                    )),

                    -determinant(mat3x3<f32>(
                        matrix[0].yzw,
                        matrix[1].yzw,
                        matrix[2].yzw,
                    )),
                    determinant(mat3x3<f32>(
                        matrix[0].xzw,
                        matrix[1].xzw,
                        matrix[2].xzw,
                    )),
                   -determinant(mat3x3<f32>(
                        matrix[0].xyw,
                        matrix[1].xyw,
                        matrix[2].xyw,
                    )),
                    determinant(mat3x3<f32>(
                        matrix[0].xyz,
                        matrix[1].xyz,
                        matrix[2].xyz,
                    )),
                ));
                return adjoint * invdet;
            }
            `;
        let vertexShaderCode = commonHeaderCode + ` 
            
            @group(0) @binding(0) var <storage, read> inputTetra: array<mat4x4f>;
            @group(0) @binding(1) var <storage, read_write> interTetra: array<InternalTetra>;
            ${declareInverseMat4x4F32}
            @compute @workgroup_size(256)
            fn main(@builtin(global_invocation_id) invocationId : vec3<u32>){
                let tetra = inputTetra[invocationId.x];
                if (tetra[0].w < 0.0 && tetra[1].w < 0.0 && tetra[2].w < 0.0 && tetra[3].w < 0.0){
                    return ;
                }

                // to do: frustum clip test in common header, if not pass, return ;

                // var vmin:vec4f = vec4f(1.0,1.0,1.0,1.0);
                // var vmax:vec4f = vec4f(-1.0,-1.0,-1.0,1.0);
                var vmin:vec4f = vec4f(-1.0,-1.0,-1.0,1.0);
                var vmax:vec4f = vec4f(1.0,1.0,1.0,1.0);
                if (tetra[0].w > 0.0 && tetra[1].w > 0.0 && tetra[2].w > 0.0 && tetra[3].w > 0.0){
                    let v0 = tetra[0] / tetra[0].w;
                    let v1 = tetra[1] / tetra[1].w;
                    let v2 = tetra[2] / tetra[2].w;
                    let v3 = tetra[3] / tetra[3].w;
                    vmin = max(vec4f(-1.0,-1.0,-1.0,1.0),min(v0,min(v1,min(v2,v3))));
                    vmax = min(vec4f( 1.0, 1.0, 1.0,1.0),max(v0,max(v1,max(v2,v3))));
                }
                interTetra[invocationId.x] = InternalTetra(
                    inverseMat4x4F32(tetra),
                    vmin, vmax
                );
            }
            `;

        let voxelShaderCode = commonHeaderCode + `
            struct Vec4Attachment{
                size: vec3<u32>,
                tileNum: vec3<u32>,
                data: array<atomic<u32>>
            }
            const tileSize:u32 = ${tileSize};
            const mat4x4One = mat4x4f(1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,);
            ${declareInverseMat4x4F32}
            @group(0) @binding(0) var <storage, read> interTetra: array<InternalTetra>;
            // @group(0) @binding(0) var <storage, read> inputTetra: array<mat4x4f>;
            @group(0) @binding(1) var <storage, read_write> _attachment0: Vec4Attachment;
            @compute @workgroup_size(${workgroupSizeX},${workgroupSizeY},${workgroupSizeZ})
            fn main(@builtin(global_invocation_id) invocationId : vec3<u32>){

                let tetraId = invocationId.x;

                // let tetra = inputTetra[invocationId.x];
                // if (tetra[0].w < 0.0 && tetra[1].w < 0.0 && tetra[2].w < 0.0 && tetra[3].w < 0.0){
                //     return ;
                // }

                // // to do: frustum clip test in common header, if not pass, return ;

                // var vmin:vec4f = vec4f(-1.0,-1.0,-1.0,1.0);
                // var vmax:vec4f = vec4f(1.0,1.0,1.0,1.0);
                // if (tetra[0].w > 0.0 && tetra[1].w > 0.0 && tetra[2].w > 0.0 && tetra[3].w > 0.0){
                //     let v0 = tetra[0] / tetra[0].w;
                //     let v1 = tetra[1] / tetra[1].w;
                //     let v2 = tetra[2] / tetra[2].w;
                //     let v3 = tetra[3] / tetra[3].w;
                //     vmin = min(v0,min(v1,min(v2,v3)));
                //     vmax = max(v0,max(v1,max(v2,v3)));
                // }

                // let internal = InternalTetra(
                //     inverseMat4x4F32(tetra),
                //     vmin, vmax
                // );

                let internal = interTetra[tetraId];

                if( internal.aabbMax.w < 0.5 ) {return;} // out of frustum

                
                // calculate current tile id and position
                
                let tileNum = _attachment0.tileNum;
                let tilePositionY = invocationId.z / tileNum.y;
                let tileId = vec3<u32>(invocationId.y, invocationId.z - tilePositionY * tileNum.y, tilePositionY);
                if (tileId.x >= tileNum.x || tileId.y >= tileNum.y || tileId.z >= tileNum.z ){ return; }
                let tileOffset = tileId * tileSize;
                let fTileSize = f32(tileSize);
                let size = _attachment0.size;
                let invSizeHalf = 2.0 / (vec3<f32>(size));
                let fTileOffset = vec3<f32>(tileOffset) * invSizeHalf - vec3<f32>(1.0);
                let ftile = fTileSize * invSizeHalf;

                if(
                    internal.aabbMax.x < fTileOffset.x || internal.aabbMin.x > fTileOffset.x + ftile.x ||
                    internal.aabbMax.y < fTileOffset.y || internal.aabbMin.y > fTileOffset.y + ftile.y ||
                    internal.aabbMax.z < fTileOffset.z || internal.aabbMin.z > fTileOffset.z + ftile.z
                ){
                    return ;
                }
                let sizeHalf =  (vec3<f32>(size)) * 0.5;
                let uaabbMin = vec3<u32>(sizeHalf * (internal.aabbMin.xyz + vec3(1.0)));
                let uaabbMax = vec3<u32>(sizeHalf * (internal.aabbMax.xyz + vec3(1.0))+vec3<f32>(5.0));
                // let loopMin = tileOffset;
                // let loopMax = tileOffset + vec3<u32>(tileSize);
                let floopMin = max(fTileOffset, internal.aabbMin.xyz);
                let loopMin = max(tileOffset, uaabbMin);
                let loopMax = min(tileOffset + vec3<u32>(tileSize), uaabbMax);
                let loopSize = loopMax - loopMin;
                let floopSize = vec3<f32>(loopSize);

                // calculate tile voxel buffer offsets

                var storageIndex = loopMin.x + size.x * (loopMin.y + size.y * loopMin.z);
                let storageIndexDy = size.x - loopSize.x;
                let storageIndexDz = size.x * (size.y - loopSize.y);

                // calculate tetrahedron barycenter coordinates ( in f32 NDC coord version )

                let invTetra = internal.invPosition;
                var barycenter =  invTetra * vec4f(floopMin, 1.0);
                let barycenterDx = invTetra[0] * invSizeHalf.x;
                let barycenterDy = invTetra[1] * invSizeHalf.y - barycenterDx * floopSize.x;
                let barycenterDz = invTetra[2] * invSizeHalf.z - invTetra[1] * invSizeHalf.y * floopSize.y;

                // calculate loop range

                // let maxTilePosition = tileOffset + vec3<u32>(tileSize);
                let maxTilePosition = tileOffset + vec3<u32>(tileSize);
                
                for(var z = loopMin.z; z < loopMax.z; z++){
                    for(var y = loopMin.y; y < loopMax.y; y++){
                        for(var x = loopMin.x; x < loopMax.x; x++){
                            if( barycenter.x > -0.01 &&
                                barycenter.y > -0.01 &&
                                barycenter.z > -0.01 && 
                                barycenter.w > -0.01
                            ){
                                let depth = barycenter.x + barycenter.y + barycenter.z + barycenter.w;
                                atomicMax(&_attachment0.data[storageIndex], u32(depth * 65536.0) );
                            }
                            barycenter += barycenterDx;
                            storageIndex++;
                        }
                        barycenter += barycenterDy;
                        storageIndex += storageIndexDy;
                    }
                    barycenter += barycenterDz;
                    storageIndex += storageIndexDz;
                }

                // calculate tetrahedron barycenter coordinates ( in i32 voxel coord version )

                // let tetraId = invocationId.z;
                // var tetra = inputTetra[tetraId];
                // tetra += mat4x4One;
                // let sizeHalf =  (vec3<f32>(size)) * 0.5;

                // tetra[0].xyz *= sizeHalf;
                // tetra[1].xyz *= sizeHalf;
                // tetra[2].xyz *= sizeHalf;
                // tetra[3].xyz *= sizeHalf;
                // let invTetra = inverseMat4x4F32(tetra);
                // let fTileSize = f32(tileSize);
                // var barycenter =  invTetra * vec4f(vec3<f32>(tileOffset) * invSizeHalf - vec3<f32>(1.0), 1.0);
                // let barycenterDx = invTetra[0] * invSizeHalf.x;
                // let barycenterDy = invTetra[1] * invSizeHalf.y - barycenterDx * fTileSize;
                // let barycenterDz = invTetra[2] * invSizeHalf.z - invTetra[1] * invSizeHalf.y * fTileSize;

                // let maxTilePosition = tileOffset + vec3<u32>(tileSize);
                // for(var z = tileOffset.z; z < maxTilePosition.z; z++){
                //     for(var y = tileOffset.y; y < maxTilePosition.y; y++){
                //         for(var x = tileOffset.x; x < maxTilePosition.x; x++){
                //             if(x < size.x && y< size.y && z<size.z){
                //                 if(  barycenter.x > -0.000001 &&
                //                     barycenter.y>  -0.000001 &&
                //                     barycenter.z>  -0.000001 && 
                //                     barycenter.w>  -0.000001
                //                 ){
                //                     let depth = barycenter.x + barycenter.y + barycenter.z + barycenter.w;
                //                     atomicMax(&_attachment0.data[storageIndex], u32(depth * 65536.0) );
                //                 }
                //             }
                //             barycenter += barycenterDx;
                //             storageIndex++;
                //         }
                //         barycenter += barycenterDy;
                //         storageIndex += storageIndexDy;
                //     }
                //     barycenter += barycenterDz;
                //     storageIndex += storageIndexDz;
                // }
            }
            `;
        let vertexShaderModule = device.createShaderModule({ code: vertexShaderCode });
        let voxelShaderModule = device.createShaderModule({ code: voxelShaderCode });
        const computePipeline = await device.createComputePipelineAsync({
            compute: {
                module: voxelShaderModule,
                entryPoint: "main"
            },
            layout: "auto"
        });
        const vertexPipeline = await device.createComputePipelineAsync({
            compute: {
                module: vertexShaderModule,
                entryPoint: "main"
            },
            layout: "auto"
        });
        let internalTetraBuffer = gpu.createBuffer(GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE, 0x400000, "internalTetra");
        let size = [resolution, resolution, resolution];
        let tileNums = new Uint32Array([Math.ceil(size[0] / tileSize), Math.ceil(size[1] / tileSize), Math.ceil(size[2] / tileSize)]);
        let voxelBuffer = tesserxel.render.createVoxelBuffer(
            gpu, size, 1, tileNums.buffer
        );
        let uSizeJsBuffer = new Float32Array(1);
        let uSizeBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, uSizeJsBuffer);
        let meshBuffer = gpu.createBuffer(GPUBufferUsage.STORAGE, meshJsBuffer.position);
        const vertexBindgroup = gpu.createBindGroup(vertexPipeline, 0, [
            { buffer: meshBuffer },
            { buffer: internalTetraBuffer },
        ], "vertexBindgroup");
        const computeBindgroup = gpu.createBindGroup(computePipeline, 0, [
            { buffer: internalTetraBuffer },
            // { buffer: meshBuffer },
            { buffer: voxelBuffer.buffer },
        ], "computeBindgroup");

        function dispatch() {
            let commandEncoder = device.createCommandEncoder();
            commandEncoder.clearBuffer(internalTetraBuffer);
            commandEncoder.clearBuffer(voxelBuffer.buffer, 32);
            let passEncoder = commandEncoder.beginComputePass();
            passEncoder.setPipeline(vertexPipeline);
            passEncoder.setBindGroup(0, vertexBindgroup);
            passEncoder.dispatchWorkgroups(
                Math.ceil(tetraCount / 256),
            );
            passEncoder.setPipeline(computePipeline);
            passEncoder.setBindGroup(0, computeBindgroup);
            passEncoder.dispatchWorkgroups(
                Math.ceil(tetraCount / workgroupSizeX),
                Math.ceil(tileNums[0] / workgroupSizeY),
                Math.ceil(tileNums[1] * tileNums[2] / workgroupSizeZ),
            );
            passEncoder.end();
            device.queue.submit([commandEncoder.finish()]);
        }



        // 3d retina render pass (use slice renderer)



        const canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
        const context = gpu.getContext(canvas);
        const renderer = new tesserxel.render.SliceRenderer(gpu);
        renderer.setDisplayConfig({ opacity: 2 });
        const RaytracingShaderCode = `
            
            struct Vec4Attachment{
                size: vec3<u32>,
                padding: vec3<u32>,
                data: array<u32>
            }
            @group(1) @binding(0) var <storage, read> attachment0: Vec4Attachment;

            fn voxelfetch(position: vec3<f32>)->u32{
                let coord = vec3<u32>(position * vec3<f32>(attachment0.size));
                return attachment0.data[
                    coord.x+attachment0.size.x*(coord.y+attachment0.size.y*coord.z)
                ];
            }

            struct RayOutput{
                @location(0) position: vec3<f32>
            }
            @ray fn mainRay(@builtin(voxel_coord) position: vec3<f32>) -> RayOutput{
                return RayOutput(position);
            }
            @fragment fn mainFrag(@location(0) position: vec3<f32>) -> @location(0) vec4f{
                // return ;
                let depth = f32(voxelfetch(position*0.5+vec3<f32>(0.5))) / 65536.0;
                return vec4f(depth,depth,depth,step(0.000001,depth));
            }
            `;
        const pipeline = await renderer.createRaytracingPipeline({
            code: RaytracingShaderCode,
            rayEntryPoint: "mainRay",
            fragmentEntryPoint: "mainFrag"
        });
        const renderBindgroup = gpu.createBindGroup(pipeline.pipeline, 1, [
            { buffer: voxelBuffer.buffer }
        ]);
        let retinaCtrl = new tesserxel.util.ctrl.RetinaController(renderer);
        retinaCtrl.keyConfig.enable = "";
        let ctrlReg = new tesserxel.util.ctrl.ControllerRegistry(canvas, [retinaCtrl]);
        await renderer.init();
        function setSize() {
            const width = window.innerWidth * window.devicePixelRatio;
            const height = window.innerHeight * window.devicePixelRatio;
            canvas.width = width;
            canvas.height = height;
            renderer.setDisplayConfig({ canvasSize: { width, height } });
        }
        setSize();
        window.addEventListener("resize", setSize);
        let t = 0;
        function loop() {
            t += 1 / 60;
            ctrlReg.update();
            uSizeJsBuffer[0] = (Math.sin(t));
            device.queue.writeBuffer(uSizeBuffer, 0, uSizeJsBuffer);

            function dispatch2() {
                let commandEncoder = device.createCommandEncoder();
                commandEncoder.clearBuffer(internalTetraBuffer);
                commandEncoder.clearBuffer(voxelBuffer.buffer, 32);
                let passEncoder = commandEncoder.beginComputePass();
                passEncoder.setPipeline(vertexPipeline);
                passEncoder.setBindGroup(0, vertexBindgroup);
                passEncoder.dispatchWorkgroups(
                    Math.ceil(tetraCount / 256),
                );
                passEncoder.setPipeline(computePipeline);
                passEncoder.setBindGroup(0, computeBindgroup);
                passEncoder.dispatchWorkgroups(
                    Math.ceil(tetraCount / workgroupSizeX),
                    Math.ceil(tileNums[0] / workgroupSizeY),
                    Math.ceil(tileNums[1] * tileNums[2] / workgroupSizeZ),
                );
                passEncoder.end();
                device.queue.submit([commandEncoder.finish()]);
            }
            renderer.render(context, (rs) => {
                rs.drawRaytracing(pipeline, [renderBindgroup]);
            });
            window.requestAnimationFrame(loop);
        }
        dispatch();
        loop();
    }
}