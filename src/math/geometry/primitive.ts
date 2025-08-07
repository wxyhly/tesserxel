import { Obj4 } from "../algebra/affine.js";
import { Vec4 } from "../algebra/vec4.js";

export class Ray {
    origin: Vec4;
    direction: Vec4;
}

export class Plane {
    /** normal need to be normalized */
    normal: Vec4;
    /** halfspace n.v < offset */
    offset: number;
    constructor(normal: Vec4, offset: number) {
        this.normal = normal;
        this.offset = offset;
    }
    clone(){
        return new Plane(this.normal.clone(),this.offset);
    }
    applyObj4(o:Obj4){
        if(o.scale) throw "scaling plane is not implemented yet";
        this.normal.rotates(o.rotation);
        this.offset += this.normal.dot(o.position);
        return this;
    }
    distanceToPoint(p: Vec4) {
        return this.normal.dot(p) - this.offset;
    }
    /** regard r as an infinity line */
    distanceToLine(r: Ray) {
        
    }
    intersectRay(r:Ray){
        
    }
    
}
export class AABB {
    min: Vec4;
    max: Vec4;
    testAABB(aabb: AABB) {
        return (
            (this.min.x <= aabb.max.x && this.max.x >= aabb.min.x) &&
            (this.min.y <= aabb.max.y && this.max.y >= aabb.min.y) &&
            (this.min.z <= aabb.max.z && this.max.z >= aabb.min.z) &&
            (this.min.w <= aabb.max.w && this.max.w >= aabb.min.w)
        );
    }
    /** when intersected return 0, when aabb is along the normal direction return 1, otherwise -1 */
    testPlane(plane: Plane) {
        let min: number, max: number;
        if (plane.normal.x > 0) {
            min = plane.normal.x * this.min.x;
            max = plane.normal.x * this.max.x;
        } else {
            min = plane.normal.x * this.max.x;
            max = plane.normal.x * this.min.x;
        }
        if (plane.normal.y > 0) {
            min += plane.normal.y * this.min.y;
            max += plane.normal.y * this.max.y;
        } else {
            min += plane.normal.y * this.max.y;
            max += plane.normal.y * this.min.y;
        }
        if (plane.normal.z > 0) {
            min += plane.normal.z * this.min.z;
            max += plane.normal.z * this.max.z;
        } else {
            min += plane.normal.z * this.max.z;
            max += plane.normal.z * this.min.z;
        }
        if (plane.normal.w > 0) {
            min += plane.normal.w * this.min.w;
            max += plane.normal.w * this.max.w;
        } else {
            min += plane.normal.w * this.max.w;
            max += plane.normal.w * this.min.w;
        }
        if (min <= plane.offset && max >= plane.offset) {
            return 0;
        }
        if (min <= plane.offset && max <= plane.offset) {
            return -1;
        }
        if (min >= plane.offset && max >= plane.offset) {
            return 1;
        }
    }
    getPoints() {
        return [
            new Vec4(this.min.x, this.min.y, this.min.z, this.min.w),
            new Vec4(this.max.x, this.min.y, this.min.z, this.min.w),
            new Vec4(this.min.x, this.max.y, this.min.z, this.min.w),
            new Vec4(this.max.x, this.max.y, this.min.z, this.min.w),
            new Vec4(this.min.x, this.min.y, this.max.z, this.min.w),
            new Vec4(this.max.x, this.min.y, this.max.z, this.min.w),
            new Vec4(this.min.x, this.max.y, this.max.z, this.min.w),
            new Vec4(this.max.x, this.max.y, this.max.z, this.min.w),
            new Vec4(this.min.x, this.min.y, this.min.z, this.max.w),
            new Vec4(this.max.x, this.min.y, this.min.z, this.max.w),
            new Vec4(this.min.x, this.max.y, this.min.z, this.max.w),
            new Vec4(this.max.x, this.max.y, this.min.z, this.max.w),
            new Vec4(this.min.x, this.min.y, this.max.z, this.max.w),
            new Vec4(this.max.x, this.min.y, this.max.z, this.max.w),
            new Vec4(this.min.x, this.max.y, this.max.z, this.max.w),
            new Vec4(this.max.x, this.max.y, this.max.z, this.max.w),


        ]
    }
    constructor(min?: Vec4, max?: Vec4) {
        this.min = min ?? new Vec4(Infinity, Infinity, Infinity, Infinity,);
        this.max = max ?? new Vec4(-Infinity, -Infinity, -Infinity, -Infinity,);
    }
    static fromPoints(points: Vec4[]) {
        let aabb = new AABB();
        for (let p of points) {
            aabb.min.x = Math.min(aabb.min.x, p.x);
            aabb.min.y = Math.min(aabb.min.y, p.y);
            aabb.min.z = Math.min(aabb.min.z, p.z);
            aabb.min.w = Math.min(aabb.min.w, p.w);
            aabb.max.x = Math.max(aabb.max.x, p.x);
            aabb.max.y = Math.max(aabb.max.y, p.y);
            aabb.max.z = Math.max(aabb.max.z, p.z);
            aabb.max.w = Math.max(aabb.max.w, p.w);
        }
        return aabb;
    }
}