namespace examples {
    export namespace wave_eq {
        export async function load() {
            const gpu = await tesserxel.renderer.createGPU();
            let resolution = [300, 300, 300];
            let bufferA = tesserxel.renderer.createVoxelBuffer(gpu, resolution, 1);
            let bufferB = tesserxel.renderer.createVoxelBuffer(gpu, resolution, 1);
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







            const canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
            const context = gpu.getContext(canvas);
            const renderer = await new tesserxel.renderer.SliceRenderer().init(gpu, context);
            renderer.setOpacity(12);
            const pipeline = await renderer.createRaytracingPipeline({
                code: raytracingShaderCode,
                rayEntryPoint: "mainRay",
                fragmentEntryPoint: "mainFrag"
            });
            const renderBindgroup = gpu.createBindGroup(pipeline.pipeline, 1, [
                { buffer: bufferA.buffer }
            ]);
            let retinaCtrl = new tesserxel.controller.RetinaController(renderer);
            retinaCtrl.keyConfig.enable = "";
            let ctrlReg = new tesserxel.controller.ControllerRegistry(canvas, [retinaCtrl]);

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
                    passEncoder.dispatchWorkgroups(
                        Math.ceil(bufferA.width / 8),
                        Math.ceil(bufferA.height / 8),
                        Math.ceil(bufferA.depth / 4),
                    );
                    passEncoder.setBindGroup(0, computeBindgroup2);
                    passEncoder.dispatchWorkgroups(
                        Math.ceil(bufferA.width / 8),
                        Math.ceil(bufferA.height / 8),
                        Math.ceil(bufferA.depth / 4),
                    );
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
    }

