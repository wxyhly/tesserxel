// namespace examples {
//     export namespace menger_sponge {
//         let raytracingCode = `
//         struct ray{
//             o: vec4<f32>,
//             d: vec4<f32>,
//         }
//         struct glome{
//             p: vec4<f32>,
//             r: f32,
//             id: u32
//         }
//         fn intGlome(r:ray, g:glome)->f32 {
//              let oc = r.o - g.p;
//             let b = dot(oc, r.d);
//             let c = dot(oc, oc) - g.r*g.r;
//             var t = b*b - c;
//             if(t > 0.0) {
//                 t = -b - sqrt(t);
//             }
//             return t;
//         }
//         fn at(r:ray, t:f32)->vec4<f32>{
//             return r.o + r.d * t;
//         }
//         struct fOutputs {
//             @location(0) color: vec4<f32>,
//             @builtin(frag_depth) depth: f32,
//         }
//         struct rayOut{
//             @location(0) o: vec4<f32>,
//             @location(1) d: vec4<f32>,
//             @location(2) screen: vec3<f32>,
//         }
//         @group(1) @binding(0) var<uniform> camMat: AffineMat;
//         @ray fn mainRay(
//             @builtin(ray_direction) rd: vec4<f32>,
//             @builtin(ray_origin) ro: vec4<f32>,
//             @builtin(voxel_coord) coord: vec3<f32>,
//             @builtin(screen_aspect) aspect: f32
//         ) -> rayOut{
            
//             return rayOut(camMat.matrix*ro+camMat.vector, camMat.matrix*rd, vec3<f32>(coord.x*aspect,coord.yz));
//         }

        
// fn maxcomp( p : vec4<f32>)->f32 { return max(p.x,max(p.y, max(p.w,p.z)));}
// fn sdBox( p:vec4<f32>, b:vec4<f32> )->f32
// {
//     let di:vec4<f32> = abs(p) - b;
//     let mc:f32 = maxcomp(di);
//     return min(mc,length(max(di,vec4<f32>(0.0))));
// }

// fn iBox( ro:vec4<f32>, rd:vec4<f32>, rad:vec4<f32> )->vec2<f32> 
// {
//     let m:vec4<f32> = 1.0/rd;
//     let n:vec4<f32> = m*ro;
//     let k:vec4<f32> = abs(m)*rad;
//     let t1:vec4<f32> = -n - k;
//     let t2:vec4<f32> = -n + k;
// 	return vec2<f32>( max( max( max( t1.x, t1.y ), t1.z ),t1.w),
// 	            min( min( min( t2.x, t2.y ), t2.z ),t2.w) );
// }

// const ma = mat4x4<f32>( 0.60, 0.00,  0.80, 0.0,
//                       0.00, 1.00,  0.00,  0.0,
//                      -0.80, 0.00,  0.60,0.0,
//                      0.0,0.0,0.0,1.0);
// fn map(pos:vec4<f32> )->vec4<f32>
// {
//     var p = pos;
//     var d:f32 = sdBox(p,vec4<f32>(1.0));
//     var res = vec4<f32>( d, 1.0, 0.0, 0.0 );
//     const iTime: f32 = 1.0;
//     let ani:f32 = smoothstep( -0.2, 0.2, -cos(0.5*iTime) );
// 	let off:f32 = 1.5*sin( 0.01*iTime );
	
//     var s:f32 = 1.0;
//     for(var m = 0; m<5; m = m + 1)
//     {
//         p = mix( p, ma*(p+vec4<f32>(off)), ani );
	   
//         let a:vec4<f32> = fract( p*s / 2.0 ) * 2.0-vec4<f32>(1.0);
//         s *= 3.0;
//         let r = abs(vec4<f32>(1.0) - 3.0*abs(a));
//         let da = max(max(r.x,r.y),r.z);
//         let db = max(max(r.x,r.y),r.w);
//         let dc = max(max(r.x,r.w),r.z);
//         let dd = max(max(r.w,r.y),r.z);
//         let minc = min(da,min(db,min(dc,dd)));
//         let c = (minc - 1.0)/s;

//         if( c>d ){
//             d = c;
//             res = vec4<f32>( d, min(res.y, 0.2*da*db*dc*dd), (1.0+f32(m))/4.0, 0.0 );
//         }
//     }

//     return res;
// }

