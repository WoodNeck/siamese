/* eslint-disable @typescript-eslint/naming-convention */
module.exports = {
  "env": {
    "node": true
  },
  "extends": [
    "../eslintrc.js"
  ],
  "overrides": [
    {
      "files": [
        "src/**/*.{ts,tsx}"
      ],
      "rules": {
        "@typescript-eslint/ban-ts-comment": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unsafe-member-access": "off"
      }
    }
  ],
  "rules": {

  }
};
