namespace example {
    export namespace erosion {

        export async function load() {
            const gpu = await tesserxel.renderer.createGPU();
            let resolution = [128, 128, 128];
            // vec4 : terrain water, wvx,wvy,wvz,
            // 
            let bufferA = tesserxel.renderer.createVoxelBuffer(gpu, resolution, 4);
            let bufferB = tesserxel.renderer.createVoxelBuffer(gpu, resolution, 4);
            let code = `
            struct Vec4Attachment{
                size: vec4<u32>,
                data: array<vec4<u32>>
            }
            const gridSize = 10.0;
            const dt = 1.0;
            const kr = 0.01;
            @compute @workgroup_size(8,8,8) 
            fn calcFlow(@builtin(global_invocation_id) pos: vec3<u32>){
                if(pos.x >= input.size.x || pos.y >= input.size.y || pos.z >= input.size.z){
                    return;
                }
                let offset = pos.x + input.size.x*(pos.y + input.size.y*input.size.z);
                var offsetxp:u32; if(offset.x == input.size.x - 1) {offsetxp = offset - input.size.x;}else{offsetxp = offset - 1;}
                var offsetxm:u32; if(offset.x == 0) {offsetxm = offset + 1;}else{offsetxm = offset + input.size.x;}
                var offsetyp:u32; if(offset.y == input.size.y - 1) {offsetyp = offset - input.size.y;}else{offsetyp = offset - 1;}
                var offsetym:u32; if(offset.y == 0) {offsetym = offset + 1;}else{offsetym = offset + input.size.y;}
                var offsetzp:u32; if(offset.z == input.size.z - 1) {offsetzp = offset - input.size.z;}else{offsetzp = offset - 1;}
                var offsetzm:u32; if(offset.z == 0) {offsetzm = offset + 1;}else{offsetzm = offset + input.size.z;}
                var offsetwp:u32; if(offset.w == input.size.w - 1) {offsetwp = offset - input.size.w;}else{offsetwp = offset - 1;}
                var offsetwm:u32; if(offset.w == 0) {offsetwm = offset + 1;}else{offsetwm = offset + input.size.w;}
                let d = input.data[offset].x;//todo
                let d1 = d + dt * kr; 
                
            }
            `;
        }
    }
}