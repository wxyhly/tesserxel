import * as tesserxel from "../../build/tesserxel.js"
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
        default:
            let parse: RegExpMatchArray;
            parse = type.match(/^st(.+),(.+)$/);
            if (parse) {
                geometryData[type] = new FOUR.SpheritorusGeometry(Number(parse[2]), Number(parse[1])); return geometryData[type];
            }
            parse = type.match(/^ts(.+),(.+)$/);
            if (parse) {
                geometryData[type] = new FOUR.TorisphereGeometry(Number(parse[2]), Number(parse[1])); return geometryData[type];
            }
            parse = type.match(/^tg(.+),(.+),(.+)$/);
            if (parse) {
                geometryData[type] = new FOUR.TigerGeometry(Number(parse[3]), Number(parse[1]), Number(parse[2])); return geometryData[type];
            }
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
        } else if (rigid.geometry instanceof phy.rigid.Spheritorus) {
            geom = getGeometryData("st" + rigid.geometry.majorRadius + "," + rigid.geometry.minorRadius);
            obj4 = new math.Obj4();
        } else if (rigid.geometry instanceof phy.rigid.Torisphere) {
            geom = getGeometryData("ts" + rigid.geometry.majorRadius + "," + rigid.geometry.minorRadius);
            obj4 = new math.Obj4();
        } else if (rigid.geometry instanceof phy.rigid.Tiger) {
            geom = getGeometryData("tg" + rigid.geometry.majorRadius1 + "," + rigid.geometry.majorRadius2 + "," + rigid.geometry.minorRadius);
            obj4 = new math.Obj4();
        }
        if (!geom) {
            console.log("unsupported geometry type");
        }
        let mesh = new FOUR.Mesh(geom, renderMaterial);
        mesh.copyObj4(obj4);
        mesh.alwaysUpdateCoord = true;
        world?.add(rigid); scene.add(mesh);
        if (!(rigid.geometry instanceof phy.rigid.Plane))
            rigidsInSceneLists.push([mesh, rigid]);
    }
}

function createGlome(radius: number = 1, mass: number = 1) {
    return new phy.Rigid({
        geometry: new phy.rigid.Glome(radius),
        material: new phy.Material(1, 0.8), mass
    });
}
function initScene(scene: tesserxel.four.Scene) {
    scene.add(new FOUR.AmbientLight(0.3));
    let skybox = new FOUR.SimpleSkyBox();
    skybox.setOpacity(0.03);
    scene.skyBox = skybox;
    scene.add(new FOUR.DirectionalLight(
        [2.2, 2.0, 1.9],
        skybox.getSunPosition()
    ));
    scene.setBackgroudColor({ r: 0.8, g: 0.9, b: 1.0, a: 0.01 });
}
class EmitGlomeController implements tesserxel.util.ctrl.IController {
    enabled: boolean = true;
    world: tesserxel.physics.World; scene: tesserxel.four.Scene;
    glomeMaterial = new FOUR.PhongMaterial([1.2, 0.4, 0.2]);
    camera: tesserxel.math.Obj4;
    initialSpeed = 5;
    maximumBulletDistance = 30;
    glomeRadius = 0.5;
    constructor(world: tesserxel.physics.World, scene: tesserxel.four.Scene, camera: tesserxel.math.Obj4, renderer: tesserxel.four.Renderer) {
        this.world = world; this.scene = scene; this.camera = camera;
        renderer.compileMaterials([this.glomeMaterial]);
    }
    update(state: tesserxel.util.ctrl.ControllerState): void {
        if (state.isKeyHold("AltLeft")) return;
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
                rigidsInSceneLists.splice(i--, 1); l--;
            }
        }
    }
}
function addRoom(roomSize: number, world: tesserxel.physics.World, material: tesserxel.physics.Material, scene: tesserxel.four.Scene, renderMaterial: tesserxel.four.Material) {
    // floor
    world.add(new phy.Rigid({
        geometry: new phy.rigid.Plane(new math.Vec4(0, 1)), material, mass: 0
    }));
    // left wall
    world.add(new phy.Rigid({
        geometry: new phy.rigid.Plane(new math.Vec4(1), -roomSize), material, mass: 0
    }));
    // right wall
    world.add(new phy.Rigid({
        geometry: new phy.rigid.Plane(new math.Vec4(-1), -roomSize), material, mass: 0
    }));
    // ana wall
    world.add(new phy.Rigid({
        geometry: new phy.rigid.Plane(new math.Vec4(0, 0, 1), -roomSize), material, mass: 0
    }));
    //kata wall
    world.add(new phy.Rigid({
        geometry: new phy.rigid.Plane(new math.Vec4(0, 0, -1), -roomSize), material, mass: 0
    }));
    // front wall
    world.add(new phy.Rigid({
        geometry: new phy.rigid.Plane(new math.Vec4(0, 0, 0, 1), -roomSize), material, mass: 0
    }));
    //back wall
    world.add(new phy.Rigid({
        geometry: new phy.rigid.Plane(new math.Vec4(0, 0, 0, -1), -roomSize), material, mass: 0
    }));
    let roomMesh = new FOUR.Mesh(new FOUR.TesseractGeometry(roomSize), renderMaterial);
    roomMesh.position.y += roomSize;
    roomMesh.geometry.jsBuffer.inverseNormal();
    scene.add(roomMesh);
}
export namespace st_pile {
    export async function load() {
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
        ].map(
            color => new FOUR.PhongMaterial(new FOUR.CheckerTexture(
                color, [1, 1, 1, 1],
                new FOUR.Vec4TransformNode(new FOUR.UVWVec4Input(), new math.Obj4(null, null, new math.Vec4(0, 0, 10, 0)))
            )));
        const renderMatRoom = new FOUR.LambertMaterial([0.8, 0.6, 0.3, 0.08]);
        // renderMatRoom.cullMode = "back";
        const roomSize = 2.5;
        addRoom(roomSize, world, phyMatRoom, scene, renderMatRoom);