// fn intersect( ro:vec4<f32>, rd:vec4<f32> )->vec4<f32>
// {
//     let bb = iBox( ro, rd, vec4<f32>(1.05) );
//     if( bb.y<bb.x ) {return vec4<f32>(-1.0);}
    
//     let tmin = bb.x;
//     let tmax = bb.y;
    
//     var t = tmin;
//     var res = vec4<f32>(-1.0);
//     for( var i=0; i<64; i=i+1 )
//     {
//         let h = map(ro + rd*t);
// 		if( h.x<0.002 || t>tmax ){ break;}
//         res = vec4<f32>(t,h.yzw);
//         t += h.x;
//     }
// 	if( t>tmax ) {res = vec4<f32>(-1.0);}
//     return res;
// }

// fn softshadow( ro:vec4<f32>, rd:vec4<f32>, mint:f32, k:f32 )->f32
// {
//     let bb = iBox( ro, rd, vec4<f32>(1.05) );
//     let tmax = bb.y;
    
//     var res:f32 = 1.0;
//     var t = mint;
//     for( var i=0; i<64; i++ )
//     {
//         let h = map(ro + rd*t).x;
//         res = min( res, k*h/t );
//         if( res<0.001 ) {break;}
// 		t += clamp( h, 0.005, 0.1 );
//         if( t>tmax ) {break;}
//     }
//     return clamp(res,0.0,1.0);
// }

// fn calcNormal(pos:vec4<f32>)->vec4<f32>
// {
//     let eps = vec4<f32>(0.001,0.0,0.0,0.0);
//     return normalize(vec4<f32>(
//     map(pos+eps.xyyy).x - map(pos-eps.xyyy).x,
//     map(pos+eps.yxyy).x - map(pos-eps.yxyy).x,
//     map(pos+eps.yyxy).x - map(pos-eps.yyxy).x,
//     map(pos+eps.yyyx).x - map(pos-eps.yyyx).x,
//      ));
// }

// fn render( ro:vec4<f32>, rd:vec4<f32> )->vec4<f32>
// {
//     // background color
//     var col = vec4<f32>(mix( vec3<f32>(0.3,0.2,0.1)*0.5, vec3<f32>(0.7, 0.9, 1.0), 0.5 + 0.5*rd.y ),0.2);
	
//     let tmat = intersect(ro,rd);
//     if( tmat.x>0.0 )
//     {
//         let pos:vec4<f32> = ro + tmat.x*rd;
//         let nor:vec4<f32> = calcNormal(pos);
        
//         let matcol:vec3<f32> = vec3<f32>(0.5) + 0.5*cos(vec3<f32>(0.0,1.0,2.0)+2.0*tmat.z);
        
//         let occ = tmat.y;

//         let light = normalize(vec4<f32>(1.0,0.9,0.3,0.6));
//         var dif:f32 = dot(nor,light);
//         var sha:f32 = 1.0;
//         if( dif>0.0 ){ sha=softshadow( pos, light, 0.01, 64.0 );}
//         dif = max(dif,0.0);
//         let hal:vec4<f32> = normalize(light-rd);
//         let spe:f32 = dif*sha*pow(clamp(dot(hal,nor),0.0,1.0),16.0)*(0.04+0.96*pow(clamp(1.0-dot(hal,light),0.0,1.0),5.0));
        
// 		let sky:f32 = 0.5 + 0.5*nor.y;
//         let bac:f32 = max(0.4 + 0.6*dot(nor,vec4<f32>(-light.x,light.y,-light.z,light.w)),0.0);

//         var lin = vec3<f32>(0.0);
//         lin += 1.00*dif*vec3<f32>(1.10,0.85,0.60)*sha;
//         lin += 0.50*sky*vec3<f32>(0.10,0.20,0.40)*occ;
//         lin += 0.10*bac*vec3<f32>(1.00,1.00,1.00)*(0.5+0.5*occ);
//         lin += 0.25*occ*vec3<f32>(0.15,0.17,0.20);	 
//         col = vec4<f32>(matcol*lin + spe*128.0, 1.0);
//     }

//     var gamma = 1.5*col.xyz/(vec3<f32>(1.0)+col.xyz);
//     gamma = sqrt( gamma );
    
//     return vec4<f32>(gamma, col.w);
// }

