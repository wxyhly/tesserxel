import { Bivec, bivecPool } from "../math/algebra/bivec";
import { Mat4, mat4Pool } from "../math/algebra/mat4";
import { rotorPool } from "../math/algebra/rotor";
import { Vec4, vec4Pool } from "../math/algebra/vec4";
import { _DEG2RAD } from "../math/const";
import { Constrain, Material, mulBivec, PointConstrain } from "./engine";
import { Collision } from "./narrowphase";
import { Rigid, SubRigid } from "./rigid";

export interface SolverConstructor {
    new(): Solver;
};
export abstract class Solver {
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
export class IterativeImpulseSolver extends Solver {
    maxPositionIterations: number = 32;
    maxVelocityIterations: number = 32;
    maxResolveRotationAngle = 45 * _DEG2RAD;
    separateSpeedEpsilon = 0.01;
    PositionRelaxationFactor = 0.5;
    collisionList: PreparedCollision[];
    private _vec41 = new Vec4;
    private _vec42 = new Vec4;
    private pointConstrainMaterial = new Material(Infinity, 0);
    run(collisionList: Collision[], constrainList: Constrain[]) {
        if (!collisionList.length && !constrainList.length) return;
        this.prepare(collisionList, constrainList);
        this.resolveVelocity();
        this.resolvePosition();
    }
    prepare(collisionList: Collision[], constrainList: Constrain[]) {
        this.collisionList = collisionList.map(e => {
            let { point, a, b, normal } = e;
            let collision = e as PreparedCollision;
            collision.materialA = a.material;
            collision.materialB = b?.material;
            // after got material, we solve union regardless of it's collision parts
            if ((a as SubRigid).parent) collision.a = (a as SubRigid).parent!;
            if ((b as SubRigid).parent) collision.b = (b as SubRigid).parent!;
            collision.relativeVelocity = collision.b.getlinearVelocity(vec4Pool.pop(), point).subs(
                collision.a.getlinearVelocity(this._vec41, point)
            );
            collision.separateSpeed = collision.relativeVelocity.dot(normal);
            return collision;
        });
        for (let c of constrainList) {
            if (c instanceof PointConstrain) {
                let { a, b, pointA, pointB } = c;
                this._vec41.copy(pointA).rotates(a.rotation);
                let relativeVelocity = vec4Pool.pop().dotbset(
                    this._vec41, a.angularVelocity
                ).adds(a.velocity);
                let normal: Vec4;
                let point: Vec4;
                if (b) {
                    this._vec42.copy(pointB).rotates(b.rotation);
                    relativeVelocity.subs(this._vec42.dotbset(
                        this._vec42, b.angularVelocity
                    ).adds(b.velocity));
                    normal = this._vec41.adds(a.position).sub(this._vec42.adds(b.position));
                    point = this._vec41.add(this._vec42).mulfs(0.5);
                } else {
                    normal = this._vec41.adds(a.position).sub(pointB);
                    point = this._vec41.adds(pointB).mulfs(0.5);
                }
                let depth = normal.norm(); if (depth === 0) continue; normal.divfs(depth);
                relativeVelocity.negs();
                this.collisionList.push({
                    a, b, normal, depth,
                    materialA: this.pointConstrainMaterial,
                    materialB: this.pointConstrainMaterial,
                    relativeVelocity,
                    separateSpeed: -relativeVelocity.norm(),
                    point,
                    pointConstrain: c
                });
            }
        }
    }

