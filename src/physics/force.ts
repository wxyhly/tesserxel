namespace tesserxel {
    export namespace physics {

        export interface ForceAccumulator {
            run(engine: Engine, world: World, dt: number): void;
        }
        export namespace force_accumulator {
            export class Euler2 {
                private _bivec = new math.Bivec;
                private _rotor = new math.Rotor;
                run(engine: Engine, world: World, dt: number) {
                    engine.getObjectsAccelerations(world);
                    world.time += dt;
                    let dtsqrhalf = dt * dt / 2;
                    for (let o of world.objects) {
                        if (o.sleep || !o.geometry.position) continue;
                        // x1 = x0 + v0 t + a0 t^2/2
                        // v1 = v0 + a0 t/2
                        o.geometry.position.addmulfs(o.velocity, dt).addmulfs(o.acceleration, dtsqrhalf);
                        o.velocity.addmulfs(o.acceleration, dt);
                        if (!o.geometry.rotation) continue;
                        o.geometry.rotation.mulsl(this._rotor.expset(
                            this._bivec.copy(o.angularVelocity).mulfs(dt).addmulfs(o.angularAcceleration, dtsqrhalf)
                        ));
                        o.angularVelocity.addmulfs(o.angularAcceleration, dt);
                    }
                }
            }
            export class Predict3 {
                private _bivec1 = new math.Bivec;
                private _bivec2 = new math.Bivec;
                private _rotor = new math.Rotor;
                private _vec = new math.Vec4;
                run(engine: Engine, world: World, dt: number) {
                    let prevStates = world.objects.map(obj => ({
                        acceleration: obj.acceleration.clone(),
                        angularAcceleration: obj.angularAcceleration.clone(),
                    }));
                    engine.getObjectsAccelerations(world);
                    world.time += dt;
                    let dthalf = dt * 0.5;
                    let dtsqrdiv6 = dt * dthalf / 3;
                    for (let idx = 0, len = world.objects.length; idx < len; idx++) {
                        let o = world.objects[idx];
                        let prevO = prevStates[idx];
                        if (o.sleep || !o.geometry.position) continue;
                        // if we know a1, then:
                        // x1 = x0 + v0 t + (2/3 a0 + 1/3 a1) t^2/2
                        // v1 = v0 + (a0 + a1) t/2
                        // predict a1 = 2a0 - a{-1}, got:
                        // x1 = x0 + v0 t + (4/3 a0 - 1/3 a{-1}) t^2/2
                        // v1 = v0 + (3/2 a0 - 1/2 a{-1}) t
                        o.geometry.position.addmulfs(o.velocity, dt).addmulfs(
                            this._vec.copy(prevO.acceleration).addmulfs(o.acceleration, -4), -dtsqrdiv6
                        );
                        o.velocity.addmulfs(prevO.acceleration.addmulfs(o.acceleration, -3), -dthalf);
                        if (!o.geometry.rotation) continue;
                        o.geometry.rotation.mulsl(this._rotor.expset(
                            this._bivec1.copy(o.angularVelocity).mulfs(dt).addmulfs(
                                this._bivec2.copy(prevO.angularAcceleration).addmulfs(o.angularAcceleration, -4), -dtsqrdiv6
                            )
                        ));
                        o.angularVelocity.addmulfs(prevO.angularAcceleration.addmulfs(o.angularAcceleration, -3), -dthalf);
                    }
                }
            }
            interface State {
                position: math.Vec4;
                rotation: math.Rotor;
                velocity: math.Vec4;
                angularVelocity: math.Bivec;
                acceleration: math.Vec4;
                angularAcceleration: math.Bivec;
            }
            export class RK4 {
                private _bivec1 = new math.Bivec;
                private _rotor = new math.Rotor;
                run(engine: Engine, world: World, dt: number) {
                    let dthalf = dt * 0.5;
                    let dtdiv6 = dt / 6;
                    function storeState(states: State[][]) {
                        engine.getObjectsAccelerations(world);
                        states.push(world.objects.map(obj => ({
                            position: obj.geometry.position?.clone(),
                            rotation: obj.geometry.rotation?.clone(),
                            velocity: obj.velocity.clone(),
                            angularVelocity: obj.angularVelocity.clone(),
                            acceleration: obj.acceleration.clone(),
                            angularAcceleration: obj.angularAcceleration.clone(),
                        })));
                    }
                    function loadState(states: State[][], index: number) {
                        let state = states[index];
                        for (let idx = 0, len = world.objects.length; idx < len; idx++) {
                            let o = world.objects[idx];
                            let s = state[idx];
                            o.geometry.position?.copy(s?.position);
                            o.geometry.rotation?.copy(s?.rotation);
                            o.velocity.copy(s.velocity);
                            o.angularVelocity.copy(s.angularVelocity);
                            o.acceleration.copy(s.acceleration);
                            o.angularAcceleration.copy(s.angularAcceleration);
                        }
                    }
                    let states: State[][] = [];
                    storeState(states); // 0: k1 = f(yn, tn)
                    for (let o of world.objects) {
                        if (o.sleep || !o.geometry.position) continue;
                        o.geometry.position.addmulfs(o.velocity, dthalf);
                        o.velocity.addmulfs(o.acceleration, dthalf);
                        if (!o.geometry.rotation) continue;
                        o.geometry.rotation.mulsl(
                            this._rotor.expset(this._bivec1.copy(o.angularVelocity).mulfs(dthalf))
                        );
                        o.angularVelocity.addmulfs(o.angularAcceleration, dthalf);
                    }
                    world.time += dthalf;
                    storeState(states); // 1: k2 = f(yn + h/2 k1, tn + h/2)
                    loadState(states, 0);
                    let state = states[1];
                    for (let idx = 0, len = world.objects.length; idx < len; idx++) {
                        let o = world.objects[idx];
                        if (o.sleep || !o.geometry.position) continue;
                        let s = state[idx];
                        o.geometry.position.addmulfs(s.velocity, dthalf);
                        o.velocity.addmulfs(s.acceleration, dthalf);
                        if (!o.geometry.rotation) continue;
                        o.geometry.rotation.mulsl(
                            this._rotor.expset(this._bivec1.copy(s.angularVelocity).mulfs(dthalf))
                        );
                        o.angularVelocity.addmulfs(s.angularAcceleration, dthalf);
                    }
                    storeState(states); // 2: k3 = f(yn + h/2 k2, tn + h/2)
                    loadState(states, 0);
                    state = states[2];
                    for (let idx = 0, len = world.objects.length; idx < len; idx++) {
                        let o = world.objects[idx];
                        if (o.sleep || !o.geometry.position) continue;
                        let s = state[idx];
                        o.geometry.position.addmulfs(s.velocity, dt);
                        o.velocity.addmulfs(s.acceleration, dt);
                        if (!o.geometry.rotation) continue;
                        o.geometry.rotation.mulsl(
                            this._rotor.expset(this._bivec1.copy(s.angularVelocity).mulfs(dt))
                        );
                        o.angularVelocity.addmulfs(s.angularAcceleration, dt);
                    }
                    world.time += dthalf;
                    storeState(states); // 3: k4 = f(yn + h k3, tn + h)
                    loadState(states, 0);
                    for (let idx = 0, len = world.objects.length; idx < len; idx++) {
                        let o = world.objects[idx];
                        if (o.sleep || !o.geometry.position) continue;
                        let k1 = states[0][idx];
                        let k2 = states[1][idx];
                        let k3 = states[2][idx];
                        let k4 = states[3][idx];
                        o.geometry.position.addmulfs(
                            k1.velocity.adds(k4.velocity).addmulfs(
                                k2.velocity.adds(k3.velocity), 2
                            ), dtdiv6
                        );
                        o.velocity.addmulfs(
                            k1.acceleration.adds(k4.acceleration).addmulfs(
                                k2.acceleration.adds(k3.acceleration), 2
                            ), dtdiv6
                        );
                        if (!o.geometry.rotation) continue;
                        o.geometry.rotation.mulsl(this._rotor.expset(
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
        export interface Force {
            apply(time: number): void;
        }
        export namespace force {
            /** apply a spring force between object a and b
             *  pointA and pointB are in local coordinates,
             *  refering connect point of spring's two ends.
             *  b can be null for attaching spring to a fixed point in the world.
             *  f = k dx - damp * dv */
            export class Spring implements Force {
                a: Object;
                pointA: math.Vec4;
                b: Object | null;
                pointB: math.Vec4;
                k: number;
                damp: number;
                length: number;
                private _vec4f = new math.Vec4();
                private _vec4a = new math.Vec4();
                private _vec4b = new math.Vec4();
                private _bivec = new math.Bivec();
                constructor(
                    a: Object, b: Object | null,
                    pointA: math.Vec4, pointB: math.Vec4,
                    k: number, damp: number = 0, length: number = 0) {
                    this.a = a; this.b = b; this.k = k; this.damp = damp;
                    this.pointA = pointA; this.pointB = pointB;
                    this.length = length;
                }
                apply(time: number) {
                    const pa = this.a.geometry.position;
                    const pb = this.b?.geometry?.position;
                    this._vec4a.copy(this.pointA).rotates(this.a.geometry.rotation).adds(pa);
                    this._vec4b.copy(this.pointB);
                    if (this.b) this._vec4b.rotates(this.b.geometry.rotation).adds(pb);
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
                    if (this.b) this.b.torque.subs(this._bivec.wedgevvset(this._vec4f, this._vec4b.subs(pb)));
                }
            }
        }
    }
}