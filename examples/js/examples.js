"use strict";
var examples;
(function (examples) {
    let city_highway;
    (function (city_highway) {
        const vec4 = tesserxel.math.Vec4;
        const vec3 = tesserxel.math.Vec3;
        const directionalLight_dir = "1.0,1.2,1.0,1.0";
        function genRoad() {
            const xLanes = 3;
            const yLanes = 4;
            const laneSide = 0.14;
            const lineWidthHalf = 0.01;
            const roadWidth = xLanes / (1 - 2 * laneSide);
            const roadHeight = yLanes / (1 - 2 * laneSide);
            const rw2 = roadWidth * 2;
            const fenceHeight = 0.4;
            const separatorHeight = 0.9;
            const fenceWidthHalf = 0.12;
            // let p = [];
            // let q = [];
            // for(let i=0;i<100;i++){
            //     p.push(new vec4(Math.cos(i*0.3)*10 - 10,0,Math.sin(i*0.3)*10,i*0.5).mulfs(2));
            //     q.push(new vec4(-Math.sin(i*0.3)*0.3*10,0,Math.cos(i*0.3)*0.3*10,0.5).mulfs(2));
            // }
            // let path = new tesserxel.math.Spline(p,q);
            let edge = 40;
            let deri = 30;
            let path = new tesserxel.math.Spline([
                new vec4(0, 0, 0, 0),
                new vec4(0, 0, 0, edge),
                new vec4(edge, 0, 0, edge),
                new vec4(edge, 0, edge, edge),
                new vec4(edge, 0, edge, 0),
                new vec4(0, 0, edge, 0),
                new vec4(0, 0, 0, 0),
            ], [
                new vec4(0, 0, -deri, deri),
                new vec4(deri, 0, 0, deri),
                new vec4(deri, 0, deri, 0),
                new vec4(0, 0, deri, -deri),
                new vec4(-deri, 0, 0, -deri),
                new vec4(-deri, 0, -deri, 0),
                new vec4(0, 0, -deri, deri),
            ]);
            let fenceCrossSection = {
                quad: {
                    position: new Float32Array([
                        0, fenceHeight, yLanes, 0,
                        0, fenceHeight, -yLanes, 0,
                        0, separatorHeight, -yLanes, 0,
                        0, separatorHeight, yLanes, 0,
                    ]),
                    uv: new Float32Array([
                        2, 1, -1, 0,
                        2, 1, 1, 0,
                        2, -1, 1, 0,
                        2, -1, -1, 0,
                    ]),
                    normal: new Float32Array([
                        1, 0, 0, 0,
                        1, 0, 0, 0,
                        1, 0, 0, 0,
                        1, 0, 0, 0,
                    ])
                }
            };
            let crossSection = {
                quad: {
                    position: new Float32Array([
                        rw2, 0, -roadHeight, 0,
                        rw2, 0, roadHeight, 0,
                        -rw2, 0, roadHeight, 0,
                        -rw2, 0, -roadHeight, 0,
                        -fenceWidthHalf, 0, -yLanes, 0,
                        -fenceWidthHalf, 0, yLanes, 0,
                        -fenceWidthHalf, fenceHeight, yLanes, 0,
                        -fenceWidthHalf, fenceHeight, -yLanes, 0,
                        fenceWidthHalf, fenceHeight, -yLanes, 0,
                        fenceWidthHalf, fenceHeight, yLanes, 0,
                        fenceWidthHalf, 0, yLanes, 0,
                        fenceWidthHalf, 0, -yLanes, 0,
                        fenceWidthHalf, fenceHeight, -yLanes, 0,
                        fenceWidthHalf, fenceHeight, yLanes, 0,
                        -fenceWidthHalf, fenceHeight, yLanes, 0,
                        -fenceWidthHalf, fenceHeight, -yLanes, 0,
                    ]),
                    uv: new Float32Array([
                        0, 1, -1, 0,
                        0, 1, 1, 0,
                        0, -1, 1, 0,
                        0, -1, -1, 0,
                        1, 1, -1, 0,
                        1, 1, 1, 0,
                        1, -1, 1, 0,
                        1, -1, -1, 0,
                        1, -1, -1, 0,
                        1, -1, 1, 0,
                        1, 1, 1, 0,
                        1, 1, -1, 0,
                        1, 1, -1, 0,
                        1, 1, 1, 0,
                        1, -1, 1, 0,
                        1, -1, -1, 0,
                    ]),
                    normal: new Float32Array([
                        0, 1, 0, 0,
                        0, 1, 0, 0,
                        0, 1, 0, 0,
                        0, 1, 0, 0,
                        -1, 0, 0, 0,
                        -1, 0, 0, 0,
                        -1, 0, 0, 0,
                        -1, 0, 0, 0,
                        1, 0, 0, 0,
                        1, 0, 0, 0,
                        1, 0, 0, 0,
                        1, 0, 0, 0,
                        0, 1, 0, 0,
                        0, 1, 0, 0,
                        0, 1, 0, 0,
                        0, 1, 0, 0,
                    ])
                }
            };
            let roadmesh = tesserxel.mesh.tetra.loft(path, crossSection, 20);
            let fencemesh = tesserxel.mesh.tetra.loft(path, fenceCrossSection, 256);
            roadmesh = tesserxel.mesh.tetra.concat(roadmesh, fencemesh);
            let roadvertCode = `
            struct InputType{
                @location(0) pos: mat4x4<f32>,
                @location(1) uvw: mat4x4<f32>,
                @location(2) normal: mat4x4<f32>,
            }
            struct OutputType{
                @builtin(position) pos: mat4x4<f32>,
                @location(0) normal_uvw: array<mat4x4<f32>,2>,
                @location(1) camRay: mat4x4<f32>,
            }
            struct AffineMat{
                matrix: mat4x4<f32>,
                vector: vec4<f32>,
            }
            @group(1) @binding(3) var<uniform> camMat: AffineMat;
            fn apply(afmat: AffineMat, points: mat4x4<f32>) -> mat4x4<f32>{
                let biais = mat4x4<f32>(afmat.vector, afmat.vector, afmat.vector, afmat.vector);
                return afmat.matrix* points + biais;
            }
            @tetra fn main(input : InputType, @builtin(instance_index) index: u32) -> OutputType{
                let camInvVec = transpose(camMat.matrix) * camMat.vector;
                return OutputType(apply(camMat,input.pos),
                    array<mat4x4<f32>,2>(input.uvw, input.normal),
                    input.pos + mat4x4<f32>(camInvVec,camInvVec,camInvVec,camInvVec)
                );
            }
            `;
            let roadfragCode = `
            struct fInputType{
                @location(0) uvw : vec4<f32>,
                @location(1) normal : vec4<f32>,
                @location(2) camRay : vec4<f32>
            };
            const xLanes = ${xLanes};
            const yLanes = ${yLanes};
            const laneSide = ${laneSide};
            const lineWidthHalf = ${lineWidthHalf};
            const outterLine1 = ${1.0 - laneSide - lineWidthHalf};
            const outterLine2 = ${1.0 - laneSide + lineWidthHalf};
            const roadBaseColor = vec4<f32>(0.5,0.5,0.5,0.3);
            const roadLineColor = vec4<f32>(1.0,1.0,0.0,1.0);
            fn maxComp(p: vec2<f32>)->f32{
                return max(p.x,p.y);
            }
            fn roadTexture(uvw:vec3<f32>, phong: f32)->vec4<f32>{
                let uv = vec3<f32>((abs(uvw.x) - 0.5)*2.0, uvw.yz);
                // outter lines
                var online = step(0.0,maxComp(abs(uv.xy) - outterLine1));
                let dashx = step(fract(uv.z * 0.5),0.5);
                let dashy = 1.0 - dashx;
                var separatorx = 0.0;
                var separatory = 0.0;
                for(var i = 1; i<xLanes; i+=1){
                    separatorx += step(abs(uv.x - (laneSide - 1.0 + f32(i)/f32(xLanes)*(2.0 - 2.0 * laneSide))),lineWidthHalf);
                }
                for(var i = 1; i<yLanes; i+=1){
                    separatory += step(abs(uv.y - (laneSide - 1.0 + f32(i)/f32(yLanes)*(2.0 - 2.0 * laneSide))),lineWidthHalf);
                }
                online += separatorx * dashx + separatory * dashy;
                online *= step(maxComp(abs(uv.xy) - outterLine2),0.0);
                return mix(roadBaseColor * (0.3 + 1.0*pow(phong,2.0)),roadLineColor,online);
            }
            const directionalLight_dir = vec4<f32>(${directionalLight_dir});
            fn roadSeparatorTexture(normal:vec4<f32>,uvw_w:f32, phong: f32)->vec4<f32>{
                const color = vec3<f32>(0.1,0.9,0.3);
                if(fract(uvw_w * 3.5) > 0.3){ discard; }
                let blinnphong = pow(phong,2.0);
                return vec4<f32>(((dot(normal, directionalLight_dir))*0.2 + 0.5)*color*(0.5+0.9*blinnphong),1.0);
            }
            @fragment fn main(vary: fInputType) -> @location(0) vec4<f32> {
                let color = vec3<f32>(1.0,1.0,1.0);
                if(vary.uvw.x > 1.1){
                    let normal = vary.normal * (step(dot(vary.normal,vary.camRay),0.0)*2.0 - 1.0);
                    let phong = max(0.0,dot(normal,normalize(directionalLight_dir - normalize(vary.camRay))));
                    return roadSeparatorTexture(normal,vary.uvw.w, phong);
                }else if(vary.uvw.x > 0.1){
                    return vec4<f32>(max(0.0,dot(vary.normal, directionalLight_dir)*0.2+0.5)*color,1.0);
                }else{
                    let phong = max(0.0,dot(vary.normal,normalize(directionalLight_dir - normalize(vary.camRay))));
                    return roadTexture(vary.uvw.yzw, phong);
                }
            }`;
            return { path, roadmesh, roadfragCode, roadvertCode };
        }
        function genBuilding(path) {
            const buildingCount = 1024;
            const buildingMaxRadius = 120;
            const buildingMinRadius = 15;
            const buildingVertCode = `
            
            struct InputType{
                @location(0) pos: mat4x4<f32>,
                @location(1) uvw: mat4x4<f32>,
                @location(2) normal: mat4x4<f32>,
            }
            
            struct OutputType{
                @builtin(position) pos: mat4x4<f32>,
                @location(0) uvw: mat4x4<f32>,
                @location(1) normal: mat4x4<f32>,
            }
            struct AffineMat{
                matrix: mat4x4<f32>,
                vector: vec4<f32>,
            }
            @group(1) @binding(3) var<uniform> camMat: AffineMat;
            @group(1) @binding(4) var<storage,read> modelMats: array<AffineMat>;
            fn apply(afmat: AffineMat, points: mat4x4<f32>) -> mat4x4<f32>{
                let biais = mat4x4<f32>(afmat.vector, afmat.vector, afmat.vector, afmat.vector);
                return afmat.matrix* points + biais;
            }
            fn addVec4(v: vec4<f32>, points: mat4x4<f32>) -> mat4x4<f32>{
                return points + mat4x4<f32>(v,v,v,v);
            }
            fn normalizeVec4(points: mat4x4<f32>) -> mat4x4<f32>{
                return mat4x4<f32>(normalize(points[0]),normalize(points[1]),normalize(points[2]),normalize(points[3]));
            }
            @tetra fn main(input : InputType, @builtin(instance_index) index: u32) -> OutputType{
                let modelMat = modelMats[index];
                let uvw = addVec4(vec4<f32>(0.0,0.0,0.0, f32(index)),input.uvw);
                return OutputType(apply(camMat,apply(modelMat,input.pos)), uvw, normalizeVec4(modelMat.matrix * input.normal));
            }
            `;
            const buildingFragCode = `
            struct fInputType{
                @location(0) uvw : vec4<f32>,
                @location(1) normal : vec4<f32>
            };
            const directionalLight_dir = vec4<f32>(${directionalLight_dir});
            fn buildTextureMap(uvw: vec4<f32>)->vec4<f32>{
                let Id = u32(uvw.w);
                let colorId = Id & 7;
                let anotherId = f32(Id & 1);
                let floorId = f32(Id & 3);
                const colorWallTable = array<vec3<f32>,8>(
                    vec3<f32>(1.0),
                    vec3<f32>(1.0),
                    vec3<f32>(1.0,0.7,0.6),
                    vec3<f32>(1.0,1.0,0.7),
                    vec3<f32>(0.6,0.6,0.6),
                    vec3<f32>(0.6,0.6,0.6),
                    vec3<f32>(0.8,1.0,1.0),
                    vec3<f32>(0.9,0.8,0.7),
                );
                let XZ = step(vec2<f32>(0.3,0.2), fract(uvw.xz * 4.0));
                let Y =  step(0.2+f32(floorId)*0.1, fract(uvw.y * 8.0 - f32(floorId)));
                return vec4<f32>(
                    mix(
                        mix(colorWallTable[colorId],vec3<f32>(0.5,0.8,0.9),XZ.x+XZ.y),
                        colorWallTable[colorId],
                        vec3<f32>(Y)
                    ),
                0.2);
            }
            @fragment fn main(vary: fInputType) -> @location(0) vec4<f32> {
                var color = vec4<f32>(0.2,1.0,0.2,0.1);
                if(vary.uvw.w > 1.0){
                    color = buildTextureMap(vary.uvw);
                }
                return vec4<f32>(max(0.0,dot(vary.normal, directionalLight_dir)*0.2+0.5)*color.rgb,color.a);
                // return vec4<f32>(1.0,0.0,0.0,0.3);
            }
            `;
            let buildingTransformBuffer = new Float32Array(20 * buildingCount);
            const points = path.generate(20).points;
            const pointLen = points.length;
            const srand = new tesserxel.math.Srand(12345);
            const buildingMinRadius2 = buildingMinRadius * buildingMinRadius;
            for (let i = 0; i < buildingCount; i++) {
                let willContinue = false;
                let randPointIdx = srand.nexti(pointLen);
                let r;
                do {
                    r = Math.sqrt(srand.nextf()) * buildingMaxRadius;
                } while (r < buildingMinRadius);
                let randVec = vec3.srand(srand).mulfs(r);
                randVec.adds(points[randPointIdx].xzw());
                for (let idx = 0; idx < pointLen; idx++) {
                    let testP = points[idx];
                    // let testP = points[idx >= pointLen ? idx - pointLen : idx < 0 ? idx + pointLen : idx];
                    if (testP.xzw().sub(randVec).normsqr() < buildingMinRadius2) {
                        i--;
                        willContinue = true;
                        break;
                    }
                }
                if (willContinue)
                    continue;
                let randRot = tesserxel.math.Quaternion.srand(srand).toMat3().elem;
                let scale = vec4.srand(srand);
                scale.x += 3;
                scale.z += 3;
                scale.y *= 4;
                scale.y += 3;
                scale.w += 3;
                scale.mulfs(1.5);
                new tesserxel.math.AffineMat4(tesserxel.math.Mat4.diag(scale.x, scale.y, scale.z, scale.w).mulsr(new tesserxel.math.Mat4(randRot[0], 0, randRot[3], randRot[6], 0, 1, 0, 0, randRot[1], 0, randRot[4], randRot[7], randRot[2], 0, randRot[5], randRot[8])), new vec4(randVec.x, scale.y, randVec.y, randVec.z)).writeBuffer(buildingTransformBuffer, 20 * i);
            }
            return { buildingFragCode, buildingVertCode, buildingTransformBuffer, buildingCount };
        }
        let rtCode = `
        @group(1) @binding(0) var<uniform> camMat: AffineMat;

        struct rayOut{
            @location(0) out: vec4<f32>,
            @location(1) coord: vec3<f32>
        }

        @ray fn mainRay(
            @builtin(ray_direction) rd: vec4<f32>,
            @builtin(voxel_coord) coord: vec3<f32>,
            @builtin(aspect_matrix) aspect: mat3x3<f32>
        ) -> rayOut {
            return rayOut(
                transpose(camMat.matrix)*rd,
                aspect * coord
            );
        }
        struct fOut{
            @location(0) color: vec4<f32>,
            @builtin(frag_depth) depth: f32
        }
        
        // converted to 4D from shadertoy 3D: https://www.shadertoy.com/view/WtBXWw
        fn ACESFilm(x: vec3<f32>)->vec3<f32>
        {
            let tA = 2.51;
            let tB = vec3<f32>(0.03);
            let tC = 2.43;
            let tD = vec3<f32>(0.59);
            let tE = vec3<f32>(0.14);
            return clamp((x*(tA*x+tB))/(x*(tC*x+tD)+tE),vec3<f32>(0.0),vec3<f32>(1.0));
        }
        const Ds = vec4<f32>(${directionalLight_dir});
        const betaR = vec3<f32>(1.95e-2, 1.1e-1, 2.94e-1); 
        const betaM = vec3<f32>(4e-2, 4e-2, 4e-2);
        const Rayleigh = 1.0;
        const Mie = 1.0;
        const RayleighAtt = 1.0;
        const MieAtt = 1.2;
        const g = -0.9;
        fn sky (rd: vec4<f32>)->vec3<f32>{
            let D = normalize(rd);
            let t = max(0.001, D.y)*0.92+0.08;

            // optical depth -> zenithAngle
            let sR = RayleighAtt / t ;
            let sM = MieAtt / t ;
            let cosine = clamp(dot(D,normalize(Ds)),0.0,1.0);
            let cosine2 =dot(D,normalize(Ds))+1.0;
            let extinction = exp(-(betaR * sR + betaM * sM));

            // scattering phase
            let g2 = g * g;
            let fcos2 = cosine * cosine;
            let miePhase = Mie * pow(1.0 + g2 + 2.0 * g * cosine, -1.5) * (1.0 - g2) / (2.0 + g2);
            
            let rayleighPhase = Rayleigh;

            let inScatter = (1.0 + fcos2) * vec3<f32>(rayleighPhase + betaM / betaR * miePhase);

            var color = inScatter*(1.0-extinction) * 1.4;
            // sun
            color += 0.47*vec3<f32>(1.8,1.4,0.3)*pow( cosine, 350.0 ) * extinction;
            // sun haze
            color += 0.4*vec3<f32>(0.8,0.9,0.1)*pow( cosine2 *0.5, 2.0 )* extinction;
            color *= vec3<f32>(1.4,1.7,1.2);
            return ACESFilm(color);
        }
        @fragment fn mainFragment(@location(0) rd: vec4<f32>, @location(1) coord: vec3<f32>)->fOut{
            let abscoord1 = step(abs(coord),vec3<f32>(0.03));
            let abscoord2 = step(abs(coord),vec3<f32>(0.2));
            if(abscoord1.x*abscoord1.y*abscoord1.z <= 0.0){
                if(abscoord2.x*abscoord1.y*abscoord1.z > 0.0){
                    return fOut(vec4<f32>(1.0,0.0,0.0,5.0),0.0);
                }
                if(abscoord1.x*abscoord2.y*abscoord1.z > 0.0){
                    return fOut(vec4<f32>(0.2,0.2,1.0,5.0),0.0);
                }
                if(abscoord1.x*abscoord1.y*abscoord2.z > 0.0){
                    return fOut(vec4<f32>(0.0,1.0,0.0,5.0),0.0);
                }
            }
            
            return fOut(vec4<f32>(sky(rd),0.1),0.999999);
        }
        `;
        const { roadmesh, roadfragCode, roadvertCode, path } = genRoad();
        const { buildingFragCode, buildingTransformBuffer, buildingVertCode, buildingCount } = genBuilding(path);
        const terrainSize = 500;
        let terrainTransformBuffer = new Float32Array([
            terrainSize, 0, 0, 0,
            0, terrainSize, 0, 0,
            0, 0, terrainSize, 0,
            0, 0, 0, terrainSize,
            0, -0.1, 0, 0,
        ]);
        async function load() {
            let gpu = await tesserxel.renderer.createGPU();
            let canvas = document.getElementById("gpu-canvas");
            let context = gpu.getContext(canvas);
            let renderer = await new tesserxel.renderer.SliceRenderer().init(gpu, context, {
                enableFloat16Blend: true,
                sliceGroupSize: 8
            });
            renderer.set4DCameraProjectMatrix({ fov: 100, near: 0.1, far: 500 });
            let roadpipeline = await renderer.createTetraSlicePipeline({
                vertex: { code: roadvertCode, entryPoint: "main" },
                fragment: {
                    code: roadfragCode,
                    entryPoint: "main"
                },
                cullMode: "none"
            });
            let buildingPipeline = await renderer.createTetraSlicePipeline({
                vertex: { code: buildingVertCode, entryPoint: "main" },
                fragment: {
                    code: buildingFragCode,
                    entryPoint: "main"
                },
                cullMode: "front"
            });
            let camBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 4 * 4 * 5);
            let roadmeshBindGroup = renderer.createVertexShaderBindGroup(roadpipeline, 1, [
                gpu.createBuffer(GPUBufferUsage.STORAGE, roadmesh.position),
                gpu.createBuffer(GPUBufferUsage.STORAGE, roadmesh.uvw),
                gpu.createBuffer(GPUBufferUsage.STORAGE, roadmesh.normal),
                camBuffer
            ]);
            let buildingMesh = tesserxel.mesh.tetra.tesseract();
            for (let i = 0; i < buildingMesh.uvw.length; i += 4) {
                buildingMesh.uvw[i + 3] = 1.5;
            }
            let terrainMesh = tesserxel.mesh.tetra.clone(tesserxel.mesh.tetra.cube);
            for (let i = 0; i < terrainMesh.uvw.length; i += 4) {
                terrainMesh.uvw[i + 3] = 0;
            }
            let buildingBindGroup = renderer.createVertexShaderBindGroup(buildingPipeline, 1, [
                gpu.createBuffer(GPUBufferUsage.STORAGE, buildingMesh.position),
                gpu.createBuffer(GPUBufferUsage.STORAGE, buildingMesh.uvw),
                gpu.createBuffer(GPUBufferUsage.STORAGE, buildingMesh.normal),
                camBuffer,
                gpu.createBuffer(GPUBufferUsage.STORAGE, buildingTransformBuffer)
            ]);
            let terrainBindGroup = renderer.createVertexShaderBindGroup(buildingPipeline, 1, [
                gpu.createBuffer(GPUBufferUsage.STORAGE, terrainMesh.position),
                gpu.createBuffer(GPUBufferUsage.STORAGE, terrainMesh.uvw),
                gpu.createBuffer(GPUBufferUsage.STORAGE, terrainMesh.normal),
                camBuffer,
                gpu.createBuffer(GPUBufferUsage.STORAGE, terrainTransformBuffer)
            ]);
            let rtPipeline = await renderer.createRaytracingPipeline({
                code: rtCode,
                rayEntryPoint: "mainRay",
                fragmentEntryPoint: "mainFragment"
            });
            let rtBindGroup = [renderer.createVertexShaderBindGroup(rtPipeline, 1, [camBuffer])];
            let camController = new tesserxel.controller.KeepUpController();
            camController.object.position.set(0.5, 0.5, 0.5, 3);
            camController.keyMoveSpeed *= 5;
            let retinaController = new tesserxel.controller.RetinaController(renderer);
            let ctrlreg = new tesserxel.controller.ControllerRegistry(canvas, [camController, retinaController], { preventDefault: true, requsetPointerLock: true });
            let config = renderer.getSliceConfig();
            config.opacity = 5;
            retinaController.setSlice(config);
            let camMatJSBuffer = new Float32Array(20);
            renderer.setScreenClearColor({ r: 1.0, g: 1.0, b: 1.0, a: 1.0 });
            renderer.setWorldClearColor({ r: 0.7, g: 0.85, b: 1.0, a: 0.1 });
            let run = () => {
                ctrlreg.update();
                camController.object.getAffineMat4inv().writeBuffer(camMatJSBuffer);
                gpu.device.queue.writeBuffer(camBuffer, 0, camMatJSBuffer);
                renderer.render(() => {
                    renderer.beginTetras(roadpipeline);
                    renderer.sliceTetras(roadmeshBindGroup, roadmesh.tetraCount);
                    renderer.drawTetras();
                    renderer.beginTetras(buildingPipeline);
                    renderer.sliceTetras(buildingBindGroup, buildingMesh.tetraCount - 5, buildingCount);
                    renderer.sliceTetras(terrainBindGroup, 5);
                    renderer.drawTetras();
                    renderer.drawRaytracing(rtPipeline, rtBindGroup);
                });
                window.requestAnimationFrame(run);
            };
            function setSize() {
                let width = window.innerWidth * window.devicePixelRatio;
                let height = window.innerHeight * window.devicePixelRatio;
                canvas.width = width;
                canvas.height = height;
                renderer.setSize({ width, height });
            }
            setSize();
            window.addEventListener("resize", setSize);
            run();
        }
        city_highway.load = load;
    })(city_highway = examples.city_highway || (examples.city_highway = {}));
})(examples || (examples = {}));
var examples;
(function (examples) {
    class ForceApp {
        renderer;
        camController;
        retinaController;
        ctrlreg;
        headercode = `
        struct rayOut{
            @location(0) o: vec4<f32>,
            @location(1) d: vec4<f32>
        }
        @group(1) @binding(0) var<uniform> camMat: AffineMat;
        @ray fn mainRay(
            @builtin(ray_direction) rd: vec4<f32>,
            @builtin(ray_origin) ro: vec4<f32>
        ) -> rayOut{
            return rayOut(camMat.matrix*ro+camMat.vector, camMat.matrix*rd);
        }
        {replace}
        @fragment fn mainFragment(@location(0) rayOrigin: vec4<f32>, @location(1) rayDir: vec4<f32>)->@location(0) vec4<f32>{
        return render(ray(rayOrigin, normalize(rayDir)));
        }
        struct ray{
            o: vec4<f32>,
            d: vec4<f32>,
        }
        struct glome{
            p: vec4<f32>,
            r: f32,
            id: u32
        }
        struct plane{
            n: vec4<f32>,
            o: f32,
            id: u32
        }
        struct rotor{
            l: vec4<f32>,
            r: vec4<f32>
        }
        struct obj4{
            p: vec4<f32>,
            r: rotor
        }
        fn quaternionMul(q1:vec4<f32>,q2:vec4<f32>)->vec4<f32>{
            return vec4<f32>(
                q1.x * q2.x - q1.y * q2.y - q1.z * q2.z - q1.w * q2.w,
                q1.x * q2.y + q1.y * q2.x + q1.z * q2.w - q1.w * q2.z,
                q1.x * q2.z - q1.y * q2.w + q1.z * q2.x + q1.w * q2.y,
                q1.x * q2.w + q1.y * q2.z - q1.z * q2.y + q1.w * q2.x
            );
        }
        fn rotate(r:rotor, p:vec4<f32>)->vec4<f32>{
            return quaternionMul(quaternionMul(r.l,p),r.r);
        }
        fn intGlome(r:ray, g:glome)->f32 {
            let oc = r.o - g.p;
            let b = dot(oc, r.d);
            let c = dot(oc, oc) - g.r*g.r;
            var t = b*b - c;
            if(t > 0.0) {
                t = -b - sqrt(t);
            }
            if(t < 0.0) {
                return 10000.0;
            }
            return t;
        }
        fn intPlane(r:ray, p:plane)->f32 {
            let t = (p.o - dot(r.o, p.n)) / dot(r.d, p.n);
            if(t < 0.0) {
                return 10000.0;
            }
            return t;
        }
        `;
        async load(code, genBuffersToBind, runWorld) {
            let gpu = await tesserxel.renderer.createGPU();
            let canvas = document.getElementById("gpu-canvas");
            let context = gpu.getContext(canvas);
            let renderer = await new tesserxel.renderer.SliceRenderer().init(gpu, context, {
                enableFloat16Blend: false,
                sliceGroupSize: 8
            });
            this.renderer = renderer;
            renderer.setScreenClearColor({ r: 1, g: 1, b: 1, a: 1 });
            let camBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 4 * 4 * 5);
            let camController = new tesserxel.controller.FreeFlyController();
            camController.object.position.set(0.001, 0.00141, 0.00172, 3);
            this.camController = camController;
            let retinaController = new tesserxel.controller.RetinaController(renderer);
            this.retinaController = retinaController;
            let ctrlreg = new tesserxel.controller.ControllerRegistry(canvas, [camController, retinaController], { preventDefault: true, requsetPointerLock: true });
            let matModelViewJSBuffer = new Float32Array(20);
            let pipeline = await renderer.createRaytracingPipeline({
                code: this.headercode.replace(/\{replace\}/g, code),
                rayEntryPoint: "mainRay",
                fragmentEntryPoint: "mainFragment"
            });
            let buffers = genBuffersToBind(gpu);
            let bindgroups = [renderer.createVertexShaderBindGroup(pipeline, 1, [camBuffer, ...buffers])];
            this.ctrlreg = ctrlreg;
            this.run = () => {
                runWorld(gpu);
                ctrlreg.update();
                camController.object.getAffineMat4().writeBuffer(matModelViewJSBuffer);
                gpu.device.queue.writeBuffer(camBuffer, 0, matModelViewJSBuffer);
                renderer.render(() => {
                    renderer.drawRaytracing(pipeline, bindgroups);
                });
                window.requestAnimationFrame(this.run);
            };
            function setSize() {
                let width = window.innerWidth * window.devicePixelRatio;
                let height = window.innerHeight * window.devicePixelRatio;
                canvas.width = width;
                canvas.height = height;
                renderer.setSize({ width, height });
            }
            setSize();
            window.addEventListener("resize", setSize);
            return this;
        }
        run;
    }
    let pendulum;
    (function (pendulum) {
        async function load() {
            let objCounts = 2;
            let sceneCode = `
            @group(1) @binding(1) var<uniform> positions: array<vec4<f32>,${objCounts}>;
            fn render(r: ray)->vec4<f32>{
                let g1 = glome(positions[0],1.0,1);
                let g2 = glome(positions[1],1.0,2);
                var t = 10000.0;
                t = intGlome(r,g1);
                if(t<10000.0){
                    return vec4<f32>(0.0,0.0,1.0,1.0);
                }
                t = min(t,intGlome(r,g2));
                // t = min(t,intPlane(,plane()));
                if(t<10000.0){return vec4<f32>(1.0,0.0,0.0,1.0);}
                return vec4<f32>(1.0,1.0,1.0,0.0);
            }
            `;
            let posBuffer;
            let posJsBuffer = new Float32Array(objCounts << 4);
            const phy = tesserxel.physics;
            const vec = tesserxel.math.Vec4;
            let engin = new phy.Engine(new phy.force_accumulator.RK4());
            let world = new phy.World();
            world.gravity.set();
            let glome1 = new phy.Object(new phy.Glome(1), 1);
            let glome2 = new phy.Object(new phy.Glome(2), 1);
            let floor = new phy.Object(new phy.Glome(2), 1);
            glome1.velocity.x = Math.sqrt(5);
            glome1.geometry.position.y = 1;
            // glome2.velocity.y = 1;
            world.addObject(glome1);
            world.addObject(glome2);
            let spring1 = new phy.force.Spring(glome1, null, new vec(), new vec(), 5.0, 0);
            let spring2 = new phy.force.Spring(glome2, glome1, new vec(), new vec(), 5.0, 0, 1);
            world.addForce(spring1);
            // world.addForce(spring2);
            let app = await new ForceApp().load(sceneCode, (gpu) => {
                posBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, posJsBuffer);
                return [posBuffer];
            }, (gpu) => {
                engin.update(world, Math.min(app.ctrlreg.states.mspf ?? 0.01, 0.1));
                glome1.geometry.position.writeBuffer(posJsBuffer, 0);
                glome2.geometry.position.writeBuffer(posJsBuffer, 4);
                gpu.device.queue.writeBuffer(posBuffer, 0, posJsBuffer);
            });
            app.run();
        }
        pendulum.load = load;
    })(pendulum = examples.pendulum || (examples.pendulum = {}));
})(examples || (examples = {}));
var examples;
(function (examples) {
    /** Double rotation of a tesseract */
    let four_basic_scene;
    (function (four_basic_scene) {
        async function load() {
            const FOUR = tesserxel.four;
            const canvas = document.getElementById("gpu-canvas");
            let renderer = await new FOUR.Renderer(canvas).init();
            let scene = new FOUR.Scene();
            // by default the backgroud is black (0.0, 0.0, 0.0) here we change it to white
            // alpha value is used for voxel opacity in retina
            // this value doesn't affect section views
            scene.setBackgroudColor({ r: 1.0, g: 1.0, b: 1.0, a: 1.0 });
            let camera = new FOUR.Camera();
            let cubeGeometry = new FOUR.TesseractGeometry();
            let material = new FOUR.BasicMaterial({ r: 1.0, g: 0.0, b: 0.0, a: 1.0 });
            let mesh = new FOUR.Mesh(cubeGeometry, material);
            scene.add(mesh);
            scene.add(camera);
            // move camera a little back to see hypercube at origin
            // note: w axis is pointed to back direction (like z axis in 3D)
            camera.position.w = 3.0;
            let retinaController = new tesserxel.controller.RetinaController(renderer.core);
            // by default retina operations must be enabled by pressing AltLeft key
            // we cancel it manually, so we can directly drag the cubic retina
            retinaController.keyConfig.enable = "";
            // Create a controllerRegistry binding on the canvas, then add our controller
            let controllerRegistry = new tesserxel.controller.ControllerRegistry(canvas, [retinaController]);
            function setSize() {
                let width = window.innerWidth * window.devicePixelRatio;
                let height = window.innerHeight * window.devicePixelRatio;
                renderer.setSize({ width, height });
            }
            setSize();
            window.addEventListener("resize", setSize);
            function run() {
                controllerRegistry.update();
                camera.needsUpdateCoord = true; // to tell renderer to update camera's orientation
                // For every frame, we rotate the mesh by angle of 0.01 radius degree in both xw and yz direction
                // We got a double clifford rotation here
                mesh.rotates(tesserxel.math.Bivec.xw.mulf(0.01).exp());
                mesh.rotates(tesserxel.math.Bivec.yz.mulf(0.01).exp());
                mesh.needsUpdateCoord = true; // to tell renderer to update mesh's orientation
                renderer.render(scene, camera);
                window.requestAnimationFrame(run);
            }
            run();
        }
        four_basic_scene.load = load;
    })(four_basic_scene = examples.four_basic_scene || (examples.four_basic_scene = {}));
})(examples || (examples = {}));
var examples;
(function (examples) {
    let four_materials;
    (function (four_materials) {
        async function load() {
            const FOUR = tesserxel.four;
            const canvas = document.getElementById("gpu-canvas");
            let renderer = await new FOUR.Renderer(canvas).init();
            let scene = new FOUR.Scene();
            let cubeGeometry = new FOUR.TesseractGeometry();
            let glomeGeometry = new FOUR.GlomeGeometry();
            let floorGeometry = new FOUR.CubeGeometry(10.0);
            let uniformColor = new FOUR.ColorUniformValue();
            let material1 = new FOUR.PhongMaterial([1.0, 1.0, 1.0]);
            let material2 = new FOUR.PhongMaterial(uniformColor);
            let cubeMesh1 = new FOUR.Mesh(cubeGeometry, material1);
            cubeMesh1.position.x = -2;
            cubeMesh1.position.y = 2;
            let cubeMesh2 = new FOUR.Mesh(cubeGeometry, material2);
            cubeMesh2.position.x = 2;
            cubeMesh2.position.y = 2;
            let floorMaterial = new FOUR.PhongMaterial(new FOUR.CheckerTexture([0, 0, 0, 0.2], [1, 1, 1, 1.0], new FOUR.Vec4TransformNode(new FOUR.UVWVec4Input, new tesserxel.math.Obj4(null, null, new tesserxel.math.Vec4(10, 10, 10, 10)))));
            let floorMesh = new FOUR.Mesh(floorGeometry, floorMaterial);
            let glomeMesh = new FOUR.Mesh(glomeGeometry, new FOUR.PhongMaterial([0.2, 0.2, 1], 50));
            glomeMesh.position.y = 1.0;
            glomeMesh.position.z = 1.0;
            glomeMesh.position.w = 1.0;
            scene.add(glomeMesh);
            scene.add(cubeMesh1);
            scene.add(cubeMesh2);
            scene.add(floorMesh);
            scene.add(new FOUR.AmbientLight(0.1));
            let dirLight = new FOUR.DirectionalLight([0.1, 0.0, 0.0]);
            scene.add(dirLight);
            let pointLight = new FOUR.PointLight([5.4, 2.5, 1.7]);
            scene.add(pointLight);
            let pointLight2 = new FOUR.PointLight([1.4, 12.5, 5.7]);
            scene.add(pointLight2);
            let pointLight3 = new FOUR.PointLight([1.4, 1.5, 15.7]);
            scene.add(pointLight3);
            let spotLight = new FOUR.SpotLight([800, 800, 800], 40, 0.2);
            scene.add(spotLight);
            spotLight.position.y = 10;
            let camera = new FOUR.Camera();
            camera.position.w = 5.0;
            camera.position.y = 2.0;
            camera.lookAt(tesserxel.math.Vec4.wNeg, new tesserxel.math.Vec4());
            scene.add(camera);
            let controller = new tesserxel.controller.ControllerRegistry(canvas, [
                new tesserxel.controller.KeepUpController(camera),
                new tesserxel.controller.RetinaController(renderer.core)
            ], { requsetPointerLock: true });
            function setSize() {
                let width = window.innerWidth * window.devicePixelRatio;
                let height = window.innerHeight * window.devicePixelRatio;
                renderer.setSize({ width, height });
            }
            setSize();
            window.addEventListener("resize", setSize);
            let t = Math.random() * 12345678;
            function run() {
                spotLight.direction.copy(new tesserxel.math.Vec4(Math.sin(t * 3), Math.cos(t * 3), Math.sin(t * 1.732), Math.cos(t * 1.732)).adds(tesserxel.math.Vec4.y.mulf(6)).norms());
                pointLight.position.set(Math.sin(t * 3), 0.5, Math.cos(t * 3), 0).mulfs(3);
                pointLight2.position.set(0, 0.5, Math.sin(t * 3), Math.cos(t * 3)).mulfs(3);
                pointLight3.position.set(Math.cos(t * 3), 0.5, 0, Math.sin(t * 3)).mulfs(3);
                dirLight.direction.set(Math.sin(t * 20), 0.2, Math.cos(t * 20) * 0.2, Math.cos(t * 20)).norms();
                dirLight.needsUpdateCoord = true;
                pointLight.needsUpdateCoord = true;
                pointLight2.needsUpdateCoord = true;
                pointLight3.needsUpdateCoord = true;
                spotLight.needsUpdateCoord = true;
                uniformColor.write([Math.sin(t) * 0.3 + 0.7, Math.sin(t * 0.91) * 0.5 + 0.5, Math.sin(t * 1.414) * 0.5 + 0.5]);
                t += 0.01;
                controller.update();
                camera.needsUpdateCoord = true;
                renderer.render(scene, camera);
                window.requestAnimationFrame(run);
            }
            run();
        }
        four_materials.load = load;
    })(four_materials = examples.four_materials || (examples.four_materials = {}));
})(examples || (examples = {}));
var examples;
(function (examples) {
    let instanced_cubes;
    (function (instanced_cubes) {
        let vertCode = `
struct InputType{
    @location(0) pos: mat4x4<f32>,
    @location(1) normal: mat4x4<f32>,
    @location(2) uvw: mat4x4<f32>,
}
struct OutputType{
    @builtin(position) pos: mat4x4<f32>,
    @location(0) normal: mat4x4<f32>,
    @location(1) uvw: mat4x4<f32>,
}
struct AffineMat{
    matrix: mat4x4<f32>,
    vector: vec4<f32>,
}
@group(1) @binding(3) var<uniform> camMat: array<AffineMat,2>;
@group(1) @binding(4) var<storage> modelMats: array<AffineMat>;
fn apply(afmat: AffineMat, points: mat4x4<f32>) -> mat4x4<f32>{
    let biais = mat4x4<f32>(afmat.vector, afmat.vector, afmat.vector, afmat.vector);
    return afmat.matrix * points + biais;
}
@tetra fn main(input : InputType, @builtin(instance_index) index: u32) -> OutputType{
    let modelMat = modelMats[index];
    return OutputType(apply(camMat[0],apply(modelMat, apply(camMat[1],input.pos))), modelMat.matrix * camMat[1].matrix * input.normal, input.uvw);
}
`;
        let fragCode = `
struct fInputType{
    @location(0) normal : vec4<f32>,
    @location(1) uvw : vec4<f32>,
};
@fragment fn main(vary: fInputType) -> @location(0) vec4<f32> {
    const colors = array<vec3<f32>,8> (
        vec3<f32>(1, 0, 0),
        vec3<f32>(1, 1, 0),
        vec3<f32>(1, 0, 1),
        vec3<f32>(0, 0, 1),
        vec3<f32>(1, 0.5, 0),
        vec3<f32>(0, 0.5, 1),
        vec3<f32>(0, 1, 1),
        vec3<f32>(0.6, 0.9, 0.2),
    );
    const radius: f32 = 0.8;
    const ambientLight = vec3<f32>(0.1);
    const frontLightColor = vec3<f32>(5.0,4.6,3.5);
    const backLightColor = vec3<f32>(0.1,1.2,1.4);
    const directionalLight_dir = vec4<f32>(0.1,0.5,0.4,1.0);
    var color:vec3<f32> = vec3(1.0,1.0,1.0);
    var count:f32 = 0;
    count += step(0.8,abs(vary.uvw.x));
    count += step(0.8,abs(vary.uvw.y));
    count += step(0.8,abs(vary.uvw.z));
    if(dot(vary.uvw.xyz,vary.uvw.xyz) < radius * radius * radius || count >= 2.0){
        color = colors[u32(vary.uvw.w + 0.1)];
    }
    color = color * (
        frontLightColor * max(0, dot(directionalLight_dir , vary.normal)) + backLightColor * max(0, -dot(directionalLight_dir , vary.normal))
    );
    return vec4<f32>(pow(color,vec3<f32>(0.6)), 0.5 + f32(count>=2.0));
}`;
        async function load() {
            let gpu = await tesserxel.renderer.createGPU();
            let canvas = document.getElementById("gpu-canvas");
            let context = gpu.getContext(canvas);
            let renderer = await new tesserxel.renderer.SliceRenderer().init(gpu, context, {
                enableFloat16Blend: false,
                sliceGroupSize: 8
            });
            let pipeline = await renderer.createTetraSlicePipeline({
                vertex: { code: vertCode, entryPoint: "main" },
                fragment: { code: fragCode, entryPoint: "main" },
                cullMode: "front"
            });
            let mesh = tesserxel.mesh.tetra.tesseract();
            let positionBuffer = gpu.createBuffer(GPUBufferUsage.STORAGE, mesh.position);
            let normalBuffer = gpu.createBuffer(GPUBufferUsage.STORAGE, mesh.normal);
            let uvwBuffer = gpu.createBuffer(GPUBufferUsage.STORAGE, mesh.uvw);
            let camMat = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 4 * 4 * 5 * 2);
            let cubeCount = 4096;
            let jsbuffer = new Float32Array(20 * cubeCount);
            let math = tesserxel.math;
            for (let i = 0; i < cubeCount; i++) {
                new math.Obj4(math.Vec4.rand().mulfs(Math.cbrt(Math.random()) * 5.0), math.Rotor.rand(), new math.Vec4(0.1, 0.1, 0.1, 0.1).adds(math.Vec4.rand().mulfs(0.05))).getAffineMat4().writeBuffer(jsbuffer, i * 20);
            }
            let modelBuffer = gpu.createBuffer(GPUBufferUsage.STORAGE, jsbuffer);
            let vertBindGroup = renderer.createVertexShaderBindGroup(pipeline, 1, [positionBuffer, normalBuffer, uvwBuffer, camMat, modelBuffer]);
            let sliceConfig = renderer.getSliceConfig();
            sliceConfig.opacity = 30.0;
            renderer.setSlice(sliceConfig);
            renderer.set4DCameraProjectMatrix({
                fov: 100, near: 0.02, far: 50
            });
            let retinaController = new tesserxel.controller.RetinaController(renderer);
            retinaController.toggleSectionConfig("retina");
            retinaController.mouseButton = null;
            let trackBallController = new tesserxel.controller.TrackBallController();
            trackBallController.object.position.set(0, 0, 0, -3);
            let ctrlreg = new tesserxel.controller.ControllerRegistry(canvas, [trackBallController, retinaController], { preventDefault: true, requsetPointerLock: true });
            let camMatJSBuffer = new Float32Array(40);
            const factor1 = 0.4;
            const factor2 = factor1 * Math.SQRT2;
            let run = () => {
                ctrlreg.update();
                trackBallController.object.getAffineMat4().writeBuffer(camMatJSBuffer);
                let t = ctrlreg.states.updateCount * 0.1;
                new tesserxel.math.Obj4(new tesserxel.math.Vec4(Math.sin(t * factor1), Math.cos(t * factor2), Math.sin(t * factor2), Math.cos(t * factor2)).mulfs(5), new tesserxel.math.Bivec(t, 0, 0, 0, 0, 1.414 * t).exp()).getAffineMat4().writeBuffer(camMatJSBuffer, 20);
                gpu.device.queue.writeBuffer(camMat, 0, camMatJSBuffer);
                renderer.render(() => {
                    renderer.beginTetras(pipeline);
                    renderer.sliceTetras(vertBindGroup, mesh.tetraCount, cubeCount);
                    renderer.drawTetras();
                });
                window.requestAnimationFrame(run);
            };
            function setSize() {
                let width = window.innerWidth * window.devicePixelRatio;
                let height = window.innerHeight * window.devicePixelRatio;
                canvas.width = width;
                canvas.height = height;
                retinaController.setSize({ width, height });
            }
            setSize();
            window.addEventListener("resize", setSize);
            run();
        }
        instanced_cubes.load = load;
    })(instanced_cubes = examples.instanced_cubes || (examples.instanced_cubes = {}));
})(examples || (examples = {}));
var examples;
(function (examples) {
    class MandelApp {
        renderer;
        camController;
        retinaController;
        headercode = `
        struct rayOut{
            @location(0) o: vec4<f32>,
            @location(1) d: vec4<f32>
        }
        @group(1) @binding(0) var<uniform> camMat: AffineMat;
        @ray fn mainRay(
            @builtin(ray_direction) rd: vec4<f32>,
            @builtin(ray_origin) ro: vec4<f32>
        ) -> rayOut{
            return rayOut(camMat.matrix*ro+camMat.vector, camMat.matrix*rd);
        }
        const MARCHINGITERATIONS = 64;
        const MARCHINGSTEP = 0.5;
        const SMALLESTSTEP = 0.1;

        const DISTANCE = 3.0;

        const MAXMANDELBROTDIST = 1.5;
        const MANDELBROTSTEPS = 64;

        // cosine based palette, 4 params: vec4<f32>
        fn cosineColor( t: f32, a: vec3<f32>, b: vec3<f32>, c: vec3<f32>, d: vec3<f32> )-> vec3<f32>
        {
            return a + b*cos( 6.28318*(c*t+d) );
        }
        fn palette (t: f32)-> vec3<f32> {
            return cosineColor( t, vec3<f32>(0.5,0.5,0.5),vec3<f32>(0.5,0.5,0.5),vec3<f32>(0.01,-0.02414,0.03732),vec3<f32>(0.00, -0.15, 0.20) );
        }

        // distance estimator to a mandelbulb set
        // returns the distance to the set on the x coordinate 
        // and the color on the y coordinate
        fn DE(pos: vec4<f32>)->vec2<f32> {
            const Power: f32 = 10.0;
            var z: vec4<f32> = pos;
            var dr: f32 = 1.0;
            var r: f32 = 0.0;
            for (var i = 0; i < MANDELBROTSTEPS ; i++) {
                r = length(z);
                if (r>MAXMANDELBROTDIST){ break;}
                {replace}
            }
            return vec2<f32>(0.5*log(r)*r/dr,50.0*pow(dr,0.128/f32(MARCHINGITERATIONS)));
        }

        // MAPPING FUNCTION ... 
        // returns the distance of the nearest object in the direction p on the x coordinate 
        // and the color on the y coordinate
        // vec2 map( p: vec4<f32> )
        // {
        //     //p = fract(p); 
        //    	vec2 d = DE(p);

            

        //    	return d;
        // }


        // TRACING A PATH : 
        // measuring the distance to the nearest object on the x coordinate
        // and returning the color index on the y coordinate
        fn trace  (origin: vec4<f32>, ray: vec4<f32>)->vec2<f32> {
            
            //t is the point at which we are in the measuring of the distance
            var t: f32 =0.0;
            var c: f32 = 0.0;
            
            for (var i = 0; i<MARCHINGITERATIONS; i++) {
                let path = origin + ray * t;	
                let dist = DE(path);
                // we want t to be as large as possible at each step but not too big to induce artifacts
                t += MARCHINGSTEP * dist.x;
                c += dist.y;
                if (dist.y < SMALLESTSTEP){ break;}
            }
            
            return vec2<f32>(t,c);
        }

        fn render(origin:vec4<f32>, ray:vec4<f32>)->vec4<f32>
        {
            let depth = trace(origin,ray);
            //rendering with a fog calculation (further is darker)
            let fog: f32 = 1.0 / (1.0 + depth.x * depth.x * 0.1);
            
            // Output to screen
            return vec4<f32>(palette(depth.y + 12.0)*fog,fog);
        }

        @fragment fn mainFragment(@location(0) rayOrigin: vec4<f32>, @location(1) rayDir: vec4<f32>)->@location(0) vec4<f32>{
        return render(rayOrigin, rayDir);
        }
        `;
        async load(code, fnDE) {
            let gpu = await tesserxel.renderer.createGPU();
            let canvas = document.getElementById("gpu-canvas");
            let context = gpu.getContext(canvas);
            let renderer = await new tesserxel.renderer.SliceRenderer().init(gpu, context, {
                enableFloat16Blend: false,
                sliceGroupSize: 8
            });
            this.renderer = renderer;
            renderer.setScreenClearColor({ r: 1, g: 1, b: 1, a: 1 });
            let camBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 4 * 4 * 5);
            let camController = new tesserxel.controller.FreeFlyController();
            camController.object.position.set(0.001, 0.00141, 0.00172, 3);
            this.camController = camController;
            let retinaController = new tesserxel.controller.RetinaController(renderer);
            this.retinaController = retinaController;
            let ctrlreg = new tesserxel.controller.ControllerRegistry(canvas, [camController, retinaController], { preventDefault: true, requsetPointerLock: true });
            let matModelViewJSBuffer = new Float32Array(20);
            let pipeline = await renderer.createRaytracingPipeline({
                code: this.headercode.replace(/\{replace\}/g, code),
                rayEntryPoint: "mainRay",
                fragmentEntryPoint: "mainFragment"
            });
            let bindgroups = [renderer.createVertexShaderBindGroup(pipeline, 1, [camBuffer])];
            this.run = () => {
                let de = fnDE(camController.object.position);
                camController.keyMoveSpeed = de * 0.001;
                let config = renderer.getSliceConfig();
                config.sectionEyeOffset = de * 0.2;
                retinaController.setSlice(config);
                ctrlreg.update();
                camController.object.getAffineMat4().writeBuffer(matModelViewJSBuffer);
                gpu.device.queue.writeBuffer(camBuffer, 0, matModelViewJSBuffer);
                renderer.render(() => {
                    renderer.drawRaytracing(pipeline, bindgroups);
                });
                window.requestAnimationFrame(this.run);
            };
            function setSize() {
                let width = window.innerWidth * window.devicePixelRatio;
                let height = window.innerHeight * window.devicePixelRatio;
                canvas.width = width;
                canvas.height = height;
                renderer.setSize({ width, height });
            }
            setSize();
            window.addEventListener("resize", setSize);
            return this;
        }
        run;
    }
    let mandelbulb_hopf;
    (function (mandelbulb_hopf) {
        async function load() {
            let app = await new MandelApp().load(`
                dr =  pow(r, Power - 1.0)*Power*dr + 1.0;
                // convert to hopf coordinates
                var theta: f32 = acos(length(z.zw)/r);
                var phi1: f32 = atan2(z.y,z.x);
                var phi2: f32 = atan2(z.w,z.z);
                // scale and rotate the point
                let zr: f32 = pow( r,Power);
                theta = theta*Power;
                phi1 = phi1*Power;
                phi2 = phi2*Power;
                let st = sin(theta);
                let ct = cos(theta);
                // convert back to cartesian coordinates
                z = zr*vec4<f32>(st*cos(phi1), st*sin(phi1), ct*cos(phi2), ct*sin(phi2));
                z += pos;
            `, (pos) => {
                const MAXMANDELBROTDIST = 1.5;
                const MANDELBROTSTEPS = 32;
                const Power = 10;
                let z = pos.clone();
                let dr = 1.0;
                let r = 0.0;
                for (let i = 0; i < MANDELBROTSTEPS; i++) {
                    r = z.norm();
                    if (r > MAXMANDELBROTDIST) {
                        break;
                    }
                    // convert to hopf coordinates
                    let theta = Math.acos(Math.hypot(z.z, z.w) / r);
                    let phi1 = Math.atan2(z.y, z.x);
                    let phi2 = Math.atan2(z.w, z.z);
                    dr = Math.pow(r, Power - 1.0) * Power * dr + 1.0;
                    // scale and rotate the point
                    let zr = Math.pow(r, Power);
                    theta = theta * Power;
                    phi1 = phi1 * Power;
                    phi2 = phi2 * Power;
                    let st = Math.sin(theta);
                    let ct = Math.cos(theta);
                    // convert back to cartesian coordinates
                    z.set(st * Math.cos(phi1), st * Math.sin(phi1), ct * Math.cos(phi2), ct * Math.sin(phi2));
                    z.mulfs(zr).adds(pos);
                }
                return 0.5 * Math.log(r) * r / dr;
            });
            app.run();
        }
        mandelbulb_hopf.load = load;
    })(mandelbulb_hopf = examples.mandelbulb_hopf || (examples.mandelbulb_hopf = {}));
    let mandelbulb_spherical;
    (function (mandelbulb_spherical) {
        async function load() {
            let app = await new MandelApp().load(`
                dr =  pow(r, Power - 1.0)*Power*dr + 1.0;
                // convert to spherical coordinates
                var theta1: f32 = acos(z.w/r);
                var theta2: f32 = acos(z.z/length(z.xyz));
                var phi: f32 = atan2(z.y,z.x);
                // scale and rotate the point
                let zr: f32 = pow( r,Power);
                theta1 = theta1*Power;
                theta2 = theta2*Power;
                phi = phi*Power;
                // convert back to cartesian coordinates
                
                let st1 = sin(theta1);
                let st2 = sin(theta2);
                z = zr*vec4<f32>(st1*st2*cos(phi), st1*st2*sin(phi), st1*cos(theta2), cos(theta1));
                z += pos;
            `, (pos) => {
                const DISTANCE = 3.0;
                const MAXMANDELBROTDIST = 1.5;
                const MANDELBROTSTEPS = 32;
                const Power = 10;
                let z = pos.clone();
                let dr = 1.0;
                let r = 0.0;
                for (let i = 0; i < MANDELBROTSTEPS; i++) {
                    r = z.norm();
                    if (r > MAXMANDELBROTDIST) {
                        break;
                    }
                    // convert to hopf coordinates
                    let theta1 = Math.acos(z.w / r);
                    let theta2 = Math.acos(z.z / z.xyz().norm());
                    let phi = Math.atan2(z.y, z.x);
                    dr = Math.pow(r, Power - 1.0) * Power * dr + 1.0;
                    // scale and rotate the point
                    let zr = Math.pow(r, Power);
                    theta1 = theta1 * Power;
                    theta2 = theta2 * Power;
                    phi = phi * Power;
                    let st1 = Math.sin(theta1);
                    let st2 = Math.sin(theta2);
                    // convert back to cartesian coordinates
                    z.set(st1 * st2 * Math.cos(phi), st1 * st2 * Math.sin(phi), st1 * Math.cos(theta2), Math.cos(theta1));
                    z.mulfs(zr).adds(pos);
                }
                return 0.5 * Math.log(r) * r / dr;
            });
            app.run();
        }
        mandelbulb_spherical.load = load;
    })(mandelbulb_spherical = examples.mandelbulb_spherical || (examples.mandelbulb_spherical = {}));
    let julia_quaternion;
    (function (julia_quaternion) {
        async function load() {
            let _Q = new tesserxel.math.Quaternion();
            let app = await new MandelApp().load(`
                dr =  pow(r, Power - 1.0)*Power*dr;
                let q = z / r;
                let s = acos(q.x) * Power;
                let zr: f32 = pow( r,Power);
                z = zr*vec4<f32>(cos(s),normalize(q.yzw)*sin(s));
                z += vec4<f32>(-0.125,-0.256,0.847,0.0895);
            `, (pos) => {
                const DISTANCE = 3.0;
                const MAXMANDELBROTDIST = 1.5;
                const MANDELBROTSTEPS = 32;
                const Power = 2;
                const c = new tesserxel.math.Vec4(-0.125, -0.256, 0.847, 0.0895);
                let z = pos.clone();
                let dr = 1.0;
                let r = 0.0;
                for (let i = 0; i < MANDELBROTSTEPS; i++) {
                    r = z.norm();
                    if (r > MAXMANDELBROTDIST) {
                        break;
                    }
                    // convert to hopf coordinates
                    let q = z.divf(r);
                    z.copy(_Q.expset(_Q.copy(q).log().mulfs(Power)));
                    dr = Math.pow(r, Power - 1.0) * Power * dr;
                    // scale and rotate the point
                    let zr = Math.pow(r, Power);
                    z.mulfs(zr).adds(c);
                }
                return 0.5 * Math.log(r) * r / dr;
            });
            app.run();
        }
        julia_quaternion.load = load;
    })(julia_quaternion = examples.julia_quaternion || (examples.julia_quaternion = {}));
})(examples || (examples = {}));
var examples;
(function (examples) {
    class MengerApp {
        renderer;
        camController;
        retinaController;
        headercode = `
        struct rayOut{
            @location(0) o: vec4<f32>,
            @location(1) d: vec4<f32>
        }
        @group(1) @binding(0) var<uniform> camMat: AffineMat;
        @ray fn mainRay(
            @builtin(ray_direction) rd: vec4<f32>,
            @builtin(ray_origin) ro: vec4<f32>
        ) -> rayOut{
            
            return rayOut(camMat.matrix*ro+camMat.vector, camMat.matrix*rd);
        }
fn maxcomp( p : vec4<f32>)->f32 { return max(p.x,max(p.y, max(p.w,p.z)));}
fn sdBox( p:vec4<f32>, b:vec4<f32> )->f32
{
    let di:vec4<f32> = abs(p) - b;
    let mc:f32 = maxcomp(di);
    return min(mc,length(max(di,vec4<f32>(0.0))));
}

fn iBox( ro:vec4<f32>, rd:vec4<f32>, rad:vec4<f32> )->vec2<f32> 
{
    let m:vec4<f32> = 1.0/rd;
    let n:vec4<f32> = m*ro;
    let k:vec4<f32> = abs(m)*rad;
    let t1:vec4<f32> = -n - k;
    let t2:vec4<f32> = -n + k;
	return vec2<f32>( max( max( max( t1.x, t1.y ), t1.z ),t1.w),
	            min( min( min( t2.x, t2.y ), t2.z ),t2.w) );
}
const ma = mat4x4<f32>( 0.60, 0.00,  0.80, 0.0,
                      0.00, 1.00,  0.00,  0.0,
                     -0.80, 0.00,  0.60,0.0,
                     0.0,0.0,0.0,1.0);
fn map(pos:vec4<f32> )->vec4<f32>
{
    var p = pos;
    var d:f32 = sdBox(p,vec4<f32>(1.0));
    var res = vec4<f32>( d, 1.0, 0.0, 0.0 );
	
    var s:f32 = 1.0;
    for(var m = 0; m<5; m = m + 1)
    {
        let a:vec4<f32> = fract( p*s / 2.0 ) * 2.0-vec4<f32>(1.0);
        s *= 3.0;
        let r = abs(vec4<f32>(1.0) - 3.0*abs(a));
        {replace}
    }

    return res;
}

fn intersect( ro:vec4<f32>, rd:vec4<f32> )->vec4<f32>
{
    let bb = iBox( ro, rd, vec4<f32>(1.01) );
    if( bb.y<bb.x ) {return vec4<f32>(-1.0);}
    
    let tmin = bb.x;
    let tmax = bb.y;
    
    var t = max(0.0,tmin);
    var res = vec4<f32>(-1.0);
    for( var i=0; i<64; i=i+1 )
    {
        let h = map(ro + rd*t);
		if( h.x<0.002 || t>tmax ){ break;}
        res = vec4<f32>(t,h.yzw);
        t += h.x;
    }
	if( t>tmax ) {res = vec4<f32>(-1.0);}
    return res;
}

fn softshadow( ro:vec4<f32>, rd:vec4<f32>, mint:f32, k:f32 )->f32
{
    let bb = iBox( ro, rd, vec4<f32>(1.05) );
    let tmax = bb.y;
    
    var res:f32 = 1.0;
    var t = mint;
    for( var i=0; i<64; i++ )
    {
        let h = map(ro + rd*t).x;
        res = min( res, k*h/t );
        if( res<0.001 ) {break;}
		t += clamp( h, 0.005, 0.1 );
        if( t>tmax ) {break;}
    }
    return clamp(res,0.0,1.0);
}

fn calcNormal(pos:vec4<f32>)->vec4<f32>
{
    let eps = vec4<f32>(0.001,0.0,0.0,0.0);
    return normalize(vec4<f32>(
        map(pos+eps.xyyy).x - map(pos-eps.xyyy).x,
        map(pos+eps.yxyy).x - map(pos-eps.yxyy).x,
        map(pos+eps.yyxy).x - map(pos-eps.yyxy).x,
        map(pos+eps.yyyx).x - map(pos-eps.yyyx).x,
    ));
}

fn render( ro:vec4<f32>, rd:vec4<f32> )->vec4<f32>
{
    // background color
    var col = vec4<f32>(mix( vec3<f32>(0.3,0.2,0.1)*0.5, vec3<f32>(0.7, 0.9, 1.0), 0.5 + 0.5*rd.y ),0.15);
	
    let tmat = intersect(ro,rd);
    if( tmat.x>0.0 )
    {
        let pos:vec4<f32> = ro + tmat.x*rd;
        let nor:vec4<f32> = calcNormal(pos);
        
        let matcol:vec3<f32> = vec3<f32>(0.5) + 0.5*cos(vec3<f32>(0.0,1.0,2.0)+2.0*tmat.z);
        
        let occ = tmat.y;

        let light = normalize(vec4<f32>(1.0,0.9,0.3,0.6));
        var dif:f32 = dot(nor,light);
        var sha:f32 = 1.0;
        // if( dif>0.0 ){ sha=softshadow( pos, light, 0.01, 64.0 );}
        dif = max(dif,0.0);
        let hal:vec4<f32> = normalize(light-rd);
        let spe:f32 = dif*sha*pow(clamp(dot(hal,nor),0.0,1.0),16.0)*(0.04+0.96*pow(clamp(1.0-dot(hal,light),0.0,1.0),5.0));
        
		let sky:f32 = 0.5 + 0.5*nor.y;
        let bac:f32 = max(0.4 + 0.6*dot(nor,vec4<f32>(-light.x,light.y,-light.z,light.w)),0.0);

        var lin = vec3<f32>(0.0);
        lin += 1.00*dif*vec3<f32>(1.10,0.85,0.60)*sha;
        lin += 0.50*sky*vec3<f32>(0.10,0.20,0.40)*occ;
        lin += 0.10*bac*vec3<f32>(1.00,1.00,1.00)*(0.5+0.5*occ);
        lin += 0.25*occ*vec3<f32>(0.15,0.17,0.20);	 
        col = vec4<f32>(matcol*lin + spe*128.0, 1.0);
    }
    var gamma = 1.5*col.xyz/(vec3<f32>(1.0)+col.xyz);
    gamma = sqrt( gamma );
    return vec4<f32>(gamma, col.w);
}

@fragment fn mainFragment(@location(0) rayOrigin: vec4<f32>, @location(1) rayDir: vec4<f32>)->@location(0) vec4<f32>{
    return render(rayOrigin, rayDir);
}
        `;
        async load(code) {
            let gpu = await tesserxel.renderer.createGPU();
            let canvas = document.getElementById("gpu-canvas");
            let context = gpu.getContext(canvas);
            let renderer = await new tesserxel.renderer.SliceRenderer().init(gpu, context, {
                enableFloat16Blend: false,
                sliceGroupSize: 8
            });
            this.renderer = renderer;
            renderer.setScreenClearColor({ r: 1, g: 1, b: 1, a: 1 });
            let camBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 4 * 4 * 5);
            let camController = new tesserxel.controller.FreeFlyController();
            camController.object.position.set(0, 0, 0, 3);
            this.camController = camController;
            let retinaController = new tesserxel.controller.RetinaController(renderer);
            this.retinaController = retinaController;
            let ctrlreg = new tesserxel.controller.ControllerRegistry(canvas, [camController, retinaController], { preventDefault: true, requsetPointerLock: true });
            let matModelViewJSBuffer = new Float32Array(20);
            let pipeline = await renderer.createRaytracingPipeline({
                code: this.headercode.replace(/\{replace\}/g, code),
                rayEntryPoint: "mainRay",
                fragmentEntryPoint: "mainFragment"
            });
            let bindgroups = [renderer.createVertexShaderBindGroup(pipeline, 1, [camBuffer])];
            this.run = () => {
                ctrlreg.update();
                camController.object.getAffineMat4().writeBuffer(matModelViewJSBuffer);
                gpu.device.queue.writeBuffer(camBuffer, 0, matModelViewJSBuffer);
                renderer.render(() => {
                    renderer.drawRaytracing(pipeline, bindgroups);
                });
                window.requestAnimationFrame(this.run);
            };
            function setSize() {
                let width = window.innerWidth * window.devicePixelRatio;
                let height = window.innerHeight * window.devicePixelRatio;
                canvas.width = width;
                canvas.height = height;
                renderer.setSize({ width, height });
            }
            setSize();
            window.addEventListener("resize", setSize);
            return this;
        }
        run;
    }
    let menger_sponge1;
    (function (menger_sponge1) {
        async function load() {
            let app = await new MengerApp().load(`
            let da = max(max(r.x,r.y),r.z);
            let db = max(max(r.x,r.y),r.w);
            let dc = max(max(r.x,r.w),r.z);
            let dd = max(max(r.w,r.y),r.z);
            let minc = min(da,min(db,min(dc,dd)));
            let c = (minc - 1.0)/s;
    
            if( c>d ){
                d = c;
                res = vec4<f32>( d, res.y, (1.0+f32(m))/4.0, 0.0 );
            }`);
            let config = app.renderer.getSliceConfig();
            config.opacity = 6.0;
            app.retinaController.setSlice(config);
            app.run();
        }
        menger_sponge1.load = load;
    })(menger_sponge1 = examples.menger_sponge1 || (examples.menger_sponge1 = {}));
    let menger_sponge2;
    (function (menger_sponge2) {
        async function load() {
            let app = await new MengerApp().load(`
        let da = max(r.x,r.y);
        let db = max(r.x,r.z);
        let dc = max(r.x,r.w);
        let dd = max(r.w,r.y);
        let de = max(r.w,r.z);
        let df = max(r.z,r.y);
        let minc = min(da,min(db,min(dc,min(min(dd,de),df))));
        let c = (minc - 1.0)/s;

        if( c>d ){
            d = c;
            res = vec4<f32>( d, res.y, (1.0+f32(m))/4.0, 0.0 );
        }`);
            let config = app.renderer.getSliceConfig();
            config.opacity = 2.0;
            app.retinaController.setSlice(config);
            app.run();
        }
        menger_sponge2.load = load;
    })(menger_sponge2 = examples.menger_sponge2 || (examples.menger_sponge2 = {}));
})(examples || (examples = {}));
var examples;
(function (examples) {
    class ShapesApp {
        vertCode = `
        // vertex attributes, regard four vector4 for vertices of one tetrahedra as matrix4x4 
        struct InputType{
            @location(0) pos: mat4x4<f32>,
            @location(1) normal: mat4x4<f32>,
            @location(2) uvw: mat4x4<f32>,
        }
        // output position in camera space and data sent to fragment shader to be interpolated
        struct OutputType{
            @builtin(position) pos: mat4x4<f32>,
            @location(0) normal_uvw: array<mat4x4<f32>,2>,
            @location(1) position: mat4x4<f32>,
        }
        // we define an affineMat to store rotation and transform since there's no mat5x5 in wgsl
        struct AffineMat{
            matrix: mat4x4<f32>,
            vector: vec4<f32>,
        }
        // remember that group(0) is occupied by internal usage and binding(0) to binding(2) are occupied by vertex attributes
        // so we start here by group(1) binding(3)
        @group(1) @binding(3) var<uniform> camMat: AffineMat;
        // apply affineMat to four points
        fn apply(afmat: AffineMat, points: mat4x4<f32>) -> mat4x4<f32>{
            let biais = mat4x4<f32>(afmat.vector, afmat.vector, afmat.vector, afmat.vector);
            return afmat.matrix * points + biais;
        }
        // tell compiler that this is tetra slice pipeline's entry function by '@tetra'
        @tetra fn main(input : InputType) -> OutputType{
            let campos = apply(camMat,input.pos);
            return OutputType(campos, array<mat4x4<f32>,2>(
                camMat.matrix * input.normal, input.uvw), campos
            );
        }
        `;
        fragHeaderCode = `
        // receive data from vertex output, these values are automatically interpolated for every fragment
        struct fInputType{
            @location(0) normal : vec4<f32>,
            @location(1) uvw : vec4<f32>,
            @location(2) pos : vec4<f32>,
        };
        // a color space conversion function
        fn hsb2rgb( c:vec3<f32> )->vec3<f32>{
            let a = fract(
                c.x+vec3<f32>(0.0,4.0,2.0)/6.0
            );
            var rgb = clamp(abs(a*6.0-vec3<f32>(3.0))-vec3<f32>(1.0),
                vec3<f32>(0.0),
                vec3<f32>(1.0)
            );
            rgb = rgb*rgb*(3.0-rgb * 2.0);
            return c.z * mix(vec3<f32>(1.0), rgb, c.y);
        }
        `;
        gpu;
        renderer;
        trackBallController;
        retinaController;
        ctrlRegistry;
        mesh;
        pipeline;
        canvas;
        context;
        vertBindGroup;
        camBuffer;
        async init(fragmentShaderCode, mesh) {
            this.gpu = await tesserxel.renderer.createGPU();
            this.canvas = document.getElementById("gpu-canvas");
            this.context = this.gpu.getContext(this.canvas);
            this.renderer = await new tesserxel.renderer.SliceRenderer().init(this.gpu, this.context, {
                // if this is set true, alpha blending will be more accurate but costy
                enableFloat16Blend: false,
                // how many slices are drawn together, this value must be 2^n and it can't be to big for resource limitation
                sliceGroupSize: 8
            });
            // set 4d camera
            this.renderer.set4DCameraProjectMatrix({
                fov: 100, near: 0.01, far: 10
            });
            // create a tetra slice pipeline
            this.pipeline = await this.renderer.createTetraSlicePipeline({
                vertex: { code: this.vertCode, entryPoint: "main" },
                fragment: {
                    code: this.fragHeaderCode + fragmentShaderCode,
                    entryPoint: "main",
                },
                cullMode: "none"
            });
            // vertex attrbutes buffers on gpu
            let positionBuffer = this.gpu.createBuffer(GPUBufferUsage.STORAGE, mesh.position);
            let normalBuffer = this.gpu.createBuffer(GPUBufferUsage.STORAGE, mesh.normal);
            let uvwBuffer = this.gpu.createBuffer(GPUBufferUsage.STORAGE, mesh.uvw);
            // camera affinemat buffer on gpu
            this.camBuffer = this.gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 4 * 4 * 5);
            // bind these buffers to group(1) in pipeline
            this.vertBindGroup = this.renderer.createVertexShaderBindGroup(this.pipeline, 1, [positionBuffer, normalBuffer, uvwBuffer, this.camBuffer]);
            // init a trackball controller in order to drag 4d object by mouse and keys
            this.trackBallController = new tesserxel.controller.TrackBallController();
            // randomize the initial orientation of the object controlled by trackball controller
            this.trackBallController.object.rotation.randset();
            // init a retina controller in order to adjust retina settings interactively like section thumbails and retina render layers
            this.retinaController = new tesserxel.controller.RetinaController(this.renderer);
            this.setSize();
            this.retinaController.mouseButton = null;
            this.ctrlRegistry = new tesserxel.controller.ControllerRegistry(this.canvas, [
                this.trackBallController, this.retinaController
            ], { preventDefault: true, requsetPointerLock: true });
            this.mesh = mesh;
            window.addEventListener("resize", this.setSize.bind(this));
            return this;
        }
        setSize() {
            let width = window.innerWidth * window.devicePixelRatio;
            let height = window.innerHeight * window.devicePixelRatio;
            this.canvas.width = width;
            this.canvas.height = height;
            this.retinaController.setSize({ width, height });
        }
        camMatJSBuffer = new Float32Array(20);
        run() {
            this.ctrlRegistry.update();
            this.trackBallController.object.getAffineMat4().writeBuffer(this.camMatJSBuffer);
            this.gpu.device.queue.writeBuffer(this.camBuffer, 0, this.camMatJSBuffer);
            this.renderer.render(() => {
                this.renderer.beginTetras(this.pipeline);
                this.renderer.sliceTetras(this.vertBindGroup, this.mesh.tetraCount);
                this.renderer.drawTetras();
            });
            window.requestAnimationFrame(this.run.bind(this));
        }
    }
    let tiger;
    (function (tiger) {
        async function load() {
            let fragCode = `
            @fragment fn main(vary: fInputType) -> @location(0) vec4<f32> {
                const ambientLight = vec3<f32>(0.1);
                const frontLightColor = vec3<f32>(5.0,4.6,3.5);
                const backLightColor = vec3<f32>(0.1,1.2,1.4);
                const directionalLight_dir = vec4<f32>(0.1,0.5,0.4,1.0);
                let halfvec = normalize(directionalLight_dir - normalize(vary.pos));
                let highLight = pow(max(0.0,dot(vary.normal,halfvec)),30);
                let checkerboard = fract(vary.uvw.xyz *vec3<f32>(40.0, 40.0, 20.0)) - vec3<f32>(0.5);
                let factor = step( checkerboard.x * checkerboard.y * checkerboard.z, 0.0);
                var color:vec3<f32> = mix(hsb2rgb(vec3<f32>(vary.uvw.x,0.7,1.0)), hsb2rgb(vec3<f32>(vary.uvw.y,1.0,0.7)), factor);
                color = color * (
                    frontLightColor * max(0, dot(directionalLight_dir , vary.normal)) + backLightColor * max(0, -dot(directionalLight_dir , vary.normal))
                )* (0.4 + 0.8*highLight);
                return vec4<f32>(pow(color,vec3<f32>(0.6))*0.5, 1.0);
            }`;
            let app = await new ShapesApp().init(fragCode, tesserxel.mesh.tetra.tiger(0.3 + Math.random() * 0.05, 32, 0.5, 32, 0.14 + Math.random() * 0.03, 16));
            app.retinaController.toggleSectionConfig("retina+zslices");
            app.run();
        }
        tiger.load = load;
    })(tiger = examples.tiger || (examples.tiger = {}));
    let glome;
    (function (glome) {
        async function load() {
            let fragCode = `
            @fragment fn main(vary: fInputType) -> @location(0) vec4<f32> {
                const ambientLight = vec3<f32>(0.1);
                const frontLightColor = vec3<f32>(5.0,4.6,3.5);
                const backLightColor = vec3<f32>(0.1,1.2,1.4);
                const directionalLight_dir = vec4<f32>(0.1,0.5,0.4,-1.0);
                let checkerboard = fract(vary.uvw.z * 4.0) - 0.5;
                let factor = step(checkerboard, 0.0);
                var color:vec3<f32> = mix(hsb2rgb(vec3<f32>(vary.uvw.x,0.7,1.0)), hsb2rgb(vec3<f32>(vary.uvw.y,1.0,0.7)), factor);
                color = color * (
                    frontLightColor * max(0, dot(directionalLight_dir , vary.normal)) + backLightColor * max(0, -dot(directionalLight_dir , vary.normal))
                );
                return vec4<f32>(pow(color,vec3<f32>(0.6))*0.5, mix(0.2,1.0,factor));
            }`;
            let app = await new ShapesApp().init(fragCode, tesserxel.mesh.tetra.glome(1.5, 32, 32, 16));
            let config = app.renderer.getSliceConfig();
            config.opacity = 10.0;
            // retina controller will own the slice config, so we should not call renderer.setSlice() directly
            app.retinaController.setSlice(config);
            app.run();
        }
        glome.load = load;
    })(glome = examples.glome || (examples.glome = {}));
    let tesseract;
    (function (tesseract) {
        async function load() {
            let fragCode = `
            @fragment fn main(vary: fInputType) -> @location(0) vec4<f32> {
                const colors = array<vec3<f32>,8> (
                    vec3<f32>(1, 0, 0),
                    vec3<f32>(1, 1, 0),
                    vec3<f32>(1, 0, 1),
                    vec3<f32>(0, 0, 1),
                    vec3<f32>(1, 0.5, 0),
                    vec3<f32>(0, 0.5, 1),
                    vec3<f32>(0, 1, 1),
                    vec3<f32>(0.6, 0.9, 0.2),
                );
                const radius: f32 = 0.8;
                const ambientLight = vec3<f32>(0.8);
                const frontLightColor = vec3<f32>(5.0,4.6,3.5);
                const backLightColor = vec3<f32>(1.9,2.4,2.8);
                const directionalLight_dir = vec4<f32>(0.1,0.5,0.4,1.0);
                var color:vec3<f32> = vec3(1.0,1.0,1.0);
                var count:f32 = 0;
                count += step(0.8,abs(vary.uvw.x));
                count += step(0.8,abs(vary.uvw.y));
                count += step(0.8,abs(vary.uvw.z));
                if(dot(vary.uvw.xyz,vary.uvw.xyz) < radius * radius * radius || count >= 2.0){
                    color = colors[u32(vary.uvw.w + 0.1)];
                }
                color = color * (
                    ambientLight + frontLightColor * max(0, dot(directionalLight_dir , vary.normal)) + backLightColor * max(0, -dot(directionalLight_dir , vary.normal))
                );
                return vec4<f32>(pow(color,vec3<f32>(0.6))*0.5, 0.2 + f32(count>=2.0));
            }`;
            let app = await new ShapesApp().init(fragCode, tesserxel.mesh.tetra.tesseract());
            // retina controller will own the slice config, so we should not call renderer.setSlice() directly
            app.retinaController.setOpacity(10.0);
            app.renderer.set4DCameraProjectMatrix({ fov: 110, near: 0.01, far: 10.0 });
            app.trackBallController.object.rotation.l.set();
            app.trackBallController.object.rotation.r.set();
            app.run();
        }
        tesseract.load = load;
    })(tesseract = examples.tesseract || (examples.tesseract = {}));
})(examples || (examples = {}));
//# sourceMappingURL=examples.js.map