import { BaseWindow } from "./basewindow.js";
import { StorageManager } from "./storage.js";
export declare class PreferenceUI extends BaseWindow {
    lang: "zh" | "en";
    settings: StorageManager;
    constructor(settings: StorageManager);
    private items;
    render(): void;
}
