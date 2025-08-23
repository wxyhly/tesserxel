import { AffineMat4, Obj4 } from "../math/algebra/affine.js";
import { Vec4 } from "../math/algebra/vec4.js";
import { generateUUID } from "../math/random.js";
import { TetraSlicePipeline } from "../render/slice/slice.js";
import { Renderer } from "./renderer.js";
import { Geometry } from "./scene.js";
import { _generateVertShader } from "./vertexshader.js";

export type ColorOutputNode = MaterialNode & { output: "color" };
export type Vec4OutputNode = MaterialNode & { output: "vec4" };
export type FloatOutputNode = MaterialNode & { output: "f32" };
export type TransformOutputNode = MaterialNode & { output: "affineMat4" };

/** An iterative structure for Material */
export class MaterialNode {
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
    pipeline: TetraSlicePipeline;
    uuid: string;
    bindGroup: GPUBindGroup[];
    bindGroupBuffers: GPUBuffer[] = [];
    fetchBuffers: string[] = [];
    declUniforms: { [name: string]: { location: number, type: string, buffer: GPUBuffer } } = {};
    declUniformLocation = 0;
    declVarys: string[] = [];
    declHeaders: { [name: string]: string };
    createBindGroup(r: Renderer, p: TetraSlicePipeline) {
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
    // when a subnode uses header, call this function to check whether headers are already included
    addHeader(key: string, value: string) {
        if (!this.declHeaders[key]) {
            this.declHeaders[key] = value;
        } else if (this.declHeaders[key] !== value) {
            console.warn(`Found multiple definition of header "${key}".`);
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
        this.declHeaders = {};
        // iteratively generate code
        let code = this.getCode(r, this, "");
        // deal no need for vary input
        let fsIn = this.declVarys.length ? 'vary: fourInputType' : "";
        let lightCode = r.lightShaderInfomation.lightCode;
        let headers = globalThis.Object.values(this.declHeaders).join("\n");
        // if no uniform at group0, then bind lights on 0, or 1
        if (this.declUniformLocation === 0) { lightCode = lightCode.replace("@group(1)", "@group(0)") }
        let header = headers + lightCode + `
    struct tsxAffineMat{
        matrix: mat4x4f,
        vector: vec4f,
    }
    @fragment fn main(${fsIn}) -> @location(0) vec4f {
        let ambientLightDensity = uWorldLight.ambientLightDensity.xyz;`; // avoid basic material doesn't call this uniform at all
        // if frag shader has input, we need to construct a struct fourInputType
        if (fsIn) {
            let struct = `    struct fourInputType{\n`;
            for (let i = 0, l = this.declVarys.length; i < l; i++) {
                struct += `        @location(${i}) ${this.declVarys[i]}: vec4f,\n`;
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
        this.uuid = generateUUID();
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
        super(`vec4f(${r.toFixed(MaterialNode.constFractionDigits)},${g.toFixed(MaterialNode.constFractionDigits)},${b.toFixed(MaterialNode.constFractionDigits)},${a.toFixed(MaterialNode.constFractionDigits)})`);
    }
}
class Vec4ConstValue extends ConstValue {
    declare output: "vec4";
    constructor(vec: Vec4) {
        super(`vec4f(${vec.flat().map(n => n.toFixed(MaterialNode.constFractionDigits)).join(",")})`);
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
    constructor(v: Obj4) {
        let afmat = v.getAffineMat4();
        let matEntries = afmat.mat.ts().elem.map(n => n.toFixed(MaterialNode.constFractionDigits)).join(",");
        let vecEntries = afmat.vec.flat().map(n => n.toFixed(MaterialNode.constFractionDigits)).join(",");
        super(`tsxAffineMat(mat4x4f(${matEntries}),vec4f(${vecEntries}))`);
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
        super("u" + generateUUID().replace(/\-/g, "").slice(16));
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
    type = "vec4f";
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
    type = "vec4f";
    gpuBufferSize = 4 * 4;
    value: Vec4;
    _update(r: Renderer) {
        this.value.writeBuffer(r.jsBuffer);
    }
    write(value: Vec4) {
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
    type = "tsxAffineMat";
    gpuBufferSize = 20 * 4;
    value: Obj4;
    private affineMatValue = new AffineMat4();
    _update(r: Renderer) {
        this.affineMatValue.setFromObj4(this.value).writeBuffer(r.jsBuffer);
    }
    write(value: Obj4) {
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
                    var N = vec4f(0.0);
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
                return vec4f(acesFilm((color.rgb + blackColor) * radiance), color.a);`;
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
        root.addUniform("array<tsxAffineMat,2>", "uCamMat", r.uCamMatBuffer);
        let { code } = this.getInputCode(r, root, outputToken);
        return code + `
                var radiance = ambientLightDensity;
                var specularRadiance = vec3<f32>(0.0);
                let viewRay = -normalize(vary.pos - uCamMat[1].vector);
                for(var i=0;i<${r.lightShaderInfomation.posdirLightsNumber};i++){
                    var N = vec4f(0.0);
                    var D = 0.0;
                    if(uWorldLight.posdirLights[i].density.w<-0.5){
                        D = 1.0;
                        N = uWorldLight.posdirLights[i].pos_dir;
                    }else if(uWorldLight.posdirLights[i].density.w>0.5){
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
                return vec4f(acesFilm((_color.rgb+blackColor) * radiance + _specular.rgb * specularRadiance), _color.a);`;
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
                let ${outputToken}_checker = fract(${token.uvw}+vec4f(0.001)) - vec4f(0.5);
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
export class WgslTexture extends MaterialNode {
    declare output: "color";
    declare input: {
        uvw: Vec4OutputNode;
    }
    private wgslCode: string;
    private entryPoint: string;
    getCode(r: Renderer, root: Material, outputToken: string) {
        root.addHeader(this.entryPoint, this.wgslCode);
        let { token, code } = this.getInputCode(r, root, outputToken);
        return code + `
                let ${outputToken} = ${this.entryPoint}(${token.uvw});
                `;
    }
    constructor(wgslCode: string, entryPoint: string, uvw?: Vec4OutputNode) {
        uvw ??= new UVWVec4Input();
        super(`Wgsl(${wgslCode},${uvw.identifier})`);
        this.wgslCode = wgslCode.replace(new RegExp("\b" + entryPoint + "\b", "g"), "##");
        this.input = { uvw };
        this.entryPoint = entryPoint;
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
    constructor(color1: Color, color2: Color, gridWidth: number | Vec4 | Vec4OutputNode, uvw?: Vec4OutputNode) {
        color1 = makeColorOutput(color1);
        color2 = makeColorOutput(color2);
        gridWidth = !(gridWidth instanceof MaterialNode) ? new Vec4ConstValue(
            (gridWidth instanceof Vec4) ? gridWidth : new Vec4(gridWidth, gridWidth, gridWidth, gridWidth)
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
export class WorldCoordVec4Input extends MaterialNode {
    declare output: "vec4";
    getCode(r: Renderer, root: Material, outputToken: string) {
        root.addVary("pos");
        return `
                let ${outputToken} = vary.pos;`;
    }
    constructor() {
        super("vary.pos");
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
    constructor(vec4: Vec4OutputNode, transform: Obj4 | TransformOutputNode) {
        transform = (!(transform instanceof MaterialNode)) ? new TransformConstValue(transform) : transform;
        super("vec4tr(" + vec4.identifier + "," + transform.identifier + ")");
        this.input = { vec4, transform };
    }
}
/** simplex 3D noise */
export const NoiseWGSLHeader = `
        fn mod289v3(x:vec3<f32>)->vec3<f32> {
            return x - floor(x * (1.0 / 289.0)) * 289.0; 
        }
        fn mod289v4(x:vec4f)->vec4f {
            return x - floor(x * (1.0 / 289.0)) * 289.0; 
        }
        fn mod289f(x:f32)->f32 {
            return x - floor(x * (1.0 / 289.0)) * 289.0; 
        }
        fn permutev4(x:vec4f)->vec4f {
            return mod289v4(((x * 34.0) + 1.0) * x);
        }
        fn permutef(x:f32)-> f32 {
            return mod289f(((x * 34.0) + 1.0) * x);
        }
        fn taylorInvSqrtv4(r:vec4f)->vec4f {
            return vec4(1.79284291400159) - 0.85373472095314 * r;
        }
        fn taylorInvSqrtf(r:f32)->f32{
            return 1.79284291400159 - 0.85373472095314 * r;
        }
        
        fn snoise(v1:vec3<f32>)->f32{
            let v = v1 + vec3(0.00001,0.00002,0.00003);
            const C = vec2(1.0/6.0, 1.0/3.0);
            const D = vec4(0.0, 0.5, 1.0, 2.0);

            // First corner
            var i  = floor(v + dot(v, vec3(C.y)) );
            let x0 =   v - i + dot(i, vec3(C.x)) ;

            // Other corners
            let g = step(x0.yzx, x0.xyz);
            let l = 1.0 - g;
            let i1 = min( g.xyz, l.zxy );
            let i2 = max( g.xyz, l.zxy );

            let x1 = x0 - i1 + vec3(C.x);
            let x2 = x0 - i2 + vec3(C.y); // 2.0*C.x = 1/3 = C.y
            let x3 = x0 - vec3(D.y);      // -1.0+3.0*C.x = -0.5 = -D.y

            // Permutations
            i = mod289v3(i);
            let p = permutev4( permutev4( permutev4(
                        vec4(i.z) + vec4(0.0, i1.z, i2.z, 1.0 ))
                    + vec4(i.y) + vec4(0.0, i1.y, i2.y, 1.0 ))
                    + vec4(i.x) + vec4(0.0, i1.x, i2.x, 1.0 ));

            // Gradients: 7x7 points over a square, mapped onto an octahedron.
            // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
            const n_ = 0.142857142857; // 1.0/7.0
            let  ns = n_ * D.wyz - D.xzx;

            let j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

            let x_ = floor(j * ns.z);
            let y_ = floor(j - 7.0 * x_ );    // mod(j,N)

            let x = x_ *ns.x + vec4(ns.y);
            let y = y_ *ns.x + vec4(ns.y);
            let h = 1.0 - abs(x) - abs(y);

            let b0 = vec4( x.xy, y.xy );
            let b1 = vec4( x.zw, y.zw );

            //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
            //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
            let s0 = floor(b0)*2.0 + 1.0;
            let s1 = floor(b1)*2.0 + 1.0;
            let sh = -step(h, vec4(0.0));

            let a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
            let a1 = b1.xzyw + s1.xzyw*sh.zzww ;

            var p0 = vec3(a0.xy,h.x);
            var p1 = vec3(a0.zw,h.y);
            var p2 = vec3(a1.xy,h.z);
            var p3 = vec3(a1.zw,h.w);

            //Normalise gradients
            let norm = taylorInvSqrtv4(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
            p0 *= norm.x;
            p1 *= norm.y;
            p2 *= norm.z;
            p3 *= norm.w;

            // Mix final noise value
            var m = max(vec4(0.6) - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), vec4(0.0));
            m = m * m;
            return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
        }
        `;

export class NoiseTexture extends MaterialNode {
    declare output: "f32";
    declare input: {
        uvw: Vec4OutputNode;
    }
    getCode(r: Renderer, root: Material, outputToken: string) {
        root.addHeader("NoiseWGSLHeader", NoiseWGSLHeader);
        let { token, code } = this.getInputCode(r, root, outputToken);
        return code + `
                let ${outputToken} = snoise(${token.uvw});
                `;
    }
    constructor(uvw?: Vec4OutputNode) {
        uvw ??= new UVWVec4Input();
        super(`Noise(${uvw.identifier})`);
        this.input = { uvw };
    }
}