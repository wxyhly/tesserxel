import { Vec4 } from "../../math/algebra/vec4";
import { Obj4 } from "../../math/math";
export type FaceId = number;
export type Simplex = number[];
export type Face = Array<FaceId>;
export type FaceOrientaion = Array<boolean>;
export type DimList<T> = Array<T>;
export type CWMeshStructData = DimList<Face[] | Vec4[]>;
export type OrientaionData = DimList<FaceOrientaion[]>;
export type CWMeshSelectionData = DimList<Set<FaceId>>;
export type RankedCWMap = DimList<Map<FaceId, FaceId>>;
function range(i: number) {
    const arr = [];
    for (let j = 0; j < i; j++) { arr.push(j); }
    return arr;
}
export class CWMeshSelection {
    cwmesh: CWMesh;
    selData: CWMeshSelectionData;
    constructor(cwmesh: CWMesh, data?: CWMeshSelectionData) {
        this.cwmesh = cwmesh;
        this.selData = data ?? [];
    }
    clone() {
        return new CWMeshSelection(this.cwmesh, this.selData.map(set => new Set(set)));
    }
    /// this function modify selection into closure
    closure(): CWMeshSelection {
        const sel = this.selData;
        for (let dim = sel.length - 1; dim > 0; dim--) {
            if (!sel[dim]) continue;
            const faces = this.cwmesh.data[dim] as Face[];
            for (const faceId of sel[dim]) {
                for (const d_faceId of faces[faceId]) {
                    sel[dim - 1] ??= new Set();
                    sel[dim - 1].add(d_faceId);
                }
            }
        }
        return this;
    }
    addFace(dim: number, faceId: FaceId) {
        const seldata = this.selData;
        seldata[dim] ??= new Set;
        seldata[dim].add(faceId);
        return this;
    }
}
export class CWMesh {
    data: CWMeshStructData = [];
    orientation: OrientaionData = [];
    clone() {
        const newcwmesh = new CWMesh();
        newcwmesh.data = this.data.map(dataDim => dataDim ? dataDim.map(
            (face: Face | Vec4) => face instanceof Vec4 ? face.clone() : face.slice(0)
        ) as Face[] | Vec4[] : undefined);
        newcwmesh.orientation = this.orientation.map(oDim => oDim ? oDim.map(
            (faceO: FaceOrientaion) => faceO.slice(0)
        ) : undefined);
        return newcwmesh;
    }


    /* structure normalizations */


