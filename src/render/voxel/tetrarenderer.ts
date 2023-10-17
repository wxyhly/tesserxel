// todo
// texture view can choose type "2d" and set layer
import { GPU } from "../gpu";

function createTexture2DArray(gpu: GPU) {
    
    const depthtxt = gpu.device.createTexture({
        size: [128, 128], format: this.gpu.preferredFormat,
        dimension:"2d",
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
    });
    this.depthview = depthtxt.createView();
    const txt = gpu.device.createTexture({
        size: [128, 128, 128], format: this.gpu.preferredFormat,
        dimension:"2d",
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
    });
    this.view = txt.createView({ dimension: "2d", baseArrayLayer: 0, arrayLayerCount: 1 });
}