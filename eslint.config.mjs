/* DARLEK CAAN RAG SYNTHESIS - Autonomous Generation G-28 [2026-09-20T05:14:50.132Z] */
import tsParser from "@typescript-eslint/parser";

/**
 * Paths excluded from ESLint analysis.
 */
const IGNORED_PATHS = [
  ".next/**",
  ".next_dev/**",
  "node_modules/**",
  "out/**",
  "build/**",
  "dist/**",
  "*.js",
  "*.mjs",
];

/**
 * TypeScript-specific rule overrides.
 */
const typescriptRules = {
  "@typescript-eslint/no-explicit-any": "off",
  "@typescript-eslint/no-unused-vars": "off",
  "@typescript-eslint/no-non-null-assertion": "off",
  "@typescript-eslint/ban-ts-comment": "off",
  "@typescript-eslint/prefer-as-const": "off",
  "@typescript-eslint/no-unused-disable-directive": "off",
  "@typescript-eslint/no-empty-object-type": "off",
  "@typescript-eslint/no-unsafe-function-type": "off",
  "@typescript-eslint/no-wrapper-object-types": "off",
  "@typescript-eslint/no-require-imports": "off",
};

/**
 * React and Next.js framework rule overrides.
 */
const frameworkRules = {
  "react-hooks/exhaustive-deps": "off",
  "react-hooks/purity": "off",
  "react-hooks/set-state-in-effect": "off",
  "react/no-unescaped-entities": "off",
  "react/display-name": "off",
  "react/prop-types": "off",
  "react-compiler/react-compiler": "off",
  "@next/next/no-img-element": "off",
  "@next/next/no-html-link-for-pages": "off",
};

/**
 * Core ECMAScript rule overrides.
 */
const coreRules = {
  "prefer-const": "off",
  "no-unused-vars": "off",
  "no-console": "off",
  "no-debugger": "off",
  "no-empty": "off",
  "no-irregular-whitespace": "off",
  "no-case-declarations": "off",
  "no-fallthrough": "off",
  "no-mixed-spaces-and-tabs": "off",
  "no-redeclare": "off",
  "no-undef": "off",
  "no-unreachable": "off",
  "no-useless-escape": "off",
};

const eslintConfig = [
  {
    ignores: IGNORED_PATHS,
  },
  {
    files: ["src/**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      ...typescriptRules,
      ...frameworkRules,
      ...coreRules,
    },
  },
];

export default eslintConfig;