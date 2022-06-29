/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@domain/(.*)$": ["<rootDir>/src/domain/$1"],
    "^@app/(.*)$": ["<rootDir>/src/app/$1"],
  },
};
