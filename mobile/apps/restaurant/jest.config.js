/**
 * Jest Configuration for Restaurant App
 * 
 * Configures test environment, coverage thresholds, and module resolution
 * for the Okinawa Restaurant management application.
 * 
 * @module jest.config
 */

module.exports = {
  // Use jest-expo preset for React Native + Expo compatibility
  preset: 'jest-expo',
  
  // Node environment for faster test execution
  testEnvironment: 'node',
  
  // Test root directory
  roots: ['<rootDir>/src'],
  
  // Test file patterns to match
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  
  // File extensions to process
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // TypeScript transformation
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  
  // Module path aliases matching tsconfig
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/shared/(.*)$': '<rootDir>/../../shared/$1',
  },
  
  // Setup files to run after Jest is initialized
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  
  // Coverage collection patterns
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
  ],
  
  // Coverage thresholds - must maintain at least 70%
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
  // Paths to ignore during testing
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  
  // Enable verbose output for debugging
  verbose: true,
};
