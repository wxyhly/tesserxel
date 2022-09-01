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