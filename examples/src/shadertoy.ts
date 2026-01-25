import { render, util, math } from "../../build/esm/tesserxel.js";
import { createCodemirrorEditor } from "../../playground/build/shadertoy.js"
const urlp = new URLSearchParams(window.location.search.slice(1));
const lang = urlp.get("lang") ?? (navigator.languages.join(",").includes("zh") ? "zh" : "en");

const skyGen_code = `
// "StarNest" Background Ported from https://www.shadertoy.com/view/XlfGRj

const iterations = 17;
const formuparam = 0.62;
const brightness: f32 = 0.0015;
const darkmatter: f32 = 0.300;
const distfading: f32 = 0.730;
const saturation: f32 = 0.850;

const volsteps: i32 = 20;
const stepsize: f32 = 0.1;

const zoom: f32 = 0.800;
const tile: f32 = 0.850;
const speed_const: f32 = 0.010;
fn mod_f(a: f32, b: f32) -> f32 {
    return a - b * floor(a / b);
}
fn mod_v4(a: vec4<f32>, b: vec4<f32>) -> vec4<f32> {
    return vec4<f32>(mod_f(a.x,b.x), mod_f(a.y,b.y), mod_f(a.z,b.z), mod_f(a.w,b.w));
}
fn background(ro: vec4f, rayDir: vec4f)->vec4f{
    let dir = normalize(rayDir);
    // let dir = (rayDir);
   
    // raymarch
    var s = 0.1;
    var fade = 1.0;
    var v = vec3<f32>(0.0);

    for (var r: i32 = 0; r < 10; r = r + 1) {
        var p = ro + s * dir * 0.5;
        p = abs(vec4<f32>(tile) - mod_v4(p, vec4<f32>(tile*2.0)));

        var pa = 0.0;
        var a = 0.0;

        for (var i: i32 = 0; i < iterations; i = i + 1) {
            p = abs(p) / dot(p, p) - vec4<f32>(formuparam);
            let plen = length(p);
            a += abs(plen - pa);
            pa = plen;
        } 
        let dm = max(0.0, darkmatter - a*a*0.001);
        a = a*a*a;

        if (r > 6) { fade *= (1.0 - dm); }

        v += vec3<f32>(fade);
        v += vec3<f32>(s, s*s, s*s*s*s) * a * brightness * fade;

        fade *= distfading;
        s += stepsize;
    }

    // color adjust
    let grey = vec3<f32>(length(v));
    let col = mix(grey, v, saturation);

    return vec4<f32>(col * 0.01, (col.x+col.y+col.z)*0.003);
}
`;

