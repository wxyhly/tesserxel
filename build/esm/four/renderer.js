import '../render/slice/interfaces.js';
import { SliceRenderer } from '../render/slice/renderer.js';
import { GPU } from '../render/gpu.js';
import { _initLightShader, AmbientLight, PointLight, SpotLight, DirectionalLight, _updateWorldLight } from './light.js';
import { Mesh, Scene } from './scene.js';
import { Vec3 } from '../math/algebra/vec3.js';

/** threejs like 4D lib */
class Renderer {
    core;
    gpu;
    canvas;
    pipelines = {};
    jsBuffer = new Float32Array(1024);
    uCamMatBuffer; // contain inv and uninv affineMat
    uWorldLightBuffer;
    lightShaderInfomation = _initLightShader();
    autoSetSizeHandler;
    cameraInScene;
    safeTetraNumInOnePass;
    tetraNumOccupancyRatio = 0.08;
    maxTetraNumInOnePass;
    context;
    constructor(canvas, config) {
        this.canvas = canvas;
        this.lightShaderInfomation = _initLightShader(config);
    }
    setBackgroudColor(color) {
        this.core.setDisplayConfig({ screenBackgroundColor: color });
    }
    async init() {
        this.gpu = await new GPU().init();
        if (!this.gpu) {
            throw "No availiable GPU device found. Please check whether WebGPU is enabled on your browser.";
        }
        this.context = this.gpu.getContext(this.canvas);
        this.core = new SliceRenderer(this.gpu);
        this.uCamMatBuffer = this.gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, (4 * 5 * 2) * 4, "uCamMat");
        this.uWorldLightBuffer = this.gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, this.lightShaderInfomation.uWorldLightBufferSize, "uWorldLight");
        this.core.setDisplayConfig({ canvasSize: { width: this.canvas.width * devicePixelRatio, height: this.canvas.height * devicePixelRatio } });
        this.safeTetraNumInOnePass = this.core.getSafeTetraNumInOnePass();
        await this.core.init();
        return this;
    }
    // todo: add computePipeLinePool
    fetchPipelineName(identifier) {
        return identifier;
    }
    fetchPipeline(identifier) {
        return this.pipelines[this.fetchPipelineName(identifier)];
    }
    pullPipeline(identifier, pipeline) {
        if (this.pipelines[identifier] && this.pipelines[identifier] !== "compiling")
            throw "FOUR Renderer: Repetitive material pipeline creation occured.";
        this.pipelines[identifier] = pipeline;
    }
    updateObject(o) {
        for (let c of o.child) {
            if (c.alwaysUpdateCoord) {
                c.needsUpdateCoord = true;
            }
            if (c.needsUpdateCoord || o.needsUpdateCoord) {
                c.worldCoord.setFromObj4(c).mulsl(o.worldCoord);
                c.needsUpdateCoord = true;
            }
            if (c.visible) {
                this.updateObject(c);
                c.needsUpdateCoord = false;
            }
        }
        if (o instanceof Mesh) {
            this.updateMesh(o);
        }
        else if (o instanceof AmbientLight && o.visible) {
            this.ambientLightDensity.adds(o.density);
        }
        else if (o instanceof PointLight && o.visible) {
            this.pointLights.push(o);
        }
        else if (o instanceof SpotLight && o.visible) {
            if (o.needsUpdateCoord) {
                o.worldDirection.mulmatvset(o.worldCoord.mat, o.direction);
            }
            this.spotLights.push(o);
        }
        else if (o instanceof DirectionalLight && o.visible) {
            if (o.needsUpdateCoord) {
                o.worldDirection.mulmatvset(o.worldCoord.mat, o.direction);
            }
            this.directionalLights.push(o);
        }
        else if (o.needsUpdateCoord && o === this.activeCamera) {
            this.cameraInScene = true;
            o.worldCoord.inv().writeBuffer(this.jsBuffer);
            o.worldCoord.writeBuffer(this.jsBuffer, 20);
            this.gpu.device.queue.writeBuffer(this.uCamMatBuffer, 0, this.jsBuffer, 0, 40);
        }
    }
    // this may fail to add to drawlist if pipeline creation is not finished yet
    addToDrawList(m) {
        let pipeline = this.fetchPipeline(m.material.identifier);
        // attention: this is an async function, rendering will be in the future tick
        if (!pipeline) {
            m.material.bindGroup = null;
            m.bindGroup = null;
            m.material.compile(this);
            return;
        }
        if (pipeline === "compiling")
            return;
        // if this material can use other's pipeline, it hasn't compiled but also need some initiations
        if (!m.material.compiled) {
            m.material.init(this);
        }
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
    async compileMaterials(mats) {
        let promises = [];
        if (mats instanceof Scene) {
            addMaterialInObject(this, promises, mats.child);
        }
        else {
            for (let m of mats) {
                promises.push(m.compile(this));
            }
        }
        await Promise.all(promises);
        function addMaterialInObject(self, promises, child) {
            for (let m of child) {
                if (m instanceof Mesh) {
                    let pipeline = self.fetchPipeline(m.material.identifier);
                    if (!pipeline) {
                        m.material.bindGroup = null;
                        m.bindGroup = null;
                        promises.push(m.material.compile(self));
                    }
                    if (!m.material.compiled) {
                        m.material.init(self);
                    }
                }
                addMaterialInObject(self, promises, m.child);
            }
        }
    }
    updateMesh(m) {
        if (m.needsUpdateCoord) {
            m.worldCoord.writeBuffer(this.jsBuffer, 0);
            m.worldCoord.mat.inv().ts().writeBuffer(this.jsBuffer, 20);
            if (!m.uObjMatBuffer) {
                m.uObjMatBuffer = this.gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, (20 + 16) * 4, "uObjMatBuffer");
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
                        g.gpuBuffer[label] = this.gpu.createBuffer(GPUBufferUsage.STORAGE | dyn, value, "AttributeBuffer." + label);
                    }
                }
            }
            else if (g.dynamic) {
                for (let [label, buffer] of globalThis.Object.entries(g.gpuBuffer)) {
                    this.gpu.device.queue.writeBuffer(buffer, 0, g.jsBuffer[label]);
                }
            }
        }
        if (m.visible)
            this.addToDrawList(m);
    }
    updateScene(scene) {
        this.core.setDisplayConfig({ retinaClearColor: scene.backGroundColor });
        this.cameraInScene = false;
        this.maxTetraNumInOnePass = this.safeTetraNumInOnePass / this.tetraNumOccupancyRatio;
        for (let c of scene.child) {
            if (c.alwaysUpdateCoord) {
                c.needsUpdateCoord = true;
            }
            if (c.visible) {
                if (c.needsUpdateCoord) {
                    c.worldCoord.setFromObj4(c);
                }
                this.updateObject(c);
                c.needsUpdateCoord = false;
            }
        }
        if (this.cameraInScene === false)
            console.error("Target camera is not in the scene. Forget to add it?");
        _updateWorldLight(this);
        this.updateSkyBox(scene);
    }
    updateSkyBox(scene) {
        const skyBox = scene.skyBox;
        if (!skyBox)
            return;
        if (!skyBox.compiled) {
            if (!skyBox.compiling) {
                skyBox.compile(this);
            }
            return;
        }
        if (!skyBox.bindGroups) {
            skyBox.getBindgroups(this);
        }
        skyBox.update(this);
    }
    ambientLightDensity = new Vec3;
    directionalLights;
    spotLights;
    pointLights;
    drawList;
    activeCamera;
    setCamera(camera) {
        if (camera.needsUpdate) {
            this.core.setDisplayConfig({ camera4D: camera });
            camera.needsUpdate = false;
        }
        this.activeCamera = camera;
    }
    render(scene, camera) {
        this.clearState();
        this.setCamera(camera);
        scene.wireframe?.camera?.copyObj4(camera);
        this.updateScene(scene);
        this.core.render(this.context, (renderState) => {
            for (let { pipeline, meshes, bindGroup } of globalThis.Object.values(this.drawList)) {
                if (!meshes.length)
                    continue; // skip empty (may caused by safe tetranum check)
                let tetraState = false;
                let tetraCount = 0;
                let binding = [
                    ...meshes[0].material.bindGroup.map((bg, binding) => ({ group: binding, binding: bg })),
                    bindGroup
                ];
                for (let mesh of meshes) {
                    if (!renderState.testWithFrustumData(mesh.geometry.obb, this.activeCamera.worldCoord, mesh.worldCoord))
                        continue;
                    if (tetraState === false) {
                        renderState.beginTetras(pipeline);
                        tetraCount = 0;
                        tetraState = true;
                    }
                    renderState.sliceTetras(mesh.bindGroup, mesh.geometry.jsBuffer.count);
                    tetraCount += mesh.geometry.jsBuffer.count;
                    if (tetraCount > this.maxTetraNumInOnePass) {
                        renderState.drawTetras(binding);
                        tetraState = false;
                        tetraCount = 0;
                    }
                }
                if (tetraState === true) {
                    renderState.drawTetras(binding);
                }
            }
            if (scene.skyBox?.bindGroups) {
                renderState.drawRaytracing(scene.skyBox.pipeline, scene.skyBox.bindGroups);
            }
        }, scene.wireframe ? rs => scene.wireframe.render(rs) : undefined);
    }
    setSize(size) {
        if (size.height) {
            this.canvas.width = size.width;
            this.canvas.height = size.height;
        }
        else {
            this.canvas.width = size[0];
            this.canvas.height = size[1];
        }
        this.core.setDisplayConfig({ canvasSize: size });
    }
    clearState() {
        this.ambientLightDensity.set();
        this.directionalLights = [];
        this.spotLights = [];
        this.pointLights = [];
        this.drawList = {};
    }
}

export { Renderer };
//# sourceMappingURL=renderer.js.map
