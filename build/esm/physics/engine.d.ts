import { Bivec } from "../math/algebra/bivec";
import { Vec4 } from "../math/algebra/vec4";
import { BroadPhase, BroadPhaseConstructor } from "./broadPhase";
import { Force, ForceAccumulator, ForceAccumulatorConstructor } from "./forces";
import { NarrowPhase } from "./narrowphase";
import { rigid, Rigid } from "./rigid";
import { Solver, SolverConstructor } from "./solver";
interface EngineOption {
    forceAccumulator?: ForceAccumulatorConstructor;
    broadPhase?: BroadPhaseConstructor;
    solver?: SolverConstructor;
    substep?: number;
}
export declare class Engine {
    forceAccumulator: ForceAccumulator;
    broadPhase: BroadPhase;
    narrowPhase: NarrowPhase;
    solver: Solver;
    substep: number;
    constructor(option?: EngineOption);
    update(world: World, dt: number): void;
    step(world: World, dt: number): void;
}
export declare class World {
    gravity: Vec4;
    rigids: Rigid[];
    constrains: Constrain[];
    unionRigids: rigid.Union[];
    forces: Force[];
    time: number;
    add(...args: (Rigid | Force | Constrain)[]): void;
    remove(o: Rigid | Force): void;
    updateUnionGeometriesCoord(): void;
}
export declare class Material {
    friction: number;
    restitution: number;
    constructor(friction: number, restitution: number);
    static getContactMaterial(a: Material, b: Material): {
        restitution: number;
        friction: number;
    };
}
/** a helper function for applying inertia to bivec */
export declare function mulBivec(self: Bivec, a: Bivec, b: Bivec): Bivec;
export declare class Constrain {
    a: Rigid;
    b: Rigid | undefined;
    constructor(a: Rigid, b?: Rigid | undefined);
}
export declare class PointConstrain extends Constrain {
    pointA: Vec4;
    pointB: Vec4;
    constructor(a: Rigid, b: Rigid | undefined, pointA: Vec4, pointB: Vec4);
}
export {};
