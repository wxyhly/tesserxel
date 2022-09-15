namespace tesserxel {
    export namespace four {
        type ColorOutputNode = MaterialNode & { output: "color" };
        type Vec4OutputNode = MaterialNode & { output: "vec4" };
        type FloatOutputNode = MaterialNode & { output: "f32" };
        type TransformOutputNode = MaterialNode & { output: "affineMat4" };

        /** An iterative structure for Material */
        class MaterialNode {
            identifier: string;
            input: { [name: string]: MaterialNode } = {};
            output: string;
            static constFractionDigits = 4;
            getCode(r: Renderer, root: Material, outputToken: string): string { return ""; }
            getInputCode(r: Renderer, root: Material, token: string) {
                let out: { [name: string]: string } = {};
                let code = "";
                for (let [name, node] of globalThis.Object.entries(this.input)) {
                    let inputToken = token + "_" + name;
                    out[name] = inputToken;
                    code += node.getCode(r, root, inputToken) + "\n";
                };
                return { token: out, code };
            }
            update(r: Renderer) {
                for (let node of globalThis.Object.values(this.input)) {
                    node.update(r);
                }
            }
            constructor(identifier: string) { this.identifier = identifier; }
        }
        /** Material is the top node of MaterialNode */
        export class Material extends MaterialNode {
            cullMode: GPUCullMode = "front";
            compiling = false;
            compiled = false;
            needsUpdate = true;
            output = "shader";
            pipeline: renderer.TetraSlicePipeline;
            uuid: string;
            bindGroup: GPUBindGroup[];
            bindGroupBuffers: GPUBuffer[] = [];
            fetchBuffers: string[] = [];
            declUniforms: { [name: string]: { location: number, type: string, buffer: GPUBuffer } } = {};
            declUniformLocation = 0;
            declVarys: string[] = [];
            createBindGroup(r: Renderer, p: renderer.TetraSlicePipeline) {
                this.bindGroup = this.bindGroupBuffers.length ? [r.core.createFragmentShaderBindGroup(p, 0, this.bindGroupBuffers)] : [];
            }
            init(r: Renderer) {
                this.getShaderCode(r); // scan code to get binding infomations
                this.compiling = false;
                this.compiled = true;
            }
            async compile(r: Renderer) {
                this.compiling = true;
                r.pullPipeline(this.identifier, "compiling");
                let { vs, fs } = this.getShaderCode(r);
                this.pipeline = await r.core.createTetraSlicePipeline({
                    vertex: { code: vs, entryPoint: "main" },
                    fragment: { code: fs, entryPoint: "main" },
                    cullMode: this.cullMode
                });
                r.pullPipeline(this.identifier, this.pipeline);
                this.compiling = false;
                this.compiled = true;
            }
            // when a subnode uses vary input, call this function to check attribute buffer and construct input structure
            addVary(a: string) {
                if (!this.declVarys.includes(a)) {
                    this.declVarys.push(a);
                }
                if (a == "pos") return;
                if (!this.fetchBuffers.includes(a)) {
                    this.fetchBuffers.push(a);
                }
            }
            // when a subnode uses uniform, call this function to add uniform globally
            addUniform(type: string, u: string, buffer: GPUBuffer) {
                if (!this.declUniforms[u]) {
                    this.declUniforms[u] = { location: this.declUniformLocation++, type, buffer };
                    this.bindGroupBuffers.push(buffer);
                }
            }
            fetchBuffer(g: Geometry): GPUBuffer[] {
                //sort buffer fetchBuffers
                return [g.gpuBuffer["position"], ...this.fetchBuffers.map(b => g.gpuBuffer[b])];
            }
            getShaderCode(r: Renderer): { vs: string, fs: string } {
                // what we need in jsData except for position buffer
                this.fetchBuffers = [];
                // renderPipeline's uniform variables except for world light (in another group)
                this.declUniforms = {};
                // output of computeShader, also input for fragment shader
                this.declVarys = [];
                this.bindGroupBuffers = [];
                // renderPipeline's uniform bindgroup's location number
                this.declUniformLocation = 0;
                // iteratively generate code
                let code = this.getCode(r, this, "");
                // deal no need for vary input
                let fsIn = this.declVarys.length ? 'vary: fourInputType' : "";
                let lightCode = r.lightShaderInfomation.lightCode;
                // if no uniform at group0, then bind lights on 0, or 1
                if (this.declUniformLocation === 0) { lightCode = lightCode.replace("@group(1)", "@group(0)") }
                let header = lightCode + `
    struct AffineMat{
        matrix: mat4x4<f32>,
        vector: vec4<f32>,
    }
    @fragment fn main(${fsIn}) -> @location(0) vec4<f32> {
        let ambientLightDensity = uWorldLight.ambientLightDensity.xyz;`; // avoid basic material doesn't call this uniform at all
                // if frag shader has input, we need to construct a struct fourInputType
                if (fsIn) {
                    let struct = `    struct fourInputType{\n`;
                    for (let i = 0, l = this.declVarys.length; i < l; i++) {
                        struct += `        @location(${i}) ${this.declVarys[i]}: vec4<f32>,\n`;
                    }
                    struct += "    }\n";
                    header = struct + header;
                }
                for (let [u, { location, type }] of globalThis.Object.entries(this.declUniforms)) {
                    header = `   @group(0) @binding(${location}) var<uniform> ${u}:${type};\n` + header;
                }
                // we use the result from getCode to generate needed vertex variables
                return { vs: _generateVertShader(this.fetchBuffers, this.declVarys), fs: header + code + `\n   }` };
            }

            constructor(identifiers: string) {
                super(identifiers);
                this.uuid = math.generateUUID();
            }
            gpuUniformBuffer: { [name: string]: GPUBuffer };
        }
        /** ConstValue will be hardcoded in shader */
        class ConstValue extends MaterialNode {
            getCode(r: Renderer, root: Material, outputToken: string) {
                return `
                const ${outputToken} = ${this.identifier};`;
            }
            constructor(identifier: string) {
                super(identifier);
            }
        }
        class ColorConstValue extends ConstValue {
            declare output: "color";
            constructor(color: GPUColor) {
                let r: number = (color as GPUColorDict)?.r ?? color[0] ?? 0;
                let g: number = (color as GPUColorDict)?.g ?? color[1] ?? 0;
                let b: number = (color as GPUColorDict)?.b ?? color[2] ?? 0;
                let a: number = (color as GPUColorDict)?.a ?? color[3] ?? 1;
                super(`vec4<f32>(${r.toFixed(MaterialNode.constFractionDigits)},${g.toFixed(MaterialNode.constFractionDigits)},${b.toFixed(MaterialNode.constFractionDigits)},${a.toFixed(MaterialNode.constFractionDigits)})`);
            }
        }
        class Vec4ConstValue extends ConstValue {
            declare output: "vec4";
            constructor(vec: math.Vec4) {
                super(`vec4<f32>(${vec.flat().map(n => n.toFixed(MaterialNode.constFractionDigits)).join(",")})`);
            }
        }
        class FloatConstValue extends ConstValue {
            declare output: "f32";
            constructor(f: number) {
                super(f.toFixed(MaterialNode.constFractionDigits));
            }
        }
        class TransformConstValue extends ConstValue {
            declare output: "affineMat4";
            constructor(v: math.Obj4) {
                let afmat = v.getAffineMat4();
                let matEntries = afmat.mat.ts().elem.map(n => n.toFixed(MaterialNode.constFractionDigits)).join(",");
                let vecEntries = afmat.vec.flat().map(n => n.toFixed(MaterialNode.constFractionDigits)).join(",");
                super(`AffineMat(mat4x4<f32>(${matEntries}),vec4<f32>(${vecEntries}))`);
            }
        }

        /** the same UniformValue instance will share one uniform buffer */
        class UniformValue extends MaterialNode {
            gpuBuffer: GPUBuffer;
            gpuBufferSize: number;
            jsBufferSize: number;
            type: string;
            needsUpdate = true;
            constructor() {
                super("u" + math.generateUUID().replace(/\-/g, "").slice(16));
            }
            getCode(r: Renderer, root: Material, outputToken: string) {
                if (!this.gpuBuffer) {
                    this.createBuffer(r);
                }
                root.addUniform(this.type, this.identifier, this.gpuBuffer);
                return `
                let ${outputToken} = ${this.identifier};`;
            }
            createBuffer(r: Renderer) {
                this.gpuBuffer = r.gpu.createBuffer(GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM, this.gpuBufferSize, "uConstValueBuffer");
                this.jsBufferSize = this.gpuBufferSize >> 2;
            }
            _update(r: Renderer) { }
            update(r: Renderer) {
                if (!this.needsUpdate) return;
                this._update(r);
                r.gpu.device.queue.writeBuffer(this.gpuBuffer, 0, r.jsBuffer, 0, this.jsBufferSize);
                this.needsUpdate = false;
            }
        }
        export class ColorUniformValue extends UniformValue {
            declare output: "color";
            type = "vec4<f32>";
            gpuBufferSize = 4 * 4;
            value: GPUColor;
            _update(r: Renderer) {
                r.jsBuffer[0] = (this.value as GPUColorDict)?.r ?? this.value[0] ?? 0;
                r.jsBuffer[1] = (this.value as GPUColorDict)?.g ?? this.value[1] ?? 0;
                r.jsBuffer[2] = (this.value as GPUColorDict)?.b ?? this.value[2] ?? 0;
                r.jsBuffer[3] = (this.value as GPUColorDict)?.a ?? this.value[3] ?? 1;
            }
            write(value: GPUColor) {
                this.value = value;
                this.needsUpdate = true;
            }
        }
        export class Vec4UniformValue extends UniformValue {
            declare output: "vec4";
            type = "vec4<f32>";
            gpuBufferSize = 4 * 4;
            value: math.Vec4;
            _update(r: Renderer) {
                this.value.writeBuffer(r.jsBuffer);
            }
            write(value: math.Vec4) {
                this.value = value;
                this.needsUpdate = true;
            }
        }
        export class FloatUniformValue extends UniformValue {
            declare output: "f32";
            type = "f32";
            gpuBufferSize = 4;
            value: number;
            _update(r: Renderer) {
                r.jsBuffer[0] = this.value;
            }
            write(value: number) {
                this.value = value;
                this.needsUpdate = true;
            }
        }
        export class TransformUniformValue extends UniformValue {
            declare output: "affineMat4";
            type = "AffineMat";
            gpuBufferSize = 20 * 4;
            value: math.Obj4;
            private affineMatValue = new math.AffineMat4();
            _update(r: Renderer) {
                this.affineMatValue.setFromObj4(this.value).writeBuffer(r.jsBuffer);
            }
            write(value: math.Obj4) {
                this.value = value;
                this.needsUpdate = true;
            }
        }


        export type Color = GPUColor | ColorOutputNode;
        /** A shortcut path for writing a constant color */
        function makeColorOutput(color: Color) {
            if (!(color instanceof MaterialNode)) color = new ColorConstValue(color as GPUColor);
            return color;
        }
        export type Float = number | FloatOutputNode;
        /** A shortcut path for writing a constant color */
        function makeFloatOutput(f: Float) {
            if (!(f instanceof MaterialNode)) f = new FloatConstValue(f as number);
            return f;
        }
        /** Basic material just return color node's output color  */
        export class BasicMaterial extends Material {
            declare input: {
                color: ColorOutputNode;
            };
            constructor(color: Color) {
                color = makeColorOutput(color);
                super("Basic(" + color.identifier + ")");
                this.input = { color };
            }
            getCode(r: Renderer, root: Material, outputToken: string) {
                let color = this.input.color.getCode(r, root, "color");
                return color + `
                return color;`;
            }
        }
        export class LambertMaterial extends Material {
            declare input: {
                color: ColorOutputNode;
            };

            getCode(r: Renderer, root: Material, outputToken: string) {
                root.addVary("normal");
                root.addVary("pos");
                let color = this.input.color.getCode(r, root, "color");
                return color + `
                var radiance = ambientLightDensity;
                for(var i=0;i<${r.lightShaderInfomation.posdirLightsNumber};i++){
                    var N = vec4<f32>(0.0);
                    if(uWorldLight.posdirLights[i].density.w<-0.5){
                        N = uWorldLight.posdirLights[i].pos_dir;
                    }else if(uWorldLight.posdirLights[i].density.w>0.5){
                        N = uWorldLight.posdirLights[i].pos_dir - vary.pos;
                        N *= pow(length(N),-uWorldLight.posdirLights[i].density.w); // decay by distance
                    }
                    radiance += uWorldLight.posdirLights[i].density.rgb * max(0.0,dot(vary.normal,N));
                }
                for(var i=0;i<${r.lightShaderInfomation.spotLightsNumber};i++){
                    if(uWorldLight.spotLights[i].density.w>0.5){
                        var N = uWorldLight.spotLights[i].pos - vary.pos;
                        let len = length(N);
                        let penumbra = max(0.0,dot(N / len,uWorldLight.spotLights[i].dir)*uWorldLight.spotLights[i].params.x + uWorldLight.spotLights[i].params.y);
                        N *= pow(len,-uWorldLight.spotLights[i].params.w) * pow(penumbra, uWorldLight.spotLights[i].params.z);
                        radiance += uWorldLight.spotLights[i].density.rgb * max(0.0,dot(vary.normal,N));
                    }
                }
                return vec4<f32>(acesFilm((color.rgb + blackColor) * radiance), color.a);`;
            }
            constructor(color: Color) {
                color = makeColorOutput(color);
                super("Lambert(" + color.identifier + ")");
                this.input = { color };
            }
        }
        /** Blinn Phong */
        export class PhongMaterial extends Material {
            declare input: {
                color: ColorOutputNode;
                specular: ColorOutputNode;
                shininess: FloatOutputNode;
            };

            getCode(r: Renderer, root: Material, outputToken: string) {
                root.addVary("normal");
                root.addVary("pos");
                root.addUniform("array<AffineMat,2>", "uCamMat", r.uCamMatBuffer);
                let { code } = this.getInputCode(r, root, outputToken);
                return code + `
                var radiance = ambientLightDensity;
                var specularRadiance = vec3<f32>(0.0);
                let viewRay = -normalize(vary.pos - uCamMat[1].vector);
                for(var i=0;i<${r.lightShaderInfomation.posdirLightsNumber};i++){
                    var N = vec4<f32>(0.0);
                    var D = 0.0;
                    if(uWorldLight.posdirLights[i].density.w<-0.5){
                        D = 1.0;
                        N = uWorldLight.posdirLights[i].pos_dir;
                    }else
                     if(uWorldLight.posdirLights[i].density.w>0.5){
                        N = uWorldLight.posdirLights[i].pos_dir - vary.pos;
                        let len = length(N);
                        D = pow(len,1.0 - uWorldLight.posdirLights[i].density.w); // decay by distance
                        N /= len;
                    }else{
                        continue;
                    }
                    let halfvec = normalize(N + viewRay);
                    radiance += uWorldLight.posdirLights[i].density.rgb *  D * max(0.0,dot(vary.normal,N));
                    specularRadiance += uWorldLight.posdirLights[i].density.rgb *  D * max(0.0,pow(dot(vary.normal,halfvec),_shininess) ) ;
                }
                for(var i=0;i<${r.lightShaderInfomation.spotLightsNumber};i++){
                    if(uWorldLight.spotLights[i].density.w>0.5){
                        
                        var N = uWorldLight.spotLights[i].pos - vary.pos;
                        let len = length(N);
                        N /= len;
                        let penumbra = max(0.0,dot(N,uWorldLight.spotLights[i].dir)*uWorldLight.spotLights[i].params.x + uWorldLight.spotLights[i].params.y);
                        let D = pow(len,1.0-uWorldLight.spotLights[i].params.w) * pow(penumbra, uWorldLight.spotLights[i].params.z);
                        let halfvec = normalize(N + viewRay);
                        
                        radiance += uWorldLight.spotLights[i].density.rgb *  D * max(0.0,dot(vary.normal,N));
                        specularRadiance += uWorldLight.spotLights[i].density.rgb *  D * max(0.0,pow(dot(vary.normal,halfvec),_shininess) ) ;
                    }
                }
                return vec4<f32>(acesFilm((_color.rgb+blackColor) * radiance + _specular.rgb * specularRadiance), _color.a);`;
            }
            constructor(color: Color, shininess?: Float, specular?: Color) {
                color = makeColorOutput(color);
                specular = makeColorOutput(specular ?? [1, 1, 1]);
                shininess = makeFloatOutput(shininess ?? 20.0);
                super("Phong(" + color.identifier + "," + specular.identifier + "," + shininess.identifier + ")");
                this.input = { color, shininess, specular };
            }
        }
        export class CheckerTexture extends MaterialNode {
            declare output: "color";
            declare input: {
                color1: ColorOutputNode;
                color2: ColorOutputNode;
                uvw: Vec4OutputNode;
            }
            getCode(r: Renderer, root: Material, outputToken: string) {
                // Tell root material that CheckerTexture needs deal dependency of vary input uvw
                let { token, code } = this.getInputCode(r, root, outputToken);
                return code + `
                let ${outputToken}_checker = fract(${token.uvw}+vec4<f32>(0.001)) - vec4<f32>(0.5);
                let ${outputToken} = mix(${token.color1},${token.color2},step( ${outputToken}_checker.x * ${outputToken}_checker.y * ${outputToken}_checker.z * ${outputToken}_checker.w, 0.0));
                `;
            }
            constructor(color1: Color, color2: Color, uvw?: Vec4OutputNode) {
                color1 = makeColorOutput(color1);
                color2 = makeColorOutput(color2);
                uvw ??= new UVWVec4Input();
                super(`Checker(${color1.identifier},${color2.identifier},${uvw.identifier})`);
                this.input = { color1, color2, uvw };
            }
        }
        export class GridTexture extends MaterialNode {
            declare output: "color";
            declare input: {
                color1: ColorOutputNode;
                color2: ColorOutputNode;
                gridWidth: Vec4OutputNode;
                uvw: Vec4OutputNode;
            }
            getCode(r: Renderer, root: Material, outputToken: string) {
                // Tell root material that CheckerTexture needs deal dependency of vary input uvw
                let { token, code } = this.getInputCode(r, root, outputToken);
                return code + `
                let ${outputToken}_grid = step(${token.gridWidth}, fract(${token.uvw}));
                let ${outputToken} = mix(${token.color1},${token.color2},${outputToken}_grid.x*${outputToken}_grid.y*${outputToken}_grid.z);
                `;
            }
            constructor(color1: Color, color2: Color, gridWidth: number | math.Vec4 | Vec4OutputNode, uvw?: Vec4OutputNode) {
                color1 = makeColorOutput(color1);
                color2 = makeColorOutput(color2);
                gridWidth = !(gridWidth instanceof MaterialNode) ? new Vec4ConstValue(
                    (gridWidth instanceof math.Vec4) ? gridWidth : new math.Vec4(gridWidth, gridWidth, gridWidth, gridWidth)
                ) : gridWidth;
                uvw ??= new UVWVec4Input();
                super(`Grid(${color1.identifier},${color2.identifier}),${gridWidth.identifier},${uvw.identifier}`);
                this.input = { color1, color2, gridWidth, uvw };
            }
        }
        export class UVWVec4Input extends MaterialNode {
            declare output: "vec4";
            getCode(r: Renderer, root: Material, outputToken: string) {
                root.addVary("uvw");
                return `
                let ${outputToken} = vary.uvw;`;
            }
            constructor() {
                super("vary.uvw");
            }
        }
        export class Vec4TransformNode extends MaterialNode {
            declare output: "vec4";
            declare input: {
                vec4: Vec4OutputNode;
                transform: TransformOutputNode;
            }
            getCode(r: Renderer, root: Material, outputToken: string) {
                let input = this.getInputCode(r, root, outputToken);
                let affine = input.token.transform;
                return input.code + `
                let ${outputToken} = ${affine}.matrix * ${input.token.vec4} + ${affine}.vector;`;
            }
            constructor(vec4: Vec4OutputNode, transform: math.Obj4 | TransformOutputNode) {
                transform = (!(transform instanceof MaterialNode)) ? new TransformConstValue(transform) : transform;
                super("vec4tr(" + vec4.identifier + "," + transform.identifier + ")");
                this.input = { vec4, transform };
            }
        }
    }
}