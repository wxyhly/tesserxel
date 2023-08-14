import { math, four, util, mesh } from "../../build/tesserxel.js"
async function loadFile(src: string) {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        console.log("loading: " + src);
        xhr.open("GET", src, true);
        xhr.onload = e => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(xhr.responseText);
                } else {
                    console.error(xhr.statusText);
                    reject();
                }
            }
        };
        xhr.onerror = function (e) {
            console.error(xhr.statusText);
            reject();
        };
        xhr.send();
    });
}
// wheel parameters
const wheelX = 0.1;
const wheelZ = 0.1;
const wheelR = 0.4;
const wheelfX = 0.025;
const wheelfZ = 0.06;
const wheelfR = 0.5;
const axleX = 0.02;
const axleZ = 1.05;
const axleR = 0.05;
const tieLen = 1.5;
const wheelAxleHeight = 0.41 + wheelR;
const trainOverHeight = 0.1 + wheelR + wheelAxleHeight;

const scene = new four.Scene();

const camera = new four.Camera();
scene.add(camera);
const material = {
    rustedSteel: new four.PhongMaterial([0.3, 0.22, 0.1, 20.0]),
    steel: new four.PhongMaterial([1.0, 1.0, 1.0, 20.0]),
    paintedSteel: new four.PhongMaterial(new four.GridTexture(
        [1, 0.9, 0.1, 20.0],
        [0.3, 0.22, 0.1, 5.0],
        0.1, new four.Vec4TransformNode(new four.UVWVec4Input,
            new math.Obj4(
                new math.Vec4(0.5, 0, 0.5, 0.5), math.Bivec.xw.mulf(math._90).exp(), new math.Vec4(1, 5, 1, 0)
            )
        ))),
    ties: new four.LambertMaterial(new four.GridTexture(
        [0.8, 0.8, 0.8, 4],
        [0.2, 1, 0.1, 0.1],
        0.2, new four.Vec4TransformNode(new four.UVWVec4Input,
            new math.Obj4(
                new math.Vec4(0.5, 0.5, 0.5, 0.5), math.Bivec.xw.mulf(math._90).exp(), new math.Vec4(0, 0, 0, 0.6)
            )
        ))),
    voiture: new four.LambertMaterial(new four.GridTexture([1, 0.4, 0.3, 1.0], [0.8, 0.3, 0.25, 1.0], 0.4, new four.Vec4TransformNode(
        new four.UVWVec4Input,
        new math.Obj4(
            new math.Vec4(0, 0, 0, 0.5), null, new math.Vec4(1, 1, 1, 1)
        )
    ))),
    ground: new four.LambertMaterial([0.2, 1, 0.1, 0.1])
};
const ground = new four.Mesh(new four.CubeGeometry(100), material.ground);
const sunLight = new four.DirectionalLight([1.0, 0.99, 0.97], new math.Vec4(0.2, 0.9, 0.14, 0.1).norms());
scene.add(sunLight);

const skyLight = new four.DirectionalLight([0.1, 0.12, 0.13], new math.Vec4(-0.1, 0.5, -0.14, -0.3).norms());
scene.add(skyLight);
scene.add(new four.AmbientLight(0.07));

scene.add(ground);
scene.skyBox = new four.SimpleSkyBox();


camera.rotatesb(new math.Bivec(0, 0, 0, 0, 0, 170 * math._DEG2RAD));

const canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;

export namespace rail2d {
    const trainPos = new math.Obj4();

    const trainLen = 5;
    const trainSize = 1.2;
    const trainHeight = 1.2;

    // spline parameters
    const spSeg = 60;
    const sp = new math.Spline(
        [
            new math.Vec4(0, 0, 0, -100),
            new math.Vec4(0, 0, 0, 0),
            new math.Vec4(-100, 0, 0, 100),
            new math.Vec4(-200, 0, 100, 100),
            new math.Vec4(-200, 0, 200, 100),
        ],
        [
            new math.Vec4(0, 0, 0, 200),
            new math.Vec4(0, 0, 0, 200),
            new math.Vec4(-200, 0, 0, 0),
            new math.Vec4(0, 0, 200, 0),
            new math.Vec4(0, 0, 200, 0),
        ]
    );
    // const sp = new math.Spline(
    //     [
    //         new math.Vec4(0, 0, 0, -100),
    //         new math.Vec4(0, 0, 0, 10),
    //         new math.Vec4(0, 0, 0, 100)
    //     ],
    //     [
    //         new math.Vec4(0, 0, 0, 200),
    //         new math.Vec4(0, 0, 0, 200),
    //         new math.Vec4(100, 0, 0, 200)
    //     ]
    // );
    const splineData = sp.generate(spSeg);
    const projErr = 0.0001;

