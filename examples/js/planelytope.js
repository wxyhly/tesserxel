import * as tesserxel from "../../build/esm/tesserxel.js";
export var planelytope;
(function (planelytope) {
    async function load() {
        const FOUR = tesserxel.four;
        const math = tesserxel.math;
        const Vec3 = math.Vec3;
        const canvas = document.getElementById("gpu-canvas");
        let renderer = (await new FOUR.Renderer(canvas).init()).autoSetSize();
        let scene = new FOUR.Scene();
        let circleGeometry = new FOUR.Geometry(tesserxel.mesh.tetra.spheritorus(0.02, 4, 4, 1, 24));
        let glomeGeometry = new FOUR.GlomeGeometry();
        let material1 = new FOUR.PhongMaterial([1.0, 1.0, 1.0, 0.005]);
        let material2 = new FOUR.PhongMaterial([1.0, 0.0, 0.0, 1]);
        let bivs = [];
        // let v1 = tesserxel.mesh.cw.polytope([5,3]).data[0];
        // let v2 = tesserxel.mesh.cw.polytope([4,3]).data[0];
        const c60 = tesserxel.mesh.cw.truncatedPolytope([3, 5], 0.6298081);
        let v1 = c60.data[0];
        let v2 = c60.data[0];
        // for (let [a, b] of c60.data[1] as [number, number][]) {
        //     console.log(v1[a].distanceSqrTo(v1[b]));
        // }
        // let v2 = tesserxel.mesh.cw.polytope([3, 5]).data[0];
        for (const A of v1) {
            // console.log(i);
            for (const B of v2) {
                bivs.push(new math.Bivec(A.x + B.x, A.y + B.y, A.z + B.z, A.z - B.z, B.y - A.y, A.x - B.x).norms());
            }
        }
        let outputR = "";
        scene.add(new FOUR.Mesh(glomeGeometry, material1));
        for (const biv of bivs) {
            const R = math.Rotor.lookAtbb(math.Bivec.xw, biv);
            const poleAngle = biv.dotv(math.Vec4.w).norm();
            const m = new FOUR.Mesh(circleGeometry, material2);
            m.rotates(R);
            outputR += `(${[R.l.x.toFixed(4), R.l.y.toFixed(4), R.l.z.toFixed(4), R.l.w.toFixed(4)].join(",")}`;
            outputR += ',';
            outputR += `${[R.r.x.toFixed(4), R.r.y.toFixed(4), R.r.z.toFixed(4), R.r.w.toFixed(4)].join(",")},${poleAngle}),\n`;
            // scene.add(m);
        }
        console.log(outputR);
        let camera = new FOUR.Camera();
        camera.position.w = 0.98;
        camera.fov = 60;
        scene.add(camera);
        scene.add(new FOUR.AmbientLight(0.3));
        let dirLight = new FOUR.DirectionalLight([0.9, 0.8, 0.8], new tesserxel.math.Vec4(1, -1, 0, -1).norms());
        scene.add(dirLight);
        let dirLight2 = new FOUR.DirectionalLight([0.8, 0.8, 0.9], new tesserxel.math.Vec4(0, 1, 1, 1).norms());
        scene.add(dirLight2);
        let dirLight3 = new FOUR.DirectionalLight([0.7, 0.6, 0.5], new tesserxel.math.Vec4(-1, 0, -1, 0).norms());
        scene.add(dirLight3);
        scene.setBackgroudColor([0, 0, 0, 0.02]);
        renderer.core.setDisplayConfig({ opacity: 40 });
        let controller = new tesserxel.util.ctrl.ControllerRegistry(canvas, [
            new tesserxel.util.ctrl.TrackBallController(camera, true),
            new tesserxel.util.ctrl.RetinaController(renderer.core)
        ], { enablePointerLock: true });
        function run() {
            controller.update();
            renderer.render(scene, camera);
            window.requestAnimationFrame(run);
        }
        run();
    }
    planelytope.load = load;
})(planelytope || (planelytope = {}));
//# sourceMappingURL=planelytope.js.map