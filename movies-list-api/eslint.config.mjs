import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/', 'coverage/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: globals.node },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['**/__tests__/**'],
    languageOptions: { globals: globals.jest },
  },
  {
    files: ['*.cjs'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
);
