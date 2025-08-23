import { Vec4 } from '../math/algebra/vec4.js';
import { BoundingGlomeBroadPhase } from './broadPhase.js';
import { Force, force_accumulator } from './forces.js';
import { NarrowPhase } from './narrowphase.js';
import { Rigid, rigid } from './rigid.js';
import { IterativeImpulseSolver } from './solver.js';

class Engine {
    forceAccumulator;
    broadPhase;
    narrowPhase;
    solver;
    substep;
    constructor(option) {
        this.forceAccumulator = new (option?.forceAccumulator ?? force_accumulator.Predict3)();
        this.broadPhase = new (option?.broadPhase ?? BoundingGlomeBroadPhase)();
        this.narrowPhase = new NarrowPhase();
        this.solver = new (option?.solver ?? IterativeImpulseSolver)();
        this.substep = option?.substep ?? 1;
    }
    update(world, dt) {
        dt /= this.substep;
        for (let i = 0; i < this.substep; i++) {
            this.step(world, dt);
        }
    }
    step(world, dt) {
        this.forceAccumulator.run(world, dt);
        world.updateUnionGeometriesCoord();
        this.broadPhase.run(world);
        this.narrowPhase.run(this.broadPhase.checkList);
        this.solver.run(this.narrowPhase.collisionList, world.constrains);
        world.updateUnionGeometriesCoord();
    }
}
class World {
    gravity = new Vec4(0, -9.8);
    rigids = [];
    constrains = [];
    unionRigids = [];
    forces = [];
    time = 0;
    add(...args) {
        for (let o of args) {
            if (o instanceof Rigid) {
                this.rigids.push(o);
                if (o.geometry instanceof rigid.Union) {
                    this.unionRigids.push(o.geometry);
                }
                continue;
            }
            if (o instanceof Force) {
                this.forces.push(o);
                continue;
            }
            if (o instanceof Constrain) {
                this.constrains.push(o);
                continue;
            }
        }
    }
    remove(o) {
        if (o instanceof Rigid) {
            let index = this.rigids.indexOf(o);
            if (index !== -1) {
                this.rigids.splice(index, 1);
                if (o.geometry instanceof rigid.Union) {
                    let index = this.unionRigids.indexOf(o.geometry);
                    if (index !== -1) {
                        this.unionRigids.splice(index, 1);
                    }
                    else {
                        console.warn("Union Rigid geometry is removed before rigid");
                    }
                }
            }
            else {
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
class Material {
    friction;
    restitution;
    constructor(friction, restitution) {
        this.restitution = restitution;
        this.friction = friction;
    }
    static getContactMaterial(a, b) {
        return { restitution: a.restitution * b.restitution, friction: a.friction * b.friction };
    }
}
/** a helper function for applying inertia to bivec */
function mulBivec(self, a, b) {
    return self.set(a.xy * b.xy, a.xz * b.xz, a.xw * b.xw, a.yz * b.yz, a.yw * b.yw, a.zw * b.zw);
}
class Constrain {
    a;
    b;
    constructor(a, b) {
        this.a = a;
        this.b = b;
    }
}
class PointConstrain extends Constrain {
    pointA;
    pointB;
    constructor(a, b, pointA, pointB) {
        super(a, b);
        this.pointA = pointA;
        this.pointB = pointB;
    }
}

export { Constrain, Engine, Material, PointConstrain, World, mulBivec };
//# sourceMappingURL=engine.js.map
