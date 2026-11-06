import * as tesserxel from "../../build/esm/tesserxel.js";

type Expr = (vars: Record<string, number>) => number;
type Tetra = [number, number, number, number];
type Vec4 = tesserxel.math.Vec4;
type CWMesh = tesserxel.mesh.CWMesh;

const math = tesserxel.math;
const tetraMesh = tesserxel.mesh.tetra;
const extraSafetyCoeff = 0.1;
// Mirrors Renderer defaults and its maximum-six-vertices-per-tetra estimate.
const maxTetraNumInOnePass = Math.floor(Math.floor((0x800000 >> (4 + 4)) / 6) / 0.08*extraSafetyCoeff);

type MathFnMode = "curve" | "surface" | "volume" | "implicit";
type ParameterRange = { min: number; max: number };
type MathFnRanges = Record<string, ParameterRange>;
type MathFnPreset = {
    name: { zh: string; en: string };
    mode: MathFnMode;
    expressions: string[];
    ranges: MathFnRanges;
    density: number | Record<string, number>;
    thickness?: number;
};
type ComplexImplicitRanges = Record<"x" | "y" | "u" | "v", ParameterRange>;
type ComplexPreset = {
    value: string;
    name: { zh: string; en: string };
    thickness: number;
    center?: { re: number; im: number };
    span?: number;
    density?: number;
    ranges?: ComplexImplicitRanges;
    xyDensity?: number;
    zwDensity?: number;
};

const functionPresets: {
    real: MathFnPreset[];
    complexExplicit: ComplexPreset[];
    complexImplicit: ComplexPreset[];
} = {
    real: [
        { mode: "curve", name: { zh: "四维三叶结", en: "4D Trefoil Knot" },
            expressions: ["cos(3*t)", "sin(3*t)", "cos(2*t)", "sin(2*t)"],
            ranges: { t: { min: 0, max: 2 * Math.PI } }, density: 80, thickness: 0.1 },
        { mode: "curve", name: { zh: "四维环面扭结", en: "4D Torus Knot" },
            expressions: ["cos(7*t)", "sin(7*t)", "cos(11*t)", "sin(11*t)"],
            ranges: { t: { min: 0, max: 2 * Math.PI } }, density: 120, thickness: 0.08 },
        { mode: "curve", name: { zh: "四维螺旋环面扭结", en: "4D Torus Knot" },
            expressions: ["cos(11*t)", "sin(11*t)", "cos(4*t)*(0.2+0.5*t)", "sin(4*t)*(0.2+0.5*t)"],
            ranges: { t: { min: 0, max: 4 * Math.PI } }, density: 240, thickness: 0.1 },
        { mode: "curve", name: { zh: "波浪线", en: "Wavy Line" },
            expressions: ["2*t", "sin(6.3*t)", "0.9*cos(5.6*t+1)", "0.8*sin(7*t+2.2)"],
            ranges: { t: { min: -5, max: 5 } }, density: 120, thickness: 0.2 },
        { mode: "surface", name: { zh: "平圆环", en: "Clifford Torus" },
            expressions: ["cos(u)/sqrt(2)", "sin(u)/sqrt(2)", "cos(v)/sqrt(2)", "sin(v)/sqrt(2)"],
            ranges: { u: { min: 0, max: 2 * Math.PI }, v: { min: 0, max: 2 * Math.PI } }, density: 36, thickness: 0.04 },
        { mode: "surface", name: { zh: "8字形克莱因瓶", en: "Figure-8 Klein Bottle" },
            expressions: ["(2+cos(v/2)*sin(u)-sin(v/2)*sin(2*u))*cos(v)",
                "(2+cos(v/2)*sin(u)-sin(v/2)*sin(2*u))*sin(v)",
                "sin(v/2)*sin(u)+cos(v/2)*sin(2*u)", "cos(u+v)"],
            ranges: { u: { min: 0, max: 2 * Math.PI }, v: { min: 0, max: 2 * Math.PI } }, density: 36, thickness: 0.1 },
        { mode: "surface", name: { zh: "扭转环面形克莱因瓶", en: "Twisted Torus Klein Bottle" },
            expressions: ["(1+0.35*cos(v))*cos(u)", "(1+0.35*cos(v))*sin(u)", "0.35*sin(v)*cos(u/2)", "0.35*sin(v)*sin(u/2)"],
            ranges: { u: { min: 0, max: 4 * Math.PI }, v: { min: 0, max: 2 * Math.PI } }, density: 48, thickness: 0.04 },
        { mode: "surface", name: { zh: "实射影平面", en: "Real Projective Plane" },
            expressions: [
                "8*u*v/(u*u+v*v+1)^2","4*v*(u*u+v*v-1)/(u*u+v*v+1)^2","4*u*(u*u+v*v-1)/(u*u+v*v+1)^2",                "4*(u*u-v*v)/(u*u+v*v+1)^2"
            ],
            ranges: { u: { min: -1, max: 1 }, v: { min: -1, max: 1 } }, density: 60, thickness: 0.03 },  
        { mode: "volume", name: { zh: "弯曲立方体", en: "Twisted Cube Cell" },
            expressions: ["u", "v", "t", "0.5*sin(pi*u)*sin(pi*v)*sin(pi*t)"],
            ranges: { u: { min: -1, max: 1 }, v: { min: -1, max: 1 }, t: { min: -1, max: 1 } }, density: 12 },
        { mode: "volume", name: { zh: "抛物胞", en: "4D Paraboloid" },
            expressions: ["u", "v", "t", "u*u+v*v+t*t"],
            ranges: { u: { min: -1, max: 1 }, v: { min: -1, max: 1 }, t: { min: -1, max: 1 } }, density: 12 },
        { mode: "volume", name: { zh: "马鞍胞", en: "4D Saddle" },
            expressions: ["u", "v", "t", "u*u-v*v+t*t"],
            ranges: { u: { min: -1, max: 1 }, v: { min: -1, max: 1 }, t: { min: -1, max: 1 } }, density: 12 },
        { mode: "volume", name: { zh: "猴鞍胞", en: "4D Monkey Saddle" },
            expressions: ["u", "v", "t", "u*u*u-3*u*v*v+t*t"],
            ranges: { u: { min: -1, max: 1 }, v: { min: -1, max: 1 }, t: { min: -1, max: 1 } }, density: 12 },
        { mode: "implicit", name: { zh: "光锥(球锥)", en: "Light Cone (Sphone)" },
            expressions: ["x^2+y^2+z^2-w^2"],
            ranges: { x: { min: -1.5, max: 1.5 }, y: { min: -1.5, max: 1.5 }, z: { min: -1.5, max: 1.5 }, w: { min: -1.5, max: 1.5 } }, density: 8 },
        { mode: "implicit", name: { zh: "双叶双曲胞", en: "4D Hyperboloid of 2 Sheets" },
            expressions: ["x^2+y^2+z^2-w^2+0.2"],
            ranges: { x: { min: -1.5, max: 1.5 }, y: { min: -1.5, max: 1.5 }, z: { min: -1.5, max: 1.5 }, w: { min: -1.5, max: 1.5 } }, density: 8 },
        { mode: "implicit", name: { zh: "单叶双曲胞", en: "4D Hyperboloid of 1 Sheet" },
            expressions: ["x^2+y^2+z^2-w^2-0.2"],
            ranges: { x: { min: -1.5, max: 1.5 }, y: { min: -1.5, max: 1.5 }, z: { min: -1.5, max: 1.5 }, w: { min: -1.5, max: 1.5 } }, density: 8 },
        { mode: "implicit", name: { zh: "平圆环双曲胞", en: " Clifford Hyperboloid" },
            expressions: ["x^2+y^2-z^2-w^2+0.2"],
            ranges: { x: { min: -1.5, max: 1.5 }, y: { min: -1.5, max: 1.5 }, z: { min: -1.5, max: 1.5 }, w: { min: -1.5, max: 1.5 } }, density: 8 },
        { mode: "implicit", name: { zh: "平圆环光锥", en: "Clifford Cone" },
            expressions: ["x^2+y^2-z^2-w^2"],
            ranges: { x: { min: -1.5, max: 1.5 }, y: { min: -1.5, max: 1.5 }, z: { min: -1.5, max: 1.5 }, w: { min: -1.5, max: 1.5 } }, density: 8 },
        { mode: "implicit", name: { zh: "Schwarz P曲胞", en: "4D Schwarz P" },
            expressions: ["cos(x)+cos(y)+cos(z)+cos(w)"],
            ranges: { x: { min: -4, max: 4 }, y: { min: -4, max: 4 }, z: { min: -4, max: 4 }, w: { min: -4, max: 4 } }, density: 10 },
        { mode: "implicit", name: { zh: "四维多裤衩", en: "4D Multi-sock" },
            expressions: ["x^2+y^2+z^2+w^2+2*(x*y*z+x*y*w+x*z*w+y*z*w)-1"],
            ranges: { x: { min: -1.5, max: 1.5 }, y: { min: -1.5, max: 1.5 }, z: { min: -1.5, max: 1.5 }, w: { min: -1.5, max: 1.5 } }, density: 12 },
        { mode: "implicit", name: { zh: "方形双圆环", en: "Cubic Tiger" },
            expressions: ["(max(abs(x),abs(y))-1)^2+(max(abs(z),abs(w))-1)^2-0.2"],
            ranges: { x: { min: -1.5, max: 1.5 }, y: { min: -1.5, max: 1.5 }, z: { min: -1.5, max: 1.5 }, w: { min: -1.5, max: 1.5 } }, density: 8 },
    ],
    complexExplicit: [
        { value: "z^2", name: { zh: "平方", en: "Square" }, center: { re: 0, im: 0 }, span: 4, density: 28, thickness: 0.06 },
        { value: "z^3", name: { zh: "立方", en: "Cube" }, center: { re: 0, im: 0 }, span: 4, density: 28, thickness: 0.06 },
        { value: "z^5-1.5*z^3+0.4*i*z", name: { zh: "五次多项式", en: "Quintic polynomial" }, center: { re: 0, im: 0 }, span: 4, density: 32, thickness: 0.05 },
        // { value: "1/z", name: { zh: "1/z", en: "1/z" }, center: { re: 0, im: 0 }, span: 4, density: 32, thickness: 0.05 },
        // { value: "1/z^5", name: { zh: "1/z⁵", en: "1/z⁵" }, center: { re: 0, im: 0 }, span: 4, density: 32, thickness: 0.05 },
        // { value: "(z^3-1)/(z^2+0.2)", name: { zh: "有理多项式", en: "Rational polynomial" }, center: { re: 0, im: 0 }, span: 4, density: 32, thickness: 0.05 },
        { value: "exp(z)", name: { zh: "指数函数", en: "Exponential" }, center: { re: 0, im: 0 }, span: 8, density: 32, thickness: 0.1 },
        { value: "sin(z)", name: { zh: "正弦函数", en: "Sine" }, center: { re: 0, im: 0 }, span: 4, density: 32, thickness: 0.05 },
        // { value: "2*z/3+1/(3*z^2)", name: { zh: "牛顿法：z³−1 第一步", en: "Newton: first step for z³−1" }, center: { re: 0, im: 0 }, span: 4, density: 36, thickness: 0.05 },
        { value: "(2*(2*z^3+1)^3+27*z^6)/(9*(2*z^3+1)^2*z^2)", name: { zh: "牛顿法：z³−1 第二步", en: "Newton: second step for z³−1" }, center: { re: 0, im: 0 }, span: 4, density: 36, thickness: 0.05 },
        { value: "z^4+(-0.8+1.2*i)*z^2+(-0.6+0.12*i)", name: { zh: "Julia：z²+c 第二步", en: "Julia: second step z²+c" }, center: { re: 0, im: 0 }, span: 4, density: 36, thickness: 0.05 },
        { value: "((((z^2+(-0.4+0.6*i))^2+(-0.4+0.6*i))^2+(-0.4+0.6*i))^2+(-0.4+0.6*i))^2+(-0.4+0.6*i)", name: { zh: "Julia：z²+c 第5步", en: "Julia: 5th step z²+c" }, center: { re: 0, im: 0 }, span: 4, density: 32, thickness: 0.05 },
        { value: "gamma(z)", name: { zh: "Gamma 函数", en: "Gamma function" }, center: { re: 0, im: 0 }, span: 8, density: 40, thickness: 0.04 }
    ],
    complexImplicit: [
        { value: "z1*z2-1", name: { zh: "z₂=1/z₁", en: "z₂=1/z₁" }, ranges: { x: { min: -2, max: 2 }, y: { min: -2, max: 2 }, u: { min: -2, max: 2 }, v: { min: -2, max: 2 } }, xyDensity: 16, zwDensity: 16, thickness: 0.06 },
        { value: "z1^5*z2-1", name: { zh: "z₂=1/z₁⁵", en: "z₂=1/z₁⁵" }, ranges: { x: { min: -2, max: 2 }, y: { min: -2, max: 2 }, u: { min: -2, max: 2 }, v: { min: -2, max: 2 } }, xyDensity: 16, zwDensity: 16, thickness: 0.06 },
        { value: "z1^2+z2^2+1", name: { zh: "z₁² + z₂² = 1", en: "z₁² + z₂² = 1" }, ranges: { x: { min: -2, max: 2 }, y: { min: -2, max: 2 }, u: { min: -2, max: 2 }, v: { min: -2, max: 2 } }, xyDensity: 16, zwDensity: 16, thickness: 0.06 },
        { value: "z2^2-z1^3+z1", name: { zh: "z₂² − z₁³ + z₁ = 0", en: "z₂² − z₁³ + z₁ = 0" }, ranges: { x: { min: -1.5, max: 1.5 }, y: { min: -1.5, max: 1.5 }, u: { min: -2, max: 2 }, v: { min: -2, max: 2 } }, xyDensity: 12, zwDensity: 12, thickness: 0.06 },
        { value: "z1^5+z2^5", name: { zh: "z₁⁵ + z₂⁵ = 0", en: "z₁⁵ + z₂⁵ = 0" }, ranges: { x: { min: -1.5, max: 1.5 }, y: { min: -1.5, max: 1.5 }, u: { min: -1.5, max: 1.5 }, v: { min: -1.5, max: 1.5 } }, xyDensity: 16, zwDensity: 16, thickness: 0.06 },
        { value: "z1^3+z2^3+1", name: { zh: "z₁³ + z₂³ = 1", en: "z₁³ + z₂³ = 1" }, ranges: { x: { min: -1.5, max: 1.5 }, y: { min: -1.5, max: 1.5 }, u: { min: -1.5, max: 1.5 }, v: { min: -1.5, max: 1.5 } }, xyDensity: 10, zwDensity: 10, thickness: 0.05 },
        { value: "z1^5+z2^5+1", name: { zh: "z₁⁵ + z₂⁵ = 1", en: "z₁⁵ + z₂⁵ = 1" }, ranges: { x: { min: -1.2, max: 1.2 }, y: { min: -1.2, max: 1.2 }, u: { min: -1.2, max: 1.2 }, v: { min: -1.2, max: 1.2 } }, xyDensity: 12, zwDensity: 12, thickness: 0.04 },
        { value: "z1^5+z2^4+1", name: { zh: "z₁⁵ + z₂⁴ = 1", en: "z₁⁵ + z₂⁴ = 1" }, ranges: { x: { min: -1.5, max: 1.5 }, y: { min: -1.5, max: 1.5 }, u: { min: -1.2, max: 1.2 }, v: { min: -1.2, max: 1.2 } }, xyDensity: 12, zwDensity: 12, thickness: 0.04 },
        { value: "sin(z1*z2)-1", name: { zh: "sin(z₁z₂) = 1", en: "sin(z₁z₂) = 1" }, ranges: { x: { min: -2.8, max: 2.8 }, y: { min: -2.8, max: 2.8 }, u: { min: -2.8, max: 2.8 }, v: { min: -2.8, max: 2.8 } }, xyDensity: 24, zwDensity: 24, thickness: 0.1 },
        { value: "sin(z1)*sin(z2)-1", name: { zh: "sin(z₁)sin(z₂) = 1", en: "sin(z₁)sin(z₂) = 1" }, ranges: { x: { min: -4, max: 4 }, y: { min: -4, max: 4 }, u: { min: -4, max: 4 }, v: { min: -4, max: 4 } }, xyDensity: 12, zwDensity: 12, thickness: 0.1 },
        // { value: "(2*(2*z1^3+1)^3+27*z1^6)-(9*(2*z1^3+1)^2*z1^2)*z2", name: { zh: "牛顿法：z³−1 第二步", en: "Newton: second step for z³−1" }, ranges: { x: { min: -4, max: 4 }, y: { min: -4, max: 4 }, u: { min: -4, max: 4 }, v: { min: -4, max: 4 } }, xyDensity: 12, zwDensity: 12, thickness: 0.1 },
    ]
};

function splitTetraMesh(mesh: tesserxel.mesh.TetraMesh) {
    if (mesh.position.length % 16 !== 0) {
        throw new Error("Tetra mesh position buffer length must be divisible by 16");
    }
    if ((mesh.normal && mesh.normal.length !== mesh.position.length) ||
        (mesh.uvw && mesh.uvw.length !== mesh.position.length)) {
        throw new Error("Tetra mesh attribute buffers must match the position buffer length");
    }
    const tetraCount = mesh.position.length / 16;
    if (tetraCount <= maxTetraNumInOnePass) return [mesh];
    const chunks: tesserxel.mesh.TetraMesh[] = [];
    for (let first = 0; first < tetraCount; first += maxTetraNumInOnePass) {
        const last = Math.min(tetraCount, first + maxTetraNumInOnePass);
        const from = first * 16;
        const to = last * 16;
        const chunk = new tesserxel.mesh.TetraMesh({
            position: mesh.position.slice(from, to),
            count: last - first
        });
        if (mesh.normal) chunk.normal = mesh.normal.slice(from, to);
        if (mesh.uvw) chunk.uvw = mesh.uvw.slice(from, to);
        chunks.push(chunk);
    }
    return chunks;
}

function createTetraMeshObjects(
    mesh: tesserxel.mesh.TetraMesh,
    material: tesserxel.four.Material
) {
    return splitTetraMesh(mesh).map(part =>
        new tesserxel.four.Mesh(new tesserxel.four.Geometry(part), material)
    );
}

function isChinese(language?: string) {
    const lang = language ?? new URLSearchParams(location.search).get("lang")
        ?? (navigator.languages.join(",").includes("zh") ? "zh" : "en");
    return lang.toLowerCase().startsWith("zh");
}

function localizedError(zh: boolean, chinese: string, english: string) {
    return new Error(zh ? chinese : english);
}

class ExpressionParser {
    private tokens: string[];
    private index = 0;

