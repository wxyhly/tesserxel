function toSize3DDict(size) {
    let width, height, depth;
    if (size.width) {
        width = size.width;
        height = size.height;
        depth = size.depthOrArrayLayers;
    }
    else {
        width = size[0];
        height = size[1];
        depth = size[2];
    }
    return { width, height, depth };
}
function createVoxelBuffer(gpu, size, formatSize, header, headerSize) {
    let device = gpu.device;
    let { width, height, depth } = toSize3DDict(size);
    let length = width * height * depth;
    headerSize ??= header?.byteLength ?? 0;
    let buffer = device.createBuffer({
        size: (4 + length * formatSize) * 4 + headerSize,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true,
        label: `VoxelBuffer<${width},${height},${depth},${formatSize}>`
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

export { createVoxelBuffer };
//# sourceMappingURL=buffer.js.map
