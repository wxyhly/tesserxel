import { BaseWindow } from './basewindow.js';

let injectedStyle = false;
class KeyBindingUI extends BaseWindow {
    data;
    lang;
    waitingAction = null;
    combo = [];
    onchange;
    changed = false;
    storage;
    constructor(storage) {
        super();
        this.injectMyStyle();
        this.data = { root: {}, presets: {}, keyIndex: {} };
        this.storage = storage;
        window.addEventListener("keydown", this.onKeyDown);
        window.addEventListener("keyup", this.onKeyUp);
    }
    injectMyStyle() {
        if (injectedStyle)
            return;
        injectedStyle = true;
        const style = document.createElement("style");
        style.textContent = `
// .keybind-overlay{
//     position:fixed;
//     inset:0;
//     background:rgba(0,0,0,0.5);
//     z-index:999999;
//     display:flex;
//     align-items:center;
//     justify-content:center;
// }

// .keybind-ui{
//     font-family:sans-serif;
//     background:#222;
//     color:#eee;
//     padding:16px;
//     width:360px;
//     border:1px solid #666;
//     border-radius:6px;
//     box-shadow:0 0 20px rgba(0,0,0,0.6);
// }

.keybind-row{
    display:flex;
    justify-content:space-between;
    align-items:center;
    margin:6px 0;
}
.keybind-rows{
    max-height: 60vh;
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 4px;
}
.keybind-group-header{
    font-weight:bold;
    cursor:pointer;
    margin:8px 0 4px 0;
    user-select:none;
}

.keybind-group-header:hover{
    color:#fff;
}
.keybind-group-header::before{
    content:"▾";
    margin-right:6px;
}

.keybind-group-header.collapsed::before{
    content:"▸";
}
.keybind-group-body{
    overflow:hidden;
    max-height:5000px;
    transition:max-height 0.25s ease;
}

.keybind-group-body.collapsed{
    max-height:0;
}
.keybind-btn{
    background:#444;
    color:#fff;
    border:1px solid #666;
    padding:4px 8px;
    cursor:pointer;
    border-radius:4px;
    min-width:120px;
    text-align:center;
}

.keybind-btn:hover{
    background:#555;
}
.keybind-btn.conflict{
    background:#a33;
    border-color:#f66;
    box-shadow:0 0 6px #f44;
}
.keybind-footer hr{
    border: 1px solid #666;
}

.keybind-btn.waiting{
    background:#884;
}`;
        document.head.appendChild(style);
    }
    open() {
        super.open();
        this.changed = false;
    }
    close() {
        this.cancelWaiting();
        super.close();
        if (this.changed)
            this.onchange?.();
    }
    cancelWaiting() {
        this.combo = [];
        if (!this.waitingAction)
            return;
        document.querySelectorAll("button.waiting").forEach(btn => {
            btn.textContent = shortcut2text(this.lang, this.data.keyIndex[this.waitingAction]) || tr[this.lang]["disabled"];
            btn.classList.remove("waiting");
            this.waitingAction = null;
        });
        this.waitingAction = null;
    }
    render() {
        this.panel.innerHTML = "";
        const rows = document.createElement("div");
        rows.className = "keybind-rows";
        this.panel.appendChild(rows);
        const renderGroup = (group, path, dom, depth) => {
            let body = dom;
            if (path) {
                const header = document.createElement("div");
                header.className = "keybind-group-header";
                header.style.paddingLeft = (depth * 16) + "px";
                body = document.createElement("div");
                body.className = "keybind-group-body";
                header.textContent = group.title?.[this.lang] ?? path;
                header.onclick = () => {
                    header.classList.toggle("collapsed");
                    body.classList.toggle("collapsed");
                };
                dom.appendChild(header);
                header.click();
                dom.appendChild(body);
            }
            if (group.actions) {
                for (const name in group.actions) {
                    const action = group.actions[name];
                    const actionPath = path ? path + "." + name : name;
                    const row = document.createElement("div");
                    row.className = "keybind-row";
                    row.style.paddingLeft = ((depth + 1) * 16) + "px";
                    const label = document.createElement("span");
                    label.textContent = action.title[this.lang];
                    const btn = document.createElement("button");
                    btn.className = "keybind-btn";
                    btn.setAttribute("data-path", actionPath.replaceAll(".", "_").replaceAll("+", "_add_"));
                    btn.textContent = shortcut2text(this.lang, action.key) || tr[this.lang]["disabled"];
                    if (actionPath === this.waitingAction)
                        btn.classList.add("waiting");
                    btn.onclick = () => {
                        if (this.waitingAction) {
                            this.cancelWaiting();
                            return;
                        }
                        this.waitingAction = actionPath;
                        btn.classList.add("waiting");
                        btn.textContent = tr[this.lang]["waiting"];
                    };
                    row.appendChild(label);
                    row.appendChild(btn);
                    body.appendChild(row);
                }
            }
            if (group.groups) {
                for (const g in group.groups) {
                    const childPath = path ? path + "." + g : g;
                    renderGroup(group.groups[g], childPath, body, depth + 1);
                }
            }
        };
        renderGroup(this.data.root, "", rows, 0);
        this.renderFooter();
    }
    renderFooter() {
        const footer = document.createElement("div");
        footer.className = "keybind-footer";
        // export
        const exportBtn = document.createElement("button");
        exportBtn.textContent = { zh: "导出配置", en: "Export Config" }[this.lang];
        exportBtn.className = "keybind-btn";
        const importBtn = document.createElement("button");
        importBtn.textContent = { zh: "导入配置", en: "Import Config" }[this.lang];
        importBtn.className = "keybind-btn";
        exportBtn.onclick = () => {
            const json = JSON.stringify(this.storage.data);
            prompt({ zh: "复制JSON配置代码", en: "Copy JSON Config Code" }[this.lang], json);
        };
        importBtn.onclick = () => {
            const text = prompt({ zh: "粘贴JSON配置代码", en: "Paste JSON Config Code" }[this.lang]);
            if (!text)
                return;
            try {
                const obj = JSON.parse(text);
                this.storage.data = this.storage.migrate(obj);
                this.storage.save();
                alert({ zh: "导入成功，需要重新加载页面生效", en: "Import successful, please reload the page to take effect" }[this.lang]);
            }
            catch (e) {
                alert({ zh: "格式错误", en: "Invalid Format" }[this.lang] + ":\n" + e);
            }
        };
        footer.appendChild(document.createElement("hr"));
        footer.appendChild(exportBtn);
        footer.appendChild(importBtn);
        this.panel.appendChild(footer);
    }
    onKeyDown = (e) => {
        if (!this.waitingAction) {
            this.combo = [];
            if (e.code === "Escape") {
                this.close();
            }
            return;
        }
        e.preventDefault();
        if (!this.combo.includes(e.code))
            this.combo.push(e.code);
        const keyString = this.combo.join("+");
        const btn = this.panel.querySelector(`button[data-path=${this.waitingAction.replaceAll(".", "_").replaceAll("+", "_add_")}]`);
        if (!btn)
            return;
        if (e.code === "Escape") {
            this.combo = [];
            btn.classList.remove("waiting");
            this.updateActionKey(this.waitingAction, undefined, "");
            this.waitingAction = null;
            btn.textContent = tr[this.lang]["disabled"];
        }
        else {
            this.updateActionKey(this.waitingAction, undefined, keyString);
            btn.textContent = shortcut2text(this.lang, keyString);
        }
        return;
    };
    onKeyUp = (e) => {
        this.combo = [];
        if (!this.waitingAction)
            return;
        const btn = this.panel.querySelector(`button[data-path=${this.waitingAction.replaceAll(".", "_").replaceAll("+", "_add_")}]`);
        if (!btn)
            return;
        btn.classList.remove("waiting");
        this.updateActionKey(this.waitingAction);
        this.waitingAction = null;
        if (this.changed) {
            this.changed = false;
            this.onchange();
        }
        return;
    };
    findAction(path) {
        const parts = path.split(".");
        let group = this.data.root;
        for (let i = 0; i < parts.length - 1; i++) {
            group = group.groups?.[parts[i]];
            if (!group)
                return null;
        }
        return group.actions?.[parts[parts.length - 1]] ?? null;
    }
    addGroup(name, v) {
        this.data.root.groups ??= {};
        this.data.root.groups[name] = v;
        const walk = (group, path) => {
            if (group.actions) {
                for (const actionName in group.actions) {
                    const actionPath = path + "." + actionName;
                    const action = group.actions[actionName];
                    if (this.storage.data.keybindings[actionPath]) {
                        action.key = this.storage.data.keybindings[actionPath].replaceAll(".", "");
                    }
                    this.updateActionKey(actionPath, action);
                }
            }
            if (group.groups) {
                for (const g in group.groups) {
                    walk(group.groups[g], path + "." + g);
                }
            }
        };
        walk(v, name);
    }
    updateActionKey(path, action = this.findAction(path), value = action.key) {
        action.key = value;
        const keys = action.key.split("|").map(key => {
            if (!action.press)
                return key;
            const parts = key.split("+");
            const last = parts.pop();
            return parts.length ? parts.join("+") + "+." + last : "." + last;
        });
        const k = this.data.keyIndex[path];
        this.data.keyIndex[path] = keys.join("|");
        if (k !== this.data.keyIndex[path]) {
            this.changed = true;
        }
    }
}
const tr = {
    zh: {
        "AudioVolumeDown": "音量减",
        "AudioVolumeUp": "音量增",
        "AudioVolumeMute": "静音",
        "ArrowLeft": "左箭头",
        "ArrowRight": "右箭头",
        "ArrowUp": "上箭头",
        "ArrowDown": "下箭头",
        "BracketLeft": "[",
        "BracketRight": "]",
        "Semicolon": ";",
        "Numpad": "小键盘",
        "Multiply": "*",
        "Add": "加号",
        "Subtract": "-",
        "Decimal": ".",
        "Divide": "/",
        "Quote": "'",
        "Comma": ",",
        "Period": ".",
        "Left": "左",
        "Right": "右",
        "Space": "空格",
        "Digit": "大键盘",
        "Backquote": "反引号`",
        "Minus": "-",
        "Equal": "=",
        "Backspace": "退格",
        "Enter": "回车",
        "Backslash": "\\",
        "Slash": "/",
        "waiting": "等待按键...",
        "|": "或",
        "disabled": "<未配置>"
    },
    en: {
        "waiting": "Press Key...",
        "|": " or ",
        "disabled": "<None>"
    }
};
function shortcut2text(lang, s) {
    if (!s)
        return "";
    const tr1 = tr[lang];
    s = s.replaceAll("Control", "Ctrl").replaceAll("Key", "").replaceAll(".", "");
    for (const [k, v] of Object.entries(tr1)) {
        s = s.replaceAll(k, v);
    }
    return s;
}

export { KeyBindingUI, shortcut2text };
//# sourceMappingURL=keybind.js.map
