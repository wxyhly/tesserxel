import { math, four, util, physics, render } from "../../build/tesserxel.js"
export namespace navigation {
    class GlomeSurfaceScatter {
        glomeRadius: number;
        scatterNumber: number = 90;
        scatterObject: four.Mesh[];
        constructor(glomeRadius: number, scatterObject: four.Mesh[], scatterNumber?: number) {
            this.glomeRadius = glomeRadius;
            this.scatterObject = scatterObject;
            if (scatterNumber) this.scatterNumber = scatterNumber;
        }
        scatter(group: four.Object[]) {
            for (let i = 0; i < this.scatterNumber; i++) {
                let obj = new four.Object();
                for (const m of this.scatterObject) {
                    obj.add(new four.Mesh(m.geometry, m.material).copyObj4(m));
                }
                // let mesh = new four.Mesh(this.scatterObject.geometry, this.scatterObject.material);
                group.push(obj);
                obj.position.randset();
                obj.rotation.setFromLookAt(math.Vec4.w, obj.position);
                obj.position.mulfs(this.glomeRadius);

            }
        }
    }
    const planetRadius = 10;
    function terrainGen(group: four.Object[]) {
        const treeLeavesMaterial = new four.LambertMaterial([0.05, 0.4, 0.0, 2.0]);
        const treeLogMaterial = new four.LambertMaterial([0.8, 0.4, 0.1, 2.0]);
        treeLeavesMaterial.cullMode = 'none';
        const treeLeavesGeometry = new four.SpherinderSideGeometry(1, 0, 1);
        const treeLogGeometry = new four.SpherinderSideGeometry(0.2, 0.18, 3);

        const treeLeavesGroup = [
            new four.Mesh(treeLeavesGeometry, treeLeavesMaterial),
            new four.Mesh(treeLeavesGeometry, treeLeavesMaterial),
            new four.Mesh(treeLeavesGeometry, treeLeavesMaterial),
            new four.Mesh(treeLogGeometry, treeLogMaterial),
        ];
        treeLeavesGroup[0].scale = new math.Vec4(0.4, 0.4, 0.4, 0.4);
        treeLeavesGroup[1].scale = new math.Vec4(0.6, 0.6, 0.6, 0.6);
        treeLeavesGroup[2].scale = new math.Vec4(0.9, 0.9, 0.9, 0.9);
        treeLeavesGroup[0].position.set(0, 0, 0, 3);
        treeLeavesGroup[1].position.set(0, 0, 0, 2.6);
        treeLeavesGroup[2].position.set(0, 0, 0, 2);
        treeLeavesGroup[3].position.set(0, 0, 0, 1.5);



        // const treeOdoMesh = new four.Mesh(new four.SpherinderSideGeometry(0.3,1), new four.LambertMaterial([0.8, 0.4, 0.1]));
        const stoneScatter = new GlomeSurfaceScatter(planetRadius, treeLeavesGroup);
        stoneScatter.scatter(group);
    }

