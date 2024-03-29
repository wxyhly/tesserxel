import * as tesserxel from "../../build/tesserxel.js"
export namespace hello_tetra1 {
    export async function load() {
        const gpu = await new tesserxel.render.GPU().init();
        const canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
        const context = gpu.getContext(canvas);
        const renderer = new tesserxel.render.SliceRenderer(gpu);
        const vertexShaderCode = `
            @tetra fn main() -> @builtin(position) mat4x4<f32> {
                return mat4x4<f32> (
                     1.0, 1.0, 1.0, -1.0,
                    -1.0,-1.0, 1.0, -1.0,
                     1.0,-1.0,-1.0, -1.0,
                    -1.0, 1.0,-1.0, -1.0
                );
            }
            `;
        const fragmentShaderCode = `
            @fragment fn main() -> @location(0) vec4<f32> {
                return vec4<f32> (1.0,0.0,0.0,1.0);
            }
            `;
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
        const width = window.innerWidth * window.devicePixelRatio;
        const height = window.innerHeight * window.devicePixelRatio;
        canvas.width = width;
        canvas.height = height;
        await renderer.init();
        renderer.render(context, (renderState) => {
            renderState.beginTetras(pipeline);
            renderState.sliceTetras(null, 1);
            renderState.drawTetras();
        });
    }
}
export namespace hello_tetra2 {
    export async function load() {
        const gpu = await new tesserxel.render.GPU().init();
        const canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
        const context = gpu.getContext(canvas);
        const renderer = new tesserxel.render.SliceRenderer(gpu);
        const vertexShaderCode = `
            struct TetraOutput{
                @builtin(position) position: mat4x4<f32>,
                @location(0) color: mat4x4<f32>,
            }
            @tetra fn main() -> TetraOutput {
                return TetraOutput(
                    mat4x4<f32> (
                        1.0, 1.0, 1.0, -1.0,
                        -1.0,-1.0, 1.0, -1.0,
                        1.0,-1.0,-1.0, -1.0,
                        -1.0, 1.0,-1.0, -1.0
                    ),
                    mat4x4<f32> (
                        0.0, 0.0, 1.0, 1.0, // blue
                        0.0, 1.0, 0.0, 1.0, // green
                        1.0, 0.0, 0.0, 1.0, // red
                        1.0, 1.0, 1.0, 1.0, // white
                    ),
                );
            }
            `;
        const fragmentShaderCode = `
            @fragment fn main(@location(0) color: vec4<f32>) -> @location(0) vec4<f32> {
                return color;
            }
            `;
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
        const width = window.innerWidth * window.devicePixelRatio;
        const height = window.innerHeight * window.devicePixelRatio;
        canvas.width = width;
        canvas.height = height;
        await renderer.init();
        renderer.render(context, (renderState) => {
            renderState.beginTetras(pipeline);
            renderState.sliceTetras(null, 1);
            renderState.drawTetras();
        });
    }
}
export namespace hello_tetra3 {
    export async function load() {
        const gpu = await new tesserxel.render.GPU().init();
        const canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
        const context = gpu.getContext(canvas);
        const renderer = new tesserxel.render.SliceRenderer(gpu);

        const vertexShaderCode = `
            @group(1) @binding(0) var<uniform> viewMat: mat4x4<f32>;
            struct TetraOutput{
                @builtin(position) position: mat4x4<f32>,
                @location(0) color: mat4x4<f32>,
            }
            @tetra fn main() -> TetraOutput {
                return TetraOutput(
                    viewMat * mat4x4<f32> (
                        1.0, 1.0, 1.0, -1.0,
                        -1.0,-1.0, 1.0, -1.0,
                        1.0,-1.0,-1.0, -1.0,
                        -1.0, 1.0,-1.0, -1.0
                    ),
                    mat4x4<f32> (
                        0.0, 0.0, 1.0, 1.0, // blue
                        0.0, 1.0, 0.0, 1.0, // green
                        1.0, 0.0, 0.0, 1.0, // red
                        1.0, 1.0, 1.0, 1.0, // white
                    ),
                );
            }
            `;
        const fragmentShaderCode = `
            @fragment fn main(@location(0) color: vec4<f32>) -> @location(0) vec4<f32> {
                return color;
            }
            `;
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
            GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            viewMatJsBuffer
        );
        const viewMatBindGroup = renderer.createVertexShaderBindGroup(pipeline, 1, [viewMatGpuBuffer]);
        const width = window.innerWidth * window.devicePixelRatio;
        const height = window.innerHeight * window.devicePixelRatio;
        canvas.width = width;
        canvas.height = height;
        let angle = 0;
        await renderer.init();
        function loop() {
            angle += 0.01;
            let s = Math.sin(angle), c = Math.cos(angle);
            viewMatJsBuffer.set([
                c, 0, s, 0,
                0, 1, 0, 0,
                -s, 0, c, 0,
                0, 0, 0, 1
            ]);
            gpu.device.queue.writeBuffer(viewMatGpuBuffer, 0, viewMatJsBuffer);

            renderer.render(context, (renderState) => {
                renderState.beginTetras(pipeline);
                renderState.sliceTetras(viewMatBindGroup, 1);
                renderState.drawTetras();
            });
            window.requestAnimationFrame(loop);
        }
        loop();
    }
}