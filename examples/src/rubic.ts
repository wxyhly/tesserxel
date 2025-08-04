import { math, four, util, mesh, render } from "../../build/esm/tesserxel.js"
interface rubicBlcMesh extends four.Mesh {
    initPosition: math.Vec4;
    peer: rubicBlcMesh;
}

let order = 3;
let cellGap = 0.1;
let blockGap = 0.2;
let hollowGap = 0.6;


let cxm = "vec4<f32>(1.0,1.0,1.0,5.0)";
let cxp = "vec4<f32>(1.0,1.0,0.0,5.0)";
let cym = "vec4<f32>(0.02,0.02,0.02,5.0)";
let cyp = "vec4<f32>(0.0,0.0,1.0,5.0)";
let czm = "vec4<f32>(1.0,0.0,0.0,5.0)";
let czp = "vec4<f32>(1.0,0.0,1.0,5.0)";
let cwm = "vec4<f32>(0.0,1.0,1.0,5.0)";
let cwp = "vec4<f32>(0.0,1.0,0.0,5.0)";
let cbd = "vec4<f32>(0.5,0.5,0.5,0.03)";
let cin = "vec4<f32>(0.7,0.7,0.7,0.03)";

class RubicBlcColorNode extends four.MaterialNode {
    declare output: "color";
    declare input: {
        uvw: four.Vec4OutputNode;
    }
    getCode(r: four.Renderer, root: four.Material, outputToken: string) {
        // Tell root material that RubicBlcMaterial needs deal dependency of vary input uvw
        let { token, code } = this.getInputCode(r, root, outputToken);
        let borderBlc = order - blockGap - cellGap;
        return code + `
            let pos = ${token.uvw};
            let abspos = abs(${token.uvw});
            let border = step(abspos,vec4(${borderBlc}));
            let xy = border.x*border.y;
            let xyz = xy*border.z;
            let xyw = xy*border.w;
            let yzw = border.y*border.z*border.w;
            let xzw = border.x*border.z*border.w;
            let shell = 1.0 - xyz*border.w;
            let colorw = xyz * mix(${cwm},${cwp},step(pos.w,0.0));
            let colorz = xyw * mix(${czm},${czp},step(pos.z,0.0));
            let colory = xzw * mix(${cym},${cyp},step(pos.y,0.0));
            let colorx = yzw * mix(${cxm},${cxp},step(pos.x,0.0));

            let blcBd = step(
                abs(fract(pos*0.5 + vec4<f32>(0.5)) - vec4<f32>(0.5)),
                vec4<f32>(0.5 - ${blockGap / 2} - ${cellGap / 2})
            );
            let ${outputToken} = mix(${cin},mix(
                colorw+colorz+colory+colorx,
                ${cbd},
                1.0-((blcBd.x + blcBd.w)*blcBd.y*blcBd.z + (blcBd.y + blcBd.z)*blcBd.x*blcBd.w)
            ),shell);
            `;
    }
    constructor(uvw?: four.Vec4OutputNode) {
        uvw ??= new four.UVWVec4Input();
        super(`Rubic(${uvw.identifier}`);
        this.input = { uvw };
    }
}
class RubicHColorNode extends four.MaterialNode {
    declare output: "color";
    declare input: {
        uvw: four.Vec4OutputNode;
    }
    getCode(r: four.Renderer, root: four.Material, outputToken: string) {
        // Tell root material that RubicBlcMaterial needs deal dependency of vary input uvw
        let { token, code } = this.getInputCode(r, root, outputToken);
        return code + `
            const arr = array<vec4<f32>,8>(
                ${cxp},
                ${cxm},
                ${czm},
                ${czp},
                ${cwm},
                ${cwp},
                ${cyp},
                ${cym}
            );
            let ${outputToken} = arr[u32(${token.uvw}.w + 0.2)];
            `;
    }
    constructor(uvw?: four.Vec4OutputNode) {
        uvw ??= new four.UVWVec4Input();
        super(`RubicH(${uvw.identifier}`);
        this.input = { uvw };
    }
}

