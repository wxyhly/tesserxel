import { math, four, ui, mesh, render } from "../../build/esm/tesserxel.js"

let order = 3;
let cellGap = 0.1;
let blockGap = 0.2;
let hollowGap = 0.6;

/** a tesseract is tetrahedralized into 8 faces of 5 tetras each */
const tetrasPerFace = 5;
/** number of hyperfaces of a tesseract */
const faceCount = 8;
/** face index -> axis of its outward normal */
const faceAxis = [0, 0, 2, 2, 3, 3, 1, 1];
/** face index -> sign of its outward normal */
const faceSign = [-1, 1, 1, -1, 1, -1, -1, 1];
/** face index -> index of that face inside the cubie grid (depends on the rubic order) */
function faceGridIndex(order: number) {
    return faceSign.map(s => s < 0 ? 0 : order - 1);
}
/** floats of one instance: affine matrix(20) + normal matrix(16) + uvw offset(4) */
const instanceStride = 40;
/** instances are spread around the origin by their own transform,
 *  so the shared geometry must be frustum tested against the whole rubic */
const rubicBound = order;

/** one cubie of the rubic : its initial position, its current rotation,
 *  and its row inside every face's instance buffer (-1 when it doesn't own that face) */
interface RubicInstance {
    initPosition: math.Vec4;
    rotation: math.Rotor;
    rows: number[];
}

