import * as tesserxel from "../../build/tesserxel.js"
const { Bivec, Vec4 } = tesserxel.math;
type Vec4 = tesserxel.math.Vec4;
const CWMesh = tesserxel.mesh.CWMesh;
const polytope = tesserxel.mesh.cw.polytope;
const truncatedPolytope = tesserxel.mesh.cw.truncatedPolytope;
const bitruncatedPolytope = tesserxel.mesh.cw.bitruncatedPolytope;
type CWMesh = tesserxel.mesh.CWMesh;
function cwmesh0dframe(cwmesh: tesserxel.mesh.CWMesh, radius: number, segment: number) {
    const vtable = cwmesh.data[0] as tesserxel.math.Vec4[];
    let obj = new tesserxel.four.Object;
    const glomeGeom = new tesserxel.four.GlomeGeometry(radius, segment);
    const material = new tesserxel.four.LambertMaterial([1, 0.8, 0.9, 1]);
    for (const v of vtable) {
        obj.add(new tesserxel.four.Mesh(glomeGeom, material).translates(v));
    }
    return obj;
}
function cwmesh1dframe(cwmesh: tesserxel.mesh.CWMesh, radius: number, u: number, v: number) {
    const vtable = cwmesh.data[0] as tesserxel.math.Vec4[];
    let obj = new tesserxel.four.Object;
    const edgeGeom = new tesserxel.four.Geometry(tesserxel.mesh.tetra.spherinderSide(radius, radius, u, v, 1));
    const material = new tesserxel.four.LambertMaterial([0, 1, 0, 1]);
    for (const edge of cwmesh.data[1] as number[][]) {
        const v0 = vtable[edge[0]]; const v1 = vtable[edge[1]];
        const trans = new tesserxel.math.Obj4(
            v0.add(v1).mulfs(0.5),
            tesserxel.math.Rotor.lookAt(Vec4.w, v1.sub(v0)),
            new Vec4(1, 1, 1, v1.distanceTo(v0))
        );
        obj.add(new tesserxel.four.Mesh(edgeGeom, material).copyObj4(trans));
    }
    return obj;
}
function cwmesh2Tetrahedra(cwmesh: tesserxel.mesh.CWMesh) {
    const material = new tesserxel.four.LambertMaterial([1, 1, 0, 0.05]);
    material.cullMode = "none";
    const geom = new tesserxel.four.Geometry(tesserxel.mesh.tetra.cwmesh(cwmesh));
    return new tesserxel.four.Mesh(geom, material);
}
function cwmesh2dframe(cwmesh: tesserxel.mesh.CWMesh, radius: number, segment: number) {
    let obj = new tesserxel.four.Object;
    let tetra: tesserxel.mesh.TetraMesh;
    const material = new tesserxel.four.LambertMaterial([0, 0, 1, 0.1]);
    cwmesh.sort2DFace();
    for (let i = 0; i < cwmesh.data[2].length; i++) {
        // select ith 2d face
        let faceSel = new tesserxel.mesh.CWMeshSelection(cwmesh).addFace(2, i).closure();
        const varr = Array.from(faceSel.selData[0]).map(vId => cwmesh.data[0][vId]) as Vec4[];
        let va = varr[0];
        let faceBivec: tesserxel.math.Bivec;
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
        const R = tesserxel.math.Rotor.lookAtbb(
            Bivec.yx, faceBivec.duals().norms()
        );
        thickness.apply(v => v.mulfs(radius).rotates(R));
        thickness.makeDirectProduct(cwmesh, undefined, faceSel);
        if (!tetra) {
            tetra = tesserxel.mesh.tetra.cwmesh(thickness);
        } else {
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
class DisplayCtrl implements tesserxel.util.ctrl.IController {
    enabled: boolean = true;
    toggleMap: Map<string, tesserxel.four.Object>;
    constructor(toggleMap: Map<string, tesserxel.four.Object>) {
        this.toggleMap = toggleMap;
    }
    update(state: tesserxel.util.ctrl.ControllerState): void {
        if (state.isKeyHold("AltLeft")) return;
        for (const [key, obj] of this.toggleMap) {
            if (state.isKeyHold(key)) {
                obj.visible = !obj.visible;
                return;
            }
        }
    }
}
async function loadPolytope0123dFacesScene(mesh: tesserxel.mesh.CWMesh, scale: number = 1) {
    const FOUR = tesserxel.four;
    const canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
    /** This is a asycn function wait for request WebGPU adapter and do initiations */
    let renderer = await new FOUR.Renderer(canvas).init();
    renderer.core.setDisplayConfig({ opacity: 15 });
    renderer.setBackgroudColor([1, 1, 1, 1]);
    let scene = new FOUR.Scene();
    scene.wireframe = new FOUR.WireFrameScene;
    if (mesh.data[1].length < 1e3)
        scene.wireframe.add(new FOUR.WireFrameConvexPolytope(mesh));
    scene.setBackgroudColor({ r: 1.0, g: 1.0, b: 1.0, a: 0.02 });
    let camera = new FOUR.Camera();
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
    let retinaController = new tesserxel.util.ctrl.RetinaController(renderer.core);
    const trackballCtrl = new tesserxel.util.ctrl.TrackBallController(camera, true);
    const displayCtrl = new DisplayCtrl(new Map([
        [".Digit0", mesh0],
        [".Digit1", mesh1],
        [".Digit2", mesh2],
        [".Digit3", mesh3],
    ]));
    // Create a controllerRegistry binding on the canvas, then add our controller
    let controllerRegistry = new tesserxel.util.ctrl.ControllerRegistry(canvas, [trackballCtrl, retinaController, displayCtrl], { preventDefault: true });
    function setSize() {
        let width = window.innerWidth * window.devicePixelRatio;
        let height = window.innerHeight * window.devicePixelRatio;
        renderer.setSize({ width, height });
    }
    setSize();
    window.addEventListener("resize", setSize);
    function run() {
        controllerRegistry.update();
        renderer.render(scene, camera);
        window.requestAnimationFrame(run);
    }
    run();
}
export namespace duopr5 {
    export async function load() {
        const mesh = polytope([5]);
        const mesh2 = polytope([5]);
        mesh.makeDirectProduct(mesh2.apply(v => v.set(0, 0, v.x, -v.y)));
        await loadPolytope0123dFacesScene(mesh);
    }
}
export namespace duopy5 {
    export async function load() {
        const mesh = polytope([5]);
        const mesh2 = polytope([5]);
        mesh.makeDirectProduct(mesh2.apply(v => v.set(0, 0, v.x, -v.y)));
        await loadPolytope0123dFacesScene(mesh.makeDual());
    }
}
export namespace prpr5 {
    export async function load() {
        const mesh = polytope([5]);
        mesh.makePrism(Vec4.z, true);
        mesh.makePrism(Vec4.w, true);
        await loadPolytope0123dFacesScene(mesh);
    }
}
export namespace prpy5 {
    export async function load() {
        const mesh = polytope([5]);
        mesh.makePrism(Vec4.z, true);
        mesh.makePyramid(Vec4.w);
        await loadPolytope0123dFacesScene(mesh);
    }
}
export namespace pypy5 {
    export async function load() {
        const mesh = polytope([5]);
        mesh.makePyramid(Vec4.z);
        mesh.makePyramid(Vec4.w);
        await loadPolytope0123dFacesScene(mesh);
    }
}
export namespace pypr5 {
    export async function load() {
        const mesh = polytope([5]);
        mesh.makePyramid(Vec4.z);
        mesh.makePrism(Vec4.w, true);
        await loadPolytope0123dFacesScene(mesh);
    }
}
export namespace cell5 {
    export async function load() {
        await loadPolytope0123dFacesScene(polytope([3, 3, 3]));
    }
}
export namespace cell8 {
    export async function load() {
        await loadPolytope0123dFacesScene(polytope([4, 3, 3]));
    }
}
export namespace cell120 {
    export async function load() {
        await loadPolytope0123dFacesScene(polytope([5, 3, 3]));
    }
}
export namespace cell16 {
    export async function load() {
        await loadPolytope0123dFacesScene(polytope([3, 3, 4]));
    }
}
export namespace cell24 {
    export async function load() {
        await loadPolytope0123dFacesScene(polytope([3, 4, 3]));
    }
}
export namespace cell600 {
    export async function load() {
        await loadPolytope0123dFacesScene(polytope([3, 3, 5]));
    }
}
export namespace cell5t {
    export async function load() {
        await loadPolytope0123dFacesScene(truncatedPolytope([3, 3, 3], 0.5));
    }
}
export namespace cell8t {
    export async function load() {
        await loadPolytope0123dFacesScene(truncatedPolytope([4, 3, 3], 0.5));
    }
}
export namespace cell120t {
    export async function load() {
        await loadPolytope0123dFacesScene(truncatedPolytope([5, 3, 3], 0.5), 0.5);
    }
}
export namespace cell16t {
    export async function load() {
        await loadPolytope0123dFacesScene(truncatedPolytope([3, 3, 4], 0.5));
    }
}
export namespace cell24t {
    export async function load() {
        await loadPolytope0123dFacesScene(truncatedPolytope([3, 4, 3], 0.5));
    }
}
export namespace cell600t {
    export async function load() {
        await loadPolytope0123dFacesScene(truncatedPolytope([3, 3, 5], 0.5), 0.5);
    }
}


export namespace cell5tt {
    export async function load() {
        await loadPolytope0123dFacesScene(bitruncatedPolytope([3, 3, 3]));
    }
}
export namespace cell8tt {
    export async function load() {
        await loadPolytope0123dFacesScene(bitruncatedPolytope([4, 3, 3]));
    }
}
export namespace cell120tt {
    export async function load() {
        await loadPolytope0123dFacesScene(bitruncatedPolytope([5, 3, 3]), 0.5);
    }
}
export namespace cell24tt {
    export async function load() {
        await loadPolytope0123dFacesScene(bitruncatedPolytope([3, 4, 3]));
    }
}