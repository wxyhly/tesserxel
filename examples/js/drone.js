import * as tesserxel from "../../build/esm/tesserxel.js";
const FOUR = tesserxel.four;
const PHY = tesserxel.physics;
const Vec4 = tesserxel.math.Vec4;
const Obj4 = tesserxel.math.Obj4;
const Bivec = tesserxel.math.Bivec;
const geomTesseract = new FOUR.TesseractGeometry(1);
const lang = (new URLSearchParams(window.location.search.slice(1)).get("lang") ?? (navigator.languages.join(",").includes("zh") ? "zh" : "en"));
const DRONE_HUD_COLORS = {
    text: "#18540f",
    grid: "#76c96b",
    marker: "#b4cb01"
};
const DRONE_HUD_STROKE_WIDTHS = {
    thin: 1,
    marker: 3,
    motorMarker: 3
};
const DRONE_HUD_LAYOUT = {
    root: { top: 50, left: 0 },
    viewBox: { width: 300, height: 480 },
    vertical: {
        firstCenter: { x: 25, y: 55 },
        gapX: 48,
        halfLength: 40,
        tickSpacing: 12.5,
        text: { titleY: 12, valueY: 100, size: 8 },
        instruments: [
            { key: "height", step: 10, label: { zh: "高度", en: "HEIGHT" } },
            { key: "verticalSpeed", step: 5, label: { zh: "Y 速度", en: "Y VELOCITY" } },
            { key: "tiltY", step: 15, label: { zh: "Y 倾角", en: "Y TILT" } }
        ]
    },
    horizontalBar: {
        halfLength: 55,
        text: { titleOffsetY: -10, valueOffsetY: -10, size: 8 }
    },
    motorTransitionMs: 200,
    velocity: {
        firstCenter: { x: 70, y: 124 },
        gapY: 32,
        instruments: [
            { key: "velocityX", step: 2, label: { zh: "X(左右) 速度", en: "X(L-R) VELOCITY" } },
            { key: "velocityZ", step: 2, label: { zh: "Z(侧前后) 速度", en: "Z(A-K) VELOCITY" } },
            { key: "velocityW", step: 2, label: { zh: "W(前后) 速度", en: "W(F-B) VELOCITY" } }
        ]
    },
    attitude: {
        firstCenter: { x: 190, y: 124 },
        gapY: 32,
        instruments: [
            { key: "tiltX", step: 15, label: { zh: "X 倾角", en: "X TILT" } },
            { key: "tiltZ", step: 15, label: { zh: "Z 倾角", en: "Z TILT" } },
            { key: "tiltW", step: 15, label: { zh: "W 倾角", en: "W TILT" } }
        ]
    },
    motors: {
        firstCenter: { x: 70, y: 220 },
        gapX: 120,
        gapY: 32,
        halfLength: 55,
        limit: 4,
        pointerHalfWidth: 4,
        pointerOffsetY: 4,
        tickHalfHeight: 3,
        text: { titleOffsetY: -8, scaleOffsetY: 8, valueOffsetY: 14, axisX: 13, size: 7 },
        groups: [
            { axis: "X", negative: [0, 1], positive: [2, 3] },
            { axis: "Z", negative: [4, 5], positive: [6, 7] },
            { axis: "W", negative: [8, 9], positive: [10, 11] }
        ]
    },
    status: { x: 10, y: 310, lineGap: 14, size: 9 }
};
class DroneHud {
    values = new Map();
    tapes = new Map();
    motorMarkers = new Map();
    displayedMotors = null;
    lastMotorUpdate = 0;
    constructor(root) {
        root.style.cssText = `position:fixed;top:${DRONE_HUD_LAYOUT.root.top}px;left:${DRONE_HUD_LAYOUT.root.left}px;z-index:10;pointer-events:none;`;
        root.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${DRONE_HUD_LAYOUT.viewBox.width} ${DRONE_HUD_LAYOUT.viewBox.height}" width="${DRONE_HUD_LAYOUT.viewBox.width}" aria-label="Drone instruments" style="display:block;overflow:visible;background:transparent;--hud-text:${DRONE_HUD_COLORS.text};--hud-grid:${DRONE_HUD_COLORS.grid};--hud-marker:${DRONE_HUD_COLORS.marker};--hud-stroke-thin:${DRONE_HUD_STROKE_WIDTHS.thin};--hud-stroke-marker:${DRONE_HUD_STROKE_WIDTHS.marker};--hud-stroke-motor-marker:${DRONE_HUD_STROKE_WIDTHS.motorMarker}" font-family="system-ui,sans-serif" fill="var(--hud-text)">${this.createTextDrawings()}${this.createDrawings()}</svg>`;
        root.querySelectorAll("[data-hud-value]").forEach(element => {
            this.values.set(element.dataset.hudValue, element);
        });
        for (const instrument of [...DRONE_HUD_LAYOUT.vertical.instruments, ...DRONE_HUD_LAYOUT.velocity.instruments, ...DRONE_HUD_LAYOUT.attitude.instruments]) {
            this.tapes.set(instrument.key, root.querySelector(`[data-hud-tape="${instrument.key}"]`));
        }
        for (const group of DRONE_HUD_LAYOUT.motors.groups) {
            for (const sign of ["negative", "positive"]) {
                const key = `${group.axis}${sign}`;
                this.motorMarkers.set(key, Array.from(root.querySelectorAll(`[data-motor-marker="${key}"]`)));
            }
        }
    }
    createTextDrawings() {
        const text = (x, y, content, attrs = "") => `<text x="${x}" y="${y}" ${attrs}>${content}</text>`;
        const value = (x, y, key, size, anchor = "middle") => text(x, y, "", `font-size="${size}" text-anchor="${anchor}" data-hud-value="${key}"`);
        const vertical = DRONE_HUD_LAYOUT.vertical.instruments.map((instrument, index) => {
            const x = DRONE_HUD_LAYOUT.vertical.firstCenter.x + index * DRONE_HUD_LAYOUT.vertical.gapX;
            const layout = DRONE_HUD_LAYOUT.vertical.text;
            return text(x, layout.titleY, instrument.label[lang], `font-size="${layout.size}" text-anchor="middle"`)
                + value(x, layout.valueY, instrument.key, layout.size);
        }).join("");
        const horizontalText = (layout) => layout.instruments.map((instrument, index) => {
            const x = layout.firstCenter.x;
            const y = layout.firstCenter.y + index * layout.gapY;
            const bar = DRONE_HUD_LAYOUT.horizontalBar;
            return text(x - bar.halfLength, y + bar.text.titleOffsetY, instrument.label[lang], `font-size="${bar.text.size}"`)
                + value(x + bar.halfLength, y + bar.text.valueOffsetY, instrument.key, bar.text.size, "end");
        }).join("");
        const motors = DRONE_HUD_LAYOUT.motors.groups.map((group, row) => {
            const y = DRONE_HUD_LAYOUT.motors.firstCenter.y + row * DRONE_HUD_LAYOUT.motors.gapY;
            const textLayout = DRONE_HUD_LAYOUT.motors.text;
            return text(textLayout.axisX, y + 3, group.axis, `font-size="${textLayout.size}" font-weight="700"`)
                + ["negative", "positive"].map((sign, column) => {
                    const x = DRONE_HUD_LAYOUT.motors.firstCenter.x + column * DRONE_HUD_LAYOUT.motors.gapX;
                    const label = `${group.axis}${sign === "negative" ? "−" : "+"}`;
                    const key = `${group.axis}${sign}`;
                    return text(x, y + textLayout.titleOffsetY, label, `font-size="${textLayout.size}" text-anchor="middle"`)
                        + value(x, y + textLayout.valueOffsetY, `${key}Value`, textLayout.size);
                }).join("");
        }).join("");
        const status = DRONE_HUD_LAYOUT.status;
        return vertical + horizontalText(DRONE_HUD_LAYOUT.velocity) + horizontalText(DRONE_HUD_LAYOUT.attitude) + motors
            + text(status.x, status.y, "", `font-size="${status.size}" data-hud-value="status0"`)
            + text(status.x, status.y + status.lineGap, "", `font-size="${status.size}" data-hud-value="status1"`)
            + text(status.x, status.y + status.lineGap * 2, "", `font-size="${status.size}" data-hud-value="status2"`);
    }
    createDrawings() {
        const vertical = DRONE_HUD_LAYOUT.vertical.instruments.map((instrument, index) => {
            const x = DRONE_HUD_LAYOUT.vertical.firstCenter.x + index * DRONE_HUD_LAYOUT.vertical.gapX;
            const y = DRONE_HUD_LAYOUT.vertical.firstCenter.y;
            return `<line x1="${x}" y1="${y - DRONE_HUD_LAYOUT.vertical.halfLength}" x2="${x}" y2="${y + DRONE_HUD_LAYOUT.vertical.halfLength}"/><line x1="${x - 4}" y1="${y}" x2="${x + 4}" y2="${y}" stroke="var(--hud-marker)" stroke-width="var(--hud-stroke-marker)"/><g data-hud-tape="${instrument.key}"/>`;
        }).join("");
        const horizontal = (layout) => layout.instruments.map((instrument, index) => {
            const x = layout.firstCenter.x;
            const y = layout.firstCenter.y + index * layout.gapY;
            const halfLength = DRONE_HUD_LAYOUT.horizontalBar.halfLength;
            return `<line x1="${x - halfLength}" y1="${y}" x2="${x + halfLength}" y2="${y}"/><line x1="${x}" y1="${y - 4}" x2="${x}" y2="${y + 4}" stroke="var(--hud-marker)" stroke-width="var(--hud-stroke-marker)"/><g data-hud-tape="${instrument.key}"/>`;
        }).join("");
        const motors = DRONE_HUD_LAYOUT.motors.groups.map((group, row) => {
            const y = DRONE_HUD_LAYOUT.motors.firstCenter.y + row * DRONE_HUD_LAYOUT.motors.gapY;
            return ["negative", "positive"].map((sign, column) => {
                const x = DRONE_HUD_LAYOUT.motors.firstCenter.x + column * DRONE_HUD_LAYOUT.motors.gapX;
                const key = `${group.axis}${sign}`;
                const ticks = [-1, -0.5, 0, 0.5, 1].map(fraction => {
                    const tx = x + fraction * DRONE_HUD_LAYOUT.motors.halfLength;
                    const halfHeight = fraction === 0 ? 5 : DRONE_HUD_LAYOUT.motors.tickHalfHeight;
                    const scaleValue = fraction ** 3 * DRONE_HUD_LAYOUT.motors.limit;
                    const tickLabel = Number(scaleValue.toPrecision(2)).toString();
                    return `<line x1="${tx}" y1="${y - halfHeight}" x2="${tx}" y2="${y + halfHeight}" stroke="${fraction === 0 ? "var(--hud-marker)" : "var(--hud-grid)"}"/><text x="${tx}" y="${y + DRONE_HUD_LAYOUT.motors.text.scaleOffsetY}" text-anchor="middle" fill="var(--hud-text)" stroke="none" font-size="5">${tickLabel}</text>`;
                }).join("");
                return `<line x1="${x - DRONE_HUD_LAYOUT.motors.halfLength}" y1="${y}" x2="${x + DRONE_HUD_LAYOUT.motors.halfLength}" y2="${y}"/>${ticks}<line data-motor-marker="${key}" y1="${y - DRONE_HUD_LAYOUT.motors.pointerOffsetY}" y2="${y - DRONE_HUD_LAYOUT.motors.pointerOffsetY}" stroke="var(--hud-marker)" stroke-width="var(--hud-stroke-motor-marker)" stroke-linecap="round"/><line data-motor-marker="${key}" y1="${y + DRONE_HUD_LAYOUT.motors.pointerOffsetY}" y2="${y + DRONE_HUD_LAYOUT.motors.pointerOffsetY}" stroke="var(--hud-text)" stroke-width="var(--hud-stroke-motor-marker)" stroke-linecap="round"/>`;
            }).join("");
        }).join("");
        return `<g fill="none" stroke="var(--hud-grid)" stroke-width="var(--hud-stroke-thin)">${vertical}${horizontal(DRONE_HUD_LAYOUT.velocity)}${horizontal(DRONE_HUD_LAYOUT.attitude)}${motors}</g>`;
    }
    formatValue(value, digits = 1) {
        return Math.abs(value) < 0.5 * 10 ** -digits ? (0).toFixed(digits) : value.toFixed(digits);
    }
    update(data) {
        const motors = this.transitionMotors(data.motors);
        for (const [key, value] of Object.entries(data)) {
            if (typeof value !== "number")
                continue;
            const element = this.values.get(key);
            if (element)
                element.textContent = this.formatValue(value);
        }
        data.status.forEach((text, index) => {
            this.values.get(`status${index}`).textContent = text;
        });
        for (const instrument of DRONE_HUD_LAYOUT.vertical.instruments) {
            this.updateVerticalTape(instrument.key, data[instrument.key], instrument.step);
        }
        for (const layout of [DRONE_HUD_LAYOUT.velocity, DRONE_HUD_LAYOUT.attitude]) {
            for (const [index, instrument] of layout.instruments.entries()) {
                const value = data[instrument.key];
                const x = layout.firstCenter.x;
                const y = layout.firstCenter.y + index * layout.gapY;
                this.updateHorizontalTape(instrument.key, value, x, y, DRONE_HUD_LAYOUT.horizontalBar.halfLength, instrument.step);
            }
        }
        for (const group of DRONE_HUD_LAYOUT.motors.groups) {
            for (const sign of ["negative", "positive"]) {
                const indexes = group[sign];
                const key = `${group.axis}${sign}`;
                const markers = this.motorMarkers.get(key);
                const values = [motors[indexes[0]], motors[indexes[1]]];
                const x = DRONE_HUD_LAYOUT.motors.firstCenter.x + (sign === "negative" ? 0 : DRONE_HUD_LAYOUT.motors.gapX);
                values.forEach((motor, index) => {
                    const normalized = Math.max(-1, Math.min(1, motor / DRONE_HUD_LAYOUT.motors.limit));
                    const markerX = x + Math.sign(normalized) * Math.cbrt(Math.abs(normalized)) * DRONE_HUD_LAYOUT.motors.halfLength;
                    markers[index].setAttribute("x1", `${markerX - DRONE_HUD_LAYOUT.motors.pointerHalfWidth}`);
                    markers[index].setAttribute("x2", `${markerX + DRONE_HUD_LAYOUT.motors.pointerHalfWidth}`);
                });
                this.values.get(`${key}Value`).textContent = values.map(value => this.formatValue(value, 2)).join(" / ");
            }
        }
    }
    transitionMotors(target) {
        const now = performance.now();
        if (!this.displayedMotors) {
            this.displayedMotors = [...target];
            this.lastMotorUpdate = now;
            return this.displayedMotors;
        }
        const amount = 1 - Math.exp(-(now - this.lastMotorUpdate) / (DRONE_HUD_LAYOUT.motorTransitionMs / 3));
        this.lastMotorUpdate = now;
        this.displayedMotors = this.displayedMotors.map((value, index) => value + (target[index] - value) * amount);
        return this.displayedMotors;
    }
    updateHorizontalTape(key, value, centerX, centerY, halfLength, step) {
        const tape = this.tapes.get(key);
        const base = Math.round(value / step);
        const fraction = value / step - base;
        const tickSpacing = halfLength / 2;
        tape.innerHTML = "";
        for (let i = -2; i <= 2; i++) {
            const x = centerX + i * tickSpacing - fraction * tickSpacing;
            const tickValue = (base + i) * step;
            tape.insertAdjacentHTML("beforeend", `<line x1="${x}" y1="${centerY - 3}" x2="${x}" y2="${centerY + 3}" stroke="var(--hud-grid)"/><text x="${x}" y="${centerY + 9}" text-anchor="middle" fill="var(--hud-text)" stroke="none" font-size="5">${this.formatValue(tickValue, step < 1 ? 1 : 0)}</text>`);
        }
    }
    updateVerticalTape(key, value, step) {
        const tape = this.tapes.get(key);
        const index = DRONE_HUD_LAYOUT.vertical.instruments.findIndex(instrument => instrument.key === key);
        const x = DRONE_HUD_LAYOUT.vertical.firstCenter.x + index * DRONE_HUD_LAYOUT.vertical.gapX;
        const y = DRONE_HUD_LAYOUT.vertical.firstCenter.y;
        const base = Math.round(value / step);
        const fraction = value / step - base;
        tape.innerHTML = "";
        for (let i = -2; i <= 2; i++) {
            const tickY = y - i * DRONE_HUD_LAYOUT.vertical.tickSpacing + fraction * DRONE_HUD_LAYOUT.vertical.tickSpacing;
            const tickValue = (base + i) * step;
            tape.insertAdjacentHTML("beforeend", `<line x1="${x - 3}" y1="${tickY}" x2="${x + 3}" y2="${tickY}" stroke="var(--hud-grid)"/><text x="${x + 5}" y="${tickY + 2}" fill="var(--hud-text)" stroke="none" font-size="5">${this.formatValue(tickValue, 0)}</text>`);
        }
    }
}
export var drone;
(function (drone) {
    async function load() {
        const canvas = document.getElementById("gpu-canvas");
        const app = await FOUR.App.create({ canvas, controllerConfig: { preventDefault: true } });
        const renderer = app.renderer;
        renderer.core.setDisplayConfig({ opacity: 5 });
        renderer.setBackgroundColor([1, 1, 1, 1]);
        const scene = app.scene;
        const gnd = new FOUR.CubeGeometry(20000);
        scene.add(new FOUR.Mesh(gnd, new FOUR.LambertMaterial(new FOUR.CheckerTexture(new FOUR.CheckerTexture(new FOUR.CheckerTexture([1, 1, 1, 0.1], [0.9, 0.8, 0.8, 0.1], new FOUR.Vec4TransformNode(new FOUR.UVWVec4Input(), new Obj4(null, null, new Vec4(1000, 1000, 1000, 1000)))), [0.5, 0.3, 0.3, 0.1], new FOUR.Vec4TransformNode(new FOUR.UVWVec4Input(), new Obj4(null, null, new Vec4(100, 100, 100, 100)))), new FOUR.CheckerTexture(new FOUR.CheckerTexture([1, 1, 0.6, 0.1], [0.9, 0.8, 0.4, 0.1], new FOUR.Vec4TransformNode(new FOUR.UVWVec4Input(), new Obj4(null, null, new Vec4(1000, 1000, 1000, 1000)))), [0.3, 0.7, 0.7, 0.1], new FOUR.Vec4TransformNode(new FOUR.UVWVec4Input(), new Obj4(null, null, new Vec4(100, 100, 100, 100)))), new FOUR.Vec4TransformNode(new FOUR.UVWVec4Input(), new Obj4(null, null, new Vec4(10, 10, 10, 10)))))));
        const camera = app.camera;
        camera.near = 0.1;
        camera.far = 5000;
        scene.add(camera);
        scene.skyBox = new FOUR.SimpleSkyBox();
        scene.add(new FOUR.AmbientLight(0.2));
        scene.add(new FOUR.DirectionalLight([1.0, 0.9, 0.8], new Vec4(0.2, 1.0, 0.3, 0.4).norms()));
        const droneFrameParam = {
            frameLength: 1.2,
            frameThicknes: 0.08,
            frameWidth: 0.13,
            blockthicknes: 0.2,
            blockWidth: 0.41,
        };
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
        const freeCamCtrl = new tesserxel.ui.ctrl.KeepUpController(camera);
        const hud = document.createElement("div");
        const droneHud = new DroneHud(hud);
        const droneCtrl = new DroneCtrl(droneP, freeCamCtrl, hud);
        const droneMecanism = new DroneMecanism(droneCtrl);
        world.add(droneMecanism);
        app.controllerRegistry.add(freeCamCtrl);
        app.controllerRegistry.add(droneCtrl);
        const coeffFanrotAnimation = 1;
        const translate = {
            en: { "Automatic Mode": "Automatic Mode", "Manual Mode": "Manual Mode", "Drone Control": "Drone Control", "Camera Control": "Camera Control" },
            zh: { "Automatic Mode": "自动模式", "Manual Mode": "手动模式", "Drone Control": "控制无人机", "Camera Control": "控制相机" }
        }[lang];
        document.body.appendChild(hud);
        function run() {
            app.controllerRegistry.update();
            const st = app.controllerRegistry.states;
            const tr = tesserxel.ui.ctrl.shortcut2text;
            const degrees = (value) => value * 180 / Math.PI;
            const clampUnit = (value) => Math.max(-1, Math.min(1, value));
            const mode = droneCtrl.automatic ? translate["Automatic Mode"] : translate["Manual Mode"];
            const controlMode = droneCtrl.camLock ? translate["Drone Control"] : translate["Camera Control"];
            const modeKey = tr(lang, st.getActionKey("automaticToggle", "drone"));
            const controlKey = tr(lang, st.getActionKey("toggleCamlock", "drone"));
            const hudKey = tr(lang, st.getActionKey("hudToggle", "drone"));
            const status = lang === "zh"
                ? [`按${modeKey}切换：${mode}`, `按${controlKey}切换：${controlMode}`, `按${hudKey}隐藏HUD`]
                : [`Press ${modeKey}: ${mode}`, `Press ${controlKey}: ${controlMode}`, `Press ${hudKey}: hide HUD`];
            droneHud.update({
                height: droneP.position.y,
                verticalSpeed: droneP.velocity.y,
                velocityX: droneP.velocity.x,
                velocityZ: droneP.velocity.z,
                velocityW: droneP.velocity.w,
                tiltX: degrees(Math.acos(clampUnit(Vec4.x.rotate(droneP.rotation).y)) - Math.PI / 2),
                tiltY: degrees(Math.acos(clampUnit(Vec4.y.rotate(droneP.rotation).y))),
                tiltZ: degrees(Math.PI / 2 - Math.acos(clampUnit(Vec4.z.rotate(droneP.rotation).y))),
                tiltW: degrees(Math.PI / 2 - Math.acos(clampUnit(Vec4.w.rotate(droneP.rotation).y))),
                motors: droneCtrl.motors,
                status
            });
            engine.update(world, 1 / 60);
            animateDrone();
            if (droneCtrl.camLock) {
                if (droneCtrl.camPos !== -1)
                    freeCamCtrl.updateObj();
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
                freeCamCtrl.enabled = !droneCtrl.camLock;
                // freeCamCtrl.enabled = true;
                // freeCamCtrl.keyConfig = droneCtrl.camLock ? disableKeyConfig : defaultKeyConfig;
            }
            else {
                freeCamCtrl.enabled = false;
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
        function genDrone(param) {
            const droneFrame = new FOUR.Object();
            const stickMat = new FOUR.PhongMaterial([0.4, 0.3, 0.1, 1]);
            const centerMat = new FOUR.LambertMaterial([0.6, 0.6, 0.8, 0.8]);
            const fanMat = new FOUR.PhongMaterial([0.1, 0.1, 0.1, 50]);
            const xf = new FOUR.Mesh(geomTesseract, stickMat);
            xf.scale = new Vec4(param.frameLength, param.frameThicknes, param.frameWidth, param.frameWidth);
            const zf = new FOUR.Mesh(geomTesseract, stickMat).rotatesb(Bivec.xz.mulf(Math.PI / 2));
            zf.scale = new Vec4(param.frameLength, param.frameThicknes, param.frameWidth, param.frameWidth);
            const wf = new FOUR.Mesh(geomTesseract, stickMat).rotatesb(Bivec.xw.mulf(Math.PI / 2));
            wf.scale = new Vec4(param.frameLength, param.frameThicknes, param.frameWidth, param.frameWidth);
            const fc = new FOUR.Mesh(geomTesseract, centerMat);
            fc.scale = new Vec4(param.blockWidth, param.blockthicknes, param.blockWidth, param.blockWidth);
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
            motorx00.position.x = -distA;
            motorx00.rotatesb(Bivec.xz.mulf(Math.PI / 2));
            const motorx01 = genMotor();
            motorx01.position.x = -distB;
            motorx01.rotatesb(Bivec.zx.mulf(Math.PI / 2));
            const motorx10 = genMotor();
            motorx10.position.x = distA;
            motorx10.rotatesb(Bivec.xz.mulf(Math.PI / 2));
            const motorx11 = genMotor();
            motorx11.position.x = distB;
            motorx11.rotatesb(Bivec.zx.mulf(Math.PI / 2));
            const motorz00 = genMotor();
            motorz00.position.z = -distA;
            const motorz01 = genMotor();
            motorz01.rotatesb(Bivec.xz.mulf(Math.PI));
            motorz01.position.z = -distB;
            const motorz10 = genMotor();
            motorz10.position.z = distA;
            const motorz11 = genMotor();
            motorz11.rotatesb(Bivec.xz.mulf(Math.PI));
            motorz11.position.z = distB;
            const motorw00 = genMotor();
            motorw00.position.w = -distA;
            motorw00.rotatesb(Bivec.wz.mulf(Math.PI / 2));
            const motorw01 = genMotor();
            motorw01.position.w = -distB;
            motorw01.rotatesb(Bivec.zw.mulf(Math.PI / 2));
            const motorw10 = genMotor();
            motorw10.position.w = distA;
            motorw10.rotatesb(Bivec.wz.mulf(Math.PI / 2));
            const motorw11 = genMotor();
            motorw11.position.w = distB;
            motorw11.rotatesb(Bivec.zw.mulf(Math.PI / 2));
            const droneMotors = [
                motorx00, motorx01, motorx10, motorx11,
                motorz00, motorz01, motorz10, motorz11,
                motorw00, motorw01, motorw10, motorw11,
            ];
            droneFrame.add(xf, zf, wf, fc, ...droneMotors);
            return {
                droneFrame, droneMotors
            };
        }
    }
    drone.load = load;
})(drone || (drone = {}));
class DroneCtrl {
    crashed = false;
    camLock = true;
    camCtrl;
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
    };
    registGui(gui) {
        gui.keybindingMgr.addGroup("drone", {
            "title": {
                "zh": "无人机控制",
                "en": "Drone Control"
            },
            "actions": {
                "toggleCamlock": {
                    "title": { "zh": "切换控制模式", "en": "Toggle Control Mode" },
                    "key": "KeyB",
                    "press": true
                },
                "hudToggle": {
                    "title": { "zh": "切换HUD显示", "en": "Toggle HUD" },
                    "key": "KeyH",
                    "press": true
                },
                "automaticToggle": {
                    "title": { "zh": "切换自动/手动模式", "en": "Toggle Automatic Mode" },
                    "key": "KeyT",
                    "press": true
                },
                "up": {
                    "title": { "zh": "上升（高度）", "en": "Up (Height)" },
                    "key": "Space"
                },
                "down": {
                    "title": { "zh": "下降（高度）", "en": "Down (Height)" },
                    "key": "ShiftLeft"
                },
                "front": {
                    "title": { "zh": "前进", "en": "Forward" },
                    "key": "KeyW"
                },
                "back": {
                    "title": { "zh": "后退", "en": "Backward" },
                    "key": "KeyS"
                },
                "left": {
                    "title": { "zh": "左移", "en": "Move Left" },
                    "key": "KeyA"
                },
                "right": {
                    "title": { "zh": "右移", "en": "Move Right" },
                    "key": "KeyD"
                },
                "ana": {
                    "title": { "zh": "侧前移", "en": "Move Ana" },
                    "key": "KeyQ"
                },
                "kata": {
                    "title": { "zh": "侧后移", "en": "Move Kata" },
                    "key": "KeyE"
                },
                "turnLeft": {
                    "title": { "zh": "向左转", "en": "Turn Left" },
                    "key": "KeyJ"
                },
                "turnRight": {
                    "title": { "zh": "向右转", "en": "Turn Right" },
                    "key": "KeyL"
                },
                "turnAna": {
                    "title": { "zh": "向侧前转", "en": "Turn Ana" },
                    "key": "KeyI"
                },
                "turnKata": {
                    "title": { "zh": "向侧后转", "en": "Turn Kata" },
                    "key": "KeyK"
                },
                "spinCW": {
                    "title": { "zh": "顺时针自转", "en": "Spin Clockwise" },
                    "key": "KeyU|KeyZ"
                },
                "spinCCW": {
                    "title": { "zh": "逆时针自转", "en": "Spin Counterclockwise" },
                    "key": "KeyO|KeyX"
                },
                "camSpeedIncrease": {
                    "title": { "zh": "相机加速", "en": "Increase Camera Speed" },
                    "key": "Equal",
                    "press": true
                },
                "camSpeedDecrease": {
                    "title": { "zh": "相机减速", "en": "Decrease Camera Speed" },
                    "key": "Minus",
                    "press": true
                },
            },
            "groups": {
                "camPos": {
                    "title": {
                        "zh": "相机预设位置",
                        "en": "Camera Presets"
                    },
                    "actions": {
                        "1": {
                            "title": { "zh": "相机位置1", "en": "Camera Position 1" },
                            "key": "Digit1",
                            "press": true
                        },
                        "2": {
                            "title": { "zh": "相机位置2", "en": "Camera Position 2" },
                            "key": "Digit2",
                            "press": true
                        },
                        "3": {
                            "title": { "zh": "相机位置3", "en": "Camera Position 3" },
                            "key": "Digit3",
                            "press": true
                        },
                        "4": {
                            "title": { "zh": "相机位置4", "en": "Camera Position 4" },
                            "key": "Digit4",
                            "press": true
                        }
                    }
                }
            }
        });
    }
    camPos = -1;
    camSpeedAdjustFactor = 1.5;
    // x- x+ z- z+ w- w+
    motors = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    rigid;
    hudDom;
    automatic = false;
    vyPID;
    vwPID;
    twPID;
    vxPID;
    txPID;
    vzPID;
    tzPID;
    wxwPID;
    wxzPID;
    wzwPID;
    constructor(rigid, camCtrl, hudDom) {
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
    update(state) {
        if (!this.crashed)
            this.checkState();
        if (state.isActionActive("hudToggle", "drone")) {
            this.hudDom.style.display = this.hudDom.style.display === "none" ? "" : "none";
        }
        if (state.isActionActive("automaticToggle", "drone")) {
            this.automatic = !this.automatic;
            this.motors.fill(0);
        }
        if (state.isActionActive("toggleCamlock", "drone")) {
            this.camLock = !this.camLock;
            this.camPos = -1;
        }
        for (let i = 0; i < 4; i++) {
            if (state.isActionActive("camPos." + (i + 1), "drone")) {
                this.camPos = i === 3 ? -1 : i;
                if (i !== 3)
                    this.camLock = true;
            }
        }
        if (!this.camLock) {
            if (state.isActionActive("camSpeedDecrease", "drone")) {
                this.camCtrl.keyMoveSpeed /= this.camSpeedAdjustFactor;
            }
            if (state.isActionActive("camSpeedIncrease", "drone")) {
                this.camCtrl.keyMoveSpeed *= this.camSpeedAdjustFactor;
            }
        }
        if (this.camLock && !this.automatic) {
            const moveDelta = 0.003;
            if (state.isActionActive("up", "drone")) {
                this.motors.fill(1);
            }
            else if (state.isActionActive("down", "drone")) {
                this.motors.fill(-1);
            }
            else {
                this.motors.fill(0);
            }
            if (state.isActionActive("back", "drone")) {
                this.motors[8] += moveDelta;
                this.motors[9] += moveDelta;
                this.motors[10] -= moveDelta;
                this.motors[11] -= moveDelta;
            }
            if (state.isActionActive("front", "drone")) {
                this.motors[8] -= moveDelta;
                this.motors[9] -= moveDelta;
                this.motors[10] += moveDelta;
                this.motors[11] += moveDelta;
            }
            if (state.isActionActive("right", "drone")) {
                this.motors[0] += moveDelta;
                this.motors[1] += moveDelta;
                this.motors[2] -= moveDelta;
                this.motors[3] -= moveDelta;
            }
            if (state.isActionActive("left", "drone")) {
                this.motors[0] -= moveDelta;
                this.motors[1] -= moveDelta;
                this.motors[2] += moveDelta;
                this.motors[3] += moveDelta;
            }
            if (state.isActionActive("ana", "drone")) {
                this.motors[4] += moveDelta;
                this.motors[5] += moveDelta;
                this.motors[6] -= moveDelta;
                this.motors[7] -= moveDelta;
            }
            if (state.isActionActive("kata", "drone")) {
                this.motors[4] -= moveDelta;
                this.motors[5] -= moveDelta;
                this.motors[6] += moveDelta;
                this.motors[7] += moveDelta;
            }
            if (state.isActionActive("turnRight", "drone")) {
                this.motors[4] -= moveDelta;
                this.motors[5] += moveDelta;
                this.motors[6] -= moveDelta;
                this.motors[7] += moveDelta;
            }
            if (state.isActionActive("turnLeft", "drone")) {
                this.motors[4] += moveDelta;
                this.motors[5] -= moveDelta;
                this.motors[6] += moveDelta;
                this.motors[7] -= moveDelta;
            }
            if (state.isActionActive("spinCW", "drone")) {
                this.motors[8] += moveDelta;
                this.motors[9] -= moveDelta;
                this.motors[10] += moveDelta;
                this.motors[11] -= moveDelta;
            }
            if (state.isActionActive("spinCCW", "drone")) {
                this.motors[8] -= moveDelta;
                this.motors[9] += moveDelta;
                this.motors[10] -= moveDelta;
                this.motors[11] += moveDelta;
            }
            if (state.isActionActive("turnKata", "drone")) {
                this.motors[0] -= moveDelta;
                this.motors[1] += moveDelta;
                this.motors[2] -= moveDelta;
                this.motors[3] += moveDelta;
            }
            if (state.isActionActive("turnAna", "drone")) {
                this.motors[0] += moveDelta;
                this.motors[1] -= moveDelta;
                this.motors[2] += moveDelta;
                this.motors[3] -= moveDelta;
            }
            return;
        }
        if (!this.automatic)
            return;
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
            if (state.isActionActive("up", "drone")) {
                targetVy = param.vy;
            }
            else if (state.isActionActive("down", "drone")) {
                targetVy = -param.vy;
            }
            if (state.isActionActive("front", "drone")) {
                targetTw = param.vh;
            }
            else if (state.isActionActive("back", "drone")) {
                targetTw = -param.vh;
            }
            if (state.isActionActive("left", "drone")) {
                targetTx = param.vh;
            }
            else if (state.isActionActive("right", "drone")) {
                targetTx = -param.vh;
            }
            if (state.isActionActive("ana", "drone")) {
                targetTz = -param.vh;
            }
            else if (state.isActionActive("kata", "drone")) {
                targetTz = param.vh;
            }
            if (state.isActionActive("turnLeft", "drone")) {
                targetWxw = -param.w;
            }
            else if (state.isActionActive("turnRight", "drone")) {
                targetWxw = param.w;
            }
            if (state.isActionActive("spinCCW", "drone")) {
                targetWxz = param.w;
            }
            else if (state.isActionActive("spinCW", "drone")) {
                targetWxz = -param.w;
            }
            if (state.isActionActive("turnAna", "drone")) {
                targetWzw = param.w;
            }
            else if (state.isActionActive("turnKata", "drone")) {
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
    checkState() {
        if (this.rigid.velocity.norm1() < 0.001 && Vec4.y.rotateconj(this.rigid.rotation).y < -0.9) {
            alert("无人机底朝天坠毁了！请刷新页面重新开始！\n\nThe drone crashed upside down! Please refresh page to restart!");
            this.crashed = true;
        }
    }
}
class PIDCtrl {
    offset = 0;
    prev = NaN;
    p;
    i;
    d;
    dt;
    constructor(p, i, d, dt) {
        this.p = p;
        this.i = i;
        this.d = d;
        this.dt = dt;
    }
    step(error) {
        const delta = isNaN(this.prev) ? 0 : error - this.prev;
        this.prev = error;
        this.offset += error;
        return this.p * error + this.i * this.offset * this.dt + this.d * delta / this.dt;
    }
}
class DroneMecanism extends tesserxel.physics.Force {
    motors = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    speeds = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    rigid;
    constructor(ctrl) {
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
    apply(time) {
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
    calcTorque() {
        const k = 1;
        //  torque produced by fans linear levitation force
        this.motorTorque.set(-this.speeds[0] - this.speeds[1] + this.speeds[2] + this.speeds[3], 0, 0, this.speeds[4] + this.speeds[5] - this.speeds[6] - this.speeds[7], this.speeds[8] + this.speeds[9] - this.speeds[10] - this.speeds[11]); // omitted: mulfs droneFrameLength (t = f x L)
        // torque produced by fans rotation
        this.motorTorque.xz -= (this.speeds[8] - this.speeds[9] + this.speeds[10] - this.speeds[11]) * k;
        this.motorTorque.xw -= (this.speeds[4] - this.speeds[5] + this.speeds[6] - this.speeds[7]) * k;
        this.motorTorque.zw += (this.speeds[0] - this.speeds[1] + this.speeds[2] - this.speeds[3]) * k;
    }
}
//# sourceMappingURL=drone.js.map