import { BaseWindow } from "./basewindow.js";
import { StorageManager } from "./storage.js";
type I18NText = {
    zh: string;
    en: string;
};
type KeyBindingAction = {
    title: I18NText;
    /** internal code:
     *  'KeyA' for holding Key A
     *  '.KeyA' for pressing Key A
     *  'ControlLeft+.KeyA' for press A while holding CtrlLeft */
    key: string;
    press?: boolean;
};
type KeyBindingGroup = {
    title?: I18NText;
    actions?: Record<string, KeyBindingAction>;
    groups?: Record<string, KeyBindingGroup>;
};
type KeyBindingPreset = Record<string, string>;
type KeyBindingConfig = {
    root: KeyBindingGroup;
    presets: Record<string, KeyBindingPreset>;
    keyIndex: Record<string, string>;
};
export declare class KeyBindingUI extends BaseWindow {
    data: KeyBindingConfig;
    lang: "zh" | "en";
    private waitingAction;
    private combo;
    onchange: () => void;
    private changed;
    storage: StorageManager;
    constructor(storage: StorageManager);
    private injectMyStyle;
    open(): void;
    close(): void;
    private cancelWaiting;
    render(): void;
    private renderFooter;
    private onKeyDown;
    private onKeyUp;
    private findAction;
    addGroup(name: string, v: KeyBindingGroup): void;
    private updateActionKey;
}
export declare function shortcut2text(lang: "zh" | "en", s: string): string;
export {};
