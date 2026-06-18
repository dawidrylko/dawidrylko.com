import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import globals from 'globals';

export default [
  // content/ holds authored posts (and their code samples); helpers venv is Python.
  { ignores: ['dist/**', '.astro/**', 'node_modules/**', 'content/**', 'helpers/**/venv/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
];
