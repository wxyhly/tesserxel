import * as tesserxel from "../../build/tesserxel.js"
const FOUR = tesserxel.four;
const PHY = tesserxel.physics;
const Vec4 = tesserxel.math.Vec4;
const Obj4 = tesserxel.math.Obj4;
const Bivec = tesserxel.math.Bivec;
const Rotor = tesserxel.math.Rotor;
const geomTesseract = new FOUR.TesseractGeometry(1);
const lang = new URLSearchParams(window.location.search.slice(1)).get("lang") ?? (navigator.languages.join(",").includes("zh") ? "zh" : "en");
async function loadFile(src: string) {
    return new Promise<string>((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        console.log("loading: " + src);
        xhr.open("GET", src, true);
        xhr.onload = e => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(xhr.responseText);
                } else {
                    console.error(xhr.statusText);
                    reject();
                }
            }
        };
        xhr.onerror = function (e) {
            console.error(xhr.statusText);
            reject();
        };
        xhr.send();
    });
}
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
            parse = type.match(/^dt(.+),(.+),(.+)$/);
            if (parse) {
                geometryData[type] = new FOUR.DitorusGeometry(Number(parse[3]), Number(parse[1]), Number(parse[2])); return geometryData[type];
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
        if (rigid.geometry instanceof PHY.rigid.Union) {
            for (let c of rigid.geometry.components) {
                addRigidToScene(null, scene, renderMaterial, c);
            }
            world.add(rigid);
            return;
        } else if (rigid.geometry instanceof PHY.rigid.Tesseractoid) {
            geom = getGeometryData("tesseractoid");
            obj4 = new Obj4(null, null, rigid.geometry.size);
        } else if (rigid.geometry instanceof PHY.rigid.Convex) {
            geom = new FOUR.ConvexHullGeometry(rigid.geometry.points);
            obj4 = new Obj4();
        } else if (rigid.geometry instanceof PHY.rigid.Glome) {
            geom = getGeometryData("glome");
            obj4 = new Obj4(null, null, new Vec4(rigid.geometry.radius, rigid.geometry.radius, rigid.geometry.radius, rigid.geometry.radius));
        } else if (rigid.geometry instanceof PHY.rigid.Plane) {
            geom = getGeometryData("plane");
            obj4 = new Obj4(rigid.geometry.normal.mulf(rigid.geometry.offset), Rotor.lookAt(Vec4.y, rigid.geometry.normal));
        } else if (rigid.geometry instanceof PHY.rigid.Spheritorus) {
            geom = getGeometryData("st" + rigid.geometry.majorRadius + "," + rigid.geometry.minorRadius);
            obj4 = new Obj4();
        } else if (rigid.geometry instanceof PHY.rigid.Torisphere) {
            geom = getGeometryData("ts" + rigid.geometry.majorRadius + "," + rigid.geometry.minorRadius);
            obj4 = new Obj4();
        } else if (rigid.geometry instanceof PHY.rigid.Tiger) {
            geom = getGeometryData("tg" + rigid.geometry.majorRadius1 + "," + rigid.geometry.majorRadius2 + "," + rigid.geometry.minorRadius);
            obj4 = new Obj4();
        } else if (rigid.geometry instanceof PHY.rigid.Ditorus) {
            geom = getGeometryData("dt" + rigid.geometry.majorRadius + "," + rigid.geometry.middleRadius + "," + rigid.geometry.minorRadius);
            obj4 = new Obj4();
        }
        if (!geom) {
            console.log("unsupported geometry type");
        }
        let mesh = new FOUR.Mesh(geom, renderMaterial);
        mesh.copyObj4(obj4);
        mesh.alwaysUpdateCoord = true;
        world?.add(rigid); scene.add(mesh);
        if (!(rigid.geometry instanceof PHY.rigid.Plane))
            rigidsInSceneLists.push([mesh, rigid]);
    }
}

export namespace automobile {

