import { Obj4 } from "../math/algebra/affine";
import { Bivec, bivecPool } from "../math/algebra/bivec";
import { Matrix } from "../math/algebra/matrix";
import { Vec4, vec4Pool } from "../math/algebra/vec4";
import { AABB } from "../math/geometry/primitive";
import { Quaternion, Rotor, Spline } from "../math/math";
import { Material, mulBivec } from "./engine";

export type RigidType = "still" | "passive" | "active";
interface SimpleRigidDescriptor {
    /** mass set to 0 to specify non-active rigid */
    mass: number | null;
    /** RigidGeometry instance cannot be shared between Rigid instances */
    geometry: RigidGeometry;
    material: Material;
    type?: RigidType;
    /** for tracing debug */
    label?: string;
};
/** Subrigids should not be added into scene repetively.
 * Subrigids's positions cannot be modified after union created
 */
type UnionRigidDescriptor = Rigid[];
/** all properities hold by class Rigid should not be modified
 *  exceptions are position/rotation and (angular)velocity.
 *  pass RigidDescriptor into constructor instead.
 *  */
export class Rigid extends Obj4 {
    // Rigid extends Obj4, it has position and rotation, but no scale
    declare scale: undefined;
    material: Material;
    // Caution: Two Rigids cannot share the same RigidGeometry instance
    geometry: RigidGeometry;
    type: RigidType;
    mass: number | undefined;
    invMass: number;
    // inertia is a 6x6 Matrix for angularVelocity -> angularMomentum
    // this is diagonalbMatrix under principal axes coordinates
    inertia: Bivec | undefined = new Bivec();
    invInertia: Bivec | undefined = new Bivec();
    inertiaIsotroy: boolean; // whether using scalar inertia
    // only apply to active type object
    sleep: boolean = false;
    // for tracing debug
    label?: string;

    velocity: Vec4 = new Vec4();
    angularVelocity: Bivec = new Bivec();
    force: Vec4 = new Vec4();
    torque: Bivec = new Bivec();
    acceleration: Vec4 = new Vec4();
    angularAcceleration: Bivec = new Bivec();
    constructor(param: SimpleRigidDescriptor | UnionRigidDescriptor) {
        super();
        if ((param as UnionRigidDescriptor).length) {
            this.geometry = new rigid.Union(param as UnionRigidDescriptor);
        } else {
            let option = param as SimpleRigidDescriptor;
            this.geometry = option.geometry;
            this.mass = isFinite(option.mass as number) ? option.mass! : 0;
            this.type = option.type ?? "active";
            this.invMass = this.mass > 0 && (this.type === "active") ? 1 / this.mass : 0;
            this.material = option.material;
            this.label = option.label;
        }
        this.geometry.initialize(this);
    }

