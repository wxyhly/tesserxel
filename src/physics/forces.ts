import { Bivec, bivecPool } from "../math/algebra/bivec.js";
import { Mat4, mat4Pool } from "../math/algebra/mat4.js";
import { Matrix } from "../math/algebra/matrix.js";
import { Rotor } from "../math/algebra/rotor.js";
import { Vec4, vec4Pool } from "../math/algebra/vec4.js";
import { mulBivec, World } from "./engine.js";
import { Rigid } from "./rigid.js";

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
        if (this.b) this._vec4b.rotates(this.b.rotation).adds(pb);
        let k = this.k;
        this._vec4f.subset(this._vec4b, this._vec4a);
        if (this.length > 0) {
            let len = this._vec4f.norm();
            k *= (len - this.length) / len;
        }

        if (this.damp) {
            const len2 = this._vec4f.normsqr();
            if (len2 > 1e-9) {
                const va = vec4Pool.pop();
                this.a.getlinearVelocity(va, this._vec4a);
                const vb = vec4Pool.pop().set();
                if (this.b) {
                    this.b.getlinearVelocity(vb, this._vec4b);
                }
                k -= va.subs(vb).dot(this._vec4f) / len2 * this.damp;
                let oma = va.subs(vb).dot(this._vec4f);
                if (Math.abs(oma) > 0.4) console.log(oma);
                va.pushPool(); vb.pushPool();
            }
        }
        this._vec4a.subs(pa);
        if (this.b) this._vec4b.subs(pb);
        //_vec4 is force from a to b
        this._vec4f.mulfs(k);
        // add force
        this.a.force.adds(this._vec4f);
        if (this.b) this.b.force.subs(this._vec4f);
        // add torque
        this.a.torque.subs(this._bivec.wedgevvset(this._vec4f, this._vec4a));
        if (this.b) this.b.torque.adds(this._bivec.wedgevvset(this._vec4f, this._vec4b));

    }
}
/** apply a spring torque between object a and b
 *  planeA and planeB are in local coordinates, must be simple and normalised,
 *  b can be null for attaching spring to a fixed plane in the world.
 *  torque = k (planeA x planeB) - damp * dw */
export class TorqueSpring extends Force {

