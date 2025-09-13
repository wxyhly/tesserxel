type LanguageLabel = { zh: string; en: string };
type ExampleCode = { "html": LanguageLabel; "js": LanguageLabel };
type AsyncExampleCode = () => Promise<ExampleCode>;
type ExampleItem = { type: "item"; label: LanguageLabel; example: AsyncExampleCode };
type ExampleSubmenu = { type: "submenu"; label: LanguageLabel; children: Array<ExampleItem> };
type Example = ExampleItem | ExampleSubmenu;
// const defaultHTML = { zh: '<canvas></canvas>', en: '<canvas></canvas>' };
const hello100: AsyncExampleCode = async () => (await import("./hello.js")).hello100;
const hello101: AsyncExampleCode = async () => (await import("./hello.js")).hello101;
const hello102: AsyncExampleCode = async () => (await import("./hello2.js")).hello102;
const hello103: AsyncExampleCode = async () => (await import("./hello2.js")).hello103;
const hello104: AsyncExampleCode = async () => (await import("./hello2.js")).hello104;
const hello201: AsyncExampleCode = async () => (await import("./hello20.js")).hello201;
const hello202: AsyncExampleCode = async () => (await import("./hello20.js")).hello202;
const hello203: AsyncExampleCode = async () => (await import("./hello20.js")).hello203;
const mat101: AsyncExampleCode = async () => (await import("./mat.js")).mat101;
const mat102: AsyncExampleCode = async () => (await import("./dice.js")).mat102;
const phy101: AsyncExampleCode = async () => (await import("./phy.js")).phy101;




const vecmath: ExampleCode = {
    html: { zh: "", en: "" },
    js: {
        zh: `import {Vec4, Bivec} from "tesserxel/math"

const a = new Vec4(1,2,3,4);
const b = new Vec4(5,6,7,8);
a.w -= 4;
console.log("a",a);
// 平面 ex∧ey
const plane1 = Bivec.xy;
console.log("plane1",plane1);
// 平面 ex∧ez
const plane2 = Vec4.x.wedge(Vec4.z);
console.log("plane2",plane2);
// 计算两平面的两个夹角
console.log("angle",Bivec.angle(plane1,plane2));
`,
        en: `import * as tesserxel from "tesserxel"`
    }
}

const examples: Array<Example> = [
    {
        type: "submenu",
        label: { zh: "你好超立方体", en: "Hello Hypercube" },
        children: [
            { type: "item", label: { zh: "ESM格式", en: "ESM Format" }, example: hello100 },
            { type: "item", label: { zh: "UMD格式", en: "UMD Format" }, example: hello101 },
            { type: "item", label: { zh: "超立方体", en: "Hypercube" }, example: hello102 },
            { type: "item", label: { zh: "更改光照", en: "Lighting" }, example: hello103 },
            { type: "item", label: { zh: "高光双圆环", en: "Specular Tiger" }, example: hello104 },
        ],
    },
    {
        type: "submenu",
        label: { zh: "更多场景渲染设置", en: "More About Scene/Render" },
        children: [
            { type: "item", label: { zh: "材质与灯光", en: "Materials & Lights" }, example: mat101 },
            { type: "item", label: { zh: "骰子绘制与控制", en: "Dice Drawing & Ctrl" }, example: mat102 },
        ],
    },
    {
        type: "submenu",
        label: { zh: "物理引擎简介", en: "Physics Engine Intro" },
        children: [
            { type: "item", label: { zh: "扔箱子", en: "Drop Box" }, example: phy101 },
        ],
    },
    {
        type: "submenu",
        label: { zh: "你好四面体", en: "Hello Tetrahedron" },
        children: [
            { type: "item", label: { zh: "第一个四面体", en: "First Tetrahedron" }, example: hello201 },
            { type: "item", label: { zh: "添加顶点颜色", en: "Add Vertex Color" }, example: hello202 },
            { type: "item", label: { zh: "四面体转起来！", en: "Rotate Tetrahedron!" }, example: hello203 },
        ],
    },
];
export default examples;