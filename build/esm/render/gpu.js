class GPU {
    adapter;
    device;
    preferredFormat;
    async init() {
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
    createBuffer(usage, buffer_or_size, label) {
        let gpuBuffer = this.device.createBuffer({
            size: buffer_or_size?.byteLength ?? buffer_or_size,
            usage, label,
            mappedAtCreation: typeof buffer_or_size != "number"
        });
        if (typeof buffer_or_size != "number") {
            let jsBuffer = new buffer_or_size.constructor(gpuBuffer.getMappedRange());
            jsBuffer.set(buffer_or_size);
            gpuBuffer.unmap();
        }
        return gpuBuffer;
    }
    createBindGroup(pipeline, index, entries, label) {
        let descriptor = {
            layout: pipeline.getBindGroupLayout(index),
            entries: entries.map((e, i) => ({ binding: i, resource: e }))
        };
        if (label)
            descriptor.label = label;
        return this.device.createBindGroup(descriptor);
    }
    getContext(dom, config) {
        let ctxt = dom.getContext('webgpu');
        ctxt.configure({
            device: this.device,
            format: config?.format ?? this.preferredFormat,
            ...config
        });
        return ctxt;
    }
}

export { GPU };
//# sourceMappingURL=gpu.js.map