//         @fragment fn mainFragment(@location(0) rayOrigin: vec4<f32>, @location(1) rayDir: vec4<f32>, @location(2) screenPos: vec3<f32>)->fOutputs{
//             var depth = 0.0;
//             return fOutputs(
//                 render(rayOrigin, rayDir),
//                 depth
//             );
//             // let g1 = glome(vec4<f32>(0.0,0.0,0.0,0.0),1.0,0);
//             // let a = abs(abs(screenPos) - vec3<f32>(1.0));
//             // if(length(screenPos - vec3<f32>(-0.5,0.0,0.0)) < 0.2){
//             //     return fOutputs(vec4<f32>(1.0,1.0,0.0,1.0),depth);
//             // }
//             // if(a.x <0.1 || a.y < 0.1 || a.z<0.1){
//             //     return fOutputs(vec4<f32>(rayDir.xyz,0.0),depth);
//             // }else{
//             //     let r = ray(rayOrigin,normalize(rayDir));
//             //     let d = intGlome(r, g1);
//             //     if(d > 0){
//             //         let p = normalize(at(r, d) - g1.p);
//             //         return fOutputs(
//             //             vec4<f32>(dot(p,vec4<f32>(1.0,2.0,3.0,2.0))*vec3<f32>(1.0,0.5,0.2),1.0),
//             //             calDepth(d)
//             //         );
//             //     }
//             //     let dir = normalize(rayDir).ywx;
//             //     return fOutputs(
//             //         vec4<f32>(sin(dir*10.0),0.3),
//             //         depth
//             //     );
//             // }
//         }
        
        
//         `;
//         let vertCode = `
//         // vertex attributes, regard four vector4 for vertices of one tetrahedra as matrix4x4 
//         struct InputType{
//             @location(0) pos: mat4x4<f32>,
//             @location(1) normal: mat4x4<f32>,
//             @location(2) uvw: mat4x4<f32>,
//         }
//         // output position in camera space and data sent to fragment shader to be interpolated
//         struct OutputType{
//             @builtin(position) pos: mat4x4<f32>,
//             @location(0) normal: mat4x4<f32>,
//             @location(1) uvw: mat4x4<f32>,
//         }
//         // we define an affineMat to store rotation and transform since there's no mat5x5 in wgsl
//         struct AffineMat{
//             matrix: mat4x4<f32>,
//             vector: vec4<f32>,
//         }
//         // remember that group(0) is occupied by internal usage and binding(0) to binding(2) are occupied by vertex attributes
//         // so we start here by group(1) binding(3)
//         @group(1) @binding(3) var<uniform> camMat: AffineMat;
//         // apply affineMat to four points
//         fn applyinv(afmat: AffineMat, points: mat4x4<f32>) -> mat4x4<f32>{
//             let biais = mat4x4<f32>(afmat.vector, afmat.vector, afmat.vector, afmat.vector);
//             return transpose(afmat.matrix) * (points - biais);
//         }
//         // tell compiler that this is tetra slice pipeline's entry function by '@tetra'
//         @tetra fn main(input : InputType) -> OutputType{
//             return OutputType(applyinv(camMat,input.pos), camMat.matrix * input.normal, input.uvw);
//         }
//         `;
//         let fragHeaderCode = `
//         // receive data from vertex output, these values are automatically interpolated for every fragment
//         struct fInputType{
//             @location(0) normal : vec4<f32>,
//             @location(1) uvw : vec4<f32>,
//         };
//         // a color space conversion function
//         fn hsb2rgb( c:vec3<f32> )->vec3<f32>{
//             let a = fract(
//                 c.x+vec3<f32>(0.0,4.0,2.0)/6.0
//             );
//             var rgb = clamp(abs(a*6.0-vec3<f32>(3.0))-vec3<f32>(1.0),
//                 vec3<f32>(0.0),
//                 vec3<f32>(1.0)
//             );
//             rgb = rgb*rgb*(3.0-rgb * 2.0);
//             return c.z * mix(vec3<f32>(1.0), rgb, c.y);
//         }
//         @fragment fn main(vary: fInputType) -> @location(0) vec4<f32> {
//             const colors = array<vec3<f32>,8> (
//                 vec3<f32>(1, 0, 0),
//                 vec3<f32>(1, 1, 0),
//                 vec3<f32>(1, 0, 1),
//                 vec3<f32>(0, 0, 1),
//                 vec3<f32>(1, 0.5, 0),
//                 vec3<f32>(0, 0.5, 1),
//                 vec3<f32>(0, 1, 1),
//                 vec3<f32>(0.6, 0.9, 0.2),
//             );
//             const radius: f32 = 0.8;
//             const ambientLight = vec3<f32>(0.8);
//             const frontLightColor = vec3<f32>(5.0,4.6,3.5);
//             const backLightColor = vec3<f32>(1.9,2.4,2.8);
//             const directionalLight_dir = vec4<f32>(0.1,0.5,0.4,1.0);
//             var color:vec3<f32> = vec3(1.0,1.0,1.0);
//             var count:f32 = 0;
//             count += step(0.8,abs(vary.uvw.x));
//             count += step(0.8,abs(vary.uvw.y));
//             count += step(0.8,abs(vary.uvw.z));
//             if(dot(vary.uvw.xyz,vary.uvw.xyz) < radius * radius * radius || count >= 2.0){
//                 color = colors[u32(vary.uvw.w + 0.1)];
//             }
//             color = color * (
//                 ambientLight + frontLightColor * max(0, dot(directionalLight_dir , vary.normal)) + backLightColor * max(0, -dot(directionalLight_dir , vary.normal))
//             );
//             return vec4<f32>(pow(color,vec3<f32>(0.6))*0.5, 0.2 + f32(count>=2.0));
//         }
//         `;
//         export async function load() {
//             let gpu = await tesserxel.renderer.createGPU();
//             let canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
//             let context = gpu.getContext(canvas);
//             let renderer = await new tesserxel.renderer.SliceRenderer().init(gpu, context, {
//                 enableFloat16Blend: false,
//                 sliceGroupSize: 8
//             });
//             renderer.set4DCameraProjectMatrix({
//                 fov: 100, near: 0.01, far: 10
//             });
//             renderer.setScreenClearColor({ r: 1, g: 1, b: 1, a: 1 });
//             let camBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 4 * 4 * 5);
//             let trackBallController = new tesserxel.controller.KeepUpController();
//             trackBallController.object.position.set(0, 0, 0, -3);
//             let retinaController = new tesserxel.controller.RetinaController(renderer);
//             let controller = new tesserxel.controller.ControllerRegistry(canvas, [trackBallController, retinaController], { preventDefault: true, requsetPointerLock: true });
//             let matModelViewJSBuffer = new Float32Array(20);
//             let pipeline = await renderer.createRaytracingPipeline({
//                 code: raytracingCode,
//                 rayEntryPoint: "mainRay",
//                 fragmentEntryPoint: "mainFragment"
//             });
//             let bindgroups = [renderer.createBindGroup(pipeline, 1, [camBuffer])];

