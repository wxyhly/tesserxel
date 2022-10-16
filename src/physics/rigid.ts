namespace tesserxel {
    export namespace physics {
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
        export class Rigid extends math.Obj4 {
            // Rigid extends math.Obj4, it has position and rotation, but no scale
            declare scale: null;
            material: Material;
            // Caution: Two Rigids cannot share the same RigidGeometry instance
            geometry: RigidGeometry;
            type: RigidType;
            mass: number;
            invMass: number;
            // inertia is a 6x6 Matrix for angularVelocity -> angularMomentum
            // this is diagonalbMatrix under principal axes coordinates
            inertia = new math.Bivec();
            invInertia = new math.Bivec();
            inertiaIsotroy: boolean; // whether using scalar inertia
            // only apply to active type object
            sleep: boolean = false;
            // for tracing debug
            label?: string;

            velocity: math.Vec4 = new math.Vec4();
            angularVelocity: math.Bivec = new math.Bivec();
            force: math.Vec4 = new math.Vec4();
            torque: math.Bivec = new math.Bivec();
            acceleration: math.Vec4 = new math.Vec4();
            angularAcceleration: math.Bivec = new math.Bivec();
            constructor(param: SimpleRigidDescriptor | UnionRigidDescriptor) {
                super();
                if ((param as UnionRigidDescriptor).length) {
                    this.geometry = new rigid.Union(param as UnionRigidDescriptor);
                } else {
                    let option = param as SimpleRigidDescriptor;
                    this.geometry = option.geometry;
                    this.mass = isFinite(option.mass) ? option.mass : 0;
                    this.type = option.type ?? "active";
                    this.invMass = this.mass > 0 && (this.type === "active") ? 1 / this.mass : 0;
                    this.material = option.material;
                    this.label = option.label;
                }
                this.geometry.initialize(this);
            }

            getlinearVelocity(out: math.Vec4, point: math.Vec4) {
                if (this.type === "still") return out.set();
                let relPosition = out.subset(point, this.position);
                return out.dotbset(relPosition, this.angularVelocity).adds(this.velocity);
            }
        }
        /** internal type for union rigid geometry */
        export interface SubRigid extends Rigid {
            localCoord?: math.Obj4;
            parent?: Rigid;
        }
        export abstract class RigidGeometry {
            rigid: Rigid;
            obb: math.AABB;
            aabb: math.AABB;
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
                        if (r.mass === null) console.error("Union Rigid Geometry cannot contain a still rigid.");
                        rigid.position.addmulfs(r.position, r.mass);
                        rigid.mass += r.mass;
                    }
                    rigid.invMass = 1 / rigid.mass;
                    rigid.position.mulfs(rigid.invMass);
                    // update rigids position to relative frame
                    for (let r of this.components) {
                        r.localCoord = new math.Obj4().copyObj4(r);
                        r.localCoord.position.subs(rigid.position);
                        r.parent = rigid;
                    }
                    // todo
                    // let inertia = new math.Matrix(6,6);
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
                constructor(radius: number) {
                    super();
                    this.radius = radius;
                    this.boundingGlome = radius;
                    this.radiusSqr = radius * radius;
                }
                initializeMassInertia(rigid: Rigid) {
                    rigid.inertiaIsotroy = true;
                    rigid.inertia.xy = rigid.mass * this.radiusSqr * 0.25;
                }
            }
            export class Convex extends RigidGeometry {
                points: math.Vec4[];
                _cachePoints: math.Vec4[];
                constructor(points: math.Vec4[]) {
                    super();
                    this.points = points;
                    this.obb = math.AABB.fromPoints(points);
                    this.boundingGlome = 0;
                    for (let i of points) {
                        this.boundingGlome = Math.max(this.boundingGlome, i.normsqr());
                    }
                    this.boundingGlome = Math.sqrt(this.boundingGlome);
                }
                initializeMassInertia(rigid: Rigid) {
                    // todo inertia calc
                }
            }
            export class Tesseractoid extends Convex {
                size: math.Vec4;
                constructor(size: math.Vec4 | number) {
                    let s = typeof size === "number" ? new math.Vec4(size, size, size, size) : size;
                    super([
                        new math.Vec4(s.x, s.y, s.z, s.w),
                        new math.Vec4(-s.x, s.y, s.z, s.w),
                        new math.Vec4(s.x, -s.y, s.z, s.w),
                        new math.Vec4(-s.x, -s.y, s.z, s.w),
                        new math.Vec4(s.x, s.y, -s.z, s.w),
                        new math.Vec4(-s.x, s.y, -s.z, s.w),
                        new math.Vec4(s.x, -s.y, -s.z, s.w),
                        new math.Vec4(-s.x, -s.y, -s.z, s.w),
                        new math.Vec4(s.x, s.y, s.z, -s.w),
                        new math.Vec4(-s.x, s.y, s.z, -s.w),
                        new math.Vec4(s.x, -s.y, s.z, -s.w),
                        new math.Vec4(-s.x, -s.y, s.z, -s.w),
                        new math.Vec4(s.x, s.y, -s.z, -s.w),
                        new math.Vec4(-s.x, s.y, -s.z, -s.w),
                        new math.Vec4(s.x, -s.y, -s.z, -s.w),
                        new math.Vec4(-s.x, -s.y, -s.z, -s.w),
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
            /** equation: dot(normal,positon) == offset
             *  => when offset > 0, plane is shifted to normal direction
             *  from origin by distance = offset
             */
            export class Plane extends RigidGeometry {
                normal: math.Vec4;
                offset: number;
                constructor(normal?: math.Vec4, offset?: number) {
                    super();
                    this.normal = normal ?? math.Vec4.y.clone();
                    this.offset = offset ?? 0;
                }
                initializeMassInertia(rigid: Rigid) {
                    if (rigid.mass) console.warn("Infinitive Plane cannot have a finitive mass.");
                    rigid.mass = null;
                    rigid.invMass = 0;
                    rigid.inertia = null;
                    rigid.invInertia = null;
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
                    this.obb = new math.AABB(
                        new math.Vec4(
                            -majorRadius - minorRadius, -minorRadius, -minorRadius, -majorRadius - minorRadius
                        ),
                        new math.Vec4(
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
                    rigid.inertia.set(half, half, parallel, perp, half, half).mulfs(rigid.mass * 0.1);
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
                    this.obb = new math.AABB(
                        new math.Vec4(
                            -majorRadius - minorRadius, -minorRadius, -majorRadius - minorRadius, -majorRadius - minorRadius
                        ),
                        new math.Vec4(
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
                    rigid.inertia.set(half, parallel, parallel, half, half, parallel).mulfs(rigid.mass * 0.1);
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
                    this.obb = new math.AABB(
                        new math.Vec4(-majorRadius1 - minorRadius, -majorRadius1 - minorRadius, -majorRadius2 - minorRadius, -majorRadius2 - minorRadius),
                        new math.Vec4(majorRadius1 + minorRadius, majorRadius1 + minorRadius, majorRadius2 + minorRadius, majorRadius2 + minorRadius),
                    );

                    this.boundingGlome = Math.max(majorRadius1, majorRadius2) + minorRadius;
                }
                initializeMassInertia(rigid: Rigid) {
                    rigid.inertiaIsotroy = false;
                    let maj1 = this.majorRadius1 * this.majorRadius1;
                    let maj2 = this.majorRadius2 * this.majorRadius2;
                    let min = this.minorRadius * this.minorRadius;
                    let half = maj1 + maj2 + min * 6;
                    rigid.inertia.set(2 * maj1 + min * 5, half, half, half, half, 2 * maj2 + min * 5).mulfs(rigid.mass * 0.5);
                }
            }
            // todo
            export class ThickHexahedronGrid extends RigidGeometry {
                grid1: math.Vec4[][][];
                grid2: math.Vec4[][][];
                convex: Convex[];
                constructor(
                    grid1: math.Vec4[][][], grid2: math.Vec4[][][],
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
                                let sum = new math.Vec4();
                                c.reduceRight((a,b)=>{return sum.addset(a, b)}).divfs(16);
                                this.convex.push(new Convex(c.map(c=>c.sub(sum))));
                            }
                        }
                    }
                }
                initializeMassInertia(rigid: Rigid) {
                    if (rigid.mass) console.warn("HeightField doesnt support a finitive mass.");
                    rigid.mass = null;
                    rigid.invMass = 0;
                    rigid.inertia = null;
                    rigid.invInertia = null;
                }
            }
        }
    }
}