    /// faces must be orientated
    sort2DFace() {
        const d_faces = this.data[1] as [FaceId, FaceId][];
        const facesO = this.orientation[2];
        const faces = this.data[2] as Face[];
        for (const [faceId, face] of faces.entries()) {
            const faceO = facesO[faceId];
            const dd2nextdfaceMap = new Map<FaceId, number>();
            for (const [d_faceIdx, d_faceId] of face.entries()) {
                const d_face = d_faces[d_faceId];
                const o = faceO[d_faceIdx];
                dd2nextdfaceMap.set(d_face[o ? 0 : 1], d_faceIdx);
            }
            let curIdx = 0;
            let newOrder = [curIdx];
            const faceLength = face.length;
            while (true) {
                const d_faceId = face[curIdx];
                const next_dd_faceIdx = faceO[curIdx] ? 1 : 0;
                const dd_faceId = d_faces[d_faceId][next_dd_faceIdx];
                curIdx = dd2nextdfaceMap.get(dd_faceId);
                if (curIdx === 0) break;
                newOrder.push(curIdx);
                if (newOrder.length > faceLength) { console.error("Non manifold structure found."); break; }
            }
            faces[faceId] = newOrder.map(i => face[i]);
            facesO[faceId] = newOrder.map(i => faceO[i]);
        }
    }
    flipOrientation(dim: number, faceIds?: FaceId[]) {
        faceIds ??= range(this.data[dim].length);
        if (dim === 0) throw "Vertex orientation flip is not implemented";
        if (dim === 1) {
            const edgeTable = this.data[1];
            for (const faceId of faceIds) {
                const edge = edgeTable[faceId];
                const a = edge[0]; edge[0] = edge[1]; edge[1] = a;
            }
        } else {
            const oTable = this.orientation[dim];
            if (!oTable) throw "Orientation is undefiend";
            for (const faceId of faceIds) {
                const o = oTable[faceId];
                if (o === undefined) throw "Orientation is undefiend";
                for (let i = 0; i < o.length; i++) o[i] = !o[i];
            }
        }
        const cellTable = this.data[dim + 1] as Face[];
        const cellOTable = this.orientation[dim + 1];
        if (!cellOTable) return;
        for (const [cellId, cell] of cellTable.entries()) {
            for (const [faceIdx, faceId] of cell.entries()) {
                if (faceIds.includes(faceId)) {
                    cellOTable[cellId][faceIdx] = !cellOTable[cellId][faceIdx];
                }
            }
        }
    }
    calculateOrientationInFace(dim: number, faceId: FaceId) {
        this.orientation ??= [];
        this.orientation[dim] ??= [];
        if (this.orientation[dim][faceId]) return;
        if (dim === 0) return;
        if (dim === 1) return; // edge: [1, -1]
        const face = this.data[dim][faceId] as Face;

        // if d_face not oriented yet, deal with it first

        if (dim !== 2) {
            for (const d_faceId of face) {
                this.orientation[dim - 1] ??= [];
                if (!this.orientation[dim - 1][d_faceId]) this.calculateOrientationInFace(dim - 1, d_faceId);
            }
        }

        // get all dd_face and its table

        const dd2dtable: Map<number, Array<[number, number]>> = new Map;
        const d_faces = face.map(d_faceId => this.data[dim - 1][d_faceId] as Face);
        let d_faceIdx: FaceId = 0;
        for (const d_face of d_faces) {
            for (const [dd_faceIdx, dd_faceId] of d_face.entries()) {
                if (!dd2dtable.has(dd_faceId)) dd2dtable.set(dd_faceId, new Array());
                dd2dtable.get(dd_faceId).push([dd_faceIdx, d_faceIdx]);
            }
            d_faceIdx++;
        }
        const faceO: FaceOrientaion = new Array(face.length); faceO[0] = true;
        let current_d_faceIdxs = [];
        let current_d_faceIdx = 0;
        const dfOTable = this.orientation[dim - 1];
        while (current_d_faceIdx !== undefined) {
            const currentFaceId = face[current_d_faceIdx];
            for (const [dd_faceIdx, dd_faceId] of d_faces[current_d_faceIdx].entries()) {
                const ajacent_d_faceIdxs = dd2dtable.get(dd_faceId);
                if (ajacent_d_faceIdxs.length > 2) throw "Non manifold structure found";
                if (ajacent_d_faceIdxs.length === 1) continue;
                let [next_dd_faceIdx, next_d_faceIdx] = ajacent_d_faceIdxs[0][1] === current_d_faceIdx ? ajacent_d_faceIdxs[1] : ajacent_d_faceIdxs[0];
                if (faceO[next_d_faceIdx] !== undefined) continue;
                const dd_faceOInCurrentFace = dim === 2 ? 0 === dd_faceIdx : dfOTable[currentFaceId][dd_faceIdx];
                const dd_faceOInNextFace = dim === 2 ? 0 === next_dd_faceIdx : dfOTable[face[next_d_faceIdx]][next_dd_faceIdx];
                faceO[next_d_faceIdx] = (faceO[current_d_faceIdx] === dd_faceOInCurrentFace) !== dd_faceOInNextFace;
                current_d_faceIdxs.push(next_d_faceIdx);
            }
            current_d_faceIdx = current_d_faceIdxs.pop();
        }
        this.orientation[dim][faceId] = faceO;
    }
    /// this will reorder faceIds after deleting
    deleteSelection(sel: CWMeshSelection) {
        const remapping: RankedCWMap = [];
        for (const [dim, selDim] of sel.selData.entries()) {
            if (!selDim) continue;
            remapping[dim] = new Map;
            const faceMapTable: number[] = [];
            let newId = 0; let del: boolean;
            this.data[dim] = (this.data[dim] as (Face | Vec4)[]).filter(
                (face: Face | Vec4, faceId: number) => (
                    del = !selDim.has(faceId),
                    remapping[dim].set(faceId, del ? -1 : newId++),
                    del
                )
            ) as Face[] | Vec4[];
            this.orientation[dim] = this.orientation[dim].filter(
                (face: boolean[], faceId: number) => !selDim.has(faceId)
            );
        }
        for (const [dim, dataDim] of this.data.entries()) {
            const remapDim = remapping[dim - 1];
            if (!remapDim || !remapDim.size) continue;
            for (const face of dataDim as Face[]) {
                for (const [faceIdx, faceId] of face.entries()) {
                    face[faceIdx] = remapDim.get(faceId);
                    if (face[faceIdx] === -1) throw "A deleted subface is used by other faces";
                }
            }
        }
        return remapping;
    }


