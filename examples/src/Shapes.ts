namespace examples {
    class ShapesApp {
        vertCode = `
        // vertex attributes, regard four vector4 for vertices of one tetrahedra as matrix4x4 
        struct InputType{
            @location(0) pos: mat4x4<f32>,
            @location(1) normal: mat4x4<f32>,
            @location(2) uvw: mat4x4<f32>,
        }
        // output position in camera space and data sent to fragment shader to be interpolated
        struct OutputType{
            @builtin(position) pos: mat4x4<f32>,
            @location(0) normal: mat4x4<f32>,
            @location(1) uvw: mat4x4<f32>,
        }
        // we define an affineMat to store rotation and transform since there's no mat5x5 in wgsl
        struct AffineMat{
            matrix: mat4x4<f32>,
            vector: vec4<f32>,
        }
        // remember that group(0) is occupied by internal usage and binding(0) to binding(2) are occupied by vertex attributes
        // so we start here by group(1) binding(3)
        @group(1) @binding(3) var<uniform> camMat: AffineMat;
        // apply affineMat to four points
        fn apply(afmat: AffineMat, points: mat4x4<f32>) -> mat4x4<f32>{
            let biais = mat4x4<f32>(afmat.vector, afmat.vector, afmat.vector, afmat.vector);
            return afmat.matrix * points + biais;
        }
        // tell compiler that this is tetra slice pipeline's entry function by '@tetra'
        @tetra fn main(input : InputType) -> OutputType{
            return OutputType(apply(camMat,input.pos), camMat.matrix * input.normal, input.uvw);
        }
        `;
        fragHeaderCode = `
        // receive data from vertex output, these values are automatically interpolated for every fragment
        struct fInputType{
            @location(0) normal : vec4<f32>,
            @location(1) uvw : vec4<f32>,
        };
        // a color space conversion function
        fn hsb2rgb( c:vec3<f32> )->vec3<f32>{
            let a = fract(
                c.x+vec3<f32>(0.0,4.0,2.0)/6.0
            );
            var rgb = clamp(abs(a*6.0-vec3<f32>(3.0))-vec3<f32>(1.0),
                vec3<f32>(0.0),
                vec3<f32>(1.0)
            );
            rgb = rgb*rgb*(3.0-rgb * 2.0);
            return c.z * mix(vec3<f32>(1.0), rgb, c.y);
        }
        `;
        gpu: tesserxel.renderer.GPU;
        renderer: tesserxel.renderer.TetraRenderer;
        trackBallController: tesserxel.controller.TrackBallController;
        retinaController: tesserxel.controller.RetinaController;
        ctrlRegistry: tesserxel.controller.ControllerRegistry;
        mesh: tesserxel.mesh.TetraMesh;
        pipeline: tesserxel.renderer.TetraSlicePipeline;
        canvas: HTMLCanvasElement;
        context: GPUCanvasContext;
        vertBindGroup: GPUBindGroup;
        camBuffer: GPUBuffer;
        async init(fragmentShaderCode: string, mesh: tesserxel.mesh.TetraMesh) {
            this.gpu = await tesserxel.getGPU();
            this.canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
            this.context = this.gpu.getContext(this.canvas);
            this.renderer = await new tesserxel.renderer.TetraRenderer().init(this.gpu, this.context, {
                // if this is set true, alpha blending will be more accurate but costy
                enableFloat16Blend: false,
                // how many slices are drawn together, this value must be 2^n and it can't be to big for resource limitation
                sliceGroupSize: 8
            });
            // set 4d camera
            this.renderer.set4DCameraProjectMatrix({
                fov: 100, near: 0.01, far: 10
            });
            // create a tetra slice pipeline
            this.pipeline = await this.renderer.createTetraSlicePipeline({
                vertex: { code: this.vertCode, entryPoint: "main" },
                fragment: {
                    code: this.fragHeaderCode + fragmentShaderCode,
                    entryPoint: "main",
                },
                cullMode: "none"
            });
            // vertex attrbutes buffers on gpu
            let positionBuffer = this.gpu.createBuffer(GPUBufferUsage.STORAGE, mesh.position);
            let normalBuffer = this.gpu.createBuffer(GPUBufferUsage.STORAGE, mesh.normal);
            let uvwBuffer = this.gpu.createBuffer(GPUBufferUsage.STORAGE, mesh.uvw);
            // camera affinemat buffer on gpu
            this.camBuffer = this.gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 4 * 4 * 5);
            // bind these buffers to group(1) in pipeline
            this.vertBindGroup = this.renderer.createBindGroup(this.pipeline, 1, [positionBuffer, normalBuffer, uvwBuffer, this.camBuffer]);
            // init a trackball controller in order to drag 4d object by mouse and keys
            this.trackBallController = new tesserxel.controller.TrackBallController();
            // randomize the initial orientation of the object controlled by trackball controller
            this.trackBallController.object.rotation.randset();
            // init a retina controller in order to adjust retina settings interactively like section thumbails and retina render layers
            this.retinaController = new tesserxel.controller.RetinaController(this.renderer);
            this.setSize();
            this.retinaController.mouseButton = null;
            this.ctrlRegistry = new tesserxel.controller.ControllerRegistry(this.canvas, [
                this.trackBallController, this.retinaController
            ], { preventDefault: true, requsetPointerLock: true });
            this.mesh = mesh;
            window.addEventListener("resize", this.setSize.bind(this));
            return this;
        }
        setSize() {
            let width = window.innerWidth * window.devicePixelRatio;
            let height = window.innerHeight * window.devicePixelRatio;
            this.canvas.width = width;
            this.canvas.height = height;
            this.retinaController.setSize({ width, height });
        }
        camMatJSBuffer = new Float32Array(20);
        run() {
            this.ctrlRegistry.update();
            this.trackBallController.object.getAffineMat4().writeBuffer(this.camMatJSBuffer);
            this.gpu.device.queue.writeBuffer(this.camBuffer, 0, this.camMatJSBuffer);
            this.renderer.render(() => {
                this.renderer.beginTetras(this.pipeline);
                this.renderer.sliceTetras(this.vertBindGroup, this.mesh.tetraCount);
                this.renderer.drawTetras();
            });
            window.requestAnimationFrame(this.run.bind(this));
        }
    }
    export namespace tiger {
        export async function load() {
            let fragCode = `
            @fragment fn main(vary: fInputType) -> @location(0) vec4<f32> {
                const ambientLight = vec3<f32>(0.1);
                const frontLightColor = vec3<f32>(5.0,4.6,3.5);
                const backLightColor = vec3<f32>(0.1,1.2,1.4);
                const directionalLight_dir = vec4<f32>(0.1,0.5,0.4,1.0);
                let checkerboard = fract(vary.uvw.xyz *vec3<f32>(40.0, 40.0, 20.0)) - vec3<f32>(0.5);
                let factor = step( checkerboard.x * checkerboard.y * checkerboard.z, 0.0);
                var color:vec3<f32> = mix(hsb2rgb(vec3<f32>(vary.uvw.x,0.7,1.0)), hsb2rgb(vec3<f32>(vary.uvw.y,1.0,0.7)), factor);
                color = color * (
                    frontLightColor * max(0, dot(directionalLight_dir , vary.normal)) + backLightColor * max(0, -dot(directionalLight_dir , vary.normal))
                );
                return vec4<f32>(pow(color,vec3<f32>(0.6))*0.5, 1.0);
            }`;
            let app = await new ShapesApp().init(fragCode, tesserxel.mesh.tetra.tiger(0.5 + Math.random() * 0.1, 32, 0.5, 32, 0.2 + Math.random() * 0.05, 16));
            app.retinaController.toggleSectionConfig(1);
            app.run();
        }
    }
    export namespace glome {
        export async function load() {
            let fragCode = `
            @fragment fn main(vary: fInputType) -> @location(0) vec4<f32> {
                const ambientLight = vec3<f32>(0.1);
                const frontLightColor = vec3<f32>(5.0,4.6,3.5);
                const backLightColor = vec3<f32>(0.1,1.2,1.4);
                const directionalLight_dir = vec4<f32>(0.1,0.5,0.4,-1.0);
                let checkerboard = fract(vary.uvw.z * 4.0) - 0.5;
                let factor = step(checkerboard, 0.0);
                var color:vec3<f32> = mix(hsb2rgb(vec3<f32>(vary.uvw.x,0.7,1.0)), hsb2rgb(vec3<f32>(vary.uvw.y,1.0,0.7)), factor);
                color = color * (
                    frontLightColor * max(0, dot(directionalLight_dir , vary.normal)) + backLightColor * max(0, -dot(directionalLight_dir , vary.normal))
                );
                return vec4<f32>(pow(color,vec3<f32>(0.6))*0.5, mix(0.2,1.0,factor));
            }`;
            let app = await new ShapesApp().init(fragCode, tesserxel.mesh.tetra.glome(1.5, 32, 32, 16));
            let config = app.renderer.getSliceConfig();
            config.opacity = 10.0;
            // retina controller will own the slice config, so we should not call renderer.setSlice() directly
            app.retinaController.setSlice(config);
            app.run();
        }
    }

    export namespace tesseract {
        export async function load() {
            let fragCode = `
            @fragment fn main(vary: fInputType) -> @location(0) vec4<f32> {
                const colors = array<vec3<f32>,8> (
                    vec3<f32>(1, 0, 0),
                    vec3<f32>(1, 1, 0),
                    vec3<f32>(1, 0, 1),
                    vec3<f32>(0, 0, 1),
                    vec3<f32>(1, 0.5, 0),
                    vec3<f32>(0, 0.5, 1),
                    vec3<f32>(0, 1, 1),
                    vec3<f32>(0.6, 0.9, 0.2),
                );
                const radius: f32 = 0.8;
                const ambientLight = vec3<f32>(0.8);
                const frontLightColor = vec3<f32>(5.0,4.6,3.5);
                const backLightColor = vec3<f32>(1.9,2.4,2.8);
                const directionalLight_dir = vec4<f32>(0.1,0.5,0.4,1.0);
                var color:vec3<f32> = vec3(1.0,1.0,1.0);
                var count:f32 = 0;
                count += step(0.8,abs(vary.uvw.x));
                count += step(0.8,abs(vary.uvw.y));
                count += step(0.8,abs(vary.uvw.z));
                if(dot(vary.uvw.xyz,vary.uvw.xyz) < radius * radius * radius || count >= 2.0){
                    color = colors[u32(vary.uvw.w + 0.1)];
                }
                color = color * (
                    ambientLight + frontLightColor * max(0, dot(directionalLight_dir , vary.normal)) + backLightColor * max(0, -dot(directionalLight_dir , vary.normal))
                );
                return vec4<f32>(pow(color,vec3<f32>(0.6))*0.5, 0.2 + f32(count>=2.0));
            }`;
            let app = await new ShapesApp().init(fragCode, tesserxel.mesh.tetra.tesseract);
            let config = app.renderer.getSliceConfig();
            config.opacity = 10.0;
            // retina controller will own the slice config, so we should not call renderer.setSlice() directly
            app.retinaController.setSlice(config);
            app.renderer.set4DCameraProjectMatrix({ fov: 110, near: 0.01, far: 10.0 });
            app.trackBallController.object.rotation.l.set();
            app.trackBallController.object.rotation.r.set();
            app.run();
        }
    }
}