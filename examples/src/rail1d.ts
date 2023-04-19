import { math, four, util, mesh, render } from "../../build/tesserxel"
export namespace rail1d {
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
    const wheelfZ = 0.025;
    const wheelfR = 0.5;
    const axleX = 0.02;
    const axleZ = 1.05;
    const axleR = 0.05;
    // train parameters
    const bogieGap = 1.5;
    const bogiesGap = 2.5;
    const trainBogiesLength = 9;
    const trainLength = 10.5 / 2;
    const trainSize = 1.2;
    const trainHeight = 0.1;
    const wheelAxleHeight = 0.41 + wheelR;
    const trainOverHeight = 0.1 + wheelR + wheelAxleHeight;
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
        const scene = new four.Scene();
        const material = {
            steel: new four.PhongMaterial([0.3, 0.22, 0.1, 20.0], 0.9),
            voiture: new four.LambertMaterial(new four.GridTexture([1, 0.4, 0.3, 1.0], [0.8, 0.3, 0.25, 1.0], 0.4, new four.Vec4TransformNode(
                new four.UVWVec4Input,
                new math.Obj4(
                    new math.Vec4(0, 0, 0, 0.5), null, new math.Vec4(1, 1, 1, 1)
                )
            ))),
            ground: new four.LambertMaterial([0.2, 1, 0.1, 0.1])
        };
        const ground = new four.CubeGeometry(100);
        scene.add(new four.Mesh(ground, material.ground));
        scene.skyBox = new four.SimpleSkyBox();

        const camera = new four.Camera();
        scene.add(camera);
        camera.position.y = 0.32;
        camera.position.w = -3;
        camera.rotatesb(new math.Bivec(0, 0, 0, 0, 0, 170 * math._DEG2RAD));

        scene.add(new four.Mesh(await genRail(), material.steel));
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
        const sunLight = new four.DirectionalLight(1.0, new math.Vec4(0.2, 0.9, 0.14, 0.1).norms());
        scene.add(sunLight);
        const canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
        const renderer = await new four.Renderer(canvas).init();
        renderer.core.setOpacity(5);
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
    async function genRail() {
        let railSection = new mesh.ObjFile(await loadFile("resource/rail4dcrosssection.obj") as string).parse();

        let monotrack =
            mesh.face.applyObj4(railSection, new math.Obj4(new math.Vec4(0, 0, 1, 0))) as mesh.FaceIndexMesh;
        return new four.Geometry(mesh.tetra.loft(sp, mesh.face.toNonIndexMesh(
            mesh.face.concat(
                mesh.face.concat(
                    mesh.face.applyObj4(mesh.face.clone(monotrack), new math.Obj4(null, new math.Bivec(0, math._90, 0, 0).exp())),
                    mesh.face.applyObj4(mesh.face.clone(monotrack), new math.Obj4(null, new math.Bivec(0, -math._90, 0, 0).exp())),
                ),
                mesh.face.concat(
                    mesh.face.applyObj4(mesh.face.clone(monotrack), new math.Obj4(null, new math.Bivec(0, math._180, 0, 0).exp())),
                    monotrack,
                )
            ) as mesh.FaceIndexMesh), spSeg
        ));
    }
    function genTrain() {
        const wheelGeom = mesh.tetra.applyObj4(//mesh.tetra.inverseNormal(
            mesh.tetra.directProduct(
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
                // )
            ), new math.Obj4(new math.Vec4(0, 0, 1, 0), math.Bivec.yz.mulf(math._90).exp()));

        const wheelFlangeGeom = mesh.tetra.applyObj4(//mesh.tetra.inverseNormal(
            mesh.tetra.directProduct(
                {
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
            ), new math.Obj4(new math.Vec4(0, 0, 1 - 0.1, 0), math.Bivec.yz.mulf(math._90).exp()));
        let wheel = mesh.tetra.concat(wheelGeom, wheelFlangeGeom);
        const axle = mesh.tetra.applyObj4(//mesh.tetra.inverseNormal(
            mesh.tetra.directProduct(
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
            ), new math.Obj4(new math.Vec4(0, 0, 0, 0), math.Bivec.yz.mulf(math._90).exp()));
        return new four.Geometry(mesh.tetra.concat(
            mesh.tetra.concat(
                mesh.tetra.concat(
                    mesh.tetra.applyObj4(mesh.tetra.clone(wheel), new math.Obj4(null, new math.Bivec(0, math._90, 0, 0).exp())),
                    mesh.tetra.applyObj4(mesh.tetra.clone(wheel), new math.Obj4(null, new math.Bivec(0, -math._90, 0, 0).exp()))
                ),
                mesh.tetra.concat(
                    mesh.tetra.applyObj4(mesh.tetra.clone(wheel), new math.Obj4(null, new math.Bivec(0, math._180, 0, 0).exp())),
                    wheel
                )
            ), mesh.tetra.concat(
                mesh.tetra.applyObj4(mesh.tetra.clone(axle), new math.Obj4(null, new math.Bivec(0, math._90, 0, 0).exp())),
                axle
            ),
        ));
    }
}