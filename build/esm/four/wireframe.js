import { Vec4 } from '../math/algebra/vec4.js';
import { Obj4 } from '../math/algebra/affine.js';
import { PerspectiveCamera } from './scene.js';
import { AABB, Plane } from '../math/geometry/primitive.js';
import '../math/algebra/vec2.js';
import '../math/algebra/mat3.js';

const WireFrameTesseractoid_SubCells = [
    [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7],
    [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7],
    [2, 4], [2, 5], [2, 6], [2, 7],
    [3, 4], [3, 5], [3, 6], [3, 7],
    [4, 6], [4, 7],
    [5, 6], [5, 7]
];
class WireFrameTesseractoid extends Obj4 {
    lines; // GPUBuffer; // linelist
    cells;
    subCells = WireFrameTesseractoid_SubCells;
    obb;
    visible = true;
    transparent = false;
    constructor(size) {
        super();
        let x = size.x, y = size.y, z = size.z, w = size.w;
        this.obb = new AABB(size.neg(), size);
        this.lines = [
            [new Vec4(x, y, z, w), new Vec4(x, y, z, -w)],
            [new Vec4(x, y, -z, w), new Vec4(x, y, -z, -w)],
            [new Vec4(x, -y, z, w), new Vec4(x, -y, z, -w)],
            [new Vec4(x, -y, -z, w), new Vec4(x, -y, -z, -w)],
            [new Vec4(-x, y, z, w), new Vec4(-x, y, z, -w)],
            [new Vec4(-x, y, -z, w), new Vec4(-x, y, -z, -w)],
            [new Vec4(-x, -y, z, w), new Vec4(-x, -y, z, -w)],
            [new Vec4(-x, -y, -z, w), new Vec4(-x, -y, -z, -w)],
            [new Vec4(x, y, z, w), new Vec4(-x, y, z, w)],
            [new Vec4(x, y, z, -w), new Vec4(-x, y, z, -w)],
            [new Vec4(x, y, -z, w), new Vec4(-x, y, -z, w)],
            [new Vec4(x, y, -z, -w), new Vec4(-x, y, -z, -w)],
            [new Vec4(x, -y, z, w), new Vec4(-x, -y, z, w)],
            [new Vec4(x, -y, z, -w), new Vec4(-x, -y, z, -w)],
            [new Vec4(x, -y, -z, w), new Vec4(-x, -y, -z, w)],
            [new Vec4(x, -y, -z, -w), new Vec4(-x, -y, -z, -w)],
            [new Vec4(x, y, z, w), new Vec4(x, -y, z, w)],
            [new Vec4(-x, y, z, w), new Vec4(-x, -y, z, w)],
            [new Vec4(x, y, z, -w), new Vec4(x, -y, z, -w)],
            [new Vec4(-x, y, z, -w), new Vec4(-x, -y, z, -w)],
            [new Vec4(x, y, -z, w), new Vec4(x, -y, -z, w)],
            [new Vec4(-x, y, -z, w), new Vec4(-x, -y, -z, w)],
            [new Vec4(x, y, -z, -w), new Vec4(x, -y, -z, -w)],
            [new Vec4(-x, y, -z, -w), new Vec4(-x, -y, -z, -w)],
            [new Vec4(x, y, z, w), new Vec4(x, y, -z, w)],
            [new Vec4(-x, y, z, w), new Vec4(-x, y, -z, w)],
            [new Vec4(x, y, z, -w), new Vec4(x, y, -z, -w)],
            [new Vec4(-x, y, z, -w), new Vec4(-x, y, -z, -w)],
            [new Vec4(x, -y, z, w), new Vec4(x, -y, -z, w)],
            [new Vec4(-x, -y, z, w), new Vec4(-x, -y, -z, w)],
            [new Vec4(x, -y, z, -w), new Vec4(x, -y, -z, -w)],
            [new Vec4(-x, -y, z, -w), new Vec4(-x, -y, -z, -w)],
        ];
        this.cells = [
            new Plane(Vec4.x, x), new Plane(Vec4.xNeg, x),
            new Plane(Vec4.y, y), new Plane(Vec4.yNeg, y),
            new Plane(Vec4.z, z), new Plane(Vec4.zNeg, z),
            new Plane(Vec4.w, w), new Plane(Vec4.wNeg, w),
        ];
    }
}
class WireFrameConvexPolytope extends Obj4 {
    lines; // GPUBuffer; // linelist
    cells;
    subCells;
    obb;
    visible = true;
    transparent = false;
    constructor(cwmesh) {
        super();
        const vertices = cwmesh.data[0];
        this.lines = cwmesh.data[1].map(face => [vertices[face[0]], vertices[face[1]]]);
        const subCells = cwmesh.data[2].map(_ => []);
        for (const [idx, cell] of cwmesh.data[3].entries()) {
            for (const faceIdx of cell) {
                subCells[faceIdx].push(idx);
            }
        }
        let simplexes;
        const borders = cwmesh.findBorder(4);
        if (borders) {
            // closed 4d object's surface
            const cells = [];
            const cellsO = [];
            for (const [cellId, border] of borders.entries()) {
                if (border !== 1 && border !== -1)
                    continue;
                cells.push(cellId);
                cellsO.push(border === 1);
            }
            simplexes = cwmesh.triangulate(3, cells, cellsO);
        }
        else {
            simplexes = cwmesh.triangulate(3, cwmesh.data[3].map((_, idx) => idx));
        }
        const v1 = new Vec4, v2 = new Vec4, v3 = new Vec4;
        this.cells = simplexes.map(ss => {
            const s = ss[0];
            const a0 = vertices[s[0]];
            const a1 = vertices[s[1]];
            const a2 = vertices[s[2]];
            const a3 = vertices[s[3]];
            const normal = v1.subset(a0, a1).wedge(v2.subset(a0, a2)).wedgev(v3.subset(a0, a3)).norms();
            return new Plane(normal, a1.dot(normal));
        });
        this.subCells = subCells;
        this.obb = AABB.fromPoints(vertices);
    }
}
const _vec4 = new Vec4;
class WireFrameScene {
    occluders = [];
    objects = [];
    camera = new PerspectiveCamera;
    jsBuffer;
    gpuBuffer;
    maxGpuBufferSize = 0x10000;
    clipEpsilon = 1e-5;
    add(...o) {
        for (const obj of o) {
            if (obj.lines) {
                this.objects.push(obj);
            }
            if (obj.cells) {
                this.occluders.push(obj);
            }
        }
    }
    occludeFrustum(renderState) {
        const frustumRange = renderState.getFrustumRange(this.camera, true);
        for (const obj of this.objects) {
            if (obj.visible === false)
                continue;
            let relP = _vec4.copy(this.camera.position).subs(obj.position);
            let visible = true;
            let clipFaces = [];
            for (let f of frustumRange) {
                const p = new Plane(f.clone().rotatesconj(obj.rotation), f.dot(relP));
                const pos = obj.obb.testPlane(p);
                if (pos === 1) {
                    visible = false;
                    break;
                }
                if (pos === 0) {
                    clipFaces.push(p);
                }
            }
            obj._jsBuffer = visible ? obj.lines.map(([pa, pb]) => [pa.clone(), pb.clone()]) : [];
            if (!visible)
                continue;
            clipFaces.map(p => {
                for (const [pa, pb] of obj._jsBuffer) {
                    const la = pa.dot(p.normal) - p.offset;
                    const lb = pb.dot(p.normal) - p.offset;
                    if (la > 0 !== lb > 0) {
                        const l = lb / (lb - la);
                        const p = _vec4.copy(pa).subs(pb).mulfs(l).adds(pb);
                        if (la > 0) {
                            pa.copy(p);
                        }
                        else {
                            pb.copy(p);
                        }
                    }
                    else if (la > 0 && lb > 0) {
                        pa.set(NaN);
                        pb.set(NaN);
                    }
                }
            });
        }
    }
    calcViewBoundary(c1, c2, origin) {
        if (origin) {
            const k1 = c1.normal.dot(origin) - c1.offset;
            const k2 = c2.normal.dot(origin) - c2.offset;
            const l = k1 / (k1 - k2);
            const n = c1.normal.mulf(1 - l).addmulfs(c2.normal, l);
            return new Plane(n, (1 - l) * c1.offset + l * c2.offset);
        }
        else {
            const l = c1.offset / (c1.offset - c2.offset);
            const n = _vec4.copy(c1.normal).mulfs(1 - l).addmulfs(c2.normal, l);
            return n;
        }
    }
    occludeOccluders() {
        for (const ocd of this.occluders) {
            if (ocd.transparent)
                continue;
            // todo: obb frustum test, if not visible, skip all
            const relP = _vec4.subset(this.camera.position, ocd.position).rotatesconj(ocd.rotation);
            const faceDir = ocd.cells.map(p => p.normal.dot(relP) - p.offset > -this.clipEpsilon);
            const inside = !faceDir.includes(true);
            let worldBorders;
            if (inside) {
                worldBorders = ocd.cells.map(p => p.clone().applyObj4(ocd));
            }
            else {
                const border = ocd.subCells.filter(([a, b]) => faceDir[a] !== faceDir[b]).map(([a, b]) => faceDir[a] ? this.calcViewBoundary(ocd.cells[a], ocd.cells[b], relP) : this.calcViewBoundary(ocd.cells[b], ocd.cells[a], relP));
                worldBorders = border.map(p => p.applyObj4(ocd));
                for (let i = 0; i < faceDir.length; i++) {
                    if (faceDir[i]) {
                        worldBorders.push(ocd.cells[i].clone().applyObj4(ocd));
                    }
                }
            }
            ocd._inside = inside;
            ocd._worldBorders = worldBorders;
        }
        for (const obj of this.objects) {
            if (obj.visible === false)
                continue;
            for (let i = 0; i < obj._jsBuffer.length; i++) {
                let [pa, pb] = obj._jsBuffer[i];
                if (!isNaN(pa.x)) {
                    obj._jsBuffer[i][0].copy(pa.applyObj4(obj));
                    obj._jsBuffer[i][1].copy(pb.applyObj4(obj));
                }
            }
        }
        for (const ocd of this.occluders) {
            if (ocd.transparent)
                continue;
            for (const obj of this.objects) {
                if (obj.visible === false)
                    continue;
                const nBuffer = [];
                for (const [pa, pb] of obj._jsBuffer) {
                    // write new fn here, attention jsbuffer size
                    if (isNaN(pa.x))
                        continue;
                    this.clipLine(ocd._inside, pa, pb, ocd._worldBorders, nBuffer);
                }
                obj._jsBuffer.push(...nBuffer);
            }
        }
    }
    // refeerence: Blockv6 Clip.java
    clipLine(isInside, pa, pb, borders, nBuffer) {
        if (isInside) {
            // pa=cliparea=ra----rb=cliparea==pb
            let ra = 0, rb = 1;
            for (const p of borders) {
                const la = pa.dot(p.normal) - p.offset - this.clipEpsilon;
                const lb = pb.dot(p.normal) - p.offset - this.clipEpsilon;
                if (lb > 0) {
                    if (la > 0) {
                        pa.set(NaN);
                        pb.set(NaN);
                        return;
                    }
                    const l = lb / (lb - la);
                    if (l > ra)
                        ra = l;
                }
                else if (la > 0) {
                    const l = lb / (lb - la);
                    if (l < rb)
                        rb = l;
                }
                if (ra >= rb) {
                    pa.set(NaN);
                    pb.set(NaN);
                    return;
                }
            }
        }
        else {
            // pa====ra--cliparea--rb====pb
            let ra = 0, rb = 1;
            for (const p of borders) {
                const la = pa.dot(p.normal) - p.offset + this.clipEpsilon;
                const lb = pb.dot(p.normal) - p.offset + this.clipEpsilon;
                if (la > 0) {
                    if (lb > 0)
                        return;
                    const l = la / (la - lb);
                    if (l > ra)
                        ra = l;
                }
                else if (lb > 0) {
                    const l = la / (la - lb);
                    if (l < rb)
                        rb = l;
                }
                if (ra >= rb)
                    return;
            }
            if (ra === 0) {
                if (rb === 1) {
                    pa.set(NaN);
                    pb.set(NaN);
                }
                else {
                    pa.copy(_vec4.copy(pb).subs(pa).mulfs(rb).adds(pa));
                }
            }
            else if (rb === 1) {
                pb.copy(_vec4.copy(pb).subs(pa).mulfs(ra).adds(pa));
            }
            else {
                nBuffer.push([pb.clone(), pb.sub(pa).mulfs(rb).adds(pa)]);
                pb.subs(pa).mulfs(ra).adds(pa);
            }
        }
    }
    render(rs, objs) {
        const renderState = rs.renderState;
        const gpu = rs.gpu;
        this.jsBuffer ??= new Float32Array(this.maxGpuBufferSize);
        this.gpuBuffer ??= gpu.createBuffer(GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST, this.maxGpuBufferSize);
        let offset = 0;
        const fovCoeff = -renderState.sliceBuffers.camProjJsBuffer[1];
        const _r = new Obj4;
        // copy data to temp jsbuffer and do retina frustum clip, all data are under object's coord
        this.occludeFrustum(renderState);
        // when do occlusion, all data are converted in world coord
        this.occludeOccluders();
        // when draw, only need to convert to camera's coord
        for (const obj of objs ?? this.objects) {
            if (obj.visible === false)
                continue;
            // _r.rotation.copy(obj.rotation).mulslconj(this.camera.rotation);
            // _r.position.copy(obj.position).subs(this.camera.position).rotatesconj(this.camera.rotation);
            _r.rotation.copy(this.camera.rotation).conjs();
            _r.position.copy(this.camera.position).negs().rotatesconj(this.camera.rotation);
            //ax+b-B=Ay
            for (const [pa, pb] of obj._jsBuffer) {
                if (isNaN(pa.x))
                    continue;
                _vec4.copy(pa).applyObj4(_r);
                _vec4.mulfs(fovCoeff / _vec4.w);
                _vec4.writeBuffer(this.jsBuffer, offset);
                _vec4.copy(pb).applyObj4(_r);
                _vec4.mulfs(fovCoeff / _vec4.w);
                _vec4.writeBuffer(this.jsBuffer, offset + 4);
                offset += 8;
            }
        }
        gpu.device.queue.writeBuffer(this.gpuBuffer, 0, this.jsBuffer.buffer, 0, offset);
        rs.render(this.gpuBuffer, offset >> 2);
    }
}

export { WireFrameConvexPolytope, WireFrameScene, WireFrameTesseractoid };
//# sourceMappingURL=wireframe.js.map
