import Anthropic from "@anthropic-ai/sdk";
import type { TestPlan, UserStory } from "../types.js";
import { CONFIG } from "../config.js";
import fs from "fs";

const client = new Anthropic();

export async function generatePlaywrightTests(
  plan: TestPlan,
  story: UserStory
): Promise<string> {
  const testCaseSummary = plan.testCases
    .map(
      (tc) =>
        `ID: ${tc.id}\nTitle: ${tc.title}\nSteps: ${tc.steps.join(" → ")}\nExpected: ${tc.expectedResult}`
    )
    .join("\n\n");

  const response = await client.messages.create({
    model: CONFIG.model,
    max_tokens: CONFIG.maxTokens.codeGen,
    messages: [
      {
        role: "user",
        content: `You are a Playwright automation expert. Generate a complete Playwright test file.

Feature: ${story.title}
Base URL: ${CONFIG.demoBaseUrl}

TEST CASES:
${testCaseSummary}

Rules:
- Use @playwright/test with TypeScript
- Import { test, expect } from "@playwright/test"
- Each test case becomes one test()
- Use page.goto("${CONFIG.demoBaseUrl}") at the start of each test
- Use semantic selectors: getByRole, getByLabel, getByPlaceholder
- Add page.waitForLoadState("networkidle") after navigation
- Keep tests independent — no shared state between tests
- Include the test case ID in the test name, e.g. "[TC-001] Add a new todo"

Return ONLY the raw TypeScript code. No markdown, no explanation.`,
      },
    ],
  });

  const block = response.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") {
    throw new Error("[CodeGen] No text block returned from API");
  }

  const code = block.text.replace(/^```(?:typescript|ts)?\n?/m, "").replace(/```$/m, "").trim();

  fs.mkdirSync(CONFIG.testsDir, { recursive: true });
  fs.writeFileSync(CONFIG.generatedSpecFile, code);
  console.log(`   ✅ Playwright spec written to ${CONFIG.generatedSpecFile}`);

  return code;
}
