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
  {
    files: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}'],
    ignores: ['lib/design/**'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/^#[0-9a-fA-F]{3,8}$/]',
          message: 'Use a design token instead of a hex color literal.',
        },
        {
          selector: "JSXAttribute[name.name='className'] Literal[value=/font-(?:semibold|medium|bold|extrabold)/]",
          message: 'Use a type-role token instead of a font-weight utility.',
        },
        {
          selector: "JSXAttribute[name.name='className'] Literal[value=/\\-\\[/]",
          message: 'Use a design token instead of an arbitrary Tailwind value.',
        },
        {
          selector: "JSXAttribute[name.name='className'] JSXExpressionContainer TemplateLiteral TemplateElement[value.raw=/\\-\\[/]",
          message: 'Use a design token instead of an arbitrary Tailwind value.',
        },
        {
          selector: "ImportDeclaration[source.value='react-native'] ImportSpecifier[imported.name='Animated']",
          message: 'Import Animated from react-native-reanimated.',
        },
        {
          selector: "MemberExpression[object.name='Alert'][property.name='alert']",
          message: 'Use useFeedback instead of Alert.alert.',
        },
        {
          selector: "CallExpression[callee.name='confirm']",
          message: 'Use useFeedback instead of confirm().',
        },
      ],
    },
  },
];
