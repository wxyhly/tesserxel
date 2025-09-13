import * as tesserxel from "../../build/esm/tesserxel.js"
const FOUR = tesserxel.four;
const PHY = tesserxel.physics;
const Vec4 = tesserxel.math.Vec4;
const Obj4 = tesserxel.math.Obj4;
const Bivec = tesserxel.math.Bivec;
const geomTesseract = new FOUR.TesseractGeometry(1);
const lang = new URLSearchParams(window.location.search.slice(1)).get("lang") ?? (navigator.languages.join(",").includes("zh") ? "zh" : "en");

export namespace drone {

    export async function load() {
        const canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
        const app = await FOUR.App.create({ canvas, controllerConfig: { preventDefault: true } });
        const renderer = app.renderer;
        renderer.core.setDisplayConfig({ opacity: 5 });
        renderer.setBackgroundColor([1, 1, 1, 1]);
        const scene = app.scene;
        const gnd = new FOUR.CubeGeometry(20000);
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
        const camera = app.camera;
        camera.near = 0.1;
        camera.far = 5000;
        scene.add(camera);
        scene.skyBox = new FOUR.SimpleSkyBox();
        scene.add(new FOUR.AmbientLight(0.2));
        scene.add(new FOUR.DirectionalLight([1.0, 0.9, 0.8], new Vec4(0.2, 1.0, 0.3, 0.4).norms()))

        const droneFrameParam = {
            frameLength: 1.2,
            frameThicknes: 0.08,
            frameWidth: 0.13,

            blockthicknes: 0.2,
            blockWidth: 0.41,
        };
        type DroneFrameParam = typeof droneFrameParam;
        const { droneFrame, droneMotors } = genDrone(droneFrameParam);
        camera.position.set(0, 1, 0, 2);
        scene.add(droneFrame);

        const engine = new PHY.Engine();
        const world = new PHY.World();
        world.add(new PHY.Rigid({
            mass: 0,
            geometry: new PHY.rigid.Plane(Vec4.y),
            material: new PHY.Material(1, 0.3)
        }));

        const droneP = new PHY.Rigid({
            mass: 1,
            geometry: new PHY.rigid.Tesseractoid(new Vec4(droneFrameParam.frameLength, droneFrameParam.blockthicknes, droneFrameParam.frameLength, droneFrameParam.frameLength)),
            material: new PHY.Material(1, 0.3)
        });
        world.add(droneP);
        droneP.position.y = 0.2;
        // camera.rotatesb(Bivec.xw.mulf(Math.PI));
        const freeCamCtrl = new tesserxel.util.ctrl.KeepUpController(camera);
        const hud = document.createElement("table");

        const droneCtrl = new DroneCtrl(droneP, freeCamCtrl, hud);
        const droneMecanism = new DroneMecanism(droneCtrl);
        world.add(droneMecanism);
        app.controllerRegistry.add(droneCtrl);
        app.controllerRegistry.add(freeCamCtrl);
        const coeffFanrotAnimation = 1;
        const values: HTMLTableCellElement[] = [];
        const keys = {
            en: [
                "Height", "Vertical Speed", "Horizontal Speed",
                "W Speed", "X Speed", "Z Speed",
                "X Tilt Angle", "Y Tilt Angle", "Z Tilt Angle", "W Tilt Angle",
                "X- Motors", "X+ Motors",
                "Z- Motors", "Z+ Motors",
                "W- Motors", "W+ Motors",
                "Press T to Toggle",
                "Press B to Toggle",
                "Press H to Hide",
            ],
            "zh": [
                "高度", "垂直速度分量", "水平速度分量",
                "W速度分量", "X速度分量", "Z速度分量",
                "X倾角", "Y倾角", "Z倾角", "W倾角",
                "X-电机", "X+电机",
                "Z-电机", "Z+电机",
                "W-电机", "W+电机",
                "按T切换",
                "按B切换",
                "按H隐藏",
            ],

        }[lang];
        const translate = {
            en: { "Automatic Mode": "Automatic Mode", "Manual Mode": "Manual Mode", "Drone Control": "Drone Control", "Camera Control": "Camera Control" },
            zh: { "Automatic Mode": "自动模式", "Manual Mode": "手动模式", "Drone Control": "控制无人机", "Camera Control": "控制相机" }
        }[lang];
        const hudItems = keys.length;
        for (let i = 0; i < hudItems; i++) {
            const item = document.createElement("tr");
            const key = document.createElement("td");
            values[i] = document.createElement("td");
            key.innerText = keys[i];
            item.appendChild(key);
            item.appendChild(values[i]);
            hud.appendChild(item);
        }
        hud.style.position = "fixed";
        hud.style.top = "100px";
        hud.style.left = "0px";
        hud.style.fontSize = "0.8em";
        document.body.appendChild(hud);
        const defaultKeyConfig = freeCamCtrl.keyConfig;
        const disableKeyConfig: any = {};
        for (const k of Object.keys(defaultKeyConfig)) { disableKeyConfig[k] = ''; };
        function run() {
            values[0].innerText = droneP.position.y.toFixed(1);
            values[1].innerText = droneP.velocity.y.toFixed(1);
            values[2].innerText = droneP.velocity.xzw().norm().toFixed(1);

            const _v = Vec4.w.rotate(droneP.rotation); _v.y = 0; _v.norms();
            values[3].innerText = (-droneP.velocity.dot(_v))?.toFixed(3);
            _v.copy(Vec4.x).rotates(droneP.rotation); _v.y = 0; _v.norms();
            values[4].innerText = droneP.velocity.dot(_v)?.toFixed(3);
            _v.copy(Vec4.z).rotates(droneP.rotation); _v.y = 0; _v.norms();
            values[5].innerText = (-droneP.velocity.dot(_v))?.toFixed(3);
            values[6].innerText = (Math.acos(Vec4.x.rotate(droneP.rotation).y) * 180 / Math.PI - 90).toFixed(1);
            values[7].innerText = (Math.acos(Math.min(Vec4.y.rotate(droneP.rotation).y, 1)) * 180 / Math.PI).toFixed(1);
            values[8].innerText = (-Math.acos(Vec4.z.rotate(droneP.rotation).y) * 180 / Math.PI + 90).toFixed(1);
            values[9].innerText = (-Math.acos(Vec4.w.rotate(droneP.rotation).y) * 180 / Math.PI + 90).toFixed(1);
            values[10].innerText = droneCtrl.motors[0].toFixed(3) + "; " + droneCtrl.motors[1].toFixed(3);
            values[11].innerText = droneCtrl.motors[2].toFixed(3) + "; " + droneCtrl.motors[3].toFixed(3);
            values[13].innerText = droneCtrl.motors[4].toFixed(3) + "; " + droneCtrl.motors[5].toFixed(3);
            values[12].innerText = droneCtrl.motors[6].toFixed(3) + "; " + droneCtrl.motors[7].toFixed(3);
            values[15].innerText = droneCtrl.motors[8].toFixed(3) + "; " + droneCtrl.motors[9].toFixed(3);
            values[14].innerText = droneCtrl.motors[10].toFixed(3) + "; " + droneCtrl.motors[11].toFixed(3);
            values[16].innerText = droneCtrl.automatic ? translate["Automatic Mode"] : translate["Manual Mode"];
            values[17].innerText = droneCtrl.camLock ? translate["Drone Control"] : translate["Camera Control"];
            for (let i = 0; i < values.length; i++) {
                if (values[i].innerText === "-0.0") values[i].innerText = "0.0";
                if (values[i].innerText === "-0.000") values[i].innerText = "0.000";
            }
            app.controllerRegistry.update();
            engine.update(world, 1 / 60);
            animateDrone();
            if (droneCtrl.camLock) {
                if (droneCtrl.camPos !== -1) freeCamCtrl.updateObj();
                switch (droneCtrl.camPos) {
                    case 0:
                        camera.copyObj4(droneP);
                        camera.position.adds(new Vec4(0, 1, 0, 2).rotates(camera.rotation));
                        break;
                    case 1:
                        camera.copyObj4(droneP);
                        camera.position.adds(new Vec4(0, 0.3, 0, 2).rotates(camera.rotation));
                        break;
                    case 2:
                        camera.copyObj4(droneP);
                        camera.position.y += 3;
                        camera.lookAt(Vec4.wNeg, droneP.position);
                        break;
                }
            }
            freeCamCtrl.enabled = !droneCtrl.camLock;
            if (droneCtrl.camPos === -1) {
                freeCamCtrl.enabled = true;
                freeCamCtrl.keyConfig = droneCtrl.camLock ? disableKeyConfig : defaultKeyConfig;
            }
            renderer.render(scene, camera);
            window.requestAnimationFrame(run);
        }
        run();
        function animateDrone() {
            droneFrame.copyObj4(droneP);
            droneFrame.needsUpdateCoord = true;
            for (let i = 0; i < 12; i++) {
                droneMotors[i].rotatesb([
                    Bivec.zw,
                    Bivec.wz,
                    Bivec.zw,
                    Bivec.wz,
                    Bivec.xw,
                    Bivec.wx,
                    Bivec.xw,
                    Bivec.wx,
                    Bivec.xz,
                    Bivec.zx,
                    Bivec.xz,
                    Bivec.zx,
                ][i].mulf(droneMecanism.speeds[i] * coeffFanrotAnimation));
            }
        }
        function genDrone(param: DroneFrameParam) {
            const droneFrame = new FOUR.Object();
            const stickMat = new FOUR.PhongMaterial([0.4, 0.3, 0.1, 1]);
            const centerMat = new FOUR.LambertMaterial([0.6, 0.6, 0.8, 0.8]);
            const fanMat = new FOUR.PhongMaterial([0.1, 0.1, 0.1, 50]);
            const xf = new FOUR.Mesh(geomTesseract, stickMat);
            xf.scale = new Vec4(
                param.frameLength, param.frameThicknes, param.frameWidth, param.frameWidth
            );
            const zf = new FOUR.Mesh(geomTesseract, stickMat).rotatesb(Bivec.xz.mulf(Math.PI / 2));
            zf.scale = new Vec4(
                param.frameLength, param.frameThicknes, param.frameWidth, param.frameWidth
            );
            const wf = new FOUR.Mesh(geomTesseract, stickMat).rotatesb(Bivec.xw.mulf(Math.PI / 2));
            wf.scale = new Vec4(
                param.frameLength, param.frameThicknes, param.frameWidth, param.frameWidth
            );
            const fc = new FOUR.Mesh(geomTesseract, centerMat);
            fc.scale = new Vec4(
                param.blockWidth, param.blockthicknes, param.blockWidth, param.blockWidth
            );
            const motorHeight = 0.3;
            const distA = 1.1, distB = 0.8;
            const fanLength = 0.3;
            const fanScale = new Vec4(fanLength, 0.01, 0.1, 0.04);
            function genMotor() {
                const fan1 = new FOUR.Mesh(geomTesseract, fanMat);
                fan1.scale = fanScale;
                fan1.rotatesb(Bivec.yw.mulf(Math.PI / 4)).rotatesb(Bivec.xw.mulf(Math.PI / 3 * 2));
                fan1.position.set(fanLength / 2, 0, 0, -Math.sqrt(3) / 2 * fanLength);
                const fan2 = new FOUR.Mesh(geomTesseract, fanMat);
                fan2.scale = fanScale;
                fan2.position.set(fanLength / 2, 0, 0, Math.sqrt(3) / 2 * fanLength);
                fan2.rotatesb(Bivec.yw.mulf(Math.PI / 4)).rotatesb(Bivec.xw.mulf(-Math.PI / 3 * 2));
                const fan3 = new FOUR.Mesh(geomTesseract, fanMat);
                fan3.position.set(-fanLength);
                fan3.rotatesb(Bivec.yw.mulf(Math.PI / 4));
                fan3.scale = fanScale;
                const axle = new FOUR.Mesh(geomTesseract, fanMat);
                axle.scale = new Vec4(0.02, motorHeight / 2, 0.02, 0.02);
                axle.position.y = -motorHeight / 4;
                const motor = new FOUR.Object();
                motor.add(fan1, fan2, fan3, axle);
                motor.position.y = motorHeight;
                return motor;
            }
            const motorx00 = genMotor();
            motorx00.position.x = -distA; motorx00.rotatesb(Bivec.xz.mulf(Math.PI / 2));
            const motorx01 = genMotor();
            motorx01.position.x = -distB; motorx01.rotatesb(Bivec.zx.mulf(Math.PI / 2));
            const motorx10 = genMotor();
            motorx10.position.x = distA; motorx10.rotatesb(Bivec.xz.mulf(Math.PI / 2));
            const motorx11 = genMotor();
            motorx11.position.x = distB; motorx11.rotatesb(Bivec.zx.mulf(Math.PI / 2));

            const motorz00 = genMotor();
            motorz00.position.z = -distA;
            const motorz01 = genMotor(); motorz01.rotatesb(Bivec.xz.mulf(Math.PI));
            motorz01.position.z = -distB;
            const motorz10 = genMotor();
            motorz10.position.z = distA;
            const motorz11 = genMotor(); motorz11.rotatesb(Bivec.xz.mulf(Math.PI));
            motorz11.position.z = distB;

            const motorw00 = genMotor();
            motorw00.position.w = -distA; motorw00.rotatesb(Bivec.wz.mulf(Math.PI / 2));
            const motorw01 = genMotor();
            motorw01.position.w = -distB; motorw01.rotatesb(Bivec.zw.mulf(Math.PI / 2));
            const motorw10 = genMotor();
            motorw10.position.w = distA; motorw10.rotatesb(Bivec.wz.mulf(Math.PI / 2));
            const motorw11 = genMotor();
            motorw11.position.w = distB; motorw11.rotatesb(Bivec.zw.mulf(Math.PI / 2));
            const droneMotors = [
                motorx00, motorx01, motorx10, motorx11,
                motorz00, motorz01, motorz10, motorz11,
                motorw00, motorw01, motorw10, motorw11,
            ]
            droneFrame.add(xf, zf, wf, fc, ...droneMotors);
            return {
                droneFrame, droneMotors
            };
        }
    }
}

