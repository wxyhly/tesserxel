/** threejs like 4D lib */
namespace tesserxel {
    export namespace four {
        class Renderer {
            core: renderer.SliceRenderer;
            gpu: renderer.GPU;
            canvas: HTMLCanvasElement;
            pipelines: { [label: string]: renderer.TetraSlicePipeline }
            constructor(canvas: HTMLCanvasElement) {
                this.canvas = canvas;
                this.core = new renderer.SliceRenderer();
            }
            async init() {
                this.gpu = await renderer.createGPU();
                await this.core.init(this.gpu, this.gpu.getContext(this.canvas));
            }
            updateMesh(m: Mesh) {
                m.needsUpdate = false;
                if (m.geometry.needsUpdate) {
                    let g = m.geometry;
                    g.needsUpdate = false;
                    if (!g.gpuBuffer) {
                        for (let [label, value] of globalThis.Object.entries(g.jsBuffer)) {
                            if (value instanceof Float32Array) {
                                g.gpuBuffer[label] = this.gpu.createBuffer(
                                    GPUBufferUsage.STORAGE, value, label
                                );
                            }
                        }
                    } else {
                        for (let [label, buffer] of globalThis.Object.entries(g.gpuBuffer)) {
                            this.gpu.device.queue.writeBuffer(buffer, 0, g.jsBuffer[label]);
                        }
                    }
                }
            }
            updateScene(scene: Scene) {
                for (let c of scene.child) {
                    if (!c.needsUpdate) return;
                    if (c instanceof Mesh) {
                        this.updateMesh(c);
                    }
                }
            }
            render(scene: Scene) {
                this.updateScene(scene);

            }
        }
        class Object extends math.Obj4 {
            child: Object[];
            worldCoord: math.Obj4;
            needsUpdate = true;
            add(obj: Object) {
                this.child.push(obj);
            }
        }
        class Scene {
            child: Object[];
            add(obj: Object) {
                this.child.push(obj);
            }
        }
        class Geometry {
            jsBuffer: mesh.TetraMesh;
            gpuBuffer: { [name: string]: GPUBuffer };
            needsUpdate = true;
            constructor(data: mesh.TetraMesh) {
                this.jsBuffer = data;
            }
        }
        class Mesh extends Object {
            geometry: Geometry;
            material: Material;
        }
        class Material {
            cullFace: GPUCullMode;
            needsUpdate = true;
            identifier: string;
            constructor(identifier: string){
                this.identifier = identifier;
            }
            gpuUniformBuffer: { [name: string]: GPUBuffer };
            protected code: string;
        }
        class BasicMaterial extends Material {
            color: math.Vec3;
            constructor(color: math.Vec3) {
                super("BasicMaterial");
                this.color = color;
            }
        }
        class PhoneMaterial extends Material {
            color: math.Vec3;
            specular: number;
            constructor(color: math.Vec3, specular: number) {
                super("PhoneMaterial");
                this.color = color;
                this.specular = specular;
            }
        }
    }
}