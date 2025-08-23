import { Vec3 } from '../math/algebra/vec3.js';
import { Vec4 } from '../math/algebra/vec4.js';
import { _DEG2RAD } from '../math/const.js';
import { Object as Object$1 } from './scene.js';

class Light extends Object$1 {
    density;
    constructor(density) {
        super();
        this.density = color2Vec3(density);
    }
}
function color2Vec3(density) {
    if (density instanceof Vec3)
        return density;
    if (density.r) {
        return new Vec3(density.r, density.g, density.b);
    }
    if (typeof density === "number") {
        return new Vec3(density, density, density);
    }
    if (density.length === 3) {
        return new Vec3(density[0], density[1], density[2]);
    }
}
class AmbientLight extends Light {
    needsUpdateCoord = false;
    constructor(density) {
        super(density);
    }
}
class DirectionalLight extends Light {
    worldDirection = new Vec4;
    direction;
    constructor(density, direction) {
        super(density ?? 1.0);
        this.direction = direction ?? Vec4.y.clone();
    }
}
class SpotLight extends Light {
    worldDirection = new Vec4;
    direction;
    angle;
    penumbra;
    decayPower = 3;
    constructor(density, angle, penumbra, direction) {
        super(density ?? 1.0);
        this.direction = direction ?? Vec4.y.clone();
        this.angle = angle;
        this.penumbra = penumbra;
    }
}
class PointLight extends Light {
    decayPower = 3;
    constructor(density) {
        super(density);
    }
}
const ambientLightSize = 4 * 4;
const structPosDirLightSize = 8 * 4;
const structSpotLightLightSize = 16 * 4;
let spotLightOffset;
let uWorldLightBufferSize;
function _initLightShader(config) {
    const posdirLightsNumber = config?.posdirLightsNumber ?? 8;
    const spotLightsNumber = config?.spotLightsNumber ?? 4;
    spotLightOffset = ambientLightSize + posdirLightsNumber * structPosDirLightSize;
    uWorldLightBufferSize = spotLightOffset + spotLightsNumber * structSpotLightLightSize;
    const lightCode = `
struct PosDirLight{
    density: vec4f,
    pos_dir: vec4f,
}
struct SpotLight{
    density: vec4f,
    pos: vec4f,
    dir: vec4f,
    params: vec4f
}
const blackColor = vec3<f32>(0.02);
struct WorldLight{
    ambientLightDensity: vec4f,
    posdirLights: array<PosDirLight,${posdirLightsNumber}>,
    spotLights: array<SpotLight,${spotLightsNumber}>,
}
fn acesFilm(x: vec3<f32>)-> vec3<f32> {
    const a: f32 = 2.51;
    const b: f32 = 0.03;
    const c: f32 = 2.43;
    const d: f32 = 0.59;
    const e: f32 = 0.14;
    return clamp((x * (a * x + b)) / (x * (c * x + d ) + e), vec3<f32>(0.0), vec3<f32>(1.0));
}
@group(1) @binding(0) var<uniform> uWorldLight: WorldLight;
`;
    return { posdirLightsNumber, spotLightsNumber, lightCode, uWorldLightBufferSize };
}
function _updateWorldLight(r) {
    let offset = 0;
    r.jsBuffer.fill(0);
    r.ambientLightDensity.writeBuffer(r.jsBuffer);
    offset += 4;
    for (let dir of r.directionalLights) {
        dir.density.writeBuffer(r.jsBuffer, offset);
        offset += 4;
        r.jsBuffer[offset - 1] = -1; // marker for directional light ( < -0.5 in shader )
        dir.worldDirection.writeBuffer(r.jsBuffer, offset);
        offset += 4;
    }
    for (let pt of r.pointLights) {
        pt.density.writeBuffer(r.jsBuffer, offset);
        offset += 4;
        r.jsBuffer[offset - 1] = Math.abs(pt.decayPower) + 1; // decay power and also marker for point light ( > 0.5 in shader )
        pt.worldCoord.vec.writeBuffer(r.jsBuffer, offset);
        offset += 4;
    }
    offset = spotLightOffset >> 2;
    for (let spt of r.spotLights) {
        spt.density.writeBuffer(r.jsBuffer, offset);
        offset += 4;
        r.jsBuffer[offset - 1] = 1.0; // marker for spotLight
        spt.worldCoord.vec.writeBuffer(r.jsBuffer, offset);
        offset += 4;
        spt.worldDirection.writeBuffer(r.jsBuffer, offset);
        offset += 4;
        let cosineinv = 1 / (1 - Math.cos(spt.angle * _DEG2RAD * 0.5));
        r.jsBuffer[offset] = cosineinv;
        r.jsBuffer[offset + 1] = 1 - cosineinv;
        r.jsBuffer[offset + 2] = spt.penumbra;
        r.jsBuffer[offset + 3] = Math.abs(spt.decayPower) + 1;
        offset += 4;
    }
    r.gpu.device.queue.writeBuffer(r.uWorldLightBuffer, 0, r.jsBuffer, 0, uWorldLightBufferSize >> 2);
}

export { AmbientLight, DirectionalLight, Light, PointLight, SpotLight, _initLightShader, _updateWorldLight };
//# sourceMappingURL=light.js.map
