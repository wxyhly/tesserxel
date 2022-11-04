import { toIndexbuffer, toNonIndex } from "../index";

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
