const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const prettierConfig = require('eslint-config-prettier');
const pluginPrettier = require('eslint-plugin-prettier');
const globals = require('globals');
const defineConfig = require('eslint/config').defineConfig;

module.exports = defineConfig([
  {
    ignores: [
      'build/',
      'test/',
      'docs/',
      'dist/',
      'src/*.po.ts',
      'src/*.json.ts',
    ],
  },
  eslint.configs.recommended,
  prettierConfig,
  {
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      'prettier/prettier': 'error',
      'block-scoped-var': 'error',
      eqeqeq: 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-arrow-callback': 'error',
      'no-restricted-properties': [
        'error',
        {
          object: 'describe',
          property: 'only',
        },
        {
          object: 'it',
          property: 'only',
        },
      ],
    },
  },
  {
    files: ['**/.prettierrc.js', '**/eslint.config.js', '**/eslint.config.cjs', '**/eslint.ignores.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: globals.node,
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    extends: [tseslint.configs.recommended],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    rules: {
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
]);
