import { Vec3 } from "../math/algebra/vec3.js";
import { Vec4 } from "../math/algebra/vec4.js";
import { Renderer, RendererConfig } from "./renderer.js";
import { Object } from "./scene.js";
declare type LightDensity = {
    r: number;
    g: number;
    b: number;
} | Vec3 | number[] | number;
export declare class Light extends Object {
    density: Vec3;
    constructor(density: LightDensity);
}
export declare class AmbientLight extends Light {
    needsUpdateCoord: boolean;
    constructor(density: LightDensity);
}
export declare class DirectionalLight extends Light {
    worldDirection: Vec4;
    direction: Vec4;
    constructor(density: LightDensity, direction?: Vec4);
}
export declare class SpotLight extends Light {
    worldDirection: Vec4;
    direction: Vec4;
    angle: number;
    penumbra: number;
    decayPower: number;
    constructor(density: LightDensity, angle: number, penumbra: number, direction?: Vec4);
}
export declare class PointLight extends Light {
    decayPower: number;
    constructor(density: LightDensity);
}
export declare function _initLightShader(config?: RendererConfig): {
    posdirLightsNumber: number;
    spotLightsNumber: number;
    lightCode: string;
    uWorldLightBufferSize: number;
};
export declare function _updateWorldLight(r: Renderer): void;
export {};
