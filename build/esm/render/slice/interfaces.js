import '../../math/algebra/vec2.js';
import '../../math/algebra/vec3.js';
import '../../math/algebra/vec4.js';
import '../../math/algebra/mat3.js';
import { Mat4 } from '../../math/algebra/mat4.js';
import '../../math/algebra/bivec.js';
import '../../math/algebra/mat2.js';
import '../../math/algebra/cplx.js';

/** An enum for stereo's eye option */
var EyeStereo;
(function (EyeStereo) {
    EyeStereo[EyeStereo["LeftEye"] = 0] = "LeftEye";
    EyeStereo[EyeStereo["None"] = 1] = "None";
    EyeStereo[EyeStereo["RightEye"] = 2] = "RightEye";
})(EyeStereo || (EyeStereo = {}));
var RetinaSliceFacing;
(function (RetinaSliceFacing) {
    RetinaSliceFacing[RetinaSliceFacing["POSZ"] = 0] = "POSZ";
    RetinaSliceFacing[RetinaSliceFacing["NEGZ"] = 1] = "NEGZ";
    RetinaSliceFacing[RetinaSliceFacing["POSY"] = 2] = "POSY";
    RetinaSliceFacing[RetinaSliceFacing["NEGY"] = 3] = "NEGY";
    RetinaSliceFacing[RetinaSliceFacing["POSX"] = 4] = "POSX";
    RetinaSliceFacing[RetinaSliceFacing["NEGX"] = 5] = "NEGX";
})(RetinaSliceFacing || (RetinaSliceFacing = {}));
const DefaultDisplayConfig = {
    retinaLayers: 64,
    sectionStereoEyeOffset: 0.1,
    retinaStereoEyeOffset: 0.2,
    retinaResolution: 512,
    opacity: 1,
    canvasSize: {
        width: typeof window !== "undefined" ? window.innerWidth * window.devicePixelRatio : 1024,
        height: typeof window !== "undefined" ? window.innerHeight * window.devicePixelRatio : 512
    },
    camera3D: { fov: 40, near: 0.2, far: 20 },
    camera4D: { fov: 90, near: 0.01, far: 10 },
    retinaViewMatrix: new Mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, -5, 0, 0, 0, 1),
    sections: [
        {
            facing: RetinaSliceFacing.NEGX,
            eyeStereo: EyeStereo.LeftEye,
            viewport: { x: -0.2, y: -0.8, width: 0.2, height: 0.2 }
        },
        {
            facing: RetinaSliceFacing.NEGX,
            eyeStereo: EyeStereo.RightEye,
            viewport: { x: 0.8, y: -0.8, width: 0.2, height: 0.2 }
        },
        {
            facing: RetinaSliceFacing.NEGY,
            eyeStereo: EyeStereo.LeftEye,
            viewport: { x: -0.2, y: 0.8, width: 0.2, height: 0.2 }
        },
        {
            facing: RetinaSliceFacing.NEGY,
            eyeStereo: EyeStereo.RightEye,
            viewport: { x: 0.8, y: 0.8, width: 0.2, height: 0.2 }
        },
        {
            facing: RetinaSliceFacing.POSZ,
            eyeStereo: EyeStereo.LeftEye,
            viewport: { x: -0.8, y: -0.8, width: 0.2, height: 0.2 }
        },
        {
            facing: RetinaSliceFacing.POSZ,
            eyeStereo: EyeStereo.RightEye,
            viewport: { x: 0.2, y: 0.2 - 1, width: 0.2, height: 0.2 }
        },
    ]
};

export { DefaultDisplayConfig, EyeStereo, RetinaSliceFacing };
//# sourceMappingURL=interfaces.js.map
