let examples = [
    {
        group: "geoms", zh: "几何体", en: "Geometries",
        child: [
            { target: "shapes::tesseract", zh: "超立方体", en: "Tesseract (Hypercube)" },
            { target: "shapes::tesseract_ortho", zh: "超立方体（正交投影）", en: "Tesseract (Orthographic Projection)" },
            { target: "shapes::spheritorus", zh: "球环", en: "Spheritorus" },
            { target: "shapes::torisphere", zh: "环球", en: "Torisphere" },
            { target: "shapes::tiger", zh: "双圆环", en: "Tiger (Duotorus)" },
            { target: "shapes::glome", zh: "超球", en: "Glome (Hyphersphere)" },
            { target: "shapes::suzanne3d", zh: "猴头放样", en: "Lofted Suzanne" },
            { target: "shapes::directproduct", zh: "直积形", en: "Direct Product" },
        ]
    },
    {
        group: "world", zh: "四维场景", en: "4D Scenes",
        child: [
            { target: "instanced_cubes", zh: "实例化多方块", en: "Instanced Hypercubes" },
            { target: "city_highway", zh: "城市高速", en: "City Highway" },
            // { target: "navigation", zh: "四维星球导航", en: "Navigation On 4D Planet" },
        ]
    },
    {
        group: "phy", zh: "物理世界", en: "Physics World",
        child: [
            { target: "forces::spring_rope", zh: "弹簧绳", en: "Rope with Springs" },
            { target: "rigids::rigid_test", zh: "刚体测试", en: "Rigid Body Test" },
            { target: "rigids::st_pile", zh: "球环堆", en: "Spheritorus Pile" },
            { target: "pde::wave_eq", zh: "三维波动方程", en: "Wave Equation" },
            { target: "pde::river_evolution", zh: "河流演化", en: "River Evolution" },
            { target: "pde::erosion", zh: "流水侵蚀（试验）", en: "Hydraulic Erosion (Experimental)" },
            {
                group: "rigid_chain", zh: "刚体链", en: "Rigid Chains",
                child: [
                    { target: "rigids::st_ts_chain", zh: "环球球环链", en: "ST-TS Chain" },
                    { target: "rigids::tg_tg_chain", zh: "双圆环链", en: "Tiger(Duotorus) Chain" },
                    { target: "rigids::mix_chain", zh: "杂环链", en: "Mixed Chain" },
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
            }
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
        group: "dev", zh: "开发示例", en: "Develop Examples",
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
            { target: "voxeltest::rasterizer", zh: "四面体体素光栅化器演示", en: "Tetrahedra Voxel Rasterizer Demo" },
        ]
    },

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
        "zh": "<b>控制：自由飞行模式</b><br>Mandelbulb分形的第一种类比。Mandelbulb分形建立在球坐标系之上。四维极座标系统有两种，该分形采用Hopf坐标。",
        "en": "The first analogue of Mandelbulb. The construction of 3D Mandelbulb is based on spherical coordinate. In 4D, there are two similar coordinate system. Hopf coordinate is used for this fractal.",
    },
    mandelbulb_spherical: {
        "zh": "<b>控制：自由飞行模式</b><br>Mandelbulb分形的第二种类比。Mandelbulb分形建立在球坐标系之上。四维极座标系统有两种，该分形采用球极坐标。",
        "en": "The second analogue of Mandelbulb. The construction of 3D Mandelbulb is based on spherical coordinate. In 4D, there are two similar coordinate system. Spherical polar coordinate is used for this fractal.",
    },
    julia_quaternion: {
        "zh": "<b>控制：自由飞行模式</b><br>使用四元数的Julia集。迭代公式为：z->z<sup>2</sup>+(-0.125-0.256<i>i</i>+0.847<i>j</i>+0.0895<i>k</i>)",
        "en": "<b>Control: Free fly mode.</b><br>Julia set with quaternion number. The iteration fomular is: z->z<sup>2</sup>+(-0.125-0.256<i>i</i>+0.847<i>j</i>+0.0895<i>k</i>)"
    },
    city_highway: {
        "zh": "四维世界的地面是三维的，人们可以在三维地面上修建城市与空间曲线道路。这是一条单边4x3车道的双向道路。",
        "en": "The ground of 4D world is three dimensional, where inhabitants could build city and road by spatial curve. This is a two-way road of 4x3 lanes on each side."
    },
    four_basic_scene: {
        "zh": "使用FOUR绘制一个红色双旋转超立方体。类似于3D渲染中的ThreeJs库与WebGl，tesserxel中的子库Four能够帮您隐藏底层渲染逻辑，快速构建四维场景。详见源码FourBasicScene.ts。",
        "en": `Rendering a redish double rotating hypercube by library "Four". Analogue to ThreeJs and WebGl for 3D rendering, tessexel's sub-library "Four" helps you hide low-level render implementations in order to build 4D scene fastly. detail can be found in source file FourBasicScene.ts.`
    },
    four_materials: {
        "zh": "四维常见材质灯光展示。注意四维空间中的点光源随距离呈三次方衰减，因此会出现即使光源周围很亮但稍远处就很黑的现象。子库Four中，物体材质使用节点递归定义，以便程序化生成贴图，解决常规3D贴图内存占用大的问题。",
        "en": "Common materials and lightings in 4D. Note that point lights in 4D decays with the inverse cubic law. This could cause bright around the light source, but get dark rapidly in a distance. In the sub-library Four, the object material is defined recursively using nodes to generate textures procedurally and solve the problem of large memory usage of conventional 3D textures."
    },
    hello_tetra1: {
        "zh": "除非采用光线跟踪，Tesserxel绘制的最小单元就是四面体。这是绘制一个四面体的最简单代码示例。",
        "en": "This is a simple case for rendering a tetrahedron with Tesserxel."
    },
    hello_tetra2: {
        "zh": "类似三维渲染管线，顶点着色器将数据插值传递给片元着色器以实现顶点颜色插值。",
        "en": "Like in 3D standard rendering pipeline, vertex shader does intterpolation and transfer data to fragment shader to implement smooth coloring."
    },
    hello_tetra3: {
        "zh": "通过WebGPU中的binding group设置Uniform变量，在每帧渲染时通过传递矩阵实现旋转。注意要从group(1)开始，因为group(0)被Tesserxel内部占用。",
        "en": "Seting up uniform with binding group in WebGPU. In each frame, update rotation matrix to uniform. Attention that one must start with group(1), because group(0) is occupied by internal usage with Tesserxel."
    },
    st_pile: {
        "zh": "超立方体房间中将不断掉下许多球环。使用鼠标左键发射超球轰击它们。",
        "en": "Spheritori are dropped in the tesseract shaped room. Click left mouse button to fire glomes and hit them."
    },
    st_ts_chain: {
        "zh": "球环与环球交错组成的链。使用鼠标左键发射超球轰击它们。",
        "en": "A Chain made of spheritorus and torusphere alternatively. Click left mouse button to fire glomes and hit them."
    },
    tg_tg_chain: {
        "zh": "大小双圆环交错组成的链。使用鼠标左键发射超球轰击它们。",
        "en": "A Chain made of Big and small tigers (doutorus) alternatively. Click left mouse button to fire glomes and hit them."
    },
    mix_chain: {
        "zh": "双圆环可以同时匹配球环与环球的孔，它可以作为锁链的“万能”连接部件。使用鼠标左键发射超球轰击它们。",
        "en": "Tigers (doutorus) can match both holes of spheritorus and torisphere, hence they can be used as universal components for constructing chains. Click left mouse button to fire glomes and hit them."
    },
    rigid_test: {
        "zh": "三维的地面上将不断掉下超立方体。使用鼠标左键发射超球轰击它们。",
        "en": "Tesseracts are dropped on 3D ground. Click left mouse button to fire glomes and hit them."
    },
    spring_rope: {
        "zh": "由胡克定律弹簧模型模拟的绳子，采用四阶显式龙格库塔积分器求解。",
        "en": "A rope simulated by spring model with hook's law, solved with 4th order explicit Runge-Kutta method."
    },
    wave_eq: {
        "zh": "求解环面T^3上的三维波动方程描述的4个干涉波源。",
        "en": "Solve wave equation of 4 interferenced wave source on T3 manifold."
    },
    erosion: {
        "zh": "通过降雨模拟四维世界中的河流演化。地形由三维单形分形噪声生成。",
        "en": "River evolution simulated by rain fall. Terrain is generated by fractal 3d simplex noise."
    },
    e_charge: {
        "zh": "静电点电荷模拟。红球与蓝球分别带有等量异种电荷，静电力随距离三次方衰减。",
        "en": "Simulation of static electric charge. Red and blue balls have the same amount of charge but with different signs. The decay of electric force is inverse-cubic by distance."
    },
    e_dipole: {
        "zh": "静电偶极子模拟。每个小球的红蓝两部分均带不同种电荷。",
        "en": "Simulation of static electric dipole. Red and blue parts of each ball have different sign of charge."
    },
    m_dipole: {
        "zh": "磁偶极子模拟。磁场由无穷小环形电流产生，方向由偶极子球上的蓝色圆周标出，红色圆周为其绝对垂直方向。",
        "en": "Simulation of magnetic dipole. Magnetic field is generated by infinitesimal current loop whose direction is marked by blue circle on the ball. Red circle is perpendicular to the current loop."
    },
    m_dipole_dual: {
        "zh": "对偶磁偶极子为两个绝对垂直的等大环形电流的磁场叠加。对偶磁偶极子按手性可分为互为镜像的自对偶与反自对偶磁偶极子。同种对偶磁偶极子之间因两个线圈受力抵消，进而无相互作用力。",
        "en": "Dual magnetic dipole is constructed by two perpendicular current loop with same amount. It can be categorized into two different chiral class: self-dual and anti-self-dual dipole. dipoles with the same chirality have no interactions since force applyed by perpendicular current loops actually cancel each other."
    },

};