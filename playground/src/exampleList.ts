type LanguageLabel = { zh: string; en: string };
type ExampleCode = { "html": LanguageLabel; "js": LanguageLabel };
type ExampleItem = { type: "item"; label: LanguageLabel; example: ExampleCode };
type ExampleSubmenu = { type: "submenu"; label: LanguageLabel; children: Array<ExampleItem> };
type Example = ExampleItem | ExampleSubmenu;
const defaultHTML = { zh: '<canvas></canvas>', en: '<canvas></canvas>' };
const defaultCode = { html: defaultHTML, js: { zh: "// 在此编写 JavaScript", en: "// Write JavaScript here" } };
const hello100: ExampleCode = {
    html: {
        zh: `<!-- Tesserxel Playground 已经自动引入了importmap并标记了type="module"，因此不需要下面的代码。如果自己写工程则需要。
<script type="importmap">
{  
  "imports": {
    "tesserxel": "../build/esm/tesserxel.js",
    "tesserxel/math": "../build/esm/math/math.js"
  }
}  
</script>
<script type="module">
// 在此写js代码
</script>
-->
<!-- 创建画布对象 -->
<canvas></canvas>`,
        en: `<!-- Tesserxel Playground has already included the importmap and marked type="module",
     so the following code is not needed. If you set up your own project, it is required.
<script type="importmap">
{  
  "imports": {
    "tesserxel": "../build/esm/tesserxel.js",
    "tesserxel/math": "../build/esm/math/math.js"
  }
}  
</script>
<script type="module">
// Write JS code here
</script>
-->
<!-- create canvas element -->
<canvas></canvas>`
    },
    js: {
        zh: `import {math} from "tesserxel"
// 默认定义一个四维向量需要这样书写：
let v1 = new math.Vec4(1,2,3,4);
console.log(v1);
// 引入捷径可以简化
const Vec4 = math.Vec4;
let v2 = new Vec4(2,3,4,5);
console.log(v2);`, en: `import {math} from "tesserxel"
// By default, defining a 4D vector requires this syntax:
let v1 = new math.Vec4(1,2,3,4);
console.log(v1);
// Introducing a shortcut can simplify it
const Vec4 = math.Vec4;
let v2 = new Vec4(2,3,4,5);
console.log(v2);
` },
};
const hello101: ExampleCode = {
    html: {
        zh: `<!-- 引入umd格式的tesserxel.js文件，这将在javascript中引入名叫tesserxel的全局变量 -->
<script src="https://wxyhly.github.io/tesserxel/build/tesserxel.js" type="text/javascript"></script>
<!-- 创建画布对象 -->
<canvas></canvas>`,
        en: `<!-- load tesserxel.js file of UMD format, this will introduce a global variable named tesserxel in JavaScript -->
<script src="https://wxyhly.github.io/tesserxel/build/tesserxel.js" type="text/javascript"></script>
<!-- create canvas element -->
<canvas></canvas>`
    },
    js: {
        zh: `// 默认定义一个四维向量需要这样书写：
let v1 = new tesserxel.math.Vec4(1,2,3,4);
console.log(v1);
// 引入捷径可以简化
const Vec4 = tesserxel.math.Vec4;
let v2 = new Vec4(2,3,4,5);
console.log(v2);`, en: `// By default, defining a 4D vector requires this syntax:
let v1 = new tesserxel.math.Vec4(1,2,3,4);
console.log(v1);
// Introducing a shortcut can simplify it
const Vec4 = tesserxel.math.Vec4;
let v2 = new Vec4(2,3,4,5);
console.log(v2);
` },
};
const hello102: ExampleCode = {
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
app.scene.setBackgroudColor({ r: 1.0, g: 1.0, b: 1.0, a: 1.0 });
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
app.scene.setBackgroudColor({ r: 1.0, g: 1.0, b: 1.0, a: 1.0 });
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

const hello103: ExampleCode = {
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
// Don’t forget to add the light to the scene
app.scene.add(dirLight);
// Add an ambient light to avoid the backlit side being too dark.
app.scene.add(new FOUR.AmbientLight(0.3));`)
    }
};
const hello104: ExampleCode = {
    html: defaultHTML,
    js: {
        zh: hello102.js.zh.replace(/默认的四维场景背景[\s\S]+setBackgroudColor.+a: 1\.0 \}\);/, "这里删掉了背景颜色设置，恢复至默认的黑色").replace(
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
app.scene.add(pLight);`), en: hello102.js.en.replace(/The default background color[\s\S]+setBackgroudColor.+a: 1\.0 \}\);/, "Here we removed the background color setting, got default black color").replace(
                "Define the geometry data of a tesseract (hypercube)", "Define the geometry data of a tiger (duotorus)"
            ).replace("TesseractGeometry", "TigerGeometry"
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
// Don’t forget to add the light to the scene
app.scene.add(pLight);`)
    }
};
const hello20xHeader = {
    zh: `import * as tesserxel from "tesserxel"
const gpu = await new tesserxel.render.GPU().init();
const canvas = document.querySelector("canvas");
// 手动设置canvas的大小
const width = window.innerWidth * window.devicePixelRatio;
const height = window.innerHeight * window.devicePixelRatio;
canvas.width = width;
canvas.height = height;
canvas.style.width = "100%";
canvas.style.height = "100%";
// 通过刚才建立的GPU对象得到关于该画布的上下文
const context = gpu.getContext(canvas);
// 通过刚才建立的GPU对象得到切片渲染器
const renderer = new tesserxel.render.SliceRenderer(gpu);
`, en: `import * as tesserxel from "tesserxel" 
const gpu = await new tesserxel.render.GPU().init();
const canvas = document.querySelector("canvas");
// Manually set the canvas size
const width = window.innerWidth * window.devicePixelRatio;
const height = window.innerHeight * window.devicePixelRatio;
canvas.width = width;
canvas.height = height;
canvas.style.width = "100%";
canvas.style.height = "100%";
// Get the context of the canvas using the GPU object we just created
const context = gpu.getContext(canvas);
// Get the slice renderer using the GPU object we just created
const renderer = new tesserxel.render.SliceRenderer(gpu);`}
const hello201: ExampleCode = {
    html: defaultHTML,
    js: {
        zh: hello20xHeader.zh + `
// 顶点着色器代码：这段代码通过一个4x4的矩阵定义了一个四面体的4个顶点坐标
const vertexShaderCode = \`
@tetra fn main() -> @builtin(position) mat4x4f {
    return mat4x4f (
        1.0, 1.0, 1.0, -1.0,
        -1.0,-1.0, 1.0, -1.0,
        1.0,-1.0,-1.0, -1.0,
        -1.0, 1.0,-1.0, -1.0
    );
}
\`;
// 片元着色器代码：这段代码指定了四面体的颜色是纯红色。
const fragmentShaderCode = \`
@fragment fn main() -> @location(0) vec4f {
    return vec4f (1.0,0.0,0.0,1.0);
}
\`;
// 有了顶点着色器和片段着色器，我们将它们串起来编译成可执行的渲染管线。注意该编译方法是异步的
const pipeline = await renderer.createTetraSlicePipeline({
    vertex: {
        code: vertexShaderCode,
        entryPoint: "main"
    },
    fragment: {
        code: fragmentShaderCode,
        entryPoint: "main"
    }
});
await renderer.init();
renderer.render(context, (renderState) => {
    // 指定用之前定义的渲染管线，准备开始绘制四面体
    renderState.beginTetras(pipeline);
    // sliceTetras函数开始绘制四面体，null表示不需要顶点缓冲数据，1表示绘制一个四面体
    renderState.sliceTetras(null, 1);
    // 结束本次渲染管线，绘制完毕
    renderState.drawTetras();
});`, en: hello20xHeader.en + `
// Vertex shader code: this code defines the 4 vertices of a tetrahedron
// using a 4x4 matrix
const vertexShaderCode = \`
@tetra fn main() -> @builtin(position) mat4x4f {
    return mat4x4f (
        1.0, 1.0, 1.0, -1.0,
        -1.0,-1.0, 1.0, -1.0,
        1.0,-1.0,-1.0, -1.0,
        -1.0, 1.0,-1.0, -1.0
    );
}
\`;
// Fragment shader code: this code specifies that the tetrahedron’s color is pure red
const fragmentShaderCode = \`
@fragment fn main() -> @location(0) vec4f {
    return vec4f (1.0,0.0,0.0,1.0);
}
\`;
// With the vertex shader and fragment shader ready,
// we compile them together into an executable rendering pipeline.
// Note: this compilation method is asynchronous
const pipeline = await renderer.createTetraSlicePipeline({
    vertex: {
        code: vertexShaderCode,
        entryPoint: "main"
    },
    fragment: {
        code: fragmentShaderCode,
        entryPoint: "main"
    }
});
await renderer.init();
renderer.render(context, (renderState) => {
    // Specify the previously defined rendering pipeline to start drawing the tetrahedron
    renderState.beginTetras(pipeline);
    // The sliceTetras function begins drawing the tetrahedron.
    // null means no vertex buffer data is needed, and 1 means to draw one tetrahedron
    renderState.sliceTetras(null, 1);
    // End the rendering pipeline, drawing completed
    renderState.drawTetras();
});
`
    }
}
const hello202_common = `const vertexShaderCode = \`
struct TetraOutput{
    // 这是原来的四面体顶点输出
    @builtin(position) position: mat4x4f,
    // 这是新加入的顶点颜色输出，用@location(0)修饰它以便在后面的片元着色器中访问
    @location(0) color: mat4x4f,
}
@tetra fn main() -> TetraOutput {
    return TetraOutput(
        mat4x4f (
            1.0, 1.0, 1.0, -1.0,
            -1.0,-1.0, 1.0, -1.0,
            1.0,-1.0,-1.0, -1.0,
            -1.0, 1.0,-1.0, -1.0
        ),
        mat4x4f (
            0.0, 0.0, 1.0, 1.0, // blue
            0.0, 1.0, 0.0, 1.0, // green
            1.0, 0.0, 0.0, 1.0, // red
            1.0, 1.0, 1.0, 1.0, // white
        ),
    );
}
\`;
const fragmentShaderCode = \`
@fragment fn main(@location(0) color: vec4f) -> @location(0) vec4f {
    return color;
}
\`;
const pipeline = await renderer.createTetraSlicePipeline({
    vertex: {
        code: vertexShaderCode,
        entryPoint: "main"
    },
    fragment: {
        code: fragmentShaderCode,
        entryPoint: "main"
    }
});
await renderer.init();
renderer.render(context, (renderState) => {
    renderState.beginTetras(pipeline);
    renderState.sliceTetras(null, 1);
    renderState.drawTetras();
});
`;
const hello202: ExampleCode = {
    html: defaultHTML,
    js: {
        zh: hello20xHeader.zh + hello202_common, en: hello20xHeader.en + hello202_common.replace(
            "这是原来的四面体顶点输出", "This is the original tetrahedron vertex output"
        ).replace(
            "这是新加入的顶点颜色输出，用@location(0)修饰它以便在后面的片元着色器中访问", "This is the newly added vertex color output, decorated with @location(0) so it can be accessed in the fragment shader later"
        )
    }
}

