module.exports = {
  preset: 'ts-jest',
  automock: false,
  modulePathIgnorePatterns: [
    "<rootDir>/dist/"
  ],
  setupFiles: [
    './src/test-setup.ts'
  ]
}