        // set up lights, camera and renderer

        let camera = new FOUR.Camera();
        camera.position.w = 3;
        camera.position.y = 1.5;
        scene.add(camera);
        scene.add(new FOUR.AmbientLight(0.1));
        scene.add(new FOUR.DirectionalLight(
            [2.2, 2.0, 1.9],
            new math.Vec4(0.2, 0.6, 0.1, 0.3).norms()
        ));
        scene.add(new FOUR.DirectionalLight(
            [0.1, 0.2, 0.3],
            new math.Vec4(-0.2, 0.2, -0.2, -0.4).norms()
        ));
        scene.setBackgroudColor({ r: 0.8, g: 0.9, b: 1.0, a: 0.01 });

        const canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
        const renderer = await new FOUR.Renderer(canvas).init();
        renderer.core.setDisplayConfig({
            screenBackgroundColor: [1, 1, 1, 1],
            sectionStereoEyeOffset: 0.5,
            opacity: 20
        });

        // controllers

        const camCtrl = new tesserxel.util.ctrl.KeepUpController(camera);
        camCtrl.keyMoveSpeed = 0.003;

        const retinaCtrl = new tesserxel.util.ctrl.RetinaController(renderer.core);

        const emitCtrl = new EmitGlomeController(world, scene, camera, renderer);
        emitCtrl.initialSpeed = 5;

