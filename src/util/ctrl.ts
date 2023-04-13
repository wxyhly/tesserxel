import { Obj4 } from "../math/algebra/affine";
import { Bivec } from "../math/algebra/bivec";
import { Mat4 } from "../math/algebra/mat4";
import { Quaternion } from "../math/algebra/quaternion";
import { Rotor } from "../math/algebra/rotor";
import { Vec2 } from "../math/algebra/vec2";
import { Vec3 } from "../math/algebra/vec3";
import { Vec4 } from "../math/algebra/vec4";
import { _360, _DEG2RAD } from "../math/const";
import { EyeOffset, SectionConfig, SliceConfig, SliceFacing, SliceRenderer } from "../render/slice";

export interface IController {
    update(state: ControllerState): void;
    enabled: boolean;
}
interface ControllerConfig {
    preventDefault?: boolean;
    enablePointerLock?: boolean;
}
interface KeyConfig {
    enable?: string;
    disable?: string;
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
    /** query whether controller disabled by config, disable / enable keys */
    queryDisabled: (config: KeyConfig) => boolean;
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
    ctrls: Iterable<IController>;
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
        wheelX: 0,
        wheelY: 0,
        mspf: -1,

        isKeyHold: (_) => false,
        queryDisabled: (_) => false,
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
    constructor(dom: HTMLElement, ctrls: Iterable<IController>, config?: ControllerConfig) {
        this.dom = dom;
        dom.tabIndex = 1;
        this.ctrls = ctrls;
        this.enablePointerLock = config?.enablePointerLock ?? false;
        this.states.isKeyHold = (code) => {
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
        this.states.queryDisabled = (config) => {
            return this.states.isKeyHold(config.disable) || (config.enable && !this.states.isKeyHold(config.enable));
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
            if (this.disableDefaultEvent) {
                ev.preventDefault();
                ev.stopPropagation();
            }
        };
        this.evKeyUp = (ev) => {
            this.states.currentKeys.set(ev.code, KeyState.UP);
            if (this.disableDefaultEvent) {
                ev.preventDefault();
                ev.stopPropagation();
            }
        };
        this.evWheel = (ev) => {
            this.states.wheelX = ev.deltaX;
            this.states.wheelY = ev.deltaY;
        };
        dom.addEventListener("mousedown", this.evMouseDown);
        dom.addEventListener("mousemove", this.evMouseMove);
        dom.addEventListener("mouseup", this.evMouseUp);
        dom.addEventListener("keydown", this.evKeyDown);
        dom.addEventListener("keyup", this.evKeyUp);
        dom.addEventListener("wheel", this.evWheel);
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
            if (c.enabled) c.update(this.states);
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
    private _bivec = new Bivec();
    private normalisePeriodMask = 15;
    constructor(object?: Obj4) {
        if (object) this.object = object;
    }
    update(state: ControllerState) {
        let disabled = state.queryDisabled(this.keyConfig);
        let dampFactor = Math.exp(-this.damp * Math.min(200.0, state.mspf));
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
        this.object.rotates(this._bivec.exp());
        if ((state.updateCount & this.normalisePeriodMask) === 0) {
            this.object.rotation.norms();
        }
    }
    lookAtCenter() {
        // todo
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
        spinCW: "KeyZ",
        spinCCW: "KeyX",
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
        let disabled = state.queryDisabled(this.keyConfig);
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
    damp = 0.1;
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
        let disabled = state.queryDisabled(this.keyConfig);
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
        let disabled = state.queryDisabled(this.keyConfig);
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
            facing: SliceFacing.POSZ,
            viewport: { x: 0, y: 0, width: 1 / aspect, height: 1.0 },
            resolution
        }];

    }
    export function singlezslice2eye(screenSize: { width: number, height: number }): SectionConfig[] {
        let aspect = screenSize.height / screenSize.width;
        let resolution = screenSize.height * 0.8;
        return [{
            slicePos: 0,
            facing: SliceFacing.POSZ,
            eyeOffset: EyeOffset.LeftEye,
            viewport: { x: -0.5, y: 0, width: 0.5 / aspect, height: 0.8 },
            resolution
        }, {
            slicePos: 0,
            facing: SliceFacing.POSZ,
            eyeOffset: EyeOffset.RightEye,
            viewport: { x: 0.5, y: 0, width: 0.5 / aspect, height: 0.8 },
            resolution
        }];
    }
    export function singleyslice1eye(screenSize: { width: number, height: number }): SectionConfig[] {
        let aspect = screenSize.height / screenSize.width;
        let resolution = screenSize.height;
        return [{
            slicePos: 0,
            facing: SliceFacing.NEGY,
            viewport: { x: 0, y: 0, width: 1 / aspect, height: 1.0 },
            resolution
        }];
    }
    export function singleyslice2eye(screenSize: { width: number, height: number }): SectionConfig[] {
        let aspect = screenSize.height / screenSize.width;
        let resolution = screenSize.height * 0.8;
        return [{
            slicePos: 0,
            facing: SliceFacing.NEGY,
            eyeOffset: EyeOffset.LeftEye,
            viewport: { x: -0.5, y: 0, width: 0.5 / aspect, height: 0.8 },
            resolution
        }, {
            slicePos: 0,
            facing: SliceFacing.NEGY,
            eyeOffset: EyeOffset.RightEye,
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
            facing: SliceFacing.POSZ,
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
            facing: SliceFacing.POSZ,
            eyeOffset: EyeOffset.LeftEye,
            viewport: { x: (pos[1] * half) - 0.5, y: size - 1, width: size, height: size },
            resolution
        })).concat(
            arr.map(pos => ({
                slicePos: pos[0],
                facing: SliceFacing.POSZ,
                eyeOffset: EyeOffset.RightEye,
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
            facing: SliceFacing.NEGY,
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
            facing: SliceFacing.NEGY,
            eyeOffset: EyeOffset.LeftEye,
            viewport: { x: (pos[1] * half) - 0.5, y: size - 1, width: size, height: size },
            resolution
        })).concat(
            arr.map(pos => ({
                slicePos: pos[0],
                facing: SliceFacing.NEGY,
                eyeOffset: EyeOffset.RightEye,
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
                facing: SliceFacing.NEGX,
                eyeOffset: EyeOffset.LeftEye,
                viewport: { x: -size_aspect, y: size - 1, width: wsize, height: size },
                resolution
            },
            {
                facing: SliceFacing.NEGX,
                eyeOffset: EyeOffset.RightEye,
                viewport: { x: 1 - size_aspect, y: size - 1, width: wsize, height: size },
                resolution
            },
            {
                facing: SliceFacing.NEGY,
                eyeOffset: EyeOffset.LeftEye,
                viewport: { x: -size_aspect, y: 1 - size, width: wsize, height: size },
                resolution
            },
            {
                facing: SliceFacing.NEGY,
                eyeOffset: EyeOffset.RightEye,
                viewport: { x: 1 - size_aspect, y: 1 - size, width: wsize, height: size },
                resolution
            },
            {
                facing: SliceFacing.POSZ,
                eyeOffset: EyeOffset.LeftEye,
                viewport: { x: size_aspect - 1, y: size - 1, width: wsize, height: size },
                resolution
            },
            {
                facing: SliceFacing.POSZ,
                eyeOffset: EyeOffset.RightEye,
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
                facing: SliceFacing.NEGX,
                viewport: { x: 1 - size_aspect, y: size - 1, width: wsize, height: size },
                resolution
            },
            {
                facing: SliceFacing.NEGY,
                viewport: { x: 1 - size_aspect, y: 1 - size, width: wsize, height: size },
                resolution
            },
            {
                facing: SliceFacing.POSZ,
                viewport: { x: size_aspect - 1, y: size - 1, width: wsize, height: size },
                resolution
            }
        ];
    }
}
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
    retinaEyeOffset = 0.1;
    sectionEyeOffset = 0.2;
    size: GPUExtent3DStrict;
    sectionPresets: (screenSize: { width: number, height: number }) => { [label: string]: SectionPreset };
    private currentSectionConfig: string = "retina+sections";
    private rembemerLastLayers: number;
    private needResize: boolean = true;
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
        toggleCrosshair: ".KeyC",
        rotateLeft: "ArrowLeft",
        rotateRight: "ArrowRight",
        rotateUp: "ArrowUp",
        rotateDown: "ArrowDown",
        refaceFront: ".KeyR",
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
    constructor(r: SliceRenderer) {
        this.renderer = r;
        this.sectionPresets = (screenSize: {
            width: number;
            height: number;
        }) => ({
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
    private needsUpdateRetinaCamera: boolean = false;
    private retinaFov: number = 40;
    private retinaSize = 1.8;
    private retinaZDistance = 5;
    private crossHairSize = 0.03;
    maxRetinaResolution = 1024;
    update(state: ControllerState): void {
        let disabled = state.queryDisabled(this.keyConfig);
        let on = state.isKeyHold;
        let key = this.keyConfig;
        let delta: number;
        let sliceConfig: SliceConfig = {};
        if (!disabled && state.isKeyHold(this.keyConfig.toggle3D)) {
            let stereo = this.renderer.getStereoMode();
            if (stereo) {
                this.renderer.setEyeOffset(0, 0);
            } else {
                this.renderer.setEyeOffset(this.sectionEyeOffset, this.retinaEyeOffset);
            }
            sliceConfig.sections = this.sectionPresets(this.renderer.getSize())[this.currentSectionConfig][(
                !stereo ? "eye2" : "eye1"
            )];
        } else if (this.needResize) {
            sliceConfig.sections = this.sectionPresets(this.renderer.getSize())[this.currentSectionConfig][(
                this.renderer.getStereoMode() ? "eye2" : "eye1"
            )];
        }
        if (!disabled) {
            this.needResize = false;
            if (state.isKeyHold(this.keyConfig.toggleCrosshair)) {
                let crossHair = this.renderer.getCrosshair();
                this.renderer.setCrosshair(crossHair === 0 ? this.crossHairSize : 0);
            }
            if (state.isKeyHold(this.keyConfig.addOpacity)) {
                this.renderer.setOpacity(this.renderer.getOpacity() * (1 + this.opacityKeySpeed));
            }
            if (state.isKeyHold(this.keyConfig.subOpacity)) {
                this.renderer.setOpacity(this.renderer.getOpacity() / (1 + this.opacityKeySpeed));
            }
            if (state.isKeyHold(this.keyConfig.addLayer)) {
                let layers = this.renderer.getLayers();
                if (layers > 32 || ((state.updateCount & 3) && (layers > 16 || (state.updateCount & 7)))) {
                    layers++;
                }
                if (layers > 512) layers = 512;
                sliceConfig.layers = layers;
            }
            if (state.isKeyHold(this.keyConfig.subLayer)) {
                // when < 32, we slow down layer speed
                let layers = this.renderer.getLayers();
                if (layers > 32 || ((state.updateCount & 3) && (layers > 16 || (state.updateCount & 7)))) {
                    if (layers > 0) layers--;

                    sliceConfig.layers = layers;
                }
            }
            if (state.isKeyHold(this.keyConfig.addRetinaResolution)) {
                let res = this.renderer.getRetinaResolution();
                res += this.renderer.getMinResolutionMultiple();
                if (res <= this.maxRetinaResolution) sliceConfig.retinaResolution = res;
            }
            if (state.isKeyHold(this.keyConfig.subRetinaResolution)) {
                let res = this.renderer.getRetinaResolution();
                res -= this.renderer.getMinResolutionMultiple();
                if (res > 0) sliceConfig.retinaResolution = res;
            }
            if (state.isKeyHold(this.keyConfig.addFov)) {
                this.retinaFov += this.fovKeySpeed;
                if (this.retinaFov > 120) this.retinaFov = 120;
                this.needsUpdateRetinaCamera = true;
            }
            if (state.isKeyHold(this.keyConfig.subFov)) {
                this.retinaFov -= this.fovKeySpeed;
                if (this.retinaFov < 0.1) this.retinaFov = 0;
                this.needsUpdateRetinaCamera = true;
            }
            for (let [label, keyCode] of Object.entries(this.keyConfig.sectionConfigs)) {
                if (state.isKeyHold(keyCode)) {
                    this.toggleSectionConfig(label);
                }
            }
            delta = (on(key.rotateDown) ? -1 : 0) + (on(key.rotateUp) ? 1 : 0);
            let keyRotateSpeed = this.keyRotateSpeed * state.mspf;
            if (delta) this._vec2damp.y = delta * keyRotateSpeed;
            delta = (on(key.rotateLeft) ? 1 : 0) + (on(key.rotateRight) ? -1 : 0);
            if (delta) this._vec2damp.x = delta * keyRotateSpeed;
            if (state.currentBtn === this.mouseButton) {
                this.refacingFront = false;
                if (state.moveX) this._vec2damp.x = state.moveX * this.mouseSpeed;
                if (state.moveY) this._vec2damp.y = state.moveY * this.mouseSpeed;
            }
            if (state.wheelY) {
                this.needsUpdateRetinaCamera = true;
                this.retinaSize += state.wheelY * this.wheelSpeed;
            }
            if (on(key.refaceFront)) {
                this.refacingFront = true;
            }
        }
        if (this._vec2damp.norm1() < 1e-3 || this.refacingFront) {
            this._vec2damp.set(0, 0);
        }
        if (this._vec2damp.norm1() > 1e-3 || this.refacingFront || this.needsUpdateRetinaCamera) {
            if (this.needsUpdateRetinaCamera) {
                if (this.retinaFov > 0) {
                    this.retinaZDistance = this.retinaSize / Math.tan(this.retinaFov / 2 * _DEG2RAD);
                    this.renderer.setRetinaProjectMatrix({
                        fov: this.retinaFov,
                        near: Math.max(0.01, this.retinaZDistance - 4),
                        far: this.retinaZDistance + 4
                    });
                } else {
                    this.retinaZDistance = 4;
                    this.renderer.setRetinaProjectMatrix({
                        size: this.retinaSize,
                        near: 2,
                        far: 8
                    });
                }
            }
            this.needsUpdateRetinaCamera = false;
            this._vec2euler.x %= _360;
            this._vec2euler.y %= _360;
            let dampFactor = Math.exp(-this.damp * Math.min(200.0, state.mspf));
            if (this.refacingFront) {
                this._vec2euler.mulfs(dampFactor);
                if (this._vec2euler.norm1() < 0.01) this.refacingFront = false;
            }
            this._vec2euler.adds(this._vec2damp);
            let mat = this._mat4.setFrom3DRotation(this._q1.expset(this._vec3.set(0, this._vec2euler.x, 0)).mulsr(
                this._q2.expset(this._vec3.set(this._vec2euler.y, 0, 0))
            ).conjs());
            mat.elem[11] = -this.retinaZDistance;
            this.renderer.setRetinaViewMatrix(mat);
            this._vec2damp.mulfs(dampFactor);
        }
        this.renderer.setSliceConfig(sliceConfig);
    }
    setStereo(stereo: boolean) {
        if (!stereo) {
            this.renderer.setEyeOffset(0, 0);
        } else {
            this.renderer.setEyeOffset(this.sectionEyeOffset, this.retinaEyeOffset);
        }
        let sections = this.sectionPresets(this.renderer.getSize())[this.currentSectionConfig][(
            !stereo ? "eye2" : "eye1"
        )];
        this.renderer.setSliceConfig({ sections });
    }
    setSectionEyeOffset(offset: number) {
        this.sectionEyeOffset = offset;
        if (this.renderer.getStereoMode()) this.renderer.setEyeOffset(offset);
    }
    setRetinaEyeOffset(offset: number) {
        this.retinaEyeOffset = offset;
        if (this.renderer.getStereoMode()) this.renderer.setEyeOffset(null, offset);
    }
    setLayers(layers: number) {
        this.renderer.setSliceConfig({ layers });
    }
    setOpacity(opacity: number) {
        this.renderer.setOpacity(opacity);
    }
    setCrosshairSize(size: number) {
        this.renderer.setCrosshair(size);
        this.crossHairSize = size;
    }
    setRetinaResolution(retinaResolution: number) {
        this.renderer.setSliceConfig({ retinaResolution });
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
        let preset = this.sectionPresets(this.renderer.getSize())[index];
        if (!preset) console.error(`Section Configuration "${index}" does not exsit.`);
        let layers = this.renderer.getLayers();
        if (preset.retina === false && layers > 0) {
            this.rembemerLastLayers = layers;
            layers = 0;
        } else if (preset.retina === true && this.rembemerLastLayers) {
            layers = this.rembemerLastLayers;
            this.rembemerLastLayers = null;
        }
        let sections = preset[(
            this.renderer.getStereoMode() ? "eye2" : "eye1"
        )];
        this.renderer.setSliceConfig({ layers, sections });
        this.currentSectionConfig = index;
    }
    setSize(size: GPUExtent3DStrict) {
        this.renderer.setSize(size);
        this.needResize = true;
    }
}