import { KeyState } from './ctrl.js';
import { KeyBindingUI } from './keybind.js';

class SettingGUI {
    keybindingMgr;
    iconSize = 32;
    onbtnpress = () => { };
    onbtnup = () => { };
    dom;
    styleDom;
    mainBtnCount = 0;
    ctrlReg;
    lang;
    needRefresh = true;
    isOpen() {
        return this.keybindingMgr.isOpen;
    }
    constructor(ctrlReg) {
        this.keybindingMgr = new KeyBindingUI();
        this.ctrlReg = ctrlReg;
        this.styleDom = document.createElement("style");
        document.head.appendChild(this.styleDom);
        this.dom = document.createElement("div");
        this.dom.style.position = "fixed";
        this.dom.style.top = "50vh";
        this.dom.style.right = "0";
        document.body.appendChild(this.dom);
        this.setStyle();
        this.enableDragging();
        this.keybindingMgr.onchange = () => this.refresh();
    }
    enableDragging() {
        let drag = NaN;
        let startPos;
        this.dom.addEventListener('mousedown', (e) => {
            drag = e.clientY;
            startPos = Number(this.dom.style.top.replace("vh", "")) / 100 * window.innerHeight;
        });
        this.dom.addEventListener('mousemove', (e) => {
            if (!drag)
                return;
            const currPos = startPos + e.clientY - drag;
            this.dom.style.top = currPos / window.innerHeight * 100 + "vh";
        });
        this.dom.addEventListener('mouseup', () => { drag = NaN; });
        this.dom.addEventListener('mouseout', () => { drag = NaN; });
    }
    createBtn(desc) {
        const btn = document.createElement("button");
        btn.className = "setting-gui";
        btn.innerHTML = "&nbsp;";
        if (desc.title?.zh)
            btn.setAttribute("data-title_zh", desc.title.zh);
        if (desc.title?.en)
            btn.setAttribute("data-title_en", desc.title.en);
        if (desc.shortcut)
            btn.setAttribute("data-shortcut", desc.shortcut);
        btn.style.backgroundImage = `url('data:image/svg+xml,${escape(desc.svgIcon)}')`;
        const keys = this.ctrlReg.states.currentKeys;
        const kname = desc.name;
        btn.setAttribute("data-name", kname);
        btn.addEventListener('mousedown', () => keys.set(kname, KeyState.DOWN));
        const kup = () => { if (keys.get(kname) & 2)
            keys.set(kname, KeyState.UP); };
        btn.addEventListener('mouseup', kup);
        btn.addEventListener('mouseout', kup);
        return btn;
    }
    setBtnPos(btn, lv1, lv2) {
        btn.style.top = lv1 * this.iconSize + "px";
        btn.style.right = lv2 * this.iconSize + "px";
        btn.style.position = "absolute";
        btn.setAttribute("data-pos_top", lv1.toString());
        btn.setAttribute("data-pos_right", lv2.toString());
        return btn;
    }
    addLvl1Button(desc) {
        const index = this.mainBtnCount++;
        const btn = this.createBtn(desc);
        this.setBtnPos(btn, index, 0);
        this.dom.appendChild(btn);
        return btn;
    }
    addLvl2Panel(lvl1btn) {
        const div = document.createElement("div");
        div.className = "setting-lvl2-panel";
        div.style.display = "none";
        const index = Number(lvl1btn.getAttribute("data-pos_top"));
        div.style.top = index * this.iconSize + "px";
        div.style.right = this.iconSize + "px";
        div.setAttribute("data-pos_top", index.toString());
        div.setAttribute("data-pos_right", "1");
        this.dom.appendChild(div);
        lvl1btn.addEventListener("click", () => {
            div.style.display = div.style.display === "none" ? "block" : "none";
        });
        return div;
    }
    addLvl2Button(desc, lvl2panel) {
        const btn = this.createBtn(desc);
        const wrapper = document.createElement("span");
        wrapper.className = "btn-wrapper";
        btn.setAttribute("data-pos_top", lvl2panel.getAttribute("data-pos_top"));
        lvl2panel.appendChild(wrapper);
        wrapper.appendChild(btn);
        return btn;
    }
    addLvl3Drop(lvl2btn, width, offset = 0) {
        const div = document.createElement("div");
        div.style.width = this.iconSize * width + "px";
        div.style.top = this.iconSize + "px";
        div.style.right = this.iconSize * offset + "px";
        div.setAttribute("data-pos_width", width.toString());
        div.setAttribute("data-pos_top", "1");
        div.setAttribute("data-pos_right", offset.toString());
        div.style.display = "none";
        div.className = "setting-lvl3-drop";
        lvl2btn.addEventListener("click", () => {
            div.style.display = div.style.display === "none" ? "block" : "none";
        });
        lvl2btn.parentElement.appendChild(div);
        return div;
    }
    refresh() {
        let params = new URLSearchParams(window.location.search.slice(1));
        this.lang = (params.get("lang") ?? (navigator.languages.join(",").includes("zh") ? "zh" : "en"));
        this.keybindingMgr.lang = this.lang;
        const keymgr = this.keybindingMgr;
        this.dom.querySelectorAll("button.setting-gui").forEach(btn => {
            const btnTitle = btn.getAttribute("data-title_" + this.lang);
            const keybind = btn.getAttribute("data-name");
            const btnShortcut = keybind ? `\n(${keymgr.shortcut2text(keymgr.data.keyIndex[btn.getAttribute("data-name")])})` : "";
            btn.setAttribute("title", btnTitle + btnShortcut);
        });
        this.keybindingMgr.render();
    }
    setStyle() {
        this.styleDom.textContent = `
button.setting-gui{
    width: ${this.iconSize}px;height: ${this.iconSize}px;
    border-radius: ${this.iconSize / 4}px;background: #999;
}
span.btn-wrapper{
width: ${this.iconSize}px;height: ${this.iconSize}px;
position: relative; display:inline-block;
}
div.setting-lvl2-panel{
    position: absolute;width: max-content;
}
div.setting-lvl3-drop{
    position: absolute;width: max-content;
}
button.setting-gui[title]:hover::after{
    white-space: pre-line; width: max-content;
    content:attr(title);position:absolute;bottom:calc(100% + 5px);right:0%; font-size:1em;z-index:100;background:#000;color:#FFF; padding:0;margin:0;
}
span.btn-red button{background: #B77;}
span.btn-green button{background: #7B7;}
span.btn-yellow button{background: #BB7;}


// move these below to another file:

.slicecfg button.setting-gui{
    background: #B77;
}
.settingbar button.setting-gui{
    background: #7B7;
}
.crossppl button.setting-gui{
    background: #BB7;
}
`;
        const attr = ["top", "right", "left", "width"];
        for (const a of attr) {
            this.dom.querySelectorAll(`*[data-pos_${a}]`).forEach((e) => e.style[a] = this.iconSize * Number(e.getAttribute("data-pos_" + a)) + "px");
        }
    }
    increaseBtnSize() {
        if (this.iconSize > 128)
            return;
        this.iconSize *= 1.25;
        this.iconSize = Math.round(this.iconSize);
        this.setStyle();
    }
    decreaseBtnSize() {
        if (this.iconSize < 24)
            return;
        this.iconSize /= 1.25;
        this.iconSize = Math.round(this.iconSize);
        this.setStyle();
    }
    openKeybindMgr() {
        this.keybindingMgr.open();
    }
}

export { SettingGUI };
//# sourceMappingURL=gui.js.map
