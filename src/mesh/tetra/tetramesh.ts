import { AffineMat4, Obj4 } from "../../math/algebra/affine";
import { Vec4 } from "../../math/algebra/vec4";
import { _180, _360, _90 } from "../../math/const";
import { toIndexbuffer, toNonIndex } from "../index";

/** Tetramesh store 4D mesh as tetrahedral list
 *  Each tetrahedral uses four vertices in the position list
 */
export interface TetraMeshData {
    position: Float32Array;
    normal?: Float32Array;
    uvw?: Float32Array;
    count?: number;
}
/** TetraIndexMesh is not supported for tetraslice rendering
 *  It is only used in data storage and mesh construction
 */
export interface TetraIndexMeshData {
    position: Float32Array;
    normal?: Float32Array;
    uvw?: Float32Array;
    positionIndex: Uint32Array;
    normalIndex?: Uint32Array;
    uvwIndex?: Uint32Array;
    count?: number;
}
export class TetraMesh implements TetraMeshData {
    position: Float32Array;
    normal?: Float32Array;
    uvw?: Float32Array;
    count?: number;
    constructor(d: TetraMeshData) {
        this.position = d.position;
        this.normal = d.normal;
        this.uvw = d.uvw;
        this.count = d.count;
    }
    applyAffineMat4(am: AffineMat4) {
        applyAffineMat4(this, am);
        return this;
    }
    applyObj4(obj4: Obj4) {
        applyObj4(this, obj4);
        return this;
    }
    clone(): TetraMesh {
        let ret = new TetraMesh({
            position: this.position.slice(0),
            count: this.count
        });
        if (this.uvw) ret.uvw = this.uvw.slice(0);
        if (this.normal) ret.normal = this.normal.slice(0);
        return ret;
    }
    toIndexMesh() {
        let position = [];
        let normal = [];
        let uvw = [];
        let posIdx = [];
        let normalIdx = [];
        let uvwIdx = [];
        toIndexbuffer(this.position, position, posIdx, 4);
        if (this.normal) toIndexbuffer(this.normal, normal, normalIdx, 4);
        if (this.uvw) toIndexbuffer(this.uvw, uvw, uvwIdx, 4);

        let out = new TetraIndexMesh({
            position: new Float32Array(position),
            positionIndex: new Uint32Array(posIdx)
        });
        if (this.normal) out.normalIndex = new Uint32Array(normalIdx);
        if (this.uvw) out.uvwIndex = new Uint32Array(uvwIdx);
        if (normal.length) out.normal = new Float32Array(normal);
        if (uvw.length) out.uvw = new Float32Array(uvw);
        return out;
    }
    /// this function will copy data and not modify original data
    concat(mesh2: TetraMesh): TetraMesh {
        let position = new Float32Array(this.position.length + mesh2.position.length);
        position.set(this.position);
        position.set(mesh2.position, this.position.length);
        let ret = new TetraMesh({ position, count: position.length >> 4 });
        if (this.normal && mesh2.normal) {
            let normal = new Float32Array(this.normal.length + mesh2.normal.length);
            normal.set(this.normal);
            normal.set(mesh2.normal, this.normal.length);
            ret.normal = normal;
        }
        if (this.uvw && mesh2.uvw) {
            let uvw = new Float32Array(this.uvw.length + mesh2.uvw.length);
            uvw.set(this.uvw);
            uvw.set(mesh2.uvw, this.uvw.length);
            ret.uvw = uvw;
        }
        return ret;
    }
    /// this function will copy data and not modify original data
    deleteTetras(tetras: number[]): TetraMesh {
        let count = this.count ?? (this.position?.length >> 4);
        let newCount = (count - tetras.length) << 4;
        let p = new Float32Array(newCount);
        let n: Float32Array;
        let u: Float32Array;
        if (this.normal) n = new Float32Array(newCount);
        if (this.uvw) u = new Float32Array(newCount);
        let offset = 0;
        for (let i = 0; i < this.count; i++) {
            if (!tetras.includes(i)) {
                p.set(this.position.subarray(i << 4, (i + 1) << 4), offset);
                if (n) n.set(this.normal.subarray(i << 4, (i + 1) << 4), offset);
                if (u) u.set(this.uvw.subarray(i << 4, (i + 1) << 4), offset);
                offset += 16;
            }
        }
        return new TetraMesh({
            position: p, normal: n, uvw: u, count: newCount >> 4
        });
    }
    generateNormal(splitThreshold?: number): this {
        if (!this.normal) {
            this.normal = new Float32Array(this.count << 4);
            const v1 = new Vec4, v2 = new Vec4, v3 = new Vec4;
            for (let i = 0, offset = 0; i < this.position.length;) {
                const a0 = new Vec4(this.position[i++], this.position[i++], this.position[i++], this.position[i++]);
                const a1 = new Vec4(this.position[i++], this.position[i++], this.position[i++], this.position[i++]);
                const a2 = new Vec4(this.position[i++], this.position[i++], this.position[i++], this.position[i++]);
                const a3 = new Vec4(this.position[i++], this.position[i++], this.position[i++], this.position[i++]);
                const normal = v1.subset(a0, a1).wedge(v2.subset(a0, a2)).wedgev(v3.subset(a0, a3)).norms();
                normal.writeBuffer(this.normal, offset); offset += 4;
                normal.writeBuffer(this.normal, offset); offset += 4;
                normal.writeBuffer(this.normal, offset); offset += 4;
                normal.writeBuffer(this.normal, offset); offset += 4;
            }
        }
        if (!splitThreshold) return this; // shade flat, complete
        // then for shade smooth
        const threshold = Math.cos(splitThreshold);
        let position: number[] = [];
        let posIdx: number[] = [];
        let point2clusterTable: number[][] = [];
        toIndexbuffer(this.position, position, posIdx, 4);
        for (let i = 0; i < posIdx.length; i++) {
            const a0 = posIdx[i];
            point2clusterTable[a0] ??= []; point2clusterTable[a0].push(i);
        }
        const newNormal = new Float32Array(this.count << 4);
        const tempNormal = new Vec4;
        for (let i = 0, i4 = 0; i < posIdx.length; i++, i4 += 4) {
            const a0 = posIdx[i];
            let thisNormal = new Vec4(this.normal[i4], this.normal[i4 + 1], this.normal[i4 + 2], this.normal[i4 + 3]);
            let sum = thisNormal.clone();
            for (const idx of point2clusterTable[a0]) {
                if (i === idx) continue;
                const idx4 = idx << 2;
                tempNormal.set(this.normal[idx4], this.normal[idx4 + 1], this.normal[idx4 + 2], this.normal[idx4 + 3]);
                if (thisNormal.dot(tempNormal) > threshold) {
                    sum.adds(tempNormal);
                }
            }
            sum.norms();
            sum.writeBuffer(newNormal, i << 2);
        }
        this.normal = newNormal;
        return this;
    }
    inverseNormal(): TetraMesh {
        let count = this.count ?? this.position.length >> 4;
        let temp: number;
        for (let i = 0; i < count; i++) {
            let offset = i << 4;
            temp = this.position[offset + 0]; this.position[offset + 0] = this.position[offset + 4]; this.position[offset + 4] = temp;
            temp = this.position[offset + 1]; this.position[offset + 1] = this.position[offset + 5]; this.position[offset + 5] = temp;
            temp = this.position[offset + 2]; this.position[offset + 2] = this.position[offset + 6]; this.position[offset + 6] = temp;
            temp = this.position[offset + 3]; this.position[offset + 3] = this.position[offset + 7]; this.position[offset + 7] = temp;
            if (this.uvw) {
                temp = this.uvw[offset + 0]; this.uvw[offset + 0] = this.uvw[offset + 4]; this.uvw[offset + 4] = temp;
                temp = this.uvw[offset + 1]; this.uvw[offset + 1] = this.uvw[offset + 5]; this.uvw[offset + 5] = temp;
                temp = this.uvw[offset + 2]; this.uvw[offset + 2] = this.uvw[offset + 6]; this.uvw[offset + 6] = temp;
                temp = this.uvw[offset + 3]; this.uvw[offset + 3] = this.uvw[offset + 7]; this.uvw[offset + 7] = temp;
            }
            if (this.normal) {
                temp = this.normal[offset + 0]; this.normal[offset + 0] = this.normal[offset + 4]; this.normal[offset + 4] = temp;
                temp = this.normal[offset + 1]; this.normal[offset + 1] = this.normal[offset + 5]; this.normal[offset + 5] = temp;
                temp = this.normal[offset + 2]; this.normal[offset + 2] = this.normal[offset + 6]; this.normal[offset + 6] = temp;
                temp = this.normal[offset + 3]; this.normal[offset + 3] = this.normal[offset + 7]; this.normal[offset + 7] = temp;
            }
        }
        this.position
        if (this.normal) {
            for (let i = 0, l = this.normal.length; i < l; i++) {
                this.normal[i] = -this.normal[i];
            }
        }
        return this;
    }
    setUVWAsPosition() {
        if (!this.uvw) this.uvw = this.position.slice(0);
        else {
            this.uvw.set(this.position);
        }
        return this;
    }
}
export class TetraIndexMesh implements TetraIndexMeshData {
    position: Float32Array;
    normal?: Float32Array;
    uvw?: Float32Array;
    positionIndex: Uint32Array;
    normalIndex?: Uint32Array;
    uvwIndex?: Uint32Array;
    count?: number;
    constructor(d: TetraIndexMeshData) {
        this.position = d.position;
        this.normal = d.normal;
        this.uvw = d.uvw;
        this.positionIndex = d.positionIndex;
        this.normalIndex = d.normalIndex;
        this.uvwIndex = d.uvwIndex;
        this.count = d.count;
    }
    applyAffineMat4(am: AffineMat4) {
        applyAffineMat4(this, am);
        return this;
    }
    applyObj4(obj4: Obj4) {
        applyObj4(this, obj4);
        return this;
    }
    toNonIndexMesh() {
        let count = this.position.length << 2;
        let out = new TetraMesh({
            position: new Float32Array(count),
            count: count >> 4
        });
        toNonIndex(this.position, this.positionIndex, out.position, 4);
        if (this.normal) {
            out.normal = new Float32Array(count);
            toNonIndex(this.normal, this.normalIndex, out.normal, 4);
        }
        if (this.uvw) {
            out.uvw = new Float32Array(count);
            toNonIndex(this.uvw, this.uvwIndex, out.uvw, 4);
        }

        return out;
    }
}

function applyAffineMat4(mesh: TetraMeshData, am: AffineMat4) {
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
function applyObj4(mesh: TetraMeshData, obj: Obj4) {
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
export function concat(meshes: TetraMeshData[]): TetraMesh {
    let length = 0;
    let hasNormal = true;
    let hasUvw = true;
    for (let i = 0; i < meshes.length; i++) {
        length += meshes[i].position.length;
        hasUvw = hasUvw && (meshes[i].uvw ? true : false);
        hasNormal = hasNormal && (meshes[i].normal ? true : false);
    }
    let position = new Float32Array(length);
    let ret = new TetraMesh({ position, count: length >> 4 });
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

