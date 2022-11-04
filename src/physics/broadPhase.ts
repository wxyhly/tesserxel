import { World } from "./engine";
import { Rigid, rigid } from "./rigid";

        export interface BroadPhaseConstructor {
            new(): BroadPhase;
        };
        export type BroadPhaseList = [Rigid, Rigid][];
        export abstract class BroadPhase {
            checkList: BroadPhaseList = [];
            protected clearCheckList() {
                this.checkList = [];
            }
            abstract run(world: World): void;
        }
        export class BoundingGlomeBroadPhase extends BroadPhase {
            checkBoundingGlome(ri: Rigid, rj: Rigid) {
                let gi = ri.geometry instanceof rigid.Glome;
                let gj = rj.geometry instanceof rigid.Glome;
                let pi = ri.geometry instanceof rigid.Plane;
                let pj = rj.geometry instanceof rigid.Plane;
                let directDetect = (gi || pi) && (gj || pj);
                let radi = ri.geometry.boundingGlome;
                let radj = rj.geometry.boundingGlome;
                if (!directDetect && radi && radj) {
                    let r = radi + radj;
                    if (ri.position.distanceSqrTo(rj.position) > r * r) {
                        return false;
                    }
                } else if (pi && radj) {
                    let d = radj - (rj.position.dot((ri.geometry as rigid.Plane).normal) - (ri.geometry as rigid.Plane).offset)
                    if (d < 0) return false;
                } else if (pj && radi) {
                    let d = radi - (ri.position.dot((rj.geometry as rigid.Plane).normal) - (rj.geometry as rigid.Plane).offset)
                    if (d < 0) return false;
                }
                return true;
            }
            run(world: World) {
                this.clearCheckList();
                for (let i = 0; i < world.rigids.length; i++) {
                    for (let j = i + 1; j < world.rigids.length; j++) {
                        let ri = world.rigids[i], rj = world.rigids[j];
                        if(!ri.mass && !rj.mass) continue;
                        if (!this.checkBoundingGlome(ri, rj)) continue;
                        let iU = ri.geometry instanceof rigid.Union;
                        let jU = rj.geometry instanceof rigid.Union;
                        if (!iU && !jU) {
                            this.checkList.push([ri, rj]);
                        } else if (iU && !jU) {
                            for (let r of (ri.geometry as rigid.Union).components) {

                                if (!this.checkBoundingGlome(r, rj)) continue;
                                this.checkList.push([r, rj]);
                            }
                        } else if (!iU && jU) {
                            for (let r of (rj.geometry as rigid.Union).components) {
                                if (!this.checkBoundingGlome(r, ri)) continue;
                                this.checkList.push([r, ri]);
                            }
                        } else {
                            for (let r1 of (ri.geometry as rigid.Union).components) {
                                for (let r2 of (rj.geometry as rigid.Union).components) {
                                    if (!this.checkBoundingGlome(r1, r2)) continue;
                                    this.checkList.push([r1, r2]);
                                }
                            }
                        }
                    }
                }
            }
        }
        export class NaiveBroadPhase extends BroadPhase {
            run(world: World) {
                this.clearCheckList();
                for (let i = 0; i < world.rigids.length; i++) {
                    for (let j = i + 1; j < world.rigids.length; j++) {
                        let ri = world.rigids[i], rj = world.rigids[j];
                        if(!ri.mass && !rj.mass) continue;
                        let iU = ri.geometry instanceof rigid.Union;
                        let jU = rj.geometry instanceof rigid.Union;
                        if (!iU && !jU) {
                            this.checkList.push([ri, rj]);
                        } else if (iU && !jU) {
                            for (let r of (ri.geometry as rigid.Union).components) {
                                this.checkList.push([r, rj]);
                            }
                        } else if (!iU && jU) {
                            for (let r of (rj.geometry as rigid.Union).components) {
                                this.checkList.push([r, ri]);
                            }
                        } else {
                            for (let r1 of (ri.geometry as rigid.Union).components) {
                                for (let r2 of (rj.geometry as rigid.Union).components) {
                                    this.checkList.push([r1, r2]);
                                }
                            }
                        }
                    }
                }
            }
        }
        export class IgnoreAllBroadPhase extends BroadPhase {
            run(world: World) {
                this.clearCheckList();
            }
        }