const hello203_common = `const vertexShaderCode = \`
// 声明一个类型为mat4x4f的Uniform变量，并通过修饰符指定其位于第一组的第0个绑定位置
@group(1) @binding(0) var<uniform> viewMat: mat4x4f;
struct TetraOutput{
    @builtin(position) position: mat4x4f,
    @location(0) color: mat4x4f,
}
@tetra fn main() -> TetraOutput {
    return TetraOutput(
        // 通过矩阵乘法来旋转四面体
        viewMat * mat4x4f (
            1.0, 1.0, 1.0, -1.0,
            -1.0,-1.0, 1.0, -1.0,
            1.0,-1.0,-1.0, -1.0,
            -1.0, 1.0,-1.0, -1.0
        ),
        mat4x4f (
            0.0, 0.0, 1.0, 1.0, // blue
            0.0, 1.0, 0.0, 1.0, // green
            1.0, 0.0, 0.0, 1.0, // red
            1.0, 1.0, 1.0, 1.0, // white
        ),
    );
}
\`;
const fragmentShaderCode = \`
@fragment fn main(@location(0) color: vec4f) -> @location(0) vec4f {
    return color;
}
\`;
const pipeline = await renderer.createTetraSlicePipeline({
    vertex: {
        code: vertexShaderCode,
        entryPoint: "main"
    },
    fragment: {
        code: fragmentShaderCode,
        entryPoint: "main"
    }
});
const viewMatJsBuffer = new Float32Array(16);
const viewMatGpuBuffer = gpu.createBuffer(
    // 告诉这块缓冲区的用途：1.用于Uniform变量, 2.可写入
    GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    // 用viewMatJsBuffer的内容来初始化这块缓冲区
    viewMatJsBuffer
);
const viewMatBindGroup = renderer.createVertexShaderBindGroup(pipeline, 1, [viewMatGpuBuffer]);
let angle = 0; // 保存旋转的角度
await renderer.init();
function loop() {
    angle += 0.01; // 每一帧角度增加0.01弧度
    // 通过矩阵旋转公式将四面体的x、z坐标进行旋转，y、w坐标不变
    let s = Math.sin(angle), c = Math.cos(angle);
    viewMatJsBuffer.set([
        c, 0, s, 0,
        0, 1, 0, 0,
        -s, 0, c, 0,
        0, 0, 0, 1
    ]);
    // 调用WebGPU API的writeBuffer方法，将Javascript数据写入GPU中的缓冲区
    gpu.device.queue.writeBuffer(viewMatGpuBuffer, 0, viewMatJsBuffer);

    renderer.render(context, (renderState) => {
        renderState.beginTetras(pipeline);
        // 这里我们通过刚才定义的viewMatBindGroup指定着色器中相应数据与GPU缓冲区的绑定关系
        renderState.sliceTetras(viewMatBindGroup, 1);
        renderState.drawTetras();
    });
    // 继续绘制下一帧
    window.requestAnimationFrame(loop);
}
loop();`;
const hello203: ExampleCode = {
    html: defaultHTML,
    js: {
        zh: hello20xHeader.zh + hello203_common, en: hello20xHeader.en + hello203_common
            .replace("声明一个类型为mat4x4f的Uniform变量，并通过修饰符指定其位于第一组的第0个绑定位置",
                "Declare a uniform variable of type mat4x4f and specify its binding at group 1, binding 0 via decorators")
            .replace("通过矩阵乘法来旋转四面体",
                "Rotate the tetrahedron using matrix multiplication")
            .replace("告诉这块缓冲区的用途：1.用于Uniform变量, 2.可写入",
                "Specify the usage of this buffer: 1. for uniform variables, 2. writable")
            .replace("用viewMatJsBuffer的内容来初始化这块缓冲区",
                "Initialize this buffer with the contents of viewMatJsBuffer")
            .replace("保存旋转的角度",
                "Store the rotation angle")
            .replace("每一帧角度增加0.01弧度",
                "Increase the angle by 0.01 radians each frame")
            .replace("通过矩阵旋转公式将四面体的x、z坐标进行旋转，y、w坐标不变",
                "Rotate the tetrahedron's x and z coordinates using the rotation matrix formula, keeping y and w unchanged")
            .replace("调用WebGPU API的writeBuffer方法，将Javascript数据写入GPU中的缓冲区",
                "Call the WebGPU API writeBuffer method to write JavaScript data into the GPU buffer")
            .replace("这里我们通过刚才定义的viewMatBindGroup指定着色器中相应数据与GPU缓冲区的绑定关系",
                "Here we use the previously defined viewMatBindGroup to bind the corresponding shader data to the GPU buffer")
            .replace("继续绘制下一帧",
                "Continue to draw the next frame")
    }
}

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
        label: { zh: "你好四面体", en: "Hello Tetrahedron" },
        children: [
            { type: "item", label: { zh: "第一个四面体", en: "First Tetrahedron" }, example: hello201 },
            { type: "item", label: { zh: "添加顶点颜色", en: "Add Vertex Color" }, example: hello202 },
            { type: "item", label: { zh: "四面体转起来！", en: "Rotate Tetrahedron!" }, example: hello203 },
        ],
    },
];
export default examples;