let cxm = "vec4f(1.0,1.0,1.0,5.0)";
let cxp = "vec4f(1.0,1.0,0.0,5.0)";
let cym = "vec4f(0.02,0.02,0.02,5.0)";
let cyp = "vec4f(0.0,0.0,1.0,5.0)";
let czm = "vec4f(1.0,0.0,0.0,5.0)";
let czp = "vec4f(1.0,0.0,1.0,5.0)";
let cwm = "vec4f(0.0,1.0,1.0,5.0)";
let cwp = "vec4f(0.0,1.0,0.0,5.0)";
let cbd = "vec4f(0.5,0.5,0.5,0.03)";
let cin = "vec4f(0.7,0.7,0.7,0.03)";

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
                abs(fract(pos*0.5 + vec4f(0.5)) - vec4f(0.5)),
                vec4f(0.5 - ${blockGap / 2} - ${cellGap / 2})
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
            const arr = array<vec4f,8>(
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

/** an instanced lambert material : one geometry drawn many times with one 4D affine transform per instance */
class RubicInstancedLambertMaterial extends four.LambertMaterial {
    withInstanceUvw: boolean;
    constructor(color: four.Color, withInstanceUvw: boolean) {
        super(color);
        this.withInstanceUvw = withInstanceUvw;
    }
    getShaderCode(r: four.Renderer) {
        let code = super.getShaderCode(r);
        // Bindings of the vertex bind group are (position, ...fetchBuffers, uObjMat, uCamMat),
        // so the instance buffer appended by the renderer comes last.
        let binding = this.fetchBuffers.length + 3;
        // The generated vertex shader already receives @builtin(instance_index), it just needs the data.
        code.vs = code.vs
            .replace(
                `fn apply(afmat: tsxAffineMat, points: mat4x4f) -> mat4x4f{`,
                `struct RubicInstance{
    pos: tsxAffineMat,
    normal: mat4x4f,
    uvw: vec4f,
}
@group(1) @binding(${binding}) var<storage, read> rubicInstances: array<RubicInstance>;
fn apply(afmat: tsxAffineMat, points: mat4x4f) -> mat4x4f{`
            )
            .replace(
                `let worldPos = apply(uObjMat.pos,input.pos);`,
                `let rubicInstance = rubicInstances[index];
    let worldPos = apply(uObjMat.pos,apply(rubicInstance.pos,input.pos));`
            )
            .replace(
                `normalizeVec4s(uObjMat.normal * input.normal)`,
                `normalizeVec4s(uObjMat.normal * rubicInstance.normal * input.normal)`
            );
        if (this.withInstanceUvw) {
            // move uvw from cubie space to rubic space, so that the color node still sees absolute positions
            code.vs = code.vs.replace(
                `worldPos),input.uvw);`,
                `worldPos),input.uvw + mat4x4f(rubicInstance.uvw,rubicInstance.uvw,rubicInstance.uvw,rubicInstance.uvw));`
            );
        }
        return code;
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
    update(state: ui.ctrl.ControllerState): void {
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
    moveTicks = 20;
    posHash: RubicInstance[][][][];
    instances: RubicInstance[];
    /** one Float32Array per face, holding the instance data of the cubies owning that face */
    instanceData: Float32Array<ArrayBuffer>[];
    instanceBuffers: GPUBuffer[];
    device: GPUDevice;
    scratch = new Float32Array(instanceStride);
    ticks: number = 0;
    tasks: Set<MovingBlcTask> = new Set();
    currentTask: MovingBlcTask = null;
    todoQueue: MovingBlcTask[] = [];
    constructor(
        posHash: RubicInstance[][][][], instances: RubicInstance[],
        instanceData: Float32Array<ArrayBuffer>[], instanceBuffers: GPUBuffer[], device: GPUDevice
    ) {
        this.posHash = posHash;
        this.instances = instances;
        this.instanceData = instanceData;
        this.instanceBuffers = instanceBuffers;
        this.device = device;
    }
    move(blcs: math.Vec4[], generator: math.Bivec) {
        this.todoQueue.unshift(new MovingBlcTask(
            this, blcs, generator
        ));
    }
    /** write every cubie transform into the instance buffers */
    upload() {
        let scratch = this.scratch;
        for (let inst of this.instances) {
            writeInstance(scratch, 0, inst.initPosition, inst.rotation);
            for (let f = 0; f < faceCount; f++) {
                let row = inst.rows[f];
                if (row < 0) continue;
                this.instanceData[f].set(scratch, row * instanceStride);
            }
        }
        for (let f = 0; f < faceCount; f++) {
            if (!this.instanceData[f].length) continue;
            this.device.queue.writeBuffer(this.instanceBuffers[f], 0, this.instanceData[f]);
        }
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
        this.upload();
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
    instances: RubicInstance[];
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
        if (!this.instances) {
            this.instances = this.blcs.map(v => this.mgr.posHash[v.x][v.y][v.z][v.w]);
            this.initRotors = this.instances.map(m => m.rotation.clone());
        }
        let step = this.subGenerator.exp();
        this.instances.forEach(m => {
            m.rotation.mulsl(step);
        });
        if (this.ticks === this.mgr.moveTicks) {
            this.end();
        }
        this.ticks++;
    }
    end() {
        let generator = this.generator.exp();
        this.instances.forEach((m, i) => {
            m.rotation.copy(this.initRotors[i]);
            m.rotation.mulsl(generator);
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
        let posHash: RubicInstance[][][][] = [];
        let instances: RubicInstance[] = [];

        const scene = new four.Scene();
        const cubeGroup = new four.Object();
        const cubeSubgroup1 = new four.Object();

        const cubeSubgroup2 = new four.Object();
        const cubeStructure = new four.Object();
        // const gear = GearBuilder.genGear();
        // const mat = new four.LambertMaterial([0.5, 0.5, 0.5, 1]);
        // cubeStructure.add(new four.Mesh(gear,mat).translates(new math.Vec4(0, 0, 2, 1)));
        // cubeStructure.add(new four.Mesh(gear,mat).translates(new math.Vec4(0, 0, 1, 2)));
        // cubeStructure.add(new four.Mesh(gear,mat).translates(new math.Vec4(0, 0, 1.5, 1.5)));
        cubeGroup.add(cubeSubgroup1);
        cubeGroup.add(cubeSubgroup2);
        cubeGroup.add(cubeStructure);
        cubeSubgroup2.visible = false;
        scene.add(cubeGroup);
        cubeGroup.position.w = -8;
        cubeGroup.alwaysUpdateCoord = true;

        // faceLists[f] holds the cubies owning face f, the cubie index in that list is its instance index
        let faceLists: RubicInstance[][] = [];
        for (let f = 0; f < faceCount; f++) faceLists.push([]);
        let faceGrid = faceGridIndex(order);

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
                        let index = [x, y, z, w];
                        let inst: RubicInstance = {
                            initPosition: pos,
                            rotation: new math.Rotor(),
                            rows: [-1, -1, -1, -1, -1, -1, -1, -1]
                        };
                        // a cubie only keeps the hyperfaces lying on the hull of the rubic,
                        // which is exactly what deleteTetras did with the per cubie geometries
                        for (let f = 0; f < faceCount; f++) {
                            if (index[faceAxis[f]] === faceGrid[f]) {
                                inst.rows[f] = faceLists[f].length;
                                faceLists[f].push(inst);
                            }
                        }
                        instances.push(inst);
                        posHash[x][y][z].push(inst);
                    }
                }
            }
        }

        const solidTesseract = mesh.tetra.tesseract();
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

        const rubicBlcColorNode = new RubicBlcColorNode();
        const rubicHColorNode = new RubicHColorNode();
        const solidMaterial = new RubicInstancedLambertMaterial(rubicBlcColorNode, true);
        const hollowMaterial = new RubicInstancedLambertMaterial(rubicHColorNode, false);

        const solidMeshes: four.Mesh[] = [];
        const hollowMeshes: four.Mesh[] = [];
        const instanceData: Float32Array<ArrayBuffer>[] = [];

        const cubieScale = new math.Vec4(1 - cellGap, 1 - cellGap, 1 - cellGap, 1 - cellGap);
        for (let f = 0; f < faceCount; f++) {
            // only one hyperface per geometry, instances provide the positions and the rotations
            let blc = subTetraMesh(solidTesseract, f * tetrasPerFace, tetrasPerFace)
                .applyObj4(new math.Obj4(undefined, undefined, cubieScale))
                .setUVWAsPosition();
            let hollow = subTetraMesh(hollow_explode_blc, f * tetrasPerFace, tetrasPerFace)
                .inverseNormal();
            let m1 = new four.Mesh(createRubicGeometry(blc), solidMaterial);
            let m2 = new four.Mesh(createRubicGeometry(hollow), hollowMaterial);
            solidMeshes.push(m1);
            hollowMeshes.push(m2);
            cubeSubgroup1.add(m1);
            cubeSubgroup2.add(m2);
            instanceData.push(new Float32Array(faceLists[f].length * instanceStride));
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
        const app = await four.App.create({ canvas, camera, scene, controllerConfig: { preventDefault: true } });
        app.renderer.core.setDisplayConfig({ opacity: 30 });

        // the solid and the hollow model share the very same instance buffers
        const instanceBuffers = instanceData.map((data, f) => app.renderer.gpu.createBuffer(
            GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST, data, "RubicInstance" + f
        ));
        for (let f = 0; f < faceCount; f++) {
            for (let m of [solidMeshes[f], hollowMeshes[f]]) {
                m.instanceBuffer = instanceBuffers[f];
                m.instanceCount = faceLists[f].length;
            }
        }

        const camController = new ui.ctrl.TrackBallController(cubeGroup);
        const rubicMgr = new RubicMgr(posHash, instances, instanceData, instanceBuffers, app.renderer.gpu.device);
        const rubicCtrl = new RubicCtrl(rubicMgr);
        for (let i = 0; i < 1000; i++) rubicCtrl.cycle();
        camController.mouseButton3D = 0;
        camController.mouseButton4D = 2;
        app.controllerRegistry.add(camController);
        app.controllerRegistry.add(rubicCtrl);
        app.run(() => {
            cubeSubgroup2.visible = rubicCtrl.hollowModel;
            cubeSubgroup1.visible = !rubicCtrl.hollowModel;
        });
    }
}

/** The geometry of a face sits at the origin while its instances are spread all around the origin,
 *  so its bounding box is widened to the whole rubic : otherwise frustum culling would drop visible faces.
 */
function createRubicGeometry(data: mesh.TetraMeshData): four.Geometry {
    let geometry = new four.Geometry(data);
    let updateOBB = geometry.updateOBB.bind(geometry);
    geometry.updateOBB = () => {
        updateOBB();
        geometry.obb.min.set(-rubicBound, -rubicBound, -rubicBound, -rubicBound);
        geometry.obb.max.set(rubicBound, rubicBound, rubicBound, rubicBound);
    };
    return geometry;
}

/** build the geometry of the given face of a tetrahedralized tesseract */
function subTetraMesh(m: mesh.TetraMesh, fromTetra: number, tetraCount: number): mesh.TetraMesh {
    let offset = fromTetra << 4;
    let length = tetraCount << 4;
    return new mesh.TetraMesh({
        position: m.position.slice(offset, offset + length),
        normal: m.normal?.slice(offset, offset + length),
        uvw: m.uvw?.slice(offset, offset + length),
        count: tetraCount
    });
}

/** write one instance : affine matrix, normal matrix and uvw offset.
 *  The cubie is stored at the origin, so its rotation is applied around the rubic center :
 *  worldPos = R * (pos + localPos)  =>  matrix = R, vector = R * pos
 */
const _instObj = new math.Obj4();
function writeInstance(buffer: Float32Array, offset: number, initPosition: math.Vec4, rotation: math.Rotor) {
    _instObj.position.copy(initPosition).rotates(rotation);
    _instObj.rotation.copy(rotation);
    let affine = _instObj.getAffineMat4();
    affine.writeBuffer(buffer, offset);
    // normals are transformed by the inverse transpose matrix, same as Renderer.updateMesh
    affine.mat.inv().ts().writeBuffer(buffer, offset + 20);
    // the uvw of the solid model is the absolute position inside the rubic
    initPosition.writeBuffer(buffer, offset + 36);
}

// class GearBuilder {
//     static genGear(toothCount: number = 16, radius: number = 0.8, toothwidth: number = 0.07, gearThickness: number = 0.2) {
//         let gdata = new four.DuocylinderGeometry(radius, gearThickness, { xy: 24, zw: 4 }).jsBuffer.applyObj4(new math.Obj4(undefined, new math.Bivec(0, 0, 0, 0, 0, Math.PI / 4).exp()));
//         const radius2 = radius + toothwidth * 0.5;
//         for (let i = 0; i < toothCount; i++) {
//             let angle = i * Math.PI * 2 / toothCount;
//             gdata = gdata.concat(new four.TesseractGeometry(new math.Vec4(toothwidth, toothwidth, gearThickness * Math.SQRT1_2, gearThickness * Math.SQRT1_2)).jsBuffer.applyObj4(new math.Obj4(
//                 new math.Vec4(radius2 * Math.cos(angle), radius2 * Math.sin(angle), 0, 0),
//                 new math.Bivec(angle).exp()
//             )));
//         }
//         return new four.Geometry(gdata);
//     }
// }