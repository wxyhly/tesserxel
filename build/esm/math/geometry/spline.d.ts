import { Obj4 } from "../algebra/affine.js";
import { Rotor } from "../algebra/rotor.js";
import { Vec4 } from "../algebra/vec4.js";
interface SplineData {
    points: Vec4[];
    rotors: Rotor[];
    curveLength: number[];
}
export declare class Spline {
    points: Vec4[];
    derives: Vec4[];
    constructor(points: Vec4[], derives: Vec4[]);
    generate(seg: number): SplineData;
    getValue(t: number): Vec4;
    getPositionAtLength(s: number, data: SplineData): Vec4;
    getObj4AtLength(s: number, data: SplineData): Obj4;
}
export {};
