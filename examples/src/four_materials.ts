import * as tesserxel from "../../build/tesserxel.js"
export namespace four_materials {
    export async function load() {
        const FOUR = tesserxel.four;
        const canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
        let renderer = await new FOUR.Renderer(canvas).init();
        let scene = new FOUR.Scene();
        let cubeGeometry = new FOUR.TesseractGeometry();
        let glomeGeometry = new FOUR.GlomeGeometry();
        let floorGeometry = new FOUR.CubeGeometry(10.0);
        let uniformColor = new FOUR.ColorUniformValue();
        let material1 = new FOUR.PhongMaterial([1.0, 1.0, 1.0]);
        let material2 = new FOUR.PhongMaterial(uniformColor);
        let cubeMesh1 = new FOUR.Mesh(cubeGeometry, material1);
        cubeMesh1.position.x = -2;
        cubeMesh1.position.y = 2;
        let cubeMesh2 = new FOUR.Mesh(cubeGeometry, material2);
        cubeMesh2.position.x = 2;
        cubeMesh2.position.y = 2;
        let floorMaterial = new FOUR.PhongMaterial(
            new FOUR.CheckerTexture(
                [0, 0, 0, 0.2], [1, 1, 1, 1.0], new FOUR.Vec4TransformNode(
                    new FOUR.UVWVec4Input,
                    new tesserxel.math.Obj4(null, null, new tesserxel.math.Vec4(10, 10, 10, 10))
                )
            )
        );
        let floorMesh = new FOUR.Mesh(floorGeometry, floorMaterial);
        let glomeMesh = new FOUR.Mesh(glomeGeometry, new FOUR.PhongMaterial(
            [0.2, 0.2, 1], 50
        ));
        glomeMesh.position.y = 1.0;
        glomeMesh.position.z = 1.0;
        glomeMesh.position.w = 1.0;
        scene.add(glomeMesh);
        scene.add(cubeMesh1);
        scene.add(cubeMesh2);
        scene.add(floorMesh);
        scene.add(new FOUR.AmbientLight(0.1));
        let dirLight = new FOUR.DirectionalLight([0.1, 0.0, 0.0])
        scene.add(dirLight);
        let pointLight = new FOUR.PointLight([5.4, 2.5, 1.7]);
        scene.add(pointLight);
        let pointLight2 = new FOUR.PointLight([1.4, 12.5, 5.7]);
        scene.add(pointLight2);
        let pointLight3 = new FOUR.PointLight([1.4, 1.5, 15.7]);
        scene.add(pointLight3);
        let spotLight = new FOUR.SpotLight([800, 800, 800], 40, 0.2);
        scene.add(spotLight);
        spotLight.position.y = 10;
        dirLight.alwaysUpdateCoord = true;
        pointLight.alwaysUpdateCoord = true;
        pointLight2.alwaysUpdateCoord = true;
        pointLight3.alwaysUpdateCoord = true;
        spotLight.alwaysUpdateCoord = true;
        let camera = new FOUR.Camera();
        camera.position.w = 5.0;
        camera.position.y = 2.0;
        camera.lookAt(tesserxel.math.Vec4.wNeg, new tesserxel.math.Vec4());
        scene.add(camera);
        let controller = new tesserxel.util.ctrl.ControllerRegistry(canvas, [
            new tesserxel.util.ctrl.KeepUpController(camera),
            new tesserxel.util.ctrl.RetinaController(renderer.core)
        ], { enablePointerLock: true });
        function setSize() {
            let width = window.innerWidth * window.devicePixelRatio;
            let height = window.innerHeight * window.devicePixelRatio;
            renderer.setSize({ width, height });
        }
        setSize();
        window.addEventListener("resize", setSize);
        let t = Math.random() * 12345678;
        function run() {
            spotLight.direction.copy(
                new tesserxel.math.Vec4(Math.sin(t * 3), Math.cos(t * 3), Math.sin(t * 1.732), Math.cos(t * 1.732)).adds(tesserxel.math.Vec4.y.mulf(6)).norms()
            );
            pointLight.position.set(Math.sin(t * 3), 0.5, Math.cos(t * 3), 0).mulfs(3);
            pointLight2.position.set(0, 0.5, Math.sin(t * 3), Math.cos(t * 3)).mulfs(3);
            pointLight3.position.set(Math.cos(t * 3), 0.5, 0, Math.sin(t * 3)).mulfs(3);
            dirLight.direction.set(Math.sin(t * 20), 0.2, Math.cos(t * 20) * 0.2, Math.cos(t * 20)).norms();
            uniformColor.write([Math.sin(t) * 0.3 + 0.7, Math.sin(t * 0.91) * 0.5 + 0.5, Math.sin(t * 1.414) * 0.5 + 0.5]);
            t += 0.01;
            controller.update();
            renderer.render(scene, camera);
            window.requestAnimationFrame(run);
        }
        run();
    }
}