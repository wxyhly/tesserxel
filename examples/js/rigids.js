import * as tesserxel from "../../build/esm/tesserxel.js";
const FOUR = tesserxel.four;
const phy = tesserxel.physics;
const math = tesserxel.math;
let rigidsInSceneLists = [];
let geometryData = {};
const lang = new URLSearchParams(window.location.search.slice(1)).get("lang") ?? (navigator.languages.join(",").includes("zh") ? "zh" : "en");
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
            parse = type.match(/^dt(.+),(.+),(.+)$/);
            if (parse) {
                geometryData[type] = new FOUR.DitorusGeometry(Number(parse[3]), Number(parse[1]), Number(parse[2]));
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
        else if (rigid.geometry instanceof phy.rigid.Ditorus) {
            geom = getGeometryData("dt" + rigid.geometry.majorRadius + "," + rigid.geometry.middleRadius + "," + rigid.geometry.minorRadius);
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
function initScene(scene) {
    scene.add(new FOUR.AmbientLight(0.3));
    let skybox = new FOUR.SimpleSkyBox();
    skybox.setOpacity(0.03);
    scene.skyBox = skybox;
    scene.add(new FOUR.DirectionalLight([2.2, 2.0, 1.9], skybox.getSunPosition()));
    scene.setBackgroundColor({ r: 0.8, g: 0.9, b: 1.0, a: 0.01 });
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
    constructor(world, scene, camera, renderer) {
        this.world = world;
        this.scene = scene;
        this.camera = camera;
        renderer.compileMaterials([this.glomeMaterial]);
    }
    update(state) {
        if (state.isKeyHold("AltLeft"))
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
function addRoom(roomSize, world, material, scene, renderMaterial, ceil) {
    //ceil wall
    if (ceil) {
        world.add(new phy.Rigid({
            geometry: new phy.rigid.Plane(new math.Vec4(0, -1), -roomSize), material, mass: 0
        }));
        world.add(new phy.Rigid({
            geometry: new phy.rigid.Plane(new math.Vec4(0, 1), -roomSize), material, mass: 0
        }));
    }
    else {
        // floor
        world.add(new phy.Rigid({
            geometry: new phy.rigid.Plane(new math.Vec4(0, 1)), material, mass: 0
        }));
    }
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
    if (!ceil)
        roomMesh.position.y += roomSize;
    roomMesh.geometry.jsBuffer.inverseNormal();
    scene.add(roomMesh);
}
export var st_pile;
(function (st_pile) {
    async function load() {
        const engine = new phy.Engine({ substep: 16 });
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
        // renderMatRoom.cullMode = "back";
        const roomSize = 2.5;
        addRoom(roomSize, world, phyMatRoom, scene, renderMatRoom);
        // set up lights, camera and renderer
        let camera = new FOUR.PerspectiveCamera();
        camera.position.w = 3;
        camera.position.y = 1.5;
        scene.add(camera);
        scene.add(new FOUR.AmbientLight(0.1));
        scene.add(new FOUR.DirectionalLight([2.2, 2.0, 1.9], new math.Vec4(0.2, 0.6, 0.1, 0.3).norms()));
        scene.add(new FOUR.DirectionalLight([0.1, 0.2, 0.3], new math.Vec4(-0.2, 0.2, -0.2, -0.4).norms()));
        scene.setBackgroundColor({ r: 0.8, g: 0.9, b: 1.0, a: 0.01 });
        const canvas = document.getElementById("gpu-canvas");
        const app = await tesserxel.four.App.create({ canvas, camera, scene, controllerConfig: { enablePointerLock: true } });
        const renderer = app.renderer;
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
        let tick = -2;
        function run() {
            // emit a tesseract for every 256 ticks
            if ((tick++ & 0xFF) === 0xFF) {
                const seed = (tick >> 8) & 7;
                let spheritorus = new phy.Rigid({
                    geometry: seed === 4 ? new phy.rigid.Ditorus(0.8, 0.3, 0.15) : seed === 6 ?
                        new phy.rigid.Torisphere(1, 0.3) : new phy.rigid.Spheritorus(1, 0.3),
                    material: phyMatSt, mass: 1
                });
                spheritorus.position.y = 8;
                spheritorus.rotatesb(new math.Bivec(0, tick / 0xFF / 10));
                spheritorus.angularVelocity.randset().mulfs(0.01);
                addRigidToScene(world, scene, renderMatSts[seed], spheritorus);
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
        run();
    }
    st_pile.load = load;
})(st_pile || (st_pile = {}));
export var rigid_test;
(function (rigid_test) {
    async function load() {
        const engine = new phy.Engine({ substep: 60 });
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
        let camera = new FOUR.PerspectiveCamera();
        camera.position.w = 4;
        camera.position.y = 4;
        scene.add(camera);
        initScene(scene);
        const canvas = document.getElementById("gpu-canvas");
        const app = await tesserxel.four.App.create({ canvas, camera, scene, controllerConfig: { enablePointerLock: true } });
        const renderer = app.renderer;
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
        let tick = -2;
        const wfs = new tesserxel.four.WireFrameScene;
        scene.wireframe = wfs;
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
                let wfo = new tesserxel.four.WireFrameTesseractoid(size);
                wfs.add(wfo);
                if (randomChoose) {
                    // give random rotation to tesseractoid
                    let randVec3 = math.Vec3.rand().mulfs(0.1);
                    tesseract.rotatesb(new math.Bivec(0, randVec3.x, randVec3.y, 0, 0, randVec3.z));
                }
                tesseract.position.y = 15;
                wfo.position = tesseract.position;
                wfo.rotation = tesseract.rotation;
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
        run();
    }
    rigid_test.load = load;
})(rigid_test || (rigid_test = {}));
export var st_ts_chain;
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
        let camera = new FOUR.PerspectiveCamera();
        camera.position.w = 9;
        camera.position.y = 8;
        scene.add(camera);
        initScene(scene);
        const canvas = document.getElementById("gpu-canvas");
        const app = await tesserxel.four.App.create({ canvas, camera, scene, controllerConfig: { enablePointerLock: true } });
        const renderer = app.renderer;
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
    st_ts_chain.load1 = load1;
})(st_ts_chain || (st_ts_chain = {}));
export var tg_tg_chain;
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
        let camera = new FOUR.PerspectiveCamera();
        camera.position.w = 9;
        camera.position.y = 8;
        scene.add(camera);
        initScene(scene);
        const canvas = document.getElementById("gpu-canvas");
        const app = await tesserxel.four.App.create({ canvas, camera, scene, controllerConfig: { enablePointerLock: true } });
        const renderer = app.renderer;
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
        run();
    }
    tg_tg_chain.load = load;
})(tg_tg_chain || (tg_tg_chain = {}));
var dzhanibekov;
(function (dzhanibekov) {
    class GUI {
        canvasHeight = 200;
        /// horizontal factor for sun angle curve
        timePerPixel = 0.05;
        canvas;
        context;
        time = 0;
        data1 = [];
        data2 = [];
        data3 = [];
        data4 = [];
        localMode = true;
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
        update(g) {
            this.time++;
            const dp = new math.Bivec();
            g.getAngularMomentum(dp, new math.Vec4);
            if ((this.time & 3) == 1) {
                this.data1.unshift(dp.clone());
                this.data2.unshift(g.angularVelocity.clone());
                this.data3.unshift(dp.rotate(g.rotation.conj()));
                this.data4.unshift(g.angularVelocity.rotate(g.rotation.conj()));
            }
            if (this.data1.length > this.maxPoints)
                this.data1.pop();
            if (this.data2.length > this.maxPoints)
                this.data2.pop();
            if (this.data3.length > this.maxPoints)
                this.data3.pop();
            if (this.data4.length > this.maxPoints)
                this.data4.pop();
            const c = this.context;
            const width = this.canvas.width;
            const hdiv2 = this.canvas.height / 2;
            c.clearRect(0, 0, width, this.canvas.height);
            c.font = "30px Arial";
            c.lineWidth = 1;
            function draw(label, gain, data, idx, style) {
                c.strokeStyle = style;
                c.beginPath();
                c.moveTo(0, hdiv2);
                const isJ = label[0] == "J";
                for (let x = 0; x < width; x += 2) {
                    const bivec = data[Math.round((width - x) / 2)];
                    if (!bivec) {
                        c.moveTo(x, hdiv2);
                    }
                    else {
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
            let dataJ = this.data1;
            let dataW = this.data2;
            if (this.localMode) {
                dataJ = this.data3;
                dataW = this.data4;
            }
            draw("Jxy", 0.4, dataJ, "xy", "rgb(255,120,50)");
            draw("Jxz", 0.4, dataJ, "xz", "rgb(220,220,0)");
            draw("Jxw", 0.4, dataJ, "xw", "rgb(255,20,255)");
            draw("Jyz", 0.4, dataJ, "yz", "rgb(120,255,20)");
            draw("Jyw", 0.4, dataJ, "yw", "rgb(20,255,20)");
            draw("Jzw", 0.4, dataJ, "zw", "rgb(0,220,220)");
            c.lineWidth = 3;
            draw("Wxy", 0.4, dataW, "xy", "rgb(190,90,0)");
            draw("Wxz", 0.4, dataW, "xz", "rgb(140,130,0)");
            draw("Wxw", 0.4, dataW, "xw", "rgb(140,0,140)");
            draw("Wyz", 0.4, dataW, "yz", "rgb(90,190,0)");
            draw("Wyw", 0.4, dataW, "yw", "rgb(0,150,0)");
            draw("Wzw", 0.4, dataW, "zw", "rgb(0,130,140)");
            c.fillText(lang === "zh" ? "按L键切换惯性/局部坐标系" : "Press Key L to toggle World/Local Coordinates", width * 0.4, hdiv2 * 1.9);
        }
    }
    async function load(size, initW) {
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
            geometry: new phy.rigid.Tesseractoid(size),
            // geometry: new phy.rigid.Tesseractoid(new math.Vec4(0.2,0.4,0.8,1.6)),
            mass: 2, material: new phy.Material(1, 1)
        });
        g.angularVelocity.copy(initW);
        const fixMeshMG = new FOUR.Mesh(new FOUR.TesseractGeometry(new math.Vec4(compassLongueur, compassThickness, compassThickness, compassThickness)), new FOUR.LambertMaterial([1, 0, 0, 0.3]));
        const fixMeshWE = new FOUR.Mesh(new FOUR.TesseractGeometry(new math.Vec4(compassThickness, compassThickness, compassLongueur, compassThickness)), new FOUR.LambertMaterial([0, 0.8, 0, 0.3]));
        const fixMeshNS = new FOUR.Mesh(new FOUR.TesseractGeometry(new math.Vec4(compassThickness, compassThickness, compassThickness, compassLongueur)), new FOUR.LambertMaterial([0, 0, 1, 0.3]));
        const fixMeshUD = new FOUR.Mesh(new FOUR.TesseractGeometry(new math.Vec4(compassThickness, compassLongueur, compassThickness, compassThickness)), new FOUR.LambertMaterial([0.6, 0.6, 0, 0.3]));
        addRigidToScene(world, scene, renderMat, g);
        rigidsInSceneLists[0][0].add(compassMeshNS, compassMeshWE, compassMeshMG, compassMeshUD);
        scene.add(fixMeshNS, fixMeshWE, fixMeshMG, fixMeshUD);
        let camera = new FOUR.PerspectiveCamera();
        camera.position.w = 4;
        scene.add(camera);
        scene.add(new FOUR.AmbientLight(0.3));
        scene.add(new FOUR.DirectionalLight([2.2, 2.0, 1.9], new math.Vec4(0.2, 0.6, 0.1, 0.3).norms()));
        scene.setBackgroundColor({ r: 0.8, g: 0.9, b: 1.0, a: 0.01 });
        const canvas = document.getElementById("gpu-canvas");
        const app = await tesserxel.four.App.create({ canvas, camera, scene, controllerConfig: { enablePointerLock: true } });
        const renderer = app.renderer;
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
        window.addEventListener("resize", () => gui.setSize());
        gui.setSize();
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
        window.addEventListener("keydown", ev => {
            if (ev.code === "KeyL") {
                gui.localMode = !gui.localMode;
            }
        });
        run();
    }
    dzhanibekov.load = load;
})(dzhanibekov || (dzhanibekov = {}));
export var dzhanibekov2;
(function (dzhanibekov2) {
    async function load() {
        await dzhanibekov.load(new math.Vec4(0.6, 0.8, 1.1, 1.3), new math.Bivec(1e-4, 1e-4, 1e-4, 1e-4, 1e-4, 1e-4).adds(math.Bivec.xw.mulf(1.5)));
    }
    dzhanibekov2.load = load;
})(dzhanibekov2 || (dzhanibekov2 = {}));
export var dzhanibekov1;
(function (dzhanibekov1) {
    async function load() {
        await dzhanibekov.load(new math.Vec4(0.6, 0.8, 1.1, 1.3), new math.Bivec(1e-4, 1e-4, 1e-4, 1e-4, 1e-4, 1e-4).adds(math.Bivec.xz.mulf(1.5)));
    }
    dzhanibekov1.load = load;
})(dzhanibekov1 || (dzhanibekov1 = {}));
export var dzhanibekov3;
(function (dzhanibekov3) {
    async function load() {
        await dzhanibekov.load(new math.Vec4(0.6, 0.8, 1.1, 1.3), new math.Bivec(1e-4, 1e-4, 1e-4, 1e-4, 1e-4, 1e-4).adds(math.Bivec.yz.mulf(1.5)));
    }
    dzhanibekov3.load = load;
})(dzhanibekov3 || (dzhanibekov3 = {}));
export var dzhanibekov4;
(function (dzhanibekov4) {
    async function load() {
        await dzhanibekov.load(new math.Vec4(0.6, 0.8, 1.1, 1.3), new math.Bivec(1e-4, 1e-4, 1e-4, 1e-4, 1e-4, 1e-4).adds(math.Bivec.xz.mulf(1.5)).adds(math.Bivec.yw.mulf(1.5)));
    }
    dzhanibekov4.load = load;
})(dzhanibekov4 || (dzhanibekov4 = {}));
export var dzhanibekov5;
(function (dzhanibekov5) {
    async function load() {
        await dzhanibekov.load(new math.Vec4(0.6, 0.8, 1.1, 1.3), new math.Bivec(1e-4, 1e-4, 1e-4, 1e-4, 1e-4, 1e-4).adds(math.Bivec.xz.mulf(1.6)).adds(math.Bivec.yw.mulf(1.5)));
    }
    dzhanibekov5.load = load;
})(dzhanibekov5 || (dzhanibekov5 = {}));
async function loadGyroScene(cwmesh, material) {
    const engine = new phy.Engine({ substep: 30, forceAccumulator: phy.force_accumulator.RK4 });
    const world = new phy.World();
    const scene = new FOUR.Scene();
    let camera = new FOUR.PerspectiveCamera();
    camera.position.w = 4;
    camera.position.y = 0.6;
    scene.add(camera);
    scene.add(new FOUR.AmbientLight(0.3));
    scene.add(new FOUR.DirectionalLight([2.2, 2.0, 1.9], new math.Vec4(0.2, 0.6, 0.1, 0.3).norms()));
    const roomFourMat = new tesserxel.four.LambertMaterial([0.6, 0.8, 0.2, 0.2]);
    addRoom(5, world, new phy.Material(0.6, 0.4), scene, roomFourMat);
    scene.setBackgroundColor({ r: 0.8, g: 0.9, b: 1.0, a: 0.01 });
    let gyroLogic = new phy.Rigid({
        geometry: new phy.rigid.Convex(cwmesh.data[0]),
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
    const canvas = document.getElementById("gpu-canvas");
    const app = await tesserxel.four.App.create({ canvas, camera, scene, controllerConfig: { enablePointerLock: true } });
    const renderer = app.renderer;
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
    function run() {
        // syncronise physics world and render scene
        updateRidigsInScene();
        // update controller states
        controllerRegistry.update();
        // rendering
        renderer.render(scene, camera);
        // simulating physics
        if (material.compiled)
            engine.update(world, 1 / 50);
        window.requestAnimationFrame(run);
    }
    return { gyroLogic, run };
}
export var gyro_conic_prism;
(function (gyro_conic_prism) {
    async function load() {
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
    gyro_conic_prism.load = load;
})(gyro_conic_prism || (gyro_conic_prism = {}));
export var gyro_cylindral_cone;
(function (gyro_cylindral_cone) {
    async function load() {
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
    gyro_cylindral_cone.load = load;
})(gyro_cylindral_cone || (gyro_cylindral_cone = {}));
export var gyro_dicone;
(function (gyro_dicone) {
    async function load() {
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
    gyro_dicone.load = load;
})(gyro_dicone || (gyro_dicone = {}));
export var gyro_duocone;
(function (gyro_duocone) {
    async function load() {
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
    gyro_duocone.load = load;
})(gyro_duocone || (gyro_duocone = {}));
export var gyro_sphericone;
(function (gyro_sphericone) {
    async function load() {
        const mesh = tesserxel.mesh.cw.ball2(16, 16).apply(v => v.set(v.x, 0, v.y, v.z));
        mesh.makePyramid(math.Vec4.yNeg);
        mesh.apply(v => (v.y += 0.2, v));
        const mat = new tesserxel.four.LambertMaterial(new tesserxel.four.CheckerTexture([0, 0, 0, 1], [1, 1, 1, 1]));
        const { gyroLogic, run } = await loadGyroScene(mesh, mat);
        gyroLogic.angularVelocity.xw = 10;
        gyroLogic.position.y = 1.2;
        run();
    }
    gyro_sphericone.load = load;
})(gyro_sphericone || (gyro_sphericone = {}));
export var thermo_stats;
(function (thermo_stats) {
    class GUI {
        canvasHeight = 200;
        /// horizontal factor for sun angle curve
        timePerPixel = 0.05;
        canvas;
        context;
        time = 0;
        data = [];
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
        update(balls) {
            this.time++;
            function getDegree(biv) {
                let degree = Math.atan2(biv.dual().adds(biv).norm(), biv.dual().subs(biv).norm());
                degree = degree * 4 / Math.PI - 1;
                return degree;
            }
            let sum = new tesserxel.math.Bivec;
            for (const g of balls) {
                sum.adds(g.angularVelocity);
            }
            const J = new math.Bivec();
            const S = new math.Bivec();
            const L = new math.Bivec();
            const dp = new math.Bivec();
            let Et = 0;
            let Er = 0;
            for (const b of balls) {
                J.adds(b.getAngularMomentum(dp, new math.Vec4, "J"));
                S.adds(b.getAngularMomentum(dp, new math.Vec4, "S"));
                L.adds(b.getAngularMomentum(dp, new math.Vec4, "L"));
                Et += b.getLinearKineticEnergy();
                Er += b.getAngularKineticEnergy();
            }
            if ((this.time & 3) == 1) {
                this.data.unshift([
                    J.norm(), getDegree(J),
                    L.norm(), getDegree(L),
                    S.norm(), getDegree(S),
                    Et / Er
                    // Et, Er, Et + Er
                ]);
            }
            if (this.data.length > this.maxPoints)
                this.data.pop();
            const c = this.context;
            const width = this.canvas.width;
            const hdiv2 = this.canvas.height / 2;
            c.clearRect(0, 0, width, this.canvas.height);
            c.font = "30px Arial";
            c.lineWidth = 1;
            c.fillStyle = "rgba(0,0,0,0.2)";
            for (const b of balls) {
                c.beginPath();
                const d = getDegree(b.angularVelocity);
                c.arc((d + 1) / 2 * width, hdiv2, 30, 0, Math.PI * 2);
                c.fill();
            }
            c.fillStyle = "rgb(255,255,255)";
            for (const b of balls) {
                const d = getDegree(b.angularVelocity);
                c.fillText(d.toFixed(2), (d + 1) / 2 * width - 30, hdiv2);
            }
            const draw = (label, gain, idx, style, isLeft) => {
                c.strokeStyle = style;
                c.beginPath();
                c.moveTo(0, hdiv2);
                for (let x = 0; x < width; x += 2) {
                    const dataptr = this.data[Math.round((width - x) / 2)];
                    if (!dataptr) {
                        c.moveTo(x, hdiv2);
                    }
                    else {
                        c.lineTo(x, hdiv2 * (-dataptr[idx] * gain + 1));
                    }
                }
                c.stroke();
                c.fillStyle = style;
                c.fillText(label, isLeft ? 10 : width - this.context.measureText(label).width - 10, hdiv2 * (-this.data[0][idx] * gain + 1));
            };
            c.strokeStyle = "rgb(0,0,0)";
            c.beginPath();
            c.moveTo(0, hdiv2);
            c.lineTo(width, hdiv2);
            c.stroke();
            c.lineWidth = 3;
            const scaleDual = 0.5;
            const scaleAbs = 0.005;
            const scaleE = 0.01;
            const more = 1;
            draw(lang == "zh" ? "|J|(总角动量大小)" : "|J|(Total Angular Momenta)", scaleAbs, 0, "rgb(240,0,240)", true);
            this.context.setLineDash([4, 8]);
            this.context.lineDashOffset = 4;
            draw(lang == "zh" ? "duality(J)(总角动量对偶性)" : "duality(J)", scaleDual * more, 1, "rgba(240,0,240,0.6)", false);
            this.context.setLineDash([]);
            draw(lang == "zh" ? "|L|(轨道角动量大小)" : "|L|(Orbital Angular Momenta)", scaleAbs, 2, "rgb(0,0,255)", false);
            this.context.setLineDash([4, 8]);
            this.context.lineDashOffset = 0;
            draw(lang == "zh" ? "duality(L)(轨道角动量对偶性)" : "duality(L)", scaleDual * more, 3, "rgba(0,0,255,0.6)", true);
            this.context.setLineDash([]);
            draw(lang == "zh" ? "|S|(自转角动量大小)" : "|S|(Spin Angular Momenta)", scaleAbs * more, 4, "rgb(255,0,0)", false);
            this.context.setLineDash([4, 8]);
            draw(lang == "zh" ? "duality(S)(自转角动量对偶性)" : "duality(S)", scaleDual, 5, "rgba(128,0,0,0.6)", true);
            this.context.setLineDash([1, 2]);
            draw(lang == "zh" ? "平动动能/转动动能" : "Translational Kinetic Energy / Rotational Kinetic Energy", scaleE, 6, "rgb(0,255,0)", false);
            this.context.setLineDash([]);
        }
    }
    async function load() {
        const engine = new phy.Engine({ substep: 50 });
        engine.solver.maxPositionIterations = 0;
        engine.solver.PositionRelaxationFactor = 0.0001;
        const world = new phy.World();
        const scene = new FOUR.Scene();
        world.gravity.set();
        // define physical materials: frictions and restitutions
        const phyMat = new phy.Material(0.2, 1.0);
        const borderMat = new phy.Material(0, 1);
        // define render materials
        const balls = [];
        const renderMat = new FOUR.LambertMaterial(new FOUR.CheckerTexture([1, 1, 1], [0.2, 0.2, 0.2]));
        const fem = new phy.Gravity();
        // world.add(fem);
        for (let i = 0; i < 40; i++) {
            // const r1 = new phy.Rigid({
            //     geometry: new phy.rigid.Glome(0.4),
            //     mass: 1, material: phyMat
            // });
            // r1.position.x = -0.3;
            // const r2 = new phy.Rigid({
            //     geometry: new phy.rigid.Glome(0.4),
            //     mass: 1, material: phyMat
            // });
            // r2.position.x = 0.3;
            // const g = new phy.Rigid([
            //     r1, r2
            // ]);
            const g = new phy.Rigid({
                geometry: new phy.rigid.Glome(0.5),
                mass: 1, material: phyMat
            });
            g.position.randset().mulfs(2);
            // g.position = [new tesserxel.math.Vec4(1),new tesserxel.math.Vec4(-1)][i];
            // g.velocity = [new tesserxel.math.Vec4(-0.1),new tesserxel.math.Vec4(0.1)][i];
            // g.angularVelocity.xy = [0.1,0.1][i];
            addRigidToScene(world, scene, renderMat, g);
            // g.velocity.copy(g.position).mulfs(-0.3);
            // g.velocity.copy(g.position).mulfs(5);
            g.velocity.randset().mulfs(10);
            // g.angularVelocity.randset().mulfs(22);
            // g.angularVelocity.zw = 10;
            balls.push(g);
            // fem.add(g);
        }
        const cavity = new phy.Rigid({
            geometry: new phy.rigid.GlomicCavity(3),
            mass: 0, material: borderMat
        });
        world.add(cavity);
        // addRoom(2, world, borderMat, scene, renderMat, true);
        // set up lights, camera and renderer
        let camera = new FOUR.PerspectiveCamera();
        camera.position.w = -5;
        scene.add(camera);
        scene.add(new FOUR.AmbientLight(0.3));
        scene.add(new FOUR.DirectionalLight([2.2, 2.0, 1.9], new math.Vec4(0.2, 0.6, 0.1, 0.3).norms()));
        scene.setBackgroundColor({ r: 0.8, g: 0.9, b: 1.0, a: 0.01 });
        const canvas = document.getElementById("gpu-canvas");
        const app = await tesserxel.four.App.create({ canvas, camera, scene, controllerConfig: { enablePointerLock: true } });
        const renderer = app.renderer;
        renderer.core.setDisplayConfig({
            screenBackgroundColor: [1, 1, 1, 1],
            sectionStereoEyeOffset: 0.5,
            opacity: 20
        });
        // controllers
        const camCtrl = new tesserxel.util.ctrl.TrackBallController(camera, true);
        const retinaCtrl = new tesserxel.util.ctrl.RetinaController(renderer.core);
        retinaCtrl.toggleSectionConfig("zsection");
        const gui = new GUI;
        gui.setSize();
        app.onresize = () => gui.setSize();
        const controllerRegistry = new tesserxel.util.ctrl.ControllerRegistry(canvas, [
            retinaCtrl,
            camCtrl,
        ], { enablePointerLock: true });
        let time = 0;
        let factor = 0.1;
        let Ebuffer = [100, 100, 100, 100, 100, 100, 100, 100];
        function run() {
            let E = 0;
            for (const b of balls) {
                E += b.getLinearKineticEnergy();
            }
            Ebuffer.push(E);
            Ebuffer.shift();
            factor = 5 / Math.sqrt(Ebuffer.reduce((a, b) => a + b));
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
            engine.update(world, factor);
            window.requestAnimationFrame(run);
            gui.update(balls);
        }
        run();
    }
    thermo_stats.load = load;
})(thermo_stats || (thermo_stats = {}));
export var mix_chain;
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
        let camera = new FOUR.PerspectiveCamera();
        camera.position.w = 9;
        camera.position.y = 8;
        scene.add(camera);
        initScene(scene);
        const canvas = document.getElementById("gpu-canvas");
        const app = await tesserxel.four.App.create({ canvas, camera, scene, controllerConfig: { enablePointerLock: true } });
        const renderer = app.renderer;
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
        run();
    }
    mix_chain.load = load;
})(mix_chain || (mix_chain = {}));
export var dt_ts_chain;
(function (dt_ts_chain) {
    async function load() {
        const engine = new phy.Engine({ substep: 30 });
        engine.solver.maxVelocityIterations = 64;
        engine.solver.maxPositionIterations = 64;
        engine.solver.PositionRelaxationFactor = 0.5;
        const world = new phy.World();
        // world.gravity.set(0,-1);
        const scene = new FOUR.Scene();
        // define physical materials: frictions and restitutions
        const phyMatChain = new phy.Material(0.4, 0.4);
        const phyMatGround = new phy.Material(1.3, 0.4);
        // define render materials
        const renderMatDT = new FOUR.LambertMaterial([0.4, 0.4, 0.4, 0.1]);
        const renderMatST = new FOUR.LambertMaterial([1, 1, 0.1, 3]);
        const renderMatTS = new FOUR.LambertMaterial([0.2, 0.2, 1, 0.1]);
        // const renderMatTS2 = new FOUR.LambertMaterial([1, 0.2, 0.2, 1]);
        const renderMatGround = new FOUR.LambertMaterial([0.2, 1, 0.2, 0.02]);
        // add ground
        addRigidToScene(world, scene, renderMatGround, new phy.Rigid({
            geometry: new phy.rigid.Plane(new math.Vec4(0, 1)),
            mass: 0, material: phyMatGround
        }));
        let dtArr = [];
        let tsArr = [];
        const gap = 1.4;
        for (let i = 0; i < 6; i++) {
            let dt = new phy.Rigid({
                geometry: new phy.rigid.Ditorus(1.8, 1.2, 0.2),
                mass: 1, material: phyMatChain
            });
            addRigidToScene(world, scene, renderMatDT, dt);
            dt.position.set(0, 14 - i * gap, 0, (i & 1) ? 0.6 : -0.6);
            dt.rotatesb(math.Bivec.yz.mulf(math._90));
            dtArr.push(dt);
            let ts = new phy.Rigid({
                geometry: new phy.rigid.Torisphere(1.8, 0.2),
                mass: 1, material: phyMatChain
            });
            addRigidToScene(world, scene, renderMatTS, ts);
            ts.position.set(0, 14 - (i + 0.5) * gap, 0, 0);
            ts.rotatesb(math.Bivec.yw.mulf(math._90)).rotatesb(math.Bivec.zw.mulf(math._90)).rotatesb(math.Bivec.yz.mulf(math._90));
            tsArr.push(ts);
        }
        // set up lights, camera and renderer
        let camera = new FOUR.PerspectiveCamera();
        camera.position.w = 9;
        camera.position.y = 8;
        camera.position.z = 0.1;
        scene.add(camera);
        initScene(scene);
        const canvas = document.getElementById("gpu-canvas");
        const app = await tesserxel.four.App.create({ canvas, camera, scene, controllerConfig: { enablePointerLock: true } });
        const renderer = app.renderer;
        renderer.core.setDisplayConfig({
            screenBackgroundColor: [1, 1, 1, 1],
            sectionStereoEyeOffset: 0.5,
            opacity: 20
        });
        // controllers
        const camCtrl = new tesserxel.util.ctrl.KeepUpController(camera);
        camCtrl.keyMoveSpeed = 0.01;
        const retinaCtrl = new tesserxel.util.ctrl.RetinaController(renderer.core);
        const controllerRegistry = new tesserxel.util.ctrl.ControllerRegistry(canvas, [
            retinaCtrl,
            camCtrl,
        ], { enablePointerLock: true });
        function run() {
            // console.log(dtArr[0].position);
            // syncronise physics world and render scene
            updateRidigsInScene();
            // update controller states
            controllerRegistry.update();
            // rendering
            renderer.render(scene, camera);
            // simulating physics
            // engine.update(world, 1 / 60);
            window.requestAnimationFrame(run);
        }
        run();
    }
    dt_ts_chain.load = load;
})(dt_ts_chain || (dt_ts_chain = {}));
export var ditorus;
(function (ditorus) {
    async function load() {
        const engine = new phy.Engine({ substep: 100 });
        const world = new phy.World();
        const scene = new FOUR.Scene();
        // define physical materials: frictions and restitutions
        const phyMatChain = new phy.Material(0.4, 0.4);
        const phyMatGround = new phy.Material(1.3, 0.4);
        // define render materials
        const renderMatDT = new FOUR.LambertMaterial([0.4, 0.4, 0.4, 1]);
        const renderMatST = new FOUR.LambertMaterial([1, 1, 0.1, 1]);
        const renderMatTS1 = new FOUR.LambertMaterial([0.2, 0.2, 1, 1]);
        const renderMatTS2 = new FOUR.LambertMaterial([1, 0.2, 0.2, 1]);
        const renderMatGround = new FOUR.LambertMaterial([0.2, 1, 0.2, 0.03]);
        // add ground
        addRigidToScene(world, scene, renderMatGround, new phy.Rigid({
            geometry: new phy.rigid.Plane(new math.Vec4(0, 1)),
            mass: 0, material: phyMatGround
        }));
        const dt = new phy.Rigid({
            geometry: new phy.rigid.Ditorus(1.8, 0.9, 0.4),
            mass: 1, material: phyMatChain
        });
        const st = new phy.Rigid({
            geometry: new phy.rigid.Spheritorus(1.6, 0.15),
            mass: 1, material: phyMatChain
        });
        const ts1 = new phy.Rigid({
            geometry: new phy.rigid.Torisphere(1.65, 0.15),
            mass: 1, material: phyMatChain
        });
        const ts2 = new phy.Rigid({
            geometry: new phy.rigid.Torisphere(1.65, 0.15),
            mass: 1, material: phyMatChain
        });
        dt.position.y = 8;
        ts1.position.set(0, 8, 0.17, 0);
        ts1.rotatesb(math.Bivec.yw.mulf(math._90)).rotatesb(math.Bivec.zw.mulf(math._90));
        ts2.position.set(0, 8, -0.17, 0);
        ts2.rotatesb(math.Bivec.yw.mulf(math._90)).rotatesb(math.Bivec.zw.mulf(math._90));
        st.position.set(3, 9.4, 0, 0);
        // st2.rotatesb(math.Bivec.zw.mulf(math._90));
        world.add(new phy.PointConstrain(st, null, math.Vec4.x, st.position.add(math.Vec4.x.rotate(st.rotation))));
        addRigidToScene(world, scene, renderMatDT, dt);
        addRigidToScene(world, scene, renderMatST, st);
        addRigidToScene(world, scene, renderMatTS1, ts1);
        addRigidToScene(world, scene, renderMatTS2, ts2);
        // set up lights, camera and renderer
        let camera = new FOUR.PerspectiveCamera();
        camera.position.w = 9;
        camera.position.y = 8;
        scene.add(camera);
        initScene(scene);
        const canvas = document.getElementById("gpu-canvas");
        const app = await tesserxel.four.App.create({ canvas, camera, scene, controllerConfig: { enablePointerLock: true } });
        const renderer = app.renderer;
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
        emitCtrl.glomeRadius = 1;
        emitCtrl.maximumBulletDistance = 70;
        emitCtrl.initialSpeed = 4;
        const controllerRegistry = new tesserxel.util.ctrl.ControllerRegistry(canvas, [
            retinaCtrl,
            camCtrl,
            emitCtrl
        ], { enablePointerLock: true });
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
        run();
    }
    ditorus.load = load;
})(ditorus || (ditorus = {}));
async function loadMaxwell(cb) {
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
    const canvas = document.getElementById("gpu-canvas");
    const app = await tesserxel.four.App.create({ canvas, scene, controllerConfig: { enablePointerLock: true } });
    await cb(world, maxwell, scene, app.renderer);
    // set up lights, camera and renderer
    let camera = app.camera;
    camera.position.w = 9;
    camera.position.y = 8;
    scene.add(camera);
    initScene(scene);
    scene.skyBox = null; // delete skyBox in initScene() to save resources, because sky can't be seen
    await app.renderer.compileMaterials(scene);
    app.renderer.core.setDisplayConfig({
        screenBackgroundColor: [1, 1, 1, 1],
        sectionStereoEyeOffset: 0.5,
        opacity: 20
    });
    // controllers
    const camCtrl = new tesserxel.util.ctrl.KeepUpController(camera);
    camCtrl.keyMoveSpeed = 0.01;
    const gravityCtrl = {
        update: function (state) {
            if (state.isKeyHold(".KeyG")) {
                gravityCtrl.gravity = !gravityCtrl.gravity;
                world.gravity.y = gravityCtrl.gravity ? -9.8 : 0;
            }
        },
        enabled: true,
        gravity: true
    };
    const emitCtrl = new EmitGlomeController(world, scene, camera, app.renderer);
    emitCtrl.glomeRadius = 1;
    emitCtrl.maximumBulletDistance = 70;
    emitCtrl.initialSpeed = 10;
    app.controllerRegistry.add(camCtrl);
    app.controllerRegistry.add(emitCtrl);
    app.controllerRegistry.add(gravityCtrl);
    app.run(() => {
        updateRidigsInScene();
        engine.update(world, Math.min(1 / 15, app.controllerRegistry.states.mspf / 1000));
    });
}
export var e_charge;
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
})(e_charge || (e_charge = {}));
export var e_dipole;
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
})(e_dipole || (e_dipole = {}));
export var m_dipole;
(function (m_dipole) {
    async function load() {
        await loadMaxwell(async (world, maxwell, scene, renderer) => {
            const phyMatCharge = new phy.Material(1, 0.5);
            const renderMatMDipole = new FOUR.LambertMaterial(new FOUR.CheckerTexture([1, 0, 0, 1], new FOUR.CheckerTexture([0.6, 0.6, 0.6, 0.2], [0, 0, 1, 1], new FOUR.Vec4TransformNode(new FOUR.UVWVec4Input(), new math.Obj4(new math.Vec4(0, 0, 0.41), null, new math.Vec4(0.1, 0.1, 0.1, 0.1)))), new FOUR.Vec4TransformNode(new FOUR.UVWVec4Input(), new math.Obj4(new math.Vec4(0, 0, 0.49), null, new math.Vec4(0.1, 0.1, 0.1, 0.1)))));
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
    m_dipole.load = load;
})(m_dipole || (m_dipole = {}));
const renderMatMDipoleDual = new FOUR.LambertMaterial(new FOUR.WgslTexture(`fn hopfA(uvw:vec4f)->vec4f{
                return mix(vec4f(1.0, 0.5, 0.5, 0.2),vec4f(0.02,0.02,1.0,1.0),step(1.5,fract((uvw.x+uvw.y)*4.0)*2.0)*step(1.5,fract((uvw.z)*4.0)*2.0)) ;
            }    
            `, `hopfA`));
const renderMatMDipoleAntiDual = new FOUR.LambertMaterial(new FOUR.WgslTexture(`fn hopfB(uvw:vec4f)->vec4f{
                return mix(vec4f(0.5, 0.5, 1.0, 0.2),vec4f(1.0,0.02,0.02,1.0),step(1.5,fract((uvw.x-uvw.y)*4.0)*2.0)*step(1.5,fract((uvw.z)*4.0)*2.0)) ;
            }    
            `, `hopfB`));
export var m_dipole_dual1;
(function (m_dipole_dual1) {
    async function load() {
        await loadMaxwell(async (world, maxwell, scene, renderer) => {
            const phyMatCharge = new phy.Material(1, 0.5);
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
    m_dipole_dual1.load = load;
})(m_dipole_dual1 || (m_dipole_dual1 = {}));
export var m_dipole_dual2;
(function (m_dipole_dual2) {
    async function load() {
        await loadMaxwell(async (world, maxwell, scene, renderer) => {
            const phyMatCharge = new phy.Material(1, 0.5);
            const chargeNum = 8;
            const radius = 5;
            // await renderMatMDipoleDual.compile(renderer);
            // await renderMatMDipoleAntiDual.compile(renderer);
            let damp = new phy.Damping(0.01, 0.01);
            world.add(damp);
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
                let dipoleB = new phy.Rigid({ geometry: new phy.rigid.Glome(1), mass: 1, material: phyMatCharge });
                gndPos = math.Vec3.rand().mulfs(radius).x0yz();
                dipoleB.position.copy(gndPos);
                dipoleB.position.x *= 0.5;
                dipoleB.position.x += 4;
                dipoleB.position.y = 3 + Math.random();
                maxwell.addMagneticDipole({ rigid: dipoleB, moment: new math.Bivec(10, 0, 0, 0, 0, -10), position: math.Vec4.origin.clone() });
                damp.add(dipoleB);
                addRigidToScene(world, scene, renderMatMDipoleAntiDual, dipoleB);
            }
        });
    }
    m_dipole_dual2.load = load;
})(m_dipole_dual2 || (m_dipole_dual2 = {}));
export var dice_yugu233;
(function (dice_yugu233) {
    async function load() {
        const engine = new phy.Engine({ substep: 60 });
        const world = new phy.World();
        const scene = new FOUR.Scene();
        const mat = new tesserxel.four.LambertMaterial(new tesserxel.four.CheckerTexture([0, 0, 0, 1], [1, 1, 1, 1]));
        const renderMatGround = new FOUR.LambertMaterial([0.2, 1, 0.2, 0.04]);
        // add ground
        addRigidToScene(world, scene, renderMatGround, new phy.Rigid({
            geometry: new phy.rigid.Plane(new math.Vec4(0, 1)),
            mass: 0, material: new phy.Material(1, 0.8)
        }));
        // draw dots on the dice using wgsl shader
        const diceM = new tesserxel.four.LambertMaterial(new tesserxel.four.WgslTexture(`
            const red = vec4f(1.0,0.0,0.0,1.0);
            const blue = vec4f(0.0,0.0,0.8,1.0);
            const arr = array<vec4f,8>(red,red,blue,blue,blue,red,blue,blue);
            fn mainfr(uvw:vec4f)->vec4f{
                var pattern:f32;
                if(uvw.w<0.5){pattern=step(length(uvw.xyz),0.5);}
                else if(uvw.w<1.5){pattern=step(distance(uvw.xyz,vec3<f32>(0.35,0.35,0.35)),0.28)+step(distance(uvw.xyz,vec3<f32>(-0.35,0.35,-0.35)),0.28)+step(distance(uvw.xyz,vec3<f32>(0.35,-0.35,-0.35)),0.28)+step(distance(uvw.xyz,vec3<f32>(-0.35,-0.35,0.35)),0.28)+step(distance(uvw.xyz,vec3<f32>(0.35,0.35,-0.35)),0.28)+step(distance(uvw.xyz,vec3<f32>(-0.35,0.35,0.35)),0.28)+step(distance(uvw.xyz,vec3<f32>(0.35,-0.35,0.35)),0.28)+step(distance(uvw.xyz,vec3<f32>(-0.35,-0.35,-0.35)),0.28);}
                else if(uvw.w<2.5){pattern=step(distance(uvw.xyz,vec3<f32>(0.38,0.38,0.38)),0.28)+step(distance(uvw.xyz,vec3<f32>(-0.38,-0.38,-0.38)),0.28)+step(length(uvw.xyz),0.28);}
                 else if(uvw.w<3.5){pattern=step(distance(uvw.xyz,vec3<f32>(0.35,0.35,0.35)),0.28)+step(distance(uvw.xyz,vec3<f32>(-0.35,0.35,-0.35)),0.28)+step(distance(uvw.xyz,vec3<f32>(-0.35,-0.35,-0.35)),0.28)+step(distance(uvw.xyz,vec3<f32>(0.35,-0.35,0.35)),0.28)+step(distance(uvw.xyz,vec3<f32>(0.46,0.0,-0.46)),0.28)+step(distance(uvw.xyz,vec3<f32>(-0.46,0.0,0.46)),0.28);}
                 else if(uvw.w<4.5){pattern=step(distance(uvw.xyz,vec3<f32>(0.35,0.35,0.35)),0.28)+step(distance(uvw.xyz,vec3<f32>(-0.35,0.35,-0.35)),0.28)+step(distance(uvw.xyz,vec3<f32>(0.35,-0.35,-0.35)),0.28)+step(distance(uvw.xyz,vec3<f32>(-0.35,-0.35,0.35)),0.28)+step(length(uvw.xyz),0.28);}
                 else if(uvw.w<5.5){pattern=step(distance(uvw.xyz,vec3<f32>(0.35,0.35,0.35)),0.28)+step(distance(uvw.xyz,vec3<f32>(-0.35,0.35,-0.35)),0.28)+step(distance(uvw.xyz,vec3<f32>(0.35,-0.35,-0.35)),0.28)+step(distance(uvw.xyz,vec3<f32>(-0.35,-0.35,0.35)),0.28);}
                 else if(uvw.w<6.5){pattern=step(distance(uvw.xyz,vec3<f32>(0.38,0.38,0.38)),0.28)+step(distance(uvw.xyz,vec3<f32>(-0.38,0.38,-0.38)),0.28)+step(distance(uvw.xyz,vec3<f32>(-0.38,-0.38,-0.38)),0.28)+step(distance(uvw.xyz,vec3<f32>(0.38,-0.38,0.38)),0.28)+step(distance(uvw.xyz,vec3<f32>(0.46,0.0,-0.46)),0.28)+step(distance(uvw.xyz,vec3<f32>(-0.46,0.0,0.46)),0.28)+step(length(uvw.xyz),0.28);}
                 else if(uvw.w<7.5){pattern=step(distance(uvw.xyz,vec3<f32>(0.35,0.35,0.35)),0.3)+step(distance(uvw.xyz,vec3<f32>(-0.35,-0.35,-0.35)),0.3);}

                return mix(vec4f(1.0,1.0,1.0,0.1),arr[u32(uvw.w+0.5)],pattern);
                
            }
            `, 'mainfr'));
        for (let i = 0; i < 5; i++) {
            let dice = new phy.Rigid({
                geometry: new phy.rigid.Tesseractoid(1),
                material: new phy.Material(1, 0.4), mass: 1
            });
            addRigidToScene(world, scene, diceM, dice);
            dice.position.y = 4 + i * 2;
            dice.velocity.y = 0;
            dice.rotation.randset();
            dice.angularVelocity.randset().mulfs(3);
        }
        // set up lights, camera and renderer
        let camera = new FOUR.PerspectiveCamera();
        camera.position.w = 7;
        camera.position.y = 1;
        scene.add(camera);
        initScene(scene);
        const canvas = document.getElementById("gpu-canvas");
        const app = await tesserxel.four.App.create({ canvas, camera, scene, controllerConfig: { enablePointerLock: true } });
        app.renderer.core.setDisplayConfig({
            screenBackgroundColor: [1, 1, 1, 1],
            sectionStereoEyeOffset: 0.5,
            opacity: 30,
        });
        // controllers
        const camCtrl = new tesserxel.util.ctrl.KeepUpController(camera);
        app.controllerRegistry.add(camCtrl);
        camCtrl.keyMoveSpeed = 0.01;
        const emitCtrl = new EmitGlomeController(world, scene, camera, app.renderer);
        emitCtrl.initialSpeed = 10;
        app.controllerRegistry.add(emitCtrl);
        app.run(() => {
            // syncronise physics world and render scene
            updateRidigsInScene();
            engine.update(world, Math.min(1 / 15, app.controllerRegistry.states.mspf / 1000));
        });
    }
    dice_yugu233.load = load;
})(dice_yugu233 || (dice_yugu233 = {}));
class gravityApp {
    async load(initVelocity, G) {
        const engine = new phy.Engine({ substep: 100 });
        const world = new phy.World();
        const scene = new FOUR.Scene();
        let camera = new FOUR.PerspectiveCamera();
        camera.position.w = 9;
        scene.add(camera);
        scene.add(new FOUR.AmbientLight(0.5));
        scene.add(new FOUR.DirectionalLight([1, 1, 1], new math.Vec4(1, -3, 2, 1.414)));
        const count = 15;
        const totalV = new math.Vec4(0, 0, 0, 0);
        for (let i = 0; i < count; i++) {
            let sphere = new phy.Rigid({
                geometry: new phy.rigid.Glome(0.2),
                material: new phy.Material(1, 0.4), mass: 2
            });
            addRigidToScene(world, scene, new FOUR.LambertMaterial([0.2, 0.2, 1, 0.1]), sphere);
            sphere.position.randset().mulfs(5);
            sphere.velocity.randset().mulfs(initVelocity);
            totalV.adds(sphere.velocity);
            sphere.rotation.randset();
            sphere.angularVelocity.randset().mulfs(0.1);
            G.add(sphere);
        }
        totalV.divfs(count);
        for (const c of G.rigids) {
            c.velocity.subs(totalV);
        }
        // let sphere = new phy.Rigid({
        //     geometry: new phy.rigid.Glome(0.2),
        //     material: new phy.Material(1, 0), mass: 41
        // });
        // addRigidToScene(world, scene, new FOUR.LambertMaterial([0.2, 0.2, 1, 0.1]), sphere);
        // sphere.position.x = 2;
        // sphere.velocity.y = -initVelocity*2;
        // G.add(sphere);
        // let sphere2 = new phy.Rigid({
        //     geometry: new phy.rigid.Glome(0.2),
        //     material: new phy.Material(1, 0), mass: 41
        // });
        // addRigidToScene(world, scene, new FOUR.LambertMaterial([0.2, 0.2, 1, 0.1]), sphere2);
        // sphere2.position.x = -2;
        // sphere2.velocity.y = initVelocity*2;
        // G.add(sphere2);
        world.gravity.set();
        world.add(G);
        const canvas = document.getElementById("gpu-canvas");
        const app = await tesserxel.four.App.create({ canvas, camera, scene, controllerConfig: { enablePointerLock: true } });
        app.renderer.core.setDisplayConfig({
            screenBackgroundColor: [1, 1, 1, 1],
            sectionStereoEyeOffset: 0.5,
            opacity: 300,
            // retinaLayers: 64,
        });
        // controllers
        const camCtrl = new tesserxel.util.ctrl.TrackBallController(camera, true);
        app.controllerRegistry.add(camCtrl);
        app.run(() => {
            // syncronise physics world and render scene
            updateRidigsInScene();
            engine.update(world, Math.min(1 / 15, app.controllerRegistry.states.mspf / 1000) * 0.2);
        });
    }
}
export var gravity2;
(function (gravity2) {
    async function load() {
        const G = new phy.Gravity(-2);
        G.gain = 12;
        await new gravityApp().load(3.5, G);
    }
    gravity2.load = load;
})(gravity2 || (gravity2 = {}));
export var gravity3;
(function (gravity3) {
    async function load() {
        const G = new phy.Gravity(-3);
        G.gain = 20;
        await new gravityApp().load(2.5, G);
    }
    gravity3.load = load;
})(gravity3 || (gravity3 = {}));
export var gravity3s;
(function (gravity3s) {
    async function load() {
        const G = new phy.Gravity(-3, -10);
        G.gain = 20;
        await new gravityApp().load(2.1, G);
    }
    gravity3s.load = load;
})(gravity3s || (gravity3s = {}));
//# sourceMappingURL=rigids.js.map