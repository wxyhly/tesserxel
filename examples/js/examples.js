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
                    uvw: new Float32Array([
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
                    uvw: new Float32Array([
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
                scale.y += 1.5;
                scale.y *= 4;
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
            if(false && abscoord1.x*abscoord1.y*abscoord1.z <= 0.0){
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
            renderer.setCameraProjectMatrix({ fov: 100, near: 0.1, far: 500 });
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
            renderer.setOpacity(5);
            let camMatJSBuffer = new Float32Array(20);
            renderer.setScreenClearColor({ r: 1.0, g: 1.0, b: 1.0, a: 1.0 });
            renderer.setWorldClearColor({ r: 0.7, g: 0.85, b: 1.0, a: 0.1 });
            let run = () => {
                ctrlreg.update();
                camController.object.getAffineMat4inv().writeBuffer(camMatJSBuffer);
                gpu.device.queue.writeBuffer(camBuffer, 0, camMatJSBuffer);
                renderer.render(() => {
                    renderer.beginTetras(roadpipeline);
                    renderer.sliceTetras(roadmeshBindGroup, roadmesh.count);
                    renderer.drawTetras();
                    renderer.beginTetras(buildingPipeline);
                    renderer.sliceTetras(buildingBindGroup, buildingMesh.count - 5, buildingCount);
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
    let spring_rope;
    (function (spring_rope) {
        async function load() {
            const math = tesserxel.math;
            const glomeNums = 20;
            const glomeRadius = 0.1;
            const pointA = new math.Vec4(-1, 1, 0, 0);
            const pointB = new math.Vec4(1, 1, 0, 0);
            // init render scene
            const FOUR = tesserxel.four;
            const canvas = document.getElementById("gpu-canvas");
            const renderer = await new FOUR.Renderer(canvas).init();
            let scene = new FOUR.Scene();
            renderer.setBackgroudColor([1, 1, 1, 1]);
            scene.setBackgroudColor({ r: 0.8, g: 0.9, b: 1.0, a: 0.01 });
            let camera = new FOUR.Camera();
            camera.position.w = 2;
            scene.add(camera);
            const glomeGeometry = new FOUR.GlomeGeometry(glomeRadius);
            const materialRed = new FOUR.PhongMaterial({ r: 1.0, g: 0.0, b: 0.0, a: 1.0 });
            let renderGlomes = [];
            for (let i = 0; i < glomeNums; i++) {
                let g = new FOUR.Mesh(glomeGeometry, materialRed);
                renderGlomes.push(g);
                scene.add(g);
            }
            let meshGlome0 = new FOUR.Mesh(glomeGeometry, new FOUR.LambertMaterial({ r: 0.2, g: 0.2, b: 1.0, a: 1.0 }));
            let meshGlome1 = new FOUR.Mesh(glomeGeometry, new FOUR.LambertMaterial({ r: 0.2, g: 0.2, b: 1.0, a: 1.0 }));
            scene.add(meshGlome0);
            scene.add(meshGlome1);
            meshGlome0.position.copy(pointA);
            scene.add(new FOUR.DirectionalLight([3.3, 3, 3], new math.Vec4(0, 1, 0, 3).norms()));
            scene.add(new FOUR.DirectionalLight([0.2, 0.3, 0.4], math.Vec4.yNeg));
            const controllerRegistry = new tesserxel.controller.ControllerRegistry(canvas, [
                new tesserxel.controller.RetinaController(renderer.core),
                new tesserxel.controller.KeepUpController(camera)
            ], { requsetPointerLock: true });
            function setSize() {
                let width = window.innerWidth * window.devicePixelRatio;
                let height = window.innerHeight * window.devicePixelRatio;
                renderer.setSize({ width, height });
            }
            renderer.core.setOpacity(10);
            setSize();
            window.addEventListener("resize", setSize);
            // init physic scene
            const phy = tesserxel.physics;
            const engine = new phy.Engine({ forceAccumulator: phy.force_accumulator.RK4, broadPhase: phy.IgnoreAllBroadPhase });
            const world = new phy.World();
            // world.gravity.set();
            let k = 2000, l = 0.5 * 2 / (glomeNums + 1), v = 30;
            let physicGlomes = [];
            for (let i = 0; i < glomeNums; i++) {
                let g = new phy.Rigid({ geometry: new phy.rigid.Glome(glomeRadius), mass: 0.5, material: null });
                g.position.y = 1;
                g.position.x = ((i + 1) / (glomeNums + 1) - 0.5) * 2;
                // g.velocity.randset().mulfs(v);
                if (i)
                    world.add(new phy.force.Spring(g, physicGlomes[i - 1], new math.Vec4(), new math.Vec4(), k, l));
                world.add(g);
                physicGlomes.push(g);
            }
            world.add(new phy.force.Spring(physicGlomes[0], null, new math.Vec4(), pointA, k, l));
            world.add(new phy.force.Spring(physicGlomes[glomeNums - 1], null, new math.Vec4(), pointB, k, l));
            // run everything
            function run() {
                for (let i = 0; i < glomeNums; i++) {
                    renderGlomes[i].copyObj4(physicGlomes[i]);
                    renderGlomes[i].needsUpdateCoord = true;
                }
                const omega = 8;
                camera.needsUpdateCoord = true;
                pointB.set(0, Math.sin(world.time * omega) * 0.2 + 1, Math.cos(world.time * omega) * 0.2, 0);
                meshGlome1.position.copy(pointB);
                meshGlome1.needsUpdateCoord = true;
                controllerRegistry.update();
                renderer.render(scene, camera);
                engine.update(world, 1 / 60);
                window.requestAnimationFrame(run);
            }
            run();
        }
        spring_rope.load = load;
    })(spring_rope = examples.spring_rope || (examples.spring_rope = {}));
})(examples || (examples = {}));
var examples;
(function (examples) {
    /** Double rotation of a tesseract */
    let four_basic_scene;
    (function (four_basic_scene) {
        async function load() {
            const FOUR = tesserxel.four;
            const canvas = document.getElementById("gpu-canvas");
            /** This is a asycn function wait for request WebGPU adapter and do initiations */
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
            mesh.alwaysUpdateCoord = true; // to tell renderer to update mesh's orientation in every frame
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
                // For every frame, we rotate the mesh by angle of 0.01 radius degree in both xw and yz direction
                // We got a double clifford rotation here
                mesh.rotates(tesserxel.math.Bivec.xw.mulf(0.01).exp());
                mesh.rotates(tesserxel.math.Bivec.yz.mulf(0.01).exp());
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
            dirLight.alwaysUpdateCoord = true;
            pointLight.alwaysUpdateCoord = true;
            pointLight2.alwaysUpdateCoord = true;
            pointLight3.alwaysUpdateCoord = true;
            spotLight.alwaysUpdateCoord = true;
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
                uniformColor.write([Math.sin(t) * 0.3 + 0.7, Math.sin(t * 0.91) * 0.5 + 0.5, Math.sin(t * 1.414) * 0.5 + 0.5]);
                t += 0.01;
                controller.update();
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
    let hello_tetra1;
    (function (hello_tetra1) {
        async function load() {
            const gpu = await tesserxel.renderer.createGPU();
            const canvas = document.getElementById("gpu-canvas");
            const context = gpu.getContext(canvas);
            const renderer = await new tesserxel.renderer.SliceRenderer().init(gpu, context);
            const vertexShaderCode = `
            @tetra fn main() -> @builtin(position) mat4x4<f32> {
                return mat4x4<f32> (
                     1.0, 1.0, 1.0, -1.0,
                    -1.0,-1.0, 1.0, -1.0,
                     1.0,-1.0,-1.0, -1.0,
                    -1.0, 1.0,-1.0, -1.0
                );
            }
            `;
            const fragmentShaderCode = `
            @fragment fn main() -> @location(0) vec4<f32> {
                return vec4<f32> (1.0,0.0,0.0,1.0);
            }
            `;
            const pipeline = await renderer.createTetraSlicePipeline({
                vertex: {
                    code: vertexShaderCode,
                    entryPoint: "main"
                },
                fragment: {
                    code: fragmentShaderCode,
                    entryPoint: "main"
                }
            });
            const width = window.innerWidth * window.devicePixelRatio;
            const height = window.innerHeight * window.devicePixelRatio;
            canvas.width = width;
            canvas.height = height;
            renderer.setSize({ width, height });
            renderer.render(() => {
                renderer.beginTetras(pipeline);
                renderer.sliceTetras(null, 1);
                renderer.drawTetras();
            });
        }
        hello_tetra1.load = load;
    })(hello_tetra1 = examples.hello_tetra1 || (examples.hello_tetra1 = {}));
    let hello_tetra2;
    (function (hello_tetra2) {
        async function load() {
            const gpu = await tesserxel.renderer.createGPU();
            const canvas = document.getElementById("gpu-canvas");
            const context = gpu.getContext(canvas);
            const renderer = await new tesserxel.renderer.SliceRenderer().init(gpu, context);
            const vertexShaderCode = `
            struct TetraOutput{
                @builtin(position) position: mat4x4<f32>,
                @location(0) color: mat4x4<f32>,
            }
            @tetra fn main() -> TetraOutput {
                return TetraOutput(
                    mat4x4<f32> (
                        1.0, 1.0, 1.0, -1.0,
                        -1.0,-1.0, 1.0, -1.0,
                        1.0,-1.0,-1.0, -1.0,
                        -1.0, 1.0,-1.0, -1.0
                    ),
                    mat4x4<f32> (
                        0.0, 0.0, 1.0, 1.0, // blue
                        0.0, 1.0, 0.0, 1.0, // green
                        1.0, 0.0, 0.0, 1.0, // red
                        1.0, 1.0, 1.0, 1.0, // white
                    ),
                );
            }
            `;
            const fragmentShaderCode = `
            @fragment fn main(@location(0) color: vec4<f32>) -> @location(0) vec4<f32> {
                return color;
            }
            `;
            const pipeline = await renderer.createTetraSlicePipeline({
                vertex: {
                    code: vertexShaderCode,
                    entryPoint: "main"
                },
                fragment: {
                    code: fragmentShaderCode,
                    entryPoint: "main"
                }
            });
            const width = window.innerWidth * window.devicePixelRatio;
            const height = window.innerHeight * window.devicePixelRatio;
            canvas.width = width;
            canvas.height = height;
            renderer.setSize({ width, height });
            renderer.render(() => {
                renderer.beginTetras(pipeline);
                renderer.sliceTetras(null, 1);
                renderer.drawTetras();
            });
        }
        hello_tetra2.load = load;
    })(hello_tetra2 = examples.hello_tetra2 || (examples.hello_tetra2 = {}));
    let hello_tetra3;
    (function (hello_tetra3) {
        async function load() {
            const gpu = await tesserxel.renderer.createGPU();
            const canvas = document.getElementById("gpu-canvas");
            const context = gpu.getContext(canvas);
            const renderer = await new tesserxel.renderer.SliceRenderer().init(gpu, context);
            const vertexShaderCode = `
            @group(1) @binding(0) var<uniform> viewMat: mat4x4<f32>;
            struct TetraOutput{
                @builtin(position) position: mat4x4<f32>,
                @location(0) color: mat4x4<f32>,
            }
            @tetra fn main() -> TetraOutput {
                return TetraOutput(
                    viewMat * mat4x4<f32> (
                        1.0, 1.0, 1.0, -1.0,
                        -1.0,-1.0, 1.0, -1.0,
                        1.0,-1.0,-1.0, -1.0,
                        -1.0, 1.0,-1.0, -1.0
                    ),
                    mat4x4<f32> (
                        0.0, 0.0, 1.0, 1.0, // blue
                        0.0, 1.0, 0.0, 1.0, // green
                        1.0, 0.0, 0.0, 1.0, // red
                        1.0, 1.0, 1.0, 1.0, // white
                    ),
                );
            }
            `;
            const fragmentShaderCode = `
            @fragment fn main(@location(0) color: vec4<f32>) -> @location(0) vec4<f32> {
                return color;
            }
            `;
            const pipeline = await renderer.createTetraSlicePipeline({
                vertex: {
                    code: vertexShaderCode,
                    entryPoint: "main"
                },
                fragment: {
                    code: fragmentShaderCode,
                    entryPoint: "main"
                }
            });
            const viewMatJsBuffer = new Float32Array(16);
            const viewMatGpuBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, viewMatJsBuffer);
            const viewMatBindGroup = renderer.createVertexShaderBindGroup(pipeline, 1, [viewMatGpuBuffer]);
            const width = window.innerWidth * window.devicePixelRatio;
            const height = window.innerHeight * window.devicePixelRatio;
            canvas.width = width;
            canvas.height = height;
            renderer.setSize({ width, height });
            let angle = 0;
            function loop() {
                angle += 0.01;
                let s = Math.sin(angle), c = Math.cos(angle);
                viewMatJsBuffer.set([
                    c, 0, s, 0,
                    0, 1, 0, 0,
                    -s, 0, c, 0,
                    0, 0, 0, 1
                ]);
                gpu.device.queue.writeBuffer(viewMatGpuBuffer, 0, viewMatJsBuffer);
                renderer.render(() => {
                    renderer.beginTetras(pipeline);
                    renderer.sliceTetras(viewMatBindGroup, 1);
                    renderer.drawTetras();
                });
                window.requestAnimationFrame(loop);
            }
            loop();
        }
        hello_tetra3.load = load;
    })(hello_tetra3 = examples.hello_tetra3 || (examples.hello_tetra3 = {}));
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
            renderer.setOpacity(30.0);
            renderer.setCameraProjectMatrix({
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
                    renderer.sliceTetras(vertBindGroup, mesh.count, cubeCount);
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
            renderer.setSliceConfig({ retinaResolution: 64 });
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
                retinaController.setSectionEyeOffset(de * 0.2);
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
            app.retinaController.setOpacity(6);
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
            app.retinaController.setOpacity(2);
            app.run();
        }
        menger_sponge2.load = load;
    })(menger_sponge2 = examples.menger_sponge2 || (examples.menger_sponge2 = {}));
})(examples || (examples = {}));
var examples;
(function (examples) {
    let wave_eq;
    (function (wave_eq) {
        async function load() {
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
            const canvas = document.getElementById("gpu-canvas");
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
    })(wave_eq = examples.wave_eq || (examples.wave_eq = {}));
    class ErosionDisplayController {
        water = 1;
        height = 0.5;
        sediment = 0;
        enabled = true;
        buffer;
        constructor(jsBuffer) {
            this.buffer = jsBuffer;
        }
        update(state) {
            if (state.isKeyHold("KeyO")) {
                this.water = 0;
            }
            if (state.isKeyHold(".KeyL")) {
                this.water = 1;
            }
            if (state.isKeyHold("KeyL")) {
                this.water += 1.9;
            }
            if (state.isKeyHold("KeyI")) {
                this.sediment = 0;
            }
            if (state.isKeyHold("KeyK")) {
                this.sediment = 10000;
            }
            if (state.isKeyHold("KeyM")) {
                this.sediment = -10000;
            }
            if (state.isKeyHold("KeyU")) {
                this.height = 0.5;
            }
            if (state.isKeyHold("KeyJ")) {
                this.height = 1;
            }
            this.buffer[2] = this.water;
            this.buffer[3] = this.sediment;
            this.buffer[4] = this.height;
        }
    }
    let erosion;
    (function (erosion) {
        async function load() {
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
            const canvas = document.getElementById("gpu-canvas");
            const context = gpu.getContext(canvas);
            const renderer = await new tesserxel.renderer.SliceRenderer().init(gpu, context);
            renderer.setOpacity(20);
            renderer.setSliceConfig({ layers: 96 });
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
                let dispatchSize = [
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
        erosion.load = load;
    })(erosion = examples.erosion || (examples.erosion = {}));
})(examples || (examples = {}));
var examples;
(function (examples) {
    const FOUR = tesserxel.four;
    const phy = tesserxel.physics;
    const math = tesserxel.math;
    let rigidsInSceneLists = [];
    let geometryData = {};
    function getGeometryData(type) {
        if (geometryData[type])
            return geometryData[type];
        switch (type) {
            case "glome":
                geometryData[type] = new FOUR.GlomeGeometry(1);
                return geometryData[type];
            case "tesseractoid":
                geometryData[type] = new FOUR.TesseractGeometry(1);
                return geometryData[type];
            case "plane":
                geometryData[type] = new FOUR.CubeGeometry(50);
                return geometryData[type];
            default:
                let parse;
                parse = type.match(/^st(.+),(.+)$/);
                if (parse) {
                    geometryData[type] = new FOUR.SpheritorusGeometry(Number(parse[2]), Number(parse[1]));
                    return geometryData[type];
                }
                parse = type.match(/^ts(.+),(.+)$/);
                if (parse) {
                    geometryData[type] = new FOUR.TorisphereGeometry(Number(parse[2]), Number(parse[1]));
                    return geometryData[type];
                }
                parse = type.match(/^tg(.+),(.+),(.+)$/);
                if (parse) {
                    geometryData[type] = new FOUR.TigerGeometry(Number(parse[3]), Number(parse[1]), Number(parse[2]));
                    return geometryData[type];
                }
        }
    }
    function updateRidigsInScene() {
        for (let [mesh, rigid] of rigidsInSceneLists) {
            mesh.copyObj4(rigid);
        }
    }
    function addRigidToScene(world, scene, renderMaterial, ...rigids) {
        for (let rigid of rigids) {
            let geom;
            let obj4;
            if (rigid.geometry instanceof phy.rigid.Union) {
                for (let c of rigid.geometry.components) {
                    addRigidToScene(null, scene, renderMaterial, c);
                }
                world.add(rigid);
                return;
            }
            else if (rigid.geometry instanceof phy.rigid.Tesseractoid) {
                geom = getGeometryData("tesseractoid");
                obj4 = new math.Obj4(null, null, rigid.geometry.size);
            }
            else if (rigid.geometry instanceof phy.rigid.Convex) {
                geom = new FOUR.ConvexHullGeometry(rigid.geometry.points);
                obj4 = new math.Obj4();
            }
            else if (rigid.geometry instanceof phy.rigid.Glome) {
                geom = getGeometryData("glome");
                obj4 = new math.Obj4(null, null, new math.Vec4(rigid.geometry.radius, rigid.geometry.radius, rigid.geometry.radius, rigid.geometry.radius));
            }
            else if (rigid.geometry instanceof phy.rigid.Plane) {
                geom = getGeometryData("plane");
                obj4 = new math.Obj4(rigid.geometry.normal.mulf(rigid.geometry.offset), math.Rotor.lookAt(math.Vec4.y, rigid.geometry.normal));
            }
            else if (rigid.geometry instanceof phy.rigid.Spheritorus) {
                geom = getGeometryData("st" + rigid.geometry.majorRadius + "," + rigid.geometry.minorRadius);
                obj4 = new math.Obj4();
            }
            else if (rigid.geometry instanceof phy.rigid.Torisphere) {
                geom = getGeometryData("ts" + rigid.geometry.majorRadius + "," + rigid.geometry.minorRadius);
                obj4 = new math.Obj4();
            }
            else if (rigid.geometry instanceof phy.rigid.Tiger) {
                geom = getGeometryData("tg" + rigid.geometry.majorRadius1 + "," + rigid.geometry.majorRadius2 + "," + rigid.geometry.minorRadius);
                obj4 = new math.Obj4();
            }
            if (!geom) {
                console.log("unsupported geometry type");
            }
            let mesh = new FOUR.Mesh(geom, renderMaterial);
            mesh.copyObj4(obj4);
            mesh.alwaysUpdateCoord = true;
            world?.add(rigid);
            scene.add(mesh);
            if (!(rigid.geometry instanceof phy.rigid.Plane))
                rigidsInSceneLists.push([mesh, rigid]);
        }
    }
    function createGlome(radius = 1, mass = 1) {
        return new phy.Rigid({
            geometry: new phy.rigid.Glome(radius),
            material: new phy.Material(1, 0.8), mass
        });
    }
    class EmitGlomeController {
        enabled = true;
        world;
        scene;
        glomeMaterial = new FOUR.PhongMaterial([1.2, 0.4, 0.2]);
        camera;
        initialSpeed = 5;
        maximumBulletDistance = 30;
        glomeRadius = 0.5;
        constructor(world, scene, camera) {
            this.world = world;
            this.scene = scene;
            this.camera = camera;
        }
        update(state) {
            if (state.queryDisabled({ disable: "AltLeft" }))
                return;
            if (state.isPointerLocked() && state.mouseDown === 0) {
                let g = createGlome(this.glomeRadius, 5);
                g.label = "bullet"; // mark it
                g.position.copy(this.camera.position);
                g.velocity.copy(math.Vec4.wNeg.rotate(this.camera.rotation).mulfs(this.initialSpeed));
                addRigidToScene(this.world, this.scene, this.glomeMaterial, g);
            }
            for (let i = 0, l = rigidsInSceneLists.length; i < l; i++) {
                let [m, r] = rigidsInSceneLists[i];
                if (r.label === "bullet" && r.position.sub(this.camera.position).norm1() > this.maximumBulletDistance) {
                    this.scene.removeChild(m);
                    this.world.remove(r);
                    rigidsInSceneLists.splice(i--, 1);
                    l--;
                }
            }
        }
    }
    let st_pile;
    (function (st_pile) {
        async function load1() {
            const math = tesserxel.math;
            const canvas = document.getElementById("gpu-canvas");
            const renderer = await new FOUR.Renderer(canvas).init();
            let scene = new FOUR.Scene();
            renderer.setBackgroudColor([1, 1, 1, 1]);
            scene.setBackgroudColor({ r: 0.8, g: 0.9, b: 1.0, a: 0.01 });
            let camera = new FOUR.Camera();
            camera.position.w = 9;
            camera.position.y = 8;
            scene.add(camera);
            scene.add(new FOUR.AmbientLight(0.3));
            scene.add(new FOUR.DirectionalLight([2.2, 2.0, 1.9], new math.Vec4(0.2, 0.6, 0.1, 0.3).norms()));
            const materialGround = new FOUR.PhongMaterial([0, 0.6, 0.2, 0.1]);
            const materialBox = new FOUR.LambertMaterial(new FOUR.CheckerTexture([0, 0, 0, 0.5], [1, 1, 1, 0.5]));
            renderer.core.setEyeOffset(0.5);
            const retinaCtrl = new tesserxel.controller.RetinaController(renderer.core);
            const camCtrl = new tesserxel.controller.KeepUpController(camera);
            camCtrl.keyMoveSpeed = 0.01;
            function setSize() {
                let width = window.innerWidth * window.devicePixelRatio;
                let height = window.innerHeight * window.devicePixelRatio;
                renderer.setSize({ width, height });
            }
            setSize();
            window.addEventListener("resize", setSize);
            // init physic scene
            const phy = tesserxel.physics;
            const engine = new phy.Engine({ substep: 25 });
            const world = new phy.World();
            // world.gravity.set(0);
            const materialP = new phy.Material(1, 0.4);
            const material = new phy.Material(1, 0.4);
            const roomsize = 2;
            addRigidToScene(world, scene, materialGround, new phy.Rigid({ geometry: new phy.rigid.Plane(new math.Vec4(0, 1)), mass: 0, material: materialP }));
            // addRigidToScene(world, scene, materialGround, new phy.Rigid({ geometry: new phy.rigid.Plane(new math.Vec4(1), -roomsize), mass: 0, material: materialP }))
            // addRigidToScene(world, scene, materialGround, new phy.Rigid({ geometry: new phy.rigid.Plane(new math.Vec4(-1), -roomsize), mass: 0, material: materialP }))
            // addRigidToScene(world, scene, materialGround, new phy.Rigid({ geometry: new phy.rigid.Plane(new math.Vec4(0, 0, 0, 1), -roomsize), mass: 0, material: materialP }))
            // addRigidToScene(world, scene, materialGround, new phy.Rigid({ geometry: new phy.rigid.Plane(new math.Vec4(0, 0, 0, -1), -roomsize), mass: 0, material: materialP }))
            // addRigidToScene(world, scene, materialGround, new phy.Rigid({ geometry: new phy.rigid.Plane(new math.Vec4(0, 0, 1), -roomsize), mass: 0, material: materialP }))
            // addRigidToScene(world, scene, materialGround, new phy.Rigid({ geometry: new phy.rigid.Plane(new math.Vec4(0, 0, -1), -roomsize), mass: 0, material: materialP }))
            // world.add(new phy.PointConstrain(riigid, null, math.Vec4.xNeg, math.Vec4.y.mulf(3)));
            // let torisphere = new phy.Rigid({ geometry: new phy.rigid.Torisphere(1, 0.3), material, mass: 1 });
            // addRigidToScene(world, scene, materialBox, torisphere);
            // torisphere.position.y = 12;
            // torisphere.angularVelocity.randset();
            renderer.core.setOpacity(10);
            let spheritorusarr = [];
            let torispherearr = [];
            for (let i = -2; i < 2; i++) {
                let spheritorus = new phy.Rigid({ geometry: new phy.rigid.Spheritorus(1, 0.1), material, mass: 1 });
                addRigidToScene(world, scene, materialBox, spheritorus);
                spheritorus.rotatesb(math.Bivec.yw.mulf(math._90));
                spheritorus.angularVelocity.randset().mulfs(0.1);
                spheritorus.position.x = i * (8 / 3) + 3 / 4;
                spheritorus.position.y = 15.4;
                spheritorusarr.push(spheritorus);
                let torisphere = new phy.Rigid({ geometry: new phy.rigid.Torisphere(1, 0.1), material, mass: 1 });
                addRigidToScene(world, scene, materialBox, torisphere);
                torisphere.position.y = 15.4;
                torisphere.position.x = i * (8 / 3);
                torisphere.rotatesb(new math.Bivec(0.2));
                torispherearr.push(torisphere);
            }
            world.add(new phy.PointConstrain(torispherearr[0], null, math.Vec4.x, torispherearr[0].position.add(math.Vec4.x)));
            const controllerRegistry = new tesserxel.controller.ControllerRegistry(canvas, [
                retinaCtrl,
                camCtrl,
                new EmitGlomeController(world, scene, camera)
            ], { requsetPointerLock: true });
            let t = -2;
            let emitType = 0;
            let srand = new math.Srand(Math.random());
            function run() {
                t++;
                if ((t & 0xFF) === 0xFF) {
                    // emitType++;
                    // let geometry: tesserxel.physics.RigidGeometry;
                    // // let torisphere = new phy.Rigid({ geometry: new phy.rigid.Tesseractoid(new math.Vec4(3, 3, 3, 3).adds(math.Vec4.srand(srand)).divfs(3)), material, mass: 1 });
                    // switch (emitType & 1) {
                    //     case 0:
                    //         geometry = new phy.rigid.Torisphere(1, 0.3);
                    //         break;
                    //     case 1:
                    //         geometry = new phy.rigid.Spheritorus(1, 0.3);
                    //         break;
                    //     // case 2:
                    //     //     geometry = new phy.rigid.Spheritorus(1, 0.3);
                    //     //     break;
                    // }
                }
                updateRidigsInScene();
                controllerRegistry.update();
                renderer.render(scene, camera);
                camera.needsUpdateCoord = true;
                if (t > 0)
                    engine.update(world, controllerRegistry.states.mspf / 1000);
                window.requestAnimationFrame(run);
            }
            run();
        }
        st_pile.load1 = load1;
        async function load() {
            const engine = new phy.Engine({ substep: 8 });
            const world = new phy.World();
            const scene = new FOUR.Scene();
            // define physical materials: frictions and restitutions
            const phyMatSt = new phy.Material(1, 0.2);
            const phyMatRoom = new phy.Material(1, 0.4);
            // define render materials
            const renderMatSts = [
                [0.1, 0.1, 0.1, 1], [0.1, 0.1, 0.1, 1], [0.9, 0.9, 0, 1], [0, 0.3, 0.9, 1],
                [0.9, 0.1, 0.1, 1], [0.7, 0.0, 1.0, 1], [0.5, 0.5, 0.5, 1], [0, 0.9, 0, 1],
            ].map(color => new FOUR.PhongMaterial(new FOUR.CheckerTexture(color, [1, 1, 1, 1], new FOUR.Vec4TransformNode(new FOUR.UVWVec4Input(), new math.Obj4(null, null, new math.Vec4(0, 0, 10, 0))))));
            const renderMatRoom = new FOUR.LambertMaterial([0.8, 0.6, 0.3, 0.08]);
            renderMatRoom.cullMode = "back";
            const roomSize = 2.5;
            // floor
            world.add(new phy.Rigid({
                geometry: new phy.rigid.Plane(new math.Vec4(0, 1)), material: phyMatRoom, mass: 0
            }));
            // left wall
            world.add(new phy.Rigid({
                geometry: new phy.rigid.Plane(new math.Vec4(1), -roomSize), material: phyMatRoom, mass: 0
            }));
            // right wall
            world.add(new phy.Rigid({
                geometry: new phy.rigid.Plane(new math.Vec4(-1), -roomSize), material: phyMatRoom, mass: 0
            }));
            // ana wall
            world.add(new phy.Rigid({
                geometry: new phy.rigid.Plane(new math.Vec4(0, 0, 1), -roomSize), material: phyMatRoom, mass: 0
            }));
            //kata wall
            world.add(new phy.Rigid({
                geometry: new phy.rigid.Plane(new math.Vec4(0, 0, -1), -roomSize), material: phyMatRoom, mass: 0
            }));
            // front wall
            world.add(new phy.Rigid({
                geometry: new phy.rigid.Plane(new math.Vec4(0, 0, 0, 1), -roomSize), material: phyMatRoom, mass: 0
            }));
            //back wall
            world.add(new phy.Rigid({
                geometry: new phy.rigid.Plane(new math.Vec4(0, 0, 0, -1), -roomSize), material: phyMatRoom, mass: 0
            }));
            let roomMesh = new FOUR.Mesh(new FOUR.TesseractGeometry(roomSize), renderMatRoom);
            roomMesh.position.y += roomSize;
            tesserxel.mesh.tetra.inverseNormal(roomMesh.geometry.jsBuffer);
            scene.add(roomMesh);
            // set up lights, camera and renderer
            let camera = new FOUR.Camera();
            camera.position.w = 3;
            camera.position.y = 1.5;
            scene.add(camera);
            scene.add(new FOUR.AmbientLight(0.1));
            scene.add(new FOUR.DirectionalLight([2.2, 2.0, 1.9], new math.Vec4(0.2, 0.6, 0.1, 0.3).norms()));
            scene.add(new FOUR.DirectionalLight([0.1, 0.2, 0.3], new math.Vec4(-0.2, 0.2, -0.2, -0.4).norms()));
            scene.setBackgroudColor({ r: 0.8, g: 0.9, b: 1.0, a: 0.01 });
            const canvas = document.getElementById("gpu-canvas");
            const renderer = await new FOUR.Renderer(canvas).init();
            renderer.core.setScreenClearColor([1, 1, 1, 1]);
            renderer.core.setEyeOffset(0.5);
            renderer.core.setOpacity(10);
            // controllers
            const camCtrl = new tesserxel.controller.KeepUpController(camera);
            camCtrl.keyMoveSpeed = 0.003;
            const retinaCtrl = new tesserxel.controller.RetinaController(renderer.core);
            const emitCtrl = new EmitGlomeController(world, scene, camera);
            emitCtrl.initialSpeed = 5;
            const controllerRegistry = new tesserxel.controller.ControllerRegistry(canvas, [
                retinaCtrl,
                camCtrl,
                emitCtrl
            ], { requsetPointerLock: true });
            function setSize() {
                let width = window.innerWidth * window.devicePixelRatio;
                let height = window.innerHeight * window.devicePixelRatio;
                renderer.setSize({ width, height });
            }
            let tick = -2;
            function run() {
                // emit a tesseract for every 256 ticks
                if ((tick++ & 0xFF) === 0xFF) {
                    let spheritorus = new phy.Rigid({
                        geometry: new phy.rigid.Spheritorus(1, 0.3),
                        material: phyMatSt, mass: 1
                    });
                    spheritorus.position.y = 8;
                    spheritorus.rotatesb(new math.Bivec(0, tick / 0xFF / 10));
                    spheritorus.angularVelocity.randset().mulfs(0.01);
                    addRigidToScene(world, scene, renderMatSts[(tick >> 8) & 7], spheritorus);
                }
                // syncronise physics world and render scene
                updateRidigsInScene();
                // update controller states
                controllerRegistry.update();
                // rendering
                renderer.render(scene, camera);
                // simulating physics
                engine.update(world, Math.min(1 / 15, controllerRegistry.states.mspf / 1000));
                window.requestAnimationFrame(run);
            }
            window.addEventListener("resize", setSize);
            setSize();
            run();
        }
        st_pile.load = load;
    })(st_pile = examples.st_pile || (examples.st_pile = {}));
    let rigid_test;
    (function (rigid_test) {
        async function load() {
            const engine = new phy.Engine({ substep: 30 });
            const world = new phy.World();
            const scene = new FOUR.Scene();
            // define physical materials: frictions and restitutions
            const phyMatBox = new phy.Material(1, 0.4);
            const phyMatGround = new phy.Material(1, 0.4);
            // define render materials
            const renderMatBox1 = new FOUR.LambertMaterial(new FOUR.CheckerTexture([0, 0, 0, 1], [1, 1, 1, 1]));
            const renderMatBox2 = new FOUR.PhongMaterial(new FOUR.GridTexture([0, 0, 0, 1], [1, 1, 0, 1], 0.5, new FOUR.Vec4TransformNode(new FOUR.UVWVec4Input(), new math.Obj4(null, null, new math.Vec4(5, 5, 5, 5)))));
            const renderMatGround = new FOUR.LambertMaterial([0.2, 1, 0.2, 0.08]);
            // add ground
            addRigidToScene(world, scene, renderMatGround, new phy.Rigid({
                geometry: new phy.rigid.Plane(new math.Vec4(0, 1)),
                mass: 0, material: phyMatGround
            }));
            // set up lights, camera and renderer
            let camera = new FOUR.Camera();
            camera.position.w = 4;
            camera.position.y = 4;
            scene.add(camera);
            scene.add(new FOUR.AmbientLight(0.3));
            scene.add(new FOUR.DirectionalLight([2.2, 2.0, 1.9], new math.Vec4(0.2, 0.6, 0.1, 0.3).norms()));
            scene.setBackgroudColor({ r: 0.8, g: 0.9, b: 1.0, a: 0.01 });
            const canvas = document.getElementById("gpu-canvas");
            const renderer = await new FOUR.Renderer(canvas).init();
            renderer.core.setScreenClearColor([1, 1, 1, 1]);
            renderer.core.setEyeOffset(0.5);
            renderer.core.setOpacity(10);
            // controllers
            const camCtrl = new tesserxel.controller.KeepUpController(camera);
            camCtrl.keyMoveSpeed = 0.01;
            const retinaCtrl = new tesserxel.controller.RetinaController(renderer.core);
            const emitCtrl = new EmitGlomeController(world, scene, camera);
            emitCtrl.initialSpeed = 10;
            const controllerRegistry = new tesserxel.controller.ControllerRegistry(canvas, [
                retinaCtrl,
                camCtrl,
                emitCtrl
            ], { requsetPointerLock: true });
            function setSize() {
                let width = window.innerWidth * window.devicePixelRatio;
                let height = window.innerHeight * window.devicePixelRatio;
                renderer.setSize({ width, height });
            }
            let tick = -2;
            function run() {
                // emit a tesseract for every 256 ticks
                if ((tick++ & 0xFF) === 0xFF) {
                    let randomChoose = Math.random() > 0.5;
                    // give random size to tesseractoid
                    let size = math.Vec4.rand().mulfs(randomChoose ? 0.1 : 0.7);
                    size.adds(new math.Vec4(1, 1, 1, 1));
                    let tesseract = new phy.Rigid({
                        geometry: new phy.rigid.Tesseractoid(size),
                        material: phyMatBox, mass: 1
                    });
                    if (randomChoose) {
                        // give random rotation to tesseractoid
                        let randVec3 = math.Vec3.rand().mulfs(0.1);
                        tesseract.rotatesb(new math.Bivec(0, randVec3.x, randVec3.y, 0, 0, randVec3.z));
                    }
                    tesseract.position.y = 15;
                    addRigidToScene(world, scene, randomChoose ? renderMatBox1 : renderMatBox2, tesseract);
                }
                // syncronise physics world and render scene
                updateRidigsInScene();
                // update controller states
                controllerRegistry.update();
                // rendering
                renderer.render(scene, camera);
                // simulating physics
                engine.update(world, Math.min(1 / 15, controllerRegistry.states.mspf / 1000));
                window.requestAnimationFrame(run);
            }
            window.addEventListener("resize", setSize);
            setSize();
            run();
        }
        rigid_test.load = load;
    })(rigid_test = examples.rigid_test || (examples.rigid_test = {}));
    let st_ts_chain;
    (function (st_ts_chain) {
        async function load() {
            const engine = new phy.Engine({ substep: 30 });
            const world = new phy.World();
            const scene = new FOUR.Scene();
            // define physical materials: frictions and restitutions
            const phyMatChain = new phy.Material(0.4, 0.4);
            const phyMatGround = new phy.Material(1, 0.4);
            // define render materials
            const renderMatSpheritorus = new FOUR.LambertMaterial([1, 0.1, 0.1, 1]);
            const renderMatTorisphere = new FOUR.LambertMaterial([0.2, 0.2, 1, 1]);
            const renderMatGround = new FOUR.LambertMaterial([0.2, 1, 0.2, 0.03]);
            // add ground
            addRigidToScene(world, scene, renderMatGround, new phy.Rigid({
                geometry: new phy.rigid.Plane(new math.Vec4(0, 1)),
                mass: 0, material: phyMatGround
            }));
            // add spheritorus - torisphere chain
            let spheritorusArr = [];
            let torisphereArr = [];
            for (let i = -2; i <= 2; i++) {
                let spheritorus = new phy.Rigid({
                    geometry: new phy.rigid.Spheritorus(1, 0.15),
                    material: phyMatChain, mass: 1
                });
                addRigidToScene(world, scene, renderMatSpheritorus, spheritorus);
                spheritorus.rotatesb(math.Bivec.yw.mulf(math._90));
                spheritorus.position.x = i * (8 / 3) + 3 / 4;
                spheritorus.position.y = 15.4;
                spheritorusArr.push(spheritorus);
                let torisphere = new phy.Rigid({
                    geometry: new phy.rigid.Torisphere(1, 0.15),
                    material: phyMatChain, mass: 1
                });
                addRigidToScene(world, scene, renderMatTorisphere, torisphere);
                torisphere.position.y = 15.4;
                torisphere.position.x = i * (8 / 3);
                torisphere.rotatesb(new math.Bivec(0.2));
                torisphereArr.push(torisphere);
            }
            // add point constrain to the first ring
            world.add(new phy.PointConstrain(torisphereArr[0], null, math.Vec4.x, torisphereArr[0].position.add(math.Vec4.x)));
            // set up lights, camera and renderer
            let camera = new FOUR.Camera();
            camera.position.w = 9;
            camera.position.y = 8;
            scene.add(camera);
            scene.add(new FOUR.AmbientLight(0.3));
            scene.add(new FOUR.DirectionalLight([2.2, 2.0, 1.9], new math.Vec4(0.2, 0.6, 0.1, 0.3).norms()));
            scene.setBackgroudColor({ r: 0.8, g: 0.9, b: 1.0, a: 0.01 });
            const canvas = document.getElementById("gpu-canvas");
            const renderer = await new FOUR.Renderer(canvas).init();
            renderer.core.setScreenClearColor([1, 1, 1, 1]);
            renderer.core.setEyeOffset(0.5);
            renderer.core.setOpacity(20);
            // controllers
            const camCtrl = new tesserxel.controller.KeepUpController(camera);
            camCtrl.keyMoveSpeed = 0.01;
            const retinaCtrl = new tesserxel.controller.RetinaController(renderer.core);
            const emitCtrl = new EmitGlomeController(world, scene, camera);
            emitCtrl.glomeRadius = 2;
            emitCtrl.maximumBulletDistance = 70;
            emitCtrl.initialSpeed = 10;
            const controllerRegistry = new tesserxel.controller.ControllerRegistry(canvas, [
                retinaCtrl,
                camCtrl,
                emitCtrl
            ], { requsetPointerLock: true });
            function setSize() {
                let width = window.innerWidth * window.devicePixelRatio;
                let height = window.innerHeight * window.devicePixelRatio;
                renderer.setSize({ width, height });
            }
            function run() {
                // syncronise physics world and render scene
                updateRidigsInScene();
                // update controller states
                controllerRegistry.update();
                // rendering
                renderer.render(scene, camera);
                // simulating physics
                engine.update(world, Math.min(1 / 15, controllerRegistry.states.mspf / 1000));
                window.requestAnimationFrame(run);
            }
            window.addEventListener("resize", setSize);
            setSize();
            run();
        }
        st_ts_chain.load = load;
        // test
        async function load1() {
            let v = (...args) => new tesserxel.math.Vec4(...args);
            // let convex = [
            //     v(-1, -1, -1),
            //     v(-1, 1, -1),
            //     v(1, -1, -1),
            //     v(1, 1, -1),
            //     v(-1, -1, 1),
            //     v(-1, 1, 1),
            //     v(1, -1, 1),
            //     v(1, 1, 1),
            // ];
            // let p = v(-0.97,-0.98,0.1);// [1, 2, 3, 4]
            // let p = v(-0.8,-0.99,0.5);// [1, 2, 3, 4]
            // let p = v(1.06, -1.08, -1.1);// [1, 2, 3, 4, 3] 
            // let p = v(10,12,13);//  [1, 2, 1]
            // let convex = [
            //     v(-1,-1,-1,-1),
            //     v(-1,1, -1,-1),
            //     v(1,-1, -1,-1),
            //     v(1,1,  -1,-1),
            //     v(-1,-1,-1,1),
            //     v(-1,1, -1,1),
            //     v(1,-1, -1,1),
            //     v(1,1,  -1,1),
            //     v(-1,-1,1,-1),
            //     v(-1,1, 1,-1),
            //     v(1,-1, 1,-1),
            //     v(1,1,  1,-1),
            //     v(-1,-1,1,1),
            //     v(-1,1, 1,1),
            //     v(1,-1, 1,1),
            //     v(1,1,  1,1),
            // ];
            // let p = v(0.1,0.001,0.5,0.01);
            // let convex = [
            //     v(1),
            //     v(),
            //     v(0, 0, 0, 1),
            //     v(0, 1),
            //     v(0, 0, 1),
            //     v(-1),
            //     v(0, -1),
            //     v(0, 0, -1),
            //     v(0, 0, 0, -1),
            // ];
            // let p = v(0.02, 0.03, -0.01, 0.04);//[1,2,3,4,5]
            for (let i = 0; i < 10; i++) {
                // let r = tesserxel.math.Bivec.yw.exp();
                let convex = new Array(1024).fill(0).map(e => tesserxel.math.Vec4.rand().mulfs(4));
                let p = tesserxel.math.Vec4.rand().mulfs(2);
                let dconvex = convex.map(v => v.sub(p));
                let newer = (tesserxel.physics.gjkDiffTest([p], convex));
                let older = (tesserxel.physics.gjkOutDistance(dconvex));
                if (older.normal) {
                    console.assert(!newer.normals, "fake inter");
                    // console.log("no inter");
                }
                else {
                    console.assert(!!newer.normals, "fake non inter");
                    let epa = tesserxel.physics.epa(dconvex, older);
                    let epadiff = tesserxel.physics.epaDiff([p], convex, newer);
                    console.assert(Math.abs(epa.distance - epadiff.distance) < 0.00001);
                    console.log(epa);
                    console.log(epadiff);
                }
            }
        }
        st_ts_chain.load1 = load1;
    })(st_ts_chain = examples.st_ts_chain || (examples.st_ts_chain = {}));
    let tg_tg_chain;
    (function (tg_tg_chain) {
        async function load() {
            const engine = new phy.Engine({ substep: 30 });
            const world = new phy.World();
            const scene = new FOUR.Scene();
            // define physical materials: frictions and restitutions
            const phyMatChain = new phy.Material(0.4, 0.4);
            const phyMatGround = new phy.Material(1, 0.4);
            // define render materials
            const renderMatTiger1 = new FOUR.LambertMaterial([1, 0.1, 0.1, 1]);
            const renderMatTiger2 = new FOUR.LambertMaterial([0.2, 0.2, 1, 1]);
            const renderMatGround = new FOUR.LambertMaterial([0.2, 1, 0.2, 0.03]);
            // add ground
            addRigidToScene(world, scene, renderMatGround, new phy.Rigid({
                geometry: new phy.rigid.Plane(new math.Vec4(0, 1)),
                mass: 0, material: phyMatGround
            }));
            // add tiger chain
            let tg1Arr = [];
            let tg2Arr = [];
            const gap = 2.718;
            for (let i = -2; i <= 2; i++) {
                let tg1 = new phy.Rigid({
                    geometry: new phy.rigid.Tiger(1, 1, 0.15),
                    material: phyMatChain, mass: 1
                });
                addRigidToScene(world, scene, renderMatTiger1, tg1);
                tg1.rotatesb(math.Bivec.yw.mulf(math._90)).rotatesb(math.Bivec.xy.mulf(math._60));
                tg1.position.x = i * gap;
                tg1.position.y = 15.4;
                tg1Arr.push(tg1);
                let tg2 = new phy.Rigid({
                    geometry: new phy.rigid.Tiger(0.7, 0.5, 0.15),
                    material: phyMatChain, mass: 1
                });
                addRigidToScene(world, scene, renderMatTiger2, tg2);
                tg2.position.y = 15.4;
                tg2.position.x = (i + 0.5) * gap;
                tg2.rotatesb(new math.Bivec(0.2));
                tg2Arr.push(tg2);
            }
            // add point constrain to the first ring
            world.add(new phy.PointConstrain(tg1Arr[0], null, math.Vec4.x, tg1Arr[0].position.add(math.Vec4.x.rotate(tg1Arr[0].rotation))));
            // set up lights, camera and renderer
            let camera = new FOUR.Camera();
            camera.position.w = 9;
            camera.position.y = 8;
            scene.add(camera);
            scene.add(new FOUR.AmbientLight(0.3));
            scene.add(new FOUR.DirectionalLight([2.2, 2.0, 1.9], new math.Vec4(0.2, 0.6, 0.1, 0.3).norms()));
            scene.setBackgroudColor({ r: 0.8, g: 0.9, b: 1.0, a: 0.01 });
            const canvas = document.getElementById("gpu-canvas");
            const renderer = await new FOUR.Renderer(canvas).init();
            renderer.core.setScreenClearColor([1, 1, 1, 1]);
            renderer.core.setEyeOffset(0.5);
            renderer.core.setOpacity(20);
            // controllers
            const camCtrl = new tesserxel.controller.KeepUpController(camera);
            camCtrl.keyMoveSpeed = 0.01;
            const retinaCtrl = new tesserxel.controller.RetinaController(renderer.core);
            const emitCtrl = new EmitGlomeController(world, scene, camera);
            emitCtrl.glomeRadius = 2;
            emitCtrl.maximumBulletDistance = 70;
            emitCtrl.initialSpeed = 10;
            const controllerRegistry = new tesserxel.controller.ControllerRegistry(canvas, [
                retinaCtrl,
                camCtrl,
                emitCtrl
            ], { requsetPointerLock: true });
            function setSize() {
                let width = window.innerWidth * window.devicePixelRatio;
                let height = window.innerHeight * window.devicePixelRatio;
                renderer.setSize({ width, height });
            }
            function run() {
                // syncronise physics world and render scene
                updateRidigsInScene();
                // update controller states
                controllerRegistry.update();
                // rendering
                renderer.render(scene, camera);
                // simulating physics
                engine.update(world, Math.min(1 / 15, controllerRegistry.states.mspf / 1000));
                window.requestAnimationFrame(run);
            }
            window.addEventListener("resize", setSize);
            setSize();
            run();
        }
        tg_tg_chain.load = load;
    })(tg_tg_chain = examples.tg_tg_chain || (examples.tg_tg_chain = {}));
    let mix_chain;
    (function (mix_chain) {
        async function load() {
            const engine = new phy.Engine({ substep: 30 });
            const world = new phy.World();
            const scene = new FOUR.Scene();
            // define physical materials: frictions and restitutions
            const phyMatChain = new phy.Material(0.4, 0.4);
            const phyMatGround = new phy.Material(1, 0.4);
            // define render materials
            const renderMatTiger = new FOUR.LambertMaterial([0.4, 0.4, 0.4, 1]);
            const renderMatST = new FOUR.LambertMaterial([1, 0.1, 0.1, 1]);
            const renderMatTS = new FOUR.LambertMaterial([0.2, 0.2, 1, 1]);
            const renderMatGround = new FOUR.LambertMaterial([0.2, 1, 0.2, 0.03]);
            // add ground
            addRigidToScene(world, scene, renderMatGround, new phy.Rigid({
                geometry: new phy.rigid.Plane(new math.Vec4(0, 1)),
                mass: 0, material: phyMatGround
            }));
            // add tiger chain
            let tgArr = [];
            let tsArr = [];
            let stArr = [];
            const gap = 3.1;
            for (let i = -2; i < 2; i++) {
                let tg = new phy.Rigid({
                    geometry: new phy.rigid.Tiger(0.7, 0.5, 0.15),
                    material: phyMatChain, mass: 1
                });
                addRigidToScene(world, scene, renderMatTiger, tg);
                // tg.rotatesb(math.Bivec.yw.mulf(math._90)).rotatesb(math.Bivec.xy.mulf(math._60));
                tg.position.x = i * gap;
                tg.position.y = 15.4;
                tgArr.push(tg);
                let ts = new phy.Rigid({
                    geometry: new phy.rigid.Torisphere(1, 0.15),
                    material: phyMatChain, mass: 1
                });
                addRigidToScene(world, scene, renderMatTS, ts);
                ts.position.y = 15.1;
                ts.position.x = (i + 0.33) * gap;
                // ts.rotatesb(new math.Bivec(0.2));
                tsArr.push(ts);
                let st = new phy.Rigid({
                    geometry: new phy.rigid.Spheritorus(0.9, 0.15),
                    material: phyMatChain, mass: 0.8
                });
                addRigidToScene(world, scene, renderMatST, st);
                st.position.y = 15.2;
                st.position.w = -0.5;
                st.position.x = (i + 0.62) * gap;
                st.rotatesb(new math.Bivec(0, 0, 0, 0, 0.9)).rotatesb(new math.Bivec(0, 0, 0.5)).rotatesb(new math.Bivec(-0.4));
                stArr.push(st);
            }
            // add point constrain to the first ring
            world.add(new phy.PointConstrain(tgArr[0], null, math.Vec4.x, tgArr[0].position.add(math.Vec4.x.rotate(tgArr[0].rotation))));
            // set up lights, camera and renderer
            let camera = new FOUR.Camera();
            camera.position.w = 9;
            camera.position.y = 8;
            scene.add(camera);
            scene.add(new FOUR.AmbientLight(0.3));
            scene.add(new FOUR.DirectionalLight([2.2, 2.0, 1.9], new math.Vec4(0.2, 0.6, 0.1, 0.3).norms()));
            scene.setBackgroudColor({ r: 0.8, g: 0.9, b: 1.0, a: 0.01 });
            const canvas = document.getElementById("gpu-canvas");
            const renderer = await new FOUR.Renderer(canvas).init();
            renderer.core.setScreenClearColor([1, 1, 1, 1]);
            renderer.core.setEyeOffset(0.5);
            renderer.core.setOpacity(20);
            // controllers
            const camCtrl = new tesserxel.controller.KeepUpController(camera);
            camCtrl.keyMoveSpeed = 0.01;
            const retinaCtrl = new tesserxel.controller.RetinaController(renderer.core);
            const emitCtrl = new EmitGlomeController(world, scene, camera);
            emitCtrl.glomeRadius = 2;
            emitCtrl.maximumBulletDistance = 70;
            emitCtrl.initialSpeed = 10;
            await emitCtrl.glomeMaterial.compile(renderer);
            const controllerRegistry = new tesserxel.controller.ControllerRegistry(canvas, [
                retinaCtrl,
                camCtrl,
                emitCtrl
            ], { requsetPointerLock: true });
            function setSize() {
                let width = window.innerWidth * window.devicePixelRatio;
                let height = window.innerHeight * window.devicePixelRatio;
                renderer.setSize({ width, height });
            }
            function run() {
                // syncronise physics world and render scene
                updateRidigsInScene();
                // update controller states
                controllerRegistry.update();
                // rendering
                renderer.render(scene, camera);
                // simulating physics
                engine.update(world, Math.min(1 / 15, controllerRegistry.states.mspf / 1000));
                window.requestAnimationFrame(run);
            }
            window.addEventListener("resize", setSize);
            setSize();
            run();
        }
        mix_chain.load = load;
    })(mix_chain = examples.mix_chain || (examples.mix_chain = {}));
    async function loadMaxwell(cb) {
        const engine = new phy.Engine({ substep: 30, forceAccumulator: phy.force_accumulator.RK4 });
        const world = new phy.World();
        const scene = new FOUR.Scene();
        // define physical materials: frictions and restitutions
        const phyMatGround = new phy.Material(1, 0.8);
        // define render materials
        const renderMatGround = new FOUR.LambertMaterial([0.2, 1, 0.2, 0.03]);
        renderMatGround.cullMode = "back";
        const roomSize = 6;
        // floor
        world.add(new phy.Rigid({
            geometry: new phy.rigid.Plane(new math.Vec4(0, 1)), material: phyMatGround, mass: 0
        }));
        // ceil
        world.add(new phy.Rigid({
            geometry: new phy.rigid.Plane(new math.Vec4(0, -1), -roomSize * 2), material: phyMatGround, mass: 0
        }));
        // left wall
        world.add(new phy.Rigid({
            geometry: new phy.rigid.Plane(new math.Vec4(1), -roomSize), material: phyMatGround, mass: 0
        }));
        // right wall
        world.add(new phy.Rigid({
            geometry: new phy.rigid.Plane(new math.Vec4(-1), -roomSize), material: phyMatGround, mass: 0
        }));
        // ana wall
        world.add(new phy.Rigid({
            geometry: new phy.rigid.Plane(new math.Vec4(0, 0, 1), -roomSize), material: phyMatGround, mass: 0
        }));
        //kata wall
        world.add(new phy.Rigid({
            geometry: new phy.rigid.Plane(new math.Vec4(0, 0, -1), -roomSize), material: phyMatGround, mass: 0
        }));
        // front wall
        world.add(new phy.Rigid({
            geometry: new phy.rigid.Plane(new math.Vec4(0, 0, 0, 1), -roomSize), material: phyMatGround, mass: 0
        }));
        //back wall
        world.add(new phy.Rigid({
            geometry: new phy.rigid.Plane(new math.Vec4(0, 0, 0, -1), -roomSize), material: phyMatGround, mass: 0
        }));
        let roomMesh = new FOUR.Mesh(new FOUR.TesseractGeometry(roomSize), renderMatGround);
        roomMesh.position.y += roomSize;
        tesserxel.mesh.tetra.inverseNormal(roomMesh.geometry.jsBuffer);
        scene.add(roomMesh);
        let maxwell = new phy.force.MaxWell();
        world.add(maxwell);
        const canvas = document.getElementById("gpu-canvas");
        const renderer = await new FOUR.Renderer(canvas).init();
        await cb(world, maxwell, scene, renderer);
        // set up lights, camera and renderer
        let camera = new FOUR.Camera();
        camera.position.w = 9;
        camera.position.y = 8;
        scene.add(camera);
        scene.add(new FOUR.AmbientLight(0.3));
        scene.add(new FOUR.DirectionalLight([2.2, 2.0, 1.9], new math.Vec4(0.2, 0.6, 0.1, 0.3).norms()));
        scene.setBackgroudColor({ r: 0.8, g: 0.9, b: 1.0, a: 0.01 });
        await renderer.compileMaterials(scene);
        renderer.core.setScreenClearColor([1, 1, 1, 1]);
        renderer.core.setEyeOffset(0.5);
        renderer.core.setOpacity(20);
        // controllers
        const camCtrl = new tesserxel.controller.KeepUpController(camera);
        camCtrl.keyMoveSpeed = 0.01;
        const retinaCtrl = new tesserxel.controller.RetinaController(renderer.core);
        const emitCtrl = new EmitGlomeController(world, scene, camera);
        emitCtrl.glomeRadius = 1;
        emitCtrl.maximumBulletDistance = 70;
        emitCtrl.initialSpeed = 10;
        const controllerRegistry = new tesserxel.controller.ControllerRegistry(canvas, [
            retinaCtrl,
            camCtrl,
            emitCtrl
        ], { requsetPointerLock: true });
        function setSize() {
            let width = window.innerWidth * window.devicePixelRatio;
            let height = window.innerHeight * window.devicePixelRatio;
            renderer.setSize({ width, height });
        }
        function run() {
            // syncronise physics world and render scene
            updateRidigsInScene();
            // update controller states
            controllerRegistry.update();
            // rendering
            renderer.render(scene, camera);
            // simulating physics
            engine.update(world, Math.min(1 / 15, controllerRegistry.states.mspf / 1000));
            window.requestAnimationFrame(run);
        }
        window.addEventListener("resize", setSize);
        setSize();
        run();
    }
    let e_charge;
    (function (e_charge) {
        async function load() {
            await loadMaxwell(async (world, maxwell, scene, renderer) => {
                const phyMatCharge = new phy.Material(1, 0.5);
                const renderMatPos = new FOUR.LambertMaterial([1, 0, 0, 1]);
                const renderMatNeg = new FOUR.LambertMaterial([0, 0, 1, 1]);
                const chargeNum = 8;
                const radius = 4;
                // await renderer.compileMaterials([renderMatNeg, renderMatPos]);
                for (let i = 0; i < chargeNum; i++) {
                    let pos = new phy.Rigid({ geometry: new phy.rigid.Glome(1), mass: 1, material: phyMatCharge });
                    let neg = new phy.Rigid({ geometry: new phy.rigid.Glome(1), mass: 1, material: phyMatCharge });
                    let gndPos = math.Vec3.rand().mulfs(radius);
                    pos.position.set(gndPos.x, 3 + Math.random(), gndPos.y, gndPos.z);
                    gndPos = math.Vec3.rand().mulfs(radius);
                    neg.position.set(gndPos.x, 3 + Math.random(), gndPos.y, gndPos.z);
                    maxwell.addElectricCharge({ rigid: pos, charge: 10, position: math.Vec4.origin });
                    maxwell.addElectricCharge({ rigid: neg, charge: -10, position: math.Vec4.origin });
                    addRigidToScene(world, scene, renderMatPos, pos);
                    addRigidToScene(world, scene, renderMatNeg, neg);
                }
            });
        }
        e_charge.load = load;
    })(e_charge = examples.e_charge || (examples.e_charge = {}));
    let e_dipole;
    (function (e_dipole) {
        async function load() {
            await loadMaxwell(async (world, maxwell, scene, renderer) => {
                const phyMatCharge = new phy.Material(1, 0.5);
                const renderMatEDipole = new FOUR.LambertMaterial(new FOUR.CheckerTexture([1, 0, 0, 1], [0, 0, 1, 1], new FOUR.Vec4TransformNode(new FOUR.UVWVec4Input(), new math.Obj4(new math.Vec4(0.45), null, new math.Vec4(0.1, 0.1, 0.1, 0.1)))));
                const chargeNum = 10;
                const radius = 4;
                // await renderMatEDipole.compile(renderer);
                const srand = new math.Srand(0);
                for (let i = 0; i < chargeNum; i++) {
                    let dipole = new phy.Rigid({ geometry: new phy.rigid.Glome(1), mass: 1, material: phyMatCharge });
                    let gndPos = math.Vec3.rand().mulfs(radius).x0yz();
                    dipole.position.copy(gndPos);
                    dipole.position.y = 3 + Math.random();
                    dipole.rotation.srandset(srand);
                    maxwell.addElectricDipole({ rigid: dipole, moment: new math.Vec4(0, 10), position: math.Vec4.origin.clone() });
                    addRigidToScene(world, scene, renderMatEDipole, dipole);
                }
            });
        }
        e_dipole.load = load;
    })(e_dipole = examples.e_dipole || (examples.e_dipole = {}));
    let m_dipole;
    (function (m_dipole) {
        async function load() {
            await loadMaxwell(async (world, maxwell, scene, renderer) => {
                const phyMatCharge = new phy.Material(1, 0.5);
                const renderMatMDipole = new FOUR.LambertMaterial(new FOUR.CheckerTexture([1, 0, 0, 1], new FOUR.CheckerTexture([0.6, 0.6, 0.6, 0.2], [0, 0, 1, 1], new FOUR.Vec4TransformNode(new FOUR.UVWVec4Input(), new math.Obj4(new math.Vec4(0, 0, 0.41), null, new math.Vec4(0.1, 0.1, 0.1, 0.1)))), new FOUR.Vec4TransformNode(new FOUR.UVWVec4Input(), new math.Obj4(new math.Vec4(0, 0, 0.49), null, new math.Vec4(0.1, 0.1, 0.1, 0.1)))));
                const chargeNum = 6;
                const radius = 5;
                // await renderMatMDipole.compile(renderer);
                let damp = new phy.force.Damping(0.01, 0.01);
                world.add(damp);
                for (let i = 0; i < chargeNum; i++) {
                    let dipole = new phy.Rigid({ geometry: new phy.rigid.Glome(1), mass: 1, material: phyMatCharge });
                    let gndPos = math.Vec3.rand().mulfs(radius).x0yz();
                    dipole.position.copy(gndPos);
                    dipole.position.y = 3 + Math.random();
                    maxwell.addMagneticDipole({ rigid: dipole, moment: new math.Bivec(10), position: math.Vec4.origin.clone() });
                    damp.add(dipole);
                    addRigidToScene(world, scene, renderMatMDipole, dipole);
                }
            });
        }
        m_dipole.load = load;
    })(m_dipole = examples.m_dipole || (examples.m_dipole = {}));
    let m_dipole_dual;
    (function (m_dipole_dual) {
        async function load() {
            await loadMaxwell(async (world, maxwell, scene, renderer) => {
                const phyMatCharge = new phy.Material(1, 0.5);
                const renderMatMDipoleDual = new FOUR.LambertMaterial(new FOUR.CheckerTexture([1, 0, 0, 1], new FOUR.CheckerTexture([1, 0.5, 0.5, 0.2], [0, 0, 1, 1], new FOUR.Vec4TransformNode(new FOUR.UVWVec4Input(), new math.Obj4(new math.Vec4(0, 0, 0.41), null, new math.Vec4(0.1, 0.1, 0.1, 0.1)))), new FOUR.Vec4TransformNode(new FOUR.UVWVec4Input(), new math.Obj4(new math.Vec4(0, 0, 0.49), null, new math.Vec4(0.1, 0.1, 0.1, 0.1)))));
                const renderMatMDipoleAntiDual = new FOUR.LambertMaterial(new FOUR.CheckerTexture([1, 0, 0, 1], new FOUR.CheckerTexture([0.5, 0.5, 1, 0.2], [0, 0, 1, 1], new FOUR.Vec4TransformNode(new FOUR.UVWVec4Input(), new math.Obj4(new math.Vec4(0, 0, 0.41), null, new math.Vec4(0.1, 0.1, 0.1, 0.1)))), new FOUR.Vec4TransformNode(new FOUR.UVWVec4Input(), new math.Obj4(new math.Vec4(0, 0, 0.49), null, new math.Vec4(0.1, 0.1, 0.1, 0.1)))));
                const chargeNum = 12;
                const radius = 5;
                // await renderMatMDipoleDual.compile(renderer);
                // await renderMatMDipoleAntiDual.compile(renderer);
                let damp = new phy.force.Damping(0.01, 0.01);
                world.add(damp);
                let dipoleB = new phy.Rigid({ geometry: new phy.rigid.Glome(1), mass: 1, material: phyMatCharge });
                let gndPos = math.Vec3.rand().mulfs(radius).x0yz();
                dipoleB.position.x *= 0.5;
                dipoleB.position.x += 2;
                dipoleB.position.copy(gndPos);
                dipoleB.position.y = 7 + Math.random();
                maxwell.addMagneticDipole({ rigid: dipoleB, moment: new math.Bivec(-10, 0, 0, 0, 0, 10), position: math.Vec4.origin.clone() });
                damp.add(dipoleB);
                addRigidToScene(world, scene, renderMatMDipoleAntiDual, dipoleB);
                for (let i = 0; i < chargeNum; i++) {
                    let dipoleA = new phy.Rigid({ geometry: new phy.rigid.Glome(1), mass: 1, material: phyMatCharge });
                    let gndPos = math.Vec3.rand().mulfs(radius).x0yz();
                    dipoleA.position.copy(gndPos);
                    dipoleA.position.x *= 0.5;
                    dipoleA.position.x -= 4;
                    dipoleA.position.y = 3 + Math.random();
                    maxwell.addMagneticDipole({ rigid: dipoleA, moment: new math.Bivec(10, 0, 0, 0, 0, 10), position: math.Vec4.origin.clone() });
                    damp.add(dipoleA);
                    addRigidToScene(world, scene, renderMatMDipoleDual, dipoleA);
                }
            });
        }
        m_dipole_dual.load = load;
    })(m_dipole_dual = examples.m_dipole_dual || (examples.m_dipole_dual = {}));
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
            this.renderer.setCameraProjectMatrix({
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
                this.renderer.sliceTetras(this.vertBindGroup, this.mesh.count);
                this.renderer.drawTetras();
            });
            window.requestAnimationFrame(this.run.bind(this));
        }
    }
    let commonFragCode = `
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
    let tiger;
    (function (tiger) {
        async function load() {
            let app = await new ShapesApp().init(commonFragCode, tesserxel.mesh.tetra.tiger(0.3 + Math.random() * 0.05, 32, 0.5, 32, 0.14 + Math.random() * 0.03, 16));
            app.retinaController.toggleSectionConfig("retina+zslices");
            app.run();
            app.retinaController.setOpacity(2.0);
        }
        tiger.load = load;
    })(tiger = examples.tiger || (examples.tiger = {}));
    let spheritorus;
    (function (spheritorus) {
        async function load() {
            let app = await new ShapesApp().init(commonFragCode, tesserxel.mesh.tetra.spheritorus(0.3, 16, 16, 0.6, 24));
            app.retinaController.toggleSectionConfig("retina+zslices");
            app.run();
            app.retinaController.setOpacity(2.0);
        }
        spheritorus.load = load;
    })(spheritorus = examples.spheritorus || (examples.spheritorus = {}));
    let torisphere;
    (function (torisphere) {
        async function load() {
            let app = await new ShapesApp().init(commonFragCode, tesserxel.mesh.tetra.torisphere(0.15, 12, 0.6, 24, 24));
            app.retinaController.toggleSectionConfig("retina+zslices");
            app.run();
            app.retinaController.setOpacity(2.0);
        }
        torisphere.load = load;
    })(torisphere = examples.torisphere || (examples.torisphere = {}));
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
            app.retinaController.setOpacity(10.0);
            app.run();
        }
        glome.load = load;
    })(glome = examples.glome || (examples.glome = {}));
    let HypercubeFragCode = `
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
        const radius: f32 = {radius};
        const ambientLight = vec3<f32>(0.8);
        const frontLightColor = vec3<f32>(5.0,4.6,3.5);
        const backLightColor = vec3<f32>(1.9,2.4,2.8);
        const directionalLight_dir = vec4<f32>(0.1,0.5,0.4,1.0);
        var color:vec3<f32> = vec3(1.0,1.0,1.0);
        var count:f32 = 0;
        count += step({edge},abs(vary.uvw.x));
        count += step({edge},abs(vary.uvw.y));
        count += step({edge},abs(vary.uvw.z));
        if(dot(vary.uvw.xyz,vary.uvw.xyz) < radius * radius * radius || count >= 2.0){
            color = colors[u32(vary.uvw.w + 0.1)];
            {count}
        }
        color = color * (
            ambientLight + frontLightColor * max(0, dot(directionalLight_dir , vary.normal)) + backLightColor * max(0, -dot(directionalLight_dir , vary.normal))
        );
        {discard}
        return vec4<f32>(pow(color,vec3<f32>(0.6))*0.5, 0.2 + f32(count>=2.0));
    }`;
    let tesseract;
    (function (tesseract) {
        async function load() {
            let app = await new ShapesApp().init(HypercubeFragCode.replace("{discard}", "").replace("{radius}", "0.8").replace("{count}", "").replaceAll("{edge}", "0.8"), tesserxel.mesh.tetra.tesseract());
            app.retinaController.setOpacity(10.0);
            app.renderer.setCameraProjectMatrix({ fov: 110, near: 0.01, far: 10.0 });
            app.trackBallController.object.rotation.l.set();
            app.trackBallController.object.rotation.r.set();
            app.run();
        }
        tesseract.load = load;
    })(tesseract = examples.tesseract || (examples.tesseract = {}));
    let tesseract_ortho;
    (function (tesseract_ortho) {
        async function load() {
            let app = await new ShapesApp().init(HypercubeFragCode.replace("{count}", "count = 2.0;").replace("{radius}", "0.3").replace("{discard}", "if(count < 2.0){ discard; }").replaceAll("{edge}", "0.9"), tesserxel.mesh.tetra.tesseract());
            // retina controller will own the slice config, so we should not call renderer.setSlice() directly
            app.retinaController.setOpacity(50.0);
            app.retinaController.setLayers(128);
            app.renderer.setCameraProjectMatrix({ size: 2, near: -8, far: 8 });
            app.retinaController.setRetinaFov(0);
            app.retinaController.setRetinaEyeOffset(0.05);
            // app.retinaController.setStereo(false);
            app.trackBallController.object.rotation.setFromLookAt(tesserxel.math.Vec4.x, new tesserxel.math.Vec4(1, Math.SQRT1_2, 0, -Math.SQRT1_2).norms()).mulsl(tesserxel.math.Rotor.lookAt(tesserxel.math.Vec4.y.rotate(app.trackBallController.object.rotation), new tesserxel.math.Vec4(0, Math.SQRT1_2, 1, Math.SQRT1_2).norms())).conjs();
            app.trackBallController.mouseButton3D = 2;
            app.trackBallController.mouseButton4D = 1;
            app.trackBallController.mouseButtonRoll = 0;
            app.run();
        }
        tesseract_ortho.load = load;
    })(tesseract_ortho = examples.tesseract_ortho || (examples.tesseract_ortho = {}));
    async function loadFile(src) {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.open("GET", src, true);
            xhr.onload = e => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        resolve(xhr.responseText);
                    }
                    else {
                        console.error(xhr.statusText);
                        reject();
                    }
                }
            };
            xhr.onerror = function (e) {
                console.error(xhr.statusText);
                reject();
            };
            xhr.send();
        });
    }
    let suzanne3d;
    (function (suzanne3d) {
        async function load() {
            let s = 2;
            let s2 = 3.2;
            let spline = new tesserxel.math.Spline([
                new tesserxel.math.Vec4(-s, 0),
                new tesserxel.math.Vec4(0, s),
                new tesserxel.math.Vec4(s, 0),
                new tesserxel.math.Vec4(0, -s),
                new tesserxel.math.Vec4(-s, 0),
            ], [
                new tesserxel.math.Vec4(0, s2),
                new tesserxel.math.Vec4(s2, 0),
                new tesserxel.math.Vec4(0, -s2),
                new tesserxel.math.Vec4(-s2, 0),
                new tesserxel.math.Vec4(0, s2),
            ]);
            let meshFile = new tesserxel.mesh.ObjFile(await loadFile("resource/suzanne.obj"));
            let mesh = tesserxel.mesh.face.toNonIndexMesh(meshFile.parse());
            let app = await new ShapesApp().init(commonFragCode, tesserxel.mesh.tetra.loft(spline, mesh, 9));
            app.retinaController.setOpacity(10.0);
            app.renderer.setCameraProjectMatrix({ fov: 80, near: 0.01, far: 50.0 });
            app.trackBallController.object.rotation.l.set(Math.SQRT1_2, 0, Math.SQRT1_2, 0);
            app.trackBallController.object.rotation.r.set();
            app.run();
        }
        suzanne3d.load = load;
    })(suzanne3d = examples.suzanne3d || (examples.suzanne3d = {}));
    let directproduct;
    (function (directproduct) {
        async function load() {
            let meshFile1 = new tesserxel.mesh.ObjFile(await loadFile("resource/text.obj")).parse();
            let meshFile2 = new tesserxel.mesh.ObjFile(await loadFile("resource/text.obj")).parse();
            let mesh = tesserxel.mesh.tetra.directProduct(meshFile1, meshFile2);
            let app = await new ShapesApp().init(`
            @fragment fn main(vary: fInputType) -> @location(0) vec4<f32> {
                const ambientLight = vec3<f32>(0.1);
                const frontLightColor = vec3<f32>(5.0,4.6,3.5);
                const backLightColor = vec3<f32>(0.1,1.2,1.4);
                const directionalLight_dir = vec4<f32>(0.1,0.5,0.4,1.0);
                let halfvec = normalize(directionalLight_dir - normalize(vary.pos));
                let highLight = pow(max(0.0,dot(vary.normal,halfvec)),30);
                var color:vec3<f32> = mix(vec3<f32>(1.0),vec3<f32>(1.0,0.0,0.0), vary.uvw.w);
                color = color * (
                    frontLightColor * max(0, dot(directionalLight_dir , vary.normal)) + backLightColor * max(0, -dot(directionalLight_dir , vary.normal))
                )* (0.4 + 0.8*highLight);
                return vec4<f32>(pow(color,vec3<f32>(0.6))*0.5, 1.0);
            }`, mesh);
            app.retinaController.setOpacity(10.0);
            app.renderer.setCameraProjectMatrix({ fov: 80, near: 0.01, far: 50.0 });
            app.trackBallController.object.rotation.l.set(Math.SQRT1_2, 0, Math.SQRT1_2, 0);
            app.trackBallController.object.rotation.r.set();
            app.run();
        }
        directproduct.load = load;
    })(directproduct = examples.directproduct || (examples.directproduct = {}));
})(examples || (examples = {}));
var examples;
(function (examples) {
    let voxel_test;
    (function (voxel_test) {
        async function load() {
            const gpu = await tesserxel.renderer.createGPU();
            const device = gpu.device;
            // voxel render pass (compute pass)
            let voxelShaderCode = `
            struct Vec4Attachment{
                size: vec3<u32>,
                data: array<vec4<f32>>
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
                var color:vec4<f32>;
                if(dot(position,position) > size){
                    color=vec4<f32>(position*0.5+0.5,1.0);
                }else{
                    color=vec4<f32>(0.0);
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
            function createVoxelBuffer(size) {
                let width = 0;
                let height = 0;
                let depth = 0;
                if (size.width) {
                    width = size.width;
                    height = size.height;
                    depth = size.depthOrArrayLayers;
                }
                else {
                    width = size[0];
                    height = size[1];
                    depth = size[2];
                }
                let length = width * height * depth;
                let buffer = device.createBuffer({
                    size: (4 + length * 4) * 4,
                    usage: GPUBufferUsage.STORAGE,
                    mappedAtCreation: true,
                    label: `VoxelBuffer<${width},${height},${depth},vec4<f32>>`
                });
                let jsBuffer = new Uint32Array(buffer.getMappedRange(0, 12));
                jsBuffer.set([width, height, depth]);
                buffer.unmap();
                return { buffer, width, height, depth, size: length, format: "vec4<f32>" };
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
                passEncoder.dispatchWorkgroups(Math.ceil(voxelBuffer.width / 8), Math.ceil(voxelBuffer.height / 8), Math.ceil(voxelBuffer.depth / 4));
                passEncoder.end();
                device.queue.submit([commandEncoder.finish()]);
            }
            // 3d retina render pass (use slice renderer)
            const canvas = document.getElementById("gpu-canvas");
            const context = gpu.getContext(canvas);
            const renderer = await new tesserxel.renderer.SliceRenderer().init(gpu, context);
            const RaytracingShaderCode = `
            
            struct Vec4Attachment{
                size: vec3<u32>,
                data: array<vec4<f32>>
            }
            @group(1) @binding(0) var <storage, read> attachment0: Vec4Attachment;

            fn voxelfetch(position: vec3<f32>)->vec4<f32>{
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
            @fragment fn mainFrag(@location(0) position: vec3<f32>) -> @location(0) vec4<f32>{
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
            function loop() {
                t += 1 / 60;
                ctrlReg.update();
                uSizeJsBuffer[0] = (Math.sin(t) * 0.5 + 0.5);
                device.queue.writeBuffer(uSizeBuffer, 0, uSizeJsBuffer);
                dispatch();
                renderer.render(() => {
                    renderer.drawRaytracing(pipeline, [renderBindgroup]);
                });
                window.requestAnimationFrame(loop);
            }
            loop();
        }
        voxel_test.load = load;
    })(voxel_test = examples.voxel_test || (examples.voxel_test = {}));
    let voxel_shadertoy;
    (function (voxel_shadertoy) {
        async function load() {
            const gpu = await tesserxel.renderer.createGPU();
            const canvas = document.getElementById("gpu-canvas");
            const context = gpu.getContext(canvas);
            const renderer = await new tesserxel.renderer.SliceRenderer().init(gpu, context);
            const RaytracingShaderCode = `
            struct RayOutput{
                @location(0) position: vec3<f32>
            }
            @ray fn mainRay(@builtin(voxel_coord) position: vec3<f32>) -> RayOutput{
                return RayOutput(position);
            }
            @fragment fn mainFrag(@location(0) position: vec3<f32>) -> @location(0) vec4<f32>{
                return vec4<f32>(position * 0.5 + vec3<f32>(0.5), 1.0);
            }
            `;
            const pipeline = await renderer.createRaytracingPipeline({
                code: RaytracingShaderCode,
                rayEntryPoint: "mainRay",
                fragmentEntryPoint: "mainFrag"
            });
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
            function loop() {
                ctrlReg.update();
                renderer.render(() => {
                    renderer.drawRaytracing(pipeline);
                });
                window.requestAnimationFrame(loop);
            }
            loop();
        }
        voxel_shadertoy.load = load;
    })(voxel_shadertoy = examples.voxel_shadertoy || (examples.voxel_shadertoy = {}));
    let rasterizer;
    (function (rasterizer) {
        async function load() {
            const gpu = await tesserxel.renderer.createGPU();
            const device = gpu.device;
            // voxel render pass (compute pass)
            let meshJsBuffer = tesserxel.mesh.tetra.tiger(1, 16, 1, 16, 0.2, 12);
            tesserxel.mesh.tetra.applyObj4(meshJsBuffer, new tesserxel.math.Obj4(new tesserxel.math.Vec4(0, 0, 0, 2)));
            const resolution = 256;
            const tetraCount = meshJsBuffer.count;
            const tileSize = 16;
            const workgroupSizeX = 8;
            const workgroupSizeY = 4;
            const workgroupSizeZ = 8;
            let commonHeaderCode = `
            struct InternalTetra{
                invPosition: mat4x4<f32>,
                aabbMin: vec4<f32>,
                aabbMax: vec4<f32>,
            }
            fn frustumTest(tetra: mat4x4<f32>, viewport: vec4<f32>){
                // todo
            }
            `;
            let declareInverseMat4x4F32 = `
            fn inverseMat4x4F32(matrix : mat4x4<f32>)->mat4x4<f32>{
                let invdet = 1.0 / determinant(matrix);
                let adjoint = transpose(mat4x4<f32>(
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
            
            @group(0) @binding(0) var <storage, read> inputTetra: array<mat4x4<f32>>;
            @group(0) @binding(1) var <storage, read_write> interTetra: array<InternalTetra>;
            ${declareInverseMat4x4F32}
            @compute @workgroup_size(256)
            fn main(@builtin(global_invocation_id) invocationId : vec3<u32>){
                let tetra = inputTetra[invocationId.x];
                if (tetra[0].w < 0.0 && tetra[1].w < 0.0 && tetra[2].w < 0.0 && tetra[3].w < 0.0){
                    return ;
                }

                // to do: frustum clip test in common header, if not pass, return ;

                // var vmin:vec4<f32> = vec4<f32>(1.0,1.0,1.0,1.0);
                // var vmax:vec4<f32> = vec4<f32>(-1.0,-1.0,-1.0,1.0);
                var vmin:vec4<f32> = vec4<f32>(-1.0,-1.0,-1.0,1.0);
                var vmax:vec4<f32> = vec4<f32>(1.0,1.0,1.0,1.0);
                if (tetra[0].w > 0.0 && tetra[1].w > 0.0 && tetra[2].w > 0.0 && tetra[3].w > 0.0){
                    let v0 = tetra[0] / tetra[0].w;
                    let v1 = tetra[1] / tetra[1].w;
                    let v2 = tetra[2] / tetra[2].w;
                    let v3 = tetra[3] / tetra[3].w;
                    vmin = max(vec4<f32>(-1.0,-1.0,-1.0,1.0),min(v0,min(v1,min(v2,v3))));
                    vmax = min(vec4<f32>( 1.0, 1.0, 1.0,1.0),max(v0,max(v1,max(v2,v3))));
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
            const mat4x4One = mat4x4<f32>(1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,);
            ${declareInverseMat4x4F32}
            @group(0) @binding(0) var <storage, read> interTetra: array<InternalTetra>;
            // @group(0) @binding(0) var <storage, read> inputTetra: array<mat4x4<f32>>;
            @group(0) @binding(1) var <storage, read_write> _attachment0: Vec4Attachment;
            @compute @workgroup_size(${workgroupSizeX},${workgroupSizeY},${workgroupSizeZ})
            fn main(@builtin(global_invocation_id) invocationId : vec3<u32>){

                let tetraId = invocationId.x;

                // let tetra = inputTetra[invocationId.x];
                // if (tetra[0].w < 0.0 && tetra[1].w < 0.0 && tetra[2].w < 0.0 && tetra[3].w < 0.0){
                //     return ;
                // }

                // // to do: frustum clip test in common header, if not pass, return ;

                // var vmin:vec4<f32> = vec4<f32>(-1.0,-1.0,-1.0,1.0);
                // var vmax:vec4<f32> = vec4<f32>(1.0,1.0,1.0,1.0);
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
                var barycenter =  invTetra * vec4<f32>(floopMin, 1.0);
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
                // var barycenter =  invTetra * vec4<f32>(vec3<f32>(tileOffset) * invSizeHalf - vec3<f32>(1.0), 1.0);
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
            let voxelBuffer = tesserxel.renderer.createVoxelBuffer(gpu, size, 1, tileNums.buffer);
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
                passEncoder.dispatchWorkgroups(Math.ceil(tetraCount / 256));
                passEncoder.setPipeline(computePipeline);
                passEncoder.setBindGroup(0, computeBindgroup);
                passEncoder.dispatchWorkgroups(Math.ceil(tetraCount / workgroupSizeX), Math.ceil(tileNums[0] / workgroupSizeY), Math.ceil(tileNums[1] * tileNums[2] / workgroupSizeZ));
                passEncoder.end();
                device.queue.submit([commandEncoder.finish()]);
            }
            // 3d retina render pass (use slice renderer)
            const canvas = document.getElementById("gpu-canvas");
            const context = gpu.getContext(canvas);
            const renderer = await new tesserxel.renderer.SliceRenderer().init(gpu, context);
            renderer.setOpacity(2);
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
            @fragment fn mainFrag(@location(0) position: vec3<f32>) -> @location(0) vec4<f32>{
                // return ;
                let depth = f32(voxelfetch(position*0.5+vec3<f32>(0.5))) / 65536.0;
                return vec4<f32>(depth,depth,depth,step(0.000001,depth));
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
                    passEncoder.dispatchWorkgroups(Math.ceil(tetraCount / 256));
                    passEncoder.setPipeline(computePipeline);
                    passEncoder.setBindGroup(0, computeBindgroup);
                    passEncoder.dispatchWorkgroups(Math.ceil(tetraCount / workgroupSizeX), Math.ceil(tileNums[0] / workgroupSizeY), Math.ceil(tileNums[1] * tileNums[2] / workgroupSizeZ));
                    passEncoder.end();
                    device.queue.submit([commandEncoder.finish()]);
                }
                renderer.render(() => {
                    renderer.drawRaytracing(pipeline, [renderBindgroup]);
                });
                window.requestAnimationFrame(loop);
            }
            dispatch();
            loop();
        }
        rasterizer.load = load;
    })(rasterizer = examples.rasterizer || (examples.rasterizer = {}));
})(examples || (examples = {}));
//# sourceMappingURL=examples.js.map