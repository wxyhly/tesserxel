import * as tesserxel from "../../build/tesserxel.js"

// @ts-ignore
// import { getStructureInfo, getAtomColor, getAtomRadius, drawStructure, goodLuck } from "/ccahgaolo/chem4d/js/api.js"
// @ts-ignore
import { getStructureInfo, getAtomColor, getAtomRadius, drawStructure, goodLuck } from "https://wxyhly.github.io/Chem4D/js/api.js"

const FOUR = tesserxel.four;


interface Coord {
    x: number, y: number
}
interface AtomNode {
    name: string;
    bonds: BondNode[];
    position: tesserxel.math.Vec4;
    force: tesserxel.math.Vec4;
    radius: number;
    piOrbitals: number;
}
interface BondNode {
    start: AtomNode;
    stop: AtomNode;
    type: number;
    obj: tesserxel.four.Object;
}
interface Graph {
    atoms: AtomNode[];
    bonds: BondNode[];
    rings: AtomNode[][];
    ringGroup: [AtomNode[], number[]][];
}
const idealBondAngle = [Math.acos(-1 / 4), Math.acos(-1 / 3), Math.acos(-1 / 2), Math.acos(-1)];
class StructBuilder {
    graph: Graph;
    molObj: tesserxel.four.Object;
    atomGeom: tesserxel.four.Geometry;
    bondGeom: tesserxel.four.Geometry;
    bondMat: tesserxel.four.Material;
    constructor(g: Graph, atomGeom: tesserxel.four.Geometry, bondGeom: tesserxel.four.Geometry, bondMat: tesserxel.four.Material) {
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
    iterate(dt: number) {
        for (let a of this.graph.atoms) { a.force.set(); }
        this.calcForce();
        for (let a of this.graph.atoms) { a.position.addmulfs(a.force, dt); }
    }
    calcForce() {
        const k = tesserxel.math.vec4Pool.pop();
        for (let a of this.graph.atoms) {
            const neighbors: AtomNode[] = [];
            // bond linear strench
            for (let b of a.bonds) {
                const tier = (b.start === a) ? b.stop : b.start;
                if (b.type !== 8) neighbors.push(tier);
                const len = k.subset(a.position, tier.position).norm();
                k.mulfs(5 * (len - (a.radius + tier.radius) * (b.type === 8 ? 1.2 : 0.7)) / len);
                a.force.subs(k);
                tier.force.adds(k);
            }
            // bond angular strench
            for (let b1 of neighbors) {
                for (let b2 of neighbors) {
                    if (b1 === b2) continue;
                    const k1 = k.subset(b1.position, a.position).norms();
                    const k2 = tesserxel.math.vec4Pool.pop().subset(b2.position, a.position).norms();
                    let f1: tesserxel.math.Vec4, f2: tesserxel.math.Vec4;
                    if (a.piOrbitals === 3) {
                        const plane = k1.wedge(k2).mulfs(30);
                        f1 = k1.dotbsr(plane).negs();
                        f2 = k2.dotbsr(plane);
                    } else {
                        const deltaAngle = (idealBondAngle[a.piOrbitals] ? Math.max(Math.min((idealBondAngle[a.piOrbitals] - Math.acos(k1.dot(k2))), Math.PI / 4), -Math.PI / 4) : -0.2) * 30;
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
                if (a === b || neighbors.includes(b)) continue;
                const coarseLen = k.subset(a.position, b.position).norminf();
                // if (coarseLen > (a.radius + b.radius) * 5) continue;
                k.subset(a.position, b.position);
                const len = k.norm();
                // if (len > (a.radius + b.radius) * 5) continue;
                if (len < 1) k.randset().mulfs(100);
                k.divfs(len * len * 0.05);
                // k.divfs(-len * len * len / 50);
                a.force.adds(k);
                b.force.subs(k);
            }
        }
        for (let b of this.graph.bonds) {
            if (b.type >> 4 === 3) {
                // ignore -X#Y  X#Y  X#Y-
                if (!b.start.bonds.length || !b.stop.bonds.length) continue;
                const an: AtomNode[] = []; // an[]-X#Y-
                const bn: AtomNode[] = []; // -X#Y-bn[]
                for (let sa of b.start.bonds) {
                    if (sa === b) continue;
                    if (sa.type === 8) continue;
                    an.push((sa.start === b.start) ? sa.stop : sa.start);
                }
                for (let sb of b.stop.bonds) {
                    if (sb === b) continue;
                    if (sb.type === 8) continue;
                    bn.push((sb.start === b.stop) ? sb.stop : sb.start);
                }
                if (an.length === 0 || an.length > 2 || bn.length == 0 || bn.length > 2) continue;
                const k = tesserxel.math.vec4Pool.pop();
                const k2 = tesserxel.math.vec4Pool.pop();
                const kb = tesserxel.math.vec4Pool.pop().subset(b.start.position, b.stop.position);
                const leftPlane = an.length === 2 ? (k.subset(an[0].position, b.start.position).wedge(k2.subset(an[1].position, b.start.position))) : k.subset(an[0].position, b.start.position).wedge(kb);
                const rightPlane = bn.length === 2 ? (k.subset(bn[0].position, b.stop.position).wedge(k2.subset(bn[1].position, b.stop.position))) : k.subset(bn[0].position, b.stop.position).wedge(kb);
                // if () leftPlane.subs(k.subset(an[1].position, b.start.position).wedge(kb));
                // if (bn.length === 2) rightPlane.subs(k.subset(bn[1].position, b.stop.position).wedge(kb));
                leftPlane.norms();
                rightPlane.norms();
                if (leftPlane.dot(rightPlane) < 0) {
                    rightPlane.negs();
                }
                const torque = leftPlane.cross(rightPlane);
                const step = 3;
                for (const pa of an) {
                    k.dotbset(k2.subset(pa.position, b.start.position), torque);
                    pa.force.addmulfs(k, -step);
                    b.start.force.addmulfs(k, step);
                }
                for (const pb of bn) {
                    k.dotbset(k2.subset(pb.position, b.stop.position), torque);
                    pb.force.addmulfs(k, step);
                    b.stop.force.addmulfs(k, -step);

                }
            }
        }
        tesserxel.math.vec4Pool.push(k);
    }
    buildAndAddToScene(scene: tesserxel.four.Scene) {
        const graph = this.graph;
        const molobj = new FOUR.Object();
        for (let a of graph.atoms) {
            const c = getAtomColor(a.name);
            let color = c.match(/rgb\(([0-9\s]+)\,([0-9\s]+)\,([0-9\s]+)\)/);
            let glomeMesh = new FOUR.Mesh(this.atomGeom, new FOUR.PhongMaterial(
                [color[1].trim() / 256, color[2].trim() / 256, color[3].trim() / 256, 10], 50
            ));
            glomeMesh.position = a.position;
            glomeMesh.alwaysUpdateCoord = true;
            const r = a.radius * 0.35;
            glomeMesh.scale = new tesserxel.math.Vec4(r, r, r, r);
            molobj.add(glomeMesh);
        }
        for (let b of graph.bonds) {
            if (b.type >> 4 === 0) continue;
            const obj = new tesserxel.four.Mesh(this.bondGeom, b.type >> 4 === 4 ? new FOUR.PhongMaterial([0.8, 0.05, 0.7]) : b.type >> 4 === 3 ? new FOUR.PhongMaterial([0.8, 0.3, 0.1]) : b.type >> 4 === 2 ? new FOUR.PhongMaterial([0.2, 0.9, 0.1]) : this.bondMat);
            b.obj = obj;
            molobj.add(obj);
            obj.alwaysUpdateCoord = true;
        }
        for (let i = 0; i < 100; i++)this.iterate(0.005);
        for (let i = 0; i < 200; i++)this.iterate(0.001);
        for (let i = 0; i < 1000; i++)this.iterate(0.02);
        scene.add(molobj);
        this.molObj = molobj;
    }
    update() {
        for (let i = 0; i < 50; i++) this.iterate(this.step);
        if (this.heat) {
            for (let a of this.graph.atoms) {
                a.position.addmulfs(tesserxel.math.Vec4.rand(), this.heat);
            }
        }
        const v = tesserxel.math.vec4Pool.pop();
        for (let b of this.graph.bonds) {
            if (b.type >> 4 === 0) continue;
            const v0 = b.start.position; const v1 = b.stop.position;
            b.obj.position.addset(v0, v1).mulfs(0.5);
            b.obj.rotation.setFromLookAt(tesserxel.math.Vec4.w, v.subset(v1, v0));
            b.obj.scale ??= new tesserxel.math.Vec4();
            b.obj.scale.set(1, 1, 1, v.norm());
        }
        tesserxel.math.vec4Pool.push(v);
    }
    deleteFromScene(scene: tesserxel.four.Scene) {
        scene.removeChild(this.molObj);
    }
    heat = 0;
    step = 0.04;
    startHeat() {
        this.heat = 10;
        this.step = 0.01;
    }
    stopHeat() {
        this.heat = 0;
        for (let i = 0; i < 10; i++)this.iterate(0.01);
        this.step = 0.05;
    }
}

export namespace molecule {

    export async function load() {

        const atomGeom = new FOUR.GlomeGeometry(1, 1);
        const bondGeom = new tesserxel.four.Geometry(tesserxel.mesh.tetra.spherinderSide(10, 10, 2, 2, 1));
        const bondMat = new FOUR.PhongMaterial([0.93, 0.87, 0.8]);

        const canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
        let renderer = await new FOUR.Renderer(canvas).init();
        let scene = new FOUR.Scene();
        renderer.core.setDisplayConfig({ opacity: 50, screenBackgroundColor: [1, 1, 1, 1], sectionStereoEyeOffset: 40 });
        scene.setBackgroudColor([1, 1, 1, 0.0]);


        scene.add(new FOUR.AmbientLight(0.3));
        let dirLight = new FOUR.DirectionalLight([0.9, 0.8, 0.8], new tesserxel.math.Vec4(1, -1, 0, -1).norms())
        scene.add(dirLight);
        let dirLight2 = new FOUR.DirectionalLight([0.8, 0.8, 0.9], new tesserxel.math.Vec4(0, 1, 1, 1).norms())
        scene.add(dirLight2);
        let dirLight3 = new FOUR.DirectionalLight([0.7, 0.6, 0.5], new tesserxel.math.Vec4(-1, 0, -1, 0).norms())
        scene.add(dirLight3);
        let camera = new FOUR.Camera();
        camera.near = 5;
        camera.far = 1000;
        camera.fov = 80;
        scene.add(camera);
        // move camera a little back to see polytope at origin
        // note: w axis is pointed to back direction (like z axis in 3D)
        camera.position.w = 400;
        let retinaController = new tesserxel.util.ctrl.RetinaController(renderer.core);
        const trackballCtrl = new tesserxel.util.ctrl.TrackBallController(camera, true);
        let controllerRegistry = new tesserxel.util.ctrl.ControllerRegistry(canvas, [trackballCtrl, retinaController]);
        function setSize() {
            let width = window.innerWidth * window.devicePixelRatio;
            let height = window.innerHeight * window.devicePixelRatio;
            renderer.setSize({ width, height });
        }
        setSize();
        window.addEventListener("resize", setSize);

        const graph = getStructureInfo("C#C") as Graph;
        let builder = new StructBuilder(graph, atomGeom, bondGeom, bondMat);

        function run() {
            controllerRegistry.update();
            if (controllerRegistry.states.isKeyHold("KeyH")) {
                builder.startHeat();
            } else {
                if (builder.heat) builder.stopHeat();
            }
            builder.update();
            renderer.render(scene, camera);
            window.requestAnimationFrame(run);
        }
        builder.buildAndAddToScene(scene);
        const gui = new GUI();
        gui.build().rebuildMol = (smiles) => {
            builder.deleteFromScene(scene);
            builder = new StructBuilder(getStructureInfo(smiles) as Graph, atomGeom, bondGeom, bondMat);
            builder.buildAndAddToScene(scene);
        };
        run();
    }
}
const urlp = new URLSearchParams(window.location.search.slice(1));
const lang = urlp.get("lang") ?? (navigator.languages.join(",").includes("zh") ? "zh" : "en");

class GUI {
    canvas: HTMLCanvasElement;
    input: HTMLInputElement;
    rebuildMol: (smiles: string) => void;
    window: WindowProxy;
    btnRnd: HTMLButtonElement;
    onchange() {
        try {
            drawStructure(this.input.value, this.canvas);
            this.input.style.backgroundColor = "rgba(255,255,255,0)";
            this.rebuildMol(this.input.value);
            this.btnRnd.innerText = (lang === "zh" ? "手气不错" : "Good Luck");
        } catch (e) {
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
        window["changeFromWindow"] = () => {
            this.onchange();
        };
        btnOpen.addEventListener('click', () => {
            if (!this.window || this.window.closed) {
                if (window.parent.opener && !window.parent.opener.closed) {
                    this.window = window.parent.opener;
                    window.open("javascript:void(0);", "Chem4D");
                } else {
                    this.window = window.open(window.location.host.startsWith("127.0.0.1") ? "/ccahgaolo/chem4d/" : "/Chem4D/");
                }
            } else {
                window.open("javascript:void(0);", "Chem4D");
            }
        });
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
        let startX: number, startY: number;
        let initialWidth: number, initialHeight: number;

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

        document.addEventListener('mousemove', (e) => {
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