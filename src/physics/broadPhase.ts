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
                        this.checkList.push([world.rigids[i], world.rigids[j]]);
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