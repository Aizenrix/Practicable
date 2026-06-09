module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true
  },
  extends: ["eslint:recommended", "prettier"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "script"
  },
  ignorePatterns: ["node_modules/", ".venv-docs/", "УП03_*/"],
  overrides: [
    {
      files: ["public/**/*.js"],
      env: {
        browser: true,
        node: false
      },
      globals: {
        localStorage: "readonly"
      }
    },
    {
      files: ["test/**/*.js"],
      env: {
        node: true
      }
    }
  ],
  rules: {
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }]
  }
};
