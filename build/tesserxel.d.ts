/// <reference types="@webgpu/types" />
declare const _180: number;
declare const _30: number;
declare const _60: number;
declare const _45: number;
declare const _90: number;
declare const _120: number;
declare const _360: number;
declare const _DEG2RAD: number;
declare const _RAD2DEG: number;
declare const _COS30: number;
declare const _TAN30: number;
declare const _GOLDRATIO: number;

declare class Complex {
    re: number;
    im: number;
    static i: Complex;
    constructor(re?: number, im?: number);
    flat(): number[];
    set(v: Complex): Complex;
    setv(v: Vec2): Complex;
    clone(): Complex;
    add(v2: Complex): Complex;
    addf(v2: number): Complex;
    adds(v2: Complex): Complex;
    addfs(v2: number): Complex;
    neg(): Complex;
    negs(): Complex;
    sub(v2: Complex): Complex;
    subf(v2: number): Complex;
    subs(v2: Complex): Complex;
    subfs(v2: number): Complex;
    mulf(v2: number): Complex;
    mulfs(v2: number): Complex;
    mul(k: Complex): Complex;
    muls(k: Complex): Complex;
    divf(v2: number): Complex;
    divfs(v2: number): Complex;
    div(k: Complex): Complex;
    divs(k: Complex): Complex;
    dot(v2: Complex): number;
    norm(): number;
    norms(): Complex;
    normsqr(): number;
    conj(): Complex;
    conjs(): Complex;
    exp(): Complex;
    exps(): Complex;
    arg(): number;
    log(): Complex;
    logs(): Complex;
    pow(p: Complex): Complex;
    powf(n: number): Complex;
    pows(p: Complex): Complex;
    powfs(n: number): Complex;
}

declare class Srand {
    _seed: number;
    constructor(seed: number);
    set(seed: number): void;
    /** return a random float in [0,1] */
    nextf(): number;
    /** return a random int of [0,n-1] if n is given, else range is same as int */
    nexti(n?: number): number;
}
declare function generateUUID(): string;

declare abstract class Pool<T> {
    objects: T[];
    abstract constructObject(): T;
    pop(): T;
    push(...args: T[]): void;
    resize(size: number): this;
}

declare class Vec2Pool extends Pool<Vec2> {
    constructObject(): Vec2;
}
declare const vec2Pool: Vec2Pool;
declare class Vec2 {
    x: number;
    y: number;
    static readonly x: Vec2;
    static readonly y: Vec2;
    constructor(x?: number, y?: number);
    flat(): number[];
    writeBuffer(b: Float32Array, offset?: number): void;
    set(x?: number, y?: number): Vec2;
    copy(v: Vec2): Vec2;
    copyc(v: Complex): Vec2;
    clone(): Vec2;
    add(v2: Vec2): Vec2;
    addset(v1: Vec2, v2: Vec2): Vec2;
    addf(v2: number): Vec2;
    adds(v2: Vec2): Vec2;
    addfs(v2: number): Vec2;
    /** this += v * k */
    addmulfs(v: Vec2, k: number): this;
    neg(): Vec2;
    negs(): Vec2;
    sub(v2: Vec2): Vec2;
    subset(v1: Vec2, v2: Vec2): Vec2;
    subf(v2: number): Vec2;
    subs(v2: Vec2): Vec2;
    subfs(v2: number): Vec2;
    mulf(v2: number): Vec2;
    mulfs(v2: number): Vec2;
    mul(v2: Vec2): Vec2;
    muls(v2: Vec2): Vec2;
    divf(v2: number): Vec2;
    divfs(v2: number): Vec2;
    div(v2: Vec2): Vec2;
    divs(v2: Vec2): Vec2;
    dot(v2: Vec2): number;
    norm(): number;
    norms(): Vec2;
    normsqr(): number;
    norm1(): number;
    norminf(): number;
    normi(i: number): number;
    wedge(v2: Vec2): number;
    rotate(angle: number): Vec2;
    rotates(angle: number): Vec2;
    static rand(): Vec2;
    static srand(seed: Srand): Vec2;
    distanceTo(p: Vec2): number;
    distanceSqrTo(p: Vec2): number;
    equal(v: Vec2): boolean;
    pushPool(pool?: Vec2Pool): void;
}

declare class Mat3Pool extends Pool<Mat3> {
    constructObject(): Mat3;
}
declare const mat3Pool: Mat3Pool;
declare class Mat3 {
    elem: number[];
    static id: Mat3;
    static zero: Mat3;
    static diag(a: number, b: number, c: number): Mat3;
    constructor(a?: number, b?: number, c?: number, d?: number, e?: number, f?: number, g?: number, h?: number, i?: number);
    set(a?: number, b?: number, c?: number, d?: number, e?: number, f?: number, g?: number, h?: number, i?: number): Mat3;
    setid(): Mat3;
    ts(): Mat3;
    t(): Mat3;
    copy(m2: Mat3): Mat3;
    add(m2: Mat3): Mat3;
    adds(m2: Mat3): Mat3;
    neg(): Mat3;
    negs(): Mat3;
    sub(m2: Mat3): Mat3;
    subs(m2: Mat3): Mat3;
    mulf(k: number): Mat3;
    mulfs(k: number): Mat3;
    mulv(v: Vec3): Vec3;
    mul(m: Mat3): Mat3;
    muls(m: Mat3): Mat3;
    inv(): Mat3;
    invs(): Mat3;
    setFromRotaion(q: Quaternion): Mat3;
    pushPool(pool?: Mat3Pool): void;
}

declare class BivecPool extends Pool<Bivec> {
    constructObject(): Bivec;
}
declare const bivecPool: BivecPool;
declare class Bivec {
    xy: number;
    xz: number;
    xw: number;
    yz: number;
    yw: number;
    zw: number;
    static readonly xy: Bivec;
    static readonly xz: Bivec;
    static readonly xw: Bivec;
    static readonly yz: Bivec;
    static readonly yw: Bivec;
    static readonly zw: Bivec;
    static readonly yx: Bivec;
    static readonly zx: Bivec;
    static readonly wx: Bivec;
    static readonly zy: Bivec;
    static readonly wy: Bivec;
    static readonly wz: Bivec;
    constructor(xy?: number, xz?: number, xw?: number, yz?: number, yw?: number, zw?: number);
    copy(v: Bivec): Bivec;
    set(xy?: number, xz?: number, xw?: number, yz?: number, yw?: number, zw?: number): Bivec;
    clone(): Bivec;
    flat(): number[];
    add(bv: Bivec): Bivec;
    adds(bv: Bivec): Bivec;
    addset(bv1: Bivec, bv2: Bivec): Bivec;
    addmulfs(bv: Bivec, k: number): Bivec;
    neg(): Bivec;
    negs(): Bivec;
    sub(bv: Bivec): Bivec;
    subs(bv: Bivec): Bivec;
    subset(bv1: Bivec, bv2: Bivec): Bivec;
    mulf(k: number): Bivec;
    mulfs(k: number): Bivec;
    divf(k: number): Bivec;
    divfs(k: number): Bivec;
    dot(biv: Bivec): number;
    norm(): number;
    norms(): Bivec;
    normsqr(): number;
    norm1(): number;
    wedge(biv: Bivec): number;
    dual(): Bivec;
    duals(): Bivec;
    wedgev(V: Vec4): Vec4;
    wedgevvset(v1: Vec4, v2: Vec4): Bivec;
    /** Vector part of Geometry Product
     * exy * ey = ex, exy * ex = -ey, exy * ez = 0
     *  */
    dotv(V: Vec4): Vec4;
    cross(V: Bivec): Bivec;
    crossset(b1: Bivec, b2: Bivec): Bivec;
    crossrs(V: Bivec): Bivec;
    exp(): Rotor;
    /** return two angles [max, min] between a and b
     * "a" and "b" must be normalized simple bivectors*/
    static angle(a: Bivec, b: Bivec): number[];
    rotate(r: Rotor): Bivec;
    rotates(r: Rotor): Bivec;
    rotatesconj(r: Rotor): Bivec;
    rotateset(bivec: Bivec, r: Rotor): Bivec;
    /** return a random oriented simple normalized bivector */
    static rand(): Bivec;
    randset(): Bivec;
    /** return a random oriented simple normalized bivector by seed */
    static srand(seed: Srand): Bivec;
    srandset(seed: Srand): Bivec;
    pushPool(pool?: BivecPool): void;
}

declare class RotorPool extends Pool<Rotor> {
    constructObject(): Rotor;
}
declare class Rotor {
    l: Quaternion;
    r: Quaternion;
    constructor(l?: Quaternion, r?: Quaternion);
    clone(): Rotor;
    copy(r: Rotor): Rotor;
    conj(): Rotor;
    conjs(): Rotor;
    norms(): Rotor;
    /** Apply this to R: this * R;
     *
     * [this.l * R.l, R.r * this.r]; */
    mul(R: Rotor): Rotor;
    /** Apply this to R: this = this * R;
     *
     * [this.l, this.r] = [this.l * R.l, R.r * this.r]; */
    mulsr(R: Rotor): Rotor;
    /** Apply R to this: this = R * this;
     *
     * [this.l, this.r] = [R.l * this.l, this.r * R.r]; */
    mulsl(R: Rotor): Rotor;
    /** Apply this to R: this = this * conj(R);
     *
     * [this.l, this.r] = [this.l * conj(R.l), conj(R.r) * this.r]; */
    mulsrconj(R: Rotor): Rotor;
    /** Apply R to this: this = conj(R) * this;
     *
     * [this.l, this.r] = [conj(R.l) * this.l, this.r * conj(R.r)]; */
    mulslconj(R: Rotor): Rotor;
    sqrt(): Rotor;
    isFinite(): boolean;
    expset(bivec: Bivec): Rotor;
    log(): Bivec;
    static slerp(a: Rotor, b: Rotor, t: number): Rotor;
    toMat4(): Mat4;
    /** set rotor from a rotation matrix,
     * i.e. m must be orthogonal with determinant 1.
     * algorithm: iteratively aligne each axis. */
    setFromMat4(m: Mat4): Rotor;
    /** Rotor: rotate from plane1 to plane2
     *  Bivectors must be simple and normalised */
    static lookAtbb(from: Bivec, to: Bivec): Rotor;
    /** plane must be a unit simple vector, if not, use Bivec.exp() instead
     * angle1 is rotation angle on the plane
     * angle2 is rotatoin angle on the perpendicular plane (right handed, eg: exy + ezw)
    */
    static fromPlane(plane: Bivec, angle1: number, angle2?: number): Rotor;
    /** "from" and "to" must be normalized vectors*/
    static lookAt(from: Vec4, to: Vec4): Rotor;
    static lookAtvb(from: Vec4, to: Bivec): Rotor;
    /** "from" and "to" must be normalized vectors */
    setFromLookAt(from: Vec4, to: Vec4): Rotor;
    static rand(): Rotor;
    static srand(seed: Srand): Rotor;
    randset(): Rotor;
    srandset(seed: Srand): Rotor;
    pushPool(pool?: RotorPool): void;
    fromMat4(m: Mat4): Rotor;
}

declare class Mat4Pool extends Pool<Mat4> {
    constructObject(): Mat4;
}
declare const mat4Pool: Mat4Pool;
declare class Mat4 {
    elem: number[];
    static readonly id: Mat4;
    static readonly zero: Mat4;
    static diag(a: number, b: number, c: number, d: number): Mat4;
    static augVec4(a: Vec4, b: Vec4, c: Vec4, d: Vec4): Mat4;
    static augMat3(a: Mat3, b: Vec3, c: Vec3, d: number): Mat4;
    augVec4set(a: Vec4, b: Vec4, c: Vec4, d: Vec4): Mat4;
    augMat3set(a: Mat3, b: Vec3, c: Vec3, d: number): Mat4;
    constructor(a?: number, b?: number, c?: number, d?: number, e?: number, f?: number, g?: number, h?: number, i?: number, j?: number, k?: number, l?: number, m?: number, n?: number, o?: number, p?: number);
    clone(): Mat4;
    writeBuffer(b: Float32Array, offset?: number): void;
    setid(): this;
    set(a?: number, b?: number, c?: number, d?: number, e?: number, f?: number, g?: number, h?: number, i?: number, j?: number, k?: number, l?: number, m?: number, n?: number, o?: number, p?: number): this;
    ts(): Mat4;
    t(): Mat4;
    /** col vector */ x_(): Vec4;
    /** col vector */ y_(): Vec4;
    /** col vector */ z_(): Vec4;
    /** col vector */ w_(): Vec4;
    /** row vector */ _x(): Vec4;
    /** row vector */ _y(): Vec4;
    /** row vector */ _z(): Vec4;
    /** row vector */ _w(): Vec4;
    copy(m2: Mat4): Mat4;
    add(m2: Mat4): Mat4;
    adds(m2: Mat4): Mat4;
    neg(): Mat4;
    negs(): Mat4;
    sub(m2: Mat4): Mat4;
    subs(m2: Mat4): Mat4;
    mulf(k: number): Mat4;
    mulfs(k: number): Mat4;
    mulv(v: Vec4): Vec4;
    mul(m: Mat4): Mat4;
    /** this = this * m; */
    mulsr(m: Mat4): Mat4;
    /** this = m * this; */
    mulsl(m: Mat4): Mat4;
    /** this = m1 * m2; */
    mulset(m1: Mat4, m2: Mat4): Mat4;
    setFrom3DRotation(q: Quaternion): Mat4;
    setFromQuaternionL(q: Quaternion): Mat4;
    setFromQuaternionR(q: Quaternion): Mat4;
    setFromRotor(r: Rotor): Mat4;
    setFromRotorconj(r: Rotor): Mat4;
    det(): number;
    inv(): Mat4;
    invs(): Mat4;
    pushPool(pool?: Mat4Pool): void;
}

