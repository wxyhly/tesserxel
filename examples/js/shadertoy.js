import { render, util } from "../../build/esm//tesserxel.js";
class Editor {
    load() {
        // 获取编辑器元素和行号容器
        const codeEditor = document.createElement('div');
        const lineNumbers = document.createElement('div');
        lineNumbers.className = 'line-numbers';
        codeEditor.className = 'code-editor';
        const style = document.createElement('style');
        document.head.appendChild(style);
        style.textContent = `
        .line-numbers {
            width: 60px;
            background: #2d2d2d;
            color: #858585;
            text-align: right;
            padding: 10px 15px 10px 0;
            font-family: 'Consolas', monospace;
            font-size: 16px;
            line-height: 24px;
            overflow: hidden;
            user-select: none;
            border-right: 1px solid #3c3c3c;
        }

        .line-number {
            height: 24px;
        }
        
        .code-editor {
            flex: 1;
            padding: 10px 15px;
            font-family: 'Consolas', monospace;
            font-size: 16px;
            line-height: 24px;
            color: #d4d4d4;
            background: #1e1e1e;
            outline: none;
            overflow: auto;
            white-space: pre;
            tab-size: 4;
        }

        .code-editor:focus {
            box-shadow: inset 0 0 0 1px #007acc;
        }
        `;
        // 更新行号函数
        function updateLineNumbers() {
            // 获取编辑器中的文本并按行分割
            const lines = codeEditor.innerText.split('\n').length;
            // 清空当前行号
            lineNumbers.innerHTML = '';
            // 为每一行创建一个行号元素
            for (let i = 1; i <= lines; i++) {
                const lineNumber = document.createElement('div');
                lineNumber.className = 'line-number';
                lineNumber.textContent = String(i);
                lineNumbers.appendChild(lineNumber);
            }
        }
        // 同步滚动函数
        function syncScroll() {
            lineNumbers.scrollTop = codeEditor.scrollTop;
        }
        // 添加事件监听器
        codeEditor.addEventListener('input', updateLineNumbers);
        codeEditor.addEventListener('scroll', syncScroll);
    }
}
class ShadertoyCamApp {
    renderer;
    camController;
    retinaController;
    camBuffer;
    bindgroups;
    pipeline;
    headercode = `
struct shadertoyRayOut{
    @location(0) o: vec4<f32>,
    @location(1) d: vec4<f32>
}
@group(1) @binding(0) var<uniform> shadertoyCamMat: tsxAffineMat;
@ray fn shadertoyMainRay(
    @builtin(ray_direction) rd: vec4<f32>,
    @builtin(ray_origin) ro: vec4<f32>
) -> shadertoyRayOut{
    
    return shadertoyRayOut(shadertoyCamMat.matrix*ro+shadertoyCamMat.vector, shadertoyCamMat.matrix*rd);
}

@fragment fn shadertoyMainFragment(@location(0) rayOrigin: vec4<f32>, @location(1) rayDir: vec4<f32>)->@location(0) vec4<f32>{
    return mainRay(rayOrigin, rayDir);
}
`;
    async exec(code) {
        const oldPipeline = this.pipeline;
        try {
            this.pipeline = await this.renderer.createRaytracingPipeline({
                code: this.headercode + code,
                rayEntryPoint: "shadertoyMainRay",
                fragmentEntryPoint: "shadertoyMainFragment"
            });
        }
        catch (e) {
            this.pipeline = oldPipeline;
        }
        this.bindgroups = [this.renderer.createVertexShaderBindGroup(this.pipeline, 1, [this.camBuffer])];
    }
    async load() {
        let gpu = await new render.GPU().init();
        let canvas = document.getElementById("gpu-canvas");
        let context = gpu.getContext(canvas);
        let renderer = new render.SliceRenderer(gpu, {
            enableFloat16Blend: false,
            sliceGroupSize: 8
        });
        this.renderer = renderer;
        let camBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 4 * 4 * 5);
        renderer.setDisplayConfig({ screenBackgroundColor: { r: 1, g: 1, b: 1, a: 1 } });
        let camController = new util.ctrl.FreeFlyController();
        camController.object.position.set(0, 0, 0, 0);
        this.camController = camController;
        let retinaController = new util.ctrl.RetinaController(renderer);
        this.retinaController = retinaController;
        let ctrlreg = new util.ctrl.ControllerRegistry(canvas, [camController, retinaController], { preventDefault: true, enablePointerLock: true });
        let matModelViewJSBuffer = new Float32Array(20);
        await renderer.init();
        this.camBuffer = camBuffer;
        this.run = () => {
            if (this.pipeline && this.camBuffer && this.bindgroups) {
                ctrlreg.update();
                camController.object.getAffineMat4().writeBuffer(matModelViewJSBuffer);
                gpu.device.queue.writeBuffer(camBuffer, 0, matModelViewJSBuffer);
                renderer.render(context, (rs) => {
                    rs.drawRaytracing(this.pipeline, this.bindgroups);
                });
            }
            window.requestAnimationFrame(this.run);
        };
        function setSize() {
            let width = window.innerWidth * window.devicePixelRatio;
            let height = window.innerHeight * window.devicePixelRatio;
            canvas.width = width;
            canvas.height = height;
            renderer.setDisplayConfig({ canvasSize: { width, height } });
        }
        setSize();
        window.addEventListener("resize", setSize);
        return this;
    }
    run;
}
class ShadertoyVoxelApp {
    renderer;
    camController;
    retinaController;
    camBuffer;
    bindgroups;
    pipeline;
    headercode = `
struct shadertoyVoxelOut{
    @location(0) position: vec3<f32>,
}
@group(1) @binding(0) var<uniform> shadertoyCamMat: tsxAffineMat;
@ray fn shadertoyMainRay(
    @builtin(voxel_coord) position: vec3<f32>
) -> shadertoyVoxelOut{
    let k = shadertoyCamMat;
    return shadertoyVoxelOut(position);
}

@fragment fn shadertoyMainFragment(@location(0) position: vec3<f32>)->@location(0) vec4<f32>{
    return mainVoxel(position);
}
`;
    async exec(code) {
        const oldPipeline = this.pipeline;
        try {
            this.pipeline = await this.renderer.createRaytracingPipeline({
                code: this.headercode + code,
                rayEntryPoint: "shadertoyMainRay",
                fragmentEntryPoint: "shadertoyMainFragment"
            });
        }
        catch (e) {
            this.pipeline = oldPipeline;
        }
        this.bindgroups = [this.renderer.createVertexShaderBindGroup(this.pipeline, 1, [this.camBuffer])];
    }
    async load() {
        let gpu = await new render.GPU().init();
        let canvas = document.getElementById("gpu-canvas");
        let context = gpu.getContext(canvas);
        let renderer = new render.SliceRenderer(gpu, {
            enableFloat16Blend: false,
            sliceGroupSize: 8
        });
        this.renderer = renderer;
        let camBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 4 * 4 * 5);
        renderer.setDisplayConfig({ screenBackgroundColor: { r: 1, g: 1, b: 1, a: 1 } });
        let camController = new util.ctrl.FreeFlyController();
        camController.object.position.set(0, 0, 0, 0);
        this.camController = camController;
        let retinaController = new util.ctrl.RetinaController(renderer);
        this.retinaController = retinaController;
        let ctrlreg = new util.ctrl.ControllerRegistry(canvas, [camController, retinaController], { preventDefault: true, enablePointerLock: true });
        let matModelViewJSBuffer = new Float32Array(20);
        await renderer.init();
        this.camBuffer = camBuffer;
        this.run = () => {
            if (this.pipeline && this.camBuffer && this.bindgroups) {
                ctrlreg.update();
                camController.object.getAffineMat4().writeBuffer(matModelViewJSBuffer);
                gpu.device.queue.writeBuffer(camBuffer, 0, matModelViewJSBuffer);
                renderer.render(context, (rs) => {
                    rs.drawRaytracing(this.pipeline, this.bindgroups);
                });
            }
            window.requestAnimationFrame(this.run);
        };
        function setSize() {
            let width = window.innerWidth * window.devicePixelRatio;
            let height = window.innerHeight * window.devicePixelRatio;
            canvas.width = width;
            canvas.height = height;
            renderer.setDisplayConfig({ canvasSize: { width, height } });
        }
        setSize();
        window.addEventListener("resize", setSize);
        return this;
    }
    run;
}
export var cam;
(function (cam) {
    async function load() {
        const app = await new ShadertoyCamApp().load();
        const codeDom = document.createElement("textarea");
        codeDom.value =
            `
struct Glome{
    r: f32,
    o: vec4<f32>
}
struct Cylinder{
    r: f32,
    o: vec4<f32>,
    d: vec4<f32>
}
struct Ray{
    r: vec4<f32>,
    o: vec4<f32>
}
struct intres{
    t: f32,
    normal: vec4<f32>,
    id: u32
}
fn intCube(r:Ray, c:vec4<f32>, id:u32)-> intres{
    let m = vec4<f32>(1.0, 1.0, 1.0, 1.0) / r.r;
    let n = m*r.o;
    let k = abs(m)*c;
    let t1 = -n-k;
    let t2 = -n+k;
    let tN = max(max(t1.x, t1.y), max(t1.z, t1.w));
    let tF = min(min(t2.x, t2.y), min(t2.z, t2.w));
    if (tN>tF || tF<0.0) {
        return intres(-1.0,vec4<f32>(0.0),0); // No intersection
    }
    return intres(tN,-sign(r.r)*step(t1.yzwx,t1)*step(t1.zwxy,t1)*step(t1.wxyz,t1),id);
}
fn intCubeInside(r:Ray, c:vec4<f32>,id:u32)-> intres{
    let m = vec4<f32>(1.0, 1.0, 1.0, 1.0) / r.r;
    let n = m*r.o;
    let k = abs(m)*c;
    let t1 = -n-k;
    let t2 = -n+k;
    let tN = max(max(t1.x, t1.y), max(t1.z, t1.w));
    let tF = min(min(t2.x, t2.y), min(t2.z, t2.w));
    if (tN>tF || tF<0.0) {
        return intres(-1.0,vec4<f32>(0.0),0); // No intersection
    }
    return intres(tF,-sign(r.r)*step(t2,t2.yzwx)*step(t2,t2.zwxy)*step(t2,t2.wxyz),id);
}
// fn intCylinder(r:Ray,c:Cylinder)-> vec4<f32>{
    
// }
fn unionRes(a:intres, b:intres)->intres{
    if ((a.t < b.t&&a.t>=0.0) || b.t < 0.0) {
        return a; // a is closer
    } else {
        return b; // b is closer
    }
}
fn intRes(a:intres, b:intres)->intres{
    if (a.t < 0.0  || b.t < 0.0) {
        return intres(-1.0, vec4<f32>(0.0),0); // No intersection
    }
    if (a.t < b.t) {
        return b;
    }else{
        return a;
    }
}
// fn subRes(a:intres, b:intres)->intres{
//     if(a.t>0.0 && b.t < 0.0){
//         return a;
//     }
//     if()
// }
fn intGlome(r:Ray,g:Glome,id:u32)-> intres{
    let oc = r.o - g.o;
    let a = dot(r.r, r.r);
    let b = 2.0 * dot(oc, r.r);
    let c = dot(oc, oc) - g.r * g.r;
    let d = b * b - 4.0 * a * c;
    if (d < 0.0) {
        return intres(-1.0, vec4<f32>(0.0),0); // No intersection
    }
    let t = (-b - sqrt(d)) / (2.0 * a);
    if(t < 0.0001){
        return intres(-1.0, vec4<f32>(0.0),0); // No intersection
    }
    return intres(t, normalize(r.o + r.r * t - g.o),id);
}
fn mainRay(rayOrigin: vec4<f32>, rayDir: vec4<f32>)->vec4<f32>{
    var ray = Ray(normalize(rayDir), rayOrigin);
    var radianceCoeff = vec3<f32>(1.0, 1.0, 1.0);
    var biais = vec3<f32>(0.0, 0.0, 0.0);
    const glome1 = Glome(2.0, vec4<f32>(2.8, -0.5, 0.0, 0.5));
    const glome2 = Glome(0.5, vec4<f32>(-0.8, 0.0, 0.3, 0.0));
    let resG = intGlome(ray, glome1,2);
    var reflectedColor = vec3<f32>(0.0, 0.0, 0.0);
    if(resG.t>0.0){
        ray = Ray(ray.o + ray.r * resG.t, reflect(ray.r, vec4<f32>(1.0, 0.0, 0.0, 0.0)));
        biais += radianceCoeff*vec3<f32>(0.2, 0.2, 0.4);
        radianceCoeff *= vec3<f32>(0.5, 0.5, 0.8);
    }
    let resG2 = intGlome(ray, glome2,3);
    let resroom = intCubeInside(ray,vec4<f32>(1.0),1);
    let uvw = (ray.o + ray.r * resroom.t + vec4<f32>(0.32, 0.31,0.34,0.36))*4.0;
    let checker = (floor(uvw.x) + floor(uvw.y) + floor(uvw.z)+ floor(uvw.w)+1000.0) % 2.0;
    let res = unionRes(resG2, resroom);
    if(res.t < 0.0){return vec4<f32>(0.0, 0.0, 0.0, 1.0);} // No intersection
    var color=vec3<f32>(0.0, 0.0, 0.0);
    if(res.id==1){color=mix(vec3<f32>(1.0, 1.0, 1.0),vec3<f32>(1.0, 0.4, 0.3) , checker);}
    if(res.id==2){color=vec3<f32>(0.0,0.0,1.0);}
    if(res.id==3){color=vec3<f32>(0.4,1.0,0.0);}


    let brightness = clamp(dot(res.normal,vec4<f32>(0.6,0.9,0.3,0.4)),0.0,1.0)+clamp(dot(res.normal,vec4<f32>(-0.1,0.0,-0.3,-0.5)),0.0,1.0)+0.2;
    return vec4<f32>(radianceCoeff*(brightness*color*0.8+reflectedColor*0.3),1.0);
}`;
        document.body.appendChild(codeDom);
        codeDom.style.position = "absolute";
        codeDom.style.top = "0px";
        codeDom.style.left = "0px";
        codeDom.style.opacity = "0.8";
        app.exec(codeDom.value);
        codeDom.addEventListener("blur", () => { app.exec(codeDom.value); });
        codeDom.addEventListener("change", () => { app.exec(codeDom.value); });
        app.run();
    }
    cam.load = load;
})(cam || (cam = {}));
export var voxel;
(function (voxel) {
    async function load() {
        const app = await new ShadertoyVoxelApp().load();
        const codeDom = document.createElement("textarea");
        codeDom.value =
            `
fn mainVoxel(pos: vec3<f32>)->vec4<f32>{
   return vec4<f32>(pos, 1.0);
}`;
        document.body.appendChild(codeDom);
        codeDom.style.position = "absolute";
        codeDom.style.top = "0px";
        codeDom.style.left = "0px";
        codeDom.style.opacity = "0.8";
        app.exec(codeDom.value);
        codeDom.addEventListener("blur", () => { app.exec(codeDom.value); });
        codeDom.addEventListener("change", () => { app.exec(codeDom.value); });
        app.run();
    }
    voxel.load = load;
})(voxel || (voxel = {}));
//# sourceMappingURL=shadertoy.js.map