type Examples = { [name: string]: string };
const voxelExamples = {
    "Color-Cube": `fn mainVoxel(pos: vec3<f32>)->vec4f{
    return vec4f(pos*0.5+0.5, 1.0);
}`,
    "Shader-Art": `/// @background: black
fn palette(t: f32) -> vec3f {
    const a = vec3f(0.5, 0.5, 0.5);
    const b = vec3f(0.5, 0.5, 0.5);
    const c = vec3f(1.0, 1.0, 1.0);
    const d = vec3f(0.263, 0.416, 0.557);
    return a + (b * cos(6.28318 * ((c*t) + d)));
}

fn mainVoxel(pos: vec3f) -> vec4f {
    var uv = pos;
    let uv0 = uv;
    var finalColor = vec3f(0.0);

    for(var i = 0; i < 4; i++) {
        uv = fract(uv * 1.5) - 0.5;

        var d = length(uv) * exp(-length(uv0));

        var col = palette(length(uv0) + f32(i) * 0.4 + shadertoyTime * 0.4);

        d = sin(d * 8.0 + shadertoyTime) / 8.0;
        d = abs(d);

        d = pow(0.01 / d, 1.2);

        finalColor += col * d;
    }

    return vec4f(finalColor, finalColor.x + finalColor.y + finalColor.z);
}

// // Ported from Shader Art Coding (https://www.youtube.com/watch?v=f4s1h2YETNY)
// Ported from https://pongasoft.github.io/webgpu-shader-toy/ 
`,
    "Voronoi": `fn hash(p: vec3<f32>) -> vec3<f32> {
    let p_dot1 = dot(p, vec3<f32>(127.1, 311.7, 255.3));
    let p_dot2 = dot(p, vec3<f32>(269.5, 183.3, 146.7));
    let p_dot3 = dot(p, vec3<f32>(193.5, 69.3, 307.7));
    let s = sin(vec3<f32>(p_dot1, p_dot2,p_dot3)) * 18.5453;
    return fract(s);
}

fn voronoi(x: vec3<f32>) -> vec2<f32> {
    let n = floor(x);
    let f = fract(x);

    var m = vec4f(8.0, 0.0, 0.0, 0.0);
    for (var j: i32 = -1; j <= 1; j = j + 1) {
        for (var i: i32 = -1; i <= 1; i = i + 1) {
            for (var k: i32 = -1; k <= 1; k = k + 1) {
                let g = vec3<f32>(f32(i), f32(j), f32(k));
                let o = hash(n + g);
                let r = g - f + (0.5 + 0.5 * sin(shadertoyTime + 6.2831 * o));
                let d = dot(r, r);
                if (d < m.x) {
                    m = vec4f(d, o.x, o.y, o.z);
                }
            }
        }
    }

    return vec2<f32>(sqrt(m.x), m.y + m.z + m.w);
}

fn mainVoxel(pos: vec3<f32>)->vec4f{
    let p = pos*0.1;

    let scale = 14.0 + 6.0 * sin(0.2 * shadertoyTime);
    let c = voronoi(scale * p);

    var col = 0.5 + 0.5 * cos(c.y * 6.2831 + vec3<f32>(0.0, 1.0, 2.0));
    col = col * clamp(1.0 - 0.4 * c.x * c.x, 0.0, 1.0);
    col = col - (1.0 - smoothstep(0.08, 0.09, c.x));

    return vec4f(col, 1.0);
}
// Ported from https://www.shadertoy.com/view/MslGD8 by Inigo Quilez 
`,
    "Inversion": `/// @background: black
fn mainVoxel(coord: vec3<f32>) -> vec4f {
    let offset = shadertoyTime*10;
    var coord2 = coord * (2.6 + sin(offset * 0.01)) + sin(offset * 0.04) * vec3<f32>(1.0, 2.4, 3.5) * 1.0;
    coord2 = 5.0 * coord2 / dot(coord2, coord2) + sin(offset * 3.0) * vec3<f32>(1.1, 0.2, 0.4) * 0.05;

    if (
        fract(coord2.x) < 0.5 &&
        fract(coord2.y) < 0.5 &&
        fract(coord2.z) < 0.5 &&
        dot(coord, coord) < 1.0
    ) {
        let color = clamp(pow(coord + vec3<f32>(0.5, 0.5, 0.5), vec3<f32>(0.4, 0.4, 0.4)), vec3<f32>(0.0), vec3<f32>(1.0));
        return vec4f(color, 1.0 - dot(coord, coord));
    } else {
        return vec4f(0.0,0.0,0.0,0.0);
    }
}
`
};
const rayExamples = {
    "SDF": `// Ported from https://www.shadertoy.com/view/lt3BW2 by Inigo Quilez
/// @background: black
/// @camCtrl: trackball(0,0,0,-1)
fn opUnion(d1: f32, d2: f32) -> f32 {
    return min(d1, d2);
}

fn opSubtraction(d1: f32, d2: f32) -> f32 {
    return max(-d1, d2);
}

fn opIntersection(d1: f32, d2: f32) -> f32 {
    return max(d1, d2);
}

fn opSmoothUnion(d1: f32, d2: f32, k: f32) -> f32 {
    let h = max(k - abs(d1 - d2), 0.0);
    return min(d1, d2) - (h * h) * 0.25 / k;
}

fn opSmoothSubtraction(d1: f32, d2: f32, k: f32) -> f32 {
    return -opSmoothUnion(d1, -d2, k);
}

fn opSmoothIntersection(d1: f32, d2: f32, k: f32) -> f32 {
    return -opSmoothUnion(-d1, -d2, k);
}

// ----- Primitives -----

fn sdGlome(p: vec4f, r: f32) -> f32 {
    return length(p) - r;
}

fn sdRoundBox(p: vec4f, b: vec4f, r: f32) -> f32 {
    let d = abs(p) - b;
    return min(max(max(max(d.x, d.w), d.y), d.z), 0.0) + length(max(d, vec4f(0.0))) - r;
}

// ----- Map -----

fn map(p: vec4f) -> f32 {
    let pos = p - vec4f(0,0,0,-1);
    let an = sin(shadertoyTime);
    return opSmoothSubtraction(sdGlome(pos, 0.22*an+0.72),
    opIntersection(sdGlome(pos, 0.22*an+0.82),sdRoundBox(pos, vec4f(0.5), 0.1))
    ,0.1);

}

fn calcNormal(pos: vec4f) -> vec4f {
    let ep: f32 = 0.0001;
    let e = vec4f(0.5,-0.5, 0.0, 1.0);
    // 5-cell
    return normalize(
        e.xyyy * map(pos + e.xyyy * ep) +
        e.yyxy * map(pos + e.yyxy * ep) +
        e.yxyy * map(pos + e.yxyy * ep) +
        e.xxxy * map(pos + e.xxxy * ep) +
        e.zzzw * map(pos + e.zzzw * ep)
    );
}

fn calcSoftshadow(ro: vec4f, rd: vec4f, tmin: f32, tmax: f32, k: f32) -> f32 {
    var res: f32 = 1.0;
    var t: f32 = tmin;
    for (var i: i32 = 0; i < 50; i = i + 1) {
        let h = map(ro + rd * t);
        res = min(res, k * h / t);
        t = t + clamp(h, 0.02, 0.20);
        if (res < 0.005 || t > tmax) {
            break;
        }
    }
    return clamp(res, 0.0, 1.0);
}
const near = 0.0;
const far = 15.0;
fn mainRay(ro: vec4f, rayDir: vec4f)->vec4f{
    let rd = normalize(rayDir);
    var t = near;
    for (var i = 0; i < 64; i = i + 1) {
        let pos = ro + rd * t;
        let h = map(pos);
        if (abs(h) < 0.00001 || t > far) {
            break;
        }
        t = t + h;
    }
    var col=vec3f(0);
    var alpha = 0.01;
    if (t < far) {
        let pos = ro + rd * t;
        let nor = calcNormal(pos);
        let lig = normalize(vec4f(1.0, 0.8, -0.2,0.3));
        let dif = clamp(dot(nor, lig), 0.0, 1.0);
        let sha = calcSoftshadow(pos, lig, 0.001, 1.0, 16.0);
        let amb = 0.5 + 0.5 * nor.y;

        col = (vec3<f32>(0.05, 0.1, 0.15) * amb +
              vec3<f32>(1.0, 0.9, 0.8) * dif * sha)*(0.5+0.5*sin((pos.xyz)*(pos.wzy)*15+vec3f(1.0,1.414,1.732)*shadertoyTime));
        alpha = 1.0;
    }

    col = sqrt(col);

    return vec4f(col, alpha);
}
`,
    "Seascape": `// Ported from https://www.shadertoy.com/view/Ms2SD1
/// @resolution: 64
/// @stereoEyeOffset: 1
/// @moveSpeed: 0.01
const NUM_STEPS: i32 = 32;
const PI: f32 = 3.141592;
const EPSILON: f32 = 1e-3;

// sea constants
const ITER_GEOMETRY: i32 = 3;
const ITER_FRAGMENT: i32 = 5;
const SEA_HEIGHT: f32 = 0.6;
const SEA_CHOPPY: f32 = 4.0;
const SEA_SPEED: f32 = 0.8;
const SEA_FREQ: f32 = 0.16;
const SEA_BASE: vec3<f32> = vec3<f32>(0.0, 0.09, 0.18);
const SEA_WATER_COLOR = vec3<f32>(0.8, 0.9, 0.6) * 0.6;

fn SEA_TIME(iTime: f32) -> f32 {
    return 1.0 + iTime * SEA_SPEED;
}

const octave_m = mat3x3f(
    vec3f( 0.9642, -0.2116,  0.1610),
    vec3f( 0.2267,  0.9700, -0.0858),
    vec3f(-0.1363,  0.1186,  0.9834)
)*2.2;

fn hash(p: vec3<f32>) -> f32 {
    let h = dot(p, vec3<f32>(127.1, 311.7,145.6));
    return fract(sin(h) * 43758.5453123);
}

fn noise(p: vec3<f32>) -> f32 {
    let i = floor(p);
    let f = fract(p);
    let u = f * f * (vec3<f32>(3.0) - 2.0 * f);

    let a = hash(i + vec3<f32>(0.0, 0.0,0));
    let b = hash(i + vec3<f32>(1.0, 0.0,0));
    let c = hash(i + vec3<f32>(0.0, 1.0,0));
    let d = hash(i + vec3<f32>(1.0, 1.0,0));
    let e = hash(i + vec3<f32>(0.0, 0.0,1));
    let k = hash(i + vec3<f32>(1.0, 0.0,1));
    let g = hash(i + vec3<f32>(0.0, 1.0,1));
    let h = hash(i + vec3<f32>(1.0, 1.0,1));

    let mix_x1 = mix(a, b, u.x);
    let mix_x2 = mix(c, d, u.x);
  
    let mix_x12 = mix(e, k, u.x);
    let mix_x22 = mix(g, h, u.x);
  
  
    return -1.0 + 2.0 * mix(mix(mix_x1, mix_x2, u.y), mix(mix_x12, mix_x22, u.y), u.z);
}

fn diffuse(n: vec4f, l: vec4f, p: f32) -> f32 {
    return pow(dot(n, l) * 0.4 + 0.6, p);
}

fn specular(n: vec4f, l: vec4f, e: vec4f, s: f32) -> f32 {
    let nrm = (s + 8.0) / (PI * 8.0);
    return pow(max(dot(reflect(e, n), l), 0.0), s) * nrm;
}

fn getSkyColor(e: vec4f) -> vec3<f32> {
    var y = max(e.y, 0.0);
    y = (y * 0.8 + 0.2) * 0.8;
    return vec3<f32>(
        pow(1.0 - y, 2.0),
        1.0 - y,
        0.6 + (1.0 - y) * 0.4
    ) * 1.1;
}

fn sea_octave(uv: vec3<f32>, choppy: f32) -> f32 {
    var uv2 = uv + noise(uv);
    var wv = vec2<f32>(1.0) - abs(vec2<f32>(sin(uv2.x), sin(uv2.y)));
    var swv = abs(vec2<f32>(cos(uv2.x), cos(uv2.y)));
    wv = mix(wv, swv, wv);
    return pow(1.0 - pow(wv.x * wv.y, 0.65), choppy);
}

fn map(p: vec4f, iTime: f32) -> f32 {
    var freq = SEA_FREQ;
    var amp = SEA_HEIGHT;
    var choppy = SEA_CHOPPY;
    var uv = p.xzw;
    uv.x = uv.x * 0.75;

    var d: f32;
    var h: f32 = 0.0;

    for (var i: i32 = 0; i < ITER_GEOMETRY; i = i + 1) {
        d = sea_octave((uv + SEA_TIME(iTime)) * freq, choppy);
        d = d + sea_octave((uv - SEA_TIME(iTime)) * freq, choppy);
        h = h + d * amp;
        uv = octave_m * uv;
        freq = freq * 1.9;
        amp = amp * 0.22;
        choppy = mix(choppy, 1.0, 0.2);
    }
    return p.y - h;
}

fn map_detailed(p: vec4f, iTime: f32) -> f32 {
    var freq = SEA_FREQ;
    var amp = SEA_HEIGHT;
    var choppy = SEA_CHOPPY;
    var uv = p.xzw;
    uv.x = uv.x * 0.75;

    var d: f32;
    var h: f32 = 0.0;

    for (var i: i32 = 0; i < ITER_FRAGMENT; i = i + 1) {
        d = sea_octave((uv + SEA_TIME(iTime)) * freq, choppy);
        d = d + sea_octave((uv - SEA_TIME(iTime)) * freq, choppy);
        h = h + d * amp;
        uv = octave_m * uv;
        freq = freq * 1.9;
        amp = amp * 0.22;
        choppy = mix(choppy, 1.0, 0.2);
    }
    return p.y - h;
}

fn getSeaColor(p: vec4f, n: vec4f, l: vec4f, eye: vec4f, dist: vec4f) -> vec3<f32> {
    var fresnel = clamp(1.0 - dot(n, -eye), 0.0, 1.0);
    fresnel = min(fresnel * fresnel * fresnel, 0.5);

    let reflected = getSkyColor(reflect(eye, n));
    let refracted = SEA_BASE + diffuse(n, l, 80.0) * SEA_WATER_COLOR * 0.12;

    var color = mix(refracted, reflected, fresnel);

    let atten = max(1.0 - dot(dist, dist) * 0.001, 0.0);
    color = color + SEA_WATER_COLOR * (p.y - SEA_HEIGHT) * 0.18 * atten;

    color = color + vec3<f32>(specular(n, l, eye, 60.0));

    return color;
}

fn getNormal(p: vec4f, eps: f32, iTime: f32) -> vec4f {
    let ny = map_detailed(p, iTime);
    let nx = map_detailed(vec4f(p.x + eps, p.y, p.z,p.w), iTime) - ny;
    let nz = map_detailed(vec4f(p.x, p.y, p.z + eps,p.w), iTime) - ny;
    let nw = map_detailed(vec4f(p.x, p.y, p.z,p.w + eps), iTime) - ny;
    return normalize(vec4f(nx, eps, nz,nw));
}

fn heightMapTracing(ori: vec4f, dir: vec4f, iTime: f32, p: ptr<function, vec4f>) -> f32 {
    var tm: f32 = 0.0;
    var tx: f32 = 1000.0;
    var hx: f32 = map(ori + dir * tx, iTime);

    if (hx > 0.0) {
        (*p) = ori + dir * tx;
        return tx;
    }

    var hm: f32 = map(ori, iTime);

    for (var i: i32 = 0; i < NUM_STEPS; i = i + 1) {
        let tmid = mix(tm, tx, hm / (hm - hx));
        (*p) = ori + dir * tmid;
        let hmid = map((*p), iTime);
        if (hmid < 0.0) {
            tx = tmid;
            hx = hmid;
        } else {
            tm = tmid;
            hm = hmid;
        }
        if (abs(hmid) < EPSILON) {
            break;
        }
    }

    return mix(tm, tx, hm / (hm - hx));
}
fn mainRay(rayOrigin: vec4f, rayDir: vec4f)->vec4f{
    let ro = rayOrigin + vec4f(0,10,0,0);
    let dir = normalize(rayDir+vec4f(0.00001));
    const EPSILON_NRM = 0.1/300;

    let time = shadertoyTime*2.0;

    var p: vec4f;

    _ = heightMapTracing(ro, dir, time, &p);

    let dist = p - ro;
    let n = getNormal(p, dot(dist, dist) * EPSILON_NRM, time);
    let light = normalize(vec4f(0.0, 1.0, 0.8,0.1));
    let color =  mix(
        vec4f(getSkyColor(dir),0.2),
        vec4f(getSeaColor(p, n, light, dir, dist),1.0),
        pow(smoothstep(0.0, -0.02, dir.y), 0.2)
    );

    return vec4f(pow(color.xyz, vec3<f32>(0.65)), color.w);
}
`,
    "Rainforest": `// Ported from https://www.shadertoy.com/view/4ttSWf by Inigo Quilez 
/// @resolution: 64
/// @moveSpeed: 0.02
/// @stereoEyeOffset: 10
/// @background: (120,170,255)
const LOWQUALITY: bool = true; // set false for higher quality (but loops/constants would need adjustment)
const kSunDir: vec4f = vec4f(-0.5, 0.5, -0.5, 0.5);
const kMaxTreeHeight: f32 = 4.8;
const kMaxHeight: f32 = 840.0;

struct vec5{
    t:f32,
    xyzw:vec4f,
}

// helper wide-math constants
const PI: f32 = 3.14159265358979323846;

// small utility functions (WGSL builtin functions used where possible)

fn sdEllipsoidY(p: vec4f, r: vec2<f32>) -> f32 {
    let k0 = length(p / vec4f(r.x, r.y, r.x,r.x));
    let k1 = length(p / vec4f(r.x*r.x, r.y*r.y, r.x*r.x,r.x*r.x));
    return k0 * (k0 - 1.0) / k1;
}
fn sdEllipsoid(p: vec3<f32>, r: vec3<f32>) -> f32 {
    let k0 = length(p / r);
    let k1 = length(p / (r * r));
    return k0 * (k0 - 1.0) / k1;
}

fn smoothstepd(a: f32, b: f32, x: f32) -> vec2<f32> {
    if (x < a) {
        return vec2<f32>(0.0, 0.0);
    }
    if (x > b) {
        return vec2<f32>(1.0, 0.0);
    }
    let ir = 1.0 / (b - a);
    var xx = (x - a) * ir;
    return vec2<f32>(xx * xx * (3.0 - 2.0 * xx), 6.0 * xx * (1.0 - xx) * ir);
}

// Hashes (low-quality)
fn hash1_v3(p: vec3<f32>) -> f32 {
    let t = fract(p * 0.3183099) * 50.0;
    return fract(t.x * t.y * t.z * (t.x + t.y + t.z));
}
fn hash1_f(n: f32) -> f32 {
    return fract(n * 17.0 * fract(n * 0.3183099));
}
fn hash2(p: vec2<f32>) -> vec2<f32> {
    let k = vec2<f32>(0.3183099, 0.3678794);
    let n = 111.0 * p.x + 113.0 * p.y;
    let t = fract(n * fract(k.x * n)); // note: original used k*n; small rearrangement
    return vec2<f32>(fract(t), fract(t * 1.3243));
}
fn hash3(p: vec3<f32>) -> vec3<f32> {
    let k = vec2<f32>(0.3183099, 0.3678794);
    let n = 111.0 * p.x + 113.0 * p.y + 173.2*p.z;
    let t = fract(n * fract(k.x * n)+k.y*n);
    return vec3<f32>(fract(t), fract(t * 1.3243), fract(t * 1.872376));
}

// value noise with derivative for 4D
fn noised4(x: vec4f) -> vec5 {
    let p = floor(x);
    let w = fract(x);
    // quintic interpolation
    let u = w * w * w * (w * (w * 6.0 - 15.0) + 10.0);
    let du = 30.0 * w * w * (w * (w - 2.0) + 1.0);

    let n = p.x + 317.0 * p.y + 157.0 * p.z+ 234.0 * p.w;

    let a0000 = hash1_f(n + 0.0);
    let a0001 = hash1_f(n + 1.0);
    let a0010 = hash1_f(n + 317.0);
    let a0011 = hash1_f(n + 318.0);
    let a0100 = hash1_f(n + 157.0);
    let a0101 = hash1_f(n + 158.0);
    let a0110 = hash1_f(n + 474.0);
    let a0111 = hash1_f(n + 475.0);
    let a1000 = hash1_f(n + 234.0 + 0.0);
    let a1001 = hash1_f(n + 234.0 + 1.0);
    let a1010 = hash1_f(n + 234.0 + 317.0);
    let a1011 = hash1_f(n + 234.0 + 318.0);
    let a1100 = hash1_f(n + 234.0 + 157.0);
    let a1101 = hash1_f(n + 234.0 + 158.0);
    let a1110 = hash1_f(n + 234.0 + 474.0);
    let a1111 = hash1_f(n + 234.0 + 475.0);

    let k0000 = a0000;
    let k0001 = a0001 - a0000;
    let k0010 = a0010 - a0000;
    let k0100 = a0100 - a0000;
    let k1000 = a1000 - a0000;
    let k0011 = a0011 - a0010 - a0001 + a0000;
    let k0101 = a0101 - a0100 - a0001 + a0000;
    let k1001 = a1001 - a1000 - a0001 + a0000;
    let k0110 = a0110 - a0100 - a0010 + a0000;
    let k1010 = a1010 - a1000 - a0010 + a0000;
    let k1100 = a1100 - a1000 - a0100 + a0000;
    let k0111 = -a0000 + a0001 + a0010 - a0011 + a0100 - a0101 - a0110 + a0111;
    let k1011 = -a0000 + a0001 + a0010 - a0011 + a1000 - a1001 - a1010 + a1011;
    let k1101 = -a0000 + a0001 + a0100 - a0101 + a1000 - a1001 - a1100 + a1101;
    let k1110 = -a0000 + a0010 + a0100 - a0110 + a1000 - a1010 - a1100 + a1110;
    let k1111 =  a0000 - a0001 - a0010 + a0011 - a0100 + a0101 + a0110 - a0111 - a1000 + a1001 + a1010 - a1011 + a1100 - a1101 - a1110 + a1111;
    let uxy = u.x * u.y;
    let uxz = u.x * u.z;
    let uxw = u.x * u.w;
    let uyz = u.y * u.z;
    let uyw = u.y * u.w;
    let uzw = u.z * u.w;
    let uxyz = uxy * u.z;
    let uxyw = uxy * u.w;
    let uxzw = uxz * u.w;
    let uyzw = uyz * u.w;
    let uxyzw = uxy * uzw;
    let val = -1.0 + 2.0 * (
        k0000 + k0001 * u.x + k0010 * u.y + k0100 * u.z + k1000 * u.w + 
        k0011 * uxy + k0101 * uxz + k1001 * uxw + k0110 * uyz + k1010 * uyw + k1100 * uzw + 
        k0111 * uxyz + k1011 * uxyw + k1101 * uxzw + k1110 * uyzw + k1111 * uxyzw
    );
    
    let dx = 2.0 * du * vec4f(
        k0001  + k0011 * u.y  + k0101 * u.z  + k1001 * u.w  + k0111 * uyz  + k1011 * uyw  + k1101 * uzw  + k1111 * uyzw,
        k0010  + k0011 * u.x  + k0110 * u.z  + k1010 * u.w  + k0111 * uxz  + k1011 * uxw  + k1110 * uzw  + k1111 * uxzw, 
        k0100  + k0101 * u.x  + k0110 * u.y  + k1100 * u.w  + k0111 * uxy  + k1101 * uxw  + k1110 * uyw  + k1111 * uxyw, 
        k1000  + k1001 * u.x  + k1010 * u.y  + k1100 * u.z  + k1011 * uxy  + k1101 * uxz  + k1110 * uyz  + k1111 * uxyz
    );
    return vec5(val,dx);
}

// value noise for 4D (no derivative)
fn noise4(x: vec4f) -> f32 {
    let p = floor(x);
    let w = fract(x);
    // quintic interpolation
    let u = w * w * w * (w * (w * 6.0 - 15.0) + 10.0);
    let du = 30.0 * w * w * (w * (w - 2.0) + 1.0);

    let n = p.x + 317.0 * p.y + 157.0 * p.z+ 234.0 * p.w;

    let a0000 = hash1_f(n + 0.0);
    let a0001 = hash1_f(n + 1.0);
    let a0010 = hash1_f(n + 317.0);
    let a0011 = hash1_f(n + 318.0);
    let a0100 = hash1_f(n + 157.0);
    let a0101 = hash1_f(n + 158.0);
    let a0110 = hash1_f(n + 474.0);
    let a0111 = hash1_f(n + 475.0);
    let a1000 = hash1_f(n + 234.0 + 0.0);
    let a1001 = hash1_f(n + 234.0 + 1.0);
    let a1010 = hash1_f(n + 234.0 + 317.0);
    let a1011 = hash1_f(n + 234.0 + 318.0);
    let a1100 = hash1_f(n + 234.0 + 157.0);
    let a1101 = hash1_f(n + 234.0 + 158.0);
    let a1110 = hash1_f(n + 234.0 + 474.0);
    let a1111 = hash1_f(n + 234.0 + 475.0);

    let k0000 = a0000;
    let k0001 = a0001 - a0000;
    let k0010 = a0010 - a0000;
    let k0100 = a0100 - a0000;
    let k1000 = a1000 - a0000;
    let k0011 = a0011 - a0010 - a0001 + a0000;
    let k0101 = a0101 - a0100 - a0001 + a0000;
    let k1001 = a1001 - a1000 - a0001 + a0000;
    let k0110 = a0110 - a0100 - a0010 + a0000;
    let k1010 = a1010 - a1000 - a0010 + a0000;
    let k1100 = a1100 - a1000 - a0100 + a0000;
    let k0111 = -a0000 + a0001 + a0010 - a0011 + a0100 - a0101 - a0110 + a0111;
    let k1011 = -a0000 + a0001 + a0010 - a0011 + a1000 - a1001 - a1010 + a1011;
    let k1101 = -a0000 + a0001 + a0100 - a0101 + a1000 - a1001 - a1100 + a1101;
    let k1110 = -a0000 + a0010 + a0100 - a0110 + a1000 - a1010 - a1100 + a1110;
    let k1111 =  a0000 - a0001 - a0010 + a0011 - a0100 + a0101 + a0110 - a0111 - a1000 + a1001 + a1010 - a1011 + a1100 - a1101 - a1110 + a1111;
    let uxy = u.x * u.y;
    let uxz = u.x * u.z;
    let uxw = u.x * u.w;
    let uyz = u.y * u.z;
    let uyw = u.y * u.w;
    let uzw = u.z * u.w;
    let uxyz = uxy * u.z;
    let uxyw = uxy * u.w;
    let uxzw = uxz * u.w;
    let uyzw = uyz * u.w;
    let uxyzw = uxy * uzw;
    return -1.0 + 2.0 * (
        k0000 + k0001 * u.x + k0010 * u.y + k0100 * u.z + k1000 * u.w + 
        k0011 * uxy + k0101 * uxz + k1001 * uxw + k0110 * uyz + k1010 * uyw + k1100 * uzw + 
        k0111 * uxyz + k1011 * uxyw + k1101 * uxzw + k1110 * uyzw + k1111 * uxyzw
    );
}

// 3D variants
// value noise with derivative for 3D
fn noised3(x: vec3<f32>) -> vec4f {
    let p = floor(x);
    let w = fract(x);
    // quintic interpolation
    let u = w * w * w * (w * (w * 6.0 - 15.0) + 10.0);
    let du = 30.0 * w * w * (w * (w - 2.0) + 1.0);

    let n = p.x + 317.0 * p.y + 157.0 * p.z;

    let a = hash1_f(n + 0.0);
    let b = hash1_f(n + 1.0);
    let c = hash1_f(n + 317.0);
    let d = hash1_f(n + 318.0);
    let e = hash1_f(n + 157.0);
    let f = hash1_f(n + 158.0);
    let g = hash1_f(n + 474.0);
    let h = hash1_f(n + 475.0);

    let k0 = a;
    let k1 = b - a;
    let k2 = c - a;
    let k3 = e - a;
    let k4 = a - b - c + d;
    let k5 = a - c - e + g;
    let k6 = a - b - e + f;
    let k7 = -a + b + c - d + e - f - g + h;

    let val = -1.0 + 2.0 * (k0 + k1 * u.x + k2 * u.y + k3 * u.z
        + k4 * u.x * u.y + k5 * u.y * u.z + k6 * u.z * u.x + k7 * u.x * u.y * u.z);

    let dx = 2.0 * du.x * vec3<f32>(
        k1 + k4 * u.y + k6 * u.z + k7 * u.y * u.z,
        k2 + k5 * u.z + k4 * u.x + k7 * u.z * u.x,
        k3 + k6 * u.x + k5 * u.y + k7 * u.x * u.y);

    return vec4f(val, dx.x, dx.y, dx.z);
}

// value noise for 3D (no derivative)
fn noise3(x: vec3<f32>) -> f32 {
    let p = floor(x);
    let w = fract(x);
    let u = w * w * w * (w * (w * 6.0 - 15.0) + 10.0);

    let n = p.x + 317.0 * p.y + 157.0 * p.z;

    let a = hash1_f(n + 0.0);
    let b = hash1_f(n + 1.0);
    let c = hash1_f(n + 317.0);
    let d = hash1_f(n + 318.0);
    let e = hash1_f(n + 157.0);
    let f = hash1_f(n + 158.0);
    let g = hash1_f(n + 474.0);
    let h = hash1_f(n + 475.0);

    let k0 = a;
    let k1 = b - a;
    let k2 = c - a;
    let k3 = e - a;
    let k4 = a - b - c + d;
    let k5 = a - c - e + g;
    let k6 = a - b - e + f;
    let k7 = -a + b + c - d + e - f - g + h;

    return -1.0 + 2.0 * (k0 + k1 * u.x + k2 * u.y + k3 * u.z
        + k4 * u.x * u.y + k5 * u.y * u.z + k6 * u.z * u.x + k7 * u.x * u.y * u.z);
}

// FBM matrices and functions
const m4: mat4x4f = mat4x4f(
    0.50,  0.50,  0.50,  0.50,
   -0.66,  0.33,  0.66, -0.33,
    0.50, -0.50,  0.50, -0.50,
   -0.33, -0.66,  0.33,  0.66
);
const m4i: mat4x4f = mat4x4f(
    0.50, -0.66,  0.50, -0.33,
    0.50,  0.33, -0.50, -0.66,
    0.50,  0.66,  0.50,  0.33,
    0.50, -0.33, -0.50,  0.66
);
const m3: mat3x3<f32> = mat3x3<f32>(
    0.00,  0.80,  0.60,
   -0.80,  0.36, -0.48,
   -0.60, -0.48,  0.64
);
const m3i: mat3x3<f32> = mat3x3<f32>(
    0.00, -0.80, -0.60,
    0.80,  0.36, -0.48,
    0.60, -0.48,  0.64
);

fn fbm_4_3(x_in: vec3<f32>) -> f32 {
    var x = x_in;
    let f: f32 = 1.9;
    let s: f32 = 0.55;
    var a: f32 = 0.0;
    var b: f32 = 0.5;
    for (var i: i32 = 0; i < 4; i = i + 1) {
        let n = noise3(x);
        a = a + b * n;
        b = b * s;
        x = f * (m3 * x);
    }
    return a;
}
fn fbm_4_4(x_in: vec4f) -> f32 {
    var x = x_in;
    let f: f32 = 2.0;
    let s: f32 = 0.5;
    var a: f32 = 0.0;
    var b: f32 = 0.5;
    for (var i: i32 = 0; i < 4; i = i + 1) {
        let n = noise4(x);
        a = a + b * n;
        b = b * s;
        x = f * (m4 * x);
    }
    return a;
}

fn fbmd_7(x_in: vec4f) -> vec5 {
    var x = x_in;
    let f: f32 = 1.92;
    let s: f32 = 0.5;
    var a: f32 = 0.0;
    var b: f32 = 0.5;
    var d: vec4f = vec4f();
    var m: mat4x4f = mat4x4f(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1);
    for (var i: i32 = 0; i < 7; i = i + 1) {
        let n = noised4(x);
        a = a + b * n.t;
        d = d + b * (m * n.xyzw);
        b = b * s;
        x = f * (m4 * x);
        m = f * (m4i * m);
    }
    return vec5(a,d);
}

fn fbmd_8(x_in: vec4f) -> vec5 {
    var x = x_in;
    let f: f32 = 2.0;
    let s: f32 = 0.65;
    var a: f32 = 0.0;
    var b: f32 = 0.5;
    var d: vec4f = vec4f();
    var m: mat4x4f = mat4x4f(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1);
    for (var i: i32 = 0; i < 8; i = i + 1) {
        let n = noised4(x);
        a = a + b * n.t;
        if (i < 4) {
            d = d + b * (m * n.xyzw);
        }
        b = b * s;
        x = f * (m4 * x);
        m = f * (m4i * m);
    }
    return vec5(a, d);
}
fn fbmd_9(x_in: vec3<f32>) -> vec4f {
    var x = x_in;
    let f: f32 = 1.92;
    let s: f32 = 0.5;
    var a: f32 = 0.0;
    var b: f32 = 0.5;
    var d: vec3<f32> = vec3<f32>(0.0, 0.0, 0.0);
    var m: mat3x3<f32> = mat3x3<f32>(1.0,0.0,0.0, 0.0,1.0,0.0, 0.0,0.0,1.0);
    for (var i: i32 = 0; i < 9; i = i + 1) {
        let n = noised3(x);
        a = a + b * n.x;
        d = d + b * (m * n.yzw);
        b = b * s;
        x = f * (m3 * x);
        m = f * (m3i * m);
    }
    return vec4f(a, d.xyz);
}

fn fbm_9(x_in: vec3<f32>) -> f32 {
    var x = x_in;
    let f: f32 = 1.92;
    let s: f32 = 0.5;
    var a: f32 = 0.0;
    var b: f32 = 0.5;
    var d: vec3<f32> = vec3<f32>(0.0, 0.0, 0.0);
    for (var i: i32 = 0; i < 9; i = i + 1) {
        let n = noise3(x);
        a = a + b * n;
        b = b * s;
        x = f * (m3 * x);
    }
    return a;
}

fn fog(col: vec3<f32>, t: f32) -> vec3<f32> {
    let ext = exp2(-t * 0.00025 * vec3<f32>(1.0, 1.5, 4.0));
    return col * ext + (1.0 - ext) * vec3<f32>(0.55, 0.55, 0.58);
}

fn cloudsFbm(pos: vec4f) -> vec5 {
    return fbmd_8(pos * 0.0015 + vec4f(2.0, 1.1, 1.0,1.4) + 0.04 * vec4f(shadertoyTime, 0.5 * shadertoyTime, -0.15 * shadertoyTime,0.213*shadertoyTime));
}

struct CloudsMapRes {
    val: vec5,
    nnd: f32
}
fn cloudsMap(pos: vec4f) -> CloudsMapRes {
    var d = abs(pos.y - 900.0) - 40.0;
    var gra = vec4f(0.0, sign(pos.y - 900.0), 0.0,0.0);

    let n = cloudsFbm(pos);
    d = d + 400.0 * n.t * (0.7 + 0.3 * gra.y);

    if (d > 0.0) {
        return CloudsMapRes(vec5(-d, vec4f()), 0.0);
    }
    d = min(-d / 100.0, 0.25);

    return CloudsMapRes(vec5(d, gra), -d);
}

fn cloudsShadowFlat(ro: vec4f, rd: vec4f) -> f32 {
    let t = (900.0 - ro.y) / rd.y;
    if (t < 0.0) {
        return 1.0;
    }
    let pos = ro + rd * t;
    return cloudsFbm(pos).t;
}

struct CloudRenderRes {
    color: vec4f,
    resT: f32
}
fn renderClouds(ro: vec4f, rd: vec4f, tmin: f32, tmax: f32, resT_in: f32) -> CloudRenderRes {
    var sum = vec4f(0.0, 0.0, 0.0, 0.0);

    // bounding plane
    var tmin_loc = tmin;
    var tmax_loc = tmax;
    let tl = (600.0 - ro.y) / rd.y;
    let th = (1200.0 - ro.y) / rd.y;
    if (tl > 0.0) {
        tmin_loc = max(tmin_loc, tl);
    } else {
        return CloudRenderRes(sum, resT_in);
    }
    if (th > 0.0) {
        tmax_loc = min(tmax_loc, th);
    }

    var t = tmin_loc;
    var lastT: f32 = -1.0;
    var thickness: f32 = 0.0;

    // px jitter removed (no gl_FragCoord)
    for (var i: i32 = 0; i < 128; i = i + 1) {
        let pos = ro + t * rd;
        let cm = cloudsMap(pos);
        let den = cm.val.t;
        var dt = max(0.2, 0.011 * t);
        if (den > 0.001) {
            var kk: f32 = 0.0;
            let cm2 = cloudsMap(pos + kSunDir * 70.0);
            kk = cm2.nnd;
            var sha = 1.0 - smoothstep(-200.0, 200.0, kk);
            sha = sha * 1.5;

            let nor = normalize(cm.val.xyzw);
            var dif = clamp(0.4 + 0.6 * dot(nor, kSunDir), 0.0, 1.0) * sha;
            let fre = clamp(1.0 + dot(nor, rd), 0.0, 1.0) * sha;
            let occ = 0.2 + 0.7 * max(1.0 - kk / 200.0, 0.0) + 0.1 * (1.0 - den);
            //lighting
            var lin = vec3<f32>(0.70, 0.80, 1.00) * 1.0 * (0.5 + 0.5 * nor.y) * occ;
            lin = lin + vec3<f32>(0.10, 0.40, 0.20) * 1.0 * (0.5 - 0.5 * nor.y) * occ;
            lin = lin + vec3<f32>(1.00, 0.95, 0.85) * 3.0 * dif * occ + vec3<f32>(0.1);

            var col = vec3<f32>(0.8, 0.8, 0.8) * 0.45;
            col = col * lin;
            col = fog(col, t);

            // front to back blending
            let alp = clamp(den * 0.5 * 0.125 * dt, 0.0, 1.0);
            var colv = vec4f(col*alp, alp);
            sum = sum + colv * (1.0 - sum.a);

            thickness = thickness + dt * den;
            if (lastT < 0.0) {
                lastT = t;
            }
        } else {
            dt = abs(den) + 0.2;
        }
        t = t + dt;
        if (sum.a > 0.995 || t > tmax_loc) {
            break;
        }
    }

    var resT_out = resT_in;
    if (lastT > 0.0) {
        resT_out = min(resT_out, lastT);
    }
    var out_sum = sum;
    out_sum = vec4f(
        out_sum.xyz + max(0.0, 1.0 - 0.0125 * thickness) *
        vec3f(1.0, 0.6, 0.4) * 0.3 * pow(clamp(dot(kSunDir, rd), 0.0, 1.0), 32.0),
        out_sum.w
    );
    // clamp
    out_sum = clamp(out_sum, vec4f(0.0), vec4f(1.0));
    return CloudRenderRes(out_sum, resT_out);
}

// terrain
fn terrainMap(p: vec3<f32>) -> vec2<f32> {
    var e = fbm_9(p / 2000.0 + vec3<f32>(1.0, -2.0, 0.0));
    var a = 1.0 - smoothstep(0.12, 0.13, abs(e + 0.12));
    e = 600.0 * e + 600.0;

    // cliff
    e = e + 90.0 * smoothstep(552.0, 594.0, e);

    return vec2<f32>(e, a);
}

fn terrainMapD(p: vec3<f32>) -> vec5 {
    let e = fbmd_9(p / 2000.0 + vec3<f32>(1.0, -2.0, 0.0));
    var ex = 600.0 * e.x + 600.0;
    var eyz = 600.0 * e.yzw;

    let c = smoothstepd(450.0, 500.0, ex);
    ex = ex + 90.0 * c.x;
    eyz = eyz + 90.0 * c.y * eyz;

    eyz = eyz / 2000.0;
    let normal = normalize(vec4f(-eyz.x, 1.0, -eyz.y, -eyz.z));
    return vec5(ex, normal);
}

fn terrainNormal(pos: vec3<f32>) -> vec4f {
    return terrainMapD(pos).xyzw;
}

fn terrainShadow(ro: vec4f, rd: vec4f, mint: f32) -> f32 {
    var res: f32 = 1.0;
    var t: f32 = mint;
    if (LOWQUALITY) {
        for (var i: i32 = 0; i < 32; i = i + 1) {
            let pos = ro + rd * t;
            let env = terrainMap(pos.xzw);
            let hei = pos.y - env.x;
            res = min(res, 32.0 * hei / t);
            if (res < 0.0001 || pos.y > kMaxHeight) {
                break;
            }
            t = t + clamp(hei, 2.0 + t * 0.1, 100.0);
        }
    } else {
        for (var i: i32 = 0; i < 128; i = i + 1) {
            let pos = ro + rd * t;
            let env = terrainMap(pos.xzw);
            let hei = pos.y - env.x;
            res = min(res, 32.0 * hei / t);
            if (res < 0.0001 || pos.y > kMaxHeight) {
                break;
            }
            t = t + clamp(hei, 0.5 + t * 0.05, 25.0);
        }
    }
    return clamp(res, 0.0, 1.0);
}

fn raymarchTerrain(ro: vec4f, rd: vec4f, tmin: f32, tmax: f32) -> vec2<f32> {
    var tmax_loc = tmax;
    // bounding volume
    let tp = (kMaxHeight + kMaxTreeHeight - ro.y) / rd.y;
    if (tp > 0.0) {
        tmax_loc = min(tmax_loc, tp);
    }

    var dis: f32 = 0.0;
    var th: f32 = 0.0;
    var t2: f32 = -1.0;
    var t: f32 = tmin;
    var ot: f32 = t;
    var odis: f32 = 0.0;
    var odis2: f32 = 0.0;

    for (var i: i32 = 0; i < 400; i = i + 1) {
        th = 0.001 * t;
        let pos = ro + t * rd;
        let env = terrainMap(pos.xzw);
        let hei = env.x;

        // tree envelope
        let dis2 = pos.y - (hei + kMaxTreeHeight * 1.1);
        if (dis2 < th) {
            if (t2 < 0.0) {
                t2 = ot + (th - odis2) * (t - ot) / (dis2 - odis2);
            }
        }
        odis2 = dis2;

        // terrain
        dis = pos.y - hei;
        if (dis < th) {
            break;
        }

        ot = t;
        odis = dis;
        t = t + dis * 0.8 * (1.0 - 0.75 * env.y);
        if (t > tmax_loc) {
            break;
        }
    }

    if (t > tmax_loc) {
        t = -1.0;
    } else {
        t = ot + (th - odis) * (t - ot) / (dis - odis);
    }
    return vec2<f32>(t, t2);
}

// trees: return value and out params packed into struct
struct TreesMapRes {
    d: f32,
    oHei: f32,
    oMat: f32,
    oDis: f32
}
fn treesMap(p_in: vec4f, rt: f32) -> TreesMapRes {
    var p = p_in;
    var oHei: f32 = 1.0;
    var oDis: f32 = 0.0;
    var oMat: f32 = 0.0;

    let base = terrainMap(p.xzw).x;

    let bb = fbm_4_3(p.xzw * 0.075);

    var d: f32 = 20.0;
    let n = floor(p.xzw / 2.0);
    let f = fract(p.xzw / 2.0);
    for (var j: i32 = 0; j <= 1; j = j + 1) {
        for (var i: i32 = 0; i <= 1; i = i + 1) {
            for (var k: i32 = 0; k <= 1; k = k + 1) {
                let g = vec3<f32>(f32(i), f32(j), f32(k)) - step(f, vec3<f32>(0.5));
                let o = hash3(n + g);
                let v = hash3(n + g + vec3<f32>(13.1, 71.7,51.7));
                let r = g - f + o;
    
                var height = kMaxTreeHeight * (0.4 + 0.8 * v.x+v.z*0.6+v.y*0.4);
                var width = 0.4 + 0.2 * v.x + 0.3 * v.y+0.1*v.z;
                if (bb < 0.0) {
                    width *= 0.5;
                } else {
                    height *= 0.7;
                }
    
                let q = vec4f(r.x, p.y - base - height * 0.5, r.y, r.z);
                let k = sdEllipsoidY(q, vec2<f32>(width, 0.5 * height));
                if (k < d) {
                    d = k;
                    oMat = 0.5 * hash1_v3(n + g + 111.0);
                    if (bb > 0.0) {
                        oMat = oMat + 0.5;
                    }
                    oHei = (p.y - base) / height;
                    oHei = oHei * (0.5 + 0.5 * length(q) / width);
                }
            }
        }
    }

    // distort ellipsoids to make them look like trees (distance effect)
    if (rt < 1200.0) {
        p.y = p.y - 600.0;
        var s = fbm_4_4(p*2.0);
        s = s*s-0.1;
        let att = 0.2*(1.0 - smoothstep(100.0, 1200.0, rt));
        d = d + 4 * s * att;
        oDis = s * att;
        // s = s * s;
        // let att = 1.0 - smoothstep(100.0, 1200.0, rt);
        // d = d + 4.0 * s * att;
        // oDis = s * att;
    }

    return TreesMapRes(d, oHei, oMat, oDis);
}

fn treesShadow(ro: vec4f, rd: vec4f) -> f32 {
    var res: f32 = 1.0;
    var t: f32 = 0.02;
    if (LOWQUALITY) {
        for (var i: i32 = 0; i < 64; i = i + 1) {
            let pos = ro + rd * t;
            let mm = treesMap(pos, t);
            let h = mm.d;
            res = min(res, 32.0 * h / t);
            t = t + h;
            if (res < 0.001 || t > 50.0 || pos.y > kMaxHeight + kMaxTreeHeight) {
                break;
            }
        }
    } else {
        for (var i: i32 = 0; i < 150; i = i + 1) {
            let pos = ro + rd * t;
            let mm = treesMap(pos, t);
            let h = mm.d;
            res = min(res, 32.0 * h / t);
            t = t + h;
            if (res < 0.001 || t > 120.0) {
                break;
            }
        }
    }
    return clamp(res, 0.0, 1.0);
}
const dirs = array<vec4f, 5>(
        vec4f( 0.5, -0.5,  -0.5,-0.5), // e.xyyy
        vec4f(-0.5,  -0.5,  0.5,-0.5), // e.yyxy
        vec4f( 0.0, -0.5, -0.5,-0.5), // e.yxyy
        vec4f( 0.5,  0.5, 0.5,-0.5), // e.xxxy
        vec4f( 0.0,  0.0,  0.0,  1.0)  // e.zzzw
    );
fn treesNormal(pos: vec4f, t: f32) -> vec4f {
    // compute gradient-like normal by sampling map around pos
    var nrm = vec4f();
    for (var i: i32 = 0; i < 4; i = i + 1) {
        let e=dirs[i];
        let mm = treesMap(pos + 0.005 * e, t);
        nrm = nrm + e * mm.d;
    }
    return normalize(nrm);
}

// sky
fn renderSky(ro: vec4f, rd: vec4f) -> vec3<f32> {
    var col = vec3<f32>(0.42, 0.62, 1.1) - rd.y * 0.4;
    let t = (2500.0 - ro.y) / rd.y;
    if (t > 0.0) {
        let uv = (ro + t * rd).xzw;
        let cl = fbm_9(uv * 0.00104);
        let dl = smoothstep(-0.2, 0.6, cl);
        col = mix(col, vec3<f32>(1.0), 0.12 * dl);
    }

    let sun = clamp(dot(kSunDir, rd), 0.0, 1.0);
    col = col + 0.2 * vec3<f32>(1.0, 0.6, 0.3) * pow(sun, 32.0);

    return col;
}

// mainRay entry
fn mainRay(rayo: vec4f, rayd: vec4f) -> vec4f {
    var rayDir = normalize(rayd+vec4f(0.00001));
    let ro= rayo+vec4f(1897,530,862,-927);
    var resT: f32 = 2000.0;

    // sky base
    var col = renderSky(ro, rayDir);

    // raycast terrain and tree envelope
    var obj: i32 = 0;
    let tres = raymarchTerrain(ro, rayDir, 15.0, 2000.0);
    if (tres.x > 0.0) {
        resT = tres.x;
        obj = 1;
    }
    var hei=0.0; var mid=0.0; var displa=0.0;
    // raycast trees, if needed
    if (tres.y > 0.0) {
        var tf = tres.y;
        var tfMax = select(2000.0, tres.x, tres.x > 0.0);
        for (var i: i32 = 0; i < 64; i = i + 1) {
            let pos = ro + tf * rayDir;
            let mm = treesMap(pos, tf);
            let dis = mm.d;
            hei=mm.oHei; mid=mm.oMat; displa=mm.oDis;
            if (dis < (0.000125 * tf)) {
                break;
            }
            tf = tf + dis;
            if (tf > tfMax) {
                break;
            }
        }
        if (tf < tfMax) {
            resT = tf;
            obj = 2;
        }
    }
    var opacity = 0.2;
    // shading
    if (obj > 0) {
        opacity = 1.0;
        let pos = ro + resT * rayDir;
        let epos = pos + vec4f(0.0, 4.8, 0.0, 0.0);

        var sha1 = terrainShadow(pos + vec4f(0.0, 0.02, 0.0, 0.0), kSunDir, 0.02);
        sha1 = sha1 * smoothstep(-0.5, -0.05, cloudsShadowFlat(epos, kSunDir));

        var sha2: f32 = 1.0;
        if (!LOWQUALITY) {
            sha2 = treesShadow(pos + vec4f(0.0, 0.02, 0.0,0.0), kSunDir);
        }

        let tnor = terrainNormal(pos.xzw);
        var nor = vec4f();

        var speC = vec3<f32>(1.0);

        if (obj == 1) {
            // terrain
            let bump = fbmd_7((pos - vec4f(0.0, 600.0, 0.0,0.0)) * 0.15 * vec4f(1.0, 0.2, 1.0,1.0));
            nor = normalize(tnor + 0.8 * (1.0 - abs(tnor.y)) * 0.8 * bump.xyzw);

            col = vec3<f32>(0.18, 0.12, 0.10) * 0.85;
            col = mix(col, vec3<f32>(0.1, 0.1, 0.0) * 0.2, smoothstep(0.7, 0.9, nor.y));

            var dif = clamp(dot(nor, kSunDir), 0.0, 1.0);
            dif = dif * sha1;
            if (!LOWQUALITY) {
                dif = dif * sha2;
            }

            let bac = clamp(dot(normalize(vec4f(-kSunDir.x, 0.0, -kSunDir.z,-kSunDir.w)), nor), 0.0, 1.0);
            let foc = clamp((pos.y / 2.0 - 180.0) / 130.0, 0.0, 1.0);
            let dom = clamp(0.5 + 0.5 * nor.y, 0.0, 1.0);
            var lin = 0.2 * mix(vec3<f32>(0.1, 0.2, 0.1) * 0.1, vec3<f32>(0.7, 0.9, 1.5) * 3.0, dom) * foc;
            lin = lin + 1.0 * 8.5 * vec3<f32>(1.0, 0.9, 0.8) * dif;
            lin = lin + 1.0 * 0.27 * vec3<f32>(1.1, 1.0, 0.9) * bac * foc;
            speC = vec3<f32>(4.0) * dif * smoothstep(20.0, 0.0, abs(pos.y / 2.0 - 310.0));

            col = col * lin;

        } else {
            // trees
            let gnor = treesNormal(pos, resT);
            nor = normalize(gnor + 2.0 * tnor);

            let refv = reflect(rayDir, nor);
            let occ = clamp(hei, 0.0, 1.0) * pow(1.0 - 2.0 *displa, 3.0);
            var dif = clamp(0.1 + 0.9 * dot(nor, kSunDir), 0.0, 1.0);
            dif = dif * sha1;
            if (dif > 0.0001) {
                var a = clamp(0.5 + 0.5 * dot(tnor, kSunDir), 0.0, 1.0);
                a = a * a * occ * 0.6 * smoothstep(60.0, 200.0, resT);
                // tree shadows with fake transmission
                var sha2_local = 1.0;
                if (LOWQUALITY) {
                    sha2_local = treesShadow(pos + kSunDir * 0.1, kSunDir);
                }
                dif = dif * (a + (1.0 - a) * sha2_local);
            }
            let dom = clamp(0.5 + 0.5 * nor.y, 0.0, 1.0);
            let bac = clamp(0.5 + 0.5 * dot(normalize(vec4f(-kSunDir.x, 0.0, -kSunDir.z, -kSunDir.w)), nor), 0.0, 1.0);
            let fre = clamp(1.0 + dot(nor, rayDir), 0.0, 1.0);

            var lin = 12.0 * vec3<f32>(1.2, 1.0, 0.7) * dif * occ * (2.5 - 1.5 * smoothstep(0.0, 120.0, resT));
            lin = lin + 0.55 * mix(vec3<f32>(0.1, 0.2, 0.0) * 0.1, vec3<f32>(0.6, 1.0, 1.0), dom * occ);
            lin = lin + 0.07 * vec3<f32>(1.0, 1.0, 0.9) * bac * occ;
            lin = lin + 1.10 * vec3<f32>(0.9, 1.0, 0.8) * pow(fre, 5.0) * occ * (1.0 - smoothstep(100.0, 200.0, resT));
            speC = dif * vec3<f32>(1.0, 1.1, 1.5) * 1.2;

            // material
            let brownAreas = fbm_4_3(pos.zwx * 0.015);
            col = vec3<f32>(0.2, 0.2, 0.05);
            col = mix(col, vec3<f32>(0.32, 0.2, 0.05), smoothstep(0.2, 0.9, fract(2.0 * mid)));
            col = col * select(
                1.0,
                0.65 + 0.35 * smoothstep(300.0, 600.0, resT) * smoothstep(700.0, 500.0, pos.y),
                mid < 0.5
            );
            col = mix(col, vec3<f32>(0.25, 0.16, 0.01) * 0.825, 0.7 * smoothstep(0.1, 0.3, brownAreas) * smoothstep(0.5, 0.8, tnor.y));
            col = col * (1.0 - 0.5 * smoothstep(400.0, 700.0, pos.y));
            col = col * lin;
        }

        // specular
        let refv2 = reflect(rayDir, nor);
        let fre2 = clamp(1.0 + dot(nor, rayDir), 0.0, 1.0);
        let spe = 3.0 * pow(clamp(dot(refv2, kSunDir), 0.0, 1.0), 9.0) * (0.05 + 0.95 * pow(fre2, 5.0));
        col = col + spe * speC;

        col = fog(col, resT);
    }

    // clouds (composite)
    let cloudRes = renderClouds(ro, rayDir, 0.0, resT, resT);
    resT = cloudRes.resT;
    opacity += cloudRes.color.w;
    col = col * (1.0 - cloudRes.color.w) + cloudRes.color.xyz;

    // final tweaks: sun glare, gamma, color grade, contrast
    let sunv = clamp(dot(kSunDir, rayDir), 0.0, 1.0);
    col = col + 0.25 * vec3<f32>(0.8, 0.4, 0.2) * pow(sunv, 4.0);

    // gamma correction (approx)
    col = pow(clamp(col * 1.1 - 0.02, vec3<f32>(0.0), vec3<f32>(1.0)), vec3<f32>(0.4545));

    // contrast
    col = col * col * (vec3<f32>(2.5) - 1.5 * col);

    // color grade 
    col = pow(col, vec3<f32>(1.0, 0.92, 1.0));
    col = col * vec3<f32>(1.02, 0.99, 0.9);
    col.z = col.z + 0.1;

    return vec4f(col, opacity);
}
`,

"Black Hole": `/// @background: black
/// @moveSpeed: 0.0001
/// @stereoEyeOffset: 0.1
/// @camCtrl: trackball(0,0,0,-2)
/// @opacity: 20

const M = -0.2;
const step = 0.2;
const iteration = 256;
const thickness = 0.1;

${skyGen_code}

fn mainRay(ro: vec4f, rayDir: vec4f)->vec4f{
    var pos = ro + vec4f(0,0,0,2);
    var dir = normalize(rayDir);
    var discColor = vec3f();
    for(var i=0;i<iteration;i++){
        let r = dot(pos,pos);
        if(r<0.1) {return vec4f(discColor, 0.5 + discColor.r);}
        if (r>30) {break;}
        let accrR_old = length(pos.yz)-thickness;
        let dt = r*(min(max(accrR_old,1.0),0.1))*step;
        let acc = pos*(M/(r*r*r));
        let dir2 = dir + acc*(dt*0.5);
        let pos2 = pos + dir*(dt*0.5);
        let r2 = dot(pos2,pos2);
        let acc2 = pos2*(M/(r2*r2*r2));
        dir += acc2*dt;
        let old_pos = pos;
        pos += dir2*dt;
        let ta = atan2(pos.y,pos.x);
        let tb = atan2(pos.w,pos.z);
        let accrR = length(pos.yz);
       if (accrR < 0.1) {
            let rr = r;//accrR/(accrR-accrR_old)*r -accrR_old/(accrR-accrR_old)*dot(pos,pos);
            if( rr > 1.0 && rr < 2.0){
                let brandPos =
                    (0.1-accrR)*10*(rr-1.0)*(2.0-rr)*2.0*
                    (sin(rr*14.0)*0.2*(sin(accrR*3)+1.0) + 1.0
                    + sin(rr*(80.0 + 10.0*cos(rr*12.0)))*0.05);
                discColor += vec3f(brandPos, brandPos*0.8, brandPos*0.6)
                            * exp(-discColor.x*5.0);
            }
        }
    }
    let bg = background(vec4f(1.234,422.324,55.342,3.435),dir);
        
    return vec4f(bg.xyz*3.8 - 0.05 + discColor, bg.a + discColor.r);
}

`,

"Black Ring": `/// @background: black
/// @moveSpeed: 0.0001
/// @stereoEyeOffset: 0.1
/// @camCtrl: trackball(0,0,0,-2)
/// @opacity: 20

const M = 0.1;
const a = 1;
const b = 0;
const step = 0.01;
const iteration = 512;
const N = 16;

${skyGen_code}

const a2 = a*a;

fn getR(pos:vec4f)->f32{
    let zw = pos.z*pos.z+pos.w*pos.w;
    let r2 = dot(pos,pos);
    let t1 = r2+a2;
    let t2 = a2*(r2-zw)*4;

    return 1/(t1*t1-t2);
}
const eps = 0.00001;
fn forceB(pos:vec4f,dir:vec4f)->vec4f{
    let v0 = getR(pos);
    let f = vec4f(
        getR(pos+vec4(eps,0,0,0))-v0,
        getR(pos+vec4(0,eps,0,0))-v0,
        getR(pos+vec4(0,0,eps,0))-v0,
        getR(pos+vec4(0,0,0,eps))-v0
    );
    return f*(M/eps);
}
fn mainRay(ro: vec4f, rayDir: vec4f)->vec4f{
    var pos = ro + vec4f(0,0,0,2);
    var dir = normalize(rayDir);
    var discColor = vec3f();
    for(var i=0;i<iteration;i++){
        let r = getR(pos);
        if(r>10) {return vec4f(discColor, 0.5 + discColor.r);}
        if (dot(pos,pos)>30) {break;}
        let dt = step/r;
        let acc = forceB(pos,dir);
        let dir2 = dir + acc*dt*0.5;
        let pos2 = pos + dir*dt*0.5;
        let r2 = dot(pos2,pos2);
        let acc2 = forceB(pos2,dir2);
        dir += acc2*dt;
        let old_pos = pos;
        pos += dir2*dt;
    }
    let bg = background(vec4f(1.234,422.324,55.342,3.435),dir);
        
    return vec4f(bg.xyz*4.8 + discColor, bg.a + discColor.r);
}

`,
};