//             let cube = tesserxel.mesh.tetra.tesseract();

//             let tetraPipeline = await renderer.createTetraSlicePipeline({
//                 vertex: {
//                     code: vertCode,
//                     entryPoint: "main"
//                 },
//                 fragment: {
//                     code: fragHeaderCode,
//                     entryPoint: "main"
//                 }
//             });
//             let cubeBuffers = renderer.createBindGroup(tetraPipeline, 1, [
//                 gpu.createBuffer(GPUBufferUsage.STORAGE, cube.position),
//                 gpu.createBuffer(GPUBufferUsage.STORAGE, cube.normal),
//                 gpu.createBuffer(GPUBufferUsage.STORAGE, cube.uvw),
//                 camBuffer
//             ]);
//             let run = () => {
//                 controller.update();
//                 trackBallController.object.getAffineMat4().writeBuffer(matModelViewJSBuffer);
//                 gpu.device.queue.writeBuffer(camBuffer, 0, matModelViewJSBuffer);

//                 renderer.render(() => {
//                     renderer.drawRaytracing(pipeline, bindgroups);
//                     renderer.beginTetras(tetraPipeline);
//                     renderer.sliceTetras(cubeBuffers, cube.tetraCount);
//                     renderer.drawTetras();
//                 });
//                 window.requestAnimationFrame(run);
//             }
//             function setSize() {
//                 let width = window.innerWidth * window.devicePixelRatio;
//                 let height = window.innerHeight * window.devicePixelRatio;
//                 canvas.width = width;
//                 canvas.height = height;
//                 renderer.setSize({ width, height });
//             }
//             setSize();
//             window.addEventListener("resize", setSize);
//             run();
//         }
//     }
// }