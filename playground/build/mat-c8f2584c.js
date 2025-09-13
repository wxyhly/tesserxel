const defaultHTML = { zh: '<canvas></canvas>', en: '<canvas></canvas>' };
const mat101_common = `import * as tesserxel from "tesserxel"
const FOUR = tesserxel.four;
const canvas = document.querySelector("canvas");
// 为了能更好控制相机，我们创建App时设置了一个enablePointerLock选项，用于隐藏并锁定鼠标
const app = await FOUR.App.create({ canvas, controllerConfig: { enablePointerLock: true } });
// 超立方体几何数据
const cubeGeometry = new FOUR.TesseractGeometry();
// 超球几何数据
const glomeGeometry = new FOUR.GlomeGeometry();
// 地面几何数据，边长为10.0的三维立方体地面
const floorGeometry = new FOUR.CubeGeometry(10.0);
// 创建一个材质颜色变量
let uniformColor = new FOUR.ColorUniformValue();
// 材质1为有高光的白色
let material1 = new FOUR.PhongMaterial([1.0, 1.0, 1.0]);
// 材质2为有高光的绑定了刚才的颜色变量的可变颜色
let material2 = new FOUR.PhongMaterial(uniformColor);
// 使用两种材质分别创建两个立方体，并分别设置其位置。
let cubeMesh1 = new FOUR.Mesh(cubeGeometry, material1);
cubeMesh1.position.x = -2;
cubeMesh1.position.y = 2;
let cubeMesh2 = new FOUR.Mesh(cubeGeometry, material2);
cubeMesh2.position.x = 2;
cubeMesh2.position.y = 2;
// 地板材质
let floorMaterial = new FOUR.PhongMaterial(
    // 其漫反射颜色使用棋盘格贴图
    new FOUR.CheckerTexture(
        // 前两个参数为白色与黑色，第三个参数为贴图坐标
        [0, 0, 0, 0.2], [1, 1, 1, 1.0], new FOUR.Vec4TransformNode(
            // 输入默认的立方体的贴图坐标，通过Vec4TransformNode节点进行坐标变换
            new FOUR.UVWVec4Input,
            // 坐标变换通过math.Obj4对象表示。前两个参数对应平移和旋转，这里都没有
            // 第三个参数为缩放，我们把所有方向均匀缩放10倍以显示更多的棋盘格子
            new tesserxel.math.Obj4(null, null, new tesserxel.math.Vec4(10, 10, 10, 10))
        )
    )
);
let floorMesh = new FOUR.Mesh(floorGeometry, floorMaterial);
// 超球材质为光泽的蓝色
let glomeMesh = new FOUR.Mesh(glomeGeometry, new FOUR.PhongMaterial(
    [0.2, 0.2, 1], 50
));
// 故意在y轴z轴上都跟那些超立方体都错开，体现四维的空间感
glomeMesh.position.y = 1.0;
glomeMesh.position.z = 1.0;
glomeMesh.position.w = 1.0;
// 加入所有物体
app.scene.add(glomeMesh);
app.scene.add(cubeMesh1);
app.scene.add(cubeMesh2);
app.scene.add(floorMesh);
// 加入各类灯光
app.scene.add(new FOUR.AmbientLight(0.1));
let dirLight = new FOUR.DirectionalLight([0.1, 0.0, 0.0])
app.scene.add(dirLight);
let pointLight = new FOUR.PointLight([5.4, 2.5, 1.7]);
app.scene.add(pointLight);
let pointLight2 = new FOUR.PointLight([1.4, 12.5, 5.7]);
app.scene.add(pointLight2);
let pointLight3 = new FOUR.PointLight([1.4, 1.5, 15.7]);
app.scene.add(pointLight3);
// spotLight是聚光灯，三个参数分别是RGB颜色强度、锥角与边缘硬度
let spotLight = new FOUR.SpotLight([800, 800, 800], 40, 0.2);
app.scene.add(spotLight);
spotLight.position.y = 10;
// 下面的物体都要设置动画效果
// 告诉Tesserxel要每帧更新它们的坐标
dirLight.alwaysUpdateCoord = true;
pointLight.alwaysUpdateCoord = true;
pointLight2.alwaysUpdateCoord = true;
pointLight3.alwaysUpdateCoord = true;
spotLight.alwaysUpdateCoord = true;
// 设置相机位置
app.camera.position.w = 5.0;
app.camera.position.y = 2.0;
// 添加一个“保持竖直”模式的相机控制器
app.controllerRegistry.add(new tesserxel.util.ctrl.KeepUpController(app.camera));
// 生成动画的随机种子
let t = Math.random() * 12345678;
// app.run 中的参数是个回调函数，它将在每帧渲染时执行。我们在这里实现动画效果
app.run(() => {
    // 将带参数t的向量单位化后，复制给聚光灯的方向向量
    spotLight.direction.copy(
        new tesserxel.math.Vec4(Math.sin(t * 3), Math.cos(t * 3), Math.sin(t * 1.732), Math.cos(t * 1.732)).adds(tesserxel.math.Vec4.y.mulf(6)).norms()
    );
    // 通过set函数把位置坐标设为三角函数后，再使用mulfs函数修改其值，乘上振幅系数3。
    pointLight.position.set(Math.sin(t * 3), 0.5, Math.cos(t * 3), 0).mulfs(3);
    pointLight2.position.set(0, 0.5, Math.sin(t * 3), Math.cos(t * 3)).mulfs(3);
    pointLight3.position.set(Math.cos(t * 3), 0.5, 0, Math.sin(t * 3)).mulfs(3);
    // 也可以先赋值，再通过norms函数将其修改为单位向量。
    dirLight.direction.set(Math.sin(t * 20), 0.2, Math.cos(t * 20) * 0.2, Math.cos(t * 20)).norms();
    // 给material2材质中的颜色变量动态赋值，实现右边的超立方体的变色效果
    uniformColor.write([Math.sin(t) * 0.3 + 0.7, Math.sin(t * 0.91) * 0.5 + 0.5, Math.sin(t * 1.414) * 0.5 + 0.5]);
    // 下一帧时间递增
    t += 0.01;
});`;
const mat101 = {
    html: defaultHTML,
    js: {
        zh: mat101_common, en: mat101_common
            .replace("为了能更好控制相机，我们创建App时设置了一个enablePointerLock选项，用于隐藏并锁定鼠标", "To better control the camera, we set the enablePointerLock option when creating the App to hide and lock the mouse")
            .replace("超立方体几何数据", "Tesseract geometry data")
            .replace("超球几何数据", "Glome geometry data")
            .replace("地面几何数据，边长为10.0的三维立方体地面", "3D cube floor with side length 10.0")
            .replace("创建一个材质颜色变量", "Create a material color variable")
            .replace("材质1为有高光的白色", "Material 1: glossy white")
            .replace("材质2为有高光的绑定了刚才的颜色变量的可变颜色", "Material 2: glossy material with the color variable")
            .replace("使用两种材质分别创建两个立方体，并分别设置其位置。", "Create two cubes with the two materials and set their positions separately")
            .replace("地板材质", "Floor material")
            .replace("其漫反射颜色使用棋盘格贴图", "Its diffuse color uses a checker texture")
            .replace("前两个参数为白色与黑色，第三个参数为贴图坐标", "The first two parameters are white and black; the third parameter is texture coordinates")
            .replace("输入默认的立方体的贴图坐标，通过Vec4TransformNode节点进行坐标变换", "Input the default cube texture coordinates, and transform them via a Vec4TransformNode node")
            .replace("坐标变换通过math.Obj4对象表示。前两个参数对应平移和旋转，这里都没有", "Transformation is represented by a math.Obj4 object. The first two parameters correspond to translation and rotation (none here)")
            .replace("第三个参数为缩放，我们把所有方向均匀缩放10倍以显示更多的棋盘格子", "The third parameter is scaling; we scale all directions by 10× to display more checker squares")
            .replace("超球材质为光泽的蓝色", "The glome material is glossy blue")
            .replace("故意在y轴z轴上都跟那些超立方体都错开，体现四维的空间感", "Intentionally offset along the y- and z-axes from the tesseracts to get the 4D spatial sense")
            .replace("加入所有物体", "Add all objects")
            .replace("加入各类灯光", "Add various lights")
            .replace("spotLight是聚光灯，三个参数分别是RGB颜色强度、锥角与边缘硬度", "spotLight's three parameters are RGB intensity, cone angle, and (edge hardness)")
            .replace("下面的物体都要设置动画效果", "The following objects need to be animated")
            .replace("告诉Tesserxel要每帧更新它们的坐标", "Tell Tesserxel to update their coordinates each frame")
            .replace("设置相机位置", "Set the camera position")
            .replace("添加一个“保持竖直”模式的相机控制器", "Add a camera controller in 'keep upright' mode")
            .replace("生成动画的随机种子", "Generate a random seed for animation")
            .replace("app.run 中的参数是个回调函数，它将在每帧渲染时执行。我们在这里实现动画效果", "The parameter of app.run is a callback executed each frame during rendering. We implement animation here")
            .replace("将带参数t的向量单位化后，复制给聚光灯的方向向量", "Normalize the vector with parameter t and assign it to the spotlight's direction vector")
            .replace("通过set函数把位置坐标设为三角函数后，再使用mulfs函数修改其值，乘上振幅系数3。", "Set the position using trigonometric functions with set(), then modify it with mulfs() multiplying by amplitude factor 3")
            .replace("也可以先赋值，再通过norms函数将其修改为单位向量。", "You can also assign values first then normalize it with the norms() function")
            .replace("给material2材质中的颜色变量动态赋值，实现右边的超立方体的变色效果", "Dynamically assign values to the color variable in material2 to achieve the color-changing effect of the right tesseract")
            .replace("下一帧时间递增", "Increase time for the next frame")
    },
};

export { mat101 };
