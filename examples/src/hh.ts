import * as tesserxel from "../../build/tesserxel.js"
export namespace hh {
    const lang = new URLSearchParams(window.location.search.slice(1)).get("lang") ?? (navigator.languages.join(",").includes("zh") ? "zh" : "en");

    export async function load() {
        new App().init().then(app => app.run());
    }
    class App {
        vertCode = `// vertex attributes, regard four vector4 for vertices of one tetrahedra as matrix4x4 
        struct InputType{
            @location(0) pos: mat4x4<f32>,
            @location(1) normal: mat4x4<f32>,
            @location(2) uvw: mat4x4<f32>,
        }
        // output position in camera space and data sent to fragment shader to be interpolated
        struct OutputType{
            @builtin(position) pos: mat4x4<f32>,
            @location(0) normal_uvw: array<mat4x4<f32>,2>,
            @location(1) position: mat4x4<f32>,
        }
        // we define an affineMat to store rotation and transform since there's no mat5x5 in wgsl
        struct AffineMat{
            matrix: mat4x4<f32>,
            vector: vec4<f32>,
            time: f32,
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
            let campos = apply(camMat,input.pos);
            return OutputType(campos, array<mat4x4<f32>,2>(
                camMat.matrix * input.normal, input.pos), campos
            );
        }`;

