import { toIndexbuffer, toNonIndex } from '../index.js';
import { Vec4 } from '../../math/algebra/vec4.js';

class FaceMesh {
    quad;
    triangle;
    constructor(d) {
        this.quad = d.quad;
        this.triangle = d.triangle;
    }
    applyAffineMat4(am) {
        applyAffineMat4(this, am);
        return this;
    }
    applyObj4(obj4) {
        applyObj4(this, obj4);
        return this;
    }
    toIndexMesh() {
        let position = [];
        let normal = [];
        let uvw = [];
        let posIdx4 = [];
        let normalIdx4 = [];
        let uvwIdx4 = [];
        let posIdx3 = [];
        let normalIdx3 = [];
        let uvwIdx3 = [];
        if (this.quad) {
            toIndexbuffer(this.quad.position, position, posIdx4, 4);
            if (this.quad.normal)
                toIndexbuffer(this.quad.normal, normal, normalIdx4, 4);
            if (this.quad.uvw)
                toIndexbuffer(this.quad.uvw, uvw, uvwIdx4, 4);
        }
        if (this.triangle) {
            toIndexbuffer(this.triangle.position, position, posIdx3, 4);
            if (this.triangle.normal)
                toIndexbuffer(this.triangle.normal, normal, normalIdx3, 4);
            if (this.triangle.uvw)
                toIndexbuffer(this.triangle.uvw, uvw, uvwIdx3, 4);
        }
        let out = new FaceIndexMesh({
            position: new Float32Array(position)
        });
        if (this.quad) {
            out.quad = {
                position: new Uint32Array(posIdx4)
            };
            if (this.quad.normal)
                out.quad.normal = new Uint32Array(normalIdx4);
            if (this.quad.uvw)
                out.quad.uvw = new Uint32Array(uvwIdx4);
        }
        if (this.triangle) {
            out.triangle = {
                position: new Uint32Array(posIdx4)
            };
            if (this.triangle.normal)
                out.triangle.normal = new Uint32Array(normalIdx4);
            if (this.triangle.uvw)
                out.triangle.uvw = new Uint32Array(uvwIdx4);
        }
        if (normal.length)
            out.normal = new Float32Array(normal);
        if (uvw.length)
            out.uvw = new Float32Array(uvw);
        return out;
    }
    clone() {
        let ret = new FaceMesh({});
        if (this.quad) {
            ret.quad = {
                position: this.quad.position.slice(0)
            };
            if (this.quad.count)
                ret.quad.count = this.quad.count;
            if (this.quad.normal)
                ret.quad.normal = this.quad.normal.slice(0);
            if (this.quad.uvw)
                ret.quad.uvw = this.quad.uvw.slice(0);
        }
        if (this.triangle) {
            ret.triangle = {
                position: this.triangle.position.slice(0)
            };
            if (this.triangle.count)
                ret.triangle.count = this.triangle.count;
            if (this.triangle.normal)
                ret.triangle.normal = this.triangle.normal.slice(0);
            if (this.triangle.uvw)
                ret.triangle.uvw = this.triangle.uvw.slice(0);
        }
        return ret;
    }
    concat(m2) {
        let quad_position = new Float32Array((this.quad?.position?.length ?? 0) + (m2.quad?.position?.length ?? 0));
        if (this.quad?.position)
            quad_position.set(this.quad.position);
        if (m2.quad?.position)
            quad_position.set(m2.quad.position, this.quad.position?.length ?? 0);
        let tri_position = new Float32Array((this.triangle?.position?.length ?? 0) + (m2.triangle?.position?.length ?? 0));
        if (this.triangle?.position)
            tri_position.set(this.triangle.position);
        if (m2.triangle?.position)
            tri_position.set(m2.triangle.position, this.triangle.position?.length ?? 0);
        let ret = new FaceMesh({});
        if (quad_position.length)
            ret.quad = { position: quad_position };
        if (tri_position.length)
            ret.triangle = { position: tri_position };
        if (this.quad?.normal && m2.quad?.normal) {
            let normal = new Float32Array((this.quad?.normal?.length ?? 0) + (m2.quad?.normal?.length ?? 0));
            if (this.quad?.normal)
                normal.set(this.quad.normal);
            if (m2.quad?.normal)
                normal.set(m2.quad.normal, this.quad?.normal?.length ?? 0);
            ret.quad.normal = normal;
        }
        if (this.triangle?.normal && m2.triangle?.normal) {
            let normal = new Float32Array((this.triangle?.normal?.length ?? 0) + (m2.triangle?.normal?.length ?? 0));
            if (this.triangle?.normal)
                normal.set(this.triangle.normal);
            if (m2.triangle?.normal)
                normal.set(m2.triangle.normal, this.triangle?.normal?.length ?? 0);
            ret.triangle.normal = normal;
        }
        if (this.quad?.uvw && m2.quad?.uvw) {
            let uvw = new Float32Array((this.quad?.uvw?.length ?? 0) + (m2.quad?.uvw?.length ?? 0));
            if (this.quad?.uvw)
                uvw.set(this.quad.uvw);
            if (m2.quad?.uvw)
                uvw.set(m2.quad.uvw, this.quad?.uvw?.length ?? 0);
            ret.quad.uvw = uvw;
        }
        if (this.triangle?.uvw && m2.triangle?.uvw) {
            let uvw = new Float32Array((this.triangle?.uvw?.length ?? 0) + (m2.triangle?.uvw?.length ?? 0));
            if (this.triangle?.uvw)
                uvw.set(this.triangle.uvw);
            if (m2.triangle?.uvw)
                uvw.set(m2.triangle.uvw, this.triangle?.uvw?.length ?? 0);
            ret.triangle.uvw = uvw;
        }
        return ret;
    }
    setConstantNormal(n) {
        if (this.quad) {
            let len = this.quad.count << 4;
            this.quad.normal ??= new Float32Array(len);
            for (let i = 0; i < len; i += 4)
                n.writeBuffer(this.quad.normal, i);
        }
        if (this.triangle) {
            let len = this.triangle.count * 12;
            this.triangle.normal ??= new Float32Array(len);
            for (let i = 0; i < len; i += 4)
                n.writeBuffer(this.triangle.normal, i);
        }
        return this;
    }
}
class FaceIndexMesh {
    position;
    normal;
    uvw;
    quad;
    triangle;
    constructor(d) {
        this.quad = d.quad;
        this.triangle = d.triangle;
        this.position = d.position;
        this.normal = d.normal;
        this.uvw = d.uvw;
    }
    applyAffineMat4(am) {
        applyAffineMat4(this, am);
        return this;
    }
    applyObj4(obj4) {
        applyObj4(this, obj4);
        return this;
    }
    toNonIndexMesh() {
        let out = new FaceMesh({});
        if (this.quad) {
            let count = this.quad.position.length << 2;
            out.quad = {
                position: new Float32Array(count),
                count: count >> 4
            };
            toNonIndex(this.position, this.quad.position, out.quad.position, 4);
            if (this.normal) {
                out.quad.normal = new Float32Array(count);
                toNonIndex(this.normal, this.quad.normal, out.quad.normal, 4);
            }
            if (this.uvw) {
                out.quad.uvw = new Float32Array(count);
                toNonIndex(this.uvw, this.quad.uvw, out.quad.uvw, 4);
            }
        }
        if (this.triangle) {
            let count = this.triangle.position.length << 2;
            out.triangle = {
                position: new Float32Array(count),
                count: count / 12
            };
            toNonIndex(this.position, this.triangle.position, out.triangle.position, 4);
            if (this.normal) {
                out.triangle.normal = new Float32Array(count);
                toNonIndex(this.normal, this.triangle.normal, out.triangle.normal, 4);
            }
            if (this.uvw) {
                out.triangle.uvw = new Float32Array(count);
                toNonIndex(this.uvw, this.triangle.uvw, out.triangle.uvw, 4);
            }
        }
        return out;
    }
    clone() {
        let ret = new FaceIndexMesh({ position: this.position.slice(0) });
        if (this.uvw)
            ret.uvw = this.uvw.slice(0);
        if (this.normal)
            ret.normal = this.normal.slice(0);
        if (this.quad) {
            ret.quad = {
                position: this.quad.position.slice(0)
            };
            if (this.quad.count)
                ret.quad.count = this.quad.count;
            if (this.quad.normal)
                ret.quad.normal = this.quad.normal.slice(0);
            if (this.quad.uvw)
                ret.quad.uvw = this.quad.uvw.slice(0);
        }
        if (this.triangle) {
            ret.triangle = {
                position: this.triangle.position.slice(0)
            };
            if (this.triangle.count)
                ret.triangle.count = this.triangle.count;
            if (this.triangle.normal)
                ret.triangle.normal = this.triangle.normal.slice(0);
            if (this.triangle.uvw)
                ret.triangle.uvw = this.triangle.uvw.slice(0);
        }
        return ret;
    }
    setConstantNormal(n) {
        this.normal = new Float32Array([n.x, n.y, n.z, n.w]);
        if (this.quad) {
            this.quad.normal ??= new Uint32Array(this.quad.count << 2);
            this.quad.normal.fill(0);
        }
        if (this.triangle) {
            this.triangle.normal ??= new Uint32Array(this.triangle.count * 3);
            this.triangle.normal.fill(0);
        }
        return this;
    }
    concat(m2) {
        let position = new Float32Array(this.position.length + m2.position.length);
        position.set(this.position);
        position.set(m2.position, this.position.length);
        let ret = new FaceIndexMesh({ position });
        if (this.normal && m2.normal) {
            let normal = new Float32Array(this.normal.length + m2.normal.length);
            normal.set(this.normal);
            normal.set(m2.normal, this.normal.length);
            ret.normal = normal;
        }
        if (this.uvw && m2.uvw) {
            let uvw = new Float32Array(this.uvw.length + m2.uvw.length);
            uvw.set(this.uvw);
            uvw.set(m2.uvw, this.uvw.length);
            ret.uvw = uvw;
        }
        // index array concat
        if (this.quad || m2.quad) {
            let quadCount1 = (this.quad?.count << 2) || (this.quad?.position?.length ?? 0);
            let quadCount2 = (this.quad?.count << 2) || (this.quad?.position?.length ?? 0);
            let quadCount = quadCount1 + quadCount2;
            let qp = new Uint32Array(quadCount);
            let hasN = !((this.quad && !this.quad.normal) || (m2.quad && !m2.quad.normal));
            let hasU = !((this.quad && !this.quad.uvw) || (m2.quad && !m2.quad.uvw));
            let qn = hasN ? new Uint32Array(quadCount) : null;
            let qu = hasU ? new Uint32Array(quadCount) : null;
            ret.quad = { position: qp, count: quadCount >> 2 };
            if (this.quad?.position) {
                qp.set(this.quad.position.subarray(0, quadCount1));
                if (hasN) {
                    qn.set(this.quad.normal.subarray(0, quadCount1));
                    ret.quad.normal = qn;
                }
                if (hasU) {
                    qu.set(this.quad.uvw.subarray(0, quadCount1));
                    ret.quad.uvw = qu;
                }
            }
            if (m2.quad?.position) {
                qp.set(m2.quad.position.subarray(0, quadCount2), quadCount1);
                if (hasN)
                    qn.set(m2.quad.normal.subarray(0, quadCount2), quadCount1);
                if (hasU)
                    qu.set(m2.quad.uvw.subarray(0, quadCount2), quadCount1);
                if (quadCount1) {
                    for (let i = quadCount1; i < quadCount; i++) {
                        qp[i] += this.position.length >> 2;
                        if (hasN)
                            qn[i] += this.normal.length >> 2;
                        if (hasU)
                            qu[i] += this.uvw.length >> 2;
                    }
                }
            }
        }
        if (this.triangle || m2.triangle) {
            let triangleCount1 = (this.triangle?.count * 3) || (this.triangle?.position?.length ?? 0);
            let triangleCount2 = (this.triangle?.count * 3) || (this.triangle?.position?.length ?? 0);
            let triangleCount = triangleCount1 + triangleCount2;
            let qp = new Uint32Array(triangleCount);
            let hasN = !((this.triangle && !this.triangle.normal) || (m2.triangle && !m2.triangle.normal));
            let hasU = !((this.triangle && !this.triangle.uvw) || (m2.triangle && !m2.triangle.uvw));
            let qn = hasN ? new Uint32Array(triangleCount) : null;
            let qu = hasU ? new Uint32Array(triangleCount) : null;
            ret.triangle = { position: qp, count: Math.round(triangleCount / 3) };
            if (this.triangle?.position) {
                qp.set(this.triangle.position.subarray(0, triangleCount1));
                if (hasN) {
                    qn.set(this.triangle.normal.subarray(0, triangleCount1));
                    ret.triangle.normal = qn;
                }
                if (hasU) {
                    qu.set(this.triangle.uvw.subarray(0, triangleCount1));
                    ret.triangle.uvw = qu;
                }
            }
            if (m2.triangle?.position) {
                qp.set(m2.triangle.position.subarray(0, triangleCount2), triangleCount1);
                if (hasN)
                    qn.set(m2.triangle.normal.subarray(0, triangleCount2), triangleCount1);
                if (hasU)
                    qu.set(m2.triangle.uvw.subarray(0, triangleCount2), triangleCount1);
                if (triangleCount1) {
                    for (let i = triangleCount1; i < triangleCount; i++) {
                        qp[i] += this.position.length >> 2;
                        if (hasN)
                            qn[i] += this.normal.length >> 2;
                        if (hasU)
                            qu[i] += this.uvw.length >> 2;
                    }
                }
            }
        }
        return ret;
    }
}
function applyAffineMat4(m, am) {
    let vp = new Vec4();
    if (m.position) {
        const mesh = m;
        for (let i = 0; i < mesh.position.length; i += 4) {
            vp.set(mesh.position[i], mesh.position[i + 1], mesh.position[i + 2], mesh.position[i + 3]).mulmatls(am.mat).adds(am.vec).writeBuffer(mesh.position, i);
            if (mesh.normal) {
                vp.set(mesh.normal[i], mesh.normal[i + 1], mesh.normal[i + 2], mesh.normal[i + 3]).mulmatls(am.mat).writeBuffer(mesh.position, i);
            }
        }
        return mesh;
    }
    else {
        const mesh = m;
        let position = mesh.triangle?.position;
        for (let i = 0; i < position?.length; i += 4) {
            vp.set(position[i], position[i + 1], position[i + 2], position[i + 3]).mulmatls(am.mat).adds(am.vec).writeBuffer(position, i);
            let normal = mesh.triangle?.normal;
            if (normal) {
                vp.set(normal[i], normal[i + 1], normal[i + 2], normal[i + 3]).mulmatls(am.mat).writeBuffer(normal, i);
            }
        }
        position = mesh.quad?.position;
        for (let i = 0; i < position?.length; i += 4) {
            vp.set(position[i], position[i + 1], position[i + 2], position[i + 3]).mulmatls(am.mat).adds(am.vec).writeBuffer(position, i);
            let normal = mesh.quad?.normal;
            if (normal) {
                vp.set(normal[i], normal[i + 1], normal[i + 2], normal[i + 3]).mulmatls(am.mat).writeBuffer(normal, i);
            }
        }
        return mesh;
    }
}
function applyObj4(mesh, obj) {
    let vp = new Vec4();
    let scaleinv;
    if (obj.scale && (mesh.normal || mesh.quad?.normal || mesh.triangle?.normal)) {
        scaleinv = new Vec4(1 / obj.scale.x, 1 / obj.scale.y, 1 / obj.scale.z, 1 / obj.scale.w);
    }
    if (mesh.position) {
        const m = mesh;
        for (let i = 0; i < m.position.length; i += 4) {
            if (obj.scale) {
                vp.set(m.position[i] * obj.scale.x, m.position[i + 1] * obj.scale.y, m.position[i + 2] * obj.scale.z, m.position[i + 3] * obj.scale.w).rotates(obj.rotation).adds(obj.position).writeBuffer(m.position, i);
                if (m.normal) {
                    vp.set(m.normal[i] * scaleinv.x, m.normal[i + 1] * scaleinv.y, m.normal[i + 2] * scaleinv.z, m.normal[i + 3] * scaleinv.w).rotates(obj.rotation).norms().writeBuffer(m.normal, i);
                }
            }
            else {
                vp.set(m.position[i], m.position[i + 1], m.position[i + 2], m.position[i + 3]).rotates(obj.rotation).adds(obj.position).writeBuffer(m.position, i);
                if (m.normal) {
                    vp.set(m.normal[i], m.normal[i + 1], m.normal[i + 2], m.normal[i + 3]).rotates(obj.rotation).writeBuffer(m.normal, i);
                }
            }
        }
    }
    else {
        for (let i = 0; i < mesh.quad?.position.length; i += 4) {
            if (obj.scale) {
                vp.set(mesh.quad.position[i] * obj.scale.x, mesh.quad.position[i + 1] * obj.scale.y, mesh.quad.position[i + 2] * obj.scale.z, mesh.quad.position[i + 3] * obj.scale.w).rotates(obj.rotation).adds(obj.position).writeBuffer(mesh.quad.position, i);
                if (mesh.quad.normal) {
                    vp.set(mesh.quad.normal[i] * scaleinv.x, mesh.quad.normal[i + 1] * scaleinv.y, mesh.quad.normal[i + 2] * scaleinv.z, mesh.quad.normal[i + 3] * scaleinv.w).rotates(obj.rotation).norms().writeBuffer(mesh.quad.normal, i);
                }
            }
            else {
                vp.set(mesh.quad.position[i], mesh.quad.position[i + 1], mesh.quad.position[i + 2], mesh.quad.position[i + 3]).rotates(obj.rotation).adds(obj.position).writeBuffer(mesh.quad.position, i);
                if (mesh.quad.normal) {
                    vp.set(mesh.quad.normal[i], mesh.quad.normal[i + 1], mesh.quad.normal[i + 2], mesh.quad.normal[i + 3]).rotates(obj.rotation).writeBuffer(mesh.quad.normal, i);
                }
            }
        }
        for (let i = 0; i < mesh.triangle?.position.length; i += 4) {
            if (obj.scale) {
                vp.set(mesh.triangle.position[i] * obj.scale.x, mesh.triangle.position[i + 1] * obj.scale.y, mesh.triangle.position[i + 2] * obj.scale.z, mesh.triangle.position[i + 3] * obj.scale.w).rotates(obj.rotation).adds(obj.position).writeBuffer(mesh.triangle.position, i);
                if (mesh.triangle.normal) {
                    vp.set(mesh.triangle.normal[i] * scaleinv.x, mesh.triangle.normal[i + 1] * scaleinv.y, mesh.triangle.normal[i + 2] * scaleinv.z, mesh.triangle.normal[i + 3] * scaleinv.w).rotates(obj.rotation).norms().writeBuffer(mesh.triangle.normal, i);
                }
            }
            else {
                vp.set(mesh.triangle.position[i], mesh.triangle.position[i + 1], mesh.triangle.position[i + 2], mesh.triangle.position[i + 3]).rotates(obj.rotation).adds(obj.position).writeBuffer(mesh.triangle.position, i);
                if (mesh.triangle.normal) {
                    vp.set(mesh.triangle.normal[i], mesh.triangle.normal[i + 1], mesh.triangle.normal[i + 2], mesh.triangle.normal[i + 3]).rotates(obj.rotation).writeBuffer(mesh.triangle.normal, i);
                }
            }
        }
    }
    return mesh;
}
// todo
// export function concat(meshes: (FaceMesh | FaceIndexMesh)[]): FaceMesh | FaceIndexMesh {
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

export { FaceIndexMesh, FaceMesh };
//# sourceMappingURL=facemesh.js.map
