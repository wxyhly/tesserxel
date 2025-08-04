import { Vec4 } from "../math/algebra/vec4";
import { BroadPhaseList } from "./broadPhase";
import { Rigid } from "./rigid";
export interface Collision {
    point: Vec4;
    depth: number;
    /** normal is defined from a to b */
    normal: Vec4;
    a: Rigid;
    b?: Rigid;
}
export declare class NarrowPhase {
    collisionList: Collision[];
    /** max iteration for sdf methods in detectCollision */
    maxIteration: number;
    clearCollisionList(): void;
    run(list: BroadPhaseList): void;
    detectCollision(rigidA: Rigid, rigidB: Rigid): any;
    private detectGlomeGlome;
    private detectGlomeGlomiccavity;
    private detectGlomePlane;
    private detectConvexPlane;
    private detectConvexGlome;
    private detectConvexConvex;
    private detectSpheritorusPlane;
    private detectSpheritorusGlome;
    private detectSpheritorusSpheritorus;
    private detectTorispherePlane;
    private detectTorisphereGlome;
    private detectTorisphereTorisphere;
    private detectTorisphereSpheritorus;
    private detectTigerPlane;
    private detectTigerGlome;
    private detectTigerTiger;
    private detectTigerTorisphere;
    private detectTigerSpheritorus;
    private detectDitorusPlane;
    private detectDitorusGlome;
    private detectDitorusSpheritorus;
    private detectDitorusTorisphere;
    private detectDitorusTiger;
    private detectDitorusDitorus;
}
