import * as tesserxel from "../../build/esm/tesserxel.js"

const FOUR = tesserxel.four;
const canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
type GlomeBatch = { color: number[], positions: tesserxel.math.Vec4[] };

class LatticeInstancedPhongMaterial extends FOUR.PhongMaterial {
    constructor(color: number[]) {
        super(color, 50);
    }

    getShaderCode(renderer: tesserxel.four.Renderer) {
        let code = super.getShaderCode(renderer);
        let binding = this.fetchBuffers.length + 3;
        code.vs = code.vs
            .replace(
                `fn apply(afmat: tsxAffineMat, points: mat4x4f) -> mat4x4f{`,
                `struct LatticeInstance{
    matrix: mat4x4f,
    vector: vec4f,
}
@group(1) @binding(${binding}) var<storage, read> latticeInstances: array<LatticeInstance>;
fn apply(afmat: tsxAffineMat, points: mat4x4f) -> mat4x4f{`
            )
            .replace(
                `let worldPos = apply(uObjMat.pos,input.pos);`,
                `let instance = latticeInstances[index];
    let worldPos = apply(uObjMat.pos,apply(tsxAffineMat(instance.matrix,instance.vector),input.pos));`
            );
        return code;
    }
}

abstract class LatticeApp {
    renderer: tesserxel.four.Renderer;
    scene: tesserxel.four.Scene;
    glomeGeometry: tesserxel.four.GlomeGeometry
    glomeBounds = 0.4;
    abstract defineScene(): void;
    async init() {
        const app =await tesserxel.four.App.create({ canvas, controllerConfig: { enablePointerLock: true } });
        this.scene = app.scene;
        this.renderer = app.renderer;
        this.renderer.core.setDisplayConfig({ opacity: 5.0, sectionStereoEyeOffset: 0.5 });
        this.scene.backGroundColor = [0.6, 0.8, 0.9, 0.2];
        this.glomeGeometry = new FOUR.GlomeGeometry(0.4, 1);
        const updateOBB = this.glomeGeometry.updateOBB.bind(this.glomeGeometry);
        this.glomeGeometry.updateOBB = () => {
            updateOBB();
            this.glomeGeometry.obb.min.set(-this.glomeBounds, -this.glomeBounds, -this.glomeBounds, -this.glomeBounds);
            this.glomeGeometry.obb.max.set(this.glomeBounds, this.glomeBounds, this.glomeBounds, this.glomeBounds);
        };
        this.defineScene();
        this.scene.add(new FOUR.AmbientLight(0.1));
        let dirLight = new FOUR.DirectionalLight([2.1, 2.0, 1.8]);
        this.scene.add(dirLight);
        let dirLight2 = new FOUR.DirectionalLight([0.5, 0.5, 0.8]);
        dirLight2.lookAt(tesserxel.math.Vec4.yNeg, new tesserxel.math.Vec4(1, 2, 3, 4).norms());
        let dirLight3 = new FOUR.DirectionalLight([0.5, 0.5, 0.8]);
        dirLight3.lookAt(tesserxel.math.Vec4.yNeg, new tesserxel.math.Vec4(3, 1.2, 2.3, -4).norms());
        let dirLight4 = new FOUR.DirectionalLight([0.1, 0.2, 0.3]);
        dirLight4.lookAt(tesserxel.math.Vec4.yNeg, new tesserxel.math.Vec4(-3, -1.2, -2.3, 0).norms());
        this.scene.add(dirLight2);
        this.scene.add(dirLight3);
        this.scene.add(dirLight4);
        let camera = app.camera as tesserxel.four.PerspectiveCamera;
        camera.position.w = 5.0;
        this.scene.add(camera);
        app.controllerRegistry.add(new tesserxel.ui.ctrl.TrackBallController(camera, true));
        app.run();
    }

    addGlomeInstances(batches: GlomeBatch[]) {
        let bound = 0.4;
        for (const batch of batches) {
            for (const position of batch.positions) {
                bound = Math.max(bound,
                    Math.abs(position.x) + 0.4,
                    Math.abs(position.y) + 0.4,
                    Math.abs(position.z) + 0.4,
                    Math.abs(position.w) + 0.4
                );
            }
        }
        this.glomeBounds = bound;

        for (const batch of batches) {
            if (!batch.positions.length) continue;
            const instanceData = new Float32Array(batch.positions.length * 20);
            for (let i = 0; i < batch.positions.length; i++) {
                const offset = i * 20;
                instanceData[offset] = 1;
                instanceData[offset + 5] = 1;
                instanceData[offset + 10] = 1;
                instanceData[offset + 15] = 1;
                batch.positions[i].writeBuffer(instanceData, offset + 16);
            }
            const instanceBuffer = this.renderer.gpu.createBuffer(
                GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
                instanceData,
                "LatticeGlomeInstances"
            );
            const mesh = new FOUR.Mesh(this.glomeGeometry, new LatticeInstancedPhongMaterial(batch.color));
            mesh.instanceBuffer = instanceBuffer;
            mesh.instanceCount = batch.positions.length;
            this.scene.add(mesh);
        }
    }
}

