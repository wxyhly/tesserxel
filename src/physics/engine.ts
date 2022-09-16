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
            update(world: World, dt: number) {
                dt /= this.substep;
                for (let i = 0; i < this.substep; i++) {
                    this.step(world, dt);
                }
            }
            step(world: World, dt: number) {
                this.forceAccumulator.run(world, dt);
                world.updateUnionGeometriesCoord();
                this.broadPhase.run(world);
                this.narrowPhase.run(this.broadPhase.checkList);
                this.solver.run(this.narrowPhase.collisionList, world.constrains);
                world.updateUnionGeometriesCoord();
            }
        }
        export class World {
            gravity = new math.Vec4(0, -9.8);
            rigids: Rigid[] = [];
            constrains: Constrain[] = [];
            unionRigids: rigid.Union[] = [];
            forces: Force[] = [];
            time: number = 0;
            add(...args: (Rigid | Force | Constrain)[]) {
                for (let o of args) {
                    if (o instanceof Rigid) {
                        this.rigids.push(o);
                        if (o.geometry instanceof rigid.Union) {
                            this.unionRigids.push(o.geometry);
                        }
                        continue;
                    }
                    if (o instanceof Force) {
                        this.forces.push(o); continue;
                    }
                    if (o instanceof Constrain) {
                        this.constrains.push(o); continue;
                    }
                }
            }
            remove(o: Rigid | Force) {
                if (o instanceof Rigid) {
                    let index = this.rigids.indexOf(o);
                    if (index !== -1) {
                        this.rigids.splice(index, 1);
                        if (o.geometry instanceof rigid.Union) {
                            let index = this.unionRigids.indexOf(o.geometry);
                            if (index !== -1) {
                                this.unionRigids.splice(index, 1);
                            } else {
                                console.warn("Union Rigid geometry is removed before rigid");
                            }
                        }
                    } else {
                        console.warn("Cannot remove a non-existed child");
                    }
                }
                if (o instanceof Force) {
                    let index = this.forces.indexOf(o);
                    if (index !== -1) {
                        this.forces.splice(index, 1);
                    }
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
            static getContactMaterial(a: Material, b: Material) {
                return { restitution: a.restitution * b.restitution, friction: a.friction * b.friction };
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
        export class Constrain {
            a: Rigid;
            b: Rigid | null;
            constructor(a: Rigid, b?: Rigid | null) {
                this.a = a;
                this.b = b;
            }
        }
        export class PointConstrain extends Constrain {
            pointA: math.Vec4;
            pointB: math.Vec4;
            constructor(a: Rigid, b: Rigid | null, pointA: math.Vec4, pointB: math.Vec4) {
                super(a, b); this.pointA = pointA; this.pointB = pointB;
            }
        }
    }
}