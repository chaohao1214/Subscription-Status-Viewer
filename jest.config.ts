import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  clearMocks: true,
  testEnvironment: "jsdom",
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "amplify/functions/**/*.ts",
    "!**/*.d.ts",
    "!**/node_modules/**",
  ],
  testMatch: [
    "**/__tests__/**/*.(test|spec).ts?(x)",
    "**/*.(test|spec).ts?(x)",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  transformIgnorePatterns: [
    "node_modules/(?!(aws-sdk-client-mock|@aws-sdk|sinon)/)",
  ],
  globals: {
    "ts-jest": {
      tsconfig: {
        jsx: "react-jsx",
        resolveJsonModule: true,
      },
    },
  },
};

export default config;
