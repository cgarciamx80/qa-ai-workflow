import "dotenv/config";
import fs from "fs";
import type { UserStory, PipelineResult } from "./types.js";
import { CONFIG } from "./config.js";
import { generateTestPlan } from "./agents/planner.js";
import { generatePlaywrightTests } from "./agents/codeGen.js";
import { runTests } from "./runner/playwrightRunner.js";
import { analyzeResults } from "./agents/analyzer.js";

async function runPipeline(story: UserStory): Promise<PipelineResult> {
  if (!process.env["ANTHROPIC_API_KEY"]) {
    throw new Error("ANTHROPIC_API_KEY is not set. Create a .env file from .env.example.");
  }

  fs.mkdirSync(CONFIG.outputDir, { recursive: true });

  console.log("\n🧠 Stage 1: Generating test plan...");
  const plan = await generateTestPlan(story);
  fs.writeFileSync(`${CONFIG.outputDir}/test-plan.json`, JSON.stringify(plan, null, 2));
  console.log(`   ✅ ${plan.testCases.length} test cases generated`);

  console.log("\n✍️  Stage 2: Generating Playwright code...");
  await generatePlaywrightTests(plan, story);

  console.log("\n🎭 Stage 3: Running Playwright tests...");
  const results = await runTests();
  fs.writeFileSync(`${CONFIG.outputDir}/results.json`, JSON.stringify(results, null, 2));
  console.log(`   ✅ ${results.length} tests executed`);

  console.log("\n🔍 Stage 4: Analyzing results + filing bugs...");
  const { analysis, bugs } = await analyzeResults(results);

  const pipelineResult: PipelineResult = { story, plan, results, analysis, bugs };
  fs.writeFileSync(
    `${CONFIG.outputDir}/pipeline-result.json`,
    JSON.stringify(pipelineResult, null, 2)
  );

  console.log("\n📋 Pipeline complete!");
  console.log(`   Passed:     ${results.filter((r) => r.status === "passed").length}`);
  console.log(`   Failed:     ${results.filter((r) => r.status === "failed").length}`);
  console.log(`   Skipped:    ${results.filter((r) => r.status === "skipped").length}`);
  console.log(`   Bugs filed: ${bugs.length}`);
  console.log(`\n📁 Output: ${CONFIG.outputDir}/pipeline-result.json`);

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

runPipeline(exampleStory).catch((err: unknown) => {
  console.error("\n❌ Pipeline failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