        fragmentShaderCode = `
        // receive data from vertex output, these values are automatically interpolated for every fragment
        struct fInputType{
            @location(0) normal : vec4<f32>,
            @location(1) uvw : vec4<f32>,
            @location(2) pos : vec4<f32>,
        };
        fn hh(p:vec4<f32>) -> f32{
            
            if(camMat.fn_id == 80){return p.x*p.y*p.z*p.w*4.0;}
            if(camMat.fn_id == 81){return (p.x+p.y)*(p.x-p.y)*(p.x+p.z)*(p.x-p.z)*(p.x+p.w)*(p.x-p.w)*(p.y+p.z)*(p.y-p.z)*(p.y+p.w)*(p.y-p.w)*(p.z+p.w)*(p.z-p.w)*420.0;}
            if(camMat.fn_id == 82){return p.x*p.y*p.z*p.w*(p.x+p.y+p.z+p.w)*(p.x+p.y+p.z-p.w)*(p.x+p.y-p.z+p.w)*(p.x+p.y-p.z-p.w)*(p.x-p.y+p.z+p.w)*(p.x-p.y+p.z-p.w)*(p.x-p.y-p.z+p.w)*(p.x-p.y-p.z-p.w)*150.0;}

            if(camMat.fn_id == 0) {return 0.2;}
            if(camMat.fn_id == 10){ return p.x*0.5;}
            if(camMat.fn_id == 11){ return p.y*0.5;}
            if(camMat.fn_id == 12){ return p.z*0.5;}
            if(camMat.fn_id == 13){ return p.w*0.5;}
            if(camMat.fn_id == 200){return p.x*p.y;}
            if(camMat.fn_id == 201){return p.x*p.z;}
            if(camMat.fn_id == 202){return p.w*p.z;}
            if(camMat.fn_id == 210){return p.w*p.x;}
            if(camMat.fn_id == 211){return (p.x*p.x+p.y*p.y-p.z*p.z-p.w*p.w)*0.5;}
            if(camMat.fn_id == 212){return p.y*p.z;}
            if(camMat.fn_id == 220){return p.z*p.z-p.w*p.w;}
            if(camMat.fn_id == 221){return p.y*p.w;}
            if(camMat.fn_id == 222){return p.x*p.x-p.y*p.y;}

            if(camMat.fn_id == 300){return 0.5*p.x*(p.x*p.x-3.0*p.y*p.y);}
            if(camMat.fn_id == 301){return p.x*p.y*p.z;}
            if(camMat.fn_id == 302){return p.x*p.w*p.z;}
            if(camMat.fn_id == 303){return 0.5*p.z*(p.z*p.z-3.0*p.w*p.w);}
            if(camMat.fn_id == 310){return p.x*p.w*p.y;}
            if(camMat.fn_id == 311){return 0.6*p.x*(14.0/9.0*p.x*p.x+4.0/3.0*p.y*p.y-(p.z*p.z+p.w*p.w)*3.0);}
            if(camMat.fn_id == 312){return 0.6*p.z*(14.0/9.0*p.z*p.z+4.0/3.0*p.w*p.w-(p.x*p.x+p.y*p.y)*3.0);}
            if(camMat.fn_id == 313){return p.z*p.w*p.y;}
            if(camMat.fn_id == 320){return p.x*(p.z*p.z-p.w*p.w);}
            if(camMat.fn_id == 321){return 0.6*p.w*(14.0/9.0*p.w*p.w+4.0/3.0*p.z*p.z-(p.x*p.x+p.y*p.y)*3.0);}
            if(camMat.fn_id == 322){return 0.6*p.y*(14.0/9.0*p.y*p.y+4.0/3.0*p.x*p.x-(p.z*p.z+p.w*p.w)*3.0);}
            if(camMat.fn_id == 323){return p.z*(p.x*p.x-p.y*p.y);}
            if(camMat.fn_id == 330){return 0.5*p.w*(p.w*p.w-3.0*p.z*p.z);}
            if(camMat.fn_id == 331){return p.y*(p.w*p.w-p.z*p.z);}
            if(camMat.fn_id == 332){return p.w*(p.x*p.x-p.y*p.y);}
            if(camMat.fn_id == 333){return 0.5*p.y*(p.y*p.y-3.0*p.x*p.x);}

            if(camMat.fn_id == 400){return (p.x*p.x+p.y*p.y+p.z*p.z-3*p.w*p.w)*0.3;}
            if(camMat.fn_id == 410){return p.x*p.w;}
            if(camMat.fn_id == 411){return p.z*p.w;}
            if(camMat.fn_id == 412){return p.y*p.w;}
            if(camMat.fn_id == 420){return p.y*p.x;}
            if(camMat.fn_id == 421){return p.z*p.x;}
            if(camMat.fn_id == 422){return (p.x*p.x+p.y*p.y-2.0*p.z*p.z)*0.5;}
            if(camMat.fn_id == 423){return p.y*p.z;}
            if(camMat.fn_id == 424){return p.x*p.x-p.y*p.y;}

            if(camMat.fn_id == 500){return (p.x*p.x+p.y*p.y+p.z*p.z-3.0*p.w*p.w)*p.w*0.8;}
            if(camMat.fn_id == 510){return (p.x*p.x+p.y*p.y+p.z*p.z-5*p.w*p.w)*p.x*0.8;}
            if(camMat.fn_id == 511){return (p.x*p.x+p.y*p.y+p.z*p.z-5*p.w*p.w)*p.y*0.8;}
            if(camMat.fn_id == 512){return (p.x*p.x+p.y*p.y+p.z*p.z-5*p.w*p.w)*p.z*0.8;}
            if(camMat.fn_id == 520){return p.x*p.y*p.w*1.5;}
            if(camMat.fn_id == 521){return p.x*p.z*p.w*1.5;}
            if(camMat.fn_id == 522){return (p.x*p.x+p.y*p.y-2*p.z*p.z)*p.w;}
            if(camMat.fn_id == 523){return p.y*p.z*p.w*1.5;}
            if(camMat.fn_id == 524){return (p.x*p.x-p.y*p.y)*p.w;}
            if(camMat.fn_id == 530){return p.x*(p.x*p.x-3*p.y*p.y)*0.8;}
            if(camMat.fn_id == 531){return p.x*p.y*p.z*1.5;}
            if(camMat.fn_id == 532){return p.x*(p.x*p.x+p.y*p.y-4*p.z*p.z)*0.8;}
            if(camMat.fn_id == 533){return (p.x*p.x+p.y*p.y-2.0/3.0*p.z*p.z)*p.z*0.8;}
            if(camMat.fn_id == 534){return p.y*(p.x*p.x+p.y*p.y-4*p.z*p.z)*0.8;}
            if(camMat.fn_id == 535){return p.z*(p.x*p.x-p.y*p.y);}
            if(camMat.fn_id == 536){return p.y*(p.y*p.y-3*p.x*p.x)*0.8;}      
            return 0.0;
        }
        struct AffineMat{
            matrix: mat4x4<f32>,
            vector: vec4<f32>,
            time: f32,
            fn_id: u32,
            displayMode: u32
        }
        @group(0) @binding(0) var<uniform> camMat: AffineMat;
        @fragment fn main(vary: fInputType) -> @location(0) vec4<f32> {
            const ambientLight = vec3<f32>(0.2);
            const frontLightColor = vec3<f32>(5.0,4.8,4.5);
            const backLightColor = vec3<f32>(0.7,0.8,0.9);
            const directionalLight_dir = vec4<f32>(0.1,0.5,0.4,1.0);
            let halfvec = normalize(directionalLight_dir - normalize(vary.pos));
            let highLight = pow(max(0.0,dot(vary.normal,halfvec)),30);
            const thd = 0.98;
            var value:f32;
            
            if(camMat.fn_id == 83){
                value= (vary.uvw.x+vary.uvw.y)*(vary.uvw.x-vary.uvw.y)*(vary.uvw.x+vary.uvw.z)*(vary.uvw.x-vary.uvw.z)*(vary.uvw.x+vary.uvw.w)*(vary.uvw.x-vary.uvw.w)*(vary.uvw.y+vary.uvw.z)*(vary.uvw.y-vary.uvw.z)*(vary.uvw.y+vary.uvw.w)*(vary.uvw.y-vary.uvw.w)*(vary.uvw.z+vary.uvw.w)*(vary.uvw.z-vary.uvw.w)*420.0*sin(camMat.time) + vary.uvw.x*vary.uvw.y*vary.uvw.z*vary.uvw.w*(vary.uvw.x+vary.uvw.y+vary.uvw.z+vary.uvw.w)*(vary.uvw.x+vary.uvw.y+vary.uvw.z-vary.uvw.w)*(vary.uvw.x+vary.uvw.y-vary.uvw.z+vary.uvw.w)*(vary.uvw.x+vary.uvw.y-vary.uvw.z-vary.uvw.w)*(vary.uvw.x-vary.uvw.y+vary.uvw.z+vary.uvw.w)*(vary.uvw.x-vary.uvw.y+vary.uvw.z-vary.uvw.w)*(vary.uvw.x-vary.uvw.y-vary.uvw.z+vary.uvw.w)*(vary.uvw.x-vary.uvw.y-vary.uvw.z-vary.uvw.w)*150.0*cos(camMat.time);
            }else{value = hh(vary.uvw)*sin(camMat.time);}
            var color:vec3<f32> = mix(vec3<f32>(1.0,1.0,0.0),vec3<f32>(0.0,0.0,1.0),clamp(value*5.0+0.5,-1.0,1.0));
            if(camMat.displayMode==1){
                let pointColor = step(thd,abs(vary.uvw.x))*vec3<f32>(0.0,1.0,0.0) + step(thd,abs(vary.uvw.y))*vec3<f32>(1.0,0.0,0.0) + step(thd,abs(vary.uvw.z))*vec3<f32>(0.0,0.0,1.0) + step(thd,abs(vary.uvw.w))*vec3<f32>(1.0,0.0,1.0);
                let point = 1.0-step(pointColor.x+pointColor.y+pointColor.z,0.5);
                color = color * (
                    frontLightColor * max(0, dot(directionalLight_dir , -dot(vary.pos,vary.normal)*vary.normal)+0.5)
                )* (0.4 + 0.8*highLight);
                return mix(vec4<f32>(clamp(pow(color,vec3<f32>(0.6))*0.5,vec3<f32>(0.0),vec3<f32>(1.0)), clamp(value*value*10.0,0.02,1.0)),vec4<f32>(pointColor,1.0),point);
            }else{
                return vec4<f32>(clamp(pow(color,vec3<f32>(0.6))*0.5,vec3<f32>(0.0),vec3<f32>(1.0)), clamp(value*value*10.0,0.02,1.0));
            }
        }`;
        gpu: tesserxel.render.GPU;
        canvas: HTMLCanvasElement;
        renderer: tesserxel.render.SliceRenderer;
        pipeline: tesserxel.render.TetraSlicePipeline;
        vertBindGroup: GPUBindGroup;
        fragBindGroup: GPUBindGroup;
        camBuffer: GPUBuffer;
        camMatJSBuffer = new Float32Array(4 * 5);
        trackBallController: tesserxel.util.ctrl.TrackBallController;
        retinaController: tesserxel.util.ctrl.RetinaController;
        ctrlRegistry: tesserxel.util.ctrl.ControllerRegistry;
        context: GPUCanvasContext;
        mesh: tesserxel.mesh.TetraMesh;
        varies = new ArrayBuffer(12);
        async init() {
            this.gpu = await new tesserxel.render.GPU().init();
            this.canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
            this.context = this.gpu.getContext(this.canvas);
            this.renderer = new tesserxel.render.SliceRenderer(this.gpu, {
                // if this is set true, alpha blending will be more accurate but costy
                enableFloat16Blend: false,
                // how many slices are drawn together, this value must be 2^n and it can't be to big for resource limitation
                sliceGroupSize: 8
            });
            // set 4d camera
            this.renderer.setDisplayConfig({
                camera4D: {
                    fov: 100, near: 0.01, far: 10
                },
                screenBackgroundColor: [1, 1, 1, 1],
                opacity: 20
            });
            // create a tetra slice pipeline
            this.pipeline = await this.renderer.createTetraSlicePipeline({
                vertex: { code: this.vertCode, entryPoint: "main" },
                fragment: {
                    code: this.fragmentShaderCode,
                    entryPoint: "main",
                },
                layout: {
                    computeLayout: [undefined, { entries: [{ binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: {} }] }],
                    renderLayout: 'auto'
                },
                cullMode: "none"
            });
            // vertex attrbutes buffers on gpu
            const mesh = tesserxel.mesh.tetra.glome(1, 32, 32, 16);
            let positionBuffer = this.gpu.createBuffer(GPUBufferUsage.STORAGE, mesh.position);
            let normalBuffer = this.gpu.createBuffer(GPUBufferUsage.STORAGE, mesh.normal);
            let uvwBuffer = this.gpu.createBuffer(GPUBufferUsage.STORAGE, mesh.uvw);
            // camera affinemat buffer on gpu
            this.camBuffer = this.gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 4 * 4 * 5 + 4 * 4);
            // bind these buffers to group(1) in pipeline
            this.vertBindGroup = this.renderer.createVertexShaderBindGroup(this.pipeline, 1, [positionBuffer, normalBuffer, uvwBuffer, this.camBuffer]);
            this.fragBindGroup = this.renderer.createFragmentShaderBindGroup(this.pipeline, 0, [this.camBuffer]);
            // init a trackball controller in order to drag 4d object by mouse and keys
            this.trackBallController = new tesserxel.util.ctrl.TrackBallController();
            // randomize the initial orientation of the object controlled by trackball controller
            this.trackBallController.object.position.w = -0.98;
            // init a retina controller in order to adjust retina settings interactively like section thumbails and retina render layers
            this.retinaController = new tesserxel.util.ctrl.RetinaController(this.renderer);
            this.mesh = mesh;
            this.setSize();
            this.retinaController.mouseButton = null;
            this.ctrlRegistry = new tesserxel.util.ctrl.ControllerRegistry(this.canvas, [
                this.trackBallController, this.retinaController
            ], { preventDefault: true, enablePointerLock: true });
            window.addEventListener("resize", this.setSize.bind(this));
            await this.renderer.init();
            const panel = document.createElement("div");

