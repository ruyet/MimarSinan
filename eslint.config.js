import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'images-src'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { languageOptions: { globals: globals.browser } },
  { files: ['scripts/**', '*.config.*'], languageOptions: { globals: globals.node } },
  prettier,
);
