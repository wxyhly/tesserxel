import { render, util } from "../../build/esm/tesserxel.js";
import { createCodemirrorEditor } from "../codemirror.js";
const voxelExamples = {
    "Color-Cube": `fn mainVoxel(pos: vec3<f32>)->vec4<f32>{
  return vec4<f32>(pos*0.5+0.5, 1.0);
}`,
    "Shader-Art": `fn palette(t: f32) -> vec3f {
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

  return vec4f(finalColor, 1.0);
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

    var m = vec4<f32>(8.0, 0.0, 0.0, 0.0);
    for (var j: i32 = -1; j <= 1; j = j + 1) {
        for (var i: i32 = -1; i <= 1; i = i + 1) {
            for (var k: i32 = -1; k <= 1; k = k + 1) {
                let g = vec3<f32>(f32(i), f32(j), f32(k));
                let o = hash(n + g);
                let r = g - f + (0.5 + 0.5 * sin(shadertoyTime + 6.2831 * o));
                let d = dot(r, r);
                if (d < m.x) {
                    m = vec4<f32>(d, o.x, o.y, o.z);
                }
            }
        }
    }

    return vec2<f32>(sqrt(m.x), m.y + m.z + m.w);
}

fn mainVoxel(pos: vec3<f32>)->vec4<f32>{
    let p = pos*0.1;

    let scale = 14.0 + 6.0 * sin(0.2 * shadertoyTime);
    let c = voronoi(scale * p);

    var col = 0.5 + 0.5 * cos(c.y * 6.2831 + vec3<f32>(0.0, 1.0, 2.0));
    col = col * clamp(1.0 - 0.4 * c.x * c.x, 0.0, 1.0);
    col = col - (1.0 - smoothstep(0.08, 0.09, c.x));

    return vec4<f32>(col, 1.0);
}
// Ported from https://www.shadertoy.com/view/MslGD8 by Inigo Quilez 
`,
    "Inversion": `fn mainVoxel(coord: vec3<f32>) -> vec4<f32> {
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
        return vec4<f32>(color, 1.0 - dot(coord, coord));
    } else {
        return vec4<f32>(0.0,0.0,0.0,0.3);
    }
}
`
};
const rayExamples = {
    //     "Glome": `
    // struct Glome{
    //     r: f32,
    //     o: vec4<f32>
    // }
    // struct Cylinder{
    //     r: f32,
    //     o: vec4<f32>,
    //     d: vec4<f32>
    // }
    // struct Ray{
    //     r: vec4<f32>,
    //     o: vec4<f32>
    // }
    // struct intres{
    //     t: f32,
    //     normal: vec4<f32>,
    //     id: u32
    // }
    // fn intCube(r:Ray, c:vec4<f32>, id:u32)-> intres{
    //     let m = vec4<f32>(1.0, 1.0, 1.0, 1.0) / r.r;
    //     let n = m*r.o;
    //     let k = abs(m)*c;
    //     let t1 = -n-k;
    //     let t2 = -n+k;
    //     let tN = max(max(t1.x, t1.y), max(t1.z, t1.w));
    //     let tF = min(min(t2.x, t2.y), min(t2.z, t2.w));
    //     if (tN>tF || tF<0.0) {
    //         return intres(-1.0,vec4<f32>(0.0),0); // No intersection
    //     }
    //     return intres(tN,-sign(r.r)*step(t1.yzwx,t1)*step(t1.zwxy,t1)*step(t1.wxyz,t1),id);
    // }
    // fn intCubeInside(r:Ray, c:vec4<f32>,id:u32)-> intres{
    //     let m = vec4<f32>(1.0, 1.0, 1.0, 1.0) / r.r;
    //     let n = m*r.o;
    //     let k = abs(m)*c;
    //     let t1 = -n-k;
    //     let t2 = -n+k;
    //     let tN = max(max(t1.x, t1.y), max(t1.z, t1.w));
    //     let tF = min(min(t2.x, t2.y), min(t2.z, t2.w));
    //     if (tN>tF || tF<0.0) {
    //         return intres(-1.0,vec4<f32>(0.0),0); // No intersection
    //     }
    //     return intres(tF,-sign(r.r)*step(t2,t2.yzwx)*step(t2,t2.zwxy)*step(t2,t2.wxyz),id);
    // }
    // // fn intCylinder(r:Ray,c:Cylinder)-> vec4<f32>{
    // // }
    // fn unionRes(a:intres, b:intres)->intres{
    //     if ((a.t < b.t&&a.t>=0.0) || b.t < 0.0) {
    //         return a; // a is closer
    //     } else {
    //         return b; // b is closer
    //     }
    // }
    // fn intRes(a:intres, b:intres)->intres{
    //     if (a.t < 0.0  || b.t < 0.0) {
    //         return intres(-1.0, vec4<f32>(0.0),0); // No intersection
    //     }
    //     if (a.t < b.t) {
    //         return b;
    //     }else{
    //         return a;
    //     }
    // }
    // // fn subRes(a:intres, b:intres)->intres{
    // //     if(a.t>0.0 && b.t < 0.0){
    // //         return a;
    // //     }
    // //     if()
    // // }
    // fn intGlome(r:Ray,g:Glome,id:u32)-> intres{
    //     let oc = r.o - g.o;
    //     let a = dot(r.r, r.r);
    //     let b = 2.0 * dot(oc, r.r);
    //     let c = dot(oc, oc) - g.r * g.r;
    //     let d = b * b - 4.0 * a * c;
    //     if (d < 0.0) {
    //         return intres(-1.0, vec4<f32>(0.0),0); // No intersection
    //     }
    //     let t = (-b - sqrt(d)) / (2.0 * a);
    //     if(t < 0.0001){
    //         return intres(-1.0, vec4<f32>(0.0),0); // No intersection
    //     }
    //     return intres(t, normalize(r.o + r.r * t - g.o),id);
    // }
    // fn mainRay(rayOrigin: vec4<f32>, rayDir: vec4<f32>)->vec4<f32>{
    //     var ray = Ray(normalize(rayDir), rayOrigin);
    //     var radianceCoeff = vec3<f32>(1.0, 1.0, 1.0);
    //     var biais = vec3<f32>(0.0, 0.0, 0.0);
    //     const glome1 = Glome(2.0, vec4<f32>(2.8, -0.5, 0.0, 0.5));
    //     const glome2 = Glome(0.5, vec4<f32>(-0.8, 0.0, 0.3, 0.0));
    //     let resG = intGlome(ray, glome1,2);
    //     var reflectedColor = vec3<f32>(0.0, 0.0, 0.0);
    //     if(resG.t>0.0){
    //         ray = Ray(ray.o + ray.r * resG.t, reflect(ray.r, vec4<f32>(1.0, 0.0, 0.0, 0.0)));
    //         biais += radianceCoeff*vec3<f32>(0.2, 0.2, 0.4);
    //         radianceCoeff *= vec3<f32>(0.5, 0.5, 0.8);
    //     }
    //     let resG2 = intGlome(ray, glome2,3);
    //     let resroom = intCubeInside(ray,vec4<f32>(1.0),1);
    //     let uvw = (ray.o + ray.r * resroom.t + vec4<f32>(0.32, 0.31,0.34,0.36))*4.0;
    //     let checker = (floor(uvw.x) + floor(uvw.y) + floor(uvw.z)+ floor(uvw.w)+1000.0) % 2.0;
    //     let res = unionRes(resG2, resroom);
    //     if(res.t < 0.0){return vec4<f32>(0.0, 0.0, 0.0, 1.0);} // No intersection
    //     var color=vec3<f32>(0.0, 0.0, 0.0);
    //     if(res.id==1){color=mix(vec3<f32>(1.0, 1.0, 1.0),vec3<f32>(1.0, 0.4, 0.3) , checker);}
    //     if(res.id==2){color=vec3<f32>(0.0,0.0,1.0);}
    //     if(res.id==3){color=vec3<f32>(0.4,1.0,0.0);}
    //     let brightness = clamp(dot(res.normal,vec4<f32>(0.6,0.9,0.3,0.4)),0.0,1.0)+clamp(dot(res.normal,vec4<f32>(-0.1,0.0,-0.3,-0.5)),0.0,1.0)+0.2;
    //     return vec4<f32>(radianceCoeff*(brightness*color*0.8+reflectedColor*0.3),1.0);
    // }`,
    "SDF": `fn opUnion(d1: f32, d2: f32) -> f32 {
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

fn sdGlome(p: vec4<f32>, r: f32) -> f32 {
    return length(p) - r;
}

fn sdRoundBox(p: vec4<f32>, b: vec4<f32>, r: f32) -> f32 {
    let d = abs(p) - b;
    return min(max(max(max(d.x, d.w), d.y), d.z), 0.0) + length(max(d, vec4<f32>(0.0))) - r;
}

// ----- Map -----

fn map(p: vec4<f32>) -> f32 {
  let pos = p - vec4f(0,-0.5,0,-1.5);
  let an = sin(shadertoyTime);
  return opSmoothSubtraction(sdGlome(pos-vec4<f32>(0.0, 0.5 + 0.3 * an, 0.0,0.0), 0.55),sdRoundBox(pos, vec4<f32>(0.6, 0.2, 0.7,0.4), 0.1),0.1);
  
}

fn calcNormal(pos: vec4<f32>) -> vec4<f32> {
    let ep: f32 = 0.0001;
    let e = vec4<f32>(0.5,-0.5, 0.0, 1.0);
    // 5-cell
    return normalize(
        e.xyyy * map(pos + e.xyyy * ep) +
        e.yyxy * map(pos + e.yyxy * ep) +
        e.yxyy * map(pos + e.yxyy * ep) +
        e.xxxy * map(pos + e.xxxy * ep) +
        e.zzzw * map(pos + e.zzzw * ep)
    );
}

fn calcSoftshadow(ro: vec4<f32>, rd: vec4<f32>, tmin: f32, tmax: f32, k: f32) -> f32 {
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
fn mainRay(ro: vec4<f32>, rayDir: vec4<f32>)->vec4<f32>{
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
    var alpha = 0.3;
    if (t < far) {
        let pos = ro + rd * t;
        let nor = calcNormal(pos);
        let lig = normalize(vec4<f32>(1.0, 0.8, -0.2,0.3));
        let dif = clamp(dot(nor, lig), 0.0, 1.0);
        let sha = calcSoftshadow(pos, lig, 0.001, 1.0, 16.0);
        let amb = 0.5 + 0.5 * nor.y;

        col = vec3<f32>(0.05, 0.1, 0.15) * amb +
              vec3<f32>(1.0, 0.9, 0.8) * dif * sha;
        alpha = 1.0;
    }

    col = sqrt(col);

    return vec4<f32>(col, alpha);
}
// Ported from https://www.shadertoy.com/view/lt3BW2 by Inigo Quilez
`,
    "Seascape": `const NUM_STEPS: i32 = 32;
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

fn diffuse(n: vec4<f32>, l: vec4<f32>, p: f32) -> f32 {
    return pow(dot(n, l) * 0.4 + 0.6, p);
}

fn specular(n: vec4<f32>, l: vec4<f32>, e: vec4<f32>, s: f32) -> f32 {
    let nrm = (s + 8.0) / (PI * 8.0);
    return pow(max(dot(reflect(e, n), l), 0.0), s) * nrm;
}

fn getSkyColor(e: vec4<f32>) -> vec3<f32> {
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

fn map(p: vec4<f32>, iTime: f32) -> f32 {
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

fn map_detailed(p: vec4<f32>, iTime: f32) -> f32 {
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

fn getSeaColor(p: vec4<f32>, n: vec4<f32>, l: vec4<f32>, eye: vec4<f32>, dist: vec4<f32>) -> vec3<f32> {
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

fn getNormal(p: vec4<f32>, eps: f32, iTime: f32) -> vec4<f32> {
    let ny = map_detailed(p, iTime);
    let nx = map_detailed(vec4<f32>(p.x + eps, p.y, p.z,p.w), iTime) - ny;
    let nz = map_detailed(vec4<f32>(p.x, p.y, p.z + eps,p.w), iTime) - ny;
    let nw = map_detailed(vec4<f32>(p.x, p.y, p.z,p.w + eps), iTime) - ny;
    return normalize(vec4<f32>(nx, eps, nz,nw));
}

fn heightMapTracing(ori: vec4<f32>, dir: vec4<f32>, iTime: f32, p: ptr<function, vec4<f32>>) -> f32 {
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
fn mainRay(rayOrigin: vec4<f32>, rayDir: vec4<f32>)->vec4<f32>{
    let ro = rayOrigin + vec4f(0,10,0,0);
    let dir = normalize(rayDir);
    const EPSILON_NRM = 0.1/300;

    let time = shadertoyTime*2.0;

    var p: vec4<f32>;

    _ = heightMapTracing(ro, dir, time, &p);

    let dist = p - ro;
    let n = getNormal(p, dot(dist, dist) * EPSILON_NRM, time);
    let light = normalize(vec4<f32>(0.0, 1.0, 0.8,0.1));
    let color =  mix(
        vec4f(getSkyColor(dir),0.2),
        vec4f(getSeaColor(p, n, light, dir, dist),1.0),
        pow(smoothstep(0.0, -0.02, dir.y), 0.2)
    );

    return vec4<f32>(pow(color.xyz, vec3<f32>(0.65)), color.w);
}
// Ported from https://www.shadertoy.com/view/Ms2SD1    
`
};
class ResizeDivHandler {
    div;
    constructor(resizableDiv, examples, onexec) {
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
        const onMouseMove = (e) => {
            const dy = e.clientY - startY;
            resizableDiv.style.height = `${startHeight + dy}px`;
            BtnBar.style.display = startHeight + dy > 16 ? "block" : "none";
        };
        const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        };
        handle.addEventListener("mousedown", (e) => {
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
        const setStyle = (btn) => {
            btn.style.border = "none";
            btn.style.borderRadius = "4px";
            btn.style.marginLeft = "4px";
            btn.style.background = "#aac8eaff";
            btn.style.color = "white";
            btn.style.cursor = "pointer";
            btn.style.boxShadow = "0 1px 3px rgba(0,0,0,0.2)";
            btn.style.transition = "background 0.2s, transform 0.1s, box-shadow 0.2s";
            btn.addEventListener("mouseenter", () => {
                btn.style.background = "#357ABD";
                btn.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
            });
            btn.addEventListener("mouseleave", () => {
                btn.style.background = "#aac8eaff";
                btn.style.boxShadow = "0 1px 3px rgba(0,0,0,0.2)";
                btn.style.transform = "scale(1)";
            });
        };
        collapseBtn.addEventListener("click", () => {
            this.div.style.transition = "height 0.3s ease";
            this.div.style.height = "0px";
            BtnBar.style.display = "none";
        });
        const runBtn = document.createElement("button");
        runBtn.textContent = "Examples";
        // const btns: HTMLButtonElement[] = [];
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
class ShadertoyApp {
    renderer;
    camController;
    retinaController;
    camBuffer;
    inputBuffer;
    bindgroups;
    pipeline;
    lineAllOffset;
    lineRflOffset;
    headercode;
    examples;
    constructor(headercode, lineAllOffset, lineRflOffset, examples) {
        this.headercode = headercode;
        this.lineAllOffset = lineAllOffset;
        this.lineRflOffset = lineRflOffset;
        this.examples = examples;
    }
    async load() {
        let gpu = await new render.GPU().init();
        let canvas = document.getElementById("gpu-canvas");
        let context = gpu.getContext(canvas);
        let renderer = new render.SliceRenderer(gpu, {
            enableFloat16Blend: false,
            sliceGroupSize: 8
        });
        this.renderer = renderer;
        let camBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 4 * 4 * 5);
        let inputBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 4);
        renderer.setDisplayConfig({ screenBackgroundColor: { r: 1, g: 1, b: 1, a: 1 }, opacity: 5 });
        let camController = new util.ctrl.FreeFlyController();
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
        this.run = () => {
            if (this.pipeline && this.camBuffer && this.bindgroups) {
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
        };
        function setSize() {
            let width = window.innerWidth * window.devicePixelRatio;
            let height = window.innerHeight * window.devicePixelRatio;
            canvas.width = width;
            canvas.height = height;
            renderer.setDisplayConfig({ canvasSize: { width, height } });
        }
        setSize();
        window.addEventListener("resize", setSize);
        const exec = async (code) => {
            const oldPipeline = this.pipeline;
            try {
                this.pipeline = await this.renderer.createRaytracingPipeline({
                    code: this.headercode + code,
                    rayEntryPoint: "shadertoyMainRay",
                    fragmentEntryPoint: "shadertoyMainFragment"
                });
            }
            catch (e) {
                const error = e?.message?.match(/^(.+) Line:([0-9]+)/);
                if (error) {
                    showError([Number(error[2]) - this.lineRflOffset]);
                    errDom.innerText = error[1];
                }
                this.pipeline = oldPipeline;
            }
            this.bindgroups = [this.renderer.createVertexShaderBindGroup(this.pipeline, 1, [this.camBuffer, this.inputBuffer])];
        };
        const codeDom = document.createElement("div");
        document.body.appendChild(codeDom);
        function getRandomValue(obj) {
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
            ctrlreg.disableDefaultEvent = true;
            camController.enabled = true;
            retinaController.enabled = true;
        });
        codeDom.style.position = "absolute";
        codeDom.style.top = "0px";
        codeDom.style.left = "0px";
        codeDom.style.backgroundColor = "rgba(255,255,255,0.8)";
        editor.dom.style.borderRadius = "5px";
        editor.dom.style.height = "250px";
        editor.dom.style.width = "100%";
        codeDom.style.width = "100%";
        new ResizeDivHandler(editor.dom, this.examples, c => {
            editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: c } });
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
                showError([Number(error[1]) - this.lineAllOffset]);
                errDom.innerText = error[3];
            }
            // console.log(msg);
        };
        return this;
    }
    run;
}
const DeclareGroup1 = `@group(1) @binding(0) var<uniform> shadertoyCamMat: tsxAffineMat;` +
    `@group(1) @binding(1) var<uniform> shadertoyTime: f32;`;
