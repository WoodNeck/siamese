import typescript from "@rollup/plugin-typescript";

export default {
  input: "./src/index.ts",
  output: {
    file: "./bin/siamese.js",
    format: "cjs"
  },
  plugins: [typescript()]
};