    getlinearVelocity(out: Vec4, point: Vec4) {
        if (this.type === "still") return out.set();
        let relPosition = out.subset(point, this.position);
        return out.dotbset(relPosition, this.angularVelocity).adds(this.velocity);
    }
    getMomentum(out: Vec4) {
        if (this.type === "still") return out.set();
        return out.copy(this.velocity).mulfs(this.mass);
    }
    /** type: "J" for total, type: "S" for Spin, type: "L" for Orbital, */
    getAngularMomentum(out: Bivec, point = new Vec4, type: "J" | "S" | "L" = "J") {
        const v = vec4Pool.pop();
        const p = vec4Pool.pop().copy(this.position);
        if (point) p.subs(point);
        if (type === "J" || type === "L") {
            out.wedgevvset(p, this.getMomentum(v));
        } else {
            out.set();
        }
        if (type === "L") return out;
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
        localIW.pushPool(); localIW.pushPool();
        return k;
    }
    getKineticEnergy() {
        return this.getLinearKineticEnergy() + this.getAngularKineticEnergy();
    }
}
/** internal type for union rigid geometry */
export interface SubRigid extends Rigid {
    localCoord?: Obj4;
    parent?: Rigid;
}
export abstract class RigidGeometry {
    rigid: Rigid;
    obb: AABB;
    aabb: AABB;
    boundingGlome: number;
    initialize(rigid: Rigid) {
        this.rigid = rigid;
        this.initializeMassInertia(rigid);
        if (!rigid.mass && rigid.type === "active") rigid.type = "still";
        if (rigid.inertia) {
            rigid.invInertia.xy = 1 / rigid.inertia.xy;
            if (!rigid.inertiaIsotroy) {
                rigid.invInertia.xz = 1 / rigid.inertia.xz;
                rigid.invInertia.yz = 1 / rigid.inertia.yz;
                rigid.invInertia.xw = 1 / rigid.inertia.xw;
                rigid.invInertia.yw = 1 / rigid.inertia.yw;
                rigid.invInertia.zw = 1 / rigid.inertia.zw;
            } else {
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
    };
    abstract initializeMassInertia(rigid: Rigid): void;
}
export namespace rigid {
    export class Union extends RigidGeometry {
        components: SubRigid[];
        constructor(components: Rigid[]) { super(); this.components = components; }
        // todo: union gen
        initializeMassInertia(rigid: Rigid) {
            // set union rigid's position at mass center of rigids
            rigid.position.set();
            rigid.mass = 0;
            for (let r of this.components) {
                if (r.mass === undefined) console.error("Union Rigid Geometry cannot contain a still rigid.");
                rigid.position.addmulfs(r.position, r.mass!);
                rigid.mass += r.mass!;
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
        };
        updateCoord() {
            for (let r of this.components) {
                r.position.copy(r.localCoord.position).rotates(this.rigid.rotation).adds(this.rigid.position);
                r.rotation.copy(r.localCoord.rotation).mulsl(this.rigid.rotation);
            }
        }
    }
    export class Glome extends RigidGeometry {
        radius: number = 1;
        radiusSqr: number = 1;
        inertiaCoefficient: number;
        constructor(radius: number, inertiaCoefficient = 0.25) {
            super();
            this.radius = radius;
            this.boundingGlome = radius;
            this.radiusSqr = radius * radius;
            this.inertiaCoefficient = inertiaCoefficient;
        }
        initializeMassInertia(rigid: Rigid) {
            rigid.inertiaIsotroy = true;
            rigid.inertia.xy = rigid.mass * this.radiusSqr * this.inertiaCoefficient;
        }
    }
    export class Convex extends RigidGeometry {
        points: Vec4[];
        _cachePoints: Vec4[];
        constructor(points: Vec4[]) {
            super();
            this.points = points;
            this.obb = AABB.fromPoints(points);
            this.boundingGlome = 0;
            for (let i of points) {
                this.boundingGlome = Math.max(this.boundingGlome, i.normsqr());
            }
            this.boundingGlome = Math.sqrt(this.boundingGlome);
        }
        private getPointsInertia(points: Vec4[], mass: number) {
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
                tempMat.setElements(
                    r11 + r22, r23, r24, -r13, -r14, 0,
                    r23, r11 + r33, r34, r12, 0, -r14,
                    r24, r34, r44 + r11, 0, r12, r13,
                    -r13, r12, 0, r22 + r33, r34, -r24,
                    -r14, 0, r12, r34, r44 + r22, r23,
                    0, -r14, r13, -r24, r23, r33 + r44
                ).ts();
                inertiaMat.adds(tempMat);
            }
            return inertiaMat.mulfs(mass / points.length);
        }
        initializeMassInertia(rigid: Rigid) {
            // todo inertia calc
            const tempMat = new Matrix(6);
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
            function toBivecClinicMatrix(Rt: Rotor) {
                const RtMat = new Matrix(6);
                const bxy = Bivec.xy.rotate(Rt);
                const bxz = Bivec.xz.rotate(Rt);
                const bxw = Bivec.xw.rotate(Rt);
                const byz = Bivec.yz.rotate(Rt);
                const byw = Bivec.yw.rotate(Rt);
                const bzw = Bivec.zw.rotate(Rt);
                RtMat.setElements(
                    bxy.xy, bxy.xz, bxy.xw, bxy.yz, bxy.yw, bxy.zw,
                    bxz.xy, bxz.xz, bxz.xw, bxz.yz, bxz.yw, bxz.zw,
                    bxw.xy, bxw.xz, bxw.xw, bxw.yz, bxw.yw, bxw.zw,
                    byz.xy, byz.xz, byz.xw, byz.yz, byz.yw, byz.zw,
                    byw.xy, byw.xz, byw.xw, byw.yz, byw.yw, byw.zw,
                    bzw.xy, bzw.xz, bzw.xw, bzw.yz, bzw.yw, bzw.zw,
                )
                return clinicMat.mul(RtMat).mul(clinicMats);
            }

            // calculate inertia matrix before rotation
            // const inertiaMat0 = this.getPointsInertia((rigid.geometry as Convex).points, rigid.mass);
            // (rigid.geometry as Convex).points.forEach(v => v.rotates(Rt));
            // calculate inertia matrix after rotation
            const inertiaMat = this.getPointsInertia((rigid.geometry as Convex).points, rigid.mass);
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

            (rigid.geometry as Convex).points.forEach(v => v.rotatesconj(rotor));
            // calculate inertia matrix
            const inertiaMat2 = this.getPointsInertia((rigid.geometry as Convex).points, rigid.mass);
            // console.log(inertiaMat2);
            rigid.rotates(rotor);
            rigid.inertia.set(...inertiaMat2.diag()).mulfs(rigid.mass * 0.2); // factor for solid
        }
    }
    export class Tesseractoid extends Convex {
        size: Vec4;
        constructor(size: Vec4 | number) {
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
        initializeMassInertia(rigid: Rigid) {
            let mins = Math.min(this.size.x, this.size.y, this.size.z, this.size.w);
            let maxs = Math.max(this.size.x, this.size.y, this.size.z, this.size.w);
            let isoratio = mins / maxs;
            rigid.inertiaIsotroy = isoratio > 0.95;
            if (rigid.inertiaIsotroy) {
                rigid.inertia.xy = rigid.mass * (mins + maxs) * (mins + maxs) * 0.2;
            } else {
                let x = this.size.x * this.size.x;
                let y = this.size.y * this.size.y;
                let z = this.size.z * this.size.z;
                let w = this.size.w * this.size.w;
                rigid.inertia.set(x + y, x + z, x + w, y + z, y + w, z + w).mulfs(rigid.mass * 0.2);
            }
        }
    }
    export class Duocylinder extends Convex {
        radius1: number;
        radius2: number;
        segment1: number;
        segment2: number;
        constructor(radius1: number, radius2: number, segment1: number, segment2: number) {
            const ps: Vec4[] = [];
            const d1 = Math.PI * 2 / segment1;
            const d2 = Math.PI * 2 / segment2;
            for (let i = 0, ii = 0; i < segment1; i++, ii += d1) {
                for (let j = 0, jj = 0; j < segment2; j++, jj += d2) {
                    ps.push(new Vec4(Math.sin(ii) * radius1, Math.sin(jj) * radius2, Math.cos(jj) * radius2, Math.cos(ii) * radius1));
                }
            }
            super(ps);
            this.radius1 = radius1; this.radius2 = radius2;
            this.segment1 = segment1; this.segment2 = segment2;
        }
        initializeMassInertia(rigid: Rigid) {
            let isoratio = this.radius1 / this.radius2;
            rigid.inertiaIsotroy = isoratio > 0.95 && isoratio < 1.05;
            if (rigid.inertiaIsotroy) {
                rigid.inertia.xy = rigid.mass * (this.radius1 + this.radius2) * (this.radius1 + this.radius2) * 0.2;
            } else {
                let x = this.radius1 * this.radius1;
                let y = this.radius2 * this.radius2;
                let z = y;
                let w = x;
                rigid.inertia.set(x + y, x + z, x + w, y + z, y + w, z + w).mulfs(rigid.mass * 0.2);
            }
        }
    }
    /** equation: dot(normal,positon) == offset
     *  => when offset > 0, plane is shifted to normal direction
     *  from origin by distance = offset
     */
    export class Plane extends RigidGeometry {
        normal: Vec4;
        offset: number;
        constructor(normal?: Vec4, offset?: number) {
            super();
            this.normal = normal ?? Vec4.y.clone();
            this.offset = offset ?? 0;
        }
        initializeMassInertia(rigid: Rigid) {
            if (rigid.mass) console.warn("Infinitive Plane cannot have a finitive mass.");
            rigid.mass = undefined;
            rigid.invMass = 0;
            rigid.inertia = undefined;
            rigid.invInertia = undefined;
        }
    }
    export class GlomicCavity extends RigidGeometry {
        radius: number;
        constructor(radius: number) {
            super();
            this.radius = radius;
        }
        initializeMassInertia(rigid: Rigid) {
            if (rigid.mass) console.warn("GlomicCavity cannot have a finitive mass.");
            rigid.mass = undefined;
            rigid.invMass = 0;
            rigid.inertia = undefined;
            rigid.invInertia = undefined;
        }
    }
    /** default orientation: XW */
    export class Spheritorus extends RigidGeometry {
        majorRadius: number;
        minorRadius: number;
        /** majorRadius: cirle's radius, minorRadius: sphere's radius */
        constructor(majorRadius: number, minorRadius: number) {
            super();
            this.majorRadius = majorRadius;
            this.minorRadius = minorRadius;
            this.obb = new AABB(
                new Vec4(
                    -majorRadius - minorRadius, -minorRadius, -minorRadius, -majorRadius - minorRadius
                ),
                new Vec4(
                    majorRadius + minorRadius, minorRadius, minorRadius, majorRadius + minorRadius
                ),
            );
            this.boundingGlome = majorRadius + minorRadius;
        }
        initializeMassInertia(rigid: Rigid) {
            rigid.inertiaIsotroy = false;
            let maj = this.majorRadius * this.majorRadius;
            let min = this.minorRadius * this.minorRadius;
            let half = maj + 5 * min;
            let parallel = 2 * maj + 6 * min;
            let perp = 4 * min;
            rigid.inertia.set(half, half, parallel, perp, half, half).mulfs(rigid.mass! * 0.1);
        }
    }
    /** default orientation: XZW */
    export class Torisphere extends RigidGeometry {
        majorRadius: number;
        minorRadius: number;
        /** majorRadius: sphere's radius, minorRadius: cirle's radius */
        constructor(majorRadius: number, minorRadius: number) {
            super();
            this.majorRadius = majorRadius;
            this.minorRadius = minorRadius;
            this.obb = new AABB(
                new Vec4(
                    -majorRadius - minorRadius, -minorRadius, -majorRadius - minorRadius, -majorRadius - minorRadius
                ),
                new Vec4(
                    majorRadius + minorRadius, minorRadius, majorRadius + minorRadius, majorRadius + minorRadius
                ),
            );
            this.boundingGlome = majorRadius + minorRadius;
        }
        initializeMassInertia(rigid: Rigid) {
            rigid.inertiaIsotroy = false;
            let maj = this.majorRadius * this.majorRadius;
            let min = this.minorRadius * this.minorRadius;
            let half = 2 * maj + 5 * min;
            let parallel = 3 * maj + 6 * min;
            rigid.inertia.set(half, parallel, parallel, half, half, parallel).mulfs(rigid.mass! * 0.1);
        }
    }
    /** default orientation: 1:XY, 2:ZW */
    export class Tiger extends RigidGeometry {
        majorRadius1: number;
        majorRadius2: number;
        minorRadius: number;
        /** majorRadius: sphere's radius, minorRadius: cirle's radius */
        constructor(majorRadius1: number, majorRadius2: number, minorRadius: number) {
            super();
            this.majorRadius1 = majorRadius1;
            this.majorRadius2 = majorRadius2;
            this.minorRadius = minorRadius;
            this.obb = new AABB(
                new Vec4(-majorRadius1 - minorRadius, -majorRadius1 - minorRadius, -majorRadius2 - minorRadius, -majorRadius2 - minorRadius),
                new Vec4(majorRadius1 + minorRadius, majorRadius1 + minorRadius, majorRadius2 + minorRadius, majorRadius2 + minorRadius),
            );

            this.boundingGlome = Math.max(majorRadius1, majorRadius2) + minorRadius;
        }
        initializeMassInertia(rigid: Rigid) {
            rigid.inertiaIsotroy = false;
            let maj1 = this.majorRadius1 * this.majorRadius1;
            let maj2 = this.majorRadius2 * this.majorRadius2;
            let min = this.minorRadius * this.minorRadius;
            let half = maj1 + maj2 + min * 6;
            rigid.inertia.set(2 * maj1 + min * 5, half, half, half, half, 2 * maj2 + min * 5).mulfs(rigid.mass! * 0.5);
        }
    }
    /** default orientation: (xy-z)-w */
    export class Ditorus extends RigidGeometry {
        majorRadius: number;
        middleRadius: number;
        minorRadius: number;
        /** majorRadius, minorRadius: torus's radius, minorRadius: cirle's radius */
        constructor(majorRadius: number, middleRadius: number, minorRadius: number) {
            super();
            this.majorRadius = majorRadius;
            this.minorRadius = minorRadius;
            this.middleRadius = middleRadius;
            let minorRadius12 = minorRadius + middleRadius;
            this.obb = new AABB(
                new Vec4(-majorRadius - minorRadius12, -majorRadius - minorRadius12, -minorRadius12, -minorRadius),
                new Vec4(majorRadius + minorRadius12, majorRadius + minorRadius12, minorRadius12, minorRadius)
            );

            this.boundingGlome = majorRadius + minorRadius12;
        }
        initializeMassInertia(rigid: Rigid) {
            rigid.inertiaIsotroy = false;
            let maj1 = this.majorRadius * this.majorRadius;
            let maj2 = this.majorRadius * this.middleRadius;
            let min = this.middleRadius * this.middleRadius;
            let min2 = this.minorRadius * this.middleRadius;
            let half = maj1 + maj2 + min * 6;
            rigid.inertia.set(2 * maj1 + min * 5, maj1 + min * 6 + min2, maj1 + min2, maj1 + min * 6 + min2, maj1 + min2, 2 * min + min2).mulfs(rigid.mass * 0.2);
        }
    }
    // todo
    export class ThickHexahedronGrid extends RigidGeometry {
        grid1: Vec4[][][];
        grid2: Vec4[][][];
        convex: Convex[];
        constructor(
            grid1: Vec4[][][], grid2: Vec4[][][],
        ) {
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
                        c.reduceRight((a, b) => { return sum.addset(a, b) }).divfs(16);
                        this.convex.push(new Convex(c.map(c => c.sub(sum))));
                    }
                }
            }
        }
        initializeMassInertia(rigid: Rigid) {
            if (rigid.mass) console.warn("HeightField doesnt support a finitive mass.");
            rigid.mass = undefined;
            rigid.invMass = 0;
            rigid.inertia = undefined;
            rigid.invInertia = undefined;
        }
    }
    /** todo */
    export class LoftedConvex extends Union {
        constructor(
            sp: Spline, section: Vec4[], step: number
        ) {
            const { points, rotors } = sp.generate(step);
            const components: Rigid[] = [];
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
        initializeMassInertia(rigid: Rigid) {
            if (rigid.mass) console.warn("LoftedConvex doesnt support a finitive mass.");
            rigid.mass = undefined;
            rigid.invMass = 0;
            rigid.inertia = undefined;
            rigid.invInertia = undefined;
        }
    }
}