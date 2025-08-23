export class GPU {
    adapter: GPUAdapter;
    device: GPUDevice;
    preferredFormat: GPUTextureFormat;
    async init(): Promise<GPU | null> {
        if (!('gpu' in navigator)) {
            console.warn("User agent doesn't support WebGPU.");
            return null;
        }
        const gpuAdapter = await navigator.gpu.requestAdapter({
            powerPreference: 'high-performance'
        });
        if (!gpuAdapter) {
            console.warn('No WebGPU adapters found.');
            return null;
        }
        this.adapter = gpuAdapter;
        this.preferredFormat = navigator.gpu.getPreferredCanvasFormat();
        this.device = await gpuAdapter.requestDevice();
        this.device.lost.then((info) => {
            console.error(`WebGPU device was lost: ${info.message}`);
            this.device = null;
            if (info.reason != 'destroyed') {
                this.init();
            }
        });
        return this;
    }
    createBuffer(usage: number, buffer_or_size: (ArrayLike<number> & ArrayBufferView) | number, label?: string) {
        let gpuBuffer = this.device.createBuffer({
            size: (buffer_or_size as ArrayLike<number> & ArrayBufferView)?.byteLength ?? (buffer_or_size as number),
            usage, label,
            mappedAtCreation: typeof buffer_or_size != "number"
        });
        if (typeof buffer_or_size != "number") {
            let jsBuffer = new (buffer_or_size.constructor as ArrayBufferConstructor)(gpuBuffer.getMappedRange());
            (jsBuffer as any as Float32Array).set(buffer_or_size);
            gpuBuffer.unmap();
        }
        return gpuBuffer;
    }
    createBindGroup(pipeline: GPUPipelineBase, index: number, entries: Array<GPUBindingResource>, label?: string) {
        let descriptor: GPUBindGroupDescriptor = {
            layout: pipeline.getBindGroupLayout(index),
            entries: entries.map((e, i) => ({ binding: i, resource: e }))
        };
        if (label) descriptor.label = label;
        return this.device.createBindGroup(descriptor);
    }
    getContext(dom: HTMLCanvasElement, config?: GPUContextConfig): GPUCanvasContext {
        let ctxt = dom.getContext('webgpu') as unknown as GPUCanvasContext;
        ctxt.configure({
            device: this.device,
            format: config?.format ?? this.preferredFormat,
            ...config
        });
        return ctxt;
    }
}
interface ArrayBufferConstructor {
    readonly prototype: ArrayBuffer;
    new(byteLength: number): ArrayBuffer;
    new(array: ArrayLike<number> | ArrayBufferLike): ArrayBuffer;
    new(buffer: ArrayBufferLike, byteOffset?: number, length?: number): ArrayBuffer;
    isView(arg: any): arg is ArrayBufferView;
}
interface GPUContextConfig {
    format?: GPUTextureFormat;
    alphaMode?: GPUCanvasAlphaMode;
    usage?: GPUTextureUsageFlags;
    viewFormats?: Iterable<GPUTextureFormat>;
    colorSpace?: PredefinedColorSpace;
}