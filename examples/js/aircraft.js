import * as tesserxel from "../../build/tesserxel.js";
const FOUR = tesserxel.four;
const PHY = tesserxel.physics;
const Vec4 = tesserxel.math.Vec4;
const Obj4 = tesserxel.math.Obj4;
const Bivec = tesserxel.math.Bivec;
const geomTesseract = new FOUR.TesseractGeometry(1);
const lang = new URLSearchParams(window.location.search.slice(1)).get("lang") ?? (navigator.languages.join(",").includes("zh") ? "zh" : "en");
async function loadFile(src) {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        console.log("loading: " + src);
        xhr.open("GET", src, true);
        xhr.onload = e => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(xhr.responseText);
                }
                else {
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
const phyHelper = [];
export var aircraft;
(function (aircraft_1) {
    async function load() {
        const canvas = document.getElementById("gpu-canvas");
        const renderer = await new FOUR.Renderer(canvas).init();
        renderer.core.setDisplayConfig({ opacity: 12 });
        renderer.setBackgroudColor([0, 0, 0, 0.2]);
        const scene = new FOUR.Scene();
        const gnd = new FOUR.CubeGeometry(20000);
        scene.add(new FOUR.Mesh(gnd, new FOUR.LambertMaterial(new FOUR.CheckerTexture(new FOUR.CheckerTexture(new FOUR.CheckerTexture([1, 1, 1, 0.1], [0.9, 0.8, 0.8, 0.1], new FOUR.Vec4TransformNode(new FOUR.UVWVec4Input(), new Obj4(null, null, new Vec4(1000, 1000, 1000, 1000)))), [0.5, 0.3, 0.3, 0.1], new FOUR.Vec4TransformNode(new FOUR.UVWVec4Input(), new Obj4(null, null, new Vec4(100, 100, 100, 100)))), new FOUR.CheckerTexture(new FOUR.CheckerTexture([1, 1, 0.6, 0.1], [0.9, 0.8, 0.4, 0.1], new FOUR.Vec4TransformNode(new FOUR.UVWVec4Input(), new Obj4(null, null, new Vec4(1000, 1000, 1000, 1000)))), [0.3, 0.7, 0.7, 0.1], new FOUR.Vec4TransformNode(new FOUR.UVWVec4Input(), new Obj4(null, null, new Vec4(100, 100, 100, 100)))), new FOUR.Vec4TransformNode(new FOUR.UVWVec4Input(), new Obj4(null, null, new Vec4(10, 10, 10, 10)))))));
        const camera = new FOUR.Camera();
        camera.near = 0.2;
        camera.far = 5000;
        camera.fov = 90;
        scene.add(camera);
        scene.skyBox = new FOUR.SimpleSkyBox();
        scene.skyBox.setOpacity(0.05);
        scene.add(new FOUR.AmbientLight(0.2));
        scene.add(new FOUR.DirectionalLight([1.0, 0.9, 0.8], new Vec4(0.2, 1.0, 0.3, 0.4).norms()));
        scene.add(new FOUR.DirectionalLight([0.1, 0.1, 0.1], new Vec4(-0.219, -1.0, -0.35, -0.3).norms()));
        const aircraftMesh1 = await genAircraftMesh();
        const aircraftMesh2 = await genAircraftMesh();
        const { mesh: aircraftTrack1, wireframe: trackFrame1 } = genAircraftTrack();
        const { mesh: aircraftTrack2, wireframe: trackFrame2 } = genAircraftTrack();
        const { mesh: aircraftTrack3, wireframe: trackFrame3 } = genAircraftTrack();
        const { mesh: aircraftTrack4, wireframe: trackFrame4 } = genAircraftTrack();
        aircraftTrack1.position.w -= 290;
        aircraftTrack2.position.w -= 3000;
        aircraftTrack4.position.w -= 4400;
        aircraftTrack4.position.z -= 300;
        aircraftTrack4.position.x -= 500;
        aircraftTrack4.rotatesb(Bivec.zw.mulf(-Math.PI / 180 * 4).adds(Bivec.xw.mulf(-Math.PI / 180 * 5)));
        aircraftTrack4.position.w -= 4400;
        aircraftTrack3.position.w -= 3700;
        aircraftTrack3.position.x -= 100;
        aircraftTrack3.rotatesb(Bivec.xw.mulf(-Math.PI / 180 * 3));
        scene.wireframe = new FOUR.WireFrameScene();
        scene.wireframe.add(trackFrame1);
        scene.wireframe.add(trackFrame2);
        scene.wireframe.add(trackFrame3);
        scene.wireframe.add(trackFrame4);
        scene.add(aircraftMesh1, aircraftMesh2, aircraftTrack1, aircraftTrack2, aircraftTrack3, aircraftTrack4);
        aircraftMesh1.position.y += 2.2;
        aircraftMesh2.position.z += 200;
        aircraftMesh2.position.y += 2.2;
        const engine = new PHY.Engine({ forceAccumulator: PHY.force_accumulator.RK4 });
        const world = new PHY.World();
        world.add(new PHY.Rigid({
            mass: 0,
            geometry: new PHY.rigid.Plane(Vec4.y, 0.3),
            material: new PHY.Material(1, 0.3)
        }));
        const retinaController = new tesserxel.util.ctrl.RetinaController(renderer.core);
        const aircraftP = new PHY.Rigid({
            mass: 2, geometry: new PHY.rigid.Tesseractoid(new Vec4(2, 1, 2, 5)),
            material: new PHY.Material(1, 0.5)
        });
        // world.gravity.set(0);
        // phyHelper.push([aircraftP, new FOUR.Mesh(new FOUR.TesseractGeometry(new Vec4(2, 1, 2, 5)), new tesserxel.four.LambertMaterial([1, 1, 1, 1]))]);
        const gearwheelTireGeom = new FOUR.SpheritorusGeometry(0.12, 0.3);
        const gearwheelTireMat = new FOUR.PhongMaterial([1.0, 0, 0, 1], 9);
        const initHeight = 1.25;
        const springts = [];
        const damping = new PHY.Damping(0, 0.001);
        function makeGearP(mass, x, z, w) {
            const wheelP1 = new PHY.Rigid({
                mass: mass, geometry: new PHY.rigid.Spheritorus(0.3, 0.12),
                material: new PHY.Material(1, 0.5)
            });
            // phyHelper.push([wheelP1, new FOUR.Mesh(gearwheelTireGeom, gearwheelTireMat)]);
            wheelP1.rotatesb(Bivec.xy.mulf(Math.PI / 2)).translates(new Vec4(x, initHeight - 1.6 + 1, z, w));
            world.add(wheelP1);
            // world.add(new PHY.PointConstrain(wheelP1, aircraftP, new Vec4(), new Vec4(x, -1.6, z, w)));
            const sp = new PHY.Spring(wheelP1, aircraftP, new Vec4(), new Vec4(x, -1.6, z, w), 1000, 0, 10);
            const spt = new PHY.TorqueSpring(wheelP1, aircraftP, Bivec.xw, Bivec.wy, 5, 0.0005);
            world.add(sp);
            damping.add(wheelP1);
            // window["springs"].push(sp);
            springts.push(spt);
            world.add(spt);
        }
        world.add(damping);
        makeGearP(0.1, 0, 0, -6.6);
        makeGearP(0.6, 1.4 * 2, 0, 1.1);
        makeGearP(0.6, -0.7 * 2, 0.7 * 2 * Math.sqrt(3), 1.1);
        makeGearP(0.6, -0.7 * 2, -0.7 * 2 * Math.sqrt(3), 1.1);
        aircraftP.position.y = initHeight + 1;
        camera.position.w = -4.7;
        camera.position.y = aircraftP.position.y;
        camera.position.x = 8;
        camera.lookAt(Vec4.wNeg, aircraftP.position);
        camera.position.w = -6.7;
        camera.position.z = -2;
        const freeCamCtrl = new tesserxel.util.ctrl.KeepUpController(camera);
        freeCamCtrl.keyMoveSpeed *= 5;
        const hud = document.createElement("div");
        document.body.appendChild(hud);
        hud.style.position = "fixed";
        hud.style.top = "80px";
        hud.style.left = "0px";
        hud.style.fontSize = "0.6em";
        hud.style.color = "#FFF";
        const aircraftCtrl = new AircraftCtrl(aircraftP, freeCamCtrl, canvas, hud, camera);
        const aircraftMecanism = new AircraftMecanism(aircraftCtrl);
        world.add(aircraftP, aircraftMecanism);
        const ctrlReg = new tesserxel.util.ctrl.ControllerRegistry(canvas, [
            retinaController, freeCamCtrl, aircraftCtrl
        ]);
        function setSize() {
            let width = window.innerWidth * window.devicePixelRatio;
            let height = window.innerHeight * window.devicePixelRatio;
            renderer.setSize({ width, height });
        }
        setSize();
        window.addEventListener("resize", setSize);
        aircraftMesh1.alwaysUpdateCoord = true;
        for (const [p, o] of phyHelper) {
            scene.add(o);
            o.alwaysUpdateCoord = true;
        }
        retinaController.toggleCrosshair();
        function run() {
            const dt = Math.min(ctrlReg.states.mspf * 0.001 / 3, 1 / 60);
            aircraftCtrl.dt = dt;
            ctrlReg.update();
            engine.update(world, dt);
            for (const [p, o] of phyHelper) {
                o.copyObj4(p);
            }
            renderer.render(scene, camera);
            aircraftMesh1.copyObj4(aircraftP).translates(new Vec4(0, 0, 0, -3).rotates(aircraftP.rotation));
            window.requestAnimationFrame(run);
            if (aircraftCtrl.camLock) {
                if (aircraftCtrl.camPos !== -1)
                    freeCamCtrl.updateObj();
                switch (aircraftCtrl.camPos) {
                    // driver
                    case 0:
                        camera.copyObj4(aircraftP);
                        camera.position.adds(new Vec4(0.01, 1, 0.01, -8).rotates(camera.rotation));
                        break;
                    // behind
                    case 1:
                        camera.copyObj4(aircraftP);
                        camera.position.adds(new Vec4(0.011, 0, 0.01, 11).rotates(camera.rotation));
                        break;
                    // behind + height
                    case 2:
                        camera.copyObj4(aircraftP);
                        camera.position.adds(new Vec4(0.011, 3, 0.01, 9).rotates(camera.rotation));
                        camera.lookAt(Vec4.wNeg, aircraftP.position);
                        break;
                    // front gear
                    case 3:
                        camera.copyObj4(aircraftP);
                        camera.position.adds(new Vec4(0.011, -1.5, 0.01, -4).rotates(camera.rotation));
                        break;
                    // back gears
                    case 4:
                        camera.copyObj4(aircraftP);
                        camera.position.adds(new Vec4(0.011, -1.5, 0.01, 2).rotates(camera.rotation));
                        break;
                    // top
                    case 5:
                        camera.copyObj4(aircraftP);
                        camera.position.y += 10;
                        camera.lookAt(Vec4.wNeg, aircraftP.position);
                        break;
                }
            }
            // increase gear stability
            for (const st of springts) {
                const srcB = st.planeA.rotate(st.a.rotation);
                const dstB = st.planeB.clone();
                if (st.b)
                    dstB.rotates(st.b.rotation);
                const bivf = srcB.cross(dstB);
                let dw = (st.b ? st.a.angularVelocity.sub(st.b.angularVelocity) : st.a.angularVelocity).dot(bivf);
                const ns = bivf.norm();
                if (ns > 1e-1 && dw / ns > 0.1) {
                    dw /= ns * ns;
                    st.a.angularVelocity.addmulfs(bivf, -dw);
                }
                st.a.angularVelocity.copy(st.b.angularVelocity);
                st.a.rotation.copy(st.b.rotation).mulsr(Bivec.xy.mulf(Math.PI / 2).exp());
            }
            freeCamCtrl.enabled = !aircraftCtrl.camLock;
        }
        run();
    }
    aircraft_1.load = load;
    async function genAircraftMesh() {
        const resources = await Promise.all([
            loadFile("resource/aircraft_body.obj"),
            loadFile("resource/aircraft_engine.obj")
        ]);
        const aircraft = new FOUR.Object();
        const aircraftMat = new FOUR.LambertMaterial([1, 1, 1, 1]);
        const aircraftBodyMat = new FOUR.PhongMaterial(new FOUR.WgslTexture(`fn aircraftbody_texture(uvw:vec4<f32>)->vec4<f32>{
                let isWindow = uvw.y<0.45 && uvw.y>0.25 && (
                    (fract(uvw.z*3.0)<0.5 && fract(atan2(uvw.w,uvw.x)*${10 / Math.PI}) < 0.5 && uvw.z > -7.0 && uvw.z < 2.6) ||
                    (uvw.z > 4.0 && uvw.z < 4.5 && fract(atan2(uvw.w,uvw.x)*${5 / Math.PI}) < 0.8125) ||
                    (uvw.z > 4.55 && abs(uvw.w)>0.025 && abs(uvw.x)>0.025)
                );
                if(isWindow){
                    return vec4<f32>(0.2,0.2,0.4,1.0);
                }else{
                    return vec4<f32>(1.0,1.0,1.0,1.0);
                }
            }`, "aircraftbody_texture"));
        let aircraftBodyMesh3d = new tesserxel.mesh.FaceIndexMesh(new tesserxel.mesh.ObjFile(resources[0]).parse()).toNonIndexMesh();
        const aircraftBody = new FOUR.Mesh(new FOUR.Geometry(tesserxel.mesh.tetra.rotatoid(new tesserxel.math.Bivec(0, 0, -1), aircraftBodyMesh3d, 36).inverseNormal().setUVWAsPosition()), aircraftBodyMat);
        aircraft.add(aircraftBody.rotatesAt(Bivec.wz.mulf(Math.PI / 2).exp()));
        /* gear */
        const gearwheelTireGeom = new FOUR.SpheritorusGeometry(0.12, 0.3);
        const gearwheelAxleGeom = new FOUR.DuocylinderGeometry(0.05, 0.3);
        const gearwheelTireMat = new FOUR.PhongMaterial([0.2, 0.2, 0.2, 1], 9);
        const steelMat = new FOUR.PhongMaterial([0.5, 0.5, 0.5, 1], 20);
        function makeGearWheelMesh() {
            const gearWheel = new FOUR.Object();
            gearWheel.add(new FOUR.Mesh(gearwheelTireGeom, gearwheelTireMat).rotatesb(Bivec.xy.add(Bivec.zw).mulfs(Math.PI / 2)), new FOUR.Mesh(gearwheelAxleGeom, steelMat).rotatesb(Bivec.yw.mulf(Math.PI / 2)));
            return gearWheel;
        }
        const dist = 0.3;
        function makeGearTriple() {
            const gearTriple = new FOUR.Object();
            const w1 = makeGearWheelMesh().translates(new Vec4(dist));
            const w2 = makeGearWheelMesh().translates(new Vec4(-dist / 2, 0, 0, dist / 2 * Math.sqrt(3)));
            const w3 = makeGearWheelMesh().translates(new Vec4(-dist / 2, 0, 0, -dist / 2 * Math.sqrt(3)));
            const axle1 = new FOUR.Mesh(geomTesseract, steelMat).translates(new Vec4(dist / 2));
            axle1.scale = new Vec4(dist / 2, 0.05, 0.05, 0.05);
            const axle2 = new FOUR.Mesh(geomTesseract, steelMat).translates(new Vec4(-dist / 4, 0, 0, dist / 4 * Math.sqrt(3))).rotatesb(Bivec.xw.mulf(Math.PI / 3 * 2));
            axle2.scale = axle1.scale;
            const axle3 = new FOUR.Mesh(geomTesseract, steelMat).translates(new Vec4(-dist / 4, 0, 0, -dist / 4 * Math.sqrt(3))).rotatesb(Bivec.wx.mulf(Math.PI / 3 * 2));
            axle3.scale = axle1.scale;
            const axleVertical = new FOUR.Mesh(geomTesseract, steelMat);
            axleVertical.scale = new Vec4(0.05, 0.53, 0.05, 0.05);
            axleVertical.position.y += 0.53;
            gearTriple.add(w1, w2, w3, axle1, axle2, axle3, axleVertical);
            return gearTriple;
        }
        const frontGear = makeGearTriple();
        frontGear.position.y = -1.6;
        frontGear.position.z = 3.6;
        aircraft.add(frontGear.rotatesAt(Bivec.wz.mulf(Math.PI / 2).exp()));
        /* wing */
        // wing body
        const aircraftWingCW = tesserxel.mesh.cw.path(4);
        aircraftWingCW.topologicalExtrude();
        aircraftWingCW.topologicalExtrude();
        aircraftWingCW.topologicalExtrude();
        const wingData = [
            new Vec4(0.0348, -0.6680, 0.6526),
            new Vec4(0.0243, -0.3925, 0.6526),
            new Vec4(0.0348, -0.6680, 4.6567),
            new Vec4(0.0243, -0.3925, 4.6567),
            new Vec4(9.2627, 1.2190, 7.2942),
            new Vec4(9.2397, 1.2284, 7.2942),
            new Vec4(9.2627, 1.2190, 7.5128),
            new Vec4(9.2397, 1.2284, 7.5128),
            new Vec4(2.0479, -0.4589, 4.6502),
            new Vec4(2.0479, -0.3034, 1.8070),
            new Vec4(2.0479, -0.3034, 4.6502),
            new Vec4(2.0479, -0.4589, 1.8070),
            new Vec4(9.0879, 0.2082, 7.1657),
            new Vec4(9.1502, 0.1570, 6.5423),
            new Vec4(9.1502, 0.1570, 7.1657),
            new Vec4(9.0879, 0.2082, 6.5423),
        ];
        const wingWData = [-0.5953, 0.5427, -0.5953, 0.5427, 0.0053, 0.0714, 0.0053, 0.0714, -0.7801, 0.6841, 0.6841, -0.7801, 0.1446, -0.1557, -0.1557, 0.1446];
        const wingDataIdx = [0, 11, 13, 4, 1, 9, 15, 5, 2, 8, 14, 6, 3, 10, 12, 7];
        aircraftWingCW.data[0] = wingDataIdx.map((i, id) => new Vec4(wingData[i].x, wingData[i].y, -wingData[i].z, wingWData[wingDataIdx[id & 11]]));
        aircraftWingCW.data[0].push(...wingDataIdx.map((i, id) => new Vec4(wingData[i].x, wingData[i].y, -wingData[i].z, wingWData[wingDataIdx[id | 4]])));
        const aircraftWingGeom = new FOUR.Geometry(tesserxel.mesh.tetra.cwmesh(aircraftWingCW));
        // engine
        let aircraftEngineMesh3d = new tesserxel.mesh.FaceIndexMesh(new tesserxel.mesh.ObjFile(resources[1]).parse()).toNonIndexMesh();
        const aircraftEngineShellGeom = new FOUR.Geometry(tesserxel.mesh.tetra.rotatoid(Bivec.yw, aircraftEngineMesh3d, 24));
        // tail
        const aircraftHTailCW = tesserxel.mesh.cw.path(2);
        aircraftHTailCW.topologicalExtrude();
        aircraftHTailCW.topologicalExtrude();
        aircraftHTailCW.topologicalExtrude();
        const HTailData = [
            new Vec4(0.2340, 8.9022, 0.0273),
            new Vec4(0.2340, 8.9022, -0.0273),
            new Vec4(0.2300, 10.4590, 0.0273),
            new Vec4(0.2300, 10.4590, -0.0273),
            new Vec4(3.0098, 11.2470, 0.2971),
            new Vec4(3.0098, 11.2470, 0.2772),
            new Vec4(3.0098, 11.6961, 0.2971),
            new Vec4(3.0098, 11.6961, 0.2772),
        ];
        const HTailWData = [-0.4032, -1.0720, -0.5369, -0.9383, -0.5978, -0.8757, -0.6288, -0.8448];
        const HTailDataIdx = [0, 1, 2, 3, 4, 5, 6, 7];
        aircraftHTailCW.data[0] = HTailDataIdx.map((i, id) => new Vec4(HTailData[i].x, 0.735556 + HTailData[i].z, -HTailData[i].y, 0.735556 + HTailWData[HTailDataIdx[id & 14]]));
        aircraftHTailCW.data[0].push(...HTailDataIdx.map((i, id) => new Vec4(HTailData[i].x, 0.735556 + HTailData[i].z, -HTailData[i].y, 0.735556 + HTailWData[HTailDataIdx[id | 1]])));
        const TailGeom = new FOUR.Geometry(tesserxel.mesh.tetra.cwmesh(aircraftHTailCW));
        let position = new Vec4(-0.6, 0.44, 0, -0.73);
        function makeWing() {
            const wing = new FOUR.Object();
            const aircraftEngine1 = new FOUR.Mesh(aircraftEngineShellGeom, aircraftMat);
            aircraftEngine1.position.set(2.3, -0.9, -0.6, -0.4);
            aircraftEngine1.scale = new Vec4(1.3, 1, 1, 1);
            aircraftEngine1.rotatesb(Bivec.xw.mulf(Math.PI / 2));
            const aircraftEngine2 = new FOUR.Mesh(aircraftEngineShellGeom, aircraftMat);
            aircraftEngine2.position.set(4.5, -0.6, -2.1, -0.4);
            aircraftEngine2.scale = new Vec4(1.3, 1, 1, 1).mulfs(0.8);
            aircraftEngine2.rotatesb(Bivec.xw.mulf(Math.PI / 2));
            const aircraftWingBody = new FOUR.Mesh(aircraftWingGeom, aircraftMat);
            const gear = makeGearTriple();
            gear.position.set(1.4, -1.6, -4);
            const HTail = new FOUR.Mesh(TailGeom, aircraftMat).rotatesb(Bivec.xw.mulf(Math.PI / 3));
            const VTail = new FOUR.Mesh(TailGeom, aircraftMat).rotatesb(Bivec.yw.mulf(Math.PI / 2)).rotatesb(Bivec.xy.mulf(Math.PI / 5));
            VTail.position.set(-0.2, 0.44, 0, -0.77);
            wing.add(aircraftEngine1, aircraftEngine2, aircraftWingBody, gear, HTail, VTail);
            return wing;
        }
        aircraft.add(makeWing().rotatesAt(Bivec.wz.mulf(Math.PI / 2).exp()));
        aircraft.add(makeWing().rotatesb(Bivec.xw.mulf(Math.PI / 3 * 2)).rotatesAt(Bivec.wz.mulf(Math.PI / 2).exp()));
        aircraft.add(makeWing().rotatesb(Bivec.wx.mulf(Math.PI / 3 * 2)).rotatesAt(Bivec.wz.mulf(Math.PI / 2).exp()));
        return aircraft;
    }
    function genAircraftTrack() {
        const track = new FOUR.Mesh(new tesserxel.four.CubeGeometry(new tesserxel.math.Vec3(13, 300, 13)), new FOUR.LambertMaterial(new FOUR.WgslTexture(`fn track(uvw:vec4<f32>)->vec4<f32>{
                let auvw = abs(uvw);
                let distance = max(auvw.x,auvw.z);
                let isWhite = (
                    ((auvw.x<0.01 && auvw.z<0.1) || (auvw.x<0.1 && auvw.z<0.01)) && fract(uvw.y*30.0)<0.5 && auvw.y<0.9
                ) || (abs(auvw.x-0.75)<0.01 && auvw.z<0.76) || (abs(auvw.z-0.75)<0.01 && auvw.x<0.76)
                  || (fract(auvw.x*12.0)>0.5 && fract(auvw.z*12.0)>0.5 && abs(auvw.y- 0.935)<0.015 && auvw.z<0.67 && auvw.x<0.67)
                  || (distance < 0.4 && distance > 0.1 && (
                    (fract(distance*10.0)>0.5 && (abs(auvw.y- 0.78)<0.015 || abs(auvw.y- 0.61)<0.015) ) ||
                    (abs(auvw.y- 0.47)<0.015)
                    ))
                  || (distance < 0.3 && distance > 0.1 && (
                    (fract(distance*10.0)>0.5 && abs(auvw.y- 0.35)<0.015)
                    ))
                  || (distance < 0.2 && distance > 0.1 && (
                    (fract(distance*10.0)>0.5 && abs(auvw.y- 0.22)<0.015)
                    ))
                ;
                if(isWhite){
                    return vec4<f32>(1.0,1.0,1.0,5.0);
                }else{
                    return vec4<f32>(0.3,0.3,0.3,0.2);
                }
            }
            `, "track")));
        track.position.y = 0.3;
        track.rotatesAt(Bivec.wz.mulf(Math.PI / 2).exp());
        const wireframe = new FOUR.WireFrameTesseractoid(new tesserxel.math.Vec4(13, 0.2, 400, 13));
        wireframe.rotation = track.rotation;
        wireframe.position = track.position;
        return { mesh: track, wireframe };
    }
})(aircraft || (aircraft = {}));
class AircraftCtrl {
    crashed = false;
    camLock = false;
    camCtrl;
    canvas;
    keyConfig = {
        throttlep: "ArrowUp",
        throttlem: "ArrowDown",
        elevatorp: "KeyW",
        elevatorm: "KeyS",
        aileronXm: "KeyA",
        aileronXp: "KeyD",
        aileronYm: "KeyQ",
        aileronYp: "KeyE",
        spinCW: "KeyZ",
        spinCCW: "KeyX",
        flapp: ".KeyF",
        flapm: "LeftShift+.KeyF",
        toggleCamlock: ".KeyB",
        fovp: "Digit9",
        fovm: "Digit0",
        camSpeedIncrease: ".Equal",
        camSpeedDecrease: ".Minus",
        camPos: [
            ".Digit1", ".Digit2", ".Digit3",
            ".Digit4", ".Digit5", ".Digit6", ".Digit7"
        ],
        hudToggle: ".KeyH",
        automaticCenter: "KeyC",
        brake: ".KeyK",
        brakeXm: "KeyJ",
        brakeXp: "KeyL",
        brakeYm: "KeyU",
        brakeYp: "KeyO",
    };
    camPos = -1;
    camSpeedAdjustFactor = 1.5;
    // x- x+ z- z+ w- w+
    controls = {
        throttle: 0,
        aileron1: 0,
        aileron2: 0,
        aileron3: 0,
        rudderX: 0,
        rudderY: 0,
        flap: 0,
        spinnor: 0,
        brake1: 0,
        brake2: 0,
        brake3: 0,
    };
    rigid;
    hudDom;
    camera;
    rollXPID;
    rollYPID;
    dt = 1 / 60;
    brake = false;
    constructor(rigid, camCtrl, canvas, hudDom, camera) {
        this.rigid = rigid;
        this.camCtrl = camCtrl;
        this.canvas = canvas;
        this.hudDom = hudDom;
        this.camera = camera;
        this.rollXPID = new PIDCtrl(0.5, 0.01, 0.2);
        this.rollYPID = new PIDCtrl(0.5, 0.01, 0.2);
    }
    update(state) {
        this.updateHud();
        if (state.isKeyHold("AltLeft"))
            return;
        if (state.isKeyHold(this.keyConfig.hudToggle)) {
            this.hudDom.style.display = this.hudDom.style.display === "none" ? "" : "none";
        }
        if (state.isKeyHold(this.keyConfig.toggleCamlock)) {
            this.camLock = !this.camLock;
            this.camPos = -1;
        }
        for (let i = 0; i < this.keyConfig.camPos.length; i++) {
            if (state.isKeyHold(this.keyConfig.camPos[i])) {
                this.camPos = i === 7 ? -1 : i;
                if (i !== 7)
                    this.camLock = true;
            }
        }
        if (!this.camLock) {
            if (state.isKeyHold(this.keyConfig.camSpeedDecrease)) {
                this.camCtrl.keyMoveSpeed /= this.camSpeedAdjustFactor;
            }
            if (state.isKeyHold(this.keyConfig.camSpeedIncrease)) {
                this.camCtrl.keyMoveSpeed *= this.camSpeedAdjustFactor;
            }
        }
        const fovDelta = 5;
        if (state.isKeyHold(this.keyConfig.fovm)) {
            this.camera.fov += fovDelta;
            this.camera.needsUpdate = true;
        }
        else if (state.isKeyHold(this.keyConfig.fovp)) {
            this.camera.fov -= fovDelta;
            this.camera.needsUpdate = true;
        }
        if (this.camLock) {
            const throttleDelta = 0.03;
            const elevatorDelta = 0.003;
            const aileronDelta = 0.003;
            const brakeDelta = 0.08;
            const rudderDelta = 0.1;
            const flapDelta = 0.2;
            const spinDelta = 1;
            if (state.isKeyHold(this.keyConfig.throttlep)) {
                this.controls.throttle += throttleDelta;
            }
            else if (state.isKeyHold(this.keyConfig.throttlem)) {
                this.controls.throttle -= throttleDelta;
            }
            const param = {
                vdp: 0.8,
                vda: 0.2,
            };
            // const wrel = this.rigid.angularVelocity.clone().rotatesconj(this.rigid.rotation);
            this.controls.aileron1 = 0;
            this.controls.aileron2 = 0;
            this.controls.aileron3 = 0;
            this.controls.rudderX = 0;
            this.controls.rudderY = 0;
            if (state.currentBtn !== -1) {
                const aileronDeltaMouseX = (state.moveX) * 0.0001;
                const aileronDeltaMouseY = (state.moveY) * 0.0001;
                this.controls.aileron1 -= aileronDeltaMouseX;
                this.controls.aileron2 += aileronDeltaMouseX / 2;
                this.controls.aileron3 += aileronDeltaMouseX / 2;
                this.controls.aileron2 += aileronDeltaMouseY / 2 * Math.sqrt(3);
                this.controls.aileron3 -= aileronDeltaMouseY / 2 * Math.sqrt(3);
                this.controls.rudderX -= aileronDeltaMouseX / aileronDelta * rudderDelta;
                this.controls.rudderY += aileronDeltaMouseX / aileronDelta * rudderDelta;
            }
            let dPitchTarget = 0; // target pitch variation
            if (state.isKeyHold(this.keyConfig.elevatorp)) {
                dPitchTarget = -param.vdp;
            }
            else if (state.isKeyHold(this.keyConfig.elevatorm)) {
                dPitchTarget = param.vdp;
            }
            this.controls.aileron1 += dPitchTarget;
            this.controls.aileron2 += dPitchTarget;
            this.controls.aileron3 += dPitchTarget;
            if (state.isKeyHold(this.keyConfig.aileronXm)) {
                this.controls.rudderX = rudderDelta;
            }
            else if (state.isKeyHold(this.keyConfig.aileronXp)) {
                this.controls.rudderX = -rudderDelta;
            }
            if (state.isKeyHold(this.keyConfig.aileronYm)) {
                this.controls.rudderY = -rudderDelta;
            }
            else if (state.isKeyHold(this.keyConfig.aileronYp)) {
                this.controls.rudderY = rudderDelta;
            }
            if (state.isKeyHold(this.keyConfig.aileronYm)) {
                this.controls.aileron2 -= aileronDelta / 2 * Math.sqrt(3);
                this.controls.aileron3 += aileronDelta / 2 * Math.sqrt(3);
            }
            else if (state.isKeyHold(this.keyConfig.aileronYp)) {
                this.controls.aileron2 += aileronDelta / 2 * Math.sqrt(3);
                this.controls.aileron3 -= aileronDelta / 2 * Math.sqrt(3);
            }
            if (state.isKeyHold(this.keyConfig.aileronXm)) {
                this.controls.aileron1 += aileronDelta;
                this.controls.aileron2 -= aileronDelta / 2;
                this.controls.aileron3 -= aileronDelta / 2;
            }
            else if (state.isKeyHold(this.keyConfig.aileronXp)) {
                this.controls.aileron1 -= aileronDelta;
                this.controls.aileron2 += aileronDelta / 2;
                this.controls.aileron3 += aileronDelta / 2;
            }
            if (state.isKeyHold(this.keyConfig.flapp)) {
                this.controls.flap += flapDelta;
            }
            else if (state.isKeyHold(this.keyConfig.flapm)) {
                this.controls.flap -= flapDelta;
            }
            this.controls.spinnor = 0;
            if (state.isKeyHold(this.keyConfig.spinCCW)) {
                this.controls.spinnor = spinDelta;
            }
            else if (state.isKeyHold(this.keyConfig.spinCW)) {
                this.controls.spinnor = -spinDelta;
            }
            if (state.isKeyHold(this.keyConfig.brake)) {
                this.brake = !this.brake;
            }
            if (this.brake) {
                this.controls.brake1 = 0.7;
                this.controls.brake2 = 0.7;
                this.controls.brake3 = 0.7;
                if (state.isKeyHold(this.keyConfig.brakeXm)) {
                    this.controls.brake1 -= brakeDelta * 6;
                }
                if (state.isKeyHold(this.keyConfig.brakeXp)) {
                    this.controls.brake2 -= brakeDelta * 6;
                    this.controls.brake3 -= brakeDelta * 6;
                }
                if (state.isKeyHold(this.keyConfig.brakeYp)) {
                    this.controls.brake2 -= brakeDelta * 4;
                    this.controls.brake1 -= brakeDelta * 2;
                }
                if (state.isKeyHold(this.keyConfig.brakeYm)) {
                    this.controls.brake3 -= brakeDelta * 4;
                    this.controls.brake1 -= brakeDelta * 2;
                }
            }
            else {
                this.controls.brake1 = 0;
                this.controls.brake2 = 0;
                this.controls.brake3 = 0;
                if (state.isKeyHold(this.keyConfig.brakeXp)) {
                    this.controls.brake1 += brakeDelta * 6;
                }
                if (state.isKeyHold(this.keyConfig.brakeXm)) {
                    this.controls.brake2 += brakeDelta * 6;
                    this.controls.brake3 += brakeDelta * 6;
                }
                if (state.isKeyHold(this.keyConfig.brakeYm)) {
                    this.controls.brake2 += brakeDelta * 4;
                    this.controls.brake1 += brakeDelta * 2;
                }
                if (state.isKeyHold(this.keyConfig.brakeYp)) {
                    this.controls.brake3 += brakeDelta * 4;
                    this.controls.brake1 += brakeDelta * 2;
                }
            }
            if (state.isKeyHold(this.keyConfig.automaticCenter)) {
                let rollX = Math.acos(Vec4.x.rotate(this.rigid.rotation).y) - Math.PI / 2;
                let rollY = Math.acos(Vec4.z.rotate(this.rigid.rotation).y) - Math.PI / 2;
                const aileronX = this.rollXPID.step(0 - rollX, this.dt);
                const aileronY = -this.rollYPID.step(0 - rollY, this.dt);
                this.controls.aileron1 -= aileronX;
                this.controls.aileron2 += aileronX / 2;
                this.controls.aileron3 += aileronX / 2;
                this.controls.aileron2 += aileronY / 2 * Math.sqrt(3);
                this.controls.aileron3 -= aileronY / 2 * Math.sqrt(3);
            }
            // let daXTarget = 0;//(state.mouseX - this.canvas.clientWidth / 2) * 0.0001;
            // let daYTarget = 0;//(state.mouseY - this.canvas.clientHeight / 2) * 0.0001;
            //daXTarget*0.1;//-this.aileronXPID.step(daXTarget - wrel.xy);
            // let daYTarget = 0; // target ax variation
            // if (state.isKeyHold(this.keyConfig.aileronYm)) {
            //     daYTarget = -param.vda;
            // } else if (state.isKeyHold(this.keyConfig.aileronYp)) {
            //     daYTarget = param.vda;
            // }
            // daYTarget += state.moveX * 0.02;
            // this.controls.aileronX = this.aileronXPID.step(daXTarget - rollX);
            // this.controls.aileronY = -this.aileronYPID.step(daYTarget - rollY);
            // this.controls.rudderX = (state.mouseX - this.canvas.clientWidth / 2) * 0.0001;
            // this.controls.rudderY = 0;
        }
        this.controls.throttle = Math.min(Math.max(this.controls.throttle, 0), 1);
        this.controls.aileron1 = Math.min(Math.max(this.controls.aileron1, -1), 1);
        this.controls.aileron2 = Math.min(Math.max(this.controls.aileron2, -1), 1);
        this.controls.aileron3 = Math.min(Math.max(this.controls.aileron3, -1), 1);
        this.controls.rudderX = Math.min(Math.max(this.controls.rudderX, -1), 1);
        this.controls.rudderY = Math.min(Math.max(this.controls.rudderY, -1), 1);
        this.controls.spinnor = Math.min(Math.max(this.controls.spinnor, -1), 1);
        this.controls.flap = Math.min(Math.max(this.controls.flap, 0), 1);
        this.camera.fov = Math.min(Math.max(this.camera.fov, 5), 150);
    }
    updateHud() {
        const _v = Vec4.w.rotate(this.rigid.rotation);
        _v.y = 0;
        _v.norms();
        const vw = (-this.rigid.velocity.dot(_v))?.toFixed(2);
        _v.copy(Vec4.x).rotates(this.rigid.rotation);
        _v.y = 0;
        _v.norms();
        const vx = this.rigid.velocity.dot(_v)?.toFixed(2);
        _v.copy(Vec4.z).rotates(this.rigid.rotation);
        _v.y = 0;
        _v.norms();
        const vz = this.rigid.velocity.dot(_v)?.toFixed(2);
        const translate = {
            "en": {
                "throttle": "Throttle",
                "aileronA": "Aileron A",
                "aileronB": "Aileron B",
                "aileronC": "Aileron C",
                "gearbrakeA": "Gear Brake A",
                "gearbrakeB": "Gear Brake B",
                "gearbrakeC": "Gear Brake C",
                "flaps": "Flaps",
                "height": "Height",
                "pitch": "Pitch",
                "rollL-R": "Roll L-R",
                "rollA-K": "Roll A-K",
                "speedW": "Speed Ahead",
                "speedY": "Speed Vertical",
                "speedX": "Speed L-R",
                "speedZ": "Speed A-K",
                "wPitch": "ω Pitch",
                "wYawL-R": "ω Yaw L-R",
                "wYawA-K": "ω Yaw A-K",
                "wRollL-R": "ω Roll L-R",
                "wRollA-K": "ω Roll A-K",
                "wSpin": "ωSpin",
                "ctrlMode": "Press B to toggle",
                "camMode": "Camera Control",
                "aircraftMode": "Aircraft Control",
                "fov": "Camera FOV",
            },
            "zh": {
                "throttle": "引擎功率",
                "aileronA": "副翼A",
                "aileronB": "副翼B",
                "aileronC": "副翼C",
                "gearbrakeA": "起落架A刹车",
                "gearbrakeB": "起落架B刹车",
                "gearbrakeC": "起落架C刹车",
                "flaps": "襟翼",
                "height": "高度",
                "pitch": "俯仰角",
                "rollL-R": "左右横滚倾角",
                "rollA-K": "侧前后横滚倾角",
                "speedW": "前进速度",
                "speedY": "垂直速度",
                "speedX": "左右速度",
                "speedZ": "侧前后速度",
                "wPitch": "俯仰角速度",
                "wYawL-R": "左右偏航角速度",
                "wYawA-K": "侧前后偏航角速度",
                "wRollL-R": "左右横滚角速度",
                "wRollA-K": "侧前后横滚角速度",
                "wSpin": "自转角速度",
                "ctrlMode": "按B切换模式",
                "camMode": "控制相机",
                "aircraftMode": "控制飞机",
                "fov": "相机视野角"
            }
        }[lang];
        this.hudDom.innerHTML =
            `<table>
<tr><td>${translate["fov"]}</td><td> ${this.camera.fov}</td></tr>
<tr><td>${translate["ctrlMode"]}</td><td> ${this.camLock ? translate["aircraftMode"] : translate["camMode"]}</td></tr>
<tr><td>${translate["throttle"]}</td><td> ${this.controls.throttle.toFixed(3)}</td></tr>
<tr><td>${translate["aileronA"]}</td><td> ${this.controls.aileron1.toFixed(3)}</td></tr>
<tr><td>${translate["aileronB"]}</td><td> ${this.controls.aileron2.toFixed(3)}</td></tr>
<tr><td>${translate["aileronC"]}</td><td> ${this.controls.aileron3.toFixed(3)}</td></tr>
<tr><td>${translate["gearbrakeA"]}</td><td> ${this.controls.brake1.toFixed(3)}</td></tr>
<tr><td>${translate["gearbrakeB"]}</td><td> ${this.controls.brake2.toFixed(3)}</td></tr>
<tr><td>${translate["gearbrakeC"]}</td><td> ${this.controls.brake3.toFixed(3)}</td></tr>
<tr><td>${translate["flaps"]}</td><td> ${this.controls.flap.toFixed(3)}</td></tr>
<tr><td></td><td></td></tr>
<tr><td>${translate["height"]}</td><td> ${this.rigid.position.y.toFixed(2)}</td></tr>
<tr><td>${translate["pitch"]}</td><td> ${(Math.acos(Vec4.w.rotate(this.rigid.rotation).y) * 180 / Math.PI - 90).toFixed(1)}</td></tr>
<tr><td>${translate["rollL-R"]}</td><td> ${(Math.acos(Vec4.x.rotate(this.rigid.rotation).y) * 180 / Math.PI - 90).toFixed(1)}</td></tr>
<tr><td>${translate["rollA-K"]}</td><td> ${(Math.acos(Vec4.z.rotate(this.rigid.rotation).y) * 180 / Math.PI - 90).toFixed(1)}</td></tr>
<tr><td></td><td></td></tr>
<td>${translate["speedW"]}</td><td> ${vw}</td></tr>
<td>${translate["speedY"]}</td><td> ${this.rigid.velocity.y.toFixed(2)}</td></tr>
<td>${translate["speedX"]}</td><td> ${vx}</td></tr>
<td>${translate["speedZ"]}</td><td> ${vz}</td></tr>
<tr><td></td><td></td></tr>
<td>${translate["wPitch"]}</td><td> ${this.rigid.angularVelocity.clone().rotatesconj(this.rigid.rotation).yw.toFixed(3)}</td></tr>
<td>${translate["wYawL-R"]}</td><td> ${this.rigid.angularVelocity.clone().rotatesconj(this.rigid.rotation).xw.toFixed(3)}</td></tr>
<td>${translate["wYawA-K"]}</td><td> ${this.rigid.angularVelocity.clone().rotatesconj(this.rigid.rotation).zw.toFixed(3)}</td></tr>
<td>${translate["wRollL-R"]}</td><td> ${this.rigid.angularVelocity.clone().rotatesconj(this.rigid.rotation).xy.toFixed(3)}</td></tr>
<td>${translate["wRollA-K"]}</td><td> ${this.rigid.angularVelocity.clone().rotatesconj(this.rigid.rotation).yz.toFixed(3)}</td></tr>
<td>${translate["wSpin"]}</td><td> ${this.rigid.angularVelocity.clone().rotatesconj(this.rigid.rotation).yz.toFixed(3)}</td></tr>
</table>
`;
    }
}
class PIDCtrl {
    offset = 0;
    prev = NaN;
    p;
    i;
    d;
    constructor(p, i, d) {
        this.p = p;
        this.i = i;
        this.d = d;
    }
    step(error, dt) {
        const delta = isNaN(this.prev) ? 0 : error - this.prev;
        this.prev = error;
        this.offset += error;
        return this.p * error + this.i * this.offset * dt + this.d * delta / dt;
    }
}
class AircraftMecanism extends tesserxel.physics.Force {
    engine = 0;
    rigid;
    controls;
    constructor(ctrl) {
        super();
        this.controls = ctrl.controls;
        this.rigid = ctrl.rigid;
        // rigid.acceleration
    }
    localForce = new Vec4;
    localTorque = new Bivec;
    airTorque = new Bivec;
    coeffMotor = 1;
    coeffDamp = 0.15;
    constFriction = 0.0001;
    applyForce(force, position) {
        this.localForce.adds(force);
        this.localTorque.adds(position.wedge(force));
    }
    applyWorldForce(force, position) {
        this.rigid.force.adds(force);
        this.rigid.torque.adds(position.sub(this.rigid.position).wedge(force));
    }
    apply(time) {
        this.localForce.set();
        this.localTorque.set();
        const windVelocity = this.rigid.velocity.rotateconj(this.rigid.rotation);
        const ycenter = -0.816;
        this.applyForce(new Vec4(0, 0, 0, -this.controls.throttle * 33), new Vec4(0, ycenter));
        // wind force on wings
        // const wingPosW = 0.324;
        const wingPosW = 0.1;
        const tailHPosW = 2.75;
        this.applyForce(new Vec4(-windVelocity.x * 0.3, -windVelocity.y * 0.5 - windVelocity.w * (0.4 + this.controls.aileron1 * 3) * 0.2, -windVelocity.z * 0.3, -windVelocity.w * (0.05 + Math.abs(this.controls.aileron1) * (Math.sign(this.controls.aileron1) * 0.05 + 0.1))), new Vec4(2, ycenter, 0, wingPosW));
        this.applyForce(new Vec4(-windVelocity.x * 0.3, -windVelocity.y * 0.5 - windVelocity.w * (0.4 + this.controls.aileron2 * 3) * 0.2, -windVelocity.z * 0.3, -windVelocity.w * (0.05 + Math.abs(this.controls.aileron2) * (Math.sign(this.controls.aileron2) * 0.05 + 0.1))), new Vec4(-1, ycenter, Math.sqrt(3), wingPosW));
        this.applyForce(new Vec4(-windVelocity.x * 0.3, -windVelocity.y * 0.5 - windVelocity.w * (0.4 + this.controls.aileron3 * 3) * 0.2, -windVelocity.z * 0.3, -windVelocity.w * (0.05 + Math.abs(this.controls.aileron3) * (Math.sign(this.controls.aileron3) * 0.05 + 0.1))), new Vec4(-1, ycenter, -Math.sqrt(3), wingPosW));
        this.applyForce(new Vec4(-windVelocity.x * 0.3 - windVelocity.w * 0.2 * this.controls.rudderX, -windVelocity.y * 0.5 - windVelocity.w * 0.09, -windVelocity.z * 0.3 - windVelocity.w * 0.2 * this.controls.rudderY, -windVelocity.w * 0.05).mulfs(0.4), new Vec4(0, ycenter, 0, tailHPosW));
        //flap
        this.applyForce(new Vec4(0, 0 - windVelocity.w * (0.2 + 0.2 * this.controls.flap), 0, -windVelocity.w * 0.5 * this.controls.flap).mulfs(0.4), new Vec4(0, ycenter, 0, wingPosW));
        // air friction torque
        this.localTorque.addmulfs(this.rigid.angularVelocity.clone().rotatesconj(this.rigid.rotation), -windVelocity.normsqr() * 0.001);
        // spin
        this.localTorque.addmulfs(Bivec.xz, -windVelocity.norm() * 0.1 * this.controls.spinnor);
        // brake on gear
        const wv = windVelocity.xzw().norm();
        if (wv > 0.05) {
            const gear0 = this.rigid.local2world(new Vec4(0, -1.6, 0, -0.6));
            const gear1 = this.rigid.local2world(new Vec4(1.4 * 2, -1.6, 0, 1));
            const gear2 = this.rigid.local2world(new Vec4(-0.7 * 2, -1.6, 0.7 * 2 * Math.sqrt(3), 1));
            const gear3 = this.rigid.local2world(new Vec4(-0.7 * 2, -1.6, -0.7 * 2 * Math.sqrt(3), 1));
            const lv0 = new Vec4();
            this.rigid.getlinearVelocity(lv0, gear0);
            lv0.y = 0;
            const lv1 = new Vec4();
            this.rigid.getlinearVelocity(lv1, gear1);
            lv1.y = 0;
            const lv2 = new Vec4();
            this.rigid.getlinearVelocity(lv2, gear2);
            lv2.y = 0;
            const lv3 = new Vec4();
            this.rigid.getlinearVelocity(lv3, gear3);
            lv3.y = 0;
            const rx = Vec4.x.rotate(this.rigid.rotation);
            rx.y = 0;
            rx.norms();
            const rz = Vec4.z.rotate(this.rigid.rotation);
            rz.y = 0;
            rz.norms();
            const rw = Vec4.w.rotate(this.rigid.rotation);
            rw.y = 0;
            rw.norms();
            const lv0mag = lv0.norm();
            const lv1mag = lv1.norm();
            const lv2mag = lv2.norm();
            const lv3mag = lv3.norm();
            if (gear0.y < 0.8) {
                const f = new Vec4(12 * lv0.dot(rx) / lv0mag, 0, 12 * lv0.dot(rz) / lv0mag, 0).negs().rotates(this.rigid.rotation);
                f.y = 0;
                this.applyWorldForce(f, gear0);
            }
            if (gear1.y < 0.8) {
                const f = new Vec4(12 * lv1.dot(rx) / lv1mag, 0, 12 * lv1.dot(rz) / lv1mag, this.controls.brake1 * 12 * lv1.dot(rw) / lv1mag).negs().rotates(this.rigid.rotation);
                f.y = 0;
                this.applyWorldForce(f, gear1);
            }
            if (gear2.y < 0.8) {
                const f = new Vec4(12 * lv2.dot(rx) / lv2mag, 0, 12 * lv2.dot(rz) / lv2mag, this.controls.brake2 * 12 * lv2.dot(rw) / lv2mag).negs().rotates(this.rigid.rotation);
                f.y = 0;
                this.applyWorldForce(f, gear2);
            }
            if (gear3.y < 0.8) {
                const f = new Vec4(12 * lv3.dot(rx) / lv3mag, 0, 12 * lv3.dot(rz) / lv3mag, this.controls.brake3 * 12 * lv3.dot(rw) / lv3mag).negs().rotates(this.rigid.rotation);
                f.y = 0;
                this.applyWorldForce(f, gear3);
            }
        }
        // total apply
        this.rigid.force.adds(this.localForce.rotates(this.rigid.rotation));
        this.rigid.torque.adds(this.localTorque.rotates(this.rigid.rotation));
    }
}
//# sourceMappingURL=aircraft.js.map