    export async function load() {
        const scene = new four.Scene();
        const planetGeometry = new four.GlomeGeometry(planetRadius, 4);
        const planet = new four.Mesh(planetGeometry, new four.LambertMaterial([0, 1, 0, 0.05]));
        terrainGen(planet.child);
        const compassLongueur = 0.09;
        const compassThickness = 0.01;
        const compassMeshMG = new four.Mesh(new four.TesseractGeometry(new math.Vec4(compassLongueur, compassThickness, compassThickness, compassThickness)), new four.LambertMaterial([1, 1, 0, 1]));
        const compassMeshWE = new four.Mesh(new four.TesseractGeometry(new math.Vec4(compassThickness, compassThickness, compassLongueur, compassThickness)), new four.LambertMaterial([0, 1, 1, 1]));
        const compassMeshN = new four.Mesh(new four.TesseractGeometry(new math.Vec4(compassThickness, compassThickness, compassThickness, compassLongueur / 2)), new four.LambertMaterial([1, 0, 0, 1]));
        compassMeshN.position.w += compassLongueur / 2;
        const compassMeshS = new four.Mesh(new four.TesseractGeometry(new math.Vec4(compassThickness, compassThickness, compassThickness, compassLongueur / 2)), new four.LambertMaterial([0, 0, 1, 1]));
        compassMeshS.position.w -= compassLongueur / 2;
        const compassMeshCenter = new four.Mesh(new four.TesseractGeometry(compassThickness * 1.3), new four.LambertMaterial([1, 1, 1, 1]));
        const compassMesh = new four.Object();
        compassMesh.add(compassMeshN, compassMeshS, compassMeshWE, compassMeshMG, compassMeshCenter);
        const camera = new four.Camera();
        scene.add(camera);
        scene.add(compassMesh);
        scene.add(planet);
        const sunLight = new four.DirectionalLight(1.0, new math.Vec4(1));

        sunLight.alwaysUpdateCoord = true;
        compassMesh.alwaysUpdateCoord = true;
        scene.add(sunLight);
        scene.add(new four.AmbientLight([0.2, 0.2, 0.24]));
        camera.position.y = planetRadius + 0.3;

        const canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
        const renderer = await new four.Renderer(canvas).init();
        renderer.core.setOpacity(20);
        const skyBox = new NishitaPlanetSkyBox();
        scene.skyBox = skyBox;
        renderer.setBackgroudColor([1, 1, 1, 1]);
        const retinaController = new util.ctrl.RetinaController(renderer.core);
        const camController = new util.ctrl.FreeFlyController(camera);
        const timeCtrl = new TimeCtrl();
        const controllerRegistry = new util.ctrl.ControllerRegistry(canvas, [retinaController, camController, timeCtrl], { preventDefault: true, enablePointerLock: true });

        const gui = new GUI();
        function setSize() {
            const width = window.innerWidth * window.devicePixelRatio;
            const height = window.innerHeight * window.devicePixelRatio;
            renderer.setSize({ width, height });
            gui.setSize();
        }
        setSize();
        window.addEventListener("resize", setSize);
        const solar_sys = new SolarSystem();
        const compass_sys = new CompassSystem(0);
        let time = 0;
        function run() {
            controllerRegistry.update();
            if (!timeCtrl.timePaused) time += controllerRegistry.states.mspf / 60_00;
            sunLight.direction = solar_sys.getRelSunPos(time);
            skyBox.setSunPosition(sunLight.direction);
            // calculate camera's and world's y-w planes, whether they are aligned
            const cw = math.Vec4.w.clone().rotates(camera.rotation);
            const cy = math.Vec4.y.clone().rotates(camera.rotation);
            const A = cw.wedge(cy);
            const B = cw.wedge(camera.position).norms();
            // use AxB to align it
            camera.rotation.mulsl(A.cross(B).mulfs(-0.5).exp());
            // if camera try to enter the earth, push it out
            let height = camera.position.norm();

            if (height < planetRadius * 1.025) {
                camera.position.mulfs(1 + (planetRadius * 1.025 - height) * 0.05);
            }

            gui.update(time, camera, solar_sys);
            compass_sys.tick(camera, compassMesh);

            renderer.render(scene, camera);
            window.requestAnimationFrame(run);
        }
        run();
    }
    class GroundRestrictForce extends physics.Force {
        object: physics.Rigid;
        objectAxis: math.Vec4;
        alignAxis: math.Vec4;
        stiffness: number = 5000;
        apply(time: number): void {
            const biv = this.objectAxis.rotate(this.object.rotation).wedge(this.alignAxis);
            this.object.torque.addmulfs(biv, this.stiffness);
        }
    }
    class TimeCtrl {
        update(state: util.ctrl.ControllerState): void {
            if (state.isKeyHold(".KeyP")) {
                this.timePaused = !this.timePaused;
            }
        }
        timePaused = false;
        enabled = true;
    }
    class CompassSystem {
        private world: physics.World;
        private engine: physics.Engine;
        private compassConstrain: physics.PointConstrain;
        private compass: physics.Rigid;
        private groundRestrictForce: GroundRestrictForce;

