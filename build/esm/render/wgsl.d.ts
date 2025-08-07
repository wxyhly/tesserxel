import { Attribute, ResourceType, TypeInfo, WgslReflect } from "wgsl_reflect";
export { WgslReflect, ResourceType, TypeInfo };
export declare function parseTypeName(type: TypeInfo): any;
export declare function parseAttr(attrs: Array<Attribute>): string;
export declare function getFnInputAndOutput(reflect: WgslReflect, fn: ReturnType<WgslReflect["_functions"]["get"]>, expectInput: {
    [name: string]: string;
}, expectOutput: string[]): {
    input: Set<string>;
    call: string;
    output: {
        [name: string]: {
            expr: string;
            type: string;
        };
    };
};
