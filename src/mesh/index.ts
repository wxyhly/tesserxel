namespace tesserxel {
    export namespace mesh {
        export namespace face {
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
        }
        export namespace tetra {
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
        }
        function toIndexbuffer(srcArr: Float32Array, dstArr: number[], dstIdxArr: number[], stride: number) {
            for (let i = 0, l = srcArr.length; i < l; i += stride) {
                let idx = indexOf(srcArr, i, dstArr, 4);
                if (idx === -1) {
                    idx = dstArr.length;
                    for (let q = 0; q < stride; q++) {
                        dstArr.push(srcArr[i + q]);
                    }
                }
                idx >>= 2;
                dstIdxArr.push(idx);
            }
        }
        function indexOf(
            srcArr: Float32Array, srcIdx: number, dstArr: number[], stride: number
        ) {
            for (let i = 0, j = 0, l = dstArr.length; i < l; i += stride, j++) {
                let same = true;
                for (let q = 0; q < stride; q++) {
                    same &&= srcArr[srcIdx + q] === dstArr[i + q];
                }
                if (same) {
                    return i;
                }
            }
            return -1;
        }

        function toNonIndex(srcArr: Float32Array, idxArr: Uint32Array, dstArr: Float32Array, stride: number) {
            let ptr = 0;
            for (let i = 0, l = idxArr.length; i < l; i++) {
                let idx = idxArr[i] * stride;
                for (let q = 0; q < stride; q++) {
                    dstArr[ptr++] = srcArr[idx + q];
                }
            }
        }
    }
}