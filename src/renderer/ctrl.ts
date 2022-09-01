namespace tesserxel {
    export namespace controller {
        export interface IController {
            update(state: ControllerState): void;
            enabled: boolean;
        }
        interface ControllerConfig {
            preventDefault?: boolean;
            requsetPointerLock?: boolean;
        }
        interface KeyConfig {
            enable?: string;
            disable?: string;
        }
        interface ControllerState {
            currentKeys: Map<String, KeyState>;
            currentBtn: number;
            updateCount: number;
            moveX: number;
            moveY: number;
            wheelX: number;
            wheelY: number;
            lastUpdateTime?: number;
            mspf?: number;
            requsetPointerLock?: boolean;
            isKeyHold?: (code: string) => boolean;
            queryDisabled?: (config: KeyConfig) => boolean;
            isPointerLocked?: () => boolean;
            exitPointerLock?: () => void;
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
            requsetPointerLock: boolean;
            private states: ControllerState = {
                currentKeys: new Map(),
                currentBtn: -1,
                updateCount: 0,
                moveX: 0,
                moveY: 0,
                wheelX: 0,
                wheelY: 0,
            }
            constructor(dom: HTMLElement, ctrls: Iterable<IController>, config?: ControllerConfig) {
                this.dom = dom;
                dom.tabIndex = 1;
                this.ctrls = ctrls;
                this.requsetPointerLock = config.requsetPointerLock;
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
                    return document.pointerLockElement === this.dom;
                }
                this.states.exitPointerLock = () => {
                    if (document.pointerLockElement === this.dom) document.exitPointerLock();
                }
                dom.addEventListener("mousedown", (ev) => {
                    if (this.requsetPointerLock && document.pointerLockElement !== dom) {
                        dom.requestPointerLock();
                    } else {
                        dom.focus();
                    }
                    this.states.currentBtn = ev.button;
                    this.states.moveX = 0;
                    this.states.moveY = 0;
                    // left click should not be prevented, otherwise keydown event can't obtain focus
                    if (ev.button === 1 && config?.preventDefault === true) {
                        ev.preventDefault();
                        ev.stopPropagation();
                    }
                });
                dom.addEventListener("mousemove", (ev) => {
                    this.states.moveX += ev.movementX;
                    this.states.moveY += ev.movementY;
                });
                dom.addEventListener("mouseup", (ev) => {
                    this.states.currentBtn = -1;
                });
                dom.addEventListener("keydown", (ev) => {
                    let prevState = this.states.currentKeys.get(ev.code);
                    this.states.currentKeys.set(ev.code, prevState === KeyState.HOLD ? KeyState.HOLD : KeyState.DOWN);
                    ev.preventDefault();
                    ev.stopPropagation();
                });
                dom.addEventListener("keyup", (ev) => {
                    this.states.currentKeys.set(ev.code, KeyState.UP);
                    ev.preventDefault();
                    ev.stopPropagation();
                });
                dom.addEventListener("wheel", (ev) => {
                    this.states.wheelX = ev.deltaX;
                    this.states.wheelY = ev.deltaY;
                });
                if (config?.preventDefault === true) {
                    dom.addEventListener("contextmenu", (ev) => {
                        ev.preventDefault();
                        ev.stopPropagation();
                    });
                }
            }
            update() {
                this.states.requsetPointerLock = this.requsetPointerLock;
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
                this.states.moveX = 0;
                this.states.moveY = 0;
                this.states.wheelX = 0;
                this.states.wheelY = 0;
                this.states.updateCount++;
                for (let [key, prevState] of this.states.currentKeys) {
                    let newState = prevState;
                    if (prevState === KeyState.DOWN) {
                        newState = KeyState.HOLD;
                    } else if (prevState === KeyState.UP) {
                        newState = KeyState.NONE;
                    }
                    this.states.currentKeys.set(key, newState);
                    // console.log(key, this.states.currentKeys.get(key));
                }
            }
        }
        export class TrackBallController implements IController {
            enabled = true;
            object = new math.Obj4(math.Vec4.w.neg());
            mouseSpeed = 0.01;
            wheelSpeed = 0.0001;
            damp = 0.1;
            /** how many update cycles (2^n) to normalise rotor to avoid accuracy problem */
            normalisePeriodBit: 4;
            keyConfig = {
                disable: "AltLeft",
                enable: "",
            }
            private _bivec = new math.Bivec();
            private normalisePeriodMask = 15;
            constructor() { }
            update(state: ControllerState) {
                let disabled = state.queryDisabled(this.keyConfig);
                let dampFactor = Math.exp(-this.damp * Math.min(200.0,state.mspf));
                if (!disabled) {
                    let dx = state.moveX * this.mouseSpeed;
                    let dy = -state.moveY * this.mouseSpeed;
                    let wy = state.wheelY * this.wheelSpeed;
                    switch (state.currentBtn) {
                        case 0:
                            this._bivec.set(0, dx, 0, dy);
                            break;
                        case 1:
                            this._bivec.set(dx, 0, 0, 0, 0, dy);
                            break;
                        case 2:
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
            object = new math.Obj4();
            mouseSpeed = 0.01;
            wheelSpeed = 0.0005;
            keyMoveSpeed = 0.001;
            keyRotateSpeed = 0.001;
            damp = 0.01;
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
            private _bivec = new math.Bivec();
            private _bivecKey = new math.Bivec();
            private _moveVec = new math.Vec4();
            private _vec = new math.Vec4();
            private normalisePeriodMask = 15;

            update(state: ControllerState) {
                let on = state.isKeyHold;
                let key = this.keyConfig;
                let delta: number;
                let dampFactor = Math.exp(-this.damp * Math.min(200.0,state.mspf));
                console.log(dampFactor);
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
                    if ((state.requsetPointerLock && state.isPointerLocked()) || (state.currentBtn = 0 && !state.requsetPointerLock)) {
                        let dx = state.moveX * this.mouseSpeed;
                        let dy = -state.moveY * this.mouseSpeed;
                        this._bivec.xw += dx;
                        this._bivec.yw += dy;
                    }
                    if ((state.requsetPointerLock && state.isPointerLocked()) || (!state.requsetPointerLock)) {
                        let wx = state.wheelX * this.wheelSpeed;
                        let wy = state.wheelY * this.wheelSpeed;
                        this._bivec.xy += wx;
                        this._bivec.zw += wy;
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
            keepUp = false;
            object = new math.Obj4();
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
            private _bivec = new math.Bivec();
            private _bivec2 = new math.Bivec();
            private _bivecKey = new math.Bivec();
            private _moveVec = new math.Vec4();
            private _vec = new math.Vec4();
            private normalisePeriodMask = 15;
            private horizontalRotor = new math.Rotor();
            private verticalRotor = new math.Rotor();
            constructor() { }

            update(state: ControllerState) {
                let on = state.isKeyHold;
                let key = this.keyConfig;
                let delta: number;
                let dampFactor = Math.exp(-this.damp * Math.min(200.0,state.mspf));
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
                    if ((state.requsetPointerLock && state.isPointerLocked()) || (state.currentBtn === 0 && !state.requsetPointerLock)) {
                        let dx = state.moveX * this.mouseSpeed;
                        let dy = state.moveY * this.mouseSpeed;
                        this._bivec.xw += dx;
                        this._bivec.zw += dy;
                    }
                    if ((state.requsetPointerLock && state.isPointerLocked()) || (!state.requsetPointerLock)) {
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
        interface SectionPreset {
            retina: boolean,
            eye1: renderer.SectionConfig[],
            eye2: renderer.SectionConfig[]
        }
        export namespace sliceconfig {
            export let size = 0.2;
            
            export function singleslice1eye(aspect: number): renderer.SliceConfig {
                return {
                    layers: 0,
                    opacity: 1.0,
                    sections: [{
                        slicePos: 0,
                        facing: tesserxel.renderer.SliceFacing.POSZ,
                        viewport: { x: 0, y: 0, width: 1 / aspect, height: 1.0 }
                    }]
                };
            }
            export function singleslice2eye(aspect: number): renderer.SliceConfig {
                return {
                    layers: 0,
                    opacity: 1.0,
                    sectionEyeOffset: 0.1,
                    sections: [{
                        slicePos: 0,
                        facing: tesserxel.renderer.SliceFacing.POSZ,
                        eyeOffset: renderer.EyeOffset.LeftEye,
                        viewport: { x: -0.5, y: 0, width: 0.5 / aspect, height: 0.8 }
                    }, {
                        slicePos: 0,
                        facing: tesserxel.renderer.SliceFacing.POSZ,
                        eyeOffset: renderer.EyeOffset.RightEye,
                        viewport: { x: 0.5, y: 0, width: 0.5 / aspect, height: 0.8 }
                    }]
                };
            }
            export function zslices1eye(step: number, maxpos: number, aspect: number): renderer.SliceConfig {
                let arr = [[0, 0]];
                let j = 1;
                for (let i = step; i <= maxpos; i += step, j++) {
                    arr.push([i, j]);
                    arr.push([-i, -j]);
                }
                let half = 2 / arr.length;
                let size = 1 / (aspect * arr.length);
                return {
                    layers: 64,
                    opacity: 1.0,
                    sections: arr.map(pos => ({
                        slicePos: pos[0],
                        facing: tesserxel.renderer.SliceFacing.POSZ,
                        viewport: { x: pos[1] * half, y: size - 1, width: size, height: size }
                    }))
                };
            }
            export function zslices2eye(step: number, maxpos: number, aspect: number): renderer.SliceConfig {
                let arr = [[0, 0]];
                let j = 1;
                for (let i = step; i <= maxpos; i += step, j++) {
                    arr.push([i, j]);
                    arr.push([-i, -j]);
                }
                arr.sort((a, b) => a[0] - b[0]);
                let half = 1 / arr.length;
                let size = 0.5 / (aspect * arr.length);
                return {
                    layers: 64,
                    sectionEyeOffset: 0.1,
                    retinaEyeOffset: 0.1,
                    opacity: 1.0,
                    sections: arr.map(pos => ({
                        slicePos: pos[0],
                        facing: tesserxel.renderer.SliceFacing.POSZ,
                        eyeOffset: renderer.EyeOffset.LeftEye,
                        viewport: { x: (pos[1] * half) - 0.5, y: size - 1, width: size, height: size }
                    })).concat(
                        arr.map(pos => ({
                            slicePos: pos[0],
                            facing: tesserxel.renderer.SliceFacing.POSZ,
                            eyeOffset: renderer.EyeOffset.RightEye,
                            viewport: { x: (pos[1] * half) + 0.5, y: size - 1, width: size, height: size }
                        }))
                    )
                };
            }
            export function default2eye(size): renderer.SliceConfig {
                return {
                    layers: 64,
                    sectionEyeOffset: 0.1,
                    retinaEyeOffset: 0.1,
                    opacity: 1.0,
                    sections: [
                        {
                            facing: tesserxel.renderer.SliceFacing.NEGX,
                            eyeOffset: tesserxel.renderer.EyeOffset.LeftEye,
                            viewport: { x: -size, y: size - 1, width: size, height: size }
                        },
                        {
                            facing: tesserxel.renderer.SliceFacing.NEGX,
                            eyeOffset: tesserxel.renderer.EyeOffset.RightEye,
                            viewport: { x: 1 - size, y: size - 1, width: size, height: size }
                        },
                        {
                            facing: tesserxel.renderer.SliceFacing.NEGY,
                            eyeOffset: tesserxel.renderer.EyeOffset.LeftEye,
                            viewport: { x: -size, y: 1 - size, width: size, height: size }
                        },
                        {
                            facing: tesserxel.renderer.SliceFacing.NEGY,
                            eyeOffset: tesserxel.renderer.EyeOffset.RightEye,
                            viewport: { x: 1 - size, y: 1 - size, width: size, height: size }
                        },
                        {
                            facing: tesserxel.renderer.SliceFacing.POSZ,
                            eyeOffset: tesserxel.renderer.EyeOffset.LeftEye,
                            viewport: { x: size - 1, y: size - 1, width: size, height: size }
                        },
                        {
                            facing: tesserxel.renderer.SliceFacing.POSZ,
                            eyeOffset: tesserxel.renderer.EyeOffset.RightEye,
                            viewport: { x: size, y: size - 1, width: size, height: size }
                        },
                    ]
                };
            };
            export function default1eye(size): renderer.SliceConfig {
                return {
                    layers: 64,
                    opacity: 1.0,
                    sections: [
                        {
                            facing: tesserxel.renderer.SliceFacing.NEGX,
                            viewport: { x: 1 - size, y: size - 1, width: size, height: size }
                        },
                        {
                            facing: tesserxel.renderer.SliceFacing.NEGY,
                            viewport: { x: 1 - size, y: 1 - size, width: size, height: size }
                        },
                        {
                            facing: tesserxel.renderer.SliceFacing.POSZ,
                            viewport: { x: size - 1, y: size - 1, width: size, height: size }
                        }
                    ]
                };
            };
        }
        export class RetinaController implements IController {
            enabled = true;
            keepUp = false;
            renderer: renderer.TetraRenderer;
            mouseSpeed = 0.01;
            wheelSpeed = 0.0001;
            keyMoveSpeed = 0.01;
            keyRotateSpeed = 0.01;
            opacityKeySpeed = 0.01;
            damp = 0.1;
            mouseButton = 0;
            sectionPresets: (aspect: number) => SectionPreset[];
            private sliceConfig: renderer.SliceConfig;
            private currentSectionConfig: number = 0;
            private rembemerLastLayers: number;
            private needResize: boolean = true;
            keyConfig = {
                enable: "AltLeft",
                disable: "",
                toggle3D: ".KeyZ",
                addOpacity: "KeyQ",
                subOpacity: "KeyA",
                addLayer: "KeyW",
                subLayer: "KeyS",
                rotateLeft: "ArrowLeft",
                rotateRight: "ArrowRight",
                rotateUp: "ArrowUp",
                rotateDown: "ArrowDown",
                refaceFront: ".KeyR",
                sectionConfigs: [".Digit1", ".Digit2", ".Digit3"],
            }
            constructor(r: renderer.TetraRenderer) {
                this.renderer = r;
                this.sliceConfig = r.getSliceConfig() ?? sliceconfig.default2eye(0.2);
                this.sectionPresets = (aspect: number) => [
                    {
                        eye1: sliceconfig.default1eye(0.2).sections,
                        eye2: sliceconfig.default2eye(0.2).sections,
                        retina: true
                    },
                    {
                        eye1: sliceconfig.zslices1eye(0.15, 0.6, aspect).sections,
                        eye2: sliceconfig.zslices2eye(0.3, 0.6, aspect).sections,
                        retina: true
                    },
                    {
                        eye1: sliceconfig.singleslice1eye(aspect).sections,
                        eye2: sliceconfig.singleslice2eye(aspect).sections,
                        retina: false
                    },
                ];
            }
            private _vec2damp = new math.Vec2();
            private _vec2euler = new math.Vec2();
            private _vec3 = new math.Vec3();
            private _q1 = new math.Quaternion();
            private _q2 = new math.Quaternion();
            private _mat4 = new math.Mat4();
            private sliceNeedUpdate: boolean;
            retinaZDistance = 5;
            update(state: ControllerState): void {

                let disabled = state.queryDisabled(this.keyConfig);
                let on = state.isKeyHold;
                let key = this.keyConfig;
                let delta: number;
                let sliceConfig = this.sliceConfig;
                if (!disabled && state.isKeyHold(this.keyConfig.toggle3D)) {
                    sliceConfig.retinaEyeOffset = sliceConfig.retinaEyeOffset ? 0 : 0.1;
                    sliceConfig.sectionEyeOffset = sliceConfig.sectionEyeOffset ? 0 : 0.1;
                    sliceConfig.sections = this.sectionPresets(this.renderer.getScreenAspect())[this.currentSectionConfig][(
                        sliceConfig.sectionEyeOffset ? "eye2" : "eye1"
                    )];
                    this.sliceNeedUpdate = true;
                } else if (this.needResize) {
                    this.sliceNeedUpdate = true;
                    sliceConfig.sections = this.sectionPresets(this.renderer.getScreenAspect())[this.currentSectionConfig][(
                        sliceConfig.sectionEyeOffset ? "eye2" : "eye1"
                    )];
                }
                if (!disabled) {
                    this.needResize = false;
                    if (state.isKeyHold(this.keyConfig.addOpacity)) {
                        this.sliceConfig.opacity *= 1 + this.opacityKeySpeed;
                        this.sliceNeedUpdate = true;
                    }
                    if (state.isKeyHold(this.keyConfig.subOpacity)) {
                        this.sliceConfig.opacity /= 1 + this.opacityKeySpeed;
                        this.sliceNeedUpdate = true;
                    }
                    if (state.isKeyHold(this.keyConfig.addLayer)) {
                        if (this.sliceConfig.layers > 32 || ((state.updateCount & 3) && (this.sliceConfig.layers > 16 || (state.updateCount & 7)))) {
                            this.sliceConfig.layers++;
                        }
                        if (this.sliceConfig.layers > 512) this.sliceConfig.layers = 512;
                        this.sliceNeedUpdate = true;
                    }
                    if (state.isKeyHold(this.keyConfig.subLayer)) {
                        // when < 32, we slow down layer speed
                        if (this.sliceConfig.layers > 32 || ((state.updateCount & 3) && (this.sliceConfig.layers > 16 || (state.updateCount & 7)))) {
                            if (this.sliceConfig.layers > 0) this.sliceConfig.layers--;

                            this.sliceNeedUpdate = true;
                        }
                    }
                    for (let i = 0; i < this.keyConfig.sectionConfigs.length; i++) {
                        if (state.isKeyHold(this.keyConfig.sectionConfigs[i])) {
                            this.toggleSectionConfig(i);
                        }
                    }
                    delta = (on(key.rotateDown) ? -1 : 0) + (on(key.rotateUp) ? 1 : 0);
                    let keyRotateSpeed = this.keyRotateSpeed * state.mspf;
                    if (delta) this._vec2damp.y = delta * keyRotateSpeed;
                    delta = (on(key.rotateLeft) ? 1 : 0) + (on(key.rotateRight) ? -1 : 0);
                    if (delta) this._vec2damp.x = delta * keyRotateSpeed;
                    if (state.currentBtn === this.mouseButton) {
                        if (state.moveX) this._vec2damp.x = state.moveX * this.mouseSpeed;
                        if (state.moveY) this._vec2damp.y = state.moveY * this.mouseSpeed;
                    }
                }
                if (this._vec2damp.norm1() < 1e-3) {
                    this._vec2damp.set(0, 0);
                } else {
                    this._vec2euler.adds(this._vec2damp);
                    let mat = this._vec3.set(0, this._vec2euler.x, 0).expcpy(this._q1).mulsr(
                        this._vec3.set(this._vec2euler.y, 0, 0).expcpy(this._q2)
                    ).conjs().toRotateMatcpy(this._mat4);
                    mat.elem[11] = -this.retinaZDistance;
                    this.renderer.setRetinaViewMatrix(mat);
                    let dampFactor = Math.exp(-this.damp * Math.min(200.0,state.mspf));
                    this._vec2damp.mulfs(dampFactor);
                }
                if (this.sliceNeedUpdate) this.renderer.setSlice(this.sliceConfig);
                this.sliceNeedUpdate = false;
            }
            setSlice(sliceConfig: renderer.SliceConfig) {
                this.sliceConfig = sliceConfig;
                this.renderer.setSlice(this.sliceConfig);
                this.sliceNeedUpdate = false;
            }
            toggleSectionConfig(index: number) {
                if (this.currentSectionConfig === index) return;
                this.sliceNeedUpdate = true;
                let preset = this.sectionPresets(this.renderer.getScreenAspect())[index];
                if (preset.retina === false && this.sliceConfig.layers > 0) {
                    this.rembemerLastLayers = this.sliceConfig.layers;
                    this.sliceConfig.layers = 0;
                } else if (preset.retina === true && this.rembemerLastLayers) {
                    this.sliceConfig.layers = this.rembemerLastLayers;
                    this.rembemerLastLayers = null;
                }
                this.sliceConfig.sections = preset[(
                    this.sliceConfig.sectionEyeOffset ? "eye2" : "eye1"
                )];
                this.currentSectionConfig = index;
            }
            setSize(size: GPUExtent3DStrict) {
                this.renderer.setSize(size);
                this.needResize = true;
            }
        }
    }
}