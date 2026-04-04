import "dotenv/config";
import fs from "fs";
import type { UserStory, PipelineResult } from "./types.js";
import { CONFIG } from "./config.js";
import { generateTestPlan } from "./agents/planner.js";
import { generatePlaywrightTests } from "./agents/codeGen.js";
import { runTests } from "./runner/playwrightRunner.js";
import { analyzeResults } from "./agents/analyzer.js";
import { MOCK_TEST_RESULTS } from "./mocks/mockData.js";
import { generateMarkdownReport } from "./report/markdownReport.js";

async function runPipeline(story: UserStory): Promise<PipelineResult> {
  if (!CONFIG.mockMode && !process.env["ANTHROPIC_API_KEY"]) {
    throw new Error("ANTHROPIC_API_KEY is not set. Create a .env file from .env.example.");
  }

  if (CONFIG.mockMode) {
    console.log("   ⚠️  Running in MOCK MODE — no API calls will be made");
  }

  fs.mkdirSync(CONFIG.outputDir, { recursive: true });

  console.log("\n🧠 Stage 1: Generating test plan...");
  const plan = await generateTestPlan(story);
  fs.writeFileSync(`${CONFIG.outputDir}/test-plan.json`, JSON.stringify(plan, null, 2));
  console.log(`   ✅ ${plan.testCases.length} test cases generated`);

  console.log("\n✍️  Stage 2: Generating Playwright code...");
  await generatePlaywrightTests(plan, story);

  console.log("\n🎭 Stage 3: Running Playwright tests...");
  const results = CONFIG.mockMode ? MOCK_TEST_RESULTS : await runTests();
  if (CONFIG.mockMode) {
    console.log("   [MOCK] Returning hardcoded test results");
  }
  fs.writeFileSync(`${CONFIG.outputDir}/results.json`, JSON.stringify(results, null, 2));
  console.log(`   ✅ ${results.length} tests executed`);

  console.log("\n🔍 Stage 4: Analyzing results + filing bugs...");
  const { analysis, bugs } = await analyzeResults(results);

  const pipelineResult: PipelineResult = { story, plan, results, analysis, bugs };
  fs.writeFileSync(
    `${CONFIG.outputDir}/pipeline-result.json`,
    JSON.stringify(pipelineResult, null, 2)
  );
  fs.writeFileSync(`${CONFIG.outputDir}/REPORT.md`, generateMarkdownReport(pipelineResult));

  console.log("\n📋 Pipeline complete!");
  console.log(`   Passed:     ${results.filter((r) => r.status === "passed").length}`);
  console.log(`   Failed:     ${results.filter((r) => r.status === "failed").length}`);
  console.log(`   Skipped:    ${results.filter((r) => r.status === "skipped").length}`);
  console.log(`   Bugs filed: ${bugs.length}`);
  console.log(`   📁 Output: ${CONFIG.outputDir}/pipeline-result.json`);
  console.log(`   📄 Report: ${CONFIG.outputDir}/REPORT.md`);

  return pipelineResult;
}

const exampleStory: UserStory = {
  title: "Todo list management",
  description: "As a user, I can add, complete, and delete todos so I can track my tasks.",
  acceptanceCriteria: [
    "User can add a new todo by typing and pressing Enter",
    "User can mark a todo as complete by clicking the checkbox",
    "User can delete a todo with the delete button",
    "Completed todos show with a strikethrough",
    "Todo count updates correctly after each action",
  ],
};

function loadStory(): UserStory {
  const storyFlagIndex = process.argv.indexOf("--story");
  if (storyFlagIndex === -1) {
    return exampleStory;
  }

  const storyPath = process.argv[storyFlagIndex + 1];
  if (!storyPath || storyPath.startsWith("--")) {
    throw new Error("--story requires a file path, e.g. --story ./input/story.json");
  }

  if (!fs.existsSync(storyPath)) {
    throw new Error(`Story file not found: ${storyPath}`);
  }

  const raw = fs.readFileSync(storyPath, "utf-8");
  const parsed = JSON.parse(raw) as UserStory;

  if (!parsed.title || !parsed.description || !Array.isArray(parsed.acceptanceCriteria)) {
    throw new Error(`Invalid story file — must have: title, description, acceptanceCriteria[]`);
  }

  console.log(`   📖 Loaded story from ${storyPath}: "${parsed.title}"`);
  return parsed;
}

runPipeline(loadStory()).catch((err: unknown) => {
  console.error("\n❌ Pipeline failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