        /// dipole_ratio for current of magnetic dipole on MG / WE
        constructor(dipole_ratio: number) {
            const world = new physics.World();
            world.gravity.set();
            const maxwell = new physics.MaxWell();
            const planet = new physics.Rigid({ geometry: new physics.rigid.Glome(1), mass: 0, material: new physics.Material(0, 0) });
            let dipole = { rigid: planet, position: new math.Vec4, moment: new math.Bivec(1 - dipole_ratio, 0, 0, 0, 0, dipole_ratio) };
            maxwell.addMagneticDipole(dipole);
            const compass = new physics.Rigid({ geometry: new physics.rigid.Glome(1), mass: 1, material: new physics.Material(0, 0) });
            compass.position.y = 10.05;
            maxwell.addMagneticDipole({ rigid: compass, position: new math.Vec4, moment: new math.Bivec(1000000, 0, 1000000, 0, 0, 0) });
            let compassConstrain = new physics.PointConstrain(compass, null, math.Vec4.origin, math.Vec4.y.mulf(10));
            // rotational damping
            const damp = new physics.Damping(0, 5);
            damp.add(compass);
            world.add(damp);
            // 3d ground force constrain
            const groundRestrictForce = new GroundRestrictForce();
            groundRestrictForce.object = compass;
            groundRestrictForce.objectAxis = math.Vec4.y;
            groundRestrictForce.alignAxis = math.Vec4.y.clone();
            world.add(groundRestrictForce);
            //point constrain
            world.add(compassConstrain);

            world.add(compass);
            world.add(planet);
            world.add(maxwell);
            this.world = world;
            this.compassConstrain = compassConstrain;
            this.compass = compass;
            this.engine = new physics.Engine({ broadPhase: physics.IgnoreAllBroadPhase, substep: 1000 });
            this.groundRestrictForce = groundRestrictForce;
        }
        tick(camera: four.Camera, compassMesh: four.Object) {
            // calc compass's position (follow camera)
            let delta = new math.Vec4(0, -0.1, 0, -0.2).rotate(camera.rotation);
            this.compassConstrain.pointB.copy(camera.position).addmulfs(delta, 1);
            // calc 3dground align axis
            this.groundRestrictForce.alignAxis.copy(this.compassConstrain.pointB).norms();
            //update mesh obj4
            this.engine.update(this.world, 0.05);
            compassMesh.copyObj4(this.compass);
        }
    }
    // function calculate(dipole_ratio: number,) {

