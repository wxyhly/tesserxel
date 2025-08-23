import { Obj4 } from '../math/algebra/affine.js';
import { Vec3 } from '../math/algebra/vec3.js';
import { Vec4 } from '../math/algebra/vec4.js';
import '../mesh/face/geom.js';
import { tesseract, cube, glome, spheritorus, torisphere, spherinderSide, tiger, ditorus, duocylinder, convexhull, cwmesh } from '../mesh/tetra/geom.js';
import '../math/algebra/vec2.js';
import '../math/algebra/mat3.js';
import '../math/algebra/mat2.js';
import '../math/algebra/cplx.js';
import { Geometry } from './scene.js';

class TesseractGeometry extends Geometry {
    constructor(size) {
        super(tesseract());
        if (size)
            this.jsBuffer.applyObj4(new Obj4(null, null, size instanceof Vec4 ? size : new Vec4(size, size, size, size)));
    }
}
class CubeGeometry extends Geometry {
    constructor(size) {
        super(cube.clone());
        if (size)
            this.jsBuffer.applyObj4(new Obj4(null, null, size instanceof Vec3 ? new Vec4(size.x, 1, size.y, size.z) : new Vec4(size, 1, size, size)));
    }
}
class GlomeGeometry extends Geometry {
    constructor(size = 1, detail = 2) {
        if (typeof detail === "number")
            super(glome(size, detail * 8, detail * 8, detail * 6));
        else
            super(glome(size, detail.xy, detail.zw, detail.latitude));
    }
}
class SpheritorusGeometry extends Geometry {
    constructor(sphereRadius = 0.4, circleRadius = 1, detail = 2) {
        if (typeof detail === "number")
            super(spheritorus(sphereRadius, detail * 8, detail * 6, circleRadius, detail * 8));
        else
            super(spheritorus(sphereRadius, detail.longitude, detail.latitude, circleRadius, detail.circle));
    }
}
class TorisphereGeometry extends Geometry {
    constructor(circleRadius = 0.2, sphereRadius = 0.8, detail = 2) {
        if (typeof detail === "number")
            super(torisphere(circleRadius, detail * 6, sphereRadius, detail * 8, detail * 6));
        else
            super(torisphere(circleRadius, detail.circle, sphereRadius, detail.longitude, detail.latitude));
    }
}
class SpherinderSideGeometry extends Geometry {
    constructor(sphereRadius1 = 0.4, sphereRadius2 = sphereRadius1, height = 1, detail = 2) {
        if (typeof detail === "number")
            super(spherinderSide(sphereRadius1, sphereRadius2, detail * 8, detail * 6, height, detail * 2));
        else
            super(spherinderSide(sphereRadius1, sphereRadius2, detail.longitude, detail.latitude, height, detail.height));
    }
}
class TigerGeometry extends Geometry {
    constructor(circleRadius = 0.2, radius1 = 0.8, radius2 = 0.8, detail = 2) {
        if (typeof detail === "number")
            super(tiger(radius1, detail * 8, radius2, detail * 8, circleRadius, detail * 6));
        else
            super(tiger(radius1, detail.xy, radius2, detail.zw, circleRadius, detail.circle));
    }
}
class DitorusGeometry extends Geometry {
    constructor(circleRadius = 0.2, radius1 = 0.8, radius2 = 0.4, detail = 2) {
        if (typeof detail === "number")
            super(ditorus(radius1, detail * 8, radius2, detail * 8, circleRadius, detail * 6));
        else
            super(ditorus(radius1, detail.major, radius2, detail.middle, circleRadius, detail.minor));
    }
}
class DuocylinderGeometry extends Geometry {
    constructor(radius1 = 0.8, radius2 = 0.8, detail = 2) {
        if (typeof detail === "number")
            super(duocylinder(radius1, detail * 8, radius2, detail * 8));
        else
            super(duocylinder(radius1, detail.xy, radius2, detail.zw));
    }
}
class ConvexHullGeometry extends Geometry {
    constructor(points) {
        super(convexhull(points).generateNormal().setUVWAsPosition());
    }
}
class CWMeshGeometry extends Geometry {
    constructor(cwmesh$1) {
        super(cwmesh(cwmesh$1).setUVWAsPosition());
    }
}

export { CWMeshGeometry, ConvexHullGeometry, CubeGeometry, DitorusGeometry, DuocylinderGeometry, GlomeGeometry, SpherinderSideGeometry, SpheritorusGeometry, TesseractGeometry, TigerGeometry, TorisphereGeometry };
//# sourceMappingURL=geom.js.map
