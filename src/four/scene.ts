import { AffineMat4, Obj4 } from "../math/algebra/affine";
import { Vec3 } from "../math/algebra/vec3";
import { Vec4 } from "../math/algebra/vec4";
import { PerspectiveCamera } from "../math/geometry/camera";
import { AABB } from "../math/geometry/primitive";
import { tetra } from "../mesh/mesh";
import { TetraMesh } from "../mesh/tetra";
import { RaytracingPipeline, RaytracingPipelineDescriptor } from "../render/slice";
import { Material } from "./material";
import { Renderer } from "./renderer";

export class Scene {
    child: Object[] = [];
    backGroundColor: GPUColor;
    skyBox?: SkyBox;
    add(...obj: Object[]) {
        this.child.push(...obj);
    }
    removeChild(obj: Object) {
        let index = this.child.indexOf(obj);
        if (index !== -1) {
            this.child.splice(index, 1);
        } else {
            console.warn("Cannot remove a non-existed child");
        }
    }
    setBackgroudColor(color: GPUColor) {
        this.backGroundColor = color;
    }
}
export class Object extends Obj4 {
    child: Object[] = [];
    worldCoord: AffineMat4;
    needsUpdateCoord = true;
    alwaysUpdateCoord = false;
    constructor() {
        super();
        this.worldCoord = new AffineMat4();
    }
    updateCoord() {
        this.needsUpdateCoord = true;
        return this;
    }
    add(...obj: Object[]) {
        this.child.push(...obj);
    }
    removeChild(obj: Object) {
        let index = this.child.indexOf(obj);
        if (index !== -1) {
            this.child.splice(index, 1);
        } else {
            console.warn("Cannot remove a non-existed child");
        }
    }
}
export class Camera extends Object implements PerspectiveCamera {
    fov: number = 90;
    near: number = 0.1;
    far: number = 100;
    alwaysUpdateCoord = true;
    needsUpdate = true;
}
export class Mesh extends Object {
    geometry: Geometry;
    material: Material;
    uObjMatBuffer: GPUBuffer;
    bindGroup: GPUBindGroup;
    visible = true;
    constructor(geometry: Geometry, material: Material) {
        super();
        this.geometry = geometry;
        this.material = material;
    }
}
export class Geometry {
    jsBuffer: TetraMesh;
    gpuBuffer: { [name: string]: GPUBuffer };
    needsUpdate = true;
    dynamic: boolean = false;
    obb = new AABB;
    constructor(data: TetraMesh) {
        this.jsBuffer = data;
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
export class TesseractGeometry extends Geometry {
    constructor(size?: number | Vec4) {
        super(tetra.tesseract());
        if (size) tetra.applyObj4(this.jsBuffer, new Obj4(null, null,
            size instanceof Vec4 ? size : new Vec4(size, size, size, size)
        ));
    }
}
export class CubeGeometry extends Geometry {
    constructor(size?: number | Vec3) {
        super(tetra.clone(tetra.cube));
        if (size) tetra.applyObj4(this.jsBuffer, new Obj4(null, null,
            size instanceof Vec3 ? new Vec4(size.x, 1, size.y, size.z) : new Vec4(size, 1, size, size)
        ));
    }
}
export class GlomeGeometry extends Geometry {
    constructor(size: number = 1, detail: number = 2) {
        super(tetra.glome(size, detail * 8, detail * 8, detail * 6));
    }
}
export class SpheritorusGeometry extends Geometry {
    constructor(sphereRadius: number = 0.4, circleRadius: number = 1, detail: number = 2) {
        super(tetra.spheritorus(sphereRadius, detail * 8, detail * 6, circleRadius, detail * 8));
    }
}
export class TorisphereGeometry extends Geometry {
    constructor(circleRadius: number = 0.2, sphereRadius: number = 0.8, detail: number = 2) {
        super(tetra.torisphere(circleRadius, detail * 6, sphereRadius, detail * 8, detail * 6));
    }
}
export class SpherinderSideGeometry extends Geometry {
    constructor(sphereRadius1: number = 0.4, sphereRadius2: number = sphereRadius1, height: number = 1, detail: number = 2) {
        super(tetra.spherinderSide(sphereRadius1, sphereRadius2, detail * 8, detail * 6, height, detail * 2));
    }
}
export class TigerGeometry extends Geometry {
    constructor(circleRadius: number = 0.2, radius1: number = 0.8, radius2: number = 0.8, detail: number = 2) {
        super(tetra.tiger(radius1, detail * 8, radius2, detail * 8, circleRadius, detail * 6));
    }
}
export class ConvexHullGeometry extends Geometry {
    constructor(points: Vec4[]) {
        super(tetra.convexhull(points));
        console.assert(false, "todo: need to generate normal");
    }
}
export abstract class SkyBox {
    pipeline: RaytracingPipeline;
    uBuffer: GPUBuffer;
    jsBuffer: Float32Array;
    compiling = false;
    compiled = false;
    needsUpdate = true;
    bindGroups: GPUBindGroup[];
    readonly bufferSize: number;
    uuid: string;
    static readonly commonCode: string = `
    struct rayOut{
        @location(0) outO: vec4<f32>,
        @location(1) outR: vec4<f32>,
        @location(2) coord: vec3<f32>
    }
    @ray fn mainRay(
        @builtin(ray_origin) ro: vec4<f32>,
        @builtin(ray_direction) rd: vec4<f32>,
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
        @location(0) color: vec4<f32>,
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
    async compile(r: Renderer) {
        if (this.compiling || this.compiled) return;
        this.compiling = true;
        this.pipeline = await r.core.createRaytracingPipeline(this.getShaderCode());
        this.compiling = false;
        this.compiled = true;
    }
    abstract getShaderCode(): RaytracingPipelineDescriptor;
    constructor() {
    }
    getBindgroups(r: Renderer) {
        this.uBuffer = r.gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, this.bufferSize << 2, "uSimpleSky");
        this.bindGroups = [
            r.core.createVertexShaderBindGroup(this.pipeline, 1, [
                r.uCamMatBuffer,
                this.uBuffer
            ], "SimpleSkyBindgroup")
        ];
    }
    update(r: Renderer) {
        this.needsUpdate = false;
        r.gpu.device.queue.writeBuffer(this.uBuffer, 0, this.jsBuffer);
    }
}
export class SimpleSkyBox extends SkyBox {
    readonly bufferSize = 4;
    constructor() {
        super();
        this.jsBuffer = new Float32Array(this.bufferSize);
        this.setSunPosition(new Vec4(0.2, 0.9, 0.1, 0.3).norms());
    }
    setSunPosition(pos: Vec4) {
        this.needsUpdate = true;
        pos.writeBuffer(this.jsBuffer);
    }
    getSunPosition() {
        return new Vec4(this.jsBuffer[0], this.jsBuffer[1], this.jsBuffer[2], this.jsBuffer[3]);
    }
    getShaderCode(): RaytracingPipelineDescriptor {
        return {
            code: `
        @group(1) @binding(0) var<uniform> camMat: AffineMat;
        @group(1) @binding(1) var<uniform> sunDir: vec4<f32>;
        ${SkyBox.commonCode}
        const betaR = vec3<f32>(1.95e-2, 1.1e-1, 2.94e-1); 
        const betaM = vec3<f32>(4e-2, 4e-2, 4e-2);
        const Rayleigh = 1.0;
        const Mie = 1.0;
        const RayleighAtt = 1.0;
        const MieAtt = 1.2;
        const g = -0.9;
        fn sky (rd: vec4<f32>)->vec3<f32>{
            let D = normalize(rd);
            let t = max(0.001, D.y)*0.92+0.08;

            // optical depth -> zenithAngle
            let sR = RayleighAtt / t ;
            let sM = MieAtt / t ;
            let cosine = clamp(dot(D,normalize(sunDir)),0.0,1.0);
            let cosine2 =dot(D,normalize(sunDir))+1.0;
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
        @fragment fn mainFragment(@location(0) ro: vec4<f32>, @location(1) rd: vec4<f32>, @location(2) coord: vec3<f32>)->fOut{            
            return fOut(vec4<f32>(sky(rd),0.1),0.999999);
        }`,
            rayEntryPoint: "mainRay",
            fragmentEntryPoint: "mainFragment"
        }
    }
}