declare class QuaternionPool extends Pool<Quaternion> {
    constructObject(): Quaternion;
}
declare class Quaternion {
    x: number;
    y: number;
    z: number;
    w: number;
    constructor(x?: number, y?: number, z?: number, w?: number);
    set(x?: number, y?: number, z?: number, w?: number): Quaternion;
    flat(): number[];
    copy(v: Vec4 | Quaternion): Quaternion;
    yzw(): Vec3;
    ywz(): Vec3;
    zyw(): Vec3;
    zwy(): Vec3;
    wzy(): Vec3;
    wyz(): Vec3;
    wxyz(): Vec4;
    wxzy(): Vec4;
    wyxz(): Vec4;
    wzxy(): Vec4;
    yxzw(): Vec4;
    xzwy(): Vec4;
    xyzw(): Vec4;
    clone(): Quaternion;
    neg(): Quaternion;
    negs(): Quaternion;
    mul(q: Quaternion | Vec4): Quaternion;
    /** this = this * q; */
    mulsr(q: Quaternion | Vec4): Quaternion;
    /** this = q * this; */
    mulsl(q: Quaternion | Vec4): Quaternion;
    /** this = this * conj(q); */
    mulsrconj(q: Quaternion | Vec4): Quaternion;
    /** this = conj(q) * this; */
    mulslconj(q: Quaternion | Vec4): Quaternion;
    conj(): Quaternion;
    conjs(): Quaternion;
    norm(): number;
    norms(): Quaternion;
    /** axis must be a unit vector, if not, use Vec3.exp() instead */
    static fromAxis(axis: Vec3, angle: number): Quaternion;
    sqrt(): Quaternion;
    sqrts(): Quaternion;
    /** get generator of this, Quaternion must be normalized */
    log(): Vec3;
    static slerp(a: Quaternion, b: Quaternion, t: number): Quaternion;
    toRotateMat(): Mat4;
    toMat3(): Mat3;
    toLMat4(): Mat4;
    toRMat4(): Mat4;
    expset(v: Vec3): Quaternion;
    static rand(): Quaternion;
    static srand(seed: Srand): Quaternion;
    randset(): Quaternion;
    srandset(seed: Srand): Quaternion;
    /** "from" and "to" must be normalized vectors*/
    static lookAt(from: Vec3, to: Vec3): Quaternion;
    pushPool(pool?: QuaternionPool): void;
}

declare class Vec4Pool extends Pool<Vec4> {
    constructObject(): Vec4;
}
declare const vec4Pool: Vec4Pool;
declare class Vec4 {
    x: number;
    y: number;
    z: number;
    w: number;
    static readonly x: Vec4;
    static readonly y: Vec4;
    static readonly z: Vec4;
    static readonly w: Vec4;
    static readonly origin: Vec4;
    static readonly xNeg: Vec4;
    static readonly yNeg: Vec4;
    static readonly zNeg: Vec4;
    static readonly wNeg: Vec4;
    constructor(x?: number, y?: number, z?: number, w?: number);
    flat(): number[];
    writeBuffer(b: Float32Array, offset?: number): void;
    copy(v: Vec4 | Quaternion): Vec4;
    set(x?: number, y?: number, z?: number, w?: number): Vec4;
    ywx(): Vec3;
    yxw(): Vec3;
    yzw(): Vec3;
    ywz(): Vec3;
    yzx(): Vec3;
    yxz(): Vec3;
    zwx(): Vec3;
    zxw(): Vec3;
    zyw(): Vec3;
    zwy(): Vec3;
    zyx(): Vec3;
    zxy(): Vec3;
    xzy(): Vec3;
    xyz(): Vec3;
    xwy(): Vec3;
    xyw(): Vec3;
    xzw(): Vec3;
    xwz(): Vec3;
    wxy(): Vec3;
    wyx(): Vec3;
    wzy(): Vec3;
    wyz(): Vec3;
    wxz(): Vec3;
    wzx(): Vec3;
    wxyz(): Vec4;
    wxzy(): Vec4;
    wyxz(): Vec4;
    wzxy(): Vec4;
    yxzw(): Vec4;
    xzwy(): Vec4;
    clone(): Vec4;
    add(v2: Vec4): Vec4;
    addset(v1: Vec4, v2: Vec4): Vec4;
    addf(v2: number): Vec4;
    adds(v2: Vec4): Vec4;
    addfs(v2: number): Vec4;
    neg(): Vec4;
    negs(): Vec4;
    sub(v2: Vec4): Vec4;
    subset(v1: Vec4, v2: Vec4): Vec4;
    subf(v2: number): Vec4;
    subs(v2: Vec4): Vec4;
    subfs(v2: number): Vec4;
    mulf(v2: number): Vec4;
    mulfs(v2: number): Vec4;
    mulmatvset(mat4: Mat4, v: Vec4): Vec4;
    /** this += v * k */
    addmulfs(v: Vec4, k: number): this;
    mul(v2: Vec4): Vec4;
    muls(v2: Vec4): Vec4;
    divf(v2: number): Vec4;
    divfs(v2: number): Vec4;
    div(v2: Vec4): Vec4;
    divs(v2: Vec4): Vec4;
    dot(v2: Vec4): number;
    norm(): number;
    norms(): Vec4;
    normsqr(): number;
    norm1(): number;
    norminf(): number;
    normi(i: number): number;
    wedge(V: Vec4): Bivec;
    wedgevbset(v: Vec4, bivec: Bivec): Vec4;
    wedgeb(bivec: Bivec): Vec4;
    /** Vector part of Geometry Product
     * ey * exy = -ex, ex * exy = ey, ex * eyz = 0
     *  */
    dotb(B: Bivec): Vec4;
    /** this = this * b;
     *  Vector part of Geometry Product
     *  ey * exy = -ex, ex * exy = ey, ex * eyz = 0
     *  */
    dotbsr(B: Bivec): Vec4;
    dotbset(v: Vec4, B: Bivec): Vec4;
    /** this = mat * this */
    mulmatls(mat4: Mat4): Vec4;
    rotate(r: Rotor): Vec4;
    rotates(r: Rotor): Vec4;
    rotateconj(r: Rotor): Vec4;
    rotatesconj(r: Rotor): Vec4;
    reflect(normal: Vec4): Vec4;
    reflects(normal: Vec4): Vec4;
    distanceTo(p: Vec4): number;
    distanceSqrTo(p: Vec4): number;
    randset(): Vec4;
    srandset(seed: Srand): Vec4;
    /** project vector on a plane determined by bivector.
     * bivector b must be normalized and simple
     */
    projb(b: Bivec): Vec4;
    projbs(b: Bivec): Vec4;
    static rand(): Vec4;
    static srand(seed: Srand): Vec4;
    equal(v: Vec4): boolean;
    pushPool(pool?: Vec4Pool): void;
}

declare class Vec3Pool extends Pool<Vec3> {
    constructObject(): Vec3;
}
declare const vec3Pool: Vec3Pool;
declare class Vec3 {
    x: number;
    y: number;
    z: number;
    static readonly x: Vec3;
    static readonly y: Vec3;
    static readonly z: Vec3;
    constructor(x?: number, y?: number, z?: number);
    flat(): number[];
    writeBuffer(b: Float32Array, offset?: number): void;
    copy(v: Vec3): Vec3;
    set(x?: number, y?: number, z?: number): Vec3;
    xy(): Vec2;
    yx(): Vec2;
    xz(): Vec2;
    yz(): Vec2;
    zy(): Vec2;
    yzx(): Vec3;
    yxz(): Vec3;
    zyx(): Vec3;
    zxy(): Vec3;
    xzy(): Vec3;
    xyz0(): Vec4;
    x0yz(): Vec4;
    clone(): Vec3;
    add(v2: Vec3): Vec3;
    addset(v1: Vec3, v2: Vec3): Vec3;
    addf(v2: number): Vec3;
    adds(v2: Vec3): Vec3;
    addfs(v2: number): Vec3;
    /** this += v * k */
    addmulfs(v: Vec3, k: number): this;
    neg(): Vec3;
    negs(): Vec3;
    sub(v2: Vec3): Vec3;
    subset(v1: Vec3, v2: Vec3): Vec3;
    subf(v2: number): Vec3;
    subs(v2: Vec3): Vec3;
    subfs(v2: number): Vec3;
    mulf(v2: number): Vec3;
    mulfs(v2: number): Vec3;
    mul(v2: Vec3): Vec3;
    muls(v2: Vec3): Vec3;
    divf(v2: number): Vec3;
    divfs(v2: number): Vec3;
    div(v2: Vec3): Vec3;
    divs(v2: Vec3): Vec3;
    dot(v2: Vec3): number;
    norm(): number;
    norms(): Vec3;
    normsqr(): number;
    norm1(): number;
    norminf(): number;
    normi(i: number): number;
    wedge(v3: Vec3): Vec3;
    /** this.set(v1 ^ v2) */
    wedgeset(v1: Vec3, v2: Vec3): Vec3;
    /** this = this ^ v */
    wedgesr(v: Vec3): Vec3;
    exp(): Quaternion;
    rotate(q: Quaternion): Vec3;
    rotates(q: Quaternion): Vec3;
    randset(): Vec3;
    srandset(seed: Srand): Vec3;
    static rand(): Vec3;
    static srand(seed: Srand): Vec3;
    distanceTo(p: Vec3): number;
    distanceSqrTo(p: Vec3): number;
    reflect(normal: Vec3): Vec3;
    reflects(normal: Vec3): Vec3;
    equal(v: Vec3): boolean;
    pushPool(pool?: Vec3Pool): void;
}

declare class Mat2Pool extends Pool<Mat2> {
    constructObject(): Mat2;
}
declare const mat2Pool: Mat2Pool;
declare class Mat2 {
    elem: number[];
    static id: Mat2;
    static zero: Mat2;
    static diag(a: number, b: number): Mat2;
    constructor(a?: number, b?: number, c?: number, d?: number);
    set(a?: number, b?: number, c?: number, d?: number): Mat2;
    setid(): this;
    ts(): Mat2;
    t(): Mat2;
    copy(m2: Mat2): Mat2;
    add(m2: Mat2): Mat2;
    adds(m2: Mat2): Mat2;
    neg(): Mat2;
    negs(): Mat2;
    sub(m2: Mat2): Mat2;
    subs(m2: Mat2): Mat2;
    mulf(k: number): Mat2;
    mulfs(k: number): Mat2;
    mulv(v: Vec2): Vec2;
    mul(m: Mat2): Mat2;
    muls(m: Mat2): Mat2;
    inv(): Mat2;
    invs(): Mat2;
    pushPool(pool?: Mat2Pool): void;
}

/** [A(4x4), b(1x4)]
 *
 *  [0(4x1), 1(1x1)]
 *
 *  a blocked 5x5 matrix for transform in 4d
 */
declare class AffineMat4 {
    mat: Mat4;
    vec: Vec4;
    constructor(mat?: Mat4, vec?: Vec4);
    writeBuffer(b: Float32Array, offset?: number): void;
    inv(): AffineMat4;
    invs(): AffineMat4;
    mul(m: AffineMat4): AffineMat4;
    /** this = this * m */
    mulsr(m: AffineMat4): AffineMat4;
    /** this = m * this */
    mulsl(m: AffineMat4): AffineMat4;
    setFromObj4(o: Obj4): this;
    setFromObj4inv(o: Obj4): this;
}
/** an coordinate transform of rotation translation and scale */
declare class Obj4 {
    position: Vec4;
    rotation: Rotor;
    scale: Vec4 | undefined;
    constructor(position?: Vec4, rotation?: Rotor, scale?: Vec4);
    copyObj4(o: Obj4): this;
    local2world(point: Vec4): Vec4;
    world2local(point: Vec4): Vec4;
    getMat4(): Mat4;
    getMat4inv(): Mat4;
    getAffineMat4(): AffineMat4;
    getAffineMat4inv(): AffineMat4;
    translates(v: Vec4): Obj4;
    rotates(r: Rotor): Obj4;
    rotatesconj(r: Rotor): Obj4;
    rotatesb(b: Bivec): Obj4;
    rotatesAt(r: Rotor, center?: Vec4): Obj4;
    lookAt(direction: Vec4, target: Vec4): this;
}

interface PerspectiveCamera {
    fov: number;
    near: number;
    far: number;
    /** aspect = width / height = depth / height */
    aspect?: number;
}
interface OrthographicCamera {
    /** size = height */
    size: number;
    near: number;
    far: number;
    /** aspect = width / height = depth / height */
    aspect?: number;
}
/** If fov == 0, then return Orthographic projection matrix
 *  Caution: This function calculates PerspectiveMatrix for 0-1 depth range */
