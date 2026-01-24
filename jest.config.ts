import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  clearMocks: true,
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
};

export default config;
