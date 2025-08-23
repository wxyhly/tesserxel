import { Obj4 } from "../math/algebra/affine.js";
import { Bivec } from "../math/algebra/bivec.js";
import { Mat4 } from "../math/algebra/mat4.js";
import { Quaternion } from "../math/algebra/quaternion.js";
import { Rotor } from "../math/algebra/rotor.js";
import { Vec2, vec2Pool } from "../math/algebra/vec2.js";
import { Vec3 } from "../math/algebra/vec3.js";
import { Vec4 } from "../math/algebra/vec4.js";
import { _360, _90, _DEG2RAD, _SQRT_3 } from "../math/const.js";
import { EyeStereo, SectionConfig, DisplayConfig, RetinaSliceFacing, SliceRenderer, RetinaRenderPass, RetinaRenderPassDescriptor } from "../render/slice/slice.js";

export interface IController {
    enabled?: boolean;
    update(state: ControllerState): void;
}
export interface ControllerConfig {
    preventDefault?: boolean;
    enablePointerLock?: boolean;
}
interface KeyConfig {
    [fn: string]: string;
}
export interface ControllerState {
    currentKeys: Map<String, KeyState>;
    /** holded mouse button */
    currentBtn: number;
    /** pressed mouse button */
    mouseDown: number;
    /** released mouse button */
    mouseUp: number;
    updateCount: number;
    moveX: number;
    moveY: number;
    mouseX: number;
    mouseY: number;
    wheelX: number;
    wheelY: number;
    lastUpdateTime?: number;
    mspf: number;
    requestPointerLock: () => void;
    enablePointerLock?: boolean;
    /** PointerLock has been triggered by the mouse */
    isPointerLockedMouseDown?: boolean;
    /** PointerLock has been canceled by key escape */
    isPointerLockEscaped?: boolean;
    /** code:
     *  'KeyA' for holding Key A
     *  '.KeyA' for pressing Key A 
     *  'ControlLeft+.KeyA' for press A while holding CtrlLeft*/
    isKeyHold: (code: string) => boolean;
    isPointerLocked: () => boolean;
    exitPointerLock: () => void;
}
export enum KeyState {
    NONE,
    UP,
    HOLD,
    DOWN,
}
export class ControllerRegistry {
    dom: HTMLElement;
    private ctrls: Array<IController>;
    enablePointerLock: boolean;
    readonly states: ControllerState = {
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

        isKeyHold: (_) => false,
        requestPointerLock: () => false,
        isPointerLocked: () => false,
        exitPointerLock: () => { }
    }
    /** if this is true, prevent default will not work  */
    disableDefaultEvent = false;
    private prevIsPointerLocked = false;
    private evMouseDown: (ev: MouseEvent) => any;
    private evMouseUp: (ev: MouseEvent) => any;
    private evMouseMove: (ev: MouseEvent) => any;
    private evWheel: (ev: WheelEvent) => any;
    private evKeyUp: (ev: KeyboardEvent) => any;
    private evKeyDown: (ev: KeyboardEvent) => any;
    private evContextMenu: (ev: MouseEvent) => any;
    constructor(dom: HTMLElement, ctrls: Array<IController>, config?: ControllerConfig) {
        this.dom = dom;
        dom.tabIndex = 1;
        this.ctrls = ctrls;
        this.enablePointerLock = config?.enablePointerLock ?? false;
        this.states.isKeyHold = (code) => {
            if (code.includes("|")) {
                for (let key of code.split("|")) {
                    if (this.states.isKeyHold(key)) return true;
                }
                return false;
            }
            for (let key of code.split("+")) {
                if (key[0] === '.') {
                    let state = this.states.currentKeys.get(key.slice(1));
                    if (state !== KeyState.DOWN) return false;
                } else {
                    let state = this.states.currentKeys.get(key);
                    if (!state || state === KeyState.UP) return false;
                }
            }
            return true;
        }
        this.states.isPointerLocked = () => {
            return ((!this.states.isPointerLockedMouseDown) && document.pointerLockElement === this.dom);
        }
        this.states.exitPointerLock = () => {
            if (document.pointerLockElement === this.dom) {
                document.exitPointerLock();
                // if we exit positively, then don't trigger isPointerLockEscaped in the next update
                this.prevIsPointerLocked = false;
            }
        }
        this.states.requestPointerLock = () => {
            if (document.pointerLockElement !== dom) {
                dom.requestPointerLock();
            }
        }

        // regist events

        this.evMouseDown = (ev) => {
            if (this.enablePointerLock && document.pointerLockElement !== dom) {
                dom.requestPointerLock();
                this.states.isPointerLockedMouseDown = true;
            } else {
                dom.focus();
            }
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
    add(ctrl: IController) {
        this.ctrls.push(ctrl);
    }

    remove(ctrl: IController) {
        this.ctrls = this.ctrls.filter(c => c !== ctrl);
    }
    unregist() {
        this.dom.removeEventListener("mousedown", this.evMouseDown);
        this.dom.removeEventListener("mousemove", this.evMouseMove);
        this.dom.removeEventListener("mouseup", this.evMouseUp);
        this.dom.removeEventListener("keydown", this.evKeyDown);
        this.dom.removeEventListener("keyup", this.evKeyUp);
        this.dom.removeEventListener("wheel", this.evWheel);
        if (this.evContextMenu) this.dom.removeEventListener("contextmenu", this.evContextMenu);
    }
    update() {
        this.states.enablePointerLock = this.enablePointerLock;
        this.states.isPointerLockEscaped = this.prevIsPointerLocked && !this.states.isPointerLocked();
        if (!this.states.lastUpdateTime) {
            this.states.mspf = 16.667;
            let now = new Date().getTime();
            this.states.lastUpdateTime = now;
        } else {
            let now = new Date().getTime();
            this.states.mspf = now - this.states.lastUpdateTime;
            this.states.lastUpdateTime = now;
        }
        for (let c of this.ctrls) {
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
            } else if (prevState === KeyState.UP) {
                newState = KeyState.NONE;
            }
            this.states.currentKeys.set(key, newState);
        }
    }
}
export class TrackBallController implements IController {
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
    normalisePeriodBit: 4;
    keyConfig = {
        disable: "AltLeft",
        enable: "",
    }
    cameraMode = false;
    private _bivec = new Bivec();
    private normalisePeriodMask = 15;
    constructor(object?: Obj4, cameraMode?: boolean) {
        if (object) this.object = object;
        this.cameraMode = cameraMode ?? false;
    }
    update(state: ControllerState) {
        let disabled = state.isKeyHold(this.keyConfig.disable) || !this.enabled;
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
        } else {
            this._bivec.mulfs(dampFactor);
        }
        const rotor = this._bivec.exp();
        if (this.cameraMode) {
            rotor.mulsrconj(this.object.rotation).mulsl(this.object.rotation);
            this.object.rotates(rotor);
            this.object.position.rotates(rotor);
        } else {
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
}
export class FreeFlyController implements IController {
    enabled = true;
    swapMouseYWithScrollY = false;
    object = new Obj4();
    mouseSpeed = 0.01;
    wheelSpeed = 0.0005;
    keyMoveSpeed = 0.001;
    keyRotateSpeed = 0.001;
    damp = 0.01;
    constructor(object?: Obj4) {
        if (object) this.object = object;
    }
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
        spinCW: "KeyF|KeyZ",
        spinCCW: "KeyH|KeyX",
        rollCW: "KeyR",
        rollCCW: "KeyY",
        pitchCW: "KeyG",
        pitchCCW: "KeyT",
        disable: "AltLeft",
        enable: "",
    }
    /** how many update cycles (2^n) to normalise rotor to avoid accuracy problem */
    normalisePeriodBit: 4;
    private _bivec = new Bivec();
    private _bivecKey = new Bivec();
    private _moveVec = new Vec4();
    private _vec = new Vec4();
    private normalisePeriodMask = 15;

