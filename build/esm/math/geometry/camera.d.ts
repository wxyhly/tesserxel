import { Mat4 } from "../algebra/mat4";
import { Vec4 } from "../algebra/vec4";
export interface PerspectiveCamera {
    fov: number;
    near: number;
    far: number;
    /** aspect = width / height = depth / height */
    aspect?: number;
}
export interface OrthographicCamera {
    /** size = height */
    size: number;
    near: number;
    far: number;
    /** aspect = width / height = depth / height */
    aspect?: number;
}
/** If fov == 0, then return Orthographic projection matrix
 *  Caution: This function calculates PerspectiveMatrix for 0-1 depth range */
export declare function getPerspectiveProjectionMatrix(c: PerspectiveCamera): {
    /** used for 3d */
    mat4: Mat4;
    /** used for 4d because of lack of mat5x5 */
    vec4: Vec4;
};
export declare function getOrthographicProjectionMatrix(c: OrthographicCamera): {
    /** used for 3d */
    mat4: Mat4;
    /** used for 4d because of lack of mat5x5
     */
    vec4: Vec4;
};
