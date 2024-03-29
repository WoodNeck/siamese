/* eslint-disable @typescript-eslint/naming-convention */
module.exports = {
  "env": {
    "node": true
  },
  "extends": [
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "tsconfig.eslint.json",
    "sourceType": "module"
  },
  "plugins": [
    "eslint-plugin-import",
    "eslint-plugin-jsdoc",
    "eslint-plugin-prefer-arrow",
    "@typescript-eslint",
    "@typescript-eslint/tslint"
  ],
  "overrides": [
    {
      "files": [
        "src/**/*.{ts,tsx}"
      ],
      "extends": [
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "plugin:import/typescript"
      ],
      "rules": {
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unnecessary-type-assertion": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-return": "off",
        "@typescript-eslint/no-misused-promises": "off",
        "@typescript-eslint/adjacent-overload-signatures": "off",
        "@typescript-eslint/array-type": ["error", { "default": "array-simple" } ],
        "@typescript-eslint/consistent-type-assertions": "error",
        "@typescript-eslint/consistent-type-definitions": "error",
        "@typescript-eslint/dot-notation": "error",
        "@typescript-eslint/explicit-member-accessibility": ["error", { "accessibility": "explicit" } ],
        "@typescript-eslint/indent": [
          "error",
          2,
          {
            "FunctionDeclaration": {
              "parameters": "first"
            },
            "FunctionExpression": {
              "parameters": "first"
            },
            "SwitchCase": 1
          }
        ],
        "@typescript-eslint/member-delimiter-style": [
          "error",
          {
            "multiline": {
              "delimiter": "semi",
              "requireLast": true
            },
            "singleline": {
              "delimiter": "semi",
              "requireLast": false
            }
          }
        ],
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/member-ordering": ["error", {
          "default": [
            // Index signature
            "signature",

            // Static
            "public-static-method",
            "protected-static-method",
            "private-static-method",

            "public-static-field",
            "protected-static-field",
            "private-static-field",

            "public-abstract-field",
            "protected-abstract-field",
            "private-abstract-field",

            "public-instance-field",
            "protected-instance-field",
            "private-instance-field",

            "constructor",

            // Methods
            "public-abstract-method",
            "protected-abstract-method",
            "private-abstract-method",

            "public-instance-method",
            "protected-instance-method",
            "private-instance-method"
          ]
        }],
        "@typescript-eslint/require-await": "off",
        "@typescript-eslint/no-empty-function": "error",
        "@typescript-eslint/no-empty-interface": "warn",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-misused-new": "off",
        "@typescript-eslint/no-namespace": "error",
        "@typescript-eslint/no-parameter-properties": "off",
        "@typescript-eslint/no-unused-expressions": "off",
        "@typescript-eslint/no-use-before-define": "off",
        "@typescript-eslint/no-var-requires": "error",
        "@typescript-eslint/no-inferrable-types": "off",
        "@typescript-eslint/prefer-for-of": "error",
        "@typescript-eslint/prefer-function-type": "error",
        "@typescript-eslint/prefer-namespace-keyword": "error",
        "@typescript-eslint/restrict-template-expressions": "off",
        "@typescript-eslint/restrict-plus-operands": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/quotes": ["error", "double"],
        "@typescript-eslint/semi": ["error", "always"],
        "@typescript-eslint/triple-slash-reference": ["error", {
            "path": "always",
            "types": "prefer-import",
            "lib": "always"
          }
        ],
        "@typescript-eslint/type-annotation-spacing": "error",
        "@typescript-eslint/unified-signatures": "error",
        "@typescript-eslint/no-shadow": ["error"],
        "@typescript-eslint/tslint/config": [
          "error",
          {
            "rules": {
              "import-spacing": true,
              "whitespace": [
                true,
                "check-decl",
                "check-operator",
                "check-module",
                "check-separator",
                "check-rest-spread",
                "check-branch",
                "check-type-operator",
                "check-type",
                "check-typecast",
                "check-preblock"
              ]
            }
          }
        ]
      }
    }
  ],
  "rules": {
    "arrow-body-style": "off",
    "arrow-parens": [
      "off",
      "always"
    ],
    "brace-style": [
      "error",
      "1tbs",
      { "allowSingleLine": true }
    ],
    "comma-dangle": [
      "error",
      "never"
    ],
    "complexity": "off",
    "constructor-super": "error",
    "curly": "off",
    "eol-last": "error",
    "eqeqeq": [
      "error",
      "smart"
    ],
    "guard-for-in": "off",
    "id-blacklist": "off",
    "id-match": "off",
    "import/order": "off",
    "jsdoc/check-alignment": "error",
    "jsdoc/check-indentation": "error",
    "jsdoc/newline-after-description": "off",
    "max-classes-per-file": [
      "error",
      1
    ],
    "max-len": "off",
    "new-parens": "error",
    "no-bitwise": "off",
    "no-caller": "error",
    "no-cond-assign": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "no-debugger": "error",
    "no-empty": "error",
    "no-eval": "error",
    "no-fallthrough": "off",
    "no-invalid-this": "off",
    "no-multiple-empty-lines": "error",
    "no-new-wrappers": "error",
    "no-shadow": "off",
    "no-throw-literal": "error",
    "no-trailing-spaces": "error",
    "no-undef-init": "error",
    "no-underscore-dangle": "off",
    "no-unsafe-finally": "error",
    "no-unused-labels": "error",
    "no-var": "error",
    "object-shorthand": "off",
    "one-var": [
      "error",
      "never"
    ],
    "prefer-arrow/prefer-arrow-functions": "off",
    "prefer-const": "error",
    "quote-props": "off",
    "radix": "error",
    "space-before-function-paren": [
      "error",
      {
        "anonymous": "never",
        "asyncArrow": "always",
        "named": "never"
      }
    ],
    "spaced-comment": [
      "error",
      "always",
      {
        "markers": [
          "/"
        ]
      }
    ],
    "use-isnan": "error",
    "valid-typeof": "off",
    "lines-between-class-members": ["error", "always", { "exceptAfterSingleLine": true }],
    "import/order": ["error", {"newlines-between": "always"}]
  }
};
