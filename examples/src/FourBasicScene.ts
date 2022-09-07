namespace examples {
    /** Double rotation of a tesseract */
    export namespace four_basic_scene {
        export async function load() {
            const FOUR = tesserxel.four;
            const canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
            let renderer = await new FOUR.Renderer(canvas).init();
            let scene = new FOUR.Scene();
            // by default the backgroud is black (0.0, 0.0, 0.0) here we change it to white
            // alpha value is used for voxel opacity in retina
            // this value doesn't affect section views
            scene.setBackgroudColor({ r: 1.0, g: 1.0, b: 1.0, a: 1.0 });
            let camera = new FOUR.Camera();
            let cubeGeometry = new FOUR.TesseractGeometry();
            let material = new FOUR.BasicMaterial({ r: 1.0, g: 0.0, b: 0.0, a: 1.0 });
            let mesh = new FOUR.Mesh(cubeGeometry, material);
            scene.add(mesh);
            scene.add(camera);
            // move camera a little back to see hypercube at origin
            // note: w axis is pointed to back direction (like z axis in 3D)
            camera.position.w = 3.0;
            let retinaController = new tesserxel.controller.RetinaController(renderer.core);
            // by default retina operations must be enabled by pressing AltLeft key
            // we cancel it manually, so we can directly drag the cubic retina
            retinaController.keyConfig.enable = ""; 
            // Create a controllerRegistry binding on the canvas, then add our controller
            let controllerRegistry = new tesserxel.controller.ControllerRegistry(canvas, [retinaController]);
            function setSize() {
                let width = window.innerWidth * window.devicePixelRatio;
                let height = window.innerHeight * window.devicePixelRatio;
                renderer.setSize({ width, height });
            }
            setSize();
            window.addEventListener("resize", setSize);
            function run() {
                controllerRegistry.update();
                camera.needsUpdateCoord = true; // to tell renderer to update camera's orientation
                // For every frame, we rotate the mesh by angle of 0.01 radius degree in both xw and yz direction
                // We got a double clifford rotation here
                mesh.rotates(tesserxel.math.Bivec.xw.mulf(0.01).exp());
                mesh.rotates(tesserxel.math.Bivec.yz.mulf(0.01).exp());
                mesh.needsUpdateCoord = true; // to tell renderer to update mesh's orientation
                renderer.render(scene, camera);
                window.requestAnimationFrame(run);
            }
            run();
        }
    }
}