declare function getPerspectiveProjectionMatrix(c: PerspectiveCamera): {
    /** used for 3d */
    mat4: Mat4;
    /** used for 4d because of lack of mat5x5 */
    vec4: Vec4;
};
declare function getOrthographicProjectionMatrix(c: OrthographicCamera): {
    /** used for 3d */
    mat4: Mat4;
    /** used for 4d because of lack of mat5x5
     */
    vec4: Vec4;
};

declare class Ray {
    origin: Vec4;
    direction: Vec4;
}
declare class Plane {
    /** normal need to be normalized */
    normal: Vec4;
    offset: number;
    constructor(normal: Vec4, offset: number);
    distanceToPoint(p: Vec4): void;
    /** regard r as an infinity line */
    distanceToLine(r: Ray): void;
}
declare class AABB {
    min: Vec4;
    max: Vec4;
    testAABB(aabb: AABB): boolean;
    /** when intersected return 0, when aabb is along the normal direction return 1, otherwise -1 */
    testPlane(plane: Plane): 0 | 1 | -1;
    getPoints(): Vec4[];
    constructor(min?: Vec4, max?: Vec4);
    static fromPoints(points: Vec4[]): AABB;
}

interface SplineData {
    points: Vec4[];
    rotors: Rotor[];
    curveLength: number[];
}
declare class Spline {
    points: Vec4[];
    derives: Vec4[];
    constructor(points: Vec4[], derives: Vec4[]);
    generate(seg: number): SplineData;
    getValue(t: number): Vec4;
    getPositionAtLength(s: number, data: SplineData): Vec4;
    getObj4AtLength(s: number, data: SplineData): Obj4;
}

declare class Perlin3 {
    private _p;
    constructor(srand: Srand);
    value(x: number, y: number, z: number): number;
}

type math_d_PerspectiveCamera = PerspectiveCamera;
type math_d_OrthographicCamera = OrthographicCamera;
type math_d_Vec2 = Vec2;
declare const math_d_Vec2: typeof Vec2;
declare const math_d_vec2Pool: typeof vec2Pool;
type math_d_Vec2Pool = Vec2Pool;
declare const math_d_Vec2Pool: typeof Vec2Pool;
type math_d_Vec3 = Vec3;
declare const math_d_Vec3: typeof Vec3;
declare const math_d_vec3Pool: typeof vec3Pool;
type math_d_Vec3Pool = Vec3Pool;
declare const math_d_Vec3Pool: typeof Vec3Pool;
type math_d_Vec4 = Vec4;
declare const math_d_Vec4: typeof Vec4;
declare const math_d_vec4Pool: typeof vec4Pool;
type math_d_Vec4Pool = Vec4Pool;
declare const math_d_Vec4Pool: typeof Vec4Pool;
type math_d_Srand = Srand;
declare const math_d_Srand: typeof Srand;
declare const math_d_generateUUID: typeof generateUUID;
type math_d_Quaternion = Quaternion;
declare const math_d_Quaternion: typeof Quaternion;
type math_d_Bivec = Bivec;
declare const math_d_Bivec: typeof Bivec;
declare const math_d_bivecPool: typeof bivecPool;
type math_d_BivecPool = BivecPool;
declare const math_d_BivecPool: typeof BivecPool;
type math_d_Mat2 = Mat2;
declare const math_d_Mat2: typeof Mat2;
declare const math_d_mat2Pool: typeof mat2Pool;
type math_d_Mat2Pool = Mat2Pool;
declare const math_d_Mat2Pool: typeof Mat2Pool;
type math_d_Mat3 = Mat3;
declare const math_d_Mat3: typeof Mat3;
declare const math_d_mat3Pool: typeof mat3Pool;
type math_d_Mat3Pool = Mat3Pool;
declare const math_d_Mat3Pool: typeof Mat3Pool;
type math_d_Mat4 = Mat4;
declare const math_d_Mat4: typeof Mat4;
declare const math_d_mat4Pool: typeof mat4Pool;
type math_d_Mat4Pool = Mat4Pool;
declare const math_d_Mat4Pool: typeof Mat4Pool;
type math_d_Rotor = Rotor;
declare const math_d_Rotor: typeof Rotor;
type math_d_Complex = Complex;
declare const math_d_Complex: typeof Complex;
type math_d_AffineMat4 = AffineMat4;
declare const math_d_AffineMat4: typeof AffineMat4;
type math_d_Obj4 = Obj4;
declare const math_d_Obj4: typeof Obj4;
declare const math_d_getPerspectiveProjectionMatrix: typeof getPerspectiveProjectionMatrix;
declare const math_d_getOrthographicProjectionMatrix: typeof getOrthographicProjectionMatrix;
type math_d_AABB = AABB;
declare const math_d_AABB: typeof AABB;
type math_d_Plane = Plane;
declare const math_d_Plane: typeof Plane;
type math_d_Ray = Ray;
declare const math_d_Ray: typeof Ray;
type math_d_Spline = Spline;
declare const math_d_Spline: typeof Spline;
type math_d_Perlin3 = Perlin3;
declare const math_d_Perlin3: typeof Perlin3;
declare const math_d__180: typeof _180;
declare const math_d__30: typeof _30;
declare const math_d__60: typeof _60;
declare const math_d__45: typeof _45;
declare const math_d__90: typeof _90;
declare const math_d__120: typeof _120;
declare const math_d__360: typeof _360;
declare const math_d__DEG2RAD: typeof _DEG2RAD;
declare const math_d__RAD2DEG: typeof _RAD2DEG;
declare const math_d__COS30: typeof _COS30;
declare const math_d__TAN30: typeof _TAN30;
declare const math_d__GOLDRATIO: typeof _GOLDRATIO;
declare namespace math_d {
  export {
    math_d_PerspectiveCamera as PerspectiveCamera,
    math_d_OrthographicCamera as OrthographicCamera,
    math_d_Vec2 as Vec2,
    math_d_vec2Pool as vec2Pool,
    math_d_Vec2Pool as Vec2Pool,
    math_d_Vec3 as Vec3,
    math_d_vec3Pool as vec3Pool,
    math_d_Vec3Pool as Vec3Pool,
    math_d_Vec4 as Vec4,
    math_d_vec4Pool as vec4Pool,
    math_d_Vec4Pool as Vec4Pool,
    math_d_Srand as Srand,
    math_d_generateUUID as generateUUID,
    math_d_Quaternion as Quaternion,
    math_d_Bivec as Bivec,
    math_d_bivecPool as bivecPool,
    math_d_BivecPool as BivecPool,
    math_d_Mat2 as Mat2,
    math_d_mat2Pool as mat2Pool,
    math_d_Mat2Pool as Mat2Pool,
    math_d_Mat3 as Mat3,
    math_d_mat3Pool as mat3Pool,
    math_d_Mat3Pool as Mat3Pool,
    math_d_Mat4 as Mat4,
    math_d_mat4Pool as mat4Pool,
    math_d_Mat4Pool as Mat4Pool,
    math_d_Rotor as Rotor,
    math_d_Complex as Complex,
    math_d_AffineMat4 as AffineMat4,
    math_d_Obj4 as Obj4,
    math_d_getPerspectiveProjectionMatrix as getPerspectiveProjectionMatrix,
    math_d_getOrthographicProjectionMatrix as getOrthographicProjectionMatrix,
    math_d_AABB as AABB,
    math_d_Plane as Plane,
    math_d_Ray as Ray,
    math_d_Spline as Spline,
    math_d_Perlin3 as Perlin3,
    math_d__180 as _180,
    math_d__30 as _30,
    math_d__60 as _60,
    math_d__45 as _45,
    math_d__90 as _90,
    math_d__120 as _120,
    math_d__360 as _360,
    math_d__DEG2RAD as _DEG2RAD,
    math_d__RAD2DEG as _RAD2DEG,
    math_d__COS30 as _COS30,
    math_d__TAN30 as _TAN30,
    math_d__GOLDRATIO as _GOLDRATIO,
  };
}

declare class GPU {
    adapter: GPUAdapter;
    device: GPUDevice;
    preferredFormat: GPUTextureFormat;
    init(): Promise<GPU | null>;
    createBuffer(usage: number, buffer_or_size: (ArrayLike<number> & ArrayBuffer) | number, label?: string): GPUBuffer;
    createBindGroup(pipeline: GPUPipelineBase, index: number, entries: Array<GPUBindingResource>, label?: string): GPUBindGroup;
    getContext(dom: HTMLCanvasElement, config?: GPUContextConfig): GPUCanvasContext;
}
interface GPUContextConfig {
    format?: GPUTextureFormat;
    alphaMode?: GPUCanvasAlphaMode;
    usage?: GPUTextureUsageFlags;
    viewFormats?: Iterable<GPUTextureFormat>;
    colorSpace?: PredefinedColorSpace;
}

interface SliceRendererOption {
    /** Caution: must be 2^n, this includes cross section thumbnails */
    maxSlicesNumber?: number;
    /** Caution: must be 2^n, large number can waste lots GPU memory;
     *  Used to preallocate gpumemory for intermediate data of cross section
     */
    maxCrossSectionBufferSize?: number;
    sliceGroupSize?: number;
    /** Caution: enable this may cause performance issue */
    enableFloat16Blend: boolean;
    /** whether initiate default confiuration like sliceconfigs and retina configs */
    defaultConfigs?: boolean;
}
declare enum SliceFacing {
    POSZ = 0,
    NEGZ = 1,
    POSY = 2,
    NEGY = 3,
    POSX = 4,
    NEGX = 5
}
declare enum EyeOffset {
    LeftEye = 0,
    None = 1,
    RightEye = 2
}
interface TetraSlicePipelineDescriptor {
    vertex: TetraVertexState;
    fragment: GeneralShaderState;
    cullMode?: GPUCullMode;
    layout?: SlicePipelineLayout;
}
interface RaytracingPipelineDescriptor {
    code: string;
    rayEntryPoint: string;
    fragmentEntryPoint: string;
}
interface GeneralShaderState {
    code: string;
    entryPoint: string;
}
interface TetraVertexState extends GeneralShaderState {
    workgroupSize?: number;
}
interface TetraSlicePipeline {
    computePipeline: GPUComputePipeline;
    computeBindGroup0: GPUBindGroup;
    renderPipeline: GPURenderPipeline;
    outputVaryBuffer: GPUBuffer[];
    vertexOutNum: number;
    descriptor: TetraSlicePipelineDescriptor;
}
interface RaytracingPipeline {
    pipeline: GPURenderPipeline;
    bindGroup0: GPUBindGroup;
}
interface SectionConfig {
    slicePos?: number;
    facing: SliceFacing;
    eyeOffset?: EyeOffset;
    viewport: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    resolution?: number;
}
interface SliceConfig {
    layers?: number;
    sections?: Array<SectionConfig>;
    retinaResolution?: number;
}
declare class SliceRenderer {
    getSafeTetraNumInOnePass(): number;
    private maxSlicesNumber;
    private maxCrossSectionBufferSize;
    /** On each computeshader slice calling numbers, should be 2^n */
    private sliceGroupSize;
    private sliceGroupSizeBit;
    private screenSize;
    private outputBufferStride;
    private viewportCompressShift;
    private blendFormat;
    private displayConfig;
    private sliceTextureSize;
    private gpu;
    private context;
    private crossRenderVertexShaderModule;
    private screenTexture;
    private screenView;
    private linearTextureSampler;
    private nearestTextureSampler;
    private crossRenderPassDescClear;
    private crossRenderPassDescLoad;
    private clearRenderPipeline;
    private retinaRenderPipeline;
    private screenRenderPipeline;
    private retinaBindGroup;
    private screenBindGroup;
    private sliceView;
    private depthView;
    private outputVaryBufferPool;
    private sliceOffsetBuffer;
    private emitIndexSliceBuffer;
    private refacingBuffer;
    private eyeCrossBuffer;
    private thumbnailViewportBuffer;
    private sliceGroupOffsetBuffer;
    private retinaMVBuffer;
    private retinaPBuffer;
    private screenAspectBuffer;
    private layerOpacityBuffer;
    private camProjBuffer;
    static readonly outputAttributeUsage: number;
    private slicesJsBuffer;
    private camProjJsBuffer;
    private retinaProjecJsBuffer;
    private retinaMVMatJsBuffer;
    private currentRetinaFacing;
    private retinaMatrixChanged;
    private retinaFacingChanged;
    private screenClearColor;
    private renderState;
    private enableEye3D;
    private refacingMatsCode;
    private crossHairSize;
    private totalGroupNum;
    private sliceGroupNum;
    init(gpu: GPU, context: GPUCanvasContext, options?: SliceRendererOption): Promise<this>;
    /** for TetraSlicePipeline, vertex shader is internally a compute shader, so it doesn't share bindgroups with fragment shader.
     *  for RaytracingPipeline, vertex shader and fragment shader are in one traditional render pipeline, they share bindgroups.
     */
    createVertexShaderBindGroup(pipeline: TetraSlicePipeline | RaytracingPipeline, index: number, buffers: GPUBuffer[], label?: string): GPUBindGroup;
    /** for TetraSlicePipeline, vertex shader is internally a compute shader, so it doesn't share bindgroups with fragment shader.
     *  for RaytracingPipeline, vertex shader and fragment shader are in one traditional render pipeline, they share bindgroups.
     */
    createFragmentShaderBindGroup(pipeline: TetraSlicePipeline | RaytracingPipeline, index: number, buffers: GPUBuffer[], label?: string): GPUBindGroup;
    createTetraSlicePipeline(desc: TetraSlicePipelineDescriptor): Promise<TetraSlicePipeline>;
    setSize(size: GPUExtent3DStrict): void;
    setCameraProjectMatrix(camera: PerspectiveCamera | OrthographicCamera): void;
    setRetinaProjectMatrix(camera: PerspectiveCamera | OrthographicCamera): void;
    setRetinaViewMatrix(m: Mat4): void;
    getOpacity(): number;
    getSectionEyeOffset(): number;
    getRetinaEyeOffset(): number;
    getLayers(): number;
    getRetinaResolution(): number;
    getMinResolutionMultiple(): number;
    getStereoMode(): boolean;
    getCamera(): PerspectiveCamera | OrthographicCamera;
    getRetinaCamera(): PerspectiveCamera | OrthographicCamera;
    getSize(): {
        width: number;
        height: number;
    };
    setOpacity(opacity: number): void;
    setEyeOffset(sectionEyeOffset?: number, retinaEyeOffset?: number): void;
    setCrosshair(size: number): void;
    getCrosshair(): number;
    setSliceConfig(sliceConfig: SliceConfig): void;
    render(drawCall: () => void): void;
    /** Set TetraSlicePipeline and prepare GPU resources.
     *  Next calls should be function sliceTetras or setBindGroup.
     */
    beginTetras(pipeline: TetraSlicePipeline): void;
    private _vec4;
    private _vec42;
    testWithFrustumData(obb: AABB, camMat: AffineMat4 | Obj4, modelMat?: AffineMat4 | Obj4): boolean;
    getFrustumRange(camMat: AffineMat4 | Obj4): Vec4[];
    setBindGroup(index: number, bindGroup: GPUBindGroup): void;
    /** Compute slice of given bindgroup attribute data.
     *  beginTetras should be called at first to specify a tetraSlicePipeline
     *  Next calls should be function sliceTetras, setBindGroup or drawTetras.
     */
    sliceTetras(vertexBindGroup: GPUBindGroup, tetraCount: number, instanceCount?: number): void;
    setWorldClearColor(color: GPUColor): void;
    setScreenClearColor(color: GPUColor): void;
    /** This function draw slices on a internal framebuffer
     *  Every beginTetras call should be end with drawTetras call
     */
    drawTetras(bindGroups?: {
        group: number;
        binding: GPUBindGroup;
    }[]): void;
    createRaytracingPipeline(desc: RaytracingPipelineDescriptor): Promise<{
        pipeline: GPURenderPipeline;
        bindGroup0: GPUBindGroup;
    }>;
    drawRaytracing(pipeline: RaytracingPipeline, bindGroups?: GPUBindGroup[]): void;
}
declare type SinglePipelineLayout = GPUPipelineLayout | GPUAutoLayoutMode | GPUBindGroupLayoutDescriptor[];
declare type SlicePipelineLayout = GPUAutoLayoutMode | {
    computeLayout: SinglePipelineLayout;
    renderLayout: SinglePipelineLayout;
};

