const {nodeResolve} = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const babel = require('@rollup/plugin-babel');
const json = require('@rollup/plugin-json');
const terser = require('@rollup/plugin-terser');
const pkg = require('./package.json');

const banner = '/*! ' + pkg.name + ' v' + pkg.version + ' */';

module.exports = [
  {
    input: 'src/index.js',
    output: [
      {file: pkg.main, format: 'cjs', name: pkg.name, banner},
    ],
    plugins: [
      json({compact: true}),
      babel({
        babelHelpers: 'bundled',
        presets: [
          ['@babel/preset-env', {
            modules: false,
            targets: {
              node: '10.21.0',
            },
          }],
        ],
        exclude: ['node_modules/**'],
      }),
      nodeResolve(),
      commonjs(),
    ],
    external: ['@hebcal/core', '@hebcal/leyning', '@hebcal/triennial'],
  },
  {
    input: 'src/index.js',
    output: [
      {file: pkg.module, format: 'es', name: pkg.name, banner},
    ],
    plugins: [
      json({compact: true, preferConst: true}),
      babel({
        babelHelpers: 'bundled',
        presets: [
          ['@babel/preset-env', {
            modules: false,
            targets: {
              node: '12.22.0',
            },
          }],
        ],
        exclude: ['node_modules/**'],
      }),
      nodeResolve(),
      commonjs(),
    ],
    external: ['@hebcal/core', '@hebcal/leyning', '@hebcal/triennial'],
  },
  {
    input: 'src/index.js',
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
      json({compact: true}),
      babel({
        babelHelpers: 'bundled',
        presets: [
          ['@babel/preset-env', {
            modules: false,
            exclude: ['es.symbol.description', 'es.string.replace'],
            targets: {
              edge: '17',
              firefox: '60',
              chrome: '67',
              safari: '11.1',
            },
            useBuiltIns: 'usage',
            corejs: 3,
          }],
        ],
        exclude: ['node_modules/**'],
      }),
      nodeResolve(),
      commonjs(),
    ],
    external: ['@hebcal/core', '@hebcal/leyning', '@hebcal/triennial'],
  },
  {
    input: 'src/fullcalendar.js',
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
      json({compact: true}),
      babel({
        babelHelpers: 'bundled',
        presets: ['@babel/preset-env'],
        exclude: ['node_modules/**'],
      }),
      nodeResolve(),
      commonjs(),
    ],
    external: ['@hebcal/core', '@hebcal/leyning'],
  },
];
