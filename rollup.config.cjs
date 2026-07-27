const {nodeResolve} = require('@rollup/plugin-node-resolve');
const json = require('@rollup/plugin-json');
const terser = require('@rollup/plugin-terser');
const typescript = require('@rollup/plugin-typescript');
const pkg = require('./package.json');
const {defineConfig} = require('rollup');

const banner = '/*! ' + pkg.name + ' v' + pkg.version + ' */';

// All @hebcal/leyning submodules are exposed under the hebcal__leyning global;
// everything else (@hebcal/core/*, @hebcal/hdate) lives under the hebcal global.
const iifeGlobals = id =>
  id.includes('@hebcal/leyning') ? 'hebcal__leyning' : 'hebcal';

const tsOptions = {rootDir: './src'};
module.exports = defineConfig([
  {
    input: 'src/index.ts',
    output: [
      {
        dir: 'dist/esm',
        format: 'es',
        preserveModules: true,
        preserveModulesRoot: 'src',
        name: pkg.name,
        banner,
        sourcemap: true,
      },
    ],
    plugins: [
      json({compact: true, preferConst: true}),
      typescript({...tsOptions, outDir: 'dist/esm', sourceMap: true}),
    ],
    external: [/@hebcal/],
  },
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/bundle.js',
        format: 'iife',
        name: 'hebcal__rest_api',
        globals: iifeGlobals,
        indent: false,
        banner,
      },
      {
        file: 'dist/bundle.min.js',
        format: 'iife',
        name: 'hebcal__rest_api',
        globals: iifeGlobals,
        plugins: [terser()],
        banner,
      },
    ],
    plugins: [
      json({compact: true, preferConst: true}),
      typescript({...tsOptions, declaration: false}),
      nodeResolve(),
    ],
    external: [/@hebcal/],
  },
]);
