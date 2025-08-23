import { GPU } from "../gpu.js";
export type Size3DDict = {
    width: number;
    height: number;
    depth: number;
};
export interface VoxelBuffer {
    buffer: GPUBuffer;
    header?: ArrayBuffer;
    width: number;
    height: number;
    depth: number;
    length: number;
    formatSize: number;
}
export declare function createVoxelBuffer(gpu: GPU, size: GPUExtent3D, formatSize: number, header?: ArrayBuffer, headerSize?: number): VoxelBuffer;
