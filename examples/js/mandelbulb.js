import * as tesserxel from "../../build/esm/tesserxel.js";
// namespace examples {
class MandelApp {
    renderer;
    camController;
    retinaController;
    headercode = `
        struct rayOut{
            @location(0) o: vec4<f32>,
            @location(1) d: vec4<f32>
        }
        @group(1) @binding(0) var<uniform> camMat: tsxAffineMat;
        @ray fn mainRay(
            @builtin(ray_direction) rd: vec4<f32>,
            @builtin(ray_origin) ro: vec4<f32>
        ) -> rayOut{
            return rayOut(camMat.matrix*ro+camMat.vector, camMat.matrix*rd);
        }
        const MARCHINGITERATIONS = 64;
        const MARCHINGSTEP = 0.5;
        const SMALLESTSTEP = 0.1;

        const DISTANCE = 3.0;

        const MAXMANDELBROTDIST = 1.5;
        const MANDELBROTSTEPS = 64;

        // cosine based palette, 4 params: vec4<f32>
        fn cosineColor( t: f32, a: vec3<f32>, b: vec3<f32>, c: vec3<f32>, d: vec3<f32> )-> vec3<f32>
        {
            return a + b*cos( 6.28318*(c*t+d) );
        }
        fn palette (t: f32)-> vec3<f32> {
            return cosineColor( t, vec3<f32>(0.5,0.5,0.5),vec3<f32>(0.5,0.5,0.5),vec3<f32>(0.01,-0.02414,0.03732),vec3<f32>(0.00, -0.15, 0.20) );
        }

        // distance estimator to a mandelbulb set
        // returns the distance to the set on the x coordinate 
        // and the color on the y coordinate
        fn DE(pos: vec4<f32>)->vec2<f32> {
            const Power: f32 = 10.0;
            var z: vec4<f32> = pos;
            var dr: f32 = 1.0;
            var r: f32 = 0.0;
            for (var i = 0; i < MANDELBROTSTEPS ; i++) {
                r = length(z);
                if (r>MAXMANDELBROTDIST){ break;}
                {replace}
            }
            return vec2<f32>(0.5*log(r)*r/dr,50.0*pow(dr,0.128/f32(MARCHINGITERATIONS)));
        }

        // MAPPING FUNCTION ... 
        // returns the distance of the nearest object in the direction p on the x coordinate 
        // and the color on the y coordinate
        // vec2 map( p: vec4<f32> )
        // {
        //     //p = fract(p); 
        //    	vec2 d = DE(p);

            

        //    	return d;
        // }


        // TRACING A PATH : 
        // measuring the distance to the nearest object on the x coordinate
        // and returning the color index on the y coordinate
        fn trace  (origin: vec4<f32>, ray: vec4<f32>)->vec2<f32> {
            
            //t is the point at which we are in the measuring of the distance
            var t: f32 =0.0;
            var c: f32 = 0.0;
            
            for (var i = 0; i<MARCHINGITERATIONS; i++) {
                let path = origin + ray * t;	
                let dist = DE(path);
                // we want t to be as large as possible at each step but not too big to induce artifacts
                t += MARCHINGSTEP * dist.x;
                c += dist.y;
                if (dist.y < SMALLESTSTEP){ break;}
            }
            
            return vec2<f32>(t,c);
        }

        fn render(origin:vec4<f32>, ray:vec4<f32>)->vec4<f32>
        {
            let depth = trace(origin,ray);
            //rendering with a fog calculation (further is darker)
            let fog: f32 = 1.0 / (1.0 + depth.x * depth.x * 0.1);
            
            // Output to screen
            return vec4<f32>(palette(depth.y + 12.0)*fog,fog);
        }

        @fragment fn mainFragment(@location(0) rayOrigin: vec4<f32>, @location(1) rayDir: vec4<f32>)->@location(0) vec4<f32>{
        return render(rayOrigin, rayDir);
        }
        `;
    async load(code, fnDE) {
        let gpu = await new tesserxel.render.GPU().init();
        let canvas = document.getElementById("gpu-canvas");
        let context = gpu.getContext(canvas);
        let renderer = await new tesserxel.render.SliceRenderer(gpu, {
            enableFloat16Blend: false,
            sliceGroupSize: 8
        });
        this.renderer = renderer;
        renderer.setDisplayConfig({ screenBackgroundColor: { r: 1, g: 1, b: 1, a: 1 }, retinaResolution: 64 });
        let camBuffer = gpu.createBuffer(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 4 * 4 * 5);
        let camController = new tesserxel.util.ctrl.FreeFlyController();
        camController.object.position.set(0.001, 0.00141, 0.00172, 3);
        this.camController = camController;
        let retinaController = new tesserxel.util.ctrl.RetinaController(renderer);
        this.retinaController = retinaController;
        let ctrlreg = new tesserxel.util.ctrl.ControllerRegistry(canvas, [camController, retinaController], { preventDefault: true, enablePointerLock: true });
        let matModelViewJSBuffer = new Float32Array(20);
        let pipeline = await renderer.createRaytracingPipeline({
            code: this.headercode.replace(/\{replace\}/g, code),
            rayEntryPoint: "mainRay",
            fragmentEntryPoint: "mainFragment"
        });
        await renderer.init();
        let bindgroups = [renderer.createVertexShaderBindGroup(pipeline, 1, [camBuffer])];
        this.run = () => {
            let de = fnDE(camController.object.position);
            camController.keyMoveSpeed = de * 0.001;
            retinaController.setSectionEyeOffset(de * 0.2);
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
export var mandelbulb_hopf;
(function (mandelbulb_hopf) {
    async function load() {
        let app = await new MandelApp().load(`
                dr =  pow(r, Power - 1.0)*Power*dr + 1.0;
                // convert to hopf coordinates
                var theta: f32 = acos(length(z.zw)/r);
                var phi1: f32 = atan2(z.y,z.x);
                var phi2: f32 = atan2(z.w,z.z);
                // scale and rotate the point
                let zr: f32 = pow( r,Power);
                theta = theta*Power;
                phi1 = phi1*Power;
                phi2 = phi2*Power;
                let st = sin(theta);
                let ct = cos(theta);
                // convert back to cartesian coordinates
                z = zr*vec4<f32>(st*cos(phi1), st*sin(phi1), ct*cos(phi2), ct*sin(phi2));
                z += pos;
            `, (pos) => {
            const MAXMANDELBROTDIST = 1.5;
            const MANDELBROTSTEPS = 32;
            const Power = 10;
            let z = pos.clone();
            let dr = 1.0;
            let r = 0.0;
            for (let i = 0; i < MANDELBROTSTEPS; i++) {
                r = z.norm();
                if (r > MAXMANDELBROTDIST) {
                    break;
                }
                // convert to hopf coordinates
                let theta = Math.acos(Math.hypot(z.z, z.w) / r);
                let phi1 = Math.atan2(z.y, z.x);
                let phi2 = Math.atan2(z.w, z.z);
                dr = Math.pow(r, Power - 1.0) * Power * dr + 1.0;
                // scale and rotate the point
                let zr = Math.pow(r, Power);
                theta = theta * Power;
                phi1 = phi1 * Power;
                phi2 = phi2 * Power;
                let st = Math.sin(theta);
                let ct = Math.cos(theta);
                // convert back to cartesian coordinates
                z.set(st * Math.cos(phi1), st * Math.sin(phi1), ct * Math.cos(phi2), ct * Math.sin(phi2));
                z.mulfs(zr).adds(pos);
            }
            return 0.5 * Math.log(r) * r / dr;
        });
        app.run();
    }
    mandelbulb_hopf.load = load;
})(mandelbulb_hopf || (mandelbulb_hopf = {}));
export var mandelbulb_spherical;
(function (mandelbulb_spherical) {
    async function load() {
        let app = await new MandelApp().load(`
                dr =  pow(r, Power - 1.0)*Power*dr + 1.0;
                // convert to spherical coordinates
                var theta1: f32 = acos(z.w/r);
                var theta2: f32 = acos(z.z/length(z.xyz));
                var phi: f32 = atan2(z.y,z.x);
                // scale and rotate the point
                let zr: f32 = pow( r,Power);
                theta1 = theta1*Power;
                theta2 = theta2*Power;
                phi = phi*Power;
                // convert back to cartesian coordinates
                
                let st1 = sin(theta1);
                let st2 = sin(theta2);
                z = zr*vec4<f32>(st1*st2*cos(phi), st1*st2*sin(phi), st1*cos(theta2), cos(theta1));
                z += pos;
            `, (pos) => {
            const DISTANCE = 3.0;
            const MAXMANDELBROTDIST = 1.5;
            const MANDELBROTSTEPS = 32;
            const Power = 10;
            let z = pos.clone();
            let dr = 1.0;
            let r = 0.0;
            for (let i = 0; i < MANDELBROTSTEPS; i++) {
                r = z.norm();
                if (r > MAXMANDELBROTDIST) {
                    break;
                }
                // convert to hopf coordinates
                let theta1 = Math.acos(z.w / r);
                let theta2 = Math.acos(z.z / z.xyz().norm());
                let phi = Math.atan2(z.y, z.x);
                dr = Math.pow(r, Power - 1.0) * Power * dr + 1.0;
                // scale and rotate the point
                let zr = Math.pow(r, Power);
                theta1 = theta1 * Power;
                theta2 = theta2 * Power;
                phi = phi * Power;
                let st1 = Math.sin(theta1);
                let st2 = Math.sin(theta2);
                // convert back to cartesian coordinates
                z.set(st1 * st2 * Math.cos(phi), st1 * st2 * Math.sin(phi), st1 * Math.cos(theta2), Math.cos(theta1));
                z.mulfs(zr).adds(pos);
            }
            return 0.5 * Math.log(r) * r / dr;
        });
        app.run();
    }
    mandelbulb_spherical.load = load;
})(mandelbulb_spherical || (mandelbulb_spherical = {}));
export var julia_quaternion;
(function (julia_quaternion) {
    async function load() {
        let _Q = new tesserxel.math.Quaternion();
        let app = await new MandelApp().load(`
                dr =  pow(r, Power - 1.0)*Power*dr;
                let q = z / r;
                let s = acos(q.x) * Power;
                let zr: f32 = pow( r,Power);
                z = zr*vec4<f32>(cos(s),normalize(q.yzw)*sin(s));
                z += vec4<f32>(-0.125,-0.256,0.847,0.0895);
            `, (pos) => {
            const DISTANCE = 3.0;
            const MAXMANDELBROTDIST = 1.5;
            const MANDELBROTSTEPS = 32;
            const Power = 2;
            const c = new tesserxel.math.Vec4(-0.125, -0.256, 0.847, 0.0895);
            let z = pos.clone();
            let dr = 1.0;
            let r = 0.0;
            for (let i = 0; i < MANDELBROTSTEPS; i++) {
                r = z.norm();
                if (r > MAXMANDELBROTDIST) {
                    break;
                }
                // convert to hopf coordinates
                let q = z.divf(r);
                z.copy(_Q.expset(_Q.copy(q).log().mulfs(Power)));
                dr = Math.pow(r, Power - 1.0) * Power * dr;
                // scale and rotate the point
                let zr = Math.pow(r, Power);
                z.mulfs(zr).adds(c);
            }
            return 0.5 * Math.log(r) * r / dr;
        });
        app.run();
    }
    julia_quaternion.load = load;
})(julia_quaternion || (julia_quaternion = {}));
// }
//# sourceMappingURL=mandelbulb.js.map