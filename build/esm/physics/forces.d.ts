import { Bivec } from "../math/algebra/bivec.js";
import { Vec4 } from "../math/algebra/vec4.js";
import { World } from "./engine.js";
import { Rigid } from "./rigid.js";
export interface ForceAccumulatorConstructor {
    new (): ForceAccumulator;
}
export declare abstract class ForceAccumulator {
    abstract run(world: World, dt: number): void;
    private _biv1;
    private _biv2;
    private readonly _bivec0;
    getState(world: World): void;
}
export declare namespace force_accumulator {
    class Euler2 extends ForceAccumulator {
        private _bivec;
        private _rotor;
        run(world: World, dt: number): void;
    }
    class Predict3 extends ForceAccumulator {
        private _bivec1;
        private _bivec2;
        private _rotor;
        private _vec;
        run(world: World, dt: number): void;
    }
    class RK4 extends ForceAccumulator {
        private _bivec1;
        private _rotor;
        run(world: World, dt: number): void;
    }
}
export declare abstract class Force {
    abstract apply(time: number): void;
}
/** apply a spring force between object a and b
 *  pointA and pointB are in local coordinates,
 *  refering connect point of spring's two ends.
 *  b can be null for attaching spring to a fixed point in the world.
 *  f = k dx - damp * dv */
export declare class Spring extends Force {
    a: Rigid;
    pointA: Vec4;
    b: Rigid | null;
    pointB: Vec4;
    k: number;
    damp: number;
    length: number;
    private _vec4f;
    private _vec4a;
    private _vec4b;
    private _bivec;
    constructor(a: Rigid, b: Rigid | null, pointA: Vec4, pointB: Vec4, k: number, length?: number, damp?: number);
    apply(time: number): void;
}
/** apply a spring torque between object a and b
 *  planeA and planeB are in local coordinates, must be simple and normalised,
 *  b can be null for attaching spring to a fixed plane in the world.
 *  torque = k (planeA x planeB) - damp * dw */
export declare class TorqueSpring extends Force {
    a: Rigid;
    planeA: Bivec;
    b: Rigid | null;
    planeB: Bivec;
    k: number;
    damp: number;
    length: number;
    private _bivf;
    private _biva;
    private _bivb;
    private _bivec;
    constructor(a: Rigid, b: Rigid | null, planeA: Bivec, planeB: Bivec, k: number, damp?: number);
    apply(time: number): void;
}
export declare class Damping extends Force {
    objects: Rigid[];
    linearFactor: number;
    angularFactor: Bivec;
    private _bivec;
    apply(time: number): void;
    constructor(linearFactor: number, angularFactor: number | Bivec);
    add(...objects: Rigid[]): void;
}
export type ElectricCharge = {
    rigid: Rigid | null;
    position: Vec4;
    worldPos?: Vec4;
    charge: number;
};
export type ElectricDipole = {
    rigid: Rigid | null;
    position: Vec4;
    worldPos?: Vec4;
    moment: Vec4;
    worldMoment?: Vec4;
};
export type MagneticDipole = {
    rigid: Rigid | null;
    position: Vec4;
    worldPos?: Vec4;
    moment: Bivec;
    worldMoment?: Bivec;
};
export type CurrentElement = {
    rigid: Rigid | null;
    position: Vec4;
    worldPos?: Vec4;
    current: Vec4;
};
export type CurrentCircuit = {
    rigid: Rigid | null;
    position: Vec4;
    worldPos?: Vec4;
    current: Vec4;
    radius: number;
};
export declare class MaxWell extends Force {
    electricCharge: ElectricCharge[];
    electricDipole: ElectricDipole[];
    magneticDipole: MagneticDipole[];
    currentElement: CurrentElement[];
    currentCircuit: CurrentCircuit[];
    permittivity: number;
    permeability: number;
    constantElectricField: Vec4;
    /** magnetic field direction is defined by positive charge's velocity wedge it's lorentz force */
    constantMagneticField: Bivec;
    private _vecE;
    private _vecdE;
    private _vecB;
    private _vecdB;
    private _vecP;
    addElectricCharge(s: ElectricCharge): void;
    addElectricDipole(s: ElectricDipole): void;
    addMagneticDipole(s: MagneticDipole): void;
    getEAt(p: Vec4, dE: boolean, ignore: Rigid | Vec4 | undefined): Vec4;
    getBAt(p: Vec4, dB: boolean, ignore: Rigid | Vec4 | undefined): Bivec;
    apply(time: number): void;
    private addEOfElectricCharge;
    private addBOfMagneticDipole;
    private addEOfElectricDipole;
}
export declare class Gravity extends Force {
    _vecG: Vec4;
    rigids: Rigid[];
    lawIndex: number;
    gravitonMass: number;
    constructor(lawIndex?: number, gravitonMass?: number);
    gain: number;
    add(s: Rigid): void;
    getGAt(p: Vec4, ignore: Rigid | Vec4 | undefined): Vec4;
    apply(time: number): void;
    data: number[];
    private addGOfMass;
}