class ResizeDivHandler {
    div: HTMLDivElement;
    runBtn: HTMLButtonElement;
    constructor(resizableDiv: HTMLDivElement, examples: Examples, onexec: (code: string) => void) {
        this.div = resizableDiv;
        resizableDiv.style.transition = "height 0.3s ease";
        const handle = document.createElement("div");
        handle.style.height = "8px";
        handle.style.cursor = "ns-resize";
        handle.style.background = "#888";
        handle.style.opacity = "0.2";
        handle.style.transition = "opacity 0.2s";
        handle.style.userSelect = "none";
        handle.style.position = "absolute";
        handle.style.bottom = "-8px";
        handle.style.left = "0";
        handle.style.right = "0";

        handle.addEventListener("mouseenter", () => {
            handle.style.opacity = "1";
        });
        handle.addEventListener("mouseleave", () => {
            handle.style.opacity = "0.2";
        });
        resizableDiv.appendChild(handle);


        let startY = 0;
        let startHeight = 0;

        const onMouseMove = (e: MouseEvent) => {
            const dy = e.clientY - startY;
            resizableDiv.style.height = `${startHeight + dy}px`;
            BtnBar.style.display = startHeight + dy > 16 ? "block" : "none";
        };

        const onMouseUp = () => {

            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        };

        handle.addEventListener("mousedown", (e: MouseEvent) => {
            resizableDiv.blur(); document.body.querySelector("canvas").focus();
            resizableDiv.style.transition = "none";
            startY = e.clientY;
            startHeight = resizableDiv.offsetHeight;

            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);

            e.preventDefault();
        });
        const BtnBar = document.createElement("div");

