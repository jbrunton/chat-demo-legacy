/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  globalSetup: "<rootDir>/test/setup.ts",
  moduleNameMapper: {
    "^@domain/(.*)$": ["<rootDir>/src/domain/$1"],
    "^@pages/(.*)$": ["<rootDir>/src/pages/$1"],
    "^@app/(.*)$": ["<rootDir>/src/app/$1"],
    "^@data/(.*)$": ["<rootDir>/src/data/$1"],
    "^@util/(.*)$": ["<rootDir>/src/util/$1"],
    "^@fixtures/(.*)$": ["<rootDir>/src/fixtures/$1"],
  },
  transform: {
    "^.+\\.[tj]s$": [
      "ts-jest",
      {
        tsconfig: {
          allowJs: true,
        },
      },
    ],
  },
  transformIgnorePatterns: ["<rootDir>/node_modules/(?!lowdb|steno)"],
};
