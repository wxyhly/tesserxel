import { Obj4 } from "../math/algebra/affine";
import { Bivec } from "../math/algebra/bivec";
import { Vec4 } from "../math/algebra/vec4";
import { AABB } from "../math/geometry/primitive";
import { Spline } from "../math/math";
import { Material } from "./engine";
export declare type RigidType = "still" | "passive" | "active";
interface SimpleRigidDescriptor {
    /** mass set to 0 to specify non-active rigid */
    mass: number | null;
    /** RigidGeometry instance cannot be shared between Rigid instances */
    geometry: RigidGeometry;
    material: Material;
    type?: RigidType;
    /** for tracing debug */
    label?: string;
}
/** Subrigids should not be added into scene repetively.
 * Subrigids's positions cannot be modified after union created
 */
declare type UnionRigidDescriptor = Rigid[];
/** all properities hold by class Rigid should not be modified
 *  exceptions are position/rotation and (angular)velocity.
 *  pass RigidDescriptor into constructor instead.
 *  */
export declare class Rigid extends Obj4 {
    scale: undefined;
    material: Material;
    geometry: RigidGeometry;
    type: RigidType;
    mass: number | undefined;
    invMass: number;
    inertia: Bivec | undefined;
    invInertia: Bivec | undefined;
    inertiaIsotroy: boolean;
    sleep: boolean;
    label?: string;
    velocity: Vec4;
    angularVelocity: Bivec;
    force: Vec4;
    torque: Bivec;
    acceleration: Vec4;
    angularAcceleration: Bivec;
    constructor(param: SimpleRigidDescriptor | UnionRigidDescriptor);
    getlinearVelocity(out: Vec4, point: Vec4): Vec4;
    getMomentum(out: Vec4): Vec4;
    /** type: "J" for total, type: "S" for Spin, type: "L" for Orbital, */
    getAngularMomentum(out: Bivec, point?: Vec4, type?: "J" | "S" | "L"): Bivec;
    getLinearKineticEnergy(): number;
    getAngularKineticEnergy(): number;
    getKineticEnergy(): number;
}
/** internal type for union rigid geometry */
export interface SubRigid extends Rigid {
    localCoord?: Obj4;
    parent?: Rigid;
}
export declare abstract class RigidGeometry {
    rigid: Rigid;
    obb: AABB;
    aabb: AABB;
    boundingGlome: number;
    initialize(rigid: Rigid): void;
    abstract initializeMassInertia(rigid: Rigid): void;
}
export declare namespace rigid {
    class Union extends RigidGeometry {
        components: SubRigid[];
        constructor(components: Rigid[]);
        initializeMassInertia(rigid: Rigid): void;
        updateCoord(): void;
    }
    class Glome extends RigidGeometry {
        radius: number;
        radiusSqr: number;
        inertiaCoefficient: number;
        constructor(radius: number, inertiaCoefficient?: number);
        initializeMassInertia(rigid: Rigid): void;
    }
    class Convex extends RigidGeometry {
        points: Vec4[];
        _cachePoints: Vec4[];
        constructor(points: Vec4[]);
        private getPointsInertia;
        initializeMassInertia(rigid: Rigid): void;
    }
    class Tesseractoid extends Convex {
        size: Vec4;
        constructor(size: Vec4 | number);
        initializeMassInertia(rigid: Rigid): void;
    }
    class Duocylinder extends Convex {
        radius1: number;
        radius2: number;
        segment1: number;
        segment2: number;
        constructor(radius1: number, radius2: number, segment1: number, segment2: number);
        initializeMassInertia(rigid: Rigid): void;
    }
    /** equation: dot(normal,positon) == offset
     *  => when offset > 0, plane is shifted to normal direction
     *  from origin by distance = offset
     */
    class Plane extends RigidGeometry {
        normal: Vec4;
        offset: number;
        constructor(normal?: Vec4, offset?: number);
        initializeMassInertia(rigid: Rigid): void;
    }
    class GlomicCavity extends RigidGeometry {
        radius: number;
        constructor(radius: number);
        initializeMassInertia(rigid: Rigid): void;
    }
    /** default orientation: XW */
    class Spheritorus extends RigidGeometry {
        majorRadius: number;
        minorRadius: number;
        /** majorRadius: cirle's radius, minorRadius: sphere's radius */
        constructor(majorRadius: number, minorRadius: number);
        initializeMassInertia(rigid: Rigid): void;
    }
    /** default orientation: XZW */
    class Torisphere extends RigidGeometry {
        majorRadius: number;
        minorRadius: number;
        /** majorRadius: sphere's radius, minorRadius: cirle's radius */
        constructor(majorRadius: number, minorRadius: number);
        initializeMassInertia(rigid: Rigid): void;
    }
    /** default orientation: 1:XY, 2:ZW */
    class Tiger extends RigidGeometry {
        majorRadius1: number;
        majorRadius2: number;
        minorRadius: number;
        /** majorRadius: sphere's radius, minorRadius: cirle's radius */
        constructor(majorRadius1: number, majorRadius2: number, minorRadius: number);
        initializeMassInertia(rigid: Rigid): void;
    }
    /** default orientation: (xy-z)-w */
    class Ditorus extends RigidGeometry {
        majorRadius: number;
        middleRadius: number;
        minorRadius: number;
        /** majorRadius, minorRadius: torus's radius, minorRadius: cirle's radius */
        constructor(majorRadius: number, middleRadius: number, minorRadius: number);
        initializeMassInertia(rigid: Rigid): void;
    }
    class ThickHexahedronGrid extends RigidGeometry {
        grid1: Vec4[][][];
        grid2: Vec4[][][];
        convex: Convex[];
        constructor(grid1: Vec4[][][], grid2: Vec4[][][]);
        initializeMassInertia(rigid: Rigid): void;
    }
    /** todo */
    class LoftedConvex extends Union {
        constructor(sp: Spline, section: Vec4[], step: number);
        initializeMassInertia(rigid: Rigid): void;
    }
}
export {};
