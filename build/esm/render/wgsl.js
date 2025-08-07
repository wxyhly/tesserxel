export { ResourceType, TypeInfo, WgslReflect } from '../node_modules/wgsl_reflect/wgsl_reflect.module.js';

function parseTypeName(type) {
    return type.name + (type.format ? `<${parseTypeName(type.format)}${type.count ? "," + type.count : ""}>` : "");
}
function parseAttr(attrs) {
    // todo: match just one attribute
    return attrs ? Array.from(new Set(attrs.map(a => a.name + (a.value ? `(${a.value})` : "")))).join(" ") : "";
}
function getFnInputAndOutput(reflect, fn, expectInput, expectOutput) {
    let input = new Set();
    let output = {
        "return": "_ouput_of_" + fn.node.name
    };
    let call = `
                let _ouput_of_${fn.node.name} = ${fn.node.name}(${fn.node.args.map(a => getInput(a)).join(", ")});
                `;
    getOutput(fn.node.returnType, "_ouput_of_" + fn.node.name);
    return { input, call, output: output };
    function getInput(arg) {
        let attr = parseAttr(arg.attributes ? arg.attributes.concat(arg.type.attributes ?? []) : arg.type.attributes);
        let varName = expectInput[attr];
        if (varName) {
            input.add(attr);
            return varName;
        }
        else {
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
    function getOutput(type, prefix) {
        let varName = parseAttr(type.attributes);
        if (expectOutput.includes(varName)) {
            output[varName] = {
                expr: prefix,
                type: parseTypeName(type)
            };
            return;
        }
        else {
            let struct = reflect.structs.filter(s => s.name === type.name)[0];
            if (!struct) {
                return;
            }
            for (let m of struct.members) {
                if (m.attributes) {
                    m.type.attributes = m.type.attributes ? m.type.attributes : m.attributes;
                }
                getOutput(m.type, prefix + "." + m.name);
            }
        }
    }
}

export { getFnInputAndOutput, parseAttr, parseTypeName };
//# sourceMappingURL=wgsl.js.map
