import { math, four, util, mesh } from "../../build/esm/tesserxel.js"
export namespace backrooms {
    class CarpetTexture extends four.MaterialNode {
        declare output: "color";
        declare input: {
            uvw: four.Vec4OutputNode;
        }
        getCode(r: four.Renderer, root: four.Material, outputToken: string) {
            // Tell root material that CheckerTexture needs deal dependency of vary input uvw
            let { token, code } = this.getInputCode(r, root, outputToken);
            return code + `
                    let ${outputToken}_carpet1 = sin(${token.uvw}.x*40.0)*0.4 + sin(dot(${token.uvw},vec4(64.0,42.0,85.0,53.0)))*0.2;
                    let ${outputToken}_carpet2 = sin(${token.uvw}.z*100.0)*0.4 + sin(dot(${token.uvw},vec4(644.0,422.0,285.0,253.0)))*0.2;
                    let ${outputToken} = mix(vec4f(0.65,0.55,0.0,0.5),vec4f(0.6,0.45,0.15,0.5),${outputToken}_carpet1*0.5+0.5)*0.35 +
                    mix(vec4f(0.6,0.53,0.13,0.5),vec4f(0.3,0.26,0.05,0.5),${outputToken}_carpet2*0.5+0.5)*0.24
                    ;
                    `;
        }
        constructor(uvw?: four.Vec4OutputNode) {
            uvw ??= new four.UVWVec4Input();
            super(`Carpet(${uvw.identifier})`);
            this.input = { uvw };
        }
    }
    export async function load() {

        const scene = new four.Scene();

        const camera = new four.PerspectiveCamera();
        camera.rotatesb(math.Bivec.xw.mulf(2.8));
        camera.position.set(1.4, 0, 1.6, 1.3);
        const materials = {
            wall: new four.LambertMaterial([0.8, 0.7, 0.1]),
            carpet: new four.LambertMaterial(new CarpetTexture(new four.WorldCoordVec4Input)),
            ceil: new four.LambertMaterial(new four.GridTexture(
                [0.2, 0.2, 0.16, 0.6], [0.9, 0.8, 0.7, 0.3], 0.1,
                new four.Vec4TransformNode(new four.WorldCoordVec4Input, new math.Obj4(
                    new math.Vec4(0, 0, 0, 0.5),
                    new math.Bivec(0, 0, 0, 0, math._90).exp(),
                    new math.Vec4(2, 1, 2, 2)
                ))
            ))
        }
        const floorGeom = new four.CubeGeometry(100);
        const ceilGeom = new four.CubeGeometry(100);
        const mapgen = new MapGenerator();
        const floorMesh = new four.Mesh(floorGeom, materials.carpet);
        const ceilMesh = new four.Mesh(ceilGeom, materials.ceil);
        floorMesh.position.y = -1;
        ceilMesh.position.y = 1;
        ceilMesh.rotation.l.negs();
        const wallMesh = mapgen.genPillars(materials.wall);
        scene.add(floorMesh, wallMesh, ceilMesh, camera);
        // scene.add(new four.DirectionalLight([0.1, 0.1, 0.08], new math.Vec4(1, 2, 0.3, 0.2).norms()));
        // scene.add(new four.DirectionalLight([0.02, 0.017, 0.01], new math.Vec4(-1, 2, -0.2, -0.5).norms()));
        scene.add(new four.AmbientLight(0.05));
        const canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
        const app = await four.App.create({
            canvas, camera, scene,
            renderConfig: { posdirLightsNumber: 7 * 2 * 3, spotLightsNumber: 1 },
            controllerConfig: { preventDefault: true, enablePointerLock: true }
        });
        const camController = new util.ctrl.KeepUpController(camera);
        app.controllerRegistry.add(camController);
        app.run();
    }
    class MapGenerator {
        pillarSize1: number = 0.25;
        pillarSize2: number = 1;
        pillarNumbers = new math.Vec3(3, 4, 8);
        pillarGap: number = 3;
        private pillar: four.Geometry;
        private level0Wall: four.Geometry;
        private genPillar() {
            let tesseract = mesh.tetra.tesseract();
            tesseract.count -= 10;
            tesseract.uvw = tesseract.uvw.subarray(0, -10 * 16);
            tesseract.position = tesseract.position.subarray(0, -10 * 16);
            tesseract.normal = tesseract.normal.subarray(0, -10 * 16);
            const roomSize = new math.Vec4(
                (this.pillarNumbers.x - 1) * this.pillarGap / 2,
                1,
                (this.pillarNumbers.y - 1) * this.pillarGap / 2,
                (this.pillarNumbers.z - 1) * this.pillarGap / 2,
            );
            let wall = tesseract.clone().applyObj4(
                new math.Obj4(new math.Vec4(roomSize.x, 0, roomSize.z, roomSize.w), new math.Rotor(), roomSize)
            ).inverseNormal();

            wall.count -= 10;
            wall.uvw = wall.uvw.subarray(0, -10 * 16);
            wall.position = wall.position.subarray(0, -10 * 16);
            wall.normal = wall.normal.subarray(0, -10 * 16);
            let zw = tesseract.clone().applyObj4(new math.Obj4(new math.Vec4(), new math.Rotor(), new math.Vec4(
                this.pillarSize1,
                1,
                this.pillarSize2,
                this.pillarSize2
            )));
            let xw = tesseract.clone().applyObj4(new math.Obj4(new math.Vec4(), new math.Rotor(), new math.Vec4(
                this.pillarSize2,
                1,
                this.pillarSize1,
                this.pillarSize2
            )));
            let xz = tesseract.clone().applyObj4(new math.Obj4(new math.Vec4(), new math.Rotor(), new math.Vec4(
                this.pillarSize2,
                1,
                this.pillarSize2,
                this.pillarSize1
            )));
            this.level0Wall = new four.Geometry(wall);
            this.pillar = new four.Geometry(mesh.tetra.concat([xw, zw, xz]));
            return this.pillar;
        }
        genPillars(material: four.Material) {
            let x = this.pillarNumbers.x;
            let z = this.pillarNumbers.y;
            let w = this.pillarNumbers.z;
            this.genPillar();
            let obj = new four.Object();
            for (let a = 0; a < x; a++) {
                for (let b = 0; b < z; b++) {
                    for (let c = 0; c < w; c++) {
                        let mesh = new four.Mesh(this.pillar, material);
                        mesh.position.set(a, 0, b, c).mulfs(this.pillarGap);
                        obj.add(mesh);
                    }
                }
            }
            obj.add(new four.Mesh(this.level0Wall, material));
            for (let a = 1; a < x; a++) {
                for (let b = 1; b < z; b++) {
                    for (let c = 1; c < w; c++) {
                        let l1 = new four.PointLight([3, 3, 3]);
                        l1.position.set(-1.5 + this.pillarGap * a, 0.9, -1.5 + this.pillarGap * b, -1.5 + this.pillarGap * c);
                        obj.add(l1);
                    }
                }
            }
            return obj;
        }
    }

}