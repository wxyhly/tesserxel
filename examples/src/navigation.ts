import { math, four, util } from "../../build/tesserxel.js"
export namespace navigation {
    class GlomeSurfaceScatter {
        glomeRadius: number;
        scatterNumber: number = 50;
        scatterObject: four.Mesh;
        constructor(glomeRadius: number, scatterObject: four.Mesh, scatterNumber?: number) {
            this.glomeRadius = glomeRadius;
            this.scatterObject = scatterObject;
            if (scatterNumber) this.scatterNumber = scatterNumber;
        }
        scatter(group: four.Object[]) {
            for(let i=0;i<this.scatterNumber;i++){
                let mesh = new four.Mesh(this.scatterObject.geometry, this.scatterObject.material);
                group.push(mesh);
                mesh.position.randset();
                mesh.rotation.setFromLookAt(math.Vec4.y,mesh.position);
                mesh.position.mulfs(this.glomeRadius);

            }
        }
    }
    const planetRadius = 100;
    function terrainGen(group: four.Object[]) {
        const treeMesh = new four.Mesh(new four.SpherinderSideGeometry(),new four.LambertMaterial([0.8,0.4,0.1]));
        const stoneScatter = new GlomeSurfaceScatter(planetRadius,treeMesh);
        stoneScatter.scatter(group);
    }
    
    export async function load() {
        const scene = new four.Scene();
        const planetGeometry = new four.GlomeGeometry(planetRadius);
        const planet = new four.Mesh(planetGeometry, new four.LambertMaterial([0, 1, 0]));
        planet.position.set(0, -planetRadius);
        terrainGen(planet.child);

        const camera = new four.Camera();
        scene.add(camera);
        camera.position.y = 1.0;

        const canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
        const renderer = new four.Renderer(canvas);
        let retinaController = new util.ctrl.RetinaController(renderer.core);
        // by default retina operations must be enabled by pressing AltLeft key
        // we cancel it manually, so we can directly drag the cubic retina
        retinaController.keyConfig.enable = "";
        // Create a controllerRegistry binding on the canvas, then add our controller
        let controllerRegistry = new util.ctrl.ControllerRegistry(canvas, [retinaController]);
        function setSize() {
            let width = window.innerWidth * window.devicePixelRatio;
            let height = window.innerHeight * window.devicePixelRatio;
            renderer.setSize({ width, height });
        }
        setSize();
        window.addEventListener("resize", setSize);
        function run() {
            controllerRegistry.update();
            // For every frame, we rotate the mesh by angle of 0.01 radius degree in both xw and yz direction
            // We got a double clifford rotation here
            // mesh.rotates(math.Bivec.xw.mulf(0.01).exp());
            // mesh.rotates(math.Bivec.yz.mulf(0.01).exp());
            renderer.render(scene, camera);
            window.requestAnimationFrame(run);
        }
        run();
    }
}