    class ErosionDisplayController implements tesserxel.controller.IController {
        water: number = 1;
        height: number = 0.5;
        sediment: number = 0;
        enabled: boolean = true;
        buffer: Float32Array;
        constructor(jsBuffer: Float32Array){
            this.buffer = jsBuffer;
        }
        update(state: tesserxel.controller.ControllerState) {
            if(state.isKeyHold("KeyO")){
                this.water = 0;
            }
            if(state.isKeyHold(".KeyL")){
                this.water = 1;
            }
            if(state.isKeyHold("KeyL")){
                this.water += 1.9;
            }
            if(state.isKeyHold("KeyI")){
                this.sediment = 0;
            }
            if(state.isKeyHold("KeyK")){
                this.sediment = 10000;
            }
            if(state.isKeyHold("KeyM")){
                this.sediment = -10000;
            }
            if(state.isKeyHold("KeyU")){
                this.height = 0.5;
            }
            if(state.isKeyHold("KeyJ")){
                this.height = 1;
            }
            this.buffer[2] = this.water;
            this.buffer[3] = this.sediment;
            this.buffer[4] = this.height;
        }

    }
    export namespace erosion {
        export async function load() {
            const gpu = await tesserxel.renderer.createGPU();
            let resolution = [200, 200, 200];
            // vec4< b | d, fxm | fxp, fym | fyp, fzm | fzp >
            let bufferA = tesserxel.renderer.createVoxelBuffer(gpu, resolution, 4);
            // vec4< b | d, fxm | fxp, fym | fyp, fzm | fzp >
            let bufferB = tesserxel.renderer.createVoxelBuffer(gpu, resolution, 4);
            // vec4< v | s, >
            let bufferC = tesserxel.renderer.createVoxelBuffer(gpu, resolution, 4);
            const packFCoeff = 1;
            let computeCode = tesserxel.four.NoiseWGSLHeader + `
            struct Vec4Attachment{
                size: vec4<u32>,
                data: array<vec4<u32>> 
            }
            struct UniformBlock{
                time: f32,
                dt: f32,
            }
            @group(0) @binding(0) var<storage,read_write> input: Vec4Attachment;
            @group(0) @binding(1) var<storage,read_write> output: Vec4Attachment;
            @group(0) @binding(2) var<uniform> uBlock: UniformBlock;
            @group(0) @binding(3) var<storage,read_write> temp: Vec4Attachment;
            const l = 1.0 / ${resolution[0]};
            const flux_coeff = 556.1;
            const rainRate = 0.001;
            const evaporationRate = 0.1;
            const kc = 0.02;
            const ks = 0.0001;
            const kd = 0.0001;
            const kav = 10000.0;
            const kt = 0.0;
            const kdp = 0.5;
            const tiltAngle = 5.5 / ${resolution[0]};

            const packFCoeff = ${packFCoeff};
            
            @compute @workgroup_size(8,8,4) 
            fn init(@builtin(global_invocation_id) pos: vec3<u32>){
                if(pos.x >= input.size.x || pos.y >= input.size.y || pos.z >= input.size.z){
                    return;
                }
                let offset = pos.x + input.size.x*(pos.y + input.size.y*pos.z);
                let coord = vec3<f32>(pos) / vec3<f32>(input.size.xyz) - vec3<f32>(0.5);
                input.data[offset].x = pack2x16float(vec2<f32>(
                    // snoise(vec3(coord.xy,0.2)) + 0.4 * snoise(vec3(coord.xy * 2.0,0.5)) + 0.15 * snoise(vec3(coord.xy * 4.0,0.2)) + 0.07 * snoise(vec3(coord.xy * 8.0,0.2))+ 0.03 * snoise(vec3(coord.xy * 16.0,0.2)) + 0.5,
                    snoise(coord*1.0) + 0.4 * snoise(coord * 2.0) + 0.2 * snoise(coord * 4.0) + 0.05 * snoise(coord * 8.0) + 0.02 * snoise(coord * 16.0),
                    // snoise(coord*2.0) + 0.5 * snoise(coord * 4.0) + 0.25 * snoise(coord * 8.0) + 0.125 * snoise(coord * 16.0),
                    // min(0.25,dot(coord,coord)),
                    // dot(coord,coord) - cos(coord.x*15.0)*cos(coord.y*15.0)*cos(coord.z*15.0)*0.08,
                    // 0.5,
                    // min(0.25,dot(coord.xy,coord.xy))*4.0,
                    // (dot(coord.xy,coord.xy) - cos(coord.x*15.0)*cos(coord.y*15.0)*0.08 + 0.1) * 3.0,
                0.0) * 5.0* packFCoeff);
                let t = uBlock.time;
                let s1 = output.size;
                let s2 = temp.size;
                temp.data[offset].y = pack2x16float(vec2<f32>(0.0,clamp(0.0, 0.001, cos(coord.x*80.0)*cos(coord.y*80.0)*0.0)));
            }
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
                let here = input.data[offset];

                let b_d = unpack2x16float(here.x) / packFCoeff;
                let b = b_d.x; let d = b_d.y;
                let waterh = b + d;

                let ioffset = i32(offset);
                let b_dxm = unpack2x16float(input.data[ioffset + offsetxm].x) / packFCoeff;
                let b_dxp = unpack2x16float(input.data[ioffset + offsetxp].x) / packFCoeff;
                let b_dym = unpack2x16float(input.data[ioffset + offsetym].x) / packFCoeff;
                let b_dyp = unpack2x16float(input.data[ioffset + offsetyp].x) / packFCoeff;
                let b_dzm = unpack2x16float(input.data[ioffset + offsetzm].x) / packFCoeff;
                let b_dzp = unpack2x16float(input.data[ioffset + offsetzp].x) / packFCoeff;

                var fxy = vec4<f32>(unpack2x16float(here.y), unpack2x16float(here.z)) / packFCoeff;
                fxy = max(vec4<f32>(0.0), fxy + flux_coeff *dt * (
                    vec4(waterh) - vec4(b_dxm.x, b_dxp.x, b_dym.x, b_dyp.x) - vec4(b_dxm.y, b_dxp.y, b_dym.y, b_dyp.y)
                ) - kdp * fxy *dt);
                
                var fz = vec2<f32>(unpack2x16float(here.w)) / packFCoeff;
                fz = max(vec2<f32>(0.0), fz + flux_coeff *dt  * (
                    vec2(waterh) - vec2(b_dzm.x, b_dzp.x) - vec2(b_dzm.y, b_dzp.y)
                ) - kdp * fz *dt);

                let flux_out = fxy.x + fxy.y + fxy.z + fxy.w + fz.x + fz.y;
                let fluxK = min(1.0, d / (dt * flux_out + 0.000001));
                fxy *= fluxK; fz *= fluxK;
                output.data[offset].x = here.x;
                output.data[offset].y = pack2x16float(fxy.xy * packFCoeff);
                output.data[offset].z = pack2x16float(fxy.zw * packFCoeff);
                output.data[offset].w = pack2x16float(fz * packFCoeff);
            }
            @compute @workgroup_size(8,8,4) 
            fn main2(@builtin(global_invocation_id) pos: vec3<u32>){
                if(pos.x >= input.size.x || pos.y >= input.size.y || pos.z >= input.size.z){
                    return;
                }
                let dt = uBlock.dt;
                let offset = pos.x + input.size.x*(pos.y + input.size.y*pos.z);
                let sizeX = i32(input.size.x);
                let sizeY = i32(input.size.y);
                let sizeZ = i32(input.size.z);
                let sizeXY = sizeX * sizeY;
                let sizeXYZ = sizeXY * sizeZ;
                var offsetxp: i32 = 1; if(pos.x == input.size.x - 1) { offsetxp -= sizeX; }
                var offsetxm: i32 = -1; if(pos.x == 0) { offsetxm +=  sizeX; }
                var offsetyp: i32 = sizeX; if(pos.y == input.size.y - 1) { offsetyp -= sizeXY; }
                var offsetym: i32 = -sizeX; if(pos.y == 0) { offsetym += sizeXY; }
                var offsetzp: i32 = sizeXY; if(pos.z == input.size.z - 1) { offsetzp -= sizeXYZ; }
                var offsetzm: i32 = -sizeXY; if(pos.z == 0) { offsetzm += sizeXYZ; }
                let here = input.data[offset];

                let b_d = unpack2x16float(here.x) / packFCoeff;
                let b = b_d.x; let d = b_d.y;
                let waterh = b + d;

                let ioffset = i32(offset);
                let data_xm = input.data[ioffset + offsetxm];
                let data_xp = input.data[ioffset + offsetxp];
                let data_ym = input.data[ioffset + offsetym];
                let data_yp = input.data[ioffset + offsetyp];
                let data_zm = input.data[ioffset + offsetzm];
                let data_zp = input.data[ioffset + offsetzp];

                let f_xm = unpack2x16float(data_xm.y);
                let f_xp = unpack2x16float(data_xp.y);
                let f_ym = unpack2x16float(data_ym.z);
                let f_yp = unpack2x16float(data_yp.z);
                let f_zm = unpack2x16float(data_zm.w);
                let f_zp = unpack2x16float(data_zp.w);
                
                let b_dxm = unpack2x16float(data_xm.x) / packFCoeff;
                let b_dxp = unpack2x16float(data_xp.x) / packFCoeff;
                let b_dym = unpack2x16float(data_ym.x) / packFCoeff;
                let b_dyp = unpack2x16float(data_yp.x) / packFCoeff;
                let b_dzm = unpack2x16float(data_zm.x) / packFCoeff;
                let b_dzp = unpack2x16float(data_zp.x) / packFCoeff;

                let fxy = vec4<f32>(unpack2x16float(here.y), unpack2x16float(here.z));
                let fz = vec2<f32>(unpack2x16float(here.w));
                let flux_out = fxy.x + fxy.y + fxy.z + fxy.w + fz.x + fz.y;
                let flux_in = f_xm.y + f_xp.x + f_ym.y + f_yp.x + f_zm.y + f_zp.x;
                var d1 = d + dt * (flux_in - flux_out) / (packFCoeff);
                d1 += dt * (rainRate - d1 * evaporationRate);
                let w = vec3(
                    fxy.y - fxy.x + f_xm.y - f_xp.x,
                    fxy.w - fxy.z + f_ym.y - f_yp.x,
                    fz.y - fz.x + f_zm.y - f_zp.x,
                ) / (packFCoeff);
                let v = length(w);
                let N = normalize(vec4(b_dxp.x,b_dyp.x,b_dzp.x,l * 2.0) - vec4(b_dxm.x,b_dym.x,b_dzm.x,0.0));
                let waterN = normalize(
                    vec4(b_dxp.x + b_dxp.y, b_dyp.x + b_dyp.y, b_dzp.x + b_dzp.y, l * 0.020) - 
                    vec4(b_dxm.x + b_dxm.y, b_dym.x + b_dym.y, b_dzm.x + b_dzm.y, 0.0)
                );
                let V = vec4(w,dot(waterN.xyz,w));
                // let c = max(0.0, kc * v * ( - dot(N, V)));   
                let c = max(0.0, kc * v * (1.0 - waterN.w));
                // let c = max(0.0, kc * (b + 0.3) );

                // avocation

                let avoc = vec3<f32>(pos) - w * dt * kav / (d + d1);
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
                            unpack2x16float(temp.data[ammmoffset].y).y,
                            unpack2x16float(temp.data[ammmoffset + offsetxp].y).y,
                            a3.x
                        ),
                        mix(
                            unpack2x16float(temp.data[ammmoffset + offsetyp].y).y,
                            unpack2x16float(temp.data[ammmoffset + offsetyp + offsetxp].y).y,
                            a3.x
                        ),
                        a3.y
                    ),
                    mix(
                        mix(
                            unpack2x16float(temp.data[ammmoffset + offsetzp].y).y,
                            unpack2x16float(temp.data[ammmoffset + offsetzp + offsetxp].y).y,
                            a3.x
                        ),
                        mix(
                            unpack2x16float(temp.data[ammmoffset + offsetzp + offsetyp].y).y,
                            unpack2x16float(temp.data[ammmoffset + offsetzp + offsetyp + offsetxp].y).y,
                            a3.x
                        ),
                        a3.y
                    ),
                    a3.z
                ) / packFCoeff;
                let ds = dt * mix(ks, kd, step(s, c)) * (s - c);
                
                output.data[ioffset] = vec4<u32>(
                    pack2x16float(vec2<f32>(b + ds, d1 - ds) * packFCoeff),
                    here.yzw
                );

                temp.data[ioffset].x = pack2x16float(vec2<f32>(v, (s - ds))*packFCoeff);
                // temp.data[ioffset].x = pack2x16float(vec2<f32>(v,s));
            }
            @compute @workgroup_size(8,8,4) 
            fn main3(@builtin(global_invocation_id) pos: vec3<u32>){
                if(pos.x >= input.size.x || pos.y >= input.size.y || pos.z >= input.size.z){
                    return;
                }
                let dt = uBlock.dt;
                let offset = pos.x + input.size.x*(pos.y + input.size.y*pos.z);
                let sizeX = i32(input.size.x);
                let sizeY = i32(input.size.y);
                let sizeZ = i32(input.size.z);
                let sizeXY = sizeX * sizeY;
                let sizeXYZ = sizeXY * sizeZ;
                var offsetxp: i32 = 1; if(pos.x == input.size.x - 1) { offsetxp -= sizeX; }
                var offsetxm: i32 = -1; if(pos.x == 0) { offsetxm +=  sizeX; }
                var offsetyp: i32 = sizeX; if(pos.y == input.size.y - 1) { offsetyp -= sizeXY; }
                var offsetym: i32 = -sizeX; if(pos.y == 0) { offsetym += sizeXY; }
                var offsetzp: i32 = sizeXY; if(pos.z == input.size.z - 1) { offsetzp -= sizeXYZ; }
                var offsetzm: i32 = -sizeXY; if(pos.z == 0) { offsetzm += sizeXYZ; }
                let here = input.data[offset];

                let b = unpack2x16float(here.x).x / packFCoeff;

                let ioffset = i32(offset);
                let data_xm = input.data[ioffset + offsetxm];
                let data_xp = input.data[ioffset + offsetxp];
                let data_ym = input.data[ioffset + offsetym];
                let data_yp = input.data[ioffset + offsetyp];
                let data_zm = input.data[ioffset + offsetzm];
                let data_zp = input.data[ioffset + offsetzp];
                
                var hxm = b - unpack2x16float(data_xm.x).x / packFCoeff;
                var hxp = b - unpack2x16float(data_xp.x).x / packFCoeff;
                var hym = b - unpack2x16float(data_ym.x).x / packFCoeff;
                var hyp = b - unpack2x16float(data_yp.x).x / packFCoeff;
                var hzm = b - unpack2x16float(data_zm.x).x / packFCoeff;
                var hzp = b - unpack2x16float(data_zp.x).x / packFCoeff;

                hxm *= smoothstep(tiltAngle * 0.5, tiltAngle, hxm);
                hxp *= smoothstep(tiltAngle * 0.5, tiltAngle, hxp);
                hym *= smoothstep(tiltAngle * 0.5, tiltAngle, hym);
                hyp *= smoothstep(tiltAngle * 0.5, tiltAngle, hyp);
                hzm *= smoothstep(tiltAngle * 0.5, tiltAngle, hzm);
                hzp *= smoothstep(tiltAngle * 0.5, tiltAngle, hzp);

                let H = max(max(max(hxm,hxp),max(hym,hyp)),max(hzm,hzp));
                var sCoeff = H * dt * kt / (hxm + hxp + hym + hyp + hzm + hzp) * packFCoeff;
                if( H == 0.0) {sCoeff = 0.0;}
                output.data[ioffset].x = input.data[ioffset].x;
                temp.data[ioffset].y = temp.data[ioffset].x;

                output.data[ioffset].y = pack2x16float(sCoeff * vec2<f32>(hxm, hxp));
                output.data[ioffset].z = pack2x16float(sCoeff * vec2<f32>(hym, hyp));
                output.data[ioffset].w = pack2x16float(sCoeff * vec2<f32>(hzm, hzp));
            }
            @compute @workgroup_size(8,8,4) 
            fn main4(@builtin(global_invocation_id) pos: vec3<u32>){
                if(pos.x >= input.size.x || pos.y >= input.size.y || pos.z >= input.size.z){
                    return;
                }
                let dt = uBlock.dt;
                let offset = pos.x + input.size.x*(pos.y + input.size.y*pos.z);
                let sizeX = i32(input.size.x);
                let sizeY = i32(input.size.y);
                let sizeZ = i32(input.size.z);
                let sizeXY = sizeX * sizeY;
                let sizeXYZ = sizeXY * sizeZ;
                var offsetxp: i32 = 1; if(pos.x == input.size.x - 1) { offsetxp -= sizeX; }
                var offsetxm: i32 = -1; if(pos.x == 0) { offsetxm +=  sizeX; }
                var offsetyp: i32 = sizeX; if(pos.y == input.size.y - 1) { offsetyp -= sizeXY; }
                var offsetym: i32 = -sizeX; if(pos.y == 0) { offsetym += sizeXY; }
                var offsetzp: i32 = sizeXY; if(pos.z == input.size.z - 1) { offsetzp -= sizeXYZ; }
                var offsetzm: i32 = -sizeXY; if(pos.z == 0) { offsetzm += sizeXYZ; }
                let here = input.data[offset];

                let b_d = unpack2x16float(here.x);
                let b = b_d.x; let d = b_d.y;

                let ioffset = i32(offset);
                let data_xm = input.data[ioffset + offsetxm];
                let data_xp = input.data[ioffset + offsetxp];
                let data_ym = input.data[ioffset + offsetym];
                let data_yp = input.data[ioffset + offsetyp];
                let data_zm = input.data[ioffset + offsetzm];
                let data_zp = input.data[ioffset + offsetzp];

                let out_x = unpack2x16float(here.y);
                let out_y = unpack2x16float(here.z);
                let out_z = unpack2x16float(here.w);

                let hxm = unpack2x16float(data_xm.y).y;
                let hxp = unpack2x16float(data_xp.y).x;
                let hym = unpack2x16float(data_ym.z).y;
                let hyp = unpack2x16float(data_yp.z).x;
                let hzm = unpack2x16float(data_zm.w).y;
                let hzp = unpack2x16float(data_zp.w).x;
                output.data[ioffset].x = pack2x16float(vec2<f32>(
                    b + (hxm + hxp + hym + hyp + hzm + hzp) - (out_x.x + out_x.y + out_y.x + out_y.y + out_z.x + out_z.y), d
                ));
            }
            `;
            const raytracingShaderCode = `
            const packFCoeff = ${packFCoeff};
            struct Vec4Attachment{
                size: vec4<u32>,
                data: array<vec4<u32>>
            }
            struct UniformBlock{
                time: f32,
                dt: f32,
                water: f32,
                sediment: f32,
                height: f32,
            }
            @group(1) @binding(0) var<storage,read> input: Vec4Attachment;
            @group(1) @binding(1) var<storage,read> temp: Vec4Attachment;
            @group(1) @binding(2) var<uniform> uBlock: UniformBlock;
            struct RayOutput{
                @location(0) position: vec3<f32>
            }
            @ray fn mainRay(@builtin(voxel_coord) position: vec3<f32>) -> RayOutput{
                return RayOutput(position);
            }
            @fragment fn mainFrag(@location(0) position: vec3<f32>) -> @location(0) vec4<f32>{
                let pos = vec3<u32>((position * 0.5 + vec3<f32>(0.5)) * vec3<f32>(input.size.xyz));
                let offset = pos.x + input.size.x*(pos.y + input.size.y*pos.z);
                let b_d = unpack2x16float(input.data[offset].x) / packFCoeff;
                let heightmap = (b_d.x *0.3+0.5) * uBlock.height;
                let watermap = b_d.y * 90.0 * uBlock.water ;
                let heightColor = mix(
                    mix(vec3<f32>(0.0, 0.8, 0.0), vec3<f32>(1.0, 1.0, 0.0), clamp(heightmap * 2, 0.0, 1.0)),
                    mix(vec3<f32>(1.0, 1.0, 0.0), vec3<f32>(0.8, 0.5, 0.4), clamp(heightmap * 2 - 1, 0.0, 1.0)),
                    step(0.5, heightmap)
                );
                let waterColor = mix(vec3<f32>(0.0,0.0,1.0), vec3<f32>(1.0), 0.3*clamp(unpack2x16float(temp.data[offset].x).x,0.0,1.0));
                return vec4<f32>(
                    mix(
                        mix(heightColor, waterColor,
                            clamp(watermap, 0.0, 1.0)
                        )
                    ,vec3<f32>(1.0,0.0,0.0), vec3<f32>(clamp(0.0 * uBlock.sediment * unpack2x16float(temp.data[offset].x).x,0.0,1.0))),
                    clamp(watermap *4.0 , 0.0, 1.0)
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
                layout: "auto"
            });
            const computePipeline2 = await device.createComputePipelineAsync({
                compute: {
                    module: computeModule,
                    entryPoint: "main2"
                },
                layout: "auto"
            });
            const computePipeline3 = await device.createComputePipelineAsync({
                compute: {
                    module: computeModule,
                    entryPoint: "main3"
                },
                layout: "auto"
            });
            const computePipeline4 = await device.createComputePipelineAsync({
                compute: {
                    module: computeModule,
                    entryPoint: "main4"
                },
                layout: "auto"
            });
            let uBlockJsBuffer = new Float32Array(5);
            let uBlockBuffer = gpu.createBuffer(GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM, uBlockJsBuffer);
            const computeBindgroupInit = gpu.createBindGroup(computePipelineInit, 0, [
                { buffer: bufferA.buffer },
                { buffer: bufferB.buffer },
                { buffer: uBlockBuffer },
                { buffer: bufferC.buffer },
            ]);
            const computeBindgroup1 = gpu.createBindGroup(computePipeline1, 0, [
                { buffer: bufferA.buffer },
                { buffer: bufferB.buffer },
                { buffer: uBlockBuffer },
            ]);
            const computeBindgroup2 = gpu.createBindGroup(computePipeline2, 0, [
                { buffer: bufferB.buffer },
                { buffer: bufferA.buffer },
                { buffer: uBlockBuffer },
                { buffer: bufferC.buffer },
            ]);


            const computeBindgroup3 = gpu.createBindGroup(computePipeline3, 0, [
                { buffer: bufferA.buffer },
                { buffer: bufferB.buffer },
                { buffer: uBlockBuffer },
                { buffer: bufferC.buffer },
            ]);
            const computeBindgroup4 = gpu.createBindGroup(computePipeline4, 0, [
                { buffer: bufferB.buffer },
                { buffer: bufferA.buffer },
                { buffer: uBlockBuffer },
            ]);





            const canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
            const context = gpu.getContext(canvas);
            const renderer = await new tesserxel.renderer.SliceRenderer().init(gpu, context);
            renderer.setOpacity(20);
            renderer.setSliceConfig({layers: 96});
            const pipeline = await renderer.createRaytracingPipeline({
                code: raytracingShaderCode,
                rayEntryPoint: "mainRay",
                fragmentEntryPoint: "mainFrag"
            });
            const renderBindgroup = gpu.createBindGroup(pipeline.pipeline, 1, [
                { buffer: bufferA.buffer },
                { buffer: bufferC.buffer },
                { buffer: uBlockBuffer },
            ]);
            let retinaCtrl = new tesserxel.controller.RetinaController(renderer);
            retinaCtrl.keyConfig.enable = "";
            let displayCtrl = new ErosionDisplayController(uBlockJsBuffer);
            let ctrlReg = new tesserxel.controller.ControllerRegistry(canvas, [
                retinaCtrl, displayCtrl
            ]);

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
            let init = true;
            function dispatch() {
                let dispatchSize: [number, number, number] = [
                    Math.ceil(bufferA.width / 8),
                    Math.ceil(bufferA.height / 8),
                    Math.ceil(bufferA.depth / 4)
                ];
                let commandEncoder = device.createCommandEncoder();
                let passEncoder = commandEncoder.beginComputePass();
                let step = 1;
                let dt = 1 / 60 / step / 6;
                uBlockJsBuffer[1] = dt;
                if (init) {
                    init = false;
                    passEncoder.setPipeline(computePipelineInit);
                    passEncoder.setBindGroup(0, computeBindgroupInit);
                    passEncoder.dispatchWorkgroups(...dispatchSize);
                }
                for (let i = 0; i < step; i++) {
                    t += dt;
                    uBlockJsBuffer[0] = (Math.sin(t * 4));
                    device.queue.writeBuffer(uBlockBuffer, 0, uBlockJsBuffer);
                    if (!init) {
                        passEncoder.setPipeline(computePipeline3);
                        passEncoder.setBindGroup(0, computeBindgroup3);
                        passEncoder.dispatchWorkgroups(...dispatchSize);
                        passEncoder.setPipeline(computePipeline4);
                        passEncoder.setBindGroup(0, computeBindgroup4);
                        passEncoder.dispatchWorkgroups(...dispatchSize);
                    }
                    passEncoder.setPipeline(computePipeline1);
                    passEncoder.setBindGroup(0, computeBindgroup1);
                    passEncoder.dispatchWorkgroups(...dispatchSize);
                    passEncoder.setPipeline(computePipeline2);
                    passEncoder.setBindGroup(0, computeBindgroup2);
                    passEncoder.dispatchWorkgroups(...dispatchSize);
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
    }
}