export namespace hc_sp {
    class App extends LatticeApp {
        defineScene() {
            const range = 1;
            const positions: tesserxel.math.Vec4[] = [];
            for (let x = -range; x <= range; x++) {
                for (let y = -range; y <= range; y++) {
                    for (let z = -range; z <= range; z++) {
                        for (let w = -range; w <= range; w++) {
                            positions.push(new tesserxel.math.Vec4(x * 2, y * 2, z * 2, w * 2));
                        }
                    }
                }
            }
            this.addGlomeInstances([{ color: [1, 0.2, 0.1], positions }]);
        }
    }
    export async function load() {
        new App().init();
    }
}

export namespace hc_vc {
    class App extends LatticeApp {
        defineScene() {
            const range = 1;
            const redPositions: tesserxel.math.Vec4[] = [];
            const cyanPositions: tesserxel.math.Vec4[] = [];
            for (let x = -range; x <= range; x++) {
                for (let y = -range; y <= range; y++) {
                    for (let z = -range; z <= range; z++) {
                        for (let w = -range; w <= range; w++) {
                            redPositions.push(new tesserxel.math.Vec4(x * 2, y * 2, z * 2, w * 2));
                            cyanPositions.push(new tesserxel.math.Vec4(x * 2 + 1, y * 2 + 1, z * 2 + 1, w * 2 + 1));
                        }
                    }
                }
            }
            this.addGlomeInstances([
                { color: [1, 0.2, 0.1], positions: redPositions },
                { color: [0, 0.8, 1.0], positions: cyanPositions }
            ]);
        }
    }
    export async function load() {
        new App().init();
    }
}

export namespace iso6o {
    class App extends LatticeApp {
        defineScene() {
            const range = 6;
            const cst = Math.sqrt(3) / 2;
            const redPositions: tesserxel.math.Vec4[] = [];
            const purplePositions: tesserxel.math.Vec4[] = [];
            for (let x = -range; x <= range; x++) {
                for (let y = -range; y <= range; y++) {
                    for (let z = -range; z <= range; z++) {
                        for (let w = -range; w <= range; w++) {
                            const position = new tesserxel.math.Vec4(x + y * 0.5, y * cst, z + w * 0.5, w * cst);
                            const norm = position.norm();
                            if (norm <= 2) {
                                position.mulfs(2);
                                if (norm < 1.2) {
                                    purplePositions.push(position);
                                } else {
                                    redPositions.push(position);
                                }
                            }
                        }
                    }
                }
            }
            this.addGlomeInstances([
                { color: [1, 0.2, 0.1, 0.4], positions: redPositions },
                { color: [0.4, 0.0, 1.0], positions: purplePositions }
            ]);
        }

    }
    export async function load() {
        new App().init();
    }
}
export namespace l6_4 {
    class App extends LatticeApp {
        defineScene() {
            const range = 6;
            const cst = Math.sqrt(3) / 2;
            const redPositions: tesserxel.math.Vec4[] = [];
            const purplePositions: tesserxel.math.Vec4[] = [];
            for (let x = -range; x <= range; x++) {
                for (let y = -range; y <= range; y++) {
                    for (let z = -range; z <= range; z++) {
                        for (let w = -range; w <= range; w++) {
                            const position = new tesserxel.math.Vec4(x, y, z + w * 0.5, w * cst);
                            const norm = position.norm();
                            if (norm <= 2) {
                                position.mulfs(2);
                                if (norm < 1.2) {
                                    purplePositions.push(position);
                                } else {
                                    redPositions.push(position);
                                }
                            }
                        }
                    }
                }
            }
            this.addGlomeInstances([
                { color: [1, 0.2, 0.1, 0.4], positions: redPositions },
                { color: [0.4, 0.0, 1.0], positions: purplePositions }
            ]);
        }

    }
    export async function load() {
        new App().init();
    }
}

