type PlayerSettings = {
    version: number,
    keybindings: Record<string, string>,   // path -> combo
    preference: Record<string, string>,
}
export class StorageManager {
    private static STORAGE_KEY = "tesserxel.settings"
    data: PlayerSettings;
    constructor() {
        this.data = this.load();
    }
    private load(): PlayerSettings {
        try {
            const raw = localStorage.getItem(StorageManager.STORAGE_KEY);
            if (!raw) return this.default();
            const parsed = JSON.parse(raw);
            return this.migrate(parsed);
        } catch {
            return this.default();
        }
    }

    // ---------- save ----------

    save() {
        localStorage.setItem(
            StorageManager.STORAGE_KEY,
            JSON.stringify(this.data)
        );
    }

    // ---------- default ----------

    private default(): PlayerSettings {
        return {
            version: 1,
            keybindings: {},
            preference: {
                "shortcuts": "remember",
                "stereo": "cross",
                "sectionConfig": "retina+sections"
            },
        }
    }

    migrate(old: any): PlayerSettings {
        const currentVersion = 1;
        if (!old.version) old.version = 1;
        switch (old.version) {
            case 1:
                old.keybindings ??= {};
                old.preference ??= {
                    "shortcuts": "remember",
                    "stereo": "cross",
                    "sectionConfig": "retina+sections"
                };
                break;
        }
        old.version = currentVersion;
        return old as PlayerSettings;
    }
    clear() {
        localStorage.removeItem(StorageManager.STORAGE_KEY)
        this.data = this.default();
    }
}