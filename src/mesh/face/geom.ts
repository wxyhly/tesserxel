import { Vec2 } from "../../math/algebra/vec2";
import { Vec4 } from "../../math/algebra/vec4";
import { _360 } from "../../math/const";
import { FaceIndexMesh } from "./facemesh";
export function sphere(u, v) {

}
export function polygon(points: Vec4[]) {
    //todo: concave polygon
    const len = points.length;
    if (len < 3) console.error(`Polygon must have at least 3 points, ${len} points found`);
    const ret = {
        position: new Float32Array(len << 2),
        uvw: new Float32Array(len << 2),
        triangle: {
            position: new Uint32Array(len * 3 - 6),
            uvw: new Uint32Array(len * 3 - 6),
            count: len - 2
        }
    };
    let offset = 0;
    for (let i = 0; i < len; i++) {
        points[i].writeBuffer(ret.position, i << 2);
        points[i].writeBuffer(ret.uvw, i << 2);
        if (i > 1) {
            ret.triangle.position[offset++] = 0;
            ret.triangle.position[offset++] = i;
            ret.triangle.position[offset++] = i - 1;
            offset -= 3;
            ret.triangle.uvw[offset++] = 0;
            ret.triangle.uvw[offset++] = i;
            ret.triangle.uvw[offset++] = i - 1;
        }
    }
    ret.position
    return ret;
}
export function circle(radius: number, segment: number) {
    return polygon(new Array(segment).fill(0).map((_, i) =>
        new Vec4(
            Math.cos(i / segment * _360) * radius,
            Math.sin(i / segment * _360) * radius,
        )
    ));
}
export function parametricSurface(
    fn: (inputuvw: Vec2, outputPosition: Vec4, outputNormal: Vec4) => void,
    uSegment: number, vSegment: number
) {
    if (uSegment < 1) uSegment = 1;
    if (vSegment < 1) vSegment = 1;
    let arraySize = vSegment * vSegment << 4;
    uSegment++; vSegment++;
    let uvw_seg = uSegment * uSegment;
    let positions = new Float32Array((uvw_seg) << 2);
    let normals = new Float32Array((uvw_seg) << 2);
    let uvws = new Float32Array((uvw_seg) << 2);
    let position = new Float32Array(arraySize);
    let normal = new Float32Array(arraySize);
    let uvw = new Float32Array(arraySize);
    let inputuvw = new Vec2;
    let outputVertex = new Vec4;
    let outputNormal = new Vec4;
    let ptr = 0;
    let idxPtr = 0;
    function pushIdx(i: number) {
        position[idxPtr++] = positions[i];
        position[idxPtr++] = positions[i + 1];
        position[idxPtr++] = positions[i + 2];
        position[idxPtr++] = positions[i + 3];
        idxPtr -= 4;
        normal[idxPtr++] = normals[i];
        normal[idxPtr++] = normals[i + 1];
        normal[idxPtr++] = normals[i + 2];
        normal[idxPtr++] = normals[i + 3];
        idxPtr -= 4;
        uvw[idxPtr++] = uvws[i];
        uvw[idxPtr++] = uvws[i + 1];
        uvw[idxPtr++] = uvws[i + 2];
        uvw[idxPtr++] = uvws[i + 3];
    }
    for (let u_index = 0; u_index < uSegment; u_index++) {
        inputuvw.x = u_index / (uSegment - 1);
        let offset = vSegment * u_index;
        for (let v_index = 0; v_index < vSegment; v_index++, offset++) {
            inputuvw.y = v_index / (vSegment - 1);
            fn(inputuvw, outputVertex, outputNormal);
            positions[ptr++] = outputVertex.x;
            positions[ptr++] = outputVertex.y;
            positions[ptr++] = outputVertex.z;
            positions[ptr++] = outputVertex.w;
            ptr -= 4;
            normals[ptr++] = outputNormal.x;
            normals[ptr++] = outputNormal.y;
            normals[ptr++] = outputNormal.z;
            normals[ptr++] = outputNormal.w;
            ptr -= 4;
            uvws[ptr++] = inputuvw.x;
            uvws[ptr++] = inputuvw.y;
            uvws[ptr++] = 0;
            uvws[ptr++] = 0;
            if (u_index && v_index) {
                // todo: if same -> no push or push to triangle
                pushIdx(offset << 2);
                pushIdx(offset - 1 << 2);
                pushIdx(offset - vSegment << 2);
                pushIdx(offset - vSegment - 1 << 2);
            }
        }
    }
    return {
        quad: { position, normal, uvw }
    }
}
/** m must be a manifold or manifold with border */
export function findBorder(m: FaceIndexMesh) {
    if (!m.position) console.error("findBorder can onnly apply to FaceIndexMesh.");
    let borders = [];
    for (let i = 0, l = m.quad?.position?.length; i < l!; i += 4) {
        let p = m.quad!.position;
        pushBorder(p[i], p[i + 1]);
        pushBorder(p[i + 1], p[i + 2]);
        pushBorder(p[i + 2], p[i + 3]);
        pushBorder(p[i + 3], p[i]);
    }
    for (let i = 0, l = m.triangle?.position?.length; i < l!; i += 3) {
        let p = m.triangle!.position;
        pushBorder(p[i], p[i + 1]);
        pushBorder(p[i + 1], p[i + 2]);
        pushBorder(p[i + 2], p[i]);
    }
    function pushBorder(a: number, b: number) {
        let count = 0;
        let found = false;
        for (let [j, k] of borders) {
            if (j === b && k === a) {
                found = true;
                break;
            }
            if (j === a && k === b) {
                found = true;
                console.warn("findBorder: Non manifold mesh found.");
                break;
            }
            count++;
        }
        if (found) {
            borders.splice(count, 1);
        } else {
            borders.push([a, b]);
        }
    }
    return borders;
}