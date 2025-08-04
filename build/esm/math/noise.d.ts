import { Srand } from "./random";
export declare class Perlin3 {
    private _p;
    constructor(srand: Srand);
    value(x: number, y: number, z: number): number;
}