    constructor(source: string, private zh = isChinese()) {
        this.tokens = source.match(/\s*(?:(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?|[A-Za-z_]\w*|[()+\-*/^,])/g)
            ?.map(token => token.trim()) ?? [];
        const compact = source.replace(/\s+/g, "");
        if (this.tokens.join("") !== compact) {
            throw localizedError(this.zh, `无法识别的表达式字符：${source}`, `Unrecognized character in expression: ${source}`);
        }
        if (!this.tokens.length) throw localizedError(this.zh, "表达式不能为空", "Expression cannot be empty");
    }

    parse(): Expr {
        const expression = this.additive();
        if (this.peek() !== undefined) {
            throw localizedError(this.zh, `多余的表达式内容：${this.peek()}`, `Unexpected expression content: ${this.peek()}`);
        }
        return expression;
    }

    private peek() { return this.tokens[this.index]; }
    private take() { return this.tokens[this.index++]; }
    private expect(token: string) {
        if (this.take() !== token) {
            throw localizedError(this.zh, `表达式中缺少 ${token}`, `Expected ${token} in expression`);
        }
    }

    private additive(): Expr {
        let left = this.multiplicative();
        while (this.peek() === "+" || this.peek() === "-") {
            const op = this.take();
            const right = this.multiplicative();
            const prev = left;
            left = op === "+"
                ? vars => prev(vars) + right(vars)
                : vars => prev(vars) - right(vars);
        }
        return left;
    }

    private multiplicative(): Expr {
        let left = this.unary();
        while (this.peek() === "*" || this.peek() === "/") {
            const op = this.take();
            const right = this.unary();
            const prev = left;
            left = op === "*"
                ? vars => prev(vars) * right(vars)
                : vars => prev(vars) / right(vars);
        }
        return left;
    }

    private unary(): Expr {
        if (this.peek() === "+") {
            this.take();
            return this.unary();
        }
        if (this.peek() === "-") {
            this.take();
            const inner = this.unary();
            return vars => -inner(vars);
        }
        return this.power();
    }

    private power(): Expr {
        const base = this.primary();
        if (this.peek() !== "^") return base;
        this.take();
        const exponent = this.unary();
        return vars => Math.pow(base(vars), exponent(vars));
    }

    private primary(): Expr {
        const token = this.take();
        if (token === undefined) throw localizedError(this.zh, "表达式不完整", "Incomplete expression");
        if (token === "(") {
            const inner = this.additive();
            this.expect(")");
            return inner;
        }
        if (/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(token)) {
            const value = Number(token);
            return () => value;
        }
        if (/^[A-Za-z_]\w*$/.test(token)) {
            if (this.peek() !== "(") {
                if (token === "pi") return () => Math.PI;
                if (token === "e") return () => Math.E;
                return vars => {
                    if (!(token in vars)) {
                        throw localizedError(this.zh, `未知变量：${token}`, `Unknown variable: ${token}`);
                    }
                    return vars[token];
                };
            }
            this.take();
            const arguments_: Expr[] = [this.additive()];
            while (this.peek() === ",") {
                this.take();
                arguments_.push(this.additive());
            }
            this.expect(")");
            const funcs: Record<string, (...values: number[]) => number> = {
                sin: Math.sin, cos: Math.cos, tan: Math.tan,
                sh: Math.sinh, ch: Math.cosh, th: Math.tanh,
                sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
                exp: Math.exp, ln: Math.log, log: Math.log,
                sqrt: Math.sqrt, abs: Math.abs, max: Math.max, min: Math.min
            };
            const fn = funcs[token];
            if (!fn) throw localizedError(this.zh, `不支持的函数：${token}`, `Unsupported function: ${token}`);
            if (token !== "max" && token !== "min" && arguments_.length !== 1) {
                throw localizedError(
                    this.zh,
                    `${token} 函数必须且只能有一个参数`,
                    `${token} requires exactly one argument`
                );
            }
            return vars => fn(...arguments_.map(argument => argument(vars)));
        }
        throw localizedError(this.zh, `表达式语法错误：${token}`, `Expression syntax error: ${token}`);
    }
}

type Complex = { re: number; im: number };
type ComplexExpr = (z: Complex, z2?: Complex) => Complex;

const complex = (re: number, im = 0): Complex => ({ re, im });
const complexAdd = (a: Complex, b: Complex) => complex(a.re + b.re, a.im + b.im);
const complexSub = (a: Complex, b: Complex) => complex(a.re - b.re, a.im - b.im);
const complexMul = (a: Complex, b: Complex) => complex(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
const complexDiv = (a: Complex, b: Complex) => {
    const denominator = b.re * b.re + b.im * b.im;
    return complex((a.re * b.re + a.im * b.im) / denominator, (a.im * b.re - a.re * b.im) / denominator);
};
const complexExp = (z: Complex) => {
    const magnitude = Math.exp(z.re);
    return complex(magnitude * Math.cos(z.im), magnitude * Math.sin(z.im));
};
const complexLog = (z: Complex) => complex(Math.log(Math.hypot(z.re, z.im)), Math.atan2(z.im, z.re));
const complexPow = (a: Complex, b: Complex) => {
    if (a.re === 0 && a.im === 0 && b.im === 0) {
        if (b.re > 0) return complex(0);
        if (b.re === 0) return complex(1);
    }
    return complexExp(complexMul(b, complexLog(a)));
};
const complexSin = (z: Complex) => complex(Math.sin(z.re) * Math.cosh(z.im), Math.cos(z.re) * Math.sinh(z.im));
const complexCos = (z: Complex) => complex(Math.cos(z.re) * Math.cosh(z.im), -Math.sin(z.re) * Math.sinh(z.im));
const complexSinh = (z: Complex) => complex(Math.sinh(z.re) * Math.cos(z.im), Math.cosh(z.re) * Math.sin(z.im));
const complexCosh = (z: Complex) => complex(Math.cosh(z.re) * Math.cos(z.im), Math.sinh(z.re) * Math.sin(z.im));
const complexSqrt = (z: Complex) => {
    const magnitude = Math.sqrt(Math.hypot(z.re, z.im));
    const angle = Math.atan2(z.im, z.re) / 2;
    return complex(magnitude * Math.cos(angle), magnitude * Math.sin(angle));
};
const complexGamma = (z: Complex): Complex => {
    const coefficients = [
        0.99999999999980993, 676.5203681218851, -1259.1392167224028,
        771.32342877765313, -176.61502916214059, 12.507343278686905,
        -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7
    ];
    if (z.re < 0.5) {
        const reflected = complexGamma(complexSub(complex(1), z));
        return complexDiv(complex(Math.PI), complexMul(complexSin(complexMul(complex(Math.PI), z)), reflected));
    }
    const shifted = complexSub(z, complex(1));
    let sum = complex(coefficients[0]);
    for (let i = 1; i < coefficients.length; i++) {
        sum = complexAdd(sum, complexDiv(complex(coefficients[i]), complexAdd(shifted, complex(i))));
    }
    const t = complexAdd(shifted, complex(7.5));
    return complexMul(
        complex(Math.sqrt(2 * Math.PI)),
        complexMul(complexPow(complexAdd(shifted, complex(0.5)), t), complexMul(complexExp(complex(-t.re, -t.im)), sum))
    );
};
const clampComplexMagnitude = (z: Complex, maxMagnitude: number): Complex => {
    let re = Number.isNaN(z.re) ? 0 : z.re;
    let im = Number.isNaN(z.im) ? 0 : z.im;
    if (!Number.isFinite(re)) re = Math.sign(re) * maxMagnitude;
    if (!Number.isFinite(im)) im = Math.sign(im) * maxMagnitude;
    const magnitude = Math.hypot(re, im);
    if (magnitude > maxMagnitude) {
        const scale = maxMagnitude / magnitude;
        re *= scale;
        im *= scale;
    } else if (magnitude === 0 && (Number.isNaN(z.re) || Number.isNaN(z.im))) {
        re = maxMagnitude;
    }
    return complex(re, im);
};

class ComplexExpressionParser {
    private tokens: string[];
    private index = 0;

    constructor(private source: string, private zh: boolean) {
        this.tokens = source.match(/\s*(?:(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?|[A-Za-z_]\w*|[()+\-*/^,])/g)
            ?.map(token => token.trim()) ?? [];
        if (this.tokens.join("") !== source.replace(/\s+/g, "")) {
            throw localizedError(zh, `无法识别的表达式字符：${source}`, `Unrecognized character in expression: ${source}`);
        }
        if (!this.tokens.length) throw localizedError(zh, "表达式不能为空", "Expression cannot be empty");
    }

    parse(): ComplexExpr {
        const expression = this.additive();
        if (this.peek() !== undefined) {
            throw localizedError(this.zh, `多余的表达式内容：${this.peek()}`, `Unexpected expression content: ${this.peek()}`);
        }
        return expression;
    }

    private peek() { return this.tokens[this.index]; }
    private take() { return this.tokens[this.index++]; }
    private expect(token: string) {
        if (this.take() !== token) throw localizedError(this.zh, `表达式中缺少 ${token}`, `Expected ${token} in expression`);
    }

    private additive(): ComplexExpr {
        let left = this.multiplicative();
        while (this.peek() === "+" || this.peek() === "-") {
            const op = this.take();
            const right = this.multiplicative();
            const previous = left;
            left = op === "+"
                ? (z, z2) => complexAdd(previous(z, z2), right(z, z2))
                : (z, z2) => complexSub(previous(z, z2), right(z, z2));
        }
        return left;
    }

    private multiplicative(): ComplexExpr {
        let left = this.unary();
        while (this.peek() === "*" || this.peek() === "/") {
            const op = this.take();
            const right = this.unary();
            const previous = left;
            left = op === "*"
                ? (z, z2) => complexMul(previous(z, z2), right(z, z2))
                : (z, z2) => complexDiv(previous(z, z2), right(z, z2));
        }
        return left;
    }

    private unary(): ComplexExpr {
        if (this.peek() === "+") {
            this.take();
            return this.unary();
        }
        if (this.peek() === "-") {
            this.take();
            const inner = this.unary();
            return (z, z2) => complex(-inner(z, z2).re, -inner(z, z2).im);
        }
        return this.power();
    }

    private power(): ComplexExpr {
        const base = this.primary();
        if (this.peek() !== "^") return base;
        this.take();
        const exponent = this.unary();
        return (z, z2) => complexPow(base(z, z2), exponent(z, z2));
    }

    private primary(): ComplexExpr {
        const token = this.take();
        if (token === undefined) throw localizedError(this.zh, "表达式不完整", "Incomplete expression");
        if (token === "(") {
            const inner = this.additive();
            this.expect(")");
            return inner;
        }
        if (/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(token)) {
            const value = Number(token);
            return () => complex(value);
        }
        if (/^[A-Za-z_]\w*$/.test(token)) {
            if (this.peek() !== "(") {
                if (token === "z" || token === "z1") return z => z;
                if (token === "z2") return (_, z2 = complex(0)) => z2;
                if (token === "i") return () => complex(0, 1);
                if (token === "pi") return () => complex(Math.PI);
                if (token === "e") return () => complex(Math.E);
                throw localizedError(this.zh, `未知变量：${token}；复函数只支持变量 z 或 z1、z2`, `Unknown variable: ${token}; complex functions support z or z1 and z2`);
            }
            this.take();
            const argument = this.additive();
            this.expect(")");
            const funcs: Record<string, (z: Complex) => Complex> = {
                sin: complexSin,
                cos: complexCos,
                tan: z => complexDiv(complexSin(z), complexCos(z)),
                sh: complexSinh,
                sinh: complexSinh,
                ch: complexCosh,
                cosh: complexCosh,
                th: z => complexDiv(complexSinh(z), complexCosh(z)),
                tanh: z => complexDiv(complexSinh(z), complexCosh(z)),
                exp: complexExp,
                ln: complexLog,
                log: complexLog,
                sqrt: complexSqrt,
                gamma: complexGamma
            };
            const fn = funcs[token];
            if (!fn) throw localizedError(this.zh, `不支持的函数：${token}`, `Unsupported function: ${token}`);
            return (z, z2) => fn(argument(z, z2));
        }
        throw localizedError(this.zh, `表达式语法错误：${token}`, `Expression syntax error: ${token}`);
    }
}

function evalVec4(exprs: Expr[], vars: Record<string, number>) {
    const values = exprs.map(expr => expr(vars));
    if (values.some(value => !Number.isFinite(value))) {
        throw localizedError(isChinese(), "函数在当前参数位置产生了非有限值；请检查定义域", "The function produced a non-finite value at this parameter; check its domain");
    }
    return new math.Vec4(values[0], values[1], values[2], values[3]);
}

function key2(a: number, b: number) {
    return a < b ? `${a},${b}` : `${b},${a}`;
}

function key3(a: number, b: number, c: number) {
    return [a, b, c].sort((x, y) => x - y).join(",");
}

function makeTetraCWMesh(vertices: Vec4[], cells: Tetra[]): CWMesh {
    if (!cells.length) throw localizedError(isChinese(), "函数没有生成可渲染的三维胞", "The function did not generate any renderable 3D cells");
    const cwmesh = new tesserxel.mesh.CWMesh();
    cwmesh.data[0] = vertices;
    cwmesh.data[1] = [];
    cwmesh.data[2] = [];
    cwmesh.data[3] = [];
    const edges = cwmesh.data[1] as number[][];
    const faces = cwmesh.data[2] as number[][];
    const tetrahedra = cwmesh.data[3] as number[][];
    const edgeIds = new Map<string, number>();
    const faceIds = new Map<string, number>();
    const edgeId = (a: number, b: number) => {
        const key = key2(a, b);
        let id = edgeIds.get(key);
        if (id === undefined) {
            id = edges.length;
            edges.push(a < b ? [a, b] : [b, a]);
            edgeIds.set(key, id);
        }
        return id;
    };
    const faceId = (a: number, b: number, c: number) => {
        const key = key3(a, b, c);
        let id = faceIds.get(key);
        if (id === undefined) {
            id = faces.length;
            faces.push([edgeId(a, b), edgeId(b, c), edgeId(c, a)]);
            faceIds.set(key, id);
        }
        return id;
    };
    for (const [a, b, c, d] of cells) {
        tetrahedra.push([
            faceId(a, b, c), faceId(a, b, d),
            faceId(a, c, d), faceId(b, c, d)
        ]);
    }
    for (let i = 0; i < cwmesh.data[2].length; i++) cwmesh.calculateOrientationInFace(2, i);
    for (let i = 0; i < cwmesh.data[3].length; i++) cwmesh.calculateOrientationInFace(3, i);
    cwmesh.calculateOrientation(3);
    return cwmesh;
}

function permutations(values: number[]): number[][] {
    if (values.length <= 1) return [values.slice()];
    const result: number[][] = [];
    for (let i = 0; i < values.length; i++) {
        const head = values[i];
        const tail = values.filter((_, j) => i !== j);
        for (const rest of permutations(tail)) result.push([head, ...rest]);
    }
    return result;
}

function gridIndex(i: number, j: number, k: number, ny: number, nz: number) {
    return (i * (ny + 1) + j) * (nz + 1) + k;
}

function buildCurve(exprs: Expr[], resolution: number, range: { min: number; max: number }, thickness: number) {
    const pointCount = Math.max(2, resolution);
    const points: Vec4[] = [];
    const derives: Vec4[] = [];
    for (let i = 0; i <= pointCount; i++) {
        const t = range.min + i / pointCount * (range.max - range.min);
        points.push(evalVec4(exprs, { t }));
    }
    for (let i = 0; i <= pointCount; i++) {
        const before = points[Math.max(0, i - 1)];
        const after = points[Math.min(pointCount, i + 1)];
        derives.push(after.sub(before).mulfs(i === 0 || i === pointCount ? 1 : 0.5));
    }
    const spline = new math.Spline(points, derives);
    const section = tesserxel.mesh.face.sphere(thickness, 8, 8);
    const mesh = tetraMesh.loft(spline, section, 3);
    mesh.normal = undefined;
    return mesh.generateNormal();
}

function buildSurface(
    exprs: Expr[], density: { u: number; v: number },
    ranges: { u: { min: number; max: number }; v: { min: number; max: number } }, thickness: number
) {
    const nU = Math.max(2, density.u);
    const nV = Math.max(2, density.v);
    const sideV = nV + 1;
    const vertices: Vec4[] = [];
    const tangentU: Vec4[] = [];
    const tangentV: Vec4[] = [];
    const du = (ranges.u.max - ranges.u.min) / nU;
    const dv = (ranges.v.max - ranges.v.min) / nV;
    const derivativeStepU = Math.abs(du) * 0.1;
    const derivativeStepV = Math.abs(dv) * 0.1;
    const point = (u: number, v: number) => evalVec4(exprs, { u, v });
    for (let i = 0; i <= nU; i++) {
        const u = ranges.u.min + i * du;
        for (let j = 0; j <= nV; j++) {
            const v = ranges.v.min + j * dv;
            vertices.push(point(u, v));
            const u0 = Math.max(Math.min(ranges.u.min, ranges.u.max), u - derivativeStepU);
            const u1 = Math.min(Math.max(ranges.u.min, ranges.u.max), u + derivativeStepU);
            const v0 = Math.max(Math.min(ranges.v.min, ranges.v.max), v - derivativeStepV);
            const v1 = Math.min(Math.max(ranges.v.min, ranges.v.max), v + derivativeStepV);
            tangentU.push(point(u1, v).sub(point(u0, v)).divfs(u1 - u0));
            tangentV.push(point(u, v1).sub(point(u, v0)).divfs(v1 - v0));
        }
    }
    const n1: Vec4[] = [];
    const n2: Vec4[] = [];
    for (let i = 0; i <= nU; i++) {
        for (let j = 0; j <= nV; j++) {
            const id = i * sideV + j;
            const tangentLength = tangentU[id].norm();
            const t1 = tangentU[id].clone().norms();
            const tangentVLocal = tangentV[id].clone();
            const t2 = tangentVLocal.sub(t1.mulf(tangentVLocal.dot(t1))).norms();
            if (tangentLength < 1e-8 || t2.norm() < 1e-8) {
                throw localizedError(isChinese(), `曲面参数化在网格点 (${i}, ${j}) 退化，无法构造法丛`,
                    `Surface parameterization is degenerate at grid point (${i}, ${j}); cannot construct a normal frame`);
            }
            const previous = j > 0 ? id - 1 : id - sideV;
            let normal1: Vec4;
            if (i === 0 && j === 0) {
                const axes = [math.Vec4.x, math.Vec4.y, math.Vec4.z, math.Vec4.w];
                normal1 = axes
                    .map(axis => axis.sub(t1.mulf(axis.dot(t1))).sub(t2.mulf(axis.dot(t2))))
                    .sort((a, b) => b.norm() - a.norm())[0].norms();
            } else {
                const prior1 = n1[previous];
                normal1 = prior1
                    .sub(t1.mulf(prior1.dot(t1)))
                    .sub(t2.mulf(prior1.dot(t2)));
                if (normal1.norm() < 1e-8) {
                    const prior2 = n2[previous];
                    normal1 = prior2
                        .sub(t1.mulf(prior2.dot(t1)))
                        .sub(t2.mulf(prior2.dot(t2)));
                }
                if (normal1.norm() < 1e-8) {
                    throw localizedError(isChinese(), "法丛标架传播失败；请降低采样分辨率或检查曲面退化点",
                        "Normal frame propagation failed; lower the sampling resolution or check for degenerate surface points");
                }
                normal1.norms();
            }
            const normal2 = hodgeNormal(t1, t2, normal1).norms();
            n1.push(normal1);
            n2.push(normal2);
        }
    }

    const surface = new tesserxel.mesh.CWMesh();
    surface.data[0] = vertices;
    surface.data[1] = [];
    surface.data[2] = [];
    const edges = surface.data[1] as number[][];
    const faces = surface.data[2] as number[][];
    const edgeIds = new Map<string, number>();
    const edgeId = (a: number, b: number) => {
        const key = key2(a, b);
        let id = edgeIds.get(key);
        if (id === undefined) {
            id = edges.length;
            edges.push(a < b ? [a, b] : [b, a]);
            edgeIds.set(key, id);
        }
        return id;
    };
    const addFace = (a: number, b: number, c: number) => {
        faces.push([edgeId(a, b), edgeId(b, c), edgeId(c, a)]);
    };
    for (let i = 0; i < nU; i++) {
        for (let j = 0; j < nV; j++) {
            const a = i * sideV + j;
            const b = (i + 1) * sideV + j;
            const c = (i + 1) * sideV + j + 1;
            const d = i * sideV + j + 1;
            addFace(a, b, c);
            addFace(a, c, d);
        }
    }
    for (let i = 0; i < faces.length; i++) surface.calculateOrientationInFace(2, i);
    surface.calculateOrientation(2);

    const crossSection = tesserxel.mesh.cw.polytope([4]);
    const sectionVertices = (crossSection.data[0] as Vec4[]).map(v => v.clone());
    const baseVertices = vertices.map(v => v.clone());
    const productInfo = surface.makeDirectProduct(crossSection);
    const productVertices = surface.data[0] as Vec4[];
    for (const [sectionVertexId, maps] of productInfo[0]) {
        const offset = sectionVertices[sectionVertexId];
        for (const [surfaceVertexId, productVertexId] of maps[0]) {
            productVertices[productVertexId] = baseVertices[surfaceVertexId].clone()
                .addmulfs(n1[surfaceVertexId], thickness * offset.x)
                .addmulfs(n2[surfaceVertexId], thickness * offset.y);
        }
    }
    const result = tetraMesh.cwmesh(surface);
    let nondegenerateTetrahedra = 0;
    for (let offset = 0; offset < result.position.length; offset += 16) {
        const a = new math.Vec4(
            result.position[offset], result.position[offset + 1],
            result.position[offset + 2], result.position[offset + 3]
        );
        const b = new math.Vec4(
            result.position[offset + 4], result.position[offset + 5],
            result.position[offset + 6], result.position[offset + 7]
        );
        const c = new math.Vec4(
            result.position[offset + 8], result.position[offset + 9],
            result.position[offset + 10], result.position[offset + 11]
        );
        const d = new math.Vec4(
            result.position[offset + 12], result.position[offset + 13],
            result.position[offset + 14], result.position[offset + 15]
        );
        if (![a, b, c, d].every(vertex => vertex.isFinite())) {
            throw localizedError(isChinese(), "加厚曲面生成了 NaN 或无穷大的顶点坐标",
                "Thickened surface produced NaN or infinite vertex coordinates");
        }
        if (b.sub(a).wedge(c.sub(a)).wedgev(d.sub(a)).norm() > 1e-10) {
            nondegenerateTetrahedra++;
        }
    }
    if (!result.count || !nondegenerateTetrahedra) {
        throw localizedError(isChinese(), "加厚曲面没有生成非共面的四维边界四面体",
            "Thickened surface did not produce any non-coplanar 4D boundary tetrahedra");
    }
    return result;
}

function hodgeNormal(a: Vec4, b: Vec4, c: Vec4) {
    const det = (x1: number, x2: number, x3: number, y1: number, y2: number, y3: number, z1: number, z2: number, z3: number) =>
        x1 * (y2 * z3 - y3 * z2) - x2 * (y1 * z3 - y3 * z1) + x3 * (y1 * z2 - y2 * z1);
    return new math.Vec4(
        det(a.y, a.z, a.w, b.y, b.z, b.w, c.y, c.z, c.w),
        -det(a.x, a.z, a.w, b.x, b.z, b.w, c.x, c.z, c.w),
        det(a.x, a.y, a.w, b.x, b.y, b.w, c.x, c.y, c.w),
        -det(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z)
    );
}

function buildVolume(
    exprs: Expr[], density: { u: number; v: number; t: number },
    ranges: { u: { min: number; max: number }; v: { min: number; max: number }; t: { min: number; max: number } }
) {
    const nU = Math.max(2, density.u);
    const nV = Math.max(2, density.v);
    const nT = Math.max(2, density.t);
    const vertices: Vec4[] = [];
    for (let i = 0; i <= nU; i++) {
        for (let j = 0; j <= nV; j++) {
            for (let k = 0; k <= nT; k++) {
                vertices.push(evalVec4(exprs, {
                    u: ranges.u.min + (ranges.u.max - ranges.u.min) * i / nU,
                    v: ranges.v.min + (ranges.v.max - ranges.v.min) * j / nV,
                    t: ranges.t.min + (ranges.t.max - ranges.t.min) * k / nT
                }));
            }
        }
    }
    const cells: Tetra[] = [];
    const orders = permutations([0, 1, 2]);
    for (let i = 0; i < nU; i++) {
        for (let j = 0; j < nV; j++) {
            for (let k = 0; k < nT; k++) {
                const base = [i, j, k];
                for (const order of orders) {
                    const p = base.slice();
                    const tetra: number[] = [gridIndex(p[0], p[1], p[2], nV, nT)];
                    for (const axis of order) {
                        p[axis]++;
                        tetra.push(gridIndex(p[0], p[1], p[2], nV, nT));
                    }
                    cells.push(tetra as Tetra);
                }
            }
        }
    }
    return tetraMesh.cwmesh(makeTetraCWMesh(vertices, cells), true);
}

function buildImplicit(expr: Expr, density: Record<string, number>, ranges: Record<string, { min: number; max: number }>) {
    const nx = Math.max(2, density.x);
    const ny = Math.max(2, density.y);
    const nz = Math.max(2, density.z);
    const nw = Math.max(2, density.w);
    const sx = nx + 1, sy = ny + 1, sz = nz + 1, sw = nw + 1;
    const values = new Float64Array(sx * sy * sz * sw);
    const point = (i: number, j: number, k: number, l: number) => {
        const p = [
            ranges.x.min + (ranges.x.max - ranges.x.min) * i / nx,
            ranges.y.min + (ranges.y.max - ranges.y.min) * j / ny,
            ranges.z.min + (ranges.z.max - ranges.z.min) * k / nz,
            ranges.w.min + (ranges.w.max - ranges.w.min) * l / nw
        ];
        return new math.Vec4(p[0], p[1], p[2], p[3]);
    };
    const nodeId = (i: number, j: number, k: number, l: number) =>
        ((i * sy + j) * sz + k) * sw + l;
    for (let i = 0; i <= nx; i++) {
        for (let j = 0; j <= ny; j++) {
            for (let k = 0; k <= nz; k++) {
                for (let l = 0; l <= nw; l++) {
                    const pos = point(i, j, k, l);
                    let value = expr({ x: pos.x, y: pos.y, z: pos.z, w: pos.w });
                    if (!Number.isFinite(value)) {
                        throw localizedError(isChinese(), "隐函数在采样区域内产生非有限值",
                            "Implicit function produced a non-finite value in the sampled region");
                    }
                    if (Math.abs(value) < 1e-12) value = ((i + j + k + l) & 1) ? -1e-12 : 1e-12;
                    values[nodeId(i, j, k, l)] = value;
                }
            }
        }
    }
    const vertices: Vec4[] = [];
    const intersectionIds = new Map<string, number>();
    const cells: Tetra[] = [];
    const edgeIntersection = (a: number, b: number) => {
        const key = key2(a, b);
        let id = intersectionIds.get(key);
        if (id !== undefined) return id;
        const va = values[a];
        const vb = values[b];
        const pa = pointFromId(a);
        const pb = pointFromId(b);
        const t = va / (va - vb);
        id = vertices.length;
        vertices.push(pa.add(pb.sub(pa).mulfs(t)));
        intersectionIds.set(key, id);
        return id;
    };
    const pointFromId = (id: number) => {
        const l = id % sw;
        const k = Math.floor(id / sw) % sz;
        const j = Math.floor(id / (sw * sz)) % sy;
        const i = Math.floor(id / (sw * sz * sy));
        return point(i, j, k, l);
    };
    const crossingOnTriangle = (tri: number[]) => {
        const crossings: number[] = [];
        for (let i = 0; i < 3; i++) {
            for (let j = i + 1; j < 3; j++) {
                const a = tri[i], b = tri[j];
                if ((values[a] < 0) !== (values[b] < 0)) crossings.push(edgeIntersection(a, b));
            }
        }
        return crossings;
    };
    const orders = permutations([0, 1, 2, 3]);
    for (let i = 0; i < nx; i++) {
        for (let j = 0; j < ny; j++) {
            for (let k = 0; k < nz; k++) {
                for (let l = 0; l < nw; l++) {
                    const base = [i, j, k, l];
                    for (const order of orders) {
                        const p = base.slice();
                        const simplex = [nodeId(p[0], p[1], p[2], p[3])];
                        for (const axis of order) {
                            p[axis]++;
                            simplex.push(nodeId(p[0], p[1], p[2], p[3]));
                        }
                        const negative = simplex.filter(id => values[id] < 0);
                        const positive = simplex.filter(id => values[id] > 0);
                        if (!negative.length || !positive.length) continue;

                        const localEdges = new Map<string, number>();
                        for (const a of negative) {
                            for (const b of positive) localEdges.set(key2(a, b), edgeIntersection(a, b));
                        }
                        const adjacency = new Map<number, Set<number>>();
                        const connectTriangle = (tri: number[]) => {
                            const crossing = crossingOnTriangle(tri);
                            if (crossing.length !== 2) return;
                            adjacency.get(crossing[0])?.add(crossing[1]) ??
                                adjacency.set(crossing[0], new Set([crossing[1]]));
                            adjacency.get(crossing[1])?.add(crossing[0]) ??
                                adjacency.set(crossing[1], new Set([crossing[0]]));
                        };
                        for (let removed = 0; removed < 5; removed++) {
                            const tetraFace = simplex.filter((_, idx) => idx !== removed);
                            for (let a = 0; a < 4; a++) {
                                for (let b = a + 1; b < 4; b++) {
                                    for (let c = b + 1; c < 4; c++) {
                                        connectTriangle([tetraFace[a], tetraFace[b], tetraFace[c]]);
                                    }
                                }
                            }
                        }
                        const pivot = Math.min(...localEdges.values());
                        for (let removed = 0; removed < 5; removed++) {
                            const faceNodes = simplex.filter((_, idx) => idx !== removed);
                            const candidates = new Set<number>();
                            for (let a = 0; a < 4; a++) {
                                for (let b = a + 1; b < 4; b++) {
                                    for (let c = b + 1; c < 4; c++) {
                                        for (const id of crossingOnTriangle([faceNodes[a], faceNodes[b], faceNodes[c]])) candidates.add(id);
                                    }
                                }
                            }
                            if (candidates.size < 3 || candidates.has(pivot)) continue;
                            const first = Math.min(...candidates);
                            const cycle = [first];
                            let previous = -1;
                            let current = first;
                            while (cycle.length < candidates.size) {
                                const next = Array.from(adjacency.get(current) ?? [])
                                    .filter(id => id !== previous && candidates.has(id) && !cycle.includes(id))
                                    .sort((a, b) => a - b)[0];
                                if (next === undefined) break;
                                cycle.push(next);
                                previous = current;
                                current = next;
                            }
                            if (cycle.length !== candidates.size) continue;
                            const pivotIndex = cycle.indexOf(Math.min(...cycle));
                            const ordered = cycle.slice(pivotIndex).concat(cycle.slice(0, pivotIndex));
                            for (let q = 1; q < ordered.length - 1; q++) {
                                const tet: Tetra = [pivot, ordered[0], ordered[q], ordered[q + 1]];
                                if (new Set(tet).size === 4) cells.push(tet);
                            }
                        }
                    }
                }
            }
        }
    }
    if (!cells.length) {
        throw localizedError(isChinese(), "当前分辨率和定义域内没有找到零等值面",
            "No zero level set was found at this resolution and within this domain");
    }
    return tetraMesh.cwmesh(makeTetraCWMesh(vertices, cells), true);
}

function buildComplexGraph(
    evaluate: ComplexExpr, center: Complex, span: number, density: number, thickness: number, zh: boolean,
    outputClip?: { reMin: number; reMax: number; imMin: number; imMax: number }
) {
    const subdivisions = Math.max(4, Math.min(96, Math.floor(density)));
    const side = subdivisions + 1;
    const minX = center.re - span / 2;
    const minY = center.im - span / 2;
    const step = span / subdivisions;
    const derivativeStep = Math.max(step * 1e-3, 1e-7);
    const vertices: Vec4[] = [];
    const sourceNormal1: Vec4[] = [];
    const sourceNormal2: Vec4[] = [];
    for (let i = 0; i <= subdivisions; i++) {
        const x = minX + i * step;
        for (let j = 0; j <= subdivisions; j++) {
            const y = minY + j * step;
            const value = evaluate(complex(x, y));
            const before = evaluate(complex(x - derivativeStep, y));
            const after = evaluate(complex(x + derivativeStep, y));
            const derivative = complexDiv(complexSub(after, before), complex(2 * derivativeStep));
            if (![value.re, value.im, derivative.re, derivative.im].every(Number.isFinite)) {
                throw localizedError(zh, `复函数在网格点 (${x.toFixed(4)}, ${y.toFixed(4)}) 产生非有限值；请检查函数定义域`,
                    `The complex function produced a non-finite value at grid point (${x.toFixed(4)}, ${y.toFixed(4)}); check its domain`);
            }
            vertices.push(new math.Vec4(x, y, value.re, value.im));
            const normalLength = Math.hypot(1, derivative.re, derivative.im);
            sourceNormal1.push(new math.Vec4(-derivative.re, derivative.im, 1, 0).divfs(normalLength));
            sourceNormal2.push(new math.Vec4(-derivative.im, -derivative.re, 0, 1).divfs(normalLength));
        }
    }

    const triangles: [number, number, number][] = [];
    for (let i = 0; i < subdivisions; i++) {
        for (let j = 0; j < subdivisions; j++) {
            const a = i * side + j;
            const b = (i + 1) * side + j;
            const c = b + 1;
            const d = a + 1;
            triangles.push([a, b, c], [a, c, d]);
        }
    }
    type GraphPoint = { position: Vec4; normal1: Vec4; normal2: Vec4 };
    const surface = new tesserxel.mesh.CWMesh();
    surface.data[0] = [];
    surface.data[1] = [];
    surface.data[2] = [];
    const surfaceVertices = surface.data[0] as Vec4[];
    const surfaceNormal1: Vec4[] = [];
    const surfaceNormal2: Vec4[] = [];
    const edges = surface.data[1] as number[][];
    const faces = surface.data[2] as number[][];
    const edgeIds = new Map<string, number>();
    const vertexIds = new Map<string, number>();
    const vertexId = (point: GraphPoint) => {
        const key = [point.position.x, point.position.y, point.position.z, point.position.w]
            .map(value => Number(value.toPrecision(12))).join(",");
        let id = vertexIds.get(key);
        if (id === undefined) {
            id = surfaceVertices.length;
            vertexIds.set(key, id);
            surfaceVertices.push(point.position);
            surfaceNormal1.push(point.normal1);
            surfaceNormal2.push(point.normal2);
        }
        return id;
    };
    const edgeId = (a: number, b: number) => {
        const key = key2(a, b);
        let id = edgeIds.get(key);
        if (id === undefined) {
            id = edges.length;
            edges.push(a < b ? [a, b] : [b, a]);
            edgeIds.set(key, id);
        }
        return id;
    };
    const addFace = (polygon: number[]) => {
        const unique = polygon.filter((id, index) => id !== polygon[(index + polygon.length - 1) % polygon.length]);
        if (unique.length < 3 || new Set(unique).size < 3) return;
        faces.push(unique.map((id, index) => edgeId(id, unique[(index + 1) % unique.length])));
    };
    const component = (vector: Vec4, axis: 2 | 3) => axis === 2 ? vector.z : vector.w;
    const sourcePoint = (id: number): GraphPoint => ({
        position: vertices[id],
        normal1: sourceNormal1[id],
        normal2: sourceNormal2[id]
    });
    const clipBoundary = (polygon: GraphPoint[], axis: 2 | 3, bound: number, keepAbove: boolean) => {
        const clipped: GraphPoint[] = [];
        if (!polygon.length) return clipped;
        const inside = (point: GraphPoint) => keepAbove
            ? component(point.position, axis) >= bound
            : component(point.position, axis) <= bound;
        const interpolate = (a: GraphPoint, b: GraphPoint) => {
            const amount = (bound - component(a.position, axis)) /
                (component(b.position, axis) - component(a.position, axis));
            const lerp = (x: Vec4, y: Vec4) => new math.Vec4(
                x.x + (y.x - x.x) * amount,
                x.y + (y.y - x.y) * amount,
                x.z + (y.z - x.z) * amount,
                x.w + (y.w - x.w) * amount
            );
            const n1 = lerp(a.normal1, b.normal1);
            const n2 = lerp(a.normal2, b.normal2);
            const n1Length = Math.hypot(n1.x, n1.y, n1.z, n1.w);
            if (n1Length > 0) n1.divfs(n1Length);
            n2.subs(n1.mulf(n2.dot(n1)));
            const n2Length = Math.hypot(n2.x, n2.y, n2.z, n2.w);
            if (n2Length > 0) n2.divfs(n2Length);
            return { position: lerp(a.position, b.position), normal1: n1, normal2: n2 };
        };
        let previous = polygon[polygon.length - 1];
        for (const current of polygon) {
            const previousInside = inside(previous);
            const currentInside = inside(current);
            if (previousInside !== currentInside) clipped.push(interpolate(previous, current));
            if (currentInside) clipped.push(current);
            previous = current;
        }
        return clipped;
    };
    for (const triangle of triangles) {
        let polygon = triangle.map(sourcePoint);
        if (outputClip) {
            polygon = clipBoundary(polygon, 2, outputClip.reMin, true);
            polygon = clipBoundary(polygon, 2, outputClip.reMax, false);
            polygon = clipBoundary(polygon, 3, outputClip.imMin, true);
            polygon = clipBoundary(polygon, 3, outputClip.imMax, false);
        }
        addFace(polygon.map(vertexId));
    }
    if (!faces.length) {
        throw localizedError(zh, "当前输出范围内没有可显示的图形", "No graph geometry lies within the selected output range");
    }
    for (let i = 0; i < faces.length; i++) surface.calculateOrientationInFace(2, i);
    surface.calculateOrientation(2);

    const crossSection = tesserxel.mesh.cw.polytope([4]);
    const sectionVertices = (crossSection.data[0] as Vec4[]).map(vertex => vertex.clone());
    const baseVertices = surfaceVertices.map(vertex => vertex.clone());
    const productInfo = surface.makeDirectProduct(crossSection);
    const productVertices = surface.data[0] as Vec4[];
    for (const [sectionVertexId, maps] of productInfo[0]) {
        const offset = sectionVertices[sectionVertexId];
        for (const [surfaceVertexId, productVertexId] of maps[0]) {
            productVertices[productVertexId] = baseVertices[surfaceVertexId].clone()
                .addmulfs(surfaceNormal1[surfaceVertexId], thickness * offset.x)
                .addmulfs(surfaceNormal2[surfaceVertexId], thickness * offset.y);
        }
    }
    return tetraMesh.cwmesh(surface).generateNormal().setUVWAsPosition();
}

function buildComplexImplicitSurface(
    evaluate: ComplexExpr,
    ranges: ComplexImplicitRanges,
    xyDensity: number,
    zwDensity: number,
    thickness: number,
    zh: boolean
) {
    const subdivisions = [xyDensity, xyDensity, zwDensity, zwDensity];
    const sides = subdivisions.map(value => value + 1);
    const steps = [
        (ranges.x.max - ranges.x.min) / xyDensity,
        (ranges.y.max - ranges.y.min) / xyDensity,
        (ranges.u.max - ranges.u.min) / zwDensity,
        (ranges.v.max - ranges.v.min) / zwDensity
    ];
    const lengths = sides.map((_, axis) => sides.slice(axis + 1).reduce((a, b) => a * b, 1));
    const nodeCount = sides.reduce((a, b) => a * b, 1);
    const nodeId = (x: number, y: number, u: number, v: number) =>
        x * lengths[0] + y * lengths[1] + u * lengths[2] + v;
    const pointAt = (x: number, y: number, u: number, v: number) => [
        ranges.x.min + x * steps[0],
        ranges.y.min + y * steps[1],
        ranges.u.min + u * steps[2],
        ranges.v.min + v * steps[3]
    ];
    const toComplex = (point: number[]) => [complex(point[0], point[1]), complex(point[2], point[3])] as const;
    const safeEvaluate = (z1: Complex, z2: Complex) => {
        const value = evaluate(z1, z2);
        return Number.isFinite(value.re) && Number.isFinite(value.im) ? value : undefined;
    };
    const partials = (point: number[]) => {
        const [z1, z2] = toComplex(point);
        const h1 = Math.max(Math.min(steps[0], steps[1]) * 1e-3, 1e-7);
        const h2 = Math.max(Math.min(steps[2], steps[3]) * 1e-3, 1e-7);
        const f1a = safeEvaluate(complex(z1.re - h1, z1.im), z2);
        const f1b = safeEvaluate(complex(z1.re + h1, z1.im), z2);
        const f2a = safeEvaluate(z1, complex(z2.re - h2, z2.im));
        const f2b = safeEvaluate(z1, complex(z2.re + h2, z2.im));
        if (!f1a || !f1b || !f2a || !f2b) return undefined;
        return {
            z1: complexDiv(complexSub(f1b, f1a), complex(2 * h1)),
            z2: complexDiv(complexSub(f2b, f2a), complex(2 * h2))
        };
    };
    const values: (Complex | undefined)[] = new Array(nodeCount);
    const derivatives: ({ z1: Complex; z2: Complex } | undefined)[] = new Array(nodeCount);
    for (let x = 0; x <= xyDensity; x++) {
        for (let y = 0; y <= xyDensity; y++) {
            for (let u = 0; u <= zwDensity; u++) {
                for (let v = 0; v <= zwDensity; v++) {
                    const id = nodeId(x, y, u, v);
                    const point = pointAt(x, y, u, v);
                    const [z1, z2] = toComplex(point);
                    values[id] = safeEvaluate(z1, z2);
                    if (values[id]) derivatives[id] = partials(point);
                }
            }
        }
    }

    type ProjectedPoint = { position: Vec4; normal1: Vec4; normal2: Vec4 };
    const projectedPoints: ProjectedPoint[] = [];
    const projectedAtNode = new Int32Array(nodeCount).fill(-1);
    const mergeStep = Math.min(...steps) * 0.05;
    const coordinateKey = (point: number[]) => point.map(value => Math.round(value / mergeStep)).join(",");
    const pointIds = new Map<string, number>();
    const insideDomain = (point: number[]) =>
        point[0] >= ranges.x.min && point[0] <= ranges.x.max &&
        point[1] >= ranges.y.min && point[1] <= ranges.y.max &&
        point[2] >= ranges.u.min && point[2] <= ranges.u.max &&
        point[3] >= ranges.v.min && point[3] <= ranges.v.max;
    const domainScale = Math.max(...steps);
    const residualTolerance = Math.max(1, domainScale) * 1e-7;
    const maxMove1 = Math.min(steps[0], steps[1]);
    const maxMove2 = Math.min(steps[2], steps[3]);
    const project = (start: number[], initialValue: Complex, initialPartials: { z1: Complex; z2: Complex }) => {
        const moveZ1 = complexDiv(initialValue, initialPartials.z1);
        const moveZ2 = complexDiv(initialValue, initialPartials.z2);
        const lengthZ1 = Math.hypot(moveZ1.re, moveZ1.im);
        const lengthZ2 = Math.hypot(moveZ2.re, moveZ2.im);
        if (![lengthZ1, lengthZ2].every(Number.isFinite)) return undefined;
        const canMoveZ1 = lengthZ1 <= maxMove1;
        const canMoveZ2 = lengthZ2 <= maxMove2;
        if (Math.hypot(initialValue.re, initialValue.im) > residualTolerance && !canMoveZ1 && !canMoveZ2) return undefined;
        const useZ1 = canMoveZ1 && (!canMoveZ2 || lengthZ1 <= lengthZ2);
        const point = start.slice();
        if (Math.hypot(initialValue.re, initialValue.im) > residualTolerance) {
            if (useZ1) {
                point[0] -= moveZ1.re;
                point[1] -= moveZ1.im;
            } else {
                point[2] -= moveZ2.re;
                point[3] -= moveZ2.im;
            }
        }
        if (!insideDomain(point)) return undefined;
        for (let iteration = 0; iteration < 16; iteration++) {
            const [z1, z2] = toComplex(point);
            const value = safeEvaluate(z1, z2);
            if (!value) return undefined;
            if (Math.hypot(value.re, value.im) <= residualTolerance) break;
            const derivative = partials(point);
            if (!derivative) return undefined;
            const divisor = useZ1 ? derivative.z1 : derivative.z2;
            if (Math.hypot(divisor.re, divisor.im) < 1e-12) return undefined;
            const move = complexDiv(value, divisor);
            if (!Number.isFinite(move.re) || !Number.isFinite(move.im)) return undefined;
            if (useZ1) {
                point[0] -= move.re;
                point[1] -= move.im;
            } else {
                point[2] -= move.re;
                point[3] -= move.im;
            }
            if (!insideDomain(point)) return undefined;
        }
        const [z1, z2] = toComplex(point);
        const finalValue = safeEvaluate(z1, z2);
        if (!finalValue || Math.hypot(finalValue.re, finalValue.im) > residualTolerance) return undefined;
        const finalPartials = partials(point);
        if (!finalPartials) return undefined;
        const normalLength = Math.hypot(
            finalPartials.z1.re, finalPartials.z1.im,
            finalPartials.z2.re, finalPartials.z2.im
        );
        if (!Number.isFinite(normalLength) || normalLength < 1e-12) return undefined;
        const normal1 = new math.Vec4(
            finalPartials.z1.re, -finalPartials.z1.im,
            finalPartials.z2.re, -finalPartials.z2.im
        ).divfs(normalLength);
        const normal2 = new math.Vec4(
            -finalPartials.z1.im, -finalPartials.z1.re,
            -finalPartials.z2.im, -finalPartials.z2.re
        ).divfs(normalLength);
        return {
            coordinates: point,
            projected: { position: new math.Vec4(point[0], point[1], point[2], point[3]), normal1, normal2 }
        };
    };
    for (let x = 0; x <= xyDensity; x++) {
        for (let y = 0; y <= xyDensity; y++) {
            for (let u = 0; u <= zwDensity; u++) {
                for (let v = 0; v <= zwDensity; v++) {
                    const id = nodeId(x, y, u, v);
                    const value = values[id];
                    const derivative = derivatives[id];
                    if (!value || !derivative) continue;
                    const result = project(pointAt(x, y, u, v), value, derivative);
                    if (!result) continue;
                    const key = coordinateKey(result.coordinates);
                    let projectedId = pointIds.get(key);
                    if (projectedId === undefined) {
                        projectedId = projectedPoints.length;
                        pointIds.set(key, projectedId);
                        projectedPoints.push(result.projected);
                    }
                    projectedAtNode[id] = projectedId;
                }
            }
        }
    }
    if (projectedPoints.length < 3) {
        throw localizedError(zh, "当前范围和细分下没有找到足够的复隐函数零点", "Not enough complex implicit roots were found in this domain at the selected resolution");
    }

    const surface = new tesserxel.mesh.CWMesh();
    surface.data[0] = projectedPoints.map(point => point.position);
    surface.data[1] = [];
    surface.data[2] = [];
    const edges = surface.data[1] as number[][];
    const faces = surface.data[2] as number[][];
    const edgeIds = new Map<string, number>();
    const faceIds = new Set<string>();
    const edgeId = (a: number, b: number) => {
        const key = key2(a, b);
        let id = edgeIds.get(key);
        if (id === undefined) {
            id = edges.length;
            edgeIds.set(key, id);
            edges.push(a < b ? [a, b] : [b, a]);
        }
        return id;
    };
    const addTriangle = (a: number, b: number, c: number) => {
        if (a === b || b === c || c === a) return;
        const key = key3(a, b, c);
        if (faceIds.has(key)) return;
        faceIds.add(key);
        faces.push([edgeId(a, b), edgeId(b, c), edgeId(c, a)]);
    };
    const tangentCoordinates = (ids: number[]) => {
        const center = [0, 0, 0, 0];
        for (const id of ids) {
            const p = projectedPoints[id].position;
            center[0] += p.x / ids.length;
            center[1] += p.y / ids.length;
            center[2] += p.z / ids.length;
            center[3] += p.w / ids.length;
        }
        const derivative = partials(center);
        if (!derivative) return undefined;
        const tangent1 = new math.Vec4(
            derivative.z2.re, derivative.z2.im,
            -derivative.z1.re, -derivative.z1.im
        );
        const tangentLength = Math.hypot(tangent1.x, tangent1.y, tangent1.z, tangent1.w);
        if (!Number.isFinite(tangentLength) || tangentLength < 1e-12) return undefined;
        tangent1.divfs(tangentLength);
        const tangent2 = new math.Vec4(-tangent1.y, tangent1.x, -tangent1.w, tangent1.z);
        return ids.map(id => {
            const offset = projectedPoints[id].position.sub(new math.Vec4(center[0], center[1], center[2], center[3]));
            return { id, x: offset.dot(tangent1), y: offset.dot(tangent2) };
        });
    };
    const convexHull = (points: { id: number; x: number; y: number }[]) => {
        const sorted = points.slice().sort((a, b) => a.x - b.x || a.y - b.y);
        const cross = (o: typeof sorted[number], a: typeof sorted[number], b: typeof sorted[number]) =>
            (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
        const lower: typeof sorted = [];
        for (const point of sorted) {
            while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 1e-12) lower.pop();
            lower.push(point);
        }
        const upper: typeof sorted = [];
        for (let i = sorted.length - 1; i >= 0; i--) {
            const point = sorted[i];
            while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 1e-12) upper.pop();
            upper.push(point);
        }
        lower.pop();
        upper.pop();
        return lower.concat(upper);
    };
    for (let x = 0; x < xyDensity; x++) {
        for (let y = 0; y < xyDensity; y++) {
            for (let u = 0; u < zwDensity; u++) {
                for (let v = 0; v < zwDensity; v++) {
                    const ids = new Set<number>();
                    for (let mask = 0; mask < 16; mask++) {
                        const id = nodeId(
                            x + (mask & 1), y + ((mask >> 1) & 1),
                            u + ((mask >> 2) & 1), v + ((mask >> 3) & 1)
                        );
                        const projectedId = projectedAtNode[id];
                        if (projectedId >= 0) ids.add(projectedId);
                    }
                    if (ids.size < 3) continue;
                    const points = tangentCoordinates(Array.from(ids));
                    if (!points) continue;
                    const hull = convexHull(points);
                    if (hull.length < 3) continue;
                    const anchor = hull[0];
                    for (let i = 1; i < hull.length - 1; i++) {
                        const b = hull[i];
                        const c = hull[i + 1];
                        const area = Math.abs((b.x - anchor.x) * (c.y - anchor.y) - (b.y - anchor.y) * (c.x - anchor.x));
                        if (area <= 1e-10) continue;
                        addTriangle(anchor.id, b.id, c.id);
                    }
                }
            }
        }
    }
    if (!faces.length) {
        throw localizedError(zh, "无法从复隐函数投影点重建曲面；请提高细分或调整定义域", "Could not reconstruct a surface from the projected complex roots; increase resolution or adjust the domain");
    }
    for (let i = 0; i < faces.length; i++) surface.calculateOrientationInFace(2, i);
    const crossSection = tesserxel.mesh.cw.polytope([4]);
    const sectionVertices = (crossSection.data[0] as Vec4[]).map(vertex => vertex.clone());
    const baseVertices = (surface.data[0] as Vec4[]).map(vertex => vertex.clone());
    const productInfo = surface.makeDirectProduct(crossSection);
    const productVertices = surface.data[0] as Vec4[];
    for (const [sectionVertexId, maps] of productInfo[0]) {
        const offset = sectionVertices[sectionVertexId];
        for (const [surfaceVertexId, productVertexId] of maps[0]) {
            productVertices[productVertexId] = baseVertices[surfaceVertexId].clone()
                .addmulfs(projectedPoints[surfaceVertexId].normal1, thickness * offset.x)
                .addmulfs(projectedPoints[surfaceVertexId].normal2, thickness * offset.y);
        }
    }
    return tetraMesh.cwmesh(surface).generateNormal().setUVWAsPosition();
}

function translateTetraMesh(mesh: tesserxel.mesh.TetraMesh, offset: tesserxel.math.Vec4) {
    for (let i = 0; i < mesh.position.length; i += 4) {
        mesh.position[i] -= offset.x;
        mesh.position[i + 1] -= offset.y;
        mesh.position[i + 2] -= offset.z;
        mesh.position[i + 3] -= offset.w;
    }
    return mesh;
}

function getTetraMeshBoundsCenter(mesh: tesserxel.mesh.TetraMesh, outputClip?: { reMin: number; reMax: number; imMin: number; imMax: number }) {
    const min = [Infinity, Infinity, Infinity, Infinity];
    const max = [-Infinity, -Infinity, -Infinity, -Infinity];
    for (let i = 0; i < mesh.position.length; i += 4) {
        for (let axis = 0; axis < 4; axis++) {
            min[axis] = Math.min(min[axis], mesh.position[i + axis]);
            max[axis] = Math.max(max[axis], mesh.position[i + axis]);
        }
    }
    return new math.Vec4(
        (min[0] + max[0]) / 2,
        (min[1] + max[1]) / 2,
        outputClip ? (outputClip.reMin + outputClip.reMax) / 2 : 0,
        outputClip ? (outputClip.imMin + outputClip.imMax) / 2 : 0
    );
}

function buildComplexCoordinatePlane(
    span: number, density: number, thickness: number, outputPlane: boolean, center: Complex, centerOffset: tesserxel.math.Vec4,
    outputClip?: { reMin: number; reMax: number; imMin: number; imMax: number }
) {
    const subdivisions = Math.max(4, Math.min(96, Math.floor(density)));
    const side = subdivisions + 1;
    const stepX = outputPlane && outputClip ? (outputClip.reMax - outputClip.reMin) / subdivisions : span / subdivisions;
    const stepY = outputPlane && outputClip ? (outputClip.imMax - outputClip.imMin) / subdivisions : span / subdivisions;
    const surface = new tesserxel.mesh.CWMesh();
    const vertices: tesserxel.math.Vec4[] = [];
    for (let i = 0; i <= subdivisions; i++) {
        const x = outputPlane
            ? (outputClip ? outputClip.reMin : -span / 2) + i * stepX
            : center.re - span / 2 + i * stepX;
        for (let j = 0; j <= subdivisions; j++) {
            const y = outputPlane
                ? (outputClip ? outputClip.imMin : -span / 2) + j * stepY
                : center.im - span / 2 + j * stepY;
            vertices.push(outputPlane
                ? new math.Vec4(0, 0, x, y)
                : new math.Vec4(x, y, 0, 0));
        }
    }
    surface.data[0] = vertices;
    surface.data[1] = [];
    surface.data[2] = [];
    const edges = surface.data[1] as number[][];
    const faces = surface.data[2] as number[][];
    const edgeIds = new Map<string, number>();
    const edgeId = (a: number, b: number) => {
        const key = key2(a, b);
        let id = edgeIds.get(key);
        if (id === undefined) {
            id = edges.length;
            edges.push(a < b ? [a, b] : [b, a]);
            edgeIds.set(key, id);
        }
        return id;
    };
    const addFace = (a: number, b: number, c: number) => {
        faces.push([edgeId(a, b), edgeId(b, c), edgeId(c, a)]);
    };
    for (let i = 0; i < subdivisions; i++) {
        for (let j = 0; j < subdivisions; j++) {
            const a = i * side + j;
            const b = (i + 1) * side + j;
            addFace(a, b, b + 1);
            addFace(a, b + 1, a + 1);
        }
    }
    for (let i = 0; i < faces.length; i++) surface.calculateOrientationInFace(2, i);
    surface.calculateOrientation(2);
    const section = tesserxel.mesh.cw.polytope([4]);
    const sectionVertices = (section.data[0] as Vec4[]).map(vertex => vertex.clone());
    const baseVertices = vertices.map(vertex => vertex.clone());
    const productInfo = surface.makeDirectProduct(section);
    const productVertices = surface.data[0] as Vec4[];
    for (const [sectionVertexId, maps] of productInfo[0]) {
        const offset = sectionVertices[sectionVertexId];
        for (const [surfaceVertexId, productVertexId] of maps[0]) {
            const n1 = outputPlane ? math.Vec4.x : math.Vec4.z;
            const n2 = outputPlane ? math.Vec4.y : math.Vec4.w;
            productVertices[productVertexId] = baseVertices[surfaceVertexId].clone()
                .addmulfs(n1, thickness * offset.x)
                .addmulfs(n2, thickness * offset.y);
        }
    }
    return translateTetraMesh(tetraMesh.cwmesh(surface).generateNormal().setUVWAsPosition(), centerOffset);
}

function buildComplexImplicitCoordinatePlane(
    ranges: ComplexImplicitRanges,
    xyDensity: number,
    zwDensity: number,
    thickness: number,
    z2Plane: boolean,
    centerOffset: tesserxel.math.Vec4
) {
    const xRange = z2Plane ? ranges.u : ranges.x;
    const yRange = z2Plane ? ranges.v : ranges.y;
    const subdivisionsX = z2Plane ? zwDensity : xyDensity;
    const subdivisionsY = subdivisionsX;
    const sideY = subdivisionsY + 1;
    const vertices: tesserxel.math.Vec4[] = [];
    for (let i = 0; i <= subdivisionsX; i++) {
        const x = xRange.min + (xRange.max - xRange.min) * i / subdivisionsX;
        for (let j = 0; j <= subdivisionsY; j++) {
            const y = yRange.min + (yRange.max - yRange.min) * j / subdivisionsY;
            vertices.push(z2Plane
                ? new math.Vec4(0, 0, x, y)
                : new math.Vec4(x, y, 0, 0));
        }
    }
    const surface = new tesserxel.mesh.CWMesh();
    surface.data[0] = vertices;
    surface.data[1] = [];
    surface.data[2] = [];
    const edges = surface.data[1] as number[][];
    const faces = surface.data[2] as number[][];
    const edgeIds = new Map<string, number>();
    const edgeId = (a: number, b: number) => {
        const key = key2(a, b);
        let id = edgeIds.get(key);
        if (id === undefined) {
            id = edges.length;
            edges.push(a < b ? [a, b] : [b, a]);
            edgeIds.set(key, id);
        }
        return id;
    };
    for (let i = 0; i < subdivisionsX; i++) {
        for (let j = 0; j < subdivisionsY; j++) {
            const a = i * sideY + j;
            const b = (i + 1) * sideY + j;
            const c = b + 1;
            const d = a + 1;
            faces.push([edgeId(a, b), edgeId(b, c), edgeId(c, a)]);
            faces.push([edgeId(a, c), edgeId(c, d), edgeId(d, a)]);
        }
    }
    for (let i = 0; i < faces.length; i++) surface.calculateOrientationInFace(2, i);
    surface.calculateOrientation(2);
    const section = tesserxel.mesh.cw.polytope([4]);
    const sectionVertices = (section.data[0] as Vec4[]).map(vertex => vertex.clone());
    const baseVertices = vertices.map(vertex => vertex.clone());
    const productInfo = surface.makeDirectProduct(section);
    const productVertices = surface.data[0] as Vec4[];
    for (const [sectionVertexId, maps] of productInfo[0]) {
        const offset = sectionVertices[sectionVertexId];
        for (const [surfaceVertexId, productVertexId] of maps[0]) {
            const normal1 = z2Plane ? math.Vec4.x : math.Vec4.z;
            const normal2 = z2Plane ? math.Vec4.y : math.Vec4.w;
            productVertices[productVertexId] = baseVertices[surfaceVertexId].clone()
                .addmulfs(normal1, thickness * offset.x)
                .addmulfs(normal2, thickness * offset.y);
        }
    }
    return translateTetraMesh(tetraMesh.cwmesh(surface).generateNormal().setUVWAsPosition(), centerOffset);
}

function addControls(onBuild: (
    mode: MathFnMode, expressions: string[], ranges: MathFnRanges, density: Record<string, number>, thickness: number
) => void, onClear: () => void, language?: string) {
    const zh = isChinese(language);
    const presets = functionPresets.real;
    const defaultExpressions: Record<MathFnMode, string[]> = {
        curve: ["cos(t)", "sin(t)", "0.35*cos(2*t)", "0.35*sin(2*t)"],
        surface: ["u", "v", "0.25*sin(pi*u)*sin(pi*v)", "0.2*cos(pi*u)*cos(pi*v)"],
        volume: ["u", "v", "t", "0.25*(u^2+v^2+t^2)"],
        implicit: ["x^2+y^2+z^2+w^2-1.6"]
    };
    const parameterNames: Record<MathFnMode, string[]> = {
        curve: ["t"], surface: ["u", "v"], volume: ["u", "v", "t"], implicit: ["x", "y", "z", "w"]
    };
    const defaultRanges: Record<MathFnMode, MathFnRanges> = {
        curve: { t: { min: 0, max: 2 * Math.PI } },
        surface: { u: { min: -1, max: 1 }, v: { min: -1, max: 1 } },
        volume: { u: { min: -1, max: 1 }, v: { min: -1, max: 1 }, t: { min: -1, max: 1 } },
        implicit: {
            x: { min: -1.5, max: 1.5 }, y: { min: -1.5, max: 1.5 },
            z: { min: -1.5, max: 1.5 }, w: { min: -1.5, max: 1.5 }
        }
    };
    const panel = document.createElement("div");
    panel.style.cssText = "position:fixed;z-index:5;left:12px;top:12px;width:min(320px,calc(100vw - 24px));min-width:min(240px,calc(100vw - 24px));min-height:0;max-width:calc(100vw - 24px);max-height:calc(100vh - 24px);overflow:auto;resize:both;padding:7px 9px 9px;background:#ffffffed;color:#222;border-radius:6px;font:11px sans-serif;box-sizing:border-box";
    panel.innerHTML = `
        <div data-panel-header style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:5px;cursor:move;user-select:none;touch-action:none">
            <strong>${zh ? "实函数四维建模" : "Real Function 4D Modeling"}</strong>
            <button type="button" data-collapse aria-expanded="true" aria-label="${zh ? "收起面板" : "Collapse panel"}" style="cursor:pointer">−</button>
        </div>
        <div data-panel-content>
        <label>${zh ? "模式" : "Mode"} <select data-mode>
            <option value="curve">${zh ? "参数曲线" : "Parametric curve"}</option>
            <option value="surface">${zh ? "参数2D曲面" : "Parametric 2D surface"}</option>
            <option value="volume">${zh ? "参数3D曲胞" : "Parametric 3D cell"}</option>
            <option value="implicit">${zh ? "隐函数 f(x,y,z,w)=0" : "Implicit f(x,y,z,w)=0"}</option>
        </select></label>
        <label style="display:block;margin:5px 0">${zh ? "预设" : "Presets"}
            <select data-preset style="width:100%">
                <option value="">${zh ? "选择一个示例函数…" : "Choose an example function..."}</option>
            </select>
        </label>
        <div data-expressions></div>
        <div data-ranges></div>
        <div data-symmetric-range style="display:flex;align-items:center;flex-wrap:wrap;gap:6px;margin:6px 0">
            <label>${zh ? "所有参数对称范围 ±" : "Symmetric range for all parameters ±"}
                <input data-symmetric-range-value type="number" min="0" step="any" value="1" style="width:60px">
            </label>
            <label>${zh ? "细分" : "Divisions"}
                <input data-symmetric-density type="number" min="2" step="1" value="8" style="width:48px">
            </label>
            <button type="button" data-apply-symmetric-range>${zh ? "批量设置" : "Apply to all"}</button>
        </div>
        <label data-thickness-row style="display:block;margin:8px 0">${zh ? "管 / 曲面厚度" : "Tube / surface thickness"}
            <input data-thickness type="number" min="0.005" max="1" step="0.005" value="0.08" style="width:72px">
        </label>
        <label style="display:block;margin-top:6px">
            <input data-auto-update type="checkbox" checked> ${zh ? "自动更新" : "Auto update"}
        </label>
        <button data-build hidden>${zh ? "生成 / 更新" : "Build / Update"}</button>
        <div data-error role="status" style="color:#a00;white-space:pre-wrap;margin-top:8px"></div>
        </div>`;
    document.body.appendChild(panel);
    panel.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLButtonElement>("input,select,button")
        .forEach(control => { control.style.font = "inherit"; });
    const header = panel.querySelector("[data-panel-header]") as HTMLDivElement;
    const content = panel.querySelector("[data-panel-content]") as HTMLDivElement;
    const collapseButton = panel.querySelector("[data-collapse]") as HTMLButtonElement;
    collapseButton.addEventListener("click", () => {
        const collapsed = content.hidden;
        content.hidden = !collapsed;
        panel.style.height = collapsed ? "" : "auto";
        collapseButton.textContent = collapsed ? "−" : "+";
        collapseButton.setAttribute("aria-expanded", String(collapsed));
        collapseButton.setAttribute("aria-label", collapsed
            ? (zh ? "收起面板" : "Collapse panel")
            : (zh ? "展开面板" : "Expand panel"));
    });
    let dragStart: { x: number; y: number; left: number; top: number } | undefined;
    header.addEventListener("pointerdown", event => {
        if ((event.target as HTMLElement).closest("button")) return;
        const rect = panel.getBoundingClientRect();
        dragStart = { x: event.clientX, y: event.clientY, left: rect.left, top: rect.top };
        header.setPointerCapture(event.pointerId);
    });
    header.addEventListener("pointermove", event => {
        if (!dragStart) return;
        const left = Math.max(0, Math.min(window.innerWidth - panel.offsetWidth, dragStart.left + event.clientX - dragStart.x));
        const top = Math.max(0, Math.min(window.innerHeight - header.offsetHeight, dragStart.top + event.clientY - dragStart.y));
        panel.style.left = `${left}px`;
        panel.style.top = `${top}px`;
    });
    const stopDragging = () => { dragStart = undefined; };
    header.addEventListener("pointerup", stopDragging);
    header.addEventListener("pointercancel", stopDragging);
    const modeSelect = panel.querySelector("[data-mode]") as HTMLSelectElement;
    const presetSelect = panel.querySelector("[data-preset]") as HTMLSelectElement;
    const expressions = panel.querySelector("[data-expressions]") as HTMLDivElement;
    const rangesElement = panel.querySelector("[data-ranges]") as HTMLDivElement;
    const symmetricRangeRow = panel.querySelector("[data-symmetric-range]") as HTMLDivElement;
    const symmetricRangeInput = panel.querySelector("[data-symmetric-range-value]") as HTMLInputElement;
    const symmetricDensityInput = panel.querySelector("[data-symmetric-density]") as HTMLInputElement;
    const applySymmetricRangeButton = panel.querySelector("[data-apply-symmetric-range]") as HTMLButtonElement;
    const thicknessInput = panel.querySelector("[data-thickness]") as HTMLInputElement;
    const thicknessRow = panel.querySelector("[data-thickness-row]") as HTMLLabelElement;
    const error = panel.querySelector("[data-error]") as HTMLDivElement;
    try {
        const savedMode = localStorage.getItem("tesserxel.mathfn.mode.v1");
        if (savedMode === "curve" || savedMode === "surface" || savedMode === "volume" || savedMode === "implicit") {
            modeSelect.value = savedMode;
        }
    } catch (reason) {
        error.textContent = `${zh ? "无法读取已保存的函数模式" : "Could not load saved function mode"}: ${reason instanceof Error ? reason.message : String(reason)}`;
    }
    const button = panel.querySelector("[data-build]") as HTMLButtonElement;
    const autoUpdateInput = panel.querySelector("[data-auto-update]") as HTMLInputElement;
    let updateTimer = 0;
    const requestBuild = () => {
        if (!autoUpdateInput.checked) return;
        window.clearTimeout(updateTimer);
        updateTimer = window.setTimeout(() => button.click(), 120);
    };
    autoUpdateInput.addEventListener("change", () => {
        button.hidden = autoUpdateInput.checked;
        if (autoUpdateInput.checked) requestBuild();
        else window.clearTimeout(updateTimer);
    });
    const labels: Record<MathFnMode, string[]> = {
        curve: ["x(t)", "y(t)", "z(t)", "w(t)"],
        surface: ["x(u,v)", "y(u,v)", "z(u,v)", "w(u,v)"],
        volume: ["x(u,v,t)", "y(u,v,t)", "z(u,v,t)", "w(u,v,t)"],
        implicit: ["f(x,y,z,w)"]
    };
    const makeDensity = (mode: MathFnMode, value: number) =>
        Object.fromEntries(parameterNames[mode].map(name => [name, value]));
    const settingsByMode: Record<MathFnMode, { ranges: MathFnRanges; density: Record<string, number>; thickness: number }> = {
        curve: { ranges: structuredClone(defaultRanges.curve), density: makeDensity("curve", 48), thickness: 0.08 },
        surface: { ranges: structuredClone(defaultRanges.surface), density: makeDensity("surface", 28), thickness: 0.08 },
        volume: { ranges: structuredClone(defaultRanges.volume), density: makeDensity("volume", 8), thickness: 0.08 },
        implicit: { ranges: structuredClone(defaultRanges.implicit), density: makeDensity("implicit", 6), thickness: 0.08 }
    };
    const readExpressions = (mode: MathFnMode) => {
        const key = `tesserxel.mathfn.expressions.v1.${mode}`;
        const saved = localStorage.getItem(key);
        if (saved === null) return defaultExpressions[mode].slice();
        const parsed: unknown = JSON.parse(saved);
        if (!Array.isArray(parsed) || parsed.length !== defaultExpressions[mode].length || parsed.some(value => typeof value !== "string")) {
            throw new Error(`本地保存的 ${mode} 表达式格式无效，请清理 localStorage 项 ${key}`);
        }
        return parsed as string[];
    };
    const saveExpressions = (mode: MathFnMode, values: string[]) => {
        localStorage.setItem(`tesserxel.mathfn.expressions.v1.${mode}`, JSON.stringify(values));
    };
    const savedSettingsWarnings: Partial<Record<MathFnMode, string>> = {};
    for (const mode of ["curve", "surface", "volume", "implicit"] as const) {
        const key = `tesserxel.mathfn.settings.v1.${mode}`;
        try {
            const saved = localStorage.getItem(key);
            if (saved === null) continue;
            const parsed: unknown = JSON.parse(saved);
            if (!parsed || typeof parsed !== "object") throw new Error("invalid settings object");
            const value = parsed as { ranges?: unknown; density?: unknown; thickness?: unknown };
            if (!value.ranges || typeof value.ranges !== "object" || !value.density || typeof value.density !== "object") {
                throw new Error("missing ranges or density");
            }
            const ranges = value.ranges as Record<string, unknown>;
            const densities = value.density as Record<string, unknown>;
            const restoredRanges: MathFnRanges = {};
            const restoredDensity: Record<string, number> = {};
            const densityLimit = mode === "implicit" || mode === "volume" ? 32 : 128;
            for (const name of parameterNames[mode]) {
                const range = ranges[name] as { min?: unknown; max?: unknown } | undefined;
                const density = densities[name];
                if (!range || typeof range.min !== "number" || typeof range.max !== "number" ||
                    !Number.isFinite(range.min) || !Number.isFinite(range.max) || range.max <= range.min ||
                    typeof density !== "number" || !Number.isInteger(density) || density < 2 || density > densityLimit) {
                    throw new Error(`invalid ${name} range or density`);
                }
                restoredRanges[name] = { min: range.min, max: range.max };
                restoredDensity[name] = density;
            }
            const thickness = value.thickness;
            if (typeof thickness !== "number" || !Number.isFinite(thickness) || thickness <= 0) {
                throw new Error("invalid thickness");
            }
            settingsByMode[mode] = { ranges: restoredRanges, density: restoredDensity, thickness };
        } catch (reason) {
            savedSettingsWarnings[mode] = `${zh ? "本地参数设置无法读取" : "Could not read saved settings"} (${mode}): ${reason instanceof Error ? reason.message : String(reason)}`;
        }
    }
    const saveSettings = (mode: MathFnMode) => {
        localStorage.setItem(`tesserxel.mathfn.settings.v1.${mode}`, JSON.stringify(settingsByMode[mode]));
    };
    const currentMode = () => modeSelect.value as MathFnMode;
    const updatePresetSelection = (mode: MathFnMode) => {
        const currentExpressions = Array.from(expressions.querySelectorAll<HTMLInputElement>("[data-expression]"), input => input.value);
        const matchingIndex = presets.findIndex(preset =>
            preset.mode === mode &&
            preset.expressions.length === currentExpressions.length &&
            preset.expressions.every((expression, index) => expression === currentExpressions[index])
        );
        presetSelect.value = matchingIndex < 0 ? "" : String(matchingIndex);
    };
    let activeMode = currentMode();
    const currentRanges = (mode = currentMode()) => {
        const ranges: MathFnRanges = {};
        for (const name of parameterNames[mode]) {
            const inputs = rangesElement.querySelectorAll<HTMLInputElement>(`[data-range="${name}"]`);
            ranges[name] = { min: Number(inputs[0].value), max: Number(inputs[1].value) };
        }
        return ranges;
    };
    const currentDensity = (mode = currentMode()) => {
        const density: Record<string, number> = {};
        for (const name of parameterNames[mode]) {
            const input = rangesElement.querySelector<HTMLInputElement>(`[data-density="${name}"]`);
            density[name] = Number(input.value);
        }
        return density;
    };
    const rememberCurrentSettings = (mode = currentMode()) => {
        settingsByMode[mode] = {
            ranges: currentRanges(mode),
            density: currentDensity(mode),
            thickness: Number(thicknessInput.value) || settingsByMode[mode].thickness
        };
        saveSettings(mode);
    };
    const updateForm = () => {
        const mode = currentMode();
        error.textContent = savedSettingsWarnings[mode] ?? "";
        expressions.replaceChildren();
        rangesElement.replaceChildren();
        let savedExpressions = defaultExpressions[mode];
        try {
            savedExpressions = readExpressions(mode);
        } catch (reason) {
            error.textContent = reason instanceof Error ? reason.message : String(reason);
        }
        for (let i = 0; i < defaultExpressions[mode].length; i++) {
            const label = document.createElement("label");
            label.style.cssText = "display:flex;align-items:center;gap:6px;margin:6px 0";
            label.textContent = labels[mode][i];
            const input = document.createElement("input");
            input.type = "text";
            input.value = savedExpressions[i];
            input.style.cssText = "flex:1;min-width:0";
            input.dataset.expression = "true";
            input.addEventListener("input", () => {
                try {
                    saveExpressions(mode, Array.from(expressions.querySelectorAll<HTMLInputElement>("[data-expression]")).map(field => field.value));
                } catch (reason) {
                    error.textContent = `${zh ? "无法保存表达式" : "Could not save expressions"}: ${reason instanceof Error ? reason.message : String(reason)}`;
                }
                updatePresetSelection(mode);
                requestBuild();
            });
            label.appendChild(input);
            expressions.appendChild(label);
        }
        const settings = settingsByMode[mode];
        symmetricRangeRow.style.display = mode === "curve" ? "none" : "flex";
        const densityLimit = mode === "implicit" || mode === "volume" ? 32 : 128;
        symmetricDensityInput.max = String(densityLimit);
        symmetricDensityInput.value = String(settings.density[parameterNames[mode][0]]);
        for (const name of parameterNames[mode]) {
            const range = settings.ranges[name];
            const row = document.createElement("label");
            row.style.cssText = "display:flex;align-items:center;gap:6px;margin:6px 0";
            row.append(`${name} ${zh ? "范围" : "range"}`);
            for (const [part, value] of [["min", range.min], ["max", range.max]] as const) {
                const input = document.createElement("input");
                input.type = "number";
                input.step = "any";
                input.value = String(value);
                input.dataset.range = name;
                input.dataset.rangePart = part;
                input.style.cssText = "width:66px;font:inherit";
                row.appendChild(input);
            }
            const densityLabel = document.createElement("span");
            densityLabel.textContent = zh ? "细分" : "divisions";
            row.appendChild(densityLabel);
            const densityInput = document.createElement("input");
            densityInput.type = "number";
            densityInput.min = "2";
            densityInput.max = mode === "implicit" || mode === "volume" ? "32" : "128";
            densityInput.value = String(settings.density[name]);
            densityInput.dataset.density = name;
            densityInput.style.cssText = "width:46px;font:inherit";
            row.appendChild(densityInput);
            rangesElement.appendChild(row);
        }
        thicknessRow.style.display = mode === "curve" || mode === "surface" ? "block" : "none";
        thicknessInput.value = String(settings.thickness);
        updatePresetOptions(mode);
        updatePresetSelection(mode);
    };
    applySymmetricRangeButton.addEventListener("click", () => {
        const magnitude = Number(symmetricRangeInput.value);
        const density = Number(symmetricDensityInput.value);
        const mode = currentMode();
        const densityLimit = mode === "implicit" || mode === "volume" ? 32 : 128;
        if (!symmetricRangeInput.value.trim() || !Number.isFinite(magnitude) || magnitude <= 0 ||
            !symmetricDensityInput.value.trim() || !Number.isInteger(density) || density < 2 || density > densityLimit) {
            error.textContent = localizedError(zh,
                `对称范围必须大于 0，细分必须是 2 到 ${densityLimit} 之间的整数`,
                `Symmetric range must be greater than 0 and divisions must be an integer from 2 to ${densityLimit}`
            ).message;
            return;
        }
        rangesElement.querySelectorAll<HTMLInputElement>("[data-range]").forEach(input => {
            input.value = input.dataset.rangePart === "min" ? String(-magnitude) : String(magnitude);
        });
        rangesElement.querySelectorAll<HTMLInputElement>("[data-density]").forEach(input => {
            input.value = String(density);
        });
        requestBuild();
    });
    panel.addEventListener("change", event => {
        const target = event.target;
        if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement) requestBuild();
    });
    function updatePresetOptions(mode: MathFnMode) {
        presetSelect.replaceChildren();
        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.textContent = zh ? "选择一个示例函数…" : "Choose an example function...";
        presetSelect.appendChild(placeholder);
        for (const [index, preset] of presets.entries()) {
            if (preset.mode !== mode) continue;
            const option = document.createElement("option");
            option.value = String(index);
            option.textContent = preset.name[zh ? "zh" : "en"];
            presetSelect.appendChild(option);
        }
    }
    modeSelect.addEventListener("change", () => {
        try {
            saveExpressions(activeMode, Array.from(expressions.querySelectorAll<HTMLInputElement>("[data-expression]")).map(input => input.value));
            rememberCurrentSettings(activeMode);
            activeMode = currentMode();
            updateForm();
        } catch (reason) {
            error.textContent = reason instanceof Error ? reason.message : String(reason);
        }
        try {
            localStorage.setItem("tesserxel.mathfn.mode.v1", activeMode);
        } catch (reason) {
            error.textContent = `${zh ? "无法保存函数模式" : "Could not save function mode"}: ${reason instanceof Error ? reason.message : String(reason)}`;
        }
        requestBuild();
    });
    presetSelect.addEventListener("change", () => {
        if (!presetSelect.value) return;
        const preset = presets[Number(presetSelect.value)];
        saveExpressions(activeMode, Array.from(expressions.querySelectorAll<HTMLInputElement>("[data-expression]")).map(input => input.value));
        rememberCurrentSettings(activeMode);
        modeSelect.value = preset.mode;
        activeMode = preset.mode;
        updateForm();
        const fields = expressions.querySelectorAll<HTMLInputElement>("[data-expression]");
        preset.expressions.forEach((value, index) => { fields[index].value = value; });
        try {
            saveExpressions(preset.mode, preset.expressions);
        } catch (reason) {
            error.textContent = `${zh ? "无法保存表达式" : "Could not save expressions"}: ${reason instanceof Error ? reason.message : String(reason)}`;
        }
        settingsByMode[preset.mode] = {
            ranges: structuredClone(preset.ranges),
            density: typeof preset.density === "number" ? makeDensity(preset.mode, preset.density) : { ...preset.density },
            thickness: preset.thickness ?? 0.08
        };
        try {
            localStorage.setItem("tesserxel.mathfn.mode.v1", preset.mode);
        } catch (reason) {
            error.textContent = `${zh ? "无法保存函数模式" : "Could not save function mode"}: ${reason instanceof Error ? reason.message : String(reason)}`;
        }
        updateForm();
        updatePresetSelection(preset.mode);
        requestBuild();
    });
    button.addEventListener("click", () => {
        error.textContent = "";
        button.disabled = true;
        onClear();
        try {
            const mode = currentMode();
            const formulas = Array.from(expressions.querySelectorAll<HTMLInputElement>("[data-expression]")).map(input => input.value);
            const ranges = currentRanges();
            for (const [name, range] of Object.entries(ranges)) {
                if (!Number.isFinite(range.min) || !Number.isFinite(range.max) || range.max <= range.min) {
                    throw new Error(`${name} ${zh ? "范围上限必须大于有限的下限" : "range maximum must be greater than its finite minimum"}`);
                }
            }
            const density = currentDensity(mode);
            const densityLimit = mode === "implicit" || mode === "volume" ? 32 : 128;
            for (const name of parameterNames[mode]) {
                density[name] = Math.max(2, Math.min(densityLimit, Math.floor(density[name] || 2)));
            }
            const thickness = Math.max(0.005, Math.min(1, Number(thicknessInput.value) || 0.08));
            saveExpressions(mode, formulas);
            settingsByMode[mode] = { ranges, density, thickness };
            saveSettings(mode);
            thicknessInput.value = String(thickness);
            onBuild(mode, formulas, ranges, density, thickness);
        } catch (reason) {
            error.textContent = reason instanceof Error ? reason.message : String(reason);
        } finally {
            button.disabled = false;
        }
    });
    updateForm();
    button.hidden = autoUpdateInput.checked;
    button.click();
}

export namespace mathfn {
    export async function load(language?: string) {
        const zh = isChinese(language);
        const FOUR = tesserxel.four;
        const canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
        canvas.addEventListener("contextmenu", event => event.preventDefault());
        const app = await FOUR.App.create({ canvas });
        const scene = app.scene;
        scene.setBackgroundColor({ r: 0.96, g: 0.97, b: 1, a: 0.05});
        const camera = app.camera as tesserxel.four.PerspectiveCamera;
        camera.position.w = 3.2;
        app.retinaController.setOpacity(10);
        scene.add(camera);
        scene.add(new FOUR.AmbientLight(0.35));
        scene.add(new FOUR.DirectionalLight([0.85, 0.8, 0.72], new math.Vec4(0.4, -0.5, -0.4, 1).norms()));
        scene.add(new FOUR.DirectionalLight([0.25, 0.3, 0.4], new math.Vec4(-0.4, 0.3, 0.7, -0.5).norms()));
        app.controllerRegistry.add(new tesserxel.ui.ctrl.TrackBallController(camera, true));
        let currentMeshes: tesserxel.four.Mesh[] = [];
        addControls((mode, sources, ranges, density, thickness) => {
            let mesh: tesserxel.mesh.TetraMesh;
            if (mode === "implicit") {
                mesh = buildImplicit(new ExpressionParser(sources[0], zh).parse(), density, ranges);
            } else {
                const exprs = sources.map(source => new ExpressionParser(source, zh).parse());
                if (mode === "curve") mesh = buildCurve(exprs, density.t, ranges.t, thickness);
                else if (mode === "surface") mesh = buildSurface(exprs, { u: density.u, v: density.v }, { u: ranges.u, v: ranges.v }, thickness);
                else mesh = buildVolume(exprs, { u: density.u, v: density.v, t: density.t }, { u: ranges.u, v: ranges.v, t: ranges.t });
            }
            const material = new FOUR.LambertMaterial([0.15, 0.53, 0.85, 1]);
            material.cullMode = "none";
            for (const object of currentMeshes) scene.removeChild(object);
            currentMeshes = createTetraMeshObjects(mesh, material);
            for (const object of currentMeshes) scene.add(object);
        }, () => {
            for (const object of currentMeshes) scene.removeChild(object);
            currentMeshes = [];
        }, language);
        app.run();
    }
}

export namespace complexfn {
    export async function load(language?: string) {
        const zh = isChinese(language);
        const FOUR = tesserxel.four;
        const gpuCanvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
        gpuCanvas.addEventListener("contextmenu", event => event.preventDefault());
        const app = await FOUR.App.create({ canvas: gpuCanvas });
        app.renderer.tetraNumOccupancyRatio /= extraSafetyCoeff;
        const scene = app.scene;
        scene.setBackgroundColor({ r: 0.96, g: 0.97, b: 1, a: 0.05 });
        const camera = app.camera as tesserxel.four.PerspectiveCamera;
        camera.position.w = 3.8;
        app.retinaController?.setOpacity(10);
        scene.add(camera);
        scene.add(new FOUR.AmbientLight(0.35));
        scene.add(new FOUR.DirectionalLight([0.85, 0.8, 0.72], new math.Vec4(0.4, -0.5, -0.4, 1).norms()));
        scene.add(new FOUR.DirectionalLight([0.25, 0.3, 0.4], new math.Vec4(-0.4, 0.3, 0.7, -0.5).norms()));
        app.controllerRegistry.add(new tesserxel.ui.ctrl.TrackBallController(camera, true));

            const panel = document.createElement("div");
            panel.style.cssText = "position:fixed;z-index:6;left:12px;top:12px;width:min(300px,calc(100vw - 24px));min-width:min(230px,calc(100vw - 24px));min-height:0;max-width:calc(100vw - 24px);max-height:calc(100vh - 24px);overflow:auto;resize:both;padding:7px 9px 9px;background:#ffffffed;color:#222;border-radius:6px;font:11px sans-serif;box-sizing:border-box";
        panel.innerHTML = `
            <div data-panel-header style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:5px;cursor:move;user-select:none;touch-action:none">
                <strong>${zh ? "复变函数四维图像" : "Complex Function 4D Graph"}</strong>
                <button type="button" data-collapse aria-expanded="true" aria-label="${zh ? "收起面板" : "Collapse panel"}" style="cursor:pointer">−</button>
            </div>
            <div data-panel-content>
                <label style="display:block;margin-bottom:6px">${zh ? "模式" : "Mode"}
                    <select data-function-mode>
                        <option value="explicit">${zh ? "显函数 f(z)" : "Explicit f(z)"}</option>
                        <option value="implicit">${zh ? "隐函数 f(z₁,z₂)=0" : "Implicit f(z₁,z₂)=0"}</option>
                    </select>
                </label>
                <label style="display:block;margin:6px 0">${zh ? "着色" : "Coloring"}
                    <select data-color-mode>
                        <option value="default">${zh ? "默认" : "Default"}</option>
                        <option value="input">${zh ? "按 z 着色" : "z"}</option>
                        <option value="output">${zh ? "按 f(z) 着色" : "f(z)"}</option>
                    </select>
                </label>
                <div data-explicit-controls>
                <label style="display:block;margin:8px 0">${zh ? "预设" : "Presets"}
                    <select data-preset style="width:100%"></select>
                </label>
                <label style="display:block">f(z)
                    <input data-expression type="text" style="display:block;width:100%;box-sizing:border-box;margin-top:4px">
                </label>
                <label>${zh ? "网格细分" : "Grid divisions"}
                    <input data-density type="number" min="4" max="96" step="1" value="28" style="width:64px">
                </label>
                <label style="display:block;margin-top:6px">
                    <input data-clip-output type="checkbox"> ${zh ? "按输出坐标裁剪 z/w 范围" : "Clip output coordinates to a z/w box"}
                </label>
                <div data-output-range style="display:flex;flex-wrap:wrap;gap:4px 8px;margin-top:3px">
                    <label>Re f(z) <input data-re-min type="number" step="any" value="-4" style="width:58px">
                        ${zh ? "到" : "to"} <input data-re-max type="number" step="any" value="4" style="width:58px"></label>
                    <label>Im f(z) <input data-im-min type="number" step="any" value="-4" style="width:58px">
                        ${zh ? "到" : "to"} <input data-im-max type="number" step="any" value="4" style="width:58px"></label>
                </div>
                <div style="display:flex;align-items:center;gap:6px;margin-top:3px">
                    <label>${zh ? "Re/Im 对称范围 ±" : "Symmetric Re/Im range ±"}
                        <input data-output-symmetric-value type="number" min="0" step="any" value="4" style="width:58px">
                    </label>
                    <button type="button" data-apply-output-symmetric>${zh ? "批量设置" : "Apply to both"}</button>
                </div>
                </div>
                <div data-implicit-controls style="display:none">
                    <label style="display:block;margin-bottom:6px">${zh ? "预设" : "Presets"}
                        <select data-implicit-preset style="width:100%">
                            <option value="">${zh ? "选择一个隐函数…" : "Choose an implicit function..."}</option>
                        </select>
                    </label>
                    <label style="display:block">f(z₁,z₂)=0
                        <input data-implicit-expression type="text" value="z1+z2" style="display:block;width:100%;box-sizing:border-box;margin-top:4px">
                    </label>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:8px">
                        <label>Re z₁ <input data-implicit-range="x" data-range-part="min" type="number" step="any" value="-2" style="width:54px">
                            ${zh ? "到" : "to"} <input data-implicit-range="x" data-range-part="max" type="number" step="any" value="2" style="width:54px"></label>
                        <label>Im z₁ <input data-implicit-range="y" data-range-part="min" type="number" step="any" value="-2" style="width:54px">
                            ${zh ? "到" : "to"} <input data-implicit-range="y" data-range-part="max" type="number" step="any" value="2" style="width:54px"></label>
                        <label>Re z₂ <input data-implicit-range="u" data-range-part="min" type="number" step="any" value="-2" style="width:54px">
                            ${zh ? "到" : "to"} <input data-implicit-range="u" data-range-part="max" type="number" step="any" value="2" style="width:54px"></label>
                        <label>Im z₂ <input data-implicit-range="v" data-range-part="min" type="number" step="any" value="-2" style="width:54px">
                            ${zh ? "到" : "to"} <input data-implicit-range="v" data-range-part="max" type="number" step="any" value="2" style="width:54px"></label>
                    </div>
                    <div style="display:flex;gap:8px;margin-top:6px">
                        <label>${zh ? "xy 细分" : "xy divisions"}
                            <input data-implicit-density="xy" type="number" min="2" max="32" step="1" value="8" style="width:48px">
                        </label>
                        <label>${zh ? "zw 细分" : "zw divisions"}
                            <input data-implicit-density="zw" type="number" min="2" max="32" step="1" value="8" style="width:48px">
                        </label>
                    </div>
                    <div style="display:flex;flex-wrap:wrap;gap:6px 12px;margin-top:6px">
                        <label>${zh ? "z₁ 范围 ±" : "z₁ range ±"}
                            <input data-implicit-symmetric="z1" type="number" min="0" step="any" value="2" style="width:48px">
                        </label>
                        <button type="button" data-apply-implicit-symmetric="z1">${zh ? "批量设置 z₁" : "Set z₁ range"}</button>
                        <label>${zh ? "z₂ 范围 ±" : "z₂ range ±"}
                            <input data-implicit-symmetric="z2" type="number" min="0" step="any" value="2" style="width:48px">
                        </label>
                        <button type="button" data-apply-implicit-symmetric="z2">${zh ? "批量设置 z₂" : "Set z₂ range"}</button>
                    </div>
                </div>
                <div style="display:flex;gap:8px;margin-top:5px">
                    <label><input data-z1-plane type="checkbox"> ${zh ? "显示 z₁ 平面" : "Show z₁ plane"}</label>
                    <label><input data-z2-plane type="checkbox"> ${zh ? "显示 z₂ 平面" : "Show z₂ plane"}</label>
                </div>
                <label style="display:block;margin-top:6px">${zh ? "法向厚度" : "Normal thickness"}
                    <input data-thickness type="number" min="0.005" max="1" step="0.005" value="0.06" style="width:64px">
                </label>
                <label style="display:block;margin-top:6px">
                    <input data-auto-update type="checkbox" checked> ${zh ? "自动更新" : "Auto update"}
                </label>
                <button type="button" data-build hidden style="margin-top:8px">${zh ? "生成 / 更新" : "Build / Update"}</button>
                <div data-error role="status" style="color:#a00;white-space:pre-wrap;margin-top:8px"></div>
            </div>`;
        document.body.appendChild(panel);

        const header = panel.querySelector("[data-panel-header]") as HTMLDivElement;
        const content = panel.querySelector("[data-panel-content]") as HTMLDivElement;
        const collapse = panel.querySelector("[data-collapse]") as HTMLButtonElement;
        const functionModeSelect = panel.querySelector("[data-function-mode]") as HTMLSelectElement;
        const explicitControls = panel.querySelector("[data-explicit-controls]") as HTMLDivElement;
        const implicitControls = panel.querySelector("[data-implicit-controls]") as HTMLDivElement;
        const expressionInput = panel.querySelector("[data-expression]") as HTMLInputElement;
        const implicitExpressionInput = panel.querySelector("[data-implicit-expression]") as HTMLInputElement;
        const implicitPresetSelect = panel.querySelector("[data-implicit-preset]") as HTMLSelectElement;
        const presetSelect = panel.querySelector("[data-preset]") as HTMLSelectElement;
        const populateComplexPresetSelect = (
            select: HTMLSelectElement,
            presets: ComplexPreset[],
            placeholder: string
        ) => {
            select.replaceChildren();
            const emptyOption = document.createElement("option");
            emptyOption.value = "";
            emptyOption.textContent = placeholder;
            select.appendChild(emptyOption);
            for (const preset of presets) {
                const option = document.createElement("option");
                option.value = preset.value;
                option.textContent = preset.name[zh ? "zh" : "en"];
                select.appendChild(option);
            }
        };
        populateComplexPresetSelect(
            presetSelect,
            functionPresets.complexExplicit,
            zh ? "选择一个示例函数…" : "Choose an example function..."
        );
        populateComplexPresetSelect(
            implicitPresetSelect,
            functionPresets.complexImplicit,
            zh ? "选择一个隐函数…" : "Choose an implicit function..."
        );
        const densityInput = panel.querySelector("[data-density]") as HTMLInputElement;
        const autoUpdateInput = panel.querySelector("[data-auto-update]") as HTMLInputElement;
        const buildButton = panel.querySelector("[data-build]") as HTMLButtonElement;
        const thicknessInput = panel.querySelector("[data-thickness]") as HTMLInputElement;
        const colorModeSelect = panel.querySelector("[data-color-mode]") as HTMLSelectElement;
        const z1PlaneInput = panel.querySelector("[data-z1-plane]") as HTMLInputElement;
        const z2PlaneInput = panel.querySelector("[data-z2-plane]") as HTMLInputElement;
        const clipOutputInput = panel.querySelector("[data-clip-output]") as HTMLInputElement;
        const outputRangeInputs = {
            reMin: panel.querySelector("[data-re-min]") as HTMLInputElement,
            reMax: panel.querySelector("[data-re-max]") as HTMLInputElement,
            imMin: panel.querySelector("[data-im-min]") as HTMLInputElement,
            imMax: panel.querySelector("[data-im-max]") as HTMLInputElement
        };
        const outputRangeRow = panel.querySelector("[data-output-range]") as HTMLDivElement;
        const outputSymmetricInput = panel.querySelector("[data-output-symmetric-value]") as HTMLInputElement;
        const applyOutputSymmetricButton = panel.querySelector("[data-apply-output-symmetric]") as HTMLButtonElement;
        const outputSymmetricRow = applyOutputSymmetricButton.parentElement as HTMLDivElement;
        const implicitRangeInputs = Object.fromEntries(
            (["x", "y", "u", "v"] as const).map(name => [
                name,
                {
                    min: panel.querySelector<HTMLInputElement>(`[data-implicit-range="${name}"][data-range-part="min"]`)!,
                    max: panel.querySelector<HTMLInputElement>(`[data-implicit-range="${name}"][data-range-part="max"]`)!
                }
            ])
        ) as Record<"x" | "y" | "u" | "v", { min: HTMLInputElement; max: HTMLInputElement }>;
        const implicitDensityInputs = {
            xy: panel.querySelector<HTMLInputElement>('[data-implicit-density="xy"]')!,
            zw: panel.querySelector<HTMLInputElement>('[data-implicit-density="zw"]')!
        };
        const implicitSymmetricInputs = {
            z1: panel.querySelector<HTMLInputElement>('[data-implicit-symmetric="z1"]')!,
            z2: panel.querySelector<HTMLInputElement>('[data-implicit-symmetric="z2"]')!
        };
        const applyImplicitSymmetricButtons = panel.querySelectorAll<HTMLButtonElement>("[data-apply-implicit-symmetric]");
        const updateOutputRangeState = () => {
            outputRangeRow.style.display = clipOutputInput.checked ? "flex" : "none";
            outputSymmetricRow.style.display = clipOutputInput.checked ? "flex" : "none";
            for (const input of Object.values(outputRangeInputs)) input.disabled = !clipOutputInput.checked;
        };
        const errorElement = panel.querySelector("[data-error]") as HTMLDivElement;
        panel.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLButtonElement>("input,select,button")
            .forEach(control => { control.style.font = "inherit"; });
        updateOutputRangeState();
        collapse.addEventListener("click", () => {
            const collapsed = content.hidden;
            content.hidden = !collapsed;
            panel.style.height = collapsed ? "" : "auto";
            collapse.textContent = collapsed ? "−" : "+";
            collapse.setAttribute("aria-expanded", String(collapsed));
            collapse.setAttribute("aria-label", collapsed
                ? (zh ? "收起面板" : "Collapse panel")
                : (zh ? "展开面板" : "Expand panel"));
        });
        let dragStart: { x: number; y: number; left: number; top: number } | undefined;
        header.addEventListener("pointerdown", event => {
            if ((event.target as HTMLElement).closest("button")) return;
            const rect = panel.getBoundingClientRect();
            dragStart = { x: event.clientX, y: event.clientY, left: rect.left, top: rect.top };
            header.setPointerCapture(event.pointerId);
        });
        header.addEventListener("pointermove", event => {
            if (!dragStart) return;
            const left = Math.max(0, Math.min(window.innerWidth - panel.offsetWidth, dragStart.left + event.clientX - dragStart.x));
            const top = Math.max(0, Math.min(window.innerHeight - header.offsetHeight, dragStart.top + event.clientY - dragStart.y));
            panel.style.left = `${left}px`;
            panel.style.top = `${top}px`;
        });
        const stopDragging = () => { dragStart = undefined; };
        header.addEventListener("pointerup", stopDragging);
        header.addEventListener("pointercancel", stopDragging);

        const mapWidget = document.createElement("div");
        const initialMapSize = Math.max(80, Math.min(320 / 2, window.innerWidth - 24, window.innerHeight - 24));
        mapWidget.style.cssText = `position:fixed;z-index:4;right:12px;bottom:12px;width:${initialMapSize}px;height:${initialMapSize}px;min-width:80px;min-height:22px;max-width:calc(100vw - 24px);max-height:calc(100vh - 24px);overflow:hidden;border-radius:6px;background:#111;box-shadow:0 2px 12px #0005;font:10px sans-serif;box-sizing:border-box`;
        const mapHeader = document.createElement("div");
        mapHeader.style.cssText = "position:absolute;z-index:1;top:0;left:0;right:0;height:24px;display:flex;align-items:center;justify-content:space-between;gap:4px;padding:0 5px;background:#2229;color:#fff;cursor:move;touch-action:none;box-sizing:border-box";
        const mapTitle = document.createElement("strong");
        mapTitle.textContent = zh ? "二维标准着色" : "2D Graph";
        mapTitle.style.cssText = "font:10px sans-serif;text-shadow:0 1px 2px #000";
        const collapseMapButton = document.createElement("button");
        collapseMapButton.type = "button";
        collapseMapButton.textContent = "−";
        collapseMapButton.title = zh ? "收起颜色图" : "Collapse coloring";
        collapseMapButton.setAttribute("aria-label", collapseMapButton.title);
        mapHeader.append(mapTitle, collapseMapButton);
        mapWidget.appendChild(mapHeader);

        const mapContent = document.createElement("div");
        mapContent.style.cssText = "position:relative;width:100%;height:100%;line-height:0";
        const mapCanvas = document.createElement("canvas");
        mapCanvas.width = 360;
        mapCanvas.height = 360;
        mapCanvas.style.cssText = "display:block;width:100%;height:100%;background:#111;border-radius:6px;touch-action:none;box-sizing:border-box";
        mapCanvas.setAttribute("aria-label", zh ? "复平面函数颜色图；拖动平移，滚轮缩放" : "Complex domain coloring; drag to pan and use the wheel to zoom");
        const coordinateReadout = document.createElement("div");
        coordinateReadout.style.cssText = "position:absolute;right:5px;bottom:5px;padding:2px 4px;color:#fff;background:#0009;border-radius:2px;font:10px monospace;pointer-events:none";
        coordinateReadout.textContent = "z = (—, —)";
        mapContent.append(mapCanvas, coordinateReadout);
        const resizeHandle = document.createElement("div");
        resizeHandle.style.cssText = "position:absolute;right:0;bottom:0;width:18px;height:18px;background:linear-gradient(135deg,transparent 45%,#fff9 46%,#fff9 52%,transparent 53%,transparent 64%,#fff9 65%,#fff9 71%,transparent 72%);cursor:nwse-resize;touch-action:none";
        mapContent.appendChild(resizeHandle);
        mapWidget.appendChild(mapContent);
        document.body.appendChild(mapWidget);
        let expandedMapSize = initialMapSize;
        let mapCollapsed = false;
        const setMapCollapsed = (collapsed: boolean) => {
            mapCollapsed = collapsed;
            mapContent.hidden = collapsed;
            mapWidget.style.width = `${expandedMapSize}px`;
            mapWidget.style.height = collapsed ? "24px" : `${expandedMapSize}px`;
            collapseMapButton.textContent = collapsed ? "+" : "−";
            collapseMapButton.title = collapsed
                ? (zh ? "展开颜色图" : "Expand coloring")
                : (zh ? "收起颜色图" : "Collapse coloring");
            collapseMapButton.setAttribute("aria-label", collapseMapButton.title);
        };
        collapseMapButton.addEventListener("click", () => {
            if (!mapCollapsed) expandedMapSize = mapWidget.getBoundingClientRect().width;
            setMapCollapsed(!mapCollapsed);
        });
        let resizeStart: { x: number; y: number; size: number; right: number; bottom: number } | undefined;
        resizeHandle.addEventListener("pointerdown", event => {
            const rect = mapWidget.getBoundingClientRect();
            resizeStart = {
                x: event.clientX,
                y: event.clientY,
                size: rect.width,
                right: window.innerWidth - rect.right,
                bottom: window.innerHeight - rect.bottom
            };
            resizeHandle.setPointerCapture(event.pointerId);
            event.preventDefault();
            event.stopPropagation();
        });
        resizeHandle.addEventListener("pointermove", event => {
            if (!resizeStart) return;
            const maxSize = Math.max(80, Math.min(window.innerWidth, window.innerHeight) - 24);
            const delta = Math.abs(event.clientX - resizeStart.x) > Math.abs(event.clientY - resizeStart.y)
                ? event.clientX - resizeStart.x
                : event.clientY - resizeStart.y;
            const requestedSize = resizeStart.size + delta;
            const maxByPosition = Math.min(
                window.innerWidth - resizeStart.right,
                window.innerHeight - resizeStart.bottom
            );
            expandedMapSize = Math.max(80, Math.min(maxSize, maxByPosition, requestedSize));
            const actualDelta = expandedMapSize - resizeStart.size;
            mapWidget.style.right = `${Math.max(0, resizeStart.right - actualDelta)}px`;
            mapWidget.style.bottom = `${Math.max(0, resizeStart.bottom - actualDelta)}px`;
            if (!mapCollapsed) {
                mapWidget.style.width = `${expandedMapSize}px`;
                mapWidget.style.height = `${expandedMapSize}px`;
            }
        });
        const stopMapResizing = () => { resizeStart = undefined; };
        resizeHandle.addEventListener("pointerup", stopMapResizing);
        resizeHandle.addEventListener("pointercancel", stopMapResizing);
        window.addEventListener("resize", () => {
            const maxSize = Math.max(80, Math.min(window.innerWidth, window.innerHeight) - 24);
            expandedMapSize = Math.min(expandedMapSize, maxSize);
            if (!mapCollapsed) {
                mapWidget.style.width = `${expandedMapSize}px`;
                mapWidget.style.height = `${expandedMapSize}px`;
            }
        });
        let mapDragStart: { x: number; y: number; right: number; bottom: number } | undefined;
        mapHeader.addEventListener("pointerdown", event => {
            if ((event.target as HTMLElement).closest("button,input,label")) return;
            const rect = mapWidget.getBoundingClientRect();
            mapDragStart = {
                x: event.clientX,
                y: event.clientY,
                right: window.innerWidth - rect.right,
                bottom: window.innerHeight - rect.bottom
            };
            mapHeader.setPointerCapture(event.pointerId);
        });
        mapHeader.addEventListener("pointermove", event => {
            if (!mapDragStart) return;
            const width = mapWidget.offsetWidth;
            const height = mapWidget.offsetHeight;
            const left = Math.max(0, Math.min(window.innerWidth - width,
                window.innerWidth - width - mapDragStart.right + event.clientX - mapDragStart.x));
            const top = Math.max(0, Math.min(window.innerHeight - height,
                window.innerHeight - height - mapDragStart.bottom + event.clientY - mapDragStart.y));
            mapWidget.style.right = `${window.innerWidth - width - left}px`;
            mapWidget.style.bottom = `${window.innerHeight - height - top}px`;
        });
        const stopMapDragging = () => { mapDragStart = undefined; };
        mapHeader.addEventListener("pointerup", stopMapDragging);
        mapHeader.addEventListener("pointercancel", stopMapDragging);
        const context = mapCanvas.getContext("2d");
        let center = complex(0, 0);
        let span = 4;
        let graphCenterOffset = new math.Vec4(0, 0, 0, 0);
        const marker = new FOUR.Mesh(
            new FOUR.Geometry(tetraMesh.glome(1, 8, 8, 4)),
            new FOUR.LambertMaterial([1, 0, 0, 1])
        );
        marker.scale = new math.Vec4(0.18, 0.18, 0.18, 0.18);
        marker.material.cullMode = "none";
        marker.visible = false;
        scene.add(marker);
        let currentMeshes: tesserxel.four.Mesh[] = [];
        let z1PlaneMeshes: tesserxel.four.Mesh[] = [];
        let z2PlaneMeshes: tesserxel.four.Mesh[] = [];
        let activeExpression: ComplexExpr | undefined;
        let activeOutputClip: { reMin: number; reMax: number; imMin: number; imMax: number } | undefined;
        let graphBuildTimer = 0;
        let lastPointerPoint: Complex | undefined;
        let maxFunctionMagnitude = span * 1e5;
        const updateFunctionModeUI = () => {
            const implicit = functionModeSelect.value === "implicit";
            explicitControls.style.display = implicit ? "none" : "block";
            implicitControls.style.display = implicit ? "block" : "none";
            colorModeSelect.options[1].text = implicit
                ? (zh ? "按 z₁ 着色" : "by z₁")
                : (zh ? "按 z 着色" : "by z");
            colorModeSelect.options[2].text = implicit
                ? (zh ? "按 z₂ 着色" : "by z₂")
                : (zh ? "按 f(z) 着色" : "by f(z)");
            mapWidget.style.display = implicit ? "none" : "block";
            marker.visible = false;
        };
        let savedExpression = "z^2";
        let savedImplicitExpression = "z1+z2";
        try {
            savedExpression = localStorage.getItem("tesserxel.complexfn.expression.v1") ?? savedExpression;
            savedImplicitExpression = localStorage.getItem("tesserxel.complexfn.implicitExpression.v1") ?? savedImplicitExpression;
            const savedFunctionMode = localStorage.getItem("tesserxel.complexfn.mode.v1");
            if (savedFunctionMode === "explicit" || savedFunctionMode === "implicit") {
                functionModeSelect.value = savedFunctionMode;
            }
            const savedColorMode = localStorage.getItem("tesserxel.complexfn.colorMode.v1");
            if (savedColorMode === "default" || savedColorMode === "input" || savedColorMode === "output") {
                colorModeSelect.value = savedColorMode;
            }
            const savedExplicitSettings = localStorage.getItem("tesserxel.complexfn.explicitSettings.v1");
            if (savedExplicitSettings) {
                const settings = JSON.parse(savedExplicitSettings) as {
                    center?: { re?: number; im?: number };
                    span?: number;
                    density?: number;
                    thickness?: number;
                    clipOutput?: boolean;
                    outputClip?: { reMin?: number; reMax?: number; imMin?: number; imMax?: number };
                };
                if (typeof settings.center?.re === "number" && Number.isFinite(settings.center.re) &&
                    typeof settings.center.im === "number" && Number.isFinite(settings.center.im)) {
                    center = complex(settings.center.re, settings.center.im);
                }
                if (typeof settings.span === "number" && Number.isFinite(settings.span) && settings.span > 0) span = settings.span;
                if (typeof settings.density === "number" && Number.isInteger(settings.density)) densityInput.value = String(settings.density);
                if (typeof settings.thickness === "number" && Number.isFinite(settings.thickness) && settings.thickness > 0) thicknessInput.value = String(settings.thickness);
                if (typeof settings.clipOutput === "boolean") clipOutputInput.checked = settings.clipOutput;
                if (settings.outputClip) {
                    const outputValues = [
                        settings.outputClip.reMin, settings.outputClip.reMax,
                        settings.outputClip.imMin, settings.outputClip.imMax
                    ];
                    if (outputValues.every((value): value is number => typeof value === "number" && Number.isFinite(value))) {
                        outputRangeInputs.reMin.value = String(settings.outputClip.reMin);
                        outputRangeInputs.reMax.value = String(settings.outputClip.reMax);
                        outputRangeInputs.imMin.value = String(settings.outputClip.imMin);
                        outputRangeInputs.imMax.value = String(settings.outputClip.imMax);
                    }
                }
            }
            const savedImplicitSettings = localStorage.getItem("tesserxel.complexfn.implicitSettings.v1");
            let restoredImplicitSettings = false;
            if (savedImplicitSettings) {
                const settings = JSON.parse(savedImplicitSettings) as {
                    expression?: string;
                    ranges?: Partial<Record<"x" | "y" | "u" | "v", { min?: number; max?: number }>>;
                    xyDensity?: number;
                    zwDensity?: number;
                    thickness?: number;
                };
                if (settings.expression === savedImplicitExpression) {
                    for (const name of ["x", "y", "u", "v"] as const) {
                        const range = settings.ranges?.[name];
                        if (typeof range?.min === "number" && Number.isFinite(range.min)) implicitRangeInputs[name].min.value = String(range.min);
                        if (typeof range?.max === "number" && Number.isFinite(range.max)) implicitRangeInputs[name].max.value = String(range.max);
                    }
                    if (typeof settings.xyDensity === "number" && Number.isInteger(settings.xyDensity)) implicitDensityInputs.xy.value = String(settings.xyDensity);
                    if (typeof settings.zwDensity === "number" && Number.isInteger(settings.zwDensity)) implicitDensityInputs.zw.value = String(settings.zwDensity);
                    if (typeof settings.thickness === "number" && Number.isFinite(settings.thickness) && settings.thickness > 0) thicknessInput.value = String(settings.thickness);
                    restoredImplicitSettings = true;
                }
            }
            if (!restoredImplicitSettings) {
                const preset = functionPresets.complexImplicit.find(item => item.value === savedImplicitExpression);
                if (preset?.ranges && preset.xyDensity && preset.zwDensity) {
                    for (const name of ["x", "y", "u", "v"] as const) {
                        implicitRangeInputs[name].min.value = String(preset.ranges[name].min);
                        implicitRangeInputs[name].max.value = String(preset.ranges[name].max);
                    }
                    implicitDensityInputs.xy.value = String(preset.xyDensity);
                    implicitDensityInputs.zw.value = String(preset.zwDensity);
                    thicknessInput.value = String(preset.thickness);
                }
            }
        } catch (reason) {
            errorElement.textContent = `${zh ? "无法读取已保存的函数设置" : "Could not load saved function settings"}: ${reason instanceof Error ? reason.message : String(reason)}`;
        }
        updateOutputRangeState();
        expressionInput.value = savedExpression;
        implicitExpressionInput.value = savedImplicitExpression;
        presetSelect.value = savedExpression;
        implicitPresetSelect.value = savedImplicitExpression;
        updateFunctionModeUI();

        const paintDomainColoring = () => {
            if (!activeExpression) return;
            const width = mapCanvas.width;
            const height = mapCanvas.height;
            const image = context.createImageData(width, height);
            for (let py = 0; py < height; py++) {
                const im = center.im - (py / height - 0.5) * span;
                for (let px = 0; px < width; px++) {
                    const re = center.re + (px / width - 0.5) * span;
                    const value = activeExpression(complex(re, im));
                    const magnitude = Math.hypot(value.re, value.im);
                    const offset = (py * width + px) * 4;
                    if (!Number.isFinite(magnitude) || !Number.isFinite(value.re) || !Number.isFinite(value.im)) {
                        image.data[offset] = 15;
                        image.data[offset + 1] = 15;
                        image.data[offset + 2] = 20;
                    } else {
                        const hue = ((Math.atan2(value.im, value.re) / (Math.PI * 2)) + 1) % 1;
                        const contour = 0.5 + 0.5 * Math.cos(Math.PI * 2 * Math.log2(Math.max(magnitude, 1e-8)));
                        const brightness = (0.72 + 0.28 * (1 - Math.exp(-magnitude * 0.25))) * (0.88 + 0.12 * contour);
                        const sector = hue * 6;
                        const index = Math.floor(sector);
                        const fraction = sector - index;
                        const p = brightness * 0.15;
                        const q = brightness * (1 - 0.85 * fraction);
                        const t = brightness * (1 - 0.85 * (1 - fraction));
                        const colors = [
                            [brightness, t, p], [q, brightness, p], [p, brightness, t],
                            [p, q, brightness], [t, p, brightness], [brightness, p, q]
                        ][index % 6];
                        image.data[offset] = colors[0] * 255;
                        image.data[offset + 1] = colors[1] * 255;
                        image.data[offset + 2] = colors[2] * 255;
                    }
                    image.data[offset + 3] = 255;
                }
            }
            context.putImageData(image, 0, 0);
            const axisX = (0 - center.re) / span * width + width / 2;
            const axisY = (center.im - 0) / span * height + height / 2;
            context.strokeStyle = "#ffffff88";
            context.lineWidth = 1;
            context.beginPath();
            context.moveTo(axisX, 0);
            context.lineTo(axisX, height);
            context.moveTo(0, axisY);
            context.lineTo(width, axisY);
            context.stroke();
        };

        const updateMarker = (point: Complex) => {
            lastPointerPoint = point;
            if (!activeExpression) return;
            const value = activeExpression(point);
            const formatComplex = (z: Complex) => `${z.re.toFixed(3)}${z.im < 0 ? "" : "+"}${z.im.toFixed(3)}i`;
            coordinateReadout.textContent = `f(${formatComplex(point)})=${formatComplex(value)}`;
            if (activeOutputClip && (
                value.re < activeOutputClip.reMin || value.re > activeOutputClip.reMax ||
                value.im < activeOutputClip.imMin || value.im > activeOutputClip.imMax
            )) {
                marker.visible = false;
                return;
            }
            marker.position.set(
                point.re - graphCenterOffset.x,
                point.im - graphCenterOffset.y,
                value.re - graphCenterOffset.z,
                value.im - graphCenterOffset.w
            );
            marker.visible = true;
            marker.updateCoord();
        };
        const pointAtPointer = (event: MouseEvent) => {
            const rect = mapCanvas.getBoundingClientRect();
            const xRatio = (event.clientX - rect.left) / rect.width;
            const yRatio = (event.clientY - rect.top) / rect.height;
            return complex(center.re + (xRatio - 0.5) * span, center.im - (yRatio - 0.5) * span);
        };

        const build = () => {
            buildButton.disabled = true;
            errorElement.textContent = "";
            for (const object of [...currentMeshes, ...z1PlaneMeshes, ...z2PlaneMeshes]) scene.removeChild(object);
            currentMeshes = [];
            z1PlaneMeshes = [];
            z2PlaneMeshes = [];
            activeExpression = undefined;
            activeOutputClip = undefined;
            marker.visible = false;
            context.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
            try {
                const density = Number(densityInput.value);
                const thickness = Number(thicknessInput.value);
                if (!Number.isInteger(density) || density < 4 || density > 96) {
                    throw localizedError(zh, "网格细分必须是 4 到 96 之间的整数", "Grid divisions must be an integer from 4 to 96");
                }
                if (!Number.isFinite(thickness) || thickness <= 0 || thickness > 1) {
                    throw localizedError(zh, "法向厚度必须大于 0 且不超过 1", "Normal thickness must be greater than 0 and no more than 1");
                }
                if (functionModeSelect.value === "implicit") {
                    const ranges = Object.fromEntries(
                        (["x", "y", "u", "v"] as const).map(name => [
                            name,
                            {
                                min: Number(implicitRangeInputs[name].min.value),
                                max: Number(implicitRangeInputs[name].max.value)
                            }
                        ])
                    ) as ComplexImplicitRanges;
                    for (const [name, range] of Object.entries(ranges)) {
                        if (!Number.isFinite(range.min) || !Number.isFinite(range.max) || range.max <= range.min) {
                            throw localizedError(zh,
                                `${name} 范围必须为有限值，且上限大于下限`,
                                `${name} range must be finite with its maximum greater than its minimum`);
                        }
                    }
                    const xyDensity = Number(implicitDensityInputs.xy.value);
                    const zwDensity = Number(implicitDensityInputs.zw.value);
                    if (!Number.isInteger(xyDensity) || xyDensity < 2 ||
                        !Number.isInteger(zwDensity) || zwDensity < 2) {
                        throw localizedError(zh,
                            "xy 和 zw 细分都必须是大于等于 2 的整数",
                            "Both xy and zw divisions must be integers greater than or equal to 2");
                    }
                    const parsedExpression = new ComplexExpressionParser(implicitExpressionInput.value, zh).parse();
                    const mesh = buildComplexImplicitSurface(parsedExpression, ranges, xyDensity, zwDensity, thickness, zh);
                    const centerOffset = new math.Vec4(
                        (ranges.x.min + ranges.x.max) / 2,
                        (ranges.y.min + ranges.y.max) / 2,
                        (ranges.u.min + ranges.u.max) / 2,
                        (ranges.v.min + ranges.v.max) / 2
                    );
                    translateTetraMesh(mesh, centerOffset);
                    let material: tesserxel.four.Material;
                    if (colorModeSelect.value === "default") {
                        material = new FOUR.LambertMaterial([0.18, 0.58, 0.88, 1]);
                    } else {
                        const coordinate = colorModeSelect.value === "input"
                            ? "vec2f(coord.x, coord.y)"
                            : "vec2f(coord.z, coord.w)";
                        const wgsl = `
                            fn domainColorTexture(coord: vec4f) -> vec4f {
                                let z = ${coordinate};
                                let magnitude = length(z);
                                let hue = fract(atan2(z.y, z.x) / 6.28318530718 + 1.0);
                                let k = vec3f(hue * 6.0) + vec3f(0.0, 4.0, 2.0);
                                let rgb = clamp(abs(fract(k / 6.0) * 6.0 - 3.0) - 1.0, vec3f(0.0), vec3f(1.0));
                                let contour = 0.5 + 0.5 * cos(6.28318530718 * log2(max(magnitude, 0.00000001)));
                                let brightness = (0.72 + 0.28 * (1.0 - exp(-magnitude * 0.25))) * (0.88 + 0.12 * contour);
                                return vec4f(rgb * brightness, 1.0);
                            }`;
                        material = new FOUR.BasicMaterial(new FOUR.WgslTexture(wgsl, "domainColorTexture"));
                    }
                    material.cullMode = "none";
                    const nextMeshes = createTetraMeshObjects(mesh, material);
                    const nextZ1Meshes = z1PlaneInput.checked
                        ? createTetraMeshObjects(
                            buildComplexImplicitCoordinatePlane(ranges, xyDensity, zwDensity, thickness, false, centerOffset),
                            new FOUR.BasicMaterial([1, 0.85, 0.05, 1])
                        )
                        : [];
                    const nextZ2Meshes = z2PlaneInput.checked
                        ? createTetraMeshObjects(
                            buildComplexImplicitCoordinatePlane(ranges, xyDensity, zwDensity, thickness, true, centerOffset),
                            new FOUR.BasicMaterial([1, 1, 1, 1])
                        )
                        : [];
                    for (const plane of [...nextZ1Meshes, ...nextZ2Meshes]) plane.material.cullMode = "none";
                    for (const object of [...currentMeshes, ...z1PlaneMeshes, ...z2PlaneMeshes]) scene.removeChild(object);
                    currentMeshes = nextMeshes;
                    z1PlaneMeshes = nextZ1Meshes;
                    z2PlaneMeshes = nextZ2Meshes;
                    for (const object of [...currentMeshes, ...z1PlaneMeshes, ...z2PlaneMeshes]) scene.add(object);
                    activeExpression = undefined;
                    activeOutputClip = undefined;
                    marker.visible = false;
                    try {
                        localStorage.setItem("tesserxel.complexfn.implicitExpression.v1", implicitExpressionInput.value);
                        localStorage.setItem("tesserxel.complexfn.implicitSettings.v1", JSON.stringify({
                            expression: implicitExpressionInput.value,
                            ranges,
                            xyDensity,
                            zwDensity,
                            thickness
                        }));
                    } catch (reason) {
                        errorElement.textContent = `${zh ? "无法保存隐函数设置" : "Could not save implicit function settings"}: ${reason instanceof Error ? reason.message : String(reason)}`;
                    }
                    return;
                }
                let outputClip: { reMin: number; reMax: number; imMin: number; imMax: number } | undefined;
                if (clipOutputInput.checked) {
                    outputClip = {
                        reMin: Number(outputRangeInputs.reMin.value),
                        reMax: Number(outputRangeInputs.reMax.value),
                        imMin: Number(outputRangeInputs.imMin.value),
                        imMax: Number(outputRangeInputs.imMax.value)
                    };
                    if (Object.values(outputRangeInputs).some(input => !input.value.trim()) ||
                        !Object.values(outputClip).every(Number.isFinite) ||
                        outputClip.reMax <= outputClip.reMin || outputClip.imMax <= outputClip.imMin) {
                        throw localizedError(zh,
                            "Re f(z) 和 Im f(z) 的范围都必须是有限值，且上限大于下限",
                            "Re f(z) and Im f(z) ranges must be finite with each maximum greater than its minimum");
                    }
                }
                const parsedExpression = new ComplexExpressionParser(expressionInput.value, zh).parse();
                const markerRadius = thickness * 3;
                marker.scale = new math.Vec4(markerRadius, markerRadius, markerRadius, markerRadius);
                marker.updateCoord();
                maxFunctionMagnitude = Math.max(
                    span,
                    Math.abs(center.re) + span / 2,
                    Math.abs(center.im) + span / 2
                ) * 1e5;
                const expression: ComplexExpr = z => clampComplexMagnitude(parsedExpression(z), maxFunctionMagnitude);
                const mesh = buildComplexGraph(expression, center, span, density, thickness, zh, outputClip);
                const nextCenterOffset = getTetraMeshBoundsCenter(mesh, outputClip);
                translateTetraMesh(mesh, nextCenterOffset);
                const colorMode = colorModeSelect.value;
                let material: tesserxel.four.Material;
                if (colorMode === "default") {
                    material = new FOUR.LambertMaterial([0.18, 0.58, 0.88, 1]);
                } else {
                    const coordinate = colorMode === "input" ? "vec2f(coord.x, coord.y)" : "vec2f(coord.z, coord.w)";
                    const wgsl = `
                        fn domainColorTexture(coord: vec4f) -> vec4f {
                            let z = ${coordinate};
                            let magnitude = length(z);
                            let hue = fract(atan2(z.y, z.x) / 6.28318530718 + 1.0);
                            let k = vec3f(hue * 6.0) + vec3f(0.0, 4.0, 2.0);
                            let rgb = clamp(abs(fract(k / 6.0) * 6.0 - 3.0) - 1.0, vec3f(0.0), vec3f(1.0));
                            let contour = 0.5 + 0.5 * cos(6.28318530718 * log2(max(magnitude, 0.00000001)));
                            let brightness = (0.72 + 0.28 * (1.0 - exp(-magnitude * 0.25))) * (0.88 + 0.12 * contour);
                            return vec4f(rgb * brightness, 1.0);
                        }`;
                    material = new FOUR.BasicMaterial(new FOUR.WgslTexture(wgsl, "domainColorTexture"));
                }
                material.cullMode = "none";
                const nextMeshes = createTetraMeshObjects(mesh, material);
                const nextZ1Meshes = z1PlaneInput.checked &&
                    (!outputClip || (outputClip.reMin <= 0 && outputClip.reMax >= 0 &&
                        outputClip.imMin <= 0 && outputClip.imMax >= 0))
                    ? createTetraMeshObjects(
                        buildComplexCoordinatePlane(span, density, thickness, false, center, nextCenterOffset, outputClip),
                        new FOUR.BasicMaterial([1, 0.85, 0.05, 1])
                    )
                    : [];
                const nextZ2Meshes = z2PlaneInput.checked
                    ? createTetraMeshObjects(
                        buildComplexCoordinatePlane(span, density, thickness, true, center, nextCenterOffset, outputClip),
                        new FOUR.BasicMaterial([1, 1, 1, 1])
                    )
                    : [];
                for (const plane of [...nextZ1Meshes, ...nextZ2Meshes]) plane.material.cullMode = "none";
                for (const object of [...currentMeshes, ...z1PlaneMeshes, ...z2PlaneMeshes]) scene.removeChild(object);
                currentMeshes = nextMeshes;
                graphCenterOffset = nextCenterOffset;
                z1PlaneMeshes = nextZ1Meshes;
                z2PlaneMeshes = nextZ2Meshes;
                for (const object of [...currentMeshes, ...z1PlaneMeshes, ...z2PlaneMeshes]) scene.add(object);
                activeExpression = expression;
                activeOutputClip = outputClip;
                if (lastPointerPoint) updateMarker(lastPointerPoint);
                paintDomainColoring();
                try {
                    localStorage.setItem("tesserxel.complexfn.expression.v1", expressionInput.value);
                    localStorage.setItem("tesserxel.complexfn.explicitSettings.v1", JSON.stringify({
                        center,
                        span,
                        density,
                        thickness,
                        clipOutput: clipOutputInput.checked,
                        outputClip
                    }));
                } catch (reason) {
                    errorElement.textContent = `${zh ? "无法保存表达式" : "Could not save expression"}: ${reason instanceof Error ? reason.message : String(reason)}`;
                }
            } catch (reason) {
                errorElement.textContent = reason instanceof Error ? reason.message : String(reason);
            } finally {
                buildButton.disabled = false;
            }
        };
        const scheduleGraphBuild = () => {
            if (!autoUpdateInput.checked) return;
            window.clearTimeout(graphBuildTimer);
            graphBuildTimer = window.setTimeout(build, 120);
        };
        const requestBuild = () => {
            if (autoUpdateInput.checked) scheduleGraphBuild();
        };
        autoUpdateInput.addEventListener("change", () => {
            buildButton.hidden = autoUpdateInput.checked;
            if (autoUpdateInput.checked) scheduleGraphBuild();
            else window.clearTimeout(graphBuildTimer);
        });
        functionModeSelect.addEventListener("change", () => {
            updateFunctionModeUI();
            try {
                localStorage.setItem("tesserxel.complexfn.mode.v1", functionModeSelect.value);
            } catch (reason) {
                errorElement.textContent = `${zh ? "无法保存函数模式" : "Could not save function mode"}: ${reason instanceof Error ? reason.message : String(reason)}`;
            }
            if (functionModeSelect.value === "implicit") {
                try {
                    implicitExpressionInput.value =
                        localStorage.getItem("tesserxel.complexfn.implicitExpression.v1") ?? implicitExpressionInput.value;
                    implicitPresetSelect.value = implicitExpressionInput.value;
                } catch (reason) {
                    errorElement.textContent = `${zh ? "无法读取隐函数表达式" : "Could not load implicit expression"}: ${reason instanceof Error ? reason.message : String(reason)}`;
                }
            } else {
                try {
                    expressionInput.value = localStorage.getItem("tesserxel.complexfn.expression.v1") ?? expressionInput.value;
                    presetSelect.value = expressionInput.value;
                } catch (reason) {
                    errorElement.textContent = `${zh ? "无法读取显函数表达式" : "Could not load explicit expression"}: ${reason instanceof Error ? reason.message : String(reason)}`;
                }
            }
            requestBuild();
        });
        buildButton.addEventListener("click", build);
        colorModeSelect.addEventListener("change", () => {
            try {
                localStorage.setItem("tesserxel.complexfn.colorMode.v1", colorModeSelect.value);
            } catch (reason) {
                errorElement.textContent = `${zh ? "无法保存着色模式" : "Could not save coloring mode"}: ${reason instanceof Error ? reason.message : String(reason)}`;
            }
            requestBuild();
        });
        z1PlaneInput.addEventListener("change", requestBuild);
        z2PlaneInput.addEventListener("change", requestBuild);
        clipOutputInput.addEventListener("change", () => {
            updateOutputRangeState();
            requestBuild();
        });
        for (const input of Object.values(outputRangeInputs)) input.addEventListener("change", requestBuild);
        for (const input of Object.values(implicitRangeInputs).flatMap(range => [range.min, range.max])) {
            input.addEventListener("change", requestBuild);
        }
        for (const input of Object.values(implicitDensityInputs)) input.addEventListener("change", requestBuild);
        densityInput.addEventListener("change", requestBuild);
        thicknessInput.addEventListener("change", requestBuild);
        implicitPresetSelect.addEventListener("change", () => {
            if (!implicitPresetSelect.value) return;
            implicitExpressionInput.value = implicitPresetSelect.value;
            const preset = functionPresets.complexImplicit.find(item => item.value === implicitPresetSelect.value);
            if (preset) {
                if (preset.ranges) {
                    for (const name of ["x", "y", "u", "v"] as const) {
                        implicitRangeInputs[name].min.value = String(preset.ranges[name].min);
                        implicitRangeInputs[name].max.value = String(preset.ranges[name].max);
                    }
                }
                if (preset.xyDensity) implicitDensityInputs.xy.value = String(preset.xyDensity);
                if (preset.zwDensity) implicitDensityInputs.zw.value = String(preset.zwDensity);
                if (preset.thickness) thicknessInput.value = String(preset.thickness);
            }
            try {
                localStorage.setItem("tesserxel.complexfn.implicitExpression.v1", implicitExpressionInput.value);
            } catch (reason) {
                errorElement.textContent = `${zh ? "无法保存隐函数表达式" : "Could not save implicit expression"}: ${reason instanceof Error ? reason.message : String(reason)}`;
            }
            requestBuild();
        });
        applyImplicitSymmetricButtons.forEach(button => {
            button.addEventListener("click", () => {
                const variable = button.dataset.applyImplicitSymmetric as "z1" | "z2";
                const input = implicitSymmetricInputs[variable];
                const magnitude = Number(input.value);
                if (!input.value.trim() || !Number.isFinite(magnitude) || magnitude <= 0) {
                    errorElement.textContent = localizedError(
                        zh,
                        `${variable === "z1" ? "z₁" : "z₂"} 对称范围必须是大于 0 的有限数值`,
                        `${variable} symmetric range must be a finite number greater than 0`
                    ).message;
                    return;
                };
                const componentNames = variable === "z1" ? ["x", "y"] as const : ["u", "v"] as const;
                for (const name of componentNames) {
                    implicitRangeInputs[name].min.value = String(-magnitude);
                    implicitRangeInputs[name].max.value = String(magnitude);
                }
                requestBuild();
            });
        });
        applyOutputSymmetricButton.addEventListener("click", () => {
            const magnitude = Number(outputSymmetricInput.value);
            if (!outputSymmetricInput.value.trim() || !Number.isFinite(magnitude) || magnitude <= 0) {
                errorElement.textContent = localizedError(
                    zh,
                    "对称输出范围必须是大于 0 的有限数值",
                    "Symmetric output range must be a finite number greater than 0"
                ).message;
                return;
            }
            outputRangeInputs.reMin.value = String(-magnitude);
            outputRangeInputs.reMax.value = String(magnitude);
            outputRangeInputs.imMin.value = String(-magnitude);
            outputRangeInputs.imMax.value = String(magnitude);
            requestBuild();
        });
        presetSelect.addEventListener("change", () => {
            if (!presetSelect.value) return;
            expressionInput.value = presetSelect.value;
            const preset = functionPresets.complexExplicit.find(item => item.value === presetSelect.value);
            if (preset) {
                center = complex(preset.center?.re ?? 0, preset.center?.im ?? 0);
                if (preset.span) span = preset.span;
                if (preset.density) densityInput.value = String(preset.density);
                if (preset.thickness) thicknessInput.value = String(preset.thickness);
                paintDomainColoring();
            }
            requestBuild();
        });
        expressionInput.addEventListener("input", () => {
            const matchingPreset = Array.from(presetSelect.options).find(option => option.value === expressionInput.value);
            presetSelect.value = matchingPreset?.value ?? "";
            requestBuild();
        });
        implicitExpressionInput.addEventListener("input", () => {
            implicitPresetSelect.value = Array.from(implicitPresetSelect.options)
                .find(option => option.value === implicitExpressionInput.value)?.value ?? "";
            try {
                localStorage.setItem("tesserxel.complexfn.implicitExpression.v1", implicitExpressionInput.value);
            } catch (reason) {
                errorElement.textContent = `${zh ? "无法保存隐函数表达式" : "Could not save implicit expression"}: ${reason instanceof Error ? reason.message : String(reason)}`;
            }
            requestBuild();
        });
        let panStart: { x: number; y: number; center: Complex } | undefined;
        mapCanvas.addEventListener("pointerdown", event => {
            panStart = { x: event.clientX, y: event.clientY, center: { ...center } };
            mapCanvas.setPointerCapture(event.pointerId);
            event.preventDefault();
        });
        mapCanvas.addEventListener("pointermove", event => {
            if (panStart) {
                const rect = mapCanvas.getBoundingClientRect();
                center = complex(
                    panStart.center.re - (event.clientX - panStart.x) / rect.width * span,
                    panStart.center.im + (event.clientY - panStart.y) / rect.height * span
                );
                paintDomainColoring();
                scheduleGraphBuild();
            }
            updateMarker(pointAtPointer(event));
        });
        const stopPanning = () => { panStart = undefined; };
        mapCanvas.addEventListener("pointerup", stopPanning);
        mapCanvas.addEventListener("pointercancel", stopPanning);
        mapCanvas.addEventListener("pointerleave", () => { marker.visible = false; });
        mapCanvas.addEventListener("wheel", event => {
            event.preventDefault();
            const rect = mapCanvas.getBoundingClientRect();
            const xRatio = (event.clientX - rect.left) / rect.width;
            const yRatio = (event.clientY - rect.top) / rect.height;
            const anchored = complex(
                center.re + (xRatio - 0.5) * span,
                center.im - (yRatio - 0.5) * span
            );
            span = Math.max(0.08, Math.min(64, span * Math.exp(event.deltaY * 0.001)));
            center = complex(
                anchored.re - (xRatio - 0.5) * span,
                anchored.im + (yRatio - 0.5) * span
            );
            paintDomainColoring();
            updateMarker(pointAtPointer(event));
            scheduleGraphBuild();
        }, { passive: false });

        buildButton.hidden = autoUpdateInput.checked;
        build();
        app.run();
    }
}
