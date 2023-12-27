/** @type { import("eslint").Linter.Config } */
module.exports = {
  root: true,
  extends: ['@vostrnad/eslint-config-typescript', 'plugin:svelte/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    sourceType: 'module',
    ecmaVersion: 2020,
    extraFileExtensions: ['.svelte'],
  },
  env: {
    browser: true,
    es2017: true,
    node: true,
  },
  overrides: [
    {
      files: ['*.svelte'],
      parser: 'svelte-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
      rules: {
        '@typescript-eslint/no-unsafe-argument': 0,
        'import/no-mutable-exports': 0,
        'unicorn/filename-case': 0,
      },
    },
  ],
}
