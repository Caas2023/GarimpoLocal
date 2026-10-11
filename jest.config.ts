import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: './tsconfig.test.json',
    }],
  },
  moduleNameMapper: {
    // alias Next.js
    '^@/(.*)$': '<rootDir>/src/$1',
    // ignorar assets estáticos
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.ts',
  },
  testMatch: ['**/__tests__/**/*.test.ts?(x)', '**/*.test.ts?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverageFrom: [
    'src/lib/**/*.ts',
    'src/db/schema.ts',
    '!src/**/*.d.ts',
  ],
};

export default config;
