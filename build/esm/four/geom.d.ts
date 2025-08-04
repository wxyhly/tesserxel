import { Vec3 } from "../math/algebra/vec3";
import { Vec4 } from "../math/algebra/vec4";
import { CWMesh } from "../mesh/mesh";
import { Geometry } from "./scene";
export declare class TesseractGeometry extends Geometry {
    constructor(size?: number | Vec4);
}
export declare class CubeGeometry extends Geometry {
    constructor(size?: number | Vec3);
}
export declare class GlomeGeometry extends Geometry {
    constructor(size?: number, detail?: number | {
        xy: number;
        zw: number;
        latitude: number;
    });
}
export declare class SpheritorusGeometry extends Geometry {
    constructor(sphereRadius?: number, circleRadius?: number, detail?: number | {
        longitude: number;
        latitude: number;
        circle: number;
    });
}
export declare class TorisphereGeometry extends Geometry {
    constructor(circleRadius?: number, sphereRadius?: number, detail?: number | {
        longitude: number;
        latitude: number;
        circle: number;
    });
}
export declare class SpherinderSideGeometry extends Geometry {
    constructor(sphereRadius1?: number, sphereRadius2?: number, height?: number, detail?: number | {
        longitude: number;
        latitude: number;
        height?: number;
    });
}
export declare class TigerGeometry extends Geometry {
    constructor(circleRadius?: number, radius1?: number, radius2?: number, detail?: number | {
        xy: number;
        zw: number;
        circle: number;
    });
}
export declare class DitorusGeometry extends Geometry {
    constructor(circleRadius?: number, radius1?: number, radius2?: number, detail?: number | {
        major: number;
        middle: number;
        minor: number;
    });
}
export declare class DuocylinderGeometry extends Geometry {
    constructor(radius1?: number, radius2?: number, detail?: number | {
        xy: number;
        zw: number;
    });
}
export declare class ConvexHullGeometry extends Geometry {
    constructor(points: Vec4[]);
}
export declare class CWMeshGeometry extends Geometry {
    constructor(cwmesh: CWMesh);
}
