import { Rotor } from "../algebra/rotor";
import { Vec4 } from "../algebra/vec4";

export class Spline {
    points: Vec4[];
    derives: Vec4[];
    constructor(points: Vec4[], derives: Vec4[]) {
        if (points.length !== derives.length) console.error("Spline: points and derives lengths don't agree")
        this.points = points;
        this.derives = derives;
    }
    generate(seg: number): { points: Vec4[], rotors: Rotor[], curveLength: number[] } {
        let points: Vec4[] = [];
        let prevPoint: Vec4 | undefined;
        let prevDir = Vec4.w;
        let prevRotor = new Rotor();
        let rotors: Rotor[] = [];
        let curveLength: number[] = [];
        let curveLenSum = 0;
        for (let i = 0; i < this.points.length - 1; i++) {
            let p0 = this.points[i];
            let p1 = this.points[i + 1];
            let d0 = this.derives[i];
            let d1 = this.derives[i + 1];
            let p01 = p0.sub(p1);
            let A = p01.mulf(2).adds(d0).adds(d1);
            let B = d0.mulf(-2).subs(d1).subs(p01.mulfs(3));
            let seginv = 1 / seg;
            for (let j = 0; j <= seg; j++) {
                if (j === seg && i !== this.points.length - 2) break;
                let t = j * seginv;
                let curPoint = new Vec4(
                    p0.x + t * (d0.x + t * (B.x + t * A.x)),
                    p0.y + t * (d0.y + t * (B.y + t * A.y)),
                    p0.z + t * (d0.z + t * (B.z + t * A.z)),
                    p0.w + t * (d0.w + t * (B.w + t * A.w))
                );
                if (prevPoint) {
                    let curDir = curPoint.sub(prevPoint);
                    let dirLen = curDir.norm();
                    curDir.divfs(dirLen);
                    prevRotor.mulsl(Rotor.lookAt(prevDir, curDir));
                    // console.log(curDir.dot(Vec4.w.rotate(prevRotor)));
                    prevDir = curDir;
                    rotors.push(prevRotor.clone());
                    curveLength.push(curveLenSum);
                    curveLenSum += dirLen;
                }
                prevPoint = curPoint;
                points.push(curPoint);
            }
        }
        let lastDerive = this.derives[this.derives.length - 1];
        if (
            points[0].x == prevPoint!.x && points[0].y == prevPoint!.y &&
            points[0].z == prevPoint!.z && points[0].w == prevPoint!.w &&
            this.derives[0].x == lastDerive.x && this.derives[0].y == lastDerive.y &&
            this.derives[0].z == lastDerive.z && this.derives[0].w == lastDerive.w
        ) {
            rotors.push(rotors[0]);
        } else {
            rotors.push(prevRotor);
        }
        curveLength.push(curveLenSum);
        return { points, rotors, curveLength }
    }
    getValue(t: number) {
        let i = Math.floor(t);
        t -= i;
        // i %= this.points.length - 1;
        // if (i < 0) i += this.points.length - 1
        let p0 = this.points[i];
        let p1 = this.points[i + 1];
        let d0 = this.derives[i];
        let d1 = this.derives[i + 1];
        let p01 = p0.sub(p1);
        let A = p01.mulfs(2).adds(d0).adds(d1);
        let B = d0.mulf(-2).subs(d1).subs(p01.mulfs(1.5));
        let x = p0.x + t * (d0.x + t * (B.x + t * A.x));
        let y = p0.y + t * (d0.y + t * (B.y + t * A.y));
        let z = p0.z + t * (d0.z + t * (B.z + t * A.z));
        let w = p0.w + t * (d0.w + t * (B.w + t * A.w));
        return new Vec4(x, y, z, w);
    }
}