const defaultHTML = { zh: '<canvas></canvas>', en: '<canvas></canvas>' };
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
const renderer = new tesserxel.render.SliceRenderer(gpu);`
};
const hello201 = {
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
// Fragment shader code: this code specifies that the tetrahedron's color is pure red
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
};
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
const hello202 = {
    html: defaultHTML,
    js: {
        zh: hello20xHeader.zh + hello202_common, en: hello20xHeader.en + hello202_common.replace("这是原来的四面体顶点输出", "This is the original tetrahedron vertex output").replace("这是新加入的顶点颜色输出，用@location(0)修饰它以便在后面的片元着色器中访问", "This is the newly added vertex color output, decorated with @location(0) so it can be accessed in the fragment shader later")
    }
};
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
const hello203 = {
    html: defaultHTML,
    js: {
        zh: hello20xHeader.zh + hello203_common, en: hello20xHeader.en + hello203_common
            .replace("声明一个类型为mat4x4f的Uniform变量，并通过修饰符指定其位于第一组的第0个绑定位置", "Declare a uniform variable of type mat4x4f and specify its binding at group 1, binding 0 via decorators")
            .replace("通过矩阵乘法来旋转四面体", "Rotate the tetrahedron using matrix multiplication")
            .replace("告诉这块缓冲区的用途：1.用于Uniform变量, 2.可写入", "Specify the usage of this buffer: 1. for uniform variables, 2. writable")
            .replace("用viewMatJsBuffer的内容来初始化这块缓冲区", "Initialize this buffer with the contents of viewMatJsBuffer")
            .replace("保存旋转的角度", "Store the rotation angle")
            .replace("每一帧角度增加0.01弧度", "Increase the angle by 0.01 radians each frame")
            .replace("通过矩阵旋转公式将四面体的x、z坐标进行旋转，y、w坐标不变", "Rotate the tetrahedron's x and z coordinates using the rotation matrix formula, keeping y and w unchanged")
            .replace("调用WebGPU API的writeBuffer方法，将Javascript数据写入GPU中的缓冲区", "Call the WebGPU API writeBuffer method to write JavaScript data into the GPU buffer")
            .replace("这里我们通过刚才定义的viewMatBindGroup指定着色器中相应数据与GPU缓冲区的绑定关系", "Here we use the previously defined viewMatBindGroup to bind the corresponding shader data to the GPU buffer")
            .replace("继续绘制下一帧", "Continue to draw the next frame")
    }
};

export { hello201, hello202, hello203 };
