import { Bivec } from "../math/algebra/bivec";
import { Vec4 } from "../math/algebra/vec4";
import { Constrain, Material, PointConstrain } from "./engine";
import { Collision } from "./narrowphase";
import { Rigid } from "./rigid";
export interface SolverConstructor {
    new (): Solver;
}
export declare abstract class Solver {
    abstract run(collisionList: Collision[], constrainList: Constrain[]): void;
}
export interface PreparedCollision extends Collision {
    separateSpeed: number;
    relativeVelocity: Vec4;
    materialA: Material;
    materialB?: Material;
    dvA?: Vec4;
    dvB?: Vec4;
    dwA?: Bivec;
    dwB?: Bivec;
    pointConstrain?: PointConstrain;
}
export declare class IterativeImpulseSolver extends Solver {
    maxPositionIterations: number;
    maxVelocityIterations: number;
    maxResolveRotationAngle: number;
    separateSpeedEpsilon: number;
    PositionRelaxationFactor: number;
    collisionList: PreparedCollision[];
    private _vec41;
    private _vec42;
    private pointConstrainMaterial;
    run(collisionList: Collision[], constrainList: Constrain[]): void;
    prepare(collisionList: Collision[], constrainList: Constrain[]): void;
    resolveVelocity(): void;
    updateSeparateSpeeds(collision: PreparedCollision): void;
    updateSeparateSpeed(collision: PreparedCollision, rigidIsA: boolean, rigid: Rigid, dv: Vec4, dw: Bivec): void;
    resolvePosition(): void;
    updateDepths(collision: PreparedCollision): void;
    updateDepth(collision: PreparedCollision, rigidIsA: boolean, rigid: Rigid, dv: Vec4, dw: Bivec): void;
}