        const collapseBtn = document.createElement("button");
        collapseBtn.textContent = "-";
        const setStyle = (btn: HTMLButtonElement) => {
            btn.style.border = "none";
            btn.style.borderRadius = "4px";
            btn.style.marginLeft = "4px";
            btn.style.background = "#357ABD";
            btn.style.color = "white";
            btn.style.cursor = "pointer";
            btn.style.boxShadow = "0 1px 3px rgba(0,0,0,0.2)";
            btn.style.transition = "background 0.2s, transform 0.1s, box-shadow 0.2s";
            btn.addEventListener("mouseenter", () => {
                btn.style.background = "#aac8ea";
                btn.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
            });

            btn.addEventListener("mouseleave", () => {
                btn.style.background = "#357ABD";
                btn.style.boxShadow = "0 1px 3px rgba(0,0,0,0.2)";
                btn.style.transform = "scale(1)";
            });
        }
        collapseBtn.addEventListener("click", () => {
            this.div.style.transition = "height 0.3s ease";
            this.div.style.height = "0px";
            BtnBar.style.display = "none";
            resizableDiv.blur(); document.body.querySelector("canvas").focus();
        });

        let lastEscTime = 0;
        resizableDiv.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                const now = Date.now();
                if (now - lastEscTime < 500) collapseBtn.click();
                lastEscTime = now;
            }
        });
        const runBtn = document.createElement("button");
        runBtn.textContent = "⏸";
        runBtn.style.cssText = `
        font-family: "DejaVu Sans Mono", "Fira Mono", "Consolas", "Courier New", monospace;
        text-align: center;
        font-size: 0.6em;
        vertical-align: middle;
        width: 2.5em;
        `;
        this.runBtn = runBtn;
        let offsetY = 28;
        for (const [k, v] of Object.entries(examples)) {
            const item = document.createElement("button");
            item.textContent = k;
            setStyle(item);
            item.style.position = "absolute";
            item.style.top = offsetY + "px";
            item.style.right = "20px";
            item.style.width = "max-content";
            offsetY += 20;
            BtnBar.appendChild(item);
            item.addEventListener("click", ev => {
                onexec(v);
            });
        }

        resizableDiv.appendChild(BtnBar);
        BtnBar.style.top = "0px";

        BtnBar.style.position = "absolute";
        BtnBar.style.right = "16px";
        BtnBar.appendChild(runBtn);
        BtnBar.appendChild(collapseBtn);
        BtnBar.querySelectorAll("button").forEach(e => setStyle(e));
    }

}
interface ShadertoyConfig extends render.DisplayConfig {
    keyMoveSpeed?: number;
    trackballCenter?: number[];
    cameraControl?: "keepup" | "freefly" | "trackball";
}
const getDisplayConfigFromShader = (code: string) => {
    const retinaLayers = code.match(/\/\/\/\s*@retinaLayers\s*:\s*([0-9]+)/);
    const opacity = code.match(/\/\/\/\s*@opacity\s*:\s*([0-9\.]+)/);
    const background = code.match(/\/\/\/\s*@background\s*:\s*\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\s*\)/);
    const resolution = code.match(/\/\/\/\s*@resolution\s*:\s*([0-9]+)/);
    const keyMoveSpeed = code.match(/\/\/\/\s*@moveSpeed\s*:\s*([0-9\.]+)/);
    const camCtrl = code.match(/\/\/\/\s*@(cameraControl|camCtrl)\s*:\s*(keepup|freefly|trackball)\s*(\(\s*(-?[0-9\.]+)\s*,\s*(-?[0-9\.]+)\s*,\s*(-?[0-9\.]+)\s*,\s*(-?[0-9\.]+)\s*\))?/);
    const stereoEyeOffset = code.match(/\/\/\/\s*@stereoEyeOffset\s*:\s*([0-9\.]+)/);
    let config = {} as ShadertoyConfig;
    config.screenBackgroundColor = [1, 1, 1, 1];
    config.retinaResolution = 256;
    config.keyMoveSpeed = 0.1;
    config.sectionStereoEyeOffset = 0.1;
    if (retinaLayers && isFinite(Number(retinaLayers[1]))) config.retinaLayers = Number(retinaLayers[1]);
    if (opacity && isFinite(Number(opacity[1]))) config.opacity = Number(opacity[1]);
    if (stereoEyeOffset && isFinite(Number(stereoEyeOffset[1]))) config.sectionStereoEyeOffset = Number(stereoEyeOffset[1]);
    if (keyMoveSpeed && isFinite(Number(keyMoveSpeed[1]))) config.keyMoveSpeed = Number(keyMoveSpeed[1]);
    if (camCtrl && camCtrl[2]) {
        switch (camCtrl[2]) {
            case "keepup":
                config.cameraControl = "keepup";
                break;
            case "freefly":
                config.cameraControl = "freefly";
                break;
            case "trackball":
                config.cameraControl = "trackball";
                config.trackballCenter = [0, 0, 0, 1];
                if (camCtrl[3] && camCtrl[4] && camCtrl[5] && camCtrl[6] && camCtrl[7] && isFinite(Number(camCtrl[4])) && isFinite(Number(camCtrl[5])) && isFinite(Number(camCtrl[6])) && isFinite(Number(camCtrl[7]))) {
                    config.trackballCenter = [Number(camCtrl[4]), Number(camCtrl[5]), Number(camCtrl[6]), Number(camCtrl[7])];
                }
                break;
            default:
                config.cameraControl = "keepup";
        }
    } else {
        config.cameraControl = "keepup";
    }
    const resnum = Number(resolution?.[1]);
    if (resolution && isFinite(resnum) &&
        // resolution must be power of 2
        resnum === 256 || resnum === 512 || resnum === 1024 || resnum === 128 || resnum === 64 || resnum === 32 || resnum === 16 || resnum === 8 || resnum === 2048
    ) config.retinaResolution = Number(resolution[1]);
    if (background && isFinite(Number(background[1])) && isFinite(Number(background[2])) && isFinite(Number(background[3]))) {
        config.screenBackgroundColor = [Number(background[1]) / 255, Number(background[2]) / 255, Number(background[3]) / 255, 1];
    }
    const backgroundWhite = code.match(/\/\/\/\s*@background\s*:\s*white/);
    const backgroundBlack = code.match(/\/\/\/\s*@background\s*:\s*black/);
    if (backgroundWhite) config.screenBackgroundColor = [1, 1, 1, 1];
    if (backgroundBlack) config.screenBackgroundColor = [0, 0, 0, 1];

    return config;
}
class ShadertoyApp {

