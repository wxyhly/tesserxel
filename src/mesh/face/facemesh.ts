import { toIndexbuffer, toNonIndex } from "../index";
import { AffineMat4, Obj4 } from "../../math/algebra/affine";
import { Vec4 } from "../../math/algebra/vec4";
import { mesh } from "../../tesserxel";

/** FaceMesh store traditional 2-face mesh as triangle or quad list
 *  This mesh is for constructing complex tetrameshes
 *  It is not aimed for rendering purpose
 */
export interface FaceMesh {
    quad?: {
        position: Float32Array;
        normal?: Float32Array;
        uvw?: Float32Array;
        count?: number;
    };
    triangle?: {
        position: Float32Array;
        normal?: Float32Array;
        uvw?: Float32Array;
        count?: number;
    };
}

export interface FaceIndexMesh {
    position: Float32Array;
    normal?: Float32Array;
    uvw?: Float32Array;
    quad?: {
        position: Uint32Array;
        normal?: Uint32Array;
        uvw?: Uint32Array;
        count?: number;
    };
    triangle?: {
        position: Uint32Array;
        normal?: Uint32Array;
        uvw?: Uint32Array;
        count?: number;
    };
}

export function toIndexMesh(m: FaceMesh) {
    let position = [];
    let normal = [];
    let uvw = [];
    let posIdx4 = [];
    let normalIdx4 = [];
    let uvwIdx4 = [];
    let posIdx3 = [];
    let normalIdx3 = [];
    let uvwIdx3 = [];
    if (m.quad) {
        toIndexbuffer(m.quad.position, position, posIdx4, 4);
        if (m.quad.normal) toIndexbuffer(m.quad.normal, normal, normalIdx4, 4);
        if (m.quad.uvw) toIndexbuffer(m.quad.uvw, uvw, uvwIdx4, 4);
    }
    if (m.triangle) {
        toIndexbuffer(m.triangle.position, position, posIdx3, 4);
        if (m.triangle.normal) toIndexbuffer(m.triangle.normal, normal, normalIdx3, 4);
        if (m.triangle.uvw) toIndexbuffer(m.triangle.uvw, uvw, uvwIdx3, 4);
    }
    let out: FaceIndexMesh = {
        position: new Float32Array(position)
    };
    if (m.quad) {
        out.quad = {
            position: new Uint32Array(posIdx4)
        }
        if (m.quad.normal) out.quad.normal = new Uint32Array(normalIdx4);
        if (m.quad.uvw) out.quad.uvw = new Uint32Array(uvwIdx4);
    }
    if (m.triangle) {
        out.triangle = {
            position: new Uint32Array(posIdx4)
        }
        if (m.triangle.normal) out.triangle.normal = new Uint32Array(normalIdx4);
        if (m.triangle.uvw) out.triangle.uvw = new Uint32Array(uvwIdx4);
    }
    if (normal.length) out.normal = new Float32Array(normal);
    if (uvw.length) out.uvw = new Float32Array(uvw);
    return out;
}
export function toNonIndexMesh(m: FaceIndexMesh) {
    let out: FaceMesh = {};
    if (m.quad) {
        let count = m.quad.position.length << 2;
        out.quad = {
            position: new Float32Array(count),
            count: count >> 4
        };
        toNonIndex(m.position, m.quad.position, out.quad.position, 4);
        if (m.normal) {
            out.quad.normal = new Float32Array(count);
            toNonIndex(m.normal, m.quad.normal, out.quad.normal, 4);
        }
        if (m.uvw) {
            out.quad.uvw = new Float32Array(count);
            toNonIndex(m.uvw, m.quad.uvw, out.quad.uvw, 4);
        }
    }
    if (m.triangle) {
        let count = m.triangle.position.length << 2;
        out.triangle = {
            position: new Float32Array(count),
            count: count / 12
        };
        toNonIndex(m.position, m.triangle.position, out.triangle.position, 4);
        if (m.normal) {
            out.triangle.normal = new Float32Array(count);
            toNonIndex(m.normal, m.triangle.normal, out.triangle.normal, 4);
        }
        if (m.uvw) {
            out.triangle.uvw = new Float32Array(count);
            toNonIndex(m.uvw, m.triangle.uvw, out.triangle.uvw, 4);
        }
    }
    return out;
}
export function clone(mesh: FaceMesh | FaceIndexMesh): FaceMesh | FaceIndexMesh {
    let ret: typeof mesh = {};
    if (mesh.quad) {
        ret.quad = {
            position: mesh.quad.position.slice(0) as any
        };
        if (mesh.quad.count) ret.quad.count = mesh.quad.count;
        if (mesh.quad.normal) ret.quad.normal = mesh.quad.normal.slice(0) as any;
        if (mesh.quad.uvw) ret.quad.uvw = mesh.quad.uvw.slice(0) as any;
    }
    if (mesh.triangle) {
        ret.triangle = {
            position: mesh.triangle.position.slice(0) as any
        };
        if (mesh.triangle.count) ret.triangle.count = mesh.triangle.count;
        if (mesh.triangle.normal) ret.triangle.normal = mesh.triangle.normal.slice(0) as any;
        if (mesh.triangle.uvw) ret.triangle.uvw = mesh.triangle.uvw.slice(0) as any;
    }
    if ((mesh as FaceIndexMesh).position) {
        let m = mesh as FaceIndexMesh;
        let ret1 = ret as unknown as FaceIndexMesh;
        ret1.position = m.position.slice(0);
        if (m.uvw) ret1.uvw = m.uvw.slice(0);
        if (m.normal) ret1.normal = m.normal.slice(0);
    }
    return ret;
}
export function applyAffineMat4(m: FaceIndexMesh | FaceMesh, am: AffineMat4) {
    let vp = new Vec4();
    if ((m as FaceIndexMesh).position) {
        const mesh = m as FaceIndexMesh;
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
    } else {
        const mesh = m as FaceMesh;
        let position = mesh.triangle?.position;
        for (let i = 0; i < position?.length; i += 4) {
            vp.set(
                position[i],
                position[i + 1],
                position[i + 2],
                position[i + 3],
            ).mulmatls(am.mat).adds(am.vec).writeBuffer(position, i);
            let normal = mesh.triangle?.normal;
            if (normal) {
                vp.set(
                    normal[i],
                    normal[i + 1],
                    normal[i + 2],
                    normal[i + 3],
                ).mulmatls(am.mat).writeBuffer(normal, i);
            }
        }
        position = mesh.quad?.position;
        for (let i = 0; i < position?.length; i += 4) {
            vp.set(
                position[i],
                position[i + 1],
                position[i + 2],
                position[i + 3],
            ).mulmatls(am.mat).adds(am.vec).writeBuffer(position, i);
            let normal = mesh.quad?.normal;
            if (normal) {
                vp.set(
                    normal[i],
                    normal[i + 1],
                    normal[i + 2],
                    normal[i + 3],
                ).mulmatls(am.mat).writeBuffer(normal, i);
            }
        }
        return mesh;
    }
}
export function applyObj4(mesh: FaceIndexMesh | FaceMesh, obj: Obj4) {
    let vp = new Vec4();
    let scaleinv: Vec4;
    if (obj.scale && ((mesh as FaceIndexMesh).normal || mesh.quad?.normal || mesh.triangle?.normal)) {
        scaleinv = new Vec4(1 / obj.scale.x, 1 / obj.scale.y, 1 / obj.scale.z, 1 / obj.scale.w);
    }
    if ((mesh as FaceIndexMesh).position) {
        const m = mesh as FaceIndexMesh;
        for (let i = 0; i < m.position.length; i += 4) {
            if (obj.scale) {
                vp.set(
                    m.position[i] * obj.scale.x,
                    m.position[i + 1] * obj.scale.y,
                    m.position[i + 2] * obj.scale.z,
                    m.position[i + 3] * obj.scale.w,
                ).rotates(obj.rotation).adds(obj.position).writeBuffer(m.position, i);
                if (m.normal) {
                    vp.set(
                        m.normal[i] * scaleinv.x,
                        m.normal[i + 1] * scaleinv.y,
                        m.normal[i + 2] * scaleinv.z,
                        m.normal[i + 3] * scaleinv.w,
                    ).rotates(obj.rotation).norms().writeBuffer(m.normal, i);
                }
            } else {
                vp.set(
                    m.position[i],
                    m.position[i + 1],
                    m.position[i + 2],
                    m.position[i + 3],
                ).rotates(obj.rotation).adds(obj.position).writeBuffer(m.position, i);
                if (m.normal) {
                    vp.set(
                        m.normal[i],
                        m.normal[i + 1],
                        m.normal[i + 2],
                        m.normal[i + 3],
                    ).rotates(obj.rotation).writeBuffer(m.normal, i);
                }
            }
        }
    } else {
        for (let i = 0; i < mesh.quad.position.length; i += 4) {
            if (obj.scale) {
                vp.set(
                    mesh.quad.position[i] * obj.scale.x,
                    mesh.quad.position[i + 1] * obj.scale.y,
                    mesh.quad.position[i + 2] * obj.scale.z,
                    mesh.quad.position[i + 3] * obj.scale.w,
                ).rotates(obj.rotation).adds(obj.position).writeBuffer(mesh.quad.position as Float32Array, i);
                if (mesh.quad.normal) {
                    vp.set(
                        mesh.quad.normal[i] * scaleinv.x,
                        mesh.quad.normal[i + 1] * scaleinv.y,
                        mesh.quad.normal[i + 2] * scaleinv.z,
                        mesh.quad.normal[i + 3] * scaleinv.w,
                    ).rotates(obj.rotation).norms().writeBuffer(mesh.quad.normal as Float32Array, i);
                }
            } else {
                vp.set(
                    mesh.quad.position[i],
                    mesh.quad.position[i + 1],
                    mesh.quad.position[i + 2],
                    mesh.quad.position[i + 3],
                ).rotates(obj.rotation).adds(obj.position).writeBuffer(mesh.quad.position as Float32Array, i);
                if (mesh.quad.normal) {
                    vp.set(
                        mesh.quad.normal[i],
                        mesh.quad.normal[i + 1],
                        mesh.quad.normal[i + 2],
                        mesh.quad.normal[i + 3],
                    ).rotates(obj.rotation).writeBuffer(mesh.quad.normal as Float32Array, i);
                }
            }
        }
        for (let i = 0; i < mesh.triangle.position.length; i += 4) {
            if (obj.scale) {
                vp.set(
                    mesh.triangle.position[i] * obj.scale.x,
                    mesh.triangle.position[i + 1] * obj.scale.y,
                    mesh.triangle.position[i + 2] * obj.scale.z,
                    mesh.triangle.position[i + 3] * obj.scale.w,
                ).rotates(obj.rotation).adds(obj.position).writeBuffer(mesh.triangle.position as Float32Array, i);
                if (mesh.triangle.normal) {
                    vp.set(
                        mesh.triangle.normal[i] * scaleinv.x,
                        mesh.triangle.normal[i + 1] * scaleinv.y,
                        mesh.triangle.normal[i + 2] * scaleinv.z,
                        mesh.triangle.normal[i + 3] * scaleinv.w,
                    ).rotates(obj.rotation).norms().writeBuffer(mesh.triangle.normal as Float32Array, i);
                }
            } else {
                vp.set(
                    mesh.triangle.position[i],
                    mesh.triangle.position[i + 1],
                    mesh.triangle.position[i + 2],
                    mesh.triangle.position[i + 3],
                ).rotates(obj.rotation).adds(obj.position).writeBuffer(mesh.triangle.position as Float32Array, i);
                if (mesh.triangle.normal) {
                    vp.set(
                        mesh.triangle.normal[i],
                        mesh.triangle.normal[i + 1],
                        mesh.triangle.normal[i + 2],
                        mesh.triangle.normal[i + 3],
                    ).rotates(obj.rotation).writeBuffer(mesh.triangle.normal as Float32Array, i);
                }
            }
        }
    }
    return mesh;
}
export function concat(mesh1: FaceIndexMesh | FaceMesh, mesh2: FaceIndexMesh | FaceMesh): FaceIndexMesh | FaceMesh {

    if ((mesh1 as FaceIndexMesh).position && !(mesh2 as FaceIndexMesh).position) {
        console.error("cannot concat FaceIndexMesh with FaceMesh");
    }
    if ((mesh2 as FaceIndexMesh).position && !(mesh1 as FaceIndexMesh).position) {
        console.error("cannot concat FaceMesh with FaceIndexMesh");
    }

    if ((mesh1 as FaceIndexMesh).position) {
        // both are indexed
        let m1 = mesh1 as FaceIndexMesh;
        let m2 = mesh2 as FaceIndexMesh;
        // f32 data concat
        let position = new Float32Array(m1.position.length + m2.position.length);
        position.set(m1.position);
        position.set(m2.position, m1.position.length);
        let ret: FaceIndexMesh = { position };
        if (m1.normal && m2.normal) {
            let normal = new Float32Array(m1.normal.length + m2.normal.length);
            normal.set(m1.normal);
            normal.set(m2.normal, m1.normal.length);
            ret.normal = normal;
        }
        if (m1.uvw && m2.uvw) {
            let uvw = new Float32Array(m1.uvw.length + m2.uvw.length);
            uvw.set(m1.uvw);
            uvw.set(m2.uvw, m1.uvw.length);
            ret.uvw = uvw;
        }
        // index array concat
        if (m1.quad || m2.quad) {
            let quadCount1 = (m1.quad?.count << 2) || (m1.quad?.position?.length ?? 0);
            let quadCount2 = (m1.quad?.count << 2) || (m1.quad?.position?.length ?? 0);
            let quadCount = quadCount1 + quadCount2;
            let qp = new Uint32Array(quadCount);
            let hasN = !((m1.quad && !m1.quad.normal) || (m2.quad && !m2.quad.normal));
            let hasU = !((m1.quad && !m1.quad.uvw) || (m2.quad && !m2.quad.uvw));
            let qn = hasN ? new Uint32Array(quadCount) : null;
            let qu = hasU ? new Uint32Array(quadCount) : null;
            ret.quad = { position: qp, count: quadCount >> 2 };
            if (m1.quad?.position) {
                qp.set(m1.quad.position.subarray(0, quadCount1));
                if (hasN) { qn.set(m1.quad.normal.subarray(0, quadCount1)); ret.quad.normal = qn; }
                if (hasU) { qu.set(m1.quad.uvw.subarray(0, quadCount1)); ret.quad.uvw = qu; }
            }
            if (m2.quad?.position) {
                qp.set(m2.quad.position.subarray(0, quadCount2), quadCount1);
                if (hasN) qn.set(m2.quad.normal.subarray(0, quadCount2), quadCount1);
                if (hasU) qu.set(m2.quad.uvw.subarray(0, quadCount2), quadCount1);
                if (quadCount1) {
                    for (let i = quadCount1; i < quadCount; i++) {
                        qp[i] += m1.position.length >> 2;
                        if (hasN) qn[i] += m1.normal.length >> 2;
                        if (hasU) qu[i] += m1.uvw.length >> 2;
                    }
                }
            }
        }
        if (m1.triangle || m2.triangle) {
            let triangleCount1 = (m1.triangle?.count * 3) || (m1.triangle?.position?.length ?? 0);
            let triangleCount2 = (m1.triangle?.count * 3) || (m1.triangle?.position?.length ?? 0);
            let triangleCount = triangleCount1 + triangleCount2;
            let qp = new Uint32Array(triangleCount);
            let hasN = !((m1.triangle && !m1.triangle.normal) || (m2.triangle && !m2.triangle.normal));
            let hasU = !((m1.triangle && !m1.triangle.uvw) || (m2.triangle && !m2.triangle.uvw));
            let qn = hasN ? new Uint32Array(triangleCount) : null;
            let qu = hasU ? new Uint32Array(triangleCount) : null;
            ret.triangle = { position: qp, count: Math.round(triangleCount / 3) };
            if (m1.triangle?.position) {
                qp.set(m1.triangle.position.subarray(0, triangleCount1));
                if (hasN) { qn.set(m1.triangle.normal.subarray(0, triangleCount1)); ret.triangle.normal = qn; }
                if (hasU) { qu.set(m1.triangle.uvw.subarray(0, triangleCount1)); ret.triangle.uvw = qu; }
            }
            if (m2.triangle?.position) {
                qp.set(m2.triangle.position.subarray(0, triangleCount2), triangleCount1);
                if (hasN) qn.set(m2.triangle.normal.subarray(0, triangleCount2), triangleCount1);
                if (hasU) qu.set(m2.triangle.uvw.subarray(0, triangleCount2), triangleCount1);
                if (triangleCount1) {
                    for (let i = triangleCount1; i < triangleCount; i++) {
                        qp[i] += m1.position.length >> 2;
                        if (hasN) qn[i] += m1.normal.length >> 2;
                        if (hasU) qu[i] += m1.uvw.length >> 2;
                    }
                }
            }
        }


        return ret;
    } else {
        // both are not indexed
        let m1 = mesh1 as FaceMesh;
        let m2 = mesh2 as FaceMesh;
        let quad_position = new Float32Array(
            (m1.quad?.position?.length ?? 0) + (m2.quad?.position?.length ?? 0)
        );
        if (m1.quad?.position) quad_position.set(m1.quad.position);
        if (m2.quad?.position) quad_position.set(m2.quad.position, m1.quad.position?.length ?? 0);

        let tri_position = new Float32Array(
            (m1.triangle?.position?.length ?? 0) + (m2.triangle?.position?.length ?? 0)
        );
        if (m1.triangle?.position) tri_position.set(m1.triangle.position);
        if (m2.triangle?.position) tri_position.set(m2.triangle.position, m1.triangle.position?.length ?? 0);

        let ret: FaceMesh = {};
        if (quad_position.length) ret.quad = { position: quad_position };
        if (tri_position.length) ret.triangle = { position: tri_position };
        if (m1.quad?.normal && m2.quad?.normal) {
            let normal = new Float32Array((m1.quad?.normal?.length ?? 0) + (m2.quad?.normal?.length ?? 0));
            if (m1.quad?.normal) normal.set(m1.quad.normal);
            if (m2.quad?.normal) normal.set(m2.quad.normal, m1.quad?.normal?.length ?? 0);
            ret.quad.normal = normal;
        }
        if (m1.triangle?.normal && m2.triangle?.normal) {
            let normal = new Float32Array((m1.triangle?.normal?.length ?? 0) + (m2.triangle?.normal?.length ?? 0));
            if (m1.triangle?.normal) normal.set(m1.triangle.normal);
            if (m2.triangle?.normal) normal.set(m2.triangle.normal, m1.triangle?.normal?.length ?? 0);
            ret.triangle.normal = normal;
        }
        if (m1.quad?.uvw && m2.quad?.uvw) {
            let uvw = new Float32Array((m1.quad?.uvw?.length ?? 0) + (m2.quad?.uvw?.length ?? 0));
            if (m1.quad?.uvw) uvw.set(m1.quad.uvw);
            if (m2.quad?.uvw) uvw.set(m2.quad.uvw, m1.quad?.uvw?.length ?? 0);
            ret.quad.uvw = uvw;
        }
        if (m1.triangle?.uvw && m2.triangle?.uvw) {
            let uvw = new Float32Array((m1.triangle?.uvw?.length ?? 0) + (m2.triangle?.uvw?.length ?? 0));
            if (m1.triangle?.uvw) uvw.set(m1.triangle.uvw);
            if (m2.triangle?.uvw) uvw.set(m2.triangle.uvw, m1.triangle?.uvw?.length ?? 0);
            ret.triangle.uvw = uvw;
        }
        return ret;

    }
}
// todo
// export function concatarr(meshes: (FaceMesh | FaceIndexMesh)[]): FaceMesh | FaceIndexMesh {
//     let hasPosition = false;
//     for (let i = 0; i < meshes.length; i++) {
//         let cur = typeof (meshes[i] as FaceIndexMesh).position !== "undefined";
//         if (i) {
//             if (hasPosition !== cur) {
//                 console.error("Meshes must all be indexed or non-indexed.");
//                 return {};
//             }
//         }
//         hasPosition = cur;
//     }
//     if (!meshes.length) return {};
//     if ((meshes[0] as FaceIndexMesh).position) {
//         let length = 0;
//         let hasNormal = true;
//         let hasUvw = true;
//         const ms = meshes as FaceIndexMesh[];
//         for (let i = 0; i < ms.length; i++) {
//             length += ms[i].position.length;
//             hasUvw = hasUvw && (ms[i].uvw ? true : false);
//             hasNormal = hasNormal && (ms[i].normal ? true : false);
//         }
//         let position = new Float32Array(length);
//         let ret: FaceIndexMesh = { position };
//         let normal: Float32Array, uvw: Float32Array;
//         if (hasNormal) {
//             normal = new Float32Array(length);
//             ret.normal = normal;
//         }
//         if (hasUvw) {
//             uvw = new Float32Array(length);
//             ret.uvw = uvw;
//         }
//         length = 0;
//         for (let i = 0; i < meshes.length; i++) {
//             position.set(meshes[i].position, length);
//             if (hasNormal) {
//                 normal.set(meshes[i].normal, length);
//             }
//             if (hasUvw) {
//                 uvw.set(meshes[i].uvw, length);
//             }
//             length += meshes[i].position.length;
//         }
//         return ret;
//     }

// }