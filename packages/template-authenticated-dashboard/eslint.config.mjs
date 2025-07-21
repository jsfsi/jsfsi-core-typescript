import reactRefresh from 'eslint-plugin-react-refresh';

import rootConfig from '../../eslint.config.mjs';

export default [
  {
    ignores: ['dist/**/*'],
  },
  ...rootConfig,
  {
    languageOptions: {
      globals: {
        document: 'readonly',
        window: 'readonly',
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      'react-refresh': reactRefresh,
    },
    rules: {
      'react-refresh/only-export-components': ['off'],
    },
  },
];
