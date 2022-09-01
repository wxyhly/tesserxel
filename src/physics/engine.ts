namespace tesserxel{
    export namespace physics{
        export class Engine{
            dt = 0.001;
            gravity = new tesserxel.math.Vec4(0,-9.8);
            objects: Object[];
        }
        export class Object extends math.Obj4{
            geom: Geometry;
        }
        export interface Geometry{
        }
    }
}