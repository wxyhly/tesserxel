import typescript from 'rollup-plugin-typescript2';
import multiInput from 'rollup-plugin-multi-input';
import resolve from '@rollup/plugin-node-resolve';
import dts from 'rollup-plugin-dts';
export default [
  {
    input: 'src/**/*.ts',
    output: {
      dir: 'build/esm',
      format: 'esm',
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: 'src',
    },
    plugins: [
      resolve(),
      multiInput(),
      typescript({
        tsconfig: 'tsconfig.json',
      }),
    ],
  },
  {
    input: "./src/tesserxel.ts",
    output: {
      file: './build/tesserxel.js',
      "sourcemap": true,
      format: 'umd',
      name: "tesserxel"
    },
    plugins: [
      resolve(),
      typescript({
        tsconfig: "tsconfig.json",
        tsconfigOverride: {
          exclude: [],
          compilerOptions: {
            declaration: false, // 已由单独的配置生成.d.ts
          },
        },
        // useTsconfigDeclarationDir: true,
      }),
    ]
  }
]