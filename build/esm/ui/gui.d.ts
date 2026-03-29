import { ControllerRegistry, ControllerState } from "./ctrl.js";
import { KeyBindingUI } from "./keybind.js";
import { PreferenceUI } from "./preference.js";
import { StorageManager } from "./storage.js";
export interface BtnDesc {
    name: string;
    svgIcon: string;
    shortcut?: string;
    title?: {
        zh: string;
        en: string;
    };
}
export declare class SettingGUI {
    preferenceMgr: PreferenceUI;
    keybindingMgr: KeyBindingUI;
    storageMgr: StorageManager;
    iconSize: number;
    onbtnpress: (states: ControllerState) => void;
    onbtnup: (states: ControllerState) => void;
    dom: HTMLDivElement;
    styleDom: HTMLStyleElement;
    private mainBtnCount;
    private ctrlReg;
    lang?: "zh" | "en";
    isOpen(): boolean;
    constructor(ctrlReg: ControllerRegistry);
    private enableDragging;
    private createBtn;
    private setBtnPos;
    addLvl1Button(desc: BtnDesc): HTMLButtonElement;
    addLvl2Panel(lvl1btn: HTMLButtonElement): HTMLDivElement;
    addLvl2Button(desc: BtnDesc, lvl2panel: HTMLDivElement): HTMLButtonElement;
    addLvl3Drop(lvl2btn: HTMLButtonElement, width: number, offset?: number): HTMLDivElement;
    private refreshBtn;
    refresh(): void;
    private setStyle;
    increaseBtnSize(): void;
    decreaseBtnSize(): void;
    openKeybindMgr(): void;
    openPreferenceMgr(): void;
}
