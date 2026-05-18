import type { UserConfig } from "@commitlint/types";

const Configuration: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  parserPreset: {
    name: "conventional-changelog-conventionalcommits",
    presetConfig: {
      types: [
        { type: "feat", section: "Features" },
        { type: "fix", section: "Bug Fixes" },
        { type: "docs", section: "Documentation" },
        { type: "style", section: "Styles" },
        { type: "refactor", section: "Code Refactoring" },
        { type: "perf", section: "Performance Improvements" },
        { type: "test", section: "Tests" },
        { type: "build", section: "Builds" },
        { type: "ci", section: "Continuous Integrations" },
        { type: "chore", section: "Chores" },
        { type: "revert", section: "Reverts" },
      ],
    },
  },
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "build",
        "chore",
        "ci",
        "docs",
        "feat",
        "fix",
        "perf",
        "refactor",
        "revert",
        "style",
        "test",
      ],
    ],
    "scope-empty": [2, "always"],
  },
};

export default Configuration;
