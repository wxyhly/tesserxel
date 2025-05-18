import * as tesserxel from "../../build/tesserxel.js"
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
        const renderer = (await new FOUR.Renderer(canvas).init()).autoSetSize();
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
        const controllerRegistry = new tesserxel.util.ctrl.ControllerRegistry(canvas, [
            new tesserxel.util.ctrl.RetinaController(renderer.core),
            new tesserxel.util.ctrl.KeepUpController(camera)
        ], { enablePointerLock: true });
        renderer.core.setDisplayConfig({ opacity: 10 });

        // init physic scene

        const phy = tesserxel.physics;
        const engine = new phy.Engine({ forceAccumulator: phy.force_accumulator.RK4, broadPhase: phy.IgnoreAllBroadPhase });
        const world = new phy.World();
        // world.gravity.set();
        let k = 2000, l = 0.5 * 2 / (glomeNums + 1), v = 30;
        let physicGlomes = [];
        for (let i = 0; i < glomeNums; i++) {
            let g = new phy.Rigid({ geometry: new phy.rigid.Glome(glomeRadius), mass: 0.5, material: null });
            g.position.y = 1;
            g.position.x = ((i + 1) / (glomeNums + 1) - 0.5) * 2;
            // g.velocity.randset().mulfs(v);
            if (i) world.add(new phy.Spring(g, physicGlomes[i - 1], new math.Vec4(), new math.Vec4(), k, l));
            world.add(g);
            physicGlomes.push(g);
        }
        world.add(new phy.Spring(physicGlomes[0], null, new math.Vec4(), pointA, k, l));
        world.add(new phy.Spring(physicGlomes[glomeNums - 1], null, new math.Vec4(), pointB, k, l));

        // run everything
        function run() {
            for (let i = 0; i < glomeNums; i++) {
                renderGlomes[i].copyObj4(physicGlomes[i]);
                renderGlomes[i].needsUpdateCoord = true;
            }
            const omega = 8;
            camera.needsUpdateCoord = true;
            pointB.set(0, Math.sin(world.time * omega) * 0.2 + 1, Math.cos(world.time * omega) * 0.2, 0);
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