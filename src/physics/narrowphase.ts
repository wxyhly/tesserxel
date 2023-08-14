import { Rotor } from "../math/algebra/rotor";
import { Vec4, vec4Pool } from "../math/algebra/vec4";
import { _COS30, _TAN30 } from "../math/const";
import { BroadPhaseList } from "./broadPhase";
import { epaDiff, gjkDiffTest, gjkOutDistance } from "./gjk";
import { rigid, Rigid } from "./rigid";

export interface Collision {
    point: Vec4;
    depth: number;
    /** normal is defined from a to b */
    normal: Vec4;
    a: Rigid;
    b?: Rigid;
}
// cache
let _vec4 = new Vec4;
let _r = new Rotor;
export class NarrowPhase {
    collisionList: Collision[] = [];
    /** max iteration for sdf methods in detectCollision */
    maxIteration = 5;
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
            if (b instanceof rigid.Spheritorus) return this.detectSpheritorusGlome(b, a);
            if (b instanceof rigid.Torisphere) return this.detectTorisphereGlome(b, a);
            if (b instanceof rigid.Tiger) return this.detectTigerGlome(b, a);
        }
        if (a instanceof rigid.Plane) {
            if (b instanceof rigid.Glome) return this.detectGlomePlane(b, a);
            if (b instanceof rigid.Convex) return this.detectConvexPlane(b, a);
            if (b instanceof rigid.Spheritorus) return this.detectSpheritorusPlane(b, a);
            if (b instanceof rigid.Torisphere) return this.detectTorispherePlane(b, a);
            if (b instanceof rigid.Tiger) return this.detectTigerPlane(b, a);
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
        if (a instanceof rigid.Spheritorus) {
            if (b instanceof rigid.Spheritorus) return this.detectSpheritorusSpheritorus(a, b);
            if (b instanceof rigid.Torisphere) return this.detectTorisphereSpheritorus(b, a);
            if (b instanceof rigid.Plane) return this.detectSpheritorusPlane(a, b);
            if (b instanceof rigid.Glome) return this.detectSpheritorusGlome(a, b);
            if (b instanceof rigid.Tiger) return this.detectTigerSpheritorus(b, a);
        }
        if (a instanceof rigid.Torisphere) {
            if (b instanceof rigid.Torisphere) return this.detectTorisphereTorisphere(a, b);
            if (b instanceof rigid.Spheritorus) return this.detectTorisphereSpheritorus(a, b);
            if (b instanceof rigid.Plane) return this.detectTorispherePlane(a, b);
            if (b instanceof rigid.Glome) return this.detectTorisphereGlome(a, b);
            if (b instanceof rigid.Tiger) return this.detectTigerTorisphere(b, a);

        }
        if (a instanceof rigid.Tiger) {
            if (b instanceof rigid.Tiger) return this.detectTigerTiger(a, b);
            if (b instanceof rigid.Spheritorus) return this.detectTigerSpheritorus(a, b);
            if (b instanceof rigid.Torisphere) return this.detectTigerTorisphere(a, b);
            if (b instanceof rigid.Plane) return this.detectTigerPlane(a, b);
            if (b instanceof rigid.Glome) return this.detectTigerGlome(a, b);
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
        let normal = _vec4.copy(b.normal).rotatesconj(a.rigid.rotation);
        let offset = a.rigid.position.dot(b.normal) - b.offset;
        for (let v of a.points) {
            let depth = -(v.dot(normal) + offset);
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
            a._cachePoints = a.points.map(p => vec4Pool.pop().subset(p, _vec4));
        }
        let result = gjkOutDistance(a._cachePoints);
        if (result.normal && result.distance) {

            let depth = b.radius - result.distance;
            if (depth < 0) return;
            result.normal.rotates(a.rigid.rotation);
            let point = vec4Pool.pop().copy(b.rigid.position).addmulfs(result.normal, -(b.radius + result.distance) * 0.5)
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
                b._cachePoints[p].copy(b.points[p]).rotates(_r).adds(_vec4);
            }
        } else {
            b._cachePoints = b.points.map(
                p => vec4Pool.pop().copy(p).rotates(_r).adds(_vec4)
            );
        }
        // gjk intersection test
        let inter = gjkDiffTest(a.points, b._cachePoints);
        if (!inter.normals) return;
        // epa collision generation
        let result = epaDiff(a.points, b._cachePoints, inter as {
            simplex1: Vec4[];
            simplex2: Vec4[];
            reverseOrder: boolean;
            normals: Vec4[];
        });
        if (result?.normal) {
            let depth = - result.distance;
            let [a1, b1, c1, d1] = result.simplex1;
            let [a2, b2, c2, d2] = result.simplex2;
            let point = vec4Pool.pop();
            if (a1 === b1 && a1 === c1 && a1 === d1) {
                // vertex - ?
                point.copy(a1).addmulfs(result.normal, result.distance * 0.5);
            } else if (a2 === b2 && a2 === c2 && a2 === d2) {
                // ? - vertex
                point.copy(a2).addmulfs(result.normal, -result.distance * 0.5);
            } else {
                let A: Vec4[] = [], B: Vec4[] = [];
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
                    let p1p2 = vec4Pool.pop().subset(A[1], A[0]);
                    let ab = vec4Pool.pop().subset(B[1], B[0]);
                    let ac = vec4Pool.pop().subset(B[2], B[0]);
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
    private detectSpheritorusPlane(a: rigid.Spheritorus, b: rigid.Plane) {
        // convert plane to st's coord
        let normal = _vec4.copy(b.normal).rotatesconj(a.rigid.rotation);
        let offset = a.rigid.position.dot(b.normal) - b.offset;
        let len = Math.hypot(normal.x, normal.w);
        let depth = a.minorRadius - offset + len * a.majorRadius;
        if (depth < 0) return;
        // find support of circle along normal
        if (normal.x === 0 && normal.w === 0) {
            // deal perpendicular case: reduce contact to bottom center point
            let point = a.rigid.position.clone().addmulfs(b.normal, (a.minorRadius + offset) * 0.5);
            this.collisionList.push({ point, normal: b.normal.neg(), depth, a: a.rigid, b: b.rigid });
        } else {
            // point on circle
            let point = new Vec4(normal.x, 0, 0, normal.w).mulfs(-a.majorRadius / len);
            // then to world coord and add normal
            point.rotates(a.rigid.rotation).adds(a.rigid.position).addmulfs(b.normal, depth * 0.5 - a.minorRadius);
            this.collisionList.push({ point, normal: b.normal.neg(), depth, a: a.rigid, b: b.rigid });
        }
    }
    private detectSpheritorusGlome(a: rigid.Spheritorus, b: rigid.Glome) {
        // convert glome to st's coord
        let p = _vec4.subset(b.rigid.position, a.rigid.position).rotatesconj(a.rigid.rotation);
        let xw = p.x * p.x + p.w * p.w;
        let yz = p.y * p.y + p.z * p.z;
        let sqrtxw = Math.sqrt(xw);
        let distance = Math.sqrt(a.majorRadius * a.majorRadius + xw + yz - 2 * sqrtxw * a.majorRadius);
        let depth = a.minorRadius + b.radius - distance;
        if (depth < 0) return;
        // find support of circle along normal
        if (xw === 0) {
            // deal perpendicular case: reduce contact to center point
            let k = 1.0 - (b.radius - depth * 0.5) / distance;
            let point = new Vec4(0, k * p.y, k * p.z).rotates(a.rigid.rotation);
            let normal = point.clone().norms();
            point.adds(a.rigid.position);
            this.collisionList.push({ point, normal, depth: depth / Math.sqrt(yz) * distance, a: a.rigid, b: b.rigid });
        } else {
            let k = a.majorRadius / sqrtxw;
            let point = new Vec4(p.x * k, 0, 0, p.w * k).rotates(a.rigid.rotation);
            let normal = point.adds(a.rigid.position).sub(b.rigid.position).norms().negs();
            point.addmulfs(normal, a.minorRadius - depth * 0.5);
            this.collisionList.push({ point, normal, depth, a: a.rigid, b: b.rigid });
        }
    }

    private detectSpheritorusSpheritorus(a: rigid.Spheritorus, b: rigid.Spheritorus) {
        // position and rotation are b in a's frame 
        let position = _vec4.subset(b.rigid.position, a.rigid.position).rotatesconj(a.rigid.rotation);
        let rotation = _r.copy(b.rigid.rotation).mulslconj(a.rigid.rotation);
        let tempa = b.majorRadius * 0.5;
        let tempb = b.majorRadius * _COS30;
        // choose 3 initial points (120 degree) on b for iteration
        let initialPB = [
            vec4Pool.pop().set(tempa, 0, 0, tempb),
            vec4Pool.pop().set(tempa, 0, 0, -tempb),
            vec4Pool.pop().set(-b.majorRadius)
        ];
        let newP = vec4Pool.pop();
        let prevPInA = vec4Pool.pop();
        let epsilon = Math.min(a.minorRadius, b.minorRadius) * 0.01;
        for (let p of initialPB) {
            // newP and p are in b
            newP.copy(p);
            let needContinue = false;
            for (let iterationCount = 0; iterationCount < this.maxIteration; iterationCount++) {
                // from b to a
                newP.rotates(rotation).adds(position);
                let k = a.majorRadius / Math.hypot(newP.x, newP.w);
                if (!isFinite(k)) { needContinue = true; break; }
                // project to a
                newP.set(newP.x * k, 0, 0, newP.w * k);
                prevPInA.copy(newP);
                // from a to b
                newP.subs(position).rotatesconj(rotation);
                k = b.majorRadius / Math.hypot(newP.x, newP.w);
                if (!isFinite(k)) { needContinue = true; break; }
                // project to b
                newP.set(newP.x * k, 0, 0, newP.w * k);
                // test if iteration still moves
                let dx = Math.abs(newP.x - p.x);
                let dw = Math.abs(newP.w - p.w);
                p.copy(newP);
                if (dx + dw < epsilon) { break; }
            }
            if (needContinue) continue;
            // else there might be collision
            // transform newP to a, then compare newP and prevPInA
            newP.rotates(rotation).adds(position);
            let normal = newP.sub(prevPInA);
            let depth = a.minorRadius + b.minorRadius - normal.norm();
            if (depth < 0) continue;
            // console.log(converge);
            normal.rotates(a.rigid.rotation).norms();
            let point = newP.rotate(a.rigid.rotation).adds(a.rigid.position);
            point.addmulfs(normal, -b.minorRadius + depth * 0.5);
            this.collisionList.push({
                normal, point, depth, a: a.rigid, b: b.rigid
            })
        }
        vec4Pool.push(...initialPB);
    }

    private detectTorispherePlane(a: rigid.Torisphere, b: rigid.Plane) {
        // convert plane to ts's coord
        let normal = _vec4.copy(b.normal).rotatesconj(a.rigid.rotation);
        let offset = a.rigid.position.dot(b.normal) - b.offset;
        let len = Math.hypot(normal.x, normal.z, normal.w);
        let depth = a.minorRadius - offset + len * a.majorRadius;
        if (depth < 0) return;
        // find support of circle along normal
        if (normal.x === 0 && normal.w === 0 && normal.z === 0) {
            // deal perpendicular case: reduce contact to bottom center point
            let point = a.rigid.position.clone().addmulfs(b.normal, (a.minorRadius + offset) * 0.5);
            this.collisionList.push({ point, normal: b.normal.neg(), depth, a: a.rigid, b: b.rigid });
        } else {
            // point on sphere
            let point = new Vec4(normal.x, 0, normal.z, normal.w).mulfs(-a.majorRadius / len);
            // then to world coord and add normal
            point.rotates(a.rigid.rotation).adds(a.rigid.position).addmulfs(b.normal, depth * 0.5 - a.minorRadius);
            this.collisionList.push({ point, normal: b.normal.neg(), depth, a: a.rigid, b: b.rigid });
        }
    }
    private detectTorisphereGlome(a: rigid.Torisphere, b: rigid.Glome) {
        // convert glome to st's coord
        let p = _vec4.subset(b.rigid.position, a.rigid.position).rotatesconj(a.rigid.rotation);
        let xzw = p.x * p.x + p.z * p.z + p.w * p.w;
        let y = p.y * p.y;
        let sqrtxzw = Math.sqrt(xzw);
        let distance = Math.sqrt(a.majorRadius * a.majorRadius + xzw + y - 2 * sqrtxzw * a.majorRadius);
        let depth = a.minorRadius + b.radius - distance;
        if (depth < 0) return;
        // find support of circle along normal
        if (xzw === 0) {
            // deal perpendicular case: reduce contact to center point
            let k = 1.0 - (b.radius - depth * 0.5) / distance;
            let point = new Vec4(0, k * p.y).rotates(a.rigid.rotation);
            let normal = point.clone().norms();
            point.adds(a.rigid.position);
            this.collisionList.push({ point, normal, depth: depth / Math.abs(p.y) * distance, a: a.rigid, b: b.rigid });
        } else {
            let k = a.majorRadius / sqrtxzw;
            let point = new Vec4(p.x * k, 0, p.z * k, p.w * k).rotates(a.rigid.rotation);
            let normal = point.adds(a.rigid.position).sub(b.rigid.position).norms().negs();
            point.addmulfs(normal, a.minorRadius - depth * 0.5);
            this.collisionList.push({ point, normal, depth, a: a.rigid, b: b.rigid });
        }
    }

    private detectTorisphereTorisphere(a: rigid.Torisphere, b: rigid.Torisphere) {
        // position and rotation are b in a's frame 
        let position = _vec4.subset(b.rigid.position, a.rigid.position).rotatesconj(a.rigid.rotation);
        let rotation = _r.copy(b.rigid.rotation).mulslconj(a.rigid.rotation);
        let temp = b.majorRadius * _TAN30;
        // choose 4 initial points (regular tetrahedron) on b for iteration
        let initialPB = [
            vec4Pool.pop().set(temp, 0, temp, temp),
            vec4Pool.pop().set(-temp, 0, -temp, temp),
            vec4Pool.pop().set(-temp, 0, temp, -temp),
            vec4Pool.pop().set(temp, 0, -temp, -temp),
        ];
        let newP = vec4Pool.pop();
        let prevPInA = vec4Pool.pop();
        let epsilon = Math.min(a.minorRadius, b.minorRadius) * 0.01;
        for (let p of initialPB) {
            // newP and p are in b
            newP.copy(p);
            for (let iterationCount = 0; iterationCount < this.maxIteration; iterationCount++) {
                // from b to a
                newP.rotates(rotation).adds(position);
                let k = a.majorRadius / Math.hypot(newP.x, newP.z, newP.w);
                if (!isFinite(k)) break;
                // project to a
                newP.set(newP.x * k, 0, newP.z * k, newP.w * k);
                prevPInA.copy(newP);
                // from a to b
                newP.subs(position).rotatesconj(rotation);
                k = b.majorRadius / Math.hypot(newP.x, newP.z, newP.w);
                if (!isFinite(k)) break;
                // project to b
                newP.set(newP.x * k, 0, newP.z * k, newP.w * k);
                // test if iteration still moves
                let dx = Math.abs(newP.x - p.x);
                let dz = Math.abs(newP.z - p.z);
                let dw = Math.abs(newP.w - p.w);
                p.copy(newP);
                if (dx + dz + dw < epsilon) break;
            }
            // console.log(converge);
            // else there might be collision
            // transform newP to a, then compare newP and prevPInA
            newP.rotates(rotation).adds(position);
            let normal = newP.sub(prevPInA);
            let depth = a.minorRadius + b.minorRadius - normal.norm();
            if (depth < 0) continue;
            normal.rotates(a.rigid.rotation).norms();
            let point = newP.rotate(a.rigid.rotation).adds(a.rigid.position);
            point.addmulfs(normal, -b.minorRadius + depth * 0.5);
            this.collisionList.push({
                normal, point, depth, a: a.rigid, b: b.rigid
            })
        }
    }

    private detectTorisphereSpheritorus(a: rigid.Torisphere, b: rigid.Spheritorus) {
        // position and rotation are b in a's frame 
        let position = _vec4.subset(b.rigid.position, a.rigid.position).rotatesconj(a.rigid.rotation);
        let rotation = _r.copy(b.rigid.rotation).mulslconj(a.rigid.rotation);
        let tempa = b.majorRadius * 0.5;
        let tempb = b.majorRadius * _COS30;
        // choose 3 initial points (120 degree) on b for iteration
        let initialPB = [
            vec4Pool.pop().set(tempa, 0, 0, tempb),
            vec4Pool.pop().set(tempa, 0, 0, -tempb),
            vec4Pool.pop().set(-b.majorRadius)
        ];
        let newP = vec4Pool.pop();
        let prevPInA = vec4Pool.pop();
        let epsilon = Math.min(a.minorRadius, b.minorRadius) * 0.01;
        for (let p of initialPB) {
            // newP and p are in b
            newP.copy(p);
            for (let iterationCount = 0; iterationCount < this.maxIteration; iterationCount++) {
                // from b to a
                newP.rotates(rotation).adds(position);
                let k = a.majorRadius / Math.hypot(newP.x, newP.z, newP.w);
                if (!isFinite(k)) break;
                // project to a
                newP.set(newP.x * k, 0, newP.z * k, newP.w * k);
                prevPInA.copy(newP);
                // from a to b
                newP.subs(position).rotatesconj(rotation);
                k = b.majorRadius / Math.hypot(newP.x, newP.w);
                if (!isFinite(k)) break;
                // project to b
                newP.set(newP.x * k, 0, 0, newP.w * k);
                // test if iteration still moves
                let dx = Math.abs(newP.x - p.x);
                let dw = Math.abs(newP.w - p.w);
                p.copy(newP);
                if (dx + dw < epsilon) break;
            }
            // else there might be collision
            // transform newP to a, then compare newP and prevPInA
            newP.rotates(rotation).adds(position);
            let normal = newP.sub(prevPInA);
            let depth = a.minorRadius + b.minorRadius - normal.norm();
            if (depth < 0) continue;
            normal.rotates(a.rigid.rotation).norms();
            let point = newP.rotate(a.rigid.rotation).adds(a.rigid.position);
            point.addmulfs(normal, -b.minorRadius + depth * 0.5);
            this.collisionList.push({
                normal, point, depth, a: a.rigid, b: b.rigid
            })
        }
    }
    private detectTigerPlane(a: rigid.Tiger, b: rigid.Plane) {
        // convert plane to ts's coord
        let normal = _vec4.copy(b.normal).rotatesconj(a.rigid.rotation);
        let offset = a.rigid.position.dot(b.normal) - b.offset;
        let len1 = Math.hypot(normal.x, normal.y);
        let len2 = Math.hypot(normal.z, normal.w);
        let depth = a.minorRadius - offset + len1 * a.majorRadius1 + len2 * a.majorRadius2;
        if (depth < 0) return;
        // point on flat torus
        let s1 = len1 ? -a.majorRadius1 / len1 : 0;
        let s2 = len2 ? -a.majorRadius2 / len2 : 0;
        let point = new Vec4(normal.x * s1, normal.y * s1, normal.z * s2, normal.w * s2);
        // then to world coord and add normal
        point.rotates(a.rigid.rotation).adds(a.rigid.position).addmulfs(b.normal, depth * 0.5 - a.minorRadius);
        this.collisionList.push({ point, normal: b.normal.neg(), depth, a: a.rigid, b: b.rigid });
    }
    private detectTigerGlome(a: rigid.Tiger, b: rigid.Glome) {
        // convert glome to st's coord
        let p = _vec4.subset(b.rigid.position, a.rigid.position).rotatesconj(a.rigid.rotation);
        let xy = p.x * p.x + p.y * p.y;
        let zw = p.z * p.z + p.w * p.w;
        let sqrtxy = Math.sqrt(xy);
        let sqrtzw = Math.sqrt(zw);
        let distance = Math.sqrt(
            a.majorRadius1 * a.majorRadius1 + a.majorRadius2 * a.majorRadius2
            + xy + zw - 2 * (sqrtxy * a.majorRadius1 + sqrtzw * a.majorRadius2)
        );
        let depth = a.minorRadius + b.radius - distance;
        if (depth < 0) return;
        // find support of circle along normal
        let k1 = sqrtxy ? a.majorRadius1 / sqrtxy : 0;
        let k2 = sqrtzw ? a.majorRadius2 / sqrtzw : 0;
        let point = new Vec4(p.x * k1, p.y * k1, p.z * k2, p.w * k2).rotates(a.rigid.rotation);
        let normal = point.adds(a.rigid.position).sub(b.rigid.position).norms().negs();
        point.addmulfs(normal, a.minorRadius - depth * 0.5);
        this.collisionList.push({ point, normal, depth, a: a.rigid, b: b.rigid });
    }
    private detectTigerTiger(a: rigid.Tiger, b: rigid.Tiger) {
        // position and rotation are b in a's frame 
        let position = _vec4.subset(b.rigid.position, a.rigid.position).rotatesconj(a.rigid.rotation);
        let rotation = _r.copy(b.rigid.rotation).mulslconj(a.rigid.rotation);
        let temp1 = b.majorRadius1;
        let temp2 = b.majorRadius2;
        // choose 8 initial points (w1=0.5,w2=1/4+1/4i) on b for iteration
        let initialPB = [
            vec4Pool.pop().set(temp1, 0, temp2, 0),
            vec4Pool.pop().set(temp1, 0, -temp2, 0),
            vec4Pool.pop().set(-temp1, 0, temp2, 0),
            vec4Pool.pop().set(-temp1, 0, -temp2, 0),
            vec4Pool.pop().set(0, temp1, 0, temp2),
            vec4Pool.pop().set(0, temp1, 0, -temp2),
            vec4Pool.pop().set(0, -temp1, 0, temp2),
            vec4Pool.pop().set(0, -temp1, 0, -temp2),
        ];
        let newP = vec4Pool.pop();
        let prevPInA = vec4Pool.pop();
        let epsilon = Math.min(a.minorRadius, b.minorRadius) * 0.01;
        for (let p of initialPB) {
            // newP and p are in b
            newP.copy(p);
            for (let iterationCount = 0; iterationCount < this.maxIteration; iterationCount++) {
                // from b to a
                newP.rotates(rotation).adds(position);
                let k1 = a.majorRadius1 / Math.hypot(newP.x, newP.y);
                if (!isFinite(k1)) break;
                let k2 = a.majorRadius2 / Math.hypot(newP.z, newP.w);
                if (!isFinite(k2)) break;
                // project to a
                newP.set(newP.x * k1, newP.y * k1, newP.z * k2, newP.w * k2);
                prevPInA.copy(newP);
                // from a to b
                newP.subs(position).rotatesconj(rotation);
                k1 = b.majorRadius1 / Math.hypot(newP.x, newP.y);
                if (!isFinite(k1)) break;
                k2 = b.majorRadius2 / Math.hypot(newP.z, newP.w);
                if (!isFinite(k2)) break;
                // project to b
                newP.set(newP.x * k1, newP.y * k1, newP.z * k2, newP.w * k2);
                // test if iteration still moves
                let dx = Math.abs(newP.x - p.x);
                let dy = Math.abs(newP.y - p.y);
                let dz = Math.abs(newP.z - p.z);
                let dw = Math.abs(newP.w - p.w);
                p.copy(newP);
                if (dx + dy + dz + dw < epsilon) break;
            }
            // console.log(converge);
            // else there might be collision
            // transform newP to a, then compare newP and prevPInA
            newP.rotates(rotation).adds(position);
            let normal = newP.sub(prevPInA);
            let depth = a.minorRadius + b.minorRadius - normal.norm();
            if (depth < 0) continue;
            normal.rotates(a.rigid.rotation).norms();
            let point = newP.rotate(a.rigid.rotation).adds(a.rigid.position);
            point.addmulfs(normal, -b.minorRadius + depth * 0.5);
            this.collisionList.push({
                normal, point, depth, a: a.rigid, b: b.rigid
            })
        }
    }
    private detectTigerTorisphere(a: rigid.Tiger, b: rigid.Torisphere) {
        // position and rotation are b in a's frame 
        let position = _vec4.subset(b.rigid.position, a.rigid.position).rotatesconj(a.rigid.rotation);
        let rotation = _r.copy(b.rigid.rotation).mulslconj(a.rigid.rotation);
        let temp = b.majorRadius * _TAN30;
        // choose 4 initial points (regular tetrahedron) on b for iteration
        let initialPB = [
            vec4Pool.pop().set(temp, 0, temp, temp),
            vec4Pool.pop().set(-temp, 0, -temp, temp),
            vec4Pool.pop().set(-temp, 0, temp, -temp),
            vec4Pool.pop().set(temp, 0, -temp, -temp),
        ];
        let newP = vec4Pool.pop();
        let prevPInA = vec4Pool.pop();
        let epsilon = Math.min(a.minorRadius, b.minorRadius) * 0.01;
        for (let p of initialPB) {
            // newP and p are in b
            newP.copy(p);
            for (let iterationCount = 0; iterationCount < this.maxIteration; iterationCount++) {
                // from b to a
                newP.rotates(rotation).adds(position);
                let k1 = a.majorRadius1 / Math.hypot(newP.x, newP.y);
                if (!isFinite(k1)) break;
                let k2 = a.majorRadius2 / Math.hypot(newP.z, newP.w);
                if (!isFinite(k2)) break;
                // project to a
                newP.set(newP.x * k1, newP.y * k1, newP.z * k2, newP.w * k2);
                prevPInA.copy(newP);
                // from a to b
                newP.subs(position).rotatesconj(rotation);
                let k = b.majorRadius / Math.hypot(newP.x, newP.z, newP.w);
                if (!isFinite(k)) break;
                // project to b
                newP.set(newP.x * k, 0, newP.z * k, newP.w * k);
                // test if iteration still moves
                let dx = Math.abs(newP.x - p.x);
                let dz = Math.abs(newP.z - p.z);
                let dw = Math.abs(newP.w - p.w);
                p.copy(newP);
                if (dx + dz + dw < epsilon) break;
            }
            // console.log(converge);
            // else there might be collision
            // transform newP to a, then compare newP and prevPInA
            newP.rotates(rotation).adds(position);
            let normal = newP.sub(prevPInA);
            let depth = a.minorRadius + b.minorRadius - normal.norm();
            if (depth < 0) continue;
            normal.rotates(a.rigid.rotation).norms();
            let point = newP.rotate(a.rigid.rotation).adds(a.rigid.position);
            point.addmulfs(normal, -b.minorRadius + depth * 0.5);
            this.collisionList.push({
                normal, point, depth, a: a.rigid, b: b.rigid
            })
        }
    }
    private detectTigerSpheritorus(a: rigid.Tiger, b: rigid.Spheritorus) {
        // position and rotation are b in a's frame 
        let position = _vec4.subset(b.rigid.position, a.rigid.position).rotatesconj(a.rigid.rotation);
        let rotation = _r.copy(b.rigid.rotation).mulslconj(a.rigid.rotation);
        let tempa = b.majorRadius * 0.5;
        let tempb = b.majorRadius * _COS30;
        // choose 3 initial points (120 degree) on b for iteration
        let initialPB = [
            vec4Pool.pop().set(tempa, 0, 0, tempb),
            vec4Pool.pop().set(tempa, 0, 0, -tempb),
            vec4Pool.pop().set(-b.majorRadius)
        ];
        let newP = vec4Pool.pop();
        let prevPInA = vec4Pool.pop();
        let epsilon = Math.min(a.minorRadius, b.minorRadius) * 0.01;
        for (let p of initialPB) {
            // newP and p are in b
            newP.copy(p);
            for (let iterationCount = 0; iterationCount < this.maxIteration; iterationCount++) {
                // from b to a
                newP.rotates(rotation).adds(position);
                let k1 = a.majorRadius1 / Math.hypot(newP.x, newP.y);
                if (!isFinite(k1)) break;
                let k2 = a.majorRadius2 / Math.hypot(newP.z, newP.w);
                if (!isFinite(k2)) break;
                // project to a
                newP.set(newP.x * k1, newP.y * k1, newP.z * k2, newP.w * k2);
                prevPInA.copy(newP);
                // from a to b
                newP.subs(position).rotatesconj(rotation);
                let k = b.majorRadius / Math.hypot(newP.x, newP.w);
                if (!isFinite(k)) break;
                // project to b
                newP.set(newP.x * k, 0, 0, newP.w * k);
                // test if iteration still moves
                let dx = Math.abs(newP.x - p.x);
                let dw = Math.abs(newP.w - p.w);
                p.copy(newP);
                if (dx + dw < epsilon) break;
            }
            // console.log(converge);
            // else there might be collision
            // transform newP to a, then compare newP and prevPInA
            newP.rotates(rotation).adds(position);
            let normal = newP.sub(prevPInA);
            let depth = a.minorRadius + b.minorRadius - normal.norm();
            if (depth < 0) continue;
            normal.rotates(a.rigid.rotation).norms();
            let point = newP.rotate(a.rigid.rotation).adds(a.rigid.position);
            point.addmulfs(normal, -b.minorRadius + depth * 0.5);
            this.collisionList.push({
                normal, point, depth, a: a.rigid, b: b.rigid
            })
        }
    }

    private detectDitorusGlome(a: rigid.Ditorus, b: rigid.Glome) {
        // convert glome to dt's coord
        let p = _vec4.subset(b.rigid.position, a.rigid.position).rotatesconj(a.rigid.rotation);
        let xy = p.x * p.x + p.y * p.y;
        let sqrtxy = Math.sqrt(xy);
        let d1 = sqrtxy - a.majorRadius;
        let d2 = Math.sqrt(d1 * d1 + p.z * p.z);
        let ko = a.majorRadius / sqrtxy;
        
        // let d2 = Math.sqrt(d1);

        // let zw = p.z * p.z + p.w * p.w;
        // let sqrtzw = Math.sqrt(zw);
        // let distance = Math.sqrt(
        //     a.majorRadius1 * a.majorRadius1 + a.majorRadius2 * a.majorRadius2
        //     + xy + zw - 2 * (sqrtxy * a.majorRadius1 + sqrtzw * a.majorRadius2)
        // );
        // let depth = a.minorRadius + b.radius - distance;
        // if (depth < 0) return;
        // // find support of circle along normal
        // let k1 = sqrtxy ? a.majorRadius1 / sqrtxy : 0;
        // let k2 = sqrtzw ? a.majorRadius2 / sqrtzw : 0;
        // let point = new Vec4(p.x * k1, p.y * k1, p.z * k2, p.w * k2).rotates(a.rigid.rotation);
        // let normal = point.adds(a.rigid.position).sub(b.rigid.position).norms().negs();
        // point.addmulfs(normal, a.minorRadius - depth * 0.5);
        // this.collisionList.push({ point, normal, depth, a: a.rigid, b: b.rigid });
    }
}