    renderer: render.SliceRenderer;
    camController: util.ctrl.KeepUpController | util.ctrl.FreeFlyController | util.ctrl.TrackBallController;
    retinaController: util.ctrl.RetinaController;

    camBuffer: GPUBuffer;
    inputBuffer: GPUBuffer;
    bindgroups: GPUBindGroup[];
    pipeline: render.RaytracingPipeline;
    lineAllOffset: number;
    lineRflOffset: number;

    headercode: string;
    examples: Examples;
    constructor(headercode: string, lineAllOffset: number, lineRflOffset: number, examples: Examples) {
        this.headercode = headercode;
        this.lineAllOffset = lineAllOffset;
        this.lineRflOffset = lineRflOffset;
        this.examples = examples;
    }
    async load() {
        let gpu = await new render.GPU().init();
        let canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
        let context = gpu.getContext(canvas);
        let renderer = new render.SliceRenderer(gpu, {
            enableFloat16Blend: false,
            sliceGroupSize: 8
        });
        this.renderer = renderer;
        let camBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 4 * 4 * 5);
        let inputBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 4);
        renderer.setDisplayConfig({ screenBackgroundColor: { r: 1, g: 1, b: 1, a: 1 }, opacity: 5 });
        let camController = new util.ctrl.KeepUpController() as typeof this.camController;
        camController.object.position.set(0, 0, 0, 0);
        this.camController = camController;
        let retinaController = new util.ctrl.RetinaController(renderer);
        this.retinaController = retinaController;
        let ctrlreg = new util.ctrl.ControllerRegistry(canvas, [camController, retinaController], { preventDefault: true, enablePointerLock: true });
        ctrlreg.disableDefaultEvent = true;
        let matModelViewJSBuffer = new Float32Array(20);
        let inputJSBuffer = new Float32Array(1);

        await renderer.init();
        this.camBuffer = camBuffer;
        this.inputBuffer = inputBuffer;
        const start = new Date().getTime();
        let paused = false;
        this.run = () => {
            if (this.pipeline && this.camBuffer && this.bindgroups && !paused) {
                ctrlreg.update();
                camController.object.getAffineMat4().writeBuffer(matModelViewJSBuffer);
                inputJSBuffer[0] = (new Date().getTime() - start) * 0.001;
                gpu.device.queue.writeBuffer(camBuffer, 0, matModelViewJSBuffer);
                gpu.device.queue.writeBuffer(inputBuffer, 0, inputJSBuffer);

                renderer.render(context, (rs) => {
                    rs.drawRaytracing(this.pipeline, this.bindgroups);
                });
            }
            window.requestAnimationFrame(this.run);
        }
        function setSize() {
            let width = window.innerWidth * window.devicePixelRatio;
            let height = window.innerHeight * window.devicePixelRatio;
            canvas.width = width;
            canvas.height = height;
            renderer.setDisplayConfig({ canvasSize: { width, height } });
        }
        setSize();
        window.addEventListener("resize", setSize);
        const exec = async (code: string) => {
            const oldPipeline = this.pipeline;
            try {
                this.pipeline = await this.renderer.createRaytracingPipeline({
                    code: this.headercode + code,
                    rayEntryPoint: "shadertoyMainRay",
                    fragmentEntryPoint: "shadertoyMainFragment"
                });
            } catch (e) {
                const error = e?.message?.match(/^(.+) Line:([0-9]+)/) || e?.match(/^(.+) at line ([0-9]+)/);
                if (error) {
                    showError([Number(error[2]) - this.lineRflOffset]);
                    errDom.innerText = error[1];
                }

                this.pipeline = oldPipeline;
            }
            this.bindgroups = [this.renderer.createVertexShaderBindGroup(this.pipeline, 1, [this.camBuffer, this.inputBuffer])];
            const cfg = getDisplayConfigFromShader(code);
            renderer.setDisplayConfig(cfg);
            retinaController.setDisplayConfig(cfg);
            if (!(camController instanceof util.ctrl.KeepUpController) && cfg.cameraControl === "keepup") {
                this.camController = new util.ctrl.KeepUpController(camController.object);
                ctrlreg.remove(camController);
                ctrlreg.add(this.camController);
                camController = this.camController;
            }
            if (!(camController instanceof util.ctrl.FreeFlyController) && cfg.cameraControl === "freefly") {
                this.camController = new util.ctrl.FreeFlyController(camController.object);
                ctrlreg.remove(camController);
                ctrlreg.add(this.camController);
                camController = this.camController;
            }
            if (!(camController instanceof util.ctrl.TrackBallController) && cfg.cameraControl === "trackball") {
                this.camController = new util.ctrl.TrackBallController(camController.object, true);
                ctrlreg.remove(camController);
                ctrlreg.add(this.camController);
                camController = this.camController;
            }
            if (cfg.cameraControl === "trackball") {
                const arr = cfg.trackballCenter || [0, 0, 0, 1];
                (this.camController as util.ctrl.TrackBallController).center = new math.Vec4(...arr);
                (this.camController as util.ctrl.TrackBallController).lookAtCenter();
            }
            if (((camController as util.ctrl.KeepUpController).keyMoveSpeed) && cfg.keyMoveSpeed) (camController as util.ctrl.KeepUpController).keyMoveSpeed = cfg.keyMoveSpeed;
        }
        const codeDom = document.createElement("div");
        document.body.appendChild(codeDom);
        function getRandomValue<T>(obj: Record<string, T>): T {
            const values = Object.values(obj);
            if (values.length === 0) {
                return;
            }
            const randomIndex = Math.floor(Math.random() * values.length);
            return values[randomIndex];
        }
        const { editor, showError } = createCodemirrorEditor(codeDom, getRandomValue(this.examples), () => {
            // onchange
            errDom.innerText = "";
            exec(editor.state.doc.toString());
        }, () => {
            // onfocus
            ctrlreg.disableDefaultEvent = false;
            camController.enabled = false;
            retinaController.enabled = false;
        }, () => {
            // onblur
        });
        canvas.addEventListener("click", () => {
            ctrlreg.disableDefaultEvent = true;
            camController.enabled = true;
            retinaController.enabled = true;
        });
        canvas.addEventListener("blur", () => {
            ctrlreg.disableDefaultEvent = false;
            camController.enabled = false;
            retinaController.enabled = false;
        });

        codeDom.style.position = "absolute";
        codeDom.style.top = "0px";
        codeDom.style.left = "0px";
        codeDom.style.zIndex = "10001";
        codeDom.style.backgroundColor = "rgba(255,255,255,0.8)";
        editor.dom.style.borderRadius = "5px";
        editor.dom.style.height = "250px";
        editor.dom.style.width = "100%";
        codeDom.style.width = "100%";
        const handler = new ResizeDivHandler(editor.dom, this.examples, c => {
            const curText = editor.state.doc.toString();
            if (curText === c) return; // no change
            if (!Object.values(this.examples).includes(curText) && curText.trim() !== "") {
                if (!confirm(lang === "zh" ? "你还有未保存的内容，确定要继续吗？" : "You have unsaved changes. Continue anyway?")) return;
            }
            editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: c } });
        });
        handler.runBtn.addEventListener("click", () => {
            if (handler.runBtn.textContent === "⏸") {
                handler.runBtn.textContent = "▶";
                paused = true;
            } else {
                handler.runBtn.textContent = "⏸";
                paused = false;
            }
        });;
        window.addEventListener('beforeunload', (e) => {
            const curText = editor.state.doc.toString();
            if (!Object.values(this.examples).includes(curText) && curText.trim() !== "") {
                e.preventDefault();
                e.returnValue = '';
            }
        });
        const errDom = document.createElement("div");
        errDom.style.width = "100%";
        errDom.style.backgroundColor = "red";
        errDom.style.color = "white";
        codeDom.appendChild(errDom);


        exec(editor.state.doc.toString());
        this.renderer.gpu.device.onuncapturederror = (e) => {
            let msg = e.error.message;
            const error = msg.match(/Error while parsing WGSL: :([0-9]+):([0-9]+) (.+)\n/);
            if (error) {
                const cb = showError([Number(error[1]) - this.lineAllOffset]);
                errDom.innerText = error[3];
                if (cb) errDom.onclick = cb;
                else errDom.onclick = () => { };
            }

            // console.log(msg);
        };

        return this;
    }
    run: () => void;
}
const DeclareGroup1 = `@group(1) @binding(0) var<uniform> shadertoyCamMat: tsxAffineMat;` +
    `@group(1) @binding(1) var<uniform> shadertoyTime: f32;`;
