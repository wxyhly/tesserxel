import { Vec4 } from "../../math/algebra/vec4.js";
import { _180 } from "../../math/const.js";
import { Polytope } from "../../math/geometry/polytope.js";
import { Bivec } from "../../math/math.js";
import { CWMesh, CWMeshSelection, Face } from "./cwmesh.js";

export function polytope(schlafli: number[]) {
    const m = new CWMesh();
    if (!schlafli) {
        m.data = [[new Vec4]]; return m;
    }
    if (schlafli.length === 0) {
        m.data = [[Vec4.xNeg.clone(), Vec4.x.clone()], [[0, 1]]]; return m;
    }
    const dim = schlafli.length + 1;
    m.data = new Polytope(schlafli).getRegularPolytope();
    m.data.push([m.data[dim - 1].map((_, i: number) => i)]);
    m.calculateOrientationInFace(dim, 0);
    m.flipOrientation(dim - 1, Array.from(m.orientation[dim][0].entries()).filter(
        ([idx, o]) => o === false
    ).map(([idx, o]) => m.data[dim][0][idx]));
    return m;
}
export function truncatedPolytope(schlafli: number[], t: number) {
    const m = new CWMesh();
    if (!schlafli) {
        m.data = [[new Vec4]]; return m;
    }
    if (schlafli.length === 0) {
        m.data = [[Vec4.xNeg.clone(), Vec4.x.clone()], [[0, 1]]]; return m;
    }
    const dim = schlafli.length + 1;
    m.data = new Polytope(schlafli).getTrucatedRegularPolytope(t);
    m.data.push([m.data[dim - 1].map((_, i: number) => i)]);
    m.calculateOrientationInFace(dim, 0);
    m.flipOrientation(dim - 1, Array.from(m.orientation[dim][0].entries()).filter(
        ([idx, o]) => o === false
    ).map(([idx, o]) => m.data[dim][0][idx]));
    return m;
}

export function bitruncatedPolytope(schlafli: number[], t: number=0.5) {
    const m = new CWMesh();
    if (!schlafli) {
        m.data = [[new Vec4]]; return m;
    }
    const dim = schlafli.length + 1;
    m.data = new Polytope(schlafli).getBitrucatedRegularPolytope(t);
    m.data.push([m.data[dim - 1].map((_, i: number) => i)]);
    m.calculateOrientationInFace(dim, 0);
    m.flipOrientation(dim - 1, Array.from(m.orientation[dim][0].entries()).filter(
        ([idx, o]) => o === false
    ).map(([idx, o]) => m.data[dim][0][idx]));
    return m;
}
export function path(points: Vec4[] | number, closed?: boolean) {

    const mesh = new CWMesh;
    let n: number;
    if (typeof points === "number") {
        // abstract cwmesh
        mesh.data[0] = new Array(points).fill([]);
        n = points;
    } else {
        mesh.data[0] = points.slice(0);
        n = points.length;
    }
    mesh.data[1] = [];
    for (let i = 0; i < n - 1; i++) {
        (mesh.data[1] as Face[]).push([i, i + 1]);
    }
    if (closed) (mesh.data[1] as Face[]).push([n - 1, 0]);
    // throw "not test yet";
    return mesh;
}
function range(i: number) {
    const arr = [];
    for (let j = 0; j < i; j++) { arr.push(j); }
    return arr;
}
export function solidTorus(majorRadius: number, minorRadius: number, u: number, v: number) {
    const circle = polytope([u]).apply(v => v.set(v.x * minorRadius + majorRadius, 0, v.y * minorRadius));
    circle.makeRotatoid(Bivec.xy, v);
    return circle;
}
export function ball2(u: number, v: number) {
    const arr: Vec4[] = [];
    const dangle = _180 / (v + 2);
    for (let i = dangle, j = 0; j < v; i += dangle, j++) {
        arr.push(new Vec4(0, Math.sin(i), Math.cos(i)));
    }
    // longitude without 2 polar points
    const longitude = path(arr);

    const info = longitude.makeRotatoid(Bivec.xy, u);
    const northLines = new Set<number>();
    const southLines = new Set<number>();
    for (const [equatorLineId, subinfo] of info[1]) {
        northLines.add(subinfo[0].get(0));
        southLines.add(subinfo[0].get(v - 1));
    }
    longitude.makePyramid(new Vec4(0, 0, 1), new CWMeshSelection(longitude, [undefined, northLines]));
    longitude.makePyramid(new Vec4(0, 0, -1), new CWMeshSelection(longitude, [undefined, southLines]));
    longitude.data[3] = [range(longitude.data[2].length)];
    longitude.calculateOrientationInFace(3, 0);
    return longitude;
}
export function ball3(u: number, v: number, w: number) {
    // todo
}