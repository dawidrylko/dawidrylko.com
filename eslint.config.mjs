import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default tseslint.config(
  {
    ignores: ['.cache/**/*', 'content/**/*', 'helpers/**/venv/**/*', 'node_modules/**/*', 'public/**/*'],
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  jsxA11y.flatConfigs.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: {
        // gatsby-browser/ssr live at the repo root and are intentionally kept out of
        // tsconfig (their CSS/font side-effect imports have no type declarations); the
        // default project gives them type information for type-aware linting.
        projectService: {
          allowDefaultProject: ['gatsby-browser.tsx', 'gatsby-ssr.tsx'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    // Config files run in Node and carry no type-aware program; disable type-checked rules for them.
    files: ['**/*.{js,mjs,cjs}'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
);
