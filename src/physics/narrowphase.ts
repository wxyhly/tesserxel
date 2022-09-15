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
        // cache
        let _vec4 = new math.Vec4;
        let _r = new math.Rotor;
        export class NarrowPhase {
            collisionList: Collision[] = [];
            srand: math.Srand;
            constructor() {
                this.srand = new math.Srand(123);
            }
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
                    if (b instanceof rigid.Convex) return this.detectConvexGlome(b, a);
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
                    if (b instanceof rigid.Glome) return this.detectConvexGlome(a, b);
                    if (b instanceof rigid.Convex) {
                        // (arg1,arg2) convert arg2 to arg1's coord
                        if (b.points.length > a.points.length)
                            return this.detectConvexConvex(b, a);
                        return this.detectConvexConvex(a, b);
                    }
                }
            }
            private detectGlomeGlome(a: rigid.Glome, b: rigid.Glome) {
                _vec4.subset(b.rigid.position, a.rigid.position);
                let d = _vec4.norm();
                let depth = a.radius + b.radius - d;
                if (depth < 0) return null;
                // todo: check whether clone can be removed
                let normal = _vec4.divfs(d).clone();
                let point = a.rigid.position.clone().adds(b.rigid.position).mulfs(0.5);
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
            private detectConvexGlome(a: rigid.Convex, b: rigid.Glome) {
                _vec4.subset(b.rigid.position, a.rigid.position).rotatesconj(a.rigid.rotation);
                if (a._cachePoints) {
                    for (let p = 0, l = a.points.length; p < l; p++) {
                        a._cachePoints[p].subset(a.points[p], _vec4);
                    }
                } else {
                    a._cachePoints = a.points.map(p => math.vec4Pool.pop().subset(p, _vec4));
                }
                let result = gjkOutDistance(a._cachePoints);
                if (result.normal && result.distance) {

                    let depth = b.radius - result.distance;
                    if (depth < 0) return;
                    result.normal.rotates(a.rigid.rotation);
                    let point = math.vec4Pool.pop().copy(b.rigid.position).addmulfs(result.normal, -(b.radius + result.distance) * 0.5)
                    this.collisionList.push({ point, normal: result.normal, depth, a: a.rigid, b: b.rigid });
                }
                // todo: EPA
            }
            private detectConvexConvex(a: rigid.Convex, b: rigid.Convex) {
                // calculate in a's frame
                _vec4.subset(b.rigid.position, a.rigid.position).rotatesconj(a.rigid.rotation);
                _r.copy(b.rigid.rotation).mulslconj(a.rigid.rotation);
                if (!isFinite(_vec4.norm1() + _r.l.norm() + _r.r.norm())) {
                    console.assert(isFinite(_vec4.norm1() + _r.l.norm() + _r.r.norm()), "oxoor");
                }
                if (b._cachePoints) {
                    for (let p = 0, l = b.points.length; p < l; p++) {
                        // b._cachePoints[p].srandset(this.srand).mulfs(1e-3).adds(b.points[p]).rotates(_r).adds(_vec4);
                        b._cachePoints[p].copy(b.points[p]).rotates(_r).adds(_vec4);
                    }
                } else {
                    b._cachePoints = b.points.map(
                        // p => math.vec4Pool.pop().srandset(this.srand).mulfs(1e-3).adds(p).rotates(_r).adds(_vec4)
                        p => math.vec4Pool.pop().copy(p).rotates(_r).adds(_vec4)
                    );
                }
                // gjk intersection test
                let inter = gjkDiffTest(a.points, b._cachePoints);
                if (!inter.normals) return;
                // epa collision generation
                let result = epaDiff(a.points, b._cachePoints, inter as {
                    simplex1: math.Vec4[];
                    simplex2: math.Vec4[];
                    reverseOrder: boolean;
                    normals: math.Vec4[];
                });
                if (result?.normal) {
                    let depth = - result.distance;
                    let [a1, b1, c1, d1] = result.simplex1;
                    let [a2, b2, c2, d2] = result.simplex2;
                    let point = math.vec4Pool.pop();
                    if (a1 === b1 && a1 === c1 && a1 === d1) {
                        // vertex - ?
                        point.copy(a1).addmulfs(result.normal, result.distance * 0.5);
                    } else if (a2 === b2 && a2 === c2 && a2 === d2) {
                        // ? - vertex
                        point.copy(a2).addmulfs(result.normal, -result.distance * 0.5);
                    } else {
                        let A = [], B = [];
                        for (let i of result.simplex1) if (A.indexOf(i) === -1) A.push(i);
                        for (let i of result.simplex2) if (B.indexOf(i) === -1) B.push(i);
                        if ((A.length === 2 && B.length === 3) || (B.length === 2 && A.length === 3)) {
                            // edge - face || face - edge
                            let deltaD = result.distance * 0.5;
                            if (B.length === 2) {
                                let temp = A; A = B; B = temp;
                                deltaD = -deltaD;
                            }
                            let p1a = _vec4.subset(B[0], A[0]);
                            let p1p2 = math.vec4Pool.pop().subset(A[1], A[0]);
                            let ab = math.vec4Pool.pop().subset(B[1], B[0]);
                            let ac = math.vec4Pool.pop().subset(B[2], B[0]);
                            let _a1 = p1p2.dot(p1a), _b1 = p1p2.dot(ab), _c1 = p1p2.dot(ac), _d1 = p1p2.dot(p1p2);
                            let _a2 = ab.dot(p1a), _b2 = ab.dot(ab), _c2 = ab.dot(ac), _d2 = _b1;
                            let _a3 = ac.dot(p1a), _b3 = _c2, _c3 = ac.dot(ac), _d3 = _c1;

                            let det = (_b3 * _c2 - _b2 * _c3) * _d1 + (- _b3 * _c1 + _b1 * _c3) * _d2 + (_b2 * _c1 - _b1 * _c2) * _d3;
                            if (det === 0) return;
                            let detInv = 1 / det;
                            let s = ((_a3 * _b2 - _a2 * _b3) * _c1 + (- _a3 * _b1 + _a1 * _b3) * _c2 + (_a2 * _b1 - _a1 * _b2) * _c3) * detInv;

                            point.copy(A[0]).addmulfs(p1p2, s).addmulfs(result.normal, deltaD);
                        }
                    }
                    // if (!isFinite(point.norm1() + result.normal.norm1() + depth)) { console.warn("wrong convex collision numeric result"); return; }
                    this.collisionList.push({
                        point: point.rotates(a.rigid.rotation).adds(a.rigid.position),
                        normal: result.normal.rotates(a.rigid.rotation),
                        depth, a: a.rigid, b: b.rigid
                    });
                }
            }
        }

    }
}