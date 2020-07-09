import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import pkg from './package.json';
import {terser} from 'rollup-plugin-terser';

export default [
  {
    input: 'src/index.js',
    output: {file: pkg.main, format: 'cjs', name: pkg.name},
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
      resolve(),
      commonjs(),
    ],
    external: ['@hebcal/core', '@hebcal/leyning'],
  },
  {
    input: 'src/index.js',
    output: [
      {
        file: 'dist/bundle.js',
        format: 'umd',
        name: 'hebcal__rest_api',
        globals: {
          '@hebcal/core': 'hebcal__core',
          '@hebcal/leyning': 'hebcal__leyning',
        },
        indent: false,
      },
      {
        file: 'dist/bundle.min.js',
        format: 'umd',
        name: 'hebcal__rest_api',
        globals: {
          '@hebcal/core': 'hebcal__core',
          '@hebcal/leyning': 'hebcal__leyning',
        },
        plugins: [terser()],
      },
    ],
    plugins: [
      json({compact: true}),
      babel({
        babelHelpers: 'bundled',
        presets: [
          ['@babel/env', {
            modules: false,
            debug: true,
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
      resolve(),
      commonjs(),
    ],
    external: ['@hebcal/core', '@hebcal/leyning'],
  },
];
