namespace tesserxel {
    export namespace math {
        /** [A(4x4), b(1x4)]
         * 
         *  [0(4x1), 1(1x1)]
         * 
         *  a blocked 5x5 matrix for transform in 4d
         */
        export class AffineMat4 {
            mat: Mat4;
            vec: Vec4;
            constructor(mat: Mat4 = new Mat4(), vec: Vec4 = new Vec4()) {
                this.mat = mat; this.vec = vec;
            }
            writeBuffer(b: Float32Array, offset: number = 0) {
                this.mat.writeBuffer(b,offset);
                this.vec.writeBuffer(b, offset + 16);
            }
            inv(): AffineMat4 {
                let m = this.mat.inv();
                return new AffineMat4(m, m.mulv(this.vec).negs());
            }
            invs(): AffineMat4 {
                this.mat.invs();
                this.vec.copy(this.mat.mulv(this.vec).negs());
                return this;
            }
            mul(m: AffineMat4): AffineMat4 {
                return new AffineMat4(this.mat.mul(m.mat), this.mat.mulv(m.vec).adds(this.vec));
            }
            muls(m: AffineMat4): AffineMat4 {
                this.vec.adds(this.mat.mulv(m.vec));
                this.mat.muls(m.mat);
                return this;
            }
        }
        /** an coordinate transform of rotation translation and scale */
        export class Obj4 {
            position: Vec4;
            rotation: Rotor;
            scale: Vec4;
            constructor(
                position: Vec4 = new Vec4(), rotation: Rotor = new Rotor(),
                scale?: Vec4
            ) {
                this.position = position;
                this.rotation = rotation;
                this.scale = scale;
            }
            local2parent(point: Vec4): Vec4 {
                if(this.scale)
                return new Vec4(
                    this.scale.x * point.x, this.scale.y * point.y,
                    this.scale.z * point.z, this.scale.w * point.w
                ).rotates(this.rotation).adds(this.position);
                
                return point.rotate(this.rotation).adds(this.position);
            }
            parent2local(point: Vec4): Vec4 {
                let a = point.sub(this.position).rotatesconj(this.rotation);
                if(this.scale) return new Vec4(
                    a.x / this.scale.x, a.y / this.scale.y,
                    a.z / this.scale.z, a.w / this.scale.w
                );
                return a;
            }
            getMat4(): Mat4 {
                if(this.scale)
                return this.rotation.toMat4().mul(
                    Mat4.diag(this.scale.x, this.scale.y, this.scale.z, this.scale.w)
                );
                return this.rotation.toMat4();
            }
            getMat4inv(): Mat4 {
                if(this.scale)
                return Mat4.diag(1 / this.scale.x, 1 / this.scale.y, 1 / this.scale.z, 1 / this.scale.w).mul(
                    this.rotation.conj().toMat4()
                );
                return this.rotation.conj().toMat4();
            }
            getAffineMat4(): AffineMat4 {
                if(this.scale)
                return new AffineMat4(this.rotation.toMat4().muls(
                    Mat4.diag(this.scale.x, this.scale.y, this.scale.z, this.scale.w)
                ), this.position.clone());
                return new AffineMat4(this.rotation.toMat4(), this.position.clone());
            }
            getAffineMat4inv(): AffineMat4 {
                let b = this.position.neg().rotatesconj(this.rotation);
                if(!this.scale) return new AffineMat4(
                    this.rotation.conj().toMat4()
                ,b);
                let x = 1 / this.scale.x;
                let y = 1 / this.scale.y;
                let z = 1 / this.scale.z;
                let w = 1 / this.scale.w;
                return new AffineMat4(Mat4.diag(x, y, z, w).muls(
                    this.rotation.conj().toMat4()
                ), new Vec4(b.x * x, b.y * y, b.z * z, b.w * w));
            }
            translates(v: Vec4): Obj4 {
                this.position.adds(v);
                return this;
            }
            rotates(r: Rotor): Obj4 {
                this.rotation.mulsl(r);
                return this;
            }
            rotatesAt(r: Rotor, center: Vec4 = new Vec4()): Obj4 {
                this.rotation.mulsl(r);
                this.position.subs(center).rotates(r).adds(center);
                return this;
            }
        }
    }
}