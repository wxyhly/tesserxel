import { Bivec, bivecPool } from "../math/algebra/bivec";
import { Mat4, mat4Pool } from "../math/algebra/mat4";
import { Matrix } from "../math/algebra/matrix";
import { Rotor } from "../math/algebra/rotor";
import { Vec4, vec4Pool } from "../math/algebra/vec4";
import { mulBivec, World } from "./engine";
import { Rigid } from "./rigid";

export interface ForceAccumulatorConstructor {
    new(): ForceAccumulator;
};
export abstract class ForceAccumulator {
    abstract run(world: World, dt: number): void;
    private _biv1 = new Bivec;
    private _biv2 = new Bivec;
    private readonly _bivec0 = new Bivec;
    getState(world: World) {
        // clear
        for (let o of world.rigids) {
            if (!o.invMass) continue;
            o.force.set();
            o.torque.set();
        }
        // apply force
        for (let f of world.forces) {
            f.apply(world.time);
        }
        for (let o of world.rigids) {
            if (!o.invMass) continue;
            o.acceleration.copy(world.gravity);
            if (o.force.norm1() > 0) {
                o.acceleration.addmulfs(o.force, o.invMass);
            }
            if (o.inertiaIsotroy) {
                if (o.torque.norm1() > 0) o.angularAcceleration.set().addmulfs(o.torque, o.invInertia.xy);
            } else {
                // Euler equation of motion
                let localT = (o.torque.norm1() > 0) ? this._biv2.rotateconjset(o.torque, o.rotation) : this._bivec0;
                let localW = this._biv1.rotateconjset(o.angularVelocity, o.rotation);
                let localL = mulBivec(o.angularAcceleration, localW, o.inertia);
                mulBivec(o.angularAcceleration, localL.crossrs(localW).negs().adds(localT), o.invInertia);
                o.angularAcceleration.rotates(o.rotation);
            }
        }
    }
}
export namespace force_accumulator {
    export class Euler2 extends ForceAccumulator {
        private _bivec = new Bivec;
        private _rotor = new Rotor;
        run(world: World, dt: number) {
            for (let o of world.rigids) {
                if (!o.invMass) continue;
                o.rotation.norms();
            }
            this.getState(world);
            world.time += dt;
            let dtsqrhalf = dt * dt / 2;
            for (let o of world.rigids) {
                if (o.sleep || !o.position) continue;
                // x1 = x0 + v0 t + a0 t^2/2
                // v1 = v0 + a0 t/2
                o.position.addmulfs(o.velocity, dt).addmulfs(o.acceleration, dtsqrhalf);
                o.velocity.addmulfs(o.acceleration, dt);
                if (!o.rotation) continue;
                o.rotation.mulsl(this._rotor.expset(
                    this._bivec.copy(o.angularVelocity).mulfs(dt).addmulfs(o.angularAcceleration, dtsqrhalf)
                ));
                o.angularVelocity.addmulfs(o.angularAcceleration, dt);
            }
        }
    }
    export class Predict3 extends ForceAccumulator {
        private _bivec1 = new Bivec;
        private _bivec2 = new Bivec;
        private _rotor = new Rotor;
        private _vec = new Vec4;
        run(world: World, dt: number) {
            for (let o of world.rigids) {
                if (!o.invMass) continue;
                o.rotation.norms();
            }
            let prevStates = world.rigids.map(obj => ({
                acceleration: obj.acceleration.clone(),
                angularAcceleration: obj.angularAcceleration.clone(),
            }));
            this.getState(world);
            world.time += dt;
            let dthalf = dt * 0.5;
            let dtsqrdiv6 = dt * dthalf / 3;
            for (let idx = 0, len = world.rigids.length; idx < len; idx++) {
                let o = world.rigids[idx];
                let prevO = prevStates[idx];
                if (o.sleep || !o.position) continue;
                // if we know a1, then:
                // x1 = x0 + v0 t + (2/3 a0 + 1/3 a1) t^2/2
                // v1 = v0 + (a0 + a1) t/2
                // predict a1 = 2a0 - a{-1}, got:
                // x1 = x0 + v0 t + (4/3 a0 - 1/3 a{-1}) t^2/2
                // v1 = v0 + (3/2 a0 - 1/2 a{-1}) t
                o.position.addmulfs(o.velocity, dt).addmulfs(
                    this._vec.copy(prevO.acceleration).addmulfs(o.acceleration, -4), -dtsqrdiv6
                );
                o.velocity.addmulfs(prevO.acceleration.addmulfs(o.acceleration, -3), -dthalf);
                if (!o.rotation) continue;
                o.rotation.mulsl(this._rotor.expset(
                    this._bivec1.copy(o.angularVelocity).mulfs(dt).addmulfs(
                        this._bivec2.copy(prevO.angularAcceleration).addmulfs(o.angularAcceleration, -4), -dtsqrdiv6
                    )
                ));
                o.angularVelocity.addmulfs(prevO.angularAcceleration.addmulfs(o.angularAcceleration, -3), -dthalf);
            }
        }
    }
    interface State {
        position: Vec4;
        rotation: Rotor;
        velocity: Vec4;
        angularVelocity: Bivec;
        acceleration: Vec4;
        angularAcceleration: Bivec;
    }
    export class RK4 extends ForceAccumulator {
        private _bivec1 = new Bivec;
        private _rotor = new Rotor;
        run(world: World, dt: number) {
            for (let o of world.rigids) {
                if (!o.invMass) continue;
                o.rotation.norms();
            }
            let dthalf = dt * 0.5;
            let dtdiv6 = dt / 6;
            let self = this;
            function storeState(states: State[][]) {
                self.getState(world);
                states.push(world.rigids.map(obj => ({
                    position: obj.position?.clone(),
                    rotation: obj.rotation?.clone(),
                    velocity: obj.velocity.clone(),
                    angularVelocity: obj.angularVelocity.clone(),
                    acceleration: obj.acceleration.clone(),
                    angularAcceleration: obj.angularAcceleration.clone(),
                })));
            }
            function loadState(states: State[][], index: number) {
                let state = states[index];
                for (let idx = 0, len = world.rigids.length; idx < len; idx++) {
                    let o = world.rigids[idx];
                    let s = state[idx];
                    o.position?.copy(s?.position);
                    o.rotation?.copy(s?.rotation);
                    o.velocity.copy(s.velocity);
                    o.angularVelocity.copy(s.angularVelocity);
                    o.acceleration.copy(s.acceleration);
                    o.angularAcceleration.copy(s.angularAcceleration);
                }
            }
            let states: State[][] = [];
            storeState(states); // 0: k1 = f(yn, tn)
            for (let o of world.rigids) {
                if (o.sleep || !o.position) continue;
                o.position.addmulfs(o.velocity, dthalf);
                o.velocity.addmulfs(o.acceleration, dthalf);
                if (!o.rotation) continue;
                o.rotation.mulsl(
                    this._rotor.expset(this._bivec1.copy(o.angularVelocity).mulfs(dthalf))
                );
                o.angularVelocity.addmulfs(o.angularAcceleration, dthalf);
            }
            world.time += dthalf;
            storeState(states); // 1: k2 = f(yn + h/2 k1, tn + h/2)
            loadState(states, 0);
            let state = states[1];
            for (let idx = 0, len = world.rigids.length; idx < len; idx++) {
                let o = world.rigids[idx];
                if (o.sleep || !o.position) continue;
                let s = state[idx];
                o.position.addmulfs(s.velocity, dthalf);
                o.velocity.addmulfs(s.acceleration, dthalf);
                if (!o.rotation) continue;
                o.rotation.mulsl(
                    this._rotor.expset(this._bivec1.copy(s.angularVelocity).mulfs(dthalf))
                );
                o.angularVelocity.addmulfs(s.angularAcceleration, dthalf);
            }
            storeState(states); // 2: k3 = f(yn + h/2 k2, tn + h/2)
            loadState(states, 0);
            state = states[2];
            for (let idx = 0, len = world.rigids.length; idx < len; idx++) {
                let o = world.rigids[idx];
                if (o.sleep || !o.position) continue;
                let s = state[idx];
                o.position.addmulfs(s.velocity, dt);
                o.velocity.addmulfs(s.acceleration, dt);
                if (!o.rotation) continue;
                o.rotation.mulsl(
                    this._rotor.expset(this._bivec1.copy(s.angularVelocity).mulfs(dt))
                );
                o.angularVelocity.addmulfs(s.angularAcceleration, dt);
            }
            world.time += dthalf;
            storeState(states); // 3: k4 = f(yn + h k3, tn + h)
            loadState(states, 0);
            for (let idx = 0, len = world.rigids.length; idx < len; idx++) {
                let o = world.rigids[idx];
                if (o.sleep || !o.position) continue;
                let k1 = states[0][idx];
                let k2 = states[1][idx];
                let k3 = states[2][idx];
                let k4 = states[3][idx];
                o.position.addmulfs(
                    k1.velocity.adds(k4.velocity).addmulfs(
                        k2.velocity.adds(k3.velocity), 2
                    ), dtdiv6
                );
                o.velocity.addmulfs(
                    k1.acceleration.adds(k4.acceleration).addmulfs(
                        k2.acceleration.adds(k3.acceleration), 2
                    ), dtdiv6
                );
                if (!o.rotation) continue;
                o.rotation.mulsl(this._rotor.expset(
                    k1.angularVelocity.adds(k4.angularVelocity).addmulfs(
                        k2.angularVelocity.adds(k3.angularVelocity), 2
                    ).mulfs(dtdiv6)
                ));
                o.angularVelocity.addmulfs(
                    k1.angularAcceleration.adds(k4.angularAcceleration).addmulfs(
                        k2.angularAcceleration.adds(k3.angularAcceleration), 2
                    ), dtdiv6
                );
            }
        }
    }
}
export abstract class Force {
    abstract apply(time: number): void;
}
// export namespace force {
/** apply a spring force between object a and b
 *  pointA and pointB are in local coordinates,
 *  refering connect point of spring's two ends.
 *  b can be null for attaching spring to a fixed point in the world.
 *  f = k dx - damp * dv */
