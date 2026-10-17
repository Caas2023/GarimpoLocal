import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import security from 'eslint-plugin-security';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Build/test artifacts
    'coverage/**',
    'playwright-report/**',
    'test-results/**',
    // Machine-formatted data catalogs
    'data/**',
    'drizzle/meta/**',
    'sitemap.xml',
  ]),

  // ─── Camada legada CommonJS (api/, lib/, test/, scripts/) ────────────────────
  // Estes diretórios usam `require()`/`module.exports` por serem módulos
  // executados diretamente pelo runtime Node/Vercel, fora do pipeline do Next.js.
  {
    files: ['api/**/*.js', 'lib/**/*.js', 'scripts/**/*.js', 'test/**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        require: 'readonly',
        module: 'writable',
        exports: 'writable',
        process: 'readonly',
        __dirname: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
      },
    },
    plugins: { security },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      // Regras ativas na camada legada
      'security/detect-non-literal-fs-filename': 'off',
      'security/detect-object-injection': 'warn',
      'security/detect-non-literal-regexp': 'off',
      'security/detect-eval-with-expression': 'error',
      'security/detect-child-process': 'error',
    },
  },

  // ─── Frontend (src/) — regras de segurança mais estritas ─────────────────────
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { security },
    rules: {
      'security/detect-object-injection': 'warn',
      'security/detect-non-literal-fs-filename': 'error',
      'security/detect-eval-with-expression': 'error',
      'security/detect-child-process': 'error',
    },
  },
]);

export default eslintConfig;