class RubicCtrl {
    rubicMgr: RubicMgr;
    constructor(rubicMgr: RubicMgr) {
        this.rubicMgr = rubicMgr
    }
    cycle() {
        this.rubicMgr.move([
            new math.Vec4(2, 0, 0, 0),
            new math.Vec4(2, 0, 0, 1),
            new math.Vec4(2, 0, 0, 2),
            new math.Vec4(2, 0, 1, 0),
            new math.Vec4(2, 0, 1, 1),
            new math.Vec4(2, 0, 1, 2),
            new math.Vec4(2, 0, 2, 0),
            new math.Vec4(2, 0, 2, 1),
            new math.Vec4(2, 0, 2, 2),
            new math.Vec4(2, 1, 0, 0),
            new math.Vec4(2, 1, 0, 1),
            new math.Vec4(2, 1, 0, 2),
            new math.Vec4(2, 1, 1, 0),
            new math.Vec4(2, 1, 1, 1),
            new math.Vec4(2, 1, 1, 2),
            new math.Vec4(2, 1, 2, 0),
            new math.Vec4(2, 1, 2, 1),
            new math.Vec4(2, 1, 2, 2),
            new math.Vec4(2, 2, 0, 0),
            new math.Vec4(2, 2, 0, 1),
            new math.Vec4(2, 2, 0, 2),
            new math.Vec4(2, 2, 1, 0),
            new math.Vec4(2, 2, 1, 1),
            new math.Vec4(2, 2, 1, 2),
            new math.Vec4(2, 2, 2, 0),
            new math.Vec4(2, 2, 2, 1),
            new math.Vec4(2, 2, 2, 2),
        ], new math.Bivec(0, 0, 0, 0, math._90));

        this.rubicMgr.move([
            new math.Vec4(0, 2, 0, 0),
            new math.Vec4(0, 2, 0, 1),
            new math.Vec4(0, 2, 0, 2),
            new math.Vec4(0, 2, 1, 0),
            new math.Vec4(0, 2, 1, 1),
            new math.Vec4(0, 2, 1, 2),
            new math.Vec4(0, 2, 2, 0),
            new math.Vec4(0, 2, 2, 1),
            new math.Vec4(0, 2, 2, 2),
            new math.Vec4(1, 2, 0, 0),
            new math.Vec4(1, 2, 0, 1),
            new math.Vec4(1, 2, 0, 2),
            new math.Vec4(1, 2, 1, 0),
            new math.Vec4(1, 2, 1, 1),
            new math.Vec4(1, 2, 1, 2),
            new math.Vec4(1, 2, 2, 0),
            new math.Vec4(1, 2, 2, 1),
            new math.Vec4(1, 2, 2, 2),
            new math.Vec4(2, 2, 0, 0),
            new math.Vec4(2, 2, 0, 1),
            new math.Vec4(2, 2, 0, 2),
            new math.Vec4(2, 2, 1, 0),
            new math.Vec4(2, 2, 1, 1),
            new math.Vec4(2, 2, 1, 2),
            new math.Vec4(2, 2, 2, 0),
            new math.Vec4(2, 2, 2, 1),
            new math.Vec4(2, 2, 2, 2),
        ], new math.Bivec(0, 0, 0, 0, 0, math._90));

        this.rubicMgr.move([
            new math.Vec4(0, 0, 2, 0),
            new math.Vec4(0, 0, 2, 1),
            new math.Vec4(0, 0, 2, 2),
            new math.Vec4(0, 1, 2, 0),
            new math.Vec4(0, 1, 2, 1),
            new math.Vec4(0, 1, 2, 2),
            new math.Vec4(0, 2, 2, 0),
            new math.Vec4(0, 2, 2, 1),
            new math.Vec4(0, 2, 2, 2),
            new math.Vec4(1, 0, 2, 0),
            new math.Vec4(1, 0, 2, 1),
            new math.Vec4(1, 0, 2, 2),
            new math.Vec4(1, 1, 2, 0),
            new math.Vec4(1, 1, 2, 1),
            new math.Vec4(1, 1, 2, 2),
            new math.Vec4(1, 2, 2, 0),
            new math.Vec4(1, 2, 2, 1),
            new math.Vec4(1, 2, 2, 2),
            new math.Vec4(2, 0, 2, 0),
            new math.Vec4(2, 0, 2, 1),
            new math.Vec4(2, 0, 2, 2),
            new math.Vec4(2, 1, 2, 0),
            new math.Vec4(2, 1, 2, 1),
            new math.Vec4(2, 1, 2, 2),
            new math.Vec4(2, 2, 2, 0),
            new math.Vec4(2, 2, 2, 1),
            new math.Vec4(2, 2, 2, 2),
        ], new math.Vec4(1, 1, 0, 1).wedge(math.Vec4.z).duals().norms().mulfs(math._120));

        this.rubicMgr.move([
            new math.Vec4(0, 0, 0, 2),
            new math.Vec4(0, 0, 1, 2),
            new math.Vec4(0, 0, 2, 2),
            new math.Vec4(0, 1, 0, 2),
            new math.Vec4(0, 1, 1, 2),
            new math.Vec4(0, 1, 2, 2),
            new math.Vec4(0, 2, 0, 2),
            new math.Vec4(0, 2, 1, 2),
            new math.Vec4(0, 2, 2, 2),
            new math.Vec4(1, 0, 0, 2),
            new math.Vec4(1, 0, 1, 2),
            new math.Vec4(1, 0, 2, 2),
            new math.Vec4(1, 1, 0, 2),
            new math.Vec4(1, 1, 1, 2),
            new math.Vec4(1, 1, 2, 2),
            new math.Vec4(1, 2, 0, 2),
            new math.Vec4(1, 2, 1, 2),
            new math.Vec4(1, 2, 2, 2),
            new math.Vec4(2, 0, 0, 2),
            new math.Vec4(2, 0, 1, 2),
            new math.Vec4(2, 0, 2, 2),
            new math.Vec4(2, 1, 0, 2),
            new math.Vec4(2, 1, 1, 2),
            new math.Vec4(2, 1, 2, 2),
            new math.Vec4(2, 2, 0, 2),
            new math.Vec4(2, 2, 1, 2),
            new math.Vec4(2, 2, 2, 2),
        ], new math.Vec4(1, 0, 1, 0).wedge(math.Vec4.w).duals().norms().mulfs(math._180));
    }
    update(state: util.ctrl.ControllerState): void {
        if (!state.isKeyHold("AltLeft") && !state.isKeyHold("AltRight")) {
            if (state.isKeyHold(".KeyH")) {
                this.hollowModel = !this.hollowModel;
            }
            // if (state.isKeyHold(".KeyR")) {
            //     this.rubicMgr.move([
            //         new math.Vec4(2, 0, 0, 0),
            //         new math.Vec4(2, 0, 0, 1),
            //         new math.Vec4(2, 0, 0, 2),
            //         new math.Vec4(2, 0, 1, 0),
            //         new math.Vec4(2, 0, 1, 1),
            //         new math.Vec4(2, 0, 1, 2),
            //         new math.Vec4(2, 0, 2, 0),
            //         new math.Vec4(2, 0, 2, 1),
            //         new math.Vec4(2, 0, 2, 2),
            //         new math.Vec4(2, 1, 0, 0),
            //         new math.Vec4(2, 1, 0, 1),
            //         new math.Vec4(2, 1, 0, 2),
            //         new math.Vec4(2, 1, 1, 0),
            //         new math.Vec4(2, 1, 1, 1),
            //         new math.Vec4(2, 1, 1, 2),
            //         new math.Vec4(2, 1, 2, 0),
            //         new math.Vec4(2, 1, 2, 1),
            //         new math.Vec4(2, 1, 2, 2),
            //         new math.Vec4(2, 2, 0, 0),
            //         new math.Vec4(2, 2, 0, 1),
            //         new math.Vec4(2, 2, 0, 2),
            //         new math.Vec4(2, 2, 1, 0),
            //         new math.Vec4(2, 2, 1, 1),
            //         new math.Vec4(2, 2, 1, 2),
            //         new math.Vec4(2, 2, 2, 0),
            //         new math.Vec4(2, 2, 2, 1),
            //         new math.Vec4(2, 2, 2, 2),
            //     ], new math.Bivec(0, 0, 0, 0, math._90));
            // }
            // if (state.isKeyHold(".KeyU")) {
            //     this.rubicMgr.move([
            //         new math.Vec4(0, 2, 0, 0),
            //         new math.Vec4(0, 2, 0, 1),
            //         new math.Vec4(0, 2, 0, 2),
            //         new math.Vec4(0, 2, 1, 0),
            //         new math.Vec4(0, 2, 1, 1),
            //         new math.Vec4(0, 2, 1, 2),
            //         new math.Vec4(0, 2, 2, 0),
            //         new math.Vec4(0, 2, 2, 1),
            //         new math.Vec4(0, 2, 2, 2),
            //         new math.Vec4(1, 2, 0, 0),
            //         new math.Vec4(1, 2, 0, 1),
            //         new math.Vec4(1, 2, 0, 2),
            //         new math.Vec4(1, 2, 1, 0),
            //         new math.Vec4(1, 2, 1, 1),
            //         new math.Vec4(1, 2, 1, 2),
            //         new math.Vec4(1, 2, 2, 0),
            //         new math.Vec4(1, 2, 2, 1),
            //         new math.Vec4(1, 2, 2, 2),
            //         new math.Vec4(2, 2, 0, 0),
            //         new math.Vec4(2, 2, 0, 1),
            //         new math.Vec4(2, 2, 0, 2),
            //         new math.Vec4(2, 2, 1, 0),
            //         new math.Vec4(2, 2, 1, 1),
            //         new math.Vec4(2, 2, 1, 2),
            //         new math.Vec4(2, 2, 2, 0),
            //         new math.Vec4(2, 2, 2, 1),
            //         new math.Vec4(2, 2, 2, 2),
            //     ], new math.Bivec(0, 0, 0, 0, 0, math._90));
            // }
            // if (state.isKeyHold(".KeyY")) {
            //     this.rubicMgr.move([
            //         new math.Vec4(0, 0, 2, 0),
            //         new math.Vec4(0, 0, 2, 1),
            //         new math.Vec4(0, 0, 2, 2),
            //         new math.Vec4(0, 1, 2, 0),
            //         new math.Vec4(0, 1, 2, 1),
            //         new math.Vec4(0, 1, 2, 2),
            //         new math.Vec4(0, 2, 2, 0),
            //         new math.Vec4(0, 2, 2, 1),
            //         new math.Vec4(0, 2, 2, 2),
            //         new math.Vec4(1, 0, 2, 0),
            //         new math.Vec4(1, 0, 2, 1),
            //         new math.Vec4(1, 0, 2, 2),
            //         new math.Vec4(1, 1, 2, 0),
            //         new math.Vec4(1, 1, 2, 1),
            //         new math.Vec4(1, 1, 2, 2),
            //         new math.Vec4(1, 2, 2, 0),
            //         new math.Vec4(1, 2, 2, 1),
            //         new math.Vec4(1, 2, 2, 2),
            //         new math.Vec4(2, 0, 2, 0),
            //         new math.Vec4(2, 0, 2, 1),
            //         new math.Vec4(2, 0, 2, 2),
            //         new math.Vec4(2, 1, 2, 0),
            //         new math.Vec4(2, 1, 2, 1),
            //         new math.Vec4(2, 1, 2, 2),
            //         new math.Vec4(2, 2, 2, 0),
            //         new math.Vec4(2, 2, 2, 1),
            //         new math.Vec4(2, 2, 2, 2),
            //     ], new math.Vec4(1,1,0,1).wedge(math.Vec4.z).duals().norms().mulfs(math._120));
            // }
        }
        this.rubicMgr.update();
    }
    hollowModel = false;
    enabled = true;
}
class RubicMgr {
    moveTicks = 3;
    posHash: rubicBlcMesh[][][][];
    ticks: number = 0;
    tasks: Set<MovingBlcTask> = new Set();
    currentTask: MovingBlcTask = null;
    todoQueue: MovingBlcTask[] = [];
    constructor(posHash: rubicBlcMesh[][][][]) {
        this.posHash = posHash;
    }
    move(blcs: math.Vec4[], generator: math.Bivec) {
        this.todoQueue.unshift(new MovingBlcTask(
            this, blcs, generator
        ));
    }
    steps = 0;
    update() {
        if (!this.currentTask) {
            this.currentTask = this.todoQueue.pop();
            this.steps++;
        } else {
            this.currentTask.tick();
        }
        if (this.check()) {
            console.log(this.steps);
        }
        this.ticks++;
    }
    check() {
        for (let x = 0; x < order; x++) {
            for (let y = 0; y < order; y++) {
                for (let z = 0; z < order; z++) {
                    for (let w = 0; w < order; w++) {
                        const m = this.posHash[x][y][z][w];
                        let isId = m.initPosition.rotate(m.rotation).distanceSqrTo(m.initPosition);
                        if (isId > 0.1) return false;
                    }
                }
            }
        }
        return true;
    }
}
class MovingBlcTask {
    mgr: RubicMgr;
    meshes: rubicBlcMesh[];
    initRotors: math.Rotor[];
    ticks: number = 0;
    fini = false;
    generator: math.Bivec;
    subGenerator: math.Bivec;
    blcs: math.Vec4[];
    constructor(mgr: RubicMgr, blcs: math.Vec4[], generator: math.Bivec) {
        this.mgr = mgr;
        this.generator = generator;
        this.blcs = blcs;
        this.subGenerator = generator.divf(this.mgr.moveTicks);
    }
    tick() {
        if (!this.meshes) {
            this.meshes = this.blcs.map(v => this.mgr.posHash[v.x][v.y][v.z][v.w]);
            this.initRotors = this.meshes.map(m => m.rotation.clone());
        }
        this.meshes.forEach(m => {
            m.rotatesb(this.subGenerator);
            m.peer.copyObj4(m);
        });
        if (this.ticks === this.mgr.moveTicks) {
            this.end();
        }
        this.ticks++;
    }
    end() {
        this.meshes.forEach((m, i) => {
            m.rotation.copy(this.initRotors[i]);
            m.rotatesb(this.generator);
            m.peer.copyObj4(m);
            let newPos = m.initPosition.rotate(m.rotation).addfs(order - 1).divfs(2);
            this.mgr.posHash[Math.round(newPos.x)][Math.round(newPos.y)][Math.round(newPos.z)][Math.round(newPos.w)] = m;
        });
        this.fini = true;
        this.mgr.tasks.delete(this);
        this.mgr.currentTask = null;
        this.mgr = null;
    }
}
export namespace rubic {
    export async function load() {
        let posHash: rubicBlcMesh[][][][] = [];

        const scene = new four.Scene();
        const cubeGroup = new four.Object();
        const cubeSubgroup1 = new four.Object();

        const cubeSubgroup2 = new four.Object();
        cubeGroup.add(cubeSubgroup1);
        cubeGroup.add(cubeSubgroup2);
        cubeSubgroup2.visible = false;
        scene.add(cubeGroup);
        cubeGroup.position.w = -8;
        cubeGroup.alwaysUpdateCoord = true;

        const rubicBlcColorNode = new RubicBlcColorNode();
        const rubicHColorNode = new RubicHColorNode();

        const hollow_explode_blc = mesh.tetra.tesseract();
        for (let i = 0; i < hollow_explode_blc.position.length; i += 4) {
            if (Math.abs(hollow_explode_blc.normal[i]) < 0.5) {
                hollow_explode_blc.position[i] *= 1 - hollowGap;
            }
            if (Math.abs(hollow_explode_blc.normal[i + 1]) < 0.5) {
                hollow_explode_blc.position[i + 1] *= 1 - hollowGap;
            }
            if (Math.abs(hollow_explode_blc.normal[i + 2]) < 0.5) {
                hollow_explode_blc.position[i + 2] *= 1 - hollowGap;
            }
            if (Math.abs(hollow_explode_blc.normal[i + 3]) < 0.5) {
                hollow_explode_blc.position[i + 3] *= 1 - hollowGap;
            }
        }

        for (let x = 0; x < order; x++) {
            let xp = x * 2 - (order - 1);
            posHash.push([]);
            for (let y = 0; y < order; y++) {
                let yp = y * 2 - (order - 1);
                posHash[x].push([]);
                for (let z = 0; z < order; z++) {
                    let zp = z * 2 - (order - 1);
                    posHash[x][y].push([]);
                    for (let w = 0; w < order; w++) {
                        let wp = w * 2 - (order - 1);
                        let pos = new math.Vec4(xp, yp, zp, wp);
                        let cube = mesh.tetra.tesseract().applyObj4(new math.Obj4(
                            pos, null, new math.Vec4(1 - cellGap, 1 - cellGap, 1 - cellGap, 1 - cellGap)
                        ));
                        let delnums: number[] = [];
                        if (x !== 0) delnums.push(0, 1, 2, 3, 4);
                        if (x !== order - 1) delnums.push(5, 6, 7, 8, 9);
                        if (z !== 0) delnums.push(15, 16, 17, 18, 19);
                        if (z !== order - 1) delnums.push(10, 11, 12, 13, 14);
                        if (w !== 0) delnums.push(25, 26, 27, 28, 29);
                        if (w !== order - 1) delnums.push(20, 21, 22, 23, 24);
                        if (y !== 0) delnums.push(30, 31, 32, 33, 34);
                        if (y !== order - 1) delnums.push(35, 36, 37, 38, 39);


                        let blc = cube.clone().setUVWAsPosition();
                        let hollow = hollow_explode_blc.clone().applyObj4(new math.Obj4(
                            pos//, null, new math.Vec4(1 - hollowGap, 1 - hollowGap, 1 - hollowGap, 1 - hollowGap
                        )).deleteTetras(delnums).inverseNormal();
                        let m1 = new four.Mesh(new four.Geometry(blc), new four.LambertMaterial(rubicBlcColorNode)) as rubicBlcMesh;
                        let m2 = new four.Mesh(new four.Geometry(hollow), new four.LambertMaterial(rubicHColorNode)) as rubicBlcMesh;
                        m1.initPosition = pos;
                        m2.initPosition = pos;
                        m1.peer = m2;
                        m2.peer = m1;
                        posHash[x][y][z].push(m1);

                        if (pos.norm1() < 0.001) {
                            m1.visible = false;
                            m2.visible = false;
                        }
                        cubeSubgroup1.add(m1);
                        cubeSubgroup2.add(m2);
                    }
                }
            }
        }





        const ground = new four.Mesh(new four.CubeGeometry(300), new four.LambertMaterial([0.2, 0.4, 0.3, 0.03]));
        ground.position.y = -5;
        scene.add(ground);
        let skybox = new four.SimpleSkyBox();
        skybox.setOpacity(0.03);
        scene.skyBox = skybox;
        const camera = new four.PerspectiveCamera();
        scene.add(camera);
        const sunLight = new four.DirectionalLight(1.0, new math.Vec4(0.2, 0.9, 0.14, 0.1).norms());
        scene.add(sunLight);
        scene.add(new four.AmbientLight(0.3));

        const canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
        const app=await four.App.create({canvas,camera,scene,controllerConfig:{ preventDefault: true }});
        app.renderer.core.setDisplayConfig({ opacity: 30 });
        const camController = new util.ctrl.TrackBallController(cubeGroup);
        const rubicMgr = new RubicMgr(posHash);
        const rubicCtrl = new RubicCtrl(rubicMgr);
        for (let i = 0; i < 1000; i++) rubicCtrl.cycle();
        camController.mouseButton3D = 0;
        camController.mouseButton4D = 2;
        app.controllerRegistry.add(camController);
        app.controllerRegistry.add(rubicCtrl);
        app.run(()=>{
            cubeSubgroup2.visible = rubicCtrl.hollowModel;
            cubeSubgroup1.visible = !rubicCtrl.hollowModel;
        });
    }
}