    const tieZLen = 9;

    export async function load() {
        ground.position.w = 100;
        ground.position.x = -100;
        ground.scale = new math.Vec4(2, 2, 2, 2);
        scene.add(new four.Mesh(await genRail(), material.paintedSteel));
        scene.add(new four.Mesh(genTies(), material.ties));
        let bogies = genBogies();

        //front bogie

        let frontBogieFrame = new four.Mesh(bogies.frontBogieFrame, material.steel);
        frontBogieFrame.position.w = trainLen;

        let wheelsf1 = new four.Mesh(bogies.frontWheelGroup, material.steel);
        wheelsf1.position.z = 1;
        let wheelsf2 = new four.Mesh(bogies.frontWheelGroup, material.steel);
        wheelsf2.position.z = -1;

        // attach front wheels to front bogie frame

        frontBogieFrame.add(wheelsf1, wheelsf2);

        // back bogie

        let wheelsb = new four.Mesh(bogies.back, material.steel);
        const train = new four.Object();

        // train ensemble

        const voiture = new four.Mesh(new four.TesseractGeometry(
            new math.Vec4(trainSize, trainHeight, trainSize, trainLen / 2 + 0.5)
        ), material.voiture);
        const backBogieFrame = new four.Object();
        backBogieFrame.add(wheelsb);
        train.add(frontBogieFrame, backBogieFrame, voiture);
        train.position.y = wheelAxleHeight;
        train.alwaysUpdateCoord = true;
        scene.add(train);
        camera.position.w = -4;
        camera.position.y = wheelAxleHeight;


        const renderer = await new four.Renderer(canvas).init();
        renderer.core.setDisplayConfig({ opacity: 5 });
        const retinaController = new util.ctrl.RetinaController(renderer.core);
        const camController = new util.ctrl.KeepUpController(camera);
        camController.keyMoveSpeed *= 4.0;
        const trainCtrl = new TrainObj4Mgr(backBogieFrame, frontBogieFrame, camController);
        const controllerRegistry = new util.ctrl.ControllerRegistry(canvas, [retinaController, camController, trainCtrl], { preventDefault: true, enablePointerLock: true });
        function setSize() {
            const width = window.innerWidth * window.devicePixelRatio;
            const height = window.innerHeight * window.devicePixelRatio;
            renderer.setSize({ width, height });
        }
        setSize();
        window.addEventListener("resize", setSize);
        function run() {
            voiture.copyObj4(trainPos);
            voiture.position.y = trainOverHeight + trainHeight / 2;
            let R = math.Bivec.yw.mulf(trainCtrl.speed * trainCtrl.dt / wheelR).exp();
            let Rf = math.Rotor.lookAtvb(math.Vec4.w.rotate(math.Bivec.zw.mulf(trainCtrl.steerAngle).exp()), math.Bivec.yw.rotate(wheelsf1.rotation)).conjs();
            wheelsf1.rotates(Rf);
            wheelsf1.rotation.mulsr(R);
            wheelsf2.rotation.copy(wheelsf1.rotation);
            wheelsb.rotation.mulsr(R);
            controllerRegistry.update();
            renderer.render(scene, camera);
            window.requestAnimationFrame(run);
        }
        run();
        async function genRail() {
            let railSection = new mesh.FaceIndexMesh(new mesh.ObjFile(await loadFile("resource/rail2d.obj") as string).parse());
            return new four.Geometry(mesh.tetra.loft(sp, railSection.toNonIndexMesh(), spSeg));
        }
        function genTies() {
            return new four.Geometry(mesh.tetra.loft(sp, new mesh.FaceIndexMesh(
                {
                    position: new Float32Array([
                        tieLen, 0.01, tieZLen, 0,
                        tieLen, 0.01, -tieZLen, 0,
                        -tieLen, 0.01, tieZLen, 0,
                        -tieLen, 0.01, -tieZLen, 0,
                    ]),
                    uvw: new Float32Array([
                        1, 1, 0, 0,
                        1, 0, 0, 0,
                        0, 1, 0, 0,
                        0, 0, 0, 0,
                    ]),
                    normal: new Float32Array([0, 1, 0, 0]),
                    quad: {
                        position: new Uint32Array([
                            0, 1, 3, 2
                        ]),
                        uvw: new Uint32Array([
                            0, 1, 3, 2
                        ]),
                        normal: new Uint32Array([
                            0, 0, 0, 0
                        ]),
                    }
                }).toNonIndexMesh(), spSeg
            ));

        }
        function genBogies() {
            const wheelGeom = mesh.tetra.directProduct(
                {
                    position: new Float32Array([
                        wheelX, wheelZ, 0, 0,
                        wheelX, -wheelZ, 0, 0,
                        -wheelX, wheelZ, 0, 0,
                        -wheelX, -wheelZ, 0, 0,
                    ]),
                    uvw: new Float32Array([
                        0, 0, 0, 0
                    ]),
                    quad: {
                        position: new Uint32Array([
                            0, 1, 3, 2
                        ]),
                        uvw: new Uint32Array([
                            0, 0, 0, 0
                        ]),
                    }
                },
                mesh.face.circle(wheelR, 32)
            ).applyObj4(new math.Obj4(new math.Vec4(1, 0, 0, 0), math.Bivec.yz.mulf(math._90).exp()));

            const wheelFlangeGeom = mesh.tetra.directProduct({
                position: new Float32Array([
                    wheelfX, wheelfZ, 0, 0,
                    wheelfX, -wheelfZ, 0, 0,
                    -wheelfX, wheelfZ, 0, 0,
                    -wheelfX, -wheelfZ, 0, 0,
                ]),
                uvw: new Float32Array([
                    0, 0, 0, 0
                ]),
                quad: {
                    position: new Uint32Array([
                        0, 1, 3, 2
                    ]),
                    uvw: new Uint32Array([
                        0, 0, 0, 0
                    ]),
                }
            },
                mesh.face.circle(wheelfR, 32)
            ).applyObj4(new math.Obj4(new math.Vec4(1 - 0.12, 0, 0, 0), math.Bivec.yz.mulf(math._90).exp()));
            let wheel = wheelGeom.concat(wheelFlangeGeom);
            const axle = mesh.tetra.directProduct({
                position: new Float32Array([
                    axleX, axleZ, 0, 0,
                    axleX, -axleZ, 0, 0,
                    -axleX, axleZ, 0, 0,
                    -axleX, -axleZ, 0, 0,
                ]),
                uvw: new Float32Array([
                    0, 0, 0, 0
                ]),
                quad: {
                    position: new Uint32Array([
                        0, 1, 3, 2
                    ]),
                    uvw: new Uint32Array([
                        0, 0, 0, 0
                    ]),
                }
            },
                mesh.face.circle(axleR, 32)
            ).applyObj4(new math.Obj4(new math.Vec4(0, 0, 0, 0), math.Bivec.yz.mulf(math._90).exp()));
            return {
                back: new four.Geometry(mesh.tetra.concat([
                    wheel.clone().applyObj4(new math.Obj4(new math.Vec4(0, 0, 1), new math.Bivec(0, math._180, 0, 0).exp())),
                    wheel.clone().applyObj4(new math.Obj4(new math.Vec4(0, 0, -1), new math.Bivec(0, math._180, 0, 0).exp())),

                    wheel.clone().applyObj4(new math.Obj4(new math.Vec4(0, 0, 1))),
                    wheel.clone().applyObj4(new math.Obj4(new math.Vec4(0, 0, -1))),

                    axle.clone().applyObj4(new math.Obj4(new math.Vec4(0, 0, 1), new math.Bivec(0, math._90, 0, 0).exp())),
                    axle.clone().applyObj4(new math.Obj4(new math.Vec4(0, 0, -1), new math.Bivec(0, math._90, 0, 0).exp())),
                    axle]
                )),
                frontWheelGroup: new four.Geometry(wheel.clone().applyObj4(
                    new math.Obj4(null, new math.Bivec(0, math._180, 0, 0).exp())
                ).concat(wheel)),
                frontBogieFrame: new four.Geometry(mesh.tetra.concat([
                    axle.clone().applyObj4(new math.Obj4(new math.Vec4(0, 0, 1), new math.Bivec(0, math._90, 0, 0).exp())),
                    axle.clone().applyObj4(new math.Obj4(new math.Vec4(0, 0, -1), new math.Bivec(0, math._90, 0, 0).exp())),
                    axle
                ]))
            };
        }
    }
    class TrainObj4Mgr {
        speed = 0;
        steerAngle = 0;
        ub = 0; vb = 0; localRotorb = new math.Rotor;
        uf = 0; vf = 0; localRotorf = new math.Rotor;
        bogieb: math.Obj4;
        bogief: math.Obj4;
        lockCamera = true;
        camCtrl: util.ctrl.KeepUpController;
        dt = 0.1;
        constructor(bogieb: math.Obj4, bogief: math.Obj4, camCtrl: util.ctrl.KeepUpController) {
            this.bogieb = bogieb;
            this.bogief = bogief;
            this.camCtrl = camCtrl;
        }
        enabled = true;
        update(state: util.ctrl.ControllerState): void {
            if (state.isKeyHold("KeyT")) {
                this.speed += 0.025;
            }
            if (state.isKeyHold("KeyG")) {
                this.speed -= 0.025;
            }
            if (state.isKeyHold("KeyR")) {
                this.steerAngle += 0.04;
            }
            if (state.isKeyHold("KeyY")) {
                this.steerAngle -= 0.04;
            }
            if (state.isKeyHold(".KeyB")) {
                this.lockCamera = !this.lockCamera;
            }
            this.speed *= 0.99;
            this.speed -= Math.sign(this.speed) * 0.003;
            this.steerAngle *= 0.8;
            this.steerAngle -= Math.sign(this.steerAngle) * 0.003;
            // avoid out of track todo


            // solve simulation below:


            let ob = this.bogieb.position;
            let of = this.bogief.position;
            let r = of.sub(ob).divf(trainLen); // divf(trainLen) to normalize it
            let nb = math.Vec4.x.rotate(this.localRotorb);
            let nf = math.Vec4.x.rotate(this.localRotorf);
            let xb = r.clone().addmulfs(nb, -r.dot(nb)).norms();
            let xf0 = r.clone().addmulfs(nf, -r.dot(nf)).norms();

            //euler step

            let s = this.dt * this.speed;
            ob.addmulfs(xb, s);

            //project ob

            let resb = this.posWorld2UV(ob, this.ub, this.vb);
            this.ub = resb.u; this.vb = resb.v; this.localRotorb = resb.localFrame.rotation;
            ob = resb.localFrame.position;

            // find of

            let xf = xf0.rotate(nf.wedge(math.Vec4.y).duals().norms().mulfs(this.steerAngle).exp());
            let delta = s;
            let newOf: math.Vec4 = of;
            while (Math.abs(delta) > projErr) {
                newOf = of.clone().addmulfs(xf, s);
                delta = trainLen - newOf.distanceTo(ob);
                s += delta;
            }
            of.copy(newOf);

            //project of

            let resf = this.posWorld2UV(of, this.uf, this.vf);
            this.uf = resf.u; this.vf = resf.v; this.localRotorf = resf.localFrame.rotation;
            of = resf.localFrame.position;

            // update coords and rotors of four.objects

            this.bogieb.position = ob;
            this.bogieb.rotation.mulsl(math.Rotor.lookAt(math.Vec4.w.rotate(this.bogieb.rotation), xb));
            this.bogieb.rotation.mulsl(math.Rotor.lookAt(math.Vec4.x.rotate(this.bogieb.rotation), nb));

            this.bogief.position = of;
            this.bogief.rotation.mulsl(math.Rotor.lookAt(math.Vec4.w.rotate(this.bogief.rotation), xf));
            this.bogief.rotation.mulsl(math.Rotor.lookAt(math.Vec4.x.rotate(this.bogief.rotation), nf));

            let prevP = trainPos.position.clone();
            trainPos.position.addset(ob, of).mulfs(0.5);
            let prevR = trainPos.rotation.clone();
            trainPos.rotation.mulsl(math.Rotor.lookAt(math.Vec4.x.rotate(trainPos.rotation), nb.add(nf).norms()));
            trainPos.rotation.mulsl(math.Rotor.lookAt(math.Vec4.w.rotate(trainPos.rotation), of.sub(ob).norms()));

            if (this.lockCamera) {
                this.camCtrl.object.rotation.norms();
                this.camCtrl.object.position.adds(trainPos.position).subs(prevP);
                this.camCtrl.object.rotatesAt(prevR.conjs().mulsl(trainPos.rotation), trainPos.position);//.rotatesconj(prevR).rotates(trainPos.rotation);
                // this.camCtrl.object.position.subs(trainPos.position).rotatesconj(prevR).rotates(trainPos.rotation).adds(trainPos.position);
                this.camCtrl.updateObj();
            }


            if (
                Math.abs(this.vb) > 7 || Math.abs(this.vf) > 7 ||
                this.ub < 2 || this.uf < 2 || this.ub > 522 || this.uf > 522
            ) {
                alert("火车出轨啦！请刷新页面重新开始。\n \n The train derailed! Please reload the page to restart.");
                this.enabled = false;
                this.lockCamera = false;
            }

        }
        posWorld2UV(pos: math.Vec4, initU: number, initV: number) {
            let u = initU;
            let v = initV;
            let uvwt: math.Vec4;
            let localFrame: math.Obj4;
            do {
                localFrame = sp.getObj4AtLength(u, splineData);
                localFrame.position.adds(math.Vec4.z.mulf(v).rotates(localFrame.rotation));
                uvwt = localFrame.world2local(pos);
                uvwt.x = 0; // projection is here!  uvwt.y === 0 is trivally identical
                u += uvwt.w;
                v += uvwt.z;
            } while (Math.abs(uvwt.w) + Math.abs(uvwt.z) > projErr);
            return { u, v, localFrame };
        }
        posUv2World(u: number, v: number) {
            const obj = sp.getObj4AtLength(u, splineData);
            return obj.position.adds(math.Vec4.z.mulf(v).rotates(obj.rotation));
        }

    }
}
export namespace rail1d {
    // train parameters
    const bogieGap = 1.5;
    const bogiesGap = 2.5;
    const trainBogiesLength = 9;
    const trainLength = 10.5 / 2;
    const trainSize = 1.2;
    const trainHeight = 0.1;
    // spline parameters
    const spSeg = 60;
    const avaliableRailLength = 180;
    let trainPos = 80;
    const sp = new math.Spline(
        [
            new math.Vec4(10, 0, 20, -100),
            new math.Vec4(0, 0, 0, 0),
            new math.Vec4(10, 0, -20, 100)
        ],
        [
            new math.Vec4(0, 0, 50, 200),
            new math.Vec4(0, 0, 0, 100),
            new math.Vec4(-50, 0, 0, 200)
        ]
    );
    class TrainCtrl {
        trainSpeed = 0;
        enabled = true;
        update(state: util.ctrl.ControllerState): void {
            if (state.isKeyHold("KeyT")) {
                this.trainSpeed += 0.03;
            }
            if (state.isKeyHold("KeyG")) {
                this.trainSpeed -= 0.03;
            }
            this.trainSpeed *= 0.999;
            this.trainSpeed -= Math.sign(this.trainSpeed) * 0.003;
            trainPos += this.trainSpeed * state.mspf / 1000;
            // avoid out of track
            if (trainPos < 1) {
                trainPos = 1;
                if (this.trainSpeed < 0) {
                    this.trainSpeed = -this.trainSpeed;
                }
            } else if (trainPos > avaliableRailLength) {
                trainPos = avaliableRailLength;
                if (this.trainSpeed > 0) {
                    this.trainSpeed = -this.trainSpeed;
                }
            }
        }
    }
    export async function load() {


        camera.position.w = -3;
        camera.position.y = 0.32;
        scene.add(new four.Mesh(await genRail(), material.rustedSteel));
        scene.add(new four.Mesh(genTies(), material.ties));
        let trainWheel = genTrain();
        let wheel1a1 = new four.Mesh(trainWheel, material.steel);
        let wheel1a2 = new four.Mesh(trainWheel, material.steel);
        let wheel1b1 = new four.Mesh(trainWheel, material.steel);
        let wheel1b2 = new four.Mesh(trainWheel, material.steel);
        let wheel2a1 = new four.Mesh(trainWheel, material.steel);
        let wheel2a2 = new four.Mesh(trainWheel, material.steel);
        let wheel2b1 = new four.Mesh(trainWheel, material.steel);
        let wheel2b2 = new four.Mesh(trainWheel, material.steel);
        let wheel3a1 = new four.Mesh(trainWheel, material.steel);
        let wheel3a2 = new four.Mesh(trainWheel, material.steel);
        let wheel3b1 = new four.Mesh(trainWheel, material.steel);
        let wheel3b2 = new four.Mesh(trainWheel, material.steel);
        let train = new four.Object();
        train.add(wheel1a1, wheel1a2, wheel1b1, wheel1b2, wheel2a1, wheel2a2, wheel2b1, wheel2b2, wheel3a1, wheel3a2, wheel3b1, wheel3b2);
        train.alwaysUpdateCoord = true;
        scene.add(train);
        let voiture = new four.TesseractGeometry(new math.Vec4(trainSize, trainHeight, trainSize, trainLength));
        let voiture1 = new four.Mesh(voiture, material.voiture);
        let voiture2 = new four.Mesh(voiture, material.voiture);
        let voiture3 = new four.Mesh(voiture, material.voiture);
        train.add(voiture1, voiture2, voiture3);

        const renderer = await new four.Renderer(canvas).init();
        renderer.core.setDisplayConfig({ opacity: 5 });
        const retinaController = new util.ctrl.RetinaController(renderer.core);
        const camController = new util.ctrl.KeepUpController(camera);
        camController.keyMoveSpeed *= 5.0;
        const trainCtrl = new TrainCtrl;
        const controllerRegistry = new util.ctrl.ControllerRegistry(canvas, [retinaController, camController, trainCtrl], { preventDefault: true, enablePointerLock: true });
        function setSize() {
            const width = window.innerWidth * window.devicePixelRatio;
            const height = window.innerHeight * window.devicePixelRatio;
            renderer.setSize({ width, height });
        }
        setSize();
        window.addEventListener("resize", setSize);
        let splineData = sp.generate(spSeg);
        function run() {
            let nextPos: number;
            let prevPos: number;

            setWheel(wheel1a1, trainPos);
            setWheel(wheel1a2, trainPos + bogieGap);

            nextPos = findCurveLength(trainPos, trainBogiesLength);
            setVoiture(voiture1, trainPos, nextPos);

            setWheel(wheel1b1, nextPos - bogieGap);
            setWheel(wheel1b2, nextPos);

            setWheel(wheel2a1, nextPos + bogiesGap);
            setWheel(wheel2a2, nextPos + bogiesGap + bogieGap);

            prevPos = nextPos;
            nextPos = findCurveLength(prevPos + bogiesGap, trainBogiesLength);
            setVoiture(voiture2, prevPos + bogiesGap, nextPos);

            setWheel(wheel2b1, nextPos - bogieGap);
            setWheel(wheel2b2, nextPos);

            setWheel(wheel3a1, nextPos + bogiesGap);
            setWheel(wheel3a2, nextPos + bogiesGap + bogieGap);

            prevPos = nextPos;
            nextPos = findCurveLength(nextPos + bogiesGap, trainBogiesLength);
            setVoiture(voiture3, prevPos + bogiesGap, nextPos);


            setWheel(wheel3b1, nextPos - bogieGap);
            setWheel(wheel3b2, nextPos);




            controllerRegistry.update();
            renderer.render(scene, camera);
            window.requestAnimationFrame(run);
        }
        function findCurveLength(pos: number, distance: number) {
            let o = sp.getPositionAtLength(pos, splineData);
            let delta = distance;
            while (delta > 0.001) {
                pos += delta;
                let p1 = sp.getPositionAtLength(pos, splineData);
                delta = distance - p1.distanceTo(o);
            }
            return pos;
        }
        function setWheel(wheel: math.Obj4, pos: number) {
            let roll = math.Bivec.yw.mulf(pos / wheelR).exp();
            wheel.copyObj4(sp.getObj4AtLength(pos, splineData));
            wheel.position.y += wheelAxleHeight;
            wheel.rotation.mulsr(roll);
        }
        function setVoiture(voiture: math.Obj4, pos1: number, pos2: number) {
            let o1 = sp.getPositionAtLength(pos1, splineData);
            let o2 = sp.getPositionAtLength(pos2, splineData);
            voiture.position.copy(o1.add(o2).mulfs(0.5));
            voiture.lookAt(math.Vec4.w, o2);
            voiture.position.y += trainOverHeight;
        }
        run();
    }
    function genTies() {
        return new four.Geometry(mesh.tetra.loft(sp, new mesh.FaceIndexMesh({
            position: new Float32Array([
                tieLen, 0.01, 0, 0,
                0, 0.01, -tieLen, 0,
                -tieLen, 0.01, 0, 0,
                0, 0.01, tieLen, 0,
            ]),
            uvw: new Float32Array([
                1, 1, 0, 0,
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 0, 0,
            ]),
            normal: new Float32Array([0, 1, 0, 0]),
            quad: {
                position: new Uint32Array([
                    0, 1, 2, 3
                ]),
                uvw: new Uint32Array([
                    0, 1, 2, 3
                ]),
                normal: new Uint32Array([
                    0, 0, 0, 0
                ]),
            }
        }).toNonIndexMesh(), spSeg
        ));

    }
    async function genRail() {
        let railSection = new mesh.FaceIndexMesh(
            new mesh.ObjFile(await loadFile("resource/rail4dcrosssection.obj") as string).parse()
        );

        let monotrack =
            railSection.applyObj4(new math.Obj4(new math.Vec4(0, 0, 1, 0)));
        return new four.Geometry(mesh.tetra.loft(sp,
            monotrack.clone().applyObj4(new math.Obj4(null, new math.Bivec(0, math._90, 0, 0).exp())).concat(
                monotrack.clone().applyObj4(new math.Obj4(null, new math.Bivec(0, -math._90, 0, 0).exp()))
            ).concat(
                monotrack.clone().applyObj4(new math.Obj4(null, new math.Bivec(0, math._180, 0, 0).exp()))
            ).concat(
                monotrack
            ).toNonIndexMesh(), spSeg
        ));
    }
    function genTrain() {
        const wheelGeom = mesh.tetra.directProduct({
            position: new Float32Array([
                wheelX, wheelZ, 0, 0,
                wheelX, -wheelZ, 0, 0,
                -wheelX, wheelZ, 0, 0,
                -wheelX, -wheelZ, 0, 0,
            ]),
            uvw: new Float32Array([
                0, 0, 0, 0
            ]),
            quad: {
                position: new Uint32Array([
                    0, 1, 3, 2
                ]),
                uvw: new Uint32Array([
                    0, 0, 0, 0
                ]),
            }
        },
            mesh.face.circle(wheelR, 32)
        ).applyObj4(new math.Obj4(new math.Vec4(0, 0, 1, 0), math.Bivec.yz.mulf(math._90).exp()));

        const wheelFlangeGeom = mesh.tetra.directProduct({
            position: new Float32Array([
                wheelfX, wheelfZ, 0, 0,
                wheelfX, -wheelfZ, 0, 0,
                -wheelfX, wheelfZ, 0, 0,
                -wheelfX, -wheelfZ, 0, 0,
            ]),
            uvw: new Float32Array([
                0, 0, 0, 0
            ]),
            quad: {
                position: new Uint32Array([
                    0, 1, 3, 2
                ]),
                uvw: new Uint32Array([
                    0, 0, 0, 0
                ]),
            }
        },
            mesh.face.circle(wheelfR, 32)
            // )
        ).applyObj4(new math.Obj4(new math.Vec4(0, 0, 1 - 0.1, 0), math.Bivec.yz.mulf(math._90).exp()));
        let wheel = wheelGeom.concat(wheelFlangeGeom);
        const axle = mesh.tetra.directProduct(
            {
                position: new Float32Array([
                    axleX, axleZ, 0, 0,
                    axleX, -axleZ, 0, 0,
                    -axleX, axleZ, 0, 0,
                    -axleX, -axleZ, 0, 0,
                ]),
                uvw: new Float32Array([
                    0, 0, 0, 0
                ]),
                quad: {
                    position: new Uint32Array([
                        0, 1, 3, 2
                    ]),
                    uvw: new Uint32Array([
                        0, 0, 0, 0
                    ]),
                }
            },
            mesh.face.circle(axleR, 32)
        ).applyObj4(new math.Obj4(new math.Vec4(0, 0, 0, 0), math.Bivec.yz.mulf(math._90).exp()));
        return new four.Geometry(mesh.tetra.concat([
            wheel.clone().applyObj4(new math.Obj4(null, new math.Bivec(0, math._90, 0, 0).exp())),
            wheel.clone().applyObj4(new math.Obj4(null, new math.Bivec(0, -math._90, 0, 0).exp())),

            wheel.clone().applyObj4(new math.Obj4(null, new math.Bivec(0, math._180, 0, 0).exp())),
            wheel,

            axle.clone().applyObj4(new math.Obj4(null, new math.Bivec(0, math._90, 0, 0).exp())),
            axle
        ]));
    }
}