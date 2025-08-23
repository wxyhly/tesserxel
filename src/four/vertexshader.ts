//  tetra vertex shaders
let commonHeader = `
struct tsxAffineMat{
    matrix: mat4x4f,
    vector: vec4f,
}
struct UObjMats{
    pos: tsxAffineMat,
    normal: mat4x4f,
}
struct fourInputType{
    @location(0) pos: mat4x4f,{fourInputType}
}
struct fourOutputType{
    @builtin(position) position: mat4x4f,
    {fourOutputType}
}
@group(1) @binding({0}) var<uniform> uObjMat: UObjMats;
@group(1) @binding({1}) var<uniform> uCamMat: tsxAffineMat;
fn apply(afmat: tsxAffineMat, points: mat4x4f) -> mat4x4f{
    let biais = mat4x4f(afmat.vector, afmat.vector, afmat.vector, afmat.vector);
    return afmat.matrix * points + biais;
}
fn normalizeVec4s(vec4s: mat4x4f) -> mat4x4f{
    return mat4x4f(
        normalize(vec4s[0]), normalize(vec4s[1]), normalize(vec4s[2]), normalize(vec4s[3]),
    );
}
@tetra fn main(input : fourInputType, @builtin(instance_index) index: u32) -> fourOutputType{
    let worldPos = apply(uObjMat.pos,input.pos);
    return fourOutputType({fourOutputReturn});
}
`;
const outputReturn = {
    position: `apply(uCamMat,worldPos)`,
    uvw: `input.uvw`,
    normal: `normalizeVec4s(uObjMat.normal * input.normal)`,
    pos: `worldPos`
};
export function _generateVertShader(inputs: string[], outputs: string[]) {
    const bindingOffset = inputs.length + 1;
    let header = commonHeader;
    let fourInputType = "";
    let fourOutputType = "";
    let fourOutputReturn = outputReturn.position;
    for (let i = 0, l = inputs.length; i < l; i++) {
        fourInputType += `
        @location(${i + 1}) ${inputs[i]}: mat4x4f,`;
    }
    if (outputs.length === 1) {
        fourOutputType = `
        @location(0) ${outputs[0]}: mat4x4f,`;
        fourOutputReturn += "," + outputReturn[outputs[0]];
    } else if (outputs.length === 2) {
        fourOutputType = `
        @location(0) ${outputs[0]}: mat4x4f,
        @location(1) ${outputs[1]}: mat4x4f`;
        fourOutputReturn += "," + outputReturn[outputs[0]] + "," + outputReturn[outputs[1]];
    } else if (outputs.length === 3) {
        fourOutputType = `
        @location(0) ${outputs[0]}_${outputs[1]}: array<mat4x4f,2>,
        @location(1) ${outputs[2]}: mat4x4f`;
        fourOutputReturn += ", array<mat4x4f,2>(" + outputReturn[outputs[0]] + "," +
            outputReturn[outputs[1]] + ")," + outputReturn[outputs[2]];
    }
    for (let i = 0; i < 32; i++) {
        header = header.replace(`@binding({${i}})`, `@binding(${i + bindingOffset})`);
    }
    return header.replace("{fourOutputReturn}", fourOutputReturn).replace("{fourOutputType}", fourOutputType).replace("{fourInputType}", fourInputType);
}