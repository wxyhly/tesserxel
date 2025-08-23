import typescript from "rollup-plugin-typescript2";
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default [
  {
    input: "src/playground.ts",
    output: [{ file: "build/playground.js", format: "esm" }],
    plugins: [typescript(), nodeResolve()],
  },
  {
    input: "src/shadertoy.ts",
    output: [{ file: "build/shadertoy.js", format: "esm" }],
    plugins: [typescript(), nodeResolve()],
  },
];
