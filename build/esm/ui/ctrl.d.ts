import { Obj4 } from "../math/algebra/affine.js";
import { Vec4 } from "../math/algebra/vec4.js";
import { SectionConfig, DisplayConfig, SliceRenderer } from "../render/slice/slice.js";
import { SettingGUI } from "./gui.js";
import { StorageManager } from "./storage.js";
export declare const SVG_HEADER = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='";
export declare const SVG_LINE = "style=\"fill:none;stroke:#FFF;stroke-width:0.25;\"";
export { shortcut2text } from "./keybind.js";
export interface IController {
    enabled?: boolean;
    update(state: ControllerState): void;
    registGui?: (gui: SettingGUI) => void;
}
export interface ControllerConfig {
    preventDefault?: boolean;
    enablePointerLock?: boolean;
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
    storage: StorageManager;
    requestPointerLock: () => void;
    enablePointerLock?: boolean;
    /** PointerLock has been triggered by the mouse */
    isPointerLockedMouseDown?: boolean;
    /** PointerLock has been canceled by key escape */
    isPointerLockEscaped?: boolean;
    /** internal code:
     *  'KeyA' for holding Key A
     *  '.KeyA' for pressing Key A
     *  'ControlLeft+.KeyA' for press A while holding CtrlLeft */
    isKeyHold: (code: string) => boolean;
    /** "path.action" from keybindingMgr */
    isActionHold: (action: string, path: string) => boolean;
    isActionActive: (action: string, path: string) => boolean;
    getActionKey: (action: string, path: string) => string;
    isPointerLocked: () => boolean;
    exitPointerLock: () => void;
    /** each update, check whether there are some ctrlpath with xxx.enable key hold
     * this can be used to disable other ctrl paths
     */
    enabledCtrlPath: string[];
}
export declare enum KeyState {
    NONE = 0,
    UP = 1,
    HOLD = 2,
    DOWN = 3
}
export declare class ControllerRegistry {
    dom: HTMLElement;
    gui: SettingGUI;
    private ctrls;
    enablePointerLock: boolean;
    private storage;
    readonly states: ControllerState;
    /** if this is true, prevent default will not work  */
    disableDefaultEvent: boolean;
    iconSize: number;
    private prevIsPointerLocked;
    private evMouseDown;
    private evMouseUp;
    private evMouseMove;
    private evWheel;
    private evKeyUp;
    private evKeyDown;
    private evContextMenu;
    constructor(dom: HTMLElement, ctrls: Array<IController>, config?: ControllerConfig);
    private initGUI;
    add(ctrl: IController): void;
    remove(ctrl: IController): void;
    unregist(): void;
    update(): void;
}
export declare class TrackBallController implements IController {
    center: Vec4;
    enabled: boolean;
    object: Obj4;
    mouseSpeed: number;
    wheelSpeed: number;
    damp: number;
    mouseButton3D: number;
    mouseButtonRoll: number;
    mouseButton4D: number;
    /** how many update cycles (2^n) to normalise rotor to avoid accuracy problem */
    normalisePeriodBit: 4;
    keyConfig: {
        disable: string;
        enable: string;
    };
    cameraMode: boolean;
    private _bivec;
    private normalisePeriodMask;
    constructor(object?: Obj4, cameraMode?: boolean);
    update(state: ControllerState): void;
    lookAtCenter(): void;
    registGui(gui: SettingGUI): void;
}
export declare class FreeFlyController implements IController {
    enabled: boolean;
    swapMouseYWithScrollY: boolean;
    object: Obj4;
    mouseSpeed: number;
    wheelSpeed: number;
    keyMoveSpeed: number;
    keyRotateSpeed: number;
    damp: number;
    constructor(object?: Obj4);
    /** how many update cycles (2^n) to normalise rotor to avoid accuracy problem */
    normalisePeriodBit: 4;
    private _bivec;
    private _bivecKey;
    private _moveVec;
    private _vec;
    private normalisePeriodMask;
    registGui(gui: SettingGUI): void;
    update(state: ControllerState): void;
}
export declare class KeepUpController implements IController {
    enabled: boolean;
    object: Obj4;
    mouseSpeed: number;
    wheelSpeed: number;
    keyMoveSpeed: number;
    keyRotateSpeed: number;
    damp: number;
    keyConfig: {
        front: string;
        back: string;
        left: string;
        right: string;
        ana: string;
        kata: string;
        up: string;
        down: string;
        turnLeft: string;
        turnRight: string;
        turnAna: string;
        turnKata: string;
        turnUp: string;
        turnDown: string;
        spinCW: string;
        spinCCW: string;
        disable: string;
        enable: string;
    };
    registGui(gui: SettingGUI): void;
    /** how many update cycles (2^n) to normalise rotor to avoid accuracy problem */
    normalisePeriodBit: 4;
    private _bivec;
    private _bivec2;
    private _bivecKey;
    private _moveVec;
    private _vec;
    private normalisePeriodMask;
    private horizontalRotor;
    private verticalRotor;
    constructor(object?: Obj4);
    updateObj(): void;
    update(state: ControllerState): void;
}
export declare class VoxelViewerController implements IController {
    enabled: boolean;
    object: Obj4;
    mouseSpeed: number;
    wheelSpeed: number;
    damp: number;
    mousePan: number;
    mousePanZ: number;
    mouseRotate: number;
    /** how many update cycles (2^n) to normalise rotor to avoid accuracy problem */
    normalisePeriodBit: 4;
    keyConfig: {
        disable: string;
        enable: string;
    };
    private _bivec;
    private _vec;
    private _wy;
    private normalisePeriodMask;
    constructor(object?: Obj4);
    update(state: ControllerState): void;
}
interface SectionPreset {
    retina: boolean;
    eye1: SectionConfig[];
    eye2: SectionConfig[];
}
export declare namespace sliceconfig {
    function singlezslice1eye(screenSize: {
        width: number;
        height: number;
    }): SectionConfig[];
    function singlezslice2eye(screenSize: {
        width: number;
        height: number;
    }): SectionConfig[];
    function singleyslice1eye(screenSize: {
        width: number;
        height: number;
    }): SectionConfig[];
    function singleyslice2eye(screenSize: {
        width: number;
        height: number;
    }): SectionConfig[];
    function zslices1eye(step: number, maxpos: number, screenSize: {
        width: number;
        height: number;
    }): SectionConfig[];
    function zslices2eye(step: number, maxpos: number, screenSize: {
        width: number;
        height: number;
    }): SectionConfig[];
    function yslices1eye(step: number, maxpos: number, screenSize: {
        width: number;
        height: number;
    }): SectionConfig[];
    function yslices2eye(step: number, maxpos: number, screenSize: {
        width: number;
        height: number;
    }): SectionConfig[];
    function default2eye(size: number, screenSize: {
        width: number;
        height: number;
    }): SectionConfig[];
    function default1eye(size: number, screenSize: {
        width: number;
        height: number;
    }): SectionConfig[];
}
export declare class RetinaController implements IController {
    enabled: boolean;
    renderer: SliceRenderer;
    mouseSpeed: number;
    wheelSpeed: number;
    keyMoveSpeed: number;
    keyRotateSpeed: number;
    opacityKeySpeed: number;
    fovKeySpeed: number;
    damp: number;
    mouseButton: number;
    retinaAlphaMouseButton: number;
    retinaEyeOffset: number;
    sectionEyeOffset: number;
    maxSectionEyeOffset: number;
    minSectionEyeOffset: number;
    size: GPUExtent3DStrict;
    sectionPresetLabels: string[];
    sectionPresets: (screenSize: GPUExtent3DStrict) => {
        [label: string]: SectionPreset;
    };
    private currentSectionConfig;
    private rembemerLastLayers;
    private needResize;
    private currentRetinaRenderPassIndex;
    private alphaBuffer;
    private guiButtons;
    constructor(r: SliceRenderer);
    registGui(gui: SettingGUI): void;
    private _vec2damp;
    private _vec2euler;
    private _vec3;
    private _q1;
    private _q2;
    private _mat4;
    private refacingFront;
    private refacingTarget;
    private needsUpdateRetinaCamera;
    private retinaFov;
    private retinaSize;
    private retinaZDistance;
    private crossHairSize;
    /** Store displayconfig temporal changes between frames */
    private tempDisplayConfig;
    private displayConfigChanged;
    maxRetinaResolution: number;
    private retinaRenderPasses;
    private defaultRetinaRenderPass;
    gui: RetinaCtrlGui;
    toggleRetinaAlpha(idx: number): void;
    getSubLayersNumber(updateCount?: number): number;
    getAddLayersNumber(updateCount?: number): number;
    update(state: ControllerState): void;
    private writeConfigToggleStereoMode;
    toggleStereo(stereo?: boolean): void;
    private writeConfigToggleCrosshair;
    toggleCrosshair(): void;
    setSectionEyeOffset(offset: number): void;
    setRetinaEyeOffset(offset: number): void;
    setLayers(layers: number): void;
    setOpacity(opacity: number): void;
    setCrosshairSize(size: number): void;
    setRetinaResolution(retinaResolution: number): void;
    setRetinaSize(size: number): void;
    setRetinaFov(fov: number): void;
    toggleSectionConfig(index: string): void;
    setSize(size: GPUExtent3DStrict): void;
    setDisplayConfig(config: DisplayConfig): void;
}
export declare class RetinaCtrlGui {
    controller: RetinaController;
    dom: HTMLDivElement;
    iconSize: number;
    lang?: "zh" | "en";
    refresh: (param: any) => void;
    createToggleDiv(CtrlBtn: HTMLButtonElement, display?: string): HTMLDivElement;
    createDropBox(CtrlBtn: HTMLButtonElement, offset: number, width?: number): HTMLDivElement;
}
