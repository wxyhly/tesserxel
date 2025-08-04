import { Obj4 } from '../math/algebra/affine.js';
import { Bivec, bivecPool } from '../math/algebra/bivec.js';
import { Matrix } from '../math/algebra/matrix.js';
import { Vec4, vec4Pool } from '../math/algebra/vec4.js';
import { AABB } from '../math/geometry/primitive.js';
import '../math/algebra/vec2.js';
import '../math/algebra/vec3.js';
import { Quaternion } from '../math/algebra/quaternion.js';
import '../math/algebra/mat2.js';
import '../math/algebra/mat3.js';
import '../math/algebra/mat4.js';
import { Rotor } from '../math/algebra/rotor.js';
import '../math/algebra/cplx.js';
import { mulBivec, Material } from './engine.js';

/** all properities hold by class Rigid should not be modified
 *  exceptions are position/rotation and (angular)velocity.
 *  pass RigidDescriptor into constructor instead.
 *  */
class Rigid extends Obj4 {
    material;
    // Caution: Two Rigids cannot share the same RigidGeometry instance
    geometry;
    type;
    mass;
    invMass;
    // inertia is a 6x6 Matrix for angularVelocity -> angularMomentum
    // this is diagonalbMatrix under principal axes coordinates
    inertia = new Bivec();
    invInertia = new Bivec();
    inertiaIsotroy; // whether using scalar inertia
    // only apply to active type object
    sleep = false;
    // for tracing debug
    label;
    velocity = new Vec4();
    angularVelocity = new Bivec();
    force = new Vec4();
    torque = new Bivec();
    acceleration = new Vec4();
    angularAcceleration = new Bivec();
    constructor(param) {
        super();
        if (param.length) {
            this.geometry = new rigid.Union(param);
        }
        else {
            let option = param;
            this.geometry = option.geometry;
            this.mass = isFinite(option.mass) ? option.mass : 0;
            this.type = option.type ?? "active";
            this.invMass = this.mass > 0 && (this.type === "active") ? 1 / this.mass : 0;
            this.material = option.material;
            this.label = option.label;
        }
        this.geometry.initialize(this);
    }
    getlinearVelocity(out, point) {
        if (this.type === "still")
            return out.set();
        let relPosition = out.subset(point, this.position);
        return out.dotbset(relPosition, this.angularVelocity).adds(this.velocity);
    }
    getMomentum(out) {
        if (this.type === "still")
            return out.set();
        return out.copy(this.velocity).mulfs(this.mass);
    }
    /** type: "J" for total, type: "S" for Spin, type: "L" for Orbital, */
    getAngularMomentum(out, point = new Vec4, type = "J") {
        const v = vec4Pool.pop();
        const p = vec4Pool.pop().copy(this.position);
        if (point)
            p.subs(point);
        if (type === "J" || type === "L") {
            out.wedgevvset(p, this.getMomentum(v));
        }
        else {
            out.set();
        }
        if (type === "L")
            return out;
        p.pushPool();
        const localW = bivecPool.pop();
        const localIW = bivecPool.pop();
        localW.rotateconjset(this.angularVelocity, this.rotation);
        mulBivec(localIW, this.inertia, localW);
        v.pushPool();
        return out.adds(localIW.rotates(this.rotation));
    }
    getLinearKineticEnergy() {
        return this.velocity.normsqr() * this.mass / 2;
    }
    getAngularKineticEnergy() {
        const localW = bivecPool.pop();
        const localIW = bivecPool.pop();
        localW.rotateset(this.angularVelocity, this.rotation);
        const k = localW.dot(mulBivec(localIW, this.inertia, localW)) / 2;
        localIW.pushPool();
        localIW.pushPool();
        return k;
    }
    getKineticEnergy() {
        return this.getLinearKineticEnergy() + this.getAngularKineticEnergy();
    }
}
class RigidGeometry {
    rigid;
    obb;
    aabb;
    boundingGlome;
    initialize(rigid) {
        this.rigid = rigid;
        this.initializeMassInertia(rigid);
        if (!rigid.mass && rigid.type === "active")
            rigid.type = "still";
        if (rigid.inertia) {
            rigid.invInertia.xy = 1 / rigid.inertia.xy;
            if (!rigid.inertiaIsotroy) {
                rigid.invInertia.xz = 1 / rigid.inertia.xz;
                rigid.invInertia.yz = 1 / rigid.inertia.yz;
                rigid.invInertia.xw = 1 / rigid.inertia.xw;
                rigid.invInertia.yw = 1 / rigid.inertia.yw;
                rigid.invInertia.zw = 1 / rigid.inertia.zw;
            }
            else {
                rigid.invInertia.xz = rigid.invInertia.xy;
                rigid.invInertia.yz = rigid.invInertia.xy;
                rigid.invInertia.xw = rigid.invInertia.xy;
                rigid.invInertia.yw = rigid.invInertia.xy;
                rigid.invInertia.zw = rigid.invInertia.xy;
                rigid.inertia.xz = rigid.inertia.xy;
                rigid.inertia.yz = rigid.inertia.xy;
                rigid.inertia.xw = rigid.inertia.xy;
                rigid.inertia.yw = rigid.inertia.xy;
                rigid.inertia.zw = rigid.inertia.xy;
            }
        }
    }
    ;
}
var rigid;
(function (rigid_1) {
    class Union extends RigidGeometry {
        components;
        constructor(components) { super(); this.components = components; }
        // todo: union gen
        initializeMassInertia(rigid) {
            // set union rigid's position at mass center of rigids
            rigid.position.set();
            rigid.mass = 0;
            for (let r of this.components) {
                if (r.mass === undefined)
                    console.error("Union Rigid Geometry cannot contain a still rigid.");
                rigid.position.addmulfs(r.position, r.mass);
                rigid.mass += r.mass;
            }
            rigid.invMass = 1 / rigid.mass;
            rigid.position.mulfs(rigid.invMass);
            // update rigids position to relative frame
            for (let r of this.components) {
                r.localCoord = new Obj4().copyObj4(r);
                r.localCoord.position.subs(rigid.position);
                r.parent = rigid;
            }
            // todo
            // let inertia = new Matrix(6,6);
            rigid.inertia.xy = 1;
            rigid.inertiaIsotroy = true;
            rigid.type = "active";
        }
        ;
        updateCoord() {
            for (let r of this.components) {
                r.position.copy(r.localCoord.position).rotates(this.rigid.rotation).adds(this.rigid.position);
                r.rotation.copy(r.localCoord.rotation).mulsl(this.rigid.rotation);
            }
        }
    }
    rigid_1.Union = Union;
    class Glome extends RigidGeometry {
        radius = 1;
        radiusSqr = 1;
        inertiaCoefficient;
        constructor(radius, inertiaCoefficient = 0.25) {
            super();
            this.radius = radius;
            this.boundingGlome = radius;
            this.radiusSqr = radius * radius;
            this.inertiaCoefficient = inertiaCoefficient;
        }
        initializeMassInertia(rigid) {
            rigid.inertiaIsotroy = true;
            rigid.inertia.xy = rigid.mass * this.radiusSqr * this.inertiaCoefficient;
        }
    }
    rigid_1.Glome = Glome;
    class Convex extends RigidGeometry {
        points;
        _cachePoints;
        constructor(points) {
            super();
            this.points = points;
            this.obb = AABB.fromPoints(points);
            this.boundingGlome = 0;
            for (let i of points) {
                this.boundingGlome = Math.max(this.boundingGlome, i.normsqr());
            }
            this.boundingGlome = Math.sqrt(this.boundingGlome);
        }
        getPointsInertia(points, mass) {
            const inertiaMat = new Matrix(6);
            const tempMat = new Matrix(6);
            for (const p of points) {
                const r11 = p.x * p.x;
                const r12 = p.x * p.y;
                const r13 = p.x * p.z;
                const r14 = p.x * p.w;
                const r22 = p.y * p.y;
                const r23 = p.y * p.z;
                const r24 = p.y * p.w;
                const r33 = p.z * p.z;
                const r34 = p.z * p.w;
                const r44 = p.w * p.w;
                tempMat.setElements(r11 + r22, r23, r24, -r13, -r14, 0, r23, r11 + r33, r34, r12, 0, -r14, r24, r34, r44 + r11, 0, r12, r13, -r13, r12, 0, r22 + r33, r34, -r24, -r14, 0, r12, r34, r44 + r22, r23, 0, -r14, r13, -r24, r23, r33 + r44).ts();
                inertiaMat.adds(tempMat);
            }
            return inertiaMat.mulfs(mass / points.length);
        }
        initializeMassInertia(rigid) {
            // todo inertia calc
            new Matrix(6);
            // const Rt = Rotor.rand();
            const clinicMat = Matrix.fromArray([
                [1, 0, 0, 0, 0, 1],
                [0, 1, 0, 0, -1, 0],
                [0, 0, 1, 1, 0, 0],
                [1, 0, 0, 0, 0, -1],
                [0, 1, 0, 0, 1, 0],
                [0, 0, 1, -1, 0, 0],
            ]).mulfs(Math.SQRT1_2);
            const clinicMats = clinicMat.clone().ts();
            // calculate inertia matrix before rotation
            // const inertiaMat0 = this.getPointsInertia((rigid.geometry as Convex).points, rigid.mass);
            // (rigid.geometry as Convex).points.forEach(v => v.rotates(Rt));
            // calculate inertia matrix after rotation
            const inertiaMat = this.getPointsInertia(rigid.geometry.points, rigid.mass);
            // console.log(inertiaMat0,RtMat.mul(inertiaMat).mul(RtMat.ts())); // ok
            // convert to isoclinic basis
            // const iClinicMat0 = clinicMat.mul(inertiaMat0).mul(clinicMats);
            const iClinicMat = clinicMat.mul(inertiaMat).mul(clinicMats);
            // console.log(iClinicMat0, iClinicMat);
            // extract part P:
            // [aId  P; P'  aId]
            const p = iClinicMat.subMatrix(0, 3, 3, 3);
            if (p.norm1() < 1e-5) {
                rigid.inertiaIsotroy = true;
                rigid.inertia.set(...inertiaMat.diag()).mulfs(rigid.mass * 0.2); // factor for solid
                return;
            }
            const { U, V } = p.SVdecompose(24);
            if (V.det() < 0) {
                V.elem[6] = -V.elem[6];
                V.elem[7] = -V.elem[7];
                V.elem[8] = -V.elem[8];
            }
            // const newR = new Matrix(6);
            // const L = Matrix.fromArray([[0, 0, 1], [0, 1, 0], [1, 0, 0]]);
            // newR.setFromSubMatrix(U.clone().ts(), 3, 3);
            // newR.setFromSubMatrix((V.clone()), 3, 3, 0, 0, 3, 3);
            // console.log(newR.mul(iClinicMat).mul(newR.clone().ts()));
            const rL = new Quaternion().setFromMat3(U.toMat3());
            const rR = new Quaternion().setFromMat3(V.toMat3());
            const rotor = new Rotor(rL, rR);
            // console.log(newR, toBivecClinicMatrix(rotor));
            rigid.geometry.points.forEach(v => v.rotatesconj(rotor));
            // calculate inertia matrix
            const inertiaMat2 = this.getPointsInertia(rigid.geometry.points, rigid.mass);
            // console.log(inertiaMat2);
            rigid.rotates(rotor);
            rigid.inertia.set(...inertiaMat2.diag()).mulfs(rigid.mass * 0.2); // factor for solid
        }
    }
    rigid_1.Convex = Convex;
    class Tesseractoid extends Convex {
        size;
        constructor(size) {
            let s = typeof size === "number" ? new Vec4(size, size, size, size) : size;
            super([
                new Vec4(s.x, s.y, s.z, s.w),
                new Vec4(-s.x, s.y, s.z, s.w),
                new Vec4(s.x, -s.y, s.z, s.w),
                new Vec4(-s.x, -s.y, s.z, s.w),
                new Vec4(s.x, s.y, -s.z, s.w),
                new Vec4(-s.x, s.y, -s.z, s.w),
                new Vec4(s.x, -s.y, -s.z, s.w),
                new Vec4(-s.x, -s.y, -s.z, s.w),
                new Vec4(s.x, s.y, s.z, -s.w),
                new Vec4(-s.x, s.y, s.z, -s.w),
                new Vec4(s.x, -s.y, s.z, -s.w),
                new Vec4(-s.x, -s.y, s.z, -s.w),
                new Vec4(s.x, s.y, -s.z, -s.w),
                new Vec4(-s.x, s.y, -s.z, -s.w),
                new Vec4(s.x, -s.y, -s.z, -s.w),
                new Vec4(-s.x, -s.y, -s.z, -s.w),
            ]);
            this.size = s;
        }
        initializeMassInertia(rigid) {
            let mins = Math.min(this.size.x, this.size.y, this.size.z, this.size.w);
            let maxs = Math.max(this.size.x, this.size.y, this.size.z, this.size.w);
            let isoratio = mins / maxs;
            rigid.inertiaIsotroy = isoratio > 0.95;
            if (rigid.inertiaIsotroy) {
                rigid.inertia.xy = rigid.mass * (mins + maxs) * (mins + maxs) * 0.2;
            }
            else {
                let x = this.size.x * this.size.x;
                let y = this.size.y * this.size.y;
                let z = this.size.z * this.size.z;
                let w = this.size.w * this.size.w;
                rigid.inertia.set(x + y, x + z, x + w, y + z, y + w, z + w).mulfs(rigid.mass * 0.2);
            }
        }
    }
    rigid_1.Tesseractoid = Tesseractoid;
    class Duocylinder extends Convex {
        radius1;
        radius2;
        segment1;
        segment2;
        constructor(radius1, radius2, segment1, segment2) {
            const ps = [];
            const d1 = Math.PI * 2 / segment1;
            const d2 = Math.PI * 2 / segment2;
            for (let i = 0, ii = 0; i < segment1; i++, ii += d1) {
                for (let j = 0, jj = 0; j < segment2; j++, jj += d2) {
                    ps.push(new Vec4(Math.sin(ii) * radius1, Math.sin(jj) * radius2, Math.cos(jj) * radius2, Math.cos(ii) * radius1));
                }
            }
            super(ps);
            this.radius1 = radius1;
            this.radius2 = radius2;
            this.segment1 = segment1;
            this.segment2 = segment2;
        }
        initializeMassInertia(rigid) {
            let isoratio = this.radius1 / this.radius2;
            rigid.inertiaIsotroy = isoratio > 0.95 && isoratio < 1.05;
            if (rigid.inertiaIsotroy) {
                rigid.inertia.xy = rigid.mass * (this.radius1 + this.radius2) * (this.radius1 + this.radius2) * 0.2;
            }
            else {
                let x = this.radius1 * this.radius1;
                let y = this.radius2 * this.radius2;
                let z = y;
                let w = x;
                rigid.inertia.set(x + y, x + z, x + w, y + z, y + w, z + w).mulfs(rigid.mass * 0.2);
            }
        }
    }
    rigid_1.Duocylinder = Duocylinder;
    /** equation: dot(normal,positon) == offset
     *  => when offset > 0, plane is shifted to normal direction
     *  from origin by distance = offset
     */
    class Plane extends RigidGeometry {
        normal;
        offset;
        constructor(normal, offset) {
            super();
            this.normal = normal ?? Vec4.y.clone();
            this.offset = offset ?? 0;
        }
        initializeMassInertia(rigid) {
            if (rigid.mass)
                console.warn("Infinitive Plane cannot have a finitive mass.");
            rigid.mass = undefined;
            rigid.invMass = 0;
            rigid.inertia = undefined;
            rigid.invInertia = undefined;
        }
    }
    rigid_1.Plane = Plane;
    class GlomicCavity extends RigidGeometry {
        radius;
        constructor(radius) {
            super();
            this.radius = radius;
        }
        initializeMassInertia(rigid) {
            if (rigid.mass)
                console.warn("GlomicCavity cannot have a finitive mass.");
            rigid.mass = undefined;
            rigid.invMass = 0;
            rigid.inertia = undefined;
            rigid.invInertia = undefined;
        }
    }
    rigid_1.GlomicCavity = GlomicCavity;
    /** default orientation: XW */
    class Spheritorus extends RigidGeometry {
        majorRadius;
        minorRadius;
        /** majorRadius: cirle's radius, minorRadius: sphere's radius */
        constructor(majorRadius, minorRadius) {
            super();
            this.majorRadius = majorRadius;
            this.minorRadius = minorRadius;
            this.obb = new AABB(new Vec4(-majorRadius - minorRadius, -minorRadius, -minorRadius, -majorRadius - minorRadius), new Vec4(majorRadius + minorRadius, minorRadius, minorRadius, majorRadius + minorRadius));
            this.boundingGlome = majorRadius + minorRadius;
        }
        initializeMassInertia(rigid) {
            rigid.inertiaIsotroy = false;
            let maj = this.majorRadius * this.majorRadius;
            let min = this.minorRadius * this.minorRadius;
            let half = maj + 5 * min;
            let parallel = 2 * maj + 6 * min;
            let perp = 4 * min;
            rigid.inertia.set(half, half, parallel, perp, half, half).mulfs(rigid.mass * 0.1);
        }
    }
    rigid_1.Spheritorus = Spheritorus;
    /** default orientation: XZW */
    class Torisphere extends RigidGeometry {
        majorRadius;
        minorRadius;
        /** majorRadius: sphere's radius, minorRadius: cirle's radius */
        constructor(majorRadius, minorRadius) {
            super();
            this.majorRadius = majorRadius;
            this.minorRadius = minorRadius;
            this.obb = new AABB(new Vec4(-majorRadius - minorRadius, -minorRadius, -majorRadius - minorRadius, -majorRadius - minorRadius), new Vec4(majorRadius + minorRadius, minorRadius, majorRadius + minorRadius, majorRadius + minorRadius));
            this.boundingGlome = majorRadius + minorRadius;
        }
        initializeMassInertia(rigid) {
            rigid.inertiaIsotroy = false;
            let maj = this.majorRadius * this.majorRadius;
            let min = this.minorRadius * this.minorRadius;
            let half = 2 * maj + 5 * min;
            let parallel = 3 * maj + 6 * min;
            rigid.inertia.set(half, parallel, parallel, half, half, parallel).mulfs(rigid.mass * 0.1);
        }
    }
    rigid_1.Torisphere = Torisphere;
    /** default orientation: 1:XY, 2:ZW */
    class Tiger extends RigidGeometry {
        majorRadius1;
        majorRadius2;
        minorRadius;
        /** majorRadius: sphere's radius, minorRadius: cirle's radius */
        constructor(majorRadius1, majorRadius2, minorRadius) {
            super();
            this.majorRadius1 = majorRadius1;
            this.majorRadius2 = majorRadius2;
            this.minorRadius = minorRadius;
            this.obb = new AABB(new Vec4(-majorRadius1 - minorRadius, -majorRadius1 - minorRadius, -majorRadius2 - minorRadius, -majorRadius2 - minorRadius), new Vec4(majorRadius1 + minorRadius, majorRadius1 + minorRadius, majorRadius2 + minorRadius, majorRadius2 + minorRadius));
            this.boundingGlome = Math.max(majorRadius1, majorRadius2) + minorRadius;
        }
        initializeMassInertia(rigid) {
            rigid.inertiaIsotroy = false;
            let maj1 = this.majorRadius1 * this.majorRadius1;
            let maj2 = this.majorRadius2 * this.majorRadius2;
            let min = this.minorRadius * this.minorRadius;
            let half = maj1 + maj2 + min * 6;
            rigid.inertia.set(2 * maj1 + min * 5, half, half, half, half, 2 * maj2 + min * 5).mulfs(rigid.mass * 0.5);
        }
    }
    rigid_1.Tiger = Tiger;
    /** default orientation: (xy-z)-w */
    class Ditorus extends RigidGeometry {
        majorRadius;
        middleRadius;
        minorRadius;
        /** majorRadius, minorRadius: torus's radius, minorRadius: cirle's radius */
        constructor(majorRadius, middleRadius, minorRadius) {
            super();
            this.majorRadius = majorRadius;
            this.minorRadius = minorRadius;
            this.middleRadius = middleRadius;
            let minorRadius12 = minorRadius + middleRadius;
            this.obb = new AABB(new Vec4(-majorRadius - minorRadius12, -majorRadius - minorRadius12, -minorRadius12, -minorRadius), new Vec4(majorRadius + minorRadius12, majorRadius + minorRadius12, minorRadius12, minorRadius));
            this.boundingGlome = majorRadius + minorRadius12;
        }
        initializeMassInertia(rigid) {
            rigid.inertiaIsotroy = false;
            let maj1 = this.majorRadius * this.majorRadius;
            this.majorRadius * this.middleRadius;
            let min = this.middleRadius * this.middleRadius;
            let min2 = this.minorRadius * this.middleRadius;
            rigid.inertia.set(2 * maj1 + min * 5, maj1 + min * 6 + min2, maj1 + min2, maj1 + min * 6 + min2, maj1 + min2, 2 * min + min2).mulfs(rigid.mass * 0.2);
        }
    }
    rigid_1.Ditorus = Ditorus;
    // todo
    class ThickHexahedronGrid extends RigidGeometry {
        grid1;
        grid2;
        convex;
        constructor(grid1, grid2) {
            super();
            this.grid1 = grid1;
            this.grid2 = grid2;
            this.convex = [];
            for (let w = 0, lw = grid1.length - 1; w < lw; w++) {
                let grd1w = grid1[w];
                let grd2w = grid2[w];
                let grd1w1 = grid1[w + 1];
                let grd2w1 = grid2[w + 1];
                for (let z = 0, lz = grid1[0].length - 1; z < lz; z++) {
                    let grd1wz = grd1w[z];
                    let grd2wz = grd2w[z];
                    let grd1wz1 = grd1w[z + 1];
                    let grd2wz1 = grd2w[z + 1];
                    let grd1w1z = grd1w1[z];
                    let grd2w1z = grd2w1[z];
                    let grd1w1z1 = grd1w1[z + 1];
                    let grd2w1z1 = grd2w1[z + 1];
                    for (let x = 0, lx = grid1[0][0].length - 1; x < lx; x++) {
                        let c = [
                            grd1wz[x],
                            grd1wz[x + 1],
                            grd1wz1[x],
                            grd1wz1[x + 1],
                            grd1w1z[x],
                            grd1w1z[x + 1],
                            grd1w1z1[x],
                            grd1w1z1[x + 1],
                            grd2wz[x],
                            grd2wz[x + 1],
                            grd2wz1[x],
                            grd2wz1[x + 1],
                            grd2w1z[x],
                            grd2w1z[x + 1],
                            grd2w1z1[x],
                            grd2w1z1[x + 1],
                        ];
                        let sum = new Vec4();
                        c.reduceRight((a, b) => { return sum.addset(a, b); }).divfs(16);
                        this.convex.push(new Convex(c.map(c => c.sub(sum))));
                    }
                }
            }
        }
        initializeMassInertia(rigid) {
            if (rigid.mass)
                console.warn("HeightField doesnt support a finitive mass.");
            rigid.mass = undefined;
            rigid.invMass = 0;
            rigid.inertia = undefined;
            rigid.invInertia = undefined;
        }
    }
    rigid_1.ThickHexahedronGrid = ThickHexahedronGrid;
    /** todo */
    class LoftedConvex extends Union {
        constructor(sp, section, step) {
            const { points, rotors } = sp.generate(step);
            const components = [];
            for (let j = 1; j < rotors.length; j++) {
                let r = rotors[j];
                let p = points[j];
                let r0 = rotors[j - 1];
                let p0 = points[j - 1];
                let ps = section.map(v => v.rotate(r).adds(p));
                let ps0 = section.map(v => v.rotate(r0).adds(p0));
                ps.push(...ps0);
                components.push(new Rigid({ geometry: new Convex(ps), mass: 0, material: new Material(1, 0.6) }));
            }
            super(components);
        }
        initializeMassInertia(rigid) {
            if (rigid.mass)
                console.warn("LoftedConvex doesnt support a finitive mass.");
            rigid.mass = undefined;
            rigid.invMass = 0;
            rigid.inertia = undefined;
            rigid.invInertia = undefined;
        }
    }
    rigid_1.LoftedConvex = LoftedConvex;
})(rigid || (rigid = {}));

export { Rigid, RigidGeometry, rigid };
//# sourceMappingURL=rigid.js.map
