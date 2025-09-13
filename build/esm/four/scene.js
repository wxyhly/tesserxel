import { Obj4, AffineMat4 } from '../math/algebra/affine.js';
import { Vec4 } from '../math/algebra/vec4.js';
import { AABB } from '../math/geometry/primitive.js';
import { TetraMesh } from '../mesh/tetra/tetramesh.js';
import '../mesh/tetra/geom.js';

class Scene {
    child = [];
    backGroundColor;
    skyBox;
    wireframe;
    add(...obj) {
        this.child.push(...obj);
    }
    removeChild(obj) {
        let index = this.child.indexOf(obj);
        if (index !== -1) {
            this.child.splice(index, 1);
        }
        else {
            console.warn("Cannot remove a non-existed child");
        }
    }
    setBackgroundColor(color) {
        this.backGroundColor = color;
    }
}
let Object$1 = class Object extends Obj4 {
    child = [];
    worldCoord;
    needsUpdateCoord = true;
    alwaysUpdateCoord = false;
    visible = true;
    constructor() {
        super();
        this.worldCoord = new AffineMat4();
    }
    updateCoord() {
        this.needsUpdateCoord = true;
        return this;
    }
    add(...obj) {
        this.child.push(...obj);
    }
    removeChild(obj) {
        let index = this.child.indexOf(obj);
        if (index !== -1) {
            this.child.splice(index, 1);
        }
        else {
            console.warn("Cannot remove a non-existed child");
        }
    }
};
class PerspectiveCamera extends Object$1 {
    fov = 90;
    near = 0.1;
    far = 100;
    alwaysUpdateCoord = true;
    needsUpdate = true;
}
class OrthographicCamera extends Object$1 {
    size = 2;
    near = -10;
    far = 10;
    alwaysUpdateCoord = true;
    needsUpdate = true;
}
class Mesh extends Object$1 {
    geometry;
    material;
    uObjMatBuffer;
    bindGroup;
    constructor(geometry, material) {
        super();
        this.geometry = geometry;
        this.material = material;
    }
}
class Geometry {
    jsBuffer;
    gpuBuffer;
    needsUpdate = true;
    dynamic = false;
    obb = new AABB;
    constructor(data) {
        this.jsBuffer = data instanceof TetraMesh ? data : new TetraMesh(data);
    }
    updateOBB() {
        let obb = this.obb;
        let pos = this.jsBuffer.position;
        obb.min.set(Infinity, Infinity, Infinity, Infinity);
        obb.max.set(-Infinity, -Infinity, -Infinity, -Infinity);
        for (let i = 0, l = this.jsBuffer.count << 4; i < l; i += 4) {
            obb.min.x = Math.min(obb.min.x, pos[i]);
            obb.min.y = Math.min(obb.min.y, pos[i + 1]);
            obb.min.z = Math.min(obb.min.z, pos[i + 2]);
            obb.min.w = Math.min(obb.min.w, pos[i + 3]);
            obb.max.x = Math.max(obb.max.x, pos[i]);
            obb.max.y = Math.max(obb.max.y, pos[i + 1]);
            obb.max.z = Math.max(obb.max.z, pos[i + 2]);
            obb.max.w = Math.max(obb.max.w, pos[i + 3]);
        }
    }
}
class SkyBox {
    pipeline;
    uBuffer;
    jsBuffer;
    compiling = false;
    compiled = false;
    needsUpdate = true;
    bindGroups;
    bufferSize;
    uuid;
    static commonCode = `
    struct rayOut{
        @location(0) outO: vec4f,
        @location(1) outR: vec4f,
        @location(2) coord: vec3<f32>
    }
    @ray fn mainRay(
        @builtin(ray_origin) ro: vec4f,
        @builtin(ray_direction) rd: vec4f,
        @builtin(voxel_coord) coord: vec3<f32>,
        @builtin(aspect_matrix) aspect: mat3x3<f32>
    ) -> rayOut {
        return rayOut(
            transpose(camMat.matrix)*(ro-camMat.vector),
            transpose(camMat.matrix)*rd,
            aspect * coord
        );
    }
    struct fOut{
        @location(0) color: vec4f,
        @builtin(frag_depth) depth: f32
    }
    
    // converted to 4D from shadertoy 3D: https://www.shadertoy.com/view/WtBXWw
    fn ACESFilm(x: vec3<f32>)->vec3<f32>
    {
        let tA = 2.51;
        let tB = vec3<f32>(0.03);
        let tC = 2.43;
        let tD = vec3<f32>(0.59);
        let tE = vec3<f32>(0.14);
        return clamp((x*(tA*x+tB))/(x*(tC*x+tD)+tE),vec3<f32>(0.0),vec3<f32>(1.0));
    }
    `;
    async compile(r) {
        if (this.compiling || this.compiled)
            return;
        this.compiling = true;
        this.pipeline = await r.core.createRaytracingPipeline(this.getShaderCode());
        this.compiling = false;
        this.compiled = true;
    }
    constructor() {
    }
    getBindgroups(r) {
        this.uBuffer = r.gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, this.bufferSize << 2, "uSimpleSky");
        this.bindGroups = [
            r.core.createVertexShaderBindGroup(this.pipeline, 1, [
                r.uCamMatBuffer,
                this.uBuffer
            ], "SimpleSkyBindgroup")
        ];
    }
    update(r) {
        this.needsUpdate = false;
        r.gpu.device.queue.writeBuffer(this.uBuffer, 0, this.jsBuffer.buffer);
    }
}
class SimpleSkyBox extends SkyBox {
    bufferSize = 8;
    constructor() {
        super();
        this.jsBuffer = new Float32Array(this.bufferSize);
        this.setSunPosition(new Vec4(0.2, 0.9, 0.1, 0.3).norms());
        this.setOpacity(0.2);
    }
    setSunPosition(pos) {
        this.needsUpdate = true;
        pos.writeBuffer(this.jsBuffer);
    }
    setOpacity(o) {
        this.needsUpdate = true;
        this.jsBuffer[4] = o;
    }
    getOpacity() {
        return this.jsBuffer[4];
    }
    getSunPosition() {
        return new Vec4(this.jsBuffer[0], this.jsBuffer[1], this.jsBuffer[2], this.jsBuffer[3]);
    }
    getShaderCode() {
        return {
            code: `
        struct UIn{
            sunDir: vec4f,
            opacity: f32
        }
        @group(1) @binding(0) var<uniform> camMat: tsxAffineMat;
        @group(1) @binding(1) var<uniform> uIn: UIn;
        ${SkyBox.commonCode}
        const betaR = vec3<f32>(1.95e-2, 1.1e-1, 2.94e-1); 
        const betaM = vec3<f32>(4e-2, 4e-2, 4e-2);
        const Rayleigh = 1.0;
        const Mie = 1.0;
        const RayleighAtt = 1.0;
        const MieAtt = 1.2;
        const g = -0.9;
        fn sky (rd: vec4f)->vec3<f32>{
            let D = normalize(rd);
            let t = max(0.001, D.y)*0.92+0.08;

            // optical depth -> zenithAngle
            let sR = RayleighAtt / t ;
            let sM = MieAtt / t ;
            let cosine = clamp(dot(D,normalize(uIn.sunDir)),0.0,1.0);
            let cosine2 =dot(D,normalize(uIn.sunDir))+1.0;
            let extinction = exp(-(betaR * sR + betaM * sM));

            // scattering phase
            let g2 = g * g;
            let fcos2 = cosine * cosine;
            let miePhase = Mie * pow(1.0 + g2 + 2.0 * g * cosine, -1.5) * (1.0 - g2) / (2.0 + g2);
            
            let rayleighPhase = Rayleigh;

            let inScatter = (1.0 + fcos2) * vec3<f32>(rayleighPhase + betaM / betaR * miePhase);

            var color = inScatter*(1.0-extinction) * 1.4;
            // sun
            color += 0.47*vec3<f32>(1.8,1.4,0.3)*pow( cosine, 350.0 ) * extinction;
            // sun haze
            color += 0.4*vec3<f32>(0.8,0.9,0.1)*pow( cosine2 *0.5, 2.0 )* extinction;
            color *= vec3<f32>(1.4,1.7,1.2);
            return ACESFilm(color);
        }
        @fragment fn mainFragment(@location(0) ro: vec4f, @location(1) rd: vec4f, @location(2) coord: vec3<f32>)->fOut{            
            return fOut(vec4f(sky(rd),uIn.opacity),0.999999);
        }`,
            rayEntryPoint: "mainRay",
            fragmentEntryPoint: "mainFragment"
        };
    }
}

export { Geometry, Mesh, Object$1 as Object, OrthographicCamera, PerspectiveCamera, Scene, SimpleSkyBox, SkyBox };
//# sourceMappingURL=scene.js.map
