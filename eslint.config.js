import js from "@eslint/js";
import globals from "globals";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),
  // Base
  {
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 2022,  
      sourceType: "module",
    },
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
    ],
    rules: {
      "@typescript-eslint/naming-convention": ["warn", {
        selector: "import",
        format: ["camelCase", "PascalCase"],
      }],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "caughtErrorsIgnorePattern": "^_",
        }
      ],

      curly: ["warn", "multi-line"],
      eqeqeq: "warn",
      "no-throw-literal": "warn",
      semi: "warn",
    },
  },
  // Client
  {
    files: ["client/**/*.{ts,tsx}"],
    languageOptions: {
      globals: globals.browser,
    },
    extends: [
      reactHooks.configs.recommended,
      reactRefresh.configs.recommended,
    ],
  },
  // Server
  {
    files: ["server/**/*.ts"],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      "@typescript-eslint/no-var-requires": "off",
    },
  },
])
