import { FaceIndexMesh } from "./face/facemesh";
import { TetraIndexMesh } from "./tetra/tetramesh";

interface IndexMesh extends FaceIndexMesh {
    positionIndex?: Uint32Array;
    normalIndex?: Uint32Array;
    uvwIndex?: Uint32Array;
    count?: number;
}
export class ObjFile {
    data: string;
    constructor(data: string | TetraIndexMesh | FaceIndexMesh) {
        this.data = this.stringify(data);
    }
    private stringify(data: string | TetraIndexMesh | FaceIndexMesh) {
        if (typeof data === "string") return data;
        let out = "# Tesserxel ObjFile Parser\n# github.com/wxyhly/tesserxel\n";
        out += writeVertexLike("v", data.position);
        if (data.normal) out += writeVertexLike("vn", data.normal);
        if (data.uvw) out += writeVertexLike("vt", data.uvw);
        if ((data as TetraIndexMesh).positionIndex) {
            let m = data as TetraIndexMesh;
            out += writeFaceLike("t", m.positionIndex, m.uvwIndex, m.normalIndex, 4);
            return out;
        }
        let m = data as FaceIndexMesh;
        if (m.triangle) {
            out += writeFaceLike("f", m.triangle.position, m.triangle.uvw, m.triangle.normal, 3);
        }
        if (m.quad) {
            out += writeFaceLike("f", m.quad.position, m.quad.uvw, m.quad.normal, 4);
        }
        return out;
        function writeVertexLike(identifier: string, data: Float32Array) {
            let out = "\n";
            const reg = new RegExp(" " + (0).toPrecision(7) + "$", "g");
            for (let i = 0, l = data.length; i < l; i += 4) {
                let line = identifier;
                for (let q = 0; q < 4; q++) {
                    line += " " + data[i + q].toPrecision(7);
                }
                line = line.trim().replace(reg, "");
                if (identifier === "vt") line = line.replace(reg, "");
                out += line + "\n";
            }
            return out;
        }
        function writeFaceLike(identifier: string, v: Uint32Array, vt: Uint32Array, vn: Uint32Array, stride: number) {
            let out = "\n";
            for (let i = 0, l = v.length; i < l; i += stride) {
                let line = identifier;
                for (let q = 0; q < stride; q++) {
                    line += " " + (v[i + q] + 1);
                    if (vt) line += "/" + (vt[i + q] + 1);
                    if (vn) line += "/" + (vn[i + q] + 1);
                    line = line.replace(/\/+$/, "");
                }
                out += line + "\n";
            }
            return out;
        }
    }
    parse() {
        let lines = this.data.split("\n");
        let v = [];
        let vt = [];
        let vn = [];
        let quad = {
            v: [],
            vt: [],
            vn: [],
        }
        let tetra = {
            v: [],
            vt: [],
            vn: [],
        }
        let triangle = {
            v: [],
            vt: [],
            vn: [],
        }
        for (let i = 0, l = lines.length; i < l; i++) {
            let line = lines[i].trim();
            if (isCommentOrEmpty(line)) continue;
            let splitArr = line.toLowerCase().split(/\s/g);
            switch (splitArr[0]) {
                case "o":
                    // parseObj(splitArr);
                    break;
                case "v":
                    parseVertexLike(v, splitArr);
                    break;
                case "vt":
                    parseVertexLike(vt, splitArr);
                    break;
                case "vn":
                    parseVertexLike(vn, splitArr);
                    break;
                case "f":
                    if (splitArr.length === 5) {
                        parseFaceLike(quad, splitArr);
                    } else if (splitArr.length === 4) {
                        parseFaceLike(triangle, splitArr);
                    } else {
                        error(i, "Unsupported polygonal face: Only triangles and quads are allowed.");
                    }
                    break;
                case "t":
                    if (splitArr.length === 5) {
                        parseFaceLike(tetra, splitArr);
                    } else {
                        error(i, `Vertices of tetrahedron must be 4, found ${splitArr.length - 1} vertices.`);
                    }
            }
        }

        let out: IndexMesh = tetra.v.length ? {
            position: new Float32Array(v),
            positionIndex: new Uint32Array(tetra.v)
        } : {
            position: new Float32Array(v)
        }
        if (vt.length) out.uvw = new Float32Array(vt);
        if (vn.length) out.normal = new Float32Array(vn);
        if (triangle.v.length) {
            out.triangle = {
                position: new Uint32Array(triangle.v)
            }
            if (triangle.vt.length) out.triangle.uvw = new Uint32Array(triangle.vt);
            if (triangle.vn.length) out.triangle.normal = new Uint32Array(triangle.vn);
        }
        if (quad.v.length) {
            out.quad = {
                position: new Uint32Array(quad.v)
            }
            if (quad.vt.length) out.quad.uvw = new Uint32Array(quad.vt);
            if (quad.vn.length) out.quad.normal = new Uint32Array(quad.vn);
        }

        if (tetra.v.length) {
            if (tetra.vt.length) out.uvwIndex = new Uint32Array(tetra.vt);
            if (tetra.vn.length) out.normalIndex = new Uint32Array(tetra.vn);

        }
        return out;
        function parseVertexLike(dst: number[], splitArr: string[]) {
            while (splitArr.length < 5) { splitArr.push("0"); }
            for (let i = 1, l = splitArr.length; i < l; i++) {
                dst.push(Number(splitArr[i]));
            }
        }
        function parseFaceLike(dst: { v: number[], vt: number[], vn: number[] }, splitArr: string[]) {
            for (let i = 1, l = splitArr.length; i < l; i++) {
                let attrs = splitArr[i].split("/");
                dst.v.push(Number(attrs[0]) - 1);
                if (attrs[1]) dst.vt.push(Number(attrs[1]) - 1);
                if (attrs[2]) dst.vn.push(Number(attrs[2]) - 1);
            }
        }
        function isCommentOrEmpty(line: string) {
            return line === "" || line[0] === "#";
        }
        function error(line: number, msg: string) {
            console.error("ObjFileParser: " + msg + "\n at line " + line + `"${lines[line]}"`);
        }
    }
}