    resolveVelocity() {
        // iteratively solve lowest separateSpeed
        for (let i = 0; i < this.maxVelocityIterations; i++) {
            let collision = this.collisionList.sort((a, b) => (
                (a.pointConstrain ? (-Math.abs(a.separateSpeed)) : a.separateSpeed)
                - (b.pointConstrain ? (-Math.abs(b.separateSpeed)) : b.separateSpeed)
            ))[0];
            if(!collision) return;
            let { point, a, b, separateSpeed, normal, relativeVelocity, materialA, materialB } = collision;
            if (!collision.pointConstrain) {
                if (separateSpeed >= 0) return;
            } else if (Math.abs(separateSpeed) < this.separateSpeedEpsilon) { return; }
            let { restitution, friction } = Material.getContactMaterial(materialA, materialB!);
            if (separateSpeed > -this.separateSpeedEpsilon) restitution = 0;
            let normalVelocity = vec4Pool.pop().copy(normal).mulfs(separateSpeed);
            let tangentVelocity = vec4Pool.pop().subset(relativeVelocity, normalVelocity);
            let tangentSpeed = tangentVelocity.norm();
            // newVn = Vn * -restitution;
            // newVt = Vt * tangentFactor;
            // when slide: deltaVt === friction * deltaVn => solve tangentFactor
            // convert f = mu * N to delta(tangentSpeed) = mu * delta(normalVelocity)
            // then calculate friction reduce how many tangentSpeed, result is presented by a tangentFactor
            // tangentFactor must > 0, otherwise it's still friction
            let tangentFactor = tangentSpeed > 0 ? Math.max(
                1 + friction * (1 + restitution) * separateSpeed / tangentSpeed, 0
            ) : 0;
            let targetDeltaVelocityByImpulse = tangentVelocity.mulfs(tangentFactor - 1).addmulfs(normalVelocity, -restitution - 1);
            let pointInA: Vec4, pointInB: Vec4;
            let matA = mat4Pool.pop(), matB = mat4Pool.pop()
            if (a.mass > 0) {
                pointInA = vec4Pool.pop().subset(point, a.position).rotatesconj(a.rotation);
                calcImpulseResponseMat(matA, a, pointInA, pointInA);
            } else { matA.set(); }
            if (b?.mass > 0) {
                pointInB = vec4Pool.pop().subset(point, b.position).rotatesconj(b.rotation);
                calcImpulseResponseMat(matB, b, pointInB, pointInB);
            } else { matB.set(); }
            // dv = dvb(Ib) - dva(Ia) == dvb(I) + dva(I) since I = -Ia = Ib
            let impulse = targetDeltaVelocityByImpulse.mulmatls(matA.adds(matB).invs());
            if (impulse.norm() > 1.0) {
                console.log("hq");
            }
            // if (impulse.norm1() === 0) continue;
            // console.assert(isFinite(impulse.norm1()));
            // console.assert(isFinite(normal.norm1()));
            mat4Pool.push(matA, matB);
            // resolve velocity by applying final impulse
            if (b?.mass > 0) {
                collision.dvB = vec4Pool.pop();
                collision.dwB = bivecPool.pop();
                applyImpulseAndGetDeltaVW(collision.dvB, collision.dwB, b, pointInB, impulse);
            }
            if (a.mass > 0) {
                collision.dvA = vec4Pool.pop();
                collision.dwA = bivecPool.pop();
                applyImpulseAndGetDeltaVW(collision.dvA, collision.dwA, a, pointInA, impulse.negs());
            }
            this.updateSeparateSpeeds(collision);
        }
    }
    updateSeparateSpeeds(collision: PreparedCollision) {
        for (let c of this.collisionList) {
            if (collision.a.mass > 0) {
                if (c.a === collision.a) {
                    this.updateSeparateSpeed(c, true, c.a, collision.dvA, collision.dwA);
                } else if (c.b === collision.a) {
                    this.updateSeparateSpeed(c, false, c.b, collision.dvA, collision.dwA);
                }
            }
            if (collision.b?.mass > 0) {
                if (c.a === collision.b) {
                    this.updateSeparateSpeed(c, true, c.a, collision.dvB, collision.dwB);
                } else if (c.b === collision.b) {
                    this.updateSeparateSpeed(c, false, c.b, collision.dvB, collision.dwB);
                }
            }
        }
    }
    updateSeparateSpeed(collision: PreparedCollision, rigidIsA: boolean, rigid: Rigid, dv: Vec4, dw: Bivec) {
        let delta = vec4Pool.pop().subset(collision.point, rigid.position).dotbsr(dw).adds(dv);
        if (rigidIsA) delta.negs();

        console.assert(isFinite(delta.norm1()), "Numeric error in Collision solver updateDepth");
        collision.relativeVelocity.adds(delta);
        if (collision.pointConstrain) {
            collision.separateSpeed = -collision.relativeVelocity.norm();
        }
        else {
            let dss = delta.dot(collision.normal); delta.pushPool();
            collision.separateSpeed += dss;
        }
    }

