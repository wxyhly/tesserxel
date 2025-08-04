import { Vec4 } from "../math/algebra/vec4";
declare type Convex = Vec4[];
export declare function gjkOutDistance(convex: Convex, initSimplex?: Vec4[]): {
    simplex?: Vec4[];
    reverseOrder?: boolean;
    normals?: Vec4[];
    normal?: Vec4;
    distance?: number;
};
/** test convex1 - convex2 to origin */
export declare function gjkDiffTest(convex1: Convex, convex2: Convex, initSimplex1?: Vec4[], initSimplex2?: Vec4[]): {
    simplex1?: Vec4[];
    simplex2?: Vec4[];
    normals?: Vec4[];
    reverseOrder?: boolean;
};
/** expanding polytope algorithm */
export declare function epa(convex: Convex, initCondition: {
    simplex: Vec4[];
    reverseOrder: boolean;
    normals: Vec4[];
}): {
    simplex: Vec4[];
    distance: number;
    normal: Vec4;
} | {
    simplex?: undefined;
    distance?: undefined;
    normal?: undefined;
};
/** expanding polytope algorithm for minkovsky difference */
export declare function epaDiff(convex1: Convex, convex2: Convex, initCondition: {
    simplex1: Vec4[];
    simplex2: Vec4[];
    reverseOrder: boolean;
    normals: Vec4[];
}): {
    simplex1: Vec4[];
    simplex2: Vec4[];
    distance: number;
    normal: Vec4;
};
export {};
