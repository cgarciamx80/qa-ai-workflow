export const CONFIG = {
  model: "claude-opus-4-6",
  demoBaseUrl: "https://demo.playwright.dev/todomvc",
  outputDir: "output",
  testsDir: "tests",
  generatedSpecFile: "tests/generated.spec.ts",
  maxTokens: {
    planner: 2000,
    codeGen: 4000,
    analyzer: 3000,
  },
} as const;
