import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import pkg from './package.json';
import {terser} from 'rollup-plugin-terser';

export default [
  {
    input: 'src/index.js',
    output: [
      {file: pkg.main, format: 'cjs', name: pkg.name},
      {
        file: 'dist/bundle.min.js',
        format: 'umd',
        name: 'hebcal__icalendar',
        globals: {
          '@hebcal/core': 'hebcal__core',
          '@hebcal/leyning': 'hebcal__leyning',
        },
        plugins: [terser()],
      },
    ],
    plugins: [
      babel({
        babelHelpers: 'bundled',
        exclude: ['node_modules/**'],
      }),
      resolve(),
      commonjs(),
    ],
    external: ['@hebcal/core', '@hebcal/leyning'],
  },
];
