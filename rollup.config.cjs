const {nodeResolve} = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const json = require('@rollup/plugin-json');
const terser = require('@rollup/plugin-terser');
const typescript = require('@rollup/plugin-typescript');
const pkg = require('./package.json');

const banner = '/*! ' + pkg.name + ' v' + pkg.version + ' */';

module.exports = [
  {
    input: 'src/index.ts',
    output: [{file: pkg.module, format: 'es', name: pkg.name, banner}],
    plugins: [
      json({compact: true, preferConst: true}),
      typescript(),
      nodeResolve(),
      commonjs(),
    ],
    external: [
      '@hebcal/core',
      '@hebcal/hdate',
      /@hebcal\/leyning/,
      '@hebcal/triennial',
    ],
  },
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/bundle.js',
        format: 'iife',
        name: 'hebcal__rest_api',
        globals: {
          '@hebcal/core': 'hebcal',
          '@hebcal/leyning': 'hebcal__leyning',
          '@hebcal/triennial': 'hebcal__triennial',
        },
        indent: false,
        banner,
      },
      {
        file: 'dist/bundle.min.js',
        format: 'iife',
        name: 'hebcal__rest_api',
        globals: {
          '@hebcal/core': 'hebcal',
          '@hebcal/leyning': 'hebcal__leyning',
          '@hebcal/triennial': 'hebcal__triennial',
        },
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
    external: ['@hebcal/core', '@hebcal/leyning', '@hebcal/triennial'],
  },
  {
    input: 'src/fullcalendar.ts',
    output: [
      {
        file: 'dist/fullcalendar.js',
        format: 'iife',
        name: 'hebcalFullCalendar',
        globals: {
          '@hebcal/core': 'hebcal',
          '@hebcal/leyning': 'hebcal__leyning',
        },
        indent: false,
        banner,
      },
      {
        file: 'dist/fullcalendar.min.js',
        format: 'iife',
        name: 'hebcalFullCalendar',
        globals: {
          '@hebcal/core': 'hebcal',
          '@hebcal/leyning': 'hebcal__leyning',
        },
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
    external: ['@hebcal/core', '@hebcal/leyning'],
  },
];
