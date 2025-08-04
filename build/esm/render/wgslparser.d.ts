export declare namespace wgslreflect {
    export type ReflectAttribute = {
        name: string;
        value?: string;
    };
    export type ReflectType = {
        name: string;
        attributes: Array<ReflectAttribute>;
        format?: ReflectType;
        count?: string;
    };
    export type ReflectArg = {
        name: string;
        type: ReflectType;
        attributes: Array<ReflectAttribute>;
        _type: "arg";
    };
    export type ReflectMember = {
        name: string;
        type: ReflectType;
        attributes: Array<ReflectAttribute>;
        _type: "member";
    };
    export type ReflectFunction = {
        args: Array<ReflectArg>;
        attributes: Array<ReflectAttribute>;
        name: string;
        return: ReflectType;
        _type: "function";
    };
    export type ReflectStruct = {
        name: string;
        members: Array<ReflectMember>;
        attributes: Array<ReflectAttribute>;
        _type: "struct";
    };
    /** expectedInput:
     *  {
     *      "location(0)": "_attribute0",
     *      ...
     *  }
     *  input: set{ "location(0)", ...}
     *  expectedOutput:
     *  Array{"builtin(position)", "location(0)", ...}
     *  output: {
     *      "builtin(position)": "_output_of_fn.pos",
     *      ...
     *  }
     * */
    export function parseTypeName(type: ReflectType): any;
    export function parseAttr(attrs: Array<ReflectAttribute>): string;
    export function getFnInputAndOutput(reflect: WgslReflect, fn: ReflectFunction, expectInput: {
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
    /**
     * @author Brendan Duncan / https://github.com/brendan-duncan
     */
    class AST {
        constructor(type: any, options: any);
    }
    /**
     * @author Brendan Duncan / https://github.com/brendan-duncan
     */
    export class WgslReflect {
        functions: Array<ReflectFunction>;
        structs: Array<ReflectStruct>;
        constructor(code: string);
        initialize(code: any): void;
        isTextureVar(node: any): boolean;
        isSamplerVar(node: any): boolean;
        isUniformVar(node: any): boolean;
        isStorageVar(node: any): boolean;
        _getInputs(args: any, inputs: any): any;
        _getInputInfo(node: any): {
            name: any;
            type: any;
            input: any;
            locationType: any;
            location: any;
        };
        _parseInt(s: any): any;
        getAlias(name: any): any;
        getStruct(name: any): AST;
        getAttribute(node: any, name: any): any;
        getBindGroups(): any[];
        getStorageBufferInfo(node: any): {
            name: any;
            type: any;
            group: any;
            binding: any;
        };
        getUniformBufferInfo(node: any): {
            name: any;
            type: string;
            align: number;
            size: number;
            members: any[];
            group: any;
            binding: any;
        };
        getTypeInfo(type: any): {
            align: number;
            size: number;
        };
        _roundUp(k: any, n: any): number;
    }
    export {};
}
