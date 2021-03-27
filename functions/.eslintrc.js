module.exports = {
  'root': true,
  'env': {
    'es6': true,
    'node': true,
  },
  'extends': [
    'eslint:recommended',
  ],
  'rules': {
    'quotes': ['error', 'single'],
    'object-curly-spacing': ['error', 'always'],
    'curly': [0],
    'new-cap': [0],
    'no-trailing-spaces': [0],
    'semi': ['warn', 'always']
  },
};
