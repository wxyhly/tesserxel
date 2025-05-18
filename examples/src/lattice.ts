import * as tesserxel from "../../build/tesserxel.js"

const FOUR = tesserxel.four;
const canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
abstract class LatticeApp {
    renderer: tesserxel.four.Renderer;
    scene: tesserxel.four.Scene;
    glomeGeometry: tesserxel.four.GlomeGeometry
    abstract defineScene(): void;
    async init() {
        this.renderer = (await new FOUR.Renderer(canvas).init()).autoSetSize();
        this.scene = new FOUR.Scene();
        this.renderer.core.setDisplayConfig({ opacity: 5.0, sectionStereoEyeOffset: 0.5 });
        this.scene.backGroundColor = [0.6, 0.8, 0.9, 0.2];
        this.glomeGeometry = new FOUR.GlomeGeometry(0.4, 1);
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
        let camera = new FOUR.Camera();
        camera.position.w = 5.0;
        this.scene.add(camera);
        let controller = new tesserxel.util.ctrl.ControllerRegistry(canvas, [
            // new tesserxel.util.ctrl.KeepUpController(camera),
            new tesserxel.util.ctrl.TrackBallController(camera, true),
            new tesserxel.util.ctrl.RetinaController(this.renderer.core)
        ], { enablePointerLock: true });
        const run = () => {
            controller.update();
            this.renderer.render(this.scene, camera);
            window.requestAnimationFrame(run);
        }
        run();
    }
}

export namespace hc_sp {
    class App extends LatticeApp {
        defineScene() {
            let { scene, glomeGeometry } = this;
            const range = 1;
            for (let x = -range; x <= range; x++) {
                for (let y = -range; y <= range; y++) {
                    for (let z = -range; z <= range; z++) {
                        for (let w = -range; w <= range; w++) {
                            let glomeMesh = new FOUR.Mesh(glomeGeometry, new FOUR.PhongMaterial(
                                [1, 0.2, 0.1], 50
                            ));
                            glomeMesh.position.set(x * 2, y * 2, z * 2, w * 2);
                            scene.add(glomeMesh);
                        }
                    }
                }
            }
        }
    }
    export async function load() {
        new App().init();
    }
}

export namespace hc_vc {
    class App extends LatticeApp {
        defineScene() {
            let { scene, glomeGeometry } = this;
            const range = 1;
            for (let x = -range; x <= range; x++) {
                for (let y = -range; y <= range; y++) {
                    for (let z = -range; z <= range; z++) {
                        for (let w = -range; w <= range; w++) {
                            let glomeMesh = new FOUR.Mesh(glomeGeometry, new FOUR.PhongMaterial(
                                [1, 0.2, 0.1], 50
                            ));
                            glomeMesh.position.set(x * 2, y * 2, z * 2, w * 2);
                            scene.add(glomeMesh);
                            if ((x !== range && y !== range && z !== range && w !== range) || true) {
                                let glomeMesh2 = new FOUR.Mesh(glomeGeometry, new FOUR.PhongMaterial(
                                    [0, 0.8, 1.0], 50
                                ));
                                glomeMesh2.position.set(x * 2 + 1, y * 2 + 1, z * 2 + 1, w * 2 + 1);
                                scene.add(glomeMesh2);
                            }
                        }
                    }
                }
            }
        }
    }
    export async function load() {
        new App().init();
    }
}

export namespace iso6o {
    class App extends LatticeApp {
        defineScene() {
            let { scene, glomeGeometry } = this;
            const range = 6;
            const cst = Math.sqrt(3) / 2;
            for (let x = -range; x <= range; x++) {
                for (let y = -range; y <= range; y++) {
                    for (let z = -range; z <= range; z++) {
                        for (let w = -range; w <= range; w++) {
                            let glomeMesh = new FOUR.Mesh(glomeGeometry, new FOUR.PhongMaterial(
                                [1, 0.2, 0.1, 0.4], 50
                            ));
                            glomeMesh.position.set(x+y*0.5, y*cst, z + w * 0.5, w * cst);
                            const norm = glomeMesh.position.norm();
                            if (norm <= 2) {
                                glomeMesh.position.mulfs(2);
                                if (norm < 1.2) {
                                    glomeMesh.material = new FOUR.PhongMaterial([0.4, 0.0, 1.0], 50);
                                }
                                scene.add(glomeMesh);
                            }
                        }
                    }
                }
            }
        }

    }
    export async function load() {
        new App().init();
    }
}
export namespace l6_4 {
    class App extends LatticeApp {
        defineScene() {
            let { scene, glomeGeometry } = this;
            const range = 6;
            const cst = Math.sqrt(3) / 2;
            for (let x = -range; x <= range; x++) {
                for (let y = -range; y <= range; y++) {
                    for (let z = -range; z <= range; z++) {
                        for (let w = -range; w <= range; w++) {
                            let glomeMesh = new FOUR.Mesh(glomeGeometry, new FOUR.PhongMaterial(
                                [1, 0.2, 0.1, 0.4], 50
                            ));
                            glomeMesh.position.set(x, y, z + w * 0.5, w * cst);
                            const norm = glomeMesh.position.norm();
                            if (norm <= 2) {
                                glomeMesh.position.mulfs(2);
                                if (norm < 1.2) {
                                    glomeMesh.material = new FOUR.PhongMaterial([0.4, 0.0, 1.0], 50);
                                }
                                scene.add(glomeMesh);
                            }
                        }
                    }
                }
            }
        }

    }
    export async function load() {
        new App().init();
    }
}

export namespace l20 {
    class App extends LatticeApp {
        defineScene() {
            let { scene, glomeGeometry } = this;
            const range = 12;
            const cst = 4 - Math.sqrt(5);
            for (let x = -range; x <= range; x++) {
                for (let y = -range; y <= range; y++) {
                    for (let z = -range; z <= range; z++) {
                        for (let w = -range; w <= range; w++) {
                            let glomeMesh = new FOUR.Mesh(glomeGeometry, new FOUR.PhongMaterial(
                                [1, 0.2, 0.1, 0.4], 50
                            ));

                            glomeMesh.position.set(x + y + z - cst * w, x + y - cst * z + w, x - cst * y + w + z, -cst * x + y + z + w);

                            glomeMesh.position.mulfs(0.4045 * 3);
                            const norm = glomeMesh.position.norm();
                            if (norm <= 6.2) {
                                if (norm < 3) {
                                    glomeMesh.material = new FOUR.PhongMaterial([0.4, 0.0, 1.0], 50);
                                }
                                scene.add(glomeMesh);
                            }
                        }
                    }
                }
            }
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