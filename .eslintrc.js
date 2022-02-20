module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    env: {
        browser: true
    },
    rules: {
        'no-use-before-define': 'off',
        '@typescript-eslint/no-use-before-define': ['error']
    },
    extends: [
        'scratch',
        'scratch/es6',
        'scratch/node'
    ]
};