    /* get informations from part of cwmesh */

    dim() {
        for (let i = this.data.length - 1; i >= 0; i--) {
            if (this.data[i].length) {
                return i;
            }
        }
    }
    findBorder(dim: number, faceIds?: Set<FaceId>) {
        if (dim === 0) return;
        if (!this.data[dim] || !this.data[dim].length) return;
        faceIds ??= new Set(range(this.data[dim].length));
        const bordersO = new Map<FaceId, number>();
        const faces = this.data[dim] as Face[];
        const facesO = this.orientation[dim] ?? [];

        for (const faceId of faceIds) {
            const face = faces[faceId];
            const faceO = dim === 1 ? [false, true] : facesO[faceId] ?? [];
            for (const [d_faceIdx, d_faceId] of face.entries()) {
                const orientation = faceO[d_faceIdx];
                if (!bordersO.get(d_faceId)) {
                    bordersO.set(d_faceId, (orientation === undefined) ? NaN : (orientation ? 1 : -1));
                } else {
                    const prev = bordersO.get(d_faceId);
                    if (isNaN(prev)) bordersO.delete(d_faceId);
                    bordersO.set(d_faceId, prev + (orientation ? 1 : -1));
                }
            }
        }
        for (const [k, v] of bordersO) {
            if (v === 0) {
                bordersO.delete(k);
            }
        }
        return bordersO;
    }
    getAllSelection(): CWMeshSelection {
        return new CWMeshSelection(this, this.data.map(dimData => dimData ? new Set(range(dimData.length)) : undefined));
    }
    /// faces must be flat, convex and orientated
    triangulate(dim: number, faceIds: number[], orientations?: boolean[]) {
        faceIds ??= range(this.data[dim].length);
        const faces = this.data[dim];
        const facesO = this.orientation[dim];
        if (dim === 0) {
            throw "can't triangulate points";
        }
        if (dim === 1) {
            return faceIds.map((id, idx) => [
                !orientations || orientations[idx] === false ? [
                    this.data[1][id][1], this.data[1][id][0]
                ] : [
                    this.data[1][id][0], this.data[1][id][1]
                ]
            ] as Simplex[]);
        }
        const result: Simplex[][] = [];
        for (const [faceIdx, faceId] of faceIds.entries()) {
            const face = faces[faceId] as Face;
            const faceO = facesO[faceId];

            // get the first vertex

            let subfaceDim = dim - 1;
            let subface0Id = face[0];
            while (subfaceDim) {
                subface0Id = this.data[subfaceDim--][subface0Id][0];
            }

            const d_faceWaitForTriagulate: FaceId[] = [];
            const d_faceWaitForTriagulateO: boolean[] = [];

            for (const [d_faceIdx, d_faceId] of face.entries()) {

                // get subfaces who contain the first vertex

                const tempsel = new CWMeshSelection(this).addFace(dim - 1, d_faceId).closure();
                if (tempsel.selData[0].has(subface0Id)) continue;

                d_faceWaitForTriagulate.push(d_faceId);
                d_faceWaitForTriagulateO.push(faceO[d_faceIdx]);
            }

            const faceResult = this.triangulate(dim - 1, d_faceWaitForTriagulate, d_faceWaitForTriagulateO).flat();
            faceResult.forEach(s => {
                s.push(subface0Id)
                if (orientations && orientations[faceIdx] === false) {
                    const temp = s[0]; s[0] = s[1]; s[1] = temp;
                }
            });
            result.push(faceResult);
        }
        return result;
    }
    /// dual data doesn't generate orientation information
    getDualData(dim: number, faceIds?: number[]) {
        faceIds ??= range(this.data[dim].length);
        const data: DimList<Map<FaceId, Set<FaceId>>> = [];
        for (let d = dim; d; d--) {
            const faces = this.data[d];
            data[d - 1] ??= new Map;
            for (const [faceId, face] of faces.entries()) {
                for (const d_faceId of face as Face) {
                    if (!data[d - 1].get(d_faceId)) data[d - 1].set(d_faceId, new Set);
                    data[d - 1].get(d_faceId).add(faceId);
                }
            }
        }
        return data;
    }

