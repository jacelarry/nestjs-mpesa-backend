module.exports = {
  testEnvironment: 'node',
  // Only run tests from compiled JS files in dist/mpesa/
  testMatch: ['**/dist/mpesa/**/*.spec.js'],
  testPathIgnorePatterns: [
    '/src/',
    '/__tests__/',
    '/mass_sms_backend/src/',
    '/dist/src/'
  ],
  moduleFileExtensions: ['js', 'json'],
};
