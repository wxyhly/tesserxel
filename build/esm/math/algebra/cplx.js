class Complex {
    re;
    im;
    static i = new Complex(0, 1);
    constructor(re = 0, im = 0) {
        this.re = re;
        this.im = im;
    }
    flat() {
        return [this.re, this.im];
    }
    set(v) {
        this.re = v.re;
        this.im = v.im;
        return this;
    }
    setv(v) {
        this.re = v.x;
        this.im = v.y;
        return this;
    }
    clone() {
        return new Complex(this.re, this.im);
    }
    add(v2) {
        return new Complex(this.re + v2.re, this.im + v2.im);
    }
    addf(v2) {
        return new Complex(this.re + v2, this.im);
    }
    adds(v2) {
        this.re += v2.re;
        this.im += v2.im;
        return this;
    }
    addfs(v2) {
        this.re += v2;
        return this;
    }
    neg() {
        return new Complex(-this.re, -this.im);
    }
    negs() {
        this.re = -this.re;
        this.im = -this.im;
        return this;
    }
    sub(v2) {
        return new Complex(this.re - v2.re, this.im - v2.im);
    }
    subf(v2) {
        return new Complex(this.re - v2, this.im);
    }
    subs(v2) {
        this.re -= v2.re;
        this.im -= v2.im;
        return this;
    }
    subfs(v2) {
        this.re -= v2;
        return this;
    }
    mulf(v2) {
        return new Complex(this.re * v2, this.im * v2);
    }
    mulfs(v2) {
        this.re *= v2;
        this.im *= v2;
        return this;
    }
    mul(k) {
        return new Complex(this.re * k.re - k.im * this.im, this.re * k.im + k.re * this.im);
    }
    muls(k) {
        let re = this.re * k.re - k.im * this.im;
        this.im = this.re * k.im + k.re * this.im;
        this.re = re;
        return this;
    }
    divf(v2) {
        v2 = 1 / v2;
        return new Complex(this.re * v2, this.im * v2);
    }
    divfs(v2) {
        v2 = 1 / v2;
        this.re *= v2;
        this.im *= v2;
        return this;
    }
    div(k) {
        let n = 1 / (k.re * k.re + k.im * k.im);
        return new Complex((this.re * k.re + k.im * this.im) * n, (k.re * this.im - this.re * k.im) * n);
    }
    divs(k) {
        let n = 1 / (k.re * k.re + k.im * k.im);
        let im = (k.re * this.im - this.re * k.im) * n;
        this.re = (this.re * k.re + k.im * this.im) * n;
        this.im = im;
        return this;
    }
    dot(v2) {
        return this.re * v2.re + this.im * v2.im;
    }
    norm() {
        return Math.sqrt(this.re * this.re + this.im * this.im);
    }
    norms() {
        let v2 = Math.sqrt(this.re * this.re + this.im * this.im);
        v2 = v2 == 0 ? 0 : (1 / v2);
        this.re *= v2;
        this.im *= v2;
        return this;
    }
    normsqr() {
        return this.re * this.re + this.im * this.im;
    }
    conj() {
        return new Complex(this.re, -this.im);
    }
    conjs() {
        this.im = -this.im;
        return this;
    }
    exp() {
        let r = Math.exp(this.re);
        return new Complex(Math.cos(this.im) * r, Math.sin(this.im) * r);
    }
    exps() {
        let r = Math.exp(this.re);
        this.re = Math.cos(this.im) * r;
        this.im = Math.sin(this.im) * r;
        return this;
    }
    arg() {
        return Math.atan2(this.im, this.re);
    }
    log() {
        return new Complex(Math.log(this.re * this.re + this.im * this.im) / 2, Math.atan2(this.im, this.re));
    }
    logs() {
        let a = Math.atan2(this.im, this.re);
        this.re = Math.log(this.re * this.re + this.im * this.im) / 2;
        this.im = a;
        return this;
    }
    pow(p) {
        return this.log().muls(p).exps();
    }
    powf(n) {
        return this.log().mulfs(n).exps();
    }
    pows(p) {
        return this.logs().muls(p).exps();
    }
    powfs(n) {
        return this.logs().mulfs(n).exps();
    }
}
class CMat2 {
}

export { CMat2, Complex };
//# sourceMappingURL=cplx.js.map
