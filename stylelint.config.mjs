/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard-scss'],
  rules: {
    // Support block__element--modifier names used throughout the interface.
    'selector-class-pattern': [
      '^[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:__[a-z0-9]+(?:-[a-z0-9]+)*)?(?:--[a-z0-9]+(?:-[a-z0-9]+)*)?$',
      { resolveNestedSelectors: true },
    ],
    // Existing helpers use both camelCase and kebab-case variables.
    'scss/dollar-variable-pattern': '^[a-z][a-zA-Z0-9]*(?:-[a-zA-Z0-9]+)*$',
  },
};