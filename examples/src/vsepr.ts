import * as tesserxel from "../../build/tesserxel.js"

const FOUR = tesserxel.four;

class StructBuilder {
    molObj: tesserxel.four.Object;
    atomGeom: tesserxel.four.Geometry;
    bondGeom: tesserxel.four.Geometry;
    bondMat: tesserxel.four.Material;
    forces: tesserxel.math.Vec4[];
    bondObj: tesserxel.four.Object;
    constructor(rank: number, pair: number, atomGeom: tesserxel.four.Geometry, bondGeom: tesserxel.four.Geometry, bondMat: tesserxel.four.Material) {
        this.atomGeom = atomGeom;
        this.bondGeom = bondGeom;
        this.bondMat = bondMat;
        this.molObj = new tesserxel.four.Object();
        this.bondObj = new tesserxel.four.Object();
        this.forces = [];
        for (let i = 0; i < rank; i++) {
            this.forces.push(new tesserxel.math.Vec4(0, 0, 0, 0));
            const a = new tesserxel.four.Mesh(atomGeom, new FOUR.PhongMaterial([0.01, 0.3, 0.8]));
            a.position = tesserxel.math.Vec4.rand();
            a.scale = new tesserxel.math.Vec4(0.1, 0.1, 0.1, 0.1);
            this.molObj.add(a);
            a.alwaysUpdateCoord = true;
            const b = new tesserxel.four.Mesh(bondGeom, bondMat);
            b.alwaysUpdateCoord = true;
            this.bondObj.add(b);
        }
    }
    buildAndAddToScene(scene: tesserxel.four.Scene) {
        scene.add(this.molObj);
        scene.add(this.bondObj);
    }
    iterate(dt: number) {
        for (const f of this.forces) { f.set(); }
        this.calcForce();
        let i = 0;
        for (let a of this.molObj.child) {
            a.position.addmulfs(this.forces[i++], dt);
            a.position.norms();
        }
    }
    calcEnergy() {
        const k = tesserxel.math.vec4Pool.pop();
        let energy = 0;
        for (let a_id = 0; a_id < this.molObj.child.length; a_id++) {
            const a = this.molObj.child[a_id] as tesserxel.four.Mesh;
            for (let b_id = 0; b_id < this.molObj.child.length; b_id++) {
                if (a_id === b_id) continue;
                const b = this.molObj.child[b_id] as tesserxel.four.Mesh;
                k.subset(a.position, b.position);
                const len = k.norm();
                energy += 1 / (len * len);
            }
        }
        tesserxel.math.vec4Pool.push(k);
        return energy;
    }
    calcForce() {
        const k = tesserxel.math.vec4Pool.pop();
        for (let a_id = 0; a_id < this.molObj.child.length; a_id++) {
            const a = this.molObj.child[a_id] as tesserxel.four.Mesh;
            for (let b_id = 0; b_id < this.molObj.child.length; b_id++) {
                if (a_id === b_id) continue;
                const b = this.molObj.child[b_id] as tesserxel.four.Mesh;
                k.subset(a.position, b.position);
                const len = k.norm();
                if (len < 0.01) k.randset().mulfs(100);
                k.divfs(len * len * len * len * 0.05);
                // if (a.name === b.name && a.name === "Elc") {
                //     k.mulfs(5);
                // }
                this.forces[a_id].adds(k);
                this.forces[b_id].subs(k);
            }
        }
        tesserxel.math.vec4Pool.push(k);
    }