    //     // const a: number[] = [], x: number[] = [], b: number[] = [], c: number[] = [];
    //     // for (let ns = 0; ns <= 90; ns += 1) {
    //     //     dipole.moment.copy(new math.Bivec(1 - dipole_ratio, 0, 0, 0, 0, dipole_ratio).rotates(math.Bivec.yz.mulf(ns * math._DEG2RAD).exp()));
    //     //     maxwell.apply(0);
    //     //     let biv = maxwell.getBAt(math.Vec4.y.mulf(1), false, compass).clone();
    //     //     let WE = new math.Vec3(-biv.zw, -biv.xz, biv.xw);
    //     //     let MG = new math.Vec3(biv.xy, -biv.yw, -biv.yz);
    //     //     let coeff = biv.xz / biv.xy;
    //     //     a.push(Math.atan2(WE.y, WE.x) * math._RAD2DEG);
    //     //     x.push(ns);
    //     //     b.push(Math.atan2(MG.y, MG.x) * math._RAD2DEG);
    //     //     c.push(Math.atan2(WE.wedge(MG).norm(), WE.dot(MG)) * math._RAD2DEG);
    //     // }
    //     // console.log(`a={${a.join(",")}};b={${b.join(",")}};c={${c.join(",")}};`);
    // }
    class GUI {
        canvasHeight: number = 100;
        /// horizontal factor for sun angle curve
        timePerPixel: number = 0.05;
        private canvas: HTMLCanvasElement;
        private context: CanvasRenderingContext2D;
        constructor() {
            this.canvas = document.createElement("canvas");
            this.canvas.style.width = "100%";
            this.canvas.style.height = this.canvasHeight + "px";
            this.canvas.style.position = "absolute";
            this.canvas.style.bottom = "0px";
            this.canvas.style.left = "0px";

            this.context = this.canvas.getContext("2d");
            document.body.appendChild(this.canvas);
        }
        setSize() {
            this.canvas.width = window.innerWidth * window.devicePixelRatio;
            this.canvas.height = this.canvasHeight * window.devicePixelRatio;
        }
        update(time: number, camera: four.Camera, solar_sys: SolarSystem) {
            const c = this.context;
            const width = this.canvas.width;
            const hdiv2 = this.canvas.height / 2;
            c.clearRect(0, 0, width, this.canvas.height);
            c.strokeStyle = "rgb(0,0,0)";
            c.beginPath();
            c.moveTo(0, hdiv2);
            c.lineTo(width, hdiv2);
            c.stroke();
            c.strokeStyle = "rgb(255,0,0)";
            c.beginPath();
            c.moveTo(0, hdiv2);
            for (let x = 0; x < width; x += 2) {
                let t = (x - width * 0.5) * this.timePerPixel + time;
                let cos = solar_sys.getRelSunPos(t).dot(camera.position) / camera.position.norm();
                c.lineTo(x, hdiv2 * (-cos * 0.5 + 1));
            }
            c.stroke();
            c.fillStyle = "rgb(255,100,0)";
            c.beginPath();
            let cos = solar_sys.getRelSunPos(time).dot(camera.position) / camera.position.norm();
            c.arc(width * 0.5, hdiv2 * (-cos * 0.5 + 1), 5, 0, Math.PI * 2);
            c.fill();
        }
    }
    class NishitaPlanetSkyBox extends four.SkyBox {
        readonly bufferSize = 4;
        constructor() {
            super();
            this.jsBuffer = new Float32Array(this.bufferSize);
            this.setSunPosition(new math.Vec4(0.2, 0.9, 0.1, 0.3).norms());
        }
        setSunPosition(pos: math.Vec4) {
            this.needsUpdate = true;
            pos.writeBuffer(this.jsBuffer);
        }
        getSunPosition() {
            return new math.Vec4(this.jsBuffer[0], this.jsBuffer[1], this.jsBuffer[2], this.jsBuffer[3]);
        }
        getShaderCode(): render.RaytracingPipelineDescriptor {
            const SAMPLES = 8;
            const SAMPLES_LIGHT = 4;
            const SUN_INTENSITY = 20.0;
            const MIE_EXTINCTION_MUL = 1.1;
            return {
                code: `
        @group(1) @binding(0) var<uniform> camMat: AffineMat;
        @group(1) @binding(1) var<uniform> sunDir: vec4<f32>;
        ${four.SkyBox.commonCode}

        // Based on:
        // https://www.scratchapixel.com/lessons/procedural-generation-virtual-worlds/simulating-sky/simulating-colors-of-the-sky
        const Re = 6360e3;
        const Ra = 18420e3;
        const Hr = 199940.0;
        const Hm = 64000.0;
        const betaR = vec3<f32>(3.8e-6, 13.5e-6, 33.1e-6);
        const betaM = vec3<f32>(21e-6);
        const g = 0.76;
        
        const PI = 3.14159265359;
        
        // Dir must be normalized
        // Orig must be centered on sphere
        fn raySphereIntersect(orig: vec4<f32>, dir: vec4<f32>, radius:f32)->vec2<f32> {
            let b = dot(dir, orig);
            let c = dot(orig, orig) - (radius * radius);
            var test = b*b - c;
            // Intersection should have two points
            if (test <= 0.0) {return vec2<f32>(-1.0,-1.0);}
            test = sqrt(test);
            return vec2<f32>(-b - test,-b + test);
        }
        
        fn computeIncidentLight(orig: vec4<f32>, dir: vec4<f32>,  tmin:f32, tmax:f32, sunDirection:vec4<f32>) ->vec4<f32>{
            var vtmin = tmin;
            var vtmax = tmax;
            let intres = raySphereIntersect(orig, dir, Ra);
            if (intres.y < 0.0) {return vec4<f32>(0.0);}
            if (intres.x > vtmin && intres.x > 0.0){ vtmin = intres.x;}
            if (intres.y < vtmax) {vtmax = intres.y;}
            let segmentLength = (vtmax - vtmin) / ${SAMPLES}.0;
            var tCurrent = vtmin;
            var sumR = vec3<f32>(0.0); // rayleigh contribution
            var opticalDepthR:f32 = 0.0;
            let mu = dot(dir, sunDirection); // mu in the paper which is the cosine of the angle between the sun direction and the ray direction
            let phaseR = 3.0 / (16.0 * PI) * (1.0 + mu * mu);
            let phaseSun = clamp(mu - 0.993,0.0,0.01)*100.0;
            var sumM = vec3<f32>(0.0); // mie contribution
            var opticalDepthM:f32 = 0.0;
            let phaseM = 3.0 / (8.0 * PI) * ((1.0 - g * g) * (1.0 + mu * mu)) / ((2.0 + g * g) * pow(1.0 + g * g - 2.0 * g * mu, 1.5));
            for (var i = 0; i < ${SAMPLES}; i++) {
                let samplePosition = orig + (tCurrent + segmentLength * 0.5) * dir;
                let height = length(samplePosition) - Re;
                // compute optical depth for light
                let hr = exp(-height / Hr) * segmentLength;
                opticalDepthR += hr;
                let hm = exp(-height / Hm) * segmentLength;
                opticalDepthM += hm;
                // light optical depth
                let lightInt = raySphereIntersect(samplePosition, sunDirection, Ra);
                let segmentLengthLight = lightInt.y / ${SAMPLES_LIGHT}.0;
                var tCurrentLight:f32 = 0.0;
                var opticalDepthLightR:f32 = 0.0;
                var opticalDepthLightM:f32 = 0.0;
                var breaked = 0;
                for (var j = 0; j < ${SAMPLES_LIGHT}; j++) {
                    let samplePositionLight = samplePosition + (tCurrentLight + segmentLengthLight * 0.5) * sunDirection;
                    let heightLight = length(samplePositionLight) - Re;
                    if (heightLight < 0.0) {breaked = 1; break;}
                    opticalDepthLightR += exp(-heightLight / Hr) * segmentLengthLight;
                    opticalDepthLightM += exp(-heightLight / Hm) * segmentLengthLight;

                    tCurrentLight += segmentLengthLight;
                }
                if (breaked == 0) {
                    let tau = betaR * (opticalDepthR + opticalDepthLightR) + betaM * ${MIE_EXTINCTION_MUL} * (opticalDepthM + opticalDepthLightM);
                    let attenuation = vec3<f32>(exp(-tau.x), exp(-tau.y), exp(-tau.z));
                    sumR += attenuation * hr;
                    sumM += attenuation * hm;
                }
                tCurrent += segmentLength;
            }
            return vec4<f32>(((sumR * betaR + phaseSun * vec3<f32>(1.0,0.9,0.6))* phaseR + sumM * betaM * phaseM) *${SUN_INTENSITY},0.09+phaseSun);
        }
        
        @fragment fn mainFragment(@location(0) pos: vec4<f32>, @location(1) dir: vec4<f32>, @location(2) coord: vec3<f32>)->fOut{          
            let ro = pos * (Re / ${planetRadius * 0.99});
            let rd = normalize(dir);
            let intres = raySphereIntersect(ro, rd, Re);
            var tMax:f32 = 1000000.0;
            if (intres.x > 0.0) {
                tMax = intres.x;
            }
            return fOut(computeIncidentLight(ro, rd, 0.0, tMax, sunDir),0.999999);
        }`,
                rayEntryPoint: "mainRay",
                fragmentEntryPoint: "mainFragment"
            }
        }
    }

