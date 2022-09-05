namespace tesserxel {
    export namespace physics {
        export class Engine {
            forceAccumulator: ForceAccumulator;
            constructor(forceAccumulator?: ForceAccumulator) {
                this.forceAccumulator = forceAccumulator ?? new force_accumulator.Euler2();
            }
            runCollisionDetector() {
                // this.collisions = [];
                // for (let i = 0; i < this.objects.length; i++) {
                //     for (let j = i + 1; j < this.objects.length; j++) {
                //         let r = this.objects[i].geometry.intersectGeometry(this.objects[j].geometry);
                //         if (r) this.collisions.push(r);
                //     }
                // }
            }
            runCollisionSolver() {
                // todo
            }
            update(world: World, dt: number) {
                this.forceAccumulator.run(this, world, dt);
                this.runCollisionDetector();
                this.runCollisionSolver();
                world.frameCount++;
            }
            getObjectsAccelerations(world: World) {
                // clear
                for (let o of world.objects) {
                    o.force.set();
                    if (o.invMass) o.acceleration.copy(world.gravity);
                    o.torque.set();
                }
                // apply force
                for (let f of world.forces) {
                    f.apply(world.time);
                }
                for (let o of world.objects) {
                    if (o.force.norm1() > 0) {
                        o.acceleration.addmulfs(o.force, o.invMass);
                    }
                    if (o.torque.norm1() > 0) {
                        // todo
                        // o.angularAcceleration.addmulfs(o.torque, o.invMass);
                    }
                }
            }
        }
        export class World {
            gravity = new math.Vec4(0, -9.8);
            objects: Object[] = [];
            forces: Force[] = [];
            collisions: IntersectedResult[] = [];
            time: number = 0;
            frameCount = 0;
            addObject(o: Object) {
                this.objects.push(o);
            }
            addForce(f: Force) {
                this.forces.push(f);
            }
        }
        export class Object {
            geometry: Geometry;
            invMass: number;
            // inertia is a 6x6 Matrix for angularVelocity -> angularMomentum
            invInertia: math.Matrix;
            velocity: math.Vec4 = new math.Vec4();
            angularVelocity: math.Bivec = new math.Bivec();
            /** sleeping objects are still.
             *  it only do collision test will active objects
             *  */
            sleep: boolean = false;

            // accumulators:
            force: math.Vec4 = new math.Vec4();
            torque: math.Bivec = new math.Bivec();
            acceleration: math.Vec4 = new math.Vec4();
            angularAcceleration: math.Bivec = new math.Bivec();
            getlinearVelocity(position: math.Vec4) {
                if (!this.geometry.position) return new math.Vec4();
                let relPosition = position.sub(this.geometry.position);
                return relPosition.dotbset(this.angularVelocity, relPosition).add(this.velocity);
            }
            constructor(geometry: Geometry, mass?: number) {
                this.geometry = geometry;
                this.invMass = mass > 0 ? 1 / mass : null;
            }
        }
    }
}