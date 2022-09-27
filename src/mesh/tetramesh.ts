namespace tesserxel {
    export namespace mesh {
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
        export namespace tetra {
            export let cube: TetraMesh = {
                position: new Float32Array([
                    1, 0, -1, -1,
                    1, 0, 1, 1,
                    -1, 0, -1, 1,
                    -1, 0, 1, -1,

                    -1, 0, -1, -1,
                    1, 0, -1, -1,
                    -1, 0, -1, 1,
                    -1, 0, 1, -1,

                    1, 0, 1, 1,
                    -1, 0, 1, 1,
                    -1, 0, -1, 1,
                    -1, 0, 1, -1,

                    1, 0, 1, 1,
                    1, 0, -1, -1,
                    1, 0, 1, -1,
                    -1, 0, 1, -1,

                    1, 0, 1, 1,
                    1, 0, -1, -1,
                    -1, 0, -1, 1,
                    1, 0, -1, 1,
                ]),
                normal: new Float32Array([
                    0, 1, 0, 0,
                    0, 1, 0, 0,
                    0, 1, 0, 0,
                    0, 1, 0, 0,
                    0, 1, 0, 0,
                    0, 1, 0, 0,
                    0, 1, 0, 0,
                    0, 1, 0, 0,
                    0, 1, 0, 0,
                    0, 1, 0, 0,
                    0, 1, 0, 0,
                    0, 1, 0, 0,
                    0, 1, 0, 0,
                    0, 1, 0, 0,
                    0, 1, 0, 0,
                    0, 1, 0, 0,
                    0, 1, 0, 0,
                    0, 1, 0, 0,
                    0, 1, 0, 0,
                    0, 1, 0, 0,
                ]),
                uvw: new Float32Array([
                    1, -1, -1, 0,
                    1, 1, 1, 0,
                    -1, -1, 1, 0,
                    -1, 1, -1, 0,
                    -1, -1, -1, 0,
                    1, -1, -1, 0,
                    -1, -1, 1, 0,
                    -1, 1, -1, 0,
                    1, 1, 1, 0,
                    -1, 1, 1, 0,
                    -1, -1, 1, 0,
                    -1, 1, -1, 0,
                    1, 1, 1, 0,
                    1, -1, -1, 0,
                    1, 1, -1, 0,
                    -1, 1, -1, 0,
                    1, 1, 1, 0,
                    1, -1, -1, 0,
                    -1, -1, 1, 0,
                    1, -1, 1, 0,
                ]),
                count: 5
            }
            export function applyAffineMat4(mesh: TetraMesh, am: math.AffineMat4) {
                let vp = new math.Vec4();
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
            export function applyObj4(mesh: TetraMesh, obj: math.Obj4) {
                let vp = new math.Vec4();
                let scaleinv: math.Vec4;
                if (obj.scale && mesh.normal) {
                    scaleinv = new math.Vec4(1 / obj.scale.x, 1 / obj.scale.y, 1 / obj.scale.z, 1 / obj.scale.w);
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
                let ret: TetraMesh = { position, count: length << 4 };
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
            export function tesseract(): TetraMesh {
                let rotor = new math.Rotor();
                let biv = new math.Bivec();
                let yface = applyObj4(clone(cube), new math.Obj4(math.Vec4.y, rotor.expset(biv.set(0, math._90))));
                let meshes = [
                    biv.set(math._90).exp(),
                    biv.set(-math._90).exp().mulsl(rotor.expset(biv.set(0, 0, 0, 0, math._180))),
                    biv.set(0, 0, 0, math._90).exp().mulsl(rotor.expset(biv.set(math._90, 0, 0, 0, 0))),
                    biv.set(0, 0, 0, -math._90).exp().mulsl(rotor.expset(biv.set(math._90, 0, 0, 0, 0))),
                    biv.set(0, 0, 0, 0, math._90).exp().mulsl(rotor.expset(biv.set(math._90, 0, 0, 0, 0))),
                    biv.set(0, 0, 0, 0, -math._90).exp().mulsl(rotor.expset(biv.set(math._90, 0, 0, 0, 0))),
                    biv.set(math._180).exp(),
                ].map(r => applyObj4(clone(yface), new math.Obj4(new math.Vec4(), r)));
                meshes.push(yface);
                let m = concatarr(meshes);
                for (let i = 0; i < 8; i++) {
                    for (let j = 0; j < 20; j++) {
                        m.uvw[i * 80 + j * 4 + 3] = i;
                    }
                }
                return m;
            }
            export function inverseNormal(mesh: TetraMesh): TetraMesh {
                if (mesh.normal) {
                    for (let i = 0, l = mesh.normal.length; i < l; i++) {
                        mesh.normal[i] = -mesh.normal[i];
                    }
                }
                return mesh;
            }
            export let hexadecachoron: TetraMesh = {
                position: new Float32Array([
                    1, 0, 0, 0,
                    0, 1, 0, 0,
                    0, 0, 1, 0,
                    0, 0, 0, 1,
                    0, 1, 0, 0,
                    1, 0, 0, 0,
                    0, 0, 1, 0,
                    0, 0, 0, -1,
                    0, 1, 0, 0,
                    1, 0, 0, 0,
                    0, 0, -1, 0,
                    0, 0, 0, 1,
                    1, 0, 0, 0,
                    0, 1, 0, 0,
                    0, 0, -1, 0,
                    0, 0, 0, -1,

                    0, -1, 0, 0,
                    1, 0, 0, 0,
                    0, 0, 1, 0,
                    0, 0, 0, 1,
                    1, 0, 0, 0,
                    0, -1, 0, 0,
                    0, 0, 1, 0,
                    0, 0, 0, -1,
                    1, 0, 0, 0,
                    0, -1, 0, 0,
                    0, 0, -1, 0,
                    0, 0, 0, 1,
                    0, -1, 0, 0,
                    1, 0, 0, 0,
                    0, 0, -1, 0,
                    0, 0, 0, -1,


                    0, 1, 0, 0,
                    -1, 0, 0, 0,
                    0, 0, 1, 0,
                    0, 0, 0, 1,
                    -1, 0, 0, 0,
                    0, 1, 0, 0,
                    0, 0, 1, 0,
                    0, 0, 0, -1,
                    -1, 0, 0, 0,
                    0, 1, 0, 0,
                    0, 0, -1, 0,
                    0, 0, 0, 1,
                    0, 1, 0, 0,
                    -1, 0, 0, 0,
                    0, 0, -1, 0,
                    0, 0, 0, -1,

                    -1, 0, 0, 0,
                    0, -1, 0, 0,
                    0, 0, 1, 0,
                    0, 0, 0, 1,
                    0, -1, 0, 0,
                    -1, 0, 0, 0,
                    0, 0, 1, 0,
                    0, 0, 0, -1,
                    0, -1, 0, 0,
                    -1, 0, 0, 0,
                    0, 0, -1, 0,
                    0, 0, 0, 1,
                    -1, 0, 0, 0,
                    0, -1, 0, 0,
                    0, 0, -1, 0,
                    0, 0, 0, -1,

                ]),
                normal: new Float32Array([
                    0.5, 0.5, 0.5, 0.5,
                    0.5, 0.5, 0.5, 0.5,
                    0.5, 0.5, 0.5, 0.5,
                    0.5, 0.5, 0.5, 0.5,
                    0.5, 0.5, 0.5, -0.5,
                    0.5, 0.5, 0.5, -0.5,
                    0.5, 0.5, 0.5, -0.5,
                    0.5, 0.5, 0.5, -0.5,
                    0.5, 0.5, -0.5, 0.5,
                    0.5, 0.5, -0.5, 0.5,
                    0.5, 0.5, -0.5, 0.5,
                    0.5, 0.5, -0.5, 0.5,
                    0.5, 0.5, -0.5, -0.5,
                    0.5, 0.5, -0.5, -0.5,
                    0.5, 0.5, -0.5, -0.5,
                    0.5, 0.5, -0.5, -0.5,

                    0.5, -0.5, 0.5, 0.5,
                    0.5, -0.5, 0.5, 0.5,
                    0.5, -0.5, 0.5, 0.5,
                    0.5, -0.5, 0.5, 0.5,
                    0.5, -0.5, 0.5, -0.5,
                    0.5, -0.5, 0.5, -0.5,
                    0.5, -0.5, 0.5, -0.5,
                    0.5, -0.5, 0.5, -0.5,
                    0.5, -0.5, -0.5, 0.5,
                    0.5, -0.5, -0.5, 0.5,
                    0.5, -0.5, -0.5, 0.5,
                    0.5, -0.5, -0.5, 0.5,
                    0.5, -0.5, -0.5, -0.5,
                    0.5, -0.5, -0.5, -0.5,
                    0.5, -0.5, -0.5, -0.5,
                    0.5, -0.5, -0.5, -0.5,


                    -0.5, 0.5, 0.5, 0.5,
                    -0.5, 0.5, 0.5, 0.5,
                    -0.5, 0.5, 0.5, 0.5,
                    -0.5, 0.5, 0.5, 0.5,
                    -0.5, 0.5, 0.5, -0.5,
                    -0.5, 0.5, 0.5, -0.5,
                    -0.5, 0.5, 0.5, -0.5,
                    -0.5, 0.5, 0.5, -0.5,
                    -0.5, 0.5, -0.5, 0.5,
                    -0.5, 0.5, -0.5, 0.5,
                    -0.5, 0.5, -0.5, 0.5,
                    -0.5, 0.5, -0.5, 0.5,
                    -0.5, 0.5, -0.5, -0.5,
                    -0.5, 0.5, -0.5, -0.5,
                    -0.5, 0.5, -0.5, -0.5,
                    -0.5, 0.5, -0.5, -0.5,

                    -0.5, -0.5, 0.5, 0.5,
                    -0.5, -0.5, 0.5, 0.5,
                    -0.5, -0.5, 0.5, 0.5,
                    -0.5, -0.5, 0.5, 0.5,
                    -0.5, -0.5, 0.5, -0.5,
                    -0.5, -0.5, 0.5, -0.5,
                    -0.5, -0.5, 0.5, -0.5,
                    -0.5, -0.5, 0.5, -0.5,
                    -0.5, -0.5, -0.5, 0.5,
                    -0.5, -0.5, -0.5, 0.5,
                    -0.5, -0.5, -0.5, 0.5,
                    -0.5, -0.5, -0.5, 0.5,
                    -0.5, -0.5, -0.5, -0.5,
                    -0.5, -0.5, -0.5, -0.5,
                    -0.5, -0.5, -0.5, -0.5,
                    -0.5, -0.5, -0.5, -0.5,
                ]),
                uvw: new Float32Array([
                    0, 0, 0, 0,
                    1, 1, 0, 0,
                    1, 0, 1, 0,
                    0, 1, 1, 0,
                    0, 0, 0, 1,
                    1, 1, 0, 1,
                    1, 0, 1, 1,
                    0, 1, 1, 1,
                    0, 0, 0, 2,
                    1, 1, 0, 2,
                    1, 0, 1, 2,
                    0, 1, 1, 2,
                    0, 0, 0, 3,
                    1, 1, 0, 3,
                    1, 0, 1, 3,
                    0, 1, 1, 3,
                    0, 0, 0, 4,
                    1, 1, 0, 4,
                    1, 0, 1, 4,
                    0, 1, 1, 4,
                    0, 0, 0, 5,
                    1, 1, 0, 5,
                    1, 0, 1, 5,
                    0, 1, 1, 5,
                    0, 0, 0, 6,
                    1, 1, 0, 6,
                    1, 0, 1, 6,
                    0, 1, 1, 6,
                    0, 0, 0, 7,
                    1, 1, 0, 7,
                    1, 0, 1, 7,
                    0, 1, 1, 7,
                    0, 0, 0, 8,
                    1, 1, 0, 8,
                    1, 0, 1, 8,
                    0, 1, 1, 8,
                    0, 0, 0, 9,
                    1, 1, 0, 9,
                    1, 0, 1, 9,
                    0, 1, 1, 9,
                    0, 0, 0, 10,
                    1, 1, 0, 10,
                    1, 0, 1, 10,
                    0, 1, 1, 10,
                    0, 0, 0, 11,
                    1, 1, 0, 11,
                    1, 0, 1, 11,
                    0, 1, 1, 11,
                    0, 0, 0, 12,
                    1, 1, 0, 12,
                    1, 0, 1, 12,
                    0, 1, 1, 12,
                    0, 0, 0, 13,
                    1, 1, 0, 13,
                    1, 0, 1, 13,
                    0, 1, 1, 13,
                    0, 0, 0, 14,
                    1, 1, 0, 14,
                    1, 0, 1, 14,
                    0, 1, 1, 14,
                    0, 0, 0, 15,
                    1, 1, 0, 15,
                    1, 0, 1, 15,
                    0, 1, 1, 15,
                ]),
                count: 16
            };
            export function glome(radius: number, xySegment: number, zwSegment: number, latitudeSegment: number) {
                if (xySegment < 3) xySegment = 3;
                if (zwSegment < 3) zwSegment = 3;
                if (latitudeSegment < 1) latitudeSegment = 1;
                return parametricSurface((uvw, pos, norm) => {
                    let u = uvw.x * math._360;
                    let v = uvw.y * math._360;
                    let w = uvw.z * math._90;
                    let cos = Math.cos(w) * radius;
                    let sin = Math.sin(w) * radius;
                    pos.set(-Math.cos(u) * cos, Math.sin(u) * cos, Math.cos(v) * sin, Math.sin(v) * sin);
                    norm.copy(pos);
                }, xySegment, zwSegment, latitudeSegment);
            }

            export function spheritorus(
                sphereRadius: number, longitudeSegment: number, latitudeSegment: number,
                circleRadius: number, circleSegment: number
            ) {
                if (longitudeSegment < 3) longitudeSegment = 3;
                if (latitudeSegment < 3) latitudeSegment = 3;
                if (circleSegment < 3) circleSegment = 3;
                return parametricSurface((uvw, pos, norm) => {
                    let u = uvw.x * math._360;
                    let v = uvw.y * math._180;
                    let w = uvw.z * math._360;
                    let sv = Math.sin(v);
                    let radius = circleRadius + sv * Math.cos(u) * sphereRadius;
                    let sw = Math.sin(w) * radius;
                    let cw = Math.cos(w) * radius;
                    pos.set(
                        -cw, sv * Math.sin(u) * sphereRadius, Math.cos(v) * sphereRadius, sw
                    );
                    norm.set(
                        -sv * Math.cos(u) * Math.cos(w),
                        sv * Math.sin(u),
                        Math.cos(v),
                        sv * Math.cos(u) * Math.sin(w),
                    );
                }, longitudeSegment, latitudeSegment, circleSegment);
            }
            export function torisphere(
                circleRadius: number, circleSegment: number,
                sphereRadius: number, longitudeSegment: number, latitudeSegment: number
            ) {
                if (longitudeSegment < 3) longitudeSegment = 3;
                if (latitudeSegment < 3) latitudeSegment = 3;
                if (circleSegment < 3) circleSegment = 3;
                return parametricSurface((uvw, pos, norm) => {
                    let u = -uvw.x * math._360;
                    let v = uvw.y * math._180;
                    let w = uvw.z * math._360;
                    let sv = Math.sin(v);
                    let cw = Math.cos(w);
                    let radius = circleRadius * cw + sphereRadius;
                    pos.set(
                        sv * Math.cos(u) * radius,
                        circleRadius * Math.sin(w),
                        sv * Math.sin(u) * radius,
                        Math.cos(v) * radius,
                    );
                    norm.set(
                        sv * Math.cos(u) * cw,
                        Math.sin(w),
                        sv * Math.sin(u) * cw,
                        Math.cos(v) * cw,
                    );
                }, longitudeSegment, latitudeSegment, circleSegment);
            }
            export function tiger(xyRadius: number, xySegment: number, zwRadius: number, zwSegment: number, secondaryRadius: number, secondarySegment: number) {
                if (xySegment < 3) xySegment = 3;
                if (zwSegment < 3) zwSegment = 3;
                if (secondarySegment < 3) secondarySegment = 3;
                return parametricSurface((uvw, pos, norm) => {

                    let u = uvw.x * math._360;
                    let v = uvw.y * math._360;
                    let w = uvw.z * math._360;
                    let su = Math.sin(w);
                    let cu = Math.cos(w);

                    pos.set(
                        (su * secondaryRadius + xyRadius) * Math.sin(u),
                        (su * secondaryRadius + xyRadius) * Math.cos(u),
                        (cu * secondaryRadius + zwRadius) * Math.sin(v),
                        (cu * secondaryRadius + zwRadius) * Math.cos(v),
                    );
                    norm.set(
                        su * Math.sin(u),
                        su * Math.cos(u),
                        cu * Math.sin(v),
                        cu * Math.cos(v),
                    );
                }, xySegment, zwSegment, secondarySegment);
            }
            export function parametricSurface(
                fn: (inputUVW: math.Vec3, outputPosition: math.Vec4, outputNormal: math.Vec4) => void,
                uSegment: number, vSegment: number, wSegment: number
            ): TetraMesh {
                if (uSegment < 1) uSegment = 1;
                if (vSegment < 1) vSegment = 1;
                if (wSegment < 1) wSegment = 1;
                let count = uSegment * vSegment * wSegment * 5;
                let arraySize = count << 4;
                uSegment++; vSegment++; wSegment++;
                let vw_seg = vSegment * wSegment;
                let uvw_seg = uSegment * vw_seg;
                let positions = new Float32Array((uvw_seg) << 2);
                let normals = new Float32Array((uvw_seg) << 2);
                let uvws = new Float32Array((uvw_seg) << 2);
                let position = new Float32Array(arraySize);
                let normal = new Float32Array(arraySize);
                let uvw = new Float32Array(arraySize);
                let inputUVW = new math.Vec3;
                let idxbuffer = new Uint32Array(8);
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
                function pushTetra(a: number, b: number, c: number, d: number) {
                    a = idxbuffer[a];
                    b = idxbuffer[b];
                    c = idxbuffer[c];
                    d = idxbuffer[d];
                    function same(offset1: number, offset2: number) {
                        return positions[offset1] === positions[offset2] &&
                            positions[offset1 + 1] === positions[offset2 + 1] &&
                            positions[offset1 + 2] === positions[offset2 + 2] &&
                            positions[offset1 + 3] === positions[offset2 + 3];
                    }
                    if (!(same(a, b) || same(a, c) || same(a, d) || same(b, c) || same(b, d))) {
                        pushIdx(a); pushIdx(b); pushIdx(c); pushIdx(d);
                    }
                }
                for (let u_index = 0; u_index < uSegment; u_index++) {
                    inputUVW.x = u_index / (uSegment - 1);
                    let u_offset = vSegment * u_index;
                    for (let v_index = 0; v_index < vSegment; v_index++) {
                        inputUVW.y = v_index / (vSegment - 1);
                        let v_offset = wSegment * (v_index + u_offset);
                        for (let w_index = 0; w_index < wSegment; w_index++) {
                            inputUVW.z = w_index / (wSegment - 1);
                            fn(inputUVW, outputVertex, outputNormal);
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
                            uvws[ptr++] = inputUVW.x;
                            uvws[ptr++] = inputUVW.y;
                            uvws[ptr++] = inputUVW.z;
                            uvws[ptr++] = 0;
                            if (u_index && v_index && w_index) {
                                let offset = w_index + v_offset;
                                idxbuffer[0] = offset << 2;
                                idxbuffer[1] = offset - 1 << 2;
                                idxbuffer[2] = offset - wSegment << 2;
                                idxbuffer[3] = offset - wSegment - 1 << 2;
                                idxbuffer[4] = offset - vw_seg << 2;
                                idxbuffer[5] = offset - vw_seg - 1 << 2;
                                idxbuffer[6] = offset - vw_seg - wSegment << 2;
                                idxbuffer[7] = offset - vw_seg - wSegment - 1 << 2;
                                pushTetra(0, 1, 2, 4);
                                pushTetra(1, 5, 7, 4);
                                pushTetra(1, 2, 7, 3);
                                pushTetra(4, 6, 7, 2);
                                pushTetra(1, 2, 4, 7);
                            }
                        }
                    }
                }
                return { position, normal, uvw, count };
            }
            export function convexhull(points: math.Vec4[]) {
                // todo: fix a random dead loop bug
                if (points.length < 5) return;
                points.sort((a, b) => Math.random() - 0.5);
                let _vec41 = new math.Vec4();
                let _vec42 = new math.Vec4();
                let _vec43 = new math.Vec4();
                let _vec44 = new math.Vec4();
                // let _vec45 = new math.Vec4();
                let _mat4 = new math.Mat4();
                let determinant = 0;
                let nobreak = true;
                let a = 0, b = 1, c = 2, d = 3, e = 4;
                let epsilon = 1e-10;
                for (a = 0; a < points.length && nobreak; a++) {
                    for (b = a + 1; b < points.length && nobreak; b++) {
                        for (c = b + 1; c < points.length && nobreak; c++) {
                            for (d = c + 1; d < points.length && nobreak; d++) {
                                for (e = d + 1; e < points.length; e++) {
                                    determinant = det(a, b, c, d, e);
                                    if (Math.abs(determinant) > epsilon) {
                                        nobreak = false;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
                if (determinant === 0) return;
                let temp: math.Vec4; b--; c--; d--; a--;
                temp = points[0]; points[0] = points[a]; points[a] = temp;
                if (b === 0) b = a; if (c === 0) c = a; if (d === 0) d = a; if (e === 0) e = a;
                temp = points[1]; points[1] = points[b]; points[b] = temp;
                if (c === 1) c = b; if (d === 1) d = b; if (e === 1) e = b;
                temp = points[2]; points[2] = points[c]; points[c] = temp;
                if (d === 2) d = c; if (e === 2) e = c;
                temp = points[3]; points[3] = points[d]; points[d] = temp;
                if (e === 3) e = d;
                temp = points[4]; points[4] = points[e]; points[e] = temp;
                let count = 5; // indices.length === count * 4 always is true
                console.log(determinant);
                console.log(det(0, 1, 2, 3, 4));
                let indices = det(0, 1, 2, 3, 4) > 0 ?
                    [1, 2, 3, 4, 2, 0, 3, 4, 0, 1, 3, 4, 1, 0, 2, 4, 0, 1, 2, 3]
                    :
                    [2, 1, 3, 4, 0, 2, 3, 4, 1, 0, 3, 4, 0, 1, 2, 4, 1, 0, 2, 3];
                function det(a: number, b: number, c: number, d: number, e: number) {
                    let p = points[e];
                    return _mat4.augVec4set(
                        _vec41.subset(p, points[a]),
                        _vec42.subset(p, points[b]),
                        _vec43.subset(p, points[c]),
                        _vec44.subset(p, points[d]),
                    ).det();
                }
                for (let cursor = 5; cursor < points.length; cursor++) {
                    let newIndices = [];
                    // borderformat [v1,v2,v3,flag], v1>v2>v3, 
                    // flag: 1 orientation +, 0 orientation -, 2 duplicate remove
                    let border: number[][] = [];
                    function checkBorder(a: number, b: number, c: number) {
                        let item = a > b ? b > c ? [a, b, c, 1] : a > c ? [a, c, b, 0] : [c, a, b, 1] :
                            a > c ? [b, a, c, 0] : b > c ? [b, c, a, 1] : [c, b, a, 0];
                        let found = false;
                        for (let i of border) {
                            if (i[0] === item[0] && i[1] === item[1] && i[2] === item[2]) {
                                i[3] = 2;
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            border.push(item);
                        }
                    }
                    for (let cell = 0; cell < count; cell++) {
                        let a = indices[cell << 2];
                        let b = indices[(cell << 2) + 1];
                        let c = indices[(cell << 2) + 2];
                        let d = indices[(cell << 2) + 3];
                        let determinant = det(a, b, c, d, cursor);
                        if (determinant < epsilon) {
                            checkBorder(b, c, d);
                            checkBorder(c, a, d);
                            checkBorder(a, b, d);
                            checkBorder(b, a, c);
                        } else {
                            newIndices.push(a, b, c, d);
                        }
                    }
                    for (let b of border) {
                        if (b[3] === 2) continue;
                        else if (b[3] === 0) newIndices.push(b[0], b[1], b[2], cursor);
                        else if (b[3] === 1) newIndices.push(b[0], b[2], b[1], cursor);
                    }
                    indices = newIndices;
                    count = indices.length >> 2;
                }
                let position = new Float32Array(count << 4);
                let countPtr = 0;
                for (let p = 0; p < count; p++) {
                    points[indices[(p << 2)]].writeBuffer(position, countPtr); countPtr += 4;
                    points[indices[(p << 2) + 1]].writeBuffer(position, countPtr); countPtr += 4;
                    points[indices[(p << 2) + 2]].writeBuffer(position, countPtr); countPtr += 4;
                    points[indices[(p << 2) + 3]].writeBuffer(position, countPtr); countPtr += 4;
                }
                return {
                    position,
                    count
                }
            }
            export function duocone(xyRadius: number, xySegment: number, zwRadius: number, zwSegment: number) {
                let ps = [];
                for (let i = 0; i < xySegment; i++) {
                    let ii = i * math._360 / xySegment;
                    ps.push(new math.Vec4(xyRadius * Math.cos(ii), xyRadius * Math.sin(ii)));
                }
                for (let i = 0; i < zwSegment; i++) {
                    let ii = i * math._360 / zwSegment;
                    ps.push(new math.Vec4(0, 0, zwRadius * Math.cos(ii), zwRadius * Math.sin(ii)));
                }
                return tesserxel.mesh.tetra.convexhull(ps);
            }

            export function duocylinder(xyRadius: number, xySegment: number, zwRadius: number, zwSegment: number) {
                let ps = [];
                for (let i = 0; i < xySegment; i++) {
                    let ii = i * math._360 / xySegment;
                    for (let j = 0; j < zwSegment; j++) {
                        let jj = j * math._360 / zwSegment;
                        ps.push(new math.Vec4(
                            xyRadius * Math.cos(ii), xyRadius * Math.sin(ii),
                            zwRadius * Math.cos(jj), zwRadius * Math.sin(jj)
                        ));
                    }
                }
                return tesserxel.mesh.tetra.convexhull(ps);
            }
            export function loft(sp: tesserxel.math.Spline, section: tesserxel.mesh.FaceMesh, step: number): tesserxel.mesh.TetraMesh {
                let { points, rotors, curveLength } = sp.generate(step);
                let quadcount = section.quad ? section.quad.position.length >> 4 : 0;
                let count4 = quadcount * (points.length - 1) * 5;
                let tricount = section.triangle ? section.triangle.position.length / 12 : 0;
                let count3 = tricount * (points.length - 1) * 3;
                let arraySize = count4 + count3 << 4;
                let pslen4 = quadcount * points.length << 4;
                let pslen3 = tricount * points.length * 12;
                let pslen = Math.max(pslen4, pslen3);
                let positions = new Float32Array(pslen);
                let uvws = new Float32Array(pslen);
                let normals = new Float32Array(pslen);
                let position = new Float32Array(arraySize);
                let uvw = new Float32Array(arraySize);
                let normal = new Float32Array(arraySize);
                let _vec4 = new math.Vec4(); // cache
                let offset = 0;
                let idxPtr = 0;
                if (section.quad) {
                    let pos = section.quad.position;
                    let norm = section.quad.normal;
                    let uv = section.quad.uvw;
                    for (let ptr = 0; ptr < (quadcount << 4); ptr += 16) {
                        for (let j = 0; j < rotors.length; j++) {
                            let r = rotors[j];
                            let p = points[j];
                            for (let i = 0; i < 4; i++, ptr += 4) {
                                _vec4.set(pos[ptr], pos[ptr + 1], pos[ptr + 2], pos[ptr + 3]);
                                _vec4.rotates(r).adds(p);
                                _vec4.writeBuffer(positions, offset);
                                _vec4.set(norm[ptr], norm[ptr + 1], norm[ptr + 2], norm[ptr + 3]);
                                _vec4.rotates(r);
                                _vec4.writeBuffer(normals, offset);
                                _vec4.set(uv[ptr], uv[ptr + 1], uv[ptr + 2], curveLength[j]);
                                _vec4.writeBuffer(uvws, offset);
                                offset += 4;
                            }
                            ptr -= 16;
                            if (j) {
                                let doffset = offset - 32;
                                pushTetra(doffset, 0, 1, 3, 4);
                                pushTetra(doffset, 1, 5, 6, 4);
                                pushTetra(doffset, 1, 3, 6, 2);
                                pushTetra(doffset, 4, 7, 6, 3);
                                pushTetra(doffset, 1, 3, 4, 6);
                            }
                        }
                    }
                }
                if (section.triangle) {
                    offset = 0;
                    let pos = section.triangle.position;
                    let norm = section.triangle.normal;
                    let uv = section.triangle.uvw;
                    for (let ptr = 0, l = tricount * 12; ptr < l; ptr += 12) {
                        for (let j = 0; j < rotors.length; j++) {
                            let r = rotors[j];
                            let p = points[j];
                            for (let i = 0; i < 3; i++, ptr += 4) {
                                _vec4.set(pos[ptr], pos[ptr + 1], pos[ptr + 2], pos[ptr + 3]);
                                _vec4.rotates(r).adds(p);
                                _vec4.writeBuffer(positions, offset);
                                _vec4.set(norm[ptr], norm[ptr + 1], norm[ptr + 2], norm[ptr + 3]);
                                _vec4.rotates(r);
                                _vec4.writeBuffer(normals, offset);
                                _vec4.set(uv[ptr], uv[ptr + 1], uv[ptr + 2], curveLength[j]);
                                _vec4.writeBuffer(uvws, offset);
                                offset += 4;
                            }
                            ptr -= 12;
                            if (j) {
                                let doffset = offset - 24;
                                pushTetra(doffset, 0, 1, 2, 3);
                                pushTetra(doffset, 1, 2, 3, 5);
                                pushTetra(doffset, 3, 4, 5, 1);
                            }
                        }
                    }
                }
                function pushTetra(offset: number, a: number, b: number, c: number, d: number) {
                    a = offset + (a << 2);
                    b = offset + (b << 2);
                    c = offset + (c << 2);
                    d = offset + (d << 2);
                    pushIdx(a); pushIdx(b); pushIdx(c); pushIdx(d);
                }
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
                return { position, uvw, normal, count: count3 + count4 };
            }
            export function directProduct(shape1: FaceIndexMesh, shape2: FaceIndexMesh) {
                /** border(A x B) = border(A) x B + A x border(B) */
                let edge1 = face.findBorder(shape1);
                let edge2 = face.findBorder(shape2);
                // A x border(B)
                let quadcount1 = shape1.quad ? shape1.quad.position.length >> 2 : 0;
                let count14 = quadcount1 * edge2.length * 5;
                let tricount1 = shape1.triangle ? shape1.triangle.position.length / 3 : 0;
                let count13 = tricount1 * edge2.length * 3;
                let pslen1 = Math.max(quadcount1 * edge2.length << 5, tricount1 * edge2.length * 24);

                // border(A) x B 
                let quadcount2 = shape2.quad ? shape2.quad.position.length >> 2 : 0;
                let count24 = quadcount2 *  edge1.length * 5;
                let tricount2 = shape2.triangle ? shape2.triangle.position.length / 3 : 0;
                let count23 = tricount2 *  edge1.length * 3;
                let pslen2 = Math.max(quadcount2 * edge1.length << 5, tricount2 * edge1.length * 24);

                let arraySize = count14 + count13 + count23 + count24 << 4;
                let pslen = Math.max(pslen1, pslen2);
                let positions = new Float32Array(pslen);
                let uvws = new Float32Array(pslen);
                let normals = new Float32Array(pslen);
                let position = new Float32Array(arraySize);
                let uvw = new Float32Array(arraySize);
                let normal = new Float32Array(arraySize);
                let _vec4 = new math.Vec4(); // cache
                let _vec4p = new math.Vec4(); // cache
                let _vec4q = new math.Vec4(); // cache
                let _vec4n = new math.Vec4(); // cache
                let offset = 0;
                let idxPtr = 0;
                if (shape1.quad) {
                    let posIdx = shape1.quad.position;
                    let uvIdx = shape1.quad.uvw;
                    let pos = shape1.position;
                    let uv = shape1.uvw;
                    for (let ptr = 0, l = posIdx.length; ptr < l;ptr+=4) {
                        for (let j of edge2) {
                            let ie = j[0] << 2;
                            // pq is border segment
                            let p = _vec4p.set(
                                shape2.position[ie + 2], shape2.position[ie + 3],
                                shape2.position[ie], shape2.position[ie + 1],
                            );
                            ie = j[1] << 2;
                            let q = _vec4q.set(
                                shape2.position[ie + 2], shape2.position[ie + 3],
                                shape2.position[ie], shape2.position[ie + 1],
                            );
                            let normal = _vec4n.subset(q, p).norms();
                            [normal.z, normal.w] = [-normal.w, normal.z];
                            for (let i = 0; i < 4; i++, ptr++) {
                                let ipos = posIdx[ptr] << 2;
                                let iuv = uvIdx[ptr] << 2;
                                _vec4.set(pos[ipos], pos[ipos + 1], pos[ipos + 2], pos[ipos + 3]);
                                _vec4.adds(p);
                                _vec4.writeBuffer(positions, offset);
                                _vec4.set(0, 0, normal.z, normal.w);
                                _vec4.writeBuffer(normals, offset);
                                _vec4.set(uv[iuv], uv[iuv + 1], uv[iuv + 2], 0);
                                _vec4.writeBuffer(uvws, offset);
                                offset += 4;
                            }
                            ptr -= 4;
                            for (let i = 0; i < 4; i++, ptr++) {
                                let ipos = posIdx[ptr] << 2;
                                let iuv = uvIdx[ptr] << 2;
                                _vec4.set(pos[ipos], pos[ipos + 1], pos[ipos + 2], pos[ipos + 3]);
                                _vec4.adds(q);
                                _vec4.writeBuffer(positions, offset);
                                _vec4.set(0, 0, normal.z, normal.w);
                                _vec4.writeBuffer(normals, offset);
                                _vec4.set(uv[iuv], uv[iuv + 1], uv[iuv + 2], 0);
                                _vec4.writeBuffer(uvws, offset);
                                offset += 4;
                            }
                            ptr -= 4;
                            let doffset = offset - 32;
                            pushTetra(doffset, 0, 1, 3, 4);
                            pushTetra(doffset, 1, 5, 6, 4);
                            pushTetra(doffset, 1, 3, 6, 2);
                            pushTetra(doffset, 4, 7, 6, 3);
                            pushTetra(doffset, 1, 3, 4, 6);
                        }
                    }
                }
                offset = 0;
                if (shape1.triangle) {
                    let posIdx = shape1.triangle.position;
                    let uvIdx = shape1.triangle.uvw;
                    let pos = shape1.position;
                    let uv = shape1.uvw;
                    for (let ptr = 0, l = posIdx.length; ptr < l;ptr+=3) {
                        for (let j of edge2) {
                            let ie = j[0] << 2;
                            // pq is border segment
                            let p = _vec4p.set(
                                shape2.position[ie + 2], shape2.position[ie + 3],
                                shape2.position[ie], shape2.position[ie + 1],
                            );
                            ie = j[1] << 2;
                            let q = _vec4q.set(
                                shape2.position[ie + 2], shape2.position[ie + 3],
                                shape2.position[ie], shape2.position[ie + 1],
                            );
                            let normal = _vec4n.subset(q, p).norms();
                            [normal.z, normal.w] = [-normal.w, normal.z];
                            for (let i = 0; i < 3; i++, ptr++) {
                                let ipos = posIdx[ptr] << 2;
                                let iuv = uvIdx[ptr] << 2;
                                _vec4.set(pos[ipos], pos[ipos + 1], pos[ipos + 2], pos[ipos + 3]);
                                _vec4.adds(p);
                                _vec4.writeBuffer(positions, offset);
                                _vec4.set(0, 0, normal.z, normal.w);
                                _vec4.writeBuffer(normals, offset);
                                _vec4.set(uv[iuv], uv[iuv + 1], uv[iuv + 2], 0);
                                _vec4.writeBuffer(uvws, offset);
                                offset += 4;
                            }
                            ptr -= 3;
                            for (let i = 0; i < 3; i++, ptr++) {
                                let ipos = posIdx[ptr] << 2;
                                let iuv = uvIdx[ptr] << 2;
                                _vec4.set(pos[ipos], pos[ipos + 1], pos[ipos + 2], pos[ipos + 3]);
                                _vec4.adds(q);
                                _vec4.writeBuffer(positions, offset);
                                _vec4.set(0, 0, normal.z, normal.w);
                                _vec4.writeBuffer(normals, offset);
                                _vec4.set(uv[iuv], uv[iuv + 1], uv[iuv + 2], 0);
                                _vec4.writeBuffer(uvws, offset);
                                offset += 4;
                            }
                            ptr -= 3;
                            let doffset = offset - 24;
                            pushTetra(doffset, 0, 1, 2, 3);
                            pushTetra(doffset, 1, 2, 3, 5);
                            pushTetra(doffset, 3, 4, 5, 1);
                        }
                    }
                }
                offset = 0;
                if (shape2.quad) {
                    let posIdx = shape2.quad.position;
                    let uvIdx = shape2.quad.uvw;
                    let pos = shape2.position;
                    let uv = shape2.uvw;
                    for (let ptr = 0, l = posIdx.length; ptr < l;ptr+=4) {
                        for (let j of edge1) {
                            let ie = j[0] << 2;
                            // pq is border segment
                            let p = _vec4p.set(
                                shape1.position[ie], shape1.position[ie + 1],
                                shape1.position[ie + 2], shape1.position[ie + 3],
                            );
                            ie = j[1] << 2;
                            let q = _vec4q.set(
                                shape1.position[ie], shape1.position[ie + 1],
                                shape1.position[ie + 2], shape1.position[ie + 3],
                            );
                            let normal = _vec4n.subset(q, p).norms();
                            [normal.x, normal.y] = [-normal.y, normal.x];
                            for (let i = 0; i < 4; i++, ptr++) {
                                let ipos = posIdx[ptr] << 2;
                                let iuv = uvIdx[ptr] << 2;
                                _vec4.set(pos[ipos + 2], pos[ipos + 3], pos[ipos], pos[ipos + 1]);
                                _vec4.adds(p);
                                _vec4.writeBuffer(positions, offset);
                                _vec4.set(normal.x,normal.y);
                                _vec4.writeBuffer(normals, offset);
                                _vec4.set(uv[iuv], uv[iuv + 1], uv[iuv + 2], 1);
                                _vec4.writeBuffer(uvws, offset);
                                offset += 4;
                            }
                            ptr -= 4;
                            for (let i = 0; i < 4; i++, ptr++) {
                                let ipos = posIdx[ptr] << 2;
                                let iuv = uvIdx[ptr] << 2;
                                _vec4.set(pos[ipos + 2], pos[ipos + 3], pos[ipos], pos[ipos + 1]);
                                _vec4.adds(q);
                                _vec4.writeBuffer(positions, offset);
                                _vec4.set(normal.x,normal.y);
                                _vec4.writeBuffer(normals, offset);
                                _vec4.set(uv[iuv], uv[iuv + 1], uv[iuv + 2], 1);
                                _vec4.writeBuffer(uvws, offset);
                                offset += 4;
                            }
                            ptr -= 4;
                            let doffset = offset - 32;
                            pushTetra(doffset, 0, 1, 3, 4);
                            pushTetra(doffset, 1, 5, 6, 4);
                            pushTetra(doffset, 1, 3, 6, 2);
                            pushTetra(doffset, 4, 7, 6, 3);
                            pushTetra(doffset, 1, 3, 4, 6);
                        }
                    }
                }
                offset = 0;
                if (shape2.triangle) {
                    let posIdx = shape2.triangle.position;
                    let uvIdx = shape2.triangle.uvw;
                    let pos = shape2.position;
                    let uv = shape2.uvw;
                    for (let ptr = 0, l = posIdx.length; ptr < l;ptr+=3) {
                        for (let j of edge1) {
                            let ie = j[0] << 2;
                            // pq is border segment
                            let p = _vec4p.set(
                                shape1.position[ie], shape1.position[ie + 1],
                                shape1.position[ie + 2], shape1.position[ie + 3],
                            );
                            ie = j[1] << 2;
                            let q = _vec4q.set(
                                shape1.position[ie], shape1.position[ie + 1],
                                shape1.position[ie + 2], shape1.position[ie + 3],
                            );
                            let normal = _vec4n.subset(q, p).norms();
                            [normal.x, normal.y] = [-normal.y, normal.x];
                            for (let i = 0; i < 3; i++, ptr++) {
                                let ipos = posIdx[ptr] << 2;
                                let iuv = uvIdx[ptr] << 2;
                                _vec4.set(pos[ipos + 2], pos[ipos + 3], pos[ipos], pos[ipos + 1]);
                                _vec4.adds(p);
                                _vec4.writeBuffer(positions, offset);
                                _vec4.set(normal.x,normal.y);
                                _vec4.writeBuffer(normals, offset);
                                _vec4.set(uv[iuv], uv[iuv + 1], uv[iuv + 2], 1);
                                _vec4.writeBuffer(uvws, offset);
                                offset += 4;
                            }
                            ptr -= 3;
                            for (let i = 0; i < 3; i++, ptr++) {
                                let ipos = posIdx[ptr] << 2;
                                let iuv = uvIdx[ptr] << 2;
                                _vec4.set(pos[ipos + 2], pos[ipos + 3], pos[ipos], pos[ipos + 1]);
                                _vec4.adds(q);
                                _vec4.writeBuffer(positions, offset);
                                _vec4.set(normal.x,normal.y);
                                _vec4.writeBuffer(normals, offset);
                                _vec4.set(uv[iuv], uv[iuv + 1], uv[iuv + 2], 1);
                                _vec4.writeBuffer(uvws, offset);
                                offset += 4;
                            }
                            ptr -= 3;
                            let doffset = offset - 24;
                            pushTetra(doffset, 0, 1, 2, 3);
                            pushTetra(doffset, 1, 2, 3, 5);
                            pushTetra(doffset, 3, 4, 5, 1);
                        }
                    }
                }
                function pushTetra(offset: number, a: number, b: number, c: number, d: number) {
                    a = offset + (a << 2);
                    b = offset + (b << 2);
                    c = offset + (c << 2);
                    d = offset + (d << 2);
                    pushIdx(a); pushIdx(b); pushIdx(c); pushIdx(d);
                }
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
                return { position, normal, uvw, count: position.length >> 4 }
            }
        }
    }
}