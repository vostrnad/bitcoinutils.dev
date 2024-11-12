import tsParser from '@typescript-eslint/parser'
import eslintConfigTypescript from '@vostrnad/eslint-config-typescript'
import eslintPluginSvelte from 'eslint-plugin-svelte'
import globals from 'globals'
import svelteParser from 'svelte-eslint-parser'

export default [
  ...eslintConfigTypescript,
  ...eslintPluginSvelte.configs['flat/recommended'],
  {
    ignores: [
      '**/.DS_Store',
      '**/node_modules',
      'build',
      'coverage',
      '.svelte-kit',
      'package',
      '**/.env',
      '**/.env.*',
      '!**/.env.example',
      '**/pnpm-lock.yaml',
      '**/package-lock.json',
      '**/yarn.lock',
      'eslint.config.js',
      'svelte.config.js',
    ],
  },
  {
    settings: {
      'import/internal-regex': '^\\$(app|lib)\\/',
    },
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: globals.browser,

      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: ['.svelte'],
      },
    },
  },
  {
    files: ['**/*.svelte'],

    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: tsParser,
      },
    },

    rules: {
      '@typescript-eslint/no-unsafe-argument': 0,
      'import/no-mutable-exports': 0,
      'unicorn/filename-case': 0,
    },
  },
]
