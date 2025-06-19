/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^lucide-react$': '<rootDir>/__mocks__/lucide-react.js',
    '^react-dnd$': '<rootDir>/__mocks__/react-dnd.js',
    '^react-dnd-html5-backend$': '<rootDir>/__mocks__/react-dnd-html5-backend.js'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  transform: {
    '^.+\\.(ts|tsx)$': ['babel-jest', { configFile: './babel-jest.config.js' }]
  }
};