    export async function load() {
        const canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
        const renderer = await new FOUR.Renderer(canvas).init();
        renderer.core.setDisplayConfig({ opacity: 5 });
        renderer.setBackgroudColor([1, 1, 1, 1]);
        const scene = new FOUR.Scene();
        const gnd = new FOUR.CubeGeometry(2000);
        scene.add(new FOUR.Mesh(gnd, new FOUR.LambertMaterial(new FOUR.CheckerTexture(
            new FOUR.CheckerTexture(
                new FOUR.CheckerTexture(
                    [1, 1, 1, 0.1],
                    [0.9, 0.8, 0.8, 0.1]
                    , new FOUR.Vec4TransformNode(new FOUR.UVWVec4Input(), new Obj4(null, null, new Vec4(1000, 1000, 1000, 1000)))
                ),
                [0.5, 0.3, 0.3, 0.1]
                , new FOUR.Vec4TransformNode(new FOUR.UVWVec4Input(), new Obj4(null, null, new Vec4(100, 100, 100, 100)))
            ),
            new FOUR.CheckerTexture(
                new FOUR.CheckerTexture(
                    [1, 1, 0.6, 0.1],
                    [0.9, 0.8, 0.4, 0.1]
                    , new FOUR.Vec4TransformNode(new FOUR.UVWVec4Input(), new Obj4(null, null, new Vec4(1000, 1000, 1000, 1000)))
                ),
                [0.3, 0.7, 0.7, 0.1]
                , new FOUR.Vec4TransformNode(new FOUR.UVWVec4Input(), new Obj4(null, null, new Vec4(100, 100, 100, 100)))
            ),
            new FOUR.Vec4TransformNode(new FOUR.UVWVec4Input(), new Obj4(null, null, new Vec4(10, 10, 10, 10)))
        ))));
        const camera = new FOUR.Camera();
        camera.near = 0.1;
        camera.far = 500;
        scene.add(camera);
        scene.skyBox = new FOUR.SimpleSkyBox();
        scene.add(new FOUR.AmbientLight(0.2));
        scene.add(new FOUR.DirectionalLight([1.0, 0.9, 0.8], new Vec4(0.2, 1.0, 0.3, 0.4).norms()))

        camera.position.set(0, 1, 0, 2);

        const engine = new PHY.Engine({ forceAccumulator: PHY.force_accumulator.RK4 });
        const world = new PHY.World();
        world.add(new PHY.Rigid({
            mass: 0,
            geometry: new PHY.rigid.Plane(Vec4.y),
            material: new PHY.Material(5, 0.3)
        }));
        world.gravity.set(0, -9.8, 0, 0);
        const a = new PHY.Rigid({
            mass: 1,
            geometry: new PHY.rigid.Glome(0.5),
            material: new PHY.Material(1, 0.3)
        });
        a.position.w = -1;
        const b = new PHY.Rigid({
            mass: 10,
            geometry: new PHY.rigid.Glome(0.5),
            material: new PHY.Material(1, 0.3)
        });
        b.position.w = 1;
        const union = new PHY.Rigid(
            [a,b]
        );
        union.position.w = 10;
        // // world.add(new PHY.Spring(a, b, new Vec4(0, 0), new Vec4(0, 1), 50,0, 1));
        // world.add(new PHY.Spring(a, b, new Vec4(), new Vec4(0,1), 500, 0, 10));

        // addRigidToScene(world, scene, new FOUR.LambertMaterial(new FOUR.CheckerTexture([1, 1, 1, 1], [0, 1, 0, 1])), union);

        const carP = new PHY.Rigid({
            mass: 10,
            geometry: new PHY.rigid.Tesseractoid(new Vec4(1, 0.5, 1, 2)),
            material: new PHY.Material(15, 0.3)
        });
        carP.position.y = 1;
        const wheelPs = [];
        const torqueSprings: tesserxel.physics.TorqueSpring[] = [];
        const ps = [];
        for (let i = 0; i < 32; i++) {
            const ii = Math.PI * 2 / 32 * i;
            for (let j = 0; j < 8; j++) {
                const jj = Math.PI * 2 / 8 * j;
                ps.push(new Vec4(Math.sin(ii) * 0.2, Math.sin(jj) * 0.05, Math.cos(jj) * 0.05, Math.cos(ii) * 0.2));
            }
        }
        for (let i = 0; i < 2; i++) {
            const wheelP = new PHY.Rigid({
                mass: 0.1,
                geometry: new PHY.rigid.Convex(ps.map(v => v.clone())),
                // geometry: new PHY.rigid.Spheritorus(0.2, 0.06),
                material: new PHY.Material(5, 0.3)
            }).rotatesb(Bivec.xy.mulf(Math.PI / 2));
            wheelP.position.set(i & 1 ? 1 : -1, -0.5, i & 2 ? 1 : -1, i & 4 ? 2 : -2);
            // wheelPs.push(wheelP);
            // world.add(new PHY.Spring(wheelP, carP, new Vec4(), wheelP.position.clone(), 500, 0, 10));
            // wheelP.position.y += carP.position.y;
            // const tsp = new PHY.TorqueSpring(wheelP, carP, Bivec.xw, Bivec.wy.clone(), 5, 0.03);
            // torqueSprings.push(tsp);
            // world.add(tsp);
            // engine.broadPhase.ignorePair.push([wheelP, carP]);
            addRigidToScene(world, scene, new FOUR.LambertMaterial(new FOUR.CheckerTexture([1, 1, 1, 1], [0, 1, 0, 1])), wheelP);
        }

        // addRigidToScene(world, scene, new FOUR.LambertMaterial([1, 1, 1, 1]), carP);

        camera.position.w = 4;
        const retinaController = new tesserxel.util.ctrl.RetinaController(renderer.core);
        const freeCamCtrl = new tesserxel.util.ctrl.KeepUpController(camera);
        const hud = document.createElement("table");
        const carCtrl = new CarCtrl(wheelPs, torqueSprings, freeCamCtrl, hud);
        world.add(carCtrl);

        const ctrlReg = new tesserxel.util.ctrl.ControllerRegistry(canvas, [
            retinaController, freeCamCtrl, carCtrl
        ], { preventDefault: true });
        function setSize() {
            let width = window.innerWidth * window.devicePixelRatio;
            let height = window.innerHeight * window.devicePixelRatio;
            renderer.setSize({ width, height });
        }
        setSize();
        window.addEventListener("resize", setSize);

        const defaultKeyConfig = freeCamCtrl.keyConfig;
        const disableKeyConfig: any = {};
        for (const k of Object.keys(defaultKeyConfig)) { disableKeyConfig[k] = ''; };
        function run() {
            engine.update(world, 1 / 60);
            updateRidigsInScene();
            ctrlReg.update();
            if (carCtrl.camLock) {
                if (carCtrl.camPos !== -1) freeCamCtrl.updateObj();
                switch (carCtrl.camPos) {
                    case 0:
                        camera.copyObj4(carP);
                        camera.position.adds(new Vec4(0, 0.4, 0, 4).rotates(camera.rotation));
                        camera.rotation.mulsr(Bivec.xz.mulf(Math.PI/4).exp());
                        break;
                    case 1:
                        camera.copyObj4(carP);
                        camera.position.adds(new Vec4(0, -0.52, 0, 4).rotates(camera.rotation));
                        camera.rotation.mulsr(Bivec.xz.mulf(Math.PI/4).exp());
                        break;
                    case 2:
                        camera.copyObj4(carP);
                        camera.position.y += 3;
                        camera.lookAt(Vec4.wNeg, carP.position);
                        break;
                }
            }
            freeCamCtrl.enabled = !carCtrl.camLock;
            if (carCtrl.camPos === -1) {
                freeCamCtrl.enabled = true;
                freeCamCtrl.keyConfig = carCtrl.camLock ? disableKeyConfig : defaultKeyConfig;
            }
            renderer.render(scene, camera);
            window.requestAnimationFrame(run);
        }
        run();
    }
}
class CarCtrl extends tesserxel.physics.Force implements tesserxel.util.ctrl.IController {
    crashed = false;
    camLock = true;
    camCtrl: tesserxel.util.ctrl.KeepUpController;
    keyConfig = {
        turnLeft: "KeyA",
        turnRight: "KeyD",
        turnAna: "KeyW",
        turnKata: "KeyS",
        spinCW: "KeyQ",
        spinCCW: "KeyE",
        brake: "KeyK",
        heavyBrake: "KeyI",
        gas: "KeyJ",
        heavyGas: "KeyU",

        toggleCamlock: ".KeyB",
        camSpeedIncrease: ".Equal",
        camSpeedDecrease: ".Minus",
        camPos: [".Digit1",
            ".Digit2",
            ".Digit3", ".Digit4"],
        hudToggle: ".KeyH",
        automaticToggle: ".KeyT",
    }
    camPos = -1;
    camSpeedAdjustFactor = 1.5;
    // ws, ad, qe, zx
    state = [0, 0, 0, 0];
    wheels: tesserxel.physics.Rigid[];
    torqueSprings: tesserxel.physics.TorqueSpring[];
    hudDom: HTMLElement;

