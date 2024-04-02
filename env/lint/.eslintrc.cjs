/* eslint-env node */
module.exports = {
  env: {
    browser: true,
    es6: true
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    sourceType: "module",
    ecmaVersion: 2021
  },
  plugins: [
    "@typescript-eslint",
    "unused-imports",
    "@stylistic"
  ],
  extends: [
    "eslint:recommended",
    "plugin:import/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/eslint-recommended"
  ],
  settings: {
    react: {
      version: "detect"
    }
  },
  rules: {
    semi: ["error", "always"],
    "comma-dangle": ["error", "never"],
    quotes: ["error", "double"],
    "arrow-parens": ["error", "as-needed"],
    "no-unused-vars": "off",
    "unused-imports/no-unused-imports": "error",
    "unused-imports/no-unused-vars": [
      "warn",
      {
        vars: "all",
        varsIgnorePattern: "^_",
        args: "after-used",
        argsIgnorePattern: "^_"
      }
    ],
    "no-multiple-empty-lines": ["error", { "max": 1 }],
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/triple-slash-reference": "off",
    "@typescript-eslint/member-ordering": [
      "error",
      {
        "default": {
          "memberTypes": [
            // static
            "public-static-field",
            "protected-static-field",
            "private-static-field",
            // abstract
            "public-abstract-field",
            "protected-abstract-field",
            // field
            "public-field",
            "protected-field",
            "private-field",
            // get & set
            ["public-static-get", "public-static-set"],
            ["protected-static-get", "protected-static-set"],
            ["private-static-get", "private-static-set"],
            ["public-get", "public-set"],
            ["protected-get", "protected-set"],
            ["private-get", "private-set"],
            // constructor
            "constructor",
            // static
            "public-static-method",
            "protected-static-method",
            "private-static-method",
            // abstract
            "public-abstract-method",
            "protected-abstract-method",
            // method
            "public-method",
            "protected-method",
            "private-method"
          ]
        }
      }
    ],
    "import/named": "off",
    "import/no-named-as-default-member": "off",
    "import/no-unresolved": "off",
    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
          "object",
          "type"
        ],
        "newlines-between": "always",
        alphabetize: {
          order: "asc",
          caseInsensitive: false
        }
      }
    ]
  }
};