export namespace cam {
    export async function load() {
        const app = await new ShadertoyApp(`
struct shadertoyRayOut{
    @location(0) o: vec4f,
    @location(1) d: vec4f
}
${DeclareGroup1}
@ray fn shadertoyMainRay(
    @builtin(ray_direction) rd: vec4f,
    @builtin(ray_origin) ro: vec4f
) -> shadertoyRayOut{
    return shadertoyRayOut(shadertoyCamMat.matrix*ro+shadertoyCamMat.vector, shadertoyCamMat.matrix*rd);
}

@fragment fn shadertoyMainFragment(@location(0) rayOrigin: vec4f, @location(1) rayDir: vec4f)->@location(0) vec4f{
    let t = shadertoyTime; return mainRay(rayOrigin, rayDir);
}
`, 91, 16, rayExamples).load();
        app.run();
    }
}
export namespace voxel {
    export async function load() {
        const app = await new ShadertoyApp(`
struct shadertoyVoxelOut{
    @location(0) position: vec3<f32>,
}
${DeclareGroup1}
@ray fn shadertoyMainRay(
    @builtin(voxel_coord) position: vec3<f32>
) -> shadertoyVoxelOut{
    let k = shadertoyCamMat; let t = shadertoyTime;
    return shadertoyVoxelOut(position);
}

@fragment fn shadertoyMainFragment(@location(0) position: vec3<f32>)->@location(0) vec4f{
    return mainVoxel(position);
}
`, 89, 15, voxelExamples).load();
        app.run();
    }
}