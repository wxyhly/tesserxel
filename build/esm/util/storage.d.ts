type PlayerSettings = {
    version: number;
    keybindings: Record<string, string>;
    graphics: Record<string, string>;
};
export declare class SettingsManager {
    private static STORAGE_KEY;
    data: PlayerSettings;
    private load;
    save(): void;
    private default;
    private migrate;
    clear(): void;
}
export {};
