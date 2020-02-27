module.exports = {
  parserOptions: {
    ecmaVersion: 2019,
  },
  extends: ['standard', 'plugin:prettier/recommended', 'plugin:react/recommended'],
  plugins: ['prettier'],
  rules: {
    'jsx-a11y/accessible-emoji': 'off', // Prefer to add aria-hidden instead
    'prettier/prettier': 'error'
  },
};