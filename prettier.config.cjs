/** @type {import("prettier").Config} */
const config = {
  plugins: [require.resolve("prettier-plugin-tailwindcss")],
  singleQuote: false,
  tabWidth: 4,
  useTabs: true,
  semi: false,
  printWidth: 140
};

module.exports = config;
