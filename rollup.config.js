import typescript from 'rollup-plugin-typescript2';
import dts from 'rollup-plugin-dts';
import copy from 'rollup-plugin-copy';
import { folderInput } from 'rollup-plugin-folder-input'
export default [{
    input: "./src/tesserxel.ts",
    output: {
        file: './build/tesserxel.js',
        "sourcemap": true,
    },
    plugins: [typescript({
        tsconfig: "tsconfig.json",
        useTsconfigDeclarationDir: true
    }),
    ]
},
{
    input: "./build/dts/tesserxel.d.ts",
    output: [{ file: "build/tesserxel.d.ts", format: "es" }],
    plugins: [dts()],
},
{
    input: ["./examples/src/*.ts"],
    output: {
        dir: "./docs/js",
        sourcemap: true,
    },
    external: ["../../build/tesserxel.js"],
    plugins: [
        folderInput(),
        typescript({
            tsconfig: "./examples/src/tsconfig.json"
        }),
        copy({
            targets: [
                { src: './examples/*.html', dest: 'docs' },
                { src: './examples/*.js', dest: 'docs' },
                { src: './examples/resource', dest: 'docs' },
            ]
        })
    ]
}]