const {nodeResolve} = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const json = require('@rollup/plugin-json');
const terser = require('@rollup/plugin-terser');
const typescript = require('@rollup/plugin-typescript');
const pkg = require('./package.json');
const {defineConfig} = require('rollup');

const banner = '/*! ' + pkg.name + ' v' + pkg.version + ' */';

const iifeGlobals = {
  '@hebcal/core': 'hebcal',
  '@hebcal/core/dist/esm/locale': 'hebcal',
  '@hebcal/core/dist/esm/holidays': 'hebcal',
  '@hebcal/core/dist/esm/sedra': 'hebcal',
  '@hebcal/core/dist/esm/event': 'hebcal',
  '@hebcal/core/dist/esm/ParshaEvent': 'hebcal',
  '@hebcal/core/dist/esm/reformatTimeStr': 'hebcal',
  '@hebcal/core/dist/esm/pkgVersion': 'hebcal',
  '@hebcal/core/dist/esm/zmanim': 'hebcal',
  '@hebcal/hdate': 'hebcal',
  '@hebcal/leyning': 'hebcal__leyning',
  '@hebcal/leyning/dist/esm/leyning': 'hebcal__leyning',
  '@hebcal/leyning/dist/esm/csv': 'hebcal__leyning',
  '@hebcal/leyning/dist/esm/summary': 'hebcal__leyning',
  '@hebcal/leyning/dist/esm/clone': 'hebcal__leyning',
  '@hebcal/leyning/dist/esm/getLeyningKeyForEvent': 'hebcal__leyning',
  '@hebcal/leyning/dist/esm/specialReadings': 'hebcal__leyning',
  '@hebcal/leyning/dist/esm/common': 'hebcal__leyning',
  '@hebcal/leyning/dist/esm/getLeyningForHoliday': 'hebcal__leyning',
  '@hebcal/triennial': 'hebcal__triennial',
};

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
      },
    ],
    plugins: [
      json({compact: true, preferConst: true}),
      typescript({...tsOptions, outDir: 'dist/esm'}),
      nodeResolve(),
      commonjs(),
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
      typescript(),
      nodeResolve(),
      commonjs(),
    ],
    external: [/@hebcal/],
  },
  {
    input: 'src/fullcalendar.ts',
    output: [
      {
        file: 'dist/fullcalendar.js',
        format: 'iife',
        name: 'hebcalFullCalendar',
        globals: iifeGlobals,
        indent: false,
        banner,
      },
      {
        file: 'dist/fullcalendar.min.js',
        format: 'iife',
        name: 'hebcalFullCalendar',
        globals: iifeGlobals,
        plugins: [terser()],
        banner,
      },
    ],
    plugins: [
      json({compact: true, preferConst: true}),
      typescript(),
      nodeResolve(),
      commonjs(),
    ],
    external: [/@hebcal/],
  },
]);
