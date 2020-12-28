import {nodeResolve} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import pkg from './package.json';
import {terser} from 'rollup-plugin-terser';

export default [
  {
    input: 'src/index.js',
    output: {
      file: pkg.main, format: 'cjs', name: pkg.name,
      banner: '/*! ' + pkg.name + ' v' + pkg.version + ' */',
    },
    plugins: [
      json({compact: true}),
      babel({
        babelHelpers: 'bundled',
        presets: [
          ['@babel/env', {
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
    external: ['@hebcal/core', '@hebcal/leyning'],
  },
  {
    input: 'src/index.js',
    output: {
      file: pkg.module, format: 'es', name: pkg.name,
      banner: '/*! ' + pkg.name + ' v' + pkg.version + ' */',
    },
    external: ['@hebcal/core', '@hebcal/leyning'],
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
  },
  {
    input: 'src/index.js',
    output: [
      {
        file: pkg.browser,
        format: 'iife',
        name: 'hebcal__rest_api',
        globals: {
          '@hebcal/core': 'hebcal',
          '@hebcal/leyning': 'hebcal__leyning',
        },
        indent: false,
        banner: '/*! ' + pkg.name + ' v' + pkg.version + ' */',
      },
      {
        file: 'dist/bundle.min.js',
        format: 'iife',
        name: 'hebcal__rest_api',
        globals: {
          '@hebcal/core': 'hebcal',
          '@hebcal/leyning': 'hebcal__leyning',
        },
        plugins: [terser()],
        banner: '/*! ' + pkg.name + ' v' + pkg.version + ' */',
      },
    ],
    plugins: [
      json({compact: true}),
      babel({
        babelHelpers: 'bundled',
        presets: [
          ['@babel/env', {
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
    external: ['@hebcal/core', '@hebcal/leyning'],
  },
];