export namespace l20 {
    class App extends LatticeApp {
        defineScene() {
            const range = 12;
            const cst = 4 - Math.sqrt(5);
            const redPositions: tesserxel.math.Vec4[] = [];
            const purplePositions: tesserxel.math.Vec4[] = [];
            for (let x = -range; x <= range; x++) {
                for (let y = -range; y <= range; y++) {
                    for (let z = -range; z <= range; z++) {
                        for (let w = -range; w <= range; w++) {
                            const px = x + y + z - cst * w;
                            const py = x + y - cst * z + w;
                            const pz = x - cst * y + w + z;
                            const pw = -cst * x + y + z + w;
                            const scale = 0.4045 * 3;
                            const pxs = px * scale, pys = py * scale, pzs = pz * scale, pws = pw * scale;
                            const norm = Math.hypot(pxs, pys, pzs, pws);
                            if (norm <= 6.2) {
                                if (norm < 3) {
                                    purplePositions.push(new tesserxel.math.Vec4(pxs, pys, pzs, pws));
                                } else {
                                    redPositions.push(new tesserxel.math.Vec4(pxs, pys, pzs, pws));
                                }
                            }
                        }
                    }
                }
            }
            this.addGlomeInstances([
                { color: [1, 0.2, 0.1, 0.4], positions: redPositions },
                { color: [0.4, 0.0, 1.0], positions: purplePositions }
            ]);
        }

    }
    export async function load() {
        new App().init();
        // const a1 = -120 / 180 * Math.PI,
        //     a2 = 20 / 180 * Math.PI,
        //     a3 = 10 / 180 * Math.PI;
        // const c1 = Math.cos(a1), s1 = Math.sin(a1);
        // const c2 = Math.cos(a2), s2 = Math.sin(a2);
        // const c3 = Math.cos(a3), s3 = Math.sin(a3);
        // const e = 0.49;
        // const vs = [
        //     // new tesserxel.math.Vec4(1, 0, 0, 0).norms(),
        //     // new tesserxel.math.Vec4(-s2, c2*c, -s, 0).norms(),
        //     // new tesserxel.math.Vec4(0, 0, 1, 0).norms(),
        //     // new tesserxel.math.Vec4(s, 0, -s2, c2*c).norms(),
        //     // new tesserxel.math.Vec4(1, 0, 0, 0).norms(),
        //     // new tesserxel.math.Vec4(0, 1, 0, 0).norms(),
        //     // new tesserxel.math.Vec4(c1 * c3, -c1 * s3, s1, 0).norms(),
        //     // new tesserxel.math.Vec4(c1 * s3, c1 * c3, 0, s1).norms(),
        //     new tesserxel.math.Vec4(1, 0, 0, 0).norms(),
        //     new tesserxel.math.Vec4(-1/2, Math.sqrt(3)/2, 0, 0).norms(),
        //     new tesserxel.math.Vec4(e, e/Math.sqrt(3), Math.sqrt(1-4/3*e*e), 0).norms(),
        //     new tesserxel.math.Vec4(0, 2*e/Math.sqrt(3), (-3-4*e*e)/2/Math.sqrt(9-12*e*e), Math.sqrt((9-40*e*e+16*e*e*e*e)/(12-16*e*e))).norms(),
        // ];
        // const fs = [
        //     vs[0].wedge(vs[1]).norms(),
        //     vs[0].wedge(vs[2]).norms(),
        //     vs[0].wedge(vs[3]).norms(),
        //     vs[1].wedge(vs[2]).norms(),
        //     vs[1].wedge(vs[3]).norms(),
        //     vs[2].wedge(vs[3]).norms()
        // ];
        // const as = [
        //     vs[0].dot(vs[1]),
        //     vs[0].dot(vs[2]),
        //     vs[0].dot(vs[3]),
        //     vs[1].dot(vs[2]),
        //     vs[1].dot(vs[3]),
        //     vs[2].dot(vs[3])
        // ].map(a => (Math.acos(a) / Math.PI * 180)).map(a => (a > 90 ? (180 - a).toFixed(3) + "&" : a.toFixed(3)));
        // const ps = [
        //     tesserxel.math.Bivec.angle(fs[0], fs[5]),
        //     tesserxel.math.Bivec.angle(fs[1], fs[4]),
        //     tesserxel.math.Bivec.angle(fs[2], fs[3]),
        // ];
        // const hs = [
        //     Math.sign(fs[0].wedge(fs[5]) * fs[0].dot(fs[5])),
        //     Math.sign(fs[1].wedge(fs[4]) * fs[1].dot(fs[4])),
        //     Math.sign(fs[2].wedge(fs[3]) * fs[2].dot(fs[3])),
        // ];
        // console.log("夹角：");
        // console.table([[as[0], as[1], as[2]], [".", as[3], as[4]], [".", ".", as[5]]]);
        // console.log("平面对间：");
        // console.table(ps.map((p, i) => ([...p.map(a => (a / Math.PI * 180 > 90 ? 180 - a / Math.PI * 180 : a / Math.PI * 180).toFixed(3)), hs[i]])));
    }
}