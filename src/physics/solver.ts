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
            dvA?: math.Vec4;
            dvB?: math.Vec4;
            dwA?: math.Bivec;
            dwB?: math.Bivec;
        }
        export class IterativeImpulseSolver extends Solver {
            maxPositionIterations: number = 5;
            maxVelocityIterations: number = 5;
            collisionList: PreparedCollision[];
            run(collisionList: Collision[]) {
                if (!collisionList.length) return;
                this.prepare(collisionList);
                this.resolveVelocity();
                this.resolvePosition();
            }
            prepare(collisionList: Collision[]) {
                this.collisionList = collisionList.map(e => {
                    let { point, a, b, normal } = e;
                    let collision = e as PreparedCollision;
                    let temp = math.vec4Pool.pop();
                    collision.relativeVelocity = b.getlinearVelocity(math.vec4Pool.pop(), point).subs(
                        a.getlinearVelocity(temp, point)
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

                }
            }
            resolveVelocity() {
                // iteratively solve lowest separateSpeed
                for (let i = 0; i < this.maxVelocityIterations; i++) {
                    let collision = this.collisionList.sort((a, b) => a.separateSpeed - b.separateSpeed)[0];
                    let { point, a, b, separateSpeed, normal, relativeVelocity } = collision;
                    if (separateSpeed >= 0) return;
                    let restitution = Material.getContactRestitution(a.material, b.material);
                    // set target separateSpeed to collision, next we'll solve to reach it
                    collision.separateSpeed = -separateSpeed * restitution;
                    let targetRelativeVelocity = normal.mulf(collision.separateSpeed);
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
                    let impulse = matA.adds(matB).invs().mulv(targetDeltaVelocityByImpulse);
                    math.mat4Pool.push(matA, matB);
                    // decomposite impulse into normal and tangent to deal with friction
                    let impulseNValue = impulse.dot(normal);
                    let impulseN = math.vec4Pool.pop().copy(normal).mulfs(impulseNValue);
                    let impulseT = math.vec4Pool.pop().subset(impulse, impulseN);
                    let impulseTValue = impulseT.norm();
                    let friction = Material.getContactFriction(a.material, b.material);
                    let maximalFriction = friction * impulseNValue;
                    if (impulseTValue > maximalFriction) {
                        // correct tangent impulse for friction
                        impulseT.mulfs(maximalFriction / impulseTValue);
                    }
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
                    if (c === collision) continue;
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
            updateSeparateSpeed(collision: PreparedCollision, rigidIsA: boolean, rigid: Rigid, dv: math.Vec4, dw: math.Bivec) {
                let a = math.vec4Pool.pop().subset(collision.point, rigid.position);
                let dss = a.dotbsr(dw).adds(dv).dot(collision.normal); a.pushPool();
                collision.separateSpeed += rigidIsA ? -dss : dss;
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
            rigid.velocity.adds(outV);
            rigid.angularVelocity.adds(outW);
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