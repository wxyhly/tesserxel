import * as tesserxel from '../../build/tesserxel.js';

// namespace examples {
var wave_eq;
(function (wave_eq) {
    async function load() {
        const gpu = await new tesserxel.render.GPU().init();
        let resolution = [300, 300, 300];
        let bufferA = tesserxel.render.createVoxelBuffer(gpu, resolution, 1);
        let bufferB = tesserxel.render.createVoxelBuffer(gpu, resolution, 1);
        let computeCode = `
            struct Vec4Attachment{
                size: vec4<u32>,
                data: array<u32>
            }
            struct UniformBlock{
                time: f32,
                dt: f32,
            }
            @group(0) @binding(0) var<storage,read_write> input: Vec4Attachment;
            @group(0) @binding(1) var<storage,read_write> output: Vec4Attachment;
            @group(0) @binding(2) var<uniform> uBlock: UniformBlock;
            const gridSize = 10.0;
            const k = 10.0;
            const kr = 0.01;
            @compute @workgroup_size(8,8,4) 
            fn main1(@builtin(global_invocation_id) pos: vec3<u32>){
                if(pos.x >= input.size.x || pos.y >= input.size.y || pos.z >= input.size.z){
                    return;
                }
                let dt = uBlock.dt;
                let offset = pos.x + input.size.x*(pos.y + input.size.y*pos.z);
                let sizeXY = i32(input.size.x * input.size.y);
                let sizeXYZ = sizeXY * i32(input.size.z);
                var offsetxp: i32 = 1; if(pos.x == input.size.x - 1) { offsetxp -= i32(input.size.x); }
                var offsetxm: i32 = -1; if(pos.x == 0) { offsetxm +=  i32(input.size.x); }
                var offsetyp: i32 = i32(input.size.x); if(pos.y == input.size.y - 1) { offsetyp -= sizeXY; }
                var offsetym: i32 = -i32(input.size.x); if(pos.y == 0) { offsetym += sizeXY; }
                var offsetzp: i32 = sizeXY; if(pos.z == input.size.z - 1) { offsetzp -= sizeXYZ; }
                var offsetzm: i32 = -sizeXY; if(pos.z == 0) { offsetzm += sizeXYZ; }
                let d_u = unpack2x16float(input.data[offset]);
                let d = d_u.x;
                let u = d_u.y;
                let ioffset = i32(offset);
                let laplace = (
                    unpack2x16float(input.data[ioffset + offsetxp]).x + 
                    unpack2x16float(input.data[ioffset + offsetxm]).x + 
                    unpack2x16float(input.data[ioffset + offsetyp]).x + 
                    unpack2x16float(input.data[ioffset + offsetym]).x + 
                    unpack2x16float(input.data[ioffset + offsetzp]).x + 
                    unpack2x16float(input.data[ioffset + offsetzm]).x + 
                    (
                        unpack2x16float(input.data[ioffset + offsetxp + offsetyp]).x + 
                        unpack2x16float(input.data[ioffset + offsetxm + offsetyp]).x + 
                        unpack2x16float(input.data[ioffset + offsetzp + offsetyp]).x + 
                        unpack2x16float(input.data[ioffset + offsetzm + offsetyp]).x + 
                        unpack2x16float(input.data[ioffset + offsetxp + offsetym]).x + 
                        unpack2x16float(input.data[ioffset + offsetxm + offsetym]).x + 
                        unpack2x16float(input.data[ioffset + offsetzp + offsetym]).x + 
                        unpack2x16float(input.data[ioffset + offsetzm + offsetym]).x + 
                        unpack2x16float(input.data[ioffset + offsetxp + offsetzp]).x + 
                        unpack2x16float(input.data[ioffset + offsetxm + offsetzp]).x + 
                        unpack2x16float(input.data[ioffset + offsetxp + offsetzm]).x + 
                        unpack2x16float(input.data[ioffset + offsetxm + offsetzm]).x
                    ) * 0.25
                ) - 9.0 * d;
                let coord = vec3<f32>(pos) / vec3<f32>(input.size.xyz) - vec3<f32>(0.5);
                let a = k * dt * laplace * f32(input.size.x);
                let uNew = u + a * dt;
                var dNew = d + (u + a * dt * 0.5) * dt;
                let s1 = coord - vec3<f32>( 0.03, 0.03 + 0.4, 0.03);
                let s2 = coord - vec3<f32>(-0.03,-0.03 + 0.4, 0.03);
                let s3 = coord - vec3<f32>( 0.03,-0.03 + 0.4,-0.03);
                let s4 = coord - vec3<f32>(-0.03, 0.03 + 0.4,-0.03);
                if (dot(s1,s1) <0.0001 || dot(s2,s2) <0.0001 || dot(s3,s3) <0.0001 || dot(s4,s4) <0.0001) { 
                        dNew = sin(uBlock.time); 
                }
                output.data[offset] = pack2x16float(vec2<f32>(dNew,uNew));
            }
            @compute @workgroup_size(8,8,4) 
            fn main2(@builtin(global_invocation_id) pos: vec3<u32>){
                if(pos.x >= input.size.x || pos.y >= input.size.y || pos.z >= input.size.z){
                    return;
                }
                let offset = pos.x + input.size.x*(pos.y + input.size.y*pos.z);
                input.data[offset] = output.data[offset];
            }
            `;
        const raytracingShaderCode = `
            struct Vec4Attachment{
                size: vec4<u32>,
                data: array<u32>
            }
            @group(1) @binding(0) var<storage,read> input: Vec4Attachment;
            struct RayOutput{
                @location(0) position: vec3<f32>
            }
            @ray fn mainRay(@builtin(voxel_coord) position: vec3<f32>) -> RayOutput{
                return RayOutput(position);
            }
            @fragment fn mainFrag(@location(0) position: vec3<f32>) -> @location(0) vec4<f32>{
                let pos = vec3<u32>((position * 0.5 + vec3<f32>(0.5)) * vec3<f32>(input.size.xyz));
                let offset = pos.x + input.size.x*(pos.y + input.size.y*pos.z);
                let d_u = unpack2x16float(input.data[offset]);
                return vec4<f32>(-cos(d_u.y)*0.5 + 0.5, sin(d_u.y)*0.5 + 0.5, sin(d_u.x)*0.5 + 0.5, d_u.x * d_u.x * 1000.0 + 0.02);
            }
            `;
        const device = gpu.device;
        let computeModule = device.createShaderModule({ code: computeCode });
        const computePipeline1 = await device.createComputePipelineAsync({
            compute: {
                module: computeModule,
                entryPoint: "main1"
            },
            layout: "auto"
        });
        let uBlockJsBuffer = new Float32Array(2);
        let uBlockBuffer = gpu.createBuffer(GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM, uBlockJsBuffer);
        const computeBindgroup1 = gpu.createBindGroup(computePipeline1, 0, [
            { buffer: bufferA.buffer },
            { buffer: bufferB.buffer },
            { buffer: uBlockBuffer },
        ]);
        const computeBindgroup2 = gpu.createBindGroup(computePipeline1, 0, [
            { buffer: bufferB.buffer },
            { buffer: bufferA.buffer },
            { buffer: uBlockBuffer },
        ]);
        const canvas = document.getElementById("gpu-canvas");
        const context = gpu.getContext(canvas);
        const renderer = await new tesserxel.render.SliceRenderer().init(gpu, context);
        renderer.setOpacity(12);
        const pipeline = await renderer.createRaytracingPipeline({
            code: raytracingShaderCode,
            rayEntryPoint: "mainRay",
            fragmentEntryPoint: "mainFrag"
        });
        const renderBindgroup = gpu.createBindGroup(pipeline.pipeline, 1, [
            { buffer: bufferA.buffer }
        ]);
        let retinaCtrl = new tesserxel.util.ctrl.RetinaController(renderer);
        retinaCtrl.keyConfig.enable = "";
        let ctrlReg = new tesserxel.util.ctrl.ControllerRegistry(canvas, [retinaCtrl]);
        function setSize() {
            const width = window.innerWidth * window.devicePixelRatio;
            const height = window.innerHeight * window.devicePixelRatio;
            canvas.width = width;
            canvas.height = height;
            renderer.setSize({ width, height });
        }
        setSize();
        window.addEventListener("resize", setSize);
        let t = 0;
        function dispatch() {
            let commandEncoder = device.createCommandEncoder();
            let passEncoder = commandEncoder.beginComputePass();
            let step = 5;
            let dt = 1 / 60 / step;
            uBlockJsBuffer[1] = dt;
            for (let i = 0; i < step; i++) {
                t += dt;
                uBlockJsBuffer[0] = (Math.sin(t * 4));
                device.queue.writeBuffer(uBlockBuffer, 0, uBlockJsBuffer);
                passEncoder.setPipeline(computePipeline1);
                passEncoder.setBindGroup(0, computeBindgroup1);
                passEncoder.dispatchWorkgroups(Math.ceil(bufferA.width / 8), Math.ceil(bufferA.height / 8), Math.ceil(bufferA.depth / 4));
                passEncoder.setBindGroup(0, computeBindgroup2);
                passEncoder.dispatchWorkgroups(Math.ceil(bufferA.width / 8), Math.ceil(bufferA.height / 8), Math.ceil(bufferA.depth / 4));
            }
            passEncoder.end();
            device.queue.submit([commandEncoder.finish()]);
        }
        function loop() {
            ctrlReg.update();
            dispatch();
            renderer.render(() => {
                renderer.drawRaytracing(pipeline, [renderBindgroup]);
            });
            window.requestAnimationFrame(loop);
        }
        loop();
    }
    wave_eq.load = load;
})(wave_eq || (wave_eq = {}));
class ErosionDisplayController {
    water = 1;
    sediment = 0;
    terrainQSpeed = 0.04;
    terrainCSpeed = 0.04;
    terrainOSpeed = 0.04;
    terrainQ = 1.0;
    terrainCenter = 0.5;
    terrainOpacity = 0.05;
    enabled = true;
    buffer;
    constructor(jsBuffer) {
        this.buffer = jsBuffer;
    }
    update(state) {
        if (state.isKeyHold("KeyO")) {
            this.water = 0;
        }
        if (state.isKeyHold("KeyL")) {
            this.water += 0.5;
        }
        if (state.isKeyHold(".KeyP")) {
            this.sediment = this.sediment ? 0 : 0.1;
        }
        if (state.isKeyHold("KeyY")) {
            this.terrainQ *= 1 + this.terrainQSpeed;
        }
        if (state.isKeyHold("KeyH")) {
            this.terrainQ /= 1 + this.terrainQSpeed;
            if (this.terrainQ < 1)
                this.terrainQ = 1;
        }
        if (state.isKeyHold("KeyU")) {
            this.terrainCenter += this.terrainCSpeed;
        }
        if (state.isKeyHold("KeyJ")) {
            this.terrainCenter -= this.terrainCSpeed;
        }
        if (state.isKeyHold("KeyI")) {
            this.terrainOpacity *= 1 + this.terrainOSpeed;
        }
        if (state.isKeyHold("KeyK")) {
            this.terrainOpacity /= 1 + this.terrainOSpeed;
        }
        this.buffer.set([
            0,
            this.water,
            this.sediment,
            this.terrainQ,
            this.terrainCenter,
            this.terrainOpacity,
        ]);
    }
}
var erosion;
(function (erosion) {
    async function load() {
        await simulateTerrain(1);
    }
    erosion.load = load;
})(erosion || (erosion = {}));
var river_evolution;
(function (river_evolution) {
    async function load() {
        await simulateTerrain(0);
    }
    river_evolution.load = load;
})(river_evolution || (river_evolution = {}));
var coriolis;
(function (coriolis) {
    async function load() {
        await simulateTerrain(1, true);
    }
    coriolis.load = load;
})(coriolis || (coriolis = {}));
async function simulateTerrain(erosionRate, coriolis) {
    const gpu = await new tesserxel.render.GPU().init();
    const simres = 202;
    const heightscale = 10;
    let resolution = [simres, simres, 202];
    let tx00 = tesserxel.render.createVoxelBuffer(gpu, resolution, 4); // bdsr
    let tx01 = tesserxel.render.createVoxelBuffer(gpu, resolution, 4); // bdsr
    let tx02 = tesserxel.render.createVoxelBuffer(gpu, resolution, 4); // fxy
    let tx03 = tesserxel.render.createVoxelBuffer(gpu, resolution, 2); // fz
    let tx04 = tesserxel.render.createVoxelBuffer(gpu, resolution, 4); // fxy
    let tx05 = tesserxel.render.createVoxelBuffer(gpu, resolution, 2); // fz
    let tx06 = tesserxel.render.createVoxelBuffer(gpu, resolution, 4); // dbg
    let computeCode = tesserxel.four.NoiseWGSLHeader + `
            struct Vec4Attachment{
                size: vec4<u32>,
                data: array<vec4<f32>> 
            }
            struct Vec2Attachment{
                size: vec4<u32>,
                data: array<vec2<f32>> 
            }
            struct UniformBlock{
                seed: f32
            }
            @group(0) @binding(0) var<storage,read_write> tx00: Vec4Attachment;
            @group(0) @binding(1) var<storage,read_write> tx01: Vec4Attachment;
            @group(0) @binding(2) var<storage,read_write> tx02: Vec4Attachment;
            @group(0) @binding(3) var<storage,read_write> tx03: Vec2Attachment;
            @group(0) @binding(4) var<storage,read_write> tx04: Vec4Attachment;
            @group(0) @binding(5) var<storage,read_write> tx05: Vec2Attachment;
            @group(0) @binding(6) var<storage,read_write> tx06: Vec4Attachment;
            // @group(0) @binding(6) var<storage,read_write> tx06: Vec4Attachment;
            // @group(0) @binding(7) var<storage,read_write> tx07: Vec4Attachment;
            // @group(0) @binding(8) var<storage,read_write> tx08: Vec4Attachment;
            // @group(0) @binding(9) var<storage,read_write> tx09: Vec4Attachment;
            // @group(0) @binding(10) var<storage,read_write> tx0a: Vec4Attachment;
            @group(0) @binding(7) var<uniform> uBlock: UniformBlock;
            const l = 0.8;
            const dt = 0.05;
            const rainRate = 0.02;
            const evaporationRate = 0.1;
            const A = 10.0;
            const g = 9.81;
            const pipelen = 0.8;
            const flux_coeff = 2.0 * 9.81 / 0.8 * 0.05;
            const kc = 0.1;
            const ks = 2.0 * ${erosionRate};
            const kd = 4.0 * ${erosionRate};
            const kav = 9.0; // sedimentflow speed
            const kh = 2.0;
            const kt = 1.0;
            const ka = 0.8*5 * ${heightscale};
            const ki = 0.1*5 * ${heightscale};
            const kk = 0.05; // corioli
            const kdp = 0.99; // velocity damping
            const kdmax = 0.2;
            
            @compute @workgroup_size(8,8,4) 
            fn init(@builtin(global_invocation_id) pos: vec3<u32>){
                
                let t1 = tx06.size;
                let t2 = tx03.size;
                let t3 = tx04.size;
                let seed = uBlock.seed;
                if(pos.x >= tx05.size.x || pos.y >= tx01.size.y || pos.z >= tx02.size.z){
                    return;
                }
                let offset = pos.x + tx03.size.x*(pos.y + tx04.size.y*pos.z);
                let coord = (vec3<f32>(pos) / vec3<f32>(tx00.size.xyz) - vec3<f32>(0.5)) * 2.0;
                tx00.data[offset].x = (
                    // snoise(vec3(coord.xy,0.2)) + 0.4 * snoise(vec3(coord.xy * 2.0,0.5)) + 0.15 * snoise(vec3(coord.xy * 4.0,0.2)) + 0.07 * snoise(vec3(coord.xy * 8.0,0.2))+ 0.03 * snoise(vec3(coord.xy * 16.0,0.2)) + 0.5
                    ${coriolis ?
        `(snoise(vec3(coord.xy,0.2 + coord.z)) + 0.4 * snoise(vec3(coord.xy * 2.0,0.5 + coord.z * 2.0)) + 0.15 * snoise(vec3(coord.xy * 4.0,0.2 + coord.z * 4.0)) + 0.07 * snoise(vec3(coord.xy * 8.0,0.2 + coord.z * 8.0))+ 0.03 * snoise(vec3(coord.xy * 16.0,0.2 + coord.z * 16.0)) + 0.5) * 0.1 + (coord.x - 0.5) * (coord.x - 0.5) * 0.6 - 0.3` :
        `snoise(vec3(coord.xy,0.2 + coord.z)) + 0.4 * snoise(vec3(coord.xy * 2.0,0.5 + coord.z * 2.0)) + 0.15 * snoise(vec3(coord.xy * 4.0,0.2 + coord.z * 4.0)) + 0.07 * snoise(vec3(coord.xy * 8.0,0.2 + coord.z * 8.0))+ 0.03 * snoise(vec3(coord.xy * 16.0,0.2 + coord.z * 16.0)) + 0.5`}
                    // snoise(coord*1.0) + 0.4 * snoise(coord * 2.0) + 0.2 * snoise(coord * 4.0) + 0.05 * snoise(coord * 8.0) + 0.02 * snoise(coord * 16.0)
                    // snoise(coord*2.0) + 0.5 * snoise(coord * 4.0) + 0.25 * snoise(coord * 8.0) + 0.125 * snoise(coord * 16.0)
                    // min(0.25,dot(coord,coord))
                    // dot(coord,coord) - cos(coord.x*15.0)*cos(coord.y*15.0)*cos(coord.z*15.0)*0.08
                    // 0.5
                    // min(0.25,dot(coord.xy,coord.xy))*4.0
                    // (dot(coord.xy,coord.xy) - cos(coord.x*15.0)*cos(coord.y*15.0)*0.08 + 0.1) * 3.0
                ) * 20.0 * ${heightscale};
                tx00.data[offset].y = ( 0.0
                    // step(length(coord.xy - vec2(0.5,0.5)),0.2)
                );
                tx00.data[offset].z = 0.0;//cos(coord.x*80.0)*cos(coord.y*80.0)*0.0003;
                tx00.data[offset].w = 1.0;
            }
            @compute @workgroup_size(8,8,4)
            fn main1(@builtin(global_invocation_id) pos: vec3<u32>){
                if(pos.x >= tx05.size.x || pos.y >= tx01.size.y || pos.z >= tx06.size.z){
                    return;
                }
                let seed = uBlock.seed;
                let offset = pos.x + tx04.size.x * (pos.y + tx00.size.y * pos.z);
                let sizeXY = i32(tx00.size.x * tx00.size.y);
                let sizeXYZ = sizeXY * i32(tx00.size.z);
                var offsetxp: i32 = 1; if(pos.x == tx00.size.x - 1) { offsetxp -= i32(tx00.size.x); }
                var offsetxm: i32 = -1; if(pos.x == 0) { offsetxm +=  i32(tx00.size.x); }
                var offsetyp: i32 = i32(tx00.size.x); if(pos.y == tx00.size.y - 1) { offsetyp -= sizeXY; }
                var offsetym: i32 = -i32(tx00.size.x); if(pos.y == 0) { offsetym += sizeXY; }
                var offsetzp: i32 = sizeXY; if(pos.z == tx00.size.z - 1) { offsetzp -= sizeXYZ; }
                var offsetzm: i32 = -sizeXY; if(pos.z == 0) { offsetzm += sizeXYZ; }

                let bdhere = tx00.data[offset];
                let b = bdhere.x; let d = bdhere.y;
                let waterh = b + d;

                let ioffset = i32(offset);
                let b_dxm = tx00.data[ioffset + offsetxm];
                let b_dxp = tx00.data[ioffset + offsetxp];
                let b_dym = tx00.data[ioffset + offsetym];
                let b_dyp = tx00.data[ioffset + offsetyp];
                let b_dzm = tx00.data[ioffset + offsetzm];
                let b_dzp = tx00.data[ioffset + offsetzp];

                var fxy = tx02.data[offset];
                fxy = max(vec4<f32>(0.0), fxy + flux_coeff * (
                    vec4(waterh) - vec4(b_dxm.x, b_dxp.x, b_dym.x, b_dyp.x) - vec4(b_dxm.y, b_dxp.y, b_dym.y, b_dyp.y)
                ));
                
                var fz = tx03.data[offset];
                fz = max(vec2<f32>(0.0), fz + flux_coeff  * (
                    vec2(waterh) - vec2(b_dzm.x, b_dzp.x) - vec2(b_dzm.y, b_dzp.y)
                ));

                let flux_out = fxy.x + fxy.y + fxy.z + fxy.w + fz.x + fz.y;
                let fluxK = min(1.0, d * l * l / (dt * flux_out));
                fxy *= fluxK; fz *= fluxK;
                tx04.data[offset] = fxy;
                tx05.data[offset] = fz;
            }
            @compute @workgroup_size(8,8,4) 
            fn main2(@builtin(global_invocation_id) pos: vec3<u32>){
                if(pos.x >= tx00.size.x || pos.y >= tx00.size.y || pos.z >= tx00.size.z){
                    return;
                }
                let seed = uBlock.seed;
                let offset = pos.x + tx00.size.x*(pos.y + tx00.size.y*pos.z);
                let sizeX = i32(tx00.size.x);
                let sizeY = i32(tx00.size.y);
                let sizeZ = i32(tx00.size.z);
                let sizeXY = sizeX * sizeY;
                let sizeXYZ = sizeXY * sizeZ;
                var offsetxp: i32 = 1; if(pos.x == tx00.size.x - 1) { offsetxp -= sizeX; }
                var offsetxm: i32 = -1; if(pos.x == 0) { offsetxm +=  sizeX; }
                var offsetyp: i32 = sizeX; if(pos.y == tx00.size.y - 1) { offsetyp -= sizeXY; }
                var offsetym: i32 = -sizeX; if(pos.y == 0) { offsetym += sizeXY; }
                var offsetzp: i32 = sizeXY; if(pos.z == tx00.size.z - 1) { offsetzp -= sizeXYZ; }
                var offsetzm: i32 = -sizeXY; if(pos.z == 0) { offsetzm += sizeXYZ; }
                let bdhere = tx00.data[offset];
                let b:f32 = bdhere.x; let d = bdhere.y;
                let waterh = b + d;

                let ioffset = i32(offset);
                let f_xm = tx04.data[ioffset + offsetxm].y;
                let f_xp = tx04.data[ioffset + offsetxp].x;
                let f_ym = tx04.data[ioffset + offsetym].w;
                let f_yp = tx04.data[ioffset + offsetyp].z;
                let f_zm = tx05.data[ioffset + offsetzm].y;
                let f_zp = tx05.data[ioffset + offsetzp].x;
                
                let b_dxm = tx00.data[ioffset + offsetxm];
                let b_dxp = tx00.data[ioffset + offsetxp];
                let b_dym = tx00.data[ioffset + offsetym];
                let b_dyp = tx00.data[ioffset + offsetyp];
                let b_dzm = tx00.data[ioffset + offsetzm];
                let b_dzp = tx00.data[ioffset + offsetzp];

                let fxy = tx04.data[offset];
                let fz = tx05.data[offset];
                let flux_out = fxy.x + fxy.y + fxy.z + fxy.w + fz.x + fz.y;
                let flux_in = f_xm + f_xp + f_ym + f_yp + f_zm + f_zp;
                var d1 = max(0.0, d + dt * ((flux_in - flux_out) / ( l * l) + rainRate - d * evaporationRate));
                var w = vec3(
                    fxy.y - fxy.x + f_xm - f_xp,
                    fxy.w - fxy.z + f_ym - f_yp,
                    fz.y - fz.x + f_zm - f_zp,
                );
                let dvx = kk * w.y * dt;
                let dvy = - kk * w.x * dt;
                let newfxy = vec4(
                    fxy.x - dvx, fxy.y + dvx,
                    fxy.z - dvy, fxy.w + dvy
                );
                let da = d + d1;
                if( da <= 0.0001 || d1 < 0.0001 ){ w = vec3(0.0); } else { w /= da * l;}
                let v = length(w);
                let N = normalize(vec4(
                    b_dxp.x - b_dxm.x,
                    b_dyp.x - b_dym.x,
                    b_dzp.x - b_dzm.x, 2.0
                ));
                let waterN = normalize(vec4(
                    b_dxp.x + b_dxp.y - b_dxm.x - b_dxm.y,
                    b_dyp.x + b_dyp.y - b_dym.x - b_dym.y,
                    b_dzp.x + b_dzp.y - b_dzm.x - b_dzm.y, 2.0
                ));
                let slopeSin = 0.5;//-dot(vec4(w,dot(w,-waterN.xyz)),N);
                let slope = max(0.1, slopeSin);
                // let V = vec4(w,dot(waterN.xyz,w));
                let c = max(0.0, kc * v * slope) * clamp(0.0, 1.0, (d1 - kdmax) / kdmax + 1);
                // let c = max(0.0, kc * v * length(N.xyz)) * clamp(0.0, 1.0, (d1 - kdmax) / kdmax + 1);
                // let c = max(0.0, kc * v * ( - dot(N, V))) * clamp(0.0, 1.0, (d1 - kdmax) / kdmax + 1);

                // avocation

                let avoc = vec3<f32>(pos) - w * dt * kav;
                // let avoc = vec3<f32>(pos) - w * dt * kav / (d + d1);
                var a1 = vec3<i32>(floor(avoc));
                if(a1.x < 0){a1.x += sizeX;} if(a1.x >= sizeX){a1.x -= sizeX;}
                if(a1.y < 0){a1.y += sizeY;} if(a1.y >= sizeY){a1.y -= sizeY;}
                if(a1.z < 0){a1.z += sizeZ;} if(a1.z >= sizeZ){a1.z -= sizeZ;}
                
                let ammmoffset = a1.x + sizeX*(a1.y + sizeY*a1.z);
                
                offsetxp = 1; if(a1.x == sizeX - 1) { offsetxp -= sizeX; }
                offsetyp = sizeX; if(a1.y == sizeY - 1) { offsetyp -= sizeXY; }
                offsetzp = sizeXY; if(a1.z == sizeZ - 1) { offsetzp -= sizeXYZ; }

                let a3 = avoc - floor(avoc);

                let s = mix(
                    mix(
                        mix(
                            tx00.data[ammmoffset].z,
                            tx00.data[ammmoffset + offsetxp].z,
                            a3.x
                        ),
                        mix(
                            tx00.data[ammmoffset + offsetyp].z,
                            tx00.data[ammmoffset + offsetyp + offsetxp].z,
                            a3.x
                        ),
                        a3.y
                    ),
                    mix(
                        mix(
                            tx00.data[ammmoffset + offsetzp].z,
                            tx00.data[ammmoffset + offsetzp + offsetxp].z,
                            a3.x
                        ),
                        mix(
                            tx00.data[ammmoffset + offsetzp + offsetyp].z,
                            tx00.data[ammmoffset + offsetzp + offsetyp + offsetxp].z,
                            a3.x
                        ),
                        a3.y
                    ),
                    a3.z
                );
                // let s = bdhere.z;
                let rt = bdhere.w;
                let ds = dt * mix(kd, ks * rt, step(s, c)) * (s - c);
               
                tx01.data[offset] = vec4<f32>(
                    b + ds, d1, s - ds,
                    max(0.1, rt - dt * kh * ks * max(0.0, s - c))
                );
                tx02.data[offset] = newfxy * kdp;
                tx03.data[offset] = tx05.data[offset] * kdp;
                tx06.data[offset] = vec4<f32>(
                    w, c
                );
            }
            @compute @workgroup_size(8,8,4) 
            fn main3(@builtin(global_invocation_id) pos: vec3<u32>){
                if(pos.x >= tx05.size.x || pos.y >= tx01.size.y || pos.z >= tx06.size.z){
                    return;
                }
                let seed = uBlock.seed;
                let offset = pos.x + tx00.size.x*(pos.y + tx00.size.y*pos.z);
                let sizeX = i32(tx02.size.x);
                let sizeY = i32(tx03.size.y);
                let sizeZ = i32(tx04.size.z);
                let sizeXY = sizeX * sizeY;
                let sizeXYZ = sizeXY * sizeZ;
                var offsetxp: i32 = 1; if(pos.x == tx00.size.x - 1) { offsetxp -= sizeX; }
                var offsetxm: i32 = -1; if(pos.x == 0) { offsetxm +=  sizeX; }
                var offsetyp: i32 = sizeX; if(pos.y == tx00.size.y - 1) { offsetyp -= sizeXY; }
                var offsetym: i32 = -sizeX; if(pos.y == 0) { offsetym += sizeXY; }
                var offsetzp: i32 = sizeXY; if(pos.z == tx00.size.z - 1) { offsetzp -= sizeXYZ; }
                var offsetzm: i32 = -sizeXY; if(pos.z == 0) { offsetzm += sizeXYZ; }
                let bdsr = tx01.data[offset];
                let b = bdsr.x;

                let ioffset = i32(offset);
                let b_xm = tx01.data[ioffset + offsetxm].x;
                let b_xp = tx01.data[ioffset + offsetxp].x;
                let b_ym = tx01.data[ioffset + offsetym].x;
                let b_yp = tx01.data[ioffset + offsetyp].x;
                let b_zm = tx01.data[ioffset + offsetzm].x;
                let b_zp = tx01.data[ioffset + offsetzp].x;
                
                var hxm = b - b_xm;
                var hxp = b - b_xp;
                var hym = b - b_ym;
                var hyp = b - b_yp;
                var hzm = b - b_zm;
                var hzp = b - b_zp;

                let rt = bdsr.w;
                let tiltAngle = rt * ka + ki;

                hxm *= step(tiltAngle, hxm);
                hxp *= step(tiltAngle, hxp);
                hym *= step(tiltAngle, hym);
                hyp *= step(tiltAngle, hyp);
                hzm *= step(tiltAngle, hzm);
                hzp *= step(tiltAngle, hzp);

                let H = max(max(max(hxm,hxp),max(hym,hyp)),max(hzm,hzp));
                var sCoeff = H * dt * kt * rt * 0.5 / (hxm + hxp + hym + hyp + hzm + hzp);
                if( H == 0.0) {sCoeff = 0.0;}
                tx04.data[ioffset] = vec4<f32>(hxm, hxp, hym, hyp) * sCoeff;
                tx05.data[ioffset] = vec2<f32>(hzm, hzp) * sCoeff;
            }
            @compute @workgroup_size(8,8,4) 
            fn main4(@builtin(global_invocation_id) pos: vec3<u32>){
                if(pos.x >= tx01.size.x || pos.y >= tx06.size.y || pos.z >= tx00.size.z){
                    return;
                }
                let seed = uBlock.seed;
                let offset = pos.x + tx05.size.x*(pos.y + tx00.size.y*pos.z);
                let sizeX = i32(tx02.size.x);
                let sizeY = i32(tx03.size.y);
                let sizeZ = i32(tx00.size.z);
                let sizeXY = sizeX * sizeY;
                let sizeXYZ = sizeXY * sizeZ;
                var offsetxp: i32 = 1; if(pos.x == tx00.size.x - 1) { offsetxp -= sizeX; }
                var offsetxm: i32 = -1; if(pos.x == 0) { offsetxm +=  sizeX; }
                var offsetyp: i32 = sizeX; if(pos.y == tx00.size.y - 1) { offsetyp -= sizeXY; }
                var offsetym: i32 = -sizeX; if(pos.y == 0) { offsetym += sizeXY; }
                var offsetzp: i32 = sizeXY; if(pos.z == tx00.size.z - 1) { offsetzp -= sizeXYZ; }
                var offsetzm: i32 = -sizeXY; if(pos.z == 0) { offsetzm += sizeXYZ; }
                let bdsr = tx01.data[offset];
                let hxy = tx04.data[offset];
                let hz = tx05.data[offset];
                let b = bdsr.x; let d = bdsr.y;

                let ioffset = i32(offset);
                let hxm = tx04.data[ioffset + offsetxm].y;
                let hxp = tx04.data[ioffset + offsetxp].x;
                let hym = tx04.data[ioffset + offsetym].w;
                let hyp = tx04.data[ioffset + offsetyp].z;
                let hzm = tx05.data[ioffset + offsetzm].y;
                let hzp = tx05.data[ioffset + offsetzp].x;
                tx00.data[ioffset] = vec4<f32>(b + (
                        hxm + hxp + hym + hyp + hzm + hzp
                    ) - (
                        hxy.z + hxy.w + hxy.x + hxy.y + hz.x + hz.y
                    ),
                    bdsr.yzw
                );
            }
            `;
    const raytracingShaderCode = `
            struct Vec4Attachment{
                size: vec4<u32>,
                data: array<vec4<f32>> 
            }
            struct UniformBlock{
                seed: f32,
                water: f32,
                sediment: f32,
                terrainQ: f32,
                terrainCenter: f32,
                terrainOpacity: f32,
                padding1: f32,
                padding2: f32,
                rotMat: mat4x4<f32>,
                pos: vec4<f32>
            }
            @group(1) @binding(0) var<storage,read> tx00: Vec4Attachment;
            @group(1) @binding(1) var<storage,read> tx06: Vec4Attachment;
            @group(1) @binding(2) var<uniform> uBlock: UniformBlock;
            struct RayOutput{
                @location(0) position: vec3<f32>
            }
            @ray fn mainRay(@builtin(voxel_coord) position: vec3<f32>) -> RayOutput{
                return RayOutput(position);
            }
            @fragment fn mainFrag(@location(0) position: vec3<f32>) -> @location(0) vec4<f32>{
                let screenPos = uBlock.rotMat * vec4<f32>(position,0.0) + uBlock.pos;
                let pos = vec3<u32>(fract(screenPos.xyz * 0.5 + vec3<f32>(0.5)) * vec3<f32>(tx00.size.xyz));
                let offset = pos.x + tx00.size.x*(pos.y + tx00.size.y*pos.z);
                let bdsr = tx00.data[offset];
                let heightmap = bdsr.x * 0.05 * ${1 / heightscale} + 0.5;
                let heightColor = mix(mix(
                        mix(vec3<f32>(0.0, 0.8, 0.0), vec3<f32>(1.0, 1.0, 0.0), clamp(heightmap * 2, 0.0, 1.0)),
                        mix(vec3<f32>(1.0, 1.0, 0.0), vec3<f32>(0.8, 0.5, 0.4), clamp(heightmap * 2 - 1, 0.0, 1.0)),
                        step(0.5, heightmap)
                    ), mix(
                        mix(vec3<f32>(0.8, 0.5, 0.4), vec3<f32>(0.5, 0.5, 0.5), clamp(heightmap * 2 - 2, 0.0, 1.0)),
                        mix(vec3<f32>(0.5, 0.5, 0.5), vec3<f32>(1.0, 1.0, 1.0), clamp(heightmap * 2 - 3, 0.0, 1.0)),
                        step(1.5, heightmap)
                    ),
                    step(1.0, heightmap)
                );
                let s = bdsr.z;
                let v = length(tx06.data[offset].xyz) * 0.05;
                
                let waterColor = mix(vec3<f32>(0.0,0.0,1.0), vec3<f32>(1.0), v * 2.0);
                let watermap = bdsr.y * 2.0 * uBlock.water - v * 10.0;
                let terrainOpacityFactor = (heightmap * 0.5 - uBlock.terrainCenter) * uBlock.terrainQ;
                return vec4<f32>(
                    mix(
                        mix(heightColor, waterColor,
                            clamp(watermap, 0.0, 1.0)
                        ),
                    vec3<f32>(1.0,0.0,0.0), vec3<f32>(clamp(uBlock.sediment * tx06.data[offset].w * 30.0,0.0,1.0))),
                    clamp(watermap - v * 10.0 * ${erosionRate}, uBlock.terrainOpacity / (1 + terrainOpacityFactor*terrainOpacityFactor), 1.0)
                    
                );
            }
            `;
    const device = gpu.device;
    let computeModule = device.createShaderModule({ code: computeCode });
    const computePipelineInit = await device.createComputePipelineAsync({
        compute: {
            module: computeModule,
            entryPoint: "init"
        },
        layout: "auto"
    });
    const computePipeline1 = await device.createComputePipelineAsync({
        compute: {
            module: computeModule,
            entryPoint: "main1"
        },
        layout: "auto", label: "main1"
    });
    const computePipeline2 = await device.createComputePipelineAsync({
        compute: {
            module: computeModule,
            entryPoint: "main2"
        },
        layout: "auto", label: "main2"
    });
    const computePipeline3 = await device.createComputePipelineAsync({
        compute: {
            module: computeModule,
            entryPoint: "main3"
        },
        layout: "auto", label: "main3"
    });
    const computePipeline4 = await device.createComputePipelineAsync({
        compute: {
            module: computeModule,
            entryPoint: "main4"
        },
        layout: "auto", label: "main4"
    });
    let uBlockJsBuffer = new Float32Array(28);
    let uBlockBuffer = gpu.createBuffer(GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM, uBlockJsBuffer);
    const bufferlist = [
        { buffer: tx00.buffer },
        { buffer: tx01.buffer },
        { buffer: tx02.buffer },
        { buffer: tx03.buffer },
        { buffer: tx04.buffer },
        { buffer: tx05.buffer },
        { buffer: tx06.buffer },
        { buffer: uBlockBuffer },
    ];
    const computeBindgroupInit = gpu.createBindGroup(computePipelineInit, 0, bufferlist, "gi");
    const computeBindgroup1 = gpu.createBindGroup(computePipeline1, 0, bufferlist, "g1");
    const computeBindgroup2 = gpu.createBindGroup(computePipeline2, 0, bufferlist, "g2");
    const computeBindgroup3 = gpu.createBindGroup(computePipeline3, 0, bufferlist, "g3");
    const computeBindgroup4 = gpu.createBindGroup(computePipeline4, 0, bufferlist, "g4");
    const canvas = document.getElementById("gpu-canvas");
    const context = gpu.getContext(canvas);
    const renderer = await new tesserxel.render.SliceRenderer().init(gpu, context);
    renderer.setOpacity(20);
    renderer.setSliceConfig({ layers: 96 });
    const pipeline = await renderer.createRaytracingPipeline({
        code: raytracingShaderCode,
        rayEntryPoint: "mainRay",
        fragmentEntryPoint: "mainFrag"
    });
    const renderBindgroup = gpu.createBindGroup(pipeline.pipeline, 1, [
        { buffer: tx00.buffer },
        { buffer: tx06.buffer },
        { buffer: uBlockBuffer },
    ], "renderBindgroup");
    let retinaCtrl = new tesserxel.util.ctrl.RetinaController(renderer);
    // retinaCtrl.keyConfig.enable = "";
    // retinaCtrl.toggleSectionConfig("zsection");
    // retinaCtrl.setStereo(false);
    let displayCtrl = new ErosionDisplayController(uBlockJsBuffer);
    let viewObj = new tesserxel.math.Obj4(new tesserxel.math.Vec4, new tesserxel.math.Rotor, new tesserxel.math.Vec4(1, 1, 1, 1));
    let viewCtrl = new tesserxel.util.ctrl.VoxelViewerController(viewObj);
    let ctrlReg = new tesserxel.util.ctrl.ControllerRegistry(canvas, [
        retinaCtrl, displayCtrl, viewCtrl
    ], { requestPointerLock: true });
    function setSize() {
        const width = window.innerWidth * window.devicePixelRatio;
        const height = window.innerHeight * window.devicePixelRatio;
        canvas.width = width;
        canvas.height = height;
        renderer.setSize({ width, height });
    }
    setSize();
    window.addEventListener("resize", setSize);
    let init = true;
    let viewAffine = new tesserxel.math.AffineMat4;
    function dispatch() {
        let dispatchSize = [
            Math.ceil(tx00.width / 8),
            Math.ceil(tx00.height / 8),
            Math.ceil(tx00.depth / 4)
        ];
        let commandEncoder = device.createCommandEncoder();
        let passEncoder = commandEncoder.beginComputePass();
        viewAffine.setFromObj4(viewObj).writeBuffer(uBlockJsBuffer, 8);
        if (init) {
            passEncoder.setPipeline(computePipelineInit);
            passEncoder.setBindGroup(0, computeBindgroupInit);
            passEncoder.dispatchWorkgroups(...dispatchSize);
        }
        device.queue.writeBuffer(uBlockBuffer, 0, uBlockJsBuffer);
        init = false;
        passEncoder.setPipeline(computePipeline1);
        passEncoder.setBindGroup(0, computeBindgroup1);
        passEncoder.dispatchWorkgroups(...dispatchSize);
        passEncoder.setPipeline(computePipeline2);
        passEncoder.setBindGroup(0, computeBindgroup2);
        passEncoder.dispatchWorkgroups(...dispatchSize);
        passEncoder.setPipeline(computePipeline3);
        passEncoder.setBindGroup(0, computeBindgroup3);
        passEncoder.dispatchWorkgroups(...dispatchSize);
        passEncoder.setPipeline(computePipeline4);
        passEncoder.setBindGroup(0, computeBindgroup4);
        passEncoder.dispatchWorkgroups(...dispatchSize);
        passEncoder.end();
        device.queue.submit([commandEncoder.finish()]);
    }
    function loop() {
        ctrlReg.update();
        dispatch();
        renderer.render(() => {
            renderer.drawRaytracing(pipeline, [renderBindgroup]);
        });
        // if(step > 100) return;
        window.requestAnimationFrame(loop);
    }
    loop();
}
// }

export { coriolis, erosion, river_evolution, wave_eq };
//# sourceMappingURL=pde.js.map