/** Tetramesh store 4D mesh as tetrahedral list
 *  Each tetrahedral uses four vertices in the position list
 */
interface TetraMeshData {
    position: Float32Array;
    normal?: Float32Array;
    uvw?: Float32Array;
    count?: number;
}
/** TetraIndexMesh is not supported for tetraslice rendering
 *  It is only used in data storage and mesh construction
 */
interface TetraIndexMeshData {
    position: Float32Array;
    normal?: Float32Array;
    uvw?: Float32Array;
    positionIndex: Uint32Array;
    normalIndex?: Uint32Array;
    uvwIndex?: Uint32Array;
    count?: number;
}
declare class TetraMesh implements TetraMeshData {
    position: Float32Array;
    normal?: Float32Array;
    uvw?: Float32Array;
    count?: number;
    constructor(d: TetraMeshData);
    applyAffineMat4(am: AffineMat4): this;
    applyObj4(obj4: Obj4): this;
    clone(): TetraMesh;
    toIndexMesh(): TetraIndexMesh;
    concat(mesh2: TetraMesh): TetraMesh;
    deleteTetras(tetras: number[]): TetraMesh;
    inverseNormal(): TetraMesh;
    setUVWAsPosition(): this;
}
declare class TetraIndexMesh implements TetraIndexMeshData {
    position: Float32Array;
    normal?: Float32Array;
    uvw?: Float32Array;
    positionIndex: Uint32Array;
    normalIndex?: Uint32Array;
    uvwIndex?: Uint32Array;
    count?: number;
    constructor(d: TetraIndexMeshData);
    applyAffineMat4(am: AffineMat4): this;
    applyObj4(obj4: Obj4): this;
    toNonIndexMesh(): TetraMesh;
}
declare function concat(meshes: TetraMeshData[]): TetraMesh;

/** FaceMesh store traditional 2-face mesh as triangle or quad list
 *  This mesh is for constructing complex tetrameshes
 *  It is not aimed for rendering purpose
 */
interface FaceMeshData {
    quad?: {
        position: Float32Array;
        normal?: Float32Array;
        uvw?: Float32Array;
        count?: number;
    };
    triangle?: {
        position: Float32Array;
        normal?: Float32Array;
        uvw?: Float32Array;
        count?: number;
    };
}
declare class FaceMesh implements FaceMeshData {
    quad?: {
        position: Float32Array;
        normal?: Float32Array;
        uvw?: Float32Array;
        count?: number;
    };
    triangle?: {
        position: Float32Array;
        normal?: Float32Array;
        uvw?: Float32Array;
        count?: number;
    };
    constructor(d: FaceMeshData);
    applyAffineMat4(am: AffineMat4): this;
    applyObj4(obj4: Obj4): this;
    toIndexMesh(): FaceIndexMesh;
    clone(): FaceMesh;
    concat(m2: FaceMesh): FaceMesh;
}
interface FaceIndexMeshData {
    position: Float32Array;
    normal?: Float32Array;
    uvw?: Float32Array;
    quad?: {
        position: Uint32Array;
        normal?: Uint32Array;
        uvw?: Uint32Array;
        count?: number;
    };
    triangle?: {
        position: Uint32Array;
        normal?: Uint32Array;
        uvw?: Uint32Array;
        count?: number;
    };
}
declare class FaceIndexMesh implements FaceIndexMeshData {
    position: Float32Array;
    normal?: Float32Array;
    uvw?: Float32Array;
    quad?: {
        position: Uint32Array;
        normal?: Uint32Array;
        uvw?: Uint32Array;
        count?: number;
    };
    triangle?: {
        position: Uint32Array;
        normal?: Uint32Array;
        uvw?: Uint32Array;
        count?: number;
    };
    constructor(d: FaceIndexMeshData);
    applyAffineMat4(am: AffineMat4): this;
    applyObj4(obj4: Obj4): this;
    toNonIndexMesh(): FaceMesh;
    clone(): FaceIndexMesh;
    concat(m2: FaceIndexMesh): FaceIndexMesh;
}

declare function sphere(u: any, v: any): void;
declare function polygon(points: Vec4[]): {
    position: Float32Array;
    uvw: Float32Array;
    triangle: {
        position: Uint32Array;
        uvw: Uint32Array;
        count: number;
    };
};
declare function circle(radius: number, segment: number): {
    position: Float32Array;
    uvw: Float32Array;
    triangle: {
        position: Uint32Array;
        uvw: Uint32Array;
        count: number;
    };
};
declare function parametricSurface$1(fn: (inputuvw: Vec2, outputPosition: Vec4, outputNormal: Vec4) => void, uSegment: number, vSegment: number): {
    quad: {
        position: Float32Array;
        normal: Float32Array;
        uvw: Float32Array;
    };
};
/** m must be a manifold or manifold with border */
declare function findBorder(m: FaceIndexMeshData): any[];

type face_d_FaceMeshData = FaceMeshData;
type face_d_FaceMesh = FaceMesh;
declare const face_d_FaceMesh: typeof FaceMesh;
type face_d_FaceIndexMeshData = FaceIndexMeshData;
type face_d_FaceIndexMesh = FaceIndexMesh;
declare const face_d_FaceIndexMesh: typeof FaceIndexMesh;
declare const face_d_sphere: typeof sphere;
declare const face_d_polygon: typeof polygon;
declare const face_d_circle: typeof circle;
declare const face_d_findBorder: typeof findBorder;
declare namespace face_d {
  export {
    face_d_FaceMeshData as FaceMeshData,
    face_d_FaceMesh as FaceMesh,
    face_d_FaceIndexMeshData as FaceIndexMeshData,
    face_d_FaceIndexMesh as FaceIndexMesh,
    face_d_sphere as sphere,
    face_d_polygon as polygon,
    face_d_circle as circle,
    parametricSurface$1 as parametricSurface,
    face_d_findBorder as findBorder,
  };
}

declare let cube: TetraMesh;
declare function tesseract(): TetraMesh;
declare let hexadecachoron: TetraMesh;
declare function glome(radius: number, xySegment: number, zwSegment: number, latitudeSegment: number): TetraMesh;
declare function spheritorus(sphereRadius: number, longitudeSegment: number, latitudeSegment: number, circleRadius: number, circleSegment: number): TetraMesh;
declare function torisphere(circleRadius: number, circleSegment: number, sphereRadius: number, longitudeSegment: number, latitudeSegment: number): TetraMesh;
declare function spherinderSide(radius1: number, radius2: number, longitudeSegment: number, latitudeSegment: number, height: number, heightSegment?: number): TetraMesh;
declare function tiger(xyRadius: number, xySegment: number, zwRadius: number, zwSegment: number, secondaryRadius: number, secondarySegment: number): TetraMesh;
declare function parametricSurface(fn: (inputUVW: Vec3, outputPosition: Vec4, outputNormal: Vec4) => void, uSegment: number, vSegment: number, wSegment: number): TetraMesh;
declare function convexhull(points: Vec4[]): {
    position: Float32Array;
    count: number;
};
declare function duocone(xyRadius: number, xySegment: number, zwRadius: number, zwSegment: number): {
    position: Float32Array;
    count: number;
};
declare function duocylinder(xyRadius: number, xySegment: number, zwRadius: number, zwSegment: number): {
    position: Float32Array;
    count: number;
};
declare function loft(sp: Spline, section: FaceMeshData, step: number): TetraMesh;
declare function directProduct(shape1: FaceIndexMeshData, shape2: FaceIndexMeshData): TetraMesh;

type tetra_d_TetraMeshData = TetraMeshData;
type tetra_d_TetraIndexMeshData = TetraIndexMeshData;
type tetra_d_TetraMesh = TetraMesh;
declare const tetra_d_TetraMesh: typeof TetraMesh;
type tetra_d_TetraIndexMesh = TetraIndexMesh;
declare const tetra_d_TetraIndexMesh: typeof TetraIndexMesh;
declare const tetra_d_concat: typeof concat;
declare const tetra_d_cube: typeof cube;
declare const tetra_d_tesseract: typeof tesseract;
declare const tetra_d_hexadecachoron: typeof hexadecachoron;
declare const tetra_d_glome: typeof glome;
declare const tetra_d_spheritorus: typeof spheritorus;
declare const tetra_d_torisphere: typeof torisphere;
declare const tetra_d_spherinderSide: typeof spherinderSide;
declare const tetra_d_tiger: typeof tiger;
declare const tetra_d_parametricSurface: typeof parametricSurface;
declare const tetra_d_convexhull: typeof convexhull;
declare const tetra_d_duocone: typeof duocone;
declare const tetra_d_duocylinder: typeof duocylinder;
declare const tetra_d_loft: typeof loft;
declare const tetra_d_directProduct: typeof directProduct;
declare namespace tetra_d {
  export {
    tetra_d_TetraMeshData as TetraMeshData,
    tetra_d_TetraIndexMeshData as TetraIndexMeshData,
    tetra_d_TetraMesh as TetraMesh,
    tetra_d_TetraIndexMesh as TetraIndexMesh,
    tetra_d_concat as concat,
    tetra_d_cube as cube,
    tetra_d_tesseract as tesseract,
    tetra_d_hexadecachoron as hexadecachoron,
    tetra_d_glome as glome,
    tetra_d_spheritorus as spheritorus,
    tetra_d_torisphere as torisphere,
    tetra_d_spherinderSide as spherinderSide,
    tetra_d_tiger as tiger,
    tetra_d_parametricSurface as parametricSurface,
    tetra_d_convexhull as convexhull,
    tetra_d_duocone as duocone,
    tetra_d_duocylinder as duocylinder,
    tetra_d_loft as loft,
    tetra_d_directProduct as directProduct,
  };
}

