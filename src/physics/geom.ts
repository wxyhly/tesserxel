namespace tesserxel{
    export namespace physics{
        export interface Geometry {
            type: string;
            position?: math.Vec4;
            rotation?: math.Rotor;
            intersectGeometry(g: Geometry):IntersectResult;
        }
        export class Glome implements Geometry{
            radius: number = 1;
            position = new math.Vec4;
            rotation = new math.Rotor;
            type: "glome";
            constructor(radius:number){
                this.radius = radius;
            }
            intersectGeometry(g: Geometry){
                switch(g.type){
                    case "glome": return intersetGlomeGlome(this, g as Glome);
                    case "plane": return intersetGlomePlane(this, g as Plane);
                }
                return null;
            }
        }
        /** equation: dot(normal,positon) == offset
         *  => when offset > 0, plane is shifted to normal direction
         *  from origin by distance = offset
         */
        export class Plane implements Geometry{
            normal: math.Vec4;
            offset: number;
            type: "plane";
            intersectGeometry(g: Geometry){
                switch(g.type){
                    case "glome": return inverseIntersectOrder(intersetGlomePlane(g as Glome, this));
                }
                return null;
            }
        }
    }
}