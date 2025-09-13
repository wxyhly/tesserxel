const defaultHTML = { zh: '<canvas></canvas>', en: '<canvas></canvas>' };
const phy101_common = `import * as tesserxel from "tesserxel"
const FOUR = tesserxel.four;
// 引入物理引擎模块的简写
const PHY = tesserxel.physics;
// 初始化物理引擎
const engine = new PHY.Engine();
// 初始化物理世界
const world = new PHY.World();
// 创建一个刚体对象
let cube_logic = new PHY.Rigid({
    // Tesseractoid 是超长方体，这里设置为边长为1的超立方体
    geometry: new PHY.rigid.Tesseractoid(1),
    // 材质的两个参数分别为摩擦系数与弹性系数
    material: new PHY.Material(0.5, 0.5),
    // 质量设为1kg
    mass: 1, 
});
// 把立方体加入物理世界
world.add(cube_logic);
// 创建渲染app
const canvas = document.querySelector("canvas");
const app = await tesserxel.four.App.create({canvas});

// 加入超立方体
let cube_mesh = new FOUR.Mesh(
    new FOUR.TesseractGeometry(), new FOUR.LambertMaterial([1, 1, 0])
);
app.scene.add(cube_mesh);
cube_mesh.alwaysUpdateCoord = true;
// 加入能渲染的立方体地面
let floor_mesh = new FOUR.Mesh(
    // 这里lambert材质的颜色给了第四个alpha值，它用于控制在体素渲染中的透明度
    // 我们把地面透明度调低，以便观察立方体
    new FOUR.CubeGeometry(10), new FOUR.LambertMaterial([1, 1, 1, 0.2])
);
floor_mesh.position.y = -4;
app.scene.add(floor_mesh);
// 加入物理上的地面，Plane后面的参数为地面的法线
// 这里传入预定义的常量Vec4.y，也可以手动写new Vec4(0,1,0,0)
world.add(new PHY.Rigid({
    geometry: new PHY.rigid.Plane(tesserxel.math.Vec4.y,-4),
    material:new PHY.Material(0.5, 0.5), mass: 0
}));
// 加入光照
app.scene.add(new FOUR.DirectionalLight(
    [0.9, 0.8, 0.8], 
    new tesserxel.math.Vec4(-1, 1, 1, 1).norms() 
));
app.scene.add(new FOUR.AmbientLight(0.3));
// 把相机放远些以看到正方体
app.camera.position.w = 10.0;
// 设置随机方向的速度，大小为2
cube_logic.velocity.randset().mulfs(2);
// 设置随机方向的角速度，大小为5
cube_logic.angularVelocity.randset().mulfs(5);
// 设置随机朝向
cube_logic.rotation.randset();
app.controllerRegistry.add(new tesserxel.util.ctrl.KeepUpController(app.camera));
app.run(()=>{
    engine.update(world, 1/60);
    // 同步物理逻辑物体与渲染网格物体
    cube_mesh.copyObj4(cube_logic);
    // Obj4包括位置与旋转，如果只想同步位置则可写：(不推荐)
    // cube_mesh.position.copy(cube_logic.position);
});`;
const phy101 = {
    html: defaultHTML,
    js: {
        zh: phy101_common, en: phy101_common.replace("引入物理引擎模块的简写", "Shorthand for importing the physics engine module")
.replace("初始化物理引擎", "Initialize the physics engine")
.replace("初始化物理世界", "Initialize the physics world")
.replace("创建一个刚体对象", "Create a rigid body object")
.replace("Tesseractoid 是超长方体，这里设置为边长为1的超立方体", "Tesseract (hypercube) is a special Tesseractoid, here set to a unit hypercube (edge length 1)")
.replace("材质的两个参数分别为摩擦系数与弹性系数", "The two parameters of the material are friction coefficient and restitution coefficient")
.replace("质量设为1kg", "Set mass to 1kg")
.replace("把立方体加入物理世界", "Add the cube to the physics world")
.replace("创建渲染app", "Create rendering app")
.replace("加入超立方体", "Add a hypercube")
.replace("加入能渲染的立方体地面", "Add a renderable cube ground")
.replace("这里lambert材质的颜色给了第四个alpha值，它用于控制在体素渲染中的透明度", "Here the Lambert material color has a fourth alpha value, used to control opacity in voxel rendering")
.replace("我们把地面透明度调低，以便观察立方体", "We set the ground transparency lower for easier cube observation")
.replace("加入物理上的地面，Plane后面的参数为地面的法线", "Add a physical ground, the parameter after Plane is the ground normal")
.replace("这里传入预定义的常量Vec4.y，也可以手动写new Vec4(0,1,0,0)", "Here we pass the predefined constant Vec4.y, or manually write new Vec4(0,1,0,0)")
.replace("加入光照", "Add lighting")
.replace("把相机放远些以看到正方体", "Move the camera farther back to see the cube")
.replace("设置随机方向的速度，大小为2", "Set a random velocity with magnitude 2")
.replace("设置随机方向的角速度，大小为5", "Set a random angular velocity with magnitude 5")
.replace("设置随机朝向", "Set a random orientation")
.replace("同步物理逻辑物体与渲染网格物体", "Synchronize physics rigid body with render mesh")
.replace("Obj4包括位置与旋转，如果只想同步位置则可写：(不推荐)", "Obj4 includes position and rotation. If you only want to sync position, you could write: (not recommended)")
.replace("cube_mesh.position.copy(cube_logic.position);", "cube_mesh.position.copy(cube_logic.position);")
    }
};
export {phy101};