import type { Linter } from 'eslint';

const config: Linter.Config[] = [
  {
    ignores: ['node_modules/**', 'dist/**', '.next/**', '*.js', '*.jsx'],
  },
  {
    rules: {
      'no-unused-vars': 'off',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'no-throw-literal': 'error',
      'prefer-promise-reject-errors': 'error',
    },
  },
];

export default config;
