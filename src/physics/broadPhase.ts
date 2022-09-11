namespace tesserxel {
    export namespace physics {
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
        export class NaiveBroadPhase extends BroadPhase {
            run(world: World) {
                this.clearCheckList();
                for (let i = 0; i < world.rigids.length; i++) {
                    for (let j = i + 1; j < world.rigids.length; j++) {
                        let ri = world.rigids[i], rj = world.rigids[j];
                        let iU = ri.geometry instanceof rigid.Union;
                        let jU = rj.geometry instanceof rigid.Union;
                        if (!iU && !jU) {
                            this.checkList.push([ri, rj]);
                        } else if(iU && !jU){
                            for (let r of (ri.geometry as rigid.Union).components) {
                                this.checkList.push([r, rj]);
                            }
                        } else if(!iU && jU){
                            for (let r of (rj.geometry as rigid.Union).components) {
                                this.checkList.push([r, ri]);
                            }
                        } else{
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
    }
}