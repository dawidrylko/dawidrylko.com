import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';

export default [
  // content/ holds authored posts, their code samples, and per-post chart-source/ tooling.
  { ignores: ['dist/**', '.astro/**', 'node_modules/**', 'content/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  // Accessibility linting for the React islands (.tsx).
  { ...jsxA11y.flatConfigs.recommended, files: ['**/*.{jsx,tsx}'] },
  // Prefer `import type` so type-only imports are erased and never bundled.
  {
    files: ['**/*.{ts,tsx}'],
    rules: { '@typescript-eslint/consistent-type-imports': 'error' },
  },
  // Flag stray debug logging in shipped site source; warn/error are allowed.
  // CLI helpers and the interactive memoization demo log on purpose.
  { files: ['src/**/*.{ts,tsx,astro}'], rules: { 'no-console': ['warn', { allow: ['warn', 'error'] }] } },
  { files: ['src/demo/**'], rules: { 'no-console': 'off' } },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
];