    /* modify topology of cwmesh */


    duplicate(sel?: CWMeshSelection, notCheckselectionClosure?: boolean) {
        if (!sel) notCheckselectionClosure = true;
        sel ??= this.getAllSelection();
        const closure = (notCheckselectionClosure ? sel : sel.closure()).selData;
        const info: DimList<Map<FaceId, FaceId>> = [];
        const vertexIsVec4 = this.data[0][0] instanceof Vec4;
        for (const [dim, faceIdList] of closure.entries()) {
            info[dim] = new Map;
            const faces = this.data[dim];
            const facesO = this.orientation[dim];
            for (const faceId of faceIdList) {
                const f0: FaceId = faces.length;
                info[dim].set(faceId, f0);
                if (dim === 0) faces.push((vertexIsVec4 ? (faces[faceId] as Vec4).clone() : []) as any);
                else {
                    (faces as Face[]).push((faces as Face[])[faceId].map(d_faceId => info[dim - 1].get(d_faceId)));
                    if (facesO && facesO[faceId]) {
                        facesO[f0] = facesO[faceId].slice(0);
                    }
                }
            }
        }
        return info;
    }
    // before making bridge, oritation must be consist, this can be checked and corrected (todo)						
    bridge(mapInfo: DimList<Map<FaceId, FaceId>>) {
        const info: DimList<Map<FaceId, FaceId>> = [];
        for (const [dim, faceIdList] of mapInfo.entries()) {
            const faces = this.data[dim];
            const facesO = this.orientation[dim];
            this.data[dim + 1] ??= [];
            const cells = this.data[dim + 1] as Face[];
            const invO = (dim & 1) === 0;
            if (!this.orientation[dim + 1]) this.orientation[dim + 1] = [];
            const cellsO = this.orientation[dim + 1];
            for (const [faceId, clonedFaceId] of faceIdList) {
                const face = faces[faceId] as Face;
                const faceO = facesO ? facesO[faceId] : undefined;
                const newId: FaceId = cells.length;
                info[dim] ??= new Map; info[dim].set(faceId, newId);
                if (dim === 0) cells.push([faceId, clonedFaceId]);
                else {
                    const newCell: Face = face.map(d_faceId => info[dim - 1].get(d_faceId)); newCell.push(faceId, clonedFaceId);
                    cells.push(newCell);
                    // D(Extrude(A)) = (-1)^(dim+1)(A - Aclone) + Extrude(DA)
                    const newCellO = dim === 1 ? [false, true] : faceO.slice(0);
                    newCellO.push(!invO, invO);
                    cellsO[newId] = newCellO;
                }
            }
        }
        return info;
    }
    topologicalExtrude(sel?: CWMeshSelection) {
        sel ??= this.getAllSelection();
        const cloneInfo = this.duplicate(sel);
        const bridgeInfo = this.bridge(cloneInfo);
        return { cloneInfo, bridgeInfo };
    }
    topologicalCone(sel?: CWMeshSelection, notCheckselectionClosure?: boolean) {
        if (!sel) notCheckselectionClosure = true;
        sel ??= this.getAllSelection();
        sel = notCheckselectionClosure ? sel : sel.closure();
        const info: DimList<Map<FaceId, FaceId>> = [];
        const v0: FaceId = this.data[0].length;
        this.data[0].push(this.data[0][0] instanceof Vec4 ? new Vec4() : [] as any);
        for (const [dim, faceIdList] of sel.selData.entries()) {
            const faces = this.data[dim];
            const facesO = this.orientation[dim];
            this.data[dim + 1] ??= [];
            const cells = this.data[dim + 1] as Face[];
            this.orientation[dim + 1] ??= [];
            const invO = (dim & 1) === 0;
            const cellsO = this.orientation[dim + 1];
            for (const faceId of faceIdList) {
                const face = faces[faceId] as Face;
                const faceO = facesO ? facesO[faceId] : undefined;
                const newId: FaceId = cells.length;
                info[dim] ??= new Map; info[dim].set(faceId, newId);
                if (dim === 0) cells.push([faceId, v0]);
                else {
                    const newCell: Face = face.map(d_faceId => info[dim - 1].get(d_faceId)); newCell.push(faceId);
                    cells.push(newCell);
                    // D(Cone(A)) = (-1)^(dim+1)A + Cone(DA)
                    if (faceO) {
                        const newCellO = faceO.slice(0); newCellO.push(!invO);
                        cellsO[newId] = newCellO;
                    } else if (dim === 1) {
                        cellsO[newId] = [false, true, !invO];
                    }
                }
            }
        }
        return {
            coneVertex: v0,
            map: info
        };
    }
    // this U= this[thisSel] x shape2[shape2Sel]
    topologicalProduct(shape2: CWMesh, thisSel?: CWMeshSelection, shape2Sel?: CWMeshSelection) {
        if (thisSel) thisSel.closure();
        if (shape2Sel) shape2Sel.closure();
        thisSel ??= this.getAllSelection();
        shape2Sel ??= shape2.getAllSelection();
        // productInfo[dim2].get(face2Id)[dim1].get(face1Id) ==> face1_x_face2_Id
        const productInfo: DimList<Map<FaceId, DimList<Map<FaceId, FaceId>>>> = [new Map];
        // this[i] x shape2[0]
        let firstCopy = true;
        for (const sp2vId of shape2Sel.selData[0]) {
            if (firstCopy) {
                const identityInfo = thisSel.selData.map(set => new Map(set.entries()));
                productInfo[0].set(sp2vId, identityInfo);
                firstCopy = false;
            } else {
                const cloneInfo = this.duplicate(thisSel, true);
                productInfo[0].set(sp2vId, cloneInfo);
            }
        }
        // loop shape2
        for (const [dim2, thisSel2dim] of shape2Sel.selData.entries()) {
            // skip shape2[0], already calculated
            if (!dim2 || !thisSel2dim) continue;
            const faces2 = shape2.data[dim2];
            const faces2O = shape2.orientation[dim2];
            productInfo[dim2] ??= new Map;
            const productInfoDim2 = productInfo[dim2];
            for (const face2Id of thisSel2dim) {
                const face2 = faces2[face2Id];
                const face2O = faces2O ? faces2O[face2Id] : undefined;
                if (!productInfoDim2.has(face2Id)) productInfoDim2.set(face2Id, []);
                const face2ProductInfo = productInfoDim2.get(face2Id);
                // loop shape1
                for (const [dim1, thisSel1dim] of thisSel.selData.entries()) {
                    if (!thisSel1dim) continue;
                    const dim12 = dim1 + dim2;
                    const faces1 = this.data[dim1];
                    const faces1O = this.orientation[dim1];
                    face2ProductInfo[dim1] ??= new Map;
                    this.data[dim12] ??= [];
                    const cells = this.data[dim12] as Face[];
                    if (dim12 > 1) this.orientation[dim12] ??= [];
                    const cellsO = this.orientation[dim12];
                    for (const face1Id of thisSel1dim) {
                        const face1 = faces1[face1Id];
                        const face1O = faces1O ? faces1O[face1Id] : undefined;
                        // regist newCell
                        const newCell: Face = [];
                        const newCellO = [];
                        const newCellId = cells.length;
                        face2ProductInfo[dim1].set(face1Id, newCellId);

                        // D(shape1) x shape2 
                        if (dim1) { // exclude 0-face with no border
                            for (const [d_face1Idx, d_face1Id] of (face1 as Face).entries()) {
                                newCell.push(face2ProductInfo[dim1 - 1].get(d_face1Id));
                                if (dim1 > 1) newCellO.push(face1O[d_face1Idx]);
                            }
                            if (dim1 === 1) newCellO.push(false, true);
                        }
                        // D(shape2) x shape1
                        const invO = (dim1 & 1) === 1;
                        for (const [d_face2Idx, d_face2Id] of (face2 as Face).entries()) {
                            newCell.push(productInfo[dim2 - 1].get(d_face2Id)[dim1].get(face1Id));
                            if (dim2 > 1) newCellO.push(invO !== face2O[d_face2Idx]);
                        }
                        if (dim2 === 1) newCellO.push(invO, !invO);

                        if (dim12 === 1) {
                            if (newCellO[0] === true) {
                                const temp = newCell[0]; newCell[0] = newCell[1]; newCell[1] = temp;
                            }
                        } else {
                            cellsO.push(newCellO);
                        }
                        cells.push(newCell);
                    }
                }
            }
        }
        return productInfo;
    }


