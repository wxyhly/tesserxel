namespace tesserxel {
    export namespace four {
        type LightDensity = { r: number, g: number, b: number } | math.Vec3 | number[] | number;
        export class Light extends Object {
            density: math.Vec3;
            constructor(density: LightDensity) {
                super();
                this.density = color2Vec3(density);
            }
        }
        function color2Vec3(density: LightDensity) {
            if (density instanceof math.Vec3) return density;
            if ((density as { r: number, g: number, b: number }).r) {
                return new math.Vec3(
                    (density as { r: number, g: number, b: number }).r,
                    (density as { r: number, g: number, b: number }).g,
                    (density as { r: number, g: number, b: number }).b
                );
            }
            if (typeof density === "number") {
                return new math.Vec3(density, density, density);
            }
            if ((density as number[]).length === 3) {
                return new math.Vec3((density as number[])[0], (density as number[])[1], (density as number[])[2]);
            }
        }
        export class AmbientLight extends Light {
            needsUpdateCoord = false;
            constructor(density: LightDensity) {
                super(density);
            }
        }
        export class DirectionalLight extends Light {
            worldDirection = new math.Vec4;
            direction: math.Vec4;
            constructor(density: LightDensity, direction?: math.Vec4) {
                super(density ?? 1.0);
                this.direction = direction ?? math.Vec4.y.clone();
            }
        }
        export class SpotLight extends Light {
            worldDirection = new math.Vec4;
            direction: math.Vec4;
            angle: number;
            penumbra: number;
            decayPower: number = 3;
            constructor(density: LightDensity, angle: number, penumbra: number, direction?: math.Vec4) {
                super(density ?? 1.0);
                this.direction = direction ?? math.Vec4.y.clone();
                this.angle = angle;
                this.penumbra = penumbra;

            }
        }
        export class PointLight extends Light {
            decayPower: number = 3;
            constructor(density: LightDensity) {
                super(density);
            }
        }

        const ambientLightSize = 4 * 4;
        const structPosDirLightSize = 8 * 4;
        const structSpotLightLightSize = 16 * 4;
        const posdirLightsNumber = 8;
        const spotLightsNumber = 4;
        const spotLightOffset = ambientLightSize + posdirLightsNumber * structPosDirLightSize;
        const uWorldLightBufferSize = spotLightOffset + spotLightsNumber * structSpotLightLightSize;
        const lightCode = `
        struct PosDirLight{
            density: vec4<f32>,
            pos_dir: vec4<f32>,
        }
        struct SpotLight{
            density: vec4<f32>,
            pos: vec4<f32>,
            dir: vec4<f32>,
            params: vec4<f32>
        }
        const blackColor = vec3<f32>(0.02);
        struct WorldLight{
            ambientLightDensity: vec4<f32>,
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
        export function _initLightShader() {
            return { posdirLightsNumber, spotLightsNumber, lightCode, uWorldLightBufferSize };
        }
        export function _updateWorldLight(r: Renderer) {
            let offset = 0;
            r.jsBuffer.fill(0);
            r.ambientLightDensity.writeBuffer(r.jsBuffer); offset += 4;
            for (let dir of r.directionalLights) {
                dir.density.writeBuffer(r.jsBuffer, offset); offset += 4;
                r.jsBuffer[offset - 1] = -1.0; // marker for directional light ( < -0.5 in shader )
                dir.worldDirection.writeBuffer(r.jsBuffer, offset); offset += 4;
            }
            for (let pt of r.pointLights) {
                pt.density.writeBuffer(r.jsBuffer, offset); offset += 4;
                r.jsBuffer[offset - 1] = Math.abs(pt.decayPower) + 1; // decay power and also marker for point light ( > 0.5 in shader )
                pt.worldCoord.vec.writeBuffer(r.jsBuffer, offset); offset += 4;
            }
            offset = spotLightOffset >> 2;
            for (let spt of r.spotLights) {
                spt.density.writeBuffer(r.jsBuffer, offset); offset += 4;
                r.jsBuffer[offset - 1] = 1.0; // marker for spotLight
                spt.worldCoord.vec.writeBuffer(r.jsBuffer, offset); offset += 4;
                spt.worldDirection.writeBuffer(r.jsBuffer, offset); offset += 4;
                let cosineinv = 1 / (1 - Math.cos(spt.angle * math._DEG2RAD * 0.5));
                r.jsBuffer[offset] = cosineinv;
                r.jsBuffer[offset + 1] = 1 - cosineinv;
                r.jsBuffer[offset + 2] = spt.penumbra;
                r.jsBuffer[offset + 3] = Math.abs(spt.decayPower) + 1;
                offset += 4;
            }
            r.gpu.device.queue.writeBuffer(r.uWorldLightBuffer, 0, r.jsBuffer, 0, uWorldLightBufferSize >> 2);
        }
    }
}