    update() {
        for (let i = 0; i < 100; i++) this.iterate(0.02);
        for (let idx = 0; idx < this.molObj.child.length; idx++) {
            const a = this.molObj.child[idx] as tesserxel.four.Mesh;
            const b = this.bondObj.child[idx] as tesserxel.four.Mesh;
            const v1 = a.position;
            b.position.copy(v1).mulfs(0.5);
            b.rotation.setFromLookAt(tesserxel.math.Vec4.w, v1);
            b.scale ??= new tesserxel.math.Vec4();
            b.scale.set(0.005, 0.005, 0.005, v1.norm());
        }
    }
    deleteFromScene(scene: tesserxel.four.Scene) {
        scene.removeChild(this.molObj);
        scene.removeChild(this.bondObj);
    }
}
class DiamondBuilder {
    molObj: tesserxel.four.Object;
    atomGeom: tesserxel.four.Geometry;
    bondGeom: tesserxel.four.Geometry;
    bondMat: tesserxel.four.Material;
    forces: tesserxel.math.Vec4[];
    bondObj: tesserxel.four.Object;
    constructor(rank: number, pair: number, atomGeom: tesserxel.four.Geometry, bondGeom: tesserxel.four.Geometry, bondMat: tesserxel.four.Material) {
        this.atomGeom = atomGeom;
        this.bondGeom = bondGeom;
        this.bondMat = bondMat;
        this.molObj = new tesserxel.four.Object();
        this.bondObj = new tesserxel.four.Object();
        this.forces = [];
        const base = [
            new tesserxel.math.Vec4(1 / Math.sqrt(10), 1 / Math.sqrt(6), 1 / Math.sqrt(3), 1),
            new tesserxel.math.Vec4(1 / Math.sqrt(10), 1 / Math.sqrt(6), 1 / Math.sqrt(3), -1),
            new tesserxel.math.Vec4(1 / Math.sqrt(10), 1 / Math.sqrt(6), -2 / Math.sqrt(3), 0),
            new tesserxel.math.Vec4(1 / Math.sqrt(10), -Math.sqrt(3 / 2), 0, 0),
            new tesserxel.math.Vec4(-2 * Math.sqrt(2 / 5), 0, 0, 0)
        ];
        for (let a0 = -10; a0 <= 10; a0++) {
            for (let a1 = -10; a1 <= 10; a1++) {
                for (let a2 = -10; a2 <= 10; a2++) {
                    for (let a3 = -10; a3 <= 10; a3++) {
                        if ((a1 + a2 + a3 + a0 + 100) % 5 !== 1) continue;
                        const pos = base[0].mulf(a0).addmulfs(base[1], a1).addmulfs(base[2], a2).addmulfs(base[3], a3);
                        if (pos.normsqr() > 6) continue;
                        const a = new tesserxel.four.Mesh(atomGeom, new FOUR.PhongMaterial([0.01, 0.3, 0.8]));
                        a.position = pos;
                        a.scale = new tesserxel.math.Vec4(0.1, 0.1, 0.1, 0.1);
                        this.molObj.add(a);
                        a.alwaysUpdateCoord = true;

                        for (let j = 0; j < 5; j++) {
                            const b = new tesserxel.four.Mesh(bondGeom,pos.normsqr() < 5?new FOUR.PhongMaterial([0.01, 0.8, 0.2]): bondMat);
                            b.alwaysUpdateCoord = true;
                            const v1 = base[j].clone();
                            b.position.copy(a.position).addmulfs(v1, 0.5);
                            b.rotation.setFromLookAt(tesserxel.math.Vec4.w, v1);
                            b.scale ??= new tesserxel.math.Vec4();
                            b.scale.set(0.005, 0.005, 0.005, v1.norm());
                            if((pos.normsqr() < 5))b.scale.set(0.01, 0.01, 0.01, v1.norm());
                            this.bondObj.add(b);
                        }
                    }
                }
            }
        }

    }
    buildAndAddToScene(scene: tesserxel.four.Scene) {
        scene.add(this.molObj);
        scene.add(this.bondObj);
    }
    deleteFromScene(scene: tesserxel.four.Scene) {
        scene.removeChild(this.molObj);
        scene.removeChild(this.bondObj);
    }
}
export namespace hyperdiamond {
    export async function load() {
        const atomGeom = new FOUR.GlomeGeometry(1, 1);
        const bondGeom = new tesserxel.four.Geometry(tesserxel.mesh.tetra.spherinderSide(10, 10, 1, 1, 1));
        const bondMat = new FOUR.PhongMaterial([0.93, 0.87, 0.8]);

        const canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
        let renderer = (await new FOUR.Renderer(canvas).init()).autoSetSize();
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
        camera.near = 0.02;
        camera.far = 5;
        camera.fov = 80;
        scene.add(camera);
        // move camera a little back to see polytope at origin
        // note: w axis is pointed to back direction (like z axis in 3D)
        camera.position.w = 2;

        let builder = new DiamondBuilder(16, 0, atomGeom, bondGeom, bondMat);
        builder.buildAndAddToScene(scene);
        let retinaController = new tesserxel.util.ctrl.RetinaController(renderer.core);
        const trackballCtrl = new tesserxel.util.ctrl.TrackBallController(camera, true);
        let controllerRegistry = new tesserxel.util.ctrl.ControllerRegistry(canvas, [trackballCtrl, retinaController], { preventDefault: true });
        function run() {
            controllerRegistry.update();
            renderer.render(scene, camera);
            window.requestAnimationFrame(run);
        }
        run();
    }
}
export namespace vsepr {