    a: Rigid;
    planeA: Bivec;
    b: Rigid | null;
    planeB: Bivec;
    k: number;
    damp: number;
    length: number;
    private _bivf = new Bivec();
    private _biva = new Bivec();
    private _bivb = new Bivec();
    private _bivec = new Bivec();
    constructor(
        a: Rigid, b: Rigid | null, planeA: Bivec, planeB: Bivec,
        k: number, damp: number = 0) {
        super();
        this.a = a; this.b = b; this.k = k; this.damp = damp;
        this.planeA = planeA;
        this.planeB = planeB;
    }
    apply(time: number): void {
        const srcB = this._biva.copy(this.planeA).rotates(this.a.rotation);
        const dstB = this._bivb.copy(this.planeB);
        if (this.b) dstB.rotates(this.b.rotation);
        let k = this.k;
        this._bivf.crossset(srcB, dstB);
        if (this.damp && this._bivf.norm1() > 1e-3) {
            let dw = (this.b ? this._bivec.subset(this.a.angularVelocity, this.b.angularVelocity) : this.a.angularVelocity).dot(this._bivf);
            // if (Math.abs(dw) > 0.2) console.log(dw);
            // if (dw > 0.3) dw = 0.3;
            // if (dw < - 0.3) dw = - 0.3;
            // if (Math.abs(dw) > 0.2) console.log(dw);
            // if(this._bivf.norm()>10) console.log(this._bivf.norm());
            k -= dw / this._bivf.normsqr() * this.damp;
        }
        this._bivf.mulfs(k);
        this.a.torque.adds(this._bivf);
        if (this.b) this.b.torque.subs(this._bivf);
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
export class Gravity extends Force {
    _vecG = new Vec4;
    rigids: Rigid[] = [];
    lawIndex = -3;
    gravitonMass = 0;
    constructor(lawIndex = -3, gravitonMass = 0) {
        super();
        this.lawIndex = lawIndex;
        this.gravitonMass = gravitonMass;
    }
    gain = 10;
    add(s: Rigid) {
        this.rigids.push(s);
    }
    getGAt(p: Vec4, ignore: Rigid | Vec4 | undefined) {
        this._vecG.set();
        for (let s of this.rigids) {
            if (ignore === s.position || ignore === s) continue;
            this.addGOfMass(this._vecG, p, s);
        }
        return this._vecG;
    }
    apply(time: number): void {

        // outter loop: test point, inner loop: source point

        for (let q of this.rigids) {
            if (!q || !q.mass) continue;
            q.force.addmulfs(this.getGAt(q.position, q), q.mass);
        }
    }
    data = [-247.562, -213.642, -185.622, -162.273, -142.662, -126.071, -111.941, -99.8327, -89.3977, -80.357, -72.4858, -65.6012, -59.5538, -54.2202, -49.4985, -45.3036, -41.5642, -38.2204, -35.2212, -32.5236, -30.0908, -27.891, -25.8973, -24.0861, -22.4371, -20.9326, -19.5572, -18.2974, -17.1415, -16.0788, -15.1004, -14.198, -13.3644, -12.5933, -11.879, -11.2163, -10.6007, -10.0282, -9.495, -8.99788, -8.53384, -8.10021, -7.69457, -7.3147, -6.95861, -6.62449, -6.31069, -6.01571, -5.73816, -5.4768, -5.23047, -4.99813, -4.7788, -4.5716, -4.37572, -4.1904, -4.01494, -3.84872, -3.69114, -3.54165, -3.39975, -3.26497, -3.13688, -3.01508, -2.89918, -2.78885, -2.68376, -2.5836, -2.4881, -2.39699, -2.31003, -2.22699, -2.14766, -2.07183, -1.99932, -1.92995, -1.86357, -1.8, -1.73911, -1.68077, -1.62484, -1.5712, -1.51974, -1.47036, -1.42295, -1.37742, -1.33367, -1.29163, -1.25121, -1.21234, -1.17494, -1.13896, -1.10432, -1.07097, -1.03884, -1.00789, -0.97806, -0.949304, -0.921575, -0.894829, -0.869024, -0.844121, -0.820083, -0.796872, -0.774456, -0.752801, -0.731877, -0.711655, -0.692106, -0.673203, -0.654921, -0.637236, -0.620125, -0.603565, -0.587535, -0.572016, -0.556987, -0.542431, -0.528329, -0.514665, -0.501423, -0.488587, -0.476143, -0.464076, -0.452373, -0.44102, -0.430007, -0.419319, -0.408947, -0.398879, -0.389104, -0.379613, -0.370395, -0.361442, -0.352745, -0.344294, -0.336082, -0.328101, -0.320343, -0.312801, -0.305467, -0.298335, -0.291399, -0.284652, -0.278088, -0.271702, -0.265487, -0.259438, -0.25355, -0.247819, -0.242238, -0.236804, -0.231513, -0.226359, -0.221338, -0.216447, -0.211682, -0.207038, -0.202513, -0.198103, -0.193803, -0.189612, -0.185526, -0.181542, -0.177656, -0.173867, -0.170171, -0.166566, -0.163048, -0.159617, -0.156268, -0.153, -0.149811, -0.146699, -0.14366, -0.140694, -0.137798, -0.134971, -0.13221, -0.129513, -0.12688, -0.124308, -0.121795, -0.119341, -0.116942, -0.114599, -0.11231, -0.110072, -0.107886, -0.105749, -0.10366, -0.101617, -0.0996211, -0.0976693, -0.0957608, -0.0938947, -0.0920698, -0.0902851, -0.0885396, -0.0868323, -0.0851623, -0.0835285, -0.0819302, -0.0803665, -0.0788364, -0.0773392, -0.075874, -0.0744402, -0.0730369, -0.0716633, -0.0703189, -0.0690028, -0.0677143, -0.066453, -0.065218, -0.0640088, -0.0628247, -0.0616652, -0.0605297, -0.0594176, -0.0583284, -0.0572615, -0.0562164, -0.0551927, -0.0541898, -0.0532073, -0.0522447, -0.0513015, -0.0503772, -0.0494716, -0.0485841, -0.0477143, -0.0468619, -0.0460264, -0.0452075, -0.0444047, -0.0436179, -0.0428465, -0.0420902, -0.0413488, -0.0406218, -0.0399091, -0.0392102, -0.0385248, -0.0378527, -0.0371936, -0.0365472, -0.0359132, -0.0352914, -0.0346815, -0.0340832, -0.0334963, -0.0329206, -0.0323557, -0.0318016, -0.0312579, -0.0307245, -0.0302011, -0.0296875, -0.0291835, -0.0286889, -0.0282036, -0.0277273, -0.0272598, -0.026801, -0.0263506, -0.0259086, -0.0254746, -0.0250487, -0.0246306, -0.0242201, -0.0238171, -0.0234214, -0.023033, -0.0226516, -0.0222771, -0.0219094, -0.0215483, -0.0211937, -0.0208455, -0.0205035, -0.0201676, -0.0198378, -0.0195138, -0.0191956, -0.0188831, -0.0185761, -0.0182745, -0.0179783, -0.0176873, -0.0174014, -0.0171206, -0.0168446, -0.0165736, -0.0163072, -0.0160455, -0.0157884, -0.0155357, -0.0152874, -0.0150434, -0.0148037, -0.0145681, -0.0143365, -0.014109, -0.0138853, -0.0136655, -0.0134495, -0.0132371, -0.0130284, -0.0128232, -0.0126216, -0.0124233, -0.0122285, -0.0120369, -0.0118485, -0.0116634, -0.0114814, -0.0113024, -0.0111264, -0.0109534, -0.0107833, -0.0106161, -0.0104516, -0.0102899, -0.0101309, -0.00997447, -0.00982069, -0.00966946, -0.00952073, -0.00937446, -0.00923061, -0.00908912, -0.00894997, -0.00881311, -0.00867849, -0.00854608, -0.00841584, -0.00828773, -0.0081617, -0.00803774, -0.00791579, -0.00779582, -0.00767781, -0.0075617, -0.00744748, -0.0073351, -0.00722454, -0.00711576, -0.00700874, -0.00690343, -0.00679982, -0.00669787, -0.00659755, -0.00649884, -0.0064017, -0.00630612, -0.00621206, -0.0061195, -0.00602841, -0.00593876, -0.00585054, -0.00576372, -0.00567827, -0.00559417, -0.00551139, -0.00542992, -0.00534974, -0.00527081, -0.00519313, -0.00511666, -0.0050414, -0.00496731, -0.00489437, -0.00482258, -0.00475191, -0.00468234, -0.00461385, -0.00454642, -0.00448004, -0.00441469, -0.00435036, -0.00428701, -0.00422465, -0.00416325, -0.0041028, -0.00404328, -0.00398467, -0.00392697, -0.00387015, -0.0038142, -0.00375911, -0.00370486, -0.00365144, -0.00359884, -0.00354704, -0.00349602, -0.00344579, -0.00339632, -0.0033476, -0.00329962, -0.00325236, -0.00320583, -0.00315999, -0.00311485, -0.00307039, -0.0030266, -0.00298347, -0.00294099, -0.00289915, -0.00285794, -0.00281734, -0.00277736, -0.00273797, -0.00269917, -0.00266095, -0.00262331, -0.00258622, -0.00254969, -0.0025137, -0.00247824, -0.00244332, -0.00240891, -0.00237501, -0.00234161, -0.00230871, -0.0022763, -0.00224436, -0.0022129, -0.0021819, -0.00215135, -0.00212126, -0.00209161, -0.0020624, -0.00203361, -0.00200525, -0.0019773, -0.00194976, -0.00192263, -0.00189589, -0.00186954, -0.00184357, -0.00181799, -0.00179278, -0.00176793, -0.00174345, -0.00171932, -0.00169554, -0.00167211, -0.00164902, -0.00162626, -0.00160383, -0.00158172, -0.00155994, -0.00153846, -0.0015173, -0.00149645, -0.00147589, -0.00145563, -0.00143566, -0.00141598, -0.00139658, -0.00137746, -0.00135861, -0.00134003, -0.00132172, -0.00130367, -0.00128587, -0.00126834, -0.00125105, -0.00123401, -0.00121721, -0.00120065, -0.00118432, -0.00116823, -0.00115236, -0.00113672, -0.00112131, -0.00110611, -0.00109112, -0.00107635, -0.00106179];
    private addGOfMass(vecG: Vec4, p: Vec4, s: Rigid) {
        let r = vec4Pool.pop().subset(p, s.position);
        let r2 = 1 / r.normsqr();
        let qr4 = this.lawIndex === -3 || this.lawIndex === -2 ? -s.mass * r2 * r2 : 0;
        if (this.lawIndex === -2) qr4 *= r.norm();
        if (this.lawIndex === -3 && this.gravitonMass !== 0) {
            const scaleFactor = 1.5;
            const x = r.norm() * scaleFactor;
            let res = 0;
            if (x >= 0.2 && x <= 5) {
                const idx = (x - 0.2) * 100;
                const index = Math.floor(idx);
                res = this.data[this.data.length - 1];
                if (index >= 0 && index < this.data.length - 1) {
                    res = this.data[index] * (idx - index) + this.data[index + 1] * (index + 1 - idx);
                }
            } else if (x > 5) {
                const rx = 1 / x;
                res = Math.exp(-x) * Math.sqrt(rx) * rx * (-1.25331 - rx * (2.34996 + rx * 1.02811));
            } else {
                const rx = 1 / x;
                res = rx * (0.5 - 2 * rx * rx) + x * (-0.865932 + Math.log(x)) * 0.125;
            };
            qr4 += res / r.norm() * this.gravitonMass;
        }
        vecG.addmulfs(r, qr4 * this.gain);
        r.pushPool();
        return;
    }
}