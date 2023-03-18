import { four, math, util, physics } from '../../build/tesserxel.js';

var navigation;
(function (navigation) {
    class GlomeSurfaceScatter {
        glomeRadius;
        scatterNumber = 50;
        scatterObject;
        constructor(glomeRadius, scatterObject, scatterNumber) {
            this.glomeRadius = glomeRadius;
            this.scatterObject = scatterObject;
            if (scatterNumber)
                this.scatterNumber = scatterNumber;
        }
        scatter(group) {
            for (let i = 0; i < this.scatterNumber; i++) {
                let mesh = new four.Mesh(this.scatterObject.geometry, this.scatterObject.material);
                group.push(mesh);
                mesh.position.randset();
                mesh.rotation.setFromLookAt(math.Vec4.y, mesh.position);
                mesh.position.mulfs(this.glomeRadius);
            }
        }
    }
    const planetRadius = 10;
    function terrainGen(group) {
        const treeMesh = new four.Mesh(new four.SpherinderSideGeometry(), new four.LambertMaterial([0.8, 0.4, 0.1]));
        const stoneScatter = new GlomeSurfaceScatter(planetRadius, treeMesh);
        stoneScatter.scatter(group);
    }
    async function load() {
        const scene = new four.Scene();
        const planetGeometry = new four.GlomeGeometry(planetRadius);
        const planet = new four.Mesh(planetGeometry, new four.LambertMaterial([0, 1, 0]));
        planet.position.set(0, -planetRadius);
        terrainGen(planet.child);
        const camera = new four.Camera();
        scene.add(camera);
        scene.add(planet);
        scene.add(new four.DirectionalLight(1.0, new math.Vec4(0.2, 0.5, 0.4, 0.8).norms()));
        camera.position.y = 1.0;
        const canvas = document.getElementById("gpu-canvas");
        const renderer = await new four.Renderer(canvas).init();
        const retinaController = new util.ctrl.RetinaController(renderer.core);
        const camController = new util.ctrl.FreeFlyController(camera);
        new util.ctrl.ControllerRegistry(canvas, [retinaController, camController]);
        function setSize() {
            const width = window.innerWidth * window.devicePixelRatio;
            const height = window.innerHeight * window.devicePixelRatio;
            renderer.setSize({ width, height });
        }
        setSize();
        window.addEventListener("resize", setSize);
        // run();
        calculate(0);
    }
    navigation.load = load;
    function calculate(dipole_ratio) {
        let NS = 30; // position
        // let dipole_ratio = 0.1; // ratio for current of magnetic dipole on MG / WE
        const planetRadius = 1;
        const world = new physics.World();
        world.gravity.set();
        NS *= math._DEG2RAD;
        const maxwell = new physics.MaxWell();
        const planet = new physics.Rigid({ geometry: new physics.rigid.Glome(planetRadius), mass: 0, material: new physics.Material(0, 0) });
        let dipole = { rigid: planet, position: new math.Vec4, moment: new math.Bivec(1 - dipole_ratio, 0, 0, 0, 0, dipole_ratio).rotates(math.Bivec.yz.mulf(NS).exp()) };
        maxwell.addMagneticDipole(dipole);
        const compass = new physics.Rigid({ geometry: new physics.rigid.Glome(1), mass: 1, material: new physics.Material(0, 0) });
        maxwell.addMagneticDipole({ rigid: compass, position: new math.Vec4, moment: new math.Bivec(1, 0, 0, 0, 0, 0) });
        world.add(new physics.PointConstrain(compass, null, math.Vec4.origin, math.Vec4.y.mulf(1)));
        compass.position.y = 1;
        world.add(compass);
        world.add(planet);
        world.add(maxwell);
        const a = [], b = [], c = [];
        for (let ns = 0; ns <= 90; ns += 1) {
            dipole.moment.copy(new math.Bivec(1 - dipole_ratio, 0, 0, 0, 0, dipole_ratio).rotates(math.Bivec.yz.mulf(ns * math._DEG2RAD).exp()));
            maxwell.apply(0);
            let biv = maxwell.getBAt(math.Vec4.y.mulf(1), false, compass).clone();
            let WE = new math.Vec3(-biv.zw, -biv.xz, biv.xw);
            let MG = new math.Vec3(biv.xy, -biv.yw, -biv.yz);
            biv.xz / biv.xy;
            a.push(Math.atan2(WE.y, WE.x) * math._RAD2DEG);
            b.push(Math.atan2(MG.y, MG.x) * math._RAD2DEG);
            c.push(Math.atan2(WE.wedge(MG).norm(), WE.dot(MG)) * math._RAD2DEG);
        }
        console.log(`a={${a.join(",")}};b={${b.join(",")}};c={${c.join(",")}};`);
        // const engine = new physics.Engine({broadPhase: physics.IgnoreAllBroadPhase});
        // for (let i = 0; i < 100; i++) {
        //     engine.update(world, 0.01);
        //     console.log(new math.Mat4().setFromRotor(compass.rotation));
        // }
    }
})(navigation || (navigation = {}));

export { navigation };
//# sourceMappingURL=navigation.js.map
