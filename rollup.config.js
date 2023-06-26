import typescript from 'rollup-plugin-typescript2';
import dts from 'rollup-plugin-dts';
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
}]