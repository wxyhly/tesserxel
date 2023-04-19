import { AffineMat4, Obj4 } from "../../math/algebra/affine";
import { Vec4 } from "../../math/algebra/vec4";
import { _180, _360, _90 } from "../../math/const";
import { toIndexbuffer, toNonIndex } from "../index";

/** Tetramesh store 4D mesh as tetrahedral list
 *  Each tetrahedral uses four vertices in the position list
 */
export interface TetraMesh {
    position: Float32Array;
    normal?: Float32Array;
    uvw?: Float32Array;
    count?: number;
}
/** TetraIndexMesh is not supported for tetraslice rendering
 *  It is only used in data storage and mesh construction
 */
export interface TetraIndexMesh {
    position: Float32Array;
    normal?: Float32Array;
    uvw?: Float32Array;
    positionIndex: Uint32Array;
    normalIndex?: Uint32Array;
    uvwIndex?: Uint32Array;
    count?: number;
}
export function toIndexMesh(m: TetraMesh) {
    let position = [];
    let normal = [];
    let uvw = [];
    let posIdx = [];
    let normalIdx = [];
    let uvwIdx = [];
    toIndexbuffer(m.position, position, posIdx, 4);
    if (m.normal) toIndexbuffer(m.normal, normal, normalIdx, 4);
    if (m.uvw) toIndexbuffer(m.uvw, uvw, uvwIdx, 4);

    let out: TetraIndexMesh = {
        position: new Float32Array(position),
        positionIndex: new Uint32Array(posIdx)
    };
    if (m.normal) out.normalIndex = new Uint32Array(normalIdx);
    if (m.uvw) out.uvwIndex = new Uint32Array(uvwIdx);
    if (normal.length) out.normal = new Float32Array(normal);
    if (uvw.length) out.uvw = new Float32Array(uvw);
    return out;
}
export function toNonIndexMesh(m: TetraIndexMesh) {
    let count = m.position.length << 2;
    let out: TetraMesh = {
        position: new Float32Array(count),
        count: count >> 4
    };
    toNonIndex(m.position, m.positionIndex, out.position, 4);
    if (m.normal) {
        out.normal = new Float32Array(count);
        toNonIndex(m.normal, m.normalIndex, out.normal, 4);
    }
    if (m.uvw) {
        out.uvw = new Float32Array(count);
        toNonIndex(m.uvw, m.uvwIndex, out.uvw, 4);
    }

    return out;
}
export function applyAffineMat4(mesh: TetraMesh, am: AffineMat4) {
    let vp = new Vec4();
    for (let i = 0; i < mesh.position.length; i += 4) {
        vp.set(
            mesh.position[i],
            mesh.position[i + 1],
            mesh.position[i + 2],
            mesh.position[i + 3],
        ).mulmatls(am.mat).adds(am.vec).writeBuffer(mesh.position, i);
        if (mesh.normal) {
            vp.set(
                mesh.normal[i],
                mesh.normal[i + 1],
                mesh.normal[i + 2],
                mesh.normal[i + 3],
            ).mulmatls(am.mat).writeBuffer(mesh.position, i);
        }
    }
    return mesh;
}
export function applyObj4(mesh: TetraMesh, obj: Obj4) {
    let vp = new Vec4();
    let scaleinv: Vec4;
    if (obj.scale && mesh.normal) {
        scaleinv = new Vec4(1 / obj.scale.x, 1 / obj.scale.y, 1 / obj.scale.z, 1 / obj.scale.w);
    }
    for (let i = 0; i < mesh.position.length; i += 4) {
        if (obj.scale) {
            vp.set(
                mesh.position[i] * obj.scale.x,
                mesh.position[i + 1] * obj.scale.y,
                mesh.position[i + 2] * obj.scale.z,
                mesh.position[i + 3] * obj.scale.w,
            ).rotates(obj.rotation).adds(obj.position).writeBuffer(mesh.position, i);
            if (mesh.normal) {
                vp.set(
                    mesh.normal[i] * scaleinv.x,
                    mesh.normal[i + 1] * scaleinv.y,
                    mesh.normal[i + 2] * scaleinv.z,
                    mesh.normal[i + 3] * scaleinv.w,
                ).rotates(obj.rotation).norms().writeBuffer(mesh.normal, i);
            }
        } else {
            vp.set(
                mesh.position[i],
                mesh.position[i + 1],
                mesh.position[i + 2],
                mesh.position[i + 3],
            ).rotates(obj.rotation).adds(obj.position).writeBuffer(mesh.position, i);
            if (mesh.normal) {
                vp.set(
                    mesh.normal[i],
                    mesh.normal[i + 1],
                    mesh.normal[i + 2],
                    mesh.normal[i + 3],
                ).rotates(obj.rotation).writeBuffer(mesh.normal, i);
            }
        }
    }
    return mesh;
}
export function concat(mesh1: TetraMesh, mesh2: TetraMesh): TetraMesh {
    let position = new Float32Array(mesh1.position.length + mesh2.position.length);
    position.set(mesh1.position);
    position.set(mesh2.position, mesh1.position.length);
    let ret: TetraMesh = { position, count: position.length << 4 };
    if (mesh1.normal && mesh2.normal) {
        let normal = new Float32Array(mesh1.normal.length + mesh2.normal.length);
        normal.set(mesh1.normal);
        normal.set(mesh2.normal, mesh1.normal.length);
        ret.normal = normal;
    }
    if (mesh1.uvw && mesh2.uvw) {
        let uvw = new Float32Array(mesh1.uvw.length + mesh2.uvw.length);
        uvw.set(mesh1.uvw);
        uvw.set(mesh2.uvw, mesh1.uvw.length);
        ret.uvw = uvw;
    }
    return ret;
}
export function concatarr(meshes: TetraMesh[]): TetraMesh {
    let length = 0;
    let hasNormal = true;
    let hasUvw = true;
    for (let i = 0; i < meshes.length; i++) {
        length += meshes[i].position.length;
        hasUvw = hasUvw && (meshes[i].uvw ? true : false);
        hasNormal = hasNormal && (meshes[i].normal ? true : false);
    }
    let position = new Float32Array(length);
    let ret: TetraMesh = { position, count: length >> 4 };
    let normal: Float32Array, uvw: Float32Array;
    if (hasNormal) {
        normal = new Float32Array(length);
        ret.normal = normal;
    }
    if (hasUvw) {
        uvw = new Float32Array(length);
        ret.uvw = uvw;
    }
    length = 0;
    for (let i = 0; i < meshes.length; i++) {
        position.set(meshes[i].position, length);
        if (hasNormal) {
            normal.set(meshes[i].normal, length);
        }
        if (hasUvw) {
            uvw.set(meshes[i].uvw, length);
        }
        length += meshes[i].position.length;
    }
    return ret;
}
export function clone(mesh: TetraMesh): TetraMesh {
    let ret: TetraMesh = {
        position: mesh.position.slice(0),
        count: mesh.count
    }
    if (mesh.uvw) ret.uvw = mesh.uvw.slice(0);
    if (mesh.normal) ret.normal = mesh.normal.slice(0);
    return ret;
}
export function deleteTetras(mesh: TetraMesh, tetras: number[]): TetraMesh {
    let count = mesh.count ?? (mesh.position?.length >> 4);
    let newCount = (count - tetras.length) << 4;
    let p = new Float32Array(newCount);
    let n: Float32Array;
    let u: Float32Array;
    if (mesh.normal) n = new Float32Array(newCount);
    if (mesh.uvw) u = new Float32Array(newCount);
    let offset = 0;
    for (let i = 0; i < mesh.count; i++) {
        if (!tetras.includes(i)) {
            p.set(mesh.position.subarray(i << 4, (i + 1) << 4), offset);
            if (n) n.set(mesh.normal.subarray(i << 4, (i + 1) << 4), offset);
            if (u) u.set(mesh.uvw.subarray(i << 4, (i + 1) << 4), offset);
            offset += 16;
        }
    }
    return {
        position: p, normal: n, uvw: u, count: newCount >> 4
    }
}
