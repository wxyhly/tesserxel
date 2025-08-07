import { Obj4 } from "../math/algebra/affine.js";
import { Vec3 } from "../math/algebra/vec3.js";
import { Vec4 } from "../math/algebra/vec4.js";
import { CWMesh, tetra } from "../mesh/mesh.js";
import { Geometry } from "./scene.js";

export class TesseractGeometry extends Geometry {
    constructor(size?: number | Vec4) {
        super(tetra.tesseract());
        if (size) this.jsBuffer.applyObj4(new Obj4(null, null,
            size instanceof Vec4 ? size : new Vec4(size, size, size, size)
        ));
    }
}
export class CubeGeometry extends Geometry {
    constructor(size?: number | Vec3) {
        super(tetra.cube.clone());
        if (size) this.jsBuffer.applyObj4(new Obj4(null, null,
            size instanceof Vec3 ? new Vec4(size.x, 1, size.y, size.z) : new Vec4(size, 1, size, size)
        ));
    }
}
export class GlomeGeometry extends Geometry {
    constructor(size: number = 1, detail: number | { xy: number, zw: number, latitude: number } = 2) {
        if (typeof detail === "number")
            super(tetra.glome(size, detail * 8, detail * 8, detail * 6));
        else
            super(tetra.glome(size, detail.xy, detail.zw, detail.latitude));
    }
}
export class SpheritorusGeometry extends Geometry {
    constructor(sphereRadius: number = 0.4, circleRadius: number = 1, detail: number | { longitude: number, latitude: number, circle: number } = 2) {
        if (typeof detail === "number")
            super(tetra.spheritorus(sphereRadius, detail * 8, detail * 6, circleRadius, detail * 8));
        else
            super(tetra.spheritorus(sphereRadius, detail.longitude, detail.latitude, circleRadius, detail.circle));
    }
}
export class TorisphereGeometry extends Geometry {
    constructor(circleRadius: number = 0.2, sphereRadius: number = 0.8, detail: number | { longitude: number, latitude: number, circle: number } = 2) {
        if (typeof detail === "number")
            super(tetra.torisphere(circleRadius, detail * 6, sphereRadius, detail * 8, detail * 6));
        else
            super(tetra.torisphere(circleRadius, detail.circle, sphereRadius, detail.longitude, detail.latitude));
    }
}
export class SpherinderSideGeometry extends Geometry {
    constructor(sphereRadius1: number = 0.4, sphereRadius2: number = sphereRadius1, height: number = 1, detail: number | { longitude: number, latitude: number, height?: number } = 2) {
        if (typeof detail === "number")
            super(tetra.spherinderSide(sphereRadius1, sphereRadius2, detail * 8, detail * 6, height, detail * 2));
        else
            super(tetra.spherinderSide(sphereRadius1, sphereRadius2, detail.longitude, detail.latitude, height, detail.height));
    }
}
export class TigerGeometry extends Geometry {
    constructor(circleRadius: number = 0.2, radius1: number = 0.8, radius2: number = 0.8, detail: number | { xy: number, zw: number, circle: number } = 2) {
        if (typeof detail === "number")
            super(tetra.tiger(radius1, detail * 8, radius2, detail * 8, circleRadius, detail * 6));
        else
            super(tetra.tiger(radius1, detail.xy, radius2, detail.zw, circleRadius, detail.circle));
    }
}
export class DitorusGeometry extends Geometry {
    constructor(circleRadius: number = 0.2, radius1: number = 0.8, radius2: number = 0.4, detail: number | { major: number, middle: number, minor: number } = 2) {
        if (typeof detail === "number")
            super(tetra.ditorus(radius1, detail * 8, radius2, detail * 8, circleRadius, detail * 6));
        else
            super(tetra.ditorus(radius1, detail.major, radius2, detail.middle, circleRadius, detail.minor));
    }
}
export class DuocylinderGeometry extends Geometry {
    constructor(radius1: number = 0.8, radius2: number = 0.8, detail: number | { xy: number, zw: number } = 2) {
        if (typeof detail === "number")
            super(tetra.duocylinder(radius1, detail * 8, radius2, detail * 8));
        else
            super(tetra.duocylinder(radius1, detail.xy, radius2, detail.zw));
    }
}
export class ConvexHullGeometry extends Geometry {
    constructor(points: Vec4[]) {
        super(tetra.convexhull(points).generateNormal().setUVWAsPosition());
    }
}
export class CWMeshGeometry extends Geometry {
    constructor(cwmesh: CWMesh) {
        super(tetra.cwmesh(cwmesh).setUVWAsPosition());
    }
}