class DroneCtrl implements tesserxel.util.ctrl.IController {
    crashed = false;
    camLock = true;
    camCtrl: tesserxel.util.ctrl.KeepUpController;
    keyConfig = {
        up: "Space",
        down: "ShiftLeft",
        front: "KeyW",
        back: "KeyS",
        left: "KeyA",
        right: "KeyD",
        ana: "KeyQ",
        kata: "KeyE",
        turnLeft: "KeyJ",
        turnRight: "KeyL",
        turnAna: "KeyI",
        turnKata: "KeyK",
        spinCW: "KeyU|KeyZ",
        spinCCW: "KeyO|KeyX",
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
    // x- x+ z- z+ w- w+
    motors = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    rigid: tesserxel.physics.Rigid;
    hudDom: HTMLElement;

    automatic = false;

    vyPID: PIDCtrl;
    vwPID: PIDCtrl; twPID: PIDCtrl;
    vxPID: PIDCtrl; txPID: PIDCtrl;
    vzPID: PIDCtrl; tzPID: PIDCtrl;
    wxwPID: PIDCtrl;
    wxzPID: PIDCtrl;
    wzwPID: PIDCtrl;

    constructor(rigid: tesserxel.physics.Rigid, camCtrl: tesserxel.util.ctrl.KeepUpController, hudDom: HTMLElement) {
        this.rigid = rigid;
        this.camCtrl = camCtrl;
        this.hudDom = hudDom;
        this.vyPID = new PIDCtrl(0.01, 0.02, 0.002, 1 / 60);

        this.vwPID = new PIDCtrl(0.2, 0, 0.1, 1 / 60);
        this.vzPID = new PIDCtrl(0.2, 0, 0.1, 1 / 60);
        this.vxPID = new PIDCtrl(0.2, 0, 0.1, 1 / 60);

        this.twPID = new PIDCtrl(0.2, 0.0, 0.1, 1 / 60);
        this.tzPID = new PIDCtrl(0.2, 0.0, 0.1, 1 / 60);
        this.txPID = new PIDCtrl(0.2, 0.0, 0.1, 1 / 60);

        this.wxwPID = new PIDCtrl(0.1, 0.01, 0.05, 1 / 60);
        this.wxzPID = new PIDCtrl(0.1, 0.01, 0.05, 1 / 60);
        this.wzwPID = new PIDCtrl(0.1, 0.01, 0.05, 1 / 60);
    }
    update(state: tesserxel.util.ctrl.ControllerState): void {
        if (!this.crashed) this.checkState();
        if (state.isKeyHold("AltLeft")) return;
        if (state.isKeyHold(this.keyConfig.hudToggle)) {
            this.hudDom.style.display = this.hudDom.style.display === "none" ? "" : "none";
        }
        if (state.isKeyHold(this.keyConfig.automaticToggle)) {
            this.automatic = !this.automatic;
            this.motors.fill(0);
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
        if (this.camLock && !this.automatic) {
            const moveDelta = 0.003;
            if (state.isKeyHold(this.keyConfig.up)) {
                this.motors.fill(1);
            } else if (state.isKeyHold(this.keyConfig.down)) {
                this.motors.fill(-1);
            } else {
                this.motors.fill(0);
            }
            if (state.isKeyHold(this.keyConfig.back)) {
                this.motors[8] += moveDelta;
                this.motors[9] += moveDelta;
                this.motors[10] -= moveDelta;
                this.motors[11] -= moveDelta;
            }
            if (state.isKeyHold(this.keyConfig.front)) {
                this.motors[8] -= moveDelta;
                this.motors[9] -= moveDelta;
                this.motors[10] += moveDelta;
                this.motors[11] += moveDelta;
            }
            if (state.isKeyHold(this.keyConfig.right)) {
                this.motors[0] += moveDelta;
                this.motors[1] += moveDelta;
                this.motors[2] -= moveDelta;
                this.motors[3] -= moveDelta;
            }
            if (state.isKeyHold(this.keyConfig.left)) {
                this.motors[0] -= moveDelta;
                this.motors[1] -= moveDelta;
                this.motors[2] += moveDelta;
                this.motors[3] += moveDelta;
            }
            if (state.isKeyHold(this.keyConfig.ana)) {
                this.motors[4] += moveDelta;
                this.motors[5] += moveDelta;
                this.motors[6] -= moveDelta;
                this.motors[7] -= moveDelta;
            }
            if (state.isKeyHold(this.keyConfig.kata)) {
                this.motors[4] -= moveDelta;
                this.motors[5] -= moveDelta;
                this.motors[6] += moveDelta;
                this.motors[7] += moveDelta;
            }

            if (state.isKeyHold(this.keyConfig.turnRight)) {
                this.motors[4] -= moveDelta;
                this.motors[5] += moveDelta;
                this.motors[6] -= moveDelta;
                this.motors[7] += moveDelta;
            }
            if (state.isKeyHold(this.keyConfig.turnLeft)) {
                this.motors[4] += moveDelta;
                this.motors[5] -= moveDelta;
                this.motors[6] += moveDelta;
                this.motors[7] -= moveDelta;
            }
            if (state.isKeyHold(this.keyConfig.spinCW)) {
                this.motors[8] += moveDelta;
                this.motors[9] -= moveDelta;
                this.motors[10] += moveDelta;
                this.motors[11] -= moveDelta;
            }
            if (state.isKeyHold(this.keyConfig.spinCCW)) {
                this.motors[8] -= moveDelta;
                this.motors[9] += moveDelta;
                this.motors[10] -= moveDelta;
                this.motors[11] += moveDelta;
            }
            if (state.isKeyHold(this.keyConfig.turnKata)) {
                this.motors[0] -= moveDelta;
                this.motors[1] += moveDelta;
                this.motors[2] -= moveDelta;
                this.motors[3] += moveDelta;
            }
            if (state.isKeyHold(this.keyConfig.turnAna)) {
                this.motors[0] += moveDelta;
                this.motors[1] -= moveDelta;
                this.motors[2] += moveDelta;
                this.motors[3] -= moveDelta;
            }
            return;
        }
        if (!this.automatic) return;
        /* automatic */

        // sensors

        let vy = this.rigid.velocity.y;


        let tw = Math.asin(Vec4.w.rotate(this.rigid.rotation).y);

        let tx = Math.asin(Vec4.x.rotate(this.rigid.rotation).y);

        let tz = Math.asin(Vec4.z.rotate(this.rigid.rotation).y);

        let w = this.rigid.angularVelocity.clone().rotatesconj(this.rigid.rotation);

        // target

        const param = {
            vy: 20,
            vh: 0.20,
            w: 1
        };
        let targetVy = 0;
        let targetTw = 0;
        let targetTx = 0;
        let targetTz = 0;
        let targetWxw = 0;
        let targetWxz = 0;
        let targetWzw = 0;
        if (this.camLock) {
            if (state.isKeyHold(this.keyConfig.up)) {
                targetVy = param.vy;
            } else if (state.isKeyHold(this.keyConfig.down)) {
                targetVy = -param.vy;
            }
            if (state.isKeyHold(this.keyConfig.front)) {
                targetTw = param.vh;
            } else if (state.isKeyHold(this.keyConfig.back)) {
                targetTw = -param.vh;
            }

            if (state.isKeyHold(this.keyConfig.left)) {
                targetTx = param.vh;
            } else if (state.isKeyHold(this.keyConfig.right)) {
                targetTx = -param.vh;
            }

            if (state.isKeyHold(this.keyConfig.ana)) {
                targetTz = -param.vh;
            } else if (state.isKeyHold(this.keyConfig.kata)) {
                targetTz = param.vh;
            }
            if (state.isKeyHold(this.keyConfig.turnLeft)) {
                targetWxw = -param.w;
            } else if (state.isKeyHold(this.keyConfig.turnRight)) {
                targetWxw = param.w;
            }
            if (state.isKeyHold(this.keyConfig.spinCCW)) {
                targetWxz = param.w;
            } else if (state.isKeyHold(this.keyConfig.spinCW)) {
                targetWxz = -param.w;
            }
            if (state.isKeyHold(this.keyConfig.turnAna)) {
                targetWzw = param.w;
            } else if (state.isKeyHold(this.keyConfig.turnKata)) {
                targetWzw = -param.w;
            }
        }
        // ctrl

        this.motors.fill(this.vyPID.step(targetVy - vy));

        // const targetTw = 25 * Math.PI/180 * targetVw / 20 ;
        const maxTiltAngle = Math.PI / 180 * 40;

        // const targetTw = -Math.max(Math.min(this.vwPID.step(targetVw - vw), maxTiltAngle), -maxTiltAngle);
        const twMotorDelta = -this.twPID.step(targetTw - tw);
        this.rigid["tw"] = targetTw;

        // const targetTz = -Math.max(Math.min(this.vzPID.step(targetVz - vz), maxTiltAngle), -maxTiltAngle);
        const tzMotorDelta = -this.tzPID.step(targetTz - tz);
        this.rigid["tz"] = targetTz;

        // const targetTx = 0;-Math.max(Math.min(this.vxPID.step(targetVx - vx), maxTiltAngle), -maxTiltAngle);
        const txMotorDelta = -this.txPID.step(targetTx - tx);
        this.rigid["tx"] = targetTx;

        this.motors[0] += txMotorDelta;
        this.motors[1] += txMotorDelta;
        this.motors[2] -= txMotorDelta;
        this.motors[3] -= txMotorDelta;
        this.motors[4] += tzMotorDelta;
        this.motors[5] += tzMotorDelta;
        this.motors[6] -= tzMotorDelta;
        this.motors[7] -= tzMotorDelta;
        this.motors[8] += twMotorDelta;
        this.motors[9] += twMotorDelta;
        this.motors[10] -= twMotorDelta;
        this.motors[11] -= twMotorDelta;

        const wxwMotorDelta = -this.wxwPID.step(targetWxw - w.xw);

        this.motors[4] += wxwMotorDelta;
        this.motors[5] -= wxwMotorDelta;
        this.motors[6] += wxwMotorDelta;
        this.motors[7] -= wxwMotorDelta;

        const wxzMotorDelta = -this.wxwPID.step(targetWxz - w.xz);

        this.motors[8] += wxzMotorDelta;
        this.motors[9] -= wxzMotorDelta;
        this.motors[10] += wxzMotorDelta;
        this.motors[11] -= wxzMotorDelta;
        const wzwMotorDelta = this.wxwPID.step(targetWzw - w.zw);

        this.motors[0] += wzwMotorDelta;
        this.motors[1] -= wzwMotorDelta;
        this.motors[2] += wzwMotorDelta;
        this.motors[3] -= wzwMotorDelta;
        // limitation of motor output

        const limit = 4;
        for (let i = 0; i < this.motors.length; i++) {
            this.motors[i] = Math.max(Math.min(limit, this.motors[i]), -limit);
        }


        // this.rigid["data"] ??= "";
        // this.rigid["data"] += tx.toFixed(3) + "," + targetTx.toFixed(3) + "," + vx.toFixed(3) + "," + targetVx.toFixed(3) + ",";

    }
    private checkState() {
        if (this.rigid.velocity.norm1() < 0.001 && Vec4.y.rotateconj(this.rigid.rotation).y < -0.9) {
            alert("无人机底朝天坠毁了！请刷新页面重新开始！\n\nThe drone crashed upside down! Please refresh page to restart!");
            this.crashed = true;
        }
    }
}
class PIDCtrl {
    offset = 0;
    prev = NaN;
    p: number; i: number; d: number; dt: number;
    constructor(p: number, i: number, d: number, dt: number) {
        this.p = p; this.i = i; this.d = d; this.dt = dt;
    }
    step(error: number) {
        const delta = isNaN(this.prev) ? 0 : error - this.prev;
        this.prev = error;
        this.offset += error;
        return this.p * error + this.i * this.offset * this.dt + this.d * delta / this.dt;
    }
}
class DroneMecanism extends tesserxel.physics.Force {
    motors = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    speeds = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    rigid: tesserxel.physics.Rigid;
    constructor(ctrl: DroneCtrl) {
        super();
        this.motors = ctrl.motors;
        this.rigid = ctrl.rigid;
        // rigid.acceleration
    }
    vecUp = new Vec4;
    motorTorque = new Bivec;
    airTorque = new Bivec;
    coeffMotor = 1;
    coeffDamp = 0.15;
    constFriction = 0.0001;
    apply(time: number): void {

        // update motor speed
        for (let i = 0; i < this.speeds.length; i++) {
            // midpoint method
            const halfdelta = this.motors[i] * this.coeffMotor / 2;
            // torque on motor / 2
            this.speeds[i] += halfdelta;
            // air friction on fans
            this.speeds[i] -= Math.sign(this.speeds[i]) * (this.speeds[i] * this.speeds[i] * this.coeffDamp + this.constFriction);
            // torque on motor / 2
            this.speeds[i] += halfdelta;
        }

        // levitation force produced by fans
        const netForce = this.speeds.reduce((a, b) => a + b);
        // torque produced by fans
        this.calcTorque();

        // airfriction force of drone
        let windVelocity = this.rigid.velocity.rotateconj(this.rigid.rotation).negs();
        let windForce = windVelocity.set(windVelocity.x, windVelocity.y * 60, windVelocity.z, windVelocity.w);
        // airfriction torque of drone
        this.motorTorque.addmulfs(this.rigid.angularVelocity.clone().rotatesconj(this.rigid.rotation), -0.1);

        // total apply

        this.rigid.force.adds(this.vecUp.set(0, netForce).addmulfs(windForce, 0.01).rotates(this.rigid.rotation));
        this.rigid.torque.adds(this.motorTorque.rotates(this.rigid.rotation));
    }
    private calcTorque() {
        const k = 1;
        //  torque produced by fans linear levitation force
        this.motorTorque.set(
            -this.speeds[0] - this.speeds[1] + this.speeds[2] + this.speeds[3],
            0, 0,
            this.speeds[4] + this.speeds[5] - this.speeds[6] - this.speeds[7],
            this.speeds[8] + this.speeds[9] - this.speeds[10] - this.speeds[11],
        ); // omitted: mulfs droneFrameLength (t = f x L)
        // torque produced by fans rotation
        this.motorTorque.xz -= (this.speeds[8] - this.speeds[9] + this.speeds[10] - this.speeds[11]) * k;
        this.motorTorque.xw -= (this.speeds[4] - this.speeds[5] + this.speeds[6] - this.speeds[7]) * k;
        this.motorTorque.zw += (this.speeds[0] - this.speeds[1] + this.speeds[2] - this.speeds[3]) * k;
    }
}