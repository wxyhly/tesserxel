namespace tesserxel {
    export namespace four {
        export class Scene {
            child: Object[] = [];
            backGroundColor: GPUColor;
            add(...obj: Object[]) {
                this.child.push(...obj);
            }
            removeChild(obj: Object) {
                let index = this.child.indexOf(obj);
                if (index !== -1) {
                    this.child.splice(index, 1);
                } else {
                    console.warn("Cannot remove a non-existed child");
                }
            }
            setBackgroudColor(color: GPUColor) {
                this.backGroundColor = color;
            }
        }
        export class Object extends math.Obj4 {
            child: Object[] = [];
            worldCoord: math.AffineMat4;
            needsUpdateCoord = true;
            alwaysUpdateCoord = false;
            constructor() {
                super();
                this.worldCoord = new math.AffineMat4();
            }
            updateCoord() {
                this.needsUpdateCoord = true;
                return this;
            }
            add(...obj: Object[]) {
                this.child.push(...obj);
            }
            removeChild(obj: Object) {
                let index = this.child.indexOf(obj);
                if (index !== -1) {
                    this.child.splice(index, 1);
                } else {
                    console.warn("Cannot remove a non-existed child");
                }
            }
        }
        export class Camera extends Object implements math.PerspectiveCamera {
            fov: number = 90;
            near: number = 0.1;
            far: number = 100;
            alwaysUpdateCoord = true;
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
            dynamic: boolean = false;
            obb = new math.AABB;
            constructor(data: mesh.TetraMesh) {
                this.jsBuffer = data;
            }
            updateOBB() {
                let obb = this.obb;
                let pos = this.jsBuffer.position;
                obb.min.set(Infinity, Infinity, Infinity, Infinity);
                obb.max.set(-Infinity, -Infinity, -Infinity, -Infinity);
                for (let i = 0, l = this.jsBuffer.count << 4; i < l; i += 4) {
                    obb.min.x = Math.min(obb.min.x, pos[i]);
                    obb.min.y = Math.min(obb.min.y, pos[i + 1]);
                    obb.min.z = Math.min(obb.min.z, pos[i + 2]);
                    obb.min.w = Math.min(obb.min.w, pos[i + 3]);
                    obb.max.x = Math.max(obb.max.x, pos[i]);
                    obb.max.y = Math.max(obb.max.y, pos[i + 1]);
                    obb.max.z = Math.max(obb.max.z, pos[i + 2]);
                    obb.max.w = Math.max(obb.max.w, pos[i + 3]);
                }
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
            constructor(size?: number) {
                super(mesh.tetra.glome(size ?? 1, 16, 16, 12));
            }
        }
        export class SpheritorusGeometry extends Geometry {
            constructor(sphereRadius: number = 0.4, circleRadius: number = 1) {
                super(mesh.tetra.spheritorus(sphereRadius, 16, 12, circleRadius, 16));
            }
        }
        export class TorisphereGeometry extends Geometry {
            constructor(circleRadius: number = 0.2, sphereRadius: number = 0.8) {
                super(mesh.tetra.torisphere(circleRadius, 12, sphereRadius, 16, 12));
            }
        }
        export class TigerGeometry extends Geometry {
            constructor(circleRadius: number = 0.2, radius1: number = 0.8, radius2: number = 0.8) {
                super(mesh.tetra.tiger(radius1, 16, radius2, 16, circleRadius, 12));
            }
        }
        export class ConvexHullGeometry extends Geometry {
            constructor(points: math.Vec4[]) {
                super(mesh.tetra.convexhull(points));
                console.assert(false, "todo: need to generate normal");
            }
        }
    }
}