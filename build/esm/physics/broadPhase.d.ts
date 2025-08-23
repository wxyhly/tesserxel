import { math } from "../tesserxel.js";
import { World } from "./engine.js";
import { Rigid } from "./rigid.js";
export interface BroadPhaseConstructor {
    new (): BroadPhase;
}
export type BroadPhaseList = [Rigid, Rigid][];
export declare abstract class BroadPhase {
    checkList: BroadPhaseList;
    ignorePair: BroadPhaseList;
    protected clearCheckList(): void;
    abstract run(world: World): void;
    protected verifyCheckList(): void;
}
export declare class BoundingGlomeBroadPhase extends BroadPhase {
    checkBoundingGlome(ri: Rigid, rj: Rigid): boolean;
    run(world: World): void;
}
type BoundingGlomeTreeNode = {
    position: math.Vec4;
    radius: number;
    surcell: number;
    child1: BoundingGlomeTreeNode | Rigid;
    child2?: BoundingGlomeTreeNode | Rigid;
    parent?: BoundingGlomeTreeNode;
    rigidIndex?: number;
};
export declare class BoundingGlomeTreeBroadPhase extends BroadPhase {
    tree: BoundingGlomeTreeNode;
    exclude: Rigid[];
    include: Rigid[];
    buildTree(world: World): void;
    run(world: World): void;
}
export declare class NaiveBroadPhase extends BroadPhase {
    run(world: World): void;
}
export declare class IgnoreAllBroadPhase extends BroadPhase {
    run(world: World): void;
}
export {};