            panel.style.position = "absolute";
            panel.style.top = "50px";
            document.body.appendChild(panel);
            const axisBtn = document.createElement("button");
            panel.appendChild(axisBtn);
            const zhXYZW = `<span style="color:green">x</span>、<span style="color:red">y</span>、<span style="color:blue">z</span>、<span style="color:purple">w</span>`;
            const enXYZW = `<span style="color:green">x</span>, <span style="color:red">y</span>, <span style="color:blue">z</span>, <span style="color:purple">w</span>`;

            axisBtn.innerHTML = lang == "zh" ? "显示轴" : "Show Axes";
            axisBtn.style.display = "block";
            axisBtn.onclick = () => {
                if (axisBtn.innerHTML === (lang == "zh" ? "显示轴" : "Show Axes")) {
                    new Uint32Array(this.varies)[2] = 1;
                    axisBtn.innerHTML = (lang == "zh" ? "隐藏轴" + zhXYZW : "Hide Axes " + enXYZW);
                } else {
                    new Uint32Array(this.varies)[2] = 0;
                    axisBtn.innerHTML = (lang == "zh" ? "显示轴" : "Show Axes");
                }
                axisBtn.style.display = "block";
            }
            const selMode = document.createElement("select"); panel.appendChild(selMode);
            const selMode1 = document.createElement("select"); panel.appendChild(selMode1);
            selMode1.style.display = "block";
            const selMode2 = document.createElement("select"); panel.appendChild(selMode2);
            selMode2.style.display = "none";
            const m1 = document.createElement("option"); selMode.appendChild(m1);
            const m2 = document.createElement("option"); selMode.appendChild(m2);
            const m3 = document.createElement("option"); selMode.appendChild(m3);
            m1.innerText = lang == "zh" ? "Hopf基" : "Hopf Base";
            m2.innerText = lang == "zh" ? "超球极基" : "HyperPolar Base";
            m3.innerText = lang == "zh" ? "对称波" : "Symmetric Wave";
            selMode.onchange = () => {
                tables.forEach(e => e.style.display = 'none');
                selMode1.selectedIndex = selMode2.selectedIndex = 0;
                if (selMode.selectedIndex == 0) {
                    selMode1.style.display = "block";
                    selMode2.style.display = "none";
                } else if (selMode.selectedIndex == 1) {
                    selMode1.style.display = "none";
                    selMode2.style.display = "block";
                } else {
                    selMode1.style.display = "none";
                    selMode2.style.display = "none";
                    tables[8].style.display = 'block';
                }
            };
            const css = document.createElement("style"); css.innerHTML = `
            td.clickable{
                background-color: green;
            }
            td.selected{
                background-color: cyan;
            }
            div table{
                border: 2px solid black;
            }
            div td{
                width: 20px;
                height: 20px;
                border: 1px solid grey;
            }
            `;
            document.head.appendChild(css);
            const placeholder = lang == "zh" ? "请选择" : "Please Select";
            selMode1.innerHTML = selMode2.innerHTML = `<option value="">${placeholder}</option><option value="0">s</option><option value="1">p</option><option value="2">d</option><option value="3">f</option>`;
            const tables = [
                `<table><tr><td></td></tr></table>`,
                `<table><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr></table>`,
                `<table><tr><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td></tr></table>`,
                `<table><tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr></table>`,

                `<table><tr><td></td></tr></table>`,
                `<table><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr></table>`,
                `<table><tr><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td></tr></table>`,
                `<table><tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>    </table>`,
                `<table><tr><td></td><td></td><td></td><td>H</td></tr></table>`,
            ].map(str => { const a = document.createElement("div"); a.innerHTML = str; a.style.display = "none"; panel.appendChild(a); return a; });
            const values = [
                [-1],
                [0, 10, 0, 12, 0, 13, 0, 11, 0],
                [0, 0, 200, 0, 0, 0, 201, 0, 210, 0, 202, 0, 211, 0, 220, 0, 212, 0, 221, 0, 0, 0, 222, 0, 0],
                [0, 0, 0, 300, 0, 0, 0, 0, 0, 301, 0, 310, 0, 0, 0, 302, 0, 311, 0, 320, 0, 303, 0, 312, 0, 321, 0, 330, 0, 313, 0, 322, 0, 331, 0, 0, 0, 323, 0, 332, 0, 0, 0, 0, 0, 333, 0, 0, 0],
                [-1],
                [0, 13, 0, 10, 12, 11],
                [0, 0, 400, 0, 0, 0, 410, 411, 412, 0, 420, 421, 422, 423, 424],
                [0, 0, 0, 500, 0, 0, 0, 0, 0, 510, 511, 512, 0, 0, 0, 520, 521, 522, 523, 524, 0, 530, 531, 532, 533, 534, 535, 536],
                [80, 81, 82, 83],
            ];
            for (let i = 0; i < values.length; i++) {
                const table = tables[i];
                const trs = table.querySelectorAll("tr");
                for (let j = 0; j < trs.length; j++) {
                    const tds = trs[j].querySelectorAll("td");
                    for (let k = 0; k < tds.length; k++) {
                        const target = values[i][j * tds.length + k];
                        if (target == 0) { continue; }
                        tds[k].onclick = () => {
                            panel.querySelectorAll("td").forEach(e => e.classList.remove("selected"));
                            new Uint32Array(this.varies)[1] = target === -1 ? 0 : target;
                            tds[k].classList.add("selected");
                        }
                        tds[k].classList.add("clickable");
                    }
                }
            }
            selMode1.onchange = () => {
                tables.forEach(e => e.style.display = 'none');
                switch (selMode1.selectedIndex) {
                    case 1: tables[0].style.display = 'block'; break;
                    case 2: tables[1].style.display = 'block'; break;
                    case 3: tables[2].style.display = 'block'; break;
                    case 4: tables[3].style.display = 'block'; break;
                }
            };