    constructor(wheels: tesserxel.physics.Rigid[], torqueSprings: tesserxel.physics.TorqueSpring[], camCtrl: tesserxel.util.ctrl.KeepUpController, hudDom: HTMLElement) {
        super();
        this.wheels = wheels;
        this.torqueSprings = torqueSprings;
        this.camCtrl = camCtrl;
        this.hudDom = hudDom;
    }
    apply(time: number): void {
        // motor force
        // for (let i = 4; i < 8; i++) {
        //     this.wheels[i].torque.adds(new Bivec(0, 0, -this.state[0]).rotates(this.wheels[i].rotation));
        // }
    }
    update(state: tesserxel.util.ctrl.ControllerState): void {
        // if (!this.crashed) this.checkState();
        if (state.isKeyHold("AltLeft")) return;
        if (state.isKeyHold(this.keyConfig.hudToggle)) {
            this.hudDom.style.display = this.hudDom.style.display === "none" ? "" : "none";
        }
        if (state.isKeyHold(this.keyConfig.toggleCamlock)) {
            this.camLock = !this.camLock;
            this.camPos = -1;
        }
        for (let i = 0; i < this.keyConfig.camPos.length; i++) {
            if (state.isKeyHold(this.keyConfig.camPos[i])) {
                this.camPos = i === 3 ? -1 : i;
                if (i !== 3) this.camLock = true;
            }
        }
        if (!this.camLock) {
            if (state.isKeyHold(this.keyConfig.camSpeedDecrease)) {
                this.camCtrl.keyMoveSpeed /= this.camSpeedAdjustFactor;
            }
            if (state.isKeyHold(this.keyConfig.camSpeedIncrease)) {
                this.camCtrl.keyMoveSpeed *= this.camSpeedAdjustFactor;
            }
        }
        if (this.camLock) {
            this.state.fill(0);
            if (state.isKeyHold(this.keyConfig.gas)) {
                this.state[0] = 1;
            }
            if (state.isKeyHold(this.keyConfig.brake)) {
                this.state[0] = -1;
            }
            if (state.isKeyHold(this.keyConfig.heavyBrake)) {
                this.state[0] = -5;
            }
            if (state.isKeyHold(this.keyConfig.heavyGas)) {
                this.state[0] = 5;
            }
            if (state.isKeyHold(this.keyConfig.turnLeft)) {
                this.state[1] = -0.2;
            }
            if (state.isKeyHold(this.keyConfig.turnRight)) {
                this.state[1] = 0.2;
            }
            if (state.isKeyHold(this.keyConfig.turnAna)) {
                this.state[2] = -0.2;
            }
            if (state.isKeyHold(this.keyConfig.turnKata)) {
                this.state[2] = 0.2;
            }

            const R = Bivec.wy.rotate(new Bivec(0, 0, this.state[1], 0, 0, this.state[2]).exp());
            const r = new Bivec;
            // for (let i = 0; i < 4; i++) {
            //     // steer wheel turn
            //     this.torqueSprings[i].planeB.copy(R);
            //     // cancel wheel spin
            //     const rR = Rotor.lookAtvb(Vec4.y.clone(),Bivec.xw.rotate(this.wheels[i].rotation));
            //     this.wheels[i].rotatesconj(rR);
            //     r.copy(this.wheels[i].angularVelocity);
            //     r.rotatesconj(this.wheels[i].rotation);
            //     r.yz = 0;
            //     r.rotates(this.wheels[i].rotation);
            //     this.wheels[i].angularVelocity.copy(r);
            // }
        }
    }
}