declare type ColorOutputNode = MaterialNode & {
    output: "color";
};
declare type Vec4OutputNode = MaterialNode & {
    output: "vec4";
};
declare type FloatOutputNode = MaterialNode & {
    output: "f32";
};
declare type TransformOutputNode = MaterialNode & {
    output: "affineMat4";
};
/** An iterative structure for Material */
declare class MaterialNode {
    identifier: string;
    input: {
        [name: string]: MaterialNode;
    };
    output: string;
    static constFractionDigits: number;
    getCode(r: Renderer, root: Material$1, outputToken: string): string;
    getInputCode(r: Renderer, root: Material$1, token: string): {
        token: {
            [name: string]: string;
        };
        code: string;
    };
    update(r: Renderer): void;
    constructor(identifier: string);
}
/** Material is the top node of MaterialNode */
declare class Material$1 extends MaterialNode {
    cullMode: GPUCullMode;
    compiling: boolean;
    compiled: boolean;
    needsUpdate: boolean;
    output: string;
    pipeline: TetraSlicePipeline;
    uuid: string;
    bindGroup: GPUBindGroup[];
    bindGroupBuffers: GPUBuffer[];
    fetchBuffers: string[];
    declUniforms: {
        [name: string]: {
            location: number;
            type: string;
            buffer: GPUBuffer;
        };
    };
    declUniformLocation: number;
    declVarys: string[];
    declHeaders: {
        [name: string]: string;
    };
    createBindGroup(r: Renderer, p: TetraSlicePipeline): void;
    init(r: Renderer): void;
    compile(r: Renderer): Promise<void>;
    addVary(a: string): void;
    addHeader(key: string, value: string): void;
    addUniform(type: string, u: string, buffer: GPUBuffer): void;
    fetchBuffer(g: Geometry): GPUBuffer[];
    getShaderCode(r: Renderer): {
        vs: string;
        fs: string;
    };
    constructor(identifiers: string);
    gpuUniformBuffer: {
        [name: string]: GPUBuffer;
    };
}
/** the same UniformValue instance will share one uniform buffer */
declare class UniformValue extends MaterialNode {
    gpuBuffer: GPUBuffer;
    gpuBufferSize: number;
    jsBufferSize: number;
    type: string;
    needsUpdate: boolean;
    constructor();
    getCode(r: Renderer, root: Material$1, outputToken: string): string;
    createBuffer(r: Renderer): void;
    _update(r: Renderer): void;
    update(r: Renderer): void;
}
declare class ColorUniformValue extends UniformValue {
    output: "color";
    type: string;
    gpuBufferSize: number;
    value: GPUColor;
    _update(r: Renderer): void;
    write(value: GPUColor): void;
}
declare class Vec4UniformValue extends UniformValue {
    output: "vec4";
    type: string;
    gpuBufferSize: number;
    value: Vec4;
    _update(r: Renderer): void;
    write(value: Vec4): void;
}
declare class FloatUniformValue extends UniformValue {
    output: "f32";
    type: string;
    gpuBufferSize: number;
    value: number;
    _update(r: Renderer): void;
    write(value: number): void;
}
declare class TransformUniformValue extends UniformValue {
    output: "affineMat4";
    type: string;
    gpuBufferSize: number;
    value: Obj4;
    private affineMatValue;
    _update(r: Renderer): void;
    write(value: Obj4): void;
}
declare type Color = GPUColor | ColorOutputNode;
declare type Float = number | FloatOutputNode;
/** Basic material just return color node's output color  */
declare class BasicMaterial extends Material$1 {
    input: {
        color: ColorOutputNode;
    };
    constructor(color: Color);
    getCode(r: Renderer, root: Material$1, outputToken: string): string;
}
declare class LambertMaterial extends Material$1 {
    input: {
        color: ColorOutputNode;
    };
    getCode(r: Renderer, root: Material$1, outputToken: string): string;
    constructor(color: Color);
}
/** Blinn Phong */
declare class PhongMaterial extends Material$1 {
    input: {
        color: ColorOutputNode;
        specular: ColorOutputNode;
        shininess: FloatOutputNode;
    };
    getCode(r: Renderer, root: Material$1, outputToken: string): string;
    constructor(color: Color, shininess?: Float, specular?: Color);
}
declare class CheckerTexture extends MaterialNode {
    output: "color";
    input: {
        color1: ColorOutputNode;
        color2: ColorOutputNode;
        uvw: Vec4OutputNode;
    };
    getCode(r: Renderer, root: Material$1, outputToken: string): string;
    constructor(color1: Color, color2: Color, uvw?: Vec4OutputNode);
}
declare class GridTexture extends MaterialNode {
    output: "color";
    input: {
        color1: ColorOutputNode;
        color2: ColorOutputNode;
        gridWidth: Vec4OutputNode;
        uvw: Vec4OutputNode;
    };
    getCode(r: Renderer, root: Material$1, outputToken: string): string;
    constructor(color1: Color, color2: Color, gridWidth: number | Vec4 | Vec4OutputNode, uvw?: Vec4OutputNode);
}
declare class UVWVec4Input extends MaterialNode {
    output: "vec4";
    getCode(r: Renderer, root: Material$1, outputToken: string): string;
    constructor();
}
declare class WorldCoordVec4Input extends MaterialNode {
    output: "vec4";
    getCode(r: Renderer, root: Material$1, outputToken: string): string;
    constructor();
}
declare class Vec4TransformNode extends MaterialNode {
    output: "vec4";
    input: {
        vec4: Vec4OutputNode;
        transform: TransformOutputNode;
    };
    getCode(r: Renderer, root: Material$1, outputToken: string): string;
    constructor(vec4: Vec4OutputNode, transform: Obj4 | TransformOutputNode);
}
/** simplex 3D noise */
declare const NoiseWGSLHeader = "\n        fn mod289v3(x:vec3<f32>)->vec3<f32> {\n            return x - floor(x * (1.0 / 289.0)) * 289.0; \n        }\n        fn mod289v4(x:vec4<f32>)->vec4<f32> {\n            return x - floor(x * (1.0 / 289.0)) * 289.0; \n        }\n        fn mod289f(x:f32)->f32 {\n            return x - floor(x * (1.0 / 289.0)) * 289.0; \n        }\n        fn permutev4(x:vec4<f32>)->vec4<f32> {\n            return mod289v4(((x * 34.0) + 1.0) * x);\n        }\n        fn permutef(x:f32)-> f32 {\n            return mod289f(((x * 34.0) + 1.0) * x);\n        }\n        fn taylorInvSqrtv4(r:vec4<f32>)->vec4<f32> {\n            return vec4(1.79284291400159) - 0.85373472095314 * r;\n        }\n        fn taylorInvSqrtf(r:f32)->f32{\n            return 1.79284291400159 - 0.85373472095314 * r;\n        }\n        \n        fn snoise(v1:vec3<f32>)->f32{\n            let v = v1 + vec3(0.00001,0.00002,0.00003);\n            const C = vec2(1.0/6.0, 1.0/3.0);\n            const D = vec4(0.0, 0.5, 1.0, 2.0);\n\n            // First corner\n            var i  = floor(v + dot(v, vec3(C.y)) );\n            let x0 =   v - i + dot(i, vec3(C.x)) ;\n\n            // Other corners\n            let g = step(x0.yzx, x0.xyz);\n            let l = 1.0 - g;\n            let i1 = min( g.xyz, l.zxy );\n            let i2 = max( g.xyz, l.zxy );\n\n            let x1 = x0 - i1 + vec3(C.x);\n            let x2 = x0 - i2 + vec3(C.y); // 2.0*C.x = 1/3 = C.y\n            let x3 = x0 - vec3(D.y);      // -1.0+3.0*C.x = -0.5 = -D.y\n\n            // Permutations\n            i = mod289v3(i);\n            let p = permutev4( permutev4( permutev4(\n                        vec4(i.z) + vec4(0.0, i1.z, i2.z, 1.0 ))\n                    + vec4(i.y) + vec4(0.0, i1.y, i2.y, 1.0 ))\n                    + vec4(i.x) + vec4(0.0, i1.x, i2.x, 1.0 ));\n\n            // Gradients: 7x7 points over a square, mapped onto an octahedron.\n            // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)\n            const n_ = 0.142857142857; // 1.0/7.0\n            let  ns = n_ * D.wyz - D.xzx;\n\n            let j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)\n\n            let x_ = floor(j * ns.z);\n            let y_ = floor(j - 7.0 * x_ );    // mod(j,N)\n\n            let x = x_ *ns.x + vec4(ns.y);\n            let y = y_ *ns.x + vec4(ns.y);\n            let h = 1.0 - abs(x) - abs(y);\n\n            let b0 = vec4( x.xy, y.xy );\n            let b1 = vec4( x.zw, y.zw );\n\n            //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;\n            //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;\n            let s0 = floor(b0)*2.0 + 1.0;\n            let s1 = floor(b1)*2.0 + 1.0;\n            let sh = -step(h, vec4(0.0));\n\n            let a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\n            let a1 = b1.xzyw + s1.xzyw*sh.zzww ;\n\n            var p0 = vec3(a0.xy,h.x);\n            var p1 = vec3(a0.zw,h.y);\n            var p2 = vec3(a1.xy,h.z);\n            var p3 = vec3(a1.zw,h.w);\n\n            //Normalise gradients\n            let norm = taylorInvSqrtv4(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n            p0 *= norm.x;\n            p1 *= norm.y;\n            p2 *= norm.z;\n            p3 *= norm.w;\n\n            // Mix final noise value\n            var m = max(vec4(0.6) - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), vec4(0.0));\n            m = m * m;\n            return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );\n        }\n        ";
declare class NoiseTexture extends MaterialNode {
    output: "f32";
    input: {
        uvw: Vec4OutputNode;
    };
    getCode(r: Renderer, root: Material$1, outputToken: string): string;
    constructor(uvw?: Vec4OutputNode);
}

declare class Scene {
    child: Object$1[];
    backGroundColor: GPUColor;
    skyBox?: SkyBox;
    add(...obj: Object$1[]): void;
    removeChild(obj: Object$1): void;
    setBackgroudColor(color: GPUColor): void;
}
declare class Object$1 extends Obj4 {
    child: Object$1[];
    worldCoord: AffineMat4;
    needsUpdateCoord: boolean;
    alwaysUpdateCoord: boolean;
    visible: boolean;
    constructor();
    updateCoord(): this;
    add(...obj: Object$1[]): void;
    removeChild(obj: Object$1): void;
}
declare class Camera extends Object$1 implements PerspectiveCamera {
    fov: number;
    near: number;
    far: number;
    alwaysUpdateCoord: boolean;
    needsUpdate: boolean;
}
declare class Mesh extends Object$1 {
    geometry: Geometry;
    material: Material$1;
    uObjMatBuffer: GPUBuffer;
    bindGroup: GPUBindGroup;
    constructor(geometry: Geometry, material: Material$1);
}
declare class Geometry {
    jsBuffer: TetraMesh;
    gpuBuffer: {
        [name: string]: GPUBuffer;
    };
    needsUpdate: boolean;
    dynamic: boolean;
    obb: AABB;
    constructor(data: TetraMeshData);
    updateOBB(): void;
}
declare class TesseractGeometry extends Geometry {
    constructor(size?: number | Vec4);
}
declare class CubeGeometry extends Geometry {
    constructor(size?: number | Vec3);
}
declare class GlomeGeometry extends Geometry {
    constructor(size?: number, detail?: number);
}
declare class SpheritorusGeometry extends Geometry {
    constructor(sphereRadius?: number, circleRadius?: number, detail?: number);
}
declare class TorisphereGeometry extends Geometry {
    constructor(circleRadius?: number, sphereRadius?: number, detail?: number);
}
declare class SpherinderSideGeometry extends Geometry {
    constructor(sphereRadius1?: number, sphereRadius2?: number, height?: number, detail?: number);
}
declare class TigerGeometry extends Geometry {
    constructor(circleRadius?: number, radius1?: number, radius2?: number, detail?: number);
}
declare class ConvexHullGeometry extends Geometry {
    constructor(points: Vec4[]);
}
declare abstract class SkyBox {
    pipeline: RaytracingPipeline;
    uBuffer: GPUBuffer;
    jsBuffer: Float32Array;
    compiling: boolean;
    compiled: boolean;
    needsUpdate: boolean;
    bindGroups: GPUBindGroup[];
    readonly bufferSize: number;
    uuid: string;
    static readonly commonCode: string;
    compile(r: Renderer): Promise<void>;
    abstract getShaderCode(): RaytracingPipelineDescriptor;
    constructor();
    getBindgroups(r: Renderer): void;
    update(r: Renderer): void;
}
declare class SimpleSkyBox extends SkyBox {
    readonly bufferSize = 8;
    constructor();
    setSunPosition(pos: Vec4): void;
    setOpacity(o: number): void;
    getOpacity(): number;
    getSunPosition(): Vec4;
    getShaderCode(): RaytracingPipelineDescriptor;
}

declare type LightDensity = {
    r: number;
    g: number;
    b: number;
} | Vec3 | number[] | number;
declare class Light extends Object$1 {
    density: Vec3;
    constructor(density: LightDensity);
}
declare class AmbientLight extends Light {
    needsUpdateCoord: boolean;
    constructor(density: LightDensity);
}
declare class DirectionalLight extends Light {
    worldDirection: Vec4;
    direction: Vec4;
    constructor(density: LightDensity, direction?: Vec4);
}
declare class SpotLight extends Light {
    worldDirection: Vec4;
    direction: Vec4;
    angle: number;
    penumbra: number;
    decayPower: number;
    constructor(density: LightDensity, angle: number, penumbra: number, direction?: Vec4);
}
declare class PointLight extends Light {
    decayPower: number;
    constructor(density: LightDensity);
}

