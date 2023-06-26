import * as tesserxel from "../../build/tesserxel.js";
const FOUR = tesserxel.four;
const phy = tesserxel.physics;
const math = tesserxel.math;
let rigidsInSceneLists = [];
let geometryData = {};
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
    scene.setBackgroudColor({ r: 0.8, g: 0.9, b: 1.0, a: 0.01 });
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
    constructor(world, scene, camera) {
        this.world = world;
        this.scene = scene;
        this.camera = camera;
    }
    update(state) {
        if (state.queryDisabled({ disable: "AltLeft" }))
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
export var st_pile;
(function (st_pile) {
    async function load1() {
        const math = tesserxel.math;
        const canvas = document.getElementById("gpu-canvas");
        const renderer = await new FOUR.Renderer(canvas).init();
        let scene = new FOUR.Scene();
        renderer.setBackgroudColor([1, 1, 1, 1]);
        scene.setBackgroudColor({ r: 0.8, g: 0.9, b: 1.0, a: 0.01 });
        let camera = new FOUR.Camera();
        camera.position.w = 9;
        camera.position.y = 8;
        scene.add(camera);
        scene.add(new FOUR.AmbientLight(0.3));
        scene.add(new FOUR.DirectionalLight([2.2, 2.0, 1.9], new math.Vec4(0.2, 0.6, 0.1, 0.3).norms()));
        const materialGround = new FOUR.PhongMaterial([0, 0.6, 0.2, 0.1]);
        const materialBox = new FOUR.LambertMaterial(new FOUR.CheckerTexture([0, 0, 0, 0.5], [1, 1, 1, 0.5]));
        renderer.core.setEyeOffset(0.5);
        const retinaCtrl = new tesserxel.util.ctrl.RetinaController(renderer.core);
        const camCtrl = new tesserxel.util.ctrl.KeepUpController(camera);
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
        // world.gravity.set(0);
        const materialP = new phy.Material(1, 0.4);
        const material = new phy.Material(1, 0.4);
        const roomsize = 2;
        addRigidToScene(world, scene, materialGround, new phy.Rigid({ geometry: new phy.rigid.Plane(new math.Vec4(0, 1)), mass: 0, material: materialP }));
        // addRigidToScene(world, scene, materialGround, new phy.Rigid({ geometry: new phy.rigid.Plane(new math.Vec4(1), -roomsize), mass: 0, material: materialP }))
        // addRigidToScene(world, scene, materialGround, new phy.Rigid({ geometry: new phy.rigid.Plane(new math.Vec4(-1), -roomsize), mass: 0, material: materialP }))
        // addRigidToScene(world, scene, materialGround, new phy.Rigid({ geometry: new phy.rigid.Plane(new math.Vec4(0, 0, 0, 1), -roomsize), mass: 0, material: materialP }))
        // addRigidToScene(world, scene, materialGround, new phy.Rigid({ geometry: new phy.rigid.Plane(new math.Vec4(0, 0, 0, -1), -roomsize), mass: 0, material: materialP }))
        // addRigidToScene(world, scene, materialGround, new phy.Rigid({ geometry: new phy.rigid.Plane(new math.Vec4(0, 0, 1), -roomsize), mass: 0, material: materialP }))
        // addRigidToScene(world, scene, materialGround, new phy.Rigid({ geometry: new phy.rigid.Plane(new math.Vec4(0, 0, -1), -roomsize), mass: 0, material: materialP }))
        // world.add(new phy.PointConstrain(riigid, null, math.Vec4.xNeg, math.Vec4.y.mulf(3)));
        // let torisphere = new phy.Rigid({ geometry: new phy.rigid.Torisphere(1, 0.3), material, mass: 1 });
        // addRigidToScene(world, scene, materialBox, torisphere);
        // torisphere.position.y = 12;
        // torisphere.angularVelocity.randset();
        renderer.core.setOpacity(10);
        let spheritorusarr = [];
        let torispherearr = [];
        for (let i = -2; i < 2; i++) {
            let spheritorus = new phy.Rigid({ geometry: new phy.rigid.Spheritorus(1, 0.1), material, mass: 1 });
            addRigidToScene(world, scene, materialBox, spheritorus);
            spheritorus.rotatesb(math.Bivec.yw.mulf(math._90));
            spheritorus.angularVelocity.randset().mulfs(0.1);
            spheritorus.position.x = i * (8 / 3) + 3 / 4;
            spheritorus.position.y = 15.4;
            spheritorusarr.push(spheritorus);
            let torisphere = new phy.Rigid({ geometry: new phy.rigid.Torisphere(1, 0.1), material, mass: 1 });
            addRigidToScene(world, scene, materialBox, torisphere);
            torisphere.position.y = 15.4;
            torisphere.position.x = i * (8 / 3);
            torisphere.rotatesb(new math.Bivec(0.2));
            torispherearr.push(torisphere);
        }
        world.add(new phy.PointConstrain(torispherearr[0], null, math.Vec4.x, torispherearr[0].position.add(math.Vec4.x)));
        const controllerRegistry = new tesserxel.util.ctrl.ControllerRegistry(canvas, [
            retinaCtrl,
            camCtrl,
            new EmitGlomeController(world, scene, camera)
        ], { enablePointerLock: true });
        let t = -2;
        let emitType = 0;
        let srand = new math.Srand(Math.random());
        function run() {
            t++;
            if ((t & 0xFF) === 0xFF) {
                // emitType++;
                // let geometry: tesserxel.physics.RigidGeometry;
                // // let torisphere = new phy.Rigid({ geometry: new phy.rigid.Tesseractoid(new math.Vec4(3, 3, 3, 3).adds(math.Vec4.srand(srand)).divfs(3)), material, mass: 1 });
                // switch (emitType & 1) {
                //     case 0:
                //         geometry = new phy.rigid.Torisphere(1, 0.3);
                //         break;
                //     case 1:
                //         geometry = new phy.rigid.Spheritorus(1, 0.3);
                //         break;
                //     // case 2:
                //     //     geometry = new phy.rigid.Spheritorus(1, 0.3);
                //     //     break;
                // }
            }
            updateRidigsInScene();
            controllerRegistry.update();
            renderer.render(scene, camera);
            camera.needsUpdateCoord = true;
            if (t > 0)
                engine.update(world, controllerRegistry.states.mspf / 1000);
            window.requestAnimationFrame(run);
        }
        run();
    }
    st_pile.load1 = load1;
    async function load() {
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
        ].map(color => new FOUR.PhongMaterial(new FOUR.CheckerTexture(color, [1, 1, 1, 1], new FOUR.Vec4TransformNode(new FOUR.UVWVec4Input(), new math.Obj4(null, null, new math.Vec4(0, 0, 10, 0))))));
        const renderMatRoom = new FOUR.LambertMaterial([0.8, 0.6, 0.3, 0.08]);
        // renderMatRoom.cullMode = "back";
        const roomSize = 2.5;
        // floor
        world.add(new phy.Rigid({
            geometry: new phy.rigid.Plane(new math.Vec4(0, 1)), material: phyMatRoom, mass: 0
        }));
        // left wall
        world.add(new phy.Rigid({
            geometry: new phy.rigid.Plane(new math.Vec4(1), -roomSize), material: phyMatRoom, mass: 0
        }));
        // right wall
        world.add(new phy.Rigid({
            geometry: new phy.rigid.Plane(new math.Vec4(-1), -roomSize), material: phyMatRoom, mass: 0
        }));
        // ana wall
        world.add(new phy.Rigid({
            geometry: new phy.rigid.Plane(new math.Vec4(0, 0, 1), -roomSize), material: phyMatRoom, mass: 0
        }));
        //kata wall
        world.add(new phy.Rigid({
            geometry: new phy.rigid.Plane(new math.Vec4(0, 0, -1), -roomSize), material: phyMatRoom, mass: 0
        }));
        // front wall
        world.add(new phy.Rigid({
            geometry: new phy.rigid.Plane(new math.Vec4(0, 0, 0, 1), -roomSize), material: phyMatRoom, mass: 0
        }));
        //back wall
        world.add(new phy.Rigid({
            geometry: new phy.rigid.Plane(new math.Vec4(0, 0, 0, -1), -roomSize), material: phyMatRoom, mass: 0
        }));
        let roomMesh = new FOUR.Mesh(new FOUR.TesseractGeometry(roomSize), renderMatRoom);
        roomMesh.position.y += roomSize;
        roomMesh.geometry.jsBuffer.inverseNormal();
        scene.add(roomMesh);
        // set up lights, camera and renderer
        let camera = new FOUR.Camera();
        camera.position.w = 3;
        camera.position.y = 1.5;
        scene.add(camera);
        scene.add(new FOUR.AmbientLight(0.1));
        scene.add(new FOUR.DirectionalLight([2.2, 2.0, 1.9], new math.Vec4(0.2, 0.6, 0.1, 0.3).norms()));
        scene.add(new FOUR.DirectionalLight([0.1, 0.2, 0.3], new math.Vec4(-0.2, 0.2, -0.2, -0.4).norms()));
        scene.setBackgroudColor({ r: 0.8, g: 0.9, b: 1.0, a: 0.01 });
        const canvas = document.getElementById("gpu-canvas");
        const renderer = await new FOUR.Renderer(canvas).init();
        renderer.core.setScreenClearColor([1, 1, 1, 1]);
        renderer.core.setEyeOffset(0.5);
        renderer.core.setOpacity(10);
        // controllers
        const camCtrl = new tesserxel.util.ctrl.KeepUpController(camera);
        camCtrl.keyMoveSpeed = 0.003;
        const retinaCtrl = new tesserxel.util.ctrl.RetinaController(renderer.core);
        const emitCtrl = new EmitGlomeController(world, scene, camera);
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
    st_pile.load = load;
})(st_pile || (st_pile = {}));
export var rigid_test;
(function (rigid_test) {
    async function load() {
        const engine = new phy.Engine({ substep: 30 });
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
        let camera = new FOUR.Camera();
        camera.position.w = 4;
        camera.position.y = 4;
        scene.add(camera);
        initScene(scene);
        const canvas = document.getElementById("gpu-canvas");
        const renderer = await new FOUR.Renderer(canvas).init();
        renderer.core.setScreenClearColor([1, 1, 1, 1]);
        renderer.core.setEyeOffset(0.5);
        renderer.core.setOpacity(10);
        // controllers
        const camCtrl = new tesserxel.util.ctrl.KeepUpController(camera);
        camCtrl.keyMoveSpeed = 0.01;
        const retinaCtrl = new tesserxel.util.ctrl.RetinaController(renderer.core);
        const emitCtrl = new EmitGlomeController(world, scene, camera);
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
        let camera = new FOUR.Camera();
        camera.position.w = 9;
        camera.position.y = 8;
        scene.add(camera);
        initScene(scene);
        const canvas = document.getElementById("gpu-canvas");
        const renderer = await new FOUR.Renderer(canvas).init();
        renderer.core.setScreenClearColor([1, 1, 1, 1]);
        renderer.core.setEyeOffset(0.5);
        renderer.core.setOpacity(20);
        // controllers
        const camCtrl = new tesserxel.util.ctrl.KeepUpController(camera);
        camCtrl.keyMoveSpeed = 0.01;
        const retinaCtrl = new tesserxel.util.ctrl.RetinaController(renderer.core);
        const emitCtrl = new EmitGlomeController(world, scene, camera);
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
        let camera = new FOUR.Camera();
        camera.position.w = 9;
        camera.position.y = 8;
        scene.add(camera);
        initScene(scene);
        const canvas = document.getElementById("gpu-canvas");
        const renderer = await new FOUR.Renderer(canvas).init();
        renderer.core.setScreenClearColor([1, 1, 1, 1]);
        renderer.core.setEyeOffset(0.5);
        renderer.core.setOpacity(20);
        // controllers
        const camCtrl = new tesserxel.util.ctrl.KeepUpController(camera);
        camCtrl.keyMoveSpeed = 0.01;
        const retinaCtrl = new tesserxel.util.ctrl.RetinaController(renderer.core);
        const emitCtrl = new EmitGlomeController(world, scene, camera);
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
    tg_tg_chain.load = load;
})(tg_tg_chain || (tg_tg_chain = {}));
export var thermo_stats;
(function (thermo_stats) {
    async function load() {
        const engine = new phy.Engine({ substep: 5, broadPhase: phy.BoundingGlomeTreeBroadPhase });
        const world = new phy.World();
        const scene = new FOUR.Scene();
        const roomSize = 3.51;
        world.gravity.set();
        // define physical materials: frictions and restitutions
        const phyMat = new phy.Material(1, 1);
        const borderMat = new phy.Material(0, 1);
        // define render materials
        const balls = [];
        const renderMat = new FOUR.LambertMaterial(new FOUR.CheckerTexture([1, 1, 1], [0.2, 0.2, 0.2]));
        for (let i = 0; i < 20; i++) {
            const g = new phy.Rigid({
                geometry: new phy.rigid.Glome(0.5),
                mass: 1, material: phyMat
            });
            g.position.randset().mulfs(3);
            addRigidToScene(world, scene, renderMat, g);
            // if (!i) {
            g.velocity.set(g.position.y, -g.position.x, g.position.w, -g.position.z).mulfs(4);
            // }
            balls.push(g);
        }
        // let g = new phy.Rigid({
        //     geometry: new phy.rigid.Glome(0.3),
        //     mass: 1, material: phyMat
        // });
        // g.position.set(-1, 0, 0, 0); addRigidToScene(world, scene, renderMat, g); balls.push(g);
        // g = new phy.Rigid({
        //     geometry: new phy.rigid.Glome(0.3),
        //     mass: 1, material: phyMat
        // });
        // g.position.set(1, 0, 0, 0); addRigidToScene(world, scene, renderMat, g); balls.push(g);
        // g.velocity.x = -1;
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
        scene.add(new FOUR.DirectionalLight([2.2, 2.0, 1.9], new math.Vec4(0.2, 0.6, 0.1, 0.3).norms()));
        scene.setBackgroudColor({ r: 0.8, g: 0.9, b: 1.0, a: 0.01 });
        const canvas = document.getElementById("gpu-canvas");
        const renderer = await new FOUR.Renderer(canvas).init();
        renderer.core.setScreenClearColor([1, 1, 1, 1]);
        renderer.core.setEyeOffset(0.5);
        renderer.core.setOpacity(20);
        // controllers
        const camCtrl = new tesserxel.util.ctrl.TrackBallController(camera);
        const retinaCtrl = new tesserxel.util.ctrl.RetinaController(renderer.core);
        // const emitCtrl = new EmitGlomeController(world, scene, camera);
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
            engine.update(world, factor / 100);
            window.requestAnimationFrame(run);
            if (time % 32 === 0) {
                let jeg = [];
                let sum = new math.Bivec();
                for (const g of balls) {
                    let degree = Math.atan2(g.angularVelocity.dual().add(g.angularVelocity).norm(), g.angularVelocity.dual().sub(g.angularVelocity).norm());
                    degree = degree * 4 / Math.PI - 1;
                    jeg.push(degree.toFixed(4));
                    sum.adds(g.angularVelocity);
                }
                let degree = Math.atan2(sum.dual().add(sum).norm(), sum.dual().sub(sum).norm());
                degree = degree * 4 / Math.PI - 1;
                console.log(jeg.join(","));
                console.log(degree.toFixed(4));
            }
        }
        window.addEventListener("resize", setSize);
        setSize();
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
        let camera = new FOUR.Camera();
        camera.position.w = 9;
        camera.position.y = 8;
        scene.add(camera);
        initScene(scene);
        const canvas = document.getElementById("gpu-canvas");
        const renderer = await new FOUR.Renderer(canvas).init();
        renderer.core.setScreenClearColor([1, 1, 1, 1]);
        renderer.core.setEyeOffset(0.5);
        renderer.core.setOpacity(20);
        // controllers
        const camCtrl = new tesserxel.util.ctrl.KeepUpController(camera);
        camCtrl.keyMoveSpeed = 0.01;
        const retinaCtrl = new tesserxel.util.ctrl.RetinaController(renderer.core);
        const emitCtrl = new EmitGlomeController(world, scene, camera);
        emitCtrl.glomeRadius = 2;
        emitCtrl.maximumBulletDistance = 70;
        emitCtrl.initialSpeed = 10;
        await emitCtrl.glomeMaterial.compile(renderer);
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
    mix_chain.load = load;
})(mix_chain || (mix_chain = {}));
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
    // floor
    world.add(new phy.Rigid({
        geometry: new phy.rigid.Plane(new math.Vec4(0, 1)), material: phyMatGround, mass: 0
    }));
    // ceil
    world.add(new phy.Rigid({
        geometry: new phy.rigid.Plane(new math.Vec4(0, -1), -roomSize * 2), material: phyMatGround, mass: 0
    }));
    // left wall
    world.add(new phy.Rigid({
        geometry: new phy.rigid.Plane(new math.Vec4(1), -roomSize), material: phyMatGround, mass: 0
    }));
    // right wall
    world.add(new phy.Rigid({
        geometry: new phy.rigid.Plane(new math.Vec4(-1), -roomSize), material: phyMatGround, mass: 0
    }));
    // ana wall
    world.add(new phy.Rigid({
        geometry: new phy.rigid.Plane(new math.Vec4(0, 0, 1), -roomSize), material: phyMatGround, mass: 0
    }));
    //kata wall
    world.add(new phy.Rigid({
        geometry: new phy.rigid.Plane(new math.Vec4(0, 0, -1), -roomSize), material: phyMatGround, mass: 0
    }));
    // front wall
    world.add(new phy.Rigid({
        geometry: new phy.rigid.Plane(new math.Vec4(0, 0, 0, 1), -roomSize), material: phyMatGround, mass: 0
    }));
    //back wall
    world.add(new phy.Rigid({
        geometry: new phy.rigid.Plane(new math.Vec4(0, 0, 0, -1), -roomSize), material: phyMatGround, mass: 0
    }));
    let roomMesh = new FOUR.Mesh(new FOUR.TesseractGeometry(roomSize), renderMatGround);
    roomMesh.position.y += roomSize;
    roomMesh.geometry.jsBuffer.inverseNormal();
    scene.add(roomMesh);
    let maxwell = new phy.MaxWell();
    world.add(maxwell);
    const canvas = document.getElementById("gpu-canvas");
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
    renderer.core.setScreenClearColor([1, 1, 1, 1]);
    renderer.core.setEyeOffset(0.5);
    renderer.core.setOpacity(20);
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
    const retinaCtrl = new tesserxel.util.ctrl.RetinaController(renderer.core);
    const emitCtrl = new EmitGlomeController(world, scene, camera);
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
            const chargeNum = 6;
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
export var m_dipole_dual;
(function (m_dipole_dual) {
    async function load() {
        await loadMaxwell(async (world, maxwell, scene, renderer) => {
            const phyMatCharge = new phy.Material(1, 0.5);
            const renderMatMDipoleDual = new FOUR.LambertMaterial(new FOUR.CheckerTexture([1, 0, 0, 1], new FOUR.CheckerTexture([1, 0.5, 0.5, 0.2], [0, 0, 1, 1], new FOUR.Vec4TransformNode(new FOUR.UVWVec4Input(), new math.Obj4(new math.Vec4(0, 0, 0.41), null, new math.Vec4(0.1, 0.1, 0.1, 0.1)))), new FOUR.Vec4TransformNode(new FOUR.UVWVec4Input(), new math.Obj4(new math.Vec4(0, 0, 0.49), null, new math.Vec4(0.1, 0.1, 0.1, 0.1)))));
            const renderMatMDipoleAntiDual = new FOUR.LambertMaterial(new FOUR.CheckerTexture([1, 0, 0, 1], new FOUR.CheckerTexture([0.5, 0.5, 1, 0.2], [0, 0, 1, 1], new FOUR.Vec4TransformNode(new FOUR.UVWVec4Input(), new math.Obj4(new math.Vec4(0, 0, 0.41), null, new math.Vec4(0.1, 0.1, 0.1, 0.1)))), new FOUR.Vec4TransformNode(new FOUR.UVWVec4Input(), new math.Obj4(new math.Vec4(0, 0, 0.49), null, new math.Vec4(0.1, 0.1, 0.1, 0.1)))));
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
    m_dipole_dual.load = load;
})(m_dipole_dual || (m_dipole_dual = {}));
//# sourceMappingURL=rigids.js.map