import { Vec2 } from "../../math/algebra/vec2";
import { Vec4 } from "../../math/algebra/vec4";
import { FaceIndexMesh, FaceIndexMeshData, FaceMesh } from "./facemesh";
export declare let square: FaceMesh;
export declare function cube(): FaceMesh;
export declare function sphere(radius: number, u: number, v: number, uAngle?: number, vAngle?: number): FaceMesh;
export declare function polygon(points: Vec4[]): FaceIndexMesh;
export declare function circle(radius: number, segment: number): FaceIndexMesh;
export declare function parametricSurface(fn: (inputuvw: Vec2, outputPosition: Vec4, outputNormal: Vec4) => void, uSegment: number, vSegment: number): FaceMesh;
/** m must be a manifold or manifold with border */
export declare function findBorder(m: FaceIndexMeshData): any[];
