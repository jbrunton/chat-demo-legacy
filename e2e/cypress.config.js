const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: "7v7kfm",
  e2e: {
    defaultCommandTimeout: 10000,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
