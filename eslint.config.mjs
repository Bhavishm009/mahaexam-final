import nextPlugin from "@next/eslint-plugin-next";
import reactHooksPlugin from "eslint-plugin-react-hooks";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "build/**",
      "coverage/**",
      "public/**",
      "prisma/migrations/**",
      "scripts/**",
    ],
  },
  {
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "react-hooks": reactHooksPlugin,
    },
  },
  nextPlugin.configs["core-web-vitals"],
  {
    rules: {
      "no-console": "off",
      "no-unused-vars": "off",
      eqeqeq: "off",
      curly: "off",
      "no-var": "warn",
      "prefer-const": "off",
      "no-duplicate-imports": "off",
      "no-undef": "off",
      "@next/next/no-img-element": "warn",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];

export default eslintConfig;
