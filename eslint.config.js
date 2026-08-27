import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  // 取代原 .eslintignore
  {
    ignores: ['lib/**', 'node_modules/**', '.local/**']
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['**/*.{ts,mts,cts,js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      eqeqeq: ['error', 'smart'],
      'no-var': 'error',
      'prefer-const': 'error',
      'linebreak-style': ['error', 'unix']
    }
  },

  // 放在最后，关掉与 prettier 冲突的格式类规则（原 indent/quotes/semi 由 prettier 接管）
  prettier
);
