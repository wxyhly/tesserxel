namespace tesserxel {
    export namespace mesh {
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
        export namespace face {
            export function sphere(u, v) {

            }
            export function parametricSurface(
                fn: (inputuvw: math.Vec2, outputPosition: math.Vec4, outputNormal: math.Vec4) => void,
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
                let inputuvw = new math.Vec2;
                let outputVertex = new math.Vec4;
                let outputNormal = new math.Vec4;
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
        }
    }
}