interface RendererConfig {
    posdirLightsNumber?: number;
    spotLightsNumber?: number;
}
/** threejs like 4D lib */
declare class Renderer {
    core: SliceRenderer;
    gpu: GPU;
    canvas: HTMLCanvasElement;
    pipelines: {
        [label: string]: TetraSlicePipeline | "compiling";
    };
    jsBuffer: Float32Array;
    uCamMatBuffer: GPUBuffer;
    uWorldLightBuffer: GPUBuffer;
    lightShaderInfomation: {
        posdirLightsNumber: number;
        spotLightsNumber: number;
        lightCode: string;
        uWorldLightBufferSize: number;
    };
    private cameraInScene;
    private safeTetraNumInOnePass;
    private tetraNumOccupancyRatio;
    private maxTetraNumInOnePass;
    constructor(canvas: HTMLCanvasElement);
    setBackgroudColor(color: GPUColor): void;
    init(config?: RendererConfig): Promise<this>;
    fetchPipelineName(identifier: string): string;
    fetchPipeline(identifier: string): TetraSlicePipeline | "compiling";
    pullPipeline(identifier: string, pipeline: TetraSlicePipeline | "compiling"): void;
    updateObject(o: Object$1): void;
    addToDrawList(m: Mesh): void;
    compileMaterials(mats: Iterable<Material$1> | Scene): Promise<void>;
    updateMesh(m: Mesh): void;
    updateScene(scene: Scene): void;
    updateSkyBox(scene: Scene): void;
    ambientLightDensity: Vec3;
    directionalLights: DirectionalLight[];
    spotLights: SpotLight[];
    pointLights: PointLight[];
    drawList: DrawList;
    activeCamera: Camera;
    setCamera(camera: Camera): void;
    render(scene: Scene, camera: Camera): void;
    setSize(size: GPUExtent3DStrict): void;
    private clearState;
}
interface DrawList {
    [group: string]: {
        pipeline: TetraSlicePipeline;
        meshes: Mesh[];
        bindGroup: {
            group: number;
            binding: GPUBindGroup;
        };
        tetraCount: number;
        next?: string;
    };
}

type four_d_PointLight = PointLight;
declare const four_d_PointLight: typeof PointLight;
type four_d_DirectionalLight = DirectionalLight;
declare const four_d_DirectionalLight: typeof DirectionalLight;
type four_d_SpotLight = SpotLight;
declare const four_d_SpotLight: typeof SpotLight;
type four_d_Light = Light;
declare const four_d_Light: typeof Light;
type four_d_AmbientLight = AmbientLight;
declare const four_d_AmbientLight: typeof AmbientLight;
type four_d_RendererConfig = RendererConfig;
type four_d_Renderer = Renderer;
declare const four_d_Renderer: typeof Renderer;
type four_d_Scene = Scene;
declare const four_d_Scene: typeof Scene;
type four_d_Camera = Camera;
declare const four_d_Camera: typeof Camera;
type four_d_Mesh = Mesh;
declare const four_d_Mesh: typeof Mesh;
type four_d_Geometry = Geometry;
declare const four_d_Geometry: typeof Geometry;
type four_d_TesseractGeometry = TesseractGeometry;
declare const four_d_TesseractGeometry: typeof TesseractGeometry;
type four_d_CubeGeometry = CubeGeometry;
declare const four_d_CubeGeometry: typeof CubeGeometry;
type four_d_GlomeGeometry = GlomeGeometry;
declare const four_d_GlomeGeometry: typeof GlomeGeometry;
type four_d_SpheritorusGeometry = SpheritorusGeometry;
declare const four_d_SpheritorusGeometry: typeof SpheritorusGeometry;
type four_d_TorisphereGeometry = TorisphereGeometry;
declare const four_d_TorisphereGeometry: typeof TorisphereGeometry;
type four_d_SpherinderSideGeometry = SpherinderSideGeometry;
declare const four_d_SpherinderSideGeometry: typeof SpherinderSideGeometry;
type four_d_TigerGeometry = TigerGeometry;
declare const four_d_TigerGeometry: typeof TigerGeometry;
type four_d_ConvexHullGeometry = ConvexHullGeometry;
declare const four_d_ConvexHullGeometry: typeof ConvexHullGeometry;
type four_d_SkyBox = SkyBox;
declare const four_d_SkyBox: typeof SkyBox;
type four_d_SimpleSkyBox = SimpleSkyBox;
declare const four_d_SimpleSkyBox: typeof SimpleSkyBox;
type four_d_ColorOutputNode = ColorOutputNode;
type four_d_Vec4OutputNode = Vec4OutputNode;
type four_d_FloatOutputNode = FloatOutputNode;
type four_d_TransformOutputNode = TransformOutputNode;
type four_d_MaterialNode = MaterialNode;
declare const four_d_MaterialNode: typeof MaterialNode;
type four_d_ColorUniformValue = ColorUniformValue;
declare const four_d_ColorUniformValue: typeof ColorUniformValue;
type four_d_Vec4UniformValue = Vec4UniformValue;
declare const four_d_Vec4UniformValue: typeof Vec4UniformValue;
type four_d_FloatUniformValue = FloatUniformValue;
declare const four_d_FloatUniformValue: typeof FloatUniformValue;
type four_d_TransformUniformValue = TransformUniformValue;
declare const four_d_TransformUniformValue: typeof TransformUniformValue;
type four_d_Color = Color;
type four_d_Float = Float;
type four_d_BasicMaterial = BasicMaterial;
declare const four_d_BasicMaterial: typeof BasicMaterial;
type four_d_LambertMaterial = LambertMaterial;
declare const four_d_LambertMaterial: typeof LambertMaterial;
type four_d_PhongMaterial = PhongMaterial;
declare const four_d_PhongMaterial: typeof PhongMaterial;
type four_d_CheckerTexture = CheckerTexture;
declare const four_d_CheckerTexture: typeof CheckerTexture;
type four_d_GridTexture = GridTexture;
declare const four_d_GridTexture: typeof GridTexture;
type four_d_UVWVec4Input = UVWVec4Input;
declare const four_d_UVWVec4Input: typeof UVWVec4Input;
type four_d_WorldCoordVec4Input = WorldCoordVec4Input;
declare const four_d_WorldCoordVec4Input: typeof WorldCoordVec4Input;
type four_d_Vec4TransformNode = Vec4TransformNode;
declare const four_d_Vec4TransformNode: typeof Vec4TransformNode;
declare const four_d_NoiseWGSLHeader: typeof NoiseWGSLHeader;
type four_d_NoiseTexture = NoiseTexture;
declare const four_d_NoiseTexture: typeof NoiseTexture;
declare namespace four_d {
  export {
    four_d_PointLight as PointLight,
    four_d_DirectionalLight as DirectionalLight,
    four_d_SpotLight as SpotLight,
    four_d_Light as Light,
    four_d_AmbientLight as AmbientLight,
    four_d_RendererConfig as RendererConfig,
    four_d_Renderer as Renderer,
    four_d_Scene as Scene,
    Object$1 as Object,
    four_d_Camera as Camera,
    four_d_Mesh as Mesh,
    four_d_Geometry as Geometry,
    four_d_TesseractGeometry as TesseractGeometry,
    four_d_CubeGeometry as CubeGeometry,
    four_d_GlomeGeometry as GlomeGeometry,
    four_d_SpheritorusGeometry as SpheritorusGeometry,
    four_d_TorisphereGeometry as TorisphereGeometry,
    four_d_SpherinderSideGeometry as SpherinderSideGeometry,
    four_d_TigerGeometry as TigerGeometry,
    four_d_ConvexHullGeometry as ConvexHullGeometry,
    four_d_SkyBox as SkyBox,
    four_d_SimpleSkyBox as SimpleSkyBox,
    four_d_ColorOutputNode as ColorOutputNode,
    four_d_Vec4OutputNode as Vec4OutputNode,
    four_d_FloatOutputNode as FloatOutputNode,
    four_d_TransformOutputNode as TransformOutputNode,
    four_d_MaterialNode as MaterialNode,
    Material$1 as Material,
    four_d_ColorUniformValue as ColorUniformValue,
    four_d_Vec4UniformValue as Vec4UniformValue,
    four_d_FloatUniformValue as FloatUniformValue,
    four_d_TransformUniformValue as TransformUniformValue,
    four_d_Color as Color,
    four_d_Float as Float,
    four_d_BasicMaterial as BasicMaterial,
    four_d_LambertMaterial as LambertMaterial,
    four_d_PhongMaterial as PhongMaterial,
    four_d_CheckerTexture as CheckerTexture,
    four_d_GridTexture as GridTexture,
    four_d_UVWVec4Input as UVWVec4Input,
    four_d_WorldCoordVec4Input as WorldCoordVec4Input,
    four_d_Vec4TransformNode as Vec4TransformNode,
    four_d_NoiseWGSLHeader as NoiseWGSLHeader,
    four_d_NoiseTexture as NoiseTexture,
  };
}

declare type RigidType = "still" | "passive" | "active";
interface SimpleRigidDescriptor {
    /** mass set to 0 to specify non-active rigid */
    mass: number | null;
    /** RigidGeometry instance cannot be shared between Rigid instances */
    geometry: RigidGeometry;
    material: Material;
    type?: RigidType;
    /** for tracing debug */
    label?: string;
}
/** Subrigids should not be added into scene repetively.
 * Subrigids's positions cannot be modified after union created
 */
declare type UnionRigidDescriptor = Rigid[];
/** all properities hold by class Rigid should not be modified
 *  exceptions are position/rotation and (angular)velocity.
 *  pass RigidDescriptor into constructor instead.
 *  */
declare class Rigid extends Obj4 {
    scale: undefined;
    material: Material;
    geometry: RigidGeometry;
    type: RigidType;
    mass: number | undefined;
    invMass: number;
    inertia: Bivec | undefined;
    invInertia: Bivec | undefined;
    inertiaIsotroy: boolean;
    sleep: boolean;
    label?: string;
    velocity: Vec4;
    angularVelocity: Bivec;
    force: Vec4;
    torque: Bivec;
    acceleration: Vec4;
    angularAcceleration: Bivec;
    constructor(param: SimpleRigidDescriptor | UnionRigidDescriptor);
    getlinearVelocity(out: Vec4, point: Vec4): Vec4;
}
/** internal type for union rigid geometry */
interface SubRigid extends Rigid {
    localCoord?: Obj4;
    parent?: Rigid;
}
declare abstract class RigidGeometry {
    rigid: Rigid;
    obb: AABB;
    aabb: AABB;
    boundingGlome: number;
    initialize(rigid: Rigid): void;
    abstract initializeMassInertia(rigid: Rigid): void;
}
declare namespace rigid {
    class Union extends RigidGeometry {
        components: SubRigid[];
        constructor(components: Rigid[]);
        initializeMassInertia(rigid: Rigid): void;
        updateCoord(): void;
    }
    class Glome extends RigidGeometry {
        radius: number;
        radiusSqr: number;
        constructor(radius: number);
        initializeMassInertia(rigid: Rigid): void;
    }
    class Convex extends RigidGeometry {
        points: Vec4[];
        _cachePoints: Vec4[];
        constructor(points: Vec4[]);
        initializeMassInertia(rigid: Rigid): void;
    }
    class Tesseractoid extends Convex {
        size: Vec4;
        constructor(size: Vec4 | number);
        initializeMassInertia(rigid: Rigid): void;
    }
    /** equation: dot(normal,positon) == offset
     *  => when offset > 0, plane is shifted to normal direction
     *  from origin by distance = offset
     */
    class Plane extends RigidGeometry {
        normal: Vec4;
        offset: number;
        constructor(normal?: Vec4, offset?: number);
        initializeMassInertia(rigid: Rigid): void;
    }
    /** default orientation: XW */
    class Spheritorus extends RigidGeometry {
        majorRadius: number;
        minorRadius: number;
        /** majorRadius: cirle's radius, minorRadius: sphere's radius */
        constructor(majorRadius: number, minorRadius: number);
        initializeMassInertia(rigid: Rigid): void;
    }
    /** default orientation: XZW */
    class Torisphere extends RigidGeometry {
        majorRadius: number;
        minorRadius: number;
        /** majorRadius: sphere's radius, minorRadius: cirle's radius */
        constructor(majorRadius: number, minorRadius: number);
        initializeMassInertia(rigid: Rigid): void;
    }
    /** default orientation: 1:XY, 2:ZW */
    class Tiger extends RigidGeometry {
        majorRadius1: number;
        majorRadius2: number;
        minorRadius: number;
        /** majorRadius: sphere's radius, minorRadius: cirle's radius */
        constructor(majorRadius1: number, majorRadius2: number, minorRadius: number);
        initializeMassInertia(rigid: Rigid): void;
    }
    class ThickHexahedronGrid extends RigidGeometry {
        grid1: Vec4[][][];
        grid2: Vec4[][][];
        convex: Convex[];
        constructor(grid1: Vec4[][][], grid2: Vec4[][][]);
        initializeMassInertia(rigid: Rigid): void;
    }
}

