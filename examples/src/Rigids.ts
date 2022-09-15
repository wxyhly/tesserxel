namespace examples {
    const FOUR = tesserxel.four;
    const phy = tesserxel.physics;
    const math = tesserxel.math;
    let rigidsInSceneLists: [tesserxel.four.Mesh, tesserxel.physics.Rigid][] = [];
    let geometryData = {};
    function getGeometryData(type: string) {
        if (geometryData[type]) return geometryData[type];
        switch (type) {
            case "glome":
                geometryData[type] = new FOUR.GlomeGeometry(1); return geometryData[type];
            case "tesseractoid":
                geometryData[type] = new FOUR.TesseractGeometry(1); return geometryData[type];
            case "plane":
                geometryData[type] = new FOUR.CubeGeometry(50); return geometryData[type];
        }
    }
    function updateRidigsInScene() {
        for (let [mesh, rigid] of rigidsInSceneLists) {
            mesh.copyObj4(rigid);
        }
    }
    function addRigidToScene(
        world: tesserxel.physics.World, scene: tesserxel.four.Scene,
        renderMaterial: tesserxel.four.Material, ...rigids: tesserxel.physics.Rigid[]
    ) {
        for (let rigid of rigids) {
            let geom: tesserxel.four.Geometry;
            let obj4: tesserxel.math.Obj4;
            if (rigid.geometry instanceof phy.rigid.Union) {
                for (let c of rigid.geometry.components) {
                    addRigidToScene(null, scene, renderMaterial, c);
                }
                world.add(rigid);
                return;
            } else if (rigid.geometry instanceof phy.rigid.Tesseractoid) {
                geom = getGeometryData("tesseractoid");
                obj4 = new math.Obj4(null, null, rigid.geometry.size);
            } else if (rigid.geometry instanceof phy.rigid.Convex) {
                geom = new FOUR.ConvexHullGeometry(rigid.geometry.points);
                obj4 = new math.Obj4();
            } else if (rigid.geometry instanceof phy.rigid.Glome) {
                geom = getGeometryData("glome");
                obj4 = new math.Obj4(null, null, new math.Vec4(rigid.geometry.radius, rigid.geometry.radius, rigid.geometry.radius, rigid.geometry.radius));
            } else if (rigid.geometry instanceof phy.rigid.Plane) {
                geom = getGeometryData("plane");
                obj4 = new math.Obj4(rigid.geometry.normal.mulf(rigid.geometry.offset), math.Rotor.lookAt(math.Vec4.y, rigid.geometry.normal));
            }
            if (!geom) {
                console.log("unsupported geometry type");
            }
            let mesh = new FOUR.Mesh(geom, renderMaterial);
            mesh.copyObj4(obj4);
            mesh.alwaysUpdateCoord = true;
            world?.add(rigid); scene.add(mesh); 
            if(!(rigid.geometry instanceof phy.rigid.Plane))
            rigidsInSceneLists.push([mesh, rigid]);
        }
    }

    function createGlome(radius: number = 1, mass: number = 1) {
        return new phy.Rigid({
            geometry: new phy.rigid.Glome(radius),
            material: new phy.Material(1, 0.8), mass
        });
    }
    class EmitGlomeController implements tesserxel.controller.IController {
        enabled: boolean = true;
        world: tesserxel.physics.World; scene: tesserxel.four.Scene;
        glomeMaterial = new FOUR.PhongMaterial([1.2, 0.4, 0.2]);
        camera: tesserxel.math.Obj4;
        initialSpeed = 5;
        constructor(world: tesserxel.physics.World, scene: tesserxel.four.Scene, camera: tesserxel.math.Obj4) {
            this.world = world; this.scene = scene; this.camera = camera;
        }
        update(state: tesserxel.controller.ControllerState): void {
            if (state.queryDisabled({ disable: "AltLeft" })) return;
            if (state.isPointerLocked() && state.mouseDown === 0) {
                let g = createGlome(0.5, 5);
                g.label = "bullet"; // mark it
                g.position.copy(this.camera.position);
                g.velocity.copy(math.Vec4.wNeg.rotate(this.camera.rotation).mulfs(this.initialSpeed));
                addRigidToScene(this.world, this.scene, this.glomeMaterial, g);
            }
            for (let i = 0, l = rigidsInSceneLists.length; i < l; i++) {
                let [m, r] = rigidsInSceneLists[i];
                if (r.label === "bullet" && r.position.sub(this.camera.position).norm1() > 20) {
                    this.scene.removeChild(m);
                    this.world.remove(r);
                    rigidsInSceneLists.splice(i--, 1); l--;
                }
            }
        }
    }
    export namespace rigid_test {
        export async function load() {
            const math = tesserxel.math;
            const size = new math.Vec4(1.5, 1.3, .8, 1);

            // init render scene

            const canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
            const renderer = await new FOUR.Renderer(canvas).init();
            let scene = new FOUR.Scene();
            renderer.setBackgroudColor([1, 1, 1, 1]);
            scene.setBackgroudColor({ r: 0.8, g: 0.9, b: 1.0, a: 0.01 });
            let camera = new FOUR.Camera();
            camera.position.w = 8;
            camera.position.y = 1;
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
            const materialP = new phy.Material(1, 0.4);
            const material = new phy.Material(1, 0.4);
            addRigidToScene(world, scene, materialGround, new phy.Rigid({ geometry: new phy.rigid.Plane(new math.Vec4(0,1)), mass: 0, material: materialP }))

            renderer.core.setOpacity(10);
            const controllerRegistry = new tesserxel.controller.ControllerRegistry(canvas, [
                retinaCtrl,
                camCtrl,
                new EmitGlomeController(world, scene, camera)
            ], { requsetPointerLock: true });
            let t = -2;
            let srand = new math.Srand(Math.random());
            function run() {
                t++;
                if ((t & 0xFF) === 0xFF) {
                    let objb = new phy.Rigid({ geometry: new phy.rigid.Tesseractoid(new math.Vec4(3, 3, 3, 3).adds(math.Vec4.srand(srand)).divfs(3)), material, mass: 1 });
                    addRigidToScene(world, scene, materialBox, objb);
                    objb.position.adds(math.Vec4.srand(srand)).divfs(3);
                    objb.position.y = 12;
                }
                updateRidigsInScene();
                controllerRegistry.update();
                renderer.render(scene, camera); camera.needsUpdateCoord = true;
                engine.update(world, 1 / 60);
                window.requestAnimationFrame(run);
            }
            renderer.render(scene, camera);
            setTimeout(run, 100);

        }
        // test
        export async function load1() {
            let v = (...args: number[]) => new tesserxel.math.Vec4(...args);
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
                } else {
                    console.assert(!!newer.normals, "fake non inter");
                    let epa = tesserxel.physics.epa(dconvex, older as {
                        simplex: tesserxel.math.Vec4[];
                        reverseOrder: boolean;
                        normals: tesserxel.math.Vec4[];
                    });
                    let epadiff = tesserxel.physics.epaDiff([p], convex, newer as {
                        simplex1: tesserxel.math.Vec4[];
                        simplex2: tesserxel.math.Vec4[];
                        reverseOrder: boolean;
                        normals: tesserxel.math.Vec4[];
                    });

                    console.assert(Math.abs(epa.distance - epadiff.distance) < 0.00001);
                    console.log(epa);
                    console.log(epadiff);
                }
            }
        }
    }
}