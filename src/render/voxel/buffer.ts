import { GPU } from "../gpu";
export type Size3DDict = { width: number, height: number, depth: number };
function toSize3DDict(size: GPUExtent3D): Size3DDict {
    let width: number, height: number, depth: number;
    if ((size as GPUExtent3DDict).width) {
        width = (size as GPUExtent3DDict).width;
        height = (size as GPUExtent3DDict).height;
        depth = (size as GPUExtent3DDict).depthOrArrayLayers;
    } else {
        width = size[0];
        height = size[1];
        depth = size[2];
    }
    return { width, height, depth };
}
export interface VoxelBuffer {
    buffer: GPUBuffer,
    header?: ArrayBuffer,
    width: number, height: number, depth: number, length: number, formatSize: number,
}
export function createVoxelBuffer(
    gpu: GPU, size: GPUExtent3D, formatSize: number,
    header?: ArrayBuffer, headerSize?: number
): VoxelBuffer {
    let device = gpu.device;
    let { width, height, depth } = toSize3DDict(size);
    let length = width * height * depth;
    headerSize ??= header?.byteLength ?? 0;
    let buffer = device.createBuffer({
        size: (4 + length * formatSize) * 4 + headerSize,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true,
        label: `VoxelBuffer<${width},${height},${depth},${formatSize}`
    });
    let gpuBuffer = buffer.getMappedRange(0, headerSize + 16);
    let jsBuffer = new Uint32Array(gpuBuffer);
    jsBuffer.set([width, height, depth, formatSize]);
    if (header) {
        let headerBuffer = new Uint32Array(header);
        jsBuffer.set(headerBuffer, 4);
    }
    buffer.unmap();
    return { buffer, width, height, depth, length, formatSize, header };
}