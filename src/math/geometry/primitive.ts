namespace tesserxel {
    export namespace math {
        class Ray {
            origin: Vec4;
            direction: Vec4;
        }
        class Plane {
            /** normal need to be normalized */
            normal: Vec4;
            offset: number;
            distanceToPoint(p: Vec4) {

            }
            /** regard r as an infinity line */
            distanceToLine(r: Ray) {

            }
        }
        class AABB {
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
        }
    }
}