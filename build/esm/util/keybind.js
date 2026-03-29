import { BaseWindow } from './basewindow.js';

let injectedStyle = false;
// export class KeyBindingUI {
//     data: KeyBindingConfig;
//     isOpen = false;
//     lang: "zh" | "en";
//     private overlay: HTMLDivElement;
//     private panel: HTMLDivElement;
//     private waitingAction: string | null = null;
//     onchange: () => void;
//     private changed = false;
//     constructor() {
//         this.data = { root: {}, presets: {}, keyIndex: {} };
//         this.overlay = document.createElement("div");
//         this.overlay.className = "keybind-overlay";
//         this.overlay.style.display = "none";
//         this.panel = document.createElement("div");
//         this.panel.className = "keybind-ui";
//         this.overlay.appendChild(this.panel);
//         document.body.appendChild(this.overlay);
//         this.injectStyle();
//         this.overlay.addEventListener("mousedown", (e) => {
//             if (e.target === this.overlay) {
//                 this.close();
//             }
//         });
//         window.addEventListener("keydown", this.onKeyDown);
//         window.addEventListener("keyup", this.onKeyUp);
//     }
//     close() {
//         this.cancelWaiting();
//         this.isOpen = false;
//         this.overlay.style.display = "none";
//         if (this.changed) this.onchange();
//     }
//     open() {
//         this.isOpen = true;
//         this.overlay.style.display = "";
//         this.changed = false;
//     }
//     private cancelWaiting() {
//         this.combo = [];
//         if (!this.waitingAction) return;
//         document.querySelectorAll("button.waiting").forEach(btn => {
//             btn.textContent = this.shortcut2text(this.data.keyIndex[this.waitingAction]) || this.tr[this.lang]["disabled"];
//             btn.classList.remove("waiting");
//             this.waitingAction = null;
//         });
//         this.waitingAction = null;
//     }
//     render() {
//         this.panel.className = "keybind-ui";
//         this.panel.innerHTML = "";
//         const rows = document.createElement("div");
//         rows.className = "keybind-rows";
//         this.panel.appendChild(rows);
//         // 渲染
//         const renderGroup = (group: KeyBindingGroup, path: string, dom: HTMLDivElement, depth: number) => {
//             let body = dom;
//             if (path) {
//                 const header = document.createElement("div");
//                 header.className = "keybind-group-header";
//                 header.style.paddingLeft = (depth * 16) + "px";
//                 body = document.createElement("div");
//                 body.className = "keybind-group-body";
//                 header.textContent = group.title?.[this.lang] ?? path;
//                 header.onclick = () => {
//                     header.classList.toggle("collapsed");
//                     body.classList.toggle("collapsed");
//                 };
//                 dom.appendChild(header);
//                 dom.appendChild(body);
//             }
//             if (group.actions) {
//                 for (const name in group.actions) {
//                     const action = group.actions[name];
//                     const actionPath = path ? path + "." + name : name;
//                     const row = document.createElement("div");
//                     row.className = "keybind-row";
//                     row.style.paddingLeft = ((depth + 1) * 16) + "px";
//                     const label = document.createElement("span");
//                     label.textContent = action.title[this.lang];
//                     const btn = document.createElement("button");
//                     btn.className = "keybind-btn";
//                     btn.setAttribute("data-path", actionPath.replaceAll(".", "_").replaceAll("+", "_add_"));
//                     btn.textContent = this.shortcut2text(action.key) || this.tr[this.lang]["disabled"];
//                     if (actionPath === this.waitingAction) btn.classList.add("waiting");
//                     btn.onclick = () => {
//                         if (this.waitingAction) {
//                             this.cancelWaiting();
//                             return;
//                         }
//                         this.waitingAction = actionPath;
//                         btn.classList.add("waiting");
//                         btn.textContent = this.tr[this.lang]["waiting"];
//                     };
//                     row.appendChild(label);
//                     row.appendChild(btn);
//                     body.appendChild(row);
//                 }
//             }
//             if (group.groups) {
//                 for (const g in group.groups) {
//                     const childPath = path ? path + "." + g : g;
//                     renderGroup(group.groups[g], childPath, body, depth + 1);
//                 }
//             }
//         };
//         renderGroup(this.data.root, "", rows, 0);
//         this.renderFooter();
//     }
//     private renderFooter() {
//         const footer = document.createElement("div");
//         footer.className = "keybind-footer";
//         // preset selector
//         if (Object.keys(this.data.presets).length > 0) {
//             const select = document.createElement("select");
//             select.className = "keybind-preset";
//             const defaultOpt = document.createElement("option");
//             defaultOpt.textContent = "Load preset...";
//             defaultOpt.value = "";
//             select.appendChild(defaultOpt);
//             for (const name in this.data.presets) {
//                 const opt = document.createElement("option");
//                 opt.value = name;
//                 opt.textContent = name;
//                 select.appendChild(opt);
//             }
//             select.onchange = () => {
//                 const preset = this.data.presets[select.value];
//                 if (!preset) return;
//                 // this.bindings = { ...preset };
//                 this.render();
//             };
//             footer.appendChild(select);
//         }
//         // export
//         const exportBtn = document.createElement("button");
//         exportBtn.textContent = "Export JSON";
//         exportBtn.className = "keybind-btn";
//         const importBtn = document.createElement("button");
//         importBtn.textContent = "Import JSON";
//         importBtn.className = "keybind-btn";
//         exportBtn.onclick = () => {
//             // const json = JSON.stringify(this.bindings, null, 2);
//             // prompt("Copy keybindings JSON:", json);
//         };
//         importBtn.onclick = () => {
//             const text = prompt("Paste keybindings JSON:");
//             if (!text) return;
//             try {
//                 // const obj = JSON.parse(text);
//                 // this.bindings = obj;
//                 // this.render();
//             } catch {
//                 alert("Invalid JSON");
//             }
//         };
//         footer.appendChild(exportBtn);
//         footer.appendChild(importBtn);
//         this.panel.appendChild(footer);
//     }
//     private combo: string[] = [];
//     private onKeyDown = (e: KeyboardEvent) => {
//         if (!this.waitingAction) {
//             this.combo = [];
//             if (e.code === "Escape") { this.close(); }
//             return;
//         }
//         e.preventDefault();
//         if (!this.combo.includes(e.code)) this.combo.push(e.code);
//         const keyString = this.combo.join("+");
//         const btn = this.panel.querySelector(`button[data-path=${this.waitingAction.replaceAll(".", "_").replaceAll("+", "_add_")}]`);
//         if (!btn) return;
//         if (e.code === "Escape") {
//             this.combo = [];
//             btn.classList.remove("waiting");
//             this.updateActionKey(this.waitingAction, undefined, "");
//             this.waitingAction = null;
//             btn.textContent = this.tr[this.lang]["disabled"];
//         } else {
//             this.updateActionKey(this.waitingAction, undefined, keyString);
//             btn.textContent = this.shortcut2text(keyString);
//         }
//     };
//     private onKeyUp = (e: KeyboardEvent) => {
//         this.combo = [];
//         if (!this.waitingAction) return;
//         const btn = this.panel.querySelector(`button[data-path=${this.waitingAction.replaceAll(".", "_").replaceAll("+", "_add_")}]`);
//         if (!btn) return;
//         btn.classList.remove("waiting");
//         this.changed = true;
//         this.updateActionKey(this.waitingAction);
//         this.waitingAction = null;
//     }
//     private findAction(path: string): KeyBindingAction | null {
//         const parts = path.split(".");
//         let group: KeyBindingGroup = this.data.root;
//         for (let i = 0; i < parts.length - 1; i++) {
//             group = group.groups?.[parts[i]];
//             if (!group) return null;
//         }
//         return group.actions?.[parts[parts.length - 1]] ?? null;
//     }
//     private tr = {
//         zh: {
//             "ArrowLeft": "左箭头",
//             "ArrowRight": "右箭头",
//             "ArrowUp": "上箭头",
//             "ArrowDown": "下箭头",
//             "Left": "左",
//             "Right": "右",
//             "Space": "空格",
//             "Digit": "大键盘",
//             "waiting": "等待按键...",
//             "|": "或",
//             "disabled": "<未配置>"
//         },
//         en: {
//             "Digit": "Digit ",
//             "waiting": "Press Key...",
//             "|": " or ",
//             "disabled": "<None>"
//         }
//     }
//     shortcut2text(s: string) {
//         if (!s) return "";
//         const tr = this.tr[this.lang];
//         s = s.replaceAll("Control", "Ctrl").replaceAll("Key", "").replaceAll(".", "");
//         for (const [k, v] of Object.entries(tr)) {
//             s = s.replaceAll(k, v);
//         }
//         return s;
//     }
//     addGroup(name: string, v: KeyBindingGroup) {
//         this.data.root.groups ??= {}
//         this.data.root.groups[name] = v
//         const walk = (group: KeyBindingGroup, path: string) => {
//             if (group.actions) {
//                 for (const actionName in group.actions) {
//                     const actionPath = path + "." + actionName;
//                     const action = group.actions[actionName];
//                     this.updateActionKey(actionPath, action);
//                 }
//             }
//             if (group.groups) {
//                 for (const g in group.groups) {
//                     walk(group.groups[g], path + "." + g);
//                 }
//             }
//         }
//         walk(v, name);
//     }
//     private updateActionKey(path: string, action: KeyBindingAction = this.findAction(path), value: string = action.key) {
//         action.key = value;
//         const keys = action.key.split("|").map(key => {
//             if (!action.press) return key;
//             const parts = key.split("+");
//             const last = parts.pop();
//             return parts.length ? parts.join("+") + "+." + last : "." + last;
//         })
//         this.data.keyIndex[path] = keys.join("|");
//     }
// }
class KeyBindingUI extends BaseWindow {
    data;
    lang;
    waitingAction = null;
    combo = [];
    onchange;
    changed = false;
    constructor() {
        super();
        this.injectMyStyle();
        this.data = { root: {}, presets: {}, keyIndex: {} };
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
            btn.textContent = this.shortcut2text(this.data.keyIndex[this.waitingAction]) || this.tr[this.lang]["disabled"];
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
        // 渲染
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
                    btn.textContent = this.shortcut2text(action.key) || this.tr[this.lang]["disabled"];
                    if (actionPath === this.waitingAction)
                        btn.classList.add("waiting");
                    btn.onclick = () => {
                        if (this.waitingAction) {
                            this.cancelWaiting();
                            return;
                        }
                        this.waitingAction = actionPath;
                        btn.classList.add("waiting");
                        btn.textContent = this.tr[this.lang]["waiting"];
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
        // preset selector
        if (Object.keys(this.data.presets).length > 0) {
            const select = document.createElement("select");
            select.className = "keybind-preset";
            const defaultOpt = document.createElement("option");
            defaultOpt.textContent = "Load preset...";
            defaultOpt.value = "";
            select.appendChild(defaultOpt);
            for (const name in this.data.presets) {
                const opt = document.createElement("option");
                opt.value = name;
                opt.textContent = name;
                select.appendChild(opt);
            }
            select.onchange = () => {
                const preset = this.data.presets[select.value];
                if (!preset)
                    return;
                // this.bindings = { ...preset };
                this.render();
            };
            footer.appendChild(select);
        }
        // export
        const exportBtn = document.createElement("button");
        exportBtn.textContent = "Export JSON";
        exportBtn.className = "keybind-btn";
        const importBtn = document.createElement("button");
        importBtn.textContent = "Import JSON";
        importBtn.className = "keybind-btn";
        exportBtn.onclick = () => {
            // const json = JSON.stringify(this.bindings, null, 2);
            // prompt("Copy keybindings JSON:", json);
        };
        importBtn.onclick = () => {
            const text = prompt("Paste keybindings JSON:");
            if (!text)
                return;
        };
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
            btn.textContent = this.tr[this.lang]["disabled"];
        }
        else {
            this.updateActionKey(this.waitingAction, undefined, keyString);
            btn.textContent = this.shortcut2text(keyString);
        }
    };
    onKeyUp = (e) => {
        this.combo = [];
        if (!this.waitingAction)
            return;
        const btn = this.panel.querySelector(`button[data-path=${this.waitingAction.replaceAll(".", "_").replaceAll("+", "_add_")}]`);
        if (!btn)
            return;
        btn.classList.remove("waiting");
        this.changed = true;
        this.updateActionKey(this.waitingAction);
        this.waitingAction = null;
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
    tr = {
        zh: {
            "ArrowLeft": "左箭头",
            "ArrowRight": "右箭头",
            "ArrowUp": "上箭头",
            "ArrowDown": "下箭头",
            "Left": "左",
            "Right": "右",
            "Space": "空格",
            "Digit": "大键盘",
            "waiting": "等待按键...",
            "|": "或",
            "disabled": "<未配置>"
        },
        en: {
            "Digit": "Digit ",
            "waiting": "Press Key...",
            "|": " or ",
            "disabled": "<None>"
        }
    };
    shortcut2text(s) {
        if (!s)
            return "";
        const tr = this.tr[this.lang];
        s = s.replaceAll("Control", "Ctrl").replaceAll("Key", "").replaceAll(".", "");
        for (const [k, v] of Object.entries(tr)) {
            s = s.replaceAll(k, v);
        }
        return s;
    }
    addGroup(name, v) {
        this.data.root.groups ??= {};
        this.data.root.groups[name] = v;
        const walk = (group, path) => {
            if (group.actions) {
                for (const actionName in group.actions) {
                    const actionPath = path + "." + actionName;
                    const action = group.actions[actionName];
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
        this.data.keyIndex[path] = keys.join("|");
    }
}

export { KeyBindingUI };
//# sourceMappingURL=keybind.js.map
