type Relation = number[];
export declare class CosetTable {
    length: number;
    private p;
    cosets: number[][];
    private generatorMap;
    private generatorInvMap;
    private letters;
    private genInvMap;
    private relations;
    private subsets;
    private parseWord;
    constructor(generator: string, relation: string[], subset: string[]);
    private define;
    private coincidence;
    private merge;
    private findRep;
    private scanAndFill;
    enumerate(): this;
    private compress;
    private standardize;
    private swapCoset;
    getRepresentatives(): Relation[];
    findCoset(w: Relation): number;
}
export {};
