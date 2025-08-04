export declare class Srand {
    _seed: number;
    constructor(seed: number);
    set(seed: number): void;
    /** return a random float in [0,1] */
    nextf(): number;
    /** return a random int of [0,n-1] if n is given, else range is same as int */
    nexti(n?: number): number;
}
export declare function generateUUID(): string;
