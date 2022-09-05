namespace tesserxel {
    export namespace four {
        let basicVertShader = `
        struct _fourInputType{
            @location(0) pos: mat4x4<f32>,
            @location(1) uvw: mat4x4<f32>,
            @location(2) normal: mat4x4<f32>,
        }
        struct _fourOutputType{
            @builtin(position) pos: mat4x4<f32>,
            @location(0) uvw: mat4x4<f32>,
            @location(1) normal: mat4x4<f32>,
        }
        struct AffineMat{
            matrix: mat4x4<f32>,
            vector: vec4<f32>,
        }
        @group(1) @binding(3) var<uniform> camMat: AffineMat;
        fn apply(afmat: AffineMat, points: mat4x4<f32>) -> mat4x4<f32>{
            let biais = mat4x4<f32>(afmat.vector, afmat.vector, afmat.vector, afmat.vector);
            return afmat.matrix* points + biais;
        }
        @tetra fn main(input : InputType, @builtin(instance_index) index: u32) -> OutputType{
            return OutputType(apply(camMat,input.pos), input.uvw, input.normal);
        }
        `
    }
}