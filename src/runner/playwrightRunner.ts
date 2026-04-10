import { spawnSync } from "child_process";
import fs from "fs";
import type { TestResult } from "../types.js";
import { CONFIG } from "../config.js";

export async function runTests(): Promise<TestResult[]> {
  console.log(`   Running tests against ${CONFIG.demoBaseUrl} ...`);

  fs.mkdirSync(CONFIG.outputDir, { recursive: true });

  const result = spawnSync(
    "npx",
    ["playwright", "test", CONFIG.generatedSpecFile],
    { encoding: "utf-8", shell: true }
  );

  if (result.error) {
    throw new Error(`[Runner] Failed to spawn Playwright: ${result.error.message}`);
  }

  const resultsPath = `${CONFIG.outputDir}/results.json`;
  if (!fs.existsSync(resultsPath)) {
    console.warn("   ⚠️  No results.json found — Playwright may not have run correctly.");
    return [];
  }

  const json = JSON.parse(fs.readFileSync(resultsPath, "utf-8")) as {
    suites?: Array<{
      specs?: Array<{
        title: string;
        tests?: Array<{
          results?: Array<{
            status: string;
            duration: number;
            error?: { message: string };
          }>;
        }>;
      }>;
    }>;
  };

  const results: TestResult[] = [];

  for (const suite of json.suites ?? []) {
    for (const spec of suite.specs ?? []) {
      for (const test of spec.tests ?? []) {
        const run = test.results?.[0];
        const status = run?.status === "passed"
          ? "passed"
          : run?.status === "skipped"
          ? "skipped"
          : "failed";

        results.push({
          testId: spec.title.match(/TC-\d+/)?.[0] ?? "TC-???",
          title: spec.title,
          status,
          duration: run?.duration ?? 0,
          error: run?.error?.message,
        });
      }
    }
  }

  return results;
}
