const defaultHTML = { zh: '<canvas></canvas>', en: '<canvas></canvas>' };
const hello102 = {
    html: defaultHTML,
    js: {
        zh: `import * as tesserxel from "tesserxel"
// 引入Tesserxel库中的four模块
const FOUR = tesserxel.four;
// 获取网页中的canvas dom对象
const canvas = document.querySelector("canvas");
// 在该画布上创建渲染应用。这里调用异步函数等待渲染器完成资源的初始化
const app = await FOUR.App.create({ canvas });
// 默认的四维场景背景色为黑色(0.0, 0.0, 0.0)，这里我们改成白色
// 第四个alpha值用于控制体素的不透明度，1.0为最不透明，该值不影响截面视图
app.scene.setBackgroundColor({ r: 1.0, g: 1.0, b: 1.0, a: 1.0 });
// 定义一个超立方体的几何数据
let cubeGeometry = new FOUR.TesseractGeometry();
// 定义超立方体的材质，这里的BasicMaterial表示是纯色材质。我们设置为纯红色
let material = new FOUR.BasicMaterial({ r: 1.0, g: 0.0, b: 0.0, a: 1.0 });
// 定义一个超立方体网格，使用刚才的几何数据和材质
let mesh = new FOUR.Mesh(cubeGeometry, material);
// 待会我们后让超立方体旋转起来，因此我们设置每次都要更新它的坐标，默认不会更新
mesh.alwaysUpdateCoord = true;
// 将超立方体加入场景中
app.scene.add(mesh);
// 默认所有对象都位于坐标原点。因此要将相机向后移动一点点以便看到位于原点的超立方体
// 注：w轴指向相机背后(跟三维图形学中的z轴类似)
app.camera.position.w = 3.0;
// 默认所有体素立方体的控制操作都需要按住Alt键来激活
//我们可以手动将键位配置为空来取消激活步骤
app.retinaController.keyConfig.enable = "";
// 开始执行帧循环
app.run(()=>{
    // 每一帧我们在xw、yz两方向上各旋转0.01弧度，得到等角双旋转
    mesh.rotates(tesserxel.math.Bivec.xw.mulf(0.01).exp());
    mesh.rotates(tesserxel.math.Bivec.yz.mulf(0.01).exp());
});`, en: `import * as tesserxel from "tesserxel" 
// Import the "four" module from the Tesserxel library
const FOUR = tesserxel.four;
// Get the canvas DOM element from the webpage
const canvas = document.querySelector("canvas");
// Create a rendering application on this canvas.
// Here we call the async function to wait for the renderer to finish resource initialization
const app = await FOUR.App.create({ canvas });
// The default background color of a 4D scene is black (0.0, 0.0, 0.0).
// Here we change it to white.
// The fourth alpha value controls the opacity of voxels. 1.0 means fully opaque.
// This value does not affect the cross-sectional view.
app.scene.setBackgroundColor({ r: 1.0, g: 1.0, b: 1.0, a: 1.0 });
// Define the geometry data of a tesseract (hypercube)
let cubeGeometry = new FOUR.TesseractGeometry();
// Define the material of the tesseract.
// BasicMaterial means a pure color material. We set it to pure red.
let material = new FOUR.BasicMaterial({ r: 1.0, g: 0.0, b: 0.0, a: 1.0 });
// Define a tesseract mesh using the geometry data and material
let mesh = new FOUR.Mesh(cubeGeometry, material);
// Later we will make the tesseract rotate, so we set it to update
// its coordinates each frame. By default it will not update.
mesh.alwaysUpdateCoord = true;
// Add the tesseract into the scene
app.scene.add(mesh);
// By default all objects are at the coordinate origin.
// So we need to move the camera backward a little bit to see the tesseract at the origin.
// Note: The w-axis points behind the camera (similar to the z-axis in 3D graphics)
app.camera.position.w = 3.0;
// By default, all voxel cube controls require holding down the Alt key to activate.
// We can manually set the key configuration to empty to remove this requirement.
app.retinaController.keyConfig.enable = "";
// Start the frame loop
app.run(()=>{
    // Each frame, rotate 0.01 radians in both the xw and yz planes
    // to get an isoclinic double rotation
    mesh.rotates(tesserxel.math.Bivec.xw.mulf(0.01).exp());
    mesh.rotates(tesserxel.math.Bivec.yz.mulf(0.01).exp());
});
` },
};

