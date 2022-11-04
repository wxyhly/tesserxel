import * as tesserxel from '../../build/tesserxel.js';

var city_highway;
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
        let gpu = await new tesserxel.render.GPU().init();
        let canvas = document.getElementById("gpu-canvas");
        let context = gpu.getContext(canvas);
        let renderer = await new tesserxel.render.SliceRenderer().init(gpu, context, {
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
        let camController = new tesserxel.util.ctrl.KeepUpController();
        camController.object.position.set(0.5, 0.5, 0.5, 3);
        camController.keyMoveSpeed *= 5;
        let retinaController = new tesserxel.util.ctrl.RetinaController(renderer);
        let ctrlreg = new tesserxel.util.ctrl.ControllerRegistry(canvas, [camController, retinaController], { preventDefault: true, requsetPointerLock: true });
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
})(city_highway || (city_highway = {}));
// }

export { city_highway };
//# sourceMappingURL=city_highway.js.map
