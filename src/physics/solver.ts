namespace tesserxel {
    export namespace physics {
        export interface SolverConstructor {
            new(): Solver;
        };
        export abstract class Solver {
            abstract run(collisionList: Collision[]): void;
        }
        export interface PreparedCollision extends Collision {
            separateSpeed: number;
            relativeVelocity: math.Vec4;
            materialA: Material;
            materialB: Material;
            dvA?: math.Vec4;
            dvB?: math.Vec4;
            dwA?: math.Bivec;
            dwB?: math.Bivec;
        }
        export class IterativeImpulseSolver extends Solver {
            maxPositionIterations: number = 32;
            maxVelocityIterations: number = 32;
            maxResolveRotationAngle = 0 * math._DEG2RAD;
            PositionRelaxationFactor = 0.9;
            collisionList: PreparedCollision[];
            run(collisionList: Collision[]) {
                if (!collisionList.length) return;

                for (let c of collisionList) {
                    if (!c.a.rotation.isFinite() ||
                        !c.b.rotation.isFinite()) {
                        console.error("An error occured to rigid body");
                    }
                }
                this.prepare(collisionList);
                this.resolvePosition();
                for (let c of collisionList) {
                    if (!c.a.rotation.isFinite() ||
                        !c.b.rotation.isFinite()) {
                        console.error("An error occured to rigid body");
                    }
                }
                this.resolveVelocity();

                for (let c of collisionList) {
                    if (!c.a.rotation.isFinite() ||
                        !c.b.rotation.isFinite()) {
                        console.error("An error occured to rigid body");
                    }
                }
            }
            prepare(collisionList: Collision[]) {
                this.collisionList = collisionList.map(e => {
                    let { point, a, b, normal } = e;
                    let collision = e as PreparedCollision;
                    collision.materialA = a.material;
                    collision.materialB = b.material;
                    // after got material, we solve union regardless of it's collision parts
                    if ((a as SubRigid).parent) collision.a = (a as SubRigid).parent;
                    if ((b as SubRigid).parent) collision.b = (b as SubRigid).parent;
                    let temp = math.vec4Pool.pop();
                    collision.relativeVelocity = collision.b.getlinearVelocity(math.vec4Pool.pop(), point).subs(
                        collision.a.getlinearVelocity(temp, point)
                    );
                    temp.pushPool();
                    collision.separateSpeed = collision.relativeVelocity.dot(normal);
                    return collision;
                })
            }
            resolvePosition() {
                // iteratively solve the deepest
                for (let i = 0; i < this.maxPositionIterations; i++) {
                    let collision = this.collisionList.sort((a, b) => b.depth - a.depth)[0];
                    let { point, a, b, depth, normal } = collision;
                    if (depth <= 0) return;
                    if (depth > 10) {
                        console.error("Depth direction error in resolvePosition");
                    }
                    let invInertiaA = 0, invInertiaB = 0;
                    if (a.mass > 0) {
                        let pA = math.vec4Pool.pop().subset(point, a.position);
                        let torqueA = math.bivecPool.pop().wedgevvset(normal, pA);
                        if (a.inertiaIsotroy) {
                            collision.dwA = torqueA.mulfs(a.invInertia.xy);
                        } else {
                            torqueA.rotatesconj(a.rotation);
                            collision.dwA = mulBivec(torqueA, a.invInertia, torqueA).rotates(a.rotation);
                        }
                        invInertiaA = -pA.dotbset(pA, collision.dwA).dot(normal);
                        pA.pushPool();
                    }
                    if (b.mass > 0) {
                        let pB = math.vec4Pool.pop().subset(point, b.position);
                        let torqueB = math.bivecPool.pop().wedgevvset(pB, normal);
                        if (b.inertiaIsotroy) {
                            collision.dwB = torqueB.mulfs(b.invInertia.xy);
                        } else {
                            torqueB.rotatesconj(b.rotation);
                            collision.dwB = mulBivec(torqueB, b.invInertia, torqueB).rotates(b.rotation);
                        }
                        invInertiaB = pB.dotbset(pB, collision.dwB).dot(normal);
                        pB.pushPool();
                    }
                    let depthDivTotalInvs = depth * this.PositionRelaxationFactor / (a.invMass + b.invMass + invInertiaA + invInertiaB);
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
                        collision.dvA = math.vec4Pool.pop().copy(normal).mulfs(-depthDivTotalInvs * a.invMass);
                        if (!isFinite(angle + collision.dvA.norm1() + collision.dwA.norm1() + a.position.norm1())) {
                            console.error("A numeric error occured in Rigid collision solver: dvA,dwA in resolvePosition");
                        }
                        a.position.adds(collision.dvA);
                        let r = math.rotorPool.pop().expset(collision.dwA);
                        a.rotation.mulsl(r); r.pushPool();
                        if (!isFinite(a.rotation.l.norm() + a.rotation.r.norm() + a.position.norm1())) {
                            console.error("A numeric error occured in Rigid collision solver: dvA,dwA in resolvePosition");
                        }
                    }
                    if (b.mass > 0) {
                        collision.dwB.mulfs(depthDivTotalInvs);
                        // clamp rotation
                        let angle = collision.dwB.norm();
                        if (angle > this.maxResolveRotationAngle) {
                            collision.dwB.mulfs(this.maxResolveRotationAngle / angle);
                        }
                        collision.dvB = math.vec4Pool.pop().copy(normal).mulfs(depthDivTotalInvs * b.invMass);
                        if (!isFinite(angle + collision.dvB.norm1() + collision.dwB.norm1() + b.position.norm1())) {
                            console.error("A numeric error occured in Rigid collision solver: dvB,dwB in resolvePosition");
                        }
                        b.position.adds(collision.dvB);
                        let r = math.rotorPool.pop().expset(collision.dwB);
                        b.rotation.mulsl(r); r.pushPool();
                        if (!isFinite(b.rotation.l.norm() + b.rotation.r.norm() + b.position.norm1())) {
                            console.error("A numeric error occured in Rigid collision solver: dvB,dwB in resolvePosition");
                        }
                    }
                    // collision.depth = 0;
                    this.updateDepths(collision);
                }
            }
            resolveVelocity() {
                // iteratively solve lowest separateSpeed
                for (let i = 0; i < this.maxVelocityIterations; i++) {
                    let collision = this.collisionList.sort((a, b) => a.separateSpeed - b.separateSpeed)[0];
                    let { point, a, b, separateSpeed, normal, relativeVelocity, materialA, materialB } = collision;
                    if (separateSpeed >= 0) return;
                    let restitution = Material.getContactRestitution(materialA, materialB);
                    // set target separateSpeed to collision, next we'll solve to reach it
                    // collision.separateSpeed = -separateSpeed * restitution;
                    let targetRelativeVelocity = math.vec4Pool.pop().copy(normal).mulfs(-separateSpeed * restitution);
                    let targetDeltaVelocityByImpulse = targetRelativeVelocity.subs(relativeVelocity);
                    let pointInA: math.Vec4, pointInB: math.Vec4;
                    let matA = math.mat4Pool.pop(), matB = math.mat4Pool.pop()
                    if (a.mass > 0) {
                        pointInA = math.vec4Pool.pop().subset(point, a.position).rotatesconj(a.rotation);
                        calcImpulseResponseMat(matA, a, pointInA, pointInA);
                    } else { matA.set(); }
                    if (b.mass > 0) {
                        pointInB = math.vec4Pool.pop().subset(point, b.position).rotatesconj(b.rotation);
                        calcImpulseResponseMat(matB, b, pointInB, pointInB);
                    } else { matB.set(); }
                    // dv = dvb(Ib) - dva(Ia) == dvb(I) + dva(I) since I = -Ia = Ib
                    let impulse = targetDeltaVelocityByImpulse.mulmatls(matA.adds(matB).invs());
                    // if (impulse.norm1() === 0) continue;
                    console.assert(isFinite(impulse.norm1()));
                    console.assert(isFinite(normal.norm1()));
                    math.mat4Pool.push(matA, matB);
                    // decomposite impulse into normal and tangent to deal with friction
                    let impulseNValue = Math.max(0, impulse.dot(normal));
                    console.assert(isFinite(impulseNValue));
                    let impulseN = math.vec4Pool.pop().copy(normal).mulfs(impulseNValue);
                    let impulseT = math.vec4Pool.pop().subset(impulse, impulseN);
                    let impulseTValue = impulseT.norm();
                    console.assert(isFinite(impulseTValue));

                    let friction = Material.getContactFriction(materialA, materialB);
                    let maximalFriction = friction * impulseNValue;
                    if (impulseTValue > maximalFriction) {
                        // correct tangent impulse for friction

                        console.assert(isFinite(impulseT.norm1()));
                        if (!isFinite(maximalFriction / impulseTValue)) {
                            console.log("oma");
                        }
                        impulseT.mulfs(maximalFriction / impulseTValue);
                        console.assert(isFinite(maximalFriction / impulseTValue));
                    }
                    console.assert(isFinite(impulseT.norm1()));
                    impulse.addset(impulseT, impulseN);
                    math.vec4Pool.push(impulseT, impulseN);
                    // resolve velocity by applying final impulse
                    if (b.mass > 0) {
                        collision.dvB = math.vec4Pool.pop();
                        collision.dwB = math.bivecPool.pop();
                        applyImpulseAndGetDeltaVW(collision.dvB, collision.dwB, b, pointInB, impulse);
                    }
                    if (a.mass > 0) {
                        collision.dvA = math.vec4Pool.pop();
                        collision.dwA = math.bivecPool.pop();
                        applyImpulseAndGetDeltaVW(collision.dvA, collision.dwA, a, pointInA, impulse.negs());
                    }
                    this.updateSeparateSpeeds(collision);
                }
            }
            updateSeparateSpeeds(collision: PreparedCollision) {
                for (let c of this.collisionList) {
                    if (c === collision) {
                        if (collision.a.mass > 0) this.updateSeparateSpeed(c, true, c.a, collision.dvA, collision.dwA);
                        if (collision.b.mass > 0) this.updateSeparateSpeed(c, false, c.b, collision.dvB, collision.dwB);
                        continue;
                    }
                    if (collision.a.mass > 0) {
                        if (c.a === collision.a) {
                            this.updateSeparateSpeed(c, true, c.a, collision.dvA, collision.dwA);
                            continue;
                        }
                        if (c.b === collision.a) {
                            this.updateSeparateSpeed(c, false, c.b, collision.dvA, collision.dwA);
                            continue;
                        }
                    }
                    if (collision.b.mass > 0) {
                        if (c.a === collision.b) {
                            this.updateSeparateSpeed(c, true, c.a, collision.dvB, collision.dwB);
                            continue;
                        }
                        if (c.b === collision.b) {
                            this.updateSeparateSpeed(c, false, c.b, collision.dvB, collision.dwB);
                            continue;
                        }
                    }
                }
            }

            updateDepths(collision: PreparedCollision) {
                for (let c of this.collisionList) {
                    // if (c === collision) continue;
                    if (collision.a.mass > 0) {
                        if (c.a === collision.a) {
                            this.updateDepth(c, true, c.a, collision.dvA, collision.dwA);
                            continue;
                        }
                        if (c.b === collision.a) {
                            this.updateDepth(c, false, c.b, collision.dvA, collision.dwA);
                            continue;
                        }
                    }
                    if (collision.b.mass > 0) {
                        if (c.a === collision.b) {
                            this.updateDepth(c, true, c.a, collision.dvB, collision.dwB);
                            continue;
                        }
                        if (c.b === collision.b) {
                            this.updateDepth(c, false, c.b, collision.dvB, collision.dwB);
                            continue;
                        }
                    }
                }
            }
            updateDepth(collision: PreparedCollision, rigidIsA: boolean, rigid: Rigid, dv: math.Vec4, dw: math.Bivec) {
                let a = math.vec4Pool.pop().subset(collision.point, rigid.position);
                let dd = a.dotbsr(dw).adds(dv).dot(collision.normal); a.pushPool();
                console.assert(isFinite(a.norm1()), "Numeric error in Collision solver updateDepth");
                collision.depth += rigidIsA ? dd : -dd;
            }
            updateSeparateSpeed(collision: PreparedCollision, rigidIsA: boolean, rigid: Rigid, dv: math.Vec4, dw: math.Bivec) {
                let delta = math.vec4Pool.pop().subset(collision.point, rigid.position).dotbsr(dw).adds(dv);
                if (rigidIsA) delta.negs();
                let dss = delta.dot(collision.normal);

                console.assert(isFinite(delta.norm1()), "Numeric error in Collision solver updateDepth");
                collision.relativeVelocity.adds(delta); delta.pushPool();
                collision.separateSpeed += dss;
            }
        }
        let _vec4x = new math.Vec4;
        let _vec4y = new math.Vec4;
        let _vec4z = new math.Vec4;
        let _vec4w = new math.Vec4;
        let _biv = new math.Bivec;
        let _mat4r = new math.Mat4;

        function calcDeltaVWByImpulse(outV: math.Vec4, outW: math.Bivec, rigid: Rigid, localPoint: math.Vec4, impulse: math.Vec4) {
            outV.copy(impulse).mulfs(rigid.invMass);
            _vec4x.copy(impulse).rotatesconj(rigid.rotation);
            mulBivec(outW, outW.wedgevvset(localPoint, _vec4x), rigid.invInertia).rotates(rigid.rotation);
        };
        function applyImpulseAndGetDeltaVW(outV: math.Vec4, outW: math.Bivec, rigid: Rigid, localPoint: math.Vec4, impulse: math.Vec4) {
            calcDeltaVWByImpulse(outV, outW, rigid, localPoint, impulse);
            { console.assert(isFinite(outV.norm1() + outW.norm1()), "A numeric error occured in Rigid collision solver: outV, outW in applyImpulseAndGetDeltaVW"); }
            rigid.velocity.adds(outV);
            rigid.angularVelocity.adds(outW);
            if (!isFinite(rigid.velocity.norm1() + rigid.angularVelocity.norm1())) { console.error("A numeric error occured in Rigid collision solver: rigid velocity in applyImpulseAndGetDeltaVW"); }
        }
        /** calculate transfer matrix between impulse applying at src position and response delta velocity at dst position
         *  src and dst are in rigid's local frame
         */
        function calcImpulseResponseMat(out: math.Mat4, rigid: Rigid, src: math.Vec4, dst: math.Vec4) {
            let ii = rigid.invInertia;
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
    }
}