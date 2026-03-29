let injectedWindowStyle = false;
class BaseWindow {
    overlay;
    panel;
    isOpen = false;
    constructor() {
        this.overlay = document.createElement("div");
        this.overlay.className = "app-overlay";
        this.overlay.style.display = "none";
        this.panel = document.createElement("div");
        this.panel.className = "app-window";
        this.overlay.appendChild(this.panel);
        document.body.appendChild(this.overlay);
        this.injectStyle();
        this.overlay.addEventListener("mousedown", (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });
    }
    open() {
        this.isOpen = true;
        this.overlay.style.display = "flex";
        this.render();
    }
    close() {
        this.isOpen = false;
        this.overlay.style.display = "none";
    }
    // ---------- 样式 ----------
    injectStyle() {
        if (injectedWindowStyle)
            return;
        injectedWindowStyle = true;
        const style = document.createElement("style");
        style.textContent = `
.app-overlay{
    position:fixed;
    inset:0;
    background:rgba(0,0,0,0.5);
    z-index:999999;
    display:flex;
    align-items:center;
    justify-content:center;
}

.app-window{
    font-family:sans-serif;
    background:#222;
    color:#eee;
    padding:16px;
    width:360px;
    border:1px solid #666;
    border-radius:6px;
    box-shadow:0 0 20px rgba(0,0,0,0.6);
}
        `;
        document.head.appendChild(style);
    }
}

export { BaseWindow };
//# sourceMappingURL=basewindow.js.map
