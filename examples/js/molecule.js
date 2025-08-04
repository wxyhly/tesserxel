import * as tesserxel from "../../build/esm/tesserxel.js";
// @ts-ignore
// import { getStructureInfo, getAtomColor, getAtomRadius, drawStructure, goodLuck } from "/ccahgaolo/chem4d/js/api.js"
// @ts-ignore
import { getStructureInfo, getAtomColor, getAtomRadius, drawStructure, goodLuck } from "https://wxyhly.github.io/Chem4D/js/api.js";
const FOUR = tesserxel.four;
const idealBondAngle = [Math.acos(-1 / 4), Math.acos(-1 / 3), Math.acos(-1 / 2), Math.acos(-1)];
class StructBuilder {
    debug = [];
    debugMesh = [];
    graph;
    molObj;
    atomGeom;
    bondGeom;
    bondMat;
    constructor(g, atomGeom, bondGeom, bondMat) {
        this.atomGeom = atomGeom;
        this.bondGeom = bondGeom;
        this.bondMat = bondMat;
        for (const a of g.atoms) {
            const z = Math.random() * 30;
            const w = Math.random() * 30;
            a.position = new tesserxel.math.Vec4(a.position.x, a.position.y, z, w);
            a.radius = getAtomRadius(a.name);
            a.piOrbitals = 0;
            a.force = new tesserxel.math.Vec4();
            for (const b of a.bonds) {
                a.piOrbitals += Math.max(0, (b.type >> 4) - 1);
            }
        }
        this.graph = g;
    }
    iterate(dt) {
        for (let a of this.graph.atoms) {
            a.force.set();
        }
        this.calcForce();
        for (let a of this.graph.atoms) {
            a.position.addmulfs(a.force, dt);
        }
    }
    calcForce() {
        const k = tesserxel.math.vec4Pool.pop();
        for (let a of this.graph.atoms) {
            const neighbors = [];
            // bond linear strench
            for (let b of a.bonds) {
                const tier = (b.start === a) ? b.stop : b.start;
                if (b.type !== 8)
                    neighbors.push(tier);
                const len = k.subset(a.position, tier.position).norm();
                k.mulfs(5 * (len - (a.radius + tier.radius) * (b.type === 8 ? 1.2 : 0.7)) / len);
                if (a.bonds.length > 5) {
                    k.mulfs(5 / (a.bonds.length));
                }
                a.force.subs(k);
                tier.force.adds(k);
            }
            // bond angular strench
            for (let b1 of neighbors) {
                for (let b2 of neighbors) {
                    if (b1 === b2)
                        continue;
                    const k1 = k.subset(b1.position, a.position).norms();
                    const k2 = tesserxel.math.vec4Pool.pop().subset(b2.position, a.position).norms();
                    let f1, f2;
                    if (a.piOrbitals === 3) {
                        const plane = k1.wedge(k2).mulfs(30);
                        f1 = k1.dotbsr(plane).negs();
                        f2 = k2.dotbsr(plane);
                    }
                    else {
                        const deltaAngle = (idealBondAngle[a.piOrbitals] && a.name !== "*" && a.name !== "H" && a.name !== "D" && a.name !== "T" && neighbors.length <= 5 ? Math.max(Math.min((idealBondAngle[a.piOrbitals] - Math.acos(k1.dot(k2))), Math.PI / 4), -Math.PI / 4) : 0) * 30;
                        const plane = k1.wedge(k2).norms();
                        f1 = k1.dotbsr(plane).mulfs(-deltaAngle);
                        f2 = k2.dotbsr(plane).mulfs(deltaAngle);
                    }
                    b1.force.adds(f1);
                    a.force.subs(f1);
                    b2.force.adds(f2);
                    a.force.subs(f2);
                }
            }
            // atoms colision
            for (let b of this.graph.atoms) {
                if (a === b || neighbors.includes(b))
                    continue;
                // const coarseLen = k.subset(a.position, b.position).norminf();
                // if (coarseLen > (a.radius + b.radius) * 5) continue;
                k.subset(a.position, b.position);
                const len = k.norm();
                // if (len > (a.radius + b.radius) * 5) continue;
                if (len < 1)
                    k.randset().mulfs(100);
                k.divfs(len * len * 0.05);
                if (a.name === b.name && a.name === "Elc") {
                    k.mulfs(5);
                }
                // k.divfs(-len * len * len / 50);
                a.force.adds(k);
                b.force.subs(k);
            }
        }
        tesserxel.math.vec4Pool.push(k);
        // pi bond constrain
        const accumAtoms = new Array;
        for (let b of this.graph.bonds) {
            // ignore X-Y  and -X#Y  X#Y  X#Y-
            if (b.type >> 4 <= 1 || b.start.bonds.length <= 1 || b.stop.bonds.length <= 1)
                continue;
            // planar sp2 - sp2
            if (b.start.piOrbitals === 2 && b.stop.piOrbitals === 2) {
                const an = []; // an[]-X#Y-
                const bn = []; // -X#Y-bn[]
                for (let sa of b.start.bonds) {
                    if (sa === b)
                        continue;
                    if (sa.type === 8)
                        continue;
                    an.push((sa.start === b.start) ? sa.stop : sa.start);
                }
                for (let sb of b.stop.bonds) {
                    if (sb === b)
                        continue;
                    if (sb.type === 8)
                        continue;
                    bn.push((sb.start === b.stop) ? sb.stop : sb.start);
                }
                // len 1~2
                if (an.length === 0 || an.length > 2 || bn.length == 0 || bn.length > 2)
                    continue;
                const k = tesserxel.math.vec4Pool.pop();
                const k2 = tesserxel.math.vec4Pool.pop();
                const kb = tesserxel.math.vec4Pool.pop().subset(b.start.position, b.stop.position);
                const leftPlane = an.length === 2 ? (k.subset(an[0].position, b.start.position).wedge(k2.subset(an[1].position, b.start.position))) : k.subset(an[0].position, b.start.position).wedge(kb);
                const rightPlane = bn.length === 2 ? (k.subset(bn[0].position, b.stop.position).wedge(k2.subset(bn[1].position, b.stop.position))) : k.subset(bn[0].position, b.stop.position).wedge(kb);
                leftPlane.norms();
                rightPlane.norms();
                if (leftPlane.dot(rightPlane) < 0) {
                    rightPlane.negs();
                }
                const torque = leftPlane.cross(rightPlane);
                let step = 40 * bn.length;
                for (const pa of an) {
                    k.dotbset(k2.subset(pa.position, b.start.position).norms(), torque);
                    pa.force.addmulfs(k, -step);
                    b.start.force.addmulfs(k, step);
                }
                step = 40 * an.length;
                for (const pb of bn) {
                    k.dotbset(k2.subset(pb.position, b.stop.position).norms(), torque);
                    pb.force.addmulfs(k, step);
                    b.stop.force.addmulfs(k, -step);
                }
                // if (torque.norm() > 0.1) {
                //     console.log("sp2-sp2", torque.norm());
                // }
                tesserxel.math.vec4Pool.push(k, k2, kb);
            }
            else if (b.start.piOrbitals === 1 && b.stop.piOrbitals === 1) {
                // cellular sp3 - sp3
                const an = []; // an[]-X=Y-
                const bn = []; // -X=Y-bn[]
                for (let sa of b.start.bonds) {
                    if (sa === b)
                        continue;
                    if (sa.type === 8)
                        continue;
                    an.push((sa.start === b.start) ? sa.stop : sa.start);
                }
                for (let sb of b.stop.bonds) {
                    if (sb === b)
                        continue;
                    if (sb.type === 8)
                        continue;
                    bn.push((sb.start === b.stop) ? sb.stop : sb.start);
                }
                // len 1~3
                if (an.length === 0 || an.length > 3 || bn.length === 0 || bn.length > 3)
                    continue;
                if (an.length === 1 && bn.length === 1)
                    continue;
                const k = tesserxel.math.vec4Pool.pop();
                const k2 = tesserxel.math.vec4Pool.pop();
                const k3 = tesserxel.math.vec4Pool.pop();
                const kb = tesserxel.math.vec4Pool.pop().subset(b.start.position, b.stop.position);
                let step, torque;
                if (an.length > 1 && bn.length > 1) {
                    const leftCell = k.subset(an[0].position, b.start.position).wedge(k2.subset(an[1].position, b.start.position)).wedgev(an.length === 3 ? k3.subset(an[2].position, b.start.position) : kb);
                    const rightCell = k.subset(bn[0].position, b.stop.position).wedge(k2.subset(bn[1].position, b.stop.position)).wedgev(bn.length === 3 ? k3.subset(bn[2].position, b.stop.position) : kb);
                    leftCell.norms();
                    rightCell.norms();
                    if (leftCell.dot(rightCell) < 0) {
                        rightCell.negs();
                    }
                    torque = leftCell.wedge(rightCell);
                    step = -30;
                }
                else if (an.length === 1) {
                    const leftPlane = k.subset(an[0].position, b.start.position).wedge(kb);
                    const rightCell = k.subset(bn[0].position, b.stop.position).wedge(k2.subset(bn[1].position, b.stop.position)).wedgev(bn.length === 3 ? k3.subset(bn[2].position, b.stop.position) : kb);
                    leftPlane.norms().duals();
                    rightCell.norms();
                    const p = rightCell.projb(leftPlane);
                    if (p.dot(rightCell) < 0) {
                        rightCell.negs();
                    }
                    torque = p.wedge(rightCell);
                    step = -30;
                }
                else if (bn.length === 1) {
                    const leftCell = k.subset(an[0].position, b.start.position).wedge(k2.subset(an[1].position, b.start.position)).wedgev(an.length === 3 ? k3.subset(an[2].position, b.start.position) : kb);
                    const rightPlane = k.subset(bn[0].position, b.stop.position).wedge(kb);
                    leftCell.norms();
                    rightPlane.norms().duals();
                    const p = leftCell.projb(rightPlane);
                    if (p.dot(leftCell) < 0) {
                        leftCell.negs();
                    }
                    torque = p.wedge(leftCell);
                    step = 30;
                }
                for (const pa of an) {
                    k.dotbset(k2.subset(pa.position, b.start.position).norms(), torque);
                    pa.force.addmulfs(k, -step * bn.length);
                    b.start.force.addmulfs(k, step * bn.length);
                }
                for (const pb of bn) {
                    k.dotbset(k2.subset(pb.position, b.stop.position).norms(), torque);
                    pb.force.addmulfs(k, step * an.length);
                    b.stop.force.addmulfs(k, -step * an.length);
                }
                // if (torque.norm() > 0.1) {
                //     console.log("sp3-sp3", torque.norm());
                // }
                tesserxel.math.vec4Pool.push(k, k2, k3, kb);
            }
            else {
                if (b.type >> 4 === 2 && b.start.piOrbitals !== b.stop.piOrbitals)
                    accumAtoms.push(b.start.piOrbitals === 1 ? b.start : b.stop);
                if (b.type >> 4 === 3 && b.start.piOrbitals !== b.stop.piOrbitals)
                    accumAtoms.push(b.start.piOrbitals === 2 ? b.start : b.stop);
            }
        }
        let otherSide = [];
        // multiple pi bonds
        for (let start of accumAtoms) {
            if (otherSide.includes(start))
                continue;
            let b = start.bonds.find(e => e.type >> 4 > 1);
            const an = []; // an[]-X=Y-
            for (let sa of start.bonds) {
                if (sa === b)
                    continue;
                if (sa.type === 8)
                    continue;
                an.push((sa.start === start) ? sa.stop : sa.start);
            }
            if (!an[0] || (b.type >> 4 === 2 && !an[1]))
                continue;
            const k = tesserxel.math.vec4Pool.pop();
            const k2 = tesserxel.math.vec4Pool.pop();
            const k3 = tesserxel.math.vec4Pool.pop();
            const kb = tesserxel.math.vec4Pool.pop().subset(start.position, (b.start === start ? b.stop : b.start).position);
            let normal = b.type >> 4 === 2 ?
                k.subset(an[0].position, start.position).wedge(k2.subset(an[1].position, start.position)).wedgev(an.length === 3 ? k3.subset(an[2].position, start.position) : kb).norms()
                :
                    k.subset(an[0].position, start.position).wedge(an.length === 2 ? k3.subset(an[1].position, start.position) : kb).norms().duals();
            this.debug[0] = normal.clone();
            let a = start;
            // a -b-> next -nb-> nnext
            while (true) {
                let next = b.start === a ? b.stop : b.start;
                const bn = next.bonds.filter(e => e.type >> 4 > 1 && e !== b);
                if (bn.length !== 1)
                    break;
                const nb = bn[0];
                const nnext = nb.start === next ? nb.stop : nb.start;
                if (next.piOrbitals === 3 && normal instanceof tesserxel.math.Vec4) {
                    // x=>y#>z
                    normal = normal.wedge(nnext.position.sub(a.position)).duals().norms();
                }
                else if (next.piOrbitals === 2 && normal instanceof tesserxel.math.Vec4) {
                    // x=>y=>z
                    normal = normal.wedgeb(k3.subset(nnext.position, next.position).wedge(k2.subset(next.position, a.position))).norms();
                }
                else if (next.piOrbitals === 3 && normal instanceof tesserxel.math.Bivec) {
                    // x#>y=>z
                    normal = normal.wedgev(nnext.position.sub(a.position)).norms();
                }
                else {
                    break;
                }
                b = nb;
                a = next;
            }
            let next = b.start === a ? b.stop : b.start;
            const bn = next.bonds.filter(e => e.type >> 4 === 1).map(e => e.start === next ? e.stop : e.start);
            if (!bn[0] || (b.type >> 4 === 2 && !bn[1]))
                continue;
            const kbn = tesserxel.math.vec4Pool.pop().subset(next.position, a.position);
            let normal2 = b.type >> 4 === 2 ?
                k.subset(bn[0].position, next.position).wedge(k2.subset(bn[1].position, next.position)).wedgev(bn.length === 3 ? k3.subset(bn[2].position, next.position) : kbn).norms()
                :
                    k.subset(bn[0].position, next.position).wedge(bn.length === 2 ? k3.subset(bn[1].position, next.position) : kbn).norms().duals();
            this.debug[1] = normal.clone();
            this.debug[2] = normal2.clone();
            let step;
            let torque;
            if (normal instanceof tesserxel.math.Vec4 && normal2 instanceof tesserxel.math.Vec4) {
                step = -100;
                if (normal.dot(normal2) < 0)
                    normal2.negs();
                torque = normal.wedge(normal2);
            }
            else if (normal instanceof tesserxel.math.Bivec && normal2 instanceof tesserxel.math.Bivec) {
                step = 100;
                if (normal.dot(normal2) < 0)
                    normal2.negs();
                torque = normal.cross(normal2);
            }
            else {
                step = 0;
                torque = new tesserxel.math.Bivec();
            }
            for (const pa of an) {
                k.dotbset(k2.subset(pa.position, start.position).norms(), torque);
                pa.force.addmulfs(k, -step * bn.length);
                start.force.addmulfs(k, step * bn.length);
            }
            for (const pb of bn) {
                k.dotbset(k2.subset(pb.position, next.position).norms(), torque);
                pb.force.addmulfs(k, step * an.length);
                next.force.addmulfs(k, -step * an.length);
            }
            otherSide.push(next);
            // if (torque.norm() > 0.3) {
            //     console.log(start.name, "-...-", next.name, torque.norm());
            // }
        }
    }
    buildAndAddToScene(scene) {
        const graph = this.graph;
        const molobj = new FOUR.Object();
        for (let a of graph.atoms) {
            if (a.name === "Elc")
                continue;
            const c = getAtomColor(a.name);
            let color = c.match(/rgb\(([0-9\s]+)\,([0-9\s]+)\,([0-9\s]+)\)/);
            let glomeMesh = new FOUR.Mesh(this.atomGeom, new FOUR.PhongMaterial([color[1].trim() / 256, color[2].trim() / 256, color[3].trim() / 256, 10], 50));
            glomeMesh.position = a.position;
            glomeMesh.alwaysUpdateCoord = true;
            const r = this.stickMode ? a.radius * 0.35 : a.radius;
            a.obj = glomeMesh;
            glomeMesh.scale = new tesserxel.math.Vec4(r, r, r, r);
            molobj.add(glomeMesh);
        }
        // for (let i = 0; i < 3; i++) {
        //     const d = this.debug[i] || new tesserxel.math.Vec4(0, 0, 0, 0);
        //     let glomeMesh = new FOUR.Mesh(this.atomGeom, new FOUR.PhongMaterial(
        //         i===0?[0,0,0]:i===1?[0,0,255]:[0,255,255], 50
        //     ));
        //     glomeMesh.position = this.graph.atoms[0].position.clone().addmulfs(d, 80);
        //     glomeMesh.alwaysUpdateCoord = true;
        //     const r = 10;
        //     glomeMesh.scale = new tesserxel.math.Vec4(r, r, r, r);
        //     molobj.add(glomeMesh);
        //     this.debugMesh[i] = glomeMesh;
        // }
        for (let b of graph.bonds) {
            if (b.type === 8 || b.start.name === "Elc" || b.stop.name === "Elc")
                continue;
            const obj = new tesserxel.four.Mesh(this.bondGeom, b.type >> 4 === 4 ? new FOUR.PhongMaterial([0.5, 0.05, 0.9]) : b.type >> 4 === 3 ? new FOUR.PhongMaterial([0.8, 0.3, 0.1]) : b.type >> 4 === 2 ? new FOUR.PhongMaterial([0.1, 0.9, 0.3]) : this.bondMat);
            b.obj = obj;
            molobj.add(obj);
            obj.alwaysUpdateCoord = true;
        }
        for (let i = 0; i < 50; i++)
            this.iterate(0.0001);
        // for (let i = 0; i < 100; i++)this.iterate(0.005);
        // for (let i = 0; i < 200; i++)this.iterate(0.01);
        // for (let i = 0; i < 1000; i++)this.iterate(0.02);
        scene.add(molobj);
        this.molObj = molobj;
    }
    update() {
        for (let i = 0; i < 50; i++)
            this.iterate(this.step);
        if (this.heat) {
            for (let a of this.graph.atoms) {
                if (a.name === "Elc")
                    continue;
                a.position.addmulfs(tesserxel.math.Vec4.rand(), this.heat);
            }
        }
        const v = tesserxel.math.vec4Pool.pop();
        for (let b of this.graph.bonds) {
            if (!b.obj)
                continue;
            const v0 = b.start.position;
            const v1 = b.stop.position;
            b.obj.position.addset(v0, v1).mulfs(0.5);
            b.obj.rotation.setFromLookAt(tesserxel.math.Vec4.w, v.subset(v1, v0));
            b.obj.scale ??= new tesserxel.math.Vec4();
            b.obj.scale.set(1, 1, 1, v.norm());
        }
        tesserxel.math.vec4Pool.push(v);
        // for (let i = 0; i < 3; i++) {
        //     const d = this.debug[i];
        //     const glomeMesh = this.debugMesh[i];
        //     if (i === 0) glomeMesh.position = this.graph.atoms[0].position.clone().addmulfs(d, 80);
        //     if (i === 1) glomeMesh.position = this.graph.atoms[3].position.clone().addmulfs(d, 90);
        //     if (i === 2) glomeMesh.position = this.graph.atoms[3].position.clone().addmulfs(d, 80);
        //     // glomeMesh.alwaysUpdateCoord = true;
        // }
    }
    deleteFromScene(scene) {
        scene.removeChild(this.molObj);
    }
    heat = 0;
    step = 0.04;
    stickMode = true;
    startHeat() {
        this.heat = 10;
        this.step = 0.01;
    }
    stopHeat() {
        this.heat = 0;
        for (let i = 0; i < 10; i++)
            this.iterate(0.01);
        this.step = 0.04;
    }
    changeStickMode() {
        this.stickMode = !this.stickMode;
        for (const a of this.graph.atoms) {
            if (!a.obj)
                continue;
            const r = this.stickMode ? a.radius * 0.35 : a.radius;
            a.obj.scale ??= new tesserxel.math.Vec4;
            a.obj.scale.set(r, r, r, r);
        }
    }
}
async function delay(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
export var molecule;
(function (molecule) {
    async function load() {
        const canvas = document.getElementById("gpu-canvas");
        const app = await tesserxel.four.App.create({ canvas, controllerConfig: { preventDefault: true } });
        let scene = app.scene;
        const atomGeom = new FOUR.GlomeGeometry(1, 1);
        const bondGeom = new tesserxel.four.Geometry(tesserxel.mesh.tetra.spherinderSide(10, 10, 2, 2, 1));
        const bondMat = new FOUR.PhongMaterial([0.93, 0.87, 0.8]);
        app.renderer.core.setDisplayConfig({ opacity: 50, screenBackgroundColor: [1, 1, 1, 1], sectionStereoEyeOffset: 40 });
        scene.setBackgroudColor([1, 1, 1, 0.0]);
        scene.add(new FOUR.AmbientLight(0.3));
        let dirLight = new FOUR.DirectionalLight([0.9, 0.8, 0.8], new tesserxel.math.Vec4(1, -1, 0, -1).norms());
        scene.add(dirLight);
        let dirLight2 = new FOUR.DirectionalLight([0.8, 0.8, 0.9], new tesserxel.math.Vec4(0, 1, 1, 1).norms());
        scene.add(dirLight2);
        let dirLight3 = new FOUR.DirectionalLight([0.7, 0.6, 0.5], new tesserxel.math.Vec4(-1, 0, -1, 0).norms());
        scene.add(dirLight3);
        let camera = app.camera;
        camera.near = 5;
        camera.far = 1000;
        camera.fov = 80;
        scene.add(camera);
        // move camera a little back to see polytope at origin
        // note: w axis is pointed to back direction (like z axis in 3D)
        camera.position.w = 400;
        const graph = getStructureInfo("FnCCCCCO");
        let builder = new StructBuilder(graph, atomGeom, bondGeom, bondMat);
        const trackballCtrl = new tesserxel.util.ctrl.TrackBallController(camera, true);
        const guiCtrl = new GUICtrl(builder);
        app.controllerRegistry.add(trackballCtrl);
        app.controllerRegistry.add(guiCtrl);
        app.controllerRegistry.add(builder);
        builder.buildAndAddToScene(scene);
        const gui = new GUI();
        gui.build().rebuildMol = (smiles) => {
            builder.deleteFromScene(scene);
            app.controllerRegistry.remove(builder);
            builder = new StructBuilder(getStructureInfo(smiles), atomGeom, bondGeom, bondMat);
            app.controllerRegistry.add(builder);
            builder.buildAndAddToScene(scene);
            guiCtrl.builder = builder;
        };
        app.run(() => {
            if (app.controllerRegistry.states.isKeyHold("KeyH")) {
                builder.startHeat();
            }
            else {
                if (builder.heat)
                    builder.stopHeat();
            }
        });
        gui.btnRnd.click();
    }
    molecule.load = load;
})(molecule || (molecule = {}));
const urlp = new URLSearchParams(window.location.search.slice(1));
const lang = urlp.get("lang") ?? (navigator.languages.join(",").includes("zh") ? "zh" : "en");
class GUICtrl {
    builder;
    constructor(builder) {
        this.builder = builder;
    }
    update(state) {
        if (state.isKeyHold(".KeyR")) {
            this.builder.changeStickMode();
        }
    }
}
class GUI {
    canvas;
    input;
    rebuildMol;
    window;
    btnRnd;
    onchange() {
        try {
            drawStructure(this.input.value, this.canvas);
            this.input.style.backgroundColor = "rgba(255,255,255,0)";
            this.rebuildMol(this.input.value);
            this.btnRnd.innerText = (lang === "zh" ? "手气不错" : "Good Luck");
        }
        catch (e) {
            this.input.style.backgroundColor = 'rgba(255,0,0,0.2)';
        }
    }
    build() {
        const iframe = document.createElement('div');
        const topBtnbar = document.createElement('div');
        iframe.appendChild(topBtnbar);
        const btnRnd = document.createElement('button');
        const btnOpen = document.createElement('button');
        this.btnRnd = btnRnd;
        btnOpen.innerText = lang === "zh" ? "打开分子库" : "Open Molecule Browser";
        btnRnd.innerText = lang === "zh" ? "手气不错" : "Good Luck";
        window.name = "TsxChem4D";
        window["changeFromWindow"] = (n) => {
            this.onchange();
            if (n)
                btnRnd.innerText = (lang === "zh" ? "分子库" : "Molecule Library") + " : " + n;
        };
        btnOpen.addEventListener('click', () => {
            if (!this.window || this.window.closed) {
                if (window.parent.opener && !window.parent.opener.closed) {
                    this.window = window.parent.opener;
                    window.open("javascript:void(0);", "Chem4D");
                }
                else {
                    this.window = window.open(window.location.host.startsWith("127.0.0.1") ? "/ccahgaolo/chem4d/" : "/Chem4D/");
                }
            }
            else {
                window.open("javascript:void(0);", "Chem4D");
            }
            waitToLoad();
        });
        const waitToLoad = async () => {
            while (!this.window["changeFromWindow"]) {
                await delay(1000);
                console.log("wait");
            }
            console.log("wait finished, okay！");
            this.window["changeFromWindow"](this.input.value, btnRnd.innerText.split(" : ")[1]);
        };
        btnRnd.addEventListener('click', () => {
            const data = goodLuck();
            this.input.value = data[1];
            this.onchange();
            btnRnd.innerText += " : " + data[2];
        });
        btnRnd.style.backgroundColor = "yellow";
        btnOpen.style.border = "0";
        btnRnd.style.border = "0";
        topBtnbar.appendChild(btnOpen);
        topBtnbar.appendChild(btnRnd);
        topBtnbar.style.position = "absolute";
        topBtnbar.style.zIndex = "200";
        this.input = document.createElement('input');
        this.input.id = "smiles-input";
        this.input.style.border = "0";
        iframe.appendChild(this.input);
        this.input.style.width = "98%";
        this.input.style.backgroundColor = "rgba(255,255,255,0)";
        this.input.style.position = "absolute";
        this.input.style.bottom = "3px";
        this.input.style.left = "0px";
        this.input.style.zIndex = "120";
        const self = this;
        this.input.addEventListener('change', function (e) {
            self.onchange();
        });
        const canvas = document.createElement('canvas');
        this.canvas = canvas;
        canvas.style.maxWidth = "100%";
        canvas.style.maxHeight = "100%";
        canvas.style.position = 'absolute';
        canvas.style.top = '50%';
        canvas.style.left = '50%';
        canvas.style.transform = 'translate(-50%, -50%)';
        canvas.style.zIndex = "10";
        iframe.style.backgroundColor = 'rgba(200,200,255,0.1)';
        iframe.appendChild(canvas);
        iframe.id = 'float-iframe';
        iframe.style.overflow = 'hidden';
        iframe.style.position = 'fixed';
        iframe.style.right = '20px';
        iframe.style.bottom = '20px';
        iframe.style.width = '300px';
        iframe.style.height = '300px';
        iframe.style.border = '1px solid #ccc';
        iframe.style.borderRadius = '5px';
        iframe.style.boxShadow = '0 0 5px rgba(0, 0, 0, 0.3)';
        iframe.style.zIndex = '9999';
        // 创建用于调整大小的元素
        const resizer = document.createElement('div');
        resizer.classList.add('resizer', 'bottom-right');
        resizer.style.width = '10px';
        resizer.style.height = '10px';
        resizer.style.backgroundColor = '#ccc';
        resizer.style.position = 'absolute';
        resizer.style.right = '0';
        resizer.style.bottom = '0';
        resizer.style.cursor = 'se-resize';
        resizer.style.zIndex = '150';
        document.body.appendChild(iframe);
        iframe.appendChild(resizer);
        let isDragging = false;
        let isResizing = false;
        let startX, startY;
        let initialWidth, initialHeight;
        // 拖动功能
        iframe.addEventListener('mousedown', (e) => {
            isDragging = true;
            const rect = iframe.getBoundingClientRect();
            startX = e.clientX - rect.left;
            startY = e.clientY - rect.top;
            console.log("down");
        });
        document.addEventListener('mouseup', () => {
            isResizing = false;
            isDragging = false;
        });
        iframe.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const x = e.clientX - startX;
                const y = e.clientY - startY;
                iframe.style.left = x + 'px';
                iframe.style.top = y + 'px';
            }
            if (isResizing) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                const newWidth = initialWidth + dx;
                const newHeight = initialHeight + dy;
                iframe.style.width = newWidth + 'px';
                iframe.style.height = newHeight + 'px';
            }
        });
        // 改变大小功能
        resizer.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            isDragging = false;
            isResizing = true;
            const rect = iframe.getBoundingClientRect();
            initialWidth = rect.width;
            initialHeight = rect.height;
            startX = e.clientX;
            startY = e.clientY;
        });
        return this;
    }
}
//# sourceMappingURL=molecule.js.map