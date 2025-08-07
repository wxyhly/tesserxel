/// <reference types="@webgpu/types" />
import { Obj4 } from "../math/algebra/affine.js";
import { Vec4 } from "../math/algebra/vec4.js";
import { TetraSlicePipeline } from "../render/slice/slice.js";
import { Renderer } from "./renderer.js";
import { Geometry } from "./scene.js";
export declare type ColorOutputNode = MaterialNode & {
    output: "color";
};
export declare type Vec4OutputNode = MaterialNode & {
    output: "vec4";
};
export declare type FloatOutputNode = MaterialNode & {
    output: "f32";
};
export declare type TransformOutputNode = MaterialNode & {
    output: "affineMat4";
};
/** An iterative structure for Material */
export declare class MaterialNode {
    identifier: string;
    input: {
        [name: string]: MaterialNode;
    };
    output: string;
    static constFractionDigits: number;
    getCode(r: Renderer, root: Material, outputToken: string): string;
    getInputCode(r: Renderer, root: Material, token: string): {
        token: {
            [name: string]: string;
        };
        code: string;
    };
    update(r: Renderer): void;
    constructor(identifier: string);
}
/** Material is the top node of MaterialNode */
export declare class Material extends MaterialNode {
    cullMode: GPUCullMode;
    compiling: boolean;
    compiled: boolean;
    needsUpdate: boolean;
    output: string;
    pipeline: TetraSlicePipeline;
    uuid: string;
    bindGroup: GPUBindGroup[];
    bindGroupBuffers: GPUBuffer[];
    fetchBuffers: string[];
    declUniforms: {
        [name: string]: {
            location: number;
            type: string;
            buffer: GPUBuffer;
        };
    };
    declUniformLocation: number;
    declVarys: string[];
    declHeaders: {
        [name: string]: string;
    };
    createBindGroup(r: Renderer, p: TetraSlicePipeline): void;
    init(r: Renderer): void;
    compile(r: Renderer): Promise<void>;
    addVary(a: string): void;
    addHeader(key: string, value: string): void;
    addUniform(type: string, u: string, buffer: GPUBuffer): void;
    fetchBuffer(g: Geometry): GPUBuffer[];
    getShaderCode(r: Renderer): {
        vs: string;
        fs: string;
    };
    constructor(identifiers: string);
    gpuUniformBuffer: {
        [name: string]: GPUBuffer;
    };
}
/** the same UniformValue instance will share one uniform buffer */
declare class UniformValue extends MaterialNode {
    gpuBuffer: GPUBuffer;
    gpuBufferSize: number;
    jsBufferSize: number;
    type: string;
    needsUpdate: boolean;
    constructor();
    getCode(r: Renderer, root: Material, outputToken: string): string;
    createBuffer(r: Renderer): void;
    _update(r: Renderer): void;
    update(r: Renderer): void;
}
export declare class ColorUniformValue extends UniformValue {
    output: "color";
    type: string;
    gpuBufferSize: number;
    value: GPUColor;
    _update(r: Renderer): void;
    write(value: GPUColor): void;
}
export declare class Vec4UniformValue extends UniformValue {
    output: "vec4";
    type: string;
    gpuBufferSize: number;
    value: Vec4;
    _update(r: Renderer): void;
    write(value: Vec4): void;
}
export declare class FloatUniformValue extends UniformValue {
    output: "f32";
    type: string;
    gpuBufferSize: number;
    value: number;
    _update(r: Renderer): void;
    write(value: number): void;
}
export declare class TransformUniformValue extends UniformValue {
    output: "affineMat4";
    type: string;
    gpuBufferSize: number;
    value: Obj4;
    private affineMatValue;
    _update(r: Renderer): void;
    write(value: Obj4): void;
}
export declare type Color = GPUColor | ColorOutputNode;
export declare type Float = number | FloatOutputNode;
/** Basic material just return color node's output color  */
export declare class BasicMaterial extends Material {
    input: {
        color: ColorOutputNode;
    };
    constructor(color: Color);
    getCode(r: Renderer, root: Material, outputToken: string): string;
}
export declare class LambertMaterial extends Material {
    input: {
        color: ColorOutputNode;
    };
    getCode(r: Renderer, root: Material, outputToken: string): string;
    constructor(color: Color);
}
/** Blinn Phong */
export declare class PhongMaterial extends Material {
    input: {
        color: ColorOutputNode;
        specular: ColorOutputNode;
        shininess: FloatOutputNode;
    };
    getCode(r: Renderer, root: Material, outputToken: string): string;
    constructor(color: Color, shininess?: Float, specular?: Color);
}
export declare class CheckerTexture extends MaterialNode {
    output: "color";
    input: {
        color1: ColorOutputNode;
        color2: ColorOutputNode;
        uvw: Vec4OutputNode;
    };
    getCode(r: Renderer, root: Material, outputToken: string): string;
    constructor(color1: Color, color2: Color, uvw?: Vec4OutputNode);
}
export declare class WgslTexture extends MaterialNode {
    output: "color";
    input: {
        uvw: Vec4OutputNode;
    };
    private wgslCode;
    private entryPoint;
    getCode(r: Renderer, root: Material, outputToken: string): string;
    constructor(wgslCode: string, entryPoint: string, uvw?: Vec4OutputNode);
}
export declare class GridTexture extends MaterialNode {
    output: "color";
    input: {
        color1: ColorOutputNode;
        color2: ColorOutputNode;
        gridWidth: Vec4OutputNode;
        uvw: Vec4OutputNode;
    };
    getCode(r: Renderer, root: Material, outputToken: string): string;
    constructor(color1: Color, color2: Color, gridWidth: number | Vec4 | Vec4OutputNode, uvw?: Vec4OutputNode);
}
export declare class UVWVec4Input extends MaterialNode {
    output: "vec4";
    getCode(r: Renderer, root: Material, outputToken: string): string;
    constructor();
}
export declare class WorldCoordVec4Input extends MaterialNode {
    output: "vec4";
    getCode(r: Renderer, root: Material, outputToken: string): string;
    constructor();
}
export declare class Vec4TransformNode extends MaterialNode {
    output: "vec4";
    input: {
        vec4: Vec4OutputNode;
        transform: TransformOutputNode;
    };
    getCode(r: Renderer, root: Material, outputToken: string): string;
    constructor(vec4: Vec4OutputNode, transform: Obj4 | TransformOutputNode);
}
/** simplex 3D noise */
export declare const NoiseWGSLHeader = "\n        fn mod289v3(x:vec3<f32>)->vec3<f32> {\n            return x - floor(x * (1.0 / 289.0)) * 289.0; \n        }\n        fn mod289v4(x:vec4<f32>)->vec4<f32> {\n            return x - floor(x * (1.0 / 289.0)) * 289.0; \n        }\n        fn mod289f(x:f32)->f32 {\n            return x - floor(x * (1.0 / 289.0)) * 289.0; \n        }\n        fn permutev4(x:vec4<f32>)->vec4<f32> {\n            return mod289v4(((x * 34.0) + 1.0) * x);\n        }\n        fn permutef(x:f32)-> f32 {\n            return mod289f(((x * 34.0) + 1.0) * x);\n        }\n        fn taylorInvSqrtv4(r:vec4<f32>)->vec4<f32> {\n            return vec4(1.79284291400159) - 0.85373472095314 * r;\n        }\n        fn taylorInvSqrtf(r:f32)->f32{\n            return 1.79284291400159 - 0.85373472095314 * r;\n        }\n        \n        fn snoise(v1:vec3<f32>)->f32{\n            let v = v1 + vec3(0.00001,0.00002,0.00003);\n            const C = vec2(1.0/6.0, 1.0/3.0);\n            const D = vec4(0.0, 0.5, 1.0, 2.0);\n\n            // First corner\n            var i  = floor(v + dot(v, vec3(C.y)) );\n            let x0 =   v - i + dot(i, vec3(C.x)) ;\n\n            // Other corners\n            let g = step(x0.yzx, x0.xyz);\n            let l = 1.0 - g;\n            let i1 = min( g.xyz, l.zxy );\n            let i2 = max( g.xyz, l.zxy );\n\n            let x1 = x0 - i1 + vec3(C.x);\n            let x2 = x0 - i2 + vec3(C.y); // 2.0*C.x = 1/3 = C.y\n            let x3 = x0 - vec3(D.y);      // -1.0+3.0*C.x = -0.5 = -D.y\n\n            // Permutations\n            i = mod289v3(i);\n            let p = permutev4( permutev4( permutev4(\n                        vec4(i.z) + vec4(0.0, i1.z, i2.z, 1.0 ))\n                    + vec4(i.y) + vec4(0.0, i1.y, i2.y, 1.0 ))\n                    + vec4(i.x) + vec4(0.0, i1.x, i2.x, 1.0 ));\n\n            // Gradients: 7x7 points over a square, mapped onto an octahedron.\n            // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)\n            const n_ = 0.142857142857; // 1.0/7.0\n            let  ns = n_ * D.wyz - D.xzx;\n\n            let j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)\n\n            let x_ = floor(j * ns.z);\n            let y_ = floor(j - 7.0 * x_ );    // mod(j,N)\n\n            let x = x_ *ns.x + vec4(ns.y);\n            let y = y_ *ns.x + vec4(ns.y);\n            let h = 1.0 - abs(x) - abs(y);\n\n            let b0 = vec4( x.xy, y.xy );\n            let b1 = vec4( x.zw, y.zw );\n\n            //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;\n            //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;\n            let s0 = floor(b0)*2.0 + 1.0;\n            let s1 = floor(b1)*2.0 + 1.0;\n            let sh = -step(h, vec4(0.0));\n\n            let a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\n            let a1 = b1.xzyw + s1.xzyw*sh.zzww ;\n\n            var p0 = vec3(a0.xy,h.x);\n            var p1 = vec3(a0.zw,h.y);\n            var p2 = vec3(a1.xy,h.z);\n            var p3 = vec3(a1.zw,h.w);\n\n            //Normalise gradients\n            let norm = taylorInvSqrtv4(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n            p0 *= norm.x;\n            p1 *= norm.y;\n            p2 *= norm.z;\n            p3 *= norm.w;\n\n            // Mix final noise value\n            var m = max(vec4(0.6) - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), vec4(0.0));\n            m = m * m;\n            return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );\n        }\n        ";
export declare class NoiseTexture extends MaterialNode {
    output: "f32";
    input: {
        uvw: Vec4OutputNode;
    };
    getCode(r: Renderer, root: Material, outputToken: string): string;
    constructor(uvw?: Vec4OutputNode);
}
export {};
