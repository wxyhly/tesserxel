export declare class GPU {
    adapter: GPUAdapter;
    device: GPUDevice;
    preferredFormat: GPUTextureFormat;
    init(): Promise<GPU | null>;
    createBuffer(usage: number, buffer_or_size: (ArrayLike<number> & ArrayBufferView) | number, label?: string): GPUBuffer;
    createBindGroup(pipeline: GPUPipelineBase, index: number, entries: Array<GPUBindingResource>, label?: string): GPUBindGroup;
    getContext(dom: HTMLCanvasElement, config?: GPUContextConfig): GPUCanvasContext;
}
interface GPUContextConfig {
    format?: GPUTextureFormat;
    alphaMode?: GPUCanvasAlphaMode;
    usage?: GPUTextureUsageFlags;
    viewFormats?: Iterable<GPUTextureFormat>;
    colorSpace?: PredefinedColorSpace;
}
export {};
