import { Vec4 } from "../../math/algebra/vec4";
import { Polytope } from "../../math/geometry/polytope";
import { CWMesh } from "./cwmesh";

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
// export function prism()