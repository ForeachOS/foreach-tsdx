import fs from 'fs';
import { paths } from './constants';

export function createJestConfig(
  _: (relativePath: string) => void,
  rootDir: string
) {
  const setupTestsFile = fs.existsSync(paths.testsSetup)
    ? `<rootDir>/src/setupTests.ts`
    : undefined;

  const config = {
    transform: {
      '.(ts|tsx)': require.resolve('ts-jest/dist'),
    },
    moduleNameMapper: {
      '^.+\\.css$': require.resolve('identity-obj-proxy'),
      '^.+\\.scss$': require.resolve('identity-obj-proxy'),
    },
    setupFilesAfterEnv: setupTestsFile ? [setupTestsFile] : [],
    transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    collectCoverageFrom: ['src/**/*.{ts,tsx}'],
    testMatch: ['<rootDir>/**/*.(spec|test).{ts,tsx}'],
    testURL: 'http://localhost',
    rootDir,
    watchPlugins: [
      require.resolve('jest-watch-typeahead/filename'),
      require.resolve('jest-watch-typeahead/testname'),
    ],
  };

  return config;
}
