import * as tesserxel from "../../build/tesserxel.js"
export namespace instanced_cubes {
    let vertCode = `
struct InputType{
    @location(0) pos: mat4x4<f32>,
    @location(1) normal: mat4x4<f32>,
    @location(2) uvw: mat4x4<f32>,
}
struct OutputType{
    @builtin(position) pos: mat4x4<f32>,
    @location(0) normal: mat4x4<f32>,
    @location(1) uvw: mat4x4<f32>,
}
struct AffineMat{
    matrix: mat4x4<f32>,
    vector: vec4<f32>,
}
@group(1) @binding(3) var<uniform> camMat: array<AffineMat,2>;
@group(1) @binding(4) var<storage> modelMats: array<AffineMat>;
fn apply(afmat: AffineMat, points: mat4x4<f32>) -> mat4x4<f32>{
    let biais = mat4x4<f32>(afmat.vector, afmat.vector, afmat.vector, afmat.vector);
    return afmat.matrix * points + biais;
}
@tetra fn main(input : InputType, @builtin(instance_index) index: u32) -> OutputType{
    let modelMat = modelMats[index];
    return OutputType(apply(camMat[0],apply(modelMat, apply(camMat[1],input.pos))), modelMat.matrix * camMat[1].matrix * input.normal, input.uvw);
}
`;
    let fragCode = `
struct fInputType{
    @location(0) normal : vec4<f32>,
    @location(1) uvw : vec4<f32>,
};
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
    const ambientLight = vec3<f32>(0.1);
    const frontLightColor = vec3<f32>(5.0,4.6,3.5);
    const backLightColor = vec3<f32>(0.1,1.2,1.4);
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
        frontLightColor * max(0, dot(directionalLight_dir , vary.normal)) + backLightColor * max(0, -dot(directionalLight_dir , vary.normal))
    );
    return vec4<f32>(pow(color,vec3<f32>(0.6)), 0.5 + f32(count>=2.0));
}`;
    export async function load() {
        let gpu = await new tesserxel.render.GPU().init();
        let canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
        let context = gpu.getContext(canvas);
        let renderer = await new tesserxel.render.SliceRenderer().init(gpu, context, {
            enableFloat16Blend: false,
            sliceGroupSize: 8
        });
        let pipeline = await renderer.createTetraSlicePipeline({
            vertex: { code: vertCode, entryPoint: "main" },
            fragment: { code: fragCode, entryPoint: "main" },
            cullMode: "front"
        });
        let mesh = tesserxel.mesh.tetra.tesseract();
        let positionBuffer = gpu.createBuffer(GPUBufferUsage.STORAGE, mesh.position);
        let normalBuffer = gpu.createBuffer(GPUBufferUsage.STORAGE, mesh.normal);
        let uvwBuffer = gpu.createBuffer(GPUBufferUsage.STORAGE, mesh.uvw);
        let camMat = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 4 * 4 * 5 * 2);
        let cubeCount = 4096;
        let jsbuffer = new Float32Array(20 * cubeCount);
        let math = tesserxel.math;
        for (let i = 0; i < cubeCount; i++) {
            new math.Obj4(
                math.Vec4.rand().mulfs(Math.cbrt(Math.random()) * 5.0), math.Rotor.rand(), new math.Vec4(0.1, 0.1, 0.1, 0.1).adds(math.Vec4.rand().mulfs(0.05))
            ).getAffineMat4().writeBuffer(jsbuffer, i * 20);
        }
        let modelBuffer = gpu.createBuffer(GPUBufferUsage.STORAGE, jsbuffer);
        let vertBindGroup = renderer.createVertexShaderBindGroup(pipeline, 1, [positionBuffer, normalBuffer, uvwBuffer, camMat, modelBuffer]);
        renderer.setOpacity(30.0);
        renderer.setCameraProjectMatrix({
            fov: 100, near: 0.02, far: 50
        });

        let retinaController = new tesserxel.util.ctrl.RetinaController(renderer);
        retinaController.toggleSectionConfig("retina");
        retinaController.mouseButton = null;
        let trackBallController = new tesserxel.util.ctrl.TrackBallController();
        trackBallController.object.position.set(0, 0, 0, -3);
        let ctrlreg = new tesserxel.util.ctrl.ControllerRegistry(canvas, [trackBallController, retinaController], { preventDefault: true, enablePointerLock: true });
        let camMatJSBuffer = new Float32Array(40);
        const factor1 = 0.4;
        const factor2 = factor1 * Math.SQRT2;
        let run = () => {
            ctrlreg.update();
            trackBallController.object.getAffineMat4().writeBuffer(camMatJSBuffer);
            let t = ctrlreg.states.updateCount * 0.1;
            new tesserxel.math.Obj4(
                new tesserxel.math.Vec4(Math.sin(t * factor1), Math.cos(t * factor2), Math.sin(t * factor2), Math.cos(t * factor2)).mulfs(5),
                new tesserxel.math.Bivec(t, 0, 0, 0, 0, 1.414 * t).exp()
            ).getAffineMat4().writeBuffer(camMatJSBuffer, 20);
            gpu.device.queue.writeBuffer(camMat, 0, camMatJSBuffer);

            renderer.render(() => {
                renderer.beginTetras(pipeline);
                renderer.sliceTetras(vertBindGroup, mesh.count, cubeCount);
                renderer.drawTetras();
            });
            window.requestAnimationFrame(run);
        }
        function setSize() {
            let width = window.innerWidth * window.devicePixelRatio;
            let height = window.innerHeight * window.devicePixelRatio;
            canvas.width = width;
            canvas.height = height;
            retinaController.setSize({ width, height });
        }
        setSize();
        window.addEventListener("resize", setSize);
        run();
    }
}