    class SolarSystem {

        earthSpinPeriod1: number = 1;
        earthSpinPeriod1Phase: number = 0;
        earthSpinPeriod2: number = 2.87;
        earthSpinPeriod2Phase: number = 0.28;
        earthYearPeriod: number = 100;
        earthYearPeriodPhase: number = 0.83;
        /// eclipticObliquity is mesured by angles between equator of earthSpinPeriod1 and ecliptic plane
        eclipticObliquityAngle1: number = 12 * math._DEG2RAD;
        eclipticObliquityAngle2: number = 43 * math._DEG2RAD;

        private earthSpinW1: number;
        private earthSpinW2: number;
        private earthYearW: number;
        private earthInitLocalSpin: math.Bivec;
        private earthLocalSpinW: math.Bivec;
        private earthObliquity: math.Rotor;
        /// when parameters changed, update() should be called
        constructor() {
            this.update();
        }
        update() {
            this.earthSpinW1 = math._360 / this.earthSpinPeriod1;
            this.earthSpinW2 = math._360 / this.earthSpinPeriod2;
            this.earthYearW = math._360 / this.earthYearPeriod;
            this.earthInitLocalSpin = new math.Bivec(this.earthSpinPeriod1Phase, 0, 0, 0, 0, this.earthSpinPeriod2Phase);
            this.earthLocalSpinW = new math.Bivec(this.earthSpinW1, 0, 0, 0, 0, this.earthSpinW2);
            this.earthObliquity = new math.Bivec(0, this.eclipticObliquityAngle1, 0, 0, this.eclipticObliquityAngle2).exp();
        }
        getEarthPos(time: number) {
            const phi = this.earthYearW * time + this.earthYearPeriodPhase;
            return new math.Vec4(Math.cos(phi), Math.sin(phi));
        }
        getEarthRotation(time: number) {
            // spin in xy - zw 
            const localSpin = this.earthInitLocalSpin.clone().addmulfs(this.earthLocalSpinW, time).exp();
            // add earthObliquity
            return localSpin.mulsl(this.earthObliquity);
        }
        getSkyGlomeRotation(time: number) {
            return this.getEarthRotation(time).conjs()
        }
        getRelSunPos(time: number) {
            const sunPosInSkyGlome = this.getEarthPos(time).negs();
            return sunPosInSkyGlome.rotates(this.getSkyGlomeRotation(time));
        }
    }
}