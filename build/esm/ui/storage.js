class StorageManager {
    static STORAGE_KEY = "tesserxel.settings";
    data;
    constructor() {
        this.data = this.load();
    }
    load() {
        try {
            const raw = localStorage.getItem(StorageManager.STORAGE_KEY);
            if (!raw)
                return this.default();
            const parsed = JSON.parse(raw);
            return this.migrate(parsed);
        }
        catch {
            return this.default();
        }
    }
    // ---------- save ----------
    save() {
        localStorage.setItem(StorageManager.STORAGE_KEY, JSON.stringify(this.data));
    }
    // ---------- default ----------
    default() {
        return {
            version: 1,
            keybindings: {},
            preference: {
                "shortcuts": "remember",
                "stereo": "cross",
                "sectionConfig": "retina+sections"
            },
        };
    }
    migrate(old) {
        const currentVersion = 1;
        if (!old.version)
            old.version = 1;
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
        return old;
    }
    clear() {
        localStorage.removeItem(StorageManager.STORAGE_KEY);
        this.data = this.default();
    }
}

export { StorageManager };
//# sourceMappingURL=storage.js.map
