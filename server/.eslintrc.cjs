module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
    jest: true
  },
  extends: ['eslint:recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  ignorePatterns: ['node_modules', 'coverage', 'prisma/generated']
};
