namespace tesserxel {
    export namespace math {
        export class Complex {
            re: number;
            im: number;
            static i = new Complex(0, 1);
            constructor(re: number = 0, im: number = 0) {
                this.re = re; this.im = im;
            }
            flat(): number[] {
                return [this.re, this.im];
            }
            set(v: Complex): Complex {
                this.re = v.re; this.im = v.im; return this;
            }
            setv(v: Vec2): Complex {
                this.re = v.x; this.im = v.y; return this;
            }
            clone(): Complex {
                return new Complex(this.re, this.im);
            }
            add(v2: Complex): Complex {
                return new Complex(this.re + v2.re, this.im + v2.im);
            }
            addf(v2: number): Complex {
                return new Complex(this.re + v2, this.im);
            }
            adds(v2: Complex): Complex {
                this.re += v2.re; this.im += v2.im; return this;
            }
            addfs(v2: number): Complex {
                this.re += v2; return this;
            }
            neg(): Complex {
                return new Complex(-this.re, -this.im);
            }
            negs(): Complex {
                this.re = - this.re; this.im = -this.im;
                return this;
            }
            sub(v2: Complex): Complex {
                return new Complex(this.re - v2.re, this.im - v2.im);
            }
            subf(v2: number): Complex {
                return new Complex(this.re - v2, this.im);
            }
            subs(v2: Complex): Complex {
                this.re -= v2.re; this.im -= v2.im; return this;
            }
            subfs(v2: number): Complex {
                this.re -= v2; return this;
            }
            mulf(v2: number): Complex {
                return new Complex(this.re * v2, this.im * v2);
            }
            mulfs(v2: number): Complex {
                this.re *= v2; this.im *= v2; return this;
            }
            mul(k: Complex): Complex {
                return new Complex(this.re * k.re - k.im * this.im, this.re * k.im + k.re * this.im);
            }
            muls(k: Complex): Complex {
                let re = this.re * k.re - k.im * this.im;
                this.im = this.re * k.im + k.re * this.im;
                this.re = re; return this;
            }
            divf(v2: number): Complex {
                v2 = 1 / v2;
                return new Complex(this.re * v2, this.im * v2);
            }
            divfs(v2: number): Complex {
                v2 = 1 / v2;
                this.re *= v2; this.im *= v2; return this;
            }
            div(k: Complex): Complex {
                let n = 1 / (k.re * k.re + k.im * k.im);
                return new Complex((this.re * k.re + k.im * this.im) * n, (k.re * this.im - this.re * k.im) * n);
            }
            divs(k: Complex): Complex {

                let n = 1 / (k.re * k.re + k.im * k.im);
                let im = (k.re * this.im - this.re * k.im) * n;
                this.re = (this.re * k.re + k.im * this.im) * n;
                this.im = im; return this;
            }
            dot(v2: Complex): number {
                return this.re * v2.re + this.im * v2.im;
            }
            norm(): number {
                return Math.sqrt(this.re * this.re + this.im * this.im);
            }
            norms(): Complex {
                let v2 = Math.sqrt(this.re * this.re + this.im * this.im);
                v2 = v2 == 0 ? 0 : (1 / v2);
                this.re *= v2; this.im *= v2; return this;
            }
            normsqr(): number {
                return this.re * this.re + this.im * this.im;
            }
            conj(): Complex {
                return new Complex(this.re, -this.im);
            }
            conjs(): Complex {
                this.im = -this.im; return this;
            }
            exp(): Complex {
                let r = Math.exp(this.re);
                return new Complex(Math.cos(this.im) * r, Math.sin(this.im) * r);
            }
            exps(): Complex {
                let r = Math.exp(this.re);
                this.re = Math.cos(this.im) * r;
                this.im = Math.sin(this.im) * r;
                return this;
            }
            arg(): number {
                return Math.atan2(this.im, this.re);
            }
            log(): Complex {
                return new Complex(
                    Math.log(this.re * this.re + this.im * this.im) / 2,
                    Math.atan2(this.im, this.re)
                );
            }
            logs(): Complex {
                let a = Math.atan2(this.im, this.re);
                this.re = Math.log(this.re * this.re + this.im * this.im) / 2;
                this.im = a;
                return this;
            }
            pow(p: Complex): Complex {
                return this.log().muls(p).exps();
            }
            powf(n: number): Complex {
                return this.log().mulfs(n).exps();
            }
            pows(p: Complex): Complex {
                return this.logs().muls(p).exps();
            }
            powfs(n: number): Complex {
                return this.logs().mulfs(n).exps();
            }
        }
        export class CMat2 {
            // todo PSL(2,C)
        }
    }
}