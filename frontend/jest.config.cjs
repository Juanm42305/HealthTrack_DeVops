module.exports = {
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  testEnvironment: 'node', // Usamos 'node' por ahora como dice la guía
  projects: [
    { displayName: 'unit', testMatch: ['**/tests/unit/**/*.test.js'] },
    { displayName: 'integration', testMatch: ['**/tests/integration/**/*.test.js'] }
  ]
};