export class Spring extends Force {
    a: Rigid;
    pointA: Vec4;
    b: Rigid | null;
    pointB: Vec4;
    k: number;
    damp: number;
    length: number;
    private _vec4f = new Vec4();
    private _vec4a = new Vec4();
    private _vec4b = new Vec4();
    private _bivec = new Bivec();
    constructor(
        a: Rigid, b: Rigid | null,
        pointA: Vec4, pointB: Vec4,
        k: number, length: number = 0, damp: number = 0) {
        super();
        this.a = a; this.b = b; this.k = k; this.damp = damp;
        this.pointA = pointA; this.pointB = pointB;
        this.length = length;
    }
    apply(time: number) {
        const pa = this.a.position;
        const pb = this.b?.position;
        this._vec4a.copy(this.pointA).rotates(this.a.rotation).adds(pa);
        this._vec4b.copy(this.pointB);
        if (this.b) this._vec4b.rotates(this.b.rotation).adds(pb!);
        let k = this.k;
        this._vec4f.subset(this._vec4b, this._vec4a);
        if (this.length > 0) {
            let len = this._vec4f.norm();
            k *= (len - this.length) / len;
        }
        //_vec4 is force from a to b
        this._vec4f.mulfs(k);
        // add force
        this.a.force.adds(this._vec4f);
        if (this.b) this.b.force.subs(this._vec4f);
        // add torque
        this.a.torque.adds(this._bivec.wedgevvset(this._vec4f, this._vec4a.subs(pa)));
        if (this.b) this.b.torque.subs(this._bivec.wedgevvset(this._vec4f, this._vec4b.subs(pb!)));
    }
}
export class Damping extends Force {
    objects: Rigid[] = [];
    linearFactor: number;
    // assume angular damp matrix(6x6) has the same eigen vector with inertia matrix
    // this is diagonalized angular damp matrix
    angularFactor: Bivec;
    // todo isotopy simplification