    update(state: ControllerState) {
        let on = state.isKeyHold;
        let key = this.keyConfig;
        let delta: number;
        let dampFactor = Math.exp(-this.damp * Math.min(200.0, state.mspf));
        let disabled = state.isKeyHold(this.keyConfig.disable) || !this.enabled;
        if (!disabled) {

            let keyRotateSpeed = this.keyRotateSpeed * state.mspf;
            delta = (on(key.pitchCW) ? -1 : 0) + (on(key.pitchCCW) ? 1 : 0);
            if (delta) this._bivecKey.yz = delta * keyRotateSpeed;
            delta = (on(key.spinCW) ? -1 : 0) + (on(key.spinCCW) ? 1 : 0);
            if (delta) this._bivecKey.xz = delta * keyRotateSpeed;
            delta = (on(key.rollCW) ? -1 : 0) + (on(key.rollCCW) ? 1 : 0);
            if (delta) this._bivecKey.xy = delta * keyRotateSpeed;
            delta = (on(key.turnLeft) ? -1 : 0) + (on(key.turnRight) ? 1 : 0);
            if (delta) this._bivecKey.xw = delta * keyRotateSpeed;
            delta = (on(key.turnUp) ? 1 : 0) + (on(key.turnDown) ? -1 : 0);
            if (delta) this._bivecKey.yw = delta * keyRotateSpeed;
            delta = (on(key.turnAna) ? -1 : 0) + (on(key.turnKata) ? 1 : 0);
            if (delta) this._bivecKey.zw = delta * keyRotateSpeed;
        }
        this._bivec.copy(this._bivecKey);
        this._bivecKey.mulfs(dampFactor);
        if (!disabled) {
            if ((state.enablePointerLock && state.isPointerLocked()) || (state.currentBtn = 0 && !state.enablePointerLock)) {
                let dx = state.moveX * this.mouseSpeed;
                let dy = -state.moveY * this.mouseSpeed;
                this._bivec.xw += dx;
                if (this.swapMouseYWithScrollY) {
                    this._bivec.yw += dy;
                } else {
                    this._bivec.zw -= dy;
                }
            }
            if ((state.enablePointerLock && state.isPointerLocked()) || (!state.enablePointerLock)) {
                let wx = state.wheelX * this.wheelSpeed;
                let wy = state.wheelY * this.wheelSpeed;
                this._bivec.xy += wx;
                if (this.swapMouseYWithScrollY) {
                    this._bivec.zw += wy;
                } else {
                    this._bivec.yw -= wy;
                }
            }
            let keyMoveSpeed = this.keyMoveSpeed * state.mspf;
            delta = (on(key.left) ? -1 : 0) + (on(key.right) ? 1 : 0);
            if (delta) this._moveVec.x = delta * keyMoveSpeed;
            delta = (on(key.up) ? 1 : 0) + (on(key.down) ? -1 : 0);
            if (delta) this._moveVec.y = delta * keyMoveSpeed;
            delta = (on(key.ana) ? -1 : 0) + (on(key.kata) ? 1 : 0);
            if (delta) this._moveVec.z = delta * keyMoveSpeed;
            delta = (on(key.front) ? -1 : 0) + (on(key.back) ? 1 : 0);
            if (delta) this._moveVec.w = delta * keyMoveSpeed;
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
export class KeepUpController implements IController {
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
        disable: "AltLeft",
        enable: ""
    }
    /** how many update cycles (2^n) to normalise rotor to avoid accuracy problem */
    normalisePeriodBit: 4;
    private _bivec = new Bivec();
    private _bivec2 = new Bivec();
    private _bivecKey = new Bivec();
    private _moveVec = new Vec4();
    private _vec = new Vec4();
    private normalisePeriodMask = 15;
    private horizontalRotor = new Rotor();
    private verticalRotor = new Rotor();

    constructor(object?: Obj4) {
        if (object) this.object = object;
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
    update(state: ControllerState) {
        let on = state.isKeyHold;
        let key = this.keyConfig;
        let delta: number;
        let dampFactor = Math.exp(-this.damp * Math.min(200.0, state.mspf));
        let disabled = state.isKeyHold(this.keyConfig.disable);
        if (!this.enabled) return;
        if (!disabled) {

            let keyRotateSpeed = this.keyRotateSpeed * state.mspf;
            delta = (on(key.spinCW) ? -1 : 0) + (on(key.spinCCW) ? 1 : 0);
            if (delta) this._bivecKey.xz = delta * keyRotateSpeed;
            delta = (on(key.turnLeft) ? -1 : 0) + (on(key.turnRight) ? 1 : 0);
            if (delta) this._bivecKey.xw = delta * keyRotateSpeed;
            delta = (on(key.turnUp) ? 1 : 0) + (on(key.turnDown) ? -1 : 0);
            if (delta) this._bivecKey.yw = delta * keyRotateSpeed;
            delta = (on(key.turnAna) ? -1 : 0) + (on(key.turnKata) ? 1 : 0);
            if (delta) this._bivecKey.zw = delta * keyRotateSpeed;
        }
        this._bivec.xw = this._bivecKey.xw;
        this._bivec.zw = this._bivecKey.zw;
        if (!disabled) {
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
        if (!disabled) {
            let keyMoveSpeed = this.keyMoveSpeed * state.mspf;
            delta = (on(key.left) ? -1 : 0) + (on(key.right) ? 1 : 0);
            if (delta) this._moveVec.x = delta * keyMoveSpeed;
            delta = (on(key.up) ? 1 : 0) + (on(key.down) ? -1 : 0);
            if (delta) this._moveVec.y = delta * keyMoveSpeed;
            delta = (on(key.ana) ? -1 : 0) + (on(key.kata) ? 1 : 0);
            if (delta) this._moveVec.z = delta * keyMoveSpeed;
            delta = (on(key.front) ? -1 : 0) + (on(key.back) ? 1 : 0);
            if (delta) this._moveVec.w = delta * keyMoveSpeed;
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
export class VoxelViewerController implements IController {
    enabled = true;
    object = new Obj4(Vec4.w.neg());
    mouseSpeed = 0.01;
    wheelSpeed = 0.0001;
    damp = 0.1;
    mousePan = 2;
    mousePanZ = 1;
    mouseRotate = 0;
    /** how many update cycles (2^n) to normalise rotor to avoid accuracy problem */
    normalisePeriodBit: 4;
    keyConfig = {
        disable: "AltLeft",
        enable: "",
    }
    private _bivec = new Bivec();
    private _vec = new Vec4();
    private _wy = 0;
    private normalisePeriodMask = 15;
    constructor(object?: Obj4) {
        if (object) this.object = object;
    }
    update(state: ControllerState) {
        let disabled = state.isKeyHold(this.keyConfig.disable) || !this.enabled;
        let dampFactor = Math.exp(-this.damp * Math.min(200.0, state.mspf));
        if (!disabled) {
            let dx = state.moveX * this.mouseSpeed;
            let dy = -state.moveY * this.mouseSpeed;
            let wy = state.wheelY * this.wheelSpeed;
            switch (state.currentBtn) {
                case this.mousePan:
                    this._vec.set(dx * this.object.scale!.x, dy * this.object.scale!.y).rotates(this.object.rotation)
                    this._bivec.set();
                    break;
                case this.mousePanZ:
                    this._vec.set(dx * this.object.scale!.x, 0, -dy * this.object.scale!.z).rotates(this.object.rotation);
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
            if (this.object.scale) this.object.scale.mulfs(1 + this._wy);
        } else {
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
interface SectionPreset {
    retina: boolean,
    eye1: SectionConfig[],
    eye2: SectionConfig[]
}
export namespace sliceconfig {

    export function singlezslice1eye(screenSize: { width: number, height: number }): SectionConfig[] {
        let aspect = screenSize.height / screenSize.width;
        let resolution = screenSize.height;
        return [{
            slicePos: 0,
            facing: RetinaSliceFacing.POSZ,
            viewport: { x: 0, y: 0, width: 1 / aspect, height: 1.0 },
            resolution
        }];

    }
    export function singlezslice2eye(screenSize: { width: number, height: number }): SectionConfig[] {
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
    export function singleyslice1eye(screenSize: { width: number, height: number }): SectionConfig[] {
        let aspect = screenSize.height / screenSize.width;
        let resolution = screenSize.height;
        return [{
            slicePos: 0,
            facing: RetinaSliceFacing.NEGY,
            viewport: { x: 0, y: 0, width: 1 / aspect, height: 1.0 },
            resolution
        }];
    }
    export function singleyslice2eye(screenSize: { width: number, height: number }): SectionConfig[] {
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
    export function zslices1eye(
        step: number, maxpos: number, screenSize: { width: number, height: number }
    ): SectionConfig[] {
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
    export function zslices2eye(
        step: number, maxpos: number, screenSize: { width: number, height: number }
    ): SectionConfig[] {
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
        })).concat(
            arr.map(pos => ({
                slicePos: pos[0],
                facing: RetinaSliceFacing.POSZ,
                eyeStereo: EyeStereo.RightEye,
                viewport: { x: (pos[1] * half) + 0.5, y: size - 1, width: size, height: size },
                resolution
            }))
        );
    }

    export function yslices1eye(
        step: number, maxpos: number, screenSize: { width: number, height: number }
    ): SectionConfig[] {
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
    export function yslices2eye(
        step: number, maxpos: number, screenSize: { width: number, height: number }
    ): SectionConfig[] {
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
        })).concat(
            arr.map(pos => ({
                slicePos: pos[0],
                facing: RetinaSliceFacing.NEGY,
                eyeStereo: EyeStereo.RightEye,
                viewport: { x: (pos[1] * half) + 0.5, y: size - 1, width: size, height: size },
                resolution
            }))
        );
    }
    export function default2eye(
        size: number, screenSize: { width: number, height: number }
    ): SectionConfig[] {
        let aspect = screenSize.height / screenSize.width;
        let resolution = screenSize.height * size;
        let wsize: number;
        let size_aspect: number;
        if (size >= 0.5) {
            wsize = 0.25 / aspect;
            size_aspect = 0.25;
            size = 0.5;
        } else {
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
    };
    export function default1eye(size: number, screenSize: { width: number, height: number }): SectionConfig[] {
        let aspect = screenSize.height / screenSize.width;
        let resolution = screenSize.height * size;
        let wsize: number;
        let size_aspect: number;
        if (size >= 0.5) {
            wsize = 0.5 / aspect;
            size_aspect = 0.5;
            size = 0.5;
        } else {
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

}
const retinaRenderPassDescriptors: RetinaRenderPassDescriptor[] = [
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
export class RetinaController implements IController {
    enabled = true;
    renderer: SliceRenderer;
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
    size: GPUExtent3DStrict;
    sectionPresets: (screenSize: GPUExtent3DStrict) => { [label: string]: SectionPreset };
    private currentSectionConfig: string = "retina+sections";
    private rembemerLastLayers: number;
    private needResize: boolean = true;
    private currentRetinaRenderPassIndex = -1;
    keyConfig = {
        enable: "AltLeft",
        disable: "",
        addOpacity: "KeyQ",
        subOpacity: "KeyA",
        addLayer: "KeyW",
        subLayer: "KeyS",
        addRetinaResolution: ".KeyE",
        subRetinaResolution: ".KeyD",
        addFov: "KeyT",
        subFov: "KeyG",
        toggle3D: ".KeyZ",
        addEyes3dGap: "KeyB",
        subEyes3dGap: "KeyV",
        addEyes4dGap: "KeyM",
        subEyes4dGap: "KeyN",
        negEyesGap: ".KeyX",
        toggleCrosshair: ".KeyC",
        rotateLeft: "ArrowLeft",
        rotateRight: "ArrowRight",
        rotateUp: "ArrowUp",
        rotateDown: "ArrowDown",
        refaceFront: ".KeyR",
        refaceRight: ".KeyL",
        refaceLeft: ".KeyJ",
        refaceTop: ".KeyI",
        refaceBottom: ".KeyK",
        toggleRetinaAlpha: ".KeyF",
        sectionConfigs: {
            "retina+sections": ".Digit1",
            "retina+bigsections": ".Digit2",
            "retina": ".Digit3",
            "sections": ".Digit4",
            "zsection": ".Digit5",
            "ysection": ".Digit6",
            "retina+zslices": ".Digit7",
            "retina+yslices": ".Digit8",
        },
    }
    private alphaBuffer: GPUBuffer;
    guiMouseOperation = "";
    constructor(r: SliceRenderer) {
        this.renderer = r;
        const gui = new RetinaCtrlGui(this);
        this.gui = gui;
        document.body.appendChild(gui.dom);
        this.defaultRetinaRenderPass = r.getCurrentRetinaRenderPass();
        this.alphaBuffer = r.gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 16, "RetinaController's Retina Alpha Uniform Buffer");
        this.retinaRenderPasses = retinaRenderPassDescriptors.map((desc, index) => {
            if (desc?.alphaShader?.code && desc.alphaShader.code.indexOf("@group(1)") !== -1) desc.alphaShaderBindingResources = [{ buffer: this.alphaBuffer }];
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
        this.sectionPresets = (screenSize: { width: number; height: number; }) => ({
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
    private _vec2damp = new Vec2();
    private _vec2euler = new Vec2();
    private _vec3 = new Vec3();
    private _q1 = new Quaternion();
    private _q2 = new Quaternion();
    private _mat4 = new Mat4();
    private refacingFront: boolean = false;
    private refacingTarget = new Vec2;
    private needsUpdateRetinaCamera: boolean = false;
    private retinaFov: number = 40;
    private retinaSize = 1.8;
    private retinaZDistance = 5;
    private crossHairSize = 0.03;
    /** Store displayconfig temporal changes between frames */
    private tempDisplayConfig: DisplayConfig = {};
    private displayConfigChanged = false;
    maxRetinaResolution = 1024;
    private retinaRenderPasses: { promise: Promise<RetinaRenderPass>, jsBuffer: Float32Array }[];
    private defaultRetinaRenderPass: RetinaRenderPass;
    gui: RetinaCtrlGui;

    toggleRetinaAlpha(idx: number) {
        const { promise, jsBuffer } = this.retinaRenderPasses[idx];
        if (promise) {
            promise.then(pass => {
                this.renderer.gpu.device.queue.writeBuffer(this.alphaBuffer, 0, jsBuffer.buffer, 0, 4);
                this.renderer.setRetinaRenderPass(pass);
                this.gui?.refresh({ "toggleRetinaAlpha": idx });
                this.currentRetinaRenderPassIndex = idx;
            });
        } else {
            this.renderer.setRetinaRenderPass(this.defaultRetinaRenderPass);
            this.gui?.refresh({ "toggleRetinaAlpha": idx });
            this.currentRetinaRenderPassIndex = -1;
        }
    }
    getSubLayersNumber(updateCount?: number) {
        // when < 32, we slow down layer speed
        let layers = this.renderer.getDisplayConfig('retinaLayers');
        if (layers > 32 || ((updateCount & 3) && (layers > 16 || (updateCount & 7)))) {
            if (layers > 0) layers--;
        }
        return layers;
    }
    getAddLayersNumber(updateCount?: number) {
        let layers = this.renderer.getDisplayConfig('retinaLayers');
        if (updateCount === undefined) return Math.min(512, layers + 1);
        if (layers > 32 || ((updateCount & 3) && (layers > 16 || (updateCount & 7)))) {
            layers++;
        }
        return Math.min(512, layers);
    }
    update(state: ControllerState): void {
        let enabled = (!this.keyConfig.enable || state.isKeyHold(this.keyConfig.enable)) && this.enabled;
        const on = (k: string) => state.isKeyHold(k) && enabled;
        let key = this.keyConfig;
        let delta: number;

        // retreive all temporal changes before this frame
        let displayConfig: DisplayConfig = this.tempDisplayConfig;
        if (this.displayConfigChanged) this.tempDisplayConfig = {};
        this.displayConfigChanged = false;

        let stereo = this.renderer.getStereoMode();
        if (on(this.keyConfig.toggle3D)) {
            this.writeConfigToggleStereoMode(displayConfig, !stereo);
            this.gui?.refresh({ "toggleStereo": !stereo });
        } else if (this.needResize) {
            displayConfig.sections = this.sectionPresets(this.renderer.getDisplayConfig("canvasSize"))[this.currentSectionConfig][(
                stereo ? "eye2" : "eye1"
            )];
        }
        this.needResize = false;
        if (stereo) {
            if (on(this.keyConfig.addEyes3dGap)) {
                this.retinaEyeOffset *= 1.05;
                if (this.retinaEyeOffset > 0.4) this.retinaEyeOffset = 0.4;
                if (this.retinaEyeOffset < -0.4) this.retinaEyeOffset = -0.4;
                displayConfig.retinaStereoEyeOffset = this.retinaEyeOffset;
                displayConfig.sectionStereoEyeOffset = this.sectionEyeOffset;
            }
            if (on(this.keyConfig.subEyes3dGap)) {
                this.retinaEyeOffset /= 1.05;
                if (this.retinaEyeOffset > 0 && this.retinaEyeOffset < 0.03) this.retinaEyeOffset = 0.03;
                if (this.retinaEyeOffset < 0 && this.retinaEyeOffset > -0.03) this.retinaEyeOffset = -0.03;
                displayConfig.retinaStereoEyeOffset = this.retinaEyeOffset;
                displayConfig.sectionStereoEyeOffset = this.sectionEyeOffset;
            }
            if (on(this.keyConfig.addEyes4dGap)) {
                this.sectionEyeOffset *= 1.05;
                if (this.sectionEyeOffset > this.maxSectionEyeOffset) this.sectionEyeOffset = this.maxSectionEyeOffset;
                if (this.sectionEyeOffset < -this.maxSectionEyeOffset) this.sectionEyeOffset = -this.maxSectionEyeOffset;
                displayConfig.retinaStereoEyeOffset = this.retinaEyeOffset;
                displayConfig.sectionStereoEyeOffset = this.sectionEyeOffset;
            }
            if (on(this.keyConfig.subEyes4dGap)) {
                this.sectionEyeOffset /= 1.05;
                if (this.sectionEyeOffset > 0 && this.sectionEyeOffset < this.minSectionEyeOffset) this.sectionEyeOffset = this.minSectionEyeOffset;
                if (this.sectionEyeOffset < 0 && this.sectionEyeOffset > -this.minSectionEyeOffset) this.sectionEyeOffset = -this.minSectionEyeOffset;
                displayConfig.retinaStereoEyeOffset = this.retinaEyeOffset;
                displayConfig.sectionStereoEyeOffset = this.sectionEyeOffset;
            }
            if (this.guiMouseOperation === "negEyesGap" || on(this.keyConfig.negEyesGap)) {
                this.sectionEyeOffset = -this.sectionEyeOffset;
                this.retinaEyeOffset = -this.retinaEyeOffset;
                displayConfig.retinaStereoEyeOffset = this.retinaEyeOffset;
                displayConfig.sectionStereoEyeOffset = this.sectionEyeOffset;
                this.gui?.refresh({ "negEyesGap": this.retinaEyeOffset > 0 || this.sectionEyeOffset > 0 });
            }
        }
        if (on(this.keyConfig.toggleCrosshair)) {
            this.writeConfigToggleCrosshair(displayConfig);
        }
        if (this.guiMouseOperation === "opacitypBtn" || on(this.keyConfig.addOpacity)) {
            displayConfig.opacity = this.renderer.getDisplayConfig("opacity") * (1 + this.opacityKeySpeed);
        }
        if (this.guiMouseOperation === "opacitymBtn" || on(this.keyConfig.subOpacity)) {
            displayConfig.opacity = this.renderer.getDisplayConfig("opacity") / (1 + this.opacityKeySpeed);
        }
        if (this.guiMouseOperation === "layerpBtn" || on(this.keyConfig.addLayer)) {
            displayConfig.retinaLayers = this.getAddLayersNumber(state.updateCount);
        }
        if (this.guiMouseOperation === "layermBtn" || on(this.keyConfig.subLayer)) {
            displayConfig.retinaLayers = this.getSubLayersNumber(state.updateCount);
        }
        if (this.guiMouseOperation === "respBtn" || on(this.keyConfig.addRetinaResolution)) {
            this.guiMouseOperation = "";
            let res = this.renderer.getDisplayConfig('retinaResolution');
            res += this.renderer.getMinResolutionMultiple();
            if (res <= this.maxRetinaResolution) displayConfig.retinaResolution = res;
        }
        if (this.guiMouseOperation === "resmBtn" || on(this.keyConfig.subRetinaResolution)) {
            this.guiMouseOperation = "";
            let res = this.renderer.getDisplayConfig('retinaResolution');
            res -= this.renderer.getMinResolutionMultiple();
            if (res > 0) displayConfig.retinaResolution = res;
        }
        if (this.guiMouseOperation === "fovpBtn" || on(this.keyConfig.addFov)) {
            this.retinaFov += this.fovKeySpeed;
            if (this.retinaFov > 120) this.retinaFov = 120;
            this.needsUpdateRetinaCamera = true;
        }
        if (this.guiMouseOperation === "fovmBtn" || on(this.keyConfig.subFov)) {
            this.retinaFov -= this.fovKeySpeed;
            if (this.retinaFov < 0.1) this.retinaFov = 0;
            this.needsUpdateRetinaCamera = true;
        }
        if (on(this.keyConfig.toggleRetinaAlpha)) {
            this.currentRetinaRenderPassIndex++;
            if (this.currentRetinaRenderPassIndex >= retinaRenderPassDescriptors.length) this.currentRetinaRenderPassIndex = 0;
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
            this.renderer.gpu.device.queue.writeBuffer(this.alphaBuffer, 0, jsBuffer.buffer, 0, 4);
        }
        for (let [label, keyCode] of Object.entries(this.keyConfig.sectionConfigs)) {
            if (on(keyCode)) {
                this.toggleSectionConfig(label);
            }
        }
        delta = (on(key.rotateDown) ? -1 : 0) + (on(key.rotateUp) ? 1 : 0);
        let keyRotateSpeed = this.keyRotateSpeed * state.mspf;
        if (delta) this._vec2damp.y = delta * keyRotateSpeed;
        delta = (on(key.rotateLeft) ? 1 : 0) + (on(key.rotateRight) ? -1 : 0);
        if (delta) this._vec2damp.x = delta * keyRotateSpeed;
        if (enabled) {
            if (state.currentBtn === this.mouseButton) {
                this.refacingFront = false;
                if (state.moveX) this._vec2damp.x = state.moveX * this.mouseSpeed;
                if (state.moveY) this._vec2damp.y = state.moveY * this.mouseSpeed;
            }
            if (state.wheelY) {
                this.needsUpdateRetinaCamera = true;
                this.retinaSize += state.wheelY * this.wheelSpeed;
            }
        }
        if (on(key.refaceFront)) {
            this.refacingFront = true;
            this.refacingTarget.set();
        } else if (on(key.refaceRight)) {
            this.refacingFront = true;
            this.refacingTarget.set(_90, 0);
        } else if (on(key.refaceTop)) {
            this.refacingFront = true;
            this.refacingTarget.set(0, -_90);
        } else if (on(key.refaceLeft)) {
            this.refacingFront = true;
            this.refacingTarget.set(-_90, 0);
        } else if (on(key.refaceBottom)) {
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
                } else {
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
                if (this._vec2euler.norm1() < 0.01) this.refacingFront = false;
                this._vec2euler.adds(this.refacingTarget);
            }
            this._vec2euler.adds(this._vec2damp);
            let mat = this._mat4.setFrom3DRotation(this._q1.expset(this._vec3.set(0, this._vec2euler.x, 0)).mulsr(
                this._q2.expset(this._vec3.set(this._vec2euler.y, 0, 0))
            ).conjs());
            mat.elem[11] = -this.retinaZDistance;
            displayConfig.retinaViewMatrix = mat;
            this._vec2damp.mulfs(dampFactor);
        }
        this.renderer.setDisplayConfig(displayConfig);
    }
    private writeConfigToggleStereoMode(dstConfig: DisplayConfig, stereo?: boolean) {
        stereo ??= !this.renderer.getStereoMode();
        if (!stereo) {
            dstConfig.retinaStereoEyeOffset = 0;
            dstConfig.sectionStereoEyeOffset = 0;
        } else {
            dstConfig.retinaStereoEyeOffset = this.retinaEyeOffset;
            dstConfig.sectionStereoEyeOffset = this.sectionEyeOffset;
        }
        dstConfig.sections = this.sectionPresets(this.renderer.getDisplayConfig("canvasSize"))[this.currentSectionConfig][(
            stereo ? "eye2" : "eye1"
        )];
    }
    toggleStereo(stereo?: boolean) {
        this.gui?.refresh({ "toggleStereo": stereo || !this.renderer.getStereoMode() });
        this.writeConfigToggleStereoMode(this.tempDisplayConfig, stereo);
        this.displayConfigChanged = true;
    }
    private writeConfigToggleCrosshair(dstConfig: DisplayConfig, size?: number) {
        if (!size) {
            let crossHair = this.renderer.getDisplayConfig('crosshair');
            dstConfig.crosshair = crossHair === 0 ? this.crossHairSize : 0;
        } else {
            dstConfig.crosshair = size;
            this.crossHairSize = size;
        }
    }
    toggleCrosshair() {
        this.writeConfigToggleCrosshair(this.tempDisplayConfig);
        this.displayConfigChanged = true;
    }
    setSectionEyeOffset(offset: number) {
        let stereo = this.renderer.getStereoMode();
        this.sectionEyeOffset = offset;
        if (stereo) { this.tempDisplayConfig.sectionStereoEyeOffset = offset; this.displayConfigChanged = true; }
    }
    setRetinaEyeOffset(offset: number) {
        let stereo = this.renderer.getStereoMode();
        this.retinaEyeOffset = offset;
        if (stereo) { this.tempDisplayConfig.retinaStereoEyeOffset = offset; this.displayConfigChanged = true; }
    }
    setLayers(layers: number) {
        this.tempDisplayConfig.retinaLayers = layers;
        this.displayConfigChanged = true;
    }
    setOpacity(opacity: number) {
        this.tempDisplayConfig.opacity = opacity;
        this.displayConfigChanged = true;
    }
    setCrosshairSize(size: number) {
        this.tempDisplayConfig.crosshair = size;
        this.crossHairSize = size;
        this.displayConfigChanged = true;
    }
    setRetinaResolution(retinaResolution: number) {
        this.tempDisplayConfig.retinaResolution = retinaResolution;
        this.displayConfigChanged = true;
    }
    setRetinaSize(size: number) {
        this.retinaSize = size;
        this.needsUpdateRetinaCamera = true;
    }
    setRetinaFov(fov: number) {
        this.retinaFov = fov;
        this.needsUpdateRetinaCamera = true;
    }
    toggleSectionConfig(index: string) {
        if (this.currentSectionConfig === index) return;
        let preset = this.sectionPresets(this.renderer.getDisplayConfig("canvasSize"))[index];
        if (!preset) console.error(`Section Configuration "${index}" does not exsit.`);
        let layers = this.renderer.getDisplayConfig("retinaLayers");
        if (preset.retina === false && layers > 0) {
            this.rembemerLastLayers = layers;
            layers = 0;
        } else if (preset.retina === true && this.rembemerLastLayers) {
            layers = this.rembemerLastLayers;
            this.rembemerLastLayers = null;
        }
        let stereo = this.renderer.getStereoMode();
        let sections = preset[(
            stereo ? "eye2" : "eye1"
        )];
        this.displayConfigChanged = true;
        this.tempDisplayConfig.retinaLayers = layers;
        this.tempDisplayConfig.sections = sections;
        this.currentSectionConfig = index;
        this.gui?.refresh({ "toggleSectionConfig": index });
    }
    setSize(size: GPUExtent3DStrict) {
        this.tempDisplayConfig.canvasSize = size;
        this.displayConfigChanged = true;
        this.needResize = true;
    }
    setDisplayConfig(config: DisplayConfig) {
        if (config.canvasSize) this.setSize(config.canvasSize);
        if (config.opacity) this.setOpacity(config.opacity);
        if (config.retinaLayers) this.setLayers(config.retinaLayers);
        if (config.retinaResolution) this.setRetinaResolution(config.retinaResolution);
        if (config.crosshair) this.setCrosshairSize(config.crosshair);
        if (config.retinaStereoEyeOffset) this.setRetinaEyeOffset(config.retinaStereoEyeOffset);
        if (config.sectionStereoEyeOffset) this.setSectionEyeOffset(config.sectionStereoEyeOffset);
        if (config.screenBackgroundColor) {
            this.tempDisplayConfig.screenBackgroundColor = config.screenBackgroundColor;
            this.displayConfigChanged = true;
        }
    }
}

export class RetinaCtrlGui {
    controller: RetinaController;
    dom: HTMLDivElement;
    iconSize = 32;
    lang?: "zh" | "en";
    refresh: (param: any) => void;
    createToggleDiv(CtrlBtn: HTMLButtonElement, display: string = "") {
        const div = document.createElement("div");
        div.style.display = "none";
        CtrlBtn.addEventListener("click", () => {
            div.style.display = div.style.display === "none" ? display : "none";
        });
        return div;
    }
    createDropBox(CtrlBtn: HTMLButtonElement, offset: number, width: number = 1) {
        const div = this.createToggleDiv(CtrlBtn);
        div.style.position = "absolute";
        div.className = "retina-ctrl-gui"
        div.style.width = this.iconSize * width + "px";
        div.style.top = this.iconSize + "px";
        div.style.left = this.iconSize * offset + "px";
        return div;
    }
    toggle() {
        this.dom.style.display = this.dom.style.display === "none" ? "" : "none";
    }
    constructor(retinaCtrl: RetinaController) {
        this.controller = retinaCtrl;
        this.dom = document.createElement("div");
        this.dom.style.position = "fixed";
        this.dom.style.top = "50vh";
        this.dom.style.right = "0";
        document.body.appendChild(this.dom);

        // write gui and set size event

        const SVG_HEADER = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='`;
        const SVG_LINE = `style="fill:none;stroke:#FFF;stroke-width:0.25;"`;
        const SVG_PLUS = `<text x="1.5" y="3.5" stroke="#F00" style="font-size:3px">+</text>`;
        const SVG_MINUS = `<text x="2" y="3.5" stroke="#F00" style="font-size:3px">-</text>`;
        const SVG_RETINA = `<path d="M 1.3,3.3 2.5,4 4.1,3.6 V 2 L 2.9,1.3 1.3,1.7 Z"/>`;
        const SVG_CHECKER = `${SVG_HEADER}0 0 5 5'><g style="fill:#FFF"><rect width="1" height="1" x="0.5" y="0.5"/><rect width="1" height="1" x="2.5" y="0.5"/><rect width="1" height="1" x="1.5" y="1.5"/><rect width="1" height="1" x="3.5" y="1.5"/><rect width="1" height="1" x="0.5" y="2.5"/><rect width="1" height="1" x="2.5" y="2.5"/><rect width="1" height="1" x="1.5" y="3.5"/><rect width="1" height="1" x="3.5" y="3.5"/>`;
        const SVG_CAM = `${SVG_HEADER}0 0 5 5'><g ${SVG_LINE}><circle cx="0.77" cy="1.57" r="0.4"/><rect width="2.36" height="1.6" x="0.39" y="2.15"/><circle cx="1.9" cy="1.35" r="0.66"/><path d="M 2.74,2.48 4.89,1"/><path d="m 2.77,3.27 2.16,1.4"/><path d="m 4.46,1.9 c 0.23,0.65 0.28,1.3 0.03,1.9"/><path d="M 4.24,2.4 4.36,1.7 4.9,2.18"/><path d="M 4.23,3.2 4.41,3.9 5,3.4"/>`;
        const mainBtn = this.addBtn(`${SVG_HEADER}0.6 0.5 4.5 4.5'><g ${SVG_LINE}><path d="M 1.9,4.53 1.4,4.24 1.51,3.73 C 1.43,3.65 1.36,3.56 1.3,3.46 L 0.77,3.43 0.62,2.87 1.07,2.58 C 1.07,2.47 1.08,2.36 1.11,2.25 L 0.76,1.84 1.05,1.34 1.56,1.45 C 1.64,1.37 1.73,1.3 1.83,1.24 L 1.86,0.71 2.42,0.56 2.71,1 c 0.11,0 0.23,0.02 0.34,0.04 L 3.45,0.7 3.95,0.99 3.84,1.5 c 0.08,0.08 0.15,0.17 0.21,0.27 l 0.53,0.03 0.15,0.56 -0.44,0.3 c 0,0.11 -0.02,0.23 -0.04,0.34 L 4.59,3.37 4.3,3.88 3.79,3.77 C 3.7,3.85 3.61,3.91 3.52,3.97 L 3.48,4.5 2.92,4.65 2.63,4.21 C 2.53,4.2 2.41,4.19 2.3,4.16 Z"/><circle cx="2.67" cy="2.62" r="1"/></g></svg>`);
        const crossppl1Btn = this.addBtn(`${SVG_HEADER}0.6 0.5 4.5 4.5'><g ${SVG_LINE}><path d="M 1.22,1.68 V 3.764 L 2.83,4.644 4.472,3.715 V 1.715 L 2.81,0.8 Z M 1.55,1.86 2.86,2.61 V 4.31 M 2.86,2.61 4.16,1.86"/></g></svg>`);
        const crossppl2Btn = this.addBtn(`${SVG_HEADER}0.6 0.5 4.5 4.5'><g ${SVG_LINE}><circle cx="2.69" cy="2.6" r="2"/><path d="m 0.69,2.6 c 0.002,1.28 4,1.28 4,0.014"/><path style="stroke-dasharray:0.2, 0.2;" d="M 0.68,2.6 C 0.71,1.45 4.68,1.5 4.7,2.63"/></g></svg>`);
        const crossppl3Btn = this.addBtn(`${SVG_HEADER}0.6 0.5 4.5 4.5'><g style="fill:none;stroke:#FFF;stroke-width:0.4;"><path transform="scale(0.6) translate(1.8,1.8)" d="M 1.22,1.68 V 3.764 L 2.83,4.644 4.472,3.715 V 1.715 L 2.81,0.8 Z M 1.55,1.86 2.86,2.61 V 4.31 M 2.86,2.61 4.16,1.86"/></g></svg>`);
        const crossppl4Btn = this.addBtn(`${SVG_HEADER}0.6 0.5 4.5 4.5'><g ${SVG_LINE}><path d="M 1.19,3.49 2.85,4.45 4.42,3.55 V 1.57 L 2.77,0.63 1.19,1.52 Z M 2,1.12 3.45,1.05 4.4,2.62 3.65,3.94 1.98,3.92 1.23,2.74 1.95,1.1"/></g></svg>`);
        const crosshairBtn = this.addBtn(`${SVG_HEADER}0.6 0.5 4.5 4.5'><g ${SVG_LINE}><path d="m 2.62,1 v 3.37 M 1.56,4 3.56,1.47 M 0.9,2.7 H 4.23"/></g></svg>`);
        const stereoBtn = this.addBtn(`${SVG_HEADER}0.5 0.3 4.5 4.5'><g ${SVG_LINE}><path d="M 0.563,2.636 C 2.33,1 3.24,1.22 4.74,2.76 2.99,3.96 1.676,3.73 0.564,2.637 Z"/><circle cx="2.6" cy="2.5" r="0.9"/><circle cx="2.6" cy="2.5" r="0.54"/></g></svg>`);
        const settingBtn = this.addBtn(`${SVG_HEADER}0.5 0.3 4.5 4.5'><g id="g1" ${SVG_LINE}><path d="M 1.3,3.4 V 4.8 M 1.77,3.4 V 4.8 M 1.3,0.4 V 2.8 M 1.77,0.4 V 2.8"/><rect width="1.7" height="0.4" x="0.63" y="3.04"/></g><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#g1" transform="rotate(180,2.65,2.59)"/></svg>`);
        const slicecfg1Btn = this.addBtn(`${SVG_HEADER}0 0 5 5'><g ${SVG_LINE}>${SVG_RETINA}<rect width="1.2" height="1.2" x="0.6" y="3.6"/><rect width="1.2" height="1.2" x="3.5" y="3.6"/><rect width="1.2" height="1.2" x="3.5" y="0.5"/></g></svg>`);
        const slicecfg2Btn = this.addBtn(`${SVG_HEADER}0 0 5 5'><g ${SVG_LINE}>${SVG_RETINA}<rect width="1.7" height="1.7" x="0.6" y="2.8"/><rect width="1.7" height="1.7" x="2.9" y="2.8"/><rect width="1.7" height="1.7" x="2.9" y="0.5"/></g></svg>`);
        const slicecfg3Btn = this.addBtn(`${SVG_HEADER}0 0 5 5'><g ${SVG_LINE}>${SVG_RETINA}</g></svg>`);
        const slicecfg4Btn = this.addBtn(`${SVG_HEADER}0 0 5 5'><g ${SVG_LINE}><rect width="2" height="2" x="0.6" y="2.5"/><rect width="2" height="2" x="2.6" y="2.5"/><rect width="2" height="2" x="2.6" y="0.5"/></g></svg>`);
        const slicecfg5Btn = this.addBtn(`${SVG_HEADER}0 0 5 5'><g ${SVG_LINE}><rect width="4" height="4" x="0.6" y="0.6"/><text x="1.5" y="3.5" stroke="#0F0" style="font-size:3px">Y</text></g></svg>`);
        const slicecfg6Btn = this.addBtn(`${SVG_HEADER}0 0 5 5'><g ${SVG_LINE}><rect width="4" height="4" x="0.6" y="0.6"/><text x="1.5" y="3.5" stroke="#00F" style="font-size:3px">Z</text></g></svg>`);
        const slicecfg7Btn = this.addBtn(`${SVG_HEADER}0 0 5 5'><g ${SVG_LINE}>${SVG_RETINA}<rect width="1" height="1" x="0.6" y="3"/><rect width="1" height="1" x="1.6" y="3"/><rect width="1" height="1" x="2.6" y="3"/><rect width="1" height="1" x="3.6" y="3"/><text x="1.5" y="3.5" stroke="#0F0" style="font-size:3px">Y</text></g></svg>`);
        const slicecfg8Btn = this.addBtn(`${SVG_HEADER}0 0 5 5'><g ${SVG_LINE}>${SVG_RETINA}<rect width="1" height="1" x="0.6" y="3"/><rect width="1" height="1" x="1.6" y="3"/><rect width="1" height="1" x="2.6" y="3"/><rect width="1" height="1" x="3.6" y="3"/><text x="1.5" y="3.5" stroke="#00F" style="font-size:3px">Z</text></g></svg>`);
        const layerpBtn = this.addBtn(`${SVG_HEADER}0 0 5 5'><g ${SVG_LINE}><rect id="r" width="1.8" height="2.3" x="2.7" y="2.94" transform="matrix(0.95,-0.3,0,1,0,0)"/><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#r" id="u" transform="translate(-0.6,-0.4)"/><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#u" transform="translate(-0.6,-0.4)"/>${SVG_PLUS}</g></svg>`);
        const layermBtn = this.addBtn(`${SVG_HEADER}0 0 5 5'><g ${SVG_LINE}><rect id="r" width="1.8" height="2.3" x="2.7" y="2.94" transform="matrix(0.95,-0.3,0,1,0,0)"/><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#r" id="u" transform="translate(-0.6,-0.4)"/><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#u" transform="translate(-0.6,-0.4)"/>${SVG_MINUS}</g></svg>`);
        const opacitypBtn = this.addBtn(`${SVG_CHECKER}<text x="1.5" y="3.5" style="font-size:3px;stroke:#F00;stroke-width:0.25">+</text></g></svg>`);
        const opacitymBtn = this.addBtn(`${SVG_CHECKER}<text x="2" y="3.5" style="font-size:3px;stroke:#F00;stroke-width:0.25">-</text></g></svg>`);
        const fovpBtn = this.addBtn(`${SVG_CAM}${SVG_PLUS}</g></svg>`);
        const fovmBtn = this.addBtn(`${SVG_CAM}${SVG_MINUS}</g></svg>`);
        const respBtn = this.addBtn(`${SVG_HEADER}0 0 5 5'><g ${SVG_LINE}><rect width="4.6" height="2.93" x="0.33" y="0.9"/><path d="M 2.44,3.844 1.62,4.78 H 3.77 L 3.03,3.84"/><circle cx="1.86" cy="2.4" r="1.05"/><rect width="1.63" height="0.48" x="3.38" y="1.7" transform="rotate(12.5)"/><path d="M 1.075,1.825H 1.6 V 2.1 H 1.9 V 2.5 H 2.3 V 3.07 H 2.5"/>${SVG_PLUS}</g></svg>`);
        const resmBtn = this.addBtn(`${SVG_HEADER}0 0 5 5'><g ${SVG_LINE}><rect width="4.6" height="2.93" x="0.33" y="0.9"/><path d="M 2.44,3.844 1.62,4.78 H 3.77 L 3.03,3.84"/><circle cx="1.86" cy="2.4" r="1.05"/><rect width="1.63" height="0.48" x="3.38" y="1.7" transform="rotate(12.5)"/><path d="M 1.075,1.825H 1.6 V 2.1 H 1.9 V 2.5 H 2.3 V 3.07 H 2.5"/>${SVG_MINUS}</g></svg>`);
        const eyeModeCrossBtn = this.addBtn(`${SVG_HEADER}0.5 0.3 4.5 4.5'><g ${SVG_LINE}><circle cx="2" cy="4" r="0.3"/><circle cx="3.2" cy="4" r="0.3"/><path d="M 2,3.4 3,1 M 3.2,3.4 2.2,1"/></g></svg>`);
        const eyeModeParaBtn = this.addBtn(`${SVG_HEADER}0.5 0.3 4.5 4.5'><g ${SVG_LINE}><circle cx="2" cy="4" r="0.3"/><circle cx="3.2" cy="4" r="0.3"/><path d="M 2,3.4 1.8,1 M 3.2,3.4 3.4,1"/></g></svg>`);
        eyeModeCrossBtn.style.position = "absolute";
        eyeModeParaBtn.style.position = "absolute";
        eyeModeCrossBtn.style.left = "-32px";
        eyeModeParaBtn.style.left = "-32px";
        const mainBar = this.createToggleDiv(mainBtn, "inline-block");
        let drag = NaN;
        let startPos: number;
        let enableKeycode: string;
        mainBtn.addEventListener('mousedown', (e) => {
            drag = e.clientY;
            startPos = Number(this.dom.style.top.replace("vh", "")) / 100 * window.innerHeight;
        });
        mainBtn.addEventListener('mouseenter', () => {
            if (enableKeycode != retinaCtrl.keyConfig.enable) {
                this.refresh({ "enableKeyCode": retinaCtrl.keyConfig.enable });
            }
        });
        mainBtn.addEventListener('mousemove', (e) => {
            if (!drag) return;

            const currPos = startPos + e.clientY - drag;
            this.dom.style.top = currPos / window.innerHeight * 100 + "vh";
        });
        mainBtn.addEventListener('mouseup', () => { drag = NaN; });
        mainBtn.addEventListener('mouseout', () => { drag = NaN; });


        this.dom.appendChild(mainBar);

        mainBar.appendChild(eyeModeCrossBtn);
        mainBar.appendChild(eyeModeParaBtn);
        eyeModeCrossBtn.addEventListener('mousedown', () => retinaCtrl.guiMouseOperation = "negEyesGap");
        eyeModeParaBtn.addEventListener('mousedown', () => retinaCtrl.guiMouseOperation = "negEyesGap");

        stereoBtn.addEventListener('click', () => retinaCtrl.toggleStereo());
        mainBar.appendChild(stereoBtn);

        const slicecfgPlaceholder = document.createElement("span");
        slicecfgPlaceholder.className = "slicecfg";
        mainBar.appendChild(slicecfgPlaceholder);
        let slicecfgPlaceholderBtn = slicecfg1Btn.cloneNode(true) as HTMLButtonElement;
        slicecfgPlaceholder.appendChild(slicecfgPlaceholderBtn);
        const slicecfgBar = this.createDropBox(slicecfgPlaceholderBtn, 0, 2);
        slicecfgPlaceholder.appendChild(slicecfgBar);
        slicecfgBar.appendChild(slicecfg1Btn);
        slicecfgBar.appendChild(slicecfg2Btn);
        slicecfgBar.appendChild(slicecfg3Btn);
        slicecfgBar.appendChild(slicecfg4Btn);
        slicecfgBar.appendChild(slicecfg5Btn);
        slicecfgBar.appendChild(slicecfg6Btn);
        slicecfgBar.appendChild(slicecfg7Btn);
        slicecfgBar.appendChild(slicecfg8Btn);
        const slicecfgBtnFn = function () {
            slicecfgPlaceholderBtn.style.backgroundImage = this.style.backgroundImage;
            retinaCtrl.toggleSectionConfig(this.name);
        }
        slicecfg1Btn.addEventListener('click', slicecfgBtnFn); slicecfg1Btn.name = "retina+sections";
        slicecfg2Btn.addEventListener('click', slicecfgBtnFn); slicecfg2Btn.name = "retina+bigsections"
        slicecfg3Btn.addEventListener('click', slicecfgBtnFn); slicecfg3Btn.name = "retina";
        slicecfg4Btn.addEventListener('click', slicecfgBtnFn); slicecfg4Btn.name = "sections";
        slicecfg5Btn.addEventListener('click', slicecfgBtnFn); slicecfg5Btn.name = "zsection";
        slicecfg6Btn.addEventListener('click', slicecfgBtnFn); slicecfg6Btn.name = "ysection";
        slicecfg7Btn.addEventListener('click', slicecfgBtnFn); slicecfg7Btn.name = "retina+zslices";
        slicecfg8Btn.addEventListener('click', slicecfgBtnFn); slicecfg8Btn.name = "retina+yslices";
        const settingBarPlaceHolder = document.createElement("span");
        settingBarPlaceHolder.appendChild(settingBtn);
        const settingBar = this.createDropBox(settingBtn, 2, 2);
        settingBarPlaceHolder.className = "settingbar";
        settingBarPlaceHolder.appendChild(settingBar);
        mainBar.appendChild(settingBarPlaceHolder);
        settingBar.appendChild(layerpBtn);
        layerpBtn.addEventListener('mousedown', () => retinaCtrl.guiMouseOperation = "layerpBtn");
        settingBar.appendChild(layermBtn);
        layermBtn.addEventListener('mousedown', () => retinaCtrl.guiMouseOperation = "layermBtn");
        settingBar.appendChild(opacitypBtn);
        opacitypBtn.addEventListener('mousedown', () => retinaCtrl.guiMouseOperation = "opacitypBtn");
        settingBar.appendChild(opacitymBtn);
        opacitymBtn.addEventListener('mousedown', () => retinaCtrl.guiMouseOperation = "opacitymBtn");
        settingBar.appendChild(fovpBtn);
        fovpBtn.addEventListener('mousedown', () => retinaCtrl.guiMouseOperation = "fovpBtn");
        settingBar.appendChild(fovmBtn);
        fovmBtn.addEventListener('mousedown', () => retinaCtrl.guiMouseOperation = "fovmBtn");
        settingBar.appendChild(respBtn);
        respBtn.addEventListener('mousedown', () => retinaCtrl.guiMouseOperation = "respBtn");
        settingBar.appendChild(resmBtn);
        resmBtn.addEventListener('mousedown', () => retinaCtrl.guiMouseOperation = "resmBtn");

        mainBar.appendChild(crosshairBtn);
        crosshairBtn.addEventListener("click", () => retinaCtrl.toggleCrosshair());

        const crosspplPlaceholder = document.createElement("span");
        mainBar.appendChild(crosspplPlaceholder);
        let crosspplPlaceholderBtn = crossppl1Btn.cloneNode(true) as HTMLButtonElement;
        crosspplPlaceholder.appendChild(crosspplPlaceholderBtn);
        crosspplPlaceholder.className = "crossppl";
        const crosspplBar = this.createDropBox(crosspplPlaceholderBtn, 4);
        crosspplPlaceholder.appendChild(crosspplBar);

        const crosspplBtnFn = function () {
            crosspplPlaceholderBtn.style.backgroundImage = this.style.backgroundImage;
            retinaCtrl.toggleRetinaAlpha(Number(this.name));
        }
        crosspplBar.appendChild(crossppl1Btn); crossppl1Btn.addEventListener('click', crosspplBtnFn); crossppl1Btn.name = "0";
        crosspplBar.appendChild(crossppl2Btn); crossppl2Btn.addEventListener('click', crosspplBtnFn); crossppl2Btn.name = "1";
        crosspplBar.appendChild(crossppl3Btn); crossppl3Btn.addEventListener('click', crosspplBtnFn); crossppl3Btn.name = "2";
        crosspplBar.appendChild(crossppl4Btn); crossppl4Btn.addEventListener('click', crosspplBtnFn); crossppl4Btn.name = "3";

        this.refresh = (param: any) => {
            let crosspplBtn: HTMLButtonElement;
            switch (param["toggleRetinaAlpha"]) {
                case 0: crosspplBtn = crossppl1Btn; break;
                case 1: crosspplBtn = crossppl2Btn; break;
                case 2: crosspplBtn = crossppl3Btn; break;
                case 3: crosspplBtn = crossppl4Btn; break;
            }
            switch (param["toggleStereo"]) {
                case true: param["negEyesGap"] = retinaCtrl.retinaEyeOffset > 0 || retinaCtrl.sectionEyeOffset > 0; break;
                case false: eyeModeCrossBtn.style.display = "none"; eyeModeParaBtn.style.display = "none"; break;
            }
            switch (param["negEyesGap"]) {
                case false: eyeModeCrossBtn.style.display = "none"; eyeModeParaBtn.style.display = ""; break;
                case true: eyeModeCrossBtn.style.display = ""; eyeModeParaBtn.style.display = "none"; break;
            }

            if (crosspplBtn) crosspplPlaceholderBtn.style.backgroundImage = crosspplBtn.style.backgroundImage;
            switch (param["toggleSectionConfig"]) {
                case "retina+sections": slicecfg1Btn.click(); break;
                case "retina+bigsections": slicecfg2Btn.click(); break;
                case "retina": slicecfg3Btn.click(); break;
                case "sections": slicecfg4Btn.click(); break;
                case "zsection": slicecfg5Btn.click(); break;
                case "ysection": slicecfg6Btn.click(); break;
                case "retina+zslices": slicecfg7Btn.click(); break;
                case "retina+yslices": slicecfg8Btn.click(); break;
            }
            if (param["enableKeyCode"] !== undefined) {
                enableKeycode = param["enableKeyCode"];
                const BtnHint = {
                    "zh": {
                        "mouseBtn0": "鼠标左键",
                        "mouseBtn1": "鼠标中键",
                        "mouseBtn2": "鼠标右键",
                        "left": "左",
                        "right": "右",
                        "digit": "大键盘数字",
                        "mainBtn": "显示/隐藏体素渲染设置",
                        "crosspplPlaceholderBtn": "显示/隐藏选择截面形状",
                        "crossppl1Btn": "截面形状：默认立方体",
                        "crossppl2Btn": "截面形状：球",
                        "crossppl3Btn": "截面形状：小立方体",
                        "crossppl4Btn": "截面形状：平面",
                        "crossppl2BtnDesc": "拖动以改变球半径(垂直)\n和羽化量(水平)",
                        "crossppl3BtnDesc": "拖动以改变立方体大小(垂直)\n和剩余部分透明度(水平)",
                        "crossppl4BtnDesc": "拖动以改变截平面方向",
                        "stereoBtn": "切换裸眼3D模式",
                        "eyeModeCrossBtn": "交叉眼",
                        "eyeModeParaBtn": "平行眼",
                        "slicecfgPlaceholderBtn": "显示/隐藏选择视图配置",
                        "slicecfg1Btn": "视图配置：体素+三个截面",
                        "slicecfg2Btn": "视图配置：体素+三个大截面",
                        "slicecfg3Btn": "视图配置：体素",
                        "slicecfg4Btn": "视图配置：三个截面",
                        "slicecfg5Btn": "视图配置：Y轴截面",
                        "slicecfg6Btn": "视图配置：Z轴截面",
                        "slicecfg7Btn": "视图配置：体素+平行Y轴截面",
                        "slicecfg8Btn": "视图配置：体素+平行Z轴截面",
                        "layerpBtn": "增加体素渲染层数",
                        "layermBtn": "减少体素渲染层数",
                        "opacitypBtn": "增加体素不透明度",
                        "opacitymBtn": "减少体素不透明度",
                        "fovpBtn": "增大体素显示视场角",
                        "fovmBtn": "降低体素显示视场角",
                        "respBtn": "增大每层体素分辨率",
                        "resmBtn": "降低每层体素分辨率",
                        "settingBtn": "显示/隐藏体素渲染参数调节",
                        "crosshairBtn": "显示/隐藏十字准心",
                    },
                    "en": {
                        "mouseBtn0": "Left Mouse Button",
                        "mouseBtn1": "Middle Mouse Button",
                        "mouseBtn2": "Right Mouse Button",
                        "eyeModeCrossBtn": "Cross View",
                        "eyeModeParaBtn": "Parallel View",
                        "left": "Left",
                        "right": "Right",
                        "digit": "Digit ",
                        "mainBtn": "Show / Hide Voxel Render Settings",
                        "crosspplPlaceholderBtn": "Show / Hide Choose CrossSection Shape",
                        "crossppl1Btn": "CrossSection Shape: Default Cube",
                        "crossppl2Btn": "CrossSection Shape: Ball",
                        "crossppl3Btn": "CrossSection Shape: Small Cube",
                        "crossppl4Btn": "CrossSection Shape: Plane",
                        "crossppl2BtnDesc": " Drag to Change Ball Radius(Vertically)\nand Feathering Amount(Horizontally)",
                        "crossppl3BtnDesc": " Drag to Change Cube Size(Vertically)\nand Remained Opacity(Horizontally)",
                        "crossppl4BtnDesc": " Drag to Change Section Plane's Orientation",
                        "stereoBtn": "Toggle Naked Eye Stereo Mode",
                        "slicecfgPlaceholderBtn": "Show / Hide Choose View Configuration",
                        "slicecfg1Btn": "View Configuration: Voxel + Sections",
                        "slicecfg2Btn": "View Configuration: Voxel + Big Sections",
                        "slicecfg3Btn": "View Configuration: Voxel Only",
                        "slicecfg4Btn": "View Configuration: 3 Sections",
                        "slicecfg5Btn": "View Configuration: Y axis Section",
                        "slicecfg6Btn": "View Configuration: Z axis Section",
                        "slicecfg7Btn": "View Configuration: Voxel + Y axis Parallel Sections",
                        "slicecfg8Btn": "View Configuration: Voxel + Z axis Parallel Sections",
                        "layerpBtn": "Increase Voxel Layers",
                        "layermBtn": "Decrease Voxel Layers",
                        "opacitypBtn": "Increase Voxel Opacity",
                        "opacitymBtn": "Decrease Voxel Opacity",
                        "fovpBtn": "Increase Field Of Voxel View",
                        "fovmBtn": "Decrease Voxel Field Of Voxel View",
                        "respBtn": "Increase Resolution Per Voxel Layer",
                        "resmBtn": "Decrease Resolution Per Voxel Layer",
                        "settingBtn": "Show / Hide Voxel Render Params",
                        "crosshairBtn": "Toggle Crosshair",
                    },
                }
                let params = new URLSearchParams(window.location.search.slice(1));
                let tr = BtnHint[this.lang ?? params.get("lang") ?? (navigator.languages.join(",").includes("zh") ? "zh" : "en")];

                const keyName = (cfg: string, config?: any) => `\n(${retinaCtrl.keyConfig.enable ? retinaCtrl.keyConfig.enable.replace("Key", "").replace("Left", tr["left"]).replace("Right", tr["right"]).replace("Digit", tr["digit"]) + " + " : ""
                    }${(config ?? retinaCtrl.keyConfig)[cfg].replace(/(Key)|(Left)|(Right)|(\.)/g, "").replace("Digit", tr["digit"])})`;

                mainBtn.title = tr["mainBtn"];
                crosspplPlaceholderBtn.title = tr["crosspplPlaceholderBtn"];
                const getCrosspplBtnTitle = (btnName: string, noDragDesc?: boolean) => tr[btnName] + keyName("toggleRetinaAlpha") + (
                    !noDragDesc ? "\n----" + keyName("", { "": "" }).replace(/[\(\})]/g, "") + tr["mouseBtn" + retinaCtrl.retinaAlphaMouseButton] + tr[btnName + "Desc"] : ""
                );
                crossppl1Btn.title = getCrosspplBtnTitle("crossppl1Btn", true);
                crossppl2Btn.title = getCrosspplBtnTitle("crossppl2Btn");
                crossppl3Btn.title = getCrosspplBtnTitle("crossppl3Btn");
                crossppl4Btn.title = getCrosspplBtnTitle("crossppl4Btn");
                stereoBtn.title = tr["stereoBtn"] + keyName("toggle3D");
                eyeModeCrossBtn.title = tr["eyeModeCrossBtn"] + keyName("negEyesGap");
                eyeModeParaBtn.title = tr["eyeModeParaBtn"] + keyName("negEyesGap");
                slicecfgPlaceholderBtn.title = tr["slicecfgPlaceholderBtn"];
                slicecfg1Btn.title = tr["slicecfg1Btn"] + keyName("retina+sections", retinaCtrl.keyConfig.sectionConfigs);
                slicecfg2Btn.title = tr["slicecfg2Btn"] + keyName("retina+bigsections", retinaCtrl.keyConfig.sectionConfigs);
                slicecfg3Btn.title = tr["slicecfg3Btn"] + keyName("retina", retinaCtrl.keyConfig.sectionConfigs);
                slicecfg4Btn.title = tr["slicecfg4Btn"] + keyName("sections", retinaCtrl.keyConfig.sectionConfigs);
                slicecfg5Btn.title = tr["slicecfg5Btn"] + keyName("zsection", retinaCtrl.keyConfig.sectionConfigs);
                slicecfg6Btn.title = tr["slicecfg6Btn"] + keyName("ysection", retinaCtrl.keyConfig.sectionConfigs);
                slicecfg7Btn.title = tr["slicecfg7Btn"] + keyName("retina+zslices", retinaCtrl.keyConfig.sectionConfigs);
                slicecfg8Btn.title = tr["slicecfg8Btn"] + keyName("retina+yslices", retinaCtrl.keyConfig.sectionConfigs);
                layerpBtn.title = tr["layerpBtn"] + keyName("addLayer");
                layermBtn.title = tr["layermBtn"] + keyName("subLayer");
                opacitypBtn.title = tr["opacitypBtn"] + keyName("addOpacity");
                opacitymBtn.title = tr["opacitymBtn"] + keyName("subOpacity");
                fovpBtn.title = tr["fovpBtn"] + keyName("addFov");
                fovmBtn.title = tr["fovmBtn"] + keyName("subFov");
                respBtn.title = tr["respBtn"] + keyName("addRetinaResolution");
                resmBtn.title = tr["resmBtn"] + keyName("subRetinaResolution");
                settingBtn.title = tr["settingBtn"];
                crosshairBtn.title = tr["crosshairBtn"] + keyName("toggleCrosshair");
            }
        }
        const css = document.createElement("style");
        css.appendChild(document.createTextNode(`
        button.retina-ctrl-gui{
            background: #999;
        }
        .slicecfg button.retina-ctrl-gui{
            background: #B77;
        }
        .settingbar button.retina-ctrl-gui{
            background: #7B7;
        }
        .crossppl button.retina-ctrl-gui{
            background: #BB7;
        }
        button.retina-ctrl-gui[title]:hover::after{
            white-space: pre-line; width: max-content;
            content:attr(title);position:absolute;bottom:100%;right:0%; font-size:1em;z-index:100;background:#000;color:#FFF; padding:0;margin:0;
        }
        div.retina-ctrl-gui button.retina-ctrl-gui[title]:hover::after{
            bottom:calc(100% + ${this.iconSize}px);
        }
        `));
        this.dom.appendChild(mainBtn);
        this.dom.appendChild(css);

        this.refresh({ "negEyesGap": retinaCtrl.retinaEyeOffset > 0 || retinaCtrl.sectionEyeOffset > 0 });
    }
    addBtn(svgIcon: string) {
        const btn = document.createElement("button");
        btn.className = "retina-ctrl-gui";
        btn.innerHTML = "&nbsp;";
        btn.style.width = this.iconSize + "px";
        btn.style.height = this.iconSize + "px";
        btn.style.borderRadius = this.iconSize * 0.25 + "px";
        btn.style.backgroundImage = `url('data:image/svg+xml,${escape(svgIcon)}')`;
        const cancelFn = () => this.controller.guiMouseOperation = "";
        btn.addEventListener('mouseup', cancelFn); btn.addEventListener('mouseout', cancelFn);
        return btn;
    }
}