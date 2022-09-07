namespace tesserxel {
    export namespace four {
        export class Scene {
            child: Object[] = [];
            backGroundColor: GPUColor;
            add(obj: Object) {
                this.child.push(obj);
            }
            setBackgroudColor(color: GPUColor) {
                this.backGroundColor = color;
            }
        }
        export class Object extends math.Obj4 {
            child: Object[] = [];
            worldCoord: math.AffineMat4;
            needsUpdateCoord = true;
            constructor() {
                super();
                this.worldCoord = new math.AffineMat4();
            }
            add(obj: Object) {
                this.child.push(obj);
            }
        }
        export class Camera extends Object implements math.PerspectiveCamera {
            fov: number = 90;
            near: number = 0.1;
            far: number = 100;
            needsUpdate = true;
        }
        export class Mesh extends Object {
            geometry: Geometry;
            material: Material;
            uObjMatBuffer: GPUBuffer;
            bindGroup: GPUBindGroup;
            visible = true;
            constructor(geometry: Geometry, material: Material) {
                super();
                this.geometry = geometry;
                this.material = material;
            }
        }
        export class Geometry {
            jsBuffer: mesh.TetraMesh;
            gpuBuffer: { [name: string]: GPUBuffer };
            needsUpdate = true;
            constructor(data: mesh.TetraMesh) {
                this.jsBuffer = data;
            }
        }
        export class TesseractGeometry extends Geometry {
            constructor(size?: number | math.Vec4) {
                super(mesh.tetra.tesseract());
                if (size) mesh.tetra.applyObj4(this.jsBuffer, new math.Obj4(null, null,
                    size instanceof math.Vec4 ? size : new math.Vec4(size, size, size, size)
                ));
            }
        }
        export class CubeGeometry extends Geometry {
            constructor(size?: number | math.Vec3) {
                super(mesh.tetra.clone(mesh.tetra.cube));
                if (size) mesh.tetra.applyObj4(this.jsBuffer, new math.Obj4(null, null,
                    size instanceof math.Vec3 ? new math.Vec4(size.x, 1, size.y, size.z) : new math.Vec4(size, 1, size, size)
                ));
            }
        }
        export class GlomeGeometry extends Geometry {
            constructor(size?:number) {
                super(mesh.tetra.glome(size??1,16,16,12));
            }
        }
    }
}