            selMode2.onchange = () => {
                tables.forEach(e => e.style.display = 'none');
                switch (selMode2.selectedIndex) {
                    case 1: tables[4].style.display = 'block'; break;
                    case 2: tables[5].style.display = 'block'; break;
                    case 3: tables[6].style.display = 'block'; break;
                    case 4: tables[7].style.display = 'block'; break;
                }
            };
            selMode.selectedIndex = 2;
            selMode.onchange(null);
            tables[8].querySelectorAll("td")[3].click();

            // check orthogonality
            // let sum = 0; const step = 20000000;
            // let f = [
            //     (x, y, z, w) => (x * x + y * y + z * z - 3 * w * w)*w,
            //     (x, y, z, w) => x*(x*x+y*y+z*z-5*w*w),
            //     (x, y, z, w) => y*(x*x+y*y+z*z-5*w*w),
            //     (x, y, z, w) => z*(x*x+y*y+z*z-5*w*w),
            //     (x, y, z, w) => x*y*w,
            //     (x, y, z, w) => x*z*w,
            //     (x, y, z, w) => (x*x+y*y-2*z*z)*w,
            //     (x, y, z, w) => y*z*w,
            //     (x, y, z, w) => (x*x-y*y)*w,

            //     (x, y, z, w) => x*(x*x-3*y*y),
            //     (x, y, z, w) => x*y*z,
            //     (x, y, z, w) => x*(x*x+y*y-4*z*z),
            //     (x, y, z, w) => (x*x+y*y-2/3*z*z)*z,
            //     (x, y, z, w) => y*(x*x+y*y-4*z*z),
            //     (x, y, z, w) => z*(x*x-y*y),
            //     (x, y, z, w) => y*(y*y-3*x*x),
            // ]
            // for (let p = 0; p < f.length; p++) {
            //     for (let q = 0; q < f.length; q++) {
            //         sum = 0;
            //         for (let i = 0; i < step; i++) {
            //             const { x, y, z, w } = tesserxel.math.Vec4.rand();
            //             sum += (f[p](x, y, z, w)) * (f[q](x, y, z, w));
            //         }
            //         if(sum / step>0.0001)console.log(p, q, (sum / step).toFixed(4));
            //     }
            // }

            return this;
        }
        setSize() {
            let width = window.innerWidth * window.devicePixelRatio;
            let height = window.innerHeight * window.devicePixelRatio;
            this.canvas.width = width;
            this.canvas.height = height;
            this.retinaController.setSize({ width, height });
        }
        run() {
            this.ctrlRegistry.update();
            this.trackBallController.object.getAffineMat4().writeBuffer(this.camMatJSBuffer);
            this.gpu.device.queue.writeBuffer(this.camBuffer, 0, this.camMatJSBuffer);
            this.gpu.device.queue.writeBuffer(this.camBuffer, 4 * 4 * 5, this.varies);
            new Float32Array(this.varies)[0] += 0.2;
            this.renderer.render(this.context, (rs) => {
                rs.beginTetras(this.pipeline);
                rs.sliceTetras(this.vertBindGroup, this.mesh.count);
                rs.drawTetras([{ group: 0, binding: this.fragBindGroup }]);
            });
            window.requestAnimationFrame(this.run.bind(this));
        }
    }
}