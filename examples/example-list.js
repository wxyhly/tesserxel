let examples = [
    {
        group: "geoms", zh: "几何体", en: "Geometries",
        child: [
            {
                group: "polytopes", zh: "多胞体", en: "Polytopes",
                child: [

                    { target: "shapes::tesseract", zh: "超立方体", en: "Tesseract (Hypercube)" },
                    { target: "shapes::tesseract_ortho", zh: "超立方体（正交投影）", en: "Tesseract (Orthographic Projection)" },
                    {
                        group: "regular", zh: "正多胞体", en: "Regular Polytopes",
                        child: [
                            { target: "cwmesh::cell5", zh: "正5胞体", en: "5-Cell" },
                            { target: "cwmesh::cell8", zh: "正8胞体", en: "8-Cell" },
                            { target: "cwmesh::cell16", zh: "正16胞体", en: "16-Cell" },
                            { target: "cwmesh::cell24", zh: "正24胞体", en: "24-Cell" },
                            { target: "cwmesh::cell120", zh: "正120胞体", en: "120-Cell" },
                            { target: "cwmesh::cell600", zh: "正600胞体", en: "600-Cell" },
                        ]
                    },
                    {
                        group: "truncated", zh: "截角多胞体", en: "Truncated Polytopes",
                        child: [
                            { target: "cwmesh::cell5t", zh: "截角5胞体", en: "Tr-5-Cell" },
                            { target: "cwmesh::cell8t", zh: "截角8胞体", en: "Tr-8-Cell" },
                            { target: "cwmesh::cell16t", zh: "截角16胞体", en: "Tr-16-Cell" },
                            { target: "cwmesh::cell24t", zh: "截角24胞体", en: "Tr-24-Cell" },
                            { target: "cwmesh::cell120t", zh: "截角120胞体", en: "Tr-120-Cell" },
                            { target: "cwmesh::cell600t", zh: "截角600胞体", en: "Tr-600-Cell" },
                        ]
                    },
                    {
                        group: "bitruncated", zh: "过截角多胞体", en: "Bitruncated Polytopes",
                        child: [
                            { target: "cwmesh::cell5tt", zh: "过截角5胞体", en: "Bitr-5-Cell" },
                            { target: "cwmesh::cell8tt", zh: "过截角8胞体", en: "Bitr-8-Cell" },
                            { target: "cwmesh::cell24tt", zh: "过截角24胞体", en: "Bitr-24-Cell" },
                            { target: "cwmesh::cell120tt", zh: "过截角120胞体", en: "Bitr-120-Cell" },
                        ]
                    },
                    { target: "cwmesh::duopr5", zh: "5,5-双棱柱", en: "5,5-Duoprism" },
                    { target: "cwmesh::duopy5", zh: "5,5-双棱锥", en: "5,5-Duopyramid" },
                    { target: "cwmesh::prpr5", zh: "正5棱柱柱", en: "Pentagonal Prism Prism" },
                    { target: "cwmesh::prpy5", zh: "正5棱柱锥", en: "Pentagonal Prism Pyramid" },
                    { target: "cwmesh::pypr5", zh: "正5棱锥柱", en: "Pentagonal Pyramidal Prism" },
                    { target: "cwmesh::pypy5", zh: "正5棱锥锥", en: "Pentagonal Pyramidal Pyramid" },
                    // {
                    //     group: "uniform_polytopes", zh: "半正多胞体", en: "Uniform Polytopes",
                    //     child: [

                    //     ]
                    // }

                ]
            },
            {
                group: "product", zh: "不规则直积形", en: "Iregular Duoprism",
                child: [
                    { target: "shapes::directproduct1", zh: "文字 x 文字", en: "Text x Text" },
                    { target: "shapes::directproduct2", zh: "人 x 鸡", en: "Man x Chicken" },
                    { target: "shapes::directproduct3", zh: "人 x 人", en: "Man x Man" },
                    { target: "shapes::directproduct4", zh: "文字 x 鸡", en: "Text x Chicken" }]
            },
            {
                group: "curved", zh: "弯曲图形", en: "Curved 4D Shapes",
                child: [
                    { target: "shapes::duocylinder", zh: "双圆柱", en: "Duocylinder" },
                    { target: "shapes::spheritorus", zh: "球环", en: "Spheritorus" },
                    { target: "shapes::torisphere", zh: "环球", en: "Torisphere" },
                    { target: "shapes::torinder", zh: "圆环柱", en: "Torinder" },
                    { target: "shapes::tiger", zh: "双圆环", en: "Tiger (Duotorus)" },
                    { target: "shapes::ditorus", zh: "圆环环", en: "Ditorus" },
                    { target: "shapes::glome", zh: "超球", en: "Glome (Hyphersphere)" },
                    { target: "shapes::suzanne3d", zh: "猴头旋转体", en: "Suzanne Rotatoid" }
                ]
            }
        ]
    },
    {
        group: "world", zh: "四维场景", en: "4D Scenes",
        child: [
            { target: "instanced_cubes", zh: "实例化多方块", en: "Instanced Hypercubes" },
            { target: "city_freeway", zh: "城市高速", en: "City Freeway" },
            { target: "navigation", zh: "四维星球导航", en: "Navigation On 4D Planet" },
            { target: "backrooms", zh: "后室", en: "Backrooms" },
            { target: "rails::rail1d", zh: "一维轨道火车", en: "Linear Track Train" },
            { target: "rails::rail2d", zh: "二维轨道火车", en: "Planar Track Train" },
            { target: "rubic", zh: "四维魔方", en: "Magic Cube 4D" },
        ]
    },
    {
        group: "phy", zh: "物理世界", en: "Physics World",
        child: [
            {
                group: "rigid_chain", zh: "刚体链", en: "Rigid Chains",
                child: [
                    { target: "rigids::st_ts_chain", zh: "环球球环链", en: "ST-TS Chain" },
                    { target: "rigids::tg_tg_chain", zh: "双圆环链", en: "Tiger(Duotorus) Chain" },
                    { target: "rigids::mix_chain", zh: "杂环链", en: "Mixed Chain" },
                    { target: "rigids::ditorus", zh: "圆环环链", en: "Ditorus Chain" },
                    { target: "rigids::dt_ts_chain", zh: "圆环环链（静态）", en: "Ditorus Chain (Static)" },
                ]
            },
            {
                group: "rotating_rigids", zh: "旋转陀螺", en: "Rotating Gyros",
                child: [
                    { target: "rigids::gyro_conic_prism", zh: "圆锥柱陀螺", en: "Conic Prism Gyro" },
                    { target: "rigids::gyro_cylindral_cone", zh: "圆柱锥陀螺", en: "Cylindral Cone Gyro" },
                    { target: "rigids::gyro_dicone", zh: "圆锥锥陀螺", en: "Dicone Gyro" },
                    { target: "rigids::gyro_duocone", zh: "双圆锥陀螺", en: "Duocone Gyro" },
                    { target: "rigids::gyro_sphericone", zh: "球锥陀螺", en: "Sphericone Gyro" },
                ]
            },
            {
                group: "maxwell", zh: "电磁学", en: "Electromagnetism",
                child: [
                    { target: "rigids::e_charge", zh: "静电点电荷", en: "Static Electric Charges" },
                    { target: "rigids::e_dipole", zh: "电偶极子", en: "Electric Dipoles" },
                    { target: "rigids::m_dipole", zh: "磁偶极子", en: "Magnetic Dipoles" },
                    { target: "rigids::m_dipole_dual", zh: "自对偶磁偶极子", en: "Magnetic Dipoles (Self Dual)" }
                ]
            },
            {
                group: "dzhanibekov", zh: "刚体自由旋转", en: "Free Rigid Rotation",
                child: [
                    { target: "rigids::dzhanibekov1", zh: "单周期自由旋转进动", en: "Dzhanibekov Effect with Single Period" },
                    { target: "rigids::dzhanibekov2", zh: "双周期自由旋转进动", en: "Dzhanibekov Effect with Double Period" },
                    { target: "rigids::dzhanibekov3", zh: "稳定自由单旋转", en: "Stable Simple Rotation" },
                    { target: "rigids::dzhanibekov4", zh: "稳定自由等角双旋转", en: "Stable Isoclinic Rotation" },
                    { target: "rigids::dzhanibekov5", zh: "自由双旋转进动", en: "Dzhanibekov Effect with Double Rotation" },
                ]
            },
            // { target: "automobile", zh: "汽车", en: " Automobile" },
            { target: "drone", zh: "无人机", en: "Drone" },
            { target: "aircraft", zh: "客机", en: "Aircraft" },
            { target: "rigids::thermo_stats", zh: "旋转分布律（试验）", en: "Thermotic Rotation Distribution (Experimental)" },
            { target: "forces::spring_rope", zh: "弹簧绳", en: "Rope with Springs" },
            { target: "rigids::dice_yugu233", zh: "四维骰子", en: "4D Dice" },
            { target: "rigids::rigid_test", zh: "刚体测试", en: "Rigid Body Test" },
            { target: "rigids::st_pile", zh: "球环堆", en: "Spheritorus Pile" },
            { target: "pde::wave_eq", zh: "三维波动方程", en: "Wave Equation" },
            { target: "pde::river_evolution", zh: "河流演化", en: "River Evolution" },
            { target: "pde::erosion", zh: "流水侵蚀（试验）", en: "Hydraulic Erosion (Experimental)" },
        ]
    },
    {
        group: "fractal", zh: "分形", en: "Fractals",
        child: [
            { target: "mengersponge::menger_sponge1", zh: "门格海绵1", en: "Menger Sponge 1" },
            { target: "mengersponge::menger_sponge2", zh: "门格海绵2", en: "Menger Sponge 2" },
            { target: "mandelbulb::mandelbulb_hopf", zh: "Mandelbulb Hopf坐标", en: "Mandelbulb Hopf Coord" },
            { target: "mandelbulb::mandelbulb_spherical", zh: "Mandelbulb 球坐标", en: "Mandelbulb Spherical Coord" },
            { target: "mandelbulb::julia_quaternion", zh: "四元数Julia集", en: "Quaternion Julia Set" },
        ]
    },
    {
        group: "dev", zh: "开发示例", en: "Coding Examples",
        child: [
            {
                group: "dev", zh: "你好四面体", en: "Hello Tetrahedron",
                child: [
                    { target: "hellotetra::hello_tetra1", zh: "您的第一个四面体", en: "First Tetrahedron" },
                    { target: "hellotetra::hello_tetra2", zh: "添加顶点颜色", en: "Add Vertex Color" },
                    { target: "hellotetra::hello_tetra3", zh: "四面体转起来！", en: "Rotate Tetrahedron!" },
                ]
            },
            { target: "four_basic_scene", zh: "创建简单Four场景", en: "Basic Four Scene Creation" },
            { target: "four_materials", zh: "Four材质与灯光", en: "Four Materials & Lights" },
            { target: "voxeltest::rasterizer", zh: "四面体素软光栅化器演示", en: "Tetrahedra Voxel Rasterizer Demo" },
        ]
    },
    { target: "hh", zh: "超球谐函数", en: "Hyperspherical Harmonics" },
];
// todo: magicCube4D
let info = {
    nogpu: {
        "zh": "您的浏览器不支持或未开启WebGPU，无法加载示例。<hr>",
        "en": "Examples are not loaded because WebGPU is disabled or not supported in your browser.<hr>",
    },
    default: {
        "zh": "点击侧栏中的示例，这里将显示说明。",
        "en": "Please click examples in the sidebar, and here will show descriptions about that example.",
    },
    empty: {
        "zh": "作者暂时未对该示例添加描述。",
        "en": "Sorry, currently there's no description for this example.",
    },
    "shapes::tiger": {
        "zh": "<b>控制：轨迹球模式</b><br>双圆环是一种旋转体，它由轮胎形状的环面绕平行于轮胎所在大圆的平面轴旋转得到。本例中的双圆环由八面体网格构成，每个八面体网格被分成了5个四面体进行渲染。",
        "en": `<b>Control: Trackball mode</b><br>Tiger(or duotorus) is obtained by rotating a torus surface around an "axis plane" parallel to main circle of torus. In this example, the mesh consists of octahedral grids, each grid is divided into 5 tetrahedrons for rendering. `,
    },
    "instanced_cubes": {
        "zh": "<b>控制：轨迹球模式</b><br>通过实例化渲染加速渲染了4096个超立方体。这些超立方体位置朝向均为随机均匀分布。",
        "en": "<b>Control: Trackball mode</b><br>Rendered 4096 tesseracts by instantiation. Positions and Orientations of these tesseracts are evenly distributed by random."
    },
    "shapes::tesseract": {
        "zh": "<b>控制：轨迹球模式</b><br>鼠标左键在三维空间中旋转，右键在四维空间中旋转，中键在屏幕方向与前后方向旋转，滚动鼠标缩放，与Jenn3D软件操作完全相同。<br><br>一个每个胞中心球形区域涂了不同颜色的超立方体，默认摄像机在超立方体内部，通过鼠标滚轮可缩小至超立方体外部。",
        "en": `<b>Control: Trackball mode</b><br>Left mouse button to rotate in 3D retina, right mouse button to rotate in 4D, center mouse button to rotate in 2D screen and front-back direction, scroll mouse wheel to scale. The operations are exactly same as software Jenn3D. <br><br>A tesseract(Hypercube). A spherical volume at each cell center is painted by different color. The default camera position is inside the tesseract, get out of the tesseract by scrolling your mouse wheel.`,
    },
    "shapes::glome": {
        "zh": "<b>控制：轨迹球模式</b><br>一个表面绘制着许多平圆环纬面的超球。默认摄像机在超球内部，通过鼠标滚轮可缩小至超立方体外部。",
        "en": `<b>Control: Trackball mode</b><br>A glome(Hypersphere) painted by several flat tori which are equi-latitude surface. The default camera position is inside the glome, get out of the glome by scrolling your mouse wheel.`,
    },
    "mengersponge::menger_sponge1": {
        "zh": "<b>控制：自由飞行模式</b><br>门格海绵分形的第一种四维类比。从正面看上去，它在三维视野中的投影恰为三维门格海绵，因此严格来说它在三维视野中的体积为零，很难被看见。",
        "en": `<b>Control: Free fly mode</b><br>The first analogue of Menger sponge. In the front view, it's projection in 3D retina is exactly 3D Menger sponge, which has zero volume hence can be seen difficultly.`,
    },
    "mengersponge::menger_sponge2": {
        "zh": "<b>控制：自由飞行模式</b><br>门格海绵分形的第二种四维类比。从正面看上去，它在三维视野中的投影为内部有中空的实心立方体，它的某些横截面恰为三维门格海绵。",
        "en": `<b>Control: Free fly mode</b><br>The second analogue of Menger sponge. In the front view, it's projection in 3D retina is a solid cube will some internal holes. Some cross sections of it are exactly 3D Menger sponge.`,
    },
    "mandelbulb::mandelbulb_hopf": {
        "zh": "<b>控制：自由飞行模式</b><br>Mandelbulb分形的第一种类比。Mandelbulb分形建立在球坐标系之上。四维极座标系统有两种，该分形采用Hopf坐标。",
        "en": "<b>Control: Free fly mode</b><br>The first analogue of Mandelbulb. The construction of 3D Mandelbulb is based on spherical coordinate. In 4D, there are two similar coordinate system. Hopf coordinate is used for this fractal.",
    },
    "mandelbulb::mandelbulb_spherical": {
        "zh": "<b>控制：自由飞行模式</b><br>Mandelbulb分形的第二种类比。Mandelbulb分形建立在球坐标系之上。四维极座标系统有两种，该分形采用球极坐标。",
        "en": "<b>Control: Free fly mode</b><br>The second analogue of Mandelbulb. The construction of 3D Mandelbulb is based on spherical coordinate. In 4D, there are two similar coordinate system. Spherical polar coordinate is used for this fractal.",
    },
    "mandelbulb::julia_quaternion": {
        "zh": "<b>控制：自由飞行模式</b><br>使用四元数的Julia集。迭代公式为：z->z<sup>2</sup>+(-0.125-0.256<i>i</i>+0.847<i>j</i>+0.0895<i>k</i>)",
        "en": "<b>Control: Free fly mode</b><br>Julia set with quaternion number. The iteration fomular is: z->z<sup>2</sup>+(-0.125-0.256<i>i</i>+0.847<i>j</i>+0.0895<i>k</i>)"
    },
    "city_freeway": {
        "zh": "<b>控制：保持竖直模式</b><br>四维世界的地面是三维的，人们可以在三维地面上修建城市与空间曲线道路。这是一条单边4x3车道的双向道路。",
        "en": "<b>Control: Keep up mode</b><br>The ground of 4D world is three dimensional, where inhabitants could build city and road by spatial curve. This is a two-way road of 4x3 lanes on each side."
    },
    "navigation": {
        "zh": "<b>控制：自由飞行模式</b><br>将尺寸比例缩小、时间快进的四维星球。注意为了在地面附近活动，你可能需要随时滚动鼠标滚轮调整俯仰角。该星球为双旋转，视野中的指南针为一个被水平固定的磁偶极子，它将在与赤道平行的简单地磁偶极场中受力偏转来帮助您找到方向。下方标注了当地的太阳高度角余弦年度曲线，双旋转导致北极与南极的昼夜更替速度不同。按P键可以暂停时间流逝。",
        "en": "<b>Control: Free fly mode</b><br>A 4D planet whose dimension is scaled down and time is accelerated. Note that you may need to scroll the mouse wheel to adjust the pitch angle in order to move around the ground. The planet is double-rotating. The compass in the view is a magnetic dipole which is horizontally fixed. You can use it to navigate on the planet because it will rotate in a magnetic field generated by a simple dipole whose current is parallel to the equator. The annual cosine curve of the local solar elevation angle is plotted below. The double rotation causes the north and south poles to have different duration of day and night. Press the P key to pause the time passage."
    },
    "backrooms": {
        "zh": "<b>控制：保持竖直模式</b><br>“后室”是一种网友创作的虚构域限空间，该场景为Kane版后室离前厅最近的部分的四维类比。",
        "en": "<b>Control: Keep up mode</b><br>\"The Backrooms\" is a liminal space created on the Internet. This scene is an analogue of the first area in Kane Pixels version."
    },
    "rails::rail1d": {
        "zh": "<b>控制：保持竖直模式</b><br>铁路的自然四维类比，该场景有一段空间曲线铁轨加三车厢的平板火车组成，每个火车包括两个转向架，每个转向架有8个轮子。使用键盘T/G控制火车前进后退。",
        "en": "<b>Control: Keep up mode</b><br>The natural 4D analogy of the railway. This scene contains a spatial-curved rail and a three-carriage flat train. Each car includes two bogies, and each bogie has 8 wheels. Use the keyboard T/G to move forward / backward."
    },
    "rails::rail2d": {
        "zh": "<b>控制：保持竖直模式</b><br>平面轨道火车，火车在一个方向上被轨道卡住使用转向架引导转向，另一个方向则可使用方向盘人工驾驶控制方向。使用键盘T/G控制火车前进后退，键盘R/Y转向，键盘B锁定/解锁相机跟随。小心别让火车脱轨！",
        "en": "<b>Control: Keep up mode</b><br>Planar rail train. the bogie is used to guide the train in one direction, and the steering wheel is used by driver manually in another direction. Use the keyboard T/G to move forward / backward, the keyboard R/Y to turn, and the keyboard B to lock/unlock the camera following. Be careful not to derail the train!"
    },
    "rubic": {
        "zh": "<b>控制：轨迹球模式</b><br>四维三阶魔方演示。四维魔方的每个胞是立方体，不同于正方形只能绕面心旋转，立方体的旋转对称性则丰富得多，绕过面块、角块与棱块的轴可以进行90°、120°、180°三种角度的旋转。使用键盘H切换至镂空模式。",
        "en": "<b>Control: Trackball mode</b><br>Demo of 4D rubic's cube of order 3. Each cell of the 4D tesseract is a cube. In 3d, a square can only be rotated around the face center. Unlike 3d, the rotational symmetry of 4d cubic cell is much richer. It can be rotated 90°, 120° and 180° around the axes through face blocks, corner blocks and edge blocks. Use keyboard H to toggle hollow mode.",
    },
    "four_basic_scene": {
        "zh": "使用FOUR绘制一个红色双旋转超立方体。类似于3D渲染中的ThreeJs库与WebGl，tesserxel中的子库Four能够帮您隐藏底层渲染逻辑，快速构建四维场景。详见源码FourBasicScene.ts。",
        "en": `Rendering a redish double rotating hypercube by library "Four". Analogue to ThreeJs and WebGl for 3D rendering, tessexel's sub-library "Four" helps you hide low-level render implementations in order to build 4D scene fastly. detail can be found in source file FourBasicScene.ts.`
    },
    "four_materials": {
        "zh": "<b>控制：保持竖直模式</b><br>四维常见材质灯光展示。注意四维空间中的点光源随距离呈三次方衰减，因此会出现即使光源周围很亮但稍远处就很黑的现象。子库Four中，物体材质使用节点递归定义，以便程序化生成贴图，解决常规3D贴图内存占用大的问题。",
        "en": "<b>Control: Keep up mode</b><br>Common materials and lightings in 4D. Note that point lights in 4D decays with the inverse cubic law. This could cause bright around the light source, but get dark rapidly in a distance. In the sub-library Four, the object material is defined recursively using nodes to generate textures procedurally and solve the problem of large memory usage of conventional 3D textures."
    },
    "hellotetra::hello_tetra1": {
        "zh": "除非采用光线跟踪，Tesserxel绘制的最小单元就是四面体。这是绘制一个四面体的最简单代码示例。",
        "en": "This is a simple case for rendering a tetrahedron with Tesserxel."
    },
    "hellotetra::hello_tetra2": {
        "zh": "类似三维渲染管线，顶点着色器将数据插值传递给片元着色器以实现顶点颜色插值。",
        "en": "Like in 3D standard rendering pipeline, vertex shader does intterpolation and transfer data to fragment shader to implement smooth coloring."
    },
    "hellotetra::hello_tetra3": {
        "zh": "通过WebGPU中的binding group设置Uniform变量，在每帧渲染时通过传递矩阵实现旋转。注意要从group(1)开始，因为group(0)被Tesserxel内部占用。",
        "en": "Seting up uniform with binding group in WebGPU. In each frame, update rotation matrix to uniform. Attention that one must start with group(1), because group(0) is occupied by internal usage with Tesserxel."
    },
    "rigids::st_pile": {
        "zh": "<b>控制：保持竖直模式</b><br>超立方体房间中将不断掉下许多球环（偶尔还会掉其它图形哦）。使用鼠标左键发射超球轰击它们。",
        "en": "<b>Control: Keep up mode</b><br>Spheritori are dropped in the tesseract shaped room. (There are small chances to drop other shapes too!) Click left mouse button to fire glomes and hit them."
    },
    "rigids::st_ts_chain": {
        "zh": "<b>控制：保持竖直模式</b><br>球环与环球交错组成的链。使用鼠标左键发射超球轰击它们。",
        "en": "<b>Control: Keep up mode</b><br>A Chain made of spheritorus and torusphere alternatively. Click left mouse button to fire glomes and hit them."
    },
    "rigids::tg_tg_chain": {
        "zh": "<b>控制：保持竖直模式</b><br>大小双圆环交错组成的链。使用鼠标左键发射超球轰击它们。",
        "en": "<b>Control: Keep up mode</b><br>A Chain made of Big and small tigers (doutorus) alternatively. Click left mouse button to fire glomes and hit them."
    },
    "rigids::mix_chain": {
        "zh": "<b>控制：保持竖直模式</b><br>双圆环可以同时匹配球环与环球的孔，它可以作为锁链的“万能”连接部件。使用鼠标左键发射超球轰击它们。",
        "en": "<b>Control: Keep up mode</b><br>Tigers (doutorus) can match both holes of spheritorus and torisphere, hence they can be used as universal components for constructing chains. Click left mouse button to fire glomes and hit them."
    },
    "rigids::ditorus": {
        "zh": "<b>控制：保持竖直模式</b><br>圆环环（灰色）不仅可以与球环（黄色）串成链，它的孔还可以与环球（红色与蓝色）的孔匹配，使用鼠标左键发射超球轰击它们。",
        "en": "<b>Control: Keep up mode</b><br>Ditorus (in gray) and spheritorus(in yellow) can make a chain. The hole of ditorus can also match the hole of torisphere. Click left mouse button to fire glomes and hit them."
    },
    "rigids::dt_ts_chain": {
        "zh": "<b>控制：保持竖直模式</b><br>圆环环（灰色）可以与环球串成链，但由于这种链的结合方式紧密，Tesserxel的基于迭代的物理引擎解算碰撞不能很好收敛，因此本场景不支持物理交互。",
        "en": "<b>Control: Keep up mode</b><br>Ditorus (in gray) and torisphere(in blue) can make chains. This construction is too tight so that the iterative collision solving system in Tesserxel's physics engine can't converge. Hence physical interaction in this scene is disabled."
    },
    "rigids::rigid_test": {
        "zh": "<b>控制：保持竖直模式</b><br>三维的地面上将不断掉下超立方体。使用鼠标左键发射超球轰击它们。",
        "en": "Tesseracts are dropped on 3D ground. Click left mouse button to fire glomes and hit them."
    },
    "forces::spring_rope": {
        "zh": "<b>控制：保持竖直模式</b><br>由胡克定律弹簧模型模拟的绳子，采用四阶显式龙格库塔积分器求解。",
        "en": "<b>Control: Keep up mode</b><br>A rope simulated by spring model with hook's law, solved with 4th order explicit Runge-Kutta method."
    },
    "pde::wave_eq": {
        "zh": "求解环面T^3上的三维波动方程描述的4个干涉波源。",
        "en": "Solve wave equation of 4 interferenced wave source on T3 manifold."
    },
    "pde::erosion": {
        "zh": "通过降雨模拟四维世界中的河流演化。地形由三维单形分形噪声生成。",
        "en": "River evolution simulated by rain fall. Terrain is generated by fractal 3d simplex noise."
    },
    "rigids::e_charge": {
        "zh": "<b>控制：保持竖直模式</b><br>静电点电荷模拟。红球与蓝球分别带有等量异种电荷，静电力随距离三次方衰减。使用键盘G开启/关闭重力。",
        "en": "<b>Control: Keep up mode</b><br>Simulation of static electric charge. Red and blue balls have the same amount of charge but with different signs. The decay of electric force is inverse-cubic by distance. Use keyboard G to turn on/off the gravity."
    },
    "rigids::e_dipole": {
        "zh": "<b>控制：保持竖直模式</b><br>静电偶极子模拟。每个小球的红蓝两部分均带不同种电荷。使用键盘G开启/关闭重力。",
        "en": "<b>Control: Keep up mode</b><br>Simulation of static electric dipole. Red and blue parts of each ball have different sign of charge. Use keyboard G to turn on/off the gravity."
    },
    "rigids::m_dipole": {
        "zh": "<b>控制：保持竖直模式</b><br>磁偶极子模拟。磁场由无穷小环形电流产生，方向由偶极子球上的蓝色圆周标出，红色圆周为其绝对垂直方向。使用键盘G开启/关闭重力。",
        "en": "<b>Control: Keep up mode</b><br>Simulation of magnetic dipole. Magnetic field is generated by infinitesimal current loop whose direction is marked by blue circle on the ball. Red circle is perpendicular to the current loop. Use keyboard G to turn on/off the gravity."
    },
    "rigids::m_dipole_dual": {
        "zh": "<b>控制：保持竖直模式</b><br>对偶磁偶极子为两个绝对垂直的等大环形电流的磁场叠加。对偶磁偶极子按手性可分为互为镜像的自对偶与反自对偶磁偶极子。同种对偶磁偶极子之间因两个线圈受力抵消，因而无相互作用力。使用键盘G开启/关闭重力。",
        "en": "<b>Control: Keep up mode</b><br>Dual magnetic dipole is constructed by two perpendicular current loop with same amount. It can be categorized into two different chiral class: self-dual and anti-self-dual dipole. dipoles with the same chirality have no interactions since force applied by perpendicular current loops exactly cancel each other. Use keyboard G to turn on/off the gravity."
    },
    "rigids::gyro_conic_prism": {
        "zh": "<b>控制：保持竖直模式</b><br>快速旋转的圆锥柱陀螺。使用鼠标左键发射超球轰击它可以看到该陀螺具有一定的稳定性。",
        "en": "<b>Control: Keep up mode</b><br>Spinning conic prismatical gyro. Click left mouse button to fire glomes and hit it, which can be shown that this gyro is stable while spinning."
    },
    "rigids::gyro_dicone": {
        "zh": "<b>控制：保持竖直模式</b><br>快速旋转的圆锥锥陀螺。使用鼠标左键发射超球轰击它可以看到该陀螺具有一定的稳定性。",
        "en": "<b>Control: Keep up mode</b><br>Spinning diconic gyro. Click left mouse button to fire glomes and hit it, which can be shown that this gyro is stable while spinning."
    },
    "rigids::gyro_duocone": {
        "zh": "<b>控制：保持竖直模式</b><br>快速旋转的双圆锥陀螺，可以看到它不能保持稳定旋转。使用鼠标左键发射超球轰击它。",
        "en": "<b>Control: Keep up mode</b><br>Spinning duoconic gyro. It can be seen that this gyro is not stable. Click left mouse button to fire glomes and hit it."
    },
    "rigids::gyro_sphericone": {
        "zh": "<b>控制：保持竖直模式</b><br>快速旋转的球锥陀螺，可以看到它不能保持稳定旋转。使用鼠标左键发射超球轰击它。",
        "en": "<b>Control: Keep up mode</b><br>Spinning sphericonic gyro. It can be seen that this gyro is not stable. Click left mouse button to fire glomes and hit it."
    },
    "rigids::gyro_cylindral_cone": {
        "zh": "<b>控制：保持竖直模式</b><br>快速旋转的圆柱锥陀螺，可以看到它不能保持稳定旋转。使用鼠标左键发射超球轰击它。",
        "en": "<b>Control: Keep up mode</b><br>Spinning conic prismatical gyro. It can be seen that this gyro is not stable. Click left mouse button to fire glomes and hit it."
    },
    "rigids::dzhanibekov2": {
        "en": "<b>Control: Trackball mode</b><br>4D version of Dzhanibekov effect (or Tennis racket theorem). If the supercuboid is rotated around the plane formed by the shortest and longest edges, the rotation direction will inverse frequently. This corresponds to two different periods in two directions. This was firstly proposed in Marc ten bosch's paper, but with wrong simulation result. ",
        "zh": "<b>控制：轨迹球模式</b><br>4D版贾尼别科夫效应（亦称网球拍定理）。若绕最短与最长棱张成的平面旋转超长方体，则会发生刚体的旋转不时反向的现象，这种旋转反向在两个方向对应两个不同的周期。4D贾尼别科夫效应首先在Marc Ten Bosch的论文中提出，但其模拟给出的结论有误。",
    },
    "rigids::dzhanibekov1": {
        "en": "<b>Control: Trackball mode</b><br>4D version of Dzhanibekov effect (or Tennis racket theorem). If the tesseract is rotating in the plane spanned by the shortest and second longest edges or by the longest and second shortest edges, the rotation direction will inverse periodically. This is the same as in the three-dimensional case with only one period. This was firstly proposed in Marc ten bosch's paper, but with wrong simulation result. ",
        "zh": "<b>控制：轨迹球模式</b><br>4D版贾尼别科夫效应（亦称网球拍定理）。若绕最短与次长棱张成的平面或绕最长与次短棱张成的平面旋转超长方体，则会发生刚体的旋转不时反向的现象，这种旋转反向跟三维情形一样仅有一个周期。 4D贾尼别科夫效应首先在Marc Ten Bosch的论文中提出，但其模拟给出的结论有误。",
    },
    "rigids::dzhanibekov3": {
        "en": "<b>Control: Trackball mode</b><br>If the tesseract is rotating in the plane spanned by the second shortest and second longest edges， the rotation is stable, and there's no Dzhanibekov effect.",
        "zh": "<b>控制：轨迹球模式</b><br>若绕次短与次长棱张成的平面旋转超长方体则旋转是稳定的，不会发生贾尼别科夫效应。",
    },
    "rigids::dzhanibekov4": {
        "en": "<b>Control: Trackball mode</b><br>If the tesseract is rotated isoclinicly， the rotation is stable, and there's no Dzhanibekov effect.",
        "zh": "<b>控制：轨迹球模式</b><br>若初始旋转是等角双旋转则旋转是稳定的，不会发生贾尼别科夫效应。",
    },
    "rigids::dzhanibekov5": {
        "en": "<b>Control: Trackball mode</b><br>Hint: Please wait half minute for rotation direction inverse.<br>If the tesseract is rotated not perfectly isoclinic， the rotation can be unstable, and Dzhanibekov effect could happen. If rotation gets closer to isoclinic, the period of direction inverse will get longer.",
        "zh": "<b>控制：轨迹球模式</b><br>提示：需要等大约半分钟才会有旋转翻转效应。<br>若初始旋转是非等角双旋转则可能会发生贾尼别科夫效应，且越接近完美等角双旋转翻转周期会变得越长。",
    },
    "rigids::dice_yugu233": {
        "en": "<b>Control: Keep up mode</b><br>4D Dice designed by yugu233, click the link to see: <a target='_blank' href='https://www.bilibili.com/video/BV1PoqYYeEtp/'>the original design</a>. Click left mouse button to fire glomes and hit them.",
        "zh": "<b>控制：保持竖直模式</b><br>由yugu2333设计的四维骰子：<a target='_blank' href='https://www.bilibili.com/video/BV1PoqYYeEtp/'>出处见链接</a>。使用鼠标左键发射超球轰击它们。",
    },
    "drone": {
        "en": "<b>In Drone Control:</b><br>Use Space/Shift to rise/descend drone, W/A/S/D/Q/E to drift, and I/J/K/L/U/O to steer.<br><br><b>In Camera Control: Keep up mode</b><br>Press =/- to adjust camera move speed.<br><br><b>Special Operations:</b><br>Press key B to toggle camera/drone control. Press key 1/2/3 to toggle different camera positions on the drone, press key 4 for free camera. Press Key T to enter automatic mode, this helps you to better handle drone pose. Press H to hide overlapped texts.",
        "zh": "<b>无人机控制模式下：</b><br> 使用空格/Shift升降无人机、W/A/S/D/Q/E漂移、I/J/K/L/U/O转向。<br><br><b>摄像机控制下为保持竖直模式</b><br>按=/-调节相机移动速度。<br><br><b>特殊控制：</b><br>按B键切换相机/无人机控制，按1/2/3键可切换无人机上的不同机位、按4键切至自由相机。按T键进入自动化模式，它将帮您更好控制飞行姿态。按H隐藏叠加的文字。"
    },
    "aircraft": {
        "en": "<b>In Aircraft Control:</b><br>Use Arrow Up / Arrow Down to turn on/off throttle(engine's power), W/S(down/up) to control elevator, Q/E(ana/kata) A/D(left/right) to control rudder, Z/X to spin. Use F/Shift+F to control flaps, hold key C to adjust aircraft roll to keep horizontal by automatic system. When at ground, use K to toggle all gear brake, U/O(ana/kata) J/L(left/right) to control each gear brake to turn. <br><br><b>In Camera Control: Keep up mode</b><br>Press =/- to adjust camera move speed. <br><br><b>Special Operations:</b><br>Press key B to toggle camera/aircraft control. Press key 1/2/3/4/5/6 to toggle different camera positions on the aircraft, press key 7 for free camera. Use 9/0 to zoom in/out (change camera's focus length). Press H to hide overlapped texts.",
        "zh": "<b>飞机控制模式下：</b><br> 使用上下箭头调节发动机功率，W/S（俯/仰）控制升降舵，Q/E（侧前后） A/D（左右）控制转向，Z/X控制自转。使用F/Shift+F调节襟翼，按住C键可通过自动控制系统修正飞机横滚角至水平姿态。地面滑行时，可使用K键开启/关闭所有起落架轮制动，U/O（侧前后） J/L（左右）控制各轮刹车比例控制转向。<br><br><b>摄像机控制下为保持竖直模式</b><br>按=/-调节相机移动速度。<br><br><b>特殊控制：</b><br>按B键切换相机/飞机控制，按1/2/3/4/5/6键可切换飞机上的不同机位、按7键切至自由相机，使用大键盘9/0拉近/拉远镜头画面。按H隐藏叠加的文字。"
    },
    "voxeltest::rasterizer": {
        "zh": "<b>控制：轨迹球模式</b><br>该示例为使用计算着色器对四面体进行体素光栅化，渲染双圆环的深度缓冲区。",
        "en": "<b>Control: Trackball mode</b><br>This example renders depth buffer of a tiger (i.e. duotorus), which use compute shader to rasterize tetrahedra.",
    },
    "hh": {
        "zh": "<b>控制：轨迹球模式</b><br>超球面上的调和函数，详见<a href='/archives/hh/' target='_blank'>这里</a>。可通过三级联动菜单选择相应的波函数，最后一级为绿色按钮(点击后为青色)。使用鼠标滚轮推拉相机可进出超球面内外部。",
        "en": "<b>Control: Trackball mode</b><br>Harmonic functions on S3. Detail can be found <a href='/archives/hh/' target='_blank'>here (In Chinese)</a>. Please choose wave functions by multi-level selection menu, the last level is green button (Cyan after click). Use mouse wheel to push/pull camera to move in/out of the hypersphere.",
    }
};
const polytopes = examples.find(v => v.group === "geoms").child.find(v => v.group === "polytopes").child;
polytopes.filter(
    v => v.target ? v.target.startsWith("cwmesh::") : false
).forEach(v => {
    info[v.target] = {
        "zh": `<b>控制：轨迹球模式</b><br>${v.zh}。按大键盘的数字0、1、2、3键可分别切换显示/隐藏该多胞体的顶点、棱、面、胞。`,
        "en": `<b>Control: Trackball mode</b><br>Polytope ${v.en}. Press keyboard digital 0, 1, 2, 3 keys to show / hide vertices, edges, faces, cells of this polytope respectively.`,
    }
});
polytopes.filter(
    v => v.group
).forEach(k => k.child.forEach(v => {
    info[v.target] = {
        "zh": `<b>控制：轨迹球模式</b><br>${v.zh}。按大键盘的数字0、1、2、3键可分别切换显示/隐藏该多胞体的顶点、棱、面、胞。`,
        "en": `<b>Control: Trackball mode</b><br>Polytope ${v.en.replace("Tr-", "Trucated ").replace("Bitr-", "Bitrucated ")}. Press keyboard digital 0, 1, 2, 3 keys to show / hide vertices, edges, faces, cells of this polytope respectively.`,
    }
})
);