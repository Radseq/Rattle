// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");
const prettierConfig = require('./prettier.config.cjs');

/** @type {import("eslint").Linter.Config} */
const config = {
  overrides: [
    {
      extends: [
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
      ],
      files: ["*.ts", "*.tsx"],
      parserOptions: {
        project: path.join(__dirname, "tsconfig.json"),
      },
    },
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: path.join(__dirname, "tsconfig.json"),
    ecmaFeatures: {
			jsx: true,
		},
		ecmaVersion: 2022,
		sourceType: 'module',
  },
  plugins: ["@typescript-eslint", "react", "tailwindcss", "react-hooks"],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended',
	'plugin:tailwindcss/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'next/core-web-vitals',
  ],
  rules: {
    "@typescript-eslint/consistent-type-imports": [
      "warn",
      {
        prefer: "type-imports",
        fixStyle: "inline-type-imports",
      },
    ],
    "@typescript-eslint/no-unused-vars": ["warn", {argsIgnorePattern: "^_"}],

    		// Possible errors
		'no-console': 'warn',
		// Best practices
		'dot-notation': 'error',
		'no-else-return': 'error',
		'no-floating-decimal': 'error',
		'no-sequences': 'error',
		// Stylistic
		'array-bracket-spacing': 'error',
		'computed-property-spacing': ['error', 'never'],
		curly: 'error',
		'no-lonely-if': 'error',
		'no-unneeded-ternary': 'error',
		'one-var-declaration-per-line': 'error',
		quotes: [
			'error',
			'double',
			{
				allowTemplateLiterals: false,
				avoidEscape: true,
			},
		],
		// ES6
		'array-callback-return': 'off',
		'prefer-const': 'error',
		// Imports
		'import/prefer-default-export': 'off',
		'sort-imports': [
			'error',
			{
				ignoreCase: true,
				ignoreDeclarationSort: true,
			},
		],
		'no-unused-expressions': 'off',
		'no-prototype-builtins': 'off',
		// REACT
		'react/jsx-uses-react': 'off',
		'react/react-in-jsx-scope': 'off',
		'jsx-a11y/href-no-hash': [0],
		'react/display-name': 0,
		'react/no-deprecated': 'error',
		'react/no-unsafe': [
			'error',
			{
				checkAliases: true,
			},
		],
		"react/jsx-sort-props": [
			2,
			{
				"callbacksLast": false,
				"ignoreCase": true,
				"noSortAlphabetically": true
			}
		],
		"react-hooks/rules-of-hooks": "error", // Checks rules of Hooks
		"react-hooks/exhaustive-deps": "warn", // Checks effect dependencies
		// Prettier
		// eslint looks for the prettier config at the top level of the package/app
		// but the config lives in the `config/` directory. Passing the config here
		// to get around this.
		'prettier/prettier': ['error', prettierConfig],
  },
};

module.exports = config;