    /* modify concrete shape of cwmesh up to 4d */


    apply(verticesCalls: (vertex: Vec4) => Vec4) {
        (this.data[0] as Vec4[]).forEach(verticesCalls);
        return this;
    }
    makePrism(direction: Vec4, alignCenter: boolean, sel?: CWMeshSelection) {
        const { cloneInfo, bridgeInfo } = this.topologicalExtrude(sel);
        const vs = this.data[0] as Vec4[];
        if (alignCenter) {
            for (const [srcvId, destvId] of cloneInfo[0]) {
                vs[srcvId].addmulfs(direction, -0.5);
                vs[destvId].addmulfs(direction, 0.5);
            }
        } else {
            for (const [srcvId, destvId] of cloneInfo[0]) {
                vs[destvId].adds(direction);
            }
        }
        return { cloneInfo, bridgeInfo };
    }
    makePyramid(point: Vec4, sel?: CWMeshSelection) {
        const info = this.topologicalCone(sel);
        const vs = this.data[0] as Vec4[];
        vs[info.coneVertex].copy(point);
        return info;
    }
    makeDirectProduct(shape2: CWMesh, thisSel?: CWMeshSelection, shape2Sel?: CWMeshSelection) {
        const v1s = this.data[0] as Vec4[];
        const v2s = shape2.data[0] as Vec4[];
        const info = this.topologicalProduct(shape2, thisSel, shape2Sel);
        for (const [v2Id, dim1List] of info[0]) {
            for (const [v1Id, v1_x_v2Id] of dim1List[0]) {
                if (v1Id === v1_x_v2Id) break;
                if (v1Id !== v1_x_v2Id) v1s[v1_x_v2Id].addset(v1s[v1Id], v2s[v2Id]);
            }
        }
        for (const [v2Id, dim1List] of info[0]) {
            for (const [v1Id, v1_x_v2Id] of dim1List[0]) {
                if (v1Id !== v1_x_v2Id) break;
                if (v1Id === v1_x_v2Id) v1s[v1_x_v2Id].addset(v1s[v1Id], v2s[v2Id]);
            }
        }
        return info;
    }
    /// mesh must be closed manifold
    makeDual() {
        const d = (this.findBorder(this.dim()).size)?this.dim()-1:this.dim();
        this.getDualData(d);
        // for(let nd=0,dim=d;)
    }

}



