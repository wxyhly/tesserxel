namespace examples {
    export namespace spring_rope {
        export async function load() {
            const math = tesserxel.math;
            const glomeNums = 20;
            const glomeRadius = 0.1;
            const pointA = new math.Vec4(-1, 1, 0, 0);
            const pointB = new math.Vec4(1, 1, 0, 0);

            // init render scene

            const FOUR = tesserxel.four;
            const canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
            const renderer = await new FOUR.Renderer(canvas).init();
            let scene = new FOUR.Scene();
            renderer.setBackgroudColor([1, 1, 1, 1]);
            scene.setBackgroudColor({ r: 0.8, g: 0.9, b: 1.0, a: 0.01 });
            let camera = new FOUR.Camera();
            camera.position.w = 2;
            scene.add(camera);
            const glomeGeometry = new FOUR.GlomeGeometry(glomeRadius);
            const materialRed = new FOUR.PhongMaterial({ r: 1.0, g: 0.0, b: 0.0, a: 1.0 });
            let renderGlomes = [];
            for (let i = 0; i < glomeNums; i++) {
                let g = new FOUR.Mesh(glomeGeometry, materialRed);
                renderGlomes.push(g);
                scene.add(g);
            }
            let meshGlome0 = new FOUR.Mesh(glomeGeometry, new FOUR.LambertMaterial({ r: 0.2, g: 0.2, b: 1.0, a: 1.0 }));
            let meshGlome1 = new FOUR.Mesh(glomeGeometry, new FOUR.LambertMaterial({ r: 0.2, g: 0.2, b: 1.0, a: 1.0 }));
            scene.add(meshGlome0);
            scene.add(meshGlome1);
            meshGlome0.position.copy(pointA);
            scene.add(new FOUR.DirectionalLight([3.3, 3, 3], new math.Vec4(0, 1, 0, 3).norms()));
            scene.add(new FOUR.DirectionalLight([0.2, 0.3, 0.4], math.Vec4.yNeg));
            const controllerRegistry = new tesserxel.controller.ControllerRegistry(canvas, [
                new tesserxel.controller.RetinaController(renderer.core),
                new tesserxel.controller.KeepUpController(camera)
            ], { requsetPointerLock: true });
            function setSize() {
                let width = window.innerWidth * window.devicePixelRatio;
                let height = window.innerHeight * window.devicePixelRatio;
                renderer.setSize({ width, height });
            }

            renderer.core.setOpacity(10);
            setSize();
            window.addEventListener("resize", setSize);

            // init physic scene

            const phy = tesserxel.physics;
            const engine = new phy.Engine({ forceAccumulator: phy.force_accumulator.RK4, broadPhase: phy.IgnoreAllBroadPhase });
            const world = new phy.World();
            // world.gravity.set();
            let k = 2000, l = 1.0 * 2 / (glomeNums + 1), v = 30;
            let physicGlomes = [];
            for (let i = 0; i < glomeNums; i++) {
                let g = new phy.Rigid({ geometry: new phy.rigid.Glome(glomeRadius), mass: 0.5, material: null });
                g.position.y = 1;
                g.position.x = ((i + 1) / (glomeNums + 1) - 0.5) * 2;
                g.velocity.randset().mulfs(v);
                if (i) world.add(new phy.force.Spring(g, physicGlomes[i - 1], new math.Vec4(), new math.Vec4(), k, l));
                world.add(g);
                physicGlomes.push(g);
            }
            world.add(new phy.force.Spring(physicGlomes[0], null, new math.Vec4(), pointA, k, l));
            world.add(new phy.force.Spring(physicGlomes[glomeNums - 1], null, new math.Vec4(), pointB, k, l));

            // run everything
            function run() {
                for (let i = 0; i < glomeNums; i++) {
                    renderGlomes[i].copyObj4(physicGlomes[i]);
                    renderGlomes[i].needsUpdateCoord = true;
                }
                camera.needsUpdateCoord = true;
                pointB.set(0, Math.sin(world.time * 10) * 0.2 + 1, Math.cos(world.time * 10) * 0.2, 0);
                meshGlome1.position.copy(pointB);
                meshGlome1.needsUpdateCoord = true;
                controllerRegistry.update();
                renderer.render(scene, camera);
                engine.update(world, 1 / 60)
                window.requestAnimationFrame(run);
            }
            run();

        }
    }
    export namespace rigid_test {
        export async function load() {
            const math = tesserxel.math;
            const size = new math.Vec4(5, 4, 3, 2);
            let slope = 0 * math._DEG2RAD;

            // init render scene

            const FOUR = tesserxel.four;
            const canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
            const renderer = await new FOUR.Renderer(canvas).init();
            let scene = new FOUR.Scene();
            renderer.setBackgroudColor([1, 1, 1, 1]);
            scene.setBackgroudColor({ r: 0.8, g: 0.9, b: 1.0, a: 0.01 });
            let camera = new FOUR.Camera();
            camera.position.w = 8;
            camera.position.y = 1;
            scene.add(camera);

            scene.add(new FOUR.AmbientLight(0.3));
            scene.add(new FOUR.DirectionalLight([2.2, 2.0, 1.9], new math.Vec4(0.2, 0.6, 0.1, 0.3).norms()));
            // const geom = new FOUR.GlomeGeometry(1);
            const geom = new FOUR.TesseractGeometry(size);
            const materialRed = new FOUR.PhongMaterial(new FOUR.GridTexture([1, 0, 0], [1, 1, 1, 0.5], 0.2));
            const floor = new FOUR.Mesh(new FOUR.CubeGeometry(50), new FOUR.PhongMaterial([0, 0.6, 0.2]));
            floor.rotation.expset(math.Bivec.xy.mulf(Math.asin(-slope)));
            scene.add(floor);
            let rg = new FOUR.Mesh(geom, materialRed);
            rg.alwaysUpdateCoord = true;
            scene.add(rg);

            renderer.core.setEyeOffset(0.5);
            const controllerRegistry = new tesserxel.controller.ControllerRegistry(canvas, [
                new tesserxel.controller.RetinaController(renderer.core),
                new tesserxel.controller.KeepUpController(camera)
            ], { requsetPointerLock: true });
            function setSize() {
                let width = window.innerWidth * window.devicePixelRatio;
                let height = window.innerHeight * window.devicePixelRatio;
                renderer.setSize({ width, height });
            }
            setSize();
            window.addEventListener("resize", setSize);

            // init physic scene

            const phy = tesserxel.physics;
            const engine = new phy.Engine({ forceAccumulator: phy.force_accumulator.Predict3 });
            const world = new phy.World();
            const material = new phy.Material(1, 0.5);
            world.add(new phy.Rigid({ geometry: new phy.rigid.Plane(new math.Vec4(Math.sin(slope), Math.cos(slope))), mass: 0, material }))
            // let obj = new phy.Rigid({ geometry: new phy.rigid.Glome(1), material, mass: 1 });
            let obj = new phy.Rigid({ geometry: new phy.rigid.Tesseractoid(size), material, mass: 1 });
            world.add(obj);
            // obj.angularVelocity.xy = 30;//.copy(math.Bivec.rand());
            obj.position.y = 10;
            // run everything
            function run() {
                rg.copyObj4(obj);
                controllerRegistry.update();
                renderer.render(scene, camera); camera.needsUpdateCoord = true;

                if (goon || !engine.narrowPhase.collisionList.length) engine.update(world, 1 / 60);
                window.requestAnimationFrame(run);
            }
            renderer.render(scene, camera);
            setTimeout(run, 100);

        }
    }
}

let goon = true;