const hello103 = {
    html: defaultHTML,
    js: {
        zh: hello102.js.zh.replace(
            "BasicMaterial表示是纯色材质", "LambertMaterial表示是漫反射材质"
        ).replace(
            ".BasicMaterial({ r: 1.0, g: 0.0, b: 0.0, a: 1.0 });", `.LambertMaterial([1, 0, 0]);
const dirLight = new FOUR.DirectionalLight(
    // 用r/g/b表示的光源强度，其值可以超过1
    [0.9, 0.8, 0.8], 
    // 指定平行光的来光方向，需用norms函数将其单位化
    new tesserxel.math.Vec4(-1, 1, 0, 1).norms() 
);
// 别忘了把灯光加入场景
app.scene.add(dirLight);
// 再补个环境光，免得背光面太黑
app.scene.add(new FOUR.AmbientLight(0.3));`), en: hello102.js.en.replace(
                "BasicMaterial means a pure color material", "LambertMaterial means a diffusive material"
            ).replace(
                ".BasicMaterial({ r: 1.0, g: 0.0, b: 0.0, a: 1.0 });", `.LambertMaterial([1, 0, 0]);
const dirLight = new FOUR.DirectionalLight(
    // Light intensity by r/g/b values; the values can exceed 1
    [0.9, 0.8, 0.8],
    // Specify the direction of the parallel light
    // use the norms function to normalize it
    new tesserxel.math.Vec4(-1, 1, 0, 1).norms()
);
// Don't forget to add the light to the scene
app.scene.add(dirLight);
// Add an ambient light to avoid the backlit side being too dark.
app.scene.add(new FOUR.AmbientLight(0.3));`)
    }
};
const hello104 = {
    html: defaultHTML,
    js: {
        zh: hello102.js.zh.replace(/默认的四维场景背景[\s\S]+setBackgroundColor.+a: 1\.0 \}\);/, "这里删掉了背景颜色设置，恢复至默认的黑色").replace(
            "定义一个超立方体的几何数据", "定义一个双圆环的几何数据"
        ).replace("TesseractGeometry", "TigerGeometry"
        ).replaceAll("cubeGeometry", "tigerGeometry"
        ).replace(
            "BasicMaterial表示是纯色材质", "PhongMaterial表示光滑材质，有颜色、高光度、高光颜色三个参数，后面两个参数都是可选的，默认值分别为20和白色"
        ).replace(
            ".BasicMaterial({ r: 1.0, g: 0.0, b: 0.0, a: 1.0 });", `.PhongMaterial([1, 0, 0], 10);
// 点光源只有光源强度这个参数
const pLight = new FOUR.PointLight([0.9, 0.8, 0.8]);
// 其位置默认位于原点，可通过所有修改其位置的方法来改变位置
pLight.position.w = 2;
// 别忘了把灯光加入场景
app.scene.add(pLight);`), en: hello102.js.en.replace(/The default background color[\s\S]+setBackgroundColor.+a: 1\.0 \}\);/, "Here we removed the background color setting, got default black color").replace(
                "Define the geometry data of a tesseract (hypercube)", "Define the geometry data of a tiger (duotorus)"
            ).replace("TesseractGeometry", "TigerGeometry"
            ).replaceAll("cubeGeometry", "tigerGeometry"
            ).replace(
                "BasicMaterial means a pure color material", `PhongMaterial represents a smooth material, 
// It has three parameters: color, shininess, and specular color.
// The last two are optional, with default values of 20 and white, respectively.
// `
            ).replace(
                ".BasicMaterial({ r: 1.0, g: 0.0, b: 0.0, a: 1.0 });", `.PhongMaterial([1, 0, 0], 10);
// A point light only has the light intensity parameter
const pLight = new FOUR.PointLight([0.9, 0.8, 0.8]);
// Its position is at the origin by default; you can change it using any method that modifies position
pLight.position.w = 2;
// Don't forget to add the light to the scene
app.scene.add(pLight);`)
    }
};
export { hello102, hello103, hello104 };