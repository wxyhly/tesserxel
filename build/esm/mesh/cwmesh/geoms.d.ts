import { Vec4 } from "../../math/algebra/vec4.js";
import { CWMesh } from "./cwmesh.js";
export declare function polytope(schlafli: number[]): CWMesh;
export declare function truncatedPolytope(schlafli: number[], t: number): CWMesh;
export declare function bitruncatedPolytope(schlafli: number[], t?: number): CWMesh;
export declare function path(points: Vec4[] | number, closed?: boolean): CWMesh;
export declare function solidTorus(majorRadius: number, minorRadius: number, u: number, v: number): CWMesh;
export declare function ball2(u: number, v: number): CWMesh;
export declare function ball3(u: number, v: number, w: number): void;
