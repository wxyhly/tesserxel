import { ArgumentInfo, ArrayInfo, Attribute, MemberInfo, ResourceType, TypeInfo, WgslReflect } from "wgsl_reflect";

export { WgslReflect, ResourceType,TypeInfo };
export function parseTypeName(type: TypeInfo) {
    return type.name + ((type as ArrayInfo).format ? `<${parseTypeName((type as ArrayInfo).format)}${(type as ArrayInfo).count ? "," + (type as ArrayInfo).count : ""}>` : "");
}
export function parseAttr(attrs: Array<Attribute>) {
    // todo: match just one attribute
    return attrs ? Array.from(new Set(attrs.map(a => a.name + (a.value ? `(${a.value})` : "")))).join(" ") : "";
}
export function getFnInputAndOutput(
    reflect: WgslReflect, fn: ReturnType<WgslReflect["_functions"]["get"]>,
    expectInput: { [name: string]: string }, expectOutput: string[]
) {
    let input: Set<string> = new Set();
    let output: { [name: string]: string | { expr: string, type: string } } = {
        "return": "_ouput_of_" + fn.node.name
    };
    let call = `
                let _ouput_of_${fn.node.name} = ${fn.node.name}(${fn.node.args.map(a => getInput(a as any as ArgumentInfo)).join(", ")});
                `;
    getOutput(fn.node.returnType as any as TypeInfo, "_ouput_of_" + fn.node.name);
    return { input, call, output: output as { [name: string]: { expr: string, type: string } } };

    function getInput(arg: ArgumentInfo | MemberInfo) {
        let attr = parseAttr(arg.attributes ? arg.attributes.concat(arg.type.attributes ?? []) : arg.type.attributes);
        let varName = expectInput[attr];
        if (varName) {
            input.add(attr);
            return varName;
        } else {
            let struct = reflect.structs.filter(s => s.name === arg.type.name)[0];
            if (!struct) {
                console.error("invalid entry point function args");
            }
            let str = arg.type.name + "(";
            for (let m of struct.members) {
                str += getInput(m) + ",";
            }
            str += ")";
            return str;
        }
    }
    function getOutput(type: TypeInfo, prefix: string) {
        let varName = parseAttr(type.attributes);
        if (expectOutput.includes(varName)) {
            output[varName] = {
                expr: prefix,
                type: parseTypeName(type)
            }; return;
        } else {
            let struct = reflect.structs.filter(s => s.name === type.name)[0];
            if (!struct) { return; }
            for (let m of struct.members) {
                if (m.attributes) {
                    m.type.attributes = m.type.attributes ? m.type.attributes : m.attributes;
                }
                getOutput(m.type, prefix + "." + m.name);
            }
        }
    }
}