interface BroadPhaseConstructor {
    new (): BroadPhase;
}
declare type BroadPhaseList = [Rigid, Rigid][];
declare abstract class BroadPhase {
    checkList: BroadPhaseList;
    protected clearCheckList(): void;
    abstract run(world: World): void;
}
declare class BoundingGlomeBroadPhase extends BroadPhase {
    checkBoundingGlome(ri: Rigid, rj: Rigid): boolean;
    run(world: World): void;
}
declare type BoundingGlomeTreeNode = {
    position: Vec4;
    radius: number;
    surcell: number;
    child1: BoundingGlomeTreeNode | Rigid;
    child2?: BoundingGlomeTreeNode | Rigid;
    parent?: BoundingGlomeTreeNode;
    rigidIndex?: number;
};
declare class BoundingGlomeTreeBroadPhase extends BroadPhase {
    tree: BoundingGlomeTreeNode;
    exclude: Rigid[];
    include: Rigid[];
    buildTree(world: World): void;
    run(world: World): void;
}
declare class IgnoreAllBroadPhase extends BroadPhase {
    run(world: World): void;
}

interface ForceAccumulatorConstructor {
    new (): ForceAccumulator;
}
declare abstract class ForceAccumulator {
    abstract run(world: World, dt: number): void;
    private _biv1;
    private _biv2;
    private readonly _bivec0;
    getState(world: World): void;
}
declare namespace force_accumulator {
    class Euler2 extends ForceAccumulator {
        private _bivec;
        private _rotor;
        run(world: World, dt: number): void;
    }
    class Predict3 extends ForceAccumulator {
        private _bivec1;
        private _bivec2;
        private _rotor;
        private _vec;
        run(world: World, dt: number): void;
    }
    class RK4 extends ForceAccumulator {
        private _bivec1;
        private _rotor;
        run(world: World, dt: number): void;
    }
}
declare abstract class Force {
    abstract apply(time: number): void;
}
/** apply a spring force between object a and b
 *  pointA and pointB are in local coordinates,
 *  refering connect point of spring's two ends.
 *  b can be null for attaching spring to a fixed point in the world.
 *  f = k dx - damp * dv */
declare class Spring extends Force {
    a: Rigid;
    pointA: Vec4;
    b: Rigid | null;
    pointB: Vec4;
    k: number;
    damp: number;
    length: number;
    private _vec4f;
    private _vec4a;
    private _vec4b;
    private _bivec;
    constructor(a: Rigid, b: Rigid | null, pointA: Vec4, pointB: Vec4, k: number, length?: number, damp?: number);
    apply(time: number): void;
}
declare class Damping extends Force {
    objects: Rigid[];
    linearFactor: number;
    angularFactor: Bivec;
    private _bivec;
    apply(time: number): void;
    constructor(linearFactor: number, angularFactor: number | Bivec);
    add(...objects: Rigid[]): void;
}
declare type ElectricCharge = {
    rigid: Rigid | null;
    position: Vec4;
    worldPos?: Vec4;
    charge: number;
};
declare type ElectricDipole = {
    rigid: Rigid | null;
    position: Vec4;
    worldPos?: Vec4;
    moment: Vec4;
    worldMoment?: Vec4;
};
declare type MagneticDipole = {
    rigid: Rigid | null;
    position: Vec4;
    worldPos?: Vec4;
    moment: Bivec;
    worldMoment?: Bivec;
};
declare type CurrentElement = {
    rigid: Rigid | null;
    position: Vec4;
    worldPos?: Vec4;
    current: Vec4;
};
declare type CurrentCircuit = {
    rigid: Rigid | null;
    position: Vec4;
    worldPos?: Vec4;
    current: Vec4;
    radius: number;
};
declare class MaxWell extends Force {
    electricCharge: ElectricCharge[];
    electricDipole: ElectricDipole[];
    magneticDipole: MagneticDipole[];
    currentElement: CurrentElement[];
    currentCircuit: CurrentCircuit[];
    permittivity: number;
    permeability: number;
    constantElectricField: Vec4;
    /** magnetic field direction is defined by positive charge's velocity wedge it's lorentz force */
    constantMagneticField: Bivec;
    private _vecE;
    private _vecdE;
    private _vecB;
    private _vecdB;
    private _vecP;
    addElectricCharge(s: ElectricCharge): void;
    addElectricDipole(s: ElectricDipole): void;
    addMagneticDipole(s: MagneticDipole): void;
    getEAt(p: Vec4, dE: boolean, ignore: Rigid | Vec4 | undefined): Vec4;
    getBAt(p: Vec4, dB: boolean, ignore: Rigid | Vec4 | undefined): Bivec;
    apply(time: number): void;
    private addEOfElectricCharge;
    private addBOfMagneticDipole;
    private addEOfElectricDipole;
}

interface Collision {
    point: Vec4;
    depth: number;
    /** normal is defined from a to b */
    normal: Vec4;
    a: Rigid;
    b?: Rigid;
}
declare class NarrowPhase {
    collisionList: Collision[];
    /** max iteration for sdf methods in detectCollision */
    maxIteration: number;
    clearCollisionList(): void;
    run(list: BroadPhaseList): void;
    detectCollision(rigidA: Rigid, rigidB: Rigid): any;
    private detectGlomeGlome;
    private detectGlomePlane;
    private detectConvexPlane;
    private detectConvexGlome;
    private detectConvexConvex;
    private detectSpheritorusPlane;
    private detectSpheritorusGlome;
    private detectSpheritorusSpheritorus;
    private detectTorispherePlane;
    private detectTorisphereGlome;
    private detectTorisphereTorisphere;
    private detectTorisphereSpheritorus;
    private detectTigerPlane;
    private detectTigerGlome;
    private detectTigerTiger;
    private detectTigerTorisphere;
    private detectTigerSpheritorus;
}

interface SolverConstructor {
    new (): Solver;
}
declare abstract class Solver {
    abstract run(collisionList: Collision[], constrainList: Constrain[]): void;
}

interface EngineOption {
    forceAccumulator?: ForceAccumulatorConstructor;
    broadPhase?: BroadPhaseConstructor;
    solver?: SolverConstructor;
    substep?: number;
}
declare class Engine {
    forceAccumulator: ForceAccumulator;
    broadPhase: BroadPhase;
    narrowPhase: NarrowPhase;
    solver: Solver;
    substep: number;
    constructor(option?: EngineOption);
    update(world: World, dt: number): void;
    step(world: World, dt: number): void;
}
declare class World {
    gravity: Vec4;
    rigids: Rigid[];
    constrains: Constrain[];
    unionRigids: rigid.Union[];
    forces: Force[];
    time: number;
    add(...args: (Rigid | Force | Constrain)[]): void;
    remove(o: Rigid | Force): void;
    updateUnionGeometriesCoord(): void;
}
declare class Material {
    friction: number;
    restitution: number;
    constructor(friction: number, restitution: number);
    static getContactMaterial(a: Material, b: Material): {
        restitution: number;
        friction: number;
    };
}
declare class Constrain {
    a: Rigid;
    b: Rigid | undefined;
    constructor(a: Rigid, b?: Rigid | undefined);
}
declare class PointConstrain extends Constrain {
    pointA: Vec4;
    pointB: Vec4;
    constructor(a: Rigid, b: Rigid | undefined, pointA: Vec4, pointB: Vec4);
}

type physics_d_PointConstrain = PointConstrain;
declare const physics_d_PointConstrain: typeof PointConstrain;
type physics_d_Constrain = Constrain;
declare const physics_d_Constrain: typeof Constrain;
type physics_d_Material = Material;
declare const physics_d_Material: typeof Material;
type physics_d_World = World;
declare const physics_d_World: typeof World;
type physics_d_Engine = Engine;
declare const physics_d_Engine: typeof Engine;
type physics_d_BoundingGlomeTreeBroadPhase = BoundingGlomeTreeBroadPhase;
declare const physics_d_BoundingGlomeTreeBroadPhase: typeof BoundingGlomeTreeBroadPhase;
type physics_d_BoundingGlomeBroadPhase = BoundingGlomeBroadPhase;
declare const physics_d_BoundingGlomeBroadPhase: typeof BoundingGlomeBroadPhase;
type physics_d_BroadPhase = BroadPhase;
declare const physics_d_BroadPhase: typeof BroadPhase;
type physics_d_IgnoreAllBroadPhase = IgnoreAllBroadPhase;
declare const physics_d_IgnoreAllBroadPhase: typeof IgnoreAllBroadPhase;
declare const physics_d_rigid: typeof rigid;
type physics_d_RigidGeometry = RigidGeometry;
declare const physics_d_RigidGeometry: typeof RigidGeometry;
type physics_d_Rigid = Rigid;
declare const physics_d_Rigid: typeof Rigid;
type physics_d_ForceAccumulatorConstructor = ForceAccumulatorConstructor;
type physics_d_ForceAccumulator = ForceAccumulator;
declare const physics_d_ForceAccumulator: typeof ForceAccumulator;
declare const physics_d_force_accumulator: typeof force_accumulator;
type physics_d_Force = Force;
declare const physics_d_Force: typeof Force;
type physics_d_Spring = Spring;
declare const physics_d_Spring: typeof Spring;
type physics_d_Damping = Damping;
declare const physics_d_Damping: typeof Damping;
type physics_d_ElectricCharge = ElectricCharge;
type physics_d_ElectricDipole = ElectricDipole;
type physics_d_MagneticDipole = MagneticDipole;
type physics_d_CurrentElement = CurrentElement;
type physics_d_CurrentCircuit = CurrentCircuit;
type physics_d_MaxWell = MaxWell;
declare const physics_d_MaxWell: typeof MaxWell;
declare namespace physics_d {
  export {
    physics_d_PointConstrain as PointConstrain,
    physics_d_Constrain as Constrain,
    physics_d_Material as Material,
    physics_d_World as World,
    physics_d_Engine as Engine,
    physics_d_BoundingGlomeTreeBroadPhase as BoundingGlomeTreeBroadPhase,
    physics_d_BoundingGlomeBroadPhase as BoundingGlomeBroadPhase,
    physics_d_BroadPhase as BroadPhase,
    physics_d_IgnoreAllBroadPhase as IgnoreAllBroadPhase,
    physics_d_rigid as rigid,
    physics_d_RigidGeometry as RigidGeometry,
    physics_d_Rigid as Rigid,
    physics_d_ForceAccumulatorConstructor as ForceAccumulatorConstructor,
    physics_d_ForceAccumulator as ForceAccumulator,
    physics_d_force_accumulator as force_accumulator,
    physics_d_Force as Force,
    physics_d_Spring as Spring,
    physics_d_Damping as Damping,
    physics_d_ElectricCharge as ElectricCharge,
    physics_d_ElectricDipole as ElectricDipole,
    physics_d_MagneticDipole as MagneticDipole,
    physics_d_CurrentElement as CurrentElement,
    physics_d_CurrentCircuit as CurrentCircuit,
    physics_d_MaxWell as MaxWell,
  };
}

declare type Size3DDict = {
    width: number;
    height: number;
    depth: number;
};
interface VoxelBuffer {
    buffer: GPUBuffer;
    header?: ArrayBuffer;
    width: number;
    height: number;
    depth: number;
    length: number;
    formatSize: number;
}
declare function createVoxelBuffer(gpu: GPU, size: GPUExtent3D, formatSize: number, header?: ArrayBuffer, headerSize?: number): {
    buffer: GPUBuffer;
    width: number;
    height: number;
    depth: number;
    length: number;
    formatSize: number;
    header: ArrayBuffer;
};

type render_d_GPU = GPU;
declare const render_d_GPU: typeof GPU;
type render_d_SliceRendererOption = SliceRendererOption;
type render_d_SliceFacing = SliceFacing;
declare const render_d_SliceFacing: typeof SliceFacing;
type render_d_EyeOffset = EyeOffset;
declare const render_d_EyeOffset: typeof EyeOffset;
type render_d_TetraSlicePipelineDescriptor = TetraSlicePipelineDescriptor;
type render_d_RaytracingPipelineDescriptor = RaytracingPipelineDescriptor;
type render_d_GeneralShaderState = GeneralShaderState;
type render_d_TetraVertexState = TetraVertexState;
type render_d_TetraSlicePipeline = TetraSlicePipeline;
type render_d_RaytracingPipeline = RaytracingPipeline;
type render_d_SectionConfig = SectionConfig;
type render_d_SliceConfig = SliceConfig;
type render_d_SliceRenderer = SliceRenderer;
declare const render_d_SliceRenderer: typeof SliceRenderer;
type render_d_SlicePipelineLayout = SlicePipelineLayout;
type render_d_Size3DDict = Size3DDict;
type render_d_VoxelBuffer = VoxelBuffer;
declare const render_d_createVoxelBuffer: typeof createVoxelBuffer;
declare namespace render_d {
  export {
    render_d_GPU as GPU,
    render_d_SliceRendererOption as SliceRendererOption,
    render_d_SliceFacing as SliceFacing,
    render_d_EyeOffset as EyeOffset,
    render_d_TetraSlicePipelineDescriptor as TetraSlicePipelineDescriptor,
    render_d_RaytracingPipelineDescriptor as RaytracingPipelineDescriptor,
    render_d_GeneralShaderState as GeneralShaderState,
    render_d_TetraVertexState as TetraVertexState,
    render_d_TetraSlicePipeline as TetraSlicePipeline,
    render_d_RaytracingPipeline as RaytracingPipeline,
    render_d_SectionConfig as SectionConfig,
    render_d_SliceConfig as SliceConfig,
    render_d_SliceRenderer as SliceRenderer,
    render_d_SlicePipelineLayout as SlicePipelineLayout,
    render_d_Size3DDict as Size3DDict,
    render_d_VoxelBuffer as VoxelBuffer,
    render_d_createVoxelBuffer as createVoxelBuffer,
  };
}

