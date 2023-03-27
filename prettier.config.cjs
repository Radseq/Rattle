/** @type {import("prettier").Config} */
const config = {
  plugins: [require.resolve("prettier-plugin-tailwindcss")],
  singleQuote: false,
  tabWidth: 4,
  useTabs: true,
  semi: false
};

module.exports = config;
