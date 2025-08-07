import { Obj4 } from "../algebra/affine.js";
import { Vec4 } from "../algebra/vec4.js";
export declare class Ray {
    origin: Vec4;
    direction: Vec4;
}
export declare class Plane {
    /** normal need to be normalized */
    normal: Vec4;
    /** halfspace n.v < offset */
    offset: number;
    constructor(normal: Vec4, offset: number);
    clone(): Plane;
    applyObj4(o: Obj4): this;
    distanceToPoint(p: Vec4): number;
    /** regard r as an infinity line */
    distanceToLine(r: Ray): void;
    intersectRay(r: Ray): void;
}
export declare class AABB {
    min: Vec4;
    max: Vec4;
    testAABB(aabb: AABB): boolean;
    /** when intersected return 0, when aabb is along the normal direction return 1, otherwise -1 */
    testPlane(plane: Plane): 0 | 1 | -1;
    getPoints(): Vec4[];
    constructor(min?: Vec4, max?: Vec4);
    static fromPoints(points: Vec4[]): AABB;
}
