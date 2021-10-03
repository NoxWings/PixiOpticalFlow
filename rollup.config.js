import commonjs from "@rollup/plugin-commonjs";
import glslify from "rollup-plugin-glslify";
import glslifyImport from "glslify-import";
import livereload from "rollup-plugin-livereload";
import resolve from "@rollup/plugin-node-resolve";
import serve from "rollup-plugin-serve";
import replace from "@rollup/plugin-replace";

import pkg from "./package.json";

const DEV = !!process.env.ROLLUP_WATCH;
const envStr = DEV ? "development" : "production";

export default {
    input: "src/index.js",
    output: [{
        name: pkg.name,
        file: pkg.main,
        format: "iife",
        sourcemap: true
    }],
    plugins: [
        ...process.env.BUILD === 'production' ? [alias({
            entries: [{
                find: /^(@pixi\/([^\/]+))$/,
                replacement: '$1/dist/esm/$2.min.js',
            }, {
                find: 'pixi.js',
                replacement: 'pixi.js/dist/esm/pixi.min.js',
            }]
        })] : [],
        resolve({ preferBuiltins: false }),
        commonjs(),
        glslify({
            transform: [glslifyImport]
        }),
        DEV && serve({
            contentBase: ["dist", "static"],
            host: "0.0.0.0",
            port: 8080
        }),
        DEV && livereload({
            watch: ["dist", "static"]
        })
    ]
};