        const controllerRegistry = new tesserxel.util.ctrl.ControllerRegistry(canvas, [
            retinaCtrl,
            camCtrl,
            emitCtrl
        ], { enablePointerLock: true });

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
}
export namespace rigid_test {
    export async function load() {
        const engine = new phy.Engine({ substep: 30 });
        const world = new phy.World();
        const scene = new FOUR.Scene();
        // define physical materials: frictions and restitutions
        const phyMatBox = new phy.Material(1, 0.4);
        const phyMatGround = new phy.Material(1, 0.4);
        // define render materials
        const renderMatBox1 = new FOUR.LambertMaterial(new FOUR.CheckerTexture([0, 0, 0, 1], [1, 1, 1, 1]));
        const renderMatBox2 = new FOUR.PhongMaterial(new FOUR.GridTexture(
            [0, 0, 0, 1], [1, 1, 0, 1], 0.5,
            new FOUR.Vec4TransformNode(new FOUR.UVWVec4Input(), new math.Obj4(null, null, new math.Vec4(5, 5, 5, 5)))
        ));
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
        initScene(scene);

        const canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
        const renderer = await new FOUR.Renderer(canvas).init();
        renderer.core.setDisplayConfig({
            screenBackgroundColor: [1, 1, 1, 1],
            sectionStereoEyeOffset: 0.5,
            opacity: 20
        });
        // controllers

        const camCtrl = new tesserxel.util.ctrl.KeepUpController(camera);
        camCtrl.keyMoveSpeed = 0.01;

        const retinaCtrl = new tesserxel.util.ctrl.RetinaController(renderer.core);

        const emitCtrl = new EmitGlomeController(world, scene, camera, renderer);
        emitCtrl.initialSpeed = 10;

        const controllerRegistry = new tesserxel.util.ctrl.ControllerRegistry(canvas, [
            retinaCtrl,
            camCtrl,
            emitCtrl
        ], { enablePointerLock: true });

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
}
export namespace st_ts_chain {
    export async function load() {
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
        world.add(new phy.PointConstrain(
            torisphereArr[0], null, math.Vec4.x, torisphereArr[0].position.add(math.Vec4.x)
        ));

        // set up lights, camera and renderer

        let camera = new FOUR.Camera();
        camera.position.w = 9;
        camera.position.y = 8;
        scene.add(camera);
        initScene(scene);

        const canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
        const renderer = await new FOUR.Renderer(canvas).init();
        renderer.core.setDisplayConfig({
            screenBackgroundColor: [1, 1, 1, 1],
            sectionStereoEyeOffset: 0.5,
            opacity: 20
        });

        // controllers

        const camCtrl = new tesserxel.util.ctrl.KeepUpController(camera);
        camCtrl.keyMoveSpeed = 0.01;

        const retinaCtrl = new tesserxel.util.ctrl.RetinaController(renderer.core);

        const emitCtrl = new EmitGlomeController(world, scene, camera, renderer);
        emitCtrl.glomeRadius = 2;
        emitCtrl.maximumBulletDistance = 70;
        emitCtrl.initialSpeed = 10;

        const controllerRegistry = new tesserxel.util.ctrl.ControllerRegistry(canvas, [
            retinaCtrl,
            camCtrl,
            emitCtrl
        ], { enablePointerLock: true });

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
        // for (let i = 0; i < 10; i++) {

        //     // let r = tesserxel.math.Bivec.yw.exp();
        //     let convex = new Array(1024).fill(0).map(e => tesserxel.math.Vec4.rand().mulfs(4));
        //     let p = tesserxel.math.Vec4.rand().mulfs(2);

        //     let dconvex = convex.map(v => v.sub(p));
        //     let newer = (tesserxel.physics.gjkDiffTest([p], convex));
        //     let older = (tesserxel.physics.gjkOutDistance(dconvex));
        //     if (older.normal) {
        //         console.assert(!newer.normals, "fake inter");

        //         // console.log("no inter");
        //     } else {
        //         console.assert(!!newer.normals, "fake non inter");
        //         let epa = tesserxel.physics.epa(dconvex, older as {
        //             simplex: tesserxel.math.Vec4[];
        //             reverseOrder: boolean;
        //             normals: tesserxel.math.Vec4[];
        //         });
        //         let epadiff = tesserxel.physics.epaDiff([p], convex, newer as {
        //             simplex1: tesserxel.math.Vec4[];
        //             simplex2: tesserxel.math.Vec4[];
        //             reverseOrder: boolean;
        //             normals: tesserxel.math.Vec4[];
        //         });

        //         console.assert(Math.abs(epa.distance - epadiff.distance) < 0.00001);
        //         console.log(epa);
        //         console.log(epadiff);
        //     }
        // }
    }
}

export namespace tg_tg_chain {
    export async function load() {
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
        world.add(new phy.PointConstrain(
            tg1Arr[0], null, math.Vec4.x, tg1Arr[0].position.add(math.Vec4.x.rotate(tg1Arr[0].rotation))
        ));

        // set up lights, camera and renderer

        let camera = new FOUR.Camera();
        camera.position.w = 9;
        camera.position.y = 8;
        scene.add(camera);
        initScene(scene);

        const canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
        const renderer = await new FOUR.Renderer(canvas).init();
        renderer.core.setDisplayConfig({
            screenBackgroundColor: [1, 1, 1, 1],
            sectionStereoEyeOffset: 0.5,
            opacity: 20
        });

        // controllers

        const camCtrl = new tesserxel.util.ctrl.KeepUpController(camera);
        camCtrl.keyMoveSpeed = 0.01;

        const retinaCtrl = new tesserxel.util.ctrl.RetinaController(renderer.core);

        const emitCtrl = new EmitGlomeController(world, scene, camera, renderer);
        emitCtrl.glomeRadius = 2;
        emitCtrl.maximumBulletDistance = 70;
        emitCtrl.initialSpeed = 10;

        const controllerRegistry = new tesserxel.util.ctrl.ControllerRegistry(canvas, [
            retinaCtrl,
            camCtrl,
            emitCtrl
        ], { enablePointerLock: true });

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
}
export namespace dzhanibekov {
    class GUI {
        canvasHeight: number = 200;
        /// horizontal factor for sun angle curve
        timePerPixel: number = 0.05;
        private canvas: HTMLCanvasElement;
        private context: CanvasRenderingContext2D;
        private time = 0;
        data1: tesserxel.math.Bivec[] = [];
        data2: tesserxel.math.Bivec[] = [];
        maxPoints = 3000;
        constructor() {
            this.canvas = document.createElement("canvas");
            this.canvas.style.width = "100%";
            this.canvas.style.height = this.canvasHeight + "px";
            this.canvas.style.position = "absolute";
            this.canvas.style.bottom = "0px";
            this.canvas.style.left = "0px";

            this.context = this.canvas.getContext("2d");
            document.body.appendChild(this.canvas);
        }
        setSize() {
            this.canvas.width = window.innerWidth * window.devicePixelRatio;
            this.canvas.height = this.canvasHeight * window.devicePixelRatio;
        }
        update(g: tesserxel.physics.Rigid) {
            this.time++;
            const dp = new math.Bivec();
            g.getAngularMomentum(dp, new math.Vec4);
            if ((this.time & 3) == 1) {
                this.data1.unshift(dp);
                this.data2.unshift(g.angularVelocity.rotate(g.rotation.conj()));
            }
            if (this.data1.length > this.maxPoints) this.data1.pop();
            if (this.data2.length > this.maxPoints) this.data2.pop();
            const c = this.context;
            const width = this.canvas.width;
            const hdiv2 = this.canvas.height / 2;
            c.clearRect(0, 0, width, this.canvas.height);
            c.font = "30px Arial";

            c.lineWidth = 1;
            function draw(label: string, gain: number, data: tesserxel.math.Bivec[], idx: string, style: string) {
                c.strokeStyle = style;
                c.beginPath();
                c.moveTo(0, hdiv2);
                const isJ = label[0] == "J";
                for (let x = 0; x < width; x += 2) {
                    const bivec = data[Math.round((width - x) / 2)];
                    if (!bivec) {
                        c.moveTo(x, hdiv2);
                    } else {
                        c.lineTo(x, hdiv2 * (-bivec[idx] * gain + 1));
                    }
                }
                c.stroke();
                c.fillStyle = style;
                c.fillText(label, isJ ? 10 : width - 60, hdiv2 * (-data[0][idx] * gain + 1));
            }
            c.strokeStyle = "rgb(0,0,0)";
            c.beginPath();
            c.moveTo(0, hdiv2);
            c.lineTo(width, hdiv2);
            c.stroke();

            draw("Jxy", 0.4, this.data1, "xy", "rgb(255,120,50)");
            draw("Jxz", 0.4, this.data1, "xz", "rgb(220,220,0)");
            draw("Jxw", 0.4, this.data1, "xw", "rgb(255,20,255)");
            draw("Jyz", 0.4, this.data1, "yz", "rgb(120,255,20)");
            draw("Jyw", 0.4, this.data1, "yw", "rgb(20,255,20)");
            draw("Jzw", 0.4, this.data1, "zw", "rgb(0,220,220)");

            c.lineWidth = 3;
            draw("Wxy", 0.4, this.data2, "xy", "rgb(190,90,0)");
            draw("Wxz", 0.4, this.data2, "xz", "rgb(140,130,0)");
            draw("Wxw", 0.4, this.data2, "xw", "rgb(140,0,140)");
            draw("Wyz", 0.4, this.data2, "yz", "rgb(90,190,0)");
            draw("Wyw", 0.4, this.data2, "yw", "rgb(0,150,0)");
            draw("Wzw", 0.4, this.data2, "zw", "rgb(0,130,140)");
        }
    }
    export async function load() {
        const engine = new phy.Engine({ substep: 50, broadPhase: phy.IgnoreAllBroadPhase });
        const world = new phy.World();
        world.gravity.set();
        const scene = new FOUR.Scene();
        const compassLongueur = 2;
        const compassThickness = 0.1;
        const compassMeshMG = new FOUR.Mesh(new FOUR.TesseractGeometry(new math.Vec4(compassLongueur, compassThickness, compassThickness, compassThickness)), new FOUR.LambertMaterial([1, 0, 0, 1]));
        const compassMeshWE = new FOUR.Mesh(new FOUR.TesseractGeometry(new math.Vec4(compassThickness, compassThickness, compassLongueur, compassThickness)), new FOUR.LambertMaterial([0, 0.8, 0, 1]));
        const compassMeshNS = new FOUR.Mesh(new FOUR.TesseractGeometry(new math.Vec4(compassThickness, compassThickness, compassThickness, compassLongueur)), new FOUR.LambertMaterial([0, 0, 1, 1]));
        const compassMeshUD = new FOUR.Mesh(new FOUR.TesseractGeometry(new math.Vec4(compassThickness, compassLongueur, compassThickness, compassThickness)), new FOUR.LambertMaterial([0.6, 0.6, 0, 1]));
        const renderMat = new FOUR.LambertMaterial(new FOUR.CheckerTexture([1, 1, 1, 0.4], [0.2, 0.2, 0.2, 0.8]));
        let g = new phy.Rigid({
            // geometry: new phy.rigid.Tesseractoid(new math.Vec4(1,1.1,1.2,1.3)),
            geometry: new phy.rigid.Tesseractoid(new math.Vec4(1.1, 0.6, 1.3, 0.8)),
            // geometry: new phy.rigid.Tesseractoid(new math.Vec4(0.2,0.4,0.8,1.6)),
            mass: 2, material: new phy.Material(1, 1)
        });
        g.angularVelocity.set(1e-4, 1e-4, 1e-4, 1, 1e-4, 1e-4);
        const fixMeshMG = new FOUR.Mesh(new FOUR.TesseractGeometry(new math.Vec4(compassLongueur, compassThickness, compassThickness, compassThickness)), new FOUR.LambertMaterial([1, 0, 0, 0.3]));
        const fixMeshWE = new FOUR.Mesh(new FOUR.TesseractGeometry(new math.Vec4(compassThickness, compassThickness, compassLongueur, compassThickness)), new FOUR.LambertMaterial([0, 0.8, 0, 0.3]));
        const fixMeshNS = new FOUR.Mesh(new FOUR.TesseractGeometry(new math.Vec4(compassThickness, compassThickness, compassThickness, compassLongueur)), new FOUR.LambertMaterial([0, 0, 1, 0.3]));
        const fixMeshUD = new FOUR.Mesh(new FOUR.TesseractGeometry(new math.Vec4(compassThickness, compassLongueur, compassThickness, compassThickness)), new FOUR.LambertMaterial([0.6, 0.6, 0, 0.3]));
        addRigidToScene(world, scene, renderMat, g);
        rigidsInSceneLists[0][0].add(compassMeshNS, compassMeshWE, compassMeshMG, compassMeshUD);
        scene.add(fixMeshNS, fixMeshWE, fixMeshMG, fixMeshUD);
        let camera = new FOUR.Camera();
        camera.position.w = 4;
        scene.add(camera);
        scene.add(new FOUR.AmbientLight(0.3));
        scene.add(new FOUR.DirectionalLight(
            [2.2, 2.0, 1.9],
            new math.Vec4(0.2, 0.6, 0.1, 0.3).norms()
        ));
        scene.setBackgroudColor({ r: 0.8, g: 0.9, b: 1.0, a: 0.01 });

        const canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
        const renderer = await new FOUR.Renderer(canvas).init();
        renderer.core.setDisplayConfig({
            screenBackgroundColor: [1, 1, 1, 1],
            sectionStereoEyeOffset: 0.5,
            opacity: 20
        });
        // controllers

        const camCtrl = new tesserxel.util.ctrl.TrackBallController(camera, true);
        const retinaCtrl = new tesserxel.util.ctrl.RetinaController(renderer.core);

        const controllerRegistry = new tesserxel.util.ctrl.ControllerRegistry(canvas, [
            retinaCtrl,
            camCtrl,
        ], { enablePointerLock: true });
        const gui = new GUI;
        function setSize() {
            let width = window.innerWidth * window.devicePixelRatio;
            let height = window.innerHeight * window.devicePixelRatio;
            gui.setSize();
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
            engine.update(world, 1 / 10);
            gui.update(g);
            window.requestAnimationFrame(run);
        }
        window.addEventListener("resize", setSize);
        setSize();
        run();
    }
}
async function loadGyroScene(cwmesh: tesserxel.mesh.CWMesh, material: tesserxel.four.Material) {
    const engine = new phy.Engine({ substep: 30, forceAccumulator: phy.force_accumulator.RK4 });
    const world = new phy.World();
    const scene = new FOUR.Scene();
    let camera = new FOUR.Camera();
    camera.position.w = 4;
    camera.position.y = 0.6;
    scene.add(camera);
    scene.add(new FOUR.AmbientLight(0.3));
    scene.add(new FOUR.DirectionalLight(
        [2.2, 2.0, 1.9],
        new math.Vec4(0.2, 0.6, 0.1, 0.3).norms()
    ));
    const roomFourMat = new tesserxel.four.LambertMaterial([0.6, 0.8, 0.2, 0.2]);
    addRoom(5, world, new phy.Material(0.6, 0.4), scene, roomFourMat);
    scene.setBackgroudColor({ r: 0.8, g: 0.9, b: 1.0, a: 0.01 });
    let gyroLogic = new phy.Rigid({
        geometry: new phy.rigid.Convex(cwmesh.data[0] as tesserxel.math.Vec4[]),
        mass: 5,
        material: new phy.Material(0.6, 0.4)
    });
    let gyroDisplay = new FOUR.Mesh(new FOUR.CWMeshGeometry(cwmesh), material);
    gyroDisplay.geometry.jsBuffer.generateNormal(Math.PI / 3);
    scene.add(gyroDisplay);
    gyroDisplay.alwaysUpdateCoord = true;
    world.add(gyroLogic);
    gyroLogic.rotatesb(tesserxel.math.Bivec.rand().mulfs(0.01)); // pertubation
    rigidsInSceneLists.push([gyroDisplay, gyroLogic]);
    const canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
    const renderer = await new FOUR.Renderer(canvas).init();
    renderer.core.setDisplayConfig({
        screenBackgroundColor: [1, 1, 1, 1],
        sectionStereoEyeOffset: 0.5,
        opacity: 20
    });
    const camCtrl = new tesserxel.util.ctrl.KeepUpController(camera);
    const retinaCtrl = new tesserxel.util.ctrl.RetinaController(renderer.core);
    const controllerRegistry = new tesserxel.util.ctrl.ControllerRegistry(canvas, [
        retinaCtrl,
        camCtrl,
        new EmitGlomeController(world, scene, camera, renderer)
    ], { enablePointerLock: true });
    function setSize() {
        let width = window.innerWidth * window.devicePixelRatio;
        let height = window.innerHeight * window.devicePixelRatio;
        renderer.setSize({ width, height });
    }
    window.addEventListener("resize", setSize);
    setSize();
    function run() {
        // syncronise physics world and render scene
        updateRidigsInScene();
        // update controller states
        controllerRegistry.update();
        // rendering
        renderer.render(scene, camera);
        // simulating physics
        if (material.compiled) engine.update(world, 1 / 50);
        window.requestAnimationFrame(run);
    }
    return { gyroLogic, run };
}
export namespace gyro_conic_prism {
    export async function load() {
        const mesh = tesserxel.mesh.cw.polytope([32]).apply(v => v.set(v.x, 0, 0, v.y));
        mesh.makePyramid(math.Vec4.yNeg);
        mesh.makePrism(math.Vec4.zNeg, true);
        mesh.apply(v => (v.y += 0.2, v));
        const mat = new tesserxel.four.LambertMaterial(new tesserxel.four.CheckerTexture([0, 0, 0, 1], [1, 1, 1, 1]));
        const { gyroLogic, run } = await loadGyroScene(mesh, mat);
        gyroLogic.angularVelocity.xw = 10;
        gyroLogic.position.y = 1.2;
        run();
    }
}
export namespace gyro_cylindral_cone {
    export async function load() {
        const mesh = tesserxel.mesh.cw.polytope([32]).apply(v => v.set(v.x, 0, 0, v.y));
        mesh.makePrism(math.Vec4.zNeg, true);
        mesh.makePyramid(math.Vec4.yNeg);
        mesh.apply(v => (v.y += 0.2, v));
        const mat = new tesserxel.four.LambertMaterial(new tesserxel.four.CheckerTexture([0, 0, 0, 1], [1, 1, 1, 1]));
        const { gyroLogic, run } = await loadGyroScene(mesh, mat);
        gyroLogic.angularVelocity.xw = 10;
        gyroLogic.position.y = 1.2;
        run();
    }
}
export namespace gyro_dicone {
    export async function load() {
        const mesh = tesserxel.mesh.cw.polytope([32]).apply(v => v.set(v.x, 0, 0, v.y));
        mesh.makePyramid(math.Vec4.yNeg.add(math.Vec4.z));
        mesh.makePyramid(math.Vec4.yNeg.add(math.Vec4.zNeg));
        mesh.apply(v => (v.y += 0.2, v));
        const mat = new tesserxel.four.LambertMaterial(new tesserxel.four.CheckerTexture([0, 0, 0, 1], [1, 1, 1, 1]));
        const { gyroLogic, run } = await loadGyroScene(mesh, mat);
        gyroLogic.angularVelocity.xw = 10;
        gyroLogic.position.y = 1.2;
        run();
    }
}

export namespace gyro_duocone {
    export async function load() {
        const mesh1 = tesserxel.mesh.cw.polytope([32]).apply(v => v.set(v.x, 0, 0, v.y));
        const mesh2 = tesserxel.mesh.cw.polytope([32]).apply(v => v.set(0, v.x, v.y, 0));
        mesh1.makeDirectProduct(mesh2);
        const mesh = mesh1.makeDual();
        const mat = new tesserxel.four.LambertMaterial(new tesserxel.four.CheckerTexture([0, 0, 0, 1], [1, 1, 1, 1]));
        const { gyroLogic, run } = await loadGyroScene(mesh, mat);
        gyroLogic.angularVelocity.xw = 10;
        gyroLogic.position.y = 1.2;
        run();
    }
}

export namespace gyro_sphericone {
    export async function load() {
        const mesh = tesserxel.mesh.cw.ball2(16, 16).apply(v => v.set(v.x, 0, v.y, v.z));
        mesh.makePyramid(math.Vec4.yNeg);
        mesh.apply(v => (v.y += 0.2, v));
        const mat = new tesserxel.four.LambertMaterial(new tesserxel.four.CheckerTexture([0, 0, 0, 1], [1, 1, 1, 1]));
        const { gyroLogic, run } = await loadGyroScene(mesh, mat);
        gyroLogic.angularVelocity.xw = 10;
        gyroLogic.position.y = 1.2;
        run();
    }
}
export namespace thermo_stats {
    export async function load() {

        const engine = new phy.Engine({ substep: 5, broadPhase: phy.BoundingGlomeTreeBroadPhase });
        const world = new phy.World();
        const scene = new FOUR.Scene();
        const roomSize = 3.51;

        world.gravity.set();
        // define physical materials: frictions and restitutions
        const phyMat = new phy.Material(1, 1);
        const borderMat = new phy.Material(0, 1);
        // define render materials
        const balls: tesserxel.physics.Rigid[] = [];
        const renderMat = new FOUR.LambertMaterial(new FOUR.CheckerTexture([1, 1, 1], [0.2, 0.2, 0.2]));

        // for (let i = 0; i < 20; i++) {
        //     const g = new phy.Rigid({
        //         geometry: new phy.rigid.Glome(0.5),
        //         mass: 1, material: phyMat
        //     });
        //     g.position.randset().mulfs(3);
        //     addRigidToScene(world, scene, renderMat, g);
        //     // if (!i) {
        //     g.velocity.copy(g.position).mulfs(-0.1);
        //     g.angularVelocity.randset();
        //     // g.velocity.set(g.position.y, -g.position.x, g.position.w, -g.position.z).mulfs(4);
        //     // }
        //     balls.push(g);
        // }
        let g = new phy.Rigid({
            geometry: new phy.rigid.Tesseractoid(new math.Vec4(1.1, 0.3, 1.5, 0.7)),
            mass: 1, material: phyMat
        });
        // g.velocity.x = 1;
        // g.rotation.randset();
        g.angularVelocity.set(1e-4, 1e-4, 1e-4, 1e-4, 1e-4, 1e-4);
        g.angularVelocity.xy = 2;
        // g.position.set(-1, 0, 0, 0);
        addRigidToScene(world, scene, renderMat, g); balls.push(g);
        balls.push(g);
        // g = new phy.Rigid({
        //     geometry: new phy.rigid.Glome(0.3),
        //     mass: 1, material: phyMat
        // });
        // g.position.set(1, 0.4, 0, 0); addRigidToScene(world, scene, renderMat, g); balls.push(g);
        // g.velocity.x = -1;
        // balls.push(g);


        // g = new phy.Rigid({
        //     geometry: new phy.rigid.Glome(0.3),
        //     mass: 1, material: phyMat
        // });
        // g.position.set(2, 0, 0, 0); addRigidToScene(world, scene, renderMat, g); balls.push(g);
        // g.velocity.x = -1;


        // g = new phy.Rigid({
        //     geometry: new phy.rigid.Glome(0.3),
        //     mass: 1, material: phyMat
        // });
        // g.position.set(-1, 1, 0, 0); addRigidToScene(world, scene, renderMat, g); balls.push(g);

        // g = new phy.Rigid({
        //     geometry: new phy.rigid.Glome(0.3),
        //     mass: 1, material: phyMat
        // });
        // g.position.set(1, 1, 0, 0); addRigidToScene(world, scene, renderMat, g); balls.push(g);
        // g.velocity.x = 1;


        // g = new phy.Rigid({
        //     geometry: new phy.rigid.Glome(0.3),
        //     mass: 1, material: phyMat
        // });
        // g.position.set(2, 1, 0, 0); addRigidToScene(world, scene, renderMat, g); balls.push(g);
        // g.velocity.x = -1;
        // floor
        world.add(new phy.Rigid({
            geometry: new phy.rigid.Plane(new math.Vec4(0, 1), -roomSize), material: borderMat, mass: 0
        }));
        // ceil
        world.add(new phy.Rigid({
            geometry: new phy.rigid.Plane(new math.Vec4(0, -1), -roomSize), material: borderMat, mass: 0
        }));
        // left wall
        world.add(new phy.Rigid({
            geometry: new phy.rigid.Plane(new math.Vec4(1), -roomSize), material: borderMat, mass: 0
        }));
        // right wall
        world.add(new phy.Rigid({
            geometry: new phy.rigid.Plane(new math.Vec4(-1), -roomSize), material: borderMat, mass: 0
        }));
        // ana wall
        world.add(new phy.Rigid({
            geometry: new phy.rigid.Plane(new math.Vec4(0, 0, 1), -roomSize), material: borderMat, mass: 0
        }));
        //kata wall
        world.add(new phy.Rigid({
            geometry: new phy.rigid.Plane(new math.Vec4(0, 0, -1), -roomSize), material: borderMat, mass: 0
        }));
        // front wall
        world.add(new phy.Rigid({
            geometry: new phy.rigid.Plane(new math.Vec4(0, 0, 0, 1), -roomSize), material: borderMat, mass: 0
        }));
        //back wall
        world.add(new phy.Rigid({
            geometry: new phy.rigid.Plane(new math.Vec4(0, 0, 0, -1), -roomSize), material: borderMat, mass: 0
        }));

        // set up lights, camera and renderer

        let camera = new FOUR.Camera();
        camera.position.w = -5;
        // camera.lookAt(math.Vec4.w, math.Vec4.origin);
        scene.add(camera);
        scene.add(new FOUR.AmbientLight(0.3));
        scene.add(new FOUR.DirectionalLight(
            [2.2, 2.0, 1.9],
            new math.Vec4(0.2, 0.6, 0.1, 0.3).norms()
        ));
        scene.setBackgroudColor({ r: 0.8, g: 0.9, b: 1.0, a: 0.01 });

        const canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
        const renderer = await new FOUR.Renderer(canvas).init();
        renderer.core.setDisplayConfig({
            screenBackgroundColor: [1, 1, 1, 1],
            sectionStereoEyeOffset: 0.5,
            opacity: 20
        });
        // controllers

        const camCtrl = new tesserxel.util.ctrl.TrackBallController(camera);
        const retinaCtrl = new tesserxel.util.ctrl.RetinaController(renderer.core);

        // const emitCtrl = new EmitGlomeController(world, scene, camera, renderer);
        // emitCtrl.glomeRadius = 2;
        // emitCtrl.maximumBulletDistance = 70;
        // emitCtrl.initialSpeed = 10;

        const controllerRegistry = new tesserxel.util.ctrl.ControllerRegistry(canvas, [
            retinaCtrl,
            camCtrl,
            // emitCtrl
        ], { enablePointerLock: true });

        function setSize() {
            let width = window.innerWidth * window.devicePixelRatio;
            let height = window.innerHeight * window.devicePixelRatio;
            renderer.setSize({ width, height });
        }
        let time = 0;

        let factor = 1;
        function run() {
            time++;
            // syncronise physics world and render scene
            updateRidigsInScene();
            // update controller states
            controllerRegistry.update();
            // rendering
            camera.position.negs();
            renderer.render(scene, camera);
            camera.position.negs();
            // simulating physics
            if (time > 300 || time < 2) engine.update(world, factor / 20);
            window.requestAnimationFrame(run);
            if (time % 32 === 0) {
                // let jeg: string[] = [];
                // let sum = new math.Bivec();
                // for (const g of balls) {
                //     let degree = Math.atan2(g.angularVelocity.dual().add(g.angularVelocity).norm(), g.angularVelocity.dual().sub(g.angularVelocity).norm());
                //     degree = degree * 4 / Math.PI - 1;
                //     jeg.push(degree.toFixed(4));
                //     sum.adds(g.angularVelocity);
                // }
                // let degree = Math.atan2(sum.dual().add(sum).norm(), sum.dual().sub(sum).norm());
                // degree = degree * 4 / Math.PI - 1;
                // console.log(jeg.join(","));
                // console.log(degree.toFixed(4));
                const p = new math.Bivec();
                const dp = new math.Bivec();
                for (const b of balls) {
                    p.adds(b.getAngularMomentum(dp, new math.Vec4));
                }
                console.log(g.angularVelocity.rotate(g.rotation.conj()));
                console.log(p);
            }

        }
        window.addEventListener("resize", setSize);
        setSize();
        run();
    }
}
export namespace mix_chain {
    export async function load() {
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
        world.add(new phy.PointConstrain(
            tgArr[0], null, math.Vec4.x, tgArr[0].position.add(math.Vec4.x.rotate(tgArr[0].rotation))
        ));

        // set up lights, camera and renderer

        let camera = new FOUR.Camera();
        camera.position.w = 9;
        camera.position.y = 8;
        scene.add(camera);
        initScene(scene);

        const canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
        const renderer = await new FOUR.Renderer(canvas).init();
        renderer.core.setDisplayConfig({
            screenBackgroundColor: [1, 1, 1, 1],
            sectionStereoEyeOffset: 0.5,
            opacity: 20
        });

        // controllers

        const camCtrl = new tesserxel.util.ctrl.KeepUpController(camera);
        camCtrl.keyMoveSpeed = 0.01;

        const retinaCtrl = new tesserxel.util.ctrl.RetinaController(renderer.core);

        const emitCtrl = new EmitGlomeController(world, scene, camera, renderer);
        emitCtrl.glomeRadius = 2;
        emitCtrl.maximumBulletDistance = 70;
        emitCtrl.initialSpeed = 10;

        const controllerRegistry = new tesserxel.util.ctrl.ControllerRegistry(canvas, [
            retinaCtrl,
            camCtrl,
            emitCtrl
        ], { enablePointerLock: true });

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
}
async function loadMaxwell(cb: (
    world: tesserxel.physics.World,
    maxwell: tesserxel.physics.MaxWell,
    scene: tesserxel.four.Scene,
    renderer: tesserxel.four.Renderer
) => Promise<void>) {
    const engine = new phy.Engine({ substep: 30, forceAccumulator: phy.force_accumulator.RK4 });
    const world = new phy.World();
    const scene = new FOUR.Scene();
    // define physical materials: frictions and restitutions
    const phyMatGround = new phy.Material(1, 0.8);
    // define render materials
    const renderMatGround = new FOUR.LambertMaterial([0.2, 1, 0.2, 0.03]);
    // renderMatGround.cullMode = "back";
    const roomSize = 6;
    addRoom(roomSize, world, phyMatGround, scene, renderMatGround);
    let maxwell = new phy.MaxWell();
    world.add(maxwell);

    const canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
    const renderer = await new FOUR.Renderer(canvas).init();
    await cb(world, maxwell, scene, renderer);
    // set up lights, camera and renderer

    let camera = new FOUR.Camera();
    camera.position.w = 9;
    camera.position.y = 8;
    scene.add(camera);
    initScene(scene);
    scene.skyBox = null; // delete skyBox in initScene() to save resources, because sky can't be seen
    await renderer.compileMaterials(scene);
    renderer.core.setDisplayConfig({
        screenBackgroundColor: [1, 1, 1, 1],
        sectionStereoEyeOffset: 0.5,
        opacity: 20
    });

    // controllers

    const camCtrl = new tesserxel.util.ctrl.KeepUpController(camera);
    camCtrl.keyMoveSpeed = 0.01;
    const gravityCtrl = {
        update: function (state: tesserxel.util.ctrl.ControllerState): void {
            if (state.isKeyHold(".KeyG")) {
                gravityCtrl.gravity = !gravityCtrl.gravity;
                world.gravity.y = gravityCtrl.gravity ? -9.8 : 0;
            }
        },
        enabled: true,
        gravity: true
    };

    const retinaCtrl = new tesserxel.util.ctrl.RetinaController(renderer.core);

    const emitCtrl = new EmitGlomeController(world, scene, camera, renderer);
    emitCtrl.glomeRadius = 1;
    emitCtrl.maximumBulletDistance = 70;
    emitCtrl.initialSpeed = 10;

    const controllerRegistry = new tesserxel.util.ctrl.ControllerRegistry(canvas, [
        retinaCtrl,
        camCtrl,
        emitCtrl,
        gravityCtrl
    ], { enablePointerLock: true });

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

export namespace e_charge {
    export async function load() {
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
}
export namespace e_dipole {
    export async function load() {
        await loadMaxwell(async (world, maxwell, scene, renderer) => {
            const phyMatCharge = new phy.Material(1, 0.5);
            const renderMatEDipole = new FOUR.LambertMaterial(new FOUR.CheckerTexture(
                [1, 0, 0, 1], [0, 0, 1, 1],
                new FOUR.Vec4TransformNode(
                    new FOUR.UVWVec4Input(),
                    new math.Obj4(new math.Vec4(0.45), null, new math.Vec4(0.1, 0.1, 0.1, 0.1))
                )
            ));
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
}
export namespace m_dipole {
    export async function load() {
        await loadMaxwell(async (world, maxwell, scene, renderer) => {
            const phyMatCharge = new phy.Material(1, 0.5);
            const renderMatMDipole = new FOUR.LambertMaterial(new FOUR.CheckerTexture(
                [1, 0, 0, 1], new FOUR.CheckerTexture(
                    [0.6, 0.6, 0.6, 0.2], [0, 0, 1, 1],
                    new FOUR.Vec4TransformNode(
                        new FOUR.UVWVec4Input(),
                        new math.Obj4(new math.Vec4(0, 0, 0.41), null, new math.Vec4(0.1, 0.1, 0.1, 0.1))
                    )
                ),
                new FOUR.Vec4TransformNode(
                    new FOUR.UVWVec4Input(),
                    new math.Obj4(new math.Vec4(0, 0, 0.49), null, new math.Vec4(0.1, 0.1, 0.1, 0.1))
                )
            ));
            const chargeNum = 12;
            const radius = 5;
            // await renderMatMDipole.compile(renderer);
            let damp = new phy.Damping(0.01, 0.01);
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
}
export namespace m_dipole_dual {
    export async function load() {
        await loadMaxwell(async (world, maxwell, scene, renderer) => {
            const phyMatCharge = new phy.Material(1, 0.5);
            const renderMatMDipoleDual = new FOUR.LambertMaterial(new FOUR.CheckerTexture(
                [1, 0, 0, 1], new FOUR.CheckerTexture(
                    [1, 0.5, 0.5, 0.2], [0, 0, 1, 1],
                    new FOUR.Vec4TransformNode(
                        new FOUR.UVWVec4Input(),
                        new math.Obj4(new math.Vec4(0, 0, 0.41), null, new math.Vec4(0.1, 0.1, 0.1, 0.1))
                    )
                ),
                new FOUR.Vec4TransformNode(
                    new FOUR.UVWVec4Input(),
                    new math.Obj4(new math.Vec4(0, 0, 0.49), null, new math.Vec4(0.1, 0.1, 0.1, 0.1))
                )
            ));

            const renderMatMDipoleAntiDual = new FOUR.LambertMaterial(new FOUR.CheckerTexture(
                [1, 0, 0, 1], new FOUR.CheckerTexture(
                    [0.5, 0.5, 1, 0.2], [0, 0, 1, 1],
                    new FOUR.Vec4TransformNode(
                        new FOUR.UVWVec4Input(),
                        new math.Obj4(new math.Vec4(0, 0, 0.41), null, new math.Vec4(0.1, 0.1, 0.1, 0.1))
                    )
                ),
                new FOUR.Vec4TransformNode(
                    new FOUR.UVWVec4Input(),
                    new math.Obj4(new math.Vec4(0, 0, 0.49), null, new math.Vec4(0.1, 0.1, 0.1, 0.1))
                )
            ));
            const chargeNum = 12;
            const radius = 5;
            // await renderMatMDipoleDual.compile(renderer);
            // await renderMatMDipoleAntiDual.compile(renderer);
            let damp = new phy.Damping(0.01, 0.01);
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
}