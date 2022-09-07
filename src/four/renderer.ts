/** threejs like 4D lib */
namespace tesserxel {
    export namespace four {
        export class Renderer {
            core: renderer.SliceRenderer;
            gpu: renderer.GPU;
            canvas: HTMLCanvasElement;
            pipelines: { [label: string]: renderer.TetraSlicePipeline | "compiling" } = {};
            jsBuffer = new Float32Array(1024);
            uCamMatBuffer: GPUBuffer; // contain inv and uninv affineMat
            uWorldLightBuffer: GPUBuffer;
            lightShaderInfomation = _initLightShader();
            constructor(canvas: HTMLCanvasElement) {
                this.canvas = canvas;
                this.core = new renderer.SliceRenderer();
            }
            setBackgroudColor(color: GPUColor) {
                this.core.setScreenClearColor(color);
            }
            async init() {
                this.gpu = await renderer.createGPU();
                await this.core.init(this.gpu, this.gpu.getContext(this.canvas));
                this.uCamMatBuffer = this.gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, (4 * 5 * 2) * 4, "uCamMat");
                this.uWorldLightBuffer = this.gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, this.lightShaderInfomation.uWorldLightBufferSize, "uWorldLight");
                this.core.setSize({ width: this.canvas.width * devicePixelRatio, height: this.canvas.height * devicePixelRatio });
                return this;
            }
            // todo: add computePipeLinePool
            fetchPipelineName(identifier: string): string {
                return identifier;
            }
            fetchPipeline(identifier: string): renderer.TetraSlicePipeline | "compiling" {
                return this.pipelines[this.fetchPipelineName(identifier)];
            }
            pullPipeline(identifier: string, pipeline: renderer.TetraSlicePipeline | "compiling") {
                if (this.pipelines[identifier] && this.pipelines[identifier] !== "compiling")
                    console.error("FOUR Renderer: Repetitive material pipeline creation occured.");
                this.pipelines[identifier] = pipeline;
            }
            updateObject(o: Object) {
                for (let c of o.child) {
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
                let groupName = m.material.uuid;
                let group = m.material.declUniformLocation ? 1 : 0;
                let bindGroup = this.core.createFragmentShaderBindGroup(pipeline, group, [this.uWorldLightBuffer]);
                this.drawList[groupName] ??= { pipeline: pipeline, meshes: [], bindGroup: { group, binding: bindGroup } };
                this.drawList[groupName].meshes.push(m);
                if (!m.bindGroup) {
                    m.bindGroup = this.core.createVertexShaderBindGroup(pipeline, 1, [
                        ...m.material.fetchBuffer(m.geometry),
                        m.uObjMatBuffer,
                        this.uCamMatBuffer
                    ]);
                }
                if (!m.material.bindGroup) {
                    m.material.createBindGroup(this, pipeline);
                }
                m.material.update(this);
            }
            updateMesh(m: Mesh) {
                if (m.visible) this.addToDrawList(m);
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
                    if (!g.gpuBuffer) {
                        g.gpuBuffer = {};
                        for (let [label, value] of globalThis.Object.entries(g.jsBuffer)) {
                            if (value instanceof Float32Array) {
                                g.gpuBuffer[label] = this.gpu.createBuffer(
                                    GPUBufferUsage.STORAGE, value, "AttributeBuffer." + label
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
                this.core.setWorldClearColor(scene.backGroundColor);
                for (let c of scene.child) {
                    if (c.needsUpdateCoord) {
                        c.worldCoord.setFromObj4(c);
                    }
                    this.updateObject(c);
                    c.needsUpdateCoord = false;
                }
                _updateWorldLight(this);
            }

            ambientLightDensity = new math.Vec3;
            directionalLights: DirectionalLight[];
            spotLights: SpotLight[];
            pointLights: PointLight[];
            drawList: { [group: string]: { pipeline: renderer.TetraSlicePipeline, meshes: Mesh[], bindGroup: { group: number, binding: GPUBindGroup } } };
            activeCamera: Camera;
            setCamera(camera: Camera) {
                if (camera.needsUpdate) {
                    this.core.set4DCameraProjectMatrix(camera);
                    camera.needsUpdate = false;
                }
                this.activeCamera = camera;
            }
            render(scene: Scene, camera: Camera) {
                this.clearState();
                this.setCamera(camera);
                this.updateScene(scene);
                this.core.render(() => {
                    for (let { pipeline, meshes, bindGroup } of globalThis.Object.values(this.drawList)) {
                        this.core.beginTetras(pipeline);
                        for (let mesh of meshes) {
                            this.core.sliceTetras(mesh.bindGroup, mesh.geometry.jsBuffer.tetraCount);
                        }
                        this.core.drawTetras([
                            ...meshes[0].material.bindGroup.map((bg, binding) => ({ group: binding, binding: bg })),
                            bindGroup
                        ]);
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
    }
}