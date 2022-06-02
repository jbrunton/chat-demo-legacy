/** @type {import('@types/semantic-release').Options} */
const options = {
  branches: ["develop"],
  
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        releaseRules: [
          { type: "breaking", release: "major" },
          { type: "feat", release: "minor" },
          { type: "perf", release: "minor" },
          { type: "build", release: "patch" },
          { type: "chore", release: "patch" },
          { type: "fix", release: "patch" },
          { type: "refactor", release: "patch" },
          { type: "ci", release: false },
          { type: "docs", release: false },
          { type: "style", release: false },
          { type: "test", release: false },
        ],
      },
    ],
    "@semantic-release/release-notes-generator",
    ["@semantic-release/npm", {
      publish: false,
    }],
    ["@semantic-release/github", {
      successComment: false,
      releasedLabels: false,
    }],
    [
      "@semantic-release-plus/docker",
      {
        name: "jbrunton/chat-demo-app"
      }
    ],
    [
      "@semantic-release/git",
      {
        assets: [
          "package.json",
          "package-lock.json",
        ],
        message: "chore(release): release ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
      }
    ],
    ["@semantic-release/exec", {
      successCmd: 'echo "::set-output name=VERSION::${nextRelease.version}"'
    }],
  ],
};

module.exports = options;