    private _bivec = new Bivec();
    apply(time: number) {
        for (let o of this.objects) {
            o.force.addmulfs(o.velocity, -this.linearFactor);
            o.torque.subs(mulBivec(this._bivec,
                this._bivec.copy(o.angularVelocity).rotatesconj(o.rotation), this.angularFactor
            ).rotates(o.rotation));
        }
    }
    constructor(linearFactor: number, angularFactor: number | Bivec) {
        super();
        this.linearFactor = linearFactor;
        this.angularFactor = angularFactor instanceof Bivec ? angularFactor : new Bivec(
            angularFactor, angularFactor, angularFactor, angularFactor, angularFactor, angularFactor
        );
    }
    add(...objects: Rigid[]) {
        for (let o of objects) {
            this.objects.push(o);
        }
    }
}
export type ElectricCharge = { rigid: Rigid | null, position: Vec4, worldPos?: Vec4, charge: number };
export type ElectricDipole = { rigid: Rigid | null, position: Vec4, worldPos?: Vec4, moment: Vec4, worldMoment?: Vec4 };
export type MagneticDipole = { rigid: Rigid | null, position: Vec4, worldPos?: Vec4, moment: Bivec, worldMoment?: Bivec };
export type CurrentElement = { rigid: Rigid | null, position: Vec4, worldPos?: Vec4, current: Vec4 };
export type CurrentCircuit = { rigid: Rigid | null, position: Vec4, worldPos?: Vec4, current: Vec4, radius: number };
export class MaxWell extends Force {
    electricCharge: ElectricCharge[] = [];
    electricDipole: ElectricDipole[] = [];
    magneticDipole: MagneticDipole[] = [];
    currentElement: CurrentElement[] = [];
    currentCircuit: CurrentCircuit[] = [];
    permittivity = 8.854187817e-12;
    permeability = Math.PI * 4e-7;
    constantElectricField = new Vec4;
    /** magnetic field direction is defined by positive charge's velocity wedge it's lorentz force */
    constantMagneticField = new Bivec;
    private _vecE = new Vec4;
    private _vecdE = new Mat4().set();
    private _vecB = new Bivec;
    private _vecdB = new Matrix(4, 6);
    private _vecP = new Vec4;
    addElectricCharge(s: ElectricCharge) {
        this.electricCharge.push(s);
    }
    addElectricDipole(s: ElectricDipole) {
        this.electricDipole.push(s);
    }
    addMagneticDipole(s: MagneticDipole) {
        this.magneticDipole.push(s);
    }
    getEAt(p: Vec4, dE: boolean, ignore: Rigid | Vec4 | undefined) {
        let electricField = this._vecE.copy(this.constantElectricField);
        this._vecdE.set();
        for (let s of this.electricCharge) {
            if (ignore === s.position || ignore === s?.rigid) continue;
            this.addEOfElectricCharge(electricField, dE ? this._vecdE : undefined, p, s);
        }
        for (let s of this.electricDipole) {
            if (ignore === s.position || ignore === s?.rigid) continue;
            this.addEOfElectricDipole(electricField, dE ? this._vecdE : undefined, p, s);
        }
        return this._vecE;
    }
    getBAt(p: Vec4, dB: boolean, ignore: Rigid | Vec4 | undefined) {
        let magneticField = this._vecB.copy(this.constantMagneticField);
        this._vecdB.elem.fill(0);
        for (let s of this.magneticDipole) {
            if (ignore === s.position || ignore === s?.rigid) continue;
            this.addBOfMagneticDipole(magneticField, dB ? this._vecdB : undefined, p, s);
        }
        return magneticField;
    }
    apply(time: number): void {
        for (let q of this.electricCharge) {
            q.worldPos ??= new Vec4;
            if (q.rigid)
                q.worldPos.copy(q.position).rotates(q.rigid.rotation).adds(q.rigid.position);
            else
                q.worldPos.copy(q.position);
        }
        for (let q of this.electricDipole) {
            q.worldPos ??= new Vec4;
            q.worldMoment ??= new Vec4;
            if (q.rigid) {
                q.worldPos.copy(q.position).rotates(q.rigid.rotation).adds(q.rigid.position);
                q.worldMoment.copy(q.moment).rotates(q.rigid.rotation);
            } else {
                q.worldMoment.copy(q.moment);
            }
        }
        for (let q of this.magneticDipole) {
            q.worldPos ??= new Vec4;
            q.worldMoment ??= new Bivec;
            if (q.rigid) {
                q.worldPos.copy(q.position).rotates(q.rigid.rotation).adds(q.rigid.position);
                q.worldMoment.copy(q.moment).rotates(q.rigid.rotation);
            } else {
                q.worldMoment.copy(q.moment);
            }
        }
        // outter loop: test point, inner loop: source point

        let force = this._vecP;
        for (let q of this.electricCharge) {
            if (!q.rigid || !q.rigid.mass) continue;
            this.getEAt(q.worldPos!, false, q.rigid ?? q.position);
            this.getBAt(q.worldPos!, false, undefined);
            let zeroB = (this._vecB.norm1() === 0);
            let zeroTorque = q.position.norm1() === 0;
            if (zeroB && zeroTorque) {
                q.rigid.force.addmulfs(this._vecE, q.charge);
                continue;
            }
            if (!zeroB) {
                if (zeroTorque) {
                    force.copy(q.rigid.velocity);
                } else {
                    q.rigid.getlinearVelocity(force, q.worldPos!);
                }
                // F = q(E+B.v)
                force.dotbsr(this._vecB).adds(this._vecE).mulfs(q.charge);
            } else {
                force.copy(this._vecE).mulfs(q.charge);
            }
            q.rigid.force.adds(force);
            q.rigid.torque.adds(this._vecB.wedgevvset(
                this._vecE.subset(q.worldPos!, q.rigid.position), force
            ));
        }
        let v4 = force;
        let biv = bivecPool.pop();
        for (let q of this.electricDipole) {
            if (!q.rigid || !q.rigid.mass) continue;
            this.getEAt(q.worldPos!, true, q.rigid ?? q.position);
            let zeroTorque = q.position.norm1() === 0;
            v4.mulmatvset(this._vecdE, q.worldMoment!);
            biv.wedgevvset(this._vecE, q.worldMoment!);
            q.rigid.torque.adds(biv);
            q.rigid.force.adds(v4);
            if (zeroTorque) continue;
            q.rigid.torque.adds(this._vecB.wedgevvset(
                this._vecE.subset(q.worldPos!, q.rigid.position), v4
            ));
        }

        for (let q of this.magneticDipole) {
            if (!q.rigid || !q.rigid.mass) continue;
            this.getBAt(q.worldPos!, true, q.rigid ?? q.position);
            let zeroTorque = q.position.norm1() === 0;

            let db = this._vecdB.elem;
            v4.dotbset(Vec4.x, q.worldMoment!);
            v4.dotbset(v4, biv.set(db[0], db[4], db[8], db[12], db[16], db[20]));
            q.rigid.force.adds(v4);
            v4.dotbset(Vec4.y, q.worldMoment!);
            v4.dotbset(v4, biv.set(db[1], db[5], db[9], db[13], db[17], db[21]));
            q.rigid.force.adds(v4);
            v4.dotbset(Vec4.z, q.worldMoment!);
            v4.dotbset(v4, biv.set(db[2], db[6], db[10], db[14], db[18], db[22]));
            q.rigid.force.adds(v4);
            v4.dotbset(Vec4.w, q.worldMoment!);
            v4.dotbset(v4, biv.set(db[3], db[7], db[11], db[15], db[19], db[23]));
            q.rigid.force.adds(v4);

            biv.crossset(q.worldMoment!, this._vecB);
            q.rigid.torque.adds(biv);
            if (zeroTorque) continue;
            q.rigid.torque.adds(this._vecB.wedgevvset(
                this._vecE.subset(q.worldPos!, q.rigid.position), v4
            ));
        }
        biv.pushPool();
    }
    private addEOfElectricCharge(vecE: Vec4, dE: Mat4 | undefined, p: Vec4, s: ElectricCharge) {

        let r = vec4Pool.pop().subset(p, s.worldPos!);
        let r2 = 1 / r.normsqr();
        let qr4 = s.charge * r2 * r2;
        vecE.addmulfs(r, qr4);
        if (!dE) { r.pushPool(); return; }
        let qr6_neg4 = -4 * qr4 * r2;
        let qrr = r.mulfs(qr6_neg4);
        let xy = qrr.x * r.y, xz = qrr.x * r.z, xt = qrr.x * r.w, yz = qrr.y * r.z, yt = qrr.y * r.w, zt = qrr.z * r.w;
        let mat = mat4Pool.pop();
        dE.adds(mat.set(
            qr4 + qrr.x * r.x, xy, xz, xt,
            xy, qr4 + qrr.y * r.y, yz, yt,
            xz, yz, qr4 + qrr.z * r.z, zt,
            xt, yt, zt, qr4 + qrr.w * r.w
        ));
        mat.pushPool();
        r.pushPool();
    }
    private addBOfMagneticDipole(vecB: Bivec, dB: Matrix | undefined, pos: Vec4, s: MagneticDipole) {
        let k = vec4Pool.pop().subset(pos, s.worldPos!);
        let q = s.worldMoment!.dual();
        let x = k.x, y = k.y, z = k.z, w = k.w;
        let xx = x * x, yy = y * y, zz = z * z, ww = w * w;
        let kxy = q.xy, kxz = q.xz, kxw = q.xw, kyz = q.yz, kyw = q.yw, kzw = q.zw;
        let kyx = -q.xy, kzx = -q.xz, kwx = -q.xw, kzy = -q.yz, kwy = -q.yw, kwz = -q.zw;
        let r2 = xx + yy + zz + ww;
        let kxy2 = kzw * (-xx - yy + zz + ww);
        let kxz2 = kyw * (-xx + yy - zz + ww);
        let kxw2 = kyz * (-xx + yy + zz - ww);
        let kyz2 = kxw * (xx - yy - zz + ww);
        let kyw2 = kxz * (xx - yy + zz - ww);
        let kzw2 = kxy * (xx + yy - zz - ww);

        let rr = 1 / r2;
        let rr2 = rr * rr;
        let rr34 = 4 * rr2 * rr;
        let rr4 = rr34 * rr;
        let xy = x * y,
            xz = x * z,
            xw = x * w,
            yz = y * z,
            yw = y * w,
            zw = z * w;

        vecB.xy += rr34 * ((-kxz * xw - kyz * yw + kxw * xz + kyw * yz) + 0.5 * kxy2);
        vecB.xz += -rr34 * ((-kxy * xw - kzy * zw + kxw * xy + kzw * yz) + 0.5 * kxz2);
        vecB.xw += -rr34 * ((-kxz * xy - kwz * yw + kxy * xz + kwy * zw) - 0.5 * kxw2);
        vecB.yz += rr34 * ((kxy * yw - kzx * zw + kyw * xy + kzw * xz) + 0.5 * kyz2);
        vecB.yw += -rr34 * ((kxy * yz - kwx * zw + kyz * xy - kzw * xw) + 0.5 * kyw2);
        vecB.zw += rr34 * ((kxz * yz - kwx * yw - kyz * xz - kyw * xw) + 0.5 * kzw2);
        if (!dB) return;
        let r2m6xx = r2 - 6 * xx;
        let r2m6yy = r2 - 6 * yy;
        let r2m6zz = r2 - 6 * zz;
        let r2m6ww = r2 - 6 * ww;
        x *= rr4; y *= rr4; z *= rr4; w *= rr4;
        xy *= 6; xz *= 6; xw *= 6; yz *= 6; yw *= 6; zw *= 6;
        let kxy_x = kxy * x, kxz_x = kxz * x, kxw_x = kxw * x, kyz_x = kyz * x, kyw_x = kyw * x, kzw_x = kzw * x;
        let kxy_y = kxy * y, kxz_y = kxz * y, kxw_y = kxw * y, kyz_y = kyz * y, kyw_y = kyw * y, kzw_y = kzw * y;
        let kxy_z = kxy * z, kxz_z = kxz * z, kxw_z = kxw * z, kyz_z = kyz * z, kyw_z = kyw * z, kzw_z = kzw * z;
        let kxy_w = kxy * w, kxz_w = kxz * w, kxw_w = kxw * w, kyz_w = kyz * w, kyw_w = kyw * w, kzw_w = kzw * w;

        dB!.adds(new Matrix(4, 6).setElements(
            (xy * (kyz_w - kyw_z) + 2 * kzw_x * (xx + yy - 2 * (zz + ww)) + (kxw_z - kxz_w) * (r2m6xx)),
            (xy * (kxz_w - kxw_z) + 2 * kzw_y * (xx + yy - 2 * (zz + ww)) + (kyw_z - kyz_w) * (r2m6yy)),
            (zw * (kxz_x + kyz_y) - 2 * kzw_z * (zz + ww - 2 * (xx + yy)) + (kxw_x + kyw_y) * (r2m6zz)),
            - (zw * (kxw_x + kyw_y) + 2 * kzw_w * (zz + ww - 2 * (xx + yy)) + (kxz_x + kyz_y) * (r2m6ww)),

            - (xz * (-kyz_w - kzw_y) + 2 * kyw_x * (xx + zz - 2 * (yy + ww)) + (kxw_y - kxy_w) * (r2m6xx)),
            - (yw * (kxy_x - kyz_z) - 2 * kyw_y * (yy + ww - 2 * (xx + zz)) + (kxw_x + kzw_z) * (r2m6yy)),
            - (xz * (kxy_w - kxw_y) + 2 * kyw_z * (xx + zz - 2 * (yy + ww)) + (kzw_y + kyz_w) * (r2m6zz)),
            (yw * (kxw_x + kzw_z) + 2 * kyw_w * (yy + ww - 2 * (xx + zz)) + (kxy_x - kyz_z) * (r2m6ww)),

            - (xw * (-kzw_y + kyw_z) - 2 * kyz_x * (xx + ww - 2 * (zz + yy)) + (kxy_z - kxz_y) * (r2m6xx)),
            (yz * (kxy_x - kyw_w) - 2 * kyz_y * (zz + yy - 2 * (xx + ww)) + (kxz_x - kzw_w) * (r2m6yy)),
            -(yz * (kxz_x - kzw_w) + 2 * kyz_z * (zz + yy - 2 * (xx + ww)) + (kxy_x - kyw_w) * (r2m6zz)),
            - (xw * (kxz_y - kxy_z) - 2 * kyz_w * (xx + ww - 2 * (zz + yy)) + (-kyw_z + kzw_y) * (r2m6ww)),

            (xw * (-kxy_y - kxz_z) - 2 * kxw_x * (xx + ww - 2 * (yy + zz)) + (kyw_y + kzw_z) * (r2m6xx)),
            (yz * (-kxz_w - kzw_x) + 2 * kxw_y * (yy + zz - 2 * (xx + ww)) + (kyw_x + kxy_w) * (r2m6yy)),
            (yz * (-kxy_w - kyw_x) + 2 * kxw_z * (yy + zz - 2 * (xx + ww)) + (kzw_x + kxz_w) * (r2m6zz)),
            - (xw * (kyw_y + kzw_z) + 2 * kxw_w * (xx + ww - 2 * (yy + zz)) + (-kxy_y - kxz_z) * (r2m6ww)),

            - (xz * (-kxy_y - kxw_w) - 2 * kxz_x * (xx + zz - 2 * (yy + ww)) + (kyz_y - kzw_w) * (r2m6xx)),
            - (yw * (-kxw_z + kzw_x) + 2 * kxz_y * (yy + ww - 2 * (xx + zz)) + (kyz_x + kxy_z) * (r2m6yy)),
            (xz * (kyz_y - kzw_w) + 2 * kxz_z * (xx + zz - 2 * (yy + ww)) + (-kxy_y - kxw_w) * (r2m6zz)),
            - (yw * (-kxy_z - kyz_x) + 2 * kxz_w * (yy + ww - 2 * (xx + zz)) + (-kzw_x + kxw_z) * (r2m6ww)),

            (xy * (-kxz_z - kxw_w) - 2 * kxy_x * (xx + yy - 2 * (zz + ww)) + (-kyz_z - kyw_w) * (r2m6xx)),
            - (xy * (-kyz_z - kyw_w) + 2 * kxy_y * (xx + yy - 2 * (zz + ww)) + (-kxz_z - kxw_w) * (r2m6yy)),
            (zw * (-kxw_y + kyw_x) + 2 * kxy_z * (zz + ww - 2 * (xx + yy)) + (-kyz_x + kxz_y) * (r2m6zz)),
            (zw * (-kxz_y + kyz_x) + 2 * kxy_w * (zz + ww - 2 * (xx + yy)) + (-kyw_x + kxw_y) * (r2m6ww))
        ));
    }
    private addEOfElectricDipole(vecE: Vec4, dE: Mat4 | undefined, pos: Vec4, s: ElectricDipole) {
        let r = vec4Pool.pop().subset(pos, s.worldPos!);
        let p = s.worldMoment!;
        // u =  r.s / (r.r)^2
        let pxx = p.x * r.x, pyy = p.y * r.y, pzz = p.z * r.z, pww = p.w * r.w;
        let p2 = pxx + pyy + pzz + pww;
        let rxx = r.x * r.x, ryy = r.y * r.y, rzz = r.z * r.z, rww = r.w * r.w;
        let r2 = rxx + ryy + rzz + rww;
        let r2inv = 1 / r2;
        let r4 = r2inv * r2inv;
        let p2_r2_4 = 4 * p2 * r2inv;
        vecE.x += r4 * (p.x - p2_r2_4 * r.x);
        vecE.y += r4 * (p.y - p2_r2_4 * r.y);
        vecE.z += r4 * (p.z - p2_r2_4 * r.z);
        vecE.w += r4 * (p.w - p2_r2_4 * r.w);

        if (!dE) return; // if no need for calc dE
        let r8_neg4 = -4 * r4 * r4;
        let p2_6 = p2 * 6;

        let xy = r8_neg4 * ((p.x * r.y + p.y * r.x) * r2 - p2_6 * r.x * r.y),
            xz = r8_neg4 * ((p.x * r.z + p.z * r.x) * r2 - p2_6 * r.x * r.z),
            xw = r8_neg4 * ((p.x * r.w + p.w * r.x) * r2 - p2_6 * r.x * r.w),
            yz = r8_neg4 * ((p.y * r.z + p.z * r.y) * r2 - p2_6 * r.y * r.z),
            yw = r8_neg4 * ((p.y * r.w + p.w * r.y) * r2 - p2_6 * r.y * r.w),
            zw = r8_neg4 * ((p.z * r.w + p.w * r.z) * r2 - p2_6 * r.z * r.w);
        let mat = mat4Pool.pop();
        dE.adds(mat.set(
            (p2 * (r2 - 6 * rxx) + 2 * pxx * r2) * r8_neg4, xy, xz, xw,
            xy, (p2 * (r2 - 6 * ryy) + 2 * pyy * r2) * r8_neg4, yz, yw,
            xz, yz, (p2 * (r2 - 6 * rzz) + 2 * pzz * r2) * r8_neg4, zw,
            xw, yw, zw, (p2 * (r2 - 6 * rww) + 2 * pww * r2) * r8_neg4
        ).negs());
        mat.pushPool();
        r.pushPool();

    }
}