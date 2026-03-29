class SettingsManager {
    static STORAGE_KEY = "tesserxel.settings";
    data;
    load() {
        try {
            const raw = localStorage.getItem(SettingsManager.STORAGE_KEY);
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
        localStorage.setItem(SettingsManager.STORAGE_KEY, JSON.stringify(this.data));
    }
    // ---------- default ----------
    default() {
        return {
            version: 1,
            keybindings: {},
            graphics: {},
        };
    }
    migrate(old) {
        const currentVersion = 1;
        if (!old.version)
            old.version = 1;
        switch (old.version) {
                    }
        old.version = currentVersion;
        return old;
    }
    clear() {
        localStorage.removeItem(SettingsManager.STORAGE_KEY);
        this.data = this.default();
    }
}

export { SettingsManager };
//# sourceMappingURL=storage.js.map
