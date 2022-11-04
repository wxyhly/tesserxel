import { SliceRenderer, TetraSlicePipeline } from "../render/slice";
import { GPU } from "../render/gpu";
import { AmbientLight, DirectionalLight, PointLight, SpotLight, _initLightShader, _updateWorldLight } from "./light";
import { Camera, Mesh, Object, Scene } from "./scene";
import { Material } from "./material";
import { Vec3 } from "../math/algebra/vec3";
import { Vec4 } from "../math/algebra/vec4";
import { Plane } from "../math/geometry/primitive";
/** threejs like 4D lib */
export class Renderer {
    core: SliceRenderer;
    gpu: GPU;
    canvas: HTMLCanvasElement;
    pipelines: { [label: string]: TetraSlicePipeline | "compiling" } = {};
    jsBuffer = new Float32Array(1024);
    uCamMatBuffer: GPUBuffer; // contain inv and uninv affineMat
    uWorldLightBuffer: GPUBuffer;
    lightShaderInfomation = _initLightShader();
    private cameraInScene: boolean;
    private safeTetraNumInOnePass: number;
    private tetraNumOccupancyRatio: number = 0.08;
    private maxTetraNumInOnePass: number;
    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.core = new SliceRenderer();
    }
    setBackgroudColor(color: GPUColor) {
        this.core.setScreenClearColor(color);
    }
    async init() {
        this.gpu = await new GPU().init();
        if (!this.gpu) {
            console.error("No availiable GPU device found. Please check whether WebGPU is enabled on your browser.");
            return null;
        }
        await this.core.init(this.gpu, this.gpu.getContext(this.canvas));
        this.uCamMatBuffer = this.gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, (4 * 5 * 2) * 4, "uCamMat");
        this.uWorldLightBuffer = this.gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, this.lightShaderInfomation.uWorldLightBufferSize, "uWorldLight");
        this.core.setSize({ width: this.canvas.width * devicePixelRatio, height: this.canvas.height * devicePixelRatio });
        this.safeTetraNumInOnePass = this.core.getSafeTetraNumInOnePass();
        return this;
    }
    // todo: add computePipeLinePool
    fetchPipelineName(identifier: string): string {
        return identifier;
    }
    fetchPipeline(identifier: string): TetraSlicePipeline | "compiling" {
        return this.pipelines[this.fetchPipelineName(identifier)];
    }
    pullPipeline(identifier: string, pipeline: TetraSlicePipeline | "compiling") {
        if (this.pipelines[identifier] && this.pipelines[identifier] !== "compiling")
            console.error("FOUR Renderer: Repetitive material pipeline creation occured.");
        this.pipelines[identifier] = pipeline;
    }
    updateObject(o: Object) {
        for (let c of o.child) {
            if (c.alwaysUpdateCoord) {
                c.needsUpdateCoord = true;
            }
            if (c.needsUpdateCoord || o.needsUpdateCoord) {
                c.worldCoord.setFromObj4(c).mulsl(o.worldCoord);

                c.needsUpdateCoord = true;
            }
            this.updateObject(c);
            c.needsUpdateCoord = false;
        }
        if (o instanceof Mesh) {
            this.updateMesh(o);
        } else if (o instanceof AmbientLight) {
            this.ambientLightDensity.adds(o.density);
        } else if (o instanceof PointLight) {
            this.pointLights.push(o);
        } else if (o instanceof SpotLight) {
            if (o.needsUpdateCoord) {
                o.worldDirection.mulmatvset(o.worldCoord.mat, o.direction);
            }
            this.spotLights.push(o);
        } else if (o instanceof DirectionalLight) {
            if (o.needsUpdateCoord) {
                o.worldDirection.mulmatvset(o.worldCoord.mat, o.direction);
            }
            this.directionalLights.push(o);
        } else if (o.needsUpdateCoord && o === this.activeCamera) {
            this.cameraInScene = true;
            o.worldCoord.inv().writeBuffer(this.jsBuffer);
            o.worldCoord.writeBuffer(this.jsBuffer, 20);
            this.gpu.device.queue.writeBuffer(this.uCamMatBuffer, 0, this.jsBuffer, 0, 40);
        }
    }
    // this may fail to add to drawlist if pipeline creation is not finished yet
    addToDrawList(m: Mesh) {
        let pipeline = this.fetchPipeline(m.material.identifier);
        // attention: this is an async function, rendering will be in the future tick
        if (!pipeline) { m.material.bindGroup = null; m.bindGroup = null; m.material.compile(this); return; }
        if (pipeline === "compiling") return;
        // if this material can use other's pipeline, it hasn't compiled but also need some initiations
        if (!m.material.compiled) { m.material.init(this); }
        let groupName = m.material.uuid;
        let group = m.material.declUniformLocation ? 1 : 0;
        if (!this.drawList[groupName]) {
            let bindGroup = this.core.createFragmentShaderBindGroup(pipeline, group, [this.uWorldLightBuffer], "WorldLightGroup");
            this.drawList[groupName] = {
                pipeline: pipeline, meshes: [],
                bindGroup: { group, binding: bindGroup }, tetraCount: 0
            };
        }
        let list = this.drawList[groupName];
        // while (list.next) {
        //     list = this.drawList[list.next]; //go to the end of chain table
        // }
        // list.tetraCount += m.geometry.jsBuffer.tetraCount;
        list.meshes.push(m);
        // if (list.tetraCount > this.maxTetraNumInOnePass) {
        //     // append a new node to chain, wait for accept new objects next time
        //     groupName = list.next = math.generateUUID();
        //     this.drawList[groupName] = {
        //         pipeline: pipeline, meshes: [],
        //         bindGroup: list.bindGroup, tetraCount: 0
        //     };
        // }
        if (!m.bindGroup) {
            let buffers = [
                ...m.material.fetchBuffer(m.geometry),
                m.uObjMatBuffer,
                this.uCamMatBuffer
            ];
            m.bindGroup = this.core.createVertexShaderBindGroup(pipeline, 1, buffers, m.material.identifier);
        }
        if (!m.material.bindGroup) {
            m.material.createBindGroup(this, pipeline);
        }
        m.material.update(this);
    }

    async compileMaterials(mats: Iterable<Material> | Scene) {
        let promises = [];
        if (mats instanceof Scene) {
            addMaterialInObject(this, promises, mats.child);
        } else {
            for (let m of mats) {
                promises.push(m.compile(this));
            }
        }
        await Promise.all(promises);
        function addMaterialInObject(self: Renderer, promises: Promise<void>[], child: Object[]) {
            for (let m of child) {
                if (m instanceof Mesh) {
                    let pipeline = self.fetchPipeline(m.material.identifier);
                    if (!pipeline) {
                        m.material.bindGroup = null; m.bindGroup = null;
                        promises.push(m.material.compile(self));
                    }
                    if (!m.material.compiled) { m.material.init(self); }
                }
                addMaterialInObject(self, promises, m.child);
            }
        }
    }
    updateMesh(m: Mesh) {
        if (m.needsUpdateCoord) {
            m.worldCoord.writeBuffer(this.jsBuffer, 0);
            m.worldCoord.mat.inv().ts().writeBuffer(this.jsBuffer, 20);
            if (!m.uObjMatBuffer) {
                m.uObjMatBuffer = this.gpu.createBuffer(
                    GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, (20 + 16) * 4, "uObjMatBuffer"
                );
            }
            this.gpu.device.queue.writeBuffer(m.uObjMatBuffer, 0, this.jsBuffer, 0, 20 + 16);
        }
        if (m.geometry.needsUpdate) {
            let g = m.geometry;
            g.needsUpdate = false;
            g.updateOBB();
            if (!g.gpuBuffer) {
                g.gpuBuffer = {};
                let dyn = g.dynamic ? GPUBufferUsage.COPY_DST : 0;
                for (let [label, value] of globalThis.Object.entries(g.jsBuffer)) {
                    if (value instanceof Float32Array) {
                        g.gpuBuffer[label] = this.gpu.createBuffer(
                            GPUBufferUsage.STORAGE | dyn, value, "AttributeBuffer." + label
                        );
                    }
                }
            } else if (g.dynamic) {
                for (let [label, buffer] of globalThis.Object.entries(g.gpuBuffer)) {
                    this.gpu.device.queue.writeBuffer(buffer, 0, g.jsBuffer[label]);
                }
            }
        }
        if (m.visible) this.addToDrawList(m);
    }
    updateScene(scene: Scene) {
        this.core.setWorldClearColor(scene.backGroundColor);
        this.cameraInScene = false;
        this.maxTetraNumInOnePass = this.safeTetraNumInOnePass / this.tetraNumOccupancyRatio;
        for (let c of scene.child) {
            if (c.alwaysUpdateCoord) {
                c.needsUpdateCoord = true;
            }
            if (c.needsUpdateCoord) {
                c.worldCoord.setFromObj4(c);
            }
            this.updateObject(c);
            c.needsUpdateCoord = false;
        }
        if (this.cameraInScene === false) console.error("Target camera is not in the scene. Forget to add it?");
        _updateWorldLight(this);
    }
    ambientLightDensity = new Vec3;
    directionalLights: DirectionalLight[];
    spotLights: SpotLight[];
    pointLights: PointLight[];

    drawList: DrawList;
    activeCamera: Camera;
    setCamera(camera: Camera) {
        if (camera.needsUpdate) {
            this.core.setCameraProjectMatrix(camera);
            camera.needsUpdate = false;
        }
        this.activeCamera = camera;
    }
    computeFrustumRange(range: number[]) {
        return range ? [
            new Vec4(-1, 0, 0, -range[0]).mulmatls(this.activeCamera.worldCoord.mat),
            new Vec4(1, 0, 0, range[1]).mulmatls(this.activeCamera.worldCoord.mat),
            new Vec4(0, -1, 0, -range[2]).mulmatls(this.activeCamera.worldCoord.mat),
            new Vec4(0, 1, 0, range[3]).mulmatls(this.activeCamera.worldCoord.mat),
            new Vec4(0, 0, -1, -range[4]).mulmatls(this.activeCamera.worldCoord.mat),
            new Vec4(0, 0, 1, range[5]).mulmatls(this.activeCamera.worldCoord.mat),
        ] : null;
    }
    private _testWithFrustumData(m: Mesh, data: Vec4[]): boolean {
        if (!data) return true;
        let relP = this.activeCamera.worldCoord.vec.sub(m.worldCoord.vec);
        let obb = m.geometry.obb;
        let matModel = m.worldCoord.mat.t();
        for (let f of data) {
            if (obb.testPlane(new Plane(matModel.mulv(f), f.dot(relP))) === 1) return false;
        }
        return true;
    }
    render(scene: Scene, camera: Camera) {
        this.clearState();
        this.setCamera(camera);
        this.updateScene(scene);
        this.core.render(() => {
            let frustumData = this.computeFrustumRange(this.core.getFrustumRange());
            for (let { pipeline, meshes, bindGroup } of globalThis.Object.values(this.drawList)) {
                if (!meshes.length) continue; // skip empty (may caused by safe tetranum check)
                let tetraState = false;
                let tetraCount = 0;
                let binding = [
                    ...meshes[0].material.bindGroup.map((bg, binding) => ({ group: binding, binding: bg })),
                    bindGroup
                ];
                for (let mesh of meshes) {
                    if (!this._testWithFrustumData(mesh, frustumData)) continue;
                    if (tetraState === false) {
                        this.core.beginTetras(pipeline);
                        tetraCount = 0;
                        tetraState = true;
                    }
                    this.core.sliceTetras(mesh.bindGroup, mesh.geometry.jsBuffer.count);
                    tetraCount += mesh.geometry.jsBuffer.count;
                    if (tetraCount > this.maxTetraNumInOnePass) {
                        this.core.drawTetras(binding);
                        tetraState = false;
                        tetraCount = 0;
                    }
                }
                if (tetraState === true) {
                    this.core.drawTetras(binding);
                }
            }
        });
    }
    setSize(size: GPUExtent3DStrict) {
        if ((size as GPUExtent3DDict).height) {
            this.canvas.width = (size as GPUExtent3DDict).width;
            this.canvas.height = (size as GPUExtent3DDict).height;
        } else {
            this.canvas.width = size[0];
            this.canvas.height = size[1];
        }
        this.core.setSize(size);
    }
    private clearState() {
        this.ambientLightDensity.set();
        this.directionalLights = [];
        this.spotLights = [];
        this.pointLights = [];
        this.drawList = {};
    }
}
interface DrawList {
    [group: string]: {
        pipeline: TetraSlicePipeline,
        meshes: Mesh[],
        bindGroup: { group: number, binding: GPUBindGroup },
        tetraCount: number
        next?: string // if too many objs in drawlist, split into a list table
    }
}