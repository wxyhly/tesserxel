import { Srand } from "./random.js";
export declare class Perlin3 {
    private _p;
    constructor(srand: Srand);
    value(x: number, y: number, z: number): number;
}
