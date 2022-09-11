namespace tesserxel {
    export namespace physics {
        interface EngineOption {
            forceAccumulator?: ForceAccumulatorConstructor;
            broadPhase?: BroadPhaseConstructor;
            solver?: SolverConstructor;
            substep?: number;
        }
        export class Engine {
            forceAccumulator: ForceAccumulator;
            broadPhase: BroadPhase;
            narrowPhase: NarrowPhase;
            solver: Solver;
            substep: number;
            constructor(option?: EngineOption) {
                this.forceAccumulator = new (option?.forceAccumulator ?? force_accumulator.Predict3)();
                this.broadPhase = new (option?.broadPhase ?? NaiveBroadPhase)();
                this.narrowPhase = new NarrowPhase();
                this.solver = new (option?.solver ?? IterativeImpulseSolver)();
                this.substep = option.substep ?? 1;
            }
            runCollisionSolver() {
                // todo
            }
            update(world: World, dt: number) {
                dt /= this.substep;
                for (let i = 0; i < this.substep; i++) {
                    this.step(world, dt);
                }
                world.frameCount++;
            }
            step(world: World, dt: number) {
                this.forceAccumulator.run(world, dt);
                world.updateUnionGeometriesCoord();
                this.broadPhase.run(world);
                this.narrowPhase.run(this.broadPhase.checkList);
                this.solver.run(this.narrowPhase.collisionList);
                world.updateUnionGeometriesCoord();
            }
        }
        export class World {
            gravity = new math.Vec4(0, -9.8);
            rigids: Rigid[] = [];
            unionRigids: rigid.Union[] = [];
            forces: Force[] = [];
            time: number = 0;
            frameCount = 0;
            add(o: Rigid | Force) {
                if (o instanceof Rigid) {
                    this.rigids.push(o);
                    if (o.geometry instanceof rigid.Union) {
                        this.unionRigids.push(o.geometry);
                    }
                    return;
                }
                if (o instanceof Force) {
                    this.forces.push(o); return;
                }
            }
            updateUnionGeometriesCoord() {
                for (let r of this.unionRigids) {
                    r.updateCoord();
                }
            }
        }
        export class Material {
            friction: number;
            restitution: number;
            constructor(friction: number, restitution: number) {
                this.restitution = restitution;
                this.friction = friction;
            }
            static getContactRestitution(a: Material, b: Material) {
                return a.restitution * b.restitution;
            }
            static getContactFriction(a: Material, b: Material) {
                return a.friction * b.friction;
            }
        }
        /** a helper function for applying inertia to bivec */
        export function mulBivec(self: math.Bivec, a: math.Bivec, b: math.Bivec) {
            return self.set(
                a.xy * b.xy,
                a.xz * b.xz,
                a.xw * b.xw,
                a.yz * b.yz,
                a.yw * b.yw,
                a.zw * b.zw,
            );
        }
    }
}