interface IndexMesh extends FaceIndexMeshData {
    positionIndex?: Uint32Array;
    normalIndex?: Uint32Array;
    uvwIndex?: Uint32Array;
    count?: number;
}
declare class ObjFile {
    data: string;
    constructor(data: string | TetraIndexMesh | FaceIndexMesh);
    private stringify;
    parse(): IndexMesh;
}

type mesh_d_FaceMesh = FaceMesh;
declare const mesh_d_FaceMesh: typeof FaceMesh;
type mesh_d_FaceIndexMesh = FaceIndexMesh;
declare const mesh_d_FaceIndexMesh: typeof FaceIndexMesh;
type mesh_d_TetraMesh = TetraMesh;
declare const mesh_d_TetraMesh: typeof TetraMesh;
type mesh_d_TetraIndexMesh = TetraIndexMesh;
declare const mesh_d_TetraIndexMesh: typeof TetraIndexMesh;
type mesh_d_FaceMeshData = FaceMeshData;
type mesh_d_FaceIndexMeshData = FaceIndexMeshData;
type mesh_d_TetraMeshData = TetraMeshData;
type mesh_d_TetraIndexMeshData = TetraIndexMeshData;
type mesh_d_ObjFile = ObjFile;
declare const mesh_d_ObjFile: typeof ObjFile;
declare namespace mesh_d {
  export {
    face_d as face,
    tetra_d as tetra,
    mesh_d_FaceMesh as FaceMesh,
    mesh_d_FaceIndexMesh as FaceIndexMesh,
    mesh_d_TetraMesh as TetraMesh,
    mesh_d_TetraIndexMesh as TetraIndexMesh,
    mesh_d_FaceMeshData as FaceMeshData,
    mesh_d_FaceIndexMeshData as FaceIndexMeshData,
    mesh_d_TetraMeshData as TetraMeshData,
    mesh_d_TetraIndexMeshData as TetraIndexMeshData,
    mesh_d_ObjFile as ObjFile,
  };
}

interface IController {
    update(state: ControllerState): void;
    enabled: boolean;
}
interface ControllerConfig {
    preventDefault?: boolean;
    enablePointerLock?: boolean;
}
interface KeyConfig {
    enable?: string;
    disable?: string;
}
interface ControllerState {
    currentKeys: Map<String, KeyState>;
    /** holded mouse button */
    currentBtn: number;
    /** pressed mouse button */
    mouseDown: number;
    /** released mouse button */
    mouseUp: number;
    updateCount: number;
    moveX: number;
    moveY: number;
    wheelX: number;
    wheelY: number;
    lastUpdateTime?: number;
    mspf: number;
    requestPointerLock: () => void;
    enablePointerLock?: boolean;
    /** PointerLock has been triggered by the mouse */
    isPointerLockedMouseDown?: boolean;
    /** PointerLock has been canceled by key escape */
    isPointerLockEscaped?: boolean;
    /** code:
     *  'KeyA' for holding Key A
     *  '.KeyA' for pressing Key A
     *  'ControlLeft+.KeyA' for press A while holding CtrlLeft*/
    isKeyHold: (code: string) => boolean;
    /** query whether controller disabled by config, disable / enable keys */
    queryDisabled: (config: KeyConfig) => boolean;
    isPointerLocked: () => boolean;
    exitPointerLock: () => void;
}
declare enum KeyState {
    NONE = 0,
    UP = 1,
    HOLD = 2,
    DOWN = 3
}
declare class ControllerRegistry {
    dom: HTMLElement;
    ctrls: Iterable<IController>;
    enablePointerLock: boolean;
    readonly states: ControllerState;
    /** if this is true, prevent default will not work  */
    disableDefaultEvent: boolean;
    private prevIsPointerLocked;
    private evMouseDown;
    private evMouseUp;
    private evMouseMove;
    private evWheel;
    private evKeyUp;
    private evKeyDown;
    private evContextMenu;
    constructor(dom: HTMLElement, ctrls: Iterable<IController>, config?: ControllerConfig);
    unregist(): void;
    update(): void;
}
declare class TrackBallController implements IController {
    enabled: boolean;
    object: Obj4;
    mouseSpeed: number;
    wheelSpeed: number;
    damp: number;
    mouseButton3D: number;
    mouseButtonRoll: number;
    mouseButton4D: number;
    /** how many update cycles (2^n) to normalise rotor to avoid accuracy problem */
    normalisePeriodBit: 4;
    keyConfig: {
        disable: string;
        enable: string;
    };
    private _bivec;
    private normalisePeriodMask;
    constructor(object?: Obj4);
    update(state: ControllerState): void;
    lookAtCenter(): void;
}
declare class FreeFlyController implements IController {
    enabled: boolean;
    swapMouseYWithScrollY: boolean;
    object: Obj4;
    mouseSpeed: number;
    wheelSpeed: number;
    keyMoveSpeed: number;
    keyRotateSpeed: number;
    damp: number;
    constructor(object?: Obj4);
    keyConfig: {
        front: string;
        back: string;
        left: string;
        right: string;
        ana: string;
        kata: string;
        up: string;
        down: string;
        turnLeft: string;
        turnRight: string;
        turnAna: string;
        turnKata: string;
        turnUp: string;
        turnDown: string;
        spinCW: string;
        spinCCW: string;
        rollCW: string;
        rollCCW: string;
        pitchCW: string;
        pitchCCW: string;
        disable: string;
        enable: string;
    };
    /** how many update cycles (2^n) to normalise rotor to avoid accuracy problem */
    normalisePeriodBit: 4;
    private _bivec;
    private _bivecKey;
    private _moveVec;
    private _vec;
    private normalisePeriodMask;
    update(state: ControllerState): void;
}
declare class KeepUpController implements IController {
    enabled: boolean;
    object: Obj4;
    mouseSpeed: number;
    wheelSpeed: number;
    keyMoveSpeed: number;
    keyRotateSpeed: number;
    damp: number;
    keyConfig: {
        front: string;
        back: string;
        left: string;
        right: string;
        ana: string;
        kata: string;
        up: string;
        down: string;
        turnLeft: string;
        turnRight: string;
        turnAna: string;
        turnKata: string;
        turnUp: string;
        turnDown: string;
        spinCW: string;
        spinCCW: string;
        disable: string;
        enable: string;
    };
    /** how many update cycles (2^n) to normalise rotor to avoid accuracy problem */
    normalisePeriodBit: 4;
    private _bivec;
    private _bivec2;
    private _bivecKey;
    private _moveVec;
    private _vec;
    private normalisePeriodMask;
    private horizontalRotor;
    private verticalRotor;
    constructor(object?: Obj4);
    updateObj(): void;
    update(state: ControllerState): void;
}
declare class VoxelViewerController implements IController {
    enabled: boolean;
    object: Obj4;
    mouseSpeed: number;
    wheelSpeed: number;
    damp: number;
    mousePan: number;
    mousePanZ: number;
    mouseRotate: number;
    /** how many update cycles (2^n) to normalise rotor to avoid accuracy problem */
    normalisePeriodBit: 4;
    keyConfig: {
        disable: string;
        enable: string;
    };
    private _bivec;
    private _vec;
    private _wy;
    private normalisePeriodMask;
    constructor(object?: Obj4);
    update(state: ControllerState): void;
}
interface SectionPreset {
    retina: boolean;
    eye1: SectionConfig[];
    eye2: SectionConfig[];
}
declare namespace sliceconfig {
    function singlezslice1eye(screenSize: {
        width: number;
        height: number;
    }): SectionConfig[];
    function singlezslice2eye(screenSize: {
        width: number;
        height: number;
    }): SectionConfig[];
    function singleyslice1eye(screenSize: {
        width: number;
        height: number;
    }): SectionConfig[];
    function singleyslice2eye(screenSize: {
        width: number;
        height: number;
    }): SectionConfig[];
    function zslices1eye(step: number, maxpos: number, screenSize: {
        width: number;
        height: number;
    }): SectionConfig[];
    function zslices2eye(step: number, maxpos: number, screenSize: {
        width: number;
        height: number;
    }): SectionConfig[];
    function yslices1eye(step: number, maxpos: number, screenSize: {
        width: number;
        height: number;
    }): SectionConfig[];
    function yslices2eye(step: number, maxpos: number, screenSize: {
        width: number;
        height: number;
    }): SectionConfig[];
    function default2eye(size: number, screenSize: {
        width: number;
        height: number;
    }): SectionConfig[];
    function default1eye(size: number, screenSize: {
        width: number;
        height: number;
    }): SectionConfig[];
}
declare class RetinaController implements IController {
    enabled: boolean;
    renderer: SliceRenderer;
    mouseSpeed: number;
    wheelSpeed: number;
    keyMoveSpeed: number;
    keyRotateSpeed: number;
    opacityKeySpeed: number;
    fovKeySpeed: number;
    damp: number;
    mouseButton: number;
    retinaEyeOffset: number;
    sectionEyeOffset: number;
    maxSectionEyeOffset: number;
    minSectionEyeOffset: number;
    size: GPUExtent3DStrict;
    sectionPresets: (screenSize: {
        width: number;
        height: number;
    }) => {
        [label: string]: SectionPreset;
    };
    private currentSectionConfig;
    private rembemerLastLayers;
    private needResize;
    keyConfig: {
        enable: string;
        disable: string;
        addOpacity: string;
        subOpacity: string;
        addLayer: string;
        subLayer: string;
        addRetinaResolution: string;
        subRetinaResolution: string;
        addFov: string;
        subFov: string;
        toggle3D: string;
        addEyes3dGap: string;
        subEyes3dGap: string;
        addEyes4dGap: string;
        subEyes4dGap: string;
        negEyesGap: string;
        toggleCrosshair: string;
        rotateLeft: string;
        rotateRight: string;
        rotateUp: string;
        rotateDown: string;
        refaceFront: string;
        sectionConfigs: {
            "retina+sections": string;
            "retina+bigsections": string;
            retina: string;
            sections: string;
            zsection: string;
            ysection: string;
            "retina+zslices": string;
            "retina+yslices": string;
        };
    };
    constructor(r: SliceRenderer);
    private _vec2damp;
    private _vec2euler;
    private _vec3;
    private _q1;
    private _q2;
    private _mat4;
    private refacingFront;
    private needsUpdateRetinaCamera;
    private retinaFov;
    private retinaSize;
    private retinaZDistance;
    private crossHairSize;
    maxRetinaResolution: number;
    update(state: ControllerState): void;
    setStereo(stereo: boolean): void;
    setSectionEyeOffset(offset: number): void;
    setRetinaEyeOffset(offset: number): void;
    setLayers(layers: number): void;
    setOpacity(opacity: number): void;
    setCrosshairSize(size: number): void;
    setRetinaResolution(retinaResolution: number): void;
    setRetinaSize(size: number): void;
    setRetinaFov(fov: number): void;
    toggleSectionConfig(index: string): void;
    setSize(size: GPUExtent3DStrict): void;
}

type ctrl_d_IController = IController;
type ctrl_d_ControllerState = ControllerState;
type ctrl_d_KeyState = KeyState;
declare const ctrl_d_KeyState: typeof KeyState;
type ctrl_d_ControllerRegistry = ControllerRegistry;
declare const ctrl_d_ControllerRegistry: typeof ControllerRegistry;
type ctrl_d_TrackBallController = TrackBallController;
declare const ctrl_d_TrackBallController: typeof TrackBallController;
type ctrl_d_FreeFlyController = FreeFlyController;
declare const ctrl_d_FreeFlyController: typeof FreeFlyController;
type ctrl_d_KeepUpController = KeepUpController;
declare const ctrl_d_KeepUpController: typeof KeepUpController;
type ctrl_d_VoxelViewerController = VoxelViewerController;
declare const ctrl_d_VoxelViewerController: typeof VoxelViewerController;
declare const ctrl_d_sliceconfig: typeof sliceconfig;
type ctrl_d_RetinaController = RetinaController;
declare const ctrl_d_RetinaController: typeof RetinaController;
declare namespace ctrl_d {
  export {
    ctrl_d_IController as IController,
    ctrl_d_ControllerState as ControllerState,
    ctrl_d_KeyState as KeyState,
    ctrl_d_ControllerRegistry as ControllerRegistry,
    ctrl_d_TrackBallController as TrackBallController,
    ctrl_d_FreeFlyController as FreeFlyController,
    ctrl_d_KeepUpController as KeepUpController,
    ctrl_d_VoxelViewerController as VoxelViewerController,
    ctrl_d_sliceconfig as sliceconfig,
    ctrl_d_RetinaController as RetinaController,
  };
}

declare namespace util_d {
  export {
    ctrl_d as ctrl,
  };
}

export { four_d as four, math_d as math, mesh_d as mesh, physics_d as physics, render_d as render, util_d as util };
