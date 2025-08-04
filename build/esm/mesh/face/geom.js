import { Vec2 } from '../../math/algebra/vec2.js';
import { Vec4 } from '../../math/algebra/vec4.js';
import { Bivec } from '../../math/algebra/bivec.js';
import { Rotor } from '../../math/algebra/rotor.js';
import { Obj4 } from '../../math/algebra/affine.js';
import { _90, _180, _360 } from '../../math/const.js';
import { FaceMesh, FaceIndexMesh } from './facemesh.js';

let square = new FaceMesh({
    quad: {
        normal: new Float32Array([0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0]),
        position: new Float32Array([-1, 0, -1, 0, -1, 0, 1, 0, 1, 0, 1, 0, 1, 0, -1, 0]),
        uvw: new Float32Array([0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0]),
    }
});
function cube() {
    let rotor = new Rotor();
    let biv = new Bivec();
    let yface = square.clone().applyObj4(new Obj4(Vec4.y, rotor.expset(biv.set(0, _90))));
    let meshes = [
        biv.set(_90).exp(),
        biv.set(-_90).exp(),
        biv.set(0, 0, 0, _90).exp().mulsl(rotor.expset(biv.set(_90, 0, 0, 0, 0))),
        biv.set(0, 0, 0, -_90).exp().mulsl(rotor.expset(biv.set(_90, 0, 0, 0, 0))),
        biv.set(_180).exp(),
    ].map(r => yface.clone().applyObj4(new Obj4(new Vec4(), r)));
    for (const m of meshes)
        yface = yface.concat(m);
    let m = yface;
    // for (let i = 0; i < 6; i++) {
    //     for (let j = 0; j < 8; j++) {
    //         m.uvw[i * 80 + j * 4 + 2] = i;
    //     }
    // }
    return m;
}
function sphere(radius, u, v, uAngle = _360, vAngle = _180) {
    if (u < 3)
        u = 3;
    if (v < 3)
        v = 3;
    return parametricSurface((uvw, pos, norm) => {
        let u = uvw.x * uAngle;
        let v = uvw.y * vAngle;
        let sv = Math.sin(v);
        let cv = Math.cos(v);
        norm.set(sv * Math.cos(u), sv * Math.sin(u), cv, 0);
        sv *= radius;
        pos.set(sv * Math.cos(u), sv * Math.sin(u), cv * radius, 0);
    }, u, v);
}
function polygon(points) {
    //todo: concave polygon
    const len = points.length;
    if (len < 3)
        console.error(`Polygon must have at least 3 points, ${len} points found`);
    const ret = new FaceIndexMesh({
        position: new Float32Array(len << 2),
        uvw: new Float32Array(len << 2),
        triangle: {
            position: new Uint32Array(len * 3 - 6),
            uvw: new Uint32Array(len * 3 - 6),
            count: len - 2
        }
    });
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
    // ret.position
    return ret;
}
function circle(radius, segment) {
    return polygon(new Array(segment).fill(0).map((_, i) => new Vec4(Math.cos(i / segment * _360) * radius, Math.sin(i / segment * _360) * radius)));
}
function parametricSurface(fn, uSegment, vSegment) {
    if (uSegment < 1)
        uSegment = 1;
    if (vSegment < 1)
        vSegment = 1;
    let arraySize = vSegment * vSegment << 4;
    uSegment++;
    vSegment++;
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
    function pushIdx(i) {
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
    return new FaceMesh({
        quad: { position, normal, uvw }
    });
}
/** m must be a manifold or manifold with border */
function findBorder(m) {
    if (!m.position)
        console.error("findBorder can onnly apply to FaceIndexMesh.");
    let borders = [];
    for (let i = 0, l = m.quad?.position?.length; i < l; i += 4) {
        let p = m.quad.position;
        pushBorder(p[i], p[i + 1]);
        pushBorder(p[i + 1], p[i + 2]);
        pushBorder(p[i + 2], p[i + 3]);
        pushBorder(p[i + 3], p[i]);
    }
    for (let i = 0, l = m.triangle?.position?.length; i < l; i += 3) {
        let p = m.triangle.position;
        pushBorder(p[i], p[i + 1]);
        pushBorder(p[i + 1], p[i + 2]);
        pushBorder(p[i + 2], p[i]);
    }
    function pushBorder(a, b) {
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
        }
        else {
            borders.push([a, b]);
        }
    }
    return borders;
}

export { circle, cube, findBorder, parametricSurface, polygon, sphere, square };
//# sourceMappingURL=geom.js.map
