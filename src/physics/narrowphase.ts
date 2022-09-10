namespace tesserxel {
    export namespace physics {
        export interface Collision {
            point: math.Vec4;
            depth: number;
            /** normal is defined from a to b */
            normal: math.Vec4;
            a: Rigid;
            b: Rigid;
        }
        let _vec4 = new math.Vec4; // cache
        let _vec41 = new math.Vec4;
        export class NarrowPhase {
            collisionList: Collision[] = [];
            clearCollisionList() {
                this.collisionList = [];
            }
            run(list: BroadPhaseList) {
                this.clearCollisionList();
                for (let [a, b] of list) {
                    this.detectCollision(a, b);
                }
            }
            detectCollision(rigidA: Rigid, rigidB: Rigid) {
                let a = rigidA.geometry, b = rigidB.geometry;
                if (a instanceof rigid.Glome) {
                    if (b instanceof rigid.Glome) return this.detectGlomeGlome(a, b);
                    if (b instanceof rigid.Plane) return this.detectGlomePlane(a, b);
                }
                if (a instanceof rigid.Plane) {
                    if (b instanceof rigid.Glome) return this.detectGlomePlane(b, a);
                    if (b instanceof rigid.Tesseractoid) {
                        // todo: fast detection for tesseractoid return this.detectTesseractoidPlane(b,a);
                    }
                    if (b instanceof rigid.Convex) return this.detectConvexPlane(b, a);
                }
                if (a instanceof rigid.Tesseractoid) {
                    //todo
                }
                if (a instanceof rigid.Convex) {
                    if (b instanceof rigid.Plane) return this.detectConvexPlane(a, b);
                    if (b instanceof rigid.Convex) return this.detectConvexConvex(a, b);
                }
            }
            private detectGlomeGlome(a: rigid.Glome, b: rigid.Glome) {
                _vec4.subset(b.rigid.position, a.rigid.position);
                let d = _vec4.norm();
                let depth = a.radius + b.radius - d;
                if (depth < 0) return null;
                // todo: check whether clone can be removed
                let normal = _vec4.divfs(d).clone();
                let point = _vec4.mulfs((a.radius - b.radius + d) * 0.5).clone();
                this.collisionList.push({ point, normal, depth, a: a.rigid, b: b.rigid });
            }
            private detectGlomePlane(a: rigid.Glome, b: rigid.Plane) {
                let depth = a.radius - (a.rigid.position.dot(b.normal) - b.offset);
                if (depth < 0) return null;
                let point = a.rigid.position.clone().addmulfs(b.normal, depth * 0.5 - a.radius);
                this.collisionList.push({ point, normal: b.normal.neg(), depth, a: a.rigid, b: b.rigid });
            }
            private detectConvexPlane(a: rigid.Convex, b: rigid.Plane) {
                // convert plane to convex's coord
                let normal = _vec4.copy(b.normal).rotateconj(a.rigid.rotation);
                var offset = a.rigid.position.dot(b.normal) - b.offset;
                for (let v of a.points) {
                    var depth = -(v.dot(normal) + offset);
                    if (depth < 0) continue;
                    let point = v.clone().rotates(a.rigid.rotation).adds(a.rigid.position).addmulfs(b.normal, depth / 2);
                    this.collisionList.push({ point, normal: b.normal.neg(), depth, a: a.rigid, b: b.rigid });
                }
            }
            private detectConvexConvex(a: rigid.Convex, b: rigid.Convex) {
                // GJK here !
            }
        }

    }
}