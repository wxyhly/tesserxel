namespace examples {
    class ForceApp {
        renderer: tesserxel.renderer.SliceRenderer;
        camController: tesserxel.controller.FreeFlyController;
        retinaController: tesserxel.controller.RetinaController;
        ctrlreg: tesserxel.controller.ControllerRegistry;
        headercode = `
        struct rayOut{
            @location(0) o: vec4<f32>,
            @location(1) d: vec4<f32>
        }
        @group(1) @binding(0) var<uniform> camMat: AffineMat;
        @ray fn mainRay(
            @builtin(ray_direction) rd: vec4<f32>,
            @builtin(ray_origin) ro: vec4<f32>
        ) -> rayOut{
            return rayOut(camMat.matrix*ro+camMat.vector, camMat.matrix*rd);
        }
        {replace}
        @fragment fn mainFragment(@location(0) rayOrigin: vec4<f32>, @location(1) rayDir: vec4<f32>)->@location(0) vec4<f32>{
        return render(ray(rayOrigin, normalize(rayDir)));
        }
        struct ray{
            o: vec4<f32>,
            d: vec4<f32>,
        }
        struct glome{
            p: vec4<f32>,
            r: f32,
            id: u32
        }
        struct plane{
            n: vec4<f32>,
            o: f32,
            id: u32
        }
        struct rotor{
            l: vec4<f32>,
            r: vec4<f32>
        }
        struct obj4{
            p: vec4<f32>,
            r: rotor
        }
        fn quaternionMul(q1:vec4<f32>,q2:vec4<f32>)->vec4<f32>{
            return vec4<f32>(
                q1.x * q2.x - q1.y * q2.y - q1.z * q2.z - q1.w * q2.w,
                q1.x * q2.y + q1.y * q2.x + q1.z * q2.w - q1.w * q2.z,
                q1.x * q2.z - q1.y * q2.w + q1.z * q2.x + q1.w * q2.y,
                q1.x * q2.w + q1.y * q2.z - q1.z * q2.y + q1.w * q2.x
            );
        }
        fn rotate(r:rotor, p:vec4<f32>)->vec4<f32>{
            return quaternionMul(quaternionMul(r.l,p),r.r);
        }
        fn intGlome(r:ray, g:glome)->f32 {
            let oc = r.o - g.p;
            let b = dot(oc, r.d);
            let c = dot(oc, oc) - g.r*g.r;
            var t = b*b - c;
            if(t > 0.0) {
                t = -b - sqrt(t);
            }
            if(t < 0.0) {
                return 10000.0;
            }
            return t;
        }
        fn intPlane(r:ray, p:plane)->f32 {
            let t = (p.o - dot(r.o, p.n)) / dot(r.d, p.n);
            if(t < 0.0) {
                return 10000.0;
            }
            return t;
        }
        `
        async load(code: string,
            genBuffersToBind: (gpu: tesserxel.renderer.GPU) => GPUBuffer[],
            runWorld: (gpu: tesserxel.renderer.GPU) => void,

        ) {
            let gpu = await tesserxel.renderer.createGPU();
            let canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
            let context = gpu.getContext(canvas);
            let renderer = await new tesserxel.renderer.SliceRenderer().init(gpu, context, {
                enableFloat16Blend: false,
                sliceGroupSize: 8
            });
            this.renderer = renderer;
            renderer.setScreenClearColor({ r: 1, g: 1, b: 1, a: 1 });
            let camBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 4 * 4 * 5);
            let camController = new tesserxel.controller.FreeFlyController();
            camController.object.position.set(0.001, 0.00141, 0.00172, 3);
            this.camController = camController;
            let retinaController = new tesserxel.controller.RetinaController(renderer);
            this.retinaController = retinaController;
            let ctrlreg = new tesserxel.controller.ControllerRegistry(canvas, [camController, retinaController], { preventDefault: true, requsetPointerLock: true });
            let matModelViewJSBuffer = new Float32Array(20);
            let pipeline = await renderer.createRaytracingPipeline({
                code: this.headercode.replace(/\{replace\}/g, code),
                rayEntryPoint: "mainRay",
                fragmentEntryPoint: "mainFragment"
            });
            let buffers = genBuffersToBind(gpu);
            let bindgroups = [renderer.createBindGroup(pipeline, 1, [camBuffer, ...buffers])];
            this.ctrlreg = ctrlreg;
            this.run = () => {
                runWorld(gpu);
                ctrlreg.update();
                camController.object.getAffineMat4().writeBuffer(matModelViewJSBuffer);
                gpu.device.queue.writeBuffer(camBuffer, 0, matModelViewJSBuffer);

                renderer.render(() => {
                    renderer.drawRaytracing(pipeline, bindgroups);
                });
                window.requestAnimationFrame(this.run);
            }
            function setSize() {
                let width = window.innerWidth * window.devicePixelRatio;
                let height = window.innerHeight * window.devicePixelRatio;
                canvas.width = width;
                canvas.height = height;
                renderer.setSize({ width, height });
            }
            setSize();
            window.addEventListener("resize", setSize);
            return this;
        }
        run: () => void;
    }
    export namespace pendulum {
        export async function load() {
            let objCounts = 2;
            let sceneCode = `
            @group(1) @binding(1) var<uniform> positions: array<vec4<f32>,${objCounts}>;
            fn render(r: ray)->vec4<f32>{
                let g1 = glome(positions[0],1.0,1);
                let g2 = glome(positions[1],1.0,2);
                var t = 10000.0;
                t = intGlome(r,g1);
                if(t<10000.0){
                    return vec4<f32>(0.0,0.0,1.0,1.0);
                }
                t = min(t,intGlome(r,g2));
                // t = min(t,intPlane(,plane()));
                if(t<10000.0){return vec4<f32>(1.0,0.0,0.0,1.0);}
                return vec4<f32>(1.0,1.0,1.0,0.0);
            }
            `;
            let posBuffer: GPUBuffer;
            let posJsBuffer = new Float32Array(objCounts << 4);

            const phy = tesserxel.physics;
            const vec = tesserxel.math.Vec4;
            let engin = new phy.Engine(new phy.force_accumulator.RK4());
            let world = new phy.World();
            world.gravity.set();
            let glome1 = new phy.Object(new phy.Glome(1), 1);
            let glome2 = new phy.Object(new phy.Glome(2), 1);
            let floor = new phy.Object(new phy.Glome(2), 1);
            glome1.velocity.x = Math.sqrt(5);
            glome1.geometry.position.y = 1;
            // glome2.velocity.y = 1;
            world.addObject(glome1);
            world.addObject(glome2);
            let spring1 = new phy.force.Spring(glome1, null, new vec(), new vec(), 5.0, 0);
            let spring2 = new phy.force.Spring(glome2, glome1, new vec(), new vec(), 5.0, 0, 1);
            world.addForce(spring1);
            // world.addForce(spring2);

            let app = await new ForceApp().load(sceneCode,
                (gpu) => {
                    posBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, posJsBuffer);
                    return [posBuffer];
                },
                (gpu) => {
                    engin.update(world, Math.min(app.ctrlreg.states.mspf ?? 0.01, 0.1))
                    glome1.geometry.position.writeBuffer(posJsBuffer, 0);
                    glome2.geometry.position.writeBuffer(posJsBuffer, 4);
                    gpu.device.queue.writeBuffer(posBuffer, 0, posJsBuffer);
                }
            );
            app.run();
        }
    }
}