export var cam;
(function (cam) {
    async function load() {
        const app = await new ShadertoyApp(`
struct shadertoyRayOut{
    @location(0) o: vec4<f32>,
    @location(1) d: vec4<f32>
}
${DeclareGroup1}
@ray fn shadertoyMainRay(
    @builtin(ray_direction) rd: vec4<f32>,
    @builtin(ray_origin) ro: vec4<f32>
) -> shadertoyRayOut{
    return shadertoyRayOut(shadertoyCamMat.matrix*ro+shadertoyCamMat.vector, shadertoyCamMat.matrix*rd);
}

@fragment fn shadertoyMainFragment(@location(0) rayOrigin: vec4<f32>, @location(1) rayDir: vec4<f32>)->@location(0) vec4<f32>{
    let t = shadertoyTime; return mainRay(rayOrigin, rayDir);
}
`, 91, 16, rayExamples).load();
        app.run();
    }
    cam.load = load;
})(cam || (cam = {}));
export var voxel;
(function (voxel) {
    async function load() {
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

@fragment fn shadertoyMainFragment(@location(0) position: vec3<f32>)->@location(0) vec4<f32>{
    return mainVoxel(position);
}
`, 89, 15, voxelExamples).load();
        app.run();
    }
    voxel.load = load;
})(voxel || (voxel = {}));
//# sourceMappingURL=shadertoy.js.map