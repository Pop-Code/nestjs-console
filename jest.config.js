// jest.config.js
module.exports = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    //rootDir: 'src',
    testRegex: '.spec.ts$',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest'
    },
    collectCoverageFrom: [
        'src/**/*.{js,jsx,ts}',
        '!src/index.ts',
        '!**/src/test/**'
    ],
    coverageDirectory: '../coverage'
};
