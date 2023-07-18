import { Obj4 } from "../math/algebra/affine";
import { Vec3 } from "../math/algebra/vec3";
import { Vec4 } from "../math/algebra/vec4";
import { tetra } from "../mesh/mesh";
import { Geometry } from "./scene";

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