import Anthropic from "@anthropic-ai/sdk";
import type { TestPlan, UserStory } from "../types.js";
import { CONFIG } from "../config.js";
import fs from "fs";

const client = new Anthropic();

const MOCK_SPEC = `import { test, expect } from "@playwright/test";

const BASE_URL = "https://demo.playwright.dev/todomvc";

test("[TC-001] Add a new todo item", async ({ page }) => {
  await page.goto(BASE_URL);
  await page.waitForLoadState("networkidle");
  await page.getByPlaceholder("What needs to be done?").fill("Buy groceries");
  await page.getByPlaceholder("What needs to be done?").press("Enter");
  await expect(page.getByTestId("todo-item")).toHaveCount(1);
  await expect(page.getByTestId("todo-item")).toContainText("Buy groceries");
  await expect(page.getByText("1 item left")).toBeVisible();
});

test("[TC-002] Mark a todo as complete", async ({ page }) => {
  await page.goto(BASE_URL);
  await page.waitForLoadState("networkidle");
  await page.getByPlaceholder("What needs to be done?").fill("Read a book");
  await page.getByPlaceholder("What needs to be done?").press("Enter");
  await page.getByRole("checkbox", { name: "Toggle Todo" }).click();
  await expect(page.getByTestId("todo-item")).toHaveClass(/completed/);
  await expect(page.getByText("0 items left")).toBeVisible();
});

test("[TC-003] Delete a todo item", async ({ page }) => {
  await page.goto(BASE_URL);
  await page.waitForLoadState("networkidle");
  await page.getByPlaceholder("What needs to be done?").fill("Write tests");
  await page.getByPlaceholder("What needs to be done?").press("Enter");
  const item = page.getByTestId("todo-item").filter({ hasText: "Write tests" });
  await item.hover();
  await item.getByRole("button", { name: "Delete" }).click();
  await expect(page.getByTestId("todo-item")).toHaveCount(0);
});

test("[TC-004] Todo count updates after each action", async ({ page }) => {
  await page.goto(BASE_URL);
  await page.waitForLoadState("networkidle");
  const input = page.getByPlaceholder("What needs to be done?");
  for (const t of ["Task A", "Task B", "Task C"]) {
    await input.fill(t);
    await input.press("Enter");
  }
  await expect(page.getByText("3 items left")).toBeVisible();
  await page.getByRole("checkbox", { name: "Toggle Todo" }).first().click();
  await expect(page.getByText("2 items left")).toBeVisible();
  const itemB = page.getByTestId("todo-item").filter({ hasText: "Task B" });
  await itemB.hover();
  await itemB.getByRole("button", { name: "Delete" }).click();
  await expect(page.getByText("1 item left")).toBeVisible();
});

test("[TC-005] Add todo with maximum length input", async ({ page }) => {
  await page.goto(BASE_URL);
  await page.waitForLoadState("networkidle");
  const longText = "A".repeat(200);
  await page.getByPlaceholder("What needs to be done?").fill(longText);
  await page.getByPlaceholder("What needs to be done?").press("Enter");
  await expect(page.getByTestId("todo-item")).toHaveCount(1);
});

test.skip("[TC-006] Submit empty todo — no item created", async ({ page }) => {
  await page.goto(BASE_URL);
  await page.waitForLoadState("networkidle");
  await page.getByPlaceholder("What needs to be done?").click();
  await page.getByPlaceholder("What needs to be done?").press("Enter");
  await expect(page.getByTestId("todo-item")).toHaveCount(0);
});
`;

export async function generatePlaywrightTests(
  plan: TestPlan,
  story: UserStory
): Promise<string> {
  if (CONFIG.mockMode) {
    fs.mkdirSync(CONFIG.testsDir, { recursive: true });
    fs.writeFileSync(CONFIG.generatedSpecFile, MOCK_SPEC);
    console.log(`   [MOCK] Playwright spec written to ${CONFIG.generatedSpecFile}`);
    return MOCK_SPEC;
  }

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
