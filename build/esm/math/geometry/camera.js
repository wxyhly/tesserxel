import { Mat4 } from '../algebra/mat4.js';
import { Vec4 } from '../algebra/vec4.js';
import { _90, _DEG2RAD } from '../const.js';

/** If fov == 0, then return Orthographic projection matrix
 *  Caution: This function calculates PerspectiveMatrix for 0-1 depth range */
function getPerspectiveProjectionMatrix(c) {
    let ky = Math.tan(_90 - c.fov / 2 * _DEG2RAD);
    let kxz = ky / (c.aspect ?? 1);
    let a = -c.far / (c.far - c.near);
    let b = c.near * a;
    // [kxz   0    0    0    0]
    // [0    ky   0    0    0]
    // [0    0    kxz   0    0]
    // [0    0    0    a    b]
    // [0    0    0   -1    0]
    return {
        /** used for 3d */
        mat4: new Mat4(kxz, 0, 0, 0, 0, ky, 0, 0, 0, 0, a, b, 0, 0, -1, 0),
        /** used for 4d because of lack of mat5x5 */
        vec4: new Vec4(kxz, ky, a, b)
    };
}
function getOrthographicProjectionMatrix(c) {
    let ky = 1 / c.size, kxz = ky / (c.aspect ?? 1);
    let a = -1 / (c.far - c.near);
    let b = c.near * a;
    // [kxz   0    0    0    0]
    // [0    ky   0    0    0]
    // [0    0    kxz   0    0]
    // [0    0    0    a    b]
    // [0    0    0    0    1]
    return {
        /** used for 3d */
        mat4: new Mat4(kxz, 0, 0, 0, 0, ky, 0, 0, 0, 0, a, b, 0, 0, 0, 1),
        /** used for 4d because of lack of mat5x5
         */
        vec4: new Vec4(kxz, ky, a, b)
    };
}

export { getOrthographicProjectionMatrix, getPerspectiveProjectionMatrix };
//# sourceMappingURL=camera.js.map
