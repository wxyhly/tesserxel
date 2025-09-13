import typescript from 'rollup-plugin-typescript2';
import multiInput from 'rollup-plugin-multi-input';
import resolve from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy';
import alias from "@rollup/plugin-alias";
import path from "path";
import { rmSync } from 'fs';
import dts from 'rollup-plugin-dts';
export default [
  {
    input: "./src/tesserxel.ts",
    output: {
      file: './build/tesserxel.js',
      "sourcemap": true, format: 'umd', name: "tesserxel"
    },
    plugins: [
      copy({
        targets: [{
          src: 'node_modules/wgsl_reflect/wgsl_reflect.module.js',
          dest: 'vendor', rename: 'wgsl_reflect.module.js'
        }, {
          src: 'node_modules/wgsl_reflect/wgsl_reflect.module.js.map',
          dest: 'vendor', rename: 'wgsl_reflect.module.js.map'
        }]
      }),
      resolve(),
      typescript({
        tsconfig: "tsconfig.json",
        tsconfigOverride: {
          exclude: [],
          compilerOptions: {
            declaration: false,
          },
        },
        // useTsconfigDeclarationDir: true,
      }),
    ]
  },
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
      alias({
        entries: [
          {
            find: "wgsl_reflect",
            replacement: path.resolve("./vendor/wgsl_reflect.module.js")
          }
        ]
      }),
      multiInput(),
      typescript({
        tsconfig: 'tsconfig.json',
      }),
      {
        name: "after-build",
        writeBundle() {
          rmSync("./vendor", { recursive: true, force: true });
        }
      }
    ],
  },
  {
    input: "./build/esm/tesserxel.d.ts",
    output: [{ file: "build/tesserxel.d.ts", format: "es" }],
    plugins: [dts()],
  }
];