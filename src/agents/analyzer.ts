import Anthropic from "@anthropic-ai/sdk";
import type { TestResult, BugReport } from "../types.js";
import { CONFIG } from "../config.js";

const client = new Anthropic();

export async function analyzeResults(results: TestResult[]): Promise<{
  analysis: string;
  bugs: BugReport[];
}> {
  if (results.length === 0) {
    return { analysis: "No test results to analyze.", bugs: [] };
  }

  const failed = results.filter((r) => r.status === "failed");
  const failedSummary =
    failed.length === 0
      ? "None — all tests passed."
      : failed
          .map((f) => `Test: ${f.title}\nError: ${f.error ?? "Unknown"}\nDuration: ${f.duration}ms`)
          .join("\n\n");

  const response = await client.messages.create({
    model: CONFIG.model,
    max_tokens: CONFIG.maxTokens.analyzer,
    output_config: {
      format: {
        type: "json_schema",
        schema: {
          type: "object",
          properties: {
            analysis: { type: "string" },
            bugs: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  severity: { type: "string", enum: ["critical", "major", "minor", "trivial"] },
                  stepsToReproduce: { type: "array", items: { type: "string" } },
                  expectedBehavior: { type: "string" },
                  actualBehavior: { type: "string" },
                  environment: { type: "string" },
                  jiraFormat: { type: "string" },
                  azureFormat: { type: "string" },
                },
                required: [
                  "title", "severity", "stepsToReproduce",
                  "expectedBehavior", "actualBehavior",
                  "environment", "jiraFormat", "azureFormat",
                ],
                additionalProperties: false,
              },
            },
          },
          required: ["analysis", "bugs"],
          additionalProperties: false,
        },
      },
    },
    messages: [
      {
        role: "user",
        content: `You are a QA lead reviewing automated test results.

RESULTS SUMMARY:
- Total:   ${results.length}
- Passed:  ${results.filter((r) => r.status === "passed").length}
- Failed:  ${failed.length}
- Skipped: ${results.filter((r) => r.status === "skipped").length}

FAILED TESTS:
${failedSummary}

Write a 2-3 paragraph QA analysis covering result patterns, root causes, and recommended actions.
Only file bugs for tests that actually failed. If nothing failed, return an empty bugs array.`,
      },
    ],
  });

  const block = response.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") {
    throw new Error("[Analyzer] No text block returned from API");
  }

  return JSON.parse(block.text) as { analysis: string; bugs: BugReport[] };
}
