import { AffineMat4 } from '../math/algebra/affine.js';
import { Vec4 } from '../math/algebra/vec4.js';
import { generateUUID } from '../math/random.js';
import { _generateVertShader } from './vertexshader.js';

/** An iterative structure for Material */
class MaterialNode {
    identifier;
    input = {};
    output;
    static constFractionDigits = 4;
    getCode(r, root, outputToken) { return ""; }
    getInputCode(r, root, token) {
        let out = {};
        let code = "";
        for (let [name, node] of globalThis.Object.entries(this.input)) {
            let inputToken = token + "_" + name;
            out[name] = inputToken;
            code += node.getCode(r, root, inputToken) + "\n";
        }
        return { token: out, code };
    }
    update(r) {
        for (let node of globalThis.Object.values(this.input)) {
            node.update(r);
        }
    }
    constructor(identifier) { this.identifier = identifier; }
}
/** Material is the top node of MaterialNode */
class Material extends MaterialNode {
    cullMode = "front";
    compiling = false;
    compiled = false;
    needsUpdate = true;
    output = "shader";
    pipeline;
    uuid;
    bindGroup;
    bindGroupBuffers = [];
    fetchBuffers = [];
    declUniforms = {};
    declUniformLocation = 0;
    declVarys = [];
    declHeaders;
    createBindGroup(r, p) {
        this.bindGroup = this.bindGroupBuffers.length ? [r.core.createFragmentShaderBindGroup(p, 0, this.bindGroupBuffers)] : [];
    }
    init(r) {
        this.getShaderCode(r); // scan code to get binding infomations
        this.compiling = false;
        this.compiled = true;
    }
    async compile(r) {
        this.compiling = true;
        r.pullPipeline(this.identifier, "compiling");
        let { vs, fs } = this.getShaderCode(r);
        this.pipeline = await r.core.createTetraSlicePipeline({
            vertex: { code: vs, entryPoint: "main" },
            fragment: { code: fs, entryPoint: "fourMain" },
            cullMode: this.cullMode
        });
        r.pullPipeline(this.identifier, this.pipeline);
        this.compiling = false;
        this.compiled = true;
    }
    // when a subnode uses vary input, call this function to check attribute buffer and construct input structure
    addVary(a) {
        if (!this.declVarys.includes(a)) {
            this.declVarys.push(a);
        }
        if (a == "pos")
            return;
        if (!this.fetchBuffers.includes(a)) {
            this.fetchBuffers.push(a);
        }
    }
    // when a subnode uses header, call this function to check whether headers are already included
    addHeader(key, value) {
        if (!this.declHeaders[key]) {
            this.declHeaders[key] = value;
        }
        else if (this.declHeaders[key] !== value) {
            console.warn(`Found multiple definition of header "${key}".`);
        }
    }
    // when a subnode uses uniform, call this function to add uniform globally
    addUniform(type, u, buffer) {
        if (!this.declUniforms[u]) {
            this.declUniforms[u] = { location: this.declUniformLocation++, type, buffer };
            this.bindGroupBuffers.push(buffer);
        }
    }
    fetchBuffer(g) {
        //sort buffer fetchBuffers
        return [g.gpuBuffer["position"], ...this.fetchBuffers.map(b => g.gpuBuffer[b])];
    }
    getShaderCode(r) {
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
        if (this.declUniformLocation === 0) {
            lightCode = lightCode.replace("@group(1)", "@group(0)");
        }
        let header = headers + lightCode + `
    struct tsxAffineMat{
        matrix: mat4x4f,
        vector: vec4f,
    }
    @fragment fn fourMain(${fsIn}) -> @location(0) vec4f {
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
    constructor(identifiers) {
        super(identifiers);
        this.uuid = generateUUID();
    }
    gpuUniformBuffer;
}
/** ConstValue will be hardcoded in shader */
class ConstValue extends MaterialNode {
    getCode(r, root, outputToken) {
        return `
                const ${outputToken} = ${this.identifier};`;
    }
    constructor(identifier) {
        super(identifier);
    }
}
class ColorConstValue extends ConstValue {
    constructor(color) {
        let r = color?.r ?? color[0] ?? 0;
        let g = color?.g ?? color[1] ?? 0;
        let b = color?.b ?? color[2] ?? 0;
        let a = color?.a ?? color[3] ?? 1;
        super(`vec4f(${r.toFixed(MaterialNode.constFractionDigits)},${g.toFixed(MaterialNode.constFractionDigits)},${b.toFixed(MaterialNode.constFractionDigits)},${a.toFixed(MaterialNode.constFractionDigits)})`);
    }
}
class Vec4ConstValue extends ConstValue {
    constructor(vec) {
        super(`vec4f(${vec.flat().map(n => n.toFixed(MaterialNode.constFractionDigits)).join(",")})`);
    }
}
class FloatConstValue extends ConstValue {
    constructor(f) {
        super(f.toFixed(MaterialNode.constFractionDigits));
    }
}
class TransformConstValue extends ConstValue {
    constructor(v) {
        let afmat = v.getAffineMat4();
        let matEntries = afmat.mat.ts().elem.map(n => n.toFixed(MaterialNode.constFractionDigits)).join(",");
        let vecEntries = afmat.vec.flat().map(n => n.toFixed(MaterialNode.constFractionDigits)).join(",");
        super(`tsxAffineMat(mat4x4f(${matEntries}),vec4f(${vecEntries}))`);
    }
}
/** the same UniformValue instance will share one uniform buffer */
class UniformValue extends MaterialNode {
    gpuBuffer;
    gpuBufferSize;
    jsBufferSize;
    type;
    needsUpdate = true;
    constructor() {
        super("u" + generateUUID().replace(/\-/g, "").slice(16));
    }
    getCode(r, root, outputToken) {
        if (!this.gpuBuffer) {
            this.createBuffer(r);
        }
        root.addUniform(this.type, this.identifier, this.gpuBuffer);
        return `
                let ${outputToken} = ${this.identifier};`;
    }
    createBuffer(r) {
        this.gpuBuffer = r.gpu.createBuffer(GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM, this.gpuBufferSize, "uConstValueBuffer");
        this.jsBufferSize = this.gpuBufferSize >> 2;
    }
    _update(r) { }
    update(r) {
        if (!this.needsUpdate)
            return;
        this._update(r);
        r.gpu.device.queue.writeBuffer(this.gpuBuffer, 0, r.jsBuffer, 0, this.jsBufferSize);
        this.needsUpdate = false;
    }
}
class ColorUniformValue extends UniformValue {
    type = "vec4f";
    gpuBufferSize = 4 * 4;
    value;
    _update(r) {
        r.jsBuffer[0] = this.value?.r ?? this.value[0] ?? 0;
        r.jsBuffer[1] = this.value?.g ?? this.value[1] ?? 0;
        r.jsBuffer[2] = this.value?.b ?? this.value[2] ?? 0;
        r.jsBuffer[3] = this.value?.a ?? this.value[3] ?? 1;
    }
    write(value) {
        this.value = value;
        this.needsUpdate = true;
    }
}
class Vec4UniformValue extends UniformValue {
    type = "vec4f";
    gpuBufferSize = 4 * 4;
    value;
    _update(r) {
        this.value.writeBuffer(r.jsBuffer);
    }
    write(value) {
        this.value = value;
        this.needsUpdate = true;
    }
}
class FloatUniformValue extends UniformValue {
    type = "f32";
    gpuBufferSize = 4;
    value;
    _update(r) {
        r.jsBuffer[0] = this.value;
    }
    write(value) {
        this.value = value;
        this.needsUpdate = true;
    }
}
class TransformUniformValue extends UniformValue {
    type = "tsxAffineMat";
    gpuBufferSize = 20 * 4;
    value;
    affineMatValue = new AffineMat4();
    _update(r) {
        this.affineMatValue.setFromObj4(this.value).writeBuffer(r.jsBuffer);
    }
    write(value) {
        this.value = value;
        this.needsUpdate = true;
    }
}
/** A shortcut path for writing a constant color */
function makeColorOutput(color) {
    if (!(color instanceof MaterialNode))
        color = new ColorConstValue(color);
    return color;
}
/** A shortcut path for writing a constant color */
function makeFloatOutput(f) {
    if (!(f instanceof MaterialNode))
        f = new FloatConstValue(f);
    return f;
}
/** Basic material just return color node's output color  */
class BasicMaterial extends Material {
    constructor(color) {
        color = makeColorOutput(color);
        super("Basic(" + color.identifier + ")");
        this.input = { color };
    }
    getCode(r, root, outputToken) {
        let color = this.input.color.getCode(r, root, "color");
        return color + `
                return color;`;
    }
}
class LambertMaterial extends Material {
    getCode(r, root, outputToken) {
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
    constructor(color) {
        color = makeColorOutput(color);
        super("Lambert(" + color.identifier + ")");
        this.input = { color };
    }
}
/** Blinn Phong */
class PhongMaterial extends Material {
    getCode(r, root, outputToken) {
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
    constructor(color, shininess, specular) {
        color = makeColorOutput(color);
        specular = makeColorOutput(specular ?? [1, 1, 1]);
        shininess = makeFloatOutput(shininess ?? 20.0);
        super("Phong(" + color.identifier + "," + specular.identifier + "," + shininess.identifier + ")");
        this.input = { color, shininess, specular };
    }
}
class CheckerTexture extends MaterialNode {
    getCode(r, root, outputToken) {
        // Tell root material that CheckerTexture needs deal dependency of vary input uvw
        let { token, code } = this.getInputCode(r, root, outputToken);
        return code + `
                let ${outputToken}_checker = fract(${token.uvw}+vec4f(0.001)) - vec4f(0.5);
                let ${outputToken} = mix(${token.color1},${token.color2},step( ${outputToken}_checker.x * ${outputToken}_checker.y * ${outputToken}_checker.z * ${outputToken}_checker.w, 0.0));
                `;
    }
    constructor(color1, color2, uvw) {
        color1 = makeColorOutput(color1);
        color2 = makeColorOutput(color2);
        uvw ??= new UVWVec4Input();
        super(`Checker(${color1.identifier},${color2.identifier},${uvw.identifier})`);
        this.input = { color1, color2, uvw };
    }
}
class WgslTexture extends MaterialNode {
    wgslCode;
    entryPoint;
    getCode(r, root, outputToken) {
        root.addHeader(this.entryPoint, this.wgslCode);
        let { token, code } = this.getInputCode(r, root, outputToken);
        return code + `
                let ${outputToken} = ${this.entryPoint}(${token.uvw});
                `;
    }
    constructor(wgslCode, entryPoint, uvw) {
        uvw ??= new UVWVec4Input();
        super(`Wgsl(${wgslCode},${uvw.identifier})`);
        this.wgslCode = wgslCode.replace(new RegExp("\b" + entryPoint + "\b", "g"), "##");
        this.input = { uvw };
        this.entryPoint = entryPoint;
    }
}
class GridTexture extends MaterialNode {
    getCode(r, root, outputToken) {
        // Tell root material that CheckerTexture needs deal dependency of vary input uvw
        let { token, code } = this.getInputCode(r, root, outputToken);
        return code + `
                let ${outputToken}_grid = step(${token.gridWidth}, fract(${token.uvw}));
                let ${outputToken} = mix(${token.color1},${token.color2},${outputToken}_grid.x*${outputToken}_grid.y*${outputToken}_grid.z);
                `;
    }
    constructor(color1, color2, gridWidth, uvw) {
        color1 = makeColorOutput(color1);
        color2 = makeColorOutput(color2);
        gridWidth = !(gridWidth instanceof MaterialNode) ? new Vec4ConstValue((gridWidth instanceof Vec4) ? gridWidth : new Vec4(gridWidth, gridWidth, gridWidth, gridWidth)) : gridWidth;
        uvw ??= new UVWVec4Input();
        super(`Grid(${color1.identifier},${color2.identifier}),${gridWidth.identifier},${uvw.identifier}`);
        this.input = { color1, color2, gridWidth, uvw };
    }
}
class UVWVec4Input extends MaterialNode {
    getCode(r, root, outputToken) {
        root.addVary("uvw");
        return `
                let ${outputToken} = vary.uvw;`;
    }
    constructor() {
        super("vary.uvw");
    }
}
class WorldCoordVec4Input extends MaterialNode {
    getCode(r, root, outputToken) {
        root.addVary("pos");
        return `
                let ${outputToken} = vary.pos;`;
    }
    constructor() {
        super("vary.pos");
    }
}
class Vec4TransformNode extends MaterialNode {
    getCode(r, root, outputToken) {
        let input = this.getInputCode(r, root, outputToken);
        let affine = input.token.transform;
        return input.code + `
                let ${outputToken} = ${affine}.matrix * ${input.token.vec4} + ${affine}.vector;`;
    }
    constructor(vec4, transform) {
        transform = (!(transform instanceof MaterialNode)) ? new TransformConstValue(transform) : transform;
        super("vec4tr(" + vec4.identifier + "," + transform.identifier + ")");
        this.input = { vec4, transform };
    }
}
/** simplex 3D noise */
const NoiseWGSLHeader = `
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
class ColorMixer extends MaterialNode {
    getCode(r, root, outputToken) {
        // Tell root material that CheckerTexture needs deal dependency of vary input uvw
        let { token, code } = this.getInputCode(r, root, outputToken);
        return code + `
                let ${outputToken} = mix(${token.color1},${token.color2},${token.mix});
                `;
    }
    constructor(color1, color2, mix) {
        color1 = makeColorOutput(color1);
        color2 = makeColorOutput(color2);
        mix = makeFloatOutput(mix);
        super(`Mixer(${color1.identifier},${color2.identifier},${mix.identifier})`);
        this.input = { color1, color2, mix };
    }
}
class NoiseTexture extends MaterialNode {
    getCode(r, root, outputToken) {
        root.addHeader("NoiseWGSLHeader", NoiseWGSLHeader);
        let { token, code } = this.getInputCode(r, root, outputToken);
        return code + `
                let ${outputToken} = snoise(${token.uvw});
                `;
    }
    constructor(uvw) {
        uvw ??= new UVWVec4Input();
        super(`Noise(${uvw.identifier})`);
        this.input = { uvw };
    }
}

export { BasicMaterial, CheckerTexture, ColorMixer, ColorUniformValue, FloatUniformValue, GridTexture, LambertMaterial, Material, MaterialNode, NoiseTexture, NoiseWGSLHeader, PhongMaterial, TransformUniformValue, UVWVec4Input, Vec4TransformNode, Vec4UniformValue, WgslTexture, WorldCoordVec4Input };
//# sourceMappingURL=material.js.map
