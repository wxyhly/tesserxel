import * as tesserxel from '../../build/tesserxel.js';

// namespace examples {
var hello_tetra1;
(function (hello_tetra1) {
    async function load() {
        const gpu = await new tesserxel.render.GPU().init();
        const canvas = document.getElementById("gpu-canvas");
        const context = gpu.getContext(canvas);
        const renderer = await new tesserxel.render.SliceRenderer().init(gpu, context);
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
        renderer.setSize({ width, height });
        renderer.render(() => {
            renderer.beginTetras(pipeline);
            renderer.sliceTetras(null, 1);
            renderer.drawTetras();
        });
    }
    hello_tetra1.load = load;
})(hello_tetra1 || (hello_tetra1 = {}));
var hello_tetra2;
(function (hello_tetra2) {
    async function load() {
        const gpu = await new tesserxel.render.GPU().init();
        const canvas = document.getElementById("gpu-canvas");
        const context = gpu.getContext(canvas);
        const renderer = await new tesserxel.render.SliceRenderer().init(gpu, context);
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
        renderer.setSize({ width, height });
        renderer.render(() => {
            renderer.beginTetras(pipeline);
            renderer.sliceTetras(null, 1);
            renderer.drawTetras();
        });
    }
    hello_tetra2.load = load;
})(hello_tetra2 || (hello_tetra2 = {}));
var hello_tetra3;
(function (hello_tetra3) {
    async function load() {
        const gpu = await new tesserxel.render.GPU().init();
        const canvas = document.getElementById("gpu-canvas");
        const context = gpu.getContext(canvas);
        const renderer = await new tesserxel.render.SliceRenderer().init(gpu, context);
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
        const viewMatGpuBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, viewMatJsBuffer);
        const viewMatBindGroup = renderer.createVertexShaderBindGroup(pipeline, 1, [viewMatGpuBuffer]);
        const width = window.innerWidth * window.devicePixelRatio;
        const height = window.innerHeight * window.devicePixelRatio;
        canvas.width = width;
        canvas.height = height;
        renderer.setSize({ width, height });
        let angle = 0;
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
            renderer.render(() => {
                renderer.beginTetras(pipeline);
                renderer.sliceTetras(viewMatBindGroup, 1);
                renderer.drawTetras();
            });
            window.requestAnimationFrame(loop);
        }
        loop();
    }
    hello_tetra3.load = load;
})(hello_tetra3 || (hello_tetra3 = {}));
// }

export { hello_tetra1, hello_tetra2, hello_tetra3 };
//# sourceMappingURL=hellotetra.js.map