    export async function load() {

        const atomGeom = new FOUR.GlomeGeometry(1, 2);
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
        const central = new FOUR.Mesh(atomGeom, new FOUR.PhongMaterial([0.8, 0.0, 0.0]));
        central.scale = new tesserxel.math.Vec4(0.3, 0.3, 0.3, 0.3);
        scene.add(central);
        let camera = new FOUR.Camera();
        camera.near = 0.02;
        camera.far = 5;
        camera.fov = 80;
        scene.add(camera);
        // move camera a little back to see polytope at origin
        // note: w axis is pointed to back direction (like z axis in 3D)
        camera.position.w = 2;

        let builder = new StructBuilder(16, 0, atomGeom, bondGeom, bondMat);
        builder.buildAndAddToScene(scene);
        let retinaController = new tesserxel.util.ctrl.RetinaController(renderer.core);
        const trackballCtrl = new tesserxel.util.ctrl.TrackBallController(camera, true);
        let controllerRegistry = new tesserxel.util.ctrl.ControllerRegistry(canvas, [trackballCtrl, retinaController], { preventDefault: true });
        function setSize() {
            let width = window.innerWidth * window.devicePixelRatio;
            let height = window.innerHeight * window.devicePixelRatio;
            renderer.setSize({ width, height });
        }
        setSize();
        window.addEventListener("resize", setSize);
        function run() {
            controllerRegistry.update();
            builder.update();
            gui.setEnergy(builder.calcEnergy());
            renderer.render(scene, camera);
            window.requestAnimationFrame(run);
        }
        const gui = new GUI();
        gui.rebuildMol = (rank: number) => {
            builder.deleteFromScene(scene);
            builder = new StructBuilder(rank, 0, atomGeom, bondGeom, bondMat);
            builder.buildAndAddToScene(scene);
        }
        gui.build();
        run();
    }
}
const urlp = new URLSearchParams(window.location.search.slice(1));
const lang = urlp.get("lang") ?? (navigator.languages.join(",").includes("zh") ? "zh" : "en");

class GUI {
    input: HTMLInputElement;
    rebuildMol: (rank: number) => void;
    window: WindowProxy;
    text: HTMLSpanElement;
    setEnergy(energy: number) {
        this.text.innerText = (lang === "zh" ? "势能：" : "Energy: ") + energy.toFixed(5);
    }
    build() {
        const iframe = document.createElement('div');
        const topBtnbar = document.createElement('div');
        iframe.appendChild(topBtnbar);
        iframe.style.backgroundColor = 'rgba(200,200,255,0.1)';
        iframe.id = 'float-iframe';
        iframe.style.overflowX = 'hidden';
        iframe.style.position = 'fixed';
        iframe.style.right = '20px';
        iframe.style.bottom = '20px';
        iframe.style.width = '80px';
        iframe.style.height = 'fit-content';
        iframe.style.border = '1px solid #ccc';
        iframe.style.borderRadius = '5px';
        iframe.style.boxShadow = '0 0 5px rgba(0, 0, 0, 0.3)';
        iframe.style.zIndex = '9999';
        const span = document.createElement('span');
        span.innerText = "VSEPR";
        span.style.cursor = 'move';
        this.text = span;
        iframe.appendChild(span);
        const table = document.createElement('table');
        const divTable = document.createElement('div');
        divTable.className = "divtable";
        for (let i = 1; i <= 20; i++) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.innerText = i.toString();
            tr.appendChild(td);
            table.appendChild(tr);
        }
        iframe.appendChild(divTable);
        divTable.appendChild(table);
        const css = document.createElement("style"); css.innerHTML = `
            td.clickable{
                background-color: green;
                cursor: pointer;
            }
            td.selected{
                background-color: cyan;
            }
            .divtable{
                height: 280px;
                overflow-y: scroll; 
            }
            div td{
                width: 20px;
                height: 20px;
                border: 1px solid grey;
            }
            `;
        document.head.appendChild(css);
        const tds = table.querySelectorAll("td");
        for (let k = 0; k < tds.length; k++) {
            tds[k].onclick = () => {
                table.querySelectorAll("td").forEach(e => e.classList.remove("selected"));
                tds[k].classList.add("selected");
                this.rebuildMol(k + 1);
            }
            tds[k].classList.add("clickable");
        }
        document.body.appendChild(iframe);
        tds[1 + Math.round(Math.random() * 12)].click();

        let isDragging = false;
        let isResizing = false;
        let startX: number, startY: number;
        let initialWidth: number, initialHeight: number;

        // 拖动功能
        span.addEventListener('mousedown', (e) => {
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

        return this;
    }

}