import { Obj4 } from '../math/algebra/affine.js';
import { Bivec } from '../math/algebra/bivec.js';
import { Mat4 } from '../math/algebra/mat4.js';
import { Quaternion } from '../math/algebra/quaternion.js';
import { Rotor } from '../math/algebra/rotor.js';
import { Vec2 } from '../math/algebra/vec2.js';
import { Vec3 } from '../math/algebra/vec3.js';
import { Vec4 } from '../math/algebra/vec4.js';
import { _SQRT_3, _90, _DEG2RAD, _360 } from '../math/const.js';
import { RetinaSliceFacing, EyeStereo } from '../render/slice/interfaces.js';
import '../render/slice/renderer.js';
import '../vendor/wgsl_reflect.module.js';
import { SettingGUI } from './gui.js';
import { StorageManager } from './storage.js';
export { shortcut2text } from './keybind.js';

const SVG_HEADER = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='`;
const SVG_LINE = `style="fill:none;stroke:#FFF;stroke-width:0.25;"`;
var KeyState;
(function (KeyState) {
    KeyState[KeyState["NONE"] = 0] = "NONE";
    KeyState[KeyState["UP"] = 1] = "UP";
    KeyState[KeyState["HOLD"] = 2] = "HOLD";
    KeyState[KeyState["DOWN"] = 3] = "DOWN";
})(KeyState || (KeyState = {}));
class ControllerRegistry {
    dom;
    gui;
    ctrls;
    enablePointerLock;
    storage = new StorageManager();
    states = {
        currentKeys: new Map(),
        isPointerLockedMouseDown: false,
        isPointerLockEscaped: false,
        currentBtn: -1,
        mouseDown: -1,
        mouseUp: -1,
        updateCount: 0,
        moveX: 0,
        moveY: 0,
        mouseX: 0,
        mouseY: 0,
        wheelX: 0,
        wheelY: 0,
        mspf: -1,
        storage: this.storage,
        isActionHold: (_) => false,
        isActionActive: (_) => false,
        isKeyHold: (_) => false,
        getActionKey: (_) => "",
        requestPointerLock: () => false,
        isPointerLocked: () => false,
        exitPointerLock: () => { },
        enabledCtrlPath: []
    };
    /** if this is true, prevent default will not work  */
    disableDefaultEvent = false;
    iconSize = 32;
    prevIsPointerLocked = false;
    evMouseDown;
    evMouseUp;
    evMouseMove;
    evWheel;
    evKeyUp;
    evKeyDown;
    evContextMenu;
    constructor(dom, ctrls, config) {
        this.gui = new SettingGUI(this);
        this.initGUI();
        this.dom = dom;
        dom.tabIndex = 1;
        this.ctrls = ctrls;
        ctrls.forEach(ctrl => ctrl.registGui && ctrl.registGui(this.gui));
        this.enablePointerLock = config?.enablePointerLock ?? false;
        const keyMap = this.gui.keybindingMgr.data.keyIndex;
        this.states.isActionHold = (action, path) => (this.states.isKeyHold(keyMap[path + "." + action]) || this.states.currentKeys.get(path + "." + action) === KeyState.DOWN);
        this.states.isActionActive = (action, path) => {
            const str = path + "." + action;
            // direct triggered by event name, not keys
            if (this.states.currentKeys.get(str) === KeyState.DOWN)
                return true;
            if (this.states.currentKeys.get("." + str))
                return true;
            const enable = keyMap[path + ".enable"];
            const otherEnabled = this.states.enabledCtrlPath.length && !this.states.enabledCtrlPath.includes(path);
            return this.states.isKeyHold(keyMap[str]) && (!enable || this.states.isKeyHold(enable)) && !this.states.isKeyHold(keyMap[path + ".disable"]) && !otherEnabled;
        };
        this.states.getActionKey = (action, path) => keyMap[path + "." + action];
        this.states.isKeyHold = (code) => {
            if (this.gui.isOpen() || !code)
                return false;
            if (code.includes("|")) {
                for (let key of code.split("|")) {
                    if (this.states.isKeyHold(key))
                        return true;
                }
                return false;
            }
            for (let key of code.split("+")) {
                if (key[0] === '.') {
                    let state = this.states.currentKeys.get(key.slice(1));
                    if (state !== KeyState.DOWN)
                        return false;
                }
                else {
                    let state = this.states.currentKeys.get(key);
                    if (!state || state === KeyState.UP)
                        return false;
                }
            }
            return true;
        };
        this.states.isPointerLocked = () => {
            return ((!this.states.isPointerLockedMouseDown) && document.pointerLockElement === this.dom);
        };
        this.states.exitPointerLock = () => {
            if (document.pointerLockElement === this.dom) {
                document.exitPointerLock();
                // if we exit positively, then don't trigger isPointerLockEscaped in the next update
                this.prevIsPointerLocked = false;
            }
        };
        this.states.requestPointerLock = () => {
            if (document.pointerLockElement !== dom) {
                dom.requestPointerLock();
            }
        };
        // regist events
        this.evMouseDown = (ev) => {
            if (this.enablePointerLock && document.pointerLockElement !== dom) {
                dom.requestPointerLock();
                this.states.isPointerLockedMouseDown = true;
            }
            else {
                dom.focus();
            }
            if (this.gui.isOpen())
                return false;
            this.states.currentBtn = ev.button;
            this.states.moveX = 0;
            this.states.moveY = 0;
            this.states.mouseDown = ev.button;
            if (ev.altKey === false) {
                this.states.currentKeys.set("AltLeft", KeyState.NONE);
                this.states.currentKeys.set("AltRight", KeyState.NONE);
            }
            // left click should not be prevented, otherwise keydown event can't obtain focus
            if (ev.button === 1 && config?.preventDefault === true) {
                ev.preventDefault();
                ev.stopPropagation();
            }
        };
        this.evMouseMove = (ev) => {
            if (this.gui.isOpen())
                return false;
            this.states.moveX += ev.movementX;
            this.states.moveY += ev.movementY;
            this.states.mouseX = ev.offsetX;
            this.states.mouseY = ev.offsetY;
        };
        this.evMouseUp = (ev) => {
            this.states.currentBtn = -1;
            this.states.mouseUp = ev.button;
        };
        this.evKeyDown = (ev) => {
            let prevState = this.states.currentKeys.get(ev.code);
            this.states.currentKeys.set(ev.code, prevState === KeyState.HOLD ? KeyState.HOLD : KeyState.DOWN);
            if (ev.altKey === false) {
                this.states.currentKeys.set("AltLeft", KeyState.NONE);
                this.states.currentKeys.set("AltRight", KeyState.NONE);
            }
            if ((ev.altKey === true || ev.ctrlKey === true) && this.disableDefaultEvent) {
                ev.preventDefault();
                ev.stopPropagation();
            }
        };
        this.evKeyUp = (ev) => {
            this.states.currentKeys.set(ev.code, KeyState.UP);
            if ((ev.altKey === true || ev.ctrlKey === true) && this.disableDefaultEvent) {
                ev.preventDefault();
                ev.stopPropagation();
            }
        };
        this.evWheel = (ev) => {
            if (this.gui.isOpen())
                return false;
            this.states.wheelX = ev.deltaX;
            this.states.wheelY = ev.deltaY;
        };
        // mouse events are restricted in dom (canvas)
        dom.addEventListener("mousedown", this.evMouseDown);
        dom.addEventListener("mousemove", this.evMouseMove);
        dom.addEventListener("mouseup", this.evMouseUp);
        // but wheel and key event do not require focus on dom(canvas)
        document.body.addEventListener("keydown", this.evKeyDown);
        document.body.addEventListener("keyup", this.evKeyUp);
        document.body.addEventListener("wheel", this.evWheel);
        if (config?.preventDefault === true) {
            this.evContextMenu = (ev) => {
                if (!this.disableDefaultEvent) {
                    ev.preventDefault();
                    ev.stopPropagation();
                }
            };
            dom.addEventListener("contextmenu", this.evContextMenu);
        }
    }
    initGUI() {
        this.gui;
        // const settingBtn = gui.addLvl1Button({
        //     name: "main",
        //     svgIcon: `${SVG_HEADER}0.6 0.5 4.5 4.5'><g ${SVG_LINE}><path d="M 1.9,4.53 1.4,4.24 1.51,3.73 C 1.43,3.65 1.36,3.56 1.3,3.46 L 0.77,3.43 0.62,2.87 1.07,2.58 C 1.07,2.47 1.08,2.36 1.11,2.25 L 0.76,1.84 1.05,1.34 1.56,1.45 C 1.64,1.37 1.73,1.3 1.83,1.24 L 1.86,0.71 2.42,0.56 2.71,1 c 0.11,0 0.23,0.02 0.34,0.04 L 3.45,0.7 3.95,0.99 3.84,1.5 c 0.08,0.08 0.15,0.17 0.21,0.27 l 0.53,0.03 0.15,0.56 -0.44,0.3 c 0,0.11 -0.02,0.23 -0.04,0.34 L 4.59,3.37 4.3,3.88 3.79,3.77 C 3.7,3.85 3.61,3.91 3.52,3.97 L 3.48,4.5 2.92,4.65 2.63,4.21 C 2.53,4.2 2.41,4.19 2.3,4.16 Z"/><circle cx="2.67" cy="2.62" r="1"/></g></svg>`,
        //     title: { zh: "显示/隐藏总控设置", en: "Toggle Main Ctrl Settings" }
        // });
        // const settingPanel = this.gui.addLvl2Panel(settingBtn);
        // const sizePlusBtn = this.gui.addLvl2Button({
        //     name: "btn_size_plus", svgIcon: `${SVG_HEADER}0.5 0.3 4.5 4.5'><g ${SVG_LINE}><text x="2" y="3.5" font-size="3">A</text></g></svg>`, title: { zh: "增大按钮尺寸", en: "increase Button Size" }
        // }, settingPanel);
        // const sizeMinusBtn = this.gui.addLvl2Button({
        //     name: "btn_size_minus", svgIcon: `${SVG_HEADER}0.5 0.3 4.5 4.5'><g ${SVG_LINE}><text x="2.5" y="3" font-size="1.5">A</text></g></svg>`, title: { zh: "减小按钮尺寸", en: "decrease Button Size" }
        // }, settingPanel);
        const t = '<rect width="1" height="1" x="';
        const keybindBtn = this.gui.addLvl1Button({
            name: "shortcut_set", svgIcon: `${SVG_HEADER}0.5 0.3 4.5 4.5'><g ${SVG_LINE}>${t}2" y="2"/>${t}3.9" y="3.3"/>${t}1.3" y="3.3"/>${t}2.6" y="3.3"/>${t}3.3" y="2"/>${t}0.7" y="2"/></g></svg>`, title: { zh: "键位设置", en: "Key Bindings" }
        });
        // const preferenceBtn = this.gui.addLvl2Button({
        //     name: "preferenceBtn", svgIcon: `${SVG_HEADER}0.5 0.3 4.5 4.5'><g ${SVG_LINE}>${t}2" y="2"/>${t}3.9" y="3.3"/>${t}1.3" y="3.3"/>${t}2.6" y="3.3"/>${t}3.3" y="2"/>${t}0.7" y="2"/></g></svg>`, title: { zh: "偏好设置", en: "Preferences" }
        // }, settingPanel);
        // preferenceBtn.addEventListener("click", e => this.gui.openPreferenceMgr());
        keybindBtn.addEventListener("click", e => this.gui.openKeybindMgr());
        // sizePlusBtn.addEventListener("click", e => this.gui.increaseBtnSize());
        // sizeMinusBtn.addEventListener("click", e => this.gui.decreaseBtnSize());
    }
    add(ctrl) {
        this.ctrls.push(ctrl);
        if (ctrl.registGui)
            ctrl.registGui(this.gui);
    }
    remove(ctrl) {
        this.ctrls = this.ctrls.filter(c => c !== ctrl);
    }
    unregist() {
        this.dom.removeEventListener("mousedown", this.evMouseDown);
        this.dom.removeEventListener("mousemove", this.evMouseMove);
        this.dom.removeEventListener("mouseup", this.evMouseUp);
        this.dom.removeEventListener("keydown", this.evKeyDown);
        this.dom.removeEventListener("keyup", this.evKeyUp);
        this.dom.removeEventListener("wheel", this.evWheel);
        if (this.evContextMenu)
            this.dom.removeEventListener("contextmenu", this.evContextMenu);
    }
    update() {
        this.states.enablePointerLock = this.enablePointerLock;
        this.states.isPointerLockEscaped = this.prevIsPointerLocked && !this.states.isPointerLocked();
        if (!this.states.lastUpdateTime) {
            this.states.mspf = 16.667;
            let now = new Date().getTime();
            this.states.lastUpdateTime = now;
        }
        else {
            let now = new Date().getTime();
            this.states.mspf = now - this.states.lastUpdateTime;
            this.states.lastUpdateTime = now;
        }
        for (let c of this.ctrls) {
            if (c.enabled !== false)
                c.update(this.states);
        }
        this.states.mouseDown = -1;
        this.states.mouseUp = -1;
        this.states.moveX = 0;
        this.states.moveY = 0;
        this.states.wheelX = 0;
        this.states.wheelY = 0;
        this.states.updateCount++;
        this.states.isPointerLockedMouseDown = false;
        this.prevIsPointerLocked = this.states.isPointerLocked();
        for (let [key, prevState] of this.states.currentKeys) {
            let newState = prevState;
            if (prevState === KeyState.DOWN) {
                newState = KeyState.HOLD;
            }
            else if (prevState === KeyState.UP) {
                newState = KeyState.NONE;
            }
            this.states.currentKeys.set(key, newState);
        }
        this.states.enabledCtrlPath.length = 0;
        for (const [a, b] of Object.entries(this.gui.keybindingMgr.data.keyIndex)) {
            if (!a.match(/^[^\.]+\.enable$/))
                continue;
            if (this.states.isKeyHold(b)) {
                this.states.enabledCtrlPath.push(a.replace(/\.enable$/, ""));
            }
        }
    }
}
class TrackBallController {
    center = new Vec4();
    enabled = true;
    object = new Obj4(Vec4.w.neg());
    mouseSpeed = 0.01;
    wheelSpeed = 0.0001;
    damp = 0.1;
    mouseButton3D = 0;
    mouseButtonRoll = 1;
    mouseButton4D = 2;
    /** how many update cycles (2^n) to normalise rotor to avoid accuracy problem */
    normalisePeriodBit;
    keyConfig = {
        disable: "",
        enable: "",
    };
    cameraMode = false;
    _bivec = new Bivec();
    normalisePeriodMask = 15;
    constructor(object, cameraMode) {
        if (object)
            this.object = object;
        this.cameraMode = cameraMode ?? false;
    }
    update(state) {
        let disabled = state.isKeyHold(this.keyConfig.disable) || !this.enabled || !(!state.enabledCtrlPath.length || state.enabledCtrlPath.includes("keepup"));
        let dampFactor = Math.exp(-this.damp * Math.min(200.0, state.mspf));
        this.object.position.subs(this.center);
        if (!disabled) {
            let dx = state.moveX * this.mouseSpeed;
            let dy = -state.moveY * this.mouseSpeed;
            let wy = state.wheelY * this.wheelSpeed;
            switch (state.currentBtn) {
                case this.mouseButton3D:
                    this._bivec.set(0, dx, 0, dy);
                    break;
                case this.mouseButtonRoll:
                    this._bivec.set(dx, 0, 0, 0, 0, dy);
                    break;
                case this.mouseButton4D:
                    this._bivec.set(0, 0, dx, 0, dy);
                    break;
                default:
                    this._bivec.mulfs(dampFactor);
            }
            this.object.position.mulfs(1 + wy);
        }
        else {
            this._bivec.mulfs(dampFactor);
        }
        const rotor = this._bivec.exp();
        if (this.cameraMode) {
            rotor.mulsrconj(this.object.rotation).mulsl(this.object.rotation);
            this.object.rotates(rotor);
            this.object.position.rotates(rotor);
        }
        else {
            this.object.rotates(rotor);
        }
        if ((state.updateCount & this.normalisePeriodMask) === 0) {
            this.object.rotation.norms();
        }
        this.object.position.adds(this.center);
    }
    lookAtCenter() {
        this.object.lookAt(Vec4.wNeg, this.center);
    }
    registGui(gui) {
        gui.keybindingMgr.addGroup("trackballctrl", {
            title: { zh: "轨迹球控制", en: "Trackball Ctrl" },
            actions: {
                enable: {
                    title: { zh: "按住启用控制", en: "Hold to Enable" },
                    key: ""
                },
                disable: {
                    title: { zh: "按住禁用控制", en: "Hold to Disable" },
                    key: ""
                },
            }
        });
    }
}
class FreeFlyController {
    enabled = true;
    swapMouseYWithScrollY = false;
    object = new Obj4();
    mouseSpeed = 0.01;
    wheelSpeed = 0.0005;
    keyMoveSpeed = 0.001;
    keyRotateSpeed = 0.001;
    damp = 0.01;
    constructor(object) {
        if (object)
            this.object = object;
    }
    /** how many update cycles (2^n) to normalise rotor to avoid accuracy problem */
    normalisePeriodBit;
    _bivec = new Bivec();
    _bivecKey = new Bivec();
    _moveVec = new Vec4();
    _vec = new Vec4();
    normalisePeriodMask = 15;
    registGui(gui) {
        gui.keybindingMgr.addGroup("freefly", {
            title: { zh: "自由飞行相机控制", en: "Free Fly Cam Ctrl" },
            actions: {
                enable: {
                    title: { zh: "按住启用控制", en: "Hold to Enable" },
                    key: ""
                },
                disable: {
                    title: { zh: "按住禁用控制", en: "Hold to Disable" },
                    key: ""
                },
                front: {
                    title: { zh: "前进", en: "Move Forward" },
                    key: "KeyW"
                },
                back: {
                    title: { zh: "后退", en: "Move Backward" },
                    key: "KeyS"
                },
                left: {
                    title: { zh: "左移", en: "Move Left" },
                    key: "KeyA"
                },
                right: {
                    title: { zh: "右移", en: "Move Right" },
                    key: "KeyD"
                },
                ana: {
                    title: { zh: "侧前移", en: "Move Ana" },
                    key: "KeyQ"
                },
                kata: {
                    title: { zh: "侧后移", en: "Move Kata" },
                    key: "KeyE"
                },
                up: {
                    title: { zh: "上移", en: "Move Up" },
                    key: "Space"
                },
                down: {
                    title: { zh: "下移", en: "Move Down" },
                    key: "ShiftLeft"
                },
                turnLeft: {
                    title: { zh: "左转", en: "Turn Left" },
                    key: "KeyJ"
                },
                turnRight: {
                    title: { zh: "右转", en: "Turn Right" },
                    key: "KeyL"
                },
                turnAna: {
                    title: { zh: "侧前转", en: "Turn Ana" },
                    key: "KeyU"
                },
                turnKata: {
                    title: { zh: "侧后转", en: "Turn Kata" },
                    key: "KeyO"
                },
                turnUp: {
                    title: { zh: "向上转", en: "Turn Up" },
                    key: "KeyI"
                },
                turnDown: {
                    title: { zh: "向下转", en: "Turn Down" },
                    key: "KeyK"
                },
                spinCW: {
                    title: { zh: "顺时针自转", en: "Spin Clockwise" },
                    key: "KeyF|KeyZ"
                },
                spinCCW: {
                    title: { zh: "逆时针自转", en: "Spin Counterclockwise" },
                    key: "KeyH|KeyX"
                },
                rollCW: {
                    title: { zh: "顺时针翻滚", en: "Roll Clockwise" },
                    key: "KeyR"
                },
                rollCCW: {
                    title: { zh: "逆时针翻滚", en: "Roll Counterclockwise" },
                    key: "KeyY"
                },
                pitchCW: {
                    title: { zh: "顺时针俯仰", en: "Pitch Clockwise" },
                    key: "KeyG"
                },
                pitchCCW: {
                    title: { zh: "逆时针俯仰", en: "Pitch Counterclockwise" },
                    key: "KeyT"
                },
            }
        });
    }
    update(state) {
        let enabled = (!state.getActionKey("enable", "freefly") || state.isActionHold("enable", "freefly")) && this.enabled && !state.isActionHold("disable", "freefly") && (!state.enabledCtrlPath.length || state.enabledCtrlPath.includes("keepup"));
        const on = (k) => state.isActionActive(k, "freefly");
        let delta;
        let dampFactor = Math.exp(-this.damp * Math.min(200.0, state.mspf));
        if (enabled) {
            let keyRotateSpeed = this.keyRotateSpeed * state.mspf;
            delta = (on("pitchCW") ? -1 : 0) + (on("pitchCCW") ? 1 : 0);
            if (delta)
                this._bivecKey.yz = delta * keyRotateSpeed;
            delta = (on("spinCW") ? -1 : 0) + (on("spinCCW") ? 1 : 0);
            if (delta)
                this._bivecKey.xz = delta * keyRotateSpeed;
            delta = (on("rollCW") ? -1 : 0) + (on("rollCCW") ? 1 : 0);
            if (delta)
                this._bivecKey.xy = delta * keyRotateSpeed;
            delta = (on("turnLeft") ? -1 : 0) + (on("turnRight") ? 1 : 0);
            if (delta)
                this._bivecKey.xw = delta * keyRotateSpeed;
            delta = (on("turnUp") ? 1 : 0) + (on("turnDown") ? -1 : 0);
            if (delta)
                this._bivecKey.yw = delta * keyRotateSpeed;
            delta = (on("turnAna") ? -1 : 0) + (on("turnKata") ? 1 : 0);
            if (delta)
                this._bivecKey.zw = delta * keyRotateSpeed;
        }
        this._bivec.copy(this._bivecKey);
        this._bivecKey.mulfs(dampFactor);
        if (enabled) {
            if ((state.enablePointerLock && state.isPointerLocked()) || (state.currentBtn = 0)) {
                let dx = state.moveX * this.mouseSpeed;
                let dy = -state.moveY * this.mouseSpeed;
                this._bivec.xw += dx;
                if (this.swapMouseYWithScrollY) {
                    this._bivec.yw += dy;
                }
                else {
                    this._bivec.zw -= dy;
                }
            }
            if ((state.enablePointerLock && state.isPointerLocked()) || (!state.enablePointerLock)) {
                let wx = state.wheelX * this.wheelSpeed;
                let wy = state.wheelY * this.wheelSpeed;
                this._bivec.xy += wx;
                if (this.swapMouseYWithScrollY) {
                    this._bivec.zw += wy;
                }
                else {
                    this._bivec.yw -= wy;
                }
            }
            let keyMoveSpeed = this.keyMoveSpeed * state.mspf;
            delta = (on("left") ? -1 : 0) + (on("right") ? 1 : 0);
            if (delta)
                this._moveVec.x = delta * keyMoveSpeed;
            delta = (on("up") ? 1 : 0) + (on("down") ? -1 : 0);
            if (delta)
                this._moveVec.y = delta * keyMoveSpeed;
            delta = (on("ana") ? -1 : 0) + (on("kata") ? 1 : 0);
            if (delta)
                this._moveVec.z = delta * keyMoveSpeed;
            delta = (on("front") ? -1 : 0) + (on("back") ? 1 : 0);
            if (delta)
                this._moveVec.w = delta * keyMoveSpeed;
        }
        // R A = R A R-1 R 
        this.object.rotation.mulsr(this._bivec.exp());
        this.object.translates(this._vec.copy(this._moveVec).rotates(this.object.rotation));
        this._moveVec.mulfs(dampFactor);
        if ((state.updateCount & this.normalisePeriodMask) === 0) {
            this.object.rotation.norms();
        }
    }
}
class KeepUpController {
    enabled = true;
    object = new Obj4();
    mouseSpeed = 0.01;
    wheelSpeed = 0.0001;
    keyMoveSpeed = 0.001;
    keyRotateSpeed = 0.001;
    damp = 0.05;
    keyConfig = {
        front: "KeyW",
        back: "KeyS",
        left: "KeyA",
        right: "KeyD",
        ana: "KeyQ",
        kata: "KeyE",
        up: "Space",
        down: "ShiftLeft",
        turnLeft: "KeyJ",
        turnRight: "KeyL",
        turnAna: "KeyU",
        turnKata: "KeyO",
        turnUp: "KeyI",
        turnDown: "KeyK",
        spinCW: "KeyZ",
        spinCCW: "KeyX",
        disable: "",
        enable: ""
    };
    registGui(gui) {
        gui.keybindingMgr.addGroup("keepup", {
            title: { zh: "保持竖直相机控制", en: "Keep Up Cam Ctrl" },
            actions: {
                enable: {
                    title: { zh: "按住启用控制", en: "Hold to Enable" },
                    key: ""
                },
                disable: {
                    title: { zh: "按住禁用控制", en: "Hold to Disable" },
                    key: ""
                },
                front: {
                    title: { zh: "前进", en: "Move Forward" },
                    key: "KeyW"
                },
                back: {
                    title: { zh: "后退", en: "Move Backward" },
                    key: "KeyS"
                },
                left: {
                    title: { zh: "左移", en: "Move Left" },
                    key: "KeyA"
                },
                right: {
                    title: { zh: "右移", en: "Move Right" },
                    key: "KeyD"
                },
                ana: {
                    title: { zh: "侧前移", en: "Move Ana" },
                    key: "KeyQ"
                },
                kata: {
                    title: { zh: "侧后移", en: "Move Kata" },
                    key: "KeyE"
                },
                up: {
                    title: { zh: "上移", en: "Move Up" },
                    key: "Space"
                },
                down: {
                    title: { zh: "下移", en: "Move Down" },
                    key: "ShiftLeft"
                },
                turnLeft: {
                    title: { zh: "左转", en: "Turn Left" },
                    key: "KeyJ"
                },
                turnRight: {
                    title: { zh: "右转", en: "Turn Right" },
                    key: "KeyL"
                },
                turnAna: {
                    title: { zh: "侧前转", en: "Turn Ana" },
                    key: "KeyU"
                },
                turnKata: {
                    title: { zh: "侧后转", en: "Turn Kata" },
                    key: "KeyO"
                },
                turnUp: {
                    title: { zh: "向上转", en: "Turn Up" },
                    key: "KeyI"
                },
                turnDown: {
                    title: { zh: "向下转", en: "Turn Down" },
                    key: "KeyK"
                },
                spinCW: {
                    title: { zh: "顺时针自转", en: "Spin Clockwise" },
                    key: "KeyZ"
                },
                spinCCW: {
                    title: { zh: "逆时针自转", en: "Spin Counterclockwise" },
                    key: "KeyX"
                },
            }
        });
    }
    /** how many update cycles (2^n) to normalise rotor to avoid accuracy problem */
    normalisePeriodBit;
    _bivec = new Bivec();
    _bivec2 = new Bivec();
    _bivecKey = new Bivec();
    _moveVec = new Vec4();
    _vec = new Vec4();
    normalisePeriodMask = 15;
    horizontalRotor = new Rotor();
    verticalRotor = new Rotor();
    constructor(object) {
        if (object)
            this.object = object;
        this.updateObj();
    }
    updateObj() {
        // rotate obj's yw plane to world's y axis
        this.object.rotates(Rotor.lookAtvb(Vec4.y, Bivec.yw.rotate(this.object.rotation)).conjs());
        // now check angle between obj's y axis and world's y axis
        let objY = Vec4.y.rotate(this.object.rotation);
        let r = Rotor.lookAt(objY, Vec4.y);
        this.horizontalRotor.copy(r.mul(this.object.rotation));
        this.verticalRotor.copy(this.horizontalRotor.mul(r.conjs()).mulsrconj(this.horizontalRotor));
    }
    update(state) {
        let enabled = (!state.getActionKey("enable", "keepup") || state.isActionHold("enable", "keepup")) && this.enabled && !state.isActionHold("disable", "keepup") && (!state.enabledCtrlPath.length || state.enabledCtrlPath.includes("keepup"));
        const on = (k) => state.isActionActive(k, "keepup");
        let delta;
        let dampFactor = Math.exp(-this.damp * Math.min(200.0, state.mspf));
        if (enabled) {
            let keyRotateSpeed = this.keyRotateSpeed * state.mspf;
            delta = (on("spinCW") ? -1 : 0) + (on("spinCCW") ? 1 : 0);
            if (delta)
                this._bivecKey.xz = delta * keyRotateSpeed;
            delta = (on("turnLeft") ? -1 : 0) + (on("turnRight") ? 1 : 0);
            if (delta)
                this._bivecKey.xw = delta * keyRotateSpeed;
            delta = (on("turnUp") ? 1 : 0) + (on("turnDown") ? -1 : 0);
            if (delta)
                this._bivecKey.yw = delta * keyRotateSpeed;
            delta = (on("turnAna") ? -1 : 0) + (on("turnKata") ? 1 : 0);
            if (delta)
                this._bivecKey.zw = delta * keyRotateSpeed;
        }
        this._bivec.xw = this._bivecKey.xw;
        this._bivec.zw = this._bivecKey.zw;
        if (enabled) {
            if ((state.enablePointerLock && state.isPointerLocked()) || (state.currentBtn === 0 && !state.enablePointerLock)) {
                let dx = state.moveX * this.mouseSpeed;
                let dy = state.moveY * this.mouseSpeed;
                this._bivec.xw += dx;
                this._bivec.zw += dy;
            }
            if ((state.enablePointerLock && state.isPointerLocked()) || (!state.enablePointerLock)) {
                let wy = -state.wheelY * this.wheelSpeed;
                this._bivecKey.yw += wy;
            }
        }
        this._bivec.xz = this._bivecKey.xz;
        this._bivec2.yw = this._bivecKey.yw;
        // R A = R A R-1 R 
        this.horizontalRotor.mulsr(this._bivec.exp());
        this.verticalRotor.mulsr(this._bivec2.exp());
        if (enabled) {
            let keyMoveSpeed = this.keyMoveSpeed * state.mspf;
            delta = (on("left") ? -1 : 0) + (on("right") ? 1 : 0);
            if (delta)
                this._moveVec.x = delta * keyMoveSpeed;
            delta = (on("up") ? 1 : 0) + (on("down") ? -1 : 0);
            if (delta)
                this._moveVec.y = delta * keyMoveSpeed;
            delta = (on("ana") ? -1 : 0) + (on("kata") ? 1 : 0);
            if (delta)
                this._moveVec.z = delta * keyMoveSpeed;
            delta = (on("front") ? -1 : 0) + (on("back") ? 1 : 0);
            if (delta)
                this._moveVec.w = delta * keyMoveSpeed;
        }
        this.object.translates(this._vec.copy(this._moveVec).rotates(this.horizontalRotor));
        this.object.rotation.copy(this.horizontalRotor.mul(this.verticalRotor));
        this._moveVec.mulfs(dampFactor);
        this._bivecKey.mulfs(dampFactor);
        if ((state.updateCount & this.normalisePeriodMask) === 0) {
            this.horizontalRotor.norms();
            this.verticalRotor.norms();
        }
    }
}
class VoxelViewerController {
    enabled = true;
    object = new Obj4(Vec4.w.neg());
    mouseSpeed = 0.01;
    wheelSpeed = 0.0001;
    damp = 0.1;
    mousePan = 2;
    mousePanZ = 1;
    mouseRotate = 0;
    /** how many update cycles (2^n) to normalise rotor to avoid accuracy problem */
    normalisePeriodBit;
    keyConfig = {
        disable: "",
        enable: "",
    };
    _bivec = new Bivec();
    _vec = new Vec4();
    _wy = 0;
    normalisePeriodMask = 15;
    constructor(object) {
        if (object)
            this.object = object;
    }
    update(state) {
        let disabled = state.isKeyHold(this.keyConfig.disable) || !this.enabled || !(!state.enabledCtrlPath.length || state.enabledCtrlPath.includes("voxel"));
        let dampFactor = Math.exp(-this.damp * Math.min(200.0, state.mspf));
        if (!disabled) {
            let dx = state.moveX * this.mouseSpeed;
            let dy = -state.moveY * this.mouseSpeed;
            let wy = state.wheelY * this.wheelSpeed;
            switch (state.currentBtn) {
                case this.mousePan:
                    this._vec.set(dx * this.object.scale.x, dy * this.object.scale.y).rotates(this.object.rotation);
                    this._bivec.set();
                    break;
                case this.mousePanZ:
                    this._vec.set(dx * this.object.scale.x, 0, -dy * this.object.scale.z).rotates(this.object.rotation);
                    this._bivec.set();
                    break;
                case this.mouseRotate:
                    this._bivec.set(0, dx, 0, dy);
                    this._vec.set();
                    break;
                default:
                    this._bivec.mulfs(dampFactor);
                    this._vec.mulfs(dampFactor);
            }
            this.object.position.subs(this._vec);
            this._wy = wy ? wy : this._wy * dampFactor;
            if (this.object.scale)
                this.object.scale.mulfs(1 + this._wy);
        }
        else {
            this._bivec.mulfs(dampFactor);
            this._vec.mulfs(dampFactor);
            this._wy *= dampFactor;
        }
        this.object.rotation.mulsr(this._bivec.exp());
        if ((state.updateCount & this.normalisePeriodMask) === 0) {
            this.object.rotation.norms();
        }
    }
}
var sliceconfig;
(function (sliceconfig) {
    function singlezslice1eye(screenSize) {
        let aspect = screenSize.height / screenSize.width;
        let resolution = screenSize.height;
        return [{
                slicePos: 0,
                facing: RetinaSliceFacing.POSZ,
                viewport: { x: 0, y: 0, width: 1 / aspect, height: 1.0 },
                resolution
            }];
    }
    sliceconfig.singlezslice1eye = singlezslice1eye;
    function singlezslice2eye(screenSize) {
        let aspect = screenSize.height / screenSize.width;
        let resolution = screenSize.height * 0.8;
        return [{
                slicePos: 0,
                facing: RetinaSliceFacing.POSZ,
                eyeStereo: EyeStereo.LeftEye,
                viewport: { x: -0.5, y: 0, width: 0.5 / aspect, height: 0.8 },
                resolution
            }, {
                slicePos: 0,
                facing: RetinaSliceFacing.POSZ,
                eyeStereo: EyeStereo.RightEye,
                viewport: { x: 0.5, y: 0, width: 0.5 / aspect, height: 0.8 },
                resolution
            }];
    }
    sliceconfig.singlezslice2eye = singlezslice2eye;
    function singleyslice1eye(screenSize) {
        let aspect = screenSize.height / screenSize.width;
        let resolution = screenSize.height;
        return [{
                slicePos: 0,
                facing: RetinaSliceFacing.NEGY,
                viewport: { x: 0, y: 0, width: 1 / aspect, height: 1.0 },
                resolution
            }];
    }
    sliceconfig.singleyslice1eye = singleyslice1eye;
    function singleyslice2eye(screenSize) {
        let aspect = screenSize.height / screenSize.width;
        let resolution = screenSize.height * 0.8;
        return [{
                slicePos: 0,
                facing: RetinaSliceFacing.NEGY,
                eyeStereo: EyeStereo.LeftEye,
                viewport: { x: -0.5, y: 0, width: 0.5 / aspect, height: 0.8 },
                resolution
            }, {
                slicePos: 0,
                facing: RetinaSliceFacing.NEGY,
                eyeStereo: EyeStereo.RightEye,
                viewport: { x: 0.5, y: 0, width: 0.5 / aspect, height: 0.8 },
                resolution
            }];
    }
    sliceconfig.singleyslice2eye = singleyslice2eye;
    function zslices1eye(step, maxpos, screenSize) {
        let aspect = screenSize.height / screenSize.width;
        let arr = [[0, 0]];
        let j = 1;
        for (let i = step; i <= maxpos; i += step, j++) {
            arr.push([i, j]);
            arr.push([-i, -j]);
        }
        let half = 2 / arr.length;
        let size = 1 / (aspect * arr.length);
        let resolution = screenSize.height * size;
        return arr.map(pos => ({
            slicePos: pos[0],
            facing: RetinaSliceFacing.POSZ,
            viewport: { x: pos[1] * half, y: size - 1, width: size, height: size },
            resolution
        }));
    }
    sliceconfig.zslices1eye = zslices1eye;
    function zslices2eye(step, maxpos, screenSize) {
        let aspect = screenSize.height / screenSize.width;
        let arr = [[0, 0]];
        let j = 1;
        for (let i = step; i <= maxpos; i += step, j++) {
            arr.push([i, j]);
            arr.push([-i, -j]);
        }
        arr.sort((a, b) => a[0] - b[0]);
        let half = 1 / arr.length;
        let size = 0.5 / (aspect * arr.length);
        let resolution = screenSize.height * size;
        return arr.map(pos => ({
            slicePos: pos[0],
            facing: RetinaSliceFacing.POSZ,
            eyeStereo: EyeStereo.LeftEye,
            viewport: { x: (pos[1] * half) - 0.5, y: size - 1, width: size, height: size },
            resolution
        })).concat(arr.map(pos => ({
            slicePos: pos[0],
            facing: RetinaSliceFacing.POSZ,
            eyeStereo: EyeStereo.RightEye,
            viewport: { x: (pos[1] * half) + 0.5, y: size - 1, width: size, height: size },
            resolution
        })));
    }
    sliceconfig.zslices2eye = zslices2eye;
    function yslices1eye(step, maxpos, screenSize) {
        let aspect = screenSize.height / screenSize.width;
        let arr = [[0, 0]];
        let j = 1;
        for (let i = step; i <= maxpos; i += step, j++) {
            arr.push([i, j]);
            arr.push([-i, -j]);
        }
        let half = 2 / arr.length;
        let size = 1 / (aspect * arr.length);
        let resolution = screenSize.height * size;
        return arr.map(pos => ({
            slicePos: pos[0],
            facing: RetinaSliceFacing.NEGY,
            viewport: { x: pos[1] * half, y: size - 1, width: size, height: size },
            resolution
        }));
    }
    sliceconfig.yslices1eye = yslices1eye;
    function yslices2eye(step, maxpos, screenSize) {
        let aspect = screenSize.height / screenSize.width;
        let arr = [[0, 0]];
        let j = 1;
        for (let i = step; i <= maxpos; i += step, j++) {
            arr.push([i, j]);
            arr.push([-i, -j]);
        }
        arr.sort((a, b) => a[0] - b[0]);
        let half = 1 / arr.length;
        let size = 0.5 / (aspect * arr.length);
        let resolution = screenSize.height * size;
        return arr.map(pos => ({
            slicePos: pos[0],
            facing: RetinaSliceFacing.NEGY,
            eyeStereo: EyeStereo.LeftEye,
            viewport: { x: (pos[1] * half) - 0.5, y: size - 1, width: size, height: size },
            resolution
        })).concat(arr.map(pos => ({
            slicePos: pos[0],
            facing: RetinaSliceFacing.NEGY,
            eyeStereo: EyeStereo.RightEye,
            viewport: { x: (pos[1] * half) + 0.5, y: size - 1, width: size, height: size },
            resolution
        })));
    }
    sliceconfig.yslices2eye = yslices2eye;
    function default2eye(size, screenSize) {
        let aspect = screenSize.height / screenSize.width;
        let resolution = screenSize.height * size;
        let wsize;
        let size_aspect;
        if (size >= 0.5) {
            wsize = 0.25 / aspect;
            size_aspect = 0.25;
            size = 0.5;
        }
        else {
            size_aspect = size * aspect;
            wsize = size;
        }
        return [
            {
                facing: RetinaSliceFacing.NEGX,
                eyeStereo: EyeStereo.LeftEye,
                viewport: { x: -size_aspect, y: size - 1, width: wsize, height: size },
                resolution
            },
            {
                facing: RetinaSliceFacing.NEGX,
                eyeStereo: EyeStereo.RightEye,
                viewport: { x: 1 - size_aspect, y: size - 1, width: wsize, height: size },
                resolution
            },
            {
                facing: RetinaSliceFacing.NEGY,
                eyeStereo: EyeStereo.LeftEye,
                viewport: { x: -size_aspect, y: 1 - size, width: wsize, height: size },
                resolution
            },
            {
                facing: RetinaSliceFacing.NEGY,
                eyeStereo: EyeStereo.RightEye,
                viewport: { x: 1 - size_aspect, y: 1 - size, width: wsize, height: size },
                resolution
            },
            {
                facing: RetinaSliceFacing.POSZ,
                eyeStereo: EyeStereo.LeftEye,
                viewport: { x: size_aspect - 1, y: size - 1, width: wsize, height: size },
                resolution
            },
            {
                facing: RetinaSliceFacing.POSZ,
                eyeStereo: EyeStereo.RightEye,
                viewport: { x: size_aspect, y: size - 1, width: wsize, height: size },
                resolution
            },
        ];
    }
    sliceconfig.default2eye = default2eye;
    function default1eye(size, screenSize) {
        let aspect = screenSize.height / screenSize.width;
        let resolution = screenSize.height * size;
        let wsize;
        let size_aspect;
        if (size >= 0.5) {
            wsize = 0.5 / aspect;
            size_aspect = 0.5;
            size = 0.5;
        }
        else {
            size_aspect = size * aspect;
            wsize = size;
        }
        return [
            {
                facing: RetinaSliceFacing.NEGX,
                viewport: { x: 1 - size_aspect, y: size - 1, width: wsize, height: size },
                resolution
            },
            {
                facing: RetinaSliceFacing.NEGY,
                viewport: { x: 1 - size_aspect, y: 1 - size, width: wsize, height: size },
                resolution
            },
            {
                facing: RetinaSliceFacing.POSZ,
                viewport: { x: size_aspect - 1, y: size - 1, width: wsize, height: size },
                resolution
            }
        ];
    }
    sliceconfig.default1eye = default1eye;
})(sliceconfig || (sliceconfig = {}));
const retinaRenderPassDescriptors = [
    {},
    {
        alphaShader: {
            code: `@group(1) @binding(0) var<uniform> alphaParams : vec4f;
            fn main(color:vec4f, coord: vec3<f32>)->f32{
                return color.a * (1.0 - smoothstep(alphaParams.x,alphaParams.y,dot(coord,coord))) * alphaParams.z;
            }`, entryPoint: 'main'
        }
    }, {
        alphaShader: {
            code: `@group(1) @binding(0) var<uniform> alphaParams : vec4f;
            fn main(color:vec4f, coord  : vec3<f32>)->f32{
                return color.a * max(step(abs(coord.x),alphaParams.x)*step(abs(coord.y),alphaParams.x)*step(abs(coord.z),alphaParams.x)* alphaParams.y,alphaParams.z);
            }`, entryPoint: 'main'
        }
    }, {
        alphaShader: {
            code: `@group(1) @binding(0) var<uniform> alphaParams : vec4f;
            fn main(color:vec4f, coord: vec3<f32>)->f32{ 
                return color.a * max(step(dot(coord,alphaParams.xyz),0.0),alphaParams.w); 
            }`, entryPoint: 'main'
        }
    },
];
class RetinaController {
    enabled = true;
    renderer;
    mouseSpeed = 0.01;
    wheelSpeed = 0.0005;
    keyMoveSpeed = 0.1;
    keyRotateSpeed = 0.002;
    opacityKeySpeed = 0.01;
    fovKeySpeed = 1;
    damp = 0.02;
    mouseButton = 0;
    retinaAlphaMouseButton = 2;
    retinaEyeOffset = 0.1;
    sectionEyeOffset = 0.2;
    maxSectionEyeOffset = 1;
    minSectionEyeOffset = 0.01;
    size;
    sectionPresetLabels;
    sectionPresets;
    currentSectionConfig = "retina+sections";
    rembemerLastLayers;
    needResize = true;
    currentRetinaRenderPassIndex = -1;
    alphaBuffer;
    guiButtons = {};
    constructor(r) {
        this.renderer = r;
        this.defaultRetinaRenderPass = r.getCurrentRetinaRenderPass();
        this.alphaBuffer = r.gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 16, "RetinaController's Retina Alpha Uniform Buffer");
        this.retinaRenderPasses = retinaRenderPassDescriptors.map((desc, index) => {
            if (desc?.alphaShader?.code && desc.alphaShader.code.indexOf("@group(1)") !== -1)
                desc.alphaShaderBindingResources = [{ buffer: this.alphaBuffer }];
            // this jsBuffer uses first 4 elements to write to GPU, other elems are used for js state storage
            const jsBuffer = new Float32Array(8);
            switch (index) {
                case 1:
                    jsBuffer[4] = 1;
                    jsBuffer[5] = 1;
                    const r2 = jsBuffer[4] * jsBuffer[4];
                    jsBuffer[0] = r2 / jsBuffer[5];
                    jsBuffer[1] = r2 * jsBuffer[5];
                    jsBuffer[2] = 4 / (1 + r2);
                    break;
                case 2:
                    jsBuffer[0] = 0.5;
                    jsBuffer[5] = 0;
                    jsBuffer[1] = 2 - jsBuffer[0];
                    jsBuffer[2] = jsBuffer[5];
                    break;
                case 3:
                    jsBuffer[2] = 1;
                    jsBuffer[3] = 0.01;
            }
            return { promise: r.createRetinaRenderPass(desc).init(), jsBuffer };
        });
        this.sectionPresetLabels = ["retina+sections", "retina+bigsections", "retina", "sections", "retina+zslices", "retina+yslices", "zsection", "ysection"];
        this.sectionPresets = (screenSize) => ({
            "retina+sections": {
                eye1: sliceconfig.default1eye(0.3, screenSize),
                eye2: sliceconfig.default2eye(0.2, screenSize),
                retina: true
            },
            "retina+bigsections": {
                eye1: sliceconfig.default1eye(0.44, screenSize),
                eye2: sliceconfig.default2eye(0.33, screenSize),
                retina: true
            },
            "retina": {
                eye1: [],
                eye2: [],
                retina: true
            },
            "sections": {
                eye1: sliceconfig.default1eye(0.5, screenSize),
                eye2: sliceconfig.default2eye(0.5, screenSize),
                retina: false
            },
            "retina+zslices": {
                eye1: sliceconfig.zslices1eye(0.15, 0.6, screenSize),
                eye2: sliceconfig.zslices2eye(0.3, 0.6, screenSize),
                retina: true
            },
            "retina+yslices": {
                eye1: sliceconfig.yslices1eye(0.15, 0.6, screenSize),
                eye2: sliceconfig.yslices2eye(0.3, 0.6, screenSize),
                retina: true
            },
            "zsection": {
                eye1: sliceconfig.singlezslice1eye(screenSize),
                eye2: sliceconfig.singlezslice2eye(screenSize),
                retina: false
            },
            "ysection": {
                eye1: sliceconfig.singleyslice1eye(screenSize),
                eye2: sliceconfig.singleyslice2eye(screenSize),
                retina: false
            },
        });
    }
    registGui(gui) {
        gui.keybindingMgr.addGroup("retina", {
            title: { zh: "体素渲染控制", en: "Voxel Render Ctrl" },
            actions: {
                enable: {
                    title: { zh: "按住启用控制", en: "Hold to Enable" },
                    key: "AltLeft"
                },
                disable: {
                    title: { zh: "按住禁用控制", en: "Hold to Disable" },
                    key: ""
                },
                addOpacity: {
                    title: { zh: "增加不透明度", en: "Increase Opacity" },
                    key: "KeyQ"
                },
                subOpacity: {
                    title: { zh: "减少不透明度", en: "Decrease Opacity" },
                    key: "KeyA"
                },
                addLayer: {
                    title: { zh: "增加层数", en: "Increase Layer" },
                    key: "KeyW"
                },
                subLayer: {
                    title: { zh: "减少层数", en: "Decrease Layer" },
                    key: "KeyS"
                },
                addRetinaResolution: {
                    title: { zh: "提高体素分辨率", en: "Increase Resolution" },
                    key: "KeyE",
                    press: true
                },
                subRetinaResolution: {
                    title: { zh: "降低体素分辨率", en: "Decrease Resolution" },
                    key: "KeyD",
                    press: true
                },
                addFov: {
                    title: { zh: "增加视场角", en: "Increase FOV" },
                    key: "KeyT"
                },
                subFov: {
                    title: { zh: "减少视场角", en: "Decrease FOV" },
                    key: "KeyG"
                },
                toggle3D: {
                    title: { zh: "切换裸眼3D模式", en: "Toggle Stereo 3D Mode" },
                    key: "KeyZ",
                    press: true
                },
                addEyes3dGap: {
                    title: { zh: "增加3D眼距", en: "Increase 3D Eye Gap" },
                    key: "KeyB"
                },
                subEyes3dGap: {
                    title: { zh: "减少3D眼距", en: "Decrease 3D Eye Gap" },
                    key: "KeyV"
                },
                addEyes4dGap: {
                    title: { zh: "增加4D眼距", en: "Increase 4D Eye Gap" },
                    key: "KeyM"
                },
                subEyes4dGap: {
                    title: { zh: "减少4D眼距", en: "Decrease 4D Eye Gap" },
                    key: "KeyN"
                },
                negEyesGap: {
                    title: { zh: "反转眼距", en: "Invert Eye Gap" },
                    key: "KeyX",
                    press: true
                },
                toggleCrosshair: {
                    title: { zh: "切换准星", en: "Toggle Crosshair" },
                    key: "KeyC",
                    press: true
                },
                rotateLeft: {
                    title: { zh: "向左旋转", en: "Rotate Left" },
                    key: "ArrowLeft"
                },
                rotateRight: {
                    title: { zh: "向右旋转", en: "Rotate Right" },
                    key: "ArrowRight"
                },
                rotateUp: {
                    title: { zh: "向上旋转", en: "Rotate Up" },
                    key: "ArrowUp"
                },
                rotateDown: {
                    title: { zh: "向下旋转", en: "Rotate Down" },
                    key: "ArrowDown"
                },
                refaceFront: {
                    title: { zh: "转向正视图", en: "Facing Front View" },
                    key: "KeyR",
                    press: true
                },
                refaceRight: {
                    title: { zh: "转向右视图", en: "Facing Right View" },
                    key: "KeyL",
                    press: true
                },
                refaceLeft: {
                    title: { zh: "转向左视图", en: "Facing Left View" },
                    key: "KeyJ",
                    press: true
                },
                refaceTop: {
                    title: { zh: "转向顶视图", en: "Facing Top View" },
                    key: "KeyI",
                    press: true
                },
                refaceBottom: {
                    title: { zh: "转向底视图", en: "Facing Bottom View" },
                    key: "KeyK",
                    press: true
                },
                toggleRetinaAlpha: {
                    title: { zh: "切换体素透明度模式", en: "Toggle Voxel Alpha Mode" },
                    key: "KeyF",
                    press: true
                }
            },
            groups: {
                sectionConfigs: {
                    title: { zh: "显示配置", en: "Display Configs" },
                    actions: {
                        "retina+sections": {
                            title: { zh: "体素+截面", en: "Voxel + Sections" },
                            key: "Digit1",
                            press: true
                        },
                        "retina+bigsections": {
                            title: { zh: "体素+大截面", en: "Voxel + Big Sections" },
                            key: "Digit2",
                            press: true
                        },
                        retina: {
                            title: { zh: "仅体素", en: "Voxel Only" },
                            key: "Digit3",
                            press: true
                        },
                        sections: {
                            title: { zh: "截面模式", en: "Sections Mode" },
                            key: "Digit4",
                            press: true
                        },
                        zsection: {
                            title: { zh: "Z截面", en: "Z Section" },
                            key: "Digit5",
                            press: true
                        },
                        ysection: {
                            title: { zh: "Y截面", en: "Y Section" },
                            key: "Digit6",
                            press: true
                        },
                        "retina+zslices": {
                            title: { zh: "体素+Z切片", en: "Voxel + Z Slices" },
                            key: "Digit7",
                            press: true
                        },
                        "retina+yslices": {
                            title: { zh: "体素+Y切片", en: "Voxel + Y Slices" },
                            key: "Digit8",
                            press: true
                        }
                    }
                }
            }
        });
        const SVG_PLUS = `<text x="1.5" y="3.5" stroke="#F00" style="font-size:3px">+</text>`;
        const SVG_MINUS = `<text x="2" y="3.5" stroke="#F00" style="font-size:3px">-</text>`;
        const SVG_RETINA = `<path d="M 1.3,3.3 2.5,4 4.1,3.6 V 2 L 2.9,1.3 1.3,1.7 Z"/>`;
        const SVG_CHECKER = `${SVG_HEADER}0 0 5 5'><g style="fill:#FFF"><rect width="1" height="1" x="0.5" y="0.5"/><rect width="1" height="1" x="2.5" y="0.5"/><rect width="1" height="1" x="1.5" y="1.5"/><rect width="1" height="1" x="3.5" y="1.5"/><rect width="1" height="1" x="0.5" y="2.5"/><rect width="1" height="1" x="2.5" y="2.5"/><rect width="1" height="1" x="1.5" y="3.5"/><rect width="1" height="1" x="3.5" y="3.5"/>`;
        const SVG_CAM = `${SVG_HEADER}0 0 5 5'><g ${SVG_LINE}><circle cx="0.77" cy="1.57" r="0.4"/><rect width="2.36" height="1.6" x="0.39" y="2.15"/><circle cx="1.9" cy="1.35" r="0.66"/><path d="M 2.74,2.48 4.89,1"/><path d="m 2.77,3.27 2.16,1.4"/><path d="m 4.46,1.9 c 0.23,0.65 0.28,1.3 0.03,1.9"/><path d="M 4.24,2.4 4.36,1.7 4.9,2.18"/><path d="M 4.23,3.2 4.41,3.9 5,3.4"/>`;
        const panel = gui.addLvl2Panel(gui.addLvl1Button({
            name: "retina-setting", title: { zh: "显示/隐藏体素渲染设置", en: "Toggle Voxel Render Settings" }, svgIcon: `${SVG_HEADER}0.6 0.5 4.5 4.5'><g ${SVG_LINE}><path d="M 1.9,4.53 1.4,4.24 1.51,3.73 C 1.43,3.65 1.36,3.56 1.3,3.46 L 0.77,3.43 0.62,2.87 1.07,2.58 C 1.07,2.47 1.08,2.36 1.11,2.25 L 0.76,1.84 1.05,1.34 1.56,1.45 C 1.64,1.37 1.73,1.3 1.83,1.24 L 1.86,0.71 2.42,0.56 2.71,1 c 0.11,0 0.23,0.02 0.34,0.04 L 3.45,0.7 3.95,0.99 3.84,1.5 c 0.08,0.08 0.15,0.17 0.21,0.27 l 0.53,0.03 0.15,0.56 -0.44,0.3 c 0,0.11 -0.02,0.23 -0.04,0.34 L 4.59,3.37 4.3,3.88 3.79,3.77 C 3.7,3.85 3.61,3.91 3.52,3.97 L 3.48,4.5 2.92,4.65 2.63,4.21 C 2.53,4.2 2.41,4.19 2.3,4.16 Z"/><circle cx="2.67" cy="2.62" r="1"/></g></svg>`,
        }));
        this.guiButtons["crosseye"] = gui.addLvl2Button({
            name: "retina.negEyesGap", title: { zh: "交叉眼", en: "Cross View" },
            svgIcon: `${SVG_HEADER}0.5 0.3 4.5 4.5'><g ${SVG_LINE}><circle cx="2" cy="4" r="0.3"/><circle cx="3.2" cy="4" r="0.3"/><path d="M 2,3.4 3,1 M 3.2,3.4 2.2,1"/></g></svg>`
        }, panel);
        this.guiButtons["paralleleye"] = gui.addLvl2Button({
            name: "retina.negEyesGap", title: { zh: "平行眼", en: "Parallel View" },
            svgIcon: `${SVG_HEADER}0.5 0.3 4.5 4.5'><g ${SVG_LINE}><circle cx="2" cy="4" r="0.3"/><circle cx="3.2" cy="4" r="0.3"/><path d="M 2,3.4 1.8,1 M 3.2,3.4 3.4,1"/></g></svg>`
        }, panel);
        this.guiButtons["paralleleye"].parentElement.style.display = "none";
        const toggle3DBtn = gui.addLvl2Button({
            name: "retina.toggle3D", title: { zh: "切换裸眼3D模式", en: "Toggle Naked Eye Stereo Mode" },
            svgIcon: `${SVG_HEADER}0.5 0.3 4.5 4.5'><g ${SVG_LINE}><path d="M 0.563,2.636 C 2.33,1 3.24,1.22 4.74,2.76 2.99,3.96 1.676,3.73 0.564,2.637 Z"/><circle cx="2.6" cy="2.5" r="0.9"/><circle cx="2.6" cy="2.5" r="0.54"/></g></svg>`
        }, panel);
        const sliceBtn = gui.addLvl2Button({
            name: "slicecfgBtns", title: { zh: "视图配置：体素+三个截面", en: "View Configuration: Voxel + Sections" },
            svgIcon: `${SVG_HEADER}0 0 5 5'><g ${SVG_LINE}>${SVG_RETINA}<rect width="1.2" height="1.2" x="0.6" y="3.6"/><rect width="1.2" height="1.2" x="3.5" y="3.6"/><rect width="1.2" height="1.2" x="3.5" y="0.5"/></g></svg>`
        }, panel);
        this.guiButtons["slice"] = sliceBtn;
        const slicecfg = gui.addLvl3Drop(sliceBtn, 2);
        slicecfg.parentElement.classList.add("btn-red");
        const sectionCfgBtns = [gui.addLvl2Button({
                name: "retina.sectionConfigs.retina+sections", title: { zh: "视图配置：体素+三个截面", en: "View Configuration: Voxel + Sections" },
                svgIcon: `${SVG_HEADER}0 0 5 5'><g ${SVG_LINE}>${SVG_RETINA}<rect width="1.2" height="1.2" x="0.6" y="3.6"/><rect width="1.2" height="1.2" x="3.5" y="3.6"/><rect width="1.2" height="1.2" x="3.5" y="0.5"/></g></svg>`
            }, slicecfg),
            gui.addLvl2Button({
                name: "retina.sectionConfigs.retina+bigsections", title: { zh: "视图配置：体素+三个大截面", en: "View Configuration: Voxel + Big Sections" },
                svgIcon: `${SVG_HEADER}0 0 5 5'><g ${SVG_LINE}>${SVG_RETINA}<rect width="1.7" height="1.7" x="0.6" y="2.8"/><rect width="1.7" height="1.7" x="2.9" y="2.8"/><rect width="1.7" height="1.7" x="2.9" y="0.5"/></g></svg>`
            }, slicecfg),
            gui.addLvl2Button({
                name: "retina.sectionConfigs.retina", title: { zh: "视图配置：体素", en: "View Configuration: Voxel Only" },
                svgIcon: `${SVG_HEADER}0 0 5 5'><g ${SVG_LINE}>${SVG_RETINA}</g></svg>`
            }, slicecfg),
            gui.addLvl2Button({
                name: "retina.sectionConfigs.sections", title: { zh: "视图配置：三个截面", en: "View Configuration: 3 Sections" },
                svgIcon: `${SVG_HEADER}0 0 5 5'><g ${SVG_LINE}><rect width="2" height="2" x="0.6" y="2.5"/><rect width="2" height="2" x="2.6" y="2.5"/><rect width="2" height="2" x="2.6" y="0.5"/></g></svg>`
            }, slicecfg),
            gui.addLvl2Button({
                name: "retina.sectionConfigs.ysection", title: { zh: "视图配置：Y轴截面", en: "View Configuration: Y axis Section" },
                svgIcon: `${SVG_HEADER}0 0 5 5'><g ${SVG_LINE}><rect width="4" height="4" x="0.6" y="0.6"/><text x="1.5" y="3.5" stroke="#0F0" style="font-size:3px">Y</text></g></svg>`
            }, slicecfg),
            gui.addLvl2Button({
                name: "retina.sectionConfigs.zsection", title: { zh: "视图配置：Z轴截面", en: "View Configuration: Z axis Section" },
                svgIcon: `${SVG_HEADER}0 0 5 5'><g ${SVG_LINE}><rect width="4" height="4" x="0.6" y="0.6"/><text x="1.5" y="3.5" stroke="#00F" style="font-size:3px">Z</text></g></svg>`
            }, slicecfg),
            gui.addLvl2Button({
                name: "retina.sectionConfigs.retina+yslices", title: { zh: "视图配置：体素+平行Y轴截面", en: "View Configuration: Voxel + Y axis Parallel Sections" },
                svgIcon: `${SVG_HEADER}0 0 5 5'><g ${SVG_LINE}>${SVG_RETINA}<rect width="1" height="1" x="0.6" y="3"/><rect width="1" height="1" x="1.6" y="3"/><rect width="1" height="1" x="2.6" y="3"/><rect width="1" height="1" x="3.6" y="3"/><text x="1.5" y="3.5" stroke="#0F0" style="font-size:3px">Y</text></g></svg>`
            }, slicecfg),
            gui.addLvl2Button({
                name: "retina.sectionConfigs.retina+zslices", title: { zh: "视图配置：体素+平行Z轴截面", en: "View Configuration: Voxel + Z axis Parallel Sections" },
                svgIcon: `${SVG_HEADER}0 0 5 5'><g ${SVG_LINE}>${SVG_RETINA}<rect width="1" height="1" x="0.6" y="3"/><rect width="1" height="1" x="1.6" y="3"/><rect width="1" height="1" x="2.6" y="3"/><rect width="1" height="1" x="3.6" y="3"/><text x="1.5" y="3.5" stroke="#00F" style="font-size:3px">Z</text></g></svg>`
            }, slicecfg)];
        gui.addLvl2Button({
            name: "retina.toggleCrosshair", title: { zh: "显示/隐藏十字准心", en: "Toggle Crosshair" },
            svgIcon: `${SVG_HEADER}0.6 0.5 4.5 4.5'><g ${SVG_LINE}><path d="m 2.62,1 v 3.37 M 1.56,4 3.56,1.47 M 0.9,2.7 H 4.23"/></g></svg>`
        }, panel);
        const param = gui.addLvl3Drop(gui.addLvl2Button({
            name: "settingBtn", title: { zh: "显示/隐藏体素渲染参数调节", en: "Show / Hide Voxel Render Params" },
            svgIcon: `${SVG_HEADER}0.5 0.3 4.5 4.5'><g id="g1" ${SVG_LINE}><path d="M 1.3,3.4 V 4.8 M 1.77,3.4 V 4.8 M 1.3,0.4 V 2.8 M 1.77,0.4 V 2.8"/><rect width="1.7" height="0.4" x="0.63" y="3.04"/></g><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#g1" transform="rotate(180,2.65,2.59)"/></svg>`
        }, panel), 2);
        param.parentElement.classList.add("btn-green");
        gui.addLvl2Button({
            name: ".retina.addLayer", title: { zh: "增加体素渲染层数", en: "Increase Voxel Layers" },
            svgIcon: `${SVG_HEADER}0 0 5 5'><g ${SVG_LINE}><rect id="r" width="1.8" height="2.3" x="2.7" y="2.94" transform="matrix(0.95,-0.3,0,1,0,0)"/><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#r" id="u" transform="translate(-0.6,-0.4)"/><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#u" transform="translate(-0.6,-0.4)"/>${SVG_PLUS}</g></svg>`
        }, param);
        gui.addLvl2Button({
            name: ".retina.subLayer", title: { zh: "减少体素渲染层数", en: "Decrease Voxel Layers" },
            svgIcon: `${SVG_HEADER}0 0 5 5'><g ${SVG_LINE}><rect id="r" width="1.8" height="2.3" x="2.7" y="2.94" transform="matrix(0.95,-0.3,0,1,0,0)"/><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#r" id="u" transform="translate(-0.6,-0.4)"/><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#u" transform="translate(-0.6,-0.4)"/>${SVG_MINUS}</g></svg>`
        }, param);
        gui.addLvl2Button({
            name: ".retina.addOpacity", title: { zh: "增加体素不透明度", en: "Increase Voxel Opacity" },
            svgIcon: `${SVG_CHECKER}<text x="1.5" y="3.5" style="font-size:3px;stroke:#F00;stroke-width:0.25">+</text></g></svg>`
        }, param);
        gui.addLvl2Button({
            name: ".retina.subOpacity", title: { zh: "减少体素不透明度", en: "Decrease Voxel Opacity" },
            svgIcon: `${SVG_CHECKER}<text x="2" y="3.5" style="font-size:3px;stroke:#F00;stroke-width:0.25">-</text></g></svg>`
        }, param);
        gui.addLvl2Button({
            name: ".retina.addFov", title: { zh: "增大体素显示视场角", en: "Increase Field Of Voxel View" },
            svgIcon: `${SVG_CAM}${SVG_PLUS}</g></svg>`
        }, param);
        gui.addLvl2Button({
            name: ".retina.subFov", title: { zh: "降低体素显示视场角", en: "Decrease Field Of Voxel View" },
            svgIcon: `${SVG_CAM}${SVG_MINUS}</g></svg>`
        }, param);
        gui.addLvl2Button({
            name: "retina.addRetinaResolution", title: { zh: "增大每层体素分辨率", en: "Increase Resolution Per Voxel Layer" },
            svgIcon: `${SVG_HEADER}0 0 5 5'><g ${SVG_LINE}><rect width="4.6" height="2.93" x="0.33" y="0.9"/><path d="M 2.44,3.844 1.62,4.78 H 3.77 L 3.03,3.84"/><circle cx="1.86" cy="2.4" r="1.05"/><rect width="1.63" height="0.48" x="3.38" y="1.7" transform="rotate(12.5)"/><path d="M 1.075,1.825H 1.6 V 2.1 H 1.9 V 2.5 H 2.3 V 3.07 H 2.5"/>${SVG_PLUS}</g></svg>`
        }, param);
        gui.addLvl2Button({
            name: "retina.subRetinaResolution", title: { zh: "降低每层体素分辨率", en: "Decrease Resolution Per Voxel Layer" },
            svgIcon: `${SVG_HEADER}0 0 5 5'><g ${SVG_LINE}><rect width="4.6" height="2.93" x="0.33" y="0.9"/><path d="M 2.44,3.844 1.62,4.78 H 3.77 L 3.03,3.84"/><circle cx="1.86" cy="2.4" r="1.05"/><rect width="1.63" height="0.48" x="3.38" y="1.7" transform="rotate(12.5)"/><path d="M 1.075,1.825H 1.6 V 2.1 H 1.9 V 2.5 H 2.3 V 3.07 H 2.5"/>${SVG_MINUS}</g></svg>`
        }, param);
        const crossBtn = gui.addLvl2Button({
            name: "crosspplBtns", title: { zh: "截面形状：默认立方体", en: "CrossSection Shape: Default Cube" },
            svgIcon: `${SVG_HEADER}0.6 0.5 4.5 4.5'><g ${SVG_LINE}><path d="M 1.22,1.68 V 3.764 L 2.83,4.644 4.472,3.715 V 1.715 L 2.81,0.8 Z M 1.55,1.86 2.86,2.61 V 4.31 M 2.86,2.61 4.16,1.86"/></g></svg>`
        }, panel);
        this.guiButtons["cross"] = crossBtn;
        const cross = gui.addLvl3Drop(crossBtn, 1);
        cross.parentElement.classList.add("btn-yellow");
        const _this = this;
        const crosspplBtnFn = function (i) {
            _this.toggleRetinaAlpha(i);
        };
        gui.addLvl2Button({
            name: "crossppl1Btn", title: { zh: "截面形状：默认立方体", en: "CrossSection: Default Cube" },
            svgIcon: `${SVG_HEADER}0.6 0.5 4.5 4.5'><g ${SVG_LINE}><path d="M 1.22,1.68 V 3.764 L 2.83,4.644 4.472,3.715 V 1.715 L 2.81,0.8 Z M 1.55,1.86 2.86,2.61 V 4.31 M 2.86,2.61 4.16,1.86"/></g></svg>`
        }, cross).addEventListener('click', e => crosspplBtnFn.call(e.currentTarget, 0));
        gui.addLvl2Button({
            name: "crossppl2Btn", title: { zh: "截面形状：球", en: "CrossSection: Ball" },
            svgIcon: `${SVG_HEADER}0.6 0.5 4.5 4.5'><g ${SVG_LINE}><circle cx="2.69" cy="2.6" r="2"/><path d="m 0.69,2.6 c 0.002,1.28 4,1.28 4,0.014"/><path style="stroke-dasharray:0.2, 0.2;" d="M 0.68,2.6 C 0.71,1.45 4.68,1.5 4.7,2.63"/></g></svg>`
        }, cross).addEventListener('click', e => crosspplBtnFn.call(e.currentTarget, 1));
        gui.addLvl2Button({
            name: "crossppl3Btn", title: { zh: "截面形状：小立方体", en: "CrossSection: Small Cube" },
            svgIcon: `${SVG_HEADER}0.6 0.5 4.5 4.5'><g style="fill:none;stroke:#FFF;stroke-width:0.4;"><path transform="scale(0.6) translate(1.8,1.8)" d="M 1.22,1.68 V 3.764 L 2.83,4.644 4.472,3.715 V 1.715 L 2.81,0.8 Z M 1.55,1.86 2.86,2.61 V 4.31 M 2.86,2.61 4.16,1.86"/></g></svg>`
        }, cross).addEventListener('click', e => crosspplBtnFn.call(e.currentTarget, 2));
        gui.addLvl2Button({
            name: "crossppl4Btn", title: { zh: "截面形状：平面", en: "CrossSection: Plane" },
            svgIcon: `${SVG_HEADER}0.6 0.5 4.5 4.5'><g ${SVG_LINE}><path d="M 1.19,3.49 2.85,4.45 4.42,3.55 V 1.57 L 2.77,0.63 1.19,1.52 Z M 2,1.12 3.45,1.05 4.4,2.62 3.65,3.94 1.98,3.92 1.23,2.74 1.95,1.1"/></g></svg>`
        }, cross).addEventListener('click', e => crosspplBtnFn.call(e.currentTarget, 3));
        switch (gui.storageMgr.data.preference['stereo']) {
            case "parallel":
                this.guiButtons["paralleleye"].dispatchEvent(new MouseEvent("mousedown"));
                break;
            case "off":
                toggle3DBtn.dispatchEvent(new MouseEvent("mousedown"));
                break;
        }
        if (gui.storageMgr.data.preference['sectionConfig']) {
            sectionCfgBtns.find(btn => btn.getAttribute("data-name") === "retina.sectionConfigs." + gui.storageMgr.data.preference['sectionConfig'])?.dispatchEvent(new MouseEvent("mousedown"));
        }
    }
    ;
    _vec2damp = new Vec2();
    _vec2euler = new Vec2();
    _vec3 = new Vec3();
    _q1 = new Quaternion();
    _q2 = new Quaternion();
    _mat4 = new Mat4();
    refacingFront = false;
    refacingTarget = new Vec2;
    needsUpdateRetinaCamera = false;
    retinaFov = 40;
    retinaSize = 1.8;
    retinaZDistance = 5;
    crossHairSize = 0.03;
    /** Store displayconfig temporal changes between frames */
    tempDisplayConfig = {};
    displayConfigChanged = false;
    maxRetinaResolution = 1024;
    retinaRenderPasses;
    defaultRetinaRenderPass;
    gui;
    toggleRetinaAlpha(idx) {
        const { promise, jsBuffer } = this.retinaRenderPasses[idx];
        const guiRefresh = (i) => {
            const btn = document.querySelectorAll("span.btn-yellow div button")[i];
            this.guiButtons["cross"].setAttribute("data-name", btn.getAttribute("data-name"));
            this.guiButtons["cross"].setAttribute("title", btn.getAttribute("title"));
            this.guiButtons["cross"].setAttribute("data-title_zh", btn.getAttribute("data-title_zh"));
            this.guiButtons["cross"].setAttribute("data-title_en", btn.getAttribute("data-title_en"));
            this.guiButtons["cross"].style.backgroundImage = btn.style.backgroundImage;
        };
        if (promise) {
            promise.then(pass => {
                this.renderer.gpu.device.queue.writeBuffer(this.alphaBuffer, 0, jsBuffer.buffer, 0, 4 * 4);
                this.renderer.setRetinaRenderPass(pass);
                this.currentRetinaRenderPassIndex = idx;
                guiRefresh(idx);
            });
        }
        else {
            this.renderer.setRetinaRenderPass(this.defaultRetinaRenderPass);
            this.currentRetinaRenderPassIndex = -1;
            guiRefresh(0);
        }
    }
    getSubLayersNumber(updateCount) {
        // when < 32, we slow down layer speed
        let layers = this.renderer.getDisplayConfig('retinaLayers');
        if (layers > 32 || ((updateCount & 3) && (layers > 16 || (updateCount & 7)))) {
            if (layers > 0)
                layers--;
        }
        return layers;
    }
    getAddLayersNumber(updateCount) {
        let layers = this.renderer.getDisplayConfig('retinaLayers');
        if (updateCount === undefined)
            return Math.min(512, layers + 1);
        if (layers > 32 || ((updateCount & 3) && (layers > 16 || (updateCount & 7)))) {
            layers++;
        }
        return Math.min(512, layers);
    }
    update(state) {
        let enabled = (!state.getActionKey("enable", "retina") || state.isActionHold("enable", "retina")) && this.enabled && !state.isActionHold("disable", "retina");
        const on = (k) => state.isActionActive(k, "retina");
        let delta;
        // retreive all temporal changes before this frame
        let displayConfig = this.tempDisplayConfig;
        if (this.displayConfigChanged)
            this.tempDisplayConfig = {};
        this.displayConfigChanged = false;
        let stereo = this.renderer.getStereoMode();
        const refreshGUI = () => {
            const signature = this.retinaEyeOffset > 0 || this.sectionEyeOffset > 0;
            state.storage.data.preference['stereo'] = stereo ? signature ? "cross" : "parallel" : "off";
            state.storage.save();
            if (!this.guiButtons["crosseye"]) {
                console.warn("Retina Controller is not registered, cannot update GUI.");
                return;
            }
            this.guiButtons["crosseye"].parentElement.style.display = signature && stereo ? "inline-block" : "none";
            this.guiButtons["paralleleye"].parentElement.style.display = signature || !stereo ? "none" : "inline-block";
        };
        if (on("toggle3D")) {
            stereo = !stereo;
            this.writeConfigToggleStereoMode(displayConfig, stereo);
            refreshGUI();
        }
        else if (this.needResize) {
            displayConfig.sections = this.sectionPresets(this.renderer.getDisplayConfig("canvasSize"))[this.currentSectionConfig][(stereo ? "eye2" : "eye1")];
        }
        this.needResize = false;
        if (stereo) {
            if (on("addEyes3dGap")) {
                this.retinaEyeOffset *= 1.05;
                if (this.retinaEyeOffset > 0.4)
                    this.retinaEyeOffset = 0.4;
                if (this.retinaEyeOffset < -0.4)
                    this.retinaEyeOffset = -0.4;
                displayConfig.retinaStereoEyeOffset = this.retinaEyeOffset;
                displayConfig.sectionStereoEyeOffset = this.sectionEyeOffset;
            }
            if (on("subEyes3dGap")) {
                this.retinaEyeOffset /= 1.05;
                if (this.retinaEyeOffset > 0 && this.retinaEyeOffset < 0.03)
                    this.retinaEyeOffset = 0.03;
                if (this.retinaEyeOffset < 0 && this.retinaEyeOffset > -0.03)
                    this.retinaEyeOffset = -0.03;
                displayConfig.retinaStereoEyeOffset = this.retinaEyeOffset;
                displayConfig.sectionStereoEyeOffset = this.sectionEyeOffset;
            }
            if (on("addEyes4dGap")) {
                this.sectionEyeOffset *= 1.05;
                if (this.sectionEyeOffset > this.maxSectionEyeOffset)
                    this.sectionEyeOffset = this.maxSectionEyeOffset;
                if (this.sectionEyeOffset < -this.maxSectionEyeOffset)
                    this.sectionEyeOffset = -this.maxSectionEyeOffset;
                displayConfig.retinaStereoEyeOffset = this.retinaEyeOffset;
                displayConfig.sectionStereoEyeOffset = this.sectionEyeOffset;
            }
            if (on("subEyes4dGap")) {
                this.sectionEyeOffset /= 1.05;
                if (this.sectionEyeOffset > 0 && this.sectionEyeOffset < this.minSectionEyeOffset)
                    this.sectionEyeOffset = this.minSectionEyeOffset;
                if (this.sectionEyeOffset < 0 && this.sectionEyeOffset > -this.minSectionEyeOffset)
                    this.sectionEyeOffset = -this.minSectionEyeOffset;
                displayConfig.retinaStereoEyeOffset = this.retinaEyeOffset;
                displayConfig.sectionStereoEyeOffset = this.sectionEyeOffset;
            }
            if (on("negEyesGap")) {
                this.sectionEyeOffset = -this.sectionEyeOffset;
                this.retinaEyeOffset = -this.retinaEyeOffset;
                displayConfig.retinaStereoEyeOffset = this.retinaEyeOffset;
                displayConfig.sectionStereoEyeOffset = this.sectionEyeOffset;
                refreshGUI();
            }
        }
        if (on("toggleCrosshair")) {
            this.writeConfigToggleCrosshair(displayConfig);
        }
        if (on("addOpacity")) {
            displayConfig.opacity = this.renderer.getDisplayConfig("opacity") * (1 + this.opacityKeySpeed);
        }
        if (on("subOpacity")) {
            displayConfig.opacity = this.renderer.getDisplayConfig("opacity") / (1 + this.opacityKeySpeed);
        }
        if (on("addLayer")) {
            displayConfig.retinaLayers = this.getAddLayersNumber(state.updateCount);
        }
        if (on("subLayer")) {
            displayConfig.retinaLayers = this.getSubLayersNumber(state.updateCount);
        }
        if (on("addRetinaResolution")) {
            let res = this.renderer.getDisplayConfig('retinaResolution');
            res += this.renderer.getMinResolutionMultiple();
            if (res <= this.maxRetinaResolution)
                displayConfig.retinaResolution = res;
        }
        if (on("subRetinaResolution")) {
            let res = this.renderer.getDisplayConfig('retinaResolution');
            res -= this.renderer.getMinResolutionMultiple();
            if (res > 0)
                displayConfig.retinaResolution = res;
        }
        if (on("addFov")) {
            this.retinaFov += this.fovKeySpeed;
            if (this.retinaFov > 120)
                this.retinaFov = 120;
            this.needsUpdateRetinaCamera = true;
        }
        if (on("subFov")) {
            this.retinaFov -= this.fovKeySpeed;
            if (this.retinaFov < 0.1)
                this.retinaFov = 0;
            this.needsUpdateRetinaCamera = true;
        }
        if (on("toggleRetinaAlpha")) {
            this.currentRetinaRenderPassIndex++;
            if (this.currentRetinaRenderPassIndex >= retinaRenderPassDescriptors.length)
                this.currentRetinaRenderPassIndex = 0;
            this.toggleRetinaAlpha(this.currentRetinaRenderPassIndex);
        }
        if (enabled && state.currentBtn === this.retinaAlphaMouseButton && this.currentRetinaRenderPassIndex > 0) {
            const { jsBuffer } = this.retinaRenderPasses[this.currentRetinaRenderPassIndex];
            switch (this.currentRetinaRenderPassIndex) {
                case 1:
                    jsBuffer[4] += state.moveY * 0.01;
                    jsBuffer[5] += state.moveX * 0.01;
                    jsBuffer[4] = Math.max(0.01, Math.min(jsBuffer[4], _SQRT_3));
                    jsBuffer[5] = Math.max(1, Math.min(jsBuffer[5], 5));
                    const r2 = jsBuffer[4] * jsBuffer[4];
                    jsBuffer[0] = r2 / jsBuffer[5];
                    jsBuffer[1] = r2 * jsBuffer[5];
                    jsBuffer[2] = 4 / (1 + r2);
                    break;
                case 2:
                    jsBuffer[0] += state.moveY * 0.01;
                    jsBuffer[5] += state.moveX * 0.01;
                    jsBuffer[0] = Math.max(0.01, Math.min(jsBuffer[0], 1));
                    jsBuffer[5] = Math.max(0, Math.min(jsBuffer[5], 0.1));
                    jsBuffer[1] = 2 - jsBuffer[0];
                    jsBuffer[2] = jsBuffer[5];
                    break;
                case 3:
                    let n = new Vec3(jsBuffer[0], jsBuffer[1], jsBuffer[2]).norms();
                    // n.rotates(new Vec3(state.moveY, state.moveX).mulfs(0.01).exp());
                    let y = Math.acos(n.y) + state.moveX * 0.01;
                    let x = Math.atan2(n.z, n.x) + state.moveY * 0.01;
                    const sy = Math.sin(y);
                    n.set(Math.cos(x) * sy, Math.cos(y), Math.sin(x) * sy);
                    n.writeBuffer(jsBuffer);
            }
            this.renderer.gpu.device.queue.writeBuffer(this.alphaBuffer, 0, jsBuffer.buffer, 0, 4 * 4);
        }
        for (const label of this.sectionPresetLabels) {
            if (on("sectionConfigs." + label)) {
                state.storage.data.preference['sectionConfig'] = label;
                state.storage.save();
                this.toggleSectionConfig(label);
            }
        }
        delta = (on("rotateDown") ? -1 : 0) + (on("rotateUp") ? 1 : 0);
        let keyRotateSpeed = this.keyRotateSpeed * state.mspf;
        if (delta)
            this._vec2damp.y = delta * keyRotateSpeed;
        delta = (on("rotateLeft") ? 1 : 0) + (on("rotateRight") ? -1 : 0);
        if (delta)
            this._vec2damp.x = delta * keyRotateSpeed;
        if (enabled) {
            if (state.currentBtn === this.mouseButton) {
                this.refacingFront = false;
                if (state.moveX)
                    this._vec2damp.x = state.moveX * this.mouseSpeed;
                if (state.moveY)
                    this._vec2damp.y = state.moveY * this.mouseSpeed;
            }
            if (state.wheelY) {
                this.needsUpdateRetinaCamera = true;
                this.retinaSize += state.wheelY * this.wheelSpeed;
            }
        }
        if (on("refaceFront")) {
            this.refacingFront = true;
            this.refacingTarget.set();
        }
        else if (on("refaceRight")) {
            this.refacingFront = true;
            this.refacingTarget.set(_90, 0);
        }
        else if (on("refaceTop")) {
            this.refacingFront = true;
            this.refacingTarget.set(0, -_90);
        }
        else if (on("refaceLeft")) {
            this.refacingFront = true;
            this.refacingTarget.set(-_90, 0);
        }
        else if (on("refaceBottom")) {
            this.refacingFront = true;
            this.refacingTarget.set(0, _90);
        }
        if (this._vec2damp.norm1() < 1e-3 || this.refacingFront) {
            this._vec2damp.set(0, 0);
        }
        if (this._vec2damp.norm1() > 1e-3 || this.refacingFront || this.needsUpdateRetinaCamera) {
            if (this.needsUpdateRetinaCamera) {
                if (this.retinaFov > 0) {
                    this.retinaZDistance = this.retinaSize / Math.tan(this.retinaFov / 2 * _DEG2RAD);
                    displayConfig.camera3D = {
                        fov: this.retinaFov,
                        near: Math.max(0.01, this.retinaZDistance - 4),
                        far: this.retinaZDistance + 4
                    };
                }
                else {
                    this.retinaZDistance = 4;
                    displayConfig.camera3D = {
                        size: this.retinaSize,
                        near: 2,
                        far: 8
                    };
                }
            }
            this.needsUpdateRetinaCamera = false;
            this._vec2euler.x %= _360;
            this._vec2euler.y %= _360;
            let dampFactor = Math.exp(-this.damp * Math.min(200.0, state.mspf));
            if (this.refacingFront) {
                this._vec2euler.subs(this.refacingTarget).mulfs(dampFactor);
                if (this._vec2euler.norm1() < 0.01)
                    this.refacingFront = false;
                this._vec2euler.adds(this.refacingTarget);
            }
            this._vec2euler.adds(this._vec2damp);
            let mat = this._mat4.setFrom3DRotation(this._q1.expset(this._vec3.set(0, this._vec2euler.x, 0)).mulsr(this._q2.expset(this._vec3.set(this._vec2euler.y, 0, 0))).conjs());
            mat.elem[11] = -this.retinaZDistance;
            displayConfig.retinaViewMatrix = mat;
            this._vec2damp.mulfs(dampFactor);
        }
        this.renderer.setDisplayConfig(displayConfig);
    }
    writeConfigToggleStereoMode(dstConfig, stereo) {
        stereo ??= !this.renderer.getStereoMode();
        if (!stereo) {
            dstConfig.retinaStereoEyeOffset = 0;
            dstConfig.sectionStereoEyeOffset = 0;
        }
        else {
            dstConfig.retinaStereoEyeOffset = this.retinaEyeOffset;
            dstConfig.sectionStereoEyeOffset = this.sectionEyeOffset;
        }
        dstConfig.sections = this.sectionPresets(this.renderer.getDisplayConfig("canvasSize"))[this.currentSectionConfig][(stereo ? "eye2" : "eye1")];
    }
    toggleStereo(stereo) {
        this.gui?.refresh({ "toggleStereo": stereo || !this.renderer.getStereoMode() });
        this.writeConfigToggleStereoMode(this.tempDisplayConfig, stereo);
        this.displayConfigChanged = true;
    }
    writeConfigToggleCrosshair(dstConfig, size) {
        if (!size) {
            let crossHair = this.renderer.getDisplayConfig('crosshair');
            dstConfig.crosshair = crossHair === 0 ? this.crossHairSize : 0;
        }
        else {
            dstConfig.crosshair = size;
            this.crossHairSize = size;
        }
    }
    toggleCrosshair() {
        this.writeConfigToggleCrosshair(this.tempDisplayConfig);
        this.displayConfigChanged = true;
    }
    setSectionEyeOffset(offset) {
        let stereo = this.renderer.getStereoMode();
        this.sectionEyeOffset = offset;
        if (stereo) {
            this.tempDisplayConfig.sectionStereoEyeOffset = offset;
            this.displayConfigChanged = true;
        }
    }
    setRetinaEyeOffset(offset) {
        let stereo = this.renderer.getStereoMode();
        this.retinaEyeOffset = offset;
        if (stereo) {
            this.tempDisplayConfig.retinaStereoEyeOffset = offset;
            this.displayConfigChanged = true;
        }
    }
    setLayers(layers) {
        this.tempDisplayConfig.retinaLayers = layers;
        this.displayConfigChanged = true;
    }
    setOpacity(opacity) {
        this.tempDisplayConfig.opacity = opacity;
        this.displayConfigChanged = true;
    }
    setCrosshairSize(size) {
        this.tempDisplayConfig.crosshair = size;
        this.crossHairSize = size;
        this.displayConfigChanged = true;
    }
    setRetinaResolution(retinaResolution) {
        this.tempDisplayConfig.retinaResolution = retinaResolution;
        this.displayConfigChanged = true;
    }
    setRetinaSize(size) {
        this.retinaSize = size;
        this.needsUpdateRetinaCamera = true;
    }
    setRetinaFov(fov) {
        this.retinaFov = fov;
        this.needsUpdateRetinaCamera = true;
    }
    toggleSectionConfig(index) {
        if (this.currentSectionConfig === index)
            return;
        let preset = this.sectionPresets(this.renderer.getDisplayConfig("canvasSize"))[index];
        if (!preset)
            console.error(`Section Configuration "${index}" does not exsit.`);
        let layers = this.renderer.getDisplayConfig("retinaLayers");
        if (preset.retina === false && layers > 0) {
            this.rembemerLastLayers = layers;
            layers = 0;
        }
        else if (preset.retina === true && this.rembemerLastLayers) {
            layers = this.rembemerLastLayers;
            this.rembemerLastLayers = null;
        }
        let stereo = this.renderer.getStereoMode();
        let sections = preset[(stereo ? "eye2" : "eye1")];
        this.displayConfigChanged = true;
        this.tempDisplayConfig.retinaLayers = layers;
        this.tempDisplayConfig.sections = sections;
        this.currentSectionConfig = index;
        // refresh gui
        if (!this.guiButtons["slice"]) {
            console.warn("Retina Controller is not registered, cannot update GUI.");
            return;
        }
        const btn = Array.from(document.querySelectorAll("span.btn-red div button")).find(e => e.getAttribute("data-name") === "retina.sectionConfigs." + index);
        this.guiButtons["slice"].setAttribute("data-name", btn.getAttribute("data-name"));
        this.guiButtons["slice"].setAttribute("title", btn.getAttribute("title"));
        this.guiButtons["slice"].setAttribute("data-title_zh", btn.getAttribute("data-title_zh"));
        this.guiButtons["slice"].setAttribute("data-title_en", btn.getAttribute("data-title_en"));
        this.guiButtons["slice"].style.backgroundImage = btn.style.backgroundImage;
    }
    setSize(size) {
        this.tempDisplayConfig.canvasSize = size;
        this.displayConfigChanged = true;
        this.needResize = true;
    }
    setDisplayConfig(config) {
        if (config.canvasSize)
            this.setSize(config.canvasSize);
        if (config.opacity)
            this.setOpacity(config.opacity);
        if (config.retinaLayers)
            this.setLayers(config.retinaLayers);
        if (config.retinaResolution)
            this.setRetinaResolution(config.retinaResolution);
        if (config.crosshair)
            this.setCrosshairSize(config.crosshair);
        if (config.retinaStereoEyeOffset)
            this.setRetinaEyeOffset(config.retinaStereoEyeOffset);
        if (config.sectionStereoEyeOffset)
            this.setSectionEyeOffset(config.sectionStereoEyeOffset);
        if (config.screenBackgroundColor) {
            this.tempDisplayConfig.screenBackgroundColor = config.screenBackgroundColor;
            this.displayConfigChanged = true;
        }
    }
}
class RetinaCtrlGui {
    controller;
    dom;
    iconSize = 32;
    lang;
    refresh;
    createToggleDiv(CtrlBtn, display = "") {
        const div = document.createElement("div");
        div.style.display = "none";
        CtrlBtn.addEventListener("click", () => {
            div.style.display = div.style.display === "none" ? display : "none";
        });
        return div;
    }
    createDropBox(CtrlBtn, offset, width = 1) {
        const div = this.createToggleDiv(CtrlBtn);
        div.style.position = "absolute";
        div.className = "ctrl-gui";
        div.style.width = this.iconSize * width + "px";
        div.style.top = this.iconSize + "px";
        div.style.left = this.iconSize * offset + "px";
        return div;
    }
}

export { ControllerRegistry, FreeFlyController, KeepUpController, KeyState, RetinaController, RetinaCtrlGui, SVG_HEADER, SVG_LINE, TrackBallController, VoxelViewerController, sliceconfig };
//# sourceMappingURL=ctrl.js.map
