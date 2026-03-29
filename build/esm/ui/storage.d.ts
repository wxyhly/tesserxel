type PlayerSettings = {
    version: number;
    keybindings: Record<string, string>;
    preference: Record<string, string>;
};
export declare class StorageManager {
    private static STORAGE_KEY;
    data: PlayerSettings;
    constructor();
    private load;
    save(): void;
    private default;
    migrate(old: any): PlayerSettings;
    clear(): void;
}
export {};
