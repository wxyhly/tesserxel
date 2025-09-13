import * as tesserxel from "../../build/esm/tesserxel.js";
const { Bivec, Vec4 } = tesserxel.math;
const CWMesh = tesserxel.mesh.CWMesh;
const polytope = tesserxel.mesh.cw.polytope;
const truncatedPolytope = tesserxel.mesh.cw.truncatedPolytope;
const bitruncatedPolytope = tesserxel.mesh.cw.bitruncatedPolytope;
function cwmesh0dframe(cwmesh, radius, segment) {
    const vtable = cwmesh.data[0];
    let obj = new tesserxel.four.Object;
    const glomeGeom = new tesserxel.four.GlomeGeometry(radius, segment);
    const material = new tesserxel.four.LambertMaterial([1, 0.8, 0.9, 1]);
    for (const v of vtable) {
        obj.add(new tesserxel.four.Mesh(glomeGeom, material).translates(v));
    }
    return obj;
}
function cwmesh1dframe(cwmesh, radius, u, v) {
    const vtable = cwmesh.data[0];
    let obj = new tesserxel.four.Object;
    const edgeGeom = new tesserxel.four.Geometry(tesserxel.mesh.tetra.spherinderSide(radius, radius, u, v, 1));
    const material = new tesserxel.four.LambertMaterial([0, 1, 0, 1]);
    for (const edge of cwmesh.data[1]) {
        const v0 = vtable[edge[0]];
        const v1 = vtable[edge[1]];
        const trans = new tesserxel.math.Obj4(v0.add(v1).mulfs(0.5), tesserxel.math.Rotor.lookAt(Vec4.w, v1.sub(v0)), new Vec4(1, 1, 1, v1.distanceTo(v0)));
        obj.add(new tesserxel.four.Mesh(edgeGeom, material).copyObj4(trans));
    }
    return obj;
}
function cwmesh2Tetrahedra(cwmesh) {
    const material = new tesserxel.four.LambertMaterial([1, 1, 0, 0.05]);
    material.cullMode = "none";
    const geom = new tesserxel.four.Geometry(tesserxel.mesh.tetra.cwmesh(cwmesh));
    return new tesserxel.four.Mesh(geom, material);
}
function cwmesh2dframe(cwmesh, radius, segment) {
    let obj = new tesserxel.four.Object;
    let tetra;
    const material = new tesserxel.four.LambertMaterial([0, 0, 1, 0.1]);
    cwmesh.sort2DFace();
    for (let i = 0; i < cwmesh.data[2].length; i++) {
        // select ith 2d face
        let faceSel = new tesserxel.mesh.CWMeshSelection(cwmesh).addFace(2, i).closure();
        const varr = Array.from(faceSel.selData[0]).map(vId => cwmesh.data[0][vId]);
        let va = varr[0];
        let faceBivec;
        for (let b = 1; b < varr.length; b++) {
            for (let c = b + 1; c < varr.length; c++) {
                faceBivec = varr[b].sub(va).wedge(varr[c].sub(va));
                if (faceBivec.norm1() > 0.0001) {
                    b = Infinity;
                    break;
                }
            }
        }
        const thickness = tesserxel.mesh.cw.polytope([segment]);
        const R = tesserxel.math.Rotor.lookAtbb(Bivec.yx, faceBivec.duals().norms());
        thickness.apply(v => v.mulfs(radius).rotates(R));
        thickness.makeDirectProduct(cwmesh, undefined, faceSel);
        if (!tetra) {
            tetra = tesserxel.mesh.tetra.cwmesh(thickness);
        }
        else {
            tetra = tetra.concat(tesserxel.mesh.tetra.cwmesh(thickness));
        }
        if (i % 128 === 127) {
            console.log(tetra.count / 66);
            const geom = new tesserxel.four.Geometry(tetra.inverseNormal());
            obj.add(new tesserxel.four.Mesh(geom, material));
            tetra = undefined;
        }
    }
    if (tetra) {
        const geom = new tesserxel.four.Geometry(tetra.inverseNormal());
        obj.add(new tesserxel.four.Mesh(geom, material));
    }
    return obj;
}
class DisplayCtrl {
    enabled = true;
    toggleMap;
    constructor(toggleMap) {
        this.toggleMap = toggleMap;
    }
    update(state) {
        if (state.isKeyHold("AltLeft"))
            return;
        for (const [key, obj] of this.toggleMap) {
            if (state.isKeyHold(key)) {
                obj.visible = !obj.visible;
                return;
            }
        }
    }
}
async function loadPolytope0123dFacesScene(mesh, scale = 1) {
    const FOUR = tesserxel.four;
    const canvas = document.getElementById("gpu-canvas");
    const app = await FOUR.App.create({ canvas, controllerConfig: { preventDefault: true } });
    /** This is a asycn function wait for request WebGPU adapter and do initiations */
    const renderer = app.renderer;
    renderer.core.setDisplayConfig({ opacity: 15 });
    renderer.setBackgroundColor([1, 1, 1, 1]);
    let scene = app.scene;
    scene.wireframe = new FOUR.WireFrameScene;
    if (mesh.data[1].length < 1e3)
        scene.wireframe.add(new FOUR.WireFrameConvexPolytope(mesh));
    scene.setBackgroundColor({ r: 1.0, g: 1.0, b: 1.0, a: 0.02 });
    let camera = app.camera;
    const mesh0 = cwmesh0dframe(mesh, 0.07 * scale, 1);
    const es = mesh.data[1].length > 256 ? 3 : mesh.data[1].length > 127 ? 4 : 5;
    const mesh1 = cwmesh1dframe(mesh, 0.05 * scale, es, es);
    const fs = mesh.data[2].length > 256 ? 3 : mesh.data[2].length > 127 ? 4 : 5;
    const mesh2 = cwmesh2dframe(mesh, 0.04 * scale, fs);
    const mesh3 = cwmesh2Tetrahedra(mesh);
    scene.add(mesh0);
    scene.add(mesh1);
    scene.add(mesh2);
    scene.add(mesh3);
    scene.add(new tesserxel.four.DirectionalLight([0.9, 0.8, 0.6], new Vec4(0.2, 0.4, -0.9, 0.8).norms()));
    scene.add(new tesserxel.four.DirectionalLight([0.1, 0.2, 0.3], new Vec4(-0.2, 0.4, 0.9, 0.8).norms()));
    scene.add(new tesserxel.four.DirectionalLight([0.2, 0.2, 0.2], new Vec4(-0.4, -0.4, 0.3, -0.8).norms()));
    scene.add(new tesserxel.four.DirectionalLight([0.1, 0.15, 0.2], new Vec4(0.4, -0.2, -0.6, -0.4).norms()));
    scene.add(new tesserxel.four.AmbientLight(0.15));
    scene.add(camera);
    // move camera a little back to see polytope at origin
    // note: w axis is pointed to back direction (like z axis in 3D)
    camera.position.w = 1.5;
    const trackballCtrl = new tesserxel.util.ctrl.TrackBallController(camera, true);
    const displayCtrl = new DisplayCtrl(new Map([
        [".Digit0", mesh0],
        [".Digit1", mesh1],
        [".Digit2", mesh2],
        [".Digit3", mesh3],
    ]));
    // add our controller
    app.controllerRegistry.add(displayCtrl);
    app.controllerRegistry.add(trackballCtrl);
    app.run();
}
export var duopr5;
(function (duopr5) {
    async function load() {
        const mesh = polytope([5]);
        const mesh2 = polytope([5]);
        mesh.makeDirectProduct(mesh2.apply(v => v.set(0, 0, v.x, -v.y)));
        await loadPolytope0123dFacesScene(mesh);
    }
    duopr5.load = load;
})(duopr5 || (duopr5 = {}));
export var duopy5;
(function (duopy5) {
    async function load() {
        const mesh = polytope([5]);
        const mesh2 = polytope([5]);
        mesh.makeDirectProduct(mesh2.apply(v => v.set(0, 0, v.x, -v.y)));
        await loadPolytope0123dFacesScene(mesh.makeDual());
    }
    duopy5.load = load;
})(duopy5 || (duopy5 = {}));
export var prpr5;
(function (prpr5) {
    async function load() {
        const mesh = polytope([5]);
        mesh.makePrism(Vec4.z, true);
        mesh.makePrism(Vec4.w, true);
        await loadPolytope0123dFacesScene(mesh);
    }
    prpr5.load = load;
})(prpr5 || (prpr5 = {}));
export var prpy5;
(function (prpy5) {
    async function load() {
        const mesh = polytope([5]);
        mesh.makePrism(Vec4.z, true);
        mesh.makePyramid(Vec4.w);
        await loadPolytope0123dFacesScene(mesh);
    }
    prpy5.load = load;
})(prpy5 || (prpy5 = {}));
export var pypy5;
(function (pypy5) {
    async function load() {
        const mesh = polytope([5]);
        mesh.makePyramid(Vec4.z);
        mesh.makePyramid(Vec4.w);
        await loadPolytope0123dFacesScene(mesh);
    }
    pypy5.load = load;
})(pypy5 || (pypy5 = {}));
export var pypr5;
(function (pypr5) {
    async function load() {
        const mesh = polytope([5]);
        mesh.makePyramid(Vec4.z);
        mesh.makePrism(Vec4.w, true);
        await loadPolytope0123dFacesScene(mesh);
    }
    pypr5.load = load;
})(pypr5 || (pypr5 = {}));
export var cell5;
(function (cell5) {
    async function load() {
        await loadPolytope0123dFacesScene(polytope([3, 3, 3]));
    }
    cell5.load = load;
})(cell5 || (cell5 = {}));
export var cell8;
(function (cell8) {
    async function load() {
        await loadPolytope0123dFacesScene(polytope([4, 3, 3]));
    }
    cell8.load = load;
})(cell8 || (cell8 = {}));
export var cell120;
(function (cell120) {
    async function load() {
        await loadPolytope0123dFacesScene(polytope([5, 3, 3]));
    }
    cell120.load = load;
})(cell120 || (cell120 = {}));
export var cell16;
(function (cell16) {
    async function load() {
        await loadPolytope0123dFacesScene(polytope([3, 3, 4]));
    }
    cell16.load = load;
})(cell16 || (cell16 = {}));
export var cell24;
(function (cell24) {
    async function load() {
        await loadPolytope0123dFacesScene(polytope([3, 4, 3]));
    }
    cell24.load = load;
})(cell24 || (cell24 = {}));
export var cell600;
(function (cell600) {
    async function load() {
        await loadPolytope0123dFacesScene(polytope([3, 3, 5]));
    }
    cell600.load = load;
})(cell600 || (cell600 = {}));
export var cell5t;
(function (cell5t) {
    async function load() {
        await loadPolytope0123dFacesScene(truncatedPolytope([3, 3, 3], 0.5));
    }
    cell5t.load = load;
})(cell5t || (cell5t = {}));
export var cell8t;
(function (cell8t) {
    async function load() {
        await loadPolytope0123dFacesScene(truncatedPolytope([4, 3, 3], 0.5));
    }
    cell8t.load = load;
})(cell8t || (cell8t = {}));
export var cell120t;
(function (cell120t) {
    async function load() {
        await loadPolytope0123dFacesScene(truncatedPolytope([5, 3, 3], 0.5), 0.5);
    }
    cell120t.load = load;
})(cell120t || (cell120t = {}));
export var cell16t;
(function (cell16t) {
    async function load() {
        await loadPolytope0123dFacesScene(truncatedPolytope([3, 3, 4], 0.5));
    }
    cell16t.load = load;
})(cell16t || (cell16t = {}));
export var cell24t;
(function (cell24t) {
    async function load() {
        await loadPolytope0123dFacesScene(truncatedPolytope([3, 4, 3], 0.5));
    }
    cell24t.load = load;
})(cell24t || (cell24t = {}));
export var cell600t;
(function (cell600t) {
    async function load() {
        await loadPolytope0123dFacesScene(truncatedPolytope([3, 3, 5], 0.5), 0.5);
    }
    cell600t.load = load;
})(cell600t || (cell600t = {}));
export var cell5tt;
(function (cell5tt) {
    async function load() {
        await loadPolytope0123dFacesScene(bitruncatedPolytope([3, 3, 3]));
    }
    cell5tt.load = load;
})(cell5tt || (cell5tt = {}));
export var cell8tt;
(function (cell8tt) {
    async function load() {
        await loadPolytope0123dFacesScene(bitruncatedPolytope([4, 3, 3]));
    }
    cell8tt.load = load;
})(cell8tt || (cell8tt = {}));
export var cell120tt;
(function (cell120tt) {
    async function load() {
        await loadPolytope0123dFacesScene(bitruncatedPolytope([5, 3, 3]), 0.5);
    }
    cell120tt.load = load;
})(cell120tt || (cell120tt = {}));
export var cell24tt;
(function (cell24tt) {
    async function load() {
        await loadPolytope0123dFacesScene(bitruncatedPolytope([3, 4, 3]));
    }
    cell24tt.load = load;
})(cell24tt || (cell24tt = {}));
//# sourceMappingURL=cwmesh.js.map