import { BaseWindow } from './basewindow.js';

class PreferenceUI extends BaseWindow {
    lang = "en";
    settings;
    constructor(settings) {
        super();
        this.settings = settings;
        const styleDom = document.createElement("style");
        styleDom.textContent = `
.pref-row{
    display:flex;
    justify-content:space-between;
    align-items:center;
    margin:10px 0;
}

.pref-row select{
    background:#444;
    color:#fff;
    border:1px solid #666;
    padding:4px 8px;
    border-radius:4px;
}`;
        document.head.appendChild(styleDom);
    }
    items = [
        {
            key: "stereo",
            title: { zh: "裸眼3D模式", en: "Stereo Mode" },
            default: "cross",
            options: [
                { value: "remember", label: { zh: "保持当前配置", en: "Remember Current Settings" } },
                { value: "off", label: { zh: "关闭", en: "Off" } },
                { value: "cross", label: { zh: "交叉眼", en: "Cross Eye" } },
                { value: "parallel", label: { zh: "平行眼", en: "Parallel Eye" } }
            ]
        },
        {
            key: "sectionConfig",
            title: { zh: "默认视图配置", en: "Default View Settings" },
            default: "retina+sections",
            options: [
                { value: "remember", label: { zh: "保持当前配置", en: "Remember Current Settings" } },
                { value: "retina+sections", label: { zh: "体素+截面", en: "Voxel + Sections" } },
                { value: "retina+bigsections", label: { zh: "体素+大截面", en: "Voxel + Big Sections" } },
                { value: "retina", label: { zh: "仅体素", en: "Voxel Only" } },
                { value: "sections", label: { zh: "截面模式", en: "Sections Mode" } },
                { value: "zsection", label: { zh: "Z截面", en: "Z Section" } },
                { value: "ysection", label: { zh: "Y截面", en: "Y Section" } },
                { value: "retina+zslices", label: { zh: "体素+Z切片", en: "Voxel + Z Slices" } },
                { value: "retina+yslices", label: { zh: "体素+Y切片", en: "Voxel + Y Slices" } }
            ]
        },
        {
            key: "renderQuality",
            title: { zh: "体素渲染品质", en: "Voxel Render Quality" },
            default: "medium",
            options: [
                { value: "remember", label: { zh: "保持当前配置", en: "Remember Current Settings" } },
                { value: "low", label: { zh: "低", en: "Low" } },
                { value: "medium", label: { zh: "中", en: "Medium" } },
                { value: "high", label: { zh: "高", en: "High" } }
            ]
        },
        {
            key: "shortcut",
            title: { zh: "快捷键设置", en: "Remember Keybindings" },
            default: "remember",
            options: [
                { value: "remember", label: { zh: "记住当前配置", en: "Remember Current Settings" } },
                { value: "default", label: { zh: "默认", en: "Default" } },
                { value: "4dViewer", label: { zh: "4dViewer", en: "4dViewer" } },
                { value: "4dtoys", label: { zh: "4dToys", en: "4dToys" } },
                { value: "4dgolf", label: { zh: "4d高尔夫", en: "4dGolf" } },
                { value: "4dminer", label: { zh: "4dMiner", en: "4dMiner" } },
                { value: "tessimal", label: { zh: "Tessimal", en: "Tessimal" } },
            ]
        }
    ];
    render() {
        this.panel.innerHTML = "";
        const title = document.createElement("h2");
        title.textContent = this.lang === "zh" ? "偏好设置" : "Preferences";
        this.panel.appendChild(title);
        for (const item of this.items) {
            const row = document.createElement("div");
            row.className = "pref-row";
            const label = document.createElement("span");
            label.textContent = item.title[this.lang];
            const select = document.createElement("select");
            for (const opt of item.options) {
                const o = document.createElement("option");
                o.value = opt.value;
                o.textContent = opt.label[this.lang];
                select.appendChild(o);
            }
            // 当前值
            const current = this.settings.data.preference[item.key] ?? item.default;
            select.value = current;
            select.onchange = () => {
                this.settings.data.preference[item.key] = select.value;
                this.settings.save();
            };
            row.appendChild(label);
            row.appendChild(select);
            this.panel.appendChild(row);
        }
    }
}

export { PreferenceUI };
//# sourceMappingURL=preference.js.map
