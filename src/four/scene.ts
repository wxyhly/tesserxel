import { AffineMat4, Obj4 } from "../math/algebra/affine";
import { Vec3 } from "../math/algebra/vec3";
import { Vec4 } from "../math/algebra/vec4";
import { PerspectiveCamera } from "../math/geometry/camera";
import { AABB } from "../math/geometry/primitive";
import { tetra } from "../mesh/mesh";
import { TetraMesh } from "../mesh/tetra";
import { Material } from "./material";

export class Scene {
    child: Object[] = [];
    backGroundColor: GPUColor;
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
    constructor(size?: number) {
        super(tetra.glome(size ?? 1, 16, 16, 12));
    }
}
export class SpheritorusGeometry extends Geometry {
    constructor(sphereRadius: number = 0.4, circleRadius: number = 1) {
        super(tetra.spheritorus(sphereRadius, 16, 12, circleRadius, 16));
    }
}
export class TorisphereGeometry extends Geometry {
    constructor(circleRadius: number = 0.2, sphereRadius: number = 0.8) {
        super(tetra.torisphere(circleRadius, 12, sphereRadius, 16, 12));
    }
}
export class SpherinderSideGeometry extends Geometry {
    constructor(sphereRadius: number = 0.4, height: number = 1) {
        super(tetra.spherinderSide(sphereRadius, 16, 12, height));
    }
}
export class TigerGeometry extends Geometry {
    constructor(circleRadius: number = 0.2, radius1: number = 0.8, radius2: number = 0.8) {
        super(tetra.tiger(radius1, 16, radius2, 16, circleRadius, 12));
    }
}
export class ConvexHullGeometry extends Geometry {
    constructor(points: Vec4[]) {
        super(tetra.convexhull(points));
        console.assert(false, "todo: need to generate normal");
    }
}