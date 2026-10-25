const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  {
    ignores: [
      'node_modules/',
      'dist/',
      '.expo/',
      'playwright-report*/',
      'test-results*/',
      'demo-out/',
      'docs/',
      'ios/',
      'android/',
      'expo-env.d.ts',
    ],
  },
  ...expoConfig,
];
