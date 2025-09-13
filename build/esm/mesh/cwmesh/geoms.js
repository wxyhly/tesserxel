import { Vec4 } from '../../math/algebra/vec4.js';
import { _180 } from '../../math/const.js';
import { Polytope } from '../../math/geometry/polytope.js';
import '../../math/algebra/vec2.js';
import '../../math/algebra/vec3.js';
import '../../math/algebra/mat3.js';
import '../../math/algebra/mat4.js';
import { Bivec } from '../../math/algebra/bivec.js';
import '../../math/algebra/mat2.js';
import '../../math/algebra/cplx.js';
import { CWMesh, CWMeshSelection } from './cwmesh.js';

function polytope(schlafli) {
    const m = new CWMesh();
    if (!schlafli) {
        m.data = [[new Vec4]];
        return m;
    }
    if (schlafli.length === 0) {
        m.data = [[Vec4.xNeg.clone(), Vec4.x.clone()], [[0, 1]]];
        return m;
    }
    const dim = schlafli.length + 1;
    m.data = new Polytope(schlafli).getRegularPolytope();
    m.data.push([m.data[dim - 1].map((_, i) => i)]);
    m.calculateOrientationInFace(dim, 0);
    m.flipOrientation(dim - 1, Array.from(m.orientation[dim][0].entries()).filter(([idx, o]) => o === false).map(([idx, o]) => m.data[dim][0][idx]));
    return m;
}
function truncatedPolytope(schlafli, t) {
    const m = new CWMesh();
    if (!schlafli) {
        m.data = [[new Vec4]];
        return m;
    }
    if (schlafli.length === 0) {
        m.data = [[Vec4.xNeg.clone(), Vec4.x.clone()], [[0, 1]]];
        return m;
    }
    const dim = schlafli.length + 1;
    m.data = new Polytope(schlafli).getTrucatedRegularPolytope(t);
    m.data.push([m.data[dim - 1].map((_, i) => i)]);
    m.calculateOrientationInFace(dim, 0);
    m.flipOrientation(dim - 1, Array.from(m.orientation[dim][0].entries()).filter(([idx, o]) => o === false).map(([idx, o]) => m.data[dim][0][idx]));
    return m;
}
function bitruncatedPolytope(schlafli, t = 0.5) {
    const m = new CWMesh();
    if (!schlafli) {
        m.data = [[new Vec4]];
        return m;
    }
    const dim = schlafli.length + 1;
    m.data = new Polytope(schlafli).getBitrucatedRegularPolytope(t);
    m.data.push([m.data[dim - 1].map((_, i) => i)]);
    m.calculateOrientationInFace(dim, 0);
    m.flipOrientation(dim - 1, Array.from(m.orientation[dim][0].entries()).filter(([idx, o]) => o === false).map(([idx, o]) => m.data[dim][0][idx]));
    return m;
}
function path(points, closed) {
    const mesh = new CWMesh;
    let n;
    if (typeof points === "number") {
        // abstract cwmesh
        mesh.data[0] = new Array(points).fill([]);
        n = points;
    }
    else {
        mesh.data[0] = points.slice(0);
        n = points.length;
    }
    mesh.data[1] = [];
    for (let i = 0; i < n - 1; i++) {
        mesh.data[1].push([i, i + 1]);
    }
    if (closed)
        mesh.data[1].push([n - 1, 0]);
    // throw "not test yet";
    return mesh;
}
function range(i) {
    const arr = [];
    for (let j = 0; j < i; j++) {
        arr.push(j);
    }
    return arr;
}
function solidTorus(majorRadius, minorRadius, u, v) {
    const circle = polytope([u]).apply(v => v.set(v.x * minorRadius + majorRadius, 0, v.y * minorRadius));
    circle.makeRotatoid(Bivec.xy, v);
    return circle;
}
function ball2(u, v) {
    const arr = [];
    const dangle = _180 / (v + 2);
    for (let i = dangle, j = 0; j < v; i += dangle, j++) {
        arr.push(new Vec4(0, Math.sin(i), Math.cos(i)));
    }
    // longitude without 2 polar points
    const longitude = path(arr);
    const info = longitude.makeRotatoid(Bivec.xy, u);
    const northLines = new Set();
    const southLines = new Set();
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
function ball3(u, v, w) {
    // todo
}

export { ball2, ball3, bitruncatedPolytope, path, polytope, solidTorus, truncatedPolytope };
//# sourceMappingURL=geoms.js.map