    resolvePosition() {
        // iteratively solve the deepest
        for (let i = 0; i < this.maxPositionIterations; i++) {
            let collision = this.collisionList.sort((a, b) => b.depth - a.depth)[0];
            if(!collision) return;
            let { point, a, b, depth, normal } = collision;
            if (depth <= 0) return;
            if (depth > 10) {
                console.error("Depth direction error in resolvePosition");
            }
            let invInertiaA = 0, invInertiaB = 0;
            if (a.mass > 0) {
                let pA = vec4Pool.pop().subset(point, a.position);
                let torqueA = bivecPool.pop().wedgevvset(normal, pA);
                if (a.inertiaIsotroy) {
                    collision.dwA = torqueA.mulfs(a.invInertia.xy);
                } else {
                    torqueA.rotatesconj(a.rotation);
                    collision.dwA = mulBivec(torqueA, a.invInertia, torqueA).rotates(a.rotation);
                }
                invInertiaA = -pA.dotbset(pA, collision.dwA).dot(normal);
                pA.pushPool();
            }
            if (b?.mass > 0) {
                let pB = vec4Pool.pop().subset(point, b.position);
                let torqueB = bivecPool.pop().wedgevvset(pB, normal);
                if (b.inertiaIsotroy) {
                    collision.dwB = torqueB.mulfs(b.invInertia.xy);
                } else {
                    torqueB.rotatesconj(b.rotation);
                    collision.dwB = mulBivec(torqueB, b.invInertia, torqueB).rotates(b.rotation);
                }
                invInertiaB = pB.dotbset(pB, collision.dwB).dot(normal);
                pB.pushPool();
            }
            // console.assert(invInertiaA >= 0);
            // console.assert(invInertiaB >= 0);
            let depthDivTotalInvs = depth * this.PositionRelaxationFactor / (a.invMass + (b?.invMass ?? 0) + invInertiaA + invInertiaB);
            if (!isFinite(depthDivTotalInvs)) {
                console.error("A numeric error occured in Rigid collision solver: depthDivTotalInvs in resolvePosition");
            }
            if (a.mass > 0) {
                // here can't mul invInertiaA since dwA is by unit impulse, and linear part is already invInertiaA
                collision.dwA.mulfs(depthDivTotalInvs);
                // clamp rotation
                let angle = collision.dwA.norm();
                if (angle > this.maxResolveRotationAngle) {
                    collision.dwA.mulfs(this.maxResolveRotationAngle / angle);
                }
                collision.dvA = vec4Pool.pop().copy(normal).mulfs(-depthDivTotalInvs * a.invMass);
                if (!isFinite(angle + collision.dvA.norm1() + collision.dwA.norm1() + a.position.norm1())) {
                    console.error("A numeric error occured in Rigid collision solver: dvA,dwA in resolvePosition");
                }
                a.position.adds(collision.dvA);
                let r = rotorPool.pop().expset(collision.dwA);
                a.rotation.mulsl(r); r.pushPool();
                if (!isFinite(a.rotation.l.norm() + a.rotation.r.norm() + a.position.norm1())) {
                    console.error("A numeric error occured in Rigid collision solver: dvA,dwA in resolvePosition");
                }
            }
            if (b?.mass > 0) {
                collision.dwB.mulfs(depthDivTotalInvs);
                // clamp rotation
                let angle = collision.dwB.norm();
                if (angle > this.maxResolveRotationAngle) {
                    collision.dwB.mulfs(this.maxResolveRotationAngle / angle);
                }
                collision.dvB = vec4Pool.pop().copy(normal).mulfs(depthDivTotalInvs * b.invMass);
                if (!isFinite(angle + collision.dvB.norm1() + collision.dwB.norm1() + b.position.norm1())) {
                    console.error("A numeric error occured in Rigid collision solver: dvB,dwB in resolvePosition");
                }
                b.position.adds(collision.dvB);
                let r = rotorPool.pop().expset(collision.dwB!);
                b.rotation.mulsl(r); r.pushPool();
                if (!isFinite(b.rotation.l.norm() + b.rotation.r.norm() + b.position.norm1())) {
                    console.error("A numeric error occured in Rigid collision solver: dvB,dwB in resolvePosition");
                }
            }
            // collision.depth = 0;
            this.updateDepths(collision);
        }
    }
    updateDepths(collision: PreparedCollision) {
        for (let c of this.collisionList) {
            if (collision.a.mass > 0) {
                if (c.a === collision.a) {
                    this.updateDepth(c, true, c.a, collision.dvA, collision.dwA!);
                } else if (c.b === collision.a) {
                    this.updateDepth(c, false, c.b, collision.dvA, collision.dwA!);
                }
            }
            if (collision.b?.mass > 0) {
                if (c.a === collision.b) {
                    this.updateDepth(c, true, c.a, collision.dvB, collision.dwB!);
                } else if (c.b === collision.b) {
                    this.updateDepth(c, false, c.b, collision.dvB, collision.dwB!);
                }
            }
        }
    }
    updateDepth(collision: PreparedCollision, rigidIsA: boolean, rigid: Rigid, dv: Vec4, dw: Bivec) {
        if (collision.pointConstrain) {
            let a = collision.normal.copy(collision.pointConstrain.pointA).rotates(collision.a.rotation).adds(collision.a.position);
            if (collision.b) {
                let b = vec4Pool.pop().copy(collision.pointConstrain.pointB).rotates(collision.b.rotation).adds(collision.b.position);
                a.subs(b); b.pushPool();
            } else {
                a.subs(collision.pointConstrain.pointB);
            }
            collision.depth = a.norm();
            collision.normal.norms();
        } else {
            let a = vec4Pool.pop().subset(collision.point, rigid.position);
            let dd = a.dotbsr(dw).adds(dv).dot(collision.normal);
            console.assert(isFinite(a.norm1()), "Numeric error in Collision solver updateDepth");
            collision.depth += rigidIsA ? dd : -dd;
            a.pushPool();
        }
    }
}
let _vec4x = new Vec4;
let _vec4y = new Vec4;
let _vec4z = new Vec4;
let _vec4w = new Vec4;
let _biv = new Bivec;
let _mat4r = new Mat4;

function calcDeltaVWByImpulse(outV: Vec4, outW: Bivec, rigid: Rigid, localPoint: Vec4, impulse: Vec4) {
    outV.copy(impulse).mulfs(rigid.invMass);
    _vec4x.copy(impulse).rotatesconj(rigid.rotation);
    mulBivec(outW, outW.wedgevvset(localPoint, _vec4x), rigid.invInertia!).rotates(rigid.rotation);
};
function applyImpulseAndGetDeltaVW(outV: Vec4, outW: Bivec, rigid: Rigid, localPoint: Vec4, impulse: Vec4) {
    calcDeltaVWByImpulse(outV, outW, rigid, localPoint, impulse);
    { console.assert(isFinite(outV.norm1() + outW.norm1()), "A numeric error occured in Rigid collision solver: outV, outW in applyImpulseAndGetDeltaVW"); }
    rigid.velocity.adds(outV);
    rigid.angularVelocity.adds(outW);
    if (!isFinite(rigid.velocity.norm1() + rigid.angularVelocity.norm1())) { console.error("A numeric error occured in Rigid collision solver: rigid velocity in applyImpulseAndGetDeltaVW"); }
}
/** calculate transfer matrix between impulse applying at src position and response delta velocity at dst position
 *  src and dst are in rigid's local frame
 */
function calcImpulseResponseMat(out: Mat4, rigid: Rigid, src: Vec4, dst: Vec4) {
    let ii = rigid.invInertia!;
    // calculate relativePos cross base vectors and get angular part
    _vec4x.dotbset(dst, _biv.set(-src.y * ii.xy, -src.z * ii.xz, -src.w * ii.xw));
    _vec4y.dotbset(dst, _biv.set(src.x * ii.xy, 0, 0, -src.z * ii.yz, -src.w * ii.yw));
    _vec4z.dotbset(dst, _biv.set(0, src.x * ii.xz, 0, src.y * ii.yz, 0, -src.w * ii.zw));
    _vec4w.dotbset(dst, _biv.set(0, 0, src.x * ii.xw, 0, src.y * ii.yw, src.z * ii.zw));
    out.augVec4set(_vec4x, _vec4y, _vec4z, _vec4w);
    // add linear part (add a diagonal matrix inline)
    out.elem[0] += rigid.invMass;
    out.elem[5] += rigid.invMass;
    out.elem[10] += rigid.invMass;
    out.elem[15] += rigid.invMass;
    _mat4r.setFromRotor(rigid.rotation);
    // convert matrix to world frame by Mworld <= R Mlocal R'
    return out.mulsl(_mat4r).mulsr(_mat4r.ts());
}