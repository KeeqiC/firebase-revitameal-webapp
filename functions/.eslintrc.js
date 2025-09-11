module.exports = {
  root: true,
  env: {
    node: true,
    commonjs: true,
    es2021: true,
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    // matikan aturan 'no-undef' yang bikin require/module bermasalah
    "no-undef": "off",
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
  },
};
