module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',   // lets Jest resolve "@/lib/…" paths
  },
};
