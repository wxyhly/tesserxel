"use strict";
// namespace examples {
//     export namespace city {
//         let vertCode = `
// struct InputType{
//     @location(0) pos: mat4x4<f32>,
//     @location(1) normal: mat4x4<f32>,
//     @location(2) uvw: mat4x4<f32>,
// }
// struct OutputType{
//     @builtin(position) pos: mat4x4<f32>,
//     @location(0) normal: mat4x4<f32>,
//     @location(1) uvw: mat4x4<f32>,
// }
// struct AffineMat{
//     matrix: mat4x4<f32>,
//     vector: vec4<f32>,
// }
// @group(1) @binding(3) var<uniform> camMat: AffineMat;
// @group(1) @binding(4) var<storage> modelMats: array<AffineMat>;
// fn apply(afmat: AffineMat, points: mat4x4<f32>) -> mat4x4<f32>{
//     let biais = mat4x4<f32>(afmat.vector, afmat.vector, afmat.vector, afmat.vector);
//     return afmat.matrix * points + biais;
// }
// @tetra fn main(input : InputType, @builtin(instance_index) index: u32) -> OutputType{
//     let modelMat = modelMats[index];
//     return OutputType(apply(camMat,apply(modelMat, input.pos)), modelMat.matrix * input.normal, input.uvw);
// }
// `;
//         let fragCode = `
// struct fInputType{
//     @location(0) normal : vec4<f32>,
//     @location(1) uvw : vec4<f32>,
// };
// @fragment fn main(vary: fInputType) -> @location(0) vec4<f32> {
//     let color = vec3<f32>(1.0,1.0,1.0);
//     let directionalLight_dir = vec4<f32>(1.0,1.0,1.0,1.0);
//     return vec4<f32>(color * 3.0 * max(0, dot(directionalLight_dir , vary.normal)) + color * 0.4 * max(0, -dot(directionalLight_dir , vary.normal)), 1.0);
// }`;
//         export async function load() {
//             let gpu = await tesserxel.getGPU();
//             let canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
//             let context = gpu.getContext(canvas);
//             let renderer = await new tesserxel.renderer.TetraRenderer().init(gpu, context, {
//                 enableFloat16Blend: false,
//                 sliceGroupSize: 8
//             });
//             let pipeline = await renderer.createTetraSlicePipeline({
//                 vertex: { code: vertCode, entryPoint: "main" },
//                 fragment: {
//                     module: gpu.device.createShaderModule({ code: fragCode }),
//                     entryPoint: "main",
//                     targets: [{ format: gpu.preferredFormat }]
//                 },
//                 cullMode: "front"
//             });
//             let mesh = tesserxel.mesh.tetra.tesseract;
//             let positionBuffer = gpu.createBuffer(GPUBufferUsage.STORAGE, mesh.position);
//             let normalBuffer = gpu.createBuffer(GPUBufferUsage.STORAGE, mesh.normal);
//             let uvwBuffer = gpu.createBuffer(GPUBufferUsage.STORAGE, mesh.uvw);
//             let mvBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 4 * 4 * 5);
//             let cubeCount = 1024;
//             let jsbuffer = new Float32Array(20 * cubeCount);
//             let math = tesserxel.math;
//             for (let i = 0; i < cubeCount; i++) {
//                 let pos = math.Vec3.rand().mulfs(Math.sqrt(Math.random()) * 5.0);
//                 new math.Obj4(
//                     new math.Vec4(pos.x, 0, pos.y, pos.z),
//                     new math.Rotor(), new math.Vec4(0.1, 0.1, 0.1, 0.1).adds(math.Vec4.rand().mulfs(0.05))
//                 ).getAffineMat4().writeBuffer(jsbuffer, i * 20);
//             }
//             let modelBuffer = gpu.createBuffer(GPUBufferUsage.STORAGE, jsbuffer);
//             let vertBindGroup = renderer.createBindGroup(pipeline, 1, [positionBuffer, normalBuffer, uvwBuffer, mvBuffer, modelBuffer]);
//             // let sliceConfig = tesserxel.renderer.sliceconfig.default2eye();
//             // sliceConfig.opacity = 20.0;
//             // renderer.setSlice(sliceConfig);
//             renderer.set4DCameraProjectMatrix({
//                 fov: 100, near: 0.01, far: 10
//             });
//             renderer.setScreenClearColor({ r: 1, g: 1, b: 1, a: 1 });
//             let trackBallController = new tesserxel.controller.KeepUpController();
//             trackBallController.object.position.set(0, 0, 0, 3);
//             let retinaController = new tesserxel.controller.RetinaController(renderer);
//             let controller = new tesserxel.controller.ControllerRegistry(canvas, [trackBallController, retinaController], { preventDefault: true, requsetPointerLock: true });
//             let matModelViewJSBuffer = new Float32Array(20);
//             let run = () => {
//                 controller.update();
//                 trackBallController.object.getAffineMat4inv().writeBuffer(matModelViewJSBuffer);
//                 gpu.device.queue.writeBuffer(mvBuffer, 0, matModelViewJSBuffer);
//                 renderer.render(() => {
//                     renderer.beginTetras(pipeline);
//                     renderer.sliceTetras(vertBindGroup, mesh.tetraCount, cubeCount);
//                     renderer.drawTetras();
//                 });
//                 window.requestAnimationFrame(run);
//             }
//             function setSize() {
//                 let width = window.innerWidth * window.devicePixelRatio;
//                 let height = window.innerHeight * window.devicePixelRatio;
//                 canvas.width = width;
//                 canvas.height = height;
//                 renderer.setSize({ width, height });
//             }
//             setSize();
//             window.addEventListener("resize", setSize);
//             run();
//         }
//     }
//     export namespace convexhull {
//         let vertCode = `
// struct InputType{
//     @location(0) pos: mat4x4<f32>,
// }
// struct OutputType{
//     @builtin(position) pos: mat4x4<f32>,
//     @location(0) uvw: mat4x4<f32>,
// }
// struct AffineMat{
//     matrix: mat4x4<f32>,
//     vector: vec4<f32>,
// }
// @group(1) @binding(1) var<uniform> camMat: AffineMat;
// fn apply(afmat: AffineMat, points: mat4x4<f32>) -> mat4x4<f32>{
//     let biais = mat4x4<f32>(afmat.vector, afmat.vector, afmat.vector, afmat.vector);
//     return afmat.matrix * points + biais;
// }
// @tetra fn main(input : InputType, @builtin(tetra_index) idx:u32) -> OutputType{
//     let pos = apply(camMat,input.pos);
//     var uvwmat = input.pos;
//     // if(idx < 3) {
//     //     uvwmat[0].y = 0.01;
//     //     uvwmat[1].y = 0.01;
//     //     uvwmat[2].y = 0.01;
//     //     uvwmat[3].y = 0.01;
//     // }
//     return OutputType(pos,uvwmat);
// }
// `;
//         let fragCode = `
// @fragment fn main(@location(0) pos : vec4<f32>) -> @location(0) vec4<f32> {
//     return vec4<f32>(vec3<f32>(sin(pos.xzw*100.0*pos.y))*0.5+vec3<f32>(0.5), 1.0);
// }`;
//         export async function load() {
//             let gpu = await tesserxel.getGPU();
//             let canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
//             let context = gpu.getContext(canvas);
//             let renderer = await new tesserxel.renderer.TetraRenderer().init(gpu, context, {
//                 enableFloat16Blend: false,
//                 sliceGroupSize: 8
//             });
//             let pipeline = await renderer.createTetraSlicePipeline({
//                 vertex: { code: vertCode, entryPoint: "main" },
//                 fragment: { code: fragCode, entryPoint: "main" },
//                 cullMode: "front"
//             });
//             // let mesh = tesserxel.mesh.tetra.duocylinder(0.5,32,0.5,32);
//             let mesh = tesserxel.mesh.tetra.glome(1, 16, 16, 16);
//             let positionBuffer = gpu.createBuffer(GPUBufferUsage.STORAGE, mesh.position);
//             let mvBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 4 * 4 * 5);
//             let vertBindGroup = renderer.createBindGroup(pipeline, 1, [positionBuffer, mvBuffer]);
//             renderer.set4DCameraProjectMatrix({
//                 fov: 100, near: 0.01, far: 10
//             });
//             renderer.setRetinaProjectMatrix({
//                 fov: 40, near: 0.01, far: 10
//             });
//             renderer.setScreenClearColor({ r: 1, g: 1, b: 1, a: 0.0 });
//             let trackBallController = new tesserxel.controller.FreeFlyController();
//             let retinaController = new tesserxel.controller.RetinaController(renderer);
//             // retinaController.mouseButton = null;
//             retinaController.toggleSectionConfig(1);
//             let controller = new tesserxel.controller.ControllerRegistry(canvas, [
//                 trackBallController, retinaController
//             ], { preventDefault: true, requsetPointerLock: true });
//             let matModelViewJSBuffer = new Float32Array(20);
//             function setSize() {
//                 let width = window.innerWidth * window.devicePixelRatio;
//                 let height = window.innerHeight * window.devicePixelRatio;
//                 canvas.width = width;
//                 canvas.height = height;
//                 renderer.setSize({ width, height });
//             }
//             let rtpipeline = await renderer.createRaytracingPipeline();
//             let rtBindGroup = renderer.createBindGroup(rtpipeline, 1, [mvBuffer]);
//             function run() {
//                 controller.update();
//                 trackBallController.object.getAffineMat4inv().writeBuffer(matModelViewJSBuffer);
//                 gpu.device.queue.writeBuffer(mvBuffer, 0, matModelViewJSBuffer);
//                 renderer.render(() => {
//                     renderer.beginTetras(pipeline);
//                     renderer.sliceTetras(vertBindGroup, mesh.tetraCount);
//                     renderer.drawTetras();
//                     renderer.drawRaytracing(rtpipeline, [rtBindGroup]);
//                 });
//                 window.requestAnimationFrame(run);
//             }
//             setSize();
//             run();
//             window.addEventListener("resize", setSize);
//         }
//     }
//     export namespace wfc {
//         let tiles = {};
//         let weights: number[] = [];
//         let tileCount = 0;
//         let rules: { [key: number]: { [key: number]: number[] } } = {};
//         let tileSym = {};
//         enum Symetry {
//             None,
//             DirAxis,
//             Axis,
//         }
//         enum Direction {
//             nx,
//             px,
//             ny,
//             py
//         }
//         let dir = ["nx", "px", "ny", "py"];
//         function inv(d: Direction) {
//             return d ^ 1;
//         }
//         function addTile(name: string, weight: number, sym?: Symetry) {
//             tileSym[name] = sym;
//             switch (sym) {
//                 case Symetry.DirAxis:
//                     tiles[name] = tileCount;
//                     weights[tileCount] = weight; tiles[name + "nx"] = tileCount++;
//                     weights[tileCount] = weight; tiles[name + "px"] = tileCount++;
//                     weights[tileCount] = weight; tiles[name + "ny"] = tileCount++;
//                     weights[tileCount] = weight; tiles[name + "py"] = tileCount++;
//                     break;
//                 case Symetry.Axis:
//                     tiles[name] = tileCount;
//                     weights[tileCount] = weight; tiles[name + "x"] = tileCount++;
//                     weights[tileCount] = weight; tiles[name + "y"] = tileCount++;
//                     break;
//                 default:
//                     weights[tileCount] = weight;
//                     tiles[name] = tileCount++;
//             }
//         }
//         function addRule(name1: number, name2: number, dir: Direction) {
//             if (!rules[name1]) rules[name1] = {};
//             let a = rules[name1];
//             if (!a[dir]) a[dir] = [];
//             a[dir].push(name2);
//             dir = inv(dir);
//             if (!rules[name2]) rules[name2] = {};
//             let b = rules[name2];
//             if (!b[dir]) b[dir] = [];
//             b[dir].push(name1);
//         }
//         // /**  B 
//         //  * B A B
//         //  *   B
//         //  *  */
//         // function anydir(exactName1: string, exactName2: string) {
//         //     for (let i = 0; i < 4; i++)
//         //         addRule(tiles[exactName1], tiles[exactName2], i);
//         // }
//         // /**  ^ 
//         //  * < A >  ^ > > v  
//         //  *   v    ^ < < v
//         //  *  */
//         // function toaxis(name1: string, axisName: string) {
//         //     if (tileSym[name1] == Symetry.DirAxis) {
//         //     } else if (tileSym[name1] == Symetry.DirAxis) {
//         //     } else {
//         //         let n = tiles[axisName];
//         //         for (let i = 0; i < 4; i++)addRule(tiles[name1], n + i, i);
//         //     }
//         // }
//         // function axisinvdir(name1: string, axisName: string) {
//         //     let n = tiles[axisName];
//         //     for (let i = 0; i < 4; i++)
//         //         addRule(tiles[name1], n + i, i ^ 1);
//         // }
//         // function axisverticaldir(name1: string, axisName: string) {
//         //     let n = tiles[axisName];
//         //     let t = tiles[name1];
//         //     for (let i = 0; i < 4; i++) {
//         //         addRule(t, n + i, i ^ 2);
//         //         addRule(t, n + i, i ^ 3);
//         //     }
//         // }
//         // function someTile(name1: string, name2: number[], dir: Direction) {
//         //     for (let n of name2)
//         //         addRule(tiles[name1], n, dir);
//         // }
//         // addTile("mon", 3);
//         // addTile("kleu", 1, Symetry.Axis);
//         // addTile("on", 10);
//         // addTile("ros", 2);
//         // addTile("road", 3);
//         // addTile("road", 3);
//         // anydir("ros", "on");
//         // axisdir("on", "kleu");
//         // axisinvdir("mon", "kleu");
//         // axisverticaldir("on", "kleu");
//         // axisverticaldir("mon", "kleu");
//         // anydir("on", "on");
//         // anydir("mon", "mon");
//         function randomChoose(w: Set<number>) {
//             let arr = [];
//             let sum = 0;
//             for (let t of w.keys()) {
//                 arr.push(t);
//                 sum += weights[t];
//             }
//             let rnd = Math.floor(Math.random() * sum);
//             for (let i = 0; i < arr.length; i++) {
//                 rnd -= weights[arr[i]];
//                 if (rnd < 0) {
//                     return arr[i];
//                 }
//             }
//             return 0;
//         }
//         let sizex = 16;
//         let sizey = 16;
//         let size = sizex * sizey;
//         let w: Set<number>[] = new Array(size);
//         let etp = new Array(size);
//         export function init() {
//             // init
//             for (let i = 0; i < size; i++) {
//                 w[i] = new Set();
//                 for (let j = 0; j < tileCount; j++) {
//                     w[i].add(j);
//                 }
//             }
//         }
//         export function run() {
//             init();
//             while (!iterate()) { }
//             console.log(show());
//         }
//         export function iterate() {
//             // collapse
//             let minEntropy = Infinity;
//             for (let i = 0; i < size; i++) {
//                 if (w[i].size == 1) { etp[i] = 0; continue; }
//                 let sum_of_weights = 0;
//                 let sum_of_weight_log_weights = 0;
//                 for (let t of w[i].keys()) {
//                     let weight = weights[t];
//                     sum_of_weights += weight;
//                     sum_of_weight_log_weights += weight * Math.log(weight);
//                 }
//                 etp[i] = Math.log(sum_of_weights) - (sum_of_weight_log_weights / sum_of_weights);
//                 if (minEntropy > etp[i]) {
//                     minEntropy = etp[i];
//                 }
//             }
//             if (minEntropy === Infinity) return true;
//             // collapse
//             let candidats = [];
//             for (let i = 0; i < size; i++) {
//                 if (etp[i] === minEntropy) {
//                     candidats.push(i);
//                 }
//             }
//             let choosenOne = candidats[Math.floor(Math.random() * candidats.length)];
//             let res = randomChoose(w[choosenOne]);
//             w[choosenOne].clear(); w[choosenOne].add(res);
//             //propagate
//             let stack = [choosenOne];
//             while (stack.length) {
//                 let curo = stack.pop();
//                 let x = curo & 15, y = curo >> 4;
//                 if (x < sizex - 1) check(curo, curo + 1, Direction.px);
//                 if (x > 0) check(curo, curo - 1, Direction.nx);
//                 if (y < sizey - 1) check(curo, curo + sizex, Direction.py);
//                 if (y > 0) check(curo, curo - sizex, Direction.ny);
//             }
//             function check(curo: number, pos: number, dir: Direction) {
//                 let removeCantidats = [];
//                 for (let t of w[pos].keys()) {
//                     let found = false;
//                     for (let tile of w[curo].keys()) {
//                         if (rules[tile][dir]?.includes(t)) { found = true; break; }
//                     }
//                     if (!found) {
//                         removeCantidats.push(t);
//                     }
//                 }
//                 for (let i of removeCantidats) {
//                     w[pos].delete(i);
//                 }
//                 if (removeCantidats.length) {
//                     stack.push(pos);
//                 }
//             }
//         }
//         export function show() {
//             let charact = "";
//             let count = 0;
//             for (let i of w) {
//                 if (i.size > 1) {
//                     charact += i.size;
//                 } else {
//                     charact += `M><v^ A`[i.values().next().value];
//                 }
//                 if ((count++ & 15) == 15) {
//                     charact += "\n";
//                 }
//             }
//             return charact;
//         }
//         enum id {
//             Empty, // any buildings can be buit here
//             Road,
//             RoadTurn,
//             // Block, // buildings can only be built inside here, cross edge is not allowed
//             // River, 
//             // River_Turn,
//             // Empty_Block,
//             // Empty_Road_Block,
//             // Empty_Road_Empty,
//         };
//     }
// }
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
@group(1) @binding(3) var<uniform> camMat: AffineMat;
@group(1) @binding(4) var<storage> modelMats: array<AffineMat>;
fn apply(afmat: AffineMat, points: mat4x4<f32>) -> mat4x4<f32>{
    let biais = mat4x4<f32>(afmat.vector, afmat.vector, afmat.vector, afmat.vector);
    return afmat.matrix * points + biais;
}
@tetra fn main(input : InputType, @builtin(instance_index) index: u32) -> OutputType{
    let modelMat = modelMats[index];
    return OutputType(apply(camMat,apply(modelMat, input.pos)), modelMat.matrix * input.normal, input.uvw);
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
            let gpu = await tesserxel.getGPU();
            let canvas = document.getElementById("gpu-canvas");
            let context = gpu.getContext(canvas);
            let renderer = await new tesserxel.renderer.TetraRenderer().init(gpu, context, {
                enableFloat16Blend: false,
                sliceGroupSize: 8
            });
            let pipeline = await renderer.createTetraSlicePipeline({
                vertex: { code: vertCode, entryPoint: "main" },
                fragment: { code: fragCode, entryPoint: "main" },
                cullMode: "front"
            });
            let mesh = tesserxel.mesh.tetra.tesseract;
            let positionBuffer = gpu.createBuffer(GPUBufferUsage.STORAGE, mesh.position);
            let normalBuffer = gpu.createBuffer(GPUBufferUsage.STORAGE, mesh.normal);
            let uvwBuffer = gpu.createBuffer(GPUBufferUsage.STORAGE, mesh.uvw);
            let camMat = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 4 * 4 * 5);
            let cubeCount = 4096;
            let jsbuffer = new Float32Array(20 * cubeCount);
            let math = tesserxel.math;
            for (let i = 0; i < cubeCount; i++) {
                new math.Obj4(math.Vec4.rand().mulfs(Math.cbrt(Math.random()) * 5.0), math.Rotor.rand(), new math.Vec4(0.1, 0.1, 0.1, 0.1).adds(math.Vec4.rand().mulfs(0.05))).getAffineMat4().writeBuffer(jsbuffer, i * 20);
            }
            let modelBuffer = gpu.createBuffer(GPUBufferUsage.STORAGE, jsbuffer);
            let vertBindGroup = renderer.createBindGroup(pipeline, 1, [positionBuffer, normalBuffer, uvwBuffer, camMat, modelBuffer]);
            let sliceConfig = renderer.getSliceConfig();
            sliceConfig.opacity = 20.0;
            renderer.setSlice(sliceConfig);
            renderer.set4DCameraProjectMatrix({
                fov: 100, near: 0.02, far: 50
            });
            let retinaController = new tesserxel.controller.RetinaController(renderer);
            retinaController.mouseButton = null;
            let trackBallController = new tesserxel.controller.TrackBallController();
            trackBallController.object.position.set(0, 0, 0, -3);
            let controller = new tesserxel.controller.ControllerRegistry(canvas, [trackBallController, retinaController], { preventDefault: true, requsetPointerLock: true });
            let camMatJSBuffer = new Float32Array(20);
            let run = () => {
                controller.update();
                trackBallController.object.getAffineMat4().writeBuffer(camMatJSBuffer);
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
            let gpu = await tesserxel.getGPU();
            let canvas = document.getElementById("gpu-canvas");
            let context = gpu.getContext(canvas);
            let renderer = await new tesserxel.renderer.TetraRenderer().init(gpu, context, {
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
            let controller = new tesserxel.controller.ControllerRegistry(canvas, [camController, retinaController], { preventDefault: true, requsetPointerLock: true });
            let matModelViewJSBuffer = new Float32Array(20);
            let pipeline = await renderer.createRaytracingPipeline({
                code: this.headercode.replace(/\{replace\}/g, code),
                rayEntryPoint: "mainRay",
                fragmentEntryPoint: "mainFragment"
            });
            let bindgroups = [renderer.createBindGroup(pipeline, 1, [camBuffer])];
            this.run = () => {
                let de = fnDE(camController.object.position);
                camController.keyMoveSpeed = de * 0.001;
                let config = renderer.getSliceConfig();
                config.sectionEyeOffset = de * 0.1;
                retinaController.setSlice(config);
                controller.update();
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
    examples.MandelApp = MandelApp;
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
                    z = tesserxel.math._Q.copy(q).log().mulfs(Power).expcpy(tesserxel.math._Q).xyzw();
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
            let gpu = await tesserxel.getGPU();
            let canvas = document.getElementById("gpu-canvas");
            let context = gpu.getContext(canvas);
            let renderer = await new tesserxel.renderer.TetraRenderer().init(gpu, context, {
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
            let controller = new tesserxel.controller.ControllerRegistry(canvas, [camController, retinaController], { preventDefault: true, requsetPointerLock: true });
            let matModelViewJSBuffer = new Float32Array(20);
            let pipeline = await renderer.createRaytracingPipeline({
                code: this.headercode.replace(/\{replace\}/g, code),
                rayEntryPoint: "mainRay",
                fragmentEntryPoint: "mainFragment"
            });
            let bindgroups = [renderer.createBindGroup(pipeline, 1, [camBuffer])];
            this.run = () => {
                controller.update();
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
    examples.MengerApp = MengerApp;
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
// namespace examples {
//     export namespace menger_sponge {
//         let raytracingCode = `
//         struct ray{
//             o: vec4<f32>,
//             d: vec4<f32>,
//         }
//         struct glome{
//             p: vec4<f32>,
//             r: f32,
//             id: u32
//         }
//         fn intGlome(r:ray, g:glome)->f32 {
//              let oc = r.o - g.p;
//             let b = dot(oc, r.d);
//             let c = dot(oc, oc) - g.r*g.r;
//             var t = b*b - c;
//             if(t > 0.0) {
//                 t = -b - sqrt(t);
//             }
//             return t;
//         }
//         fn at(r:ray, t:f32)->vec4<f32>{
//             return r.o + r.d * t;
//         }
//         struct fOutputs {
//             @location(0) color: vec4<f32>,
//             @builtin(frag_depth) depth: f32,
//         }
//         struct rayOut{
//             @location(0) o: vec4<f32>,
//             @location(1) d: vec4<f32>,
//             @location(2) screen: vec3<f32>,
//         }
//         @group(1) @binding(0) var<uniform> camMat: AffineMat;
//         @ray fn mainRay(
//             @builtin(ray_direction) rd: vec4<f32>,
//             @builtin(ray_origin) ro: vec4<f32>,
//             @builtin(voxel_coord) coord: vec3<f32>,
//             @builtin(screen_aspect) aspect: f32
//         ) -> rayOut{
//             return rayOut(camMat.matrix*ro+camMat.vector, camMat.matrix*rd, vec3<f32>(coord.x*aspect,coord.yz));
//         }
// fn maxcomp( p : vec4<f32>)->f32 { return max(p.x,max(p.y, max(p.w,p.z)));}
// fn sdBox( p:vec4<f32>, b:vec4<f32> )->f32
// {
//     let di:vec4<f32> = abs(p) - b;
//     let mc:f32 = maxcomp(di);
//     return min(mc,length(max(di,vec4<f32>(0.0))));
// }
// fn iBox( ro:vec4<f32>, rd:vec4<f32>, rad:vec4<f32> )->vec2<f32> 
// {
//     let m:vec4<f32> = 1.0/rd;
//     let n:vec4<f32> = m*ro;
//     let k:vec4<f32> = abs(m)*rad;
//     let t1:vec4<f32> = -n - k;
//     let t2:vec4<f32> = -n + k;
// 	return vec2<f32>( max( max( max( t1.x, t1.y ), t1.z ),t1.w),
// 	            min( min( min( t2.x, t2.y ), t2.z ),t2.w) );
// }
// const ma = mat4x4<f32>( 0.60, 0.00,  0.80, 0.0,
//                       0.00, 1.00,  0.00,  0.0,
//                      -0.80, 0.00,  0.60,0.0,
//                      0.0,0.0,0.0,1.0);
// fn map(pos:vec4<f32> )->vec4<f32>
// {
//     var p = pos;
//     var d:f32 = sdBox(p,vec4<f32>(1.0));
//     var res = vec4<f32>( d, 1.0, 0.0, 0.0 );
//     const iTime: f32 = 1.0;
//     let ani:f32 = smoothstep( -0.2, 0.2, -cos(0.5*iTime) );
// 	let off:f32 = 1.5*sin( 0.01*iTime );
//     var s:f32 = 1.0;
//     for(var m = 0; m<5; m = m + 1)
//     {
//         p = mix( p, ma*(p+vec4<f32>(off)), ani );
//         let a:vec4<f32> = fract( p*s / 2.0 ) * 2.0-vec4<f32>(1.0);
//         s *= 3.0;
//         let r = abs(vec4<f32>(1.0) - 3.0*abs(a));
//         let da = max(max(r.x,r.y),r.z);
//         let db = max(max(r.x,r.y),r.w);
//         let dc = max(max(r.x,r.w),r.z);
//         let dd = max(max(r.w,r.y),r.z);
//         let minc = min(da,min(db,min(dc,dd)));
//         let c = (minc - 1.0)/s;
//         if( c>d ){
//             d = c;
//             res = vec4<f32>( d, min(res.y, 0.2*da*db*dc*dd), (1.0+f32(m))/4.0, 0.0 );
//         }
//     }
//     return res;
// }
// fn intersect( ro:vec4<f32>, rd:vec4<f32> )->vec4<f32>
// {
//     let bb = iBox( ro, rd, vec4<f32>(1.05) );
//     if( bb.y<bb.x ) {return vec4<f32>(-1.0);}
//     let tmin = bb.x;
//     let tmax = bb.y;
//     var t = tmin;
//     var res = vec4<f32>(-1.0);
//     for( var i=0; i<64; i=i+1 )
//     {
//         let h = map(ro + rd*t);
// 		if( h.x<0.002 || t>tmax ){ break;}
//         res = vec4<f32>(t,h.yzw);
//         t += h.x;
//     }
// 	if( t>tmax ) {res = vec4<f32>(-1.0);}
//     return res;
// }
// fn softshadow( ro:vec4<f32>, rd:vec4<f32>, mint:f32, k:f32 )->f32
// {
//     let bb = iBox( ro, rd, vec4<f32>(1.05) );
//     let tmax = bb.y;
//     var res:f32 = 1.0;
//     var t = mint;
//     for( var i=0; i<64; i++ )
//     {
//         let h = map(ro + rd*t).x;
//         res = min( res, k*h/t );
//         if( res<0.001 ) {break;}
// 		t += clamp( h, 0.005, 0.1 );
//         if( t>tmax ) {break;}
//     }
//     return clamp(res,0.0,1.0);
// }
// fn calcNormal(pos:vec4<f32>)->vec4<f32>
// {
//     let eps = vec4<f32>(0.001,0.0,0.0,0.0);
//     return normalize(vec4<f32>(
//     map(pos+eps.xyyy).x - map(pos-eps.xyyy).x,
//     map(pos+eps.yxyy).x - map(pos-eps.yxyy).x,
//     map(pos+eps.yyxy).x - map(pos-eps.yyxy).x,
//     map(pos+eps.yyyx).x - map(pos-eps.yyyx).x,
//      ));
// }
// fn render( ro:vec4<f32>, rd:vec4<f32> )->vec4<f32>
// {
//     // background color
//     var col = vec4<f32>(mix( vec3<f32>(0.3,0.2,0.1)*0.5, vec3<f32>(0.7, 0.9, 1.0), 0.5 + 0.5*rd.y ),0.2);
//     let tmat = intersect(ro,rd);
//     if( tmat.x>0.0 )
//     {
//         let pos:vec4<f32> = ro + tmat.x*rd;
//         let nor:vec4<f32> = calcNormal(pos);
//         let matcol:vec3<f32> = vec3<f32>(0.5) + 0.5*cos(vec3<f32>(0.0,1.0,2.0)+2.0*tmat.z);
//         let occ = tmat.y;
//         let light = normalize(vec4<f32>(1.0,0.9,0.3,0.6));
//         var dif:f32 = dot(nor,light);
//         var sha:f32 = 1.0;
//         if( dif>0.0 ){ sha=softshadow( pos, light, 0.01, 64.0 );}
//         dif = max(dif,0.0);
//         let hal:vec4<f32> = normalize(light-rd);
//         let spe:f32 = dif*sha*pow(clamp(dot(hal,nor),0.0,1.0),16.0)*(0.04+0.96*pow(clamp(1.0-dot(hal,light),0.0,1.0),5.0));
// 		let sky:f32 = 0.5 + 0.5*nor.y;
//         let bac:f32 = max(0.4 + 0.6*dot(nor,vec4<f32>(-light.x,light.y,-light.z,light.w)),0.0);
//         var lin = vec3<f32>(0.0);
//         lin += 1.00*dif*vec3<f32>(1.10,0.85,0.60)*sha;
//         lin += 0.50*sky*vec3<f32>(0.10,0.20,0.40)*occ;
//         lin += 0.10*bac*vec3<f32>(1.00,1.00,1.00)*(0.5+0.5*occ);
//         lin += 0.25*occ*vec3<f32>(0.15,0.17,0.20);	 
//         col = vec4<f32>(matcol*lin + spe*128.0, 1.0);
//     }
//     var gamma = 1.5*col.xyz/(vec3<f32>(1.0)+col.xyz);
//     gamma = sqrt( gamma );
//     return vec4<f32>(gamma, col.w);
// }
//         @fragment fn mainFragment(@location(0) rayOrigin: vec4<f32>, @location(1) rayDir: vec4<f32>, @location(2) screenPos: vec3<f32>)->fOutputs{
//             var depth = 0.0;
//             return fOutputs(
//                 render(rayOrigin, rayDir),
//                 depth
//             );
//             // let g1 = glome(vec4<f32>(0.0,0.0,0.0,0.0),1.0,0);
//             // let a = abs(abs(screenPos) - vec3<f32>(1.0));
//             // if(length(screenPos - vec3<f32>(-0.5,0.0,0.0)) < 0.2){
//             //     return fOutputs(vec4<f32>(1.0,1.0,0.0,1.0),depth);
//             // }
//             // if(a.x <0.1 || a.y < 0.1 || a.z<0.1){
//             //     return fOutputs(vec4<f32>(rayDir.xyz,0.0),depth);
//             // }else{
//             //     let r = ray(rayOrigin,normalize(rayDir));
//             //     let d = intGlome(r, g1);
//             //     if(d > 0){
//             //         let p = normalize(at(r, d) - g1.p);
//             //         return fOutputs(
//             //             vec4<f32>(dot(p,vec4<f32>(1.0,2.0,3.0,2.0))*vec3<f32>(1.0,0.5,0.2),1.0),
//             //             calDepth(d)
//             //         );
//             //     }
//             //     let dir = normalize(rayDir).ywx;
//             //     return fOutputs(
//             //         vec4<f32>(sin(dir*10.0),0.3),
//             //         depth
//             //     );
//             // }
//         }
//         `;
//         let vertCode = `
//         // vertex attributes, regard four vector4 for vertices of one tetrahedra as matrix4x4 
//         struct InputType{
//             @location(0) pos: mat4x4<f32>,
//             @location(1) normal: mat4x4<f32>,
//             @location(2) uvw: mat4x4<f32>,
//         }
//         // output position in camera space and data sent to fragment shader to be interpolated
//         struct OutputType{
//             @builtin(position) pos: mat4x4<f32>,
//             @location(0) normal: mat4x4<f32>,
//             @location(1) uvw: mat4x4<f32>,
//         }
//         // we define an affineMat to store rotation and transform since there's no mat5x5 in wgsl
//         struct AffineMat{
//             matrix: mat4x4<f32>,
//             vector: vec4<f32>,
//         }
//         // remember that group(0) is occupied by internal usage and binding(0) to binding(2) are occupied by vertex attributes
//         // so we start here by group(1) binding(3)
//         @group(1) @binding(3) var<uniform> camMat: AffineMat;
//         // apply affineMat to four points
//         fn applyinv(afmat: AffineMat, points: mat4x4<f32>) -> mat4x4<f32>{
//             let biais = mat4x4<f32>(afmat.vector, afmat.vector, afmat.vector, afmat.vector);
//             return transpose(afmat.matrix) * (points - biais);
//         }
//         // tell compiler that this is tetra slice pipeline's entry function by '@tetra'
//         @tetra fn main(input : InputType) -> OutputType{
//             return OutputType(applyinv(camMat,input.pos), camMat.matrix * input.normal, input.uvw);
//         }
//         `;
//         let fragHeaderCode = `
//         // receive data from vertex output, these values are automatically interpolated for every fragment
//         struct fInputType{
//             @location(0) normal : vec4<f32>,
//             @location(1) uvw : vec4<f32>,
//         };
//         // a color space conversion function
//         fn hsb2rgb( c:vec3<f32> )->vec3<f32>{
//             let a = fract(
//                 c.x+vec3<f32>(0.0,4.0,2.0)/6.0
//             );
//             var rgb = clamp(abs(a*6.0-vec3<f32>(3.0))-vec3<f32>(1.0),
//                 vec3<f32>(0.0),
//                 vec3<f32>(1.0)
//             );
//             rgb = rgb*rgb*(3.0-rgb * 2.0);
//             return c.z * mix(vec3<f32>(1.0), rgb, c.y);
//         }
//         @fragment fn main(vary: fInputType) -> @location(0) vec4<f32> {
//             const colors = array<vec3<f32>,8> (
//                 vec3<f32>(1, 0, 0),
//                 vec3<f32>(1, 1, 0),
//                 vec3<f32>(1, 0, 1),
//                 vec3<f32>(0, 0, 1),
//                 vec3<f32>(1, 0.5, 0),
//                 vec3<f32>(0, 0.5, 1),
//                 vec3<f32>(0, 1, 1),
//                 vec3<f32>(0.6, 0.9, 0.2),
//             );
//             const radius: f32 = 0.8;
//             const ambientLight = vec3<f32>(0.8);
//             const frontLightColor = vec3<f32>(5.0,4.6,3.5);
//             const backLightColor = vec3<f32>(1.9,2.4,2.8);
//             const directionalLight_dir = vec4<f32>(0.1,0.5,0.4,1.0);
//             var color:vec3<f32> = vec3(1.0,1.0,1.0);
//             var count:f32 = 0;
//             count += step(0.8,abs(vary.uvw.x));
//             count += step(0.8,abs(vary.uvw.y));
//             count += step(0.8,abs(vary.uvw.z));
//             if(dot(vary.uvw.xyz,vary.uvw.xyz) < radius * radius * radius || count >= 2.0){
//                 color = colors[u32(vary.uvw.w + 0.1)];
//             }
//             color = color * (
//                 ambientLight + frontLightColor * max(0, dot(directionalLight_dir , vary.normal)) + backLightColor * max(0, -dot(directionalLight_dir , vary.normal))
//             );
//             return vec4<f32>(pow(color,vec3<f32>(0.6))*0.5, 0.2 + f32(count>=2.0));
//         }
//         `;
//         export async function load() {
//             let gpu = await tesserxel.getGPU();
//             let canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
//             let context = gpu.getContext(canvas);
//             let renderer = await new tesserxel.renderer.TetraRenderer().init(gpu, context, {
//                 enableFloat16Blend: false,
//                 sliceGroupSize: 8
//             });
//             renderer.set4DCameraProjectMatrix({
//                 fov: 100, near: 0.01, far: 10
//             });
//             renderer.setScreenClearColor({ r: 1, g: 1, b: 1, a: 1 });
//             let camBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 4 * 4 * 5);
//             let trackBallController = new tesserxel.controller.KeepUpController();
//             trackBallController.object.position.set(0, 0, 0, -3);
//             let retinaController = new tesserxel.controller.RetinaController(renderer);
//             let controller = new tesserxel.controller.ControllerRegistry(canvas, [trackBallController, retinaController], { preventDefault: true, requsetPointerLock: true });
//             let matModelViewJSBuffer = new Float32Array(20);
//             let pipeline = await renderer.createRaytracingPipeline({
//                 code: raytracingCode,
//                 rayEntryPoint: "mainRay",
//                 fragmentEntryPoint: "mainFragment"
//             });
//             let bindgroups = [renderer.createBindGroup(pipeline, 1, [camBuffer])];
//             let cube = tesserxel.mesh.tetra.tesseract;
//             let tetraPipeline = await renderer.createTetraSlicePipeline({
//                 vertex: {
//                     code: vertCode,
//                     entryPoint: "main"
//                 },
//                 fragment: {
//                     code: fragHeaderCode,
//                     entryPoint: "main"
//                 }
//             });
//             let cubeBuffers = renderer.createBindGroup(tetraPipeline, 1, [
//                 gpu.createBuffer(GPUBufferUsage.STORAGE, cube.position),
//                 gpu.createBuffer(GPUBufferUsage.STORAGE, cube.normal),
//                 gpu.createBuffer(GPUBufferUsage.STORAGE, cube.uvw),
//                 camBuffer
//             ]);
//             let run = () => {
//                 controller.update();
//                 trackBallController.object.getAffineMat4().writeBuffer(matModelViewJSBuffer);
//                 gpu.device.queue.writeBuffer(camBuffer, 0, matModelViewJSBuffer);
//                 renderer.render(() => {
//                     renderer.drawRaytracing(pipeline, bindgroups);
//                     renderer.beginTetras(tetraPipeline);
//                     renderer.sliceTetras(cubeBuffers, cube.tetraCount);
//                     renderer.drawTetras();
//                 });
//                 window.requestAnimationFrame(run);
//             }
//             function setSize() {
//                 let width = window.innerWidth * window.devicePixelRatio;
//                 let height = window.innerHeight * window.devicePixelRatio;
//                 canvas.width = width;
//                 canvas.height = height;
//                 renderer.setSize({ width, height });
//             }
//             setSize();
//             window.addEventListener("resize", setSize);
//             run();
//         }
//     }
// }
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
            @location(0) normal: mat4x4<f32>,
            @location(1) uvw: mat4x4<f32>,
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
            return OutputType(apply(camMat,input.pos), camMat.matrix * input.normal, input.uvw);
        }
        `;
        fragHeaderCode = `
        // receive data from vertex output, these values are automatically interpolated for every fragment
        struct fInputType{
            @location(0) normal : vec4<f32>,
            @location(1) uvw : vec4<f32>,
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
            this.gpu = await tesserxel.getGPU();
            this.canvas = document.getElementById("gpu-canvas");
            this.context = this.gpu.getContext(this.canvas);
            this.renderer = await new tesserxel.renderer.TetraRenderer().init(this.gpu, this.context, {
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
            this.vertBindGroup = this.renderer.createBindGroup(this.pipeline, 1, [positionBuffer, normalBuffer, uvwBuffer, this.camBuffer]);
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
                let checkerboard = fract(vary.uvw.xyz *vec3<f32>(40.0, 40.0, 20.0)) - vec3<f32>(0.5);
                let factor = step( checkerboard.x * checkerboard.y * checkerboard.z, 0.0);
                var color:vec3<f32> = mix(hsb2rgb(vec3<f32>(vary.uvw.x,0.7,1.0)), hsb2rgb(vec3<f32>(vary.uvw.y,1.0,0.7)), factor);
                color = color * (
                    frontLightColor * max(0, dot(directionalLight_dir , vary.normal)) + backLightColor * max(0, -dot(directionalLight_dir , vary.normal))
                );
                return vec4<f32>(pow(color,vec3<f32>(0.6))*0.5, 1.0);
            }`;
            let app = await new ShapesApp().init(fragCode, tesserxel.mesh.tetra.tiger(0.5 + Math.random() * 0.1, 32, 0.5, 32, 0.2 + Math.random() * 0.05, 16));
            app.retinaController.toggleSectionConfig(1);
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
            let app = await new ShapesApp().init(fragCode, tesserxel.mesh.tetra.tesseract);
            let config = app.renderer.getSliceConfig();
            config.opacity = 10.0;
            // retina controller will own the slice config, so we should not call renderer.setSlice() directly
            app.retinaController.setSlice(config);
            app.renderer.set4DCameraProjectMatrix({ fov: 110, near: 0.01, far: 10.0 });
            app.trackBallController.object.rotation.l.set();
            app.trackBallController.object.rotation.r.set();
            app.run();
        }
        tesseract.load = load;
    })(tesseract = examples.tesseract || (examples.tesseract = {}));
})(examples || (examples = {}));
//# sourceMappingURL=examples.js.map