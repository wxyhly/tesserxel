import { render, util } from "../../build/esm/tesserxel.js";
// export namespace examples {
class MengerApp {
    renderer;
    camController;
    retinaController;
    headercode = `
struct rayOut{
    @location(0) o: vec4f,
    @location(1) d: vec4f
}
@group(1) @binding(0) var<uniform> camMat: tsxAffineMat;
@ray fn mainRay(
    @builtin(ray_direction) rd: vec4f,
    @builtin(ray_origin) ro: vec4f
) -> rayOut{
    
    return rayOut(camMat.matrix*ro+camMat.vector, camMat.matrix*rd);
}
fn maxcomp( p : vec4f)->f32 { return max(p.x,max(p.y, max(p.w,p.z)));}
fn sdBox( p:vec4f, b:vec4f )->f32
{
    let di:vec4f = abs(p) - b;
    let mc:f32 = maxcomp(di);
    return min(mc,length(max(di,vec4f(0.0))));
}

fn iBox( ro:vec4f, rd:vec4f, rad:vec4f )->vec2<f32> 
{
    let m:vec4f = 1.0/rd;
    let n:vec4f = m*ro;
    let k:vec4f = abs(m)*rad;
    let t1:vec4f = -n - k;
    let t2:vec4f = -n + k;
	return vec2<f32>( max( max( max( t1.x, t1.y ), t1.z ),t1.w),
	            min( min( min( t2.x, t2.y ), t2.z ),t2.w) );
}
const ma = mat4x4f( 0.60, 0.00,  0.80, 0.0,
                      0.00, 1.00,  0.00,  0.0,
                     -0.80, 0.00,  0.60,0.0,
                     0.0,0.0,0.0,1.0);
fn map(pos:vec4f )->vec4f
{
    var p = pos;
    var d:f32 = sdBox(p,vec4f(1.0));
    var res = vec4f( d, 1.0, 0.0, 0.0 );
	
    var s:f32 = 1.0;
    for(var m = 0; m<5; m = m + 1)
    {
        let a:vec4f = fract( p*s / 2.0 ) * 2.0-vec4f(1.0);
        s *= 3.0;
        let r = abs(vec4f(1.0) - 3.0*abs(a));
        {replace}
    }

    return res;
}

fn intersect( ro:vec4f, rd:vec4f )->vec4f
{
    let bb = iBox( ro, rd, vec4f(1.01) );
    if( bb.y<bb.x ) {return vec4f(-1.0);}
    
    let tmin = bb.x;
    let tmax = bb.y;
    
    var t = max(0.0,tmin);
    var res = vec4f(-1.0);
    for( var i=0; i<64; i=i+1 )
    {
        let h = map(ro + rd*t);
		if( h.x<0.002 || t>tmax ){ break;}
        res = vec4f(t,h.yzw);
        t += h.x;
    }
	if( t>tmax ) {res = vec4f(-1.0);}
    return res;
}

fn softshadow( ro:vec4f, rd:vec4f, mint:f32, k:f32 )->f32
{
    let bb = iBox( ro, rd, vec4f(1.05) );
    let tmax = bb.y;
    
    var res:f32 = 1.0;
    var t = mint;
    for( var i=0; i<64; i++ )
    {
        let h = map(ro + rd*t).x;
        res = min( res, k*h/t );
        if( res<0.001 ) {break;}
		t += clamp( h, 0.005, 0.1 );
        if( t>tmax ) {break;}
    }
    return clamp(res,0.0,1.0);
}

fn calcNormal(pos:vec4f)->vec4f
{
    let eps = vec4f(0.001,0.0,0.0,0.0);
    return normalize(vec4f(
        map(pos+eps.xyyy).x - map(pos-eps.xyyy).x,
        map(pos+eps.yxyy).x - map(pos-eps.yxyy).x,
        map(pos+eps.yyxy).x - map(pos-eps.yyxy).x,
        map(pos+eps.yyyx).x - map(pos-eps.yyyx).x,
    ));
}

fn render( ro:vec4f, rd:vec4f )->vec4f
{
    // background color
    var col = vec4f(mix( vec3<f32>(0.3,0.2,0.1)*0.5, vec3<f32>(0.7, 0.9, 1.0), 0.5 + 0.5*rd.y ),0.15);
	
    let tmat = intersect(ro,rd);
    if( tmat.x>0.0 )
    {
        let pos:vec4f = ro + tmat.x*rd;
        let nor:vec4f = calcNormal(pos);
        
        let matcol:vec3<f32> = vec3<f32>(0.5) + 0.5*cos(vec3<f32>(0.0,1.0,2.0)+2.0*tmat.z);
        
        let occ = tmat.y;

        let light = normalize(vec4f(1.0,0.9,0.3,0.6));
        var dif:f32 = dot(nor,light);
        var sha:f32 = 1.0;
        // if( dif>0.0 ){ sha=softshadow( pos, light, 0.01, 64.0 );}
        dif = max(dif,0.0);
        let hal:vec4f = normalize(light-rd);
        let spe:f32 = dif*sha*pow(clamp(dot(hal,nor),0.0,1.0),16.0)*(0.04+0.96*pow(clamp(1.0-dot(hal,light),0.0,1.0),5.0));
        
		let sky:f32 = 0.5 + 0.5*nor.y;
        let bac:f32 = max(0.4 + 0.6*dot(nor,vec4f(-light.x,light.y,-light.z,light.w)),0.0);

        var lin = vec3<f32>(0.0);
        lin += 1.00*dif*vec3<f32>(1.10,0.85,0.60)*sha;
        lin += 0.50*sky*vec3<f32>(0.10,0.20,0.40)*occ;
        lin += 0.10*bac*vec3<f32>(1.00,1.00,1.00)*(0.5+0.5*occ);
        lin += 0.25*occ*vec3<f32>(0.15,0.17,0.20);	 
        col = vec4f(matcol*lin + spe*128.0, 1.0);
    }
    var gamma = 1.5*col.xyz/(vec3<f32>(1.0)+col.xyz);
    gamma = sqrt( gamma );
    return vec4f(gamma, col.w);
}

@fragment fn mainFragment(@location(0) rayOrigin: vec4f, @location(1) rayDir: vec4f)->@location(0) vec4f{
    return render(rayOrigin, rayDir);
}
        `;
    async load(code) {
        let gpu = await new render.GPU().init();
        let canvas = document.getElementById("gpu-canvas");
        let context = gpu.getContext(canvas);
        let renderer = new render.SliceRenderer(gpu, {
            enableFloat16Blend: false,
            sliceGroupSize: 8
        });
        this.renderer = renderer;
        renderer.setDisplayConfig({ screenBackgroundColor: { r: 1, g: 1, b: 1, a: 1 } });
        let camBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 4 * 4 * 5);
        let camController = new util.ctrl.FreeFlyController();
        camController.object.position.set(0, 0, 0, 3);
        this.camController = camController;
        let retinaController = new util.ctrl.RetinaController(renderer);
        this.retinaController = retinaController;
        let ctrlreg = new util.ctrl.ControllerRegistry(canvas, [camController, retinaController], { preventDefault: true, enablePointerLock: true });
        let matModelViewJSBuffer = new Float32Array(20);
        let pipeline = await renderer.createRaytracingPipeline({
            code: this.headercode.replace(/\{replace\}/g, code),
            rayEntryPoint: "mainRay",
            fragmentEntryPoint: "mainFragment"
        });
        await renderer.init();
        let bindgroups = [renderer.createVertexShaderBindGroup(pipeline, 1, [camBuffer])];
        this.run = () => {
            ctrlreg.update();
            camController.object.getAffineMat4().writeBuffer(matModelViewJSBuffer);
            gpu.device.queue.writeBuffer(camBuffer, 0, matModelViewJSBuffer);
            renderer.render(context, (rs) => {
                rs.drawRaytracing(pipeline, bindgroups);
            });
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
        return this;
    }
    run;
}
export var menger_sponge1;
(function (menger_sponge1) {
    async function load() {
        let app = await new MengerApp().load(`
            let da = max(max(r.x,r.y),r.z);
            let db = max(max(r.x,r.y),r.w);
            let dc = max(max(r.x,r.w),r.z);
            let dd = max(max(r.w,r.y),r.z);
            let minc = min(da,min(db,min(dc,dd)));
            let c = (minc - 1.0)/s;
    
            if( c>d ){
                d = c;
                res = vec4f( d, res.y, (1.0+f32(m))/4.0, 0.0 );
            }`);
        app.retinaController.setOpacity(6);
        app.run();
    }
    menger_sponge1.load = load;
})(menger_sponge1 || (menger_sponge1 = {}));
export var menger_sponge2;
(function (menger_sponge2) {
    async function load() {
        let app = await new MengerApp().load(`
        let da = max(r.x,r.y);
        let db = max(r.x,r.z);
        let dc = max(r.x,r.w);
        let dd = max(r.w,r.y);
        let de = max(r.w,r.z);
        let df = max(r.z,r.y);
        let minc = min(da,min(db,min(dc,min(min(dd,de),df))));
        let c = (minc - 1.0)/s;

        if( c>d ){
            d = c;
            res = vec4f( d, res.y, (1.0+f32(m))/4.0, 0.0 );
        }`);
        app.retinaController.setOpacity(2);
        app.run();
    }
    menger_sponge2.load = load;
})(menger_sponge2 || (menger_sponge2 = {}));
// }
//# sourceMappingURL=mengersponge.js.map