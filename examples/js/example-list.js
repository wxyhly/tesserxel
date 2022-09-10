let examples = [
    { target: "tesseract", zh: "超立方体", en: "Tesseract (Hypercube)" },
    { target: "tiger", zh: "双圆环", en: "Tiger (Duotorus)" },
    { target: "glome", zh: "超球", en: "Glome (Hyphersphere)" },
    { target: "menger_sponge1", zh: "门格海绵1", en: "Menger Sponge 1" },
    { target: "menger_sponge2", zh: "门格海绵2", en: "Menger Sponge 2" },
    { target: "mandelbulb_hopf", zh: "Mandelbulb Hopf坐标", en: "Mandelbulb Hopf Coord" },
    { target: "mandelbulb_spherical", zh: "Mandelbulb 球坐标", en: "Mandelbulb Spherical Coord" },
    { target: "julia_quaternion", zh: "四元数Julia集", en: "Quaternion Julia Set" },
    { target: "instanced_cubes", zh: "实例化多方块", en: "Instanced Hypercubes" },
    { target: "city_highway", zh: "城市高速", en: "City Highway" },
    { target: "four_basic_scene", zh: "创建简单Four场景", en: "Basic Four Scene Creation" },
    { target: "four_materials", zh: "Four材质与灯光", en: "Four Materials & Lights" },
    { target: "spring_rope", zh: "弹簧绳", en: "Rope with Springs" },
    { target: "rigid_test", zh: "刚体测试", en: "Rigid body test" },
];
// todo: magicCube4D
let info = {
    default: {
        "zh": "点击侧栏中的示例，这里将显示说明。",
        "en": "Please click examples in the sidebar, and here will show descriptions about that example.",
    },
    empty: {
        "zh": "作者暂时未对该示例添加描述。",
        "en": "Sorry, currently there's no description for this example.",
    },
    tiger: {
        "zh": "<b>控制：轨迹球模式</b><br>双圆环是一种旋转体，它由轮胎形状的环面绕平行于轮胎所在大圆的平面轴旋转得到。本例中的双圆环由八面体网格构成，每个八面体网格被分成了5个四面体进行渲染。",
        "en": `<b>Control: Trackball mode</b><br>Tiger(or duotorus) is obtained by rotating a torus surface around an "axis plane" parallel to main circle of torus. In this example, the mesh consists of octahedral grids, each grid is divided into 5 tetrahedrons for rendering. `,
    },
    instanced_cubes: {
        "zh": "<b>控制：轨迹球模式</b><br>通过实例化渲染加速渲染了4096个超立方体。这些超立方体位置朝向均为随机均匀分布。",
        "en": "<b>Control: Trackball mode</b><br>Rendered 4096 tesseracts by instantiation. Positions and Orientations of these tesseracts are evenly distributed by random."
    },
    tesseract: {
        "zh": "<b>控制：轨迹球模式</b><br>鼠标左键在三维空间中旋转，右键在四维空间中旋转，中键在屏幕方向与前后方向旋转，滚动鼠标缩放，与Jenn3D软件操作完全相同。<br><br>一个每个胞中心球形区域涂了不同颜色的超立方体，默认摄像机在超立方体内部，通过鼠标滚轮可缩小至超立方体外部。",
        "en": `<b>Control: Trackball mode</b><br>Left mouse button to rotate in 3D retina, right mouse button to rotate in 4D, center mouse button to rotate in 2D screen and front-back direction, scroll mouse wheel to scale. The operations are exactly same as software Jenn3D. <br><br>A tesseract(Hypercube). A spherical volume at each cell center is painted by different color. The default camera position is inside the tesseract, get out of the tesseract by scrolling your mouse wheel.`,
    },
    glome: {
        "zh": "一个表面绘制着许多平圆环纬面的超球。默认摄像机在超球内部，通过鼠标滚轮可缩小至超立方体外部。",
        "en": `<b>Control: Trackball mode</b><br>A glome(Hypersphere) painted by several flat tori which are equi-latitude surface. The default camera position is inside the glome, get out of the glome by scrolling your mouse wheel.`,
    },
    menger_sponge1: {
        "zh": "<b>控制：自由飞行模式</b><br>门格海绵分形的第一种四维类比。从正面看上去，它在三维视野中的投影恰为三维门格海绵，因此严格来说它在三维视野中的体积为零，很难被看见。",
        "en": `The first analogue of Menger sponge. In the front view, it's projection in 3D retina is exactly 3D Menger sponge, which has zero volume hence can be seen difficultly.`,
    },
    menger_sponge2: {
        "zh": "<b>控制：自由飞行模式</b><br>门格海绵分形的第二种四维类比。从正面看上去，它在三维视野中的投影为内部有中空的实心立方体，它的某些横截面恰为三维门格海绵。",
        "en": `The second analogue of Menger sponge. In the front view, it's projection in 3D retina is a solid cube will some internal holes. Some cross sections of it are exactly 3D Menger sponge.`,
    },
    mandelbulb_hopf: {
        "zh":"<b>控制：自由飞行模式</b><br>Mandelbulb分形的第一种类比。Mandelbulb分形建立在球坐标系之上。四维极座标系统有两种，该分形采用Hopf坐标。",
        "en":"The first analogue of Mandelbulb. The construction of 3D Mandelbulb is based on spherical coordinate. In 4D, there are two similar coordinate system. Hopf coordinate is used for this fractal.",
    },
    mandelbulb_spherical: {
        "zh":"<b>控制：自由飞行模式</b><br>Mandelbulb分形的第二种类比。Mandelbulb分形建立在球坐标系之上。四维极座标系统有两种，该分形采用球极坐标。",
        "en":"The second analogue of Mandelbulb. The construction of 3D Mandelbulb is based on spherical coordinate. In 4D, there are two similar coordinate system. Spherical polar coordinate is used for this fractal.",
    },
    julia_quaternion:{
        "zh":"<b>控制：自由飞行模式</b><br>使用四元数的Julia集。迭代公式为：z->z<sup>2</sup>+(-0.125-0.256<i>i</i>+0.847<i>j</i>+0.0895<i>k</i>)",
        "en":"<b>Control: Free fly mode.</b><br>Julia set with quaternion number. The iteration fomular is: z->z<sup>2</sup>+(-0.125-0.256<i>i</i>+0.847<i>j</i>+0.0895<i>k</i>)"
    },
    city_highway:{
        "zh":"四维世界的地面是三维的，人们可以在三维地面上修建城市与空间曲线道路。这是一条单边4x3车道的双向道路。",
        "en":"The ground of 4D world is three dimensional, where inhabitants could build city and road by spatial curve. This is a two-way road of 4x3 lanes on each side."
    },
    four_basic_scene:{
        "zh":"使用FOUR绘制一个红色双旋转超立方体。类似于3D渲染中的ThreeJs库与WebGl，tesserxel中的子库Four能够帮您隐藏底层渲染逻辑，快速构建四维场景。详见源码FourBasicScene.ts。",
        "en":`Rendering a redish double rotating hypercube by library "Four". Analogue to ThreeJs and WebGl for 3D rendering, tessexel's sub-library "Four" helps you hide low-level render implementations in order to build 4D scene fastly. detail can be found in source file FourBasicScene.ts.`
    },
    four_materials:{
        "zh":"四维常见材质灯光展示。注意四维空间中的点光源随距离呈三次方衰减，因此会出现即使光源周围很亮但稍远处就很黑的现象。子库Four中，物体材质使用节点递归定义，以便程序化生成贴图，解决常规3D贴图内存占用大的问题。",
        "en":"Common materials and lightings in 4D. Note that point lights in 4D decays with the inverse cubic law. This could cause bright around the light source, but get dark rapidly in a distance. In the sub-library Four, the object material is defined recursively using nodes to generate textures procedurally and solve the problem of large memory usage of conventional 3D textures."
    },
};